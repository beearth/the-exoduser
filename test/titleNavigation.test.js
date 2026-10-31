import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const start=html.indexOf('function splashKey(e)');
const handler=html.slice(start,html.indexOf('\n  });',start))+'}';
function setup(){
 const selected=[],focused=[],clicked=[];const items=[0,1,2].map(i=>({li:{focus(){focused.push(i)},click(){clicked.push(i)}}}));
 const ctx=vm.createContext({done:false,phase:2,overlay:{style:{display:'block'}},fdgEl:{style:{display:'none'}},_titleSel:0,_titleItems:items,document:{removeEventListener(){}},_selectTitleItem(i){ctx._titleSel=(i+3)%3;selected.push(ctx._titleSel)},_activateTitleItem(){},skip(){throw Error('Unexpected skip')}});
 vm.runInContext(handler,ctx);return {ctx,selected,focused,clicked};
}
function key(key,extra={}){return {key,repeat:false,preventDefault(){this.prevented=true},...extra};}
test('title Tab and Shift Tab move visible selection and actual focus',()=>{const {ctx,focused}=setup();ctx.splashKey(key('Tab'));assert.equal(ctx._titleSel,1);assert.deepEqual(focused,[1]);ctx.splashKey(key('Tab',{shiftKey:true}));assert.equal(ctx._titleSel,0);assert.deepEqual(focused,[1,0]);});
test('title Home End and arrows keep focus on selected menu item',()=>{const {ctx,focused}=setup();ctx.splashKey(key('End'));assert.equal(ctx._titleSel,2);ctx.splashKey(key('ArrowDown'));assert.equal(ctx._titleSel,0);ctx.splashKey(key('Home'));assert.deepEqual(focused,[2,0,0]);});
test('title leaves browser shortcuts and IME input untouched',()=>{const {ctx,selected}=setup();for(const extra of [{ctrlKey:true},{metaKey:true},{isComposing:true},{keyCode:229}]){const e=key('ArrowDown',extra);ctx.splashKey(e);assert.equal(e.prevented,undefined);}assert.deepEqual(selected,[]);});

for(const activation of ['Enter',' '])test('title '+JSON.stringify(activation)+' shares click once and ignores auto-repeat',()=>{const {ctx,clicked}=setup();ctx.splashKey(key(activation));ctx.splashKey(key(activation,{repeat:true}));assert.deepEqual(clicked,[0]);});
