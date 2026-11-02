# Tripo 보물상자 — 웹 본편 실제 뚜껑 개봉

사용자 지시: “게임에 상자 넣어서 열어보고”. 대상은 `game.html` 웹 본편의 기존 보스 보물상자다. Unity·Steam 배포·스폰/보상 수량·확률/저장 설계 변경은 포함하지 않는다. 11/02 후속 지시로 상자 전리품의 바깥 분산·분출과 착지 전 수거 대기를 적용한다. 최신 추가 지시 “상자가 너무커 … 충돌도 넣고”로 표시 축소·동적 몸통 충돌을 적용한다.

## 제작과 런타임 계약

| id | 항목 | 값·경계 |
|---|---|---|
| SOURCE | Tripo Studio H3.1 | 텍스트 생성 작업 `e124bd3b-f5bd-4c63-9f79-9db5dcf901af`, 원본 70,015,768B·1,896,668삼각형. 원본·정확한 프롬프트·비공개 구독 기록은 `I:/EXODUSER-Storage/admin/subscriptions/tripo-20261102/proof.json` |
| REF | 직접 확인한 기준 | 해당 원본의 실제 Tripo 뷰어 `viewer.jpg`·`model-preview.jpg`. 단일 닫힌 목재 상자·단철 장식·중앙 잠금쇠의 큰 실루엣과 재질을 유지한다. 게임용 파생은 원본 생성의 조형 RETOUCH를 전체 아트 PASS로 올리지 않음 |
| DERIVE | 제작 도구 | Blender 5.1 `tools/tripo-chest-game.py`. 원본 read-only import→decimate→몸통/뚜껑 분리→움푹한 목재 내부→`ChestLidPivot` 뒤쪽 경첩. 정확한 절단·축·텍스처/바이트·SHA는 아래 receipt |
| RUNTIME | 기존 런타임 경로 교체 | `assets/3d/dark_gothic_medieval_treasure_chest__iro_019e0a38.glb`. 파일명은 기존 Meshy 이력과 패키징 경로를 유지하지만 이 버전의 실제 내용은 Tripo 파생본이다. 이전 5,684,980B Meshy 원본은 Git 이력 및 작업 전 정확-byte 백업에 보존 |
| SIZE | 파생본 | 2,679,056B·19,452삼각형. 기존 런타임보다 3,005,924B 감소. 원본 Tripo 70MB와 `.blend`·제작 로그는 출고 폴더에 넣지 않음 |
| LID | 노드 | `TripoChest` 아래 정지 `ChestBody`·`ChestInterior`, `ChestLidPivot` 아래 `ChestLid`. 열린 X축 회전 −1.92rad(약110도). 기본 닫힘, 이미 열린 world item의 늦은 모델 로드도 열린 상태를 따른다 |
| MOTION | `chest3d.mjs` | 개봉 후 0.4초 흔들림 + 0.9초 cubic ease-out 뚜껑 열기, 열린 상태 유지. dt는 0~0.05초, 게임 일시정지 중 진행0. 다시 열어도 재시작/재보상0 |
| DRAW | 접지·카메라 | CSS64×64(최초160에서60% 축소), DPR≤1.5. 모델 폭1.8, Perspective40도/카메라(.7,1.75,3.5)→(0,.62,0). 투영된 바닥 원점과 실제 world item 위치를 맞추고 부유 이동 제거. 작은 접촉 그림자 사용 |
| LOAD | 폴백 | 실제 chest가 있을 때만 Three/GLB·WebGL을 준비한다. 준비 전/로드 실패/컨텍스트 생성 실패에는2D 목재 몸통44×24px 폴백을 유지한다. 열린 우편함 이모지를 열린 목재 상자로 교체하고 같은 충돌 면적을 따른다. `isShowing(item)`은 표시 중인 바로 그 item만 숨겨 다른 chest의 폴백을 지우지 않음 |
| LIFETIME | 상태 | 스테이지 이동·item 제거·게임 종료 시 overlay 숨김. 일시정지에는 현재 형태 유지. 모델 로드 실패를 반복 재요청하지 않음 |
| GAMEPLAY | 보존 | 보스 사망 후 기존 위치의 chest 생성, 거리<60 상호작용, `opened=true`를 먼저 세운 뒤 장비3~5개·기존 추가 보상. 보상 수량·등급 확률·추가 재화/물약·스폰·저장 보존. 전리품 좌표와 분출/착지 전 수거 대기, 표시 크기·상자 몸통 충돌은 아래 후속 계약으로 변경 |
| PACKAGE | 파일 선택 | `build-nwjs.mjs` FILES에 `chest3d.mjs`1개만 추가. 기존 GLB 경로를 교체해 새70MB master 추가를 막고 기존4GB/단일100MB 제한을 유지 |

