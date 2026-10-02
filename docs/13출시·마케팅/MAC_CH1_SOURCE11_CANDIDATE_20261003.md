# Mac CH1 source11 후보 — 실제 전투·획득·장착 부분 인수

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
| sourceBackup | `efb3bb7e02a9ab161e92d9ff3da7229b4cf884cd`; 이 앱 생성 당시 게임 소스는 이 코드 checkpoint와 동일 |

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


## 2026-10-03 source11 실제 필드 전투·장착 부분 관찰

| 경계 | 정상 입력으로 실제 관측 |
|---|---|
| 앱·캐릭터 | 같은 job2a937/3390/source11 앱의 `맥검수열하나`; 사용자 게임/세이브 직접 수정0 |
| 재입장 자원 | 첫 필드 HP557/557. MP 최대306→456 변화가 관측돼 최대 자원 재실행 전체 정합 PASS로 확대하지 않음 |
| 실전 | W/A 정상 이동·Space/F/1·기본 공격과 자동 석궁. 실제 총14처치·지역4/32, 일반 필드 사망. XP14/15, 악의1051, 최대콤보12/관측DPS675/MAXHIT365 |
| 사망 증거 | ignored `source11-native-play/05-first-field-combat-14-kills-death.png`, 920921B/SHA `809abe4b2d4805db0476536443df60e70b05c4ab8e79fafc4895abf331146e51` |
| 일반 부활 후 | 정상 “다시 일어서라” 클릭→ESC→장비창 확인, 악의1060/가방10. 복귀 필드 HP·부활 보존 전체 검수는 아직0 |
| 장착 | 불꽃 갑옷을 정상 장착하여 천갑옷 교체. CP1734→1740/DEF420→423/추가1186→1189, 장착15/16·보석0/26·가방10 |
| 새 UI 결함 후보 | 같은 장착의 미리보기는 CP−16, 실제 변화는+6. Codex 감독에게 다음 UIUX 독립 목표로 전달, 수정·네이티브 해결 인수0 |
| 아직 미실행 | 불꽃 석궁 장착은 stale AX로 미전달, 다음 조작은 실제 Mac 잠금 오류로 차단. 도끼 추가 장착·실제 드롭 획득도 미인수. 가방10은 시작 장비이며 획득 증거로 세지 않음 |
| 재잠금 | 이전 unlock 해소와 정상 재실행은 유효한 당시 관측. 이후 실제 잠금이 재발하여 새 사용자 unlock 질문이 대기 중; 자동 unlock/권한 우회0 |
| 제품 미인수 | 앵글러4·보스방 개방·**보스 사망 후 열린 문/필드 몬스터 보존**·재도전·실청취·8카메라 visual 남음. 일반 필드 사망을 보스 사망 검수로 세지 않음 |
| 후속 생산 source12 | 수동 강화 성공 자원 보존 코드만 두 HTML에 반영·26그룹 회귀/12JS+2JSON PASS. 이 source11 실행 앱에 덮어쓰기0/source12 패키징·네이티브 인수0 |

전체 앱 상태는 `PACKAGED_NOT_RUNTIME_ACCEPTED`이며 실제 전투/갑옷 장착의 부분 관찰만 추가한다.


## 2026-10-03 source11 실제 신규 드롭·전기 전투화 장착·일반 부활

이전 절의 획득 미인수·잠금 대기는 당시 이력이다. 같은 검수 전용 앱에서 잠금 해제 후 아래 정상 입력을 관찰했고, 마지막 시도 직전에 Mac이 다시 잠겼다. 전체 상태는 계속 `PACKAGED_NOT_RUNTIME_ACCEPTED`다.

