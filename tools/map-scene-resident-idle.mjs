/* Foot-anchored editor breathing. No bitmap, object, navigation or save writes. */
import {residentPaintingProfile} from './map-scene-rift-residents.mjs';

const IDS=Object.freeze(['obj-resident-haran','obj-resident-berin','obj-resident-nessa','obj-resident-dorik']);
const PERIOD_MS=2600, AMPLITUDE=.014, PHASE_STEP=.137;

export function createResidentIdle() {
  const scales=new Map();let enabled=false,entries=[];
  function clear(){scales.clear();enabled=false;entries=[];}
  function prepare(scene,timeMs,on,excludedIds=[]) {
    clear();
    try {
      if(on!==true || !Number.isFinite(timeMs) || !Array.isArray(excludedIds) || !residentPaintingProfile(scene))return;
      const foot=scene.layers.find(l=>l.id==='foot');
      for(const [index,objectId] of IDS.entries()) {
        const o=foot.objects.find(o=>o.id===objectId);
        if(!o){clear();return;}
        const phase=(timeMs/PERIOD_MS+index*PHASE_STEP)%1;
        const scaleY=excludedIds.includes(objectId)?1:1+AMPLITUDE*Math.sin(phase*Math.PI*2);
        scales.set(o,scaleY);entries.push({objectId,scaleY});
      }
      enabled=true;
    } catch (_) {clear();}
  }
  function scaleFor(object){return scales.get(object)??1;}
  function snapshot(){return {enabled,entries:entries.map(entry=>({...entry}))};}
  return Object.freeze({prepare,scaleFor,snapshot});
}
