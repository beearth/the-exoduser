// dialogue-pose-arbitration-2_5d.v3.candidate.mjs
// SKILL 역할 (UUID ec0868f8-7ba5-42f8-b7ca-20e63d4ebda4) — CH1-RIFT-QUALITY-NEXT-20261007.
// OFFICIAL-COMPLETION-ID: CH1-RIFT-QUALITY-NEXT-20261007-DIALOGUE-POSE-V3-CANDIDATE
// GOAL: CH1-RIFT-QUALITY-NEXT-20261007
//
// v3 개선(구체 source 개선 후보1): 소비 대상을 "실제 public" tools/2_5d/visual-pose-consumer.mjs 로 교체.
//   · 그 public 은 skill.poseMode∈{idle,walk,run} 를 explicitMode 로 실제 적용(:115/:133) — v2가 쓰던
//     team-followup 후보의 run→idle 누락이 해소됨. (public consumer 재구현 0, import 소비만.)
//   · public resolve 는 top-level `attackRemaining` 반환(:140), snapshot 도 top-level(:151) → rootlab 일치.
//   · public resolve 는 facing 이 0..7 정수가 아니면 throw(:100) → 어댑터가 finite facing 만 전달/아니면 생략.
//
// v2 대비 수정점:
//   1) 대화 중 NEUTRAL 이 intent.facing 을 버리던 문제 → finite facing(0..7)을 그대로 전달(얼굴 방향 유지/대면).
//   2) attackRemaining 을 어댑터 반환/snapshot 에 top-level 로 노출(중첩 .pose 아님).
//   3) provider getter(accessor)·상속 thenable·supported accessor 를 UNKNOWN 으로 분리.
//
// 역할 경계(SKILL = visual pose 소비만): 대화 node/세션/선택/grant/quest/save 는 STORY/root 소유 — 읽기만.
//   전투/cost/timer/combat 값·입력 키 바인딩 쓰기 0. Q-only magic/E 패링불가/어택티켓/보호2_3/기존23 보존.
//
// 실제 대화 계약(읽기): tools/2_5d/interaction-cue-lifetime.mjs:174 isOpen(boolean),:187 view.npcId,
//   :175 supported(있으면 true),:30 hardened own-data-prop(accessor/thenable/비객체 거부). nodeId 는 view 내.

import { createVisualPoseConsumer } from '../../../2_5d/visual-pose-consumer.mjs';

const isObject = v => v !== null && (typeof v === 'object' || typeof v === 'function');
// own-data-prop 만. accessor 면 {accessor:true}. 없으면 {has:false}.
function ownData(o, key){ if(!isObject(o)||Array.isArray(o)) return {has:false}; const d=Object.getOwnPropertyDescriptor(o,key); if(!d) return {has:false}; if(!Object.hasOwn(d,'value')) return {has:false,accessor:true}; return {has:true,value:d.value}; }
// 상속 포함 thenable 탐지(프로토타입 체인). accessor then 도 thenable 취급.
function hasInheritedThenable(o){ try{ let p=o; for(let i=0;isObject(p)&&i<16;i++){ const d=Object.getOwnPropertyDescriptor(p,'then'); if(d){ if(typeof d.get==='function')return true; if(Object.hasOwn(d,'value')&&typeof d.value==='function')return true; } p=Object.getPrototypeOf(p); } }catch(_){ return true; } return false; }
const idOrNull = v => (typeof v==='string'&&v) ? v : (v==null ? null : String(v));
const finiteDir = v => (Number.isInteger(v)&&v>=0&&v<=7) ? v : undefined; // public resolve throw 회피

// 현행 대화 계약 읽기: {isOpen:boolean, view:{npcId,nodeId}, supported?:true}. 위반 → UNKNOWN(닫힘 취급).
function readDialogueV3(portOrSnap){
  try{
    let s=null;
    if(typeof portOrSnap==='function') s=portOrSnap();
    else if(isObject(portOrSnap)&&typeof portOrSnap.snapshot==='function') s=portOrSnap.snapshot();
    else s=portOrSnap;
    if(!isObject(s)||Array.isArray(s)) return U(['dialogue-state-missing'],false);
    if(hasInheritedThenable(s)) return U(['dialogue-async-thenable'],false);       // 상속 thenable 포함
    const sup=ownData(s,'supported');
    if(sup.accessor) return U(['supported-accessor'],false);                        // supported getter → UNKNOWN
    if(sup.has && sup.value!==true) return U(['dialogue-unsupported'],false);
    const io=ownData(s,'isOpen');
    if(io.accessor) return U(['isOpen-accessor'],false);                            // isOpen getter → UNKNOWN
    if(!io.has || typeof io.value!=='boolean') return U(['isOpen-malformed'],false);
    if(!io.value) return { ok:true, open:false, npcId:null, nodeId:null, key:null, unknown:[] };
    const vd=ownData(s,'view');
    if(vd.accessor) return { ok:false, open:true, npcId:null, nodeId:null, key:'open|accessor-view', unknown:['view-accessor'] };
    if(!vd.has || !isObject(vd.value)) return { ok:false, open:true, npcId:null, nodeId:null, key:'open|unknown-view', unknown:['view-malformed'] };
    const npcD=ownData(vd.value,'npcId'), nodeD=ownData(vd.value,'nodeId');
    const npcId=npcD.accessor?null:idOrNull(npcD.value), nodeId=nodeD.accessor?null:idOrNull(nodeD.value);
    const unknown=[]; if(npcD.accessor)unknown.push('view-npcId-accessor'); else if(npcId==null)unknown.push('view-npcId-missing');
    return { ok:true, open:true, npcId, nodeId, key:`${npcId??''}|${nodeId??''}`, unknown };
  }catch(_){ return U(['dialogue-read-threw'],false); }
  function U(unknown,open){ return { ok:false, open:!!open, npcId:null, nodeId:null, key:null, unknown }; }
}

