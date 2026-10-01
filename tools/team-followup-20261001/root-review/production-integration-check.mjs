import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {parse} from 'acorn';
import {connectRemoval} from '../UIUX/card-removal-focus-candidate.mjs';
import {immediateDrainCandidate,candidateSave} from '../BALANCE/immediate-drain-candidate.mjs';

// Compare the entire file against reviewed transformations of the remote restore point.
// This detects unrelated changes as well as missing hook calls.
const phase=process.argv[2];
assert(['inventory','inventory-save'].includes(phase));
const base='35ddea9d41ecf776e4ddf781566d3ff5dad53017';
const sha=value=>createHash('sha256').update(value).digest('hex');
const saveBefore=JSON.parse(fs.readFileSync(new URL('../BALANCE/immediate-drain-before.json',import.meta.url)));
const rows=[];
for(const file of ['game.html','game-easy-test.html']){
  const before=execFileSync('git',['show',`${base}:${file}`],{encoding:'utf8',maxBuffer:20000000});
  let expected=connectRemoval(before);
  if(phase==='inventory-save'){
    const {regions}=saveBefore.find(row=>row.file===file);
    assert.equal(expected.split(regions.now).length,2);
    expected=expected.replace(regions.now,immediateDrainCandidate);
    for(const save of regions.saves){assert(expected.includes(save));expected=expected.replace(save,candidateSave(save));}
  }
  const current=fs.readFileSync(file,'utf8');
  assert.equal(sha(current),sha(expected),`${file}: outside accepted change or missing change`);
  const scripts=[];
  for(const [index,match] of [...current.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)].entries()){
    if(/\bsrc\s*=/.test(match[1])||!match[2].trim())continue;
    if(/type\s*=\s*["'](?:importmap|application\/[^"']+)["']/.test(match[1]))continue;
    const sourceType=/type\s*=\s*["']module["']/.test(match[1])?'module':'script';
    parse(match[2],{ecmaVersion:'latest',sourceType});scripts.push({index,sourceType});
  }
  assert.equal(scripts.length,6);
  rows.push({file,beforeSha256:sha(before),afterSha256:sha(current),exactReviewedChanges:true,scripts});
}
const result={at:new Date().toISOString(),base,phase,rows,limits:'Source equality and syntax only. Native game/layout/gamepad/save/relaunch remain separate gates.'};
const out='outputs/team-review-20261002/production-integration';fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(`${out}/${phase}-root-check.json`,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
