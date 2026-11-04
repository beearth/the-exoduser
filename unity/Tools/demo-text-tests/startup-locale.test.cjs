const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),runtime=path.join(root,'Assets/Exoduser/Runtime');
const read=name=>fs.readFileSync(path.join(runtime,name),'utf8');
const game=read('NativeGame.cs'),stage=read('NativeGame.StageFlow.cs');
// Awake reaches UpdateViews through ResetRun before it creates NativeLobby.
const awake=game.slice(game.indexOf('void Awake()'),game.indexOf('public void ResetRun()'));
assert(awake.indexOf('ResetRun();')<awake.indexOf('lobby=gameObject.AddComponent<NativeLobby>()'));
const method=stage.slice(stage.indexOf('void StageFlowBossBar()'),stage.indexOf('void StageFlowSyncViews()'));
const expression=method.match(/bossBar\.LocaleCode\s*=\s*([^;]+);/)[1];
// This C#/JS shared expression subset is evaluated directly from the product source.
// It is a source regression contract, not an actual Unity startup or Player test.
assert(/^[\w.?!:"\s=]+$/.test(expression),'only the shared expression subset is evaluated');
const localeFor=new Function('lobby','return ('+expression+');');
assert.equal(localeFor(null),'ko','first ResetRun must retain the default before lobby exists');
const codes=JSON.parse(fs.readFileSync(path.join(root,'Assets/Exoduser/Resources/Data/demo_text.json'),'utf8')).codes;
for(const Language of codes)assert.equal(localeFor({Language}),Language,'live boss label locale '+Language);
assert(read('NativeBossBar.cs').includes('public string LocaleCode="ko"'),'same initial locale as the boss bar');
console.log(JSON.stringify({passed:true,checks:codes.length+1,scope:'actual source locale expression before/after lobby initialization; Unity/Player pending'}));
