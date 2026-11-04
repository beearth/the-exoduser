# 11-05 밤샘 계획 (사용자: "아침까지 보고서·최종 시안까지, Codex 최대한 광범위하게")

목표(아침): ① 연구 종합 보고서 ② EXODUSER 제작 매뉴얼 초안(14요소, 요소별 도구 1개 추천) ③ 최종 시안 — HUD A/B 실화면, 분위기(광원·안개) 시험 장면 캡처, 키샷 구도안.
원칙: 게임 본선(unity/main) 화면 패치는 동결 유지. 시안은 전부 별도 브랜치·별도 씬. 버리기는 사용자 결정.

## 흐름
1. 연구(진행 중, 클라우드): D4 01~04, PoE2, Phantom Blade Zero, Downfall of Yellowsky, 레퍼런스 전수(RS), ARPG 관례(M1), HUD G1(U1).
2. Codex 교차 연구(PC Codex): 같은 주제를 독립적으로 조사해 서로 검증(출처 2개 규칙). 기술 구현 자료(Unity URP 분위기·3D→픽셀·가림·HUD) 중심.
3. Codex 시안 구현(PC Codex·Codex 스레드): `MoodLab` 시험 씬(광원·안개·색 보정 프리셋 전환), HUD A/B를 인자로 바꿔 보는 시안 코드 — 본선 무영향.
4. Mac: 시안 SHA를 빌드해 같은 구도로 캡처(1920×1080, 1x·3x), 비교판.
5. CTO: 매뉴얼 초안 종합(요소별 도구 결정안) + 아침 보고서(시안 이미지 포함).

## 담당
| 일 | 담당 | 산출 |
|---|---|---|
| 연구 8건 | 클라우드 레인 | docs/0마스터플랜/D4_STUDY·GAME_STUDY |
| 교차 연구·기술 카탈로그 | PC Codex | docs/0마스터플랜/GAME_STUDY/codex_*.md |
| MoodLab 시험 씬 | PC Codex → Mac 캡처 | codex/unity-moodlab-20261105 |
| HUD A/B 실화면 시안 | Codex 스레드 → Mac 캡처 | codex/unity-hud-proto-20261105 |
| 매뉴얼 초안 | 클라우드(CTO 종합) | docs/0마스터플랜/MANUAL/ |
| 아침 보고서 | CTO | 사용자에게 링크 |
