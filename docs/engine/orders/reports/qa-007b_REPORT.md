# QA-007b — Windows 콘솔 Unicode·junction·CLI 경로 후속

기준은 fetch한 `origin/main=6d987cb8a31d0aadd2b6a8cf1e9a781d1fb76d4d`(QA-007 병합 포함)이다.
브랜치는 `codex/qa-007b-20261020`. 테스트·오라클/추출 도구·실행 안내와 이 보고서만 변경했다.
제품·게임 원본·씬·manifest·pin·기존 기대값 변경은 **0행**이다. Windows 실기 실행은 **미확인**이며
아래 결과는 Mac 실행 및 Windows 경로/손상 모사다. PC에서 같은 명령으로 재검증해야 한다.

원로그 디렉터리 `L=~/exoduser-wt/_out/qa-007b/`.
선행 결과는 [QA-007 보고서](qa-007_REPORT.md), 테스트 전제는
[실행 안내](../../../../godot/tests/qa007/README.md)를 참조한다.

## 원인과 수정

| 대상 | 확인한 원인 | 수정·유지한 검증 |
|---|---|---|
| SV inventory/player/shared/slot 4종 | OS.execute 출력 조각을 합쳐도 이미 코드페이지에서 손상된 한글은 복구되지 않는다. Node가 낸 UTF-8 JSON의 expected 문자열은 literal 한글이고 raw Unicode escape는 ASCII라 서로 다른 값이 될 수 있다 | 기존 NW의 `execute_file`을 재사용. Node의 선택적 3번째 인자에 자기 격리 userdir의 고유 새 파일을 전달하고 UTF-8로 읽어 파싱 후 삭제. stdout은 진단용이며 fallback 없음. 기존 source hash·타입·값·순서·부작용·격리 단정과 수는 유지 |
| SV Node 오라클 4종 | 콘솔 전용 최종 직렬화 | 기존 `oracle_json_output.cjs` 재사용. 인자 없으면 기존 stdout 바이트 계약, 인자 있으면 UTF-8 파일 `wx` 작성/덮어쓰기 거부. 원문 추출·VM·cases·wire 직렬화 값은 그대로 |
| Windows junction 4검사 | 기존 helper가 보호된 원본 파일의 부모를 junction 대상으로 삼아 realpath 이후 원본 내부 출력 guard가 먼저 작동할 수 있음 | 외부 임시 디렉터리에 같은 파일의 사본을 만들고 그 디렉터리로 junction 생성. 원래 `isSymbolicLink()` 조상 검사와 `Symlink output rejected` 기대값 유지. 생성 오류 catch/skip·대체 성공·OR 정규식 추가 없음. 원본/사본/채택 manifest 무기록 확인 |
| CH1 CLI가 exit0 | direct-entry가 단순 문자열 경로 equality라 별칭·대소문자가 달라지면 main() 자체를 생략. Mac에서도 디렉터리 symlink를 거친 잘못된 stage 호출이 exit0/무출력/무기록임을 수정 전 재현 | 실제 realpath의 동일성을 OS 경로 API로 판정. 별칭으로 호출해도 원래 argument guard가 실행되어 exit1. CH2 exporter의 같은 진입 전제도 수정 |
| Windows source 경로 | 다른 드라이브의 `path.win32.relative()` 결과는 절대 경로다. 기존 부모 경로 prefix 방식은 이를 내부로 오판. snapshot 허용 경로의 `/` 하드코딩도 Windows 역슬래시 결과와 불일치 | 도구 전용 `cli_paths.mjs`: 상대 결과의 absolute/부모/동일 root를 분리하고 exact snapshot 경로를 OS API로 비교. 기존 다른 stage·game.html·map.json·외부 파일 덮어쓰기/링크 거부는 유지 |

`execute_file`은 누락 파일/잘린 JSON/실패한 Node를 성공으로 바꾸지 않는다. JSON.new().parse의
오류 상태를 반환하며 파일이 있으면 실패 시에도 자기 파일만 삭제한다. 기존 `decode_output`은
분할 검사 용도로 남겼으나 SV/NW의 데이터 입력은 파일이다. Node 선택 우선순위도
`--node-bin=` > `EXODUSER_NODE_BIN` > `node` 그대로다.

## JSON.x와 객체·pin 판정

