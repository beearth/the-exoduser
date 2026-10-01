# 정확 실행 입력 확정 — root plan/execute 인계

## 실제 기록
수신·첫 Read 2026-10-01T16:25:17Z, 첫 코드 Edit 16:26:24Z, 전체 해시 대조 16:26:24.705Z~16:26:31.879Z, manifest 의존성 보정 16:27:02.791Z, 독립 계약10검사 PASS 16:27:13.787Z. 완료 UTC는 receipt에 별도 기록한다. AGENTS/BUILD 팀 MD/백업정책/기존 package-ready 및 root 원격 증거를 읽었다. 동일 작업 완료 중복 없음. 생산 코드 실행0.

## 입력/백업
- 기존108루트의 7,925파일(6,701,632,473바이트)을 다시 streaming SHA256 및 Git blob OID로 읽었다. 이전 SHA 변경0, 검사 중 변경0.
- 시작/종료/최종 로컬 HEAD 모두 `ae230e74f7bbcacd523dae987370086046457f5e`. 로컬 해당 트리와 두 HTML을 포함한 전체 입력 내용 일치. Unicode 별칭은 실제 내용 OID로 대조하고 파일명은 보존했다.
- root 제공 `outputs/team-review-20261002/persistence/remote-checkpoint.json`의 실제 원격 확인시각은 **2026-10-01T16:21:40.384367+00:00**. BUILD 첫 Read는 16:25:17Z, 검사 프로그램 Read는 16:26:24.705Z다. 제공자는 root이며 BUILD 신규 네트워크 확인이 아니다. 제공 SHA/remoteSha/ref/verifiedAt를 그대로 연결하고 증거파일 SHA도 기록했다.
- 새 allowlist는 **7,918개 정확 파일**, **6,645,468,894바이트**, 미백업0. `inputs`와 `backup.inputs` 완전 일치. 목록 SHA256 `c87184b26a06f6bb95432f17ec69c8b40e8ca9eb8ff024198b61d34f0cd2e0c4`. 디렉터리 통째 선택하지 않아 제외 파일이 재유입되지 않는다. 다른 팀 도구/docs는 이 선택과 무관하며 수정0.

## 경로별 제외 근거
|제외 경로(assets/map/ch1/production_finish/ 기준)|실제 근거|
|---|---|
|CH1_1_PRODUCTION_MASTER.png|제작 master LFS pointer; 선택 실행·manifest 텍스트에서 이름/경로 참조0. 실행 로더는 chunk_x_y.png 사용|
|outer76_81-provenance.zip|제작 provenance ZIP, 이름/전체경로 참조0; packager 보호규칙 유지|
|outer82_sources/source-provenance.zip|동일 제작 provenance, 전체 선택 텍스트에 파일명/경로 참조0|
|outer83_sources/source-provenance.zip|동일 제작 provenance, 참조0|
|outer84_sources/source-provenance.zip|동일 제작 provenance, 참조0|
|outer85_sources/source-provenance.zip|동일 제작 provenance, 참조0|
|outer90_sources/outer90_patch.png|composition.json:183 및 retouch-layers.json:182의 bake retouchLayers 제작 참조2. 선택 HTML/JS/CSS에서 두 manifest 로드 이름/경로 참조0. 활성 chunk/rotforest_mass 별도 파일은 유지|

HTML/JS/CSS/JSON/manifest 텍스트 **478파일**을 검사했다. 마지막 patch는 최초 직접 manifest 참조를 발견하여 일단 KEEP_BLOCKED로 기록한 뒤, 두 manifest의 실행 진입 의존성을 별도로 대조해 제작 자료로 분류했다. 조사 근거·hit 줄·manifest SHA는 evidence에 보존했다. 원본/manifest/provenance는 삭제·수정하지 않았다. 제외는 정확7경로뿐이며 상위 outer90_sources 폴더나 실행 rotforest 파일을 제외하지 않았다.

필수 실행 LFS로 확인된 항목0, 다운로드0. 제외 원본 pointer들의 payload 정보는 다음과 같다(정상 이미지인 것처럼 판정하지 않는다):
- master: oid `b105817a5ba9558174221b815ee58b942a870def3c172821583d55917717c66a`, 138770790바이트.
- outer90_patch: oid `68d5f66de5433cafa0067a3779becc7563c4dbc0ebaa5fe3538edd98e52893ce`, 118038090바이트.
- outer76_81 ZIP: oid `50b5487581e0eb46262bad39e23dd6c4352d13c91e7d56017228d8e7b0f871dd`, 136875785바이트.

