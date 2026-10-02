# Mac CH1 source11 후보 — 실제 앱 생성·잠금 해제 후 native 인수 대기

source10 동일 앱 정상 재실행에서 신규 일반 난이도5가10(+5단/+500)으로 바뀌는 결함을 실제 관찰했다. source11은 양판 saveSettings의 직렬화된 opt에 `diffV2:1`만 각9B 추가한다. 실제 writer·loader·슬라이더를 통한36 의미검사와 inline JS12 parse가 통과했으며 구형0→5·5→10·상한10 변환은 보존했다. 코드2/docs5 checkpoint `efb3bb7e02a9ab161e92d9ff3da7229b4cf884cd`의 원격 exact를 총괄이 확인한 뒤 새 앱을 생성했다.

| 항목 | 실제 source11 후보 |
|---|---|
| 앱 상태 | `PACKAGED_NOT_RUNTIME_ACCEPTED`, `fixtureOnly:false`, `packageCreated:true`; PLAN/기본 EXECUTE 각각 exit0 |
| 고유 job | `2a937fde-3322-492f-bef4-32dfa78a1d69` |
| bundle | `com.exoduser.mac.2a937fde-3322-492f-bef4-32dfa78a1d69` |
| 앱 | `outputs/mac-package-ready/mac-packager-2a937fde-3322-492f-bef4-32dfa78a1d69/package/EXODUSER-2a937fde-3322-492f-bef4-32dfa78a1d69.app` |
| 진입·서버 | `http://127.0.0.1:3390/index.html?demo=1`; original node-main의 PORT3333→3390, SAVE_DIR→고유 saveRoot만 파생. 원서버·python http.server 사용0 |
| 새 profile/save | 위 고유job의 `user-state/profile`, `user-state/saves` 절대 경로. UTC2026-10-02T21:17:11.105462+00:00 전기동 관측에서 user-state/profile/save 부재·3390 noListener/bind-free |
| 공식 입력 | 기존 selector7918/runtime340·cached NW0.111.2 arm64/nw-builder4.17.10 재사용. 다운로드·설치·서명0 |
| sourceBackup | `efb3bb7e02a9ab161e92d9ff3da7229b4cf884cd`; 현재 게임 소스는 이 코드 checkpoint와 동일 |

## 원문·stage·앱 소스 고정 핀

| 파일 | bytes | SHA256 | 확인 |
|---|---:|---|---|
| game.html | 4029812 | `f86f50555d59d371f09f638dcf97cb2927cdc4eb01846e4fa5576d20ecaa744f` | source=stage=app byte exact |
| game-easy-test.html | 3907079 | `6623b131e751f970bfc91583deb6e101d83bc098b95c4d9dde1df2ae7944c67f` | source=stage=app byte exact |
| index.html | 342119 | `1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7` | 기존 원문 불변/source=stage=app exact |

실행파일 main+helper4 총5개는 arm64·0755·runtime SHA·plist identity가 일치한다. stage/app node-main은 plan 파생 문자열과 같고 original PORT/SAVE_DIR만 역변환하면 원문 byte exact다. stage package는 plan 파생 객체와 같으며 앱 package의 유일한 추가는 공식 builder의 `product_string=EXODUSER-2a937fde-3322-492f-bef4-32dfa78a1d69`이다. 이번 추가 검수는 source3/파생 파일/실행파일5로 한정했으며 별도7918·8253 전수 감사를 다시 하지 않았다.

| 파생 파일 | bytes | SHA256 |
|---|---:|---|
| node-main stage/app | 10537 | `0d1a56e47dddc7f82c23578cabaa4cb3c7a103cb936dc18a3c11d6bf39505d6c` |
| stage package.json | 985 | `9dd36ad01d81adc404e5fb8b4d8b496171569888cf701967c53ebdc5e822c383` |
| app package.json | 1054 | `0fb312c7d95e4fb6f8abfdfd888a8b25d5ea9face023548b18a5cb4fcd0e164a` |

## 실제 근거와 제품 인수 경계

ignored `tmp/mac-migration-runtime/continued-review-20261003/ch1-source11-build/`에 원자료를 보존한다.

| 근거 | bytes | SHA256 |
|---|---:|---|
| build-config.json | 3428576 | `d4414ab2425b522c63efd14c4224a0b0e2ffd7adc8e8b767a374e621f0ec6e74` |
| plan.json | 2903547 | `2f0e3c8d575eed950d476269e8e5bee7ed0ecb816d1a38f7f6c707e5895dc8b4` |
| build.stdout | 951 | `3f452c422c3112e3fa0fcd2e7692d6d04169c6ce71eeca4882745a3cbfdf4723` |
| build.stderr | 0 | empty/exit0 |
| execute-result.json | 1345 | `67e6021dac358548d78de4fa76bb218b73125173c3b11e059be1779b453af836` |
| physical-receipt.json | 12299 | `1b1c2bf34824d35bffd4bbf9ff22323f8fc9c72616be0e7506064fd876ee8e76` |

