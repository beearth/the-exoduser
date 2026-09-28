import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const source=html.slice(html.indexOf('let _lobbyGpIdx ='),html.indexOf('// ═══ 캐릭터 선택 → 입장'));
function setup(){
 const clicked=[],deleted=[];
 function card(id,kind='char-item'){const classes=new Set([kind]);return {id,offsetParent:{},style:{},classList:{contains:c=>classes.has(c),add:c=>classes.add(c),remove:c=>classes.delete(c)},closest:()=>null,click:()=>clicked.push(id),querySelector:()=>({click:()=>deleted.push(id)})}}
 let items=[card('old')];
 const panel={querySelectorAll:()=>items};
 const lobby={style:{display:'flex'},querySelector:s=>s==='.lobby-right'?panel:null};
 const down={click(){items=[card('new')]}};
 const nodes={lobby,charNavDn:down};
 const pad={axes:[0,0,0,0],prev:{},on(id,fn){ctx.step=fn},vib(){},vibLoop(){},vibLoopStop(){}};
 const ctx=vm.createContext({$:id=>nodes[id],_GP:pad,ExoduserCharacterStory:{active:false},_langPopOpen:false,_vkbActive:false,performance:{now:()=>100}});
 vm.runInContext(source,ctx);
 return{clicked,deleted,pad,make:card,setItems:next=>{items=next},items:()=>items,replace:()=>down.click(),step:(button,right=0)=>{const just=[];if(button!==undefined)just[button]=true;return ctx.step({buttons:[],axes:[0,0,0,right]},just)}};
}
for(const [button,label] of [[0,'select'],[2,'delete confirmation']])test('right stick refresh uses visible card for simultaneous '+label,()=>{
 const s=setup();s.step(button,1);assert.deepEqual(button===0?s.clicked:s.deleted,['new']);
 assert.ok(s.items()[0].classList.contains('gp-hover'));
});
test('replacing a card at the same index restores its gamepad hover',()=>{
 const s=setup();s.step();assert.ok(s.items()[0].classList.contains('gp-hover'));const old=s.items()[0];
 s.replace();s.step();assert.ok(s.items()[0].classList.contains('gp-hover'));assert.ok(!old.classList.contains('gp-hover'));
 assert.deepEqual(s.clicked,[]);assert.deepEqual(s.deleted,[]);
});
test('holding the right stick pages once until released',()=>{
 const s=setup();
 s.step(undefined,1);const first=s.items()[0];s.step(undefined,1);assert.equal(s.items()[0],first);
 s.step();s.step(undefined,1);assert.notEqual(s.items()[0],first);
});

test('inserting a control before the highlighted button preserves its action',()=>{
 const s=setup(),target=s.items()[0];s.step();s.setItems([s.make('inserted'),target]);s.step(0);
 assert.deepEqual(s.clicked,['old']);assert.ok(target.classList.contains('gp-hover'));assert.equal(target.style.outline,'2px solid #C9A961');
});
test('removing an earlier control preserves the highlighted button',()=>{
 const s=setup(),before=s.items()[0],target=s.make('target'),after=s.make('after');s.setItems([before,target,after]);s.step();s.step(13);
 s.setItems([target,after]);s.step(0);assert.deepEqual(s.clicked,['target']);
});
test('direction input continues from the preserved element after insertion',()=>{
 const s=setup(),target=s.items()[0],after=s.make('after');s.setItems([target,after]);s.step();
 s.setItems([s.make('inserted'),target,after]);s.step(13);s.step(0);assert.deepEqual(s.clicked,['after']);
});
test('removing the highlighted element clamps to a remaining control',()=>{
 const s=setup(),before=s.items()[0],target=s.make('target');s.setItems([before,target]);s.step();s.step(13);
 s.setItems([before]);s.step(0);assert.deepEqual(s.clicked,['old']);
});

