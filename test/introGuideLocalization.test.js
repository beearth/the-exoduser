import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync('game.html','utf8');
test('intro guide uses the selected locale and English fallback, rather than Korean for all non-English locales',()=>{
 const ctx=vm.createContext({OPT:{lang:'fr'},_L:(ko,en)=>ko==='다음'?'Suivant':en});
 vm.runInContext(source.match(/function _introGuideText\([^\n]+/)[0],ctx);
 assert.equal(ctx._introGuideText(['다음','Next']),'Suivant');
 assert.equal(ctx._introGuideText(['새 안내','New instruction']),'New instruction');
});
test('startup language refresh can continue before the later guide variable initializes',()=>{
 const block=source.slice(source.indexOf('function _applyLang(){'),source.indexOf("$('optDiff').oninput="));
 const refresh=block.slice(block.indexOf('  try{if(_introGuide)'),block.indexOf('_refreshPetBubbleLanguage();'));
 assert.ok(refresh.includes('_renderIntroGuide'));
 const ctx=vm.createContext({continued:false,_renderIntroGuide(){throw Error('Guide is not initialized yet')}});
 vm.runInContext(refresh+'\ncontinued=true; let _introGuide=null;',ctx);
 assert.equal(ctx.continued,true);
});
