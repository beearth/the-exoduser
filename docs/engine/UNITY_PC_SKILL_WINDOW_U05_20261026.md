# Unity 스킬 창 웹 이식 (PC-U05, A12, 2026-10-26)

기준 웹: `skill-forge.js`(658줄)·`skill-forge.css`·`skill-forge-3d.js`(원판), `#skillPanel .skill-pbox`, 계산 스타일 덤프 `_out/pc-u05/web_skill_3d_layout.json`.
브랜치 `claude/unity-pc-inventory-u04-20261026`, 베이스 `d18ac69ab`. 커밋은 맥북 총괄이 한다.

## 1. 원칙: 정의는 웹에서, 상태는 Unity에서

웹에서 뽑은 데이터는 이름·설명·아이콘·슬롯별 "넣을 수 있는 스킬" 목록·배치 같은 **정의**로만 쓴다. 상태(장착 스킬, 레벨, SP, 악의, 플레이어 LV)는 Unity 실제 값에서 읽고, Unity에 없는 상태는 "미이식"으로 그린다. 웹 시작 스냅샷(슬롯마다 스킬이 장착된 모습)은 쓰지 않는다.

추출 방법(`Tools/skill-ui/web-capture/cap_defs.cjs`): 웹 런타임을 띄워 **상태를 Unity와 같게 만든 뒤**(기검참 Lv1만 습득·LMB 장착, 나머지 12개 슬롯 비움) 13개 슬롯을 하나씩 선택하며 DOM(구슬 위치·이름·모체 표시·안내 문구 위치)을 덤프하고 3D 장면을 캡처한다. 그래서 정의 목록과 배치는 웹 알고리즘(`orbSlots`)이 계산한 값이고, 장착 정보만 Unity 상태와 일치한다.

| 파일 | 내용 |
|---|---|
| `Resources/Data/skill_defs_web.json` | 13개 슬롯(키·원판·라벨 위치·구슬 목록과 좌표·안내 문구 위치), 48개 스킬 정의(id·이름·설명·모체 여부·아이콘 파일명). 출처 웹 HEAD `1770c2698`, 추출 시각 기록 |
| `Resources/Art/ui/skill/window_base.png` | 웹 3D 장면을 정지 이미지로 캡처한 창 바탕(프레임, 투구, 제목판, 문양, 패널 상자, 3D 원판 13개와 제단 — 동적 DOM·탭바·버튼은 숨김, 슬롯 전부 빔) |
| `.../disc_empty_sel.png`, `disc_lmb.png`, `disc_lmb_sel.png`, `disc_empty.png`, `altar_lmb.png`, `altar_none.png` | 선택 테 원판, 기검참 장착 원판, 기검참이 든 핵을 가진 제단 장면(캡처 조각, 원판 조각은 가장자리 페더) |
| `Resources/Art/ui/skill_icons/orb/<id>.png`, `<id>_dim.png` | 구슬 아이콘 48종 x 2. 웹 원본(`img/skillskin_upscaled`)을 CSS와 같게(cover, scale 1.18, 원형 클립, 흐린 구슬은 grayscale .85 brightness .6 contrast .92) 구운 118px 파생 |
| `Tools/skill-ui/web-capture/{cap_defs.cjs,cap_desc_lines.cjs,build_assets.py}` | 웹 상태 미러 캡처, 설명문 줄바꿈 캡처, 자산 생성 스크립트(입력은 웹 캡처와 웹 아이콘뿐, 생성 이미지 0) |

아이콘을 원본 바이트로 복사하지 않은 이유: 웹은 CSS로 원형 잘라내기를 하는데 IMGUI에는 원형 마스크가 없어 구워야 하고, 원본 48장은 합 30MB다(기검참 원본 `skill_icons/kiSlash.png`는 기존 그대로).

## 2. 화면 (1920x1080 설계 공간)

