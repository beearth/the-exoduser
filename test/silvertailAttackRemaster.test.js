import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
const file=new URL('../player-attack-remaster.js',import.meta.url);
test('both game entrypoints and the packaged build include the attack loader',()=>{
 const build=readFileSync(new URL('../build-nwjs.mjs',import.meta.url),'utf8');
 for(const entry of ['game.html','game-easy-test.html'])assert.match(readFileSync(new URL('../'+entry,import.meta.url),'utf8'),/<script src="player-attack-remaster\.js\?v=20260915-spin2"><\/script>/);
 assert.ok(existsSync(new URL('../img/exoduser_silvertail/attack-spin-v2.png',import.meta.url)));
 assert.match(build,/'player-attack-remaster\.js'/);
});
function harness(){
 assert.ok(existsSync(file),'attack remaster loader exists');
 const images=[],draws=[];
 const canvas=()=>({width:0,height:0,getContext:()=>({drawImage:(...a)=>draws.push(a)})});
 const c=vm.createContext({Image:class{constructor(){images.push(this)}},document:{createElement:canvas}});
 vm.runInContext(readFileSync(file,'utf8'),c);
 return {api:c.SilvertailAttackRemaster,images,draws,canvas};
}
test('attack-only merge preserves idle, walking, skills and original atlas',()=>{
 const h=harness(),base=h.canvas();base.width=480;base.height=384;
 const fm={idle_s:[{x:0,y:0,w:48,h:48}],run_s:[{x:96,y:0,w:48,h:48}],gSlam1_s:[{x:288,y:0,w:48,h:48}]};
 let result;h.api.apply(base,fm,(...args)=>result=args);
 const im=h.images[0];im.naturalWidth=240;im.naturalHeight=240;im.onload();
 const [atlas,frames]=result;
 assert.equal(base.height,384);assert.notEqual(atlas,base);assert.equal(atlas.height,624);
 assert.equal(frames.idle_s,fm.idle_s);assert.equal(frames.run_s,fm.run_s);assert.equal(frames.gSlam1_s,fm.gSlam1_s);
 for(const [row,dir] of ['s','se','e','ne','n','nw','w','sw'].entries()){
  for(const anim of ['atk1','atk2','atk3','bash']){
   const clip=frames[anim+'_'+dir];assert.equal(clip.length,9);
   const start=(8-row)%8;
   for(let f=0;f<9;f++){
    const i=row===0&&f===8?8:(start+f)%8;
    assert.deepEqual({...clip[f]},{x:(i%3)*80,y:384+Math.floor(i/3)*80,w:80,h:80});
   }
   assert.equal(new Set(clip.slice(0,8).map(f=>f.x+','+f.y)).size,8,'full upright revolution');
  }
 }
 assert.equal(fm.atk1_s,undefined);
});
test('spin starts at the first frame and completes all nine poses before recovery ends',()=>{
 const h=harness(),progress=[];
 for(let left=5;left>=1;left--)progress.push(h.api.progress('wSwing',left,16));
 for(let left=16;left>=1;left--)progress.push(h.api.progress('wRecover',left,16));
 assert.equal(progress[0],0);assert.ok(progress.every((p,i)=>i===0||p>=progress[i-1]));
 assert.equal(new Set(progress.map(p=>Math.min(8,Math.floor(p*9)))).size,9);
 assert.equal(h.api.progress('wWindup',10,16),0);
});
test('failed or malformed attack image keeps the original atlas usable',()=>{
 for(const fail of ['network','dimensions']){
  const h=harness(),base=h.canvas(),fm={};let result,count=0;
  h.api.apply(base,fm,(...args)=>{result=args;count++});
  if(fail==='network')h.images[0].onerror();else{h.images[0].naturalWidth=12;h.images[0].naturalHeight=12;h.images[0].onload()}
  assert.equal(result[0],base);assert.equal(result[1],fm);assert.equal(count,1);
 }
});
for(const entry of ['game.html','game-easy-test.html'])test(entry+': late attack atlas cannot overwrite a newly selected warrior',()=>{
 const src=readFileSync(new URL('../'+entry,import.meta.url),'utf8');
 const start=src.indexOf('function _loadCharAtlas('),end=src.indexOf('\n}',start)+2;
 const pending=[],attacks=[];
 const c=vm.createContext({_charIdx:1,CHAR_LIST:[{id:'exoduser_warrior'},{id:'exoduser_silvertail'}],localStorage:{setItem(){}},
  _load8Dir:(folder,w,h,cb)=>pending.push(cb),_shadePlayerAtlas(){},_applyMaskAtlas(){},
  SilvertailAttackRemaster:{apply:(atlas,fm,cb)=>attacks.push(cb)}});
 vm.runInContext(src.slice(start,end),c);c._loadCharAtlas(1);pending[0]('silver',{});
 assert.equal(attacks.length,1,'silvertail requests the attack extension');
 assert.equal(c._atlasMask,'silver','base character is available before the attack download');
 c._loadCharAtlas(0);pending[1]('warrior',{});attacks[0]('late silver',{});
 assert.equal(c._atlasMask,'warrior');
});
