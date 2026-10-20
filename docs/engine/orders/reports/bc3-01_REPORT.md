# BC3-01 — BLOCKED: main의 필수 읽기 의존 부재

**판정: BLOCKED / 구현하지 않음.** fetch한 최신 origin/main에는 지시서가 요구하는 CH2 catalog·bridge가 없다. 사용자 최신 지시 ②에 따라 미병합 브랜치의 병합·복사·그 끝에서의 분기 없이 중단했다. 구현 완료나 테스트 PASS가 아니다.

## 기준과 우선 지시

| 항목 | 확인 |
|---|---|
| 작업 / branch | bc3-01 / codex/bc3-01-20261020 |
| 기준 | git fetch 후 origin/main=6d987cb8a31d0aadd2b6a8cf1e9a781d1fb76d4d |
| worktree | ~/exoduser-wt/bc3-01, --no-checkout 후 non-cone sparse-checkout. 필요한 docs·기존 catalog 텍스트·game.html·훅 도구만 수신 |
| 지시서 | codex/trace-boss-ch3-20261020의7a3080a46863ac34f0a3e7864a003e5a7ff0f55c, docs/engine/FDG_SOURCE_TRACE_BOSS_CH3_20261020.md §5.1(188–207행) |
| 최신 사용자 조건 | “CH2 ddf05495·BC2-02 a3b5391c 등 미병합 브랜치는 읽기 참조만 하고 병합하지 않습니다. 의존 때문에 main 기준으로 불가능하면 구현하지 말고 BLOCKED로 이유를 보고합니다” |
| 지시 적용 | 기존 문서의 ‘미병합이면 승인된 선행 끝에서 분기’는 위 최신 조건으로 대체. 이 작업은 main에서 분기했고 merge/cherry-pick/코드 이송/선행 branch 분기0 |
| 원본 | game.html SHA256 4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4, G9976–9981/10009–10010/16691. 이번 원본 변경0 |
| R | HEAD dd49171c5b88e211575a41f185395d6c0a14b184, branch codex/mac-live-play-time-main-20261017, tracked INDEX/WORK 빈 상태 보존 |

## 필수 의존 검사

파일 부재는 sparse 체크아웃의 누락으로 판단하지 않았다. main commit의 Git object를 git cat-file -e로 직접 확인했다. 두 필수 파일은 exit128로 없으며, 읽기 참조 a3b5391c에는 존재한다.

| 대상 | 현재 main | 읽기 참조 / 필요한 계약 |
|---|---|---|
| godot/scripts/native_ch2_boss_catalog.gd | 없음 | a3b5391c에서BC2-01을포함. source_receipt/boss_for_stage/move_by_id/phase_by_index/combos_for_stage, CH2공통30 move·36 combo의공급원 |
| godot/scripts/native_ch2_boss_catalog_bridge.gd | 없음 | a3b5391c:4–19. CH2공개API위임과BC01 global move_manifest 결합. §5.1은이 bridge에서공유30 move를읽도록명시 |
| godot/scripts/native_boss_catalog_context.gd | 없음 | a3b5391c:6–40. 향후공통BC의provider/token검증접점. 첫catalog구현의최소차단원인은위두읽기provider 부재 |
| 지시서 CH3 문서 | main에는없음 | 사용자지정7a3080a4에서읽기만함. 문서부재자체가차단원인은아니며지시서는확보함 |
| ddf05495 /a3b5391c /7a3080a4 | 모두main ancestor아님 | 해당commit존재와main인수를구분. 이번병합0 |

main에 있는 godot/scripts/native_ch1_boss_catalog.gd의 _MOVES는 전체 필드가 있는 CH1 union24개다. move_by_id(:182–187)는 이 배열만 순회하며, global59 manifest가 있다는 이유로 59개 전체 필드 조회가 가능한 것은 아니다. boss_for_stage(:164–169)/combos_for_stage(:195이후)는 CH1의si0~3 범위다.

| CH3공유30 중 main CH1 getter에 없는9기술 | 원본 선언 G |
|---|---:|
| vortex | 9832 |
| beanRain | 9840 |
| fanWave | 9841 |
| spiralBullet | 9847 |
| shieldBash2 | 9866 |
| fireRain | 9872 |
| shockGrid | 9873 |
| donutSlam | 9874 |
| crossWipe | 9876 |

지시서 §5.1의 공유30 literal 재전사0, Shared.combos_for_stage(si4..9,phase0..4)에서 공유36 ordinal을 얻는 계약을 현재 main API만으로 충족할 수 없다. 원본에서 위9개를 별도로 복제하거나 CH2 대체 bridge를 만드는 것은 지시서를 그대로 이행한 구현이 아니다. 의존 없는 stub/빈 catalog/skip 테스트를 제출하지 않았다.

BC2-02의 spawn 색상 고정과 BC08의 CH1 guard는 원래 추적 문서의 **후속 계산/연결 통합 문제**다. 이 첫 단위의 차단 사유는 읽기 provider의 부재이며, 이를 Main·State·hurtE 수정 요청으로 확장하지 않는다.

## 해제 조건·통합 요청

1. 통합 총괄이 BC2-01의 CH2 catalog와 BC2-02의 bridge 및 필요한 읽기 의존을 main에 정식 인수한다. 구현자가 미병합 branch를 직접 합치거나 코드만 임의 복사하지 않는다.
2. 다음 배정에서 새 fetch/main SHA와 공개 API·동일 game hash·global manifest를 확인한다.
3. 의존이 확보되면 BC3-01의 신규 catalog·신규 원본대조 테스트만 구현한다. 공유30/phase/공통36 combo를 읽기 재사용하고, 새7 move/새8 combo만 자기 소유 데이터로 둔다. Main/State/hurtE·저장은 계속 HOLD다.

최소 필요한 읽기 provider를 위 파일·API로 제시했다. 통합 방법·승인된 전체 변경집합·실제 diff 줄 수는 **미확인**이며 이번 작업자가 결정하거나 수행하지 않았다.

## 실행·범위·제출

| 항목 | 결과 |
|---|---|
| 구현 / 신규 제품·테스트·oracle | 0 / 생성0 |
| Godot / import / 게임·실저장 | 0 /0 /0. 실행이없어pgrep gate와override 설정을사용하지않음 |
| 새 테스트 격리명 | EXODUSER-bc3-01-Isolated-20261020은미사용. 테스트실행·단정0, PASS·skip으로보고하지않음 |
| OS.execute / node-bin | 새하니스미작성으로호출0. 후속 구현 시 전체 join과 명시 --node-bin 계약 유지 |
| 공용·기존 제품·기존 테스트·저장·원본 | 변경0줄 |
| 커밋 범위 | 이 BLOCKED 보고서와 CHANGELOG_SYNC 최상단절만 |
| 원로그 | ~/exoduser-wt/_out/bc3-01/: preflight.json, dependency-audit.json, 원격읽기snapshot, 지시서/필수의존발췌, scope·push·정리기록 |
| 종료 | 정상훅→자기branch만push→원격SHA일치→DONE.txt→자기worktree제거. branch와외부로그보존, main push/force/reset/add -A 없음 |

자세한 최종 SHA·원격 일치·R 보존·정리 결과는 외부 DONE.txt/submission.json/cleanup-verification.json에 기록한다. BC3-01의 상태는 **BLOCKED / 미구현**으로 유지한다.
