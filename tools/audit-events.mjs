import { readFileSync, readdirSync } from 'node:fs';
import yaml from 'js-yaml';
const dir = 'src/content/articles';
const buckets = { full: [], month: [], year: [] };
for (const f of readdirSync(dir).filter(x => x.endsWith('.mdx'))) {
  const c = readFileSync(`${dir}/${f}`, 'utf8');
  const m = c.match(/^---\n([\s\S]*?)\n---/);
  if (!m) continue;
  let fm; try { fm = yaml.load(m[1]); } catch { continue; }
  for (const e of fm.events ?? []) {
    const d = String(e.date);
    const bucket = d.length === 10 ? 'full' : d.length === 7 ? 'month' : 'year';
    buckets[bucket].push(`${f.replace('.mdx','')}: ${d}`);
  }
}
console.log(`full DD precision: ${buckets.full.length}`);
console.log(`month-only: ${buckets.month.length}`);
console.log(`year-only: ${buckets.year.length}`);
console.log('\n=== MONTH-ONLY (to be stripped) ===');
buckets.month.forEach(x => console.log(x));
console.log('\n=== YEAR-ONLY (to be stripped) ===');
buckets.year.forEach(x => console.log(x));
