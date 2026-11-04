import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

// Dependency-free repository snapshot audit. No network, checkout, or source edits.
const REPORT = 'docs/0마스터플랜/worklog/cloud-lanes/K3-linkcheck_20261104.md';
const unescape = value => value.replace(/\\([!"#$%&'()*+,\-./:;<=>?@[\]\\^_`{|}~])/g, '$1')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
const blank = value => value.replace(/[^\n\r]/g, ' ');
const referenceKey = value => value.trim().replace(/\s+/g, ' ').toLowerCase();

function visibleMarkdown(text) {
  let fence = null;
  return text.replace(/<!--[\s\S]*?-->/g, blank).split('\n').map(line => {
    const match = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (fence) {
      if (match && match[1][0] === fence[0] && match[1].length >= fence.length) fence = null;
      return blank(line);
    }
    if (match) { fence = match[1]; return blank(line); }
    if (/^(?: {4}|\t)/.test(line)) return blank(line);
    return line;
  }).join('\n');
}

function destination(value) {
  value = value.trim();
  if (value.startsWith('<')) return unescape(value.slice(1, value.indexOf('>')));
  return unescape(value.replace(/\s+(?:"[\s\S]*"|'[\s\S]*'|\([^()]*\))\s*$/, ''));
}

function parseMarkdown(text) {
  const visible = visibleMarkdown(text);
  const anchors = new Set();
  const used = new Set();
  const addHeading = value => {
    const base = unescape(value.replace(/!?(?:\[([^\]]+)\])\([^)]*\)/g, '$1').replace(/<[^>]*>/g, ''))
      .toLowerCase().replace(/[^\p{L}\p{M}\p{N}_\- ]/gu, '').replace(/ /g, '-');
    let id = base;
    let suffix = 0;
    while (used.has(id)) id = `${base}-${++suffix}`;
    used.add(id);
    anchors.add(id);
  };
  const lines = visible.split(/\r?\n/);
  lines.forEach((line, index) => {
    const heading = line.match(/^ {0,3}#{1,6}(?:\s+|$)(.*?)(?:\s+#+\s*)?$/);
    if (heading) addHeading(heading[1]);
    else if (index && /^ {0,3}(?:=+|-+)\s*$/.test(line) && lines[index - 1].trim()
      && !/^\s*(?:[|>#]|[-*+]\s)/.test(lines[index - 1])) addHeading(lines[index - 1].trim());
  });
  for (const match of visible.matchAll(/<[a-z][^>]*\s(?:id|name)\s*=\s*(?:"([^"]+)"|'([^']+)')/gi)) {
    anchors.add(unescape(match[1] ?? match[2]));
  }
  const refs = new Map();
  let searchable = visible.replace(/`+[^`\n]*`+/g, blank);
  searchable = searchable.replace(/^ {0,3}\[([^\]\n]+)\]:\s*(.+)$/gm, (whole, label, target) => {
    refs.set(referenceKey(label), destination(target));
    return blank(whole);
  });
  const links = [];
  const add = (href, index, kind) => links.push({ href, line: searchable.slice(0, index).split('\n').length, index, kind });
  for (let index = 0; index < searchable.length; index++) {
    if (searchable[index] === '\\') { index++; continue; }
    if (searchable[index] !== '[') continue;
    let end = index + 1;
    let depth = 1;
    for (; end < searchable.length; end++) {
      if (searchable[end] === '\\') { end++; continue; }
      if (searchable[end] === '[') depth++;
      if (searchable[end] === ']' && --depth === 0) break;
    }
    if (depth !== 0) continue;
    const label = searchable.slice(index + 1, end);
    if (searchable[end + 1] === '(') {
      let close = end + 2;
      let parens = 1;
      let angle = false;
      for (; close < searchable.length; close++) {
        const char = searchable[close];
        if (char === '\\') { close++; continue; }
        if (char === '<') angle = true;
        if (char === '>') angle = false;
        if (!angle && char === '(') parens++;
        if (!angle && char === ')' && --parens === 0) break;
      }
      if (parens === 0) {
        add(destination(searchable.slice(end + 2, close)), index, 'inline');
        index = close;
      }
    } else if (searchable[end + 1] === '[') {
      const close = searchable.indexOf(']', end + 2);
      if (close !== -1) {
        const key = referenceKey(searchable.slice(end + 2, close) || label);
        if (refs.has(key)) add(refs.get(key), index, 'reference');
        index = close;
      }
    } else if (refs.has(referenceKey(label))) {
      add(refs.get(referenceKey(label)), index, 'shortcut');
      index = end;
    }
  }
  for (const match of searchable.matchAll(/<(?:a|img|source|video|audio|link)\b[^>]*?\b(?:href|src)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
    add(unescape(match[1] ?? match[2]), match.index, 'html');
  }
  links.sort((a, b) => a.index - b.index);
  return { links, anchors };
}

function resolveTarget(source, href) {
  if (/^[a-z]:[\\/]|^\\\\/i.test(href)) return { skip: 'absolute-local' };
  if (/^\/(?:Users|Volumes|home|tmp|var|mnt|private)\//.test(href)) return { skip: 'absolute-local' };
  if (/^[a-z][a-z\d+.-]*:|^\/\//i.test(href)) return { skip: 'external' };
  try {
    const hash = href.indexOf('#');
    const fragment = hash < 0 ? '' : decodeURIComponent(href.slice(hash + 1));
    const file = decodeURIComponent((hash < 0 ? href : href.slice(0, hash)).split('?')[0]);
    const target = file ? path.posix.normalize(file.startsWith('/') ? file.slice(1) : path.posix.join(path.posix.dirname(source), file)) : source;
    if (target === '..' || target.startsWith('../')) return { error: 'outside-repository' };
    return { path: target.replace(/\/$/, ''), fragment };
  } catch { return { error: 'invalid-percent-encoding' }; }
}

function selfTest() {
  const doc = [
    '# 한글 제목!', '# 한글 제목!', '# 한글 제목!-1', '# 한글 제목!',
    'Setext **title**', '---', '<a id="manual-anchor"></a>',
    '[nested](../folder/a(b).md#part) [space](<../folder/a b.md>)',
    '[reference][r] ![image](../art.png) <a href="other.md#x">html</a>',
    '[r]: ../reference.md#ok "title"',
    '`[inline](fake.md)` <!-- [comment](fake.md) -->',
    '```md', '# fake-heading', '[fenced](fake.md)', '```',
    '[escaped](a\\(b\\).md) [query](a.md?raw=1#hello)',
    '[external](https://example.com/a#b) [same](#한글-제목)',
  ].join('\r\n');
  const parsed = parseMarkdown(doc);
  assert.deepEqual(parsed.links.map(link => link.href), [
    '../folder/a(b).md#part', '../folder/a b.md', '../reference.md#ok',
    '../art.png', 'other.md#x', 'a(b).md', 'a.md?raw=1#hello',
    'https://example.com/a#b', '#한글-제목',
  ], 'extract real links, exclude code/comments, preserve order and nested parentheses');
  assert.equal(parsed.links[0].line, 8, 'CRLF source line numbers');
  for (const id of ['한글-제목', '한글-제목-1', '한글-제목-1-1', '한글-제목-2', 'setext-title', 'manual-anchor']) {
    assert.ok(parsed.anchors.has(id), `heading/explicit anchor: ${id}`);
  }
  assert.ok(!parsed.anchors.has('fake-heading'));
  assert.deepEqual(resolveTarget('docs/a/source.md', '../b/a%20b.md?raw=1#한글-제목'),
    { path: 'docs/b/a b.md', fragment: '한글-제목' });
  assert.deepEqual(resolveTarget('CLAUDE.md', '#here'), { path: 'CLAUDE.md', fragment: 'here' });
  assert.deepEqual(resolveTarget('docs/a.md', '/CLAUDE.md'), { path: 'CLAUDE.md', fragment: '' });
  assert.equal(resolveTarget('docs/a.md', 'https://example.com').skip, 'external');
  assert.equal(resolveTarget('docs/a.md', 'G:/private.md').skip, 'absolute-local');
  assert.equal(resolveTarget('docs/a.md', '../../outside.md').error, 'outside-repository');
  assert.equal(resolveTarget('docs/a.md', '%ZZ.md').error, 'invalid-percent-encoding');
  console.log('SELF-TEST PASS: links, headings, duplicate anchors, encoding, sparse-safe paths, CRLF');
}

const git = args => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 192 * 1024 * 1024, windowsHide: true }).trim();

function snapshot(ref) {
  const sha = git(['rev-parse', '--verify', `${ref}^{commit}`]);
  const tree = execFileSync('git', ['ls-tree', '-rz', sha], { maxBuffer: 192 * 1024 * 1024, windowsHide: true })
    .toString('utf8').split('\0').filter(Boolean).map(entry => {
      const tab = entry.indexOf('\t');
      const [mode, type, oid] = entry.slice(0, tab).split(' ');
      return { mode, type, oid, name: entry.slice(tab + 1) };
    });
  const files = new Map(tree.map(entry => [entry.name, entry]));
  const directories = new Set(['.']);
  for (const name of files.keys()) {
    let parent = path.posix.dirname(name);
    while (parent !== '.') { directories.add(parent); parent = path.posix.dirname(parent); }
  }
  const sources = tree.filter(entry => entry.type === 'blob' && (entry.name === 'CLAUDE.md'
    || entry.name.startsWith('docs/') && /\.(?:md|markdown|mdown|html?)$/i.test(entry.name)));
  const contents = new Map();
  const batch = execFileSync('git', ['cat-file', '--batch'], {
    input: sources.map(entry => entry.oid).join('\n') + '\n',
    maxBuffer: 192 * 1024 * 1024, windowsHide: true,
  });
  let offset = 0;
  for (const entry of sources) {
    const end = batch.indexOf(10, offset);
    const size = Number(batch.subarray(offset, end).toString().split(' ')[2]);
    assert.ok(Number.isSafeInteger(size), 'cat-file blob size');
    contents.set(entry.name, batch.subarray(end + 1, end + 1 + size).toString('utf8'));
    offset = end + 1 + size + 1;
  }
  return { sha, tree, files, directories, contents };
}

function audit(state) {
  const parsed = new Map([...state.contents].map(([name, text]) => [name, parseMarkdown(text)]));
  const findings = [];
  const counts = new Map();
  const folders = new Map();
  const count = (map, key) => map.set(key, (map.get(key) ?? 0) + 1);
  for (const [source, doc] of parsed) {
    const group = source.startsWith('docs/') ? source.split('/')[1] : 'CLAUDE.md';
    if (!folders.has(group)) folders.set(group, { files: 0, links: 0, pass: 0, fail: 0, review: 0, skip: 0 });
    const folder = folders.get(group);
    folder.files++;
    for (const link of doc.links) {
      folder.links++;
      const target = resolveTarget(source, link.href);
      let status = 'PASS';
      let reason = 'path-exists';
      if (target.skip) { status = 'SKIP'; reason = target.skip; }
      else if (target.error) { status = 'FAIL'; reason = target.error; }
      else if (!state.files.has(target.path) && !state.directories.has(target.path)) {
        status = 'FAIL'; reason = 'missing-path';
      } else if (target.fragment) {
        if (!parsed.has(target.path)) { status = 'REVIEW'; reason = 'non-markdown-anchor'; }
        else if (!parsed.get(target.path).anchors.has(target.fragment)) { status = 'FAIL'; reason = 'missing-anchor'; }
        else reason = 'anchor-exists';
      }
      count(counts, `${status}:${reason}`);
      folder[status.toLowerCase()]++;
      if (status === 'FAIL' || status === 'REVIEW') findings.push({ source, ...link, ...target, status, reason });
    }
  }
  const required = [];
  const claudeLines = state.contents.get('CLAUDE.md').split(/\r?\n/);
  let section = false;
  claudeLines.forEach((line, index) => {
    if (/^## 6\./.test(line)) { section = true; return; }
    if (section && /^## /.test(line)) section = false;
    if (!section || !line.startsWith('|')) return;
    const cells = line.split('|').slice(1, -1).map(cell => cell.trim());
    if (cells[0] === '작업' || /^-+$/.test(cells[0])) return;
    const paths = [...(cells[1] ?? '').matchAll(/`([^`]+)`/g)].map(match => match[1]);
    // The map-history index is mentioned by basename, alongside its parent map board.
    const context = paths.find(name => name.includes('/'));
    if (!paths.length) required.push({ task: cells[0], line: index + 1, path: '같은 문서의 절(직접 경로 없음)', status: '간접 참조' });
    for (const name of paths) {
      const full = path.posix.join('docs', name.includes('/') ? name : path.posix.join(path.posix.dirname(context ?? ''), name));
      required.push({ task: cells[0], line: index + 1, path: full, status:
        state.files.has(full) || state.directories.has(full.replace(/\/$/, '')) ? 'PASS' : 'FAIL' });
    }
  });
  assert.ok(section === false && required.length > 0, 'CLAUDE section 6 required paths found');
  return { parsed, counts, folders, findings, required };
}

const cell = value => String(value ?? '').replace(/\r?\n/g, ' ').replace(/\|/g, '&#124;').replace(/`/g, 'ˋ');
const code = value => '`' + cell(value) + '`';

function render(state, result) {
  const lines = [];
  const add = (...rows) => lines.push(...rows);
  const sum = prefix => [...result.counts].filter(([key]) => key.startsWith(prefix)).reduce((total, [, n]) => total + n, 0);
  add('# K3 docs 링크 점검 결과 (보고 전용)', '',
    `- 검사 시각: ${new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul', dateStyle: 'short', timeStyle: 'medium' }).format(new Date())} KST`,
    `- 검사 기준: origin/unity/main을 fetch한 뒤 고정한 ${code(state.sha)}. 이후 줄기 변경은 포함하지 않는다.`,
    '- 작업 브랜치: `codex/unity-docs-linkcheck-20261104`. 문서 원문 수정·Unity 실행·줄기 병합 없음.',
    '- 산출물: 이 결과표와 `tools/linkcheck.mjs` 두 파일. 기존 CHANGELOG_SYNC.md는 소유 범위 밖이므로 수정하지 않음.', '',
    '| 검사 | 결과 |', '|---|---|',
    `| 문서 소스 | ${result.parsed.size}개 (CLAUDE.md + docs 아래 Markdown/HTML, 보관 문서 포함) |`,
    `| 링크 발생 수 | ${sum('PASS:') + sum('FAIL:') + sum('REVIEW:') + sum('SKIP:')} |`,
    `| 존재 확인 PASS | ${sum('PASS:')} |`,
    `| 누락/형식 FAIL | ${sum('FAIL:')} |`,
    `| 수동 확인 REVIEW | ${sum('REVIEW:')} |`,
    `| 범위 밖 SKIP | ${sum('SKIP:')} (외부 URL·절대 로컬 경로) |`,
    `| CLAUDE 6절 | 직접 경로 ${result.required.filter(row => row.status !== '간접 참조').length}개, 누락 ${result.required.filter(row => row.status === 'FAIL').length}개, 간접 참조 ${result.required.filter(row => row.status === '간접 참조').length}개 |`, '',
    '## 방법과 한계', '',
    '- 파일/디렉터리 존재는 고정 커밋의 `git ls-tree -rz`, 내용은 `git cat-file --batch`로 검사한다. sparse checkout 밖 파일을 누락으로 세지 않는다. 대소문자는 Git 경로 그대로 비교한다. /Users·/Volumes·/home 등 호스트 절대 경로는 제외하고, 그 밖의 /로 시작하는 링크는 저장소 루트 기준으로 해석한다.',
    '- Markdown 인라인·이미지·정의된 참조/축약 링크와 HTML href/src를 검사한다. 괄호 중첩, <공백 경로>, 백슬래시 escape, percent encoding, query를 처리한다. 코드 블록·인라인 코드·HTML 주석은 링크 집계에서 제외한다.',
    '- 제목은 ATX·Setext와 중복 suffix를 처리하고, 소문자·한글 유지·공백→하이픈·문장부호 제거 규칙으로 앵커를 계산한다. HTML id/name도 인정한다. 원문 줄 번호는 CRLF/LF 모두 보존한다.',
    '- CommonMark/GFM 전체 파서는 아니다. 복잡한 다중행 참조 정의·목록/인용 내부 코드·수식·HTML 블록의 Markdown·특수 기호 제목은 렌더러와 차이가 날 수 있으므로 앵커 FAIL은 아래 원문 위치를 대조해야 한다. GitHub/에디터 브라우저 렌더링, 외부 HTTP, 비텍스트 파일 내부 앵커는 미확인이다.',
    '- 일반 백틱 경로·평문 파일명은 링크가 아니므로 전체 링크 검사에 넣지 않는다. 요청된 CLAUDE 6절의 “착수 전에 읽기” 백틱 경로는 별도로 전부 확인한다. “해당 DESIGN LOCK”·“실버 헬 먼저” 등의 자연어 지시는 특정 파일 검증으로 확대하지 않는다.',
    '- 자체 테스트 PASS: `--self-test` (실제 링크와 코드 예제 구분, 중복/한글/명시 앵커, 경로 인코딩, 저장소 이탈, CRLF 줄 번호), `--test-host-paths` (호스트 절대 경로 제외). 각각 결함/미구현 재현 후 수정한 도구로 통과를 확인했다. 본 보고의 링크 FAIL은 저장소 감사 결과이며 도구 실행 실패와 구분한다.', '',
    '## 재현', '', '```powershell',
    `& 'C:/nvm4w/nodejs/node.exe' 'docs/0마스터플랜/worklog/cloud-lanes/tools/linkcheck.mjs' --self-test`,
    `& 'C:/nvm4w/nodejs/node.exe' 'docs/0마스터플랜/worklog/cloud-lanes/tools/linkcheck.mjs' --test-host-paths`,
    `& 'C:/nvm4w/nodejs/node.exe' 'docs/0마스터플랜/worklog/cloud-lanes/tools/linkcheck.mjs' --ref ${state.sha}`,
    '```', '', '기본은 표준 출력만 한다. 결과표를 갱신하려면 `--output`을 붙이며, 지정된 K3 결과표 한 파일만 쓴다.', '',
    '## 원인별 집계', '', '| 상태:원인 | 발생 수 |', '|---|---|');
  for (const [reason, total] of [...result.counts].sort()) add(`| ${code(reason)} | ${total} |`);
  add('', '## 폴더별 결과', '', '| 폴더 | 문서 | 링크 | PASS | FAIL | REVIEW | SKIP |', '|---|---:|---:|---:|---:|---:|---:|');
  for (const [folder, n] of [...result.folders].sort()) add(`| ${code(folder)} | ${n.files} | ${n.links} | ${n.pass} | ${n.fail} | ${n.review} | ${n.skip} |`);
  add('', '## CLAUDE.md 6절 “착수 전에 읽기”', '', '| 작업 | 원문 줄 | docs 기준 경로 | 판정 |', '|---|---:|---|---|');
  for (const row of result.required) add(`| ${cell(row.task)} | ${row.line} | ${code(row.path)} | ${row.status} |`);
  add('', '## 누락 및 수동 확인 전체 목록', '', '| 상태 | 원인 | 원문 파일:줄 | 링크 원문 | 해석한 대상 |', '|---|---|---|---|---|');
  for (const item of result.findings) add(`| ${item.status} | ${item.reason} | ${code(`${item.source}:${item.line}`)} | ${code(item.href)} | ${code((item.path ?? '') + (item.fragment ? '#' + item.fragment : ''))} |`);
  if (!result.findings.length) add('| — | — | 누락 없음 | — | — |');
  add('', '## 인계', '',
    '- 완료 기준: 고정 unity/main 스냅샷 링크 및 앵커 검사, CLAUDE 6절 경로 확인, 누락 전체 결과표 작성. 링크 수정은 배정하지 않았으므로 수행하지 않는다.',
    '- 미확인: CTO 병합 이후 최신 줄기 재검사, 실제 Markdown 렌더러 앵커 대조, 외부 링크 접속, 자연어 선행 문서 특정.',
    '- 규칙 충돌: 11-05 Codex 새 배정 금지 문구보다 이번 K3 명시 배정을 우선했다. CHANGELOG 의무보다 이번 “두 산출물만/문서 수정 금지” 소유 범위를 우선했다.',
    '- CHANGELOG_SYNC 인계 초안: “K3: unity/main docs/·CLAUDE 상대 링크/앵커·6절 선행 경로 감사와 재현 도구 추가. 원문 수정 없음. 기준 SHA와 누락은 K3 결과표 참조.”',
    '- 원본 보존·줄 단위 CR 검증, 커밋·원격 SHA 일치 및 worktree 정리는 제출 시 Git/파일 검증으로 확인한다. 본 표에 자기 커밋 SHA를 삽입하지 않는다.', '', 'END', '');
  return lines.join('\n');
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--test-host-paths')) {
    for (const href of ['/Users/someone/report.md', '/Volumes/drive/report.md', '/home/worker/a.md']) {
      assert.equal(resolveTarget('docs/a.md', href).skip, 'absolute-local', `host path excluded: ${href}`);
    }
    console.log('HOST-PATH TEST PASS');
    return;
  }
  if (args.includes('--self-test')) { selfTest(); return; }
  let ref = 'HEAD';
  let output = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--ref' && args[i + 1]) ref = args[++i];
    else if (args[i] === '--output') output = true;
    else throw new Error(`Unknown/incomplete argument: ${args[i]}`);
  }
  const root = git(['rev-parse', '--show-toplevel']);
  process.chdir(root);
  const state = snapshot(ref);
  const result = audit(state);
  const report = render(state, result);
  if (output) {
    fs.mkdirSync(path.dirname(REPORT), { recursive: true });
    fs.writeFileSync(REPORT, report, 'utf8');
    console.log(JSON.stringify({ ref: state.sha, documents: result.parsed.size, counts: Object.fromEntries(result.counts),
      requiredPaths: result.required.length, requiredMissing: result.required.filter(row => row.status === 'FAIL').length,
      report: REPORT }));
  } else process.stdout.write(report);
  // A report-only audit succeeds even if the audited repository has broken links.
}

main();
