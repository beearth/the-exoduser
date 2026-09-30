import { parseCandidates, rollCandidate, toggleBuild } from './model.js';

const SOURCE = '../docs/7아이템디자인/유니크_어픽스_리스트.md';
const STORAGE_KEY = 'exoduser-affix-lab-build-v1';
const TOP_IDS = new Set(['U-D03', 'U-D10', 'U-D12', 'U-D05', 'U-D14', 'U-D13', 'U-D09', 'U-D17']);
const GROUPS = [
  { label: '전체 후보', first: 1, last: 22 },
  { label: '패링 · 기검참 · 악의구', first: 1, last: 3 },
  { label: 'Ctrl 방어 · 시간', first: 4, last: 6 },
  { label: '사슬 · 전격이동', first: 7, last: 9 },
  { label: '분노 · 천공쇄기', first: 10, last: 11 },
  { label: '영역 · 설치 스킬', first: 12, last: 14 },
  { label: '석궁 · 터렛', first: 15, last: 16 },
  { label: '궁극기', first: 17, last: 18 },
  { label: '속성 · 생존', first: 19, last: 22 },
];
const RISK = { H: '핫패스 성능 · 추가 투사체/장판', U: '새 상태 표시 · 툴팁/번역', S: '소수 % 롤 저장 · 기존 아이템 마이그레이션' };
const state = { candidates: [], selected: 'U-D01', group: 0, topOnly: false, query: '', build: [], rolls: new Map() };

