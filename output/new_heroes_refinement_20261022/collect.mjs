import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root='G:/exoduser',out=path.join(root,'output/new_heroes_refinement_20261022');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const rows=[
 {candidate:'H01',source:'C:/Users/심도진/AppData/Local/Temp/browser-use/assets/2658644c-ff7d-4982-83e4-be0508ec028a/123966cb94189424.png',destination:'output/new_heroes_refinement_20261022/hellgunner_fantasy_structure_h01.png',url:'https://skillsrc.octask.ai/gpt-image-2/7518874793114017792/a63ce97e-b6fd-e023-5602-e56edd64df23_0.png',verdict:'Earlier direction; muzzle remains obscured by blade. Not final.'},
 {candidate:'T01',source:'C:/Users/심도진/AppData/Local/Temp/browser-use/assets/3d980845-0a71-47b2-aefb-79531877f190/f364a93296d29911.png',destination:'assets/character-concepts/20261022/transmuter_energy_bow_t01.png',url:'https://skillsrc.octask.ai/gpt-image-2/7518875208916361216/36d1cfd9-3a59-2536-77d8-101a212e69ea_0.png',verdict:'RETOUCH: bow conversion, two arms and one core visible; top limb clipped, gauntlet mass reduced, blue still bright.'},
 {candidate:'H02',source:'C:/Users/심도진/AppData/Local/Temp/browser-use/assets/a16d754b-4bb2-4519-8ebe-9e815d167b4f/133bccc03388c3ca.png',destination:'assets/character-concepts/20261022/hellgunner_cyberpunk_robotarm_h02.png',url:'https://skillsrc.octask.ai/gpt-image-2/7518875372884271104/d3334ad7-cb8e-58d4-b29b-92cbf1fb18d8_0.png',verdict:'RETOUCH: cyberpunk city, giant cylinder, single hollow muzzle and exposed robotic trigger arm achieved. Support arm/hand concealed; improve visible weight support.'}
];
const desktop='C:/Users/심도진/Desktop/엑소듀서_검토/신규캐릭터_지속개선_20261022';
fs.mkdirSync(desktop,{recursive:true});
for(const row of rows){
 const b=fs.readFileSync(row.source),dest=path.join(root,row.destination);
 if(b.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw new Error('Not PNG');
 fs.mkdirSync(path.dirname(dest),{recursive:true});
 if(!fs.existsSync(dest))fs.copyFileSync(row.source,dest,fs.constants.COPYFILE_EXCL);
 if(sha(fs.readFileSync(dest))!==sha(b))throw new Error(`Destination differs: ${dest}`);
 const copy=path.join(desktop,path.basename(dest));
 if(!fs.existsSync(copy))fs.copyFileSync(dest,copy,fs.constants.COPYFILE_EXCL);
 if(sha(fs.readFileSync(copy))!==sha(b))throw new Error('Desktop copy differs');
 Object.assign(row,{status:'completed-downloaded-inspected',width:b.readUInt32BE(16),height:b.readUInt32BE(20),bytes:b.length,sha256:sha(b),desktopCopy:copy});
}
const receiptFile=path.join(out,'download-receipt.json');
fs.writeFileSync(receiptFile,JSON.stringify({recordedAt:new Date().toISOString(),balanceAfterThree:39090,rows},null,2)+'\n');
const submitFile=path.join(out,'submission-receipt.json'),submission=JSON.parse(fs.readFileSync(submitFile));
for(const job of submission.jobs){const row=rows.find(r=>r.candidate===job.candidate);if(row){job.status=row.status;job.savedPath=row.destination;job.sha256=row.sha256;}}
submission.latestObservedBalance=39090;
fs.writeFileSync(submitFile,JSON.stringify(submission,null,2)+'\n');
console.log(JSON.stringify(rows.map(({candidate,destination,width,height,sha256,verdict})=>({candidate,destination,width,height,sha256,verdict})),null,2));
