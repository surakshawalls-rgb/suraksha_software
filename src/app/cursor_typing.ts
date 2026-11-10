/**
 * "Many small cursors typing" animation for the whole website.
 *
 * What the visitor sees:
 * - Small coloured cursors (with a name tag, like a team editing a document together)
 *   fly in, type every heading / paragraph / button / link letter by letter, and fly away.
 * - Images, illustrations and the hero/browser mock-ups are "drawn in" by a cursor that
 *   drags a blue selection box from the top-left corner to the bottom-right corner.
 *
 * How it works, in plain terms:
 * - It never changes your text. Each text block is simply hidden with a CSS clip-path and
 *   then uncovered a little at a time, following the typing cursor. When it finishes, the
 *   clip-path is removed, so the page ends up exactly as Angular rendered it.
 * - A block only starts typing when it scrolls into view (IntersectionObserver).
 * - New pages / new sections are found automatically (MutationObserver), like word_hover.ts.
 * - Skipped for visitors who asked for reduced motion. If anything goes wrong, everything
 *   is revealed immediately, so a cosmetic effect can never hide your content.
 *
 * The styles for the cursors are added from this file, so you do NOT need to edit app.css.
 */

// ===================== SETTINGS YOU CAN CHANGE =====================
const ENABLED = true;            // set to false to switch the whole effect off
const CURSORS_DESKTOP = 7;       // how many cursors on laptop / desktop
const CURSORS_MOBILE = 4;        // how many cursors on phones / tablets
const MS_PER_CHARACTER = 13;     // typing speed (smaller = faster)
const MIN_TYPING_MS = 260;       // shortest time a block takes to type
const MAX_TYPING_MS = 1700;      // longest time a block takes to type
const SHOW_SELECTION_BOXES = true; // thin blue box around the block being typed

const CURSOR_LABEL = 'Suraksha AI'; // the name tag shown next to EVERY cursor
const CURSOR_COLORS = [            // one colour per cursor (labels are all the same)
  '#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444', '#84cc16'
];

// Things that are "drawn in" with a dragged selection box instead of being typed.
const VISUAL_SELECTOR =
  'img,picture,video,canvas,.cs-visual,.sh-browser,.sh-hero-visual,.hero-visual,' +
  '.training-card-art,.devflow-visual,.sh-card-art,.sh-marquee-wrap';

// Text that must never be typed (hidden helpers, form fields, icons, rotating words...).
const TEXT_SKIP =
  'script,style,noscript,textarea,input,select,option,svg,.ct-layer,.sh-sr,.honeypot,' +
  '.scroll-progress,.sh-rot,[hidden],.no-type,hw-s';

// Small wrappers made by word_hover.ts / home_motion.ts; the real block is the parent.
const WORD_WRAPPERS = 'hw-w,hw-g,hw-s,.w,.wi';
// ===================================================================

const STYLES = `
[data-ct="0"]{clip-path:inset(0 100% 100% 0)!important}
.ct-layer{position:fixed;inset:0;z-index:9998;pointer-events:none;overflow:hidden}
.ct-c{position:absolute;left:0;top:0;opacity:0;transition:opacity .3s ease;will-change:transform}
.ct-bar{position:absolute;left:-1px;bottom:0;width:2px;height:var(--h,18px);border-radius:1px;background:var(--c);animation:ctBlink .7s steps(2,start) infinite}
.ct-arrow{position:absolute;left:0;top:1px;width:16px;height:16px;fill:var(--c);stroke:#fff;stroke-width:1;stroke-linejoin:round;filter:drop-shadow(0 1px 2px rgba(0,0,0,.45))}
.ct-tag{position:absolute;left:11px;top:15px;padding:2px 7px;border-radius:999px;background:var(--c);color:#fff;font:600 10.5px/1.4 system-ui,-apple-system,'Segoe UI',sans-serif;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.35)}
.ct-box{position:absolute;left:0;top:0;border:1.5px solid var(--c);box-sizing:border-box;transition:opacity .4s ease}
.ct-box::before{content:"";position:absolute;inset:0;background:var(--c);opacity:.07}
.ct-box i{position:absolute;width:7px;height:7px;box-sizing:border-box;background:#fff;border:1.5px solid var(--c)}
.ct-box i:nth-child(1){left:-4px;top:-4px}
.ct-box i:nth-child(2){right:-4px;top:-4px}
.ct-box i:nth-child(3){left:-4px;bottom:-4px}
.ct-box i:nth-child(4){right:-4px;bottom:-4px}
@keyframes ctBlink{to{visibility:hidden}}
@media (max-width:640px){.ct-tag{font-size:9.5px;padding:1px 6px}}
`;

