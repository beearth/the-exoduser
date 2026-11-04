# docs/_archive 색인

2026-11-03 docs 정리에서 보관한 문서 목록이다. 삭제가 아니라 원래 상대 경로 그대로 `docs/_archive/<경로>`로 옮겼다. 정본은 `origin/unity/main`이다.

- 보관 575개, 폴더 29곳. 후계 문서가 있으면 함께 적었다(경로는 이 색인 기준 상대 경로).
- 보관 계획 605개 중 30개는 docs 밖 코드(godot·tools·unity)나 핵심 문서(CLAUDE.md·AGENTS.md·DOCS_INDEX·WORK_MANUAL)가 직접 참조해 이번에 옮기지 않고 제자리에 두었다.
- unity/main에 없고 main에만 있던 27개는 origin/main 판을 그대로 보관 위치에 넣었다.
- 보관 기준: 더 새 문서로 대체된 옛판, 끝난 일회성 지시·보고·인계, 동결된 Godot/FDG 이식 과정 문서.
- "보관판"은 두 브랜치 내용이 달랐던 문서에서 어느 쪽 판을 보관했는지 표시한다.
- 같은 폴더의 비md 동반 파일(이미지·json·patch·csv)은 이번 적용에서 옮기지 않았다. 원래 위치에 그대로 있다.
- 이미 있던 보관물: `AUTOLOOP_STATE.md`(08-23), `rules-20261103/`(11-03 규칙 정리 원문).

## 폴더별 개수

| 폴더 | 보관 수 |
|---|---:|
| 0마스터플랜/session_handoff | 17 |
| 10ai에셋프롬프트모음 | 3 |
| 11내러티브·로어디자인 | 1 |
| 12퍼포먼스·최적화 | 7 |
| 13출시·마케팅 | 38 |
| 16영문화(i18n) | 1 |
| 2_1 스킬관리+합체시스템+자원 | 4 |
| 2_7 인벤토리+장비시스템 | 2 |
| 3.1 ui hud 디자인 | 1 |
| 3.3 키바인딩+설정 | 1 |
| 4.0케릭터스프라이트 디자인 | 1 |
| 4.1맵디자인+설정 | 39 |
| 4.1맵디자인+설정/qa_ch1_master_16x9 | 5 |
| 5.0애니메이션파이프라인 | 1 |
| 5.1임펙트디자인 | 2 |
| 6사운드디자인 | 1 |
| 7아이템디자인 | 2 |
| 8.0몬스터디자인 | 5 |
| 8.1보스디자인바이블 | 3 |
| 9적ai패턴디자인 | 1 |
| archetypes/silvertail | 1 |
| cinematic | 30 |
| engine | 219 |
| engine/orders | 1 |
| engine/orders/reports | 185 |
| engine/parity_refs/boss | 1 |
| engine/parity_refs/boss_mac | 1 |
| engine/parity_refs/integ12 | 1 |
| engine/parity_refs/map_ui | 1 |

## 0마스터플랜/session_handoff (17)

| 문서 | 후계 | 이유 |
|---|---|---|
| [combat-feel.md](0마스터플랜/session_handoff/combat-feel.md) | — | 웹 전투 손맛 Codex 레인 인계(10-31). 11-03 웹 새 개발 중단으로 끝남. 후계 없음(증거는 I:/EXODUSER-Storage/combat-feel/20261031/REPORT.md) |
| [cto.md](0마스터플랜/session_handoff/cto.md) | [AGENT_OPERATIONS_MANUAL.md](../0마스터플랜/AGENT_OPERATIONS_MANUAL.md) | 10-28 09:40 CTO 인계. Sonnet 단순 세션 시절이라 낡음. 링크 없음 |
| [design-lead-a1ef.md](0마스터플랜/session_handoff/design-lead-a1ef.md) | [design-director.md](../0마스터플랜/session_handoff/design-director.md) | 10-26 중복 디자인 총괄 세션 인계. eb8a8577로 통합 |
| [simple-sonnet-2.md](0마스터플랜/session_handoff/simple-sonnet-2.md) | [boss-lead.md](../0마스터플랜/session_handoff/boss-lead.md) | 10-26 Sonnet 단순작업2 인계. Sonnet 단순 세션은 10-28 폐지 |
| [simple-sonnet-3.md](0마스터플랜/session_handoff/simple-sonnet-3.md) | [map-lead.md](../0마스터플랜/session_handoff/map-lead.md) | 10-27 Sonnet 단순작업3 인계. 폐지된 세션 |
| [simple-sonnet-4.md](0마스터플랜/session_handoff/simple-sonnet-4.md) | [unity-lead-59ad.md](../0마스터플랜/session_handoff/unity-lead-59ad.md) | 10-26 Sonnet 단순작업4(Unity 이식팀) 인계. 이식 단계 종료·세션 폐지 |
| [simple-sonnet-unity.md](0마스터플랜/session_handoff/simple-sonnet-unity.md) | [unity-lead-59ad.md](../0마스터플랜/session_handoff/unity-lead-59ad.md) | 10-28 Sonnet→Codex 이관 브리프. 일회성 인계 |
| [sound-simple.md](0마스터플랜/session_handoff/sound-simple.md) | [sound-lead.md](../0마스터플랜/session_handoff/sound-lead.md) | 10-28 Sonnet 사운드 단순 세션 이관 인계 |
| [story-simple.md](0마스터플랜/session_handoff/story-simple.md) | [story-lead.md](../0마스터플랜/session_handoff/story-lead.md) | 10-28 Sonnet 스토리 단순 세션 인계. 폐지된 세션 |
| [transitions.md](0마스터플랜/session_handoff/transitions.md) | [SCREEN_TRANSITIONS_20261102.md](<../3.1 ui hud 디자인/SCREEN_TRANSITIONS_20261102.md>) | 웹 화면 전환 Codex 레인 인계(11-02). 웹 새 개발 중단. 계약은 전환 SSOT에 있음 |
| [unity-m1-sonnet.md](0마스터플랜/session_handoff/unity-m1-sonnet.md) | [unity-lead-59ad.md](../0마스터플랜/session_handoff/unity-lead-59ad.md) | 10-28 Sonnet M1 HUD 세션의 Codex 이관 브리프 |
| [unity-mac-lead.md](0마스터플랜/session_handoff/unity-mac-lead.md) | [unity-lead-59ad.md](../0마스터플랜/session_handoff/unity-lead-59ad.md) | 10-26 이식 맥북 총괄 인계. 이식 단계 종료로 대체 |
| [unity-overall-lead.md](0마스터플랜/session_handoff/unity-overall-lead.md) | [unity-lead-59ad.md](../0마스터플랜/session_handoff/unity-lead-59ad.md) | 10-26 이식 100% 전체총괄 인계. 이식 단계 종료로 대체 |
| [unity-rm0.md](0마스터플랜/session_handoff/unity-rm0.md) | [map-lead.md](../0마스터플랜/session_handoff/map-lead.md) | 10-28 RM-0 Sonnet 세션 정리 인계. 일회성 Codex 브리프 |
| [unity-rmb1.md](0마스터플랜/session_handoff/unity-rmb1.md) | [boss-lead.md](../0마스터플랜/session_handoff/boss-lead.md) | 10-28 RM-B1 드루이드 Sonnet 세션 정리 인계. 보스전 총괄 인계가 대체 |
| [unity-visual-20261029.md](0마스터플랜/session_handoff/unity-visual-20261029.md) | [design-director.md](../0마스터플랜/session_handoff/design-director.md) | 10-29~30 Unity 시각 Codex 레인 재개 영수증. 링크 없음 |
| [vfx-simple.md](0마스터플랜/session_handoff/vfx-simple.md) | [vfx-lead.md](../0마스터플랜/session_handoff/vfx-lead.md) | 10-28 Sonnet VFX 단순 세션 인계. 폐지된 세션 |

## 10ai에셋프롬프트모음 (3)

| 문서 | 후계 | 이유 |
|---|---|---|
| [CRUCIFORM_FRONT_BASE_20260928.md](10ai에셋프롬프트모음/CRUCIFORM_FRONT_BASE_20260928.md) | [VIDEO_CHARACTER_BASES_20260928.md](../10ai에셋프롬프트모음/VIDEO_CHARACTER_BASES_20260928.md) | 문서 스스로 '이전 시안'(남녀 구도 유지로 정정). GROK2_GAME_POSTERS·VIDEO_CHARACTER_BASES 링크 수정 |
| [GROK2_ENSEMBLE_TEST_20260928.md](10ai에셋프롬프트모음/GROK2_ENSEMBLE_TEST_20260928.md) | [GROK2_GAME_POSTERS_20260928.md](../10ai에셋프롬프트모음/GROK2_GAME_POSTERS_20260928.md) | 09-28 단체 포스터 비교 시안 1회 기록. 런타임 미연결, 링크 없음 |
| [GROK2_INDIVIDUAL_TEST_20260928.md](10ai에셋프롬프트모음/GROK2_INDIVIDUAL_TEST_20260928.md) | [GROK2_GAME_POSTERS_20260928.md](../10ai에셋프롬프트모음/GROK2_GAME_POSTERS_20260928.md) | 개별 재생성 비교 시안 1회 기록. 링크 없음 |

## 11내러티브·로어디자인 (1)

| 문서 | 후계 | 이유 |
|---|---|---|
| [SILVERTAIL_STORY_DRAFT_20261028.md](11내러티브·로어디자인/SILVERTAIL_STORY_DRAFT_20261028.md) | [SILVERTAIL_STORY_CANON_20261028.md](../11내러티브·로어디자인/SILVERTAIL_STORY_CANON_20261028.md) | 첫 줄에 '폐기' 명시. AI 초안이 CANON으로 대체 |

## 12퍼포먼스·최적화 (7)

| 문서 | 후계 | 이유 |
|---|---|---|
| [DEMO11_ENEMY_FIXED_TICK_PROFILE_20261021.md](12퍼포먼스·최적화/DEMO11_ENEMY_FIXED_TICK_PROFILE_20261021.md) | — | 동결 Godot DEMO11 적 fixed-tick 측정. 링크는 CHANGELOG_SYNC뿐 |
| [GODOT_METHOD_LIST_TICK_COST_20261021.md](12퍼포먼스·최적화/GODOT_METHOD_LIST_TICK_COST_20261021.md) | — | Godot 포트 물리 틱 비용 기록. Godot 동결 |
| [GODOT_SOURCE_VALIDATION_PASS_MEMO_20261022.md](12퍼포먼스·최적화/GODOT_SOURCE_VALIDATION_PASS_MEMO_20261022.md) | — | Godot PC-SOURCE-PERF 검증 메모. Godot 동결 |
| [MAC_ENEMY_DENSITY_INVESTIGATION_20260910.md](12퍼포먼스·최적화/MAC_ENEMY_DENSITY_INVESTIGATION_20260910.md) | [MAC_DEFAULT_WEBGPU_FPS_20260910.md](../12퍼포먼스·최적화/MAC_DEFAULT_WEBGPU_FPS_20260910.md) | 'OPEN'에서 멈춘 Mac 20FPS 조사. 기본 WebGPU 전환·120FPS 확인으로 대체. 링크 0 |
| [MAC_RENDERER_OPTIN_TEST_20260910.md](12퍼포먼스·최적화/MAC_RENDERER_OPTIN_TEST_20260910.md) | [MAC_DEFAULT_WEBGPU_FPS_20260910.md](../12퍼포먼스·최적화/MAC_DEFAULT_WEBGPU_FPS_20260910.md) | 머리말에 '이전 선택 비교의 이력'. 링크는 CHANGELOG_SYNC뿐 |
| [VRAM_01_TEXTURE_BUDGET_20261022.md](12퍼포먼스·최적화/VRAM_01_TEXTURE_BUDGET_20261022.md) | — | Godot 4.7.2 Mac 텍스처 예산 측정(PARTIAL). Godot 동결 |
| [WebGL2_인스턴싱_전환계획.md](12퍼포먼스·최적화/WebGL2_인스턴싱_전환계획.md) | [GPU_이관_적용성_조사와_실행_로드맵_2026-08-09.md](../12퍼포먼스·최적화/GPU_이관_적용성_조사와_실행_로드맵_2026-08-09.md) | 05-21 전환 계획. GPU_이관 로드맵이 '선행 문서'로 대체. 맨 위 Godot 절 섞임 |

## 13출시·마케팅 (38)

