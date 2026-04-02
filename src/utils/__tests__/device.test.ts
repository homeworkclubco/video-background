import { describe, it, expect, vi, afterEach } from 'vitest';
import { isMobile } from '../device.js';

describe('isMobile', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns true for iPhone user agent', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)'
    );
    expect(isMobile()).toBe(true);
  });

  it('returns true for Android user agent', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (Linux; Android 12; Pixel 6)'
    );
    expect(isMobile()).toBe(true);
  });

  it('returns true for iPad user agent', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)'
    );
    expect(isMobile()).toBe(true);
  });

  it('returns false for desktop Chrome user agent', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
    );
    expect(isMobile()).toBe(false);
  });

  it('returns false for desktop Firefox user agent', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0'
    );
    expect(isMobile()).toBe(false);
  });
});
