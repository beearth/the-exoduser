import { lookupDefinition } from './definitions.js';
import { lookupRoll, describeRoll, toStoredValue } from './roll-values.js';

function localized(language, korean, english) {
  return language === 'ko' ? korean : english;
}

export function describeD10Tooltip(raw = 15, language = 'ko') {
  if (language !== 'ko' && language !== 'en') throw new RangeError('지원하지 않는 언어');
  const definition = lookupDefinition('UI-10');
  const proposal = lookupRoll(definition.effectId);
  const roll = describeRoll(proposal.uniqueId, raw);
  const stored = toStoredValue(proposal.uniqueId, raw);
  return Object.freeze({
    uniqueId: definition.uniqueId,
    effectId: definition.effectId,
    raw, stored, language,
    enabled: definition.enabled,
    status: definition.status,
    range: `${proposal.min}~${proposal.max}%`,
    selected: roll.text,
    description: localized(language,
      `분노 100 이상을 실제로 소모한 성공 지옥강타 직후, 소모한 분노의 ${roll.text}를 잔여 분노로 복원합니다. 잔여 분노는 최대 30입니다.`,
      `Immediately after a successful Hell Slam that actually spends at least 100 Rage, restore ${roll.text} of the Rage spent as remaining Rage, up to 30.`),
    note: localized(language,
      '피해 계산은 소모 전 분노 기준을 유지하며, 분노 최대치 도달 효과를 재발동시키지 않습니다.',
      'Damage still uses Rage before spending. This does not retrigger effects for reaching maximum Rage.'),
    disclaimer: localized(language,
      'UI-10 / U-D10 단일아이템 개발 검토용 후보 · 미채택·비활성 · 게임 효과가 아닙니다.',
      'UI-10 / U-D10 single-item development review candidate · unaccepted and inactive · not an active game effect.')
  });
}

export function mountD10Tooltip(card, document) {
  if (card.dataset.uniqueId !== 'UI-10') throw new RangeError('UI-10 카드만 허용');
  const section = document.createElement('section');
  section.className = 'd10-tooltip';
  section.setAttribute('aria-label', 'UI-10 / U-D10 한영 툴팁 후보');
  const heading = document.createElement('h3');
  heading.textContent = 'U-D10 · 잔불 분노 툴팁 후보';
  const controls = document.createElement('div');
  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-label', '롤 선택 / Roll selection');
  const selection = document.createElement('p');
  selection.className = 'd10-selection';
  selection.setAttribute('role', 'status');
  const korean = document.createElement('p');
  korean.lang = 'ko';
  const english = document.createElement('p');
  english.lang = 'en';
  const koreanNote = document.createElement('p');
  koreanNote.lang = 'ko';
  const englishNote = document.createElement('p');
  englishNote.lang = 'en';
  const disclaimer = document.createElement('p');
  disclaimer.lang = 'ko';
  const englishDisclaimer = document.createElement('p');
  englishDisclaimer.lang = 'en';
  const proposal = lookupRoll('UI-10');
  const choices = [
    ['최소 / Minimum', proposal.min],
    ['중간 / Midpoint', (proposal.min + proposal.max) / 2],
    ['최대 / Maximum', proposal.max]
  ];
  const buttons = [];
  function select(raw) {
    const ko = describeD10Tooltip(raw, 'ko');
    const en = describeD10Tooltip(raw, 'en');
    selection.textContent = `범위 / Range: ${ko.range} · 선택 / Selected: ${ko.selected}`;
    korean.textContent = ko.description;
    english.textContent = en.description;
    koreanNote.textContent = ko.note;
    englishNote.textContent = en.note;
    disclaimer.textContent = ko.disclaimer;
    englishDisclaimer.textContent = en.disclaimer;
    for (const button of buttons) button.setAttribute('aria-pressed', String(Number(button.dataset.roll) === raw));
  }
  for (const [label, raw] of choices) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.roll = String(raw);
    button.textContent = `${label} ${describeRoll('UI-10', raw).text}`;
    button.addEventListener('click', () => select(raw));
    buttons.push(button);
    controls.append(button);
  }
  section.append(heading, controls, selection, korean, english, koreanNote, englishNote, disclaimer, englishDisclaimer);
  select(choices[1][1]);
  card.append(section);
  return section;
}
