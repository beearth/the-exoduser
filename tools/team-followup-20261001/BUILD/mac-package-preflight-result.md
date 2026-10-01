# Mac 패키지 안전 사전검사 도구 인계

## 수신·Read·Edit·검수
- 수신/첫Read: 2026-10-01T15:26:19Z(10월2일00:26:19 KST). 전용경로에는task만 있어 중복없음. 요구대로 receipt를 먼저 생성한 뒤 구현했다.
- 실제Read: AGENTS.md/범위하위AGENTS검색(추가없음), BUILD 팀 INTEGRATION_BUILD_TEAM_MASTER.md, BUILD_BACKUP_POLICY_20261001.md, package.json/build-nwjs.mjs/node-main.js/server.cjs, 기존mac-executable-inventory-20261002.json, 설치된nw-builder의package/타입/bld/osx코드를읽었다.
- 첫코드Edit: 2026-10-01T15:27:38Z, mac-package-preflight-cli.mjs mtime. 소형fixture/test/inventory와실제읽기전용manifest추가.
- 최종검수: 2026-10-01T15:29:28Z. `node --test tools/team-followup-20261001/BUILD/mac-package-preflight-test.mjs` **28PASS/0FAIL**, 약123ms. 원게임코드반복회귀가아닌신규CLI정상·거부검수다.
- 한국어결과/receipt기록완료: 2026-10-01T15:30:47Z.
- 실제CLI는아래명령으로실행하여exit2/**BLOCKED**를기록했다. 도구구현완료와Mac런타임/패키지인수BLOCKED는별개다. 실제 .app 생성·복사·압축·실행0.

```sh
node tools/team-followup-20261001/BUILD/mac-package-preflight-cli.mjs tools/team-followup-20261001/BUILD/mac-package-preflight-manifest.json
```

## 실제 소스 판단
| 대상 | 확인결과 |
|---|---|
| build-nwjs.mjs | NW.js0.111.2, platform='win',arch='x64' 고정. ffmpeg.dll의Windows체크섬/복사필수. Mac분기/arm64옵션없음 |
| 기본빌드 | dist/와out/EXODUSER-win64 삭제·교체가능. 실행금지유지 |
| integration옵션 | 고유ID 충돌거부는있으나플랫폼은여전히Windows. 복사본만3347·고유userdata/저장명으로치환 |
| package.json | mainlocalhost3333/node-remote3333, 상대userdata프로필. 원서버와프로필격리필요. type:module 제거는기존빌더의스테이징단계 |
| node-main.js | 서버3333고정, APPDATA없으면homedir()/EXODUSER-HELL/saves. Mac에서도기존사용자저장과공유될수있음. 실행하면로그/저장mkdir/서버부작용이있어import/실행하지않음 |
| server.cjs | 개발서버PORT/HOST/EXODUSER_SAVE_DIR환경변수지원. 기본ROOT/saves. .app런타임아님, 패키징용node-main설정과별개 |
| nw-builder4.17.10 설치소스 | osx플랫폼·arm64/x64타입과Mac처리분기는존재. cache/nwjs-vVERSION-osx-ARCH 및nwjs.app/Contents/Resources/app.nw 사용. 라이브러리지원은실제런타임보유/해당버전아키텍처배포증거아님 |
| nw-builder bld.js | outDir를rm후cache를cp한다. 원격런타임다운로드경로도있어import/빌드실행0 |
| Mac추가필요 | 대상arch용실제NW.js.app/Contents/MacOS/nwjs·Info.plist·Frameworks/Helpers 및버전/코덱증거. Mac용아이콘/plist·권한/서명·현재브라우저보존하검수계획별도 |

실행중Node는darwin/arm64. x64런타임실행가능성/Rosetta상태는UNKNOWN이며실행확인하지않았다. Windows DLL을Mac코덱으로간주하지않는다.

## 제한적 런타임 재고
`node .../mac-package-preflight-inventory.mjs`는다음10루트각1단계이름만읽었다(최대200개,이번잘림없음). 전체디스크/앱내부재귀/프로세스/UI/저장파일내용검사0.

| 범위 | 결과 |
|---|---|
| /Applications | 9항목: Chrome/ChatGPT/VS Code 등, NW.js/EXODUSER.app없음 |
| ~/Applications | Claude Code URL Handler.app만있음 |
| ~/Library/Caches/{nwjs,nw-builder,nw} | 각각ENOENT |
| ~/.cache/nwjs | ENOENT |
| 프로젝트/cache, node_modules/.cache, node_modules/nw | 각각ENOENT |
| 프로젝트/vendor/nwjs-ffmpeg/0.111.2 | README.md/ffmpeg.dll만있음 |

기존inventory는프로젝트깊이6에서Mac앱/Windows실행파일없음기록이었다. 이번조사는그원자료를수정하지않고알려진앱/캐시만확장했다. **arm64/x64 Mac NW.js 런타임: 조사범위내미발견, BLOCKED**. 범위밖은UNKNOWN이며전디스크부재로주장하지않는다. Chrome/VS Code내부Chromium/Electron은NW.js대체증거가아니다.

## CLI 계약 및 실제 결과
| 검사 | 계약/이번실제결과 |
|---|---|
| 입력 | 명시적regular파일목록만해시. 절대경로/../빈세그먼트/역슬래시/중복/디렉터리거부. 입력SHA=backupSha256=읽은파일SHA필요 |
| 사용자데이터보호 | save/saves/userdata/profile/tmp/.git/.env/node_modules/out/dist·기존.app/.exe/.nw/.dll/.zip·키포함경로거부. 이름검사후파일내용읽기. 실제세이브조회/복사0 |
| symlink/별칭 | 입력/출력/root/런타임경로모든부모lstat로symlink거부. dangling출력link도거부. input/runtimebinary는O_NOFOLLOW·nlink1필수로hardlink도거부 |
| 읽기도중변경 | 파일descriptor전후size/mtime/ctime대조. 전체트리불변스냅샷이나적대적동시부모교체방어를보장하지않음. 실제빌드직전불변입력·전체재검증필수 |
| 원격복구 | 제공local/remote40hex SHA동일, 실제refs/heads또는refs/tags와조회시각필수. 외부Git조회아님;허위자기신고의진위를독립증명하지않음 |
| 고유출력 | arch+UUID이름,기존file/dir/link충돌거부. 새경로제안만하고mkdir/예약0. 실제생성직전독점mkdir·충돌재검사필요 |
| 런타임 | 명시.app/Info.plist/nwjs파일·binary SHA·thin64 Mach-O CPU타입검사. universal/미지원헤더는UNKNOWN으로거부. 완전한.app/서명/실행보장은아님 |
| 현재소스 | gameSHA 21235538c9766a28b04dcf529aed9883a8aa11bdbfef8e9e2ce35d5cc927c5cf,live-prewarm/preflight기록과일치 |
| 원격참조 | 기록의4fb217eaae985b196a9ff0b90fdd1ed1eb02ceca local/remote는일치하나ref명이미제공. UNKNOWN을조작해채우지않아BACKUP_EVIDENCE_REQUIRED |
| 현재런타임 | runtime=null→MAC_RUNTIME_MISSING |
| 최종 | **BLOCKED/exit2/packageCreated=false**, 실제출력미생성 |

manifest는읽을수있는복구근거가있는game1파일만대조하는최소실행예시이며전체게임·필수에셋manifest가아니다. 다른파일현재SHA를알고있다고그파일이해당원격커밋에포함됨을추정하지않았다. PASS_DRY_RUN도실제패키징승인이아닌제공된목록의검사통과다.

## 신규28검사 근거
정상arm64 fixture, 정상x64 fixture, 실제CLI JSON/exit·실행옵션거부 및25개실패경계를검사했다: 출력충돌,입력SHA,원격commit/입력SHA/시각/ref,빈목록,save/userdata/기존.app/.env,입력../절대경로,출력탈출,입력link/rootlink/출력rootlink/danglinglink/hardlink,런타임없음/arch/SHA/link,폴더/중복입력.
fixture는소유mac-package-preflight-fixture-*에만생성후삭제. Runtime.app은32바이트합성Mach-O헤더와가짜plist뿐인소형검사자료이며실행가능.app을생성한것이아니다. 사용자세이브는fixture에서도내용을읽기전에경로거부한다. 테스트출력 mac-package-preflight-tests.txt에보존.

## 입력 SHA·보존
| 파일 | SHA-256 |
|---|---|
| package.json | 58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8 |
| build-nwjs.mjs | 567a4b2d6761974b8763abe03ac3c50fc5b973c36be6324c7200ac27b445a78f |
| node-main.js | 01b0c1d51f77f500ee0a59185458bf0294edce12544482d6cf7abce4262c91ce |
| server.cjs | 339fad6ab51cba92f6ca7a386c8aeb251f68cdb58cdfa55c109f57b1758a42ad |

시작/최종대조에서5생산소스SHA동일. 도구SHA는mac-package-preflight-hashes.txt,범위/이름은inventory.json,현재검사는current.json에남겼다. 관련docs검색은mac-package-preflight-docs.txt. source backup과실행앱/ZIP보유·검수·업로드는서로별도이며이번실행패키지생성/업로드0.

## 공유 docs 반영안·root 후속
BUILD팀/백업정책에다음을반영하도록제안한다: 현재프로젝트빌더Windows전용,Mac런타임미발견BLOCKED,신규read-only CLI28검사완료,전체입력manifest/정확원격ref·조회증거/arm64또는x64실제runtime필요. source원격백업을Mac실행앱완료로표시하지않는다.
root는별도승인된단계에서대상arch·버전·코덱을확정하고런타임확보/무결성·서명검수,공용Windows빌더를실행하지않는Mac독립후보,전체에셋명시목록·원격파일해시보존,고유출력/포트/프로필/저장격리를준비해야한다. 그뒤에만앱생성·로비/전투/저장재로드·출력SHA/백업을별도검수한다. 이번작업은그준비도구만인계한다.
현재사용자Chrome입력/리로드/닫기/계측0. 게임/서버/다운로드/설치/빌드/압축/소스복사/Git/queue/권한/새세션/에이전트0. 생산·타팀·공유docs·원자료수정0. root자동메시지0,이번한건으로종료.
