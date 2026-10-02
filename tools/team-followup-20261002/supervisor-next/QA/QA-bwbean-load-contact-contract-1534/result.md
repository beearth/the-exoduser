# QA-bwbean-load-contact-contract-1534 (결과)

taskID: **CO-QA-1534-loaded-projectile-collision-contract**. 완료ID = actual JSONL end(별도 UUID 아님). 전달/Read ≠ source 작업. **첫 actual source tool: `python3`(STATE.json capacity 읽기) → `rg`/`sed`(game.html)**. Git 0. `productionApplied=false`, fixture ≠ playable.

## 0. capacity 대조 (내 row만)
- 지정 STATE.json epoch **`root-73620278-claude8-1530`**, `changesAtRoundStart: 72`, **QA newFileCredit = 1**(배정1/사용0). → 본 단일 산출(result.md 1개) 저장 가능. 다른 role credit·기존 제출 원문 미사용.

## 1. 대상 탄종 명시: **bwBean (흰색볼, 적 표준 물리탄)**
임의 궤적을 자연피격으로 선언하지 않음 — **기하 접촉+recycle 계약**만 원문으로 대조(탄 생성/궤적 재현 아님).

## 2. whole caller 연결 (게임 SHA `e462f2345682856d24bb416a17aec763281a8dceb02f21af565db189992353ea`)
투사체 update 루프는 `update()`(L30895) 본문(L33427~L33850, **load 가드 0건**) 안에서 돈다. bwBean 접촉 분기 **L33745**:
```
if(p.bwBean&&!_pHit&&_pDist<_normalR&&(P.iframes<=0||(_sbActive&&_pDist<_rbDeflR))&&!P._ioActive){
  if(_sbActive&&_pDist<_rbDeflR){ … 패링 반사 … projs[pw++]=p;_pHit=true;continue; }   // 반사 생존(friendly)
  else{ _hurtProjectilePlayer(p,~~(p.dmg*1.3),{dtype:'magic',projHit:true}); … _pHit=true; }  // 피격
}
```
- `_hurtProjectilePlayer`(L16167)→`hurtP`(L41991) 첫 줄 `if(G._bossLoadPhase>0)return` — **load 중 피해 동결**.
- bwBean else(비패링) 분기는 `_pHit=true`를 **hurtP 결과와 무관하게** 세팅(순차문). `continue` 없이 루프 말미로 흘러 `_pHit` 생존자 비압축 → **recycle(소멸)**. (반사 분기만 `projs[pw++]=p;continue`로 생존. 생존자 압축은 루프 말미 `projs[pw++]=p`, hit 소멸은 공통 recycle 계열 L33651/L33782 등 `_pHit→_recycleProj`.)

## 3. load접촉 vs 정상접촉 대조 (핵심 계약)
| 조건 | 정상(phase0) | load(phase>0) |
|---|---|---|
| iframes>0 접촉 | 접촉조건 false(`P.iframes<=0` 불충족·패링 아님) → `_pHit` 미세팅 → **통과/생존**(표준 i-frame 패스스루) | **동일 통과/생존** |
| iframes<=0 접촉(비패링) | `_hurtProjectilePlayer`로 **피해 적용** + `_pHit=true` → **recycle(소멸)** | hurtP **동결(피해 0)** + `_pHit=true` → **recycle(소멸)** |
| 패링(shield-bash) 접촉 | 반사 friendly 생성, 생존 | 단, load 중 sBash 진입 자체가 ticker idle-강제로 차단(1418 확정) → 실질 비패링 경로 |

→ **recycle 계약은 load와 정상이 동일**: `P.iframes<=0`(취약) 게이트로 소멸이 결정되며, **hurtP 동결은 피해만 제거하고 소멸(recycle)은 제거하지 않음**. 즉 load 중 취약 상태로 접촉한 bwBean은 **피해 없이 그대로 소멸**(정상과 동일한 소멸, 피해만 0).

## 4. 1525 HOLD 좁힘 (결론)
- bwBean 표준탄은 **load로 인한 특수 persist가 없음**. 취약(iframes<=0) 접촉 시 load·정상 **동일하게 소멸** → 그 탄은 phase0로 넘어가지 않음.
- bwBean이 load를 살아남는 유일 경우 = **플레이어와 취약 상태로 접촉한 적이 없는(아직 이동 중) 탄**. 이 경우 phase0에서 **계속 이동** → phase0 "첫 프레임 즉시 피격"이 아니라 **정상 반응 시간**이 있는 접근. 따라서 bwBean 경유 phase0-frame0 즉시 피격은 **이 탄종 계약상 비성립**.
- 1525의 "load 축적→phase0 피격" HOLD은 **bwBean에 한해 소스상 해소**(소멸 계약이 iframes-게이트로 정상과 동일). 다른 탄종(bomb/redBean/homing/blackBean/mine/대형에너지)은 **별도 계약**(폭발/흡수/수명 상이) — 본 과제 범위 밖, 탄종별 재대조 필요.

## 5. 짧은 인계
- 완료 taskID: **CO-QA-1534**. 소유 path: `tools/team-followup-20261002/supervisor-next/QA/QA-bwbean-load-contact-contract-1534/result.md` (1 산출).
- pins(SHA `e462…`): bwBean 접촉 L33745 / hurtP 동결 L41991 / _hurtProjectilePlayer L16167 / 투사체 update 본문 load 가드 0(L33427~33850) / 공통 _pHit recycle L33651·whirlwind recycle L33782.
- **미확정 Gate:** ① 루프 말미 생존자 압축 vs recycle의 정확 분기 1줄(생존자 `projs[pw++]=p` 확인은 부분) ② bomb/redBean/homing/blackBean 등 타 탄종의 load 소멸 계약 ③ 미접촉 생존 탄의 phase0 궤적·실제 피격 = native 타이밍(실창 Gate 미완). fixture ≠ playable.

## 6. 경계
Changes 72 → 100 전 신규 중단 범위, **credit 1 → 본 1 산출만**(기존 제출 불변, NOFIX-소진 저장 아님 — 검증 후보+load/정상 대조 포함). Git 조회·쓰기/production/공유docs·test/타팀/game·save·UI·native/세션·resume·서버/모드·권한·auth·priority 0. 보호2_3·Q전용magic·E불가·attack ticket·맵가이드·LOCK·SSOT 유지. 실제 캐릭터/보스/맵 재실행 0. **docs rg 동기화 root 인계(쓰기 0):** "bwBean(표준탄) load 접촉 소멸 계약 = iframes-게이트, hurtP 동결은 피해만 제거·recycle 유지 → load 특수 persist 없음" → `8.1보스디자인바이블/BOSS_BATTLE_SETTINGS.md` + `4.1맵디자인+설정/MAP_RUNTIME_ARCHITECTURE.md` 소유 인계. AskUser/승인 사용자 몫.

## 다음 독립 승인 작업 (self-select, 통합 대기 없이 계속)
타 탄종 계약: **redBean(빨콩, 폭발탄)** 의 load 접촉 — `_addImpact`/`_addBoom` 폭발이 hurtP 동결과 무관히 발생·recycle되는지, 그리고 폭발 AOE가 phase0로 남는지 원문 caller로 bwBean 계약과 대조하는 작업을 메모리로 이어가겠습니다(수치/2_3/Q 변경 0, QA load-경계 범위).
