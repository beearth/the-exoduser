import fs from 'node:fs';
const root='G:/exoduser/',folder=root+'output/new_heroes_refinement_20261022/';
const receipt=JSON.parse(fs.readFileSync(folder+'submission-receipt.json','utf8'));
const references=JSON.parse(fs.readFileSync(folder+'h14-reference-receipt.json','utf8')).references;
const prompt='NEW adult female Hellgunner. Refs1-2: sleek asymmetric techwear, cropped jacket/thigh-high boots, agile silhouette. Ref3: rebellious poise, huge bespoke weapon mass. Ref4 governs EXODUSER finish: mature face, dark iron, deep painterly light. Ash-silver choppy hair, eye-worn visor, ONE sculpted robot arm. Black/ivory/oxblood, sparse violet. Huge wedge gun, ONE horizontal SLOT muzzle, two-handed hip grip. Full body/whole gun, neutral gray. NO round bore, cape, dots, grain, logos.';
if(prompt.length>500)throw Error('Prompt too long');
if(!receipt.jobs.some(j=>j.candidate==='H14'))receipt.jobs.unshift({candidate:'H14',task:'7518985412890898432',generationMode:'multi-reference',reference:null,references,prompt,provider:'MagicLight',model:'GPT Image 2.5 sunburst',aspectRatio:'4:3',outputs:1,displayedCost:200,status:'submitted',uiEvidence:'Four Preview reference image buttons verified before Create; model Sunburst and cost 200 visible before and after submission.'});
receipt.userReferenceInstruction={sources:references.map(r=>r.source),silvertailRequest:'저기에 실버테일도 넣어서 우리게임의 일관성넣고',finalApproval:false};
receipt.balanceBeforeH14=36490;
const job=receipt.jobs.find(j=>j.candidate==='H14');
if(job.status==='completed-downloaded'){
 job.originalInspected=true;
 job.verdict='Four-reference candidate, not user approved: sharp mature silver-haired face, dark iron/painterly finish, asymmetric ivory cropped jacket, slim boots/body silhouette, eye-worn visor, robotic arm and huge angular weapon with narrow slot instead of round bore. No copied logos/cape. Belt buckles and finger/weapon contact need closer functional retouch; no game consistency PASS asserted.';
}
receipt.updatedAt=new Date().toISOString();
fs.writeFileSync(folder+'submission-receipt.json',JSON.stringify(receipt,null,2)+'\n');
console.log('H14 four-reference submission receipt recorded');
