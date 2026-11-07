const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../../Assets/Exoduser/Runtime');
const host=fs.readFileSync(path.join(root,'NativeGame.cs'),'utf8');
assert(host.indexOf('Simulation.ConfigureField(')<host.indexOf('Simulation.EnableFieldSpawns()'));
const remodel=fs.readFileSync(path.join(root,'NativeRemodel3D.cs'),'utf8');
// 11-08 x2: 배율 레이아웃에서도 3D가 켜진다(IsOriginal 게이트 제거). --remodel3d 스위치와 A2Scale 연결을 고정한다.
assert(!/FieldLayout\.FromArguments\([^)]*\)\.IsOriginal/.test(remodel),'Requested must not be gated on IsOriginal');
assert.match(remodel,/Requested =\s*\(Array\.IndexOf\(Environment\.GetCommandLineArgs\(\), "--remodel3d"\) >= 0/);
assert.match(fs.readFileSync(path.join(root,'A2FieldLayout.cs'),'utf8'),/FieldLayout\.FromArguments\(Environment\.GetCommandLineArgs\(\)\)\.Scale/);
const qa=fs.readFileSync(path.join(root,'NativeGame.FullRunQa.cs'),'utf8');
assert.match(qa,/List<FullRunStageMark> stageMarks/,'QA must record exact gate and boss event ticks');
assert.match(fs.readFileSync(path.join(root,'NativeGame.StageFlow.cs'),'utf8'),/fullRunStageEvent\?\.Invoke\(e\)/);
console.log('호스트 주입·2D 강제·실측 시점 계약 통과');
