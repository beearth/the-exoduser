"""Keep V23's caption timing and no-boss edit, with new damage-number footage."""
import concurrent.futures
import json
import shutil
import subprocess
import sys
import build_gameplay_trailer_v2_20260909 as edit

ROOT=edit.ROOT
RAW=ROOT/'tmp/trailer_damage_v25'
EDIT=RAW/'edit'
FINAL=ROOT/'captures/gameplay_trailer_20260909/EXODUSER_SKILL_TRAILER_V25_DAMAGE_TEXT_CAPTIONS_58S_1080P60.mp4'
SOURCE=ROOT/'captures/gameplay_trailer_20260909/EXODUSER_SKILL_TRAILER_V23_NO_BOSS_NEW_LOGO_58S_1080P60.mp4'
EDL=[cut for cut in edit.EDL if cut[0]!='druid_boss_c']


def main():
    EDIT.mkdir(parents=True,exist_ok=True)
    edit.RAW=RAW;edit.EDIT=EDIT;edit.FINAL=FINAL;edit.EDL=EDL
    for name in ['ch1_altar','ch2_hive','ch3_ritual']:
        shutil.copyfile(ROOT/'tmp/trailer_v2'/f'{name}.webm',RAW/f'{name}.webm')
    (RAW/'fonts').mkdir(exist_ok=True)
    shutil.copyfile(ROOT/'tmp/trailer_v2/fonts/TrailerNotoBlack.ttf',RAW/'fonts/TrailerNotoBlack.ttf')
    edit.prepare_font();edit.captions()
    # The shared V2 caption generator includes the removed boss and old title.
    # Preserve every cue ending before 54 seconds, and omit those later cues.
    caption=EDIT/'captions.ass'
    lines=caption.read_text(encoding='utf-8-sig').splitlines()
    caption.write_text('\n'.join(line for line in lines if not line.startswith('Dialogue:') or
                                  line.split(',')[1]<'0:00:54.00')+'\n',encoding='utf-8-sig')
    if '--final-only' in sys.argv:
        files=[EDIT/f'{i:02}.mp4' for i in range(len(EDL)-1)]
    else:
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
            files=list(pool.map(edit.segment,enumerate(EDL[:-1])))
    title=EDIT/f'{len(EDL)-1:02}.mp4'
    edit.run(['-ss',54,'-i',SOURCE,'-f','lavfi','-i','anullsrc=r=48000:cl=stereo',
              '-map','0:v:0','-map','1:a:0','-t',4,'-c:v','libx264','-threads',4,
              '-preset','fast','-crf',17,'-pix_fmt','yuv420p','-c:a','aac','-b:a','256k',title])
    files.append(title)
    concat=EDIT/'concat.txt'
    concat.write_text(''.join(f"file '{f.as_posix()}'\n" for f in files),encoding='utf-8')
    picture=EDIT/'picture.mp4'
    edit.run(['-f','concat','-safe',0,'-i',concat,'-c','copy',picture])
    shade=ROOT/'tmp/trailer_v2/edit/shade.png'
    ass=caption.relative_to(ROOT).as_posix()
    fonts=(RAW/'fonts').relative_to(ROOT).as_posix()
    final_args=['-filter_complex_threads',2,'-i',picture,'-ss',18,'-i',ROOT/'bgm/1장_썩은숲/Bloodsteel Ascension.mp3',
              '-loop',1,'-i',shade,'-filter_complex',
              f"[0:v][2:v]overlay=0:0:enable='lt(t,54)',drawbox=x=0:y=0:w=iw:h=38:color=black:t=fill,drawbox=x=0:y=1042:w=iw:h=38:color=black:t=fill,ass='{ass}':fontsdir='{fonts}'[v];"
              '[0:a]atrim=end=54,volume=1.8,highpass=f=35,afade=t=out:st=53.85:d=0.15,apad=whole_dur=58[sfx];'
              '[1:a]atrim=duration=58,asetpts=PTS-STARTPTS,volume=0.48,afade=t=in:d=0.35,afade=t=out:st=56:d=2[bgm];'
              '[sfx][bgm]amix=inputs=2:duration=longest:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=9,aformat=sample_rates=48000:channel_layouts=stereo[a]',
              '-map','[v]','-map','[a]','-t',58,'-r',60,'-c:v','libx264','-threads',8,
              '-preset','slow','-crf',18,'-pix_fmt','yuv420p','-color_range','tv','-colorspace','bt709',
              '-color_primaries','bt709','-color_trc','bt709','-c:a','aac','-b:a','320k','-movflags','+faststart',FINAL]
    with (RAW/'encode.log').open('w',encoding='utf-8') as log:
        process=subprocess.run([edit.FFMPEG,'-hide_banner','-y',*map(str,final_args)],
                               stdout=log,stderr=log,creationflags=subprocess.CREATE_NO_WINDOW)
    if process.returncode:
        raise RuntimeError(f'Final encoder exited {process.returncode}; see {RAW / "encode.log"}')
    timeline=[];time=0
    for name,start,seconds in EDL:
        timeline.append(dict(name=name,sourceStart=start,start=time,end=time+seconds));time+=seconds
    assert time==58
    (RAW/'timeline.json').write_text(json.dumps(timeline,indent=2),encoding='utf-8')
    print(FINAL,flush=True)


if __name__=='__main__':main()
