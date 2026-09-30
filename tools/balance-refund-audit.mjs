import {readFileSync} from 'node:fs';

for (const file of ['game.html', 'game-easy-test.html']) {
  const source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  const costStart = source.indexOf('function enhRate(n){');
  const costEnd = source.indexOf('function enhMul(n){', costStart);
  const refundStart = source.indexOf('function _itemEconomyRarity(r){');
  const refundEnd = source.indexOf('function useQuickslot(idx){', refundStart);
  if (costStart < 0 || costEnd < 0 || refundStart < 0 || refundEnd < 0) {
    throw new Error(`${file}: 강화 지출·환수 함수 추출 실패`);
  }
  const {enhCost, salvageVal} = new Function(
    `${source.slice(costStart, costEnd)}\n${source.slice(refundStart, refundEnd)}\nreturn {enhCost,salvageVal};`)();
  for (const level of [1, 10, 100]) {
    let spent = 0;
    for (let i = 0; i < level; i++) spent += enhCost(i, 2).cost;
    const base = salvageVal({rarity: 2, enh: 0, tier: 0});
    const refund = salvageVal({rarity: 2, enh: level, tier: 0}) - base;
    console.log(JSON.stringify({file, rarity: 2, enhancementLevel: level,
      actualSpend: spent, enhancementRefund: refund, refundRatio: refund / spent}));
  }
}
