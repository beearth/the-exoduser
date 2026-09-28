# CH1-1 남측 시작 경계 부패 목질 — 72차

시작 구역 오른쪽의 수풀·가는 가지 반복 일부를 낮고 넓은 수피판과 썩은 목질 공동으로 연결했다. 전체 베이스를 다시 생성하지 않고 기존 master의 비보행 배경에만 새 투명 원화를 합성했다. 생성 원화는 기존 crop을 참조 입력으로 전달하지 않은 standalone 환경 레이어다. 실제 본편 master 위 합성·카메라 검수로 연결을 확인했다. 정적 원화이며 새 생체 움직임을 추가한 작업은 아니다.

| id | 계약 | 실제 값 |
|---|---|---|
| SOURCE72 | 생성 | Higgsfield GPT gpt_image_2_5 / job24f6587e-8685-4082-819a-ae9564d8fd38. 1:1/2k/high/transparent 요청, 실제2048² RGBA, alpha0..254, alpha0픽셀3,066,102 |
| PLACE72 | 좌표 | master crop[4096,6144,6144,8192] 2048², 중심tile[129,181], sprite1536²/scale.75, crop offset[420,502] |
| MASK72 | 합성·보호 | RGB×.70/opacity.84; 현행200² layout grid 전체 대조, 비보행 MinFilter49/GaussianBlur20, 보행alpha 강제0·8bit alpha 양자화 |
| PIXELS72 | 변화 | 433,965픽셀; 보행0/alpha0영역0/crop 밖0. 원화 투명 영역의 베이스 보존 |
| CHUNKS72 | 본편 | chunk_5_6.png, chunk_4_7.png, chunk_5_7.png; core1024/bleed1/1026². 단일master에서 clamped crop, 나머지청크 보존 |
| CACHE72 | 로더 | 20260928-outer-72; 생체모듈61차·legacy 비교cache 유지 |
| REBAKE72 | 보존 순서 | skin65→outer66→outer67→outer68→outer69→outer70→outer71→outer72. 마지막x4096/y6144/2048²; preblended RGB+binary alpha0/255 |
| PROOF72 | 해시 | master 92a8628afd7196b8880b0487a6584fb3169a993f2cd6aeef93591646e01cd2e1; rawRGBA 93e8344b4c3144913730bf440a5242fca494f97e989fce20e8962cf2c9e3db8c. pre65+8patch helper 전체8192² 픽셀 동일 |
| FILES72 | 재현 | outer72_sources의원화/crop/patch/mask/prep/generation 6파일. 원본SHA a000d1c3775cbc46a3a0e6d692e800cc21bcfd0326b08077b816f63f27745c79, 전체prompt와 실제alpha 기록 |

## MAP PRODUCTION REPORT

STAGE: CH1-1/stage0. GATE2~4 남측 LARGE OUTER MASS 부분 리터치. 앞서 전체 읽은 제작가이드1048줄이 현재도 동일함을 확인하고 맵디테일·production SSOT를 재확인했다.

| 구분 | 항목 | 결과 |
|---|---|---|
| MASTER | silhouette / regions | 현행200² 지형·8구역 유지. geometry·collision 변경 없음 |
| MASTER | main route / side spaces | 시작6시→출구12시·상단통로·넓은공터·양쪽우회 보존 |
| OUTER MASS | LEFT / RIGHT | 서쪽66·북서67·동쪽69·남동71 보존 |
| OUTER MASS | TOP / SOUTH | 북쪽68 유지. 남측 시작 오른쪽 외곽에 낮은 목질 공동 연결 |
| OUTER MASS | major holes | 선택영역 반복수풀 일부를 큰수피판·심재 공동으로 정리. 전체 녹색식생·가는가지 반복은 남아 있음 |
| LARGE | source assets / composites | 신규Higgsfield GPT 투명 원화 한 개; 기존base 위 부분 합성. small scatter 추가0 |
| LARGE | overlap / repeated silhouette | 높은고목·부채꼴뿌리와 구별되는 낮고 넓은 가로 목질. 비보행 계층만 합성 |
| MEDIUM | connections / remaining holes | 수피판→검은심재→국소힘줄→짧은뿌리 연결. 주변고사리·잔여식생은 추가리터치 필요 |
| GROUND | shadow / contamination | 원화 하부 접촉 암부·국소 괴사 조직. 새보행오염 없음 |
| GROUND | structure integration | 실제보행경계 마스크 feather, 피부65·기존동맥 보존. crop 외부 픽셀0변화 |
| PLAYABLE | main arenas / travel space | 넓은시작공간·중앙공터·동측우회·상단route 보존; 후보전후/본편 G.map 동일 |
| PLAYABLE | breathing space / threat space | 보행픽셀0변화·충돌·적·어택티켓·밸런스 변경 없음 |
| PLAYABLE | combat readability | 기존AI 임시24적, 적탄6샘플 1/1/7/13/17/23개. 캐릭터 중앙중첩 남아 있어 전체 전투PASS 아님 |
| LANDMARK | primary / secondary / tertiary | 생체나무·큰늪·캠프·제단·출구 유지. 새 주요랜드마크 없음 |
| CAMERA QA | START / EARLY | [100,180]/[100,157], 실제시작칸 [100,185] 보행화면 추가 |
| CAMERA QA | ARENA / SIDE L / SIDE R | [100,120]/[49,151]/[151,136] 본편경로 |
| CAMERA QA | LANDMARK / LATE / EXIT | [102,90]/[100,48]/[100,15] 본편경로 |
| CAMERA QA | 남측 경계 | EDGE[126,176]·JOIN[121,184]·LOWER[116,190] 보행화면. MASS[129,181]은 비보행 원화 관찰용 순간이동 |
| CAMERA QA | 전후 / 본편 | 후보전후7카메라·route교체없는 본편35카메라1280×720 및 전체맵전후. 순간이동은 종주검증과 구분 |
| TECH QA | route / collision | 현행layout 연결성검사·실제WASD 후G.map동일. 무보정전체종주 미검증 |
| TECH QA | 남측 실제 이동 | [120.5,184.5]에서 실제S650ms/W650ms, 아래로110.71월드px, 끝칸runtime G.map0·복귀·map동일. 보정없는종주와 구분 |
| TECH QA | pageerror / 404 | 후보·본편 각각0, HTTP>=400도0 |
| TECH QA | seam / loading | master/64청크 동일·224경계strip 동일, 본편62청크요청 모두cache72·visibleIds⊂drawnIds·교체0 |
| TECH QA | performance | 정적3청크교체·추가runtime draw0. 저사양GPU·NW.js·장시간FPS 미검증 |
| TECH QA | regression / rebake | 지형5+레이어보존2+HTML구문1=8PASS. helper 전체재현, fullbuilder전체실행과 구분 |
| FILES | stage-owned | master·3청크·preview·source6·manifest·composition·game cache 한줄·맵docs·검수. 반영전tmp/ch1-production-pre72 백업 |
| FILES | concurrent touched | 공유game.html·CHANGELOG 최신본의 맵 관련 범위만 변경. 동시작업Git staging에는 직접쓰기 없음 |
| FILES | unrelated touched | 없음. 타작업 삭제·숨김·롤백 없음 |
| GIT | staged / commit | 72차 쓰기·커밋 수행안함. 이 세션 .git 읽기전용·exec시작 장애로 허용된Git쓰기경로 미확보. 다른에이전트의누적커밋상태와 구분 |
| GIT | source-control limit | 최종git상태·72차체크포인트 검증기록 참조. 실제런타임에셋 숨김·삭제 없음 |
| GIT | push / deploy | 이 세션72차는 수행하지 않음 |

**VISUAL VERDICT: RETOUCH** — 남측 오른쪽 경계의 큰 수피판·검은 공동이 실제보행화면에서 읽힌다. 전체 건강한 식생·반복가지·주변 접합·밀집캐릭터 중첩은 추가수정 필요하다. 자동검사PASS를 전체visualPASS로 대체하지 않는다.

NEXT PASS: 남측 왼쪽의 가는가지·잔여식생을 정리하고 낮은 목질과 피부 지면의 연결을 개선한다. 넓은 시작공간·북쪽route·기존 늪버블/가스/동맥 보존.

검수: captures/ch1_outer72/index.html·runtime.json·live/runtime.json·prep.json·promotion.json·tests.log·rebake-proof.log. 체력50ms/무적하한60f 및 임시24적을 사용한 시각QA로 성능·밸런스 검증은 아니다.

보존: 72차소유파일·관련docs·검수자료를 tmp/ch1-checkpoint72-owned.zip에 묶고 엔트리SHA256을 검증한다. 공유game 전체스냅샷과 cache만 분리한검토본을 구분하며 .git 직접쓰기 없음.

---

# CH1-1 남동 뿌리의 보행 경계 접합 — 71차

70차 뿌리가 SE_EDGE 보행 화면의 오른쪽 아래에 치우쳐 있어 목질 공동과 연결부가 충분히 읽히지 않았다. 기존 원화 한 개를 경계 쪽으로 옮겼다. 원화를 추가 복제하거나 다시 생성하지 않았다. 이동 전 자리에는 pre70 백업의 같은 crop을 사용하고, 현행70 master와 실제 달라진 픽셀만 outer71 보정 레이어로 추가했다. 기존70 레이어·원화·기록은 보존한다.

| id | 계약 | 실제 값 |
|---|---|---|
| SOURCE71 | 재사용 | `outer70_sources/southeast_mass_generated.png`, 기존 Higgsfield GPT job a5a1431a-8ed6-4cb0-8f80-49ceda92bb42; 2048² RGBA 원본 유지. 신규 생성·동작 추가 없음 |
| PLACE71 | 위치·이동 | 중심 tile `[184,158]`→`[178,150]`, 월드 `[-240,-320]` 이동. master crop `[6144,5120,8192,7168]` 2048², crop offset `[625,584]`→`[379,256]`, master `[-246,-328]` 이동 |
| BLEND71 | 합성 | sprite1536²/scale.75, RGB×.70/opacity.84; 비보행 MinFilter49/GaussianBlur20, 보행 alpha 강제0, 8bit alpha 양자화 |
| PIXELS71 | 변화·보존 | 현행70 대비 1,103,760픽셀 변화. 보행0/효과mask0영역0/crop 외부0. 이전 위치에서만 원화가 있었던 543,276픽셀을 pre70 동일 자리로 복원 |
| FOOTPRINT71 | 원화 영향 영역 | 이전 686,730픽셀→재배치 560,515픽셀. 이 값은 비보행 배경의 실제 변화 영역이며 충돌 면적이 아님 |
| CHUNKS71 | 본편 PNG | `chunk_6_5.png`, `chunk_7_5.png`, `chunk_6_6.png`, `chunk_7_6.png`; core1024/bleed1/1026². 단일 master에서 clamped crop |
| CACHE71 | 로딩 | `20260928-outer-71`; legacy 비교 cache·생체 모듈61차 유지 |
| REBAKE71 | 순서·보정 | skin65→outer66→outer67→outer68→outer69→outer70→outer71. 마지막 x6144/y5120/2048² patch는 현행70 대비 실제 차이의 binary alpha0/255, 이전 위치 복원도 포함 |
| PROOF71 | 해시 | master `bd01aadf96fa5fbfd072b443ca4c347a0928da9325eb21839b5a8749a9fd4b7a`, raw RGBA `7684cc2c7eb24328cc14d5bd2d02c384303de4b7697f3bc7ebccea41152f0e32`. pre65 master+7patch의 helper 전체8192² 픽셀 동일 |
| FILES71 | 재현 | `outer71_sources/`의 crop·보정patch·binary mask·재배치alpha·prep·reuse 6파일. 원화/전체prompt는 기존 outer70_sources 참조. pre70 crop은 보정patch에 이미 포함되어 재베이크 때 백업이 필요하지 않음 |

## MAP PRODUCTION REPORT

STAGE: CH1-1/stage0. GATE2~4 남동 외곽의 배치·접합 리터치. 앞서 전체 읽은 공통 제작 가이드1048줄이 현재도 동일함을 확인하고, 맵디테일과 현행 production SSOT를 재확인했다.

| 구분 | 항목 | 결과 |
|---|---|---|
| MASTER | silhouette / regions | 기존200² 지형·구역 유지, geometry·collision 변경 없음 |
| MASTER | main route / side spaces | 시작6시→출구12시, 상단통로·넓은 중앙공터·양쪽우회 유지 |
| OUTER MASS | LEFT / TOP | 서쪽66·북서67·북쪽68 보존 |
| OUTER MASS | RIGHT / SOUTH | 동쪽69 보존, 남동70 뿌리 한 개를 북서쪽으로 재배치해 보행 경계에서 목질 공동과 낮은 연결부를 더 읽기 쉽게 함 |
| OUTER MASS | major holes | 이동 전·후를 동시에 남기지 않아 중복 뿌리 방지. 선택 영역 밖의 건강한 식생·반복 가지는 남아 있음 |
| LARGE | source assets / composites | 기존70 투명 원화 재사용. 기존 실제 master와 pre70 같은 자리 crop으로 부분 합성 |
| LARGE | overlap / repeated silhouette | 기존70 한 개만 이동; 새 같은 실루엣 복제 없음. 높은 세로 가지 일부를 낮은 넓은 목질로 덮음 |
| MEDIUM | connections / remaining holes | 목질 공동→갈라진 수피→검붉은 힘줄→낮은 뿌리. 기존 숲의 반복 가지와 접합은 추가 수정 필요 |
| GROUND | shadow / contamination | 기존 원화 하부 그림자·국소 괴사조직 유지. 보행 바닥 새 오염 없음 |
| GROUND | structure integration | 비보행 feather·실제 지형 보호. 이전 위치 복원과 새 자리 합성을 한 개 보정 레이어로 기록 |
| PLAYABLE | main arenas / travel space | 중앙공터·동측우회·늪 접근 유지, 후보 전후 및 일반 본편 G.map 동일 |
| PLAYABLE | breathing space / threat space | 보행 픽셀 변화0. 충돌·적·어택티켓·밸런스 변경 없음 |
| PLAYABLE | combat readability | 기존 AI 임시24적 추가; 적탄6샘플 1/3/8/11/17/26개. 중앙 캐릭터 중첩은 남아 있어 전체 전투 PASS 아님 |
| LANDMARK | primary / secondary / tertiary | 생체나무·큰늪·캠프·제단·출구 유지, 새 주요 랜드마크 없음 |
| CAMERA QA | START / EARLY | `[100,180]` / `[100,157]` 일반 production 경로 |
| CAMERA QA | ARENA / SIDE L / SIDE R | `[100,120]` / `[49,151]` / `[151,136]` |
| CAMERA QA | LANDMARK / LATE / EXIT | `[102,90]` / `[100,48]` / `[100,15]` |
| CAMERA QA | 남동 경계 | EDGE `[170,151]`, JOIN `[169,154]`, NORTH `[171,141]`, SOUTH `[157,158]`는 현행 grid의 보행 칸. MASS `[178,150]`는 비보행 원화 관찰용 순간이동 |
| CAMERA QA | 전후 / 본편 | 후보 전후7카메라, route 교체 없는 일반 본편30카메라1280×720 및 전체맵 전후. 순간이동을 무보정 종주 증거로 해석하지 않음 |
| TECH QA | route / collision | 기존 layout 연결성 검사 통과, 실제 WASD 후 G.map 동일. 무보정 전체 종주 미검증 |
| TECH QA | 남동 실제 이동 | 보행 `[169.5,151.5]`에서 실제 S650ms/W650ms 입력. 아래로 109.42월드px 이동, 끝칸 runtime G.map0·원위치 근처 복귀·G.map 동일. 전체 무보정 종주와 구분 |
| TECH QA | pageerror / 404 | 후보·일반 본편 관찰 각0, HTTP>=400도0 |
| TECH QA | seam / loading | 전체64청크 픽셀 동일·224경계 strip 동일. 본편62청크 요청 모두 cache71, visibleIds 모두 drawnIds 포함·route 교체0 |
| TECH QA | performance | 정적4청크 교체, 추가 runtime draw0. 저사양GPU·NW.js·장시간FPS 미검증 |
| TECH QA | regression / rebake | 지형5+레이어보존2+HTML구문1=8PASS/0FAIL. helper 전체 재현, fullbuilder 전체 실행과 구분 |
| FILES | stage-owned | master·4청크·preview·source6·manifest·composition·game cache 한 줄·맵docs·검수자료·터미널 대체 가이드의 읽기 성공 기록. 반영 전 `tmp/ch1-production-pre71` 백업 |
| FILES | concurrent touched | 공유 game.html·CHANGELOG·대체 작업 가이드의 최신본에서 관련 범위만 변경. 타 UI·스킬·캐릭터 작업과 staging 유지 |
| FILES | unrelated touched | 없음. 타 작업 파일 삭제·숨김·강제 정리 없음 |
| GIT | staged / commit | 맵 전용 체크포인트 준비. 시스템 PowerShell 숨김 읽기는 성공; exec는 WindowsApps pwsh 시작 전 OS317로 실패. 허용된 Git 쓰기 실행 경로 미확보·커밋 미완료. 이전 승인된 실행도 시작 전 같은 오류였음 |
| GIT | source-control limit | Changes100개 이상, 제한 미충족. 실제 코드·에셋을 숨기거나 삭제해 개수만 줄이지 않음 |
| GIT | push / deploy | 수행하지 않음 |

