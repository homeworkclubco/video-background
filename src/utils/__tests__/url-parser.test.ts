import { describe, it, expect } from 'vitest';
import { parseVideoUrl, detectProvider } from '../url-parser.js';

describe('parseVideoUrl', () => {
  describe('YouTube URLs', () => {
    const youtubeId = 'dQw4w9WgXcQ';

    it('parses youtube.com/watch?v=', () => {
      const result = parseVideoUrl(`https://www.youtube.com/watch?v=${youtubeId}`);
      expect(result?.type).toBe('youtube');
      expect(result?.id).toBe(youtubeId);
    });

    it('parses youtu.be/ short URL', () => {
      const result = parseVideoUrl(`https://youtu.be/${youtubeId}`);
      expect(result?.type).toBe('youtube');
      expect(result?.id).toBe(youtubeId);
    });

    it('parses youtube.com/embed/', () => {
      const result = parseVideoUrl(`https://www.youtube.com/embed/${youtubeId}`);
      expect(result?.type).toBe('youtube');
      expect(result?.id).toBe(youtubeId);
    });

    it('parses youtube-nocookie.com/embed/', () => {
      const result = parseVideoUrl(`https://www.youtube-nocookie.com/embed/${youtubeId}`);
      expect(result?.type).toBe('youtube');
      expect(result?.id).toBe(youtubeId);
    });

    it('parses URL with timestamp', () => {
      const result = parseVideoUrl(`https://www.youtube.com/watch?v=${youtubeId}&t=30s`);
      expect(result?.type).toBe('youtube');
      expect(result?.id).toBe(youtubeId);
    });

    it('parses URL with extra params', () => {
      const result = parseVideoUrl(`https://www.youtube.com/watch?v=${youtubeId}&list=PL1234`);
      expect(result?.type).toBe('youtube');
      expect(result?.id).toBe(youtubeId);
    });

    it('preserves full link', () => {
      const url = `https://www.youtube.com/watch?v=${youtubeId}`;
      const result = parseVideoUrl(url);
      expect(result?.link).toBe(url);
    });
  });

  describe('Vimeo URLs', () => {
    const vimeoId = '123456789';

    it('parses vimeo.com/{id}', () => {
      const result = parseVideoUrl(`https://vimeo.com/${vimeoId}`);
      expect(result?.type).toBe('vimeo');
      expect(result?.id).toBe(vimeoId);
    });

    it('parses player.vimeo.com/video/{id}', () => {
      const result = parseVideoUrl(`https://player.vimeo.com/video/${vimeoId}`);
      expect(result?.type).toBe('vimeo');
      expect(result?.id).toBe(vimeoId);
    });

    it('parses unlisted video with ?h= query param', () => {
      const result = parseVideoUrl(`https://vimeo.com/${vimeoId}?h=abc123`);
      expect(result?.type).toBe('vimeo');
      expect(result?.id).toBe(vimeoId);
      expect(result?.unlisted).toBe('abc123');
    });

    it('parses vimeo.com/channels/{channel}/{id}', () => {
      const result = parseVideoUrl(`https://vimeo.com/channels/mychannel/${vimeoId}`);
      expect(result?.type).toBe('vimeo');
      expect(result?.id).toBe(vimeoId);
    });
  });

  describe('HTML5 video URLs', () => {
    it('parses .mp4 file', () => {
      const result = parseVideoUrl('https://example.com/video.mp4');
      expect(result?.type).toBe('html5');
    });

    it('parses .webm file', () => {
      const result = parseVideoUrl('https://example.com/video.webm');
      expect(result?.type).toBe('html5');
    });

    it('parses .ogv file', () => {
      const result = parseVideoUrl('https://example.com/video.ogv');
      expect(result?.type).toBe('html5');
    });

    it('parses .mov file', () => {
      const result = parseVideoUrl('/videos/hero.mov');
      expect(result?.type).toBe('html5');
    });

    it('parses .mp4 with query string', () => {
      const result = parseVideoUrl('https://cdn.example.com/video.mp4?v=2');
      expect(result?.type).toBe('html5');
    });
  });

  describe('invalid URLs', () => {
    it('returns null for empty string', () => {
      expect(parseVideoUrl('')).toBeNull();
    });

    it('returns null for random string', () => {
      expect(parseVideoUrl('not a url')).toBeNull();
    });

    it('returns null for unrecognised URL', () => {
      expect(parseVideoUrl('https://example.com/page')).toBeNull();
    });
  });
});

describe('detectProvider', () => {
  it('returns youtube for YouTube URL', () => {
    expect(detectProvider('https://youtu.be/dQw4w9WgXcQ')).toBe('youtube');
  });

  it('returns vimeo for Vimeo URL', () => {
    expect(detectProvider('https://vimeo.com/123456789')).toBe('vimeo');
  });

  it('returns html5 for mp4 URL', () => {
    expect(detectProvider('/videos/hero.mp4')).toBe('html5');
  });

  it('returns null for unknown URL', () => {
    expect(detectProvider('https://example.com')).toBeNull();
  });
});
