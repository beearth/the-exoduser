import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {randomUUID,createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {build as plistBuild} from 'plist';
import {plan,execute,libraryEvidence} from './packager.mjs';
const owned=path.dirname(fileURLToPath(import.meta.url));
const hash=data=>createHash('sha256').update(data).digest('hex');
function inventory(root,selection){const result=[];function visit(value){const absolute=path.join(root,value);if(fs.lstatSync(absolute).isDirectory()){for(const name of fs.readdirSync(absolute))visit(value+'/'+name);}else result.push({path:value,sha256:hash(fs.readFileSync(absolute))});}selection.forEach(visit);return result.sort((first,second)=>first.path.localeCompare(second.path));}
function fixture(){
  const root=fs.mkdtempSync(path.join(owned,'fixture-')),source=path.join(root,'source'),cache=path.join(root,'local-cache'),outputs=path.join(root,'destinations');
  fs.mkdirSync(source);fs.mkdirSync(outputs);const runtime=path.join(cache,'nwjs-v0.111.2-osx-arm64');fs.mkdirSync(runtime,{recursive:true});
  const write=(relative,data)=>{const absolute=path.join(root,relative);fs.mkdirSync(path.dirname(absolute),{recursive:true});fs.writeFileSync(absolute,data);};
  write('source/package.json',JSON.stringify({name:'fixture',version:'1.0.0',main:'http://localhost:3333/index.html?demo=1','node-main':'node-main.js','chromium-args':'--user-data-dir=./userdata --existing-flag',nwbuild:{mode:'get',outDir:'/must-not-use'},scripts:{install:'must-not-run'},dependencies:{never:'*'},type:'module'}));
  write('source/node-main.js',"const PORT = 3333;\nconst SAVE_DIR = path.join(APPDATA, 'EXODUSER-HELL', 'saves');\n");write('source/index.html','index fixture');write('source/game.html','game fixture');write('source/assets/one.dat','asset fixture');
  const binary=Buffer.alloc(32);binary.writeUInt32LE(0xfeedfacf);binary.writeUInt32LE(0x0100000c,4);
  const prefix='local-cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/';
  write(prefix+'MacOS/nwjs',binary);write(prefix+'Info.plist','<plist/>');write(prefix+'Resources/en.lproj/InfoPlist.strings','fixture');
  for(const helper of ['nwjs Helper','nwjs Helper (Alerts)','nwjs Helper (GPU)','nwjs Helper (Renderer)']){const base=prefix+'Frameworks/nwjs Framework.framework/Versions/148.0.0/Helpers/'+helper+'.app/Contents/';write(base+'MacOS/'+helper,binary);write(base+'Info.plist','<plist/>');}
  const release={version:'v0.111.2',components:{chromium:'148.0.0'}};write('release.json',JSON.stringify(release));
  const inputRoots=['package.json','node-main.js','index.html','game.html','assets'];const inputs=inventory(source,inputRoots);
  const config={sourceRoot:source,outputRoot:outputs,id:randomUUID(),port:3381,arch:'arm64',inputRoots,inputs,backup:{sha:'a'.repeat(40),remoteSha:'a'.repeat(40),remoteRef:'refs/heads/fixture',verifiedAt:'2026-10-01T00:00:00Z',inputs:structuredClone(inputs)},runtime:{cacheRoot:cache,releaseInfoPath:path.join(root,'release.json'),releaseInfoSha256:hash(JSON.stringify(release)),files:inventory(runtime,['nwjs.app'])}};
  return {root,source,cache,runtime,outputs,config,remove:()=>fs.rmSync(root,{recursive:true,force:true})};
}
async function spyBuild(args){
  assert.equal(args.platform,'osx');assert.equal(args.arch,'arm64');assert.equal(args.version,'0.111.2');assert.equal(args.glob,false);assert.equal(args.zip,false);assert.equal(args.managedManifest,false);assert.equal(args.flavor,'normal');assert.equal(args.releaseInfo.components.chromium,'148.0.0');
  assert(!('downloadUrl' in args));assert(!('manifestUrl' in args));const packageInfo=JSON.parse(fs.readFileSync(path.join(args.srcDir,'package.json')));assert.equal(packageInfo.nwbuild,undefined);assert.equal(packageInfo.dependencies,undefined);assert.equal(packageInfo.scripts,undefined);assert.equal(packageInfo.type,undefined);assert.equal(packageInfo.main,'http://127.0.0.1:3381/index.html?demo=1');assert(packageInfo['chromium-args'].includes('/user-state/profile'));assert(!packageInfo['chromium-args'].includes('./userdata'));assert.deepEqual(packageInfo['node-remote'],['http://127.0.0.1:3381','http://localhost:3381']);
  const server=fs.readFileSync(path.join(args.srcDir,'node-main.js'),'utf8');assert(server.includes('const PORT = 3381;'));assert(server.includes('/user-state/saves'));assert(!server.includes('EXODUSER-HELL'));
  const app=path.join(args.outDir,args.app.name+'.app');const write=(relative,data)=>{const absolute=path.join(app,relative);fs.mkdirSync(path.dirname(absolute),{recursive:true});fs.writeFileSync(absolute,data);};
  write('Contents/MacOS/'+args.app.name,fs.readFileSync(path.join(args.cacheDir,'nwjs-v0.111.2-osx-'+args.arch,'nwjs.app/Contents/MacOS/nwjs')));write('Contents/Info.plist',plistBuild({CFBundleExecutable:args.app.name}));
  for(const suffix of ['', ' (Alerts)',' (GPU)',' (Renderer)']){const name=args.app.name+' Helper'+suffix,base='Contents/Frameworks/nwjs Framework.framework/Versions/148.0.0/Helpers/'+name+'.app/Contents/';write(base+'MacOS/'+name,'synthetic');write(base+'Info.plist',plistBuild({CFBundleExecutable:name}));}
  function copyTree(source,relative=''){for(const name of fs.readdirSync(source)){const sourcePath=path.join(source,name),next=relative?relative+'/'+name:name;if(fs.statSync(sourcePath).isDirectory())copyTree(sourcePath,next);else write('Contents/Resources/app.nw/'+next,fs.readFileSync(sourcePath));}}
  copyTree(args.srcDir);write('Contents/Resources/app.nw/package.json',JSON.stringify({...packageInfo,product_string:args.app.name}));
}
test('설치라이브러리shape/고정hash index→getter, bld→osx 확인',()=>{const evidence=libraryEvidence();const index=fs.readFileSync(evidence.entry,'utf8'),bld=fs.readFileSync(evidence.buildEntry,'utf8');assert(index.includes('await get({'));assert(bld.includes('export default bld;'));assert(bld.includes('await fs.promises.rm(outDir'));assert(bld.includes("platform === 'osx'"));console.log(JSON.stringify({libraryEvidence:evidence}));});
test('import만으로애플리케이션I/O/adapter실행0',()=>{const moduleURL=new URL('../mac-packager-cli.mjs',import.meta.url).href;const probe=spawnSync(process.execPath,['--input-type=module','-e',`import fs from 'node:fs';for(const key of ['readFileSync','writeFileSync','mkdirSync','rmSync','lstatSync','readdirSync','openSync']){const original=fs[key];fs[key]=function(...args){if(new Error().stack.includes('getSourceSync (node:internal/modules/esm/load:'))return original.apply(this,args);throw Error('unexpected application I/O '+key)}};await import(${JSON.stringify(moduleURL)});console.log('IMPORT_ONLY_PASS');`],{encoding:'utf8'});assert.equal(probe.status,0,probe.stderr);assert(probe.stdout.includes('IMPORT_ONLY_PASS'));});
test('기본plan 읽기전용·실제spy build 인자·최소파생·원본보존',async()=>{const state=fixture();try{const before=inventory(state.source,state.config.inputRoots);const proposal=plan(state.config);assert.equal(proposal.status,'READY_PLAN_ONLY');assert.equal(fs.existsSync(proposal.job),false);let calls=0;const result=await execute(state.config,{approved:true,build:async args=>{calls++;assert.equal(fs.readdirSync(args.outDir).length,0);console.log(JSON.stringify({actualSpyArgs:args,derivedPackage:JSON.parse(fs.readFileSync(path.join(args.srcDir,'package.json')))}));await spyBuild(args);}});assert.equal(calls,1);assert.equal(result.status,'FIXTURE_ONLY');assert.equal(result.packageCreated,false);assert.deepEqual(inventory(state.source,state.config.inputRoots),before);}finally{state.remove();}});
test('승인없으면예약/호출0',async()=>{const state=fixture();try{await assert.rejects(execute(state.config),/APPROVAL/);assert.equal(fs.readdirSync(state.outputs).length,0);}finally{state.remove();}});
test('profile은무공백절대토큰·나머지flags/고유save격리보존',()=>{const state=fixture();try{const proposal=plan(state.config);assert.equal(proposal.status,'READY_PLAN_ONLY');assert.equal(proposal.derivedPackage['chromium-args'],`--user-data-dir=${proposal.paths.profile} --existing-flag`);assert(path.isAbsolute(proposal.paths.profile));assert(proposal.paths.profile.startsWith(proposal.job+path.sep));assert(proposal.paths.saveRoot.startsWith(proposal.job+path.sep));assert(!proposal.derivedPackage['chromium-args'].includes('"'));assert.equal(fs.existsSync(proposal.job),false);}finally{state.remove();}});
for(const [name,suffix] of [['space',' space'],['double-quote','"quote'],['single-quote',"'quote"],['tab','\ttab'],['newline','\nline'],['control','\x01control'],['delete','\x7fdelete'],['unicode-space','\u00a0space']])test('profile '+name+' PLAN BLOCKED·예약/adapter0',async()=>{const state=fixture();try{const changed=state.outputs+suffix;fs.renameSync(state.outputs,changed);state.config.outputRoot=changed;const proposal=plan(state.config);assert.equal(proposal.status,'BLOCKED');assert.equal(proposal.error,'UNSUPPORTED_PROFILE_ARGUMENT_PATH');let calls=0;await assert.rejects(execute(state.config,{approved:true,build:()=>{calls++;}}),/UNSUPPORTED_PROFILE_ARGUMENT_PATH/);assert.equal(calls,0);assert.deepEqual(fs.readdirSync(changed),[]);}finally{state.remove();}});
const mutations={
 'runtime없음':state=>delete state.config.runtime,
 'cache없음':state=>state.config.runtime.cacheRoot=path.join(state.root,'missing'),
 '출력충돌':state=>fs.mkdirSync(path.join(state.outputs,'mac-packager-'+state.config.id)),
 '입력SHA변경':state=>fs.writeFileSync(path.join(state.source,'game.html'),'changed'),
 '원격입력SHA다름':state=>state.config.backup.inputs[0].sha256='b'.repeat(64),
 '원격commit다름':state=>state.config.backup.remoteSha='b'.repeat(40),
 '원격ref없음':state=>delete state.config.backup.remoteRef,
 '파일누락':state=>fs.unlinkSync(path.join(state.source,'index.html')),
 '명시목록누락':state=>state.config.inputs.pop(),
 '목록밖asset추가':state=>fs.writeFileSync(path.join(state.source,'assets/two.dat'),'new'),
 'save포함':state=>state.config.inputRoots.push('saves/player.json'),
 'profile포함':state=>state.config.inputRoots.push('userdata/Preferences'),
 '기존dist포함':state=>state.config.inputRoots.push('dist/game.html'),
 '기존app포함':state=>state.config.inputRoots.push('old.app/Contents'),
 '입력탈출':state=>state.config.inputRoots.push('../outside'),
 '입력symlink':state=>{fs.renameSync(path.join(state.source,'game.html'),path.join(state.source,'original.html'));fs.symlinkSync('original.html',path.join(state.source,'game.html'));},
 '출력부모symlink':state=>{fs.symlinkSync(state.outputs,path.join(state.root,'link'));state.config.outputRoot=path.join(state.root,'link');},
 'runtime탈출symlink':state=>fs.symlinkSync(state.source,path.join(state.runtime,'nwjs.app/escape')),
 'runtimeSHA변경':state=>fs.writeFileSync(path.join(state.runtime,'nwjs.app/Contents/Info.plist'),'changed'),
 'releaseInfo변경':state=>fs.writeFileSync(state.config.runtime.releaseInfoPath,'{}'),
 'arch다름':state=>state.config.arch='x64',
 '기존3333':state=>state.config.port=3333,
 '현재3340':state=>state.config.port=3340,
 '파생치환원문변경':state=>{fs.writeFileSync(path.join(state.source,'node-main.js'),'unexpected source');state.config.inputs=inventory(state.source,state.config.inputRoots);state.config.backup.inputs=structuredClone(state.config.inputs);}
};
for(const [name,mutate] of Object.entries(mutations))test(name+' BLOCKED·execute호출0',async()=>{const state=fixture();try{mutate(state);const result=plan(state.config);assert.equal(result.status,'BLOCKED',JSON.stringify(result));let calls=0;await assert.rejects(execute(state.config,{approved:true,build:()=>{calls++;}}));assert.equal(calls,0);}finally{state.remove();}});
test('adapter실패는소유job만정리·기존marker보존',async()=>{const state=fixture();try{fs.writeFileSync(path.join(state.outputs,'preserved'),'preserve');await assert.rejects(execute(state.config,{approved:true,build:async()=>{throw Error('fixture adapter failure');}}),error=>error.cleanup==='owned-new-job-removed');assert.deepEqual(fs.readdirSync(state.outputs),['preserved']);}finally{state.remove();}});
test('라이브러리osx가오류삼켜도출력검증실패·정리',async()=>{const state=fixture();try{await assert.rejects(execute(state.config,{approved:true,build:async()=>{}}),error=>error.cleanup==='owned-new-job-removed');assert.equal(fs.readdirSync(state.outputs).length,0);}finally{state.remove();}});
test('두execute충돌·기존job삭제0',async()=>{const state=fixture();try{const result=await execute(state.config,{approved:true,build:spyBuild});await assert.rejects(execute(state.config,{approved:true,build:spyBuild}),/JOB_ALREADY_EXISTS/);assert(fs.existsSync(result.job));}finally{state.remove();}});
test('미지정arch는실제process.arch 사용',()=>{const state=fixture();try{delete state.config.arch;assert.equal(process.arch,'arm64');assert.equal(plan(state.config).args.arch,process.arch);}finally{state.remove();}});
test('명시x64는로컬runtime헤더검증후osx/x64연결',()=>{const state=fixture();try{const changed=path.join(state.cache,'nwjs-v0.111.2-osx-x64');fs.renameSync(state.runtime,changed);state.config.arch='x64';const binary=Buffer.alloc(32);binary.writeUInt32LE(0xfeedfacf);binary.writeUInt32LE(0x01000007,4);fs.writeFileSync(path.join(changed,'nwjs.app/Contents/MacOS/nwjs'),binary);state.config.runtime.files=inventory(changed,['nwjs.app']);const result=plan(state.config);assert.equal(result.status,'READY_PLAN_ONLY');assert.equal(result.args.arch,'x64');assert.equal(result.args.platform,'osx');}finally{state.remove();}});
test('부분osx실패·잘못된plist는성공반환금지',async()=>{const state=fixture();try{await assert.rejects(execute(state.config,{approved:true,build:async args=>{await spyBuild(args);fs.writeFileSync(path.join(args.outDir,args.app.name+'.app/Contents/Info.plist'),plistBuild({CFBundleExecutable:'nwjs'}));}}),error=>error.cleanup==='owned-new-job-removed'&&error.message.includes('MAC_RENAME_NOT_COMPLETED'));assert.equal(fs.readdirSync(state.outputs).length,0);}finally{state.remove();}});
