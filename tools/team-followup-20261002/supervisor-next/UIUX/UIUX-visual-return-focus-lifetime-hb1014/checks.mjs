import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {createDocument} from '../../../../team-followup-20261001/UIUX/inventory-dom/node-dom.mjs';
const root=fileURLToPath(new URL('../../../../../',import.meta.url));
const require=createRequire(root+'package.json'),{parse}=require('acorn');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const startedUTC=new Date().toISOString(),source=fs.readFileSync(root+'index.html','utf8');
const functions=new Map();
for(const match of source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)){
  const offset=match.index+match[0].indexOf('>')+1;
  for(const node of parse(match[1],{ecmaVersion:'latest',sourceType:'module'}).body){
    if(node.type==='FunctionDeclaration')functions.set(node.id.name,{text:source.slice(offset+node.start,offset+node.end),line:source.slice(0,offset+node.start).split('\n').length});
  }
}
const names=['_closeVisualSelect','openVisualSelect','stopMediaVideo','_closeCreationOverlays','_visualConfirm','_goLogin','_goCinematic','_goLobby','showLobby'];
for(const name of names)assert(functions.has(name),name);
const original=functions.get('_closeVisualSelect').text;
const old='  if(restoreFocus&&target&&target.isConnected)target.focus({preventScroll:true});';
const replacement=`  if(restoreFocus&&target&&target.isConnected){
    try{
      if(!target.disabled&&!target.closest('[hidden]')&&target.getClientRects().length&&getComputedStyle(target).visibility==='visible')target.focus({preventScroll:true});
    }catch(e){}
  }`;
assert.equal(original.split(old).length,2,'unique owned anchor');
const candidate=original.replace(old,replacement);
function run(mode,kind){
  const document=createDocument(),trace=[],el=(tag,id,parent=document.body)=>{const n=document.createElement(tag);n.id=id;parent.append(n);return n;};
  const holder=el('div','holder'),target=el('button','opener',holder),pop=el('div','charVisualPop'),grid=el('div','visualGrid',pop);
  el('button','visualCancelBtn',pop);pop.style.display='none';
  const media=['csIdleVid','csSceneVid'].map(id=>{
    const v=el('video',id,pop);v.classList.add('on');v.setAttribute('src',id+'.webm');v.setAttribute('poster',id+'.png');v._csT=id+'-timer';v.onerror=()=>{};v.oncanplay=()=>{};v.paused=false;v.currentTime=9;v.muted=false;v.volume=1;
    v.pause=()=>{v.paused=true;trace.push('pause:'+id);};v.load=()=>trace.push('load:'+id);return v;
  });
  // Explicit layout double: no browser layout is claimed. Hidden ancestors remove the synthetic box.
  target.getClientRects=()=>document.defaultView.getComputedStyle(target).display==='none'?[]:[{width:80,height:24}];
  target.focus();
  const nativeDoubleFocus=target.focus.bind(target);let focusCalls=0,options=null;
  target.focus=opts=>{focusCalls++;options={...opts};trace.push('focus:opener');if(kind==='throw')throw new Error('fixture-focus-throw');nativeDoubleFocus(opts);};
  const context=vm.createContext({document,$:id=>document.getElementById(id),getComputedStyle:document.defaultView.getComputedStyle,clearTimeout:id=>trace.push('clear:'+id),CHAR_VISUALS:[{name:'fixture'}],_TL:s=>s,_spawnEmbers:()=>{},_resetVisualInfoScroll:()=>{},selectVisual:()=>grid.children[0].classList.add('sel')});
  vm.runInContext('let _visualReturnFocus=null,_visualPreviewSeq=0,_pendingVisualIdx=0;\n'+functions.get('stopMediaVideo').text+'\n'+functions.get('openVisualSelect').text+'\n'+(mode==='source'?original:candidate),context);
  vm.runInContext('openVisualSelect()',context);
  assert.equal(vm.runInContext('_visualReturnFocus',context),target);
  assert.equal(pop.contains(document.activeElement),true);
  // Changes occur after the complete real opener captures the target.
  if(kind==='disabled')target.disabled=true;
  if(kind==='hidden')target.hidden=true;
  if(kind==='ancestor-display')holder.style.display='none';
  if(kind==='visibility')target.style.visibility='hidden';
  let escaped=null;try{vm.runInContext('_closeVisualSelect({restoreFocus:true})',context);}catch(error){escaped=error.message;}
  const observed={mode,kind,focusCalls,options,escaped,active:document.activeElement.id||document.activeElement.tagName,popupDisplay:pop.style.display,sequence:vm.runInContext('_visualPreviewSeq',context),returnCleared:vm.runInContext('_visualReturnFocus===null',context),media:media.map(v=>({id:v.id,paused:v.paused,currentTime:v.currentTime,muted:v.muted,volume:v.volume,timer:v._csT,onerror:v.onerror,oncanplay:v.oncanplay,on:v.classList.contains('on'),srcPresent:'src'in v.attrs,posterPresent:'poster'in v.attrs})),trace};
  assert.equal(observed.popupDisplay,'none');assert.equal(observed.sequence,1);assert.equal(observed.returnCleared,true);
  for(const v of observed.media)assert.deepEqual(v,{id:v.id,paused:true,currentTime:0,muted:true,volume:0,timer:null,onerror:null,oncanplay:null,on:false,srcPresent:false,posterPresent:false});
  assert.deepEqual(trace.slice(0,6),['clear:csIdleVid-timer','pause:csIdleVid','load:csIdleVid','clear:csSceneVid-timer','pause:csSceneVid','load:csSceneVid']);
  observed.safetyPassed=kind==='valid'?escaped===null&&focusCalls===1&&observed.active==='opener':escaped===null&&(kind==='throw'||focusCalls===0);
  return observed;
}
const cases=[];
for(const kind of ['disabled','hidden','ancestor-display','visibility','throw','valid']){
  const before=run('source',kind),after=run('candidate',kind);
  assert.equal(before.safetyPassed,kind==='valid');assert.equal(after.safetyPassed,true);
  if(kind==='valid'){const {mode:a,...b}=before,{mode:c,...d}=after;assert.deepEqual(b,d);assert.deepEqual(after.options,{preventScroll:true});}
  cases.push({kind,before,after});
}
const inputPaths=['AGENTS.md','tools/team-followup-20261002/continuous/COMMON.md','docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md','docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/PROVIDER-HALVES-20261002.md','docs/3.1 ui hud 디자인/UI_UX_IMPROVEMENT_PROJECT_20260930.md','docs/3.1 ui hud 디자인/캐릭터선택_리모델링_기획서.md','docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md','tools/team-followup-20261001/UIUX/inventory-dom/node-dom.mjs'];
console.log(JSON.stringify({taskId:'UIUX-visual-return-focus-lifetime-hb1014',provider:'Codex',chatId:'01a0faaf-8fd2-7083-b174-69c604bd58b0',startedUTC,endedUTC:new Date().toISOString(),root,sourceSHA:sha(source),checksSHA:sha(fs.readFileSync(fileURLToPath(import.meta.url))),inputs:inputPaths.map(path=>({path,sha256:sha(fs.readFileSync(root+path))})),fragments:names.map(name=>({name,line:functions.get(name).line,sha256:sha(functions.get(name).text),executed:['_closeVisualSelect','openVisualSelect','stopMediaVideo'].includes(name)})),cancelBinding:source.split('\n').find(line=>line.includes("$('visualCancelBtn').onclick=")),original,candidate,cases,productionApplied:false,runtimeAccepted:false,HEAD:'UNKNOWN',Changes:'UNKNOWN'}));