| 영역 | 구현 |
|---|---|
| 창, 탭바 | 바탕 이미지 + `NativePanelTabBar`(A07 호출 유지) |
| 키 슬롯 13개 | 3D 원판 조각(선택 테, 기검참 장착), 키 글자(Cinzel 11px ls .08em 금색), 이름(Nanum 11px). 이름은 LMB 기검참만, 나머지 12개는 "미이식" |
| 왼쪽 정보판 | 기검참(또는 선택한 구슬 스킬): 아이콘 원, 이름, `Lv n / 20`(n = Unity `KiSlashLevel`), 설명(웹 Chrome이 만든 줄바꿈을 스킬별로 캡처해 `lines`로 저장·그대로 사용, 줄 높이 21.45), `강화 미이식`, 버튼 3개(웹 모양), `SP 미이식 · 악의 1,000 · LV n`(악의 = `Simulation.Materials`, 천 단위 구분 웹 동일; LV = 플레이어 레벨). 스킬이 없는 슬롯은 "미이식" |
| 가운데 | 선택 스킬명 제목(왼쪽 붉은 선, LMB 외는 "미이식"), 오른쪽 "넣을 수 있는 스킬 [KEY]" + 안내문, 제단 원판 정지 이미지(기검참 장착 + LMB 선택일 때만 핵에 기검참), 구슬(슬롯별 목록·좌표·모체 명패, 기검참 구슬만 `Lv n`), 아래 안내 상자(LMB는 "이 스킬은 합성 계열이 없습니다", 나머지 "미이식") |
| 오른쪽 | "합성 로드맵" + 안내(LMB만 문구, 나머지 "미이식") |
| 아래 버튼 | 닫기 [ESC] / 일괄 레벨업 / 추천 자동(웹 플레이트 모양), 창 프레임 하단 띠가 버튼 위를 덮음(웹과 같음) |

동작: 슬롯 클릭과 ←/→/Home/End/1~4 키로 선택, Enter(LMB 슬롯)와 "이 슬롯에 장착 [LMB]" 버튼(LMB 선택·기검참 미장착일 때)으로 `SkillUiState.TryEquipKiSlash`(기존 판정 그대로), 구슬 클릭으로 그 스킬 정보 표시(정의 + 미이식), 닫기 [ESC] / K는 기존 콜백. 시작 슬롯 인자 `--unity-skill-slot <0~12>`(캡처용, NativeGame 수정 없음).

## 3. 상태값 처리 표 (웹 값 -> Unity)

| 항목 | 웹 시작 화면 | Unity | 근거 |
|---|---|---|---|
| 슬롯별 장착 스킬(이름·아이콘) | 가시덫, 회복의 영역, 기검참, 불꽃칼날, 사슬, 악의구, 보호막, 얼음보주, 지옥강타 1 | LMB 기검참만. 나머지 12개 "미이식", 아이콘 없는 빈 원판 | Unity에 장착 정보 없음 |
| LMB 기검참 Lv | Lv 1 | `Simulation.Config.KiSlashLevel` | 상태 |
| 레벨 상한 `/ 20` | / 20 | 20 유지 | 웹 스킬 정의(최대 레벨) |
| "강화 SP 1" + "Lv50 도달 시 해금" | 표시 | "강화 미이식" | 레벨·SP에 따라 정해지는 값(상태) |
| 강화 +/−/리셋 | 웹 시작 모양 | 같은 모양, 동작 없음(미이식) | 명세 4절 |
| SP | SP 0 | "SP 미이식" | Unity에 SP 없음 |
| 악의 | 1,000 | `Simulation.Materials` | 상태 |
| LV | LV 1 | `Simulation.Player.Level` | 상태 |
| 선택 슬롯 제목, 핵 이름, 안내 | 슬롯 스킬명 / "슬롯이 비어 있습니다" 등 | LMB 기검참 외 "미이식" | 상태 |
| 합성 로드맵 | 이 스킬은 합성 계열이 없습니다(모든 슬롯) | LMB(기검참)만 문구, 나머지 "미이식" | 문구는 기검참 정의, 슬롯 스킬은 상태 |
| 구슬 목록과 좌표 | 시작 상태 기준 목록 | Unity 상태 미러에서 웹이 계산한 목록(정의) | 정의 |
| 구슬 `Lv` 글자 | 습득한 스킬만 | 기검참만 | 습득 상태 = Unity |
| 구슬 흐림(dim) | 웹 습득 상태 | 웹 규칙을 Unity 상태 미러에 적용한 결과 | 웹 규칙 |
| 모체 명패 | 표시 | 정의(웹 `isHost`)대로 표시 | 정의 |
| "넣을 수 있는 스킬 [KEY]" 제목·부제 | 표시 | 그대로 | 정의 문구 |

## 4. 미이식

