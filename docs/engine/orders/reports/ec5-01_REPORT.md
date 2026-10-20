# EC5-01 — 5장 적 유형·원소 선택 순수 정책

작업 `ec5-01` · 브랜치 `codex/ec5-01-20261020` · 2026-10-21 KST. **격리 선택 정책 검수 대기**. 실제 적 생성·AI·World/factory·Main·State·저장 연결은 하지 않았다.

| 항목 | 구현·근거·소유 경계 |
|---|---|
| 기준·지시 | fetch 최신 main `0105159934d0c2a8b167bd51518dca1e0fafe50a`에서 sparse `--no-checkout` worktree 분기. 지시서는 [trace-enemies-ch5 8cd5c6c3 §4.1](https://github.com/beearth/the-exoduser/blob/8cd5c6c36a65161691804f2a84873c3474981e99/docs/engine/FDG_SOURCE_TRACE_ENEMIES_CH5_20261020.md#41-1번-ec5-01--5장-유형원소-선택-순수-정책-구현-지시서). 지시 문서는 기준 main에 없어 해당 제출본만 읽기 참조 |
| 의존 | main EC4-01 `61f3ad9cd862ade599a4dbf41f0a3c79ca604ce7`의 API·선택 순서·테스트/파일 oracle 형식을 새 장별 leaf에 재사용. 해당 SHA는 main ancestry에 포함. 미병합 EC4-03/후속 기능은 필요 없어 merge·반입0. 새 정책은 다른 정책을 preload하지 않음 |
| 원본 | G16633–16666·30978–31022. game SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. 함수·literal pin도 원문 대조. si21..25만, 풀31쌍/가중합151, 선택 R8종/23·비R128. R=`[1,7,8,9,13,16,17,66]`, 공통47 유지 |
| API·정확 계약 | `pick_etype(stage,random_unit)` / `pick_element(stage,random_unit)`. 유형은 첫 U<.5의 R 가중 선택 또는 원래 순서 float64 CDF의 R 기각 최대12회·fallback2(총13draw). 원소는 첫 U<.45→D3/1draw, 그 외 둘째 U×6 절삭→P/F/I/D/L/H/2draw. E 제외. stage→Callable→sample 순 진단, 잘못된 sample은 실제 소비를 기록해 NOT_READY, 보정/재추첨/rewind0 |
| 허용 파일·보호 | 새 policy/test·UID2·이 보고서·CHANGELOG 절의6경로. 공용 Main/State/World·factory·기존 선택기·HP/AI·저장·원본 변경0. 기존3,126파일 SHA 대조에서 CHANGELOG만 prepend, 기존 본문은 연속 suffix 보존. R0 branch/HEAD·tracked INDEX/WORK 불변. `.gitignore:5 test_*` 때문에 새 test/UID 두 경로만 명시 `git add -f --`로 포함, hook 우회0 |

새 테스트는 원본 선언/roll 함수를 발췌한 Node VM으로 기대값을 만든다. Node 내장 fs/vm/crypto만 사용하며 추가 설치0. `--node-bin`과 절대 `--source-game`을 명시한다. 새 helper/result는 격리 userdir의 UTF-8 파일이고, OS.execute 출력은 join한 진단만 사용한다. 원본/큰 JSON 전체를 대화 출력하지 않았고, binary64/base64로 숫자를 운반했다.

원문 1,990사례마다 첫 결과·실제 소비 비트열·남은 cursor·입력 불변·sentinel을 확인하고, 같은 RNG에서 **다음 호출의 값/소비/잔여열도** 대조했다(원문 호출3,980회). 45개 독립 golden, R/CDF 경계의 직전·동일·직후, .5/.45, 0..12회 기각, stage20/21/25/26, 무효 Callable/sample 및 늦은13번째 sample 실패를 포함한다. 실제 게임/전체 constructor를 실행한 oracle이 아니다.

| 실행 | 실제 결과 | 비고 |
|---|---:|---|
| 신규 `test_ch5_enemy_spawn_policy` | **24,493/0**, 원문1,990사례 | 첫 실행 통과, skip0 |
| 회귀 `test_ch4_enemy_spawn_policy` | **22,364/0** | 1회, 원문2,814사례 |
| 회귀 `test_ch3_enemy_spawn_policy` | **10,234/0** | 1회, 원문1,632사례 |
| 회귀 `test_ch2_enemy_spawn_policy` | **7,483/0** | 1회, 원문2,406사례 |
| 결함 주입: D3→F1 | **741실패 검출** | 의도한 음성 실행 exit1, ERROR0 |
| 결함 주입: 유형 .5에 ≤ 적용 | **2,045실패 검출** | 엄격 경계·소비열 검출 |
| 결함 주입: 재시도12→11 | **110실패 검출** | fallback/다음 호출 cursor 검출 |
| 결함 주입: 정수 누적 후 CDF 정규화 | **150실패 검출** | 원문 float64 누적 경계 검출 |

정상 실행4종 모두 exit0/ERROR0/WARNING0/skip0. 직접 관련 선택 정책군 회귀 합계 **40,081/0**, 신규 포함 **64,574/0**이다. 최적화 지시에 따라 catalog/constructor/phase/factory/contracts 등 변경 파일을 소비하지 않는 광범위 스위트는 이번에 반복 실행하지 않았다. 결함 주입은 핵심4종으로 제한했고 음성 실패를 정상 통과 합계에 넣지 않았다. 4종 주입 종료 뒤 원래 정책 byte를 복원했으며 최종 SHA가 정상 첫 실행의 SHA와 정확히 같아 통과한 신규 테스트를 다시 실행하지 않았다.

Godot4.7.2 / Node24.15.0. 신규 격리명 `EXODUSER-ec5-01-Isolated-20261020`, 기존은 각 파일 상수의 EC4/EC3/EC2 격리명 사용. 매 Godot 실행 전에 지정 pgrep 수를 검사하고 2 이상이면30초 대기하는 runner를 사용했다. 실행마다 override 설정, 종료마다0byte 확인. 총8회(정상4+의도한 결함4), editor/import0. 실창·실적 스폰·전투·PC 실행은 미확인이다.

원로그 `~/exoduser-wt/_out/ec5-01/`: 실행별 `*.out.log`, `*.err.log`, `*.engine.log`, `*.meta.json`, 원문 oracle/단정 JSONL, `mutations.json`, `process-gate.jsonl`, 보호 검사/제출 receipt. 자체 branch 정상 push·원격 SHA 일치·DONE 작성 뒤 자기 worktree 제거, branch와 원로그는 보존한다. 전체 CH5 적이나 제품 연결 완료로 승격하지 않는다.
