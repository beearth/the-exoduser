import {selectD17Zones} from './d17-zone-selection-candidate.mjs';

const sites = Object.freeze({
  'activateSpikeTrap/original':'spikeTrap',
  'activateGiantSlam/infernoSlam-fixed':'fireAura',
  'update/hellRay-storm':'storm',
  'update/maliceStorm-original':'storm'
});

export function createD17SourceAdapter({enabled=false,reviewOnly=false}={}) {
  let provenance = new WeakMap(), active = null, serial = 0;
  const permitted = enabled === true && reviewOnly === true;
  function recordCreated(zone, site) {
    if (!permitted || !zone || sites[site] !== zone.type || zone.follow === true || (zone.type === 'fireAura' && zone.follow !== false)) return false;
    provenance.set(zone,site);
    return true;
  }
  function beginBlackCast(player) {
    if (!permitted || !player?._bsCasting) return null;
    if (active?.player === player && !active.ended) return active.token;
    const token = Object.freeze({serial:++serial});
    active = {player,token,ended:false};
    return token;
  }
  function endBlackCast({player,token,zones,storedRoll,center}={}) {
    if (!permitted) return {status:'disabled',moved:[]};
    if (!active || active.player !== player || active.token !== token || active.ended || player._bsCasting !== false) return {status:'unconfirmed-end',moved:[]};
    active.ended = true;
    const result = selectD17Zones({enabled:true,zones,storedRoll,
      playerZones:Array.isArray(zones)?zones.filter(zone=>provenance.has(zone) && sites[provenance.get(zone)] === zone.type):[],
      event:{kind:'black-end',sourceId:'blackStar',castId:String(token.serial),x:center?.x,y:center?.y}});
    if (result.status !== 'review-selected') return result;
    const selected = result.moved.map(entry=>zones[entry.index]);
    const writable = zone => ['x','y'].every(key=>{
      const descriptor=Object.getOwnPropertyDescriptor(zone,key);
      return descriptor && 'value' in descriptor && descriptor.writable;
    });
    if (!selected.every(writable)) return {status:'unwritable-position',moved:[]};
    selected.forEach(zone=>{zone.x=center.x;zone.y=center.y;});
    return {status:'review-moved',zones,moved:result.moved};
  }
  function wrapBlackEnd(original, {player,getZones,readStoredRoll}) {
    return function(...args) {
      const casting=player._bsCasting === true;
      const token=casting?beginBlackCast(player):null;
      const center={x:player._bsX,y:player._bsY};
      const value=Reflect.apply(original,this,args);
      if(permitted && casting && player._bsCasting === false) endBlackCast({player,token,center,zones:getZones(),storedRoll:readStoredRoll()});
      return value;
    };
  }
  function wrapOriginalTrap(original,getZones) {
    return function(...args) {
      if (!permitted) return Reflect.apply(original,this,args);
      const before=new Set(getZones()||[]);
      const value=Reflect.apply(original,this,args);
      for(const zone of getZones()||[])if(!before.has(zone))recordCreated(zone,'activateSpikeTrap/original');
      return value;
    };
  }
  function clear() {provenance=new WeakMap();active=null;}
  return Object.freeze({status:'proposal',runtimeReady:false,recordCreated,beginBlackCast,endBlackCast,wrapBlackEnd,wrapOriginalTrap,clear});
}
