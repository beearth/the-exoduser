"""Preserve the approved loop, with high quality 2x resampling and mild luma sharpening."""
import argparse
import json
from pathlib import Path
import subprocess
import imageio_ffmpeg

def build(source,output):
    if source.resolve()==output.resolve():
        raise ValueError('Keep the original video unchanged')
    ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
    output.parent.mkdir(parents=True,exist_ok=True)
    subprocess.run([ffmpeg,'-y','-v','error','-i',str(source),'-map','0:v:0','-an',
        '-vf','scale=3840:1536:flags=lanczos,unsharp=5:5:0.4:3:3:0,setsar=1',
        '-c:v','libx264','-threads','4','-preset','slow','-crf','16','-pix_fmt','yuv420p',
        '-g','24','-movflags','+faststart',str(output)],check=True)
    subprocess.run([ffmpeg,'-v','error','-i',str(output),'-f','null','-'],check=True)
    reader=imageio_ffmpeg.read_frames(str(output));meta=next(reader);reader.close()
    frames,seconds=imageio_ffmpeg.count_frames_and_secs(str(output))
    info={'source':str(source),'output':str(output),'width':meta['size'][0],'height':meta['size'][1],
          'fps':meta['fps'],'frames':frames,'seconds':seconds,'audio':False,'crf':16,
          'resample':'Lanczos 2x','sharpen':'luma 5x5 amount 0.4; chroma 0',
          'native4K':False,'bytes':output.stat().st_size,'decode':'PASS'}
    output.with_suffix('.json').write_bytes((json.dumps(info,indent=2)+'\n').encode('utf8'))
    print(json.dumps(info))

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source',type=Path,default=Path('video/title_motion.mp4'))
    parser.add_argument('--output',type=Path,default=Path('video/title_motion_hd.mp4'))
    args=parser.parse_args();build(args.source,args.output)
