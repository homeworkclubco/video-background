import type { BaseProvider } from '../providers/base-provider.js';
import { volumeIcon, volumeMuteIcon } from '../icons.js';

export function createMuteButton(provider: BaseProvider, hostElement: HTMLElement): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.className = 'vb-btn vb-mute-btn';
  btn.setAttribute('part', 'mute-btn');
  btn.setAttribute('role', 'switch');
  btn.setAttribute('aria-pressed', String(provider.muted));
  btn.setAttribute('aria-label', provider.muted ? 'Unmute' : 'Mute');
  btn.innerHTML = provider.muted ? volumeMuteIcon : volumeIcon;

  function updateState(): void {
    btn.innerHTML = provider.muted ? volumeMuteIcon : volumeIcon;
    btn.setAttribute('aria-pressed', String(provider.muted));
    btn.setAttribute('aria-label', provider.muted ? 'Unmute' : 'Mute');
  }

  btn.addEventListener('click', () => {
    if (provider.muted) {
      provider.unmute();
    } else {
      provider.mute();
    }
    updateState();
  });

  hostElement.addEventListener('vb-mute', updateState);
  hostElement.addEventListener('vb-unmute', updateState);

  return btn;
}
