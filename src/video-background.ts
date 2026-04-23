import type { VideoBackgroundConfig, ProviderType } from './types.js';
import { DEFAULT_CONFIG } from './types.js';
import { parseVideoUrl } from './utils/url-parser.js';
import { isMobile } from './utils/device.js';
import { styles } from './styles.js';
import { BaseProvider } from './providers/base-provider.js';
import { YouTubeProvider } from './providers/youtube-provider.js';
import { VimeoProvider } from './providers/vimeo-provider.js';
import { HTML5Provider } from './providers/html5-provider.js';
import { createPlayButton } from './controls/play-button.js';
import { createMuteButton } from './controls/mute-button.js';
import { createSeekBar } from './controls/seek-bar.js';

const OBSERVED_ATTRS = [
  'src', 'autoplay', 'muted', 'loop', 'mobile', 'volume',
  'start-at', 'end-at', 'play-button', 'mute-button', 'seek-bar',
  'poster', 'aspect-ratio', 'no-cookie', 'fit-box', 'lazy',
  'always-play', 'force-on-low-battery', 'title',
] as const;

export class VideoBackgroundElement extends HTMLElement {
  static get observedAttributes(): string[] { return [...OBSERVED_ATTRS]; }

  private shadow: ShadowRoot;
  private wrapper: HTMLDivElement;
  private playerContainer: HTMLDivElement;
  private posterEl: HTMLDivElement;
  private controlsEl: HTMLDivElement;
  private overlaySlot: HTMLSlotElement;

