const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function git(a,o={}){const r=cp.spawnSync('git',a,{cwd:root,windowsHide:true,maxBuffer:32*1024*1024,...o});if(r.status!==0)throw Error(a.join(' ')+': '+r.stderr);return r.stdout;}
const txt=a=>git(a).toString().trim(),r=JSON.parse(fs.readFileSync(path.join(__dirname,'generation-receipt.json')));
if(r.status!=='completed'||r.displayed_cost_points!==200||sha(fs.readFileSync(path.join(__dirname,r.file)))!==r.sha256)throw Error('Completed verified single image required');
const head=txt(['rev-parse','HEAD']),branch=txt(['branch','--show-current']),indexPath=path.resolve(root,txt(['rev-parse','--git-path','index']));
const indexHash=sha(fs.readFileSync(indexPath)),workHash=sha(git(['diff','--binary'])),parent=txt(['rev-parse','origin/main']);
const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+Z$/,'Z'),backup='codex/backup-hellgunner-single-muzzle-'+stamp;
const env={...process.env,GIT_INDEX_FILE:path.join(__dirname,'checkpoint-index-'+stamp)};git(['read-tree',parent],{env});
const entries=[];
function add(file,bytes,source='task-owned file'){const blob=git(['hash-object','-w','--stdin'],{input:bytes}).toString().trim();git(['update-index','--add','--cacheinfo','100644',blob,file],{env});entries.push({file,bytes:bytes.length,sha256:sha(bytes),source});}
const files=fs.readdirSync(__dirname).filter(n=>/\.cjs$/.test(n)||['collect.py','generation-receipt.json','hellgunner_single_muzzle.png'].includes(n)).map(n=>path.relative(root,path.join(__dirname,n)).replaceAll('\\','/'));
files.push('docs/17게임아트팀/HELLGUNNER_SINGLE_MUZZLE_20261021.md','docs/17게임아트팀/HELLGUNNER_MALE_REFINED_20261021.md');
for(const f of files)add(f,fs.readFileSync(path.join(root,f)));
for(const f of ['docs/17게임아트팀/ART_TEAM_MASTER.md','docs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md']){
 const note=fs.readFileSync(path.join(root,f),'utf8').split(/\r?\n/).find(x=>x.startsWith('> **2026-10-21')&&x.includes(r.task_id));if(!note)throw Error('Task note missing');
 const base=git(['show',parent+':'+f]).toString('utf8'),i=base.indexOf('\n');add(f,Buffer.from(base.includes(note)?base:base.slice(0,i+1)+'\n'+note+'\n'+base.slice(i+1)),'remote parent plus task-owned note');
}
const tree=git(['write-tree'],{env}).toString().trim(),commit=git(['commit-tree',tree,'-p',parent],{input:'art: preserve single-muzzle hellgunner edit and review\n'}).toString().trim();
git(['update-ref','refs/heads/'+backup,commit,'0'.repeat(40)]);git(['push','origin',commit+':refs/heads/'+backup]);
const remote=txt(['ls-remote','origin','refs/heads/'+backup]).split(/\s/)[0];if(remote!==commit)throw Error('Remote SHA mismatch');
const result={parent,branch:backup,commit,remote,entries,verified:true,sharedHeadPreserved:txt(['rev-parse','HEAD'])===head,sharedBranchPreserved:txt(['branch','--show-current'])===branch,sharedIndexPreserved:sha(fs.readFileSync(indexPath))===indexHash,trackedWorkPreserved:sha(git(['diff','--binary']))===workHash};
fs.writeFileSync(path.join(__dirname,'checkpoint-receipt.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({branch:backup,commit,remote,files:entries.length,head:result.sharedHeadPreserved,index:result.sharedIndexPreserved,work:result.trackedWorkPreserved}));
