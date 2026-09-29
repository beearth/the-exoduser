# 2026-09-28 프레임 드랍 — HUD 쓰기와 GPU 텍스트 상태

사용자 보고: 현재 실행 중 심한 프레임 드랍. Windows Chrome 실화면에서 조사했다. 사용자 원래 게임 탭은 다른 작업 세션이 제어 중이어서 별도 QA 탭을 사용했다. 테스트 함수·적·저장 차단은 QA 탭 안에서만 적용했다. 맵 원화·geometry·collision·게임 수치는 변경하지 않았다.

## 확인된 문제와 현행 수정

| id | 위치 | 기존 문제 | 현행 계약 |
|---|---|---|---|
| PROXY_TEXT_STATE | 두 HTML의 `_buildProxyX` | 스프라이트 `restore()`와 GPU 텍스트 상태 setter에서도 `_txCtx.font/textAlign/textBaseline`을 지정 | proxy의 `_font/_ta/_tb`만 저장·복원. 실제 native `fillText` 폴백·`strokeText`·`measureText`는 _syncTextFont로 필요한 경우에만 글꼴 동기화. GPU atlas는 `_font/_ta/_tb`를 직접 사용 |
| RAGE_FINAL_STYLE | `_updateActionKeys`, `skSlot1` | 같은 호출에서 기본 테두리→분노 테두리를 덮어써 값이 일정해도 style invalidation 반복 | 최종 테두리·그림자를 한 번 계산해 `_hset` 적용. 분노 0은 기존 조준/CD/스킬 테두리, `0<rage<50`은 `#884400`, `50<=rage<100`은 `#cc4400`, `rage>=100`은 `#ff2200` |
| RAGE_SHADOW | `skSlot1` | 기본 그림자→최대 분노 그림자 중복 지정 | `rage>=100`: `inset 0 0 12px rgba(255,30,0,.6)`. 그 외 조준: `inset 0 0 10px rgba(255,136,0,.4)`, 나머지 `none`. 기존 최종 외형과 동일 |
| RAGE_VALUE | `._rageBar`, 숫자 span 리프 | 동일 높이·문자열 반복 기록 | 높이 `min(100,P.rage*100/_rageMax())+'%'`, 숫자 `P.rage+'%'`를 변경 시에만 기록. 기존 height transition `.15s` 유지 |
| HUD_CACHE_VERIFY | `_hset(el,prop,val)` | 요청값 캐시만 비교해 외부 코드가 값을 바꾸면 복구 누락 가능 | `_h_<prop>` 요청값과 실제 DOM값을 함께 비교. style은 브라우저 정규화 결과를 `_hn_<prop>`에 보존해 hex→rgb 등 직렬화 차이를 흡수. text는 리프의 실제 `textContent` 비교 |

## 실화면 진단 근거

조건: Chrome, 하드웨어 WebGL2/RX 9070 XT, 논리 화면 1762×720, high/resScale100/SSAA1/프레임캡0. CH1-1 QA 장면, 카메라 `(4020,7420)`, 적 0, 분노 60. `Page.bringToFront` 뒤 측정했다. 비활성 탭의 약 1초 rAF 간격은 게임 성능 결과에서 제외한다.

| 측정 | 실제 관측 | 해석 |
|---|---|---|
| 장비창/보석함 열린 상태 각 6초 | 약239FPS, p95 4.3~4.4ms | 일시정지 패널 상태의 UI 표시 확인이며 전투 FPS 보증이 아님 |
| `_fillVoidWithFloor` 내부 호출별 6초 | `restore` 총2836.2ms/738회, 최대42.2ms. drawImage 총20.1ms/11808회 | 바닥 타일·청크 개수만으로 원인을 단정하면 안 됨 |
| native font setter 세분화 5초 | 바닥 함수 중 같은 글꼴 지정610/610회, 최대44ms/총2374.5ms. align/baseline 최대0.1/0.2ms | Canvas 글꼴 지정에 스타일 계산 지연이 붙었음 |
| proxy 수정 교차 측정 각4초, 2회 반복 | 바닥 함수 p95 30.7/30.9ms→0.1/0.1ms, 최대32.7/32.6→0.3/0.2ms. 전체 rAF p95 약33ms는 유지 | 글꼴 복원 제거만으로 전체 드랍 해결이라고 보고하면 안 됨 |
| DOM MutationObserver 4초 | skSlot1 style52회, 숫자 span26회, 분노 일정60 | 기본→분노 테두리 왕복과 동일 문자열 재생성이 잔여 지연 후보 |
| action-key 갱신 일시 중지 3초 | rAF mean6.37→4.60ms, p95 33.1→4.3ms. 원상복구 재측정 p95 16.6ms | HUD 쓰기가 주요 기여 요인. 실제 HUD를 끄는 기능은 반영하지 않음 |
| 최종 두 수정의 교차 측정 | 측정 중 카메라 이동·여러 메뉴 생성·설정 일시정지·로비 이동 발생 | 조건이 달라졌으므로 최종 FPS 개선율을 확정하지 않음. 일시정지239FPS도 전투 결과에서 제외 |

