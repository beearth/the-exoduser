"""60fps trailer: synchronized gameplay audio, restrained animated typography."""
import concurrent.futures
import json
from pathlib import Path
import shutil
import subprocess
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
RAW=ROOT/'tmp/trailer_v2'
EDIT=RAW/'edit'
FINAL=ROOT/'captures/gameplay_trailer_20260909/EXODUSER_GAMEPLAY_TRAILER_V2_70S_1080P60.mp4'
FFMPEG=shutil.which('ffmpeg')
EDL=[('rage_slam',3.7,1),('fire_stack_b',7.45,1),('blackhole',5.9,1),
 ('ch1_altar',.6,3),('ch2_hive',.6,3),('ch3_ritual',.6,3),
 ('rage_charge',.3,7),('rage_slam',.5,6),('fire_stack_b',.4,10),
 ('ice_orb',1,5),('ancestor',.5,6),('blackhole',.5,8),
 ('druid_boss_c',.5,12),('title',0,4)]

def run(args):
 p=subprocess.run([FFMPEG,'-hide_banner','-loglevel','error','-y',*map(str,args)],capture_output=True,creationflags=subprocess.CREATE_NO_WINDOW)
 if p.returncode:raise RuntimeError(p.stderr.decode('utf-8',errors='replace'))

def timestamp(t):
 cs=round(t*100)
 return f'{cs//360000}:{cs//6000%60:02}:{cs//100%60:02}.{cs%100:02}'

def prepare_font():
 # libass selects weight 100 from this installed variable font; pin weight 900.
 target=RAW/'fonts/TrailerNotoBlack.ttf'
 if target.exists():return
 from fontTools.ttLib import TTFont
 from fontTools.varLib.instancer import instantiateVariableFont
 font=instantiateVariableFont(TTFont('C:/Windows/Fonts/NotoSansKR-VF.ttf'),{'wght':900},inplace=True)
 for name in font['name'].names:
  if name.nameID in (1,4,6,16):name.string=('TrailerNotoBlack' if name.nameID==6 else 'Trailer Noto Black').encode(name.getEncoding())
  if name.nameID in (2,17):name.string='Regular'.encode(name.getEncoding())
 target.parent.mkdir(exist_ok=True);font.save(target)

def captions():
 header='''[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Hero,Trailer Noto Black,72,&H00EAF1F5,&H000000FF,&H00100C09,&H90000000,0,0,0,0,94,100,-1,0,1,0.65,2,7,0,0,0,1
Style: Tag,Bahnschrift,20,&H00C3C5C7,&H000000FF,&H00100C09,&H90000000,0,0,0,0,100,100,3.5,0,1,0.5,1,7,0,0,0,1
Style: Small,Noto Sans KR,21,&H00D1D1D1,&H000000FF,&H00100C09,&H90000000,0,0,0,0,100,100,1,0,1,0.5,1,7,0,0,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
'''
 rows=[]
 def line(a,b,style,text,tags='',layer=2):
  rows.append(f'Dialogue: {layer},{timestamp(a)},{timestamp(b)},{style},,0,0,0,,{{\\fad(120,180){tags}}}{text}')
 def cue(a,b,label,text,color='477EF1',impact=False,size=72):
  # An engraved accent, a narrow tracking label, and one readable command.
  line(a,b,'Tag',r'{\p1\bord0\shad0\1c&H'+color+r'&}m 0 0 l 70 0 70 3 0 3',r'\pos(112,835)',1)
  line(a+.05,b,'Tag',label,r'\pos(112,850)')
  motion=r'\move(112,903,112,891,0,220)'
  if impact:motion+=r'\fscx100\fscy108\t(0,160,\fscx94\fscy100)'
  line(a+.08,b,'Hero',text,motion+f'\\fs{size}')
 def accent(word,c):return '{\\1c&H'+c+'&}'+word+'{\\1c&HEAF1F5&}'
 cue(3.2,5.8,'01 / 1-1   THE ROTTEN FOREST','썩은 숲의 제단','91B2AB',size=52)
 cue(6.2,8.8,'02 / 2-1   THE HIVE','군집의 심장','80B4CC',size=52)
 cue(9.2,11.8,'03 / 3-1   THE RITUAL','지옥의 의식','8F80BD',size=52)
 cue(12.35,18.8,'Q / PARRY  →  RAGE','탄막으로 '+accent('분노를 채워라','477EF1'))
 cue(19.25,21.9,'GATHER THEM ALL','모조리 끌어모아라',size=58)
 cue(22.3,24.85,'SPACE / INFERNAL SLAM','분노로 '+accent('섬멸하라','477EF1'),impact=True,size=72)
 cue(25.3,31.55,'SHIFT + RMB / FLAME STACK','화염을 '+accent('쌓아라','4BA5FF'),'4BA5FF')
 cue(32.1,34.85,'IGNITE / CHAIN DETONATION','한 번에 '+accent('터뜨려라','4BA5FF'),'4BA5FF',True,72)
 cue(35.4,39.65,'CTRL / ICE ORB',accent('얼음보주','F9DFC0'),'F9DFC0',size=60)
 cue(40.4,44.8,'ANCESTRAL SUMMON',accent('전대 소환','89BEDE'),'89BEDE',size=60)
 cue(46.35,50.7,'ULTIMATE / BULLET BLACK HOLE','탄막을 '+accent('삼켜라','6878DE'),'6878DE')
 cue(51.5,53.8,'RELEASE EVERYTHING','그대로 '+accent('되돌려라','6878DE'),'6878DE',True)
 cue(54.3,58.7,'1-1 / BOSS ENCOUNTER','다크드루이드','93B5A6',size=62)
 line(66.35,69.8,'Tag','EXODUSER : HELL LORD',r'\an8\pos(960,867)\fs22\fsp7')
 (EDIT/'captions.ass').write_text(header+'\n'.join(rows)+'\n',encoding='utf-8-sig')

