> 2026-10-21 MAP11-16 제품 아트 현행: [승인 Seedream 바닥·외곽 나무 적용](MAP11_NEW_MAP_LOGIC_PLAN_20261021.md). 아래 MAP11-15 및 이전 텍스처/성능 수치는 당시 이력이며 독립 프리뷰는 유지한다.

> 2026-10-21 MAP11-15 제품 현행: [보스룸 경계·맵 렌더 비용 보고](MAP11_FINISH_PERFORMANCE_20261021.md). R1700 충돌/Marker는 유지하고 제품 전용 뿌리·후경 숲·바닥 감쇠, 화면 밖 cull, 정적 바닥 필터 베이크, 정적 FBM 안개 캐시을 적용했다. 아래 이전 차수 수치·프리뷰는 당시 이력이며, 최신 실창 걷기 측정과 시각 판정은 연결 문서를 따른다.

> 2026-10-21 MAP11-14 현행 보충: [랜드마크·관문·제품 접합 보고](MAP11_LANDMARK_GATE_20261021.md). Main 필드는 G3/G4 RGBA로 교체, 제품zoom.70/offset(0,-180), 실제player 가림/짧은fade 연결. arena의 곡선 이중선 균열은 불규칙RGBA15fragment로 대체했다. 아래 원 검수 수치/프리뷰 상태는 해당 차수 이력이며 전체 자연전투·시각 승인 주장이 아니다.

# MAP11-01 — 1-1 보스룸 독립 blockout / 검수 보고

> 2026-10-21 2차 현행: 사용자 D05 원형 유지·조금 작게. R1700/material proof/입장 zoom .65의 [MAP11-01b 보고서](MAP11_ARENA_PREVIEW_PASS2_20261021.md)를 따른다. 아래 R2200·D05 미결정은 1차 이력이다.

