import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { ROLL_PROPOSALS,describeRoll } from '../../../unique-item-project/roll-values.mjs';

const files=['unique-item-project/roll-values.mjs','unique-item-project/definitions.js','test/uniqueRollValues.test.js','docs/7아이템디자인/유니크_어픽스_리스트.md'];
const hashes=Object.fromEntries(files.map(path=>[path,createHash('sha256').update(readFileSync(new URL(`../../../${path}`,import.meta.url))).digest('hex')]));
console.log(JSON.stringify({runtimeReady:false,status:'proposal',hashes,
  integerValues:ROLL_PROPOSALS.reduce((total,entry)=>total+entry.max-entry.min+1,0),
  proposals:ROLL_PROPOSALS.map(entry=>({...entry,examples:entry.bands.map(band=>({
    first:describeRoll(entry.uniqueId,band.min),last:describeRoll(entry.uniqueId,band.max)
  }))}))},null,2));
