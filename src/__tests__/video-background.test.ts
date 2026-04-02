import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import { DEFAULT_CONFIG } from '../types.js';
import { VideoBackgroundElement } from '../video-background.js';

vi.mock('../utils/device.js', () => ({
  isMobile: vi.fn(() => false),
}));

import { isMobile } from '../utils/device.js';

const YOUTUBE_SRC = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
const VIMEO_SRC = 'https://vimeo.com/123456789';
const VIMEO_UNLISTED_SRC = 'https://vimeo.com/123456789?h=abc123';
const HTML5_SRC = 'https://example.com/video.mp4';
const TAG = 'video-background';

beforeAll(() => {
  if (!customElements.get(TAG)) {
    customElements.define(TAG, VideoBackgroundElement);
  }
});

afterEach(() => {
  document.body.innerHTML = '';
  vi.mocked(isMobile).mockReturnValue(false);
});

function mount(attrs: Record<string, string> = {}): VideoBackgroundElement {
  const el = document.createElement(TAG) as VideoBackgroundElement;
  for (const [key, val] of Object.entries(attrs)) {
    el.setAttribute(key, val);
  }
  document.body.appendChild(el);
  return el;
}

// ─── DEFAULT_CONFIG ───────────────────────────────────────────────────────────

describe('DEFAULT_CONFIG', () => {
  it('src defaults to empty string', () => expect(DEFAULT_CONFIG.src).toBe(''));
  it('autoplay defaults to true', () => expect(DEFAULT_CONFIG.autoplay).toBe(true));
  it('muted defaults to true', () => expect(DEFAULT_CONFIG.muted).toBe(true));
  it('loop defaults to true', () => expect(DEFAULT_CONFIG.loop).toBe(true));
  it('mobile defaults to true', () => expect(DEFAULT_CONFIG.mobile).toBe(true));
  it('volume defaults to 1', () => expect(DEFAULT_CONFIG.volume).toBe(1));
  it('start-at defaults to 0', () => expect(DEFAULT_CONFIG['start-at']).toBe(0));
  it('end-at defaults to 0', () => expect(DEFAULT_CONFIG['end-at']).toBe(0));
  it('play-button defaults to false', () => expect(DEFAULT_CONFIG['play-button']).toBe(false));
  it('mute-button defaults to false', () => expect(DEFAULT_CONFIG['mute-button']).toBe(false));
  it('seek-bar defaults to false', () => expect(DEFAULT_CONFIG['seek-bar']).toBe(false));
  it('poster defaults to null', () => expect(DEFAULT_CONFIG.poster).toBeNull());
  it('aspect-ratio defaults to 16/9', () => expect(DEFAULT_CONFIG['aspect-ratio']).toBe('16/9'));
  it('no-cookie defaults to true', () => expect(DEFAULT_CONFIG['no-cookie']).toBe(true));
  it('fit-box defaults to false', () => expect(DEFAULT_CONFIG['fit-box']).toBe(false));
  it('lazy defaults to false', () => expect(DEFAULT_CONFIG.lazy).toBe(false));
  it('always-play defaults to false', () => expect(DEFAULT_CONFIG['always-play']).toBe(false));
  it('force-on-low-battery defaults to false', () => expect(DEFAULT_CONFIG['force-on-low-battery']).toBe(false));
  it('title defaults to "Video background"', () => expect(DEFAULT_CONFIG.title).toBe('Video background'));
  it('video-id defaults to empty string', () => expect(DEFAULT_CONFIG['video-id']).toBe(''));
  it('unlisted-hash defaults to empty string', () => expect(DEFAULT_CONFIG['unlisted-hash']).toBe(''));
});

// ─── VideoBackgroundElement ───────────────────────────────────────────────────

