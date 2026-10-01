# Mac SKILL — 조준-확정 자원 재검사 다음 건 결과 (SKILL-20261002-AIM-RESOURCE-NEXT)

세션 `203377cc-64c4-47ea-af27-95b66ae829fa` 연속 · HEAD `7cb8485de65b2afdf6d3da726aab44bb33c7516f`

## 수신·착수·완료 (UTC)

- **16:10 수신** `aim-resource-next-task.md`. **16:11 첫 Read**: `_ms/_mm/_ts` 확정 블록·aim-start 게이트·SSOT·`skillStackConfirmGate.test.js` 관례.
- **중복 확인**: `aim-resource-next-{receipt,result,*.mjs,*.patch}` 부재(task.md만) → 신규. iceStorm/fireBoneWall/hellRay 이미 수정 → 재패치 안 함.
- **16:16 첫 코드 Edit / 16:22 완료**: RED+GREEN 테스트 **23/23 PASS**, 양쪽 patch dry-run **APPLIES CLEAN**.

## 후보 3개 조사 → 1개 선정

| 스킬 | 확정 자원 재검사 | 판정 |
|---|---|---|
| `_msAiming` maliceStorm | 기본 경로는 MP/스택 비용 없음(쿨다운 `P._msCd`만, 성공 후 설정). 합체(boneStorm/elecRepent)는 확정에서 MP50 재검사(`game.html:35060`), 악의12는 `Math.max` 클램프 | 결함 아님(기본 무비용, 합체 MP 가드 있음) |
| `_mmAiming` maliceMortar | 확정은 `fireMaliceMortar()` 위임(비용은 함수 내부, fireBoneWall류) | 본 과제 '확정 블록 재검사' 결함 재현 아님(함수 내부 검수는 별건) |
| **`_tsAiming` thunderStake** | **확정 블록이 조준 후 MP<50·스택0 재검사 없이** `P.mp=max(0,mp-50)`·`P._tsStk=max(0,(_tsStk\|\|1)-1)` 후 설치 | **선정 — 결함 재현** |

## 결함 (thunderStake 뇌전창)

- 위치: `game.html:35229-35250` / `game-easy-test.html:34034-34055`.
- aim-start 게이트(`game.html:12530-12537`)는 **스택>0·MP>=50**을 요구하지만, 확정(`else if(MBjust[0])`)은 재검사 없이 즉시 차감·설치.
- 조준 중 외부 소비로 MP가 49가 되거나 스택이 0이 되면: `Math.max(0,…)` 클램프로 음수는 안 되지만 **자원 전소 상태에서도 뇌전창이 무료 설치**된다. (`(P._tsStk||1)`은 0을 1로 취급하는 잠재버그까지 겹쳐 스택0에서도 설치.) iceStorm/hellRay와 동일 결함 클래스.

## SSOT 확인 (새 비용/효과 없음)

`2_1 스킬관리+합체시스템.md:1321-1337`: thunderStake **MP 50/개, 5스택(720f/1충전, Lv10→6)**, 지속 600+(Lv-1)×30f. 패치는 MP50·스택1 비용과 설치·아크·SFX를 그대로 두고 **확정 전 재검사만** 추가.

## 산출물 (SKILL 소유 `aim-resource-next-*`)

| 경로 | sha256 | 내용 |
|---|---|---|
| `aim-resource-next-gate.test.mjs` | `8a0fa4e9…` | 양쪽 원블록 추출 RED + 메모리 patch GREEN, 23 assertion |
| `aim-resource-next-game.patch` | `79fc2ea6…` | `game.html` 최소 미적용 diff (가드 3줄 + 닫는 `}`) |
| `aim-resource-next-easy.patch` | `09e07c70…` | `game-easy-test.html` 동일 patch |
| `aim-resource-next-before-ts.txt` | `4b143479…` | 원 확정 블록 원문 보존(미적용 기준, HEAD 7cb8485d) |

## 최소 patch (양쪽 동일)

