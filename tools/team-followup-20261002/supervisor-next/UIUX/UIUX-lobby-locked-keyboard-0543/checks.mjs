// Current lobby Enter preview boundary: one locked card and one warrior control.
// Source execution only; native button default activation is an explicit host double.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {parse} from 'acorn';
import {createDocument} from '../../../../team-followup-20261001/UIUX/inventory-dom/node-dom.mjs';

const root='/Users/fordeargamers/Projects/exoduser-migration-20261001';
const own=path.dirname(fileURLToPath(import.meta.url));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const source=fs.readFileSync(path.join(root,'index.html'),'utf8');
const report={taskId:'UIUX-lobby-locked-keyboard-0543',provider:'Codex',
  chatId:'01a0faaf-8fd2-7083-b174-69c604bd58b0',supervisorChatId:'01a0fb1e-4ec3-7dd3-bba2-f87518e881fa',
  startedUTC:new Date().toISOString(),checkout:root,sourceSHA256:sha(source),node:process.version,
  sourceFragments:{},executions:[],errors:[],productionApplied:false,candidate:null,
  priorCompletedTests:{rerun:0,addedToNewCount:0},writes:0,Git:0,server:0,http:0,app:0,game:0,build:0,
  nativeUI:0,audio:0,storage:0,install:0,newSession:0,subagent:0,externalMessage:0,deletion:0,moves:0,
  limits:{nativeKeyboard:false,gamepad:false,SpaceExecuted:false,fullPage:false,
    media:false,traitsRendering:false,confirmationExecuted:false,actualSave:false,
    statement:'source PASS ≠ native keyboard/gamepad/runtime/HTTP/GPU/visual/audio/storage/product PASS'}};

function fragment(start,end){return {text:source.slice(start,end),lineStart:source.slice(0,start).split('\n').length,
  lineEnd:source.slice(0,end-1).split('\n').length,SHA256:sha(source.slice(start,end))};}
function sourceLine(marker){const i=source.indexOf(marker);assert.ok(i>=0,marker);return fragment(i,source.indexOf('\n',i));}
function collect(){
  const functions=new Map();let visuals;
  for(const match of source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)){
    const script=match[1];if(!script.trim())continue;
    const offset=match.index+match[0].indexOf('>')+1;
    // Acorn locates exact fragments; no old syntax test suite or full page execution.
    for(const node of parse(script,{ecmaVersion:'latest',sourceType:'module'}).body){
      if(node.type==='FunctionDeclaration')functions.set(node.id.name,fragment(offset+node.start,offset+node.end));
      if(node.type==='VariableDeclaration'&&node.declarations.some(d=>d.id.name==='CHAR_VISUALS'))visuals=fragment(offset+node.start,offset+node.end);
    }
  }
  assert.ok(visuals,'Actual CHAR_VISUALS not found');
  const names=['openVisualSelect','selectVisual','_visualSelectKeydown','_resetVisualInfoScroll','_visualConfirm','doCreateChar'];
  const parts=Object.fromEntries(names.map(name=>{assert.ok(functions.has(name),name);return [name,functions.get(name)];}));
  parts.CHAR_VISUALS=visuals;
  parts.keydownBinding=sourceLine("$('charVisualPop').addEventListener('keydown',_visualSelectKeydown);");
  parts.confirmBinding=sourceLine("$('visualCreateBtn').onclick=_visualConfirm;");
  parts.offlineLockGuard=sourceLine("    if(CHAR_VISUALS[_pendingVisualIdx]?.comingSoon){setStatus(_TL('출시 준비 중'),true);return}");
  assert.ok(parts._visualConfirm.text.trim().startsWith("function _visualConfirm(){\n  if(CHAR_VISUALS[_pendingVisualIdx]?.comingSoon)return;"));
  assert.ok(parts.doCreateChar.text.indexOf("if(CHAR_VISUALS[visualIdx]?.comingSoon)")<parts.doCreateChar.text.indexOf('fetch('));
  assert.ok(!parts._visualSelectKeydown.text.includes("e.key==='Enter'")&&!parts._visualSelectKeydown.text.includes("e.key===' '"));
  return parts;
}

