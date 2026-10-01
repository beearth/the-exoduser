import { UNIQUE_DEFINITIONS, EFFECT_PROPOSALS } from './definitions.js';

const rows = [
  ['01','percent',20,40,26,33], ['02','percent',30,50,36,43],
  ['03','frame',20,40,26,33], ['04','frame',60,180,100,140],
  ['05','percent',10,30,16,23], ['06','percent',10,30,16,23],
  ['07','percent',20,40,26,33], ['08','percent',25,45,31,38],
  ['09','percent',20,40,26,33], ['10','percent',10,20,13,16],
  ['11','frame',120,300,180,240], ['12','frame',60,120,80,100],
  ['13','percent',20,40,26,33], ['14','percent',20,40,26,33],
  ['15','percent',25,45,31,38], ['16','count',2,4,2,3],
  ['17','count',1,3,1,2], ['18','percent',1,3,1,2],
  ['19','percent',20,40,26,33], ['20','percent',20,40,26,33],
  ['21','rage',20,40,26,33], ['22','percent',20,40,26,33]
];

export const ROLL_PROPOSALS = Object.freeze(rows.map(([number,unit,min,max,lowEnd,midEnd]) => {
  const definition = UNIQUE_DEFINITIONS.find(entry => entry.uniqueId === `UI-${number}`);
  const effect = EFFECT_PROPOSALS.find(entry => entry.effectId === definition.effectId);
  return Object.freeze({ uniqueId:definition.uniqueId, effectId:definition.effectId,
    stat:effect.proposalStat, unit, min, max, status:'proposal', runtimeReady:false,
    bands:Object.freeze([
      Object.freeze({label:'하옵',min,max:lowEnd}),
      Object.freeze({label:'중옵',min:lowEnd+1,max:midEnd}),
      Object.freeze({label:'상옵',min:midEnd+1,max})
    ]) });
}));

export function lookupRoll(id) {
  const proposal = ROLL_PROPOSALS.find(entry => entry.uniqueId === id || entry.effectId === id);
  if (!proposal) throw new RangeError('등록되지 않은 롤 ID');
  return proposal;
}

function validateRaw(proposal, raw) {
  if (!Number.isInteger(raw) || raw < proposal.min || raw > proposal.max) throw new RangeError('롤 정수 범위 밖');
  return raw;
}

export function toStoredValue(id, raw) {
  const proposal = lookupRoll(id);
  validateRaw(proposal,raw);
  return proposal.unit === 'percent' ? raw/100 : raw;
}

export function fromStoredValue(id, stored) {
  const proposal = lookupRoll(id);
  if (typeof stored !== 'number' || !Number.isFinite(stored)) throw new RangeError('잘못된 저장값');
  const raw = proposal.unit === 'percent' ? Math.round(stored*100) : stored;
  validateRaw(proposal,raw);
  if (toStoredValue(id,raw) !== stored) throw new RangeError('정규 저장 단위와 불일치');
  return raw;
}

export function describeRoll(id, raw) {
  const proposal = lookupRoll(id);
  validateRaw(proposal,raw);
  const band = proposal.bands.find(entry => raw >= entry.min && raw <= entry.max);
  const displayUnit = proposal.unit === 'frame' ? '초' : proposal.unit === 'percent' ? '%' : proposal.unit === 'rage' ? '분노' : proposal.uniqueId === 'UI-16' ? '발' : '개';
  const displayValue = proposal.unit === 'frame' ? Number((raw/60).toFixed(2)) : raw;
  return Object.freeze({uniqueId:proposal.uniqueId,effectId:proposal.effectId,stat:proposal.stat,
    raw,stored:toStoredValue(id,raw),unit:proposal.unit,band:band.label,
    displayValue,displayUnit,text:`${displayValue}${displayUnit}`,
    exactDisplay:Object.freeze({numerator:raw,denominator:proposal.unit === 'frame' ? 60 : 1}),
    displayRule:proposal.unit === 'frame' ? 'raw/60.toFixed(2), 끝자리0 생략; JS 이진부동소수 반올림' : '정수 원값',
    status:'proposal',runtimeReady:false});
}

export function rollValue(id, rng) {
  const proposal = lookupRoll(id);
  if (typeof rng !== 'function') throw new TypeError('RNG 명시 주입 필요');
  const sample = rng();
  if (typeof sample !== 'number' || !Number.isFinite(sample) || sample < 0 || sample >= 1) throw new RangeError('RNG는 유한 [0,1)');
  const count = proposal.max-proposal.min+1;
  let lower = 0;
  let upper = count;
  while (lower+1 < upper) {
    const middle = Math.floor((lower+upper)/2);
    if (sample >= middle/count) lower = middle;
    else upper = middle;
  }
  return describeRoll(id,proposal.min+lower);
}
