const fs=require('fs'),path=require('path');const dir=process.argv[2];if(!dir)throw Error('Actual native Player output required');
let r;try{r=JSON.parse(fs.readFileSync(dir+'/lobby-smoke.json','utf8'));}catch{}
const checks=[],check=(name,passed)=>checks.push({name,passed:!!passed});
check('native_frontend_receipt',r?.scope==='actual_native_player_frontend_fixture');
for(const s of ['fdg','splash','world','lobby']){const row=r?.samples?.find(x=>x.stage===s);check('native_video_decode_'+s,row?.prepared&&row?.stageMatched&&row?.frameChanges>0&&row?.timeAdvanced>.01&&row?.nonBlack&&!row?.error);check('rendered_'+s,fs.existsSync(path.join(dir,'unity-lobby-'+s+'.png')));}
check('sigil_rendered_without_door_movie',fs.existsSync(path.join(dir,'unity-lobby-enter.png'))&&!r?.samples?.some(x=>x.stage==='gate'));
check('natural_movie_end_reaches_lobby',r?.worldCompletedNaturally);
const world=r?.worldPlayback,finite=x=>typeof x==='number'&&Number.isFinite(x);
check('world_movie_113_seconds_at_normal_speed',world?.endedEvent&&finite(world.duration)&&Math.abs(world.duration-113.291667)<.2&&finite(world.wallElapsed)&&world.wallElapsed>=world.duration*.95-2&&world.wallElapsed<=world.duration*1.05+2&&world.lastVideoTime>=world.duration-.3&&world.firstVideoTime<=1&&world.frameChanges>100&&Math.abs(world.minimumSpeed-1)<.001&&Math.abs(world.maximumSpeed-1)<.001);
check('world_frame_progress_has_no_long_stall',world&&finite(world.maxFrameGapSeconds)&&world.maxFrameGapSeconds<=.75&&finite(world.maxProgressStallSeconds)&&world.maxProgressStallSeconds<=.75&&world.audioProbeCount>100);
check('original_world_voice_and_music_have_engine_signal',r?.voicePeak>.001&&r?.musicPeak>.001&&world?.voicePeak>.001&&world?.musicPeak>.001&&world?.listenerPeak>.001);
check('source_captions_and_original_art_drawn',r?.captionVisible&&r?.originalArtDrawn);
check('replay_and_hold_skip',r?.replayWorked&&r?.holdSkipWorked);
check('frontend_blocks_gameplay_and_test_entry_is_explicit',r?.simulationPaused&&r?.explicitTestEntry);
const log=fs.existsSync(dir+'/player.log')?fs.readFileSync(dir+'/player.log','utf8'):'';check('no_runtime_exception_or_shader_error',!!log&&!/Exception:|error CS\d|Shader error|MissingMethodException/.test(log));
const audioBufferWarnings=(log.match(/AudioSampleProvider[^\r\n]*(?:overflow|underflow|discard)|audio[^\r\n]*buffer[^\r\n]*(?:overflow|underflow|starv)/gi)||[]).length;
check('no_audio_buffer_overflow_or_discard',!!log&&r?.audioBufferWarnings===0&&audioBufferWarnings===0);
const result={scope:'native_controlled_frontend_fixture_not_manual_input_or_full_lobby_save_support',passed:checks.every(x=>x.passed),audioBufferWarnings,checks};console.log(JSON.stringify(result,null,2));process.exitCode=result.passed?0:1;
