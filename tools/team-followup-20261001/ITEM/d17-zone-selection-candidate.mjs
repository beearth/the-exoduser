export const D17_CONTRACT = Object.freeze({status:'proposal', enabled:false, runtimeReady:false, radius:600, min:1, max:3});

export function selectD17Zones({enabled=false, event, storedRoll, zones, playerZones=[], bossZones=[], processedCastIds=[]}={}) {
  const unchanged = status => ({status, zones, moved:[], processedCastIds});
  if (enabled !== true) return unchanged('disabled');
  if (!Array.isArray(zones) || !Array.isArray(playerZones) || !Array.isArray(bossZones) || !Array.isArray(processedCastIds)) return unchanged('invalid-input');
  if (!event || event.kind !== 'black-end' || event.sourceId !== 'blackStar' || typeof event.castId !== 'string' || !event.castId.length || !Number.isFinite(event.x) || !Number.isFinite(event.y)) return unchanged('invalid-event');
  if (processedCastIds.includes(event.castId)) return unchanged('already-processed');
  if (!Number.isInteger(storedRoll) || storedRoll < 1 || storedRoll > 3) return unchanged('invalid-stored-roll');
  const owned = new Set(playerZones), bosses = new Set(bossZones), seen = new Set(), candidates = [];
  zones.forEach((zone, index) => {
    if (!zone || !owned.has(zone) || bosses.has(zone) || seen.has(zone)) return;
    seen.add(zone);
    if (!['spikeTrap','fireAura','storm'].includes(zone.type) || zone.follow === true || (zone.type === 'fireAura' && zone.follow !== false)) return;
    if (![zone.x,zone.y,zone.t,zone.maxT].every(Number.isFinite) || zone.t < 0 || zone.t >= zone.maxT) return;
    const distance = Math.hypot(zone.x-event.x, zone.y-event.y);
    if (distance <= D17_CONTRACT.radius) candidates.push({zone,index,distance});
  });
  candidates.sort((first, second) => first.distance-second.distance || first.index-second.index);
  const selected = candidates.slice(0,storedRoll), references = new Set(selected.map(entry => entry.zone));
  const copies = new Map(selected.map(({zone}) => [zone,{...zone,x:event.x,y:event.y}]));
  return {
    status:'review-selected',
    zones:zones.map(zone => references.has(zone) ? copies.get(zone) : zone),
    moved:selected.map(({zone,index,distance}) => ({index,distance,from:{x:zone.x,y:zone.y},to:{x:event.x,y:event.y}})),
    processedCastIds:[...processedCastIds,event.castId]
  };
}
