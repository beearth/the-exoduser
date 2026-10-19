> **2026-10-15 native 현행:** 실제 Main 정지 UI에서 전사0/실버테일1 선택→실제 Player/profile/시트/발앵커를 연결했다. 원본 localStorage charIdx 복원은 미구현,선택 전 indexnull. 아래 고정 Warrior/selector 미구현 문구는 이전 이력이다. [현재 계약·새 검수·MAP PRODUCTION REPORT](FDG_GODOT_NATIVE_FIRST_20261013.md#native-명시-캐릭터-선택--2026-10-15-현행-계약).

| 변경 항목 | 현재 계약 |
|---|---|
| 선택0 / 선택1 | idle2/walk8·4/source_attack8·4/ready attack9·9,표시scale2.0·1.3. 원본R remaster 우선. 24고유장·24FPS 미달. |
| live API | Main.read_native_character_selection()(0)→Player.apply_native_character_selection(reader)(1)→get_native_character_profile_snapshot()(0). 유실시NR/본체숨김/새공격거부. original_storage_restoredfalse/latest_full_gamefalse. |
| 새 소비 / 검수 | 승인Silver body8+spin1 PNG9원바이트 최초소비. 최종격리GPU26PASS/새4프레임. publicplayfalse/VISUAL RETOUCH. 원수치/QE/physics/geometry/save/사용자창 불변. |

# FDG 캐릭터 초안 24프레임·24FPS 기술 검수

> **2026-10-12 드루이드 source 현행:** 기본 대기는 `boss_dark_druid_8dir_v3.png`(1656×1240, 4×2 / 셀414×620)의 실제 방향 셀을 비율 보존·source-over1회로 표시한다. 구형 f0 r3/r5 리그는 `fdgDruidSource=legacy-f0` 명시 선택에서만 로드하며 r5는 기존 exact r4 QA active도 필요하다. 아래 f0 제작·PASS·URL 기록은 구형 기술 이력이고 신형 모델 인수가 아니다. 걷기·공격 기존4프레임은 아직 남아 있다. 10/9 검정 SW 후보는 영웅형 외형으로 사용자 거절되어 선택 대기 종료·연결·리깅 재개0. 승인 악마형 NORMAL 본체 자원 없음. [source 정본·API·실제 화면](FDG_CHARACTER_ASSETS.md#dark-druid-source-correction-20261012).

기준일: **2026-10-10, Asia/Seoul**. `engine/fdg/character-quality.js`는 `characterDrafts`의 실제 영상 추출 atlas를 읽는 순수 helper다. DOM·Canvas 생성·네트워크·파일·외부 생성 API를 사용하지 않고 전달받은 RGBA를 변경하지 않는다. 프레임 직사각형, 정확한 중복, 알파·잘림 후보, 밝기·인접/루프 변화량을 반환한다.

설계 참고는 `4.0케릭터스프라이트 디자인.md`, `캐릭터_몬스터_보스_최적화디자인_v1.md`, `5.0애니메이션파이프라인.md`, `남전사_로비_아이들_모션_20260908.md`다. 기존 전사 로비 영상의 133프레임·24FPS·0.75배속 계약과 인게임 전사/실버테일 시트는 변경하지 않는다. 이 검수 목표는 새 제작 초안의 **24장·24FPS**이며 기존 에셋을 24장으로 변경했다는 뜻이 아니다.

## 초안·API 계약

| 항목 | 형식 / 의미 |
|---|---|
| 초안 | `{id,name,referenceSrc,clip,designLocks:[string],provenance:{...}}` |
| `clip` | `{src,frameWidth,frameHeight,columns:6,rows:4,frames:24,fps:24}` |
| 실제 영상 추출 | root의 asset pipeline가 원본 영상·추출 프레임 번호·시간·명령·해시를 provenance로 남김 |
| 기술 helper의 범위 | `clip` geometry와 RGBA 사실만 확인; 영상에서 직접 추출되었는지, 원화와 같은 캐릭터인지, designLocks가 지켜졌는지는 픽셀 hash만으로 증명하지 않음 |
| 입력 이미지 | `{data:Uint8Array|Uint8ClampedArray,width,height}`, RGBA 순서·row-major |
| `draftFrame(clip,index)` | `{sx,sy,sw,sh}`; index는 0 기반 정수, 범위 밖은 RangeError |
| `frameIndex(seconds,options?)` | 0 기반 프레임 index; `options={frames:24,fps:24,loop:false}` |
| `inspectCharacterPixels(image,clip)` | 아래 report; malformed/과대/불일치 입력은 TypeError/RangeError |

`src`, `referenceSrc`, `designLocks`, `provenance`는 이 순수 helper가 로드하거나 평가하지 않는다. 프로젝트 스키마의 로컬 경로·초안 메타 검증과 실제 원본의 출처 확인은 root의 Studio/asset pipeline 책임이다.

## 상수·입력 한계

| ID / 항목 | 값 / 검사 | 적용 |
|---|---|---|
| `QUALITY_TARGET` | frozen `{frames:24,fps:24}` | 목표 표시·기술 결과의 target flags |
| `MAX_CHARACTER_PIXELS` | **16,000,000** pixels (10진수16M) | declared atlas와 실제 이미지의 `width×height` 각각 상한 |
| `MAX_CHARACTER_FRAMES` | **256** | grid `columns×rows≤256`, `frames≤columns×rows`; timing frames≤256 |
| `MAX_FPS` | **120** | finite `0<fps≤120` |
| dimension/count | positive safe integer | frameWidth·frameHeight·columns·rows·frames·image width/height |
| atlas width/height | `frameWidth×columns`, `frameHeight×rows` | safe integer·pixel product도 safe integer, 한계 초과 거부 |
| 실제 이미지 크기 | declared atlas와 정확히 같음 | padding·누락행·잘못된 셀 규격은 거부 |
| RGBA 길이 | 정확히 `width×height×4` | 16M 한계에서 최대64,000,000 byte; 부족/추가 byte 거부 |
| RGBA 배열 | Uint8Array 또는 Uint8ClampedArray | Node Buffer·typed-array subarray도 포함, 일반 Array/Float32Array/DataView는 거부 |
| SharedArrayBuffer | 거부 | 병렬 쓰기로 검수 결과가 변하는 입력을 차단; 원본 input을 복사/변형하지 않음 |
| timing seconds | finite `seconds≥0` | NaN/Infinity/음수 거부 |
| timing loop | boolean | 기본false; truthy 숫자 등을 자동 변환하지 않음 |
| `EPSILON` | `1e-9` | 프레임 경계의 부동소수점 보정 |

clip helper는 6×4만 처리하도록 제한하지 않는다. 유효한 다른 grid와 1~256프레임도 측정할 수 있으나 `frames!==24` 또는 `fps!==24`이면 이 초안 목표의 technical fail/target flag를 반환한다. 이는 malformed 구조에서 발생하는 throw와 구분한다. 사용하지 않는 grid 셀은 측정·중복·알파 경고에서 제외한다.

## 프레임·시간 공식

| 항목 | 공식 / 예 |
|---|---|
| source X | `index % columns × frameWidth` |
| source Y | `floor(index / columns) × frameHeight` |
| frame23, 320×180, 6×4 | `{sx:1600,sy:540,sw:320,sh:180}` |
| non-loop | `min(frames−1,floor(seconds×fps+epsilon))`, duration 이상은 마지막 frame 유지 |
| loop | `floor((seconds % (frames/fps))×fps+epsilon) % frames` |
| 기본 frame0/1/23 | `0`, `1/24`, `23/24`초부터 표시 |
| 기본 duration | `24/24=1`초; non-loop 1초 이후 frame23, loop 1초에서 frame0 |
| 명목 FPS | 원본 셀을 선택하는 초당 프레임 수 |
| 화면 FPS | UI/rAF의 실제 갱신 빈도이며 이 helper에서 측정하지 않음 |

24셀에 같은 그림을 복제하고 24FPS로 표시해도 `distinctFrameCount`는 1이다. 시트의 선언 셀수·시간 선택 속도·실제 고유 그림 수를 별도로 표시한다.

## 프레임별 RGBA 측정

| `perFrame[]` 필드 | 의미 / 계산 |
|---|---|
| `index,rect` | frame 번호와 `{sx,sy,sw,sh}` |
| `hash` | RGBA row-major byte의 FNV-1a32, 8자리 소문자 hex |
| `empty` | alpha>0인 픽셀 0개 |
| `visiblePixels` | alpha>0 픽셀 수 |
| `opaquePixels` | alpha===255 픽셀 수 |
| `transparentPixels` | alpha===0 픽셀 수 |
| `partialAlphaPixels` | `0<alpha<255` 픽셀 수 |
| `hasTransparency` | alpha<255인 픽셀 존재 |
| `alphaBounds` | alpha>0의 cell-relative `{x,y,width,height}`, empty이면 null |
| `borderAlphaPixels` | alpha>0이며 X/Y가 셀 첫/마지막 열/행인 픽셀 수; corner도 한 번만 계산 |
| `touchesBorder` | `borderAlphaPixels>0` |
| `cropBorder` | `hasTransparency && touchesBorder` — 실제 잘림 확정이 아닌 시각 확인 후보 |
| `normalizedAlpha` | `sum(alpha)/(framePixels×255)` |
| `normalizedLuminance` | `sum(((.2126R+.7152G+.0722B)/255)×(A/255))/framePixels` |
| `duplicateOf` | 실제 byte가 같은 그룹의 첫 frame 번호; 첫/고유 frame은 null |

밝기는 RGB 8bit 값에 규약의 가중치를 직접 적용하고 alpha를 곱한다. 감마 역변환이나 물리 조명 측정은 하지 않는다. 투명 영역의 밝기 기여는 0이며 배경은 검정으로 취급한 지표다.

`empty`는 알파 기준이다. alpha255인 검정 RGB 그림을 빈 셀로 판정하지 않는다. alpha0 아래 숨겨진 RGB가 다르면 **정확한 데이터는 서로 다른 프레임**으로 집계할 수 있다. 두 셀 모두 empty일 수 있으므로 그 숫자를 눈에 보이는 움직임·원화 품질의 증거로 사용하지 않는다.

## 정확한 중복·변화량

| 항목 | 공식 / 계약 |
|---|---|
| FNV offset | `0x811c9dc5` |
| FNV prime | `0x01000193` |
| FNV 업데이트 | `Math.imul(hash ^ byte,prime) >>> 0` |
| hash collision 확인 | 같은 hash bucket의 각 distinct representative를 실제 RGBA byte로 직접 비교 |
| `distinctFrameCount` | 정확한 byte 비교로 확인한 그룹 수, hash 종류 수가 아님 |
| `duplicateGroups[]` | `{hash,indices:[frame 번호]}`, exact group의 길이가2 이상인 그룹만 |
| `adjacent[]` | frame0→1부터 frame22→23, 기본23개 transition |
| `loop` | 마지막 frame→frame0의 같은 변화량 규격, 기본23→0 |
| transition `from,to` | 비교한 frame 번호 |
| `changedPixels` | RGBA 4채널 중 하나라도 다른 픽셀 수 |
| `changingPixels` | `changedPixels/framePixels`, 0~1 비율 |
| `exact` | `changedPixels===0` |
| `normalizedRgbaDifference` | `sum(abs(RGBA 차이))/(framePixels×4×255)` |
| `luminanceDifference` | 위 alpha 가중 밝기의 픽셀별 절대 차이 평균 |
| `alphaDifference` | `sum(abs(alpha 차이))/(framePixels×255)` |

1프레임 clip의 adjacent는 빈 배열, loop는 자기 frame→자기 frame이라 변화량0이다. 루프 차이가 0이 아니라고 불연속으로 단정하지 않는다. 정상 움직임도 프레임 간 차이가 있으므로 값만 보고한다. 원본 영상의 자연스러운 관절 움직임과 경계는 사람이 확인한다.

실제 FNV32 충돌 회귀에는 같은 hash `1557511f`를 갖는 2픽셀 프레임을 사용한다. A=`[108,160,10,255,193,1,126,255]`, B=`[174,190,101,255,86,239,220,255]`. helper는 두 그림을 서로 다른 그룹으로 집계한다.

## 결과·기술 판정과 시각 판정의 경계

| report 필드 | 의미 |
|---|---|
| `technical` | `{status:'pass'|'review'|'fail',errors:[issue],warnings:[issue]}` |
| issue | `{code,message,frames?:[index]}` |
| `subjectiveStatus` | 항상 **`unreviewed`** |
| `declaredFrames` | clip의 선언 셀수 |
| `distinctFrameCount` | 실제 exact RGBA 그룹 수 |
| `duplicateGroups,perFrame,adjacent,loop` | 위 상세 측정 |
| `target` | `{frames:24,fps:24,declaredFramesMet,fpsMet,distinctFramesMet}` |
| `target.distinctFramesMet` | `distinctFrameCount>=24`; empty/error/시각 품질과 별개인 단순 수량 flag |
| `summary` | `{width,height,pixels,fps,duration,emptyFrames,cropBorderFrames,opaqueFrames,hasTransparency,adjacentChangedPixels,meanAdjacentChangingPixels}` |
| `summary.hasTransparency` | 측정한 frame 중 alpha<255 존재 |
| `summary.adjacentChangedPixels` | adjacent changedPixels 총합 |
| `summary.meanAdjacentChangingPixels` | adjacent changingPixels 평균; transition 없으면0 |

| issue code | 수준 | 조건 |
|---|---|---|
| `frame-target` | error | declaredFrames!==24 |
| `fps-target` | error | fps!==24 |
| `empty-frames` | error | alpha가 모두0인 frame 존재 |
| `duplicate-frames` | review | exact duplicate group 존재; 실제 distinct 수 보고 |
| `alpha-border` | review | 투명성이 있는 frame의 alpha가 셀 border에 닿음 |
| `opaque-background` | review | alpha가 모두255인 RGB/video frame; 배경·crop은 사람이 확인 |

status는 error가 있으면 fail, 그 외 warning이 있으면 review, 둘 다 없으면 pass다. **technical pass는 그림의 완성도·디자인 lock·관절 움직임·실루엣·원본 일치의 PASS가 아니다.** RGB 영상 추출은 배경을 포함하는 정상적인 중간 산출물이므로 `opaque-background`를 fatal로 처리하지 않는다. 중복 그림도 의도적인 hold일 수 있어 review지만 실제 unique24라고 표시하지 않는다.

브라우저 UI는 이미지에서 한 번 얻은 RGBA와 clip을 helper에 전달하고 report를 표시한다. Canvas decode/getImageData의 로드·taint 오류와 고유 reference/designLocks/provenance UI는 root 구현에서 처리한다. 본편 renderer·런타임·스킬 수치는 변경하지 않는다.

## 검증·동기화

명령: `node --test test/fdgCharacterQuality.test.mjs`. **10개 PASS**.

| 검증 | 기대 |
|---|---|
| frame23 rectangle | 6×4 row-major 마지막 셀 정확 |
| 24FPS·non-loop/loop | frame0..23, 1초 마지막 유지/명시 loop0 |
| 고유 투명24셀·입력 보존 | distinct24, 기술 pass, subjective unreviewed, pixels/clip mutation0 |
| 24셀 exact 복제 | distinct1, 목표 unique flag false, review·adjacent/loop0 |
| 실제 hash collision | 같은 hash의 다른RGBA를 다른 group으로 확인 |
| 빈 셀·4개border·RGB | empty fail·crop review·opaque video review-only |
| 부분 알파·밝기·transition | 정규화 수치 정확, last→first 별도 계산 |
| 숨겨진 RGB | empty 두셀도 다른 exact data 가능, alpha 가중 밝기는0 |
| unused cell·subarray | 미선언 셀 제외, buffer view의 실제 시작 위치로 읽음 |
| target/크기/형식·SharedBuffer | 목표 미충족 report, malformed·한계 초과·길이 불일치·unsafe input reject |

작업 소유 파일은 이 문서, `engine/fdg/character-quality.js`, `test/fdgCharacterQuality.test.mjs`만이다. root의 `project.js`, runtime/Studio/asset pipeline과 별도 제품 checkout R을 수정하지 않는다. 코드 변경 후 docs 전체를 `rg` 및 `grep -r`로 검색했으며 새로운 helper 계약은 이 문서에 추가했다. root가 UI/schema/24장 실제 atlas와 통합할 때 코드+docs를 함께 commit한다.

후속 시각 검수는 각 characterDraft의 reference와 디자인 lock을 보고 수행한다. RGB atlas의 투명 분리, 방향·동작 추가, 자연스러운 loop, 실제 본편 캐릭터 교체는 별도 제작 단계이며 이 helper만으로 완료 판정하지 않는다.

<!-- SCREEN_QUALITY_20261012_APPENDIX_BEGIN -->
## 2026-10-12 · 캐릭터24장과 Q 효과24cell의 구별

이번 표는 현재 선택된 자기 r4+r5+r9+thornfirst 소비 경로의 새 범위다. 이전 보고 body와 판정은 동결한다.

| 항목 | 현재 계약 |
|---|---|
| 캐릭터 목표 | unique24 실제 캐릭터 이미지 +24FPS. 기존 PNG를 스킨한 19본 리그 또는 clip FPS만으로 새24장 충족0 |
| Q 표시 | 소유 QA+thornfirst+combat r9의 createDruidParryContactRenderer: cached canvas6×4/cell128,24 procedural effect cells/FPS24/world96, native boom.t/60, visual1초·frame23 transparent |
| native 유지 | dark02 renderer true일 때만 override/다른 kind fallback. native Q72·boom.r80·E/AI/damage/reflection 그대로. Q 효과24cell은 캐릭터24장 충족이 아님 |
| 실제 품질 | 원 PNG/UV/재질 유지. 전신/무기 crop0/seam0·실제 1280×72060FPS 검수는 미인수이며 reference-motion/효과 sheet를 playable 제작 완료로 승격0 |
| 새 결과 | ready 전신 VISIBLE/HUD654·contained:true, 공개 Q 장식 preview frame0/2/6/23 및 fan 세 화면 unclipped 관측. idle5/Q4/preview9/consumer3=고유21종 증분 PASS(수리 이력 정본). native Q 성공0·전체24cell pixel PASS0·60FPS/캐릭터24장 미인수. VISUAL RETOUCH/exact1 WHOLE_COMBAT_VISUAL_UNIFICATION |

[2026-10-12 화면 품질 수리 정본](FDG_DARK_DRUID_SCREEN_QUALITY_20261012.md).
<!-- SCREEN_QUALITY_20261012_APPENDIX_END -->

<!-- DARK_DRUID_SMOOTH_MOTION_20261012_APPENDIX_BEGIN -->
## 2026-10-12 · smooth-motion 현재 계약

이전 본문/보고는 날짜가 있는 동결 이력이다. 이번 first+r5 표시 계산·전환·QA restart 범위만 추가한다.

| 항목 | 이번 정확 계약 / 관측 경계 |
|---|---|
| opt-in / query | first+r5 smoothMotion:true && idleClip 존재. bridge/rig import motion-continuity-20261012-final; default24FPS floor·다른 bridge/fallback 보존 |
| idle / 전환 | native G.stageTime/60 연속 idle. 마지막 표시 localPose를 source로 entry wind normalized progress0..0.25 smoothstep(0.25초가 아님), return native clock0.12초. wind 외 blend amount1 즉시·impact/FSM 지연0 |
| prepared 평가 | compileRigEvaluator(project) full project validate1회+독립 structuredClone, bind quaternion/world/inverse·hierarchy·influences·lookups·key quaternion prepare1회, frozen{evaluate(options={})}. 매 evaluate options 검증/sample/world/skinning·독립 결과 사본. 기존 evaluateRig 매-call project validation 유지 |
| pose / 표시 cache | localPose=[{id,translation:[x,y,z],rotationQuaternion:[x,y,z,w]}]는 bind transform에 합성할 offset. smooth rasterScale=ceil(clamp(desired,.25,2)×8)/8; 같은 bucket의 scale 원인 reraster 억제. facingDeadZone=.1 display hysteresis, native facing 미수정·8방향 완성0 |
| 관측 API | getRenderSnapshot().motion={phase,nativeSeconds,transition,blendAmount,rasterScale,authoredFps}, getDisplayedPose(actor)는 localPose 새 사본·uninstall 후 null. authoredFps24와 실제 renderedFPS 구별 |
| 새 검사 | root 최초6/6 PASS954.97ms + 이후 facing 새1/1 PASS752.284ms + math 최초5/5 PASS987.274542ms =12 고유 증분 PASS. math의6legacy SHA/18compiled exact는 새 검사 내부 비교이며 old suite 재실행0·한 command12종 최초PASS 아님 |
| 최종 실제 관측 | visible slam 원본116 JPEG1280×720/2.2741949558258057초·running44observer: wind/strike/recover/idle·entry/null/return. camera44/44 fit.ok&&contained, root source frame17/22/41 전신·지팡이 안전 확인. public 실제 사망HP0→QA restart HP548/opacity0/pointer none/pet0·즉시 숨김PASS |
| 성능 / 파생 | slam rolling FPS63/median69/119, drawmedian12.427905746499118ms/update median0.2947923078451533ms; 짧은QA·pause baseline/녹화 overhead 포함으로 sustained60FPS 미인수. GIF640×360/25Hz57targets/2280ms는 preceding 실제 frame 재표본(동일 frame 반복 가능), 새 pose0/원116+timestamp 보존 |
| 최종 판정 / 중간 실패 | 연속동작 단위 구현 완료·전체VISUAL RETOUCH. 정확 잔여1 WHOLE_COMBAT_VISUAL_UNIFICATION(플레이어 tiny·기존걷기/다른패턴4frame·ambient edge crop·trueflip/8방향·true24이미지). overlay 전slam120·사망 전/잔존fade restart 자료는 INVALID 이력 보존; 최종증거 사용0 |
| 보호 / 미인수 | native actor시간/AI/판정/damage/Q-E/PNG/19본/mesh/UV/weights/fixture/맵/사용자save 유지. true24 실제 캐릭터 이미지·전체1280×72060FPS 미인수; 효과24cell/clip24FPS/단일98FPS를 목표PASS로 확대0 |

[2026-10-12 smooth-motion 정본](FDG_DARK_DRUID_SMOOTH_MOTION_20261012.md). 실제 최종 결과·§23은 이 정본의 새 관측 표를 따른다.
<!-- DARK_DRUID_SMOOTH_MOTION_20261012_APPENDIX_END -->
