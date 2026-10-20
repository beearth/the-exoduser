# P2-007a 보고 — Godot UI 마감 3건 (cloud-ui-polish, 2026-10-20)

- 브랜치: `claude/p2-007a-ui-polish` (main `af9a59f` 위, main push·병합 없음)
- 상세 문서: [../../FDG_P2_007A_UI_POLISH_20261020.md](../../FDG_P2_007A_UI_POLISH_20261020.md)
- 상태: 검수 대기 — 구현 커밋 `5d3ba3578d180586e6883d2ef6728f1971dd5450`

## 변경 파일
| 구분 | 경로 |
|---|---|
| 신규 | `godot/scripts/native_ui_fonts.gd`(+uid), `godot/scripts/native_intro_key_guide_panel.gd`, `godot/assets/vfx/ki_slash_ink.gdshader`, `godot/tests/test_p2007a_ui_polish.gd`, `godot/tests/visual_p2007a_capture.gd`, `godot/tests/visual_p2007a_kislash_compare.gd` |
| 원본 에셋(바이트 복사) | `godot/assets/fonts/ofl/{nanummyeongjo,cinzel,cinzeldecorative}/`(TTF+OFL.txt+METADATA.pb, google/fonts), `godot/assets/vfx/ki_slash_silver_sheet.png`·`ki_slash_hit_silver_sheet.png`, `godot/assets/sfx/voice/voice_wakeup.mp3` (+ .import) |
| 소유 | `godot/scripts/crescent.gd`·`hit_effect.gd`(검기 색), `godot/scripts/native_intro_curtain_sequence.gd`(가이드 패널 표시·입력 단계) |
| 공용·타 담당(최소 줄) | `hud.gd`(폰트 함수·호출 인자), `player.gd` 2줄(차지 미리보기 시트·hue), `native_pets.gd` 3줄(자막 폰트), `native_perspective_view.gd`(잉크 층 미러 분기), **`native_parry_lesson_flow.gd`(P2-001l 소유) — 폰트 참조만: 40행 FONT_PATH, `_weighted_font` 본문, 키캡 600~601행, 건너뛰기 버튼 684행, unported 문구 811행** |
| 문서 | 위 상세 문서, `docs/5.1임펙트디자인/KI_SLASH_RADIANT_20260915.md`, `docs/3.1 ui hud 디자인/UI_FOUNDATION_20260924.md`, `docs/16번역·로컬라이제이션/번역대상_전체목록.md`(No.3312~3337), 이 보고서, WORK_BOARD 상태 |

## 테스트 (Godot 4.7.2 Linux 공식 빌드, 격리 userdir — override.cfg 미커밋)
| 테스트 | 결과 |
|---|---|
| test_p2007a_ui_polish (신규) | 115/0 헤드리스, 115/0 xvfb(실 GUI 클릭) |
| test_p2002a_hud / p2002b_minimap_corner / p2001i_boot_intro / p2001k_lesson_practice / p2004a_pets / p1002g_kislash_hurte | 36/0 · 16/0 · 18/0 · 32/0 · 17/0 · 214/0 (변경 전 기준선과 동일) |
| test_contracts | 5 PASS / 0 |
| (참고) test_windows_native_package | `packaged_icu_data` 1 FAIL — `res://icudt_godot.dat` 체크아웃 부재(기존 환경 실패, 이번 변경 무관). 나머지 3 PASS |

## 화면 캡처
가능 — xvfb + Mesa llvmpipe 실제 렌더(1920×1080). 웹 원본도 Playwright Chromium으로 같은 해상도 캡처해 1x 대조: 키 가이드 패널 높이·요소 ±0.1px / 글자 ±2px, 기검참·명중광 픽셀 평균 절대차 0.04~0.23/255. PNG는 미커밋(세션 임시 폴더).

## 총괄 확인 요청
1. 레슨 파일(P2-001l 진행 중) 폰트 참조 5곳 변경 — 병합 시 충돌 가능 줄 위 표 참조.
2. 가이드 중 키 입력을 `_input` 단계로 이동(원본 캡처 단계 리스너 동등) — 기존엔 Space를 플레이어가 먼저 소비해 진행이 안 됐음.
3. 범위 밖 발견: `#stageClock`·`#mmLvl`의 ui-refinement.css 재정의(투명도·크기·색) 미반영, HUD letter-spacing 미적용, OFL.txt 배포 포함(export include_filter) 확인 필요.
