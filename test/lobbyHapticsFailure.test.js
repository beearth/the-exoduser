import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const manager=html.slice(html.indexOf('const _GP ='),html.indexOf("addEventListener('mousemove'"));
function setup(actuator){
 const ctx=vm.createContext({addEventListener(){},console:{log(){}},clearInterval(){},setInterval(){},document:{body:{style:{}}},localStorage:{setItem(){}},_stopHover(){}});
 vm.runInContext(manager,ctx);
 const pad=vm.runInContext('_GP',ctx);
 pad.vibRef={vibrationActuator:actuator};
 return pad;
}

test('a rejected rumble request has a production rejection handler',async()=>{
 const result=Promise.reject(new Error('actuator disconnected'));
 const nativeThen=result.then.bind(result);
 // Keep RED isolated from the test runners global unhandled-rejection reporting.
 nativeThen(undefined,()=>{});
 let handled=false;
 result.then=(fulfilled,rejected)=>{
  if(typeof rejected==='function')handled=true;
  return nativeThen(fulfilled,rejected);
 };
 const pad=setup({playEffect:()=>result});
 pad.vib(60,.2,.5);
 await Promise.resolve();
 assert.equal(handled,true);
});
test('each scheduled doorway rumble handles asynchronous rejection',async()=>{
 const result=Promise.reject(new Error('actuator disconnected'));
 const nativeThen=result.then.bind(result);nativeThen(undefined,()=>{});
 let handled=0;result.then=(fulfilled,rejected)=>{
  if(typeof rejected==='function')handled++;
  return nativeThen(fulfilled,rejected);
 };
 const timers=[];
 const ctx=vm.createContext({_GP:{vibRef:{vibrationActuator:{playEffect:()=>result}}},setTimeout:fn=>timers.push(fn)});
 const start=html.indexOf('const _v=_GP.vibRef.vibrationActuator;');
 const end=html.indexOf('    }}catch(e){}',start);
 vm.runInContext(html.slice(start,end),ctx);
 assert.ok(timers.length>0);
 for(const fire of timers)fire();
 await Promise.resolve();
 assert.equal(handled,timers.length);
});
test('a synchronous actuator failure does not interrupt lobby actions',()=>{
 const pad=setup({playEffect(){throw new Error('unavailable')}});
 assert.doesNotThrow(()=>pad.vib(60,.2,.5));
});
test('a gamepad without rumble support remains usable',()=>{
 assert.doesNotThrow(()=>setup(null).vib(60,.2,.5));
});
test('normal rumble preserves its requested type and magnitudes',()=>{
 let actual;
 const pad=setup({playEffect(type,options){actual={type,options};return Promise.resolve('complete')}});
 pad.vib(60,.2,.5);
 assert.equal(actual.type,'dual-rumble');
 assert.equal(actual.options.duration,60);
 assert.equal(actual.options.startDelay,0);
 assert.equal(actual.options.weakMagnitude,.2);
 assert.equal(actual.options.strongMagnitude,.5);
});
