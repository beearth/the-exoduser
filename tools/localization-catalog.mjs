import fs from 'node:fs';
import vm from 'node:vm';
import {parse} from 'acorn';

export const languages='ko en zh zht ja es fr de ru ptbr it vi th id tr pl cs hu bg el fi sv da no nl ro uk ar ms'.split(' ');
export function scripts(file){
 const text=fs.readFileSync(file,'utf8');
 return file.endsWith('.html')?[...text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(m=>m[2].trim()&&!/importmap|application\/json/.test(m[1])).map(m=>({source:m[2],module:/type=["']module/.test(m[1])})):[{source:text,module:false}];
}
export function walk(node,visit){
 if(!node||typeof node!=='object')return;
 visit(node);
 for(const v of Object.values(node))if(Array.isArray(v))v.forEach(n=>walk(n,visit));else if(v&&typeof v==='object')walk(v,visit);
}
export function collect(file){
  const declarations={},pairs=new Map(),keys=new Set();
  const add=(ko,en)=>{if(typeof ko==='string'&&/[가-힣]/.test(ko)){keys.add(ko);if(typeof en==='string')pairs.set(ko,en);}};
  for(const {source,module}of scripts(file)){
  const ast=parse(source,{ecmaVersion:'latest',sourceType:module?'module':'script'});
  walk(ast,node=>{
   if(node.type==='VariableDeclarator'&&node.id.type==='Identifier')declarations[node.id.name]=source.slice(node.init?.start||0,node.init?.end||0);
   if(node.type==='CallExpression'&&['_T','_L','_TL','t',...(file==='stat-panel-ui.js'?['row']:[])].includes(node.callee.name))add(node.arguments[0]?.value,node.arguments[1]?.value);
   if(file==='stat-panel-ui.js'&&node.type==='ArrayExpression'){
    add(node.elements[0]?.value,node.elements[1]?.value);
    if(node.elements.length===3)add(node.elements[1]?.value,node.elements[2]?.value);
   }
   if(node.type==='ObjectExpression'){
    const props=Object.fromEntries(node.properties.filter(p=>p.type==='Property').map(p=>[p.key.name||p.key.value,p.value?.value]));
    if(file==='stat-panel-ui.js')add(props.ko,props.en);
    for(const name of ['name','desc','label','title','text'])if(props[name+'En'])add(props[name],props[name+'En']);
   }
  });
  }
 for(const [name,source]of Object.entries(declarations)){
  if(!name.endsWith('_KO')||!declarations[name.slice(0,-3)+'_EN'])continue;
  try{
   const ko=vm.runInNewContext('('+source+')',{}, {timeout:100});
   const en=vm.runInNewContext('('+declarations[name.slice(0,-3)+'_EN']+')',{}, {timeout:100});
   for(const key of Object.keys(ko))add(ko[key],en[key]);
  }catch{/* Nonliteral runtime structures are checked in the browser. */}
 }
  return {declarations,pairs,keys};
}
export function loadCatalogs(){
 const {declarations}=collect('game.html');
 const en=vm.runInNewContext('('+declarations._EN+')');
 const tables={en},ctx=vm.createContext({});
 for(const file of fs.readdirSync('.').filter(f=>/^lang_[a-z]+\.js$/.test(f))){
  const code=file.slice(5,-3);vm.runInContext(fs.readFileSync(file,'utf8'),ctx);
  tables[code]=vm.runInContext('_'+code.toUpperCase(),ctx);
 }
 const lobbyDecl=collect('index.html').declarations,lobbyCtx=vm.createContext({});
 vm.runInContext(fs.readFileSync('lobby_i18n.js','utf8'),lobbyCtx);
 const external=vm.runInContext('_LOBBY_I18N',lobbyCtx),lobby={};
 for(const code of languages.filter(c=>c!=='ko')){
  const source=lobbyDecl['_LOBBY_'+(code==='ptbr'?'PTBR':code.toUpperCase())];
  const inline=source?vm.runInNewContext('('+source+')'):{};
  lobby[code]={...inline,...external[code]};
 }
 return {tables,declarations,lobby};
}
