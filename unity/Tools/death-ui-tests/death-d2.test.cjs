// 11-04 death-pbz RETOUCH: D2 (29-language decision-screen text), minor 1 (empty lobby slot face), minor 2 (no sans on the decision screen).
// Source/data contracts only. Screen judgement (widths of th/el/ru, 3840 slot bleed) stays with the Mac capture.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),repo=path.resolve(root,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8'),rt=f=>read('Assets/Exoduser/Runtime/'+f);
let failed=0;const test=(name,fn)=>{try{fn();console.log('PASS '+name);}catch(e){failed++;console.log('FAIL '+name+': '+e.message);}};
const hangul=/[ᄀ-ᇿ㄰-㆏가-힣]/;
const keys=['title','caption','ask','rise','restart','giveUp','outArena','outRestart','outLobby'];
const data=JSON.parse(read('Assets/Exoduser/Resources/Data/death_decision_text.json'));
const core=rt('Core/LobbyLanguage.cs'),codes=JSON.parse('['+/static readonly string\[\] codes=\{([^}]*)\}/.exec(core)[1]+']');
test('D2-1 29 languages in the Core order, 9 keys each, no empty cell',()=>{
 assert.equal(codes.length,29);assert.deepEqual(data.entries.map(e=>e.code),codes);
 for(const e of data.entries)for(const k of keys)assert(typeof e[k]==='string'&&e[k].trim().length>0,e.code+'.'+k+' is empty');
 for(const e of data.entries)assert.deepEqual(Object.keys(e).sort(),['code',...keys].sort(),e.code+' has extra or missing keys');
});
test('D2-2 no Hangul outside ko; ko equals the registered source (No.4264~4272)',()=>{
 const ko=data.entries.find(e=>e.code==='ko');
 assert.deepEqual([ko.title,ko.caption,ko.ask,ko.rise,ko.restart,ko.giveUp,ko.outArena,ko.outRestart,ko.outLobby],
  ['안식은 없다','THERE IS NO REST','포기할 것인가?','다시 일어선다','처음부터 다시','포기한다','보스방 앞에서 다시 일어선다. 체력을 모두 되찾는다.','이번 여정을 처음부터 다시 시작한다.','로비로 돌아간다.']);
 for(const e of data.entries)if(e.code!=='ko')for(const k of keys)assert(!hangul.test(e[k]),e.code+'.'+k+' contains Hangul: '+e[k]);
 const en=data.entries.find(e=>e.code==='en');
 assert.deepEqual([en.title,en.ask,en.rise,en.restart,en.giveUp,en.outArena,en.outRestart,en.outLobby],
  ['There is no rest','Will you give up?','Rise again','Start over','Give up','Rise again before the boss room, at full health.','Start this journey over from the beginning.','Return to the lobby.']);
});
test('D2-3 decorative caption is the same English line everywhere; no ellipsis or placeholder; length bounds',()=>{
 for(const e of data.entries){
  assert.equal(e.caption,'THERE IS NO REST',e.code+' caption');
  for(const k of keys){assert(!/…|\.\.\.|\{|\}|TODO|\?\?\?/.test(e[k]),e.code+'.'+k+' has ellipsis/placeholder');}
  assert(e.title.length<=24,e.code+' title too long for 68px tracked run: '+e.title.length);
  assert(e.outArena.length<=100&&e.outRestart.length<=100&&e.outLobby.length<=100,e.code+' outcome too long');
 }
 for(const e of data.entries)if(!['en','ko'].includes(e.code)&&!['zh','zht','ja'].includes(e.code))assert.notEqual(e.title,data.entries.find(x=>x.code==='en').title,e.code+' title left in English');
 assert(fs.existsSync(path.join(root,'Assets/Exoduser/Resources/Data/death_decision_text.json.meta')),'.meta present');
});
test('D2-4 overlay reads the keys: no Korean literal is drawn, long text only shrinks (FitSize), ar draws as en, NativeGame passes the language',()=>{
 const o=rt('NativeDeathOverlay.cs').replace(/\r\n/g,'\n');
 const draw=o.slice(o.indexOf('public void Draw(){'),o.indexOf('// 9x9 design-px diamond'));
 assert(!hangul.test(draw),'Draw/DrawChoice still contain a Korean literal');
 assert(o.includes('Resources.Load<TextAsset>("Data/death_decision_text")'));
 for(const k of ['tx.title','tx.caption','tx.ask'])assert(draw.includes(k),k+' not read');
 assert(draw.includes('Label(c)')&&draw.includes('Outcome(c)'));
 assert((draw.match(/FitSize\(/g)||[]).length>=5,'title, caption, ask, choice and outcome all fit');
 assert(!/Substring\([^)]*\)\s*\+\s*"…"|…/.test(draw),'no ellipsis in draw code');
 assert(/code=="ar"\)code="en"/.test(o),'ar -> en rule');
 assert(rt('NativeGame.cs').includes('death.LocaleCode=lobby.Language;death.Draw();'));
 assert(/DecisionRowCount/.test(o));
 assert(o.replace(/\n/g,'\r\n').split('\r\n').length>1&&/\r\n/.test(rt('NativeDeathOverlay.cs')),'CRLF kept in NativeDeathOverlay.cs');
});
test('D2-5 translation list rows 4264~4272 say 29 languages propagated, none left "미전파"',()=>{
 const t=fs.readFileSync(path.join(repo,'docs/16번역·로컬라이제이션/번역대상_전체목록.md'),'utf8').split('\r\n');
 for(let n=4264;n<=4272;n++){const row=t.find(l=>l.startsWith('| '+n+' |'));assert(row,'row '+n);assert(row.includes('29개 언어 전파(Unity Resources/Data/death_decision_text.json)'),n+' not updated');assert(!row.includes('미전파'),n+' still 미전파');}
});
test('M2 decision screen draws no sans: Draw/DrawChoice use Hahmlet and Cinzel only (sans stays only in the retired replay shape)',()=>{
 const o=rt('NativeDeathOverlay.cs').replace(/\r\n/g,'\n');
 const draw=o.slice(o.indexOf('public void Draw(){'),o.indexOf('// 9x9 design-px diamond'));
 assert(!/\bsans\b|\bsansBold\b|NotoSans/.test(draw),'sans used in the decision draw path');
 assert(/hahmletLight/.test(draw)&&/\bhahmlet\b/.test(draw)&&/\bcinzel\b/.test(draw));
 const users=[...o.matchAll(/\bsans(Bold)?\b/g)].length;assert(users>0);
 const replay=o.slice(o.indexOf('public void DrawReplayShape('));
 const outside=o.replace(replay,'').replace(/Font nanum,sans,sansBold;/,'').replace(/sans=Resources\.Load[^;]*;sansBold=[^;]*;/,'').replace(/f==sansBold\?2:/,'');
 assert(!/\bsans(Bold)?\b/.test(outside),'sans referenced outside Init/Style/replay shape');
});
test('M1 empty slot face is lifted (Y 8.5) with alpha kept; judge6 test 1 carries the model',()=>{
 const s=rt('NativeLobby.SilverLobby.cs'),m=/SilverSlotFace=new Color\((\d+)\/255f,(\d+)\/255f,(\d+)\/255f,([\d.]+)f\)/.exec(s);assert(m);
 const y=.299*m[1]+.587*m[2]+.114*m[3];assert(Math.abs(y-8.5)<=.5,'face Y '+y.toFixed(2));
 assert(/DrawEmptySilverSlot\(Rect card\)\{Fill\(card,SilverSlotFace\)/.test(s));
});
console.log(JSON.stringify({groups:7,failed,passed:failed===0,scope:'data/source contracts; screen judgement pending'}));process.exitCode=failed?1:0;