## 11/02 최신 — 캐릭터 대비 크기와 몸통 충돌

| id | 적용 위치 | 현행 값·설계 경계 |
|---|---|---|
| SCALE | chest3d.mjs `CHEST_RENDER_SIZE` | 64×64 CSSpx. 초기160의40%, 80px 중간 실물에서 열린 뚜껑까지 더 작게 보이도록64로 마감. 모델/텍스처 원본은 불변 |
| BODY | game.html `_chestBlocks` | 중심(it.x,it.y), 반폭22·반깊이12worldpx =44×24px 몸통 사각형. actor 반경r만큼 확장. 뚜껑/광원/힌트는 충돌 면적에 넣지 않음 |
| STATE | worldItems 수명 | 닫힘/개봉 중/열림 모두 몸통 유지. picked/item제거/스테이지 새 worldItems에 따라 자동 해제. terrain 타일에 영구 기록하지 않음, 모델 준비/실패와 독립 |
| MOVE | canMv/canMvBlink | 기존 지형·MAP_OBJS·bone 처리 뒤 동적 몸통 검사. canMvBlink의 skipBone=1은 유지하되 상자 통과는 허용하지 않음. isW·정적 맵/흐름 그리드·Q/E 패링 수치 불변 |
| SWEEP | 빠른 이동 | 선택적 fromX/fromY→x/y 선분과 확장 몸통 AABB 교차 검사. 실제 플레이어 걷기(idle)·sBlock/peaceShield 중 이동·ghostWalk·넉백·돌진·사슬 끌림·칼날이동 접점에 이전 좌표 전달. 벽 검사 자체는 기존 네 모서리 계약 |
| ESCAPE | 생성 순간 겹침 | 시작점이 몸통 확장 안일 때, 이동이0이 아니며 `(from-center) dot delta >= 0`인 바깥 방향만 허용. 더 안쪽으로 들어가는 이동은 막아 생성 후 갇힘 방지 |
| LOOT | 자기 상자 제외 | 장비 착지 경로 검사에 `canMv(x,y,18,x,y,it)`: 분출 시작점이 자기 몸통 안이라는 이유로 모든 후보가 탈락하지 않게 자기 상자만 제외. 다른 상자·지형은 계속 검사 |
| FALLBACK | 2D 크기 | 닫힌 몸통44×24, 뚜껑48×8; 열린 몸통44×24/내부36×14/뒤로 열린 뚜껑44×14. 기존 고정 접지/2D 힌트와 보상 사용 |
| CACHE | bootstrap | `./chest3d.mjs?v=20261102-size64-collision`. 기존160px 모듈 캐시 혼동 방지 |
| QA | 근거 | `I:/EXODUSER-Storage/tripo-chest-game/20261102/size-collision/REPORT.md`. 크기·닫힘/열림 충돌·실제 WASD 우회·기존 R 개봉·전리품 분산을 같은 최종 소스로 검수. 보스 자연 처치/전체 맵 품질 PASS 아님 |

- 최종64px 실게임: 닫힌 양쪽 중심 간격37.79224/37.35920px에서 정지, 위쪽으로 약72.47px 이동 후 반대편 우회 성공. 개봉 뒤 전투 넉백의 첫 간격46.38px 관측은 충돌 정지로 오인하지 않고 별도 안전 위치에서 다시 A 입력→37.79224px 정지 확인. 상자 제거 시 중심/고속 선분 통과 가능, 복귀 시 다시 차단. 장비4개 반지름150px/최소110.76184px·모두 보행 가능·미수거. Chrome 연결 중단 후 IAB의 같은 소스로 최종 개봉/이동 검수를 마쳤다.

## 11/02 후속 — 전리품 겹침 수정