| 문서 | 후계 | 이유 |
|---|---|---|
| [DESKTOP_LATEST_BUILD_20260929.md](13출시·마케팅/DESKTOP_LATEST_BUILD_20260929.md) (main판) | — | 09-29 바탕화면 테스트 빌드 일회성 기록. 지금은 Unity BuildLoop가 대신함. 차이는 개명뿐이라 main판 보관 |
| [FRESH_CAPTURE_MANIFEST_20261008.md](13출시·마케팅/FRESH_CAPTURE_MANIFEST_20261008.md) | [HERO_TRAILER_PRODUCTION_20261008.md](../13출시·마케팅/HERO_TRAILER_PRODUCTION_20261008.md) | 10-08 웹 촬영 manifest(일회성). 후속 촬영은 HERO 제작 기록으로 넘어감 |
| [FULL_SOURCE_CHECKPOINT_20260909.md](13출시·마케팅/FULL_SOURCE_CHECKPOINT_20260909.md) | — | 09-09 전체 커밋·푸시 일회성 기록. CHANGELOG만 링크 |
| [GAMEPLAY_TRAILER_20260908_PLAN.md](13출시·마케팅/GAMEPLAY_TRAILER_20260908_PLAN.md) | [GAMEPLAY_TRAILER_V2_20260909.md](../13출시·마케팅/GAMEPLAY_TRAILER_V2_20260909.md) | 초기 촬영 구성. PRODUCTION→V2로 대체 |
| [GAMEPLAY_TRAILER_20260909_PRODUCTION.md](13출시·마케팅/GAMEPLAY_TRAILER_20260909_PRODUCTION.md) | [GAMEPLAY_TRAILER_V2_20260909.md](../13출시·마케팅/GAMEPLAY_TRAILER_V2_20260909.md) | V1 제작 기록. 문서 자체가 V2를 최신으로 안내 |
| [GSTAR_2026_SCREENSHOTS_20260914.md](13출시·마케팅/GSTAR_2026_SCREENSHOTS_20260914.md) | — | 지스타 제출 사진 선정을 마친 일회성 기록. 링크 없음 |
| [HERO_TRAILER_PROMOTION_REVIEW_20261008.md](13출시·마케팅/HERO_TRAILER_PROMOTION_REVIEW_20261008.md) | [HERO_TRAILER_PRODUCTION_20261008.md](../13출시·마케팅/HERO_TRAILER_PRODUCTION_20261008.md) | 홍보팀 검토·소재 인계 일회성 기록. 결과는 제작 기록에 반영 |
| [LAPTOP_MIGRATION_CHECKLIST_20261001.md](13출시·마케팅/LAPTOP_MIGRATION_CHECKLIST_20261001.md) | — | 10-01 Mac 노트북 이전 준비, 끝난 일회성 문서. PMM 이력 절 링크 수정 |
| [LATEST_WEB_RELEASE_20260910.md](13출시·마케팅/LATEST_WEB_RELEASE_20260910.md) | [WEB_DEPLOYMENT_REPAIR_20261002.md](../13출시·마케팅/WEB_DEPLOYMENT_REPAIR_20261002.md) | 09-10 웹 배포 기록. 현행 웹 배포 대장으로 대체 |
| [LATEST_WINDOWS_BUILD_20260929.md](13출시·마케팅/LATEST_WINDOWS_BUILD_20260929.md) | [PC_PACKAGING_20260910.md](../13출시·마케팅/PC_PACKAGING_20260910.md) | 09-29 Windows 빌드 패치 일회성 기록. 링크 없음 |
| [MAC_ENVIRONMENT_HANDOFF_20261001.md](13출시·마케팅/MAC_ENVIRONMENT_HANDOFF_20261001.md) | — | 10-01 Mac 환경 인수서. 인수가 끝난 handoff |
| [MAP_INTRO_20260909.md](13출시·마케팅/MAP_INTRO_20260909.md) | — | 웹 30초 맵 소개 제작 기록 + 동결 FDG native 절. 현행 링크 없음 |
| [PC_TRANSFER_READY_20261001.md](13출시·마케팅/PC_TRANSFER_READY_20261001.md) | — | PC→Mac 자료 인수 일회성 기록. PMM 이력 절 링크만 수정 |
| [PUBLISH_20260928_LFS_HISTORY.md](13출시·마케팅/PUBLISH_20260928_LFS_HISTORY.md) | [VERCEL_UPLOAD_FAILURE_20260913.md](../13출시·마케팅/VERCEL_UPLOAD_FAILURE_20260913.md) | 09-28 누적 게시 일회성 기록. LFS 계약은 VERCEL 문서에 있음 |
| [PUBLISHER_BUILD_1005_20260929.md](13출시·마케팅/PUBLISHER_BUILD_1005_20260929.md) | [PUBLISHER_UPDATE_20261003.md](../13출시·마케팅/PUBLISHER_UPDATE_20261003.md) | 퍼블리셔 빌드 전달 옛판. 10-03 갱신 대장으로 대체 |
| [PUBLISHER_DELIVERY_20261001.md](13출시·마케팅/PUBLISHER_DELIVERY_20261001.md) | [PUBLISHER_UPDATE_20261003.md](../13출시·마케팅/PUBLISHER_UPDATE_20261003.md) | 10-01 3사 발송 완료 기록. 10-03 대장이 최신 |
| [PUBLISHER_DELIVERY_RESUME_20260929.md](13출시·마케팅/PUBLISHER_DELIVERY_RESUME_20260929.md) | [PUBLISHER_UPDATE_20261003.md](../13출시·마케팅/PUBLISHER_UPDATE_20261003.md) | 발송 준비 재개 09-29 일회성 기록 |
| [PUBLISHER_EMAIL_PREPARATION_20261001.md](13출시·마케팅/PUBLISHER_EMAIL_PREPARATION_20261001.md) | [PUBLISHER_UPDATE_20261003.md](../13출시·마케팅/PUBLISHER_UPDATE_20261003.md) | 메일 초안 준비 기록. 발송·갱신 끝남 |
| [PUBLISHER_EMAIL_SCHEDULE_20260929.md](13출시·마케팅/PUBLISHER_EMAIL_SCHEDULE_20260929.md) | [PUBLISHER_UPDATE_20261003.md](../13출시·마케팅/PUBLISHER_UPDATE_20261003.md) | 09-29 예약 발송 일회성 기록 |
| [PUBLISHER_LATEST_BUILD_DELIVERY_20260929.md](13출시·마케팅/PUBLISHER_LATEST_BUILD_DELIVERY_20260929.md) | [PUBLISHER_UPDATE_20261003.md](../13출시·마케팅/PUBLISHER_UPDATE_20261003.md) | 09-29 빌드 제출 기록. 이후 재전달·갱신으로 대체 |
| [PUBLISHER_MOBILITY_PARRY_20260929.md](13출시·마케팅/PUBLISHER_MOBILITY_PARRY_20260929.md) | [PUBLISHER_REVIEW_20260929.md](../13출시·마케팅/PUBLISHER_REVIEW_20260929.md) | 기획서 한 절 수정 일회성 기록. 결과는 검토 자료 본문에 반영 |
| [PUBLISHER_PACKAGE_20261001_065134.md](13출시·마케팅/PUBLISHER_PACKAGE_20261001_065134.md) | [PUBLISHER_UPDATE_20261003.md](../13출시·마케팅/PUBLISHER_UPDATE_20261003.md) | 10-01 ZIP 패키징 일회성 기록 |
| [PUBLISHER_REDELIVERY_20260930.md](13출시·마케팅/PUBLISHER_REDELIVERY_20260930.md) | [PUBLISHER_UPDATE_20261003.md](../13출시·마케팅/PUBLISHER_UPDATE_20261003.md) | 09-30 재전달 기록. 링크 없음 |
| [PUBLISHER_SKILL_FUSION_BUILD_20260930.md](13출시·마케팅/PUBLISHER_SKILL_FUSION_BUILD_20260930.md) | [PUBLISHER_REVIEW_20260929.md](../13출시·마케팅/PUBLISHER_REVIEW_20260929.md) | 기획서 6쪽 수정 일회성 기록. 링크 없음 |
| [PUBLISHER_STORAGE_RECOVERY_20260929.md](13출시·마케팅/PUBLISHER_STORAGE_RECOVERY_20260929.md) | [PUBLISHER_UPDATE_20261003.md](../13출시·마케팅/PUBLISHER_UPDATE_20261003.md) | Drive 저장 공간 정리 일회성 기록 |
| [SKILL_TRAILER_V22_NEW_LOGO_20260909.md](13출시·마케팅/SKILL_TRAILER_V22_NEW_LOGO_20260909.md) | [GAMEPLAY_TRAILER_V22_20260909.md](../13출시·마케팅/GAMEPLAY_TRAILER_V22_20260909.md) | V22 로고만 바꾼 파생본 기록 |
| [SKILL_TRAILER_V23_20260909.md](13출시·마케팅/SKILL_TRAILER_V23_20260909.md) | [SKILL_TRAILER_V25_DAMAGE_TEXT_20260910.md](../13출시·마케팅/SKILL_TRAILER_V25_DAMAGE_TEXT_20260910.md) | V25가 V23 구성을 이어받은 최종 파생본. 현행 링크 없음 |
| [STEAM_DASHBOARD_AUDIT_20260909.md](13출시·마케팅/STEAM_DASHBOARD_AUDIT_20260909.md) | [STEAM_UNITY_DEFAULT_READINESS_20261103.md](../13출시·마케팅/STEAM_UNITY_DEFAULT_READINESS_20261103.md) | 09-09 Steamworks 점검 일회성 기록. 현재 Steam 상태는 11-03 준비 문서가 정본 |
| [STEAM_INSTALL_REVIEW_20260916.md](13출시·마케팅/STEAM_INSTALL_REVIEW_20260916.md) | [STEAM_REVIEW_20260926.md](../13출시·마케팅/STEAM_REVIEW_20260926.md) | 09월 반려 후속 검증 옛판 |
| [STEAM_LANGUAGE_UPLOAD_20260923.md](13출시·마케팅/STEAM_LANGUAGE_UPLOAD_20260923.md) | [STEAM_FULL_RESUBMISSION_20261002.md](../13출시·마케팅/STEAM_FULL_RESUBMISSION_20261002.md) | 09-23 언어 빌드 업로드 기록. 머리에 10-02 계약으로 대체 명시 |
| [STEAM_REVIEW_FINAL_CHECK_20260918.md](13출시·마케팅/STEAM_REVIEW_FINAL_CHECK_20260918.md) (main판) | [STEAM_REVIEW_20260926.md](../13출시·마케팅/STEAM_REVIEW_20260926.md) | 09-18 재심사 확인 옛판. 링크 없음. 개명 차이뿐이라 main판 보관 |
| [STEAM_REVIEW_READY_CHECKLIST_20260918.md](13출시·마케팅/STEAM_REVIEW_READY_CHECKLIST_20260918.md) | [STEAM_REVIEW_20260926.md](../13출시·마케팅/STEAM_REVIEW_20260926.md) | 09-20 제출을 마친 체크리스트. 링크 없음 |
| [STEAM_REVIEW_SUBMISSION_20260920.md](13출시·마케팅/STEAM_REVIEW_SUBMISSION_20260920.md) | [STEAM_REVIEW_20260926.md](../13출시·마케팅/STEAM_REVIEW_20260926.md) | 09-20 재심사 제출 일회성 기록 |
| [TERMINAL_POPUP_WORKAROUND_20260927.md](13출시·마케팅/TERMINAL_POPUP_WORKAROUND_20260927.md) | [TERMINAL_FAILURE_FALLBACK.md](../0마스터플랜/TERMINAL_FAILURE_FALLBACK.md) | 09-27 콘솔 팝업 임시 조치. 링크 없음 |
| [USB_WEB_RELEASE_20260910.md](13출시·마케팅/USB_WEB_RELEASE_20260910.md) | [PC_PACKAGING_20260910.md](../13출시·마케팅/PC_PACKAGING_20260910.md) | 09-10 USB 패키지 전달 일회성 기록 |
| [VIDEO_EDIT_PLAN_20261008.md](13출시·마케팅/VIDEO_EDIT_PLAN_20261008.md) | [HERO_TRAILER_PRODUCTION_20261008.md](../13출시·마케팅/HERO_TRAILER_PRODUCTION_20261008.md) | 10-08 37초 스킬 시연 편집 납품 계약. 후속 제작 기록 안내됨 |
| [WEB_RENDERER_REDEPLOY_20260910.md](13출시·마케팅/WEB_RENDERER_REDEPLOY_20260910.md) | [WEB_DEPLOYMENT_REPAIR_20261002.md](../13출시·마케팅/WEB_DEPLOYMENT_REPAIR_20261002.md) | 엉뚱한 프로젝트(hell-smoky)에 재배포한 이력. 문서 스스로 정정 안내 |
| [WORKTREE_CHECKPOINT_20260916.md](13출시·마케팅/WORKTREE_CHECKPOINT_20260916.md) | — | 09-16 미커밋 정리 일회성 기록. CHANGELOG만 링크 |

## 16영문화(i18n) (1)

| 문서 | 후계 | 이유 |
|---|---|---|
| [영문화_진행현황.md](<16영문화(i18n)/영문화_진행현황.md>) | [번역_가이드.md](../16번역·로컬라이제이션/번역_가이드.md) | DOCS_INDEX가 '옛 영문화 진행 기록, 현행은 16번역'으로 명시. 폴더째 아카이브 |

## 2_1 스킬관리+합체시스템+자원 (4)

| 문서 | 후계 | 이유 |
|---|---|---|
| [자원리젠+소모공식__NFD_0628_2305_백업.md](<2_1 스킬관리+합체시스템+자원/자원리젠+소모공식__NFD_0628_2305_백업.md>) | [자원리젠+소모공식.md](<../2_1 스킬관리+합체시스템+자원/자원리젠+소모공식.md>) | 유니코드 정규화(NFD) 때 남은 백업 사본. 동결 Godot FDG 문서 하나만 링크 |
| [헬거너_H2_이식의존성_20261001.md](<2_1 스킬관리+합체시스템+자원/헬거너_H2_이식의존성_20261001.md>) | — | SKILL 팀장→총괄 일회성 인계표. 보관 대상 감사만 링크, 웹 신규 개발 중단 |
| [SKILL_자원게이트_감사_20261001.md](<2_1 스킬관리+합체시스템+자원/SKILL_자원게이트_감사_20261001.md>) (main판) | — | SKILL 팀장 일회성 자원 게이트 감사 보고. 현행 링크 없음. main판 보관 |
| [SKILL03_설치확정_자원검수_20261001.md](<2_1 스킬관리+합체시스템+자원/SKILL03_설치확정_자원검수_20261001.md>) (main판) | — | 일회성 검수 기록. 현행 링크 없음. 확정 수치는 2_1 정본에 있음. main판 보관 |

## 2_7 인벤토리+장비시스템 (2)

| 문서 | 후계 | 이유 |
|---|---|---|
| [INVENTORY_EARRINGS_QA_20260924.md](<2_7 인벤토리+장비시스템/INVENTORY_EARRINGS_QA_20260924.md>) | — | 귀걸이 슬롯 일회성 QA 보고. 동결 Godot FDG_SOURCE_TRACE만 링크 |
| [INVENTORY_VISUAL_QA_20260924.md](<2_7 인벤토리+장비시스템/INVENTORY_VISUAL_QA_20260924.md>) | — | 인벤토리 시각 일회성 QA 보고. 동결 Godot FDG_SOURCE_TRACE만 링크 |

## 3.1 ui hud 디자인 (1)

| 문서 | 후계 | 이유 |
|---|---|---|
| [SKILL_WINDOW_REDESIGN_PLAN_20261008.md](<3.1 ui hud 디자인/SKILL_WINDOW_REDESIGN_PLAN_20261008.md>) (main판) | [SKILL_FORGE_20261010.md](<../3.1 ui hud 디자인/SKILL_FORGE_20261010.md>) | 머리말에 '2026-10-10 대체' 명시된 미구현 기획. 보관본은 main판 |

## 3.3 키바인딩+설정 (1)

| 문서 | 후계 | 이유 |
|---|---|---|
| [DEMO11_50_NATIVE_SETTINGS_20261021.md](<3.3 키바인딩+설정/DEMO11_50_NATIVE_SETTINGS_20261021.md>) | — | 동결 Godot native 설정 이식 기록. Godot·FDG 문서와 Godot 절만 링크 |

## 4.0케릭터스프라이트 디자인 (1)

| 문서 | 후계 | 이유 |
|---|---|---|
| [DRUID_SPRITE_IDLE_CANDIDATE_20261103.md](<4.0케릭터스프라이트 디자인/DRUID_SPRITE_IDLE_CANDIDATE_20261103.md>) | [DRUID_LOCK_RETOUCH_20261103.md](<../4.0케릭터스프라이트 디자인/DRUID_LOCK_RETOUCH_20261103.md>) | 검증: 참조 0건, 머리말이 스스로 '이전 후보 제작 이력, 런타임 채택 불가'. 현재 상태는 LOCK_RETOUCH, r23 패키지 계약은 FULL_CANDIDATE에 있다 |

## 4.1맵디자인+설정 (39)

