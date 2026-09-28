# Render in a working directory containing crypt.mp4; requires ffmpeg, Pillow, numpy.
from pathlib import Path
from PIL import Image
import numpy as np,subprocess,json,zipfile
root=Path.cwd(); width,height,fps=1920,1088,24
src=root/'crypt.mp4'; forward=root/'stable-forward.mp4'; output=root/'lobby_varkan_crypt_loop_v2.mp4'
reader=subprocess.Popen(['ffmpeg','-v','error','-i',str(src),'-vf','fps=24','-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE)
encoder=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{width}x{height}','-r','24','-i','-','-an','-c:v','libx264','-preset','veryfast','-crf','0','-pix_fmt','yuv420p','-threads','2',str(forward)],stdin=subprocess.PIPE)
yy,xx=np.mgrid[:height,:width]; x=xx/width;y=yy/height
mask=np.zeros((height,width),np.float32)
for cx,cy,rx,ry in [(0.094,0.56,0.025,0.09),(0.236,0.535,0.018,0.055),(0.461,0.595,0.022,0.065)]:
 d=((x-cx)/rx)**2+((y-cy)/ry)**2
 mask=np.maximum(mask, np.where(d<1,.45*(1-d)**2,0).astype(np.float32))
fog=np.exp(-((x-.40)/.23)**4-((y-.686)/.019)**2)*.07
fog[(y>=.72)|(x<.17)|(x>.68)]=0
mask=np.maximum(mask,fog.astype(np.float32));mask[y>=.72]=0
base=None;count=0;before_floor=[];after_floor=[]
while True:
 chunk=reader.stdout.read(width*height*3)
 if not chunk:break
 if len(chunk)!=width*height*3:raise RuntimeError('Incomplete source frame')
 frame=np.frombuffer(chunk,np.uint8).reshape(height,width,3)
 if base is None:
  base=frame.copy();signed=base.astype(np.int16)
  Image.fromarray(base).save(root/'lobby_varkan_crypt_poster_v2.webp',lossless=True)
 result=np.clip(signed+(frame.astype(np.int16)-signed)*mask[:,:,None],0,255).astype(np.uint8)
 result[mask==0]=base[mask==0]
 before_floor.append(float(np.mean(np.abs(frame[int(height*.8):].astype(np.int16)-signed[int(height*.8):]))))
 after_floor.append(float(np.mean(np.abs(result[int(height*.8):].astype(np.int16)-signed[int(height*.8):]))))
 encoder.stdin.write(result.tobytes());count+=1
reader.stdout.close();reader.wait();encoder.stdin.close();encoder.wait()
if reader.returncode or encoder.returncode:raise RuntimeError('ffmpeg source or stable encoder failed')
assert max(after_floor)==0
subprocess.run(['ffmpeg','-v','error','-y','-i',str(forward),'-filter_complex','[0:v]split=2[f][b];[b]reverse[r];[f][r]concat=n=2:v=1:a=0,format=yuv420p[v]','-map','[v]','-an','-c:v','libx264','-preset','veryfast','-crf','0','-threads','2','-movflags','+faststart',str(output)],check=True)
subprocess.run(['ffmpeg','-v','error','-y','-i',str(output),'-vf','fps=1,scale=480:270,tile=4x3','-frames:v','1',str(root/'lobby_varkan_crypt_contact_v2.jpg')],check=True)
# Verify the decoded bottom 20 percent across the complete published loop.
check=subprocess.Popen(['ffmpeg','-v','error','-i',str(output),'-vf','crop=1920:208:0:880','-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE)
reference=None;decoded_max=0;decoded_count=0
while True:
 raw=check.stdout.read(width*208*3)
 if not raw:break
 a=np.frombuffer(raw,np.uint8).astype(np.int16)
 if reference is None:reference=a
 decoded_max=max(decoded_max,int(np.max(np.abs(a-reference))));decoded_count+=1
check.stdout.close();check.wait();assert decoded_max==0
meta={'source_job':'4e2e475f-7bdc-44ea-a1c5-2ccf4821d5a9','background_image_job':'aaa88828-bcb4-439a-add6-4d1c30ad550f','image_model':'grok_image_2_0','video_model':'grok_video_v15','width':width,'height':height,'fps':fps,'source_frames':count,'loop_frames':count*2,'duration':count*2/fps,'codec':'h264','pix_fmt':'yuv420p','audio':False,'loop_method':'fixed reference architecture and floor; regional generated fire/fog deltas; forward plus reverse','floor_fixed_from_normalized_y':.72,'fire_delta_weight':.45,'fog_delta_weight':.07,'fire_regions':[[.094,.56,.025,.09],[.236,.535,.018,.055],[.461,.595,.022,.065]],'source_floor_mean_rgb_delta_max':max(before_floor),'fixed_floor_mean_rgb_delta_max':max(after_floor),'decoded_floor_max_rgb_delta':decoded_max,'decoded_frames_checked':decoded_count,'postprocess':'tools/stabilize-lobby-crypt.py','visual_verdict':'FIXED_FLOOR_PIXELS_VERIFIED; RUNTIME_PENDING'}
(root/'lobby_varkan_crypt_v2.json').write_text(json.dumps(meta,indent=2)+'\n')
with zipfile.ZipFile(root/'varkan_stable_crypt_v2.zip','w',zipfile.ZIP_DEFLATED) as archive:
 for name in ['lobby_varkan_crypt_loop_v2.mp4','lobby_varkan_crypt_poster_v2.webp','lobby_varkan_crypt_contact_v2.jpg','lobby_varkan_crypt_v2.json']:archive.write(root/name,name)
print(json.dumps(meta))

