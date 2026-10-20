import test from 'node:test';
import assert from 'node:assert/strict';
import {isDeepStrictEqual} from 'node:util';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {isInsideRoot,isMatchingSnapshot,sameRealPath} from '../godot/tools/cli_paths.mjs';
import {writeResources} from '../godot/tools/export_ch2_area_resources.mjs';
import {outputSymlink} from './helpers/outputSymlink.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const tmp=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),'EXODUSER-qa-007b-Isolated-20261020-'));
test.after(()=>fs.rmSync(tmp,{recursive:true,force:true}));
for(const oracle of ['sv_restore_items','sv_restore_player','sv_shared_read','sv_transport_read']) {
  test(oracle+' UTF-8 file equals complete original stdout; overwrite remains forbidden',()=>{
    const tool=path.join(root,'tools',oracle+'_oracle.cjs');
    const run=(output)=>spawnSync(process.execPath,[tool,root,...(output?[output]:[])],{encoding:'utf8',maxBuffer:64*1024*1024});
    const stdout=run();assert.equal(stdout.status,0,stdout.stderr);
    const output=path.join(tmp,oracle+'.json'),written=run(output);
    assert.equal(written.status,0,written.stderr);assert.equal(written.stdout,'');
    const bytes=fs.readFileSync(output);assert.deepEqual(bytes,Buffer.from(stdout.stdout,'utf8'));
    assert.ok(JSON.parse(bytes).provenance.length>0);
    if(oracle==='sv_transport_read') {
      const probe=JSON.parse(bytes),row=probe.jsonCases.find(row=>row.ok&&row.expected?.x==='가😀');
      assert.ok(row);assert.deepEqual(JSON.parse(row.raw),row.expected);
      const wrong=JSON.parse(new TextDecoder('windows-1252').decode(bytes));
      const corrupted=wrong.jsonCases.find(item=>item.raw===row.raw);
      assert.notDeepEqual(JSON.parse(corrupted.raw),corrupted.expected);
      const questionMarks=JSON.parse(bytes.toString('utf8').replace(/[^\x00-\x7f]/g,'?'));
      const questionRow=questionMarks.jsonCases.find(item=>item.raw===row.raw);
      assert.deepEqual(questionRow.expected,{x:'???'});assert.equal(questionRow.raw,row.raw);
      // Match the oracle's JSON wire format, which serializes -0 as 0.
      const mismatches=questionMarks.jsonCases.filter(item=>item.ok&&!isDeepStrictEqual(JSON.parse(JSON.stringify(JSON.parse(item.raw))),item.expected));
      assert.equal(mismatches.length,1);assert.equal(mismatches[0].raw,row.raw);
    }
    assert.equal(run(output).status,1);assert.deepEqual(fs.readFileSync(output),bytes);
  });
}
test('Windows different-drive, case and exact snapshot whitelist preserve containment boundaries',()=>{
  const p=path.win32,r='G:\\Repo';
  for(const value of ['C:\\Temp\\out.json','G:\\Sibling\\out.json','G:\\Repocopy\\out.json','G:\\'])assert.equal(isInsideRoot(r,value,p),false,value);
  for(const value of [r,'g:\\repo\\godot\\data\\map.json','G:\\Repo\\..cache\\x.json'])assert.equal(isInsideRoot(r,value,p),true,value);
  assert.equal(isMatchingSnapshot(r,'g:\\repo\\godot\\data\\ch1_map_source\\si1.json',1,'1',p),true);
  assert.equal(isMatchingSnapshot(r,'G:\\Repo\\godot\\data\\ch1_map_source\\si0.json',1,'1',p),false);
  assert.equal(sameRealPath('g:\\REPO\\tool.mjs','G:\\repo\\tool.mjs',p,x=>x),true);
  assert.equal(sameRealPath('g:\\REPO\\tool.mjs','G:\\repo\\other.mjs',p,x=>x),false);
});
test('CLI entered through a real directory alias rejects invalid stage/seed/protected source before writes',()=>{
  const alias=path.join(tmp,'source-alias');fs.symlinkSync(root,alias,process.platform==='win32'?'junction':'dir');
  const tool=path.join(alias,'godot/tools/export_ch1_area_source.mjs');
  const external=path.join(tmp,'no-write.json');
  const run=(output,stage='1',seed='20261020')=>spawnSync(process.execPath,[tool,root,output,'--stage',stage,'--seed',seed],{encoding:'utf8'});
  for(const stage of ['2','3','-1']){const p=run(external,stage);assert.equal(p.status,1,p.stderr);assert.match(p.stderr,/UNSUPPORTED_STAGE/);assert.equal(fs.existsSync(external),false);}
  for(const seed of ['-1','NaN','4294967296']){const p=run(external,'1',seed);assert.equal(p.status,1,p.stderr);assert.equal(fs.existsSync(external),false);}
  for(const name of ['game.html','godot/data/map.json','godot/data/ch1_map_source/si0.json']){
    const output=path.join(root,name),before=fs.readFileSync(output),p=run(output);
    assert.equal(p.status,1,p.stderr);assert.match(p.stderr,/Output inside source root/);assert.deepEqual(fs.readFileSync(output),before);
  }
});
test('Windows junction to an external mirror of a protected source reaches BOTH original symlink guards',()=>{
  const directory=fs.mkdtempSync(path.join(tmp,'mirror-')),source=path.join(root,'godot/data/map.json'),before=fs.readFileSync(source);
  const linked=outputSymlink(directory,source,'win32'),mirror=fs.realpathSync(linked);
  assert.equal(fs.lstatSync(path.dirname(linked)).isSymbolicLink(),true);
  assert.equal(isInsideRoot(root,mirror),false);assert.equal(isInsideRoot(directory,mirror),true);
  assert.deepEqual(fs.readFileSync(mirror),before);
  const p=spawnSync(process.execPath,[path.join(root,'godot/tools/export_ch1_area_source.mjs'),root,linked,'--stage','0','--seed','20261020'],{encoding:'utf8'});
  assert.equal(p.status,1,p.stderr);assert.match(p.stderr,/Symlink output rejected/);
  const manifest=path.join(root,'godot/data/ch2_map_source/si4_resources.json'),manifestBefore=fs.readFileSync(manifest);
  assert.throws(()=>writeResources(root,linked),/Symlink output rejected/);
  assert.deepEqual(fs.readFileSync(manifest),manifestBefore);assert.deepEqual(fs.readFileSync(source),before);assert.deepEqual(fs.readFileSync(mirror),before);
});
