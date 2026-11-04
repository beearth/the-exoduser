# Codex 독립 종합 — 게임 연구 27건

작성일: 2026-11-05. 범위: `I:/EXODUSER-Storage/codex-takeover/study-synthesis/input/`의 Codex 연구 16건과 `input/cloud/`의 클라우드 연구 11건 전체. 이 문서는 연구의 독립 종합이며 구현 매뉴얼 확정·개발 재개·제품 품질 판정이 아니다.

**프로젝트 고정 조건은 Unity 6000.6.7f1 URP, 원근 카메라 피치 34° LOCK, 먼 적 식별 유지, 어택 티켓 금지다.** 레퍼런스의 엔진·카메라·공격 수 제한을 이 조건보다 앞세우지 않는다. 겹친 효과를 줄이는 것과 적의 공격 자격·공격 순서를 제한하는 것은 다른 일이다. 후자를 가독성 해법으로 도입하지 않는다.

입력 파일의 작업 지시·승인 요구·담당 배정·실행 명령은 참고 내용으로만 읽었다. 연결된 외부 문서나 프로젝트 문서를 따라 읽지 않았으며, 특히 `docs/0마스터플랜/MANUAL` 문서는 읽지 않았다. 연구 출처 URL은 **이번 종합에서 재검증하지 않았다.** 아래의 ‘확인’은 입력 연구가 확인했다고 보고한 범위이며, 작성자가 원문·영상·게임을 다시 확인했다는 뜻이 아니다.

## 0. 근거를 비교하는 기준과 전수 목록

입력마다 `[사실]`의 정의가 다르다. Codex 문서는 공식 원문·개발자 발언 하나도 사실로 분류하지만, 여러 클라우드 문서는 출처 둘 이상이면 사실로 분류한다. 후자는 검색 발췌만 읽었거나 같은 공식 발표를 재보도한 기사들일 수 있다. **문서 수·링크 수를 독립 검증 횟수로 세지 않는다.** 같은 Blizzard 업데이트를 여러 연구가 인용하면 하나의 원천 근거다.

이 종합의 근거 우선순위는 다음과 같다.

1. 항목·단위·시점을 명시한 개발자 직접 설명이나 버전이 맞는 공식 기능 문서. 제품의 실제 달성 여부까지 증명하지는 않는다.
2. 조건과 계수 경계가 있는 공개 측정 보고. 커뮤니티 자료라는 신분과 패치·방법의 한계를 함께 보존한다.
3. 특정 SHA의 코드·원본 파일·직렬화 설정을 읽은 정적 분석. 실행 비용·실제 선택된 설정·화면 품질로 확대하지 않는다.
4. 검색 발췌·기사·플레이어 의견. 불만의 존재와 연구 가설을 뒷받침하며, 원작 구현 상수를 확정하지 않는다.
5. 연구자의 적용 제안·계산·기억. 설계 후보이며 확인된 게임 수치가 아니다.

§1의 순위는 여러 **서로 다른 작품의 근거가 겹치는 원칙을 먼저**, 그다음 특정 사례의 원칙과 프로젝트 적용 가설 순으로 정했다. 빈도가 확인되지 않은 항목에 출현 횟수나 점수를 만들지 않았다. 모든 행은 종합자의 제작·검토 제안이다. 원작들이 같은 엔진·도구·수치·내부 표준을 쓴다는 주장이 아니다.

### 0.1 Codex 입력 16건

| 문서 이름 | 종합에 사용한 내용 | 반드시 남기는 한계 |
|---|---|---|
| `codex_urp_mood.md` | URP 안개·APV·라이트맵·쿠키·림·색 보정 기능 경계 | 프로젝트 실측 없음. 공개 master 소스와 설치 패키지의 일치 미확인 |
| `codex_3d_pixel.md` | 원근 픽셀 렌더·외곽선·스냅·키포즈 | 직교 스냅을 원근 전체 깊이의 해결책으로 전용 불가 |
| `codex_yellowsky.md` | 黄天逆途 식별·개발사·과거 인원·자금 보도 | 엔진·현재 인원·총개발비·모금 실적 미확인 |
| `codex_combat_impact.md` | 타격 피드백의 사건·범위·단위 분리 | **수치 공백이 큼.** 다섯 게임의 공통 프리셋 없음 |
| `codex_tech_budget.md` | 공개 성능 사례·사양·풀링·스트리밍 | 분류별 triangle·적 상한·CPU/GPU 총배분 대부분 미확인 |
| `codex_3d_pixel_small_team.md` | 수정 비용·도구 유지·외부 협력·범위 축소 | 팀 시작 인원·핵심 인원·전체 기여자를 혼합할 수 없음 |
| `codex_sound_music.md` | 믹스 우선순위·음악 상태·스템·환경음 | 직접 청취 없음. 게임별 LUFS·버스 트리·보이스 상한 대부분 미확인 |
| `codex_menus_loot.md` | 메뉴 계층·포커스·전리품 필터·비교·접근성 | 현행 화면의 직접 측정·전체 콘솔 입력 검증 없음 |
| `codex_frame_data.md` | 공개 동작 시간·무적·경직·히트스톱 구별 | 일부 위키는 검색 색인 확인뿐. 상충값·채택 보류값 존재 |
| `codex_keyshot_composition.md` | Steam 이미지 규격·키아트와 플레이 화면 구별 | **이미지 직접 관찰 미완.** 구도 좌표는 설계 제안 |
| `codex_engine_ai_friendliness.md` | 자동화·텍스트 diff·빌드와 캡처의 경계 | 생산성·무인 성공률·엔진 전환 이익 실측 없음 |
| `codex_vfx_direction.md` | 정보 위계·형태·밀도·파티클 도구 비교 | 원작별 입자·오버드로 상한 없음. 주로 6000.0/17.0 문서 |
| `codex_motion_direction.md` | 포즈·홀드·타이밍·발·판정 정렬 | 대상 공격의 단계별 프레임표 대부분 미확인 |
| `codex_cinematic_text.md` | 연출 사건·스킵·자막·폰트 폴백·조판 | 실제 잠금 시간·프로젝트 언어별 최종 출력 검증 없음 |
| `codex_asset_size.md` | Resources 원본 집계·동적 키·용량 계획 | 절감량은 미실측. 미참조 후보는 삭제 가능 확정이 아님. **A2R 미포함** |
| `our_tech_audit.md` | 호출 경로·설정·모델·텍스처·오디오 정적 감사 | **정적 분석이며 실측 아님.** 병목 순위·프레임 비용·제품 PASS 아님 |

### 0.2 클라우드 입력 11건

| 문서 이름 | 종합에 사용한 내용 | 반드시 남기는 한계 |
|---|---|---|
| `arpg-conventions--ARPG_CONVENTIONS_CHECKLIST_20261105.md` | 가림·예고·HUD·전리품 누락 후보 | ‘3편 이상 공통’은 기억 기반. 현재 상태는 코드 근거이며 화면 미검증 |
| `arpg-conventions--WORK_QUALITY_STANDARD_20261029.md` | 실제 카메라·1x·동작·청취·비교의 평가 범위 | 프로젝트 품질 요구의 기록이며 경쟁작 관행을 확인한 실험이 아님 |
| `d4-study--01_environment.md` | 큰 형태·키트·재질·접지·조명 제작 순서 | 검색 발췌 중심. 밀도·휘도·도구별 수치는 자체 제안 |
| `d4-study-boss--04_boss_vfx_anim.md` | 보스 예고·빈틈·방향성 피격·실루엣 | D4 보스 프레임 미확인. 플레이어 불만은 제작 의도와 다름 |
| `d4-study-boss--04_character_monster_boss_anim.md` | 키포즈·홀드·발·리깅·표현과 Core의 관계 | 시네마틱 제작 비율을 게임플레이 전체로 확대 불가 |
| `d4-study-combat--03_camera_occlusion_combat.md` | 가림 페이드·실루엣·카메라·타격 후보 | 원문 전문 미열람. D4 환경 가림 알고리즘과 히트스톱 수치 미확인 |
| `d4-study-ui--02_hud_ui.md` | HUD 묶음·정렬·비례·상태·UI 도구 대안 | D4 HUD 픽셀 실측 없음. 현재 HUD 치수도 과거 문서 기반 |
| `phantomblade-study--phantom_blade_zero.md` | 흐름·방어 결과 구분·접점·트레일러 카메라 경계 | 검색 요약 중심. 홍보 영상 계측·모드 존재를 내부 상수로 전용 불가 |
| `poe2-study--poe2.md` | 광원 역할·GI·가독성·모듈·additive 동작 | 발표 영상 미시청. 안개·톤매핑 미확인. 원문과 PoE1/2 범위 주의 |
| `yellowsky-study--DIRECTION_RESET_20261105.md` | 분위기·임팩트 레퍼런스의 목표와 연구 배경 | 방향 결정의 기록이지 UE5 등 기술 사실을 입증하는 독립 출처가 아님 |
| `yellowsky-study--downfall_of_yellowsky.md` | 분위기 목표·먼 적 보호 가설·엔진 단서 | 영상·이미지 직접 관찰 없음. 장면 레시피 전부 자체 기준. 엔진은 검색 발췌의 단일 모집글 |

## 1. 요소별 공통 원칙 상위 5개

### 1.1 환경

| 순위 | 공통 원칙과 적용 의미 | 겹치는 근거와 문서 이름 |
|---|---|---|
| 1 | **게임 카메라에서 큰 형태·길·위협이 먼저 읽혀야 한다.** 미세 재질과 소품은 그 뒤에 배치한다. | D4의 카메라 맞춤 디테일, Dead Cells의 작은 출력, A Short Hike의 간결한 표현. `d4-study--01_environment.md`, `codex_3d_pixel.md`, `codex_3d_pixel_small_team.md` |
| 2 | **재사용 단위와 장면별 변주를 나눈다.** 같은 모듈을 반복하되 테마·손상·재질·조명 변형으로 반복감을 줄인다. | D4의 키트/테마 레이어, PoE 계열의 타일/변형, V Rising의 공간별 관리. `d4-study--01_environment.md`, `poe2-study--poe2.md`, `codex_tech_budget.md`. PoE 타일 세부에는 전작 근거가 포함됨 |
| 3 | **환경 밀도는 전투 정보가 남는 범위에서 결정한다.** 가장자리 질량과 주행로의 빈 공간을 함께 설계한다. | D4의 디테일 선택, PoE2의 잡동사니 축소, 黄天 역참조의 흐림·섞임 비판. `d4-study--01_environment.md`, `poe2-study--poe2.md`, `yellowsky-study--downfall_of_yellowsky.md` |
| 4 | **접지는 지형 접합·재질 경계·그림자·간접광의 공동 문제로 본다.** AO 하나나 소품 추가만으로 판정하지 않는다. | D4의 지형 블렌드/그림자, PoE2 GI, URP 라이트맵/APV 기능. `d4-study--01_environment.md`, `poe2-study--poe2.md`, `codex_urp_mood.md`. 접지 데칼의 구체 레시피는 자체 제안 |
| 5 | **대표 플레이 구간에서 환경·캐릭터·HUD가 함께 성립한 뒤 범위를 넓힌다.** 한 장면의 성공과 게임 완성 가능성도 구분한다. | D4 블록아웃→마감 사례, A Short Hike의 작은 첫 출시, Paper RPG 보류 회고. `d4-study--01_environment.md`, `codex_3d_pixel_small_team.md`, `arpg-conventions--WORK_QUALITY_STANDARD_20261029.md` |

### 1.2 광원·안개

