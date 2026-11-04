// Run through the shared exo-unity.ps1 guarded Node entry. Advisory Roslyn only: no Unity or Player process.
const cp=require('node:child_process'),path=require('node:path');
const root=path.resolve(__dirname,'../../..');
const result=cp.spawnSync('C:/Windows/System32/WindowsPowerShell/v1.0/powershell.exe',[
 '-NoProfile','-Command',
 "& 'I:/EXODUSER-Storage/unity-jobs/bin/buildloop/compile-check.ps1' -Project '"+root+"/unity' -LibraryProject 'G:/exoduser-wt/codex-unity-parity-1102/unity' -Output 'I:/EXODUSER-Storage/codex-takeover/druid-vfx5-impl/compile'"
],{encoding:'utf8',windowsHide:true,stdio:['ignore','pipe','pipe'],timeout:180000});
process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');if(result.error)process.stderr.write(String(result.error));process.exitCode=result.status??1;
