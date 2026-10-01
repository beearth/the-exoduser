import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {setup,activate} from './filter-focus-fixture.mjs';
import {connectFilter,sourceFactory} from './filter-focus-candidate.mjs';
import {extractFunction} from './inventory-dom-candidate.mjs';
const owned=new URL('./',import.meta.url),root=new URL('../../../',import.meta.url),evidence=[];
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const cards=ui=>ui.nodes.invGrid.querySelectorAll('.inv-item');
const payload=ui=>JSON.stringify({bag:ui.env.INV.bag,equipped:ui.env.INV.equipped,mats:ui.env.G.mats});
for(const path of ['game.html','game-easy-test.html'])for(const language of ['ko','en'])for(const css of [false,true]){
  test(`${path}/${language}/CSS-${css}: 실제 필터 onclick→render 소멸 RED→GREEN`,()=>{
    for(const [key,value,expectedCount]of [['slot','bonePart',0],['rarity',1,1],['rarity',4,0],['el',1,0]])for(const version of ['baseline','candidate']){
      const ui=setup(path,version,language,css),before=payload(ui);activate(cards(ui)[0],css?'Space':'Enter');const old=ui.clickFilter(key,value);
      assert.equal(old.isConnected,false);assert.equal(cards(ui).length,expectedCount);assert.equal(payload(ui),before);
      if(version==='baseline')assert.equal(ui.document.activeElement,ui.document.body);
      else{const target=ui.document.activeElement;assert.equal(target.tagName,'BUTTON');assert.equal(target.dataset.inventoryFilterKey,key);assert.equal(target.dataset.inventoryFilterValue,String(value));assert.equal(target.attrs['aria-pressed'],'true');assert.ok(ui.nodes.invFilters.contains(target));}
      evidence.push({path,language,cssModel:css,version,key,value,cardCount:cards(ui).length,oldConnected:old.isConnected,focus:ui.document.activeElement===ui.document.body?'BODY':'현재 필터'});
      if(version==='candidate'){ui.document.activeElement.click();assert.equal(ui.document.activeElement.attrs['aria-pressed'],'false');assert.equal(cards(ui).length,2);assert.equal(payload(ui),before);}
    }
  });
  test(`${path}/${language}/CSS-${css}: 실제 유골함 탭 Arrow/복귀·필터초기화·키보드 상세`,()=>{
    for(const version of ['baseline','candidate']){
      const ui=setup(path,version,language,css),before=payload(ui);ui.clickFilter('rarity',1);
      const equipment=ui.document.getElementById('inventory-tab-equipment');equipment.focus();
      for(const handler of equipment.listeners.keydown)handler({key:'ArrowRight',preventDefault(){},stopPropagation(){}});
      const ossuary=ui.document.getElementById('inventory-tab-ossuary');assert.equal(ui.document.activeElement,ossuary);assert.equal(ui.panel.dataset.inventoryPage,'ossuary');assert.equal(ui.nodes.invOssuaryPanel.attrs['aria-hidden'],'false');assert.equal(ui.env.INV.selected,null);assert.equal(ui.env.invFilter.rarity,null);assert.equal(cards(ui).length,1);assert.equal(ui.nodes.invRight.parentElement,ui.nodes.invOssInfo);
      for(const handler of ossuary.listeners.keydown)handler({key:'ArrowLeft',preventDefault(){},stopPropagation(){}});
      assert.equal(ui.document.activeElement,equipment);assert.equal(ui.panel.dataset.inventoryPage,'equipment');assert.equal(ui.nodes.invOssuaryPanel.attrs['aria-hidden'],'true');assert.equal(cards(ui).length,2);assert.equal(payload(ui),before);
      const current=cards(ui)[0];assert.equal(activate(current,'Tab').prevented,false);activate(current,'Enter',{repeat:true});activate(current,'Enter',{ctrlKey:true});assert.equal(ui.document.activeElement,equipment);
      activate(current,'Space');assert.equal(ui.document.activeElement,ui.nodes.invRight);ui.api._invClearHover();assert.equal(ui.nodes.invRight.style.visibility,'visible');ui.nodes.invActionBtns.querySelector('button').focus();ui.render();assert.equal(ui.document.activeElement,cards(ui)[0]);
      ui.api.closePanel('invPanel');assert.equal(ui.document.activeElement,ui.opener);
      evidence.push({path,language,cssModel:css,version,branch:'actual composition ArrowRight ossuary / ArrowLeft equipment',verdict:'Node 경로 통과; 전대/유골 장착 UI 미검수'});
    }
  });
  test(`${path}/${language}/CSS-${css}: 비활성 필터 호출은 외부초점 강탈0`,()=>{
    const ui=setup(path,'candidate',language,css);ui.opener.focus();const button=ui.nodes.invFilters.querySelectorAll('button')[1];button.click();assert.equal(ui.document.activeElement,ui.opener);assert.equal(cards(ui).length,0);
  });
}
test('숨긴 재생성 필터는 focus하지 않고 invClose 복귀',()=>{
  for(const path of ['game.html','game-easy-test.html']){
    const ui=setup(path,'candidate'),old=ui.nodes.invFilters.querySelectorAll('button')[1],computed=ui.document.defaultView.getComputedStyle;
    ui.document.defaultView.getComputedStyle=node=>node!==old&&node.dataset.inventoryFilterValue==='bonePart'?{...computed(node),visibility:'hidden'}:computed(node);
    old.focus();old.click();assert.equal(ui.document.activeElement,ui.nodes.invClose);
  }
});
test('새 패치 재적용 거부·factory 구문·원 자료/생산 byte 보존',()=>{
  const before=JSON.parse(fs.readFileSync(new URL('filter-focus-before.json',owned)));
  for(const [path,row]of Object.entries(before.sources)){
    const source=fs.readFileSync(new URL('filter-focus-'+row.tag+'.before.html',owned),'utf8');assert.equal(sha(source),row.beforeSha256);assert.equal(sha(fs.readFileSync(new URL(path,root))),row.beforeSha256);
    for(const func of row.functions)assert.equal(sha(extractFunction(source,func.name)),func.sha256);
    const candidate=connectFilter(source);assert.equal(sha(candidate),row.candidateSha256);assert.throws(()=>connectFilter(candidate));assert.equal(typeof new Function('return ('+sourceFactory(candidate)+')')(),'function');
  }
  for(const [path,expected]of Object.entries(before.preserved))assert.equal(sha(fs.readFileSync(new URL(path,root))),expected,path);
});
test.after(()=>fs.writeFileSync(new URL('filter-focus-reproduction.json',owned),JSON.stringify({at:new Date().toISOString(),scope:'원 생산 소스 추출·실제 onclick/filter 조건/tab composition+Node DOM; native/CSS/패드 미검수',evidence},null,2)+'\n'));