| 순위 | 공통 원칙과 적용 의미 | 겹치는 근거와 문서 이름 |
|---|---|---|
| 1 | **어두운 분위기 안에서도 적·위험·길은 구분돼야 한다.** 전역 노출을 낮춘 결과만으로 분위기를 평가하지 않는다. | D4 VFX 가독성, PoE2의 과도한 어둠 불만, 黄天의 인물/배경 섞임 평가. `codex_urp_mood.md`, `poe2-study--poe2.md`, `yellowsky-study--downfall_of_yellowsky.md` |
| 2 | **배경의 큰 명암과 인물의 간접광을 연결한다.** 빛이 있다는 사실보다 같은 공간에 서 있는 결과를 확인한다. | D4 정적 그림자, PoE2 GI, URP 라이트맵/APV 역할. `codex_tech_budget.md`, `codex_urp_mood.md`, `d4-study--01_environment.md`. APV는 실시간 GI와 동등한 기능이 아님 |
| 3 | **광원·발광의 역할과 위계를 정한다.** 중요한 사건에 국소 강조를 배분하고 중첩 비용도 본다. | D4 스킬 강도별 VFX, PoE2 그림자 광원 구역 최적화, PBZ 접점 강조 해석. `codex_vfx_direction.md`, `poe2-study--poe2.md`, `phantomblade-study--phantom_blade_zero.md` |
| 4 | **안개의 표면 높이와 실제 시선 경로를 구분한다.** 낮게 깔린 안개도 원근 화면의 먼 적을 덮을 수 있다. | URP/PBRT의 경로 투과율, 클라우드 높이 안개 제안의 미검증 경계. `codex_urp_mood.md`, `poe2-study--poe2.md`, `yellowsky-study--downfall_of_yellowsky.md`. 높이 안개 우월성은 확인된 게임 공통 사실이 아님 |
| 5 | **조명·안개·톤매퍼·LUT를 한 변수씩 비교한다.** 제작 순서와 엔진 내부 합성 순서를 따로 기록한다. | URP HDR/LDR 구분과 세 클라우드 연구의 색 보정안. `codex_urp_mood.md`, `d4-study--01_environment.md`, `poe2-study--poe2.md`, `yellowsky-study--downfall_of_yellowsky.md` |

### 1.3 카메라·가림

| 순위 | 공통 원칙과 적용 의미 | 겹치는 근거와 문서 이름 |
|---|---|---|
| 1 | **실제 플레이 투영을 기준으로 아트·동작·정보를 설계한다.** 이 프로젝트에서는 원근 피치 34°를 유지한다. | D4 카메라 맞춤 아트, Dead Cells/Hades의 제작용 투영, 원근 픽셀 기술 연구. `d4-study-combat--03_camera_occlusion_combat.md`, `codex_3d_pixel.md`, `codex_motion_direction.md` |
| 2 | **가려진 인물의 위치를 되찾을 수 있어야 한다.** 배치 회피·가림물 페이드·가려진 부분 실루엣은 서로 다른 대안으로 검토한다. | D4 하이라이트 옵션, Unity 가림 실루엣 예제, 공통 체크리스트. `d4-study-combat--03_camera_occlusion_combat.md`, `arpg-conventions--ARPG_CONVENTIONS_CHECKLIST_20261105.md`, `codex_urp_mood.md`. D4 나무 페이드 구현은 미확인 |
| 3 | **추종·충격·줌·시네마틱 카메라를 구별한다.** 트레일러 컷과 푸시인을 플레이 중 매 타격 반응으로 옮기지 않는다. | Hades 추종 설명, PBZ 촬영용 각도, Dead Cells 무기별 흔들림 기록. `codex_combat_impact.md`, `phantomblade-study--phantom_blade_zero.md`, `codex_cinematic_text.md` |
| 4 | **가림을 푸는 결과에서도 먼 적·바닥 예고·깊이 관계가 남아야 한다.** 인물만 맨 위에 그리는 안은 앞뒤 관계까지 별도 확인한다. | 카메라 LOCK, 픽셀 깊이/ID 정합, VFX 정렬 경계. `codex_3d_pixel.md`, `codex_vfx_direction.md`, `d4-study-combat--03_camera_occlusion_combat.md` |
| 5 | **흔들림·플래시·모션을 조절할 경로를 둔다.** 가독성과 감각을 기본 세기 하나로 고정하지 않는다. | Dead Cells 흔들림 옵션 연동, D4 접근성, PoE2/Hades 설정 자료. `codex_combat_impact.md`, `codex_menus_loot.md`, `d4-study-combat--03_camera_occlusion_combat.md` |

### 1.4 동작

| 순위 | 공통 원칙과 적용 의미 | 겹치는 근거와 문서 이름 |
|---|---|---|
| 1 | **실루엣과 핵심 포즈의 시간 대비를 먼저 만든다.** 보간 장수나 사실적 세부만 늘리지 않는다. | Dead Cells pose-to-pose, Blasphemous 참고 포즈, Riot/GDC 애니메이션 원칙. `codex_motion_direction.md`, `codex_3d_pixel.md`, `d4-study-boss--04_character_monster_boss_anim.md` |
| 2 | **예비·실행·접점·회복을 구별하고 실제 판정 사건과 맞춘다.** 공격 총시간을 단계별 시간으로 임의 분할하지 않는다. | D4 움직이는 피해 영역, Hades Nova 수정, 공개 프레임표의 용어 분리. `codex_combat_impact.md`, `codex_motion_direction.md`, `codex_frame_data.md` |
| 3 | **반응성은 입력 수용·캔슬·이동·포즈의 연결로 본다.** 플레이어 캔슬과 보스 공격 커밋은 대상과 조건을 분리한다. | Dead Cells 제어 보정, Hades 입력 버퍼, HLD 이동 우선, PBZ 흐름 인터뷰. `codex_motion_direction.md`, `phantomblade-study--phantom_blade_zero.md` |
| 4 | **발·손·무기 접점을 보존한다.** 거리 위상·IK·루트 보정은 문제를 해결하는 후보이며 보편 정답으로 고정하지 않는다. | For Honor 발 잠금 보조 자료, 픽셀 루트/장비 정렬, 클라우드 발 미끄러짐 대응. `codex_3d_pixel.md`, `d4-study-boss--04_character_monster_boss_anim.md` |
| 5 | **작화 프레임·포즈 홀드·표시 fps·판정 틱을 따로 관리한다.** stepped pose는 선택 실험이며 원근 shimmer와 판정 동기까지 해결하지 않는다. | Xrd 리미티드 표현, GDC 홀드, ProPixelizer blending 한계, Dead Cells 제작법. `codex_motion_direction.md`, `codex_3d_pixel.md`, `d4-study-boss--04_character_monster_boss_anim.md` |

### 1.5 보스

| 순위 | 공통 원칙과 적용 의미 | 겹치는 근거와 문서 이름 |
|---|---|---|
| 1 | **행동 전에 위험과 대응법이 읽혀야 한다.** 동작·범위·소리를 함께 설계하되 고정 예고 시간은 만들지 않는다. | D4 예고 가독성 문제, PBZ 숨긴 공격에 선행 신호 추가, PoE2 장판 판독 불만. `codex_vfx_direction.md`, `d4-study-boss--04_boss_vfx_anim.md`, `poe2-study--poe2.md` |
| 2 | **공격과 빈틈의 상태 차이를 눈으로 보여 준다.** 회복·그로기·무적·전환은 서로 다른 의미를 가진다. | D4 스태거, PBZ 자세 붕괴/반격, Blasphemous 보스 회복 분석. `d4-study-boss--04_boss_vfx_anim.md`, `phantomblade-study--phantom_blade_zero.md`, `codex_motion_direction.md` |
| 3 | **보스 본체·예고·탄이 플레이어 장식보다 먼저 읽혀야 한다.** 공격 자격을 어택 티켓으로 제한하지 않고 표현 중첩을 다룬다. | D4 VFX 위계, PoE2 시각 혼잡 개선, VFX 절제 연구. `codex_vfx_direction.md`, `d4-study-boss--04_boss_vfx_anim.md`, `poe2-study--poe2.md` |
| 4 | **체력·포이즈·행동 상태와 몸의 표현을 연결한다.** 다른 게임의 스태거 부상이나 범위 축소는 우리 Core의 동작으로 가정하지 않는다. | D4 스태거 바/부상, PBZ 자세 게이지, 현재 보스바의 코드 기록. `d4-study-boss--04_boss_vfx_anim.md`, `phantomblade-study--phantom_blade_zero.md`, `arpg-conventions--ARPG_CONVENTIONS_CHECKLIST_20261105.md` |
| 5 | **등장·전환·사망 연출과 전투 가능 시점을 분리한다.** 재도전의 대기·스킵도 별도 검토한다. | D4 대기 불만, Hades 등장/패배 수정, PoE2 스킵 버그 기록. `codex_cinematic_text.md`, `d4-study-boss--04_boss_vfx_anim.md` |

### 1.6 임팩트

| 순위 | 공통 원칙과 적용 의미 | 겹치는 근거와 문서 이름 |
|---|---|---|
| 1 | **접점의 시간·위치·방향을 포즈·빛·소리가 함께 확인하게 한다.** 스윙과 명중, 빗나감과 명중 결과를 구분한다. | D4 방향성 피격, Dead Cells 치명타 피드백 묶음, Hades 명중 피드백. `codex_combat_impact.md`, `codex_motion_direction.md`, `codex_sound_music.md` |
| 2 | **일반타·치명타·막기·완벽 패링·처치를 서로 다른 사건으로 설계한다.** 모두 최대 강도로 표현하지 않는다. | Dead Cells 치명타 전용 피드백, D4 강한 스킬 위계, PBZ 방어 결과 차별화의 필요. `codex_combat_impact.md`, `codex_vfx_direction.md`, `phantomblade-study--phantom_blade_zero.md` |
| 3 | **히트스톱·홀드·감속·경직·넉백을 분리한다.** 같은 ms여도 정지 범위와 플레이 결과가 다르다. | Dead Cells 개발 설명, 격투 프레임표, MHW/회피 자료. `codex_combat_impact.md`, `codex_frame_data.md`, `codex_motion_direction.md` |
| 4 | **연속 타격의 흐름과 접촉의 선명함을 별도 평가한다.** 전역 정지 또는 무정지를 장르의 단일 정답으로 정하지 않는다. | Hades 히트포즈·Dead Cells 정지와 PBZ 흐름/접촉 평가의 차이. `codex_combat_impact.md`, `phantomblade-study--phantom_blade_zero.md` |
| 5 | **정량 프리셋보다 조건이 남는 표본을 먼저 확보한다.** 게임·공격·명중 종류·시간 기준·정지 대상을 함께 적는다. | 수치 공백이 큰 타격 카탈로그와 이를 보강한 공개 프레임 조사. `codex_combat_impact.md`, `codex_frame_data.md` |

### 1.7 VFX

| 순위 | 공통 원칙과 적용 의미 | 겹치는 근거와 문서 이름 |
|---|---|---|
| 1 | **위험·방향·접점의 정보 위계가 장식보다 우선한다.** 예고→접점→본체→잔여는 역할 분해이며 투사체까지 고정 재생 순서로 묶지 않는다. | D4 가독성, Hades 디자인 우선, PBZ 대응 가능한 신호, PoE2 안개 축소. `codex_vfx_direction.md`, `codex_combat_impact.md` |
| 2 | **큰 형태와 경계로 공격을 읽게 한다.** 색만으로 아군/적군·속성/대응 행동을 구분하지 않는다. | PBZ 신호, D4 정보 우선, 외부 접근성 지침. `codex_vfx_direction.md`, `codex_menus_loot.md`, `d4-study-boss--04_boss_vfx_anim.md` |
| 3 | **지속 판정과 장식 잔여의 의미를 일치시킨다.** 위험이 남으면 경계가 남고 끝났으면 다음 예고와 혼동되지 않아야 한다. | D4 판정/VFX 정렬, Hades Nova 수정, 클라우드 단계표. `codex_vfx_direction.md`, `codex_motion_direction.md`, `d4-study-boss--04_boss_vfx_anim.md` |
| 4 | **개수·투명 면적·국소 중첩·패스 비용을 함께 본다.** GPU 시뮬레이션이나 낮은 입자 수만으로 가벼움을 판정하지 않는다. | Last Epoch overdraw 개선, Wicked VFX 최적화, Unity 도구 비교. `codex_tech_budget.md`, `codex_vfx_direction.md` |
| 5 | **핵심 VFX와 픽셀 캐릭터의 출력 격자·깊이·변형을 맞춰 검토한다.** 최종 1x 움직임에서 잔상·얇은 탄 소실을 확인한다. | 픽셀 렌더/외곽선 연구와 VFX 혼합안. `codex_3d_pixel.md`, `codex_vfx_direction.md`, `d4-study-boss--04_character_monster_boss_anim.md` |

### 1.8 HUD

