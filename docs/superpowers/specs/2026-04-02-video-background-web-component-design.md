# Video Background Web Component — Design Specification

## Overview

Rewrite `youtube-background` (a jQuery plugin for video backgrounds) as `video-background` — a modern, zero-dependency web component built with TypeScript. The component supports YouTube, Vimeo, and HTML5 video sources via a single `<video-background>` custom element with automatic provider detection.

### Goals

- **Single `<video-background>` element** that handles YouTube, Vimeo, and HTML5 video
- **Zero runtime dependencies** — inline all utilities, no jQuery, no `book-of-spells`
- **Shadow DOM encapsulation** with `::part()` and CSS custom properties for external styling
- **Full feature parity** with the existing library (all 17 config attributes, controls, events)
- **TypeScript from the ground up** with generated `.d.ts` declarations
- **NPM + CDN distribution** — ESM for bundlers, UMD for script tags
- **Vite library mode** build with Vitest + Playwright testing

### Non-Goals

- jQuery compatibility layer or migration adapter
- Plugin/registry system for providers (monolithic is sufficient for 3 providers)
- Server-side rendering (web components are client-side by nature)

---

## Component API

### HTML Usage

```html
<!-- YouTube -->
<video-background
  src="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  autoplay
  muted
  loop
></video-background>

<!-- Vimeo -->
<video-background
  src="https://vimeo.com/123456789"
  start-at="10"
  end-at="60"
></video-background>

<!-- HTML5 Video -->
<video-background
  src="/videos/hero.mp4"
  volume="0.3"
></video-background>

<!-- With overlay content -->
<video-background
  src="https://www.youtube.com/watch?v=..."
  play-button
  mute-button
>
  <h1>Hero Section</h1>
  <p>Content overlays the video</p>
</video-background>
```

### Attributes

All attributes are reflected as JavaScript properties (kebab-case attributes → camelCase properties).

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `src` | string | — | Video URL (YouTube, Vimeo, or file path). Provider auto-detected. |
| `autoplay` | boolean | `true` | Autoplay when the element enters the viewport. |
| `muted` | boolean | `true` | Start muted. Required for autoplay in modern browsers. |
| `loop` | boolean | `true` | Restart the video when it ends. |
| `volume` | number | `1` | Volume level (0–1). |
| `start-at` | number | `0` | Start time in seconds. |
| `end-at` | number | `0` | End time in seconds (0 = play to end). |
| `play-button` | boolean | `false` | Show a play/pause toggle button. |
| `mute-button` | boolean | `false` | Show a mute/unmute toggle button. |
| `poster` | string | auto | Poster image URL. Auto-fetched from YouTube/Vimeo thumbnails if omitted. |
| `aspect-ratio` | string | `16/9` | Video aspect ratio for cover calculations. Renamed from `resolution`. |
| `no-cookie` | boolean | `true` | Privacy-enhanced mode (youtube-nocookie.com, Vimeo dnt=1). |
| `fit-box` | boolean | `false` | Fit to container dimensions instead of cover behavior. |
| `mobile` | boolean | `false` | Enable video playback on mobile devices. |
| `lazy` | boolean | `false` | Defer loading until the element is near the viewport. Renamed from `lazyloading`. |
| `always-play` | boolean | `false` | Keep playing when scrolled out of viewport (skip IntersectionObserver pause). |
| `force-on-low-battery` | boolean | `false` | Force autoplay on battery saver / low-power mode. |
| `seek-bar` | boolean | `false` | Show a seek/progress bar control. |

**Removed from v1:** `inline-styles` (Shadow DOM handles encapsulation), `load-background` (replaced by automatic poster behavior), `pause` (deprecated alias for `play-button`), `offset` (handled internally), `resolution_mod` (internal computed value).

### JavaScript API

#### Methods

```typescript
const bg = document.querySelector('video-background');

bg.play(): void;
bg.pause(): void;
bg.mute(): void;
bg.unmute(): void;
bg.seek(percentage: number): void;   // 0–100
bg.seekTo(seconds: number): void;
bg.setVolume(level: number): void;   // 0–1
bg.destroy(): void;
```

#### Read-Only Properties

```typescript
bg.currentTime: number;      // seconds
bg.duration: number;          // seconds
bg.percentComplete: number;   // 0–100
bg.paused: boolean;
bg.provider: 'youtube' | 'vimeo' | 'html5';
```

#### Events

All events are dispatched on the `<video-background>` element with the component instance as `event.detail`.

| Event | Fired When |
|-------|------------|
| `vb-ready` | Provider loaded and ready to play |
| `vb-play` | Playback starts |
| `vb-pause` | Playback pauses |
| `vb-ended` | Video reaches end (before loop restart) |
| `vb-timeupdate` | Current time changes (throttled) |
| `vb-statechange` | Player state changes (buffering, cued, etc.) |

---

## Internal Architecture

### Module Structure

