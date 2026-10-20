# DEMO11-25 — 자동 HP 물약 연결: BLOCKED

2026-10-21 KST. **구현 미착수/BLOCKED**: 지시된 기존 QS-02/03 구현이 기준에서 확인되지 않아 재사용 계약을 충족할 수 없다. 제품·테스트·공용·저장 변경 0행, Godot 실행 0회. 실행 테스트 수는 미실행이며 PASS/0실패로 보고하지 않는다.

| 확인 항목 | 근거·판정 |
|---|---|
| 기준 | fetch 뒤 origin/main 및 원격 refs/heads/main 동일 `0105159934d0c2a8b167bd51518dca1e0fafe50a`. 별도 최신 main이 있다는 추정은 하지 않음. 의존 merge 0회 |
| 배정 근거 | gap 지정 SHA `61ab71be`, `DEMO11_COMPLETION_GAP_20261021.md:130`의 DEMO11-25. QS-01→기존 QS-02/03/후속 및 DEMO11-20 의존. gap 문서는 git show로 참조만 함; 원격 gap 끝 `2299caa53585d937d7d0b025bd5ccc3ec539b0de` |
| 재사용 가능 | main의 `godot/port_modules/potion_recovery_source/producer.gd`: QS-01 `enhanced_heal`·`auto_cooldown`. 순수 계산이며 runtime writer/clock 없음 |
| 의존 누락 B1 | 추적 문서 §4.2/4.3의 `auto_phase.gd`, `native_potion_recovery.gd`, `test_p4001b_auto_potion_phase.gd`, `test_p4001c_potion_owners.gd`는 main·지정 gap SHA tree에 없음. 해당 정확 경로의 `git log --all` 결과 0건. 원격 qs*/p4001* 브랜치는 qs-01만 확인. 미fetch·별도명·미커밋 구현 존재 여부는 **미확인**; 타 worktree WIP를 반입하지 않음 |
| 자연 호출 B2 | 추적 문서 §4.5는 late-update checkpoint 미확인/HOLD를 명시. 현 main `native_source_player_initialization_services.gd:350–355`는 stage/playTime 후 end_update. `world.gd:2753–2768`의 dt_sp는 native60 FX 문맥이며 원본 자동 물약 late phase 입장 증명이 아님. 임의 Main._process/Player regen 옆 호출을 추가하지 않음 |
| 검증·보호 | 정적 tree/history/원격 SHA/원본 행 대조만 수행. 실행 테스트·원본 JS 실행 oracle·시각/PC 검증 미실행. 공용 파일별 변경 줄 범위: Main 없음, State 없음, resource authority 없음. 피해·이동·Q/E·방패·분노·맵·R 변경 없음 |

원본은 위 최신 main `game.html` 기준이다. 자동 물약은 OPT.autoPotThr나 qsAuto가 아니라 실제 회복량을 임계로 사용한다. 아래 순서를 스냅샷 일괄 commit이나 미발동 시 장비 선조회로 바꾸면 안 된다.

| 재개 시 구현/인터페이스 요구 | 원본 행·완료 조건 |
|---|---|
| QS-02 phase 재사용 | G35893: 양수 CD만 `-=sp`(음수 허용), G35894: level/affix 임계 1회 조회, G35895: lesson→CD→hp→mats→부족HP short-circuit. 미발동도 임계 조회는 수행; 장비/CD산술 reader는 실행하지 않음. QS-01 계산 재사용 |
| QS-03 writer 재사용 | G27684/28071, G63950/63952: CD0·hp level0 초기값. G35896 system-before→35897 mats--→35899–35902 gloves/belt/passives/CD→35903 level/affix 재조회→35904 `min(mhp,hp+v)`. 실제 HP는 State의 승인된 entry→resource authority로만 commit; Player 직접쓰기/피해 경로 변경 없음 |
| 후속 효과·벨트 경계 | G35905 tutorial→35906 SFX→35908 전설벨트→35909 text→35910 조건부 통계. 추적 §4.4는 피해 consumer 미연결 상태에서 `_lBeltT=300` 생성 금지. PC 소유 피해 변경은 하지 않으며 해당 consumer 준비 여부/허용 interface 인계가 필요. 미구현 효과를 무음 성공 처리하지 않음 |
| 자연 update 입장 | G32108–32132의 on/lesson/editor/paused early return을 통과한 실제 sp 단계에서 G35893–35910을 update당 1회. 기존 regen·skill timer와 원순서 연결 필요. late checkpoint owner/API 확정 전 HOLD |
| 재개 입력·검수 계획 | QS-02/03 구현의 인수 SHA/브랜치 또는 QS-02/03 선행 신규 구현 배정, 실제 late checkpoint 제공이 필요. 이후 threshold 경계·CD .5→−.5·큰sp 1회·0/음수CD·lesson/dead/no mats·첫/둘째 회복량 변화·writer 소유거부·HP만변경·자연tick 중복방지 검증. 새 격리명 `EXODUSER-demo11-25-Isolated-20261021`; 기존 QS 직접 관련 suite는 각 상수로 1회. 현재 이 검사는 수행하지 않음 |

원로그: `~/exoduser-wt/_out/demo11-25/`의 `dependency-check.json`, `source-evidence.txt`, `R-start.json`, fetch/commit/push 로그. 이번 제출은 이 보고서와 CHANGELOG_SYNC 최상단 절만 포함한다. 통합·실플레이 완료가 아니다. 브랜치/SHA·원격 일치·R 보호 결과는 외부 DONE.txt에 기록하고 자기 worktree만 제거한다.
