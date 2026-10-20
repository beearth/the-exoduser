# QA-007 — Windows 테스트 하니스 이식성

상태: **지정 하니스 수정·Mac 전후 동등성 검증 완료. 제품 변경 0행. Windows 실제 실행·PC 원로그 대조는 미확인.** 기존 Node 실패 1건을 유지한다. FB-01 후속 제품 작업은 진행하지 않았다.

## 기준과 범위

- 브랜치 `codex/qa-007-20261020`. fetch 후 기준 `origin/main=26c050a99a711e793a6c2413395acda09b0c1614`; 요구한 `26c050a99` 이상임을 ancestor 검사했다. 선행 미병합 브랜치 의존 없음.
- `worktree add --no-checkout` 후 `sparse-checkout set --no-cone`. Godot/engine/test/tools/docs와 원본 파일, manifest가 가리키는 정확한 웹 원본 자산만 추가했다. 대용량 웹 에셋 전체 checkout 없음.
- 대상은 명시된 저장 복원·읽기 4개, NW 3개, CH2-02 원인 확인 1개: 실제 식별한 Godot 파일 8개다. PC의 “9종” 전체 원로그 `G:/exoduser-wt/_out/merge-batch2/`는 이 Mac에서 접근하지 못했다. 명시되지 않은 아홉 번째 파일의 이름·결과는 미확인이다.
- 수정은 기존 Godot 테스트 7개, 기존 Node 테스트 3개, NW 오라클 3개와 신규 테스트 전용 수송/링크 보조·검사·실행 안내, 이 보고서, CHANGELOG_SYNC 신규 절이다. Main/State/공용 제품·`native_skill_slots.gd`·원본·기존 fixture/pin 최종 diff 0행. 기대값/원문 발췌/단정 삭제·skip 추가 0.
- 원로그 L=`~/exoduser-wt/_out/qa-007/`. R의 branch/HEAD/index/work 시작값은 `R-start.json`; 종료 때 같은 항목을 다시 대조한다. R의 HEAD는 `dd49171c5b88e211575a41f185395d6c0a14b184`이다.

## 수정한 경로와 유지한 검사

| 대상 | 원인과 수정 | 유지한 검증 |
|---|---|---|
| `test_native_inventory_restore.gd`, `test_native_player_restore.gd`, `test_native_shared_store_read.gd`, `test_native_slot_reader.gd` | `output[0]` 및 `output.size()==1` 전제 제거. 테스트 전용 `qa007/oracle_transport.gd::decode_output`에서 모든 조각을 `"".join(output)`으로 결합한 뒤 JSON 파싱 | exit0·비어 있지 않은 출력·Dictionary·모든 기존 source/값/타입/불변성 비교. 조각 수만 OS별 가변임을 허용하며 단정 수 불변 |
| NW-01/02/03 Godot 테스트와 `tools/nw0*_oracle.cjs` | 표준 출력 JSON 대신 자기 격리 userdir의 고유 임시 파일을 인자로 전달. Node가 `encoding:'utf8', flag:'wx'`로 기록하고 FileAccess가 UTF-8로 읽은 뒤 삭제. 파일 없음/쓰기 실패/삭제 실패는 성공 처리하지 않음 | 전체 game hash, 고유 마커·행 발췌 hash, 원문 VM 결과·순서·타입·원본/scene/RNG 불변성 그대로. 파일 미지정 oracle stdout 계약도 유지 |
| 7개 Godot 테스트의 Node 실행 선택 | `--node-bin=` > `EXODUSER_NODE_BIN` > `node` 순서. NW-02/03 고정 `OS.execute("node",...)` 제거, 저장 테스트의 Mac 절대 기본 경로도 제거 | 실제 NW-02에서 env만 사용·깨진 env를 CLI로 덮기 각 1851/0 확인. 셸 문자열 조립 없이 executable/인자 분리 |
| `fdgCh1AreaSource`, `fdgCh2Stage4Source`, `fdgCh2Stage4World` | Mac은 기존 파일 링크, Windows는 권한 상승이 필요 없는 디렉터리 junction 아래 경로. `lstat().isSymbolicLink()`를 검사하는 **동일 조상 거부 루프**를 사용 | 원래 `Symlink output rejected` 예외/CLI 실패와 무기록 검사 유지. 생성 오류 catch/skip 없음. 일반 파일 거부로 대체하지 않음 |
| `fdgCh1Stage1Source`, `fdgCh1Stage1World` | 코드 확인 결과 원래 심볼릭 링크 생성 검사 없음. 두 파일 수정 0행, 전체 회귀 포함 | 기존 9건·5건 그대로. 후자의 선재 출처 SHA 실패도 보존 |

