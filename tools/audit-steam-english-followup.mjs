import fs from 'node:fs';
import vm from 'node:vm';
import {parse} from 'acorn';
import {walk,loadCatalogs,collect} from './localization-catalog.mjs';
const out='output/steam_install_review_20260916';fs.mkdirSync(out,{recursive:true});
const {tables,lobby}=loadCatalogs(),context={};vm.runInNewContext(fs.readFileSync('localization-data.js','utf8'),context);
const en={...tables.en,...context.ExoduserLocalizationData.ui.en};
const lessons=['parry-lesson.js','resource-practice.js','system-lesson.js'].map(file=>{
 const source=fs.readFileSync(file,'utf8'),strings=new Map();
 walk(parse(source,{ecmaVersion:'latest',locations:true}),n=>{
  const value=n.type==='Literal'?n.value:n.type==='TemplateElement'?n.value.cooked:null;
  if(typeof value==='string'&&/[가-힣]/.test(value)&&!strings.has(value))strings.set(value,{text:value,line:n.loc.start.line,english:en[value]||null});
 });
 return {file,koreanLiteralCandidates:strings.size,existingExactEnglish:[...strings.values()].filter(s=>s.english).length,strings:[...strings.values()]};
});
const visual=vm.runInNewContext('('+collect('index.html').declarations.CHAR_VISUALS+')');
const character=visual.map(ch=>({id:ch.id,strings:[ch.name,ch.desc,ch.tab,ch.job,...ch.traits.flat().filter(s=>/[가-힣]/.test(s))].map(text=>({text,english:lobby.en[text]||null}))}));
const result={note:'Candidate literals are not a completion percentage: includes aria labels and template fragments; excludes comments. Runtime paths require separate verification.',lessons,character,settings:{name:en['엑소듀서 전사'],desc:en['다크 판타지 전사. 거대검+검은 갑옷']},falsePositives:['Exoduser Warrior is an existing English proper name','HP/MP/ST/DPS, key names and icons are shared notation','English fallback in the opening four-cut guide is valid English, not an English omission','Old death-panel language cache in synthetic hidden-selector test is not evidence of normal English play failure']};
fs.writeFileSync(out+'/english-audit.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({lessons:lessons.map(({strings,...r})=>r),character,settings:result.settings},null,2));
