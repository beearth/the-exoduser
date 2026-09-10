import importlib.util,json,shutil,hashlib
from pathlib import Path
R=Path(__file__).resolve().parent
s=importlib.util.spec_from_file_location('render',R/'render.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
def source():
    receipts=[]
    for name,frames in [('w09_flash',60),('w09_return',210)]:
        p=R/(name+'.mp4');m.run(['-i',p,'-f','null','-']);q=m.probe(p)
        v=next(x for x in q['streams'] if x['codec_type']=='video');assert int(v['nb_frames'])==frames
        receipts.append(dict(file=p.name,frames=frames,decode='PASS',sha256=hashlib.sha256(p.read_bytes()).hexdigest()))
    m.dump('source_qa.json',dict(receipts=receipts,freeze_padding=False,visual_review='원래 v12 첫 타격3표본과 기존 전사3표본 확인. 한 명 하강 뒤 두 명 남은 원본0.8초 구도,47초부터 움직이는 전사로 전환. 정지 연장 없음.'))
def excerpt():
    m.run(['-ss','45.5','-i',R/'final.mp4','-t','5.5','-c:v','libx264','-crf','18','-preset','fast','-threads','4','-c:a','aac','-b:a','192k','-movflags','+faststart',R/'shadow_excerpt.mp4'])
    m.run(['-i',R/'shadow_excerpt.mp4','-f','null','-']);q=m.probe(R/'shadow_excerpt.mp4');v=next(x for x in q['streams'] if x['codec_type']=='video');assert int(v['nb_frames'])==330
    assert (R/'narration.wav').read_bytes()==(R.parent/'combat_trim_v17/narration.wav').read_bytes()
    m.dump('excerpt_qa.json',dict(duration=5.5,frames=330,decode='PASS',narration_v17_identical=True,sha256=hashlib.sha256((R/'shadow_excerpt.mp4').read_bytes()).hexdigest()))
    shutil.copy2(R/'shadow_excerpt.mp4',m.PROJECT/'대검전사_킬루가문_그림자_수정본.mp4')
if __name__=='__main__':
    import sys
    {'source':source,'excerpt':excerpt}[sys.argv[1]]()
