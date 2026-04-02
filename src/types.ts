export type ProviderType = 'youtube' | 'vimeo' | 'html5';

export type VideoState = 'notstarted' | 'ended' | 'playing' | 'paused' | 'buffering' | 'cued';

export interface ParsedVideoData {
  id: string;
  type: ProviderType;
  link: string;
  unlisted?: string;
}

export interface VideoBackgroundConfig {
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

export const DEFAULT_CONFIG: VideoBackgroundConfig = {
  src: '',
  autoplay: true,
  muted: true,
  loop: true,
  mobile: true,
  volume: 1,
  'start-at': 0,
  'end-at': 0,
  'play-button': false,
  'mute-button': false,
  'seek-bar': false,
  poster: null,
  'aspect-ratio': '16/9',
  'no-cookie': true,
  'fit-box': false,
  lazy: false,
  'always-play': false,
  'force-on-low-battery': false,
  title: 'Video background',
  'video-id': '',
  'unlisted-hash': '',
};
