const fs=require('fs'),path=require('path'),crypto=require('crypto');
const i=process.argv.indexOf('--project');if(i<0)throw Error('Pass --project');const project=path.resolve(process.argv[i+1]);
const guid=rel=>crypto.createHash('md5').update('exoduser-unity-port-v1:'+rel.replaceAll('\\','/')).digest('hex');
const write=(name,bytes)=>{const file=path.join(project,name);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes)};
const scriptGuid=guid('Assets/Exoduser/Runtime/NativeGame.cs');
write('Assets/Scenes/FirstPlayable.unity',`%YAML 1.1
%TAG !u! tag:unity3d.com,2011:
--- !u!1 &1000
GameObject:
  m_ObjectHideFlags: 0
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  serializedVersion: 6
  m_Component:
  - component: {fileID: 1001}
  - component: {fileID: 1002}
  m_Layer: 0
  m_Name: EXODUSER Native CSharp
  m_TagString: Untagged
  m_IsActive: 1
--- !u!4 &1001
Transform:
  m_ObjectHideFlags: 0
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_GameObject: {fileID: 1000}
  serializedVersion: 2
  m_LocalRotation: {x: 0, y: 0, z: 0, w: 1}
  m_LocalPosition: {x: 0, y: 0, z: 0}
  m_LocalScale: {x: 1, y: 1, z: 1}
  m_ConstrainProportionsScale: 0
  m_Children: []
  m_Father: {fileID: 0}
  m_LocalEulerAnglesHint: {x: 0, y: 0, z: 0}
--- !u!114 &1002
MonoBehaviour:
  m_ObjectHideFlags: 0
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_GameObject: {fileID: 1000}
  m_Enabled: 1
  m_EditorHideFlags: 0
  m_Script: {fileID: 11500000, guid: ${scriptGuid}, type: 3}
  m_Name:
  m_EditorClassIdentifier:
`);
write('ProjectSettings/EditorBuildSettings.asset',`%YAML 1.1
%TAG !u! tag:unity3d.com,2011:
--- !u!1045 &1
EditorBuildSettings:
  m_ObjectHideFlags: 0
  serializedVersion: 2
  m_Scenes:
  - enabled: 1
    path: Assets/Scenes/FirstPlayable.unity
    guid: ${guid('Assets/Scenes/FirstPlayable.unity')}
  m_configObjects: {}
`);
let written=0;function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){
 if(e.name.endsWith('.meta'))continue;const file=path.join(dir,e.name),relative=path.relative(project,file).replaceAll('\\','/');
 const directory=fs.statSync(file).isDirectory();
 if(!fs.existsSync(file+'.meta')){fs.writeFileSync(file+'.meta','fileFormatVersion: 2\nguid: '+guid(relative)+'\n'+(directory?'folderAsset: yes\nDefaultImporter:\n  externalObjects: {}\n  userData:\n  assetBundleName:\n  assetBundleVariant:\n':''));written++;}
 if(directory)walk(file);
}}
walk(project+'/Assets');console.log(JSON.stringify({scene:'Assets/Scenes/FirstPlayable.unity',scriptGuid,metasCreated:written}));
