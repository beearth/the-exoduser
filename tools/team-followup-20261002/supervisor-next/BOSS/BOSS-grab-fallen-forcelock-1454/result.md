# BOSS — bossGrab: 플레이어 사망(fallen) 중 위치 force-lock + 던지기가 fallen 무적 덮어씀 (재현 delta)

목표: CH1-1 playable (MILESTONE-CH1-1-PLAYABLE-20261002) / live-boss 상태 접점
epoch `rolling-after-e764-1445` · 파일 크레딧 1 사용(재현 delta 존재) · `productionApplied=false` · `runtimeAccepted=false`
실행: Mac Claude Code (BOSS/Claude) · 지정 Node v24.15.0 · game.html sha256 `e462f234…`

> 이전 phase→recover→idlepicker 가드는 정적범위(인수). 이번은 **실제 재현 delta**가 있어 저장(정상 trace 보존). 틀린 revpts-10삭제 후보 철회 유지.

## 1. 소스 핀 (양판)

| 요소 | game.html | easy |
|---|---|---|
| `bossGrab` 상태 | 39502–39517 | 38304– |
| 위치 force (무조건) | 39504 `P.x=e.x+Math.cos(e._grabAng)*25;P.y=...;P.kb=0` | 대응 |
| tick 데미지 | 39506 `if(e.st2%10===0&&P.iframes<=0)hurtP(~~(e.atk*.4...))` | 대응 |
| 던지기(마무리) | 39512–14 `hurtP(e.atk*1.8); P.kb=cos*18; **P.iframes=30**` | 대응 |
| 플레이어 사망 트리거 | 31745 `if(P.hp<=0&&P.s!=='fallen'&&P.s!=='dead')die()` | — |
| `die()` | 42282 `P.hp=0;P.s='fallen';P.st2=300;**P.iframes=9999**`(G.on 안 멈춤) | — |

`bossGrab`은 **`P.s==='fallen'/'dead'`·`P.hp<=0` 가드가 전혀 없음.** `die()`는 루프를 멈추지 않고 fallen 5초(300f) 카운트다운을 돌린다.

## 2. 재현 delta (정상 vs 사망, 모델 7 PASS, band=model)

grab st2=60, die→fallen/iframes=9999/st2=300. tick(atk×.4)·throw(atk×1.8)·iframes=30은 실제 라인값.

| 시나리오 | 결과 |
|---|---|
| **A 정상(생존)** | grab 60f force → 던지기(kb+iframes=30), 생존. fallen force 0. **정상** |
| **B 사망(현행)** | grab tick이 처치 → `P.s='fallen'`,iframes=9999. **① fallen 중에도 bossGrab이 위치 force-lock(49프레임)** / **② 던지기가 fallen 무적 9999→30 덮어씀**. |
| **C 사망+가드후보** | fallen 즉시 grab 해제(force-lock 0) + **fallen 무적 9999 보존**(던지기 미적용). |

원 stdout:
```
B 사망: P.s=fallen | forcedWhileFallen=49 | throwIframesOverwrite=true | iframes=30
C 가드: forcedWhileFallen=0 | iframes=9999 (fallen 무적 보존)
== 7 PASS / 0 FAIL ==
```

## 3. 결함 내용

플레이어가 grab 중 사망(grab tick이 kill)하면:
1. **위치 force-lock 지속:** `die()`가 `P.s='fallen'`으로 바꿔도 bossGrab(39504)은 가드가 없어 fallen 플레이어를 grab 종료(st2≤0, ~최대 60f)까지 **보스 옆에 강제 고정** → 사망 연출·부활 위치가 보스에 밀착(자연부활 시 보스 옆 부활 위험).
2. **fallen 무적 손상:** 던지기(39514)가 `P.iframes=30`을 **무조건** 적용 → `die()`가 준 fallen 무적(9999)이 30으로 깎임 → 남은 fallen 카운트다운(~240f) 동안 장판/투사체 등 외부 피해·상태효과가 쓰러진 플레이어에 닿을 수 있음(hp는 0 클램프이나 상태/부활 판정·VFX에 영향 가능).

정상(생존) 경로는 영향 없음(가드는 fallen/dead에서만 발동).

## 4. 최소 후보 (미적용, 의도=root Gate)

- `bossGrab` 진입부에 **`if(P.s==='fallen'||P.s==='dead'||P.hp<=0){e.s='recover';e.st2=40;break}`** 가드 추가 → 사망 시 위치 force-lock 해제 + 던지기(iframes 덮어쓰기) 미적용. (양판 39504/38304 대응 동일 적용.)
- 또는 던지기(39514) `P.iframes=30`을 `P.iframes=Math.max(P.iframes,30)`로 바꿔 fallen 무적 보존(최소 변경). 어느 쪽이 canonical인지(사망 중 grab 연출 유지 vs 즉시 해제) = **root 의도 Gate**. 수치/능력/좌표/LOCK/보호2_3 변경 0, grab "무조건 잡힘(패링 불가)" 설계 불변.

## 5. docs 동기화 인계

- `docs/8.1보스디자인바이블/` grab 계약 문서(해당 보스/무브)에 "grab 중 플레이어 사망 시 fallen 위치 force-lock·fallen 무적 덮어쓰기(현행, 미수정)" 주석 + 위 가드 후보 인계(root).
- rg 확인: grab 관련 명시 수치 문서는 `BOSS_BATTLE_SETTINGS.md` 범위 외(무브별 개별 계약 부재) — 신규 grab 상태·사망 상호작용 항목 보강 권고.

## 6. 경계·다음

- 모델(band) + 소스 핀. native6/화면/청취 미시연(별도 QA Gate). easy 양판 bossGrab 존재 확인(38304), 라인별 완전 diff는 미수행(UNKNOWN — root 반영 시 양판 동기).
- 공용 source/docs/Git/게임/save/UI/삭제이동/새세션/권한 변경 0. 보호 `2_3`·Q-only blackBean·E불가·attack-ticket 금지 불변, map geometry/camera QA 확장 0. AskUser/승인은 사용자 몫.
- **다음 독립(크레딧 소진 후 메모리):** grab 중 **보스가 사망/phase전환**으로 상태가 바뀔 때 플레이어 force-lock이 즉시 풀리는지(보스측 해제 대칭), 또는 grab 중 `bossGrab` 상태에서 포탈/존 전환 시 좌표 일관성을 소스로 조사. 승인/epoch 대기 없이 진행.
