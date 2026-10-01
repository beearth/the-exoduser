export const FIREBALL_TIERS = Object.freeze([.04, .07, .11, .16, .22]);

export function createFireballContract({ eligible, probability, random, emit }) {
  for (const callback of [eligible, probability, random, emit]) {
    if (typeof callback !== 'function') throw new TypeError('모든 계약 콜백을 명시적으로 주입해야 합니다');
  }
  const consumed = new WeakSet();
  let processing = false;
  return function onHit(event) {
    if (!event || typeof event !== 'object') throw new TypeError('적중 이벤트 객체가 필요합니다');
    if (event.noProc === true || event.procOrigin != null) return { status: 'generated-hit-blocked' };
    if (processing) return { status: 'reentrant-blocked' };
    if (consumed.has(event)) return { status: 'duplicate-blocked' };
    consumed.add(event);
    processing = true;
    try {
      const allowed = eligible(event);
      if (typeof allowed !== 'boolean') throw new TypeError('eligible은 boolean을 반환해야 합니다');
      if (!allowed) return { status: 'ineligible' };
      const chance = probability(event, FIREBALL_TIERS);
      if (!Number.isFinite(chance) || chance < 0 || chance > 1) throw new RangeError('확률 계약 미확정/유효하지 않음');
      if (chance === 0) return { status: 'no-affix' };
      const sample = random();
      if (!Number.isFinite(sample) || sample < 0 || sample >= 1) throw new RangeError('난수는 [0,1)이어야 합니다');
      if (sample >= chance) return { status: 'miss' };
      const provenance = Object.freeze({ noProc: true, procOrigin: 'onHitFireball' });
      emit(event, provenance);
      return { status: 'emission-requested' };
    } finally {
      processing = false;
    }
  };
}
