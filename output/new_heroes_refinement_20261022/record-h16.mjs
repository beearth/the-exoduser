import fs from 'node:fs';
const folder='G:/exoduser/output/new_heroes_refinement_20261022/';
const receipt=JSON.parse(fs.readFileSync(folder+'submission-receipt.json','utf8'));
const references=JSON.parse(fs.readFileSync(folder+'h16-reference-receipt.json','utf8')).references;
const prompt='EDIT woman in ref1 ONLY. Refs3-10 guide design; ref2 controls EXODUSER finish. Preserve adult face/silver hair, visor, RIGHT robot arm, boots, open cropped jacket and huge slot gun. Replace bra/straps/skirt with fitted high-neck BLACK ONE-PIECE BODYSUIT through waist/pelvis, like refs4/10. Matte leather/tech fabric, large ivory side panels, soft folds, sparse seams, flat magnetic belt. Rear spine channel retained. Full body/whole gun, gray studio. NO rubber shine, dots, grain, logos.';
if(prompt.length>500)throw Error('Prompt too long');
if(!receipt.jobs.some(j=>j.candidate==='H16'))receipt.jobs.unshift({candidate:'H16',task:'7518998267568644096',generationMode:'multi-reference',reference:null,references,prompt,provider:'MagicLight',model:'GPT Image 2.5 sunburst',aspectRatio:'4:3',outputs:1,displayedCost:200,status:'submitted',uiEvidence:'Preview reference image 1 through 10 verified before Create; no earlier failed/interrupted upload was submitted.'});
receipt.userBodysuitInstruction={userReferenceCount:8,quote:'레퍼런스 더 넣고 아까 저런 바디수트 입는게 나을꺼같다',interpretation:'Continuous high-neck one-piece from chest/abdomen through pelvis, Lucy reference garment construction; H14 identity/equipment and H15 spine retained. Front then matching rear, one candidate each, displayed total 400.',finalApproval:false};
receipt.balanceBeforeH16=36090;
const job=receipt.jobs.find(j=>j.candidate==='H16');
if(job.status==='completed-downloaded'){
 job.originalInspected=true;
 job.verdict='Bodysuit front candidate, not user approved: continuous high-neck black one-piece through abdomen/pelvis/legs with ivory side panels and leather folds/seams. Prior bra/abdomen gap/skirt removed; H14 face/hair/visor, RIGHT prosthesis, cropped jacket and huge slot gun retained. Belt remains square-buckle rather than requested flat magnetic closure.';
}
receipt.updatedAt=new Date().toISOString();
fs.writeFileSync(folder+'submission-receipt.json',JSON.stringify(receipt,null,2)+'\n');
console.log('H16 bodysuit front with 10 references recorded');
