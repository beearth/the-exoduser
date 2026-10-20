# CH2-04m — QA-007b·main 정상 merge

작업ID ch2-04m, 원로그 L=`~/exoduser-wt/_out/ch2-04m/`. CH2-04 브랜치 `codex/ch2-04-20261020`의 d4298e89dd4f1432a5fca94defd391f8ec075b2d에 fetch 최신 origin/main **249c26fad989071a94c19128e524ce0bbcb2c8c9**를 `git merge --no-commit --no-ff`로 통합했다. rebase/reset/force는 없다. sparse --no-checkout worktree는 ~/exoduser-wt/ch2-04m이며 R HEAD/branch/INDEX/WORK를 보존한다.

## 충돌 해결·보호

| 경로 | 해결 |
| --- | --- |
| godot/tools/export_ch1_area_source.mjs | CH2-03/04의 stage5·부재 compose/STG/undefined mask·동적 stage 출력 계약 유지. QA-007b의 isInsideRoot/isMatchingSnapshot/isDirectExecution 사용을 결합, 다른 드라이브·대소문자·실제 별칭 entrypoint 판정 보존 |
| godot/tools/export_ch2_area_resources.mjs | 기본4/선택5·자동 배치·원 렌더분기/충돌·manifest/oracle 출력 유지. QA의 isInsideRoot/isDirectExecution을 그대로 적용. 조상 symlink 거부 루프·schema/stage 거부 유지 |
| docs/CHANGELOG_SYNC.md | 양쪽 추가 절을 모두 남겼으며 본 절을 최상단에 추가 |
| test/fdgCh2Stage5World.test.mjs | 자기 소유 symlink 음성검사만 인수된 outputSymlink helper로 연결. Windows junction 선택과 외부 사본 보호를 재사용, 검사7건/기대값/거부 조건 불변 |

cli_paths.mjs·outputSymlink.mjs·QA-007/007b 테스트·UTF-8 oracle/transport·SV/NW 수송 변경은 main과 byte 동일하다(qa-preserved-files.json). UTF-8 임시 파일·출력 join·--node-bin 선택·junction을 버리거나 기존 stdout fallback을 되살리지 않았다. Main/World/player/hud/State/저장 제품 모듈·원본 HTML/JS/이미지·기존 source/resource manifest/pin에 자기 수정0이다. main에서 들어온 인수 변경과 충돌 해결 변경을 구분한다. Main/공용 제품·save_adapter는 양 부모 사이에도 차이가 없었다.

원 source game SHA4d911cdd…/65692행, si5 source18bdcdbb… 및 resource6f969f19… pin을 그대로 유지했다. 272객체/271sprite/42analytic원/36tile1·4rect/12texture/원light156 overlay와 standalone scope 불변. 원화 byte·원 수치·기존 provenance를 통과용으로 다시 쓰지 않았다. 보호 baseline3226개 모두 SHA 동일이다.

## 실제 검증

| L prefix | 결과 |
| --- | --- |
| primary-node-final | CH2-04 **7/0**, QA-007 **4/0**, QA-007b **7/0** =18/0·skip0·exit0 |
| ch204-gui | **2464/0**, 실창1920×1080 8뷰, isW/canMv각10038·LOS400·40000union/Physics센터 차이0·BFS185·왕복370 |
| regress-node | 기존 source39+si4 consumer7+asset6+pit6=58/0 |
| map-node | 37중28/9, 이전 CH2-04의9개 전체 실패 이름·순서 동일(map-comparison.json), 새실패0 |
| 기존 맵 Godot | source344/0·362/0·CH1 63/0·75/0·189/0·si4World894/0·contracts5그룹/실패단정0·굴298/0·지역43/0 |
| QA Godot | 원 QA-007 transport63/0·QA-007b transport50/0 |
| SV 4종 | inventory126863/0·player78620/0·shared149486/0·slot5952/0. --node-bin·외부 artifacts-dir, UTF-8 파일과 실제 JSON.x 한글/보조문자 비교 유지 |
| NW 3종 | query2304/0·portal1851/0·action3060/0. 원문 hash·명령 순서·원 oracle 수송 검사 유지 |

전체 Godot20회(import 포함) SCRIPT ERROR/ERROR0·exit0, Camera2D interpolation/ObjectDB 경고는 원 stderr에 보존했다. 매 실행 지정 pgrep/wc를 기록하고2이상이면30초 대기했다. 기존 검사는 파일 상수 격리명, import/상수 없는 contracts는 EXODUSER-ch2-04m-Isolated-20261020. override 매회/finally0byte·자기 APFS cache clone만 사용·타 Godot 종료0. Node 하니스는 --node-bin 필수·argv·UTF-8 stdout/stderr 로그를 쓴다.

초기 primary-node는17/1: sparse에 server.cjs가 없어 SV transport oracle이 ENOENT로 실패했다. sparse add에 지원하지 않는 --no-cone 옵션을 쓴1회와 의존 추가 전에 재실행한6/1도 그대로 보존했다. 현재 non-cone 설정에서 `sparse-checkout add /server.cjs` 성공을 확인한 뒤18/0으로 재검증했다. QA 테스트·원문·expected·제품 pin은 바꾸지 않았다. 기능 실패를 PASS로 덮지 않았다.

L/captures/의8뷰는 기능 재현 자료다. 기존 **RETOUCH** 판정 유지, 단일 반복 바닥/성긴 배치/단순 원형 overlay·Main/실P/진행 미연결은 그대로다. 신규 깊이·부분광원은 MAPLOOK 소관이다. Windows 경로 API·junction 선택을 Mac에서 검사했으며 실제 이 브랜치의 Windows 실행은 미확인이다. 사용자 전달 로비8실패는 이번 재실행 없이 원문만 기록한다.

## CH2-05 체인·제출

CH2-05 61eba4b89ec7786d0d4b4eb5f2675a7bb16b5534도 d4298e89 체인이므로 같은 main을 직접 merge하고 stage7 기능과 QA 수정 양쪽을 보존한다. 이어 갱신된 CH2-04 merge 커밋도 정상 merge하여 최신 의존을 계보에 남긴다. CH2-05 실제 결과·최종 SHA는 L/ch2-05/ 및 전체 DONE/submission-receipt.json에 기록한다. 최종 두 브랜치만 일반 push·원격 SHA 대조 뒤 DONE.txt를 작성하고 자기 worktree/cache만 제거한다. 원로그·검토용 사본·브랜치는 남긴다. main push/force/rebase/reset/git add -A/hook 우회0이다.
