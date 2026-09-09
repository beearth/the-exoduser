"""Assemble the preserved opening and 16 real Higgsfield shots, at normal speed."""
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess

ROOT = Path(__file__).resolve().parent
PROJECT = ROOT.parents[3]
BIN = Path(os.environ['LOCALAPPDATA']) / 'Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.0.1-full_build/bin'
FF, FP = BIN / 'ffmpeg.exe', BIN / 'ffprobe.exe'
SHOTS = [('w09',4.5),('w10a',3),('w10b',2.5),('w10c',4),('w11a',3.5),('w11b',2),('w12',4.5),('w13',6.5),('w14',5.5),('w15a',2.5),('w15b',130/60),('w15c',170/60),('w16a',2),('w16b',3.55),('w16c',2.75),('w16d',3.2)]
SOURCE_OVERRIDES = {'w10a': 'w10a_straight.mp4', 'w16b': 'w16b_armor.mp4'}

def run(args):
    subprocess.run([str(FF), '-hide_banner', '-v', 'error', '-y', *map(str,args)], cwd=ROOT, check=True)

def probe(path):
    return json.loads(subprocess.check_output([str(FP),'-v','error','-show_format','-show_streams','-of','json',str(path)]))

def main():
    target = ROOT / 'final.mp4'
    if target.exists():
        raise SystemExit('Existing final.mp4 preserved; rename it before explicitly rerendering.')
    args = ['-filter_complex_threads','1','-threads','1','-t','46.2','-i',ROOT.parent/'full_review_v4/clean.mp4']
    for name, duration in SHOTS:
        args += ['-threads','1','-t',duration + .2,'-i',ROOT/SOURCE_OVERRIDES.get(name,f'{name}.mp4')]
    args += ['-i',ROOT/'narration_v7.wav']
    filters = ['[0:v]trim=duration=46,setpts=PTS-STARTPTS,fps=60,trim=end_frame=2760,setsar=1[v0]']
    timeline = []
    cursor = 46.
    for i,(name,duration) in enumerate(SHOTS,1):
        frames = round(duration*60)
        filters.append(f'[{i}:v]setpts=PTS-STARTPTS,pad=1920:1080:2:0:black,fps=60,trim=end_frame={frames},setsar=1[v{i}]')
        timeline.append(dict(shot=name, source=SOURCE_OVERRIDES.get(name,f'{name}.mp4'), source_start=0, start=cursor, end=round(cursor+duration,3), frames=frames, speed=1))
        cursor = round(cursor+duration,3)
    assert cursor == 101
    filters.append(''.join(f'[v{i}]' for i in range(17)) + "concat=n=17:v=1:a=0,fade=t=out:st=100.2:d=0.8,subtitles=caps.srt:fontsdir=../full_review_v4/fonts:force_style='FontName=Noto Serif CJK KR,FontSize=13,MarginV=32,Outline=0.6,Shadow=0.4'[outv]")
    args += ['-filter_complex',';'.join(filters),'-map','[outv]','-map','17:a:0','-t','101','-c:v','libx264','-preset','fast','-crf','18','-threads','4','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-ar','48000','-movflags','+faststart',target]
    print('Rendering 101-second combined film with 22 burned captions and edited voice...', flush=True)
    run(args)
    print('Full decode verification...', flush=True)
    run(['-i',target,'-f','null','-'])
    info = probe(target)
    video = next(s for s in info['streams'] if s['codec_type']=='video')
    audio = next(s for s in info['streams'] if s['codec_type']=='audio')
    assert int(video['nb_frames']) == 6060
    assert video['width']==1920 and video['height']==1080
    assert abs(float(info['format']['duration'])-101)<.05
    alias = PROJECT/'대검전사_스토리_총합본.mp4'
    shutil.copy2(target,alias)
    record = dict(status='assembled_decode_verified', file='final.mp4', easy_path=str(alias), duration=101, width=1920, height=1080, output_fps=60, output_frames=6060, source_motion_fps=24, frame_conversion='24fps footage at normal speed, duplicated frames to 60fps container; no optical flow or freeze padding', audio_codec=audio['codec_name'], audio_channels=audio['channels'], audio_sample_rate=int(audio['sample_rate']), captions=22, opening_source='../full_review_v4/clean.mp4', opening_range=[0,46], shots=timeline, fade=[100.2,101], decode='PASS', bytes=target.stat().st_size, sha256=hashlib.sha256(target.read_bytes()).hexdigest(), visual_review='pending', listening_review='pending')
    (ROOT/'assembly_manifest.json').write_bytes((json.dumps(record,ensure_ascii=False,indent=2)+'\n').encode('utf-8'))
    print(json.dumps(record,ensure_ascii=False),flush=True)

if __name__ == '__main__':
    main()
