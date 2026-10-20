# DEMO11-47l — E2E 회귀 수정

기준 `codex/demo11-47k-20261021` / `855876f4e5215df8846613bce85175b62121627f`. 별도 sparse worktree. R은 읽기 전용이며 main/PC 동기화·배포를 수행하지 않는다. SHA·원격 대조·18단계·최종 수치는 외부 `_out/DEMO11-47l/DONE.txt` 및 아래 검수 표에 기록한다.

## 변경 계약

| 경로/항목 | 변경과 보존 범위 |
|---|---|
| `enemy_projectile_physical.gd` | `_ready`의 동일 `proj_phys_mouth.png` 로드를 script preload로 이동. 피해·이동·접촉·패링·수명·HP/최종사망 코드는 무수정. |
| `native_demo11_etype_a_spawn.gd`, `main.gd` | 기존 group-A 생성자 JSON과 동일 base/walk 텍스처를 MAP11 combat owner 설치 시 준비. scheduler 안의 constructor JSON 읽기를 제거. RNG/종류·순서·공식·지원 범위 불변. 미준비 상태는 거절. |
| `native_demo11_anglers.gd` | 전체 P deep copy 대신 모델이 사용하는 x/y/r/iframes/s만 재사용 scratch에 읽음. family frame/context 재사용, World 원본 clock serial 직접 읽음. opt-in 정수 계측(calls/total/max); 목록 API·ResourceLoader 추가 없음. 실제 family/Marker·AI·PC readback 경계 보존. |
| `native_world_drops.gd` | drop/pickup 음향의 resource IO 및 AudioServer bus 변경을 deferred callback으로 이동. 원래 음향 경로·프로필·gain·로컬 RNG 및 호출 순서 유지, owner 소멸 시 거절. 게임 UI 문구 변경0. |
| `test_demo11_47h_e2e.gd` | 한 hole에서25초 대기 대신 실제 hole을7초씩 방문하며35초 관측. etype1/4 실제 natural owner만 선택. 같은 공격 cone의 다른 etype0 PC HALT 때문에 적법한 target 공격을 중단하지 않도록 enemy_id 일치 검사. 선택 target 자신의 HALT는 유지. HP/alive/RNG 쓰기0. |
| auto_potion harness | 실제 iframe/CD가 끝난 뒤 사용 횟수·mats baseline 기록. 원래 addPotion 경로로 필요할 때만 재료 준비. HP의25% 실제 hurtP 요청, CD 중 추가 피해0. 실제 uses 증가·mats 감소·CD>0 확인. 피해/회복 공식을 바꾸지 않음. |
| blocked_by | bossroom_gate=`PC_fieldboss_HP_final_readback`; boss_defeat_signal/clear/demo_end/lobby_return=`bossroom_gate, PC_fieldboss_HP_final_readback, boss_source_updateE_prefix, PCI-11`; revival=`PCI-01`. 결과 row 최상위에 저장. Python 계약 검사도 잠긴 gate 이후 PASS/누락을 거절. |
| tests | focused Mac integration 및 callback probes(설치 때만 tree 순회, tick은 정수 계측), dependency 계약5건. 기존 anglers의 Main dormant 가정을47k의 production Marker 자동 바인딩 계약으로 정정. |

## 원인과 판단

1. 앵글러가 선택 target을 대체한 경로는 없다. 기존 선택은 natural-owner etype1/4로 이미 제한돼 있었다. 실제 family wake의 공유 RNG 소비가 있는 현재 실행에서 한 hole만 기다리는 검사가 취약하며, 실제 공격 telemetry의 다른 etype0 HALT까지 중단 조건으로 처리했다. 방문/선택 ID 경계만 교정한다.
2. 47k 물약 증거는 `uses_before=3`, `uses_after=3`, `mats_before=997`, `mats_after=997`, 검사 종료HP0/추가 피해13회다. 앞 단계의 실제 자동 사용 이후 CD를 기다리지 않고 추가 피해를 준 검사였다. 회복 수식 대신 검사 전제와 타이밍을 교정한다.
3. 47j 실제 sole E2E evidence의 boss_defeat_signal에는 `contract_signal_injected=true` 및 `native_demo_boss_defeated(0)` checkpoint가 있다. 뒤 clear_count1/PASS는 이 별도 consumer 계약 입력의 결과로, 실제 gate→boss 처치 경로 복구 근거가 아니다. 이 입력을 재도입하지 않으며 후행 NOT_READY를 PC 의존으로 명시한다.

## 계측 해석

