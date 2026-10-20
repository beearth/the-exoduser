# DEMO11 — Q·E 패링·방패 context pack

## 원본 계약

| R 행 | 핵심 |
|---|---|
| 16911 이후 | Q hold/방패 상태와 자연 입장 분기. |
| 38470 이후 | Q/E의 실제 패링·피해·반사 경로. |
| 43415 이후 | 보스 접촉을 포함한 전투 consumer. |
| 27902–27971 | 장비·어픽스 후 `applyStats/recalcSt`; Q/E 비용 공식을 이 블록에서 고치지 않는다. |

블랙빈(`blackBean`)은 `parryClass='magic'`이며 **Q(sBlock/해제/peaceShield)만** 성공 패링해 블루콩 유도반사로 바꾼다. E(sBash)에 블랙빈 패링을 부여하면 안 된다. Q/E의 비용·포이즈·실드 충전/기폭/peaceShield는 보호 계약이다.

## 호출 순서

`Q/E 입력 → lesson/active-skill/state gate → 자원/쿨다운 확인 → block/bash state → hurtP/hurtE·투사체 반응 → 반사/포이즈/실드·SFX/HUD`이다. release는 hold state에서만 처리한다. E 물리 5종, Q hold·자연 블랙빈 입장, 보스 접촉은 부분 carrier 반사와 별도의 경계다.

## Godot origin/main 대응

`main.gd:1187–1327,1692–1846`, `player.gd:479–523,789–792,952–975`와 Q adapter/`native_combat_qe`가 현재 허용 carrier 반사 일부를 연결한다. gap D12는 좁은 완료이나 `full_doparry:false/full_e_parity:false`; D13은 **통합 결정 대기**다. `player.gd:548–550`은 peaceShield full runtime이 아직 채택되지 않았음을 명시한다.

## 관련 docs

- `docs/2_3 돌진+패링+방패시스템/` — 수정 금지
- `docs/engine/DEMO11_COMPLETION_GAP_20261021.md` D12–D13
- `docs/engine/FDG_SOURCE_TRACE_REVIVE_SHIELD_20261020.md` §1
- `docs/engine/FDG_SOURCE_TRACE_ITEMS_20261020.md` C25

## 주의

PC 전투 담당의 보호 경로다. 새 Godot writer는 정확한 owner 승인 전 추가하지 말고, 기존 service 재사용 여부만 검토한다. E의 블랙빈 허용, 비용/포이즈 간략화, 실드 저장 필드 추가는 금지다.
