import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync(new URL('../game.html',import.meta.url),'utf8');
const EL={P:0,F:1,I:2,D:3,L:4,H:5,E:6};
const ELC=['#bbbbbb','#ff5522','#3388ff','#9933cc','#ffee00','#ff88cc','#88aa44'];
test('special physical volley cannot reroll into another element at release',()=>{
 const shots=[];
 const ctx=vm.createContext({EL,ELC,_beanRoll:()=>({el:EL.F,col:'red',spd:4,dmgM:1,redBean:true}),_eMouthXY:()=>({x:0,y:0}),_emitEnemyShot:(e,p)=>shots.push(p)});
 vm.runInContext(html.slice(html.indexOf('function eProjAt('),html.indexOf('function _cancelProjCharge(')),ctx);
 ctx.eProjAt({s:'eShootWind',st2:0,atk:10,_swChargeEl:EL.P},0,3,.6,EL.P,100,'red',2);
 assert.equal(shots[0].el,EL.P);
 assert.equal(shots[0].redBean,undefined);
 assert.equal(shots[0].dmg,6);
});
test('every special windup records its authored element before its callback',()=>{
 const starts=[...html.matchAll(/e\.s='eShootWind';e\.st2=60;([^\n]*)\n\s*e\._swFire=/g)];
 assert.equal(starts.length,21);
 for(const m of starts)assert.match(m[1],/e\._swChargeEl=/,`missing element at ${m.index}`);
});
test('red monster body never makes a physical special warning red',()=>{
 const calls=[];const ctx=vm.createContext({EL,ELC,ens:[{alive:true,s:'eShootWind',st2:30,el:EL.P,_swChargeEl:EL.P,col:'#ff0000'}],G:{},_drawShootCharge:(...a)=>calls.push(a)});
 vm.runInContext(html.slice(html.indexOf('function _drawEnemyShotWarnings('),html.indexOf('function radialProjs(')),ctx);
 ctx._drawEnemyShotWarnings();assert.equal(calls[0][4],'#f4f4f4');
 ctx.ens[0]._swChargeEl=EL.D;ctx._drawEnemyShotWarnings();assert.equal(calls[1][4],ELC[EL.D]);
});
