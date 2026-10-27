// tools/audit-lang-gaps.mjs — 27개 번역 언어의 누락 키·빈 값·한글 잔존 값 전수 감사 (읽기 전용)
// 기준: docs/16번역·로컬라이제이션/번역_가이드.md "2026-10-28 lang 파일 전수 감사"
// 실행: node tools/audit-lang-gaps.mjs [--json out.json]   (누락이 있으면 exit 1)
import fs from 'node:fs';
import vm from 'node:vm';
import {parse} from 'acorn';

const HG=/[가-힣]/;
const codes='zh ja es zht ru de ptbr fr pl it uk tr vi th id ms ar sv da no fi cs hu ro nl el bg'.split(' ');
// _T를 거치지 않는 표기(펫 화자 label:{ko,en,ja,zh})
const IGNORE=new Set(['네메시아']);

function scripts(file){
 const text=fs.readFileSync(file,'utf8');
 return [...text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(m=>m[2].trim()&&!/importmap|application\/json|\bsrc=/.test(m[1])).map(m=>({source:m[2],module:/type=["']module/.test(m[1])}));
}
function walk(n,v){if(!n||typeof n!=='object')return;v(n);for(const x of Object.values(n))if(Array.isArray(x))x.forEach(c=>walk(c,v));else if(x&&typeof x==='object')walk(x,v);}
const lit=src=>{try{return vm.runInNewContext('('+src+')',{},{timeout:200})}catch{return null}};
const isS=n=>n&&n.type==='Literal'&&typeof n.value==='string';

// ── game.html: _EN 전부 + _L 인라인 쌍 + 데이터 쌍 ──
const keys=new Map(),decl={};
const add=(ko,en,src)=>{if(typeof ko==='string'&&typeof en==='string'&&HG.test(ko)&&!HG.test(en)&&/[A-Za-z]/.test(en)&&!keys.has(ko)&&!IGNORE.has(ko))keys.set(ko,{en,src});};
for(const {source,module} of scripts('game.html')){
 walk(parse(source,{ecmaVersion:'latest',sourceType:module?'module':'script'}),n=>{
  if(n.type==='VariableDeclarator'&&n.id.type==='Identifier'&&n.init)decl[n.id.name]=source.slice(n.init.start,n.init.end);
  if(n.type==='CallExpression'&&n.callee.type==='MemberExpression'&&n.callee.object.name==='Object'&&n.callee.property.name==='assign'&&n.arguments[0]?.name==='_EN')
   for(const a of n.arguments.slice(1))for(const [k,v] of Object.entries(lit(source.slice(a.start,a.end))||{}))add(k,v,'_EN');
  if(n.type==='CallExpression'&&['_L','_T','_TL'].includes(n.callee.name)&&isS(n.arguments[0])&&isS(n.arguments[1]))add(n.arguments[0].value,n.arguments[1].value,'_L');
  if(n.type==='ArrayExpression'&&n.elements.length===2&&isS(n.elements[0])&&isS(n.elements[1]))add(n.elements[0].value,n.elements[1].value,'[ko,en]');
  if(n.type==='ObjectExpression'){
   const p={};for(const q of n.properties)if(q.type==='Property'&&isS(q.value))p[q.key.name||q.key.value]=q.value.value;
   if(p.ko&&p.en)add(p.ko,p.en,'{ko,en}');
   for(const k of Object.keys(p))if(p[k+'En'])add(p[k],p[k+'En'],k+'/'+k+'En');
  }
 });
}
for(const [k,v] of Object.entries(lit(decl._EN)||{}))add(k,v,'_EN');
for(const [nm,src] of Object.entries(decl)){
 if(!nm.endsWith('_KO')||!decl[nm.slice(0,-3)+'_EN'])continue;
 const ko=lit(src),en=lit(decl[nm.slice(0,-3)+'_EN']);
 if(ko&&en)for(const k of Object.keys(ko))add(ko[k],en[k],nm);
}

const ld={};vm.runInNewContext(fs.readFileSync('localization-data.js','utf8'),ld);
const bundle=ld.ExoduserLocalizationData;
const check=(table,universe)=>{const out=[];for(const k of universe){const v=table[k];if(typeof v!=='string'||!v.trim())out.push({k,why:'missing'});else if(HG.test(v))out.push({k,why:'hangul'});}return out;};

const report={game:{},lobby:{}};
for(const c of codes){
 const ctx=vm.createContext({});vm.runInContext(fs.readFileSync('lang_'+c+'.js','utf8'),ctx);
 report.game[c]=check({...vm.runInContext('_'+c.toUpperCase(),ctx),...(bundle.ui?.[c]||{})},keys.keys());
}

// ── index.html 로비: _LOBBY_EN ∪ _TL 리터럴 ──
const ldecl={},lcalls=new Set();
for(const {source,module} of scripts('index.html'))walk(parse(source,{ecmaVersion:'latest',sourceType:module?'module':'script'}),n=>{
 if(n.type==='VariableDeclarator'&&n.id.type==='Identifier'&&n.init&&/^_LOBBY_[A-Z]+$|^_TITLE_MENU_I18N$/.test(n.id.name))ldecl[n.id.name]=source.slice(n.init.start,n.init.end);
 if(n.type==='CallExpression'&&n.callee.name==='_TL'&&isS(n.arguments[0])&&HG.test(n.arguments[0].value))lcalls.add(n.arguments[0].value);
});
const lctx={};vm.runInNewContext(fs.readFileSync('lobby_i18n.js','utf8')+';globalThis.__L=_LOBBY_I18N',lctx);
const titleMenu=lit(ldecl._TITLE_MENU_I18N)||{};
const lobbyKeys=new Set([...Object.keys(lit(ldecl._LOBBY_EN)||{}).filter(k=>HG.test(k)),...lcalls]);
for(const c of codes){
 // index.html 병합 순서: 인라인 → lobby_i18n.js → (ms는 lobbyMs로 교체) → ui → 타이틀 메뉴
 let t=c==='ms'?{...bundle.lobbyMs}:{...(lit(ldecl['_LOBBY_'+c.toUpperCase()]||'{}')||{}),...(lctx.__L[c]||{})};
 t={...t,...(bundle.ui?.[c]||{}),...(titleMenu[c]||{})};
 report.lobby[c]=check(t,lobbyKeys);
}

let total=0;
for(const part of ['game','lobby'])for(const c of codes)total+=report[part][c].length;
console.log(`game keys ${keys.size}, lobby keys ${lobbyKeys.size}, gaps ${total}`);
for(const part of ['game','lobby'])for(const c of codes){const r=report[part][c];if(r.length)console.log(part,c,r.length,r.slice(0,3).map(x=>x.why+':'+JSON.stringify(x.k).slice(0,40)).join(' | '));}
const jsonAt=process.argv.indexOf('--json');
if(jsonAt>0)fs.writeFileSync(process.argv[jsonAt+1],JSON.stringify(report,null,1));
process.exit(total?1:0);
