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
const names=['btn_primary_composed','btn_plaque_20261029','guide_button_glow','lobby_enter_btn_silver_20261029','lobby_enter_disabled','visual_create','visual_cancel','visual_disabled','name_create','name_cancel','name_panel','name_input','panel_frame_20261029','panel_corner_0','panel_corner_1'];
let failed=0,checks=0;function check(ok,label){checks++;if(!ok){failed++;console.log('FAIL '+label);}}
for(const name of names){const t={};apply(art+'ui/silver_hell/'+name+'.png',t);check(t.mipmapEnabled===false&&t.filterMode==='Bilinear','import settings '+name);
 const meta=fs.readFileSync(path.join(dir,name+'.png.meta'),'utf8');check(/enableMipMap: 0/.test(meta)&&/filterMode: 1/.test(meta),'committed meta '+name);}
for(const [rel,mip,filter] of [['ui/other/button.png',true,'Trilinear'],['ui/silver_hell/trait_silver.png',true,'Trilinear'],['skill_icons/test.png',true,'Trilinear'],['player/test.png',false,'Point'],['enemy/test.png',false,'Point'],['map/a2/ground/floor_Diffuse.png',true,'Trilinear'],['TitleSignboard/A/motion-mask.png',false,'Bilinear']]){const t={};apply(art+rel,t);check(t.mipmapEnabled===mip&&t.filterMode===filter,'unrelated policy '+rel);}
check(/GetVersion\(\)\{return [4-9];\}/.test(source),'importer version invalidates old cached settings');
console.log(JSON.stringify({checks,failed,passed:failed===0,scope:'production branch/assignment semantics and meta; no Unity import or Player'}));process.exitCode=failed?1:0;
