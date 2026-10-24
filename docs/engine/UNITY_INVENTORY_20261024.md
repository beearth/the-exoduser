# UNITY-INVENTORY-01 — 시작 장비·가방·장착 화면

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
| 복구 | C#·테스트10파일 SHA256 source-before/after/copy 후909/909. manifest 복구이며 아직 이 자체를 Git tracked-tree 복구라 부르지 않음 |
| 검토 | source spec의 STR중복·double precision·드롭 중심 지적 수정, quality의 viewport 밖 클릭 수정. 실제 Editor/Player는 별도 |
| 실제 엔진 | 첫 Editor 검수 실패와 수정 기록 보존. 수정 후 Editor/Windows build/Player 검수는 진행 중. PASS 전 완료로 표시하지 않음 |
| 저장 | 검수 복사본·cache·로그·이미지·빌드·번들은 I:/EXODUSER-Storage/qa/unity-inventory-20261024. 기존 열린 Editor PID34780 보존 |

## 미완료

world drop의 장비 생성/획득은 여전히 `equipment-roll-pending`이다. 이 시작 표본 밖 아이템·강화·소켓·크리스탈·유니크/전설·봉안함·전체 조건부 어픽스·저장/불러오기·분해·전체 UI/해상도/현지화·사람의 직접 입력 QA는 미완료다. UI 정리/선택/교체는 메모리의 격리 새 실행에만 반영하며 앱 종료 시 보존되지 않는다. 사용자 세이브를 열거나 덮어쓰지 않는다.

**VISUAL VERDICT: RETOUCH** — 실제 PNG 검수 전부터 full parity를 주장하지 않는다. 전체 이식 완료·Godot보다 수월하다는 결론은 보류한다.
