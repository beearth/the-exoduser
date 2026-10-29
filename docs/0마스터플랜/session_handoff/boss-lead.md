# 보스전 총괄 인계 — 2026-10-28 밤 Codex 인수

기준: `docs/engine/UNITY_BOSS_BATTLE_BOARD_20261026.md`, `UNITY_BOSS_RM1_DARK_DRUID_20261027.md`, `docs/11내러티브·로어디자인/DARK_DRUID_DESIGN_LOCK.md`. H5는 `main`, Unity 코드는 `unity/main` 계열 브랜치에서만 다룬다. 화면·빌드·실플레이·통합은 각각 별도 검증 단계다.

## 완료한 인수 단위

| 단위 | 결과 | 증거 |
|---|---|---|
| 드루이드 본체 ② | 기존 Meshy task `01a1829b-1b7c-7053-847b-b56d01fee87b` 성공, 30cr. 재생성 없음 | `I:/EXODUSER-Storage/Meshy/dd_body_20261028_2202/model.glb`, `preview.png`, 텍스처. 61,063 삼각형. 정면 미리보기만 직접 봄 |
| 드루이드 리깅 ③ | task `01a182c4-07f4-7446-a609-63f708705544` 성공, 5cr, 높이 2.70m | `I:/EXODUSER-Storage/Meshy/dd_rig_20261028_2247/`의 rigged FBX/GLB·기본 보행/달리기·SHA-256 목록. 24관절, 가중치 합 오류 0/99,643. 뿔 상단 Head 계열 평균 0.9826. 잔액 4178cr |
| RB1-3 예고 뷰 후보 보존 | 기존 `00353dda9`를 `unity/main` 기반 별도 브랜치에 cherry-pick해 원격 보존 | `codex/pc-boss-takeover-20261028` `204e7595a`. Unity 컴파일·확인 실행·PNG 판정 전이므로 병합 요청하지 않음 |
| LT-8 Unity 침강 위험물 정리 | `EnemyHurt.DeathHead`가 침강을 확정한 즉시 적대적 드루이드 독 탄·용암 늪·구슬 제거, 반사된 아군 탄과 무관한 탄은 보존 | 최신 `unity/main` `e4fc056ae`를 병합한 후보 `codex/pc-boss-takeover-20261028` `9d271917c`, 원격 대조 완료. Core 사망 경로 3/3 통과. H5 원본 oracle 48사례·5,421,635 비교/불일치 0(침강 사망 경로는 범위 밖). Unity Editor·Player 검증 전 |
| 드루이드 3D 첫 임포트 후보 | 승인 보관본에서 리그 FBX·127 원형 FBX·걷기 FBX와 리그 GLB 내장 PBR 3장을 정확히 가져옴. 전용 Unity 임포터·후보 머티리얼/프리팹/55° 캡처 제작 코드를 작성 | `codex/pc-boss-takeover-20261028` `21b6dd930` 비강제 push·원격 SHA 확인. FBX 3개 SHA-256 원본과 일치. Unity 두 차례 실패 후 최종 폴더 생성 수정은 재실행 전. 후보 프리팹·PNG·Humanoid 유효성·1x 디자인/Player 판정 **없음**. 상세 `docs/engine/UNITY_BOSS_DARK_DRUID_3D_IMPORT_20261029.md` |
| 드루이드 1x 형태 재검수 | 6000.6.7f1 임포트·Humanoid 유효, 55°/측/후 bind·walk·127의 1600×900 각 30장과 발 본 CSV 확보. 본 스케일 두 시안, 별도 회색 형상, 원본 정점 조형을 직접 제작·1x로 보았으나 모두 형태 FAIL | 검사 코드/문서 `codex/pc-boss-takeover-20261028` `87afe4e6b`·`cbb06e16e` 비강제 push/원격 SHA 확인. 원본의 갑옷형 흉부·수평 망토·큰 발, 127 f53의 떠 있는 발을 확인. 회색 형상은 관절 이음새, 정점 조형은 늘어난 UV가 추가 FAIL. 실패한 두 제작 소스와 프리팹은 `I:/EXODUSER-Storage/codex-takeover/boss/failed-sculpt-source-20261029/`에만 보존. 기술 임포트 성공을 디자인 채택으로 보지 않음 |
| I: 새 작업본과 무비용 조형 | 이동된 `I:/exoduser-wt/codex-boss`의 미추적 BGM을 보존하고, 별도 sparse `I:/exoduser-wt/codex-boss-sculpt`에서 진행. 새 연속 표면 본체 정면/55°/측/후는 인형 같은 팔다리·단순 V 뿔로 **VISUAL FAIL**, 게임 미채택. 독립 왼손 지팡이 2.30m OBJ/MTL·재생성 소스·검사 코드는 `Studies`에 보존, 자체 55° 1600×900에서 구조는 읽히나 규칙적인 뿌리와 단색 표면으로 **RETOUCH** | `codex/pc-boss-takeover-20261028` `e368813d39660ecc2def0e7bc39f868d00e8b00c` 비강제 push·원격 SHA 대조. OBJ 정점 22,418/삼각형 44,256/재질 6·면 인덱스 검사 통과. 새 Library Unity 실행 `7947e789`은 UPM `resolve-packages`에서 8분간 멈춰 자기 PID 종료; 컴파일·임포트·Unity 캡처 0, 사용자 세이브 변경 0. 상세 `docs/engine/UNITY_BOSS_DARK_DRUID_3D_IMPORT_20261029.md`(코드 브랜치). 게임·Player·통합 근거 아님 |
| 지팡이 Unity 분리 검수 | 빠진 패키지 캐시 4개를 기존 I: Library에서 새 sparse 작업본으로 복사·파일 수 대조한 뒤 실행 `3ec80df6` 성공. Unity 6000.6.7f1 컴파일 오류 0, OBJ 렌더러 1개/서브메시 6개, 정면·55° 1600×900 각 1장, 사용자 세이브 변경 0. 1x에서 소품 구조는 읽히나 평평한 단색·규칙적 케이지로 **RETOUCH** | `codex/pc-boss-takeover-20261028` `e5e5657489de6b20b2de8393164d5d14ddfddb30` 비강제 push·원격 SHA 확인. PNG `I:/EXODUSER-Storage/boss/sculpt-20261029/unity-staff-review/`. 원본 S3와 나란히 대조·보스 왼손 소켓/127·실제 전투/Player 미검증. Unity 자동 임포트 tracked 440파일 diff와 새 `.meta` 8개는 I:에 보존 후 자기 작업본에서 정확 경로 원복. 본체 FAIL이므로 통합 큐 제외 |