**VISUAL VERDICT: RETOUCH** — 재배치된 목질 공동·뿌리 연결이 보행 경계 카메라에서 더 넓게 보인다. 건강한 식생·반복 가지·전체 접합·밀집 전투 중첩은 추가 수정이 필요하다. 자동검사 PASS를 전체 visual PASS로 대체하지 않는다.

NEXT PASS: 남측 시작 주변의 반복 가지와 건강한 식생을 정리하며 낮은 부패 목질과 지면 접합을 이어서 다듬는다. 넓은 시작·전투 공간·늪·남북 route를 보존한다.

검수: `captures/ch1_outer71/index.html`, runtime.json, live/runtime.json, prep.json, promotion.json, preaudit.json, tests.log, rebake-proof.log. 체력50ms/무적하한60f·임시24적 시각QA로 밸런스 검증은 아니다. 정적 원화 재배치이며 기존 늪가스·버블·동맥 동작을 유지한다.

보존: `tmp/ch1-checkpoint71-owned.zip`에 맵 소유 파일·격리HTML/CHANGELOG·타 staging 보존 index HTML·검수자료를 묶어 각 엔트리 SHA256을 검증한다. 실행 가드는 HEAD·index·소유 파일의 변경 시 중단한다.


---

# CH1-1 남동쪽 무너진 뿌리 외곽 — 70차

남동쪽 비보행 외곽의 반복 줄기 일부에 낮게 무너진 뿌리 질량을 합성했다. 큰 수피판·검은 공동·갈라진 목질과 검붉은 힘줄이 이어지며, 69차의 기울어진 큰 몸통과 구별되는 낮고 넓은 형태다. 기존 전체 master를 보존한 부분 합성이다. 신규 원화는 정적 배경이며 큰늪의 기존 가스·버블 동작은 유지한다.

| id | 계약 | 실제 값 |
|---|---|---|
| SOURCE70 | 생성 | Higgsfield GPT `gpt_image_2_5`, job `a5a1431a-8ed6-4cb0-8f80-49ceda92bb42`; 1:1/2k/high/transparent 요청, 실제 2048² RGBA, alpha0..254, alpha0픽셀2,867,837 |
| PLACE70 | master 배치 | crop `[6144,5120,8192,7168]` 2048², 중심 tile `[184,158]`, sprite2048²→1536²(scale.75), crop offset `[625,584]`; RGB×.70/opacity.84 |
| MASK70 | 바닥 보호 | 현행 layout.js의 200² grid와 보호 grid 전체 일치; 비보행 마스크 MinFilter49/GaussianBlur20, 보행 alpha 강제0, 8bit alpha 양자화 |
| PIXELS70 | 변화 | 686,730픽셀; 보행0/alpha0영역0/crop 밖0. 원화 가장자리의 투명 영역은 기존 그림 유지 |
| CHUNKS70 | 본편 반영 | `chunk_7_5.png`, `chunk_6_6.png`, `chunk_7_6.png`; core1024/bleed1/1026², 전체 master에서 clamped crop |
| CACHE70 | 로더 | `20260928-outer-70`; legacy 비교 cache 및 생체 모듈61차 유지 |
| REBAKE70 | 레이어 | skin65→outer66→outer67→outer68→outer69→outer70. 마지막 patch x6144/y5120/2048², preblended RGB+binary alpha0/255 |
| PROOF70 | 해시 | master `807da1d785853f8cb59b440c3b291615b354fd8c8d0e91b0ac463cc9d7954f86`, raw RGBA `ad0736fca5dfc05aaf6b86b2f61fffc849e27b401955efda1b895d37c8d09f3a`; 65차 이전 master+6patch를 helper에 통과시킨 전체8192² 픽셀 동일 |
| FILES70 | 재현 | `assets/map/ch1/production_finish/outer70_sources/`의 원화·crop·patch·mask·prep·전체prompt/생성정보 6파일. 원화 자체는 참조 입력 없이 생성한 standalone 레이어이며, 실제 기존 master에 로컬 보호 합성 |

## MAP PRODUCTION REPORT

STAGE: CH1-1/stage0, GATE2 LARGE OUTER MASS의 남동 부분 리터치. 공통 제작 가이드 전체→맵디테일→production SSOT 순서로 확인했다.

| 구분 | 항목 | 결과 |
|---|---|---|
| MASTER | silhouette / regions | 현행 200² 지형·구역 보존. geometry·collision 변경 없음 |
| MASTER | main route / side spaces | 시작6시→출구12시, 상단 통로·양쪽 우회·POI 연결성 유지 |
| OUTER MASS | LEFT / RIGHT | 서쪽66·북서67 보존, 동쪽69 아래 남동 비보행 질량 일부에 낮은 부패 뿌리 추가 |
| OUTER MASS | TOP / SOUTH | 북쪽68·시작 부근 보존. 이번 south 작업은 남동 외곽 부분에 한정 |
| OUTER MASS | major holes | 선택 영역의 일부 빈 암부를 목질 공동·겹친 뿌리로 연결. 전체 외곽의 건강한 식생·반복 줄기는 남아 있음 |
| LARGE | source assets / composites | Higgsfield GPT 단일 투명 원화, 기존 base 위 부분 합성. 새 small scatter 없음 |
| LARGE | overlap / repeated silhouette | 높고 기울어진69차 몸통과 낮고 넓은70차 뿌리 형태를 구분. 보행 바닥은 합성 대상 제외 |
| MEDIUM | connections / remaining holes | 수피판→심재 공동→지면 뿌리·국소 힘줄 연결. 위쪽 녹색 식생과 기존 세로 가지 연결은 추가 리터치 필요 |
| GROUND | shadow / contamination | 원화 하부 그림자·국소 괴사조직, 비보행 경계 feather. 새 보행 오염 없음 |
| GROUND | structure integration | 피부65·기존 동맥·큰늪·base 보존. crop 외부 픽셀 변화0 |
| PLAYABLE | main arenas / travel space | 중앙 공터·동측 우회·상단 route 유지. 후보 전후 및 일반 본편 G.map 동일 |
| PLAYABLE | breathing space / threat space | 보행 픽셀 변화0. 새 충돌·적·어택티켓·밸런스 변경 없음 |
| PLAYABLE | combat readability | 기존 AI 임시24적을 추가해 기존 적과 함께 관찰. 적탄6샘플 2/4/10/18/23/27개; 중앙 캐릭터 겹침은 남아 있어 전체 전투 PASS 아님 |
| LANDMARK | primary / secondary / tertiary | 생체나무·늪·캠프·제단·출구 유지, 새 뿌리는 외곽 배경 계층 |
| CAMERA QA | START / EARLY | `[100,180]` / `[100,157]` 일반 production 경로 |
| CAMERA QA | ARENA / SIDE L / SIDE R | `[100,120]` / `[49,151]` / `[151,136]` |
| CAMERA QA | LANDMARK / LATE / EXIT | `[102,90]` / `[100,48]` / `[100,15]` |
| CAMERA QA | 남동 접근 | EDGE `[170,151]` / NORTH `[171,141]` / SOUTH `[157,158]` 모두 현행 grid의 보행 칸. MASS `[184,158]`는 비보행 원화 관찰용 순간이동 |
| CAMERA QA | 전후 / 본편 | 후보 전후6카메라, route 교체 없는 일반 본편29카메라1280×720, 전체맵 전후. 순간이동을 무보정 종주 증거로 해석하지 않음 |
| TECH QA | route / collision | 기존 layout 연결성 검사 통과, 실제 WASD 입력 후 G.map 동일. 무보정 전체 종주 미검증 |
| TECH QA | pageerror / 404 | 후보·일반 본편 관찰 각0, HTTP>=400도0 |
| TECH QA | seam / loading | master/전체64청크 픽셀 동일·224경계 strip 동일. 일반 본편62청크 요청 모두 cache70, 모든 visibleIds drawnIds 포함, route 교체0 |
| TECH QA | performance | 정적3청크 교체. 저사양GPU·NW.js·장시간FPS 미검증, 성능 개선 주장 없음 |
| TECH QA | regression / rebake | 지형5+레이어보존2+HTML구문1=8PASS/0FAIL. helper 전체 픽셀 재현 확인, fullbuilder 전체 실행과 구분 |
| FILES | stage-owned | master·3청크·preview·source6·manifest·composition·game cache 한 줄·관련 맵docs·검수자료. 반영 전 `tmp/ch1-production-pre70` 백업 |
| FILES | concurrent touched | 공유 game.html·CHANGELOG은 최신본을 읽고 맵 범위만 변경. 타 UI·스킬·보스 작업과 staging 보존 |
| FILES | unrelated touched | 없음. 타 작업 삭제·숨김·강제 정리 없음 |
| GIT | staged / commit | 맵 전용 격리 체크포인트 준비. exec PowerShell 시작 전 OS317로 실패, 커밋 미완료. 타 작업 staging 보존 |
| GIT | source-control limit | Changes100개 이상, 제한 미충족. 실제 코드·에셋을 숨기거나 삭제해 개수만 줄이지 않음 |
| GIT | push / deploy | 수행하지 않음 |

**VISUAL VERDICT: RETOUCH** — 남동 낮은 부패 뿌리와 목질 공동은 본편에서 확인했다. 남아 있는 건강한 식생·반복 줄기·전체 접합과 밀집 전투 캐릭터 중첩을 추가 수정해야 한다. 자동검사 PASS는 전체 visual PASS가 아니다.

NEXT PASS: 남측 외곽의 반복 가지와 건강한 식생을 정리하고, 낮은 뿌리 질량의 접합을 이어서 다듬는다. 시작부·넓은 전투 공간·늪·남북 route를 보존한다.

검수: `captures/ch1_outer70/index.html`, runtime.json, live/runtime.json, prep.json, promotion.json, preaudit.json, rebake-proof.log, tests.log. 체력50ms/무적하한60f·임시24적을 사용한 시각 QA이며 밸런스 검증은 아니다. 새 원화의 움직임은 추가하지 않았다.

체크포인트: `tmp/ch1-checkpoint70-owned.zip`. 맵 소유 파일·맵 변경만 적용한 commit HTML/CHANGELOG·타 staging을 보존할 index HTML·검수자료를 묶어 각 엔트리 SHA256을 검증한다. 실제 커밋 실행 시 HEAD·index·소유 파일 변경을 가드한다.


---

# CH1-1 동쪽 기울어진 고목 외곽 — 69차

동쪽 비보행 외곽의 반복 줄기 일부를 갈라진 큰 수피판, 검은 심재 공동, 틈 안의 둔한 힘줄, 낮은 부채꼴 뿌리로 부분 교체했다. 북쪽 수평 통나무와 다른 대각선 실루엣을 사용했다. 단일 master를 먼저 합성하고 실제 달라진 3청크만 반영했다. 새 원화는 정적 배경이다.

| id | 적용 위치·계약 | 실제 값 |
|---|---|---|
| SOURCE69 | Higgsfield 원화 | `gpt_image_2_5`, job `461ba944-d5ea-448d-8eb5-37a87dc366cb`; 요청 2k/1:1/high/transparent, 실제 2048² RGBA, native alpha0..254 |
| PLACE69 | master crop·배치 | `[6144,3072,8192,5120]` = 2048²; 중심 tile `[180,100]`; sprite2048²→1536²(scale.75); crop 내 offset `[461,256]`; RGB×.70, opacity.84 |
| MASK69 | 보호·접지 | 현행 layout.js의 200² grid와 마스크 grid 전체 일치. MinFilter49/GaussianBlur20, 보행 alpha 강제0, 8bit alpha 양자화 |
| PIXELS69 | 실제 변화 | 801,475픽셀; 보행 픽셀0, alpha0 픽셀0, crop 외부0. preblended RGB+binary alpha0/255 patch |
| CHUNK69 | 본편 PNG | `chunk_7_3.png`, `chunk_6_4.png`, `chunk_7_4.png`; core1024/bleed1/파일1026² |
| VERSION69 | 로더 | production cache `20260928-outer-69`; 비교 경로 cache·생체 모듈61차 유지 |
| REBAKE69 | 보존 순서 | skin65→outer66→outer67→outer68→outer69; 마지막 patch x6144/y3072/width2048/height2048. 65차 이전 master+현행5patch를 helper에 통과시킨 8192² 전체 픽셀 동일 |
| PROOF69 | master SHA256 | `730e21b31b6c5fe1bf61197e0430cc48ff9e542f6d4e7456f64b66db23ccde27`; raw RGBA SHA256 `7864fcb0f513438597cab0abea1c3a03b1e5db449c9bf604695a360749448881` |
| SOURCEFILES69 | 재현 자료 | assets/map/ch1/production_finish/outer69_sources/의 원화·crop·patch·mask·prep·전체 prompt/생성 정보6파일 |

## MAP PRODUCTION REPORT

STAGE: CH1-1 / stage0. GATE2 LARGE OUTER MASS의 동쪽 부분 리터치. 공통 제작 가이드 전체→맵디테일→현행 production SSOT를 먼저 읽었다.