```
src/
├── video-background.ts          ← Custom element class (entry point)
├── providers/
│   ├── base-provider.ts          ← Abstract base class
│   ├── youtube-provider.ts       ← YouTube iframe API integration
│   ├── vimeo-provider.ts         ← Vimeo Player SDK integration
│   └── html5-provider.ts         ← Native <video> element
├── controls/
│   ├── play-button.ts            ← Play/pause toggle
│   ├── mute-button.ts            ← Mute/unmute toggle
│   └── seek-bar.ts               ← Progress / seek control
├── utils/
│   ├── url-parser.ts             ← YouTube/Vimeo URL detection & ID extraction
│   ├── device.ts                 ← Mobile detection, battery saver
│   └── uid.ts                    ← Unique ID generation
├── icons.ts                      ← Lucide SVG icon strings (play, pause, volume, volume-x)
├── styles.ts                     ← Shadow DOM CSS (template literal)
├── types.ts                      ← Shared TypeScript interfaces
└── index.ts                      ← Public API exports + auto-registration
```

### Class Design

**Composition over deep inheritance:**

- `VideoBackground extends HTMLElement` — the custom element. Manages lifecycle, attributes, Shadow DOM, observers, and delegates playback to a provider.
- `BaseProvider` — abstract class with shared logic: time tracking, event dispatching, cover sizing, poster loading, and the common play/pause/mute/seek interface.
- `YouTubeProvider extends BaseProvider` — injects YouTube iframe API script, creates `YT.Player`, polls `getCurrentTime()` every 250ms (YouTube has no timeupdate event), maps YouTube player states to component events.
- `VimeoProvider extends BaseProvider` — injects Vimeo Player SDK script, creates `Vimeo.Player`, uses Vimeo's native event system (loaded, play, pause, timeupdate, ended). Handles unlisted videos via `h` parameter.
- `HTML5Provider extends BaseProvider` — creates a native `<video>` element. Uses standard HTMLMediaElement events. Supports mp4, webm, ogv, avi, m4v, mov, qt MIME types.

### Shadow DOM Structure

```
#shadow-root (open)
├── <style> ... </style>
├── <div part="wrapper">
│   ├── <div part="player">
│   │   └── iframe or <video> (injected by provider)
│   ├── <div part="poster">
│   │   └── Background image (thumbnail)
│   ├── <div part="controls">
│   │   ├── <button part="play-btn"> ▶ </button>
│   │   ├── <button part="mute-btn"> 🔇 </button>
│   │   ├── <div part="seek-bar"> ← progress/seek control
│   │   └── <slot name="controls"> ← user custom controls
│   └── <div part="overlay">
│       └── <slot> ← default slot for overlay content
```

### CSS Customization

**CSS Custom Properties** (set on the host element or any ancestor):

| Property | Default | Description |
|----------|---------|-------------|
| `--vb-controls-bg` | `rgba(0,0,0,0.5)` | Control button background |
| `--vb-controls-color` | `#fff` | Control icon color |
| `--vb-controls-size` | `40px` | Control button size |
| `--vb-overlay-bg` | `transparent` | Overlay background (for dimming) |

**`::part()` targets:** `wrapper`, `player`, `poster`, `controls`, `play-btn`, `mute-btn`, `seek-bar`, `overlay` — for full external styling control. Control positions are styled via `::part()` rather than a custom property, giving users full CSS control.

### Data Flow

1. **`connectedCallback()`**: Parse attributes → config object. Create Shadow DOM structure. Detect provider from `src` URL via `urlParser.detect()`. Instantiate the appropriate provider. Set up `IntersectionObserver` for lazy play/pause. Set up `ResizeObserver` for responsive cover sizing.

2. **Provider initialization**: Load external SDK (YouTube/Vimeo) if not already loaded, or create `<video>` element. Inject iframe/video into Shadow DOM player container. Apply cover positioning. Emit `vb-ready` event.

3. **Intersection triggers**: Element enters viewport → `provider.play()`. Leaves viewport → `provider.pause()`. Respects `always-play` attribute.

4. **`attributeChangedCallback()`**: `src` change → destroy current provider, create new one. `volume` change → `provider.setVolume()`. `muted` change → `provider.mute()` / `provider.unmute()`. Boolean attribute changes → update provider config.

5. **`disconnectedCallback()`**: `provider.destroy()`. Disconnect `IntersectionObserver` and `ResizeObserver`. Clear any timers (YouTube polling interval).

### URL Parser

Inlined regex patterns for provider detection and video ID extraction. Replaces `book-of-spells` dependency.

- **YouTube**: Matches `youtube.com/watch?v=`, `youtu.be/`, `youtube.com/embed/`, `youtube-nocookie.com` variants. Extracts video ID.
- **Vimeo**: Matches `vimeo.com/{id}`, `player.vimeo.com/video/{id}`. Extracts video ID and optional unlisted hash.
- **HTML5**: Fallback — if URL doesn't match YouTube or Vimeo, treat as direct video file URL.

### Provider SDK Loading

Both YouTube and Vimeo require external SDKs. The loading strategy:

