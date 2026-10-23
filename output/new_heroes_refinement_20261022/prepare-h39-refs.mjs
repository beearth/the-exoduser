import fs from 'node:fs';import crypto from 'node:crypto';
const root='G:/exoduser/',folder='assets/character-concepts/references/20261023/hellgunner_h39/',out=root+'output/new_heroes_refinement_20261022/';fs.mkdirSync(root+folder,{recursive:true});
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const save=(p,b)=>{if(fs.existsSync(root+p)){if(sha(fs.readFileSync(root+p))!==sha(b))throw Error('Collision '+p);}else fs.writeFileSync(root+p,b,{flag:'wx'});return sha(b);};
const references=[];
for(const [name,target,role] of [['images (6).jpg','user_edgerunners.jpg','Style continuity only; retain existing H38 character/clothes'],['images (7).jpg','user_modular_pistol.jpg','Modular weapon shells, worn paint, panel seams, fasteners; NOT pistol scale, exact brand marks or yellow color wholesale']]){const source='C:/Users/심도진/Desktop/'+name,b=fs.readFileSync(source),path=folder+target;references.push({source,path,sha256:save(path,b),role});}
for(const [name,stem] of [['imgres.htm','user_handgun'],['imgres (1).htm','user_smg'],['imgres (2).htm','user_modular_receiver'],['imgres (3).htm','user_rifle']]){
 const source='C:/Users/심도진/Desktop/'+name,b=fs.readFileSync(source),s=b.toString('utf8');const tags=[...s.matchAll(/<meta\b[^>]*>/gi)].map(m=>m[0]);const og=tags.find(t=>/property=["']og:image["']/i.test(t));const url=og?.match(/content=["']([^"']+)["']/i)?.[1]?.replaceAll('&amp;','&');if(!url)throw Error('No image metadata '+name);
 let imageUrl=url,response=await fetch(url,{signal:AbortSignal.timeout(20000)});
 if(!response.ok){const tag=[...s.matchAll(/<img\b[^>]*>/gi)].map(m=>m[0]).find(t=>/class=["']sFlh5c/.test(t));imageUrl=tag?.match(/src=["']([^"']+)["']/)?.[1]?.replaceAll('&amp;','&');if(!imageUrl)throw Error('No observed fallback '+name);response=await fetch(imageUrl,{signal:AbortSignal.timeout(20000)});}
 if(!response.ok)throw Error('Image HTTP '+response.status+' '+name);const img=Buffer.from(await response.arrayBuffer());let ext;if(img.subarray(0,8).toString('hex')==='89504e470d0a1a0a')ext='png';else if(img.subarray(0,3).toString('hex')==='ffd8ff')ext='jpg';else if(img.toString('ascii',0,4)==='RIFF'&&img.toString('ascii',8,12)==='WEBP')ext='webp';else throw Error('Not image '+name);
 const path=folder+stem+'.'+ext;references.push({source,sourceHtmlSha256:sha(b),originalImageUrl:url,imageUrl,path,sha256:save(path,img),role:'User-selected futuristic firearm detail language only. Preserve H38 giant revolver-rifle silhouette; no brand copying or pistol/SMG substitution.'});
}
fs.writeFileSync(out+'h39-reference-receipt.json',JSON.stringify({recordedAt:new Date().toISOString(),references,htmlUploaded:false},null,2)+'\n');console.log(JSON.stringify(references,null,2));