/**
 * createDialoguePoseArbiter(id, { retrigger?, dialogue? })
 * 반환: { resolve, drive, onActorChange, onBlur, reset, release, snapshot, id }
 *   resolve → { params, supported, arbitration, attackRemaining(top-level), dialogue, providersUnknown }
 */
export function createDialoguePoseArbiter(id, opts = {}){
  const pose = createVisualPoseConsumer(id, { retrigger: opts.retrigger === true });
  const dialoguePort = opts.dialogue ?? null;
  let suspended=false, lastKey=null;

  function resolve(dt, intent = {}, dialogueOverride){
    const d = readDialogueV3(dialogueOverride!==undefined ? dialogueOverride : dialoguePort);
    const providersUnknown = d.unknown.slice();
    if (d.open){
      if (!suspended){ pose.release(); suspended=true; lastKey=d.key; }
      else if (d.key!==lastKey){ pose.release(); lastKey=d.key; }
    } else if (suspended){ pose.release(); suspended=false; lastKey=null; }

    let r;
    if (suspended){
      // v3: finite facing 전달(얼굴 방향 유지/대면). 이동·공격만 버리고 facing 은 보존.
      const neutral = { dx:0, dy:0, run:false, attack:false };
      const f = finiteDir(intent.facing);
      if (f!==undefined) neutral.facing = f;
      r = pose.resolve(dt, neutral);
    } else {
      r = pose.resolve(dt, intent);
    }
    return Object.freeze({
      params: r.params, supported: r.supported,
      arbitration: suspended ? 'suspended' : 'active',
      attackRemaining: r.attackRemaining,                       // top-level (rootlab 일치)
      dialogue: Object.freeze({ open:d.open, npcId:d.npcId, nodeId:d.nodeId, key:d.key }),
      providersUnknown,
    });
  }
  function drive(rig, dt, intent, dialogueOverride){
    if(!rig || typeof rig.update!=='function') throw new Error('rig.update API 필요');
    const r=resolve(dt,intent,dialogueOverride); rig.update(dt,r.params);
    return Object.freeze({ ...r, object3d: rig.object3d });
  }
  function release(reason){ pose.release(); suspended=false; lastKey=null; return snapshot(reason); }
  const onActorChange = () => release('actor-change');
  const onBlur        = () => release('blur');
  const reset         = () => release('reset');
  function snapshot(reason){
    const ps = pose.snapshot();
    return Object.freeze({ id, suspended, lastDialogueKey:lastKey, lastReason: reason??null,
      attackRemaining: ps.attackRemaining, direction: ps.direction, mode: ps.mode }); // top-level attackRemaining
  }
  return Object.freeze({ resolve, drive, onActorChange, onBlur, reset, release, snapshot, id });
}

export default { createDialoguePoseArbiter };