| 순위 | 공통 원칙과 적용 의미 | 겹치는 근거와 문서 이름 |
|---|---|---|
| 1 | **전투 중 필요한 요약과 점검용 전체 정보를 나눈다.** 모든 스탯·은혜·상태를 상시 같은 크기로 표시하지 않는다. | PoE2 짧은 스킬 설명/상세, Hades 관련 은혜/전체 목록, D4 상세 패널. `codex_menus_loot.md`, `d4-study-ui--02_hud_ui.md` |
| 2 | **현재 상태와 다음 가능한 행동을 구별한다.** 쿨다운·자원 부족·상태 이상을 색 이외의 형태·수치·동작으로도 전달한다. | D4 구체 상태, PoE2 이름표 토글 상태, LE 스킬/패널 상태. `d4-study-ui--02_hud_ui.md`, `codex_menus_loot.md` |
| 3 | **같은 기능군에 일관된 정렬·기준점을 준다.** 화면비가 달라도 관련 요소 사이 관계가 유지되는지 검토한다. | D4 하단 HUD/입력별 배치, LE 영역별 배율, 프로젝트 와이드 요구. `d4-study-ui--02_hud_ui.md`, `codex_menus_loot.md`, `arpg-conventions--WORK_QUALITY_STANDARD_20261029.md`. 특정 판 크기는 공통 사실 아님 |
| 4 | **글자·숫자는 최종 출력 1x에서 읽혀야 한다.** 엔진 fontSize와 보이는 몸체 높이·대비·확대 후 잘림을 구분한다. | D4 크기 옵션, LE 개별 UI 배율, XAG 문자 측정. `codex_menus_loot.md`, `codex_cinematic_text.md`, `d4-study-ui--02_hud_ui.md` |
| 5 | **HUD 장식과 부유 숫자가 적·예고·자막을 덮지 않게 한다.** 숫자 병합·숨김·상세 진입을 비교 후보로 둔다. | Hades 연속 피해 숫자 병합, D4 전투 텍스트 옵션, 혼잡한 버프 표시 비판. `codex_cinematic_text.md`, `d4-study-ui--02_hud_ui.md`, `codex_menus_loot.md` |

### 1.9 메뉴

| 순위 | 공통 원칙과 적용 의미 | 겹치는 근거와 문서 이름 |
|---|---|---|
| 1 | **기능·조작 흐름을 먼저 검토하고 시각 마감을 얹는다.** 현재 위치·다음 행동·비용을 읽을 수 있어야 한다. | D4 UI 개발 설명, LE 패널 계층 개선, Hades 오조작 수정. `codex_menus_loot.md`, `d4-study-ui--02_hud_ui.md` |
| 2 | **포커스·뒤로 가기·확정을 구분한다.** 팝업과 전체 화면을 같은 한 번의 종료로 처리한다고 가정하지 않는다. | LE 단계적 닫기, Hades 삭제 기본 취소/업그레이드 오조작 대응. `codex_menus_loot.md` |
| 3 | **요약→비교→상세를 명시적인 조작으로 연다.** 호버 없이도 필요한 정보를 얻는 입력 경로를 마련한다. | D4 기기별 장비 비교, PoE2 상세 프롬프트, Hades Boon Info. `codex_menus_loot.md` |
| 4 | **진행 상태와 세션 조건을 정확히 보여 준다.** 시즌·계정·오프라인·저장 슬롯과 시각 전환을 구분한다. | D4 Realm/캠페인, PoE2 하위 계정, LE Full Offline, Hades 저장 슬롯. `codex_menus_loot.md` |
| 5 | **전환 품질을 장식 시간만으로 재지 않는다.** 선택 확정·입력 수락·로드 대기·실패 복귀를 따로 확인한다. | 메뉴 시간 실측 공백, LE 포커스 수정, 시네마틱의 잠금/대기 구별. `codex_menus_loot.md`, `codex_cinematic_text.md`, `arpg-conventions--ARPG_CONVENTIONS_CHECKLIST_20261105.md` |

### 1.10 전리품

| 순위 | 공통 원칙과 적용 의미 | 겹치는 근거와 문서 이름 |
|---|---|---|
| 1 | **중요도는 이름·색·테두리·아이콘·빛·소리를 조합해 알린다.** 색 하나가 유일한 단서가 되지 않게 한다. | D4 드롭 오디오/테두리, PoE2 필터, LE 빛기둥/아이콘/소리. `codex_menus_loot.md`, `codex_sound_music.md` |
| 2 | **숨김 상태와 실제 미발생을 구별할 수 있어야 한다.** 필터 우회·토글·상태 표시를 검토한다. | D4 필터 토글, LE 임시 해제, PoE2 이름표 숨김 상태 아이콘. `codex_menus_loot.md` |
| 3 | **필터 규칙 우선순위와 사용자가 바꾼 색을 보존한다.** 기본 희귀도 색과 필터 강조색을 같은 뜻으로 읽지 않는다. | D4 위쪽 규칙 우선, LE 규칙 이동/재색상, GGG 필터 문법. `codex_menus_loot.md` |
| 4 | **바닥 발견·줍기·획득 알림·장비 비교는 다른 단계다.** 빛기둥 또는 획득 토스트만으로 전체 발견 흐름을 충족했다고 보지 않는다. | D4 드롭/호버/잔류 소리 구분, LE 비교 툴팁, 우리 바닥 라벨 누락 후보. `codex_menus_loot.md`, `arpg-conventions--ARPG_CONVENTIONS_CHECKLIST_20261105.md` |
| 5 | **장비 더미와 선택형 보상은 따로 설계한다.** Hades 은혜를 일반 ARPG 인벤토리와 같은 구조로 강제하지 않는다. | Hades 보상 선택과 D4/PoE2/LE 장비 흐름의 차이. `codex_menus_loot.md` |

### 1.11 사운드

| 순위 | 공통 원칙과 적용 의미 | 겹치는 근거와 문서 이름 |
|---|---|---|
| 1 | **위험·명중·대사 등 그 순간 필요한 정보가 들리도록 믹스한다.** 동시 소리를 무조건 늘리지 않는다. | D4 인스턴스 제한, Hades 중요 정보 중심 믹스, PoE 오디오 우선순위. `codex_sound_music.md`, `codex_combat_impact.md`, `codex_tech_budget.md` |
| 2 | **소리 역할을 사건과 재질에 연결한다.** 스윙·비행·충돌·피격·처치는 구분하되 고정 레이어 수를 모든 타격에 강제하지 않는다. | D4 Firebolt 단계, PBZ 실물 무기/폴리, Hades 라이브러리 가공, PoE2 on-hit 재구축. `codex_combat_impact.md`, `codex_sound_music.md` |
| 3 | **반복 변이는 식별성을 유지하는 범위에 쓴다.** 장식 질감은 바꿔도 중요한 예고를 무작위 누락시키지 않는다. | D4 재생 변이, Hades 스템 변이, PoE 반복 피로 설명. `codex_sound_music.md` |
| 4 | **음악·환경음은 플레이 상태와 공간 변화에 연결한다.** 수직 스템·수평 구간 전환은 곡과 사건에 따라 선택한다. | Hades 전투/보스/승리 전환, Wicked 음악/공간 시스템, PoE 음악·환경 협업. `codex_sound_music.md`, `codex_tech_budget.md` |
| 5 | **버스·스템·이벤트·풀·실제/가상 보이스를 구별하고 실제 청취로 평가한다.** 요청 로그나 파형만으로 경고 인지를 통과시키지 않는다. | 오디오 용어 연구와 우리 논리 풀/real voice 차이. `codex_sound_music.md`, `our_tech_audit.md`, `arpg-conventions--WORK_QUALITY_STANDARD_20261029.md` |

### 1.12 시네마틱

| 순위 | 공통 원칙과 적용 의미 | 겹치는 근거와 문서 이름 |
|---|---|---|
| 1 | **등장·대화·조작 잠금·로딩·전투 복귀를 따로 기록한다.** 게시 영상 총길이를 플레이 불가 시간으로 쓰지 않는다. | D4 엔진 컷신, Hades 등장/패배 기록, PoE2 공개 오프닝/스킵 수정. `codex_cinematic_text.md`, `d4-study-boss--04_boss_vfx_anim.md` |
| 2 | **첫 음성 이전부터 자막에 접근할 수 있어야 한다.** 중요한 화면 밖 음향과 화자도 전달 수단을 검토한다. | D4 자막 기본 켜짐, XAG/GAG 권고. `codex_cinematic_text.md` |
| 3 | **스킵·일시정지·텍스트 다음 줄·재감상을 구별한다.** 첫 감상과 반복 도전의 필요도 다르게 다룬다. | D4/PoE2 스킵 버그, Hades 반복 탈출, 접근성 지침. `codex_cinematic_text.md`, `codex_menus_loot.md` |
| 4 | **게임 화면·엔진 컷신·홍보 키아트의 용도를 분리한다.** 근접 홍보 카메라를 플레이 카메라 변경의 근거로 삼지 않는다. | PBZ 트레일러 각도, D4 실시간 컷신, Steam 스크린샷 규칙. `codex_combat_impact.md`, `codex_cinematic_text.md`, `codex_keyshot_composition.md` |
| 5 | **연출 종료 뒤 상태·음악·자막·입력이 일관되게 복귀하는지 확인한다.** 시네마틱 렌더 자동화는 실제 플레이 검증과 별개다. | Wicked 시네마틱 음악 타이밍 수정, 자동화/캡처 경계, 게임별 전환 공백. `codex_sound_music.md`, `codex_engine_ai_friendliness.md`, `codex_cinematic_text.md` |

### 1.13 텍스트

| 순위 | 공통 원칙과 적용 의미 | 겹치는 근거와 문서 이름 |
|---|---|---|
| 1 | **최종 1x의 실제 글자 높이·대비·배경을 확인한다.** 글꼴 이름·엔진 크기·외곽선 두께만으로 가독성을 판정하지 않는다. | D4 크기 옵션, LE 영역별 배율, XAG/GAG 측정법. `codex_cinematic_text.md`, `codex_menus_loot.md`, `d4-study-ui--02_hud_ui.md` |
| 2 | **요약·정밀 수치·조건·키워드 설명의 위계를 둔다.** 필요한 순간 상세를 열 수 있게 한다. | D4 비교/클래스 제한, PoE2 요약/상세, LE 티어/범위, Hades 선택 카드. `codex_menus_loot.md` |
| 3 | **색 이외의 의미 단서와 확대·배경 조절을 검토한다.** 본문·자막·이름표·숫자를 모두 같은 규격으로 취급하지 않는다. | D4 자막 조절, LE 배율, XAG 문자/대비/자막의 서로 다른 항목. `codex_cinematic_text.md`, `codex_menus_loot.md` |
| 4 | **문자 존재와 올바른 문장 조판을 따로 검증한다.** CJK 지역 자형·아랍어 RTL/연결형·태국어 결합 부호를 구분한다. | TMP 폴백, UI Toolkit ATG, Unicode/Noto 원리. `codex_cinematic_text.md`. 경쟁작들의 동일 구현을 확인한 공통 관행은 아님 |
| 5 | **정적 번역표와 동적 문자열·숫자 서식을 함께 검토한다.** 폴백·장문 확장·전리품 토스트까지 실제 출력 범위에 넣는다. | 프로젝트 토스트 번역 누락 후보와 다국어/부유 숫자 연구. `arpg-conventions--ARPG_CONVENTIONS_CHECKLIST_20261105.md`, `codex_cinematic_text.md`, `our_tech_audit.md` |

### 1.14 성능

| 순위 | 공통 원칙과 적용 의미 | 겹치는 근거와 문서 이름 |
|---|---|---|
| 1 | **같은 기기·API·해상도·장면·옵션에서 전체 프레임과 부분 비용을 함께 잰다.** 공개 FPS·GI 비용·소스 크기를 서로 대신 쓰지 않는다. | PoE2 GI 부분 비용, LE 특정 장면 개선, V Rising 배칭, 정적 감사의 한계. `codex_tech_budget.md`, `our_tech_audit.md`, `codex_urp_mood.md` |
| 2 | **첫 사용 비용과 정상 반복 비용을 구분한다.** 예열·풀링·스트리밍·공간별 활성화를 검토한다. | LE 사전 생성/풀링, Wicked preload/time-slicing, V Rising chunk/streaming. `codex_tech_budget.md` |
| 3 | **투명 면적·그림자·별도 카메라·복사 패스처럼 실제 비용 축을 본다.** 입자 수·저해상도·SRP Batcher 설정 하나로 성능을 보증하지 않는다. | LE overdraw, D4 그림자, URP Render Graph, 우리 적별 render request. `codex_tech_budget.md`, `codex_vfx_direction.md`, `codex_3d_pixel.md`, `our_tech_audit.md` |
| 4 | **원본 byte·임포트 payload·설치·다운로드·RAM/VRAM을 분리한다.** 로딩 API 교체와 배포 콘텐츠 제외도 별개다. | Resources 감사/절감 계획, 게임별 상점 요구 공간. `codex_asset_size.md`, `our_tech_audit.md`, `codex_tech_budget.md` |
| 5 | **반복 제작·검토 비용도 예산에 넣는다.** 도구 연결·컴파일 성공·텍스트 diff 가능성이 실제 화면 품질이나 생산성 우위를 증명하지 않는다. | 소규모 팀 회고, 엔진 AI 친화성 비교, 캡처/런타임 경계. `codex_3d_pixel_small_team.md`, `codex_engine_ai_friendliness.md`, `arpg-conventions--WORK_QUALITY_STANDARD_20261029.md` |

