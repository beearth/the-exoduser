"""Verify final media and real number rendering, with cut-by-cut visual proofs."""
import json
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageChops, ImageStat
from playwright.sync_api import sync_playwright
from recapture_trailer_combat_v22_20260909 import TAKES
from build_trailer_damage_v24_20260910 import edit

ROOT=edit.ROOT
RAW=edit.RAW
FINAL=edit.FINAL


def run(args):
    p=subprocess.run(args,capture_output=True,creationflags=subprocess.CREATE_NO_WINDOW)
    if p.returncode:
        raise RuntimeError(p.stderr.decode('utf-8',errors='replace'))
    return p.stdout.decode('utf-8',errors='replace'),p.stderr.decode('utf-8',errors='replace')


def main():
    info=json.loads(run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(FINAL)])[0])
    video=next(s for s in info['streams'] if s['codec_type']=='video')
    audio=next(s for s in info['streams'] if s['codec_type']=='audio')
    assert (video['width'],video['height'],video['r_frame_rate'],video['nb_frames'])==(1920,1080,'60/1','5880')
    assert abs(float(info['format']['duration'])-98)<.05
    assert audio['codec_name']=='aac' and audio['sample_rate']=='48000' and audio['channels']==2
    run(['ffmpeg','-v','error','-i',str(FINAL),'-f','null','-'])
    levels=run(['ffmpeg','-hide_banner','-i',str(FINAL),'-vn','-af','volumedetect','-f','null','-'])[1]
    assert 'mean_volume: -inf' not in levels
    (RAW/'audio_levels.txt').write_text(levels,encoding='utf-8')
    takes=[];all_data={};contacts=0;female=0;used_skills=set();blackstar_release=[]
    for take in TAKES:
        name=take['name'];data=json.loads((RAW/f'{name}.json').read_text(encoding='utf-8'))
        if name!='boss':all_data[name]=data
        assert data['charIdx']==1
        samples=data['samples'];assert samples and samples[-1]['t']>=take['seconds']-.4
        assert min(s['hp'] for s in samples)>0
        rendered=samples[-1]['numberDraws']
        used_skills.update(e.get('skill') for e in data['skills'] if e.get('ok') or e.get('event')=='used')
        blackstar_release.extend(e['t'] for e in data['skills'] if e.get('skill')=='blackStar' and e.get('event')=='release')
        forbidden=[];voice=0
        for event in data['audio']:
            voice+=any(k.startswith('silvertail_') for k in event['keys'])
            forbidden.extend(k for k in event['keys'] if k.startswith(('voice_','player_hit','player_dead')) or k in ('male_grunt','repentance'))
        assert not forbidden,(name,forbidden)
        if name!='boss':
            female+=voice
            contacts+=sum(e['event']=='contact' and e['after']<e['before'] for e in data['combat'])
        takes.append(dict(name=name,usedInFinal=name!='boss',frames=len(samples),numberDraws=rendered,femaleVoices=voice,
                          maxFrameMs=round(max((b['t']-a['t'])*1000 for a,b in zip(samples,samples[1:])),2)))
    assert sum(t['numberDraws'] for t in takes)>0 and contacts>0 and female>0
    assert len(used_skills)>=38 and blackstar_release
    timeline=json.loads((RAW/'timeline.json').read_text())
    proofs=[]
    for index,cut in enumerate(timeline):
        name=cut['name'];time=(cut['start']+cut['end'])/2;draws=0
        if name in all_data:
            samples=all_data[name]['samples']
            candidates=[]
            for a,b in zip(samples,samples[1:]):
                source_time=b['t']
                if cut['sourceStart']+.06<=source_time<cut['sourceStart']+cut['end']-cut['start']-.08:
                    delta=b['numberDraws']-a['numberDraws']
                    candidates.append((delta,source_time))
            if candidates:
                draws,source_time=max(candidates)
                if draws>0:time=cut['start']+source_time-cut['sourceStart']
        target=RAW/f'FINAL_FRAME_{index:02}.jpg'
        run(['ffmpeg','-v','error','-y','-ss',str(time),'-i',str(FINAL),'-frames:v','1','-vf','scale=640:360',str(target)])
        proofs.append(dict(cut=index,name=name,time=round(time,3),numberDrawsInSample=draws,frame=str(target)))
    for n in range((len(proofs)+8)//9):
        sheet=Image.new('RGB',(1920,1152),'#141414')
        for j,proof in enumerate(proofs[n*9:n*9+9]):
            x,y=(j%3)*640,(j//3)*384
            with Image.open(proof['frame']) as im:sheet.paste(im,(x,y+24))
            ImageDraw.Draw(sheet).text((x+8,y+6),f"{proof['time']:.2f}s {proof['name']} numbers:{proof['numberDrawsInSample']}",fill='white')
        sheet.save(RAW/f'FINAL_CONTACT_{n+1:02}.jpg')
    url='http://localhost:3333/'+FINAL.relative_to(ROOT).as_posix()
    (RAW/'review.html').write_text('<!doctype html><meta charset="utf-8"><title>V24 Damage Text</title><style>body{margin:0;background:#111;color:#eee;font:18px sans-serif}video{width:100%;max-height:92vh}</style><video controls src="'+url+'"></video>',encoding='utf-8')
    with sync_playwright() as p:
        browser=p.chromium.launch(channel='chrome',headless=True)
        page=browser.new_page(viewport={'width':1280,'height':720})
        page.goto('http://localhost:3333/tmp/trailer_damage_v24/review.html')
        page.wait_for_function('document.querySelector("video").readyState>=2')
        page.locator('video').evaluate('(v)=>{v.muted=true;v.currentTime=34;return v.play()}')
        page.wait_for_timeout(1200)
        playback=page.locator('video').evaluate('(v)=>({time:v.currentTime,duration:v.duration,width:v.videoWidth,height:v.videoHeight,error:v.error?.message||null})')
        assert playback['time']>34 and playback['error'] is None
        browser.close()
    capture_report=json.loads((RAW/'report.json').read_text(encoding='utf-8'))
    assert not capture_report['pageErrors']
    original=ROOT/'captures/gameplay_trailer_20260909/EXODUSER_GAMEPLAY_TRAILER_V22_SKILL_MONTAGE_NEW_LOGO_1080P60.mp4'
    ending=[]
    for seconds in [90,91.25,93,94.5,96,97.8]:
        paths=[RAW/f'ending_{seconds}_{label}.png' for label in ['source','final']]
        for source,target in zip([original,FINAL],paths):
            run(['ffmpeg','-v','error','-y','-ss',str(seconds),'-i',str(source),'-frames:v','1','-vf','scale=640:360',str(target)])
        delta=sum(ImageStat.Stat(ImageChops.difference(Image.open(paths[0]),Image.open(paths[1]))).mean)/3
        assert delta<3,(seconds,delta)
        ending.append(dict(seconds=seconds,meanPixelDifference=round(delta,4)))
    result=dict(file=str(FINAL),bytes=FINAL.stat().st_size,duration=98,frames=5880,
                decode='PASS',audio=audio['codec_name'],femaleVoices=female,damagingContacts=contacts,
                pageErrors=capture_report['pageErrors'],takes=takes,proofs=proofs,browser=playback,
                skillIds=sorted(used_skills),blackStarRelease=blackstar_release,
                originalEndingComparisons=ending,
                visualVerdict='PENDING_MANUAL_REVIEW')
    (RAW/'verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({k:v for k,v in result.items() if k!='proofs'},ensure_ascii=False),flush=True)


if __name__=='__main__':main()
