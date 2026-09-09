"""Resume the interrupted v4 render using downloaded, already generated footage."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent
OLD = ROOT.parent / 'full_review_v3'
BIN = Path(os.environ['LOCALAPPDATA']) / 'Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.0.1-full_build/bin'
FF = str(BIN / 'ffmpeg.exe')
FP = str(BIN / 'ffprobe.exe')
os.chdir(ROOT)


def run(args):
    subprocess.run([FF, '-hide_banner', '-v', 'error', '-y', *map(str, args)], check=True)


def probe(path):
    return json.loads(subprocess.check_output([FP, '-v', 'error', '-show_format', '-show_streams', '-of', 'json', str(path)]))


def dump(path, data):
    Path(path).write_bytes((json.dumps(data, ensure_ascii=False, indent=2) + '\n').encode('utf-8'))


def cadence(path, spans, start=0, duration=None):
    args = [FF, '-v', 'error', '-ss', str(start), '-i', str(path)]
    if duration is not None:
        args += ['-t', str(duration)]
    args += ['-vf', 'scale=320:180,format=gray', '-f', 'rawvideo', '-']
    raw = subprocess.check_output(args)
    frames = np.frombuffer(raw, np.uint8).reshape(-1, 180, 320).astype(np.float32)
    results = []
    for label, lo, hi, fps in spans:
        x = frames[lo:hi]
        assert len(x) == hi-lo, (path, label, len(x), hi-lo)
        delta = np.abs(np.diff(x, axis=0)).mean(axis=(1, 2))
        results.append(dict(shot=label, frames=len(x), transitions=len(delta),
                            near_duplicate_ratio=float((delta < .25).mean()),
                            changed_frames_hz=float((delta >= .25).sum()/((hi-lo)/fps)),
                            mean_mad=float(delta.mean())))
    return results


def sheet(path, times, target):
    target = Path(target)
    folder = ROOT / (target.stem + '_frames')
    folder.mkdir(exist_ok=True)
    canvas = Image.new('RGB', (1440, 294*((len(times)+2)//3)), '#101010')
    draw = ImageDraw.Draw(canvas)
    for i, t in enumerate(times):
        dest = folder / f'{i:02d}_{t:.3f}.jpg'
        run(['-ss', t, '-i', path, '-frames:v', 1, '-update', 1, dest])
        with Image.open(dest) as im:
            x, y = i%3*480, i//3*294
            canvas.paste(im.resize((480, 270)), (x, y))
            draw.text((x+8, y+274), f'{t:.3f}s', fill='white')
    canvas.save(target, quality=94)


def inspect():
    receipts = {}
    for name, duration in [('smooth_hq.mp4', 6.5), ('escape_hq.mp4', 5)]:
        p = probe(name)
        v = next(s for s in p['streams'] if s['codec_type'] == 'video')
        assert (v['width'], v['height'], v['r_frame_rate']) == (1920, 1080, '60/1'), v
        assert float(v['duration']) >= duration-.02, v
        run(['-i', name, '-f', 'null', '-'])
        receipts[name] = dict(bytes=Path(name).stat().st_size, duration=v['duration'], frames=v['nb_frames'], sha256=hashlib.sha256(Path(name).read_bytes()).hexdigest())
    spans = [('A', 0, 120, 60), ('B', 120, 333, 60), ('C', 333, 390, 60)]
    data = dict(enhanced=cadence('smooth_hq.mp4', spans),
                intermediate=cadence(ROOT.parent/'ending_smooth_v4/smooth_ending.mp4', spans),
                previous=cadence('source_v3.mp4', [('A', 0, 48, 24), ('B', 48, 133, 24), ('C', 133, 156, 24)], start=89.5, duration=6.5),
                escape=cadence('escape_hq.mp4', [('D', 0, 300, 60)]), receipts=receipts,
                metric='320x180 gray adjacent-frame mean absolute difference; near-duplicate <0.25; excludes cut boundaries',
                visual_review_pending=True)
    dump('resumed_motion_qa.json', data)
    sheet('smooth_hq.mp4', [0,.8,1.983333,2,3.7,5.533333,5.55,6,6.483333], 'enhanced_contact.jpg')
    sheet('escape_hq.mp4', [0,1,2,3,4,4.983333], 'escape_enhanced_contact.jpg')
    print(json.dumps(data, indent=2), flush=True)


def render():
    shutil.copyfile(OLD/'caps.srt', 'caps.srt')
    # Render one uniform 60fps stream. fps on the head duplicates the existing 24fps
    # frames; only the ending uses the previously completed motion interpolation.
    fc = ('[0:v]trim=duration=89.5,setpts=PTS-STARTPTS,scale=1920:1080:flags=lanczos,fps=60,setsar=1[a];'
          '[1:v]trim=duration=6.5,setpts=PTS-STARTPTS,setsar=1[b];'
          '[2:v]trim=duration=5,setpts=PTS-STARTPTS,setsar=1[c];'
          '[a][b][c]concat=n=3:v=1:a=0,fade=t=out:st=100.2:d=0.8[v];'
          '[0:a]apad=whole_dur=101,atrim=duration=101[audio]')
    print('Rendering clean 101-second master', flush=True)
    run(['-i','source_v3.mp4','-i','smooth_hq.mp4','-i','escape_hq.mp4',
         '-filter_complex_threads',4,'-filter_complex',fc,'-map','[v]','-map','[audio]',
         '-t',101,'-r',60,'-c:v','libx264','-preset','fast','-crf',18,'-threads',4,
         '-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart','clean.mp4'])
    print('Rendering unchanged Korean cues', flush=True)
    style='FontName=Noto Serif CJK KR,FontSize=13,MarginV=32,Outline=0.6,Shadow=0.4'
    run(['-i','clean.mp4','-vf',f"subtitles=caps.srt:fontsdir=fonts:force_style='{style}'",
         '-c:v','libx264','-preset','fast','-crf',18,'-threads',4,'-pix_fmt','yuv420p',
         '-c:a','copy','-movflags','+faststart','final.mp4'])
    run(['-ss',89.5,'-i','final.mp4','-t',11.5,'-c:v','libx264','-preset','fast','-crf',18,
         '-threads',4,'-c:a','aac','-b:a','192k','-movflags','+faststart','ending_final.mp4'])
    print('Render complete', flush=True)


def pcm(path):
    return np.frombuffer(subprocess.check_output([FF,'-v','error','-i',str(path),'-ac','1','-ar','24000','-f','f32le','-']),np.float32)


def verify():
    receipts = {}
    for name, seconds, frames in [('clean.mp4',101,6060),('final.mp4',101,6060),('ending_final.mp4',11.5,690)]:
        p = probe(name)
        v = next(s for s in p['streams'] if s['codec_type']=='video')
        a = next(s for s in p['streams'] if s['codec_type']=='audio')
        assert (v['width'],v['height'],v['r_frame_rate'],int(v['nb_frames'])) == (1920,1080,'60/1',frames), v
        assert abs(float(v['duration'])-seconds)<.02
        assert abs(float(a['duration'])-seconds)<.06
        run(['-i',name,'-f','null','-'])
        receipts[name] = dict(bytes=Path(name).stat().st_size, duration_s=float(v['duration']), frames=frames, audio_duration_s=float(a['duration']))
    a,b = pcm('source_v3.mp4'),pcm('final.mp4')
    n = min(len(a),len(b),99*24000)
    corr = float(np.corrcoef(a[:n],b[:n])[0,1])
    assert corr>.995,corr
    pause = b[int(91.5*24000):int(94.9*24000)]
    source_pause = a[int(91.5*24000):int(94.9*24000)]
    source_pause_rms = float(np.sqrt(np.mean(source_pause**2)))
    pause_difference_rms = float(np.sqrt(np.mean((pause-source_pause)**2)))
    pause_rms = float(np.sqrt(np.mean(pause**2)))
    tail_rms = float(np.sqrt(np.mean(b[99*24000:101*24000]**2)))
    # The hosted v3 source has a low-level signal during the pause (~0.0001723
    # RMS). Preserve it; a digital-silence assertion would reject the source itself.
    assert pause_difference_rms<.00001 and abs(pause_rms-source_pause_rms)<.00001
    assert tail_rms<.0001,tail_rms
    same = Path('caps.srt').read_bytes()==(OLD/'caps.srt').read_bytes()
    assert same
    cues = Path('caps.srt').read_text(encoding='utf-8').count('-->')
    assert cues==21,cues
    m = json.loads((OLD/'manifest.json').read_text(encoding='utf-8'))
    m.update(version=4,duration_s=101,size='1920x1080',fps=60,editorial_cut_count=28,
             enhanced_range_s=[89.5,101],fade_s=[100.2,101],renderer='FFmpeg Windows recovery; original Higgsedit script preserved')
    for shot in m['editorial_shots']:
        shot['start_s']=shot['start_frame']/24
        shot['end_s']=shot['end_frame']/24
        shot['start_frame']=round(shot['start_s']*60)
        shot['end_frame']=round(shot['end_s']*60)
        if shot['id']=='W16-B': shot.update(end_frame=5703,end_s=95.05)
        if shot['id']=='W16-C': shot.update(start_frame=5703,end_frame=5760,start_s=95.05,end_s=96)
    m['editorial_shots'].append(dict(id='W16-D',start_frame=5760,end_frame=6060,start_s=96,end_s=101,label='Escape path; rear-facing warrior'))
    # v3 lists only the 18 recut tail shots here; its nine unchanged head shots
    # live in segments. Expand those too so the v4 manifest covers the full film.
    head_shots = [dict(id=f"W{s['scene']:02d}",start_s=s['at_s'],end_s=s['at_s']+s['duration_s'],
                       start_frame=round(s['at_s']*60),end_frame=round((s['at_s']+s['duration_s'])*60),
                       label='Unchanged v3 head shot') for s in m['segments'][:9]]
    m['editorial_shots'] = head_shots + m['editorial_shots']
    assert len(m['editorial_shots'])==28
    assert m['editorial_shots'][0]['start_frame']==0 and m['editorial_shots'][-1]['end_frame']==6060
    assert all(a['end_frame']==b['start_frame'] for a,b in zip(m['editorial_shots'],m['editorial_shots'][1:]))
    m['source_segments_v3']=m.pop('segments')
    m['segments']=[dict(source='source_v3.mp4',at_s=0,duration_s=89.5),dict(source='smooth_hq.mp4',at_s=89.5,duration_s=6.5),dict(source='escape_hq.mp4',at_s=96,duration_s=5)]
    dump('manifest.json',m)
    final_motion = cadence('clean.mp4', [('A',0,120,60),('B',120,333,60),('C',333,390,60)], start=89.5,duration=6.5)
    assert all(row['near_duplicate_ratio'] < .1 for row in final_motion), final_motion
    qa=dict(receipts=receipts,narration_pcm_correlation=corr,pause_rms=pause_rms,tail_rms=tail_rms,
            source_pause_rms=source_pause_rms,pause_difference_rms=pause_difference_rms,
            caption_count=cues,caps_byte_identical_v3=same,full_decode_pass=True,question_pause_s=3.7,
            final_ending_motion=final_motion,
            true_interpolation_range_s=[89.5,101],earlier_cadence='24fps retained in 60fps export',
            visual_review_pending=True,realtime_listen_review=False)
    dump('qa.json',qa)
    sheet('final.mp4',[90.5,91.483333,91.5,93,95.033333,95.05,95.7,95.983333,96,96.25,97.5,99.5,100.2,100.6,100.983333],'contact.jpg')
    # The same six-and-a-half seconds, old on the left and corrected on the right.
    fc = ('[0:v]trim=duration=6.5,setpts=PTS-STARTPTS,scale=960:540,fps=60,setsar=1,'
          "drawtext=text='BEFORE':fontcolor=white:fontsize=26:x=20:y=20:box=1:boxcolor=black@0.7[a];"
          '[1:v]trim=duration=6.5,setpts=PTS-STARTPTS,scale=960:540,setsar=1,'
          "drawtext=text='AFTER':fontcolor=white:fontsize=26:x=20:y=20:box=1:boxcolor=black@0.7[b];"
          '[a][b]hstack=inputs=2[v]')
    run(['-ss',89.5,'-i','source_v3.mp4','-i','smooth_hq.mp4','-filter_complex_threads',4,
         '-filter_complex',fc,'-map','[v]','-an','-t',6.5,'-c:v','libx264','-crf',18,
         '-threads',4,'-pix_fmt','yuv420p','-movflags','+faststart','before_after.mp4'])
    print(json.dumps(qa,indent=2),flush=True)


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('step',choices=['inspect','render','verify'])
    args=parser.parse_args()
    {'inspect':inspect,'render':render,'verify':verify}[args.step]()