for(const label of ['empty slot','full new-character card'])test('gamepad skips '+label,()=>{
 const s=setup(),blocked=s.make('blocked',label==='empty slot'?'char-item':'char-item-new'),target=s.make('target');blocked.style.pointerEvents='none';
 s.setItems([blocked,target]);s.step(0);assert.deepEqual(s.clicked,['target']);assert.ok(!blocked.classList.contains('gp-hover'));
});
test('direction input skips unavailable cards between usable controls',()=>{
 const s=setup(),first=s.items()[0],blocked=s.make('blocked'),last=s.make('last');blocked.style.pointerEvents='none';
 s.setItems([first,blocked,last]);s.step();s.step(13);s.step(0);assert.deepEqual(s.clicked,['last']);
});
test('a highlighted card becoming unavailable clears its highlight and moves the action',()=>{
 const s=setup(),old=s.items()[0],next=s.make('next');s.setItems([old,next]);s.step();old.style.pointerEvents='none';s.step(0);
 assert.deepEqual(s.clicked,['next']);assert.ok(!old.classList.contains('gp-hover'));assert.equal(old.style.outline,'');assert.equal(old.style.outlineOffset,'');
});

function disconnectedPad(){
 const handlers={},cleared=[],settings=new Map();let hoverStops=0;const ctx=vm.createContext({addEventListener:(name,fn)=>{handlers[name]=fn},console:{log(){}},document:{body:{style:{cursor:'none'}}},localStorage:{setItem:(k,v)=>settings.set(k,v)},clearInterval:id=>cleared.push(id),setInterval:()=>42,_stopHover(){hoverStops++}});
 vm.runInContext(html.slice(html.indexOf('const _GP ='),html.indexOf("addEventListener('mousemove'")),ctx);const pad=vm.runInContext('_GP',ctx);pad.connected=true;pad.active=true;pad.vibRef={};pad.axes=[1,-1,1,-1];pad._vibLoop=42;
 const classes=new Set(['gp-hover']),highlight={style:{outline:'2px solid #C9A961',outlineOffset:'-2px'},classList:{remove:c=>classes.delete(c)}};pad.prev._lobbyEl=highlight;pad.prev._lobbyIdx=3;handlers.gamepaddisconnected({});
 return{pad,ctx,classes,highlight,cleared,settings,hoverStops:()=>hoverStops,handlers};
}
test('disconnect restores the cursor and keyboard/mouse input mode',()=>{
 const s=disconnectedPad();assert.equal(s.ctx.document.body.style.cursor,'');assert.equal(s.settings.get('inputMode'),'kbm');assert.equal(s.pad.connected,false);assert.equal(s.pad.active,false);assert.equal(s.pad.vibRef,null);
});
test('disconnect stops repeating feedback and clears stale stick values',()=>{
 const s=disconnectedPad();assert.deepEqual(s.cleared,[42]);assert.equal(s.pad._vibLoop,null);assert.equal(s.hoverStops(),1);assert.deepEqual(Array.from(s.pad.axes),[0,0,0,0]);
});
test('disconnect clears the old highlight so reconnect can highlight it again',()=>{
 const s=disconnectedPad();assert.equal(s.highlight.style.outline,'');assert.equal(s.highlight.style.outlineOffset,'');assert.ok(!s.classes.has('gp-hover'));assert.equal(s.pad.prev._lobbyEl,undefined);assert.equal(s.pad.prev._lobbyIdx,undefined);
 s.handlers.gamepadconnected({gamepad:{id:'reconnected',vibrationActuator:{}}});assert.equal(s.pad.connected,true);assert.equal(s.pad.vibRef.id,'reconnected');
});

