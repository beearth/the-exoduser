# ANIMVFX-vfx-gl-blend-mode-mismatch-bm1454 — 결과 (2026-10-03)

CH1-1 playable 마일스톤. VFX GL 인스턴싱의 texture 전환/용량/실패 경계를 실제 `_queueVfxGL`→`_flushVfxGL`→호출부 원문으로 비교하던 중 **실효과 왜곡 결함**을 발견했다: **GL 인스턴싱 flush는 블렌드를 additive(`SRC_ALPHA,ONE`)로 고정**하는데 `_queueVfxGL`은 VFX의 `sh.blend`를 받지 않아, **비-'lighter' 블렌드 VFX 5종이 GL 경로에서 틀린 블렌드(가산)로 렌더**된다. 2D 폴백만 `sh.blend`를 지킨다. 최소 라우팅 후보(additive 전용 게이트)와 정상 대조를 실제 실행으로 제출한다.

- `productionApplied=false`, `runtimeAccepted=false`. source 대역(blendFunc/drawImage 호출 관측)이며 **GPU/pixel/화면 PASS 아님(QA 화면 Gate)**.
- 저장 epoch `rolling-after-e764-1445` (ANIMVFX credit 1 — 이번 1산출). 소유 신규 1파일: 이 result.md(검증 코드 임베드). 기제출 폴더 불변. 공유 source/docs/Git·사용자 save 미변경(root 소유 → 후보만 인계).
- 완료 ID 구분: 직전 67aa5b5f(VFX 상호배타 clean)와 **다른 결함**(블렌드 모드 불일치). 기존 VFX/body/hitflash/telegraph 검사 반복 아님.

## 1. 실제 source·SHA (실Read 2026-10-03)
- `game.html` 내용 sha256 `e462f2345682856d…`. Git 미호출.
- 근거 라인:
  - `_flushVfxGL` **game.html:5139** `GL.enable(GL.BLEND);GL.blendFunc(GL.SRC_ALPHA,GL.ONE); // additive` — **블렌드 additive 고정**.
  - `_queueVfxGL` **5119** 시그니처 `(img,sx,sy,sw,sh,x,y,dw,dh,ang,alpha)` — **`sh.blend` 미수신**. 호출부 **52962/45243** `_queueVfxGL(sh.img,…)` — blend 안 넘김.
  - 2D 폴백 **52966/45244** `X.globalCompositeOperation=sh.blend||'lighter'` — 블렌드 준수.
  - 비-'lighter' 등록(실제 registerVFX): `eq_impact`='multiply'(18491), `boss_fireRain`='multiply'(18590), `boss_cageTrap`='source-over'(18614), `death_smoke`='source-over'(18615), `death_blood`='source-over'(18616).

## 2. 실제 실행 결과 (blend 충실도)
실제 `_queueVfxGL`/`_flushVfxGL` + 호출부 실행, draw 시점 blendFunc·2D compositeOperation 관측:

| VFX blend | 현행 경로 | GL draw blendFunc | 2D blend | 의도대로? |
|---|---|---|---|---|
| lighter | GL | `SRC_ALPHA,ONE`(additive) | – | ✅ (additive=lighter 일치) |
| **multiply** | GL | `SRC_ALPHA,ONE` | – | **❌ (가산으로 렌더, multiply 아님)** |
| **source-over** | GL | `SRC_ALPHA,ONE` | – | **❌ (가산으로 렌더, 불투명 아님)** |
| undefined(기본 lighter) | GL | `SRC_ALPHA,ONE` | – | ✅ |

→ `eq_impact`/`boss_fireRain`(multiply→어둡게)이 **밝아지고**, `death_smoke`/`death_blood`/`boss_cageTrap`(source-over→불투명)이 **가산 글로우**로 보인다. `_vfxGLMode` on일 때(용량·텍스처 OK) 이 5종은 **의도와 다른 외형**. 용량/텍스처 실패로 2D 폴백되면 올바른 블렌드 → **같은 VFX가 경로에 따라 다르게 보임**.