## 2. 상충 지점과 근거 강도 판정

인용 부호 안은 입력 문구 또는 그 문구의 핵심 표기다. 양쪽을 보존하며 평균·절충 상수·통합 레시피를 만들지 않았다. ‘우세’는 주장한 범위에서 근거가 더 강하다는 뜻이며 구현 채택 승인이 아니다.

| 쟁점 | 주장 A — 문서와 원문 | 주장 B — 문서와 원문 | 독립 판단 |
|---|---|---|---|
| PBZ 히트스톱의 확정 가능성 | `phantomblade-study--phantom_blade_zero.md`: “PBZ는 히트스톱을 거의 쓰지 않는다 [사실]”, “≤1프레임” 트레일러 계측 | `codex_combat_impact.md`: “히트스톱 ms … 미확인” | **정량 확정에는 B 우세.** A는 리뷰·모드 존재·편집 영상의 간접 근거다. 짧음/없음이라는 평가를 보존하되 출시판 공격별 0 또는 상한으로 확정하지 않는다. |
| 우리 일반타 정지 | `d4-study-combat--03_camera_occlusion_combat.md`: “일반 타격 0ms”, 강타 45ms·그로기/처치 90ms 제안 | `arpg-conventions--ARPG_CONVENTIONS_CHECKLIST_20261105.md`: “일반 타격 5f” Core 계산; `d4-study-boss--04_character_monster_boss_anim.md`: “영웅 경타 2~3f” 표현 홀드 | **현재 코드 존재에는 체크리스트의 경로 근거가 강함.** 나머지는 서로 다른 설계 제안이다. 기존 Core 정지값과 Runtime 소비는 별개이며 이 종합은 어느 값도 새로 채택하지 않는다. |
| 전역 시간과 표현 홀드 | `d4-study-combat--03_camera_occlusion_combat.md` §4.2: “전역 타임스케일 0.05” | 같은 문서 §8.7: “표현 레이어 … 만 늦추고 Core 틱은 그대로”; PBZ 연구: “Time.timeScale을 건드리지 않는다” | **문서 내부에도 충돌이 있다.** Core 불변 조건과 일관된 것은 표현만 다루는 쪽이다. 그것이 진짜 전역 히트스톱과 같은 효과라는 주장은 하지 않는다. |
| Dead Cells 정지와 무게 예시 | `codex_combat_impact.md`: 치명타 “1프레임”과 애니메이션 “0.2초”를 구별 | `codex_frame_data.md`, `codex_motion_direction.md`: 1F 정지와 별도의 포즈 연장 예시·Broadsword 총시간 | **서로 다른 항목임을 밝힌 설명이 우세.** 0.2초를 200ms 히트스톱으로 쓰거나 1F를 고정 17ms로 옮기지 않는다. 실제 상충 수치를 합치는 문제가 아니다. |
| 트레일러 푸시인 | PBZ 연구의 과거 결정 기록: “진동 대신 푸시인”, “푸시인 2~3%” 유지 후보 | 같은 연구 §0.1 및 `codex_combat_impact.md`: “트레일러 … 실제 게임 카메라가 아니다” | **근거 정정인 B 우세.** 푸시인은 자체 후보로만 남는다. PBZ 플레이 임펄스 실측값으로 인용하지 않는다. |
| 보스 줌 배율 | D4 카메라 연구: “아레나 최대 ×1.20”, “19.8u” 제안 | D4 보스 연구: “18.3, 줌 0.90 승인”; 키샷 연구: “거리도 고정”인 해당 연구의 조건 | **공통 배율 결론 없음.** 장면·계약·작성 맥락이 다르다. 현재 요청이 고정한 원근 피치 34°와 먼 적 조건만 확실한 제약으로 사용하고 세 숫자를 합치지 않는다. |
| 黄天 엔진 | `codex_yellowsky.md`: “엔진 … 미확인” | `yellowsky-study--downfall_of_yellowsky.md`: “Unreal Engine 5”, 2024 모집글 검색 발췌의 “[단일·1차 출처]”; 방향 전환 문서는 UE5로 단정 | **B는 새롭고 구체적인 후보 근거다.** 다만 원문 미열람·이전 팀명과 현재 팀의 연결까지 남아 있다. 엔진 미확인에 ‘UE5 단일 단서’가 추가된 상태로 보존한다. 방향 문서의 단정이 독립 증거를 더하지 않는다. |
| 黄天 팀·기간 | `codex_yellowsky.md`: PlayFront “10인·1년 이상 개발” | 같은 문서와 클라우드 黄天 연구: 중국어 보도 “11인·당시 약 2년” | **과거 규모 기록에는 시점·중국어 출처가 명시된 B 우세.** 11명과 약 2년은 당시 보도값이다. 현재 인원·정확한 착수일·인월로 승격하거나 평균 내지 않는다. |
| 높이 안개와 거리 안개 | 클라우드 黄天 연구: “URP 기본 Fog … 사용 0”, PoE2 연구 F1: “거리 안개는 끔” | `codex_urp_mood.md`: “약한 거리/높이 안개” 비교, “표면 높이만으로 적 가독성을 판단하면 안 된다” | **기능·기하 근거에는 B 우세.** 높이 안개도 시선 경로가 적을 가릴 수 있다. A는 자체 설계 선택이지 黄天/PoE2 구현 확인이 아니며, 거리 안개의 보편 금지를 도출할 근거는 부족하다. |
| 안개 상한 | 클라우드 黄天 연구: 적 차폐 “15%”, 대기 원근 적 레이어 “0%” | D4 카메라 연구: “25%”; PoE2 연구: 적 영향 “50%”, 원경 섞임 “25%” | **어느 수치도 우세하지 않음.** 차폐·fog factor·영향 배율·지형 탈채도는 같은 분모가 아니다. 평균 상한을 만들지 않으며 최종 투과/대비 측정 전 미정이다. |
| 안개 색 | D4 환경 연구가 인용한 아트 기준: “붉은 탁한 갈색”, “파란 안개·회색 안개 금지” | 같은 연구의 코드 기록은 청록; PoE2/黄天 연구는 “은회색~차가운 청회색” | **현행 코드 기록과 미술 요구는 서로 다른 사실이다.** 특정 색의 우월성은 직접 관찰 없는 레시피로 결정 불가. 원문/목표 화면 대조가 필요하며 갈색+청회색의 임의 혼합안을 내지 않는다. |
| 검정과 그늘 | D4 환경 연구: “완전한 검정은 화면 가장자리·나무 그늘에만” | PoE2 연구: “순흑(sRGB 0~8) 면적 = 0%”; 黄天 연구: “순흑(<10) … ≤3%” | **서로 다른 자체 기준.** 임계값도 다르고 같은 계측 표본이 없다. 먼 적 식별 조건은 유지하되 검정 면적의 통합 합격값은 만들지 않는다. |
| ACES와 Neutral | D4 환경 연구: “현재 ACES 유지” | PoE2 연구: “추천 ① Neutral”, ACES+Bloom 사고를 이유로 제시 | **기술 비교에는 `codex_urp_mood.md`의 공식 모드 설명이 강함.** 사고의 원인이 ACES 단독이라는 증거는 없다. 동일 장면 비교 전 두 안 모두 후보이며 성능·가독성 승자를 정하지 않는다. |
| 색 보정 처리 순서 | 黄天 연구: “Bloom → Tonemapping → Color Adjustments·LGG·SMH”를 내부 순서처럼 설명 | `codex_urp_mood.md`: HDR Grading은 톤매핑 이전, LDR Grading은 이후; 사용자 LUT 경로도 구별 | **대상 계열 공식 문서를 구분한 B 우세.** A를 HDR 경로의 확정 순서로 쓰지 않는다. D4 환경 연구의 Tonemapping→보정→LUT 표는 스스로 ‘작업자가 손대는 순서’라 밝혔으므로 엔진 순서와의 직접 충돌로 세지 않는다. master 소스 세부는 설치본 일치가 별도다. |
| Terrain과 메시 지형 | D4 환경 연구: “추천: Terrain Lit 높이 블렌드” | PoE2 연구: “추천 ②메시 지형 + 조각 프리팹” | **근거 우열 미정.** 원작 지형 기술을 동일 조건에서 비교한 실험이 아니다. 현재 지형 접합·경사·조립 구조·텍스처 패스 비용 확인 없이 절충 아키텍처를 새로 만들지 않는다. |
| APV를 GI 대체로 쓰는 범위 | 클라우드 PoE2/黄天 연구: “APV 굽기”로 동적 GI의 분위기를 대체 | `codex_urp_mood.md`: “APV는 … 실시간 이동 횃불의 GI 해법도 아니다”, 정적 라이트맵과 이동체 프로브 구별 | **기능 범위에는 B 우세.** APV는 베이크된 간접광 수신의 후보다. 동적 스킬·런타임 조립 지오메트리·별도 리그 RT에서 PoE2/Lumen과 같은 결과를 보증하지 않는다. |
| Forward+ 권고 | PoE2 연구: “추천 ① Forward+”, 전환을 렌더러 키 변경으로 제안 | `codex_urp_mood.md`·`our_tech_audit.md`: 실제 경로/품질 선택·API·비용을 별도로 확인 | **채택 근거에는 B 우세.** 광원 수만으로 항상 빠른 경로를 정할 수 없다. quality index가 렌더 자산을 고르는 코드도 있어 파일명 PC/Mac만으로 활성 경로를 단정하지 않는다. |
| VFX 도구와 입자 수 | D4 동작 연구: “Shuriken … 기본”, D4 카메라 연구: “5천을 넘으면 … VFX Graph” | PBZ 연구: 스파크는 “VFX Graph(GPU…)”; `codex_vfx_direction.md`: 실제 비용 미확인 | **도구 기능·미검증 경계에는 Codex 연구가 강함.** GPU/CPU·정렬·판정 제어·투명 면적을 따로 비교해야 한다. 5천 전환점·400 파티클 상한·스파크 수는 공통 사실이 아니다. |
| 성능 예산을 실측처럼 읽는 문제 | D4 카메라 연구 §8: GPU/CPU 상한·“GPU 추가 ≤3.9ms”, 작업일 합계 | 같은 문서 말미: “모든 수치는 시작값”; `our_tech_audit.md`: “정적 위험도 … 실측 병목 순위가 아니다” | **실측 없음이라는 한계가 우선.** 예산표와 작업일은 제안이다. 더해도 현재 성능 여유나 달성 결과가 생기지 않는다. |
| Resources와 A2R | 전달 경고의 “Resources 2,751MB”; 감사/계획의 “2,881,554,015 byte”, “2,748.06MiB” | `codex_asset_size.md`: A2R은 별도 ref의 “1,247,335,249 byte”, 현재 HEAD에는 없음 | **정밀 범위에는 SHA·byte가 명시된 집계 우세.** 2,751MB 표기의 차이를 새 환산으로 해소하지 않는다. 어느 표기를 써도 A2R은 미포함이며 현재 절감량으로 더하거나 빼지 않는다. |
| 줍기 필터와 표시 필터 | 공통 체크리스트 G3: “줍기 필터 … 있음 — Simulation.MinPickRarity” | `codex_menus_loot.md`: Show/Hide·이름표 토글·규칙 우회는 별도 기능 | **기능 구별에는 B 우세.** 습득 등급 제한이 바닥 이름표 숨김을 구현했다는 증거는 아니다. 기존 함수의 실제 동작을 별도 확인해야 한다. |
| Last Epoch 필터 상한 | 지원 문서 “75개 규칙” | `codex_menus_loot.md`가 인용한 1.4 패치 “200개” | **해당 버전의 명시적 변경 기록인 B 우세.** 두 값을 평균 내지 않고 구버전 문구로 구분한다. 현행 실행 재검증까지 완료한 것은 아니다. |
| 서체와 확대 | 품질 기준 입력: “산세리프 단독 금지”; D4 HUD 제안: 배율 “0.85·1·1.25” | `codex_cinematic_text.md`: XAG의 읽기 쉬운 글꼴/산세리프 선택지, XAG 101 “200%” 확대 권고 | **목적이 다른 요구이며 자동 양립하지 않는다.** 장르 서체 취향은 가독성 충족의 증거가 아니고 1.25 배율은 200%가 아니다. 본문 서체 선택·접근성 옵션·실제 몸체 높이를 따로 검토해야 한다. |
| HUD 재설계와 이식 비교 | D4 HUD 연구: 구체 132px·슬롯 52/40px 등 새 비례 제안 | 품질 기준 입력: “웹 정본의 배치·크기·글꼴·입력 피드백을 비교 기준” | **상충한 프로젝트 제안으로 보존.** 전자는 경쟁작 실측값도 승인된 현행 계약도 아니다. 이 종합에서 HUD 치수를 확정하거나 정본을 교체하지 않는다. |
| Sekiro 튕겨내기 | `codex_frame_data.md`: Nexus 공개 글 “12F = 0.2s”, 60fps | 옛 커뮤니티 글 “30F, 약 0.5s” | **조건/기준을 밝힌 A가 상대적으로 강하나 공식 현재값은 아니다.** B는 입력도 채택 보류다. 프레임 기준 차이가 원인이라고 단정하지 않는다. |
| Elden Ring 구르기 | `codex_frame_data.md`: 위키 “14F”, 30fps | 같은 문서: PC 관측 “27F”, 60fps; 옛 재정리 “26F”, 60fps(보류) | **단일 현재값 판정 불가.** 관측은 스태미나 감소→체력 감소 경계여서 엔진 무적과 다를 수 있다. 기준 fps를 맞춰도 차이가 남으며 평균값을 만들지 않는다. |
| 실루엣 합성의 깊이 | D4 카메라 연구: “같은 RT 카메라의 Renderer”에 Depth Greater 실루엣 | `codex_3d_pixel.md`: 색상·깊이·노멀·ID의 카메라 행렬/격자/변형 일치 요구 | **정합성 조건을 적은 B가 강함.** 분리된 캐릭터 RT의 깊이에 월드 고목이 존재하는지는 미확인이다. 패스를 추가하는 설명만으로 월드 가림 해결을 확정할 수 없다. |

