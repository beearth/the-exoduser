const fs=require('node:fs'),cp=require('node:child_process'),crypto=require('node:crypto');
const root='G:/exoduser-wt/claude-map-look/godot',out=__dirname;
const processes=cp.execFileSync('tasklist.exe',['/FO','CSV','/NH'],{windowsHide:true,encoding:'utf8'}).split('\n').filter(x=>/godot/i.test(x));
if(processes.length)throw Error('Another Godot workload is active; preserving it');
const override=root+'/override.cfg',before=fs.readFileSync(override);
if(before.length)throw Error('Nonempty override owned by another run');
const marker='[application]\nconfig/custom_user_dir_name="EXODUSER-SteamCombat-Isolated-20261026"\n';
fs.writeFileSync(out+'/override-before.bin',before);
fs.writeFileSync(override,marker);
let restored=false;function restore(){if(restored)return;if(fs.readFileSync(override,'utf8')!==marker)throw Error('Concurrent override change preserved');fs.writeFileSync(override,before);restored=true;}
const exe='G:/godot-engine/4.7.2/Godot_v4.7.2-stable_win64_console.exe';
const args=['--path',root,'--audio-driver','Dummy','--position','4000,4000','--resolution','1920x1080','--script',out+'/capture.gd'];
fs.writeFileSync(out+'/run.json',JSON.stringify({exe,args,source:root,start:new Date().toISOString(),concurrentGodot:processes.length},null,2));
const p=cp.spawn(exe,args,{cwd:root,windowsHide:true,stdio:['ignore',fs.openSync(out+'/stdout.log','w'),fs.openSync(out+'/stderr.log','w')]});
const timeout=setTimeout(()=>{p.kill();},300000);console.log('capture pid '+p.pid);
p.on('error',e=>{clearTimeout(timeout);restore();throw e;});p.on('exit',code=>{clearTimeout(timeout);restore();fs.writeFileSync(out+'/exit.json',JSON.stringify({code,restored,finished:new Date().toISOString()}));console.log('capture exit '+code);process.exitCode=code||0;});
