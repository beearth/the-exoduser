# 공식 Mac 런타임 확보 시도·config 초안 인계

## 수신·실제 착수·완료
- 수신/첫Read: 2026-10-01T16:09:12Z(10월2일01:09:12KST). AGENTS 최신5분heartbeat·BUILD팀·백업정책·전용task·기존인수범위를읽었다. 소유에는task만있고신규runtime경로미존재로중복작업없음. receipt를먼저기록했다.
- 실제Read/명령: process.platform/arch=darwin/arm64. 공식versions/배포목록/압축파일·checksum URL 읽기조회후 curl3명령을실행했다. 정확명령/결과는runtime-acquire-remote-evidence.json.
- 실제Edit: 16:09대receipt/공식부분metadata 기록, 첫검사코드생성16:10:47Z. `node tools/team-followup-20261001/BUILD/runtime-acquire-config-review.mjs`로실제빌더AST와현재소스/참조를대조했다. 마지막소스대조16:11:13Z.
- 실제첫Edit16:09:20Z(receipt생성시각),한국어결과/receipt·최종기록완료16:12:34Z. JSON3개문법검사PASS.
- 판정: **실제런타임확보 BLOCKED_NETWORK_DNS**. 다운로드0/압축해제0/Mach-O·framework검사미실행/실행가능.app미확보. 공식arm64배포가없다고단정하지않는다. 생산execute0.