## 2026-10-29 사용자 정정 — 전체 보스 3D 리마스터

보스 디자인의 목표는 전체 보스를 3D 모델·리그·Animator·전투 움직임으로 리마스터하는 것이다. LT-8 위험물 수정이나 기존 2D 예고 표현은 이 목표의 완료 근거가 아니다. 순서는 드루이드 1-1 본체와 127 내려찍기 → 같은 본체의 1-4 추가분 → RM-B2 독버섯 거인 → RM-B3 지옥기형 → 후속 보스. 이 채팅은 모델·리그·Animator·보스 표시와 관련 문서를 맡고, DESIGN LOCK/1x 판정은 별도 디자인 담당이 맡는다. 신규 유료 호출은 승인 잔여량 확인 전 0이다.

드루이드 임포트 첫 실행 `0a15fc2d`는 Unity 6에서 제거된 `importMaterials`로 컴파일 실패했다. 수정 후 실행 `a218424b`는 컴파일 오류 0·FBX 임포트 뒤 `Generated` 폴더 생성 순서 때문에 머티리얼 작성에서 실패했다. 생성 순서를 수정했으나 공통 규칙의 2회 실패 한도로 추가 Unity 실행을 멈췄다. 이 후보는 빌드·1x·Player·통합 증거가 없으므로 `MERGE_QUEUE.md`에 넣지 않는다. 자동 임포트가 재작성한 기존 tracked 433파일은 diff를 `I:/EXODUSER-Storage/codex-takeover/boss/unity-autoimport-20261029.patch`에 보존한 뒤 작업 전 HEAD로 복원했다. 새 작업 경로 밖의 자동 `.meta` 8개는 제거했다. 실행기 영수증의 사용자 세이브 변화는 0이다.