보이지 않는 경계 gradient 컬링 시안은 전체 프레임 개선이 재현되지 않아 폐기했다. `_fillVoidWithFloor`와 맵 경계 아트는 그대로다. 전역 `body:has` 제거·숨은 animation 일시정지도 효과가 일관되지 않아 코드 변경하지 않았다. 초기 적100마리 스트레스 장면은 최대116.8ms와 GPU 준비 스파이크가 있었으나, 최종 수정 후 동일한 전투 부하 비교는 미완료다.

## 검증과 남은 작업

| 상태 | 근거 |
|---|---|
| RED→GREEN | `proxyTextState.test.js`: 불필요한 native text setter307회→0회, native text/measurement 상태 보존. `actionHudUpdates.test.js`: 일정 분노의30회 갱신 DOM쓰기150회→0회, 분노40/100 및 외부 스타일 변경 복구 |
| 관련 회귀 | 새8개+rendererOptIn16개+HUD/언어/펫 분노/아이템11개 =35 PASS |
| 구문 | `game.html`과 `game-easy-test.html` 실행 가능한 인라인 script 각6개 Acorn parse PASS |
| 시각 상태 | 기존 분노60%·색상 표시를 실화면에서 확인. 최종 코드의 전체 맵·전투 visual PASS로 승격하지 않음 |
| 최종 성능 | 조건을 고정한 새로고침 후 이동/전투/분노 변화/메뉴를 열었다 닫은 뒤 비교 필요. `G.on=true`, `G.paused=false`, foreground, viewport·적수·카메라 조건 함께 기록 |
| 범위 | 본편·easy-test 렌더러와 HUD, 관련 테스트·문서. map cache/에셋/로비 등 동시 작업 제외 |

사용자 탭의 장시간 플레이에서 모든 프레임 드랍이 해결됐다는 판정은 아직 하지 않는다. 원래 탭이 로비로 이동하면서 임시 런타임 진단 상태는 페이지 교체로 해제되었다.

커밋 상태: Git object 쓰기는 sandbox 권한으로 거부되었다. 이번 8파일만 분리한 커밋 실행을 승인받았으나, 실행기가 WindowsApps pwsh.exe를 시작하면서 OS -1073283067/317 오류가 발생해 커밋되지 않았다. 코드·문서는 workspace에 저장되어 있고 tmp/void-floor-perf/manifest.json과 targets에 검증한 분리 커밋 대상이 있다. 커밋 재개 전 HEAD·실제 대상 내용을 다시 확인해야 한다.

## 2026-09-28 후속 전투 실측과 Chrome 배율

| id | 조건/근거 | 판정 |
|---|---|---|
| QA_AFTER_EMPTY | 현재 수정 코드, 적0/6초, G.on=true/G.paused=false, foreground, 카메라(4020,6738), P(4020,7420), 분노60, canvas/viewport5626×2524, resScale100/SSAA1/cap0/WebGL2 | 평균236.94FPS, rAF p95 4.4ms/p99 4.5ms/최대16.7ms, 34ms 초과0회. draw 최대1.4ms/바닥p95 0.1ms |
| QA_BEFORE_EMPTY | 동일 카메라/적수/해상도/분노로 기존 HUD·hset 함수와 proxy의 eager native font/alignment/baseline setter·restore 동작을 QA 런타임에서 복원,6초 후 현재 코드로 복귀 | 평균236.42FPS,p95 4.4ms/최대62.5ms,34ms 초과1회. draw 최대5.5ms/바닥p95 1.8ms. 이번 반복에서는 이전의 지속적인33ms 지연이 재현되지 않았으므로 큰 평균FPS 개선율을 주장하지 않음 |
| QA_AFTER_100 | 위 수정 코드·화면조건,100마리 생성 후 최초6초. mkEn으로 실제 AI 실행,etype0~7 순환(CH1 제외 규칙 포함),플레이어 QA 무적·미공격,적 HP/mhp 1e12. 전투 일시정지 없음 | 평균207.75FPS,p95 8.4ms/p99 16.7ms/최대83.4ms,34ms 초과1회. draw 최대79.7ms/바닥p95 0.2ms/업데이트p95 2.0ms,83ms long task1회. 초기 렌더 스파이크의 세부 원인은 미확정; GPU 업로드로 단정하지 않음 |
| QA_VALIDITY | 위3개 결과 각각 invalid0/document.hidden0/document.hasFocus 미충족0. raw 요약 tmp/frame-followup/measurements.json | 열린 메뉴에서 측정한 수치가 아님. 플레이어 스킬 난사·보스·실제 Steam FPS 결과로 확대 해석하지 않음 |
| QA_INTERRUPTED | 100마리 예열 후20초 측정 중 inspected target navigation/close. 같은 URL의 navigation.type=reload/새 timeOrigin/진단 객체 소실 확인. 후속 진단 사본도 탭 소실로 완료하지 못함 | 해당20초 결과 및 완료되지 않은 업로드 프로파일은 폐기. 재로딩·탭 정리의 수행자를 단정하지 않음 |
| CHROME_HOST_ZOOM | Chrome Be 프로필의 localhost 저장 zoom_level=-3.8017840169239308. 배율=100×1.2^zoom_level=50%. last_modified의 실제 시각2026-09-28 19:38:43.215 KST | 창2829×1447/viewport5626×2524/devicePixelRatio0.5 관측. 변경 주체는 기록에서 확인 불가. 프로젝트 코드나 이번 측정으로 Chrome 배율을50%로 변경한 것이 아님 |
| PIXEL_LOAD | canvas5626×2524=14,200,024px. 이전1762×720=1,268,640px의 약11.19배 | 해상도 부하는 증가했으나 이번0/100마리 단기 실측에서 지속 저FPS 원인으로 입증되지 않음 |
| STEAM_ZOOM_BOUNDARY | 현 checkout package.json의 --user-data-dir=./userdata,window1920×1080/min1280×720/fullscreen:true. build-nwjs.mjs는 manifest에 이 window/chromium-args를 전달 | 일반 Chrome의 localhost 확대 설정과 분리. Steam에서50%를 상속한다고 보고하지 않음. 설치된 Steam 빌드의 화면/FPS/별도 userdata 배율은 미검증 |
| QA_ISOLATION | 후속 사본 tmp/frame-followup/game-qa.html은 현 game.html 스냅샷에 base=/ 및 초기 fetch 쓰기/Storage.setItem/removeItem 차단과 Audio muted guard를 삽입. source-sha.json에 원본SHA256. 실제 런타임 dbSave·BGM도 임시 차단 | production source 변경 없음. 원본 첫3측정은 dbSave/BGM 차단 뒤 수행. 사본은 세이브/게임 수치를 변경하는 배포본이 아님. viewport override는 시도 뒤 reset 완료 |
| REGRESSION_REFRESH | 현 checkout에서 proxyTextState/actionHudUpdates 8건 재실행 |8 PASS. 이전35건 전체 회귀의 통과 기록과 구분; 이번 추가 production 코드 수정은 없음 |

