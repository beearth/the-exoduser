const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../../..'),runtime=path.join(root,'unity/Assets/Exoduser/Runtime');
test('real fullrun loop consumes telegraphs after overrides and logs death before waiting',()=>{
  const source=fs.readFileSync(path.join(runtime,'NativeGame.FullRunQa.cs'),'utf8');
  assert.ok(source.includes('FullRunBossDefense('),'fullrun calls the actual boss defensive input adapter');
  const adapter=fs.readFileSync(path.join(runtime,'NativeGame.FullRunBossQa.cs'),'utf8');
  assert.ok(adapter.includes('sim.DruidTelegraphs(')&&adapter.includes('FullRunBossThreatPolicy.Decide('));
  assert.ok(source.indexOf('FullRunBossDefense(')>source.indexOf('BossArenaReviewInputs('),'defense is not overwritten by arena input policy');
  const death=source.indexOf('var deathRow=bossTrace.Death(');
  assert.ok(death>0&&death<source.indexOf('receipt.deaths++;'),'death snapshot captured before count/wait/retry');
  assert.ok(source.includes('FullRunBossTrace.Append(')&&source.includes('boss-deaths.jsonl'));
  assert.ok(source.includes('bossTrace.Remember(')&&source.includes('bossTrace.Clear();'));
  assert.ok(source.includes('renderArgs=FullRunBossTrace.RenderArguments(')&&source.includes('receipt.druidRemodel=sim.Druid.Remodel'));
  assert.doesNotMatch(adapter,/\b(?:p|sim\.Player)\.(?:Hp|MaxHp|X|Y)\s*(?:=(?!=)|\+=|-=|\*=|\/=)/,'QA adapter never changes player position or health');
});
