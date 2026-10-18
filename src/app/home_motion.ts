/**
 * Home page motion for Suraksha Software.
 *
 * - Pure TypeScript, no animation library.
 * - Nothing is hidden unless this code runs AND the visitor has not asked for
 *   reduced motion, so the page is always readable.
 * - Call initHomeMotion() after the home page has rendered. It returns a
 *   cleanup function that undoes everything it changed.
 */

type Group = {
  box: string;      // the element whose visibility triggers the reveal
  items: string;    // the elements inside it that animate
  variant?: string; // up | left | right | scale | fade | words
  base?: number;    // delay of the first item (ms)
  step?: number;    // extra delay per item (ms)
};

const GROUPS: Group[] = [
  { box: '.credibility-strip', items: ':scope > div', step: 90 },
  { box: '.section-heading', items: '.eyebrow, h2, .text-link', step: 90 },
  { box: '.service-grid', items: ':scope > .service-card', step: 70 },
  { box: '.dark-band', items: '.split-feature > div:first-child > *', step: 100 },
  { box: '.principles', items: ':scope > div', variant: 'right', base: 150, step: 110 },
  { box: '.portfolio-grid', items: ':scope > .portfolio-card', step: 100 },
  { box: '.process-row', items: ':scope > .process-step', variant: 'step', step: 150 },
  { box: '.technology-row', items: ':scope > div', step: 80 },
  { box: '.training-band', items: '.split-feature > div:first-child > *', step: 100 },
  { box: '.course-mini-grid', items: ':scope > a', base: 120, step: 100 },
  { box: '.faq-list', items: ':scope > details', step: 90 },
  { box: '.final-cta-inner', items: ':scope > div > *, :scope > a', step: 110 },
];

