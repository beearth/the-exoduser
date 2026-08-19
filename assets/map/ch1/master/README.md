# CH1 MASTER — 드롭 폴더

스타일 LOCK (이미 들어 있음):

| 파일 | 역할 |
|------|------|
| `CH1_STYLE_VISTA.jpg` | 1장 장소성. 독늪, 철창, 거목, 북쪽에 지옥성 |
| `HELL_DESCENT_STRIP.jpg` | 카메라. 고각 쿼터뷰, 길이 이어짐. 7장 하강 한 장 |
| `CH1_MASTER_16x9.jpg` | v1 구도 레퍼런스. 원형 분지. **폐기 아님, 런타임 쓰지 말 것** |
| `CH1_MASTER_16x9_v2.jpg` | **COMPOSITION SSOT LOCK**. 1280×720. 구도 재생성 금지 |
| `CH1_MASTER_16x9_v2_PROD.jpg` | v2 고해상 조립. 2176×1224 (16:9). 4플레이트 overlap 18% 블렌드. 4K native 불가 |
| `production/Q1_TL_hires.jpg` … `Q4_BL_hires.jpg` | 시계방향 2×2 플레이트 각 1280×720 |

## 12장 넣는 곳

`plates/` 에 아래 이름 그대로.

```
CH1_A1.png  CH1_A2.png  CH1_A3.png  CH1_A4.png
CH1_B1.png  CH1_B2.png  CH1_B3.png  CH1_B4.png
CH1_C1.png  CH1_C2.png  CH1_C3.png  CH1_C4.png
```

권장 2048×2048. 인접 장과 길·빛이 이어져야 함. 플레이어·UI·글자 넣지 말 것.

미리보기: `http://localhost:3333/assets/map/ch1/master/index.html`

## 인게임 테스트 (한 장 필드)

`CH1_FIELD_ONE.png` 1448×1086 → 맵 36×27 (픽셀 1:1).  
`http://localhost:3333/game.html?stage=0`

기획: `docs/4.1맵디자인+설정/맵제작_SSOT.md` §25
