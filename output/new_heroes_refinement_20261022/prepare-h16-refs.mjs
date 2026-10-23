import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root='G:/exoduser',folder='assets/character-concepts/references/20261022/hellgunner_h16';
const names=['images.jpg','images (1).jpg','strongest-champ-jinx-could-posibly-beat-v0-icq5ny9tu9jg1.webp',...Array.from({length:5},(_,i)=>`images (${i+2}).jpg`)];
const roles=['Light cropped jacket and agile proportions','Asymmetric techwear and one-piece bodysuit/boots','Rebellious gesture and enormous bespoke weapon mass','Long firearm balance and layered material silhouette','Heavy weapon support harness/grips and weight','Machined stock/rail/receiver structure','Slim asymmetrical clothing/material contrast','Primary bodysuit construction: continuous black torso/pelvis with pale side panels'];
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
fs.mkdirSync(path.join(root,folder),{recursive:true});
const userReferences=names.map((name,i)=>{
 const source='C:/Users/심도진/Desktop/'+name,bytes=fs.readFileSync(source),ext=path.extname(name),destination=folder+`/user_${String(i+1).padStart(2,'0')}`+ext;
 if(bytes.length>20*1024*1024)throw Error('Reference exceeds upload limit');
 const absolute=path.join(root,destination);
 if(!fs.existsSync(absolute))fs.writeFileSync(absolute,bytes,{flag:'wx'});
 if(sha(fs.readFileSync(absolute))!==sha(bytes))throw Error('Reference copy mismatch');
 return {source,path:destination,sha256:sha(bytes),bytes:bytes.length,role:roles[i]};
});
const anchors=[
 {path:'assets/character-concepts/20261022/hellgunner_userrefs_silvertail_h14.png',role:'H14 preferred woman/face/equipment front anchor; edit clothing only'},
 {path:'assets/charselect/silvertail_cut.png',role:'EXODUSER face maturity, dark-metal materials, painterly light and finish'}
].map(r=>({...r,source:root+'/'+r.path,sha256:sha(fs.readFileSync(path.join(root,r.path)))}));
const references=[...anchors,...userReferences].map((r,i)=>({index:i+1,...r}));
fs.writeFileSync(path.join(root,'output/new_heroes_refinement_20261022/h16-reference-receipt.json'),JSON.stringify({recordedAt:new Date().toISOString(),references,userReferenceCount:8},null,2)+'\n');
console.log(JSON.stringify(references.map(({index,path,role})=>({index,path,role})),null,2));
