# FDG v0.19 캐릭터·VFX 시트 검수 — 2026-10-11

현행 일반 `characters` 편집창은 큰 승인 스틸·가변 크기 셀을 화면에 맞추고 확대·위치 이동·프레임 선택을 지원한다. 기존 고정4배/첫12개/정사각형 스트레치 표시를 대체한다. 원본 PNG, 장수, FPS, 장면 배율·앵커와 본편 전투는 변경하지 않는다. 신규 게임용 캐릭터의 제작 목표는 실제24장·24FPS이며, 미확보 동작을 반복셀로 채우지 않는다.

## 파일·공개 함수

| 경로 / API | 책임 / 입력 / 반환 |
|---|---|
| `engine/fdg/sprite-preview.js` | DOM·Image·RAF·타이머 없는 순수 편집 geometry |
| `fitSpritePreview({cell,image,viewport,anchor?,focus?,zoom?,padding?,maxScale?})` | source crop·실제 decode 크기·논리 canvas viewport에서 `{x,y,width,height,scale,fitScale,center,anchor}` 반환 |
| `cell` | `{sx,sy,sw,sh}` source px. x/y≥0, w/h>0, 실제 image 범위 내 셀만 허용 |
| `image` | `{width,height}` 실제 decode 이미지 px, 양수 |
| `viewport` | `{x,y,width,height}` 논리 canvas px. 모든 수는 finite, width/height>`2×padding` |
| `anchor`, `focus` | 각각 기본 `{x:.5,y:1}`, `{x:.5,y:.5}`; 각 성분0..1. anchor는 원본 셀의 저작 기준점, focus는 확대 화면 중심 |
| `zoom`, `padding`, `maxScale` | 기본1/16px/4. zoom≥1, padding≥0, maxScale>0. UI zoom 선택은1/2/4 |
| fit 공식 | `fitScale=min(maxScale,(viewport.width−2×padding)/sw,(viewport.height−2×padding)/sh)` |
| 확대·배치 | `scale=fitScale×zoom`, `width=sw×scale`, `height=sh×scale`, `center=viewport origin+size/2`, `x=center.x−focus.x×width`, `y=center.y−focus.y×height` |
| 앵커 표시 | `{x:x+anchor.x×width,y:y+anchor.y×height}`. 저작 anchor 표시이며 인물의 실제 발·native ground pivot 인수 증거가 아님 |
| 오류 | 잘못된 숫자·경계는 `RangeError`; Studio는 셀 범위 오류를 표시. 임의 셀/이미지로 성공 대체 없음 |
| `spriteThumbnailPage({frames,index,width,top,size?,gap?,rowGap?})` | `{start,end,cells}`. clip frames 정수1..256, index 정수0..frames−1. size48px/gap10px/rowGap14px 기본, width>0/size>0/gap·rowGap≥0 |
| paging | `start=floor(index/24)×24`, `count=min(24,frames−start)`, columns=`min(12,count)`, left=`(width−(columns×size+(columns−1)×gap))/2` |
| 썸네일 cell | 절대 clip-local index, x=`left+(offset%12)×(size+gap)`, y=`top+floor(offset/12)×(size+rowGap)`, width/height=size. 마지막 페이지는 남은 실제 장수만 표시 |

## 일반 캐릭터 소비·상수

