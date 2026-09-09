"""Final decode, metadata, runtime evidence, and browser playback verification."""
import json
import re
import subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image,ImageDraw
import build_trailer_combat_v22_20260909 as build
from recapture_trailer_combat_v22_20260909 import TAKES

ROOT=Path(__file__).resolve().parents[1]
RAW=build.edit.RAW
FINAL=build.edit.FINAL

def command(args):
    r=subprocess.run(args,capture_output=True,check=True,creationflags=subprocess.CREATE_NO_WINDOW)
    return r.stdout.decode('utf-8')

def main():
    info=json.loads(command(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(FINAL)]))
    v=next(s for s in info['streams'] if s['codec_type']=='video')
    a=next(s for s in info['streams'] if s['codec_type']=='audio')
    duration=round(sum(c[2] for c in build.edit.EDL),3)
    assert (v['width'],v['height'],v['r_frame_rate'])==(1920,1080,'60/1')
    assert abs(float(info['format']['duration'])-duration)<.1
    assert int(v['nb_frames'])==round(duration*60)
    assert not any(s['codec_type']=='subtitle' for s in info['streams'])
    command(['ffmpeg','-v','error','-i',str(FINAL),'-f','null','-'])
    source=ROOT.joinpath('game.html').read_text(encoding='utf-8').split('const SKILL_LIST=[',1)[1].split('\n];',1)[0]
    skill_ids=set(re.findall(r"\{id:'([^']+)'",source))
    used=set();female=0;male=[];contacts=0;rainbow_parries=0;shots=set();release=[]
    for take in TAKES:
        d=json.loads((RAW/(take['name']+'.json')).read_text(encoding='utf-8'))
        assert min(f['hp'] for f in d['samples'])>0,take['name']
        assert d['samples'][-1]['t']>=take['seconds']-.4,take['name']
        for e in d['skills']:
            if e.get('event')=='used' or e.get('ok'):used.add(e.get('skill'))
            if e.get('skill')=='blackStar' and e.get('event')=='release':release.append(e['t'])
        for e in d.get('combat',[]):
            if e['event']=='shot':shots.add(e['kind'])
            if e['event']=='contact' and e['after']<e['before']:contacts+=1
            if e['event']=='parry' and (e.get('kind')=='rainbow'):rainbow_parries+=1
        for e in d['audio']:
            female+=any(k.startswith('silvertail_') for k in e['keys'])
            male.extend(k for k in e['keys'] if k.startswith('voice_') or k=='male_grunt' or k.startswith('player_hit') or k.startswith('player_dead') or k=='repentance')
    assert not male,male
    assert contacts>0 and 'rainbow' in shots and release
    assert len(used&skill_ids)>len(skill_ids)/2,(len(used&skill_ids),len(skill_ids))
    timeline=json.loads((RAW/'timeline.json').read_text())
    for page_num in range((len(timeline)+8)//9):
        sheet=Image.new('RGB',(1920,1152),'#141414')
        for j,cut in enumerate(timeline[page_num*9:page_num*9+9]):
            timestamp=(cut['start']+cut['end'])/2
            frame=RAW/f'FINAL_FRAME_{page_num*9+j:02}.jpg'
            command(['ffmpeg','-v','error','-y','-ss',str(timestamp),'-i',str(FINAL),'-frames:v','1','-vf','scale=640:360',str(frame)])
            x,y=(j%3)*640,(j//3)*384
            sheet.paste(Image.open(frame),(x,y+24))
            ImageDraw.Draw(sheet).text((x+8,y+6),f"{timestamp:.2f}s / {cut['name']}",fill='white')
        sheet.save(RAW/f'FINAL_CONTACT_SHEET_{page_num+1:02}.jpg')
    preview={'url':'http://localhost:3333/'+FINAL.relative_to(ROOT).as_posix()}
    with sync_playwright() as p:
        b=p.chromium.launch(channel='chrome',headless=True)
        page=b.new_page(viewport={'width':1280,'height':720})
        page.goto('http://localhost:3333/tmp/trailer_combat_v22/review.html')
        page.locator('video').evaluate('(v)=>{v.muted=true;v.currentTime=74;return v.play()}')
        page.wait_for_timeout(1000)
        preview.update(page.locator('video').evaluate('(v)=>({width:v.videoWidth,height:v.videoHeight,time:v.currentTime,duration:v.duration,readyState:v.readyState,error:v.error?.message||null})'))
        assert preview['error'] is None and preview['time']>74
        page.screenshot(path=str(RAW/'FINAL_BROWSER.png'));b.close()
    report=dict(file=str(FINAL),bytes=FINAL.stat().st_size,duration=duration,frames=v['nb_frames'],audio=a['codec_name'],decode='PASS',femaleVoices=female,maleVoices=male,damagingContacts=contacts,projectileKinds=sorted(shots),blackStarRelease=release,skillIds=sorted(used&skill_ids),skillCount=len(used&skill_ids),skillListCount=len(skill_ids),browser=preview)
    (RAW/'final_verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False))

if __name__=='__main__':main()