describe('VideoBackgroundElement', () => {
  describe('src', () => {
    it('no src → no provider', () => {
      const el = mount();
      expect(el.activeProvider).toBeNull();
    });

    it('YouTube src → provider created', () => {
      expect(mount({ src: YOUTUBE_SRC }).activeProvider).not.toBeNull();
    });

    it('Vimeo src → provider created', () => {
      expect(mount({ src: VIMEO_SRC }).activeProvider).not.toBeNull();
    });

    it('HTML5 src → provider created', () => {
      expect(mount({ src: HTML5_SRC }).activeProvider).not.toBeNull();
    });

    it('src change → provider is replaced', () => {
      const el = mount({ src: YOUTUBE_SRC });
      const first = el.activeProvider;
      el.setAttribute('src', VIMEO_SRC);
      expect(el.activeProvider).not.toBe(first);
    });
  });

  describe('autoplay', () => {
    it('autoplay=true (default) → shouldPlay returns true when intersecting', () => {
      const p = mount({ src: YOUTUBE_SRC }).activeProvider!;
      p.isIntersecting = true;
      p.currentState = 'paused';
      expect(p.shouldPlay()).toBe(true);
    });

    it('autoplay=false → shouldPlay returns false when intersecting', () => {
      const p = mount({ src: YOUTUBE_SRC, autoplay: 'false' }).activeProvider!;
      p.isIntersecting = true;
      p.currentState = 'paused';
      expect(p.shouldPlay()).toBe(false);
    });
  });

  describe('muted', () => {
    it('muted=true (default) → provider.muted is true', () => {
      expect(mount({ src: YOUTUBE_SRC }).activeProvider!.muted).toBe(true);
    });

    it('muted=false → provider.muted is false', () => {
      expect(mount({ src: YOUTUBE_SRC, muted: 'false' }).activeProvider!.muted).toBe(false);
    });

    it('setting muted attribute → calls provider.mute()', () => {
      const el = mount({ src: YOUTUBE_SRC, muted: 'false' });
      const spy = vi.spyOn(el.activeProvider!, 'mute');
      el.setAttribute('muted', 'true');
      expect(spy).toHaveBeenCalledOnce();
    });

    it('setting muted=false → calls provider.unmute()', () => {
      const el = mount({ src: YOUTUBE_SRC });
      const spy = vi.spyOn(el.activeProvider!, 'unmute');
      el.setAttribute('muted', 'false');
      expect(spy).toHaveBeenCalledOnce();
    });

    it('setting same muted value → no extra call', () => {
      const el = mount({ src: YOUTUBE_SRC, muted: 'false' });
      const spy = vi.spyOn(el.activeProvider!, 'unmute');
      el.setAttribute('muted', 'false');
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('loop', () => {
    it('loop=true (default) → shouldPlay returns true after video ends', () => {
      const p = mount({ src: YOUTUBE_SRC }).activeProvider!;
      p.isIntersecting = true;
      p.currentState = 'ended';
      expect(p.shouldPlay()).toBe(true);
    });

    it('loop=false → shouldPlay returns false when ended', () => {
      const p = mount({ src: YOUTUBE_SRC, loop: 'false' }).activeProvider!;
      p.currentState = 'ended';
      expect(p.shouldPlay()).toBe(false);
    });
  });

  describe('mobile', () => {
    it('mobile=true (default) on a mobile device → provider still created', () => {
      vi.mocked(isMobile).mockReturnValue(true);
      expect(mount({ src: YOUTUBE_SRC }).activeProvider).not.toBeNull();
    });

    it('mobile=false on a mobile device → provider not created', () => {
      vi.mocked(isMobile).mockReturnValue(true);
      expect(mount({ src: YOUTUBE_SRC, mobile: 'false' }).activeProvider).toBeNull();
    });

    it('mobile=false on mobile → posterEl opacity set to 1', () => {
      vi.mocked(isMobile).mockReturnValue(true);
      const el = mount({ src: YOUTUBE_SRC, mobile: 'false' });
      const posterEl = el.shadowRoot!.querySelector('.vb-poster') as HTMLElement;
      expect(posterEl.style.opacity).toBe('1');
    });
  });

  describe('volume', () => {
    it('volume=1 (default) → provider.volume is 1', () => {
      expect(mount({ src: YOUTUBE_SRC }).activeProvider!.volume).toBe(1);
    });

    it('volume=0.5 → provider.volume is 0.5', () => {
      expect(mount({ src: YOUTUBE_SRC, volume: '0.5' }).activeProvider!.volume).toBe(0.5);
    });

    it('volume=abc (invalid) → falls back to default 1', () => {
      expect(mount({ src: YOUTUBE_SRC, volume: 'abc' }).activeProvider!.volume).toBe(1);
    });

    it('changing volume attribute → calls provider.setVolume()', () => {
      const el = mount({ src: YOUTUBE_SRC });
      const spy = vi.spyOn(el.activeProvider!, 'setVolume');
      el.setAttribute('volume', '0.7');
      expect(spy).toHaveBeenCalledWith(0.7);
    });

    it('volume > 1 → clamped to 1', () => {
      const el = mount({ src: YOUTUBE_SRC });
      const spy = vi.spyOn(el.activeProvider!, 'setVolume');
      el.setAttribute('volume', '2');
      expect(spy).toHaveBeenCalledWith(1);
    });

    it('volume < 0 → clamped to 0', () => {
      const el = mount({ src: YOUTUBE_SRC });
      const spy = vi.spyOn(el.activeProvider!, 'setVolume');
      el.setAttribute('volume', '-0.5');
      expect(spy).toHaveBeenCalledWith(0);
    });
  });

  describe('start-at', () => {
    it('start-at=0 (default) → provider.currentTime is 0', () => {
      expect(mount({ src: YOUTUBE_SRC }).activeProvider!.currentTime).toBe(0);
    });

    it('start-at=30 → provider.currentTime initialises to 30', () => {
      expect(mount({ src: YOUTUBE_SRC, 'start-at': '30' }).activeProvider!.currentTime).toBe(30);
    });

    it('start-at=abc (invalid) → falls back to default 0', () => {
      expect(mount({ src: YOUTUBE_SRC, 'start-at': 'abc' }).activeProvider!.currentTime).toBe(0);
    });
  });

  describe('end-at', () => {
    it('end-at=0 (default) → full duration is accepted', () => {
      const p = mount({ src: YOUTUBE_SRC }).activeProvider!;
      p.setDuration(120);
      expect(p.duration).toBe(120);
    });

    it('end-at=60 → duration is capped at 60', () => {
      const p = mount({ src: YOUTUBE_SRC, 'end-at': '60' }).activeProvider!;
      p.setDuration(120);
      expect(p.duration).toBe(60);
    });

    it('end-at greater than actual duration → actual duration is used', () => {
      const p = mount({ src: YOUTUBE_SRC, 'end-at': '200' }).activeProvider!;
      p.setDuration(120);
      expect(p.duration).toBe(120);
    });
  });

  describe('play-button', () => {
    it('no play-button attr → no play button in controls', () => {
      expect(mount({ src: YOUTUBE_SRC }).shadowRoot!.querySelector('.vb-play-btn')).toBeNull();
    });

    it('play-button → play button in controls', () => {
      expect(mount({ src: YOUTUBE_SRC, 'play-button': '' }).shadowRoot!.querySelector('.vb-play-btn')).not.toBeNull();
    });

    it('play-button=false → no play button', () => {
      expect(mount({ src: YOUTUBE_SRC, 'play-button': 'false' }).shadowRoot!.querySelector('.vb-play-btn')).toBeNull();
    });

    it('adding play-button attribute after init → control appears', () => {
      const el = mount({ src: YOUTUBE_SRC });
      el.setAttribute('play-button', '');
      expect(el.shadowRoot!.querySelector('.vb-play-btn')).not.toBeNull();
    });

    it('removing play-button attribute after init → control removed', () => {
      const el = mount({ src: YOUTUBE_SRC, 'play-button': '' });
      el.setAttribute('play-button', 'false');
      expect(el.shadowRoot!.querySelector('.vb-play-btn')).toBeNull();
    });
  });

  describe('mute-button', () => {
    it('no mute-button attr → no mute button in controls', () => {
      expect(mount({ src: YOUTUBE_SRC }).shadowRoot!.querySelector('.vb-mute-btn')).toBeNull();
    });

    it('mute-button → mute button in controls', () => {
      expect(mount({ src: YOUTUBE_SRC, 'mute-button': '' }).shadowRoot!.querySelector('.vb-mute-btn')).not.toBeNull();
    });

    it('mute-button=false → no mute button', () => {
      expect(mount({ src: YOUTUBE_SRC, 'mute-button': 'false' }).shadowRoot!.querySelector('.vb-mute-btn')).toBeNull();
    });
  });

  describe('seek-bar', () => {
    it('no seek-bar attr → no seek bar in controls', () => {
      expect(mount({ src: YOUTUBE_SRC }).shadowRoot!.querySelector('.vb-seek-bar')).toBeNull();
    });

    it('seek-bar → seek bar in controls', () => {
      expect(mount({ src: YOUTUBE_SRC, 'seek-bar': '' }).shadowRoot!.querySelector('.vb-seek-bar')).not.toBeNull();
    });

    it('seek-bar=false → no seek bar', () => {
      expect(mount({ src: YOUTUBE_SRC, 'seek-bar': 'false' }).shadowRoot!.querySelector('.vb-seek-bar')).toBeNull();
    });

    it('adding seek-bar after init → control appears', () => {
      const el = mount({ src: YOUTUBE_SRC });
      el.setAttribute('seek-bar', '');
      expect(el.shadowRoot!.querySelector('.vb-seek-bar')).not.toBeNull();
    });
  });

  describe('poster', () => {
    it('YouTube src, no poster attr → auto-generates YouTube thumbnail', () => {
      const posterEl = mount({ src: YOUTUBE_SRC }).shadowRoot!.querySelector('.vb-poster') as HTMLElement;
      expect(posterEl.style.backgroundImage).toContain('img.youtube.com/vi/dQw4w9WgXcQ');
    });

    it('Vimeo src, no poster attr → auto-generates vumbnail URL', () => {
      const posterEl = mount({ src: VIMEO_SRC }).shadowRoot!.querySelector('.vb-poster') as HTMLElement;
      expect(posterEl.style.backgroundImage).toContain('vumbnail.com/123456789');
    });

    it('Vimeo unlisted src → includes unlisted hash in poster URL', () => {
      const posterEl = mount({ src: VIMEO_UNLISTED_SRC }).shadowRoot!.querySelector('.vb-poster') as HTMLElement;
      expect(posterEl.style.backgroundImage).toContain('vumbnail.com/123456789/abc123');
    });

    it('custom poster attr → uses the provided URL', () => {
      const url = 'https://example.com/poster.jpg';
      const posterEl = mount({ src: YOUTUBE_SRC, poster: url }).shadowRoot!.querySelector('.vb-poster') as HTMLElement;
      expect(posterEl.style.backgroundImage).toContain(url);
    });

    it('HTML5 src, no poster → no auto-generated poster', () => {
      const posterEl = mount({ src: HTML5_SRC }).shadowRoot!.querySelector('.vb-poster') as HTMLElement;
      expect(posterEl.style.backgroundImage).toBe('');
    });
  });

  describe('aspect-ratio', () => {
    it('resize() works with default 16/9 ratio', () => {
      const p = mount({ src: YOUTUBE_SRC }).activeProvider!;
      expect(() => p.resize()).not.toThrow();
    });

    it('resize() works with "/" notation', () => {
      const p = mount({ src: YOUTUBE_SRC, 'aspect-ratio': '4/3' }).activeProvider!;
      expect(() => p.resize()).not.toThrow();
    });

    it('resize() works with ":" notation', () => {
      const p = mount({ src: YOUTUBE_SRC, 'aspect-ratio': '4:3' }).activeProvider!;
      expect(() => p.resize()).not.toThrow();
    });

    it('resize() works with decimal string notation', () => {
      const p = mount({ src: YOUTUBE_SRC, 'aspect-ratio': '1.777' }).activeProvider!;
      expect(() => p.resize()).not.toThrow();
    });
  });

  describe('no-cookie', () => {
    it('no-cookie=true (default) → provider created', () => {
      expect(mount({ src: YOUTUBE_SRC }).activeProvider).not.toBeNull();
    });

    it('no-cookie=false → provider created', () => {
      expect(mount({ src: YOUTUBE_SRC, 'no-cookie': 'false' }).activeProvider).not.toBeNull();
    });
  });

  describe('fit-box', () => {
    it('fit-box → resize() exits early, leaving player dimensions unchanged', () => {
      const p = mount({ src: YOUTUBE_SRC, 'fit-box': '' }).activeProvider!;
      const playerEl = document.createElement('div');
      playerEl.style.width = '300px';
      p.playerElement = playerEl;
      p.resize();
      expect(playerEl.style.width).toBe('300px');
    });

    it('without fit-box → resize() runs and would update dimensions (no throw)', () => {
      const p = mount({ src: YOUTUBE_SRC }).activeProvider!;
      expect(() => p.resize()).not.toThrow();
    });
  });

  describe('lazy', () => {
    it('lazy not set → controls built immediately', () => {
      expect(mount({ src: YOUTUBE_SRC, 'play-button': '' }).shadowRoot!.querySelector('.vb-play-btn')).not.toBeNull();
    });

    it('lazy → provider is set but doInit() deferred, controls are empty', () => {
      const el = mount({ src: YOUTUBE_SRC, lazy: '', 'play-button': '' });
      expect(el.activeProvider).not.toBeNull();
      expect(el.shadowRoot!.querySelector('.vb-play-btn')).toBeNull();
    });
  });

  describe('always-play', () => {
    it('always-play → provider.isIntersecting is true immediately', () => {
      expect(mount({ src: YOUTUBE_SRC, 'always-play': '' }).activeProvider!.isIntersecting).toBe(true);
    });

    it('without always-play → provider.isIntersecting starts false', () => {
      expect(mount({ src: YOUTUBE_SRC }).activeProvider!.isIntersecting).toBe(false);
    });

    it('always-play → shouldPlay returns true regardless of intersection', () => {
      const p = mount({ src: YOUTUBE_SRC, 'always-play': '' }).activeProvider!;
      p.isIntersecting = false;
      p.currentState = 'paused';
      expect(p.shouldPlay()).toBe(true);
    });
  });

  describe('force-on-low-battery', () => {
    it('force-on-low-battery not set → mobileLowBatteryAutoplayHack is a no-op', () => {
      const p = mount({ src: YOUTUBE_SRC }).activeProvider!;
      const spy = vi.spyOn(document, 'addEventListener');
      p.mobileLowBatteryAutoplayHack();
      expect(spy).not.toHaveBeenCalled();
    });

    it('force-on-low-battery on mobile → adds touchstart listener', () => {
      vi.mocked(isMobile).mockReturnValue(true);
      const p = mount({ src: YOUTUBE_SRC, 'force-on-low-battery': '' }).activeProvider!;
      p.isMobile = true;
      const spy = vi.spyOn(document, 'addEventListener');
      p.mobileLowBatteryAutoplayHack();
      expect(spy).toHaveBeenCalledWith('touchstart', expect.any(Function), { once: true });
    });
  });

  describe('title', () => {
    it('default title is "Video background"', () => {
      expect(DEFAULT_CONFIG.title).toBe('Video background');
    });

    it('custom title attr → element mounts without error', () => {
      expect(() => mount({ src: YOUTUBE_SRC, title: 'My background video' })).not.toThrow();
    });
  });

  describe('video-id', () => {
    it('video-id is extracted from YouTube URL', () => {
      const p = mount({ src: YOUTUBE_SRC }).activeProvider!;
      expect((p as any).config['video-id']).toBe('dQw4w9WgXcQ');
    });

    it('video-id is extracted from Vimeo URL', () => {
      const p = mount({ src: VIMEO_SRC }).activeProvider!;
      expect((p as any).config['video-id']).toBe('123456789');
    });
  });

  describe('unlisted-hash', () => {
    it('unlisted-hash is empty for a standard Vimeo URL', () => {
      const p = mount({ src: VIMEO_SRC }).activeProvider!;
      expect((p as any).config['unlisted-hash']).toBe('');
    });

    it('unlisted-hash is extracted from a Vimeo unlisted URL', () => {
      const p = mount({ src: VIMEO_UNLISTED_SRC }).activeProvider!;
      expect((p as any).config['unlisted-hash']).toBe('abc123');
    });
  });
});
