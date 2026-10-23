import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';

const root='G:/exoduser';
const out=path.join(root,'output/new_heroes_refinement_20261022');
const shared=[
 ['docs/17게임아트팀/ART_TEAM_MASTER.md','NEW_HEROES_CONTINUOUS_REFINEMENT_20261022.md'],
 ['docs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md','../17게임아트팀/NEW_HEROES_CONTINUOUS_REFINEMENT_20261022.md'],
 ['docs/11내러티브·로어디자인/NEW_HEROES_DESIGN_LOCK.md','../17게임아트팀/NEW_HEROES_CONTINUOUS_REFINEMENT_20261022.md'],
 ['docs/17게임아트팀/NEW_HEROES_USER_PREFERRED_20261021.md','NEW_HEROES_CONTINUOUS_REFINEMENT_20261022.md'],
 ['docs/17게임아트팀/NEW_HEROES_FEMALE_ITERATION_20261021.md','NEW_HEROES_CONTINUOUS_REFINEMENT_20261022.md']
];
const marker='2026-10-22 지속 개선 / 헬거너 미래 시대';
const git=(args,options={})=>execFileSync('git',args,{cwd:root,windowsHide:true,encoding:'utf8',...options}).trim();
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
fs.mkdirSync(out,{recursive:true});
const sharedReceipt=[];
for(const [rel,link] of shared){
 const file=path.join(root,rel), before=fs.readFileSync(file), text=before.toString('utf8');
 const note=`> **${marker}:** 사용자 “오케이 할 때까지 계속 개선”, “미래시대배경 약간 사이버펑크”, “로봇팔과 거대병기” 지시를 반영한다. 헬거너의 여성 신원과 거대 병기를 유지한 미래형 로봇팔 사수 원화를 제작 중이다. 왼팔/소재/도시는 제작 해석이며 다른 캐릭터까지 사이버펑크로 바꾸지 않는다. 원본·이전 후보 보존, 최종 채택·게임 연결·배포는 별도. [진행/산출 기록](${link}).`;
 const backup=path.join(out,'original',rel);
 if(!text.includes(marker)){
  fs.mkdirSync(path.dirname(backup),{recursive:true});
  if(!fs.existsSync(backup))fs.writeFileSync(backup,before,{flag:'wx'});
  const newline=text.includes('\r\n')?'\r\n':'\n', end=text.indexOf('\n')+1;
  const after=text.slice(0,end)+newline+note+newline+text.slice(end);
  if(!fs.readFileSync(file).equals(before))throw new Error(`Concurrent change: ${rel}`);
  fs.writeFileSync(file,after);
 }
 sharedReceipt.push({path:rel,beforeSha256:fs.existsSync(backup)?sha(fs.readFileSync(backup)):null,afterSha256:sha(fs.readFileSync(file)),note});
}
fs.writeFileSync(path.join(out,'shared-notes.json'),JSON.stringify(sharedReceipt,null,2)+'\n');
const jobs=[
 {candidate:'H01',task:'7518874793114017792',reference:'output/new_heroes_female_iteration_20261021/hellgunner_female_pose_face_v1.png',prompt:'Refine the same adult female Hellgunner, not a redesign. Preserve face identity, brown ponytail, black iron/brass armor, crimson cloak, long massive revolver-rifle and full-body stance. Improve eyes, facial planes and resolve both hands anatomically; stock firmly contacts shoulder. Refine ONE front muzzle into a clear hollow bore; cylinders behind it are chambers, not extra barrels. Keep weapon length/weight, clear materials, restrained red light. No extra people, logos, added ornaments.',note:'Submitted before user cyberpunk direction; preserve as earlier iteration.'},
 {candidate:'T01',task:'7518875208916361216',reference:'output/new_heroes_female_iteration_20261021/transmuter_female_pose_face_v1.png',prompt:'Refine the SAME adult female: preserve face, silver hair, black hood, claw gauntlet, outfit and painterly dark fantasy. Replace scythe with ONE pure-energy longbow growing directly from the LEFT gauntlet core; RIGHT hand draws its string with ONE energy arrow. Exactly two arms, one core, no physical staff. Improve facial planes and fingers subtly. Deep indigo/cobalt energy, bright only inside core and bow edges. Full body, feet and entire bow visible. No added jewelry, people, logo or particles.'},
 {candidate:'H02',task:'7518875372884271104',reference:'output/new_heroes_female_iteration_20261021/hellgunner_female_pose_face_v1.png',prompt:'Evolve the same adult female Hellgunner into subtle cyberpunk. Preserve face, brown ponytail, crimson accents. LEFT arm is an exposed robotic prosthesis from shoulder to fingers, bracing ONE gigantic future revolver-cannon. Huge rotary cylinder, ONE thick barrel and ONE open muzzle; right hand at trigger, stock at shoulder. Refined black titanium/ceramic armor, worn crimson coat, sparse red circuitry. Full body and entire weapon visible. Rainy megacity backdrop. No logo, extra limbs or guns.'}
].map(j=>({...j,provider:'MagicLight',model:'GPT Image 2.5 sunburst',aspectRatio:'16:9',outputs:1,displayedCost:200,referenceSha256:sha(fs.readFileSync(path.join(root,j.reference))),status:'submitted'}));
fs.writeFileSync(path.join(out,'submission-receipt.json'),JSON.stringify({recordedAt:new Date().toISOString(),localHead:git(['rev-parse','HEAD']),remoteMain:git(['rev-parse','origin/main']),branch:git(['branch','--show-current']),balanceObservedAtStart:39690,balanceObservedAfterH01:39490,jobs},null,2)+'\n');
console.log(JSON.stringify({jobs:jobs.map(j=>({candidate:j.candidate,task:j.task,promptLength:j.prompt.length})),sharedNotes:sharedReceipt.map(r=>r.path)},null,2));
