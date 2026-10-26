# Unity 시작 수치 웹 대조 PC-U02 (PC, 2026-10-26)

- 오더: 전체총괄 PC-U02. 웹 시작 HP516·MP391·ST306과 Unity HP526·MP330·ST240이 다른 원인을 확정한다. U-04 보고서의 R-1(전투력 1611 vs 1692)과 R-2(가방 구성)도 같이 본다.
- 베이스: `origin/codex/unity-mac-20261024` f357dc3a4. 브랜치: `claude/unity-pc-stat-parity-20261026`.
- 웹 원본: `G:/exoduser/game.html`. 핵심 함수 줄 번호(defaultItems 16171, mkItem 15894, applyStats 27904, mkP 29018)가 Unity fixture가 기록한 원본 스냅샷(`dee094fd…`)의 줄 번호와 같다.

## 판정

**(a) Unity 쪽 오류 1건을 최소 수정했다.** 나머지 차이는 (b) 난수 차이와, Unity에 아직 없는 유골함 자동 지급 때문이다.

| 구분 | 내용 | 조치 |
|---|---|---|
| (a) Unity 오류 | `InventoryState.Admitted`의 고유 옵션 허용 목록에 `_iLifeHPPct`(생명의 팔찌 "최대 HP +X%")가 없었다. 웹 새 캐릭터는 팔찌 종류를 50% 확률로 정하므로(`game.html:16108`), 생명의 팔찌가 나온 캐릭터는 Unity 인벤토리가 통째로 거부한다(`ArgumentException`). `CalculateStats`(InventoryState.cs:70)는 이미 `_iLifeHPPct`를 합산하고 있어서 목록에서만 빠진 상태였다. | 허용 목록에 1개 추가(InventoryState.cs:24). 계산식은 바꾸지 않음 |
| (b) 난수 | 웹은 새 캐릭터마다 `Math.random`으로 시작 장비 수치를 굴린다. Unity는 시드 `0x20261024`로 원본 함수를 한 번 실행한 결과를 고정 fixture로 쓴다(SourceStarterFixture.cs:30-31). 그래서 캡처마다 값이 다르다. | 코드 수정 없음 |
| 미이식 | 웹은 첫 프레임 `draw()`에서 고유 유골함을 자동 장착한다(`game.html:51734-51735` "시작부터 보유", 지급 함수 45882-45893, `mkItem('ossuary',0,EL.P,5)`). 유골함은 `bonusMp` 150 고정이고, 원본 applyStats는 유골함 bonusMp를 최대 MP에 더한다(27918-27921, 27933). Unity fixture는 mkP/defaultItems/applyStats만 실행해서 유골함이 없다. | 이번 오더 범위 밖. 아래 "남은 차이" 참고 |

## 웹 캡처의 정체

| 웹 값 | 출처 | 새 캐릭터 / 세이브 |
|---|---|---|
| HP516·MP391·ST306 (U-02) | 2026-10-22 웹 캡처(`G:/exoduser-wt/_out/parity/web`). `web_capture.cjs`가 로비에서 새 캐릭터 "패리티"를 만들고 `game.html?test=1&slot=demo&demo=1`로 진입한다. 필드·UI 캡처는 같은 URL로 다시 들어가 localStorage `hellsave_demo` 세이브를 불러온 상태다. | 새 캐릭터(무작위 롤), 재진입 시 같은 세이브 |
| HP523·MP414·ST279 | 같은 10-22 프로필에 마지막으로 남은 세이브(ts 1792610249408). 같은 날 실행이 여러 번 있었고, 앞선 세이브들은 Snappy 압축 ldb에만 남아 이번에 풀지 않았다. | 새 캐릭터 |
| HP580·MP430·ST225, 전투력 1692 | 2026-10-26 U-04 웹 캡처 프로필(`E:/exoduser-wt/_out/pc-unity-win/web_inv/profile`) 세이브(ts 1792984196279). 생명의 팔찌. | 새 캐릭터 |

같은 웹·같은 절차로 만든 새 캐릭터 3개가 모두 다른 값이다. 시작 수치는 고정값이 아니다.

## 교차 검증 (Unity 계산식 ↔ 웹 세이브)

웹 세이브 2건의 실제 장착 장비를 Unity `InventoryState.CalculateStats`에 그대로 넣고, 유골함 MP 150을 더해 웹 세이브의 최대치와 비교했다. 도구: `unity/Tools/stat-parity/`(.NET 8.0.301).

| 세이브 | Unity(유골함 제외) | +유골함 MP | 웹 저장값 | 결과 |
|---|---|---|---|---|
| 10-22 ts 1792610249408 (악마의 팔찌) | HP523 MP264 ST279 쉴드288 | MP414 | HP523 MP414 ST279 쉴드288 | 일치 |
| 10-26 ts 1792984196279 (생명의 팔찌) | 수정 전: 인벤토리 거부(예외) / 수정 후: HP580 MP280 ST225 쉴드246 | MP430 | HP580 MP430 ST225 쉴드246 | 수정 후 일치 |

