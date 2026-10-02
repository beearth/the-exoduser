# ANIMVFX-sheet-frame-metadata-bounds-hb1014 — 결과 (2026-10-02)

등록 VFX sheet의 **실이미지(PNG/WebP 헤더) ↔ 프레임 메타데이터(fw/fh/frames/cols) 경계**를 검증했다. 양판 `registerVFX` 함수와 실제 draw frame-crop 표현을 **원문 그대로 추출·실행**하고(대역=Image·파일헤더 파서), 마지막 소비 frame(`frames-1`)의 crop이 `naturalWidth/height` 밖이거나 `cols`가 0/NaN이 되는 콘텐츠 결손을 탐지했다. **정상 control 1 + invalid metadata 변이 control 1**로 validator 자체를 입증했다. **검수 6/6 PASS, exit 0.**

- **결과: 해석 가능한 35개 sheet 중 프레임 경계 결손 0건.** 단 **28개 boss VFX 등록이 실파일 부재(MISSING)** → UNKNOWN(통과 아님). 아래 §3.
- `productionApplied=false`, `runtimeAccepted=false`. source/fixture PASS ≠ 실게임/native/GPU픽셀/배포 PASS.
- 소유 신규 2파일: 이 폴더 `checks.mjs`·`result.md`. 별도 evidence/log/patch 파일 없음(증거는 본 result에 내포). 생산·공유docs·기존test·타팀산출·Git·이미지·서버 변경 0.

## 1. 수신·실행·SHA·대역

| 항목 | 값 |
|---|---|
| taskId | supervisor-next/ANIMVFX/ANIMVFX-sheet-frame-metadata-bounds-hb1014 |
| 실행 Node | `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node` (v24.15.0) |
| 실행 UTC | 시작 `2026-10-02T10:47:05.048Z` → 종료 `…10:47:05.088Z`, exit **0** |
| game.html 내용 sha256(실Read) | `8b4653f3f7282cf2…` |
| game-easy-test.html 내용 sha256 | `50f9a24bb11d95bd…` |
| `registerVFX` slice sha256(양판 동일) | `42225ef49dc5ddb4…` |
| draw crop slice sha256(양판 동일) | `236c5ef5685fd953…` |
| Git | **조회 0**(계약). parent 제공 `6b865637`은 역사적 기준이며 currentHEAD로 쓰지 않음 |

- **실제 source 경계**: `registerVFX(id,src,fw,fh,frames,cols,blend)` (game `18469–18473`), 저장 `_VFX_SHEETS[id]={img,fw,fh,frames,cols:cols||Math.floor(img.width/fw),blend}`. draw 소비(game `52947–52948`): `col=v.frame%sh.cols, row=~~(v.frame/sh.cols); _sx=col*sh.fw, _sy=row*sh.fh;` 상한 `if(v.frame>=v.maxFrames)continue;`(52935) → 마지막 소비 frame = `frames-1`.
- **명시 대역**: `Image`는 `src` 설정+`onload` 할당이 모두 끝나고 dims를 알 때 1회 onload 발화(브라우저 async 모사). dims는 실제 PNG/WebP 파일 헤더 파싱값을 주입 → `registerVFX`의 `cols` 폴백까지 원문대로 계산. 셰이더/GL/실픽셀 없음. `mode0?draw0`·가짜 counter 미사용.
- **이미지 파서(실제 파일 읽기)**: PNG(IHDR w/h), WebP(VP8/VP8L/VP8X). 그 외/파일부재 = **UNKNOWN**(통과로 세지 않음).

## 2. 경계 공식과 탐지 규칙

이미지 `W×H`, 메타 `fw,fh,frames,cols`에 대해:
- 저장 `cols = cols || floor(W/fw)`. **결손**: `cols<=0` 또는 `NaN`.
- 마지막 frame `f=frames-1` → `col=f%cols`, `row=⌊f/cols⌋`, `sx=col·fw`, `sy=row·fh`.
- **결손**: `sx+fw > W`(x 오버플로) 또는 `sy+fh > H`(y 오버플로) → 마지막 프레임 crop이 이미지 밖 → 빈/깨진 프레임 소비.

