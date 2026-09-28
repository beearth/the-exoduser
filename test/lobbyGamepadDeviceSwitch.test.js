import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const code=html.slice(html.indexOf('const _GP ='),html.indexOf('</script>',html.indexOf('(function _gpGlobalPoll()')));
function device(index,id,axes=[0,0,0,0],pressed=false){
 return {index,id,connected:true,axes,buttons:[{pressed,value:pressed?1:0}]};
}
function setup(first){
 let devices=[first],hoverStops=0;
 const frames=[],handlers={},settings=new Map(),body={style:{}},dot={style:{},parentElement:body,setAttribute(){}};
 const ctx=vm.createContext({
  addEventListener:(name,fn)=>{handlers[name]=fn},requestAnimationFrame:fn=>frames.push(fn),navigator:{getGamepads:()=>devices},
  console:{log(){}},document:{body,getElementById:id=>id==='gpDot'?dot:null},
  localStorage:{setItem:(key,value)=>settings.set(key,value)},clearInterval(){},setInterval:()=>37,
  _stopHover(){hoverStops++}
 });
 vm.runInContext(code,ctx);
 const pad=vm.runInContext('_GP',ctx);
 return {pad,settings,handlers,hoverStops:()=>hoverStops,poll(next){devices=next;frames.shift()();}};
}

test('polling a pad without a connection event establishes connected state',()=>{
 const first=device(0,'primary'),s=setup(first);
 assert.equal(s.pad.connected,true);
 assert.equal(s.pad.vibRef,first);
});
test('polling device replacement delivers the new pads first press and stops old feedback',()=>{
 const s=setup(device(0,'primary',[0,0,0,1],true));
 s.pad._vibLoop=37;s.pad.prev._lobbyDir='down';
 let firstPress=false;s.pad.on('probe',(gp,just)=>{firstPress=just[0]});
 const next=device(1,'secondary',[0,0],true);s.poll([null,next]);
 assert.equal(firstPress,true);
 assert.equal(s.pad.prev._lobbyDir,undefined);
 assert.deepEqual(Array.from(s.pad.axes),[0,0,0,0]);
 assert.equal(s.pad._vibLoop,null);
 assert.equal(s.hoverStops(),1);
 assert.equal(s.pad.vibRef,next);
});
test('fresh browser snapshots of the same device preserve held button state',()=>{
 const s=setup(device(0,'primary',[0,0,0,0],true));let repeatedPress=true;
 s.pad.on('probe',(gp,just)=>{repeatedPress=just[0]});
 s.poll([device(0,'primary',[0,0,0,0],true)]);
 assert.equal(repeatedPress,false);assert.equal(s.hoverStops(),0);
});
test('an absent right stick is zeroed instead of retaining the preceding sample',()=>{
 const s=setup(device(0,'primary',[0,0,0,1]));
 s.poll([device(0,'primary',[0,0])]);
 assert.deepEqual(Array.from(s.pad.axes),[0,0,0,0]);
});
test('idle gamepad polling cannot restore navigation after mouse takeover',()=>{
 const s=setup(device(0,'primary',[0,0,0,0],true));let navigation=0;
 s.pad.on('probe',()=>{navigation++});s.poll([device(0,'primary')]);
 assert.equal(navigation,1);
 s.handlers.mousemove({movementX:4,movementY:0});s.poll([device(0,'primary')]);
 assert.equal(s.pad.active,false);assert.equal(navigation,1);
 s.poll([device(0,'primary',[0,0,0,0],true)]);
 assert.equal(s.pad.active,true);assert.equal(navigation,2);
});
