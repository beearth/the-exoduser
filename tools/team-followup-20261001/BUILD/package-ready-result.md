# Mac 패키지 준비 독립 검수 — 실행 전 BLOCKED

## 수신·착수·완료
- 수신/첫 Read: 2026-10-01T16:14:21Z. 동일 작업 완료 중복 없음 확인 후 AGENTS·BUILD 지시·백업정책·root 런타임 취득 기록·기존 108 inputRoots를 읽었다.
- 첫 코드 Edit: 2026-10-01T16:15:43Z(파일 생성 시각의 KST→UTC 변환). 입력 해시 검사: 16:15:43.779Z~16:15:50.957Z. 최종 목록 보정: 16:18:21.022Z. 최종 소스/HEAD 확인: 16:21:05Z. 완료 기록은 receipt.completedAt의 실제 UTC를 따른다.
- 실제 명령: `node .../package-ready-scan.mjs`, `node .../package-ready-finalize.mjs`, `node .../package-ready-dynamic-gates.mjs`, `node .../mac-packager-cli.mjs .../package-ready-config.json`; `GIT_OPTIONAL_LOCKS=0 git rev-parse HEAD`, `git ls-tree`, 제한된 `git cat-file`, `git diff --name-only -z`, SHA/metadata 대조. Git은 로컬 읽기만 수행했다.

## 확정 입력 및 백업 경계
|항목|실제 결과|
|---|---|
|입력 루트/파일/바이트|108 / 7,925 / 6,701,632,473|
|로컬 HEAD|7cb8485de65b2afdf6d3da726aab44bb33c7516f|
|HEAD 내용 일치|7,923: 정확 경로 7,910 + Unicode 정규화 별칭 13|
|입력 목록 SHA256|ca5353a2412ea031d935657b8163ee9f817e29bfdd16528dfe61998520e62650|
|미백업|game.html, game-easy-test.html 두 파일|
|검사 중 변경|입력 metadata 변경0, 읽은 소스 변경0, HEAD 변경0|

현재 `game.html` SHA256은 `7631f5a083672124624e0b8dc22b0716d10c8815dbb1e6aee98a5e2e51299993`, HEAD 내용 SHA256은 `f7212ac287665f831975c47523783967374db4c1219b898e57bca5f97cfa1649`다.
현재 `game-easy-test.html` SHA256은 `7d68b80afab131562266c39ea7d5631716d12861dbe7e7e2e4477550c15ec6a4`, HEAD 내용 SHA256은 `34ffa8ae1ff4a4509e695f921eef53e0a236aff63184459d13a915f37434bd04`다.
두 HTML은 root 다음 커밋 예정 입력으로 그대로 미백업 처리했다. 이전 해시를 현재 입력의 백업 해시로 채우지 않았다. 로컬 HEAD 일치는 원격 보존 확인이 아니다. config의 remoteSha/verifiedAt은 null이며 root가 정확 입력을 보존하고 새 원격 증거를 제공하기 전 실행 불가다.

초기 원자료는 ZIP 제외 7,920개와 경로 일치 기준 미백업 15개를 기록했다. 최종 증거는 제외 ZIP 5개도 해시 목록에 포함하고 BGM 파일 13개의 실제 blob OID가 HEAD의 정규화 별칭과 일치함을 확인했다. 초기 수치 원자료는 보존하며 파일명 변경은 하지 않았다. 선택 밖 docs/tools/test의 기존 변경 23개는 빌드 입력 미백업과 분리했다.

## 런타임 독립 읽기 검사
- root 제공 cacheRoot/releaseInfoPath를 읽기만 했다. 공식 취득 기록과 로컬 ZIP 161,476,771바이트 SHA256 `efda00a9f91353be1b78b7b38ab6fab12b5871c50e5648c6632fb44059da33f8` 일치. BUILD의 신규 공식 네트워크 검증은 하지 않았다.
- v0.111.2 osx-arm64, main Mach-O header arm64 확인. release JSON SHA256 `f5b3855b14e24f99ed9bf271a5896cbfe6b8e0fd14a8cef66609221ecef3a626` 일치.
- 내부 목록 340개(일반 파일335 + 상대 링크5), 일반 파일398,307,271바이트. runtime manifest SHA256 `5a3fb1241587093693bb98bc2bc3b95f93f663d9879ca77e50a80f64cc94fba4`. 링크 모두 내부 실경로로 해석되고 dangling/탈출 없음. 모든 파일별 SHA 및 링크 target은 final-evidence/config에 기록했다.
- framework의 Helpers/Libraries/nwjs Framework/Resources는 Versions/Current 하위, Current는 148.0.7778.97을 가리킨다. 파일 무결성과 앱 실행·서명/OS 보안 인수는 다른 단계다. 앱 실행0, 보안 설정 변경0.

