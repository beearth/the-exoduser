# ANIMVFX-blend-painter-combined-bp1551 — 결과 (2026-10-03)

CH1-1 playable 마일스톤. 미해결 두 후보 — **1454(비-additive VFX의 GL additive 오렌더 → 2D 라우팅)** 와 **1529(GL 배치 flush ↔ 2D 폴백 interleave painter-order 역전)** — 를 **단일 활성 caller(VFX draw 루프)** 에서 1519 단일-표면 2버퍼 아키텍처로 결합해, `GL backlog flush → 2D 비-additive draw → 다음 GL enqueue` 순서가 foreground ordering을 보존하는지 **실제 `_queueVfxGL`/`_flushVfxGL` 실행**으로 관측했다. **1454 단독 적용이 1529 역전을 유발**하며, **결합(1454+1529)만** 블렌드 정확성과 순서를 동시에 보존함을 확인(기존 결함 보강).

- `productionApplied=false`, `runtimeAccepted=false`. GL/GPU/native/화면 실행 0 — draw-call 순서/블렌드 라우팅 **source 관측**이며 pixel/visual PASS 아님(**QA 화면 Gate**). fixture ≠ playable.
- 저장 epoch `root-73620278-claude8-1530` (ANIMVFX credit 1 — 이번 1산출, used 0→1). 소유 신규 1파일: 이 result.md(검증 코드 임베드). 기제출 폴더/타팀 credit 불변. 공유 source/docs/Git·stage/map 미변경(root 소유 → 후보만 인계).
- 정정 유지: `_shDirty`는 적 공간해시(셰이더 아님). 이미 NOFIX인 프로그램/텍스처/EBO/context-큐 재검사 안 함.

## 1. 아키텍처 전제(1519 인수)
단일 캔버스 C(WebGL2). `X.drawImage`(2D 폴백)→**메인 quad 버퍼**(즉시 아님), `_queueVfxGL`→**VFX 인스턴싱 버퍼**. `_flushVfxGL`(game.html:5138)=`_flush()`(메인 버퍼 drain) **먼저** → VFX 배치 draw. 즉 한 flush 지점에서 **메인(2D)이 VFX(GL)보다 먼저** 그려진다.

## 2. 실제 실행 결과 (real `_queueVfxGL`/`_flushVfxGL`)
배열 순서 `A(additive) , B(source-over) , C(additive)` (동일 위치/텍스처, 자연 interleave):

| 정책 | draw 순서 | painter 역전 | B(source-over) 블렌드 |
|---|---|---|---|
| **current**(전부 GL) | A , B , C | 없음 | **GL additive 오렌더(틀림)** |
| **1454-only**(비-additive→2D) | **2D:B , GL:A , GL:C** | **A↓B(역전)** | 2D 정확 |
| **combined**(1454 + 1529: 2D 폴백 전 `_flushVfxGL`) | **GL:A , 2D:B , GL:C** | **없음** | 2D 정확 |

- **current**: VFX 버퍼에 전부(모두 additive 강제) → 삽입 순서 보존되나 B 블렌드 오렌더(1454).
- **1454-only**: B→메인 버퍼, A/C→VFX 버퍼. 프레임끝 `_flushVfxGL`가 메인(B) 먼저 → VFX 배치(A,C) → **A가 B보다 늦게**(A↓B). 블렌드는 맞지만 **foreground ordering 깨짐**.
- **combined**: 2D 폴백(B) **직전에 `_flushVfxGL`** → 앞선 VFX(A) 먼저 draw → 이어 B(메인) → C(VFX). 순서 A,B,C 보존 + B 블렌드 정확.

→ **1454 후보는 1529 동반 없이는 painter-order를 깨뜨린다**(자연 활성 경로: 비-additive death_blood/death_smoke/eq_impact가 additive 히트 VFX와 `_vfxAnims` 순서로 섞일 때). 두 후보는 **함께** 적용해야 한다.

## 3. 결합 최소 후보 (미적용)
호출부(VFX draw 루프 game.html:52929~, 미러 45243)에서:
```js
// (1454) additive(lighter/기본)만 GL, 비-additive는 2D 폴백(sh.blend 준수)
// (1529) 2D 폴백 draw 직전 _flushVfxGL()로 앞선 GL 배치를 먼저 비워 painter order 보존
const additive=(!sh.blend||sh.blend==='lighter');
if(_vfxGLMode && additive && _queueVfxGL(sh.img,...)){ /* GL 버퍼 */ }
else { _flushVfxGL(); /* 앞선 VFX 먼저 */ X.save(); X.globalCompositeOperation=sh.blend||'lighter'; ...X.drawImage...; X.restore(); }
```
- 비용: 2D 폴백마다 `_flushVfxGL`(early-return 가드로 빈 배치면 no-op) → 배치 파편화(성능). 정확성 우선.
- 보존(1519/1525/1536 인수): `_flushVfxGL` early-return·save-restore·blend 복원·뒤큐 원자성 유지, queue 실패 원자성 NOFIX. asset/수치/판정/stage/map 불변 — **render 라우팅+flush 순서만**.

