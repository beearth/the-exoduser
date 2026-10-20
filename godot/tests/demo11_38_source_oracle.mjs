import fs from 'node:fs';
import readline from 'node:readline';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=process.argv.find(x=>x.startsWith('--source-game='))?.slice(14);
assert(source,'explicit --source-game');
let next='',click='',url='',capture=false;let line=0;const anchors={};
for await(const s of readline.createInterface({input:fs.createReadStream(source),crlfDelay:Infinity})){
 line++;
 if(s.startsWith('function nextStage(){')){next=s;anchors.next=line;}
 if(s.startsWith("$('nextBtn').onclick=()=>{")){capture=true;anchors.click=line;}
 if(capture){click+=s+'\n';if(s==='};')capture=false;}
 if(s.includes("window.open('https://store.steampowered.com/','_blank')")){url='https://store.steampowered.com/';anchors.url=line;}
}
assert(next && click && url);
const nodes=new Map();const $=id=>{if(!nodes.has(id))nodes.set(id,{style:{},disabled:false});return nodes.get(id)};
let init=0,difficulty=0,stop=0;
const context=vm.createContext({$,SFX:{beamStop(){stop++}},G:{stage:0,stageCleared:true,on:true},ens:[{}],_cacheExitCenter(){},SI_TO_HELL:[0],CHAPTER_STAGES:[{startSi:0,stages:4}],_DEMO_MODE:true,_DEMO_LAST_STAGE:0,_T:x=>x,TOTAL_STAGES:35,initStage(){init++},BGM:{play(){},stageKey(){}},doWin(){throw Error('unexpected win')},_showNextDiffPop(){difficulty++}});
vm.runInContext(next+'\n'+click,context);
$('nextBtn').onclick();
assert.equal(context.G.stage,0);assert.equal(context.G.on,false);assert.equal(context.G.stageCleared,false);
assert.equal(init,0);assert.equal(difficulty,0);assert.equal(stop,1);assert.equal($('demoEnd').style.display,'flex');assert.equal($('nextBtn').disabled,true);
console.log(JSON.stringify({stage:context.G.stage,on:context.G.on,stageCleared:context.G.stageCleared,init_calls:init,difficulty_calls:difficulty,title:$('demoEndTitle').textContent,body:$('demoEndMsg').textContent,wishlist_url:url,anchors}));
