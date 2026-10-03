import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import crypto from 'node:crypto';
import {validateReleasePackage} from '../tools/release-target.mjs';
const root=process.env.EXODUSER_ARTIFACT_ROOT;
test('actual full Windows artifact matches identity, executable and gameplay source',{skip:!root?'Set EXODUSER_ARTIFACT_ROOT to a generated Windows release':false},()=>{
 const read=f=>fs.readFileSync(root+'/package.nw/'+f,'utf8');
 const proof=JSON.parse(fs.readFileSync(root+'/release-artifact-manifest.json','utf8'));
 assert.equal(validateReleasePackage({config:JSON.parse(read('release-config.json')),package:JSON.parse(read('package.json')),buildTarget:read('build-target.js'),lobby:read('index.html'),game:read('game.html'),exe:fs.existsSync(root+'/EXODUSER.exe')},4749590,4749591),true);
 const executable=fs.readFileSync(root+'/EXODUSER.exe');assert.equal(executable.subarray(0,2).toString(),'MZ');
 const runtime=JSON.parse(fs.readFileSync(root+'/runtime-provenance.json','utf8'));assert.equal(runtime.version,'0.111.2');assert.equal(runtime.flavor,'normal');assert.equal(runtime.platform,'win-x64');
 assert.equal(crypto.createHash('sha256').update(executable).digest('hex'),runtime.files.find(f=>f.path==='nw.exe').sha256);
 for(const file of ['game.html','index.html','maps_data.js','lang_es.js','lang_ptbr.js','build-target.js']){
  const actual=fs.readFileSync(root+'/package.nw/'+file);const record=proof.files.find(f=>f.path==='package.nw/'+file);
  assert.ok(record,file);assert.equal(crypto.createHash('sha256').update(actual).digest('hex'),record.sha256,file);
 }
});