| ID / 항목 | 현행 코드 계약 |
|---|---|
| `#character-canvas` | 논리960×600. CSS 표시 크기는 기존 WorkspaceLayout의960/600 비율 fit; 논리값에 DPR를 재곱하지 않음 |
| 주요 그림 | mainHeight=`600−145=455`, viewport=`{x:0,y:0,width:960,height:455−42=413}`, padding16. 맞춤 시 전체 셀을 표시; zoom2/4에서 viewport로 clip |
| 맞춤 배율 | 작은48px 셀은 최대4배;832×1248 스틸은 `381/1248≈.30528846153846156`배. `sprite.scale`과 별개인 보기 값 |
| 표시 | 셀의 실제 비율 유지; scale<1이면 smoothing, ≥1이면 nearest. 외곽선·앵커 cross 반경8px. 가짜 접지 그림자 제거 |
| caption | mainHeight−23/−6에 이름·clip·실제 index/frames·FPS·셀 크기·보기 배율 소수3자리·장면 배율·앵커 표시. 본문12px/썸네일11px, paging 안내 y592 |
| 썸네일 | 최대24개/12열×2행,48px box·열 pitch58px·행 pitch62px. top=`455+8=463`, 두 번째 행525px; 각각 원본 비율로 padding2 fit. 선택 배경·실제1-based 번호 표시 |
| 페이지 선택 | 전체 clip slider0..frames−1에서 해당24개 페이지를 표시. 썸네일 클릭은 해당 실제 index를 선택하고 재생 정지. 빈 공간·간격은 다른 프레임으로 간주하지 않음 |
| `#character-zoom` | 일반 캐릭터에서도 활성. 값1=`창에 맞춤`,2/4=`맞춤 2×/4×`. 1 선택/리소스 선택 때 focus(.5,.5) 복원 |
| 확대 위치 이동 | DOM click→논리960×600 변환. zoom>1 및 주요 그림 안에서 `focus+=(click−center)/drawSize`, 각 축0..1 clamp. draw와 hit-test는 같은 반환 geometry 사용 |
| transient geometry | `characterPreviewLayout`은 그린 배치/viewport, `characterThumbnails`는 현재 페이지 hit box. 매 일반 render 시작·오류 때 정리, 정상 렌더 결과만 click이 소비 |
| 일반 non-loop | runtime의 `animationFrame(sprite,anim,animationSeconds)`에서 `finished`면 마지막 셀 slider 유지·재생 정지. `floor(seconds×fps+1e-9)>=frames` 판정 |
| 스크럽·재생 | 스크럽/썸네일 선택 후 ▶는 `index/fps`부터. 마지막 index에서 ▶는0초부터. loop=true는 기존 반복 유지 |
| 참고 모션 | 별도 `characterDrafts`의24장/24FPS·960×600/주요475px·64×36px×24 썸네일·alpha.5 비교 계약 유지. 확대 선택의 이름만 맞춤 기준으로 표시 |
| 상태 수명 | 보기 zoom/focus/page·재생 여부는 transient UI, project/undo/save에 새 필드 추가0. 원본 프레임·FPS·장면 배율·앵커를 임의 변경0 |

## 실제 VFX 관측 UI

| ID / 항목 | 현행 코드 계약 |
|---|---|
| `FDGRuntime.getVfxPlaybackSnapshot()` | 새 공개 관측 API. 정확한 필드·단위·수량·owner 보존은 [API 정본](FDG_SPRITE_PLAYBACK_RUNTIME_20261011.md) |
| `#vfx-playback-hud` / `#vfx-playback-state` | 일반 map scene/skills/vfx의 실제 runtime 표시 때만 노출. character 편집·map collision 편집·world/source/rig/terrain consumer에서는 숨김 |
| 표시 원천 | 기존 `onStats`에서 공개 API 명시 호출. active sheet 수 전체, 앞3개 정의 id·1-based frame/frames·FPS·age/life 소수3자리·alpha 소수2자리·단발/마지막 셀 유지 표시.3개 초과는 `…` |
| 활성 없음 | `활성 시트 없음`. primitive만 남아도 시트 없음일 수 있으므로 FX 총수와 서로 다른 값 |
| 갱신 | running일 때만 기존200ms 제한. paused render/emit/step은 즉시 최신 FX·sheet·제작 상태를 표시. preview clock은 기존 콜백에서 매번 소수3자리 갱신 |
| 종료 의미 | finished는 clip 완료 후 마지막 셀 유지이며 입자 수명 종료와 별개. life가 먼저 끝나면 snapshot 제거. 화면 보이는 성공·native combat 연결을 snapshot만으로 주장하지 않음 |
| DOM 안전 | 기존 leaf 전용 setText 사용. 부모 컨테이너 textContent/innerHTML 교체0 |

## 신규 검증·실제 산출물

증거는 `tmp/fdg-editor-quality-20261011/`에 둔다. 기존 R10/source/리그/보스 제작 완료 이력은 재인수하지 않는다. 이번 PNG는 새 편집 소비와 변경된 HUD만 검수한다.

