import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {parse} from 'acorn';
import {scripts,walk} from '../tools/localization-catalog.mjs';

const game=fs.readFileSync(new URL('../game.html',import.meta.url),'utf8');
const startup=game.slice(game.indexOf('// 게임 시작 시 자동 불러오기'),game.indexOf("try{_applyCursor()}catch(e){}",game.indexOf('// 게임 시작 시 자동 불러오기')));
function start(saved,settings){
 const doc={documentElement:{}};
 const ctx=vm.createContext({OPT:{lang:'ko'},BINDS:{},BINDS2:{},document:doc,localStorage:{getItem:key=>key==='hellLang'?saved:settings},BGM:{setVol(){}},saveSettings(){},applyUIScale(){}});
 vm.runInContext(fs.readFileSync(new URL('../localization-runtime.js',import.meta.url),'utf8'),ctx);
 vm.runInContext('function _applyLang(){OPT.lang=ExoduserI18n.resolveLanguage(OPT.lang)||"ko";ExoduserI18n.applyDocumentLanguage(document,OPT.lang)};function syncSettingsUI(){_applyLang()}',ctx);
 vm.runInContext(startup,ctx);
 return {code:ctx.OPT.lang,dir:doc.documentElement.dir};
}
test('first game entry inherits the lobby language even without settings',()=>{
 assert.deepEqual(start('malay',null),{code:'ms',dir:'ltr'});
 assert.deepEqual(start('arabic',null),{code:'ar',dir:'rtl'});
});
test('invalid settings do not discard the independent lobby language',()=>{
 assert.deepEqual(start('fr','{broken'),{code:'fr',dir:'ltr'});
 assert.deepEqual(start(null,JSON.stringify({opt:{lang:'de',diffV2:1}})),{code:'de',dir:'ltr'});
});
test('English labels use canonical names even when a caller has no English fallback',()=>{
 let localize;
 for(const {source,module}of scripts('game.html'))walk(parse(source,{ecmaVersion:'latest',sourceType:module?'module':'script'}),n=>{if(n.type==='FunctionDeclaration'&&n.id.name==='_L')localize=source.slice(n.start,n.end)});
 const ctx=vm.createContext({OPT:{lang:'en'},_T:s=>({'뇌전창':'Thunder Stake','수량 {n}':'Count {n}'}[s]||s)});
 vm.runInContext(fs.readFileSync(new URL('../localization-runtime.js',import.meta.url),'utf8'),ctx);
 vm.runInContext(localize,ctx);
 assert.equal(ctx._L('뇌전창','뇌전창'),'Thunder Stake');
 assert.equal(ctx._L('수량 {n}','Wrong {n}',{n:0}),'Count 0');
 assert.equal(ctx._L('새 키','New key'),'New key');
 ctx.OPT.lang='ko';assert.equal(ctx._L('뇌전창','Thunder Stake'),'뇌전창');
});
