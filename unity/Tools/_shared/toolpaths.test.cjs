const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
test('portable tool discovery, missing tools and temporary SDK policy',()=>{
  assert.ok(fs.existsSync(path.join(__dirname,'toolpaths.cjs')),'shared toolpaths implementation is required');
  const tools=require('./toolpaths.cjs'),root=fs.mkdtempSync(path.join(os.tmpdir(),'exo-toolpaths-test-'));
  try {
    const first=path.join(root,'first'),second=path.join(root,'second');fs.mkdirSync(first);fs.mkdirSync(second);
    const touch=(dir,name)=>{const file=path.join(dir,name);fs.writeFileSync(file,'');return file;};
    const dotnet=touch(first,'dotnet.exe'),override=touch(second,'custom.exe'),legacy=touch(second,'legacy.exe');
    const env={PATH:first+';'+second,PATHEXT:'.EXE;.CMD',EXO_DOTNET:override};
    assert.equal(tools.findTool('dotnet',{env,platform:'win32',legacy:[legacy]}),override);
    assert.equal(tools.findTool('dotnet',{env:{...env,EXO_DOTNET:'missing'},platform:'win32',legacy:[legacy]}),dotnet);
    assert.equal(tools.findTool('dotnet',{env:{PATH:''},platform:'win32',legacy:[legacy]}),legacy);
    assert.equal(tools.findTool('dotnet',{env:{PATH:''},platform:'win32',legacy:[]}),null);
    touch(first,'python.exe');const python3=touch(second,'python3.exe');
    assert.equal(tools.findTool('python',{env:{PATH:first+';'+second},platform:'win32',legacy:[]}),python3);
    assert.equal(tools.findTool('python',{env:{PATH:first,EXO_PYTHON:override},platform:'win32',legacy:[]}),override);
    const posix=touch(second,'dotnet');fs.chmodSync(posix,0o755);
    assert.equal(tools.findTool('dotnet',{env:{PATH:second},platform:'linux',legacy:[]}),posix);
    const missing=tools.spawnSync(null,[],{});assert.equal(missing.status,0);assert.match(missing.stdout,/건너뜀\(경로 없음\)/);
    const global=path.join(root,'global.json'),bytes=Buffer.from('{"sdk":{"version":"8.0.301","rollForward":"disable"}}\r\n');fs.writeFileSync(global,bytes);
    const normal=tools.prepareDotnet(['build','relative.csproj'],{cwd:root,env:{}});
    assert.equal(normal.options.cwd,root);normal.cleanup();
    const relaxed=tools.prepareDotnet(['build','relative.csproj'],{cwd:root,env:{EXO_DOTNET_ROLLFORWARD:'1'}});
    assert.notEqual(relaxed.options.cwd,root);assert.equal(relaxed.args[1],path.join(root,'relative.csproj'));
    assert.equal(JSON.parse(fs.readFileSync(path.join(relaxed.options.cwd,'global.json'))).sdk.rollForward,'latestPatch');
    assert.deepEqual(fs.readFileSync(global),bytes);const temp=relaxed.options.cwd;relaxed.cleanup();assert.equal(fs.existsSync(temp),false);
    const run=tools.prepareDotnet(['run','--project','relative.csproj','--','literal'],{cwd:root,env:{EXO_DOTNET_ROLLFORWARD:'1'}});
    assert.equal(run.args[2],path.join(root,'relative.csproj'));assert.equal(run.args[4],'literal');run.cleanup();
  } finally {fs.rmSync(root,{recursive:true});}
});
