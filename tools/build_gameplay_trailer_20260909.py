"""Edit the approved local capture takes into a 70-second review trailer."""
import concurrent.futures
import json
from pathlib import Path
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'captures/gameplay_trailer_20260909'
EDIT = OUT / 'edit'
FFMPEG = shutil.which('ffmpeg')
FPS = 30
FINAL = OUT / 'EXODUSER_GAMEPLAY_TRAILER_70S_1080P.mp4'
EDL = [
    ('blackhole_take', 6, 1.6, 'hook'),
    ('ice_slam_clean', 3, 1.2, 'hook'),
    ('druid_boss_b', 3.8, 1.2, 'hook'),
    ('ch1_altar_clean', 0, 4, '1-1'),
    ('ch2_hive_take', 0, 4, '2-1'),
    ('ch3_ritual_take', 0, 4, '3-1'),
    ('ice_slam_clean', 0, 3, 'iceOrb'),
    ('ice_slam_clean', 3, 3, 'giantSlam'),
    ('ancestor_clean', 0, 6, 'ancestorSummon'),
    ('blackhole_take', 0, 8, 'lavaSummon'),
    ('horde_take', 0, 10, 'horde'),
    ('druid_boss_tracking', 0, 10, 'boss opening'),
    ('druid_boss_b', 0, 10, 'boss later phase'),
    ('../gameplay_trailer_20260908/EXODUSER_END_CARD_4S', 0, 4, 'title'),
]


def run(args):
    p = subprocess.run([FFMPEG, '-hide_banner', '-loglevel', 'error', '-y', *map(str, args)],
                       capture_output=True, creationflags=subprocess.CREATE_NO_WINDOW)
    if p.returncode:
        raise RuntimeError(p.stderr.decode('utf-8', errors='replace'))


def segment(item):
    i, (name, start, duration, label) = item
    target = EDIT / f'{i:02}.mp4'
    vf = 'fps=30,scale=1920:1080:flags=lanczos,setsar=1'
    if label != 'title':
        vf += ',eq=gamma=1.52:contrast=1.05:saturation=1.10'
    run(['-ss', start, '-i', OUT / (name + '.mp4'), '-t', duration, '-an',
         '-vf', vf, '-frames:v', round(duration * FPS), '-c:v', 'libx264',
         '-threads', 4, '-preset', 'fast', '-crf', 17, '-pix_fmt', 'yuv420p', target])
    print(f'cut {i:02}: {label}', flush=True)
    return target


def ass_time(t):
    return f'{int(t // 3600)}:{int(t // 60) % 60:02}:{int(t) % 60:02}.{round((t % 1) * 100):02}'


def captions():
    header = '''[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Title,Malgun Gothic,46,&H00F3EEE7,&H000000FF,&H00100808,&H90000000,-1,0,0,0,100,100,1,0,1,2,1,7,0,0,0,1
Style: Small,Malgun Gothic,22,&H008CBAE8,&H000000FF,&H00100808,&H90000000,0,0,0,0,100,100,2,0,1,1,1,7,0,0,0,1
Style: Desc,Malgun Gothic,24,&H00D3D1CE,&H000000FF,&H00100808,&H90000000,0,0,0,0,100,100,0,0,1,1,1,7,0,0,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
'''
    lines = []
    def line(a, b, style, text, x, y, layer=1):
        lines.append(f'Dialogue: {layer},{ass_time(a)},{ass_time(b)},{style},,0,0,0,,{{\\pos({x},{y})\\fad(160,180)}}{text}')
    def card(a, b, cue, title, desc):
        line(a, b, 'Small', r'{\p1\bord0\shad0\1c&H090909&\1a&H60&}m 0 0 l 555 0 555 168 0 168', 56, 118, 0)
        line(a, b, 'Small', r'{\p1\bord0\shad0\1c&H356CD2&}m 0 0 l 3 0 3 168 0 168', 56, 118, 0)
        line(a, b, 'Small', cue, 82, 137)
        line(a, b, 'Title', title, 80, 167)
        line(a, b, 'Desc', desc, 82, 234)
    line(.15, 3.85, 'Title', r'{\an8\fs58}지옥을 뚫어라', 960, 145)
    card(4.15, 7.85, 'CHAPTER 01  /  1-1', '썩은 숲', '숲 깊숙이 숨겨진 제단')
    card(8.15, 11.85, 'CHAPTER 02  /  2-1', '군집의 영역', '거대한 벌집과 부화장')
    card(12.15, 15.85, 'CHAPTER 03  /  3-1', '지옥의 의식', '거대한 문양 아래로')
    card(16.15, 18.9, 'SKILL 01', '얼음보주', '보주를 펼치고, 파편을 쏟아내라')
    card(19.05, 21.85, 'SKILL 02', '지옥강타', '한 번의 강타로 전장을 흔들어라')
    card(22.15, 26.7, 'SKILL 03', '전대 소환', '전대의 힘을 전장으로')
    card(28.15, 33.3, 'SKILL 04', '탄막블랙홀', '흡수한 탄막을 되돌려라')
    card(36.15, 40.4, 'MASS COMBAT', '몰려오는 적을 돌파하라', '스킬을 이어, 포위를 무너뜨려라')
    card(46.15, 50.5, '1-1  /  BOSS ENCOUNTER', '다크드루이드', '독탄을 뚫고 거대한 적과 맞서라')
    (EDIT / 'captions.ass').write_text(header + '\n'.join(lines) + '\n', encoding='utf-8-sig')


