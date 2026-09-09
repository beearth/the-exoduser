"""Stable three-shot ending; retains v5 identity edits and original audio/caption clock."""
import json
import os
from pathlib import Path
import runpy
import shutil
import subprocess
import sys
import numpy as np
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parent
V5 = ROOT.parent / 'identity_v5'
V4 = ROOT.parent / 'full_review_v4'
helper = runpy.run_path(str(V5 / 'render_identity.py'))
FF, FP = helper['FF'], helper['FP']
probe, pcm = helper['probe'], helper['pcm']
time_s, srt_time = helper['time_s'], helper['srt_time']
os.chdir(ROOT)


def run(args):
    result = subprocess.run([FF, '-hide_banner', '-v', 'error', '-y', *map(str, args)],
                            capture_output=True, text=True)
    if result.returncode or result.stderr.strip():
        raise RuntimeError(result.stderr)


def dump(name, value):
    Path(name).write_bytes((json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode('utf-8'))


SHOTS = [
    dict(id='W16-A', image='nemesia_identity.png', start_frame=5370, end_frame=5490,
         crop=[0, 0, 1920, 1080], zoom=.018, label='Question'),
    dict(id='W16-B', image='nemesia_identity.png', start_frame=5490, end_frame=5703,
         crop=[480, 472, 960, 540], zoom=.012, label='Response silence'),
    dict(id='W16-D', image='escape_clean.png', start_frame=5703, end_frame=6060,
         crop=[0, 0, 1920, 1080], zoom=.025, label='Command and escape route'),
]


def render():
    Path('segments').mkdir(exist_ok=True)
    Path('fonts').mkdir(exist_ok=True)
    shutil.copyfile(V4 / 'fonts/NotoSerifCJKkr-Medium.otf', 'fonts/NotoSerifCJKkr-Medium.otf')
    shutil.copyfile(V5 / 'caps.srt', 'caps.srt')
    for shot in SHOTS:
        x, y, w, h = shot['crop']
        n = shot['end_frame'] - shot['start_frame']
        # Cover/crop rather than stretch the 3:2 Nemesia source to 16:9.
        vf = (f'scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos,crop=1920:1080,'
              f'crop={w}:{h}:{x}:{y},scale=3840:2160:flags=lanczos,'
              f"zoompan=z='1+{shot['zoom']}*on/{n-1}':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=1920x1080:fps=60,setsar=1")
        print('Rendering', shot['id'], flush=True)
        run(['-loop', 1, '-framerate', 60, '-i', shot['image'], '-vf', vf, '-frames:v', n,
             '-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', 18, '-threads', 4,
             '-pix_fmt', 'yuv420p', f"segments/{shot['id']}.mp4"])
    Path('segments/list.txt').write_bytes(''.join(f"file '{s['id']}.mp4'\n" for s in SHOTS).encode())
    run(['-f', 'concat', '-safe', 0, '-i', 'segments/list.txt', '-c', 'copy', 'ending_clean.mp4'])
    cues = []
    for block in Path('caps.srt').read_text(encoding='utf-8').strip().split('\n\n'):
        lines = block.splitlines()
        start, end = map(time_s, lines[1].split(' --> '))
        if start >= 89.5:
            cues.append(f'{len(cues)+1}\n{srt_time(start-89.5)} --> {srt_time(end-89.5)}\n' + '\n'.join(lines[2:]))
    assert len(cues) == 2
    Path('ending.srt').write_bytes(('\n\n'.join(cues)+'\n').encode('utf-8'))
    style = 'FontName=Noto Serif CJK KR,FontSize=13,MarginV=32,Outline=0.6,Shadow=0.4'
    run(['-i', 'ending_clean.mp4', '-ss', 89.5, '-i', V5 / 'final.mp4', '-map', '0:v', '-map', '1:a',
         '-vf', f"subtitles=ending.srt:fontsdir=fonts:force_style='{style}',fade=t=out:st=10.7:d=0.8",
         '-t', 11.5, '-c:v', 'libx264', '-preset', 'fast', '-crf', 18, '-threads', 4,
         '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', 'ending.mp4'])
    print('Rendering full story, original AAC copied', flush=True)
    fc = ('[0:v]trim=end_frame=5370,setpts=PTS-STARTPTS[head];'
          '[1:v]setpts=PTS-STARTPTS[tail];[head][tail]concat=n=2:v=1:a=0[v]')
    run(['-i', V5 / 'final.mp4', '-i', 'ending.mp4', '-filter_complex_threads', 4,
         '-filter_complex', fc, '-map', '[v]', '-map', '0:a', '-t', 101, '-r', 60,
         '-c:v', 'libx264', '-preset', 'fast', '-crf', 19, '-threads', 4, '-pix_fmt', 'yuv420p',
         '-c:a', 'copy', '-movflags', '+faststart', 'final.mp4'])
    run(['-i', 'ending.mp4', '-c:v', 'libvpx-vp9', '-crf', 27, '-b:v', 0, '-deadline', 'realtime',
         '-cpu-used', 6, '-row-mt', 1, '-threads', 4, '-c:a', 'libopus', '-b:a', '160k', 'ending_with_opus.webm'])
    manifest = json.loads((V5 / 'manifest.json').read_text(encoding='utf-8'))
    for shot in SHOTS:
        shot.update(start_s=shot['start_frame']/60, end_s=shot['end_frame']/60)
    manifest.update(version=6, revision='Stable warrior identity and clean three-shot ending',
                    editorial_cut_count=27, ending_shots=SHOTS,
                    motion='Corrected stills with continuous camera zoom in W09/W10/W16; original source motion elsewhere',
                    renderer='render_ending.py / FFmpeg 8.0.1', audio='v5 AAC stream copied sample-identically')
    manifest['editorial_shots'] = [s for s in manifest['editorial_shots'] if s['end_frame'] <= 5370] + SHOTS
    # Identity v5 kept original shot metadata as history: replace stale crop/labels here.
    corrections = {s['id']: s for s in manifest['identity_shots']}
    for shot in manifest['editorial_shots']:
        if shot['id'] in corrections:
            shot.update(corrections[shot['id']], label='Canonical warrior identity v5')
    manifest.pop('enhanced_range_s', None)
    manifest['segments'] = [dict(source='../identity_v5/final.mp4', at_s=0, duration_s=89.5),
                            dict(source='ending.mp4', at_s=89.5, duration_s=11.5)]
    assert len(manifest['editorial_shots']) == 27
    cursor = 0
    for shot in manifest['editorial_shots']:
        assert shot['start_frame'] == cursor
        cursor = shot['end_frame']
    assert cursor == 6060
    dump('manifest.json', manifest)


def verify():
    receipts = {}
    for name, duration, frames in [('ending.mp4', 11.5, 690), ('final.mp4', 101, 6060),
                                   ('ending_with_opus.webm', 11.5, None)]:
        info = probe(name)
        v = next(s for s in info['streams'] if s['codec_type'] == 'video')
        a = next(s for s in info['streams'] if s['codec_type'] == 'audio')
        assert (v['width'], v['height'], v['r_frame_rate']) == (1920, 1080, '60/1')
        if frames:
            assert int(v['nb_frames']) == frames and abs(float(v['duration'])-duration) < .02
        assert a['channels'] == 2
        if name.endswith('.webm'):
            # FFmpeg 8.0.1 emits an EOF Opus parser warning despite reporting zero
            # decode errors. Independently require clean decoding with bundled 7.1.
            decoded = subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-v', 'error',
                                      '-i', name, '-f', 'null', '-'], capture_output=True, text=True)
            assert decoded.returncode == 0 and not decoded.stderr.strip(), decoded.stderr
        else:
            run(['-i', name, '-f', 'null', '-'])
        receipts[name] = dict(bytes=Path(name).stat().st_size, duration_s=duration, audio=a['codec_name'])
    before, after = pcm(V5/'final.mp4'), pcm('final.mp4')
    assert np.array_equal(before, after)
    assert Path('caps.srt').read_bytes() == (V5/'caps.srt').read_bytes()
    sheet = runpy.run_path(str(V4/'resume_windows.py'))['sheet']
    sheet.__globals__['ROOT'] = ROOT
    os.chdir(ROOT)
    sheet(ROOT/'final.mp4', [89.483333, 89.5, 90.5, 91.483333, 91.5, 93, 95.033333, 95.05,
                            95.5, 96.633333, 98, 100, 100.2, 100.5, 100.983333], ROOT/'contact.jpg')
    dump('qa.json', dict(receipts=receipts, full_decode_pass=True, frame_count=6060, editorial_cuts=27,
         audio_sample_identical_v5=True, captions_byte_identical_v5=True, question_pause_s=3.7,
         fade_s=[100.2,101], visual_review_pending=True, realtime_audio_approval=False,
         webm_decoder='FFmpeg 7.1 clean decode; 8.0.1 EOF parser warning with 0 audio/video decode errors'))
    print('PASS: decode, frames, 27 contiguous shots, identical narration/captions', flush=True)


if __name__ == '__main__':
    {'render': render, 'verify': verify}[sys.argv[1]]()