| id | 항목 | 현행 값·적용 위치 |
|---|---|---|
| LAND | 기본 배치 | game.html `_chestLootPositions`: 중심 ±25px 무작위 정사각형을 폐지. 반지름150worldpx, 화면 아래쪽25~155도 부채꼴에 보상3~5개 균등 배치 |
| SPACE | 공간 검사 | 아이템 사이/기존 미수거 장비 중심 간격64px. 몸통/뚜껑 여유 영역 `abs(dx)<86 && -156<dy<40` 제외. `canMv(x,y,18)`와 중심→착지점20px 이하 구간의 보행 가능 여부 검사 |
| FALLBACK | 좁은 지형 | 150/190/230/270px 고리·15도 간격 후보로 이동. 공간 부족 시64→48→32→0px 간격 순 완화, 최후에는 도달 가능한 후보 또는 중심을 재사용해 보상 손실 방지. 모든 불가능 지형에서64px 보장을 주장하지 않음 |
| FLIGHT | 순차 분출 | 출발(상자x,상자y−35), 지연 `.55+ci*.06`초, 비행 `.42+U*.08`초, 정현 포물선 높이 `38+U*14`px. 뚜껑이 열리기 시작한 뒤 좌우/앞으로 튀어나옴 |
| TIME | 시뮬레이션 | `_tickChestDrops(_dtSp/60)`: 고정60Hz의 배율을 초로 변환. 일시정지 후에만 갱신, 완료 시 임시 `_chestDrop` 제거 |
| PICKUP | R 탭/홀드 | 두 장비 선택 루프에서 비행 중 제외. 착지 후 기존 화면 범위 수거/필터 그대로. 비행 중 룬 빛기둥 숨김, 지상 착지 후 기존 아이콘34px/빛기둥60×160 유지 |
| RNG | 보상 보존 | 계획기는 RNG0회. 기존 mkItem 뒤 좌표용 난수2회를 같은 순서로 비행 높이/시간에 사용. 장비3~5개·등급 확률·악의/물약·개봉1회 보존 |
| EVIDENCE | 근거 | `I:/EXODUSER-Storage/tripo-chest-game/20261102/loot-spread/REPORT.md`. 자동8건·실제 본편 R 개봉/착지·간격/벽 검사. 첫 타이밍 검수 실패도 별도 보존. 검수 상자를 쓴 범위이며 보스 자연 처치 증거가 아님 |

- 후속 최종 실제 R 300ms 홀드: 장비5개, 착지 전0.333초에5개 모두 미수거/표시 대기, 착지 후5개 유지. 반지름150px·최소 간격83.9487px·5개 모두 보행 가능. 악의1027→1034(+7). 1920×1080/3840×1080 실제 표시 확인, 개봉 관측 구간 오류/요청 실패0(이벤트 유실0).

## 검수 근거와 남은 범위

- 기존 상자 보상 조각을 실제 소스에서 실행하는 회귀: 거리 조건·장비3~5개·추가 보상·재입력 무보상 확인. 수량/확률을 새로 정의하지 않는다.
- RED: 분리 경첩/열림 모듈 부재2건 실패, 기존 보상1건 통과. GREEN: 위3건 통과. 자동 검사와 실제 게임의 시각/조작 검수는 별도다.
- 실제 본편1920×1080에서 R 입력→장비3개·악의오브+7, 재입력 추가보상0을 확인했다. 3840×1080 표시·item 제거 시 숨김/열린 상태 복귀·실제 GLB 요청 차단 시2D 폴백 및 기존 R 보상도 확인. 검수 fixture·구간별 일시정지이며 보스 자연 처치/자연 완주 증거가 아니다.
- V1의 뚜껑 안쪽 소실을 실제1x에서 발견해 `ChestLidUnderside`를 추가하고 같은 열기 경로를 재검수했다. 최종19452삼각형·2679056B이며 V1 실패 화면/자산은 소유 검수 폴더에 보존.
- 실제 게임 검수·사진/영상·1x 비교·로딩 실패·최종 패키지 증감·Git 근거는 `I:/EXODUSER-Storage/tripo-chest-game/20261102/REPORT.md`에 기록한다. 검수용 chest를 배치한 경우 보스 자연 처치/자연 완주와 구분한다.
- 큰 형태·경첩 축·내부 빈 공간·재질·지면 접촉이 실제 게임에서 성립하는지 우선 판단한다. 원본의 복잡한 철제 장식/불규칙 모서리 개선, Unity 및 다른 구형 테스트 HTML의 열림 이식은 별도다.

## MAP PRODUCTION REPORT

