import fs from 'node:fs';
const root='G:/exoduser/',dir=root+'output/new_heroes_refinement_20261022/',f=dir+'submission-receipt.json',r=JSON.parse(fs.readFileSync(f,'utf8'));
const h36=r.jobs.find(j=>j.candidate==='H36');h36.status='failed';h36.failureMessage='The generation service is temporarily unavailable. Please try again later. Credits have been refunded.';h36.refundConfirmed=true;
const briefFile=dir+'mechanical-crossbow-brief.json',b=JSON.parse(fs.readFileSync(briefFile,'utf8'));b.status='ARCHIVED AGENT MISINTERPRETATION';b.supersededBy='docs/17게임아트팀/HELLGUNNER_SINGLE_SHOT_GIANT_GUN_20261023.md';b.latestUserCorrection=r.latestSingleShotGiantGunDirection;fs.writeFileSync(briefFile,JSON.stringify(b,null,2)+'\n');
const h37=r.jobs.find(j=>j.candidate==='H37');const downloads=JSON.parse(fs.readFileSync(dir+'download-receipt.json','utf8'));const result=downloads.rows.find(row=>row.candidate==='H37');
if(result){h37.visualVerdict='REVIEW PENDING';r.latestSingleShotGiantGunDirection.savedPath=result.destination;r.latestSingleShotGiantGunDirection.status='completed-downloaded; visual review pending';}
r.updatedAt=new Date().toISOString();fs.writeFileSync(f,JSON.stringify(r,null,2)+'\n');
const cf=dir+'checkpoint.mjs';let c=fs.readFileSync(cf,'utf8');const p='output/new_heroes_refinement_20261022/finalize-giant-gun.mjs';if(!c.includes(p))c=c.replace('const fixed=[','const fixed=[\n '+JSON.stringify(p)+',');fs.writeFileSync(cf,c);console.log(JSON.stringify({H36:'failed-refunded',H37:h37.status,download:result?.destination||null}));
