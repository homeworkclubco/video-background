import type { BaseProvider } from '../providers/base-provider.js';

export function createSeekBar(provider: BaseProvider, hostElement: HTMLElement): HTMLDivElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'vb-seek-bar';
  wrapper.setAttribute('part', 'seek-bar');

  const progress = document.createElement('progress');
  progress.className = 'vb-seek-progress';
  progress.setAttribute('min', '0');
  progress.setAttribute('max', '100');
  progress.value = 0;
  progress.setAttribute('aria-hidden', 'true');

  const range = document.createElement('input');
  range.type = 'range';
  range.className = 'vb-seek-range';
  range.setAttribute('aria-label', 'Seek');
  range.min = '0';
  range.max = '100';
  range.step = '0.1';
  range.value = '0';

  wrapper.appendChild(progress);
  wrapper.appendChild(range);

  let locked = false;
  let rafId: number | null = null;

  function update(pct: number): void {
    progress.value = pct;
    range.value = String(pct);
  }

  range.addEventListener('input', () => {
    locked = true;
    progress.value = parseFloat(range.value);
  });

  range.addEventListener('change', () => {
    provider.seek(parseFloat(range.value));
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => { locked = false; rafId = null; });
  });

  hostElement.addEventListener('vb-timeupdate', () => {
    if (!locked) update(provider.percentComplete);
  });

  hostElement.addEventListener('vb-ended', () => { update(0); });

  return wrapper;
}
