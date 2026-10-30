const fs=require('fs');const r='I:/EXODUSER-Storage/demo-art/blender-env',id=process.argv[2]||'HE_Deadwood_Hollow';
if(!['HE_Deadwood_Hollow','HE_Bone_Heap'].includes(id))throw Error('소유 모듈 범위 밖');
fs.copyFileSync(r+'/delivery/Assets/Exoduser/Art/Environment/CH1_1/Textures/'+id+'_BaseColor.png',r+'/source/최종원베이크/'+id+'_BaseColor.png');
console.log('새 스캔 베이크를 회화풍 마감 입력으로 교체');
