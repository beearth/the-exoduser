# TOOLS — Cascadeur: 물리 보조 키프레임 애니메이션(AutoPosing·AutoPhysics) (2026-11-05, 클라우드 조사)

출처(CTO 11-05 전달): 사용자 질문 "애니메이션같이 모션을 제작하면 안 되나" → 평가 ①. 공식 사이트(cascadeur.com)는 이 세션 네트워크에서 열리지 않아 전부 `[발췌]`다. Mac 실습 전 cascadeur.com/plans·help를 열어 수치를 대조한다.

## ① 목적 · 우리 파이프라인의 단계
- MO 브리프 §2의 동작 출처 후보에 **"키 포즈 손 제작 + 물리 보간"** 경로를 추가 평가한다. 모캡(D-MO-1 1순위 사용자 연기)과 Blender 손키(4순위) 사이의 선택지로, 키 포즈 5개만 잡고 중간을 물리로 만들어 "스크립트 키의 부자연스러움"(예비동작·무게 이동·팔로스루 부재)을 도구가 메울 수 있는지가 평가 질문이다.
- **무료 가능 여부(한 줄):** 학습·실습은 무료(Free)로 가능하지만 **Free는 .casc 저장만 가능하고 FBX/DAE 내보내기가 없어 Blender·Unity 반입이 불가**하다. 반입하려면 Indie(매출·펀딩 <$100k, 월 $19 또는 연 ~$96, 연간 결제 시 1년 뒤 영구 라이선스)가 필요 → **유료 승인 사안**(SPEND_LOG). 2026-11-04 가격 페이지 변경 보도(연간 플랜 제거) 있어 금액은 재확인.

## ② 입력 형식
- FBX(바이너리/ASCII) 또는 DAE의 **스킨된 캐릭터 + 스켈레톤**(Cascadeur는 스키닝을 만들지 못함 → TOOLS 1·2에서 완성한 공용 스켈레톤 FBX). 관절은 완전 직선이 아닌 **살짝 굽힌 포즈**가 Quick Rigging에 유리. Mixamo·Character Creator·UE 등 표준 스켈레톤은 Quick Rigging 프리셋, 우리 Humanoid식 이름 스켈레톤은 **수동 관절 지정**(프리셋 없음 → 실습에서 확인).

