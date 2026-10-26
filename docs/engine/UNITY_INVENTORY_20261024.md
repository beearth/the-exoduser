# UNITY-INVENTORY-01 — 시작 장비·가방·장착 화면

> 2026-10-27 현행: 아래의 시작 15장비·빈 ossuary는 2026-10-24 원본 첫 단계의 이력이다. PC-U04b부터 첫 프레임 고유 유골함이 슬롯 15에 추가돼 **기본 15+유골함 1=전체 16장착**, belt만 비어 있다. Mac Editor QA의 구형 전체 15 검사는 [정본 seed 계약·검수](UNITY_MAC_INVENTORY_SEED_QA_20261027.md)에 맞춰 고쳤다. 제품 seed·장비 수치 변경은 없다.

> 2026-10-24 정정: 아래는 이전 후보의 제작·검수 이력이다. 전체폭 도킹은 최신 사용자 중앙 HUD·양측 인벤토리 방향으로 교체 중이며 전체 디자인 인수는 미완료다. [현행 설계](UNITY_UI_COMPOSITION_20261024.md).


Godot를 보존하고 Unity를 비교 시험한다. 최종 엔진 미확정. Unity C#의 격리 새 실행만 수정하며 웹/Godot·공유 main/INDEX480·사용자 세이브는 보존한다.

| 항목 | 원본과 구현 |
|---|---|
| 데이터 | source snapshot SHA256 `dee094fd165e9b2fb3fbf0eb9cacc3bc3eddeb2c8eeea9c4772ba6cbc1f05209`, seed `0x20261024`, 시작15장비505난수 뒤 가방10개까지887난수. `mkItem` 네번째 인수는 rarity이며 가방은 **마법등급1·각2어픽스, 총20개**. raw 값을 삭제하지 않음 |
| 슬롯 | 원본 SLOT_NAMES 순서17개, 시작15개 장착/빈 belt·ossuary. UI는 봉안함을 제외한16슬롯. 귀걸이 빈 짝 슬롯 선택, 객체 참조로 소유권 확인 |
| 가방 | 10열×120행, 이 승인 표본의 모든 아이템2×2, bag 최대300. 원본 sort 우선순위·itemPower·충돌/범위 검사. 원본 중심 드롭 `round(mouseCell−size/2)` 후0..grid−size clamp. scroll viewport 바깥 숨은 아이템 클릭 차단 |
| 변경 | 선택·우클릭/버튼 장착·해제·드래그 이동·정리. UI와 자동 fixture가 같은 Equip/Unequip/DropAt/Sort 핸들러 사용. 입력 자체는 native IMGUI |
| 정적 계산 | [InventoryState 계산·원본72함수/테이블·909검사](UNITY_INVENTORY_CORE_20261024.md). 기본/장비/level/stage/difficulty/implicit·shieldFlat/maxHPPct/defFlat/dropRate 합산. 장착 시 Simulation Config와 현재 Player의 max·speed·baseAtk 갱신 |
| 자원 | `_refreshEquipmentStats`처럼 HP/MP/ST/shield 각각 `min(교체 전 현재량, 새 최대량)`. 회복·비율 유지 없음. 위치·경험치·포이즈·현재 행동은 변경하지 않음 |
| 피해 경계 | KiSlash에 이미 포함된 floor(level×.5)를 equipment STR에서 빼 중복을 막음. double 배율 .7·AccessoryDamageBonus 유지. 원본 Lv2 시작검 기검참1999, Lv1 무기 해제882. 무기 해제 raw speed/range/arc0은 소비부에서 회복speed.3/range50/arc.95 폴백 |
| 미디어 | 기존 원본20파일20,998,034bytes를 live G:·소유 E:·Unity 목적지 SHA256 대조. 원본 knight cutout/socket/iron과 아이템17개 이미지. 신규 생성0. `Tools/Fixtures/inventory-assets.json` 명세. 원본 속성별 skin 경로·fire→phys·cutout우선 규칙 사용 |
| 화면 | 종이인형654×560/16슬롯 원본 좌표·96×96/62×62 아이콘·knight385×560. 1920×1080 기준3열, uniform scale/letterbox. 원본 철판/socket·캐릭터·아이콘 사용. 원본 CSS 전체 효과/반응형 전체 동등성은 별도 |
| 설명 | 원본 `_AFFIX_DESC`/`AFFIX_NAMES_KO`/`AFFIX_POOL`를 live 대조하여 한글명·단위 표시. 조건부 전투 어픽스는 **전투 효과 미이식** 표시. 원본 raw20어픽스는 보존되며 정적4종 이외의 전투효과는 연결하지 않음. implicit 피해/저항·패링 등도 전체 소비 미완료 |
| 입력 | TAB 소지품 열기/닫기, ESC는 열린 소지품 우선 닫기. 열기 전 Running 보존·고정시뮬레이션 정지·닫기 후 유효 실행상태 복귀. 열린 동안 월드 입력/HUD 차단 |
| Unity JSON | 실제 Editor 첫 검수에서 JsonUtility가 inline class 배열의 null을 기본 객체로 만들어 admission 실패. 원본 seed의 null 인덱스만 동반 manifest로 내보내고 NativeInventorySeed가 빈 객체임을 확인한 뒤 null 복원. core 검사를 느슨하게 하지 않음 |
| 런타임 | Resources의 typed seed·C# 계산·IMGUI. Node/VM/Acorn은 I: 개발 도구에만 사용. Player에 JS/WebView 없음 |