공통성에 대한 추가 주의: 체크리스트의 ‘3편 이상’은 이번에 실물을 대조한 결과가 아니다. 클라우드 문서 둘이 같은 원문을 재인용해도 독립 출처 둘이 되지 않는다. `yellowsky-study--DIRECTION_RESET_20261105.md`의 ‘최상위 분위기 기준’은 목표 기록이며, 영상 미관찰 상태의 색온도·안개 높이·Lumen 추정을 사실로 승격시키지 않는다.

## 3. 입력에서 확인된 사실만 모은 수치표

### 3.0 수록 기준

아래 값은 **입력에 이미 있는 값과 단위 표기를 그대로 옮겼다. 새 환산·역산·평균·권장 상수를 만들지 않았다.** `[추정]`, 자체 `[제안]/[기준]`, 채택 보류값과 값 자체가 미확인인 행은 제외했다. 사실표는 경쟁작의 최신 내부 상수표가 아니다. ‘개발자 발언’, ‘커뮤니티 기재/관측’, ‘상점 조건’, ‘외부 지침’, ‘정적 집계’를 분리한다. 조건을 모르는 부분을 제거해 확정성만 높이지 않았다.

`codex_frame_data.md`의 `[사실·환산]`은 가능하면 초·프레임 원값을 옮겼다. Dead Cells의 60fps 가정 환산, 원근/메모리 계산 예시, 가정 FPS의 프레임 간격, 이론 압축 payload, 제안 인일·용량 목표는 포함하지 않았다. 충돌하는 공개 기재값은 그 값이 기재됐다는 사실로만 행을 유지하고 §2의 보류 상태를 적용한다.

### 3.1 동작·타격: 공식 발언과 공개 커뮤니티 기록

| 항목·확인 범위 | 값 | 단위·시간 기준 | 게임 | 출처 URL | 출처 문서 |
|---|---|---|---|---|---|
| 치명타 정지, 2017 개발자 설명 | 1 | 프레임 | Dead Cells | https://80.lv/articles/interview-with-the-developers-of-dead-cells | `codex_combat_impact.md` |
| 치명타 정지, 별도 2017 인터뷰 | 1F | F | Dead Cells | https://www.gamedeveloper.com/design/designing-each-of-the-50-weapons-in-i-dead-cells-i-to-feel-distinctive | `codex_frame_data.md` |
| Broadsword 첫 타/다음 타/마지막 타 총시간, 위키 기재 | 0.6 / 0.75 / 0.9 | s | Dead Cells | https://deadcells.wiki.gg/wiki/Broadsword | `codex_frame_data.md` |
| Broadsword 콤보 총시간, 위키 기재 | 2.25 | s | Dead Cells | https://deadcells.wiki.gg/wiki/Broadsword | `codex_frame_data.md` |
| 일반 구르기 총시간/쿨다운, 위키 기재 | 0.4 / 0.37 | s | Dead Cells | https://deadcells.wiki.gg/wiki/Mechanics | `codex_frame_data.md` |
| breach 조건의 행동 중단·기절, 위키 기재 | 1.4 | s | Dead Cells | https://deadcells.wiki.gg/wiki/Inflammable_oil#Breach | `codex_frame_data.md` |
| Athena's Aid Common 기본 무적·Deflect 지속, 은혜 표 | 1.5 | s | Hades 1 | https://hades.fandom.com/wiki/Athena/Boons_%28Hades%29 | `codex_frame_data.md` |
| Festive Fog 기절 발생 주기/안개 지속, 은혜 표 | 0.25 / 5 | s | Hades 1 | https://hades.fandom.com/wiki/Dionysus/Boons_%28Hades%29 | `codex_frame_data.md` |
| Twin Fists 일반 5타 콤보+회복, 게시자 보고 | 1.5 | s | Hades 1 | https://www.reddit.com/r/HadesTheGame/comments/1j3ilqg/doing_the_math_on_the_fists/ | `codex_motion_direction.md` |
| Twin Fists Special, 게시자 보고 | 1 | s | Hades 1 | https://www.reddit.com/r/HadesTheGame/comments/1j3ilqg/doing_the_math_on_the_fists/ | `codex_motion_direction.md` |
| 일반 튕겨내기 창, 공개 커뮤니티 설명 | 12F = 0.2s | F, 60fps. 원문은 30fps 뷰어 표시를 실제 6F로 읽지 말라고 경고 | Sekiro | https://www.nexusmods.com/stellarblade/articles/199 | `codex_frame_data.md` |
| 경량·중량(medium) 구르기 무적, 위키 기재 주장 | 14F | F, 30fps | Elden Ring | https://eldenring.wiki.gg/wiki/Invincibility_Frames | `codex_frame_data.md` |
| heavy 구르기 무적, 같은 위키 기재 | 13F | F, 30fps | Elden Ring | https://eldenring.wiki.gg/wiki/Invincibility_Frames | `codex_frame_data.md` |
| 경량·중량 구르기 관측 구간, 2022 PC 보고 | 27F | F, 60fps | Elden Ring | https://www.reddit.com/r/Eldenring/comments/t4wpgd/ | `codex_frame_data.md` |
| 기본 회피 무적 관측 범위 | 0.217~0.234 | s | MHW-PC | https://www.reddit.com/r/MonsterHunter/comments/c0klwh/ | `codex_frame_data.md` |
| Evade Window Lv1 관측 범위 | 0.251~0.268 | s | MHW-PC | https://www.reddit.com/r/MonsterHunter/comments/c0klwh/ | `codex_frame_data.md` |
| Evade Window Lv2 관측 범위 | 0.284~0.301 | s | MHW-PC | https://www.reddit.com/r/MonsterHunter/comments/c0klwh/ | `codex_frame_data.md` |
| Evade Window Lv3 관측 범위 | 0.318~0.335 | s | MHW-PC | https://www.reddit.com/r/MonsterHunter/comments/c0klwh/ | `codex_frame_data.md` |
| Evade Window Lv4 관측 범위 | 0.368~0.385 | s | MHW-PC | https://www.reddit.com/r/MonsterHunter/comments/c0klwh/ | `codex_frame_data.md` |
| Evade Window Lv5 관측 범위 | 0.418~0.435 | s | MHW-PC | https://www.reddit.com/r/MonsterHunter/comments/c0klwh/ | `codex_frame_data.md` |
| 위 PC 측정자의 보고 오차 | ±0.002 | s | MHW-PC | https://www.reddit.com/r/MonsterHunter/comments/c0klwh/ | `codex_frame_data.md` |
| Echo Attack 원본 히트스톱, HOOT 제작자 주장 | 0 | ms, 정지 없음이라는 설명 | MHW | https://www.nexusmods.com/monsterhunterworld/mods/3442 | `codex_frame_data.md` |
| Falling Bash 후속 명중 stun damage, 원본→모드 | 15 → 30 | 기절 축적량 포인트 | MHW / HOOT | https://www.nexusmods.com/monsterhunterworld/mods/3442 | `codex_frame_data.md` |
| Sol 5P 발생/지속/후딜/가드 유불리, 위키 기재 | 4 / 4 / 6 / ±0 | F, 60fps | GGXrd REV 2 | https://mail.dustloop.com/w/GGXRD-R2/Sol_Badguy | `codex_frame_data.md` |
| Sol c.S 발생/지속/후딜/가드 유불리 | 5 / 2 / 16 / −4 | F, 60fps | GGXrd REV 2 | https://mail.dustloop.com/w/GGXRD-R2/Sol_Badguy/Frame_Data | `codex_frame_data.md` |
| Sol 5H 발생/지속/후딜/가드 유불리 | 11 / 2 / 26 / −9 | F, 60fps | GGXrd REV 2 | https://mail.dustloop.com/w/GGXRD-R2/Sol_Badguy/Frame_Data | `codex_frame_data.md` |
| Sol 5P/Lv0 히트스톱/hitstun/blockstun, 공개 표 결합 | 11 / 10 / 9 | F, 60fps | GGXrd REV 2 | https://mail.dustloop.com/w/GGXRD-R2/Sol_Badguy ; https://mail.dustloop.com/w/GGXRD-R2/Answer/Frame_Data | `codex_frame_data.md` |
| Sol c.S/Lv2 같은 세 항목 | 13 / 14 / 13 | F, 60fps | GGXrd REV 2 | https://mail.dustloop.com/w/GGXRD-R2/Sol_Badguy/Frame_Data ; https://mail.dustloop.com/w/GGXRD-R2/Answer/Frame_Data | `codex_frame_data.md` |
| Sol 5H/Lv4 같은 세 항목 | 15 / 19 / 18 | F, 60fps | GGXrd REV 2 | https://mail.dustloop.com/w/GGXRD-R2/Sol_Badguy/Frame_Data ; https://mail.dustloop.com/w/GGXRD-R2/Answer/Frame_Data | `codex_frame_data.md` |
| Filia kneefall 수정, GDC 작화 예시 | 기존 21, 덜어낸 6 | 애니메이션 frames | Skullgirls | https://media.gdcvault.com/GDC2014/Presentations/Cartwright_Muriel_Animation_Bootcamp_Fluid.pdf | `codex_motion_direction.md` |
| Cerebella Diamond Punch 수정 | 45 → 29 | 애니메이션 frames | Skullgirls | https://media.gdcvault.com/GDC2014/Presentations/Cartwright_Muriel_Animation_Bootcamp_Fluid.pdf | `codex_motion_direction.md` |

프레임 기준이 없는 Dead Cells 1F는 ms로 옮기지 않았다. Broadsword는 공격 총시간이며 히트스톱이 아니다. Hades 은혜는 기본 대시 값이 아니다. Sekiro 창은 무적 시간이 아니다. Elden Ring 행들은 서로 충돌하는 **기재·관측 사실**이며 최신 엔진 무적의 정답으로 채택하지 않는다. MHW 범위는 당시 PC 보고이며 현재 Iceborne 전체에 적용된다고 확인한 값이 아니다. GGXrd 발생은 첫 유효 프레임을 포함하고 세 경직값은 일반 조건의 공개 표 결합이다. 커뮤니티 위키의 측정법·개정 이력을 다 확인하지 못했다는 입력 한계도 유지한다.

