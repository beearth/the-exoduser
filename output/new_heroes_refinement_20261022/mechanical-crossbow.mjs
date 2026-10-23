import fs from 'node:fs';
import crypto from 'node:crypto';
const root='G:/exoduser/',dir=root+'output/new_heroes_refinement_20261022/';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const original='C:/Users/심도진/Downloads/7518881265495502848-1.png';
const ref='assets/character-concepts/references/20261023/hellgunner_h33/user_revolver_rifle.png';
fs.mkdirSync(root+ref.slice(0,ref.lastIndexOf('/')),{recursive:true});
const bytes=fs.readFileSync(original);if(fs.existsSync(root+ref)){if(sha(fs.readFileSync(root+ref))!==sha(bytes))throw Error('Reference collision');}else fs.writeFileSync(root+ref,bytes);
export const prompt='Ref1: keep adult blonde bob heroine, face, visor, right robot arm, bodysuit and leather shorts; worn clothes. Ref2: weapon mass/cylinder only. Huge MECHANICAL CROSSBOW: broad steel limbs, tension cables, exposed geared cocking rail, heavy revolver breech, central bolt track, shoulder stock. Black iron, worn edges. No laser or belt feed. Full body 3/4 braced aiming pose, stock against shoulder, right trigger hand, left palm UNDER foregrip. Clear silhouette, polished modern anime game art.';
if(prompt.length>500)throw Error('Prompt limit');
export const references=[['assets/character-concepts/20261023/hellgunner_blonde_bob_nami_model_h22.png','Positive H22 character identity and simple clothing only. Replace rejected glowing slab weapon.'],[ref,'User-selected rifle-revolver weapon mass and large cylinder only; replace front with visible mechanical crossbow limbs, tension cables and bolt track.']].map(([path,role],i)=>({index:i+1,path,role,sha256:sha(fs.readFileSync(root+path))}));
const task=process.argv[2];
const brief={updatedAt:new Date().toISOString(),userQuotes:['소총형 리볼버 디자인은 진즉에 만들었는','철컥철컥 소리나면서 단발로 펑펑 쏘는 케릭터','POE2의 쇠뇌쓰는케릭터같이','기계형 쇠뇌처럼'],prompt,references,design:'Heavy mechanical crossbow with revolver-like rear action. Visible steel limbs, cable tension, bolt rail, cocking lever/gears, large breech. Single-shot deliberate rhythm: cock and lock, discharge, recoil and recover. No numeric gameplay tuning or ammo count decided.',supersedes:'Earlier belt-fed machinegun, ordinary sniper, energy-slab and historical multibarrel directions.',status:task?'submitted':'prepared',task:task||null,gameIntegration:false,finalApproval:false};
fs.writeFileSync(dir+'mechanical-crossbow-brief.json',JSON.stringify(brief,null,2)+'\n');
if(task){if(!/^\d{19}$/.test(task))throw Error('Observed task required');const f=dir+'submission-receipt.json',r=JSON.parse(fs.readFileSync(f,'utf8'));if(!r.jobs.some(j=>j.candidate==='H33'))r.jobs.unshift({candidate:'H33',task,label:'Mechanical revolver crossbow',generationMode:'multi-reference',reference:null,references,prompt,provider:'MagicLight',model:'GPT Image 2.5 sunburst',aspectRatio:'4:3',outputs:1,displayedCost:200,status:'submitted'});r.latestMechanicalCrossbowDirection=brief;r.updatedAt=new Date().toISOString();fs.writeFileSync(f,JSON.stringify(r,null,2)+'\n');}
console.log(JSON.stringify({promptLength:prompt.length,references,task:task||null}));