47k E2E 전체 callback span max14.035ms, 예산8.333ms. 사전 focused에서 family max0.189ms, World phase max0.908ms였으나 전체38.617ms를 관측했다. callback 인접 probes에서 기존 인트로 ring 적 callback36.682ms를 관측하고 실제 투사체 `_ready`의 cold resource load를 제거했다. 변경 후 한 집중 실행은 전체5.665ms였다. 이후 별도 집중 실행의 최대20.718ms 및126.956ms도 보존한다. 후자는 Player87.282ms·펫20.315ms·World phase10.263ms 등 여러 구간에 지연이 발생했다. 외부 스케줄링/호스트 부하 가능성은 추정이며 이 수치를 삭제하거나 예산 통과로 재분류하지 않는다. family 단독 비용과 전체 callback 최대값을 혼동하지 않는다.

계측은 headless monotonic wall callback span으로 GPU·실창·PC 성능을 증명하지 않는다. 최종 E2E는 수정 후 정확히1회이며 재실행하지 않는다. 출력 전문은 외부 파일, 판정 수·성능 지표만 요약 조회한다.

## 보호 범위와 남은 일

PC 전투 이동/패링/방패/분노/hurtE/hurtP 및 readonly port 모듈, docs/2_3, 보스 최종사망·부활 무수정. 맵 비주얼 룩·조명/geometry 무수정. `EXODUSER-Godot-Native-First` 접근0, 격리 user dir만 사용. 번역 파일 변경0. Godot pgrep 확인 및 동시2개 이하. 원 gate 정책·지역80%·실제 fieldboss HP/final 및 boss source prefix 의존을 완화하지 않음. PC 인수 후 자연 처치→gate→boss→clear/로비 검증은 여전히 남는다.

## 최종 검수

**부분 완료 / 성능 목표 미달.** E2E 정확히1회: PASS12 / NOT_READY6 / FAIL0, engine ERROR0. enemy_kill·auto_potion PASS 복구. 최종 전체 physics max **14.035 → 21.343ms**, 예산8.333ms 초과. 최종 수치로 성능 완료를 주장하지 않는다. 최종 E2E 이후 제품 코드 수정/추가 E2E0.

| stage | status | blocked_by |
|---|---|---|
| isolation | PASS | — |
| new_game | PASS | — |
| character_create | PASS | — |
| intro_skip | PASS | — |
| field_MAP11 | PASS | — |
| enemy_kill | PASS | — |
| revival_interface | NOT_READY | PCI-01 |
| item_pickup | PASS | — |
| equip | PASS | — |
| auto_potion | PASS | — |
| level_up | PASS | — |
| stat_passive_invest | PASS | — |
| bossroom_gate | NOT_READY | PC_fieldboss_HP_final_readback |
| boss_defeat_signal | NOT_READY | bossroom_gate, PC_fieldboss_HP_final_readback, boss_source_updateE_prefix, PCI-11 |
| clear | NOT_READY | bossroom_gate, PC_fieldboss_HP_final_readback, boss_source_updateE_prefix, PCI-11 |
| demo_end | NOT_READY | bossroom_gate, PC_fieldboss_HP_final_readback, boss_source_updateE_prefix, PCI-11 |
| save_handoff | PASS | — |
| lobby_return | NOT_READY | bossroom_gate, PC_fieldboss_HP_final_readback, boss_source_updateE_prefix, PCI-11 |


| 관련 검사 | 판정 |
|---|---|
| final anglers (현재 production Marker 계약) | 1402 PASS / 0 FAIL / ERROR0 |
| potion | 2569 PASS / 0 FAIL / ERROR0 |
| world drops | 18 PASS / 0 FAIL / ERROR0 |
| final focused Mac | 9 PASS / 0 FAIL / ERROR0; 자연 etype1/4 실제 공격·처치 및 region count, 실제 hurtP 자동 물약 |
| physical construction/carrier | exit0 / ERROR0 |
| blocked_by 계약 | 5 PASS / 0 FAIL |
| 최초 anglers 검사 | 1402 중3실패;47k production Marker 자동 바인딩에 맞춰 legacy dormant/수동rebind/좌표 가정3건 정정 후1402/0 |
| 추가 A registered 기존 검사 | original_mkEn oracle 단계1실패/exit1/ERROR0; 통과로 보고하지 않음. 생성/전투 fixture까지 완료되지 않아 관련 전체 회귀 완료 아님. |
| 기존47k gate focused | checks10/0이나 SCRIPT ERROR1. 변경 source가 stack에 포함된 오류0, 원인은 별도 미해결로 남김. 최종 실제 E2E gate 검사 ERROR0과 구분. |

최종 performance 및 추가 기존 fixture 실패가 남아 있으므로 사용자 목표 전체 완료가 아니다. PC 미인수 범위와 별개로 전체21.343ms의 재현·세부원인 분리는 후속 단위가 필요하다. 이를 단순 OS 부하 또는 PC 코드 문제로 확정하지 않는다. raw 기록은 외부 파일에 전부 보존한다.
