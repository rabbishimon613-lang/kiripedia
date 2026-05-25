#!/usr/bin/env node
// Bulk-write articles from a JSON spec. Handles all YAML escaping, all
// boilerplate (import, hatnote, see-also section, blank lines), so the
// author only provides the substantive content.
//
// Usage:
//   node tools/scaffold-articles.mjs <spec.json>
//   echo '<json>' | node tools/scaffold-articles.mjs -    # stdin
//
// Spec format (per slug):
//   {
//     "title": "Required",
//     "summary": "One-paragraph encyclopedic summary",
//     "categories": ["People"],
//     "infobox": {                       // optional
//       "title": "Display name",
//       "data": { "Position": "...", "Date of X": "..." }
//     },
//     "hatnote": "Not to be confused with X",   // optional
//     "dyk": ["… that X?", "… that Y?"],         // required >=2 for new articles
//     "events": [                                // optional; only YYYY-MM-DD
//       { "date": "2002-08-02", "description": "..." }
//     ],
//     "body": "**Markdown body with <Cite s=\"slug\" t=\"1:23\" /> tags.",
//     "see_also": ["other-slug", "another-slug"],
//     "skip_if_exists": false               // optional, default true
//   }
//
// Returns non-zero if any file fails to write or any spec is invalid.

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';

// ---- YAML helpers ----------------------------------------------------------
// Always single-quote strings; double internal apostrophes. Newlines in
// values are not supported (would need block scalar) — keep summary etc to
// one line.
function yqs(s) {
  return `'${String(s).replace(/'/g, "''")}'`;
}

function yamlFrontmatter(spec, slug) {
  const lines = ['---'];
  lines.push(`title: ${yqs(spec.title)}`);
  lines.push(`summary: ${yqs(spec.summary)}`);
  if (spec.categories?.length) {
    lines.push('categories:');
    for (const c of spec.categories) lines.push(`  - ${c}`);
  }
  if (spec.updated) lines.push(`updated: ${yqs(spec.updated)}`);
  if (spec.image) lines.push(`image: ${yqs(spec.image)}`);
  if (spec.hatnote) lines.push(`hatnote: ${yqs(spec.hatnote)}`);
  if (spec.infobox) {
    lines.push('infobox:');
    if (spec.infobox.title) lines.push(`  title: ${yqs(spec.infobox.title)}`);
    if (spec.infobox.data) {
      lines.push('  data:');
      for (const [k, v] of Object.entries(spec.infobox.data)) {
        // Key may contain colons/parens — quote both sides.
        lines.push(`    ${yqs(k)}: ${yqs(v)}`);
      }
    }
  }
  if (spec.dyk?.length) {
    lines.push('dyk:');
    for (const d of spec.dyk) lines.push(`  - ${yqs(d)}`);
  }
  if (spec.events?.length) {
    lines.push('events:');
    for (const e of spec.events) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(e.date))) {
        throw new Error(`${slug}: event date must be YYYY-MM-DD, got "${e.date}"`);
      }
      lines.push(`  - date: ${yqs(e.date)}`);
      lines.push(`    description: ${yqs(e.description)}`);
    }
  }
  lines.push('---');
  return lines.join('\n');
}

// ---- Title lookup for See-also -------------------------------------------
const articlesDir = 'src/content/articles';
const knownSlugs = new Set(
  readdirSync(articlesDir).filter(f => f.endsWith('.mdx')).map(f => f.replace(/\.mdx$/, ''))
);

function titleForSlug(slug) {
  const path = `${articlesDir}/${slug}.mdx`;
  if (!existsSync(path)) return null;
  const raw = readFileSync(path, 'utf8');
  const m = raw.match(/^---\n[\s\S]*?\ntitle:\s*['"]?(.+?)['"]?\n/);
  return m ? m[1].replace(/''/g, "'") : null;
}

function renderSeeAlso(slugs) {
  if (!slugs?.length) return '';
  const lines = ['', '## See also', ''];
  for (const slug of slugs) {
    const title = titleForSlug(slug) || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    lines.push(`- [${title}](/wiki/${slug})`);
  }
  return lines.join('\n');
}

// ---- Body assembly --------------------------------------------------------
function assembleArticle(spec, slug) {
  const fm = yamlFrontmatter(spec, slug);
  const imports = [`import Cite from '../../components/Cite.astro';`];
  if (spec.hatnote) imports.push(`import Hatnote from '../../components/Hatnote.astro';`);

  const parts = [fm, '', imports.join('\n'), ''];
  if (spec.hatnote) parts.push(`<Hatnote>${spec.hatnote}</Hatnote>`, '');
  parts.push(spec.body.trim());
  parts.push(renderSeeAlso(spec.see_also));

  return parts.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

// ---- Validation -----------------------------------------------------------
function validate(slug, spec) {
  const errs = [];
  if (!spec.title) errs.push('missing title');
  if (!spec.summary) errs.push('missing summary');
  if (!spec.categories?.length) errs.push('missing categories');
  if (!spec.body) errs.push('missing body');
  // DYK rule: new articles must have >=2 entries, each with >=2 wikilinks.
  if (spec.dyk) {
    if (spec.dyk.length < 2 && !spec.is_stub) {
      errs.push(`dyk has ${spec.dyk.length} entries (rule: >=2 for new articles)`);
    }
    for (let i = 0; i < spec.dyk.length; i++) {
      const linkCount = (spec.dyk[i].match(/\]\(\/wiki\//g) || []).length;
      if (linkCount < 2) errs.push(`dyk[${i}] has ${linkCount} wikilinks (rule: >=2 per entry)`);
    }
  }
  // Events rule: strict YYYY-MM-DD.
  if (spec.events) {
    for (let i = 0; i < spec.events.length; i++) {
      const d = String(spec.events[i].date);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) errs.push(`events[${i}].date "${d}" is not YYYY-MM-DD`);
      if (!spec.events[i].description) errs.push(`events[${i}] missing description`);
      const linkCount = (spec.events[i].description?.match(/\]\(\/wiki\//g) || []).length;
      if (linkCount < 1) errs.push(`events[${i}] description has no wikilinks (rule: >=1)`);
    }
  }
  // Body should have at least one citation.
  if (!/<Cite\s+s=/.test(spec.body)) errs.push('body has no <Cite /> tags');
  return errs;
}

// ---- Main -----------------------------------------------------------------
const arg = process.argv[2];
if (!arg) {
  console.error('usage: node tools/scaffold-articles.mjs <spec.json|->');
  process.exit(2);
}
const raw = arg === '-' ? readFileSync(0, 'utf8') : readFileSync(arg, 'utf8');
const specs = JSON.parse(raw);

let written = 0, skipped = 0, failed = 0;
for (const [slug, spec] of Object.entries(specs)) {
  const path = `${articlesDir}/${slug}.mdx`;
  if (existsSync(path) && spec.skip_if_exists !== false) {
    console.log(`= ${slug} (exists, skipping; set skip_if_exists:false to overwrite)`);
    skipped++;
    continue;
  }
  const errs = validate(slug, spec);
  if (errs.length) {
    console.error(`✗ ${slug}: ${errs.join('; ')}`);
    failed++;
    continue;
  }
  try {
    const content = assembleArticle(spec, slug);
    writeFileSync(path, content);
    console.log(`+ ${slug}`);
    written++;
  } catch (e) {
    console.error(`✗ ${slug}: ${e.message}`);
    failed++;
  }
}

console.log(`\nWrote ${written}, skipped ${skipped}, failed ${failed}.`);
if (failed > 0) process.exit(1);
