# DEMO11-48 — 기본 자동 석궁 연결 경계

판정: **BLOCKED — 실제 normalBow 피해·반사 접점 필요. 구현 완료 아님.** 기준 `origin/main` `0138c5bb9188d27cee10cb1a901d075092ddb88f`. 작업 브랜치 `codex/demo11-48-20261021`. 의존 merge 없음. 공용 Main/State·World/Player·PC 보호 경로·제품 코드 변경 모두 0줄이다.

사용자는 피해·반사·패링을 PC 보호 경로에 **호출만** 하도록 지정했다. 현재 hurtE의 옵션 허용 목록에는 `normalBow`가 없다. 실제 실행자 호출은 `hurte_opts_unsupported:normalBow`, `halted_at:42110`, `ok:false`, RNG 0회로 종료한다. 옵션을 버리고 일반 근접 피해로 호출하거나 다른 피해 함수로 우회하지 않았다. 진단은 null 의존으로 옵션 검증의 선행 거부만 재현했으며 실제 Main·적 HP 통합 성공을 주장하지 않는다.

| 원본 game.html 근거 | 현행 모듈·판단 |
|---|---|
| 17446–17457: range1000/interval120/dmg28/speed13/PIERCE false, W01 spec | `auto_bow_spec/producer.gd`와 `source_item_catalog.gd` 재사용 가능. 기존 회귀는 아래 원로그 |
| 35139–35163: 현재 bow·살아 있는 P, 최근접 strict range, 타이머·ST 20% 초과 | INV reader 재사용 가능. 새 타이머·ST writer는 만들지 않음 |
| 28702–28730: 발사 위치+10, 실제 packet, normalBow/ghostXbow, 발사 후 ST 지출 | `native_player_projectile_store.gd` 재사용 가능. 기본 발사 이외 활성 스킬/전설을 기본 탄으로 위장하면 안 됨 |
| 28771 / 28003–28015 / 31983: bowRef·배율·ST 할인 | reference/affix 재사용 + bow 전용 읽기 계산 필요. PC formula 수정0 |
| 35176–35236: 선형 이동·거리 해제·벽 반사 | 벽/반사는 PC 접점 필요. `reflect_native_q_source_projectile`는 gbBean/blackBean 경로로 normalBow 대용 불가 |
| 35407 / 42466: 실제 hurtE에 탄 옵션 전달, normalBow 원거리 분류 | `native_normal_enemy_hurte.gd:80–89` 허용 옵션 밖 normalBow 즉시 정지. 일반 opts로 버리면 원거리/넉백 의미 변경 |
| 35560–35617: 통일 관통→기존 확률 관통→normalBow 킬 관통 | 피해 승인과 실제 사망 결과가 먼저 필요. fixture 사망 결과를 실제 피해 성공으로 세지 않음 |
| DEMO11-35 registry | 현재 hostile birth만 수용. player normalBow 등록/해제를 같은 registry에 추가해야 함. 별도 권위 registry 생성0 |
| `native_source_player_initialization_services.gd:462–471` | 실제 projectile context는 현재 ready:false, sp_published:false 반환. fireball consumer도 준비 조건을 지킴. World ticks와 원본 sp 동등성·phase 연결 확인 필요 |

## PC 인터페이스 요청과 재개 순서

PC 요청 1: 기존 hurtE owner가 **현재 packet 옵션을 보존한 normalBow 호출**을 수용하고 원본 42466 원거리 분류를 처리하도록 한다. 반환에는 실제 적용/거부, prefix, RNG 소비와 실제 적 생존 결과를 남겨야 한다. PC 요청 2: 원본 벽 반사·적 반사·패링의 normalBow 접점과 원본 packet 동일성/반환 소유권 계약을 제공한다. 이 문서의 요청은 새 API가 이미 존재한다는 주장이 아니다.

이후 Mac: INV/W01→최근접 타깃/interval/ST 게이트를 단일 owner에 모으고, 실제 store packet을 빌려 publish한 뒤 DEMO11-35 동일 registry에 등록한다. PC 접점 승인 뒤 관통·반사·거리 종료·사망/비활성/장비 해제에서 동일 packet의 단회 반환을 검수한다. 실제 source sp 또는 동등성이 확인된 기존 frame 접점을 사용하며 임의 delta*60 폴백은 금지한다. PC 모듈 자체 수정은 이 작업에 포함하지 않는다.

22r 장착 완료 후 **장비 교체 회귀는 후속**: bow 교체/해제, cached affix 무효화, 현재 INV 동일성, 발사 중 교체 탄 정책, ST 중복 지출·중복 owner·해제 누수. 현재 22r 결과/호환은 미확인이다.

## 검증·제출 한계

`~/exoduser-wt/_out/demo11-48/`에 import/boundary/w01 stdout·stderr·engine 로그·gate.jsonl·종료 메타데이터와 재현 스크립트를 보존했다. boundary는 격리 이름 `EXODUSER-demo11-48-Isolated-20261021`, 기존 W01은 파일 상수 `EXODUSER-w01-Isolated-20261020`. 각 실행 전 정확한 pgrep gate를 적용하고 override.cfg는 실행 후 0byte로 비웠다.

| 검증 | 결과·한계 |
|---|---|
| 옵션 경계 진단 | 5검사/0실패. 이는 normalBow **거부가 재현됨**을 뜻하며 전투 성공 PASS가 아님 |
| 기존 W01 회귀(무수정, 1회) | 63 fixture, 361검사/0실패. 원래 파일 상수 격리 이름 사용 |
| import·진단·회귀 | 각 1회 exit0, ERROR0. Godot 3회, 실행 중복0; gate 기록은 각 jsonl |

 실제 탄 생성·자연 전투·관통·반사·패링·종료 누수 검수는 **미실행**. 제품 owner 미구현으로 **120fps 물리 N틱 벽시계 벤치 미실행**, 예산 충족 주장0. 신규 tick 코드·목록 생성 API0. 화면/캡처·저장 쓰기·맵·전투 핵심 변경0.