def audio():
    music = ROOT / 'bgm/1장_썩은숲/Bloodsteel Ascension.mp3'
    effects = [
        (0.0, 'sfx/magic/fire_magic2.mp3', .60, 2.2),
        (1.65, 'sfx/skillsound/slam/heavy_hit.mp3', .78, 1.5),
        (16.4, 'sfx/ice/ice_storm.mp3', .50, 3.0),
        (17.7, 'sfx/death/death_ice_shatter.mp3', .58, 1.7),
        (19.1, 'sfx/skillsound/slam/heavy_hit.mp3', .80, 2.0),
        (22.5, 'sfx/ghost_laugh.mp3', .28, 3.2),
        (33.5, 'sfx/magic/fire_magic2.mp3', .65, 2.4),
        (40.6, 'sfx/skillsound/slam/heavy_hit.mp3', .65, 2.0),
        (48.5, 'sfx/skillsound/slam/heavy_hit.mp3', .65, 2.0),
        (53.0, 'sfx/death/death_ice_shatter.mp3', .52, 1.7),
        (61.3, 'sfx/magic/fire_magic2.mp3', .62, 2.4),
        (66.0, 'sfx/hit/heavy_hit.mp3', .62, 2.0),
    ]
    args = ['-ss', 18, '-i', music]
    graph = ["[0:a]atrim=duration=70,asetpts=PTS-STARTPTS,aresample=48000,volume=0.65,afade=t=in:d=0.35,afade=t=out:st=66.6:d=3.4[a0]"]
    for i, (at, file, vol, duration) in enumerate(effects, 1):
        args += ['-i', ROOT / file]
        delay = round(at * 1000)
        graph.append(f'[{i}:a]atrim=duration={duration},asetpts=PTS-STARTPTS,aresample=48000,volume={vol},afade=t=out:st={max(.1,duration-.3)}:d=0.3,adelay={delay}|{delay}[a{i}]')
    graph.append(''.join(f'[a{i}]' for i in range(len(effects)+1)) + f'amix=inputs={len(effects)+1}:duration=first:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=9,aresample=48000[mix]')
    run([*args, '-filter_complex', ';'.join(graph), '-map', '[mix]', '-t', 70,
         '-ac', 2, '-c:a', 'pcm_s16le', EDIT / 'mix.wav'])
    return {'music': str(music.relative_to(ROOT)), 'musicIn': 18, 'effects': effects,
            'normalization': 'loudnorm I=-16 TP=-1.5 LRA=9'}


def main():
    if not FFMPEG:
        raise RuntimeError('FFmpeg is required')
    if FINAL.exists():
        raise RuntimeError(f'Preserve existing review export before rebuilding: {FINAL}')
    EDIT.mkdir(parents=True, exist_ok=True)
    captions()
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        cuts = list(pool.map(segment, enumerate(EDL)))
    manifest = EDIT / 'concat.txt'
    manifest.write_text(''.join(f"file '{p.name}'\n" for p in cuts), encoding='utf-8')
    run(['-f', 'concat', '-safe', 0, '-i', manifest, '-c', 'copy', EDIT / 'picture.mp4'])
    sound = audio()
    # Run from EDIT so libass receives a simple path with no Windows colon escaping.
    p = subprocess.run([FFMPEG, '-hide_banner', '-loglevel', 'error', '-y',
        '-i', 'picture.mp4', '-i', 'mix.wav', '-vf', 'ass=captions.ass',
        '-map', '0:v:0', '-map', '1:a:0', '-t', '70', '-c:v', 'libx264',
        '-threads', '6', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p',
        '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-ac', '2',
        '-movflags', '+faststart', str(FINAL)], cwd=EDIT,
        capture_output=True, creationflags=subprocess.CREATE_NO_WINDOW)
    if p.returncode:
        raise RuntimeError(p.stderr.decode('utf-8', errors='replace'))
    cursor = 0
    shots = []
    for name, start, duration, label in EDL:
        shots.append({'source': name+'.mp4', 'in': start, 'duration': duration,
                      'timelineIn': round(cursor, 3), 'label': label})
        cursor += duration
    (OUT / 'edit_report.json').write_text(json.dumps({'output': str(FINAL),
        'seconds': cursor, 'fps': FPS, 'grade': {'gamma':1.52,'contrast':1.05,'saturation':1.10},
        'shots': shots, 'audio': sound}, ensure_ascii=False, indent=2), encoding='utf-8')
    print(str(FINAL), flush=True)


if __name__ == '__main__':
    main()
