# BOSS_01 독버섯 거인 — Codex 2.5D (2026-08-18)

| 항목 | 값 |
|---|---|
| si | 1 |
| 한글명 | 독버섯 거인 (`HELL_BOSSES[0][1]`) |
| 영문명 | Poison Mushroom Giant |
| 렌더 | Codex 2.5D — punch/kick 아틀라스보다 우선 |
| PNG | `assets/sprites/boss/stage1_codex_poison_mushroom_giant.png` (832×1248) |
| 로더 | `_CODEX_BOSS[1]`, `_drawCodexBoss(...,1)` |
| 모션 | si0과 동일 7키 (`idle/walk/windup/slash/slam/hit/death`) |
| 스케일 | `dw=e.r*6.6`, `dh=e.r*8.6` (갓이 넓어 세로 배율은 si0보다 낮음) |
| 글로우 | 독보라 `rgba(160,50,190,.40)` / screen `rgba(180,70,210,.30)` |
| 전투 | `_BOSS_MOVESET[1]` 불변. 페이즈/포이즈/2_3 불변 |
| 테스트 | `http://127.0.0.1:3333/game.html?bosstest=1` |

Q4: 이름은 코드가 진실. PixelLab `Forest Guardian` 폴더는 자산 잔여물.

실루엣 축: 검은 갓 + 줄기 몸 + 곤봉. 주먹/발차기 언어 없음.

## 2026-10-27 STY-12 마지막 사망 한 줄 대사
- 독버섯 거인 si1 마지막 사망: **"…아직 거둘 때가 아닌데."** (EN "…It isn't harvest time yet.") — 농부 원형(STY-D8)의 수확 말버릇. `#bossLine` 자막, 번역 No.3345. 부활 판정이 걸린 사망에서는 띄우지 않는다. 근거 `11내러티브·로어디자인/CH1_STORY_SPINE_20261027.md` §5.
