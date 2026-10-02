# Mac CH1 연결 시연 후보 — 2026-10-02

실제 최신 게임 입력으로 Mac 앱 파일을 생성했다. 앱 생성·출력 검증은 완료했지만 **실제 앱 기동과 CH1-1 연결 플레이는 미인수**다. 12:27:16~12:27:56 UTC에 `execute`1회가 exit0으로 끝났고 내부 `verifyOutput`1회를 통과했다. 별도 verifier/과거 검사 재실행0이다.

| 항목 | 정확 값·인수 범위 |
|---|---|
| job | `c927efb0-0fe8-419c-b782-287833b4f121` 새UUID; 옛 job/config 재실행0 |
| 상태 | `PACKAGED_NOT_RUNTIME_ACCEPTED`, fixtureOnly=false / packageCreated=true |
| 실제 앱 | `outputs/mac-package-ready/mac-packager-c927efb0-0fe8-419c-b782-287833b4f121/package/EXODUSER-c927efb0-0fe8-419c-b782-287833b4f121.app` |
| source 원격 checkpoint | `dd33341350e3fb7cedb77a6c68c9d392b4c99844`; 뼈벽 포커스 취소·기존 보스 사망 복원 포함. 뒤의56322는 raw/docs만이며 앱source는dd333 snapshot |
| 입력 | 기존 승인선택7,918개 / 6,645,490,229B. game2/node-main3 현재pin 갱신, 나머지7,915 기존근거 보존 |
| 원복사/파생 | input7,916 byte/SHA동일 + package.json/node-main.js2 정상파생; node의port/save 외 역변환 원문동일 |
| game main | SHA `391155f3700e584cebf260942a95cfd4f4bbcc2cd6d700c6db65084ab7ad35d2`, source→stage→실앱 복사동일 |
| game easy | SHA `21a4d3b73b6ddcf765ec1e4a9505329c9f28248828f95b5cbc8993f005f52c0a`, source→stage→실앱 복사동일 |
| runtime | 기존 NW.js0.111.2 osx-arm64 cache/release 사용.340pin 중 출력334동일/6메타데이터 정상파생. 새다운로드/설치0 |
| builder/helper | 기존 고정nw-builder4.17.10 local bld와helper4 pin; 최상위 getter/download/npm install0. 새closure helper후보 미적용 |
| 앱 실물 | 일반파일8,253 + symlink5 / 7,043,801,686B. output manifest로경로/byte/SHA 기록 |
| bundleID | `com.exoduser.mac.c927efb0-0fe8-419c-b782-287833b4f121` |
| main/port | `http://127.0.0.1:3384/index.html?demo=1`; node-remote loopback3384만. 실제 기동 직전 재점유 확인 필요 |
| profile/save | 고유job `user-state/profile`·`user-state/saves` 절대경로. build후두경로미생성; 기존3333/3340/3381/3383·사용자세이브 무조작 |
| 새config | `outputs/team-review-20261002/ch1-playable-c927efb0-0fe8-419c-b782-287833b4f121/build-config.json` SHA `eee8d7ea4234d907b900447148c69fd5e9666bc11fe68b560a2bd7f991569312` |
| output manifest | `tmp/mac-migration-runtime/continued-review-20261002/ch1-playable-build-readiness/build-output-manifest.json` SHA `f9f8cd2ad99775b04d7b32465619dd7cb10d85574b2acbfd0ab749806f579901` |
| build final receipt | 같은 evidence폴더 `build-final-receipt.json` SHA `464c456fd0238100aed28ce38771eae8358744492172359645df1e4942164ac8` |

## 실제 기동과 플레이 Gate

총괄은 BUILD/QA 공식 현재담당의 실측lease/백그라운드0 회신을 인수하고 새job build→QA 단일슬롯을 순차 예약했다. 기존 앱 프로세스만으로 현재 실측중/여유를 단정하지 않는다. build완료 뒤 새앱 exactpath의 `cua.getApp` 기동을 시도했지만 도구가 **Mac locked / 자동잠금해제 불가**를 명시했다. 성공 기동으로 계산하지 않고 사용자에게 잠금해제만 요청했다. shell/다른호스트/권한변경으로 UI 잠금을 우회0이다.

| 미인수 Gate | 다음 실제 인수 조건 |
|---|---|
| native 기동 | 잠금해제 뒤 정확새앱/3384 main·server/PID/window와고유 profile/save를 확인 |
| CH1 연결 플레이 | 동일 후보에서 로비/선택→전투·획득/장착→4지역 현행게이트→보스전 사망→기존부활/필드상태보존→재도전 6단계 관측 |
| 실제 진행 | mapqa/testchar/stage/Lv100 강제진입·게임변수직접변경을 정상클리어 근거로 사용0 |
| 카메라/전투/청취 | 실제 맵/카메라·입력·효과·청취 증거. source/오디오/GL/DOM 대역검사를 native/visual PASS로대체0 |
| 저장·미디어/배포 | 고유테스트save 재기동/codec/sign/quarantine·동적의존성 일반완전성은미검수. 앱을이동/배포하는계약도미인수 |

맵 QA 담당은 `EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md` 완독·`_MAP_SSOT_INDEX.md`의 현행콘셉트/production/P0/P0.5 순서를 적용한다. 이번은 앱 생성보고이며 실제 맵 visual검수0, 기존 MAP-020 RETOUCH를 새 PASS로치환하지 않는다. 기존앱21core/config·runtime340/builder4/release·source3/사용자23 정확보존 근거는 build영수증에 남겼다. 공용source/Git/공유docs는 총괄 소유, 팀candidate와제품완료를분리한다.

[활성 CH1-1 목표](../0마스터플랜/mac-resume-20261001/vscode-dispatch/MILESTONE-CH1-1-PLAYABLE-20261002.md)는 아직 ACTIVE다. 앱 생성1건을6단계시연/투자완성으로확대하지 않는다.
