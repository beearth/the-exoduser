import fs from 'node:fs';
import crypto from 'node:crypto';
const root='G:/exoduser/',folder=root+'output/new_heroes_refinement_20261022/';
const task=process.argv[2];
if(!/^\d{19}$/.test(task||''))throw Error('Actual task ID required');
const r=JSON.parse(fs.readFileSync(folder+'submission-receipt.json','utf8'));
const specs=[
 ['assets/character-concepts/20261022/hellgunner_sheer_leotard_front_h19.png','Edit target: retain identity/equipment/pose; replace excessive sheer garment with opaque bodysuit plus leather shorts'],
 ['assets/character-concepts/20261022/hellgunner_userrefs_silvertail_h14.png','H14 approved direction for identity and equipment, not original skirt'],
 ['assets/character-concepts/references/20261022/hellgunner_h14/04_exoduser_silvertail.png','EXODUSER material and painterly finish consistency']
];
const references=specs.map(([path,role],i)=>({index:i+1,path,role,sha256:crypto.createHash('sha256').update(fs.readFileSync(root+path)).digest('hex')}));
const prompt='Edit ref1 adult woman, clothes only: MATTE BLACK LEATHER SHORTS worn OVER an opaque fitted bodysuit. Separate low-rise shorts with waistband, zipper fly, pockets, stitched hems and room at thighs. Bodysuit tucked inside; abdomen/side waist opaque black, only a SMALL sheer collarbone panel. Preserve face/silver hair/eye visor, RIGHT robot arm, cropped ivory jacket, boots, huge slot gun and pose. Ref2 H14 identity, ref3 EXODUSER finish. Full body/whole gun, gray. No lace, latex, dots.';
if(prompt.length>500)throw Error('Prompt too long');
if(!r.jobs.some(j=>j.candidate==='H20'))r.jobs.unshift({candidate:'H20',task,generationMode:'multi-reference',reference:null,references,prompt,provider:'MagicLight',model:'GPT Image 2.5 sunburst',aspectRatio:'4:3',outputs:1,displayedCost:200,status:'submitted'});
r.jobs.find(j=>j.candidate==='H19').userVerdict='FAIL garment styling: sheer is excessive; bodysuit should be layered with pants, then user specified leather shorts.';
r.latestCostumeDirection={userQuotes:['시스루 너무 심하고 바디수트 요즘 바지랑 입는거야 ;;','반바지 가죽같은거나'],interpretation:'Opaque fitted bodysuit layered under matte black leather shorts; tiny collarbone sheer only. Low-rise tailored shorts with separate waistband/fly/pockets/hems are production interpretation.',finalApproval:false};
r.balanceBeforeH20=35690;r.updatedAt=new Date().toISOString();
fs.writeFileSync(folder+'submission-receipt.json',JSON.stringify(r,null,2)+'\n');
console.log(JSON.stringify({candidate:'H20',task,promptLength:prompt.length,references:references.length}));
