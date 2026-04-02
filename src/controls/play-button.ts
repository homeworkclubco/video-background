import type { BaseProvider } from '../providers/base-provider.js';
import { playIcon, pauseIcon } from '../icons.js';

export function createPlayButton(provider: BaseProvider, hostElement: HTMLElement): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.className = 'vb-btn vb-play-btn';
  btn.setAttribute('part', 'play-btn');
  btn.setAttribute('role', 'switch');
  btn.setAttribute('aria-pressed', String(!provider.paused));
  btn.setAttribute('aria-label', provider.paused ? 'Play' : 'Pause');
  btn.innerHTML = provider.paused ? playIcon : pauseIcon;

  function updateState(): void {
    const isPlaying = provider.currentState === 'playing';
    btn.innerHTML = isPlaying ? pauseIcon : playIcon;
    btn.setAttribute('aria-pressed', String(isPlaying));
    btn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
  }

  btn.addEventListener('click', () => {
    if (provider.currentState === 'playing') {
      provider.pause();
    } else {
      provider.play();
    }
  });

  hostElement.addEventListener('vb-play', updateState);
  hostElement.addEventListener('vb-pause', updateState);
  hostElement.addEventListener('vb-ended', updateState);

  return btn;
}
