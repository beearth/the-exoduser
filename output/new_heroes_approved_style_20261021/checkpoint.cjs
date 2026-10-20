// Save only owned review assets/docs to a new recovery branch using an isolated index.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function git(args,opt={}){const r=cp.spawnSync('git',args,{cwd:root,windowsHide:true,maxBuffer:32*1024*1024,...opt});if(r.status!==0)throw new Error(args.join(' ')+': '+r.stderr);return r.stdout;}
const txt=args=>git(args).toString('utf8').trim();
const receipt=JSON.parse(fs.readFileSync(path.join(__dirname,'generation-receipt.json')));
receipt.jobs.push(...JSON.parse(fs.readFileSync(path.join(__dirname,'edit-generation-receipt.json'))).jobs);
receipt.jobs.push(...JSON.parse(fs.readFileSync(path.join(__dirname,'clean-generation-receipt.json'))).jobs);
if(receipt.jobs.length!==8||receipt.jobs.some(j=>j.status!=='completed'||j.params?.use_unlim!==true))throw new Error('Eight completed unlimited jobs required');
const head=txt(['rev-parse','HEAD']),branch=txt(['branch','--show-current']);
const indexPath=path.resolve(root,txt(['rev-parse','--git-path','index']));
const beforeIndex=sha(fs.readFileSync(indexPath)),beforeWork=sha(git(['diff','--binary']));
const parent=txt(['rev-parse','origin/main']);
const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+Z$/,'Z');
const backupBranch='codex/backup-newheroes-approvedstyle-'+stamp;
const env={...process.env,GIT_INDEX_FILE:path.join(__dirname,'checkpoint-index-'+stamp)};
git(['read-tree',parent],{env});
const files=fs.readdirSync(__dirname).filter(n=>/^[ABC]0[123]\.png$/.test(n)||/_review\.jpg$/.test(n)||['generation-receipt.json','edit-generation-receipt.json','clean-generation-receipt.json','download-receipt.json','collect_review.py','checkpoint.cjs'].includes(n)).map(n=>path.relative(root,path.join(__dirname,n)).replaceAll('\\','/'));
files.push('docs/17게임아트팀/NEW_HEROES_APPROVED_STYLE_MATCH_20261021.md','output/new_heroes_approved_style_20261021/references/user_spear_reference.png','output/new_heroes_approved_style_20261021/references/hell_revolver_weapon_only.png','output/new_heroes_approved_style_20261021/balance-receipt.json');
const entries=[];
function add(file,bytes,source='owned file'){const blob=git(['hash-object','-w','--stdin'],{input:bytes}).toString().trim();git(['update-index','--add','--cacheinfo','100644',blob,file],{env});entries.push({file,bytes:bytes.length,sha256:sha(bytes),source});}
for(const file of files)add(file,fs.readFileSync(path.join(root,file)));
for(const file of ['docs/17게임아트팀/ART_TEAM_MASTER.md','docs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md']){
 const current=fs.readFileSync(path.join(root,file),'utf8'),note=current.split(/\r?\n\r?\n/)[1];
 if(!note.startsWith('> **2026-10-21')||!note.includes('작화'))throw new Error('Unexpected task note '+file);
 const base=git(['show',parent+':'+file]).toString('utf8'),nl=base.indexOf('\n');
 add(file,Buffer.from(base.includes(note)?base:base.slice(0,nl+1)+'\n'+note+'\n'+base.slice(nl+1)),'remote parent plus task-owned note');
}
const tree=txtWithEnv(['write-tree']);
function txtWithEnv(args){return git(args,{env}).toString().trim();}
const commit=git(['commit-tree',tree,'-p',parent],{input:'art: preserve new hero concepts and free corrective studies\n'}).toString().trim();
git(['update-ref','refs/heads/'+backupBranch,commit,'0'.repeat(40)]);
git(['push','origin',commit+':refs/heads/'+backupBranch]);
const remote=txt(['ls-remote','origin','refs/heads/'+backupBranch]).split(/\s/)[0];
if(remote!==commit)throw new Error('Remote backup mismatch');
const result={parent,branch:backupBranch,commit,remote,verified:true,entries,
 sharedHeadPreserved:txt(['rev-parse','HEAD'])===head,sharedBranchPreserved:txt(['branch','--show-current'])===branch,
 sharedIndexPreserved:sha(fs.readFileSync(indexPath))===beforeIndex,trackedWorkPreserved:sha(git(['diff','--binary']))===beforeWork};
fs.writeFileSync(path.join(__dirname,'checkpoint-receipt.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({branch:backupBranch,commit,remote,files:entries.length,head:result.sharedHeadPreserved,index:result.sharedIndexPreserved,work:result.trackedWorkPreserved}));
