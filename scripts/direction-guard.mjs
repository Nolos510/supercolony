#!/usr/bin/env node
// Evidence integrity gate. Visual judgment must come from an actual rendered review.
import { createHash } from 'node:crypto';
import { lstatSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, isAbsolute, join, posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const APPROVED_REFERENCE = 'docs/design/atlas-richer-terrain-approved.png';
const APPROVED_REFERENCE_SHA256 = '70f456abdef293488b0c1fa0bff44e8f31366737597469e45e52517611642162';
const REQUIRED_ARTIFACTS = [
  'src/App.tsx', 'src/styles.css', 'src/rich-terrain.css', 'src/atlas-map.css', 'src/atlas-learning.css',
  'src/components/Map.tsx', 'src/components/TerrainBoard.tsx', 'src/components/Inspector.tsx',
  'src/components/VisualSummary.tsx', 'src/data/artboards.ts', 'tokens.css',
  'public/art/habitat-medallions.png', 'public/art/world-terrain.jpg', 'public/art/terrain-comparison.jpg',
  ...['california','mediterranean','japan','africa','australia','newzealand','hawaii','southamerica'].map(id=>`public/art/terrain/${id}.jpg`),
];
const SHA256 = /^[a-f0-9]{64}$/;
const text = value => typeof value === 'string' && value.trim().length > 0;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);

function evidenceFile(root, path, label, errors) {
  if (!text(path) || path !== path.trim() || path.includes('\\') || path.includes('\0') || isAbsolute(path) || posix.normalize(path) !== path || path.split('/').some(part => part === '..' || part === '.')) {
    errors.push(`BLOCKED: ${label} must use a canonical relative path inside the repository.`);
    return null;
  }
  try {
    let file = realpathSync(root);
    for (const part of path.split('/')) {
      file = join(file, part);
      if (lstatSync(file).isSymbolicLink()) {
        errors.push(`BLOCKED: ${label} uses a symlink: ${path}.`);
        return null;
      }
    }
    if (!lstatSync(file).isFile()) {
      errors.push(`BLOCKED: ${label} is not a regular file: ${path}.`);
      return null;
    }
    return file;
  } catch (error) {
    errors.push(`BLOCKED: ${label} is unavailable: ${path} (${error.code ?? error.message}).`);
    return null;
  }
}

function checkedHash(entry, root, label, errors) {
  if (!object(entry)) {
    errors.push(`BLOCKED: ${label} requires a path and SHA-256 hash.`);
    return;
  }
  const file = evidenceFile(root, entry.path, label, errors);
  if (!text(entry.sha256) || !SHA256.test(entry.sha256)) {
    errors.push(`BLOCKED: ${label} requires a complete lowercase SHA-256 hash.`);
    return;
  }
  if (file) {
    try {
      const current = createHash('sha256').update(readFileSync(file)).digest('hex');
      if (current !== entry.sha256) errors.push(`BLOCKED: ${label} is stale; hash differs for ${entry.path}. Render and review the current artifact.`);
    } catch (error) {
      errors.push(`BLOCKED: ${label} could not be hashed: ${error.code ?? error.message}.`);
    }
  }
}

function requiredIds(value, label, errors) {
  if (!Array.isArray(value) || value.length === 0 || value.some(id => !text(id)) || new Set(value).size !== value.length) {
    errors.push(`BLOCKED: acceptance ${label} must contain distinct required IDs.`);
    return [];
  }
  return value;
}

function reviewEntries(entries, ids, label, errors) {
  if (!Array.isArray(entries)) {
    errors.push(`BLOCKED: review is missing ${label}.`);
    entries = [];
  }
  const indexed = new Map();
  for (const entry of entries) {
    if (!object(entry) || !text(entry.id)) {
      errors.push(`BLOCKED: ${label} contains an entry without an ID.`);
      continue;
    }
    if (indexed.has(entry.id)) errors.push(`BLOCKED: duplicate ${label} entry: ${entry.id}.`);
    indexed.set(entry.id, entry);
  }
  for (const id of ids) {
    const entry = indexed.get(id);
    if (!entry) {
      errors.push(`BLOCKED: required ${label} ${id} is missing.`);
      continue;
    }
    if (entry.status !== 'pass') errors.push(`${entry.status === 'fail' ? 'DRIFT' : 'BLOCKED'}: ${label} ${id} is ${text(entry.status) ? entry.status : 'unreviewed'}; ${text(entry.finding) ? entry.finding : 'record an actual rendered finding'}.`);
    if (!text(entry.finding)) errors.push(`BLOCKED: ${label} ${id} has no finding.`);
  }
  return indexed;
}

