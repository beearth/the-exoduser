"""Captioned V23 derivative: six longer skill takes with real damage text."""
import json
import recapture_trailer_combat_v22_20260909 as combat
from recapture_trailer_damage_v24_20260910 import boot as damage_boot

event=combat.event
take=combat.take
OUT=combat.ROOT/'tmp/trailer_damage_v25'


def boot(context,errors,take):
    class TaggedErrors:
        def append(self,error):errors.append(take['name']+': '+str(error))
    page=damage_boot(context,TaggedErrors(),take)
    audit=page.evaluate("""()=>{
      const removed=[];
      for(const [slot,item] of Object.entries(INV.equipped)){
        if(!item?.affixes)continue;
        item.affixes=item.affixes.filter(a=>{
          if(a.id==='onCritExplode'||a.id==='onCritChain'){removed.push({slot,id:a.id,value:a.value});return false;}
          return true;
        });
      }
      _eqAffixCache=null;
      return {removed,onCritExplode:_eqAffix('onCritExplode'),onCritChain:_eqAffix('onCritChain')};
    }""")
    assert audit['onCritExplode']==0 and audit['onCritChain']==0
    (OUT/(take['name']+'_loadout.json')).write_text(json.dumps(audit,indent=2),encoding='utf-8')
    return page
fire=[]
for i in range(6):
    t=1+i
    fire.extend([
        event(t,f"__aim({-800 if i%2 else 800},0);__key('ShiftLeft',true);"),
        event(t+.055,"__key('ShiftLeft',false);"),
        event(t+.12,'__tap(2);'),event(t+.42,'__release();')])
fire.append(event(7.5,'_detonateAssaultFlames();'))

TAKES=[
    take('rage_charge',8,24,[combat.wave(.3),event(1.25,"__key('KeyQ',true);"),
         event(1.65,"__key('KeyQ',false);"),combat.wave(3.5),
         event(4.25,"__key('KeyQ',true);"),event(4.65,"__key('KeyQ',false);")],
         setup='P.rage=0;',radius=380,skills=['detonate']),
    take('rage_slam',8,256,[combat.cast(3.8,'giantSlam')],
         setup='P.rage=_rageMax();',radius=220,skills=['giantSlam']),
    take('fire_stack_b',11,128,fire,level=75,radius=420,skills=['chainAssault']),
    take('ice_orb',7,72,[combat.cast(1.5,'iceOrb')],level=35,radius=400,skills=['iceOrb']),
    take('ancestor',7.5,72,[combat.cast(1,'ancestorSummon')],level=120,radius=430,skills=['ancestorSummon']),
    take('blackhole',10,120,[combat.wave(.2),combat.cast(1,'lavaSummon'),combat.wave(2),combat.wave(3.8)],
         level=80,radius=390,skills=['lavaSummon']),
]

if __name__=='__main__':
    combat.OUT=OUT
    combat.capture.OUT=OUT
    combat.TAKES=TAKES
    combat.boot=boot
    combat.main()
