// Safe argv helpers. Workers must use these instead of indexOf-based parsing,
// because args[args.indexOf('--worker') + 1] silently returns args[0] when the
// flag is missing — which is how every steady-state worker spent 24h logging
// itself as worker='--batch'.

export function arg(name, fallback = undefined) {
  const args = process.argv.slice(2);
  const i = args.indexOf(name);
  if (i < 0) return fallback;
  const v = args[i + 1];
  if (v === undefined || v.startsWith('--')) return fallback;
  return v;
}

export function intArg(name, fallback) {
  const v = arg(name);
  if (v === undefined) return fallback;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

export function flagArg(name) {
  return process.argv.slice(2).includes(name);
}
