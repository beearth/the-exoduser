const fs=require('node:fs');
const path=require('node:path');
const cp=require('node:child_process');
const crypto=require('node:crypto');
const {parse}=require('acorn');

const DEFAULT_THRESHOLD=50,DEFAULT_QUIET_MS=60000;
function command(root,exe,args,env={}){
 const r=cp.spawnSync(exe,args,{cwd:root,env:{...process.env,GIT_OPTIONAL_LOCKS:'0',...env},encoding:'utf8',timeout:120000,maxBuffer:8*1024*1024,windowsHide:true});
 if(r.error||r.status!==0)throw Error((r.error?.message||r.stderr||r.stdout||'Command failed').slice(-3000));
 return r.stdout;
}
const git=(root,args,env)=>command(root,'git',args,env);
function changes(root){return git(root,['status','--porcelain=v1','--no-renames','-z','--untracked-files=all']).split('\0').filter(Boolean).map(s=>({status:s.slice(0,2),path:s.slice(3)}));}
function fingerprint(root,files){
 const values=files.map(f=>{let stat;try{stat=fs.statSync(path.join(root,f.path),{bigint:true});}catch(e){if(e.code!=='ENOENT')throw e;}
  return [f.status,f.path,stat?String(stat.size):null,stat?String(stat.mtimeNs):null];});
 return crypto.createHash('sha256').update(JSON.stringify(values)).digest('hex');
}
function validateChanges(root,files){
 const existing=files.filter(f=>!f.status.includes('D'));
 const nonDocs=existing.some(f=>!f.path.startsWith('docs/'));
 if(nonDocs&&(!files.some(f=>f.path==='docs/CHANGELOG_SYNC.md')||!files.some(f=>f.path.startsWith('docs/')&&f.path!=='docs/CHANGELOG_SYNC.md')))
  throw Error('Related docs and docs/CHANGELOG_SYNC.md must be updated before automatic commit.');
 for(const f of existing){
  if(!/\.(?:[cm]?js|html)$/.test(f.path))continue;
  const source=fs.readFileSync(path.join(root,f.path),'utf8');
  if(f.path.endsWith('.html')){
   for(const [,attrs,code] of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
    if(/src\s*=|importmap|application\/json/i.test(attrs)||!code.trim())continue;
    parse(code,{ecmaVersion:'latest',sourceType:/type\s*=\s*["']module/.test(attrs)?'module':'script'});
   }
  }else parse(source,{ecmaVersion:'latest',sourceType:f.path.endsWith('.cjs')?'script':'module',allowHashBang:true});
 }
 const tests=existing.filter(f=>/^test\/.*\.test\.[cm]?js$/.test(f.path)).map(f=>f.path);
 if(tests.length)command(root,process.execPath,['--test',...tests]);
 git(root,['-c','core.whitespace=cr-at-eol','diff','--check']);
}
function runOnce({root=path.resolve(__dirname,'..'),threshold=DEFAULT_THRESHOLD,quietMs=DEFAULT_QUIET_MS,now=Date.now(),validate=validateChanges}={}){
 const local=path.join(root,'tmp','auto-cleanup');fs.mkdirSync(local,{recursive:true});
 const stateFile=path.join(local,'state.json'),logFile=path.join(local,'events.jsonl');
 let state={};try{state=JSON.parse(fs.readFileSync(stateFile,'utf8'));}catch(e){if(e.code!=='ENOENT')state={};}
 function result(status,details={}){
  const event={at:new Date(now).toISOString(),status,...details};
  fs.writeFileSync(stateFile,JSON.stringify({...state,lastResult:event},null,2));
  if(status!=='below-threshold'||state.lastResult?.status!==status){
   if(fs.existsSync(logFile)&&fs.statSync(logFile).size>1024*1024)fs.renameSync(logFile,path.join(local,'events.previous.jsonl'));
   fs.appendFileSync(logFile,JSON.stringify(event)+'\n');
  }
  return event;
 }
 let lockFd,lockPath,privateIndex,committed=false;
 try{
  const files=changes(root),count=files.length;
  if(count<threshold){state={};return result('below-threshold',{count,threshold});}
  if(files.some(f=>f.status!=='??'&&f.status[0]!==' '))return result('staged-work',{count});
  const head=git(root,['rev-parse','HEAD']).trim(),mark=fingerprint(root,files)+head;
  if(state.fingerprint!==mark){state={fingerprint:mark,quietSince:now};return result('waiting-for-idle',{count,quietMs});}
  if(now-state.quietSince<quietMs)return result('waiting-for-idle',{count,quietMs});
  git(root,['symbolic-ref','--quiet','HEAD']);
  for(const flag of ['MERGE_HEAD','CHERRY_PICK_HEAD','REVERT_HEAD','rebase-merge','rebase-apply']){
   const p=git(root,['rev-parse','--git-path',flag]).trim();
   if(fs.existsSync(path.resolve(root,p)))return result('git-operation-active',{count});
  }
  validate(root,files);
  if(fingerprint(root,changes(root))+git(root,['rev-parse','HEAD']).trim()!==mark)return result('changed-during-check',{count});
  const indexPath=path.resolve(root,git(root,['rev-parse','--git-path','index']).trim());
  const candidateLock=indexPath+'.lock';
  try{lockFd=fs.openSync(candidateLock,'wx');lockPath=candidateLock;}catch(e){if(e.code==='EEXIST')return result('git-busy',{count});throw e;}
  // Keep other sessions out of the shared index; prepare the commit in a separate index.
  if(git(root,['diff','--cached','--name-only']).trim()||git(root,['rev-parse','HEAD']).trim()!==head)return result('git-changed',{count});
  if(fingerprint(root,changes(root))+head!==mark)return result('changed-during-check',{count});
  privateIndex=path.join(local,'index-'+process.pid+'-'+now);
  const env={GIT_INDEX_FILE:privateIndex};
  git(root,['read-tree',head],env);
  git(root,['add','--all','--',...files.map(f=>f.path)],env);
  git(root,['-c','core.whitespace=cr-at-eol','diff','--cached','--check'],env);
  if(fingerprint(root,changes(root))+git(root,['rev-parse','HEAD']).trim()!==mark)return result('changed-during-check',{count});
  // Preserve the old index as a recovery aid before advancing HEAD.
  fs.copyFileSync(indexPath,path.join(local,'index.before'));
  git(root,['commit','-m',`auto: local checkpoint (${count} changed files)`],env);
  committed=true;
  fs.writeFileSync(lockFd,fs.readFileSync(privateIndex));fs.closeSync(lockFd);lockFd=undefined;
  fs.renameSync(lockPath,indexPath);lockPath=undefined;
  const commit=git(root,['rev-parse','--short','HEAD']).trim();state={};
  return result('committed',{count,commit,remaining:changes(root).length});
 }catch(e){return result('blocked',{reason:e.message,committed});}
 finally{
  if(lockFd!==undefined)fs.closeSync(lockFd);
  // A completed commit with an index replacement failure keeps its recovery files.
  if(lockPath&&!committed&&fs.existsSync(lockPath))fs.unlinkSync(lockPath);
  if(privateIndex&&!committed&&fs.existsSync(privateIndex))fs.unlinkSync(privateIndex);
  if(privateIndex&&committed&&!lockPath&&fs.existsSync(privateIndex))fs.unlinkSync(privateIndex);
 }
}
module.exports={runOnce,validateChanges,changes,DEFAULT_THRESHOLD,DEFAULT_QUIET_MS};
if(require.main===module){
 const event=runOnce();console.log(JSON.stringify(event));
 if(event.status==='blocked')process.exitCode=1;
}