| 문서 | 후계 | 이유 |
|---|---|---|
| [CH1_1_FINAL_REVIEW_20260916.md](4.1맵디자인+설정/CH1_1_FINAL_REVIEW_20260916.md) | [CH1_1_PRODUCTION_FINISH_20260916.md](../4.1맵디자인+설정/CH1_1_PRODUCTION_FINISH_20260916.md) | 09-16 결과 검수(RETOUCH) 일회성 보고. 이후 85~98차가 대체 |
| [CH1_1_GROUND_STRUCTURE_20260916.md](4.1맵디자인+설정/CH1_1_GROUND_STRUCTURE_20260916.md) | [CH1_FLOOR_UNIFICATION_PASS87_20260929.md](../4.1맵디자인+설정/CH1_FLOOR_UNIFICATION_PASS87_20260929.md) | ground-2 bake 지면 구성은 87차 공통 피부 바닥으로 대체 |
| [CH1_녹색노이즈_버그리포트.md](4.1맵디자인+설정/CH1_녹색노이즈_버그리포트.md) | [맵제작_SSOT.md](../4.1맵디자인+설정/맵제작_SSOT.md) | 04-03에 해결된 일회성 버그 보고, 현행 링크 0. 재발 방지 규칙 4줄은 필요하면 맵제작_SSOT로 옮긴다 |
| [CH1_LIVING_HELL_V4_20260925.md](4.1맵디자인+설정/CH1_LIVING_HELL_V4_20260925.md) | [맵디테일.md](../4.1맵디자인+설정/맵디테일.md) | 09-25 정지 원화 시안(RETOUCH, 게임 미적용). 90~98차 생산 나무·바닥이 대체 |
| [CH1_LIVING_HELL_V5_20260925.md](4.1맵디자인+설정/CH1_LIVING_HELL_V5_20260925.md) | [맵디테일.md](../4.1맵디자인+설정/맵디테일.md) | v4 후속 정지 원화 시안(게임 미적용). 대체됨 |
| [CH1_LIVING_HELL_V6_LAYERS_20260925.md](4.1맵디자인+설정/CH1_LIVING_HELL_V6_LAYERS_20260925.md) | [맵디테일.md](../4.1맵디자인+설정/맵디테일.md) | v5 레이어 시안(게임 미적용). 대체됨 |
| [CH1_LIVING_HELL_V7_REGIONS_20260925.md](4.1맵디자인+설정/CH1_LIVING_HELL_V7_REGIONS_20260925.md) | [맵디테일.md](../4.1맵디자인+설정/맵디테일.md) | v6 구역 시안(게임 미적용). 생산 차수가 대체 |
| [CH1_OUTER_MASS_FIRST_PASS.md](4.1맵디자인+설정/CH1_OUTER_MASS_FIRST_PASS.md) | [CH1_SI1_ACTUAL_STAGE_GEOMETRY.md](../4.1맵디자인+설정/CH1_SI1_ACTUAL_STAGE_GEOMETRY.md) | 문서 스스로 '역사적 CH1-2 실험 기록'이라 밝힘(si1 opt-in) |
| [CH1_PAINTED_PHASE1_START_SPIKE.md](4.1맵디자인+설정/CH1_PAINTED_PHASE1_START_SPIKE.md) | [CH1_SI1_ACTUAL_STAGE_GEOMETRY.md](../4.1맵디자인+설정/CH1_SI1_ACTUAL_STAGE_GEOMETRY.md) | 08-29 TECH SPIKE(기본 OFF). geometry 재설계로 대체 |
| [CH1_PAINTED_PHASE2_SOUTH_CANARY.md](4.1맵디자인+설정/CH1_PAINTED_PHASE2_SOUTH_CANARY.md) | [CH1_SI1_ACTUAL_STAGE_GEOMETRY.md](../4.1맵디자인+설정/CH1_SI1_ACTUAL_STAGE_GEOMETRY.md) | 상태 표기가 'HISTORICAL VISUAL CANARY / GEOMETRY REDESIGN으로 SUPERSEDED' |
| [CH1_START_GATE_REMOVAL_20260912.md](4.1맵디자인+설정/CH1_START_GATE_REMOVAL_20260912.md) | [LEVEL_DESIGN_RULES_SSOT.md](../4.1맵디자인+설정/LEVEL_DESIGN_RULES_SSOT.md) | 09-12 일회성 MAP PRODUCTION REPORT, 링크 0. 결과는 LEVEL_DESIGN·START_OUTER 배너에 남아 있다 |
| [MAP_LOOK_GODOT_PASS1_20261020.md](4.1맵디자인+설정/MAP_LOOK_GODOT_PASS1_20261020.md) | — | 동결된 Godot 맵 표현 1차(10-20). maplook_pass1_before_after.jpg 동반 이동, MAP_IMPROVEMENT·WEB3D 링크 수정 |
| [map-objects-placeholder-prompt (2).md](<4.1맵디자인+설정/map-objects-placeholder-prompt (2).md>) | [맵오브젝트_에셋목록.md](../4.1맵디자인+설정/맵오브젝트_에셋목록.md) | 한 번 쓰고 끝난 '클코 프롬프트(통째로 복붙)'. Godot FDG 문서만 참조 |
| [MAP11_30_TARGET_SPLIT_20261021.md](4.1맵디자인+설정/MAP11_30_TARGET_SPLIT_20261021.md) | — | Godot MAP11 보스룸 차수(codex/map11-*). Godot 동결 |
| [MAP11_30B_PROJECTION_20261021.md](4.1맵디자인+설정/MAP11_30B_PROJECTION_20261021.md) | — | Godot MAP11 투영 차수. Godot 동결 |
| [MAP11_30C_SCALE_INTEGRATION_20261021.md](4.1맵디자인+설정/MAP11_30C_SCALE_INTEGRATION_20261021.md) | — | Godot MAP11 축척 차수. Godot 동결. 8.1 BOSS11_01~03 링크 수정 |
| [MAP11_30P_PERFORMANCE_20261021.md](4.1맵디자인+설정/MAP11_30P_PERFORMANCE_20261021.md) | — | Godot MAP11 성능 검수. Godot 동결 |
| [MAP11_32_FIELD_TARGET_SPLIT_20261021.md](4.1맵디자인+설정/MAP11_32_FIELD_TARGET_SPLIT_20261021.md) | — | Godot MAP11 필드 차수. Godot 동결. PMM 링크 수정 |
| [MAP11_32B_FIELD_BAKE_20261021.md](4.1맵디자인+설정/MAP11_32B_FIELD_BAKE_20261021.md) | — | Godot MAP11 bake 차수. Godot 동결 |
| [MAP11_32C_MEASURED_FIELD_20261021.md](4.1맵디자인+설정/MAP11_32C_MEASURED_FIELD_20261021.md) | — | Godot MAP11 계측 차수(PERFORMANCE FAIL). Godot 동결 |
| [MAP11_ARENA_PREVIEW_20261021.md](4.1맵디자인+설정/MAP11_ARENA_PREVIEW_20261021.md) | — | Godot MAP11-01 보스룸 blockout. Godot 동결 |
| [MAP11_ARENA_PREVIEW_PASS2_20261021.md](4.1맵디자인+설정/MAP11_ARENA_PREVIEW_PASS2_20261021.md) | — | Godot MAP11-01b proof. Godot 동결 |
| [MAP11_ARENA_PREVIEW_PASS3_20261021.md](4.1맵디자인+설정/MAP11_ARENA_PREVIEW_PASS3_20261021.md) | — | Godot MAP11-01c proof. Godot 동결 |
| [MAP11_FIELD_BLOCKOUT_20261021.md](4.1맵디자인+설정/MAP11_FIELD_BLOCKOUT_20261021.md) | — | Godot MAP11-07 필드 blockout. Godot 동결 |
| [MAP11_FIELD_PROVIDER_20261021.md](4.1맵디자인+설정/MAP11_FIELD_PROVIDER_20261021.md) | — | Godot MAP11-11 provider 계약. Godot 동결 |
| [MAP11_FINISH_PERFORMANCE_20261021.md](4.1맵디자인+설정/MAP11_FINISH_PERFORMANCE_20261021.md) | — | Godot MAP11-15 보스룸 마감·성능. Godot 동결 |
| [MAP11_LANDMARK_GATE_20261021.md](4.1맵디자인+설정/MAP11_LANDMARK_GATE_20261021.md) | — | Godot MAP11-14 랜드마크. Godot 동결 |
| [MAP11_NEW_MAP_LOGIC_PLAN_20261021.md](4.1맵디자인+설정/MAP11_NEW_MAP_LOGIC_PLAN_20261021.md) | — | Godot MAP11 설계서(210KB). Godot 동결. ART_TEAM_MASTER·DEMO11 링크 수정 |
| [MAP11_OUTER_ASSEMBLY_G2_20261021.md](4.1맵디자인+설정/MAP11_OUTER_ASSEMBLY_G2_20261021.md) | — | Godot MAP11-09 외곽 조립. Godot 동결 |
| [MAP11_PRODUCTION_BINDING_20261021.md](4.1맵디자인+설정/MAP11_PRODUCTION_BINDING_20261021.md) | — | Godot MAP11 Main 바인딩. Godot 동결 |
| [MAP11_STAGE_PROVIDER_20261021.md](4.1맵디자인+설정/MAP11_STAGE_PROVIDER_20261021.md) | — | Godot MAP11-02 StageRecipe 계약. Godot 동결 |
| [MAP11_SURFACE_SEAM_G3G4_20261021.md](4.1맵디자인+설정/MAP11_SURFACE_SEAM_G3G4_20261021.md) | — | Godot MAP11 접합 G3/G4. Godot 동결 |
| [MAP11_TARGET_FRAMES_20261021.md](4.1맵디자인+설정/MAP11_TARGET_FRAMES_20261021.md) (unity판) | [WORK_QUALITY_STANDARD_20261029.md](../0마스터플랜/WORK_QUALITY_STANDARD_20261029.md) | Godot 1-1 목표 화면 원칙. unity판(87KB)이 상위집합. 원칙은 품질 기준 §1.1이 대체. target_frames/ 동반 이동 |
| [MAPLOOK_HOLE_20261020.md](4.1맵디자인+설정/MAPLOOK_HOLE_20261020.md) | — | Godot 소환굴 오버레이(10-20). Godot 동결. 맵설정_소환굴·인덱스·ANIMATION_VFX_TEAM_MASTER 링크 수정 |
| [ROOTWORLD_MASTER_REVIEW_20260924.md](4.1맵디자인+설정/ROOTWORLD_MASTER_REVIEW_20260924.md) | [맵디테일.md](../4.1맵디자인+설정/맵디테일.md) | 설계안만, 런타임 변경 0(RETOUCH). 09-25 맵디테일 콘셉트가 대체 |
| [ROOTWORLD_REFERENCE_FIDELITY_20260924.md](4.1맵디자인+설정/ROOTWORLD_REFERENCE_FIDELITY_20260924.md) | [맵디테일.md](../4.1맵디자인+설정/맵디테일.md) | 09-24 목표·중단 지점 기록(candidate-v1 FAIL). 인덱스의 '오늘 작업 재개' 배너 삭제 |
| [SHARP_01_RENDER_CLARITY_20261021.md](4.1맵디자인+설정/SHARP_01_RENDER_CLARITY_20261021.md) | — | Godot 렌더 선명도 후보(codex/sharp-01). Godot 동결 |
| [SMILEGATE_CH1_SUBMISSION_GOAL_20260924.md](4.1맵디자인+설정/SMILEGATE_CH1_SUBMISSION_GOAL_20260924.md) | — | 09-24 스마일게이트 제출용 일회성 목표. 인덱스의 '진행 중인 제출 목표' 배너 삭제 |
| [UNITY_ART_BIBLE_V1_20261026.md](4.1맵디자인+설정/UNITY_ART_BIBLE_V1_20261026.md) | [MAP_ART_BIBLE_v2_20261026.md](../4.1맵디자인+설정/MAP_ART_BIBLE_v2_20261026.md) | 문서 스스로 '통합본으로 대체됨, 이력'. 단 art_bible_v1/ 이미지는 v2가 참조하니 unity로 옮긴다 |

## 4.1맵디자인+설정/qa_ch1_master_16x9 (5)

| 문서 | 후계 | 이유 |
|---|---|---|
| [작업보고서_CH1_16x9_2026-08-18.md](4.1맵디자인+설정/qa_ch1_master_16x9/작업보고서_CH1_16x9_2026-08-18.md) (main판) | [CH1_1_PRODUCTION_FINISH_20260916.md](../4.1맵디자인+설정/CH1_1_PRODUCTION_FINISH_20260916.md) | 08-18 작업 보고. main 10-31판이 URL 정정 추가. 링크 0 |
| [QA_REPORT_INGAME.md](4.1맵디자인+설정/qa_ch1_master_16x9/QA_REPORT_INGAME.md) (main판) | [CH1_1_PRODUCTION_FINISH_20260916.md](../4.1맵디자인+설정/CH1_1_PRODUCTION_FINISH_20260916.md) | 08월 QA. main 10-31판이 '당시 이력' 정정 추가. 맵제작_SSOT 링크 수정 |
| [QA_REPORT_PROD.md](4.1맵디자인+설정/qa_ch1_master_16x9/QA_REPORT_PROD.md) | [CH1_1_PRODUCTION_FINISH_20260916.md](../4.1맵디자인+설정/CH1_1_PRODUCTION_FINISH_20260916.md) | 08-18 PROD plate QA. plate는 mapTest 선택 경로로만 남음 |
| [QA_REPORT_v2.md](4.1맵디자인+설정/qa_ch1_master_16x9/QA_REPORT_v2.md) | [CH1_1_PRODUCTION_FINISH_20260916.md](../4.1맵디자인+설정/CH1_1_PRODUCTION_FINISH_20260916.md) | 08-18 v2 master QA 일회성 보고 |
| [QA_REPORT.md](4.1맵디자인+설정/qa_ch1_master_16x9/QA_REPORT.md) | [CH1_1_PRODUCTION_FINISH_20260916.md](../4.1맵디자인+설정/CH1_1_PRODUCTION_FINISH_20260916.md) | 08-18 16:9 master plate QA(NEEDS_REVISION, 일회성). 폴더 이미지 43개와 통째로 이동 |

## 5.0애니메이션파이프라인 (1)

| 문서 | 후계 | 이유 |
|---|---|---|
| [ANCESTOR_GROK2_SPRITE_TRIAL_20260928.md](5.0애니메이션파이프라인/ANCESTOR_GROK2_SPRITE_TRIAL_20260928.md) | [LOBBY_VARKAN_SPRITE_VIDEO_20260928.md](../5.0애니메이션파이프라인/LOBBY_VARKAN_SPRITE_VIDEO_20260928.md) | Grok2 전대 보행 시험. 미채택(_ANC_WALK_SHEET 미교체), 링크 없음 |

## 5.1임펙트디자인 (2)

| 문서 | 후계 | 이유 |
|---|---|---|
| [BOSS_VFX_REPLACEMENT_AUDIT_2026-09-06.md](5.1임펙트디자인/BOSS_VFX_REPLACEMENT_AUDIT_2026-09-06.md) | [CH1_1_BOSS_IMPACT_AUDIT_20260927.md](../5.1임펙트디자인/CH1_1_BOSS_IMPACT_AUDIT_20260927.md) | 9-06 보스 임팩트 교체 후보 조사. 서두에 '당시 이력', 1-1은 CH1_1 조사로 넘어감. 링크 없음 |
| [SILVERTAIL_MALICE_ORB_MOONBLADE_V2.md](5.1임펙트디자인/SILVERTAIL_MALICE_ORB_MOONBLADE_V2.md) | [SILVERTAIL_MALICE_ORB_SHEET_V3.md](../5.1임펙트디자인/SILVERTAIL_MALICE_ORB_SHEET_V3.md) | 본문에 '현재 런타임은 V3, v2는 보존 이력·로더 미사용'. 링크는 CHANGELOG_SYNC뿐 |

## 6사운드디자인 (1)

| 문서 | 후계 | 이유 |
|---|---|---|
| [PROJECTILE_HIT_CANDIDATES_20260910.md](6사운드디자인/PROJECTILE_HIT_CANDIDATES_20260910.md) | [BISQO_MAGIC_HIT_20260910.md](../6사운드디자인/BISQO_MAGIC_HIT_20260910.md) | Python 합성 대안 4종 전부 미채택된 옛 후보 기록. 6사운드디자인·PROJECTILE_PLAYER_HIT의 '이전 후보 기록' 링크 수정 |

## 7아이템디자인 (2)

| 문서 | 후계 | 이유 |
|---|---|---|
| [DEMO11_24_EFFECT_CONSUMPTION_20261021.md](7아이템디자인/DEMO11_24_EFFECT_CONSUMPTION_20261021.md) | — | Godot DEMO11 이식 검증 문서(동결). Unity 문서 링크 없음 |
| [DEMO11_24B_SYSTEM_CONSUMERS_20261021.md](7아이템디자인/DEMO11_24B_SYSTEM_CONSUMERS_20261021.md) | — | Godot DEMO11-24b affix 소비 경계 문서(동결) |

## 8.0몬스터디자인 (5)

| 문서 | 후계 | 이유 |
|---|---|---|
| [DEMO11_ETYPE_B_ADMISSION_20261021.md](8.0몬스터디자인/DEMO11_ETYPE_B_ADMISSION_20261021.md) | — | Godot DEMO11 자연 소환 B 등록 과정 문서(동결). 링크 없음 |
| [DEMO11_ETYPE_D_ADMISSION_20261021.md](8.0몬스터디자인/DEMO11_ETYPE_D_ADMISSION_20261021.md) | — | Godot DEMO11 자연 소환 D 등록 과정 문서(동결). 링크 없음 |
| [DEMO11_ETYPE_F_자연소환_20261021.md](8.0몬스터디자인/DEMO11_ETYPE_F_자연소환_20261021.md) | — | Godot DEMO11 자연 소환 F 인수 경계 문서(동결) |
| [DEMO11_NATURAL_ENEMY_BASE_20261021.md](8.0몬스터디자인/DEMO11_NATURAL_ENEMY_BASE_20261021.md) | — | Godot 자연 적 생성 공통 계약(동결) |
| [ETYPE15_NATIVE_20261022.md](8.0몬스터디자인/ETYPE15_NATIVE_20261022.md) | — | Godot INTEG5 스냅샷 대조표(동결). '분열 2~3→2' 정정은 몬스터_총관리에 반영 필요 |

## 8.1보스디자인바이블 (3)

| 문서 | 후계 | 이유 |
|---|---|---|
| [BOSS11_01_READABILITY_20261021.md](8.1보스디자인바이블/BOSS11_01_READABILITY_20261021.md) | — | Godot 1-1 아레나 보스 가독성 검수(동결). Unity 보스 리메이크로 대체 |
| [BOSS11_02_TELEGRAPH_20261021.md](8.1보스디자인바이블/BOSS11_02_TELEGRAPH_20261021.md) | — | Godot 다크드루이드 텔레그래프·카메라(동결). PMM 이력 링크 수정 |
| [BOSS11_03_CAMERA_COLOR_20261021.md](8.1보스디자인바이블/BOSS11_03_CAMERA_COLOR_20261021.md) | — | Godot boss11_camera.gd 색감 기록(동결). PMM 이력 링크 수정 |

## 9적ai패턴디자인 (1)

| 문서 | 후계 | 이유 |
|---|---|---|
| [DEMO11_NATURAL_ENEMY_CLOCK_20261021.md](9적ai패턴디자인/DEMO11_NATURAL_ENEMY_CLOCK_20261021.md) | — | Godot 자연 적 시계·스케줄러 계약(동결) |

## archetypes/silvertail (1)

| 문서 | 후계 | 이유 |
|---|---|---|
| [SILVERTAIL_ARCHETYPE_v1.md](archetypes/silvertail/SILVERTAIL_ARCHETYPE_v1.md) | [SILVERTAIL_ARCHETYPE_v1_1.md](../archetypes/silvertail/SILVERTAIL_ARCHETYPE_v1_1.md) | v1.1이 대체, 스토리 정본도 v1_1 지정. LOCKED_SPEC_v1_2 11행 경로만 수정 |

## cinematic (30)

