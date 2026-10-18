/**
 * Re-triggerable full-page motion for Suraksha Software (All Pages).
 *
 * - Pure TypeScript, no animation library.
 * - Triggers animations EVERY TIME elements scroll into view (up or down).
 */

type Group = {
  box: string;
  items: string;
  variant?: string;
  base?: number;
  step?: number;
};

const GROUPS: Group[] = [
  { box: '.credibility-strip', items: ':scope > div', variant: 'up', base: 40, step: 85 },
  { box: '.section-heading', items: '.eyebrow, .text-link', variant: 'blur-up', base: 0, step: 90 },
  { box: '.service-grid', items: ':scope > .service-card', variant: 'up', base: 40, step: 75 },
  { box: '.dark-band .split-feature > div:first-child', items: '.eyebrow, .light-copy, .button', variant: 'blur-up', base: 40, step: 95 },
  { box: '.principles', items: ':scope > div', variant: 'right', base: 100, step: 95 },
  { box: '.training-band .split-feature > div:first-child', items: '.eyebrow, .light-copy, .button', variant: 'blur-up', base: 40, step: 95 },
  { box: '.course-mini-grid', items: ':scope > a', variant: 'scale', base: 90, step: 85 },
  { box: '.portfolio-grid', items: ':scope > .portfolio-card', variant: 'up', base: 40, step: 90 },
  { box: '.portfolio-card .project-info', items: '.eyebrow, h3, p, h4, ul > li, .tech-tags > span', variant: 'blur-up', base: 80, step: 45 },
  { box: '.process-row', items: ':scope > .process-step', variant: 'step', base: 40, step: 110 },
  { box: '.process-list', items: ':scope > article', variant: 'step', base: 40, step: 95 },
  { box: '.technology-row', items: ':scope > div', variant: 'up', base: 40, step: 80 },
  { box: '.tech-cards', items: ':scope > article', variant: 'up', base: 40, step: 80 },
  { box: '.detail-layout > div:first-child', items: '.eyebrow, .detail-copy, .check-row', variant: 'blur-up', base: 30, step: 65 },
  { box: '.module-list', items: ':scope > div', variant: 'right', base: 40, step: 60 },
  { box: '.detail-aside', items: 'h3, p, .check-row, .tech-tags > span, .small-note', variant: 'right', base: 70, step: 45 },
  { box: '.related-links', items: '.eyebrow, .related-pills > a', variant: 'up', base: 30, step: 55 },
  { box: '.course-grid', items: ':scope > .course-card', variant: 'up', base: 40, step: 70 },
  { box: '.training-roadmap', items: ':scope > .eyebrow, :scope > .disclaimer', variant: 'blur-up', base: 30, step: 80 },
  { box: '.roadmap-grid', items: ':scope > div', variant: 'up', base: 60, step: 90 },
  { box: '.course-cta, .final-cta-inner', items: '.eyebrow, p, .button', variant: 'blur-up', base: 40, step: 85 },
  { box: '.contact-aside', items: '.eyebrow, p, .contact-promise, .text-link', variant: 'blur-up', base: 40, step: 80 },
  { box: '.enquiry-form', items: '.form-row > label, label:not(.honeypot), .form-submit, .small-note', variant: 'up', base: 60, step: 55 },
  { box: '.legal-copy', items: 'p', variant: 'blur-up', base: 20, step: 45 },
];