현재 판정: 두 병목 수정은 유지되며 100마리 AI 단기 전투 측정에서 평균207.75FPS를 확인했다. 초기83.4ms 끊김1회와 장시간/스킬/보스/Steam 실측이 남아 있으므로 모든 프레임드랍 해결로 판정하지 않는다.

후속 체크포인트: 현재 HEAD 기준의 본 작업9파일(게임2/테스트2/문서5)만 tmp/frame-followup/targets와 changes.patch에 준비한다. game.html의 다른 작업 map cache 변경은 함수3개만 이식하여 제외한다. 기존 주 인덱스 스테이징은 보존하며, 이전 WindowsApps 실행 오류와 Git 쓰기 제한은 해결 완료로 보고하지 않는다. 이전 tmp/void-floor-perf/manifest.json은 HEAD가 달라 재사용하지 않는다.


## 2026-09-28 Chrome 배율 원복 요청 결과

| id | 수행/관측 | 상태 |
|---|---|---|
| CHROME_RESET_REQUEST | 사용자 지시로 localhost 임시 빈 페이지에서 Control_L+0 단축키 실행 | 실제 inner5626×2636/outer2829×1447/devicePixelRatio0.5로 50% 상태 유지. 단축키 전송 성공을 원복 성공으로 간주하지 않음 |
| CHROME_SETTINGS_BLOCKED | chrome://settings/content/zoomLevels 접근 시 Browser Use URL 보안 정책이 차단 | 내부 설정 접근을 우회하지 않고 중단. 배율100% 원복 미완료 |
| CHROME_RESET_CLEANUP | 배율 확인용 임시 탭 닫음. 사용자 게임 탭은 재로딩하지 않음 | 새 게임/사운드/세이브 변경 없음. 게임 탭에서 사용자가 Ctrl+0을 직접 실행해야 함 |

이 기록은 위 tmp/frame-followup 체크포인트 준비 이후 추가되었다. 해당 체크포인트 사본에 이 추가 기록이 포함되었다고 간주하지 않는다.


## 2026-09-29 프레임 재개: 발사 경고 폭과 설정 복원

측정은 2026-09-28에 수행했고 도구 연결 중단 이후 2026-09-29에 결과를 정리했다. 아래 현행 계약은 위 2026-09-28 proxy/native 동기화 설명을 보완한다.