## 3. 최소 후보 (라우팅 게이트·미적용)
호출부(52962, 45243)에서 **additive 블렌드 VFX만 GL 경로**로 보내고 나머지는 2D 폴백(정확 블렌드):
```js
// 현행: if(_vfxGLMode&&_queueVfxGL(sh.img,...)){…}else{2D}
// 후보: additive(lighter/기본)만 GL, 그 외는 2D 폴백
if(_vfxGLMode && (!sh.blend || sh.blend==='lighter') && _queueVfxGL(sh.img,...)){ /*GL*/ } else { /*2D: sh.blend 준수*/ }
```
- 대조 실행: 후보 적용 시 multiply/source-over VFX는 2D로 가 `globalCompositeOperation`=해당 블렌드로 정확; 'lighter'/기본은 GL 유지(fast path). 정상 대조 `blend=lighter` 후보도 GL·정확.
- 대안: `_queueVfxGL`에 blend 인자 추가해 비-additive면 `return false`. 호출부 게이트가 더 국소적·최소.
- **asset/수치/프레임/판정 변경 0 — render 라우팅만.** 보호 `2_3`/stage/map geometry/GPU 모드 정책 무관.

## 4. 재현 코드 (임베드, 1산출 내 보존)
```js
// node: /Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node
// 실제 _queueVfxGL/_flushVfxGL + 호출부. draw 시점 blendFunc(2,3=SRC_ALPHA,ONE) 관측.
import fs from 'node:fs';
const G=fs.readFileSync('/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html','utf8');
const grab=(re)=>G.match(re)[0];
const consts=`const _VFX_GL_MAX=${G.match(/_VFX_GL_MAX=(\d+)/)[1]},_VFX_GL_STRIDE=${G.match(/_VFX_GL_STRIDE=(\d+)/)[1]};`;
const queueSrc=grab(/function _queueVfxGL\(img,sx,sy,sw,sh,x,y,dw,dh,ang,alpha\)\{[\s\S]*?\n\}/);
const flushSrc=grab(/function _flushVfxGL\(\)\{[\s\S]*?\n\}/);
function observe({blend, candidateGate}){
  const f=new Function('bands','sh',`
    ${consts}
    const _vfxGLCpu=new Float32Array(_VFX_GL_MAX*_VFX_GL_STRIDE);
    let _vfxGLProg={},_vfxGLVao={},_vfxGLInstVBO={},_vfxGLURes={},_vfxGLUTex={},_glMainProg={};
    let _vfxGLCount=0,_vfxGLMode=true,_vfxGLCurTex=null,_dbgVfxGLDrawn=0;
    const _useGL=true,VW=1280,VH=800; const _DCP={on:false,_onInst(){}}; const _flush=()=>{};
    const _getTex=(img)=>({__t:img&&img.__id});
    const GL={BLEND:1,SRC_ALPHA:2,ONE:3,ONE_MINUS_SRC_ALPHA:4,ARRAY_BUFFER:5,TEXTURE0:6,TEXTURE_2D:7,TRIANGLE_STRIP:8,
      enable(){},blendFunc(s,d){bands.curBlend=s+','+d;},useProgram(){},bindVertexArray(){},bindBuffer(){},bufferSubData(){},activeTexture(){},bindTexture(){},uniform1i(){},uniform2f(){},drawArraysInstanced(){bands.glDraw++;bands.glDrawBlend=bands.curBlend;}};
    ${queueSrc}
    ${flushSrc}
    const v={x:100,y:200,ang:0}; const _sx=0,_sy=0,dw=256,dh=256,_vAlpha=0.8; const G_cam={x:0,y:0};
    const X={save(){},restore(){},translate(){},rotate(){},set globalAlpha(x){},set globalCompositeOperation(x){bands.twoDBlend=x;},drawImage(){bands.twoDDraw++;}};
    const addGate = bands.candidateGate ? (!sh.blend||sh.blend==='lighter') : true;
    if(_vfxGLMode && addGate && _queueVfxGL(sh.img,_sx,_sy,sh.fw,sh.fh,VW*.5+(v.x-G_cam.x),VH*.5+(v.y-G_cam.y),dw,dh,v.ang||0,_vAlpha)){}
    else{ X.save();X.globalCompositeOperation=sh.blend||'lighter';X.globalAlpha=_vAlpha;X.translate(v.x,v.y);if(v.ang)X.rotate(v.ang);X.drawImage(sh.img,_sx,_sy,sh.fw,sh.fh,-dw/2,-dh/2,dw,dh);X.restore(); }
    _flushVfxGL();
  `);
  const bands={curBlend:null,glDrawBlend:null,twoDBlend:null,glDraw:0,twoDDraw:0,candidateGate};
  f(bands,{img:{__id:'x',width:512,height:512},fw:512,fh:512,blend});
  const path=bands.glDraw>0?'GL':'2D';
  const correct = path==='GL' ? (blend==='lighter'||blend===undefined) : (bands.twoDBlend===(blend||'lighter'));
  return {path, glDrawBlend:bands.glDrawBlend, twoDBlend:bands.twoDBlend, correct};
}
for(const b of ['lighter','multiply','source-over',undefined]){
  console.log('cur ', String(b), JSON.stringify(observe({blend:b,candidateGate:false})));
  console.log('cand', String(b), JSON.stringify(observe({blend:b,candidateGate:true})));
}
```
관측 stdout:
```
cur  lighter     {"path":"GL","glDrawBlend":"2,3","correct":true}
cur  multiply    {"path":"GL","glDrawBlend":"2,3","correct":false}   ← 결함
cur  source-over {"path":"GL","glDrawBlend":"2,3","correct":false}   ← 결함
cur  undefined   {"path":"GL","glDrawBlend":"2,3","correct":true}
cand multiply    {"path":"2D","twoDBlend":"multiply","correct":true}   ← 후보 수정
cand source-over {"path":"2D","twoDBlend":"source-over","correct":true}
```

