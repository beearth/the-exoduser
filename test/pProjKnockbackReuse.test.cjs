'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict'),test=require('node:test');
const {parse}=require('acorn');
const sourceDir=process.env.EXODUSER_PPROJ_SOURCE_DIR||path.resolve(__dirname,'..');

function walk(node,visit){
  if(!node||typeof node!=='object')return;
  if(node.type)visit(node);
  for(const value of Object.values(node)){
    if(Array.isArray(value))value.forEach(child=>walk(child,visit));
    else if(value&&typeof value==='object')walk(value,visit);
  }
}
function extract(file){
  const html=fs.readFileSync(path.join(sourceDir,file),'utf8');
  const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)].filter(m=>!/\bsrc\s*=/.test(m[1])&&m[2].includes('function _resetPProj('));
  assert.equal(scripts.length,1);
  const code=scripts[0][2],ast=parse(code,{ecmaVersion:'latest'}),nodes=[];
  walk(ast,node=>nodes.push(node));
  const text=node=>code.slice(node.start,node.end);
  const one=predicate=>{const matches=nodes.filter(predicate);assert.equal(matches.length,1);return matches[0];};
  const fn=name=>text(one(n=>n.type==='FunctionDeclaration'&&n.id.name===name));
  const producer=marker=>text(one(n=>n.type==='BlockStatement'&&text(n).startsWith('{const _pp=_getPProj();')&&text(n).length<1500&&text(n).includes(marker)));
  return {
    runtime:['_mkPProj','_resetPProj','_recyclePProj','_getPProj','hurtE'].map(fn).join('\n'),
    orb:producer('_pp.kbMult=0.1;'),arc:producer('_pp.arcMissile=true;'),
  };
}
function fixture(source){
  // Run complete source functions and exact cast producers; only ambient bonuses
  // and rendering/audio sinks are neutral fixtures. This does not drive a game UI
  // or execute the projectile collision/update loop.
  const math=Object.create(Math);math.random=()=>.5;
  const ctx={Math:math,window:{},_PPROJ_POOL:120,_pprojFree:[],PASSIVES:{},INV:{equipped:{}},
    P:{x:0,y:0,atkArc:0,hp:1000,mhp:1000,s:'idle',skills:{}},G:{cam:{x:0,y:0},hitStop:0},
    EL:{P:0,F:1,I:2,D:3,L:4,H:5,E:6},OPT:{parts:0},VW:800,VH:600,ens:[],
    _shBufI:0,_hitSfxCd:999,_UNDEAD_ET:new Set(),_dpsDmg:0,_txtPerFrame:0,_TXT_BUDGET:100,_impPerFrame:0,pProjs:[],
    _eqAffix:()=>0,_uEq:()=>0,statStr:()=>1,statCrit:()=>0,statCritDmg:()=>1,_predBonus:()=>0,_hunterMul:()=>1,
    _petOnAtk:()=>{},nc:()=>({}),rg1:()=>({}),rg2:()=>({}),wp:()=>({}),addParts:()=>{},poolPart:()=>{},shake:()=>{},_addImpact:()=>{},_addBoom:()=>{},canMv:()=>true,
    _fbDx:1,_fbDy:0,_fbR0:12,_fbLv:1,_fbExplR:80,_fbR:12,mdmg:100,hm:()=>({}),
    _bkA:Math.PI,_perpX:0,_perpY:0,_fwdA:0,_mSpd:12,_emCnt:3,_mcEl:[1,2,3,4,5,6],_mi:0,_mcRange:450,
  };
  vm.createContext(ctx);
  vm.runInContext(source.runtime+'\nfunction spawnOrb(){'+source.orb+'}\nfunction spawnArc(){'+source.arc+'}',ctx,{timeout:2000});
  const cast=kind=>{ctx[kind==='orb'?'spawnOrb':'spawnArc']();return ctx.pProjs.pop();};
  const hit=(projectile,enemyPatch={})=>{
    const enemy={alive:true,hp:10000,mhp:10000,etype:0,x:10,y:0,r:10,el:0,s:'idle',st2:0,kb:{x:0,y:0},hurt:0,ib:false,...enemyPatch};
    ctx.hurtE(enemy,100,0,true,projectile,projectile.el);
    assert.equal(ctx._shBufI,0,'hurtE returns its query-buffer lease');
    return JSON.parse(JSON.stringify({hp:enemy.hp,kb:enemy.kb,x:enemy.x,y:enemy.y}));
  };
  return {ctx,cast,hit};
}

for(const file of ['game.html','game-easy-test.html']){
  const source=extract(file);
  test(file+': arc damage and knockback match a fresh cast after an orb is recycled',()=>{
    const fresh=fixture(source),expected=fresh.hit(fresh.cast('arc'));
    assert.deepEqual(expected,{hp:9900,kb:{x:3,y:0},x:10,y:0});
    const reused=fixture(source),orb=reused.cast('orb'),hitSet=orb._hitSet;
    orb._hitSet.add({id:'old-target'});reused.ctx._recyclePProj(orb);
    const arc=reused.cast('arc');assert.equal(arc,orb);assert.equal(arc._hitSet,hitSet);assert.equal(arc._hitSet.size,0);
    assert.deepEqual(reused.hit(arc),expected);
  });
  test(file+': recycling an arc back into an orb retains the intended orb knockback',()=>{
    const fresh=fixture(source),expected=fresh.hit(fresh.cast('orb'));
    assert.equal(expected.hp,9900);assert(Math.abs(expected.kb.x-.3)<1e-12);
    const reused=fixture(source),arc=reused.cast('arc');reused.ctx._recyclePProj(arc);
    const orb=reused.cast('orb');assert.equal(orb,arc);assert.deepEqual(reused.hit(orb),expected);
  });
  test(file+': offscreen movement, boss resistance, and zero-knockback classes survive reuse',()=>{
    for(const kind of ['outside','boss','lightning','noKB','bow']){
      const old=fixture(source),orb=old.cast('orb');old.ctx._recyclePProj(orb);const reused=old.cast('arc');
      const control=fixture(source),fresh=control.cast('arc');
      let enemy={};
      if(kind==='outside')enemy={x:3000};
      if(kind==='boss')enemy={ib:true};
      if(kind==='lightning'){reused.el=old.ctx.EL.L;fresh.el=control.ctx.EL.L;}
      if(kind==='noKB'){reused.noKB=true;fresh.noKB=true;}
      if(kind==='bow'){reused.magic=false;fresh.magic=false;}
      const result=old.hit(reused,enemy),expected=control.hit(fresh,enemy);
      assert.deepEqual(result,expected,kind+' must not inherit the prior orb');
      if(kind==='outside')assert.equal(result.x,3009);
      if(kind==='boss')assert(Math.abs(result.kb.x-.15)<1e-12);
      if(['lightning','noKB','bow'].includes(kind))assert.equal(result.kb.x,0);
    }
  });
}
