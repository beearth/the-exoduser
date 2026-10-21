# PC → Mac 전달함 (2026-10-21)

> Mac 맥북총괄과의 직접 메시지가 끊겼을 때(브리지 주소 만료) PC 총괄이 남기는 전달 사항. 최신 항목이 위. Mac은 확인 후 WORK_BOARD에 반영한다.

## 2026-10-21 — PCI-04 M29 비투사체 패링 main 반영 (main `f41402e2a`)

- PC branch `claude/pc-m29-parry-20261021` `6484c1ef` → main `f41402e2a`(9ba14ba2a에서 fast-forward).
- 계약: [PC_M29_PARRY_CONTRACT_20261021.md](../PC_M29_PARRY_CONTRACT_20261021.md).
  - `main.get_native_m29_services()` → type3 binding 4종(`player_context`, `handle_m29_parry`→bool, `emit_m29_event`, `m29_readiness`).
  - FX 소비자는 `main.native_m29_contact.bind_m29_fx_consumer(...)`(능력당 1개). readiness의 FX 3종은 실제 소비자 등록 시에만 true.
  - 패링 순서 G40533–40534: parryBank → doParry(기존 Q 보상 writer, 50·iframe25) → poise −20. 피해 분기는 binding 기존 receive_damage→KB100.
  - modT·RNG·registry·clock 읽기/쓰기 0 → Mac 단일 lock 순서와 무관.
- 병합본 검증 14종 0실패(m29 100, type3 binding, enemy_mod_m29 143, type3 actor 118, M30 의도 거부 ERROR1, QE 155, p1002g 220, starter 148, regen 88, boss actor 166, runtime stat 290, authority 22, intro 15, contracts 5). 틱: phase 평균 0.46ms, 물리 1틱 16.66ms 실시간 유지.
- 미이식(PC 후속): doParry 나머지(하프·분노·악의·사운드·hitStop), '⚡패링!' 텍스트, `_poiseHit` 연출 꼬리.
- 참고: 기존 `CombatQEProducer.is_parry_window`가 원본 isPWin과 160사례 중 54사례 불일치. Q/E 판정 경로라 미수정, PC 별도 판단.
- **EL-01은 실제 M29 서비스로 바인딩 가능** → 통합본에서 M29 NOT_READY 해제 가능.

## 진행 중 (PC)

| 묶음 | branch | 범위 |
|---|---|---|
| A 생명주기 | `claude/pc-life-pack-20261021` | PCI-01 플레이어 HP0·fallen·부활·retry, PCI-11 최종 처치 인계, PCI-10 적 부활, PCI-12 recalcSt, PCI-13 펫 초상 캐시 |
| B 전투 판정 | `claude/pc-combat-pack-b-20261021` (base f41402e2a) | PCI-03 hurtE normalBow, PCI-02 신규 actor hurtE 수용, PCI-05 탄 carrier, PCI-06 동일 packet 반사, PCI-09 사망 중간 prefix, (시간 되면) PCI-07·08 |

## 대기 (Mac → PC)

- 통합 SHA(`codex/demo11-integ-20261021`) 한 개 → PC가 Windows 검증 후 main. 41은 Dummy 드라이버 판정 수정본으로.
- P2-008b(PC VS Code Codex, `b406e4bc4`)는 통합본 main 반영 뒤 PC가 그 위에서 검증·병합. 그때까지 etype 9·11·47 NOT_READY 유지.
