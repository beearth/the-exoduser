# DEMO11 — 자동 물약 context pack

## 원본 계약

| R 행 | 핵심 상수·식 |
|---|---|
| 27677–27686 | HP 1종 `POT`, QSLOTS4, `autoPotCd`, `qsAuto`; 자동은 `qsAuto`를 읽지 않는다. |
| 28071–28084 | `potHeal`: Lv0=100, Lv1=150, Lv2+=lv×100. potionPower 적용은 `~~(heal×(1+affix))`. |
| 28202–28267 | 수동 quickslot/CD/UI. `potionCdRed`는 수동만이며 자동식에 넣지 않는다. |
| 35893–35910 | 자동: 양수 CD 감쇠→threshold/gate→mats→live 장비/패시브/CD→회복량 재조회→HP→lesson/SFX/text/stat. |

자동 CD는 장비 glove/belt와 passive를 그 순간 다시 읽고 각 상한 .2를 적용한다. 300f 주석/`autoPotThr`/수동 쿨감은 자동 공식에 무단 혼합 금지다.

## 호출 순서

`update 후반 → autoPotCd 감쇠 → dead/lesson/mats/HP/CD gate → before HP → mats 차감 → CD 계산/write → potHeal 재조회 → HP write → tutorial·SFX·text·통계`다. 한 plan으로 일괄 commit하면 원본 read/write 순서가 사라진다.

## Godot origin/main 대응

`main.gd:18,89`의 `native_potion_recovery.gd`/QS-01 producer는 존재하고 `addPotion`은 hp→악의구슬+1(State:508)만 보인다. 자동 CD·HP writer·수동 slot input natural consumer는 gap D29 **통합 대기**다.

## 관련 docs

- `docs/2_8 퀵슬롯+물약시스템/`
- `docs/engine/FDG_SOURCE_TRACE_QUICKSLOT_20261020.md` §1, QS-01~07
- `docs/engine/DEMO11_COMPLETION_GAP_20261021.md` D29

## 주의

MP/ST 물약을 발명하지 않는다. 저장·실제 HP writer·전투 tick 위치는 owner 승인 후 연결하며, HUD 표시 존재만으로 자동 사용 완료라 하지 않는다.