원본 `calcCP`(game.html:49489-49511)를 10-26 세이브에 적용하면 1692(공격200/방어408/추가1084)로, U-04 웹 캡처의 1692와 같다. 유골함을 빼면 1647이다. 차이 45 = 유골함 MP 150 × 0.3.

## 항목별 대조

| 항목 | 웹 (줄) | Unity (파일) | 원인 | 판정 |
|---|---|---|---|---|
| 기본 HP | `_diffBaseHp=max(100,300-20*diff)`, 스테이지 보정 (27913-27914, 27922) | 같은 식 (InventoryState.cs:70) | 같음 | 일치 |
| 장비 HP | 방어구 6부위 `bonusHp` 10~49 무작위 (mkItem 15932-15940), 투구 고유옵션 `_iMaxHP`, 목걸이 `_iMaxHPPct`, 생명의 팔찌 `_iLifeHPPct` (27915) | 같은 합산. 단 `_iLifeHPPct` 허용 누락 | 무작위 롤 + 허용 누락 | (a) 수정 + (b) |
| 최대 ST | `100+dex*2` + 방어구 `bonusSt` 무작위 (16429-16433) | `100+st+lb` (InventoryState.cs:70) | 무작위 롤 | (b) |
| 최대 MP | `100+int*2+장신구·유골함 bonusMp` (27918-27921, 27933) | `100+intel*2+mp+lb`, 유골함 없음 | 무작위 롤 + 유골함 미지급 | (b) + 미이식 |
| 시작 장착 | defaultItems 15종 (16171-16172) + 첫 프레임 유골함 (51735) | fixture 15종 | 유골함 없음 | 미이식 |
| 팔찌 종류 | 50% 악마/생명 (16108) | fixture는 악마의 팔찌 | 무작위 | (b) |
| 전투력 R-1 | calcCP (49489-49511), `mmp*.3` 포함 | U-04 `InventoryCombatPower`(U-04 브랜치) | 장비 롤 차이 + 유골함 MP | (b) + 미이식 |
| 가방 R-2 | `_startDemoNew` 매직 10개: 무기4·갑옷·견갑·투구·신발·망토·석궁, 각 어픽스 2개 (62183-62186) | fixture 같은 10슬롯 구성, 매직·어픽스 2개 | 슬롯 구성은 같다. 어픽스 종류·수치·순서는 무작위 | (b) |

## 수정 내역

| 파일 | 변경 |
|---|---|
| `unity/Assets/Exoduser/Runtime/Core/InventoryState.cs` | `Admitted` 고유옵션 허용 목록에 `"_iLifeHPPct"` 추가 (1줄) |
| `unity/Tools/stat-parity/` (신규) | 웹 세이브 2건 교차 검증 도구 + `web-seeds.json` |
| `unity/.gitignore` | 새 csproj 예외, bin/obj 제외 |

## 검증

| 검사 | 결과 |
|---|---|
| `Tools/inventory-oracle/run.cjs` (기존 원본 대조) | 909 checks / 0 failures (`I:/EXODUSER-Storage/qa/unity-stat-parity-20261026/core-runs`, label `stat-parity-lifehp-01`) |
| `Tools/stat-parity` | 2/2 일치 |
| Windows 빌드 (Unity 6000.4.8f1, Win64, `PortVerification.Build`) | `passed:true, errors:0`. 영수증 `E:/exoduser-wt/_out/pc-stat-parity/receipt.json` |
| 게임 실행 화면 | 확인 안 함. 현재 fixture는 악마의 팔찌라 Unity 시작 화면 값은 이번 수정으로 바뀌지 않는다 |

## 남은 차이 (이번 오더에서 고치지 않음)

| 번호 | 차이 | 필요한 결정·작업 |
|---|---|---|
| S-1 | 유골함 자동 지급이 없다. 같은 롤이라도 Unity 최대 MP가 웹보다 150 낮고, 전투력이 45 낮다. Unity fixture 기준이면 MP 330 → 480이어야 웹과 같은 절차가 된다. | 유골함(고유 등급5, 어픽스 `ancHP` 3티어, 고유옵션 `_iAncPow`)을 인벤토리 허용 대상에 넣고, fixture 재추출(가방 10개 뒤 난수 순서), 장비 슬롯 표시까지 필요하다. 장비 창 UI는 U-04 결정 대기라서 별도 오더로 진행해야 한다 |
| S-2 | Unity는 fixture에 나온 가방 어픽스 20종만 허용한다. 웹 새 캐릭터 가방에는 그 밖의 어픽스(예: `bowAtkSpd`, `farDmg`, `armorDefPct`)가 나와서 Unity로는 불러올 수 없다. | 어픽스 풀 전체 이식 범위 결정 필요 (기존 README에 명시된 제한) |
| S-3 | 10-22 HUD 캡처 516/391/306의 정확한 세이브는 확인하지 못했다(압축 ldb). 값 자체는 무작위 롤 범위 안이다(ST는 154~418 범위). | 필요하면 ldb Snappy 해제로 확인 |
| S-4 | 웹과 같은 값을 화면에서 비교하려면 둘을 같은 장비로 맞춰야 한다. 방법은 웹 세이브를 Unity seed로 넣거나, 웹을 Unity 시드로 시작하는 것이다. | 비교 방법 결정 필요 |
