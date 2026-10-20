import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {outputSymlink} from './helpers/outputSymlink.mjs';
import {writeResources} from '../godot/tools/export_ch2_area_resources.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const tmp=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),'EXODUSER-qa-007-Isolated-20261020-'));
test.after(()=>fs.rmSync(tmp,{recursive:true,force:true}));
for(const oracle of ['nw01_world_interaction','nw02_player_portal','nw03_map_action']) {
  test(oracle+' UTF-8 file equals full stdout byte for byte and refuses overwrite/changed source',()=>{
    const tool=path.join(root,'tools',oracle+'_oracle.cjs');
    const run=(source,output)=>spawnSync(process.execPath,[tool,source,...(output?[output]:[])],{encoding:'utf8',maxBuffer:16*1024*1024});
    const stdout=run(path.join(root,'game.html'));assert.equal(stdout.status,0,stdout.stderr);
    const output=path.join(tmp,oracle+'.json');const file=run(path.join(root,'game.html'),output);
    assert.equal(file.status,0,file.stderr);assert.equal(file.stdout,'');
    assert.deepEqual(fs.readFileSync(output),Buffer.from(stdout.stdout,'utf8'));
    const data=JSON.parse(fs.readFileSync(output,'utf8'));assert.ok(data.cases.length>0);
    assert.equal(run(path.join(root,'game.html'),output).status,1);
    assert.deepEqual(fs.readFileSync(output),Buffer.from(stdout.stdout,'utf8'));
    const changed=path.join(tmp,oracle+'-changed.html');fs.writeFileSync(changed,fs.readFileSync(path.join(root,'game.html'),'utf8').replace('function dst(', 'function changed_dst('));
    const rejected=path.join(tmp,oracle+'-rejected.json');const refusal=run(changed,rejected);
    assert.equal(refusal.status,1);assert.match(refusal.stderr,/hash differs/);assert.equal(fs.existsSync(rejected),false);
  });
}
test('Windows junction alternative reaches the original ancestor rejection in BOTH exporters before writes',()=>{
  const dir=fs.mkdtempSync(path.join(tmp,'junction-')),target=path.join(dir,'target');fs.mkdirSync(target);
  const destination=path.join(target,'sentinel.json');fs.writeFileSync(destination,'preserve');
  // Force the Windows choice on Mac too. Windows creates a real NTFS junction;
  // Unix creates a directory symlink, both exercise isSymbolicLink on an ancestor.
  const nested=outputSymlink(dir,destination,'win32');
  assert.equal(fs.lstatSync(path.dirname(nested)).isSymbolicLink(),true);
  const r=spawnSync(process.execPath,[path.join(root,'godot/tools/export_ch1_area_source.mjs'),root,nested,'--stage','1','--seed','20261020'],{encoding:'utf8'});
  assert.equal(r.status,1);assert.match(r.stderr,/Symlink output rejected/);
  const manifest=path.join(root,'godot/data/ch2_map_source/si4_resources.json'),before=fs.readFileSync(manifest);
  assert.throws(()=>writeResources(root,nested),/Symlink output rejected/);
  assert.deepEqual(fs.readFileSync(manifest),before);assert.equal(fs.readFileSync(destination,'utf8'),'preserve');
});
