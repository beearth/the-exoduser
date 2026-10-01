import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {sources} from './card-removal-focus/host/source-data.js';
import {createHost,activate} from './card-removal-focus/host/harness.js';
import {createDocument} from './inventory-dom/node-dom.mjs';
import {extractFunction} from './inventory-dom-candidate.mjs';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const reproduction=[];
function setup(data,version,language,css) {
  const document=createDocument(),mount=document.createElement('main');document.body.appendChild(mount);
  if(css){const original=document.defaultView.getComputedStyle;document.defaultView.getComputedStyle=node=>{const style=original(node);return node.id==='invRight'?{...style,visibility:'visible'}:style;};}
  const ui={document,...createHost(document,mount,data,version,language)};
  ui.opener.onclick();assert.equal(document.activeElement,ui.opener);return ui;
}
for(const [path,data]of Object.entries(sources))for(const language of ['ko','en'])for(const css of [false,true]) {
  test(`${path}/${language}/CSS-${css}: 실제 렌더 카드 소멸 RED→GREEN`,()=>{
    const observed={};
    for(const version of ['baseline','candidate']){
      const ui=setup(data,version,language,css),card=ui.nodes.invGrid.querySelector('.inv-item');
      activate(card,'Enter');assert.equal(ui.document.activeElement,ui.nodes.invRight);
      ui.nodes.invActionBtns.querySelector('button').focus();ui.api._invClearHover();assert.equal(ui.nodes.invRight.style.visibility,'visible');
      ui.render();const current=ui.nodes.invGrid.querySelector('.inv-item');assert.equal(ui.document.activeElement,current);assert.notEqual(current,card);
      ui.env.INV.bag=[];ui.render();observed[version]=ui.document.activeElement===ui.document.body?'BODY':ui.document.activeElement.id;
      assert.equal(observed[version],version==='baseline'?'BODY':'invClose');
      if(version==='candidate'){ui.api.closePanel('invPanel');assert.equal(ui.document.activeElement,ui.opener);ui.opener.onclick();assert.equal(ui.panel.classList.contains('on'),true);}
    }
    reproduction.push({path,language,cssModel:css?'visibility important 최소 대역':'미연결',...observed});
  });
  test(`${path}/${language}/CSS-${css}: Space·Tab계약·직접상세삭제·현재카드 identity`,()=>{
    const ui=setup(data,'candidate',language,css),card=ui.nodes.invGrid.querySelector('.inv-item');card.focus();
    assert.equal(activate(card,'Tab').prevented,false);activate(card,'Enter',{repeat:true});activate(card,'Enter',{altKey:true});assert.equal(ui.document.activeElement,card);
    activate(card,'Space');assert.equal(ui.document.activeElement,ui.nodes.invRight);ui.env.INV.bag=[];ui.render();assert.equal(ui.document.activeElement,ui.nodes.invClose);
    const next={...ui.item,name:language==='ko'?'다음 검':'Next sword'};ui.env.INV.bag=[next];ui.render();const newCard=ui.nodes.invGrid.querySelector('.inv-item');newCard.focus();ui.render();assert.equal(ui.document.activeElement,ui.nodes.invGrid.querySelector('.inv-item'));
    ui.document.activeElement.focus();ui.env.INV.bag=[];ui.render();assert.equal(ui.document.activeElement,ui.nodes.invClose);
    ui.api.closePanel('invPanel');assert.equal(ui.document.activeElement,ui.opener);
  });
}
test('원본 byte·함수 19개 SHA·root 증거 보존',()=>{
  const record=JSON.parse(fs.readFileSync(new URL('./card-removal-focus-provenance.json',import.meta.url)));
  for(const [path,hash]of Object.entries(record.preserved)){
    assert.equal(sha(fs.readFileSync(new URL('../../../'+path,import.meta.url))),hash);
    assert.equal(sha(fs.readFileSync(new URL('./card-removal-focus/host/before/'+path.replaceAll('/','__'),import.meta.url))),hash);
  }
  for(const [path,row]of Object.entries(record.evidence)){const current=fs.readFileSync(new URL('../../../'+path,import.meta.url),'utf8');for(const func of row.functions)assert.equal(sha(extractFunction(current,func.name)),func.sha256);}
});
test('로컬 .js 체인·CSS 경로·초기 닫힘·데이터 액션 차단',()=>{
  const base=new URL('./card-removal-focus/host/',import.meta.url),visited=new Set();
  function visit(name){if(visited.has(name))return;visited.add(name);const text=fs.readFileSync(new URL(name,base),'utf8');for(const match of text.matchAll(/^import .+ from ['"](.+?)['"]/gm)){assert.match(match[1],/^\.\/[^/]+\.js$/);visit(match[1].slice(2));}}
  visit('controller.js');assert.equal(visited.size,3);
  const controller=fs.readFileSync(new URL('controller.js',base),'utf8'),harness=fs.readFileSync(new URL('harness.js',base),'utf8');
  assert.match(controller,/stopImmediatePropagation/);assert.equal(/https?:\/\/|fetch\(|localStorage/.test(controller),false);
  assert.equal(new URL('../../../../../inventory-space.css',new URL('controller.js',base)).pathname,new URL('../../../inventory-space.css',import.meta.url).pathname);
  assert.match(harness,/panel.className='panel'/);assert.match(harness,/opener.focus\(\);api.focus.begin\(\)/);
});
test.after(()=>fs.writeFileSync(new URL('./card-removal-focus-reproduction.json',import.meta.url),JSON.stringify({at:new Date().toISOString(),scope:'Node DOM 대역; 실제 CSS/Tab 이동/native 재검수 아님',reproduction},null,2)+'\n'));
