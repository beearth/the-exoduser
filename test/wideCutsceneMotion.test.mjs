import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../game.html',import.meta.url),'utf8');
const render=source.slice(source.indexOf('function _renderIntroCutscene(){'),source.indexOf('// ═══ 1랩 시작 인트로 연출'));
function frame(width){
 const calls=[],cx=new Proxy({fillStyle:'',globalAlpha:1},{get(o,k){return k in o?o[k]:(...args)=>{calls.push([k,o.fillStyle,...args]);return {addColorStop(){}};};}});
 const ln={img:'prologue/p01.jpg',narr:true,text:'테스트',dur:30000,cam:{zs:1,ze:1},vfx:{}};
 const ctx={_cutsceneState:'INTRO_CUTSCENE',_cutSkipHolding:false,_cutSkipLastT:0,_cutLineIdx:0,_cutLineStartMs:0,_cutsceneIdx:0,
 _cutVibDone:false,_cutWaitInput:false,_cutSeq:'INTRO',_cutC:{width,height:1080,style:{}},C:{width,height:1080},_cutX:cx,
 _cutsceneGetLines:()=>[ln],performance:{now:()=>2000},OPT:{lang:'ko'},_ease:{linear:t=>t},_getCutsceneImg:()=>({complete:true,naturalWidth:3840,naturalHeight:1080}),
 _cutShake:()=>({x:0,y:0}),_cutColorGrade(){},_cutVignette(){},_T:x=>x,_CUT_SKIP_DUR:2000,_cutSkipHold:0,
 ExoduserI18n:{wrapText:x=>[x]},
 globalThis:null};ctx.globalThis=ctx;ctx.FullscreenArt={drawAtmosphere:(...a)=>calls.push(['atmosphere',...a.slice(1)])};
 vm.runInNewContext(render+'\n_renderIntroCutscene();',ctx);
 return calls;
}
test('cutscene atmosphere spans the real viewport on 16:9, 21:9 and 32:9',()=>{
 for(const w of [1920,2560,3840])assert.ok(frame(w).some(c=>c[0]==='atmosphere'&&c[1]===w&&c[2]===1080));
});
test('narration shading does not leave vertical brightness seams at the safe-area edges',()=>{
 const calls=frame(3840);
 assert.ok(calls.some(c=>c[0]==='fillRect'&&c[1]==='rgba(0,0,0,0.35)'&&c[4]===3840&&c[5]===1080));
});

test('the actual game consumer stops added motion when a fast GPU uses atmosphere-off settings',()=>{
 let policy;
 const line=source.split(/\r?\n/).find(x=>x.startsWith('globalThis.FullscreenArt?.setMotionPolicy'));
 const context={FullscreenArt:{setMotionPolicy(fn){policy=fn;}},_hwTier:'S',OPT:{atmos:0}};
 vm.runInNewContext(line,context);
 assert.equal(policy(),false);
 context.OPT.atmos=2;assert.equal(policy(),true);
 context._hwTier='C';assert.equal(policy(),false);
});
