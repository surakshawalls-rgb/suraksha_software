/**
 * Word hover zoom for the whole website.
 *
 * When a mouse pointer moves over any word it grows very slightly (the CSS for
 * that lives in app.css under "WORD HOVER ZOOM").
 *
 * How it works, in plain terms:
 * - Every piece of normal page text is split into words. Each word is wrapped
 *   in a small <hw-w> element so it can be scaled on its own.
 * - The ORIGINAL text node is kept (hidden inside <hw-s>) so Angular can keep
 *   updating it, e.g. {{course.title}}. When Angular changes it, the words are
 *   rebuilt automatically. When Angular removes it, the words go too.
 * - Pages and sections that appear later are picked up by a MutationObserver.
 *
 * Skipped on purpose: touch devices, visitors who asked for reduced motion,
 * form fields, icons, code, hidden/decorative content (aria-hidden) and the
 * h1/h2 headings (those words are animated by home_motion.ts, which scales
 * them through the same hover effect).
 */

const SKIP =
  'h1,h2,script,style,noscript,textarea,input,select,option,svg,code,pre,i-lucide,hw-g,' +
  '[aria-hidden="true"],.honeypot,.scroll-progress,.no-word-zoom,[contenteditable="true"]';

export function initWordHover(): () => void {
  const noop = () => {};
  if (typeof window === 'undefined' || typeof document === 'undefined') return noop;
  if (typeof window.matchMedia !== 'function') return noop;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return noop;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return noop;

  const root = document.body;
  const groups = new WeakMap<Node, HTMLElement>(); // original text node -> its <hw-g> wrapper
  const created = new Set<HTMLElement>();          // wrappers we made (for cleanup)

  const buildWords = (text: string): Node[] => {
    const nodes: Node[] = [];
    for (const part of text.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        nodes.push(document.createTextNode(' '));
        continue;
      }
      const word = document.createElement('hw-w');
      word.textContent = part;
      nodes.push(word);
    }
    return nodes;
  };

  const fill = (group: HTMLElement, text: string): void => {
    Array.from(group.childNodes).forEach(child => {
      if (child.nodeName !== 'HW-S') child.remove();
    });
    buildWords(text).forEach(node => group.appendChild(node));
  };

  const wrap = (node: Text): void => {
    if (groups.has(node)) return;
    const text = node.nodeValue ?? '';
    const parent = node.parentElement;
    if (!parent || !/\S/.test(text) || parent.closest(SKIP)) return;

    const group = document.createElement('hw-g');
    const source = document.createElement('hw-s');
    parent.replaceChild(group, node);
    source.appendChild(node); // keep the original node alive for Angular
    group.appendChild(source);
    fill(group, text);
    groups.set(node, group);
    created.add(group);
  };

  const scan = (start: Node): void => {
    if (start.nodeType === Node.TEXT_NODE) { wrap(start as Text); return; }
    if (start.nodeType !== Node.ELEMENT_NODE) return;
    const element = start as Element;
    if (element.closest(SKIP)) return;
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const found: Text[] = [];
    while (walker.nextNode()) found.push(walker.currentNode as Text);
    found.forEach(wrap);
  };

  const config: MutationObserverInit = { childList: true, subtree: true, characterData: true };

  const handle = (records: MutationRecord[]): void => {
    observer.disconnect(); // ignore the changes we make ourselves
    try {
      for (const record of records) {
        if (record.type === 'characterData') {
          const group = groups.get(record.target);
          if (group) {
            if (group.isConnected) fill(group, record.target.nodeValue ?? '');
          } else if (record.target.nodeType === Node.TEXT_NODE) {
            wrap(record.target as Text);
          }
          continue;
        }
        record.removedNodes.forEach(removed => {
          const group = groups.get(removed);
          if (group) { group.remove(); created.delete(group); groups.delete(removed); }
        });
        record.addedNodes.forEach(added => scan(added));
      }
    } finally {
      observer.observe(root, config);
    }
  };

  const observer = new MutationObserver(handle);
  try {
    scan(root);
  } catch {
    // never let a cosmetic effect break the page
  }
  observer.observe(root, config);

  return () => {
    observer.disconnect();
    created.forEach(group => {
      const source = group.querySelector('hw-s');
      const original = source?.firstChild;
      if (original && group.parentNode) group.parentNode.replaceChild(original, group);
    });
    created.clear();
  };
}