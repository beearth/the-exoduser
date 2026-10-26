# Mac Editor 시작 인벤토리 seed 검사 정정 — 2026-10-27

## 실패 원인과 정본

Mac Metal 단회 `PortVerification.Verify`는 HUD GPU 검사 다음 `Original inventory seed counts`에서 exit 2였다. 구형 Editor QA는 전체 장착 항목을 `worn==15`로 검사했지만, PC-U04b `c2fdfc158`에서 원본 웹의 첫 프레임 `_grantOssuaryIfNeeded`에 맞춰 고유 `전대의 유골함`을 `equipped[15]`에 추가했다. 현재 정본은 기본 장비 15개와 유골함 1개, 벨트 빈칸 1개다. 근거는 [PC-U04b 계약](UNITY_PC_INVENTORY_U04B_OSSUARY_20261026.md), [후속 PC 실제 초기 16개](UNITY_PC_TABBAR_U08_20261026.md), `unity/Tools/inventory-oracle/Program.cs`의 기본 15개·고정 유골함 별도 검사다.

제품 `Resources/Data/inventory_seed.json`은 oracle의 `inventory-seed.json`과 byte 동일, SHA256 `5e49387b6c11825fa0a2505e92a4748b925ceb16898cb92cf28a4ea249c2f153`이다. oracle `starting` JSON도 동일하다. `inventory_empty_slots.json`은 `[8]`만 비어 있다고 지정한다. 다음 ID는 그 고정 시드의 원문값이며 다른 새 게임 RNG의 영구 ID 규칙이 아니다.

| 인덱스 | 슬롯 | 한글명 | 시드 ID·상태 |
|---:|---|---|---|
| 0 | weapon | 녹슨 검 | `1792796400000.5383` |
| 1 | shield | 나무 견갑 | `1792796400000.5073` |
| 2 | boots | 낡은 전투화 | `1792796400000.4236` |
| 3 | armor | 천 갑옷 | `1792796400000.4863` |
| 4 | helmet | 낡은 머리띠 | `1792796400000.0403` |
| 5 | bow | 낡은 석궁 | `1792796400000.0652` |
| 6 | gloves | 천 장갑 | `1792796400000.5237` |
| 7 | pants | 천 바지 | `1792796400000.9846` |
| 8 | belt | 비어 있음 | `null` |
| 9 | necklace | 낡은 부적 | `1792796400000.1335` |
| 10 | ring1 | 녹슨 반지 | `1792796400000.0942` |
| 11 | ring2 | 녹슨 반지 | `1792796400000.3936` |
| 12 | cape | 낡은 망토 | `1792796400000.761` |
| 13 | bracelet | 낡은 악마의 팔찌 | `1792796400000.9473` |
| 14 | headband | 낡은 귀걸이 | `1792796400000.748` |
| 15 | ossuary | 전대의 유골함 | `1792796400000.756`; rarity 5, bonusMp 150, `ancHP` tier 3/value 0.9 |
| 16 | headband2 | 낡은 귀걸이 | `1792796400000.0999` |

| 항목 | 구형 QA 기대 | 현재 정본·관측 | 새 QA 판정 |
|---|---:|---:|---|
| 전체 `Equipped` non-null | 15 | 16 | 기본 장비와 유골함 분리 |
| 일반 시작 장비(`slot!=ossuary`) | 구분 없음 | 15 | 정확히 15 |
| 고유 유골함 | 검사 없음 | 1, 슬롯 15 | 이름 `전대의 유골함`·rarity 5·슬롯 존재 |
| belt | 검사 없음 | index 8 `null` | 비어 있어야 함 |
| bag | 10 | 10 | 정확히 10, 각 rarity 1 |
| bag 어픽스 합계 | 20 | 20 | 정확히 20 |

`PortVerification.VerifyInventory()`의 QA 조건만 바꿨다. 기본 장비 15개·고정 유골함·빈 belt·가방 10·어픽스 20을 각각 요구한다. 실패 예외에는 기본 장비 수, 유골함 이름/누락, 가방 수와 어픽스 수를 남긴다. 아이템·스탯·전투·저장·제품 인벤토리 코드 및 원본 seed 값은 변경하지 않았다. 수정 전 Editor 사본은 `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-INVENTORY-SEED-QA-20261027/before/PortVerification.cs`에 있고 SHA256 `e7b2813a44a51568a5d8163a788428cf95d0e1d1ea53858c49a849ae774e37e2`, 수정 후 SHA256 `79eda830ae6f4ed03c461beede91f6377d5eaec6e00cddf838e94db60ae9b160`이다.

## 검수와 경계

고정 seed와 웹 추출 oracle을 비교한 집중 정적 검사는 `export_bytes_match`, `oracle_starting_match`, 17슬롯, belt null, 기본 15, 고정 유골함, 가방 10/마법 등급/어픽스 20, empty manifest의 **8/8 PASS**다. 영수증은 `_out/UNITY-MAC-INVENTORY-SEED-QA-20261027/seed-oracle-check.json`. 설치 .NET CLI가 없어 기존 C# inventory-oracle 전체 892검사는 Mac에서 재실행하지 않았다. PC-U04b의 892/0은 PC 기존 결과로만 인용한다.

그 뒤 고정 Editor SHA에서 Unity `6000.6.7f1` `-batchmode -quit -projectPath <Mac worktree>/unity -executeMethod PortVerification.Verify -receipt <QA>/verify-receipt.json -logFile <QA>/verify.log`를 **`-nographics` 없이 1회** 실행했다. 실제 `Metal / Apple M5 Pro / Gamma`; `UNITY_UI_COMPOSITION_BOUNDS_PASS` → `UNITY_HUD_GPU_RESOURCE_MASK_PASS` → `UNITY_INVENTORY_SEED_STATS_UNARMED_PASS` → `UNITY_LOBBY_MEDIA_CAPTIONS_29X32_PASS` → `UNITY_VERIFY_PASS` 순서로 기록됐다. 프로세스 exit 0, receipt `passed=true`, engine `6000.6.7f1`이다. 이는 Editor의 해당 모델·자산·GPU 검사 PASS이며 Player 빌드, 실제 UI 입력, PC AMD 결과를 뜻하지 않는다.

Unity import가 자동 재작성한 tracked `.meta` 411개와 신규 `.meta` 1개는 `<QA>/unity-generated.patch` 및 `<QA>/generated-untracked/`에 보존한 뒤 원래 바이트로 복원했다. 기존 사용자 앱 3개와 개인 roster/save는 건드리지 않았다.
