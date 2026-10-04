# CH1-1 제단 독액 도랑 (2026-10-01)

> 사용자 지시(2026-10-01): "중앙에 제단 같은 거 있고 사이드가 경계가 있는데 … 물효과를 넣던가, 못 가는 뭔가 물리적으로 만들던가, 독액 또랑을 만들던가 해서 — 지금은 그냥 막혀 있어 이상해."
> 상태: **구현 완료 · VISUAL VERDICT PASS(맵 팀장, 1차판)**. 시각 전용 — 충돌·경사로·타일맵·구운 청크 불변.

## 1. 문제

우중 제단(`m_c1altar`, 타일 147,97)은 타원 고지대 `_CH1_HILL` 위에 있고, 타원 둘레의 띠(`inner .84` ~ `outer 1.04`)가 `isW → _ch1HillBandBlocks`로 막혀 있다. 서쪽 경사로(타일 x125→135)만 통과 가능. 그런데 현행 smoothing 단계의 언덕 그림이 거의 보이지 않아 **평평한 바닥에서 보이지 않는 벽에 막히는** 상태였다.

## 2. 해결 — 막힌 띠를 독액 도랑으로 그린다

| 항목 | 값 |
|---|---|
| 런타임 파일 | `ch1-altar-moat.js` (`globalThis.Ch1AltarMoat`), game.html `<script src="ch1-altar-moat.js?v=20261004-1">` |
| 호출 | `_drawCh1Hill(X)` 직후 `Ch1AltarMoat.draw(X,G,_now,_CH1_HILL,T,VW,VH)` — 바닥 레이어, 맵 오브젝트·엔티티 아래 |
| 조건 | `G.stage===0 && !G._bossArena`. 다른 스테이지·보스 아레나에서는 이미지 요청·그리기 0 |
| 형상 기준 | game.html `_CH1_HILL` 그대로 전달(중복 상수 없음). 텍스처 1900×960, 월드 원점 `(cx*T-950, cy*T-480)` = 언덕 텍스처와 동일 |
| 액체 가장자리 | 안쪽 `inner - .012 + wob`, 바깥 `outer + .012 + wob`, `wob = .006·sin(3a+1.3) + .004·sin(7a-.4) + .002·sin(13a+2.1)` (절댓값 ≤ .012) → **액체는 항상 충돌 띠를 덮고, 최대 .024(옆 약 17px / 위·아래 약 9px)만 넓다.** 플레이어 반경 15라 몸이 열린 액체 위에 올라가지 않는다 |
| 다리 | 서쪽 경사로 사다리꼴(`rampX0 125 → rampX1 135`, 반폭 `1.8T → 3T`)을 액체·테두리·발광에서 도려냄 = 걸어서 건너는 땅 |
| 액체 그림 | 기존 에셋 `assets/map/ch1/collision/prop_pool.png`의 중앙 액체(270,215,320×230)를 타원 마스크로 잘라 띠 중심선을 따라 약 50px 간격으로 회전·크기 변주(.6~.8, 세로 ×.8) 스탬프, 난수 시드 9731 |
| 가라앉은 표현 | 양쪽 가장자리 안쪽 그림자(선폭 26, blur 7, α.62) + 북서 광원 기준 남동 방향(+6,+9) 투영 그림자(선폭 16, blur 4, α.5) + 액체 아래 어두운 도랑 테두리(±.034, blur 6, α.8) |
| 둑 | 같은 에셋의 아래쪽 뿌리 테(200,530,440×120)를 잘라 양 가장자리를 따라 약 108~138px 간격으로 배치(배율 .36~.46, 좌우 반전 변주, 시드 5531), 그림자 (4,6) blur 8. 다리 양옆에도 같은 띠 2개(배율 .5) |
| 발광 | 절반 해상도(950×480) 녹색 띠(rgb 126,255,96, blur 10)를 알파 `.07 + .03·sin(now·.0017) + .015·sin(now·.0041+1.7)`로 덧그림 |
| 기포 | 32×32 기포 스프라이트, 분출구 22개 후보 중 다리 구간 제외(현재 20개), 주기 2.3~4.9초, 크기 6~13px, 주기의 70% 동안 커지다 터지고 30%는 쉼 |
| 광원 | `_buildStaticLights` 끝에서 `Ch1AltarMoat.lights(_slArr,_CH1_HILL,T)` — 띠 중심선에 10개, 반경 210, 세기 .30, 색 (126,236,98), 깜빡임 계수 .7. 어둠 오버레이(`.38`)를 뚫고 도랑이 읽히게 한다 |
| 새 이미지 생성 | 없음 (기존 확정 에셋 재사용, 크레딧·포인트 0) |
| 빌드 포함 | `build-nwjs.mjs` 복사 목록에 `ch1-altar-moat.js` 추가 |
| 미러 | `game-easy-test.html`에는 그리기·광원 호출 줄만 추가(스크립트 태그 없음 → 기존 CH1 런타임 파일들과 같이 그 빌드에서는 동작하지 않음) |

