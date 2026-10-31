// Unity를 실행하지 않고 납품 경로, 고정 GUID, URP 재질 연결, 원본 출처를 생성한다.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root='I:/EXODUSER-Storage/demo-art/blender-env/forest-r1', dest=root+'/delivery', kit=dest+'/Assets/Exoduser/Art/Environment/CH1_1_RottenForest';
const guid=p=>crypto.createHash('md5').update('exoduser.blender-forest.20261030/'+p.replaceAll('\\','/')).digest('hex');
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const list=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(x=>x.isDirectory()?list(p+'/'+x.name):[p+'/'+x.name]);
if(!fs.existsSync(root+'/source/완료.json'))throw Error('베이크·렌더 종료 전 납품 금지');
const rows=JSON.parse(fs.readFileSync(root+'/source/모듈명세.json','utf8'));
const write=(p,s)=>fs.writeFileSync(p,s,'utf8');
const ref=(p,fileID=2800000)=>`{fileID: ${fileID}, guid: ${guid(p)}, type: ${fileID===2800000?3:2}}`;
for(const r of rows){
 const id=r.id, mp=`Assets/Exoduser/Art/Environment/CH1_1_RottenForest/Materials/${id}.mat`;
 const tx=k=>`Assets/Exoduser/Art/Environment/CH1_1_RottenForest/Textures/${id}_${k}.png`;
 for(const k of ['BaseColor','Normal','AO','Curvature','Roughness','Metallic','MetallicSmoothness']){
  const p=tx(k);if(!fs.existsSync(dest+'/'+p))continue;
  write(dest+'/'+p+'.meta',`fileFormatVersion: 2\nguid: ${guid(p)}\nTextureImporter:\n  internalIDToNameTable: []\n  externalObjects: {}\n  serializedVersion: 13\n  mipmaps:\n    mipMapMode: 0\n    enableMipMap: 1\n    sRGBTexture: ${k==='BaseColor'?1:0}\n    linearTexture: 0\n  isReadable: 0\n  textureFormat: 1\n  maxTextureSize: ${r.텍스처해상도}\n  textureSettings:\n    serializedVersion: 2\n    filterMode: 2\n    aniso: 8\n    mipBias: 0\n    wrapU: 0\n    wrapV: 0\n    wrapW: 0\n  nPOTScale: 0\n  alphaUsage: ${k==='MetallicSmoothness'?1:0}\n  alphaIsTransparency: 0\n  textureType: ${k==='Normal'?1:0}\n  textureShape: 1\n  convertToNormalMap: 0\n  flipGreenChannel: 0\n  userData: Blender환경킷20261030\n  assetBundleName:\n  assetBundleVariant:\n`);
 }
 const maps=[['_BaseMap','BaseColor'],['_BumpMap','Normal'],['_OcclusionMap','AO'],['_MetallicGlossMap','MetallicSmoothness']].map(([a,b])=>`    - ${a}:\n        m_Texture: ${ref(tx(b))}\n        m_Scale: {x: 1, y: 1}\n        m_Offset: {x: 0, y: 0}`).join('\n');
 write(dest+'/'+mp,`%YAML 1.1\n%TAG !u! tag:unity3d.com,2011:\n--- !u!21 &2100000\nMaterial:\n  serializedVersion: 8\n  m_ObjectHideFlags: 0\n  m_CorrespondingSourceObject: {fileID: 0}\n  m_PrefabInstance: {fileID: 0}\n  m_PrefabAsset: {fileID: 0}\n  m_Name: ${id}\n  m_Shader: {fileID: 4800000, guid: 933532a4fcc9baf4fa0491de14d08ed7, type: 3}\n  m_Parent: {fileID: 0}\n  m_ModifiedSerializedProperties: 0\n  m_ValidKeywords:\n  - _NORMALMAP\n  - _OCCLUSIONMAP\n  - _METALLICSPECGLOSSMAP\n  m_InvalidKeywords: []\n  m_LightmapFlags: 4\n  m_EnableInstancingVariants: 1\n  m_DoubleSidedGI: 0\n  m_CustomRenderQueue: -1\n  stringTagMap:\n    RenderType: Opaque\n  disabledShaderPasses: []\n  m_SavedProperties:\n    serializedVersion: 3\n    m_TexEnvs:\n${maps}\n    m_Ints: []\n    m_Floats:\n    - _Surface: 0\n    - _Blend: 0\n    - _Cull: 2\n    - _ZWrite: 1\n    - _AlphaClip: 0\n    - _WorkflowMode: 1\n    - _BumpScale: 0.7\n    - _OcclusionStrength: 0.6\n    - _Smoothness: 1\n    - _Metallic: 1\n    - _ReceiveShadows: 1\n    m_Colors:\n    - _BaseColor: {r: 1, g: 1, b: 1, a: 1}\n    - _EmissionColor: {r: 0, g: 0, b: 0, a: 1}\n  m_BuildTextureStacks: []\n`);
 write(dest+'/'+mp+'.meta',`fileFormatVersion: 2\nguid: ${guid(mp)}\nNativeFormatImporter:\n  externalObjects: {}\n  mainObjectFileID: 2100000\n  userData:\n  assetBundleName:\n  assetBundleVariant:\n`);
 const fp=`Assets/Exoduser/Art/Environment/CH1_1_RottenForest/Models/${id}.fbx`;
 write(dest+'/'+fp+'.meta',`fileFormatVersion: 2\nguid: ${guid(fp)}\nModelImporter:\n  serializedVersion: 22200\n  internalIDToNameTable: []\n  externalObjects:\n  - first:\n      type: UnityEngine:Material\n      assembly: UnityEngine.CoreModule\n      name: ${id}_베이크표적\n    second: ${ref(mp,2100000)}\n  materials:\n    materialImportMode: 1\n    materialName: 0\n    materialSearch: 1\n    materialLocation: 1\n  meshes:\n    lODScreenPercentages: []\n    globalScale: 1\n    meshCompression: 0\n    addColliders: 0\n    useSRGBMaterialColor: 1\n    sortHierarchyByName: 1\n    importVisibility: 1\n    importCameras: 0\n    importLights: 0\n    fileIdsGeneration: 2\n    swapUVChannels: 0\n    generateSecondaryUV: 0\n    useFileUnits: 1\n    bakeAxisConversion: 0\n    preserveHierarchy: 1\n    weldVertices: 1\n    indexFormat: 0\n    secondaryUVAngleDistortion: 8\n    secondaryUVAreaDistortion: 15.000001\n    secondaryUVHardAngle: 88\n    secondaryUVMarginMethod: 1\n    secondaryUVMinLightmapResolution: 40\n    secondaryUVMinObjectScale: 1\n    secondaryUVPackMargin: 4\n    normalSmoothAngle: 60\n    normalImportMode: 0\n    tangentImportMode: 3\n    normalCalculationMode: 4\n    legacyComputeAllNormalsFromSmoothingGroupsWhenMeshHasBlendShapes: 0\n    blendShapeNormalImportMode: 1\n    normalSmoothingSource: 0\n  animationType: 0\n  importAnimation: 0\n  userData: 독립Blender렌더검수후보_실게임미검증\n  assetBundleName:\n  assetBundleVariant:\n`);
}

