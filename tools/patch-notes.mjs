// patch-notes.mjs — 패치노트 초안 생성 + 게임 내 표시용 patch-notes.js 빌드
// 사용:
//   node tools/patch-notes.mjs draft --from <tag|ref> [--to HEAD] --version X.Y.Z
//   node tools/patch-notes.mjs draft --since 2026-10-01 --version X.Y.Z   (태그가 없을 때)
//   node tools/patch-notes.mjs build [--include-draft]
// 노트 파일: docs/13출시·마케팅/patch_notes/v<version>.md
//   frontmatter: version / date / status(draft|final)
//   본문: "## KO" / "## EN" 아래 "### 분류" + "- 항목" (분류: 새 기능/개선/버그 수정/밸런스 · New/Improved/Fixed/Balance)
// build 결과: release-version.js 옆 patch-notes.js —
//   window.EXODUSER_PATCH_NOTES=[{version,date,ko:{sections:[{title,items}]},en:{...}}, ...] 최신순 최대 5개
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const DEFAULT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const NOTES_DIR = 'docs/13출시·마케팅/patch_notes';
const KO_TITLES = ['새 기능', '개선', '버그 수정', '밸런스'];
const EN_TITLES = ['New', 'Improved', 'Fixed', 'Balance'];

// ── 노트 파일 파서 ──────────────────────────────────────────────────────────
export function parseNoteFile(source) {
  const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
  if (!fm) throw new Error('Missing frontmatter');
  const meta = {};
  for (const line of fm[1].split(/\r?\n/)) {
    const m = /^(\w+)\s*:\s*(.+)$/.exec(line.trim());
    if (m) meta[m[1]] = m[2].trim();
  }
  if (!/^\d+\.\d+\.\d+$/.test(meta.version || '')) throw new Error('frontmatter version missing');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.date || '')) throw new Error('frontmatter date missing');
  if (!['draft', 'final'].includes(meta.status)) throw new Error('frontmatter status must be draft|final');
  const body = source.slice(fm[0].length);
  const langs = {};
  for (const lang of ['KO', 'EN']) {
    const re = new RegExp(`^## ${lang}\\s*$`, 'm');
    const start = body.search(re);
    if (start < 0) continue;
    const rest = body.slice(start + body.slice(start).indexOf('\n'));
    const endRel = rest.search(/^## (?:KO|EN)\s*$/m);
    const chunk = endRel < 0 ? rest : rest.slice(0, endRel);
    const sections = [];
    let cur = null;
    for (const line of chunk.split(/\r?\n/)) {
      const h = /^###\s+(.+)$/.exec(line);
      if (h) { cur = { title: h[1].trim(), items: [] }; sections.push(cur); continue; }
      const b = /^[-*]\s+(.+)$/.exec(line.trim());
      if (b && cur) cur.items.push(b[1].trim());
    }
    langs[lang.toLowerCase()] = { sections: sections.filter(s => s.items.length) };
  }
  if (!langs.ko || !langs.en) throw new Error('Both "## KO" and "## EN" sections are required');
  return { version: meta.version, date: meta.date, status: meta.status, ko: langs.ko, en: langs.en };
}

export function compareVersionDesc(a, b) {
  const pa = a.split('.').map(Number), pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pb[i] - pa[i];
  return 0;
}

// ── 초안 생성 ───────────────────────────────────────────────────────────────
// 플레이어에게 보이지 않는 커밋 제외: docs/chore/test/qa/guard/tools/refactor/audit/ci + 맵에디터 내부
const SKIP_RE = /^(docs|chore|test|qa|guard|tools|refactor|audit|ci|build|provenance)\b|map-?editor|baseline|세션 작업분|session sync|handoff|checkpoint|skip ci/i;