## 검수와 근거

| 단계 | 현황 |
|---|---|
| RED | 인벤토리 미구현 C# test1실패 후 원본 magic admission 오류와 level grit21실패를 실제로 검출. 기존 HUD Player에 새 inventory gate를 실행하면 인벤토리 receipt/화면/동작 검사 FAIL |
| 독립 모델 | 인벤909/909, 원본27장착/해제·9성장프로필·6grid경계·no-heal. 이전 Ki93/poise7/feedback26/HUD130/basic-map36 및 map2523표본 회귀0실패. `I:/EXODUSER-Storage/qa/unity-inventory-20261024/regression-2026-10-24T10-45/` |
| 복구 | 최초 C#·테스트10파일 SHA256 manifest복구909/909. 이후 commit `0eb5018f230ab1d358d405af3b5f2c8342dd29ad`의 Git tracked18파일만 새 I: 경로에 복원해909/909 및 모든 C# core/adapter compile0을 확인. `fresh-tracked-2026-10-24T10-48-14-581Z/RECEIPT.json`. full Unity project 복구라는 뜻은 아님 |
| 검토 | source spec의 STR중복·double precision·드롭 중심 지적 수정, quality의 viewport 밖 클릭 수정. 실제 Editor/Player는 별도 |
| 실제 엔진 | 첫 `inventory-verify-2026-10-24T10-41-29-561Z`의 JsonUtility null 오류 실패 보존. 수정 후 `inventory-verify-2026-10-24T10-44-07-370Z/receipt.json` PASS/process0: 원본15/10/20개·stats·no-heal·.7 double·Lv2검기1999/Lv1무기해제882·무기해제 실제Tick·미디어·기존HUD GPU검사. Windows `inventory-build-2026-10-24T10-47-24-190Z` Succeeded/errors0/967,495,298bytes |
| 실제 인벤토리 | `inventory-player-2026-10-24T10-48-28-959Z` PID50732에서 같은UI핸들러의 교체/해제/정리/이동·중앙4/4·끝8/118·pause/resume·자원min을 확인. 무기ATK18→31→0. PNG3장 원본픽셀 직접 검토, gate10/10. 종료 후 자기가 실행한 QA Player만 정상 CloseMainWindow, 기존 Editor 보존. OS마우스/키보드 수동 입력 시험이라는 뜻은 아님 |
| 실제 전투 | `inventory-combat-2026-10-24T10-49-20-121Z` PID28712에서 X4020→4101.58496·120차지/해제·4처치/48509피해·원음8/8/0drop·listenerPeak.30821764·명중광4/완충광1·gate6/6, release PNG 직접 검토. 실제 엔진 출력이며 물리 스피커 청취/자연 플레이 인수는 별도 |
| 원격 복구점 | 빌드 전 local `0eb5018f230ab1d358d405af3b5f2c8342dd29ad`, remote `dc686c6fd4f6047cb87124cca51a3661146ead42`. 두 commit은 서로 다르며 같은 tree `54237ccdf5efb753b08d4661e8dfa8df0592f0cf`를 확인. 공식 connector로 원격 정상 부모/expectedSHA를 보존해 반영, fetch·ls-remote·전체 tree diff0. 후속 검수 docs/gate seal은 I: DONE 영수증에서 별도 기록 |
| 저장 | 검수 복사본·cache·로그·이미지·빌드·번들은 I:/EXODUSER-Storage/qa/unity-inventory-20261024. 기존 열린 Editor PID34780 보존 |