export function initHomeMotion(): () => void {
  const noop = () => {};
  if (typeof window === 'undefined') return noop;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return noop;

  const main = document.querySelector<HTMLElement>('main');
  const hero = main?.querySelector<HTMLElement>('.hero');
  if (!main || !hero) return noop;

  const cleanups: Array<() => void> = [];
  const boxes = new Map<Element, HTMLElement[]>();

  const register = (
    boxSelector: string, itemSelector: string, variant = 'up', base = 0, step = 90
  ): void => {
    main.querySelectorAll(boxSelector).forEach(box => {
      const items = Array.from(box.querySelectorAll<HTMLElement>(itemSelector));
      items.forEach((item, index) => {
        item.setAttribute('data-m', variant);
        item.style.setProperty('--d', `${base + index * step}ms`);
        if (variant === 'step') item.style.setProperty('--i', String(index));
      });
      boxes.set(box, [...(boxes.get(box) ?? []), ...items]);
    });
  };

  try {
    /* ---------- Hero ---------- */
    const wordCount = splitHeadline(hero.querySelector<HTMLElement>('.hero-copy > h1'));
    const t = 140 + wordCount * 55;
    register('.hero', '.hero-copy > .eyebrow', 'up', 0, 0);
    register('.hero', '.hero-copy > h1', 'words', 0, 0);
    register('.hero', '.hero-copy > .lead', 'up', t, 0);
    register('.hero', '.hero-copy > .hero-actions', 'up', t + 110, 0);
    register('.hero', '.hero-copy > .hero-note', 'up', t + 220, 0);
    register('.hero', '.hero-visual', 'scale', 220, 0);

    /* ---------- Sections below the hero ---------- */
    for (const group of GROUPS) {
      register(group.box, group.items, group.variant, group.base ?? 0, group.step ?? 90);
    }

    /* ---------- Turn the hidden starting state on, then reveal on scroll ---------- */
    main.classList.add('motion-on');
    void main.offsetHeight; // lock in the starting state so the first reveal animates

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          boxes.get(entry.target)?.forEach(item => item.classList.add('in'));
          observer.unobserve(entry.target);
        }
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      boxes.forEach((_items, box) => observer.observe(box));
      cleanups.push(() => observer.disconnect());
    } else {
      boxes.forEach(items => items.forEach(item => item.classList.add('in')));
    }

    /* ---------- Scroll progress bar + header shadow + hero depth ---------- */
    const progress = document.createElement('div');
    progress.className = 'scroll-progress';
    progress.setAttribute('aria-hidden', 'true');
    document.body.appendChild(progress);
    cleanups.push(() => progress.remove());

    const header = document.querySelector<HTMLElement>('.site-header');
    const heroVisual = hero.querySelector<HTMLElement>('.hero-visual');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    let mouseX = 0, mouseY = 0, currentX = 0, currentY = 0;
    let scrollTarget = 0, scrollCurrent = 0;
    let frame = 0;

    const render = (): void => {
      frame = 0;
      currentX += (mouseX - currentX) * 0.08;
      currentY += (mouseY - currentY) * 0.08;
      scrollCurrent += (scrollTarget - scrollCurrent) * 0.14;
      heroVisual?.style.setProperty('--px', currentX.toFixed(3));
      heroVisual?.style.setProperty('--py', currentY.toFixed(3));
      heroVisual?.style.setProperty('--sy', scrollCurrent.toFixed(3));
      const settled = Math.abs(mouseX - currentX) < 0.002 && Math.abs(mouseY - currentY) < 0.002
        && Math.abs(scrollTarget - scrollCurrent) < 0.002;
      if (!settled) frame = requestAnimationFrame(render);
    };
    const schedule = (): void => { if (!frame) frame = requestAnimationFrame(render); };

    const onScroll = (): void => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      progress.style.transform = `scaleX(${ratio.toFixed(4)})`;
      header?.classList.toggle('is-scrolled', window.scrollY > 8);
      scrollTarget = Math.min(1, window.scrollY / Math.max(1, hero.offsetHeight));
      schedule();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
    cleanups.push(() => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      header?.classList.remove('is-scrolled');
      if (frame) cancelAnimationFrame(frame);
    });

    /* ---------- Pointer effects (mouse devices only) ---------- */
    if (finePointer) {
      const onHeroMove = (event: PointerEvent): void => {
        const rect = hero.getBoundingClientRect();
        mouseX = (event.clientX - rect.left) / rect.width - 0.5;
        mouseY = (event.clientY - rect.top) / rect.height - 0.5;
        schedule();
      };
      const onHeroLeave = (): void => { mouseX = 0; mouseY = 0; schedule(); };
      hero.addEventListener('pointermove', onHeroMove);
      hero.addEventListener('pointerleave', onHeroLeave);
      cleanups.push(() => {
        hero.removeEventListener('pointermove', onHeroMove);
        hero.removeEventListener('pointerleave', onHeroLeave);
      });

      // Soft light that follows the cursor on service cards
      const onCardMove = (event: PointerEvent): void => {
        const card = (event.target as HTMLElement).closest<HTMLElement>('.service-card');
        if (!card) return;
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
        card.style.setProperty('--my', `${event.clientY - rect.top}px`);
      };
      main.addEventListener('pointermove', onCardMove);
      cleanups.push(() => main.removeEventListener('pointermove', onCardMove));

      // Gentle magnetic pull on the main call-to-action buttons
      const magnetSelector = '.hero-actions .button, .final-cta .button';
      const onMagnetMove = (event: PointerEvent): void => {
        const button = (event.target as HTMLElement).closest<HTMLElement>(magnetSelector);
        if (!button) return;
        const rect = button.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        button.style.translate = `${(dx * 0.14).toFixed(1)}px ${(dy * 0.24).toFixed(1)}px`;
      };
      const onMagnetLeave = (event: PointerEvent): void => {
        const button = (event.target as HTMLElement).closest<HTMLElement>(magnetSelector);
        if (button) button.style.translate = '';
      };
      main.addEventListener('pointermove', onMagnetMove);
      main.addEventListener('pointerout', onMagnetLeave);
      cleanups.push(() => {
        main.removeEventListener('pointermove', onMagnetMove);
        main.removeEventListener('pointerout', onMagnetLeave);
      });
    }
  } catch {
    // If anything goes wrong, fall back to the normal static page.
    main.classList.remove('motion-on');
  }

  return () => {
    cleanups.forEach(cleanup => cleanup());
    main.classList.remove('motion-on');
  };
}

/**
 * Splits the hero headline into words so each word can rise into place.
 * Keeps the <em> styling and keeps the full sentence for screen readers.
 * Returns the number of words.
 */
function splitHeadline(heading: HTMLElement | null): number {
  if (!heading || heading.querySelector('.w')) return 0;
  const copy = heading.cloneNode(true) as HTMLElement;
  copy.querySelectorAll('br').forEach(lineBreak => lineBreak.replaceWith(' '));
  heading.setAttribute('aria-label', (copy.textContent ?? '').replace(/\s+/g, ' ').trim());
  let count = 0;

  const wrap = (node: Node): void => {
    if (node.nodeType === Node.TEXT_NODE) {
      const parts = (node.textContent ?? '').split(/(\s+)/);
      const fragment = document.createDocumentFragment();
      for (const part of parts) {
        if (!part) continue;
        if (/^\s+$/.test(part)) { fragment.appendChild(document.createTextNode(' ')); continue; }
        const outer = document.createElement('span');
        outer.className = 'w';
        outer.setAttribute('aria-hidden', 'true');
        const inner = document.createElement('span');
        inner.className = 'wi';
        inner.style.setProperty('--wd', `${140 + count * 55}ms`);
        inner.textContent = part;
        outer.appendChild(inner);
        fragment.appendChild(outer);
        count++;
      }
      node.parentNode?.replaceChild(fragment, node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      Array.from(node.childNodes).forEach(wrap);
    }
  };
  Array.from(heading.childNodes).forEach(wrap);
  return count;
}