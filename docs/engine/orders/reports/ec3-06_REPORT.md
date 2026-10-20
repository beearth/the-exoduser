# EC3-06 — etype43 charge trigger adapter

STATUS: REVIEW_PENDING. 실제 actor/World/피격 writer 연결은 HOLD.

최신 fetch origin/main `0105159934d0c2a8b167bd51518dca1e0fafe50a`과 승인 EC3-05 `c96a1eb534f003f297f42adbebf4da6640d830fc`를 정상 merge한 기준은 `431a7f883345e480ac602b1a8c9da96d8ef9c17b`이다. rebase/force/reset0. WORK_BOARD의 P2-008a/b·기존 etype47/factory 담당과 신규43 leaf 경로 중복0. trace-enemies-ch3 `20b2139a`의 EC3-06 행을 따른다.

| 원본·의존 | 구현 계약·범위 |
|---|---|
| G39358–39365 | outer idle 한번 판정, LungeT−sp 한번. `T<=0 && 30<d<1200` 이후에만 path predicate(view,630+r). 경로 승인 뒤 T=Cd → 현재P 조준 → eChargeWind / st2=90 / aimMax=90 / dur=15 / speed=42 / length=630+r → text(−15,돌진!,#882211,25) → charge SFX |
| EC2-04 `5a389578b9549b25538c665580e0d8bd906f9dbc` | main/인수 EC3-05 체인에는 모듈 없음. 원격 원문을 읽어 `advance_trigger_clocks`/`plan_triggers` 및 READY/NOT_READY·commands·product_connected=false 형식을 재사용. 30/32/39 모듈 복제·guard 확대·추가 의존 merge0 |
| 기존 `enemy_mod_m29.gd` | 43 전용 필드 주입 뒤 기존 `step_charge`를 fixture에서 직접 소비. trigger/start_windup 호출0(해당 M29의60/18/32/640+r로 대체0). G40519–40538의 wind/charge 공통 계산 재사용, 실제 writer 신설0 |
| G40521–40522 | `st2 > aimMax*.755` 즉 90전조의67.95 strict 잠금. owner가 같은 tick에 st2 감소 한번. source의 `_chgVisLen` 잔존·eliteBusy 보존. 원문 주석35%를 상수로 사용0 |
| source pin | game.html SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`; trigger8행 SHA256 `c396cb68e2edc032eb901bec516199144d18e6649b714b62859a362461f91793`; common20행 SHA256 `81078d9bf859d5899e7c3ac7f760776673766d39c576e3dbcbdee923b02f2073`. Node streaming으로 전체 hash만 누적하고 필요한28행만 수집 |

신규 `native_ch3_enemy_charge_policy.gd`는 caller snapshot을 deep-copy하여 순수 상태·명령 receipt를 반환한다. 경로 callback은 due site에서만 호출되며, 없거나 bool 외 응답이면 명시 NOT_READY다. 실제 `_chgPathClear`, shared owner guard/clock, actor 상태 readback, 공통 이동·sweep·피격/패링·FX writer의 제품 연결은 별도 통합(HOLD)이다. fixture 성공을 제품/실플레이 성공으로 집계하지 않는다. Player/World/factory/Main/State/저장·다른 담당·기존 테스트 수정0.

신규 검사는 원본 JS 블록을 실행한2880개 trigger와84개 common step에 binary64 UTF-8 receipt로 대조한다. 거리 경계 양옆, T/clock/idle, 경로 거절·조회 순서·length, 캐시·공유lock 보존, 90/15/42,67.95 경계, 이동 거절/timeout을 검증한다. common actor snapshot/canMv 호출을 비교하며 실제 피격 부작용 연결은 주장하지 않는다. 신규 fixture Cd95는 기존 EC3-02의80+30U 범위 내 입력이며 초기화식 재구현0. OS.execute 진단은 join, oracle 결과는 임시 UTF-8 파일, Node는 명시 --node-bin. 허용오차0/skip0.

| 검수·결함 주입 | 실제 수치 |
|---|---|
| 신규 첫 실행 | 26,287/0, trigger2,880·common84, exit0·ERROR0·WARNING0·tolerance0·skip0 |
| 직접 회귀 각1회 | M29 143/0, CH3 catalog12,602/0; 합계12,745/0. 둘 다 exit0·ERROR0·WARNING0. 무관한 회귀 추가0·통과 재실행0 |
| 변이4종 | strict30→inclusive:169실패; dur15→M29의18:127실패; idle밖clock감소:1,440실패; path630→640:252실패. 각26,287단정·exit1·ERROR0/WARNING0, 모든 변이 검출 |
| 복원·보호 | 변이 후 신규 module은 첫 통과 실행 전 byte로 정확 복원. 기존415개 source/data/scene와game.html 동일·기존검사/공용/다른담당/저장0줄. 원본값·단정·하니스 약화0 |
| 격리·실행 | 신규 EXODUSER-ec3-06-Isolated-20261020; catalog는 기존파일 상수EXODUSER-ec3-02-Isolated-20261020; M29는 기존 상수 없음/신규 격리 fixture. import 포함매Godot pgrep가2이상이면30초대기·실행직전1개 확인8회, override 매회설정후0byte |

원로그는 `~/exoduser-wt/_out/ec3-06/`에 stdout/stderr/engine 로그·guard 시각·Node oracle·변이 실패 원문·메타데이터를 보존한다. 최초 sparse 초기화에서 index 미구성으로 merge가 거절되어 자기 복구용 diff 프로세스만 종료하고 `read-tree -mu HEAD` 후 정상 merge했다. 공용 R index/work/HEAD/branch 변경0, 다른 프로세스 종료0, reset/rebase/force0. CHANGELOG의 선재 literal conflict-marker를 원래 main byte suffix 그대로 보존했다.

신규 module/test·UID2·이 보고서·CHANGELOG 절의6개 경로만 지정 staging한다. 정상 pre-commit 훅과 docs-sync 검사를 거쳐 자기 브랜치만 push, 원격SHA 일치 및 DONE 작성 후 자기 worktree만 제거한다. 최종 SHA·remote 일치·제거 실측은 DONE.txt에 기록한다.
