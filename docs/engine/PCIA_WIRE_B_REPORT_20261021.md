# PCIA-WIRE-b — INTEG-5b 병합과 자연 부활 관측

기준 PCIA-WIRE `bb69e290`, INTEG-5b `6833f71f0690f64ac3cfd56ed20eefa70530855c`를 merge로 통합했다. CHANGELOG 양쪽 항목 보존. E2E의 처치 직후 home 조기 복귀 제거와 PCI-01 consumer 관측을 모두 유지했다.

| 하네스 변경 | 값·경계 |
|---|---|
| 자연 피격 관측 | 최대 45,000ms, 자연 생성 적의 24px 옆에 테스트 소유 플레이어 위치만 배치. AI 공격과 실제 hurtP 소비를 기다림 |
| 생명주기 관측 | HP 최저값, fallen_enter APPLIED, countdown 30프레임 간격 읽기, revive_resolve 또는 final_death APPLIED 모두 관측해야 PASS |
| 분기 대기 | HP0/fallen 진입 뒤 최대 15,000ms. HP·iframe·RNG·생명 신호 직접 주입 없음 |
| 픽업 유지 | 관측 detour 후 처치 위치로 복귀하여 INTEG-5b 실제 R 픽업 유지 |
| 보호 범위 | PC 전투/계약 구현, 맵 비주얼, UI 문구, 번역 목록 변경 없음 |

검수 결과와 E2E 18단계는 아래와 같다. 과거 PCIA_WIRE_REPORT/INTEG5B_VALIDATION의 표는 당시 관측으로 보존한다. 전체 E2E PASS와 PC 동기화는 별도이며 이 작업으로 추정하지 않는다.

## 검수 1회씩

| 검수 | 결과 |
|---|---|
| import | exit 0, engine errors 0, PASS |
| 39 | exit 0, engine errors 0, PASS |
| player_life | exit 0, engine errors 0, PASS |
| e2e | exit 0, engine errors 0 (유효 진단, 전체 E2E PASS 아님) |

자연 피격 HP 546.0 → 0.0, HP0 31199ms, 전체 관측 36134ms. fallen_enter / final_death APPLIED. countdown samples 10, final remaining 0.0.

E2E `--demo11-storage=on`: PASS10 / NOT_READY8 / FAIL0, contract validation0, continuous_E2E=false. 자연 최종사망 후 G.on=false/HP0이므로 픽업·장착·자동물약은 이번 실행에서 NOT_READY. INTEG-5b 픽업 수정은 보존됐으나 이번 실행으로 생존 상태 픽업을 재확인한 것은 아니다. 부활 성공 분기는 이번 RNG 결과에 없으며 주입·재시도하지 않았다.

| # | 단계 | 결과 | 사유 |
|---|---|---|---|
| 1 | isolation | PASS | actual owner readback |
| 2 | new_game | PASS | actual owner readback |
| 3 | character_create | PASS | actual owner readback |
| 4 | intro_skip | PASS | actual owner readback |
| 5 | field_MAP11 | PASS | actual owner readback |
| 6 | enemy_kill | PASS | actual owner readback |
| 7 | revival_interface | PASS | actual owner readback |
| 8 | item_pickup | NOT_READY | actual R pickup did not admit item |
| 9 | equip | NOT_READY | item_not_in_actual_bag |
| 10 | auto_potion | NOT_READY | real hurtP/iframe/threshold/clock did not produce auto-potion |
| 11 | level_up | PASS | actual owner readback |
| 12 | stat_passive_invest | PASS | actual owner readback |
| 13 | bossroom_gate | NOT_READY | actual MAP11 gate/arena prerequisites not satisfied |
| 14 | boss_defeat_signal | NOT_READY | PCI-11_missing_actual_boss_damage_and_final_death_owner |
| 15 | clear | NOT_READY | clear consumer did not accept contract |
| 16 | demo_end | NOT_READY | next/end route not admitted |
| 17 | save_handoff | PASS | actual owner readback |
| 18 | lobby_return | NOT_READY | actual lobby navigation not completed |

검수는 headless이며 화면·음향 품질 판정은 하지 않았다. 격리 userdir만 사용했고 원본 override.cfg는 검수 후 byte 복원했다. Godot PID81277 보존, 동시 최대2개. 원본 R tracked INDEX/WORK/HEAD/branch 보존.
