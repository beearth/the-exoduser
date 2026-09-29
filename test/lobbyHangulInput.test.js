import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const engine=html.slice(html.indexOf("const _CHO="),html.indexOf('let _vkbRow='));
const input=html.slice(html.indexOf('function _vkbDispatchInput(inp){'),html.indexOf('// ── 로그인 게임패드 네비게이션'));
function setup(prefix){const listeners={},events=[];const field={value:prefix,focusRequests:[],focus(options){this.focusRequests.push(options);},click(){this.clicks=(this.clicks||0)+1;},addEventListener(type,fn){listeners[type]=fn;},dispatchEvent(e){events.push(e);listeners[e.type]?.(e);}};const ctx=vm.createContext({$:()=>field,Event:class{constructor(type){this.type=type;}}});vm.runInContext(engine+'\n'+input,ctx);return{field,events,key:k=>ctx._vkbInput(k)}}
for(const [label,keys,expected] of [
 ['new consonant cannot replace the eighth initial',['ㄱ','ㄴ','ㅏ'],'AAAAAAA가'],
 ['final consonant cannot split beyond eight characters',['ㄱ','ㅏ','ㄱ','ㅏ'],'AAAAAAA각'],
 ['non-final initial cannot replace the eighth syllable',['ㄱ','ㅏ','ㄸ','ㅏ'],'AAAAAAA가'],
 ['compound final fits within the eighth syllable',['ㄱ','ㅏ','ㄹ','ㄱ'],'AAAAAAA갉'],
 ['backspace still removes the final consonant',['ㄱ','ㅏ','ㄱ','⌫'],'AAAAAAA가']
])test(label,()=>{const {field,key}=setup('AAAAAAA');keys.forEach(key);assert.equal(field.value,expected);assert.ok(field.value.length<=8)});
test('final consonant splits when there is room',()=>{const {field,key}=setup('AAAAAA');['ㄱ','ㅏ','ㄱ','ㅏ'].forEach(key);assert.equal(field.value,'AAAAAA가가')});


for(const [label,replacement] of [['replace name','이름'],['physical deletion',''],['append Latin','가X'],['same visible syllable','가']])test('external input commits virtual Hangul composition: '+label,()=>{
 const s=setup('');s.key('ㄱ');s.key('ㅏ');assert.equal(s.field.value,'가');
 s.field.value=replacement;s.field.dispatchEvent({type:'input'});s.key('ㄴ');assert.equal(s.field.value,replacement+'ㄴ');s.key('ㅏ');
 assert.equal(s.field.value,replacement+'나');
});
test('programmatic name restoration without an input event cannot reuse an old syllable',()=>{
 const s=setup('');s.key('ㄱ');s.key('ㅏ');s.field.value='새이름';s.key('ㄴ');s.key('ㅏ');
 assert.equal(s.field.value,'새이름나');
});
test('an externally replaced full name remains intact at the eight-character boundary',()=>{
 const s=setup('');s.key('ㄱ');s.key('ㅏ');s.field.value='ABCDEFGH';s.key('ㄴ');s.key('ㅏ');
 assert.equal(s.field.value,'ABCDEFGH');
});
test('virtual input events preserve composition and still notify existing listeners',()=>{
 const s=setup('');['ㄱ','ㅏ','ㄱ','⌫'].forEach(s.key);assert.equal(s.field.value,'가');
 assert.equal(s.events.length,4);for(const event of s.events){assert.equal(event.type,'input');assert.equal(event._fromVkb,true);}
});

test('virtual text keys return focus to the name field without scrolling the keyboard',()=>{
 const s=setup('');for(const k of ['ㄱ','ㅏ','⌫','␣']){const before=s.field.focusRequests.length;s.key(k);assert.equal(s.field.focusRequests.length,before+1);assert.equal(s.field.focusRequests.at(-1).preventScroll,true);}
});
test('virtual OK returns focus before running name validation',()=>{
 const s=setup('A');s.key('OK');assert.equal(s.field.clicks,1);assert.equal(s.field.focusRequests.length,1);assert.equal(s.field.focusRequests[0].preventScroll,true);
});