## 4. 재현 코드(임베드) + stdout
```js
// node; 실제 _queueVfxGL/_flushVfxGL + 메인/VFX 2버퍼 + caller 디스패치. 전역 draw 순서 관측.
import fs from 'node:fs';
const G=fs.readFileSync('/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html','utf8');
const consts=`const _VFX_GL_MAX=${G.match(/_VFX_GL_MAX=(\d+)/)[1]},_VFX_GL_STRIDE=${G.match(/_VFX_GL_STRIDE=(\d+)/)[1]};`;
const queueSrc=G.match(/function _queueVfxGL\(img,sx,sy,sw,sh,x,y,dw,dh,ang,alpha\)\{[\s\S]*?\n\}/)[0];
const flushSrc=G.match(/function _flushVfxGL\(\)\{[\s\S]*?\n\}/)[0];
function run(policy){
  const seq=[],mainBuf=[],vfxPending=[];
  const f=new Function('bands','vfxList','policy',`
    ${consts}
    const _vfxGLCpu=new Float32Array(_VFX_GL_MAX*_VFX_GL_STRIDE);
    let _vfxGLProg={},_vfxGLVao={},_vfxGLInstVBO={},_vfxGLURes={},_vfxGLUTex={},_glMainProg={};
    let _vfxGLCount=0,_vfxGLMode=true,_vfxGLCurTex=null,_dbgVfxGLDrawn=0;
    const _useGL=true,VW=1280,VH=800; const _DCP={on:false,_onInst(){}};
    const _flush=()=>{ for(const id of bands.mainBuf) bands.seq.push('2D:'+id); bands.mainBuf.length=0; };
    const _getTex=(img)=>({__t:img&&img.__id});
    const GL={BLEND:1,SRC_ALPHA:2,ONE:3,ONE_MINUS_SRC_ALPHA:4,ARRAY_BUFFER:5,TEXTURE0:6,TEXTURE_2D:7,TRIANGLE_STRIP:8,
      enable(){},blendFunc(){},useProgram(){},bindVertexArray(){},bindBuffer(){},bufferSubData(){},activeTexture(){},bindTexture(){},uniform1i(){},uniform2f(){},
      drawArraysInstanced(){ for(const id of bands.vfxPending) bands.seq.push('GL:'+id); bands.vfxPending.length=0; }};
    ${queueSrc}
    ${flushSrc}
    for(const v of vfxList){
      const sh={img:{__id:'X',width:512,height:512},fw:512,fh:512,blend:v.blend};
      const additive=(!sh.blend||sh.blend==='lighter');
      const routeGL=(policy==='current')?true:additive;
      if(policy==='combined' && !routeGL){ _flushVfxGL(); }
      if(_vfxGLMode && routeGL && _queueVfxGL(sh.img,0,0,sh.fw,sh.fh,100,200,256,256,0,0.8)) bands.vfxPending.push(v.id);
      else bands.mainBuf.push(v.id);
    }
    _flushVfxGL();
  `);
  const bands={seq,mainBuf,vfxPending};
  f(bands,[{id:'A',blend:'lighter'},{id:'B',blend:'source-over'},{id:'C',blend:'lighter'}],policy);
  return seq.join(' , ');
}
for(const p of ['current','1454only','combined']) console.log(p, run(p));
```
stdout:
```
current   GL:A , GL:B , GL:C
1454only  2D:B , GL:A , GL:C      ← A↓B 역전
combined  GL:A , 2D:B , GL:C      ← 보존
```

## 5. docs 인계 (root 순차, rg 동기화)
| 정본 | 문안 |
|---|---|
| `docs/5.1임펙트디자인/ANIMATION_VFX_TEAM_MASTER.md` | 1454(비-additive→2D 블렌드 정정)와 1529(painter-order)는 **상호 의존**: 1454 단독 적용 시 `_flushVfxGL`의 메인-먼저-VFX-나중 drain으로 비-additive 2D가 앞선 additive GL보다 먼저 그려져 **A↓B 역전**. 결합(2D 폴백 전 `_flushVfxGL`)만 블렌드+순서 동시 보존. 둘 다 미적용, 함께 검토 |
| `docs/5.1임펙트디자인/VFX_구현가이드.md` | VFX GL/2D 혼합 시 painter order는 삽입 순서가 아니라 버퍼 flush 순서에 좌우; 비-additive 폴백 도입 시 2D 전 VFX flush 필요 |

보호 `2_3`/Q-only/attack-ticket/맵가이드/LOCK/SSOT 유지.

## 6. PASS·소유·Gate
- **source/fixture(실행) 근거**: current(순서 보존·블렌드 오렌더) / 1454-only(블렌드 정확·역전) / combined(둘 다 보존) 실제 `_queueVfxGL`/`_flushVfxGL` 실행 관측.
- 소유 pins: `_queueVfxGL` game.html:5119-5135, `_flushVfxGL`:5136-5151(5138 `_flush()` 선행), VFX draw 루프 caller:52929~/52962, 미러 45243. game.html 내용 SHA `e462f2345682856d…`(비-git shasum, 변동 가능 명시).
- **미확정 Gate**: 실제 GPU 합성/화면 외형·역전의 시각 유의성은 QA 화면 Gate. 공용 source/easy/docs/Git은 root 슬롯. (easy 미러 별도 확인은 root.)
- credit 1 소진. changes 100 임박 → 이후 새 파일 0, 다음 독립 백로그를 git 없이 STATE만 읽으며 메모리로 계속. 완료 ID는 JSONL end.

## 재현
```sh
cd /Users/fordeargamers/Projects/exoduser-migration-20261001
# §4 코드를 .mjs로 저장 후:
/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node <file>.mjs
```
source 관측(draw 호출 순서/블렌드 라우팅)이며 실제 GPU/픽셀/화면 PASS가 아니다.
