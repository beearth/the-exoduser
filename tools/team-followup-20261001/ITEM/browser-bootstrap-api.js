const installations=new WeakMap();
const pending=new WeakSet();
const property='_d10PersistenceReviewPort';
const descriptor=host=>Object.getOwnPropertyDescriptor(host,property);
const same=(left,right)=>!!left&&!!right&&left.value===right.value&&left.writable===right.writable
  &&left.enumerable===right.enumerable&&left.configurable===right.configurable
  &&left.get===right.get&&left.set===right.set;

export function installD10Review({host,reviewOnly=false,createPort,mkItem,rng,onInstalled}={}){
  if(reviewOnly!==true)throw new TypeError('reviewOnly 명시 opt-in 필요');
  if(!host||(typeof host!=='object'&&typeof host!=='function'))throw new TypeError('명시 host 필요');
  if(installations.has(host)||pending.has(host))throw new Error('중복 검토 설치 금지');
  if(typeof createPort!=='function'||typeof mkItem!=='function'||typeof rng!=='function'
    ||(onInstalled!==undefined&&typeof onInstalled!=='function'))throw new TypeError('실제 포트 factory 및 신규 생성 의존 필요');
  const original=descriptor(host);
  if(original?.configurable===false)throw new Error('원 비구성 property 보존');
  pending.add(host);
  try{
  const port=createPort({mkItem,rng});
  if(original?!same(descriptor(host),original):descriptor(host)!==undefined)throw new Error('factory 중 원 property 교체 보호');
  if(!port||port.enabled!==false||port.runtimeReady!==false||port.status!=='proposal'
    ||['createReview','readItem','restoreItem','serializeItem'].some(key=>typeof port[key]!=='function'))throw new Error('비활성 제안 포트 계약 불일치');
  const installed={value:port,writable:true,configurable:true,enumerable:original?.enumerable??false};
  let active=false;
  const assertOwned=()=>{if(!active||!same(descriptor(host),installed))throw new Error('해제/교체된 검토 포트 호출 금지');};
  const restore=()=>{if(original)Object.defineProperty(host,property,original);else if(!Reflect.deleteProperty(host,property))throw new Error('검토 property 정리 실패');};
  const handle=Object.freeze({
    status:'proposal',enabled:false,runtimeReady:false,
    create(request){assertOwned();return port.createReview(request);},
    read(item){assertOwned();return port.readItem(item);},
    restore(item){assertOwned();return port.restoreItem(item);},
    serialize(item){assertOwned();return port.serializeItem(item);},
    uninstall(){
      if(!active)return Object.freeze({status:'already-uninstalled'});
      if(!same(descriptor(host),installed)){
        active=false;installations.delete(host);return Object.freeze({status:'foreign-preserved'});
      }
      restore();active=false;installations.delete(host);return Object.freeze({status:'restored'});
    }
  });
  try{
    Object.defineProperty(host,property,installed);
    if(!same(descriptor(host),installed))throw new Error('설치 descriptor 확인 실패');
    active=true;installations.set(host,handle);
    if(onInstalled)onInstalled(handle);
    if(!active||!same(descriptor(host),installed))throw new Error('설치 중 포트 교체/해제');
    return handle;
  }catch(error){
    active=false;installations.delete(host);
    if(same(descriptor(host),installed)){
      try{restore();}catch(rollbackError){throw new AggregateError([error,rollbackError],'설치 실패 및 rollback 실패');}
    }
    throw error;
  }
  }finally{pending.delete(host);}
}

export function createD10ReviewController(options){
  const handle=installD10Review(options);
  return Object.freeze({
    createNew:request=>handle.create(request),
    readLoaded:item=>handle.read(handle.restore(item)),
    serialize:item=>handle.serialize(item),
    close:()=>handle.uninstall()
  });
}
