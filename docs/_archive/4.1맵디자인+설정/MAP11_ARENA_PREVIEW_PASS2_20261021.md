# MAP11-01b — 원형 축소·피부 바닥/조명 proof

> 후속: 맥북총괄 1x 눈 검수 RETOUCH(바닥 단조·배우 접지 부재·낮은 국소광 대비)를 반영한 [MAP11-01c 3차 proof](MAP11_ARENA_PREVIEW_PASS3_20261021.md). 아래 수치는 01b 이력으로 보존한다.

STATUS=REVIEW_PENDING. 사용자 D05 **원형 유지·조금 작게**를 R1700 시작안으로 반영했다. 형태·축소 방침은 확정, 이 수치와 material proof의 시각 인수는 맥북총괄 검수 대기다. 제품 main 연결0. 최신 main `ac3764bfe5476b56e2f2388b1f2d9baeff731885`에 인수된 1차 `3c2b1ea45bd103564f03898c5000b4f78b87844d`를 merge한 `f612dbee`가 작업 기준이다. 사용자 메시지 앞부분의 같은 branch 표현보다 명시 경로/브랜치 규칙을 따라 `codex/map11-01b-20261021`로 제출한다. 다른 담당 WIP 반입0, rebase0.

| 항목 | 1차 3c2b1ea4 | 2차 판단·결과 |
|---|---|---|
| 공간·동선 | R2200/직경4400, 면적 약1520만 | **R1700/직경3400**, 반지름−22.7%·면적−40.3%. 무기둥/256분절 rim 유지. 내부 물리 장애물0, 회피 고리 R1300. Entry(0,800)/Boss(0,0)/Exit(0,−1420)/Return(0,1320). Marker는 제품 gate/exit writer 아님 |
| 카메라·몸체 | 입장zoom.42/카메라(0,610), Entry y1450 | 입장zoom**.65**/카메라(0,180), Entry y800. 동일 sprite 표시 크기 **1.548배**(줌비, 실측 키 주장이 아님). 원본 player시각scale2.5/r15·boss높이620.4/r44 고정. 근접.88/벽가.76/클리어.68, 전체 공간.205→.27. 보스 bbox·플레이어 모두 입장 프레임 안. 맵 크기로 공격을 약화0 |
| 바닥·조명 | 단색 그라데이션/9개 낮은 동맥, 비어 보임 | 기존 `assets/map/ch1_si1/ground_dark_soil.png` RGBA를 polygon UV 반복+자체 `skin_floor.gdshader`로 저채도 피부 재착색/고주파 대비 억제. 생성 이미지0/원에셋 수정0. 낮은 암색 균열+좁은 심장빛 중심선, 약한 냉광·균열 적색 rim과 바깥 생체 숲의 대비. 실제 main MAP-LOOK 광원/그림자/흔들림 그대로 재사용(8light/2shadowlight/51shadow·occluder). 남북 아치/북 제단 재배치, 기존 8종 tree/시체나무/고치 RGBA 유지 |
| BC01~10 공간 | 중심slam 여유880/tide450, fissure끝104·전체795.2 밖 | 중심slam1320 여유**380**, tide1750은 **50** 밖. fissure2304 끝**604**, 폭발691.2 포함 **1295.2** 밖. charge1750은 지름3400 안에서 배치 가능하나 벽 근처 시작 시 접촉 가능. fan16/rhythm9/ORB3 ±.14·r26 요청 geometry는 원값 유지. 외곽을 넘는 표시선은 허용된 벽 접촉 표시이며 실제 충돌 consumer 실행/전 패턴 생존성 확정 아님 |
| UI·색 대비 | NotoSerif 단일 서체, D05_PENDING | 단일 공급자 `native_ui_fonts.gd`의 hell 본문/Nanum명조·hell_title/Cinzel Decorative 재사용, 뼈색#dfd6c2/흑철판/금빛 헤어라인. 작은 뼈색 바닥 링은 preview 위치 가독성만 돕고 hitbox/QE 경고가 아님. 표시 텍스트는 번역대상_전체목록에 등록(EN 개발용·KO/기타 미번역). 외곽 노출 조직/눈/고치 D02 강함 유지. 저채도 바닥과 밝은 탄 geometry는 구별되나 실제 Q/E·전투 동시 가독성은 제품 연결 후 검수 |
| 캡처 | 01~06 + literal1x | `_out/map11-01b/captures/` 입장/근접/벽가/클리어 4장+body/탄막 2장, 각1920×1080·1x crop6장. 각 JSON에 crop좌표/줌/preview tick 기록, manifest SHA. `BOARD.html`에서 1차와 비교. 초기 거친 proof-01은 별도 폴더에 보존하고 최종으로 오인하지 않음 |