/* ── 인라인 자가검증 (node stdin 1회; FAIL→nonzero). 실제 public API 소비 ── */
function _selfTest(){
  let pass=0, fail=0; const ok=(n,c)=>{ c?pass++:(fail++,console.error('FAIL:',n)); };
  const open=(npcId='rift-rest-haran',nodeId='meet')=>({ isOpen:true, view:{npcId,nodeId} });
  const shut=()=>({ isOpen:false, view:null });

  // 실제 public 소비: poseMode='run' 정상 적용(v2 run→idle 버그 해소 확인)
  const aR=createDialoguePoseArbiter('warrior',{dialogue:shut});
  ok('public poseMode run applied (not idle)', aR.resolve(0.1,{dx:0,dy:0,skill:{id:'sprint',poseMode:'run'}}).params.mode==='run');

  // v3-1: 대화 중 finite facing 전달(기존 방향 버림 수정). facing6 → direction 6
  let dlg=shut(); const a=createDialoguePoseArbiter('warrior',{dialogue:()=>dlg});
  a.resolve(0.1,{dx:1,dy:0}); // 동쪽 dir2 로 설정
  dlg=open();
  const rf=a.resolve(0.1,{facing:6, attack:true});
  ok('dialogue neutral keeps supplied facing6', rf.params.direction===6 && rf.params.mode==='idle' && rf.arbitration==='suspended');

  // v3-2: top-level attackRemaining (중첩 아님)
  const at=createDialoguePoseArbiter('warrior',{dialogue:shut});
  const ra=at.resolve(0.1,{attack:true});
  ok('resolve top-level attackRemaining>0', typeof ra.attackRemaining==='number' && ra.attackRemaining>0);
  ok('snapshot top-level attackRemaining', typeof at.snapshot().attackRemaining==='number');

  // v3-3: provider getter/inherited-thenable/supported-accessor → UNKNOWN
  const gIsOpen={}; Object.defineProperty(gIsOpen,'isOpen',{get(){return true;},enumerable:true});
  ok('isOpen getter → UNKNOWN', createDialoguePoseArbiter('warrior',{dialogue:()=>gIsOpen}).resolve(0.1,{}).providersUnknown.includes('isOpen-accessor'));
  const proto={}; Object.defineProperty(proto,'then',{value(){},enumerable:false}); const inh=Object.create(proto); inh.isOpen=true; inh.view={npcId:'x',nodeId:'y'};
  ok('inherited thenable → UNKNOWN', createDialoguePoseArbiter('warrior',{dialogue:()=>inh}).resolve(0.1,{}).providersUnknown.includes('dialogue-async-thenable'));
  const gSup={isOpen:true,view:{npcId:'x',nodeId:'y'}}; Object.defineProperty(gSup,'supported',{get(){return true;},enumerable:true});
  ok('supported accessor → UNKNOWN', createDialoguePoseArbiter('warrior',{dialogue:()=>gSup}).resolve(0.1,{}).providersUnknown.includes('supported-accessor'));

  // 대화 종료·char·blur·reset → 이전 공격 복귀0
  let d2=shut(); const a2=createDialoguePoseArbiter('warrior',{dialogue:()=>d2});
  a2.resolve(0.1,{attack:true}); d2=open();
  ok('enter clears stale attack', a2.resolve(0.1,{}).params.mode==='idle' && a2.snapshot().attackRemaining===0);
  d2=shut();
  ok('exit resume + fresh attack', a2.resolve(0.1,{}).params.mode==='idle' && a2.resolve(0.1,{attack:true}).params.mode==='attack');
  const a3=createDialoguePoseArbiter('warrior',{dialogue:shut});
  a3.resolve(0.1,{attack:true}); a3.onActorChange(); ok('onActorChange→0', a3.snapshot().attackRemaining===0);
  a3.resolve(0.1,{attack:true}); a3.onBlur();        ok('onBlur→0',        a3.snapshot().attackRemaining===0);
  a3.resolve(0.1,{attack:true}); a3.reset();          ok('reset→0',         a3.snapshot().attackRemaining===0);

  // invalid facing(9/2.5) → 전달 생략(throw 회피), 기존 방향 유지
  let d3=open(); const a4=createDialoguePoseArbiter('warrior',{dialogue:()=>d3});
  a4.resolve(0.1,{dx:1,dy:0}); // dir2 (open 전 1프레임? open이라 suspend; 방향은 release 후 유지)
  const bad=a4.resolve(0.1,{facing:9});
  ok('invalid facing omitted (no throw)', Number.isInteger(bad.params.direction));

  // drive: 대화 중 중립+facing 전달
  let cap=null; const mock={object3d:{t:'o'},update:(dt,p)=>{cap=p;return mock.object3d;}};
  const a5=createDialoguePoseArbiter('silvertail',{dialogue:()=>open()});
  a5.drive(mock,0.1,{facing:4, dx:1,dy:0});
  ok('drive during open neutral+facing4', cap.mode==='idle' && cap.direction===4);

  // provider 쓰기 메서드 호출 0
  let wrote=false; const spy={isOpen:true,view:{npcId:'x',nodeId:'y'},choose(){wrote=true;},grant(){wrote=true;},close(){wrote=true;}};
  const a6=createDialoguePoseArbiter('warrior',{dialogue:spy}); a6.resolve(0.1,{attack:true}); a6.resolve(0.1,{});
  ok('no write on dialogue provider', wrote===false);

  console.log(`dialogue-pose-arbitration-2_5d.v3 self-test: ${pass} pass, ${fail} fail`);
  return fail===0;
}
if (typeof process!=='undefined' && process.argv && process.argv[1] &&
    process.argv[1].endsWith('dialogue-pose-arbitration-2_5d.v3.candidate.mjs')){
  const okAll=_selfTest(); if(typeof process.exit==='function') process.exit(okAll?0:1);
}
