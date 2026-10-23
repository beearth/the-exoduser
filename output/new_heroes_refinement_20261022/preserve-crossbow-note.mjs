import fs from 'node:fs';
const dir='G:/exoduser/output/new_heroes_refinement_20261022/',root='G:/exoduser/';
const path='docs/17게임아트팀/HELLGUNNER_REVOLVER_RIFLE_20261021.md';
const note=fs.readFileSync(root+path,'utf8').split('\n').find(s=>s.startsWith('**2026-10-23 최신 무기 지시:**'));
if(!note)throw Error('Own note not found');const f=dir+'shared-notes.json',r=JSON.parse(fs.readFileSync(f,'utf8'));if(!r.some(x=>x.path===path))r.push({path,note,scope:'Own top note only, shared body reconstructed from HEAD when checkpointed'});fs.writeFileSync(f,JSON.stringify(r,null,2)+'\n');
let c=fs.readFileSync(dir+'checkpoint.mjs','utf8');const p='output/new_heroes_refinement_20261022/preserve-crossbow-note.mjs';if(!c.includes(p))c=c.replace('const fixed=[','const fixed=[\n '+JSON.stringify(p)+',');fs.writeFileSync(dir+'checkpoint.mjs',c);console.log('Own note will be snapshotted without shared staged body.');
