export const styles = `
  :host {
    display: block;
    position: relative;
    overflow: hidden;
    min-height: 200px;
  }

  .vb-wrapper {
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .vb-wrapper.has-controls {
    pointer-events: auto;
  }

  /* Player container sits above poster; video fades in when playing, covering it */
  .vb-player {
    position: absolute;
    inset: 0;
    z-index: 1;
    overflow: hidden;
  }

  .vb-player iframe,
  .vb-player video {
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  }

  .vb-player.vb-fit-box iframe,
  .vb-player.vb-fit-box video {
    width: 100% !important;
    height: 100% !important;
    top: 0;
    left: 0;
    transform: none;
  }

  .vb-poster {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    z-index: 0;
  }

  .vb-overlay {
    position: absolute;
    inset: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--vb-overlay-bg, transparent);
    pointer-events: auto;
  }

  .vb-controls {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 3;
    display: flex;
    align-items: center;
    gap: 6px;
    pointer-events: auto;
  }

  .vb-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--vb-controls-size, 36px);
    height: var(--vb-controls-size, 36px);
    border-radius: 50%;
    border: none;
    background: var(--vb-controls-bg, rgba(0, 0, 0, 0.5));
    color: var(--vb-controls-color, #fff);
    cursor: pointer;
    padding: 0;
    filter: drop-shadow(0px 0px 1px rgba(0,0,0,0.5));
    opacity: 1;
    transition: opacity 250ms ease-in-out;
  }

  .vb-btn:hover { opacity: 0.7; }

  .vb-btn:focus-visible {
    outline: 2px solid var(--vb-controls-color, #fff);
    outline-offset: 2px;
  }

  .vb-btn svg {
    width: calc(var(--vb-controls-size, 36px) * 0.55);
    height: calc(var(--vb-controls-size, 36px) * 0.55);
  }

  /* Seek bar */
  .vb-seek-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: var(--vb-seek-bg, rgba(255, 255, 255, 0.4));
    z-index: 2;
    pointer-events: auto;
  }

  .vb-seek-progress {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    overflow: hidden;
    background: transparent !important;
    border: 0;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 1;
  }

  .vb-seek-progress::-webkit-progress-bar { background: transparent; }

  .vb-seek-progress::-webkit-progress-value {
    background: var(--vb-seek-progress-bg, #fff);
  }

  .vb-seek-progress::-moz-progress-bar {
    background: var(--vb-seek-progress-bg, #fff);
  }

  .vb-seek-range {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    position: absolute;
    top: calc(50% - 10px);
    left: 0;
    z-index: 2;
    display: block;
    width: 100%;
    height: 20px;
    margin: 0;
    cursor: pointer;
    background: transparent;
  }

  .vb-seek-range::-webkit-slider-runnable-track {
    -webkit-appearance: none;
    height: 6px;
    background: transparent;
    border: 0;
  }

  .vb-seek-range::-moz-range-track {
    width: 100%;
    height: 6px;
    background: transparent;
    border: 0;
  }

  .vb-seek-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    margin-top: 3px;
    cursor: pointer;
    background: var(--vb-seek-thumb-color, #fff);
    border: 0;
    border-radius: 50%;
    transform: translateY(-50%);
    opacity: 0;
    transition: opacity 0.4s ease-in-out;
  }

  .vb-seek-range::-moz-range-thumb {
    width: 12px;
    height: 12px;
    cursor: pointer;
    background: var(--vb-seek-thumb-color, #fff);
    border: 0;
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.4s ease-in-out;
  }

  .vb-seek-bar:hover .vb-seek-range::-webkit-slider-thumb { opacity: 1; }
  .vb-seek-bar:hover .vb-seek-range::-moz-range-thumb { opacity: 1; }
`;