`MAC_CH1_SOURCE10_CANDIDATE_20261003.md`의 같은 앱/캐릭터 도끼·석궁 복원은 실제 부분 인수다. source11 새 앱의 정상 시작·신규 일반5 저장/종료/재실행·실전 처치/획득·필드 앵글러4·보스방 개방·CH1 보스 사망 후 맵/몬스터 보존·재도전·실청취·visual은 아직 미인수다. 포장/소스 검사 PASS를 제품 coregoal 완료로 계산하지 않는다.

CUA의 실제 Mac잠금 응답으로 기존source10 정상 Quit 입력도 전달되지 않았다. source10/3389는 조작 직전 설정/조작 화면에 정지한 상태를 보존하고 새 source11앱은 아직 기동하지 않았다. 사용자 직접 잠금 해제 요청이 대기 중이다. 자동 unlock 우회·프로세스 강제 종료·기존 사용자 게임/profile/save 직접변경0. source10 config 핀과 기존 앱/profile/save 존재는 확인했지만 기존 profile 전체 byte 보존을 검증했다고 주장하지 않는다.

캐릭터 선택 영상의 독립 후속에서 기존 own3389 실제 HEAD200(`video/mp4`,14132329B,Accept-Ranges bytes), Range0–1023 GET206(Content-Range0–1023/14132329,1024B)을 확인했다. 이는 서버 전달의 좁은 근거이며 실제 media error.code/play rejection/currentSrc/decoder 원인은 아직 미확정이다. 새앱 재생·실청취 검증으로 확대하지 않는다.

이 문서는 source11 생산 소스의 설정3.3·저장15 계약과 별도 앱/미인수 경계를 동기화한다. 기존 source10 문서·receipt·앱/profile/save 및 보호67/타인WIP·운영STATE/LOG를 보존한다.


## 2026-10-03 source11 실제 기동·동일 앱 난이도 재실행 인수

이전 잠금 대기 절은 당시 시점의 이력이다. 이번 정상 입력·Quit 관찰로 Mac 잠금 대기는 해소됐으며 source11 앱은 실제 기동·재기동했다. 전체 제품 상태는 계속 `PACKAGED_NOT_RUNTIME_ACCEPTED`이며 설정 재실행 1경로만 실제 부분 인수한다.

| 항목 | 직접 관측·완료 경계 |
|---|---|
| 고정 앱/소스 | job `2a937fde-3322-492f-bef4-32dfa78a1d69`, loopback3390, code checkpoint `efb3bb7e02a9ab161e92d9ff3da7229b4cf884cd`; 앱·source3 변경 없음 |
| 정상 생성·시작 | 한국어 로비→전사 `맥검수열하나` 신규 생성→이야기/시작 안내→정상 연습 건너뛰기→CH1-1 Lv1·XP0/15·지역0/32·악의1000. 최초 HP557/557·MP306/306·SP282/282·CP1689는 관측값이며 새 기본 수치 정책이 아님 |
| 종료 전 설정 | ESC 설정 난이도 슬라이더5·일반. 정상 캐릭터 선택(로비)으로 저장하고 캐릭터 카드 확인 |
| 정상 종료 | 동일 앱 Cmd-Q 후 UTC2026-10-02T21:31:02.561051+00:00에3390 noListener 확인. 강제 kill·사용자 게임 조작0 |
| 같은 앱 재실행 | 동일 앱 정상 실행→저장된 `맥검수열하나` 선택→입장→ESC. 난이도 슬라이더5와 실제 화면 `일반` 유지. **신규5→저장→종료→재실행5 PASS**, source10의5→10 오류 경로 해소 |
| 화면 증거 | ignored `source11-native-play/04-after-restart-difficulty-visible.png` / 660153B / SHA `94e361b58643eb7321a32bb2504312eedd558c23e8bdf59f57bcd0065334d953`. 02/03은 설정 시스템 섹션 화면이며 화면상 난이도 항목 증거로 확대0 |
| 관측 영수증 | ignored `root-source11-native-resume/native-restart-observation.json` / 1316B / SHA `e8de494846a014b3da9212a2203040ac5edf7f14cecd1363d269d97bbf315119` |
| 아직 미인수 | source11 실제 처치·획득·장비/가방 재실행 값·필드 앵글러4·보스방 개방·CH1 보스 사망 후 맵/몬스터 보존·재도전·실청취·8카메라 visual. 설정 PASS를 native6·보스 coregoal 완료로 확대0 |

실제 후속 관측 기록4개만 갱신한다. 기존 앱/profile/save·보호67·타인WIP·감독 소유STATE/LOG를 보존하며 이전 검사·패키지 전수감사 반복0.
