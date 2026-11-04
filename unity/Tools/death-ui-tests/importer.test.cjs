// Executes the production importer's assignment/branch body as JavaScript (no Unity process).
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),file=path.join(root,'Assets/Exoduser/Editor/SourceTextureImporter.cs');
const source=fs.readFileSync(file,'utf8');
function method(name){const start=source.indexOf(name+'(');assert(start>=0,name);let a=source.indexOf('{',start),b=a+1,n=1;for(;n;b++){if(source[b]==='{')n++;if(source[b]==='}')n--;}return source.slice(a+1,b-1);}
function js(s){return s.replace(/\b(?:var|bool|string) /g,'let ').replace(/\(TextureImporter\)/g,'').replace(/System\.IO\.Path\.GetFileNameWithoutExtension\(([^)]+)\)/g,'basename($1)').replace(/\.StartsWith\(/g,'.startsWith(').replace(/\.EndsWith\(/g,'.endsWith(').replace(/\.Contains\(/g,'.includes(');}
const en=new Proxy({},{get:(_,key)=>String(key)}),ctx={basename:p=>path.basename(p,path.extname(p)),TextureImporterType:en,TextureImporterShape:en,TextureImporterNPOTScale:en,TextureImporterCompression:en,UnityEngine:{FilterMode:en,TextureWrapMode:en}};
let helpers='';if(source.includes('static bool OriginalUiNoMipmaps('))helpers='function OriginalUiNoMipmaps(assetPath){'+js(method('OriginalUiNoMipmaps'))+'}';
const apply=vm.runInNewContext(helpers+'\n(function(assetPath,assetImporter){'+js(method('OnPreprocessTexture'))+';return assetImporter;})',ctx);
const art='Assets/Exoduser/Resources/Art/',dir=path.join(root,art,'ui/silver_hell');
const names=['btn_primary_composed','btn_plaque_20261029','guide_button_glow','lobby_enter_btn_silver_20261029','lobby_enter_disabled','visual_create','visual_cancel','visual_disabled','name_create','name_cancel','name_panel','name_input','panel_frame_20261029','panel_corner_0','panel_corner_1','btn_chip_1x','btn_chip_2x','lobby_enter_ready_1x','lobby_enter_ready_2x','lobby_enter_disabled_1x','lobby_enter_disabled_2x'];
let failed=0,checks=0;function check(ok,label){checks++;if(!ok){failed++;console.log('FAIL '+label);}}
for(const name of names){const t={};apply(art+'ui/silver_hell/'+name+'.png',t);check(t.mipmapEnabled===false&&t.filterMode==='Bilinear','import settings '+name);
 const meta=fs.readFileSync(path.join(dir,name+'.png.meta'),'utf8');check(/enableMipMap: 0/.test(meta)&&/filterMode: 1/.test(meta),'committed meta '+name);}
for(const [rel,mip,filter] of [['CharacterSelect/UI/button_iron.png',false,'Bilinear'],['ui/other/button.png',true,'Trilinear'],['ui/silver_hell/trait_silver.png',true,'Trilinear'],['skill_icons/test.png',true,'Trilinear'],['player/test.png',false,'Point'],['enemy/test.png',false,'Point'],['map/a2/ground/floor_Diffuse.png',true,'Trilinear'],['TitleSignboard/A/motion-mask.png',false,'Bilinear']]){const t={};apply(art+rel,t);check(t.mipmapEnabled===mip&&t.filterMode===filter,'unrelated policy '+rel);}
// Read exact YAML scalars instead of assembling a RegExp inside a generated replacement string.
// Unity stores the effective size/compression in DefaultTexturePlatform; legacy root values may differ.
const iron=fs.readFileSync(path.join(root,art,'CharacterSelect/UI/button_iron.png.meta'),'utf8'),ironSettings={};
apply(art+'CharacterSelect/UI/button_iron.png',ironSettings);
function scalar(text,key){const line=text.split(/\r?\n/).map(s=>s.trim()).find(s=>s.startsWith(key+': '));assert(line,'missing meta scalar '+key);return Number(line.slice(line.indexOf(':')+1).trim());}
const platform=iron.split('buildTarget: DefaultTexturePlatform')[1];assert(platform,'default texture platform');
const defaults=platform.split(/\r?\n  - serializedVersion:/)[0];
for(const [property,key,expected,value] of [
 ['mipmapEnabled','enableMipMap',false,0],['filterMode','filterMode','Bilinear',1],
 ['textureType','textureType','Default',0],['textureShape','textureShape','Texture2D',1],
 ['alphaIsTransparency','alphaIsTransparency',true,1],['npotScale','nPOTScale','None',0]
])check(ironSettings[property]===expected&&scalar(iron,key)===value,'button_iron '+property+' matches importer');
check(ironSettings.maxTextureSize===scalar(defaults,'maxTextureSize'),'button_iron default platform size');
check(ironSettings.textureCompression==='Uncompressed'&&scalar(defaults,'textureCompression')===0,'button_iron default platform compression');
check(ironSettings.wrapMode==='Clamp'&&['wrapU','wrapV','wrapW'].every(key=>scalar(iron,key)===1),'button_iron clamp axes');
const overrides=[...iron.matchAll(/overridden: (\d+)/g)];
check(overrides.length>0&&overrides.every(m=>m[1]==='0'),'button_iron no active platform overrides');
check(/GetVersion\(\)\{return [4-9];\}/.test(source),'importer version invalidates old cached settings');
console.log(JSON.stringify({checks,failed,passed:failed===0,scope:'production branch/assignment semantics and meta; no Unity import or Player'}));process.exitCode=failed?1:0;
