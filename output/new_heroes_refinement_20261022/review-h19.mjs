import fs from 'node:fs';
const f='G:/exoduser/output/new_heroes_refinement_20261022/submission-receipt.json';
const r=JSON.parse(fs.readFileSync(f,'utf8'));
Object.assign(r.jobs.find(j=>j.candidate==='H19'),{visualVerdict:'Garment correction candidate: swimsuit high-cut silhouette, bare upper thighs, black lace/mesh at collarbone/abdomen/side waist, opaque bust/pelvis lining confirmed in original. H14 identity/equipment retained. Dense mesh/floral texture remains; no claim of zero dots. Natural left hand carries gun, robot right hand rests by thigh; not validated two-hand support.',finalApproval:false,runtimeAdoption:false});
fs.writeFileSync(f,JSON.stringify(r,null,2)+'\n');
