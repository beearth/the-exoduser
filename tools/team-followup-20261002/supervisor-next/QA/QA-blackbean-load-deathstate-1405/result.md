# QA-blackbean-load-deathstate-1405 (결과)

RECOVERY-QA-1405: blackBean 직접치사→die 와 `_bossLoadPhase` ticker의 상호작용을 **실제 update() 프레임 순서·상위 가드·die()·phase ticker 전체**로 연결해, phase1(load) 중 사망이 stale 로딩으로 재도전/보스방 진입을 막는지 정상 입장과 대조했다. capacity epoch `ca261460`, 2 file credit로 proof 저장(result.md+checks.mjs). `productionApplied=false`. native6/화면/청취와 분리, 실행/입력 0.

## 결론 (영향 한정 근거)

- **영구 차단 없음:** blackBean 치사가 load 중 발동해도 phase ticker는 끝까지 진행해 `_bossLoadPhase→0`이 되고 게이트/재진입 전제(`L40534: _bossLoadPhase<=0`)가 회복된다. 재도전/보스방 진입이 stale 로딩으로 **영구히 막히지 않음**.
- **그러나 관측된 실제 상호작용(사망수명):** phase ticker(L40425)가 load 동안 **무조건 `P.s='idle'`로 강제**하므로, load 중 유일한 hurtP-우회 치사경로(blackBean 직접 `P.hp-=_bkD`, L32202)가 발동하면 die()의 `P.s='fallen'`이 같은 프레임 뒤에서 **idle로 덮여 사망 상태가 취소**된다. 결과: load 내내 `hp=0`인데 `s='idle'`, die()가 매 프레임 재발(모델 329회), **보스 아레나를 hp=0으로 진입**, 사망 화면/카운트다운은 **load 완료 후로 지연**되어 그제서야 `fallen` 확정.
- **재현 수준:** update() 프레임 순서·실제 가드로 **상호작용 로직은 재현**(아래 모델). 단 **게임 전제(blackBean 투사체가 보스게이트 load·`iframes<=0`와 공존)**는 native 미확인 — blackBean은 Q전용 패링레슨이라 CH1-1 보스게이트 접근과 실제 공존하는지는 root lease 실창 Gate(미인수)에서만 확정.

## 실제 소스 핀 + 전체 caller 증명 (game.html SHA `ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613`, 읽기 시점)

- **player-act(L30945–32260): `_bossLoadPhase` 가드 0** — 플레이어 행동(bash)은 `_pDead`만으로 차단, load phase로는 차단 안 됨 → load 중 bash 진입 가능.
- **L41991 `hurtP`: `if(G._bossLoadPhase>0)return`** — 일반 피해는 load 중 동결. **blackBean 직접차감은 hurtP 밖**이라 이 동결을 받지 않음.
- **L32202 blackBean:** `const _bkD=Math.max(1,~~(p.dmg*.3)); if(!P._ioActive&&P.iframes<=0)P.hp-=_bkD;` (clamp 없음) → 블록 말미 `if(P.hp<=0)die();`. iframes 가드가 유일 방어.
- **L40425 phase ticker:** `if(G._bossLoadPhase>0){ P.s='idle'; P.st2=0; … phase 1→2(_enterBossArena, P.iframes=90)→3→4→0 }` — `P.s='idle'` **무조건**(fallen/dead 예외 없음).
- **L42282 die():** `if(P.s==='fallen'||P.s==='dead')return; … P.hp=0;P.s='fallen';P.iframes=9999;P.st2=300` — **`_bossLoadPhase` 리셋 안 함**.
- **L31745 die-check:** `if(P.hp<=0&&P.s!=='fallen'&&P.s!=='dead')die()` — ticker가 idle로 돌려놓으면 매 프레임 재발.
- update() 프레임 내 순서: **[L31745 die-check] → [L32202 blackBean 직접차감+die] → [L40425 ticker idle 강제]** (die→idle 덮어쓰기가 같은 프레임 안에서 성립).

