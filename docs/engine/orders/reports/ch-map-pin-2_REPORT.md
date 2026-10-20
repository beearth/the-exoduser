# ch-map-pin-2 보고서 — 병합 후 provenance 테스트 판정

## 기준과 재현

| 항목 | 실제 값 |
|---|---|
| 최신 main | `0105159934d0c2a8b167bd51518dca1e0fafe50a` (fetch 후 분기) |
| 브랜치 / 작업 폴더 | `codex/ch-map-pin-2-20261020` / `~/exoduser-wt/ch-map-pin-2` |
| 생성 | R에서 worktree add --no-checkout 후 sparse-checkout set --no-cone. godot/docs/engine/test/tools·루트 JS·CH1 layout/geometry 2개와 CH2 원본 참조 asset29개만 수신 |
| 원로그 L | `/Users/fordeargamers/exoduser-wt/_out/ch-map-pin-2/` |
| Mac 원문 재현 | fdgMapResourceProvenance **4/0**, skip0, exit0. PC 1/3을 그대로 재현했다고 주장하지 않음 |
| 통제 재현 | 작업 폴더 manifest 읽기만 b25a018ace5a3fa65c9c2476a8c3ac92509077b3 출처 JSON으로 치환. 실제 Git/파일/제품 변경0. SHA **9e2090601ea580432ed008e7aec0ecac363864d4134ad24961b125b5c725b63c** — PC 첫 실패와 일치 |
| 같은 조건 기존 / 정정 | 기존 **1/3**(unchanged / corrupted collider / prior CLI rewrite 실패), 정정 **7/0**. expected b25a018ac와 실제 8524bbbb4 불일치도 동일 |
| 정상 조건 정정 | 기존 4개 유지+새 3개 = **7/0**, skip0 |
| map-node-9 병합 | 6c0d93704abc12f0eade5c35f176a39044ca8869 merge·37/0 조합 검증은 다음 마감 단계에서 실행 예정 |

## 원인과 정정

기존 `test/fdgMapResourceProvenance.test.mjs:13–16`은 작업 폴더 manifest를 expected로 읽었고, :27–29는 fixture의 .git을 호출 worktree Git 디렉터리로 연결했다. 한 fixture 안에서 expected JSON은 작업 출력이고, exporter가 회복하는 admitted JSON은 실제 HEAD 기록이어서 출처가 서로 달라질 수 있었다. root HEAD/마지막 변경 커밋 번호를 provenance 권위로 추정하면 metadata-only 병합과 CLI 출력 순서에 의존한다. MAP-LOOK metadata 자체가 geometry를 바꿨다는 증거는 없다.

공용 writer `godot/tools/export_ch2_area_resources.mjs:87–114`는 native payload 전체(원본 game 바이트 검증 후 main_sha만 제외)를 비교해 versioned admitted bytes를 회복한다. 이번에는 이 동작을 고치지 않고 테스트 입력의 권위·Git refs를 일치시켰다.

| OLD | NEW / 근거 |
|---|---|
| root 작업 파일 manifest/raw/reader 상수 혼합 | 테스트 :17–21에서 동일 versioned snapshot의 **JSON blob·reader pin** 읽기. HEAD는 기록된 blob을 얻는 입구이며 `source.main_sha == HEAD`나 git log의 마지막 변경 SHA를 기대값으로 쓰지 않음 |
| fixture .git이 root worktree HEAD/refs/index 공유 | :34–46에 fixture 자체 Git refs/index/tree 생성. 기록된 source commit 객체만 readonly alternates로 읽음. root Git/branch/index 쓰기0·symlink0 |
| fixture game/maps_data/package가 checkout 개행/미커밋 출력에 종속 | :35,39에서 fixture 전용 core.autocrlf=false, versioned 원본 바이트 사용. PNG는 기존 바이트 복사·수정0 |
| CLI 재작성용 출처가 매번 origin/main 현재 SHA | fixture가 가진 별도 커밋을 사용하고 그 `game.html` 실제 SHA-256을 검증. 특정 역사 SHA 고정0 |
| 기존 원본 commit 검증이 root Git 참조 | fixture Git에서 **기록된 provenance JSON의 source.main_sha로 조회한 game 바이트**를 검증. 기대 provenance 문자열도 JSON에서만 가져옴 |
| 출처 JSON만 달라도 고정 fixture pin을 적용 | 새 독립 admission variant는 main_sha 1필드만 다른 전체 JSON이 실제 동일 native payload임을 먼저 deepEqual하고, 그 JSON의 정확 바이트·hash 보존/복구를 확인. 제품 reader pin은 원래 4bf1a8…로 그대로 검증·변경0 |

