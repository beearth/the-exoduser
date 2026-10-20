# CH2-05m — CH2-04m 연쇄 병합

CH2-05 `61eba4b89ec7786d0d4b4eb5f2675a7bb16b5534`에 최신 main `249c26fad989071a94c19128e524ce0bbcb2c8c9`를 정상 merge한다. 이어 CH2-04m `2654588c29e4bd5fb4a9e613b8e041a994c52966`도 정상 merge하여 최신 의존 계보를 보존한다. rebase/reset/force0. 로그는 `~/exoduser-wt/_out/ch2-04m/ch2-05/`, 전체 최종 SHA는 부모 폴더 DONE.txt다.

두 추출기는 stage4/5/7 기능에 QA-007b의 isInsideRoot/isMatchingSnapshot/isDirectExecution을 결합했다. CH2-04/05 소유 Node 두 파일의 링크 음성검사는 인수된 outputSymlink junction helper를 사용하며 검사수/expected/원본값/거부조건은 유지했다. 나머지 QA UTF-8 파일·join·--node-bin·junction 구현/테스트는 main과 byte 동일이다. CHANGELOG는 양쪽 절을 보존한다.

main 직접 merge 체크포인트는 `54dbdd86318183175a7c43f85f277add54413553`다. 이어 갱신 CH2-04를 merge할 때 resource 도구의 지원목록/CLI 두 구역과 CHANGELOG가 충돌했다. 이미 QA helper를 포함한 stage4/5/7 코드를 유지하고 양쪽 절을 보존했다. 첫 체크포인트와 최종 실행 코드의 byte 차이0을 확인해 앞서 통과한 Node 결과의 범위를 보존했다(dependency-code-comparison.json).

| 실제 검증 | 결과 |
|---|---|
| primary-node | 신규si7 10/0·CH2-04 7/0·QA-007 4/0·QA-007b 7/0=28/0·skip0·exit0 |
| ch205-source / ch205-gui | 365/0·2465/0, 원 Node VM exit0, isW/canMv각10038·LOS400·물리센터40000/union 불일치0·BFS185·8뷰/1x크롭3 |
| regress-node / map-node | 기존58/0, 맵37중28/9 선재 전체 이름·순서 동일. 새실패0 |
| 맵·기존 Godot | source344/0·362/0·CH1 63/0·75/0·189/0·si4World894/0·si5World2086/0·contracts5그룹/실패단정0·굴298/0·지역43/0 |
| QA 수송 | 원 QA-007 63/0·QA-007b 50/0. UTF-8 파일·join·--node-bin·fallback 거부 유지 |
| SV 4종 / NW 3종 | inventory126863/0·player78620/0·shared149486/0·slot5952/0, query2304/0·portal1851/0·action3060/0 |

Godot22회(import 포함) 모두 exit0·SCRIPT ERROR/ERROR0, 기존 Camera2D/ObjectDB 경고 원문 보존. 지정 pgrep2이상이면30초 대기를 여러 번 수행했고 타 프로세스 종료0이다. 기존 파일 상수 userdir·단위 import/contracts는 EXODUSER-ch2-04m-Isolated-20261020, override 매회/finally0byte·자기 APFS clone만 사용했다. Node는 --node-bin 외부 인자/UTF-8 로그·OS.execute 출력 join, 제품/검사에 고정 OS Node 경로를 새로 넣지 않았다.

순수365/0·GUI2465/0·기존source344/0 뒤 재사용 회귀 큐의 기준 로그 폴더를 중첩 OUT의 형제로 잘못 계산해 FileNotFoundError로 멈췄다. Godot 실행 전 하니스 오류였으며 sequence-harness-error.log에 남기고 정확한 기존 로그 폴더로 고쳐 미실행 검사만 재개했다. 원문/테스트/expected/pin을 바꾸지 않았다. 보호3241개 SHA 동일, QA 보존 대상은 main249c26fad와 byte 동일이다. 실제 Windows 실행과 전체 제품 플레이·깊이/조명 완성은 미확인이다.

si7 source048815d1…/resource042def09… pin·14굴/1100·분면250/300/350/200·272객체/42원/13texture와 Main 미연결 scope는 그대로다. Main/State/저장 제품·원본 HTML/JS/PNG·기존 manifest/pin 자기수정0. 화면 판정 RETOUCH 유지, 깊이·부분광원은 MAPLOOK 소관이다. 자기 branch 일반push/원격일치·DONE 뒤 sparse worktree/cache를 제거하고 R을 보존한다.
