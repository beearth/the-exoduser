import { lookupItemProposal } from '../../../unique-item-project/definitions.js';
import { fromStoredValue } from '../../../unique-item-project/roll-values.js';
import { describeD10Tooltip } from '../../../unique-item-project/d10-tooltip.js';

const messages = {
  legacy: ['기존 아이템: D10 저장 제안 효과를 표시하지 않습니다.', 'Legacy item: no stored D10 proposal effect is displayed.'],
  missing: ['D10 저장 롤이 없어 효과를 표시하지 않습니다.', 'No stored D10 roll: no effect is displayed.'],
  invalid: ['D10 저장 제안이 유효하지 않아 효과를 표시하지 않습니다.', 'Invalid stored D10 proposal: no effect is displayed.'],
  'dependency-pending': ['저장 binding 읽기 API 인수 대기: 효과를 표시하지 않습니다.', 'Awaiting the stored binding reader API: no effect is displayed.']
};

function fallback(kind, language) {
  return Object.freeze({ kind, tooltip: null, active: false, text: messages[kind][language === 'ko' ? 0 : 1] });
}

export function createStoredD10TooltipConsumer(readBinding) {
  if (readBinding !== undefined && typeof readBinding !== 'function') throw new TypeError('읽기 포트는 함수여야 합니다');
  return function describeStoredD10(item, language = 'ko') {
    if (language !== 'ko' && language !== 'en') throw new RangeError('지원하지 않는 언어');
    if (!item || typeof item !== 'object' || Array.isArray(item)) return fallback('invalid', language);
    try {
      if (!Object.hasOwn(item, 'uniqueId')) return fallback('legacy', language);
      const definition = lookupItemProposal(item);
      if (!definition || definition.uniqueId !== 'UI-10') return fallback('invalid', language);
      if (!readBinding) return fallback('dependency-pending', language);
      const binding = readBinding(item);
      if (!binding || typeof binding !== 'object' || Array.isArray(binding)) return fallback('invalid', language);
      if (['legacy', 'missing', 'invalid'].includes(binding.kind)) return fallback(binding.kind, language);
      if (binding.kind !== 'proposal' || binding.uniqueId !== definition.uniqueId || binding.effectId !== definition.effectId) return fallback('invalid', language);
      const raw = fromStoredValue(definition.effectId, binding.stored);
      const tooltip = describeD10Tooltip(raw, language);
      return Object.freeze({ kind: 'proposal', tooltip, active: false, text: tooltip.description });
    } catch {
      return fallback('invalid', language);
    }
  };
}

export function mountStoredD10Tooltip(leaf, result) {
  if (leaf.children.length !== 0) throw new TypeError('리프 노드만 허용');
  leaf.textContent = result.kind === 'proposal'
    ? `${result.tooltip.description} ${result.tooltip.note} ${result.tooltip.disclaimer}`
    : result.text;
  leaf.setAttribute('data-binding-state', result.kind);
}