| 구역 | 이번 범위 |
|---|---|
| STAGE / MASTER | 기존 CH1·보스 보상 상자. 실루엣·지역·남북 주 경로·전투/여유 공간 설계 변경0 |
| OUTER MASS / LARGE / MEDIUM | LEFT/RIGHT/TOP/SOUTH·합성·중형 접합·기존 남은 hole 무변. 기존 맵 PASS를 새로 주장하지 않음 |
| GROUND | 상자 바닥 원점 투영·소형 접촉 그림자만 검수. 바닥 원화·오염·정적 맵 geometry/collision 무변. 최신44×24 상자 동적 몸통 충돌은 위 계약 적용 |
| PLAYABLE / LANDMARK | 기존 보스 보상 tertiary interactable. 랜덤 scatter·주 경로 이동0. 기존 보상 상자 몸통에만 동적 장애물 추가 |
| CAMERA QA | 실제 검수 위치/해상도·닫힘/열림·플레이어/전리품 가독성은 REPORT. 미관측 START/EARLY/SIDE/LATE/EXIT는 전체 맵 검수로 확대하지 않음 |
| TECH QA | route/collision 보존, pageerror/404/GLB 로드/프레임·폴백·보상은 REPORT의 실제 결과 |
| FILES / GIT | 상자 자산·모듈·bootstrap·출고 FILES·테스트·제작도구·관련 docs만 자기 소유 작업본에서 변경. 기존 G 사용자 INDEX·아트 WORK는 보존 |
| VISUAL VERDICT | RETOUCH: 실제 닫힘→뚜껑 개봉·유지와 내측 면은 확인. 원본의 불규칙 금속 장식/거친 재질은 남음. 기능 PASS와 구분하고 원본 조형 RETOUCH 이력은 유지 |

정확한 출처/축/크기/파생 SHA: `I:/EXODUSER-Storage/tripo-chest-game/20261102/asset-receipt-v2.json`. 제작 `.blend`와 이전 런타임 백업도 같은 소유 폴더에 보관한다.

## 2026-11-02 21시 인수 — ea24 정확 합본의 실제 산출물·브라우저 검수

이 절이 이전의 ea24 `실artifact/browser 미착수` 상태보다 우선한다. 검수 runtime은 `ea24a3bfb6d2d381f520eb81ac1978d8bfde9bab`이며 이후 문서 마감은 제품 코드·자산 변경이 아니다. main/public/Unity/Windows Desktop 최신화와 구분한다.

| 항목 | 실제 결과와 검수 경계 |
|---|---|
| 입력·공식 산출 | 필수3346경로 Gitblob mismatch0, selected3244,94논리93물리. 공식 build→prepare→check 각1회 exit0. stage는 sidecar포함3238파일3996969288B, prepare가69482B sidecar를 상위 검수 receipt로 이동한 최종static은 **3237파일3996899806B / 4GB여유3100194B / 최대94795327B**. 수동 파일 보충·상한 완화0 |
| 산출 identity | config SHA256 `1a8bab831dc2e583724b2a5b6a6790d30467fb37c4dcf5ff3180fc87d87614b2`; derived receipt `64825b7c9bbf1e2c7dd80ef29ffcbe56902655a3a4ec7d56ec85782cc4c75a80`. sourceplan과 실제prepare 후 파일수/byte를 혼동하지 않음 |
| HTTP·실행 | 새 loopback artifact의 GLB/chestmodule/titleJS/C2영상3/still/moon/cloud/fall 11URL fullGET200·MIME·전체SHA 일치. 같은 산출물의 격리 headless Chrome DPR1에서 실제 namespace/영상·moon/cloud/flow 증가, 숨김 정지·destroy·motion-reduce/영상오류/plate오류 폴백 확인 |
| 상자·전리품 기능 | 1920×1080의64CSSpx/44×24worldpx 몸통. 닫힘·열림 WASD 정지/우회·겹침 탈출·상자 제거 후 통행, GLB차단의 실제2D draw 확인. 별도 같은artifact fixture에서 R160ms 홀드→장비3개, 순차 분출134샘플·비행중 미수거·착지후 수거·추가보상0·pause/resume 확인. game/chest 최종검사 각각9건 통과. 보상수량/RNG/게임수치를 새로 정의한 것이 아님 |
| 시작·걷기 | 타이틀→시네마틱→데모→빈 offline 로비 earlyInit 경로, pageerror0. 대표 서쪽 걷기0/3의 실제 drawImage 셀256px 확인. 일반본편 skin 주입·상태제어이며 자연AI전투/85걷기전체/OS 손입력 검수가 아님 |
| 실패 보존·fixture | 연습모드의 worldItems 교체/R제한, intro 이전 G.on 대기, skip overlay, 프레임 사이 zero-duration R 입력 실패를 원인별 분리 후 실제 UI순서/프레임을 넘는 홀드로 교정. 제품 코드 변경0. 최종 navigation/closed/fallback/walk와 open-flight-pickup은 분리 fixture이므로 한 번의 연속 자연 플레이 PASS로 확대하지 않음. 과거 실패 JSON은 남지만 일부 중간 PNG는 최종 재촬영으로 덮여 과거 실패 이미지 byte 전체 보존 증거는 없음 |
| 16:9 원본 인수 | root가1920×1080·3840×2160 타이틀 및1920×1080 상자 닫힘/열림 원본4PNG를 파일SHA·IHDR 대조 후 직접 열었다. **3840×2160은16:9이며32:9 증거가 아니다.** 달 전체·발 지지·로고/메뉴 분리는 해당16:9 원범위로 확인 |
| 실제 와이드 추가 검수 | 같은 artifact만 재사용해2560×1080·3840×1080/DPR1/일치하는 canvas·CSS·PNG 치수, 모션 증가·가로넘침0·pageerror0을 별도 확인. 신규 build0·전체suite 반복0. 양발·달은 보이지만 전체그림 center-cover로2560×1280 y=-100 /3840×1920 y=-420을 그리므로 캐릭터 확대와 상하 배경 크롭이 생김. **기술 PASS / 와이드 구도 RETOUCH**. stage의 기존 cover 수치는 임의 변경하지 않았고 DESIGNLOCK 캐릭터 보존·배경 확장 목표의 품질 공백으로 남김 |
| 아트 판정 | **상자 금속·목재가 실제64px 화면에서 너무 어두워 RETOUCH**. 기능 PASS로 금속 조형/재질 완성이나 전체맵 PASS를 선언하지 않음. 조명/노출/IBL 원인 추정은 실제 같은-camera A/B 전 확정하지 않음 |
| 저장·무음·종료 | ordinary11/currentPrefs2 raw사전백업·사후13개동일, installed5/WIP25/공유HEAD·branch·INDEX·WORK/원본7014metadata 불변. 자기출력 후단 gain0·analyser peak0·direct video unmuted0(실OS loopback 청음 아님). 자기 Chrome·loopback 서버 정상종료·PID/listen잔여0, 사용자 Chrome 보존. 이전 소형 proof sender도 /done 정상close와 실제PID/listen0을 확인 |
| 배포 경계 | 일반userprofile/Unity/NW/실모니터/자연보스처치·전체맵/한타FPS·1%low·public/API 완주 PASS가 아니다. `/api/mats`405는 정적 fixture 제한, Supabase/외부font 요청차단은 의도된 격리. public402 조건에서 mainpush/재배포 반복0, Windows/바로가기 전달0 |

