// Extracted verifier/readFile/safeAncestors/digest only. No packager import, plan, execute, build or native fixture IO.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createHash}=require('node:crypto'),{createRequire}=require('node:module'),{pathToFileURL}=require('node:url'),{parse}=require('acorn');
const root=path.resolve(__dirname,'..'),sourcePath=path.join(root,'tools/team-followup-20261001/BUILD/mac-packager/packager.mjs');
const sha=data=>createHash('sha256').update(data).digest('hex'),plain=value=>JSON.parse(JSON.stringify(value));
const sourceBytes=fs.readFileSync(sourcePath),source=sourceBytes.toString('utf8'),ast=parse(source,{ecmaVersion:'latest',sourceType:'module'});
const names=['verifyOutput','readFile','safeAncestors','digest','requireValue'];
const blocks=names.map(name=>{
  const nodes=ast.body.filter(n=>n.type==='FunctionDeclaration'?n.id.name===name:n.type==='VariableDeclaration'&&n.declarations.length===1&&n.declarations[0].id.name===name);
  assert.equal(nodes.length,1,name+' exact source boundary');const n=nodes[0];return {name,code:source.slice(n.start,n.end),line:source.slice(0,n.start).split('\n').length};
});
const backend=blocks.find(b=>b.name==='verifyOutput');
const old="requireValue(readFile(path.join(helperRoot,helper+'.app/Contents/MacOS',helper)).length>0,'MAC_HELPER_RENAME_NOT_COMPLETED');";
const candidate="const helperBytes=readFile(path.join(helperRoot,helper+'.app/Contents/MacOS',helper));requireValue(helperBytes.length>0,'MAC_HELPER_RENAME_NOT_COMPLETED');const sourceHelper='nwjs Helper'+suffix;const expectedPath='nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/'+proposal.args.releaseInfo.components.chromium+'/Helpers/'+sourceHelper+'.app/Contents/MacOS/'+sourceHelper;const expectedPin=proposal.runtimeFiles.find(entry=>entry.path===expectedPath);requireValue(expectedPin&&/^[a-f0-9]{64}$/.test(expectedPin.sha256),'MAC_HELPER_PIN_MISSING_OR_INVALID');requireValue(digest(helperBytes)===expectedPin.sha256,'MAC_HELPER_SHA_MISMATCH:'+sourceHelper);";
const hasGuard=backend.code.includes(candidate);assert.equal(backend.code.split(hasGuard?candidate:old).length-1,1);
const control=hasGuard?backend.code.replace(candidate,old):backend.code;
const realRequire=createRequire(sourcePath),plist=realRequire('plist'),suffixes=['',' (Alerts)',' (GPU)',' (Renderer)'];
console.log('SOURCE_METADATA '+JSON.stringify({sourcePath,sha256:sha(sourceBytes),hasGuard,fragments:blocks.map(b=>({name:b.name,line:b.line,sha256:sha(b.code)})),controlSHA256:sha(control),transformation:'Only import.meta.url in extracted verifyOutput becomes original source file URL literal for VM Script grammar; no packager module evaluation',parser:'actual installed plist parse/build',fs:'synthetic Map payloads/descriptors/metadata only; no real app/runtime reads'}));
function fixture(){
  const proposal={paths:{output:'/memory-only/root-helper-check'},args:{app:{name:'EXODUSER-helper-fixture'},releaseInfo:{components:{chromium:'148.0.7778.97'}}},derivedPackage:{name:'fixture',main:'http://127.0.0.1:3383/index.html?demo=1'},derivedServer:'synthetic derived server',inputs:[],runtimeFiles:[]};
  const app=path.join(proposal.paths.output,proposal.args.app.name+'.app'),resource=path.join(app,'Contents/Resources/app.nw'),helperRoot=path.join(app,'Contents/Frameworks/nwjs Framework.framework/Versions',proposal.args.releaseInfo.components.chromium,'Helpers');
  const main=Buffer.from('synthetic opaque main: not Mach-O'),files=new Map([[path.join(app,'Contents/MacOS',proposal.args.app.name),main],[path.join(app,'Contents/Info.plist'),Buffer.from(plist.build({CFBundleExecutable:proposal.args.app.name}))],[path.join(resource,'package.json'),Buffer.from(JSON.stringify({...proposal.derivedPackage,product_string:proposal.args.app.name}))],[path.join(resource,'node-main.js'),Buffer.from(proposal.derivedServer)]]);
  proposal.runtimeFiles.push({path:'nwjs.app/Contents/MacOS/nwjs',sha256:sha(main)});
  const mappings=suffixes.map(suffix=>{
    const originalName='nwjs Helper'+suffix,helper=proposal.args.app.name+' Helper'+suffix;
    const originalPath='nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/'+proposal.args.releaseInfo.components.chromium+'/Helpers/'+originalName+'.app/Contents/MacOS/'+originalName;
    const outputPath=path.join(helperRoot,helper+'.app/Contents/MacOS',helper),plistPath=path.join(helperRoot,helper+'.app/Contents/Info.plist');
    const payload=Buffer.from('synthetic opaque helper: '+suffix+': not Mach-O');files.set(outputPath,payload);files.set(plistPath,Buffer.from(plist.build({CFBundleExecutable:helper})));
    const pin={path:originalPath,sha256:sha(payload)};proposal.runtimeFiles.push(pin);return {suffix,originalName,helper,originalPath,outputPath,plistPath,pin};
  });
  return {proposal,app,files,mappings};
}
function run(f,{legacy=false,fault=null}={}){
  const trace=[],fds=new Map();let nextFd=10;
  const event=(type,extra={})=>trace.push({type,...extra});
  const readError=new Error('synthetic descriptor read failure'),closeError=new Error('synthetic descriptor close failure');
  const fakeFs={constants:fs.constants,
    lstatSync(p){event('lstat',{path:p});return {isSymbolicLink:()=>fault?.kind==='symlink'&&fault.path===p};},
    openSync(p,flags){assert.equal(flags,fs.constants.O_RDONLY|fs.constants.O_NOFOLLOW);event('open',{path:p,flags});assert(f.files.has(p),'fixture path missing '+p);const fd=nextFd++;fds.set(fd,{path:p,stats:0});return fd;},
    fstatSync(fd){const d=fds.get(fd);assert(d,'live descriptor required');d.stats++;event('fstat',{path:d.path,ordinal:d.stats});return {isFile:()=>!(fault?.kind==='nonregular'&&fault.path===d.path),nlink:1,size:f.files.get(d.path).length,mtimeMs:fault?.kind==='changed'&&fault.path===d.path&&d.stats===2?2:1,ctimeMs:1};},
    readFileSync(fd){const d=fds.get(fd);assert(d,'descriptor only, no disk fallback');event('read',{path:d.path,bytes:f.files.get(d.path).length,sha256:sha(f.files.get(d.path))});if(fault?.kind==='read'&&fault.path===d.path)throw readError;return Buffer.from(f.files.get(d.path));},
    closeSync(fd){const d=fds.get(fd);assert(d,'close exactly once');event('close',{path:d.path});if(fault?.kind==='close'&&fault.path===d.path)throw closeError;fds.delete(fd);}
  };
  const context=vm.createContext({fs:fakeFs,path,createHash,createRequire,proposal:structuredClone(f.proposal)});
  const actual=blocks.map(b=>legacy&&b.name==='verifyOutput'?control:b.code).join('\n');
  assert.equal(actual.split('import.meta.url').length-1,1);
  vm.runInContext(actual.replace('import.meta.url',JSON.stringify(pathToFileURL(sourcePath).href)),context,{timeout:1000});
  let returned,error;try{returned=context.verifyOutput(context.proposal);}catch(e){error=e;}
  return {returned,error,trace,fds,readError,closeError,report:()=>({returned:returned??null,error:error?.message??null,trace:plain(trace),outstanding:fds.size}),count:(type,p)=>trace.filter(e=>e.type===type&&(!p||e.path===p)).length};
}
function closed(r){assert.equal(r.fds.size,0);assert.equal(r.count('open'),r.count('close'));}
function rejected(r,message){assert.equal(r.error?.message,message);assert.equal(r.returned,undefined);closed(r);}
function mapping(f,suffix){return f.mappings.find(m=>m.suffix===suffix);}
test('actual normal return, paths/read-once, plist and descriptor trace equal legacy source',()=>{
  const f=fixture(),actual=run(f),legacy=run(f,{legacy:true});assert.equal(actual.error,undefined);assert.equal(actual.returned,f.app);closed(actual);closed(legacy);assert.deepEqual(actual.report(),legacy.report());
  for(const m of f.mappings){assert.equal(actual.count('read',m.outputPath),1);assert.equal(actual.count('open',m.outputPath),1);assert.equal(actual.count('close',m.outputPath),1);assert.equal(actual.count('read',m.plistPath),1);}
});
for(const suffix of suffixes){
  test('one-byte helper alteration rejects '+(suffix||'base')+' while legacy accepted it',()=>{
    const f=fixture(),m=mapping(f,suffix),before=f.files.get(m.outputPath),altered=Buffer.from(before);altered[altered.length-1]^=1;
    assert.equal(altered.length,before.length);assert.equal([...altered].filter((b,i)=>b!==before[i]).length,1);f.files.set(m.outputPath,altered);
    const legacy=run(f,{legacy:true});assert.equal(legacy.error,undefined);closed(legacy);
    const r=run(f);rejected(r,'MAC_HELPER_SHA_MISMATCH:'+m.originalName);assert.equal(r.count('read',m.outputPath),1);assert.equal(r.count('read',m.plistPath),0);
  });
  test('missing original pin rejects '+(suffix||'base'),()=>{
    const f=fixture(),m=mapping(f,suffix);f.proposal.runtimeFiles=f.proposal.runtimeFiles.filter(p=>p!==m.pin);const r=run(f);rejected(r,'MAC_HELPER_PIN_MISSING_OR_INVALID');assert.equal(r.count('read',m.outputPath),1);assert.equal(r.count('read',m.plistPath),0);
  });
  test('invalid 64-lowercase-hex pin rejects '+(suffix||'base'),()=>{
    for(const value of [undefined,null,'','a'.repeat(63),'g'.repeat(64),'a'.repeat(65),mapping(fixture(),suffix).pin.sha256.toUpperCase()]){
      const f=fixture(),m=mapping(f,suffix);m.pin.sha256=value;rejected(run(f),'MAC_HELPER_PIN_MISSING_OR_INVALID');
    }
  });
  test('empty helper preserves original error/read-close boundary '+(suffix||'base'),()=>{
    const f=fixture(),m=mapping(f,suffix);f.files.set(m.outputPath,Buffer.alloc(0));const r=run(f),legacy=run(f,{legacy:true});rejected(r,'MAC_HELPER_RENAME_NOT_COMPLETED');assert.deepEqual(r.report(),legacy.report());assert.equal(r.count('read',m.outputPath),1);
  });
  test('wrong plist executable preserves original rejection '+(suffix||'base'),()=>{
    const f=fixture(),m=mapping(f,suffix);f.files.set(m.plistPath,Buffer.from(plist.build({CFBundleExecutable:'nwjs Helper'})));const r=run(f),legacy=run(f,{legacy:true});rejected(r,'MAC_HELPER_PLIST_NOT_COMPLETED');assert.deepEqual(r.report(),legacy.report());
  });
}
test('actual plist parser malformed input still fails with closed descriptors',()=>{
  const f=fixture(),m=mapping(f,' (GPU)');f.files.set(m.plistPath,Buffer.from('not a plist'));const r=run(f),legacy=run(f,{legacy:true});assert(r.error);assert.equal(r.error.message,legacy.error.message);closed(r);assert.deepEqual(r.report(),legacy.report());
});
test('SHA equality accepts opaque non-Mach-O bytes; this verifier has no machine/signature acceptance',()=>{
  const f=fixture(),m=mapping(f,' (GPU)');assert.notEqual(f.files.get(m.outputPath).readUInt32LE(0),0xfeedfacf);const r=run(f);assert.equal(r.error,undefined);assert.equal(r.returned,f.app);closed(r);
});
test('renamed destination path cannot substitute for original runtime pin path',()=>{
  const f=fixture(),m=mapping(f,' (GPU)');m.pin.path=m.outputPath;rejected(run(f),'MAC_HELPER_PIN_MISSING_OR_INVALID');
});
test('actual safeAncestors rejects synthetic helper symlink before open',()=>{
  const f=fixture(),m=mapping(f,' (GPU)'),r=run(f,{fault:{kind:'symlink',path:path.dirname(path.dirname(m.outputPath))}});rejected(r,'SYMLINK_PATH');assert.equal(r.count('open',m.outputPath),0);
});
for(const [kind,message]of [['nonregular','REGULAR_SINGLE_LINK_REQUIRED'],['read','synthetic descriptor read failure'],['changed','SOURCE_CHANGED']])test('actual readFile finally closes helper after '+kind+' failure',()=>{
  const f=fixture(),m=mapping(f,' (GPU)'),r=run(f,{fault:{kind,path:m.outputPath}});rejected(r,message);assert.equal(r.count('open',m.outputPath),1);assert.equal(r.count('close',m.outputPath),1);if(kind==='read')assert.equal(r.error,r.readError);
});
test('existing close failure propagates without new recovery or descriptor-closed claim',()=>{
  const f=fixture(),m=mapping(f,' (GPU)'),r=run(f,{fault:{kind:'close',path:m.outputPath}});assert.equal(r.error,r.closeError);assert.equal(r.fds.size,1);assert.equal(r.count('open',m.outputPath),1);assert.equal(r.count('close',m.outputPath),1);
  const legacy=run(f,{legacy:true,fault:{kind:'close',path:m.outputPath}});assert.deepEqual(r.report(),legacy.report());
});
test('main payload mismatch retains original early rejection',()=>{
  const f=fixture();f.proposal.runtimeFiles[0].sha256='0'.repeat(64);const r=run(f),legacy=run(f,{legacy:true});rejected(r,'MAC_RENAME_NOT_COMPLETED');assert.deepEqual(r.report(),legacy.report());
});
