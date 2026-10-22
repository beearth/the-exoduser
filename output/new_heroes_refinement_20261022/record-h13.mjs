import fs from 'node:fs';
const file='G:/exoduser/output/new_heroes_refinement_20261022/submission-receipt.json';
const receipt=JSON.parse(fs.readFileSync(file,'utf8'));
const prompt='FROM SCRATCH: Edgerunners-inspired 2D design. Adult female street mercenary, short rust-red undercut, eye-worn visor. Cropped cobalt bomber, black tank, baggy charcoal cargos, high-top boots. ONE bulky ivory/orange robot arm. HUGE asymmetric rectangular RAILGUN: split rails, narrow SLOT muzzle, side capacitor; two-handed hip carry. Walking 3/4 full body, entire gun. Angular anatomy, bold economical ink, hard 3-tone shading. Plain gray. NO cape, ponytail, tights, round barrel, dots or grain.';
if(prompt.length>500)throw Error('Prompt too long');
const earlier=receipt.jobs.find(j=>j.task==='7518982442862313472');
if(earlier){earlier.candidate='H13A';earlier.status='not-visible-in-latest-list-outcome-unverified';earlier.note='Later visible UI showed different top task 7518982805787049984 and Sunburst selection. No deletion/cancellation/refund or completed result observed for the earlier task; do not infer who changed it.';}
if(!receipt.jobs.some(j=>j.task==='7518982805787049984'))receipt.jobs.unshift({candidate:'H13',task:'7518982805787049984',generationMode:'text-to-image',reference:null,referenceRole:'No prior image; same full-redesign prompt observed in current UI.',prompt,provider:'MagicLight',model:'GPT Image 2.5 sunburst',modelEvidence:'Latest UI selection displays Sunburst alongside current task. This task appeared without another agent Create action; form model can change independently, so actual task model remains subject to output/UI evidence.',aspectRatio:'4:3',outputs:1,displayedCost:200,status:'observed-generating'});
receipt.jobs.find(j=>j.candidate==='H12').verdict='FAIL: user rejected background/style-only change and instructed complete design, drawing and muzzle redesign.';
receipt.userFeedbackH12={quote:'배경만바꾼다고 엣지러너냐 디자인을 완전바꿔 버려 저 거지같은작화며 총구며 씨발',finalApproval:false};
receipt.balanceBeforeH13=36890;
const current=receipt.jobs.find(j=>j.task==='7518982805787049984');
if(current.status==='completed-downloaded'){
 current.originalInspected=true;
 current.outputProviderEvidence='Observed and downloaded original URL uses skillsrc.octask.ai/gpt-image-2/7518982805787049984/';
 current.verdict='Complete redesign candidate, not user approved: short undercut, new face/visor, cropped blue jacket, baggy cargos, ivory/orange industrial arm, two-handed hip carry, split rectangular railgun and gray backdrop. No prior ponytail/cape/tights/round cannon silhouette. Small structural fasteners/edge marks remain; do not assert zero dots.';
 receipt.latestObservedBalance=36490;
 receipt.balanceObservedAt=new Date().toISOString();
 receipt.balanceH13Note='Latest balance differs by 400 from pre-H13. Current task displayed 200; earlier H13A outcome remains unverified. Do not attribute entire balance change or infer refund/cancellation.';
}
receipt.updatedAt=new Date().toISOString();
fs.writeFileSync(file,JSON.stringify(receipt,null,2)+'\n');
console.log('H13 text-only redesign receipt recorded');
