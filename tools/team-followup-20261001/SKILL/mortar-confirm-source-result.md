# Mac SKILL — fireMaliceMortar 조준-확정 MP 재검사 결과 (SKILL-mortar-confirm-source)

세션 `203377cc-64c4-47ea-af27-95b66ae829fa` 연속 · HEAD `ae230e74f7bbcacd523dae987370086046457f5e`

## 수신·착수·완료 (UTC)

- **16:27 수신** `mortar-confirm-source-task.md`. **16:28 첫 Read**: `_mmAiming` 진입/확정, `fireMaliceMortar` 실제 함수, `mpCost`/`useMp`, aim-block 목록, SSOT.
- **중복 확인**: `mortar-confirm-source-*` 부재(task.md만) → 신규. iceStorm/hellRay/thunderStake 기수정과 별개 스킬.
- **16:35 첫 코드 Edit / 16:41 완료**: 결함 확정, RED+GREEN 테스트 **17/17 PASS**, 양쪽 patch dry-run **APPLIES CLEAN**.

## 판정: 실제 결함 (REAL_DEFECT)

| 지점 | 사실 |
|---|---|
| aim-start `game.html:12444` | `P.mp>=mpCost('mortar')(50) && (P._mmCd||0)<=0` 요구 후 `P._mmAiming=true` |
| 확정 `game.html:35209-35215` | `MBjust[0]||_mmRel` 시 **재검사 없이** `fireMaliceMortar()` 호출 |
| 함수 `game.html:43757-43773` | `P._mmAiming=false; useMp('mortar')`(= `P.mp=Math.max(0,P.mp-50)` 클램프 차감) 후 **조건 없이** `G._mmBomb` 생성·SFX·RNG·shake·`_mmCd=660`. 바로 아래 `fireBoneWall`(43776-)이 `_bwStk<=0`·`mats<cost` 내부 게이트를 갖는 것과 대비해 **MP 게이트 없음** |
| 도달성 | 공격/스킬 조준차단 목록 `game.html:31756`(`_ms/_is/_bw/_eb/_hr/_ts`)에 **`_mmAiming` 미포함** → 멀티프레임 홀드-충전(최대 ~2.3s, 현 ~0.6s) 중 다른 MP 소비 가능 → 확정 시 MP<50이어도 **무료 발사** |
| 유일 호출부 | `fireMaliceMortar` ← `game.html:35213` 확정 1곳 |

frozen before(원함수) sha256: `cdeeead948d5518c6beeb8f3eee4fbf38eed8cc785165738f7150f8c375f2f49` (game.html·game-easy-test.html 동일, 789chars). `mortar-confirm-source-before.txt`에 보존.

## SSOT (새 비용/쿨다운 없음)

`2_1 스킬관리+합체시스템.md:227` maliceMortar(폭풍소환): 쿨 11초(=660f, `_mmCd`와 일치), 범위 400+(Lv-1)×18, 6.5초(390f) 흡인+뎀. **스택/악의 비용 없음.** MP `mpCost('mortar')=50`(`game.html:30709`). 패치는 이 값·쿨·합체(iceMortar) 설계를 바꾸지 않고 **확정 전 MP 재검사만** 추가.

## 산출물 (SKILL 소유 `mortar-confirm-source-*`)

| 경로 | 내용 |
|---|---|
| `mortar-confirm-source-before.txt` | 원함수 원문 보존(미적용 기준) |
| `mortar-confirm-source.test.mjs` | 양쪽 실제함수 추출 RED + 메모리 patch GREEN, 17 assertion |
| `mortar-confirm-source-game.patch` | `game.html` 1줄 가드 삽입 diff (dry-run clean) |
| `mortar-confirm-source-easy.patch` | `game-easy-test.html` 동일 patch |

## 최소 patch (양쪽 동일, 1줄)

```
 function fireMaliceMortar(_tx,_ty){
+  if(P.mp<mpCost('mortar')){showPH(_T('MP 부족!'),'#4488ff');return}
   P._mmAiming=false;
   useMp('mortar');
```

- 계약: 확정 진입에서 MP<50이면 `MP 부족!` 안내 후 **즉시 return** — 발사·차감·쿨·SFX·RNG 없음, **조준 유지**(기존 SKILL03 'MP 부족 시 조준유지' 패턴과 일치). MP≥50이면 기존과 **완전 동일**(useMp 50 차감, `_mmCd=660`, iceMortar 합체 `_ioCd=600` 보존).
- 취소(RMB/Escape)는 확정 블록 상위 분기에서 이미 우선 처리되며 patch가 건드리지 않음. 중복 확정은 성공 시 `_mmAiming=false`+`_mmCd=660`으로 차단(기존 그대로).
- 새 비용/쿨다운/보호설계 변경 **0**.

## 검수 (node, exit0) — 17/17 PASS (game.html · game-easy-test.html 각)

| 항목 | 원함수(RED) | patched(GREEN) |
|---|---|---|
| MP50 발사 | bomb·mp0·cd660·aim off (기준) | 동일 + sfx1·playSample≥1 |
| 정확 MP50 (80→30) | — | mp30 |
| **MP30** | **발사됨·MP 전소0·cd660 [결함]** | 무발사·mp30·조준 유지·cd0·'MP 부족!' |
| MP0 | — | 무발사·조준 유지 |
| 합체(iceMortar) 성공 | — | iceFuse 폭탄·_mmCd660·_ioCd600·mp0 |
| 합체 실패(MP30) | — | 무발사·_ioCd 미설정·조준 유지 |

"실패 시 발사/차감/음향/RNG 0"은 `noFire`(bomb=false & sfx/playSample/shake=0)로 검증.

## 번역

patch 문자열 `MP 부족!`은 **기존 등록**(번역대상_전체목록 No.0338, "Not enough MP!")이며 game.html에서 17회 재사용 중 → **새 등록 불필요.**

## 범위 밖 유지 사항 (인계)

- **thunderStake 지속시간 코드 900(15초) ↔ SSOT 600(10초) 불일치**: 별도 근거 불일치로 **유지**, 임의 수치변경 0. root/총괄 reconcile 대기(이전 `aim-resource-next-result.md`에도 기록).
- maliceMortar 확정 블록(35209-35215)은 함수 위임만 하므로 patch 대상 아님(게이트는 함수 내부에 둠 — fireBoneWall과 동일 구조). 확정 블록 자체는 변경 불필요.

## 미수행·한계

- **game/easy 생산 적용은 root**(두 patch 미적용, dry-run clean). 빌드 소스 동결 뒤 root 순차 검토. 적용 후 양쪽 전체 confirm-gate 회귀·실게임 조준중 MP 변화 실측은 root/QA.
- 메모리 함수 실행만(게임/브라우저/서버/리로드/계측/대형빌드 0). production/공유docs/Git/queue/새세션 쓰기 0. 사용자 게임탭 입력·닫기 0. 기록은 이 소유폴더에만.
