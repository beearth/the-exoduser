"""Package actual ElevenLabs outputs for comparison; no synthesized audio layers."""
from pathlib import Path
import hashlib, json, html, os, subprocess, wave
import numpy as np
R=Path(__file__).resolve().parents[1]
O=R/'마법_피격음_일레븐랩스'
ff=next((Path(os.environ['LOCALAPPDATA'])/'Microsoft/WinGet/Packages').glob('Gyan.FFmpeg_*/ffmpeg-*/bin/ffmpeg.exe'))
SR=48000
manifest=json.loads((O/'제작_기록.json').read_text(encoding='utf-8'))
game=R/'sfx/hit/player_projectile_impact.wav'
assert hashlib.sha256(game.read_bytes()).hexdigest()==manifest['game_sound_sha256']
def decode(p):
    return np.frombuffer(subprocess.check_output([str(ff),'-v','error','-i',str(p),'-f','f32le','-ac','1','-ar',str(SR),'-']),dtype='<f4').astype(float)
def write(p,x):
    assert np.isfinite(x).all() and abs(x).max()<1
    with wave.open(str(p),'wb') as w:
        w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes(np.round(x*32767).astype('<i2').tobytes())
def preview(x):
    y=np.zeros(SR*4)
    for t in [.15,.85,1.55,2.5,2.6,2.7,2.8,2.9,3.0]:
        a=round(t*SR);y[a:a+len(x)]+=x*.55
    return y
rows=[('00 처음 만든 소리 · 현재 게임에 연결됨','00_처음_만든_소리.wav')]
clips=[preview(decode(game))];write(O/rows[0][1],clips[0])
metrics=[]
for c in manifest['candidates']:
    x=decode(O/c['file']);peak=abs(x).max();rms=np.sqrt(np.mean(x*x))
    assert .4<len(x)/SR<.7 and peak>.01 and rms>.001
    gain=min(.75/peak,.16/rms)
    x*=gain
    p=f"{c['id']:02d}_비교듣기.wav";y=preview(x);write(O/p,y);clips.append(y)
    rows.append((f"{c['id']:02d} {c['name']}",p))
    metrics.append({'id':c['id'],'duration_s':len(x)/SR,'source_peak':float(peak),'source_rms':float(rms),'preview_normalization_gain':float(gain),'preview_peak':float(abs(y).max())})
write(O/'전체비교_현재_1_2_3.wav',np.concatenate([np.r_[c,np.zeros(SR//2)] for c in clips]))
sections=''.join(f'<section><h2>{html.escape(n)}</h2><audio controls preload="metadata" src="{p}"></audio></section>' for n,p in rows)
page='''<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>일레븐랩스 마법 피격음</title><style>body{max-width:700px;margin:40px auto;padding:0 24px;background:#191919;color:#eee;font-family:system-ui}h1{font-size:26px}h2{font-size:18px}section{padding:12px 0;border-bottom:1px solid #444}audio{width:100%}p{color:#bbb;line-height:1.7}</style><h1>일레븐랩스 마법 피격음</h1><p>새 후보 3개는 ElevenLabs로 생성했습니다.<br>단발 3회 → 연속 피격 순서로 들어보세요.<br>현재 게임에는 처음 만든 소리가 연결돼 있습니다.</p>'''+sections+'''<script>document.querySelectorAll('audio').forEach(a=>a.addEventListener('play',()=>document.querySelectorAll('audio').forEach(b=>{if(a!==b)b.pause()})))</script></html>'''
(O/'여기서_들어보기.html').write_bytes(page.encode('utf-8'))
(O/'검증.json').write_bytes(json.dumps({'status':'PASS','sample_rate':SR,'channels':1,'bits':16,'preview_gain':.55,'preview_duration_s':4,'comparison_duration_s':18,'metrics':metrics,'game_sound_unchanged':True,'listening_review':False},ensure_ascii=False,indent=2).encode('utf-8'))
print(json.dumps(metrics,ensure_ascii=False))
