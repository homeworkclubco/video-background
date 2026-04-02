import { BaseProvider } from './base-provider.js';
import type { VideoBackgroundConfig, VideoState } from '../types.js';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const YT_STATES: Record<number, VideoState> = {
  [-1]: 'notstarted',
  [0]: 'ended',
  [1]: 'playing',
  [2]: 'paused',
  [3]: 'buffering',
  [5]: 'cued',
};

let ytApiPromise: Promise<void> | null = null;

function loadYouTubeAPI(): Promise<void> {
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    if (window.YT?.Player) { resolve(); return; }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { if (prev) prev(); resolve(); };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(script);
  });
  return ytApiPromise;
}

export class YouTubeProvider extends BaseProvider {
  private iframe: HTMLIFrameElement | null = null;
  private timeUpdateTimer: ReturnType<typeof setInterval> | null = null;
  /** True only after the YT.Player onReady event fires */
  private playerReady = false;

  constructor(config: VideoBackgroundConfig, container: HTMLElement, hostElement: HTMLElement) {
    super(config, container, hostElement);
  }

  async init(): Promise<void> {
    await loadYouTubeAPI();

    // Pre-build the iframe with a full embed src URL, then pass the element reference
    // to YT.Player. Passing a DOM element (not a string ID) is critical for Shadow DOM
    // because document.getElementById() cannot see inside a shadow root.
    const iframe = document.createElement('iframe');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allow', 'autoplay; mute');
    iframe.setAttribute('tabindex', '-1');
    iframe.setAttribute('aria-hidden', 'true');
    if (this.config.title) iframe.setAttribute('title', this.config.title);
    iframe.src = this.buildSrcURL();
    iframe.style.position = 'absolute';

    this.container.appendChild(iframe);
    this.iframe = iframe;
    this.playerElement = iframe;

    // Pass the element reference — YT.Player wraps the existing iframe.
    // We omit videoId/playerVars since the src URL already encodes them.
    this.player = new window.YT.Player(iframe, {
      events: {
        onReady: () => this.onVideoPlayerReady(),
        onStateChange: (e: { data: number }) => this.onVideoStateChange(e.data),
      },
    });
  }

  private buildSrcURL(): string {
    const id = this.config['video-id'];
    const base = this.config['no-cookie']
      ? 'https://www.youtube-nocookie.com/embed/'
      : 'https://www.youtube.com/embed/';

    const params = new URLSearchParams({
      enablejsapi: '1',
      disablekb: '1',
      controls: '0',
      rel: '0',
      iv_load_policy: '3',
      cc_load_policy: '0',
      playsinline: '1',
      showinfo: '0',
      modestbranding: '1',
      fs: '0',
    });

    if (this.config.muted) params.set('mute', '1');
    if (this.config.autoplay) params.set('autoplay', '1');
    if (this.config.loop) { params.set('loop', '1'); params.set('playlist', id); }

    return `${base}${id}?${params.toString()}`;
  }

  private onVideoPlayerReady(): void {
    this.playerReady = true;
    this.resize();
    this.mobileLowBatteryAutoplayHack();
    // Explicit API-driven autoplay as a fallback for browsers that block iframe autoplay
    if (this.config.autoplay && (this.config['always-play'] || this.isIntersecting)) {
      if (this.config['start-at']) this.player.seekTo(this.config['start-at'], true);
      this.player.playVideo();
    }
    this.setDuration(this.player.getDuration());
    this.dispatchEvent('vb-ready');
  }

  private startTimeUpdateTimer(): void {
    if (this.timeUpdateTimer) return;
    this.timeUpdateTimer = setInterval(() => this.onVideoTimeUpdate(), 250);
  }

  private stopTimeUpdateTimer(): void {
    if (this.timeUpdateTimer) { clearInterval(this.timeUpdateTimer); this.timeUpdateTimer = null; }
  }

  private onVideoStateChange(stateCode: number): void {
    const state = YT_STATES[stateCode] ?? 'notstarted';
    this.currentState = state;

    // 'notstarted' (-1) fires when the iframe loads but hasn't played yet.
    // Drive playback via API to handle browsers that block src-level autoplay.
    if (state === 'notstarted' && this.config.autoplay) {
      if (this.config['start-at']) this.player.seekTo(this.config['start-at'], true);
      this.player.playVideo();
    }

    if (state === 'ended') { this.stopTimeUpdateTimer(); this.onVideoEnded(); }
    else if (state === 'playing') { this.onVideoPlay(); }
    else if (state === 'paused') { this.onVideoPause(); }
  }

  private onVideoPlay(): void {
    if (!this.initialPlay) {
      this.initialPlay = true;
      if (this.iframe) this.iframe.style.opacity = '1';
    }
    const startAt = this.config['start-at'];
    if (startAt && this.player.getCurrentTime() < startAt) this.player.seekTo(startAt, true);
    if (this.duration && this.player.getCurrentTime() >= this.duration) this.player.seekTo(startAt || 0, true);
    if (!this.duration) this.setDuration(this.player.getDuration());
    this.startTimeUpdateTimer();
    this.dispatchEvent('vb-play');
  }

  private onVideoPause(): void {
    this.stopTimeUpdateTimer();
    this.dispatchEvent('vb-pause');
  }

  private onVideoTimeUpdate(): void {
    const time = this.player.getCurrentTime();
    if (time === this.currentTime) return;
    this.currentTime = time;
    this.percentComplete = this.timeToPercentage(time);
    const endAt = this.config['end-at'];
    if (endAt && this.duration && time >= this.duration) { this.onVideoEnded(); return; }
    this.dispatchEvent('vb-timeupdate');
  }

  // ===== Playback methods =====

  play(): void { this.paused = false; if (this.playerReady) this.player?.playVideo(); }
  pause(): void { this.paused = true; this.stopTimeUpdateTimer(); if (this.playerReady) this.player?.pauseVideo(); }
  softPlay(): void { if (!this.player || this.currentState === 'playing') return; if (this.playerReady) this.player.playVideo(); }
  softPause(): void { if (!this.player || this.currentState === 'paused') return; this.stopTimeUpdateTimer(); if (this.playerReady) this.player.pauseVideo(); }
  mute(): void { this.muted = true; if (this.playerReady) this.player?.mute(); this.dispatchEvent('vb-mute'); }
  unmute(): void {
    this.muted = false;
    if (this.playerReady) {
      if (!this.initialVolume) { this.initialVolume = true; this.setVolume(this.config.volume); }
      this.player?.unMute();
    }
    this.dispatchEvent('vb-unmute');
  }
  seek(percentage: number): void { this.seekTo(this.percentageToTime(percentage)); }
  seekTo(seconds: number): void { if (this.playerReady) this.player?.seekTo(seconds, true); this.dispatchEvent('vb-seeked'); }
  setVolume(volume: number): void { this.volume = volume; if (this.playerReady) this.player?.setVolume(volume * 100); }
  getVolume(): number { return (this.playerReady && this.player) ? this.player.getVolume() / 100 : this.volume; }

  setSource(url: string): void {
    this.config['video-id'] = url;
    if (this.playerReady) this.player?.loadVideoById({ videoId: url });
  }

  destroy(): void {
    this.stopTimeUpdateTimer();
    this.playerReady = false;
    this.player?.destroy();
    this.player = null;
    this.iframe = null;
    this.playerElement = null;
  }
}
