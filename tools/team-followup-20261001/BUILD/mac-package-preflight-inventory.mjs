import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const project=process.cwd(),home=os.homedir();
const roots=['/Applications',path.join(home,'Applications'),path.join(home,'Library/Caches/nwjs'),path.join(home,'Library/Caches/nw-builder'),path.join(home,'Library/Caches/nw'),path.join(home,'.cache/nwjs'),path.join(project,'cache'),path.join(project,'node_modules/.cache'),path.join(project,'node_modules/nw'),path.join(project,'vendor/nwjs-ffmpeg/0.111.2')];
const observations=roots.map(root=>{
  try{
    if(fs.lstatSync(root).isSymbolicLink())return {root,status:'SYMLINK_NOT_FOLLOWED'};
    const names=fs.readdirSync(root);return {root,status:'READ',total:names.length,depth:1,entries:names.slice(0,200),truncated:names.length>200};
  }catch(error){return {root,status:error.code};}
});
const candidates=observations.flatMap(entry=>(entry.entries||[]).filter(name=>/^nwjs.*\.app$|^nwjs.*-osx-|^EXODUSER.*\.app$/i.test(name)).map(name=>path.join(entry.root,name)));
console.log(JSON.stringify({at:new Date().toISOString(),platform:process.platform,arch:process.arch,observations,candidates,runtimeStatus:candidates.length?'UNKNOWN_CANDIDATES_NOT_VALIDATED':'BLOCKED_NOT_FOUND_IN_BOUNDED_SCOPE',limits:'지정10루트각1단계/최대200이름만조회;파일내용/세이브/전체디스크/프로세스/UI검사0;범위밖런타임은UNKNOWN'},null,2));