수송 보조는 `godot/tests/qa007/`에만 있으며 제품 모듈이 참조하지 않는다. Node 보조 `tools/oracle_json_output.cjs`도 위 테스트 오라클만 사용한다. 본문 값/행/한글을 변환하거나 해시 비교를 느슨하게 만들지 않았다. 원본 `game.html` SHA256은 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4` 그대로다. NW 대상 원본은 G18309–18322·30160–30161·31534–31535·31723·32827–32853이며, 기존 NW 보고서의 발췌 pin을 갱신하지 않았다.

PC의 NW 209/137/283 실패는 한글 발췌·명령/문구를 콘솔에서 잘못 디코딩하면 hash 및 정확 비교가 연쇄 실패할 수 있는 구조다. UTF-8 파일 경유로 해당 경로를 제거했다. 실제 PC의 동일 실패 수 소멸은 미확인이다. CRLF 변환 등으로 원본 **byte**가 달라진 경우에는 기존 hash 검사가 계속 실패해야 한다.

## Mac 수정 전후 실측

Godot 4.7.2 stable, Node v24.15.0, acorn 8.16.0. 기존 테스트는 파일 상수 `USERDIR`를 사용했다. `test_contracts`에는 이 상수가 없어 신규 QA 격리를 명시했다. 기존 격리 이름·원본 입력·fixture는 변경하지 않았다.

초기 준비 실행 4개는 결과 집계에서 제외한다. inventory/player/shared는 외부 artifacts 인자 누락으로 즉시 exit2, slot_reader는 sparse `server.cjs` 누락으로 Node 실패/JSON 오류가 발생했다. 인자와 정확한 sparse 파일을 보완한 **수정 전 원본 테스트 byte** 재실행 `before-ready-*`를 아래 기준으로 사용했다. 원본 테스트 사본은 L/baseline-*.gd로 보존하고 제품 preload는 같은 `res://`를 사용했다. 실패 out/err/meta도 보존했다.

| Godot 파일 (`test_…gd`) | 수정 전 단정/실패 | 수정 후 단정/실패 | 비고 |
|---|---:|---:|---|
| native_inventory_restore | 126863/0 | 126863/0 | exit0, ERROR0 |
| native_player_restore | 78620/0 | 78620/0 | exit0, ERROR0 |
| native_shared_store_read | 149486/0 | 149486/0 | exit0, ERROR0 |
| native_slot_reader | 5952/0 | 5952/0 | strict_json_boundaries도 각88/0 |
| native_world_interaction_query | 2304/0 | 2304/0 | 원문104상황 유지 |
| native_player_portal_proposal | 1851/0 | 1851/0 | 원문68상황 유지 |
| native_map_object_action_proposal | 3060/0 | 3060/0 | 원문141상황 유지 |
| ch2_02_stage4_world | 894/0 | 894/0 | Camera2D interpolation WARNING1 동일 |
| 합계 | **369030/0** | **369030/0** | 8종 모두 stdout·stderr SHA256도 전후 동일 |

| Node 파일 | 수정 전 통과/실패 | 수정 후 통과/실패 |
|---|---:|---:|
| fdgCh1AreaSource | 9/0 | 9/0 |
| fdgCh1Stage1Source | 9/0 | 9/0 |
| fdgCh1Stage1World | 4/1 | 4/1 |
| fdgCh2Stage4Source | 11/0 | 11/0 |
| fdgCh2Stage4World | 7/0 | 7/0 |
| 합계 | **40/1** | **40/1** |

CH1 Stage1 World 실패는 저장된 bundle의 `source.main_sha=e556b617…`와 현재 `26c050a99…` 차이 1건이다. 기존 [CH2-02 보고서](ch2-02_REPORT.md)의 동일 테스트 출처 ref 실패 기록과 일치한다. 해당 검사/기대값은 수정하지 않았다. Node 5종 전체 PASS라고 보고하지 않는다. 실행 취소/skip은 전후 0이다.

추가 검증:

| 검사 | 실측 |
|---|---|
| `test_qa007_oracle_transport.gd` | **63/0**, 한글·보조 평면 문자·escape·중첩 JSON의 모든 두 조각 경계, 한 글자씩 분할, 추가 문서·잘린 문서·빈 출력 거부 |
| `qa007Portability.test.mjs` | **4/0**, NW 3종 파일/stdout 전체 byte 동일·기존 출력 덮어쓰기 거부·원본 변조 hash 거부; 강제 Windows 선택으로 두 exporter의 동일 링크 조상 거부/무기록 검증 |
| NW-02 env 전용 / CLI 우선 | 각 **1851/0**, 기본 비교와 stdout도 동일. 본 회귀 합계에 중복 합산하지 않음 |
| test_contracts | **5그룹/실패 단정0**, exit0·ERROR0 |

L/before-after-comparison.json은 전후 수치·로그 hash 대조이다. 개별 실행 argv·userdir·exit·결과·stdout/stderr/engine log 및 SHA를 같은 prefix로 남겼다. 추가 Node 검사는 L/new-node.out/err이다.

