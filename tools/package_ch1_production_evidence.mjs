import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import {spawnSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const dir=path.join(root,'captures/ch1_1_production_finish_20260916');
const session=JSON.parse(fs.readFileSync(path.join(dir,'route-session.json')));
const frames=session.frames;
const gaps=[];
const lines=['ffconcat version 1.0'];
for(let i=0;i<frames.length;i++){
  const duration=i+1<frames.length?frames[i+1].time-frames[i].time:.2;
  if(duration>3)gaps.push({index:i,seconds:duration});
  lines.push(`file 'route_video_frames/${frames[i].file}'`,`duration ${Math.max(.001,duration).toFixed(6)}`);
}
lines.push(`file 'route_video_frames/${frames.at(-1).file}'`);
fs.writeFileSync(path.join(dir,'route.ffconcat'),lines.join('\n')+'\n');
fs.writeFileSync(path.join(dir,'video-metadata.json'),JSON.stringify({
  kind:'Actual runtime screenshot sequence; original wall-clock timing; no synthetic frames or audio',
  frames:frames.length,seconds:frames.at(-1).time-frames[0].time,gapsOver3Seconds:gaps,
  limitation:'Variable-rate sampled recording. Capture gaps retain the last observed frame; not a continuous 60fps recording.'
},null,2)+'\n');
const encoded=spawnSync('ffmpeg',['-y','-hide_banner','-loglevel','error','-f','concat','-safe','0','-i',path.join(dir,'route.ffconcat'),'-vf','scale=1280:-2','-fps_mode','vfr','-c:v','libx264','-preset','fast','-crf','25','-pix_fmt','yuv420p','-movflags','+faststart',path.join(dir,'START_EXIT_COMBAT_QA.mp4')],{stdio:'inherit'});
if(encoded.status!==0)throw new Error('ffmpeg failed');
const boss=JSON.parse(fs.readFileSync(path.join(dir,'boss-finish-session.json')));
const bossLines=['ffconcat version 1.0'];
for(let i=0;i<boss.frames.length;i++){
  bossLines.push(`file 'boss_finish_frames/${boss.frames[i].file}'`,`duration ${(i+1<boss.frames.length?Math.max(.001,boss.frames[i+1].time-boss.frames[i].time):.2).toFixed(6)}`);
}
bossLines.push(`file 'boss_finish_frames/${boss.frames.at(-1).file}'`);
fs.writeFileSync(path.join(dir,'boss.ffconcat'),bossLines.join('\n')+'\n');
const bossEncoded=spawnSync('ffmpeg',['-y','-hide_banner','-loglevel','error','-f','concat','-safe','0','-i',path.join(dir,'boss.ffconcat'),'-vf','scale=1280:-2','-fps_mode','vfr','-c:v','libx264','-preset','fast','-crf','25','-pix_fmt','yuv420p','-movflags','+faststart',path.join(dir,'BOSS_CLEAR_NEXT_STAGE_QA.mp4')],{stdio:'inherit'});
if(bossEncoded.status!==0)throw new Error('boss video encoding failed');
const walkEncoded=spawnSync('ffmpeg',['-y','-hide_banner','-loglevel','error','-i',path.join(dir,'FINAL_MAP_INPUT_WALK.webm'),'-vf','scale=1280:-2','-c:v','libx264','-preset','fast','-crf','24','-pix_fmt','yuv420p','-movflags','+faststart',path.join(dir,'FINAL_MAP_INPUT_WALK.mp4')],{stdio:'inherit'});
if(walkEncoded.status!==0)throw new Error('continuous walk encoding failed');
const names=['01_start','02_first_clearing','03_forest_connection','04_corpse_tree','05_west_boundary','06_north_exit'];
await fs.promises.mkdir(path.join(dir,'comparison'),{recursive:true});
for(const name of names){
  const panels=await Promise.all(['before_full','after'].map(folder=>sharp(path.join(dir,folder,name+'.png')).resize(1280,720).toBuffer()));
  const title=Buffer.from('<svg width="2560" height="50"><rect width="2560" height="50" fill="#131816"/><text x="24" y="33" fill="white" font-size="24">BEFORE — runtime</text><text x="1304" y="33" fill="white" font-size="24">AFTER — runtime / same camera</text></svg>');
  await sharp({create:{width:2560,height:770,channels:3,background:'#131816'}}).composite([{input:title,left:0,top:0},{input:panels[0],left:0,top:50},{input:panels[1],left:1280,top:50}]).jpeg({quality:93}).toFile(path.join(dir,'comparison',name+'.jpg'));
}
console.log(JSON.stringify({video:'START_EXIT_COMBAT_QA.mp4',frames:frames.length,comparisons:names.length,captureGaps:gaps.length}));