기존 SHA pin `4bf1a8cab02f1ad2b3d199d0b05a155e51bbb59a9ff4911a6cb8c657fd4d0279`, game SHA `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`는 변경하지 않았다. payload 비교에서 collider/props/assets/metadata 등을 제외하거나 main_sha를 무조건 무시하는 검사를 추가하지 않았다.

## 검사 보존·새 사례

기존 테스트명 4개와 assert 22개를 유지했다. 정적 assert는 **22→39**. AST 대조에서 바뀐 기존 호출 1개는 recorded game 검증의 cwd를 root→fixture로 옮긴 것뿐이며 같은 SHA-256 equality를 유지한다(`L/assertion-audit.json`). 기존 reject/no-oracle·collider exact 배열·manifest 전체 deepEqual·byte pin·oracle10998/LOS400 검사는 그대로다.

| 추가 테스트 | 검증 내용 |
|---|---|
| metadata-only merge | 실제 두 부모 Git commit+map_look_ch1.json metadata를 만들고, source.main_sha가 merge HEAD와 달라도 원래 provenance JSON·바이트 pin 유지 |
| another admitted provenance JSON | 같은 game 바이트·native 전체 값, 다른 source.main_sha 1개로 다른 유효 JSON/hash 구성. corrupted collider 및 prior CLI provenance rewrite 양쪽 모두 해당 admitted **전체 JSON/정확 바이트/hash**로 복구 |
| resolvable different original bytes | 존재하는 유효 commit의 game만 다르게 만든 뒤 recorded source로 제시. bytes mismatch 거부, 기존 출력 byte 유지·oracle 미생성 |

기존 Node temp prefix EXODUSER-ch-map-pin-Isolated-20261020 유지, 새 사례만 EXODUSER-ch-map-pin-2-Isolated-20261020 사용. 모든 fixture는 finally 해제. 실제 Godot userdir/사용자 저장 접근0.

## 결함 주입 (PASS 집계 제외)

공용 exporter는 수정하지 않았다. `L/mutation-tools/`의 외부 바이트 사본에만 변형하고 정정 테스트를 실행했다. 각 변형 후 사본도 원문 복원했다.

| 외부 writer 결함 | 검출 실패 수 | exit |
|---|---|---|
| fresh-provenance-rewrite | 5 | 1 |
| retain-corrupt-output | 3 | 1 |
| no-admitted-recovery | 3 | 1 |
| no-source-verification | 2 | 1 |

`fresh-provenance-rewrite`는 원래 same-native 추출이 main_sha를 새로 써서 pin을 깨뜨리는 결함, `no-admitted-recovery`는 이미 출처만 덮인 파일을 되돌리지 못하는 결함이다. 둘 다 기존 검사가 계속 검출한다. source 검증 우회는 미존재 commit 및 존재하지만 다른 game 바이트를 모두 검출한다. corrupted output 보존도 검출한다. 원문·OLD/NEW·수치는 `mutation-results.json` 및 각 `.stdout.log`에 보존했다.

## 마감 검증 상태

이 절은 map-node-9 실제 병합·조합 실행 후 마감 결과로 갱신한다. 현재 제품/데이터/공용 exporter2/Main/State/저장 변경0이며, 임의 source pin 갱신0이다. Godot/import/실창 실행0(테스트 하니스만 변경); OS.execute 사용0. Node 실행은 절대 binary 경로와 전체 stdout/stderr UTF-8 파일로 기록했다. PC 실제 재실행은 미확인이고 Mac 통제 재현만 확인했다.

R은 시작 branch/head 및 tracked INDEX/WORK를 `R-start.json`으로 보존했다. 정상 docs-sync 훅·자기 브랜치 일반 push·원격 SHA 일치 확인·DONE.txt 후 자기 worktree 제거를 마감 단계에서 수행한다. main push/force/reset/rebase/add -A 0.
