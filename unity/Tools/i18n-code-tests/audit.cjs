// Audit live JSON values, including path-bound overlays; no saved translation snapshot is trusted.
const fs=require('node:fs'),path=require('node:path');
const data=path.resolve(__dirname,'../../Assets/Exoduser/Resources/Data');
const codes='ko en zh ja es zht ru de ptbr fr pl it uk tr vi th id ar sv da no fi cs hu ro nl el bg ms'.split(' ');
const codeSet=new Set(codes),rows=[],issues=[],parseErrors=[],internalContracts=[];
const placeholders=s=>[...s.matchAll(/\{(?:\d+|[A-Za-z_]\w*)\}/g)].map(m=>m[0]).sort().join('|');
const add=(file,key,location,values)=>{
 if(Object.values(values).every(v=>typeof v==='string'&&!v.trim()))return; // silent cinematic cues
 rows.push({file,key,path:location,values});
};
function flatten(value,at,result){
 if(typeof value==='string'){result[at]=value;return;}
 if(!value||typeof value!=='object')return;
 for(const[k,v]of Object.entries(value)){
  if(['code','key','id','schema','source','sourceRef'].includes(k))continue;
  flatten(v,at?at+'.'+k:k,result);
 }
}
const files=fs.readdirSync(data).filter(f=>f.endsWith('.json')).sort();
for(const file of files){
 let d;try{d=JSON.parse(fs.readFileSync(path.join(data,file),'utf8'));}catch(e){parseErrors.push({file,error:e.message});continue;}
 if(d.localization?.entries){
  const table=d.localization;
  for(const r of table.entries)add(file,r.key,r.path,Object.fromEntries(table.codes.map((c,i)=>[c,r.texts[i]])));
 }
 if(d.codes&&Array.isArray(d.entries))for(const[r,n]of d.entries.entries())if(Array.isArray(n.texts)){
  if(n.texts.length!==d.codes.length)issues.push({file,path:'entries['+r+']',kind:'array-length'});
  // NativePauseMenu.A15Web feeds bgm.values to values.Add; bgm.labels is the displayed row.
  if(file==='a15_options_web.json'&&n.key==='bgm.values'){
   const stable=n.texts.every(v=>v===n.texts[0]);internalContracts.push({file,key:n.key,kind:'audio-resource-identifiers',stable});
   if(!stable)issues.push({file,key:n.key,kind:'internal-value-contract'});continue;
  }
  add(file,n.key,'entries['+r+'].texts',Object.fromEntries(d.codes.map((c,i)=>[c,n.texts[i]])));
 }
 if(Array.isArray(d.entries))for(const[r,n]of d.entries.entries())if(Array.isArray(n.locales)){
  add(file,n.nativeKo||n.ko||n.id,'entries['+r+'].locales.text',Object.fromEntries(n.locales.map(x=>[x.code,x.text])));
 }
 for(const field of ['entries','captions','languages']){
  const group=d[field];if(!Array.isArray(group)||!group.some(n=>codeSet.has(n.code)))continue;
  const values=new Map();
  for(const n of group){if(!codeSet.has(n.code))continue;const leaves={};flatten(n,'',leaves);
   for(const[k,v]of Object.entries(leaves)){
    // Cinematic image paths, speaker IDs, camera easing and SFX IDs are not displayed strings.
    if((field==='captions'||field==='languages')&&!/^(?:cues|lines)\.\d+\.text$/.test(k))continue;
    if(!values.has(k))values.set(k,{});values.get(k)[n.code]=v;
   }
  }
  for(const[k,v]of values)add(file,v.ko||k,field+'.'+k,v);
 }
}
for(const r of rows){
 const base=r.values.en||r.values.ko||'',expected=placeholders(base);
 for(const code of codes){const value=r.values[code];
  if(typeof value!=='string'||!value.trim())issues.push({file:r.file,path:r.path,key:r.key,code,kind:'empty'});
  else{
   if(code!=='ko'&&/[가-힣]/u.test(r.values.ko||'')&&value===r.values.ko)issues.push({file:r.file,path:r.path,key:r.key,code,kind:'korean-copy'});
   if(placeholders(value)!==expected)issues.push({file:r.file,path:r.path,key:r.key,code,kind:'placeholder',expected,actual:placeholders(value)});
  }
 }
}
const native=JSON.parse(fs.readFileSync(path.join(data,'native_ui_fallbacks.json'),'utf8'));
const fourthPass=['성장의 각인','계획 후 AP','전투의 길','패시브 분석','투자 레벨'];
const fifthPass=['설정 [ESC]','인벤토리 [TAB]','대장간 [G]','스킬 [K]','능력치 [J]'];
if(native.entries.length!==128+fourthPass.length+fifthPass.length||new Set(native.entries.map(r=>r.key)).size!==138||[...fourthPass,...fifthPass].some(key=>!native.entries.some(r=>r.key===key)))issues.push({kind:'native-key-contract'});
const coverage=Object.fromEntries([...new Set(rows.map(r=>r.file))].map(f=>[f,rows.filter(r=>r.file===f).length]));
const counts=Object.fromEntries([...new Set(issues.map(r=>r.kind))].map(k=>[k,issues.filter(r=>r.kind===k).length]));
const result={passed:!issues.length&&!parseErrors.length,jsonFiles:files.length,catalogFiles:Object.keys(coverage).length,rows:rows.length,values:rows.length*29,counts,coverage,internalContracts,parseErrors,issues};
const output=process.argv[2];if(output)fs.writeFileSync(output,JSON.stringify(result,null,2));
console.log(JSON.stringify({...result,issues:issues.slice(0,12)}));process.exitCode=result.passed?0:1;
