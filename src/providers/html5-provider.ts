import { BaseProvider } from './base-provider.js';
import type { VideoBackgroundConfig } from '../types.js';

const MIME_MAP: Record<string, string> = {
  mp4: 'video/mp4',
  webm: 'video/webm',
  ogv: 'video/ogg',
  ogg: 'video/ogg',
  mov: 'video/mp4',
  m4v: 'video/mp4',
  avi: 'video/mp4',
  qt: 'video/mp4',
};

function getMimeType(url: string): string {
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase() ?? '';
  return MIME_MAP[ext] ?? 'video/mp4';
}

export class HTML5Provider extends BaseProvider {
  private video: HTMLVideoElement | null = null;

  constructor(config: VideoBackgroundConfig, container: HTMLElement, hostElement: HTMLElement) {
    super(config, container, hostElement);
  }

  init(): void {
    const video = document.createElement('video');
    video.setAttribute('playsinline', '');
    video.setAttribute('tabindex', '-1');
    video.setAttribute('aria-hidden', 'true');
    video.muted = this.config.muted;
    video.loop = this.config.loop;
    video.autoplay = this.config.autoplay;
    video.volume = this.config.volume;

    this.stylePlayerElement(video);
    this.appendSource(video, this.config.src);

    this.container.appendChild(video);
    this.video = video;
    this.playerElement = video;

    video.addEventListener('loadedmetadata', () => this.onLoadedMetadata());
    video.addEventListener('durationchange', () => this.onDurationChange());
    video.addEventListener('canplay', () => this.onCanPlay());
    video.addEventListener('timeupdate', () => this.onVideoTimeUpdate());
    video.addEventListener('play', () => this.onVideoPlay());
    video.addEventListener('pause', () => this.onVideoPause());
    video.addEventListener('waiting', () => { this.currentState = 'buffering'; });
    video.addEventListener('ended', () => { this.currentState = 'ended'; this.onVideoEnded(); });
  }

  private appendSource(video: HTMLVideoElement, src: string): void {
    const source = document.createElement('source');
    source.src = src;
    source.type = getMimeType(src);
    video.appendChild(source);
  }

  private onLoadedMetadata(): void {
    if (this.video) this.setDuration(this.video.duration);
  }

  private onDurationChange(): void {
    if (this.video) this.setDuration(this.video.duration);
  }

  private onCanPlay(): void {
    if (!this.initialPlay && this.config.autoplay) {
      const p = this.video?.play();
      if (p) p.catch(() => { /* autoplay blocked — user interaction needed */ });
    }
    this.dispatchEvent('vb-ready');
  }

  private onVideoTimeUpdate(): void {
    if (!this.video) return;
    this.currentTime = this.video.currentTime;
    this.percentComplete = this.timeToPercentage(this.video.currentTime);

    const endAt = this.config['end-at'];
    if (endAt && this.video.currentTime >= endAt) {
      this.onVideoEnded();
      return;
    }

    this.dispatchEvent('vb-timeupdate');
  }

  private onVideoPlay(): void {
    this.currentState = 'playing';
    if (!this.initialPlay) {
      this.initialPlay = true;
      if (this.video) this.video.style.opacity = '1';
    }

    const startAt = this.config['start-at'];
    if (startAt && this.video && this.video.currentTime < startAt) {
      this.video.currentTime = startAt;
    }

    this.dispatchEvent('vb-play');
  }

  private onVideoPause(): void {
    this.currentState = 'paused';
    this.dispatchEvent('vb-pause');
  }

  // ===== Playback methods =====

  play(): void { this.paused = false; this.video?.play(); }
  pause(): void { this.paused = true; this.video?.pause(); }
  softPlay(): void { if (!this.paused) this.video?.play(); }
  softPause(): void { if (!this.paused) this.video?.pause(); }

  mute(): void {
    this.muted = true;
    if (this.video) this.video.muted = true;
    this.dispatchEvent('vb-mute');
  }

  unmute(): void {
    this.muted = false;
    if (this.video) this.video.muted = false;
    this.dispatchEvent('vb-unmute');
  }

  seek(percentage: number): void { this.seekTo(this.percentageToTime(percentage)); }

  seekTo(seconds: number): void {
    if (!this.video) return;
    if ('fastSeek' in this.video) {
      (this.video as HTMLVideoElement & { fastSeek(t: number): void }).fastSeek(seconds);
    } else {
      (this.video as HTMLVideoElement).currentTime = seconds;
    }
  }

  setVolume(volume: number): void {
    this.volume = volume;
    if (this.video) this.video.volume = volume;
  }

  getVolume(): number {
    return this.video ? this.video.volume : this.volume;
  }

  setSource(url: string): void {
    if (!this.video) return;
    this.config.src = url;
    this.video.innerHTML = '';
    this.appendSource(this.video, url);
    this.video.load();
  }

  destroy(): void {
    if (this.video) {
      this.video.pause();
      this.video.src = '';
      this.video.innerHTML = '';
    }
    this.video = null;
    this.playerElement = null;
    this.player = null;
  }
}