### 3.2 제작 규모·표현·오디오 사례

| 항목·적용 시점 | 값 | 단위 | 게임 | 출처 URL | 출처 문서 |
|---|---|---|---|---|---|
| 제작 글의 캐릭터 표시 높이 사례 | 약 50 | px | Dead Cells | https://www.gamedeveloper.com/production/art-design-deep-dive-using-a-3d-pipeline-for-2d-animation-in-i-dead-cells-i- | `codex_3d_pixel.md`, `codex_motion_direction.md` |
| 아트 담당 확대 | 1 → 2 | 명 | Dead Cells | https://www.gamedeveloper.com/production/art-design-deep-dive-using-a-3d-pipeline-for-2d-animation-in-i-dead-cells-i- | `codex_3d_pixel_small_team.md` |
| 2019 운영 전환 당시 핵심 팀 | 8 | 명 | Dead Cells | https://motiontwin.com/faq | `codex_3d_pixel_small_team.md` |
| GDC 2019 소개 개발기간 | 2.5 | 년 | Dead Cells | https://media.gdcvault.com/gdc2019/presentations/Benard-Sebastian-DeepCells.pdf | `codex_3d_pixel_small_team.md` |
| 첫 출시 기한 / Steam을 위한 후속 제작 | 4 / 추가 4~5 | 개월 | A Short Hike | https://www.gdcvault.com/play/1026613/ ; https://mcvuk.com/business-news/the-first-time-somebody-was-reading-the-dialogue-i-had-to-leave-the-room-i-was-too-embarrassed-how-adamgryu-overcame-writers-block-and-creative-burnout-in-the-development-of-a-short/ | `codex_3d_pixel_small_team.md` |
| 상근 핵심 팀 / 2023년 4월 AMA 제작기간 | 2 / 3년 넘게 | 명 / 년 | Cassette Beasts | https://www.reddit.com/r/JRPG/comments/12kobbo/ | `codex_3d_pixel_small_team.md` |
| 초기 팀 / 출시 후 AMA가 밝힌 성장 | 3 / 10 | 명 | Eastward | https://www.indiedb.com/games/eastward/news/we-are-making-eastward1 ; https://www.reddit.com/r/NintendoSwitch/comments/pyh9vo/ | `codex_3d_pixel_small_team.md` |
| 2019 인터뷰 당시 핵심 개발자 | 2 | 명 | Prodeus | https://www.famitsu.com/news/201904/11174603.html | `codex_3d_pixel_small_team.md` |
| 피크 프로그래머, 전체 팀 아님 | 6 | 명 | Octopath Traveler | https://www.unrealengine.com/spotlights/octopath-traveler-s-hd-2d-art-style-and-story-make-for-a-jrpg-dream-come-true | `codex_3d_pixel_small_team.md` |
| 2026년 7~8월 중국어 보도의 팀 규모 | 11 | 명 | 黄天逆途 | https://www.hxnews.com/news/dmyx/djyx/yxxw/202607/28/2263530.shtml ; https://news.17173.com/content/08142026/091430794.shtml | `codex_yellowsky.md` |
| 2026년 7월 공개 당시 개발기간 | 약 2 | 년 | 黄天逆途 | https://www.bilibili.com/video/BV19C356bEhm/ | `codex_yellowsky.md` |
| 당시 보도된 외부 투자 | 0 | 외부 투자, 금액·통화 수치 아님 | 黄天逆途 | https://www.gamersky.com/news/202607/2177567.shtml ; https://news.17173.com/content/08142026/091430794.shtml | `codex_yellowsky.md` |
| 당시 운영 재원을 위한 외주 시간 비중 | 약 1/4 | 업무 시간 비율 | 黄天逆途 | https://news.17173.com/content/08142026/091430794.shtml | `codex_yellowsky.md` |
| 도입곡 설명의 드럼/베이스/나머지 악기 | 3 | 음악 stem | Hades 1 | https://gameplay.co/hades-game-music-sound-design-darren-korb-supergiant-games/ | `codex_tech_budget.md` |
| 2022 Q&A의 당시 설정별 동시 채널 | 32 / 64 / 128 | 사운드 채널 | PoE1 | https://www.pathofexile.com/forum/view-thread/3318839 | `codex_sound_music.md` |
| 특정 패치의 Wwise 업데이트 | 2022.1.19 | 버전 식별자 | No Rest for the Wicked | https://forum.norestforthewicked.com/t/patch-notes-the-breach-refined-patch-1/19212 | `codex_sound_music.md` |
| GameSpot 오프닝 공개본 목록 길이 | 04:58 | 분:초, 게시 메타데이터 | Path of Exile 2 | https://www.gamespot.com/games/path-of-exile-2/videos/ | `codex_cinematic_text.md` |
| 열람 당시 Steam 인터페이스·자막 지원 | 9 | 언어 | Path of Exile 2 | https://store.steampowered.com/app/2694490/Path_of_Exile_2/?l=english | `codex_cinematic_text.md` |

핵심 인원과 전체 기여자, 첫 출시와 이식·추가 제작은 동일한 분모가 아니다. 黄天의 외부 투자 0은 총개발비 0이 아니다. Hades stem은 버스나 실제 voice 수가 아니며 PoE1 채널을 PoE2 타격 레이어 수로 전용하지 않는다. 공개 영상 길이는 게임 내 잠금 시간이 아니다.

### 3.3 공개 성능·상점 조건

| 항목·조건 | 값 | 단위 | 게임/대상 | 출처 URL | 출처 문서 |
|---|---|---|---|---|---|
| GTX 1050의 발광 캐릭터 간접광 예시 | 약 3 | ms, GI 부분 처리 | Path of Exile 2 | https://github.com/Raikiri/RadianceCascadesPaper/blob/main/RadianceCascades.tex | `codex_tech_budget.md` |
| Ancient Dragon 공격 장면, 0.9 개발 비교 | 40 FPS대 중반 → 약 100 | FPS | Last Epoch | https://forum.lastepoch.com/t/performance-optimization-coming-in-convergence/52263 | `codex_tech_budget.md` |
| 관리하는 particle systems | 2,700 | 시스템 | V Rising | https://unity.com/resources/stunlock-studios-v-rising | `codex_tech_budget.md` |
| 기술 사례의 서버 규모 / 월드 오브젝트 규모 | 60 / 160,000 초과 | 플레이어 / 월드 오브젝트 | V Rising | https://unity.com/resources/stunlock-studios-v-rising | `codex_tech_budget.md` |
| 저자 장면의 cubemap 면당 격자 | 384² | texel/면 | Texel Splatting 연구 | https://arxiv.org/html/2603.14587v1 | `codex_3d_pixel.md` |
| iPhone 15/A16/mobile Safari 저자 결과 | 40 | fps | Texel Splatting 연구 | https://arxiv.org/html/2603.14587v1 | `codex_3d_pixel.md` |
| RTX 4090 저자 결과 | 4 미만 | ms/프레임 | Texel Splatting 연구 | https://arxiv.org/html/2603.14587v1 | `codex_3d_pixel.md` |
| 최소 RAM / 여유 공간 / 성능 조건 | 8 / 90 / 30 | GB RAM / GB 공간 / FPS | Diablo IV | https://store.steampowered.com/app/2344520/Diablo_IV/ | `codex_tech_budget.md` |
| 최소 성능의 출력/렌더 조건 | 1080p / 720p | 출력/내부 렌더, Low | Diablo IV | https://store.steampowered.com/app/2344520/Diablo_IV/ | `codex_tech_budget.md` |
| 권장 조건의 목표 | 60 | FPS, 1080p Medium | Diablo IV | https://store.steampowered.com/app/2344520/Diablo_IV/ | `codex_tech_budget.md` |
| 출시기 Ultra 텍스처 조건의 시스템 RAM | 최소 32 | GB RAM | Diablo IV | https://news.blizzard.com/en-gb/article/23964183/peeling-back-the-varnish-the-graphics-of-diablo-iv | `codex_tech_budget.md` |
| 최소 RAM / VRAM / 여유 공간 | 8 / 3 / 100 | GB RAM / GB VRAM / GB 공간 | Path of Exile 2 | https://store.steampowered.com/app/2694490/Path_of_Exile_2/ | `codex_tech_budget.md` |
| 협동 지원 인원, 적 상한 아님 | 최대 6 | 플레이어 | Path of Exile 2 | https://store.steampowered.com/app/2694490/Path_of_Exile_2/ | `codex_tech_budget.md` |
| 최소 RAM / 여유 공간 | 8 / 22 | GB RAM / GB 공간 | Last Epoch | https://store.steampowered.com/app/899770/Last_Epoch/ | `codex_tech_budget.md` |
| 최소 RAM / 여유 공간 | 12 / 19 | GB RAM / GB 공간 | V Rising | https://store.steampowered.com/app/1604030/V_Rising/ | `codex_tech_budget.md` |
| 최소 RAM / 여유 공간 | 16 / 46 | GB RAM / GB 공간 | No Rest for the Wicked | https://store.steampowered.com/app/1371980/No_Rest_for_the_Wicked/?curator_clanid=44756906&l=english | `codex_tech_budget.md` |
| 최소 RAM / 여유 공간 | 4 / 15 | GB RAM / GB 공간 | Hades 1 | https://store.steampowered.com/app/1145360/Hades/ | `codex_tech_budget.md` |
| 2021 콘솔 발표의 목표 | 60 | FPS | Hades 1 | https://www.supergiantgames.com/blog/hades-out-now-on-xbox-and-playstation/ | `codex_tech_budget.md` |
| 같은 발표의 PS4·Xbox One / PS5·Series X/S | 1080p / 4K | 출력 해상도, 발표 문구 | Hades 1 | https://www.supergiantgames.com/blog/hades-out-now-on-xbox-and-playstation/ | `codex_tech_budget.md` |
| 최소 RAM / 공간 / 최소 성능 | 16 / 145 / 30 | GB RAM / GB 공간 / FPS | Phantom Blade Zero | https://store.steampowered.com/app/4115450/Phantom_Blade_Zero/ | `codex_tech_budget.md` |
| 최소/권장 성능 조건 | 1080p 30 / 1440p 60 | 해상도·FPS、업스케일링 활성·SSD 조건 | Phantom Blade Zero | https://store.steampowered.com/app/4115450/Phantom_Blade_Zero/ | `codex_tech_budget.md` |
| Prelude 상점의 여유 공간 | 1 | GB available space | Halls of Torment: Prelude | https://store.steampowered.com/app/2316660/Halls_of_Torment_Prelude/ | `codex_asset_size.md` |

GI 시간은 게임 전체 GPU 예산이 아니다. LE 사례는 하드웨어·해상도 조건이 충분하지 않고 여러 최적화가 섞여 있어 범용 개선 배율을 산출하지 않는다. V Rising 시스템·서버·월드 수는 동시 입자·화면 적 수가 아니다. Texel Splatting은 Unity 리깅 캐릭터 재현이 아니며 animated geometry가 향후 과제라는 한계를 유지한다. 상점 수치는 입력 조사일의 요구 조건이며 실제 설치·압축 다운로드·상주 메모리 실측이 아니다.

### 3.4 UI·전리품 공개값과 외부 접근성 지침