export function classifySubject(subject) {
  if (SKIP_RE.test(subject)) return null;
  const m = /^(\w+)(?:\(([^)]*)\))?!?:\s*(.*)$/.exec(subject);
  const type = m ? m[1].toLowerCase() : '';
  const scope = m ? (m[2] || '').toLowerCase() : '';
  const text = (m ? m[3] : subject).trim();
  if (!text) return null;
  if (/^(docs|chore|test|qa|guard|refactor|audit|ci|provenance)$/.test(type)) return null;
  if (/editor|tool|probe|harness|sandbox/.test(scope)) return null;
  let bucket = 1; // 개선/Improved 기본
  if (type === 'feat') bucket = 0;
  else if (type === 'fix') bucket = 2;
  else if (type === 'balance' || /밸런스|balance/i.test(text)) bucket = 3;
  else if (type === 'perf' || type === 'style' || type === 'art') bucket = 1;
  // 플레이어 문장화 휴리스틱: 해시/파일명/변수명·내부 표기 제거
  const line = text
    .replace(/\b[0-9a-f]{7,40}\b/g, '').replace(/`[^`]*`/g, '')
    .replace(/\([^)]*(?:MAP|QA|LOCK|ENEMY|SKILL|PM)-[^)]*\)/g, '')
    .replace(/\s{2,}/g, ' ').replace(/\s+([,.·])/g, '$1').trim();
  return { bucket, line };
}

export function draftFromSubjects(subjects, version, date) {
  const ko = KO_TITLES.map(t => ({ title: t, items: [] }));
  const en = EN_TITLES.map(t => ({ title: t, items: [] }));
  for (const s of subjects) {
    const c = classifySubject(s);
    if (!c) continue;
    ko[c.bucket].items.push(c.line);
    en[c.bucket].items.push(c.line); // 초안: 원문 유지 — 사람이 플레이어용 EN으로 다듬어 확정
  }
  const sec = arr => arr.filter(s => s.items.length)
    .map(s => `### ${s.title}\n${s.items.map(i => `- ${i}`).join('\n')}`).join('\n\n');
  return [
    '---', `version: ${version}`, `date: ${date}`, 'status: draft', '---', '',
    '<!-- 초안: 커밋 제목 자동 수집. 플레이어용 짧은 문장으로 다듬고 EN을 번역한 뒤 status: final 로 변경 -->', '',
    '## KO', '', sec(ko) || '### 개선\n- (내용 없음)', '',
    '## EN', '', sec(en) || '### Improved\n- (none)', '',
  ].join('\n');
}

export function buildPatchNotesJs(notes) {
  const sorted = [...notes].sort((a, b) => compareVersionDesc(a.version, b.version)).slice(0, 5)
    .map(({ version, date, ko, en }) => ({ version, date, ko, en }));
  return `window.EXODUSER_PATCH_NOTES=${JSON.stringify(sorted)};\n`;
}

// ── CLI ─────────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) out[key] = argv[++i];
      else out[key] = true;
    } else out._.push(argv[i]);
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args._[0];
  const root = DEFAULT_ROOT;
  const notesDir = resolve(root, NOTES_DIR);
  if (cmd === 'draft') {
    const version = args.version;
    if (!/^\d+\.\d+\.\d+$/.test(version || '')) { console.error('--version X.Y.Z required'); process.exit(2); }
    const to = args.to || 'HEAD';
    let logArgs;
    if (args.from) logArgs = ['log', '--no-merges', '--format=%s', `${args.from}..${to}`];
    else if (args.since) {
      // git은 시각 없는 날짜를 '현재 시각'으로 채우므로 00:00을 명시한다
      const since = /^\d{4}-\d{2}-\d{2}$/.test(args.since) ? `${args.since} 00:00` : args.since;
      logArgs = ['log', '--no-merges', '--format=%s', `--since=${since}`, to];
    }
    else { console.error('--from <tag|ref> or --since <date> required'); process.exit(2); }
    const subjects = execFileSync('git', logArgs, { cwd: root, encoding: 'utf8', windowsHide: true })
      .split(/\r?\n/).filter(Boolean);
    const date = new Date();
    const p = n => String(n).padStart(2, '0');
    const today = `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
    mkdirSync(notesDir, { recursive: true });
    const file = resolve(notesDir, `v${version}.md`);
    if (existsSync(file)) { console.error(`Already exists: ${file}`); process.exit(1); }
    writeFileSync(file, draftFromSubjects(subjects, version, today));
    console.log(JSON.stringify({ file: `${NOTES_DIR}/v${version}.md`, commits: subjects.length, status: 'draft' }));
    return;
  }
  if (cmd === 'build') {
    const notes = [];
    let newestDraft = null;
    for (const name of (existsSync(notesDir) ? readdirSync(notesDir) : [])) {
      if (!/^v\d+\.\d+\.\d+\.md$/.test(name)) continue;
      const parsed = parseNoteFile(readFileSync(resolve(notesDir, name), 'utf8'));
      if (parsed.status === 'final') notes.push(parsed);
      else if (!newestDraft || compareVersionDesc(parsed.version, newestDraft.version) < 0) newestDraft = parsed;
    }
    if (args['include-draft'] && newestDraft) notes.push(newestDraft);
    writeFileSync(resolve(root, 'patch-notes.js'), buildPatchNotesJs(notes));
    console.log(JSON.stringify({ written: 'patch-notes.js', entries: Math.min(notes.length, 5), draftIncluded: !!(args['include-draft'] && newestDraft) }));
    return;
  }
  console.error('Usage: node tools/patch-notes.mjs draft --from <ref>|--since <date> --version X.Y.Z | build [--include-draft]');
  process.exit(2);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
