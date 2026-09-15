import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {parse} from 'acorn';
for(const file of ['game.html','game-easy-test.html']){
  const html=fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
  const code=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].find(m=>m[1].includes('function _renderIntroCutscene('))[1];
  const n=parse(code,{ecmaVersion:'latest'}).body.find(n=>n.type==='FunctionDeclaration'&&n.id.name==='_renderIntroCutscene');
  test(file+': hold still finishes during an automatic exit/fade line',()=>{
    let ended=0;
    const ctx=vm.createContext({_cutsceneState:'INTRO_CUTSCENE',_cutSkipHolding:true,_cutSkipHold:1950,_cutSkipLastT:100,_CUT_SKIP_DUR:2000,
      performance:{now:()=>200},_cutsceneEnd:()=>ended++,
      _cutsceneGetLines:()=>[{exit:true,fade:{out:10000}}],_cutLineIdx:0,_cutLineStartMs:0,
      C:{width:800,height:600},_cutC:{width:800,height:600,style:{}},_cutX:{fillRect(){}}});
    vm.runInContext(code.slice(n.start,n.end),ctx);ctx._renderIntroCutscene();
    assert.equal(ended,1);assert.equal(ctx._cutSkipHolding,false);
  });
}
