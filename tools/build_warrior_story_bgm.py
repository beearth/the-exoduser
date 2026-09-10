"""Add the existing instrumental theme without re-encoding the approved picture."""
import hashlib,json,os,shutil,subprocess
from pathlib import Path
import numpy as np
import soundfile as sf

ROOT=Path(__file__).resolve().parents[1]
BIN=Path(os.environ['LOCALAPPDATA'])/'Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.0.1-full_build/bin'
FF=BIN/'ffmpeg.exe';FP=BIN/'ffprobe.exe'
SOURCE=ROOT/'output/cinematic/warintro_remaster_20260909/hell_drag_v21'
OUT=ROOT/'output/cinematic/warrior_story_bgm_20260910'
TEMP=ROOT/'tmp/warrior_story_bgm';RATE=48000;TOTAL=96.4
TARGET=ROOT/'video/warrior_story_v22_bgm.mp4'
THEME=ROOT/'bgm/cutscene/prologue_theme.mp3'

def run(args):
    return subprocess.check_output([str(FF),'-v','error','-y',*map(str,args)])
def pcm(path):
    return np.frombuffer(run(['-i',path,'-t',TOTAL,'-vn','-ar',RATE,'-ac','2','-f','f32le','-']),np.float32).reshape(-1,2)
def rms(x):return float(np.sqrt(np.mean(x.astype(np.float64)**2)))
def video_hash(path):return run(['-i',path,'-map','0:v:0','-c:v','copy','-f','hash','-hash','sha256','-']).decode().strip()

def main():
    OUT.mkdir(exist_ok=True);TEMP.mkdir(exist_ok=True)
    voice=pcm(SOURCE/'narration.wav');music=pcm(THEME);n=round(TOTAL*RATE)
    assert len(voice)==n and len(music)==n
    cues=json.loads((SOURCE/'captions.json').read_bytes())
    times=np.arange(n,dtype=np.float64)/RATE
    duck=np.ones(n,dtype=np.float32)
    for cue in cues:
        a,b=cue['start_s'],cue['end_s']
        # Begin ducking 150ms before speech; recover over 350ms after it.
        amount=np.minimum(np.clip((times-(a-.15))/.15,0,1),np.clip((b+.35-times)/.35,0,1))
        duck=np.minimum(duck,1-.5*amount)
    active=np.max(np.abs(voice),axis=1)>.01
    music_gain=rms(voice[active])*.5/rms(music)
    fade=np.clip(times/1.5,0,1)*np.clip((TOTAL-times)/1.2,0,1)
    bed=music*(music_gain*duck*fade)[:,None]
    mixed=voice+bed
    assert np.max(np.abs(mixed))<.95,'Mix needs peak headroom'
    sf.write(TEMP/'mix.wav',mixed,RATE,subtype='FLOAT')
    run(['-i',SOURCE/'final.mp4','-i',TEMP/'mix.wav','-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','256k','-ar',RATE,'-t',TOTAL,'-movflags','+faststart',TARGET])
    # Confirm bit-identical video packets, complete decode, exact duration and music under the pauses.
    assert video_hash(TARGET)==video_hash(SOURCE/'final.mp4')
    run(['-i',TARGET,'-f','null','-'])
    info=json.loads(subprocess.check_output([str(FP),'-v','error','-show_streams','-of','json',str(TARGET)]))
    v=next(s for s in info['streams'] if s['codec_type']=='video');a=next(s for s in info['streams'] if s['codec_type']=='audio')
    assert int(v['nb_frames'])==5784 and abs(float(a['duration'])-TOTAL)<.03
    actual=pcm(TARGET)
    assert np.max(np.abs(actual))<.95
    # The old silence after Escape now has score, while the dialogue timings remain untouched.
    gap=slice(round(91.42*RATE),round(92.86*RATE))
    assert rms(actual[gap])>.001 and rms(voice[gap])<.0001
    reference=mixed[:len(actual)]
    assert float(np.corrcoef(reference.ravel(),actual.ravel())[0,1])>.995
    run(['-ss',87.5,'-i',TARGET,'-t',8.9,'-c:v','libx264','-preset','fast','-crf','20','-threads','2','-c:a','aac','-b:a','192k','-movflags','+faststart',OUT/'ending_bgm_preview.mp4'])
    report={'status':'PASS','source':'output/cinematic/warintro_remaster_20260909/hell_drag_v21/final.mp4','target':TARGET.relative_to(ROOT).as_posix(),'music':THEME.relative_to(ROOT).as_posix(),'music_source_start_s':0,'duration_s':TOTAL,'video_frames':5784,'picture_packet_hash':video_hash(TARGET),'picture_unchanged':True,'voice_gain':1,'music_gain':music_gain,'dialogue_duck_multiplier':.5,'duck_attack_s':.15,'duck_release_s':.35,'music_fade_in_s':1.5,'music_fade_out_s':1.2,'sample_rate':RATE,'audio_codec':'aac','audio_bitrate':256000,'channels':2,'decoded_peak_dbfs':float(20*np.log10(np.max(np.abs(actual)))),'command_pause_music_rms':rms(actual[gap]),'voice_active_rms':rms(voice[active]),'music_during_voice_rms':rms(bed[active]),'decoded_mix_correlation':float(np.corrcoef(reference.ravel(),actual.ravel())[0,1]),'sha256':hashlib.sha256(TARGET.read_bytes()).hexdigest(),'bytes':TARGET.stat().st_size,'captions':22,'listening_review':False}
    (OUT/'mix_qa.json').write_bytes((json.dumps(report,ensure_ascii=False,indent=2)+'\n').encode('utf-8'))
    total=ROOT/'대검전사_스토리_총합본.mp4'
    if total.exists() and not (TEMP/'total_before_bgm.mp4').exists():shutil.copy2(total,TEMP/'total_before_bgm.mp4')
    shutil.copy2(TARGET,total)
    print(json.dumps(report,ensure_ascii=False),flush=True)

if __name__=='__main__':main()
