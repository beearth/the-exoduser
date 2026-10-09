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
