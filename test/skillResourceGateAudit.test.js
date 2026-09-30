import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// [SKILL 자원게이트 감사 2026-10-01] 개별 activate* 함수의 악의(_malCost) 게이트값 == 차감값.
// SKILL-02 서명(게이트 _malCost(8) ≠ 차감 _malCost(5)) 재발 방지. 두 HTML 정적 검증.
// 범위: 개별 activate 함수(내 소유). 라우터/스택 MP 게이트는 감사 문서 §결과2 핸드오프.

function activateBlocks(source) {
  const blocks = [];
  const re = /function (activate[A-Za-z0-9]+)\(\)\{/g;
  let m;
  while ((m = re.exec(source))) {
    const name = m[1];
    const start = m.index;
    // 다음 최상위 함수 선언까지를 본문으로 근사(들여쓰기 없는 function 시작).
    const nextFn = source.indexOf('\nfunction ', start + 1);
    const end = nextFn < 0 ? source.length : nextFn;
    blocks.push({name, body: source.slice(start, end)});
  }
  return blocks;
}

for (const file of ['game.html', 'game-easy-test.html']) {
  const source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  const blocks = activateBlocks(source);

  test(`${file}: activate* 함수가 다수 추출된다`, () => {
    assert.ok(blocks.length >= 10, `activate 함수 ${blocks.length}개 추출`);
  });

  test(`${file}: 각 activate*의 악의 게이트값 == 차감값(SKILL-02 서명 없음)`, () => {
    const offenders = [];
    for (const {name, body} of blocks) {
      const gates = [...body.matchAll(/<_malCost\((\d+)\)/g)].map(x => x[1]);
      const charges = new Set([...body.matchAll(/-=_malCost\((\d+)\)/g)].map(x => x[1]));
      // 차감이 하나도 없으면(게이트만 있는 특수 흐름) 이 검증 대상에서 제외.
      if (charges.size === 0) continue;
      for (const g of gates) {
        if (!charges.has(g)) {
          offenders.push(`${name}: 게이트 _malCost(${g}) 가 차감값 {${[...charges].join(',')}}과 불일치`);
        }
      }
    }
    assert.deepEqual(offenders, [], `게이트≠차감 불일치:\n${offenders.join('\n')}`);
  });

  test(`${file}: activateBlastShot은 게이트·차감 모두 _malCost(5)`, () => {
    const b = blocks.find(x => x.name === 'activateBlastShot');
    assert.ok(b, 'activateBlastShot 존재');
    assert.match(b.body, /<_malCost\(5\)/, '게이트 _malCost(5)');
    assert.match(b.body, /-=_malCost\(5\)/, '차감 _malCost(5)');
    assert.doesNotMatch(b.body, /<_malCost\(8\)/, '옛 _malCost(8) 게이트 없음');
  });
}
