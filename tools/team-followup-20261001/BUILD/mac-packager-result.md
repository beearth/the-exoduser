# Mac 실제 packager 연결 후보 인계

## 수신·실제 작업·상태
- 수신/첫Read: 2026-10-01T15:51:27Z. 동일소유에는task만있어중복없음. receipt 생성, AGENTS/BUILD팀/백업정책/실제Windows빌더/package/node-main 및설치nw-builder index/bld/osx/util을읽었다. 기존preflight/생산은수정하지않았다.
- 첫코드Edit: 2026-10-01T15:53:35Z(packager.mjs 생성시각근거). plan/execute/실제adapter/fixture검사를구현했다.
- 최종검수: 2026-10-01T15:57:09Z, **34PASS/0FAIL**, 약401ms. `node --test tools/team-followup-20261001/BUILD/mac-packager/test.mjs` 실제출력과spy호출인자는 mac-packager-tests-final.txt.
- 최초30PASS/1FAIL 로그는 mac-packager-tests.txt에보존. 실패는import검사하니스가Node모듈로더자체의소스open까지차단한것이다. Node getSourceSync만허용하고애플리케이션I/O는계속throw하도록구분해31PASS,추가arch/부분실패검사후34PASS. 실제다운로드/빌드실패를숨긴것이아니다.
- 구현/fixture접속완료. **실제runtime BLOCKED,실제.app미생성**. 현재CLI는plan만실행하고MAC_RUNTIME_MISSING/exit2/packageCreated=false를반환했다. 실제사용자게임/Chrome은입력·리로드·닫기·계측하지않았다.

## 설치 API에 맞춘 실제 연결
`mac-packager/packager.mjs`가실행후보다. 최상위index의`nwbuild()`는build모드에서도`getReleaseInfo`/`await get({...})`를항상거친다. cache=true는다운로드금지가아니며manifest.nwbuild가인자를덮어쓸수있다. 따라서최상위default는사용하지않는다.

승인된execute의기본adapter `localBuild`는설치된nw-builder4.17.10의`src/bld.js` default bld를지연import하고실제로`await build(args)`에연결한다. 이내부API는공개안정API라고주장하지않으며index/bld/util/osx해시와버전을고정한다. 변경시LIBRARY_SOURCE_CHANGED로차단하고재인수한다. 네트워크/권한우회가아니라직접로컬패키징함수선택이다. getter/getReleaseInfo/runner/설치경로를호출하지않는다.

| 실제bld 인자 | 연결계약 |
|---|---|
| platform | 실제process.platform=darwin필수→osx |
| arch | 기본process.arch,또는명시arm64/x64. 해당cache런타임Mach-O헤더CPU타입과대조 |
| version/flavor | 0.111.2/normal 고정 |
| cacheDir | 명시로컬cacheRoot; nwjs-v0.111.2-osx-ARCH/nwjs.app 존재·전체명시SHA필수 |
| srcDir/outDir | 독점생성job/stage와job/package. 기존dist/out/app에연결하지않음 |
| glob/managedManifest/zip | 모두false. 파일목록은검수된stage전체, deps설치/압축0 |
| releaseInfo | 명시절대JSON경로·SHA를검사해읽은v0.111.2/실제chromium버전자료. URL전달/원격조회0 |
| app | 안전한UUID기반name/CFBundleIdentifier/버전/게임category. Windowsico를Mac아이콘으로강제복사하지않음 |

실제bld는rm(outDir)후cache를cp하고osx는.app/주binary/helper/plist를변경한다. 본후보는오직새job안의빈output을예약해그rm이기존실행본을지우지못하도록한다. osx구현은catch후오류를삼키므로bld resolve만으로성공을보고하지않는다. 결과주binary원SHA·CFBundleExecutable,4helper이름/실행파일/plist,파생package/node-main 및모든원입력SHA를후검증한다. 누락/부분변경이면실패로처리한다.

