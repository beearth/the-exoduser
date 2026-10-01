import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {createHarness} from './ossuary-production-acceptance-harness.mjs';
import {extractFunction} from './inventory-dom-candidate.mjs';
import {sourceFactory} from './filter-focus-candidate.mjs';
import {connectOssuary} from './ossuary-focus-candidate.mjs';
const owned=new URL('./',import.meta.url),root=new URL('../../../',import.meta.url),sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const rootEvidencePath='outputs/team-review-20261002/four-candidate-acceptance/ui-production-acceptance.json',filterEvidencePath='outputs/team-review-20261002/four-candidate-acceptance/filter-production-result.json';
const rootEvidence=JSON.parse(fs.readFileSync(new URL(rootEvidencePath,root))),filterEvidence=JSON.parse(fs.readFileSync(new URL(filterEvidencePath,root)));
const manifest={readUTC:new Date().toISOString(),sources:{},evidence:{},preserved:{}},results=[];
for(const path of [rootEvidencePath,filterEvidencePath,'ui-panels.js','inventory-space.css','docs/2_7 인벤토리+장비시스템/INVENTORY_KEYBOARD_FOCUS_20261002.md'])manifest.evidence[path]=sha(fs.readFileSync(new URL(path,root)));
function preserve(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(entry.name.startsWith('ossuary-production-acceptance'))continue;const url=new URL(entry.name+(entry.isDirectory()?'/':''),dir);if(entry.isDirectory())preserve(url);else manifest.preserved[fileURLToPath(url).slice(fileURLToPath(root).length)]=sha(fs.readFileSync(url));}}
preserve(owned);
for(const [path,tag]of [['game.html','main'],['game-easy-test.html','easy']]){
  const current=fs.readFileSync(new URL(path,root),'utf8'),previous=fs.readFileSync(new URL('ossuary-focus-'+tag+'.before.html',owned),'utf8'),expected=connectOssuary(previous);
  const names=['renderOssPanel','renderInv','_invClearHover','closePanel','registerBonePart','withdrawBonePart','mkBonePart','_boneRegister','equipItem','unequipItem'];
  const saves=['dbSaveNow','_drainPendingSaveNow','dbSaveForce','_saveSharedMats','saveSettings'];
  const rows=[...names,...saves].map(name=>({name,line1:current.slice(0,current.indexOf('function '+name+'(')).split('\n').length,currentSha256:sha(extractFunction(current,name)),beforeSha256:sha(extractFunction(previous,name)),candidateSha256:sha(extractFunction(expected,name))}));
  manifest.sources[path]={wholeSha256:sha(current),beforeSha256:sha(previous),candidateSha256:sha(expected),factorySha256:sha(sourceFactory(current)),functions:rows};
  test(`${path}: actual factory/renderOssPanel·변경 구역·저장 SHA 대조`,()=>{
    assert.equal(current,expected);assert.equal(sourceFactory(current),sourceFactory(expected));assert.equal(extractFunction(current,'renderOssPanel'),extractFunction(expected,'renderOssPanel'));
    assert.equal(sha(current),rootEvidence.sources[path].actual);assert.equal(sha(current),filterEvidence.sources[path].current);
    for(const row of rows){assert.equal(row.currentSha256,row.candidateSha256);if(row.name!=='renderOssPanel')assert.equal(row.currentSha256,row.beforeSha256);}
    assert.throws(()=>connectOssuary(current));
  });
  for(const language of ['ko','en']){
    test(`${path}/${language}: current real render disabled이전활성→닫기 복귀`,()=>{
      for(const blur of [false,true])for(const action of ['oss-withdraw','oss-unequip']){
        const ui=createHarness(current,language,blur);ui.nodes.invOssuaryPanel.dataset.selectedPart='skull';ui.api.renderOssPanel();const button=ui.nodes.invOssuaryPanel.querySelector('.'+action);button.focus();
        if(action==='oss-withdraw'){delete ui.env.INV.ossCollect.iron_warlord_skull;ui.nodes.invOssuaryPanel.dataset.selectedPart='';}else ui.env.INV.equipped.ossuary=null;
        ui.api.renderOssPanel();assert.equal(button.disabled,true);assert.equal(ui.document.activeElement,ui.nodes.invClose);
        ui.api.closePanel('invPanel');assert.equal(ui.document.activeElement,ui.opener);results.push({path,language,blur,action,focus:'invClose→opener'});
      }
    });
    test(`${path}/${language}: 숨긴닫기·외부/다른활성·닫힌패널 강탈0`,()=>{
      const ui=createHarness(current,language);ui.nodes.invOssuaryPanel.dataset.selectedPart='skull';ui.api.renderOssPanel();const button=ui.nodes.invOssuaryPanel.querySelector('.oss-withdraw');button.focus();ui.nodes.invClose.style.visibility='hidden';delete ui.env.INV.ossCollect.iron_warlord_skull;ui.api.renderOssPanel();assert.equal(ui.document.activeElement,ui.document.body);
      ui.opener.focus();ui.api.renderOssPanel();assert.equal(ui.document.activeElement,ui.opener);
      const urn=ui.document.getElementById('invOssUrn');urn.focus();ui.controller.releaseOssuaryAction(button,button);assert.equal(ui.document.activeElement,urn);
      ui.nodes.invPanel.classList.remove('on');ui.document.activeElement=button;ui.controller.releaseOssuaryAction(button,button);assert.equal(ui.document.activeElement,button);
    });
    test(`${path}/${language}: current mkF block·filter identity 유지`,()=>{
      const ui=createHarness(current,language);ui.filterRender();const old=ui.nodes.invFilters.querySelector('button');old.focus();old.onclick();const active=ui.document.activeElement;
      assert.equal(old.isConnected,false);assert.equal(active.dataset.inventoryFilterKey,'slot');assert.equal(active.dataset.inventoryFilterValue,'weapon');assert.equal(active.attrs['aria-pressed'],'true');active.onclick();assert.equal(ui.document.activeElement.attrs['aria-pressed'],'false');
      assert.equal(ui.env.invFilter.slot,null);assert.match(ui.filterBlock,/b.onclick=\(\)=>\{invFilter\[key\]=act\?null:val;renderInv\(\)\}/);
    });
  }
}
const readManifest=new URL('ossuary-production-acceptance-read.json',owned);
if(fs.existsSync(readManifest)){
  const old=JSON.parse(fs.readFileSync(readManifest));assert.deepEqual(old.sources,manifest.sources);assert.deepEqual(old.evidence,manifest.evidence);assert.deepEqual(old.preserved,manifest.preserved);
}else fs.writeFileSync(readManifest,JSON.stringify(manifest,null,2)+'\n');
test('생산·root 원자료·이전 제출 byte 보존',()=>{
  for(const [path,hash]of Object.entries({...manifest.evidence,...manifest.preserved}))assert.equal(sha(fs.readFileSync(new URL(path,root))),hash,path);
  for(const [path,row]of Object.entries(manifest.sources))assert.equal(sha(fs.readFileSync(new URL(path,root))),row.wholeSha256,path);
});
test.after(()=>fs.writeFileSync(new URL('ossuary-production-acceptance-evidence.json',owned),JSON.stringify({at:new Date().toISOString(),scope:'현재 factory/renderOssPanel 원문·Node retain/blur; current mkF block 경계만, native/전체 renderInv/저장 미실행',results},null,2)+'\n'));
