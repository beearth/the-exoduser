# 장비 성공 전이의 원자적 자원 갱신 — source16, 2026-10-03

성공 장착/해제는 기존 recalcSt만으로 HP/MP/쉴드 최대치를 갱신하지 못하거나 UI의 뒤늦은 applyStats에서 중간 최대치로 현재 HP/MP를 줄였다. 저장 요청도 최종 계산보다 먼저였다. 성공 producer의 최종 계산/자원 복원 뒤에 기존 효과·저장을 수행하도록 실제 생산에 적용했다.

**실제 생산 반영 및 actual-source live47/47 완료. 현재 실행 중인 source15/3391 앱은 source16을 포함하지 않는다. 실제 장비 UI·보스 재도전·청취는 미인수다.**

## 2026-10-03 source16 장비 성공 전이의 자원·저장 경계

| 접점 | source16 계약 |
|---|---|
| `_refreshEquipmentStats()` | 현재 HP/MP/ST/쉴드 보관→`_eqAffixCache=null;_eqStatCache=null`→공용 `applyStats()`1회→각 최종 최대치와 보관 현재치의 `Math.min` 복원. 공용 applyStats/recalcSt 공식 변경0 |
| 정상 성공 | 기존 장비/결정/강화 이동 뒤 helper→기존 효과→기존 저장. caller 중복 applyStats 제거; 반환/선택/render/호버 의미 유지 |
| 거절 | 장착 레벨/악의 거절에 helper/재계산/저장0, 안내/caller render 유지. source15 해제 빈 슬롯·격자 거절의 false/복구/재계산·렌더0 유지 |
| 최초 유골함 | 별도 provenance: 기존 장착/가방 유골함 가드·고정 mkItem·생성 RNG 불변. 새 직장착→helper→기존 notify/FX, 다음 기존 pickupItem 저장은 최종 P/INV를 사용 |
| 본편/Easy | 본편 일반 픽업 가방 우선에 새 재계산0, 귀걸이 adapter는 producer 계산 재사용. Easy 빈 슬롯 자동장착→helper→기존 픽업음/알림→lesson→save; ring2 선택 정책 유지 |
| 자원·공식 | 무료 회복/비율 충전/추가 쉴드 회복0, 최종 최대치 감소에 의한 clamp 유지. 기존 강화/결정/패시브/근성/경제·schema 불변 |
| 검수 | private 원본11PASS/36FAIL→후보47/47PASS, actual production47/47PASS·fixture0/12JS+2JSON PASS. DOM/음향/실 디스크 저장/native/전체게임 미인수 |



| 검수 | 결과와 한계 |
|---|---|
| 신규 | 본편24+Easy23=47. 원본11PASS/36FAIL·fixture0, private 후보47/47PASS·fixture0 |
| 구문 | private 전체HTML12JS+2JSON 영수증 PASS 재사용. docs 담당 실행0 |
| 실제 추출 | equip/unequip/pickup/first-grant/earring/bag helpers, 실제 생성/등록 UI handlers, stat/grid/crystal/economy/passive 의존성, DEMO dbSave RHS |
| 보존 | shared stats/data·DEMO writer·고정 유골함 factory branch bytes 동일. source15 successful golden/current loss 경계만 재사용하며 기존48 전수 재실행0 |
| 대역 | 합성 P/INV; render/hover/notify/SFX/FX/pet/lesson/bone registration/force scheduling 기록 leaf. 최초 유골함 factory prefix/RNG만 seed leaf, 고정 분기와 IMPLICIT_TABLE은 실제 원문 |
| 저장 | 실제 DEMO JSON serialization은 메모리 localStorage만. 실 저장/서버/재로드/강제저장 scheduling 인수 아님 |
| native | 실제 DOM/입력/청취/전체게임/native PASS0 |

실제 생산값: main4030345B/+227B/SHA399fd8b0b37b62ba9a95eb177e56693cba1b77827cde2146f3d2a3799f2ddc51, Easy3907631B/+246B/SHAa88404ed79083753a1383ca6f7b82533bb3f198923cd63abcf34379f7b25afb9. 실제 입력 SHA 전후 동일과 전체 역치환 source15 byte exact를 live 검증했다. 보호67/관리자4 보존과 scoped Git 결과는 root 후속 영수증에 분리한다.

## 실제 통합·검증 영수증

| 합성 actual-source 경계 | 기존→source16 실제 결과 |
|---|---|
| 성공 해제/패시브2 | main현재HP1028/Easy1051·MP244, 최종최대912/206. 원본현재312/106→최종912/206; ST180→152·쉴드165→110 최종 clamp 유지 |
| 낮은 자원 | HP12/MP3/ST5/쉴드7 보존·무료회복0 |
| 새 ST 결정 | 현재192·최종최대252에서 원본stale clamp152→현재192 유지 |
| 첫 고정 유골함 | 실제 bonusMp150 불변. 최대206→356 즉시 반영, 현재206 충전0, helper 추가 저장0·기존 pickup 저장1 |
| actual live | 47/47PASS(본편24/Easy23)·fixture0, 전체12JS+2JSON PASS. 실제 최종HP/MP/ST/쉴드 및 committed INV의 DEMO JSON1회 직렬화 |
| 과거 지원 | source15 48 전수 재실행0, current47의 거절6/성공 후 반복 거절2로 실패 보존. 옛 하니스 explicit historical/exact pin만 허용, current exit2·executed0·overallPass=null. 지원가드1회 및 test syntax2 PASS |
| 준비 실패 | 역앵커 중복0VM 및 invalidstar5/과도한FX순서 assertion 원자료 보존. 실제star0–4/기존강화 전승알림을 반영해 하니스만 정정1회, 제품후보 변경0. root docs stdin 인코딩 준비실패1은 실행0/문서쓰기0이며 작은UTF-8 입력으로 복구 |
| 실제 앱 | source15/3391은 정상 새캐릭터→도입→guide1–4→기본 연습skip→CH1 LV1/지역0/32/HP565/565 화면. 일반 필드0처치 사망은 보스 사망 회귀검수가 아님. source16 실제 앱/전체목표 미인수 |
| 보존·범위 | existing11 백업/new2 absent. code2/test2/docs9=13만 scoped checkpoint; actual84/외부future8포함92 예상, 타인67/관리자4와 index/사용자게임/세이브/보호2_3 보존 |

영수증 기본 경로: `tmp/mac-migration-runtime/continued-review-20261003/root-equipment-atomic-source16/`.

| 영수증 | bytes / SHA256 |
|---|---|
| 새 tracked 하니스 | 33621 / 78ffbc868be5aa977acbcfafb2bb6e52246dbc885551e785dca4108dacd3aa86 |
| patch-plan.json | 10966 / 991737827c8fdb02d5f4f7cf2bef9350e669d7d8c531d326b01c87015a4d494c |
| memory-receipt.json | 565975 / 01484a002761b62d7ac3c7a73cd64a08084a38a0c2798174d7674f7116926b9f |
| root-live-receipt.json | 302996 / b156201c97a2c12e754efcc99f6db6d381001b0b37b8cec3fbe8a198b92b87f3 |

root code 변경 뒤 docs전체 검색622행/101경로, 팀의 더 넓은 패턴939행/134경로는 각각 보존하며 동일 검사로 합산하지 않는다. 정본4/과거2후속/신규1/MASTER와CHANGELOG2 총9문서를 동기화한다. 정확 commit/push/원격 SHA는 후속 ignored `checkpoint-receipt.json`에서 확인한다.
