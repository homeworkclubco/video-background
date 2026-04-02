export { VideoBackgroundElement } from './video-background.js';
export type { VideoBackgroundConfig, VideoState, ProviderType, ParsedVideoData } from './types.js';

import { VideoBackgroundElement } from './video-background.js';

if (!customElements.get('video-background')) {
  customElements.define('video-background', VideoBackgroundElement);
}
