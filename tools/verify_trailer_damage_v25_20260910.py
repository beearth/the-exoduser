"""Verify 58-second captioned damage trailer and its source capture evidence."""
import hashlib
import json
from PIL import Image,ImageDraw,ImageChops,ImageStat
from playwright.sync_api import sync_playwright
from build_trailer_damage_v25_20260910 import ROOT,RAW,EDIT,FINAL,SOURCE,EDL
from recapture_trailer_damage_v25_20260910 import TAKES
from verify_trailer_damage_v24_20260910 import run


def main():
    meta=json.loads(run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(FINAL)])[0])
    video=next(s for s in meta['streams'] if s['codec_type']=='video')
    audio=next(s for s in meta['streams'] if s['codec_type']=='audio')
    assert (video['width'],video['height'],video['r_frame_rate'],video['nb_frames'])==(1920,1080,'60/1','3480')
    assert abs(float(meta['format']['duration'])-58)<.05
    assert audio['codec_name']=='aac' and audio['sample_rate']=='48000' and audio['channels']==2
    assert all('boss' not in row[0] for row in EDL) and sum(row[2] for row in EDL)==58
    run(['ffmpeg','-v','error','-i',str(FINAL),'-f','null','-'])
    levels=run(['ffmpeg','-hide_banner','-i',str(FINAL),'-vn','-af','volumedetect','-f','null','-'])[1]
    assert 'mean_volume: -inf' not in levels
    (RAW/'audio_levels.txt').write_text(levels,encoding='utf-8')
    original_lines=(ROOT/'tmp/trailer_v2/edit/captions.ass').read_text(encoding='utf-8-sig').splitlines()
    expected=[s for s in original_lines if s.startswith('Dialogue:') and s.split(',')[1]<'0:00:54.00']
    actual=[s for s in (EDIT/'captions.ass').read_text(encoding='utf-8-sig').splitlines() if s.startswith('Dialogue:')]
    assert actual==expected,'Caption wording/timing differs from V23 source'
    data={};summary=[]
    for take in TAKES:
        d=json.loads((RAW/(take['name']+'.json')).read_text(encoding='utf-8'));data[take['name']]=d
        loadout=json.loads((RAW/(take['name']+'_loadout.json')).read_text(encoding='utf-8'))
        assert loadout['onCritExplode']==0 and loadout['onCritChain']==0
        samples=d['samples'];assert min(s['hp'] for s in samples)>0
        assert samples[-1]['t']>=take['seconds']-.4 and samples[-1]['numberDraws']>0
        female=0;forbidden=[]
        for e in d['audio']:
            female+=any(k.startswith('silvertail_') for k in e['keys'])
            forbidden.extend(k for k in e['keys'] if k.startswith(('voice_','player_hit','player_dead')) or k in ('male_grunt','repentance'))
        assert not forbidden
        summary.append(dict(name=take['name'],numberDraws=samples[-1]['numberDraws'],femaleVoices=female,
                            frames=len(samples),maxFrameMs=round(max((b['t']-a['t'])*1000 for a,b in zip(samples,samples[1:])),2)))
    flames=data['fire_stack_b']['samples'];assert max(len(s['flames']) for s in flames)>=2
    assert max(sum(s['flames']) for s in flames)>=1
    assert max(s['rage'] for s in data['rage_charge']['samples'])>0
    report=json.loads((RAW/'report.json').read_text());assert not report['pageErrors']
    full_report=RAW/'attempt2/report.json'
    if full_report.exists():assert not json.loads(full_report.read_text())['pageErrors']
    times=[.6,1.6,2.6,4.5,7.5,10.5,15,23.2,28,33,36.8,42,49,53,54.5,55.5,57.8]
    timeline=json.loads((RAW/'timeline.json').read_text())
    for cut in timeline:
        if cut['name'] not in data:continue
        samples=data[cut['name']]['samples']
        pairs=[(b['numberDraws']-a['numberDraws'],b['t']) for a,b in zip(samples,samples[1:])
               if cut['sourceStart']+.1<b['t']<cut['sourceStart']+cut['end']-cut['start']-.1]
        if pairs:
            draws,at=max(pairs)
            if draws>0:times.append(round(cut['start']+at-cut['sourceStart'],3))
    times=sorted(set(times))
    for n in range((len(times)+8)//9):
        sheet=Image.new('RGB',(1920,1152),'#141414')
        for i,seconds in enumerate(times[n*9:n*9+9]):
            frame=RAW/f'FRAME_{seconds}.jpg'
            run(['ffmpeg','-v','error','-y','-ss',str(seconds),'-i',str(FINAL),'-frames:v','1','-vf','scale=640:360',str(frame)])
            x,y=i%3*640,i//3*384
            with Image.open(frame) as im:sheet.paste(im,(x,y+24))
            ImageDraw.Draw(sheet).text((x+8,y+6),f'{seconds:.3f}s',fill='white')
        sheet.save(RAW/f'CONTACT_{n+1:02}.jpg')
    comparisons=[]
    for seconds in [4.5,7.5,10.5,55.5,57.8]:
        paths=[RAW/f'compare_{seconds}_{label}.png' for label in ['original','final']]
        for source,target in zip([SOURCE,FINAL],paths):
            run(['ffmpeg','-v','error','-y','-ss',str(seconds),'-i',str(source),'-frames:v','1','-vf','scale=640:360',str(target)])
        delta=sum(ImageStat.Stat(ImageChops.difference(Image.open(paths[0]),Image.open(paths[1]))).mean)/3
        assert delta<3,(seconds,delta)
        comparisons.append(dict(seconds=seconds,meanPixelDifference=round(delta,4)))
    source_hash=hashlib.sha256(SOURCE.read_bytes()).hexdigest()
    assert source_hash=='0b8d8bb3bf4d9ac54233a626fd9cc5cf5424281fd70663c6019dd6fcee7943ae'
    url='http://localhost:3333/'+FINAL.relative_to(ROOT).as_posix()
    (RAW/'review.html').write_text('<!doctype html><meta charset="utf-8"><title>V25 Damage Text + Captions</title><style>body{margin:0;background:#111}video{width:100%;max-height:96vh}</style><video controls src="'+url+'"></video>',encoding='utf-8')
    with sync_playwright() as p:
        browser=p.chromium.launch(channel='chrome',headless=True);page=browser.new_page()
        page.goto('http://localhost:3333/tmp/trailer_damage_v25/review.html')
        page.wait_for_function('document.querySelector("video").readyState>=2')
        page.locator('video').evaluate('(v)=>{v.muted=true;v.currentTime=32;return v.play()}');page.wait_for_timeout(1200)
        playback=page.locator('video').evaluate('(v)=>({time:v.currentTime,duration:v.duration,error:v.error?.message||null})')
        assert playback['time']>32 and playback['error'] is None;browser.close()
    result=dict(file=str(FINAL),bytes=FINAL.stat().st_size,duration=58,frames=3480,decode='PASS',
                captionRows=len(actual),captionsUnchanged=True,bossRemoved=True,takes=summary,
                comparisons=comparisons,sourcePreserved=True,sourceSHA256=source_hash,browser=playback,
                visualVerdict='PENDING_MANUAL_REVIEW')
    (RAW/'verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(result,ensure_ascii=False),flush=True)


if __name__=='__main__':main()