| 관측 | 원본·재현 근거 | 판정 / 남은 확인 |
|---|---|---|
| slot `parsed JSON.x value` | `tools/sv_transport_read_oracle.cjs`의 raw는 ASCII `{"x":"\uAC00\uD83D\uDE00"}`, expected는 `가😀`. UTF-8 결과에서 비ASCII UTF-16 문자를 `?`로 바꾸면 raw는 불변, expected는 정확히 `???`. 원래 JSON wire의 -0→0 직렬화를 적용한 유효 cases 전체 비교에서 **그 1건만** 불일치. Windows-1252 오독 모사도 포함. 새 Godot 검사는 실제 제품 reader의 Unicode escape 결과와 파일 expected 및 `가😀`를 정확 비교 | PC 보고 증상과 같은 하니스 손상 경로 확인. 파일 전달로 이 경로 제거. Mac strict 그룹 전후88/0·전체5952/0. PC 실제 콘솔 바이트/코드페이지는 미접근이므로 해당 실행의 직접 원인 확정은 미확인 |
| CH1Stage1World `latest main original full initMapObjects ... 12 hands` | 저장 bundle의 main_sha는 `e556b617190c325ca39f5add04357f5dea5ca87e`, 현재 ref는 `6d987cb8...`. 전체 객체 깊은 비교에서 **source.main_sha만** 다름. 비교를 위한 별도 진단에서 그 필드만 기존 값으로 놓으면 나머지 모든 source/game/hash/객체/12 hands/배열이 정확히 같음. `L/provenance-diagnosis.json` | QA-007 및 [CH2-02 보고서](ch2-02_REPORT.md)에 보존된 Mac 선재 1실패와 동일한 출처 ref 차이. 기존 whole-bundle 단정/fixture를 수정하지 않아 전후4통과/1실패 유지. 제품 객체 결함 근거 없음. PC 원본 diff는 미확인 |
| CH2-02 `resource_manifest_pin` | 채택 manifest SHA는 `4bf1a8cab02f1ad2b3d199d0b05a155e51bbb59a9ff4911a6cb8c657fd4d0279`로 제품 pin과 일치. 현재 main에서 재생성한 SHA는 `4cc9341efa99f5697758643824e798b26dcf51f6065b51d3f69686960433c7b1`; main_sha가 `8524bbbb...`→`6d987cb8...`인 것만 다르고 나머지는 깊은 비교 동일 | exporter가 채택 manifest를 다시 쓰는 실행 순서/출처 문제. 이번 정상 회귀는 exporter 뒤 finally로 채택 byte 복원 후 실행. QA-007의 별도 Godot 음성 진단에서 같은 `CH2_02_FAIL standalone_scene_ready` / `["resource_manifest_pin"]`을 실제 재현한 원문 보존. 이번 작업에서도 별도 음성 진단으로 같은 exit1·RESULT 없음·오류 원문을 재현하고 원본 byte/SHA를 finally 복원(`diagnostic-ch2-restoration.json`). 제품 pin/manifest 자동 갱신0. 더 오래된 Mac CH2-02 최초 1건 및 PC 해당 파일의 직접 동일 원인/CRLF 여부는 원로그·SHA 부족으로 미확인 |

작업 중 다른 세션의 fetch로 공용 `origin/main` ref가 `2c3c211ff3c9e2be4e2754d608f9f0ea963588b2`로
전진했다. 작업 브랜치의 기준/제품 파일은6d987cb8a 그대로다. 마지막 읽기 전용 재진단은
`L/diagnose-provenance.mjs`와 `L/provenance-diagnosis-final.json`에 보존했으며 새 ref에서도
출처 main_sha 외 전체 동일을 재확인했다. 이때 생성한 CH2 사본 SHA는
`7f1311039d56628ecedff91a03529ea51486a64e99615a9338eaf6eaf4ba4b2b`이고 바로 그 사본으로
음성 진단을 했다. ref 변화 자체가 pin 변화를 일으킨다는 추가 근거다.

출처 필드 정규화는 **원인 진단만** 사용했다. 기존 회귀에는 적용하지 않았다. manifest가 다른
상태는 실제 제품이 거부해야 하는 상태이므로 제품 수정안은 필요하지 않다. 후속 하니스 실행자는
관측용 `buildResources(root)`를 쓰거나 재생성 뒤 채택 manifest를 byte 그대로 복원해야 한다.
PC 결과에서 다른 SHA/객체 diff가 나오면 이 결론과 별도로 원문을 대조해야 한다.

## Mac 수정 전후

모든 기존 테스트의 단정/통과 수와 RESULT를 비교한다. 일부 테스트가 RESULT 없이 exit0으로
끝나거나 engine ERROR를 남기면 PASS가 아니다. Node의 기존 1실패를 제외하거나 성공으로 세지 않았다.

| 기존 테스트 | 수정 전 통과/실패 | 수정 후 통과/실패 |
|---|---:|---:|
| inventory_restore | 126863/0 | 126863/0 |
| player_restore | 78620/0 | 78620/0 |
| shared_store_read | 149486/0 | 149486/0 |
| slot_reader (strict JSON은88/0) | 5952/0 | 5952/0 |
| NW world_interaction_query | 2304/0 | 2304/0 |
| NW player_portal_proposal | 1851/0 | 1851/0 |
| NW map_object_action_proposal | 3060/0 | 3060/0 |
| ch2_02_stage4_world | 894/0 | 894/0 |
| 기존 qa007_oracle_transport | 63/0 | 63/0 |
| **Godot 합계** | **369093/0** | **369093/0** |
| fdgCh1AreaSource | 9/0 | 9/0 |
| fdgCh1Stage1Source | 9/0 | 9/0 |
| fdgCh1Stage1World | 4/1 | 4/1 |
| fdgCh2Stage4Source | 11/0 | 11/0 |
| fdgCh2Stage4World | 7/0 | 7/0 |
| 기존 qa007Portability | 4/0 | 4/0 |
| **Node 합계** | **44/1** | **44/1** |

