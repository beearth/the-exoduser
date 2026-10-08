# Historical source VFR -> exact CFR30 cuts for native editing.
# Cloud runtime path is explicit; originals are preserved.
import subprocess,json,pathlib
root=pathlib.Path('/home/user/rift-input')
cuts={'hook':('resident-walk.webm',12,4),'walk':('resident-walk.webm',3,9),'detail':('interactive-motion.webm',0.2,2),'ascent':('resident-walk.webm',20,9),'short1':('resident-walk.webm',3,6),'short2':('resident-walk.webm',12,6),'short3':('resident-walk.webm',24,4),'concept':('concept-20261005.png',0,6)}
prepared={}
normalized={}
for src in ['resident-walk.webm','interactive-motion.webm']:
 out=root/(src+'.cfr.mp4')
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(root/src),'-vf','fps=30','-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p',str(out)],check=True)
 normalized[src]=out
for key,(src,start,dur) in cuts.items():
 out=root/(key+'.mp4')
 args=['ffmpeg','-v','error','-y']
 if src.endswith('.png'):args+=['-loop','1','-framerate','30']
 args+=['-i',str(normalized.get(src,root/src)),'-vf',f'trim=start_frame={round(start*30)}:end_frame={round((start+dur)*30)},setpts=PTS-STARTPTS','-frames:v',str(dur*30),'-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',str(out)]
 subprocess.run(args,check=True)
 info=json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames','-show_streams','-show_format','-of','json',str(out)]))
 st=info['streams'][0];frames=int(st['nb_read_frames'])
 assert frames==dur*30,(key,frames)
 assert st['codec_name']=='h264' and st['avg_frame_rate']=='30/1'
 prepared[key]={'file':str(out),'duration':float(info['format']['duration']),'frames':frames,'original':src,'sourceStart':start}
for target,dur in [('landscape',34),('portrait',20)]:
 subprocess.run(['ffmpeg','-v','error','-y','-ss','14','-i',str(root/'prologue_theme.mp3'),'-t',str(dur),'-af',f'volume=0.55,afade=t=in:st=0:d=1,afade=t=out:st={dur-2}:d=2','-c:a','aac','-b:a','192k','-ar','48000','-ac','2',str(root/f'bgm-{target}.m4a')],check=True)
(root/'prepared.json').write_text(json.dumps(prepared,indent=2))
print('PREPARED_PASS',list(prepared))