## 미완료

world drop의 장비 생성/획득은 여전히 `equipment-roll-pending`이다. 이 시작 표본 밖 아이템·강화·소켓·크리스탈·유니크/전설·봉안함·전체 조건부 어픽스/implicit 전투소비·장착별 플레이어 외형/전 무기 전용 동작·저장/불러오기·분해·전체 UI/해상도/현지화·사람의 직접 입력 QA는 미완료다. UI 정리/선택/교체는 메모리의 격리 새 실행에만 반영하며 앱 종료 시 보존되지 않는다. 사용자 세이브를 열거나 덮어쓰지 않는다.

**VISUAL VERDICT: RETOUCH** — 실제 인벤토리3상태와 전투 release PNG를 검토했다. 원본 CSS 전체 필터/프레임/텍스트·비교 패널·반응형·전체 화면 동등성은 미완료다. 실제UI를 표시한 것과 사람의 직접 입력/전체 gameplay인수는 구분한다. 전체 이식 완료·Godot보다 수월하다는 결론은 보류한다.

## 2026-10-24 후속 — 화면에 이어지는 인벤토리 외곽

사용자가 요청한 화면 가장자리와의 일체감을 위해 `NativeInventoryDock`에서 개별3카드 Panel/외곽12px 여백을 제거하고, 화면0원점부터 actualWidth/Height까지 이어지는 공통iron shell·상단제목·하단60px 상태선과 공유 금속 rail로 묶었다. 기존 기본/장비/가방/입력/수치/저장 경계는 그대로다. 위 이전 **화면** 행의 knight385×560·가운데 letterbox는 이전 검수본의 이력이며, 새 Native 시각 규격은 아래 후속 문서가 우선한다.

1920×1080은 장착720/가방600/상세600, 1280×720은 균등2/3배율, 2560×1080은 여분640px를38/32/30%로 나눈963.2/804.8/792열이다. 원본 knight의 투명 여백만 UV crop해600×309/846≈219.15폭·600높이로 그리고, 원본 슬롯654×560 좌표·96hit·62아이콘·128socket·1.02배율은 유지한다. 기존 로비 정적 Regular/SemiBold 폰트를 재사용하여 본문20/이름18px,720p에서는13.33/12px로 표시한다. 긴 가방 이름은 말줄임하되 선택 상세에 원본 전체 이름이 남는다.

새 Player PNG/입력 검수는 부모 통합 단위에서 진행한다. 이전909검사·이전 실제 인벤/전투 PASS를 새 시각·반응형 검수로 승격하지 않는다. [배치·입력 경계·새 검수 대기](UNITY_INVENTORY_DOCK_20261024.md).

2026-10-24 UI-DOCK 통합: 실제1920/1280/2560의HUD·인벤6런/PNG18장·기존자원/장착핸들러검수PASS. 독립시각7PNG검토에서이번도킹VISUAL PASS. 고정E:실행152파일갱신·SHA대조, I:원본/검수보존. 사람직접입력/전체UI/게임·인트로재완주는이결과와별도. [배치·실패·완료근거](UNITY_UI_DOCK_20261024.md).


2026-10-25 후속: 양측 도킹에 선택/착용 장비 비교와 상세 탭, 별도 일시정지·설정 화면 연결. 현재 구현과 실제 통합 검수는 [장비 비교·설정](UNITY_MAC_INVENTORY_SETTINGS_20261025.md)을 따른다. 전체 비교·전체 설정 이식 완료라는 뜻은 아니다.