function run(parts,kind,initial,targetIndex){
  const document=createDocument();document.documentElement={dir:'ltr'};
  const nodes={},trace=[],timers=[],counts={keydown:0,nativeDefaultClick:0,sourceClick:0,focus:0,
    fetch:0,localRead:0,localWrite:0,slotInsert:0,afterCreation:0,close:0,status:0};
  const create=document.createElement.bind(document);
  document.createElement=tag=>{
    const node=create(tag),baseMatches=node.matches.bind(node),baseFocus=node.focus.bind(node),baseSet=node.setAttribute.bind(node);
    node.getAttribute=name=>node.attrs[name]??null;
    node.setAttribute=(name,value)=>{baseSet(name,value);if(name==='data-vi')node.dataset.vi=String(value);};
    node.matches=selector=>selector.startsWith('.')?selector.slice(1).split('.').every(cls=>node.classList.contains(cls)):baseMatches(selector);
    node.listeners={};node.addEventListener=(type,callback)=>{(node.listeners[type]??=[]).push(callback);};
    node.focus=(...args)=>{counts.focus++;baseFocus(...args);trace.push({kind:'focus-host',id:node.id||node.dataset.vi});};
    node.click=()=>{if(node.disabled)return;counts.sourceClick++;trace.push({kind:'source-onclick',vi:node.dataset.vi??null});node.onclick?.();};
    node.scrollIntoView=()=>{};return node;
  };
  const add=(id,tag='div',parent=document.body)=>{const node=document.createElement(tag);node.id=id;nodes[id]=node;parent.appendChild(node);return node;};
  const pop=add('charVisualPop');pop.style.display='none';
  const body=add('csBody','div',pop);body.className='cs-body';
  for(const id of ['csLeft','csRight','csClsName','csCharName','csCharDesc'])add(id,'div',body);
  add('csPortrait','img',add('csStage','div',body));add('csReleaseLabel','span',body);
  add('visualGrid','div',pop);add('visualCancelBtn','button',pop);add('visualCreateBtn','button',pop);
  add('createModal');add('charName','input',nodes.createModal);add('createBtn','button',nodes.createModal);
  const trigger=add('trigger','button');trigger.focus();
  const omitted=['csTraits','csThumb','csAura','csScene','csIdleVid','csSceneVid'];
  const context=vm.createContext({document,$:id=>omitted.includes(id)?null:nodes[id]||null,
    _TL:text=>text,escHtml:text=>text,_pendingVisualIdx:initial,_visualPreviewSeq:0,_visualReturnFocus:null,
    _spawnEmbers:()=>{},setTimeout:(fn,delay)=>{timers.push({fn,delay});return timers.length;},clearTimeout:()=>{},
    _closeVisualSelect:()=>{counts.close++;},setStatus:()=>{counts.status++;},_afterCharacterCreated:()=>{counts.afterCreation++;},
    fetch:()=>{counts.fetch++;throw new Error('Real HTTP forbidden');},
    localStorage:{getItem:()=>{counts.localRead++;return null;},setItem:()=>{counts.localWrite++;},removeItem:()=>{counts.localWrite++;}},
    sb:{from:()=>({insert:()=>{counts.slotInsert++;throw new Error('Real slot insert forbidden');}})}});
  const actual=[parts.CHAR_VISUALS.text,...['openVisualSelect','selectVisual','_visualSelectKeydown','_resetVisualInfoScroll',
    '_visualConfirm','doCreateChar'].map(name=>parts[name].text),parts.keydownBinding.text,parts.confirmBinding.text].join('\n');
  new vm.Script(actual,{filename:'index.html:actual-preview-functions'}).runInContext(context);
  const visuals=vm.runInContext('CHAR_VISUALS.map((c,i)=>({index:i,id:c.id,name:c.name,comingSoon:!!c.comingSoon}))',context);
  assert.equal(visuals[0].id,'exoduser_warrior');assert.equal(visuals[0].comingSoon,false);
  assert.equal(visuals[1].id,'exoduser_silvertail');assert.equal(visuals[1].comingSoon,true);
  context.openVisualSelect();
  const cards=nodes.visualGrid.children,target=cards[targetIndex];
  assert.equal(cards.length,visuals.length);assert.equal(target.tagName,'BUTTON');assert.equal(target.type,'button');
  assert.equal(!!target.disabled,false,'Locked preview remains enabled; create action carries lock');
  assert.equal(document.activeElement,cards[initial]);assert.equal(context._visualReturnFocus,trigger);
  target.focus();
  const tree=()=>{const out=[];function walk(node){out.push(node);node.children.forEach(walk);}walk(document.body);return out;};
  const originalNodes=tree(),cardChildren=cards.map(card=>[...card.children]);
  const snapshot=label=>({label,pendingIndex:context._pendingVisualIdx,selectedID:visuals[context._pendingVisualIdx].id,
    selectedSlot:context._selectedSlot??null,createDisabled:!!nodes.visualCreateBtn.disabled,
    createText:nodes.visualCreateBtn.textContent,releaseLabel:nodes.csReleaseLabel.textContent,
    releaseLocked:pop.classList.contains('release-locked'),focusIndex:cards.indexOf(document.activeElement),
    returnFocusPreserved:context._visualReturnFocus===trigger,popDisplay:pop.style.display,
    nameModalShown:nodes.createModal.classList.contains('show'),nodeCount:tree().length,
    cardState:cards.map(c=>({vi:c.dataset.vi,locked:c.classList.contains('locked'),pressed:c.getAttribute('aria-pressed'),
      children:c.children.length,badge:c.children.find(n=>n.className==='cs-soon')?.textContent??null})),counts:{...counts}});
  const before=snapshot('before-keyboard-activate');trace.length=0;
  const e={key:'Enter',code:'Enter',target,isComposing:false,keyCode:13,repeat:false,prevented:false,stopped:false,
    preventDefault(){this.prevented=true;},stopPropagation(){this.stopped=true;}};
  trace.push({kind:'host-keydown',key:e.key,targetIndex});
  for(const listener of pop.listeners.keydown||[]){counts.keydown++;listener(e);}
  trace.push({kind:'source-keydown-return',prevented:e.prevented,stopped:e.stopped});
  const afterHandler=snapshot('after-actual-keydown-before-native-default');
  assert.equal(afterHandler.pendingIndex,initial);assert.equal(e.prevented,false);assert.equal(e.stopped,false);
  // Browser Enter→click default is modeled here, not claimed as native/OS measurement.
  if(!e.prevented&&target.tagName==='BUTTON'&&target.type==='button'&&!target.disabled){
    counts.nativeDefaultClick++;trace.push({kind:'host-native-button-default',key:'Enter'});target.click();
  }
  const after=snapshot('after-source-onclick-selectVisual');
  assert.equal(after.pendingIndex,targetIndex);assert.equal(after.focusIndex,targetIndex);
  assert.equal(after.nameModalShown,false);assert.equal(after.selectedSlot,null);assert.equal(after.returnFocusPreserved,true);
  assert.equal(after.cardState[targetIndex].pressed,'true');
  assert.equal(after.cardState.filter(c=>c.pressed==='true').length,1);
  assert.deepEqual(tree(),originalNodes);cards.forEach((card,i)=>assert.deepEqual(card.children,cardChildren[i]));
  for(const id of ['csClsName','csCharName','csCharDesc','csReleaseLabel','visualCreateBtn'])assert.equal(nodes[id].children.length,0,id+' remains leaf');
  for(const key of ['fetch','localRead','localWrite','slotInsert','afterCreation','close','status'])assert.equal(after.counts[key]-before.counts[key],0,key);
  assert.equal(after.counts.keydown-before.counts.keydown,1);assert.equal(after.counts.nativeDefaultClick-before.counts.nativeDefaultClick,1);
  assert.equal(after.counts.sourceClick-before.counts.sourceClick,1);assert.equal(after.counts.focus-before.counts.focus,0);
  if(kind==='locked'){
    assert.equal(after.releaseLocked,true);assert.equal(after.createDisabled,true);
    assert.equal(after.releaseLabel,'출시 준비 중');assert.equal(after.createText,'출시 준비 중');
    assert.equal(after.cardState[targetIndex].badge,'출시 준비 중');
  }else{
    assert.equal(after.releaseLocked,false);assert.equal(after.createDisabled,false);
    assert.equal(after.releaseLabel,'');assert.equal(after.createText,'생성');assert.equal(after.cardState[targetIndex].badge,null);
  }
  return {case:kind,key:'Enter',target:JSON.parse(JSON.stringify(visuals[targetIndex])),initialIndex:initial,
    before,afterActualKeydown:afterHandler,after,activationTrace:trace,verdict:'PASS',
    nativeDefault:'host double only; actual source keydown does not cancel; actual onclick/selectVisual execute',
    existingNodeIdentityPreserved:true,actualCreateConfirmCalls:0,saveSinkCalls:0,
    sourceFunctionsSHA256:sha(actual),omittedDOM:omitted,
    delayedTimersExecuted:0,mediaExecuted:false,traitsParentReplacementExecuted:false};
}

