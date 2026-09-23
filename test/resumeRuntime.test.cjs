const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {fixture}=require('../tools/test-parry-lesson.cjs');
const data={};vm.runInNewContext(fs.readFileSync('localization-data.js','utf8'),data);
const bundle=data.ExoduserLocalizationData;
const codes='ko en zh zht ja es fr de ru ptbr it vi th id tr pl cs hu bg el fi sv da no nl ro uk ar ms'.split(' ');
const allText=node=>[node.textContent||'',...(node.children||[]).filter(n=>!n.removed).map(allText)].join('\n');
for(const code of codes)test(code+' renders every combat and resource lesson from the shipped catalog',()=>{
 const c=fixture();c.OPT={lang:code};let lookups=0;
 c._L=(ko,en,values={})=>{lookups++;const translated=c.OPT.lang==='ko'?ko:bundle.ui[c.OPT.lang]?.[ko];assert.equal(typeof translated,'string',c.OPT.lang+' missing '+ko);return translated.replace(/\{(\w+)\}/g,(m,k)=>values[k]??m);};
 c._dashHold=0;c._dashTier=1;c.pGuardAbsorb=()=>.3;
 vm.runInContext(fs.readFileSync('resource-practice.js','utf8'),c);
 const l=c.window._parryLesson,r=c.window._resourcePractice;l.tick();
 for(const step of [-3,-2,-1,0,1,2,3,4,5,6,7,8]){l.step=step;l.phase='practice';if(step===4)l.chainPractice={target:1,completed:[],feedback:''};l.render();if(code!=='ko')assert.doesNotMatch(allText(l.panel),/[가-힣�]/);assert.doesNotMatch(allText(l.panel),/\{(?:p\d|key|count)\}/);}
 r.start(l);for(const step of [0,1,2,3,4,5,6,7,8,9,10]){l.step=step;l.phase='practice';r.enter(l);l.render();if(code!=='ko')assert.doesNotMatch(allText(l.panel),/[가-힣�]/);}
 const state={step:l.step,checks:JSON.stringify(l.checks)};c.G.paused=true;c.OPT.lang=code==='ko'?'en':'ko';l.tick();assert.equal(l.step,state.step);assert.equal(JSON.stringify(l.checks),state.checks);assert.ok(lookups>100);
});
