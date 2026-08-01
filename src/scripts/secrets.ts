/**
 * Easter-egg triggers — the only arcade code loaded up front.
 *
 * Three secrets, each hidden in plain sight:
 *   1. Type "snake" anywhere (not in a form field)   → snake.exe
 *   2. Click a project card's window dots r → y → g  → breakout.exe
 *   3. The Konami code: ↑↑↓↓←→←→ B A                 → invaders.exe
 *
 * The arcade module itself (games, canvas, audio) is dynamically
 * imported on first discovery, so it costs nothing until found.
 */

import type { GameId } from './arcade';

export function initSecrets(): void {
  let opening = false;

  const open = async (id: GameId): Promise<void> => {
    if (opening || document.body.classList.contains('arcade-open')) return;
    opening = true;
    try {
      const { openArcade } = await import('./arcade');
      openArcade(id);
    } finally {
      opening = false;
    }
  };

  // --- 1 & 3: keyboard secrets ---------------------------------------
  const KONAMI = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA',
  ];
  let konamiIdx = 0;
  let typed = '';

  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    // Neither window shares the page's keyboard: the arcade owns its keys,
    // and the shell has its own prompt for these same secrets.
    if (document.body.classList.contains('arcade-open')) return;
    if (document.body.classList.contains('shell-open')) return;
    const t = e.target;
    if (
      t instanceof HTMLInputElement ||
      t instanceof HTMLTextAreaElement ||
      (t instanceof HTMLElement && t.isContentEditable)
    ) {
      return;
    }

    konamiIdx = e.code === KONAMI[konamiIdx] ? konamiIdx + 1 : e.code === KONAMI[0] ? 1 : 0;
    if (konamiIdx === KONAMI.length) {
      konamiIdx = 0;
      void open('invaders');
      return;
    }

    if (/^[a-z]$/i.test(e.key)) {
      typed = (typed + e.key.toLowerCase()).slice(-8);
      if (typed.endsWith('snake')) {
        typed = '';
        void open('snake');
      }
    }
  });

  // --- 2: the traffic-light dots on a project card --------------------
  let seq = '';
  let seqBar: Element | null = null;
  let seqTimer = 0;

  document.addEventListener('click', (e) => {
    if (!(e.target instanceof Element)) return;
    const dot = e.target.closest('.dot');
    // Only the project cards arm this. Window chrome elsewhere (the arcade,
    // the terminal) reuses .dot for looks, and clicking those must not
    // count as the sequence.
    const bar = dot?.closest('.card__bar');
    if (!dot || !bar) return;
    const color = dot.classList.contains('dot--r')
      ? 'r'
      : dot.classList.contains('dot--y')
        ? 'y'
        : dot.classList.contains('dot--g')
          ? 'g'
          : '';
    if (!color) return;

    if (bar !== seqBar) {
      seqBar = bar;
      seq = '';
    }
    window.clearTimeout(seqTimer);
    seqTimer = window.setTimeout(() => {
      seq = '';
      seqBar = null;
    }, 2500);

    seq += color;
    if (!'ryg'.startsWith(seq)) seq = color === 'r' ? 'r' : '';
    if (seq === 'ryg') {
      seq = '';
      void open('breakout');
    }
  });
}
