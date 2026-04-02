import { BaseProvider } from './base-provider.js';
import type { VideoBackgroundConfig } from '../types.js';

declare global {
  interface Window {
    Vimeo: { Player: new (element: HTMLIFrameElement, options?: object) => VimeoPlayerInstance };
  }
}

interface VimeoPlayerInstance {
  on(event: string, callback: (data?: unknown) => void): void;
  off(event: string): void;
  play(): Promise<void>;
  pause(): Promise<void>;
  setMuted(muted: boolean): Promise<void>;
  setVolume(volume: number): Promise<void>;
  setCurrentTime(seconds: number): Promise<void>;
  setLoop(loop: boolean): Promise<void>;
  getDuration(): Promise<number>;
  getCurrentTime(): Promise<number>;
  getVolume(): Promise<number>;
  loadVideo(id: string | number, options?: object): Promise<object>;
  unload(): Promise<void>;
  destroy(): Promise<void>;
}

let vimeoApiPromise: Promise<void> | null = null;

function loadVimeoAPI(): Promise<void> {
  if (vimeoApiPromise) return vimeoApiPromise;

  vimeoApiPromise = new Promise((resolve, reject) => {
    if (window.Vimeo?.Player) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://player.vimeo.com/api/player.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Vimeo player API'));
    document.head.appendChild(script);
  });

  return vimeoApiPromise;
}

export class VimeoProvider extends BaseProvider {
  private iframe: HTMLIFrameElement | null = null;
  declare player: VimeoPlayerInstance | null;

  constructor(config: VideoBackgroundConfig, container: HTMLElement, hostElement: HTMLElement) {
    super(config, container, hostElement);
    this.player = null;
  }

  async init(): Promise<void> {
    await loadVimeoAPI();

    const iframe = document.createElement('iframe');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
    iframe.setAttribute('title', 'Background video');
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('tabindex', '-1');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.src = this.generateSrcURL();

    this.stylePlayerElement(iframe);
    this.container.appendChild(iframe);
    this.iframe = iframe;
    this.playerElement = iframe;

    this.player = new window.Vimeo.Player(iframe);

    this.player.on('loaded', () => this.onVideoPlayerReady());
    this.player.on('ended', () => this.onVimeoEnded());
    this.player.on('play', () => this.onVideoPlay());
    this.player.on('pause', () => this.onVideoPause());
    this.player.on('bufferstart', () => { this.currentState = 'buffering'; });
    this.player.on('timeupdate', (data) => this.onVideoTimeUpdate(data as { seconds: number; duration: number }));
  }

  private generateSrcURL(): string {
    const id = this.config['video-id'];
    const params = new URLSearchParams({
      background: '1',
      controls: '0',
      autopause: '0',
    });

    if (this.config.muted) params.set('muted', '1');
    if (this.config.autoplay) params.set('autoplay', '1');
    if (this.config.loop) params.set('loop', '1');
    if (this.config['no-cookie']) params.set('dnt', '1');
    if (this.config['start-at']) params.set('t', String(this.config['start-at']));

    const unlisted = this.config['unlisted-hash'];
    if (unlisted) params.set('h', unlisted);

    return `https://player.vimeo.com/video/${id}?${params.toString()}`;
  }

  private async onVideoPlayerReady(): Promise<void> {
    this.mobileLowBatteryAutoplayHack();
    this.resize();
    if (this.config['start-at']) await this.seekTo(this.config['start-at']);
    if (this.config.autoplay && (this.config['always-play'] || this.isIntersecting)) {
      await this.player!.play().catch(() => { /* blocked */ });
    }
    const duration = await this.player!.getDuration();
    this.setDuration(duration);
    this.dispatchEvent('vb-ready');
  }

  private onVideoTimeUpdate(data: { seconds: number; duration: number }): void {
    this.currentTime = data.seconds;
    if (!this.duration && data.duration) this.setDuration(data.duration);
    this.percentComplete = this.timeToPercentage(data.seconds);

    const endAt = this.config['end-at'];
    if (endAt && data.seconds >= endAt) {
      this.onVimeoEnded();
      return;
    }

    this.dispatchEvent('vb-timeupdate');
  }

  private async onVideoPlay(): Promise<void> {
    this.currentState = 'playing';
    if (!this.initialPlay) {
      this.initialPlay = true;
      if (this.iframe) this.iframe.style.opacity = '1';
    }

    await this.player!.setLoop(this.config.loop);

    const startAt = this.config['start-at'];
    const endAt = this.config['end-at'];
    if (startAt && this.currentTime < startAt) await this.player!.setCurrentTime(startAt);
    if (endAt && this.currentTime >= endAt) { this.onVimeoEnded(); return; }

    this.dispatchEvent('vb-play');
  }

  private onVideoPause(): void {
    this.currentState = 'paused';
    this.dispatchEvent('vb-pause');
  }

  private onVimeoEnded(): void {
    this.currentState = 'ended';
    this.onVideoEnded();
  }

  // ===== Playback methods =====

  play(): void { this.paused = false; this.player?.play(); }
  pause(): void { this.paused = true; this.player?.pause(); }
  softPlay(): void { if (!this.paused) this.player?.play(); }
  softPause(): void { if (!this.paused) this.player?.pause(); }

  mute(): void {
    this.muted = true;
    this.player?.setMuted(true);
    this.dispatchEvent('vb-mute');
  }

  unmute(): void {
    this.muted = false;
    this.player?.setMuted(false);
    this.dispatchEvent('vb-unmute');
  }

  seek(percentage: number): void { this.seekTo(this.percentageToTime(percentage)); }

  async seekTo(seconds: number): Promise<void> {
    if (!this.player) return;
    await this.player.setCurrentTime(seconds);
  }

  setVolume(volume: number): void {
    this.volume = volume;
    this.player?.setVolume(volume);
  }

  async getVolume(): Promise<number> {
    if (!this.player) return this.volume;
    return this.player.getVolume();
  }

  setSource(url: string): void {
    // url here should be a Vimeo video ID (or full URL — handled by caller)
    this.config['video-id'] = url;
    if (this.iframe) this.iframe.src = this.generateSrcURL();
  }

  destroy(): void {
    this.player?.destroy();
    this.player = null;
    this.iframe = null;
    this.playerElement = null;
  }
}