**최신 판정(2026-10-29):** 앞 문단은 첫 실행 차수의 기록이다. 새 차수 `d48c4898`에서 생성 순서 수정본이 성공했고 55° 1x 검수까지 진행했다. 최신 `DARK_DRUID_DESIGN_LOCK.md` §16의 사용자 직접 판정에 따라 과거 Meshy 본체/리그는 **VISUAL FAIL·런타임 채택 금지**다. 본 스케일 시안 두 개도 FAIL. 제작법을 바꾼 회색 형상은 관절이 떨어지고, 원본 고해상도 정점 조형은 복부 UV가 늘어나며 전사형 표면이 남아 FAIL이다. 제품 브랜치에는 이 두 실패 시안을 넣지 않았다. 실제 게임 씬·Win 빌드·m1 스모크·Player·독립 디자인 PASS는 없다. 본체 실패 상태로 통합 큐에 올리지 않는다. Unity 자동 임포트 439 tracked 경로는 `I:/EXODUSER-Storage/codex-takeover/boss/unity-autoimport-sculpt-20261029.patch`에 보존 후 원복했고, 산출물/실험 소스는 I:에 보관했다. 네 실행 모두 `userSaveChanged=0`, 신규 유료 호출 0이다.

### 2026-10-29 S3 지팡이 v2 후속 검수

- 기존 승인 S3 소품 시트 `I:/EXODUSER-Storage/archive/E/exoduser-wt/_out/unity-charsheet/dark_druid/S3_staff.png`를 직접 열고 v1 Unity 정면/55°와 대조했다. v1의 균등한 케이지·평평한 축/구슬을 고치기 위해 별도 v2 OBJ/MTL/재생성 소스를 제작했다. v1과 원본 이미지는 보존했다.
- v2는 높이 2.300m, 잡는 위치 0.85m/감개 0.20m, 4cm 축, 0.40m 케이지의 주뿌리 6개, 지름 0.16m 구슬을 유지한다. 세 갈래 줄기·비대칭 교차 케이지·분할 코어 표면·이끼 2가닥을 구현하고 기존 `Druid_BaseColor.jpg`를 UV로 재사용했다. 정점/UV 각 21,332, 삼각형 41,828, 재질 7개, 인덱스 오류 0.
- Unity 6000.6.7f1 분리 검사 최종 `b94a2e43`: 컴파일 오류/에러 로그 0, 렌더러 1·서브메시 7, 사용자 세이브 변경 0. `I:/EXODUSER-Storage/boss/sculpt-20261029/unity-staff-v2-review/` 정면·55°·케이지 확대 PNG 각 1600×900을 직접 봤다. S3와 비교하면 교차 뿌리/나무껍질 질감은 나아졌지만 축은 실제 크기에서 평평하고 코어는 밝은 단색 면이 남아 **VISUAL RETOUCH**다. 디자인 PASS나 보스 게임 씬/Player 검증이 아니다.
- 코드·관련 docs `codex/pc-boss-takeover-20261028` `418fc296b9c4082600934bfadba16ce5388325c9` 비강제 push·원격 SHA 대조 완료. Unity 자동 임포트 tracked 439경로와 새 `.meta` 8개는 `I:/EXODUSER-Storage/codex-takeover/boss/unity-autoimport-staff-v2-20261029/`에 패치·정확 경로로 보존한 뒤 자기 작업본에서만 원복했다. 추가 유료 호출 0, `MERGE_QUEUE` 등록/런타임 채택 0.
- 다음 담당은 절차적 곡선 대신 축에서 케이지까지 이어지는 유기 조형과 코어 층별 발광 마스크를 다시 제작하고 같은 55°/확대 화면으로 비교한다. 본체 VISUAL FAIL이므로 새 본체 원형·UV·스킨의 1x 통과 후 왼손 소켓/127 접촉과 제품 전투 검증으로 진행한다. 기존 `USER_CONFIRM.md` 유료 승인 요청은 중복 작성하지 않았다.

