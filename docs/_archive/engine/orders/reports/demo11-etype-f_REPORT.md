> 2026-10-21 후속: 이하 ef64bd17 당시 인수 이력이다. 후속 DEMO11-enemy-base3에서 factory/common World/43 이관을 수행하며 F actor/생성 수치와 미지원 owner를 보존했다. 현행 결과는 demo11-enemy-base3_REPORT.md.

# DEMO11-etype-f 인수 보고 (2026-10-21)

**26·27·28 append-only 등록과 격리 MAP11 Marker의 실제 actor 생성·기존 hurtE 호출을 확인했다. 전체 전투 READY 판정은 아니다.** 실제 투사체·돌진 접촉·강타 피해/패링 owner는 NOT_READY이며 Player 둔화만 기존 API를 호출한다. 제품 MAP11 provider·자연 자동 scheduler는 이 자료의 검증 범위 밖이다.

기준: fetch한 `origin/main 0138c5bb9188d27cee10cb1a901d075092ddb88f` + adapter `9b763da9` + B `c6d19973bf000dcaf68f4e6c368cc7fa06039af0`를 정상 merge, 작업 직전 HEAD c6d19973. rebase0. 갭 문서 원격 `codex/demo11-gap-20261021` §4.1 192–194행의 75/76/77 대응. 원본 행 발췌는 `_out/demo11-etype-f/source-lines.txt`에 보존한다.

| 단위·etype | 실제 인수 / 원본 game.html 근거 | NOT_READY·공통 기반 이관 후보 |
|---|---|---|
| 75 / 26 | 기존 main profile·atlas/kernel, HP875→874 hurtE. G31232–33 Cd180+60U/T60+30U, G39086–93 암속성 눈보라 packet·atk*.3 정수화/life180. pending 유지 중 actor tick 지속 | blizzard 전용 owner, charged 탄·telegraph/SFX. F actor pending receipt·F spawn literal 검증을 ttys006 enemy-base로 이동 후보. P3 표40과 원본30 불일치 발견, 공용 수정 없이 F만30 수락 |
| 76 / 27 | HP875→874 hurtE. G31226–27·G39094–39108 궤도120/회전.05sp·돌진15, G40540–49 이동6sp/벽25/종료35. G20119 eProjAt wrapper 인자 보존 | 고드름/charged 탄, swoop contact PC owner. 첫 요청 ack 전 두 번째 RNG0. `_icicles`·접촉 요청을 공통 기반으로 이동 후보 |
| 77 / 28 | HP875→874 hurtE. G31230–31·G39109–24 wind50, 실제 Player.apply_native_freeze_slow(120). G40550–58 반경70+r·배율2·넉백10/6 요청 | slam 피해/패링/넉백 owner. ack 없이 shock/recover 성공 처리0. wind/slow·receipt를 공통 기반으로 이동 후보 |

세 타입의 source stats/speed/radius/range는 G30847–76·G31125–54, ranged flow는 G38688–38708, idle/charge는 G40456–40524. element 미지정은 -1 유지. 기존 `native_demo11_boss_projectiles.gd:6,77`은 blizzard specialized owner를 요구하고 보스 actor에 묶여 있다. `native_element_projectile_emitter.gd:92–110`은3/7/21만 수락한다. 기존 owner를 F에 강제 사용하거나 PC 허용 범위를 확대하지 않았다.

Main 변경은 `main.gd:3077–3084` **추가8줄**, factory는 `enemy_factory.gd:697–711` **추가15줄**. c6d19973의 기존 Main3076/factory696줄 byte prefix 동일(`scope-audit.json`). State/World/Player/hurtE·보호 전투 경로 변경0. 새 공통 helper0; B 방식의 F 전용 source-selected entry·고유 상태만 구현. 설치 factory/P3 profile 재사용, 실제 NativeSpawnHoleSystem owner만 수락. DEMO11-43 Marker receipt만 사용하고 좌표 대체/맵 배치0. token 중복·외부 owner 거부, 분모 증가0. 지원 slice는 stage0/normal diff5/offset0/elite0/mods[]이며 나머지는 기존 admission에서 거부한다.

| 검증 (관련 스위트 각1회) | 수치·한계 |
|---|---|
| 신규 실제 runtime | 33검사/0실패, 등록3·hurtE3·둔화120틱·미연결 강타 Player HP 불변. actual_projectile_or_slam_damage_verified=false |
| 고정 물리 벽시계1회 | 120Hz, warmup10+N120, 3actor 생존/phase 각130회. 생성2.176ms, 평균0.108467ms/p99 0.183ms/최대0.193ms, wall957.649ms. 26검사/0실패, 8.333ms 예산 이내. 원본 초기 timer 중간값 fixture에서의 phase이며 특수 탄/접촉 최악 부하·전체 게임/렌더 FPS 아님 |
| 기존 관련 회귀 | B runtime42검사/0실패, factory3그룹/실패 assertion0. 기존 테스트 수정0·각1회. |
| 내부 viewport/1x | 25검사/0실패, 실제 내부1920×1080·256×256 1x PNG 직접 확인. 기존 인트로/HUD와 Fixture-1 표기가 함께 보이는 격리 장면. 제품 MAP11/특수 탄 시각 증명 아님. |

새 테스트는 `EXODUSER-demo11-etype-f-Isolated-20261021`, 기존 테스트는 각 파일 상수명(상수 없는 factory도 F 격리). 실제 사용자 폴더 사용0. 매 실행 전 exact pgrep count2이상30초 대기 원로그 포함; override 실행마다 설정 후0byte. 새 틱 목록 생성API0. Node/OS.execute 신규 호출0. Camera2D 기존 interpolation 경고는 원문 보존하며 ERROR 여부는 실행 JSON에 기록한다.

원로그 `/Users/fordeargamers/exoduser-wt/_out/demo11-etype-f/`, 내부 viewport와 1x crop은 `captures/`. 새 UI/문구/번역 목록 변경0. 캡처 바이너리 커밋0. 관련 docs/8.0 갱신, 정상 pre-commit·경로 지정 stage·자기 브랜치 push·원격 SHA 일치·DONE 후 자기 worktree만 제거한다. R의 branch/HEAD/status는 시작 snapshot과 비교한다.