| 문서 | 후계 | 이유 |
|---|---|---|
| [A09_HIGGSFIELD_VIDEO_REVIEW.md](cinematic/A09_HIGGSFIELD_VIDEO_REVIEW.md) | [A09_V3_HIGGSFIELD_VIDEO_REVIEW.md](../cinematic/A09_V3_HIGGSFIELD_VIDEO_REVIEW.md) | A09 v1. 문서 머리에 최신은 v3, v1/v2는 이력이라고 명시 |
| [A09_V2_HIGGSFIELD_VIDEO_REVIEW.md](cinematic/A09_V2_HIGGSFIELD_VIDEO_REVIEW.md) | [A09_V3_HIGGSFIELD_VIDEO_REVIEW.md](../cinematic/A09_V3_HIGGSFIELD_VIDEO_REVIEW.md) | A09 v2(찢고 나감) RETOUCH 후 v3로 대체 |
| [AUTO_FINAL_20260907.md](cinematic/AUTO_FINAL_20260907.md) | [WORLD_INTRO_INGAME_20260907.md](../cinematic/WORLD_INTRO_INGAME_20260907.md) | 09-07 v1 자동 합본 편집안. v2~v13·INGAME로 대체. C12~14·STORYBOARD 링크 수정 |
| [B01_HIGGSFIELD_VIDEO_REVIEW.md](cinematic/B01_HIGGSFIELD_VIDEO_REVIEW.md) | [B01_V2_HIGGSFIELD_VIDEO_REVIEW.md](../cinematic/B01_V2_HIGGSFIELD_VIDEO_REVIEW.md) | B01 v1(일반 폐허)이 사용자 요청으로 교체 |
| [B03_HIGGSFIELD_VIDEO_REVIEW.md](cinematic/B03_HIGGSFIELD_VIDEO_REVIEW.md) | [B03_V2_HIGGSFIELD_VIDEO_REVIEW.md](../cinematic/B03_V2_HIGGSFIELD_VIDEO_REVIEW.md) | B03 v1(손 막대 결함)이 빈손 v2로 대체 |
| [B04_HIGGSFIELD_VIDEO_REVIEW.md](cinematic/B04_HIGGSFIELD_VIDEO_REVIEW.md) | [B04_V4_TRADITIONAL_MAGIC_20260907.md](../cinematic/B04_V4_TRADITIONAL_MAGIC_20260907.md) | B04 v1 낙하 컷. 메시지 불일치로 현행 후보 제외 명시 |
| [B04_V2_HIGGSFIELD_VIDEO_REVIEW.md](cinematic/B04_V2_HIGGSFIELD_VIDEO_REVIEW.md) | [B04_V4_TRADITIONAL_MAGIC_20260907.md](../cinematic/B04_V4_TRADITIONAL_MAGIC_20260907.md) | B04 v2 한 화면 공방. v3/v4 2컷 분리로 대체 |
| [ENDING_DEFIANCE_HIGGSFIELD_REVIEW.md](cinematic/ENDING_DEFIANCE_HIGGSFIELD_REVIEW.md) | [ENDING_EXODUSER_BATTLE_REVISION_20260907.md](../cinematic/ENDING_EXODUSER_BATTLE_REVISION_20260907.md) | 엔딩 v1 후보. E01/E02 복원하지 않는다고 명시 |
| [ENTER_FORGED_20260906.md](cinematic/ENTER_FORGED_20260906.md) | [ENTER_ENGRAVED_20260907.md](../cinematic/ENTER_ENGRAVED_20260907.md) | 문서 머리에 '과거 구현 기록, 09-07부터 ENTER_ENGRAVED로 대체' 명시 |
| [HELL_ROAD_TITLE_REDESIGN_20260907.md](cinematic/HELL_ROAD_TITLE_REDESIGN_20260907.md) | [WORLD_INTRO_V7_EXODUSER_ONLY_20260907.md](../cinematic/WORLD_INTRO_V7_EXODUSER_ONLY_20260907.md) | HELL ROAD 금속 부제가 v7에서 제거, EXODUSER 단독으로 대체 |
| [WARINTRO_BATCH_W09_W11_20260909.md](cinematic/WARINTRO_BATCH_W09_W11_20260909.md) | [WARINTRO_REALISM_V7_PRODUCTION_20260909.md](../cinematic/WARINTRO_REALISM_V7_PRODUCTION_20260909.md) | 후반 W09~W16은 v7 실사풍에서 전부 재생성 |
| [WARINTRO_BATCH_W12_W13_W16_20260909.md](cinematic/WARINTRO_BATCH_W12_W13_W16_20260909.md) | [WARINTRO_REALISM_V7_PRODUCTION_20260909.md](../cinematic/WARINTRO_REALISM_V7_PRODUCTION_20260909.md) | 후반 컷이 v7에서 재생성되고 이후 v11·v21에서 교체 |
| [WARINTRO_BATCH_W16_V2_20260909.md](cinematic/WARINTRO_BATCH_W16_V2_20260909.md) | [WARINTRO_REALISM_V7_PRODUCTION_20260909.md](../cinematic/WARINTRO_REALISM_V7_PRODUCTION_20260909.md) | W16 v2 얼굴 보정본. v7에서 W16 재생성 |
| [WARINTRO_EMOTION_REVIEW_V15_20260910.md](cinematic/WARINTRO_EMOTION_REVIEW_V15_20260910.md) | [WARINTRO_COMBAT_V16_20260910.md](../cinematic/WARINTRO_COMBAT_V16_20260910.md) | 감정 컷 일회성 비교 검토. 결론은 v16에 반영 |
| [WARINTRO_ENDING_PAUSE_V2_20260909.md](cinematic/WARINTRO_ENDING_PAUSE_V2_20260909.md) | [WARINTRO_HELL_DRAG_V21_20260910.md](../cinematic/WARINTRO_HELL_DRAG_V21_20260910.md) | 합본 v2의 질문 뒤 3.7초 정적. v20/v21 값으로 대체 |
| [WARINTRO_ENDING_TIMING_V20_20260910.md](cinematic/WARINTRO_ENDING_TIMING_V20_20260910.md) | [WARINTRO_HELL_DRAG_V21_20260910.md](../cinematic/WARINTRO_HELL_DRAG_V21_20260910.md) | 질문 뒤 1초·명령 뒤 1.5초 수치를 V21 표가 다시 적고 있음. 6사운드 링크 수정 |
| [WARINTRO_ENDING_V6_20260909.md](cinematic/WARINTRO_ENDING_V6_20260909.md) | [WARINTRO_HELL_DRAG_V21_20260910.md](../cinematic/WARINTRO_HELL_DRAG_V21_20260910.md) | '사용자 불채택' 명시. 4.0·6사운드·CHANGELOG 링크 수정 |
| [WARINTRO_FINAL_CUT_V4_20260909.md](cinematic/WARINTRO_FINAL_CUT_V4_20260909.md) | [WARINTRO_HELL_DRAG_V21_20260910.md](../cinematic/WARINTRO_HELL_DRAG_V21_20260910.md) | 101초 v4 합본. 후반은 v7에서 전면 재생성. 11내러티브·6사운드·STORYBOARD·REMASTER 링크 수정 |
| [WARINTRO_FULL_REVIEW_20260909.md](cinematic/WARINTRO_FULL_REVIEW_20260909.md) | [WARINTRO_HELL_DRAG_V21_20260910.md](../cinematic/WARINTRO_HELL_DRAG_V21_20260910.md) | 09-09 병렬 제작 일괄 검수 보고(v1 합본). 일회성 |
| [WARINTRO_LAST_SHOT_V9_20260909.md](cinematic/WARINTRO_LAST_SHOT_V9_20260909.md) | [WARINTRO_HELL_DRAG_V21_20260910.md](../cinematic/WARINTRO_HELL_DRAG_V21_20260910.md) | 마지막 대사 위치 편집 델타. V21 표에 현행값 |
| [WARINTRO_MEMORY_V13_20260910.md](cinematic/WARINTRO_MEMORY_V13_20260910.md) | [WARINTRO_MEMORY_V14_20260910.md](../cinematic/WARINTRO_MEMORY_V14_20260910.md) | Remember 0.45초 플래시. v14에서 대체 명시 |
| [WARINTRO_RECUT_V3_20260909.md](cinematic/WARINTRO_RECUT_V3_20260909.md) | [WARINTRO_HELL_DRAG_V21_20260910.md](../cinematic/WARINTRO_HELL_DRAG_V21_20260910.md) | 합본 v3 후반 컷 분할. v7 재생성과 킬루 재제작으로 대체 |
| [WARINTRO_SHADOW_ONE_V18_20260910.md](cinematic/WARINTRO_SHADOW_ONE_V18_20260910.md) | [WARINTRO_SHADOW_TRIM_V19_20260910.md](../cinematic/WARINTRO_SHADOW_TRIM_V19_20260910.md) | 한 명 쓰러짐 신규 생성 불채택. v19가 1초 컷으로 대체 |
| [WARINTRO_W02_REMASTER_20260909.md](cinematic/WARINTRO_W02_REMASTER_20260909.md) | [WARINTRO_W02_V2_EMPTY_HANDS_20260909.md](../cinematic/WARINTRO_W02_V2_EMPTY_HANDS_20260909.md) | W02 v1(단검 쥔 손 결함). 빈손 v2로 대체 |
| [WARINTRO_W04_REMASTER_20260909.md](cinematic/WARINTRO_W04_REMASTER_20260909.md) | [WARINTRO_W04_V3_DESPAIR_20260909.md](../cinematic/WARINTRO_W04_V3_DESPAIR_20260909.md) | W04 v1 왕좌판. v3 양문 폐쇄로 대체 |
| [WARINTRO_W04_V2_CORRIDOR_20260909.md](cinematic/WARINTRO_W04_V2_CORRIDOR_20260909.md) | [WARINTRO_W04_V3_DESPAIR_20260909.md](../cinematic/WARINTRO_W04_V3_DESPAIR_20260909.md) | W04 v2 복도판. 문 구조 오류로 불채택 명시 |
| [WORLD_INTRO_FULL_REVIEW_20260906.md](cinematic/WORLD_INTRO_FULL_REVIEW_20260906.md) | [WORLD_INTRO_INGAME_20260907.md](../cinematic/WORLD_INTRO_INGAME_20260907.md) | 09-06 v2 이전 전체 검토 보고. 머리말이 INGAME·V13을 따르라고 안내 |
| [WORLD_INTRO_V11_LOGO_CALL_20260907.md](cinematic/WORLD_INTRO_V11_LOGO_CALL_20260907.md) | [WORLD_INTRO_V13_EXODUS_20260907.md](../cinematic/WORLD_INTRO_V13_EXODUS_20260907.md) | 머리말에 '폐기된 편집 이력, 현행은 v13' 명시 |
| [WORLD_INTRO_V3_TITLE_20260907.md](cinematic/WORLD_INTRO_V3_TITLE_20260907.md) | [WORLD_INTRO_V7_EXODUSER_ONLY_20260907.md](../cinematic/WORLD_INTRO_V7_EXODUSER_ONLY_20260907.md) | 마지막 타이틀이 v5를 거쳐 v7 EXODUSER 단독으로 대체 |
| [WORLD_INTRO_V5_TITLE_20260907.md](cinematic/WORLD_INTRO_V5_TITLE_20260907.md) | [WORLD_INTRO_V7_EXODUSER_ONLY_20260907.md](../cinematic/WORLD_INTRO_V7_EXODUSER_ONLY_20260907.md) | 금속 HELL ROAD 타이틀을 v7에서 제거 |

## engine (219)

