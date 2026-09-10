import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync(new URL('../game.html',import.meta.url),'utf8');
function fn(name){const start=html.indexOf('function '+name+'(');assert.ok(start>=0);let n=0;for(let i=html.indexOf('{',start);i<html.length;i++){if(html[i]==='{')n++;if(html[i]==='}'&&!--n)return html.slice(start,i+1);}}
function context(){const c=vm.createContext({P:{skills:{},_altAtk:0},PASSIVES:{pAtk:0,pMagic:0,pBow:0,pParry:0},
  _eqAffix:()=>0,_eqImplicit:()=>0,_uEq:()=>0,magicRef:()=>100,statInt:()=>1,
  meleeRef:()=>1,statStr:()=>1,sh:()=>({})});
 vm.runInContext(['_passDmgSum','pMagicMul','pAtkMul','pBowMul','pMagicCost','pMagicSpd','pParryDmg','pParryProjDmg','_spikeTrapDmg'].map(fn).join('\n')+html.slice(html.indexOf('const _SK_MUL='),html.indexOf('function _fuseMul(')),c);return c;}
test('magic damage doubles at zero and invested passives while cost, speed and physical multipliers stay unchanged',()=>{
 const c=context();assert.equal(c.pMagicMul(),1.4);assert.equal(c.pMagicCost(),1);assert.equal(c.pMagicSpd(),2);
 assert.equal(c.pAtkMul(),.7);assert.equal(c.pBowMul(),.7);
 c.PASSIVES.pMagic=5;c._uEq=()=>.5;
 assert.ok(Math.abs(c.pMagicMul()-3.15)<1e-10);assert.equal(c.pMagicCost(),.4);assert.equal(c.pMagicSpd(),2.4);
});
test('direct spell and DOT snapshots inherit the boost once; physical kiSlash stays at its existing threefold tuning',()=>{
 const c=context();c.P.skills.fireball=1;c.P.skills.spikeTrap=1;
 const line=html.split('\n').find(l=>l.includes("const mdmg=~~(magicRef()*statInt()*pMagicMul()*_skMul('fireball')"));
 c._fuseMul=()=>1;vm.runInContext(line.replace('const mdmg=','globalThis.direct='),c);
 assert.equal(c.direct,1848);assert.equal(c._spikeTrapDmg(),980);assert.equal(c._skMul('kiSlash'),12);
});
test('Q and E projectile reflection retain their pre-buff equipment scaling',()=>{
 const c=context();assert.equal(c.pParryProjDmg(1000,true),616);assert.equal(c.pParryProjDmg(1000,false),501);
});