### 2026-10-29 S3 목·큰 뿌리 체적 조형 후속 판정

- CTO가 v2의 S3 제품 기준을 **VISUAL FAIL**로 재판정했다. 앞 절의 `RETOUCH`는 제작자의 분리 연구 판정으로만 유지하며, 제품 채택 판정으로 사용하지 않는다.
- 로컬 Blender/승인된 편집형 3D 지팡이 소스는 확인되지 않았다. 설치된 `scikit-image` 등가면으로 목과 큰 뿌리를 새 체적 경로에서 융합한 후보를 만들었다. v2의 줄기·케이지 표본 정점 최단 거리 1.306mm/공유 정점 0에 비해, 새 목·뿌리 등가면은 연결 성분 1개이며 하부 축 정점 168개가 체적에 들어간다. 전체 높이 2.300m, 손잡이·구슬 치수 유지. 전체 OBJ 정점/UV 각 77,116, 삼각형 138,050, 잘못된 인덱스 0.
- 같은 로컬 렌더러의 정면/55°/목 정면·55°·측면 각 1600×900을 v2와 새 후보에 동일 카메라·조명으로 출력해 직접 비교했다. `I:/EXODUSER-Storage/boss/staff-neck-sdf-20261029/compare/`와 `neck_metrics.json`. 연결부 물리적 틈은 줄었으나 새 케이지가 둔탁한 포크 형태로 구슬을 가리고 S3의 얽힌 수피·코어 깊이에 못 미쳐 **제품 VISUAL FAIL 유지**. 로컬 소프트웨어 렌더는 Unity/아레나/Player 증거가 아니다.
- 재생성/비교 소스와 관련 기록은 `codex/pc-boss-takeover-20261028` `906661e1c050e2a24af5ae75215271cc596e5755` 비강제 push·원격 SHA 확인. 실패 OBJ/MTL과 이미지 출력은 I: 연구 보관소에만 두고 제품 `Studies`·통합 큐·런타임에는 넣지 않았다. Unity/UPM·빌드·Player·M1, 신규 유료 호출은 모두 0. 기존 유료 승인 요청은 중복하지 않았다.
- 다음 제작은 같은 체적 경로의 수치 조정 반복을 멈추고, 실제 조형 가능한 원본 소스 또는 수작업 저작 환경에서 줄기·케이지·코어를 함께 조형하고 UV/표면을 검수해야 한다. 본체 VISUAL FAIL과 왼손 소켓/127·실제 전투 미검증은 그대로다.

## 진행 중·대기

