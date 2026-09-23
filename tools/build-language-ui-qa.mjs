import fs from 'node:fs';
const source=fs.readFileSync('tools/test-parry-lesson.cjs','utf8');
const start=source.indexOf('  const c = vm.createContext(')+'  const c = vm.createContext('.length;
const end=source.indexOf('\n  });\n  c.spawnProj',start)+4;
let fixture=source.slice(start,end);
fixture=fixture.replace("window: {}, document: { createElement: tag => new Element(tag), getElementById: () => null, body: new Element('body') }, URLSearchParams, location: { search },","OPT:{lang:language},");
if(fixture.includes('new Element')||!fixture.endsWith('}'))throw Error('Fixture extraction failed');
const html=`<!doctype html><html><head><meta charset="utf-8"><title>Language UI QA</title><link rel="stylesheet" href="/parry-lesson.css"><link rel="stylesheet" href="/localization.css"><style>body{margin:0;background:#15131a;color:#eee;font:16px sans-serif}aside{position:fixed;left:20px;top:20px;max-width:45vw}select{display:block;margin:12px 0;padding:10px;max-width:100%}#result{white-space:pre-line}</style></head><body><aside><h1>Language UI QA</h1><label>Language<select id="language"></select></label><label>Panel<select id="mode"><option value="combat">Combat</option><option value="resource">Resources</option></select></label><label>Step<select id="step"></select></label><p id="result"></p></aside><script src="/localization-runtime.js"></script><script src="/localization-data.js"></script><script>
const params=new URLSearchParams(location.search),language=ExoduserI18n.resolveLanguage(params.get('lang')||'en'),mode=params.get('mode')||'combat',stage=0,c=window;
Object.assign(c,${fixture});
c.spawnProj=props=>{const shot={...props};c.projs.push(shot);return shot;};c._dashHold=0;c._dashTier=1;c.pGuardAbsorb=()=>.3;
c._L=(ko,en,values={})=>{const text=language==='ko'?ko:ExoduserLocalizationData.ui[language]?.[ko];if(typeof text!=='string')throw Error(language+' missing '+ko);return ExoduserI18n.format(text,values);};
ExoduserI18n.applyDocumentLanguage(document,language);
const langSelect=document.getElementById('language'),modeSelect=document.getElementById('mode'),stepSelect=document.getElementById('step');
for(const code of ExoduserI18n.languages){const opt=document.createElement('option');opt.value=code;opt.textContent=code;langSelect.append(opt);}langSelect.value=language;modeSelect.value=mode;
for(const n of (mode==='combat'?[-3,-2,-1,0,1,2,3,4,5,6,7,8]:[0,1,2,3,4,5,6,7,8,9,10])){const opt=document.createElement('option');opt.value=n;opt.textContent=n;stepSelect.append(opt);}stepSelect.value=params.get('step')||(mode==='combat'?'-3':'0');
for(const el of [langSelect,modeSelect,stepSelect])el.addEventListener('change',()=>{location.search=new URLSearchParams({lang:langSelect.value,mode:modeSelect.value,step:el===modeSelect?(modeSelect.value==='combat'?'-3':'0'):stepSelect.value});});
window.addEventListener('error',event=>{document.getElementById('result').textContent='FAIL: '+event.message;document.body.dataset.qa='fail';});
</script><script src="/parry-lesson.js"></script><script src="/resource-practice.js"></script><script>
const lesson=window._parryLesson;lesson.tick();if(mode==='resource')window._resourcePractice.start(lesson);lesson.step=Number(stepSelect.value);lesson.phase='practice';if(mode==='resource')window._resourcePractice.enter(lesson);else if(lesson.step===4)lesson.chainPractice={target:1,completed:[],feedback:''};lesson.render();
document.getElementById('result').textContent=language+' / '+mode+' / '+lesson.step;document.body.dataset.qa='ready';
</script></body></html>`;
fs.writeFileSync('tools/language-ui-qa.html',html);console.log('Built real lesson renderer QA page.');
