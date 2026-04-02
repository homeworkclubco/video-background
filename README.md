# `<video-background>`

A zero-dependency web component for full-cover video backgrounds. Supports YouTube, Vimeo, and self-hosted HTML5 video. No jQuery. No configuration scripts. Just drop a tag.

Inspired by and built upon the ideas of [stamat/youtube-background](https://github.com/stamat/youtube-background).

---

## Features

- 🎬 **YouTube, Vimeo, and HTML5 video** — auto-detected from URL
- 🏝️ **Zero dependencies** — no jQuery, no external libraries
- 🧩 **Web Component** — native `<video-background>` custom element with Shadow DOM
- 🖼️ **Automatic poster images** — pulled from YouTube/Vimeo thumbnails
- ⏸️ **Smart play/pause** — pauses when scrolled out of view, plays when visible
- 📱 **Mobile aware** — shows poster image on mobile by default
- 🔒 **Privacy-friendly** — `youtube-nocookie.com` by default for YouTube
- 💅 **Themeable controls** — CSS custom properties for colours and sizing
- 🎚️ **Built-in controls** — optional play, mute, and seek bar
- 🪄 **Slot-based overlay** — drop any HTML inside for hero content
- 🔌 **JS API** — programmatic control and event hooks
- 📦 **TypeScript** — fully typed with declaration files

---

## Installation

```bash
npm install youtube-background
```

Or via CDN:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/youtube-background/dist/video-background.js"></script>
```

---

## Quick Start

### YouTube

```html
<video-background src="https://www.youtube.com/watch?v=dQw4w9WgXcQ">
  <h1>My Hero Heading</h1>
</video-background>
```

### Vimeo

```html
<video-background src="https://vimeo.com/76979871" loop="true">
  <h1>My Hero Heading</h1>
</video-background>
```

### HTML5 video

```html
<video-background src="https://example.com/video.mp4" loop="true">
  <h1>My Hero Heading</h1>
</video-background>
```

> The component needs a defined width and height — it fills its parent. Set the parent to at least `position: relative` and a height you want.

```css
video-background {
  display: block;
  width: 100%;
  height: 100vh;
}
```

---

## Import

### ES Module (bundler)

```js
import 'youtube-background';
```

### ES Module (browser)

```html
<script type="module">
  import 'https://cdn.jsdelivr.net/npm/youtube-background/dist/video-background.js';
</script>
```

### UMD / classic script

```html
<script src="https://cdn.jsdelivr.net/npm/youtube-background/dist/video-background.umd.js"></script>
```

---

## Attributes

All configuration is via HTML attributes. Defaults are shown below.

| Attribute | Type | Default | Description |
|---|---|---|---|
| `src` | `string` | — | **Required.** YouTube/Vimeo URL or path to an HTML5 video file. |
| `autoplay` | `boolean` | `true` | Start playing automatically when the component enters the viewport. |
| `muted` | `boolean` | `true` | Start muted. Required by most browsers for autoplay to work. |
| `loop` | `boolean` | `true` | Loop the video. |
| `mobile` | `boolean` | `false` | Enable video on mobile devices. When `false`, only the poster image is shown on mobile. |
| `volume` | `number` | `1` | Initial volume from `0` to `1`. |
| `start-at` | `number` | `0` | Start playback at this time in seconds. |
| `end-at` | `number` | `0` | Stop and loop back at this time in seconds (`0` = play to end). |
| `poster` | `string` | auto | Override the poster image URL. YouTube and Vimeo thumbnails are used automatically. |
| `aspect-ratio` | `string` | `16/9` | Aspect ratio used for cover sizing calculations. |
| `no-cookie` | `boolean` | `true` | Use `youtube-nocookie.com` for YouTube embeds (privacy-enhanced mode). |
| `always-play` | `boolean` | `false` | Keep playing even when the element is scrolled out of view. |
| `fit-box` | `boolean` | `false` | Size the video to fit (contain) rather than cover the container. |
| `lazy` | `boolean` | `false` | Defer initialisation until the element enters the viewport. |
| `force-on-low-battery` | `boolean` | `false` | Try to play on iOS even when low-power mode is active. |
| `play-button` | `boolean` | `false` | Show a built-in play/pause button. |
| `mute-button` | `boolean` | `false` | Show a built-in mute/unmute button. |
| `seek-bar` | `boolean` | `false` | Show a built-in seek bar. |
| `title` | `string` | `Video background` | Accessible title for the iframe/video element. |

### Example with multiple attributes

```html
<video-background
  src="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  autoplay="true"
  muted="true"
  loop="true"
  start-at="10"
  no-cookie="true"
  play-button="true"
  mute-button="true"
  seek-bar="true"
  poster="https://example.com/my-poster.jpg">
  <h1>Hello World</h1>
</video-background>
```

---

## Overlay Slot

Any HTML inside `<video-background>` is rendered in a centered overlay via a `<slot>`. This is the standard way to add hero text, CTAs, or any foreground content.

```html
<video-background src="https://www.youtube.com/watch?v=dQw4w9WgXcQ">
  <div class="hero-content">
    <h1>Big Hero Title</h1>
    <a href="/signup" class="btn">Get Started</a>
  </div>
</video-background>
```

Slotted content is fully interactive — clicks and focus pass through normally.

---

## JavaScript API

### Methods

| Method | Description |
|---|---|
| `play()` | Resume playback. |
| `pause()` | Pause playback. |
| `mute()` | Mute the video. |
| `unmute()` | Unmute the video. |
| `seek(percentage)` | Seek to a position as a percentage (`0`–`100`). |
| `seekTo(seconds)` | Seek to an absolute time in seconds. |
| `setVolume(vol)` | Set volume (`0`–`1`). |

### Properties

| Property | Type | Description |
|---|---|---|
| `src` | `string` (get/set) | Get or set the video source. Setting triggers full reinitialisation. |
| `volume` | `number` (get/set) | Get or set the volume (`0`–`1`). |
| `currentTime` | `number` (read) | Current playback position in seconds. |
| `duration` | `number` (read) | Total video duration in seconds. |
| `percentComplete` | `number` (read) | Playback progress as a percentage (`0`–`100`). |
| `paused` | `boolean` (read) | Whether the video is currently paused. |
| `activeProvider` | `BaseProvider \| null` (read) | Direct access to the underlying provider instance. |

### Example

```html
<video-background id="hero" src="https://www.youtube.com/watch?v=dQw4w9WgXcQ">
  <div style="display: flex; gap: 1rem;">
    <button onclick="document.getElementById('hero').play()">Play</button>
    <button onclick="document.getElementById('hero').pause()">Pause</button>
    <button onclick="document.getElementById('hero').mute()">Mute</button>
    <button onclick="document.getElementById('hero').unmute()">Unmute</button>
  </div>
</video-background>
```

### Changing the source dynamically

Setting the `src` attribute or property will destroy the current player and initialise a new one:

```js
const vb = document.querySelector('video-background');

// Via property
vb.src = 'https://vimeo.com/76979871';

// Via attribute
vb.setAttribute('src', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
```

---

## Events

All events bubble and are dispatched on the `<video-background>` element. The `event.detail` value is the internal provider instance.

| Event | Fired when |
|---|---|
| `vb-ready` | The player is initialised and ready. |
| `vb-play` | Playback starts or resumes. |
| `vb-pause` | Playback is paused. |
| `vb-ended` | The video ends (when `loop` is off). |
| `vb-mute` | The video is muted. |
| `vb-unmute` | The video is unmuted. |
| `vb-timeupdate` | Playback position changes (throttled). |
| `vb-seeked` | The user or JS seeks to a new position. |

```js
document.querySelector('video-background').addEventListener('vb-play', (e) => {
  console.log('Video started playing', e.detail);
});

document.querySelector('video-background').addEventListener('vb-ready', () => {
  console.log('Player is ready');
});
```

---

## CSS Custom Properties

Styles are encapsulated in Shadow DOM. Use these CSS custom properties to theme the built-in controls from outside:

| Property | Default | Description |
|---|---|---|
| `--vb-overlay-bg` | `transparent` | Background colour/gradient of the overlay area. |
| `--vb-controls-size` | `36px` | Size of the play and mute buttons. |
| `--vb-controls-bg` | `rgba(0,0,0,0.5)` | Background of control buttons. |
| `--vb-controls-color` | `#fff` | Icon/text colour for control buttons. |
| `--vb-seek-bg` | `rgba(255,255,255,0.4)` | Seek bar track background. |
| `--vb-seek-progress-bg` | `#fff` | Seek bar progress fill colour. |
| `--vb-seek-thumb-color` | `#fff` | Seek bar thumb colour. |

```css
video-background {
  --vb-overlay-bg: linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.6));
  --vb-controls-bg: rgba(255, 255, 255, 0.2);
  --vb-controls-color: #fff;
  --vb-seek-progress-bg: #f00;
}
```

---

## TypeScript

Full type declarations are included. Import types directly:

```ts
import type { VideoBackgroundConfig, VideoState, ProviderType } from 'youtube-background';
import { VideoBackgroundElement } from 'youtube-background';

const el = document.querySelector('video-background') as VideoBackgroundElement;
el.play();
```

---

## Provider Notes

### YouTube

- Privacy-enhanced mode (`youtube-nocookie.com`) is on by default — disable with `no-cookie="false"`.
- Poster images are pulled automatically from `img.youtube.com`.
- The YouTube IFrame API is loaded on demand.

### Vimeo

- Vimeo's background mode (`background=1`) is used for silent autoplay.
- Poster images are pulled automatically from `vumbnail.com`.
- Unlisted videos are supported — include the full privacy URL (e.g. `https://vimeo.com/123456789/abcdef1234`).
- The Vimeo Player SDK is loaded on demand.

### HTML5

- Supports `.mp4`, `.webm`, `.ogv`, `.ogg` file extensions.
- Multiple sources are not yet supported via the attribute API; use the `<video>` element directly for that.
- `autoplay` requires `muted="true"` in most browsers.

---

## License

MIT
