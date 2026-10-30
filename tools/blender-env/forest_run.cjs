// 새 숲 키트 전용 순차 실행. Unity를 호출하지 않으며, 단계 실패 시 즉시 멈춘다.
const fs=require('fs'),cp=require('child_process'),path=require('path');
const root='I:/EXODUSER-Storage/demo-art/blender-env/forest-r1',code='G:/exoduser-wt/codex-blender-env/tools/blender-env';
const env={...process.env,APPDATA:process.env.APPDATA||'C:/Users/심도진/AppData/Roaming',LOCALAPPDATA:process.env.LOCALAPPDATA||'C:/Users/심도진/AppData/Local',COMSPEC:'C:/Windows/System32/cmd.exe',SystemRoot:'C:/Windows',WINDIR:'C:/Windows',ProgramData:'C:/ProgramData',PATHEXT:'.COM;.EXE;.BAT;.CMD',TEMP:root+'/temp',TMP:root+'/temp'};
const stages=[['forest_card.py'],['forest_rework.py'],['forest_uv_bake.py'],['forest_composite_tree.py'],['forest_card.py'],['forest_finish.cjs'],['forest_render.py'],['forest_verify_packed.py'],['forest_verify.py'],['forest_package.cjs'],['forest_boards.cjs'],['forest_validate.cjs'],['forest_validate_delivery.cjs']];
fs.mkdirSync(root+'/temp',{recursive:true});const receipts=[];
const resume=process.argv[2],at=resume?stages.findLastIndex(s=>s[0]===resume):0;if(at<0)throw Error('알 수 없는 재개 단계 '+resume);
for(const [name] of stages.slice(at)){
 const logPath=root+'/'+name+'.'+new Date().toISOString().replace(/[:.]/g,'-')+'.log',fd=fs.openSync(logPath,'w');
 console.log('시작',name);const py=name.endsWith('.py'),command=py?'G:/blander/blender.exe':'C:/nvm4w/nodejs/node.exe',args=py?['-b','-t','10','-P',code+'/'+name,...(name==='forest_render.py'&&process.argv[3]?['--','--only',...process.argv[3].split(',')]:[])]:[code+'/'+name];
 const r=cp.spawnSync(command,args,{cwd:root,env,windowsHide:true,stdio:['ignore',fd,fd]});fs.closeSync(fd);
 const log=fs.readFileSync(logPath,'utf8'),failed=r.error||r.status!==0||/Traceback \(most recent call last\):|SyntaxError:|Error: Python:|EXCEPTION_ACCESS_VIOLATION/.test(log);
 receipts.push({단계:name,code:r.status,실패:!!failed,logPath,시각:new Date().toISOString()});fs.writeFileSync(root+'/순차실행-영수증.json',JSON.stringify(receipts,null,2));
 if(failed){console.error('실패',name,log.slice(-3000));process.exit(1);}console.log('통과',name);
}
console.log('납품·기술 검수 순차 실행 완료. 시각 직접 검수/실게임 PASS와 구분.');
