# CH1-1 숲 깊이·접지 리터치 — 2026-09-17

## 1. 실제 결과 화면과 영상

**실제 적용 버전 `20260917-depth-2` / VISUAL VERDICT: RETOUCH.**

- [원본 전후 12쌍 + 영상 검수 페이지](../../captures/ch1_depth_20260917/index.html)
- 서버 실행 중: <http://127.0.0.1:3333/captures/ch1_depth_20260917/index.html>
- [경관 입력 종주](../../captures/ch1_depth_20260917/input-walk.webm): Lv500, mapqa=1, 적 OFF, QA 무적. START→북측 출구 앞. 일반 클리어가 아니다.
- [Lv1 전투 시도](../../captures/ch1_depth_20260917/normal-attempt.webm): 피해 무효 보정 없음. 첫 공터 사망.
- [전체 런타임 배치](../../captures/ch1_depth_20260917/runtime-full-layout.jpg): 4800×2700 논리 카메라/zoom .3/횃불 OFF. 보조 검수용이며 기본 카메라 판정을 대체하지 않는다.

전후 캡처는 동일 좌표/1920×1080 논리 카메라/zoom1/횃불·안개 ON. 색보정·합성 없음. 테스트 캐릭터 장비는 무작위 생성되어 서로 다르고 입자 시간도 다르다. 정지 화면은 좌표 지정으로 촬영했다. 입력 종주 녹화 중에는 좌표를 바꾸지 않았다. 영상은 게임 캔버스 15fps 원본으로 DOM HUD와 음성은 포함하지 않는다.

### 실제 적용한 내용

| 항목 | 현행값·역할 | 범위 |
|---|---|---|
| 숲 원화 | `forest_stand.png` 1024×1536 | 키 큰 고목의 층과 외곽 높이 |
| 바위·고목 턱 | `root_bank.png` 1536×1024 | 낮은 쓰러진 나무와 바위 경계 |
| 부러진 잡목 | `broken_thicket.png` 1536×1024 | 큰 수직 나무와 다른 낮은 실루엣 |
| 지면 뿌리 | `root_fan.png` 1536×1024 | 나무 앞과 길 어깨의 낮고 통과 가능한 지면 |
| 외곽 고정 배치 | 42 = 어두운 후경 10 + 중·근경 32 | 기존 외곽 mask에 bake; 신규 충돌 없음 |
| 뿌리 연결 | 9 | 나무 앞 1 + 입구·공터·연결로·북측 8 |
| bake 레이어 | ground23 / forest42 / connections20 | connections = 기존11 + 신규뿌리9 |
| 이전 시체 얼굴 경계 | builder의 `collision/bound*`, `corner*` 배치 0 | 고목/바위/잡목으로 교체. runtime의 다른 기존 구조물은 유지 |
| 거대 시체나무 | stage0 hand prop만 화면 배율 .72, pivot (.5,.72) | metadata sz1450 유지, 표시 최대변1044; 충돌380×230 그대로 |
| 나무 위치 | runtime (102.5,90.5) | 이동 없음 |
| 청크 | master8192², 64개, 1024 core+1px bleed =1026² | core→월드1000px, 기존 캐시 렌더 사용 |
| 지형·배치 | 200×200 / 53점 경계 / 8구역 / authored62/runtime63 | layout.js 바이트 동일, 스폰·진행 규칙 유지 |
| START/EXIT | START(100.5,185.5), gate y5 / exit y7 | 유지 |

원화는 imagegen으로 새로 제작했다. 정확한 프롬프트·출처는 `assets/map/ch1/production_finish/depth/generation.json`, 위치·명암·채도·배율은 같은 폴더 `composition.json`이 SSOT다. 타 게임 추출 에셋은 사용하지 않았다. Dimraeth의 경관/보행 지면 분리와 큰 환경 덩어리 연결을 적용한 **우리 배치 판단**이며 원작의 절차 생성 구조를 입증했다는 뜻이 아니다.

초기 depth-1을 실제 카메라에서 확인한 뒤 depth-2로 수정했다. 나무 앞 뿌리 scale1.05→.85, 뒤쪽 숲을 앞쪽보다 먼저 합성, 첫 공터·북측 어깨에 낮은 뿌리 4개를 추가했다. 최종 비교 이미지는 depth-2다.

## 2. 이번에 실제 실행하여 확인한 사실

### 플레이