## 원인 확인만 한 2건

| 항목 | 근거와 판정 | 조치 / 한계 |
|---|---|---|
| slot_reader `strict_json_boundaries`의 `parsed JSON.x value` | `tools/sv_transport_read_oracle.cjs:34–36`의 raw는 ASCII `{"x":"\uAC00\uD83D\uDE00"}`이고 expected는 JS JSON.parse 결과인 `가😀`다. stdout UTF-8를 Windows-1252로 잘못 읽는 모사에서 raw는 불변인데 expected만 `ê°€ðŸ˜€`가 되어 **정확히1건** 불일치. Mac 실제 전후 strict 그룹은88/0이며 전체5952/0 | 하니스 코드페이지 오독으로 같은 증상을 만드는 원인 확인. PC 원로그 byte/실제 사용 코드페이지가 없어 그 1건의 직접 원인 확정은 **미확인**. `source_slot_reader.gd:87–97` 제품 parser와 기대값은 무수정. 후속 수정안은 slot oracle도 UTF-8 파일 경유(이번 항목은 원인 확인만) |
| CH2-02 `standalone_scene_ready / resource_manifest_pin` | `native_ch2_area_resources.gd:27`은 manifest의 byte SHA를 검사한다. 채택 SHA `4bf1a8ca…`는 현재 파일과 일치해 전후894/0. 최신 ref에서 exporter를 재생성하면 게임 SHA/내용은 같고 **source.main_sha 한 필드만** `8524bbbb…`→`26c050a99…`로 변해 manifest SHA `6987cff3…`가 됨. 이 사본으로 실제 Godot 진단을 실행해 `CH2_02_FAIL standalone_scene_ready`와 `["resource_manifest_pin"]`을 재현(exit1, RESULT 없음) | 재추출이 채택된 고정 manifest를 덮는 하니스/실행 순서 문제를 확인. 진단은 PASS 집계0. finally 원본 byte·SHA 복원. 제품 pin 자동 갱신/검사 약화0. 과거 Mac CH2-02 보존 로그에서 이 오류 원문은 찾지 못했으며 PC 원로그도 미접근이라 과거1건과 **직접 동일 원인인지 미확인**, 동일 오류 경로 재현까지 확인 |

CH2 진단 근거는 L/ch2-pin-diagnosis.json, ch2-admitted-manifest.json, ch2-regenerated-manifest.json, diagnostic-ch2-regenerated-pin.*, ch2-manifest-restored.json이다. slot 코드페이지 모사는 L/slot-codepage-diagnosis.json/err이며 Windows 실제 실행으로 표시하지 않았다. 제품 결함을 수정하거나 값을 수용하도록 기대값을 갱신하지 않았다.

## 설치·실행 안내와 남은 범위

새 worktree에는 `node_modules(acorn)`이 자동으로 생기지 않는다. lockfile 기준 `npm ci --ignore-scripts --no-audit --no-fund` 또는 검증한 동일 저장소 node_modules의 Mac symlink/Windows junction 연결이 필요하다. 이번에는 R의 기존 설치를 읽기 전용 링크하고 `require.resolve('acorn')`·버전8.16.0을 확인했다. 관련 테스트 실행 안내는 [godot/tests/qa007/README.md](../../../../godot/tests/qa007/README.md)에 절대 Node 경로/환경변수/격리/명령 형식과 함께 기록했다. 설치된 의존성·cache·실제 세이브·로컬 절대 경로 설정은 커밋하지 않는다.

CH2 외부 oracle만 필요하면 pure `buildResources(root)`의 queries/los를 외부 파일에 저장하여 채택 manifest 재작성을 피한다. 기존 CLI를 사용한 전후 회귀는 manifest 원본 byte를 별도 보존하고 finally 복원했다. NW 임시 출력은 자기 격리 userdir에만 기록/삭제한다.

지정 4개 외 `test_native_save_collector.gd:136`, `test_native_restore_flow.gd:66`, `test_native_save_primitive.gd:68`에도 output[0] 사용이 남아 있다. 이번 명시 대상과 별개여서 수정하지 않았으며 PC 아홉 번째 실패와의 관계는 미확인이다. Windows 실제 동등성·전체 30종/전체 게임 PASS는 주장하지 않는다. FB-02 및 Main/State 연결도 진행하지 않았다.

매 Godot launch 전 정확한 pgrep/wc를 실행했고 2 이상이면30초 대기 후 재검사했다(L/process-gate.jsonl). 자기 프로세스는 순차 실행, 타 Godot 강제 종료0. override는 매 실행 finally 제거했다. 정상 pre-commit 훅을 거쳐 자기 브랜치만 push하고 원격 SHA 일치·DONE 기록 후 자기 worktree만 제거한다. 최종 SHA/원격 확인/변경 경로/R 보존/정리 결과는 L/DONE.txt 및 submission.json, cleanup-verification.json에 기록한다.
