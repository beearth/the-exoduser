export function createD13DeferredReview({enabled=false,reviewOnly=false,onOriginalTrapKill=()=>{}}={}) {
  const permitted=enabled === true && reviewOnly === true;
  let sources=new WeakMap(),usedCasts=new Set(),pending=[],inPass=false,epoch=0;
  const callbackErrors=[];
  function record(zone,kind,castToken) {
    if(!permitted || !zone || zone.type !== 'spikeTrap' || sources.has(zone))return false;
    if(kind === 'original' && (zone._pillarSpike === true || !castToken))return false;
    sources.set(zone,Object.freeze({kind,castToken}));return true;
  }
  function wrapOriginalTrap(original,getZones) {
    return function(...args) {
      if(!permitted)return Reflect.apply(original,this,args);
      const before=new Set(getZones()||[]),castToken=Object.freeze({});
      const value=Reflect.apply(original,this,args);
      for(const zone of getZones()||[])if(!before.has(zone))record(zone,'original',castToken);
      return value;
    };
  }
  function invokeDot(zone,original,receiver,args) {
    const enemy=args[0],opts=args[4],source=sources.get(zone),beforeEpoch=epoch;
    const eligible=permitted && inPass && source?.kind === 'original' && zone.type === 'spikeTrap' && zone._pillarSpike !== true && opts?.dot === true && opts?._lessonAttack === 'spikeTrap' && enemy?.alive === true && enemy.hp > 0;
    const value=Reflect.apply(original,receiver,args);
    if(eligible && epoch === beforeEpoch && enemy.alive === false && enemy.hp <= 0 && !usedCasts.has(source.castToken)) {
      usedCasts.add(source.castToken);
      pending.push(Object.freeze({zone,enemy,castToken:source.castToken,x:enemy.x,y:enemy.y,sourceKind:'original'}));
    }
    return value;
  }
  function wrapZonePass(original,getZones) {
    if(permitted && typeof getZones !== 'function')throw new TypeError('검토 루프 배열 참조 공급 필요');
    return function(...args) {
      if(!permitted)return Reflect.apply(original,this,args);
      if(inPass)throw new Error('review zone pass 재진입 미지원');
      const passZones=getZones(),passEpoch=epoch;
      inPass=true;let value,success=false;
      try {value=Reflect.apply(original,this,args);success=true;}
      finally {inPass=false;if(!success)pending=[];}
      if(epoch !== passEpoch || getZones() !== passZones){clear();return value;}
      const callbacks=pending;pending=[];
      for(const event of callbacks)try {onOriginalTrapKill(event);}catch(error){callbackErrors.push(error);}
      return value;
    };
  }
  function clear() {epoch++;sources=new WeakMap();usedCasts=new Set();pending=[];}
  return Object.freeze({status:'proposal',runtimeReady:false,wrapOriginalTrap,invokeDot,wrapZonePass,clear,
    recordOriginal:(zone,castToken)=>record(zone,'original',castToken),
    recordFusion:zone=>record(zone,'fusion',null),recordChild:zone=>record(zone,'child',null),
    inspectSource:zone=>sources.get(zone)||null,
    inspect:()=>({inPass,pending:pending.length,callbackErrors:callbackErrors.slice()})});
}
