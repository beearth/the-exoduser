소스 전수(양쪽 HTML 사망경로·발사 wrapper·updateE 인터럽트·하니스 경계·공격/AI SSOT)를 모두 읽었습니다. 아래는 **읽기 전용 호출순서 논증**이며, 어떤 검사도 재실행하지 않았고 생산 적용·실제 runtime·시각/청취 인수는 수행하지 않았습니다.

---

# ENEMY death-shot 도달성 후속검토 (2026-10-02, 읽기전용)

## 1. 소스 근거 (실제 읽은 파일·행·식별자)

**읽은 위치 (game.html / game-easy-test.html)**
- 발사 wrapper: `_emitEnemyShot` 18920/18017, `_tickEnemyShotWarnings` 18934/18030, `_spawnBossProjectile` 16107/15222, `_projectileParryClass` 16080, `_cancelProjCharge` 18975/18066, `_fireChargedProj`→`_cancelProjCharge(e)` 19004
- updateE 인터럽트 선두: `_hitStun>0 return` 37238/36041 → `stunned>0{_cancelProjCharge(e)}` 37239/36042 → `_frozen>0{_cancelProjCharge(e)}` 37266/36069 → `eShootWind` 완료 case 39180/37979
- hurtE 사망구간: `if(e.hp<=0)` 41070, **`e.alive=false` 41235/40033**, 사망탄 블록 etype29 41350/40148·etype55 41370/40168·etype59 41384/40182
- 메인 루프: `_gameFrame++` 30886(프레임당 1회) → 플레이어 근접 `hitArc` 31898·32084 → 적 루프 `for…ens` 33130 / `if(e.alive){` 33133 / `updateE` 33188 → `_tickEnemyShotWarnings` 33358 → 투사체 처리 33359+
- `_swFire()` 호출처 = **39180/37979 단 1곳** (grep 확정)

**확정 사실 (양쪽 동일 구조)**
1. `e.alive=false`(41235/40033)는 사망탄 블록(41350+/40148+)보다 **앞**이다. 따라서 etype29/55/59 사망탄은 `alive===false`로 `_emitEnemyShot`에 진입 → 새 링은 항상 `dead:!e.alive=true`로 생성(18929).
2. `_spawnBossProjectile`(16109)은 `!e.ib && !friendly && (vx||vy)`일 때만 `_emitEnemyShot` 경로. etype29/55/59 사망탄은 이동·비friendly·비보스 → 링/예고 경로 사용. ✔
3. `_emitEnemyShot`의 링 병합 `find`(18926/18022)는 `owner·frame·world·el·blackBean(·본편 parryClass)`만 비교하고 **`dead`는 비교하지 않는다.**
4. `_gameFrame`은 `update()` 1회당 1증가(30886). 근접 처치는 적 루프 **이전**(31898~32084), 투사체 처치는 적 루프·`_tickEnemyShotWarnings` **이후**(33359+). 모두 같은 프레임이면 동일 `_gameFrame`.
5. 적 루프는 `if(e.alive)`(33133) 안에서만 updateE(33188)를 돌린다 → **죽은 적은 AI·`_swFire` 미실행.**
6. eShootWind 불변식(39180/37979): `st2<=0`가 되는 즉시 같은 updateE 안에서 `_swFire()` 실행 후 `_swChargeEl=null; s='idle'`. ⇒ **updateE 바깥에서 `s==='eShootWind'`인 적은 항상 `st2>0`.**

### 실제 caller 대조표 (TCB-03/04)

| 항목 | TCB-03 사망탄(etype29/55/59) | TCB-04 즉시발사 |
|---|---|---|
| 실제 caller | hurtE 사망블록 → `_spawnBossProjectile` → `_emitEnemyShot` | `_swFire()` (39180/37979 단일) |
| etype | 29·55·59 (비보스 필드몹) | eShootWind 쓰는 몹 전반 |
| alive 변경 시점 | 41235/40033 (사망탄보다 **앞**) → 진입 시 `alive=false` | 호출 시 `alive=true` (alive 블록 내부) |
| frame | `_gameFrame=N` (처치가 같은 update면 동일 N) | N |
| world | `ens` | `ens` |
| el | 29:EL.P/EL.I, 55:EL.P, 59:EL.P/e.el | `props.el===e._swChargeEl` |
| blackBean | 샷별 `_iBK` 난수 true/false | `!props.blackBean` (조건상 false) |
| parryClass(16080) | bk→magic / EL.P비bk→physical / EL.I·D·L→magic | — |
| 현재 분기 결과 | 새 링 `dead=true`로 생성 | 즉시 spawnProj(60f 예고 없음) |

---

## 2. 도달경로 vs 합성전용 상태 판정

