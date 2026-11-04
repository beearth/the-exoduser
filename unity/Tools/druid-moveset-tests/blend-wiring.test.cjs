const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
test('actual Animator uses pose crossfade and authored hold without delaying Core sampling',()=>{
 const source=fs.readFileSync(path.resolve(__dirname,'../../Assets/Exoduser/Runtime/NativeDruidRigAnimator.cs'),'utf8');
 assert.ok(source.includes('NativeDruidBlendPolicy.Missing('),'actual missing-clip decision preserves authored hold');
 assert.ok(source.includes('BeginBlend(')&&source.includes('ApplyBlend('),'actual sampling uses crossfade');
 assert.ok(source.includes('Vector3.Lerp(')&&source.includes('Quaternion.Slerp('),'position/scale/rotation are blended');
 const apply=source.indexOf('ApplyBlend(tick,plan);');
 assert.ok(apply>source.indexOf('playable.SetTime(SampleSeconds)')&&apply<source.indexOf('if(plan.StripHorizontalRoot'),'pose is sampled first, blended, then root motion stripped');
 assert.ok(source.includes('plan.Frame/60.0')&&source.includes('playable.SetSpeed(0)'),'Core sample clock remains authoritative');
 assert.ok(source.includes('if(frozen)return;')&&source.includes('plan.ElapsedTicks-blendElapsedStart'),'frozen state and forced clip clocks handled');
});
