const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const root='I:/EXODUSER-Storage/demo-art/blender-env/forest-r1';
const ids=['RF_Ancient_Rotten_Tree','RF_Fallen_Log','RF_Hanging_Moss','RF_Fungal_Colony','RF_Withered_Shrub','RF_Corroded_Riverbank','RF_Riverbed','RF_Foam_Bank','RF_Rotten_Wood_Bridge','RF_Broken_Stone_Bridge','RF_Forest_Vista_Card'];
assert(fs.existsSync(root+'/source/모듈명세.json'),'새 숲 모듈 명세가 없음');
const rows=JSON.parse(fs.readFileSync(root+'/source/모듈명세.json','utf8'));
assert.deepEqual(rows.map(r=>r.id).sort(),ids.slice().sort());
const verified=JSON.parse(fs.readFileSync(root+'/FBX-재수입검사.json','utf8'));
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
for(const r of rows){
 const f=root+'/delivery/Assets/Exoduser/Art/Environment/CH1_1_RottenForest/Models/'+r.id+'.fbx';
 const v=verified.find(v=>v.id===r.id); assert(v&&v.FBX_SHA256===hash(f),'최신 FBX 재수입 근거 불일치 '+r.id);
 assert(v.면적0===0&&v.고립정점===0&&v.UV범위오류===0);
 for(const k of ['BaseColor','Normal','AO','Curvature','Roughness','Metallic','MetallicSmoothness'])assert(fs.statSync(root+'/delivery/Assets/Exoduser/Art/Environment/CH1_1_RottenForest/Textures/'+r.id+'_'+k+'.png').size>100);
 for(const suffix of ['', '_side']) assert(fs.statSync(root+'/renders/'+r.id+suffix+'.png').size>1000);
}
console.log('새 숲 키트 11종 최신 FBX·7맵·양면 렌더 검사 PASS');
