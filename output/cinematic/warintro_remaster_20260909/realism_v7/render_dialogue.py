"""Prepare the new final-line pause without altering voice identity or speech rate."""
from pathlib import Path
import json
import os
import subprocess
import numpy as np
import soundfile as sf

ROOT=Path(__file__).resolve().parent
V4=ROOT.parent/'full_review_v4'
BIN=Path(os.environ['LOCALAPPDATA'])/'Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.0.1-full_build/bin'
FF=str(BIN/'ffmpeg.exe')
RATE=48000
SPLIT_S=96.095
INSERT_S=1.04
FADE_S=.003

def run(args):
    subprocess.run([FF,'-hide_banner','-v','error','-y',*map(str,args)],check=True)

def stamp(t):
    n=round(t*1000)
    return f'{n//3600000:02d}:{n//60000%60:02d}:{n//1000%60:02d},{n%1000:03d}'

source=np.frombuffer(subprocess.check_output([FF,'-v','error','-i',str(V4/'final.mp4'),
    '-vn','-ar',str(RATE),'-ac','2','-f','f32le','-']),np.float32).reshape(-1,2)
total=101*RATE
source=source[:total]
split=round(SPLIT_S*RATE)
insert=round(INSERT_S*RATE)
fade=round(FADE_S*RATE)
left,right=source[:split].copy(),source[split:].copy()
left[-fade:]*=np.linspace(1,0,fade,dtype=np.float32)[:,None]
right[:fade]*=np.linspace(0,1,fade,dtype=np.float32)[:,None]
out=np.concatenate([left,np.zeros((insert,2),np.float32),right])[:total]
assert np.max(np.abs(source[-insert:]))==0,'Only silent tail may be trimmed'
assert np.array_equal(source[:split-fade],out[:split-fade])
assert np.array_equal(source[split+fade:total-insert],out[split+insert+fade:])
assert np.max(np.abs(out[split:split+insert]))==0
sf.write(ROOT/'narration_v7.wav',out,RATE,subtype='FLOAT')
sf.write(ROOT/'ending_dialogue.wav',out[round(89.5*RATE):],RATE,subtype='FLOAT')
run(['-i',ROOT/'ending_dialogue.wav','-c:a','libmp3lame','-b:a','192k',ROOT/'ending_dialogue.mp3'])

manifest=json.loads((V4/'manifest.json').read_text(encoding='utf-8'))
caps=manifest['captions'][:-1]+[
    dict(id='wa33a',scene=16,start_s=95.04,end_s=96.095,ko='"지옥을 탈출하라."',en='"Escape from hell."'),
    dict(id='wa33b',scene=16,start_s=97.24,end_s=98.05,ko='"죄인이여."',en='"Sinner."')]
assert len(caps)==22
for name,items,offset in [('caps.srt',caps,0),('ending_dialogue.srt',caps[-3:],89.5)]:
    text='\n\n'.join(f"{i+1}\n{stamp(c['start_s']-offset)} --> {stamp(c['end_s']-offset)}\n{c['ko']}" for i,c in enumerate(items))+'\n'
    (ROOT/name).write_bytes(text.encode('utf-8'))
qa=dict(duration_s=101,ending_duration_s=11.5,rate=RATE,channels=2,split_s=SPLIT_S,
    inserted_digital_silence_s=INSERT_S,seam_fade_s=FADE_S,
    question_voice_s=[90,91.34],command_first_words_s=[95.04,96.04],
    sinner_alignment_s=[97.24,97.42],nominal_word_gap_s=1.2,
    timing_basis='Existing word alignment; phonetic boundary and delivery require listening review',
    caption_count=22,unchanged_semantic_lines=21,original_samples_identical_outside_seam=True,
    discarded_tail_was_silent=True,pause_peak=0.0,voice_generation=False,
    realtime_listening_approved=False,video_generated=False)
for name,data in [('dialogue_qa.json',qa),('captions.json',caps)]:
    (ROOT/name).write_bytes((json.dumps(data,ensure_ascii=False,indent=2)+'\n').encode('utf-8'))
print(json.dumps(qa,ensure_ascii=False,indent=2))