### TCB-04 (사망탄 즉시 경로 오인) — **합성전용(도달 불가)**
즉시발사 조건 `e.s==='eShootWind' && e.st2<=0 && _swChargeEl===props.el && !blackBean`(18923/18020)을 충족하는 **유일한 실제 caller는 `_swFire`**이고, `_swFire`는 39180/37979 한 곳(적 alive 블록 내부)에서만 호출된다. 불변식(§1-6)에 의해 updateE 밖에서 `s==='eShootWind'`인 적은 `st2>0`이므로, hurtE 사망탄이 `_emitEnemyShot`에 들어올 때 `st2<=0` 분기는 **거짓** → 항상 링(60f 예고) 경로로 간다. 하니스는 `enemy({alive:false,s:'eShootWind',st2:0,_swChargeEl:0})`를 **직접 구성**해 이 불변식을 우회했다. 즉 기존76의 "사망시 완료 eShootWind 잔류 1발"은 **실행으로만 재현된 합성 상태**이며 실제 호출순서로는 생성되지 않는다.

### TCB-03 (생전 예약/사망탄 혼합) — **도달 가능(협소)**, 단 트리거 빈도는 논리 반례 후보
`find`가 `dead`를 무시(§1-3)하므로, 같은 `_gameFrame`에 `owner·el·blackBean·parryClass`가 일치하는 **생전 링(dead=false)**이 있으면 사망탄이 그 링에 흡수된다. 호출순서상:
- **근접 처치**: 처치가 적 루프 이전(31898~) → 그 프레임 그 적의 updateE는 skip(죽음) → 동일프레임 선행 생전링 없음 ⇒ **TCB-03 미발생**.
- **투사체/루프후 hurtE 처치**: 적 updateE(33188)가 살아서 생전 이동탄 링(dead=false, frame=N)을 만든 뒤, 33359+ 투사체 충돌이 같은 적을 처치(사망탄, frame=N) ⇒ `find` 병합 → 다음 프레임 `dead=false && !alive`로 **둘 다 취소(사망버스트 일부 유실)** ⇒ **TCB-03 발생**.

즉 **구조적 병합은 소스에서 확정**이다. 다만 "그 적(29/55/59)이 사망 프레임 updateE에서 사망탄과 동일 `el/blackBean/parryClass`의 이동 링탄을 실제로 발사하면서 동시에 투사체로 죽는" 동시성은 각 etype AI 발사상태를 실행 추적하지 않았으므로 **빈도는 논리 반례 후보**로 표시한다(비실행).

---

## 3. 12라인 후보: 필요성·부작용·채택/보류 권고

| ID | 한글명 | 조건(실제 도달성) | 현재 분기 | 영향 | 기대행동 | 권고 |
|---|---|---|---|---|---|---|
| TCB-01 | 특수예고 스턴/빙결 취소 | **도달 가능**: 사격몹이 eShootWind 중 스턴/빙결. updateE 37239/37266이 `_cancelProjCharge`로 일반차징만 지우고 `_swFire/_swChargeEl/s`는 보존 → 해제 후 _swFire 재실행 | 특수예고 **일시정지 후 재개** | 상태이상이 특수탄을 **취소하지 못함** (문서 "스턴/빙결만 취소"와 불일치) | **채택 후보(중)** — 단 enemy 밸런스 변경(스턴이 특수탄 완전취소)이라 QA 필요 |
| TCB-02 | 피격경직 선행 반환 | **도달 가능하나 경미**: `_hitStun>0`(비보스 idle에서만 set, 40996) + 동시 stunned/frozen 시 37238 return이 cancel을 건너뜀 | 취소 **수 프레임 지연**(경직 해제 후 취소). 그 사이 차징은 발사도 안 함 | 차징 링이 수 프레임 잔류(시각). 발사 유출 없음 | **보류/축소** — 1프레임대 지연, 실질 피해 미미 |
| TCB-03 | 생전예약/사망탄 혼합 | **도달 가능(협소, 투사체 처치 한정)** | `find`가 dead 무시 → 사망탄이 생전링에 흡수 → 둘 다 취소 | 특정 동시성에서 사망버스트 중 **일치 속성 샷 부분 유실** | 사망탄을 별도 dead 링으로 분리해 **의도된 사망버스트 완주** | **채택 후보(저우선)** — find에 `w.dead===!e.alive` 1줄, 저위험·정합 개선 |
| TCB-04 | 사망탄 즉시 경로 오인 | **도달 불가(합성전용)** | 불변식상 사망탄은 항상 `st2>0` → 링 경로 | 실게임 영향 없음 | — | **보류** — 방어적 불변식 어서션일 뿐, 재현 가능한 결함 아님. `e.alive&&` 추가는 무해하나 "버그수정"으로 기록 금지 |