// 후경 카드에만 투명 알파·양면·그림자 미수신을 적용. 불투명 나머지10종 보존.
{
 const id='RF_Forest_Vista_Card', mp=kit+'/Materials/'+id+'.mat', tp=kit+'/Textures/'+id+'_BaseColor.png.meta';
 let m=fs.readFileSync(mp,'utf8');m=m.replace('m_CustomRenderQueue: -1','m_CustomRenderQueue: 3000').replace('RenderType: Opaque','RenderType: Transparent').replace('disabledShaderPasses: []','disabledShaderPasses:\n  - ShadowCaster').replace('  - _NORMALMAP','  - _SURFACE_TYPE_TRANSPARENT\n  - _NORMALMAP').replace('- _Surface: 0','- _Surface: 1').replace('- _Cull: 2','- _Cull: 0').replace('- _ZWrite: 1','- _ZWrite: 0').replace('- _ReceiveShadows: 1','- _ReceiveShadows: 0').replace('    - _Blend: 0','    - _Blend: 0\n    - _SrcBlend: 5\n    - _DstBlend: 10\n    - _SrcBlendAlpha: 1\n    - _DstBlendAlpha: 10');fs.writeFileSync(mp,m);
 let tx=fs.readFileSync(tp,'utf8').replace('alphaUsage: 0','alphaUsage: 1').replace('alphaIsTransparency: 0','alphaIsTransparency: 1');fs.writeFileSync(tp,tx);
}
// 폴더 GUID는 다른 환경 킷과 충돌하지 않도록 날짜 네임스페이스로 고정.
function folders(p){for(const x of fs.readdirSync(p,{withFileTypes:true}))if(x.isDirectory()){const q=p+'/'+x.name;const rel=path.relative(dest,q).replaceAll('\\','/');write(q+'.meta',`fileFormatVersion: 2\nguid: ${guid(rel)}\nfolderAsset: yes\nDefaultImporter:\n  externalObjects: {}\n  userData:\n  assetBundleName:\n  assetBundleVariant:\n`);folders(q)}}
folders(dest+'/Assets/Exoduser/Art/Environment');
const files=list(dest).map(p=>({경로:path.relative(dest,p).replaceAll('\\','/'),sha256:sha(p),크기:fs.statSync(p).size}));
write(root+'/납품-파일영수증.json',JSON.stringify({시각:new Date().toISOString(),모듈:rows.length,파일:files,실행:{Unity:0,Player:0,구매:0,유료생성:0}},null,2));
console.log('납품 구조 생성',rows.length,files.length);
