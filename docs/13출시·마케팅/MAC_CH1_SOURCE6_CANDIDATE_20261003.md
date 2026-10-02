# Mac CH1-1 source6 고정 시험 앱 — 2026-10-03

공식 cached NW.js builder로 현재 production source6의 별도 물리 앱을 생성했다. 공용 확인창 재진입 보호와 실제 소비 사망 혈흔 준비를 포함한다. 생성·파일 계약은 인수했으며 실제 실행·게임 연결6단계는 아직 미인수다.

| 항목 | 정확 결과 / 검수 범위 |
|---|---|
| job | `3dd1813f-7e53-4987-acb4-03df340810a5` |
| app | `outputs/mac-package-ready/mac-packager-3dd1813f-7e53-4987-acb4-03df340810a5/package/EXODUSER-3dd1813f-7e53-4987-acb4-03df340810a5.app` |
| 코드 / backup | `17403ad7fd42b0abc4a5c3a82fd11d194ad37e84`; source2/docs10 원격 exact SHA. 새 설정의 backup.inputs와 승인된7918 입력 동일 |
| source main | 4028973B / `1e4591caea739887ce749492db4ea72547292f583fba1f8e4fcafe88071f8bb8` 원문·stage·app exact |
| source easy | 3906420B / `17f490d5d5e38b0fac39085578115acd4b35e48263e84dd542b9a2f298e3ccf5` 원문·stage·app exact |
| source index | 342119B / `1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7` 원문·stage·app exact |
| source4 대비 | main/easy 각+67B: source5 gameConfirm 보호47B + source6 death_blood 준비20B. 활성 확인 요청 보존·새 요청 false 및 혈흔 준비 범위 추가; 전투 공식·수치 불변 |
| 실제 생성 | fresh plan1 `READY_PLAN_ONLY`→actual execute1/default nw-builder4.17.10→내부 verifyOutput1 exit0. `fixtureOnly:false`, `packageCreated:true`, `PACKAGED_NOT_RUNTIME_ACCEPTED`; execute17:53:51Z 시작·약40초 뒤 종료, 재빌드0 |
| 입력 / runtime | 승인된7918 selector·비파생7916 유지. runtime340/cache/releaseInfo 기존 pin 재사용; 내부verify가 비파생7916와 main/helper payload SHA를 직접 대조. 별도 전수 SHA verifier0 |
| artifact | 신규 앱 regular8253 / symlink5 / regularbytes7043803267. 이 수치는 app 생성 직후 metadata snapshot이며 앱 기동 뒤 생성 파일로 집계를 덮어쓰지 않음 |
| 플랫폼 / identity | osx-arm64/NW.js0.111.2. 새 main/helper4 실행 파일 모두 실행비트·Mach-O arm64 헤더·CFBundleExecutable 일치. bundleID `com.exoduser.mac.3dd1813f-7e53-4987-acb4-03df340810a5` |
| main / port | `http://127.0.0.1:3387/index.html?demo=1`; node-remote127.0.0.1/localhost3387만. 실제 port free는 plan/execute 직전 snapshot, 실행 전에 다시 확인 |
| profile / save | 새 job의 `user-state/profile`, `user-state/saves` 고유 절대 경로. 실제 생성 이후 user-state 부재 확인. 기존3333/3340/3386 및 사용자 save/profile에 쓰기0 |
| 고정 source4 보존 | 기존97bb 앱/PID48587/3386의 core5·원래 config·packager 바이트 exact; own `_sharedMats.json`31B도 사전/사후 동일. 기존 앱 기동/정상필드 사망 관측 이력은 그대로 보존 |
| config | ignored `ch1-source6-build/build-config.json`3428499B / `bff34315acff6d1f742f6b349c244fb8686fbd3237eddf98bd3ac2865575a4df` |
| 실제 execute 근거 | `execute-result.json`5146B / `8ec45a45a91d12237f5d737f776bac61c743f962896ef0e4a5e9bef20788fa0e` |
| 신규 artifact 근거 | `artifact-manifest.json`5584B / `a6be64ac2159bbfb93908a256e1ff70414150a227040c66d0d6cd444bb8eecea` |
| 최종 생성 영수증 | `build-final-receipt.json`2842B / `297e8d1a254da30e5032dcf58648474c5c7cb5d734caf1a4585d22ec86f4852b` |
| 근거 위치 | 위 ignored 파일들은 `tmp/mac-migration-runtime/continued-review-20261003/ch1-source6-build/`에 존재 |
| 기존 검사 | source5 재진입12+정상4와 source6 기존 warmup4/구문12script2JSON의 확정 근거를 재사용. 포장시 재실행0/기존 GPU·네이티브·청취 실측 재사용0 |
| 실행 / 남은 Gate | app launch0/server-start0/native6/음향청취/firstkill 개선 측정0. Mac 잠금 명시 확인·기존 수동해제 질문 대기. source4 정상 로비/실습/필드 부분 관측을 source6 native 완료로 계산하지 않음 |

## 실제 플레이 인수 기준

같은 새 고유 앱에서 정상 로비·캐릭터 선택→전투·획득/장착→4지역 현행 게이트→CH1-1 보스 사망→기존 부활·필드/열린 보스방 보존→재도전의 연결6단계를 실제 입력으로 검수한다. 강제stage/map/testchar·P/G 변경을 정상 플레이 근거로 사용하지 않는다. 실제 BGM/SFX 청취·player save 재기동/복원과 전체8카메라·전투 시각 검수도 남아 있다. 맵 QA는 맵가이드 전체·SSOT 읽기순서·§23 보고와 VISUAL VERDICT가 필요하며 기존 부분관측 RETOUCH를 새 PASS로 바꾸지 않는다. 서명·배포·OAuth/crashpad 완전격리·전체동적dependency 인수는 별도다.

생성 사본에 현재 source3 exact를 확인했으므로 포장용 source freeze는 해제한다. 실제 플레이 목표는 미완료다. 기존97bb 시험 앱과 사용자 원래 게임/세이브는 보존한다.

[source5 확인창 계약](../2_7%20인벤토리+장비시스템/INVENTORY_JUNK_CONFIRM_REVALIDATION_20261002.md), [source6 혈흔 준비·실측 구분](../12퍼포먼스·최적화/COMBAT_TEXTURE_WARMUP_20260929.md), [source4 부분 플레이 이력](MAC_CH1_SOURCE4_NATIVE_PARTIAL_20261003.md).