| 구분 | 항목 | 결과 |
|---|---|---|
| MASTER | silhouette / regions | 200² 기존 실루엣·구역 유지. geometry·collision 변경 없음 |
| MASTER | main route / side spaces | 6시 시작→12시 출구, 양쪽 우회·POI 연결성 유지 |
| OUTER MASS | LEFT | 66차 서쪽 고목·67차 북서쪽 죽은 숲 보존 |
| OUTER MASS | RIGHT | `[180,100]` 주변에 기울어진 속빈 고목·낮은 뿌리를 연결. 원화의 주요 높이 질량은 비보행 오른쪽에 배치 |
| OUTER MASS | TOP / SOUTH | 68차 북쪽 수평 고목과 시작 주변 보존 |
| OUTER MASS | major holes | 선택 구역의 검은 빈 부분을 심재 공동·뿌리 연결로 정리. 전체 동쪽·남동쪽 외곽 통합은 미완료 |
| LARGE | source assets / composites | Higgsfield GPT 단일 투명 원화. 기존 base에 부분 합성, small scatter 추가 없음 |
| LARGE | overlap / repeated silhouette | 대각선 몸통으로 기존 수직 줄기 반복을 끊고 북쪽 수평 실루엣과 구분. 보행 floor는 합성 대상에서 제외 |
| MEDIUM | connections / remaining holes | 갈라진 수피판→검은 심재→낮은 부채꼴 뿌리. 선택 구역 밖의 반복 나무·건강한 식생은 후속 대상 |
| GROUND | shadow / contamination | 하부 그림자·국소 부패 조직, 좁은 feather 접지. 보행 바닥 새 오염 없음 |
| GROUND | structure integration | 기존 피부·동맥·큰 늪·원본 base 보존. crop 밖 픽셀 변화0 |
| PLAYABLE | main arenas / travel space | 중앙 전투 공터·동측 우회·출구 통로 유지. 후보 전후 및 본편 G.map 동일 |
| PLAYABLE | breathing space / threat space | 보행 픽셀 변화0. 새 충돌·적·어택티켓·밸런스 변경 없음 |
| PLAYABLE | combat readability | 기존 AI로 임시24적을 추가해 기존 적과 함께 검수. 적탄6샘플 2/4/13/20/25/28개. 중앙 캐릭터 겹침은 남아 있어 전체 전투 가독성 PASS로 단정하지 않음 |
| LANDMARK | primary / secondary / tertiary | 생체나무·늪·캠프·제단·출구 유지. 새 고목은 외곽 배경 계층 |
| CAMERA QA | START / EARLY | `[100,180]` / `[100,157]`, 일반 production 경로 |
| CAMERA QA | ARENA / SIDE L / SIDE R | `[100,120]` / `[49,151]` / `[151,136]` |
| CAMERA QA | LANDMARK / LATE / EXIT | `[102,90]` / `[100,48]` / `[100,15]` |
| CAMERA QA | 동쪽 접근 | EDGE `[172,99]`, NORTH `[164,82]`, SOUTH `[161,108]`은 현행 grid의 보행 칸. MASS `[180,100]`은 비보행 원화 관찰용 순간이동 |
| CAMERA QA | 전후 / 본편 | 후보 전후6카메라, 교체 없는 본편25카메라1280×720, 전체맵 전후 비교. 순간이동 카메라를 무보정 종주 증거로 해석하지 않음 |
| TECH QA | route / collision | 기존 layout 연결성 검사 통과, geometry 변경0. 실제 입력 후 G.map 동일 |
| TECH QA | pageerror / 404 | 후보·본편 각0; HTTP>=400도0 |
| TECH QA | seam / loading | master/64청크 전체 픽셀 동일, 경계224 strip 동일. 본편60청크 요청 모두 cache69, 모든 visibleIds가 drawnIds에 포함, route 교체0 |
| TECH QA | performance | 정적 3청크 교체. 저사양GPU·NW.js·장시간FPS·무보정 종주 미검증; 성능 개선 주장 없음 |
| TECH QA | regression / rebake | 지형5+재베이크 보존2+HTML구문1=8PASS/0FAIL. helper 전체 픽셀 재현 확인; fullbuilder 전체 실행과 구분 |
| FILES | stage-owned | master·3청크·preview·source6·manifest·composition·game cache 한 줄·맵 docs·검수 자료. tmp/ch1-production-pre69에 반영 전 백업 |
| FILES | concurrent touched | 공유 game.html·CHANGELOG은 즉시 읽고 맵 범위만 수정. UI·인벤토리·스킬·보스 등 타 작업과 staging 보존 |
| FILES | unrelated touched | 없음. 타 작업 파일 삭제·숨김·강제 정리 없음 |
| GIT | staged / commit | 맵 전용 격리 체크포인트 준비. 이번 턴에도 exec가 PowerShell 시작 전 OS317로 실패해 정상 Git 쓰기 실행 경로 미확보, 커밋 미완료. 타 작업 staging 유지 |
| GIT | source-control limit | Changes는 100개 이상. 실제 코드·런타임 에셋을 숨기거나 삭제하지 않으며, 제한 미충족을 기록 |
| GIT | push / deploy | 수행하지 않음 |

**VISUAL VERDICT: RETOUCH** — 동쪽 대각선 목질과 접지는 본편에서 확인했다. 선택 영역 밖의 건강한 식생·반복 줄기, 전체 외곽 통합, 밀집 전투의 캐릭터 겹침은 남아 있다. 자동검사 PASS로 전체 visual PASS를 대체하지 않는다.

NEXT PASS: 남동쪽 비보행 외곽의 큰 뿌리 질량과 내부 숲 깊이를 정리하고, 동측 전투 공간·독 늪·남북 route를 유지한다.

검수 파일: captures/ch1_outer69/index.html, REPORT.md, runtime.json, live/runtime.json, prep.json, promotion.json, preaudit.json, rebake-proof.log, tests.log. 체력50ms/무적하한60f와 임시24적을 사용한 시각 검수이며 밸런스 검증이 아니다. 이번 원화에 새 생체 움직임은 추가하지 않았다.

보존 체크포인트: tmp/ch1-checkpoint69-owned.zip. 맵 소유 파일과 맵 변경만 적용한 commit HTML/변경 로그, 타 작업 staging을 보존할 index HTML, 검수 자료를 묶어 엔트리 SHA256을 대조한다. 실행 가드는 HEAD·실제 index·소유 파일 해시를 재검사하고 변경 시 커밋 전에 중단한다.


---

# CH1-1 북쪽 쓰러진 고목 외곽 — 68차

북쪽 비보행 외곽에 큰 수평 속빈 고목과 낮은 뿌리 질량을 연결했다. 단일 master를 합성한 뒤 64청크를 clamped sampling으로 도출했고, 실제 달라진 6청크만 본편에 반영했다. 이번 원화는 정적 배경이며 새 애니메이션을 추가하지 않았다.

| id | 적용 위치·계약 | 정확한 값 |
|---|---|---|
| SOURCE68 | Higgsfield 원화 | `gpt_image_2_5`, job `ef33d5b1-192d-48d4-a7da-1500e3872fdf`; 요청2k/1:1/high/transparent, 실제2048²RGBA, native alpha0..254 |
| PLACE68 | master crop·배치 | `[1024,0,3072,2048]` = 2048²; 중심tile `[60,24]`; sprite2048²→1536²(scale.75); crop내offset `[666,215]`; RGB×.70, opacity.82 |
| MASK68 | 보행 보호·접지 | 현행 `layout.js`의200²grid와 마스크grid 전체 일치; MinFilter49/GaussianBlur20; 보행alpha 강제0, 8bit alpha양자화 |
| PIXELS68 | 실제 변화 | 568,682픽셀; 보행픽셀0, alpha0픽셀0, crop외부0. 최종patch는 preblended RGB+binaryalpha0/255 |
| CHUNK68 | 본편 PNG | `chunk_1_0`, `chunk_2_0`, `chunk_3_0`, `chunk_1_1`, `chunk_2_1`, `chunk_3_1`; core1024/bleed1/파일1026² |
| VERSION68 | 로더 | production cache `20260928-outer-68`; 비교경로cache와생체모듈61차 유지 |
| REBAKE68 | 보존 순서 | skin65→outer66→outer67→outer68; 마지막patch 좌표x1024/y0/width2048/height2048. 65차 이전master+현행4patch를 실제helper에 통과시킨8192²전체픽셀 동일 |
| PROOF68 | master SHA256 | `f2930397c019cfb49db74f369ce6c612674bca1c9ea2c83d569a2437bcf57171`; rawRGBA SHA256 `d93d7d181e2c0aa74fc66b9e8535bc7fcfce538e0842cca77837f5faa863c46a` |
| SOURCEFILES68 | 재현 자료 | `assets/map/ch1/production_finish/outer68_sources/`에원화·crop·patch·mask·prep·전체prompt/생성정보6파일 |
| CORRECTION67 | 이전기록정정 | 67차실제1024²→1536²(scale1.5). generated/cutout은동일승인cutout사본. 67차master와64청크전부동일; 이전불일치는검사기core/bleed좌표오류. 이미유효한67차pixels는복구대상으로삼지않음 |

## MAP PRODUCTION REPORT

STAGE: CH1-1 / stage0. GATE2 LARGE OUTER MASS의북쪽부분리터치. 공통제작가이드·맵디테일·SSOT를선행참조했다.

| 구분 | 항목 | 결과 |
|---|---|---|
| MASTER | silhouette / regions | 200²기존실루엣·구역보존. geometry·collision변경없음 |
| MASTER | main route / side spaces | 6시시작→12시출구와양쪽우회공간보존. 연결성회귀통과 |
| OUTER MASS | LEFT | 66차서쪽고목·67차북서쪽죽은숲유지 |
| OUTER MASS | RIGHT | 기존상태유지; 건강한식생·반복목질정리후속대상 |
| OUTER MASS | TOP | `[60,24]`주변에큰쓰러진고목1개와검은심재공동·낮은뿌리접지. 플레이공간은마스크보호 |
| OUTER MASS | SOUTH / major holes | 시작주변유지. 전체외곽통합과남은녹색식생은미완료 |
| LARGE | source assets / composites | Higgsfield GPT단일투명원화. 기존base부분합성; 독립prop추가없음 |
| LARGE | overlap / repeated silhouette | 허용된비보행외곽에만접속. 수직줄기반복을큰수평속빈목질로끊음 |
| MEDIUM | connections / remaining holes | 검은심재→큰수피판→낮은뿌리연결. 전체북·동쪽의큰질량통합은후속대상 |
| GROUND | shadow / contamination | 원화하부그림자·부패심재, 좁은feather접지. 보행바닥새오염없음 |
| GROUND | structure integration | 65차피부·동맥·독늪과원본base유지. 채널/길차단없음 |
| PLAYABLE | main arenas / travel space | 전투공터·출구통로·기존POI연결성보존. `G.map`전후동일true |
| PLAYABLE | breathing space / threat space | 중앙공터와이동공간픽셀변경0. 새적·밸런스·어택티켓없음 |
| PLAYABLE | combat readability | 기존AI를사용한임시24적·기존적혼합촬영. 적탄6샘플0/0/8/12/19/21개; 중앙캐릭터겹침은남아있어전체가독성PASS로단정하지않음 |
| LANDMARK | primary / secondary / tertiary | 생체나무·늪·캠프·제단·출구유지. 새고목은외곽배경계층 |
| CAMERA QA | START / EARLY | `[100,180]` / `[100,157]`, 일반production경로 |
| CAMERA QA | ARENA / SIDE L / SIDE R | `[100,120]` / `[49,151]` / `[151,136]`, 기존바닥·전투공간확인 |
| CAMERA QA | LANDMARK / LATE / EXIT | `[102,90]` / `[100,48]` / `[100,15]`, 일반production경로 |
| CAMERA QA | 추가북쪽·전후 | 후보6카메라전후, 본편21카메라1280×720. NORTH_MASS는비보행원화관찰용순간이동이며실제종주증거가아님 |
| TECH QA | route / collision | 기존layout연결성5회귀중해당검사통과; geometry변경없음. 게임`G.map`와실제입력후map동일 |
| TECH QA | pageerror / 404 | 후보·본편각0; HTTP>=400도0 |
| TECH QA | seam / loading | master와64청크전부픽셀동일,224경계strip동일. 본편54청크요청모두cache68,visibleIds전부drawnIds포함,route교체0 |
| TECH QA | performance | 정적6청크교체. 저사양GPU·NW.js·장시간FPS·무보정종주미검증; 속도개선주장없음 |
| TECH QA | regression / rebake | 지형5+재베이크보존2+HTML구문1=8PASS/0FAIL. helper전체픽셀재현확인; fullbuilder전체실행과는구분 |
| FILES | stage-owned | master·6청크·preview·source6·manifest·composition·gamecache한줄·맵docs·검수자료. `tmp/ch1-production-pre68`반영전백업 |
| FILES | concurrent touched | 공유game.html·CHANGELOG은즉시읽고맵범위만수정. 기존UI/인벤토리작업·staging유지 |
| FILES | unrelated touched | 없음. 타작업수정·삭제·강제정리없음 |
| GIT | staged / commit | 맵 전용 격리 체크포인트 준비. 권한 승인 후 exec 실행기가 PowerShell 시작 전 OS317로 실패하여 커밋 미완료. 타 작업 staging 보존. Changes 209개로 100개 미만 제한은 미충족; 임의 삭제·숨김·강제 커밋하지 않음 |
| GIT | push / deploy | 수행하지않음 |

**VISUAL VERDICT: RETOUCH** — 북쪽수평고목과접지는본편에서확인했다. 전체외곽에는건강한식생·반복실루엣이남아있고밀집전투의캐릭터겹침도유지된다. 자동검사PASS로전체visualPASS를대체하지않는다.

NEXT PASS: 동쪽큰외곽질량을낮은부패목질과검은숲깊이로부분교체하고, 양쪽전투공간·남북route를유지한다.

검수파일: `captures/ch1_outer68/index.html`, `runtime.json`, `live/runtime.json`, `prep.json`, `promotion.json`, `preaudit.json`, `rebake-proof.log`, `tests.log`. 본편기록은체력50ms/무적하한60f보정·임시24적을사용한시각검수이며밸런스검증이아니다.

보존 체크포인트: `tmp/ch1-checkpoint68-owned.zip`. 맵 소유 파일 116개, 맵 변경만 적용한 commit HTML/변경 로그, 타 작업 staging을 보존할 index HTML, 검수 자료를 묶었다. ZIP의 모든 엔트리는 원본 SHA256과 대조했다. 실행 가드가 HEAD·실제 index·소유 파일 해시를 다시 검사하므로 다른 에이전트가 후속 변경을 했다면 재검토 전 커밋을 중단한다. 격리 HTML의 실행 가능한 inline script 4개씩도 구문 검사했다.


---

# CH1-1 북서쪽 죽은 숲 외곽 — 67차

66차 서쪽 고목을 보존한 채 북서쪽 비보행 수풀 띠를 속 빈 죽은 목질과 검은 내부 숲 질량으로 부분 교체했다. 중앙 전투 바닥·충돌·진행은 바꾸지 않았다.

