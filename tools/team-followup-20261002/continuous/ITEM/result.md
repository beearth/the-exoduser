# ITEM — D13 신뢰된 데이터 공급 한 경로

**한 경로 분석과 메모리 후보 검수 완료. 실제 D13 공급·장착 효과 소비는 미연결이며 생산 적용0이다.** 제공 기준은 root의 7e69495046323b3120578f67635c20feb48b2a4f / TASK checkpoint cd675f24다. Git 조회0이며 현재 HEAD 독립 관측으로 주장하지 않는다.

## 실제 경로와 연결 누락

대표 경로: rollDrop의 belt/rarity5 선택 → mkItem → _wiPush worldItems → R키 pickupItem(wi.item) → INV.bag → 아이템창 equipItem(INV.bag[idx]) → INV.equipped.belt → dbSave inv → 메모리 JSON transport → dbRestore equipped assignment → 장착 binding 읽기 후보. 정상 드롭의 확률/필터/획득 UI는 정적 추적만 했고 실행하지 않았다. 가방 보관 경로 하나이며 공유 STORAGE 경로는 범위에 포함하지 않았다.

mkItem은 rarity>=5에서 기존 UNIQUE_SPECIAL만 공급하며 UI-13/U-D13/uniqueRoll/_uTrapOffshoot를 생성하지 않는다. rollDrop에는 D13 선택 resolver도 없다. 장착은 실제 동일 item 참조를 옮기고 recalcSt를 호출하지만 생산에는 D13 소비가 없다. 따라서 rarity5/belt만으로 D13를 선택하거나 uniqueId를 fresh 증거로 삼을 수 없다.

| 함수/표현식 | 현재 읽은 위치 | 원문 SHA-256 |
|---|---|---|
| mkItem | game.html:15177 | 1ee1820b55f373a6db3c2041b359c393ebab34c3006972924d50cf1476373aa1 |
| rollDrop | game.html:30760 | 99e4af8f5cc7193a01fc63e0d0e5e50ca4a5d271693d67c21fc5a15a843a7fc0 |
| pickupItem | game.html:15675 | ade09a8fd8d1a11e19348c6783dacd6a44cbcbf2da62ff61bbb458e9608ee92c |
| equipItem | game.html:15571 | 32e0a5050627e371640d05a8a55faf7f34efd4969dd37ae8b59a8804bdde8bf6 |
| dbSave | game.html:3520 | 3f730eda402d7bf4a2a77c0def9a8d33ef31db4852fbe0acbafc76ddd3882bb5 |
| dbRestore | game.html:3589 | 63385633575b51647ab02b9e27f6d840e036dc35f9cd595b1cc65063e1133c35 |
| rollDrop fresh caller | game.html:30788 | edd2e3843b84dda79abcdb2a86defa5cef31cfe509610eb682cfc6a65032a9a6 |
| world item transfer | game.html:30791 | c2d7aac87e12492b6d1068af8776487d07d29e0e7bb5babb3b0646791def0899 |
| R pickup caller | game.html:31664 | d9daba0e36735e65b6cfb27ea8ce2b5ea37606eb1fb55c1301b875624d827f9d |
| inventory equip caller | game.html:48037 | b814635994f4a048773d48cf8dc550bb30b2bead0f7007e0af1f512e81b9e2a7 |
| dbSave inventory expression | game.html:3537 | 95a7dc156f09665c7d31d75810d5a26bb9f941b56096c2923006ad8d4d7a26cf |
| dbRestore bag assignment | game.html:3615 | 4880711748e26c04c5bf8aaec88a9ffb4f46ea071059752c9c4d8ccf21d06a7e |
| dbRestore equipped assignment | game.html:3616 | 650a476c7d26fd334bee264590162b8450ed07f96ff0a4a5f93a41c708ca8003 |

전체 game.html SHA: 6c77ec6f571f4de9cb199a2ac425eb3f0450205bcf6f1d883ac8d13135ac4b43. easy는 보존 SHA만 측정했고 대표 실행은 본편 한 경로만이다.

## 후보 입력·실행 경계

| 항목 | 정확한 계약 |
|---|---|
| 신뢰 생성 caller | rollDrop에서 새 mkItem 반환 직후, world item 공개 전 공급해야 함. 현재 연결 없음. 검수의 factory는 합성 base 반환 대역이며 실제 mkItem 실행 아님 |
| 명시 공급 | 선택 resolver가 UI-13 / U-D13 / 번지는 뿌리의 띠 / belt와 이미 결정한 정수 rawPercent20~40을 전달. 검수 대표값30. 생성 선택/드롭 확률 승인·구현 아님 |
| freshPort 후보 | factory를 명시 호출하고 신규 base에 기존 uniqueId/uniqueRoll이 없음을 확인. 입력 snapshot을 복사해 name/identity/uniqueRoll만 추가; fresh 출처 보장은 caller 책임이며 factory 이름이나 객체 필드만으로 증명되지 않음 |
| 검토 저장 shape | uniqueRoll:{version:1,effectId:'U-D13',stat:'_uTrapOffshoot',unit:'fraction',storedValue:0.30}. raw는 저장하지 않음. stat 직접 필드 중복0 |
| 저장/복원/장착 읽기 | freshPort 호출0, D13 생성/RNG/수리0. missing/legacy를 기본값으로 채우지 않음. 실제 소켓/affix 마이그레이션 RNG까지0이라는 주장 아님 |
| 소비 후보 | consume은 검토 전용 canonical 값 반환만. 기존 fromStoredValue 원본은 읽기만 했고 import0; 조건은 이 대표 경로의 메모리 대역이며 완전 schema 검사나 실제 효과 소비 아님 |
| 상태·전투 | schemaAdopted=false, enabled=false, runtimeReady=false, productionApplied=false. 피해20~40%, 반경150px, 지속180f, 시전당1; child/DOT/death/cap/겹침/clear 변경0 |

