# Mac CH1 source15 실제 포장 후보 — 2026-10-03

최신 **제작된 패키지**는 이 보고서의 source15다. 현재 상태는 **PACKAGED_NOT_RUNTIME_ACCEPTED**다. source11/3390의 기존 실제 게임·부분 검수·격리 세이브는 그대로 보존했다. source15 앱은 아직 기동하지 않았다.

| 항목 | 실제 근거 |
|---|---|
| 완료 시각 | UTC 2026-10-02T23:08:05.173Z |
| 코드·원격 복구점 | `050a227600116f13d8cd4443ef342ea270e321c4` / `refs/heads/codex/mac-environment-20261001`; config 작성 때 원격 정확 SHA 대조 |
| UUID | `a1488887-2fbf-48e0-b006-7b28b4c19976` |
| 앱 | `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-a1488887-2fbf-48e0-b006-7b28b4c19976/package/EXODUSER-a1488887-2fbf-48e0-b006-7b28b4c19976.app` |
| Bundle | `com.exoduser.mac.a1488887-2fbf-48e0-b006-7b28b4c19976` |
| 시작 주소 | `http://127.0.0.1:3391/index.html?demo=1` |
| 격리 profile | `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-a1488887-2fbf-48e0-b006-7b28b4c19976/user-state/profile`; 아직 미생성 |
| 격리 saves | `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-a1488887-2fbf-48e0-b006-7b28b4c19976/user-state/saves`; 아직 미생성 |
| 런타임 | 공식 NW.js 0.111.2 / arm64 / 기존 캐시340항목 재사용; 다운로드·설치·서명0 |
| 입력 | 기존 selector7918 재사용; 최신 본편·Easy 핀만 갱신, index 보존 |
| 실제 제작 | 신규 plan1/execute1, `fixtureOnly=false`, `packageCreated=true`; stderr0 |
| 내부 제작 검증 | 비파생 입력7916 exact SHA, 파생 package/node-main, 실행파일 및 helper4·plist identity 검사 통과 |
| 후속 물리 대조 | source=stage=app3파일 exact, 실행파일5 runtime SHA/arm64 Mach-O/0755/plist identity 일치; 전수검사·제작 재실행0 |
| 포트 | 제작 전3391 noListener와 bind 가능 확인; 아직 서버·앱 미기동. 재기동 직전 충돌 확인 필요 |

## 현재 게임 소스

| 파일 | bytes | source=stage=app SHA256 |
|---|---:|---|
| game.html | 4030118 | `4e528f8ccd65f222b6c0d108e89c1281022eb27e3c8de152c72fb7e659d7d614` |
| game-easy-test.html | 3907385 | `fe3bca4e299b5aea9e08fdbd37cf3798d8085d923c013fc21d0ac74f81288a4e` |
| index.html | 342119 | `1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7` |

source11 이후의 수동 강화 자원 보존, 죽은 필드 몬스터 중복 피격 차단·앵글러 악의4 단일 지급, 보스 재도전 드루이드 임시값 초기화, 장비 해제 거절 자원 보존을 포함한다. 세부 생산 계약·검증은 기존 source12~15 기록을 따른다. source15 장비 해제 검사는 actual production48/48과12JS+2JSON PASS이며 이번 포장 때 재실행하지 않았다. 포장 검증을 새 게임 수정 건수로 세지 않는다.

## 삭제 없는 제작 경로

공유 packager와 nw-builder 원문은 변경하지 않았다. 고유 ignored 사본2개만 사용했다. 기존 import 의존성과 runtime/library 핀·입력 소유권·staging·패키지 검증은 보존했다.

| 사본 | SHA256 | 최소 변경 |
|---|---|---|
| packager-no-cleanup.mjs | `2c78415654b5f92f94faf0c22c6b62e60cc307b44a945a5038ea538a73ddbdbb` | localBuild만 사본 builder 연결; 실패 catch의 job 삭제 제거, `owned-new-job-preserved` |
| bld-no-cleanup.mjs | `cb2cf18ca75ab7db87cdccea10eedd8219848e40238b745e444c4fe4ee277e5a` | util/osx import2를 기존 원문에 연결; 시작 outDir 삭제를 UUID/owner/경로·bundle/비symlink·빈 output·osx/glob=false/managedManifest=false/zip=false 검사로 대체 |

