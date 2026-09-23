# 실버테일 E — 기존 검격 아크 강화형

사용자 확정: 별도 불꽃 스윙 대신 기존 실버테일 임팩트를 강화해서 사용한다. 등검 회전과 이펙트가 어긋난 원인은 몸에만1.5배 재생을 적용하고 이펙트에240ms 진행률을 유지한 데 있었다.

| 항목 | 현행 값·적용 |
|---|---|
| 적용 파일 | `game.html`, `game-easy-test.html` |
| 원본 | 기존 `img/vfx/silvertail_violet_arc_anim_api_v3.png`, 2132×738 RGBA, 가로6프레임 |
| 라우팅 | `_drawFlameBladeSwing`은 `_charIdx===1`이면 false 반환. 실버테일 일반/강화 E 모두 `_drawSilvertailEArc` 사용 |
| 강화 조건 | `(P._stWingT||0)>0`. 쿨다운 중 원래 아크1장, 강화 중 본체+잔광2장 |
| 기본 색 | `hue-rotate(-28deg) saturate(2.05) contrast(1.28) brightness(1.28)` |
| 강화 색 | 같은 색에서 brightness만1.6으로 증가 |
| 강화 잔광 | 같은 원본 프레임·크기, −0.10rad 회전, 본체 alpha×0.20, 본체보다 먼저1회 렌더. 별도 타이머 없음 |
| 본체 alpha | in=`min(1,p/.46)`, out=`max(0,1-max(0,p-.76)/.24)`, alpha=`(.84+in×.16)×out` |
| 진행률 | shield일 때 해당 방향 `P._sa.fm['atk2_'+dir].length===9` 및 리마스터 모듈 존재 시 p=`clamp(elapsed/240×1.5,0,1)`;4프레임/모듈 없음은 기존240ms |
| 동기화 | `_silvertailAttackPose().spinProgress`를 몸과 아크가 공유. 몸에서 다시1.5배 적용하지 않음. 리마스터160ms에 회전 완료 및 아크 숨김, 복귀 자세 유지 |
| 프레임 | 몸 `min(n−1,floor(p×n))`, 아크 `min(5,floor(p×6))`. 포즈 수명360ms 상수 유지 |
| 크기·피벗 | width=`(200+in×30)×C×M`, height=width×738/(2132/6), `P.x/P.y` 중심·`P.facing` 회전. C=충전1~3, M=E 레벨 범위배율. 강화로 크기 증가 없음 |
| 합성 | lighter, save/restore. 강화 잔광1회 추가 drawImage 외 새 파티클·캔버스 없음 |
| 전투 | 피해·판정·속성·자원·쿨다운·무적·충전·범위·발사 웨이브 유지. 다른 캐릭터 불꽃 스윙 유지 |
| 검증 | `silvertailEArcSync`, `flameBladeSwing`, `silvertailAttackRemaster`, `playerMotionContinuity`, `baseWingStrike` 총40개 통과. 160/240ms 재생·종료·이중 배속 방지·강화/일반 경로·충전 범위 확인 |
| 화면 검수 | 브라우저에서 실제 렌더 함수로 일반/강화 비교 및 반복 재생 확인. 0/40/80/120/160ms 프레임에서 밝기·잔광 차이와160ms 종료 확인 |

검수 화면: `output/silvertail_e_arc_20260916/review.html`. 실제 게임의 포즈·아크·SpriteAnimator 함수를 사용해 일반/강화 E의 동작과 시간별 프레임을 비교한다.
