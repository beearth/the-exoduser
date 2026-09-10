"""Recapture V22 takes with the game's real damage numbers; preserve old sources."""
import recapture_trailer_combat_v22_20260909 as combat

OUT = combat.ROOT / 'tmp/trailer_damage_v24'
original_boot = combat.boot


def boot(context, errors, take):
    page = original_boot(context, errors, take)
    page.evaluate(r"""()=>{
      __rt.damageText=true;_FLOAT_TEXT_ENABLED=true;
      __rt.numberDraws=0;__rt.lastNumber=null;
      const number=drawNumStr;
      drawNumStr=function(ctx,value,x,y,color,scale){
        if(__rt.active){__rt.numberDraws++;__rt.lastNumber=String(value);}
        return number.apply(this,arguments);
      };
      const burst=_drawBurst;
      _drawBurst=function(){
        const result=burst.apply(this,arguments);
        if(__rt.active&&__rt.samples.length){
          const s=__rt.samples[__rt.samples.length-1];
          s.numberDraws=__rt.numberDraws;s.lastNumber=__rt.lastNumber;
        }
        return result;
      };
    }""")
    return page


if __name__ == '__main__':
    combat.OUT=OUT
    combat.capture.OUT=OUT
    combat.boot=boot
    combat.main()