| id / 적용 위치 | 현행 계약·근거 |
|---|---|
| NATIVE_FONT_SYNC / 두 HTML의 _buildProxyX | _syncTextFont가 _txFontRequest(요청)와 _txFontApplied(브라우저 정규화 결과)를 보관한다. 요청이 같고 실제 _txCtx.font가 적용값과 같으면 setter 생략. native fillText 폴백·strokeText·measureText가 공통 사용. 실제 다른 글꼴·외부 변경·Canvas resize 초기화에는 재동기화한다. 메트릭 반환 자체는 캐시하지 않는다. |
| WARNING_WIDTH / game.html _drawProjectileChargeLabel | _chargeLabelMetrics의 ctx/label/font/width 한 항목만 재사용. X 객체·문구(번역 포함)·글꼴이 바뀌면 새 폭 측정. document.fonts의 loadingdone/loadingerror에서 ctx=null로 무효화. easy-test에는 이 경고 함수가 없어 경고 기능을 새로 추가하지 않는다. |
| 경고 외형 | 기존 bold13px Noto Sans KR/sans-serif, center/middle, cy=y-r-25, bw=tw+14,bh20, 배경rgba(5,8,13,.92),테두리#f4f4f4/1.5px,글자#ffffff 그대로. 물리탄 링60틱·문구·E/Q 판정·발사량은 변경하지 않는다. |
| SETTINGS_RESTORE / 두 HTML | 최초 hellcave_settings의 OPT 복원 및 _loadPreset(slot) 옵션 복원 뒤 UI 동기화 전에 rz() 호출. 저장된 60%/프리셋70%가 실제 C/CT/burst 및 VW/VH에 적용된다. 창·_renderRes 기준×resScale/100을 짝수 픽셀로 정렬; _dpr=1/_ssaa=1. 동일 크기면 기존 rz no-op 유지. |
| 재현 스택 | 실제100마리1920×1080/high/cap0, P·camera4020,7420, rage60. _drawEnemyShotWarnings→_drawProjectileChargeLabel→measureText에서 font setter28.9~41.7ms; 중복 setter 수정 후에도 native measureText29.9~38.1ms 관측. AI/update p95약1.2ms. GPU texImage2D 지연으로 단정하지 않는다. |
| 저장·새로고침 실측10초 | current snapshot 기준 render1920×1080/viewport11252×5048/100마리/scale100/cap0. invalid0/hidden0/blurred0/viewport변경0. draw p95 2.4ms/p99 4.1ms/max44.7ms/34ms초과2회; update p95 1.2ms/max6.0ms; rAF p95 4.3ms/p99 8.3ms/max45.8ms/평균234.56FPS. 글꼴·폭 측정5ms초과0회. 전체 native measure 호출을0회라고 보고하지 않는다. |
| 비교 경계 | 직전100마리 draw p99 31.9ms/max49.3ms. 논리 render는 같지만 전후 CSS viewport5688×1537→11252×5048이므로 평균FPS 개선율은 확정하지 않는다. 중간 변경 viewport 측정과 paused1772회 결과는 비교에서 제외. draw최대44.7ms의 잔여 원인은 미확정. |
| 중단·시각 | 추가예열20초 측정은 도구 연결 timeout으로 폐기. 마지막 새로고침의8방향 아틀라스 준비 상태·스크린샷 확인 미완료. 데모실행 실제LV56,querytestchar1을LV500 실행으로 간주하지 않음. 스킬 난사/보스/Steam/장시간 완전해결 미판정. |
| RED→GREEN / 회귀 | 새 proxy6검사 기존4PASS/6FAIL→10PASS,warning metrics2검사2FAIL→2PASS. settings/HUD/renderer/경고/물리탄 포함8파일57PASS. 기존 enemyShotWarning fixture는 수정전 원본에서도 _projectileParryClass 누락5FAIL; 실제 분류 함수를 함께 추출하도록 보완하고9PASS. 두HTML 실행script각6 Acorn parsePASS. |
| 저장·커밋 | tmp/frame-resume-20260928의 백업·probe.js·measurements.json·검색·RED/GREEN·tests.txt·syntax.json. 현재 .git 쓰기 제한 및 터미널 실행기OS317 때문에 커밋 미완료. 관련 코드·문서만 검토용 사본으로 준비; 타 작업 스테이징 보존. 패키지·Steam 업로드 없음. |

### MAP PRODUCTION REPORT (성능 측정 범위)

- 단계/범위: 기존 CH1-1 화면에서 성능만 측정. geometry/collision/outer mass/랜드마크/아트/맵 캐시 lifetime 변경 없음.
- 검수: 실제 AI100마리·비공격 플레이어·고정 논리render. 저장쓰기/오디오/QA입력 차단은 테스트 사본에만 적용.
- QA/위험: camera/player좌표고정이며 경로 이동·전체camera/combat·맵visual 검수는 수행하지 않았다. 마지막 스크린샷 실패·8방향 로드 미확인 및 예열중단은 제한으로 유지한다.
- VISUAL VERDICT: RETOUCH (이번 성능 근거를 맵/전투 전체visual PASS로 사용하지 않음).


## 2026-09-29 잔여 스파이크와 전면 측정 검증

> 후속 정정: 아래 FHD 수치와 hidden/focus 검사는 실제5074 화면 및 native focus 검증과 다르다. 마지막 사용자 화면 정정 절이 해석 기준이다.

이번 재개에서는 production 게임 코드를 추가 변경하지 않았다. 기존 글꼴/경고 폭/설정 복원 수정을 현재 디스크 사본에서 재검증했다. 측정은 저장 쓰기·오디오·사용자 입력을 차단한 QA 사본으로 수행했다. 다른 작업의 스테이징과 게임/에셋 변경은 보존했다.

