import assert from 'node:assert/strict';
import { layoutReadings, intersects } from './layout-candidate.mjs';

let checks = 0;
const check = (name, run) => { run(); checks++; console.log(`PASS ${name}`); };
const viewport = { x: 0, y: 0, w: 1280, h: 800 };
const charge = { id: 'charge-1', kind: 'charge', x: 500, y: 300, w: 160, h: 20 };
check('단독 원위치', () => assert.equal(layoutReadings([charge], viewport)[0].deltaY, 0));
check('중복 예고 분리', () => {
  const result = layoutReadings([charge, { ...charge, id: 'charge-2' }], viewport);
  assert.equal(result[1].deltaY, -24);
  assert.equal(intersects(result[0].box, result[1].box, 4), false);
  assert.ok(result[1].leader);
});
check('예고 우선 피해수치 후순위', () => {
  const result = layoutReadings([{ ...charge, id: 'damage-1', kind: 'damage' }, charge], viewport);
  assert.equal(result[1].deltaY, 0);
  assert.equal(result[0].deltaY, 24);
});
check('입력 미변경/결정성', () => {
  const readings = Object.freeze([Object.freeze(charge), Object.freeze({ ...charge, id: 'charge-2' })]);
  assert.deepEqual(layoutReadings(readings, viewport), layoutReadings(readings, viewport));
});
check('120개 포화는 삭제하지 않고 미해결 표시', () => {
  const result = layoutReadings(Array.from({ length: 120 }, (_, index) => ({ ...charge, id: `charge-${index}` })), viewport);
  assert.equal(result.length, 120);
  assert.equal(result.filter(reading => reading.unresolved).length, 115);
});
for (const [width, height] of [[1280, 800], [1324, 982], [390, 844]]) {
  check(`${width} 해상도 모서리`, () => {
    const bounds = { x: 0, y: 0, w: width, h: height };
    const result = layoutReadings([{ ...charge, x: 10, y: 0 }, { ...charge, id: 'charge-2', x: 10, y: 0 }], bounds);
    assert.equal(result[1].deltaY, 24);
    assert.ok(result.every(reading => !reading.unresolved));
  });
}
check('긴 EN 폭 축소/절단 금지', () => {
  const result = layoutReadings([{ ...charge, w: 500 }], { x: 0, y: 0, w: 390, h: 844 });
  assert.equal(result[0].unresolved, true);
  assert.equal(result[0].box.w, 500);
});
check('HUD 예약 구역 회피', () => {
  const result = layoutReadings([charge], viewport, [{ x: 490, y: 296, w: 190, h: 28 }]);
  assert.equal(result[0].deltaY, -48);
});
check('부정확한 좌표 거절', () => assert.throws(() => layoutReadings([{ ...charge, x: NaN }], viewport), TypeError));
check('중복ID 거절', () => assert.throws(() => layoutReadings([charge, charge], viewport), TypeError));
check('빈 프레임 회수', () => assert.deepEqual(layoutReadings([], viewport), []));
check('줌 변환 동치', () => {
  const scale = 0.62;
  const scaled = box => ({ ...box, x: box.x * scale, y: box.y * scale, w: box.w * scale, h: box.h * scale });
  const readings = [charge, { ...charge, id: 'charge-2' }];
  const world = layoutReadings(readings, viewport);
  const screen = layoutReadings(readings.map(scaled), scaled(viewport), [], 4 * scale);
  assert.ok(Math.abs(screen[1].deltaY - world[1].deltaY * scale) < 1e-9);
});
console.log(JSON.stringify({ checks, scope: '독립 합성 레이아웃 회귀, 실제 Canvas 시각/성능 PASS 아님' }));
