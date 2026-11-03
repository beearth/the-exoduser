# A2R — 기존 3D 1-1 + 웹 원화 이식

기준: `codex/unity-map-a2-20261103` / unity/main `5062b5701`. GB1은 중단했다. BRIEF_A2R의 14:30 사용자 정정이 우선이다. CTO 직접 지시로 자기 소유 경로만 commit·push한다. 바로가기 판정은 맵 총괄이 한다.

| 범위 | 계약 |
|---|---|
| 구도·걷기·원근 | A2Field·SourceMap·NativeRemodelCamera를 유지. 배치·지형·Core·액터 그리기 방식 변경 없음 |
| 웹 기존 소품 | a5c287157 C10 원화 중 현재 SourceMap.props의 ID·XY가 일치한 34개. 원화 PNG/기존 노멀만 복용. x=px/100, z=-py/100 |
| 접지 | 실제 A2 지면·다리의 표현 전용 layer28 쿼리. 아래 레이 높이에서 4cm 묻고 불투명 최저점 피벗. Y축 빌보드·AO. 동일 위치 대응 3D 소품은 유지하고 중복 표 작성 |
| 바닥·늪 | 기존 웹 r3_litter/r3_soil/r4_tex_mud/r3_water를 기존 재질에 연결. KeyScene 바닥 그림·새 키트·새 데칼 없음 |
| C10 조명 A2 보정 | 달빛 RGB(.86,.88,.93), 세기.75, Euler(32,-44,0), 그림자.9. 캠프 반경6.5/세기6.2/RGB(1,.32,.08) + 반경3.4/세기3.6/RGB(1,.52,.20). 보조 캠프 glow는 그림자 없음. 횃불 반경5/세기7/RGB(1,.40,.10). 포탈 붉은빛 반경4.4/세기4.56 유지 |
| Volume | Neutral, exposure.80, contrast0, saturation0, white balance temperature12/tint3. split shadows(.48,.49,.51), highlights(.53,.51,.48), balance−15. bloom.055/threshold1.5/scatter.5. Gaussian24~38m/.25 |
| 환경·안개 | Trilight sky(.105,.100,.090), equator(.075,.070,.058), ground(.018,.015,.012). 높이 안개 RGB(.040,.043,.045), density.008/falloff1.2. 기존 빛줄기 RGB(.60,.65,.70)/alpha.010. 달빛 spot은 시험 표현에서만 끄고 원본 A/B에서는 복원 |
| 영웅 | 기존 윤곽광을 달빛 한 면으로 위치·세기 조정. 짧은 .78×.42 접지 그림자. 기존 메시·스프라이트·합성·아틀라스 미수정 |
| 가림 | 기존 3D 나무·고목 및 큰 원화 카드. 영웅 중심 화면 높이12% 반경, 내부70%부터 가장자리까지 smoothstep. 원 안 알파.30/밖 불투명, 0.2초. 픽셀과 타깃을 같은 GPU 투영행렬로 계산해 Metal 축 차이를 배제. 깊이는 Renderer 후보 선정에만 사용하고 픽셀 면을 자르지 않음. 디더링 없음 |
| 캠프 가림 | 고정 웹 XY 캠프 카드 중심의 화면 높이18% 원형 마스크를 기존 3D 나무·고목에만 추가. 원화 카드끼리의 가림에는 적용하지 않음. 지형·나무 위치·Core 불변 |
| 수면 밝기 | A2R 시험 재질만 `_SPECULARHIGHLIGHTS_OFF` 로 직접광 흰 정반사 제거, smoothness.18. 기존 실제 planar 반사·흐름·거품 유지. 원본 A/B는 원래 keyword와 smoothness 식 복원 |
| 실행 | `--a2r1-light` 시험 적용. `--unity-field-screen --a2r1-light-capture --a2-plan-capture`는 같은 패키지 A/B 8컷+가림3컷+정사영 구조도. 일반 실행 기본값은 기존 장면 |
| 구조도 | 별도 정사영 카메라4096², x[-4,84],z[-84,4]. image=(CoreXY+400)×4096/8800. 실제 Core walk0/actor 범위와 앵커 JSON. 게임 카메라 변경 없음 |

산출: `I:/EXODUSER-Storage/map25d/a2redesign/`. 고정 build-current 하나. 실제 화면 검수 전 상태는 미검증이다. 2단계는 구조도 판정 뒤 진행한다.


## 2026-11-03 CTO 인계 — PC 컴파일만, 촬영은 Mac

15:39 PC 비정상 종료 뒤 CTO 지시로 소스·데이터·원화·자기 .meta만 경로 지정 커밋·push한다. PC에서는 Unity Editor/Player/빌드/촬영을 실행하지 않는다. 관련 문서와 CHANGELOG_SYNC도 함께 반영한다. Library/Temp/Generated 및 기존 타 경로 .meta/ProjectSettings 잡음은 제외한다.

