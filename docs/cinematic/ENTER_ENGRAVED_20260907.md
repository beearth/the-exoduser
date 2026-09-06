# 흑백 판화형 진입 화면 — 2026-09-07

사용자 승인: 기존 문의 그림체를 유지하면서 주변 대비를 누르고 ENTER를 작은 안내로 전환한다. frontend-design 기준으로 화면의 시각적 우선순위를 문 → 입장 안내로 정리했다. 이미지 생성·원본 영상 편집은 하지 않았다.

| 항목 | 현재 계약 |
|---|---|
| 연결 | `index.html` → `cin-enter-engraved.css?v=20260907-1` |
| 버튼 | `.cin-enter-btn`, type=button, aria-label="입장 / Enter", 리프 span에 ENTER |
| 배치 | 기존 contain 프레임 기준 left 51.7%, top 74%, translate(-50%,-50%) |
| 크기 | 210×64px, max-width 70%, 글자 clamp(19px,2.1vw,26px), 자간 .3em, weight 400 |
| 서체·색 | Cinzel / Georgia / serif, #d5d0c4, hover #fff4dc |
| 장식 | 위·아래 1px 선, 좌우 15%, 상하 3px, 회백색 알파 .55에서 투명 그라데이션 |
| 버튼 배경 | 타원형 검정 그라데이션 알파 .85 → .4(58%) → 0(74%), 맥동·확대 없음 |
| 암부 | `#cinClickPrompt::before`, radial 중심 51.7% 43%, 알파 .30(0%) / .43(28%) / .77(63%) / .96(100%) |
| 상하 보정 | linear 0deg, 검정 .8 → transparent 35% → transparent 75% → 검정 .3 |
| 전환 | 버튼과 암부 1.1s, 버튼 blur 12px·translate(-50%,-60%), 기존 1200ms 숨김 유지 |
| 접근성 | 네이티브 버튼의 포커스·Enter 지원, focus-visible 1px #d5d0c4 / offset 6px, reduced-motion 시 전이·블러·이동 없음 |
| 보존 | 영상·사운드·게임패드 핸들러 변경 없음. 이전 금속 이미지와 JS는 미사용 보존 |
| 테스트 | `tmp/test_enter_engraved.py`: 1440×900 클릭, 1920×1080 Enter, 900×900 클릭, 작은 네이티브 버튼 및 진입 전환 확인 |
| 키 입력 분기 | 기존 keyHandler가 기본 버튼 동작을 preventDefault하므로 Enter/Space에서 `_vidStarted=false`이면 onVidClick, 시작 후에는 기존 onSubSkip 호출 |

기존 인라인 이미지용 스타일보다 이 스타일시트의 선택자 우선순위가 높다. 금속 에셋 로더는 연결하지 않아 이미지 디코딩 후 재교체되지 않는다.
