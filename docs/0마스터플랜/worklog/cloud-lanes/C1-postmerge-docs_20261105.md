# C1 데모 통합 병합 후속 docs (2026-11-05)

기준: unity/main 795869009. 브랜치 claude/unity-cloud-postmerge-docs-20261105. docs만, 코드·데이터 변경 0.

| 항목 | 결과 |
|---|---|
| 번역대상_전체목록 감사 표 4274~4287 | "미반영"을 병합 후 상태로 고침. 행 4274~4287은 이미 "29언어 반영"이었고 visual_select_labels.json에 문구 존재 확인. CRLF 보존(CR 10734 = 줄 10734, 전후 동일) |
| 15 세이브+데이터구조 | 상단에 2026-11-05 절 추가: opt.lang, preset1/2, 프리셋 JSON, 옛 파일 기본값(Lang 빈 값, LobbyLanguage.Startup 폴백). LF 파일 |
| flavor 저장 루트 표 | 같은 문서 11-04 절에 이미 있어 추가 안 함. NativeFlavorStorage·NativeFlavorSavePaths와 대조 일치 |
| CHANGELOG_SYNC | 절 1개 추가(CRLF 보존) |

미확인: 컴파일·실게임 동작은 이 레인 범위 밖(docs만).