| id | 조건·관측 | 판정·경계 |
|---|---|---|
| TAIL_ENV | Windows Chrome, ANGLE AMD Radeon RX 9070 XT/D3D11, WebGL2, render/CSS viewport1920×1080, high, scale100. P/camera4020,7420, 실제LV1, AI100마리·HP1e12·QA무적·rage60 | localhost 저장 배율25%와 분리한 127.0.0.3 로컬 원점에서 DPR1로 측정. query testchar를 LV500 실행으로 간주하지 않는다. 사용자 Chrome 배율 설정을 원복한 것이 아님 |
| CUTSCENE_EXCLUDED | 첫 isolated 측정은 INTRO_CUTSCENE 상태, draw0회 | 전투 결과에서 제외. _cutsceneEnd/_finishIntroGuide의 정상 종료 경로 후 테스트 적100마리를 다시 배치 |
| REAL_CONTEXT_LOSS | 2026-09-28T20:22:31.070Z/20:23:20.532Z의 실제 context-lost 경고, _useGL=false, C WebGL2.isContextLost=true, 흰 화면 관측 | 같은 WebGL canvas의 Canvas2D 폴백이 아님. probe의 false/false→Canvas2D 문자열은 이 손실 상태에 부정확하므로 제외. 손실 원인/VS Code 종료와의 인과관계/VRAM 부족은 미확정. 새로고침 뒤 _useGL=true/lost=false 및 게임 화면 복귀 |
| JS_HEAP_BOUNDARY | 손실 상태 usedJSHeapSize212,510,217B, jsHeapSizeLimit4,395,630,592B | 이 수치로 JS heap 한도 초과를 입증하지 못함. GPU/프로세스 메모리와 다름. tasklist는 접근 거부, 우회하지 않음. 최신 조회 Chrome 덤프 시각은20:22Z보다 앞서므로 이 손실의 crash dump로 간주하지 않음 |
| PROJECTILE_TAIL | 복구 후10초 draw max50ms, 그 프레임 projectile48.3ms/map0.2/enemy1.0/particle0.2/post0.3ms. 글꼴·폭 측정5ms초과0회 | 경고 텍스트의 이전29~42ms 병목과 구분. 이50ms 단발 원인은 미확정; 첫 업로드/메모리 충돌로 단정하지 않음 |
| GPU_CALL_PROBE | 후속 실제 호출에서 proj_phys_mouth.png(6144×1152) X.drawImage11.6ms, 그 안 bufferSubData3.5ms. 다른 반복의 chunk_5_7.png(1026×1026) X.drawImage5.5ms/bufferSubData3.2ms. texImage2D/texSubImage2D3ms초과 관측 없음 | 이 호출은 전체1초 rAF 공백을 설명하지 않음. 아트 축소·배치/Track A/B/D1 lifetime·D2 옵션 변경 근거로 확대하지 않음 |
| RAF_GAP_CONTROL | 게임 draw 비활성10초: rAF 최대1001.1ms/34ms초과10회, draw0, loop 최대0.2ms, longtask0. 실제100마리 전투 반복에서도 loop 최대12.7~16.9ms인데 rAF 최대1009.4~1009.5ms, longtask0 | document.hidden0/hasFocus 미충족0만으로 표시 상태의 유효성을 보장하지 못함. CPU/update만으로 이1초 공백을 설명하지 못함. 이 구간의 평균FPS를 게임 최적화 전후 비교에 쓰지 않음 |
| ANIMATED_CONTROL | Page.bringToFront 직후 단순1920×1080 Canvas2D 사각형 애니메이션10초, 게임on=false: rAF 평균239.76Hz/p95 4.3ms/p99 4.4ms/max4.5ms/34ms초과0회, loop max0.2ms | 전투FPS가 아님. G.on=false이므로 invalid 카운트가 증가하는 것이 대조 실험의 의도. 작은 CSS 애니메이션만 추가한 전투는1초 공백이 유지되어 해결책으로 채택하지 않음 |
| FRONT_100_VALID | 측정 직전에 Page.bringToFront 실행 후 같은 실제100마리/10초/cap0. rAF 평균237.76Hz/p95 4.3ms/p99 4.4ms/max8.5ms. draw2378회/평균2.2073ms/p95 2.6ms/p99 3.0ms/max4.8ms. update600회/p95 1.0ms/max1.5ms. 전체loop max5.3ms | invalid0/hidden0/blurred0/viewport변경0, 34ms초과0회, longtask0, 느린GPU호출0, context event0. 전면 상태에 민감한 Chrome 표시/스케줄링 지연이라는 추론을 지지; 실제 OS occlusion·driver·GPU queue 원인까지 확정한 것은 아님 |
| CAP60_VALID | 같은 조건/측정 직전 전면/cap60/10초. draw599회(약59.9FPS), p95 5.2ms/p99 5.8ms/max6.5ms. update599회/p95 1.6ms/max3.2ms. 전체loop max8.2ms. rAF p95 4.5ms/max12.4ms | 34ms초과0회, longtask0/context event0, invalid0/hidden0/blurred0/viewport변경0. rAF 평균236.76Hz는 브라우저 콜백 빈도이며 게임FPS가 아님. cap60은 저장 없는 QA 메모리 변경 |
| TEXT_CACHE_REFRESH | FRONT_100_VALID/CAP60_VALID 각각 native font setter0/native measure0/slow text0 | 예열된 동일 경고/글꼴의 캐시 사용 확인. 모든 상황의 native 텍스트 호출을0회로 만들었다는 뜻이 아님 |
| VISUAL_REFRESH | _ch8Atlas[1].dirs의8방향 ready=true, 각2048×1280. 복구 후 실제 전투 스크린샷에서 적·물리탄 시트·경고·바닥 렌더 확인 | 앞 절의 마지막 reload 아틀라스/스크린샷 미확인 항목을 보완. 고정 지점의 합성100마리 밀집 장면이며 전체 맵/실전 가독성 검수는 아님 |
| REGRESSION_REFRESH | 현 디스크8파일57검사 재실행,57PASS/0FAIL | tmp/frame-tail-20260929/tests.txt. 새로운 production 코드 수정 없음. 소스SHA256=9fb609b64a12a8355ae8deedf045ec1ddc4b6aea2c3cf76d84e3794f1b8af836 |
| EVIDENCE_AND_GIT | tmp/frame-tail-20260929/measurements.json에11구간 요약, probe.js/gpu-probe.js·백업·docs검색·상태 기록. 시작변경100개/HEAD a99796f72e82d302fb747fb4a86123462bf1f81d | .git 쓰기 제한/WindowsApps 터미널 실행기OS317 유지. 커밋·패키징·Steam업로드 미완료. 기존 코드+문서 체크포인트와 이번 문서 추가 체크포인트는 실제 커밋과 구분 |

