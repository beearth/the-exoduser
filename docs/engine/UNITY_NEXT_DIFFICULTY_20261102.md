# 다음 난관 난이도 웹 정합 — 2026-11-02 3차

기준은 최신 웹 origin/main `game.html:NEXT_DIFF_OPTS/_showNextDiffPop`, `silver-hell-ui-kit.css`, 공통 원화다. 웹 `introDiff`는 남은 마크업이며 현재 활성 분기는 클리어 화면의 `nextBtn → nextDiffPop`이다.

| 선택 | 영문 | 다음 적 레벨 offset | 기존 원화/Unity Resource |
|---|---|---:|---|
| 안식 | Respite | -100 | img/lording/9.png / Art/Loading/09 |
| 순례 | Pilgrimage | -50 | img/lording/7.png / Art/Loading/07 |
| 여정 | Journey | 0 | img/lording/11.png / Art/Loading/11 |
| 시련 | Ordeal | +50 | img/lording/15.png / Art/Loading/15 |
| 재앙 | Calamity | +100 | img/lording/19.png / Art/Loading/19 |

| 계약 | 구현 |
|---|---|
| 진입·기본 선택 | StageClearNext에서 열고 직전 Config.StageDiffOffset 선택 유지. 미정의 값은 여정(index2) |
| 선택 | 클릭/←→/A·D, 양끝 순환. 선택만으로 Config/세이브/사운드 변경 없음 |
| 확정 | 더블클릭/Enter/Space/다음 난관으로. 단일 소비 후 NativeDecisionSound difficulty1회, Config offset 적용 |
| 취소 | 뒤로/Esc. 기존 클리어 화면 유지, nextAction 재무장, offset/세이브 변경0 |
| 데모 종료 | ShownKind.DemoEnd는 난이도창을 열지 않고 기존 종료 continuation 유지 |
| 원화·서체 | 기존 로딩 원화, Hahmlet300/Cinzel400. 선택 컬러/기본 grayscale1 brightness.62 contrast1.05/hover grayscale.4 brightness.85 |
| 해상도 | 카드 폭 clamp(170,screenW*.116,224), 간격 clamp(14,screenW*.014,26), 그림 높이 clamp(220,screenH*.28,320); 중앙16:9 안전영역·전체화면 dim |
| 게임 적용 | EnemyBridge/DruidBoss/Death/EnemyAi의 기존 StageDiffOffset=0을 Config.StageDiffOffset로 전달. EnemyFactory 공식과 RNG는 그대로 |
| 저장 | CombatSaveModel.StageDiffOffset ↔ game.stageDiffOff, 누락 시0. 허용 offset -100/-50/0/50/100 외 저장은 명시 거절. 기존 Version1/unknown root 보존 |

다음 구역 콘텐츠·진행은 별도 기존 미이식 범위다. **현재 확정 후에는 기존 StageClearContinue가 저장하고 로비로 돌아가며 1-2를 실행했다고 주장하지 않는다.** 선택 offset은 실제 Config/저장에 연결되어 이후 적 생성에 적용된다.

검수: 정책 부재 RED → 정책15 PASS. 저장 및 적 실제레벨17 PASS, 유지 가능한 `unity/Tools/next-difficulty-tests`23 PASS(.NET8.0.301), 기존 EnemyAi unused local 경고2만 있다. 증거 `I:/EXODUSER-Storage/codex-takeover/unity-parity-1102/third/difficulty/`. 별도 Player/1920·3840·1x/GPU shader 검수는 부모의 단일 정식 빌드에서 수행하며 이 문서 작성만으로 디자인 PASS로 올리지 않는다.
