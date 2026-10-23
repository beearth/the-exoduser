import fs from 'node:fs';import crypto from 'node:crypto';
const root='G:/exoduser/',folder=root+'output/new_heroes_refinement_20261022/';
const f=folder+'submission-receipt.json',r=JSON.parse(fs.readFileSync(f,'utf8'));
const selected={A:'H31',B:'H29',C:'H27'};
const candidates=Object.entries(selected).map(([variant,id])=>{const j=r.jobs.find(x=>x.candidate===id);if(!j?.savedPath)throw Error('Missing candidate '+id);const actual=crypto.createHash('sha256').update(fs.readFileSync(root+j.savedPath)).digest('hex');if(actual!==j.sha256)throw Error('Hash mismatch '+id);return{variant,candidate:id,path:j.savedPath,sha256:actual,finalApproval:false,limitation:id==='H27'?'Scope-top support hand remains; H30/H32 retouch failed/refunded':id==='H29'?'Braced carry with top handle; not verified firing grip':'Resting barrel/fore-end grip; not firing grip'};});
r.poseCandidateSelection={recordedAt:new Date().toISOString(),candidates,unresolved:'C support-hand correction failed in H30/H32. Candidate comparison only, no final user okay or runtime adoption.',actualFailedJobs:['H26','H28','H30','H32']};
fs.writeFileSync(f,JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify(r.poseCandidateSelection,null,2));
