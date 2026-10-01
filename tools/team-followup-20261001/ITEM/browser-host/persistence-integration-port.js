import {createNewIdentifiedD10Instance,readD10Binding,restoreD10Instance} from "./binding-ports.js";
import {copyPlainItem,createBoundD10Consumer,readStoredRoll} from "./binding-d10.js";
import {lookupDefinition} from "../../../../unique-item-project/definitions.js";

export function createD10PersistenceIntegration({mkItem,rng}={}){
  if(typeof mkItem!=='function'||typeof rng!=='function')throw new TypeError('실제 신규 mkItem 및 D10 RNG 주입 필요');
  const consumer=createBoundD10Consumer();
  return Object.freeze({
    status:'proposal',runtimeReady:false,enabled:false,
    createReview(request){
      const data=copyPlainItem(request);
      if(!data||data.proposalOnly!==true||data.uniqueId!=='UI-10')throw new TypeError('명시 비활성 신규 검토 요청만 허용');
      if(!Number.isInteger(data.tier)||data.tier<0||data.tier>4||!Number.isInteger(data.element)||data.element<0||data.element>5
        ||!Number.isInteger(data.baseRarity)||data.baseRarity<0||data.baseRarity>4)throw new RangeError('기존 슬롯유니크가 아닌 검토용 base 인자 필요');
      const definition=lookupDefinition('UI-10');
      if(definition?.enabled!==false||definition?.status!=='proposal')throw new Error('제안 정의 상태 변경: 별도 인수 필요');
      const item=copyPlainItem(mkItem('armor',data.tier,data.element,data.baseRarity));
      if(Object.hasOwn(item,'uniqueId')||Object.hasOwn(item,'uniqueRoll'))throw new TypeError('fresh mkItem 결과에 기존 binding 존재');
      return createNewIdentifiedD10Instance({...item,uniqueId:'UI-10'},rng);
    },
    serializeItem:copyPlainItem,
    restoreItem:restoreD10Instance,
    readItem:readD10Binding,
    readStoredRoll,
    consumer
  });
}

export const persistenceReviewCallsite=String.raw`function _createD10ProposalForPersistenceReview(request){
  if(!request||request.proposalOnly!==true||request.uniqueId!=='UI-10')throw new TypeError('명시 제안 검토 요청 필요');
  const port=window._d10PersistenceReviewPort;
  if(!port||port.enabled!==false||port.runtimeReady!==false||port.status!=='proposal'||typeof port.createReview!=='function')throw new Error('비활성 저장 검토 포트 미설치');
  return port.createReview(request);
}
function _readD10ProposalForPersistenceReview(item){
  const port=window._d10PersistenceReviewPort;
  if(!port||port.enabled!==false||port.runtimeReady!==false||port.status!=='proposal'||typeof port.readItem!=='function')return null;
  return port.readItem(item);
}`;
