// Recovery branch only; preserve the shared HEAD, tracked work and index.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function git(args,opt={}){const r=cp.spawnSync('git',args,{cwd:root,windowsHide:true,maxBuffer:32*1024*1024,...opt});if(r.status!==0)throw new Error(args.join(' ')+': '+r.stderr);return r.stdout;}
const txt=args=>git(args).toString('utf8').trim(),r=JSON.parse(fs.readFileSync(path.join(__dirname,'generation-receipt.json')));
if(r.status!=='completed'||r.displayed_cost_points!==200||!r.sha256)throw new Error('Verified single result required');
if(sha(fs.readFileSync(path.join(__dirname,r.file)))!==r.sha256)throw new Error('Result bytes changed');
const head=txt(['rev-parse','HEAD']),branch=txt(['branch','--show-current']);
const indexPath=path.resolve(root,txt(['rev-parse','--git-path','index'])),indexHash=sha(fs.readFileSync(indexPath)),workHash=sha(git(['diff','--binary']));
const parent=txt(['rev-parse','origin/main']),stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+Z$/,'Z');
const backupBranch='codex/backup-hellgunner-gatling-'+stamp,env={...process.env,GIT_INDEX_FILE:path.join(__dirname,'checkpoint-index-'+stamp)};
git(['read-tree',parent],{env});const entries=[];
function add(file,bytes,source='task-owned file'){const blob=git(['hash-object','-w','--stdin'],{input:bytes}).toString().trim();git(['update-index','--add','--cacheinfo','100644',blob,file],{env});entries.push({file,sha256:sha(bytes),bytes:bytes.length,source});}
const files=fs.readdirSync(__dirname).filter(n=>/\.cjs$/.test(n)||['collect.py','generation-receipt.json','hellgunner_gatling_concept.png'].includes(n)).map(n=>path.relative(root,path.join(__dirname,n)).replaceAll('\\','/'));
files.push('docs/17게임아트팀/HELLGUNNER_GATLING_REVOLVER_20261021.md');
for(const file of files)add(file,fs.readFileSync(path.join(root,file)));
for(const file of ['docs/17게임아트팀/ART_TEAM_MASTER.md','docs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md']){
 const current=fs.readFileSync(path.join(root,file),'utf8'),note=current.split(/\r?\n/).find(x=>x.startsWith('> **2026-10-21')&&x.includes(r.task_id));
 if(!note)throw new Error('Task note missing');const base=git(['show',parent+':'+file]).toString('utf8'),i=base.indexOf('\n');
 add(file,Buffer.from(base.includes(note)?base:base.slice(0,i+1)+'\n'+note+'\n'+base.slice(i+1)),'remote parent plus task-owned note');
}
const tree=git(['write-tree'],{env}).toString().trim();
const commit=git(['commit-tree',tree,'-p',parent],{input:'art: preserve paid Gatling revolver hellgunner concept and review\n'}).toString().trim();
git(['update-ref','refs/heads/'+backupBranch,commit,'0'.repeat(40)]);
git(['push','origin',commit+':refs/heads/'+backupBranch]);
const remote=txt(['ls-remote','origin','refs/heads/'+backupBranch]).split(/\s/)[0];if(remote!==commit)throw new Error('Remote SHA mismatch');
const result={parent,branch:backupBranch,commit,remote,entries,verified:true,sharedHeadPreserved:txt(['rev-parse','HEAD'])===head,sharedBranchPreserved:txt(['branch','--show-current'])===branch,sharedIndexPreserved:sha(fs.readFileSync(indexPath))===indexHash,trackedWorkPreserved:sha(git(['diff','--binary']))===workHash};
fs.writeFileSync(path.join(__dirname,'checkpoint-receipt.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({branch:backupBranch,commit,remote,files:entries.length,head:result.sharedHeadPreserved,index:result.sharedIndexPreserved,work:result.trackedWorkPreserved}));
