# 기검참 중 Q 즉시 전환 — 2026-09-16

## 문제와 변경

기검참 공격 상태에는 Q 전환 분기가 없었고, `wRecover`도 `st2<=0`인 회수 종료 시점에만 Q를 검사했다. 사용자의 “기검참 도중에 Q가 안 나가는데 나가게” 요청에 따라 기검참 준비·베기·회수 중 Q로 즉시 전환한다.

| 항목 | 현행 계약 |
|---|---|
| 진입 함수 | `_tryKiSlashQCancel()` |
| 적용 위치 | `game.html`, `game-easy-test.html` 공용 공격 상태 switch 분기 첫머리 |
| 적용 스킬 | `P.activeLMBSk==='kiSlash'`, 두 캐릭터 공통 |
| 취소 가능 상태 | `wWindup`, `wSwing`, `wRecover` |
| 입력 | 기존 `isAct('parry')` 사용. 재설정한 Q 바인딩·보조 바인딩·연습 입력 제한을 따름 |
| 생존 | `P.hp>0`일 때만 전환 |
| 일반 Q 조건 | `_sbCd<=0` 또는 미설정, MP≥10 |
| 일반 Q 비용·상태 | MP10을1회 소비하고 `sBlock`, st2=999 |
| 초기화 | `_sbParryT=20`, `_sbHoldT=0`, `_sbReleaseR=0`, `parryT=0`, `_qDetonateFired=false` |
| 쿨다운 | `floor(30×(1+_eqAffix('shieldCdRed')))` |
| 진입 시각 | `_sbBurst` 중심=P.x/P.y, r=P.r+5, maxR=기폭팔이면150+(Lv−1)×15/아니면90, spd=8. 기존 보호막 소리·루프 시작 |
| 평화의보호 | `_qIsPeaceShield()`이면 MP>0, `_sbCd<=0` 조건으로 기존 `_enterPeaceShield()` 호출. 일반 Q의 MP10 소비를 적용하지 않음 |
| 얼음보주 호환 | `_qIsIceOrb()`는 현행 false. 향후 true인 경우 기존 `_qDispatchIceOrb()` 결과 사용 |
| 성공 시 제어 흐름 | switch를 즉시 break하여 같은 업데이트에 남은 기검참 근접 판정·회수 처리를 실행하지 않음. 이후 공통 업데이트와 투사체 처리는 계속됨 |
| 실패 시 | Q를 누르지 않았거나 MP 부족·쿨다운이면 공격 상태·비용 유지, 기존 공격 계속 |
| 이미 발사한 검기 | 제거·재발사·환불하지 않음. 아직 실행하지 않은 몸 근처 기본공격 판정은 취소 |
| 적용 제외 | E의 sBash/sRecover, 다른 LMB 스킬, 기절·사망 등 다른 상태 |
| 표준 Q 진입점 | 기존5+기검참 취소1=6. 전 경로에서 홀드 충전·해제 반경·기폭1회 잠금 초기화 |

Q 자체의 패링/해제/반사/피해 규칙은 기존대로이며 확정된 `2_3` 문서는 수정하지 않는다. 공격 취소는 이미 소비한 기검참 자원을 환불하지 않는다.

## 검증

`test/kiSlashQCancel.test.js`는 양쪽 게임 진입점의 실제 switch 진입부를 실행한다. 준비/베기/회수 즉시 전환, 마나1회 소비, 쿨다운·마나 부족·Q 해제, 평화의보호, E/다른 스킬 제외를 검사한다. 기존 Q 홀드·해제·기폭1회·탄 분류·시각 피드백 검사도 함께 실행한다.

- 관련 검사28개 통과. 기존 기폭1회 테스트는 연습 중 자동기폭을 막는 추가 조건도 허용하면서 기폭 잠금 조건을 검사한다.
- 별도 테스트 슬롯에서 Q 키 상태를 설정하고 실제 `update()`를 실행하여 wWindup/wSwing/wRecover 모두 같은 틱에 sBlock, 눌림 패링20틱으로 전환함을 확인했다. 연습의 입력 제한만 검사 중 임시 해제하고 복구했다. 연습 모드의 자원 자동 보충이 있어 비용은 독립 회귀 검사에서 검증했다.


### ROOT-CH1-LMB-RECOVERY-RIG-20261007 — 정상 LMB에서 승계한 회수 본체 표시

기존 양판 Q 취소의 조건·MP·쿨다운·상태·패링/반사 규칙은 그대로다. 본편에만 추가된 회수 rig display owner는 실제 평화의보호/일반Q 성공 직전에 null로 폐기한다. Q 미입력/마나·쿨다운 실패에는 표시 owner를 지우지 않는다. Easy에 회수 rig를 채택했다는 뜻은 아니다.

정확한 owner phase/정상 전이 승계/특수·acceptedQ revoke/atk3 gate/회수 counter는 `docs/4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md`의 동일 completion 절을 따른다.

이번 source523a recovery CPU는 실제 main 함수/전이/Q 취소와 통제 animator·side-effect port를 소비한 최초1회6그룹42복합조건 PASS42/FAIL0/미도달0/setup0/exit0다. finisher는 revoke 전이 prefix만 실행했고 실제 PNG/renderer/GPU/save는0이다. 별도 신규 native는 같은 최종 source의 실제 본편 Chrome/context/page 각1회,3조건 PASS3/FAIL0/미도달0/exit0다. 실제 LMB→wRecover/atk3 f6→7→8·phase6.5/9→7.5/9→8.5/9·owner recovery·609정점·heightLocal32·alpha>16 579픽셀·GL0와 실제 idle 복귀/owner null을 관측했다. source8/같은 map exact, pageerror/HTTP실패0, POST /api/mats1은 서버 도달 전 차단, 사용자 save 조작0·owned browser 닫힘이다. CPU42와 native3 및 기존 carry25/strike4/과거 FAIL·한정 결과를 합산하거나 재실행하지 않는다. root PNG2 직접판독은 현 east pose의 회수 몸 표시/대기 복귀만 한정 인수했다. 검기FX 몸·발 부근 가림, 회색 평면 baked 지면/배경 확대 흐림이 남으므로 VISUAL VERDICT: RETOUCH다. 해부학 발/8방향/실DS ghost/높이/전체 native6/청취/실보상save/A급은 미인수다. 근거: 외부 recovery/validation-receipt.json2702B/4fc6af74bf6ffae5140d9e1648937093cf2741735f994baaf7ab82f79daea9c2, cpu-receipt.json9965B/50b6e6e80c21ef3595cc6ab9afec37e07e9db3831eef9352c9bebb47a47723c6, native-result.json102950B/26a12f81168296c6b9b5130a69180c46f17a0b78f3e1083aa6765b97b84d09de, visual-verdict.json2514B/c78360ecf19835709c4f87d3d683c77d88b2632d3b93c9b44507ac2398a3ec91.
