# A07 인벤토리 seed 단계 경계 — 2026-10-27

`PortVerification.Verify`의 `Original inventory seed counts` 실패를 해석할 때 PC의 첫 유골함 획득 전 fixture와 Mac의 PC-U04b 이후 fixture를 구분한다. 아래 값은 각 고정 파일의 계약이다. 실제 Player 인벤토리 관측이나 PC AMD GPU 결과가 아니다.

| 고정점 | seed SHA-256 | equipped 17칸 | bag / bag affix | 유골함 상태 |
|---|---|---:|---:|---|
| PC UI branch `244fc4b0ed16f8a6140cd2c60d1cc1b77fd5328d`의 `unity/Tools/inventory-oracle/inventory-seed.json` 및 `Resources/Data/inventory_seed.json` | `cde2c972fe01307fb1989d4ba7fb5c3e6c5ddc79138672936fb64be3bb03b831` | 장착 15, 빈 belt(8)·ossuary(15) | 10 / 20 | 첫 획득 전. 웹 `main` `607110d52a56a1e5622a78e2ce7d09582946920a`의 `_grantOssuaryIfNeeded()` 뒤에는 장착 16을 기대하지만 새 ID는 런타임 생성값 |
| Mac branch `8aa637a31b0decf80cf8d56d5cb376e7ed1c1aad`의 `Resources/Data/inventory_seed.json`과 inventory oracle export | `5e49387b6c11825fa0a2505e92a4748b925ceb16898cb92cf28a4ea249c2f153` | 기본 장비 15+고정 유골함 1, 빈 belt(8) | 10 / 20 | PC-U04b `c2fdfc158` 이후 첫 프레임 계약을 fixture에 반영. 슬롯 15의 ID `1792796400000.756`, rarity 5·bonusMp 150 |

Mac의 구형 Editor 검사는 모든 장착 항목이 15개라는 조건이었으므로 현행 Mac seed의 16개에서 실패했다. `8aa637a…`는 **Editor QA 조건만** 기본 장비 15·유골함 존재·belt 빈칸·bag 10·affix 20으로 나눴다. 제품 seed·아이템·전투·저장 수치는 바꾸지 않았다. Mac 정적 fixture 대조 8/8 뒤 Unity 6000.6.7f1 Metal/Apple M5 Pro/Gamma `PortVerification.Verify` 단회 exit 0·receipt PASS. composition, GPU resource mask, inventory, lobby 검사 순서다. 이전 `32d50f08c…`의 GPU 5 raw RGBA와 전체 Verify exit 2 기록은 이 수정으로 지우지 않는다.

근거: I: `qa-contract/a07-inventory-seed-ossuary-oracle.md`는 **PC 획득 전** 단계만 상세 표기한다. Mac 원격 `docs/engine/UNITY_MAC_INVENTORY_SEED_QA_20261027.md`는 **현행 Mac fixture** 및 Editor 영수증을 기록한다. 두 seed SHA는 다르며 PC의 15를 Mac 전체 장착 expected로 복사하거나 Mac의 16을 PC 획득 전 expected로 복사하면 안 된다. Mac Editor PASS를 Mac Player 자연 플레이·입력·화면 또는 PC AMD PASS로 확장하지 않는다. PC E: lock 정리 자동 승인 거부와 Editor 재실행 0은 유지한다.
