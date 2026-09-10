"""V22 timing and current logo, freshly captured damage-number footage/audio."""
import build_trailer_combat_v22_20260909 as montage

edit=montage.edit
edit.RAW=edit.ROOT/'tmp/trailer_damage_v24'
edit.EDIT=edit.RAW/'edit'
edit.FINAL=edit.ROOT/'captures/gameplay_trailer_20260909/EXODUSER_SKILL_TRAILER_V24_DAMAGE_TEXT_98S_1080P60.mp4'
original_segment=edit.segment
FINAL=edit.FINAL
ORIGINAL=edit.ROOT/'captures/gameplay_trailer_20260909/EXODUSER_GAMEPLAY_TRAILER_V22_SKILL_MONTAGE_NEW_LOGO_1080P60.mp4'


def segment(entry):
    index,(name,start,duration)=entry
    if name!='title':
        return original_segment(entry)
    target=edit.EDIT/f'{index:02}.mp4'
    edit.run(['-loop',1,'-framerate',60,'-i',edit.ROOT/'output/imagegen/trailer/skill_title_crimson_rift_v3.png',
              '-f','lavfi','-i','anullsrc=r=48000:cl=stereo','-t',duration,
              '-vf',"scale=2560:1440,zoompan=z='1+0.025*on/239':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=1920x1080:fps=60,setsar=1,fade=t=in:d=0.2,fade=t=out:st=3.5:d=0.5",
              '-c:v','libx264','-threads',4,'-preset','fast','-crf',17,'-pix_fmt','yuv420p',
              '-c:a','aac','-b:a','256k',target])
    return target


def preserve_original_ending(master):
    # The live boss selection has changed since V22; keep its actual source cut
    # and synchronized mastered audio, along with the identical approved logo.
    edit.run(['-i',master,'-i',ORIGINAL,'-filter_complex',
              '[0:v]trim=end=88.5,setpts=PTS-STARTPTS[v0];'
              '[0:a]atrim=end=88.5,asetpts=PTS-STARTPTS[a0];'
              '[1:v]trim=start=88.5:end=98,setpts=PTS-STARTPTS[v1];'
              '[1:a]atrim=start=88.5:end=98,asetpts=PTS-STARTPTS[a1];'
              '[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]',
              '-map','[v]','-map','[a]','-t',98,'-r',60,'-c:v','libx264',
              '-threads',8,'-preset','fast','-crf',18,'-pix_fmt','yuv420p',
              '-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709',
              '-c:a','aac','-b:a','320k','-movflags','+faststart',FINAL])


if __name__=='__main__':
    edit.segment=segment
    edit.FINAL=edit.EDIT/'damage_master.mp4'
    montage.main()
    preserve_original_ending(edit.FINAL)
