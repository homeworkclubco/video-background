declare abstract class BaseProvider {
    protected config: VideoBackgroundConfig;
    protected container: HTMLElement;
    protected hostElement: HTMLElement;
    playerElement: HTMLElement | null;
    player: any;
    paused: boolean;
    muted: boolean;
    currentState: VideoState;
    currentTime: number;
    duration: number;
    percentComplete: number;
    volume: number;
    isIntersecting: boolean;
    isMobile: boolean;
    protected initialPlay: boolean;
    protected initialVolume: boolean;
    constructor(config: VideoBackgroundConfig, container: HTMLElement, hostElement: HTMLElement);
    timeToPercentage(time: number): number;
    percentageToTime(pct: number): number;
    setDuration(duration: number): void;
    setStartAt(startAt: number): void;
    setEndAt(endAt: number): void;
    shouldPlay(): boolean;
    dispatchEvent(name: string): void;
    stylePlayerElement(element: HTMLElement): void;
    /**
     * Proportional cover resize: scales the player to cover the container
     * while maintaining the video's aspect ratio.
     */
    resize(): void;
    mobileLowBatteryAutoplayHack(): void;
    protected onVideoEnded(): void;
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

export declare interface ParsedVideoData {
    id: string;
    type: ProviderType;
    link: string;
    unlisted?: string;
}

export declare type ProviderType = 'youtube' | 'vimeo' | 'html5';

export declare interface VideoBackgroundConfig {
    src: string;
    autoplay: boolean;
    muted: boolean;
    loop: boolean;
    mobile: boolean;
    volume: number;
    'start-at': number;
    'end-at': number;
    'play-button': boolean;
    'mute-button': boolean;
    'seek-bar': boolean;
    poster: string | null;
    'aspect-ratio': string;
    'no-cookie': boolean;
    'fit-box': boolean;
    lazy: boolean;
    'always-play': boolean;
    'force-on-low-battery': boolean;
    title: string;
    'video-id': string;
    'unlisted-hash': string;
}

export declare class VideoBackgroundElement extends HTMLElement {
    static get observedAttributes(): string[];
    private shadow;
    private wrapper;
    private playerContainer;
    private posterEl;
    private controlsEl;
    private overlaySlot;
    private provider;
    private config;
    private resizeObserver;
    private intersectionObserver;
    private initialized;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null): void;
    private readAttributes;
    private initProvider;
    private setPoster;
    private showPosterOnly;
    private buildControls;
    private setupObservers;
    private onVisibilityChange;
    private destroy;
    play(): void;
    pause(): void;
    mute(): void;
    unmute(): void;
    seek(percentage: number): void;
    seekTo(seconds: number): void;
    setVolume(vol: number): void;
    get currentTime(): number;
    get duration(): number;
    get percentComplete(): number;
    get paused(): boolean;
    get activeProvider(): BaseProvider | null;
    get src(): string;
    set src(val: string);
    get volume(): number;
    set volume(val: number);
}

export declare type VideoState = 'notstarted' | 'ended' | 'playing' | 'paused' | 'buffering' | 'cued';

export { }
