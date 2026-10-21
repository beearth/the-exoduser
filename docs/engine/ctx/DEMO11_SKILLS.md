# DEMO11 — 스킬 슬롯·쿨다운·비용 context pack

## 원본 계약

| R 행 | 핵심 상수·공식 |
|---|---|
| 3913–3930 | `_skillUpSpCost`, `_fuseUpSpCost`, `_skillSpentSp`; 역사 주석 수치가 실행식은 아님. |
| 27681–27686 | `SKILL_SLOTS` 6칸: 0–3 일반, 4 Space, 5 F; `ULT_SLOT`은 별도. |
| 44082–44642 | 55개 registry, 32개 합체, demo 허용22 / 금지10, absorbed·innateStar·min/max gate. |
| 46969–48000 | 슬롯 repair, 학습·강화·합체·환불 UI/commit. |
| 12905–13125, 35912 이후 | 실제 발동/숙련과 update의 CD 진행. metadata CD와 시전 CD를 동일시하지 않는다. |

시작4종은 `giantSlam/spikeTrap/holyDome/iceOrb`. 데모 후보 51개는 단지 `reqLv≤100`; hidden/requirements/재화/실효과가 별도다. demo 금지 합체·어픽스를 풀지 않는다.

## 호출 순서

`K/L UI 또는 고정키 → 보유·슬롯·absorbed·io/gw/lesson gate → 비용 선검사/commit → 실제 effect dispatch → 성공 시 숙련·CD → 저장/HUD/SFX`다. 합체는 star×3 선차감 후 강화분 환불·Lv1·fused/absorbed/host 처리 순서를 보존한다.

## Godot origin/main 대응

`native_skill_slots.gd:146–159,212,303,345,511,826`와 `main.gd:766 이후`가 시작4종의 고정키/리젠을 연결한다. `port_modules/skill_management_source/{catalog,slot_rules,learn,upgrade,refund,batch_recommend,fusion_rules,fuse_commit}`와 비용 모듈은 존재하나 gap D15는 Main/HUD 호출 0의 **통합 대기**다. 일반 dispatcher/51효과는 미완이다.

## 관련 docs

- `docs/2_1 스킬관리+합체시스템+자원/`
- `docs/engine/FDG_SOURCE_TRACE_SKILLS_20261020.md` §1, §3–4
- `docs/engine/DEMO11_COMPLETION_GAP_20261021.md` D14–D15

## 주의

Q/E 고정 선택 writer와 `shieldFuse`는 보호 HOLD다. 55 registry나 32 recipe의 존재를 효과 완성으로 보고하지 말고, 비용식·원본 순서·저장 owner를 임의로 합치지 않는다.
