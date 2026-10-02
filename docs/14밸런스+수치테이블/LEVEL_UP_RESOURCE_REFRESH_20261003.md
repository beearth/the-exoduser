# 레벨업·예약 패시브 투자 자원 갱신 (2026-10-03 source7)

레벨이 올라도 최대 자원이 이전 레벨에 남던 두 HTML의 `addExp` 경로를 수정했다. 본편 예약 자동 투자에서는 `applyStats` 중간 최대치 clamp가 강인·마력그릇의 현재 HP/MP를 줄이던 문제도 수정했다. 기존 최대치 공식·SP/AP 지급·비용·20% 회복량·쉴드 회복 없음은 유지한다.

| 경계 | 현행 처리 | 적용 위치 |
|---|---|---|
| 레벨 상승 없음 | 기존 경험치 처리 후 반환. 자원 재계산·회복·레벨업 저장/소리 없음 | 양판 `addExp`, `lvd=0` |
| 데모 상한 | 본편100 / easy는 `_BIC?100:500`. 해당 상한이면 기존 경험치 상한 적용 후 반환하고 새 회복 없음. 이번 신규100 상한 검수는 `_BIC=true` 합성 상태 | `_DEMO_MODE`, `_DEMO_LV_CAP` |
| 레벨 상승 | 레벨 루프 종료 → 본편 예약 투자 → 현재 자원 보관 → `applyStats()` → 최종 최대치로 보관 자원 복원 → 기존 회복 | 양판 `addExp`; easy에는 예약 소비자 없음 |
| 현재 자원 보관 | `_lvHP=P.hp`, `_lvMP=P.mp`, `_lvST=P.st`, `_lvShield=P.shield` | `addExp`의 재계산 직전 |
| 재계산 후 복원 | 각각 `min(P.mhp,_lvHP)`, `min(P.mmp,_lvMP)`, `min(P.mst,_lvST)`, `min(P.mshield,_lvShield)` | 최종 최대치 기준, 비율 충전 없음 |
| 기존 회복 | HP/ST/MP 각각 `min(최대치, 현재치+~~(최대치*.2))` | 레벨이 오른 `addExp` 호출당 1회. 여러 레벨을 한 번에 올려도 1회 |
| 쉴드 | 최종 최대치까지 기존 현재치만 보존. 레벨업·예약 투자로 추가 충전 없음 | `P.shield/P.mshield` |
| 예약 투자 | 기존 FIFO·단계 비용·AP 차감·상한 적용 후, 실제 투자한 경우만 재계산 | 본편 `_processPassiveQueue` |
| 예약 자원 보관 | `_pqHP`, `_pqMP`, `_pqST`, `_pqShield`에 재계산 전 현재치 저장, 각각 최종 최대치의 `min`으로 복원 | 본편 투자 분기 내부. 회복 없음 |
| 성장 보상 | SP +3/레벨, 짝수 레벨 AP +1, 기존 해금·소리·VFX·`dbSaveForce()` | 기존 순서와 횟수 유지 |

| 검수 대조 | 수정 전 | 수정 후 |
|---|---|---|
| 기존 강인1·마력그릇1, Lv5→6 완충 | 최대 HP/MP `612/156`에 남음. 단순 `applyStats` 추가 후보는 현재치 `441/140`으로 감소하여 폐기 | 최종 최대치와 HP/MP `618/159`; 쉴드 현재110 유지/최대115 |
| 같은 성장, 손상 HP/MP `200/40` | 이전 최대치로 회복 `322/71` | 새 최대치로 기존20% 회복 `323/71` |
| 예약 강인1 투자, 기존 마력그릇1 | 현재 MP `156→106` 중간 clamp | MP156 유지; HP 최대300 증가분을 무료 충전하지 않음 |
| 예약 마력그릇1 투자, 기존 강인1 | 현재 HP `612→312` 중간 clamp | HP612 유지; MP 최대50 증가분을 무료 충전하지 않음 |
| 예약+레벨 결합, 손상 `200/40/20/11` | AP·큐는 정상 소비하지만 완충 자원 손실 가능 | 최종 최대치 `612/156/102/110`, 기존 회복 후 `322/71/40/11` |

| 입력·반영 핀 | 값 |
|---|---|
| source6 본편 | 4028973B / `1e4591caea739887ce749492db4ea72547292f583fba1f8e4fcafe88071f8bb8` |
| source7 본편 | 4029344B / `e255bfd27047715105d1dda90bb73f7ed42653391380dcda788dbd245374dae0` |
| source6 easy | 3906420B / `17f490d5d5e38b0fac39085578115acd4b35e48263e84dd542b9a2f298e3ccf5` |
| source7 easy | 3906611B / `11e0d9a96b4e4412d719787c6aaf353a478b57bdd921da66efcbc6b3de6d5a67` |
| `addExp` 함수 후보 | 본편 `2720de2223dcdab28ddd7df93d0d31983b6327d55e332fbe93a67660345fbb5e` / easy `a850e10e8ab4f8ed9bd3449e3c841e50b0ba4e8edb1a42857df534af8aa48b1b` |
| 예약 함수 후보 | `4f9ece87e509192d5cbd73d2c854d6aa929e8b88e5b663b3f6ebcd5e05fc6226` |
| 최소 범위 | 본편+371B/easy+191B, 삽입3곳 역변환 후 source6 전체 byte 일치. 공용 `applyStats` 변경0 |

검수: BALANCE1756의 자원 보존12대조·1812 예약8대조·1818 실제 결합8대조를 인수했다. 이 횟수는 새 검사나 실플레이 건수로 중복 계산하지 않는다. 생산 함수 후보 SHA와 whole inline12실행 script+2importmap JSON 구문을 대조했다. 신규 지속 회귀 `test/levelUpResourceRefreshAcceptance.test.cjs` 최종17/17 PASS(양판7×2+본편 큐3, Node24.15). 현재 생산 함수·장비/근성 계산과 전체 stat-panel 모듈의 실제 예약 단계 비용을 읽어 실행했다. 첫 실행14PASS/3오류는 VM 배열 realm/prototype 비교의 검사 오류였으며, 기록 배열만 host 배열로 정규화한 뒤 1회 수리 재실행했다. 생산 계산 실패나 코드 수리로 계산하지 않는다. 최종 실행 영수증은 `tmp/mac-migration-runtime/continued-review-20261003/root-level-resource-source7/`에 보존한다.

범위 밖: 일반 성장창 직접 `applyStats` 호출 전체를 수정한 것이 아니다. 신규 검사 상태는 합성이며 장비 crystals[]이다. 양수 어픽스/암묵효과·실제 XP 발생 경로·전체 성장창 renderer는 미검수다. UI/VFX/음향/저장 leaf는 기록 대역이며 사용자 저장·실제 UI 예약·재실행·source7 Mac 앱 실플레이는 별도 검수다. 현재 실행 앱은 source6/3387이며 source7를 실행 중 앱에 덮어쓰지 않았다. [source6 실플레이 부분 인수](../13출시·마케팅/MAC_CH1_SOURCE6_NATIVE_PARTIAL_20261003.md).
