import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function runtime(){
 const file=new URL('../localization-runtime.js',import.meta.url);
 assert.ok(fs.existsSync(file),'language runtime must exist');
 const ctx=vm.createContext({});vm.runInContext(fs.readFileSync(file,'utf8'),ctx);
 return ctx.ExoduserI18n;
}
test('all 31 Steam selections resolve to supported game locales, including Malay',()=>{
 const api=runtime();
 const cases={koreana:'ko',english:'en',schinese:'zh',tchinese:'zht',japanese:'ja',spanish:'es',latam:'es',portuguese:'ptbr',brazilian:'ptbr',malay:'ms',french:'fr',german:'de',russian:'ru',italian:'it',vietnamese:'vi',thai:'th',indonesian:'id',turkish:'tr',polish:'pl',czech:'cs',hungarian:'hu',bulgarian:'bg',greek:'el',finnish:'fi',swedish:'sv',danish:'da',norwegian:'no',dutch:'nl',romanian:'ro',ukrainian:'uk',arabic:'ar'};
 assert.equal(Object.keys(cases).length,31);
 Object.assign(cases,{brazilianportuguese:'ptbr','ms-MY':'ms','es-MX':'es','pt-PT':'ptbr','zh-Hant-HK':'zht','nb-NO':'no'});
 for(const [input,expected]of Object.entries(cases))assert.equal(api.resolveLanguage(input),expected,input);
 assert.equal(api.languages.length,29);assert.equal(api.resolveLanguage('unknown'),null);
});
test('numbered UI messages translate templates before inserting changing values',()=>{
 const api=runtime();
 assert.equal(api.format('Après : {n} AP',{n:17}),'Après : 17 AP');
 assert.equal(api.format('{n} / {n}',{n:0}),'0 / 0');
 assert.equal(api.format('Lv {n} · {other}',{n:10}),'Lv 10 · {other}');
 assert.equal(api.format('{name}',{name:'$& <tag>'}),'$& <tag>');
});
test('story localization preserves every canonical cue and timing without mutating sources',()=>{
 const api=runtime();
 const source=[{id:1,text:'',dur:1000},{id:'22b',text:'위험',speaker:'GODDESS',v:17,dur:500},{id:24,text:'...',dur:400}];
 const translated=api.localizeStory(source,{intro:{'22b':'Danger','24':'...'},speakers:{GODDESS:'Nemesia'}},'intro');
 assert.equal(translated.length,3);assert.equal(translated[1].id,'22b');
 assert.equal(translated[1].v,17);assert.equal(translated[1].dur,500);
 assert.equal(translated[1].text,'Danger');assert.equal(source[1].text,'위험');
 assert.equal(translated[1].speaker,'GODDESS','speaker token is a render/portrait key, not translatable');
});
test('returning from Arabic resets document text direction and language',()=>{
 const api=runtime(),doc={documentElement:{lang:'ko',dir:'ltr'}};
 api.applyDocumentLanguage(doc,'ar');assert.equal(doc.documentElement.dir,'rtl');assert.equal(doc.documentElement.lang,'ar');
 api.applyDocumentLanguage(doc,'ms');assert.equal(doc.documentElement.dir,'ltr');assert.equal(doc.documentElement.lang,'ms');
});
test('caption wrapping preserves all words, explicit breaks and combining characters',()=>{
 const api=runtime();
 const measure=s=>Array.from(s).length;
 const lines=api.wrapText('A long translated sentence\nNext line',10,measure,'en');
 assert.ok(lines.every(line=>measure(line)<=10));
 assert.equal(lines.join(' '),'A long translated sentence Next line');
 const arabic='هذا نص عربي طويل';
 assert.equal(api.wrapText(arabic,8,measure,'ar').join(' '),arabic);
 assert.deepEqual(Array.from(api.wrapText('e\u0301e\u0301',3,measure,'fr')),['e\u0301','e\u0301']);
});