| 항목 |
|---|
| 강화 +/−/리셋, 일괄 레벨업, 추천 자동(웹 모양만, 눌러도 동작 없음) |
| 제단 드래그·넣기·합성·분해, 구슬 드래그 장착, 구슬 호버/전류선(전류 효과) |
| 원판 회전·발광·블룸 동적 변화(정지 이미지) |
| 12개 슬롯의 스킬 자체(장착·습득·레벨·SP), 합성 로드맵 내용 |
| 대장간·능력치 창으로 전환(탭바는 그려짐) |

## 5. 검사

| 검사 | 결과 |
|---|---|
| `Tools/skill-ui` | 342 passed(기존 34 + 정의 JSON·자산·설명 줄바꿈 검사 308, 기존 검사 변경 없음). SDK 고정 때문에 `Tools/inventory-oracle`에서 빌드 후 skill-ui 폴더에서 실행 |
| inventory-navigation | 34/34 |
| inventory-oracle (`u05-01`) | 892 checks / 0 failures |
| Win64 빌드 | receipt passed:true, errors 0 |
| 스킬 스모크 | SPACE 선택(`--unity-skill-slot 12`) 6/6 PASS. LMB 기본 실행은 5/6 — `close restores play with click release fence` 1건 실패(최종 빌드 2회). 창 포커스 영향: `OnApplicationFocus(false)`가 `Running=false`를 만들고 스모크가 그 값을 읽음(NOACTIVATE로 옮긴 창에서 포커스가 흔들림). 이 검사는 같은 브랜치 이전 빌드(U08 스킬 스모크, 이 작업의 첫 빌드)에서는 PASS였고 NativeSkills 그리기와 무관한 NativeGame 상태 검사라 코드 수정 없이 보고 |

## 6. 남은 차이

| 번호 | 차이 |
|---|---|
| S-1 | 작은 글자는 웹이 약간 더 진함(Chrome 렌더링 vs IMGUI) |
| S-2 | 구슬 부유 애니메이션 없음(기준 위치에 고정), 구슬 외곽 광 근사 |
| S-3 | 슬롯 선택 원판은 웹 3D 장면 캡처 조각 + 페더, 원판 안 아이콘은 LMB 외 없음(상태) |
| S-4 | 웹 시작 화면과 달리 12개 슬롯이 비어 있어 위쪽 줄이 전체적으로 어두움(의도) |

## 맥북 총괄 검수 (2026-10-26)

- 판정: 인수. 제단 원판·구슬·정보판·로드맵·하단 버튼 배치가 웹과 같다(`docs/engine/unity_pc_win_refs/skill_u05_lmb.jpg`). 비어 있는 12칸 "미이식"은 정의/상태 원칙에 따른 의도된 차이. 원판 룬 각도 차이는 웹 원판 회전 때문.
- 구슬 흐림: 웹 `canEquip` 규칙(기본 스킬은 미습득이어도 장착 가능)을 Unity 상태에 적용한 결과로 인정한다(규칙=정의).
- LMB 스모크 `close restores play with click release fence` 실패 원인: U05 코드 문제가 아니다. `SkillSmoke`가 해상도 변경 뒤 0.4초 기다리는 사이 창 포커스를 잃으면 `SetGameFocus(false)`(`NativeGame.PauseFocus.cs`)가 열린 창이 없는 상태라 `menu=true`를 남기고, 스모크가 `Running=true`로 되돌려도 `menu`가 남아 `SetSkills(false)`의 `Running=…&&!menu`가 false가 된다. 같은 빌드의 SPACE 실행은 6/6 통과. NativeSkills는 `Running`/`menu`를 건드리지 않는다.
- 조치: 스킬 스모크를 `pauseSmoke`처럼 OS 포커스와 무관하게 만드는 Codex용 patch `docs/engine/unity_patches/U05_nativegame_skill_smoke_focus.patch`(`git apply --check` 통과). 적용 전까지 이 검사는 실행 창 포커스에 따라 흔들린다.

2026-10-30 PC 현행 시각 자산·은빛 팔레트·Linear 글자 보정은 [Unity UI 원화 반영](UNITY_UI_ASSETS_20261030.md)을 따른다. 기능·저장·미이식 범위와 위 검수 이력은 유지하며, 현재 원화의 실제 Player 결과는 해당 문서의 정확 후보 영수증으로 구분한다.