## 차단 파일과 참조 검수
LFS 포인터 3개(HEAD에 포인터가 있다는 사실은 payload 백업 완료가 아니다):
- `assets/map/ch1/production_finish/CH1_1_PRODUCTION_MASTER.png` — oid b105817a5ba9558174221b815ee58b942a870def3c172821583d55917717c66a, payload 기대138770790바이트.
- `assets/map/ch1/production_finish/outer90_sources/outer90_patch.png` — oid 68d5f66de5433cafa0067a3779becc7563c4dbc0ebaa5fe3538edd98e52893ce, 기대118038090바이트.
- `assets/map/ch1/production_finish/outer76_81-provenance.zip` — oid 50b5487581e0eb46262bad39e23dd6c4352d13c91e7d56017228d8e7b0f871dd, 기대136875785바이트.

현재 packager 정책이 거부하는 ZIP 입력 5개:
- `assets/map/ch1/production_finish/outer76_81-provenance.zip`
- `assets/map/ch1/production_finish/outer82_sources/source-provenance.zip`
- `assets/map/ch1/production_finish/outer83_sources/source-provenance.zip`
- `assets/map/ch1/production_finish/outer84_sources/source-provenance.zip`
- `assets/map/ch1/production_finish/outer85_sources/source-provenance.zip`

생산 소스의 검사 범위에서 이 production master/patch/provenance 이름의 직접 사용은 발견되지 않았다. 그러나 assets 전체 루트가 포함하므로 임의 제외하지 않았다. root가 명시적 선택/제외 계약을 확정하거나 필요한 LFS payload를 확보해야 한다. pointer를 정상 이미지로 판정하지 않았다.

HTML 직접 script/style 139개 조건에서 누락0, AST parse 오류0. 추가 literal 참조 누락 후보52개는 legacy SFX/BGM 및 비활성 atlas/arrow 경로 등을 포함하며 필수 활성 에셋52개 누락이라는 뜻이 아니다. `_USE_EXT_ATLAS=false`, 활성 projectile 타입 shard/bolt를 실제 소스로 대조했다. SFX_MAP/bgmPlay의 제한된 직접 참조 조사만으로 외부 호출 전체 부재를 보장하지 않는다.
별도 실제 소스 경계 검사로 8개 맵 루트의 8×8 chunk512개와 활성 projectile12개, 총524개 파일을 확장·목록 대조했다. 누락/LFS0이며 모두 해시 입력에 존재한다. 임의 JavaScript 동적 fetch 전체의 완전성은 UNKNOWN이다. bounded 524PASS를 전체 실행 패키지 PASS로 확대하지 않는다.

## 실행 전 config와 인계
`package-ready-config.json`은 전체 현재 입력 SHA와 runtime 내부 SHA/링크, arm64/port3381, outputRoot `outputs/mac-package-ready`를 연결한 준비안이다. 포트3381 점유 검증은 하지 않았다. 해당 outputRoot는 현재 없고 BUILD 소유 밖이므로 생성하지 않았다. 실제 plan CLI는 exit2, outputRoot lstat ENOENT로 BLOCKED, packageCreated=false(`package-ready-plan.json`). 이 첫 차단 뒤 백업·ZIP·LFS 게이트가 사라졌다고 볼 수 없다.

남은 게이트: root 두 HTML 커밋 및 정확 원격 입력 보존 확인 → 승인된 입력 선택/LFS 처리 → root의 새 outputRoot 마련 → 전체 config/plan 재검수 → 별도 execute 승인 및 파생 port/profile/save 경계 인수. 이번 config는 실행 승인 아님이며 backup 누락을 자동 보충하지 않는다.
생산·타팀·원자료·세이브 변경0, 외부 경로 쓰기0, queue/network/Git 쓰기0, 새 세션/에이전트0, 게임/브라우저/서버/actual execute0. 새 게임 성능 측정0. 공유 docs에는 쓰지 않았다. docs 반영안: 런타임 확보와 실행 앱 생성은 구분하고 위 백업/선택/LFS 게이트를 실행 전 체크리스트에 추가한다. root에 이 한 건을 인계한다.
