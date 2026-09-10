import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {parse} from 'acorn';
const html=readFileSync(new URL('../game.html',import.meta.url),'utf8');
const code=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].find(m=>m[1].includes('function hurtP('))[1];
const ast=parse(code,{ecmaVersion:'latest'});
function fn(name){const n=ast.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name===name);assert.ok(n,name);return code.slice(n.start,n.end);}
test('projectile damage marks its sound source without changing poison or damage options',()=>{
  let received;
  const ctx=vm.createContext({hurtP:(...args)=>received=args});
  vm.runInContext(fn('_hurtProjectilePlayer'),ctx);
  ctx._hurtProjectilePlayer({_druidPoison:true},42,{dtype:'magic',projHit:true});
  assert.equal(received[0],42);assert.equal(received[1].druidPoison,true);assert.equal(received[1].projHit,true);assert.equal(received[1].projectileHitSfx,true);
});
function fixture(){
  const hits=[];let now=1000;
  const ctx=vm.createContext({console,window:{},_now:0,performance:{now:()=>now},_projectileHitSfxAt:-Infinity,
    P:{s:'idle',hp:100,mhp:100,shield:0,mshield:0,baseDef:0,skills:{},kb:{x:0,y:0},poise:4},G:{},STATS:{dex:0},INV:{equipped:{}},PASSIVES:{},OPT:{hitStop:0,shake:0,parts:0},DR_CAP:.75,
    _harpActive:false,_dashActive:false,_petOnHit(){},_lvB:()=>0,_eqStat:()=>0,_eqAffix:()=>0,_eqImplicit:()=>0,_gritTotal:()=>0,
    SFX:{},_isFused:()=>false,enhMul:()=>0,pDefAdd:()=>0,_isFocusState:()=>true,
    _uEq:()=>0,_L:(a,b)=>b,_T:s=>s,_logDmg(){},addTxt(){},addParts(){},_r:x=>x,playSample:(...args)=>hits.push(args),
    doParry(){},wp:()=>({}),die(){},scrFlash:null,scrFlashA:0});
  for(const name of ['sh','ar','bt','gl','pt','hm','nc','rg1','rg2','cp','blt'])ctx[name]=()=>({});
  vm.runInContext(fn('hurtP'),ctx);
  const sound=ast.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name==='_playProjectileHitSfx');
  if(sound)vm.runInContext(code.slice(sound.start,sound.end),ctx);
  return {ctx,hits,tick:ms=>now+=ms,impactHits:()=>hits.filter(h=>h[0]==='player_projectile_impact')};
}
test('accepted projectile damage adds impact while preserving HP loss',()=>{
  const s=fixture();s.ctx.hurtP(10,{projectileHitSfx:true});
  assert.equal(s.ctx.P.hp,90);assert.equal(s.impactHits().length,1);
});
test('energy shield absorption still produces a projectile impact',()=>{
  const s=fixture();s.ctx.P.shield=50;s.ctx.P.mshield=50;s.ctx.hurtP(10,{projectileHitSfx:true});
  assert.equal(s.ctx.P.hp,100);assert.equal(s.ctx.P.shield,40);assert.equal(s.impactHits().length,1);
});
test('player impact is prioritized above ordinary hit spam',()=>{
  const ctx=vm.createContext({_SFX_PRI:{PLAYER_HIT:8,HIT:2,PROJ:1}});
  vm.runInContext(fn('_sfxPri'),ctx);assert.equal(ctx._sfxPri('player_projectile_impact'),8);
});
for(const mode of ['iframes','dodge','parry','dot','melee'])test(mode+' does not trigger projectile body impact',()=>{
  const s=fixture();const opts={projectileHitSfx:true};
  if(mode==='iframes')s.ctx.P.iframes=10;
  if(mode==='dodge'){s.ctx.STATS.dex=1000;vm.runInContext('Math.random=()=>0',s.ctx);}
  if(mode==='parry')s.ctx.P._sbParryT=1;
  if(mode==='dot')opts.dot=true;
  if(mode==='melee')delete opts.projectileHitSfx;
  s.ctx.hurtP(10,opts);assert.equal(s.impactHits().length,0);
});
test('dense impacts keep all damage but sound is limited to one per 100ms',()=>{
  const s=fixture();
  for(let i=0;i<5;i++)s.ctx.hurtP(1,{projectileHitSfx:true});
  assert.equal(s.ctx.P.hp,95);assert.equal(s.impactHits().length,1);
  s.tick(100);s.ctx.hurtP(1,{projectileHitSfx:true});assert.equal(s.impactHits().length,2);
});
