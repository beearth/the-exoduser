import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root='G:/exoduser',folder='assets/character-concepts/references/20261022/hellgunner_h14';
const specs=[
 ['C:/Users/심도진/Desktop/images.jpg','01_user_figure.jpg','Cropped asymmetric jacket, slender agile body proportions; reference design, not figurine render or watermark.'],
 ['C:/Users/심도진/Desktop/images (1).jpg','02_user_edgerunners.jpg','Asymmetric techwear, fitted core/thigh-high boots, energetic angular composition; no logos or same character.'],
 ['C:/Users/심도진/Desktop/strongest-champ-jinx-could-posibly-beat-v0-icq5ny9tu9jg1.webp','03_user_jinx.webp','Rebellious gesture and enormous bespoke weapon mass; not same multi-barrel weapon or character.'],
 ['G:/exoduser/assets/charselect/silvertail_cut.png','04_exoduser_silvertail.png','Primary game consistency anchor: mature face, dark iron, controlled material reflections, deep painterly light. Do not copy her ponytail/skirt/blades.']
];
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
fs.mkdirSync(path.join(root,folder),{recursive:true});
const references=specs.map(([source,name,role],i)=>{
 const bytes=fs.readFileSync(source),destination=folder+'/'+name,absolute=path.join(root,destination);
 if(bytes.length>20*1024*1024)throw Error('Reference exceeds UI upload limit');
 if(!fs.existsSync(absolute))fs.writeFileSync(absolute,bytes,{flag:'wx'});
 if(sha(fs.readFileSync(absolute))!==sha(bytes))throw Error('Reference snapshot mismatch');
 return {index:i+1,source,path:destination,sha256:sha(bytes),bytes:bytes.length,role};
});
fs.writeFileSync(path.join(root,'output/new_heroes_refinement_20261022/h14-reference-receipt.json'),JSON.stringify({recordedAt:new Date().toISOString(),references},null,2)+'\n');
console.log(JSON.stringify(references.map(({index,path,bytes,sha256})=>({index,path,bytes,sha256})),null,2));
