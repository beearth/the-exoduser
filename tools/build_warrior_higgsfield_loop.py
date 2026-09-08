"""Loop finishing for a Higgsfield-generated clip; does not synthesize motion.
Usage: python build_warrior_higgsfield_loop.py RAW.mp4 LOOP.mp4 POSTER.jpg
Requires ffmpeg and ffprobe on PATH. Run in the Higgsfield media sandbox.
"""
import json
import subprocess
import sys
from pathlib import Path

def finish(source, output, poster):
    info = json.loads(subprocess.check_output([
        'ffprobe', '-v', 'error', '-select_streams', 'v:0',
        '-show_entries', 'stream=nb_frames,r_frame_rate', '-of', 'json', source
    ]))['streams'][0]
    frames = int(info['nb_frames'])
    numerator, denominator = map(int, info['r_frame_rate'].split('/'))
    fps = numerator / denominator
    overlap = 12
    if frames <= overlap * 2:
        raise ValueError('Clip is too short for the 12-frame overlap')
    # Keep forward motion. Mix only the matching tail/head poses using smoothstep.
    q = f'min(max(T*{fps}/{overlap-1},0),1)'
    weight = f'(3*pow({q},2)-2*pow({q},3))'
    graph = (
        '[0:v]split=3[a][b][c];'
        f'[a]trim=start_frame={overlap}:end_frame={frames-overlap},setpts=PTS-STARTPTS[body];'
        f'[b]trim=start_frame={frames-overlap}:end_frame={frames},setpts=PTS-STARTPTS[tail];'
        f'[c]trim=start_frame=0:end_frame={overlap},setpts=PTS-STARTPTS[head];'
        f"[tail][head]blend=all_expr='A*(1-{weight})+B*{weight}'[join];"
        '[body][join]concat=n=2:v=1:a=0[out]'
    )
    subprocess.run(['ffmpeg','-y','-v','error','-i',source,
        '-filter_complex',graph,'-map','[out]','-an','-c:v','libx264',
        '-preset','slow','-crf','18','-pix_fmt','yuv420p','-r',str(fps),
        '-g',str(round(fps)),'-movflags','+faststart',output],check=True)
    subprocess.run(['ffmpeg','-y','-v','error','-i',output,
        '-frames:v','1','-q:v','2',poster],check=True)
    print(json.dumps({'source_frames':frames,'overlap_frames':overlap,
        'output_frames':frames-overlap,'fps':fps,
        'duration':(frames-overlap)/fps,'bytes':Path(output).stat().st_size}))

if __name__ == '__main__':
    finish(*sys.argv[1:])