| id | 항목 | 값 |
|---|---|---|
| SOURCE67 | 원화 | Higgsfield `gpt_image_2_5`, job `3bafa672-c310-4c12-974e-e94aaef66a84`, 실제 1024². 생성본의 체크무늬 배경 픽셀을 검수에서 발견해 production에 사용하지 않음 |
| CUTOUT67 | 배경 제거 | Higgsfield `image_background_remover`, job `74074919-4563-4c2f-a331-923ad7ea9b11`; cutout만 합성에 사용 |
| PLACE67 | 합성 | master crop `[0,1024,3072,3072]`, 중심 tile `[20,55]`, 원화 1024²→1536²(scale1.5), RGB×.66/opacity .78 |
| MASK67 | 보호 | `layout.js` 200² 보행 grid, MinFilter49/GaussianBlur20. 보행 픽셀·alpha0 픽셀 변화 0 |
| CHUNK67 | 본편 | 실제 변경 4청크: `x0..1/y1..2`; 후보 16청크 중 나머지 12개는 기존과 픽셀 동일. core1024/bleed1/1026², 224 strip 검사 PASS |
| VERSION67 | 로더 | production cache `20260928-outer-67`; 기존 비교 cache와 생체 모듈61차 유지 |
| SOURCEFILES67 | 보존 | `assets/map/ch1/production_finish/outer67_sources/`의 generated와 generated_cutout은 동일한 승인 cutout 사본. 최초 체크무늬 원화는 폐기; crop·patch·mask·prep·generation 보존 |
| REBAKE67 | 계약 | `retouch-layers.json`의 skin65→outer66→outer67 순서. 68차 사전검수에서 67차 master와 64청크 전체 픽셀 동일 확인. 과거 불일치 기록은 검사기의 core/bleed 좌표 오류로 정정 |

## MAP PRODUCTION REPORT

STAGE: CH1-1/stage0. GATE2 LARGE OUTER MASS의 북서쪽 부분 리터치.

| 구분 | 결과 |
|---|---|
| MASTER | 200², 6시 시작·12시 출구·넓은 전투 공터와 주/보조 경로 보존 |
| OUTER MASS | 북서쪽 건강한 잎·반복 고목 일부를 어두운 속 빈 목질/내부 숲 질량으로 교체. LEFT의 66차 고목과 역할 분리 |
| LARGE / MEDIUM | 배경 숲 깊이→불균일한 갈라진 목질→낮은 뿌리 전이. 새 중심 랜드마크·small scatter 없음 |
| GROUND | 비보행 경계에서만 낮은 뿌리 접지. 보행 바닥·피부·동맥·독 늪은 그대로 |
| PLAYABLE | 보행 픽셀 변경0, 충돌/route 변경0. 기존 밀집 전투의 player·enemy·projectile·parry 가독성 확인 |
| LANDMARK | 생체나무/늪/캠프/제단 유지. 새 질량은 외곽 back/mid 계층 |
| CAMERA QA | 후보 전후 5카메라, 본편 일반 경로 17카메라 1280×720. NW 질량, 접근, 출구 접근, 전투 공터, 시작점 포함 |
| TECH QA | `G.map` 동일true, pageerror0/HTTP>=400 0, visibleIds=drawnIds, 224 seam strip PASS, 본편 요청은 cache `20260928-outer-67` |
| TESTS | 지형5+재베이크2+HTML1 = 8 PASS/0 FAIL |
| FILES | master/4청크/outer67 source7/manifest/composition/game cache/documentation; tmp/ch1-production-pre67 백업 |
| GIT | 다른 작업 staging 보존. 별도 커밋은 실행기 PowerShell 317 오류로 아직 미완료 |

**VISUAL VERDICT: RETOUCH** — 북서쪽 큰 질량은 개선됐지만, 남은 외곽의 녹색 식생·반복 목질과 전체 지도 통합은 후속 패스 대상이다.

NEXT PASS: 북쪽/동쪽 외곽의 건강한 식생을 큰 질량 단위로 바꾸되, 전투 중앙과 남북 진행 통로는 유지한다.

본편 일반 경로: 17카메라·실제 입력·임시24적, route 교체0, `G.map` 동일true, pageerror0/HTTP>=400 0, 모든 청크 `20260928-outer-67`. master SHA256 `4467b7ddca4094ca1f4865bc24fa1519106b3093d500404a109b49be0d6be456`.


---

> 2026-09-28 67차 기록(68차 이전): 북서쪽 비보행 외곽의 건강한 수풀 띠를 죽은 속빈 목질·내부 숲 질량으로 부분반영(master/4청크 x0..1/y1..2). production cache `20260928-outer-67`; 보행pixels 변경0, 65차 피부·66차 서쪽 고목·생체모듈61차 보존. 생성본의 체크무늬 배경은 폐기하고 background-remover cutout만 사용. 전체 VISUAL VERDICT RETOUCH.

# CH1-1 서쪽 썩은 고목 외곽 — 66차

65차 피부 지면을 보존하고 서쪽 비보행 외곽에 큰 썩은 고목·쓰러진 통나무·뿌리 질량을 부분 반영한다. 배경 cache는20260928-outer-66, 생체모듈61차 유지. 새로운 고목은 정지 원화다.

| id | 항목 | 구현 값 |
|---|---|---|
| SOURCE66 | 생성 | Higgsfield gpt_image_2_5/job d7e3db21-1e68-4a14-92c4-8b1b71101926,2k/1:1/high/transparent;실제2048²RGBA;로컬참조 업로드 사용 안 함 |
| PLACE66 | 합성 | sourceCrop[0,3072,2048,5120],중심tile[18.5,98],원화2048²→1536²(scale.75),RGB×.70/opacity.85 |
| MASK66 | 보호 | layout.js 200² 보행grid로 forest mask;MinFilter49/GaussianBlur20,walkable alpha=0;alpha 8bit양자화.변경929908pixels;보행/zero-mask 변경0 |
| CHUNK66 | 배경 | master8192²→world8000²/T40/source40.96px/tile;core1024/bleed1/1026²;실제4청크x0..1/y3..4만교체,나머지60보존.후보12중8pixel동일 |
| REBAKE66 | 보존 | retouch-layers.json:skin65[2007,2867,3440,4382] 다음outer66[0,3072,2048,2048].이미블렌딩된RGB+binaryalpha0/255만허용;범위/규격/partialalpha불일치시throw |
| BUILDER66 | 적용 | tools/ch1-production-retouch.mjs의applyRetouchLayers→master저장→청크분할.생성순서고정;composition.json bakeVersion/retouchLayers동기화 |
| PROOF66 | 재현 | pre65원본+skin65+outer66→현재master8192²RGBA전체픽셀동일true;rawSHA256 f4af6f472ad796d457087fad1d8394a580368880845b310d84373611ce58e5b5.전체builder실행은미실시 |
| VERSION66 | 로더 | production분기20260928-outer-66;기존outer비교20260917-depth-2/diablo20260924-blockout-2유지.신규runtime draw/이미지로드없음 |
| SOURCEFILES66 | 자료 | production_finish/outer66_sources:generated/crop/patch/mask/prep/generation 6파일;skin65_sources/skin65_patch.png 추가보존자료 |
| MOTION66 | 동작 | 기존가스·버블·동맥움직임유지.새고목/피부의전체맥동미구현 |
| RECOVERY66 | 준비 오류 | Python composition.json 기본cp949읽기실패로메타데이터완료부만중단;UTF-8읽기로완료.아트중복반영없음 |

## MAP PRODUCTION REPORT

STAGE: CH1-1/stage0. LARGE OUTER MASS→GROUND CONNECTION 부분 리터치.

| 구분 | 결과 |
|---|---|
| MASTER — silhouette / regions / main route / side spaces | 200²/8지역/53점경계/6시시작·12시출구/양쪽진행·전투공터보존 |
| OUTER MASS — LEFT / RIGHT / TOP / SOUTH / major holes | LEFT서쪽부분고목덩어리강화.나머지외곽원본유지;건강한식생/반복목질잔여 |
| LARGE — source assets / composites / overlap / repeated silhouette | 큰빈고목·불균일높이부러진줄기·쓰러진통나무·뿌리연결.원본베이스보존하며마스크합성;작은장식scatter없음 |
| MEDIUM — connections / remaining holes | 새고목의낮은뿌리→기존서쪽목질연결.전체서쪽/북쪽교체는잔여 |
| GROUND — shadow / contamination / structure integration | .70RGB/저대비회갈색;비보행외곽만반영.기존65피부/보행지면보존 |
| PLAYABLE — main arenas / travel / breathing / threat / combat readability | 새장애물/충돌없음.기존공터·캠프진행보존;밀집전투중앙겹침잔여 |
| LANDMARK — primary / secondary / tertiary | 생체나무/캠프/늪/제단/아치보존;고목은주변질량 |
| CAMERA QA | 1280×720/전후17카메라;같은game snapshot.배경비교전후map동일;적·이펙트시간차존재 |
| TECH QA — route / collision | G.map전후동일true;입력/임시전투후동일.보행pixels변경0;전구간종주미실시 |
| TECH QA — pageerror / 404 / seam / loading / performance | 비교pageerror0/HTTP오류0;64청크1026²/224stripPASS;17카메라visibleIds=drawnIds.성능/NW.js미검증 |
| TESTS | 재베이크2+지형5+HTML1=8PASS/0FAIL;새보존검사는FAIL확인후구현 |
| FILES — stage-owned | master/4청크/outer66_sources6/skin65patch/retouchmanifest/composition/builder/helper/test/gamecache1분기/관련docs |
| FILES — concurrent touched / unrelated touched | 공유game.html/CHANGELOG_SYNC최신내용에좁은수정;타작업staging보존.무관파일수정없음 |
| GIT — staged / commit / push / deploy | 별도완료증거기록.외부push/deploy없음.수정전master/청크/메타데이터/main은tmp/ch1-production-pre66에backup |

| CAMERA | tile |
|---|---|
| START | [100,180] |
| EARLY | [100,157] |
| ROOT_BEND | [83,125] |
| ARENA | [100,120] |
| FORECOURT | [100,113] |
| TREE_WEST | [82,96] |
| TREE_SOUTH | [102,109] |
| WEST_EDGE | [68,100] |
| WEST_JOIN | [72,117] |
| OUTER_WEST | [35,96] |
| CAMP_EDGE | [45,106] |
| LOW_WEST | [39,114] |
| SIDE_L | [49,151] |
| SIDE_R | [151,136] |
| LANDMARK | [102,90] |
| LATE | [100,48] |
| EXIT | [100,15] |

실제입력WASD각350ms/공격900ms/Q.임시적24(2ring×12,半径250/390px),6회500ms샘플은global카운트.검수HP50ms보충/iframes최소60으로밸런스/무보정클리어/전종패링/loot/종주PASS아님.

**VISUAL VERDICT: RETOUCH** — 서쪽큰형태부분반영.맵전체의건강한외곽식생·반복목질·중앙밀집가림은잔여.

NEXT PASS: 새고목 주변과위쪽외곽의큰형태연결을이어가며보행·넓은전투공터보존.

## 본편 경로 증거

본편game/이미지route교체0,17카메라·실제입력·임시24적검수.요청50청크모두20260928-outer-66;visibleIds=drawnIds/pageerror0/HTTP오류0/G.map동일true.현재masterSHA256 3d25444d37085eaffb44ae8b16a702592777e9504552ffbd769a6d85905830fe.성능/NW.js미검증.

---

<a id="skin65"></a>

# CH1-1 피부 바닥 본편 연결 — 65차

63차 첫공터·64차 나무앞 재질과65차 서쪽 연결을 한 master로 통합한다. 생체모듈은61차 유지,배경청크 cache는20260928-skin-65. 맵 전체의완성판정과국소반영을구별한다.

## 제작 계약

| id | 항목 | 값 |
|---|---|---|
| SOURCE65 | 원화 | 63차 Higgsfield gpt_image_2_5 job8297189f-c4f9-4719-91f1-7cb5df20c1a6,1024² RGB.신규생성없음;generation.json 원본프롬프트보존 |
| CROP65 | 통합 선택 | [2007,2867,5447,7249],3440×4382;8192² master source40.96px/tile |
| PHASE65 | 재질 | RGB×.53;source anchor[2498,4587];sample1024/step512/Hanning floor.001/rotation90×((ix+2iy)%4) |
| MASK65 | 서쪽 연결 | tile타원[69,100,12,25],[73,123,12,15];alpha.60/feather.35/smoothstep;기존64mask와max union |
| ROOT65 | 보호 | 기존[105,95,20,15],[108,79,18,10],protect=smoothstep(clamp((1.18-r)/.18));뿌리·갈비뼈보존 |
| KEEP65 | 픽셀 | mask0영역8,247,686pixels변경0;새서쪽영역밖기존64pixels변경0 |
| CHUNK65 | 배경 | 30청크 x1..5/y2..7,core1024/bleed1/전체1026².나머지34청크보존;단일master crop과픽셀동일검사 |
| VERSION65 | 로더 | game.html production smoothing분기만20260928-skin-65.과거outer20260917-depth-2/diablo20260924-blockout-2 유지.생체모듈61/캐시·draw추가없음 |
| SOURCES65 | 복구자료 | assets/map/ch1/production_finish/skin65_sources에재질/합성crop/레이어/마스크/prep/generation 6파일 |
| MOTION65 | 움직임 | 추가재질은정지그림.기존늪가스·버블·동맥모션유지;새피부전체맥동미구현 |

## 검수

첫비교before64/after65,1280×720,14카메라. game.html snapshot동일사용. 실제서버본편적용후는별도 live/runtime.json으로확인한다. 두실행의적·이펙트시간은동일하지않으므로전체화면차이를재질차로간주하지않는다.

| 검증 | 비교 검수 결과 |
|---|---|
| G.map | SHA256 8a5dfe9f1a6c5a283be293a85cedb49509d1db5d317e063fde0b2cd5ff6c65a1;전후동일true,입력·임시전투후동일true |
| 오류 | pageerror before0/after0;HTTP>=400 before0/after0 |
| 청크 | 후보30개전부요청;64개1026²;224core/bleed strip PASS/불일치0;모든14카메라visibleIds=drawnIds |
| 입력 | WASD각350ms/공격900ms/Q;{"x":4020,"y":6060}→{"x":4025.5827200000003,"y":6060};종주증거아님 |
| 밀집 | 기존mkEn/AI로24추가;2ring×12,반경250·390px.6회500ms샘플global alive=31/31/31/31/31/31,global적투사체=1/2/10/11/19/24 |
| 가독성 | 청색·황색·분홍탄과낮은대비바닥구별.중앙적과타격효과중첩시캐릭터가림잔여 |
| 한계 | HP50ms보충/iframes최소60,synthetic검수;밸런스·무보정클리어·전종패링·loot·종주·장시간/NW.js/FPS성능PASS아님 |
| 준비 오류 | prep의비교파일old crop경로63잔여로종료1;경로64로수정하고완료부재실행.원화·청크생성자체는완료돼보호·이음새재검증후사용 |

## MAP PRODUCTION REPORT

STAGE: CH1-1/stage0,GATE4 GROUND CONNECTION 부분반영.

