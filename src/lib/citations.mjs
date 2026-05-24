// Per-page citation accumulator. ArticleLayout calls reset() at the top of render,
// each <Cite> calls add(), and <References> calls list() to emit the numbered list.
// Astro renders pages sequentially per build worker so a module-level Map keyed by
// pathname is safe; reset() at the layout top guards against any dev-mode reuse.

const stores = new Map();

function key(pathname) {
  return pathname || '__default__';
}

export function reset(pathname) {
  stores.set(key(pathname), []);
}

export function add(pathname, { s, t }) {
  const k = key(pathname);
  if (!stores.has(k)) stores.set(k, []);
  const list = stores.get(k);
  const existing = list.find((c) => c.s === s && c.t === t);
  if (existing) return existing.n;
  const n = list.length + 1;
  list.push({ n, s, t });
  return n;
}

export function list(pathname) {
  return stores.get(key(pathname)) || [];
}

export function tsToSeconds(t) {
  const parts = t.split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

export function tsAnchor(t) {
  return 't-' + t.replace(/:/g, '-');
}
