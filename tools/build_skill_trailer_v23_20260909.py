"""V2 derivative: preserve captioned skills, remove boss, replace end logo."""
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'captures/gameplay_trailer_20260909/EXODUSER_GAMEPLAY_TRAILER_V2_70S_1080P60.mp4'
FINAL = SOURCE.with_name('EXODUSER_SKILL_TRAILER_V23_NO_BOSS_NEW_LOGO_58S_1080P60.mp4')
LOGO = ROOT / 'output/imagegen/trailer/skill_title_crimson_rift_v3.png'
RAW = ROOT / 'tmp/trailer_v2/edit/picture.mp4'
MUSIC = ROOT / 'bgm/1장_썩은숲/Bloodsteel Ascension.mp3'
OUT = ROOT / 'tmp/trailer_v23'

def run(args):
    result = subprocess.run(args, cwd=ROOT, capture_output=True, creationflags=subprocess.CREATE_NO_WINDOW)
    if result.returncode:
        raise RuntimeError(result.stderr.decode('utf-8', errors='replace'))
    return result.stdout

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    original_hash = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
    filters = (
        '[0:v]trim=start=0:end=54,setpts=PTS-STARTPTS,setsar=1[game];'
        "[1:v]scale=2560:1440,zoompan=z='1+0.025*on/239':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=1920x1080:fps=60,"
        'trim=duration=4,setpts=PTS-STARTPTS,setsar=1,fade=t=in:d=0.2,fade=t=out:st=3.5:d=0.5,'
        'drawbox=x=0:y=0:w=iw:h=38:color=black:t=fill,drawbox=x=0:y=1042:w=iw:h=38:color=black:t=fill[logo];'
        '[game][logo]concat=n=2:v=1:a=0[v];'
        '[2:a]atrim=start=0:end=54,asetpts=PTS-STARTPTS,volume=1.8,highpass=f=35,'
        'afade=t=out:st=53.85:d=0.15,apad=whole_dur=58[sfx];'
        '[3:a]atrim=duration=58,asetpts=PTS-STARTPTS,volume=0.48,afade=t=in:d=0.35,afade=t=out:st=56:d=2[bgm];'
        '[sfx][bgm]amix=inputs=2:duration=longest:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=9,'
        'aformat=sample_rates=48000:channel_layouts=stereo[a]'
    )
    run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y',
         '-i', str(SOURCE), '-loop', '1', '-framerate', '60', '-i', str(LOGO),
         '-i', str(RAW), '-ss', '18', '-i', str(MUSIC), '-filter_complex', filters,
         '-map', '[v]', '-map', '[a]', '-t', '58', '-r', '60',
         '-c:v', 'libx264', '-threads', '8', '-preset', 'slow', '-crf', '18',
         '-pix_fmt', 'yuv420p', '-color_range', 'tv', '-colorspace', 'bt709',
         '-color_primaries', 'bt709', '-color_trc', 'bt709', '-c:a', 'aac', '-b:a', '320k',
         '-movflags', '+faststart', str(FINAL)])
    assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == original_hash
    report = {'source': str(SOURCE), 'sourceSHA256': original_hash, 'sourcePreserved': True,
              'final': str(FINAL), 'logo': str(LOGO), 'duration': 58, 'bossRemoved': [54, 66],
              'timeline': [{'source': 'V2', 'start': 0, 'end': 54}, {'source': 'new_logo', 'start': 54, 'end': 58}]}
    (OUT / 'build.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(FINAL, flush=True)

if __name__ == '__main__':
    main()
