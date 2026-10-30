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
