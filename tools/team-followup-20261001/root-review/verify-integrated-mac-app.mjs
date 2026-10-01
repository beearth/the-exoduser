import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

const base='tools/team-followup-20261001/BUILD/integrated-mac-build-';
const result=JSON.parse(fs.readFileSync(base+'result.json'));
const config=JSON.parse(fs.readFileSync(base+'config.json'));
assert.equal(result.status,'PACKAGED_NOT_RUNTIME_ACCEPTED');
assert.equal(result.sourceBackup,'6be3a06b4e8d03768a35f4c57d419f45c8efeb39');
const app=result.appPath, rows=[], startedAt=new Date().toISOString();
function walk(relative=''){
  for(const name of fs.readdirSync(path.join(app,relative)).sort()){
    const key=relative?relative+'/'+name:name,absolute=path.join(app,key),stat=fs.lstatSync(absolute);
    if(stat.isSymbolicLink()){
      const target=fs.readlinkSync(absolute),resolved=fs.realpathSync(absolute);
      assert(resolved.startsWith(app+'/'),'Link escapes app: '+key);
      rows.push({path:key,type:'symlink',target});
    }else if(stat.isDirectory())walk(key);
    else{
      assert(stat.isFile());const fd=fs.openSync(absolute,fs.constants.O_RDONLY|fs.constants.O_NOFOLLOW);
      try{
        const before=fs.fstatSync(fd),hash=createHash('sha256'),buffer=Buffer.alloc(1024*1024);let n;
        while((n=fs.readSync(fd,buffer,0,buffer.length,null))>0)hash.update(buffer.subarray(0,n));
        const after=fs.fstatSync(fd);assert.equal(after.size,before.size);assert.equal(after.mtimeMs,before.mtimeMs);assert.equal(after.ctimeMs,before.ctimeMs);
        rows.push({path:key,type:'file',bytes:before.size,sha256:hash.digest('hex')});
      }finally{fs.closeSync(fd);}
    }
  }
}
walk();
const map=new Map(rows.map(row=>[row.path,row]));
for(const input of config.inputs){
  if(['package.json','node-main.js'].includes(input.path))continue;
  assert.equal(map.get('Contents/Resources/app.nw/'+input.path)?.sha256,input.sha256,input.path);
}
for(const core of result.core)assert.equal(map.get(core.path)?.sha256,core.sha256,core.path);
const binary='Contents/MacOS/EXODUSER-'+config.id;
assert.equal(map.get(binary).sha256,config.runtime.files.find(row=>row.path==='nwjs.app/Contents/MacOS/nwjs').sha256);
assert.equal(rows.length,result.outputManifest.length);
const manifest={startedAt,completedAt:new Date().toISOString(),appPath:app,sourceBackup:result.sourceBackup,entries:rows.length,bytes:rows.reduce((sum,row)=>sum+(row.bytes||0),0),allPackagedInputHashesMatch:true,allCoreHashesMatch:true,mainRuntimeHashMatches:true,allLinksInternal:true,runtimeExecuted:false,files:rows};
fs.writeFileSync('outputs/team-review-20261002/post-integration/app-sha256-manifest.json',JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({...manifest,files:undefined}));
