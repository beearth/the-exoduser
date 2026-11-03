// Copies ONLY approved existing web art into the owned worktree; no generation.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),dest=path.join(root,'unity/Assets/Exoduser/Resources/Art/vfx/combat');
const names=['Dark_MediumImpact','Fire_ImpactFire_Sheet','Lightning_ImpactLightning_Sheet','Lightning_Lightning_FBF_4x3','Lightning_BasicImpact','impact_basic_sheet','Blood_FBF_4x4','Poison_MediumImpact','Dark_DarkSmoke_FBF_4x4','Light_ImpactLight_Sheet','Ice_ImpactIce_Sheet','Ice_MistSmoke_FBF_4x4','boss/vfx_holy_burst','boss/boss_death_blood_24_20261010'];
for(let i=0;i<6;i++)names.push('impact_el'+i+'_sheet','impact_el'+i+'_boss_sheet');
let bytes=0;
const guid=p=>crypto.createHash('md5').update('exoduser/combat-impact/'+p).digest('hex');
const folders=new Set([dest,path.join(dest,'boss')]);
for(const folder of folders){fs.mkdirSync(folder,{recursive:true});if(!fs.existsSync(folder+'.meta'))fs.writeFileSync(folder+'.meta','fileFormatVersion: 2\nguid: '+guid(path.relative(root,folder))+'\nfolderAsset: yes\nDefaultImporter:\n  externalObjects: {}\n');}
for(const name of names){
  const src='G:/exoduser/assets/vfx/'+name+'.png',target=path.join(dest,name+'.png');
  const data=fs.readFileSync(src);fs.writeFileSync(target,data);bytes+=data.length;
  // The existing ki_slash meta only specifies GUID. Explicit dimensions prevent
  // Unity's default 2048 import limit from shrinking 9/16-frame horizontal strips.
  fs.writeFileSync(target+'.meta',`fileFormatVersion: 2\nguid: ${guid(name)}\nTextureImporter:\n  externalObjects: {}\n  serializedVersion: 13\n  mipmaps:\n    enableMipMap: 0\n    sRGBTexture: 1\n  isReadable: 0\n  textureType: 0\n  textureShape: 1\n  maxTextureSize: 8192\n  textureSettings:\n    serializedVersion: 2\n    filterMode: 1\n    aniso: 1\n    mipBias: 0\n    wrapU: 1\n    wrapV: 1\n    wrapW: 1\n  nPOTScale: 0\n  alphaIsTransparency: 1\n  alphaUsage: 1\n  textureCompression: 0\n  platformSettings:\n  - serializedVersion: 3\n    buildTarget: DefaultTexturePlatform\n    maxTextureSize: 8192\n    resizeAlgorithm: 0\n    textureFormat: -1\n    textureCompression: 0\n    compressionQuality: 100\n    overridden: 0\n`);
  console.log(name+' '+data.readUInt32BE(16)+'x'+data.readUInt32BE(20));
}
for(const name of ['CombatImpactTimeline','CombatImpactView']){const file=path.join(root,'unity/Assets/Exoduser/Runtime/Vfx',name+'.cs.meta');fs.writeFileSync(file,'fileFormatVersion: 2\nguid: '+guid(name)+'\n');}
console.log(names.length+' PNGs, '+(bytes/1048576).toFixed(2)+' MiB');