**공통 설계 보존 확인**: 후보의 `_cancelProjCharge(e,interrupt)`는 `interrupt===true` caller(스턴 37240/빙결 37267/신규 _hitStun 분기)만 특수예고를 정리하고, 정상완료 caller `_fireChargedProj`(19004, 인수 없음)는 특수예고를 보존한다 → **"정상 eShootWind 완료" 회귀 없음**(기존76 회귀 테스트와 정합). 돌진 커밋(eChargeWind/eCharge)·Q전용 magic 패링(blackBean→magic, 16085)·발사 수치는 후보가 건드리지 않는다(본문 불변).

**요약 권고**: TCB-04는 **보류(합성전용)**, TCB-02는 **축소/보류(경미)**. 실효 있는 후보는 TCB-01(문서 정합·중, QA 필요)과 TCB-03(저위험·저우선)뿐이다. 즉 12라인 전체를 "결함 수정"으로 인수하기보다, **TCB-03 find 1줄 + (정책승인 시) TCB-01 interrupt 분기**로 범위를 좁히는 것을 제안한다.

---

## 4. docs 정정 문안 (총괄 생산 인수와 동시 반영 제안)

- `docs/8.0몬스터디자인/몬스터_공격시스템.md` 352·673 / `docs/9적ai패턴디자인/9_적AI패턴디자인.md` 319:
  > "사망탄: 요청 시 이미 죽은 소유자는 사망 위치 링 60f 후 방출. **사망탄은 hurtE에서 `alive=false`(41235/40033) 이후 블록(41350+/40148+)에서 발사되므로 링 `dead=true`로 생성된다. 단 생전 동일프레임 예약(dead=false)과 `owner·frame·world·el·blackBean(·parryClass)`가 일치하면 현행 `find`가 dead를 비교하지 않아 같은 링에 흡수되어 함께 취소될 수 있다(투사체/루프후 처치 한정; 근접 처치는 미발생).**"
- 같은 문서 eShootWind 즉시발사 항목:
  > "**불변식: `st2<=0`는 같은 updateE(39180/37979)에서 `_swFire` 실행 즉시 `s='idle'·_swChargeEl=null`로 소진된다. 따라서 updateE 밖(hurtE 사망탄 포함)에서는 `s==='eShootWind'`이면 `st2>0`이며, 사망 소유자가 즉시발사(60f 우회)로 들어오는 경로는 존재하지 않는다.**" (TCB-04를 "합성전용/도달불가"로 명시)
- `docs/9적ai패턴디자인/ENEMY_AI_TEAM_MASTER.md` 244: `stunned/_hitStun/_frozen` 일괄 "예고 취소" 문장을 경로별로 정정 — "① `_hitStun` 단독=AI 정지(취소 아님, 37238) ② `stunned/_frozen`=일반차징 `_cancelProjCharge` 취소하되 **현행은 특수 eShootWind 콜백은 보존(일시정지 후 재개)** ③ 사망탄은 `dead=true` 링 ④ 돌진 커밋 면제". TCB-01~04의 도달성 판정(03 도달/01 도달/02 경미/04 합성전용)을 작업대장에 기록.

---

## 5. 검수 Gate

| 단계 | 상태 / 담당 |
|---|---|
| 본 후속검토 | 완료(읽기전용). Read/Glob/Grep만 사용, Write/Edit/Bash/git쓰기/실행 0. 기존 검사 재실행·합산 0 |
| SHA 근거 | 기존 evidence 기준값 인용만: game.html `30ae8544…`, game-easy-test.html `9c7c25c1…`, task.md `62295270…`, checks.mjs `db3fd628…`. **현행 SHA 재검증은 총괄 단계** |
| 논리 반례 후보 | TCB-03의 "동일프레임 사망탄·생전링 동일속성 동시성 빈도", 각 etype(29/55/59) 사망프레임 실제 발사상태 — **비실행, 실전 QA에서 확인 필요** |
| 후보 인수 | TCB-03(find 1줄) 저위험. TCB-01(interrupt 분기)은 밸런스 변경 → 정책 승인·QA 필요. TCB-02/04는 보류 권고. 총괄 독립 재현·현행 diff 적용성 확인 대기 |
| 미수행 명시 | 생산 적용·실제 게임 루프·전체 hurtE 재진입·GPU 픽셀·시각/청취 인수 수행 안 함. 보호문서 2_3 읽기만 |

소유 산출물 추가 없음(이 채팅 stdout만 총괄이 기록). 티켓 변경 0, 사망탄·돌진 commit·Q전용 magic 패링·공격 수치 보존 확인.
