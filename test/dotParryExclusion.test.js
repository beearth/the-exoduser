import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {parse} from 'acorn';

for(const file of ['game.html','game-easy-test.html']){
  const html=readFileSync(new URL('../'+file,import.meta.url),'utf8');
  const code=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].find(m=>m[1].includes('function hurtP('))[1];
  const node=parse(code,{ecmaVersion:'latest'}).body.find(n=>n.type==='FunctionDeclaration'&&n.id.name==='hurtP');
  function fixture(state){
    let parries=0;
    const ctx=vm.createContext({window:{},_now:0,
      P:{s:state,x:0,y:0,hp:100,mhp:100,shield:0,mshield:0,baseDef:0,skills:{},kb:{x:0,y:0},poise:4,_sbParryT:12},
      G:{},STATS:{dex:0},INV:{equipped:{}},PASSIVES:{},OPT:{hitStop:0,shake:0,parts:0},DR_CAP:.75,
      _harpActive:false,_dashActive:false,_petOnHit(){},_lvB:()=>0,_eqStat:()=>0,_eqAffix:()=>0,_eqImplicit:()=>0,_gritTotal:()=>0,
      SFX:{},_isFused:()=>false,enhMul:()=>0,pDefAdd:()=>0,_isFocusState:()=>true,pGuardAbsorb:()=>.4,pShieldBlock:()=>0,
      _uEq:()=>0,_L:(a,b)=>b,_T:s=>s,_logDmg(){},addTxt(){},addParts(){},_r:x=>x,playSample(){},shake(){},doHitFlash(){},
      doParry(){parries++;},wp:()=>({}),die(){},scrFlash:null,scrFlashA:0});
    for(const name of ['sh','ar','bt','gl','pt','hm','nc','rg1','rg2','cp','blt'])ctx[name]=()=>({});
    vm.runInContext(code.slice(node.start,node.end),ctx);
    return {ctx,parries:()=>parries};
  }
  for(const state of ['idle','sBlock','peaceShield']){
    test(`${file}: ${state} poison/burn ticks cannot parry on empty ground`,()=>{
      for(const burn of [false,true]){
        const f=fixture(state);
        f.ctx.hurtP(10,{dot:true,burn,src:burn?'화상':'중독'});
        assert.equal(f.parries(),0,'ongoing damage must not award a parry');
        assert.ok(f.ctx.P.hp<100,'ongoing damage still applies through existing mitigation');
        assert.equal(f.ctx.P._sbParryT,12,'DOT must not consume the window for a real attack');
        assert.equal(f.ctx.P.poise,4,'DOT must not cause a failed-parry penalty');
      }
    });
    test(`${file}: ${state} direct hit keeps the Q parry`,()=>{
      const f=fixture(state);f.ctx.hurtP(10,{src:'direct attack'});
      assert.equal(f.parries(),1);assert.equal(f.ctx.P.hp,100);assert.equal(f.ctx.P._sbParryT,0);
    });
  }
}
