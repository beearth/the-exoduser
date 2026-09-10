from pathlib import Path
import numpy as np, soundfile as sf, json
R=Path(__file__).resolve().parent
x,sr=sf.read(R.parent/'ending_timing_v20/narration.wav',dtype='float32',always_2d=True)
y,yr=sf.read(R/'narration.wav',dtype='float32',always_2d=True)
assert sr==yr==48000 and len(y)==round(96.4*sr)
assert np.array_equal(y[:round(59.5*sr)],x[:round(59.5*sr)])
assert np.array_equal(y[round(59.5*sr):],x[round(60.5*sr):])
for a,b,n in [(89.34,90.34,48000),(91.395,92.895,72000)]:
    gap=y[round(a*sr):round(b*sr)];assert len(gap)==n and np.max(np.abs(gap))==0
caps=json.loads((R/'captions.json').read_text(encoding='utf-8'))
assert len(caps)==22
assert next(c for c in caps if c['id']=='wa21')['end_s']==59.03
assert next(c for c in caps if c['id']=='wa22')['start_s']==59.5
result=dict(status='PASS',total=96.4,removed_v20_range=[59.5,60.5],removed_samples=48000,all_retained_pcm_identical=True,pause_seconds=[1,1.5],caption_count=22)
(R/'timing_qa.json').write_bytes(json.dumps(result,indent=2).encode('utf-8'))
print(result)
