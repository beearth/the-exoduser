// 읽기 전용. 실제 로더의 codes/texts, code 레코드, 언어 맵을 모두 전수 검사한다.
const fs=require('node:fs'),path=require('node:path');
const codes='ko en zh zht ja vi th id ms es fr it ptbr ro de nl sv da no ru uk pl cs hu bg el fi tr ar'.split(' ');
const metadata=new Set(['code','id','key','speaker','who','portrait','image','img','art','resource','voice','effect','version','date','cam','vfx','fade','enter','exit','motion','shake','textStyle']);
function tokens(s){return [...String(s).replace(/\{\{|\}\}/g,'').matchAll(/\{(\d+|[A-Za-z_]\w*)(?:,[^}:]+)?(?::[^}]+)?\}/g)].map(m=>'{'+m[1]+'}').sort();}
function leaves(v,p='',out={}){
 if(typeof v==='string'){out[p]=v;return out;}
 if(v&&typeof v==='object')for(const [k,x] of Object.entries(v))if(!metadata.has(k))leaves(x,p?(p+'.'+k):k,out);
 return out;
}
function extract(data,file){
 const rows=[];
 function add(p,values,key){rows.push({file,path:p,key:key||values.ko||p,values});}
 function transpose(list,p){
  const localized=list.filter(x=>x&&codes.includes(x.code));
  const all=new Map(localized.map(x=>[x.code,leaves(x)]));
  const keys=new Set([...all.values()].flatMap(o=>Object.keys(o)));
  for(const k of keys){
   if(p==='languages'&&file==='startup_intro.json'&&!/^lines\.\d+\.text$/.test(k))continue;
   if(p==='captions'&&!/^cues\.\d+\.text$/.test(k))continue;
   add(p+'.'+k,Object.fromEntries([...all].map(([c,o])=>[c,o[k]])));
  }
 }
 function visit(v,p){
  if(!v||typeof v!=='object')return;
  if(Array.isArray(v)){
   if(v.some(x=>x&&typeof x==='object'&&codes.includes(x.code))){transpose(v,p);return;}
   v.forEach((x,i)=>visit(x,p+'['+i+']'));return;
  }
  if(Array.isArray(v.codes)&&Array.isArray(v.entries)){
   v.entries.forEach((e,i)=>{if(Array.isArray(e.texts)&&e.key!=='bgm.values')add((p?p+'.':'')+'entries['+i+'].texts',Object.fromEntries(v.codes.map((c,n)=>[c,e.texts[n]])),e.key);});
  }
  if(Object.hasOwn(v,'ko')&&Object.hasOwn(v,'en')&&typeof v.ko==='string'&&typeof v.en==='string'){
   // id is the Indonesian locale only in an actual language map, not an entry identifier.
   const langs=codes.filter(c=>Object.hasOwn(v,c)&&(c!=='id'||codes.some(x=>!['ko','en','id'].includes(x)&&Object.hasOwn(v,x))));
   add(p,Object.fromEntries(langs.map(c=>[c,v[c]])));
   for(const [k,x] of Object.entries(v))if(!langs.includes(k)&&k!=='id')visit(x,p+'.'+k);
   return;
  }
  for(const [k,x] of Object.entries(v)){
   if(k!=='nativeKo'&&k.endsWith('Ko')&&typeof x==='string'&&typeof v[k.slice(0,-2)+'En']==='string')add(p+'.'+k.slice(0,-2),{ko:x,en:v[k.slice(0,-2)+'En']});
   if(!['source','sourceFiles','localization','codes'].includes(k))visit(x,p?p+'.'+k:k);
  }
 }
 visit(data,'');return rows;
}
function validate(rows){
 const issues=[];
 for(const row of rows){const ko=row.values.ko,base=row.values.en||ko;
  // Source-authored silent cues and the hidden GPU button have no display text in any language.
  if(codes.every(c=>row.values[c]==='')&&(row.file==='startup_intro.json'||(row.file==='a15_options_web.json'&&row.key==='b.gpu')))continue;
  for(const code of codes){const value=row.values[code];let kind;
   if(value===undefined)kind='missing';else if(typeof value!=='string'||!value.trim())kind='empty';
   else if(code!=='ko'&&/[가-힣]/.test(ko||'')&&value===ko)kind='korean-copy';
   else if(base&&JSON.stringify(tokens(value))!==JSON.stringify(tokens(base)))kind='placeholder';
   if(kind)issues.push({file:row.file,path:row.path,key:row.key,code,kind,value,base});
  }
 }return issues;
}
function files(dir,ext){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name),ext):e.name.endsWith(ext)?[path.join(dir,e.name)]:[]);}
function registry(text){
 const result=new Map();for(const line of text.split(/\r?\n/)){const m=/^\|\s*(\d+)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|/.exec(line);if(m){for(const value of [m[2],m[3]]){const k=normalize(value);if(!result.has(k))result.set(k,[]);result.get(k).push(Number(m[1]));}}}return result;
}
function normalize(s){return String(s).replace(/&#124;/g,'|').replace(/<br\s*\/?>/gi,'\n').replace(/[`*]/g,'').replace(/\s+/g,' ').trim();}
function audit(root){
 const dataDir=path.join(root,'unity/Assets/Exoduser/Resources/Data'),runtime=path.join(root,'unity/Assets/Exoduser/Runtime');
 const rows=[],sources={},parseErrors=[];let jsonFiles=0;
 for(const f of files(dataDir,'.json')){jsonFiles++;try{const data=JSON.parse(fs.readFileSync(f,'utf8').replace(/^\uFEFF/,''));sources[path.basename(f)]=data;rows.push(...extract(data,path.basename(f)));}catch(e){parseErrors.push({file:f,error:e.message});}}
 const issues=validate(rows),reg=registry(fs.readFileSync(path.join(root,'docs/16번역·로컬라이제이션/번역대상_전체목록.md'),'utf8'));
 const unregistered=rows.filter(r=>r.values.ko?.trim()&&/[가-힣A-Za-z]/.test(r.values.ko)&&!reg.has(normalize(r.values.ko))).map(r=>({file:r.file,path:r.path,key:r.key,ko:r.values.ko,en:r.values.en}));
 const runtimeMissing=[],runtimeCalls=[],resourceMissing=[],dynamicCalls=[],bilingualCalls=[];
 const catalogs={NativeDemoText:'demo_text.json',NativeOptionText:'a15_options_web.json',NativePetBubbleCatalog:'pet_bubble.json'};
 const literals=[];
 for(const f of files(runtime,'.cs')){
  const text=fs.readFileSync(f,'utf8'),rel=path.relative(root,f).replace(/\\/g,'/');
  const clean=text.replace(/\/\*[\s\S]*?\*\//g,m=>m.replace(/[^\n]/g,' ')).replace(/^\s*\/\/.*$/gm,'');
  for(const m of clean.matchAll(/\bK\s*\(\s*"((?:\\.|[^"\\])*)"\s*,\s*"((?:\\.|[^"\\])*)"/g)){
   const ko=JSON.parse('"'+m[1]+'"'),en=JSON.parse('"'+m[2]+'"');if(/[가-힣]/.test(ko))bilingualCalls.push({file:rel,line:clean.slice(0,m.index).split('\n').length,ko,en,registered:reg.has(normalize(ko)),inCatalog:rows.some(r=>r.values.ko===ko||r.key===ko)});
  }
  for(const m of clean.matchAll(/Resources\.Load<TextAsset>\s*\(\s*"Data\/([^"\r\n]+)"/g))if(!sources[m[1]+'.json'])resourceMissing.push({file:rel,resource:m[1]});
  for(const m of clean.matchAll(/(NativeDemoText|NativeOptionText|NativePetBubbleCatalog)\.(?:Get|Text|List|CountSuffix)\s*\(\s*"((?:\\.|[^"\\])*)"(?=\s*[,\)])/g)){
   const key=JSON.parse('"'+m[2]+'"'),data=catalogs[m[1]],found=sources[data]?.entries?.some(e=>e.key===key);
   const call={file:rel,line:clean.slice(0,m.index).split('\n').length,catalog:data,key};runtimeCalls.push(call);if(!found)runtimeMissing.push(call);
  }
  if(path.basename(f).startsWith('NativePauseMenu.'))for(const m of clean.matchAll(/\bW\s*\(\s*"((?:\\.|[^"\\])*)"(?=\s*[,\)])/g)){
   const key=JSON.parse('"'+m[1]+'"'),call={file:rel,line:clean.slice(0,m.index).split('\n').length,catalog:'a15_options_web.json',key};
   runtimeCalls.push(call);if(!sources['a15_options_web.json'].entries.some(e=>e.key===key))runtimeMissing.push(call);
  }
  for(const m of clean.matchAll(/(NativeDemoText|NativeOptionText|NativePetBubbleCatalog)\.(?:Get|Text|List|CountSuffix)\s*\(\s*(?!\s*")([^,\r\n)]+)/g))dynamicCalls.push({file:rel,line:clean.slice(0,m.index).split('\n').length,expression:m[2].trim()});
  for(const m of clean.matchAll(/"((?:\\.|[^"\\\r\n])*[가-힣](?:\\.|[^"\\\r\n])*)"/g))literals.push({file:rel,line:clean.slice(0,m.index).split('\n').length,text:m[1]});
 }
 const counts={};for(const i of issues)counts[i.kind]=(counts[i.kind]||0)+1;
 const byFile={};for(const i of issues){const o=byFile[i.file]??={};o[i.kind]=(o[i.kind]||0)+1;}
 return {jsonFiles,localizedKeys:rows.length,counts,byFile,parseErrors,issues,unregistered,runtimeCalls,runtimeMissing,dynamicCalls,bilingualCalls,resourceMissing,koreanLiterals:literals,rows};
}
module.exports={codes,tokens,extract,validate,registry,normalize,audit};
if(require.main===module){
 const args=process.argv.slice(2),positional=args.filter(x=>!x.startsWith('--')),root=positional[0]||path.resolve(__dirname,'../..'),output=positional[1];
 const result=audit(root);if(output)fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({jsonFiles:result.jsonFiles,localizedKeys:result.localizedKeys,counts:result.counts,byFile:result.byFile,unregistered:result.unregistered.length,runtimeCalls:result.runtimeCalls.length,runtimeMissing:result.runtimeMissing,resourceMissing:result.resourceMissing,parseErrors:result.parseErrors},null,2));
 if(args.includes('--strict')&&(result.issues.length||result.runtimeMissing.length||result.resourceMissing.length||result.parseErrors.length||result.unregistered.length||result.bilingualCalls.some(c=>!c.inCatalog||!c.registered)))process.exitCode=1;
}