현재 결론: 경고 텍스트 병목 수정은 유지되며 전면의100마리 전투에서237.76FPS, cap60에서는약59.9FPS를 확인했다. 이번1초급 갱신 정지는 실제 CPU draw/update 비용과 구분해야 한다. 실제 GPU context loss2회와 단발 projectile50ms의 근본 원인은 남아 있다. 장시간·플레이어 스킬 난사·보스·Steam에서의 완전 해결로 판정하지 않는다.

### MAP PRODUCTION REPORT (이번 측정)

- 단계/범위: 기존 CH1-1의 고정 P/camera4020,7420에서 성능·렌더 준비 확인. geometry/collision/outer mass/랜드마크/아트/lifetime 변경 없음.
- 검수:100마리 실제AI와 기존 적 투사체·경고,8방향 로드,복구 후 실제 화면. 전면 cap0/cap60 각각10초.
- 제한: 합성 밀집·무적·고정카메라·미공격 플레이어. 맵 이동/전체camera/combat/보스/스킬 난사/Steam 미검증. GPU loss 원인 미확정.
- VISUAL VERDICT: RETOUCH (부분 렌더 확인이며 전체visual PASS가 아님).


## 2026-09-29 사용자 화면 정정: 5074×1318와 실제 포커스

앞 절의1920×1080 테스트는 원인 분리를 위한 축소 조건이었다. 사용자 첨부 PNG는5074×1318이며, 당시 viewport 강제로 게임이 왼쪽1920 영역에만 표시됐다. 해당237.76FPS를 사용자 실화면/Steam FPS로 쓰지 않는다.

