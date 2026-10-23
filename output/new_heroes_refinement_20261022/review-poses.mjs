import fs from 'node:fs';const dir='G:/exoduser/output/new_heroes_refinement_20261022/';
const f=dir+'submission-receipt.json',r=JSON.parse(fs.readFileSync(f,'utf8')),reviews=JSON.parse(fs.readFileSync(dir+'pose-reviews.json','utf8'));
for(const [id,review] of Object.entries(reviews)){const j=r.jobs.find(x=>x.candidate===id);if(!j)throw Error('Missing actual job '+id);Object.assign(j,review);}
r.updatedAt=new Date().toISOString();fs.writeFileSync(f,JSON.stringify(r,null,2)+'\n');