원본2개 SHA·5개 OLD/NEW·정확 역치환·구문2/import API1 결과는 adapter 영수증에 있다. `/Users/fordeargamers/Projects/exoduser-migration-20261001/tmp/mac-migration-runtime/continued-review-20261003/ch1-source15-build/execute-source15.mjs`가 사본의 `execute(config,{approved:true})`를 호출했으며 `build:` fixture override는 사용하지 않았다. 실패 경로에 들어갔다면 해당 신규 job을 보존하도록 만들었지만 **이번 실제 제작은 성공**했다. 압축 후 삭제 경로는 기존 `zip:false`에서 미도달이며 정리·삭제는 수행하지 않았다. 예상 새 job12.749GiB, 제작 전 가용637.239GiB였고 용량 부족은 없었다.

## 재현·물리 근거

근거 폴더: `/Users/fordeargamers/Projects/exoduser-migration-20261001/tmp/mac-migration-runtime/continued-review-20261003/ch1-source15-build`. 이 폴더와 앱은 ignored 로컬 검수 산출물이며, 아래 지문과 복구 코드는 원격 문서에 기록한다.

| 파일 | bytes | SHA256 |
|---|---:|---|
| build-config.json | 3428609 | `99e3445702b106dcb3e97c98e951a0a7cb1cd7bfd8206eedc13e0d473d78e281` |
| plan.json | 2903547 | `2e4f7a7747ddc9d189296c05ccb7e8ec8aec37583b2b5c5e0158cb09762adad7` |
| execute-result.json | 1105 | `284dac72691e6f6bd757fe64306e94d4c373a9d7fe427ff72468dbf5f7dfad73` |
| physical-receipt.json | 19113 | `bb51f0e1cad3e7755dd0916fb6848a601ab7c94ae4b9c7394c017062b5cad180` |
| no-cleanup-adapter/receipt.json | 11225 | `7b8c6ac0a2a8ba84b783993530350f731c88fb1a9f587ae206db9bd63c3cc1ff` |
| native-ui-check.json | 373 | `4a531e71aeaa7050eb7de6638caac00895f76a741fb27cfd4b780227de31f627` |

## 실제 플레이 Gate와 팀 운영

- UTC2026-10-02T23:10:05.085119+00:00 기존 source11 앱의 AX를 읽었으나 Mac 잠금으로 차단됐다. 입력0/새 앱 기동0/새 unlock 질문0, 기존 질문은 답변 대기 중이다.
- source11 정상 생성·난이도5 저장/재실행, 실제 전투·전설 드롭·장착 등 부분 관측은 [source11 보고](MAC_CH1_SOURCE11_CANDIDATE_20261003.md)에 보존한다. 새 source15 앱의 검수 결과로 옮기지 않는다.
- source15 정상 시작→전투/획득/장비→필드4지역·보스방 개방→보스 사망·부활 시 열린 방/필드 몬스터 보존→재도전, 실제 저장 재실행·청취·8카메라 시각 검수는 아직 미인수다. 포장 PASS를 native/visual/음향 PASS로 확대하지 않는다.
- Claude 오더 담당의 UTC23:04~23:07 새7팀 exact TASK 수신·첫 source 도구 성공을 인수했다. BOSS는 완료 후 다음2306 작업도 실제 시작했다. ART1의 로컬 직접 인간지시 Gate는 보존했다. 이전 완료→재배정 지연 최대447.1초 및 5분 누락을 기록했으며 무중단 준수를 주장하지 않는다.
- 이번 문서 소유 범위는 기존5+신규1=6이다. 기존 문서 prefix·타인 WIP67·공유 index·감독 STATE/LOG4·이전 모든 앱·사용자 게임/세이브를 보존한다. 코드/생산 추가 변경0, 전체 docs 검색554행/47문서는 현재 pointer와 날짜별 역사로 분류했다. 실변경71+root예약6+외부예약8=최대85는 예약 합계이며 실80 도달과 구분한다.

최신 포장 pointer는 본 보고서, 최근 실제 플레이 관측 pointer는 source11 보고서다. 별도 실행 승인을 다시 요구하지 않으며, 잠금이 해소되면 새 격리 앱을 정상 실행해 미인수 연결 흐름을 검수한다.
