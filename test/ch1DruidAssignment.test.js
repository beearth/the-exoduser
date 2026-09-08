import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync(new URL('../game.html',import.meta.url),'utf8');
test('1-1 selects the animated dark druid and its complete moveset',()=>{
  const ctx=vm.createContext({});
  vm.runInContext(html.slice(html.indexOf('const _BOSS_MOVESET=[];'),html.indexOf('// ── 2장 벌레굴 (si 4~9)'))+';globalThis.moves=_BOSS_MOVESET;',ctx);
  vm.runInContext(html.slice(html.indexOf('const STAGE1_CODEX_BOSS_SKIN='),html.indexOf('const _codexBossImg='))+';globalThis.skin=_CODEX_BOSS;',ctx);
  vm.runInContext(html.slice(html.indexOf('const HELL_BOSSES=['),html.indexOf('const STG=[];'))+';globalThis.names=HELL_BOSSES;',ctx);
  assert.equal(ctx.names[0][0],'다크드루이드');
  assert.equal(ctx.skin[0].use2D,true);
  assert.equal(ctx.skin[0].anim,true);
  assert.equal(ctx.skin[0].src,ctx.skin[3].src);
  assert.deepEqual([...ctx.moves[0]],[...ctx.moves[3]]);
  assert.equal(ctx.moves[0].has('cageTrap'),false,'druid cannot select bone tomb');
  assert.equal(ctx.skin[0].dw,9.3);
  assert.equal(ctx.skin[0].dh,14.1);
});
test('every boss rejects a forced bone tomb without spawning it',()=>{
  const start=html.indexOf("    case'cageTrap':{");
  const end=html.indexOf("    case'chainLightning':",start);
  for(let stage=0;stage<35;stage++){
    const ctx=vm.createContext({G:{stage,_cageTraps:[]},P:{x:0,y:0},e:{atk:1},addTxt(){},_T:s=>s,SFX:{magic(){}},playSample(){},_r:()=>1});
    vm.runInContext("switch('cageTrap'){"+html.slice(start,end)+'}',ctx);
    assert.equal(ctx.G._cageTraps.length,0);
  }
});
