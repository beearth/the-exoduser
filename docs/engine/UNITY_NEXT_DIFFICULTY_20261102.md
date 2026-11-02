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
| 원화·서체 | 기존 로딩 원화와 CPU 계산된 sRGB dim/hover PNG, Hahmlet300/Cinzel400. 선택 컬러/기본 grayscale1 brightness.62 contrast1.05/hover grayscale.4 brightness.85 |
| 해상도 | 카드 폭 clamp(170,screenW*.116,224), 간격 clamp(14,screenW*.014,26), 그림 높이 clamp(220,screenH*.28,320); 중앙16:9 안전영역·전체화면 dim |
| 게임 적용 | EnemyBridge/DruidBoss/Death/EnemyAi의 기존 StageDiffOffset=0을 Config.StageDiffOffset로 전달. EnemyFactory 공식과 RNG는 그대로 |
| 저장 | CombatSaveModel.StageDiffOffset ↔ game.stageDiffOff, 누락 시0. 허용 offset -100/-50/0/50/100 외 저장은 명시 거절. 기존 Version1/unknown root 보존 |

다음 구역 콘텐츠·진행은 별도 기존 미이식 범위다. **현재 확정 후에는 기존 StageClearContinue가 저장하고 로비로 돌아가며 1-2를 실행했다고 주장하지 않는다.** 선택 offset은 실제 Config/저장에 연결되어 이후 적 생성에 적용된다.

검수: 정책 부재 RED → 정책15 PASS. 저장 및 적 실제레벨17 PASS, 유지 가능한 `unity/Tools/next-difficulty-tests`23 PASS(.NET8.0.301), 기존 EnemyAi unused local 경고2만 있다. 증거 `I:/EXODUSER-Storage/codex-takeover/unity-parity-1102/third/difficulty/`. 별도 Player/1920·3840·1x/GPU shader 검수는 부모의 단일 정식 빌드에서 수행하며 이 문서 작성만으로 디자인 PASS로 올리지 않는다.

## 첫 정식 Player 후 시각 재작업 — 3차

지정 실물 `third/ui-first-retry/1920x1080-ko-3차-난이도2.png`와 전체 원본 head CSS를 사용한 정적 웹 참고 `third/web-difficulty-full-css/difficulty-1920.png`를 직접 열었다. 후자는 scripts/자연조작을 검증한 웹 Player가 아니므로 동작 증거로 사용하지 않는다. 전역 reset이 빠진 이전 `web-difficulty-css` 표본은 폐기 판정으로 제외했다.

| 결함 | 원인·수정 | 판정 경계 |
|---|---|---|
| 비선택 원화가 거의 검정 | CSS sRGB 필터 결과를 shader가 linear로 변환했는데 기본 sRGB RenderTexture에서 다시 decode. cache를 RenderTextureReadWrite.Linear로 명시하고 Blit 동안 GL.sRGBWrite=false, 이후 원상 복구 | 최종 같은 빌드 GPU 재캡처 필요 |
| 뒤로/확정 버튼의 단조 장식이 웹과 다름 | 난이도 전용 web `.sh-btn`은 CSS 다각형이며 일반 단조 plaque를 쓰지 않음. 248×40/양끝12px/1·4·5px 중첩/기본 세로·강조 방사 그라데이션으로 정합. 버튼 y+3px | 코드 변환이며 원화 생성·유료 사용0 |

비선택 카드 내부 red 평균(0~255)은 첫 Player 안식1.58/순례0.46/시련1.14/재앙2.83, 웹 참고22.71/11.19/10.90/28.22였다. 동일 원본에 웹 필터를 CPU로 계산한 예상은23.00/11.40/10.80/28.20이다. 이 수치는 원인/목표 분석이며 최종 GPU 결과를 대신하지 않는다. 근거 `third/difficulty/dim-linear-correction-analysis.json`. Core/저장/NativeGame 추가 변경0.

## 두 번째 GPU 실물 FAIL 후 제작 방법 전환

`third/final-ui/1920x1080-ko-3차-난이도2.png`를 직접 열었다. 첫 캐시 후보는 비선택 카드가 거의 검정이어서 FAIL, 두 번째 Linear ARGB32 후보는 밝기가 개선됐지만 어두운 영역을 8bit linear로 양자화하여 블록/잔점이 생겼으므로 FAIL이다. 같은 GPU cache 방식의 두 후보가 핵심 품질 조건을 못 맞춰 해당 방식을 중단했다.

현행 방법은 원본 Loading 09/07/11/15/19의 float CSS 수식을 CPU에서 계산해 **8bit sRGB 무손실 PNG**로 저장한 10개 자산을 일반 Texture2D/GUI 경로로 로드하는 것이다. `Art/Loading/Difficulty/{09,07,11,15,19}-{dim,hover}.png`를 사용한다. dim은 grayscale(.2126,.7152,.0722)→brightness .62→contrast1.05, hover는 grayscale .4→brightness .85→contrast1이다. 자산 생성과 importer/meta는 부모 단일 writer가 맡는다. NativeNextDifficultyPanel은 신규 PNG를 읽을 뿐 RenderTexture/Material/Blit/GL.sRGBWrite를 전혀 사용하지 않는다. 선택 원화·정책·입력·버튼·저장 코드는 변경하지 않았다.

`DifficultyCard.shader`는 소스/도구 검색 결과 자체 파일 외 참조0으로 더 이상 쓰이지 않으며 부모가 정확경로 삭제할 예정이다. 독립 Runtime 컴파일은 Roslyn8.0.301/Unity6000.6.7f1 참조로 exit0·오류0(기존 analyzer 경고 유지), 로그는 `third/difficulty/Runtime-cpu-texture.log`다. 이 검사는 PNG importer와 실제 Player의 잔점0을 검증한 것이 아니므로 새 PNG를 포함한 최종 같은 빌드 1920/3840 캡처·1x/확대 판정은 별도로 필요하다.