  private provider: BaseProvider | null = null;
  private config: VideoBackgroundConfig = { ...DEFAULT_CONFIG };

  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private initialized = false;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });

    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    this.shadow.appendChild(styleEl);

    this.wrapper = document.createElement('div');
    this.wrapper.className = 'vb-wrapper';

    this.playerContainer = document.createElement('div');
    this.playerContainer.className = 'vb-player';

    this.posterEl = document.createElement('div');
    this.posterEl.className = 'vb-poster';
    this.posterEl.setAttribute('aria-hidden', 'true');

    this.controlsEl = document.createElement('div');
    this.controlsEl.className = 'vb-controls';
    this.controlsEl.setAttribute('aria-label', 'Video controls');

    const overlayWrapper = document.createElement('div');
    overlayWrapper.className = 'vb-overlay';
    this.overlaySlot = document.createElement('slot');
    overlayWrapper.appendChild(this.overlaySlot);

    this.wrapper.appendChild(this.playerContainer);
    this.wrapper.appendChild(this.posterEl);
    this.wrapper.appendChild(this.controlsEl);
    this.wrapper.appendChild(overlayWrapper);
    this.shadow.appendChild(this.wrapper);
  }

  connectedCallback(): void {
    this.readAttributes();
    this.initProvider();
  }

  disconnectedCallback(): void {
    this.destroy();
  }

  attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null): void {
    if (oldVal === newVal) return;

    if (name === 'src' && this.initialized) {
      this.destroy();
      this.readAttributes();
      this.initProvider();
      return;
    }

    if (name === 'volume' && newVal !== null) {
      const vol = parseFloat(newVal);
      if (!isNaN(vol)) this.provider?.setVolume(Math.max(0, Math.min(1, vol)));
    }

    if (name === 'muted') {
      const muted = newVal !== null && newVal !== 'false';
      if (muted) this.provider?.mute(); else this.provider?.unmute();
    }

    if (name === 'play-button' || name === 'mute-button' || name === 'seek-bar') {
      if (this.provider) {
        this.config[name as 'play-button' | 'mute-button' | 'seek-bar'] = newVal !== null && newVal !== 'false';
        this.buildControls();
      }
    }

    if (name === 'poster') {
      this.config.poster = newVal;
      this.setPoster();
    }
  }

  // ===== Attribute → config parsing =====

  private readAttributes(): void {
    const get = (k: string): string | null => this.getAttribute(k);
    const bool = (k: string, def: boolean): boolean => {
      const v = get(k);
      if (v === null) return def;
      return v !== 'false';
    };
    const num = (k: string, def: number): number => {
      const v = get(k);
      return v !== null && !isNaN(parseFloat(v)) ? parseFloat(v) : def;
    };

    const src = get('src') ?? '';
    const parsed = parseVideoUrl(src);

    this.config = {
      ...DEFAULT_CONFIG,
      src,
      autoplay: bool('autoplay', DEFAULT_CONFIG.autoplay),
      muted: bool('muted', DEFAULT_CONFIG.muted),
      loop: bool('loop', DEFAULT_CONFIG.loop),
      mobile: bool('mobile', DEFAULT_CONFIG.mobile),
      volume: num('volume', DEFAULT_CONFIG.volume),
      'start-at': num('start-at', DEFAULT_CONFIG['start-at']),
      'end-at': num('end-at', DEFAULT_CONFIG['end-at']),
      'play-button': bool('play-button', DEFAULT_CONFIG['play-button']),
      'mute-button': bool('mute-button', DEFAULT_CONFIG['mute-button']),
      'seek-bar': bool('seek-bar', DEFAULT_CONFIG['seek-bar']),
      poster: get('poster'),
      'aspect-ratio': get('aspect-ratio') ?? DEFAULT_CONFIG['aspect-ratio'],
      'no-cookie': bool('no-cookie', DEFAULT_CONFIG['no-cookie']),
      'fit-box': bool('fit-box', DEFAULT_CONFIG['fit-box']),
      lazy: bool('lazy', DEFAULT_CONFIG.lazy),
      'always-play': bool('always-play', DEFAULT_CONFIG['always-play']),
      'force-on-low-battery': bool('force-on-low-battery', DEFAULT_CONFIG['force-on-low-battery']),
      title: get('title') ?? DEFAULT_CONFIG.title,
      'video-id': parsed?.id ?? '',
      'unlisted-hash': parsed?.unlisted ?? '',
    };

    // Mobile browsers require muted audio for autoplay.
    if (this.config.autoplay && isMobile()) {
      this.config.muted = true;
    }
  }

  private initProvider(): void {
    const src = this.config.src;
    if (!src) return;

    if (!this.config.mobile && isMobile()) {
      this.showPosterOnly();
      return;
    }

    const parsed = parseVideoUrl(src);
    if (!parsed) return;

    const providerType: ProviderType = parsed.type;
    this.setPoster();

    let provider: BaseProvider;
    if (providerType === 'youtube') {
      provider = new YouTubeProvider(this.config, this.playerContainer, this);
    } else if (providerType === 'vimeo') {
      provider = new VimeoProvider(this.config, this.playerContainer, this);
    } else {
      provider = new HTML5Provider(this.config, this.playerContainer, this);
    }

    this.provider = provider;
    this.initialized = true;

    const doInit = (): void => {
      const result = provider.init();
      if (result instanceof Promise) {
        result.catch((err) => console.error('[video-background] Provider init error:', err));
      }
      this.buildControls();
      this.setupObservers();
    };

    if (this.config.lazy && 'IntersectionObserver' in window) {
      // Defer init until element enters viewport
      const lazyObserver = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting) {
          lazyObserver.disconnect();
          doInit();
        }
      }, { threshold: 0 });
      lazyObserver.observe(this);
    } else {
      doInit();
    }
  }

  private setPoster(): void {
    let posterUrl = this.config.poster;

    if (!posterUrl) {
      const parsed = parseVideoUrl(this.config.src);
      if (parsed?.type === 'youtube' && parsed.id) {
        posterUrl = `https://img.youtube.com/vi/${parsed.id}/hqdefault.jpg`;
      } else if (parsed?.type === 'vimeo' && parsed.id) {
        const hash = parsed.unlisted ? `/${parsed.unlisted}` : '';
        posterUrl = `https://vumbnail.com/${parsed.id}${hash}.jpg`;
      }
    }

    this.posterEl.style.backgroundImage = posterUrl ? `url(${posterUrl})` : '';
  }

  private showPosterOnly(): void {
    this.posterEl.style.opacity = '1';
  }

  private buildControls(): void {
    this.controlsEl.innerHTML = '';
    if (!this.provider) return;

    if (this.config['play-button']) {
      this.controlsEl.appendChild(createPlayButton(this.provider, this));
    }
    if (this.config['mute-button']) {
      this.controlsEl.appendChild(createMuteButton(this.provider, this));
    }
    if (this.config['seek-bar']) {
      this.controlsEl.appendChild(createSeekBar(this.provider, this));
    }
  }

  private setupObservers(): void {
    if (!this.config['always-play'] && 'IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry || !this.provider) return;
          this.provider.isIntersecting = entry.isIntersecting;
          if (entry.isIntersecting) {
            this.provider.softPlay();
          } else {
            this.provider.softPause();
          }
        },
        { threshold: 0 }
      );
      this.intersectionObserver.observe(this);
    } else if (this.provider) {
      this.provider.isIntersecting = true;
    }

    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => this.provider?.resize());
      this.resizeObserver.observe(this);
    }

    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  private onVisibilityChange = (): void => {
    if (!this.provider) return;
    if (document.hidden) {
      this.provider.softPause();
    } else if (this.provider.isIntersecting || this.config['always-play']) {
      this.provider.softPlay();
    }
  };

  private destroy(): void {
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.provider?.destroy();
    this.provider = null;
    this.playerContainer.innerHTML = '';
    this.controlsEl.innerHTML = '';
    this.initialized = false;
  }

  // ===== Public API =====

  play(): void { this.provider?.play(); }
  pause(): void { this.provider?.pause(); }
  mute(): void { this.provider?.mute(); }
  unmute(): void { this.provider?.unmute(); }
  seek(percentage: number): void { this.provider?.seek(percentage); }
  seekTo(seconds: number): void { this.provider?.seekTo(seconds); }
  setVolume(vol: number): void { this.provider?.setVolume(vol); }

  get currentTime(): number { return this.provider?.currentTime ?? 0; }
  get duration(): number { return this.provider?.duration ?? 0; }
  get percentComplete(): number { return this.provider?.percentComplete ?? 0; }
  get paused(): boolean { return this.provider?.paused ?? true; }
  get activeProvider(): BaseProvider | null { return this.provider; }

  get src(): string { return this.getAttribute('src') ?? ''; }
  set src(val: string) { this.setAttribute('src', val); }
  get volume(): number { return parseFloat(this.getAttribute('volume') ?? '1'); }
  set volume(val: number) { this.setAttribute('volume', String(val)); }
  get poster(): string | null { return this.getAttribute('poster'); }
  set poster(val: string | null) {
    if (val === null) this.removeAttribute('poster');
    else this.setAttribute('poster', val);
  }
}
