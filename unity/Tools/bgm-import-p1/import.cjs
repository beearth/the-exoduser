// Offline, silent import: node import.cjs <source-git-worktree> <outside-project-output> <ffmpeg> <ffprobe>
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const catalog=require('./catalog.json'),project=path.resolve(__dirname,'../..');
const [source,out,ffmpeg,ffprobe]=process.argv.slice(2);
if(!source||!out||!ffmpeg||!ffprobe)throw Error('source, output, ffmpeg, ffprobe required');
const output=path.resolve(out),dir=path.join(project,'Assets/Exoduser/Resources/Audio/Bgm');
if(output.startsWith(project+path.sep))throw Error('temporary sources must be outside the project');
fs.mkdirSync(output,{recursive:true});
const run=(exe,args)=>{const r=cp.spawnSync(exe,args,{stdio:['ignore','pipe','pipe'],encoding:'utf8',windowsHide:true,maxBuffer:8*1024*1024});if(r.status!==0)throw Error(`${exe}: ${r.stderr}`);return r;};
const measure=file=>{const r=run(ffmpeg,['-nostdin','-hide_banner','-i',file,'-af','loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json','-f','null','-']);return JSON.parse(r.stderr.match(/\{\s*"input_i"[\s\S]*?\}/)[0]);};
const reference=run('git',['-C',source,'rev-parse','origin/main']).stdout.trim(),rows=[];
for(const item of catalog){
 const temp=path.join(output,'source'+path.extname(item.file));
 const handle=fs.openSync(temp,'w');
 try{const r=cp.spawnSync('git',['-C',source,'show',`origin/main:bgm/${item.file}`],{stdio:['ignore',handle,'pipe'],windowsHide:true});if(r.status!==0)throw Error(r.stderr.toString());}finally{fs.closeSync(handle);}
 const input=measure(temp),dest=path.join(dir,item.clip+'.mp3');
 const filter=`loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=${input.input_i}:measured_TP=${input.input_tp}:measured_LRA=${input.input_lra}:measured_thresh=${input.input_thresh}:offset=${input.target_offset}:linear=true:print_format=json`;
 const second=run(ffmpeg,['-nostdin','-y','-hide_banner','-i',temp,'-map_metadata','-1','-af',filter,'-ar','44100','-ac','2','-c:a','libmp3lame','-b:a','192k',dest]);
 const pass2=JSON.parse(second.stderr.match(/\{\s*"input_i"[\s\S]*?\}/)[0]);
 const encoded=measure(dest),probe=JSON.parse(run(ffprobe,['-v','error','-show_entries','format=duration,size,bit_rate:stream=codec_name,sample_rate,channels,bit_rate','-of','json',dest]).stdout);
 if(Number(encoded.input_i)<-17||Number(encoded.input_i)>-15||Number(encoded.input_tp)>0)throw Error('encoded loudness outside contract: '+item.clip);
 const guid=fs.existsSync(dest+'.meta')?fs.readFileSync(dest+'.meta','utf8').match(/^guid: (.*)$/m)[1]:crypto.randomBytes(16).toString('hex');
 const meta=fs.readFileSync(path.join(dir,'hell1_rot_iron_oath.mp3.meta'),'utf8').replace(/^guid: .*$/m,'guid: '+guid);
 fs.writeFileSync(dest+'.meta',meta);
 rows.push({...item,sourceCommit:reference,pass1:input,pass2,encoded,probe});
 fs.writeFileSync(path.join(output,'loudnorm.json'),JSON.stringify(rows,null,2)+'\n');
 fs.unlinkSync(temp);
 console.log(JSON.stringify({clip:item.clip,LUFS:encoded.input_i,truePeak:encoded.input_tp,bytes:fs.statSync(dest).size}));
}
