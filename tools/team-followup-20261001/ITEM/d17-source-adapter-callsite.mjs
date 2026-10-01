import {createD17SourceAdapter} from './d17-source-adapter-candidate.mjs';

export function createD17ReviewCalls({enabled=false,reviewOnly=false,player,getZones,readStoredRoll,fireBlackStar,activateSpikeTrap}) {
  const adapter=createD17SourceAdapter({enabled,reviewOnly});
  return Object.freeze({
    fireBlackStar:adapter.wrapBlackEnd(fireBlackStar,{player,getZones,readStoredRoll}),
    activateSpikeTrap:adapter.wrapOriginalTrap(activateSpikeTrap,getZones),
    onInfernoSlamFixedCreated:zone=>adapter.recordCreated(zone,'activateGiantSlam/infernoSlam-fixed'),
    onHellRayStormCreated:zone=>adapter.recordCreated(zone,'update/hellRay-storm'),
    onMaliceStormOriginalCreated:zone=>adapter.recordCreated(zone,'update/maliceStorm-original'),
    clear:adapter.clear,
    status:'proposal',runtimeReady:false
  });
}
