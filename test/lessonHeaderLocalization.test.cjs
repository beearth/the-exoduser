const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {fixture}=require('../tools/test-parry-lesson.cjs'),data={};vm.runInNewContext(fs.readFileSync('localization-data.js','utf8'),data);
test('chapter eyebrow relocalizes as a leaf in both combat and resource practice',()=>{
 const c=fixture();c.OPT={lang:'ar'};c._L=(ko,en,values={})=>(c.OPT.lang==='ko'?ko:data.ExoduserLocalizationData.ui[c.OPT.lang]?.[ko]||en).replace(/\{(\w+)\}/g,(m,k)=>values[k]??m);
 vm.runInContext(fs.readFileSync('resource-practice.js','utf8'),c);const l=c.window._parryLesson;l.tick();
 const all=node=>[node.textContent||'',...node.children.map(all)].join('\n');
 assert.match(all(l.panel),new RegExp('01 · '+data.ExoduserLocalizationData.ui.ar['직접 실습']));
 c.window._resourcePractice.start(l);assert.match(all(l.panel),new RegExp('02 · '+data.ExoduserLocalizationData.ui.ar['직접 실습']));
 const children=l.panel.children.slice();c.OPT.lang='en';l.render();assert.match(all(l.panel),/02 · Hands-on practice/);assert.deepEqual(l.panel.children,children);
});
