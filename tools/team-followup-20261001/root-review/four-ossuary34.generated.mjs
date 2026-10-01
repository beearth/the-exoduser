import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {setup,activate} from './four-ossuary-fixture.generated.mjs';
import {connectOssuary} from '../UIUX/ossuary-focus-candidate.mjs';
import {extractFunction} from '../UIUX/inventory-dom-candidate.mjs';
const owned=new URL('../UIUX/',import.meta.url),root=new URL('../../../',import.meta.url),evidence=[];
const before=JSON.parse(fs.readFileSync(new URL('ossuary-focus-before.json',owned)));
const nodeFor=(ui,cls)=>ui.nodes.invOssuaryPanel.querySelector('.'+cls);
const payload=ui=>JSON.stringify({bag:ui.env.INV.bag,equipped:ui.env.INV.equipped,collect:ui.env.INV.ossCollect,mats:ui.env.G.mats});
for(const path of ['game.html','game-easy-test.html'])for(const language of ['ko','en'])for(const disableBlur of [false,true]){
  test(`${path}/${language}/disableBlur-${disableBlur}: 실제 수집해제/유골함해제 RED→GREEN`,()=>{
    for(const version of ['baseline','candidate']){
      const ui=setup(path,language,version==='candidate'?connectOssuary:undefined,disableBlur);ui.switchTab('ossuary');ui.selectPart('skull');
      const take=nodeFor(ui,'oss-withdraw');take.focus();take.click();assert.equal(take.disabled,true);assert.equal(ui.env.INV.ossCollect.iron_warlord_skull,undefined);assert.equal(ui.env.INV.bag.filter(item=>item.slot==='bonePart').length,1);assert.equal(ui.calls.save,1);
      assert.equal(ui.document.activeElement,version==='candidate'?ui.nodes.invClose:disableBlur?ui.document.body:take);
      evidence.push({path,language,disableBlur,version,branch:'withdrawBonePart→renderInv→real renderOssPanel',focus:ui.document.activeElement.id||ui.document.activeElement.className||'BODY',disabled:take.disabled});
      const remove=nodeFor(ui,'oss-unequip');remove.focus();remove.click();assert.equal(remove.disabled,true);assert.equal(ui.env.INV.equipped.ossuary,null);assert.equal(ui.env.INV.bag.filter(item=>item.slot==='ossuary').length,1);assert.equal(ui.calls.save,2);
      assert.equal(ui.document.activeElement,version==='candidate'?ui.nodes.invClose:disableBlur?ui.document.body:remove);
      evidence.push({path,language,disableBlur,version,branch:'real unequipItem→renderInv→real renderOssPanel',focus:ui.document.activeElement.id||ui.document.activeElement.className||'BODY',disabled:remove.disabled});
      if(version==='candidate'){ui.api.closePanel('invPanel');assert.equal(ui.document.activeElement,ui.opener);}
    }
  });
  test(`${path}/${language}/disableBlur-${disableBlur}: 실제 제단 유지·선택소멸·탭/닫기`,()=>{
    const ui=setup(path,language,connectOssuary,disableBlur);ui.switchTab('ossuary');const bone=ui.selectPart('skull'),urn=ui.document.getElementById('invOssUrn');assert.equal(bone.tagName,'BUTTON');assert.equal(urn.tagName,'BUTTON');assert.equal(bone.attrs['aria-pressed'],'true');assert.match(bone.attrs['aria-label'],language==='ko'?/두개골/:/Skull/);
    ui.render();assert.equal(nodeFor(ui,'oss-bone-node'),bone);assert.equal(ui.document.getElementById('invOssUrn'),urn);assert.equal(ui.document.activeElement,bone);
    urn.focus();urn.click();assert.equal(ui.env.INV.selected,'eq:ossuary');assert.equal(ui.document.activeElement,urn);
    const take=nodeFor(ui,'oss-withdraw');take.focus();delete ui.env.INV.ossCollect.iron_warlord_skull;ui.render();assert.equal(ui.document.activeElement,ui.nodes.invClose);
    const tab=ui.switchTab('equipment');assert.equal(ui.document.activeElement,tab);assert.equal(ui.nodes.invOssuaryPanel.attrs['aria-hidden'],'true');ui.switchTab('ossuary');assert.equal(ui.nodes.invOssuaryPanel.attrs['aria-hidden'],'false');ui.document.getElementById('invOssUrn').focus();ui.api.closePanel('invPanel');assert.equal(ui.document.activeElement,ui.opener);
  });
  test(`${path}/${language}/disableBlur-${disableBlur}: 용량/배치 실패는 등록·유효초점 보존`,()=>{
    for(const mode of ['capacity','placement']){
      const ui=setup(path,language,connectOssuary,disableBlur);ui.switchTab('ossuary');ui.selectPart('skull');const old=payload(ui);if(mode==='capacity')ui.env.BAG_MAX=ui.env.INV.bag.length;else ui.env._invFindSpace=()=>null;
      const take=nodeFor(ui,'oss-withdraw');take.focus();take.click();assert.equal(payload(ui),old);assert.equal(ui.document.activeElement,take);assert.equal(take.disabled,false);assert.equal(ui.calls.save,0);
      ui.env._invFindSpace=()=>null;const remove=nodeFor(ui,'oss-unequip');remove.focus();remove.click();assert.equal(payload(ui),old);assert.equal(ui.document.activeElement,remove);assert.equal(remove.disabled,false);assert.equal(ui.calls.save,0);
    }
  });
  test(`${path}/${language}/disableBlur-${disableBlur}: 실제 등록/하위거부·외부초점강탈0`,()=>{
    const ui=setup(path,language,connectOssuary,disableBlur);ui.switchTab('ossuary');const item=ui.boneItem();ui.env.INV.bag.push(item);ui.render();activate(ui.nodes.invGrid.querySelector('.inv-item'),'Space');assert.equal(ui.document.activeElement,ui.nodes.invRight);ui.api.equipItem(item);assert.equal(ui.env.INV.bag.includes(item),false);assert.deepEqual(ui.env.INV.ossCollect.iron_warlord_skull,{r:3,t:2});assert.equal(ui.env.INV.selected,null);assert.equal(ui.calls.save,1);assert.equal(ui.document.activeElement,ui.nodes.invClose);
    const lesser=ui.boneItem('skull',1,0);ui.env.INV.bag.push(lesser);ui.api.equipItem(lesser);assert.equal(ui.env.INV.bag.includes(lesser),true);assert.equal(ui.calls.save,1);
    ui.opener.focus();delete ui.env.INV.ossCollect.iron_warlord_skull;ui.render();assert.equal(ui.document.activeElement,ui.opener);
  });
}
test('숨긴 닫기 버튼에 focus0·내부 disabled 잔류 제거',()=>{for(const path of ['game.html','game-easy-test.html']){const ui=setup(path,'ko',connectOssuary);ui.switchTab('ossuary');ui.selectPart('skull');const take=nodeFor(ui,'oss-withdraw');take.focus();ui.nodes.invClose.style.visibility='hidden';take.click();assert.equal(ui.document.activeElement,ui.document.body);}});
test('root exact candidate and owned bytes',()=>{const manifest=JSON.parse(fs.readFileSync('outputs/team-review-20261002/four-candidate-acceptance/owner-preservation.json'));for(const [file,hash]of Object.entries(manifest))assert.equal(createHash('sha256').update(fs.readFileSync(file)).digest('hex'),hash,file);});
test.after(()=>fs.writeFileSync('outputs/team-review-20261002/four-candidate-acceptance/ossuary-production-reproduction.json',JSON.stringify({evidence},null,2)+'\n'));
