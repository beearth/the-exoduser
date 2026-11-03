# A2R — 기존 3D 1-1 + 웹 원화 이식

기준: `codex/unity-map-a2-20261103` / unity/main `5062b5701`. GB1은 중단했다. BRIEF_A2R의 14:30 사용자 정정이 우선이다. stage·commit·push와 바로가기 판정은 맵 총괄이 한다.

| 범위 | 계약 |
|---|---|
| 구도·걷기·원근 | A2Field·SourceMap·NativeRemodelCamera를 유지. 배치·지형·Core·액터 그리기 방식 변경 없음 |
| 웹 기존 소품 | a5c287157 C10 원화 중 현재 SourceMap.props의 ID·XY가 일치한 34개. 원화 PNG/기존 노멀만 복용. x=px/100, z=-py/100 |
| 접지 | 실제 A2 지면·다리의 표현 전용 layer28 쿼리. 아래 레이 높이에서 4cm 묻고 불투명 최저점 피벗. Y축 빌보드·AO. 동일 위치 대응 3D 소품은 유지하고 중복 표 작성 |
| 바닥·늪 | 기존 웹 r3_litter/r3_soil/r4_tex_mud/r3_water를 기존 재질에 연결. KeyScene 바닥 그림·새 키트·새 데칼 없음 |
| C10 조명 | 달빛 RGB(.36,.56,.65), 세기1.05, Euler(32,-44,0), 그림자.9. 캠프 반경6.5/세기4.8 + 반경3.4/세기3.6, 따뜻한 색. 포탈 붉은빛 반경4.4/세기4.56 |
| Volume | Neutral, exposure1.30, contrast0, saturation0, bloom.055/threshold1.5. Gaussian24~38m/.6. 청남색 그림자, 보라색 억제 |
| 영웅 | 기존 윤곽광을 달빛 한 면으로 위치·세기 조정. 짧은 .78×.42 접지 그림자. 기존 메시·스프라이트·합성·아틀라스 미수정 |
| 가림 | 기존 3D 나무·고목 및 큰 원화 카드. 영웅/화면 안 전투 배우·탄 근처 원형 마스크만 알파.30, 0.2초. 연속 알파이며 디더링 없음 |
| 실행 | `--a2r1-light` 시험 적용. `--unity-field-screen --a2r1-light-capture --a2-plan-capture`는 같은 패키지 A/B 8컷+가림3컷+정사영 구조도. 일반 실행 기본값은 기존 장면 |
| 구조도 | 별도 정사영 카메라4096², x[-4,84],z[-84,4]. image=(CoreXY+400)×4096/8800. 실제 Core walk0/actor 범위와 앵커 JSON. 게임 카메라 변경 없음 |

산출: `I:/EXODUSER-Storage/map25d/a2redesign/`. 고정 build-current 하나. 실제 화면 검수 전 상태는 미검증이다. 2단계는 구조도 판정 뒤 진행한다.


## 2026-11-03 CTO 인계 — PC 컴파일만, 촬영은 Mac

15:39 PC 비정상 종료 뒤 CTO 지시로 소스·데이터·원화·자기 .meta만 경로 지정 커밋·push한다. PC에서는 Unity Editor/Player/빌드/촬영을 실행하지 않는다. 관련 문서와 CHANGELOG_SYNC도 함께 반영한다. Library/Temp/Generated 및 기존 타 경로 .meta/ProjectSettings 잡음은 제외한다.

Mac 빌더는 Exoduser.A2RBuilder.Build이며 OSXEditor에서는 EXODUSER-A2R.app을 만든다. 같은 패키지 촬영은 A/B8컷, 고목 뒤3개 고정 위치, 4096 정사영 원본+좌표 JSON이다. 가림 위치가 막혔으면 인접 보행점으로 보정하고 실제 좌표를 기록한다. 3컷 누락/해상도 불일치/구조도 누락은 PASS가 아니다. 필드보스가 아직 생성되지 않았으면 Core의 정적 FieldBossSites 정의를 촬영 시 1회 읽어 실제4좌표를 기록한다. Core를 변경하거나 강제 소환하지 않는다.

검증 경계: C# 컴파일과 별도로 셰이더·Mac 빌드·실제 화면·접지·투명화·성능은 미검증이다. 가림은 현재 영웅 포함 최대8개 화면 타깃을 사용한다. 밀집 전투의 전체 적/탄막 커버는 후속 검수 대상이다. 고목3컷은 고정 위치 샘플이며 자연 도보/연속0.2초 동작의 증거를 대신하지 않는다.

MAP PRODUCTION REPORT: STAGE=기존 에셋 이식 코드 인계 / MASTER PLAN·OUTER MASS·GROUND=기존 A2Field LOCK / PLAYABLE=기존 Core 유지 / CAMERA=원근 유지, 구조도만 별도 정사영 / TECH QA=PC C# 컴파일 결과는 MAC_RUN.md / VISUAL VERDICT=미검증 / NEXT=Mac 동일 패키지 촬영 후 맵 총괄 판정. 실행 인자·실제 push SHA는 I:/EXODUSER-Storage/map25d/a2redesign/MAC_RUN.md에 기록한다.