## 3. 불변 계약

| 항목 | 상태 |
|---|---|
| `_CH1_HILL` 수치, `_ch1HillBandBlocks`, `_ch1HillRampAt`, `_ch1HillHeightAt` | 무변경 |
| 타일맵·geometry hash·구운 청크·언덕 smoothing 텍스처 | 무변경 (도랑은 그 위에 덧그림) |
| 맵 오브젝트 배치(`m_c1altar`, `m_penta_circle`, `m_skull_totem`) | 무변경 |
| 피해·상태이상 | 없음 — 도랑은 지형 표시일 뿐 독 피해를 주지 않는다 (피해를 넣으려면 별도 결정) |

## 4. 검증 (2026-10-01)

| 검증 | 결과 |
|---|---|
| `test/ch1AltarMoat.test.js` | 5/5 PASS — 충돌 수치 불변, 액체가 막힌 띠를 항상 덮고 .024 이내, 두 빌드 배선·빌드 목록, 광원 10개 값, 다른 스테이지·보스 아레나·이미지 미로딩 시 그리기 0 |
| 관련 회귀 | ch1HighGround 2/2, depthSlice 10/10 PASS. `ch1StartSmoothingPass`는 17건 중 1건 실패 — 언덕 smoothing 블록에 `.ellipse(`가 없다는 **기존 실패**(이번 변경이 건드리지 않은 블록, 46차 윤곽 변경 때부터의 낡은 단정)로 MAP-018에 등록 |
| 실제 걷기 | 남쪽에서 북으로 이동 → y=4309에서 정지(충돌 바깥 가장자리 4294.4 + 반경 15). 서쪽 다리로 이동 → x=5707까지 진입(섬 안). pageerror 0 |
| 성능 | 제단 화면에서 237.5 FPS(헤드리스 Edge, 같은 장비의 깊이 슬라이스 측정치 236~239와 동급). 텍스처 합성 1회 7~11ms, 프레임당 그리기 2 + 기포 최대 20 |
| 스크린샷 | `captures/ch1_altar_moat/` (captures 폴더는 git 제외 — 로컬 보관) — `before_south.png`, `after_top.png`(섬 전체), `after_south.png`, `after_west.png`(다리), `walk_south_crop.png`(1x, 막힌 위치), `walk_bridge.png`, `texture.png`(합성 텍스처) |
| 팀장 판정 | G1 도랑이 파인 형태로 읽힘 / G2 플레이어·적 가독성 유지 / G3 기존 늪 에셋과 같은 그림체 / G4 발광·기포 비동기 / G5 새 AI 이미지 없음 / G6 테스트·pageerror 0 / G7 FPS 동급 → **PASS**. 약점: 1x에서 액체 세부가 발광에 묻혀 부드럽게 보임, 다리 입구 마감이 단순 |