function pollLossPad(){
 const handlers={},frames=[],cleared=[],settings=new Map();let hoverStops=0;let pads=[{connected:true,buttons:[],axes:[0,0,0,0]}];const body={style:{cursor:'none'}},dot={parentElement:body,style:{},setAttribute(){}};const ctx=vm.createContext({addEventListener:(name,fn)=>{handlers[name]=fn},requestAnimationFrame:fn=>frames.push(fn),navigator:{getGamepads:()=>pads},console:{log(){}},document:{body,getElementById:id=>id==='gpDot'?dot:null},localStorage:{setItem:(k,v)=>settings.set(k,v)},clearInterval:id=>cleared.push(id),setInterval:()=>77,_stopHover(){hoverStops++}});
 const code=html.slice(html.indexOf('const _GP ='),html.indexOf('</script>',html.indexOf('(function _gpGlobalPoll()')));vm.runInContext(code,ctx);const pad=vm.runInContext('_GP',ctx);pad.connected=true;pad.active=true;pad.vibRef={};pad.axes=[1,-1,1,-1];pad._vibLoop=77;pad.prev[0]=true;pad.prev._lobbyDir='down';const classes=new Set(['gp-hover']),highlight={style:{outline:'2px solid #C9A961',outlineOffset:'-2px'},classList:{remove:c=>classes.delete(c)}};pad.prev._lobbyEl=highlight;pad.prev._lobbyIdx=3;pads=[];frames.shift()();return{pad,ctx,classes,highlight,cleared,settings,hoverStops:()=>hoverStops,frames,setPads:next=>{pads=next}};
}
test('polling loss cleans stale gamepad feedback when no disconnect event arrives',()=>{
 const s=pollLossPad();assert.equal(s.pad.connected,false);assert.equal(s.pad.active,false);assert.equal(s.pad.vibRef,null);assert.deepEqual(Array.from(s.pad.axes),[0,0,0,0]);assert.deepEqual(s.cleared,[77]);assert.equal(s.hoverStops(),1);assert.equal(s.ctx.document.body.style.cursor,'');assert.equal(s.settings.get('inputMode'),'kbm');
});
test('polling loss clears stale focus once and stays quiet while no pad is exposed',()=>{
  const s=pollLossPad();assert.equal(s.highlight.style.outline,'');assert.equal(s.highlight.style.outlineOffset,'');assert.ok(!s.classes.has('gp-hover'));assert.equal(s.pad.prev._lobbyEl,undefined);const stops=s.hoverStops(),clears=s.cleared.length;s.frames.shift()();assert.equal(s.hoverStops(),stops);assert.equal(s.cleared.length,clears);
});
test('polling loss forgets held input before a reconnected pad is polled',()=>{
 const s=pollLossPad();let firstPress=false;s.pad.on('reconnectProbe',(gp,just)=>{firstPress=just[0]});assert.equal(s.pad.prev[0],undefined);assert.equal(s.pad.prev._lobbyDir,undefined);s.setPads([{connected:true,buttons:[{pressed:true}],axes:[0,0,0,0]}]);s.frames.shift()();assert.equal(firstPress,true);
});

