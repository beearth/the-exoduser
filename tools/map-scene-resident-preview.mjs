/* Isolated editor entry preparation. Never changes player, scene, history or saves. */
import {inspectResidentAccess} from './map-scene-resident-access.mjs';

const OBJECT_IDS = new Map([
  ['rift-rest-haran','obj-resident-haran'], ['rift-gift-berin','obj-resident-berin'],
  ['rift-request-nessa','obj-resident-nessa'], ['rift-prepare-dorik','obj-resident-dorik']
]);
const MODE_REASONS = Object.freeze({
  'invalid-query':'보행 검사 함수를 준비하지 못했습니다.',
  'invalid-profile':'주민 레이어 구성이 맞지 않아 보행 시험을 시작할 수 없습니다.',
  unsupported:'현재 씬은 독립 주민 접근점 시험을 지원하지 않습니다.'
});
const STATUS_REASONS = Object.freeze({
  'foot-blocked':'주민 발 위치가 막혀 있어 보행 시험을 시작할 수 없습니다.',
  'start-blocked':'씬 시작점이 막혀 있거나 시작점에서 길로 연결되지 않습니다.',
  'no-route':'씬 시작점에서 이 주민 발 위치로 이어지는 길이 없습니다.',
  'no-approach':'주민에게 이어지는 안전한 접근점을 찾지 못했습니다.'
});
const finitePoint = p => !!p && Number.isFinite(p.x) && Number.isFinite(p.y);

/** Recheck current navigation and body coordinates on every explicit entry request. */
export function prepareResidentPreview(scene, npcId, canWalk) {
  let report = null;
  const rejected = reason => ({ready:false,reason,report});
  try {
    if(typeof npcId!=='string' || !OBJECT_IDS.has(npcId)) return rejected('시험할 주민 ID가 올바르지 않습니다.');
    report = inspectResidentAccess(scene,canWalk);
    if(!report || report.mode!=='independent') return rejected(MODE_REASONS[report?.mode] || '현재 주민 접근 검사 결과를 확인할 수 없습니다.');
    if(!Array.isArray(report.rows)) return rejected('현재 주민 접근 검사 결과를 확인할 수 없습니다.');
    const matches = report.rows.filter(row => row?.npcId===npcId);
    const row = matches.length===1 ? matches[0] : null;
    if(!row || row.objectId!==OBJECT_IDS.get(npcId)) return rejected('현재 주민과 접근 검사 대상이 일치하지 않습니다.');
    if(row.status!=='ready') return rejected(STATUS_REASONS[row.status] || '현재 주민 접근 검사 결과가 준비되지 않았습니다.');
    if(row.footWalkable!==true || row.startConnected!==true || !finitePoint(row.foot) || !finitePoint(row.approach)) return rejected('현재 주민 접근점의 연결과 좌표를 확인할 수 없습니다.');
    return {ready:true,npcId,objectId:row.objectId,player:{x:row.approach.x,y:row.approach.y},foot:{x:row.foot.x,y:row.foot.y},report};
  } catch (_) {
    return rejected('현재 주민 접근 정보를 읽지 못했습니다.');
  }
}
