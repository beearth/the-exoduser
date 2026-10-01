import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {parse} from 'acorn';

const startedAt=new Date().toISOString(),root=process.cwd(),owned='tools/team-followup-20261001/BUILD/';
const hash=data=>createHash('sha256').update(data).digest('hex');
const files=['build-nwjs.mjs','package.json','node-main.js','game.html','game-easy-test.html','index.html'];
const source=new Map(files.map(file=>[file,fs.readFileSync(file,'utf8')]));
const before=files.map(file=>({file,sha256:hash(source.get(file))}));
const ast=parse(source.get('build-nwjs.mjs'),{ecmaVersion:'latest',sourceType:'module'});
const declarations=ast.body.filter(node=>node.type==='VariableDeclaration').flatMap(node=>node.declarations);
function literalList(name){let node=declarations.find(declaration=>declaration.id.name===name)?.init;if(node?.type==='NewExpression')node=node.arguments[0];if(node?.type!=='ArrayExpression'||node.elements.some(entry=>entry.type!=='Literal'||typeof entry.value!=='string'))throw Error('UNSUPPORTED_BUILD_LIST:'+name);return node.elements.map(entry=>entry.value);}
const fixed=literalList('FILES'),dirs=literalList('DIRS'),optional=new Set([...literalList('OPTIONAL_FILES'),...literalList('OPTIONAL_DIRS')]);
const dynamic=fs.readdirSync(root).filter(name=>(name.startsWith('lang_')&&name.endsWith('.js'))||name.startsWith('atlas_'));
const selection=[...new Set([...fixed,...dirs,...dynamic,'package.json','node-main.js'])];
const observations=selection.map(relative=>{
  const absolute=path.join(root,relative);try{const stat=fs.lstatSync(absolute);return {path:relative,exists:true,kind:stat.isSymbolicLink()?'symlink':stat.isDirectory()?'directory':'file',optional:optional.has(relative)};}catch(error){return {path:relative,exists:false,error:error.code,optional:optional.has(relative)};}
});
const inputRoots=observations.filter(entry=>entry.exists).map(entry=>entry.path);
const covered=value=>inputRoots.some(input=>value===input||value.startsWith(input+'/'));
const dependencyEdges=[];
const inspected=new Set();
function inspect(file){
  if(inspected.has(file))return;inspected.add(file);const text=source.get(file)??fs.readFileSync(path.join(root,file),'utf8');
  const pattern=/\b(?:src|href)\s*=\s*(["'])([^"'\r\n]+)\1/g;
  for(const match of text.matchAll(pattern)){
    const reference=match[2];if(/^(?:[a-z][a-z\d+.-]*:|\/\/|#|\$|\{)/i.test(reference))continue;
    const stripped=reference.split(/[?#]/)[0];if(!stripped||stripped==='/')continue;
    const resolved=path.posix.normalize(path.posix.join(path.posix.dirname(file),stripped.replace(/^\//,'')));
    if(resolved.startsWith('../')){dependencyEdges.push({from:file,reference,status:'PATH_ESCAPE'});continue;}
    const exists=fs.existsSync(path.join(root,resolved));dependencyEdges.push({from:file,reference,resolved,exists,covered:covered(resolved),scope:'한줄리터럴src/href(HTML속성/JS할당포함);동적표현식완전성보장없음'});
  }
}
for(const file of observations.filter(entry=>entry.exists&&entry.kind==='file'&&/\.html$/.test(entry.path)).map(entry=>entry.path))inspect(file);
const functionSlices={};const game=source.get('game.html');
for(const name of ['_preparePhysicalImpactSheet','_physicalImpactSheet','_tintHolyDome']){
  const start=game.indexOf('function '+name+'(');if(start<0){functionSlices[name]={status:'MISSING'};continue;}
  let end;if(name==='_tintHolyDome')end=game.indexOf('\n',start);else end=game.indexOf('\nfunction ',start+1);
  const text=game.slice(start,end<0?game.length:end);functionSlices[name]={sha256:hash(text),startLine:game.slice(0,start).split('\n').length};
  fs.writeFileSync(owned+'runtime-acquire-before-'+name+'.txt',text+'\n');
}
fs.writeFileSync(owned+'runtime-acquire-before-node-main.js',source.get('node-main.js'));
fs.writeFileSync(owned+'runtime-acquire-before-package.json',source.get('package.json'));
const pkg=JSON.parse(source.get('package.json'));
const releasePath=path.join(root,owned+'runtime-acquire-release-info.json');
const config={sourceRoot:root,outputRoot:'/Users/fordeargamers/Projects/exoduser-mac-runtime-20261002/packages',arch:process.arch,port:3381,inputRoots,inputs:[],backup:{sha:null,remoteSha:null,remoteRef:'UNKNOWN',verifiedAt:null,inputs:[]},runtime:{cacheRoot:'/Users/fordeargamers/Projects/exoduser-mac-runtime-20261002/cache',releaseInfoPath:releasePath,releaseInfoSha256:hash(fs.readFileSync(releasePath)),files:[]},executionApproved:false,status:'DRAFT_BLOCKED_RUNTIME_AND_EXACT_REMOTE_INPUT_BACKUP',limits:['전체build선택root목록대조;대형asset본문SHA수집안함','inputs/backup.inputs/runtime.files빈목록을성공으로취급금지','port3381은예시;실제점유미검사','루트저장수정후새node-main원문/파생계약재인수필요']};
const after=files.map(file=>({file,sha256:hash(fs.readFileSync(file))}));
const report={startedAt,completedAt:new Date().toISOString(),before,after,changedDuringRead:before.filter((entry,index)=>entry.sha256!==after[index].sha256),functionSlices,observations,counts:{fixedFiles:fixed.length,dirs:dirs.length,dynamic:dynamic.length,inputRoots:inputRoots.length},missingRequired:observations.filter(entry=>!entry.exists&&!entry.optional),missingOptional:observations.filter(entry=>!entry.exists&&entry.optional),dependencyEdges,uncoveredLiteralReferences:dependencyEdges.filter(edge=>edge.covered===false),packageDependencies:pkg.dependencies,dependencyDecision:'실행package는deps/scripts/type/nwbuild제거;node-main은Node builtin require만사용하는지근거대조. 전체JS동적load/native모듈완전성미검증',serverDerivationMatches:{portNeedle:source.get('node-main.js').includes('const PORT = 3333;'),saveNeedle:source.get('node-main.js').includes("const SAVE_DIR = path.join(APPDATA, 'EXODUSER-HELL', 'saves');")},limits:'selection명칭/stat및명시HTML참조만;사용자save내용읽기0/대형asset해시0/생산복사0/execute0'};
fs.writeFileSync(owned+'runtime-acquire-config-draft.json',JSON.stringify(config,null,2)+'\n');
fs.writeFileSync(owned+'runtime-acquire-source-evidence.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({counts:report.counts,missingRequired:report.missingRequired,missingOptional:report.missingOptional,uncovered:report.uncoveredLiteralReferences,changedDuringRead:report.changedDuringRead,serverDerivationMatches:report.serverDerivationMatches}));
