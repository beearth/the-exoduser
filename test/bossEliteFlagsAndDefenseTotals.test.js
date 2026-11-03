// 보스·정예 판정 필드(e.ib / e.elite)와 플레이어 방어 합계 공용 함수 회귀 테스트 (2026-11-03 디버깅 총괄)
// - 사냥꾼 패시브가 보스·정예에 실제로 적용되는지
// - 사망 피해 기록이 보스를 '몬스터(0)'으로 찍지 않는지
// - 망토·왕관 .def, 유골함 .eDef가 실제 방어에 들어가고 스탯창과 피격이 같은 함수를 쓰는지
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const html=readFileSync(new URL('../game.html',import.meta.url),'utf8');
const fnSrc=name=>{
  const s=html.indexOf('function '+name+'(');
  assert.ok(s>=0,name+' exists');
  let depth=0,i=html.indexOf('{',s);
  for(;i<html.length;i++){const c=html[i];if(c==='{')depth++;else if(c==='}'&&--depth===0)break;}
  return html.slice(s,i+1);
};

test('hunter passive multiplies damage against bosses and elites by their real flags', ()=>{
  const ctx={PASSIVES:{pHunter:3}};
  vm.runInNewContext(fnSrc('_hunterMul')+';this.h=_hunterMul;',ctx);
  assert.equal(ctx.h({ib:true,etype:0}),1.3);
  assert.equal(ctx.h({elite:1,etype:4}),1.3);
  assert.equal(ctx.h({etype:91}),1.3);
  assert.equal(ctx.h({etype:4}),1);
  assert.doesNotMatch(fnSrc('_hunterMul'),/isBoss|isElite/);
});

test('death damage log names the boss and never prints a raw enemy type number', ()=>{
  const run=e=>{
    const ctx={_dmgLog:[],_DMG_LOG_MAX:10,ens:[e],P:{x:0,y:0,hp:10},G:{stage:0,gt:0},
      STG:[{bn:'타락한 드루이드'}],_T:t=>t,_L:(ko)=>ko};
    vm.runInNewContext(fnSrc('_logDmg')+';_logDmg(5,5,"투사체");this.out=_dmgLog[0].src;',ctx);
    return ctx.out;
  };
  assert.equal(run({alive:true,x:10,y:0,ib:true,etype:0}),'투사체 [타락한 드루이드]');
  assert.equal(run({alive:true,x:10,y:0,elite:1,etype:3}),'투사체 [정예 몬스터]');
  assert.equal(run({alive:true,x:10,y:0,etype:7}),'투사체 [몬스터]');
});

test('cape, crown and ossuary defense count, and hit and stat window share one total', ()=>{
  const eq={shield:{def:10,enh:4},armor:{def:20},boots:{def:30},gloves:{def:40},pants:{def:50},
    cape:{def:60,eDef:5,enh:4},helmet:{def:70,eDef:6,enh:100},necklace:{eDef:7},ossuary:{eDef:8}};
  const ctx={INV:{equipped:eq},P:{baseDef:2,_crystalStats:{eDef:3}},pDefAdd:()=>30,enhMul:x=>x*.25,
    _eqAffix:()=>11,_gritTotal:()=>4};
  for(const n of ['sh','ar','cp'])ctx[n]=()=>eq[{sh:'shield',ar:'armor',cp:'cape'}[n]]||{};
  vm.runInNewContext(fnSrc('_playerDefTotals')+';this.t=_playerDefTotals();',ctx);
  // 강화는 shield/armor/cape만: (4+0+4)*.25=2 (helmet 100강은 DEF 강화 대상 아님)
  assert.equal(ctx.t.enh,2);
  assert.equal(ctx.t.pDef,2+30+10+20+30+40+50+60+70+2);
  assert.equal(ctx.t.eDef,5+6+7+8+11+2+3+2);
  const hurtP=fnSrc('hurtP'),stat=fnSrc('renderStatSummary');
  assert.match(hurtP,/=_playerDefTotals\(\)/);
  assert.match(stat,/=_playerDefTotals\(\)/);
});
