// article_set_hash — the heartbeat.
// Deterministic SHA-256 over sorted (slug, grade) pairs from
// src/content/articles/. Default grade = 'stub' when no row in
// article_current_grade. Bumps whenever a real article change lands.

import { createHash } from 'node:crypto';
import { readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from './db.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ARTICLES_DIR = join(HERE, '..', '..', 'src', 'content', 'articles');

let _cached = null;

function gradeMap() {
  const tables = db.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='article_current_grade'`
  ).get();
  if (!tables) return new Map();
  const rows = db.prepare(`SELECT article_slug, current_grade FROM article_current_grade`).all();
  return new Map(rows.map(r => [r.article_slug, r.current_grade]));
}

function slugsFromDisk() {
  return readdirSync(ARTICLES_DIR)
    .filter(f => f.endsWith('.mdx'))
    .map(f => f.slice(0, -4))
    .sort();
}

export function articleSetHash() {
  if (_cached) return _cached;
  const grades = gradeMap();
  const lines = slugsFromDisk().map(slug => `${slug}\t${grades.get(slug) || 'stub'}`);
  const h = createHash('sha256').update(lines.join('\n')).digest('hex');
  _cached = h;
  return h;
}

export function bumpHash() {
  _cached = null;
  return articleSetHash();
}

export default articleSetHash;
