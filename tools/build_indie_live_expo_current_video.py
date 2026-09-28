"""Build ILE 15/30 second deliverables from the September 28 current runtime."""
from pathlib import Path
import hashlib
import json
import re
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/indie-live-expo-20261201'
SRC = OUT / 'current-20260928'
PACK = OUT / 'submission'
WORK = ROOT / 'tmp/expo-current-edit'
FF = shutil.which('ffmpeg')
FP = shutil.which('ffprobe')
FLAGS = subprocess.CREATE_NO_WINDOW if sys.platform == 'win32' else 0
WORK.mkdir(parents=True, exist_ok=True)

def run(args, log):
    with (WORK / log).open('w', encoding='utf8') as stream:
        p = subprocess.run([FF, '-hide_banner', '-y', *map(str, args)], cwd=ROOT,
                           stdout=stream, stderr=stream, creationflags=FLAGS)
    if p.returncode:
        raise RuntimeError(f'{log}: ffmpeg failed')
    return (WORK / log).read_text(encoding='utf8', errors='replace')

def probe(path):
    p = subprocess.run([FP, '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(path)],
                       capture_output=True, text=True, encoding='utf8', check=True, creationflags=FLAGS)
    return json.loads(p.stdout)

def loudness(path, label):
    log = run(['-i', path, '-vn', '-af', 'loudnorm=I=-15:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], label)
    return json.loads(re.findall(r'\{\s*"input_i"[\s\S]*?\}', log)[-1])

def normalizer(m):
    return (f"loudnorm=I=-15:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
            f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:"
            'linear=true,aformat=sample_rates=48000:channel_layouts=stereo')

def ass(path, rows):
    def stamp(s):
        return f'{int(s)//3600}:{int(s)//60%60:02}:{s%60:05.2f}'
    header = '''[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 2
[V4+ Styles]
Format: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding
Style: Main,Arial,38,&H00F3ECE3,&H000000FF,&H00201818,&H700A0808,-1,0,0,0,100,100,2,0,1,2,1,2,90,90,80,1
[Events]
Format: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text
'''
    content = header + ''.join(f'Dialogue: 0,{stamp(a)},{stamp(b)},Main,,0,0,0,,{{\\fad(100,100)}}{text}\n' for a,b,text in rows)
    path.write_text(content, encoding='utf8', newline='\n')

captures = ['current-parry', 'current-slam', 'current-ice']
source_audit = []
for name in captures:
    p = SRC / (name + '.webm')
    data = json.loads((SRC / (name + '.json')).read_text(encoding='utf8'))
    samples = data['samples']
    meta = probe(p)
    if len(samples) < 220 or samples[-1]['t'] < 7.5 or float(meta['format']['duration']) < 7.5:
        raise ValueError(f'Incomplete runtime take: {name}')
    source_audit.append({'file': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest(),
                         'rendered_frames': len(samples), 'first': samples[0], 'last': samples[-1]})

# Keep the previous deliverables as a local backup before replacing them.
backup = OUT / 'before/videos-before-current-20260928'
backup.mkdir(parents=True, exist_ok=True)
for name in ['EXODUSER_HELL_LORD.mp4', 'EXODUSER_HELL_LORD_full.mp4']:
    if (PACK / name).exists() and not (backup / name).exists():
        shutil.copy2(PACK / name, backup / name)

intermediate = ['-c:v', 'libx264', '-threads', '8', '-preset', 'fast', '-crf', '16', '-pix_fmt', 'yuv420p',
                '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
                '-c:a', 'aac', '-b:a', '320k', '-ar', '48000', '-ac', '2']
segments = []
for index, name in enumerate(captures):
    target = WORK / f'{index}.mp4'
    run(['-ss', '0.5', '-i', SRC / (name + '.webm'), '-t', '7',
         '-vf', 'setpts=PTS-STARTPTS,fps=30,scale=1920:1080,setsar=1,eq=gamma=1.12:brightness=0.008:saturation=1.02,tpad=stop_mode=clone:stop_duration=0.1',
         '-af', 'apad,atrim=duration=7,asetpts=PTS-STARTPTS', *intermediate, target], f'clip-{index}.log')
    segments.append(target)
for index, image in enumerate(['ss2.jpg', 'ss3.jpg', 'main.jpg'], 3):
    target = WORK / f'{index}.mp4'
    run(['-loop', '1', '-framerate', '30', '-i', SRC / image, '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo',
         '-t', '3', '-vf', 'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x090809,setsar=1',
         *intermediate, target], f'clip-{index}.log')
    segments.append(target)
listing = WORK / 'concat.txt'
listing.write_text(''.join(f"file '{p.as_posix()}'\n" for p in segments), encoding='utf8', newline='\n')
picture = WORK / 'current-picture.mp4'
run(['-f', 'concat', '-safe', '0', '-i', listing, '-c', 'copy', picture], 'concat.log')

bgm = ROOT / 'bgm/1장_썩은숲/Bloodsteel Ascension.mp3'
full_mix = WORK / 'full-mix.wav'
run(['-i', picture, '-ss', '43', '-i', bgm, '-filter_complex',
     '[0:a]volume=1.0[sfx];[1:a]atrim=duration=30,asetpts=PTS-STARTPTS,volume=0.38,afade=t=in:d=0.15,afade=t=out:st=28.3:d=1.7[bgm];'
     '[sfx][bgm]amix=inputs=2:duration=first:normalize=0,aformat=sample_rates=48000:channel_layouts=stereo[a]',
     '-map', '[a]', '-t', '30', '-c:a', 'pcm_s24le', full_mix], 'full-mix.log')
full_ass = WORK / 'full.ass'
ass(full_ass, [(0.3,6.7,'PARRY THE BULLET STORM'), (7.3,13.7,'UNLEASH YOUR RAGE'),
               (14.3,20.7,'MASTER ACTIVE COMBAT'), (21.2,23.85,'FORGE YOUR BUILD'),
               (24.2,26.85,'COMBINE SKILLS. FIND YOUR SYNERGY.')])

delivery = ['-r', '30', '-c:v', 'libx264', '-threads', '8', '-preset', 'medium', '-b:v', '24M', '-minrate', '24M',
            '-maxrate', '24M', '-bufsize', '48M', '-x264-params', 'nal-hrd=cbr:force-cfr=1', '-pix_fmt', 'yuv420p',
            '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
            '-c:a', 'aac', '-b:a', '320k', '-ar', '48000', '-ac', '2', '-movflags', '+faststart']
print('ENCODING CURRENT 30S', flush=True)
m = loudness(full_mix, 'full-input-loudness.log')
full = PACK / 'EXODUSER_HELL_LORD_full.mp4'
run(['-i', picture, '-i', full_mix, '-filter_complex',
     f"[0:v]subtitles=filename='tmp/expo-current-edit/full.ass'[v];[1:a]{normalizer(m)}[a]",
     '-map','[v]','-map','[a]','-t','30',*delivery,full], 'full-encode.log')

short_picture = WORK / 'short-picture.mp4'
vf = []; af = []
for i, (start, duration) in enumerate([(1,4), (8.5,4), (15,4), (27,3)]):
    vf.append(f'[0:v]trim=start={start}:duration={duration},setpts=PTS-STARTPTS[v{i}]')
    af.append(f'[0:a]atrim=start={start}:duration={duration},asetpts=PTS-STARTPTS[a{i}]')
filters = ';'.join(vf + af + [''.join(f'[v{i}][a{i}]' for i in range(4)) + 'concat=n=4:v=1:a=1[v][a]'])
run(['-i', picture, '-filter_complex', filters, '-map','[v]','-map','[a]',*intermediate,short_picture], 'short-picture.log')
short_mix = WORK / 'short-mix.wav'
run(['-i', short_picture, '-ss','43','-i', bgm, '-filter_complex',
     '[0:a]volume=1.0[sfx];[1:a]atrim=duration=15,asetpts=PTS-STARTPTS,volume=0.38,afade=t=in:d=0.1,afade=t=out:st=13.5:d=1.5[bgm];'
     '[sfx][bgm]amix=inputs=2:duration=first:normalize=0,aformat=sample_rates=48000:channel_layouts=stereo[a]',
     '-map','[a]','-t','15','-c:a','pcm_s24le',short_mix], 'short-mix.log')
ass(WORK / 'short.ass', [(0.15,3.85,'PARRY THE BULLET STORM'), (4.15,7.85,'UNLEASH YOUR RAGE'), (8.15,11.85,'MASTER ACTIVE COMBAT')])
print('ENCODING CURRENT 15S', flush=True)
m = loudness(short_mix, 'short-input-loudness.log')
short = PACK / 'EXODUSER_HELL_LORD.mp4'
run(['-i',short_picture,'-i',short_mix,'-filter_complex',
     f"[0:v]subtitles=filename='tmp/expo-current-edit/short.ass'[v];[1:a]{normalizer(m)}[a]",
     '-map','[v]','-map','[a]','-t','15',*delivery,short], 'short-encode.log')

checks = {}
for p, duration in [(short,15),(full,30)]:
    meta = probe(p)
    video = next(s for s in meta['streams'] if s['codec_type']=='video')
    audio = next(s for s in meta['streams'] if s['codec_type']=='audio')
    measurement = loudness(p, p.stem+'-loudness.log')
    assert (video['width'],video['height'],video['r_frame_rate']) == (1920,1080,'30/1')
    assert abs(float(meta['format']['duration'])-duration)<.03
    assert audio['codec_name']=='aac' and audio['sample_rate']=='48000' and audio['channels']==2
    assert -16 <= float(measurement['input_i']) <= -14
    run(['-v','error','-i',p,'-f','null','-'],p.stem+'-decode.log')
    checks[p.name] = {'probe':meta,'loudness':measurement,'full_decode':'passed'}
    run(['-i',p,'-vf',f'fps=1/{3 if duration==15 else 4},scale=480:-1,tile=3x3','-frames:v','1',OUT/(p.stem+'-contact.jpg')],p.stem+'-contact.log')

manifest_path = OUT / 'manifest.json'
manifest = json.loads(manifest_path.read_text(encoding='utf8'))
manifest.update(status='current_runtime_media_built_pending_visual_review_and_drive_update_form_not_submitted',
                source_video='current-20260928/current-parry.webm + current-slam.webm + current-ice.webm',
                source_picture=str(picture.relative_to(ROOT)), checks=checks)
manifest.pop('source_video_sha256', None)
manifest['short_cuts'] = [{'source_start_seconds':s,'duration_seconds':d} for s,d in [(1,4),(8.5,4),(15,4),(27,3)]]
manifest['video_capture'] = {'date':'2026-09-28','viewport':[1920,1080],'takes':source_audit,
 'staging':'Disposable origin 3338 discards game API writes. Current mkEn creates enemy groups; capture-only health protection, player location, skill access and rage are staged. Actual game AI, attacks, parries and VFX are recorded.',
 'dom_hud_in_combat_video':False,'audio':'Real current WebAudio SFX plus existing project Bloodsteel Ascension BGM.',
 'editing':'7s parry + 7s slam + 7s ice + 3s current inventory + 3s current skills + 3s current title; mild gamma/exposure grade on combat only.',
 'game_source_modified_for_capture':False}
manifest['notes'] = [n for n in manifest.get('notes',[]) if not any(w in n for w in ['September 9','Korean trailer captions','existing staged'])]
manifest['notes'].extend(['Both videos now use September 28 current-runtime captures. Previous September 9 edits are backed up locally.',
                         'No generated gameplay footage. Combat records actual game canvas layers without the DOM HUD.',
                         'Form remains unsubmitted; rights consent is still pending.'])
manifest['files'] = [{'file':p.name,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'probe':probe(p)} for p in sorted(PACK.iterdir()) if p.suffix in ['.jpg','.mp4']]
manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({name:{'bytes':(PACK/name).stat().st_size,'lufs':v['loudness']['input_i']} for name,v in checks.items()}),flush=True)
