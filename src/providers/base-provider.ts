import type { VideoBackgroundConfig, VideoState } from '../types.js';
import { isMobile } from '../utils/device.js';

export abstract class BaseProvider {
  protected config: VideoBackgroundConfig;
  protected container: HTMLElement;
  protected hostElement: HTMLElement;

  playerElement: HTMLElement | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  player: any = null;

  paused: boolean = false;
  muted: boolean;
  currentState: VideoState = 'notstarted';
  currentTime: number;
  duration: number = 0;
  percentComplete: number = 0;
  volume: number;
  isIntersecting: boolean = false;
  isMobile: boolean;

  protected initialPlay: boolean = false;
  protected initialVolume: boolean = false;

  constructor(config: VideoBackgroundConfig, container: HTMLElement, hostElement: HTMLElement) {
    this.config = config;
    this.container = container;
    this.hostElement = hostElement;

    this.muted = config.muted;
    this.volume = config.volume;
    this.currentTime = config['start-at'] || 0;
    this.isMobile = isMobile();

    if (config['start-at']) {
      this.percentComplete = this.timeToPercentage(config['start-at']);
    }
  }

  // ===== Time math =====

  timeToPercentage(time: number): number {
    const startAt = this.config['start-at'];
    if (time <= startAt) return 0;
    if (this.duration && time >= this.duration) return 100;
    if (time <= 0) return 0;
    const normalizedTime = time - startAt;
    const normalizedDuration = this.duration - startAt;
    if (!normalizedDuration) return 0;
    return Math.round((normalizedTime / normalizedDuration) * 1000) / 10;
  }

  percentageToTime(pct: number): number {
    const startAt = this.config['start-at'];
    if (!this.duration) return startAt || 0;
    if (pct > 100) return this.duration;
    if (pct <= 0) return startAt || 0;
    const normalizedDuration = this.duration - startAt;
    let time = (pct * normalizedDuration) / 100;
    time = Math.round(time * 1000) / 1000;
    if (time > normalizedDuration) time = normalizedDuration;
    if (startAt) time += startAt;
    return time;
  }

  // ===== Duration management =====

  setDuration(duration: number): void {
    if (this.duration === duration) return;
    const endAt = this.config['end-at'];
    if (endAt) {
      if (duration > endAt) { this.duration = endAt; return; }
      if (duration < endAt) { this.duration = duration; return; }
    } else {
      this.duration = duration;
      return;
    }
    if (duration <= 0) this.duration = endAt;
  }

  setStartAt(startAt: number): void {
    this.config['start-at'] = startAt;
  }

  setEndAt(endAt: number): void {
    this.config['end-at'] = endAt;
    if (this.duration > endAt) this.duration = endAt;
    if (this.currentTime > endAt) this.onVideoEnded();
  }

  // ===== Playback state =====

  shouldPlay(): boolean {
    if (this.currentState === 'ended' && !this.config.loop) return false;
    if (this.config['always-play'] && this.currentState !== 'playing') return true;
    if (this.isIntersecting && this.config.autoplay && this.currentState !== 'playing') return true;
    return false;
  }

  // ===== Event dispatching =====

  dispatchEvent(name: string): void {
    this.hostElement.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: this }));
  }

  // ===== Styling =====

  stylePlayerElement(element: HTMLElement): void {
    if (!element) return;
    // Inline position is needed so resize() can set width/height for cover scaling.
    // Opacity and centering transform are handled by CSS inside .vb-player.
    element.style.position = 'absolute';
  }

  /**
   * Proportional cover resize: scales the player to cover the container
   * while maintaining the video's aspect ratio.
   */
  resize(): void {
    const element = this.playerElement;
    if (!element || this.config['fit-box']) return;

    const parent = this.container;
    const parentWidth = parent.offsetWidth;
    const parentHeight = parent.offsetHeight;

    if (!parentWidth || !parentHeight) return;

    // Parse aspect ratio: supports "16/9", "16:9", "1.777"
    const ratioStr = this.config['aspect-ratio'];
    let ratio: number;
    if (ratioStr.includes('/')) {
      const [w, h] = ratioStr.split('/').map(Number);
      ratio = w / h;
    } else if (ratioStr.includes(':')) {
      const [w, h] = ratioStr.split(':').map(Number);
      ratio = w / h;
    } else {
      ratio = parseFloat(ratioStr);
    }

    if (!ratio || isNaN(ratio)) ratio = 16 / 9;

    const parentRatio = parentWidth / parentHeight;
    let width: number;
    let height: number;

    // Add offset to hide YouTube info bar overflow
    const offset = 100;

    if (parentRatio < ratio) {
      height = parentHeight + offset;
      width = height * ratio;
    } else {
      width = parentWidth + offset;
      height = width / ratio;
    }

    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
  }

  // ===== Mobile low battery hack =====

  mobileLowBatteryAutoplayHack(): void {
    if (!this.config['force-on-low-battery']) return;
    if (!this.isMobile || !this.config.mobile) return;

    const forceAutoplay = (): void => {
      if (!this.initialPlay && this.config.autoplay && this.config.muted) {
        this.softPlay();
        if (!this.isIntersecting && !this.config['always-play']) {
          this.softPause();
        }
      }
    };

    document.addEventListener('touchstart', forceAutoplay, { once: true });
  }

  // ===== Video event handlers (shared logic) =====

  protected onVideoEnded(): void {
    this.dispatchEvent('vb-ended');
    if (!this.config.loop) {
      this.pause();
      return;
    }
    this.seekTo(this.config['start-at']);
  }

  // ===== Abstract methods — must be implemented by subclasses =====

  abstract init(): Promise<void> | void;
  abstract play(): void;
  abstract pause(): void;
  abstract softPlay(): void;
  abstract softPause(): void;
  abstract mute(): void;
  abstract unmute(): void;
  abstract seek(percentage: number): void;
  abstract seekTo(seconds: number): void;
  abstract setVolume(volume: number): void;
  abstract getVolume(): number | Promise<number> | undefined;
  abstract setSource(url: string): void;
  abstract destroy(): void;
}
