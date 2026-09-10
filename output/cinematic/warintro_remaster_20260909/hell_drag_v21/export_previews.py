"""Export short, narrated review clips from the verified combined render."""
import shutil
import render as r
for name,start,duration,dest in [
    ('family_transition',56,7.5,'대검전사_가족컷_연결수정.mp4'),
    ('hell_drag_preview',64,5.5,'대검전사_지옥추락_수정본.mp4'),
]:
    r.run(['-ss',start,'-i',r.ROOT/'final.mp4','-t',duration,'-c:v','libx264','-crf','18','-preset','fast','-threads','4','-c:a','aac','-b:a','192k','-movflags','+faststart',r.ROOT/f'{name}.mp4'])
    info=r.probe(r.ROOT/f'{name}.mp4')
    assert int(next(s for s in info['streams'] if s['codec_type']=='video')['nb_frames'])==round(duration*60)
    shutil.copy2(r.ROOT/f'{name}.mp4',r.PROJECT/dest)
print('Narrated family and hell-drag previews exported')