## 5. 후속 후보

| 항목 | 내용 |
|---|---|
| 액체 세부 | 전용 독액 흐름 텍스처(Seedream 5.0 Pro 1장)로 교체하면 1x 세부와 흐름 방향감 개선 — 이미지 생성 필요 |
| 다리 | 뿌리·뼈로 엮은 다리 스프라이트를 경사로 위에 추가(깊이 슬라이스와 연동) |
| 상호작용 | 도랑에 빠진 적·투사체 연출, 독 피해 여부 — 게임 설계 결정 필요 |

## 6. 2026-10-04 — 게임 렌더러의 수직 내벽 보강

사용자 음성 확정은 구성도만이 아니라 **게임에서 입체감을 만들고 레퍼런스의 공간 관계를 반영**하는 것이다. 이번 범위는 제단 도랑의 연속 수직 내벽이다. 전체 외곽·맵 구조 재작업 완료를 뜻하지 않는다. 원총괄 직접 구현이며 새 팀·중복 TASK·새 게임·빌드 실행 없음.

| 항목 | 현행 값·적용 위치 |
|---|---|
| BANK_DEPTH | `32` 월드 렌더 픽셀. 실제 지형 높이·충돌 데이터가 아닌 시각 내벽 깊이 |
| 형상 | `bankFace`에서 기존 `dOut` 북쪽 반원(π→2π), `dIn` 남쪽 반원(0→π)을 각각 90구간으로 따라, 하단을 y+32로 내려 닫은 연속 면 |
| 마스크 | 액체의 기존 `source-atop` 안에만 합성. 서쪽 다리 `destination-out`은 이후 실행. 투명 영역/통행 영역 확장 없음 |
| 내벽 재질 | 기존 `prop_pool.png`의 (200,530,440,120) 목질을 8구간마다 190×32로 합성, 알파 .65. 새 이미지·생성·결제 없음 |
| 명암 | 기저 `#32252b`, 깊이 k=4,8,…,32의 8곡선, 선폭4, 색(8,5,11), 알파 `.12 + .35·k/32`. 기존 NW 키라이트의 SE 투영(+6,+9) 유지 |
| 캐시 | 기존 1900×960 합성 텍스처 1회 빌드에 포함. 추가 프레임 draw·별도 텍스처 없음 |
| 배선 | `game.html` 기존 태그 버전만 `20261004-1`로 갱신. 기존 호출·패키지 포함·easy 스크립트 미포함 계약 유지 |
| 픽셀 검증 | 같은 모듈의 전후 Canvas 합성: RGB 변경84369px, 알파 변경0, 기존 투명영역 변경0, 다리 내부 변경0. 프레임 draw 15→15/vents20→20 (이 검증 장면만) |
| 자동 검사 | 내벽 픽셀 경계·다리·캐시/프레임 예산 1건 + 기존 도랑5/고지2/깊이1차10/전경11 = **29/29 PASS** |
| 비용 한계 | 로컬 Node Canvas 1회 합성 before154.1ms/after177.4ms. 브라우저 FPS·게임 초기 프레임 측정이 아니며 성능 PASS로 계산하지 않음 |

### MAP PRODUCTION REPORT

