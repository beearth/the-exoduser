import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const source=html.slice(html.indexOf('let _lobbyGpIdx ='),html.indexOf('// ═══ 캐릭터 선택 → 입장'));
function setup(){
 const clicked=[],deleted=[];
 function card(id){const classes=new Set(['char-item']);return {id,offsetParent:{},style:{},classList:{contains:c=>classes.has(c),add:c=>classes.add(c),remove:c=>classes.delete(c)},closest:()=>null,click:()=>clicked.push(id),querySelector:()=>({click:()=>deleted.push(id)})}}
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
 assert.deepEqual(s.clicked,['old']);assert.ok(target.classList.contains('gp-hover'));
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