## 입력·파생·소유 계약
- sourceRoot의승인된inputRoots 전체파일목록을읽어명시inputs와backup.inputs 각각정확히대조한다. 선택root중파일추가/삭제/누락/중복/겹침과SHA변경을거부한다. package/node-main/index/game4필수파일이없으면차단. root가선택root목록을실제build FILES/DIRS/lang/atlas·최종런타임의존성전체와대조해야하며,선택밖의미지의게임참조까지자동보장하지않는다.
- backup.sha=remoteSha/refs/조회UTC와정확파일별SHA가필수다. 시작인계98aedab7dd3df41a57c2311bfc4cf79731057e60은이후변경보존근거가아니다. 현재config의ref/UTC/파일별backup목록은UNKNOWN/미제공을그대로유지한다. 자기신고SHA가원격커밋내용과실제로같은지는root의독립조회증거계약이며후보가Git을조회하지않는다.
- source와runtime파일을읽을때regular/nlink1/O_NOFOLLOW·전후size/mtime/ctime를검사한다. source save/profile/dist/out/.app/.exe/.nw/.env/tmp/Git경로·탈출·symlink거부. runtime의정상상대framework symlink는전체목록에target과SHA를기록하고realpath가해당runtime루트안일때만허용;절대/외부링크거부. 실제세이브내용을읽지않았다.
- 고유job은mkdir(비recursive)독점예약. stage/output도그안에서새로만생성한다. inode/dev로생성소유를확인하고실패시본인이생성한job만정리한다. 원래있는충돌job은삭제하지않는다. source/runtime전체목록을stage완료후다시대조한다. 악의적동시경로교체까지완전히방어하는샌드박스가아니므로root는입력/런타임작업을동결해야한다.
- 파생package는화이트리스트필드만선택해type/scripts/deps/nwbuild를제거한다. main/node-remote는명시격리port,기존user-data-dir 하나만job/user-state/profile절대경로로치환한다. node-main의PORT3333/SAVE_DIR원문이정확히1개씩일때만격리port/job/user-state/saves로파생한다. 다른전투·서버기능/기존chromium보안옵션을바꾸지않는다.
- 3333/3340은명시거부. fixture3381은정적값이며실제사용가능포트로측정한것이아니다. 소켓점유확인은이번금지범위라root의실행직전게이트다. 절대profile/save는고유job에귀속돼.app이동/배포계약은별도다.

## 호출 방법·승인 경계
기본CLI는읽기전용plan이며실행옵션이없다:

```sh
node tools/team-followup-20261001/BUILD/mac-packager-cli.mjs CONFIG.json
```

실제생산연결은root가runtime/전체입력/복구근거를인수한후별도승인된실행에서만`execute(config,{approved:true})`를호출한다. approved없음은예약전차단. 이번에는오직`execute(fixtureConfig,{approved:true,build:spyBuild})`로주입실행했다. 주입이면출력을검증해도FIXTURE_ONLY/packageCreated=false로구분한다. 실제defaultadapter는이번호출0.

CONFIG의필수구조: sourceRoot/outputRoot/port,선택arch/UUID id,inputRoots,inputs[{path,sha256}],backup{sha,remoteSha,remoteRef,verifiedAt,inputs},runtime{cacheRoot,releaseInfoPath,releaseInfoSha256,files}. runtime.files는cache안의nwjs.app전체명시목록이며symlink는{path,sha256,target},SHA는`symlink:`+상대target 문자열의SHA-256이다. 각파일별원격보존증거와로컬런타임무결성은별도로구분한다.

## 실제 fixture 검수34건
- 설치library source pin/실제shape,import시애플리케이션I/O·adapter0,plan출력생성0,spy호출인자/최소파생/원본불변,승인없음예약0.
- runtime/cache누락,출력충돌,입력SHA/원격파일SHA/commit/ref,파일/명시목록누락,선택asset추가,save/profile/dist/app포함,입력탈출/입력link/출력부모link/runtime외부link,런타임/metadata SHA/arch불일치,3333/3340,파생원문불일치의24경계는BLOCKED·adapter호출0.
- adapter예외청소,osx오류삼킴후누락검출,재호출충돌기존job보존,기본실제process.arch/명시x64,부분plist실패정리.
각fixture는소유mac-packager/fixture-*안의합성텍스트/32바이트헤더/가짜plist만사용했고삭제했다. 시험stage로작은fixture바이트를써서연결을검사했을뿐생산소스복사·실제runtime복사·대형빌드·압축은없다. 실제.app검수로간주하지않는다. 잔여fixture/job0.

## SHA·현재 BLOCKED·인계
생산현재gameSHA는f7212ac287665f831975c47523783967374db4c1219b898e57bca5f97cfa1649이다. 이전live의21235538...와다르며보존여부를추정하지않는다. package/build/node-main/serverSHA는전용mac-packager-hashes.txt에기록했다. 최종후보packagerSHA 4e0aff74b153cecaf73bf955c15a4413a841a2c9db7aff6b69bf606ede07e1af, testSHA 9d10bb207c7065ff8f7f3bc46554ed43499d3e0ebe0c50c957d07b21877ce090, CLI SHA 8b0bfa7ddbe213c0e4499c6d2fe240b25703e486ccdfb9ff333101bd00100964는15:58:35Z 재대조로일치확인했다.
현재config→plan은MAC_RUNTIME_MISSING/exit2이며실제.app생성0. NW.js arm64/x64런타임·실제version/chromium metadata·서명/코덱·전체입력선택/원격파일별증거·실행포트/프로필/저장인수가남았다. 필요한승인조건을채운후defaultadapter통합→실제출력SHA/앱실행QA→원격백업을별도단계로진행한다.
공유docs반영안: BUILD대장에로컬bld고정API연결후보34검사/기본plan/실제runtime BLOCKED를기록하고source backup을실행.app완료로바꾸지않는다. docs전체키워드검색은mac-packager-docs.txt. 이번소유밖수정0,Git/queue/권한변경/새세션/에이전트0,root자동전송0. 한건인계후종료한다.
한국어결과/receipt·최종해시정리완료UTC: 2026-10-01T15:58:35Z.
