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
const fixed=[
 'docs/17게임아트팀/NEW_HEROES_CONTINUOUS_REFINEMENT_20261022.md',
 'docs/17게임아트팀/HELLGUNNER_CYBERPUNK_DESIGN_20261022.md',
 ...['record.mjs','record-h09.mjs','record-t03-failure.mjs','collect.mjs','collect-one.mjs','verify-artifacts.mjs','update-progress.mjs','checkpoint.mjs','submission-receipt.json','download-receipt.json','shared-notes.json','artifact-verification.json'].map(n=>'output/new_heroes_refinement_20261022/'+n)
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
