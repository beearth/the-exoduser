세 경로와 howl 호출부를 양쪽 파일에서 실제로 확정했습니다. 읽기 전용으로 수행했고, 생산파일/공용문서 쓰기·청취·게임 실행은 하지 않았습니다. 완성 답변은 아래이며, root가 SOUND 소유 문서에 저장하면 됩니다.

## S-11-HOWL-PATH-REVIEW — 현재 Mac 소스 실측

### howl 재생 지점 (현재 줄번호)

| 사이트 | 성격 | game.html | game-easy-test.html | 조건·볼륨 |
|---|---|---|---|---|
| **A 봉인 포효** | `_enterBossArena` 꼬리(아레나 진입 봉인 연출) | **29474** (함수 29411~29476) | **28391** (함수 28330~) | **가드 없음**(무조건), vol .6, `_bossSfx(si).howl` / 폴백 `boss_howl·boss_howl1` |
| **B 입장 포효** | 보스로드 상태머신 phase4 입장연출 | **40309** (phase4 블록 40296, `_bossLoadT<2` 1회) | **39195** (phase4 39182) | `_bossLoadPhase===4 && _bossLoadT<2`, vol 1.0 |
| **C 페이즈업 포효** | `_bossPhaseCheck` HP임계 부활 연출(교전 중) | **36860** (setTimeout 120ms) | **35749** | HP 페이즈 상승 시, vol .8 — **아레나 진입과 무관(S-11 범위 밖)** |

### `_enterBossArena` 호출부 (진입 경로)

| 경로 | game.html | game-easy-test.html | 호출 시 `_bossLoadPhase` |
|---|---|---|---|
| 보스문 정상 | **40289** `if(_bossLoadFade>=1){_bossLoadPhase=2;_bossLoadT=0;_enterBossArena()}` | **39175** 동일 | **2** (호출 직전 2로 세팅) |
| 재도전 | **16167** `_enterBossArena(true);BGM.play('boss')` | **15351** 동일 | 0 (retry 블록이 0으로 리셋) |
| 직행/테스트 | **30205**, 61902, 61982, 62455 | **29110**, 60320, 60400, 60873 | 0 |

### 호출 순서 · phase 조건 · 예상 재생 횟수

- **보스문 정상**: phase1(페이드아웃 50f) → fade≥1 시 `phase=2` + `_enterBossArena()` → **사이트 A 발동(이때 phase===2)** → phase2 네임카드(130f) → phase3(페이드인) → phase4 `_bossLoadT<2` → **사이트 B 발동**. ⇒ **포효 2회(A+B)** = 중복. ("봉인됨!" 텍스트 29475/28392는 A와 함께 1회)
- **재도전**: `_enterBossArena(true)` → retry 블록이 `_bossLoadPhase=0` → 꼬리에서 **A 1회**(phase≠2), phase4 시퀀스 없음 ⇒ **1회**.
- **직행/테스트**: phase 머신 미개입(0) → **A 1회** ⇒ **1회**.
- **페이즈업(사이트 C)**: 교전 중 HP 임계마다 별도 1회 — 진입 포효와 중복 아님, **수정 대상 아님**.

→ 결론: **중복은 보스문 정상 경로에서만** 발생(A+B=2회). 재도전·직행은 이미 1회. **현재 main·easy 양쪽 모두** 봉인 포효(A)에 `_bossLoadPhase!==2` 가드가 **없어 둘 다 보스문에서 2회**입니다. (양쪽 적용 완료로 보고하지 않습니다 — 현 작업트리 기준 둘 다 미가드. root 확인대로 독립후보 49851bd는 main만 수정 범위이므로, 적용되더라도 easy는 별도 동등 hunk가 필요합니다.)

### 중복방지 최소 후보 hunk (root가 SOUND 폴더에 보관 — 공용파일 직접 수정 금지)

봉인 포효(playSample)만 `_bossLoadPhase!==2`로 감싸 phase2(보스문 입장 시퀀스)에서는 억제하고 phase4(B)가 1회 담당. `SFX.groggy()`와 `addTxt('봉인됨!')`은 가드 밖에 두어 모든 경로에서 그대로 유지(소리·텍스트 손실 없음).

- game.html:29474 / game-easy-test.html:28391 — 현재:
  `SFX.groggy();const _bsf=_bossSfx(si);if(_bsf)playSample(_bsf.howl,.6,_r(_bsf.howlP,.15));else playSample(Math.random()<.5?'boss_howl':'boss_howl1',.6,_r(.8,.15)); // 보스 포효`
- 후보:
  `SFX.groggy();if(G._bossLoadPhase!==2){const _bsf=_bossSfx(si);if(_bsf)playSample(_bsf.howl,.6,_r(_bsf.howlP,.15));else playSample(Math.random()<.5?'boss_howl':'boss_howl1',.6,_r(.8,.15));} // 보스 포효 — phase2(보스문 입장연출)는 phase4 포효로 대체`

양쪽 파일에 동일 패턴 적용(main·easy 각 1 hunk). 바이트단위 49851bd diff 대조는 이 세션에 git/Bash 미제공으로 미실행 — 후보가 브랜치 원안과 동일한지는 root가 `git show 49851bd`로 확인 필요.

### 회귀 사례 (실제 청취·게임 미실시 → 검증 필요)

1. **보스문 정상**: 포효 **1회(B)**, 봉인 포효(A) 억제. "봉인됨!" 텍스트·`SFX.groggy()`는 유지되는지.
2. **재도전**: 포효 1회(A) **유지**(phase≠2라 가드 통과).
3. **직행/테스트 4곳**(30205·61902·61982·62455 / easy 29110·60320·60400·60873): 포효 1회(A) **유지**.
4. **페이즈업(C)**: 영향 없음 — 가드가 `_bossPhaseCheck` 미접촉인지.
5. **볼륨 차**: 보스문 정상이 기존 A(.6)+B(1.0) 중첩 → 이후 B(1.0) 단일. 체감 음량 변화 청취 확인.
6. **`_bossSfx` null(ch2+ si>3)**: 폴백 `boss_howl/boss_howl1` 분기 정상 동작(가드와 독립).

### 미실시 / 게이트
- 실제 청취·게임/서버 실행 없음(읽기 도구만). 생산파일·공용문서·SOUND 소유문서 쓰기 없음(root 저장).
- `git show 49851bd` 바이트대조 미실행(도구 미제공) → 후보 hunk는 현소스+핸드오프 기반 추론. 병합·삭제·인코딩 없음, 원본/세이브 무변경.

이전 S-03 검토는 반복하지 않았습니다. 소유권 밖(파일 저장·적용·게임 검증)은 실행하지 않고 인계합니다.