| 시도 | 시작 조건 | 결과 | 한계 |
|---|---|---|---|
| Lv1 실제 피해 | 새 로컬 슬롯 `depth0917normal`, test=1은 로컬 저장 경로, testchar/mapqa 없음. HP563. 기본 흰 장비와 시작 유골함, 기본 9스킬 Lv1. 난이도5/자동물약99%. | START에서 실제 키 입력·더블탭 이동. 첫 공터에서 적 추격, 근접/석궁 공격 및 피격. 17처치 후 (101.15,141.87), HP0. | 시작 공유 악의999999가 로드됨. 재화 소비·스탯 수정·피해 무효 없음. 완전히 초기화된 계정과 동일하지 않음. 일반 클리어/1-2 진입 실패. |
| 경관 종주 | testchar1 Lv500 / mapqa1 / 적 OFF / QA 무적 | START→(100.5,122.64)→서측(81.57,122.64)→나무 서측(81.57,78.89)→북·동측(125.32,91.57)→북측(125.32,34.10)→출구 앞(100.14,9.10) | 기존 완료 조건 미충족, stage0 유지. 동측 남하 입력 일부에서 변위 없음: 입력/회피 쿨다운/지형 원인 미분류. 동측 전체 우회 무끼임 PASS로 쓰지 않음. |

장비·설정 수치는 `play-start.json`, 종료는 `play-end.json`, 경관 이동 기록은 `input-walk-log.json` 참조. 시작 시 기존 인트로 보호 프레임이 있었고 전투 중 0으로 자연 감소했다. 추가 무적 보정은 넣지 않았다. 사망을 맵 오류나 난이도 불가능의 증거로 단정하지 않는다.

### 기술 검증

| 항목 | 실제 확인 | 근거·범위 |
|---|---|---|
| stage0 로딩 | 실제 화면에서 새 숲/뿌리/축소된 나무 확인 | `after/` 12개 캡처. `_CH1S1` stage1과 구별 |
| 기존 회귀 | 26/26 PASS | `ch1ProductionFinish`, `ch1StartOuterMass`, `ch1StartSmoothingPass`; 일부는 과거 smoothing 계약 검사 |
| geometry 보존 | PASS | layout.js 바이트 동일; hash `719b681344bf0ab5dc07ae58cb4c01342ca85fde6386a01753d147a66e6ee78c` |
| 청크 해상도·접합 | 64개1026² / 인접112곳 bleed 일치 | `technical.json`, `tmp/ch1_depth_20260917/verify.mjs` |
| 새 배경 로딩 | 64/64 ready, errors0 | 전체 런타임 카메라에서 확인. 전역 모든 에셋404를 뜻하지 않음 |
| 콘솔 | 수집 콘솔 error0, Three.js 중복 import 경고1 | `normal-console.json`; 기존/신규 판별 근거가 없어 경고는 **미분류** |
| 전체 pageerror/404 | **미검증** | CDP event 수집 결과가 비어 있어 시작부터 종료까지 완전한 요청/예외 로그라고 보증할 수 없음. 점검 중 잘못된 진단 변수 조회 ReferenceError2회는 진단 호출 실패이며 게임 신규 오류로 세지 않음 |
| 성능 | 변경 전 mean16.72ms/p95 41.70ms, 후 mean16.62ms/p95 41.70ms | 서측(39,112),1920×1080,z1,횃불ON,정지5초씩. 동일 현재 렌더러/캐릭터에 이전·현재 배경 교체. 전체 전후 게임 벤치마크 아님. `performance.json` |
| 타 스테이지 | 자체 game.html 변경은 캐시태그와 stage0 hand tree 분기뿐 | CH2/CH3 및 전투 로직 수정 없음. 다른 작업자의 칼날개 VFX 동시 변경을 분리. 타 스테이지 새 실행 회귀는 미수행 |

## 3. 위치별 남은 결함과 미검증

| 화면/위치 | 판정·눈에 보이는 근거 | 최소 후속 수정 |
|---|---|---|
| 02 첫 공터 (100,151) | RETOUCH. 가장자리 뿌리는 생겼지만 넓은 중앙 바닥의 평평한 인상은 남음 | 전투폭 유지하면서 흙/낙엽의 큰 비대칭 마모 흐름 보완 |
| 03 연결로 (82,122) | 정지 화면에서 큰 사각 패치 절단은 두드러지지 않음. 모든 연결부 전투 검증은 아님 | 적 추격을 동반한 재통과 필요 |
| 04 나무 앞 (102,101) | 나무·뿌리·흙이 연결되고 캐릭터는 가려지지 않음. 나무 뒤 적의 가림은 미검증 | 북측 전투 가림 확인 후 필요한 부분에만 투명 처리 검토 |
| 05 서측 (39,112), 11 남서 (61,161) | 기존 얼굴 띠 제거는 명확. 큰 갈라진 나무 줄기 원화가 여전히 재사용됨 | 인접 구간 일부를 낮은 고목과 돌출 바위로 교대 |
| 07 야영지 (45,109), 09 웅덩이 (157,54) | 기존 두꺼운 윤곽선 구조물과 세밀한 새 숲의 화풍 차이 | 해당 구조물 가장자리·지면 접점만 스타일 보정 |
| 08 동측 (137,112) | 타원형 그림자와 구조물 하단의 조립감 잔류 | 그림자/접지 국소 보정 |
| 12 북측 (100,52) | 장소가 이어지지만 넓은 바닥 중앙이 약함 | 공터와 출구 방향의 재질 흐름 보강 |
| 전체 축소 | 세로 명암 절단이 보임. 원인 미분류, 청크 픽셀 접합 통과로 무시하지 않음 | 동일 위치 기본 카메라와 축소 렌더 캐시를 비교하여 분류 |
| 실제 전투 | 첫 공터에서 캐릭터·적·탄을 식별했지만 밀집 피격과 동시 VFX로 혼잡 | 나무 구역과 출구 전투 재검증 필요 |

