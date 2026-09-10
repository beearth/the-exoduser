"""Build four contrasting audition candidates; leave the game sound unchanged."""
from pathlib import Path
import hashlib,html,json,wave
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'탄막_피격음_후보'
RAW=OUT/'원음'
SR=48000
SPECS=[
 {'id':1,'name':'묵직한 관통음','duration':.24,'seed':601,'body':[140,48,.024,.065,.85],'noise':[180,2200,.038,.33],'crack':[1400,4800,.008,.17],'modes':[]},
 {'id':2,'name':'날카로운 파열음','duration':.12,'seed':602,'body':[270,105,.012,.022,.34],'noise':[1200,6400,.009,.9],'crack':[350,2600,.024,.34],'modes':[[2450,.008,.12],[3730,.005,.06]]},
 {'id':3,'name':'마력 붕괴음','duration':.24,'seed':603,'body':[410,78,.035,.047,.48],'noise':[600,4900,.034,.43],'crack':[2000,7200,.011,.26],'modes':[[731,.038,.18],[1177,.027,.13]],'fm':[980,190,.021,117,3.4,.044,.48]},
 {'id':4,'name':'갑옷 충돌음','duration':.22,'seed':604,'body':[195,72,.018,.034,.58],'noise':[850,5700,.012,.38],'crack':[200,1750,.031,.25],'modes':[[410,.055,.28],[937,.038,.22],[1601,.024,.16],[2683,.014,.08]]},
]

def write(path,samples):
    assert np.max(np.abs(samples))<=.76
    with wave.open(str(path),'wb') as w:
        w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR)
        w.writeframes(np.round(samples*32767).astype('<i2').tobytes())
def synth(spec):
    t=np.arange(round(SR*spec['duration']))/SR;rng=np.random.default_rng(spec['seed'])
    def pitch(start,end,tau):return 2*np.pi*(end*t+(start-end)*tau*(1-np.exp(-t/tau)))
    def noise(lo,hi,decay,weight):
        f=np.fft.rfftfreq(len(t),1/SR);sp=np.fft.rfft(rng.normal(0,1,len(t)))
        sp*=np.minimum(1,f/lo)**4/(1+(f/hi)**8)
        n=np.fft.irfft(sp,n=len(t));n/=max(1e-9,np.max(np.abs(n)))
        return weight*n*np.exp(-t/decay)
    start,end,tau,decay,weight=spec['body']
    x=weight*np.sin(pitch(start,end,tau))*np.exp(-t/decay)
    x+=noise(*spec['noise'])+noise(*spec['crack'])
    for freq,decay,weight in spec['modes']:x+=weight*np.sin(2*np.pi*freq*t)*np.exp(-t/decay)
    if 'fm' in spec:
        start,end,tau,mf,mi,decay,weight=spec['fm']
        x+=weight*np.sin(pitch(start,end,tau)+mi*np.sin(2*np.pi*mf*t))*np.exp(-t/decay)
    x*=np.minimum(1,t/.0007)*np.minimum(1,(spec['duration']-t)/.014)
    x*=min(.75/np.max(np.abs(x)),.16/np.sqrt(np.mean(x*x)))
    assert np.sqrt(np.mean(x*x))>.06
    return x
def audition(x):
    # Three isolated impacts, followed by six impacts at the game's 100ms sound interval.
    out=np.zeros(SR*4)
    for start in [.15,.85,1.55,2.5,2.6,2.7,2.8,2.9,3.0]:
        a=round(start*SR);out[a:a+len(x)]+=x*.55
    assert np.max(np.abs(out))<.76
    return out

def main():
    OUT.mkdir(exist_ok=True);RAW.mkdir(exist_ok=True)
    game_sound=ROOT/'sfx/hit/player_projectile_impact.wav'
    original_hash=hashlib.sha256(game_sound.read_bytes()).hexdigest()
    clips=[];items=[]
    with wave.open(str(game_sound),'rb') as w:current=np.frombuffer(w.readframes(w.getnframes()),'<i2').astype(float)/32768
    reference=audition(current);write(OUT/'00_현재_피격음.wav',reference)
    clips.append(reference)
    for spec in SPECS:
        x=synth(spec);name=f"{spec['id']:02d}_{spec['name'].replace(' ','_')}.wav"
        write(RAW/name,x);preview=audition(x);write(OUT/name,preview);clips.append(preview)
        items.append({'id':spec['id'],'name':spec['name'],'preview':name,'raw':'원음/'+name,'duration_s':len(x)/SR,'peak':float(np.max(np.abs(x))),'rms':float(np.sqrt(np.mean(x*x))),'sha256':hashlib.sha256((RAW/name).read_bytes()).hexdigest()})
    assert len({i['sha256'] for i in items})==4
    comparison=np.concatenate([np.concatenate([c,np.zeros(round(.5*SR))]) for c in clips])
    write(OUT/'전체비교_현재음_1번_2번_3번_4번.wav',comparison)
    rows=[('00 현재 게임 소리','00_현재_피격음.wav')]+[(f"{i['id']:02d} {i['name']}",i['preview']) for i in items]
    body=''.join(f'<section><h2>{html.escape(label)}</h2><audio controls preload="none" src="{html.escape(src)}"></audio></section>' for label,src in rows)
    page='''<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>탄막 피격음 후보</title><style>body{max-width:700px;margin:40px auto;padding:0 24px;background:#191919;color:#eee;font-family:system-ui}h1{font-size:26px}h2{font-size:18px}section{padding:12px 0;border-bottom:1px solid #444}audio{width:100%}p{color:#bbb;line-height:1.7}</style><h1>탄막 피격음 후보</h1><p>각 후보는 단발 3회 → 연속 피격 순서입니다.<br>현재 게임 소리와 비교해 원하는 번호를 골라주세요.</p>'''+body+'''<script>document.querySelectorAll('audio').forEach(a=>a.addEventListener('play',()=>document.querySelectorAll('audio').forEach(b=>{if(a!==b)b.pause()})))</script></html>'''
    (OUT/'여기서_들어보기.html').write_bytes(page.encode('utf-8'))
    assert hashlib.sha256(game_sound.read_bytes()).hexdigest()==original_hash
    report={'status':'PASS','sample_rate':SR,'channels':1,'bits':16,'candidates':items,'synthesis':SPECS,'attack_s':.0007,'tail_fade_s':.014,'raw_peak_limit':.75,'raw_rms_target':.16,'preview_gain':.55,'preview_length_s':4,'preview_hits_s':[.15,.85,1.55,2.5,2.6,2.7,2.8,2.9,3.0],'comparison_order':[0,1,2,3,4],'comparison_gap_s':.5,'comparison_length_s':len(comparison)/SR,'game_sound_unchanged_sha256':original_hash,'listening_review':False}
    (OUT/'제작_검증.json').write_bytes((json.dumps(report,ensure_ascii=False,indent=2)+'\n').encode('utf-8'))
    print(json.dumps({'status':'PASS','folder':str(OUT),'candidates':items},ensure_ascii=False))

if __name__=='__main__':main()
