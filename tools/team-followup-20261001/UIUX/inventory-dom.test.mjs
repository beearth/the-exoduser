import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {sources} from './inventory-dom/source-data.mjs';
import {createDocument} from './inventory-dom/node-dom.mjs';
import {createHost,activate} from './inventory-dom/harness.mjs';
const evidence=[];
for(const [path,data]of Object.entries(sources))for(const language of ['ko','en']) {
  function setup(version) {const document=createDocument();const mount=document.createElement('main');document.body.appendChild(mount);return {document,...createHost(document,mount,data,version,language)};}
  test(`${path}/${language}: 실제 renderInv→Enter→mouseleave 원후보 RED·파생 GREEN`,()=>{
    for(const version of ['baseline','candidate']) {
      const ui=setup(version);ui.render();
      const first=ui.nodes.invGrid.querySelector('.inv-item');first.focus();activate(first);
      assert.equal(first.isConnected,false);
      assert.equal(ui.document.activeElement,ui.nodes.invRight);
      ui.nodes.invGrid.querySelector('.inv-item').onmouseleave();
      evidence.push({path,language,version,oldAnchorConnected:first.isConnected,inlineVisibility:ui.nodes.invRight.style.visibility,focusAtDetail:ui.document.activeElement===ui.nodes.invRight});
      assert.equal(ui.nodes.invRight.style.visibility,version==='baseline'?'hidden':'visible');
    }
  });
  test(`${path}/${language}: 실제 renderInv 행동버튼 제거→현재 카드/삭제→닫기 복귀`,()=>{
    for(const version of ['baseline','candidate']) {
      const ui=setup(version);ui.render();activate(ui.nodes.invGrid.querySelector('.inv-item'));
      const action=ui.nodes.invActionBtns.querySelector('button');assert.ok(action);action.focus();
      ui.render();assert.equal(action.isConnected,false);
      assert.equal(ui.document.activeElement,version==='candidate'?ui.nodes.invGrid.querySelector('.inv-item'):ui.document.body);
      evidence.push({path,language,version,scenario:'행동 버튼 재구성',removedActionConnected:action.isConnected,focus:ui.document.activeElement===ui.document.body?'BODY':'현재 연결 카드'});
      activate(ui.nodes.invGrid.querySelector('.inv-item'));ui.nodes.invActionBtns.querySelector('button').focus();
      ui.env.INV.bag=[];ui.render();assert.equal(ui.document.activeElement,version==='candidate'?ui.nodes.invClose:ui.document.body);
      assert.equal(ui.nodes.invRight.classList.contains('inv-side-compare'),false);
    }
  });
  test(`${path}/${language}: 숨긴 상세 focus 거부·Space/Enter 중복·수정키·Tab`,()=>{
    const ui=setup('candidate');ui.render();const card=ui.nodes.invGrid.querySelector('.inv-item');card.focus();
    assert.equal(activate(card,'Tab').prevented,false);
    activate(card,'Enter',{ctrlKey:true});assert.equal(ui.document.activeElement,card);
    activate(card,'Enter',{repeat:true});assert.equal(ui.document.activeElement,card);
    activate(card,'Space');assert.equal(ui.document.activeElement,ui.nodes.invRight);
    const current=ui.nodes.invGrid.querySelector('.inv-item');ui.nodes.invRight.style.visibility='hidden';current.focus();activate(current,'Tab');assert.equal(ui.document.activeElement,current);
    current.style.visibility='hidden';ui.nodes.invActionBtns.querySelector('button').focus();ui.api._invRenderDetail(99,'bag');assert.equal(ui.document.activeElement,ui.nodes.invClose);
    ui.render();ui.opener.focus();ui.api.focus.begin();ui.nodes.invRight.style.visibility='visible';ui.nodes.invActionBtns.querySelector('button').focus();ui.api.closePanel('invPanel');assert.equal(ui.document.activeElement,ui.opener);
  });
  test(`${path}/${language}: 장착 카드 해제 fixture→실제 renderInv→닫기 복귀`,()=>{
    const ui=setup('candidate');ui.render();activate(ui.nodes.invEqGrid.querySelector('.inv-eq-slot'));
    ui.nodes.invActionBtns.querySelector('button').focus();ui.env.INV.equipped={};ui.render();
    assert.equal(ui.document.activeElement,ui.nodes.invClose);
    assert.equal(ui.nodes.invRight.classList.contains('inv-side-compare'),false);
  });
}
test('원 후보 코드/patch 불변·증거 시각과 payload 분리 대조',()=>{
  const provenance=JSON.parse(fs.readFileSync(new URL('./inventory-dom-provenance.json',import.meta.url)));
  assert.equal(Object.keys(provenance.originalHashes).length>5,true);
  for(const [name,expected]of Object.entries(provenance.originalHashes)){
    if(name==='inventory-focus-reproduction.json')continue;
    assert.equal(createHash('sha256').update(fs.readFileSync(new URL('./'+name,import.meta.url))).digest('hex'),expected,name);
  }
  const original=JSON.parse(fs.readFileSync(new URL('./inventory-focus-reproduction.json',import.meta.url)));
  const redirected=JSON.parse(fs.readFileSync(new URL('./inventory-dom-existing-reproduction.json',import.meta.url)));
  delete original.checkedAt;delete redirected.checkedAt;assert.deepEqual(original,redirected);
  for(const [path,expected]of Object.entries(provenance.sourceHashes))assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../../../'+path,import.meta.url))).digest('hex'),expected,path);
});
test('재렌더 이전 아이템 소멸→실제 hover 종료에서 숨긴 상세 focus 잔류0',()=>{
  for(const data of Object.values(sources)){
    const document=createDocument(),mount=document.createElement('main');document.body.appendChild(mount);
    const ui=createHost(document,mount,data,'candidate');ui.render();activate(ui.nodes.invGrid.querySelector('.inv-item'));
    ui.env.INV.bag=[];ui.api._invClearHover();assert.equal(document.activeElement,ui.nodes.invClose);
  }
});
process.on('exit',()=>fs.writeFileSync(new URL('./inventory-dom-evidence.json',import.meta.url),JSON.stringify({checkedAt:new Date().toISOString(),scope:'Node DOM 연결 대역·실제 소스 함수. 브라우저 미실행',evidence},null,2)+'\n'));