## 공식 배포 근거·차단 구분
공식 [versions.json](https://nwjs.io/versions.json)의v0.111.2 항목은2026/05/11,osx-arm64/osx-x64 및normal/sdk를열거한다. components는Node26.0.0/Chromium148.0.7778.97이다. 해당항목만전사한runtime-acquire-release-info.json은**전체원문다운로드본이아니며압축파일무결성증거도아니다**.

| 대상/수단 | 실제결과 |
|---|---|
| nwjs.io/versions.json web | v0.111.2/arm64메타데이터읽기성공 |
| dl.nwjs.io/v0.111.2/ web | 404응답. 다른메타데이터와불일치하므로전체공식배포부재로단정금지 |
| 정확arm64 zip web | 도구접근불가;실제파일부재/체크섬을판정할수없음 |
| SHASUMS256.txt web | 도구접근불가;공식값미확인 |
| versions.json curl GET | exit6 Could not resolve host:nwjs.io, 로컬원문파일미생성 |
| arm64 zip curl HEAD | exit6 Could not resolve host:dl.nwjs.io |
| checksum curl HEAD | exit6 동일DNS실패 |

정확예정URL: https://dl.nwjs.io/v0.111.2/nwjs-v0.111.2-osx-arm64.zip, checksum:https://dl.nwjs.io/v0.111.2/SHASUMS256.txt. 압축파일본문은받지못했고버전/아키텍처/채널을바꾸지않았다. 공식메타데이터열거와실제아카이브접근은서로별도다. 로컬DNS/프록시/권한변경·직접IP/비공식미러·동일경로반복재시도0.

요청한신규sibling `/Users/fordeargamers/Projects/exoduser-mac-runtime-20261002`는현재도구의허용쓰기루트밖이다. 승인정책상추가권한을요청/완화하지않았으며쓰기시도0. 사용자승인과샌드박스쓰기권한을혼동하지않았다. 다운로드가가능해지더라도이경로에서작업하려면허용쓰기범위가명시적으로제공돼야한다. 이번에는허용된BUILD/runtime-acquire-*의증거/초안만썼다.

## build 전체 선택목록·deps 대조 config안
`runtime-acquire-config-draft.json`은**실행불가초안**이다. acorn으로build-nwjs.mjs의FILES/DIRS/OPTIONAL상수를직접읽고root의lang_*.js/atlas_*이름및package/node-main을합쳤다. 빌더를import/실행하지않았다.

| 대조 | 실제결과 |
|---|---|
| 고정FILES | 63개 |
| 에셋DIRS | 10개 |
| 동적lang/atlas | 35개 |
| 실제존재inputRoots | 108개(폴더는명시root;하위파일SHA아직미수집) |
| 필수root누락 | 0 |
| optional누락 | credits.html,output/imagegen/forge-tabs-v3 |
| 선택밖한줄src/href | game/easy의atlas_enemies.png(파일없음). 실제코드_USE_EXT_ATLAS=false에서return하므로현행비활성분기. 임의추가/필수누락단정/소스수정0 |
| package dependencies | source-evidence에원목록기록. 실행package에는deps/scripts/type/nwbuild제거계약 |
| node-main실제require | http/fs/path/url/os builtin만. 이경로에생산node_modules복사필수근거없음 |
| 파생port/save원문 | 기존mac-packager PORT3333/SAVE_DIR원문둘다존재. root저장수정후계약을재인수해야함 |

selection목록전체는config/source-evidence에있다. HTML의직접src/href/한줄JS할당은대조했으나JS동적fetch/CSS URL/native addon/전체자산기능완전성검수는아니다. 제작/LFS/권한/대형파일문제는전체파일목록확정후별도gate다. root진행중작업과사용자게임보존을위해대형asset본문SHA/복사/빌드는실행하지않았다.

config는arm64,v0.111.2 metadata자료,명시cache/출력예정경로/예시port3381과108inputRoots를연결한다. `inputs=[]`, `backup.inputs=[]`, `runtime.files=[]`, 정확backup commit/ref/UTC 미확인값을유지해성공으로조작하지않았다. root저장수정완료후전체파일별SHA/원격보존근거를채우기전actual execute금지. root가이전조회한98aedab...도현재변경보존근거로자동복제하지않았다.

## 생산·함수 before/SHA 고정
읽는도중6소스SHA변경0(캡처구간만;이후root편집을차단하지않음). source-evidence에before/after와함수별SHA/시작행을기록하고소유before파일에함수원문·node-main/package원문을보존했다.

| 파일 | 캡처 SHA-256 |
|---|---|
| build-nwjs.mjs | 567a4b2d6761974b8763abe03ac3c50fc5b973c36be6324c7200ac27b445a78f |
| package.json | 58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8 |
| node-main.js | 01b0c1d51f77f500ee0a59185458bf0294edce12544482d6cf7abce4262c91ce |
| game.html | 7631f5a083672124624e0b8dc22b0716d10c8815dbb1e6aee98a5e2e51299993 |
| game-easy-test.html | 7d68b80afab131562266c39ea7d5631716d12861dbe7e7e2e4477550c15ec6a4 |
| index.html | 38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8 |

game은이전mac-packager의f7212...와다르며root변경을되돌리지않았다. _preparePhysicalImpactSheet/_physicalImpactSheet/_tintHolyDome의before원문/SHA를runtime-acquire-before-*와source-evidence에고정했다.

## root 후속 게이트·한계
1. root가허용된네트워크/쓰기범위를확보한뒤동일v0.111.2공식ZIP/공식checksum/metadata를신규격리경로로취득한다. SHA대조전신뢰하지않는다. 비공식미러/임의버전대체0.
2. ZIP의절대경로/../외부symlink를거부하고격리압축해제후arm64 Mach-O주binary와Frameworks/Helpers/내부상대링크/version/chromium/서명/quarantine을읽기검수한다. quarantine제거/보안우회금지. runtime보유와실행검수는별도다.
3. root저장변경을고정하고전체선택root의입력SHA/정확remote commit/ref/UTC/파일별backupSHA를대조한다. runtime.files inventory확정후기존packager plan재검수. 포트/사용자게임보존조율후별도승인으로만execute한다.
이번취득실패를공식NW.jsruntime부재로보고하지않는다. 대안은동일버전osx-x64를root가명시승인·호환검수하는선택지이며자동전환/다운로드0. 현재허용네트워크취득경로가동작하지않아root환경복구/정규파일인계가필요하다. 버전변경0.

공유docs수정0,관련검색은runtime-acquire-docs.txt. tab1573846373입력/리로드/계측/닫기0. 앱실행/게임/서버/생산패키지복사/빌드/세이브접근/Git/queue/새세션/에이전트0. root자동메시지0. 이번한건만인계한다.
