"""Dense caption-free skill montage; all source playback remains real-time."""
import json
import shutil
from pathlib import Path
import build_gameplay_trailer_v2_20260909 as edit

ROOT=Path(__file__).resolve().parents[1]
edit.RAW=ROOT/'tmp/trailer_combat_v22'
edit.EDIT=edit.RAW/'edit'
edit.FINAL=ROOT/'captures/gameplay_trailer_20260909/EXODUSER_GAMEPLAY_TRAILER_V22_SKILL_MONTAGE_1080P60.mp4'
edit.EDL=[
 ('blackstar',9.45,1),('fused_slam',1.05,1),('rainbow_parry',1.3,1),
 ('ch2_hive',.6,2),('ch3_ritual',.6,2),
 ('ki_whirl',.5,1.8),('ki_whirl',3,2.2),
 ('mobility',.4,1.1),('mobility',1.6,1),('mobility',2.5,1.7),('mobility',5.6,1.1),
 ('magic_beams',.3,1.1),('magic_beams',1.8,1.1),('magic_beams',3.3,1.2),('magic_beams',4.6,2.2),
 ('blades',.4,1.4),('blades',2.2,1.4),('blades',4.2,1.4),('blades',6,1.6),
 ('rainbow_parry',.5,5.8),('rage_slam',.8,3.8),
 ('bone_storm',.4,1.6),('bone_storm',2.6,1.8),('bone_storm',5.1,1.8),
 ('mortar',.6,2.3),('ice_orb',.6,3.5),
 ('pillars',.4,2.2),('pillars',3.4,2.2),
 ('traps',.4,1.1),('traps',2.9,1.4),('traps',4.7,1.8),
 ('domains',.3,1.2),('domains',2,1.2),('domains',4,1.2),('domains',6,1.2),
 ('scarecrow',.3,1.8),('scarecrow',3,1.4),('scarecrow',5.8,1.8),
 ('ancestor',.5,2.8),('ancestor',4.5,2),
 ('fused_storm',.4,3.5),('fused_slam',.5,3),
 ('blackstar',.4,1.8),('blackhole',.6,2.8),('blackhole',5.4,2.7),('blackstar',9,3.5),
 ('boss',1.7,5.5),('title',0,4),
]

def main():
    for name in ['ch2_hive','ch3_ritual']:
        shutil.copyfile(ROOT/'tmp/trailer_v2'/f'{name}.webm',edit.RAW/f'{name}.webm')
    timeline=[];t=0
    for name,start,seconds in edit.EDL:
        timeline.append(dict(name=name,sourceStart=start,start=round(t,3),end=round(t+seconds,3)))
        t+=seconds
    (edit.RAW/'timeline.json').write_text(json.dumps(timeline,indent=2))
    print(f'{len(timeline)} cuts / {t:.1f}s',flush=True)
    edit.main(captions_enabled=False)

if __name__=='__main__':main()