| 구분 | 결과 |
|---|---|
| MASTER — silhouette / regions / main route / side spaces | 기존8지역·53점경계·200²·6시시작/12시출구·양측공간유지 |
| OUTER MASS — LEFT / RIGHT / TOP / SOUTH / major holes | 서쪽지면접합개선.네방향질량·구조보존.건강한외곽식생·반복목질잔여 |
| LARGE — source assets / composites / overlap / repeated silhouette | 기존master+63피부재질.고목과뿌리실루엣보존.새구조물없음;반복실루엣해결아님 |
| MEDIUM — connections / remaining holes | 첫공터→root_bend→나무앞→서쪽피부연결.다른측면/북쪽후반연결잔여 |
| GROUND — shadow / contamination / structure integration | 회자주피부막·주름과기존그림자통합.서쪽녹갈색띠완화;녹색외곽질량완전교체아님 |
| PLAYABLE — main arenas / travel / breathing / threat / combat readability | 넓은공터·진행·호흡·위협공간보존.평면재질만변경.탄구분확인;중앙중첩잔여 |
| LANDMARK — primary / secondary / tertiary | 생체나무/제단/늪·아치·캠프유지;추가중앙장애물없음 |
| CAMERA QA — START | tile(100,180),before64/after65;청크정합·전후사진보존 |
| CAMERA QA — EARLY | tile(100,157),before64/after65;청크정합·전후사진보존 |
| CAMERA QA — ROOT_BEND | tile(83,125),before64/after65;청크정합·전후사진보존 |
| CAMERA QA — ARENA | tile(100,120),before64/after65;청크정합·전후사진보존 |
| CAMERA QA — FORECOURT | tile(100,113),before64/after65;청크정합·전후사진보존 |
| CAMERA QA — TREE_WEST | tile(82,96),before64/after65;청크정합·전후사진보존 |
| CAMERA QA — TREE_SOUTH | tile(102,109),before64/after65;청크정합·전후사진보존 |
| CAMERA QA — WEST_EDGE | tile(68,100),before64/after65;청크정합·전후사진보존 |
| CAMERA QA — WEST_JOIN | tile(72,117),before64/after65;청크정합·전후사진보존 |
| CAMERA QA — SIDE_L | tile(49,151),before64/after65;청크정합·전후사진보존 |
| CAMERA QA — SIDE_R | tile(151,136),before64/after65;청크정합·전후사진보존 |
| CAMERA QA — LANDMARK | tile(102,90),before64/after65;청크정합·전후사진보존 |
| CAMERA QA — LATE | tile(100,48),before64/after65;청크정합·전후사진보존 |
| CAMERA QA — EXIT | tile(100,15),before64/after65;청크정합·전후사진보존 |
| TECH QA — route / collision | 비교전후G.map동일,기존충돌/경계/배치유지.전체반경종주미실시 |
| TECH QA — pageerror / 404 / seam / loading / performance | 비교오류0/HTTP오류0/224stripPASS/14카메라ready.FPS측정·NW.js미검증 |
| FILES — stage-owned | production master/30청크/skin65_sources6파일,game.html cache분기1개,관련맵문서·CHANGELOG_SYNC,ignored검수/backup |
| FILES — concurrent touched / unrelated touched | 공유game.html·CHANGELOG_SYNC는최신내용을읽고해당분기/맨위이력만수정.타작업스테이징유지.기타파일미수정 |
| GIT — staged / commit / push / deploy | 결과를완료증거에기록.외부push/deploy없음.원본master/30청크backup31파일tmp/ch1-production-pre65 |

**VISUAL VERDICT: RETOUCH** — 부분지면연결은본편에반영하지만전체맵은외곽식생·중앙전투중첩·성능QA잔여로완성아님.

NEXT PASS: 외곽의건강한식생과반복고목을큰형태부터리터치.나무뿌리·전투공간·진행을보존하고카메라/전투검수지속.


---

## 2026-09-28 — 64차 북쪽 피부 지면 연결 검수

현행 production은61차이며64차아트는별도검수본이다.63차의Higgsfield GPT 재질을재사용해나무앞·서쪽으로연결;신규생성없음.본편master/청크/충돌/캐시버전은변경하지않았다.

| id | 계약·검수 | 실제 값 |
|---|---|---|
| SKIN64 | 선택·레이어 | source crop[2498,2867,5447,7249],2949×4382; anchor[2498,4587];RGB×.53;sample1024/step512/Hanning floor.001/rotation90×((ix+2iy)%4) |
| SKIN64_MASK | 연결·보호 | tile타원[96,112,29,24],[80,93,16,23],alpha.58/feather.23.뿌리보호[105,95,20,15],[108,79,18,10],protect=smoothstep(clamp((1.18-r)/.18));63mask와max union |
| SKIN64_KEEP | 픽셀보존 | mask0영역6,976,692pixels중변경0;새북쪽영역밖63pixels변경0 |
| SKIN64_QA | 실제게임 | before63/after64;12카메라;24검수청크(x2..5/y2..7);224stripPASS;G.map동일;pageerror/HTTP오류0;ch1LivingDetail41PASS |
| SKIN64_COMBAT | 밀집가독성 | 임시기존AI적24마리추가;밝은투사체구분확인.중앙실루엣가림잔여.HP50ms보충/iframes60;성능·밸런스PASS아님 |
| SKIN64_STATE | 판정·기록 | VISUAL VERDICT: RETOUCH.정지재질이며신규피부모션완료아님.외곽·녹색잔여·밀집중앙중첩·성능QA잔여 |

전체수치·12카메라좌표·MAP PRODUCTION REPORT: [64차보고서](../../captures/ch1_ground_skin64/REPORT.md), [비교갤러리](../../captures/ch1_ground_skin64/index.html).승격시assets원본/레이어/마스크와master→64청크→cacheversion→docs를같이반영한다.

> **2026-09-28 63차 별도 검수본:** production master의crop `[2498,4587,5447,7249]`만피부재질로부분합성하고source(core1024/bleed1)와동일좌표의16청크를검수라우팅으로교체했다. 현행master/64production청크/geometry/런타임코드미변경. 크기1026²·전체이음새224검사통과. [검수범위·시각판정·미완료](../../captures/ch1_ground_skin63/REPORT.md).

