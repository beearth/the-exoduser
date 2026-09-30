import {readFileSync} from 'node:fs';

for (const file of ['game.html', 'game-easy-test.html']) {
  const source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  const costStart = source.indexOf('const _MALICE_COST_MUL=');
  const costEnd = source.indexOf('function enhCostRaw(', costStart);
  const activateStart = source.indexOf('function activateBlastShot(){');
  const activateEnd = source.indexOf('function activateNeedleShot(){', activateStart);
  if (costStart < 0 || costEnd < 0 || activateStart < 0 || activateEnd < 0) {
    throw new Error(`${file}: 폭산탄 또는 악의 비용 함수 추출 실패`);
  }
  const malCost = new Function(`${source.slice(costStart, costEnd)}; return _malCost;`)();
  const P = {skills: {blastShot: 1}, st: 10, x: 0, y: 0, facing: 0, _bsCd2: 0};
  const G = {mats: malCost(5), _bsBombs: []};
  const activate = new Function('P', 'G', '_malCost', '_addSkProf', 'playSample', '_r',
    'SFX', 'addTxt', '_T', 'shake',
    `${source.slice(activateStart, activateEnd)}; return activateBlastShot;`)(
    P, G, malCost, () => {}, () => {}, () => 1, {crossbowLoad() {}},
    () => {}, x => x, () => {});
  const before = {malice: G.mats, stamina: P.st, bombCount: G._bsBombs.length};
  activate();
  console.log(JSON.stringify({file, routerGate: malCost(5), directGate: malCost(8),
    before, after: {malice: G.mats, stamina: P.st, bombCount: G._bsBombs.length,
      cooldown: P._bsCd2}}));
}
