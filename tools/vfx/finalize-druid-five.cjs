// Normalize only the lane's edited text files to their original newline style, and author deterministic Unity metadata.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..');
const changed=cp.spawnSync('git',['-C',root,'diff','--name-only','-z'],{encoding:'utf8',windowsHide:true});
if(changed.status!==0)throw Error(changed.stderr);
for(const rel of changed.stdout.split('\0').filter(Boolean)){
 if(!/\.(cs|cjs|md|shader)$/.test(rel))continue;
 const before=cp.spawnSync('git',['-C',root,'show','HEAD:'+rel],{encoding:'utf8',windowsHide:true});
 if(before.status!==0)throw Error(before.stderr);
 const file=path.join(root,rel),text=fs.readFileSync(file,'utf8');
 fs.writeFileSync(file,text.replace(/\r?\n/g,before.stdout.includes('\r\n')?'\r\n':'\n'));
}
for(const rel of ['Runtime/Vfx/DruidRemainingVfxTimeline.cs','Runtime/Vfx/DruidSkillVfxView.Remaining.cs','Resources/Shaders/DruidGroundBody.shader','Resources/Shaders/DruidRootBark.shader']){
 const file=path.join(root,'unity/Assets/Exoduser',rel);
 fs.writeFileSync(file+'.meta','fileFormatVersion: 2\nguid: '+crypto.createHash('md5').update('exoduser-druid-five-'+rel).digest('hex')+'\n');
}
// Validate authored socket names without starting/importing Unity.
const info=JSON.parse(fs.readFileSync(path.join(root,'unity/Assets/Exoduser/Resources/Art/Bosses/Druid/oldman-import.json'),'utf8'));
for(const bone of ['RightHand','Spine02','HK_RightHand','HK_Spine02'])if(!info.bones.includes(bone))throw Error('Missing source bone '+bone);
console.log('줄바꿈 보존, Unity 메타데이터 4개, 실제 소켓 본 4개 확인');
