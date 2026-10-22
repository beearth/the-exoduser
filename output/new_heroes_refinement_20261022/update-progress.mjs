import fs from 'node:fs';
import crypto from 'node:crypto';
const file='G:/exoduser/output/new_heroes_refinement_20261022/submission-receipt.json';
const r=JSON.parse(fs.readFileSync(file));
const reference='assets/character-concepts/20261022/hellgunner_cyberpunk_robotarm_h02.png';
const hash=crypto.createHash('sha256').update(fs.readFileSync('G:/exoduser/'+reference)).digest('hex');
const jobs=[
 {candidate:'H03',task:'7518876773853114368',status:'failed-refund-message-observed',prompt:'Edit this Hellgunner: keep face, robotic arm, huge cylinder, single muzzle and city. FIX shoulder stock: compact recoil pad seated in shoulder pocket, clear neck/cheek space, aligned trigger wrist. Show other hand supporting foregrip; two arms only. Replace medieval buckled belt, hanging straps and scale skirt with modern tactical belt, low-profile quick-release clasp, compact pouches and fitted black techwear combat panels. Keep crimson coat, full body and whole gun visible. No extra weapons.',error:'The current prompt or reference image couldn\'t be processed. Please edit it and try again. Credits have been refunded.'},
 {candidate:'H04',task:'7518877237164306432',status:'submitted',prompt:'Refine this cyberpunk character. Preserve face, robot arm, giant revolver-cannon and city. Fix shoulder fit: compact contoured stock pad rests on shoulder, leaving neck/cheek clear; both hands support weapon. Replace medieval belt/straps with a modern quick-release tactical belt and fitted black techwear panels. Add slim angular goggles raised on forehead and a small comms earpiece. Keep eyes visible, black/crimson colors, full body and whole weapon. No extra limbs, guns or jewelry.'}
];
for(const job of jobs){if(!r.jobs.some(j=>j.task===job.task))r.jobs.push({...job,reference,referenceSha256:hash,provider:'MagicLight',model:'GPT Image 2.5 sunburst',aspectRatio:'16:9',outputs:1,displayedCost:200});}
r.updatedAt=new Date().toISOString();
r.userFeedbackH02={positive:'이번건 좀 느낌있네',corrections:['견착부분이 이상한데','벨트같은것도 중세스러운데 현대식으로','고글같은거나 약간 신경써보고 악세사리'],finalApproval:false};
fs.writeFileSync(file,JSON.stringify(r,null,2)+'\n');
console.log(JSON.stringify({jobs:r.jobs.map(j=>({candidate:j.candidate,task:j.task,status:j.status})),finalApproval:false},null,2));
