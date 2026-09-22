import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=path.resolve('output/cinematic/warintro_remaster_20260909');
const source=path.join(root,'hell_drag_v21');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const manifest=read(path.join(source,'assembly_manifest.json'));
const cues=read(path.join(source,'captions.json'));
const stamp=t=>new Date(Math.round(t*1000)).toISOString().slice(11,23);
fs.mkdirSync('localization/warrior-story',{recursive:true});
fs.writeFileSync('localization/warrior-story/cues.json',JSON.stringify(cues,null,2)+'\n');
for(const code of ['ko','en']){
 const body=cues.map(c=>`${c.id}\n${stamp(c.start_s)} --> ${stamp(c.end_s)}\n${c[code]}\n`).join('\n');
 fs.writeFileSync(`video/subtitles/warrior_story_v23_${code}.vtt`,'WEBVTT\n\n'+body);
}
if(!process.argv.includes('--render'))process.exit(0);
const bin=path.join(process.env.LOCALAPPDATA,'Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.0.1-full_build/bin');
const ff=path.join(bin,'ffmpeg.exe'),probe=path.join(bin,'ffprobe.exe');
const target='video/warrior_story_v23_clean.mp4';
if(fs.existsSync(target))throw Error('Existing clean movie must be reviewed before replacement');
const args=['-hide_banner','-v','warning','-filter_complex_threads','1','-threads','1','-t','38.7','-i',path.join(root,'full_review_v4/clean.mp4')];
const filters=['[0:v]trim=duration=38.5,setpts=PTS-STARTPTS,fps=60,trim=end_frame=2310,setsar=1[v0]'];
for(const [i,shot]of manifest.shots.entries()){
 const file=path.join(root,shot.source);if(!fs.existsSync(file))throw Error('Missing shot '+file);
 args.push('-threads','1','-t',String(shot.end-shot.start+.2),'-i',file);
 filters.push(`[${i+1}:v]setpts=PTS-STARTPTS,pad=1920:1080:2:0:black,fps=60,trim=end_frame=${shot.end_frame-shot.start_frame},setsar=1[v${i+1}]`);
}
// Preserve the released narration and music bitstream, including the deliberate final pause.
args.push('-i',path.resolve('video/warrior_story_v22_bgm.mp4'));
filters.push(Array.from({length:manifest.shots.length+1},(_,i)=>`[v${i}]`).join('')+`concat=n=${manifest.shots.length+1}:v=1:a=0,fade=t=out:st=95.6:d=0.8[v]`);
args.push('-filter_complex',filters.join(';'),'-map','[v]','-map',`${manifest.shots.length+1}:a:0`,'-t','96.4','-c:v','libx264','-preset','fast','-crf','18','-threads','4','-pix_fmt','yuv420p','-c:a','copy','-movflags','+faststart',target);
execFileSync(ff,args,{stdio:'inherit'});
const info=JSON.parse(execFileSync(probe,['-v','error','-show_streams','-of','json',target],{encoding:'utf8'}));
const v=info.streams.find(s=>s.codec_type==='video');
if(Number(v.nb_frames)!==5784||Number(v.duration)!==96.4)throw Error('Movie timing differs');
const audioHash=file=>execFileSync(ff,['-v','error','-i',file,'-map','0:a:0','-c:a','copy','-f','hash','-hash','sha256','-'],{encoding:'utf8'}).trim();
const hash=audioHash(target);if(hash!==audioHash('video/warrior_story_v22_bgm.mp4'))throw Error('Audio changed');
fs.writeFileSync('localization/warrior-story/media-build.json',JSON.stringify({target,frames:5784,duration:96.4,audioHash:hash,source:'video/warrior_story_v22_bgm.mp4',captionCues:22},null,2)+'\n');
console.log('Clean movie: 5784 frames, 96.4 seconds, identical narration/music packets.');
