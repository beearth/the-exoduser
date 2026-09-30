import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const assetDir = path.join(root, 'assets', 'unique-items');
const downloadDir = path.join(process.env.USERPROFILE || '', 'Downloads');
const projectDoc = await readFile(path.join(root, 'docs', '7아이템디자인', '고유아이템_모델_어픽스_밸런싱_프로젝트_20260930.md'), 'utf8');
const batchDoc = await readFile(path.join(root, 'docs', '7아이템디자인', 'SEEDREAM_UNIQUE_ART_BATCH_20261001.md'), 'utf8');
const ids = new Map();
for (const match of projectDoc.matchAll(/^\| UI-(\d\d) \| `(\d{19})` \| `assets\/unique-items\/ui-\d\d-seedream-candidate\.png`/gm)) ids.set(match[1], match[2]);
for (const match of batchDoc.matchAll(/^\| (\d\d) \| `(\d{19})` \| `ui-\d\d-seedream-candidate\.png`/gm)) {
  if (ids.has(match[1])) throw new Error(`작업 ID 중복: UI-${match[1]}`);
  ids.set(match[1], match[2]);
}

const files = await readdir(assetDir);
const digest = data => createHash('sha256').update(data).digest('hex');
const allHashes = new Map();
const rows = [];
for (let n = 1; n <= 22; n++) {
  const id = String(n).padStart(2, '0');
  const task = ids.get(id);
  if (!task) throw new Error(`작업 ID 누락: UI-${id}`);
  const row = { id: `UI-${id}`, task };
  for (const [kind, name] of [['original', `ui-${id}.png`], ['seedream', `ui-${id}-seedream-candidate.png`]]) {
    if (!files.includes(name)) throw new Error(`원화 누락: ${name}`);
    const data = await readFile(path.join(assetDir, name));
    const meta = await sharp(data).metadata();
    if (meta.format !== 'png') throw new Error(`PNG 형식 오류: ${name}`);
    const hash = digest(data);
    if (allHashes.has(hash)) throw new Error(`내용이 같은 원화: ${allHashes.get(hash)}, ${name}`);
    allHashes.set(hash, name);
    row[kind] = { name, width: meta.width, height: meta.height, channels: meta.channels, hasAlpha: meta.hasAlpha, bytes: data.length, sha256: hash };
  }
  try {
    const downloaded = await readFile(path.join(downloadDir, `${task}-1.png`));
    row.downloadMatch = digest(downloaded) === row.seedream.sha256;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    row.downloadMatch = null;
  }
  rows.push(row);
}
const expected = new Set(rows.flatMap(row => [row.original.name, row.seedream.name]));
const extras = files.filter(name => name.toLowerCase().endsWith('.png') && !expected.has(name));
if (extras.length) throw new Error(`목록 밖 PNG: ${extras.join(', ')}`);
if (ids.size !== 22) throw new Error(`작업 ID 개수 오류: ${ids.size}`);

console.log(JSON.stringify({ count: rows.length, files: files.length, downloadMatched: rows.filter(row => row.downloadMatch === true).length, downloadMissing: rows.filter(row => row.downloadMatch === null).length, downloadMismatched: rows.filter(row => row.downloadMatch === false).map(row => row.id), rows }, null, 2));
