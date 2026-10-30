const fs=require('fs'),cp=require('child_process'),path=require('path');
const root='I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2';
const script=path.resolve(__dirname,process.argv[2]||'woodbridge_make.py');
const env={...process.env,APPDATA:process.env.APPDATA||'C:/Users/심도진/AppData/Roaming',LOCALAPPDATA:process.env.LOCALAPPDATA||'C:/Users/심도진/AppData/Local',COMSPEC:'C:/Windows/System32/cmd.exe',SystemRoot:'C:/Windows',WINDIR:'C:/Windows',ProgramData:'C:/ProgramData',PATHEXT:'.COM;.EXE;.BAT;.CMD',TEMP:root+'/temp',TMP:root+'/temp'};
const logPath=root+'/'+path.basename(script)+'.'+new Date().toISOString().replace(/[:.]/g,'-')+'.log',fd=fs.openSync(logPath,'w');
const child=cp.spawn('G:/blander/blender.exe',['-b','-t','10','-P',script,'--',...process.argv.slice(3)],{cwd:root,env,windowsHide:true,stdio:['ignore',fd,fd]});
fs.writeFileSync(root+'/active-job.json',JSON.stringify({pid:child.pid,script,logPath,start:new Date().toISOString()},null,2));console.log('Blender 무창 시작',child.pid,logPath);
child.on('error',error=>{fs.closeSync(fd);fs.writeFileSync(root+'/'+path.basename(script)+'.exit.json',JSON.stringify({effectiveCode:1,시작오류:error.message,logPath},null,2));console.error('Blender 시작 실패',error.message);process.exitCode=1;});
child.on('exit',(code,signal)=>{fs.closeSync(fd);const pythonError=/Traceback \(most recent call last\):|SyntaxError:/.test(fs.readFileSync(logPath,'utf8'));const result={code,signal,effectiveCode:pythonError||signal||code!==0?1:0,pythonError,logPath,finished:new Date().toISOString()};fs.writeFileSync(root+'/'+path.basename(script)+'.exit.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));process.exitCode=result.effectiveCode;});