function keyboardMousePad(){
 const handlers={},cleared=[],settings=new Map();let hoverStops=0;const ctx=vm.createContext({addEventListener:(name,fn)=>{handlers[name]=fn},console:{log(){}},document:{body:{style:{cursor:'none'}}},localStorage:{setItem:(k,v)=>settings.set(k,v)},clearInterval:id=>cleared.push(id),setInterval:()=>55,_stopHover(){hoverStops++}});
 vm.runInContext(html.slice(html.indexOf('const _GP ='),html.indexOf('// 🎮 패드 상태 인디케이터')),ctx);const pad=vm.runInContext('_GP',ctx);pad.active=true;pad.vibRef={};pad.axes=[1,-1,1,-1];pad._vibLoop=55;const classes=new Set(['gp-hover']),highlight={style:{outline:'2px solid #C9A961',outlineOffset:'-2px'},classList:{remove:c=>classes.delete(c)}};pad.prev._lobbyEl=highlight;pad.prev._lobbyIdx=2;
 return{handlers,pad,ctx,classes,highlight,cleared,settings,hoverStops:()=>hoverStops};
}
for(const [event,payload] of [['mousemove',{movementX:4,movementY:0}],['keydown',{}]])test(event+' returning to keyboard/mouse clears gamepad feedback',()=>{
 const s=keyboardMousePad();s.handlers[event](payload);assert.equal(s.pad.active,false);assert.equal(s.pad._vibLoop,null);assert.deepEqual(s.cleared,[55]);assert.equal(s.hoverStops(),1);assert.ok(!s.classes.has('gp-hover'));assert.equal(s.highlight.style.outline,'');assert.equal(s.highlight.style.outlineOffset,'');assert.equal(s.pad.prev._lobbyEl,undefined);assert.equal(s.ctx.document.body.style.cursor,'');assert.equal(s.settings.get('inputMode'),'kbm');
});
for(const pointerType of ['mouse','touch','pen'])test(pointerType+' press switches input without requiring mouse movement',()=>{
 const s=keyboardMousePad();s.handlers.pointerdown?.({pointerType});
 assert.equal(s.pad.active,false);assert.equal(s.pad._vibLoop,null);assert.equal(s.hoverStops(),1);
 assert.ok(!s.classes.has('gp-hover'));assert.equal(s.ctx.document.body.style.cursor,'');
 assert.equal(s.settings.get('inputMode'),'kbm');
});
test('a gamepad generated pointer press retains pad input',()=>{
 const s=keyboardMousePad();s.handlers.pointerdown?.({_fromGp:true,pointerType:'mouse'});
 assert.equal(s.pad.active,true);assert.equal(s.pad._vibLoop,55);assert.equal(s.hoverStops(),0);
});

test('a secondary pad does not replace or disconnect the primary lobby pad',()=>{
 const handlers={},settings=new Map(),primary={id:'primary',index:0,connected:true},secondary={id:'secondary',index:1,connected:false};const ctx=vm.createContext({addEventListener:(name,fn)=>{handlers[name]=fn},navigator:{getGamepads:()=>[primary,secondary]},console:{log(){}},document:{body:{style:{cursor:'none'}}},localStorage:{setItem:(k,v)=>settings.set(k,v)},clearInterval(){},setInterval:()=>88,_stopHover(){}});
 vm.runInContext(html.slice(html.indexOf('const _GP ='),html.indexOf('addEventListener(\'mousemove\'')),ctx);const pad=vm.runInContext('_GP',ctx);handlers.gamepadconnected({gamepad:primary});handlers.gamepadconnected({gamepad:secondary});pad.active=true;pad.axes=[1,0,0,0];handlers.gamepaddisconnected({gamepad:secondary});
 assert.equal(pad.vibRef,primary);assert.equal(pad.connected,true);assert.equal(pad.active,true);assert.deepEqual(Array.from(pad.axes),[1,0,0,0]);assert.equal(settings.get('inputMode'),undefined);
});
test('primary pad loss resets old input before handing control to a remaining pad',()=>{
 const handlers={},settings=new Map(),primary={id:'primary',index:0,connected:false},secondary={id:'secondary',index:1,connected:true};const ctx=vm.createContext({addEventListener:(name,fn)=>{handlers[name]=fn},navigator:{getGamepads:()=>[primary,secondary]},console:{log(){}},document:{body:{style:{cursor:'none'}}},localStorage:{setItem:(k,v)=>settings.set(k,v)},clearInterval(){},setInterval:()=>89,_stopHover(){}});
 vm.runInContext(html.slice(html.indexOf('const _GP ='),html.indexOf('addEventListener(\'mousemove\'')),ctx);const pad=vm.runInContext('_GP',ctx);pad.connected=true;pad.active=true;pad.vibRef=primary;pad.axes=[1,-1,1,-1];pad.prev[0]=true;pad.prev._lobbyDir='down';handlers.gamepaddisconnected({gamepad:primary});
 assert.equal(pad.vibRef,secondary);assert.equal(pad.connected,true);assert.equal(pad.active,false);assert.deepEqual(Array.from(pad.axes),[0,0,0,0]);assert.equal(pad.prev[0],undefined);assert.equal(pad.prev._lobbyDir,undefined);assert.equal(settings.get('inputMode'),'kbm');
});
