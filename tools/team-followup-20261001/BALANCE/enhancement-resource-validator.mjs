import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

const root=new URL('../../../',import.meta.url);
const sha=value=>createHash('sha256').update(value).digest('hex');
const evidence={startedAt:new Date().toISOString(),sources:[],rows:[],boundaries:[],limits:'실제 비용/수동 UI 콜백/dbSaveNow/저장 객체식 실행; 메모리 DOM/타이머/저장 fixture. 전체 dbSave 전송/restore/실게임 실행 아님'};
function between(source,start,end){
  const first=source.indexOf(start),last=source.indexOf(end,first+start.length);
  assert(first>=0&&last>first,start);return source.slice(first,last);
}
for(const file of ['game.html','game-easy-test.html']){
  const source=fs.readFileSync(new URL(file,root),'utf8');evidence.sources.push({file,sha256:sha(source)});
  const formulas=between(source,'function enhRate(n)','function enhMul(n)');
  const rarity=source.match(/^function _itemEconomyRarity\(r\).*$/m)[0];
  const section=between(source,'    const _slotEN={','    // ── AI 자동 강화 섹션');
  const debounce=between(source,'function dbSaveNow(){','// ═══ 강제 즉시 저장');
  const automatic=between(source,'function aiEnhance(item','function _doAiEnhance()');
  const automaticClick=between(source,'function _doAiEnhance(){','// Unique items use');
  const saves=[...source.matchAll(/(?:async function dbSave\(\)\{|dbSave=async function\(\)\{)/g)].map((match,index)=>{
    const tail=source.slice(match.index);
    const object=tail.match(/const (?:saveData|sd)=({[\s\S]*?\n\s*});/);
    assert(object,'실제 저장 객체');
    return {index,offset:match.index,expression:object[1],shared:tail.slice(0,object.index).includes('_saveSharedMats(G.mats||0)')};
  });
  assert.equal(saves.length,5);
  function fixture({enh=0,rarityValue=2,mats=0,success=true,slot='weapon',save=saves[0]}={}){
    const item={id:'fixture',name:'fixture',slot,rarity:rarityValue,enh,atk:1,uniqueRoll:{unit:'fraction',storedValue:.15},_enhRefund:7};
    const grid={children:[],appendChild(node){this.children.push(node);}};
    let rng=0,notifications=0,snapshot=null,shared=null,saveCalls=0;const timers=new Map();let nextTimer=0;
    const math=Object.create(Math);math.random=()=>{rng++;return success?0:.999999;};
    const context=vm.createContext({Math:math,INV:{bag:[],equipped:{[slot]:item}},G:{mats},P:{x:0,y:0,skills:{}},grid,
      RARITY_C:[],SLOT_NAMES:[],_forgeSel:null,_earringSlot:()=>false,_slotName:()=>'',_L:value=>value,_T:value=>value,
      enhColor:()=>'',enhRateColor:()=>'',enhMulAtk:()=>0,enhMul:()=>0,
      document:{createElement:()=>({style:{}})},notify(){notifications++;},SFX:{forge(){},hurt(){}},addTxt(){},poolPart(){},renderForge(){},applyStats(){},$:()=>null,
      _dbReady:true,_saveDebounce:null,setTimeout(callback){const timer=++nextTimer;timers.set(timer,callback);return timer;},clearTimeout:timer=>timers.delete(timer),
      _passiveQueueItems:()=>[],STATS:{},PASSIVES:{},_grit:0,QSLOTS:[],BAG_MAX:300,CRYSTAL_BAG:[],CRYSTAL_DUST:0,UPGRADES:{},POT_LV:{},SKILL_SLOTS:[],ULT_SLOT:null,_charIdx:0});
    vm.runInContext(formulas+'\n'+rarity+'\n'+automatic+'\n'+automaticClick+'\n'+debounce,context);
    context.dbSave=()=>{saveCalls++;snapshot=JSON.parse(vm.runInContext('JSON.stringify('+save.expression+')',context));if(save.shared)shared=context.G.mats;};
    vm.runInContext('{'+section+'}',context);
    return {context,item,grid,timers,flush(){for(const callback of timers.values())callback();timers.clear();},results:()=>({rng,notifications,snapshot,shared,saveCalls})};
  }
  for(const save of saves)for(const enh of [0,1,99,100,1000,200000])for(const rarityValue of [0,1,2,3,4,5]){
    const multiplier=[.5,.7,1,1.3,1.8][Math.min(rarityValue,4)];
    const raw=Math.max(20000,Math.ceil((20000+enh*3500)*1.5));
    const cost=Math.ceil(Math.ceil(raw*multiplier)*.5);
    for(const mats of [0,cost-1,cost,cost+1])for(const success of [true,false]){
      const state=fixture({enh,rarityValue,mats,success,save});const original=JSON.stringify(state.item);
      const actual=state.context.enhCost(enh,rarityValue);assert.equal(actual.cost,cost);assert.equal(actual.rate,Math.max(.5,99*.99**enh)/100);
      const button=state.grid.children.find(node=>typeof node.onclick==='function');assert(button);
      button.onclick();state.flush();const result=state.results(),allowed=mats>=cost;
      assert.equal(state.context.G.mats,allowed?mats-cost:mats);
      assert.equal(state.item.enh,enh+(allowed&&success?1:0));
      assert.equal(result.saveCalls,allowed?1:0);assert.equal(result.notifications,allowed?0:1);
      assert.equal(result.rng,allowed?(success?73:37):0);
      if(allowed){
        assert.equal(result.snapshot.inv.equipped.weapon.enh,state.item.enh);
        assert.equal(result.snapshot.game.mats,save.shared?0:mats-cost);
        assert.equal(result.shared,save.shared?mats-cost:null);
        assert.equal(result.snapshot.inv.equipped.weapon._enhRefund,7);
        assert.equal(result.snapshot.inv.equipped.weapon.uniqueRoll.storedValue,.15);
        state.item.enh++;assert.notEqual(result.snapshot.inv.equipped.weapon.enh,state.item.enh);
      }else assert.equal(JSON.stringify(state.item),original);
      evidence.rows.push({file,save:save.index,shared:save.shared,enh,rarity:rarityValue,mats,success,cost,allowed,remaining:state.context.G.mats,saved:result.saveCalls});
    }
  }
  for(const slot of ['weapon','shield','armor','helmet','boots','bow','gloves','pants','belt','necklace','ring1','ring2','cape','bracelet','headband','headband2','ossuary','unknown']){
    const state=fixture({slot,mats:100000});const buttons=state.grid.children.filter(node=>typeof node.onclick==='function');
    const listed=section.includes("['"+slot+"',");
    assert.equal(buttons.length,listed?1:0);evidence.boundaries.push({file,slot,listed,buttons:buttons.length});
  }
  const empty=fixture({slot:'unknown'});empty.context.INV.equipped={};empty.grid.children=[];vm.runInContext('{'+section+'}',empty.context);
  assert.equal(empty.grid.children.filter(node=>node.onclick).length,0);
  assert(section.includes('const isMax=false;'));evidence.boundaries.push({file,max:'상한 없음;200000→200001 실제 성공 검수',missing:'버튼0'});
  for(const success of [true,false])for(const extra of [-1,0,1]){
    const state=fixture({mats:15000+extra,success});const result=state.context.aiEnhance(state.item,1,15000+extra);
    assert.equal(state.context.G.mats,extra<0?14999:extra);assert.equal(result.tries,extra<0?0:1);
    assert.equal(state.item.enh,extra>=0&&success?1:0);assert.equal(state.results().saveCalls,0);
    evidence.boundaries.push({file,automatic:true,success,budget:15000+extra,tries:result.tries,used:result.used,saveCalls:0});
  }
  const absent=fixture();assert.equal(absent.context.aiEnhance(null,1,1).ok,false);
  assert.equal(absent.context.aiEnhance(absent.item,0,1).ok,false);
  assert.equal(absent.context.aiEnhance(absent.item,1,0).ok,false);
  const repriced=fixture({mats:15000});repriced.item.enh=1;repriced.grid.children.find(node=>node.onclick).onclick();
  assert.equal(repriced.context.G.mats,15000);assert.equal(repriced.results().rng,0);
  evidence.boundaries.push({file,repriced:'render 이후 +1 변경시 최신비용 재검사·차감0'});
  for(const success of [true,false]){
    const click=fixture({mats:15000,success});Object.assign(click.context.G,{_aiEnhSlot:'weapon',_aiTarget:1});
    click.context._doAiEnhance();assert.equal(click.context.G.mats,0);assert.equal(click.item.enh,success?1:0);
    assert.equal(click.results().saveCalls,0);assert.equal(click.timers.size,0);
    click.context.dbSave();assert.equal(click.results().snapshot.inv.equipped.weapon.enh,click.item.enh);
    evidence.boundaries.push({file,automaticClick:true,success,directSaveScheduled:false,explicitSnapshotMatches:true});
  }
  assert.equal(sha(fs.readFileSync(new URL(file,root),'utf8')),sha(source));
}
evidence.completedAt=new Date().toISOString();evidence.pass=evidence.rows.length+evidence.boundaries.length;
fs.writeFileSync(new URL('./enhancement-resource-evidence.json',import.meta.url),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({pass:evidence.pass,rows:evidence.rows.length,boundaries:evidence.boundaries.length,sources:evidence.sources,completedAt:evidence.completedAt}));