1. Check if the SDK global already exists (`window.YT` or `window.Vimeo`).
2. If not, inject a `<script>` tag and wait for the `onload` callback.
3. Use a module-level promise to deduplicate — multiple `<video-background>` elements sharing the same provider will reuse the same SDK load promise.
4. YouTube uses `window.onYouTubeIframeAPIReady` callback; the loader wraps this in a promise.
5. Vimeo SDK resolves on script load.

### Icons

Built-in Lucide SVG icons for play, pause, volume-2 (unmuted), and volume-x (muted). Stored as template literal strings in `icons.ts`. Injected into Shadow DOM buttons. Users can override via the `controls` slot.

---

## Build & Distribution

### Vite Library Mode Configuration

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'VideoBackground',
      formats: ['es', 'umd'],
      fileName: (format) => `video-background.${format}.js`,
    },
  },
  plugins: [dts()],
});
```

### Build Outputs

| File | Format | Purpose |
|------|--------|---------|
| `dist/video-background.es.js` | ESM | For bundlers (Vite, Webpack, Rollup) |
| `dist/video-background.umd.js` | UMD | For CDN `<script>` tags |
| `dist/video-background.d.ts` | TypeScript declarations | IDE autocomplete and type checking |

### Package.json

```json
{
  "name": "video-background",
  "type": "module",
  "main": "dist/video-background.umd.js",
  "module": "dist/video-background.es.js",
  "types": "dist/video-background.d.ts",
  "exports": {
    ".": {
      "import": "./dist/video-background.es.js",
      "require": "./dist/video-background.umd.js",
      "types": "./dist/video-background.d.ts"
    }
  },
  "files": ["dist"]
}
```

### CDN Usage

```html
<!-- UMD auto-registers the custom element -->
<script src="https://unpkg.com/video-background"></script>

<!-- Just use it — no CSS import, no init call -->
<video-background src="https://youtube.com/watch?v=..."></video-background>
```

### ESM Usage

```typescript
// Side-effect import (auto-registers <video-background>)
import 'video-background';

// Or import the class for manual registration / subclassing
import { VideoBackground } from 'video-background';
```

---

## Testing Strategy

### Unit Tests (Vitest)

Pure logic tests, no DOM:

- **URL parser**: YouTube URL variants (watch, short, embed, nocookie), Vimeo (regular, unlisted, player embed), HTML5 fallback, invalid URLs
- **Attribute parsing**: Defaults, type coercion, boolean attributes
- **Provider selection**: Correct provider class for each URL type
- **Time math**: `percentageToTime()`, `timeToPercentage()`, boundary clamping
- **Mobile detection**: User agent parsing
- **UID generation**: Uniqueness, collision avoidance

### Component Tests (Vitest + happy-dom)

DOM-based tests with mocked providers:

- Custom element registration (`customElements.get('video-background')`)
- Attribute reflection (attribute ↔ property sync)
- Shadow DOM structure (expected elements exist)
- Controls rendering (play/mute buttons appear when attributes set)
- Event dispatching (events bubble from provider through component)
- Lifecycle (connectedCallback creates provider, disconnectedCallback destroys it)
- Source change (swapping `src` destroys old provider, creates new one)

### E2E Tests (Playwright)

Real browser tests against the Vite dev server:

- YouTube video loads and reaches ready state
- Vimeo video loads and reaches ready state
- HTML5 video loads and plays
- Play/pause button toggles playback
- Mute/unmute button toggles audio
- Responsive resize maintains cover
- Source switching between providers
- Start-at / end-at time boundaries

---

## npm Scripts

```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest",
  "test:e2e": "playwright test",
  "lint": "eslint .",
  "typecheck": "tsc --noEmit"
}
```

---

## Dev Dependencies

| Package | Purpose |
|---------|---------|
| `vite` | Build tool & dev server |
| `typescript` | Type checking |
| `vite-plugin-dts` | Generate `.d.ts` declarations |
| `vitest` | Unit & component testing |
| `happy-dom` | DOM environment for Vitest |
| `@playwright/test` | E2E browser tests |
| `eslint` | Linting (flat config) |

**Runtime dependencies: none.**

---

## Migration from v1

This is a clean break — no backward compatibility with the jQuery plugin API. The mapping:

| v1 (jQuery) | v2 (Web Component) |
|-------------|---------------------|
| `$('[data-vbg]').youtube_background({...})` | `<video-background src="..." ...>` |
| `data-vbg="url"` | `src="url"` |
| `data-vbg-play-button="true"` | `play-button` |
| `data-vbg-resolution="16:9"` | `aspect-ratio="16/9"` |
| `data-vbg-lazyloading="true"` | `lazy` |
| `window.VIDEO_BACKGROUNDS` | Direct element reference |
| `vbg.get('#el').play()` | `document.querySelector('video-background').play()` |
| `video-background-ready` event | `vb-ready` event |
| FontAwesome icons | Built-in Lucide SVG icons |
