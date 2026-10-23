import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root='G:/exoduser',dir=path.join(root,'output/new_heroes_refinement_20261022');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const git=(args,options={})=>execFileSync('git',args,{cwd:root,windowsHide:true,encoding:'utf8',...options}).trim();
const parent=git(['rev-parse','HEAD']),branch=git(['branch','--show-current']);
const remoteMain=git(['ls-remote','origin','refs/heads/main']).split(/\s+/)[0];
const realIndex=path.resolve(root,git(['rev-parse','--git-path','index']));
const indexBefore=sha(fs.readFileSync(realIndex));
const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
const env={...process.env,GIT_INDEX_FILE:path.join(dir,`checkpoint-${stamp}.index`)};
const downloads=JSON.parse(fs.readFileSync(path.join(dir,'download-receipt.json')));
const suitReferences=JSON.parse(fs.readFileSync(path.join(dir,'h16-reference-receipt.json'))).references.filter(r=>r.path.startsWith('assets/character-concepts/references/20261022/hellgunner_h16/')).map(r=>r.path);
const fixed=[
 "output/new_heroes_refinement_20261022/chrome-fullbody-visual-review.json",
 "output/new_heroes_refinement_20261022/finish-chrome-fullbody.mjs",
 "output/new_heroes_refinement_20261022/h56-reference-receipt.json",
 "output/new_heroes_refinement_20261022/record-fullbody-muzzle.mjs",
 "output/new_heroes_refinement_20261022/chrome-fullbody-receipt.json",
 "output/new_heroes_refinement_20261022/record-chrome-fullbody.mjs",
 "output/new_heroes_refinement_20261022/finish-chrome-variants.mjs",
 "output/new_heroes_refinement_20261022/h53-reference-receipt.json",
 "output/new_heroes_refinement_20261022/chrome-variants-visual-review.json",
 "output/new_heroes_refinement_20261022/record-chrome-fix.mjs",
 "output/new_heroes_refinement_20261022/chrome-variants-receipt.json",
 "output/new_heroes_refinement_20261022/record-chrome-variants.mjs",
 "output/new_heroes_refinement_20261022/h50-visual-review.json",
 "output/new_heroes_refinement_20261022/finish-h50.mjs",
 "output/new_heroes_refinement_20261022/h50-reference-receipt.json",
 "output/new_heroes_refinement_20261022/record-h50.mjs",
 "output/new_heroes_refinement_20261022/h49-visual-review.json",
 "output/new_heroes_refinement_20261022/finish-h49.mjs",
 "output/new_heroes_refinement_20261022/h49-reference-receipt.json",
 "output/new_heroes_refinement_20261022/record-h49.mjs",
 "output/new_heroes_refinement_20261022/prepare-h49.mjs",
 "assets/character-concepts/references/20261023/hellgunner_h49/user_ammo_target.png",
 "output/new_heroes_refinement_20261022/detail-visual-review.json",
 "output/new_heroes_refinement_20261022/finalize-detail-review.mjs",
 "output/new_heroes_refinement_20261022/record-h48.mjs",
 "output/new_heroes_refinement_20261022/record-h47.mjs",
 "output/new_heroes_refinement_20261022/h46-pose-reference.json",
 "output/new_heroes_refinement_20261022/prepare-shoulder-pose-ref.mjs",
 "output/new_heroes_refinement_20261022/record-h46.mjs",
 "assets/character-concepts/references/20261023/hellgunner_h46/shouldered_forward_support_pose.jpg",
 "output/new_heroes_refinement_20261022/record-h45.mjs",
 "output/new_heroes_refinement_20261022/record-h44.mjs",
 "output/new_heroes_refinement_20261022/record-h43.mjs",
 "output/new_heroes_refinement_20261022/record-h42.mjs",
 "output/new_heroes_refinement_20261022/record-h41.mjs",
 "output/new_heroes_refinement_20261022/record-h40.mjs",
 "output/new_heroes_refinement_20261022/h39-reference-receipt.json",
 "output/new_heroes_refinement_20261022/record-h39.mjs",
 "output/new_heroes_refinement_20261022/append-h39-refs.mjs",
 "output/new_heroes_refinement_20261022/prepare-h39-refs.mjs",
 "output/new_heroes_refinement_20261022/inspect-detail-refs.mjs",
 "assets/character-concepts/references/20261023/hellgunner_h39/user_carnage.jpg",
 "assets/character-concepts/references/20261023/hellgunner_h39/user_future_detail_08.jpg",
 "assets/character-concepts/references/20261023/hellgunner_h39/user_rifle.webp",
 "assets/character-concepts/references/20261023/hellgunner_h39/user_modular_receiver.webp",
 "assets/character-concepts/references/20261023/hellgunner_h39/user_smg.webp",
 "assets/character-concepts/references/20261023/hellgunner_h39/user_handgun.webp",
 "assets/character-concepts/references/20261023/hellgunner_h39/user_modular_pistol.jpg",
 "assets/character-concepts/references/20261023/hellgunner_h39/user_edgerunners.jpg",
 "output/new_heroes_refinement_20261022/review-giant-gun.mjs",
 "output/new_heroes_refinement_20261022/record-shoulder-retouch.mjs",
 "output/new_heroes_refinement_20261022/finalize-giant-gun.mjs",
 "output/new_heroes_refinement_20261022/single-shot-giant-gun.mjs",
 "docs/17게임아트팀/HELLGUNNER_SINGLE_SHOT_GIANT_GUN_20261023.md",
 "output/new_heroes_refinement_20261022/preserve-crossbow-note.mjs",
 "output/new_heroes_refinement_20261022/record-crossbow-combined.mjs",
 "output/new_heroes_refinement_20261022/record-crossbow-weapon.mjs",
 "output/new_heroes_refinement_20261022/record-crossbow-retry.mjs",
 "output/new_heroes_refinement_20261022/update-crossbow-docs.mjs",
 "output/new_heroes_refinement_20261022/mechanical-crossbow-brief.json",
 "output/new_heroes_refinement_20261022/mechanical-crossbow.mjs",
 "assets/character-concepts/references/20261023/hellgunner_h33/user_revolver_rifle.png",
 "docs/17게임아트팀/HELLGUNNER_MECHANICAL_CROSSBOW_20261023.md",
 'docs/17게임아트팀/NEW_HEROES_CONTINUOUS_REFINEMENT_20261022.md',
 'docs/17게임아트팀/HELLGUNNER_CYBERPUNK_DESIGN_20261022.md',
 ...['01_user_figure.jpg','02_user_edgerunners.jpg','03_user_jinx.webp','04_exoduser_silvertail.png'].map(n=>'assets/character-concepts/references/20261022/hellgunner_h14/'+n),
 ...['prepare-h14-refs.mjs','record-h14.mjs','record-h15.mjs','h14-reference-receipt.json'].map(n=>'output/new_heroes_refinement_20261022/'+n),
 ...suitReferences,
 ...['prepare-h16-refs.mjs','record-h16.mjs','record-h18.mjs','h16-reference-receipt.json'].map(n=>'output/new_heroes_refinement_20261022/'+n),
 'assets/character-concepts/references/20261022/hellgunner_h19/user_bodysuit_mesh.png',
 ...['prepare-h19-refs.mjs','record-h19.mjs','review-h19.mjs','h19-reference-receipt.json'].map(n=>'output/new_heroes_refinement_20261022/'+n),
 ...['record-h20.mjs','update-h20-docs.mjs','review-h20.mjs'].map(n=>'output/new_heroes_refinement_20261022/'+n),
 ...['record-h21.mjs','update-h21-docs.mjs','review-h21.mjs'].map(n=>'output/new_heroes_refinement_20261022/'+n),
 'assets/character-concepts/references/20261023/hellgunner_h22/official_nami_odyssey.jpg',
 ...['prepare-h22-nami.mjs','h22-nami-reference.json','record-h22.mjs','update-h22-docs.mjs','review-h22.mjs'].map(n=>'output/new_heroes_refinement_20261022/'+n),
 ...['record-h23.mjs','update-h23-docs.mjs'].map(n=>'output/new_heroes_refinement_20261022/'+n),
 ...['record-h24.mjs','update-h24-docs.mjs','review-h24.mjs'].map(n=>'output/new_heroes_refinement_20261022/'+n),
 'docs/17게임아트팀/HELLGUNNER_POSE_VERSIONS_20261023.md',
 ...['pose-versions.mjs','record-pose-versions.mjs','update-pose-docs.mjs','pose-reviews.json','review-poses.mjs','finalize-pose-candidates.mjs'].map(n=>'output/new_heroes_refinement_20261022/'+n),
 ...['record.mjs','record-h09.mjs','record-h10.mjs','record-h11.mjs','record-h12.mjs','record-h13.mjs','record-t03-failure.mjs','collect.mjs','collect-one.mjs','verify-artifacts.mjs','update-progress.mjs','checkpoint.mjs','submission-receipt.json','download-receipt.json','shared-notes.json','artifact-verification.json'].map(n=>'output/new_heroes_refinement_20261022/'+n)
];
const files=[...new Set([...fixed,...downloads.rows.map(r=>r.destination)])];
const payload=files.map(p=>({path:p,sha256:sha(fs.readFileSync(path.join(root,p)))}));
git(['read-tree',parent],{env});
git(['add','--',...files],{env});
const notes=JSON.parse(fs.readFileSync(path.join(dir,'shared-notes.json'))),noteOnly=[];
for(const item of notes){
 let base;
 try{base=execFileSync('git',['show',`${parent}:${item.path}`],{cwd:root,windowsHide:true,encoding:'utf8',stdio:['pipe','pipe','pipe']});}catch{noteOnly.push(item.path);continue;}
 const nl=base.includes('\r\n')?'\r\n':'\n',end=base.indexOf('\n')+1;
 const content=base.includes(item.note)?base:base.slice(0,end)+nl+item.note+nl+base.slice(end);
 const object=git(['hash-object','-w','--stdin'],{input:content});
 git(['update-index','--add','--cacheinfo','100644',object,item.path],{env});
}
for(const f of payload){if(sha(fs.readFileSync(path.join(root,f.path)))!==f.sha256)throw new Error(`Concurrent payload change: ${f.path}`);}
const tree=git(['write-tree'],{env});
const commit=git(['commit-tree',tree,'-p',parent,'-m','art: preserve new hero refinement and cyberpunk Hellgunner candidates (review pending)']);
const ref=`refs/heads/codex/backup-new-heroes-refinement-${stamp.toLowerCase()}`;
git(['update-ref',ref,commit,'0000000000000000000000000000000000000000']);
git(['push','origin',`${ref}:${ref}`]);
const remote=git(['ls-remote','origin',ref]).split(/\s+/)[0];
if(remote!==commit)throw new Error('Remote backup SHA mismatch');
const afterHead=git(['rev-parse','HEAD']),afterBranch=git(['branch','--show-current']),indexAfter=sha(fs.readFileSync(realIndex));
const receipt={createdAt:new Date().toISOString(),ref,commit,remoteVerifiedSha:remote,baseHead:parent,expectedRemoteMainAtCapture:remoteMain,workingHeadAfter:afterHead,workingBranchBefore:branch,workingBranchAfter:afterBranch,indexBefore,indexAfter,sharedIndexUnchanged:indexBefore===indexAfter,headUnchanged:parent===afterHead,scope:'Own art assets and reports only. Shared existing docs reconstructed from base HEAD plus own note; absent-base docs represented by note payload only. Not a full tracked-WIP backup or main integration.',noteOnly,payload};
fs.writeFileSync(path.join(dir,'checkpoint-receipt.json'),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({ref,commit,remoteVerifiedSha:remote,headUnchanged:receipt.headUnchanged,sharedIndexUnchanged:receipt.sharedIndexUnchanged,noteOnly},null,2));
