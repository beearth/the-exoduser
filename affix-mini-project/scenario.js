const round = (value) => Math.round(value * 10) / 10;

export const SCENARIOS = {
  'U-D03': {
    title: '처내기 → 기검참 3타',
    premise: 'E 처내기를 90f 완충전해 실제로 적중시키는 경우',
    metrics: [['shieldCharge', '처내기 충전', 'f'], ['kiCharge', '선지급 홀드', 'f'], ['remainingCharge', '남은 홀드', 'f']],
    initial: { shieldCharge: 0, kiCharge: 0, remainingCharge: 120 },
    steps: [
      { label: 'E 처내기 완충전', apply: (m) => { m.shieldCharge = 90; return '완충전 90f를 채웠습니다.'; } },
      { label: '적 또는 탄막에 적중', apply: (_, roll) => `다음 기검참 3타에 ${roll}f 선지급 토큰을 예약합니다.` },
      { label: '좌클 기검참 3타 진입', apply: (m, roll) => { m.kiCharge = roll; m.remainingCharge = 120 - roll; return `120f 홀드 중 ${roll}f를 선지급해 ${m.remainingCharge}f가 남습니다.`; } },
    ],
  },
  'U-D05': {
    title: '뇌전걸음 표식 → 사슬 추격',
    premise: '기동게이지 1칸(45)에서 시작해 표식 적 1명을 5초 안에 처치하는 경우',
    metrics: [['mobility', '기동게이지', ''], ['marked', '살아 있는 표식', '명'], ['refund', '표식 처치 회수', '']],
    initial: { mobility: 45, marked: 0, refund: 0 },
    steps: [
      { label: 'Ctrl 뇌전걸음 표식', apply: (m) => { m.marked = 1; return '귀환 뒤 유효한 표식 1개가 남았습니다.'; } },
      { label: '5초 안에 표식 적 처치', apply: (m, roll) => { m.refund = round(Math.min(27, 45 * roll / 100)); m.mobility = round(m.mobility + m.refund); m.marked = 0; return `1칸 45의 ${roll}% = ${m.refund}을 회수합니다.`; } },
      { label: 'Shift 전격이동', apply: (m) => { m.mobility = round(m.mobility - 31.5); return `전격이동 비용 31.5를 쓰고 ${m.mobility}가 남습니다.`; } },
    ],
  },
  'U-D09': {
    title: '전격이동 두 번 → 쌍극 전류',
    premise: '기동게이지 150과 전류장판 틱 피해 100을 기준으로 한 비율 예시',
    metrics: [['mobility', '기동게이지', ''], ['fields', '전류장판', '개'], ['lineDamage', '전류선 1틱', '피해']],
    initial: { mobility: 150, fields: 0, lineDamage: 0 },
    steps: [
      { label: '첫 전격이동', apply: (m) => { m.mobility -= 31.5; m.fields = 1; return '전류장판 1개를 남겼습니다.'; } },
      { label: '두 번째 전격이동', apply: (m) => { m.mobility -= 31.5; m.fields = 2; return '살아 있는 전류장판 두 개 사이에 전류선 1개를 잇습니다.'; } },
      { label: '전류선 적중 1회', apply: (m, roll) => { m.lineDamage = roll; return `장판 틱 100의 ${roll}% = ${roll} 피해. 방어 감소는 추가하지 않습니다.`; } },
    ],
  },
  'U-D10': {
    title: '지옥강타 → 잔불 분노',
    premise: '분노 100을 지옥강타에 모두 소모하는 경우',
    metrics: [['rage', '현재 분노', ''], ['spentRage', '강타 소모', ''], ['returnedRage', '잔불 회수', '']],
    initial: { rage: 100, spentRage: 0, returnedRage: 0 },
    steps: [
      { label: 'Space 지옥강타 발동', apply: (m) => { m.spentRage = m.rage; m.rage = 0; return '폭발 계수는 소모 전 분노 100으로 계산합니다.'; } },
      { label: '잔불 분노 복원', apply: (m, roll) => { m.returnedRage = Math.min(30, m.spentRage * roll / 100); m.rage = m.returnedRage; return `소모량의 ${roll}%를 돌려받습니다. 최대 30, 충만 래치는 재발동하지 않습니다.`; } },
    ],
  },
  'U-D12': {
    title: '회복의 영역 → Q 패링',
    premise: '기본 영역 쿨 1800f에서 시작, 영역 안 Q 패링 성공 3회',
    metrics: [['domeCooldown', '영역 남은 쿨', 'f'], ['parries', '영역 안 패링', '회'], ['refund', '총 쿨 회복', 'f']],
    initial: { domeCooldown: 0, parries: 0, refund: 0 },
    steps: [
      { label: 'F 회복의 영역 설치', apply: (m) => { m.domeCooldown = 1800; return '영역을 설치하고 기본 쿨 1800f를 시작합니다.'; } },
      { label: '영역 안 Q 패링 성공', apply: (m, roll) => { m.parries = 1; m.refund = roll; m.domeCooldown -= roll; return `${roll}f 회복. 설치한 영역 안의 성공 패링만 인정합니다.`; } },
      { label: 'Q 패링 2회 더 성공', apply: (m, roll) => { m.parries = 3; m.refund = Math.min(300, roll * 3); m.domeCooldown = 1800 - m.refund; return `영역당 최대 300f 회복 상한을 적용해 총 ${m.refund}f 회복합니다.`; } },
    ],
  },
  'U-D13': {
    title: '가시덫 처치 → 번지는 뿌리',
    premise: '원본 가시덫 틱 피해 100을 기준으로 한 비율 예시',
    metrics: [['traps', '원본 덫', '개'], ['children', '자식 덫', '개'], ['childTick', '자식 틱', '피해']],
    initial: { traps: 0, children: 0, childTick: 0 },
    steps: [
      { label: '1~4 가시덫 설치', apply: (m) => { m.traps = 1; return '원본 덫 1개를 설치합니다.'; } },
      { label: '원본 덫 DOT로 처치', apply: (m) => { m.children = 1; return '사망 위치에 180f 지속 자식 덫 1개를 만듭니다.'; } },
      { label: '자식 덫 틱 1회', apply: (m, roll) => { m.childTick = roll; return `원본 틱 100의 ${roll}% = ${roll} 피해. 자식 처치는 덫을 더 만들지 않습니다.`; } },
    ],
  },
  'U-D14': {
    title: '폭풍소환 안 악의구 폭발',
    premise: '악의구 원래 폭발 피해 100을 기준으로 한 비율 예시',
    metrics: [['vortex', '소용돌이', '개'], ['orbExplosion', '원래 폭발', '피해'], ['pulseDamage', '추가 충격파', '피해']],
    initial: { vortex: 0, orbExplosion: 100, pulseDamage: 0 },
    steps: [
      { label: '1~4 폭풍소환 배치', apply: (m) => { m.vortex = 1; return '소용돌이 1개가 390f 동안 유지됩니다.'; } },
      { label: '영역 안 악의구 폭발', apply: (m, roll) => { m.pulseDamage = m.orbExplosion * roll / 100; return `원 폭발 100의 ${roll}% = ${m.pulseDamage} 추가 충격파. 소용돌이별 120f 간격입니다.`; } },
    ],
  },
  'U-D17': {
    title: '블랙 → 공격 장판 수렴',
    premise: '이동 가능한 공격 장판 3개와 제외 대상 전류장판 1개가 있는 경우',
    metrics: [['manaCost', '최대 MP 소모', '%'], ['movedZones', '중심으로 이동', '개'], ['shockZones', '제외된 전류장판', '개']],
    initial: { manaCost: 0, movedZones: 0, shockZones: 1 },
    steps: [
      { label: 'Z 블랙 발동', apply: (m) => { m.manaCost = 30; return '최대 MP의 30%를 쓰며 블랙 자체 피해는 0입니다.'; } },
      { label: '흡인 종료 · 장판 수렴', apply: (m, roll) => { m.movedZones = Math.min(3, roll); return `공격 장판 ${m.movedZones}개를 중심으로 옮깁니다. 전류장판 1개는 제외합니다.`; } },
    ],
  },
};

export function createRun(candidate, roll) {
  if (!candidate || !SCENARIOS[candidate.id]) throw new Error('우선 제작 TOP 8 후보만 실험할 수 있습니다.');
  if (!Number.isInteger(roll) || roll < candidate.min || roll > candidate.max) throw new Error('옵션 롤이 후보 범위를 벗어났습니다.');
  return { id: candidate.id, roll, index: 0, metrics: { ...SCENARIOS[candidate.id].initial }, events: [] };
}

export function advanceRun(run) {
  const scenario = SCENARIOS[run.id];
  const step = scenario.steps[run.index];
  if (!step) return run;
  const metrics = { ...run.metrics };
  const detail = step.apply(metrics, run.roll);
  return { ...run, index: run.index + 1, metrics, events: [...run.events, { label: step.label, detail }] };
}
