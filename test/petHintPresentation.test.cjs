'use strict';
// Actual subtitle functions, timer, settings rebind callback and draw entry.
// DOM leaves, translation values, storage and audio are controlled fixtures;
// this does not prove native rendering, whole-scene input or audible playback.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {parseExpressionAt}=require('acorn');
const root=process.env.EXODUSER_TEST_SOURCE_DIR||path.resolve(__dirname,'..');
const plain=x=>JSON.parse(JSON.stringify(x));
function fixture(file){
 const source=fs.readFileSync(path.join(root,file),'utf8');
 const fn=n=>{const a=source.indexOf('function '+n+'(');return a<0?null:source.slice(a,parseExpressionAt(source,a,{ecmaVersion:'latest'}).end)};
 const constant=n=>{const pre='const '+n+'=',a=source.indexOf(pre);assert(a>=0,n);const end=parseExpressionAt(source,a+pre.length,{ecmaVersion:'latest'}).end;return source.slice(a,end+1)};
 let writes=0;const node={children:[],style:{}};let value='';Object.defineProperty(node,'textContent',{get(){return value},set(x){value=x;writes++}});
 const dom={petSubtitle:{style:{}},petPortrait:{src:''},petBubbleTxt:node};
 const c=vm.createContext({dom,document:{addEventListener(n,f){c.listeners[n]=f},removeEventListener(n,f){if(c.listeners[n]===f)delete c.listeners[n]}},window:{},listeners:{},localStorage:{setItem(k,v){c.saved.push([k,v])}},saved:[],sounds:[],renders:0,$:n=>dom[n],_T:s=>c.lang==='en'?({'쉬프트! 사슬기동은 이동기야!':'Shift! Chain movement is a movement skill!','1번! 가시덫으로 적 묶어!':'1! Bind enemies with spike traps!','응답':'Reply'})[s]||'EN:'+s:s,_petSfx:(...a)=>c.sounds.push(a),_DEMO_MODE:false,G:{stage:0,bossAlive:false,paused:false},P:{},_dtSp:1,_petDlgCD:{},_petTierCD:[0,0,0,0,0,0],lang:'ko',_gpActive:true,SKILL_SLOTS:['spikeTrap',null,null,null],X:{},renderSettings(){c.renders++},keyBtn:{isConnected:true,setAttribute(){}},_gpBtnNames:{4:'LB',10:'L3'},_gpActNames:{4:'Chain',10:'Pick up'}});
 const run=s=>vm.runInContext(s,c);
 for(const n of ['_PAD_GLYPH_KO','_PAD_GLYPH_KEY','_PET_OP_MAX','_petBubble','_GP_KEY_DEFAULT'])run(constant(n));
 run('let _GP_KEY=Object.assign({},_GP_KEY_DEFAULT),_GP_KEYIDX={};');
 for(const n of ['_petPadMappedHint','_padifyHint','_petBubbleText','_petBubbleShow','_petSay','_refreshPetBubbleLanguage','_updatePetBubble','_rebuildGpKeyIdx','_saveGpKeyMap','_resetGpKeyMap'])if(fn(n))run(fn(n));
 if(fn('_refreshPetBubbleInput')){
  const a=source.indexOf('const _petHintView='),b=source.indexOf('function _refreshPetBubbleInput(',a);run(source.slice(a,b));run(fn('_refreshPetBubbleInput'));
 }
 const draw=fn('draw'),begin=draw.indexOf('  if(!X)return;'),end=draw.indexOf('// 유니',begin);assert(begin>0&&end>begin);
 run('function display(){'+draw.slice(begin,end)+'}');
 const settings=fn('renderSettings'),pre='keyBtn.onclick=(function(i)',a=settings.indexOf(pre);assert(a>=0);const start=a+'keyBtn.onclick=('.length,endFn=parseExpressionAt(settings,start,{ecmaVersion:'latest'}).end;
 const rebind=(button,key)=>{run('keyBtn.onclick=('+settings.slice(start,endFn)+')('+button+');');c.keyBtn.onclick({stopPropagation(){}});c.listeners.keydown({code:key,repeat:false,preventDefault(){},stopPropagation(){}})};
 const snap=()=>plain(run('({bubble:_petBubble,cd:_petDlgCD,tiers:_petTierCD,map:_GP_KEY,index:_GP_KEYIDX,opacity:dom.petSubtitle.style.opacity,style:dom.petSubtitle.style,portrait:dom.petPortrait,sounds:sounds})'));
 const say=(txt='쉬프트! 사슬기동은 이동기야!',who='cat',pair)=>c._petSay('fixture',who,txt,5,pair?'crow':undefined,pair,4);
 const refresh=()=>{if(c._refreshPetBubbleLanguage)c._refreshPetBubbleLanguage()};
 return{c,run,say,refresh,display:()=>c.display(),node,dom,snap,rebind,writes:()=>writes,source};
}
for(const file of ['game.html','game-easy-test.html']){
 test(file+' actual rebind changes Shift/R hints without changing other tokens',()=>{
  const w=fixture(file);assert.equal(w.c._padifyHint('Shift R Q E X STR DEX R1'),'LB L3 Ⓨ Ⓧ LT+RT STR DEX R1');
  w.rebind(4,'KeyR');w.rebind(10,'ShiftLeft');
  assert.equal(w.c._padifyHint('쉬프트 Shift R Q E X STR DEX R1'),'L3 L3 LB Ⓨ Ⓧ LT+RT STR DEX R1');
  assert.equal(w.c.saved.length,2);assert.equal(w.c.renders,2);
  w.rebind(10,'KeyV');assert.equal(w.c._padifyHint('쉬프트 Shift R'),'쉬프트 Shift LB');
  w.c._resetGpKeyMap();assert.equal(w.c._padifyHint('Shift R'),'LB L3');
 });
 test(file+' visible hint follows live input mode and actual settings rebind',()=>{
  const w=fixture(file);w.say();for(let i=0;i<37;i++)w.c._updatePetBubble();w.display();
  assert(w.node.textContent.startsWith('LB!'));const before=w.snap();w.c._gpActive=false;w.display();assert(w.node.textContent.startsWith('쉬프트!'));assert.deepEqual(w.snap(),before);
  w.c._gpActive=true;w.rebind(4,'KeyR');w.rebind(10,'ShiftLeft');const remapped=w.snap();w.display();assert(w.node.textContent.startsWith('L3!'));assert.deepEqual(w.snap(),remapped);
  const writes=w.writes();for(let i=0;i<50;i++)w.display();assert.equal(w.writes(),writes);
 });
 test(file+' assigned spike-trap slot follows in-place slot movement',()=>{
  const w=fixture(file);w.c._gpActive=false;w.say('1번! 가시덫으로 적 묶어!');w.display();assert(w.node.textContent.startsWith('1번!'));
  w.c.SKILL_SLOTS[0]=null;w.c.SKILL_SLOTS[2]='spikeTrap';const before=w.snap();w.display();assert(w.node.textContent.startsWith('3번!'));assert.deepEqual(w.snap(),before);
  w.c._gpActive=true;w.display();assert(w.node.textContent.startsWith('LT+Ⓨ!'));w.c.SKILL_SLOTS[2]=null;w.c.SKILL_SLOTS[3]='spikeTrap';w.display();assert(w.node.textContent.startsWith('LT+Ⓧ!'));
 });
 test(file+' language refresh preserves actual fading subtitle, portrait, timer and audio',()=>{
  const w=fixture(file);w.say('쉬프트! 사슬기동은 이동기야!','cat','응답');for(let i=0;i<177;i++)w.c._updatePetBubble();const before=w.snap();assert.notEqual(Number(before.opacity),.6);
  w.c.lang='en';w.refresh();assert(w.node.textContent.startsWith('LB!'));assert.match(w.node.textContent,/Chain movement/);
  const after=w.snap();assert.equal(after.opacity,before.opacity);assert.equal(after.bubble.t,before.bubble.t);assert.equal(after.bubble.mt,before.bubble.mt);assert.equal(after.bubble.sourceTxt,before.bubble.sourceTxt);assert.equal(after.bubble.pair.sourceTxt,'응답');assert.equal(after.bubble.pair.txt,'Reply');assert.deepEqual(after.sounds,before.sounds);assert.deepEqual(after.portrait,before.portrait);assert.deepEqual(after.style,before.style);
 });
 test(file+' pair timing and single follow-up sound remain unchanged',()=>{
  const w=fixture(file);w.say('첫 대사','cat','응답');for(let i=0;i<299;i++){w.c._updatePetBubble();w.display()}assert.equal(w.snap().bubble.t,1);assert.equal(w.c.sounds.length,1);
  w.c._updatePetBubble();w.display();assert.equal(w.snap().bubble.who,'crow');assert.equal(w.snap().bubble.t,240);assert.equal(w.snap().bubble.pair,null);assert.equal(w.c.sounds.length,2);
  for(let i=0;i<240;i++){w.c._updatePetBubble();w.display()}assert.equal(w.snap().opacity,'0');assert.equal(w.c.sounds.length,2);
 });
 test(file+' renderer preserves child nodes and recovers a missing subtitle leaf',()=>{
  const w=fixture(file);w.say();w.display();const original=w.node.textContent,child={id:'preserve'};w.node.children.push(child);w.c._gpActive=false;w.display();assert.equal(w.node.textContent,original);assert.equal(w.node.children[0],child);
  delete w.dom.petBubbleTxt;w.display();w.node.children.length=0;w.dom.petBubbleTxt=w.node;w.display();assert(w.node.textContent.startsWith('쉬프트!'));
  w.run('_petBubble.t=0;');const writes=w.writes();w.c._gpActive=true;w.display();assert.equal(w.writes(),writes);
 });
 test(file+' locale redraw keeps slot-aware text and leaf safety',()=>{
  const w=fixture(file);w.c.SKILL_SLOTS=[null,null,null,'spikeTrap'];w.say('1번! 가시덫으로 적 묶어!');w.display();assert(w.node.textContent.startsWith('LT+Ⓧ!'));w.c.lang='en';w.refresh();w.display();assert(w.node.textContent.startsWith('LT+Ⓧ!'));assert.match(w.node.textContent,/Bind enemies/);
  const text=w.node.textContent;w.node.children.push({id:'child'});w.c.lang='ko';w.refresh();assert.equal(w.node.textContent,text);
 });
}
