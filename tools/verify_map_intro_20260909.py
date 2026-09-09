"""Decode, camera-motion, contact-sheet, and browser playback QA for the map film."""
import json,subprocess
from pathlib import Path
from PIL import Image,ImageDraw,ImageChops,ImageStat
from playwright.sync_api import sync_playwright
from build_map_intro_20260909 import FINAL,OUT,ROOT,SHOTS

def command(args):
    p=subprocess.run(args,capture_output=True,check=True,creationflags=subprocess.CREATE_NO_WINDOW)
    return p.stdout.decode('utf-8')

def main():
    info=json.loads(command(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(FINAL)]))
    v=next(s for s in info['streams'] if s['codec_type']=='video')
    a=next(s for s in info['streams'] if s['codec_type']=='audio')
    assert (v['width'],v['height'],v['r_frame_rate'],v['nb_frames'])==(1920,1080,'60/1','1800')
    assert abs(float(info['format']['duration'])-30)<.05
    assert not any(s['codec_type']=='subtitle' for s in info['streams'])
    command(['ffmpeg','-v','error','-i',str(FINAL),'-f','null','-'])
    captured=json.loads((OUT/'capture_report.json').read_text())
    assert not captured['pageErrors'] and not captured['missing404'],captured
    assert len(captured['shots'])==7
    for s in captured['shots']:
        r=s['recording'];assert r['last']['t']>5.6 and r['frames']>240,(s['name'],r)
        assert not r['maleVoices']
    timeline=json.loads((OUT/'timeline.json').read_text())
    motion=[]
    for phase in ['start','middle','end']:
        sheet=Image.new('RGB',(1920,1152),'#111111')
        for i,c in enumerate(timeline):
            t=c['start']+.35 if phase=='start' else c['end']-.35 if phase=='end' else (c['start']+c['end'])/2
            path=OUT/f"FINAL_{i:02}_{phase}.jpg"
            command(['ffmpeg','-v','error','-y','-ss',str(t),'-i',str(FINAL),'-frames:v','1','-vf','scale=640:360',str(path)])
            x,y=i%3*640,i//3*384
            sheet.paste(Image.open(path),(x,y+24));ImageDraw.Draw(sheet).text((x+8,y+5),f"{t:g}s / {c['name']}",fill='white')
        sheet.save(OUT/f'FINAL_CONTACT_{phase}.jpg')
    for i,s in enumerate(SHOTS):
        before=Image.open(OUT/f'FINAL_{i:02}_start.jpg').convert('RGB')
        after=Image.open(OUT/f'FINAL_{i:02}_end.jpg').convert('RGB')
        delta=sum(ImageStat.Stat(ImageChops.difference(before,after)).mean)/3
        assert delta>1,(s['name'],delta)
        motion.append(dict(name=s['name'],pixelMotionMean=round(delta,3)))
    url='http://localhost:3333/'+FINAL.relative_to(ROOT).as_posix()
    with sync_playwright() as p:
        b=p.chromium.launch(channel='chrome',headless=True)
        page=b.new_page(viewport={'width':1280,'height':720})
        page.set_content(f'<body style="margin:0;background:black"><video controls muted style="width:100%;height:100vh" src="{url}"></video></body>')
        page.locator('video').evaluate('(v)=>{v.currentTime=14;return v.play()}')
        page.wait_for_timeout(1000)
        playback=page.locator('video').evaluate('(v)=>({time:v.currentTime,duration:v.duration,width:v.videoWidth,height:v.videoHeight,ready:v.readyState,error:v.error?.message||null})')
        assert playback['time']>14 and not playback['error'],playback
        page.screenshot(path=str(OUT/'FINAL_BROWSER.png'));b.close()
    result=dict(file=str(FINAL),bytes=FINAL.stat().st_size,duration=30,frames=1800,fps='60/1',audio=a['codec_name'],decode='PASS',capturedShots=7,editedCuts=8,pageErrors=0,missing404=0,cameraMotion=motion,browser=playback)
    (OUT/'final_verification.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
    print(json.dumps(result))

if __name__=='__main__':main()
