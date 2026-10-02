// Preserved successful recovery keydown/keyup connected stdin harness; run from migration root.
// Only the read-only DOM helper import is relocated. Saved harness has not been rerun.
import fs from 'node:fs';import crypto from 'node:crypto';import vm from 'node:vm';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import {createDocument} from '../../../../team-followup-20261001/UIUX/inventory-dom/node-dom.mjs';
const {parse}=createRequire(process.cwd()+'/package.json')('acorn'),sha=s=>crypto.createHash('sha256').update(s).digest('hex'),startedUTC=new Date().toISOString(),results=[];
for(const file of ['game.html','game-easy-test.html']){
 const source=fs.readFileSync(file,'utf8'),f=new Map();let tabs,factory,keyArrow,keyUpArrow;
 for(const m of source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)){
  const tag=m[0].slice(0,m[0].indexOf('>'));if(/type=["']importmap["']/.test(tag))continue;
  for(const n of parse(m[1],{ecmaVersion:'latest',sourceType:/type=["']module["']/.test(tag)?'module':'script'}).body){
   if(n.type==='FunctionDeclaration')f.set(n.id.name,m[1].slice(n.start,n.end));
   if(n.type==='VariableDeclaration')for(const d of n.declarations){if(d.id.name==='_PANEL_TABS')tabs=m[1].slice(n.start,n.end);if(d.id.name==='_inventoryFocus')factory=m[1].slice(n.start,n.end);}
   if(n.type==='ExpressionStatement'&&n.expression.type==='CallExpression'&&n.expression.callee.name==='addEventListener'&&n.expression.arguments[0]?.value==='keyup'){const a=n.expression.arguments[1],text=m[1].slice(a.start,a.end);if(text.includes('K[e.code]=false;KH[e.code]=false;'))keyUpArrow=text;}
   if(n.type==='ExpressionStatement'&&n.expression.type==='CallExpression'&&n.expression.callee.name==='addEventListener'&&n.expression.arguments[0]?.value==='keydown'){
    const a=n.expression.arguments[1],text=m[1].slice(a.start,a.end);if(text.includes('K[e.code]=true;KH[e.code]=true;'))keyArrow=text;
   }
  }
 }
 assert(keyArrow,'actual global handler');const anchor='  // Focused panel controls own activation and focus traversal keys.';
 const guard="  if(['Space','Enter','NumpadEnter','Tab','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)&&e.target instanceof Element&&e.target.closest('.panel.on .panel-nav-tab'))return;\n";
 assert.equal(keyArrow.split(anchor).length,2);const candidate=keyArrow.replace(anchor,guard+anchor);
 const nav=f.get('_injectPanelNav').replace("const btn=document.createElement('div');","const btn=document.createElement('button');btn.type='button';").replace("btn.onclick=function(e){e.stopPropagation();if(t.id!==activeId)openPanel(t.id)};","btn.onclick=function(e){e.stopPropagation();if(t.id!==activeId){const focused=document.activeElement===btn;openPanel(t.id);const current=$(t.id)?.querySelector('.panel-nav-tab.active');if(focused&&current)current.focus({preventScroll:true});}};");
 function run(mode,code,location='skill-nav'){
  const document=createDocument(),base=document.createElement;
  document.createElement=tag=>{const n=base(tag),match=n.matches.bind(n),closest=n.closest.bind(n);
   n.matches=s=>/^\.[\w-]+(?:\.[\w-]+)+$/.test(s)?s.slice(1).split('.').every(c=>n.classList.contains(c)):match(s);
   n.closest=s=>s.split(',').map(part=>part.trim()).map(part=>{
    if(part==='.panel.on .panel-nav-tab')return n.classList.contains('panel-nav-tab')&&!!closest('.panel')?.classList.contains('on')?n:null;
    if(part==='#invPanel.on button')return n.tagName==='BUTTON'&&!!closest('#invPanel')?.classList.contains('on')?n:null;
    return closest(part);
   }).find(Boolean)||null;return n;};
  document.querySelectorAll=()=>[];const computed=document.defaultView.getComputedStyle;document.defaultView.getComputedStyle=n=>{const c=computed(n),p=n.closest('.panel');return p&&!p.classList.contains('on')?{...c,display:'none'}:c;};
  const el=(tag,id,parent=document.body)=>{const n=document.createElement(tag);n.id=id;parent.append(n);return n;};
  for(const id of ['settings','invPanel','forge','statPanel','skillPanel']){const p=el('div',id);p.className='panel';el('div',id+'-box',p).className='pbox';}
  const hud=el('button','hud-inv'),trace=[],K={},KH={},G={on:true,paused:false,forgeOpen:false,stage:0},P={s:'idle',skills:{},activeCtSk:null};
  const ctx=vm.createContext({document,Element:document.body.constructor,$:id=>document.getElementById(id),window:{},_cutSkipHolding:false,G,P,K,KH,BINDS:{},BINDS2:{},listeningBind:null,SKILL_SLOTS:Array(6).fill(null),ULT_SLOT:null,_L:(a,b)=>a,_T:s=>s,BGM:{play(){},stageKey(){return''}},renderInv:()=>{},renderSkillPanel:()=>{},renderSettings:()=>{},renderForge:()=>{},renderStatPanel:()=>{},_dispatchSkillSlot:()=>{trace.push('skill-fire');return true;}});
  vm.runInContext('let _skPopOwnsPause=false,_fuseSelId=null,_skExpandedId=null;\n'+tabs+'\n'+factory+'\n'+['openPanel','closeAllPanels','_panelBack'].map(n=>n==='_panelBack'?f.get(n).replace('if(op){closeAllPanels();return true}','if(op){const active=document.activeElement;closeAllPanels();if($(op).contains(active)&&document.activeElement===active)active.blur();return true}'):f.get(n)).join('\n')+'\n'+nav+'\nvar actualKeydown=('+ (mode==='source'?keyArrow:candidate)+');\nvar actualKeyup=('+keyUpArrow+');',ctx);
  hud.focus();ctx.openPanel('invPanel');const invTab=document.getElementById('invPanel').querySelector('.panel-nav').children[3];invTab.focus();invTab.onclick({stopPropagation(){}});
  const skill=document.getElementById('skillPanel'),tab=skill.querySelector('.panel-nav').children[1];
  let target=tab;if(location==='background'){ctx.closeAllPanels();target=hud;}else if(location==='closed-nav'){ctx.closeAllPanels();target=tab;}else if(location==='inv-nav'){ctx.openPanel('invPanel');target=document.getElementById('invPanel').querySelector('.panel-nav').children[3];}
  target.focus();let defaultPrevented=false;
  const event={code,repeat:false,ctrlKey:false,metaKey:false,target,preventDefault(){defaultPrevented=true;},stopPropagation(){}};
  if(location!=='pointer')ctx.actualKeydown(event);
  if(location==='pointer'||(code==='Enter'&&!defaultPrevented))target.onclick({stopPropagation(){}});
  ctx.actualKeyup(event);
  if(code==='Space'&&!defaultPrevented&&location!=='pointer')target.onclick({stopPropagation(){}});
  const transition={invOpen:document.getElementById('invPanel').classList.contains('on'),skillOpen:skill.classList.contains('on'),activePanel:document.activeElement.closest('.panel')?.id||'none'};
  ctx._panelBack();const returned={paused:G.paused,active:document.activeElement===document.body?'BODY':document.activeElement===hud?'HUD':'panel',hiddenFocus:!!document.activeElement.closest('.panel')};assert.equal(returned.paused,false);assert.equal(returned.hiddenFocus,false);
  const result={mode,code,location,transition,returned,paused:G.paused,defaultPrevented,K:!!K[code],KH:!!KH[code],gameSkillCalls:trace.length,navChildren:tab.children.length,targetConnected:target.isConnected};
  return result;
 }
 const cases=['Space','Enter'].map(code=>({before:run('source',code),after:run('candidate',code)}));
 for(const c of cases){assert.equal(c.after.transition.invOpen,true);assert.equal(c.after.transition.activePanel,'invPanel');assert.equal(c.after.KH,false);assert.equal(c.after.K,false);assert.equal(c.after.defaultPrevented,false);assert.equal(c.after.gameSkillCalls,0);assert.equal(c.before.gameSkillCalls,0);}assert.equal(cases[0].before.transition.skillOpen,true);
 const controls=['pointer'].map(location=>({before:run('source','Enter',location),after:run('candidate','Enter',location)}));for(const c of controls){const {mode:a,...b}=c.before,{mode:d,...e}=c.after;assert.deepEqual(b,e);}
 results.push({file,sourceSHA256:sha(source),globalKeydownSHA256:sha(keyArrow),original:keyArrow,candidate,guard,cases,controls,scope:'new connected Space/Enter keydown→keyup→actual onclick→Back + pointer control; native activation/computed panel visibility doubled; inherited pending nav/close patch, no original case rerun'});
}
console.log(JSON.stringify({startedUTC,endedUTC:new Date().toISOString(),results,productionApplied:false,runtimeAccepted:false,newFiles:0,sourceFunctions:'full global keydown + actual nav caller/open/close + inventory focus factory',inheritedNavMemoryCandidate:true,gamepad:'actual _gpUINav A click / B _panelBack read only; not executed',doubles:['DOM selectors/focus','native key event','G/P/K/KH and rendering/audio sinks'],initialFilesWritten:0}));