> **2026-09-28 61차 현행:** 큰늪 원화 groundSprite는 가장자리의 밝은 돌 반사만 낮춘다. glare=clamp((L−105)/110)×max(0,1−d/64)×.38, RGB×(1−glare). d≥64인 내부 독액은 이 보정 없음. 60차 비대칭 접지와 캐시·draw 수는 유지. [검수·보고](CH1_SWAMP_SEEP_PASS60.md#61차-밝은-돌-가장자리-완화).

> **2026-09-28 60차 늪 접지 현행:** 큰늪 swampApron 외측폭은 고정28에서 좌하단 중심의 가변18~30캐시px,alpha계수 .48→.58이다. 512²캐시/1MiB 및 swamp최대20draw 유지. [현행 공식·검수](CH1_SWAMP_SEEP_PASS60.md). 아래31차 고정폭 수치는 이력이다.

> **2026-09-28 59차 현행:** 동측 region1 합성은 .76, palette #343034/#49443c/#303829,서쪽 lobe [155,282,146,140] 추가. 중앙과 회갈색을 공유하고 늪쪽 녹갈색 유지. region0 .82/region1·2 .76/region3·4 .6,지역5캐시7.5MiB/추가draw0. [현행 수치·검수](CH1_EAST_TISSUE_PASS59.md). 아래 이전 수치는 당시 이력이다.

> **2026-09-17 리터치 이력:** bake/cache `20260917-depth-2`. 신규 숲 원화 4종, 고정 외곽 42배치와 낮은 뿌리 9배치. CH1-1 hand `m_c1tree`만 화면 크기 0.72 / pivotY 0.72; 원본 metadata 1450 및 충돌은 유지. geometry/START/EXIT/진행 계약 유지. 최신 시각 판정 **RETOUCH**. [실제 화면·영상·검증 한계](CH1_1_DEPTH_RETOUCH_20260917.md). 아래 ground-2와 이전 PASS는 당시 이력이다.

> **53차 현행(2026-09-27):** CH1서쪽 m_bone_arch(1420,6020)에 하단alpha접촉그림자256²/.25MiB 추가.원화·불꽃·충돌·타챕터아치유지.모듈20260927-53. [수치·검증](CH1_ARCH_CONTACT_PASS53.md).


> **52차 현행(2026-09-27):** 북동pool 남쪽에 regionalSkin variant4, tile(167,47)/900×680 지면전이 추가.768×512/1.5MiB, 가시때1draw.기존버블·접지·충돌유지,모듈20260927-52. [현행색·영역·검증](CH1_POOL_APPROACH_PASS52.md).


> **51차 현행(2026-09-27):** 북동pool 접지폭을 균일24px에서 비대칭18~44캐시px로 변경. 왼쪽아래·오른쪽의 젖은 번짐, 기존512²캐시/버블/충돌유지. 모듈20260927-51. [현행공식·검증](CH1_POOL_SEEP_PASS51.md).


> **50차 현행(2026-09-27):** 북동 m_c1pool(6700,1740)의 기존 표면 효과를3개 파열 vent로 교체. 큰늪64프레임 버블 atlas 재사용+gas512²/1MiB.49차접지·충돌유지,모듈20260927-50. [현행동작·검증](CH1_POOL_BURST_PASS50.md).


> **49차 현행(2026-09-27):** 북동 m_c1pool(6700,1740)에 원화 alpha 윤곽의 젖은 접지512²/1MiB 추가. 기존 수축·충돌 유지. 모듈20260927-49. 이전 버전·메모리 기록은 해당 pass 이력이며 [현행 추가분·검증](CH1_POOL_CONTACT_PASS49.md) 참조.


> **39차 현행(2026-09-27):** 구형 rotten_tree/vine_pillar 원화와사본7개 폐기. 게임·편집기·충돌·나무움직임에서제외. 과거배치/확대재작업계획은이력. dry아틀라스는전용 _atlasDry:1로분리해동작보존. [현행폐기SSOT](CH1_LOW_QUALITY_RETIREMENT_PASS39.md).

> **38차 현행(2026-09-27):** 구형 weapon_pile.png 및 동일사본4개 폐기·격리. m_wpile/m_c5wpile/weapon_pile 사용금지. 과거무기더미배치·접지기록은이력이다. 접지현행2장/0.5MiB,전체native87.81269454956055MiB,모듈20260927-38. [검수·폐기 SSOT](CH1_LOW_QUALITY_AUDIT_20260927_PASS38.md).

> **2026-09-27 37차 현행 폐기 결정:** 구형 tombstone.png와 exposed_root.png는 사용자 지정 저품질 원화로 사용 금지. 36차 접지 보강은 폐기되었다. 아래의 해당 에셋 수치·좌표·접지 기록은 과거 이력이며 현행 등록·배치가 아니다. 동일 원화 6파일 격리, CH1 authored 8배치 제거, 접지 계열은 3장/0.75MiB로 복귀. [폐기 SSOT](LOW_QUALITY_ASSET_RETIREMENT_20260927.md).

> **2026-09-16 후속 실제 수정:** 사용자 추가 지시에 따라 bake/cache가 `20260916-ground-2`로 변경됐다. 흙길/공터와 이끼·낙엽을 구분하며 geometry/START/EXIT/배치/진행은 유지한다. [현재 지면 구성·전후 증거](CH1_1_GROUND_STRUCTURE_20260916.md). 아래 finish-3 및 ec7bf70d8 동일성 판정은 수정 전 검수 이력이다.

> **후속 검수 정정: VISUAL VERDICT: RETOUCH.** 아래 제작 당시 PASS 및 “필수 미완성 구간 없음” 판단은 철회한다. 게임/맵 ec7bf70d8은 보존했다. [실제 전후 화면·일반 플레이·위치별 결함 검수](CH1_1_FINAL_REVIEW_20260916.md)가 최신 판정이다. 기존 기술/QA 진행 이력은 그대로 유지하며 일반 클리어 증거로 확대하지 않는다.

# EXODUSER CH1-1 PRODUCTION FINISH — 2026-09-16

상태: **실제 1-1 전체 적용, 런타임 리터치, 입력 종주 및 기존 완료 조건/1-2 진입 확인 완료.**

시각 판정은 아래 카메라 검토에 근거한 제작자 판정이다. 일반 난이도 밸런스, 모든 실행 환경의 안정성, 사용자 최종 승인을 의미하지 않는다. 전투 종주의 상당 부분은 QA 피해 무효 상태였다. 무보정 클리어로 보고하지 않는다.

## 1. 실제 적용한 내용

### 대상 및 연결

| 항목 | 실제 계약 |
|---|---|
| 대상 | `STAGES[0]={id:0,hell:0,floor:1,mw:200,mh:200,type:'field',face:true}` |
| 게임 표시 | `제1구역 · 썩은 숲 1구역 / THE ROTTEN FOREST` |
| 배치 | `_MAP_COMPOSE[0].handProps` 직접 배열 |
| 혼동 제외 | `_CH1S1` → `_MAP_COMPOSE[1]`은 CH1-2이며 변경하지 않음 |
| 진입 | 기존 `genFromTemplate`, `_cloneField11(0)`, `_buildCh1StartForestRLE`, `CH1_1_PRODUCTION.buildRLE(200,200)` 연결 |
| 기본 배경 | `assets/map/ch1/production_finish/chunk_x_y.png?v=20260916-finish-3` |
| 규모 | 200×200타일, T40, 월드8000² 유지 |
| START | `(100.5,185.5)` 유지 |
| 북쪽 | gate x99..101/y5, exit x99..101/y7, 접근 바닥 x88..112/y2..35 유지 |
| 주 랜드마크 | `m_c1tree` authored102,90 / runtime102.5,90.5, sz1450, colW380/colH230, keepAR 유지 |
| 단구 | 중심147,98, rx18/ry9, inner .84/outer1.04, 서측 ramp x125..135/y98, 폭1.8→3 유지 |
| 배치 개수 | authored62, runtime63(시스템 gate1), hand 충돌21+시스템1=22 |
| 자동 중복 | `hand:1,dense:1,lm:[],mega:[]`; 자동 큰 장식/바닥 carpet 차단. 실제 scatter/decorList0 |
| 남측 성문 | 기존9월12일 철창 제거 상태 유지. 숲 어깨와 진입 흔적으로 문턱을 구성했으며 성문 재설치를 했다고 주장하지 않음 |

남쪽 문턱에서 첫 공터로 벌어지고, 서쪽 숲이 안으로 돌출되는 뿌리 숲길을 지나 시체나무 분지로 이어진다. 나무 양쪽 우회로, 야영지, 단구, 북쪽 고치와 물가를 비대칭 외곽에 연결했다. 북쪽은 기존 출구 축으로 수렴한다. 8개 구역은 역할 데이터이며 별도 사각형 방/로딩 단위가 아니다.

53개 경계점의 고정 polygon이 지형 기준이다. 충돌은 타일 RLE/기존 줄기 충돌을 사용하고, 그림의 경계에는 부드러운 접합을 둔다. 잎·가지 이미지 사각형을 벽으로 추가하지 않는다. 기존 flowfield/스폰/플레이어의 맵 충돌 경로를 유지한다.

### 배경 및 리터치

| 항목 | 최종 값/처리 |
|---|---|
| layout / bake version | `20260916-finish-1` / `20260916-finish-3` |
| 마스터 | 8192², SVG viewBox 0 0 200 200, bake40.96px/타일 |
| 청크 | 8×8=64, source core1024, bleed1 포함1026² |
| 월드 대응 | source1024→world1000, 전체8192→8000. 빌더와 렌더러를 함께 정규화 |
| 배경 x scale | production1, 과거 outer .965 유지 |
| 가시범위 | 배경 요청/표시 camera zoom 최소 .3 반영. props zoom 보정은 stage0 배경 활성 때만 |
| 합성 | 지면23+외곽22+연결11=고정56레이어. 아래 전수표 |
| 소스 | 기존 CH1 원화10종+ground_dark_soil.png. 타 게임 추출 아트 없음 |
| 확대/방향 | 최대1.3, 구조물 회전0/반전0, 랜덤 배치/시드 없음 |
| 바탕 | soil 원본1024², brightness .55/saturation .58 |
| 뒤쪽 경관 | soil brightness .24/saturation .35/tint #273326 |
| mask | polygon stroke1.8타일, mask blur18 bake px. 충돌 polygon 자체는 blur하지 않음 |
| 저주파 재질 | 길/공터/습지/뿌리 색 면만512² 합성, Gaussian1.3타일; 원화 RGB blur0 |
| 지면 접합 | 가장자리24%, 타원 가장자리38% smoothstep alpha, 배치 opacity×.7 |
| 숲 접합 | 가장자리9.5% alpha feather, 원화 RGB 선명도 유지 |
| 성능 구조 | 기존 비동기 decode/warm 캐시 사용. 합성/지형 제작은 빌드 시 수행 |

첫 적용 화면에서 지면 원본 패치가 읽혀 alpha 접합을 다시 제작했다. 전체 조망에서 청크와 props의 zoom 가시범위를 맞추고, 최종200타일 bake 좌표를 명시적으로 통일했다. 이후 기본 카메라9곳을 다시 촬영하고 최종 배경으로 입력 종주를 재실행했다.

### 위치 보정

| 대상 | 이전 authored | 최종 authored | 이유 |
|---|---|---|---|
| m_ctree1, scale .85 | 80,184 | 84,184 | 남측 숲 어깨 접지 |
| m_ctree3, scale .95 | 24,96 | 30,96 | 서측 외곽 접합 |
| m_fbones | 78,182 | 82,180 | 진입 경계 안에 정착 |
| m_vine_pillar | 29,158 | 34,156 | 서남 통로 연결 |
| m_c1sroot | 173,151 | 171,150 | 동남 접합 |
| stage0 spawnHole | 70,170 | 74,168 | 큰 적의 줄기/경계 여유. 종류/개수 유지 |

### Dimraeth 적용 범위

기존 `DIMRAETH_MAP_RESEARCH_20260916.md`, 근거 이미지, 참고 커밋4539c6fbd를 확인했다. 관찰 근거는 이동 바닥/외곽 경관의 역할 분리, 반복 재료의 연결, 장소별 지면 변화다. 이를 고정 polygon·연결 지면·역할 구역으로 옮긴 것은 **EXODUSER 제작을 위한 추론/설계**다. 바닥 재사용만으로 원작 자동 생성 구조를 단정하지 않는다. 이번 결과는 고정1-1이며 범용 절차 생성기가 아니다. 참고 커밋으로 되돌리지 않았다.

## 2. 실제 실행하여 확인한 내용

| 실행 | 결과 | 제한 |
|---|---|---|
| 본편 stage0 진입 | game.html에서 실제1-1 표시, production 로드 | QA test 슬롯 |
| 첫 전투 | Lv1 시작 장비로 피해 무효 적용 전29처치 | 전체 무보정 난이도 검증 아님 |
| 필드 이동/전투 | 실제 키·마우스 입력으로 남측→전투터→양측 주요 전투 지점→북측 이동, 추격/공격/기존 bladeDash 회피 확인 | 이후 피해 무효 P.iframes 사용 |
| 진행 조건 | 네 방면 대상 실제 처치, `_fbDone=true`, `_bossUnlocked=true`, 기존 북쪽 진입으로 보스 전환 | 몬스터 HP/처치 수/게이트/공격력 강제 설정 없음 |
| 보스/출구 | 실제 공격으로 기존 shield/HP/부활 처리. 한 번 사망 후 기존 재도전 사용. arena exit64,2로 실제 걸어 들어가 stageCleared=true | arena에서 피해 무효 재설정 |
| 다음 구간 | 기존 다음 버튼→여정(±0레벨)→G.stage1, stage0 배경 비활성 | CH1-2 전체 전투는 미검증 |
| 최종 배경 재종주 | START100.5,185.5→첫공터→서쪽 야영지→나무 양쪽→단구 ramp 왕복→북쪽101.36975,7.71085, 실제 입력만 사용 | mapqa/Lv500/적 비활성, 이동 전용. 이 실행으로 출구 해제를 주장하지 않음 |

종주 중 텔레포트/좌표 강제 변경은 사용하지 않았다. 비교 사진·전체 조망·성능 측정의 위치/카메라 설정은 **정지 관찰용**이며 종주 실적으로 합산하지 않는다. 전투 기록에는 기존 QA 재화가 있었고 스킬 일괄 UI를 열었으나 레벨 잠금으로 강화되지 않았다. 일반 밸런스 실험과 구별한다.

최종 이동 영상은 실제 게임 canvas의 captureStream 연속 녹화다. 연결 복구로 입력 로그 일부가 누락된 동안에도 녹화는 계속됐다. 이전 전투 영상은 실제 캡처 프레임과 원래 타임스탬프를 사용하여 입력 대기/캡처 공백이 있다. 합성 플레이 장면은 없다.

## 3. 기술 검증 결과

| 검사 | 결과/범위 |
|---|---|
| 회귀 | 최종54/54 PASS, 실패0: production5+기존CH1 21+CH3 28 |
| geometry hash | `719b681344bf0ab5dc07ae58cb4c01342ca85fde6386a01753d147a66e6ee78c`; RLE/bake 일치 |
| 청크 | 64개1026², 대표 수평/수직6이음새 bleed 픽셀 일치 |
| 실제 canMv r15 | 연결19242셀, 목표13/13, 스폰14/14 접근 |
| 실제 canMv r40 | 연결17808셀, 목표13/13, 스폰14/14 접근 |
| 실제 canMv r120 | 연결15126셀, 목표12/12, 스폰14/14. 경계 촬영점39,112는 대형 적 경로에서 제외 |
| 배치 | authored62 모두 정확한 +.5타일 runtime 좌표, 강제 재배치0, runtime63/scatter0 |
| 타 스테이지 | stage0 제외 STAGES/compose와 cloneField11(1) 전후 JSON 동일. CH3 28검사 통과 |
| 배경 | 전체 조망64청크 표시/오류0. 기본9카메라 visible 청크 모두 표시 |
| pageerror/404 | 수집609이벤트 중 관찰0. 초기 로그 유실(truncated:true)로 실행 전체0건 보증은 **미검증** |
| 기타 | 탐색 중 취소 Media net::ERR_ABORTED1건. 신규 이미지404로 분류하지 않음 |

```powershell
& 'C:\nvm4w\nodejs\node.exe' --test test/ch1ProductionFinish.test.js test/ch1StartOuterMass.test.js test/ch1StartSmoothingPass.test.js test/ch3HellWinterLayout.test.js
& 'C:\nvm4w\nodejs\node.exe' tools/verify_ch1_production_finish.mjs
```

### 성능

1920×1080 논리 카메라/DPR1.75, 위치100,151/zoom1, high·torch·fog·postfx 유지/FPS제한0, 적 없는 정지 관찰, 약5초씩 측정. 변경 전은 백업한 실제 게임을 같은 서버에서 실행했다. 작은 FPS 차이를 최적화 성과로 단정하지 않는다.

| 항목 | 변경 전 | 최종 bake finish-3 |
|---|---:|---:|
| 평균 FPS | 235.84 | 239.30 |
| 프레임 P50 | 4.2ms | 4.2ms |
| 프레임 P95 | 4.4ms | 4.4ms |
| 프레임 P99 | 8.3ms | 4.5ms |
| 시간 | 5003.4ms | 5002.1ms |

최종 CPU 분해/전투 동일 부하/저사양 GPU/NW.js는 미측정. after/performance.json의 CPU 값은 bake 정규화 전 측정으로 최종 CPU 결과가 아니다. 최종값은 after/performance-final.json이다.

## 4. 시각 검증 및 남은 한계

기본 플레이 카메라9곳과 실제 이동을 확인했다. 미니맵/축소 이미지로 판정을 대신하지 않았다.

| 지점 | 좌표 | 확인 |
|---|---|---|
| 남측 | 100.5,185.5 | 숲 어깨/흙 진입선/이동 여유 |
| 첫공터 | 100,151 | 바닥 패치 완화/열린 전투 공간 |
| 숲길 | 82,122 | 서쪽 뿌리 돌출/폭 변화/지면 연결 |
| 나무 | 102,101 | 뿌리·부식토 접합/양쪽 실제 우회 |
| 서측 경계 | 39,112 | 경관/근경 뿌리/보행 바닥 연결 |
| 북쪽 출구 접근 | 100,22 | 지면과 숲 연결/성문 반복 없음 |
| 야영지 | 45,109 | 장소와 전투 여백/남쪽 뿌리 경계 |
| 단구 | 137,112 | 기존 높이/ramp 유지/실제 왕복 |
| 물가 | 157,54 | 젖은 지면/기존 웅덩이의 장소 차이 |

남은 시각적 한계:

- 전체 조망에는 원화의 얼굴/뿌리 모티프 재사용이 보인다. 기본 카메라에서는 경계·겹침이 달라 동일 간격 울타리로 이어지지는 않지만 원화 다양성에는 한계가 있다.
- 나무 바로 밑은 이미지가 바닥을 많이 덮는다. 캐릭터/적은 기존 렌더 순서상 구조물 이후 표시된다. 나무 전체를 벽으로 만들지 않았고 양쪽 우회를 확인했다.
- 동쪽 단구는 기존 타원형 높이 음영이 읽힌다. 잠긴 단구/ramp 계약을 유지했으며 높이 시스템을 개편하지 않았다.
- 피해 무효로 적을 오래 모으면 기존 전투 효과가 많이 겹친다. 모든 적 밀도에서 위험 지면 식별이 완벽하다는 판정은 하지 않는다.
- 기존 암녹색 조명을 유지해 외곽 세부는 어둡다. 전체 조명으로 이음새를 숨기는 변경은 하지 않았다.

**VISUAL VERDICT: RETOUCH — 후속 원본 비교 검수에서 판정 정정.** 위 잔여 한계와 미검증 환경을 포함한 전면적 품질 보증은 아니다.

## 5. 미검증 항목과 제한

| 항목 | 상태/사유 |
|---|---|
| 무보정 전체 난이도 | 미검증. 긴 진행/충돌 QA에 피해 무효 사용 |
| 모든 초기 오류 로그 | 미검증. 브라우저 이벤트 일부 유실; 관찰0과 전체0 구별 |
| 모든 적/반경/AI 조합 | 미검증. 실제 전투와 r15/40/120가 전 조합 증명은 아님 |
| 패링 | 별도 검증 안 함. 이동/공격/dash와 구별 |
| 모든 해상도/하드웨어/NW.js | 미검증. 로컬 브라우저 기본 카메라 중심 |
| 연속 전투 원본 | 일부 영상은 실제 정지 프레임 샘플링. 고프레임 연속 전투 영상 아님 |
| 최종 이동 영상 | 연속252.601초, canvas만 녹화(HTML HUD/오디오 제외), 적 없는 이동 QA |

필요한 파일/서버는 사용 가능했고 구현을 막는 실행 환경 차단은 없었다. 미검증 항목을 PASS로 대체하지 않는다.

## 6. 산출물과 변경 파일

증거 루트: `captures/ch1_1_production_finish_20260916/` (로컬, 저장소 ignore 대상).

| 산출물 | 경로/성격 |
|---|---|
| 전체 배치 | runtime-full-layout.jpg + .json: 실제 renderer, zoom.3,64청크/63props. 전체 조망만 torch=false |
| 변경 전 | before_full/01_start.png부터6장: 백업 실제 게임, 동일 위치/기본 카메라 |
| 변경 후 | after/01_start.png부터9장+manifest.json: 최종finish-3 |
| 비교 | comparison/01_start.jpg … 06_north_exit.jpg: 실제 전후 화면 나란히 배치 |
| 필드/전투 | START_EXIT_COMBAT_QA.mp4, route-session.json, video-metadata.json |
| 완료/다음 구간 | BOSS_CLEAR_NEXT_STAGE_QA.mp4, boss-finish-session.json, completion.json, stage-clear.jpg, next-stage-1-2.jpg |
| 최종 입력 종주 | FINAL_MAP_INPUT_WALK.mp4/.webm, final-walk-session.json, final-walk-video.json |
| 기술 | runtime-collision-audit.json, technical-verification.json, runtime-issues.json, other-stages-before/after.json |
| 성능 | before_full/performance.json, after/performance-final.json |
| 백업 | tmp/ch1_1_production_finish_20260916/backup/game.html |

composition-preview.jpg는 오프라인 bake 미리보기다. 초기 before/는 잘린 구버전이므로 before_full/만 비교에 사용한다. runtime-full-layout.png는 전송 중 손상되어 증거에서 제외하며 유효 JPEG로 대체한다.

| 변경 파일 | 범위 |
|---|---|
| game.html | stage0 배경/geometry, 월드 변환/zoom,5prop/1spawn 보정 |
| assets/map/ch1/production_finish/layout.js | 고정 경계/8구역/RLE |
| 같은 폴더 master/chunk64/composition.json/preview | 스테이지 배경/재현 가능한 배치 |
| tools/build_ch1_production_finish.mjs | 고정 원화 합성/bake |
| tools/verify_ch1_production_finish.mjs | 충돌 snapshot/청크/배치 기술 검사 |
| tools/package_ch1_production_evidence.mjs | 실제 캡처 영상/비교 패키징 |
| test/ch1ProductionFinish.test.js | 경계/연결/격리/월드크기/가시범위5검사 |
| test/ch1StartOuterMass.test.js, ch1StartSmoothingPass.test.js | 기본 경로 기대값 현행화 |
| 관련 맵 문서11개, 본 보고서, CHANGELOG_SYNC.md | 현행 계약과 과거 기록 구별 |

docs 전체 관련 키워드 검색 기록: tmp/ch1_1_production_finish_20260916/docs-*-audit.txt. 보호 문서 `2_3 돌진+패링+방패시스템`은 수정하지 않았다.

작업 중 외부 자동 체크포인트59a89ebdb에 초기 구현 일부가 포함됐다. 이를 되돌리지 않고 현행 트리에서 마무리한다. 후속 커밋은 이번 맵의 남은 변경만 선택한다. 다른 작업의 guard baseline/userdata/Steam 변경은 포함하지 않는다. **이 작업에서 push/배포/Steam 업로드를 수행하지 않았다.**

## 7. MAP PRODUCTION REPORT (§23)

```text
STAGE: CH1-1 / stage0 / 썩은숲1구역
MASTER
- silhouette: 남→북, 좌우 비대칭53점
- regions: 남측/첫공터/뿌리길/야영지/나무분지/단구/북측갈림/출구
- main route: START→첫공터→숲길→나무양옆→북측→EXIT
- side spaces: 서남 뿌리길/야영지/단구/고치/물가
OUTER MASS
- LEFT: 안으로 들어오는 뿌리 어깨와 야영지
- RIGHT: 단구/두 물가에 맞춘 굴곡
- TOP: 기존 북쪽25타일 접근축
- SOUTH: START를 감싸는 숲 문턱
- major holes: 검토 카메라에서 미완성 외곽 없음
LARGE
- source assets: 자체CH1 숲5종/지면5종/soil
- composites: 고정56레이어/64청크
- overlap: alpha접합/RGB선명도 유지
- repeated silhouette: 기본 화면 반복 완화, 조망의 원화 모티프 재사용 남음
MEDIUM
- connections: 명명된 어깨11곳/길·뿌리·습지 전이
- remaining holes: 관찰 구간 없음
GROUND
- shadow: 기존 조명/원화 방향 유지
- contamination: 나무 부식토/물가 습지/진입 흙
- structure integration: 나무/야영지/단구/물가 연결
PLAYABLE
- main arenas: 첫공터/나무양쪽/북측갈림
- travel space: 폭 변화가 있는 중앙/서측 연결
- breathing space: 중앙 작은scatter 없음
- threat space: 기존 적/스폰/게이트 규칙
- combat readability: 실제 추격/이동/회피 확인, 과밀효과 한계 기록
LANDMARK
- primary: 거대 시체나무
- secondary: 야영지/단구/고치/물가
- tertiary: 기존 뼈/뿌리/잔해
CAMERA QA
- START: 01_start/실제 입력 시작
- EARLY: 02_first_clearing/첫전투
- ARENA: 첫공터/나무양쪽
- SIDE L: 05_west_boundary/07_west_camp
- SIDE R: 08_east_terrace/ramp 실제왕복
- LANDMARK: 04_corpse_tree/양쪽우회
- LATE: 09_north_pool/북측이동
- EXIT: 06_north_exit/필드gate/보스완료/실제exit/1-2
TECH QA
- route: 입력 종주와 별도canMv BFS
- collision: r15/40/120,14스폰,authored좌표 유지
- pageerror: 관찰0/초기전체로그 미검증
- 404: 관찰0/초기전체로그 미검증
- seam: 대표6bleed 픽셀일치/기본카메라검토
- loading: 조망64/64표시/오류0
- performance: 정지P95 4.4→4.4ms, 전투/저사양 미측정
FILES
- stage-owned: production_finish/보고서/전용tools·test
- concurrent touched: game.html/CHANGELOG의 이번 변경만 분리
- unrelated touched: 이번작업 없음, 기존dirty 보존
GIT
- staged: 이번 맵 마무리만 선택
- commit: 최종응답의 로컬커밋 참조, 초기일부는 외부체크포인트 포함
- push: 수행안함
- deploy: 수행안함
VISUAL VERDICT: RETOUCH (후속 검수 정정; CH1_1_FINAL_REVIEW_20260916.md 참조)
NEXT PASS: 장소 구분·나무 접지·외곽 반복·단구 접합의 국소 보완 필요. 일반 완주/저사양/손실 없는 전체로그 미검증.
```

## 8. 고정 데이터 전수표

최종 composition.json/layout.js 전사값이다. 레이어 개수는 품질 목표가 아니라 재현용 기록이다.

### 역할 구역

| id | 이름 | anchor | 역할 | 지면 | 연결 |
|---|---|---|---|---|---|
| south_entry | 잠식된 진입로 | 100,185 | arrival | worn-earth | 좁은 남측 문턱에서 첫 공터로 벌어짐 |
| first_clearing | 쓰러진 숲의 공터 | 100,151 | combat | dry-soil | 서쪽 뿌리 통로와 동쪽 웅덩이가 비대칭으로 열림 |
| root_bend | 뿌리 어깨 숲길 | 83,125 | travel | leaves-earth | 서쪽 숲이 안으로 돌출되고 야영지로 길이 갈라짐 |
| west_camp | 버려진 야영지 | 45,100 | side-combat | trampled-earth | 낮고 긴 뿌리 경계와 중앙 공터 연결 |
| corpse_basin | 시체나무 분지 | 102,90 | primary-landmark | root-humus | 줄기 양쪽 우회와 넓은 전투 여백 |
| east_terrace | 부패한 제단 단구 | 147,97 | optional-high-ground | wet-earth | 기존 서측 경사로 유지 |
| north_fork | 고치 숲과 썩은 물가 | 100,52 | late-combat | damp-leaf | 서쪽 고치와 동쪽 습지 사이에서 북쪽 통로로 수렴 |
| north_exit | 숲의 마지막 문턱 | 100,22 | exit-approach | exposed-soil | 기존 gate y5 / exit y7 접근 |

### 경계점 — 순서대로 연결

| 순번 | x | y |
|---|---:|---:|
| 1 | 88 | 2 |
| 2 | 88 | 18 |
| 3 | 74 | 29 |
| 4 | 58 | 34 |
| 5 | 37 | 33 |
| 6 | 29 | 44 |
| 7 | 31 | 59 |
| 8 | 40 | 66 |
| 9 | 52 | 70 |
| 10 | 53 | 77 |
| 11 | 40 | 80 |
| 12 | 26 | 91 |
| 13 | 28 | 107 |
| 14 | 40 | 114 |
| 15 | 53 | 118 |
| 16 | 62 | 126 |
| 17 | 58 | 137 |
| 18 | 40 | 140 |
| 19 | 28 | 147 |
| 20 | 30 | 157 |
| 21 | 43 | 163 |
| 22 | 58 | 167 |
| 23 | 72 | 174 |
| 24 | 81 | 183 |
| 25 | 85 | 192 |
| 26 | 96 | 197 |
| 27 | 109 | 197 |
| 28 | 120 | 190 |
| 29 | 125 | 181 |
| 30 | 137 | 168 |
| 31 | 151 | 161 |
| 32 | 169 | 156 |
| 33 | 179 | 143 |
| 34 | 178 | 134 |
| 35 | 161 | 128 |
| 36 | 143 | 127 |
| 37 | 134 | 121 |
| 38 | 139 | 113 |
| 39 | 160 | 110 |
| 40 | 175 | 105 |
| 41 | 180 | 93 |
| 42 | 172 | 84 |
| 43 | 151 | 79 |
| 44 | 145 | 72 |
| 45 | 154 | 63 |
| 46 | 174 | 59 |
| 47 | 181 | 48 |
| 48 | 177 | 35 |
| 49 | 162 | 30 |
| 50 | 142 | 33 |
| 51 | 126 | 28 |
| 52 | 113 | 18 |
| 53 | 112 | 2 |

### Bake 배치 — 경로 기준 assets/map/ch1/

opacity는 alpha feather/지면×.7 적용 전 값이다. runtime props와 다른 정적 합성 레이어다.

| 번호/층 | 파일 | x | y | scale | opacity | brightness | saturation |
|---|---|---:|---:|---:|---:|---:|---:|
| 1/GROUND | floor_objects/prop_g_battle.png | 100 | 185 | 0.95 | 0.54 | 0.78 | 0.45 |
| 2/GROUND | floor_objects/prop_g_battle.png | 97 | 171 | 1.2 | 0.58 | 0.8 | 0.4 |
| 3/GROUND | floor_objects/prop_g_battle.png | 91 | 153 | 1.3 | 0.65 | 0.8 | 0.4 |
| 4/GROUND | floor_objects/prop_g_battle.png | 112 | 154 | 1.1 | 0.55 | 0.76 | 0.42 |
| 5/GROUND | floor_objects/prop_g_edge.png | 71 | 159 | 1.2 | 0.58 | 0.66 | 0.5 |
| 6/GROUND | floor_objects/prop_g_edge.png | 131 | 163 | 1.1 | 0.5 | 0.62 | 0.5 |
| 7/GROUND | floor_objects/prop_g_root.png | 69 | 131 | 1.1 | 0.52 | 0.62 | 0.38 |
| 8/GROUND | floor_objects/prop_g_battle.png | 90 | 125 | 1.15 | 0.5 | 0.72 | 0.4 |
| 9/GROUND | floor_objects/prop_g_battle.png | 53 | 107 | 1.12 | 0.6 | 0.76 | 0.4 |
| 10/GROUND | floor_objects/prop_g_edge.png | 36 | 117 | 1 | 0.56 | 0.63 | 0.43 |
| 11/GROUND | floor_objects/prop_g_root.png | 88 | 102 | 1.2 | 0.66 | 0.64 | 0.38 |
| 12/GROUND | floor_objects/prop_g_root.png | 113 | 99 | 1.14 | 0.63 | 0.65 | 0.38 |
| 13/GROUND | floor_objects/prop_g_corpse.png | 103 | 79 | 1.15 | 0.44 | 0.65 | 0.4 |
| 14/GROUND | floor_objects/prop_g_battle.png | 81 | 88 | 0.92 | 0.57 | 0.72 | 0.4 |
| 15/GROUND | floor_objects/prop_g_battle.png | 123 | 84 | 0.95 | 0.5 | 0.72 | 0.4 |
| 16/GROUND | floor_objects/prop_g_root.png | 132 | 106 | 0.9 | 0.51 | 0.58 | 0.42 |
| 17/GROUND | floor_objects/prop_g_toxic.png | 163 | 143 | 1.15 | 0.38 | 0.64 | 0.34 |
| 18/GROUND | floor_objects/prop_g_toxic.png | 166 | 48 | 1.1 | 0.4 | 0.6 | 0.33 |
| 19/GROUND | floor_objects/prop_g_edge.png | 143 | 58 | 1.12 | 0.58 | 0.6 | 0.44 |
| 20/GROUND | floor_objects/prop_g_root.png | 53 | 58 | 1 | 0.52 | 0.62 | 0.38 |
| 21/GROUND | floor_objects/prop_g_battle.png | 96 | 54 | 1.25 | 0.56 | 0.75 | 0.4 |
| 22/GROUND | floor_objects/prop_g_battle.png | 105 | 35 | 1.13 | 0.55 | 0.77 | 0.4 |
| 23/GROUND | floor_objects/prop_g_battle.png | 100 | 18 | 0.85 | 0.5 | 0.78 | 0.4 |
| 24/FOREST | collision/bound_w.png | 21 | 30 | 1.15 | 1 | 0.53 | 0.6 |
| 25/FOREST | collision/corner_nw.png | 31 | 23 | 1.25 | 1 | 0.57 | 0.61 |
| 26/FOREST | collision/bound_n.png | 64 | 23 | 1.25 | 1 | 0.56 | 0.59 |
| 27/FOREST | collision/bound_w.png | 20 | 67 | 1.25 | 1 | 0.52 | 0.62 |
| 28/FOREST | collision/corner_nw.png | 37 | 73 | 1.2 | 1 | 0.58 | 0.63 |
| 29/FOREST | collision/bound_w.png | 13 | 109 | 1.3 | 1 | 0.5 | 0.58 |
| 30/FOREST | collision/bound_n.png | 39 | 123 | 1.24 | 1 | 0.58 | 0.58 |
| 31/FOREST | collision/corner_nw.png | 46 | 129 | 1.18 | 1 | 0.61 | 0.62 |
| 32/FOREST | collision/bound_w.png | 19 | 150 | 1.2 | 1 | 0.53 | 0.58 |
| 33/FOREST | collision/bound_n.png | 45 | 171 | 1.25 | 1 | 0.55 | 0.6 |
| 34/FOREST | collision/corner_nw.png | 70 | 184 | 1.2 | 1 | 0.57 | 0.6 |
| 35/FOREST | collision/bound_w.png | 78 | 201 | 0.9 | 1 | 0.55 | 0.58 |
| 36/FOREST | collision/bound_n.png | 148 | 22 | 1.25 | 1 | 0.5 | 0.65 |
| 37/FOREST | collision/bound_e.png | 186 | 44 | 1.2 | 1 | 0.52 | 0.64 |
| 38/FOREST | collision/corner_ne.png | 174 | 70 | 1.25 | 1 | 0.54 | 0.64 |
| 39/FOREST | collision/bound_e.png | 188 | 99 | 1.22 | 1 | 0.48 | 0.65 |
| 40/FOREST | collision/corner_ne.png | 152 | 119 | 1.15 | 1 | 0.56 | 0.61 |
| 41/FOREST | collision/bound_n.png | 180 | 120 | 1.25 | 1 | 0.5 | 0.58 |
| 42/FOREST | collision/bound_e.png | 190 | 151 | 1.25 | 1 | 0.51 | 0.62 |
| 43/FOREST | collision/corner_ne.png | 157 | 168 | 1.25 | 1 | 0.55 | 0.6 |
| 44/FOREST | collision/bound_e.png | 134 | 190 | 1.1 | 1 | 0.55 | 0.6 |
| 45/FOREST | collision/bound_n.png | 144 | 199 | 1.3 | 1 | 0.48 | 0.6 |
| 46/CONNECTION | floor_objects/prop_g_edge.png | 76 | 179 | 0.95 | 0.72 | 0.59 | 0.5 |
| 47/CONNECTION | floor_objects/prop_g_root.png | 126 | 181 | 0.9 | 0.62 | 0.59 | 0.42 |
| 48/CONNECTION | floor_objects/prop_g_edge.png | 63 | 168 | 1.1 | 0.65 | 0.61 | 0.48 |
| 49/CONNECTION | floor_objects/prop_g_edge.png | 146 | 163 | 0.95 | 0.65 | 0.59 | 0.5 |
| 50/CONNECTION | floor_objects/prop_g_root.png | 58 | 129 | 1.1 | 0.7 | 0.63 | 0.44 |
| 51/CONNECTION | floor_objects/prop_g_edge.png | 136 | 120 | 1.2 | 0.68 | 0.58 | 0.5 |
| 52/CONNECTION | floor_objects/prop_g_edge.png | 30 | 109 | 1 | 0.65 | 0.58 | 0.48 |
| 53/CONNECTION | floor_objects/prop_g_root.png | 49 | 73 | 0.9 | 0.67 | 0.59 | 0.45 |
| 54/CONNECTION | floor_objects/prop_g_edge.png | 146 | 74 | 1.05 | 0.7 | 0.58 | 0.5 |
| 55/CONNECTION | floor_objects/prop_g_edge.png | 74 | 28 | 1 | 0.64 | 0.6 | 0.5 |
| 56/CONNECTION | floor_objects/prop_g_root.png | 129 | 28 | 0.95 | 0.64 | 0.58 | 0.45 |

### 고정 지면 색 면/뿌리 좌표 계약

200타일 viewBox 기준. 아래는 런타임 생성기가 아니라 고정 bake 입력이다. 원화 RGB blur와 구별한다.

```svg
<defs><filter id="soft"><feGaussianBlur stdDeviation="1.3"/></filter></defs>
 <g filter="url(#soft)">
  <path d="M101 198 C98 187 108 180 101 169 S87 154 99 145 C106 137 96 129 87 119 S89 103 84 95 C79 83 84 75 94 67 S102 47 100 33 L100 3" fill="none" stroke="#69523a" stroke-width="12" opacity=".3"/>
  <path d="M101 174 C79 169 60 166 60 153 C62 139 88 141 102 143 C117 140 138 146 139 155 C138 168 115 174 101 174Z" fill="#69513d" opacity=".27"/>
  <path d="M75 121 C56 118 32 111 33 99 C36 89 61 90 73 103 C84 113 82 119 75 121Z" fill="#594d3a" opacity=".3"/>
  <path d="M77 109 C67 96 76 73 92 71 C118 68 135 83 130 101 C125 114 94 118 77 109Z" fill="#333c2b" opacity=".26"/>
  <path d="M122 68 C138 67 166 60 177 47 C173 34 154 35 144 43 C139 51 129 56 122 68Z" fill="#304539" opacity=".34"/>
  <path d="M138 148 C148 157 171 157 173 143 C175 128 155 131 144 139Z" fill="#344337" opacity=".35"/>
  <path d="M95 68 C78 67 55 66 41 56 C35 42 46 35 58 39 C68 48 84 45 105 39" fill="none" stroke="#514630" stroke-width="9" opacity=".23"/>
  <path d="M93 43 C98 36 99 29 100 18" fill="none" stroke="#76634b" stroke-width="16" opacity=".26"/>
 </g>
 <g fill="none" stroke-linecap="round">
  <path d="M102 90 C97 100 86 104 78 113 M102 90 C113 98 120 111 132 113 M103 90 C111 79 113 69 123 66" stroke="#232921" stroke-width="1.6" opacity=".5"/>
  <path d="M102 91 C95 101 89 104 81 112 M102 90 C112 98 122 110 131 112 M103 90 C111 79 113 69 123 66" stroke="#74634a" stroke-width=".25" opacity=".3"/>
 </g>
```

빌드 운영값: sharp concurrency2, cache memory128MB/files20/items30, PNG compressionLevel6, offline preview1600px/JPEG90. layer 기본 scale1/opacity1/brightness.62/saturation.65, 경계 밖은 crop한다.


### 2026-09-25 CH1-1 생체 디테일 마감: 중복 독액 장식

| 적용 | 현재 계약 |
|---|---|
| 본편 stage0 렌더 | `m_c1gtoxic` 월드(6740,1620), 타일(168,40)만 기존 `m_c1pool` 이미지 로드 완료(complete 및 naturalWidth>1) 시 숨긴다. `Ch1LivingDetail.hideDuplicate` 사용 |
| 보존 | authored/MAP_OBJS 좌표·개수·충돌 불변. `m_c1gtoxicf`, 다른 좌표/스테이지, bossArena/fieldRebuildQA와 기존 bake에는 적용하지 않음 |
| 폴백 | 웅덩이 이미지 또는 효과 스크립트/API 미로드 시 기존 장식을 그린다 |
| 근거 | 겹친 두 웅덩이 실루엣을 하나로 정리하는 시각 전용 마감. 세부 수치·QA는 `docs/4.1맵디자인+설정/CH1_LIVING_DETAIL_RUNTIME_20260925.md` 7차에 기록. 위 날짜별 제작 수치는 해당 시점 이력 |


### 2026-09-26 동측 독구덩이 입체 디테일

| 대상 | 현행 런타임 예외 |
|---|---|
| pit_poison | 본편 stage0의 월드(6500,5580),타일(162,139)만 Ch1LivingDetail.pit의 절차식 투명 atlas로 그린다. 크기200×scale,좌표·collision·배치개수 유지. 안쪽 벽/낮은 수면/앞턱 가림 및 국소 수축 추가 |
| 폴백·범위 | 효과 API 미로드 시 원래 pit_poison.png 렌더. 다른 위치/스테이지/bossArena/fieldRebuildQA에는 원래 그림 유지. 대형 m_c1gtoxicf 원화 보존 |
| 계약 | 상세 수치·검수: CH1_LIVING_DETAIL_RUNTIME_20260925.md 9차. 원본 이미지 파일 변경 없음 |


### 2026-09-26 생체 야영지·대왕나무 국소 움직임

| 대상 | 현재 렌더 계약 |
|---|---|
| m_c1tree / m_c1camp | Ch1LivingDetail.organic: tree는15차에서 좌우뿌리2축의 붙은 밑동을 고정하고 끝을 들었다 내리는 굽힘으로 교체. camp는13차에서 수평출렁임을 제거하고 화로의 시체 손3개만 손목/손가락 관절로 굽혔다 펴는 동작으로 교체. 팔/가시/상자/돌 고정. stage0,bossArena/fieldRebuildQA제외;이미지로드실패/meta.srcRect존재/API없음이면기존sprite폴백 |
| m_c1cocoon / m_c1spod | 기존이미지알파를이용한바닥투영그림자+밑동접촉그림자,밑동고정호흡.다른stage/평면pool제외 |
| 보존·성능 | 좌표/크기/pivot/충돌/원본파일불변.동적canvas _glVer 및기존GPU텍스처재사용.추가캐시19.109310150146484MiB(native,기존나무그림자/GPU복제별도).상세공식·검수는CH1_LIVING_DETAIL_RUNTIME_20260925.md 13차 14차: 손가락별 접힘 지연·연속 관절 연결·투명셀 베이크 생략. 손14차/뿌리15차/매달린물체17차 계약 참조. 16차 고치3개·왼쪽시체1개에 이어17차 오른쪽시체1개 추가: 고치3개·시체2개, 고정 매듭 중심 진자 회전. 18차 원본 하단28% 알파 기반 접촉 그림자 추가(512×192,0.375MiB). 현행 수치·검증은 CH1_LIVING_DETAIL_RUNTIME_20260925.md 18차 참조. |


### 2026-09-27 동측 독구덩이 경계 보강21차

| id / 적용 위치 | 현재 렌더 계약 | 보존 |
|---|---|---|
| m_c1gtoxicf / (6500,5460) | stage0 production에서 groundSprite로 보라색 경계64px 이내만 색 보정, 21차 당시18px 알파 전이(현행25차는 명도에 따라24~56px). 정적881×900 canvas 캐시1장. [공식·폴백·QA·메모리](CH1_LIVING_DETAIL_RUNTIME_20260925.md)의21차/25차 참조 | prop_g_toxic.png·기존 bake·좌표·크기·반전·충돌·pit_poison 동작 유지. 과거의 m_c1gtoxicf 미적용 문구는 당시 효과 범위이며, 이번 경계 보정과 구분 |


## 2026-09-27 독구덩이 재질 연결22차

| 대상 | 현행 구현 | 보존·한계 |
|---|---|---|
| pit_poison / (6500,5580) | stage0 production의 기존16프레임 atlas에 prop_g_toxic.png의 벽·독액을 국소 샘플링. 이미지 미로드 시 기존 절차식 폴백, 로드 후 atlas 갱신. [런타임22차](CH1_LIVING_DETAIL_RUNTIME_20260925.md)의 crop/명암/QA 계약 참조 | 위치·크기200×scale·collision·수축·유입2개 유지. 원본 PNG 보존. 기존 절차식 atlas 설명은 최초 구현 이력이며 현재 재질은22차가 우선. 전체 원화/지면 통합은 RETOUCH |


### 2026-09-27 촉수 포복23차

| 대상 | 현행 움직임 | 보존 |
|---|---|---|
| Ch1LivingDetail dry 지면 촉수 | [런타임23차](CH1_LIVING_DETAIL_RUNTIME_20260925.md): 밑동 고정,끝이 먼저 뻗고 몸통이 지연되어 따라 당겨짐. 끝점 고정은10차 이력이며 dry 현행 동작은23차가 우선 | 기존 월드 앵커·collision·동선·atlas 크기·16프레임 유지. wet 독액 촉수는 기존 동작 |


### 2026-09-27 독구덩이 앞턱26차

| 대상 | 현행 변경 | 보존 |
|---|---|---|
| pit_poison(6500,5580) | material 로드시 앞턱을 벽과같은불규칙반경·dash[13,7,5,11]접촉선으로 연결. 접촉alpha.42/2px·강조.12/1px. [런타임26차](CH1_LIVING_DETAIL_RUNTIME_20260925.md)참조 | 미로드폴백RGBA동일,원본·수면·동작·collision보존 |


### 2026-09-27 큰 늪 수면27차

| 대상 | 현행 동작 | 보존·자원 |
|---|---|---|
| m_c1gtoxicf(6500,5460) | Ch1LivingDetail.swamp가 큰원화의수면4곳에흐름·기포8개를직접합성.6400ms/16프레임. 26차까지는큰원화정적/작은pit만동적이었다. [런타임27차](CH1_LIVING_DETAIL_RUNTIME_20260925.md)의polygon·공식·QA참조 | 바위·외곽·원본PNG·충돌유지. 기존정적경계캐시와별도로1760×1800RGBA atlas12.0849609375MiB추가. 벽분리변형아님 |


### 2026-09-27 늪 버블·가스28차

| 대상 | 현행 동작 | 보존 |
|---|---|---|
| 큰늪 m_c1gtoxicf(6500,5460) | 버블8개 팽창→주기60%에서파열→잔물결·물방울6개→같은자리탁한가스3lobes상승.6400ms/16프레임. [런타임28차](CH1_LIVING_DETAIL_RUNTIME_20260925.md)공식·QA참조 | 원본·바위형태·충돌보존. 가스는물마스크밖으로상승하며캐릭터뒤렌더. 기존atlas재사용,추가상주캐시0/피해0 |


### 2026-09-27 버블 가독성29차

| 대상 | 현행 교정 | 보존 |
|---|---|---|
| 큰늪 버블8개 | 최대반경8→16native px,볼록한황록돔·광택·접촉그림자. 주기46~60%/896ms최대팽창유지,60%에서파열. 파열시작반경16/8. [런타임29차](CH1_LIVING_DETAIL_RUNTIME_20260925.md)공식·검수참조 | 가스·수면흐름·좌표·충돌유지,기존atlas재사용 |


### 2026-09-27 버블 파열 가독성30차

27~29차의 버블16프레임·물방울6개·추가캐시0은 당시 이력. 현행 버블은 아래 값으로 대체하며 물·가스16프레임은 유지한다.

| 대상 | 현행 | 자원·경계 |
|---|---|---|
| 큰늪 m_c1gtoxicf(6500,5460),8vent | 6400ms/64프레임(자세간격100ms),직전눌림384ms·균열192ms→막8갈래 파열384ms·물방울8개768ms·잔물결1152ms. [런타임30차](CH1_LIVING_DETAIL_RUNTIME_20260925.md) 전체공식·검수 참조 | 버블768×768/2.25MiB추가,최대19drawImage. 수면·가스16프레임/400ms,원본·collision·공간구성 유지. 모듈20260927-30 |


### 2026-09-27 늪 접지31차

| 대상 | 현행 접지 | 보존·비용 |
|---|---|---|
| m_c1gtoxicf(6500,5460) | 원화alpha>80 윤곽에서외측28native px까지감쇠하는정적젖은흙. 원본아래합성,원형테두리미사용. [런타임31차](CH1_LIVING_DETAIL_RUNTIME_20260925.md) 공식·검수참조 | 30차버블/가스/수면/충돌보존.512²RGBA 1MiB추가,swamp최대20drawImage.30차19회기록은이력.모듈20260927-31 |


### 2026-09-27 동측 생체 지면 연결32차

| 대상 | 현행 | 보존·비용 |
|---|---|---|
| SIDE_R 중심(6060,5460),variant1 | 1440×800 지면전이(20차1200×800대체),서쪽회갈색조직→동쪽녹갈색오염. 얕은연결주름3줄/늪쪽마스크lobe추가. [런타임32차](CH1_LIVING_DETAIL_RUNTIME_20260925.md)정확한색·곡선·마스크·QA참조 | 기존768×512캐시재사용/추가메모리0·draw0. 30차버블/31차접지/충돌·공간보존. 모듈20260927-32 |


### 2026-09-27 야영지 접지33차

| 대상 | 현행 | 보존·비용 |
|---|---|---|
| m_c1camp(1820,4020) | 원본하부알파윤곽을따라외측22native px까지감쇠하는정적재·그을음. 상부천막제외,body아래합성. [런타임33차](CH1_LIVING_DETAIL_RUNTIME_20260925.md)공식·검수참조 | 손3개·화로·상자·원본·충돌유지.512×400RGBA/0.78125MiB추가,대상camp1drawImage추가.모듈20260927-33 |


### 2026-09-27 야영지 전면 재질34차

| 대상 | 현행 | 보존·비용 |
|---|---|---|
| CAMP_FRONT 중심(1860,4300),960×640 | 재색흙→괴사피부의정적전이와얕은연결주름3줄. regionalSkin variant3,기존33차접지에서앞쪽빈바닥으로연결. [런타임34차](CH1_LIVING_DETAIL_RUNTIME_20260925.md)전체규격·QA참조 | 768×512RGBA/1.5MiB추가,보일때1drawImage. 지역캐시4장/6MiB. 기존손동작·늪·충돌보존.모듈20260927-34 |


### 2026-09-27 야영지 잔해 접지35차

| 대상 | 현행 | 보존·비용 |
|---|---|---|
| m_c1sbone(1940,4340)/m_sword_pile(1580,4180)/m_wpile(2060,4220) | 원본하부alpha윤곽에서외측12native px감쇠접촉그림자. 상부해골장대제외. [런타임35차](CH1_LIVING_DETAIL_RUNTIME_20260925.md)정렬·공식·QA참조 | 원본·손동작·34차지면·충돌유지.256²RGBA×최대3=.75MiB추가,보이는대상당1drawImage. 모듈20260927-35 |


### 2026-09-27 묘비·뿌리 접지36차

| 대상 | 현행 | 보존·비용 |
|---|---|---|
| m_tomb(1460,3900)/m_root(1980,3940) | 묘비밑동만/평면뿌리전체밑면의alpha윤곽접지. 별도모드캐시. [런타임36차](CH1_LIVING_DETAIL_RUNTIME_20260925.md)공식·규격·QA참조 | 원본·충돌·손동작보존.256²RGBA×2=.5MiB추가,35차대상포함5곳. 묘비/뿌리원화와주변스타일차이잔여.모듈20260927-36 |

## 65차 본편 경로 확인

본편경로route교체0,14카메라·임시24적전투,pageerror0/HTTP오류0/G.map동일true,visibleIds=drawnIds.요청48청크모두20260928-skin-65.지형·HTML회귀6PASS/0FAIL.master SHA256 2bfd8c4b9265d3d50ed10a583dd8fbe5cd65051880af93e4aa52dd7bff4813b8,30청크master crop픽셀동일/월드끝bleed복제확인.전체VISUAL VERDICT: RETOUCH.

65차코드·docs Git 체크포인트는실행기PowerShell프로세스생성오류(-1073283067)로미완료다.본편로컬파일반영/14카메라검수와구별하며외부push/deploy없음.소유80경로SHA256백업과공유main cache1줄patch는tmp/ch1-checkpoint65-owned.zip에보존.100미만변경수목표는미달이며실제에셋을숨기거나삭제하지않았다.

## Git 체크포인트 상태

Git쓰기승인후체크포인트실행을시도했으나승격실행기의WindowsApps pwsh프로세스생성317/-1073283067로시작되지않음.커밋/추가staging없음;자동승인리뷰거절아님.맵소유95파일+공유game맵분기2개·CHANGELOG맵이력은독립자료로보존.타작업staging2개유지;최종변경수는별도상태기록.코드+docs커밋필수단계미완료.
