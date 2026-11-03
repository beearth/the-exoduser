// Read-only source contracts for a real field capture. No Unity/Player or pixel verification.
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'../..'),capture=fs.readFileSync(path.join(root,'Assets/Exoduser/Runtime/NativeGame.HellGateObjectiveCapture.cs'),'utf8'),game=fs.readFileSync(path.join(root,'Assets/Exoduser/Runtime/NativeGame.cs'),'utf8');
const results=[];
function check(name,ok){results.push({name,ok});console.log((ok?'PASS ':'FAIL ')+name);}
check('capture does not fabricate kills, totals, angler HP, purification or gate progress',!/(?:\.(?:Kills|Total|Hp|Cleared|BossUnlocked|FieldBossDone|GateGuardKilled)\s*=|\.ForceUnlock\s*\()/.test(capture));
check('capture reads the completed game frame instead of rendering one camera',!/\.Render\s*\(|NativeGuiCapture\.(?:Begin|Save)\s*\(/.test(capture));
check('capture never disables combat AI',!/EnemyAiEnabled\s*=/.test(capture));
check('capture never teleports the player',!/(?:sim|Simulation)\.Player\.(?:X|Y)\s*=/.test(capture));
const frozen=game.match(/if\(hellGateCaptureActive\)\s*\{([^}]+)\}/);
check('frozen capture preserves the world visibility reset needed by Remodel3DLate',!!frozen&&/view\.cullingMask\s*=\s*worldMask/.test(frozen[1])&&frozen[1].indexOf('worldMask')<frozen[1].indexOf('UpdateViews()'));
const draw=game.slice(game.indexOf('objective.Draw(hudWidth'));
check('merged mobility draw order retains objective then dock then overhead gauge',draw.indexOf('hud.Draw(hudWidth')>0&&draw.indexOf('DrawMobilityOverhead()')>draw.indexOf('hud.Draw(hudWidth'));
const report={scope:'Read-only capture source contracts; not a Player, world pixels, or visual PASS',checks:results.length,failures:results.filter(x=>!x.ok).length,results};
const output=process.argv[2];if(output){fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2));}
process.exitCode=report.failures?1:0;