## 3. 실제 관측 — defect / UNKNOWN / 정상

| 분류 | 수 | 내용 |
|---|---|---|
| 정상(OK) | **35** | 해석된 모든 sheet에서 마지막 frame crop이 이미지 안에 들어옴. 결손 0 |
| 결손(DEFECT) | **0** | 현재 shipped sheet에 프레임 경계 결손 없음 |
| UNKNOWN | **28** | `assets/vfx/boss/boss_*.webp` 전부 **파일 부재(MISSING)** → 치수 미해석, 경계 판정 불가 |

**정상 35 예시**: `eq_impact`(1536×1536, 9f/3c), `magic_burst`, `fire_burst`(webp), `ice_slash`(128²,19f/19c), `parry_impact*`, `druid_*`, `death_*` 등.

**UNKNOWN 28(실제 content 결손, 경계와 별개로 보고)**: `boss_judgeCut/phantomSwords/seekerMines/shockGrid/donutSlam/crossWipe/lavaPools/fireRain/fanWave/radialLaser/pillars/darkZone/tideWave/rewindMark/gravityWell/wallPush/chainLights/orbWeave/soulAnchor/mirrorClone/fissure/safeCorner/tidalWipe/poisonPool/doppelganger/gSlamWave/gwPillar/gwLightning` — 모두 `assets/vfx/boss/boss_<id>.webp`를 `registerVFX`로 **활성 등록하나 파일이 실제 없음**(해당 디렉터리엔 `boss_cageTrap.webp` 하나만 존재).
- **런타임 귀결(원문 근거)**: `img.src=없는파일` → `onload` 미발화 → `_VFX_SHEETS[id]` 미생성 → `playVFXAng` 초입 `if(!_VFX_SHEETS[id])return;`(18475)로 **조용히 미재생**. 크래시/404 외 추가 오류는 없으나 해당 보스 VFX는 등록만 되고 출력되지 않는다. 의도(절차적 폴백)일 수 있어 단정하지 않으며, **에셋 공급 또는 등록 정리 여부는 ART/총괄 결정 Gate**로 인계한다.
- **부가 관측**: `boss_cageTrap`이 **중복 등록**(동일 id 2회 `registerVFX`) — 마지막 등록이 승리. 기능상 무해하나 정리 대상.

## 4. Control (validator 입증 — 정상 없이 PASS 금지)

| control | 입력 | 기대 | 실제 |
|---|---|---|---|
| 정상 | `eq_impact` 실메타(1536×1536, fw512,fh512,frames9,cols3) | 결손 없음 | **OK** (마지막 f8→col2,row2→needWH 1536×1536 = 이미지 정확 일치) |
| invalid 변이 | `eq_impact`의 frames를 `cols×⌊H/fh⌋+1=10`으로 변이 | 결손 탐지 | **DEFECT**, `yOver=true` (f9→row3→needH 2048 > 1536) |

→ validator가 실제 crop 계산으로 결손을 탐지함을 입증(가짜 counter 아님). 이미지/원 frame 수는 변경하지 않았다(변이는 control 전용 합성 입력).

## 5. 최소 memory 후보 (미적용, 결손 0이므로 예방적)

현재 실제 경계 결손이 0이므로 **수정할 defect는 없다**(no-fix). 다만 TASK가 요구한 최소 guard 후보를 정의해 control로 검증했다 — **생산 미적용, 예방적**:

