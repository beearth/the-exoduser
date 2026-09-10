import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {parse} from 'acorn';
const html=readFileSync(new URL('../game.html',import.meta.url),'utf8');
const functions=new Map();
for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)){
  if(!m[1].includes('function ')||m[0].startsWith('<script type="module"'))continue;
  for(const n of parse(m[1],{ecmaVersion:'latest'}).body){
    if(n.type==='FunctionDeclaration')functions.set(n.id.name,m[1].slice(n.start,n.end));
  }
}
for(const [saved,previous,expected] of [[{charIdx:0},1,0],[{charIdx:1},0,1],[{},1,0],[{charIdx:99},1,0]]){
  test('metadata-only character overrides previous skin '+JSON.stringify([saved,previous]),()=>{
    const ctx=vm.createContext({_charIdx:previous,CHAR_LIST:[{},{}]});
    ctx._loadCharAtlas=idx=>{ctx._charIdx=idx;};
    vm.runInContext(functions.get('dbRestore'),ctx);
    assert.equal(ctx.dbRestore(saved),false,'metadata does not count as restored player progress');
    assert.equal(ctx._charIdx,expected);
  });
}
test('late previous-character atlas cannot replace the selected character',()=>{
  const callbacks=[];
  const ctx=vm.createContext({_charIdx:1,CHAR_LIST:[{folder:'warrior'},{folder:'silvertail'}],localStorage:{setItem(){}},
    _load8Dir:(folder,w,h,cb)=>callbacks.push({folder,cb}),_applyMaskAtlas(){},_atlasMask:null,_atlasMaskFm:null,_atlasBare:null,_atlasBareFm:null});
  vm.runInContext(functions.get('_loadCharAtlas'),ctx);
  ctx._loadCharAtlas(1);ctx._loadCharAtlas(0);
  callbacks[1].cb('warrior atlas',{});callbacks[0].cb('stale silvertail atlas',{});
  assert.equal(ctx._atlasMask,'warrior atlas');assert.equal(ctx._charIdx,0);
});
for(const mode of [{stage:0,done:false,force:false,seq:'INTRO'},{stage:0,done:true,force:false,seq:null},{stage:2,done:false,force:false,seq:null},{stage:0,done:true,force:true,seq:'PRO'}]){
  test('Nemesis entry preserves completed saves and explicit previews '+JSON.stringify(mode),()=>{
    let voicePlays=0;const music=[];
    const ctx=vm.createContext({console,_bossTestReq:-1,_wantPlateTest:()=>false,_forceCutscene:mode.force,G:{stage:mode.stage,_cutsceneDone:mode.done},P:{},
      _cutSeq:null,_cutsceneState:null,PROLOGUE_LINES:{ko:[]},INTRO_CUTSCENE_LINES:{ko:[]},_getCutsceneImg(){},_proVoiceStop(){},
      setInterval:()=>0,clearInterval(){},setTimeout:fn=>fn(),performance:{now:()=>0},$:()=>null,
      BGM:{fadeOut(){},play:key=>music.push(key),stageKey:()=> 'hell1'},_proVoice:{play(){voicePlays++;return Promise.resolve();}},_PRO_VOICE_OFS:.3});
    vm.runInContext(functions.get('_startIntroCutscene'),ctx);ctx._startIntroCutscene();
    assert.equal(ctx._cutSeq,mode.seq);
    assert.equal(ctx._cutsceneState,mode.seq?'INTRO_CUTSCENE':null);
    assert.equal(voicePlays,mode.force?1:0,'only explicit legacy preview plays old Korean story');
    assert.equal(ctx.G.on,!mode.seq);
    assert.equal(music.at(-1),mode.seq==='INTRO'?'cutscene_nemesis':mode.seq==='PRO'?'cutscene_prologue':'hell1');
  });
}
test('legacy preview switches from war score to Nemesis theme at INTRO',()=>{
  const music=[];
  const ctx=vm.createContext({_cutSeq:'PRO',performance:{now:()=>0},_proVoiceStop(){},BGM:{_curKey:'cutscene_prologue',play:key=>music.push(key)}});
  vm.runInContext(functions.get('_cutsceneEnd'),ctx);ctx._cutsceneEnd();
  assert.equal(ctx._cutSeq,'INTRO');assert.deepEqual(music,['cutscene_nemesis']);
});