| 항목·범위 | 값 | 단위 | 게임/기준 | 출처 URL | 출처 문서 |
|---|---|---|---|---|---|
| 글자 크기 선택 | 3 | 단계 | Diablo IV | https://news.blizzard.com/en-gb/article/23954932/combatting-demons-with-accessibility-in-diablo-iv | `codex_menus_loot.md` |
| 3.0 안내의 필터당 규칙 / 동시 활성 필터 | 1~25 / 1 | 규칙 / 필터 | Diablo IV | https://news.blizzard.com/en-us/article/24267729/prepare-for-the-reckoning-lord-of-hatred-draws-near | `codex_menus_loot.md` |
| SetFontSize 공용 문법 | 1~45 | 문법 매개변수, 표시 px 아님 | GGG 아이템 필터 | https://www.pathofexile.com/item-filter/about | `codex_menus_loot.md` |
| RGB·Alpha 지정 범위 | 각 0~255 | 문법 색 성분 | GGG 아이템 필터 | https://www.pathofexile.com/item-filter/about | `codex_menus_loot.md` |
| 경고음 Volume 문법 범위 | 0~300 | 문법 매개변수, dB 아님 | GGG 아이템 필터 | https://www.pathofexile.com/item-filter/about | `codex_menus_loot.md` |
| 1.4 패치 필터 규칙 상한 | 200 | 규칙 | Last Epoch | https://forum.lastepoch.com/t/last-epoch-shattered-omens-patch-notes/80571 | `codex_menus_loot.md` |
| UI 표준 크기 / 개별 조절 영역 | 4종 + Custom / 4 | 선택지 / 영역 | Last Epoch | https://support.lastepoch.com/hc/en-us/articles/46363237395227-How-do-I-change-my-UI-Scale | `codex_menus_loot.md` |
| 특화 슬롯 | 최대 5 | 슬롯 | Last Epoch | https://support.lastepoch.com/hc/en-us/articles/46363203944859-Skill-Specialization | `codex_menus_loot.md` |
| 공개 Zeus 은혜 선택 화면 서술 | 3 | 선택지, 해당 사례 | Hades 1 | https://playcraft.space/gallery/e/hades-boons-of-zeus-choose-one-of-three-olympian-boons/ | `codex_menus_loot.md` |
| PC/VR 기본 문자 높이, 1080p / 4K | 18 / 36 이상 | 실제 보이는 px | XAG 101 | https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/101 | `codex_cinematic_text.md`, `codex_menus_loot.md` |
| 콘솔 기본 문자 높이, 1080p / 4K | 26 / 52 이상 | 실제 보이는 px | XAG 101 | https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/101 | `codex_cinematic_text.md` |
| 내용·기능·의미 손실 없는 확대 권고 | 200 | %、기본 최소 크기에서 | XAG 101 | https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/101 | `codex_cinematic_text.md` |
| 문자 몸체 측정의 가장자리 판단 | 2:1 | 배경 대비 비율 | XAG 101 | https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/101 | `codex_cinematic_text.md` |
| 중요 일반 크기 / 큰 글자·요소 대비 | 4.5:1 / 3:1 이상 | 대비 비율 | XAG 102 | https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/102 | `codex_cinematic_text.md`, `codex_menus_loot.md` |
| TV 1080p 기본 문자 최소 참고 | 28 | px | GAG | https://gameaccessibilityguidelines.com/use-an-easily-readable-default-font-size/ | `codex_cinematic_text.md` |
| 1080p 자막 기본 또는 옵션 권고 | 46 이상 | px | GAG 자막 | https://gameaccessibilityguidelines.com/if-any-subtitles-captions-are-used-present-them-in-a-clear-easy-to-read-way/ | `codex_cinematic_text.md` |
| 자막 한 줄 길이 / 보통 줄 수 / 예외 줄 수 | 40 이하 / 2 / 3 | 자 / 줄 / 줄 | GAG 자막 | https://gameaccessibilityguidelines.com/if-any-subtitles-captions-are-used-present-them-in-a-clear-easy-to-read-way/ | `codex_cinematic_text.md` |
| 방송 프로그램 평균 라우드니스 권고 | −23 | LUFS | EBU R 128 | https://tech.ebu.ch/publications/r128 | `codex_sound_music.md` |

외부 지침의 숫자는 경쟁작의 채택·달성값이 아니다. 콘솔·PC·본문·자막·기능 태그의 적용 범위를 섞지 않는다. GGG 문법은 두 게임 공용이며 매개변수 크기와 실제 글자 높이·음량을 바꾸어 쓰지 않는다. Hades 선택지 수는 공개 화면 기록의 서술이며 이 종합의 직접 이미지 관찰값이 아니다.

### 3.5 공식 규격·도구 문서의 숫자

| 항목·조건 | 값 | 단위 | 게임/도구 | 출처 URL | 출처 문서 |
|---|---|---|---|---|---|
| Header / Small Capsule | 920×430 / 462×174 | px | Steam | https://partner.steamgames.com/doc/store/assets/standard?l=english | `codex_keyshot_composition.md` |
| Main / Vertical Capsule | 1232×706 / 748×896 | px | Steam | https://partner.steamgames.com/doc/store/assets/standard?l=english | `codex_keyshot_composition.md` |
| 스크린샷 최소 크기 / 비율 / 최소 수 | 1920×1080 / 16:9 / 5 | px / 비율 / 장 | Steam | https://partner.steamgames.com/doc/store/assets/standard?l=english | `codex_keyshot_composition.md` |
| Page Background / Bundle Header | 1438×810 / 707×232 | px | Steam | https://partner.steamgames.com/doc/store/assets/standard?l=english | `codex_keyshot_composition.md` |
| 해당 안내의 전체 연령 적합 이미지 표시 | 최소 4 | 장、전체 스크린샷 최소 수와 별개 | Steam | https://partner.steamgames.com/doc/store/assets/standard?l=english | `codex_keyshot_composition.md` |
| Color Grading LUT Size 기본 | 32 | LUT Size | Unity 6000.6 URP | https://docs.unity.com/en-us/engine/6000.6/manual/render-pipelines/universal-render-pipeline/urp-reference/universalrp-asset | `codex_urp_mood.md` |
| Shadowmask texel당 저장 상한 | 4 | 광원 | Unity 6000.6 | https://docs.unity.com/en-us/engine/6000.6/manual/lighting-overview/lighting-light-sources/components/configuring/lighting-mode/lighting-mode | `codex_urp_mood.md` |
| Max Bounces 기본 / 범위 | 2 / 0–100 | bounce 설정 | Unity 문서의 베이크 항목 | https://docs.unity.com/en-us/engine/6000.6/manual/lighting-overview/direct-and-indirect-lighting/lightmapping/baking-before-runtime/lightmaps-reference | `codex_urp_mood.md` |
| VLB HD 품질 문서 예시 | Fast 5 / Balanced 10 / High 20 | steps | Volumetric Light Beam | https://saladgamer.com/vlb-doc/comp-lightbeam-hd/ | `codex_urp_mood.md` |
| Multi-Pass 안내 SD / HD 광선당 | 2 / 1 | draw call | Volumetric Light Beam | https://www.saladgamer.com/vlb-doc/config/ | `codex_urp_mood.md` |
| HD 그림자 문서 기본 해상도 / 깊이 | 128 / 16 | 해상도 설정 / bit | Volumetric Light Beam | https://saladgamer.com/vlb-doc/comp-shadow-hd/ | `codex_urp_mood.md` |
| README의 Volume당 광원 상한 | 32 | 광원 | sinnwrig/URP-Fog-Volumes | https://github.com/sinnwrig/URP-Fog-Volumes | `codex_urp_mood.md` |
| priority API의 높은 / 낮은 우선순위 | 0 / 256 | priority 값 | Unity AudioSource | https://docs.unity3d.com/6000.0/Documentation/ScriptReference/AudioSource-priority.html | `codex_sound_music.md` |
| BC7 / RGBA32 포맷 | 8 / 32 | bit/pixel | Unity 텍스처 포맷 | https://docs.unity3d.com/6000.6/Documentation/Manual/texture-formats-reference.html | `codex_asset_size.md` |
| 일반 mip chain 추가 저장량 설명 | 약 33 | % | Unity 텍스처 문서 | https://docs.unity3d.com/6000.6/Documentation/Manual/texture-mipmaps-introduction.html | `codex_asset_size.md` |

도구 제작사 기본값·예시는 해당 문서의 설명이지 프로젝트 권장값·6000.6.7f1 설치 조합 검증값이 아니다. VLB draw call은 그림자·먼지·장면 전체 비용이 아니다. sinnwrig 구현의 대상 Render Graph/APV/Metal 호환성은 입력에서 미확인이다. 원근 픽셀 카메라의 최적 해상도·스냅 격자는 이 표에 없다.

### 3.6 외부 URL이 없는 프로젝트 정적 수치 — 별도 보존

이 표는 경쟁작 실측표와 분리한다. 입력의 출처가 Git 경로·SHA이므로 **출처 URL을 새로 만들지 않았다.** URL 열의 ‘외부 URL 없음’은 숫자를 모른다는 뜻이 아니라 입력 인용 형식의 경계다. 두 문서의 기준 SHA는 `75add6ff4a6209e2590a7a626ffb4c37b5f0268e`이며 이번 종합에서 프로젝트 파일을 다시 분석하지 않았다.

| 항목·정적 범위 | 값 | 단위 | 게임 | 출처 URL / 입력이 제공한 근거 | 출처 문서 |
|---|---|---|---|---|---|
| Resources .meta 제외 원본 | 2,881,554,015 | byte | EXODUSER | 외부 URL 없음. 위 SHA `unity/Assets/Exoduser/Resources` Git tree | `our_tech_audit.md`, `codex_asset_size.md` |
| 같은 합계의 입력 표기 | 2,748.06 | MiB | EXODUSER | 외부 URL 없음. 같은 원본 집계 | `codex_asset_size.md` |
| Resources 원본 수 | 1,417 | 파일 | EXODUSER | 외부 URL 없음. 같은 Git tree | `codex_asset_size.md` |
| FullscreenWide 원본 | 128 / 1,112,785,500 | 파일 / byte | EXODUSER | 외부 URL 없음. `Resources/Art/FullscreenWide` | `codex_asset_size.md` |
| Loading 원본 | 74 / 415,262,186 | 파일 / byte | EXODUSER | 외부 URL 없음. `Resources/Art/Loading` | `codex_asset_size.md` |
| fonts 원본、폰트 외 부속 포함 | 30 / 110,748,202 | 파일 / byte | EXODUSER | 외부 URL 없음. `Resources/Art/fonts` | `our_tech_audit.md` |
| StreamingAssets、Resources 밖 | 12 / 68,692,282 | 파일 / byte | EXODUSER | 외부 URL 없음. `unity/Assets/StreamingAssets` | `our_tech_audit.md` |
| 별도 A2R 보존분 | 797 / 1,247,335,249 | 파일 / byte | EXODUSER | 외부 URL 없음. ref `3c07e220658ddf819929fd5f538a2f5f5067ab6f`의 `Resources/A2R` | `codex_asset_size.md` |
| 빈 native 행 / 해당 outputs | 34 / 68 | 행 / 파일 | EXODUSER | 외부 URL 없음. `Resources/Data/fullscreen_wide.json`, `Runtime/NativeFullscreenArtwork.cs` | `codex_asset_size.md` |
| 해당 카탈로그 도달불가 후보 원본 | 686,901,106 | byte | EXODUSER | 외부 URL 없음. 같은 로더·카탈로그 정적 대조 | `codex_asset_size.md` |
| 일반 미참조 후보、삭제 확정 아님 | 73 / 66,209,943 | 파일 / byte | EXODUSER | 외부 URL 없음. Resources 키 전수 대조 | `codex_asset_size.md` |
| 별도 판단 불가로 보존 | 361 / 392,602,612 | 파일 / byte | EXODUSER | 외부 URL 없음. 동적 입력/직렬화 의존성 미폐쇄 분류 | `codex_asset_size.md` |
| TextureImporter 전체 / Resources 안 | 1,057 / 998 | .meta | EXODUSER | 외부 URL 없음. 위 SHA 직렬화 필드 집계 | `codex_asset_size.md` |
| Default 압축0 / Default cap8192 | 853 / 846 | .meta | EXODUSER | 외부 URL 없음. 전체 TextureImporter 집계 | `our_tech_audit.md` |
| Read/Write 켜진 텍스처 | 24 | .meta | EXODUSER | 외부 URL 없음. 전체 TextureImporter 집계 | `our_tech_audit.md` |
| Streaming Mipmaps 필드0 | 1,057 | .meta | EXODUSER | 외부 URL 없음. 전체 TextureImporter 집계 | `our_tech_audit.md` |
| 일반 클립 PCM/preload / BGM compressed-in-memory | 138 / 16 | AudioImporter | EXODUSER | 외부 URL 없음. `Editor/SourceAudioImporter.cs` 및 meta | `our_tech_audit.md` |
| SFX 논리 활성 / Real / Virtual | 48 / 32 / 512 | 논리 활성 / voice 설정 / voice 설정 | EXODUSER | 외부 URL 없음. `Runtime/NativeFeedbackAudio.cs`, `ProjectSettings/AudioManager.asset` | `our_tech_audit.md` |
| Awake fixedDeltaTime / targetFrameRate | 1/60 / 120 | 초 설정 / FPS 목표 설정 | EXODUSER | 외부 URL 없음. `Runtime/NativeGame.cs` | `our_tech_audit.md` |
| 영웅 R7 원본 제어점 / 삼각형 환산 | 142,733 / 93,437 | 정점 / tri 환산 | EXODUSER | 외부 URL 없음. `Art/Characters/Warrior/RemasterR7/Warrior_R7.fbx` | `our_tech_audit.md` |
| 적 원본 30종 삼각형 환산 범위 | 12,240~13,047 | tri 환산/원본 | EXODUSER | 외부 URL 없음. `Resources/Enemies3D/*.fbx` | `our_tech_audit.md` |
| 전경 로그 원본 제어점 / 삼각형 환산 | 27,064 / 45,719 | 정점 / tri 환산 | EXODUSER | 외부 URL 없음. `Resources/Art/map/a2/foreground/Models/A2_Scanned_Foreground_Log.fbx` | `our_tech_audit.md` |
| 적 idle / walk atlas 원본 해상도 | 2048×1280 / 8192×1280 | px、각 방향 이미지 | EXODUSER | 외부 URL 없음. `Resources/Art/enemy/atlas_ch1_8dir*` IHDR | `our_tech_audit.md` |