## 새 검증

새 입력3종(명시 신규D13·일반·로드된 UI13 missing binding), 경로5회(미연결 대조1·후보1·일반 원문/후보2·missing1), 새 주장5그룹 PASS. 기존 callback32/caller22/data12+JSON1/D10/698은 완료근거만 읽었고 반복·합산0.

- original source has no D13 supply or consumer
- fresh explicit factory/selection preserves original nested data
- ordinary fresh pass-through is source-equivalent
- loaded UI-13 missing binding remains missing; no repair or fresh inference
- restore/read calls no generation and no additional metadata creation

actual pickupItem/equipItem **전체 함수**를 VM 실행했으나 empty belt/no enhancement/no crystals transfer 경로와 합성 UI/음향/그리드/recalc/save 의존을 사용했다. dbSave inv 식과 dbRestore 두 assignment만 실제 원문 실행했다. 전체 저장/복원/원 drop caller 실행이라 주장하지 않는다. 중첩 identity는 adapter 이전 입력 보존, JSON 이후 로드 객체/uniqueRoll identity 보존을 각각 확인했다; JSON 전후 동일 참조를 주장하지 않는다. RNG throw guard의 미발동은 이 제한된 경로에만 해당한다.

## canonical docs 인계 문안

코드 작성 후 docs 전체 지정 rg: 155행/52파일. 공유docs 쓰기0. 총괄이 다음 문안을 순차 반영한다.

| 정본 | 정확한 추가 문안 |
|---|---|
| ITEM_TEAM_MASTER D13 | “2026-10-02 D13 데이터 공급 한 경로: rollDrop→mkItem→worldItems→R pickup→bag→equip→save inv→restore equipped를 source SHA로 연결했다. 실제 D13 생성 resolver·binding 공급·장착 효과 소비 미연결. 새3입력/5경로/5주장 메모리 검사 PASS, 기존 완료검사 반복0. schemaAdopted/enabled/runtimeReady/productionApplied=false.” |
| 저장 SSOT binding 구역 | “D13 uniqueRoll version1/U-D13/_uTrapOffshoot/fraction은 미채택 검토 shape다. 신뢰된 신규 mkItem 직후 caller만 명시 UI-13/belt/번지는 뿌리의 띠와 결정된 정수20~40%를 공급하며 저장값은 rawPercent÷100이다. raw 중복 저장·로드/장착 생성·missing/legacy 보충·재롤0. 이번 actual restore는 두 INV 대입식 검수에 한정하며 전체 migration RNG0 근거가 아니다.” |
| TOP8/D13 검토 구역 | “D13 actual fresh supplier/저장/장착 소비 연결은 아직 없다. source 경로·메모리 adapter 검토는 continuous/ITEM/result.md를 따른다. 데이터 공급 계약 인수 후 source lifecycle/payload를 다음 Gate로 두며 child20~40%/150px/180f/시전당1 및 cap·겹침 미결 상태를 유지한다.” |

## 영수증·한계

UTC 2026-10-02T05:28:27.500Z→2026-10-02T05:28:27.574Z; KST는 evidence에 기록. 지정 root/owner realpath 일치·symlink=false, 읽기21경로 시작/종료SHA 동일. 최종 명령 exit0, VM 검수 오류0. 첫 준비 명령은 D10 binding 경로 오기로 ENOENT/exit1(VM0)이었으며 소유 검수기의 읽기 경로만 교정했다. 소유3파일만 작성, 이전 산출/생산/docs/저장/Git/서버/UI/빌드/삭제/메시지/새세션0. 현재 chatId는 별도 확인하지 않아 null로 기록했고 이전 chat ID를 현재 수신 ID로 대입하지 않았다. Changes 조회는 TASK Git0에 따라 하지 않았으며 이전 수치나 제공 commit으로 현재 count를 추정하지 않았다.

source PASS는 실제 DB·로컬세이브·브라우저·전투·시각·GPU·패키지 PASS가 아니다. 다음은 총괄의 데이터 공급 계약 인수 뒤 lifecycle/payload 연결이며 독자 실행하지 않는다.
