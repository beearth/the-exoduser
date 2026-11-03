# 보스 나란히 비교 기준 프레임 (2026-10-22)

같은 장면을 왼쪽 웹, 오른쪽 Godot으로 붙인 비교 격자다. 원본은 PNG이고, 용량 때문에 JPG(품질 88)로 바꿔 올렸다.

- 웹 기준: main game.html. 스냅샷 4d911cdd와 같다.
- Godot 기준: `claude/pc-boss-parity-20261022`, 촬영 시점 커밋 2bae30bfc. 최종 tip은 86bb421fa이고, 이후 커밋은 행 정정과 문서만 바뀌었다.
- 상태 맞춤: 양쪽 모두 레슨 건너뛰기, 플레이어 무적, 순간이동, `_fbDone`과 지역 4 cleared, 보스 HP·쉴드·부활력 낮춤을 같게 적용했다. 보스 패턴은 주입하지 않았고, 자연 발생한 프레임 중 상태 이름이 같은 것끼리 짝지었다.
- 판정
  - 동작(순서·수치)은 웹과 같다.
  - 표시는 다르다. PARITY-BOSS-01(Mac)에서 처리할 M5~M13 항목: 아레나, 드루이드 애니 프레임, 녹색 덩굴 예고, HP 바(쉴드·면역·부활), 앵글러 이름·HP 바, 씨앗 투사체, 후처리.
- 상세: `docs/engine/orders/reports/pc-boss-parity_REPORT.md` (브랜치 쪽)

| 파일 | 장면 |
|---|---|
| compare_09a_fieldboss | 필드보스(앵글러) |
| compare_10_gate | 지옥문 |
| compare_10a_entry_intro / _namecard / _namecard_1x | 진입 연출·네임카드 |
| compare_10b_arena | 아레나 전경 |
| compare_10d_boss_close / _bossbar_1x | 보스 근접·HP 바 |
| compare_10e_slam / _charge / _spin / _shock / _grab | 패턴(강타·돌진·회전·충격파·잡기) |
| compare_10f_boss_hit | 보스 피격 |
| compare_10g_revive_0 / _1 | 부활 |
| compare_11c_killed / _exit_view | 처치 후·출구 |
| compare_11d_clear | 클리어 |