## 모델 실행 (frame-order 충실, Node, exit 0)

명령: `node checks.mjs` / RUN 2026-10-02T14:10:31Z / EXIT 0
```json
{
  "checks": [
    { "id": "A-phase1-blackBean-kill",
      "observed": "치사직후 hp=0 s=idle(ticker가 fallen→idle 덮음=true) | 로드중 die/idle 반복=329회 | 로드완료 후 hp=0 s=fallen(사망 확정=true) | 게이트 재진입가능(phase<=0)=true" },
    { "id": "B-normal-iframes-protected",
      "observed": "iframes>0 → 직접차감 차단, hp=100 s=idle phase=0 생존=true" },
    { "id": "C-normal-no-blackBean",
      "observed": "로드 완료 phase=0 hp=100 s=idle 생존=true" }
  ]
}
```
- **A**: phase1 치사 → 사망상태 억제·지연, die 329회 반복, hp0 아레나 진입, 로드완료 후 fallen 확정, 재진입 가능(영구차단 ✗).
- **B(정상대조)**: 아레나 진입 후 `iframes=90` → 직접차감 가드 차단 → 생존.
- **C(정상대조)**: blackBean 없음 → 정상 로드 완료·생존.

## 최소 후보 (사망수명 — blackBean/패링 수치·정책 불변)

상호작용이 소스 순서로 재현되므로 후보를 제시하되, **blackBean Q전용/E불가·공격/패링 수치·정책·보호2_3은 건드리지 않는다**:
- **후보(death-lifetime):** phase ticker(L40425)의 `P.s='idle'`를 `if(P.s!=='fallen'&&P.s!=='dead'){P.s='idle';P.st2=0}`로 한정 — load 중 발생한 사망상태를 덮어쓰지 않게. (또는 load 중 die() 발생 시 ticker가 사망을 우선 처리.) blackBean/parry/2_3 미변경, `productionApplied=false`. 
- **전제:** native 실창에서 blackBean×보스게이트-load 공존이 확인될 때만 실질 영향. 미확인 시 영향 한정(사망 지연/die 반복, 영구차단 아님).

## 경계 / 인계
- **Changes≈63**(TASK 명시) · 이번 2 file credit 사용(result.md+checks.mjs), 100 전 신규 중단·80 체크포인트 유지. 기제출 폴더/원자료 불변.
- production/공유docs/Git 조회·변경/게임/save/UI/세션/권한 0. 보호2_3·Q전용 magic·E불가·attack ticket 금지 준수. **실행/입력 0**(root lease 실창 Gate 미인수 — native6/시각/청취 분리).
- **docs 키워드 동기화 인계(쓰기 0):** blackBean 반사·패링 → 보호 `2_3 돌진+패링+방패시스템`(읽기 인계); 보스 로드 phase/death → `4.1맵디자인+설정/MAP_RUNTIME_ARCHITECTURE.md`·`8.1보스디자인바이블/BOSS_BATTLE_SETTINGS.md`. "phase ticker 무조건 `P.s='idle'`가 load 중 사망상태를 덮음 + die()가 `_bossLoadPhase` 미리셋" 관측을 BOSS/MAP 소유로 인계.
- AskUserQuestion/승인은 사용자 몫.

## 다음 독립 승인 작업 (자가 선택)
위 후보의 역-전제: die() 중 `P.iframes=9999`(쓰러짐 무적)가 load ticker의 iframes 처리와 충돌 없이 유지되는지, 그리고 load 중 die() 반복(329회)이 die() 내부 1회성 연출(SFX/부활판정/`_reviveOnceUsed`)을 중복 소비·조기 소진하는지 — die() 재진입 멱등성을 소스로 대조하는 작업을 메모리로 이어가겠다(수치/정책 변경 0, QA 관측 범위).
