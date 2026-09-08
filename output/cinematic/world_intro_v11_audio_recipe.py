import numpy as np, subprocess, json, hashlib, os
RATE=48000
END=110.25
SPLIT=106.09
WORD_END=106.95
WORD_AT=106.65
subprocess.run(['ffmpeg','-v','error','-y','-i','source.mp4','-vn','-ar',str(RATE),'-ac','2','-f','f32le','source.f32'],check=True)
src=np.fromfile('source.f32',dtype='<f4').reshape(-1,2)
out=np.zeros((round(END*RATE),2),dtype='<f4')
a,b,at=map(lambda t:round(t*RATE),(SPLIT,WORD_END,WORD_AT))
out[:a]=src[:a]
fade=240
out[a-fade:a]*=np.linspace(1,0,fade)[:,None]
part=src[a:b].copy()
part[:fade]*=np.linspace(0,1,fade)[:,None]
part[-fade:]*=np.linspace(1,0,fade)[:,None]
out[at:at+len(part)]=part
out.tofile('final.f32')
assert np.array_equal(src[:a-fade],out[:a-fade])
assert not out[a:at].any()
subprocess.run(['ffmpeg','-v','error','-y','-i','project/renders/picture.mp4','-f','f32le','-ar',str(RATE),'-ac','2','-i','final.f32','-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-t',str(END),'-movflags','+faststart','final.mp4'],check=True)
subprocess.run(['ffmpeg','-v','error','-y','-i','final.mp4','-vn','-ar',str(RATE),'-ac','2','-f','f32le','decoded.f32'],check=True)
dec=np.fromfile('decoded.f32',dtype='<f4').reshape(-1,2)
qa={'logo_start':106.25,'duration':END,'split':SPLIT,'source_word_end':WORD_END,'word_at':WORD_AT,'delay':WORD_AT-SPLIT,'fade_samples':fade,'sample_rate':RATE,'peak':float(abs(out).max()),'bytes':os.path.getsize('final.mp4')}
qa['audio_correlation_before']=float(np.corrcoef(src[:round(105.9*RATE)].ravel(),dec[:round(105.9*RATE)].ravel())[0,1])
qa['audio_correlation_word']=float(np.corrcoef(src[a+fade:b-fade].ravel(),dec[at+fade:at+b-a-fade].ravel())[0,1])
assert qa['audio_correlation_before']>.99 and qa['audio_correlation_word']>.99
qa['probe']=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json','final.mp4']))
v=next(s for s in qa['probe']['streams'] if s['codec_type']=='video')
assert v['nb_frames']=='2646' and v['width']==1280 and v['height']==720
qa['asr_source_words_relative_to_105_2']=[['We',0,.3],['call',.3,.54],['them',.54,.78],['Exoduser',.78,1.3]]
qa['split_silence_window']=[106.066167,106.114271]
json.dump(qa,open('qa.json','w'),indent=2)
print(json.dumps({k:v for k,v in qa.items() if k!='probe'}),flush=True)