1. **RB1-3 표현 검증:** 과거 `E:/exoduser-wt/codex-boss`에서 공용 `unity/Tools/devtools/exo-unity.ps1`로 임포트 작업 2회 실행했지만 후속 검증은 완료되지 않았다(위 영수증). 현재 새 작업 위치는 I:이며 과거 E: 실행 창·캐시가 자동 이전됐다고 보지 않는다. Win64 빌드 오류 0, `--unity-review-args-capture --unity-druid-remodel --unity-boss-direct 0`, 예고 PNG 1x 판정과 현재 후보 SHA의 m1-check는 새로 필요하다. 이 근거 전에는 통합 큐에 넣지 않는다.
2. **드루이드 새 본체 제작:** 과거 본체·두 비율 시안·원시형 블록아웃·정점 변형·이번 SDF 연속 표면은 현행 형태 기준 FAIL. 같은 폭 조절·UV 밀기·단순 표면 미세 수정을 다시 반복하지 않는다. §16의 2.30m 정수리/2.70m 뿔 끝, 0.44m 몸통/0.70m 망토, 처진 비대칭 어깨·꺼진 흉곽·가는 사지·작은 발을 새 원형부터 조형하고 UV·텍스처·스킨을 새로 만든다. 55°/측/후의 동일 후보 bind·walk·slam에서 큰 형태와 연결부가 먼저 통과해야 한다. 기존 승인 유료 상한은 소진됐고 새 유료 생성 0이다. 독립 지팡이 연구는 제작자 RETOUCH·제품 VISUAL FAIL이며 본체 형태 통과 전 소켓·아레나 채택 금지.
3. **RB1-4 표현과 RB1-5 밸런스:** RB1-3 예고 화면·리그 임포트 뒤 무릎/축소/침강 Timeline, 소리·기둥·독액 수로를 연결한다. 전투 시간과 사망 원인 실플레이 판정은 배포된 `unity-latest`에서 별도 수행한다.
4. **LT-8 수량 재판정:** 12a 화면의 수십 구체를 `Orbs` 중복 생성으로 판정한 기존 보드 행은 혼합 렌더 오인이다. `NativeBossView`는 `Orbs`와 `Projectiles[DruidPoison]`를 모두 구체로 그린다. H5 실행 oracle 54,400틱에서 전용 구슬 최대 15개(110틱마다 3개, 수명 460틱), Unity 해당 Core는 byte 동일하고 oracle 불일치 0이다. 이전 M1 검수 영수증은 전투 중 탄 최대 50발이라고 기록하며 420틱 뒤 플레이어 무적을 매 틱 600으로 재설정해 피격 탄 소멸을 막는다. 웹·Unity 모두 근거리 비빨콩 탄의 수명 소진 시 수명을 1로 되돌린다. 따라서 과다 구슬 생성이라는 제품 결함은 확인되지 않았고, 현재 캡처의 탄/구슬 별 정확한 수는 기록되지 않았다. 침강 정리의 새 Unity Player 캡처와 실제 일반 플레이 판정은 여전히 필요하다.
5. **다른 보스 순서:** 1-1 → 1-4 → 1-2 → 1-3. RM-B2 명세의 수확 70f/허탕 120f는 `origin/main`에서 정정됨. RM-B3는 인간형 리그 한 벌에 네 발/두 발 자세 세트 두 벌, Unity에서 꼬리·턱 뼈 추가. RM-B0 틀의 현재 Unity 통합 SHA와 RB2-1/RB3-1/RB4-1 시작 가능 여부를 새 담당이 확인한다.

## 운영 경계

- Unity 실행은 PC 전체 동시 1개, `exo-unity.ps1`의 무창·무음·세이브 격리 경로만 사용한다. 직접 플레이 판정 전에는 사용자에게 알린다. 테스트가 실패하면 원인 수정 후 한 번만 재실행한다.
- Unity 코드 병합은 `unity-integrator` 담당. 보스 작업 브랜치는 비강제 push와 빌드·oracle·m1-check 근거를 갖춘 뒤 `I:/EXODUSER-Storage/codex-takeover/MERGE_QUEUE.md`에 기록한다.
- H5 `game.html`, 타 작업 트리 WIP, Unity가 다시 쓴 `.asset/.meta`, 기존 빌드/세이브는 건드리지 않는다. 미인수 폴더 `E:/exoduser-wt/rmb2-spec`, `rmb3-spec`과 오래된 로그는 임의 삭제하지 않는다.
- 비용 장부는 `E:/exoduser-wt/_out/meshy/credits.log`. 이번 드루이드 승인량은 시트 4/6장 $0.1985, Meshy 메시 30/30cr, 리깅 5/5cr로 끝났다.