Mac 빌더는 Exoduser.A2RBuilder.Build이며 OSXEditor에서는 EXODUSER-A2R.app을 만든다. 같은 패키지 촬영은 A/B8컷, 고목 뒤3개 고정 위치, 4096 정사영 원본+좌표 JSON이다. 가림 위치가 막혔으면 인접 보행점으로 보정하고 실제 좌표를 기록한다. 3컷 누락/해상도 불일치/구조도 누락은 PASS가 아니다. 필드보스가 아직 생성되지 않았으면 Core의 정적 FieldBossSites 정의를 촬영 시 1회 읽어 실제4좌표를 기록한다. Core를 변경하거나 강제 소환하지 않는다.

검증 경계: C# 컴파일과 별도로 새 후보의 셰이더·Mac 빌드·실제 화면·접지·투명화·성능은 미검증이다. 가림은 영웅·캠프(화면 안일 때) 포함 최대8개 타깃을 Renderer마다 선별한다. 밀집 전투 전체 적/탄막 커버는 후속 검수 대상이다. A/B8컷은 14프레임 뒤, 고목3컷은 24프레임 뒤 각각 추가.25초 대기해 정적 알파를 촬영한다. 자연 도보/연속0.2초 동작의 증거는 아니다.

## Mac 8dce239 FAIL 후 CTO 수정

근거: `origin/qa/mac-captures-20261103@1e7b556d9`의 `qa/map-a2r/8dce239/REPORT.md`와 PNG6장을 직접 열었다. 기존 후보는 빌드 errors0이나 촬영 errors2/exit3 및 시각 FAIL이다. added31/total34, floating0, 구조도28점 PASS는 **이전 후보의 결과**이며 새 후보 검증으로 재사용하지 않는다.

| CTO 결함 | 수정과 재검수 조건 |
|---|---|
| texture property Error2 | `mainTexture` 접근 제거. `HasProperty(_BaseMap/_MainTex)`로 선택한 속성만 GetTexture/Scale/Offset. `GroundSkillReceiver` 재질을 포함한 Renderer는 원본 그대로 두고 복제·치환하지 않는다. Mac player.log Error0/exit0 재확인 |
| 각진 반투명 띠 | world-space 픽셀 깊이 smoothstep 제거, 양쪽 점을 같은 GPU 행렬로 투영한 원형 거리만 사용. 타깃당 범위와 0.2초 fade는 Renderer MPB, fade-out 중 마지막 원 유지. 1x/3x 원 밖 불투명·원 안.30/부드러운 가장자리 재확인 |
| 전체 청록 | 중립 달빛 세기 감소, 따뜻한 WB/흙색 환경광, 카드 기본광도 RGB(.08,.075,.065)로 중립화. 캠프 주광6.2·보조광3.6/횃불7. 웹 원화 PNG·바닥 텍스처와 색상 자체는 변경0 |
| 다리 밝음·흰 타원·물 안 보임 | 노출1.30→.80, 안개 밀도.032→.008, 빛줄기 alpha.042→.010, DOF.6→.25. 수면 직접 정반사만 끄고 거칠게. 원본 대비 bridge ROI 평균은1920 68.49/3840 51.12가 비교 기준이며 새 실측은 Mac 대기 |
| 캠프 3D 나무 중첩 | 기존 나무 등록 대상 유지, 캠프 원화 중심도 제한된 원형 가림 타깃으로 추가. 나무 전체 투명화·위치 변경·새 에셋 없음. tent/nest 읽힘 재검수 |

세이브 namespace/root 바인딩 로그 부족은 Mac 이전 REPORT의 미검증으로 유지한다. 이 작업에서 공용 세이브 코드·장판 수신 셰이더는 수정하지 않는다.

MAP PRODUCTION REPORT: STAGE=Mac FAIL 원인 수정 / MASTER·OUTER MASS·LARGE·MEDIUM·PLAYABLE·LANDMARK=기존 A2Field LOCK / GROUND=기존 원화·접지 유지 / CAMERA QA=이전 A/B8·가림3·구조도 좌표 검수 인수, 새 촬영 대기 / TECH QA=PC C#만, Unity 실행0 / FILES=A2R 표현·기존 수면 옵션·관련 docs만 / GIT=정확한 자기 경로 commit·비강제 push / VISUAL VERDICT: RETOUCH (새 GPU 결과 미검증) / NEXT=Mac 같은 인자로 재촬영하여 오류0·원형 경계·흙색/불빛·다리 밝기·캠프 중첩 확인.

MAP PRODUCTION REPORT: STAGE=기존 에셋 이식 코드 인계 / MASTER PLAN·OUTER MASS·GROUND=기존 A2Field LOCK / PLAYABLE=기존 Core 유지 / CAMERA=원근 유지, 구조도만 별도 정사영 / TECH QA=PC C# 컴파일 결과는 MAC_RUN.md / VISUAL VERDICT=미검증 / NEXT=Mac 동일 패키지 촬영 후 맵 총괄 판정. 실행 인자·실제 push SHA는 I:/EXODUSER-Storage/map25d/a2redesign/MAC_RUN.md에 기록한다.
