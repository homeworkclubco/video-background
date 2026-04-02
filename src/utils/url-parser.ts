import type { ProviderType, ParsedVideoData } from '../types.js';

// YouTube: matches youtube.com/watch?v=, youtu.be/, youtube.com/embed/, youtube-nocookie.com/embed/
const RE_YOUTUBE = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([^"&?\/\s]{11})/i;

// Vimeo: matches vimeo.com/{id}, player.vimeo.com/video/{id}
const RE_VIMEO = /(?:vimeo\.com\/(?:video\/|channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|)(\d+)(?:|\/\?))/i;

// HTML5 video file extensions
const RE_VIDEO = /\.(mp4|webm|ogv|ogm|ogg|avi|m4v|mov|qt)(\?.*)?$/i;

export function parseVideoUrl(url: string): ParsedVideoData | null {
  if (!url) return null;

  // Test YouTube
  const ytMatch = url.match(RE_YOUTUBE);
  if (ytMatch && ytMatch[1]) {
    return { id: ytMatch[1], type: 'youtube', link: url };
  }

  // Test Vimeo
  const vmMatch = url.match(RE_VIMEO);
  if (vmMatch && vmMatch[1]) {
    const data: ParsedVideoData = { id: vmMatch[1], type: 'vimeo', link: url };
    // Unlisted video: check for hash in path or query string
    const unlistedPathRegex = /\/[^\/\:\.]+(\:|\/)([^:?\/]+)\s?$/;
    const unlistedQueryRegex = /(\?|&)h=([^=&#?]+)/;
    const pathMatch = url.match(unlistedPathRegex);
    const queryMatch = url.match(unlistedQueryRegex);
    if (pathMatch) data.unlisted = pathMatch[2];
    else if (queryMatch) data.unlisted = queryMatch[2];
    return data;
  }

  // Test HTML5 video file
  const vidMatch = url.match(RE_VIDEO);
  if (vidMatch) {
    return { id: url, type: 'html5', link: url };
  }

  return null;
}

export function detectProvider(url: string): ProviderType | null {
  const data = parseVideoUrl(url);
  return data ? data.type : null;
}