| 문서 | 후계 | 이유 |
|---|---|---|
| [DEMO_PLAY_20261021.md](engine/DEMO_PLAY_20261021.md) | — | Godot 1-1 데모 실행 준비 기록. Godot 동결 |
| [DEMO11_47L_REGRESSION_20261021.md](engine/DEMO11_47L_REGRESSION_20261021.md) | — | Godot DEMO11 E2E 회귀 수정 보고. Godot 동결 |
| [DEMO11_COMPLETION_GAP_20261021.md](engine/DEMO11_COMPLETION_GAP_20261021.md) | — | Godot 1-1 데모 잔여 목록. Godot 동결. 4.1 MAP11 계획·ctx/ 링크 갱신 필요 |
| [DEMO11_INTRO_LIFECYCLE_20261021.md](engine/DEMO11_INTRO_LIFECYCLE_20261021.md) | — | Godot 인트로 수명 계약(본문도 이력 명시). 6사운드디자인 링크 갱신 필요 |
| [DEMO11_LOBBY_ENTRY_20261021.md](engine/DEMO11_LOBBY_ENTRY_20261021.md) | — | Godot demo_lobby.tscn 진입 계약. Godot 동결 |
| [DEMO11_SKILL_DISPATCH_20261021.md](engine/DEMO11_SKILL_DISPATCH_20261021.md) (main판) | — | Godot 슬롯 dispatcher 계약. 보관 시 main판(10-31 악의오브 개명 반영) |
| [DEMO11_STAGE_SPAWN_ADAPTER_20261021.md](engine/DEMO11_STAGE_SPAWN_ADAPTER_20261021.md) | — | Godot StageProvider 어댑터 계약. Godot 동결 |
| [DEMO11_STATUS_20261021.md](engine/DEMO11_STATUS_20261021.md) | — | Godot 1-1 데모 진행 현황판(10-21). Godot 동결 |
| [E2E_TAIL_02_20261023.md](engine/E2E_TAIL_02_20261023.md) | — | Godot E2E 하니스 보고(godot/source_snapshot 기준) |
| [E2E_TAIL_02_AIM_20261023.md](engine/E2E_TAIL_02_AIM_20261023.md) | — | E2E-TAIL-02(Godot) 부속 조준 하니스 기록 |
| [ENEMY_VIS_01_20261023.md](engine/ENEMY_VIS_01_20261023.md) | — | Godot INTEG-17d 기준 적 잔상 수정 보고 |
| [FDG_ACCEPTED_NATIVE_SOURCE_MAIN_SYNC_20261017.md](engine/FDG_ACCEPTED_NATIVE_SOURCE_MAIN_SYNC_20261017.md) | — | Godot native source의 main·R 정렬 계약(10-17). 끝난 통합 기록 |
| [FDG_FEATURE_INVENTORY_20261020.md](engine/FDG_FEATURE_INVENTORY_20261020.md) (unity판) | — | 기능 분모·Godot 이식 상태 목록(10-20). Godot 동결로 상태 열이 무효. 두 판 다름 → unity판 보관(unity에 Godot 후속 추가분 있음) |
| [FDG_GAME_DEVELOPMENT_PLAN.md](engine/FDG_GAME_DEVELOPMENT_PLAN.md) (main판) | — | Godot 이식 총 목표·단계 계획. 10-26 Unity 전환·godot/main 동결로 종료(WORK_BOARD 옛 Godot 절과 orders/reports만 링크). |
| [FDG_GODOT_FLOATING_TEXT_BINDING_20261013.md](engine/FDG_GODOT_FLOATING_TEXT_BINDING_20261013.md) | — | Godot native 연결·검수 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_FRACTIONAL_HP_SINK_20261014.md](engine/FDG_GODOT_FRACTIONAL_HP_SINK_20261014.md) | — | Godot native 연결·검수 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_GROUND_SURFACE_BINDING_20261013.md](engine/FDG_GODOT_GROUND_SURFACE_BINDING_20261013.md) | — | Godot native 연결·검수 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_M29_FIRST_20261013.md](engine/FDG_GODOT_M29_FIRST_20261013.md) | — | Godot native 연결·검수 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_MAIN_SOURCE_AUTHORITY_20261014.md](engine/FDG_GODOT_MAIN_SOURCE_AUTHORITY_20261014.md) (unity판) | — | Godot native 연결·검수 기록(10-13~14). godot/main 동결. 두 판 다름 → unity판 보관(unity에 Godot 후속 추가분 있음) |
| [FDG_GODOT_MAIN_SOURCE_LESSON_20261014.md](engine/FDG_GODOT_MAIN_SOURCE_LESSON_20261014.md) | — | Godot native 연결·검수 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_MAIN_SOURCE_LESSON_FIRST_20261014.md](engine/FDG_GODOT_MAIN_SOURCE_LESSON_FIRST_20261014.md) | — | Godot native 연결·검수 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_MAIN_SOURCE_PLAYER_INITIALIZATION_FIRST_20261014.md](engine/FDG_GODOT_MAIN_SOURCE_PLAYER_INITIALIZATION_FIRST_20261014.md) | — | Godot native 연결·검수 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_NATIVE_MAIN_INTRO_CURTAIN_FIRST_20261014.md](engine/FDG_GODOT_NATIVE_MAIN_INTRO_CURTAIN_FIRST_20261014.md) | — | Godot native 연결·검수 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_NATIVE_MAIN_INTRO_CURTAIN_TEST_20261014.md](engine/FDG_GODOT_NATIVE_MAIN_INTRO_CURTAIN_TEST_20261014.md) | — | Godot native 연결·검수 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_NATIVE_MAIN_INTRO_SHADOW_FIRST_20261014.md](engine/FDG_GODOT_NATIVE_MAIN_INTRO_SHADOW_FIRST_20261014.md) | — | Godot native 연결·검수 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_NATIVE_MAIN_SPRITE_READINESS_FIRST_20261014.md](engine/FDG_GODOT_NATIVE_MAIN_SPRITE_READINESS_FIRST_20261014.md) | — | Godot native 연결·검수 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_NATIVE_MAIN_SPRITE_READINESS_TEST_20261014.md](engine/FDG_GODOT_NATIVE_MAIN_SPRITE_READINESS_TEST_20261014.md) | — | Godot native 연결·검수 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_NATIVE_MAIN_SPRITE_STARTUP_LOSS_FIRST_20261014.md](engine/FDG_GODOT_NATIVE_MAIN_SPRITE_STARTUP_LOSS_FIRST_20261014.md) | — | Godot native 연결·검수 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_NATIVE_MAIN_SPRITE_STARTUP_LOSS_TEST_20261014.md](engine/FDG_GODOT_NATIVE_MAIN_SPRITE_STARTUP_LOSS_TEST_20261014.md) | — | Godot native 연결·검수 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_NATIVE_PLAYER_SPRITE_EXPECTATION_20261014.md](engine/FDG_GODOT_NATIVE_PLAYER_SPRITE_EXPECTATION_20261014.md) | — | Godot native 연결·검수 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_NUMBER_ATLAS_BINDING_20261014.md](engine/FDG_GODOT_NUMBER_ATLAS_BINDING_20261014.md) | — | Godot native 연결·검수 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_COMBAT_QE_FIRST_20261013.md](engine/FDG_GODOT_PORT_COMBAT_QE_FIRST_20261013.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_COMBAT_REFERENCE_SOURCE_FIRST_20261013.md](engine/FDG_GODOT_PORT_COMBAT_REFERENCE_SOURCE_FIRST_20261013.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_COMBAT_STAT_FORMULA_FIRST_20261013.md](engine/FDG_GODOT_PORT_COMBAT_STAT_FORMULA_FIRST_20261013.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_COMMON_CHARGE_WARNING_FIRST_20261013.md](engine/FDG_GODOT_PORT_COMMON_CHARGE_WARNING_FIRST_20261013.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_DETONATE_BLAST_FIRST_20261013.md](engine/FDG_GODOT_PORT_DETONATE_BLAST_FIRST_20261013.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_EQUIPMENT_AFFIX_READER_FIRST_20261013.md](engine/FDG_GODOT_PORT_EQUIPMENT_AFFIX_READER_FIRST_20261013.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_FLOATING_TEXT_FIRST_20261013.md](engine/FDG_GODOT_PORT_FLOATING_TEXT_FIRST_20261013.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_FUSION_STAR_SOURCE_FIRST_20261013.md](engine/FDG_GODOT_PORT_FUSION_STAR_SOURCE_FIRST_20261013.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_HOLY_DOME_FLAT_HEAL_SOURCE_FIRST_20261013.md](engine/FDG_GODOT_PORT_HOLY_DOME_FLAT_HEAL_SOURCE_FIRST_20261013.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_HOLY_DOME_PRESENCE_SOURCE_FIRST_20261013.md](engine/FDG_GODOT_PORT_HOLY_DOME_PRESENCE_SOURCE_FIRST_20261013.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_HP_REGENERATION_SOURCE_FIRST_20261013.md](engine/FDG_GODOT_PORT_HP_REGENERATION_SOURCE_FIRST_20261013.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_ITEM_ARMOR_ELEMENT_FIRST_20261013.md](engine/FDG_GODOT_PORT_ITEM_ARMOR_ELEMENT_FIRST_20261013.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_MAP_RESOURCE_FIRST_20261013.md](engine/FDG_GODOT_PORT_MAP_RESOURCE_FIRST_20261013.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_NATIVE_NEW_RUN_BOOTSTRAP_SOURCE_FIRST_20261013.md](engine/FDG_GODOT_PORT_NATIVE_NEW_RUN_BOOTSTRAP_SOURCE_FIRST_20261013.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_NPC_SOURCE_OPTIONS_STATE_FIRST_20261014.md](engine/FDG_GODOT_PORT_NPC_SOURCE_OPTIONS_STATE_FIRST_20261014.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_NUMBER_ATLAS_FIRST_20261013.md](engine/FDG_GODOT_PORT_NUMBER_ATLAS_FIRST_20261013.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_PARRY_LESSON_SOURCE_FIRST_20261014.md](engine/FDG_GODOT_PORT_PARRY_LESSON_SOURCE_FIRST_20261014.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_PLAYER_BASE_ATTACK_SOURCE_FIRST_20261014.md](engine/FDG_GODOT_PORT_PLAYER_BASE_ATTACK_SOURCE_FIRST_20261014.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_PLAYER_CRYSTAL_RESOURCE_SOURCE_FIRST_20261013.md](engine/FDG_GODOT_PORT_PLAYER_CRYSTAL_RESOURCE_SOURCE_FIRST_20261013.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_PLAYER_DEFENSE_SPEED_PARAMETERS_SOURCE_FIRST_20261013.md](engine/FDG_GODOT_PORT_PLAYER_DEFENSE_SPEED_PARAMETERS_SOURCE_FIRST_20261013.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_PLAYER_EFFECTIVE_STATS_SOURCE_FIRST_20261013.md](engine/FDG_GODOT_PORT_PLAYER_EFFECTIVE_STATS_SOURCE_FIRST_20261013.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_PLAYER_GRIT_SOURCE_FIRST_20261013.md](engine/FDG_GODOT_PORT_PLAYER_GRIT_SOURCE_FIRST_20261013.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_PLAYER_HEALTH_CAPTURED_INITIAL_FIRST_20261014.md](engine/FDG_GODOT_PORT_PLAYER_HEALTH_CAPTURED_INITIAL_FIRST_20261014.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_PLAYER_HEALTH_PARAMETERS_SOURCE_FIRST_20261013.md](engine/FDG_GODOT_PORT_PLAYER_HEALTH_PARAMETERS_SOURCE_FIRST_20261013.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_PLAYER_PASSIVES_SOURCE_FIRST_20261013.md](engine/FDG_GODOT_PORT_PLAYER_PASSIVES_SOURCE_FIRST_20261013.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_PLAYER_RESOURCE_PARAMETERS_SOURCE_FIRST_20261013.md](engine/FDG_GODOT_PORT_PLAYER_RESOURCE_PARAMETERS_SOURCE_FIRST_20261013.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_PLAYER_SHIELD_POISE_PARAMETERS_SOURCE_FIRST_20261013.md](engine/FDG_GODOT_PORT_PLAYER_SHIELD_POISE_PARAMETERS_SOURCE_FIRST_20261013.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_REGENERATION_STAT_SOURCE_FIRST_20261013.md](engine/FDG_GODOT_PORT_REGENERATION_STAT_SOURCE_FIRST_20261013.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_RESOURCE_REGENERATION_SOURCE_FIRST_20261013.md](engine/FDG_GODOT_PORT_RESOURCE_REGENERATION_SOURCE_FIRST_20261013.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_SAVE_RAW_GRIT_RESTORE_FIRST_20261014.md](engine/FDG_GODOT_PORT_SAVE_RAW_GRIT_RESTORE_FIRST_20261014.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_SOURCE_DIFFICULTY_SIGNED_FIRST_20261014.md](engine/FDG_GODOT_PORT_SOURCE_DIFFICULTY_SIGNED_FIRST_20261014.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_SOURCE_G_ASSIGNMENT_FIRST_20261014.md](engine/FDG_GODOT_PORT_SOURCE_G_ASSIGNMENT_FIRST_20261014.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_SOURCE_INIT_STAGE_ENTRY_OWNER_FIRST_20261014.md](engine/FDG_GODOT_PORT_SOURCE_INIT_STAGE_ENTRY_OWNER_FIRST_20261014.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_SOURCE_OBJECT_SPRITE_WAIT_OWNER_FIRST_20261014.md](engine/FDG_GODOT_PORT_SOURCE_OBJECT_SPRITE_WAIT_OWNER_FIRST_20261014.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_SOURCE_POST_STAGE_OWNER_FIRST_20261014.md](engine/FDG_GODOT_PORT_SOURCE_POST_STAGE_OWNER_FIRST_20261014.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_SOURCE_PREPARE_START_MAP_VIEW_OWNER_FIRST_20261014.md](engine/FDG_GODOT_PORT_SOURCE_PREPARE_START_MAP_VIEW_OWNER_FIRST_20261014.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_SOURCE_SAVE_LIFECYCLE_OWNER_FIRST_20261014.md](engine/FDG_GODOT_PORT_SOURCE_SAVE_LIFECYCLE_OWNER_FIRST_20261014.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_SOURCE_STARTUP_ACTIVATION_FIRST_20261014.md](engine/FDG_GODOT_PORT_SOURCE_STARTUP_ACTIVATION_FIRST_20261014.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_STARTER_ITEM_FACTORY_SOURCE_FIRST_20261013.md](engine/FDG_GODOT_PORT_STARTER_ITEM_FACTORY_SOURCE_FIRST_20261013.md) | — | Godot 이식 단위 FIRST 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_PORT_STATUS.md](engine/FDG_GODOT_PORT_STATUS.md) (unity판) | [REPO_SYNC_ENGINE_SPLIT_20261027.md](../0마스터플랜/REPO_SYNC_ENGINE_SPLIT_20261027.md) | Godot 이식 사용자용 현황. godot/main 동결(10-27 엔진 분리). |
| [FDG_GODOT_QE_BINDING_20261014.md](engine/FDG_GODOT_QE_BINDING_20261014.md) | — | Godot native 연결·검수 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_RESOURCE_REGENERATION_BINDING_20261014.md](engine/FDG_GODOT_RESOURCE_REGENERATION_BINDING_20261014.md) | — | Godot native 연결·검수 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_SOURCE_GRIT_TOTAL_GETTER_20261014.md](engine/FDG_GODOT_SOURCE_GRIT_TOTAL_GETTER_20261014.md) | — | Godot native 연결·검수 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_SOURCE_NEW_RUN_STATE_20261014.md](engine/FDG_GODOT_SOURCE_NEW_RUN_STATE_20261014.md) (unity판) | — | Godot native 연결·검수 기록(10-13~14). godot/main 동결. 두 판 다름 → unity판 보관(unity에 Godot 후속 추가분 있음) |
| [FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_20261014.md](engine/FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_20261014.md) | — | Godot native 연결·검수 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_SERVICES_20261014.md](engine/FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_SERVICES_20261014.md) | — | Godot native 연결·검수 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_SINKS_20261014.md](engine/FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_SINKS_20261014.md) | — | Godot native 연결·검수 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_SOURCE_PLAYER_PROVIDERS_20261014.md](engine/FDG_GODOT_SOURCE_PLAYER_PROVIDERS_20261014.md) | — | Godot native 연결·검수 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_SOURCE_PLAYER_REGEN_PHASE_20261014.md](engine/FDG_GODOT_SOURCE_PLAYER_REGEN_PHASE_20261014.md) | — | Godot native 연결·검수 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_SOURCE_STARTUP_GATES_20261014.md](engine/FDG_GODOT_SOURCE_STARTUP_GATES_20261014.md) | — | Godot native 연결·검수 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_TYPE3_ACTOR_FIRST_20261013.md](engine/FDG_GODOT_TYPE3_ACTOR_FIRST_20261013.md) | — | Godot native 연결·검수 기록(10-13~14). godot/main 동결 |
| [FDG_GODOT_TYPE3_SPAWN_FIRST_20261013.md](engine/FDG_GODOT_TYPE3_SPAWN_FIRST_20261013.md) (unity판) | — | Godot native 연결·검수 기록(10-13~14). godot/main 동결. 두 판 다름 → unity판 보관(unity에 Godot 후속 추가분 있음) |
| [FDG_NATIVE_CURRENT_EQUIPMENT_AFFIX_20261017.md](engine/FDG_NATIVE_CURRENT_EQUIPMENT_AFFIX_20261017.md) | — | Godot normal hurtE/World callback 소유자 연결 기록(10-17). godot/main 동결 |
| [FDG_NATIVE_FIREBALL_ACTUAL_OWNER_20261017.md](engine/FDG_NATIVE_FIREBALL_ACTUAL_OWNER_20261017.md) | — | Godot normal hurtE/World callback 소유자 연결 기록(10-17). godot/main 동결 |
| [FDG_NATIVE_FIREBALL_FINISH_DISPATCH_20261017.md](engine/FDG_NATIVE_FIREBALL_FINISH_DISPATCH_20261017.md) | — | Godot normal hurtE/World callback 소유자 연결 기록(10-17). godot/main 동결 |
| [FDG_NATIVE_FIREBALL_SAMPLE_GLOBALS_20261017.md](engine/FDG_NATIVE_FIREBALL_SAMPLE_GLOBALS_20261017.md) | — | Godot normal hurtE/World callback 소유자 연결 기록(10-17). godot/main 동결 |
| [FDG_NATIVE_FIREBALL_WORLD_CONSUMER_20261017.md](engine/FDG_NATIVE_FIREBALL_WORLD_CONSUMER_20261017.md) | — | Godot normal hurtE/World callback 소유자 연결 기록(10-17). godot/main 동결 |
| [FDG_NATIVE_MAIN_LEGENDARY_EQUIPMENT_CACHE_20261017.md](engine/FDG_NATIVE_MAIN_LEGENDARY_EQUIPMENT_CACHE_20261017.md) | — | Godot normal hurtE/World callback 소유자 연결 기록(10-17). godot/main 동결 |
| [FDG_NATIVE_NORMAL_ENEMY_EL_MUL_MAIN_SYNC_20261017.md](engine/FDG_NATIVE_NORMAL_ENEMY_EL_MUL_MAIN_SYNC_20261017.md) | — | Godot normal hurtE/World callback 소유자 연결 기록(10-17). godot/main 동결 |
| [FDG_NATIVE_NORMAL_ENEMY_EL_MUL_OWNER_20261017.md](engine/FDG_NATIVE_NORMAL_ENEMY_EL_MUL_OWNER_20261017.md) | — | Godot normal hurtE/World callback 소유자 연결 기록(10-17). godot/main 동결 |
| [FDG_NATIVE_NORMAL_ENEMY_FIELD_OWNER_20261017.md](engine/FDG_NATIVE_NORMAL_ENEMY_FIELD_OWNER_20261017.md) | — | Godot normal hurtE/World callback 소유자 연결 기록(10-17). godot/main 동결 |
| [FDG_NATIVE_NORMAL_ENEMY_KB_OWNER_20261017.md](engine/FDG_NATIVE_NORMAL_ENEMY_KB_OWNER_20261017.md) | — | Godot normal hurtE/World callback 소유자 연결 기록(10-17). godot/main 동결 |
| [FDG_NATIVE_NORMAL_ENEMY_LEQ_MAIN_SYNC_20261017.md](engine/FDG_NATIVE_NORMAL_ENEMY_LEQ_MAIN_SYNC_20261017.md) | — | Godot normal hurtE/World callback 소유자 연결 기록(10-17). godot/main 동결 |
| [FDG_NATIVE_NORMAL_ENEMY_LESSON_ACTIVE_20261017.md](engine/FDG_NATIVE_NORMAL_ENEMY_LESSON_ACTIVE_20261017.md) | — | Godot normal hurtE/World callback 소유자 연결 기록(10-17). godot/main 동결 |
| [FDG_NATIVE_NORMAL_ENEMY_LESSON_ACTIVE_MAIN_SYNC_20261017.md](engine/FDG_NATIVE_NORMAL_ENEMY_LESSON_ACTIVE_MAIN_SYNC_20261017.md) | — | Godot normal hurtE/World callback 소유자 연결 기록(10-17). godot/main 동결 |
| [FDG_NATIVE_NORMAL_ENEMY_LESSON_CALLBACK_20261017.md](engine/FDG_NATIVE_NORMAL_ENEMY_LESSON_CALLBACK_20261017.md) | — | Godot normal hurtE/World callback 소유자 연결 기록(10-17). godot/main 동결 |
| [FDG_NATIVE_NORMAL_ENEMY_LESSON_CALLBACK_MAIN_SYNC_20261017.md](engine/FDG_NATIVE_NORMAL_ENEMY_LESSON_CALLBACK_MAIN_SYNC_20261017.md) | — | Godot normal hurtE/World callback 소유자 연결 기록(10-17). godot/main 동결 |
| [FDG_NATIVE_NORMAL_ENEMY_PDOTPOOL_MAIN_SYNC_20261017.md](engine/FDG_NATIVE_NORMAL_ENEMY_PDOTPOOL_MAIN_SYNC_20261017.md) | — | Godot normal hurtE/World callback 소유자 연결 기록(10-17). godot/main 동결 |
| [FDG_NATIVE_NORMAL_ENEMY_PDOTPOOL_OWNER_20261017.md](engine/FDG_NATIVE_NORMAL_ENEMY_PDOTPOOL_OWNER_20261017.md) | — | Godot normal hurtE/World callback 소유자 연결 기록(10-17). godot/main 동결 |
| [FDG_NATIVE_NORMAL_ENEMY_PLAY_TIME_MAIN_SYNC_20261017.md](engine/FDG_NATIVE_NORMAL_ENEMY_PLAY_TIME_MAIN_SYNC_20261017.md) | — | Godot normal hurtE/World callback 소유자 연결 기록(10-17). godot/main 동결 |
| [FDG_NATIVE_NORMAL_ENEMY_PLAY_TIME_OWNER_20261017.md](engine/FDG_NATIVE_NORMAL_ENEMY_PLAY_TIME_OWNER_20261017.md) | — | Godot normal hurtE/World callback 소유자 연결 기록(10-17). godot/main 동결 |
| [FDG_NATIVE_NORMAL_ENEMY_PLAYER_VIEW_CALLBACK_20261017.md](engine/FDG_NATIVE_NORMAL_ENEMY_PLAYER_VIEW_CALLBACK_20261017.md) | — | Godot normal hurtE/World callback 소유자 연결 기록(10-17). godot/main 동결 |
| [FDG_NATIVE_NORMAL_ENEMY_PLAYER_VIEW_MAIN_SYNC_20261017.md](engine/FDG_NATIVE_NORMAL_ENEMY_PLAYER_VIEW_MAIN_SYNC_20261017.md) | — | Godot normal hurtE/World callback 소유자 연결 기록(10-17). godot/main 동결 |
| [FDG_NATIVE_NORMAL_ENEMY_PROVIDER_BINDING_20261017.md](engine/FDG_NATIVE_NORMAL_ENEMY_PROVIDER_BINDING_20261017.md) | — | Godot normal hurtE/World callback 소유자 연결 기록(10-17). godot/main 동결 |
| [FDG_NATIVE_NORMAL_ENEMY_PROVIDER_MAIN_SYNC_20261017.md](engine/FDG_NATIVE_NORMAL_ENEMY_PROVIDER_MAIN_SYNC_20261017.md) | — | Godot normal hurtE/World callback 소유자 연결 기록(10-17). godot/main 동결 |
| [FDG_NATIVE_NORMAL_ENEMY_RAND_MAIN_SYNC_20261017.md](engine/FDG_NATIVE_NORMAL_ENEMY_RAND_MAIN_SYNC_20261017.md) | — | Godot normal hurtE/World callback 소유자 연결 기록(10-17). godot/main 동결 |
| [FDG_NATIVE_NORMAL_ENEMY_RAND_OWNER_20261017.md](engine/FDG_NATIVE_NORMAL_ENEMY_RAND_OWNER_20261017.md) | — | Godot normal hurtE/World callback 소유자 연결 기록(10-17). godot/main 동결 |
| [FDG_NATIVE_NORMAL_ENEMY_STAT_STR_MAIN_SYNC_20261017.md](engine/FDG_NATIVE_NORMAL_ENEMY_STAT_STR_MAIN_SYNC_20261017.md) | — | Godot normal hurtE/World callback 소유자 연결 기록(10-17). godot/main 동결 |
| [FDG_NATIVE_NORMAL_ENEMY_STAT_STR_OWNER_20261017.md](engine/FDG_NATIVE_NORMAL_ENEMY_STAT_STR_OWNER_20261017.md) | — | Godot normal hurtE/World callback 소유자 연결 기록(10-17). godot/main 동결 |
| [FDG_NATIVE_NORMAL_ENEMY_SYNC_POISE_20261017.md](engine/FDG_NATIVE_NORMAL_ENEMY_SYNC_POISE_20261017.md) (unity판) | — | Godot normal hurtE/World callback 소유자 연결 기록(10-17). godot/main 동결. 두 판 다름 → unity판 보관(unity에 Godot 후속 추가분 있음) |
| [FDG_NATIVE_PLATFORM_FRAME_INPUT_20261017.md](engine/FDG_NATIVE_PLATFORM_FRAME_INPUT_20261017.md) | — | Godot normal hurtE/World callback 소유자 연결 기록(10-17). godot/main 동결 |
| [FDG_NATIVE_PLAYER_PROJECTILE_STORE_20261017.md](engine/FDG_NATIVE_PLAYER_PROJECTILE_STORE_20261017.md) | — | Godot normal hurtE/World callback 소유자 연결 기록(10-17). godot/main 동결 |
| [FDG_NATIVE_SOURCE_CLOCK_INPUT_AUTHORITY_20261017.md](engine/FDG_NATIVE_SOURCE_CLOCK_INPUT_AUTHORITY_20261017.md) | — | Godot normal hurtE/World callback 소유자 연결 기록(10-17). godot/main 동결 |
| [FDG_NATIVE_SOURCE_FRAME_CALLBACK_20261017.md](engine/FDG_NATIVE_SOURCE_FRAME_CALLBACK_20261017.md) | — | Godot normal hurtE/World callback 소유자 연결 기록(10-17). godot/main 동결 |
| [FDG_P1_002_CLOCK_PRODUCER_20261019.md](engine/FDG_P1_002_CLOCK_PRODUCER_20261019.md) (unity판) | — | Godot 이식 P1 단위 작업 문서(10-19). godot/main 동결. 두 판 다름 → unity판 보관(unity에 Godot 후속 추가분 있음) |
| [FDG_P2_001A_HIT_FEEDBACK_20261020.md](engine/FDG_P2_001A_HIT_FEEDBACK_20261020.md) | — | Godot 이식 P2 단위 작업 문서(10-20). godot/main 동결 |
| [FDG_P2_001B_DEATH_IMPACT_FX_20261020.md](engine/FDG_P2_001B_DEATH_IMPACT_FX_20261020.md) | — | Godot 이식 P2 단위 작업 문서(10-20). godot/main 동결 |
| [FDG_P2_001C_KILL_REWARDS_20261020.md](engine/FDG_P2_001C_KILL_REWARDS_20261020.md) (main판) | — | Godot 이식 P2 단위 작업 문서(10-20). godot/main 동결. 두 판 다름 → main판 보관(main이 더 최근, 차이는 10-31 악의오브 개명 치환) |
| [FDG_P2_001E_FIRSTFIGHT_CORRECTNESS_20261020.md](engine/FDG_P2_001E_FIRSTFIGHT_CORRECTNESS_20261020.md) (main판) | — | Godot 이식 P2 단위 작업 문서(10-20). godot/main 동결. 두 판 다름 → main판 보관(main이 더 최근, 차이는 10-31 악의오브 개명 치환) |
| [FDG_P2_001F_DEATH_BLOOD_TIMING_20261020.md](engine/FDG_P2_001F_DEATH_BLOOD_TIMING_20261020.md) | — | Godot 이식 P2 단위 작업 문서(10-20). godot/main 동결 |
| [FDG_P2_001G_KILL_CORE_AND_START_SPAWNS_20261020.md](engine/FDG_P2_001G_KILL_CORE_AND_START_SPAWNS_20261020.md) | — | Godot 이식 P2 단위 작업 문서(10-20). godot/main 동결 |
| [FDG_P2_001H_INTRO_CURTAIN_SEQUENCE_20261020.md](engine/FDG_P2_001H_INTRO_CURTAIN_SEQUENCE_20261020.md) | — | Godot 이식 P2 단위 작업 문서(10-20). godot/main 동결 |
| [FDG_P2_001I_BOOT_INTRO_WIRING_20261020.md](engine/FDG_P2_001I_BOOT_INTRO_WIRING_20261020.md) | — | Godot 이식 P2 단위 작업 문서(10-20). godot/main 동결 |
| [FDG_P2_001J_LESSON_FLOW_AND_CLOCK_20261020.md](engine/FDG_P2_001J_LESSON_FLOW_AND_CLOCK_20261020.md) | — | Godot 이식 P2 단위 작업 문서(10-20). godot/main 동결 |
| [FDG_P2_001K_LESSON_PANEL_PRACTICE_20261020.md](engine/FDG_P2_001K_LESSON_PANEL_PRACTICE_20261020.md) (unity판) | — | Godot 이식 P2 단위 작업 문서(10-20). godot/main 동결. 두 판 다름 → unity판 보관(unity에 Godot 후속 추가분 있음) |
| [FDG_P2_001L_LESSON_STEPS_ALLOWS_20261020.md](engine/FDG_P2_001L_LESSON_STEPS_ALLOWS_20261020.md) (unity판) | — | Godot 이식 P2 단위 작업 문서(10-20). godot/main 동결. 두 판 다름 → unity판 보관(unity에 Godot 후속 추가분 있음) |
| [FDG_P2_002A_HUD_20261020.md](engine/FDG_P2_002A_HUD_20261020.md) (main판) | — | Godot 이식 P2 단위 작업 문서(10-20). godot/main 동결. 두 판 다름 → main판 보관(main이 더 최근, 차이는 10-31 악의오브 개명 치환) |
| [FDG_P2_002B_MINIMAP_CORNER_20261020.md](engine/FDG_P2_002B_MINIMAP_CORNER_20261020.md) | — | Godot 이식 P2 단위 작업 문서(10-20). godot/main 동결 |
| [FDG_P2_003A_LIGHTING_20261020.md](engine/FDG_P2_003A_LIGHTING_20261020.md) (unity판) | — | Godot 이식 P2 단위 작업 문서(10-20). godot/main 동결. 두 판 다름 → unity판 보관(unity에 Godot 후속 추가분 있음) |
| [FDG_P2_004A_PETS_20261020.md](engine/FDG_P2_004A_PETS_20261020.md) (unity판) | — | Godot 이식 P2 단위 작업 문서(10-20). godot/main 동결. 두 판 다름 → unity판 보관(unity에 Godot 후속 추가분 있음) |
| [FDG_P2_004B_PET_DIALOGUE_20261020.md](engine/FDG_P2_004B_PET_DIALOGUE_20261020.md) (main판) | — | Godot 이식 P2 단위 작업 문서(10-20). godot/main 동결. 두 판 다름 → main판 보관(main이 더 최근, 차이는 10-31 악의오브 개명 치환) |
| [FDG_P2_005A_START_SKILLS_20261020.md](engine/FDG_P2_005A_START_SKILLS_20261020.md) (unity판) | — | Godot 이식 P2 단위 작업 문서(10-20). godot/main 동결. 두 판 다름 → unity판 보관(unity에 Godot 후속 추가분 있음) |
| [FDG_P2_005B_GIANT_SLAM_20261020.md](engine/FDG_P2_005B_GIANT_SLAM_20261020.md) (main판) | — | Godot 이식 P2 단위 작업 문서(10-20). godot/main 동결. 두 판 다름 → main판 보관(main이 더 최근, 차이는 10-31 악의오브 개명 치환) |
| [FDG_P2_005C_SPIKE_HOLY_20261020.md](engine/FDG_P2_005C_SPIKE_HOLY_20261020.md) (main판) | — | Godot 이식 P2 단위 작업 문서(10-20). godot/main 동결. 두 판 다름 → main판 보관(main이 더 최근, 차이는 10-31 악의오브 개명 치환) |
| [FDG_P2_005D_REGEN_ICEORB_20261020.md](engine/FDG_P2_005D_REGEN_ICEORB_20261020.md) | — | Godot 이식 P2 단위 작업 문서(10-20). godot/main 동결 |
| [FDG_P2_007A_UI_POLISH_20261020.md](engine/FDG_P2_007A_UI_POLISH_20261020.md) | — | Godot 이식 P2 단위 작업 문서(10-20). godot/main 동결 |
| [FDG_P2_008A_CH1_ENEMIES_20261020.md](engine/FDG_P2_008A_CH1_ENEMIES_20261020.md) | — | Godot 이식 P2 단위 작업 문서(10-20). godot/main 동결 |
| [FDG_P3_002_SPAWN_HOLES_20261020.md](engine/FDG_P3_002_SPAWN_HOLES_20261020.md) (unity판) | — | Godot 이식 P3 단위 작업 문서(10-20). godot/main 동결. 두 판 다름 → unity판 보관(unity에 Godot 후속 추가분 있음) |
| [FDG_P3_003_REGIONS_20261020.md](engine/FDG_P3_003_REGIONS_20261020.md) (unity판) | — | Godot 이식 P3 단위 작업 문서(10-20). godot/main 동결. 두 판 다름 → unity판 보관(unity에 Godot 후속 추가분 있음) |
| [G04_02_20261023.md](engine/G04_02_20261023.md) | — | Godot 성장 트리 대조 보고. 3.1 성장창 신체 패시브 문서 링크 갱신 필요 |
| [INTEG_16B_20261022.md](engine/INTEG_16B_20261022.md) | — | Godot 통합(INTEG) 사용자 플레이 후보 보고 |
| [INTEG12_WEB_PARITY_20261022.md](engine/INTEG12_WEB_PARITY_20261022.md) | — | Godot 웹 동일성 2차 통합 보고 |
| [INTEG12B_HARNESS_REGRESSION_20261022.md](engine/INTEG12B_HARNESS_REGRESSION_20261022.md) | — | Godot 하니스 회귀 보완 보고 |
| [INTEG12C_BOOT_REPLAY_20261022.md](engine/INTEG12C_BOOT_REPLAY_20261022.md) | — | Godot 영상 pause·리플레이 통합 보고. 12퍼포먼스 VRAM_01 링크 갱신 필요 |
| [INTEG13_SKILL_COMBAT_20261022.md](engine/INTEG13_SKILL_COMBAT_20261022.md) | — | Godot 스킬 통합 보고 |
| [INTEG14_HUD_SNAPSHOT_HS_M7_20261022.md](engine/INTEG14_HUD_SNAPSHOT_HS_M7_20261022.md) | — | Godot PC HUD·snapshot 통합 보고 |
| [INTEG15_WEB_PARITY_20261022.md](engine/INTEG15_WEB_PARITY_20261022.md) | — | Godot 웹 동일성 3차 통합 보고 |
| [INTEG15B_PC_COMBAT_MAC_20261022.md](engine/INTEG15B_PC_COMBAT_MAC_20261022.md) | — | Godot PC 전투·보행 통합 보고 |
| [INTEG17_PC_MERGE_20261023.md](engine/INTEG17_PC_MERGE_20261023.md) | — | Godot PC 3브랜치 소스 통합 보고 |
| [INTEG17B_PC_SYS_LEFTOVERS_20261023.md](engine/INTEG17B_PC_SYS_LEFTOVERS_20261023.md) | — | Godot 통합 merge 기록 |
| [INTEG17C_PLAYER_SHIELD_SAVE_HANDOFF_20261023.md](engine/INTEG17C_PLAYER_SHIELD_SAVE_HANDOFF_20261023.md) | — | Godot 쉴드·저장 하니스 통합 기록 |
| [INTEG17D_PC_SPAWN_MERGE_20261023.md](engine/INTEG17D_PC_SPAWN_MERGE_20261023.md) | — | Godot 스폰 동일성 통합 보고 |
| [INTEG2_DEMO11_20261021.md](engine/INTEG2_DEMO11_20261021.md) | — | Godot 1-1 통합 보고 |
| [INTEG2b_MAP11_PERF_20261021.md](engine/INTEG2b_MAP11_PERF_20261021.md) | — | Godot MAP11 벤치 진단 보고 |
| [INTEG3_DEMO11_20261021.md](engine/INTEG3_DEMO11_20261021.md) | — | Godot 통합 보고 |
| [INTEG3B_DEMO11_20261021.md](engine/INTEG3B_DEMO11_20261021.md) | — | Godot 재검수 보고. 4.1 MAP11 계획 링크 갱신 필요 |
| [INTEG4_DEMO11_20261021.md](engine/INTEG4_DEMO11_20261021.md) | — | Godot 통합 준비 보고 |
| [INTEG5_SOURCE_SNAPSHOT_20261021.md](engine/INTEG5_SOURCE_SNAPSHOT_20261021.md) | — | Godot용 godot/source_snapshot 고정 원본 계약. Unity oracle은 별도 체계 |
| [INTEG5_VALIDATION_20261021.md](engine/INTEG5_VALIDATION_20261021.md) | — | Godot 통합·검증 보고 |
| [INTEG6B_REGRESSION_20261021.md](engine/INTEG6B_REGRESSION_20261021.md) | — | Godot 회귀 수정 보고. 4.1 MAP11_PRODUCTION_BINDING 링크 갱신 필요 |
| [INTEG6C_REGRESSION_20261021.md](engine/INTEG6C_REGRESSION_20261021.md) | — | Godot 보스 BGM 통합 보고. 6사운드 BGM_믹스_공식 링크 갱신 필요 |
| [LOBBY_01_20261021.md](engine/LOBBY_01_20261021.md) | — | Godot 로비 화면 계약. 3.1 UI_COMPOSITION 링크 갱신 필요 |
| [PARITY_BOSS_01_20261022.md](engine/PARITY_BOSS_01_20261022.md) | — | 웹↔Godot 동일성 작업 단위(10-22, DEMO11/INTEG 브랜치). Godot 동결로 끝난 기록 |
| [PARITY_BOSS_02_20261022.md](engine/PARITY_BOSS_02_20261022.md) | — | 웹↔Godot 동일성 작업 단위(10-22, DEMO11/INTEG 브랜치). Godot 동결로 끝난 기록 |
| [PARITY_BOSS_03_20261022.md](engine/PARITY_BOSS_03_20261022.md) | — | 웹↔Godot 동일성 작업 단위(10-22, DEMO11/INTEG 브랜치). Godot 동결로 끝난 기록 |
| [PARITY_FULL_SWEEP_1_1_20261022.md](engine/PARITY_FULL_SWEEP_1_1_20261022.md) | — | 웹↔Godot 동일성 작업 단위(10-22, DEMO11/INTEG 브랜치). Godot 동결로 끝난 기록 |
| [PARITY_HS_01_20261022.md](engine/PARITY_HS_01_20261022.md) | — | 웹↔Godot 동일성 작업 단위(10-22, DEMO11/INTEG 브랜치). Godot 동결로 끝난 기록 |
| [PARITY_HUD_01_20261022.md](engine/PARITY_HUD_01_20261022.md) | — | 웹↔Godot 동일성 작업 단위(10-22, DEMO11/INTEG 브랜치). Godot 동결로 끝난 기록 |
| [PARITY_HUD_02_20261022.md](engine/PARITY_HUD_02_20261022.md) | — | 웹↔Godot 동일성 작업 단위(10-22, DEMO11/INTEG 브랜치). Godot 동결로 끝난 기록 |
| [PARITY_INTEG12_PC_VERIFY_20261022.md](engine/PARITY_INTEG12_PC_VERIFY_20261022.md) | — | INTEG-12 웹↔Godot PC 동일성 검수(10-22). main에만 있으나 현행 아님 → MIGRATE 대신 unity/main _archive로 이동(parity_refs/integ12 이미지 동반) |
| [PARITY_INTRO_01_20261022.md](engine/PARITY_INTRO_01_20261022.md) | [PARITY_INTRO_01b_20261022.md](engine/PARITY_INTRO_01b_20261022.md) | 웹↔Godot 인트로 표시 복원(10-22), 후속 INTRO_01b. Godot 동결 |
| [PARITY_INTRO_01b_20261022.md](engine/PARITY_INTRO_01b_20261022.md) | — | 웹↔Godot 동일성 작업 단위(10-22, DEMO11/INTEG 브랜치). Godot 동결로 끝난 기록 |
| [PARITY_MAP_01_20261022.md](engine/PARITY_MAP_01_20261022.md) | [PARITY_MAP_03_20261022.md](engine/PARITY_MAP_03_20261022.md) | 웹↔Godot 1-1 맵 동일성 후보(10-22). 문서 스스로 PARITY_MAP_03을 후속으로 지정, Godot 동결. |
| [PARITY_MAP_02_20261022.md](engine/PARITY_MAP_02_20261022.md) | [PARITY_MAP_03_20261022.md](engine/PARITY_MAP_03_20261022.md) | 웹↔Godot 1-1 맵 동일성 후보(10-22). 문서 스스로 PARITY_MAP_03을 후속으로 지정, Godot 동결 |
| [PARITY_MAP_03_20261022.md](engine/PARITY_MAP_03_20261022.md) | — | 웹↔Godot 동일성 작업 단위(10-22, DEMO11/INTEG 브랜치). Godot 동결로 끝난 기록 |
| [PARITY_MAP_04_20261022.md](engine/PARITY_MAP_04_20261022.md) | — | 웹↔Godot 동일성 작업 단위(10-22, DEMO11/INTEG 브랜치). Godot 동결로 끝난 기록 |
| [PARITY_SKILL_01_20261022.md](engine/PARITY_SKILL_01_20261022.md) | — | 웹↔Godot 동일성 작업 단위(10-22, DEMO11/INTEG 브랜치). Godot 동결로 끝난 기록 |
| [PARITY_SWEEP_B_PC_20261022.md](engine/PARITY_SWEEP_B_PC_20261022.md) | — | 웹↔Godot 동일성 작업 단위(10-22, DEMO11/INTEG 브랜치). Godot 동결로 끝난 기록 |
| [PARITY_UI_01_20261022.md](engine/PARITY_UI_01_20261022.md) | — | 웹↔Godot 동일성 작업 단위(10-22, DEMO11/INTEG 브랜치). Godot 동결로 끝난 기록 |
| [PARITY_UI_02_20261022.md](engine/PARITY_UI_02_20261022.md) | — | 웹↔Godot 동일성 작업 단위(10-22, DEMO11/INTEG 브랜치). Godot 동결로 끝난 기록 |
| [PARITY_UI_03_20261022.md](engine/PARITY_UI_03_20261022.md) | — | 웹↔Godot 동일성 작업 단위(10-22, DEMO11/INTEG 브랜치). Godot 동결로 끝난 기록 |
| [PARITY_UI_04_20261022.md](engine/PARITY_UI_04_20261022.md) | — | 웹↔Godot 동일성 작업 단위(10-22, DEMO11/INTEG 브랜치). Godot 동결로 끝난 기록 |
| [PARITY_UI_05_20261022.md](engine/PARITY_UI_05_20261022.md) | — | 웹↔Godot 동일성 작업 단위(10-22, DEMO11/INTEG 브랜치). Godot 동결로 끝난 기록 |
| [PARITY_UI_06_20261022.md](engine/PARITY_UI_06_20261022.md) | — | 웹↔Godot 동일성 작업 단위(10-22, DEMO11/INTEG 브랜치). Godot 동결로 끝난 기록 |
| [PC_COMBAT_KILL_20261022.md](engine/PC_COMBAT_KILL_20261022.md) | — | Godot PC 전투 처치 보고 |
| [PC_FIREBALL_DELIVERY_20261022.md](engine/PC_FIREBALL_DELIVERY_20261022.md) | — | Godot 악의구 배달 수정 보고 |
| [PC_INPUT_PARITY_20261022.md](engine/PC_INPUT_PARITY_20261022.md) | — | Godot 입력 씹힘 수정 보고 |
| [PC_M29_PARRY_CONTRACT_20261021.md](engine/PC_M29_PARRY_CONTRACT_20261021.md) (unity판) | — | Godot type3 패링 접촉 계약. 검증: 보관판은 unity판(10-22 스냅샷 갱신 줄 포함)에 main의 '악의→악의오브' 치환 2곳만 덧붙인다 |
| [PC_SKILL_INPUT_TABLE_20261022.md](engine/PC_SKILL_INPUT_TABLE_20261022.md) | — | 웹↔Godot 스킬 입력 발동표. Godot 동결 |
| [PC_SPAWN_PARITY_20261023.md](engine/PC_SPAWN_PARITY_20261023.md) | — | Godot 스폰 동일성 보고. QA_PERFORMANCE_TEAM_MASTER·8.0 DEMO11_NATURAL_ENEMY_BASE 링크 갱신 필요 |
| [PCIA_WIRE_REPORT_20261021.md](engine/PCIA_WIRE_REPORT_20261021.md) | — | Godot Mac lifecycle 연결 보고. 2_5·2_7·7아이템 링크 갱신 필요 |
| [PCIB_WIRE_REPORT_20261021.md](engine/PCIB_WIRE_REPORT_20261021.md) | — | Godot Mac 호출부 연결 보고 |
| [PLAYTEST_FIX_20261030.md](engine/PLAYTEST_FIX_20261030.md) | — | 10-30 사용자 플레이 결함 수정 일회성 실행 증거 보고. 현행 문서 링크 없음 |
| [SRCMAP_01_SOURCE_MAP_20261022.md](engine/SRCMAP_01_SOURCE_MAP_20261022.md) | — | Godot Mac 동결 구현의 웹 원본 대응표. Godot 동결 |
| [SWEEP_B_20261022.md](engine/SWEEP_B_20261022.md) | — | Godot UI 전수 차이 목록 |
| [SWEEP_B2_20261023.md](engine/SWEEP_B2_20261023.md) | — | Godot 웹 UI 동일화 보고. 2_4 펫·3.1 UI_COMPOSITION 링크 갱신 필요 |
| [SWEEP_B3_20261023.md](engine/SWEEP_B3_20261023.md) | — | Godot 웹 UI 재대조 보고. 3.1 문서 3개 링크 갱신 필요 |
| [TEST_FIX_01_20261022.md](engine/TEST_FIX_01_20261022.md) | — | Godot 테스트 안정화 보고 |
| [UNITY_CHARACTER_IMPORT_CANDIDATE_20261028.md](engine/UNITY_CHARACTER_IMPORT_CANDIDATE_20261028.md) | [UNITY_CHARACTER_BOARD_20261027.md](../engine/UNITY_CHARACTER_BOARD_20261027.md) | 실버테일·아이반 소스 준비 단계 일회성 기록, 본문이 현행은 캐릭터 보드라 명시. 링크 없음 |
| [UNITY_HUD_DOCK_20261024.md](engine/UNITY_HUD_DOCK_20261024.md) | [UNITY_UI_ULTRAWIDE_20261031.md](../engine/UNITY_UI_ULTRAWIDE_20261031.md) | 전체폭 도킹 옛 후보, 본문이 이력이라 명시 |
| [UNITY_INVENTORY_DOCK_20261024.md](engine/UNITY_INVENTORY_DOCK_20261024.md) | [UNITY_UI_ULTRAWIDE_20261031.md](../engine/UNITY_UI_ULTRAWIDE_20261031.md) | 인벤토리 도킹 옛 후보 이력, 현행은 초광폭 SSOT |
| [UNITY_LOBBY_MEDIA_RECOVERY_20261024.md](engine/UNITY_LOBBY_MEDIA_RECOVERY_20261024.md) | [UNITY_WORLD_INTRO_CANONICAL_20261025.md](../engine/UNITY_WORLD_INTRO_CANONICAL_20261025.md) | v22b 미디어 복구 일회성 기록, 10-25 정본 확정으로 대체 |
| [UNITY_MAC_A03A04_INTEGRATION_20261027.md](engine/UNITY_MAC_A03A04_INTEGRATION_20261027.md) | [UNITY_MAC_A03A04_UI_REVIEW_20261027.md](../engine/UNITY_MAC_A03A04_UI_REVIEW_20261027.md) | 10-27 PC A03/A04 최소 인수 일회성 영수증(GUID·SHA). 참조는 CHANGELOG_SYNC·WORK_BOARD 로그뿐이고 현행 계약은 UI_REVIEW에 있다 |
| [UNITY_MAC_A04_FIVE_SLOTS_OS_QA_20261029.md](engine/UNITY_MAC_A04_FIVE_SLOTS_OS_QA_20261029.md) | [UNITY_MAC_CHARACTER_CAPACITY_QA_20261101.md](../engine/UNITY_MAC_CHARACTER_CAPACITY_QA_20261101.md) | 5/5 용량 경계 OS 검수 결과. 11-01 개수 제한 제거로 동작이 바뀌었다. CHARACTER_SLOTS의 링크를 함께 고친다 |
| [UNITY_MAC_A15_LABEL_PREFLIGHT_20261027.md](engine/UNITY_MAC_A15_LABEL_PREFLIGHT_20261027.md) | [UNITY_MAC_A15_LABEL_ADAPTER_20261027.md](../engine/UNITY_MAC_A15_LABEL_ADAPTER_20261027.md) | 채택 전 사전 대조. 실제 연결은 LABEL_ADAPTER가 대체했다. 4TAB의 링크를 함께 고친다 |
| [UNITY_MAC_CINEMATIC_LANGUAGE_20261025.md](engine/UNITY_MAC_CINEMATIC_LANGUAGE_20261025.md) | [UNITY_MAC_LANGUAGE_MENU_PARITY_20261025.md](../engine/UNITY_MAC_LANGUAGE_MENU_PARITY_20261025.md) | 머리말에 2열·Tab·CODE[L]은 이력이라고 적혀 있고 영상 입력 차단도 MENU_PARITY에 있다. 짝 .json도 함께 옮긴다 |
| [UNITY_MAC_INVENTORY_HINT_20261026.md](engine/UNITY_MAC_INVENTORY_HINT_20261026.md) | [UNITY_PC_INVENTORY_A25_PREVIEW_20261026.md](../engine/UNITY_PC_INVENTORY_A25_PREVIEW_20261026.md) | NativeInventoryComparison이 A25에서 전면 교체돼 안내 문구가 코드에 없다. 짝 _ACCEPTANCE .json도 함께 옮긴다 |
| [UNITY_MAC_LANGUAGE_DIAGNOSTICS_20261025.md](engine/UNITY_MAC_LANGUAGE_DIAGNOSTICS_20261025.md) | [UNITY_SUBTITLE_FONT_COVERAGE_20261025.md](../engine/UNITY_SUBTITLE_FONT_COVERAGE_20261025.md) | 10-25 진단 마감 보고. 참조는 WORK_BOARD뿐이고 후속 글꼴 상태는 SUBTITLE_FONT_COVERAGE로 넘어갔다 |
| [UNITY_MAC_LOBBY_POPUP_20261025.md](engine/UNITY_MAC_LOBBY_POPUP_20261025.md) | [UNITY_MAC_LANGUAGE_MENU_PARITY_20261025.md](../engine/UNITY_MAC_LANGUAGE_MENU_PARITY_20261025.md) | 머리말에 이력이라고 적혀 있다. 바깥 클릭·Esc/Tab 계약은 MENU_PARITY에 있다. 짝 .json도 함께 옮긴다 |
| [UNITY_MAC_NATURAL_WORLD_INTRO_20261027.md](engine/UNITY_MAC_NATURAL_WORLD_INTRO_20261027.md) | [UNITY_WORLD_INTRO_CANONICAL_20261025.md](../engine/UNITY_WORLD_INTRO_CANONICAL_20261025.md) | 10-27 일회성 자연완주 QA. 참조는 같이 보관하는 START_TO_FIELD와 로그뿐 |
| [UNITY_MAC_PC_UI_PREFLIGHT_20261026.md](engine/UNITY_MAC_PC_UI_PREFLIGHT_20261026.md) | — | 10-26 PC 패치 1–19 병합 전 사전 대조. 적용이 끝났고 참조는 로그(CHANGELOG_SYNC·WORK_BOARD)뿐 |
| [UNITY_MAC_START_TO_FIELD_QA_20261027.md](engine/UNITY_MAC_START_TO_FIELD_QA_20261027.md) | [UNITY_MAC_FIRST_PRACTICE_20261026.md](../engine/UNITY_MAC_FIRST_PRACTICE_20261026.md) | 10-27 일회성 실키보드 순회 QA. 남은 HOLD는 FIRST_PRACTICE·PRACTICE_MOUSE_BRIDGE에서 추적 |
| [UNITY_PC_EXIT_CRASH_20261026.md](engine/UNITY_PC_EXIT_CRASH_20261026.md) | — | 종료 크래시 조사 보고. 6000.6.7f1 업그레이드로 해결, 결정은 orders/UNITY_CLAUDE_CODEX_AGREEMENT 표에 남아 있다(그 문서 링크 수정) |
| [UNITY_PC_LINEAR1_REPORT_20261026.md](engine/UNITY_PC_LINEAR1_REPORT_20261026.md) | [UNITY_RM0_ENGINE_20261027.md](../engine/UNITY_RM0_ENGINE_20261027.md) | 'Gamma 유지' 결정 요청 보고. 10-28 Linear 전환(RM0 §색공간)으로 대체. main에만 있으나 unity AGREEMENT의 깨진 링크 복구를 위해 unity/main _archive로 가져온다 |
| [UNITY_UI_DOCK_20261024.md](engine/UNITY_UI_DOCK_20261024.md) | [UNITY_UI_ULTRAWIDE_20261031.md](../engine/UNITY_UI_ULTRAWIDE_20261031.md) | UI 전체폭 도킹 옛 후보 이력, 10-24~25 문서만 링크 |
| [WEB_UNITY_PARITY_20261101.md](engine/WEB_UNITY_PARITY_20261101.md) | [WEB_DEPLOYMENT_REPAIR_20261002.md](../13출시·마케팅/WEB_DEPLOYMENT_REPAIR_20261002.md) | 11-01 웹 배포 한도(Vercel 4GB·100MB) 일회성 조사. 검증: 후계는 LEDGER가 아니라 WEB_DEPLOYMENT_REPAIR |
| [ZOOM_01_REPORT_20261021.md](engine/ZOOM_01_REPORT_20261021.md) | — | Godot 카메라 비교 보고 |
| [ZOOM_01B_REPORT_20261022.md](engine/ZOOM_01B_REPORT_20261022.md) | — | Godot 재촬영 보고 |

