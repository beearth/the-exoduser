import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {sources} from './native-focus/source-data.js';
import {createHost,activate} from './native-focus/harness.js';
import {createDocument} from './inventory-dom/node-dom.mjs';
import {extractFunction} from './inventory-dom-candidate.mjs';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
for(const [path,data]of Object.entries(sources))for(const language of ['ko','en']) {
  function setup(version){const document=createDocument(),mount=document.createElement('main');document.body.appendChild(mount);return {document,...createHost(document,mount,data,version,language)};}
  test(`${path}/${language}: js 연결 실제 렌더·키보드·hover 원식 대조`,()=>{
    for(const version of ['baseline','candidate']) {
      const ui=setup(version);ui.render();assert.ok(ui.panel.querySelector('.pbox').contains(ui.nodes.invRight));
      const card=ui.nodes.invGrid.querySelector('.inv-item');card.focus();
      assert.equal(activate(card,'Tab').prevented,false);
      activate(card,'Enter',{repeat:true});activate(card,'Enter',{ctrlKey:true});assert.equal(ui.document.activeElement,card);
      activate(card,'Space');assert.equal(ui.document.activeElement,ui.nodes.invRight);assert.equal(card.isConnected,false);
      ui.api._invClearHover();assert.equal(ui.nodes.invRight.style.visibility,version==='candidate'?'visible':'hidden');
    }
  });
  test(`${path}/${language}: js 실제 재구성·삭제·닫기 연결`,()=>{
    const ui=setup('candidate');ui.render();activate(ui.nodes.invGrid.querySelector('.inv-item'));
    ui.nodes.invActionBtns.querySelector('button').focus();ui.render();assert.equal(ui.document.activeElement,ui.nodes.invGrid.querySelector('.inv-item'));
    activate(ui.nodes.invGrid.querySelector('.inv-item'));ui.nodes.invActionBtns.querySelector('button').focus();ui.env.INV.bag=[];ui.render();assert.equal(ui.document.activeElement,ui.nodes.invClose);
    ui.opener.focus();ui.api.focus.begin();ui.nodes.invClose.focus();ui.api.closePanel('invPanel');assert.equal(ui.document.activeElement,ui.opener);
  });
}
test('함수별 원문/SHA 동일, whole-file 변화는 기록만',()=>{
  const manifest=JSON.parse(fs.readFileSync(new URL('./native-focus-manifest.json',import.meta.url)));
  const raw=JSON.parse(fs.readFileSync(new URL('./native-focus/current-function-text.json',import.meta.url)));
  for(const [path,comparison]of Object.entries(manifest.comparison)){
    const current=fs.readFileSync(new URL('../../../'+path,import.meta.url),'utf8');
    for(const row of comparison.functions){const text=extractFunction(current,row.name);assert.equal(text,raw[path][row.name]);assert.equal(sha(text),row.oldSha256);}
    assert.equal(comparison.baselineTextEqual,true);assert.equal(comparison.candidateTextEqual,true);
  }
});
test('before 원파일 byte 보존',()=>{
  const manifest=JSON.parse(fs.readFileSync(new URL('./native-focus-manifest.json',import.meta.url)));
  for(const [path,row]of Object.entries(manifest.before)){
    assert.equal(sha(fs.readFileSync(new URL('./'+path,import.meta.url))),row.sha256);
    assert.equal(sha(fs.readFileSync(new URL('./native-focus/before/'+path.replaceAll('/','__'),import.meta.url))),row.sha256);
  }
});
test('browser 전이 import는 로컬 js 3개만, mjs/CDN/Node 없음',()=>{
  const visited=new Set();
  function visit(name){if(visited.has(name))return;visited.add(name);assert.match(name,/\.js$/);const source=fs.readFileSync(new URL('./native-focus/'+name,import.meta.url),'utf8');
    for(const match of source.matchAll(/^import .+ from ['"](.+?)['"]/gm)){assert.match(match[1],/^\.\/[^/]+\.js$/);visit(match[1].slice(2));}}
  visit('controller.js');assert.deepEqual([...visited].sort(),['controller.js','harness.js','source-data.js']);
});
test('실제 CSS 경로·pbox·기본 미연결·inline 액션 capture 차단',()=>{
  const html=fs.readFileSync(new URL('./native-focus/host.html',import.meta.url),'utf8'),controller=fs.readFileSync(new URL('./native-focus/controller.js',import.meta.url),'utf8');
  assert.match(html,/<link id="production-css" rel="stylesheet" disabled>/);
  assert.equal(new URL('../../../../inventory-space.css',new URL('./native-focus/controller.js',import.meta.url)).pathname,new URL('../../../inventory-space.css',import.meta.url).pathname);
  assert.match(controller,/event\.stopImmediatePropagation\(\)/);assert.match(controller,/link\.disabled=true/);
  assert.equal(/https?:\/\/|fetch\(|localStorage|setInterval\(/.test(controller),false);
});