## 2026-11-02 빈 Z·Space 잠김 안내 정합 후보

| 항목 | 현행 후보·원본 |
|---|---|
| 원본 | origin/main f4967bc62의 skill-forge.js slotPreview/slotCondition, SKILL_LIST 및 _malCost. 웹 수정0 |
| 미리보기 | 기존 Z후보 blackStar/lavaSummon/execution, Space후보 giantSlam/giantSlam2/skyCrusher 중 실제 Skills.Level>0을 우선. 없으면 blackStar/giantSlam. 장착 상태·스킬 습득·저장에 쓰지 않음 |
| 비용 | skill_defs_web의48정의 중 원본 SKILL_LIST에 있는46개의 spCost/matCost/reqLv를 표시자료로 인수. 고유 charge/parry는 원 목록에 없어 추가0. 기존 JSON1칸 들여쓰기를 보존하고 previewCostWebHead/Scope로 비용 출처를 별도 고정. 할인은 양수raw의 max(1,ceil(raw×.5)),0은0 |
| 표시 | 빈 Z 기본 습득 SP10 + 악의오브50(raw100), Space SP10 + 악의오브60(raw120). 양수reqLv가 실제 플레이어 레벨보다 클 때만 Lv안내. 조건 판 높이28px·두줄·font10. 설명판도 같은 preview정의를 사용 |
| 기존 | 270px 설명판·고정 구르기/처형·T석궁·빈2/3/4소켓 원화·64px공통제목 유지. 미이식 기술의 습득/장착 가능을 새로 주장하지 않음 |
| 검사·한계 | 미리보기 정책 부재 RED→GREEN 7개, 앞선 전투24 포함31. 실제 Player1920/3840·1x·번역 전체는 Dota 실행으로 미검증 |

원본byte·데이터 추출·최종 SHA·검수는 I:/EXODUSER-Storage/codex-takeover/unity-parity-1102/REPORT.md. VISUAL VERDICT: 미검증.


## 2026-11-02 3차 CTO 후속 — 실제 지원 스킬 UI/원장 정합

웹 기준은 11-02 현재 origin/main의 skill-forge.js/css와 game.html이다. 이전 13슬롯/LMB 단일 상태 캡처 설명은 이 절의 16슬롯·실제 상태 표시로 대체한다. 미지원 기술의 전투 실행기를 구현한 것으로 표시하지 않는다.

| 구역 | 현재 구현·정확 계약 | 검수 경계 |
|---|---|---|
| 지원 범위 | kiSlash + Simulation.PortedSkillIds의 spikeTrap/giantSlam/holyDome/iceOrb/fireball, 총6종. JSON48정의 중 나머지42종은 정의/설명 조회만, 학습·자원 차감 거절 | 전체 스킬 이식 완료 아님 |
| E/RMB | 과거 Data/skill_defs_web의 slots7/9를 생성 시 교환. 현행 RMB=마법, E=칼등 처내기. 악의구 설명 키도 현재 슬롯7의 키로 표시 | Q/E 핵심/전투 입력 변경0 |
| 왼쪽 정보 | 폭270·padding16·원형 아이콘64·이름23px·본문15px·레벨/원가·강화+/강화−/리셋·실제SP/악의오브/LV. 나눔명조·CinzelDecorative 사용. 과거 원화9-slice 설명판을 웹 CSS의 얇은 테/흑철 gradient로 정합 | 실제 Player1920/3840 비교는 부모 검수 영수증 참조 |
| 지원 학습 | 정의의 spCost/matCost/reqLv, 원가는 sim.MaliceCost로 계산. 중복/요구레벨/SP/악의 부족은 쓰기0 | spikeTrap10SP·raw80→40악의, holy10/90→45, ice10/100→50, giant10/120→60 |
| 강화 | 실제 Lv<min(20,floor(플레이어Lv/50)+1),1SP. 기검참은 Config.KiSlashLevel과 Skills.Levels를 같이 갱신. 하향은1SP환불·Lv1유지 | 기검참 저장은 CombatSave 소유자의 명시 kiSlash 저장/복원 seam과 함께 적용 |
| 장착 | UI0~3=spikeTrap/iceOrb,F4=holy,LMB6=ki,RMB7=fireball,Ctrl11=iceOrb,Space12=giant. 숫자 슬롯 중복은 해제, 고정LMB/RMB/Ctrl 직접 해제는 거절 | 미지원 기술 배정0 |
| 리셋 | RequestReset(sim,id)로 확인 대기, ResolveReset(false)는 자원/슬롯 쓰기0. 확인 시 일반기 학습SP+(Lv−1)SP환불·악의미반환·해당 숫자/CT해제. 기본ki/fireball은Lv1 유지·강화분만 환불 | 동시다른창입력 차단, 사용자저장 덮어쓰기0 |
| 가운데 | 모든13일반 슬롯에 기존 빈 제단 표시, 실제 장착 핵/명칭과 모든 습득 구슬의 실제Lv 표시. 선택한 다른 구슬 때문에 장착 모체의 로드맵 열이 바뀌지 않음 | 합체 executor/전체42종/실시간3D제단은 미이식, 아트 완성 선언 없음 |
| 하단 | 기존 공용 원화 ActionPlate로3버튼 정합. 일괄강화는 지원/습득한6종의 실제Lv락/SP내에서만 처리. 추천자동은 전체 추천빌드에 필요한 미지원 기능 때문에 disabled 유지하고 hover사유 표시 | 부분 추천을 전체 추천으로 가장하지 않음 |
| 저장 요청 | Changed callback에서 실제 원장 변경 때만 NativeGame.RequestCombatSave 요청. 스킬 창이 상태/실행을 초기화하지 않음 | 실제 재시작 왕복은 부모 통합 검수 |