| 항목 | 실제 관측·완료 경계 |
|---|---|
| 앱·소유 | 동일 source11/3390/job2a937, 전사 `맥검수열하나`. 기존 사용자 게임·save 직접 수정 없음 |
| 실전 획득 | Lv5·XP15/28·현재 지역38/53에서 실제 “전설 전기 전투화 획득!” 표시. 가방10→11, 신규 전투화 선택 후 정상 장착 |
| 장착 결과 | CP1859→2257(+398), ATK128 유지, DEF426→585, 추가1305→1544. 장착15/16·보석0/25·가방11·악의6740. 이전 부츠가 가방으로 반환됨 |
| 비교 미해결 | 장착 전 미리보기 +116, 장착 후 이전 부츠 역비교 −116. 실제 +398과 불일치. Codex UIUX 후보 통합·새 앱 검수 대기 |
| 전기 전투화 표시값 | DEF47, SPD0, 돌진거리30, 돌진충전−1초, ST27, 추가HP39, STR22/DEX33/INT31, 이동속도6.36%, 결정 슬롯1(빈 슬롯) |
| 이전 낡은 전투화 | DEF19, SPD0, 돌진거리14, ST11, 추가HP24, 이동속도7.74%, 결정 슬롯1(빈 슬롯) |
| 후속 전투·사망 | Lv7·XP30/35·현재 지역53/53, HP0/1104, MP549/549, ST277/277, CP2282, SP18+3. 실제 일반 필드 사망 화면102처치·최대콤보87·경험치 손실9 |
| 정상 일반 부활 | “다시 일어서라”→ESC. Lv7·XP21/35, HP1104/1104, ST277/277, CP2282, 악의11820, 새 필드 현재 지역0/32 후0/53. 새 전투화·CP 유지 |
| 지역 카운터 | 현재 위치에 해당하는 지역 수치이며 0/32→0/53만으로 맵 버그라고 판단하지 않음. 이번 사망은 보스방 진입 전 일반 사망 |
| 일반 입력 경계 | F 입력에서29.8초 쿨다운, 1 입력에서7.9초 쿨다운 관측. Ctrl+a에서 얼음보주 활성화·쿨다운 증거 없음. 미전달 입력을 시전 성공으로 계산하지 않음 |
| 입력 표시 결함 후보 | 실제 controls/dispatcher E=칼등 처내기, RMB=마법. 스킬 UI의 고정 E악의구/칼등우클릭 표기는 실제 바인딩과 불일치; UIUX 독립 작업으로 전달 |
| 최신 재잠금 | 다음 입력 시도16은 Mac 잠금 응답으로 첫 동작 전에 차단됨. 새 unlock 요청1회 대기, 앱은 설정/조작 화면 일시정지로 보존. 16번 화면 파일 없음 |
| 코드·앱 구분 | source12 수동 강화·source13 필드 앵글러 기본 악의 보상은 생산 checkout 후속 변경이다. 이 source11 앱에 덮어쓰지 않았으며 해당 수정 native 인수0 |
| 남은 coregoal | 앵글러4·4지역 정화·보스방 개방·보스 사망 후 열린 문/기존 필드 몬스터 보존·재도전·실청취·카메라 visual. 일반 사망/부활 결과를 보스 사망 검수로 확대하지 않음 |

ignored `tmp/mac-migration-runtime/continued-review-20261003/source11-native-play/` 원화면을 보존한다.

| 실제 화면 | bytes | SHA256 | 의미 |
|---|---:|---|---|
| 11-field-pickup-combat.png | 851587 | `4d2800627e54d94a564a23dcbacb17eee7da9a39a0e431fba116d78c9ede580a` | 신규 전설 획득 표시 |
| 12-legendary-loot-equipped.png | 944598 | `378619e4b837fcc2fe0a57af7fd51712ee8a2978dccc14339798a017c6e42eca` | 전기 전투화 실제 장착·CP2257 |
| 13-west-approach-legendary-equipped.png | 910300 | `11452ce5b2f1c1d14e53c313375671ab028cb65e841bc9ddc36e83e7095c52a5` | 파일명과 달리 실제 일반 사망 화면. 장착 증거로 사용하지 않음 |
| 14-normal-field-revive-gear-retained.png | 958816 | `47abb42fec5cf317a873a56bd8a4bcfc21db417036a6655ddd48d9a0ab7aff8f` | 일반 부활·Lv7/CP2282·장비 보존 |
| 15-control-combination-observation.png | 950005 | `34cd3f8b932d356365211186dffb7679c5d6adcdb00a62760ae17143fe912ee5` | Ctrl 조합 시전 성공 미확정 |
