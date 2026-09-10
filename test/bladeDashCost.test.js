import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync(new URL('../game.html',import.meta.url),'utf8');
function fn(name){const s=html.indexOf('function '+name+'(');let n=0;for(let i=html.indexOf('{',s);i<html.length;i++){if(html[i]==='{')n++;if(html[i]==='}'&&!--n)return html.slice(s,i+1);}}
function ctx(lv,mp,gauge){const noop=()=>{};const c=vm.createContext({P:{skills:{bladeDash:lv},x:0,y:0,s:'idle',mp,iframes:0},_harpGauge:gauge,_HARP_GAUGE_COST:[0,45,98,150],_HARP_GAUGE_MAX:225,_addSkProf:noop,isAct:()=>false,addTxt:noop,showPH:noop,SFX:{charge:noop},playSample:noop,_r:()=>1,addParts:noop,shake:noop});vm.runInContext(fn('_canBladeDash')+fn('activateBladeDash'),c);return c;}
test('Flash Step spends 70 percent MP and shared gauge at levels 1, 10 and 20',()=>{
 for(const [lv,cost]of [[1,7],[10,38.5],[20,73.5]]){const c=ctx(lv,100,225);c.activateBladeDash(3);assert.equal(c.P.mp,100-cost);assert.equal(c._harpGauge,193.5);assert.equal(c.P._bdMoveT,6);assert.equal(c.P.iframes,15);}
});
test('new exact resource thresholds are sufficient and either shortage prevents consumption',()=>{
 const c=ctx(10,38.5,31.5);assert.equal(c._canBladeDash(),true);c.activateBladeDash(3);assert.equal(c.P.mp,0);assert.equal(c._harpGauge,0);
 for(const [mp,gauge]of [[38.4,31.5],[38.5,31.4]]){const c=ctx(10,mp,gauge);assert.equal(c._canBladeDash(),false);c.activateBladeDash(3);assert.equal(c.P.mp,mp);assert.equal(c._harpGauge,gauge);assert.equal(c.P.s,'idle');}
});