최종 RESULT·stdout/stderr 동등성 및 정확한 로그 선택은 `L/before-after-comparison.json`에 기록했다. 9종 모두 RESULT·stdout/stderr가 byte 동일이다.
CH2 기존 Camera2D interpolation WARNING1도 보존한다. contracts는5그룹/실패0이며 제품 회귀 의미를
새 테스트로 대체하지 않았다.

| 추가 검사 | 결과 | 실제 검증 범위 |
|---|---:|---|
| test_qa007b_oracle_transport.gd | 50/0 | 실제 Node fixture의 분할·???·잘못된 JSON stdout을 무시하고 UTF-8 파일의 한글/emoji/escape/제품 slot parser 결과 정확 비교. 누락/잘림/Node exit3 거부·임시 파일 잔류0·모든 JSON 조각 경계 |
| qa007bPortability.test.mjs | 7/0 | SV4 stdout/file byte 동일·출처 존재·덮어쓰기 거부, ???·Windows1252 손상, win32 다른 드라이브/대소문자/정확한 whitelist, 실제 alias CLI exit1, 외부 junction에서 두 exporter의 같은 거부·무기록 |

Mac에서 Windows helper 분기를 강제로 선택했으나 실제 NTFS junction/Windows OS.execute 실행을
했다고 주장하지 않는다. Windows 재검증이 남아 있다. 기존 테스트 skip/cancel0.

## 실패 원문과 준비 절차

| 로그 | 기록 / 조치 |
|---|---|
| before-fdg* 초기 Node 실행 | sparse에 추가 원본 `ch1-living-detail.js`가 없어 setup 실패. root `/*.js`를 추가하고 **수정 전 원본**으로 before-ready Node5를 재실행. 초기 결과는 비교 합계에서 제외하고 원문은 보존 |
| after inventory/player/shared 첫 실행 | 파일 전환 후 오류 진단문 1곳씩에 옛 output 변수가 남아 parse error. `oracle_receipt.diagnostics`로 수정하고 final3을 별도 이름으로 재실행. 실패 원문 유지 |
| new-node-final | 최초 손상 비교가 Node의 Object.is(-0,0) 차이를 추가로 셈. 오라클과 같은 JSON wire 직렬화를 명시한 **새 모사 검사만** 수정; 정확한 JSON.x·전체 유효 cases 비교 유지. 최종 new-node-final2 7/0. 기존 검사 변경 없음 |
| baseline-cli-alias.json | 수정 전 실제 alias 호출이 잘못된 stage인데 exit0인 재현. 수정 뒤 같은 경로로 exit1/거부/무기록 |
| baseline-win32-paths.jsonl | 다른 드라이브 relative 결과가 absolute인데 oldInside=true인 모사 원문 |

1. `worktree add --no-checkout -b codex/qa-007b-20261020 ... <fetched-main>` 뒤 sparse-checkout으로
   docs/godot/engine/test/tools/원본 HTML·root JS·package 파일 및 manifest가 요구하는 정확한 원본
   assets만 받았다. root JS 전체 패턴은 대용량 웹 에셋 폴더를 받지 않는다.
2. 오라클의 acorn이 필요하다. 자기 worktree에서 `npm ci --ignore-scripts` 또는 해당 lockfile과
   호환되는 준비된 node_modules 연결을 한다. 이번에는 R의 node_modules를 읽기 연결했고
   acorn8.16.0을 확인했다. R에서 설치/수정하지 않았다. 링크는 제출 파일이 아니다.
3. Mac Node는 `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node`,
   Godot4.7.2 사용. 기존 테스트는 각 파일 상수 격리명, 새 검사는
   `EXODUSER-qa-007b-Isolated-20261020`. artifacts는 L 아래만 썼다.
4. **매 Godot launch 전** `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l` 실행.
   2 이상인 동안30초 대기/재조회했고 원문은 `L/process-gate.jsonl`. override는 존재 여부를
   먼저 확인하고 finally 삭제. 기존 실제 사용자 세이브/제품 런타임 접속 없음.
5. 관련 docs 키워드 검색은 `L/related-docs-search.txt`. 과거 보고서는 역사 기록으로 보존하고
   현재 실행 안내·후속 보고서·CHANGELOG_SYNC 맨 위 절을 갱신했다. 훅 우회0.

## 제출 범위

제품 경로·원본·기존 manifest·native_skill_slots.gd 변경0. 기존 테스트의 비교/기대값 삭제0.
R의 branch/HEAD와 tracked INDEX/WORK를 작업 시작·끝에 따로 비교하고 자기 worktree만 제출/제거한다.
커밋 전 범위 감사는 `L/scope-audit.json`, 최종 SHA·원격 일치·worktree 제거는 `L/DONE.txt`와
`L/submission.json`에 기록한다. 자기 브랜치만 일반 push하며 main push/force/add -A는 하지 않는다.
