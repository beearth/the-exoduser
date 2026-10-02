// Preserved successful CH1-1 stdin source harness. Run from migration checkout root.
// Only the read-only DOM helper import is relocated; saved harness has not been rerun.
import fs from 'node:fs';import crypto from 'node:crypto';import vm from 'node:vm';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import {createDocument} from '../../../../team-followup-20261001/UIUX/inventory-dom/node-dom.mjs';
const {parse}=createRequire(process.cwd()+'/package.json')('acorn'),sha=s=>crypto.createHash('sha256').update(s).digest('hex'),startedUTC=new Date().toISOString(),results=[];
for(const file of ['game.html','game-easy-test.html']){
 const source=fs.readFileSync(file,'utf8'),f=new Map();let tabs,factory;
 for(const m of source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)){
  const tag=m[0].slice(0,m[0].indexOf('>'));if(/type=["']importmap["']/.test(tag))continue;const ast=parse(m[1],{ecmaVersion:'latest',sourceType:/type=["']module["']/.test(tag)?'module':'script'});
  for(const n of ast.body){
   if(n.type==='FunctionDeclaration')f.set(n.id.name,m[1].slice(n.start,n.end));
   if(n.type==='VariableDeclaration')for(const d of n.declarations){
    if(d.id.name==='_PANEL_TABS')tabs=m[1].slice(n.start,n.end);
    if(d.id.name==='_inventoryFocus')factory=m[1].slice(n.start,n.end);
   }
  }
 }
 const old=f.get('_injectPanelNav'),createOld="const btn=document.createElement('div');",handlerOld="btn.onclick=function(e){e.stopPropagation();if(t.id!==activeId)openPanel(t.id)};";
 assert.equal(old.split(createOld).length,2);assert.equal(old.split(handlerOld).length,2);
 const backOld=f.get('_panelBack'),backAnchor="if(op){closeAllPanels();return true}";assert.equal(backOld.split(backAnchor).length,2);const backCandidate=backOld.replace(backAnchor,"if(op){const active=document.activeElement;closeAllPanels();if($(op).contains(active)&&document.activeElement===active)active.blur();return true}");
 const candidate=old.replace(createOld,"const btn=document.createElement('button');btn.type='button';").replace(handlerOld,"btn.onclick=function(e){e.stopPropagation();if(t.id!==activeId){const focused=document.activeElement===btn;openPanel(t.id);const current=$(t.id)?.querySelector('.panel-nav-tab.active');if(focused&&current)current.focus({preventScroll:true});}};");
 function run(mode,keyboard){
  const document=createDocument(),base=document.createElement;document.createElement=tag=>{const n=base(tag),matches=n.matches.bind(n);n.matches=s=>/^\.[\w-]+(?:\.[\w-]+)+$/.test(s)?s.slice(1).split('.').every(c=>n.classList.contains(c)):matches(s);return n;};
  document.querySelectorAll=()=>[];
  const el=(tag,id,parent=document.body)=>{const n=document.createElement(tag);n.id=id;parent.append(n);return n;};
  const hud=el('button','hud-inventory');for(const id of ['settings','invPanel','forge','statPanel','skillPanel']){const p=el('div',id),box=el('div',id+'-box',p);box.className='pbox';}
  const trace=[],G={paused:false,forgeOpen:false,stage:0},ctx=vm.createContext({document,$:id=>document.getElementById(id),_L:(a,b)=>a,_T:s=>s,G,BGM:{play:()=>{},stageKey:()=>''},renderInv:()=>trace.push('renderInv'),renderSkillPanel:()=>trace.push('renderSkillPanel'),renderSettings:()=>{},renderForge:()=>{},renderStatPanel:()=>{}});
  vm.runInContext('let _skPopOwnsPause=false,_fuseSelId=null,_skExpandedId=null;\n'+tabs+'\n'+factory+'\n'+['closeAllPanels','openPanel'].map(n=>f.get(n)).join('\n')+'\n'+(mode==='source'?old:candidate)+'\n'+(mode==='source'?backOld:backCandidate),ctx);
  hud.focus();ctx.openPanel('invPanel');
  const panel=document.getElementById('invPanel'),nav=panel.querySelector('.panel-nav'),tab=nav.children[3];assert.equal(tab.dataset.label,'스킬');
  // Model sequential focusability explicitly; Node's unrestricted focus() does not prove DIV keyboard reachability.
  const sequentialEligible=tab.tagName==='BUTTON'||(Number.isInteger(tab.tabIndex)&&tab.tabIndex>=0);
  if(keyboard&&sequentialEligible)tab.focus();
  const hadKeyboardFocus=document.activeElement===tab;
  // Existing pointer click is a direct real onclick call; browser native keyboard activation is a host double.
  if(!keyboard||sequentialEligible)tab.onclick({stopPropagation(){trace.push('stop');}});
  const skill=document.getElementById('skillPanel'),current=skill.querySelector('.panel-nav-tab.active');
  const observed={mode,keyboard,tabTag:tab.tagName,sequentialEligible,hadKeyboardFocus,oldTabConnected:tab.isConnected,invOpen:panel.classList.contains('on'),skillOpen:skill.classList.contains('on'),paused:G.paused,active:document.activeElement===hud?'HUD':document.activeElement===current?'new-active-skill-tab':document.activeElement===document.body?'BODY':'other',trace};
  observed.passed=keyboard?observed.skillOpen&&observed.active==='new-active-skill-tab':observed.skillOpen&&observed.active==='HUD';const closed=ctx._panelBack();observed.return={handled:closed,paused:G.paused,skillOpen:skill.classList.contains('on'),invOpen:panel.classList.contains('on'),active:document.activeElement===hud?'HUD':document.activeElement===document.body?'BODY':'closed-panel-node',hiddenSkillFocus:skill.contains(document.activeElement)};assert.equal(observed.return.paused,false);assert.equal(observed.return.hiddenSkillFocus,false);return observed;
 }
 const before=run('source',true),after=run('candidate',true),pointerBefore=run('source',false),pointerAfter=run('candidate',false);
 assert.equal(before.passed,false);assert.equal(after.passed,true);assert.equal(pointerBefore.passed,true);assert.equal(pointerAfter.passed,true);assert.deepEqual(pointerBefore.trace,pointerAfter.trace);
 results.push({file,sourceSHA256:sha(source),fragments:['_injectPanelNav','openPanel','closeAllPanels'].map(name=>({name,sha256:sha(f.get(name))})),factorySHA256:sha(factory),tabsSHA256:sha(tabs),original:old,candidate,backOld,backCandidate,before,after,pointerBefore,pointerAfter});
}
console.log(JSON.stringify({startedUTC,endedUTC:new Date().toISOString(),task:'UIUX-milestone-inventory-skill-nav-memory',results,productionApplied:false,runtimeAccepted:false,newFiles:0,doubles:['node-dom plus compound class selectors','sequential keyboard eligibility/activation','renderInv/renderSkillPanel and other renderer sinks','G/BGM','document outline query empty'],actualFunctions:['inventory focus full factory begin/close','_injectPanelNav','openPanel','closeAllPanels','_panelBack'],excluded:['plus/minus guards','previous Tab/lobby focus conditions','native game','save','skill costs']}));