```
      MBjust[0]=false;
+     if((P._tsStk||0)<=0){P._tsAiming=false;showPH(_T('충전 중...'),'#ff8844')}
+     else if(P.mp<50){showPH(_T('MP 부족! (50)'),'#4488ff')}
+     else{
        let _tsx=... ; (기존 본문 전체 그대로)
        P.mp=Math.max(0,P.mp-50);P._tsStk=Math.max(0,(P._tsStk||1)-1); ...   (비용·설치·SFX·숙련 불변)
        P._tsAiming=false;}                                                   (+ else 닫는 브레이스)
      }
```

- 계약: 취소(RMB/Escape) 우선(기존 분기 유지) → 스택0 조준 종료(무차감) → MP<50 조준 유지(무차감) → 그 외 성공은 **MP50+스택1 1회 차감, 기존 설치/아크/SFX/숙련/리젠 그대로**.
- 패드 공통: 확정은 `MBjust[0]` 단일 경로(ts는 차지-릴리즈 없음). gamepad 핸들러가 세팅하는 `MBjust[0]`도 동일 가드를 공유 → 패드 비용 불변.
- `MBjust[0]=false` 소비·성공 시 `P._tsAiming=false`로 중복 확정 시 재설치 없음(기존 동작 보존).

## 검수 (node, exit0) — 23/23 PASS (game.html · game-easy-test.html 각)

| 항목 | 원블록(RED) | patched(GREEN) |
|---|---|---|
| MP50/스택1 성공 | mp0·stk0·zone1·aim off (기준) | 동일 + prof1·sfx1·rech=720 |
| 정확 MP50 (100/스택2→50·stk1) | — | mp50·stk1 |
| **MP49** | **설치됨·MP 전소0·zone1 [결함]** | 조준 유지·mp49·stk1·zone0·**부작용0**·'MP 부족! (50)' |
| **스택0** | **설치됨·zone1 [결함]** | 조준 종료·mp50·stk0·zone0·**부작용0**·'충전 중...' |
| 취소(RMB)/Escape 우선 | — | 무설치·무차감·부작용0 |
| 패드 공통경로 MP49 | — | 무설치·조준 유지 |
| 성공 1회(조준 off 재확정) | — | 재설치/재차감 없음 |

"실패 시 자원/장판/숙련/RNG/음향 0"은 `sideEffectFree`(zone·sfx·playSample·addTxt·prof·shake 전부 0)로 검증.

## 번역

patch 문자열 둘 다 **기존 등록·27 lang 전수 보유**: `충전 중...`(번역대상_전체목록 No.0342), `MP 부족! (50)`(No.1601). **새 등록 불필요.**

## 발견한 docs/코드 불일치 (범위 밖 — 인계만)

- `game.html:35238`/`game-easy-test.html:34043` `_tsMaxT=900+(_tsLv-1)*30` (주석 "15초")이지만 SSOT `2_1:1325`는 "지속시간 10초 = 600f+(Lv-1)×30f". **코드 900 ↔ 문서 600 불일치.** 본 과제(확정 게이트) 범위 밖이고 공유 docs/production 수정 금지라 미반영. root/총괄이 설계 의도(15초 vs 10초) 확정 후 코드 또는 문서 한쪽을 일치시켜야 함.

## 미수행·한계 / 인계

- **game/easy 생산 적용은 root**(두 patch 미적용, dry-run clean). 적용 후 양쪽 전체 confirm-gate 회귀·실게임 조준중 자원변화 실측은 root/QA.
- maliceMortar는 `fireMaliceMortar()` 내부 비용 검수가 별건으로 남음(함수 추출 검수 필요 시 다음 한 건 후보).
- 메모리 블록 실행만(게임/브라우저/서버/리로드/계측 0). 자원값·효과·합체·보호 설계 변경 0. Git/queue/새세션/권한 0. 타팀·공유 docs·production 무수정. 기록은 이 소유폴더에만.
