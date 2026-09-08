# Reproduction recipe: run in Higgsfield sandbox with /tmp/v7.mp4 and /tmp/new.mp3.
import subprocess,json,hashlib,os
import numpy as np
def run(args): return subprocess.check_output(args)
def pcm(path): return np.frombuffer(run(['ffmpeg','-v','error','-i',path,'-f','f32le','-ac','2','-ar','48000','-']),dtype=np.float32).reshape(-1,2)
old=pcm('/tmp/v7.mp4'); new=pcm('/tmp/new.mp3')
def rms_active(x):
 a=np.mean(x,axis=1); a=a[np.abs(a)>.02]; return float(np.sqrt(np.mean(a*a)))
gain=rms_active(old[int(105.31*48000):int(107.14*48000)])/rms_active(new)
filters=f"[0:a]volume=0:enable='between(t,105,108.791667)'[base];[1:a]aresample=48000,aformat=channel_layouts=stereo,volume={gain},afade=t=in:d=0.005,afade=t=out:st={len(new)/48000-.01}:d=0.01,adelay=105332|105332[voice];[base][voice]amix=inputs=2:normalize=0:duration=first,atrim=duration=113.291667[a]"
subprocess.run(['ffmpeg','-v','error','-y','-i','/tmp/v7.mp4','-i','/tmp/new.mp3','-filter_complex',filters,'-map','0:v:0','-map','[a]','-c:v','copy','-c:a','aac','-b:a','192k','-movflags','+faststart','/tmp/v8.mp4'],check=True)
def vh(path): return hashlib.sha256(run(['ffmpeg','-v','error','-i',path,'-map','0:v:0','-c','copy','-f','h264','-'])).hexdigest()
out=pcm('/tmp/v8.mp4')
a=old[:int(104.9*48000)].ravel(); b=out[:len(a)//2].ravel()
qa={'text':'We call them Exoduser.','voice_start':105.332,'replace_range':[105,108.791667],'voice_decoded_duration':len(new)/48000,'gain':gain,'video_sha256_before':vh('/tmp/v7.mp4'),'video_sha256_after':vh('/tmp/v8.mp4'),'prior_audio_correlation':float(np.corrcoef(a,b)[0,1]),'peak_after':float(np.max(np.abs(out))),'bytes':os.path.getsize('/tmp/v8.mp4'),'probe':json.loads(run(['ffprobe','-v','error','-show_streams','-show_format','-of','json','/tmp/v8.mp4']))}
assert qa['video_sha256_before']==qa['video_sha256_after']
assert qa['prior_audio_correlation']>.99
with open('/tmp/qa.json','w') as f: json.dump(qa,f,indent=2)
print(json.dumps(qa))

