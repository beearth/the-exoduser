# 자체 엔진 — 스프라이트 FPS clip 리소스

`ROOT-ENGINE-POISON-PUDDLE24-20261009`의 에디터/리소스 소유 계약. 기존 키 모션과 별도로, 원본 아틀라스의 격자 순서·FPS·반복을 하나의 JSON 리소스로 저장하고 공통 런타임으로 재생한다. 이 문서는 에디터 연결의 구현·검수만 기록한다. 신규 독액장판 그림의 제작·본편 연결·Godot loader는 각각의 담당 소유이며, 24라는 메타데이터만으로 실제 24자세나 품질을 승인하지 않는다.

기존 키 모션 계약은 [애니메이션 정본](EXODUSER_ENGINE_ANIMATION_20261009.md#2026-10-09--원본-스프라이트-모션-편집기)을 따른다. 이번 연결이 대체하는 현재 에디터 cache label은 `engine-sprite-editor.mjs?v=20261009-resource-v4`다. 기존 `sprite-clip.mjs?v=20261009-atlas-v2`를 유지하며 신규 `2_5d/atlas-clip-runtime.mjs?v=20261009-v1`을 함께 소비한다.

## 공통 파일 형식

| 필드 | 계약 |
|---|---|
| format / version | `exoduser-atlas-clip` / 숫자 `1` |
| name | 공백만 아닌 문자열, 최대200자 |
| sourcePath | 프로젝트 루트 기준 `assets/...`, 최대1000자. 앞뒤 공백·빈 경로 조각·`.`/`..`·역슬래시·`?`/`#`/`%`/`:`·제어문자 거절. 에디터에서는 `new URL('../'+sourcePath, import.meta.url)`로 같은 프로젝트 원본을 준비 |
| columns / rows | 각각 양의 안전정수, 곱도 안전정수 |
| frameCount | 양의 안전정수, `frameCount <= columns*rows`. 별도24/256 상한 없음. 미사용 셀은 프레임으로 취급하지 않음 |
| fps / loop | 유한 숫자 `fps > 0` / 명시 boolean. 문자열·숫자 coercion 없음 |
| 길이 | 런타임에서 `durationSeconds=frameCount/fps` 유도. JSON의 임의 duration을 소비하지 않음. 에디터 타임라인은 유도 길이가 유한한 양수일 때만 허용하며, 키 모드의3600초 한도를 FPS 모드에 추가하지 않음 |
| 배치 | 0부터 row-major: `column=frame%columns`, `row=floor(frame/columns)`. 방향행 리소스가 아니며 에디터 `linear` 배치에서만 FPS 모드 선택 |

예시의 `assets/sprites/boss/example-puddle-atlas.png`는 형식 설명용 경로이며 자동 기본 이미지나 승인된 실제 아트 경로가 아니다.

```json
{
  "format": "exoduser-atlas-clip",
  "version": 1,
  "name": "Druid poison puddle",
  "sourcePath": "assets/sprites/boss/example-puddle-atlas.png",
  "columns": 6,
  "rows": 4,
  "frameCount": 24,
  "fps": 24,
  "loop": true
}
```

## 공통 런타임 API

| API | 계약 / 에디터 소비 |
|---|---|
| `createAtlasClip({columns,rows,frameCount,fps,loop})` | immutable factory clip. 생략된 loop의 런타임 기본값은 false이나 공통 JSON은 loop 필드를 요구. factory 생성 identity만 sample/rect에 허용 |
| `sampleAtlasClip(clip,elapsedSeconds)` | 유한한 0이상 초를 받아 `{frame,nextFrame,mix,ended}` 반환. clip별 FPS를 사용하며 내부 clock·RAF·storage 없음. 에디터는 선택된 `frame`을 한 번 그리며 nextFrame/mix로 새 그림을 합성하지 않음 |
| 한 번 재생 | `t >= duration`이면 마지막 frame/nextFrame, mix0, endedtrue. 마지막 프레임의 진행 구간에서도 nextFrame은 마지막 셀 |
| 반복 | caller 시간의 반복 위치로 선택, 마지막 셀 다음 nextFrame0, endedfalse. 에디터 seek의 정확 duration에서도 첫 셀로 wrap |
| `getAtlasFrameRect(image,clip,frame,inset=1)` | 원본 naturalWidth/Height가 존재하면 둘 다 양의 안전정수; 0은 CSS width fallback 불가. 실제 이미지 크기는 grid로 정확히 나누어져야 함. frame은 범위 안 안전정수, inset은 유한0이상·셀의 절반 미만 |
| 에디터 crop | `getAtlasFrameRect(image,resource,frame,0)`로 전체 원본 셀 표시. 기본 inset1을 사용하는 다른 consumer와 경계 crop이 같다고 주장하지 않음 |

## 에디터 동작과 호환

| 항목 | 구현 |
|---|---|
| 명시 선택 | 기존 attack4×8 recovery와 키 모드로 시작. 새 PNG·FPS 모드 자동 채택 없음. `재생 방식`에서 FPS 리소스를 선택하려면 먼저 나눠지는 원본 grid와 `격자 순서` 배치를 적용 |
| FPS/반복 | 초당 프레임과 반복 checkbox를 리소스에 저장. 변경은 검증 후 현재 image/clip과 함께 commit하고 재생 중지. 길이는 자동 유도·편집 불가 |
| 키 모드 보존 | 기존 `exoduser-sprite-clip/version1`의 키 시간·기록·삭제·프리셋·JSON 입출력 유지. atlas 없는 이전 JSON은 기본 attack4×8로 보충. 기존887×1774처럼 나누어떨어지지 않는 원본은 기존 정수 분할 crop 경로에서 계속 지원 |
| 두 방식의 구분 | FPS 선택 시 같은 편집 상태의 기존 키는 보존하고 키 기록/삭제/전체 키 배치/프레임 draft는 비활성화. 키 모드로 돌아오면 해당 키 재사용. FPS 파일에는 키 모션이 포함되지 않으므로 그 파일만 가져온 뒤 키 모드로 바꾸면 초기 `time0/frame0/duration1초` 키 하나가 있음 |
| 가져오기 | 두 format을 같은 JSON UI에서 분기, 최대1,000,000자. common 필드 검증·factory sample·후보 Image 로드·실제 rect 용량 검증을 모두 통과한 뒤 적용. schema/이미지 실패는 현재 clip/resource/clock/pose/history를 교체하지 않음. 대기 중 기존 clock은 진행 가능하며 취소/늦은 응답은 이전 상태를 덮어쓰지 않음 |
| 내보내기 | FPS 모드에서 flat9필드 리소스를 textarea에 펼치고 `.atlas.json` Blob 다운로드 요청. 키 모드에서 기존 `.sprite.json` 내보내기. 다운로드 저장 성공은 미확인 |
| undo/redo | 각 최대40. 기존 clip/image/time/샘플 frame/dirty에 immutable resource를 함께 보관해 FPS·반복·모드·원본 복원. 기존 키 모드의 별도 UI 반복 checkbox는 clip JSON 필드가 아님 |
| clock | 에디터가 재생 중에만 RAF 소유, dt `[0,0.05]`초 clamp. FPS 모드는 resource.loop, 키 모드는 기존 UI 반복 사용. seek/clip 변경/blur/hidden은 중지하며 자동 재개 없음 |
| 화면 | 기존 원형 비율·fit·하단 중앙 anchor·확대75..175%/step5·DPR1..2·원본 alpha1/filter none 유지. 원본 픽셀/PNG 수정0 |
| 진단 | 읽기 전용 `window.__exoduserSpriteEditor.snapshot()`에 `resource`, `playbackMode`, `durationSeconds` 추가. render에 동일 런타임 sample·crop metadata 제공. 변형/적용 mutator 없음 |
| DOM/정리 | 특정 리프 textContent, 생성한 트랙 노드만 replaceChildren. pagehide 때 후보 요청/RAF/listener/observer/이미지·이력·Blob URL 해제. 새 storage/API/save/메인 자동 적용 없음 |

## 최초 새 연결 검증과 한계

| 항목 | 결과 |
|---|---|
| 새 editor delta | Node1, actual 기존 sprite core+신규 atlas runtime+whole controller 소스. 통제 DOM/Canvas2D/Image dimensions/RAF의8그룹65조건 PASS/FAIL0 |
| 확인 범위 | 기존4 키 경로·FPS opt-in 거절,24 row-major 마지막 frame23·loop 경계, FPS/loop undo/redo, schema/이미지 나눗셈/로드 실패 상태 보존, dt clamp/blur, flat export JSON roundtrip, pagehide |
| 아트/시각 | 합성 intrinsic dimensions만 사용. 실제 PNG 로드·24실프레임 확인·native/browser/UI 픽셀·본편 정상 화면 검수0. 기존 완료 suite 재실행0 |
| 미인수 | 실제 다운로드 저장·main/save 자동 적용·Godot 실행·보스전/A급 미인수. native 환경 제한을 우회하지 않음. **VISUAL VERDICT: UI_NOT_ASSESSED / RETOUCH** |
| 증거 | 외부 `engine-poison-puddle24-20261009/editor-resource-before/preflight.json`, `editor-resource-delta-result.json`, `editor-resource-owned-receipt.json`의 정확 소유/검수 epoch |

최종 관련 docs 검색과 다른 현재 정본 동기화는 ROOT가 이 엔진 단위 전체를 묶어 한 번 수행한다. 이 에디터 소유는 HTML/controller/이 신규 정본3경로이며 runtime·원화·본편·Godot loader의 완료를 대신 선언하지 않는다.


## 2026-10-09 — 엔진팀 · 독액장판24 공통 리소스

`ROOT-ENGINE-POISON-PUDDLE24-20261009`: 사용자 직접 승인으로 엔진 런타임·애니메이션·에디터3담당과 ROOT 통합을 실제 진행했다. 실제24기포 원화·768px 6×4/fps24/looptrue 공통JSON을 에디터와 main si0/si3/피날레 장판이 소비하며 Godot SpriteFrames/AtlasTexture loader를 작성했다. [현행 수치·시간·crop·Godot·검수 계약](../5.1임펙트디자인/DRUID_POISON_PUDDLE24_ENGINE_20261009.md). 기존 SVG/aoe8셀은 실패 폴백, chaseAoe/groundFissure·전투/save/원PNG는 유지. 다른보스/캐릭터 전체24/새3D/전체Godot이식 완료는 아니다. controlled actualPNG Canvas 검수와 본편 정상줌/성능/청취/save/A급은 구분하며 **VISUAL VERDICT: RETOUCH**. 같은완료검수 반복0. 최종 보존은 외부 `engine-poison-puddle24-20261009/completion.json`.

실제 독액장판 리소스는 `assets/vfx/boss/druid_poison_pool_24_20261009.clip.json`이다. 에디터의 기본이미지/기존키는 자동교체하지 않으며 사용자가 이 파일의 JSON을 입력란에 붙여넣고 JSON 적용을 누른다. Godot loader는 실제같은리소스를받으나Godot실행은미검수다.


## 2026-10-09 — 독립 ORB24 공통 엔진 연결

`ROOT-ENGINE-DRUID-ORB24-20261009`: 실제 `G._druidOrbs`만 새6×4/24셀/640px, fps300/7·loop .56초로 표시한다. `o.t/60`과 기존R=r×2.4·접촉/피해/반사불가를 유지하며 원본4×2/8셀·벽시간70ms는 실패 폴백이다. [현재 원화·리소스·시간·검수 계약](../5.1임펙트디자인/DRUID_ORB24_ENGINE_20261009.md). 기존 장판24·blackBean Q전용·SFX/save 불변. 마지막→첫 연결/실보스전·GPU·정상줌·청취/save/A급은 RETOUCH/미인수.


## 2026-10-09 — 독탄 접촉24 공통 엔진 소비

`ROOT-ENGINE-DRUID-POISON-HIT24-20261009`: 새6×4/24셀 one-shot을 fps60·age/60으로 첫24틱(.4게임초)에 소비한다. 새셀1회, 미준비·실패는 기존8셀 보간 폴백이며 전체72틱 잔향·r120·작은 핵·최대6파편·첫5틱 섬광·전투/Q/RNG/SFX/save는 유지한다. [현행 리소스·수치·폴백·검수 정본](../5.1임펙트디자인/DRUID_POISON_HIT24_ENGINE_20261009.md). 원화24장 검수와 실제 첫 화면에서 전24셀 표시 인수는 구분한다(첫age1 가능). 이번 native/실보스전/GPU/성능/청취/save/A급은 미인수, **VISUAL VERDICT: RETOUCH**. 기존8셀/native 기록은 당시 구현 이력이며 현재 새24검수로 합산하지 않는다. 외부 `engine-druid-poison-hit24-20261009/completion.json` 최종.


## 2026-10-10 — Druid 뿌리 분출48 본편 표시 소비

기존 `bossDruidErupt`의 `druid_roots` 표시만 새48셀 아틀라스로 연결했다. 원본10셀·frameTime7·종료/렌더 진행·budget5·cull·GL·Canvas 폴백과 전투 계약은 유지한다. 새 resource `8×6 / frameCount48 / fps288/7 / loop=false`의 시간은 기존 `(frame+fraction)/maxFrames`로 매핑한다. 명목70 렌더 진행 단위이며 안정된 게임 초·48FPS·자연 재생 중 모든 셀 노출을 뜻하지 않는다. name=druid_roots/sourcePath=assets/vfx/boss/druid_roots_48_20261010.png. editor의 기본 필드 수입 계약을 사용하며 padding/anchor 보조 정보는 export 유지 대상으로 주장하지 않는다. 실제 normal zoom/전체 전투/동시 효과 성능·GPU·청취·save는 미인수, 독립 Canvas 검토만 별도 기록한다. 보스전 밖의 효과도 필요한 장수를 사용하되 실제 성능 확인 전 전체 교체·렉 없음·AAA급 완료로 표시하지 않는다. [정본](../5.1임펙트디자인/DRUID_ROOTS48_ENGINE_20261010.md).


## 2026-10-10 — Druid 중앙 임팩트24 본편 표시 소비

actual main druid_hit의4caller(드루이드 추적장판 폭발·균열 종착·ORB 폭발·bossDruidErupt 중앙 분출)가 새24셀을 소비한다. 기존 frame/maxFrames8/t/frameTime normalized phase, scale/angle/alpha·GLadditive/Canvaslighter·cull/budget5/종료·전투/RNG/save는 불변이다. 리소스6×4/24/fps180/7/loopfalse를 기존 진행에 재매핑하며 speed3은명목24, speed7은명목56render진행 단위이다. 안정게임초·24FPS·모든셀 자연노출 보장은0. 원본362×543/8셀은pending/실패 폴백으로 유지한다. 독립Canvas proof는본편정상줌·전체전투·GPU·동시성능·청취·실save·AAA인수와 구분하며 RETOUCH다. 다른임팩트도 필요한장수를 사용하되 성능검수전 렉없음·전체교체완료 주장은0. [정본](../5.1임펙트디자인/DRUID_HIT24_ENGINE_20261010.md).


## 2026-10-10 — Druid 땅굴 진입·이탈 링24 본편 표시 소비

actual main burrowStrike의 땅굴 진입·이탈 druid_dust 2caller가 새24셀 링을 소비한다. 원등록256×256/8셀8열·frameTime7·명목56render진행·기본 표시 진입2e.r/이탈2.6e.r·새링 draw×1.2(2.4e.r/3.12e.r)·원8폴백×1·원본중앙여백 정체성(후기 입자 미인수)·angle0·alpha/GLadditive/Canvaslighter·종료/cull/budget5/압축은 보존한다. 리소스6×4/24/fps180/7/loopfalse는 기존normalized phase로 매핑하며 새clock0/24FPS·안정게임초·모든셀 자연노출 보장0이다. 원8셀 pending/실패폴백·전투/RNG/save/SFX/원PNG 유지. 독립 actualmain helper Canvas proof는 본편 정상줌/전체전투/GPU/동시성능/청취/실save/AAA 인수와 구분한다. 다른임팩트도 필요한장수를 사용하되 성능검수전 렉없음·전체교체완료 주장은0. [정본](../5.1임펙트디자인/DRUID_DUST24_ENGINE_20261010.md).


## 2026-10-10 — Druid 뿌리 충격링24 공통 본편 표시 소비

actual main druid_shockring 공통ID는 새24실변화 원화를 소비하며 원512²×8열8장은 pending/실패 폴백이다. 네 실제 caller: _reviveDruidFinale 및 _bossPhaseCheck의막전환 scale=e.r*3/256/frameTime5/표시6e.r/명목40진행, _finishDruidFinale 승리 scale=max(.5,e.r*4/256)/frameTime6/표시max(256,8e.r)/명목48진행, updateE bossShockWind 종료(stage0/3) scale=e.r*2.5/256/frameTime7/표시5e.r/명목56진행. resource6×4/24/fps180/7/loopfalse를 caller별 normalizedphase로 매핑하므로 모든caller56/24FPS/안정game초 보장0이다. 기존guard·worldcenter/angle0/isSkillfalse·alpha·GLadditive/Canvaslighter·종료/cull/budget5/압축·producer·전투/RNG/SFX/save/원PNG 유지. 독립 actualmain helper Canvas proof는 actualnormalmain/정상줌/전체전투/GPU/동시성능/청취/실save/AAA 인수와 구분한다. 현재시각판정과 원화규격·실제검수는정본참조. 과거검수/전투수치 이력은유지한다. [정본](../5.1임펙트디자인/DRUID_SHOCKRING24_ENGINE_20261010.md).


## 2026-10-10 — 보스 유성 착탄24 본편 표시

bossMeteor의 기존 동작·전투값을 유지하며 착탄 표시 boss_meteor_hit(24장)을 새로 연결했다. [실제 producer·리소스·폴백·검수 정본](../5.1임펙트디자인/BOSS_METEOR_IMPACT24_ENGINE_20261010.md). 실제 전체 보스전·동시 성능 미인수, VISUAL RETOUCH.


## 2026-10-10 — 보스 내려찍기 착지24 리소스 재사용

실제 bossSlam 착지 중심150²에 기존 boss_meteor_hit24를 재사용한다. 원shock/피해·26파티클/RNG66·recover40/복귀receipt·공통cap20을 유지하며 새그림·이미지·등록·runtime변경0. 이전 복귀 단위의 FX불변은 당시 변경 이력이다. [현재 소비·시간·검수 정본](../5.1임펙트디자인/BOSS_SLAM_IMPACT24_ENGINE_20261010.md). 이번 실제150px/전투·동시성능은 미검수, RETOUCH/UI_NOT_ASSESSED.


### 2026-10-10 보스 점프 착지의 선택 임팩트24

bossJump 착지의 기본 피16만 이미지 ready 시 기존 중성 지면24로 단일 교체한다(겹침0·미준비16 폴백). 중앙150²/speed2/angle0/defaultalpha1이며 원 `_partCnt<=300`·angle RNG·흰 링/flash·음향·경고/판정300·후속 충격파를 보존한다. [현재 정본](../5.1임펙트디자인/BOSS_JUMP_IMPACT24_ENGINE_20261010.md). 실제150px/정상줌 전투·동시성능은 미검수, VISUAL RETOUCH/UI_NOT_ASSESSED.
