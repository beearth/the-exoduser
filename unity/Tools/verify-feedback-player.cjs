const fs=require('fs'),path=require('path');
function arg(k){const i=process.argv.indexOf(k);if(i<0||!process.argv[i+1])throw Error('Missing '+k);return path.resolve(process.argv[i+1]);}
const directory=arg('--player'),output=arg('--receipt'),rows=[];
const smoke=JSON.parse(fs.readFileSync(directory+'/player-smoke.json'));
const check=(name,passed)=>rows.push({name,passed:!!passed});
check('real native player moves and kills',smoke.moved&&smoke.kills>0&&!smoke.webViewUsed);
check('cast and all three charge levels play actual clips',smoke.feedbackAudio&&smoke.feedbackAudio.loadedClips===5&&smoke.feedbackAudio.played>=6&&['sword_swing1','sword_swing2','sword_swing3','scarecrow_charge','sword_parry'].every(k=>smoke.feedbackAudio.keys.includes(k)));
check('original hit flash and full charge flash reach native renderer',smoke.feedbackVisual&&smoke.feedbackVisual.hitCount>0&&smoke.feedbackVisual.chargeCount>0&&smoke.feedbackVisual.drawnFrames>0&&smoke.feedbackVisual.peakInk<=8&&smoke.feedbackVisual.peakAdditive<=20);
check('listener output contains a nonzero real engine signal',smoke.feedbackAudio&&smoke.feedbackAudio.listenerPeak>.001);
check('native hit screenshot exists',fs.existsSync(directory+'/unity-ki-impact.png'));
const log=fs.readFileSync(directory+'/player.log','utf8');
check('no runtime exception or shader error',!/Exception:|error CS\d|Shader error|MissingMethodException/.test(log));
const result={scope:'actual_windows_player_automated_fixture_not_manual_play_or_full_audio_parity',directory,passed:rows.every(r=>r.passed),checks:rows};
fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(result,null,2));console.log(JSON.stringify(result));process.exitCode=result.passed?0:2;
