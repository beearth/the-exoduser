// Advisory only: Unity compilation remains the final gate. Never starts Unity.
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process');
const slash = s => s.replace(/\\/g, '/');
const json = f => JSON.parse(fs.readFileSync(f, 'utf8').replace(/^\uFEFF/, ''));
function collectAssemblies(project, files) {
  const defs = new Map(), guids = new Map(), boundaries = new Map();
  for (const f of files.filter(f => f.endsWith('.asmdef')).sort()) {
    const d = json(path.join(project, f));
    if (defs.has(d.name)) throw Error('Duplicate assembly: ' + d.name);
    defs.set(d.name, {...d, sources: [], definition: f}); boundaries.set(path.posix.dirname(f), d.name);
    const meta = path.join(project, f + '.meta');
    if (fs.existsSync(meta)) { const m = /^guid:\s*(\S+)/m.exec(fs.readFileSync(meta, 'utf8')); if (m) guids.set(m[1], d.name); }
  }
  const resolve = name => name.startsWith('GUID:') ? (guids.get(name.slice(5)) || name) : name;
  for (const f of files.filter(f => f.endsWith('.asmref')).sort()) {
    const target = resolve(json(path.join(project, f)).reference);
    if (!defs.has(target)) throw Error('Unresolved asmref: ' + f + ' -> ' + target);
    const dir = path.posix.dirname(f);
    if (boundaries.has(dir)) throw Error('Duplicate assembly boundary: ' + dir);
    boundaries.set(dir, target);
  }
  for (const d of defs.values()) d.references = (d.references || []).map(resolve);
  for (const f of files.filter(f => f.endsWith('.cs')).sort()) {
    let dir = path.posix.dirname(f), owner;
    while (dir !== '.' && dir !== '/') { if (boundaries.has(dir)) {owner = boundaries.get(dir); break} dir = path.posix.dirname(dir); }
    if (!owner) {
      owner = f.split('/').includes('Editor') ? 'Assembly-CSharp-Editor' : 'Assembly-CSharp';
      if (!defs.has(owner)) defs.set(owner,{name:owner,sources:[],references:[],includePlatforms:owner.endsWith('-Editor')?['Editor']:[]});
    }
    defs.get(owner).sources.push(f);
  }
  for (const name of ['Assembly-CSharp','Assembly-CSharp-Editor']) {
    const d = defs.get(name); if (!d) continue;
    d.references = [...defs.values()].filter(x => x.name !== name && x.autoReferenced !== false && !x.name.startsWith('Assembly-CSharp') && (name.endsWith('-Editor') || !(x.includePlatforms || []).includes('Editor'))).map(x => x.name);
    if (name.endsWith('-Editor') && defs.has('Assembly-CSharp')) d.references.push('Assembly-CSharp');
  }
  return defs;
}
function templates(root) {
  const result=[];
  for (const e of fs.readdirSync(root,{withFileTypes:true})) {
    if (!e.isDirectory() || !e.name.endsWith('.dag')) continue;
    const dir=path.join(root,e.name);
    for (const f of fs.readdirSync(dir)) if(f.endsWith('.rsp')) {
      const full=path.join(dir,f), text=fs.readFileSync(full,'utf8');
      result.push({file:full,name:f.slice(0,-4),editor:/^-define:.*\bUNITY_EDITOR\b/m.test(text),text,mtime:fs.statSync(full).mtimeMs});
    }
  }
  return result.sort((a,b)=>b.mtime-a.mtime);
}
function main(args) {
  const options={}; for(let i=0;i<args.length;i+=2) options[args[i]]=args[i+1];
  const project=slash(path.resolve(options['--project'])), library=slash(path.resolve(options['--library'])), output=slash(path.resolve(options['--output']));
  if(!output.toLowerCase().startsWith('i:/exoduser-storage/')) throw Error('Output must be on I:/EXODUSER-Storage');
  fs.mkdirSync(output,{recursive:true});
  const git=cp.spawnSync('git',['-C',project,'ls-files','-co','--exclude-standard','-z','Assets'],{encoding:'utf8',windowsHide:true});
  if(git.status!==0)throw Error(git.stderr);
  const files=[...new Set(git.stdout.split('\0').filter(f=>f && /\.(cs|asmdef|asmref)$/.test(f) && fs.existsSync(path.join(project,f))))];
  const assemblies=collectAssemblies(project,files), rsp=templates(library+'/Library/Bee/artifacts'), results=[];
  fs.writeFileSync(output+'/assembly-sources.json',JSON.stringify([...assemblies.values()],null,2));
  for(const mode of ['Player','Editor']) {
    const dir=output+'/'+mode;fs.mkdirSync(dir,{recursive:true});const visited=new Set(), visiting=new Set();
    const eligible=d=>(!(d.includePlatforms||[]).length||(d.includePlatforms||[]).includes(mode==='Editor'?'Editor':'WindowsStandalone64')) && !(d.excludePlatforms||[]).includes(mode==='Editor'?'Editor':'WindowsStandalone64');
    const compile=d=>{
      if(visited.has(d.name)||!eligible(d))return;
      if(visiting.has(d.name))throw Error('Assembly cycle: '+d.name);visiting.add(d.name);
      for(const ref of d.references)if(assemblies.has(ref))compile(assemblies.get(ref));
      const template=rsp.find(r=>r.name===d.name && r.editor===(mode==='Editor'));
      if(!template)throw Error('No '+mode+' RSP template for '+d.name);
      if((d.defineConstraints||[]).length)throw Error('Advisory collector needs defineConstraints evaluation: '+d.name);
      let text=template.text.split(/\r?\n/).filter(l=>!/^"?Assets\/.*\.cs"?$/.test(l)).join('\n');
      text=text.replace(/"(Library|Packages)\//g,'"'+library+'/$1/');
      text=text.replace(/-out:"[^"]+"/,'-out:"'+dir+'/'+d.name+'.dll"').replace(/-refout:"[^"]+"/,'-refout:"'+dir+'/'+d.name+'.ref.dll"');
      text=text.replace(/(-r:|\/reference:)"([^"]+)"/g,(all,prefix,ref)=>{
        const name=path.posix.basename(ref).replace(/(?:\.ref)?\.dll$/,'');
        return visited.has(name)?prefix+'"'+dir+'/'+name+'.dll"':all;
      });
      text+='\n'+d.sources.map(f=>'"'+project+'/'+f+'"').join('\n')+'\n';
      const file=dir+'/'+d.name+'.rsp';fs.writeFileSync(file,text);
      const run=cp.spawnSync(options['--dotnet'],[options['--csc'],'-nologo','@'+file],{cwd:library,encoding:'utf8',windowsHide:true,maxBuffer:32*1024*1024});
      const log=(run.stdout||'')+(run.stderr||'')+(run.error?String(run.error):'');fs.writeFileSync(dir+'/'+d.name+'.log',log);
      const errors=log.split(/\r?\n/).filter(l=>/\berror (CS\d+|:)/.test(l));
      const result={mode,assembly:d.name,sources:d.sources.length,exit:run.status,errors:errors.length,template:template.file};results.push(result);
      console.log(mode+' '+d.name+' sources='+d.sources.length+' exit='+run.status+' errors='+errors.length);
      if(run.status!==0 || !fs.existsSync(dir+'/'+d.name+'.dll')) {console.log(errors.slice(0,15).join('\n'));throw Error('Advisory compilation failed: '+d.name)}
      visiting.delete(d.name);visited.add(d.name);
    };
    try{for(const d of assemblies.values())if(d.sources.length)compile(d)}catch(e){fs.writeFileSync(output+'/result.json',JSON.stringify({passed:false,results,error:e.message},null,2));throw e}
  }
  fs.writeFileSync(output+'/result.json',JSON.stringify({passed:true,results},null,2));
}
module.exports={collectAssemblies};
if(require.main===module){try{main(process.argv.slice(2))}catch(e){console.error(e.message);process.exitCode=1}}
