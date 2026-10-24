const fs=require('fs'),path=require('path');const dir=process.argv[2];if(!dir)throw Error('Actual native Player output required');
let r;try{r=JSON.parse(fs.readFileSync(dir+'/lobby-smoke.json','utf8'));}catch{}
const checks=[],check=(name,passed)=>checks.push({name,passed:!!passed});
check('native_frontend_receipt',r?.scope==='actual_native_player_frontend_fixture');
for(const s of ['fdg','splash','gate','world','lobby']){const row=r?.samples?.find(x=>x.stage===s);check('native_video_decode_'+s,row?.prepared&&row?.frameAdvanced&&row?.nonBlack);check('rendered_'+s,fs.existsSync(path.join(dir,'unity-lobby-'+s+'.png')));}
check('natural_movie_end_reaches_lobby',r?.worldCompletedNaturally);
check('original_voice_and_music_have_engine_signal',r?.voicePeak>.001&&r?.musicPeak>.001);
check('source_captions_and_original_art_drawn',r?.captionVisible&&r?.originalArtDrawn);
check('replay_and_hold_skip',r?.replayWorked&&r?.holdSkipWorked);
check('frontend_blocks_gameplay_and_test_entry_is_explicit',r?.simulationPaused&&r?.explicitTestEntry);
const log=fs.existsSync(dir+'/player.log')?fs.readFileSync(dir+'/player.log','utf8'):'';check('no_runtime_exception_or_shader_error',!!log&&!/Exception:|error CS\d|Shader error|MissingMethodException/.test(log));
const result={scope:'native_controlled_frontend_fixture_not_manual_input_or_full_lobby_save_support',passed:checks.every(x=>x.passed),checks};console.log(JSON.stringify(result,null,2));process.exitCode=result.passed?0:1;
