import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const engine=html.slice(html.indexOf("const _CHO="),html.indexOf('let _vkbRow='));
const input=html.slice(html.indexOf('function _vkbInput(k){'),html.indexOf('// ── 로그인 게임패드 네비게이션'));
function setup(prefix){const field={value:prefix,dispatchEvent(){}};const ctx=vm.createContext({$:()=>field,Event:class{}});vm.runInContext(engine+'\n'+input,ctx);return{field,key:k=>ctx._vkbInput(k)}}
for(const [label,keys,expected] of [
 ['new consonant cannot replace the eighth initial',['ㄱ','ㄴ','ㅏ'],'AAAAAAA가'],
 ['final consonant cannot split beyond eight characters',['ㄱ','ㅏ','ㄱ','ㅏ'],'AAAAAAA각'],
 ['non-final initial cannot replace the eighth syllable',['ㄱ','ㅏ','ㄸ','ㅏ'],'AAAAAAA가'],
 ['compound final fits within the eighth syllable',['ㄱ','ㅏ','ㄹ','ㄱ'],'AAAAAAA갉'],
 ['backspace still removes the final consonant',['ㄱ','ㅏ','ㄱ','⌫'],'AAAAAAA가']
])test(label,()=>{const {field,key}=setup('AAAAAAA');keys.forEach(key);assert.equal(field.value,expected);assert.ok(field.value.length<=8)});
test('final consonant splits when there is room',()=>{const {field,key}=setup('AAAAAA');['ㄱ','ㅏ','ㄱ','ㅏ'].forEach(key);assert.equal(field.value,'AAAAAA가가')});
