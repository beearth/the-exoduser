const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
class El{constructor(){this.children=[];this.attrs={};this.style={setProperty(){}};this.classList={contains:()=>false};}append(...nodes){this.children.push(...nodes);}setAttribute(k,v){this.attrs[k]=v;}addEventListener(){}remove(){}focus(){}}
const texts=node=>[node.textContent||'',...Object.values(node.attrs),...node.children.map(texts)].join('\n');
const data={};vm.runInNewContext(fs.readFileSync('localization-data.js','utf8'),data);
for(const code of 'ko en zh zht ja es fr de ru ptbr it vi th id tr pl cs hu bg el fi sv da no nl ro uk ar ms'.split(' '))test(code+' ships all7 system steps and all3 badges without English fallback',()=>{
 const stored=new Map();let timers=0;
 const c=vm.createContext({window:{_parryLesson:{seen:true,active:false}},OPT:{lang:code},location:{search:'?slot=translation-test'},URLSearchParams,Date,setTimeout:()=>++timers,clearTimeout(){},document:{readyState:'complete',body:new El(),createElement:()=>new El(),createElementNS:()=>new El(),getElementById:()=>null},localStorage:{getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,v)},G:{on:true,stage:0},P:{hp:100},INV:{bag:[],equipped:{}},BINDS:{interact:'KeyR'},BINDS2:{},keyName:key=>key.replace('Key',''),_EDITOR_MODE:false,_MAP_QA_MODE:false,_bossTestReq:-1,_saving:false});
 c._L=(ko,en,values={})=>{const value=c.OPT.lang==='ko'?ko:data.ExoduserLocalizationData.ui[c.OPT.lang]?.[ko];assert.equal(typeof value,'string',c.OPT.lang+' missing '+ko);return value.replace(/\{(\w+)\}/g,(m,k)=>values[k]??m);};
 for(const file of ['system-lesson.js','tutorial-badges.js'])vm.runInContext(fs.readFileSync(file,'utf8'),c);
 const lesson=c.window._systemLesson,badge=c.window._tutorialBadges;lesson.tick();
 for(const step of lesson.steps){if(code!=='ko')assert.doesNotMatch(texts(lesson.panel),/[가-힣�]/);lesson.record(step.id);}
 assert.ok(badge.earned.systems,'completing the live system guide awards its badge');
 for(const [id,count] of [['combat',12],['resources',8]])assert.equal(badge.complete(id,Array(count).fill(true)),true);
 assert.equal(badge.complete('systems',Array(7).fill(true)),false,'already earned badges are not awarded twice');assert.equal(Object.keys(badge.earned).length,3);
 assert.equal(lesson.checks.size,7);assert.equal(c.P.hp,100);
 if(code!=='ko')assert.doesNotMatch(texts(c.document.body),/[가-힣�]/);
 const saved=JSON.stringify([...stored]),timeoutCount=timers;c.OPT.lang=code==='ko'?'en':'ko';badge.refreshLanguage();lesson.tick();
 assert.equal(JSON.stringify([...stored]),saved);assert.equal(timers,timeoutCount);assert.equal(lesson.checks.size,7);
});