| 항목 | 결과 |
|---|---|
| STAGE / SCOPE | CH1-1 제단 도랑 내벽 한 슬라이스 |
| MASTER PLAN | 기존 도랑 형상·서쪽 다리·제단 연결 보존; 전체 입체감 요청의 부분 구현 |
| LARGE OUTER MASS / MEDIUM / GROUND | 외곽·연결 무변, 도랑 수직 내벽만 기존 바닥 합성에 연결 |
| PLAYABLE / COMBAT | 충돌·경사로·보행·전투 수치 무변. 실제 다수 전투 재검수 미실시 |
| LANDMARK / DETAIL | 기존 제단·늪 목질 재사용, 새 랜드마크/배치 없음 |
| CAMERA QA | 실제 모듈 텍스처 전후 비교만. 현재 실행 앱/네이티브 게임 화면 검수 미실시 |
| TECH QA | 29회귀 PASS, 픽셀 마스크/다리/캐시 유지. 새 패키지·6단계 인수 없음 |
| FILES / EVIDENCE | `ch1-altar-moat.js`, 태그 버전, `test/ch1AltarMoatDepth.test.js`, 관련 docs. 로컬 `tmp/mac-migration-runtime/continued-review-20261004/altar-depth/`의 전후 PNG·pixel-check·백업 |
| VISUAL VERDICT | **RETOUCH — 내벽 텍스처 보강 후보. 어둠·줌·다수전투에서 체감 깊이 미검증, 전체 맵 PASS 아님** |
| NEXT PASS | 동일 후보의 실제 제단 카메라·서쪽 다리·전투 가독성/초기 합성 비용 비교 후 승인 판단. 외곽 질량과 공간 깊이 개선은 별도 잔여 |

상단 1차 PASS는 10월1일 이력이며 이 보강의 실제 화면 PASS를 의미하지 않는다.

§23 항목별 기록:

```text
================= MAP PRODUCTION REPORT =================
STAGE: CH1-1 / 제단 도랑 내벽 한 슬라이스
MASTER
- silhouette: 기존 타원 도랑 그대로
- regions: 기존 8공간/4전투지역 무변
- main route: 남쪽 시작→북쪽 출구 무변
- side spaces: 제단 서쪽 경사로 보존
OUTER MASS
- LEFT / RIGHT / TOP / SOUTH: 이번 범위 외, 무변
- major holes: 신규 연결/외곽 구멍 변경 없음
LARGE
- source assets: 기존 prop_pool.png
- composites: 기존 1900×960 텍스처에 내벽 추가
- overlap: 기존 액체 alpha 안으로 제한
- repeated silhouette: 새 mass 반복 없음; 내벽 목질은 기존 뿌리 crop 재사용
MEDIUM
- connections: 서쪽 땅 다리 보존
- remaining holes: 전체 맵 외곽/연결 검수 잔여
GROUND
- shadow: 수직 면 명암; 기존 +6,+9 SE 그림자 유지
- contamination: 기존 독액/뿌리 재질 유지
- structure integration: 기존 제단 도랑과 같은 형상
PLAYABLE
- main arenas / travel space / breathing space / threat space: 이번 변경 없음
- combat readability: 다리 픽셀 보존; 실제 전투 미검수
LANDMARK
- primary: 기존 시체나무 무변
- secondary: 기존 제단/고지 무변
- tertiary: 새 배치 없음
CAMERA QA
- START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT: 네이티브 촬영 미실시
- 추가 근거: 실제 모듈 텍스처 전후 합성만 확인
TECH QA
- route / collision: 수치·함수 무변, 기존 회귀 통과
- pageerror / 404: 실제 페이지 미실행으로 미측정
- seam: 텍스처 경계 alpha 변경0; 게임 청크 seam 미측정
- loading: 캐시 재사용 확인; 브라우저 초기 합성 비용 미측정
- performance: 프레임 draw 증가0, 실제 FPS/초기 프레임 미측정
FILES
- stage-owned: ch1-altar-moat.js, game.html 태그1줄, 새 픽셀회귀1파일, 관련 docs6파일
- concurrent touched: 없음
- unrelated touched: 없음
GIT
- staged: 소유9파일 한정 checkpoint
- commit: 코드+docs 동일범위
- push: 원격 ref 정확 SHA 검증 영수증 별도 보관
- deploy: 없음 / 기존 실행 앱 변경 없음
VISUAL VERDICT: RETOUCH
NEXT PASS: 같은 게임 후보의 제단/다리/전투 화면과 초기 합성 비용 검수
=========================================================
```
