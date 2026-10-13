# EXODUSER · Godot 첫 이식본

실제 Godot 노드·GDScript로 CH1-1 이동·충돌·기검참과 지원된 초기 육괴를 구동한다. 기존 브라우저 본편과 별도 실행하며 기존 세이브·API를 읽거나 쓰지 않는다.

현재 소스는 정본 초기 생성 경로의 원16개체 snapshot을 `data/encounters.json`에 그대로 보존한다. 기존 medium/dark 육괴2개체에 order14 `ch1_initial_015`의 etype0/physical/`flesh_crawler`만 별도 profile `native_ch1_etype0_physical_flesh_crawler_v1`로 추가하여 지원3개체/미지원13개체다. 원 record의 support=false/runtime=null·seed/RNG·배치·원 HP875/ATK31은 바꾸지 않는다. 이 개체는 접촉24·공통60tick 차지 물리탄24(dtype=parry, energy_def 소비, KB heading×2)와 eShield875 선흡수를 사용한다. 기존 본체8방향·거리128당 walk4프레임과 원 PNG17장/26,726,245bytes를 소비하며 실제24장/24FPS 신규 모델 제작은 아니다. [이번 consumer 정본](../docs/engine/FDG_GODOT_ETYPE0_PHYSICAL_FLESH_CRAWLER_20261013.md). 이번 고유3개 기술 검사는 PASS다(최초1PASS/2fixtureFAIL→오라클 수정 뒤 실패2개만 재실행2PASS/exit0, 제품 수정0·통과 검사/이전3·5 재실행0·GUI0). 생존 stun 관측·새 source 실앱·시각·최저사양240FPS는 미검수다(VISUAL VERDICT: RETOUCH). ticket-linked windup 자동 진입·burn DOT·부활은 미이식이다. 앞서 전달한 인간의 전체화면 일시정지 앱은 첫 한 적 버전을 유지하며 이 후속 source를 로드하지 않았다.

macOS 실행:

```sh
/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot --path /Users/fordeargamers/the-exoduser/godot
```

또는 이 폴더의 `run.command`를 실행한다. 다른 컴퓨터에서는 공식 Godot 4.7.2에서 `project.godot`를 열고 F6/F5로 실행한다. Windows 메인 PC로 전달·실행한 상태는 아직 아니다.

| 조작 | 기능 |
|---|---|
| WASD | 이동, 벽에서 미끄러지는 실제 물리 충돌 |
| 마우스 | 공격 방향 |
| 좌클릭 | 기검참 1·2타 즉시 발사, 3타 누른 동안 충전·놓을 때 발사 |
| Q | 기검참 준비/공격 취소. 이미 발사된 검기는 유지 |
| Space | 3타 준비 후 홀드/해제 토글. 좌클릭 지속 입력과 구분되는 공개 접근성 입력 |
| Esc / 화면 버튼 | 일시정지·재개 |
| 화면 재시작 버튼 | 이 Godot 씬의 새 게임. 브라우저 저장과 독립 |

이식 기준은 `/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html`, HEAD `9a4534b42f74093095ebc3364a25dd104e93b379`이다. 구형 FDG QA 숲길 대신 이 본편의 CH1-1 지형과 기존 제작된 PNG를 사용한다. 플레이어는 장비·패시브 적용 전 `mkP()`의 HP350/ST200, 레벨1을 기준으로 한다.

기검참 3타는 40/80/120틱(최대 2초)에 검기 피해 2/4/8배, 판정 반경168/216/264px다. 새 9프레임 비행 검기·4프레임 명중광을 재사용한다. 캐릭터 원본의 장수는 그대로이며 신규 24장 모델 제작은 포함하지 않는다.

렌더 목표는 우리 Steam 최소사양급에서 1920×1080·240FPS(4.1667ms)다. 물리·게임 시간은 60Hz로 분리한다. Compatibility 렌더러를 사용하며 Windows 저사양에서 240FPS 달성 여부는 미검증이다. 이번 맥 한 적 씬의 측정 결과는 전체 게임 성능을 보장하지 않는다.

검수 기록은 전용 `user://qa/latest-session.json`에 저장된다. 실제 폴더는 Godot의 `EXODUSER-Godot-Native-First` 전용 사용자 데이터 경로다. 원본 게임 저장 자동 변환·덮어쓰기는 없다.

전투·맵·앞선 공개 검수는 `../docs/engine/FDG_GODOT_NATIVE_FIRST_20261013.md`, 현재 factory·원본 목록·지원/미지원 및 새 기술 검사 상태는 `../docs/engine/FDG_GODOT_ENCOUNTER_FACTORY_20261013.md`를 참조한다.