근거: Mac `_out/web-chest-final-qa-20261102/{FINAL_RECEIPT.json,REPORT.md,browser-ea24-game-final-result.json,browser-ea24-chest-input-result.json,wide-aspect-qa.json,static-full-manifest-ea24.json}` 및 root `I:/EXODUSER-Storage/codex-takeover/cto-runtime-diagnostics/existing-owner-recovery-20261101/web-ea24-final-intake-20261102/`. 원본 화면·해시·보존·정상 종료를 인수한 범위만 판정하며 기능 통합과 아트 재작업을 분리한다.

추가 root 원본 인수: `title-C2-2560x1080-wide-original.png` 3770249B/SHA256 `3269a2153d20674d78356f75bafdef0a9b4cd472c47eb44aa7871bc5b647368f`, `title-C2-3840x1080-wide-original.png` 5073289B/SHA256 `9c76fc071d302bf734bc053b12539e6fd3ddb509abf02e57e4e9004281981cd3`. root가 수신 byte·IHDR를 대조하고 두 전체 원본을 직접 열어 위 구도 RETOUCH를 확인했다. UI 화면맞춤 미리보기는 물리 모니터1:1 검수로 주장하지 않는다.


## 11/02 재질 가독성 재작업 — source-only 후보·미채택

공식 ea24 실행본의1920×1080 닫힘/열림 원본과 Tripo viewer/실제 내장 텍스처를 직접 대조했다.64px에서 목재·철테·장식이 어둡게 뭉치는 결함은 남아 있다. 아래 후보는 기존 작업 브랜치에만 보존하며 main/실행본/아트 채택을 뜻하지 않는다.

