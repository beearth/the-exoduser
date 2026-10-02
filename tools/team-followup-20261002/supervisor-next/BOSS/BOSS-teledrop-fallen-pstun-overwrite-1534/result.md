# BOSS — teleDrop 착지 스턴이 fallen(부활 대기)을 pStun으로 덮음 (검증된 체인 delta)

taskID `CO-BOSS-1534-teledrop-player-state-boundary` · 완료ID=JSONL end
epoch `root-73620278-claude8-1530` · BOSS 새파일 credit 1/0(1 사용) · changesBeforeOwnFiles ~72
실행: Mac Claude Code (BOSS/Claude) · 지정 Node v24.15.0 · game.html sha256 `e462f234…` · `productionApplied=false` · `runtimeAccepted=false`

> 1529 safePt fallback NOFIX 인수(현재 좌표 항상 유효 일반화·극단배치 시각은 root Gate). 이번은 **검증된 실제 상태-오버라이트 경로**가 있어 저장.

## 1. 소스 핀 (양판)

| 요소 | game.html | 내용 |
|---|---|---|
| teleDrop 착지 스턴 gate | 39676 | `if(dst(P.x,P.y,e.x,e.y)<_tsR && P.iframes<=0 && P.s!=='charge')` — **`P.s!=='fallen'/'dead'` 가드 없음** |
| pStun 설정 | 39682 | else(비패링·비focus) `P.s='pStun';P.st2=300` — **무조건** |
| hurtP fallen 무적 | 41989 | `if(P.s==='fallen'||P.s==='dead')return` — 데미지만 no-op(상태설정은 별개) |
| iframes 자연감소 | 31540 | `if(P.iframes>0)P.iframes=Math.max(0,P.iframes-sp)` — **fallen 중에도 무조건 감소** |
| die()→fallen | 42282 | `P.s='fallen';P.st2=300;P.iframes=9999` |
| grab 던지기 iframes 덮어쓰기 | 39514 | `P.iframes=30`(무조건) — fallen의 9999를 30으로 낮춤 |

easy 양판 동일 구조 확인(`P.s='pStun';P.st2=300`, iframes 감소 존재).

## 2. 실제 체인 경로 (검증, 모델 4 PASS)

- **정상 fallen(die만):** iframes=9999, 300f 카운트다운 내내 감소해도 ~9700+ → teleDrop gate `P.iframes<=0` **차단** → fallen 보존. (A PASS)
- **체인 delta:** ① grab 중 플레이어 사망→fallen(iframes=9999) → ② **grab 던지기(39514)가 iframes=30으로 덮음** → ③ 30f 감소 → iframes≤0(아직 fallen, ~270f 남음) → ④ 보스 teleStrike 착지(teleDrop)가 fallen 플레이어 범위(`_tsR=80+e.r`)에 → gate 통과(iframes≤0, s='fallen'≠'charge') → hurtP는 no-op(41989)이나 **39682 `P.s='pStun';P.st2=300`이 `P.s='fallen'`을 덮음**. (B PASS: stunF=50, s=pStun)
- **후보 가드:** gate에 `&&P.s!=='fallen'&&P.s!=='dead'` 추가 시 체인이어도 fallen 보존. (C PASS)

원 stdout:
```
A 정상 fallen: gate 차단(iframes@100≈9899) s=fallen
B(DELTA): teleDrop이 fallen을 pStun으로 덮음 — stunF=50 s=pStun st2=300
C 후보가드: fallen 보존 — s=fallen
== 4 PASS / 0 FAIL ==
```

## 3. 결함·영향

`P.s='fallen'`(부활 대기, 300f 카운트다운)이 **`P.s='pStun';st2=300`으로 덮이면 부활 판정 로직(P.s==='fallen' 키)이 중단**됨 → 부활 카운트다운/판정이 소실되거나 pStun으로 전이되어 사망 흐름이 오염. 정상 fallen 경로는 영향 없음(가드는 iframes 체인에서만 발동).

## 4. 근본 원인(둘) · 최소 후보 (미적용, canonical=root Gate)

- **(원인1) teleDrop gate(39676)에 fallen/dead 제외 없음** — iframes만으로 게이트. → 후보: gate에 `&&P.s!=='fallen'&&P.s!=='dead'` 추가(다른 iframes-게이트 공격도 동일 패턴일 수 있어 공통 점검 인계).
- **(원인2) grab 던지기(39514) `P.iframes=30`이 fallen 무적(9999)을 낮춤**(CO-BOSS-1454 관찰) — 이 체인의 **enabling 조건**. → 후보: `P.iframes=Math.max(P.iframes,30)`로 fallen 9999 보존(이 한 줄로도 체인 차단). 1454에서 "데미지 무해"로 정정됐으나 **상태(pStun) 경로는 유해**함이 이번에 드러남(비데미지 결과).
- 둘 중 어느 쪽이 canonical 수정인지 = **root 의도 Gate**. 새 스턴시간/피해수치/보호2_3 설계 변경 0.

## 5. 경계·다음

- 모델(band)+소스 핀. native/화면/청취 미시연(별도 Gate). 체인은 **grab→throw→teleStrike 무브셋 보스(si10+)**에서 reachable하나 실게임 재현·빈도는 미측정(QA Gate). source fixture ≠ playable.
- 맵 생성·geometry·camera·실게임 변경 0. 이전 grab/tele좌표 검사 반복 0. 공용 source/docs/Git(조회 포함)/game-save-UI/새세션/권한 변경 0, 보호 `2_3`·Q-only blackBean·E불가·attack-ticket·맵가이드/LOCK/SSOT 유지. AskUser/승인은 사용자 몫. 제출 원문 불변.
- **docs 인계(root):** 8.1 보스/부활(2_5) 계약에 "teleDrop(및 iframes-게이트 스턴)이 fallen 무적을 낮춘 플레이어(grab throw 경로)에게 pStun을 덮어 부활 중단 가능; gate에 fallen/dead 제외 또는 grab throw iframes 보존 필요" 인계.
- **다음 독립(메모리):** 다른 **iframes-게이트 플레이어 스턴/CC 설정 공격**(bossGrab 트리거 39496, shock/vortex 등)이 동일하게 fallen 가드 없이 `P.s`를 덮는지 공통 점검, 또는 승인 백로그의 다른 접점을 소스로 조사. 검토/epoch/통합 대기 없이 진행.