try{
  assert.equal(fs.realpathSync(root),root);
  assert.equal(fs.realpathSync(own),path.join(root,'tools/team-followup-20261002/supervisor-next/UIUX/UIUX-lobby-locked-keyboard-0543'));
  assert.equal(fs.realpathSync(path.join(own,'TASK.md')),path.join(own,'TASK.md'));
  assert.ok(fs.readdirSync(own).every(n=>['TASK.md','checks.mjs','evidence.json','result.md'].includes(n)));
  const parts=collect();report.sourceFragments=parts;
  report.executions.push(run(parts,'locked',0,1));
  report.executions.push(run(parts,'warrior-control',1,0));
  report.counts={newInputCases:2,lockedKeyboardActivation:1,warriorKeyboardControl:1,
    sourcePASS:2,sourceRED:0,candidateRuns:0,previousRerun:0,previousAdded:0};
  report.verdict='NO-FIX';
}catch(error){report.errors.push({message:error.message,stack:error.stack});process.exitCode=1;report.verdict='UNKNOWN';}
report.sourceAfterSHA256=sha(fs.readFileSync(path.join(root,'index.html')));
assert.equal(report.sourceAfterSHA256,report.sourceSHA256,'index.html changed during fixture');
report.finishedUTC=new Date().toISOString();report.finishedKST=new Date().toLocaleString('sv-SE',{timeZone:'Asia/Seoul'})+' KST';
console.log(JSON.stringify(report,null,2));