| id | 항목 | 후보 계약·검증 경계 |
|---|---|---|
| INPUT | 실제 원본 | CTO ea24 `chest-closed-original.png`/`chest-open-loot-original.png`, 기존 Tripo `viewer.jpg`, GLB 내장 basecolor1024²·normal512²·RM512². 경로/CPU 분석은 아래 REPORT |
| FACT | PBR 경로 | 본편 importmap은 Three r160. 기본색은 GLTFLoader의 SRGBColorSpace, roughness=G/metalness=B의 선형 데이터, glTF 기본 OPAQUE·텍스처 알파255 확인. RM B평균49.55661/max218, G평균137.92878. 채널 반전·색공간·알파 오류를 원인으로 확정하지 않음 |
| HYPOTHESIS | 한 개 방법 | 기존 상자 scene.environment 부재를 분리 시험한다. 어두운 기본색(RGB평균34.97/35.65/34.85)과64px 축소도 관측됐으므로 IBL 부재가 주원인이라는 판정은 GPU A/B 전 미확정 |
| PRESERVE | 고정 기준 | ACESFilmic·exposure1.25·hemi2.5/key3.2/fill.8, PBR map/normal/RM·불투명도·emissive·원GLB/형상·뚜껑·64px·44×24충돌·R 보상/분산·game.html 보존. 전역 노출·크기 확대·흰 발광 추가0 |
| ENV | 반사 데이터 | `createChestEnvironmentTexture`:128×64 RGBA Uint8=32768B, 알파255, srgb-linear, EquirectangularReflectionMapping, 가로Repeat·LinearFilter. 실제 후보 데이터 RGB범위2~149(흰색255 없음). 외부 HDR/이미지/Three 버전/자산 추가0 |
| PALETTE | 선형 RGB | ground(.018,.012,.009), sky(.16,.20,.24), warm(.46,.42,.34), cool(.10,.14,.18). up=sin((v−.5)π), 상하보간(up+1)/2; 주방향(−.6,.55,.58)의 양수 dot^8, 보조(.8,.2,−.56)의 양수 dot^12. 픽셀 셀 중심 표본·RGB×255 반올림 |
| INTENSITY | 재질 국소 | `CHEST_ENV_INTENSITY=.65`를 해당 모델의 고유 MeshStandardMaterial만 적용. 원본 basecolor/metalness/roughness/emissive/alpha를 재작성하지 않음. 기존 접촉 그림자·다른 장면에는 적용0 |
| AB | 같은 실행본 | `_chest3d.setEnvironmentEnabled(false)`=scene.environment null + 원래 envMapIntensity 복원, true=같은 준비된 반사 texture/.65. 저장·게임 UI 설정은 쓰지 않음. snapshot.environment의 prepared는 CPU 데이터 준비이며 GPU/시각 PASS가 아님 |
| PMREM | r160 자동 경로 | 실제 렌더 때 WebGLCubeUVMaps가 source를 PMREM으로 변환·캐시. 소스 계산상 cube32→각336×128 RGBA16F 출력/임시타깃, 원본32768B 포함 명목약720896B(.6875MiB). shader/정렬/드라이버·실측 GPU/프레임 비용 미포함, 실제 비용 검수 전 예산 통과 주장0 |
| DISPOSE | 실패·종료 | source texture.dispose→r160 캐시 타깃 해제 이벤트, 실제 고유 geometry/texture/material dispose + renderer.dispose/own context loss. api.dispose는 멱등·RAF취소·ready/active=false. 로드 중 종료 후 늦게 도착한 모델도 해제. snapshot.resources는 해당 renderer의 카운터만 노출 |
| FALLBACK | 예외 | GLB/의존성/환경 준비 또는 첫 render 예외→한 번 failed, 자원 해제·overlay 숨김·기존 native2D 보존. 새 프레임에서 반복 로드/실패 렌더를 하지 않음 |
| CPU QA | 최소 회귀 | 새6건 RED→GREEN + 기존 상자/패키징12건=18 PASS. 실제 Three r160 Texture/Material/Geometry.dispose 이벤트와 PBR 불변 검사. WebGLRenderer/네트워크 GLTFLoader는 CPU 주입 대역이며 하드웨어 해제·색·오버레이 비용은 검증하지 않음 |
| HANDOFF | 다음 gate | 기존MacUI idle/소유 확인 뒤 격리 same-artifact64px baseline/candidate 닫힘·열린 내측 A/B/실제1x·fallback·dispose·오버레이 비용. PC CUA/Chrome/OBS/게임/Unity/Player/빌드/렌더/GPU/인코딩·신규유료0. 후보 시각 판정 미검증, 기존 재질 RETOUCH 유지 |

근거·후보 차이·실행 명령·정확SHA: `I:/EXODUSER-Storage/tripo-chest-game/20261102/material-readability-rework/REPORT.md`. 두 번 같은 핵심 시각 실패 시 수치 미세 반복 대신 재질/표현 방법을 다시 정한다.



## 2026-11-02 21:45 — 상자 반사 환경의 검수용 후보 반입

