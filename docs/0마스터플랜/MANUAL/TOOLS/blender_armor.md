# Blender 갑옷 절차 초안 (2026-11-05)

**공부 기록이다. 이 절차로 조형을 시작하지 않는다.** 조형은 사용자의 손 조형 또는 외주 결정 뒤에 한다. C2의 스크립트 LOCK 시도는 출처 없이 만든 사례로 FAIL 기록이다.

## 출처

| 표시 | 출처 | 비고 |
|---|---|---|
| [SL] | [Sebastian Lague, RPG graphics E07: Armour](https://rosetta.to/u/sebastianlague/rpg-graphics-e07-armour-blender) | 영상 대본 페이지. 게임 캐릭터 판금 전 과정. 오래된 Blender 판일 수 있음 |
| [80] | [80.lv Stormtrooper 제작기](https://80.lv/articles/hard-surface-modeling-texturing-breakdown-for-creating-a-stormtrooper-holding-a-rifle) | 베이크는 다루지 않음 |
| [BM-S] | [Blender 매뉴얼 Shrinkwrap](https://docs.blender.org/manual/en/latest/modeling/modifiers/deform/shrinkwrap.html) | |
| [BM-T] | [Blender 매뉴얼 Solidify](https://docs.blender.org/manual/en/latest/modeling/modifiers/generate/solidify.html) | |

Packt *Blender 3D Cookbook*의 갑옷 판 절은 접근이 막혀(403) 읽지 못했다.

## 절차

| # | 단계 | 출처 | 설정·주의 |
|---|---|---|---|
| 1 | 레퍼런스를 모은다 | [80] | 우리는 `WARRIOR_DESIGN_LOCK` |
| 2 | 옷·몸 메시를 복제해 금속이 될 면만 분리한다 | [SL] 1~2, 10 | |
| 3 | 또는 한 면 평면으로 판을 만든다 | [80] | |
| 4 | 무릎 등은 스케일과 비례 편집으로 굽힌다 | [SL] 3 | |
| 5 | 몸통은 돌출·스케일로 층층이 판을 쌓고 에지 루프로 선명하게 한다 | [SL] 11 | LOCK의 "마디형"과 관련 |
| 6 | 어깨판은 따로 분리해 모양을 잡고 두께를 준 뒤 매달리는지 본다 | [SL] 14 | |
| 7 | 투구는 큐브를 세분해 머리에 맞추고, 반쪽을 미러로 만든다. 인셋으로 두께 | [SL] 17~19 | |
| 8 | 두께는 Solidify | [SL], [80], [BM-T] | 물체 스케일을 먼저 적용. Even Thickness, Clamp |
| 9 | 곡면은 Subdivision과 받침 에지 루프 | [80] | 균일한 사각면, n-gon 피함 |
| 10 | 몸에 붙일 때 Shrinkwrap | [BM-S] | Above Surface는 부드러운 법선 방향 오프셋. 정점 그룹으로 범위 제한 |
| 11 | 가려진 면을 지우고 열린 곳은 막아 검은 재질 | [SL] 6 | |
| 12 | 자동 웨이트 후 브러시로 접힘을 다듬는다 | [SL] 8, 15 | |
| 13 | 팔 교차는 윗소매에서 아래팔 웨이트를 빼고 위팔 100%로 | [SL] 16 | |
| 14 | 투구는 웨이트 전부를 머리 본에 | [SL] 20 | **스키닝 대신 단순한 경로** |
| 15 | 겹침은 정점을 줄이거나 키워 미끄러지게 한다 | [SL] 9 | |
| 16 | 달리기 동작으로 시험해 교차를 고친다 | [SL] 23 | |
| 17 | 모디파이어 적용은 비율 확정 뒤, UV 전 | [80] | |

## 지난 시도와의 차이

| 내가 한 것 | 출처 절차 |
|---|---|
| 몸을 부풀린 복셀 껍질에서 잘라냄 | 면을 분리하거나 큐브·평면에서 형태를 만들어 깨끗한 면 흐름을 유지 |
| 모든 조각을 몸에서 웨이트 전사 | 투구는 머리 본 100%, 판은 자동 웨이트 후 교차 수정 |
| 비율과 수치를 스크립트로 정함 | 스케일·비례 편집을 눈으로 보며 조정. **제 방식으로 재현할 수 없는 부분** |

## 공부로 메우지 못한 것

- 마디형 판금과 겹친 둥근 견갑을 게임 저해상도로 읽히게 하는 형태 기준.
- 낡은 철 표면 재질과 베이크. 읽은 글에 없다.
- 위 절차의 대부분은 사람이 화면을 보며 하는 조작이다. 스크립트로 옮기면 무엇을 잃는지는 시험하지 않았다.