## ③ 옵션 전수표
| 옵션·항목 | 무엇을 바꾸나 | 우리 설정값 | 근거 출처(접속) |
|---|---|---|---|
| 플랜 Free / Indie / Pro / Teams | Free: 전체 애니 도구·리깅·물리·인비트위닝·언베이킹 포함, **.casc만 저장, 비상업**. Indie: FBX/DAE 내보내기, 상업 가능(매출·펀딩 <$100k), 우선 지원. Pro: 무제한 상업 + 리타깃·환경 상호작용·Scene linking·4족 AutoPosing. Teams: 팀 | 평가 = Free, 반입 필요 시 Indie(승인) | cascadeur.com/help/faq `[발췌]`; cascadeur.com/plans `[발췌]`; toolradar.com/tools/cascadeur(2026-11-04 변경 기록) `[발췌]`; capterra `[발췌]` |
| 가격 | Indie 월 $19 / 연 ~$96($8/월) · Pro 월 $49 / 연 ~$396 (상충: capterra €12/월, aisotools Pro $25) | 승인 전 미정 | 위 `[발췌]` `[미검증 — 상충]` |
| 구 Free("Basic") 제한 보도 | 120관절·300프레임 FBX 제한(2023 포럼) → 2024.1부터 Free는 .casc 전용으로 바뀜 | 참고만(현행은 .casc 전용) | daz3d 포럼 `[발췌]`; cascadeur.com/blog 2024.1 `[발췌]` |
| 가져오기 형식 | 바이너리 FBX·ASCII FBX·Collada 모두 가능, 임포트 대화상자 기본값 | 바이너리 FBX, 기본값 | cascadeur.com/help/getting_started/import_fbxdae `[발췌]` |
| Quick Rigging Tool: 프리셋(Mixamo·CC·UE·Daz…) / 수동 관절 지정 → Add rig elements → Generate rig | 리그 포인트·림 생성 | 수동: root는 건너뛰고 pelvis(Hips)부터 지정, 손가락은 생략 가능 | cascadeur.com/help/…/working_with_character_creator `[발췌]`; using_mixamo_rig `[발췌]` |
| 리그 요구: 스키닝 외부 제작, 림은 살짝 굽힘 | 리그 성공 조건 | TOOLS 1 리그를 A-포즈·팔꿈치/무릎 5° 굽힘으로 내보냄 | 〃 |
| AutoPosing | 몇 개 컨트롤 포인트(손·발·골반·머리)만 움직이면 전신 포즈를 AI가 보완 | 키 포즈 5개 잡기 단계에 사용 | cascadeur.com/help/rig/rig_structure/behaviors(AutoPosing Info/Link) `[발췌]`(도구 페이지 본문 미확인 `[미검증]`) |
| AutoPhysics: Fulcrum Points(자동 인식, NotFulcrum 강제 가능) | 지면·물체 접촉점. 없으면 탄도(점프) 운동만 | 발 접지 프레임에 Fulcrum 강제, 베기 중 디딤발 유지 | cascadeur.com/help/tools/physics_tools/autophysics/fulcrum_points `[발췌]` |
| AutoPhysics Common: Fulcrum 보간 프레임 15, 고스트 첫/끝 포즈 보간 15, Ballistic iterations 1000 | 물리 보정 범위·정밀도 | 기본(15/15/1000), 접점 틱 전후 ±2프레임만 보정하도록 구간 지정 | cascadeur.com/help/category/230 `[발췌]` |
| 인비트위닝(중간 프레임 생성)·Animation Unbaking(모캡→키 축소) | 키 사이 자동 보간, 베이크 역변환 | 키 5개 → 보간, 결과를 Unbaking하지 않음 | cascadeur.com/help/faq `[발췌]` |
| 애니메이션 레이어(2026.2) | 레이어 편집 | 예비·팔로스루 과장을 별 레이어로 | cgchannel.com 2026-08 2026.2 `[발췌]` |
| 씬 프레임레이트 | 30/60 fps 설정 위치 | **30 fps**(Core 틱과 1:1 매핑은 ① 타이밍 표에서 환산) — 설정 위치 미확인 | `[미검증]`(검색 무결과) |
| 내장 Video Mocap | 영상→동작, **Alpha**, 느림·정확도 낮음(공식 2023.1 공지) | 쓰지 않음(video_to_motion.md의 전용 서비스 비교) | cascadeur.com/blog 2023.1 `[발췌]`; help/category/203 "Mocap (Alpha)" `[발췌]` |
| 내보내기 FBX → Unity | Unity에서 애니 FBX 별도 임포트, Rig = Humanoid, Avatar = Copy From Other Avatar(스켈레톤), Preserve Hierarchy | TOOLS 1 ⑤ 규칙과 동일 | cascadeur.com/help/getting_started/export_fbxdae/export_to_unity `[발췌]` |
| 내보내기 FBX → Blender | FBX 임포트 뒤 NLA에서 타이밍 손질(MO ④) | TOOLS 1 FBX 옵션 | 〃(Blender 전용 페이지 미확인) |
| 우리 공용 스켈레톤 호환 | Rigify DEF 재부모화 + Humanoid식 이름(TOOLS 1)은 "표준 스켈레톤" 프리셋이 아님 → 수동 Quick Rigging. Pro의 Retargeting 없이도 같은 스켈레톤이면 리타깃 불필요 | Free에서 리깅 성공 여부가 1차 실습 판정 | 추론(프리셋 목록 미확인 `[미검증]`) |

