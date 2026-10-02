# source16 Mac 후보 정확 계약 (2026-10-03)

성공 장착/해제의 중간 clamp 손실과 최종 계산 이전 저장을 고친 source16의 새 독립 Mac 앱이다. 포장과 실물 확인을 실제 플레이 완료로 계산하지 않는다.


## 2026-10-03 source16 현행 Mac 패키지 — 실물 확인, 플레이 미인수

현행 포장본은 장비 원자적 자원 갱신을 포함한 source `8883c59cb18e4c1bd3ad5cb83911fbe07242df12`, job `00072ed5-e133-4c61-9c39-59dd6271c0d5`, 격리 포트3392다. 앞선 날짜별 source15/3391·source11/3390 기록은 해당 버전의 보존 이력이다. 현행 생산 코드와 포장본은 이 시점 source16이며, source17 천공쇄기 메모리 후보는 포함하지 않는다.

| 항목 | 실제 확인 |
|---|---|
| 제작 | UTC2026-10-02T23:49:39.066Z, execute1·내부 plan1, 별도 plan/재빌드0. PACKAGED_NOT_RUNTIME_ACCEPTED·fixtureOnly=false·packageCreated=true |
| 사본 | 입력7918 중 비파생 payload7916의 새 stage/app 각1회 SHA·경로 검수 PASS. main/Easy/index 원본=stage=app3 exact |
| 파생·실행 | node-main·package 파생2 exact, node-main 전체 역치환으로 원본 복원. arm64 MachO 실행 파일5 SHA·0755·plist ID exact. 기존 공식 cached NW.js0.111.2/arm64/runtime340 재사용 |
| 증거 | physical-receipt.json 21238B·SHA c6787f69c3caee2730a29258e344fa39098baf92f08d022427881ad006690f97; 옛7918 inventory·옛검사·추가 build/API 재실행0 |
| 보존 | 고유 owner UUID/dev-ino 유지·cleanup/delete0. source11/15 기존 앱 존재·plist ID 확인. 사용자 이전59376baf/08cac1ce 앱은 정확 경로 미확보로 보존 확인 UNKNOWN, 변경0 |
| 실제 플레이 | source15 정상 새전사→CH1 LV1/지역0/32→보스방 이전 일반 필드0처치 사망은 별도 부분 이력. 이후 Maclocked 관측으로 부활 입력0. 새 source16 앱 기동/GUI/native0·새 profile/save 미생성 |
| 남은 인수 | 새 앱의 전투·획득·장착·4지역 정화·보스방 개방·보스 사망/부활/재도전·실저장·시각/청취는 미완. 장비 actual-source47/47은 이미 완료한 코드 검증이며 이 패키지 검수에서 재실행0 |
| 문서·Git | 관련 docs 전체440행/46경로 검색, 날짜별 역사와 관리자STATE/LOG4 보존. 완료한 root docs6만 scoped checkpoint·원격 정확SHA 대조, 보호 타인67 보존 |

### 원본·stage·앱의 동일 source3

| 파일 | bytes | SHA256 |
|---|---:|---|
| game.html | 4030345 | 399fd8b0b37b62ba9a95eb177e56693cba1b77827cde2146f3d2a3799f2ddc51 |
| game-easy-test.html | 3907631 | a88404ed79083753a1383ca6f7b82533bb3f198923cd63abcf34379f7b25afb9 |
| index.html | 342119 | 1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7 |

### 격리 경로와 실행 경계

- 앱: `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-00072ed5-e133-4c61-9c39-59dd6271c0d5/package/EXODUSER-00072ed5-e133-4c61-9c39-59dd6271c0d5.app`
- 새 프로필: `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-00072ed5-e133-4c61-9c39-59dd6271c0d5/user-state/profile`
- 새 저장: `/Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-00072ed5-e133-4c61-9c39-59dd6271c0d5/user-state/saves`
- 정상 진입: `http://127.0.0.1:3392/index.html?demo=1`
- bundle ID: `com.exoduser.mac.00072ed5-e133-4c61-9c39-59dd6271c0d5`
- 공유 빌더는 불변이다. 기존 source15 no-cleanup 사본 adapter를 사용해 시작 output 삭제·실패 job 삭제를 수행하지 않고 고유 소유 output을 검사했다. 다운로드·설치·서명·게시0이다.

### 원자료와 검증 한계

Ignored 근거는 `tmp/mac-migration-runtime/continued-review-20261003/ch1-source16-build/`의 build-config/preflight/execute-result/physical-receipt/docs-search-classification이다. 코드·테스트·docs13 원격 체크포인트는 `8883c59cb18e4c1bd3ad5cb83911fbe07242df12`이며 이 보고서의 docs6 보존은 후속 커밋이다. node-main 파생은 포트와 saveRoot만 변경, package는 정상 main/node-remote/절대 프로필과 앱 product string을 검수했다.

실물 검수는 새 stage/app의 copied payload와 파생·실행 파일을 확인한 것이다. 전체 현재 원본7918 재인벤토리·runtime cache 재해시·old package 재검수는 하지 않았다. source11/15 존재 확인은 옛 profile/save 내용 검증이 아니다. source16 신규 앱은 아직 실행하지 않아 정상 demo localStorage·API 저장·보스전·재도전·오디오 완료 근거가 없다. 기존 잠금 해제 질문을 반복하지 않고 가능한 생산 통합을 계속한다.

source15 부분 화면은 `source15-native-play/04-ch1-normal-entry.png`(정상 필드)와 `05-normal-field-death.png`(보스전 이전 사망)다. 이 이력은 보스 사망 맵 보존 수정의 native 회귀 검증으로 사용할 수 없다.