- **loader guard(registerVFX onload 내)**: 이미지 로드 후 `fitFrames = cols * floor(img.height/fh)` 및 `cols*fw <= img.width`를 확인, `frames > fitFrames`면 `console.warn` + `frames=Math.min(frames, fitFrames)`로 **클램프**(이미지·cols 불변). 이러면 미래에 메타가 부풀어도 마지막 frame이 이미지 밖을 읽지 않는다. invalid control이 이 조건에 걸림을 §4로 확인.
- **missing-asset**: 기존 `if(!_VFX_SHEETS[id])return;`(playVFXAng 18475)가 이미 미로드 재생을 막으므로 **추가 guard 불필요**. 28개 미존재 에셋은 코드 결함이 아니라 콘텐츠 공급 문제.
- 어느 후보도 적용하지 않았다. `frames`/이미지/좌표 임의 변경 0.

## 6. docs 동기화 인계 (root 순차, 공유docs 읽기전용)

docs 전체 rg(`registerVFX|_VFX_SHEETS|spritesheet|프레임 수|fw,fh`) 1회 수행.

| 정본 문서 | old(현행) | new(인계 문안) |
|---|---|---|
| `docs/5.1임펙트디자인/VFX_구현가이드.md` | VFX 목록에 sheet 치수·frames·cols 대조표/검증 기준 부재 | **VFX sheet 메타 ↔ 실이미지 경계 규칙 추가**: 저장 `cols=cols||⌊W/fw⌋`, 마지막 frame=`frames-1`, 안전조건 `(⌊(frames-1)/cols⌋)·fh+fh ≤ H` 및 `((frames-1)%cols)·fw+fw ≤ W`. 현재 35개 해석 sheet 전부 충족(결손 0) |
| 같은 문서 / `ANIMATION_VFX_TEAM_MASTER.md` 백로그 | boss VFX 등록 현황·에셋 유무 미기재 | **28개 `boss_*.webp` 등록이 실파일 부재(MISSING)→ onload 미발화→미재생** 명시. `assets/vfx/boss/`엔 `boss_cageTrap.webp`만 존재. `boss_cageTrap` 중복 등록. 에셋 공급/등록정리 결정 필요(ART/총괄 Gate) |
| `ANIMATION_VFX_TEAM_MASTER.md` 말미 | — | 본 검사(실 registerVFX+draw crop 실행, 파일헤더 파서, 결손 0, control 입증, loader-guard 예방 후보 미적용) 기록. productionApplied=false |

protected `2_3`·Q전용 blackBean 패링·어택티켓 금지·LOCK/확정수치 변경 0. 새 설계 임의 확정 없음.

## 7. PASS/UNKNOWN·blocker·필수결정

- **PASS(source/fixture, 6/6)**: 양판 slice 동일, 등록 63개 파싱, 실 이미지 치수 해석, 정상 control OK, invalid control DEFECT, UNKNOWN 분리.
- **UNKNOWN**: 28 boss VFX(파일 부재) 경계 판정 불가.
- **실제품 Gate(미수행)**: 실게임에서 빈 프레임 노출 여부·실제 비주얼은 별도(정규 부팅/시각 검수). GPU/native/배포 PASS 아님.
- **필수 결정(인계)**: 28개 미존재 boss VFX의 에셋 공급 vs 등록 제거, `boss_cageTrap` 중복 정리 — ART/총괄 결정. 이는 VFX 등록 소유 범위이나 에셋 생성/교체·코드 수정은 이번 금지 범위라 **결정 Gate로 인계**(독립 소스 구현의 blanket blocker로 삼지 않음).
- 이 한 건만 수행, 자체 다음건 배정 0. 발 앵커/corpse fade/죽음 판정 변경 0.

## 재실행
```sh
cd /Users/fordeargamers/Projects/exoduser-migration-20261001
/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node \
  tools/team-followup-20261002/supervisor-next/ANIMVFX/ANIMVFX-sheet-frame-metadata-bounds-hb1014/checks.mjs
```
하니스는 JSON을 stdout으로 출력하고 파일을 추가하지 않는다. `registerVFX`·draw crop은 원문 실행, 이미지 치수는 실제 파일 헤더 파싱, 미지원/부재는 UNKNOWN이다. source/fixture PASS는 실게임/GPU/시각 PASS가 아니다.
