import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import cp from 'node:child_process';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const guardUrl=new URL('../tools/guard.js',import.meta.url);
const source=fs.readFileSync(guardUrl,'utf8').replace(/^import.*;\s*$/gm,'').replaceAll('import.meta.url',JSON.stringify(guardUrl.href));
const root=fileURLToPath(new URL('../',import.meta.url));
const gameFile=path.join(root,'game.html'),baselineFile=path.join(root,'tools/guard.baseline.json');
const game="<script>\nconst ELC=['#111'];\nconst ETYPE_COL=['#222'];\nfunction _tseed(x){return x;}\nconst BOSS_MOVES=[{idx:0},{idx:1}];\nfunction loop(timestamp){\n let alive=1;\n}\n</script>\n";

// The CLI owns filesystem persistence; inject only its two project inputs and
// baseline write so the locked-file failure is deterministic on every OS.
function runGuard({baseline,denyWrite=false}={}){
 const writes=[],out={writes,exit:null};
 const fixtureFs=Object.create(fs);
 fixtureFs.existsSync=f=>path.resolve(f)===gameFile?true:path.resolve(f)===baselineFile?baseline!==undefined:fs.existsSync(f);
 fixtureFs.readFileSync=(f,...a)=>path.resolve(f)===gameFile?game:path.resolve(f)===baselineFile?(baseline===undefined?(()=>{throw Error('ENOENT');})():baseline):fs.readFileSync(f,...a);
 fixtureFs.writeFileSync=(f,data,...a)=>{if(path.resolve(f)!==baselineFile)return fs.writeFileSync(f,data,...a);if(denyWrite)throw Object.assign(Error('locked baseline write'),{code:'UNKNOWN'});writes.push(data);};
 class GuardExit extends Error{constructor(code){super('guard exit');this.code=code;}}
 const fixtureCp=Object.create(cp);fixtureCp.execSync=()=>Buffer.from('');
 try{vm.runInNewContext(source,{fs:fixtureFs,os,path,crypto,cp:fixtureCp,fileURLToPath,process:{execPath:process.execPath,exit:code=>{throw new GuardExit(code);}},console:{log(){},error(){}}},{timeout:30000});}
 catch(e){if(e instanceof GuardExit)out.exit=e.code;else throw e;}
 return out;
}
const valid=runGuard().writes[0];

test('unchanged valid baseline passes when replacing the existing file is blocked',()=>{
 const result=runGuard({baseline:valid,denyWrite:true});
 assert.equal(result.exit,0);assert.equal(result.writes.length,0);
});
test('changed valid baseline is still persisted',()=>{
 const old=JSON.parse(valid);old.lines--;
 const result=runGuard({baseline:JSON.stringify(old,null,2)+'\n'});
 assert.equal(result.exit,0);assert.equal(result.writes.length,1);assert.equal(result.writes[0],valid);
});
test('changed baseline write failure remains a failure',()=>{
 const old=JSON.parse(valid);old.lines--;
 assert.throws(()=>runGuard({baseline:JSON.stringify(old,null,2)+'\n',denyWrite:true}),/locked baseline write/);
});
test('protected region mismatch blocks commit without overwriting the baseline',()=>{
 const invalid=JSON.parse(valid);invalid.regions.ELC='invalid protected hash';
 const result=runGuard({baseline:JSON.stringify(invalid,null,2)+'\n',denyWrite:true});
 assert.equal(result.exit,1);assert.equal(result.writes.length,0);
});
test('missing baseline is created after validation',()=>{
 const result=runGuard();assert.equal(result.exit,0);assert.equal(result.writes.length,1);assert.equal(result.writes[0],valid);
});
