import importlib.util,json,hashlib,shutil
from pathlib import Path
R=Path(__file__).resolve().parent;P=R.parent
s=importlib.util.spec_from_file_location('render',P/'memory_v14/render.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
font=P/'full_review_v4/fonts'
caps=json.loads((P/'memory_v14/captions.json').read_text(encoding='utf-8'))
c=next(x for x in caps if '억울함' in x['ko'])
(R/'caps.srt').write_bytes(('1\n'+m.stamp(c['start_s']-82)+' --> '+m.stamp(c['end_s']-82)+'\n'+c['ko']+'\n').encode('utf-8'))
(R/'left_label.txt').write_bytes('이전 편집 — 포위 / 가족의 기억'.encode('utf-8'))
(R/'right_label.txt').write_bytes('현재 편집 — 인물의 표정'.encode('utf-8'))
def run(args):
    import subprocess
    subprocess.run([str(m.FF),'-v','error','-y',*map(str,args)],cwd=R,check=True)
sub="subtitles=caps.srt:fontsdir=../full_review_v4/fonts:force_style='FontName=Noto Serif CJK KR,FontSize=13,MarginV=32,Outline=0.6,Shadow=0.4'"
run(['-ss','82','-i',P/'full_review_v4/clean.mp4','-ss','82','-i',P/'memory_v14/narration.wav','-t','7.5','-map','0:v','-map','1:a','-vf','setpts=PTS-STARTPTS,fps=60,'+sub,'-c:v','libx264','-crf','18','-preset','fast','-threads','4','-c:a','aac','-b:a','192k','-movflags','+faststart',R/'previous.mp4'])
run(['-ss','82','-i',P/'memory_v14/final.mp4','-t','7.5','-c:v','libx264','-crf','18','-preset','fast','-threads','4','-c:a','aac','-b:a','192k','-movflags','+faststart',R/'current.mp4'])
args=['-filter_complex_threads','1','-ss','82','-i',P/'full_review_v4/clean.mp4']
for n in ['w15a','w15b','w15c']:args+=['-i',P/'realism_v7'/(n+'.mp4')]
args+=['-ss','82','-i',P/'memory_v14/narration.wav']
fc=['[0:v]setpts=PTS-STARTPTS,fps=60,trim=end_frame=450,scale=960:540,setsar=1[l]']
for i,frames in enumerate([150,130,170],1):fc.append(f'[{i}:v]setpts=PTS-STARTPTS,fps=60,trim=end_frame={frames},scale=960:540,setsar=1[r{i}]')
fc+=['[r1][r2][r3]concat=n=3:v=1:a=0[r]',"[l][r]hstack=inputs=2,pad=1920:1080:0:200:color=0x101010,drawtext=fontfile='../full_review_v4/fonts/NotoSerifCJKkr-Medium.otf':textfile=left_label.txt:fontsize=32:fontcolor=white:x=55:y=135,drawtext=fontfile='../full_review_v4/fonts/NotoSerifCJKkr-Medium.otf':textfile=right_label.txt:fontsize=32:fontcolor=white:x=1015:y=135,"+sub+'[v]']
run(args+['-filter_complex',';'.join(fc),'-map','[v]','-map','4:a','-t','7.5','-c:v','libx264','-crf','18','-preset','fast','-threads','4','-c:a','aac','-b:a','192k','-movflags','+faststart',R/'comparison.mp4'])
receipts=[]
for n in ['previous','current','comparison']:
    p=R/(n+'.mp4');run(['-i',p,'-f','null','-']);q=m.probe(p);v=next(x for x in q['streams'] if x['codec_type']=='video');assert int(v['nb_frames'])==450
    receipts.append(dict(file=p.name,frames=450,duration=7.5,sha256=hashlib.sha256(p.read_bytes()).hexdigest(),decode='PASS'))
shutil.copy2(R/'comparison.mp4',m.PROJECT/'대검전사_감정컷_이전현재_비교.mp4')
shutil.copy2(R/'previous.mp4',m.PROJECT/'대검전사_감정컷_이전버전.mp4')
(R/'qa.json').write_bytes((json.dumps(dict(receipts=receipts,source_range=[82,89.5],voice='v14 narration unchanged',current_main='memory_v14/final.mp4',visual_review='pending',realtime_review=False,listening_review=False),ensure_ascii=False,indent=2)+'\n').encode('utf-8'))
run(['-ss','5.5','-i',R/'comparison.mp4','-frames:v','1',R/'comparison_sample.jpg'])
print('Previous/current comparison and previous-only voiced excerpt ready; main movie unchanged')
