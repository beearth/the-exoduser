import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
test('an explicit menu choice replaces an initial URL language override',()=>{
 const source=fs.readFileSync('index.html','utf8'),values=new Map();
 const location={href:'http://localhost:3333/index.html?lang=en&slot=existing',search:'?lang=en&slot=existing'};
 const context=vm.createContext({URL,URLSearchParams,location,console,document:{getElementById:()=>null},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)},history:{state:null,replaceState:(state,title,url)=>{location.href=String(url);location.search=new URL(url).search;}}});
 vm.runInContext(fs.readFileSync('localization-runtime.js','utf8'),context);
 vm.runInContext('const WorldIntroSubtitles=ExoduserI18n;const _I18N_SUPPORTED=ExoduserI18n.languages;let _i18nLogged=false;const _worldIntroSubtitles=null,_worldIntroPlayer=null;function detectSteamLanguage(){return "ko"}function detectBrowserLanguage(){return "ko"}function _applyLobbyLang(){globalThis.displayed=getCurrentLanguage()}',context);
 for(const name of ['getUserSelectedLanguage','getCurrentLanguage','setUserLanguage'])vm.runInContext(source.match(new RegExp('function '+name+'\\([^\\n]+'))[0],context);
 assert.equal(context.getCurrentLanguage(),'en');
 context.setUserLanguage('japanese');
 assert.equal(context.displayed,'ja');
 assert.equal(values.get('hellLang'),'ja');
 assert.equal(new URL(location.href).searchParams.get('slot'),'existing');
});
