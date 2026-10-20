# QA-007 / QA-007b 테스트 실행 전제 (Mac / Windows)

제품 이식이 아닌 테스트 하니스 변경이다. 상세 결과·원인 판정은
[QA-007 보고서](../../../docs/engine/orders/reports/qa-007_REPORT.md)와
[QA-007b 후속 보고서](../../../docs/engine/orders/reports/qa-007b_REPORT.md)를 참조한다.
기존 테스트는 각 파일의 `USERDIR` 격리 이름을 그대로 사용한다. 신규 수송 검사는
`EXODUSER-qa-007-Isolated-20261020`, 후속 검사는
`EXODUSER-qa-007b-Isolated-20261020`을 사용한다. 실제 사용자 세이브에서 실행하지 않는다.

## 새 sparse worktree와 acorn

`--no-checkout` worktree에서 테스트 경로 외에도 `/godot/`, `/engine/`, `/tools/`,
`/test/`, `/game.html`, `/index.html`, `/maps_data.js`, `/server.cjs`, `/node-main.js`,
`/package.json`, `/package-lock.json`, `/ch1-living-detail.js` 등 추출기가 읽는 root JS 및 해당 snapshot의 `source.files`·resource manifest의
`assets[].source` 원본 파일을 받아야 한다. 대용량 웹 에셋 전체는 필요하지 않다.
Godot editor import도 필요한 리소스가 모두 있는 자기 worktree에서 수행한다.

오라클/추출기의 `acorn`은 Git에 포함되지 않은 `node_modules` 의존이다.
새 worktree 루트에서 `npm ci --ignore-scripts --no-audit --no-fund`로 lockfile을 설치하거나,
이미 설치·검증한 **같은 저장소**의 `node_modules`를 연결한다. Mac 예:

```sh
ln -s /path/to/verified-checkout/node_modules node_modules
node -p 'require.resolve("acorn")'
node -p 'require("acorn/package.json").version'
```

Windows에서는 실제 Node 경로를 사용하며, 폴더 junction으로 연결할 수 있다
(이미 존재하는 `node_modules`를 지우거나 덮어쓰지 않는다).

```powershell
$node = 'C:/nvm4w/nodejs/node.exe'
New-Item -ItemType Junction -Path node_modules -Target 'G:/exoduser/node_modules'
& $node -p 'require.resolve("acorn")'
& $node -p 'require("acorn/package.json").version'
$env:EXODUSER_NODE_BIN = $node
```

`--node-bin=<absolute executable>`가 환경변수 `EXODUSER_NODE_BIN`보다 우선한다.
둘 다 없으면 `node`를 찾는다. Windows의 깨진 system32 shim을 피하려면 위 절대 경로를
명시한다. 네 저장 복원/읽기 테스트와 NW-01/02/03 모두 동일한 선택 규칙을 쓴다.

## 실행과 수송 검사

Mac에서 **매 Godot 실행 전** 다음 값이 2 이상이면 30초 대기 후 다시 확인한다.

```sh
pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l
```

자기 worktree의 `godot/override.cfg`로 `application/config/use_custom_user_dir=true`와
해당 테스트 `USERDIR`의 `config/custom_user_dir_name`을 지정하고, 실행 후 복원한다.
기존 override가 있으면 덮어쓰지 않는다. 일반 호출 형식:

```sh
/path/to/Godot --headless --path godot --script res://tests/test_native_inventory_restore.gd -- --node-bin=/absolute/path/to/node --artifacts-dir=/absolute/external/qa-logs
/path/to/Godot --headless --path godot --script res://tests/test_native_slot_reader.gd -- --node-bin=/absolute/path/to/node --artifacts-dir=/absolute/external/qa-logs
node --test test/fdgCh1AreaSource.test.mjs test/fdgCh1Stage1Source.test.mjs test/fdgCh1Stage1World.test.mjs test/fdgCh2Stage4Source.test.mjs test/fdgCh2Stage4World.test.mjs
node --test test/qa007Portability.test.mjs test/qa007bPortability.test.mjs
```

`test_qa007_oracle_transport.gd`는 모든 두 조각 경계·한 글자 조각의 JSON 결합을 검사하고,
잘린 문서·추가 문서·빈 출력 거부도 검사한다. SV 4종과 NW 3종 오라클은 선택적 세 번째 인자로 받은
새 파일에 UTF-8 JSON을 쓰며(`wx`, 덮어쓰기 거부), 파일 미지정 시 기존 stdout 계약을 유지한다.
SV/NW 테스트는 자기 격리 userdir의 고유 임시 파일을 읽고 삭제한다.
SV의 한글은 OS.execute 콘솔 출력에서 복구하지 않는다. 파일은 UTF-8이며 콘솔은 진단용이다.
4종 모두 `--artifacts-dir`에 자기 외부 로그 경로를 명시한다. 원문 hash/고유 마커/결과
비교는 유지한다. 원문 변조·기존 출력 덮어쓰기 거부는 Node 추가 검사에 포함된다.

Windows 링크 검사는 원본 루트 밖의 임시 사본을 가리키는 디렉터리 junction 아래 출력 경로로 동일한 `isSymbolicLink()` 조상
거부 루프에 들어간다. 생성 실패를 무시하거나 skip하지 않는다. 추가 검사는 Mac에서도
Windows 선택을 강제하여 두 exporter 모두 원래 거부 메시지·무기록을 확인한다.
CH1 Stage1 Source/World에는 원래 링크 생성 검사가 없으며 이들의 전체 회귀는 그대로 실행한다.

CH2-02 외부 oracle을 만들 때 기존 `export_ch2_area_resources.mjs` CLI는 고정 manifest도
재작성한다. 현재 main ref가 바뀌면 게임 내용이 같아도 `source.main_sha` 때문에 pin이 달라진다.
순수 관측만 필요하면 `buildResources(root)`를 import해 반환값의 `queries`·`los`를 외부 파일에
저장한다. 채택된 manifest/pin이나 기대값을 자동 갱신해서 실패를 감추지 않는다.

QA-007b의 `test_qa007b_oracle_transport.gd`는 고의로 분할된 `???`·잘못된 콘솔 JSON과
정상 UTF-8 파일을 동시에 내는 fixture로 실제 수송을 검사한다. 원래 slot reader의 Unicode
escape 파싱 값과 파일 expected도 정확 비교하며, 파일 누락·잘림·Node 실패에서 콘솔 fallback을
허용하지 않는다. 신규 격리명을 설정하고 `-- --node-bin=/absolute/path/to/node`로 실행한다.

`qa007bPortability.test.mjs`는 Windows 경로 API로 다른 드라이브·대소문자·정확한 snapshot
whitelist를 검증하고, Mac에서도 실제 디렉터리 별칭으로 CLI를 실행해 잘못된 stage/seed와
제품 대상 출력이 exit1·무기록으로 거부되는지 검사한다. 임시 경로가 다른 드라이브에 있다고
원본 내부로 분류하거나, 별칭 경로 때문에 main()을 생략하고 exit0으로 끝내면 실패다.