| id | 수행·관측 | 판정·제약 |
|---|---|---|
| MATCH_SCREEN_RENDER | 첨부 PNG의 실제 크기5074×1318에 맞춰 QA viewport를5074×1318로 지정. _renderRes=null/high/resScale100/DPR1, C backing5074×1318와 CSS rect(0,0,5074,1318) 확인. 전체 캡처에서 오른쪽 검은 빈 공간 없이 게임 표시 |6,687,532px로1920×1080 대비3.2251배. screenshot 크기와 실제 GPU render 부하를 맞춤. native Chrome outer2829×1447/monitor5120×1440은 별도이므로 OS 창 크기·Steam/NW.js까지 동일하다고 선언하지 않음 |
| REAL_QA_SOURCE | 최신 확인 소스SHA25047f21d114e1bee4501a004b6c83d74ef05ee4b2e2ba511f5efc4f8eee894e의 game-real-qa.html. real-probe.js는1920 고정/_renderRes/OPT.resScale 강제를 제거하고 창·캔버스·화질·배율을 기록. 실제LV1/적155마리/P4020,7420/camera4020,7341 |100마리 fixture 후 기존 스테이지 스폰이 더해져155마리. 실제측정 수를100으로 보고하지 않음. 별도127.0.0.3 원점의 high100 기본값이며 사용자 세이브/localhost 저장 그래픽 설정을 그대로 재현했다고 선언하지 않음 |
| FULL_SIZE_UNCAPPED |5074×1318/high100/cap0/155AI/10초:155.14FPS, rAF p95 8.5ms/p99 12.3ms/max20.8ms/34ms초과0. draw1552회/p95 3.6ms/p99 4.5ms/max6.4ms, update600회/p95 1.4ms/max2.1ms, loop max7.6ms. native measure2054/font setter7, 느린text0/context event0 |화면 크기·렌더 부하는 유효하지만 이때 도구의 focus emulation이 켜져 있었다. strict native foreground 검증 완료 결과와 구분 |
| FOCUS_DISCOVERY | Emulation.setFocusEmulationEnabled(false) 직후 document.hasFocus=false/document.hidden=true. Page.bringToFront 뒤 focus=true/hidden=false |도구의 가상포커스 true가 실제 가려짐/포커스를 감추고 있었음. 앞 절의 hidden0/blurred0는 실제 OS 전면 상태를 입증하지 못한다.1초 rAF 공백을 게임 CPU/메모리 충돌로 오인하지 않음 |
| MASKED_CAP60_REJECTED |전체크기 cap60의 두 반복은 rAF 최대1001.1/1001.2ms, draw150/186회/10초, loop max8.3/7.9ms. 가상포커스 true |안정적인60FPS 결과에서 제외. draw/update의 짧은CPU 비용과 표시·백그라운드 스케줄링 지연을 분리 |
| NATIVE_FOCUS_CAP60 |가상포커스 해제/실제전면 확인/같은5074×1318 high100/155AI/cap60/10초:draw594회(약59.4FPS), p95 4.6ms/p99 5.3ms/max6.0ms. update598회/p95 1.9ms/max8.9ms. loop max13.6ms. rAF p95 4.5ms/p99 8.2ms/max87.7ms/34ms초과1회 |invalid0/실제hidden0/실제blurred0/viewport변경0, longtask0/context event0. rAF 평균233.36Hz는 게임FPS가 아님.87.7ms 단발 갱신 지연의 세부 원인은 미확정이며 모든 끊김 해결로 판정하지 않음 |
| NATIVE_FOCUS_UNCAPPED_ABORT |후속 무제한 측정 중 실제 focus=false/hidden=true가 되어 완료 결과가 나오지 않음. running=false로 중단, 관측 loop max6.3ms/longtask55ms |측정 폐기. 부분 수치/중단한 샘플을 전면FPS로 보고하지 않음 |
| STRICT_QA_GUARD |native-probe.js: 실제 포커스 설정 확인(f.nativeFocusConfirmed=true) 전 측정 거절. 시작 시 실제hidden/focus 검사; blur/visibilitychange/resize가 발생하면 measurementValid=false로 중단. 중단 후 requiresReload=true로 다음 측정 전 새로고침 요구. Acorn parse PASS |다음 재사용 시 CDP capability 준비 뒤 Emulation.setFocusEmulationEnabled(false), Page.bringToFront, 실제 상태 확인 및 nativeFocusConfirmed 지정 순서 필수. production 게임 기능/사용자 데이터 변경 없음 |
| SOURCE_CONCURRENCY |검증 중 타 작업 game.html 변경 관측. 현소스SHA51b29175b336f800439a53d452389f49180ac2f7507bad4b436bd8c409f6cab3에서8파일57PASS. runtime snapshot과 차이는 미사용 assaultFlame 광원/chainAssault 임팩트 경로 |이 전투는 플레이어 chainAssault를 실행하지 않았다. 해당 스킬/VFX의 검수나 최신 모든 소스의 런타임 완전 검증으로 확대하지 않음. 타 작업 변경102개를 임의 정리/커밋하지 않음 |
| EVIDENCE_CLEANUP |real-measurements.json/real-source.json/real-probe.js/native-probe.js/tests-current-source.txt/viewport-docs-search.txt. 새 popup 진단창 닫기 완료, 임시 viewport reset 완료. 부모 탭 close는 not part of browser session으로 거절됨 |권한/세션 경계를 우회해 부모 탭을 조작하지 않음. 사용자 세이브 쓰기 차단 유지. 커밋·패키지·Steam 업로드 미완료 |

결론: 작은 테스트 화면은 에이전트의1920 viewport 지정 때문에 발생했다. 첨부와 같은5074×1318 렌더 크기로 다시 측정했다. 실제 전면이 확인된 cap60 전투는155마리에서약59.4FPS이며87.7ms 갱신 지연1회가 남아 있다. 이전의1초 공백은 자동화의 가상포커스와 실제 백그라운드 상태를 분리해 다뤄야 한다. GPU loss2회/단발projectile50ms/VS Code 종료의 근본 원인은 여전히 미확정이다.

MAP PRODUCTION REPORT 보완: 이번에도 geometry/collision/outer mass/아트/lifetime 변경 없음. 실제 크기의 전체 렌더와8방향ready를 확인했지만 고정카메라·무적·합성155AI·미공격 플레이어 범위이다. VISUAL VERDICT: RETOUCH. 스킬 난사/보스/장시간/Steam/실사용 세이브·설정 일치 검수는 미완료.