const byId = (id) => document.getElementById(id);
function setLeaf(id, value) {
  const target = byId(id);
  if (target.children.length) throw new Error(`리프 노드가 아닙니다: ${id}`);
  target.textContent = value;
}
function node(tag, className, value) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (value != null) element.textContent = value;
  return element;
}
function plain(markdown) { return markdown.replace(/\*\*|`/g, ''); }
function numberOf(candidate) { return Number(candidate.id.slice(-2)); }
function selectedCandidate() { return state.candidates.find((candidate) => candidate.id === state.selected); }
function saveBuild() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.build)); } catch {} }
function restoreBuild() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (Array.isArray(saved)) state.build = [...new Set(saved)].filter((id) => state.candidates.some((entry) => entry.id === id)).slice(0, 3);
  } catch { state.build = []; }
}

function renderGroups() {
  const buttons = GROUPS.map((group, index) => {
    const button = node('button', 'group-button');
    button.type = 'button';
    button.setAttribute('aria-current', String(index === state.group));
    button.append(node('span', '', group.label), node('span', '', String(group.last - group.first + 1).padStart(2, '0')));
    button.addEventListener('click', () => { state.group = index; renderGroups(); renderCandidates(); });
    return button;
  });
  byId('group-list').replaceChildren(...buttons);
  setLeaf('group-count', String(GROUPS.length - 1).padStart(2, '0'));
}

function matches(candidate) {
  const group = GROUPS[state.group];
  const number = numberOf(candidate);
  if (number < group.first || number > group.last) return false;
  if (state.topOnly && !TOP_IDS.has(candidate.id)) return false;
  if (!state.query) return true;
  const searchable = `${candidate.id} ${candidate.family} ${candidate.name} ${plain(candidate.effect)} ${plain(candidate.balance)}`.toLocaleLowerCase('ko');
  return searchable.includes(state.query);
}

function renderCandidates() {
  const visible = state.candidates.filter(matches);
  const cards = visible.map((candidate) => {
    const card = node('button', 'candidate-card');
    card.type = 'button';
    card.setAttribute('aria-current', String(candidate.id === state.selected));
    card.setAttribute('aria-label', `${candidate.id} ${candidate.name} 상세 보기`);
    const meta = node('div', 'card-meta');
    meta.append(node('strong', '', candidate.id), node('span', '', candidate.family));
    const copy = node('div', 'card-copy');
    copy.append(meta, node('div', 'card-title', candidate.name), node('div', 'card-summary', plain(candidate.effect)));
    const end = node('div', 'card-end');
    if (TOP_IDS.has(candidate.id)) end.append(node('span', 'priority', '★ TOP 8'));
    end.append(node('b', '', `${candidate.min}–${candidate.max}${candidate.unit}`));
    card.append(node('span', 'card-index', String(numberOf(candidate)).padStart(2, '0')), copy, end);
    card.addEventListener('click', () => { state.selected = candidate.id; renderCandidates(); renderDetail(); });
    return card;
  });
  byId('candidate-list').replaceChildren(...cards);
  byId('empty-state').hidden = visible.length !== 0;
  setLeaf('visible-count', `${visible.length} / ${state.candidates.length}`);
}

function renderBuild() {
  setLeaf('build-count', `${state.build.length} / 3`);
  const entries = Array.from({ length: 3 }, (_, index) => {
    const id = state.build[index];
    if (!id) return node('li', 'empty', `${String(index + 1).padStart(2, '0')}  빈 슬롯`);
    const candidate = state.candidates.find((item) => item.id === id);
    const row = node('li', '', `${id}  ${candidate.name}`);
    const remove = node('button', '', '×');
    remove.type = 'button';
    remove.setAttribute('aria-label', `${candidate.name} 빌드에서 제거`);
    remove.addEventListener('click', () => { state.build = toggleBuild(state.build, id); saveBuild(); renderBuild(); renderDetail(); });
    row.append(remove);
    return row;
  });
  byId('build-list').replaceChildren(...entries);
}

function renderDetail() {
  const candidate = selectedCandidate();
  if (!candidate) return;
  byId('sim-launch').href = `./sandbox.html?affix=${TOP_IDS.has(candidate.id) ? candidate.id : 'U-D03'}`;
  setLeaf('detail-id', candidate.id);
  setLeaf('emblem-number', candidate.id.slice(-2));
  setLeaf('detail-family', candidate.family);
  setLeaf('detail-name', candidate.name);
  setLeaf('detail-effect', plain(candidate.effect));
  setLeaf('roll-range', `${candidate.min}–${candidate.max}${candidate.unit}`);
  setLeaf('detail-interaction', plain(candidate.interaction));
  setLeaf('detail-balance', plain(candidate.balance));
  setLeaf('detail-hook', plain(candidate.hook));
  setLeaf('detail-risk', candidate.risk.split('·').map((risk) => RISK[risk.trim()] || risk).join(' / '));
  const roll = state.rolls.get(candidate.id);
  const result = byId('roll-result');
  const value = result.querySelector('strong');
  const tier = result.querySelector('small');
  value.textContent = roll ? (candidate.unit === 'f' ? `${roll.display} · ${(roll.value / 60).toFixed(1)}초` : roll.display) : '—';
  tier.textContent = roll?.tier || '굴리기 전';
  if (roll) result.dataset.tier = roll.tier;
  else delete result.dataset.tier;
  const chosen = state.build.includes(candidate.id);
  const button = byId('build-button');
  button.textContent = chosen ? '✓ 빌드에서 빼기' : '+ 빌드에 담기';
  button.setAttribute('aria-pressed', String(chosen));
  button.disabled = !chosen && state.build.length >= 3;
}

function activate(candidates) {
  if (candidates.length !== 22) throw new Error(`후보 22개 중 ${candidates.length}개만 찾았습니다.`);
  state.candidates = candidates;
  restoreBuild();
  byId('load-error').hidden = true;
  renderGroups();
  renderCandidates();
  renderBuild();
  renderDetail();
}

byId('search').addEventListener('input', (event) => { state.query = event.target.value.trim().toLocaleLowerCase('ko'); renderCandidates(); });
byId('top-filter').addEventListener('click', () => { state.topOnly = !state.topOnly; byId('top-filter').setAttribute('aria-pressed', String(state.topOnly)); renderCandidates(); });
byId('roll-button').addEventListener('click', () => { const candidate = selectedCandidate(); state.rolls.set(candidate.id, rollCandidate(candidate)); renderDetail(); });
byId('build-button').addEventListener('click', () => { state.build = toggleBuild(state.build, state.selected); saveBuild(); renderBuild(); renderDetail(); });
byId('document-file').addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try { activate(parseCandidates(await file.text())); }
  catch (error) { byId('load-error').querySelector('span').textContent = error.message; }
});

try {
  const response = await fetch(SOURCE, { cache: 'no-store' });
  if (!response.ok) throw new Error(`문서 응답 ${response.status}`);
  activate(parseCandidates(await response.text()));
} catch (error) {
  byId('load-error').hidden = false;
  byId('load-error').querySelector('span').textContent = `${error.message} · 프로젝트 서버 3333 포트에서 열거나 문서를 직접 선택해 주세요.`;
}