| 항목 | 실제 결과 |
|---|---|
| 백업 | `backup/`의 기존 root 소유 파일10개 + production workspace 문서. runtime worker의 별도 `tmp/fdg-sprite-playback-runtime-20261011/runtime.js.before` |
| geometry 테스트 | `test/fdgSpritePreview.test.mjs` 고유5개 최종5/5 PASS. 최초4PASS/1FAIL은15.999999999999972 같은 부동소수 fit 경계의 strict oracle였으며1e-9 허용오차로 보정 후 최종PASS. source bounds 거부·큰portrait·small/zoom·anchor/pan·24/256 paging 검증 |
| 관측 API 테스트 | `test/fdgSpritePlaybackRuntime.test.mjs` 새 고유4/4 PASS. 기존 suite 재실행0. synthetic draw crop/alpha·마지막 셀 hold·교체/dispose·source 발행 차단 보존 |
| 실제 캐릭터 fit | 승인832×1248/1장/1FPS/scale.15의 전체 셀 표시, zoom2/위치 이동/맞춤 복귀, non-loop 자동정지 확인. `character-fit.png`, `character-zoom-2.png`, `character-detail-pan.png`, `final-character-editor.png` |
| 실제 두 번째 행 | 기존 전사48×48/21셀 PNG의 검수 전용 `sheetInspection` alias에서13/21 선택·▶ 정지. 이는 기존21셀 전체 스캔이며 새로운 게임 동작 제작 아님. `second-row-frame-13.png` |
| 실제 VFX | 기존 승인640px/6×4/24장/16FPS/life1.5초 fixture. 공개 emit0초 frame1→4틱 .067초 frame2→87틱1.450초 frame24→90틱1.500초 활성시트0/FX0. `public-ui-proof.json`, `vfx-frame-2.png`, `vfx-end-exact-1500.png` |
| 저장·재열기 | 공개 저장/export→reload/export. own 입력과 before JSON deepEqual, before/after JSON deepEqual. body1장/1FPS/.15, impact24장/16FPS/1.5초 보존. clock1.500→0, 입자0. 보기 상태·runtime time/FX를 JSON에 신규 저장0. `save-reopen-proof.json`, `saved-before-reopen.fdg.json`, `saved-after-reopen.fdg.json` |
| 별도 짧은 수명 fixture | own QA 입력의 `editor-quality-short-lifetime` life.05초를 저장 보존했으나 브라우저에서 재생하지 않음.24장 완주/본편 수치 주장0 |
| 서버·환경 | 기존 server.cjs/3333·Codex IAB, Node22.23.2 macOS arm64. Python 서버·서버 재시작·패키지 설치0 |
| 범위 판정 | 편집 전체 표시/확대/프레임 선택과 실제 VFX 관측 **VISUAL PASS**. 게임용 본체·원본 배경/발pivot/본편 보스 동작은 **RETOUCH / 미완료**. 전체 엔진 production 완료 선언0 |
| 미실행 | 이전151/69/12 suite·R10 종주·완료 source PNG·제품 checkout Git 검수0. 이번 화면의 console/pageerror/network404/GPU/Windows/본편 다수 적 성능 인증0 |

## 다음 실제 게임 접점

본편은 `registerVFX`→`playVFXAng`→본편 draw loop로 소비하며 현재 Studio atlas 자동 연결은 없다. `_gameTime`은 ms, `PHYS_STEP=1000/60`ms이고 `speed/frameTime`은 tick/frame이므로16FPS를 speed16으로 전달하면 잘못된다. 기존 timed 경로는 셀 crossfade·alpha 감쇠와 GL additive를 사용하므로, 명시적인 opt-in adapter에서 ID 충돌·decode 크기·FPS 변환·보간/blend/alpha 정책을 먼저 확정해야 한다. 이번 v0.19는 본편 등록·보스 공격·native110/200 game-frame 수치를 변경하지 않는다. 상세 연결 경계는 [통합 인터페이스](FDG_INTEGRATION_INTERFACE.md)를 따른다.
