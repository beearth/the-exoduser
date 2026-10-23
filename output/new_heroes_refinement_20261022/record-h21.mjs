import fs from 'node:fs';
import crypto from 'node:crypto';
const root='G:/exoduser/',folder=root+'output/new_heroes_refinement_20261022/';
const task=process.argv[2];if(!/^\d{19}$/.test(task||''))throw Error('Actual observed task required');
const r=JSON.parse(fs.readFileSync(folder+'submission-receipt.json','utf8'));
const specs=[
 ['assets/character-concepts/20261022/hellgunner_leather_shorts_bodysuit_h20.png','Edit target. Preserve short bob/face/visor/right robot arm/huge angular gun; redesign garment cut and old design/render language'],
 ['assets/character-concepts/references/20261022/hellgunner_h16/user_02.jpg','User images (1).jpg. Swimsuit bodysuit silhouette and high hip/side waist cut only; original adaptation, not exact copy'],
 ['assets/character-concepts/20261022/hellgunner_userrefs_silvertail_h14.png','Preferred character identity and equipment anchor'],
 ['assets/character-concepts/references/20261022/hellgunner_h14/04_exoduser_silvertail.png','EXODUSER palette/identity consistency; modern render redesign takes priority over old ornate finish']
];
const references=specs.map(([path,role],i)=>({index:i+1,path,role,sha256:crypto.createHash('sha256').update(fs.readFileSync(root+path)).digest('hex')}));
const source='C:/Users/심도진/Desktop/images (1).jpg';
if(crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex')!==references[1].sha256)throw Error('User reference changed');
const prompt='Redesign ref1 adult woman into MODERN sharp game keyart: bold clean planes, crisp shading, no antique trim. Keep short silver bob/face, eye visor, RIGHT robot arm, huge angular gun. Ref2 bodysuit CUT only, not a copy: high hip arches, deep side-waist cutouts, narrow black/ivory torso joining pelvis, visible above low-rise LEATHER SHORTS. Tiny sheer accent. Sleek cropped tech jacket, clean modern boots/mechanics. Full body/whole gun, gray. NO tight shirt, lace, ornate etching, dots.';
if(prompt.length>500)throw Error('Prompt too long');
if(!r.jobs.some(j=>j.candidate==='H21'))r.jobs.unshift({candidate:'H21',task,generationMode:'multi-reference',reference:null,references,prompt,provider:'MagicLight',model:'GPT Image 2.5 sunburst',aspectRatio:'4:3',outputs:1,displayedCost:200,status:'submitted'});
r.jobs.find(j=>j.candidate==='H20').userVerdict='FAIL: torso reads as tight shirt rather than swimsuit-style bodysuit. Overall style too old. Short bob hairstyle is liked.';
r.latestCostumeDirection={userQuotes:['쫄티를입었어 바디수트라니까 ;;','images (1).jpg 저렇게 생긴게 바디수트야','똑같이는 그렇고 비슷하게 하라니까 못알아먹네','스타일도 너무 올드하다 단발머리스타일은 좋은데'],interpretation:'Reference silhouette only: deep side waist cutouts and high hip arches visible above leather shorts. Preserve short bob, visor, right robot arm, giant angular weapon. Modernize garment/equipment shapes and render language; no exact design copying.',finalApproval:false};
r.balanceBeforeH21=35490;r.updatedAt=new Date().toISOString();
fs.writeFileSync(folder+'submission-receipt.json',JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify({candidate:'H21',task,promptLength:prompt.length,references:references.length}));
