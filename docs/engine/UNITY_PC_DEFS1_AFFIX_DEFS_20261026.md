# PC-DEFS1 어픽스 정의 단일화 — 2026-10-26

베이스 `649802205`(A25), Unity 6000.6.7f1. 목적: 대장간(`forge_web.json`)과 인벤토리 카드(`item_card_defs_web.json`)에 나뉘어 있던 어픽스 정의를 한 파일로 모은다. 동작·화면은 그대로.

## 1. 파일

| 구분 | 경로 | 내용 |
|---|---|---|
| 신규 | `unity/Assets/Exoduser/Resources/Data/affix_defs_web.json` | 어픽스 417개: `id`, `name`, `type`(0 접두 / 1 접미 / -1 구형), `unit`(407개), `desc`(265개). `source`에 웹 커밋·추출 시각·표 이름 기록 |
| 신규 | `unity/Assets/Exoduser/Runtime/AffixDefs.cs` | 공용 로더(`AffixDef`, `AffixDefs.All`), 417개가 아니면 예외 |
| 수정 | `NativeForgeData.cs` | `ForgeAffixDef`/`ForgeAffixUnit` 클래스와 `ForgeDefs.affixes/affixUnits` 삭제 |
| 수정 | `NativeForgePanel.cs` | `affixById`/`unitById`를 `AffixDefs.All`에서 채움(빈 unit = 없음, 이전 동작과 동일). `Tabs.cs`는 변경 없음(타입만 `AffixDef`로 이어짐) |
| 수정 | `NativeInventoryComparison.cs` | 이름·종류·단위·설명을 `AffixDefs.All`에서 읽음. `CardAffixDesc`/`affixDesc` 삭제 |
| 수정 | `forge_web.json` | `affixes`, `affixUnits` 삭제(나머지 키·들여쓰기 그대로) |
| 수정 | `item_card_defs_web.json` | `affixDesc` 삭제, 무기 7·활 3 종류표 유지 |
| 신규 | `unity/Tools/affix-defs-web/build_affix_defs.cjs` | 생성기: game.html의 `AFFIX_NAMES_KO` + `AFFIX_POOL`(type, unit) + `_AFFIX_DESC` |
| 수정 | `unity/Tools/inventory-compare-web/build_item_defs.cjs` | 종류표만 생성(어픽스 입력·출력 삭제) |
| 신규 | `unity/Tools/affix-defs-parity/` | 전/후 동일성 검사(.NET) + 전 기준 `affix_defs_before.json`(649802205 시점 두 파일에서 추출) + `snapshot_before.cjs` |

## 2. 출처

웹 커밋 `1770c2698`, 생성 시각은 `affix_defs_web.json`의 `source.extractedAt`. `AFFIX_POOL`에 id 중복이 있어 단위 행은 409개지만 고유 id는 407개다(이전 C# 딕셔너리와 같이 나중 행 우선). 단위가 없는 10개: critChance, critExplosion, onKillExplode, procIceNova, procDarkShield, procHealPulse, procCorpseExplode, critDmgA, critDmgB, ancDur.

## 3. 검사 결과

| 검사 | 결과 |
|---|---|
| 동일성(`affix-defs-parity`) | 이름 417/417 · 종류 417/417 · 설명 265/265 · 단위 417/417(고유 407, 없음 10) · 옛 두 파일에서 키 삭제 확인 · 종류표 7/3 유지 → IDENTICAL |
| inventory-navigation | 35/35 |
| inventory-oracle | 892 checks / 0 failures |
| stat-parity | 2/2 MATCH |
| Win64 빌드(6000.6.7f1) | Succeeded, errors 0, Exoduser 경고 0 |
| `--unity-forge-capture` 전/후 | 9장 픽셀 동일. 종료 코드 2 = 점검 11개 중 `NativeGame has no forge field (A14 patch not applied)` 1개 — 전/후 빌드가 같음(이 워크트리엔 A14 패치 미적용, NativeGame 수정 금지) |
| `--unity-inventory-smoke --unity-inventory-hover bag 0` 전/후 | 4장 픽셀 동일, 종료 코드 0 |

비교 이미지: `E:/exoduser-wt/_out/pc-defs1/cmp/defs1_forge_salvage.jpg`(접두/접미 이름이 보이는 분해 탭), `defs1_inventory_hover_bag0.jpg`(호버 비교 패널, 1x 크롭). 대장간 어픽스 수치(단위) 경로는 이 캡처에 직접 나오지 않아 동일성 검사의 단위 항목이 근거다.
