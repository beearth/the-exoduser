# ENEMY-20261002-F06-SOURCE-CANDIDATE

root가 owner et3-probe.fixed.js에 지원본과 동일 SHA의 tick-health 수정을 실제 인수했다. 기존 나쁜 owner는 root-review/five-owner-before-enemy.js로 보존, regression은 실제 owner 경로17 PASS. 이 관측기 통합을 반복하지 않는다.

다음 한 건은 승인 ENEMY-F06 배열 꼬리 기아의 실제 update 루프용 최소 source 후보다. ENEMY_AI_TEAM_MASTER §3-C, test/enemyTimeBudgetStarvation.test.js, 현재 양쪽 HTML 루프/타이머/LOD를 먼저 읽는다. 이미 후보가 적용/진행 중인지 확인해 중복하지 않는다. 현행 실측밴드에서는 break0였고 합성부하에서만 재현됐다는 사실을 유지한다.

소유: `ENEMY/f06-source-*`와 이 폴더 `OWNER_IMPL_20261002-{receipt.json,result.md}`. 기존 하니스의 개념 재복제만 하지 말고 실제 원루프를 추출한 입력에 적용할 미적용 patch와 source-anchored 실행 fixture를 만든다. 기존 제안 round-robin을 우선 검토해 배열 꼬리 영구 기아를 분산하되 LOD parity를 원 index로 유지, 배열 삭제/splice/스폰/죽음/empty/reset 경계를 검수한다. 현재 12/8ms 예산과 기존보호계약·공격티켓금지 유지. round-robin이 필수 매tick 보장을 주는 것은 아님을 명시하고 soft-cap 무조건 활성화0. 안전한 source 후보가 안 되면 실제 실패반례를 제출하고 정책을 임의확정하지 않는다.

검사는 작은 가상시계/소형 fixture만; 긴 스트레스/CPU 측정/대형 시뮬레이션0. 실제 성능 개선 주장0. production update/loop/game/easy/공유docs는 읽기 전용(root/QA 소유). 사용자 게임 그대로 유지, 새 게임·브라우저·서버·빌드·생성0. Git/queue/새세션/새에이전트/권한0. receipt에는 수신·실제 Read/Edit·검수·완료시각, 결과에는 source SHA/보호조건/남은 라이브 게이트와 docs 반영안을 기록한다.