| 항목 | 정확 범위·현재 검증 |
|---|---|
| 출처/범위 | 원 담당 private450a6bfa2d2a027728280039267d63f8a29dca0d에서 chest3d.mjs 한 개와 신규 CPU회귀 한 개만 선택 반입. 기존 루트2f37의 exactea24 검수/문서·게임/타이틀·95→94활성매핑·걷기/사슴 복구를 보존. wholebranch/main merge·공개 배포·제품아트 채택 아님 |
| 모듈 | 기존5632B/SHA90ea0ef8f285ef507d1b3d8b994fb07cc8b21c5969c9d06ff403f14f9d5f9eac → 후보9256B(+3624)/SHAa16f2f94fe26d4c63ff997701fa6415db6402c65879c9c03a05d16cc2e567da9. 반사128×64 선형RGBA/.65, 같은모델 환경off/on, 실패·dispose해제 경로. 숫자/공식/팔레트·캐시 한계는 TRIPO_CHEST_GAME_20261102.md 새후보표가 정본 |
| 보호 | GLB2679056B/19452tri·PBR입력/노출1.25/원광원·64CSS/44×24body/열기·R분출/수거·보상RNG/save/AI/game/index/title·파생94논리93물리 byte불변. 외부guard/WIP/사용자PC앱조작0 |
| 검증 | 루트 원본에서 신규6회귀 기능부재 RED→정확모듈반입후 신규6+기존12=18 PASS. 실제Three자원 이벤트+주입 renderer/loader의 CPU검사이며 실제PMREM/GPU/시각/비용은 미검증. baseline/candidate 같은64px 닫힘/열림과 실제fallback·dispose를 같은Mac 격리앱에서 다음 검수 |
| 출고 예산 | 추가런타임 파일0·모듈+3624B. 이전ea24 actualstatic3996899806B 기준 예상3996903430B/4GB예상여유3096570B, sidecar포함 sourceplan예상3996972912B/예상여유3027088B. 아직 새공식plan/artifact가 아닌 차이 계산이다. 공식새build→prepare→check/wholemanifest·HTTP SHA는 후보정상commitpush 뒤 같은Mac에서 확인 |
| 판정 | **미채택·GPU시각 미검증 / 기존 상자재질 RETOUCH**. 원인 가설(금속반사환경부재)은 A/B 전 미확정. 이전ea24의 기능한정PASS/와이드구도RETOUCH와 별도. 같은핵심시각2FAIL이면수치미세반복 대신방법전환 |

근거: I:/EXODUSER-Storage/codex-takeover/cto-runtime-diagnostics/existing-owner-recovery-20261101/chest-material-450a6bfa-intake-20261102/{candidate.patch,red-root.log,green-root.log,producer-REPORT.md}.

추가 루트 통합 검사: 상자·패키징·웹선택/무손실파생·staging·C2·시작/슬롯/저장/타이틀 이동의 관련15개 테스트파일 **112/112 PASS**. 이 수치는 이전합본133개 전체 재실행 결과가 아니며 GPU/자연전투 검수로 올리지 않는다.


### 21:45 후보의 최종 수명 수정 인수

원 담당 최종 `6a41b6229fd09d05c7568e4720c4a29d54855739`가 초기450 후보를 대체한다. teardown 때 `root.clear()`와 modelRoot/root/lid/light/shadow/foot/camera 참조 비우기만 추가했다. 부모 root에 남은 model을 새 assert로 RED 재현한 뒤 최종모듈에서18/18 PASS. 반사색·광원·환경생성·표시/판정 수치는 초기450과 동일이며 시각 검수는 아직 없다. 초기450 및 루트4a8609의 source검사/원격 이력은 최종GPU 검수로 바꿔 표시하지 않는다.

| 항목 | 최종 후보값 |
|---|---|
| runtime | chest3d.mjs9307B,기존5632B대비+3675B/초기후보대비+51B; SHA256 `4cfa51bafddd65e8fb6a1009eb63f5d10c2e3367052a9d32d8a97a2b95fdc442` |
| 예산 | 이전ea24 actualstatic3996899806+3675=**예상3996903481B/여유3096519B**, sidecar포함 **예상3996972963B/여유3027037B**. 새공식plan/artifact 미실행이며 Mac 실제값으로 대조해야함 |
| 전달 상태 | 초기4a용Mac작업문은 **native전송전 최종수정으로 보류**했다. 최종정확commit/privatepush/remote후 같은Mac에게정정된전체문 단회전달. 중복QA·과거수락재전송아님 |


## 2026-11-02 22:15 — 9d 상자 반사 후보의 실제 GPU 검수 마감

