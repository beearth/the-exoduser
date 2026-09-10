import importlib.util
from pathlib import Path
R=Path(__file__).resolve().parent;P=R.parent
s=importlib.util.spec_from_file_location('render',R/'render.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
inputs=[P/'realism_v7/w11a.mp4',P/'w04_v3/source.mp4',P/'batch/w07/source.mp4',P/'w06/source.mp4']
args=['-filter_complex_threads','1']
for p in inputs:args+=['-threads','1','-i',p]
# 30 present frames plus three 60-frame memories cover the complete 210-frame shot.
fc=['[0:v]fps=60,setsar=1,trim=start_frame=0:end_frame=30,setpts=PTS-STARTPTS[a]']
for i,(at,label) in enumerate([(4.5,'b'),(.5,'c'),(.25,'d')],1):
    fc.append(f'[{i}:v]trim=start={at}:duration=1.2,setpts=PTS-STARTPTS,scale=1920:1080,crop=1916:1080:2:0,fps=60,trim=end_frame=60,setsar=1[{label}]')
fc.append('[a][b][c][d]concat=n=4:v=1:a=0[v]')
m.run(args+['-filter_complex',';'.join(fc),'-map','[v]','-an','-c:v','libx264','-crf','16','-preset','fast','-threads','4','-pix_fmt','yuv420p','-movflags','+faststart',R/'w11a_memory.mp4'])
q=m.probe(R/'w11a_memory.mp4');v=next(x for x in q['streams'] if x['codec_type']=='video');assert int(v['nb_frames'])==210
m.dump('memory_manifest.json',dict(order=['wife','parents','children_wagon'],global_range=[60.5,63.5],frames_per_memory=60,duration_per_memory=1,total_frames=180,total_duration=3,memory_ranges=[[60.5,61.5],[61.5,62.5],[62.5,63.5]],sources=[dict(file=str(p.relative_to(P)),start=t,duration=1) for p,t in zip(inputs[1:],[4.5,.5,.25])],return_at=63.5,covered_caption_ranges=[[60.5,60.98],[60.98,63.43]],hard_cuts=True,freeze=False,source_speed=1,voice_changed=False,children_visible=False,children_scene='previous closed transport wagon',shadow_v12_rejected=True))
print('Whole-phrase family montage: 60/60/60 frames, return at63.5s')