| 기술 검수 | 수치·범위 |
|---|---|
| 직접 테스트 | MAP11_RESULT {"checks":34,"d05":"circular smaller","failures":0,"live_combat":false}. 신규 격리 EXODUSER-map11-01b-Isolated-20261021; 기존 MAP-LOOK은 파일 상수 EXODUSER-MapLook-Isolated-20261020. 관련 각1회, 실패 외 반복0. 신규34/0·회귀16/0, ERROR0; 회귀 미수정main.gd:258 Camera2D WARNING1(원문 별도 보존), 신규/캡처 WARNING0. 실제 물리 rim 접촉/빈 중심·회피고리, source envelope·Marker 검증 |
| 120fps 예산 실측 | 고정600물리tick@60Hz + warm120, 벽시계 10.000336s / render5015 / 평균501.48fps / p95≤2.36ms / p99≤2.81ms / draw평균52.36. 1080p/M5 Pro24GB/Godot4.7.2 OpenGL compatibility/uncapped·vsyncOFF. 목표8.33ms, 하한16.67ms. 1차769.17fps는 이전 작업1회 측정 참고이며 동일시각 A/B 재측정 아님. 이번 고정N 벽시계 벤치1회. preview 자체 render+독립 physics만이며 실제 AI·탄·전투·전체 데모/PC 성능이나 GPU3ms 예산 검증 아님. GPU timer 없음; driver CPU 값은 맵 전체 CPU와 다름 |
| 공용·보호 | **Main0/State0/World0/Player0/hud0/project설정0줄**, 공용 파일별 변경 줄 범위 없음. 이동·패링·방패·분노·hurtE/hurtP·docs/2_3·저장0. 자체 preview CharacterBody 입력만 기존1차 유지. MAP-LOOK/공용 폰트 공급자·JSON 수정0. 신규 scene독립, 제품 main_scene 불변 |
| 틱·실행 안전 | own tick/get_method_list/get_script_method_list/목록생성 API0. Texture·font·geometry는 초기화 캐시, 고정 histogram 사전할당. MAP-LOOK `_scan_fx_lights`는 빈table 즉시return, 모듈 install 미호출. 매Godot exact pgrep≥2면30초 대기 로그 보존, override 매실행 격리 설정 후0byte, 실제 사용자 저장 접근0 |

원본 근거는 **이번 main game.html** G10963(보스 dh14.1), G37931–37948(fissure maxLen·explR), G37949–37963(tide maxR1750), G40664–40708(charge/점프), G40837–40867(grab), G40942–40977(multiDash), G41047–41072(burrow), G41074–41183(slash/sweep/slam) 및 `native_ch1_boss_catalog.gd` stage0 최종23종을 그대로 따른다. BC09 geometry 상세는 1차 보고서와 기존 모듈을 재사용했다. 원본/BC01~10 수정0. WORK_BOARD MAP-LOOK/MAPLOOK 모듈 담당 경로는 참조만 했으며 이 단위는 maps/map11 소유 leaf다.

MAP PRODUCTION REPORT (§23): STAGE=CH1-1 bossroom pass2, MASTER=원형R1700/남entry·북exit·중앙boss/무기둥, OUTER MASS=생체 숲 2층·노출조직/눈/고치, GROUND=기존RGBA 피부 proof·균열 심장선·차가운 환경광, PLAYABLE=독립 rim/이동·회피고리, LANDMARK=북 시체나무/제단과 보스 실루엣, CAMERA QA=4시점+2overlay+1x 눈 검수. **VISUAL VERDICT=REVIEW_PENDING / ART RETOUCH**: 1차보다 거리감 개선·바닥 표면 proof 추가, 벽가 가지/플레이어 부분 겹침·균열 선의 임시 조형과 반복 지형은 후속 아트 검수 대상. 바닥 재질은 최종 아트 승인으로 승격하지 않음. TECH QA=위 직접 테스트/단1회 벤치. FILES=자체 preview/shader/test·관련문서·번역등록·CHANGELOG만, GIT=자기branch 정상push/remoteSHA/DONE 후 자기WT제거. DEMO11-37/38과 제품 gate/clear 연결은 후속 담당 범위.
