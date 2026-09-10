import importlib.util,json,subprocess
from pathlib import Path
R=Path(__file__).resolve().parent;P=R.parent
s=importlib.util.spec_from_file_location('render',R/'render.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
inputs=[P/'realism_v7/w11a.mp4',P/'w04_v3/source.mp4',P/'batch/w07/source.mp4',P/'w06/source.mp4']
args=['-filter_complex_threads','1']
for p in inputs:args+=['-threads','1','-i',p]
# Frame-exact hard cuts: 30 present + 9 wife + 9 parents + 9 wagon + 153 present = 210 frames.
fc=['[0:v]fps=60,setsar=1,split=2[b0][b1]',
    '[b0]trim=start_frame=0:end_frame=30,setpts=PTS-STARTPTS[a]',
    '[b1]trim=start_frame=57:end_frame=210,setpts=PTS-STARTPTS[e]']
for i,(at,label) in enumerate([(4.5,'b'),(.5,'c'),(.25,'d')],1):
    fc.append(f'[{i}:v]trim=start={at}:duration=0.3,setpts=PTS-STARTPTS,scale=1920:1080,crop=1916:1080:2:0,fps=60,trim=end_frame=9,setsar=1[{label}]')
fc.append('[a][b][c][d][e]concat=n=5:v=1:a=0[v]')
m.run(args+['-filter_complex',';'.join(fc),'-map','[v]','-an','-c:v','libx264','-crf','16','-preset','fast','-threads','4','-pix_fmt','yuv420p','-movflags','+faststart',R/'w11a_memory.mp4'])
# Replace the later long parent insert with actual motion of the present-day warrior.
m.run(['-ss','2.5','-i',P/'realism_v7/w10c.mp4','-t','2','-vf','fps=60,trim=end_frame=120,setsar=1','-an','-c:v','libx264','-crf','16','-preset','fast','-threads','4','-pix_fmt','yuv420p','-movflags','+faststart',R/'w11b_present.mp4'])
for name,frames in [('w11a_memory',210),('w11b_present',120)]:
    q=m.probe(R/(name+'.mp4'));v=next(x for x in q['streams'] if x['codec_type']=='video');assert int(v['nb_frames'])==frames
m.dump('memory_manifest.json',dict(order=['wife','parents','children_wagon'],global_range=[60.5,60.95],frames_per_flash=9,duration_per_flash=.15,total_frames=27,total_duration=.45,flash_ranges=[[60.5,60.65],[60.65,60.8],[60.8,60.95]],sources=[dict(file=str(p.relative_to(P)),start=t) for p,t in zip(inputs[1:],[4.5,.5,.25])],return_at=60.95,long_parent_insert_replaced=dict(range=[63.5,65.5],source='realism_v7/w10c.mp4',source_range=[2.5,4.5]),hard_cuts=True,freeze=False,source_speed=1,voice_changed=False,children_visible=False,children_scene='previous closed transport wagon',shadow_v12_rejected=True))
print('27-frame flash montage and present-day return prepared')