새 고목은 기존 지형 외곽에 bake했고 저지대 뿌리는 보행 가능한 바닥이다. 새 그림이 명확한 장애물처럼 보이는데 통과 가능한 지점이 없는지 전 구간 인접 보행 검증은 아직 끝나지 않았다. 정상 완료 조건/1-2 진입/전체 난이도/모든 스폰 접근성 재실행도 미완료다.

## 4. MAP PRODUCTION REPORT

| 구분 | 결과 |
|---|---|
| STAGE | CH1-1 / STAGES[0] |
| MASTER silhouette / regions / main route / side spaces | 기존 비대칭53점/8구역/남→북/좌우 사이드 유지 |
| OUTER LEFT / RIGHT / TOP / SOUTH / major holes | 좌:키 큰 숲+고목 턱, 우:낮은 잡목·바위와 높은 숲 교대, 북:출구 프레임, 남:진입 숲. 의도적 낮은 구간 외 빈 검은 구멍은 기본 캡처에서 두드러지지 않음 |
| LARGE source assets / composites / overlap / repeated silhouette | 신규4원화, forest42, 후경 먼저 합성·기존 mask. 큰 고목 재사용 잔류 |
| MEDIUM connections / remaining holes | 기존11+뿌리9. 야영지·동측 단 접지 리터치 남음 |
| GROUND shadow / contamination / structure integration | 기존 조명 유지, 지면뿌리 통합. 동측 타원 그림자 잔류 |
| PLAYABLE main arenas / travel / breathing / threat / readability | geometry 유지. 첫 공터 실제 전투 및 서측 우회 입력 이동. 밀집 전투·나무 뒤 가림 검증 미완료 |
| LANDMARK primary / secondary / tertiary | 시체나무 / 기존 캠프·단·웅덩이 / 기존 소규모 소품 유지 |
| CAMERA START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | 01 / 02 / 02 / 05·07·11 / 08·09 / 04·10 / 12 / 06 원본 전후 |
| TECH route / collision / pageerror / 404 / seam / loading / performance | 위 기술 표. 미측정 항목 PASS 처리 없음 |
| FILES stage-owned | production_finish master/chunks/manifest/depth, builder, game.html 자체2hunk, 이 보고서 및 SSOT 현행 주석 |
| FILES concurrent touched | game.html 칼날개 VFX, 관련 스킬/VFX문서·테스트, CHANGELOG_SYNC의 기존 동시 작업 내용은 보존 |
| FILES unrelated touched | Steam 검수 문서, guard.baseline, userdata 캐시는 변경·포함하지 않음 |
| GIT staged / commit / push / deploy | 이번 범위만 분리 커밋. 캡처는 로컬 ignored artifact. push/deploy 없음 |
| VISUAL VERDICT | **RETOUCH** — 외곽과 나무 접지는 개선, 상용 최종 완성 승인 아님 |
| NEXT PASS | 위 위치별 최소 수정·보행과 실제 전투 잔여 QA. 전체 맵 재제작 불필요 |

## 5. 파일·검증 이력과 인계

- 시작 HEAD `bc2cb1689`의 ground-2 기준. `ec7bf70d8` 이후 지면 개선을 보존하고 그 위에 추가했다. rollback 없음.
- 수정 전 백업: `tmp/ch1_depth_20260917/backup/`.
- docs 전체 관련 검색: `tmp/ch1_depth_20260917/docs-audit.txt`; 현행 주석은 SSOT index/production/ground/final review/blockout/에셋목록에 반영.
- 변경 파일: `assets/map/ch1/production_finish/depth/*`, master/청크/manifest/preview, `tools/build_ch1_production_finish.mjs`, `game.html`2hunk, 위 문서와 CHANGELOG_SYNC.
- 원본 캡처: `captures/ch1_depth_20260917/before|after/*.jpg`와 각 manifest. 최종 상태 후속 변경은 별도 diff로 확인할 것.
- 이전 검증: ec7bf70d8 제작, 20260916 final review, ground-2 기술/전투 시도는 이전 이력이다.
- 이번 추가 검증: 신규 원화 실제 적용, depth-1→depth-2 리터치, 전후12쌍, QA 입력 종주, Lv1 피해 전투 사망1회,26테스트,112접합,정지 배경 성능 비교.
- 아직 하지 않은 검증: 일반 조건 완주/1-2, 나무·북측 전투, 동측 전체 우회 정지 원인, 완전한 예외/요청 로그, 전체 게임 전후 성능·난이도.

**Conversation recap에서도 이 세 이력을 섞지 않는다. 일반 완주나 전체 시각 PASS로 승격하지 않는다.**
