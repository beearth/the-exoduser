# source17 Mac 후보 정확 계약 (2026-10-03)

천공쇄기의 착탄·잔류 피해·파편을 기존 필드 몹 피해 처리에 연결한 생산 코드를 담은 별도 Mac 앱이다. 수치 변경과 대검 강타의 중복 타격 추가는 없다. 포장 성공을 CH1 실제 플레이 인수로 계산하지 않는다.


## 2026-10-03 source17 현행 Mac 패키지와 정상 부활 부분 관찰

현행 생산 code source17(천공쇄기 필드 타격 수정)의 체크포인트는 `84e122699c0bbfcf5a3e7a84eff0d87bb9369b45`다. 새 패키지는 이후 메일 기록을 포함한 입력 Git `411c049db8b97ba0eafbe5e81cda4306b1325461`, job `7aa83459-0b98-44c1-a7d5-35903d9acbee`, 포트3393이다. source16/3392와 source15/3391 패키지는 이전 버전으로 보존한다. 과거 Maclocked 관측은 이력이며 최신 source15 정상 부활 입력은 실제로 동작했다.

| 항목 | 실제 근거·완료 경계 |
|---|---|
| 새 제작 | UTC2026-10-03T00:19:06.104Z; root execute1·내부 plan1·별도 plan0, PACKAGED_NOT_RUNTIME_ACCEPTED·fixtureOnly=false·packageCreated=true |
| 입력·사본 | selector7918/runtime340 재사용·main/Easy핀2 갱신. 새 stage/app 비파생7916 각1회 SHA·커버리지 일치, source3=stage3=app3 exact |
| 실행 계약 | 파생bootstrap2 exact·node-main 전체역치환 원본복원, arm64 MachO 실행5 SHA·실행권한·bundle plist exact; 새 owner UUID/dev-ino 유지 |
| 실물 영수증 | physical-receipt.json 22233B / SHA256 `dd0c95f0d3b97192be783f97201b66e1fbaca345c3675cf4923235ac35ff529f`; 새 패키지 실물 확인이며 실제 플레이 PASS가 아님 |
| 코드 검증 | source17 actual-source20/20·fixture0 및 JS12/JSON2는 앞선84e1226 코드 검증. 이번 패키지에서 반복 실행0. source16 장비47/47·source15 해제48 검사를 새 플레이 증거로 계산0 |
| 정상 부활 부분 | 별도 own source15/3391에서 사망 버튼 “다시 일어서라”로 정상 일반필드 부활. 실제 화면 HP565/565·MP394/394·SP226/226·LV1·EXP0/15·지역0/32·SW물13M, 이후 Settings 일시정지. 난이도 표시는 일반(5) |
| 관찰 한계 | source15 living pixel timer00:00·AX stale00:18은 구분하고 pixels 우선. 보스방 이전 일반 사망/부활이므로 보스 사망 맵·몹 보존 회귀 검증이 아님. screenshot 저장 fs미정의1은 캡처·UI 성공 후 발생, 기존 버퍼 import 복구로 보존 |
| 새 앱 인수 | source17 앱 GUI기동/native/시각/청취0, 신규 profile/save 미생성. 같은 source17의 전투→획득→장착→4지역→보스 사망/부활→재도전·실저장·청취는 아직 미완 |
| 보존·동기화 | 기존source11/15/16 앱 존재·plist ID 유지·사용자 앱/세이브 변경0. 과거 사용자59376baf/08cac1ce 정확 앱 경로는 UNKNOWN. docs 전체 1470행/179경로 검색 후 현행 root6만 추가, 보호67/관리자4/기존 WIP 보존 |

### 입력 코드의 고정값

| 파일 | bytes | SHA256 |
|---|---:|---|
| game.html | 4030511 | 7ae190a940fe6983c6e8fe8c7463f8f77348ab398c354b7d8f66f0bea9d04b7c |
| game-easy-test.html | 3907797 | db2b15bee93f7588064398af082ef25cdd498382f4f24ea01a00b3d261286249 |
| index.html | 342119 | 1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7 |

### 격리 계약과 남은 검수

- 앱: `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-7aa83459-0b98-44c1-a7d5-35903d9acbee/package/EXODUSER-7aa83459-0b98-44c1-a7d5-35903d9acbee.app`
- 새 프로필: `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-7aa83459-0b98-44c1-a7d5-35903d9acbee/user-state/profile`
- 새 저장: `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-7aa83459-0b98-44c1-a7d5-35903d9acbee/user-state/saves`
- 정상 진입: `http://127.0.0.1:3393/index.html?demo=1`
- bundle ID: `com.exoduser.mac.7aa83459-0b98-44c1-a7d5-35903d9acbee`

기존 source15 no-cleanup adapter를 재사용했다. 다운로드·설치·서명·게시·기존 output 삭제·실패 job cleanup0이다. 원본 전체7918 재인벤토리·캐시 재해시·옛 앱 검사·옛 코드 검사 반복0이며 새 stage/app 실물만 확인했다. source17 앱을 정상 진입하여 전투·루팅·장비 갱신과 보스 사망 후 문 개방/필드 몹 유지·재도전이 같은 후보에서 동작하는지 검수해야 한다.

Ignored 근거는 `tmp/mac-migration-runtime/continued-review-20261003/ch1-source17-build/`의 config/preflight/execute-result/physical-receipt/docs-search-classification이다. source15 부활 부분 근거는 `source15-native-play/normal-revival-receipt.json` 및 `06-normal-revival-paused.png`, `07-normal-revival-field.png`다. 새 앱과 이전 앱의 증거를 합쳐 한 번의 완주로 보고하지 않는다.