STATUS=REVIEW_PENDING. **VISUAL VERDICT: RETOUCH — 블록아웃 제출, 맥북총괄 눈 검수 및 사용자 D05(형태·크기) 미결정.** main `8dbbf2b0e699c36a93ca5cf41a2f3408be6da2c4`에서 작업했다. [확정 설계서 b085407d](https://github.com/beearth/the-exoduser/blob/b085407d474605141d3c039330489ad414efdfde/docs/4.1맵디자인+설정/MAP11_NEW_MAP_LOGIC_PLAN_20261021.md)의 §1/MAP11-01/D01~04를 읽고 적용했으며, 해당 브랜치나 다른 담당 WIP를 merge하지 않았다. WORK_BOARD의 MAP-LOOK(PC Claude)·MAPLOOK 모듈(PC Codex) 파일 수정0, 독립 preview 경로 중복0.

| 산출·계약 | 구현·원본 근거·경계 |
|---|---|
| 독립 씬 | `godot/scenes/maps/map11/arena_preview.tscn` + `scripts/maps/map11/arena_preview.gd`. project main_scene/Main/World/Player/State/저장 변경0. 무기둥 원형 근사 R2200·직경4400, StaticBody2D/256 segment rim, 내부 물리 장애물0·반경1800 회피 고리 표시. WASD는 독립 CharacterBody2D 이동이며 제품 Player/전투 writer 아님 |
| 안정 Marker·문 | Entry(0,1450), Boss(0,0), Exit(0,−1920), Return(0,1740). 새 저작 좌표이며 웹 배치 복제0. 남/북 bone_arch는 표시용 문틀·물리 pillar 아님. `clear` 보드는 boss 그림을 숨기는 디자인 시점으로 보상/clear/demoEnd를 집행하지 않음. 실제 gate/등장 시계·DEMO11-37/38은 별도 통합 |
| 기존 룩 재사용 | 실제 `native_map_look.gd` 인스턴스의 `_make_light/_light_row/_style_props/_mount_prop_shadows/_mount_occluders`와 원 `_process`, 원 lit/silhouette shader를 사용. preview host·props/빈 chunks view·player를 명시 binding하고 G/State는 바인딩0. 51개 prop/shadow/occluder, 광원8(환경7+player1, shadow2). 기존 sway 목록/밑동 고정·TIME shader와 flicker/pulse 재사용. 내부 helper 의존은 이 preview 전용이며 제품용 public provider ABI 인수는 다음 단위 |
| 기존 RGBA·단색 재질 | 실재 나무8종(01~07/11) 24개 + 시체나무12·고치12·제단1·아치2. 부패조직/동맥/눈/고치를 강하게 드러내는 D02, 낮은 평면 전투 바닥·낮은 대비 동맥/부분광. 기존 나무/소품 원본 수정0. 보스 idle atlas만 동일 byte로 새 소유 폴더에 복사(3,668,669 bytes/SHA256 `ceb3843fc1d612601b63dcb33035298da9b92d4ae39e88d986805ec4216e1549`), 생성/리터치/MagicLight 지출0. 바닥은 단색 blockout이며 최종 피부 재질 완성 아님 |
| 보스·플레이어 몸체 | G10802–10804·10956–10965 기존 1656×1240/4×2 idle atlas cell0, r44·height620.4/원 aspect로 표시. AI·보스 animation state 소비0. player는 main player.gd 기본 r15/visual_scale2.5의 기존 east RGBA 한 cell, 실제 제품 스탯을 실행한 것으로 집계0 |
| BC01~10 공간 표시 | BC01 실제 `moves_for_stage(0)` 최종23종을 receipt로 재사용, teleStrike/tailSwipe/cageTrap 제외. G41074–41183 slash359/sweep459(Pr15 포함)·slam phase4 R1320, G40664–40708 charge50×35=1750 요청/점프impact300, G40942–40977 phase4 multiDash10회, G40837–40867 grab259/G41047–41072 burrow164를 legend/참고 envelope에 명시. 각도·활성구간·이동/피격·벽 응답은 실행하지 않는 설계 overlay, 원 공격 수치 변경0 |
| 탄막·장판 공간 | G40646–40662 si0 phase4 fan16 요청 lane·폭.94π/black i%4==1, G37080–37126 rhythm9/66native tick·ORB3/±.14/r26. 그려진 lane 길이/점은 공간 표시용, 실제 탄 수명·속도/후처리를 대체하지 않음. 기존 Q/E/분류 writer 수정0. G37949–37963 tide1750, G37931–37948 source metric max(128,108)×40×.45=2304 / blast691.2를 보존; 나머지 정상23기술 실행은 BC/DEMO 기존 담당 의존 |
| 공간 결과·D05 | 중심 slam 여유880, tide 여유450. fissure 끝은 rim 밖104, 끝 폭발 envelope는 **최대795.2 바깥**. 이 값을 숨기거나 공격 길이를 축소0. 원형근사 collider와 표시용 원/부채 envelope는 서로 구분한다. off-center/여러 공격 중첩·실제 자연 boss전까지 공간 적합을 확정한 결과 아님. D05가 형태·크기를 판단하고 실제 consumer와 후속 검수 |
| 카메라·캡처 | 실제 macOS GPU viewport 1920×1080. entry/close/wall/clear + body/bullets 6원본·각1x 크롭(12 PNG), JSON에 crop xywh/zoom/tick 기록. image.get_region만 사용·확대/색수정/AI 합성0. 보스 전체 bbox를 가리지 않도록 header 축소·별도 줌/프레이밍. 제품 boss camera/포인터 writer 변경0 |

캡처 원본: `~/exoduser-wt/_out/map11-01/captures/01_entry.png`, `02_close.png`, `03_wall.png`, `04_clear.png`, `05_body.png`, `06_bullets.png`. 같은 이름의 `_1x.png`가 원픽셀 크롭이다. `BOARD.html`에서 원본/크롭을 열 수 있다. 파일 hash·치수·crop 위치는 `capture-manifest.json`에 남겼다. 독립 실행은 Godot `--path godot res://scenes/maps/map11/arena_preview.tscn`; 숫자1~6 보드 전환/WASD 이동. 새 격리명은 `EXODUSER-map11-01-Isolated-20261021`이다.

| 검사·측정 | 실제 결과·한계 |
|---|---|
| 신규 관련 검사 1회 | `test_map11_arena_preview.gd` **34/0**, exit0·ERROR0·WARNING0. 실제 물리 shape query로 rim 접촉/회피 고리/중앙 무기둥 확인, 네 Marker 합법·23무브/제외항목·source art hash·shared look·각 board 위치·제품 main 경로 불변 확인 |
| MAP-LOOK 회귀 | 첫 실행16/0이지만 ERROR4: sparse에서 빠진 기존 `godot/img/map_dragon_{3d,skeleton}.png`. 필요한 두 경로/import만 보충하고 **실패한 회귀만** 재실행: **16/0·ERROR0·WARNING1**. 경고는 이 회귀가 그대로 실행한 미수정 `main.gd:238` Camera2D physics interpolation 경고. 원문 보존, 별도 baseline 재실행이나 공용 수정0. 신규 통과 스위트 재실행0 |
| 최종 캡처 | `capture-final`: exit0·ERROR0·WARNING0, 실제 display=macOS/renderer=gl_compatibility. 최초 캡처의 미실재 나무08/09/10/12 참조 오류를 실재8종으로 수정, 첫 오류본 `rejected-first/`와 중간 검토본 `review-02/`를 보존. 최종 원본은 captures 루트의6개만 |
| 고정 물리 벤치 **1회** | Apple M5 Pro/24GB, Godot4.7.2, 내부1920×1080·Vsync OFF/uncapped. 120tick warm→**600tick @60Hz**, 벽시계 **9.999128s**, render7691frame/**평균769.17fps**, 프레임 p95≤1.46ms/p99≤1.54ms(0.01ms histogram 상한 bin), 평균 draw53.28. preview 이동 driver 평균4.38µs/max는 원JSON. render throughput은 모니터 refresh와 구별 |
| 120fps 예산 해석 | D04 고사양1080p120fps/8.33ms 목표·60fps 하한. 맵 추가CPU1.25ms/환경GPU3ms 설계 예산 기록. **측정 범위는 이 독립 preview의 물리 body/룩 렌더**, AI/탄registry/피격/실제밀집전투/제품전환 없음. driver 시간은 map 전체 CPU 증분 아님; GPU 개별 timer 없음. 이 측정으로 전체 데모/PC120fps·GPU3ms 달성을 주장0 |
| 틱 API·실행 규칙 | 물리 callback에서 현재 scalar sin/cos 위치만 계산, fixed counters/프레임 histogram을 유지. **틱 경로 목록 생성/반환 API·per-tick path append0**. 정적 원형 mesh/line 목록은 초기 저작 geometry로 별도. 매Godot 전 pgrep2이상30초대기, 각 override 설정/종료 후0byte. 기존 회귀는 원파일 USERDIR 사용 |

MAP PRODUCTION REPORT: STAGE=CH1-1 bossroom preview. MASTER=R2200/남entry·북exit·중앙boss/회피고리, 게임 region 미연결. OUTER MASS=좌우·북·남 기존 생체 RGBA ring, LARGE/MEDIUM=기존8종 실루엣/시체나무/고치·별도 아치, GROUND=단색/낮은 동맥·접지 그림자, PLAYABLE=무기둥/독립 물리 이동, LANDMARK=보스 실루엣과 북 제단. CAMERA QA=4시점+body/탄막/1x 직접 확인, 보스 bbox/문틀 확인; wall에서는 가지와 작은 플레이어의 대비가 낮은 부분이 남아 실제 전투 가독성 최종 검수 필요. 완성 피부 재질/전체 나무 반복·원형 rim 접합은 이후 아트 pass. TECH QA=위 수치, 로딩/최종캡처ERROR0·최종 seam/게임flow/제품성능 미검수. FILES=새 preview/test/asset사본·이 문서·CHANGELOG만. 공용/다른담당/저장 변경0. GIT=자기branch push/remote SHA 확인·DONE 후자기WT제거, deploy0. **VISUAL VERDICT=RETOUCH/D05_PENDING**, 기술 단정 PASS를 사용자 시각 PASS로 승격0. NEXT=맥북총괄 캡처 눈 검수→사용자D05, 실제 provider/전투/DEMO11-37/38은 별도 승인 단위.

원로그는 `~/exoduser-wt/_out/map11-01/`에 보존한다. 정상 pre-commit 훅/지정 staging·원격SHA·최종 보호 감사 및 제거 결과는 DONE.txt에 기록한다.
