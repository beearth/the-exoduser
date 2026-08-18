# BOSS_02 지옥기형 — Dark Souls식 기괴 지옥수 (2026-08-18)

| 항목 | 값 |
|---|---|
| si | 2 |
| 구명 | 숲의 사냥꾼 (PixelLab punch/kick 잔여) |
| 한글명 | 지옥기형 |
| 영문명 | Hell Aberrant |
| 렌더 | Codex 2.5D `assets/sprites/boss/stage1_codex_hell_aberrant.png` |
| 스케일 | `dw=e.r*7.0`, `dh=e.r*8.4` (꼬리 실루엣) |
| 글로우 | 용암 `rgba(255,70,20,.42)` |
| 전조 | si2만 tele ×1.4 (다크소울식 읽기) |
| 테스트 | `http://127.0.0.1:3333/game.html?bosstest=2` (node `server.cjs` :3333, 필드/인트로 없음, 보스 남쪽 10타일에서 시작) |

## 얼굴 기술 (`_HELL_ABERRANT_FACE`, +2.0)

| id | 화면 | 패링 |
|---|---|---|
| `jump` | 🦅 도약! | 가능 |
| `charge` | ⚠ 돌진! | 가능 |
| `slashCombo` | ⚔ 난타! | 가능 |
| `sweep` | 🌀 휘두르기! | 가능 |
| `tailSwipe` | 🦴 꼬리치기! (idx 57, sweep 실행) | 가능 |
| `beanStorm` | 🔴 빨간콩 폭풍! | 불가(빨콩) |

지원: `spin` `slam` `fan` `multiDash`. 공용 20% 힐/텔레 연극은 그대로(옵트인 전).

콤보: jump→slam→sweep / charge→tailSwipe / slashCombo→tailSwipe→beanStorm.

2_3·티켓·blackBean·쉴드·기검참 불변.
