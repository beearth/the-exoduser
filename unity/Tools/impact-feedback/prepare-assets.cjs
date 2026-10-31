// 새 런타임 자산만 생성한다. 공유 RM1 원본은 읽기 전용이다.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'../../Assets/Exoduser');
const out=path.join(root,'Resources/VFX/Impact');fs.mkdirSync(out,{recursive:true});
const guid=name=>crypto.createHash('md5').update('EXODUSER-impact-20261031/'+name).digest('hex');
function put(name,text,importer='DefaultImporter',sourceMeta){
 fs.writeFileSync(path.join(out,name),text);
 const meta=path.join(out,name+'.meta');
 fs.writeFileSync(meta,sourceMeta?fs.readFileSync(path.join(root,sourceMeta),'utf8').replace(/^guid: .+$/m,'guid: '+guid(name)):`fileFormatVersion: 2\nguid: ${guid(name)}\n${importer}:\n  externalObjects: {}\n`);
}
const graph=fs.readFileSync(path.join(root,'VFX/RM1/VFX_PoisonBurst.vfx'),'utf8').replace(/m_Name: VFX_PoisonBurst/g,'m_Name: VFX_ImpactBurst');
put('VFX_ImpactBurst.vfx',graph,'VisualEffectImporter','VFX/RM1/VFX_PoisonBurst.vfx.meta');
let stain=fs.readFileSync(path.join(root,'VFX/RM1/ShaderGraph/SG_GroundDecal.shadergraph'),'utf8');
stain=stain.replace('Exoduser/RM1','Exoduser/Impact');
const old='float a = saturate(we + wf + wh);';
if(!stain.includes(old))throw Error('원본 데칼 그래프의 마스크 진입점을 찾지 못했습니다.');
stain=stain.replace(old,'float soot = saturate(0.62 + sin(p.x*29.0 + sin(p.y*13.0))*0.22 + sin(p.y*37.0 + p.x*11.0)*0.18);\\nfloat edgeBreak = smoothstep(0.0, max(Radius*0.35,0.015), d + sin(ang*7.0)*Radius*0.08);\\nfloat a = saturate(fillM * 0.36 * soot * edgeBreak);');
put('SG_ImpactScorch.shadergraph',stain,'ScriptedImporter','VFX/RM1/ShaderGraph/SG_GroundDecal.shadergraph.meta');
put('M_ImpactScorch.mat',`%YAML 1.1\n%TAG !u! tag:unity3d.com,2011:\n--- !u!21 &2100000\nMaterial:\n  serializedVersion: 8\n  m_Name: M_ImpactScorch\n  m_Shader: {fileID: -6465566751694194690, guid: ${guid('SG_ImpactScorch.shadergraph')}, type: 3}\n  m_ValidKeywords: []\n  m_InvalidKeywords: []\n  m_LightmapFlags: 4\n  m_EnableInstancingVariants: 1\n  m_DoubleSidedGI: 0\n  m_CustomRenderQueue: -1\n  stringTagMap: {}\n  disabledShaderPasses: []\n  m_SavedProperties:\n    serializedVersion: 3\n    m_TexEnvs: []\n    m_Ints: []\n    m_Floats:\n    - _EdgeGlow: 0\n    - _Flash: 0\n    m_Colors: []\n  m_BuildTextureStacks: []\n`, 'NativeFormatImporter');
const folder=out+'.meta';if(!fs.existsSync(folder))fs.writeFileSync(folder,`fileFormatVersion: 2\nguid: ${guid('folder')}\nfolderAsset: yes\nDefaultImporter:\n  externalObjects: {}\n`);
for(const name of ['Runtime/NativeGame.Impact.cs','Runtime/NativeGame.ImpactReview.cs','Runtime/Vfx/ImpactResponse.cs','Runtime/Vfx/NativeImpactView.cs']){
 const meta=path.join(root,name+'.meta');if(!fs.existsSync(meta))fs.writeFileSync(meta,`fileFormatVersion: 2\nguid: ${guid(name)}\nMonoImporter:\n  externalObjects: {}\n  serializedVersion: 2\n  defaultReferences: []\n  executionOrder: 0\n  icon: {instanceID: 0}\n  userData:\n  assetBundleName:\n  assetBundleVariant:\n`);
}
console.log('타격용 VFX Graph·그을음 Shader Graph·참조 재질 생성 완료');
