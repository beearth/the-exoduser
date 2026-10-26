# 임펙트 총괄 VFX 인계 — 2026-10-26 23:55 KST

- 세션 id `local_da9cd0e7…` / Opus / 역할: 게임 이펙트를 일관성 있게 디자인하고 전체 총괄(사용자 2026-10-26 지시)
- SSOT: `docs/5.1임펙트디자인/VFX_LEAD_MASTER_20261026.md` (스타일 기준 초안 §2, 현황 §3, 교체 기록 §3.4, 발견 VFX-D1~D9 §4, 백로그 VFX-01~09 §6)
- 메모리: `vfx-lead-role.md`

## 완료한 작업 단위
1. 총괄 문서 신설·대조 시트(`VFX_CONTACT_SHEET_20261026.jpg`) — main `7749c044f`
2. 사용자 「상태 안좋은 임펙트들 걸러내고 다시 생성」 → 원소 피격 시트 13종(`assets/vfx/impact_el0~5_sheet`, `_boss_sheet`, `impact_basic_sheet`) 절차 생성으로 교체 — main `b770efe68`. game.html 불변. 전후 `docs/5.1임펙트디자인/HIT_IMPACT_BEFORE_AFTER_20261026.png`
   - 도구: `tools/vfx/gen_hit_impacts.py`(생성), `tools/vfx/capture_hit_impacts.mjs`(실게임 A/B, `--sheets=<폴더>`로 네트워크 단 교체, headless)

## 대기 중 (사용자 결정)
- 다음 순서 질문함: ① 네온 팩 폭발·연기 플립북 2차 교체(VFX-02 2차) vs ② 일반 피격이 은은하니 렌더 알파(현재 0.45, `game.html` 히트 임팩트 렌더) 올려서 비교. 답 아직 없음.

## 확정된 사항 (docs·메모리에 이미 있음 → 경로만)
- 게임 내 회색화·GL 알파 이중 곱(VFX-D8) 대응법: SSOT §2.2·§3.4, 생성기 주석
- 2차 대상 사용처 목록: SSOT §6 VFX-02 행 (`_TVFX2` 팩 시트: 업화선·기동불꽃 폭발, `_spawnSmoke`, 악의폭풍 틴트 19628행 부근, 사망 연기·피 `registerVFX`)

## CTO 신규 규칙 (2026-10-26, 이 세션에 미반영분)
- 총괄은 직접 구현·캡처·문서반영·에셋 후처리 금지 → 단순작업(Sonnet) 세션에 명세로 위임. 제목 "단순작업(Sonnet): 임펙트 총괄 <업무>", model claude-sonnet-5-5, bypassPermissions, 총괄당 동시 1개, 보관 금지, 내부 Agent로 대체 금지. 맡기기 전 그 세션 get_usage 확인.
- 이 세션은 아직 단순 세션 없음.
- 토큰 규칙: `docs/0마스터플랜/SESSION_REGEN_PROTOCOL_20261026.md`

## 금지·주의
- 이펙트는 시각만 변경(판정·수치 불변). 채택은 게임 캡처 1x 판정 후. 점·잔점 금지. 녹색 크로마 배경 피함
- 커밋은 `git commit <경로>` 경로 지정. 원격이 자주 앞서가므로 임시 워크트리(`G:/exoduser-wt/_vfxpush`)에서 origin/main 위에 cherry-pick 후 push, 워크트리 삭제
- `test/elementalImpactSprites.test.js`는 작업 폴더에서 타세션이 지운 상태(D) — 건드리지 않음
- 게임 서버(3333)는 캡처용으로 이 세션이 띄워 둠
- 데모/EA 폴더 반영은 배포 때

## 재개 후 첫 행동
1. 이 문서·SSOT §3.4·§6 읽기
2. 사용자 답(①/②) 확인 → 단순작업(Sonnet) 세션 만들어 명세로 위임
3. ①이면 큰 폭발 플립북은 MagicLight Seedream 생성 후보 → 사용자에게 보여 주기, 작은 스파크는 생성기 확장