## 필수/폴백/UNKNOWN
- **필수**: 활성·선택가능 map 유한8루트×64 chunk512 + projectile12, 총524개는 현재 SHA·allowlist 모두 유지. 소스 SHA가 기존 검수와 동일하여 로더 집합 계약도 유지. 직접 script/style139의 기존 검수 소스도 변경0.
- **비활성**: enemy atlas `_USE_EXT_ATLAS=false`의 즉시 return, arrow override는 현재 shard/bolt 로더 미사용. 이것은 향후 활성화 시 에셋 확보를 면제하지 않는다.
- **폴백/저하**: legacy BGM fetch/decode 실패는 catch return으로 무음 종료. procedural SFX는 별도 합성 경로이며 누락 파일을 모두 자동 대체한다는 뜻이 아니다.
- **UNKNOWN**: legacy SFX_MAP 파일 항목의 외부/global 호출 시 대체 음원·실제 청감, 임의 JS 문자열 합성/외부 코드의 manifest 사용 완전성. bounded524PASS를 전체 런타임 의존성 증명으로 바꾸지 않는다. 신규 필수 pointer 로딩이 발견되면 해당 oid/크기를 root에 인계하고 실행 차단해야 한다.

## 런타임·격리 계약
기존 v0.111.2/arm64/cache/release 설정과 내부340항목(335파일+5링크)을 재대조했다. 파일SHA/링크target/내부 실경로 및 release SHA 일치. 라이브러리4.17.10 index/bld/util/osx 고정SHA도 PASS. 다운로드/보호규칙 완화0.
생산 package/server를 읽기만 하고 문자열 파생 및 acorn parse만 검사했다. PORT3333와 SAVE_DIR 바늘 각1개, user-data-dir 각1개. 파생 main/node-remote는3381, listen은127.0.0.1, profile/save는 고유 UUID job의 user-state/profile 및 user-state/saves 절대경로다. 기존 APPDATA 사용자 저장으로 접근하는 SAVE_DIR 식은 파생에서 교체된다. 실제 서버/저장 실행0.
실제 후보는 새 job을 독점 mkdir하고 소유 inode 확인 후 stage/output만 다루며, 실패 시 소유 새 job만 정리한다. local bld 직접 adapter로 downloader 진입을 피한다. 이 읽기 검수를 실제 복사/정리 실행 성공으로 보고하지 않는다. oauth-debug.log는 __dirname의 파생 app 자원 위치로 기록되므로 기존 원본 서버 파일은 입력 사본 단계에서만 격리된다. 패키지 이동 시 profile/save 절대경로 계약과 앱 자원 log 쓰기 가능성은 별도 인수다. 기존 Chromium 보안 args는 추가·완화하지 않았고 보안 검수 PASS를 선언하지 않는다.

## config 및 남은 게이트
`package-input-resolution-config.json`의 outputRoot는 repo/outputs/mac-package-ready, port3381이며 실행 승인 false. config SHA256 `4c7417f4ca178ad4f908983897ab36ae93d07defae9089bd67a685ca54e90e3f`. 정확 입력/backup 전체 일치·중복없음·보호파일없음·LFS없음·원격근거일치·source/runtime/release/524계약 등10검사 PASS; 검수 도구2개의 node --check PASS.
**미완료**: outputRoot 아직 없음(root가 마련), 정식 packager plan 미실행, 실행 직전 포트점유/입력 변화 재확인, root의 명시 execute 승인, .app 생성 후 서명/OS 보안/코덱/실행/이동/저장 인수. 임의 동적 의존성 UNKNOWN은 유지한다. 이번에 .app 생성/실행0. root가 이후 정식 plan/execute한다.
실제 명령 로그: `package-input-resolution-command.log`; 전체 입력별 SHA/HEAD 경로·제외 근거·런타임·격리 evidence, 10검사 validation을 같은 prefix로 제공했다. 공유 docs 반영안은 위 정확 입력/제외7·근거시각·남은 게이트이며 공유 docs 쓰기0. Git 로컬 읽기만, 네트워크/queue/앱/게임/서버/저장/새세션/에이전트/타팀 수정0.