def segment(entry):
 i,(name,start,duration)=entry
 target=EDIT/f'{i:02}.mp4'
 if target.exists() and target.stat().st_size>1024:return target
 if name=='title':
  image=ROOT/'output/imagegen/trailer/steam_title_card_api_v2.png'
  run(['-loop',1,'-framerate',60,'-i',image,'-f','lavfi','-i','anullsrc=r=48000:cl=stereo','-t',duration,
       '-vf',"scale=1984:1116:flags=lanczos,crop=1920:1080:x='32+8*sin(t*.6)':y='18',setsar=1,fade=t=in:st=0:d=0.3,fade=t=out:st=3.5:d=0.5",
       '-c:v','libx264','-threads',4,'-preset','fast','-crf',17,'-pix_fmt','yuv420p','-c:a','aac','-b:a','256k',target])
 else:
  run(['-ss',start,'-i',RAW/(name+'.webm'),'-t',duration,'-vf',
       'fps=60,scale=1920:1080:flags=lanczos,setsar=1,eq=gamma=1.48:contrast=1.06:saturation=1.10',
       '-af',f'aresample=48000:async=1:first_pts=0,afade=t=in:d=0.025,afade=t=out:st={duration-.22}:d=0.22,apad',
       '-frames:v',round(duration*60),'-c:v','libx264','-threads',4,'-preset','fast','-crf',17,'-pix_fmt','yuv420p',
       '-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-c:a','aac','-b:a','256k',target])
 print(f'cut {i:02}: {name}',flush=True)
 return target

def main(captions_enabled=True):
 duration=round(sum(cut[2] for cut in EDL),3)
 EDIT.mkdir(parents=True,exist_ok=True);FINAL.parent.mkdir(parents=True,exist_ok=True)
 if captions_enabled:prepare_font();captions()
 # Dark falloff behind the caption, without an opaque information box.
 shade=Image.new('RGBA',(1920,1080));px=shade.load()
 for y in range(1080):
  for x in range(1920):
   alpha=round(100*max(0,(y-730)/350)*max(0,1-x/1250))
   px[x,y]=(5,7,10,alpha)
 shade.save(EDIT/'shade.png')
 with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:files=list(pool.map(segment,enumerate(EDL)))
 (EDIT/'concat.txt').write_text(''.join(f"file '{p.as_posix()}'\n" for p in files),encoding='utf-8')
 run(['-f','concat','-safe',0,'-i',EDIT/'concat.txt','-c','copy',EDIT/'picture.mp4'])
 music=ROOT/'bgm/1장_썩은숲/Bloodsteel Ascension.mp3'
 # Retain synchronized recorded audio; the score continues across every cut.
 run(['-i',EDIT/'picture.mp4','-ss',18,'-i',music,'-filter_complex',
      f'[0:a]volume=1.8,highpass=f=35[sfx];[1:a]atrim=duration={duration},asetpts=PTS-STARTPTS,volume=.48,afade=t=in:d=0.35,afade=t=out:st={duration-2}:d=2[bgm];[sfx][bgm]amix=inputs=2:duration=longest:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=9,aformat=sample_rates=48000:channel_layouts=stereo[mix]',
      '-map','[mix]','-t',duration,'-c:a','pcm_s24le',EDIT/'mix.wav'])
 ass=str((EDIT/'captions.ass').relative_to(ROOT)).replace('\\','/')
 frame_filter='drawbox=x=0:y=0:w=iw:h=38:color=black:t=fill,drawbox=x=0:y=1042:w=iw:h=38:color=black:t=fill'
 video_filter=(f"[0:v][2:v]overlay=0:0:enable='lt(t,66)',{frame_filter},ass='{ass}':fontsdir='tmp/trailer_v2/fonts'[v]"
               if captions_enabled else f'[0:v]{frame_filter}[v]')
 run(['-i',EDIT/'picture.mp4','-i',EDIT/'mix.wav','-loop',1,'-i',EDIT/'shade.png',
      '-filter_complex',video_filter,
      '-map','[v]','-map','1:a','-t',duration,'-r',60,'-c:v','libx264','-threads',8,'-preset','slow','-crf',18,
      '-pix_fmt','yuv420p','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709',
      '-c:a','aac','-b:a','320k','-movflags','+faststart',FINAL])
 (EDIT/'edl.json').write_text(json.dumps(EDL,ensure_ascii=False,indent=2),encoding='utf-8')
 print(FINAL,flush=True)

if __name__=='__main__':main()
