import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('recommended build preserves all 15 approved phases, skills, fusions and ultimate pick', () => {
  const start = gameHtml.indexOf('const SKILL_REC_PATH=[');
  const end = gameHtml.indexOf('];', start);
  assert.ok(start >= 0 && end > start, 'SKILL_REC_PATH must exist');
  const source = gameHtml.slice(start, end);
  // 추천빌드_SKILL_REC_PATH.md의 2026-10-27 전사 경로: 마법사 전용 bladeDash 제외.
  const phases = JSON.parse(JSON.stringify(vm.runInNewContext(
    gameHtml.slice(start + 'const SKILL_REC_PATH='.length, end + 1),
  )));
  const expected = [
    ['1. 악의기둥+가시덫', ['darkPillar', 'spikeTrap'], 'pillarSpike', false],
    ['2. 해골무덤+악의폭풍', ['boneWall', 'maliceStorm'], 'boneStorm', false],
    ['3. 뇌전창+아이스스톰', ['thunderStake', 'iceStorm'], null, false],
    ['4. 이동+사슬', ['chargeBoost', 'magicBlink', 'chainAssault', 'chainSlam'], 'dimBreach', false],
    ['5. 칼날+역병', ['maliceHunt', 'guardian', 'plagueBurst'], 'bladeFuse', false],
    ['6. 💀 필살기 선택', ['blackStar', 'lavaSummon', 'execution'], null, true],
    ['7. 멸살+만화+원소', ['omniBeam', 'fanShot', 'elemMissile'], 'elemFuse', false],
    ['8. 허수아비 세트', ['voidScarecrow', 'explodeScarecrow'], 'dualScarecrow', false],
    ['9. 방패 합체', ['maliceSwipe', 'shieldThrow'], 'shieldFuse', false],
    ['10. 폭풍소환+얼음보주+뇌전걸음', ['maliceMortar', 'iceOrb', 'ghostWalk'], 'iceMortar', false],
    ['11. 신성 영역', ['holyDome', 'holyPrison'], 'holyFuse', false],
    ['12. 6단합체: 폭풍빔', ['whirlwind', 'detonate', 'giantSlam', 'fanShot', 'omniBeam', 'elemMissile'], 'stormBeam', false],
    ['13. 신성+빙결', ['iceStorm'], 'holyIce', false],
    ['14. 지옥강타 2', ['giantSlam2'], null, false],
    ['15. 사슬 최종', ['chainSlash'], 'dimRush', false],
  ];
  assert.deepEqual(phases.map(({ phase, skills, fuse, pick }) => [phase, skills, fuse, pick ?? false]), expected);
  const phaseNumbers = [...source.matchAll(/phase:'(\d+)\./gu)].map((match) => Number(match[1]));
  const consecutive = Array.from({ length: 15 }, (_, index) => index + 1);
  assert.deepEqual(phaseNumbers, consecutive);
  assert.deepEqual(phases.map(({ phaseEn }) => Number(/^(\d+)\./u.exec(phaseEn)?.[1])), consecutive);
  assert.ok(source.indexOf("fuse:'pillarSpike'") < source.indexOf("fuse:'boneStorm'"));
  assert.ok(source.indexOf("fuse:'boneStorm'") < source.indexOf("fuse:'dimBreach'"));
  assert.ok(!phases[2].skills.includes('bladeDash'),'mage-only movement stays out of the warrior recommendation');
  assert.equal(phases[2].fuse,null,'warrior cannot fuse the mage-only thunderGhost');
});
