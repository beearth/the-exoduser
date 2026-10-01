import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {extractFunction} from '../UIUX/inventory-dom-candidate.mjs';
import {fixFactory,connectRemoval} from '../UIUX/card-removal-focus-candidate.mjs';
import {sources as historical} from '../UIUX/card-removal-focus/host/source-data.js';
import {createHost,activate} from '../UIUX/card-removal-focus/host/harness.js';
import {createDocument} from '../UIUX/inventory-dom/node-dom.mjs';
const root=new URL('../../../',import.meta.url),owned=new URL('../UIUX/',import.meta.url),fixtures=new URL('production-integration-fixtures/',owned);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const before=JSON.parse(fs.readFileSync(new URL('production-integration-before.json',owned)));
const evidence=[];
function dataFor(path){const source=fs.readFileSync(new URL(path,root),'utf8'),start=source.indexOf('const _inventoryFocus=('),end=source.indexOf(')({document,get:$,label:_L});',start);assert.ok(start>=0&&end>start);return {source,factory:{baseline:historical[path].factory.baseline,candidate:source.slice(start+'const _inventoryFocus=('.length,end)},functions:{baseline:historical[path].functions.baseline,candidate:before.sources[path].functionEvidence.map(row=>extractFunction(source,row.name)).join('\n')}};}
function setup(data,version,language,css){
  const document=createDocument(),mount=document.createElement('main');document.body.appendChild(mount);document.querySelectorAll=selector=>document.body.querySelectorAll(selector);
  if(css){const original=document.defaultView.getComputedStyle;document.defaultView.getComputedStyle=node=>{const result=original(node);return node.id==='invRight'?{...result,visibility:'visible'}:result;};}
  const ui={document,...createHost(document,mount,data,version,language)};
  for(const id of ['settings','forge','statPanel','skillPanel']){const node=document.createElement('section');node.id=id;ui.nodes[id]=node;mount.appendChild(node);}
  Object.assign(ui.env,{_inventoryFocus:ui.api.focus,renderInv:ui.api.renderInv,_skPopOwnsPause:false,_fuseSelId:null,_skExpandedId:null});
  const controls=new Function('env',`with(env){${['openPanel','togglePanel','closePanel','closeAllPanels'].map(name=>extractFunction(data.source,name)).join('\n')}return {openPanel,togglePanel,closePanel,closeAllPanels};}`)(ui.env);
  ui.opener.focus();controls.openPanel('invPanel');return {...ui,controls};
}
for(const path of ['game.html','game-easy-test.html']){
  const data=dataFor(path);
  test(`${path}: 승인 인벤토리 함수·factory 일치 / 재적용 거부`,()=>{const actual=fs.readFileSync(new URL(path,root)),original=fs.readFileSync(new URL(path,fixtures),'utf8');const approved=connectRemoval(original);for(const row of before.sources[path].functionEvidence)assert.equal(extractFunction(actual.toString(),row.name),extractFunction(approved,row.name),row.name);assert.equal(data.factory.candidate,fixFactory());assert.throws(()=>connectRemoval(data.source));});
  test(`${path}: 모든 inline script 구문`,()=>{
    const counts={classic:0,module:0,importmap:0};
    for(const match of data.source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){
      if(/\bsrc\s*=/.test(match[1]))continue;
      if(/type\s*=\s*["']importmap/.test(match[1])){JSON.parse(match[2]);counts.importmap++;}
      else if(/type\s*=\s*["']module/.test(match[1])){const result=spawnSync(process.execPath,['--input-type=module','--check'],{input:match[2],encoding:'utf8'});assert.equal(result.status,0,result.stderr);counts.module++;}
      else{new vm.Script(match[2],{filename:path+':inline:'+counts.classic});counts.classic++;}
    }
    assert.deepEqual(counts,{classic:4,module:2,importmap:1});evidence.push({path,inlineScriptCounts:counts});
  });
  for(const language of ['ko','en'])for(const css of [false,true]){
    test(`${path}/${language}/${css}: 생산 추출 카드삭제 RED→GREEN·hover·재렌더·실제 opener 닫기`,()=>{
      for(const version of ['baseline','candidate']){
        const ui=setup(data,version,language,css);const card=ui.nodes.invGrid.querySelector('.inv-item');activate(card,css?'Space':'Enter');assert.equal(ui.document.activeElement,ui.nodes.invRight);
        ui.nodes.invActionBtns.querySelector('button').focus();ui.api._invClearHover();assert.equal(ui.nodes.invRight.style.visibility,'visible');ui.render();assert.equal(ui.document.activeElement,ui.nodes.invGrid.querySelector('.inv-item'));
        ui.env.INV.bag=[];ui.render();assert.equal(ui.document.activeElement,version==='candidate'?ui.nodes.invClose:ui.document.body);
        evidence.push({path,language,cssModel:css,version,removedFocus:ui.document.activeElement.id||ui.document.activeElement.tagName});
        if(version==='candidate'){ui.controls.closePanel('invPanel');assert.equal(ui.document.activeElement,ui.opener);ui.controls.togglePanel('invPanel');assert.equal(ui.panel.classList.contains('on'),true);ui.nodes.invClose.focus();ui.controls.togglePanel('invPanel');assert.equal(ui.document.activeElement,ui.opener);}
      }
    });
    test(`${path}/${language}/${css}: 빈 bag/eq/st·Space/Tab·수정키/반복·소멸 eq·쓰기0`,()=>{
      const ui=setup(data,'candidate',language,css);const card=ui.nodes.invGrid.querySelector('.inv-item');card.focus();assert.equal(activate(card,'Tab').prevented,false);activate(card,'Enter',{repeat:true});activate(card,'Enter',{metaKey:true});assert.equal(ui.document.activeElement,card);
      const old=JSON.stringify(ui.env.INV);activate(card,'Space');assert.equal(ui.document.activeElement,ui.nodes.invRight);assert.deepEqual(ui.env.INV.bag,[ui.item]);assert.equal(JSON.parse(old).bag[0].name,ui.item.name);
      for(const source of ['bag','eq','st']){ui.nodes.invActionBtns.querySelector('button')?.focus();ui.api._invRenderDetail('not-present',source);assert.equal(ui.nodes.invRight._detailItem,null);assert.equal(ui.nodes.invActionBtns.children.length,0);}
      ui.render();activate(ui.nodes.invEqGrid.querySelector('.inv-eq-slot'));ui.nodes.invActionBtns.querySelector('button').focus();ui.env.INV.equipped={};ui.render();assert.equal(ui.document.activeElement,ui.nodes.invClose);
      ui.controls.closeAllPanels();assert.equal(ui.document.activeElement,ui.opener);
    });
  }
  test(`${path}: keydown 예외·장비 함수 및 승인 fixture 보존`,()=>{
    const original=fs.readFileSync(new URL(path,fixtures),'utf8');assert.match(data.source,/#invPanel.on \[data-inventory-detail-trigger\]/);
    const factoryStart=data.source.indexOf('const _inventoryFocus=(');assert.ok(factoryStart>0);
    for(const name of ['equipItem','unequipItem','salvageVal'])assert.equal(extractFunction(data.source,name),extractFunction(original,name));
    assert.equal(sha(fs.readFileSync(new URL(path+'.expected',fixtures))),sha(connectRemoval(original)));
  });
}
test('승인 전 원본 fixture·CSS·원화·native 증거 보존',()=>{for(const [path,row] of Object.entries(before.sources))assert.equal(sha(fs.readFileSync(new URL(path,fixtures))),row.beforeSha256);for(const path of ['inventory-space.css','img/ui/ossuary_socket_hf_v2.png','outputs/team-review-20261002/mac-app/uiux-native-matrix.json'])assert.equal(sha(fs.readFileSync(new URL(path,root))),before.preserved[path],path);});
test.after(()=>fs.writeFileSync(new URL('../../../outputs/team-review-20261002/production-integration/uiux-scoped-evidence.json',import.meta.url),JSON.stringify({at:new Date().toISOString(),scope:'생산 실제 함수 추출·Node DOM/CSS 최소 모델; 실게임/실화면/패드 아님',evidence},null,2)+'\n'));
