import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

for(const file of ['game.html','game-easy-test.html']){
  const html=readFileSync(new URL('../'+file,import.meta.url),'utf8');
  const source=html.slice(html.indexOf("{const _qs=$('quitSection');"),html.indexOf("if($('resetYes'))"));
  for(const mode of ['browser','nw','electron'])test(file+' quit routes '+mode+' without silently ignoring blocked tab closure',async()=>{
    const nodes={quitSection:{style:{}},quitBtn:{}};
    const calls=[],timers=[];
    const context=vm.createContext({
      $:id=>nodes[id],IS_NW:mode==='nw',IS_ELECTRON:mode==='electron',
      window:{close:()=>calls.push('close'),nw:{App:{quit:()=>calls.push('nw')}},electronAPI:{quitApp:()=>calls.push('electron')}},
      goToLobby:async()=>calls.push('lobby'),setTimeout:callback=>timers.push(callback)
    });
    vm.runInContext(source,context);
    await nodes.quitBtn.onclick();
    for(const callback of timers)await callback();
    assert.deepEqual(calls,mode==='browser'?['close','lobby']:[mode]);
  });
}
