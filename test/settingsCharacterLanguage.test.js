import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {loadCatalogs} from '../tools/localization-catalog.mjs';
const {tables}=loadCatalogs();
for(const file of ['game.html','game-easy-test.html']) {
const game=fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
test(file+': settings character card displays existing English translation and switches back to Korean',()=>{
  const source=game.slice(game.indexOf("  const csg=$('charSelectGrid');if(csg)"),game.indexOf("  const list=$('keyBindList');"));
  const node=()=>({children:[],style:{},dataset:{},attrs:{},setAttribute(k,v){this.attrs[k]=v;},appendChild(el){this.children.push(el);},replaceChildren(){this.children=[];},set innerHTML(v){this.children=[];}});
  const grid=node(),ctx=vm.createContext({$:()=>grid,CHAR_LIST:[{name:'엑소듀서 전사',desc:'다크 판타지 전사. 거대검+검은 갑옷',idleN:1,folder:'test'}],_charIdx:0,_choiceFocus:undefined,document:{createElement:node},OPT:{lang:'en'},_LANG_TBL:{en:tables.en},_LANG_PFX:{},_LANG_BASE:{}});
  vm.runInContext(game.match(/function _T\(s\)\{[\s\S]*?\n\}/)[0],ctx);
  vm.runInContext(source,ctx);
  assert.deepEqual(grid.children[0].children.slice(1,3).map(n=>n.textContent),['Exoduser Warrior','Dark fantasy warrior. Greatsword + Black armor']);
  ctx.OPT.lang='ko';vm.runInContext('{'+source+'}',ctx);
  assert.deepEqual(grid.children[0].children.slice(1,3).map(n=>n.textContent),['엑소듀서 전사','다크 판타지 전사. 거대검+검은 갑옷']);
});
}