검증: I:/EXODUSER-Storage/codex-takeover/unity-parity-1102/third/skill/의 SkillPolicyTests.csproj·Program.cs, red.txt→green.txt. 실제 Core가 연결된26검사 PASS: SP/악의 원자성·중복학습·Lv50락·기검참실제공격레벨·하향환불·슬롯중복제거·고정슬롯해제거절·리셋중복환불거절·RMB/E배정. 기존 EnemyAi 미사용 지역변수 경고2는 원문 보존. 컴파일/CPU검사만으로 Player/시각/저장 PASS를 선언하지 않는다. 관련docs 전수검색은 같은 폴더 docs-search.txt.


### 3차 첫 Player 실물 재작업 — 최종 CSS/화면 실측 우선

위 첫 후보의 나눔명조/정보판padding16/아이콘64·이름23/본문15 설명은 **첫 Player 차이로 기각한 값**이다. third/ui-first-retry/1920x1080-ko-3차-스킬6.png와 third/web/skill6-1920.png를 직접 비교했고, 최종 web-uiux.css가 skill-forge.css를 덮어쓰는 사실을 확인했다. 이후 수정의 기준은 third/web-layout/skill-1920.json·skill-2560.json(실제 computed style/rect)과 같은 폴더/third/web의 실제 PNG다.

