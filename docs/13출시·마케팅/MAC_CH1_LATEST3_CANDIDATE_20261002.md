# Mac CH1 시연 후보 — 확정 세 수정 포함

새 실제 Mac 앱은 SOUND 연결 실패 정리·필터 뒤 Y 장착 identity·캐릭터 입장 취소 수정을 모두 포함한다. 앱 생성과 사본 검증을 완료했으며 실제 앱 기동·CH1-1 연결 플레이·화면/청취는 아직 미인수다. 기존 c927 앱은 dd333 snapshot으로 보존했다.

| 항목 | 정확 값·인수 범위 |
|---|---|
| job | `b3f52d84-90e5-4eca-ac38-bc2a874a0f43`; 고유 새config·app·profile·save |
| source checkpoint | `7ccb72c046db10a0082ca9b816a370d1a4b2b262` 확정 게임 코드; 이후 원자료/doc 보존commit은 game source변경0 |
| 실제 앱 | `outputs/mac-package-ready/mac-packager-b3f52d84-90e5-4eca-ac38-bc2a874a0f43/package/EXODUSER-b3f52d84-90e5-4eca-ac38-bc2a874a0f43.app` |
| 생성 | fresh plan1 READY, execute1 exit0·내부 verifyOutput1. 별도 verifier/execute 재시도/옛검사 재실행0 |
| source main | SHA `ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613` 생성 당시 원문·stage·실앱 동일(고정7ccb72c0 snapshot) |
| source easy | SHA `8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129` 생성 당시 원문·stage·실앱 동일(고정7ccb72c0 snapshot) |
| source index | SHA `1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7` 생성 당시 원문·stage·실앱 동일(고정7ccb72c0 snapshot) |
| 반영/회귀 | SOUND10·ITEM24·charGate8 그룹PASS=42(각 정상대조 포함). 앞 인수3b548b06/7301b270/7ccb72c0 근거 재사용, 이번에 다시 검사실행0 |
| 선택 복사 | 입력7918 정확coverage; 비파생7916 SHA동일·package/node-main2는 기존 port/save 계약의 고유값만 파생. c927 대비 source3만갱신·나머지7915핀 동일 |
| runtime/helper | 기존 승인 NW.js0.111.2 osx-arm64 runtime340=출력334동일+plist/strings6정상파생. helper4/main payload·실행비트 및cache340보존. 기존nw-builder4.17.10 사용, 새download/install0 |
| 앱 실물 | 일반파일8253·symlink5·7043802009B |
| bundleID | `com.exoduser.mac.b3f52d84-90e5-4eca-ac38-bc2a874a0f43` |
| port/main | `http://127.0.0.1:3385/index.html?demo=1`; nodeRemote는127.0.0.1/localhost3385만 |
| profile/save | 고유job `user-state/profile`·`user-state/saves` 절대경로. build후user-state미생성. 포트사전/사후미점유는스냅샷이며 기동직전 다시확인 |
| config | `outputs/team-review-20261002/ch1-playable-b3f52d84-90e5-4eca-ac38-bc2a874a0f43/build-config.json`,3428642B/SHA7035162307ce67a45a45b98981da53eae5a67d989dc07a45571a40f1bf2d326e |
| output manifest | ignored `ch1-playable-latest3-build-readiness/build-output-manifest.json` SHA07e1c8561d57de35cce3c6aef69ed45cc47d449222f6da84abef4f67b8eeb658 |
| final receipt | 같은폴더 `build-final-receipt.json`,15887B/SHA9d02ba5bfc46929acaebb0cb61a9c9e079f5de021bd0f9a273d2794b3f24578b |
| 보존/진단 | 기존21core·user23·c9277core·config·oldrun·packager/builder전후exact. 후속read-only inventory의 namespace assertion1은앱빌드오류가아니며 nwjs.app 상대범위보정 뒤완료; plan/build/verify재실행0 |

## 실제 기동과 시연 Gate

기존 Mac 기동은 도구가 Mac locked를 확인해 잠금해제 질문이 남아 있다. 새 b3 앱은 아직 실행하지 않았다. 사용자 게임/세이브를 보존한 독립 실행 슬롯에서 정확 앱·3385 서버/PID/window·고유profile/save를 확인하고, 같은 후보에서 정상 로비/선택→전투·획득/장착→4지역현행게이트→보스사망→기존부활/필드보존→재도전의6단계를 관측해야 한다. 강제stage/mapqa/testchar·P/G변경을 정상플레이 근거로사용하지않는다.

source/DOM/Audio/GL 대역PASS를 native/실입력/청취/시각PASS로치환0. 실제맵 QA 시 맵가이드 완독과 SSOT읽기순서·§23 보고/visual verdict가 필요하며 이번앱생성은카메라/전투 visual검수0다. 서명/codec/quarantine·전체동적dependency·영속save재기동·OAuth/crashpad 완전metadata격리도미인수다. output이동은고유절대save/profile파생계약변경이라별도검토한다.

[이전 c927 생성 근거](MAC_CH1_PLAYABLE_CANDIDATE_20261002.md)와 [활성 CH1-1 목표](../0마스터플랜/mac-resume-20261001/vscode-dispatch/MILESTONE-CH1-1-PLAYABLE-20261002.md)는 보존한다. 새앱생성1건을목표/6단계완료로계산하지않으며 source freeze는정확사본생성완료로해제한다.


### 후속 source 수정과 후보 구분

이 b3 앱은 SOUND/필터Y/charGate 세 수정의 고정 snapshot이다. 이후 양판 쓰레기 분해 확인 후 잠금·identity 재검사를 production source에 반영했으며 현재 source main SHA e462f2345682856d24bb416a17aec763281a8dceb02f21af565db189992353ea/easy68fa8e17d379fdf7e9da20b153d874e2ac74544d790397b4d36edbcc1207f390이다. b3 앱에 이 후속 수정이 들어간 것으로 계산하지 않는다. 새 source를 포함한 앱 생성/실제 기동은 별도 단계이며, 현재6단계 플레이·청취·visual 인수0을 유지한다. [후속 정확 계약](../2_7%20인벤토리+장비시스템/INVENTORY_JUNK_CONFIRM_REVALIDATION_20261002.md).