type Kind = 'text' | 'visual';
type State = 'idle' | 'queued' | 'running' | 'done';
interface Target { el: HTMLElement; kind: Kind; state: State; }
interface Rect { left: number; right: number; top: number; bottom: number; }
interface Cursor {
  el: HTMLElement; color: string;
  x: number; y: number; tx: number; ty: number;
  follow: number; shown: boolean; busy: boolean; idleAt: number;
}
interface Job {
  target: Target; cursor: Cursor; phase: 'fly' | 'type';
  startedAt: number; duration: number;
  chars: Array<{ node: Text; offset: number }>;
  range: Range; box: HTMLElement | null; lastRect: Rect | null;
}

export function initCursorTyping(): () => void {
  const noop = () => {};
  if (!ENABLED || typeof window === 'undefined' || typeof document === 'undefined') return noop;
  if (typeof window.matchMedia !== 'function' || !('IntersectionObserver' in window)) return noop;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return noop;

  const isTouch = !window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const cursorCount = isTouch ? CURSORS_MOBILE : CURSORS_DESKTOP;

  const style = document.createElement('style');
  style.setAttribute('data-cursor-typing', '');
  style.textContent = STYLES;
  document.head.appendChild(style);

  const layer = document.createElement('div');
  layer.className = 'ct-layer';
  layer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(layer);

  const known = new WeakSet<Element>();      // blocks we have already looked at
  const visualSet = new WeakSet<Element>();  // blocks treated as pictures
  const targets = new Map<Element, Target>();
  const hidden = new Set<HTMLElement>();     // blocks currently hidden by us
  const queue: Target[] = [];
  const jobs: Job[] = [];
  let raf = 0;
  let last = 0;
  let stopped = false;

  // ---------- cursors ----------
  const cursors: Cursor[] = Array.from({ length: cursorCount }, (_, i) => {
    const color = CURSOR_COLORS[i % CURSOR_COLORS.length];
    const el = document.createElement('div');
    el.className = 'ct-c';
    el.style.setProperty('--c', color);
    el.innerHTML =
      '<i class="ct-bar"></i>' +
      '<svg class="ct-arrow" viewBox="0 0 16 16" aria-hidden="true">' +
      '<path d="M1 1 L1 13 L4.2 10.2 L6.4 15 L8.6 14 L6.4 9.3 L10.8 9.3 Z"/></svg>' +
      `<span class="ct-tag">${CURSOR_LABEL}</span>`;
    layer.appendChild(el);
    return { el, color, x: -50, y: -50, tx: -50, ty: -50, follow: 0.2, shown: false, busy: false, idleAt: 0 };
  });

  // ---------- helpers ----------
  const insideVisual = (start: Element | null): boolean => {
    for (let p = start; p; p = p.parentElement) {
      if (visualSet.has(p) || p.matches(VISUAL_SELECTOR)) return true;
    }
    return false;
  };

  const usable = (node: Text): boolean => {
    const parent = node.parentElement;
    if (!parent || !/\S/.test(node.nodeValue ?? '')) return false;
    if (parent.closest(TEXT_SKIP)) return false;
    return !insideVisual(parent);
  };

  const containerOf = (node: Text, root: Element, cache: Map<Element, HTMLElement | null>): HTMLElement | null => {
    const parent = node.parentElement;
    if (!parent) return null;
    if (cache.has(parent)) return cache.get(parent) ?? null;
    let found: HTMLElement | null = null;
    for (let el: HTMLElement | null = parent; el && el !== root; el = el.parentElement) {
      if (el.matches(WORD_WRAPPERS)) continue;
      const display = getComputedStyle(el).display;
      if (display !== 'inline' && display !== 'contents') { found = el; break; }
    }
    cache.set(parent, found);
    return found;
  };

  const collectChars = (el: HTMLElement): Array<{ node: Text; offset: number }> => {
    const out: Array<{ node: Text; offset: number }> = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      if (!usable(node)) continue;
      const text = node.nodeValue ?? '';
      for (let i = 0; i < text.length; i++) if (/\S/.test(text[i])) out.push({ node, offset: i });
    }
    return out;
  };

  const edgePoint = (): { x: number; y: number } => {
    const w = window.innerWidth, h = window.innerHeight;
    switch (Math.floor(Math.random() * 4)) {
      case 0: return { x: Math.random() * w, y: -40 };
      case 1: return { x: w + 40, y: Math.random() * h };
      case 2: return { x: Math.random() * w, y: h + 40 };
      default: return { x: -40, y: Math.random() * h };
    }
  };

  const revealAll = (): void => {
    hidden.forEach(el => { el.style.clipPath = ''; el.removeAttribute('data-ct'); });
    hidden.clear();
  };

  // ---------- finding things to animate ----------
  const hide = (el: HTMLElement, kind: Kind): void => {
    el.setAttribute('data-ct', '0');
    hidden.add(el);
    const target: Target = { el, kind, state: 'idle' };
    targets.set(el, target);
    io.observe(el);
  };

  const addVisual = (el: HTMLElement): void => {
    if (known.has(el) || !el.getClientRects().length) return;
    if (insideVisual(el.parentElement) || el.parentElement?.closest('[data-ct]')) return;
    known.add(el);
    visualSet.add(el);
    hide(el, 'visual');
  };

  const scan = (): void => {
    const roots = [document.querySelector('main'), document.querySelector('.site-footer')]
      .filter((r): r is HTMLElement => !!r);
    for (const root of roots) {
      root.querySelectorAll<HTMLElement>(VISUAL_SELECTOR).forEach(addVisual);
      root.querySelectorAll<SVGSVGElement>('svg').forEach(svg => {
        if (known.has(svg) || insideVisual(svg.parentElement)) return;
        const r = svg.getBoundingClientRect();
        if (r.width >= 140 && r.height >= 80) addVisual(svg as unknown as HTMLElement);
      });

      const cache = new Map<Element, HTMLElement | null>();
      const found = new Set<HTMLElement>();
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode as Text;
        if (!usable(node)) continue;
        const block = containerOf(node, root, cache);
        if (block && !known.has(block) && block.getClientRects().length) found.add(block);
      }
      const list = Array.from(found);
      list.forEach(block => known.add(block));
      // only the innermost blocks are typed, so nothing hides something that is already typed
      list.filter(block => !list.some(other => other !== block && block.contains(other)))
        .forEach(block => {
          if (block.parentElement?.closest('[data-ct]')) return;
          hide(block, 'text');
        });
    }
  };

  // ---------- visibility ----------
  const io = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const target = targets.get(entry.target);
      if (target && entry.isIntersecting && target.state === 'idle') {
        target.state = 'queued';
        queue.push(target);
        kick();
      }
    }
  }, { threshold: 0, rootMargin: '0px 0px -6% 0px' });

  // ---------- jobs ----------
  const charRect = (job: Job, index: number): Rect | null => {
    const item = job.chars[index];
    if (!item || !item.node.isConnected) return null;
    // headings split into words by home_motion.ts: use the stable outer word box
    const word = item.node.parentElement?.closest('.w');
    if (word) {
      const r = word.getBoundingClientRect();
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
    }
    job.range.setStart(item.node, item.offset);
    job.range.setEnd(item.node, item.offset + 1);
    const r = job.range.getBoundingClientRect();
    if (!r.width && !r.height) return null;
    return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
  };

  const placeBox = (box: HTMLElement, left: number, top: number, width: number, height: number): void => {
    box.style.transform = `translate(${left.toFixed(1)}px,${top.toFixed(1)}px)`;
    box.style.width = `${Math.max(0, width).toFixed(1)}px`;
    box.style.height = `${Math.max(0, height).toFixed(1)}px`;
  };

  const startJob = (target: Target, cursor: Cursor, now: number): void => {
    const job: Job = {
      target, cursor, phase: 'fly', startedAt: now, duration: 0,
      chars: [], range: document.createRange(), box: null, lastRect: null
    };
    const speed = 1 + Math.min(queue.length / 6, 3); // many waiting blocks => type faster
    if (target.kind === 'text') {
      job.chars = collectChars(target.el);
      if (!job.chars.length) { revealTarget(target); return; }
      job.duration = Math.min(MAX_TYPING_MS, Math.max(MIN_TYPING_MS, job.chars.length * MS_PER_CHARACTER)) / speed;
    } else {
      job.duration = Math.max(380, 850 / speed);
    }
    target.state = 'running';
    cursor.busy = true;
    cursor.follow = 0.2;
    if (!cursor.shown) {
      const p = edgePoint();
      cursor.x = p.x; cursor.y = p.y;
      cursor.shown = true;
      cursor.el.style.opacity = '1';
    }
    jobs.push(job);
  };

  const revealTarget = (target: Target): void => {
    target.el.style.clipPath = '';
    target.el.removeAttribute('data-ct');
    hidden.delete(target.el);
    target.state = 'done';
    io.unobserve(target.el);
  };

  const finishJob = (job: Job, now: number): void => {
    revealTarget(job.target);
    job.cursor.busy = false;
    job.cursor.idleAt = now + 700;
    job.cursor.follow = 0.12;
    job.cursor.tx += 30 + Math.random() * 40; // drift away a little
    job.cursor.ty += 18 + Math.random() * 30;
    job.cursor.el.style.setProperty('--h', '0px');
    if (job.box) {
      const box = job.box;
      box.style.opacity = '0';
      window.setTimeout(() => box.remove(), 450);
    }
    const index = jobs.indexOf(job);
    if (index >= 0) jobs.splice(index, 1);
  };

  const stepJob = (job: Job, now: number): void => {
    const { target, cursor } = job;
    const el = target.el;
    if (!el.isConnected) { finishJob(job, now); return; }
    const box = el.getBoundingClientRect();

    if (job.phase === 'fly') {
      let px = box.left, py = box.top;
      if (target.kind === 'text') {
        const first = charRect(job, 0);
        if (first) { px = first.left; py = first.bottom; }
      }
      cursor.tx = px; cursor.ty = py;
      const fast = queue.length > 10;
      const arrived = Math.hypot(cursor.x - px, cursor.y - py) < (fast ? 90 : 40);
      if (!arrived && now - job.startedAt < (fast ? 140 : 520)) return;
      // start typing: un-hide and set the first clip in the SAME frame (no flash)
      job.phase = 'type';
      job.startedAt = now;
      cursor.follow = 0.5;
      el.removeAttribute('data-ct');
      hidden.delete(el);
      const showBox = SHOW_SELECTION_BOXES && (target.kind === 'visual' || job.chars.length >= 8);
      if (showBox) {
        const b = document.createElement('div');
        b.className = 'ct-box';
        b.style.setProperty('--c', cursor.color);
        b.innerHTML = '<i></i><i></i><i></i><i></i>';
        layer.appendChild(b);
        job.box = b;
      }
    }

    const frac = Math.min(1, (now - job.startedAt) / Math.max(1, job.duration));

    if (target.kind === 'text') {
      const total = job.chars.length;
      const first = job.chars[0], lastChar = job.chars[total - 1];
      if (!first || !first.node.isConnected || !lastChar.node.isConnected) {
        job.chars = collectChars(el); // Angular changed the text: look again
        if (!job.chars.length) { finishJob(job, now); return; }
      }
      const index = Math.min(job.chars.length - 1, Math.floor(frac * job.chars.length));
      const r = charRect(job, index) ?? job.lastRect;
      if (r) {
        job.lastRect = r;
        const W = box.width, H = box.height;
        const top = Math.max(0, r.top - box.top - 3);
        const bottom = Math.min(H, r.bottom - box.top + 3);
        const x = Math.min(W, Math.max(0, r.right - box.left + 1));
        el.style.clipPath =
          `polygon(0px 0px,${W}px 0px,${W}px ${top}px,${x}px ${top}px,${x}px ${bottom}px,0px ${bottom}px)`;
        cursor.tx = r.right;
        cursor.ty = r.bottom;
        cursor.el.style.setProperty('--h', `${Math.max(10, r.bottom - r.top)}px`);
      }
      if (job.box) placeBox(job.box, box.left - 4, box.top - 4, box.width + 8, box.height + 8);
    } else {
      const eased = 1 - Math.pow(1 - frac, 3);
      const right = ((1 - eased) * 100).toFixed(2);
      el.style.clipPath = `inset(0 ${right}% ${right}% 0)`;
      cursor.tx = box.left + box.width * eased;
      cursor.ty = box.top + box.height * eased;
      cursor.el.style.setProperty('--h', '0px');
      if (job.box) placeBox(job.box, box.left, box.top, box.width * eased, box.height * eased);
    }

    if (frac >= 1) finishJob(job, now);
  };

  const assign = (now: number): void => {
    if (!queue.length) return;
    const free = cursors.filter(c => !c.busy);
    if (!free.length) return;
    if (queue.length > 1) {
      queue.sort((a, b) => a.el.getBoundingClientRect().top - b.el.getBoundingClientRect().top);
    }
    while (queue.length && free.length) {
      const target = queue.shift() as Target;
      const r = target.el.getBoundingClientRect();
      if (!target.el.isConnected || r.bottom < -60 || r.top > window.innerHeight + 60) {
        target.state = 'idle'; // scrolled away: will be queued again when it returns
        continue;
      }
      let best = 0, bestDistance = Infinity;
      free.forEach((c, i) => {
        const d = c.shown ? Math.hypot(c.x - r.left, c.y - r.top) : 5000;
        if (d < bestDistance) { bestDistance = d; best = i; }
      });
      startJob(target, free.splice(best, 1)[0], now);
    }
  };

  const stepCursor = (c: Cursor, now: number, dt: number): void => {
    const k = 1 - Math.pow(1 - c.follow, dt / 16.67);
    c.x += (c.tx - c.x) * k;
    c.y += (c.ty - c.y) * k;
    c.el.style.transform = `translate3d(${c.x.toFixed(1)}px,${c.y.toFixed(1)}px,0)`;
    if (!c.busy && c.shown && now > c.idleAt) {
      c.shown = false;
      c.el.style.opacity = '0';
    }
  };

  const loop = (now: number): void => {
    raf = 0;
    if (stopped) return;
    const dt = Math.min(64, Math.max(1, now - last));
    last = now;
    try {
      assign(now);
      for (const job of [...jobs]) stepJob(job, now);
      for (const c of cursors) stepCursor(c, now, dt);
    } catch {
      revealAll(); // never let a cosmetic effect hide the page
      stopped = true;
      return;
    }
    if (jobs.length || queue.length || cursors.some(c => c.shown)) raf = requestAnimationFrame(loop);
  };

  function kick(): void {
    if (raf || stopped) return;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }

  // ---------- watch the page ----------
  const inLayer = (node: Node): boolean => {
    const el = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
    return !!el?.closest('.ct-layer');
  };
  const observer = new MutationObserver(records => {
    if (stopped || records.every(record => inLayer(record.target))) return;
    try { scan(); } catch { revealAll(); }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('beforeprint', revealAll);

  return () => {
    stopped = true;
    if (raf) cancelAnimationFrame(raf);
    observer.disconnect();
    io.disconnect();
    window.removeEventListener('beforeprint', revealAll);
    revealAll();
    layer.remove();
    style.remove();
  };
}