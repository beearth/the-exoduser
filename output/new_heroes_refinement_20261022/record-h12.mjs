import fs from 'node:fs';
import crypto from 'node:crypto';
const root='G:/exoduser/',file=root+'output/new_heroes_refinement_20261022/submission-receipt.json';
const receipt=JSON.parse(fs.readFileSync(file,'utf8'));
const reference='assets/character-concepts/20261022/hellgunner_cinematic_redraw_h11.png';
const prompt='Cyberpunk: Edgerunners-inspired 2D cel-animation key art. New rendering/layout; reference identity only. Adult female, brown ponytail, red goggles OVER eyes, crimson cape, fitted black leather, flat-clasp belt, chunky robotic arm. Huge revolver-cannon: large cylinder, ONE muzzle, two hands, short stock. Dynamic low-angle diagonal, full body/whole gun. Bold angular shapes, sparse sharp ink, hard shadow blocks, acid-yellow/cyan city, magenta rims. NO 3D, grids, dots, grain, particles or text.';
if(prompt.length>500)throw Error('Prompt too long');
if(!receipt.jobs.some(j=>j.candidate==='H12'))receipt.jobs.unshift({candidate:'H12',task:'7518980236876505088',reference,referenceSha256:crypto.createHash('sha256').update(fs.readFileSync(root+reference)).digest('hex'),referenceRole:'Identity and equipment reference only; user requested Edgerunners-inspired cel animation style and new composition.',prompt,provider:'MagicLight',model:'GPT Image 2.5 sunburst',aspectRatio:'4:3',outputs:1,displayedCost:200,status:'submitted'});
receipt.jobs.find(j=>j.candidate==='H11').verdict='FAIL: user still found the artwork dated and requested Edgerunners style. Keep only identity reference, not realistic rendering.';
receipt.userFeedbackH11={quotes:['왜케 또 촌스럽냐','엣지러너 스타일좀 넣어봐라'],finalApproval:false};
receipt.balanceBeforeH12=37090;
const h12=receipt.jobs.find(j=>j.candidate==='H12');
if(h12.status==='completed-downloaded'){
  h12.originalInspected=true;
  h12.verdict='New style candidate, not user approved: angular 2D cel shading, yellow/cyan skyline and magenta rim lighting achieved; large clean material planes and much less fine grain/light dots. Eye-worn goggles, robotic arm, two hands, one muzzle and full-body framing retained. Belt remains ring-buckle style, shoulder stock contact unclear; cylinder proportions still differ from H02.';
  receipt.latestObservedBalance=36890;
  receipt.balanceObservedAt=new Date().toISOString();
}
receipt.updatedAt=new Date().toISOString();
fs.writeFileSync(file,JSON.stringify(receipt,null,2)+'\n');
console.log('H12 submission and H11 user feedback recorded');