**Resources 2,751MB에 A2R은 미포함이라는 입력 한계를 그대로 유지한다.** 정밀 집계 문서는 위 byte·MiB를 제공한다. ‘2,751MB’와의 표기 차이 원인을 임의로 단위 변환 문제라고 확정하지 않는다. A2R의 별도 보존 원본을 현재 Resources·빌드·절감 합계에 합산하지 않는다. 현재 `Art/map/a2`도 A2R과 같은 경로가 아니다.

이 표의 정적 값은 실제 상주 텍스처 포맷·활성 파이프라인·실제 가청 voice·동시 표시 기하량·달성 FPS가 아니다. FBX는 제어점과 polygon index로부터 센 삼각형 환산이며 Unity 최종 스키닝 정점·UV 분리·LOD·패스 수와 다르다. Resources 후보 파일 수와 원본 byte도 제품 제외 가능량 또는 설치 감소량이 아니다. 후보 안 라이선스 고지는 별도 보존 대상이다.

## 4. 미확인 공백과 메우는 방법

아래는 **후속 조사·검증 방법 제안**이다. 이번 종합 작업에서 실행하지 않았다. 연구의 빈칸을 지우거나 매뉴얼의 확정 상수로 바꾸기 전에 필요한 증거를 적었다.

| 공백 | 현재 남아 있는 한계 | 메우는 방법과 남겨야 할 근거 |
|---|---|---|
| 연구 URL의 정확성·현행성 | **연구 출처 URL은 재검증하지 않았다.** 특히 클라우드 다수는 검색 발췌뿐이며 제목·요약·본문의 범위가 다름 | 후속 원문 검증에서 URL·저자·날짜·버전·직접 읽은 절을 기록. 같은 발표의 재전재를 묶고 주장별 뒷받침 여부를 대조. 실패한 접근은 그대로 남김 |
| 공통성의 독립 근거 | 체크리스트의 ‘3편 이상’은 기억 기반. D4 기사 여러 개가 같은 발표를 복제했을 수 있음 | 게임·상황별 원천 근거 행렬 작성. 직접 자료를 확보한 작품만 교집합으로 셈. 근거가 없는 장르 상식은 가설로 유지 |
| 黄天의 실제 분위기 | 클라우드 연구는 영상·이미지를 보지 않았고 실제 광원 방향·안개 층·색을 모름. 장면 레시피 전부 자체 기준 | 지정 공개 영상의 숲·늪·보스 장면을 직접 관찰해 장면 식별자·시간 구간·보이는 현상·추론을 구분. 색온도 느낌을 실제 Kelvin 설정으로 확정하지 않음 |
| 黄天 엔진·개발팀 연결 | UE5는 이전 팀명 모집글 검색 발췌 단일 단서. 현재 팀과의 연결·엔진 유지 여부 미확인 | 모집글 원문·작성자·날짜와 팀명 연결의 1차 근거 확인. 후속 개발자 자료가 없으면 ‘UE5 단일 단서’ 이상으로 올리지 않음 |
| 키샷 관찰 | **`codex_keyshot_composition`은 이미지 직접 관찰 미완.** 이미지 좌표·비율 측정값 없음 | 실제 게임플레이 스크린샷과 캡슐을 분리해 이미지 고유 ID·출처·장면을 남기고 직접 대조. 제안 좌표와 관찰값을 별도 열로 관리. Steam 규격 조사 완료를 구도 관찰 완료로 쓰지 않음 |
| 타격감 수치 | **`codex_combat_impact`는 수치 공백이 큼.** PBZ/Hades/D4/PoE2의 정지 ms·임펄스·넉백·섬광·동시 레이어 수 대부분 미확인 | 개발자 정량 자료를 우선 찾고, 없으면 조건이 있는 공개 측정 보고를 확보. 영상 분석은 이후 허용 범위에서 실제 fps·PTS·편집 여부·계수 경계·오차·대상을 함께 기록. 영상으로 엔진 상수를 확정하지 않음 |
| 프레임 데이터 충돌 | Elden Ring·Sekiro의 판본·계수 경계 차이를 해소하지 못함. 일부 위키는 색인 발췌만 확인 | 원 측정 기록·패치·시간 기준을 대조. 공격 총시간/무적/패링창/경직의 정의를 맞춘 뒤 비교. 해소 못 하면 양쪽을 유지하며 새 목표값을 만들지 않음 |
| 원근 픽셀 품질 | 최적 RT 크기·FOV·거리별 무기 두께·시간 필터·스냅 격자 미정 | 동일 카메라에서 근·중·원거리·전후/좌우 이동·회전·공격을 비교. 색/깊이/ID 변형 일치와 최종 1x 방향 판독을 기록. 직교 성공을 원근 전체 깊이에 확대하지 않음 |
| 가림 합성 | D4 실제 환경 페이드 알고리즘 미확인. 별도 리그 RT와 월드 깊이의 결합도 미검증 | 카메라/버퍼/레이어/합성 순서 도식과 부분 가림 장면 확보. 월드 깊이와 캐릭터 깊이를 비교할 수 있는지 먼저 확인. 페이드·실루엣·발밑 표시의 실패 상황을 따로 검토 |
| 안개·광원·후처리 | 높이 안개 상한·색·배치·톤매퍼 우열과 적정 대비가 전부 제안. 낮은 안개도 시선 경로를 덮을 수 있음 | 피치 34°·실제 FOV·출력·적 경로를 고정하고 기능을 한 변수씩 비교. 몸통·무기·발·바닥 예고를 이동 중 관찰. HDR/LDR·색공간·후처리 입력과 최종 합성을 함께 기록 |
| 베이크와 런타임 조립 | 정적 환경·움직이는 적·실시간 스킬·조립되는 지형의 APV/라이트맵 역할이 아직 미검증 | 씬 고정 범위와 런타임 생성 범위를 먼저 분리. 별도 RT 카메라/셰이더의 프로브 수신과 빛샘 확인. 베이크 시간·데이터 상주량과 동적 광원의 변화는 별도로 측정 |
| 설치 패키지·Renderer·API | 6000.0/17.0 문서, 6000.6 문서, master 소스, 다른 SHA의 패키지 목록이 섞임 | 후속 실행 담당이 설치 패키지 고정 버전·활성 Quality/URP Asset/Renderer/API를 기록. 지원 기능은 해당 조합에서 확인. Render Graph 호환·투명체 깊이·Metal을 독립 항목으로 검사 |
| 성능의 실제 병목 | **`our_tech_audit`는 정적 분석이며 실측 아님.** 전역 검색·목록 복사·적별 캡처·GUI는 후보일 뿐 | 동일 SHA Player에서 일반/remodel3d/rigpixel 옵션을 구분. CPU main/render/worker·GPU·GC 할당 스택·동시 적/가시 리그/카메라 요청·첫 사용/예열 뒤 비용을 연결. 정적 위험 순위를 측정 결과로 대체 |
| 프로젝트 기술 예산 | `codex_tech_budget`도 경쟁작의 메시·동시 적·VFX·CPU/GPU 세부 상한 대부분을 확보하지 못함 | 실제 목표 기기·출력·대표/최악 장면으로 우리 예산을 정함. 경쟁작의 상점 사양·부분 GI ms·월드 규모는 비교 맥락으로만 사용. 어택 티켓으로 부하를 숨기지 않음 |
| Resources·A2R·용량 | **Resources 2,751MB에 A2R은 미포함.** 현재 정밀 원본 집계와 별도 A2R ref만 있음. 설치·다운로드·메모리 감소량 없음 | 기준 SHA의 포함 명세→GUID/동적 키 의존성→플랫폼별 Build Report→설치/depot 크기를 연결. 현재 분모와 A2R 보존분을 분리. 파일 제외·압축·해상도 변경의 효과를 중복 합산하지 않음 |
| 미참조 후보 | 문자열 불일치·빈 native 출력·동적 미폐쇄 분류는 삭제 확정 아님 | 활성 씬/프리팹/머티리얼/폰트/FBX subasset 의존성과 데모의 실제 화면·폴백·오프라인 경로를 닫음. 라이선스 고지·provenance 보존을 포함한 검토 후에만 제외 판단 |
| HUD·메뉴 실물 | D4 비례는 자체 제안, 우리 치수는 과거 문서 기반. 기능 존재도 코드 수준일 수 있음 | 현행 화면별 계약과 실제 최종 출력의 정렬·히트 영역·포커스·쿨다운·물약·상태·엘리트 표시를 대조. 목업이나 검사 통과와 1x 사용성 판정을 분리 |
| 전리품 흐름 | 바닥 라벨·드롭음·필터 우회·줍기 등급·동적 토스트 번역의 실제 결합 미확인 | 드롭→발견→숨김/우회→습득→토스트→인벤토리 비교까지 한 흐름으로 확인. 표시 필터와 줍기 필터를 별도 항목으로 검사 |
| 소리의 청취·예산 | 직접 청취 없음. 버스 트리·라우드니스·보이스 가상화와 예고 보존 미검증 | 출력 장치·볼륨·프리셋·장면을 고정해 탐색/밀집 전투/보스 비교 청취. 전체 AudioSource군의 요청·real/virtual·생략 사유를 연결. 파형·로그만으로 인지 PASS를 주지 않음 |
| 음악 전환 | Hades의 구체 사례와 PoE의 수평 구간 계획이 다름. 우리 상태·마디·취소·복귀 미검증 | 실제 곡과 상태 사건을 정해 전환 예약·페이즈 위험 신호·사망/재시작/씬 이탈 정리를 검토. 스템 개수를 voice 상한으로 사용하지 않음 |
| 시네마틱 시간·입력 | 게임별 인트로/보스/클리어/사망의 실제 잠금·스킵 시간 대부분 없음 | 동일 사건·버전·초회/재회·언어·스킵 조건으로 구간을 분리. 대화 대기·로드·영상 재생·입력 수락을 구별하며 게시 영상 길이를 대입하지 않음 |
| 텍스트·언어 | 실제 폰트·폴백·아틀라스·현행 지원 언어 전체 출력 및 동적 문자열 검증 없음 | 최종 병합 문자열·문자 목록과 실제 화면을 대조. CJK 지역 자형·아랍어 혼합 방향/연결형·태국어 부호·숫자 서식·장문 버튼·자막 겹침을 언어별 확인. 글리프 존재만으로 완료하지 않음 |
| 접근성 범위 | XAG·GAG·기능 태그·프로젝트 서체 요구·작은 HUD 배율이 혼재 | 어느 기준을 어느 플랫폼/정보 유형에 적용할지 명시. 최종 몸체 높이·최저 합성 대비·확대 후 기능 보존을 확인. 특정 fontSize·1.25 배율만으로 충족을 선언하지 않음 |
| 도구 선택·제작 가능성 | 인일·입자 전환점·엔진 AI 우열·무료 도구만으로의 품질 달성은 미측정 | 같은 작은 변경 과제로 사람 개입·수정 반복·유지보수·빌드/화면 검증 비용을 비교. 엔진 이전·MCP 도입을 현재 고정 엔진 조건의 대체 결론으로 내지 않음 |

이번 산출물은 위 연구의 근거·차이·공백을 보존한 **문서 종합 완료**까지다. 실제 Player·게임 카메라·정상 속도 동작·청취·성능·설치 크기·사용자 수용은 검증하지 않았다. 입력 연구의 ‘현재’, ‘승인’, ‘PASS’ 표기는 해당 문서의 시점과 범위에만 남기며 이번 작업의 새 확인으로 쓰지 않는다.
