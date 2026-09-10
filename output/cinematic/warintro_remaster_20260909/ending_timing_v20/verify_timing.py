from pathlib import Path
import soundfile as sf
import numpy as np
import json,shutil
R=Path(__file__).resolve().parent
x,sr=sf.read(R.parent/'shadow_trim_v19/narration.wav',dtype='float32',always_2d=True)
y,yr=sf.read(R/'narration.wav',dtype='float32',always_2d=True);assert sr==yr==48000
assert len(y)==round(97.4*sr)
assert np.array_equal(y[:round(90.34*sr)],x[:round(90.34*sr)])
checks=[]
for a,b,c in [(94.04,95.095,91.34),(99,101.52,93.895)]:
    old=x[round(a*sr):round(b*sr)];new=y[round(c*sr):round(c*sr)+len(old)]
    assert np.array_equal(old,new);checks.append(dict(original=[a,b],new=[c,c+len(old)/sr],pcm_identical=True))
for a,b,n in [(90.34,91.34,48000),(92.395,93.895,72000)]:
    gap=y[round(a*sr):round(b*sr)];assert len(gap)==n and np.max(np.abs(gap))==0
checks.append(dict(pause_samples=[48000,72000],pause_seconds=[1,1.5],digital_silence=True))
(R/'timing_qa.json').write_bytes(json.dumps(dict(checks=checks,audio_speed=1,total=97.4,status='PASS'),ensure_ascii=False,indent=2).encode('utf-8'))
shutil.copy2(R/'ending.mp4',R.parents[3]/'대검전사_엔딩_템포수정.mp4')
print('Exact1.0s/1.5s pauses and unchanged speech PCM PASS')