## 5. docs 인계 (root 순차, rg 동기화)
docs 키워드(`_queueVfxGL|_flushVfxGL|blendFunc|sh.blend|multiply`) 기준:
| 정본 | 문안 |
|---|---|
| `docs/5.1임펙트디자인/ANIMATION_VFX_TEAM_MASTER.md` | VFX GL 인스턴싱 flush는 `SRC_ALPHA,ONE` 가산 고정이나 `_queueVfxGL`이 `sh.blend` 미수신 → multiply(eq_impact/boss_fireRain)·source-over(death_smoke/death_blood/boss_cageTrap)가 GL 경로에서 가산으로 오렌더, 2D 폴백만 정확. 후보: 호출부 additive 게이트(비-lighter는 2D). asset/수치 변경 없음 |
| `docs/5.1임펙트디자인/VFX_구현가이드.md` | registerVFX blend 7번째 인자가 2D에만 적용되고 GL 인스턴싱엔 무시됨을 명시. GL 경로는 additive 전용으로 라우팅 권장 |

보호 `2_3`/Q-only magic/attack-ticket 유지.

## 6. PASS·의존성·Gate
- **source/fixture(실행) 근거**: 비-'lighter' 5종 열거(실 registerVFX), GL draw blendFunc=2,3(additive) 관측, 현행 multiply/source-over 정확=false, 후보 2D 라우팅 정확=true.
- **의존성**: 없음(VFX 소유 단독). QA(실제 화면에서 가산 오렌더 체감), BUILD(공용 적용은 root).
- **Gate**: 실제 GPU 블렌드·화면 외형은 QA 화면 Gate. game.html/easy 적용·공유 docs·Git은 root 슬롯. (easy도 `_queueVfxGL`/flush 동형 추정이나 별도 확인은 root.)
- credit 1 소진. changes 80 미만. 이후 새 파일 0, 다음 독립 경계(텍스처 전환 중간 flush의 draw 순서 vs 2D 폴백 interleave 순서 — additive 교환법칙으로 무해 여부 확정)를 메모리로 이어감.

## 재현
```sh
cd /Users/fordeargamers/Projects/exoduser-migration-20261001
# §4 코드를 .mjs로 저장 후:
/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node <file>.mjs
```
source 대역(blendFunc/drawImage 호출)이며 실제 GPU 블렌드/픽셀/화면 PASS가 아니다.
