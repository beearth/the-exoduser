// Source contract for first-impression defects 3 (serif fonts) and 5 (main menu hierarchy, Unity version) of 11-04. Node only; no Unity.
const fs=require('node:fs'),path=require('node:path');
const project=path.resolve(__dirname,'../..'),rt=project+'/Assets/Exoduser/Runtime/';
const i=process.argv.indexOf('--out'),out=i>=0?process.argv[i+1]:'I:/EXODUSER-Storage/codex-takeover/first-impression/tests';
const read=n=>fs.readFileSync(rt+n,'utf8');const results=[];
const check=(name,ok,detail)=>results.push({name,passed:!!ok,detail:detail||''});
const title=read('NativeLobby.TitleMenu.cs'),silver=read('NativeLobby.SilverCharacter.cs'),story=read('NativeLobby.CharacterBasicStory.cs'),lobby=read('NativeLobby.cs'),flavor=read('BuildFlavor.cs');
// defect 3: no sans-serif font load in the target screens
for(const [n,src] of [['TitleMenu',title],['SilverCharacter',silver],['CharacterBasicStory',story]])check('no_noto_sans_in_'+n,!/NotoSans/.test(src.replace(/NotoSans24/g,'')),'');
const prompt=/DrawIntroPrompt\(K\("아무 키나 눌러 계속"/.test(lobby);check('intro_prompt_uses_serif_helper',prompt&&!/아무 키나 눌러 계속","Press any key to continue"\),small/.test(lobby));
check('intro_prompt_font_is_serif_helper',/introPrompt\.font\s*=\s*CharacterTitleFont\(text\)/.test(title));
check('serif_helpers_defined',/Font CharacterBodyFont\(string text\)/.test(silver)&&/Font CharacterTitleFont\(string text\)/.test(silver)&&/NanumMyeongjo-Regular/.test(silver)&&/Cinzel-600/.test(silver));
check('serif_helpers_keep_text_font_fallback',/NativeSilverHellUi\.TextFont\(characterSerif,text\)/.test(silver)&&/NativeSilverHellUi\.Covers\(characterCinzel,text\)/.test(silver));
check('paragraph_uses_serif_body',/new GUIStyle\(silverBody\)\{font=CharacterBodyFont\(text\)/.test(silver));
check('release_lock_label_not_sans',/var font=CharacterTitleFont\(label\);/.test(silver));
check('char_select_texts_use_serif_labels',(silver.match(/CharacterLabel\(/g)||[]).length>=6&&/CharacterLabel\(new Rect\(panel\.x\+inset,panel\.y\+28,inner,30\),row\.title/.test(story));
check('char_select_name_heading_playstyle_fonts',/CharacterTitleFont\(nameText\)/.test(silver)&&/CharacterTitleFont\(headingText\)/.test(silver)&&/CharacterTitleFont\(playstyle\)/.test(silver));
// defect 5: size, focus diamond, version
check('menu_row_height_64_width_440',/const float left = 116, top = 436, width = 440, rowH = 64;/.test(title));
check('menu_font_size_30_down_to_22',/int size = 30;/.test(title)&&/size > 22/.test(title));
check('menu_font_serif',/row\.SizedFont = CharacterTitleFont\(row\.Label\)/.test(title)&&!/titleMenuFont,\s*size/.test(title));
check('menu_focus_is_diamond_not_dash',/BakeTitleDiamond\(\)/.test(title)&&/titleDiamond, ScaleMode\.StretchToFill/.test(title)&&!/rect\.x\+13,rect\.center\.y-\.5f,16,1/.test(title));
check('menu_diamond_crimson_edge_bright',/194 \/ 255f, 26 \/ 255f, 16 \/ 255f/.test(title)&&/242 \/ 255f, 240 \/ 255f, 236 \/ 255f/.test(title));
check('menu_unfocused_dimmer_than_focused',/new Color\(150f \/ 255, 148f \/ 255, 145f \/ 255\), new Color\(246f \/ 255/.test(title));
check('menu_row_cache_keyed_by_label',/SizedFor != row\.Label/.test(title));
check('title_version_from_unity',/BuildFlavor\.UnityVersion/.test(title)&&!/BuildFlavor\.ReleaseVersion/.test(title));
check('unity_version_is_application_version',/public static string UnityVersion\{get\{return Application\.version\?\?"";\}\}/.test(flavor));
const ps=fs.readFileSync(project+'/ProjectSettings/ProjectSettings.asset','utf8'),bv=/^  bundleVersion: (.+)$/m.exec(ps);
const web=JSON.parse(fs.readFileSync(project+'/Assets/Exoduser/Resources/Data/release_web.json','utf8')).version;
// The Unity demo version number itself is a CTO decision (lead review 11-04); only require that the title no longer shows the web value.
check('lobby_version_line_from_unity',flavor.includes('VersionLine{get{Load();return "v"+UnityVersion+'),'VersionLine uses UnityVersion');
check('bundle_version_set_not_web',bv&&bv[1].trim().length>0&&bv[1].trim()!==web,(bv&&bv[1])+' vs web '+web);
check('release_version_property_unchanged_for_capture',/public static string ReleaseVersion\{get\{Load\(\);return release\.version\?\?"";\}\}/.test(flavor));
check('lobby_poster_design_untouched_enter_gate',/DrawSpaced\(960-tw\/2,r\.y,r\.height,"ENTER",silverLatin/.test(read('NativeLobby.SilverHell.cs')));
const failed=results.filter(r=>!r.passed),receipt={scope:'first impression 3/5 source contract',total:results.length,passed:results.length-failed.length,failed:failed.length,results};
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/receipt.json',JSON.stringify(receipt,null,1));
console.log(JSON.stringify({total:receipt.total,passed:receipt.passed,failed:failed.map(f=>f.name)}));process.exit(failed.length?1:0);
