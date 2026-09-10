"""Extract evidence from the current film for every spoken cue."""
import io,json,os,subprocess
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
P=Path(__file__).resolve().parent;B=P.parent
FF=Path(os.environ['LOCALAPPDATA'])/'Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.0.1-full_build/bin/ffmpeg.exe'
caps=json.loads((B/'ending_last_shot_v9/captions.json').read_text(encoding='utf-8'))
font=ImageFont.truetype(str(B/'full_review_v4/fonts/NotoSerifCJKkr-Medium.otf'),22)
small=ImageFont.truetype(str(B/'full_review_v4/fonts/NotoSerifCJKkr-Medium.otf'),16)
frames=P/'frames';frames.mkdir(exist_ok=True)
for page in range((len(caps)+5)//6):
    items=caps[page*6:page*6+6]
    canvas=Image.new('RGB',(1152,len(items)*292),'#151515');d=ImageDraw.Draw(canvas)
    for row,c in enumerate(items):
        start,end=c['start_s'],c['end_s'];times=[start+.12,(start+end)/2,end-.12]
        for j,t in enumerate(times):
            raw=subprocess.check_output([str(FF),'-v','error','-ss',str(t),'-i',str(B/'ending_last_shot_v9/final.mp4'),'-frames:v','1','-vf','scale=384:216','-f','image2pipe','-vcodec','mjpeg','-'])
            image=Image.open(io.BytesIO(raw));canvas.paste(image,(j*384,row*292))
            d.text((j*384+8,row*292+218),f'{t:.2f}s',font=small,fill='#bbbbbb')
            (frames/f"{c['id']}_{j}.jpg").write_bytes(raw)
        d.text((8,row*292+243),f"{c['id']}  {c['ko']}",font=font,fill='white')
    canvas.save(P/f'audit_{page+1}.jpg',quality=92)
print('22 cues / 66 evidence frames / 4 sheets extracted.')
