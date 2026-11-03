# BC-CHAIN-M — 보스 브랜치 정상 merge 통합

- 기준 main: `0105159934d0c2a8b167bd51518dca1e0fafe50a` (fetch 후 고정).
- 절차: BC08 ← main, BC09 ← BC08, BC-INTEG-01 ← BC09, BC3-02 ← BC-INTEG-01. rebase·force push 없음.
- 원본 game.html SHA256: `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. 수치·무브 변경 없음.

## 충돌 해소 근거

| 파일 | 선택·근거 | 검증 |
|---|---|---|
| native_ch1_boss_selector.gd | main 바이트 그대로. BC04 선택/RNG 식을 유지한 장 catalog 인자 전달·provider 검사를 보존. 구 BC08 파일은 승인된 BC04 원본과 동일하여 추가 고유 변경 없음 | G38373–38442 / BC04·CH2 재사용 회귀 |
| native_ch1_boss_phase.gd | main 바이트 그대로. BC05 phase/clock/continuation의 catalog 전달 보존. 구 BC08 파일은 BC05 원본과 동일 | G38236–38312·38584–41383 해당 checkpoint / BC05·CH2 재사용 회귀 |
| native_ch1_boss_pattern_start.gd | main 바이트 그대로. BC06 장 인자·token provider/owner gate 보존. 구 BC08 파일은 BC06 원본과 동일 | G37701–38233 / BC06·CH2 재사용 회귀 |
| native_ch1_boss_melee_states.gd | main 바이트 그대로. BC07 장 인자·token provider 검사 및 BC10과 호환 유지. 구 BC08 파일은 BC07 원본과 동일 | G41074–41183 / BC07·BC10·CH2 BC2-06/07 회귀 |
| native_ch1_boss_movement_states.gd (3단계 add/add) | 수락된 dcd32b49 바이트 그대로. catalog resolve/bind/from_token·phase provider를 더한 BC08 일반화를 유지. 이동식 복제 없음 | G38315–38355·40483–40517·40664–40708·40942–40977 / BC08·BC-INTEG CH1 var_to_bytes 비교 |
| WORK_BOARD.md (3단계) | 앞 체인 전체와 BC-INTEG-01 자기 행을 보존. BC-CHAIN-M 자기 행만 단계 갱신 | 다른 담당 행 보존 |
| CHANGELOG_SYNC.md | 양쪽 고유 절을 보존하고 이번 merge 절 추가. 과거 실행 수치는 당시 이력으로 유지 | 정상 pre-commit 훅 |

## 범위·기록

- BC08 고유 이동 모듈은 `1b901f12` 원문 보존. BC09 고유 projectile producer는 다음 단계에서 합친다. 공통식 복제·packet 사후 덮어쓰기 없음.
- 1단계 BC09 회귀는 아직 합치지 않은 `0113315e` projectile 모듈을 격리 프로젝트에만 공급한 선행 호환 검사다. 저장소에 BC09가 포함됐다는 뜻은 아니다. 2단계부터 실제 체인 파일을 검사한다.
- BC-INTEG-01의 색 정정·BC08 장 인자 일반화는 3단계에서 보존한다. CH1 byte 비교의 기준은 수락된 BC08 원문이며 검사 대상은 각 체인의 실제 파일이다.
- WORK_BOARD의 BC08·09 과거 “main 병합” 표기는 실제 Git 도달성과 다르다. 사용자 확인과 이번 parent 이력을 기준으로 통합한다. 기존 다른 담당 행은 보존한다.
- 기존 회귀 파일·기대값 수정0. 각 파일 USERDIR 상수 사용, Godot 실행 전 지정 pgrep 명령·30초 대기, --node-bin 및 --source-game 전달. 원로그·입력 SHA는 `_out/bc-chain-m/<단계>/`.
- Main/State/저장 보호 파일은 기준 main 바이트 그대로. R HEAD·branch·index 및 tracked work 보존.

## 단계별 검증

각 단계에서 아래 회귀를 실제 실행했다. 원격 SHA·최종 단계 자신의 SHA는 `_out/bc-chain-m/DONE.txt` 및 단계별 remote.json에 기록한다. 테스트 PASS는 실제 피해·패링·Main 연결/플레이 품질 검수 완료가 아니다.

## 검증 하니스 초기 진단

1단계에 새로 추가한 CH2 BC2-06·07 격리 래퍼는 config/name 누락으로 각각 3단정/1실패(격리 경로 검사)를 기록했다. 원본 테스트는 fixture 생성 전에 반환했다. 래퍼 이름 설정만 보강하고 기존 테스트·제품 byte를 유지해 재실행했다. 최초 로그 및 정정 로그 모두 보존한다.

기준 main CHANGELOG_SYNC에는 이전 merge 충돌 표식 10줄이 남아 있었다. 양쪽 모든 본문을 보존하고 표식 행만 제거했다(정리 전 원문 보존). 첫 git diff --check 실패 후 정정했으며 훅을 우회하지 않았다.

3단계의 소환·이동 모듈은 수락된 dcd32b49와 바이트가 같다. 소환 근거는 game.html:14338 ELC·31163 mkEn col=ELC[el]·16631–16713 장 속성이다. CH1/CH2 el0 회색, CH3 el2 #3388ff를 유지한다. BC-INTEG의 비교 기준은 수락된 BC08 1b901f12이며 검사 대상은 3/4단계 실제 체인 파일이다. 기준 hash·var_to_bytes 단정·기존 테스트는 수정하지 않았다.

| 단계 | 브랜치·결과 SHA | BC01~10 | CH2 7종 | BC-INTEG | CH3 catalog / reuse | contracts |
|---|---|---|---|---|---|---|
| 01-bc08 | `codex/bc08-20261020` / 66ff67a0552d8ecc98bdbb9b2a689a4a08cf0bc0 | 354,093/0 | 230,546/0 | 통합 전(미실행) | 43,491/0 · 후속 단계(미실행) | 5/0 |
| 02-bc09 | `codex/bc09-20261020` / 2c29b697858fcc6c7ab55bea77d88ddb87627eb1 | 354,093/0 | 230,546/0 | 통합 전(미실행) | 43,491/0 · 후속 단계(미실행) | 5/0 |
| 03-bc-integ-01 | `codex/bc-integ-01-20261020` / 이번 merge commit(DONE 참조) | 354,093/0 | 230,546/0 | 73,394/0 | 43,491/0 · 후속 단계(미실행) | 5/0 |