| 구역 | 재작업 값·구현 | 검수 상태 |
|---|---|---|
| 전체 스킬 영역 | x36/y147/w=물리폭−72/h833, 내부배경x39/y150/w=물리폭−78/h827. 웹 제단 shader의 연속 smoke·지옥불·vignette를 전체폭 생성 텍스처로 그린다. 별도 그레인/점 생성0 | 첫 후보의 중앙 검은 사각형 제거용, 최종 Player 재검수 필요 |
| 제단 이미지 | 부모가 원본 RGB를 보존하고 배경 키로 컷아웃한 `altar_lmb_clean.png`·`altar_none_clean.png`를 Resources에서 직접 읽는다. 런타임 AltarRing/Graphics.Blit/ReadPixels 마스크는 최종 Player 색 어두워짐·검은 원반 결함으로 제거. 원본 RGB 감마변환0 | 새 최종 union Player에서 색·외곽 재검수 필요 |
| 제단 배치 | 일반화면 x333/w=화면폭−384, 21:9이상 중앙최대1800폭. y308.1875/h658.8125, 핵중심 y676.2656. 구슬은 기존 정의의 핵대비 상대거리/58px 유지. 제단 이미지와 글자를 함께 축소하지 않음 | 1920·2560·3840 필요 |
| 설명판 | x51/y308.1875/w270, padding20/22/18. 아이콘56, 이름28px·Bold, Hahmlet400본문16px/행간28px·내용폭224. Lv13px. 내용이 몸체658.8125를 넘으면 내부 스크롤/clip | 첫 후보의 작은글자/부족한 본문높이 수정 |
| 원가/해금/정보버튼 | 원가행43px(상하10px), 같은줄오른쪽 해금안내. 버튼까지16px, 버튼40px/폭68.453125·67.015625·64/간격10. 같은 공용 액션원화를 edge22/outset6으로 표시. 자원줄paddingTop12·height37 | SP/LV/실제 원장 동작 유지 |
| 글꼴 | 최종 웹 실제 --font-hell=Hahmlet400. 키만 Cinzel400, 설명·버튼·자원은 Hahmlet. 이전 첫후보의 Nanum/CinzelDecorative 선택 폐기 | 현행폰트자산 재사용·새폰트 생성0 |
| 슬롯 | 16개×100px, 간격clamp(4,.5vw,10), 아이콘70px/y164, 키는 아이콘아래 y237/11px, 이름y251/12px, 상태y270.1875/10px. 숫자기술 장착시 빈 상태문구, 빈숫자칸은 습득후장착. 고정구르기/처형 분리선 | 기존 정책/입력 변경0 |
| T/기본키 | T 표시는 웹의 일반사격/전용으로 정합. 구르기는 ↑↓←→ + 현재키. 실제 T토글은 유지. Ctrl=실제얼음보주, E=실제칼등처내기 상태는 허위이름 교체하지 않음 | 웹의뇌전걸음/기본불꽃칼날과 실제 기능차이는 남음 |
| 하단 | 실제 Hahmlet16 텍스트너비+양쪽30px, 간격12px로 중앙정렬, y998/h40. 원화edge28/outset6. 일괄6종·추천disabled와 사유 유지 | 42종/합체 전체지원 주장은 없음 |

독립 Runtime 컴파일: third/skill/art-fix.compile-retry.log exit0/오류0/기존경고47. 최초 실행은 부모의 이전 rsp가 최신 UiSoundCapture.Lobby.cs를 누락해 사운드symbol2오류였고, 제품코드 변경 없이 입력목록만 추가한 1회 재검사에서 통과했다. 실제 Win64/최종 Player 판정은 부모가 같은 union build에서 수행한다. 이 절은 최종 시각 PASS 영수증이 아니다. Core/Save/NativeGame/사운드/정책 파일은 이 재작업에서 수정0.


### 3차 최종 Player 후속 — 제단 원본 RGB 보존

최종 실물에서 GPU ReadPixels 기반 링 복사가 원화보다 어둡고 외곽을 검은 원반처럼 보이게 한 결함을 확인했다. `NativeSkills.Init`은 부모가 준비하는 정본 RGB 보존 컷아웃 `Art/ui/skill/altar_lmb_clean`·`altar_none_clean`를 직접 로드하며 런타임 `AltarRing` 함수를 삭제했다. 제단 배치·크기·구슬·UI 동작·Core·정책은 그대로다. 컷아웃 에셋 생성/알파 검수와 최종 Player 확인은 부모 담당이다. 기존 GPU 마스크 후보를 최종 시각 PASS로 사용하지 않는다.

후속 독립 Runtime 컴파일: `third/skill/clean-altar.compile.log` 종료0/오류0/기존경고32.Unity·Player·Git 실행0.

제단clean2PNG는원본1154×671 RGB변경0, 알파만수정한다. 중심(577,376.89), r216이내보존/r248이상제거, 바깥붉은배경색키로가시실루엣보존. GPU읽기/감마변환/축소/노이즈추가0. unity/Tools/skill-ui-tests/build-altar-cutout.cjs와 third/skill/altar-alpha-only.json 참조. 실제최종Player에서색/가시를다시확인한다.

## 최종 Player 영수증 — 3차

빌드53412e1f(af70a6a2c5)·같은패키지UI6699ddaa 76PNG/1920·2560·3840/기능14 PASS·M1653caf5c23/23. 모두공식ok·창0·잔여0·USER_SAVE0, Runtime06a013b876120aafbd6d8adb3adf0f0171a2bc81187b6207222a23fabe14e2a7. 직접1x·확대및담당재검수완료. 전체미이식/잔여차이는 UNITY_WEB_PARITY_THIRD_20261102.md에명시한RETOUCH이며, 자연플레이/OS입력/전체언어검증과구분한다. 근거 I:/EXODUSER-Storage/codex-takeover/unity-parity-1102/third/review/.
