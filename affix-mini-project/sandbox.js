import { parseCandidates, rollCandidate } from './model.js';
import { SCENARIOS, createRun, advanceRun } from './scenario.js';

const SOURCE = '../docs/7아이템디자인/유니크_어픽스_리스트.md';
const ORDER = ['U-D03', 'U-D10', 'U-D12', 'U-D05', 'U-D14', 'U-D13', 'U-D09', 'U-D17'];
const state = { candidates: new Map(), candidate: null, roll: null, run: null };
const byId = (id) => document.getElementById(id);
const plain = (value) => value.replace(/\*\*|`/g, '');
function text(id, value) {
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
function format(value) { return new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 1 }).format(value); }

function choose(id) {
  const candidate = state.candidates.get(id);
  if (!candidate || !SCENARIOS[id]) return;
  state.candidate = candidate;
  state.roll = rollCandidate(candidate);
  state.run = createRun(candidate, state.roll.value);
  history.replaceState(null, '', `?affix=${id}`);
  render();
}

function renderNavigation() {
  const buttons = ORDER.map((id, index) => {
    const candidate = state.candidates.get(id);
    const button = node('button', 'scenario-button');
    button.type = 'button';
    button.setAttribute('aria-current', String(id === state.candidate.id));
    const copy = node('span', 'scenario-copy', candidate.name);
    copy.append(node('small', '', id));
    button.append(node('span', 'scenario-number', String(index + 1).padStart(2, '0')), copy);
    button.addEventListener('click', () => choose(id));
    return button;
  });
  byId('scenario-list').replaceChildren(...buttons);
}

function renderSteps() {
  const { index, id } = state.run;
  const steps = SCENARIOS[id].steps;
  const list = steps.map((step, position) => {
    const item = node('li', position < index ? 'done' : position === index ? 'next' : '', step.label);
    if (position < index) item.setAttribute('aria-label', `${step.label} 완료`);
    return item;
  });
  byId('step-list').replaceChildren(...list);
  text('step-count', `${String(index).padStart(2, '0')} / ${String(steps.length).padStart(2, '0')}`);
  text('action-index', index < steps.length ? `${String(index + 1).padStart(2, '0')} / ${String(steps.length).padStart(2, '0')}` : '완료');
  const button = byId('advance-button');
  button.disabled = index >= steps.length;
  const label = button.querySelector('span');
  button.firstChild.textContent = index >= steps.length ? '시퀀스 완료 ' : `${steps[index].label} 실행 `;
  label.textContent = index >= steps.length ? '✓' : '→';
}

function renderMetrics() {
  const cards = SCENARIOS[state.run.id].metrics.map(([key, label, unit]) => {
    const card = node('div', 'metric-card');
    card.append(node('span', '', label), node('strong', '', format(state.run.metrics[key])), node('small', '', unit));
    return card;
  });
  byId('metric-list').replaceChildren(...cards);
}

function renderLog() {
  const events = state.run.events.length ? state.run.events.map((event, index) => {
    const row = node('li', '');
    row.append(node('strong', '', `${String(index + 1).padStart(2, '0')} / ${event.label}`), node('span', '', event.detail));
    return row;
  }) : [node('li', 'empty', '아직 실행한 행동이 없습니다.')];
  byId('event-log').replaceChildren(...events);
  text('last-result', state.run.events.at(-1)?.detail || '시작 상태입니다. 첫 행동을 실행해 보세요.');
}

function render() {
  const candidate = state.candidate;
  const scenario = SCENARIOS[candidate.id];
  renderNavigation();
  text('scenario-title', scenario.title);
  text('scenario-premise', scenario.premise);
  text('scenario-id', candidate.id);
  text('affix-name', candidate.name);
  text('affix-effect', plain(candidate.effect));
  text('roll-value', state.roll.display);
  text('roll-tier', state.roll.tier);
  text('sigil-number', candidate.id.slice(-2));
  renderSteps();
  renderMetrics();
  renderLog();
}

byId('advance-button').addEventListener('click', () => { state.run = advanceRun(state.run); render(); });
byId('reset-button').addEventListener('click', () => { state.run = createRun(state.candidate, state.roll.value); render(); });
byId('reroll-button').addEventListener('click', () => { state.roll = rollCandidate(state.candidate); state.run = createRun(state.candidate, state.roll.value); render(); });

try {
  const response = await fetch(SOURCE, { cache: 'no-store' });
  if (!response.ok) throw new Error(`설계 문서 응답 ${response.status}`);
  const candidates = parseCandidates(await response.text());
  if (candidates.length !== 22) throw new Error(`후보 ${candidates.length}개만 찾았습니다.`);
  state.candidates = new Map(candidates.map((candidate) => [candidate.id, candidate]));
  const requested = new URLSearchParams(location.search).get('affix');
  choose(ORDER.includes(requested) ? requested : 'U-D03');
} catch (error) {
  byId('sim-error').hidden = false;
  byId('sim-error').querySelector('span').textContent = error.message;
}