## ④ 절차 — 실습 과제 "대검 수평 베기 키 포즈 5개 → 중간 자동 생성" (Mac)
전제: Core 틱 표(D-MO-2 기본 공격 1타 예비 6틱, 총 길이 유지)에서 틱 0/6/8/11/39를 30 fps 프레임으로 환산(틱 길이는 MO ① 타이밍 표의 값, 여기서는 **1틱 = 1프레임 가정 `[미검증]`**).
1. 입력: `CH_<영웅>_Skel.fbx`(TOOLS 1, A-포즈·관절 5° 굽힘) + 대검 메시는 `Weapon_R` 소켓 본에 미리 부모화한 상태로 FBX 1개.
2. Cascadeur Free 설치(Mac, 사용자 로그인) → Import FBX 기본값 → Quick Rigging 수동 지정(Hips→Spine→…→Hand, 손가락 생략) → Generate rig.
3. 키 포즈 5개(AutoPosing으로 잡기): f0 대기(무게 양발) / f6 예비 끝(검 뒤로, 무게 뒷발, 상체 비틀림 최대) / f8 접점(검 수평, 무게 앞발, 골반 선행) / f11 팔로스루 끝(검 반대편, 상체 과회전) / f39 복귀(대기). 각 키에 Fulcrum: 양발 접지(f8은 앞발 접지·뒷발 NotFulcrum).
4. 인비트위닝 → AutoPhysics(구간 f0~f39, 기본 15/15/1000) → 결과 재생. 접점 f8이 밀리면 f8 키를 고정(핀)하고 재실행.
5. 기대 출력: Free = `.casc` + **오프스크린 영상(10초 무음, 33° 피치 유사 뷰)**; Indie 승인 시 `CH_<영웅>_A_attack1_casc.fbx`(30 fps) → Blender NLA 확인 → Unity Humanoid(Copy From Other Avatar) → PixelActorPass 캡처.
6. 비교판: Blender 스크립트 키(현행) ↔ Cascadeur 보간 ↔ (있으면) 모캡, 같은 프레임 f6/f8/f11 3장 + 10초 영상.

## ⑤ 출력 형식 · 네이밍
- `.casc`(Free) / FBX 30 fps(Indie+): `CH_<영웅>_A_<동작>_casc.fbx`. 키 포즈 표(프레임·Fulcrum 상태·컨트롤 값)를 MOTION_PIPELINE §4에 기록.

## ⑥ 검수 방법
- MO 브리프 채점 7항목(예비·무게 이동·팔로스루·발 미끄러짐·전환·Core 타이밍 일치·포즈) ○× — 목표 ○6/7.
- 접점 프레임이 타이밍 표와 0프레임 차. 1x 픽셀 렌더에서 예비→접점 무게 이동이 읽히는지(사용자 판정).

## ⑦ 금지 · 흔한 실패
- Free 산출물을 상용 빌드에 넣는 것(비상업 라이선스 + .casc 전용).
- 직선 관절 리그 임포트(Quick Rigging 실패).
- AutoPhysics를 전 구간에 켠 채 접점 키가 밀리는 것(접점 키 핀 고정, 보정 구간 제한).
- 내장 Video Mocap(Alpha)로 결과를 만드는 것.
- "출처 없는 절차 생성 금지"와의 관계: 이 문서의 절차는 공식 help 페이지 발췌(위 URL)에 근거하고, 실습 때 **실제 UI 설정 캡처·키 포즈 표·버전 번호**를 ⑧에 남긴다. 발췌로 못 확인한 항목(fps 설정 위치, AutoPosing 도구 옵션, 프리셋 목록)은 실습에서 help 원문을 열어 채우기 전까지 `[미검증]`으로 둔다.

## ⑧ 실습 기록
- Mac 실습 대기. 기록: Cascadeur 버전·플랜, 리깅 성공/수동 지정 관절 수, 키 포즈 표, AutoPhysics 설정, 영상 경로, 채점표, SHA. 유료 승인 시 SPEND_LOG 기록.
