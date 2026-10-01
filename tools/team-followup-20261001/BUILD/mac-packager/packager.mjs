import fs from 'node:fs';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';

const version='0.111.2';
const pins={
  'index.js':'75e7a65f378bdc33677eb50d53bf9f6ccb90fceb639cdc9abd81205faeffa03d',
  'bld.js':'9a52b68223e5dc1b3f59ed504db50dc888c6a4c23708b3307a300e48395f29f9',
  'util.js':'0e35bc436cdfd26e0ba771748688825bfd6b46a6968915b6e12d3d1d23235844',
  'bld/osx.js':'9db9b472d4eea79776076d187d5329107de73177d82628f88f006e3eb281968a'
};
const digest=data=>createHash('sha256').update(data).digest('hex');
const requireValue=(condition,message)=>{if(!condition)throw Error(message);};
const protectedSegment=segment=>/^(saves?|userdata.*|profiles?|\.git|\.env.*|node_modules|tmp|dist(?:-.*)?|out)$/i.test(segment)||/\.(app|exe|dll|nw|zip|pem|key)$/i.test(segment);
function safeAncestors(absolute){
  let current=path.parse(absolute).root;
  for(const segment of absolute.slice(current.length).split(path.sep).filter(Boolean)){current=path.join(current,segment);requireValue(!fs.lstatSync(current).isSymbolicLink(),'SYMLINK_PATH');}
}
function directory(value){requireValue(typeof value==='string'&&path.isAbsolute(value),'ABSOLUTE_ROOT_REQUIRED');const resolved=path.resolve(value);safeAncestors(resolved);requireValue(fs.statSync(resolved).isDirectory(),'DIRECTORY_REQUIRED');return resolved;}
function relative(value,protect=true){requireValue(typeof value==='string'&&value&&!path.isAbsolute(value)&&!value.includes('\\'),'RELATIVE_PATH_REQUIRED');const segments=value.split('/');requireValue(segments.every(segment=>segment&&segment!=='.'&&segment!=='..'),'PATH_ESCAPE');if(protect)requireValue(!segments.some(protectedSegment),'PROTECTED_INPUT');return value;}
function readFile(absolute){safeAncestors(absolute);const descriptor=fs.openSync(absolute,fs.constants.O_RDONLY|fs.constants.O_NOFOLLOW);try{const before=fs.fstatSync(descriptor);requireValue(before.isFile()&&before.nlink===1,'REGULAR_SINGLE_LINK_REQUIRED');const data=fs.readFileSync(descriptor);const after=fs.fstatSync(descriptor);requireValue(before.size===after.size&&before.mtimeMs===after.mtimeMs&&before.ctimeMs===after.ctimeMs,'SOURCE_CHANGED');return data;}finally{fs.closeSync(descriptor);}}
function listTree(root,selection,protect=true){
  const entries=[];
  function visit(value){relative(value,protect);const absolute=path.join(root,value),stat=fs.lstatSync(absolute);
    if(stat.isDirectory()){for(const name of fs.readdirSync(absolute).sort())visit(value+'/'+name);return;}
    if(stat.isSymbolicLink()){
      requireValue(!protect,'SYMLINK_INPUT');const target=fs.readlinkSync(absolute);requireValue(!path.isAbsolute(target),'ABSOLUTE_RUNTIME_LINK');const resolved=fs.realpathSync(absolute);requireValue(resolved.startsWith(root+path.sep),'RUNTIME_LINK_ESCAPE');entries.push({path:value,sha256:digest('symlink:'+target),target});return;
    }
    requireValue(stat.isFile()&&stat.nlink===1,'REGULAR_SINGLE_LINK_REQUIRED');entries.push({path:value,sha256:digest(readFile(absolute))});
  }
  for(const item of selection)visit(item);
  const sorted=entries.sort((first,second)=>first.path.localeCompare(second.path));requireValue(new Set(sorted.map(entry=>entry.path)).size===sorted.length,'OVERLAPPING_ROOTS');return sorted;
}
function sameInventory(actual,expected){requireValue(Array.isArray(expected)&&expected.length>0,'EXPLICIT_SHA_INVENTORY_REQUIRED');const normalized=expected.map(entry=>({path:relative(entry.path,false),sha256:entry.sha256,...(entry.target===undefined?{}:{target:entry.target})})).sort((first,second)=>first.path.localeCompare(second.path));requireValue(normalized.every(entry=>/^[a-f0-9]{64}$/.test(entry.sha256)),'SHA_FORMAT');requireValue(JSON.stringify(actual)===JSON.stringify(normalized),'INVENTORY_SHA_OR_COVERAGE_MISMATCH');}
export function libraryEvidence(){
  const entry=createRequire(import.meta.url).resolve('nw-builder'),root=path.dirname(entry);requireValue(path.basename(entry)==='index.js','LIBRARY_ENTRY_CHANGED');
  const packageInfo=JSON.parse(readFile(path.join(root,'../package.json')));requireValue(packageInfo.version==='4.17.10','LIBRARY_VERSION_CHANGED');
  const files=Object.entries(pins).map(([name,sha256])=>{requireValue(digest(readFile(path.join(root,name)))===sha256,'LIBRARY_SOURCE_CHANGED:'+name);return {name,sha256};});
  return {entry,buildEntry:path.join(root,'bld.js'),version:packageInfo.version,files};
}
export function plan(config){
  try{
    requireValue(process.platform==='darwin','DARWIN_HOST_REQUIRED');const arch=config.arch||process.arch;requireValue(['arm64','x64'].includes(arch),'MAC_ARCH_REQUIRED');
    const sourceRoot=directory(config.sourceRoot),outputRoot=directory(config.outputRoot);requireValue(!sourceRoot.split(path.sep).some(protectedSegment),'PROTECTED_SOURCE_ROOT');requireValue(!outputRoot.split(path.sep).some(protectedSegment),'PROTECTED_OUTPUT_ROOT');
    requireValue(config.runtime&&config.runtime.cacheRoot,'MAC_RUNTIME_MISSING');
    const id=config.id||randomUUID();requireValue(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(id),'UNIQUE_ID_REQUIRED');
    const job=path.join(outputRoot,'mac-packager-'+id);try{fs.lstatSync(job);throw Error('JOB_ALREADY_EXISTS');}catch(error){if(error.code!=='ENOENT')throw error;}
    requireValue(Number.isInteger(config.port)&&config.port>=1024&&config.port<=65535&&![3333,3340].includes(config.port),'ISOLATED_PORT_REQUIRED');
    requireValue(config.backup&&/^[a-f0-9]{40}$/.test(config.backup.sha)&&config.backup.sha===config.backup.remoteSha&&/^refs\/(heads|tags)\/.+/.test(config.backup.remoteRef)&&Number.isFinite(Date.parse(config.backup.verifiedAt)),'REMOTE_BACKUP_EVIDENCE_REQUIRED');
    requireValue(Array.isArray(config.inputRoots)&&config.inputRoots.length>0,'INPUT_ROOTS_REQUIRED');const inputs=listTree(sourceRoot,config.inputRoots);sameInventory(inputs,config.inputs);
    sameInventory(inputs,config.backup.inputs);for(const required of ['package.json','node-main.js','index.html','game.html'])requireValue(inputs.some(entry=>entry.path===required),'REQUIRED_INPUT_MISSING:'+required);
    requireValue(config.runtime&&config.runtime.cacheRoot,'MAC_RUNTIME_MISSING');const cacheRoot=directory(config.runtime.cacheRoot),runtimeRoot=path.join(cacheRoot,`nwjs-v${version}-osx-${arch}`);directory(runtimeRoot);
    requireValue(typeof config.runtime.releaseInfoPath==='string'&&path.isAbsolute(config.runtime.releaseInfoPath)&&config.runtime.releaseInfoPath.endsWith('.json')&&!config.runtime.releaseInfoPath.split(path.sep).some(protectedSegment),'ABSOLUTE_RELEASE_INFO_REQUIRED');const releaseBytes=readFile(config.runtime.releaseInfoPath),releaseInfo=JSON.parse(releaseBytes);requireValue(digest(releaseBytes)===config.runtime.releaseInfoSha256,'RELEASE_INFO_SHA');requireValue(releaseInfo.version==='v'+version&&/^[0-9]+(?:\.[0-9]+){1,3}$/.test(releaseInfo.components?.chromium),'LOCAL_RELEASE_INFO_REQUIRED');
    const runtimeFiles=listTree(runtimeRoot,['nwjs.app'],false);sameInventory(runtimeFiles,config.runtime.files);
    const binary=readFile(path.join(runtimeRoot,'nwjs.app/Contents/MacOS/nwjs'));requireValue(binary.length>=8&&binary.readUInt32LE(0)===0xfeedfacf&&binary.readUInt32LE(4)===(arch==='arm64'?0x0100000c:0x01000007),'RUNTIME_ARCH_UNKNOWN_OR_MISMATCH');
    const chromium=releaseInfo.components.chromium;
    const requiredRuntime=['nwjs.app/Contents/Info.plist','nwjs.app/Contents/Resources/en.lproj/InfoPlist.strings'];
    for(const helper of ['nwjs Helper','nwjs Helper (Alerts)','nwjs Helper (GPU)','nwjs Helper (Renderer)'])requiredRuntime.push(`nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/${chromium}/Helpers/${helper}.app/Contents/Info.plist`,`nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/${chromium}/Helpers/${helper}.app/Contents/MacOS/${helper}`);
    for(const required of requiredRuntime)requireValue(runtimeFiles.some(entry=>entry.path===required),'RUNTIME_FILE_MISSING:'+required);
    const name='EXODUSER-'+id,stage=path.join(job,'stage'),output=path.join(job,'package'),saveRoot=path.join(job,'user-state/saves'),profile=path.join(job,'user-state/profile');
    requireValue(path.isAbsolute(profile)&&!/[\s"'\x00-\x1f\x7f]/.test(profile),'UNSUPPORTED_PROFILE_ARGUMENT_PATH');
    const packageInfo=JSON.parse(readFile(path.join(sourceRoot,'package.json')));requireValue(packageInfo.main==='http://localhost:3333/index.html?demo=1'&&packageInfo['node-main']==='node-main.js','PACKAGE_ENTRY_CONTRACT');
    requireValue(typeof packageInfo['chromium-args']==='string'&&(packageInfo['chromium-args'].match(/--user-data-dir=\S+/g)||[]).length===1,'PROFILE_CONTRACT');
    const derivedPackage={name:packageInfo.name,version:packageInfo.version,main:`http://127.0.0.1:${config.port}/index.html?demo=1`,'node-main':'node-main.js','node-remote':[`http://127.0.0.1:${config.port}`,`http://localhost:${config.port}`],window:packageInfo.window,'chromium-args':packageInfo['chromium-args'].replace(/--user-data-dir=\S+/,`--user-data-dir=${profile}`)};
    const originalServer=readFile(path.join(sourceRoot,'node-main.js')).toString();const portNeedle='const PORT = 3333;',saveNeedle="const SAVE_DIR = path.join(APPDATA, 'EXODUSER-HELL', 'saves');";
    requireValue(originalServer.split(portNeedle).length===2&&originalServer.split(saveNeedle).length===2,'SERVER_DERIVATION_CONTRACT');
    const derivedServer=originalServer.replace(portNeedle,`const PORT = ${config.port};`).replace(saveNeedle,`const SAVE_DIR = ${JSON.stringify(saveRoot)};`);
    return {status:'READY_PLAN_ONLY',id,job,sourceRoot,inputs,runtimeRoot,runtimeFiles,derivedPackage,derivedServer,backup:config.backup,library:libraryEvidence(),paths:{stage,output,profile,saveRoot},args:{version,flavor:'normal',platform:'osx',arch,srcDir:stage,cacheDir:cacheRoot,outDir:output,glob:false,managedManifest:false,zip:false,releaseInfo,app:{name,CFBundleIdentifier:'com.exoduser.mac.'+id,CFBundleName:name,CFBundleDisplayName:'EXODUSER',CFBundleVersion:'1.0.0',CFBundleShortVersionString:'1.0.0',LSApplicationCategoryType:'public.app-category.games'}},packageCreated:false,limits:['로컬bld내부API고정;최상위getter/manifest/다운로드호출안함','SHA/원격근거는제공된파일목록대조;외부Git조회아님','선택root전체파일커버리지검사;선택root의게임의존성완전성은root승인계약','port는정적격리값;실행직전실제점유검사는별도','서명/코덱/실행검수미완료','프로필/저장절대경로는고유job에귀속;이동/배포계약별도']};
  }catch(error){return {status:'BLOCKED',error:String(error.message),packageCreated:false};}
}
function ownerMatches(job,identity){try{const stat=fs.lstatSync(job);return !stat.isSymbolicLink()&&stat.dev===identity.dev&&stat.ino===identity.ino;}catch{return false;}}
async function localBuild(args){const library=libraryEvidence();const {default:build}=await import(pathToFileURL(library.buildEntry).href);requireValue(typeof build==='function','BUILD_ADAPTER_SHAPE');await build(args);}
function verifyOutput(proposal){
  const {parse}=createRequire(import.meta.url)('plist');
  const app=path.join(proposal.paths.output,proposal.args.app.name+'.app');safeAncestors(app);
  const main=path.join(app,'Contents/MacOS',proposal.args.app.name),plist=path.join(app,'Contents/Info.plist');requireValue(digest(readFile(main))===proposal.runtimeFiles.find(entry=>entry.path==='nwjs.app/Contents/MacOS/nwjs').sha256&&parse(readFile(plist).toString()).CFBundleExecutable===proposal.args.app.name,'MAC_RENAME_NOT_COMPLETED');
  const resource=path.join(app,'Contents/Resources/app.nw');
  requireValue(JSON.stringify(JSON.parse(readFile(path.join(resource,'package.json'))))===JSON.stringify({...proposal.derivedPackage,product_string:proposal.args.app.name}),'DERIVED_PACKAGE_MISMATCH');
  requireValue(digest(readFile(path.join(resource,'node-main.js')))===digest(proposal.derivedServer),'DERIVED_SERVER_MISMATCH');
  const helperRoot=path.join(app,'Contents/Frameworks/nwjs Framework.framework/Versions',proposal.args.releaseInfo.components.chromium,'Helpers');
  for(const suffix of ['', ' (Alerts)',' (GPU)',' (Renderer)']){const helper=proposal.args.app.name+' Helper'+suffix;requireValue(readFile(path.join(helperRoot,helper+'.app/Contents/MacOS',helper)).length>0,'MAC_HELPER_RENAME_NOT_COMPLETED');requireValue(parse(readFile(path.join(helperRoot,helper+'.app/Contents/Info.plist')).toString()).CFBundleExecutable===helper,'MAC_HELPER_PLIST_NOT_COMPLETED');}
  for(const input of proposal.inputs){if(['package.json','node-main.js'].includes(input.path))continue;requireValue(digest(readFile(path.join(resource,input.path)))===input.sha256,'PACKAGED_INPUT_SHA_MISMATCH');}
  return app;
}
export async function execute(config,{approved=false,build}={}){
  requireValue(approved===true,'EXECUTION_APPROVAL_REQUIRED');const proposal=plan(config);requireValue(proposal.status==='READY_PLAN_ONLY',proposal.error||'PLAN_BLOCKED');
  let identity;let created=false;
  try{
    fs.mkdirSync(proposal.job);created=true;identity=fs.lstatSync(proposal.job);fs.writeFileSync(path.join(proposal.job,'owner.json'),JSON.stringify({id:proposal.id}),{flag:'wx'});
    fs.mkdirSync(proposal.paths.stage);fs.mkdirSync(proposal.paths.output);
    for(const input of proposal.inputs){requireValue(ownerMatches(proposal.job,identity),'OWNERSHIP_CHANGED');const data=readFile(path.join(proposal.sourceRoot,input.path));requireValue(digest(data)===input.sha256,'INPUT_CHANGED_BEFORE_STAGE');const destination=path.join(proposal.paths.stage,input.path);fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,data,{flag:'wx'});}
    fs.writeFileSync(path.join(proposal.paths.stage,'package.json'),JSON.stringify(proposal.derivedPackage,null,2));fs.writeFileSync(path.join(proposal.paths.stage,'node-main.js'),proposal.derivedServer);
    sameInventory(listTree(proposal.sourceRoot,config.inputRoots),proposal.inputs);sameInventory(listTree(proposal.runtimeRoot,['nwjs.app'],false),proposal.runtimeFiles);requireValue(ownerMatches(proposal.job,identity),'OWNERSHIP_CHANGED');
    requireValue(fs.readdirSync(proposal.paths.output).length===0,'OWNED_OUTPUT_NOT_EMPTY');safeAncestors(proposal.paths.output);
    await (build||localBuild)(structuredClone(proposal.args));requireValue(ownerMatches(proposal.job,identity),'OWNERSHIP_CHANGED');const app=verifyOutput(proposal);
    return {status:build?'FIXTURE_ONLY':'PACKAGED_NOT_RUNTIME_ACCEPTED',fixtureOnly:!!build,packageCreated:!build,appPath:app,job:proposal.job,sourceBackup:proposal.backup.sha,limits:proposal.limits};
  }catch(error){let cleanup='not-owned/not-created';if(created&&identity&&ownerMatches(proposal.job,identity)){fs.rmSync(proposal.job,{recursive:true,force:false});cleanup='owned-new-job-removed';}throw Object.assign(Error(String(error.message)),{cleanup});}
}
