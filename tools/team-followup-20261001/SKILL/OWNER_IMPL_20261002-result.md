# Mac SKILL — hellRay 확정 경계 결과 (SKILL-20261002-HELLRAY-CONFIRM-GATE)

세션 `203377cc-64c4-47ea-af27-95b66ae829fa` 연속 · HEAD `1c7cdb453c8a9ddaaac401020beb72ac87a74353` · 2026-10-02 · 터미널 6

## 수신·착수·완료 (KST)

- **10:05 수신** `OWNER_IMPL_20261002.md`. **10:06 첫 Read**: 양쪽 game의 hellRay 리젠+확정 블록, `test/skillStackConfirmGate.test.js` 추출 관례, SSOT `2_1:408`.
- **중복 확인**: `hellray-confirm-*`·`OWNER_IMPL_20261002-{receipt,result}` 부재 → 신규. 지난 통합 인수(OWNER_NEXT)와 별건. 패치/관측기 재생성 아님.
- **10:24 첫 코드 Edit / 10:41 완료**: RED+GREEN 테스트 **25/25 PASS**, 양쪽 최소 patch 생성·dry-run APPLIES CLEAN.

## 결함(승인 SKILL03 '조준-확정 자원 변경 재검사' 대상)

| 위치 | 결함 |
|---|---|
| `game.html:34989` / `game-easy-test.html:33794` `else if(MBjust[0])` 확정 | 조준 시작 후 **MP<100·스택0 재검사 없이** 즉시 `P.mp-=100;P._hrStk--`. MP99면 mp가 음수(-1), 스택0이면 stk 음수(-1)로 설치·차감. iceStorm SKILL03과 동일 결함 클래스 |

aim 시작 게이트(`game.html:31772-31774`)는 `P.mp>=100`·`_hrStk>0`을 요구하지만, 조준 중 외부 소비로 자원이 바뀌면 확정 시 재검사가 없다.

## SSOT 확인(새 비용/효과 없음)

`2_1 스킬관리+합체시스템.md:408` hellRay = **MP100 / 스택1(elecRepent 합체 시 2~3) / 10초(600f) 충전 / 범위 200+(Lv-1)×22**, 지속 600f. 합체 `elecRepent`는 storm DOT 존 추가 생성. 패치는 이 수치/효과/합체 branch를 바꾸지 않고 **확정 전 재검사만** 추가한다.

## 산출물 (SKILL 소유 `hellray-confirm-*`)

| 경로 | 내용 |
|---|---|
| `hellray-confirm-gate.test.mjs` | 양쪽 원블록 추출 → RED(결함 재현) + 메모리 patch → GREEN. 25 assertion |
| `hellray-confirm-game.patch` | `game.html` 최소 미적용 unified diff (3줄 가드 + 닫는 `}` 1) |
| `hellray-confirm-easy.patch` | `game-easy-test.html` 동일 patch |

## 최소 patch (양쪽 동일, root가 생산 적용)

```
      MBjust[0]=false;
+     if((P._hrStk||0)<=0){P._hrAiming=false;showPH(_T('충전 중...'),'#ffd700')}
+     else if(P.mp<100){showPH(_T('MP 부족! (100)'),'#4488ff')}
+     else{
        const _hrLv=... ; (기존 본문 전체 그대로)
        P.mp-=100;P._hrStk--; ...                (비용·합체 branch·SFX·prof 불변)
        addTxt(...);shake(_hrElec?10:6);}        (+ else 닫는 브레이스)
      }
```

- 계약: **취소(RMB/Escape) 우선**(기존 분기 유지) → 스택0이면 조준 종료(무차감) → MP<100이면 조준 유지(무차감) → 그 외 성공은 **MP100+스택1 1회 차감, 기존 설치/합체/음향/숙련/리젠 그대로**.
- `P.mp-=100` 그대로(게이트가 MP≥100 보장). 중복 지역 검사는 추가 안 함(hellRay SSOT에 없음 — 새 효과 금지 준수).

## 검수 (node, exit0) — 25/25 PASS (game.html · game-easy-test.html 각)

| 항목 | 원블록(RED) | patched(GREEN) |
|---|---|---|
| MP100/스택1 성공 | mp0·stk0·zone1·aim off (기준) | 동일 + prof1·sfx1·playSample≥1·rech=600 |
| 정확 MP100 (150→50) | — | mp50 |
| **MP99** | **설치됨·mp=-1·zone1 [결함]** | 조준 유지·mp99·stk1·zone0·**부작용0**·'MP 부족! (100)' |
| **스택0** | **설치됨·stk=-1·zone1 [결함]** | 조준 종료·stk0·mp100·zone0·**부작용0**·'충전 중...' |
| 취소(RMB) 동시 클릭 | (원블록도 취소 우선) | 무설치·무차감·부작용0 |
| Escape 취소 | — | 무설치·무차감·부작용0 |
| 성공 1회 후 재클릭(조준 off) | — | 재설치/재차감 없음 |
| 합체(elecRepent) 성공 | — | hellRay+storm 2장판 보존·el=EL.L·mp0·stk0·sound≥2 |
| 합체 실패(MP99) | — | storm 장판도 생성 안 함·조준 유지·부작용0 |

"실패 시 자원/장판/숙련/RNG/음향 호출0"은 `sideEffectFree`(zone·sfx·playSample·addTxt·prof·rng·shake 전부 0)로 검증.

## 번역

patch가 쓰는 표시 문자열은 둘 다 **기존 등록·전파 완료**: `충전 중...`(번역대상_전체목록 No.0342), `MP 부족! (100)`(No.1442), 27개 `lang_*.js` 전수 보유. **새 등록 불필요.**

## docs 반영안 (이 폴더 기록, 공용 docs 미수정)

- `SKILL03_설치확정_자원검수_20261001.md`의 '다음 승인 검수(동일 조준-확정 스킬 재검사)'에 hellRay 행 추가 제안: "hellRay 확정: 조준 후 MP99/스택0 재검사 부재 → 스택>0·MP>=100 재검사(부족MP 조준유지, 스택0 조준종료), 성공 시 MP100+스택1만 차감, 합체 storm branch 보존. 양쪽 RED/patch/GREEN 25검사." — 실제 반영은 root(생산 적용과 함께).

## 미수행·한계 / 인계

- **game/easy 생산 적용은 root**: 두 `.patch`는 미적용(dry-run clean). 적용 후 양쪽 전체 회귀(iceStorm 포함 기존 confirm-gate)·실게임 조준 중 자원 변화 실측은 root/QA.
- 메모리 블록 실행만 수행(실게임/브라우저/서버/빌드/리로드 0). 자원값·합체·보호 Q/E·리젠/환급 설계 변경 0. Git/queue/새세션/권한 0. 타팀·공용 docs 무수정.
