"""Summarize capture evidence and render per-skill contact sheets for review."""
import json
import re
import subprocess
from pathlib import Path
from PIL import Image,ImageDraw
import recapture_trailer_combat_v22_20260909 as capture

ROOT=Path(__file__).resolve().parents[1]
OUT=capture.OUT

def main():
    proof=OUT/'proof';proof.mkdir(exist_ok=True)
    summaries=[]
    for take in capture.TAKES:
        path=OUT/(take['name']+'.json');video=path.with_suffix('.webm')
        if not path.exists() or not video.exists():continue
        data=json.loads(path.read_text(encoding='utf-8'));frames=data['samples']
        if not frames:continue
        hits=[e for e in data.get('combat',[]) if e['event']=='contact' and e['after']<e['before']]
        parries=[e for e in data.get('combat',[]) if e['event']=='parry']
        used=sorted({e['skill'] for e in data['skills'] if e.get('event')=='used'})
        shot_types=sorted({e['kind'] for e in data.get('combat',[]) if e['event']=='shot'})
        summary=dict(name=take['name'],seconds=data['seconds'],lastFrame=frames[-1]['t'],minHP=min(f['hp'] for f in frames),kills=frames[-1]['kills'],used=used,shotTypes=shot_types,damagingContacts=len(hits),parries=parries,events=data['skills'])
        summaries.append(summary)
        points=[e['t']+.65 for e in data['skills'] if e.get('event') in ('used','release') and e.get('skill')!='needleShot']
        if not points:points=[1.8,3.2,5]
        points=sorted(set(round(min(t,frames[-1]['t']-.3),2) for t in points))[:8]
        tiles=[]
        for i,t in enumerate(points):
            png=proof/f'{take["name"]}_{i}.jpg'
            subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-ss',str(t),'-i',str(video),'-vf','eq=gamma=1.48:contrast=1.06:saturation=1.10,scale=768:432','-frames:v','1',str(png)],check=True,creationflags=subprocess.CREATE_NO_WINDOW)
            tile=Image.new('RGB',(768,462),'#161616');tile.paste(Image.open(png),(0,30));ImageDraw.Draw(tile).text((12,8),f'{take["name"]} / {t:.2f}s',fill='white');tiles.append(tile)
        sheet=Image.new('RGB',(1536,462*((len(tiles)+1)//2)),'#161616')
        for i,tile in enumerate(tiles):sheet.paste(tile,((i%2)*768,(i//2)*462))
        sheet.save(proof/(take['name']+'.jpg'))
    (OUT/'combat_verification.json').write_text(json.dumps(summaries,ensure_ascii=False,indent=2),encoding='utf-8')
    definition=ROOT.joinpath('game.html').read_text(encoding='utf-8').split('const SKILL_LIST=[',1)[1].split('\n];',1)[0]
    ids=set(re.findall(r"\{id:'([^']+)'",definition))
    observed={e['skill'] for s in summaries for e in s['events'] if e.get('event')=='used' or e.get('ok')}
    coverage=dict(count=len(ids&observed),total=len(ids),observed=sorted(ids&observed),notObserved=sorted(ids-observed))
    (OUT/'skill_coverage.json').write_text(json.dumps(coverage,ensure_ascii=False,indent=2),encoding='utf-8')
    print('COVERAGE '+json.dumps(coverage,ensure_ascii=False))
    for s in summaries:print(json.dumps({k:v for k,v in s.items() if k not in ('events','parries')},ensure_ascii=False))

if __name__=='__main__':main()