/** Returns actionable failures; does not manufacture or score visual reviews. */
export function validateDirection(report, acceptance, root) {
  const errors = [];
  if (!object(acceptance)) return ['BLOCKED: visual acceptance is missing or invalid.'];
  if (!object(report)) return ['BLOCKED: visual direction review is missing or invalid.'];
  if (!text(root)) return ['BLOCKED: repository root is missing.'];

  if (!text(acceptance.reference)) errors.push('BLOCKED: acceptance has no approved reference path.');
  if (!object(report.reference) || report.reference.path !== acceptance.reference) errors.push('BLOCKED: review reference must match the exact approved reference path.');
  checkedHash(report.reference, root, 'approved reference', errors);
  if (acceptance.referenceSha256 !== undefined && (!SHA256.test(acceptance.referenceSha256) || report.reference?.sha256 !== acceptance.referenceSha256)) errors.push('BLOCKED: reference hash does not match the frozen approved reference.');

  if (!Array.isArray(report.artifactFiles) || report.artifactFiles.length === 0) {
    errors.push('BLOCKED: review has no artifactFiles; identify the exact source and art under review.');
  } else {
    const paths = new Set();
    for (const entry of report.artifactFiles) {
      if (paths.has(entry?.path)) errors.push(`BLOCKED: duplicate artifact file: ${entry?.path}.`);
      paths.add(entry?.path);
      checkedHash(entry, root, 'artifact file', errors);
    }
    if (Array.isArray(acceptance.artifactFiles)) for (const path of acceptance.artifactFiles) {
      if (!paths.has(path)) errors.push(`BLOCKED: required artifact file is missing from review: ${path}.`);
    }
  }

  const surfaces = requiredIds(acceptance.requiredSurfaces, 'requiredSurfaces', errors);
  const criteria = requiredIds(acceptance.requiredCriteria, 'requiredCriteria', errors);
  const reviewedSurfaces = reviewEntries(report.surfaces, surfaces, 'surface', errors);
  reviewEntries(report.criteria, criteria, 'criterion', errors);
  for (const id of surfaces) {
    const entry = reviewedSurfaces.get(id);
    if (!entry) continue;
    if (!Array.isArray(entry.screenshots) || entry.screenshots.length === 0) errors.push(`BLOCKED: surface ${id} needs actual rendered screenshots.`);
    else for (const screenshot of entry.screenshots) checkedHash(screenshot, root, `surface ${id} screenshot`, errors);
  }
  if (!object(report.reviewer) || !text(report.reviewer.name) || !text(report.reviewer.method)) errors.push('BLOCKED: review must name its reviewer and actual inspection method.');
  if (report.reviewer?.status !== undefined && report.reviewer.status !== 'pass') errors.push('BLOCKED: reviewer has not completed the visual inspection.');
  return errors;
}

function readJson(root, path, errors) {
  const file = evidenceFile(root, path, path, errors);
  if (!file) return null;
  try { return JSON.parse(readFileSync(file, 'utf8')); }
  catch (error) { errors.push(`BLOCKED: invalid JSON in ${path}: ${error.message}.`); return null; }
}

function main() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const errors = [];
  const acceptance = readJson(root, 'verification/visual-direction-acceptance.json', errors);
  const report = readJson(root, 'verification/visual-direction-review.json', errors);
  if (object(acceptance) && acceptance.reference !== APPROVED_REFERENCE) errors.push('BLOCKED: project acceptance does not identify the pinned approved richer-atlas reference.');
  if (object(acceptance) && acceptance.referenceSha256 !== undefined && acceptance.referenceSha256 !== APPROVED_REFERENCE_SHA256) errors.push('BLOCKED: project acceptance attempts to replace the pinned approved reference hash.');
  if (acceptance && report) errors.push(...validateDirection(report, { ...acceptance, referenceSha256: APPROVED_REFERENCE_SHA256, artifactFiles:REQUIRED_ARTIFACTS }, root));
  if (errors.length) {
    console.error('DRIFT / BLOCKED — visual direction review cannot certify this artifact.');
    for (const failure of errors) console.error(`- ${failure}`);
    process.exitCode = 1;
  } else {
    console.log('PASS — recorded visual review is complete and matches the current files. Visual judgments remain review assertions; human acceptance is separate.');
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
