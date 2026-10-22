import fs from 'node:fs';
import crypto from 'node:crypto';
const root='G:/exoduser/',folder=root+'output/new_heroes_refinement_20261022/';
const receipt=JSON.parse(fs.readFileSync(folder+'submission-receipt.json','utf8'));
const reference='assets/character-concepts/20261022/hellgunner_userrefs_silvertail_h14.png';
const hash=crypto.createHash('sha256').update(fs.readFileSync(root+reference)).digest('hex');
if(hash!=='604f6728fd2a3e9522818d6dced68a8031ec9250111a2f5742a281febcb0a3a9')throw Error('H14 source changed');
const prompt='Same H14 woman, REAR 3/4 from her RIGHT. Preserve silver hair, visor, ivory/black cropped jacket, RIGHT robot arm, boots and huge slot-muzzle gun. Reinforced spine, nape to sacrum: segmented dark-titanium vertebrae, paired actuator rails, scapular braces into robot shoulder, pelvic anchor, dim violet channels. Rear jacket tailored around spine opening, no gore. Gun held LOW in front/side, back unobstructed. Full body/whole gun, same realistic materials/gray studio. NO dots/grain.';
if(prompt.length>500)throw Error('Prompt too long');
if(!receipt.jobs.some(j=>j.candidate==='H15'))receipt.jobs.unshift({candidate:'H15',task:'7518991749918027776',reference,referenceSha256:hash,prompt,provider:'MagicLight',model:'GPT Image 2.5 sunburst',aspectRatio:'4:3',outputs:1,displayedCost:200,status:'submitted',scope:'Rear 3/4 counterpart to user-preferred H14, adding reinforced spine without redesigning her front.'});
receipt.userFeedbackH14={quote:'이거 좀 잘나왔네 강화척추로 뒷모습도 해봐',positiveDirection:true,finalApproval:false};
receipt.jobs.find(j=>j.candidate==='H14').userVerdict='Positive user response; preserve as front appearance/reference for rear view. Final okay not received.';
receipt.balanceBeforeH15=36290;
const job=receipt.jobs.find(j=>j.candidate==='H15');
if(job.status==='completed-downloaded'){
 job.originalInspected=true;
 job.verdict='Rear counterpart candidate, not user approved: nape-to-pelvis segmented spine, side rails/scapular and pelvic framing visible, jacket back cut around spine. Short silver hair, ivory/black jacket, anatomical RIGHT prosthesis, dark boots and same angular purple-accent weapon retained. Back unobstructed and full body/gun visible. Weapon rendered as one-handed carry by natural LEFT arm; not validated as original two-handed support or mechanical rig.';
 receipt.latestObservedBalance=36090;
 receipt.balanceObservedAt=new Date().toISOString();
}
receipt.updatedAt=new Date().toISOString();
fs.writeFileSync(folder+'submission-receipt.json',JSON.stringify(receipt,null,2)+'\n');
console.log('H15 rear spine request and positive H14 feedback recorded');