export function initHomeMotion(): () => void {
  const noop = () => {};
  if (typeof window === 'undefined') return noop;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return noop;

  const main = document.querySelector<HTMLElement>('main');
  const footer = document.querySelector<HTMLElement>('.site-footer');
  if (!main) return noop;

  const cleanups: Array<() => void> = [];
  const triggerMap = new Map<Element, HTMLElement[]>();

  const bindTrigger = (trigger: Element, item: HTMLElement): void => {
    const list = triggerMap.get(trigger);
    if (list) {
      if (!list.includes(item)) list.push(item);
    } else {
      triggerMap.set(trigger, [item]);
    }
  };

  const register = (boxSelector: string, itemSelector: string, variant = 'up', base = 0, step = 80, rootEl: ParentNode = main): void => {
    rootEl.querySelectorAll<HTMLElement>(boxSelector).forEach(box => {
      const items = itemSelector === ':scope' ? [box] : Array.from(box.querySelectorAll<HTMLElement>(itemSelector));
      if (!items.length) return;
      const observeIndividually = box.offsetHeight > window.innerHeight * 0.65;
      items.forEach((item, index) => {
        item.setAttribute('data-m', variant);
        const delay = observeIndividually ? Math.min((index % 5) * step, 260) : Math.min(base + index * step, 680);
        item.style.setProperty('--d', `${delay}ms`);
        if (variant === 'step') item.style.setProperty('--i', String(index));
        bindTrigger(observeIndividually ? item : box, item);
      });
    });
  };

  try {
    // Register Hero and Headings
    const hero = main.querySelector<HTMLElement>('.hero');
    if (hero) {
      const wordCount = splitHeadline(hero.querySelector<HTMLElement>('.hero-copy > h1'));
      const t = 120 + wordCount * 50;
      register('.hero', '.hero-copy > .eyebrow', 'blur-up', 0, 0);
      register('.hero', '.hero-copy > h1', 'words', 0, 0);
      register('.hero', '.hero-copy > .lead', 'blur-up', t, 0);
      register('.hero', '.hero-copy > .hero-actions > *', 'up', t + 90, 90);
      register('.hero', '.hero-copy > .hero-note', 'blur-up', t + 210, 0);
      register('.hero', '.hero-visual', 'scale', 180, 0);
    }

    const pageHero = main.querySelector<HTMLElement>('.page-hero');
    if (pageHero) {
      const wordCount = splitHeadline(pageHero.querySelector<HTMLElement>('h1'));
      const t = 120 + wordCount * 50;
      register('.page-hero', ':scope > .breadcrumb', 'blur-up', 0, 0);
      register('.page-hero', ':scope > .eyebrow', 'blur-up', 40, 0);
      register('.page-hero', ':scope > h1', 'words', 0, 0);
      register('.page-hero', ':scope > .lead', 'blur-up', t, 0);
      register('.page-hero', ':scope > .button', 'up', t + 100, 0);
    }

    const trainingHero = main.querySelector<HTMLElement>('.training-hero');
    if (trainingHero) {
      const wordCount = splitHeadline(trainingHero.querySelector<HTMLElement>('h1'));
      const t = 120 + wordCount * 50;
      register('.training-hero', ':scope > div:first-child > .eyebrow', 'blur-up', 0, 0);
      register('.training-hero', ':scope > div:first-child > h1', 'words', 0, 0);
      register('.training-hero', ':scope > div:first-child > .lead', 'blur-up', t, 0);
      register('.training-hero', ':scope > div:first-child > .button', 'up', t + 100, 0);
      register('.training-hero', ':scope > .training-card-art', 'scale', 180, 0);
    }

    const notFoundHero = main.querySelector<HTMLElement>('.not-found');
    if (notFoundHero) {
      const wordCount = splitHeadline(notFoundHero.querySelector<HTMLElement>('h1'));
      const t = 120 + wordCount * 50;
      register('.not-found', ':scope > span', 'scale', 0, 0);
      register('.not-found', ':scope > .eyebrow', 'blur-up', 80, 0);
      register('.not-found', ':scope > h1', 'words', 0, 0);
      register('.not-found', ':scope > p:not(.eyebrow)', 'blur-up', t, 0);
      register('.not-found', ':scope > .hero-actions > *', 'up', t + 90, 75);
    }

    main.querySelectorAll<HTMLElement>('h2').forEach(h2 => {
      if (h2.closest('.process-list, .tech-cards')) return;
      splitHeadline(h2, 60, 42);
      h2.setAttribute('data-m', 'words');
      h2.style.setProperty('--d', '0ms');
      bindTrigger(h2, h2);
    });

    for (const group of GROUPS) {
      register(group.box, group.items, group.variant ?? 'up', group.base ?? 0, group.step ?? 80);
    }

    main.querySelectorAll<HTMLElement>('.disclaimer, .support-note').forEach(note => {
      if (!note.hasAttribute('data-m')) {
        note.setAttribute('data-m', 'blur-up');
        note.style.setProperty('--d', '90ms');
        bindTrigger(note, note);
      }
    });

    if (footer) {
      footer.classList.add('motion-on');
      register('.footer-grid', ':scope > div', 'up', 0, 90, footer);
      register('.footer-bottom', ':scope > *', 'fade', 120, 80, footer);
      cleanups.push(() => footer.classList.remove('motion-on'));
    }

    main.classList.add('motion-on');
    void main.offsetHeight;

    if ('IntersectionObserver' in window) {
      // Re-triggerable IntersectionObserver: adds '.in' when entering, removes '.in' when leaving
      const observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          const items = triggerMap.get(entry.target);
          if (!items) continue;
          if (entry.isIntersecting) {
            items.forEach(item => item.classList.add('in'));
          } else {
            items.forEach(item => item.classList.remove('in'));
          }
        }
      }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });

      triggerMap.forEach((_items, trigger) => observer.observe(trigger));
      cleanups.push(() => observer.disconnect());
    } else {
      triggerMap.forEach(items => items.forEach(item => item.classList.add('in')));
    }

    // Scroll progress & interactive depth
    const progress = document.createElement('div');
    progress.className = 'scroll-progress';
    progress.setAttribute('aria-hidden', 'true');
    document.body.appendChild(progress);
    cleanups.push(() => progress.remove());

    const header = document.querySelector<HTMLElement>('.site-header');
    const activeHero = hero ?? trainingHero ?? pageHero ?? notFoundHero;
    const interactiveVisual = main.querySelector<HTMLElement>('.hero-visual, .training-card-art');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    let mouseX = 0, mouseY = 0, currentX = 0, currentY = 0;
    let scrollTarget = 0, scrollCurrent = 0;
    let frame = 0;

    const render = (): void => {
      frame = 0;
      currentX += (mouseX - currentX) * 0.08;
      currentY += (mouseY - currentY) * 0.08;
      scrollCurrent += (scrollTarget - scrollCurrent) * 0.14;
      interactiveVisual?.style.setProperty('--px', currentX.toFixed(3));
      interactiveVisual?.style.setProperty('--py', currentY.toFixed(3));
      interactiveVisual?.style.setProperty('--sy', scrollCurrent.toFixed(3));
      const settled = Math.abs(mouseX - currentX) < 0.002 && Math.abs(mouseY - currentY) < 0.002 && Math.abs(scrollTarget - scrollCurrent) < 0.002;
      if (!settled) frame = requestAnimationFrame(render);
    };
    const schedule = (): void => { if (!frame) frame = requestAnimationFrame(render); };

    const onScroll = (): void => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      progress.style.transform = `scaleX(${ratio.toFixed(4)})`;
      header?.classList.toggle('is-scrolled', window.scrollY > 8);
      if (activeHero) {
        scrollTarget = Math.min(1, window.scrollY / Math.max(1, activeHero.offsetHeight));
        schedule();
      }
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

    if (finePointer && activeHero && interactiveVisual) {
      const onHeroMove = (event: PointerEvent): void => {
        const rect = activeHero.getBoundingClientRect();
        mouseX = (event.clientX - rect.left) / rect.width - 0.5;
        mouseY = (event.clientY - rect.top) / rect.height - 0.5;
        schedule();
      };
      const onHeroLeave = (): void => { mouseX = 0; mouseY = 0; schedule(); };
      activeHero.addEventListener('pointermove', onHeroMove);
      activeHero.addEventListener('pointerleave', onHeroLeave);
      cleanups.push(() => {
        activeHero.removeEventListener('pointermove', onHeroMove);
        activeHero.removeEventListener('pointerleave', onHeroLeave);
      });
    }
  } catch {
    main.classList.remove('motion-on');
    footer?.classList.remove('motion-on');
  }

  return () => {
    cleanups.forEach(cleanup => cleanup());
    main.classList.remove('motion-on');
    footer?.classList.remove('motion-on');
  };
}

function splitHeadline(heading: HTMLElement | null, baseDelay = 120, wordStep = 50): number {
  if (!heading) return 0;
  const existingWords = heading.querySelectorAll('.w');
  if (existingWords.length > 0) return existingWords.length;

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
        inner.style.setProperty('--wd', `${baseDelay + count * wordStep}ms`);
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