## engine/orders (1)

| 문서 | 후계 | 이유 |
|---|---|---|
| [MAC_ORDERS_20261020.md](engine/orders/MAC_ORDERS_20261020.md) | — | 10-20 Godot PC/Mac 이식 Mac 작업 지시서. Godot 동결, WORK_BOARD·보고서만 링크(현행 문서 링크 없음) |

## engine/orders/reports (185)

10-20~10-24 Godot(FDG) 이식 단위 작업 보고 묶음이다. 후계 문서는 없다(Godot 동결). 공통 이유: Godot 이식 일회성 보고(동결·종료). 링크하던 현행 문서는 plan.json의 linkUpdates에 있다.

- [bc-chain-m_REPORT](engine/orders/reports/bc-chain-m_REPORT.md) · [bc-integ-01_REPORT](engine/orders/reports/bc-integ-01_REPORT.md) · [bc01_REPORT](engine/orders/reports/bc01_REPORT.md) · [bc02_REPORT](engine/orders/reports/bc02_REPORT.md) · [bc03_REPORT](engine/orders/reports/bc03_REPORT.md) · [bc04_REPORT](engine/orders/reports/bc04_REPORT.md) · [bc05_REPORT](engine/orders/reports/bc05_REPORT.md) · [bc06_REPORT](engine/orders/reports/bc06_REPORT.md)
- [bc07_REPORT](engine/orders/reports/bc07_REPORT.md) · [bc08_REPORT](engine/orders/reports/bc08_REPORT.md) · [bc09_REPORT](engine/orders/reports/bc09_REPORT.md) · [bc10_REPORT](engine/orders/reports/bc10_REPORT.md) · [bc2-01_REPORT](engine/orders/reports/bc2-01_REPORT.md) · [bc2-02_REPORT](engine/orders/reports/bc2-02_REPORT.md) · [bc2-03_REPORT](engine/orders/reports/bc2-03_REPORT.md) · [bc2-04_REPORT](engine/orders/reports/bc2-04_REPORT.md)
- [bc2-05_REPORT](engine/orders/reports/bc2-05_REPORT.md) · [bc2-06_REPORT](engine/orders/reports/bc2-06_REPORT.md) · [bc2-07_REPORT](engine/orders/reports/bc2-07_REPORT.md) · [bc3-01r_REPORT](engine/orders/reports/bc3-01r_REPORT.md) · [ch-map-pin_REPORT](engine/orders/reports/ch-map-pin_REPORT.md) · [ch1-01_REPORT](engine/orders/reports/ch1-01_REPORT.md) · [ch1-02_REPORT](engine/orders/reports/ch1-02_REPORT.md) · [ch1-03_REPORT](engine/orders/reports/ch1-03_REPORT.md)
- [ch1-04_REPORT](engine/orders/reports/ch1-04_REPORT.md) · [ch2-01_REPORT](engine/orders/reports/ch2-01_REPORT.md) · [ch2-02_REPORT](engine/orders/reports/ch2-02_REPORT.md) · [demo11-01_REPORT](engine/orders/reports/demo11-01_REPORT.md) · [demo11-04_REPORT](engine/orders/reports/demo11-04_REPORT.md) · [demo11-05_REPORT](engine/orders/reports/demo11-05_REPORT.md) · [demo11-06_REPORT](engine/orders/reports/demo11-06_REPORT.md) · [demo11-06b_merge_REPORT](engine/orders/reports/demo11-06b_merge_REPORT.md)
- [demo11-06b_REPORT](engine/orders/reports/demo11-06b_REPORT.md) · [demo11-06c_REPORT](engine/orders/reports/demo11-06c_REPORT.md) · [demo11-07_REPORT](engine/orders/reports/demo11-07_REPORT.md) · [demo11-08_REPORT](engine/orders/reports/demo11-08_REPORT.md) · [demo11-08m_REPORT](engine/orders/reports/demo11-08m_REPORT.md) · [demo11-09_REPORT](engine/orders/reports/demo11-09_REPORT.md) · [demo11-16_REPORT](engine/orders/reports/demo11-16_REPORT.md)(unity판) · [demo11-17_REPORT](engine/orders/reports/demo11-17_REPORT.md)(unity판)
- [demo11-18_REPORT](engine/orders/reports/demo11-18_REPORT.md) · [demo11-19r_REPORT](engine/orders/reports/demo11-19r_REPORT.md) · [demo11-19ui_REPORT](engine/orders/reports/demo11-19ui_REPORT.md) · [demo11-20_REPORT](engine/orders/reports/demo11-20_REPORT.md) · [demo11-21_REPORT](engine/orders/reports/demo11-21_REPORT.md) · [demo11-21fix_REPORT](engine/orders/reports/demo11-21fix_REPORT.md) · [demo11-22r_REPORT](engine/orders/reports/demo11-22r_REPORT.md) · [demo11-23_REPORT](engine/orders/reports/demo11-23_REPORT.md)
- [demo11-23b_REPORT](engine/orders/reports/demo11-23b_REPORT.md) · [demo11-24_REPORT](engine/orders/reports/demo11-24_REPORT.md) · [demo11-24b_REPORT](engine/orders/reports/demo11-24b_REPORT.md) · [demo11-25_REPORT](engine/orders/reports/demo11-25_REPORT.md)(unity판) · [demo11-27_REPORT](engine/orders/reports/demo11-27_REPORT.md)(unity판) · [demo11-28_REPORT](engine/orders/reports/demo11-28_REPORT.md) · [demo11-28_RETOUCH_REPORT](engine/orders/reports/demo11-28_RETOUCH_REPORT.md) · [demo11-29_REPORT](engine/orders/reports/demo11-29_REPORT.md)
- [demo11-30_REPORT](engine/orders/reports/demo11-30_REPORT.md) · [demo11-31_REPORT](engine/orders/reports/demo11-31_REPORT.md) · [demo11-32_REPORT](engine/orders/reports/demo11-32_REPORT.md) · [demo11-33_REPORT](engine/orders/reports/demo11-33_REPORT.md) · [demo11-34_REPORT](engine/orders/reports/demo11-34_REPORT.md) · [demo11-35_REPORT](engine/orders/reports/demo11-35_REPORT.md) · [demo11-37_REPORT](engine/orders/reports/demo11-37_REPORT.md) · [demo11-38_REPORT](engine/orders/reports/demo11-38_REPORT.md)
- [demo11-39_REPORT](engine/orders/reports/demo11-39_REPORT.md) · [demo11-40_REPORT](engine/orders/reports/demo11-40_REPORT.md) · [demo11-41_REPORT](engine/orders/reports/demo11-41_REPORT.md) · [demo11-41m_REPORT](engine/orders/reports/demo11-41m_REPORT.md) · [demo11-42_REPORT](engine/orders/reports/demo11-42_REPORT.md) · [demo11-43_REPORT](engine/orders/reports/demo11-43_REPORT.md) · [demo11-44_REPORT](engine/orders/reports/demo11-44_REPORT.md) · [demo11-45_REPORT](engine/orders/reports/demo11-45_REPORT.md)
- [demo11-47h_REPORT](engine/orders/reports/demo11-47h_REPORT.md) · [demo11-47i_REPORT](engine/orders/reports/demo11-47i_REPORT.md) · [demo11-47j_REPORT](engine/orders/reports/demo11-47j_REPORT.md) · [demo11-47k_REPORT](engine/orders/reports/demo11-47k_REPORT.md) · [demo11-50_REPORT](engine/orders/reports/demo11-50_REPORT.md) · [demo11-enemy-base_REPORT](engine/orders/reports/demo11-enemy-base_REPORT.md) · [demo11-enemy-base2_REPORT](engine/orders/reports/demo11-enemy-base2_REPORT.md) · [demo11-enemy-base3_REPORT](engine/orders/reports/demo11-enemy-base3_REPORT.md)
- [demo11-etype-a_REPORT](engine/orders/reports/demo11-etype-a_REPORT.md) · [demo11-etype-b_REPORT](engine/orders/reports/demo11-etype-b_REPORT.md) · [demo11-etype-d_REPORT](engine/orders/reports/demo11-etype-d_REPORT.md) · [demo11-etype-e_REPORT](engine/orders/reports/demo11-etype-e_REPORT.md) · [demo11-etype-f_REPORT](engine/orders/reports/demo11-etype-f_REPORT.md) · [demo11-i18n_REPORT](engine/orders/reports/demo11-i18n_REPORT.md) · [demo11-integ_REPORT](engine/orders/reports/demo11-integ_REPORT.md) · [demo11-perf-enemy_REPORT](engine/orders/reports/demo11-perf-enemy_REPORT.md)
- [DOC-SYNC_REPORT](engine/orders/reports/DOC-SYNC_REPORT.md)(unity판) · [ec2-01_REPORT](engine/orders/reports/ec2-01_REPORT.md) · [ec2-02_REPORT](engine/orders/reports/ec2-02_REPORT.md) · [ec3-01_REPORT](engine/orders/reports/ec3-01_REPORT.md) · [ec3-02_REPORT](engine/orders/reports/ec3-02_REPORT.md) · [ec3-03_REPORT](engine/orders/reports/ec3-03_REPORT.md) · [ec4-01_REPORT](engine/orders/reports/ec4-01_REPORT.md) · [ec4-02_REPORT](engine/orders/reports/ec4-02_REPORT.md)
- [el-01_REPORT](engine/orders/reports/el-01_REPORT.md) · [FEATURE-INVENTORY_REPORT](engine/orders/reports/FEATURE-INVENTORY_REPORT.md) · [fieldboss-unify_REPORT](engine/orders/reports/fieldboss-unify_REPORT.md) · [integ-fix_AUDIO_SUPPLEMENT](engine/orders/reports/integ-fix_AUDIO_SUPPLEMENT.md) · [integ-fix_REPORT](engine/orders/reports/integ-fix_REPORT.md) · [it-01_REPORT](engine/orders/reports/it-01_REPORT.md) · [it-02_REPORT](engine/orders/reports/it-02_REPORT.md) · [it-03_REPORT](engine/orders/reports/it-03_REPORT.md)
- [it-04_REPORT](engine/orders/reports/it-04_REPORT.md) · [it-05_REPORT](engine/orders/reports/it-05_REPORT.md) · [look-001_REPORT](engine/orders/reports/look-001_REPORT.md) · [MAC-TESTSWEEP_REPORT](engine/orders/reports/MAC-TESTSWEEP_REPORT.md) · [mac-verify_REPORT](engine/orders/reports/mac-verify_REPORT.md) · [map11-prod_REPORT](engine/orders/reports/map11-prod_REPORT.md) · [MAPLOOK-HOLE_REPORT](engine/orders/reports/MAPLOOK-HOLE_REPORT.md) · [meta-01_REPORT](engine/orders/reports/meta-01_REPORT.md)
- [meta-02_REPORT](engine/orders/reports/meta-02_REPORT.md)(unity판) · [meta-03_REPORT](engine/orders/reports/meta-03_REPORT.md)(unity판) · [meta-04_REPORT](engine/orders/reports/meta-04_REPORT.md) · [meta-05_REPORT](engine/orders/reports/meta-05_REPORT.md) · [meta-06_REPORT](engine/orders/reports/meta-06_REPORT.md) · [nw-01_REPORT](engine/orders/reports/nw-01_REPORT.md) · [nw-02_REPORT](engine/orders/reports/nw-02_REPORT.md) · [nw-03_REPORT](engine/orders/reports/nw-03_REPORT.md)(unity판)
- [NW-FIX-01_REPORT](engine/orders/reports/NW-FIX-01_REPORT.md) · [P2-001l_REPORT](engine/orders/reports/P2-001l_REPORT.md) · [P2-004B_REPORT](engine/orders/reports/P2-004B_REPORT.md) · [P2-006a_REPORT](engine/orders/reports/P2-006a_REPORT.md) · [P2-006b_REPORT](engine/orders/reports/P2-006b_REPORT.md) · [P2-007a_REPORT](engine/orders/reports/P2-007a_REPORT.md) · [P2-008a_REPORT](engine/orders/reports/P2-008a_REPORT.md) · [p2-008a-fix_REPORT](engine/orders/reports/p2-008a-fix_REPORT.md)
- [p2001i-diag_REPORT](engine/orders/reports/p2001i-diag_REPORT.md) · [P3-001_REPORT](engine/orders/reports/P3-001_REPORT.md) · [P3-003_REPORT](engine/orders/reports/P3-003_REPORT.md) · [P5-001a_REPORT](engine/orders/reports/P5-001a_REPORT.md) · [pc-boot01_REPORT](engine/orders/reports/pc-boot01_REPORT.md) · [pc-boss-chase_REPORT](engine/orders/reports/pc-boss-chase_REPORT.md) · [pc-boss-core_REPORT](engine/orders/reports/pc-boss-core_REPORT.md) · [pc-boss-parity_REPORT](engine/orders/reports/pc-boss-parity_REPORT.md)
- [pc-combat-kill_REPORT](engine/orders/reports/pc-combat-kill_REPORT.md) · [pc-combat-pack-b_REPORT](engine/orders/reports/pc-combat-pack-b_REPORT.md) · [pc-followups_REPORT](engine/orders/reports/pc-followups_REPORT.md) · [pc-life-pack_REPORT](engine/orders/reports/pc-life-pack_REPORT.md) · [pc-m29-parry_REPORT](engine/orders/reports/pc-m29-parry_REPORT.md) · [pc-move-skills_REPORT](engine/orders/reports/pc-move-skills_REPORT.md) · [pc-runtime-stats_REPORT](engine/orders/reports/pc-runtime-stats_REPORT.md) · [pc-skill-writers_REPORT](engine/orders/reports/pc-skill-writers_REPORT.md)
- [pc-source-perf_REPORT](engine/orders/reports/pc-source-perf_REPORT.md) · [pc-spawn-parity_REPORT](engine/orders/reports/pc-spawn-parity_REPORT.md) · [pc-sweep-b_REPORT](engine/orders/reports/pc-sweep-b_REPORT.md) · [pc-sys-leftovers_REPORT](engine/orders/reports/pc-sys-leftovers_REPORT.md) · [PORT-TAKEOVER-01_REPORT](engine/orders/reports/PORT-TAKEOVER-01_REPORT.md) · [PORT-TAKEOVER-02_REPORT](engine/orders/reports/PORT-TAKEOVER-02_REPORT.md) · [PORT-TAKEOVER-03_REPORT](engine/orders/reports/PORT-TAKEOVER-03_REPORT.md) · [QA-001_REPORT](engine/orders/reports/QA-001_REPORT.md)
- [QA-002_REPORT](engine/orders/reports/QA-002_REPORT.md) · [qa-003_REPORT](engine/orders/reports/qa-003_REPORT.md) · [qa-004_REPORT](engine/orders/reports/qa-004_REPORT.md) · [qa-005_REPORT](engine/orders/reports/qa-005_REPORT.md) · [qa-006_REPORT](engine/orders/reports/qa-006_REPORT.md) · [qs-01_REPORT](engine/orders/reports/qs-01_REPORT.md)(unity판) · [settings-s01_REPORT](engine/orders/reports/settings-s01_REPORT.md) · [sk-s01_REPORT](engine/orders/reports/sk-s01_REPORT.md)
- [sk-s02_REPORT](engine/orders/reports/sk-s02_REPORT.md) · [sk-s03_REPORT](engine/orders/reports/sk-s03_REPORT.md)(unity판) · [sk-s04_REPORT](engine/orders/reports/sk-s04_REPORT.md) · [sk-s05_REPORT](engine/orders/reports/sk-s05_REPORT.md)(unity판) · [snd-01_REPORT](engine/orders/reports/snd-01_REPORT.md) · [snd-02_REPORT](engine/orders/reports/snd-02_REPORT.md) · [snd-03_REPORT](engine/orders/reports/snd-03_REPORT.md) · [snd-04_REPORT](engine/orders/reports/snd-04_REPORT.md)
- [snd-05_REPORT](engine/orders/reports/snd-05_REPORT.md) · [snd-06_REPORT](engine/orders/reports/snd-06_REPORT.md) · [snd-07_REPORT](engine/orders/reports/snd-07_REPORT.md) · [snd-08_REPORT](engine/orders/reports/snd-08_REPORT.md) · [STARTER-REGIONS_REPORT](engine/orders/reports/STARTER-REGIONS_REPORT.md)(unity판) · [sv-collect_REPORT](engine/orders/reports/sv-collect_REPORT.md) · [sv-contract_REPORT](engine/orders/reports/sv-contract_REPORT.md) · [sv-restore-flow_REPORT](engine/orders/reports/sv-restore-flow_REPORT.md)
- [sv-restore-items_REPORT](engine/orders/reports/sv-restore-items_REPORT.md) · [sv-restore-player_REPORT](engine/orders/reports/sv-restore-player_REPORT.md) · [sv-save-primitive_REPORT](engine/orders/reports/sv-save-primitive_REPORT.md) · [sv-shared-read_REPORT](engine/orders/reports/sv-shared-read_REPORT.md)(unity판) · [sv-transport-read_REPORT](engine/orders/reports/sv-transport-read_REPORT.md) · [ti-00_REPORT](engine/orders/reports/ti-00_REPORT.md) · [ti-01_REPORT](engine/orders/reports/ti-01_REPORT.md) · [type7-fix_REPORT](engine/orders/reports/type7-fix_REPORT.md)
- [w01_REPORT](engine/orders/reports/w01_REPORT.md)

## engine/parity_refs/boss (1)

| 문서 | 후계 | 이유 |
|---|---|---|
| [README.md](engine/parity_refs/boss/README.md) | — | parity_refs/boss: 웹↔Godot 나란히 비교 프레임 설명(10-22). |

## engine/parity_refs/boss_mac (1)

| 문서 | 후계 | 이유 |
|---|---|---|
| [README.md](engine/parity_refs/boss_mac/README.md) | — | parity_refs/boss_mac: 웹↔Godot 나란히 비교 프레임 설명(10-22). Godot 동결로 끝난 검수 자료, 같은 폴더 이미지와 함께 이동 |

## engine/parity_refs/integ12 (1)

| 문서 | 후계 | 이유 |
|---|---|---|
| [README.md](engine/parity_refs/integ12/README.md) | — | parity_refs/integ12: 웹↔Godot 나란히 비교 프레임 설명(10-22). |

## engine/parity_refs/map_ui (1)

| 문서 | 후계 | 이유 |
|---|---|---|
| [README.md](engine/parity_refs/map_ui/README.md) | — | parity_refs/map_ui: 웹↔Godot 나란히 비교 프레임 설명(10-22). |