| 항목 | 실제 인수와 판정 |
|---|---|
| 소스/패키지 | runtime9d269179f4dccaf6fd48d6e2d93277181dc8b630/원담당6a41b622. 입력3349/mismatch0/selected3244·94논리93물리,공식build→prepare→check각1회 exit0. stage3238/3996972963B에서69482B sidecar이동 후 실제static3237/3996903481B·4GB여유3096519B/max94795327B. 이전예상값을실산출로인수했다 |
| 실제 경로 | 단일loopback의원본ea24/후보9d분리. module2/GLB2 fullGET200·MIME·SHA 및actualloadedmoduleSHA일치. actual AppleM5Pro/ANGLEMetal/Three r160/WebGL2/DPR1,1920×1080·3840×1080의64CSSpx 같은camera/pose fixture. 자연OS입력/보스처치/전체맵검수 아님 |
| A/B 한계 | 최초render전API setter로env-off freshA확인. 원본baseline과A는camera/PBR/exposure동일하지만배경particle차가있어전체pixel동일주장0. A→A2의닫힘·열림64px crop은각changedpixel0. B뒤A2는PMREM캐시보유이므로freshA비용으로세지않음 |
| 실측 비용 | 닫힘warm각116표본(첫10제외): GPUmean/p95 A0.383/0.515ms→B0.484/0.622ms,CPUmean/p95 A0.218/0.400→B0.203/0.400ms. 실제EXT_disjoint_timer_query_webgl2/disjointfalse·순차클럭/프로브오버헤드한계. 첫B CPU15.400ms/GPU0.914ms. texture4→7/geometry5→13/program3→7. 전체FPS/1%low·VRAM/heapbytes 인증이 아님 |
| 실제수명/폴백 | GLB차단→native2D/R보상·actualcontextlost,실GLB1800ms지연후dispose/late모델해제,첫actualrender호출의제어된Scene예외→catch/release. main dispose멱등·RAF정지/readyactivefalse·scenechildren0,고유dispose texture5/material5/geometry13각1회,expectedcontextlost확인. 자발적인GPU드라이버고장검사는 아님 |
| 잔여카운터 | main해제후JSrenderer.info texture1/program2/geometry0을그대로보존. source/PMREM해제이벤트·actualGLcontextloss·pageclose가근거이며모든카운터0·즉시VRAM회수·GC검수로가장0 |
| root실물 판정 | root는SHA/IHDR검증한4개의scale1 A/B strip과1920후보닫힘·열림전체원본2장을직접열었다. **RETOUCH/재질가독gate미달·반사환경방법미채택**: 일부모서리차이만미미하고금속/목재/잠금쇠·열린내측이여전히어두운회녹색덩어리다. 추가자원/밝기숫자로아트PASS를주지않음 |
| 보존/종료 | ordinary11/currentPrefs2 raw사전backup과사후13동일/installed5·WIP25·공유HEADbranchINDEXWORK·globalGitconfig·원본7014metadata 및이전ea24입력/출력10477metadata동일. 자기최종gain0/peak0/directvideo0,ownChrome잔여0·서버52927/61290 정상close뒤ps/listen0,사용자Chrome보존. 최초828B누락/옛Prefs2FAIL소급해소0 |
| 실패 근거 한계 | 초기prototype계측미연결·pause메뉴가림을교정한rawJSON/log/메뉴witness1장을보존. 담당이중복무효PNG등8723172논리B를삭제했으므로실패이미지byte전체보존은아님. 제품compile/GPU실패로오인하거나삭제로FAIL을숨기지않음 |
| 다음 | 새빛/환경강도/노출미세반복0. 기존원담당에source-only 국소알베도/금속·목재부위명암분리 한개방법후보를이어배정. 실패반사기본경로OFF·추가PMREM없음·수명안전보존·원텍스처/GLB/UV/형상/64px/게임수치불변을검증하고sameMac실1x전미채택. 새유료/생성/PCGPU0. 이문서마감으로새제품효과개선을주장하지않음 |

근거: root `I:/EXODUSER-Storage/codex-takeover/cto-runtime-diagnostics/existing-owner-recovery-20261101/chest-material-450a6bfa-intake-20261102/proof-final-9d2691/{FINAL_RECEIPT.json,REPORT.md,manifest.received.json,receiver-receipt.json,root-review.json}`. 원본6뷰·scale1배치의bbox/SHA는manifest와receipt에있다. runtime9d와이후docs-onlycheckpoint/공개·Windows·일반앱설치를구분한다.