### CH1_HIDDEN_UNDERLAY_20260929 — 현행 바닥 렌더 계약

완성 production_finish 화면이 전체 뷰포트를 불투명 ready청크로 덮으면 _ch1StartOuterCoversView가 가려진 _fillVoidWithFloor·20개 _oriFireflies·기존 맵캐시 분기3그룹을 렌더에서 제외한다. 매 프레임 줌/흔들림/가장자리·1026² ready를 검사하며, 로딩·오류·맵 밖 노출·다른stage/보스아레나/outer·Rootworld·초기폴백은 원래 바닥을 유지한다. ?ch1LegacyUnderlay=1은 비교용. visible 생체/언덕/소품/ATMO·19빌드레이어/이미지·충돌 삭제0. 캐시 메모리 전체해제나FPS개선율을 주장하지 않는다.

현행 공식·수치·검수는 [가려진 레이어 정리 SSOT](../4.1맵디자인+설정/CH1_HIDDEN_UNDERLAY_20260929.md)를 따른다. 앞선 날짜별 회귀·FPS·아트 수치는 당시 검수 이력이다.


### OUTER83_GPU_OBSERVATION_20260929 — 아트 검수 이력

| 표본 | 실제 관측 / 한계 |
|---|---|
| HARDWARE_FIRST | Radeon RX9070XT/ANGLE D3D11/2813×1262. 21:31:52.474Z contextlost→21:31:53.570Z restored; lost=false/error0,30청크 ready/오류0/visible=drawn10인데 흰 화면 잔류1회. 원인 미확정 |
| COMMIT_AT_WHITE | 시스템commit75.383438GiB/limit78.835209GiB/물리여유34.182293GiB. 메모리·원화83이 원인이라고 단정하지 않음 |
| HARDWARE_RELOAD | 자체 이전QA탭만 닫고 동일 페이지 새로고침 후 JOIN_TOP/START_ACTUAL/ARENA/EXIT4시점 정상. 52청크ready/오류0/visible=drawn12/lost=false/error0. 해결 판정 아님 |
| SOFTWARE_ART | SwiftShader 본편18시점·24적30초 전투/93.3604초,JS·HTTP·crash·흰화면·contextloss0. 실제GPU FPS를 뜻하지 않음 |
| IMAGE_SIZE | 변경54청크 PNG108887616→113532157바이트(+4.27%). 1026²/core1024/bleed1·64청크 규격 유지. 이 아트 교체 자체의 runtime 추가draw0 |
| LAYER_FOLLOWUP | 이후 CH1_HIDDEN_UNDERLAY_20260929는 별도 바닥3그룹 조건부 렌더 제외. 위 ART표본을 그 코드의 전후FPS나GPU문제 해결 증거로 재사용하지 않음 |

GPU 관측 원본: captures/ch1_outer83/chrome-first-run.json·chrome-reload.json·chrome-white-memory.json. CUA 일반 스크린샷에서 확인; Page.captureScreenshot 별도파일 export는 timeout으로 실패. 파일로 내려받은 GPU캡처가 있다고 주장하지 않음.


### FRAME_SYSTEM_COMMIT_20260929 — Windows 가상 메모리 고갈 확인·관리 준비

| id / 적용 위치 | 현행 근거 / 상태 |
|---|---|
| SYSTEM2004 | Windows Resource-Exhaustion-Detector의SystemCommitCharge/Limit로반복고갈확인. 09-28T21:31:51.409Z=79.649582/79.761414GiB(99.8598%),GPU loss21:31:52.474Z약1.06초전. 물리여유33.929214GiB. 앞의RAM여유만으로고갈을배제하지 않음. 인과관계·탭귀속미확정 |
| PAGEFILE | 실제C custom8192/16384MiB(8/16GiB)상한. 사용자관리지시에따라32768/65536MiB(32/64GiB)조정안을준비. C여유256.770447GiB·원래값백업·관리자/설정drift/80GiBreserve검사. 자동재부팅0 |
| APPLY_STATUS | 승인된실행은exec OS317,관리자PowerShell·reg.exe RunAs는0xc0000142로시작실패. 읽기값8/16GiB그대로/아직미적용. tmp/pagefile-management-20260929의적용·복원REG_MULTI_SZ파일과백업준비. 사용자관리자적용후재부팅·활성commitlimit확인필요 |
| QA | 현재11파일77PASS/두HTML각6구문PASS. 이번새프레임표본은크기/부트조건오류및브라우저연결timeout으로폐기. 새FPS·88ms해결·VS Code원인·전체GPU수정완료를주장하지 않음. production게임코드추가변경0/타작업보존/커밋미완료 |

상세설정·실제OS이벤트·GPU카운터한계·적용파일·MAP PRODUCTION REPORT는 [Windows 커밋 고갈·페이지 파일 SSOT](FRAME_SYSTEM_COMMIT_20260929.md)를 따른다. VISUAL VERDICT RETOUCH.
