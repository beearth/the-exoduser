const fs=require('fs'),cp=require('child_process'),path=require('path');
const root=__dirname,script=path.resolve(root,process.argv[2]);
const env={...process.env,APPDATA:process.env.APPDATA||'C:/Users/심도진/AppData/Roaming',LOCALAPPDATA:process.env.LOCALAPPDATA||'C:/Users/심도진/AppData/Local',COMSPEC:'C:/Windows/System32/cmd.exe',SystemRoot:'C:/Windows',WINDIR:'C:/Windows',ProgramData:'C:/ProgramData',PATHEXT:'.COM;.EXE;.BAT;.CMD',TEMP:root+'/temp',TMP:root+'/temp'};
const logPath=root+'/'+path.basename(script)+'.'+new Date().toISOString().replace(/[:.]/g,'-')+'.log',fd=fs.openSync(logPath,'w');
const child=cp.spawn('G:/blander/blender.exe',['-b','-t','10','-P',script,'--',...process.argv.slice(3)],{cwd:root,env,windowsHide:true,stdio:['ignore',fd,fd]});
fs.writeFileSync(root+'/active-job.json',JSON.stringify({pid:child.pid,script,logPath,start:new Date().toISOString()},null,2));console.log('Blender 무창 시작',child.pid,logPath);
child.on('error',e=>{console.error(e.message);process.exitCode=1});
child.on('exit',(code,signal)=>{fs.closeSync(fd);const pythonError=/Traceback \(most recent call last\):|SyntaxError:/.test(fs.readFileSync(logPath,'utf8'));const result={code,signal,effectiveCode:pythonError||signal||code!==0?1:0,pythonError,logPath,finished:new Date().toISOString()};fs.writeFileSync(root+'/'+path.basename(script)+'.exit.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));process.exitCode=result.effectiveCode});
