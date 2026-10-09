## 2026-10-09 후속 접촉 임팩트

이 문서의 비행 core/tail과 E·Q 외부 안내는 유지한다. 현재 `druid_poison_hit`의 splash는 새6×4/24셀 one-shot을 fps60·age/60으로 첫24틱(.4게임초)에 소비한다. 새셀1회, 미준비·실패는 기존8셀 보간 폴백이며 전체72틱 잔향·r120·작은 핵·최대6파편·첫5틱 섬광·전투/Q/RNG/SFX/save는 유지한다. [정본](DRUID_POISON_HIT24_ENGINE_20261009.md). 이전8셀의 통제 native 재생/종료는 이력이며 이번24셀 본편 정상줌 인수를 뜻하지 않는다.

# 드루이드 독탄 중심·진행 방향 표시 — 2026-10-09

`ROOT-DRUID-PROJECTILE-CORE-READABILITY-20261009`. main `game.html`의 적대 `_druidPoison` 경로만 수정한다. 큰 불투명 구체와 중심 키 배지가 안전 간격을 가리던 표시를 작은 질감 핵·희미한 외곽·짧은 방향 꼬리로 나눈다. 패링/충돌/피해/속도/수명/발수/중독 수치는 변경하지 않는다.

| 항목 / 적용 위치 | 현재 정확 계약 |
|---|---|
| 입력 크기 `S` | `m=_physicalProjectileMultiplier(p,2)`; 대형(`_druidMine || elemBall`)은 `S=240*m`, 일반은 `S=max(96,min(180,(sz||4)*24))*m` |
| 본체 `B` / `_druidPoisonBodySize` | 대형 `.6*S`; 일반 `min(.48*S,max(32,(r||sz||4)*3.2)*m)`. `S`는 본체 크기가 아니라 외곽 계산 입력 |
| 방향 / 폭·높이 | `atan2(vy||0,vx||0)`로 회전. 대형 제외 실제 physical은 `w=B*1.1,h=B*.72`; 나머지는 `w=h=B`. 원본 시트 `aspect=ch/cw` 유지 |
| 재료·시계 | 기존 `proj_firedevil_orb.png` 4×4/16f, ready 시 grayscale→multiply `#66dd22`→destination-in 원본 alpha 베이크 1회. 셀 `floor(performance.now()/70)%16`, source-over |
| 이미지 외곽 / 핵 | 외곽 폭 `.74*S`, 높이 `외곽*aspect`, alpha `입력alpha*.12`. 핵 alpha `입력alpha`, 지원 Canvas filter `brightness(1.35)` |
| 이미지 꼬리 | `OPT.trail && !대형 && (vx||vy)`만. 길이 physical `1.2*B`, 기타 `.8*B`; alpha `.2*입력alpha`; local rectangle `x=-w/2-tail,y=-h*.35,width=tail+w*.42,height=h*.7` |
| 미준비 이미지 폴백 | 외곽 radial `.3*B→.37*S`, 색 `#80cb46→#23491b00`, alpha `.12*입력alpha`. 본체 ellipse 반축 `.5*w/.5*h`; radial 중심 `.08*w,-.1*h`, 반경 `.6*B`; stops 0/.25/.65/1 = `#efffcb/#b8f46c/#568c29/#12271c` |
| 공통 중심빛 | 중심 `.1*w,-.1*h`, radial 반경 `.22*B`, ellipse 반축 `.22*B/.18*B`; stops 0/.35/1 = `#f4ffd4b8/#b6f57355/#8bdd4000` |
| 중복 꼬리 | generic `_trail`은 적대 Druid만 제외. 반사 후 `friendly` 기존 generic trail·아군 외형 유지 |
| 패링 구분 / `_drawDruidParryCue` | 실제 class forbidden은 표시 없음. physical=원+현재 `BINDS.shield`, magic=마름모+현재 `BINDS.parry`; blackBean Q 전용/E 불가 유지 |
| 안내 모양 | radius `max(9,(r||sz||4)*1.4)`, 원/마름모 중심은 실제 p.x/p.y. 불투명 중심 fill 제거. dark stroke `#102018/4.5`, light stroke physical `#fff0cf`·magic `#d4a6ff/2.5` |
| 키 위치 / 스타일 | `labelY=y-(abs(sin(angle))*w+abs(cos(angle))*h)*.5-13`. font `bold 11px sans-serif`, 중앙·middle; `keyName(bind,true)`; text stroke `#0a100b/4`, fill physical `#fff0cf`·magic `#e5c4ff` |
| Canvas 안전 | 본체·안내 각각 save→try/finally restore. alpha/composite/filter/transform 복원. 투사체 객체 새 필드/변경 없음 |
| sound | [공개 독탄 효과음 현행 계약](../6사운드디자인/DRUID_POISON_PUBLIC_SFX_20261009.md) |
| 비교 도구 | `tools/druid-projectile-quality-review-20261009.html`: 실제 전후 표시 함수·원본 PNG 통제 배치. 프레임0…15/default6·꼬리·미준비 폴백. fixture keys E/Q, classifier/multiplier 대역; 실제 게임 전투/저장 초기화 없음 |

## 검수와 남은 범위

원본 실제 PNG와 native Canvas에서 전후 픽셀을 비교했다. default6, fallback+trail off, 첫0/마지막15에서 상태복구/객체불변을 확인했다. 겹침과 핵/꼬리 분리가 개선됐지만 Q 안내가 질감보다 도드라지며, 정상 줌·진행 중 보스전·성능·실제 음질·save는 미인수다. **VISUAL VERDICT: RETOUCH**. 3387 연결 거부와 Mac 잠금 때문에 본편/오디오 재생 검수가 아직 진행되지 않았다. 서버 재시작·잠금 우회는 하지 않았다.

외부 정본 `E/druid-projectile-core-readability-20261009/completion.json`은 실제 소유 Git 보존과 미완료 검수를 구분한다. 최초 sound CPU source gate7그룹 PASS, importmap을 JS로 읽은 준비 실패1은 별도 이력이다. 도구 픽셀/CPU를 본편/A급 인수로 대체하지 않는다.


## 2026-10-09 — 독탄 접촉24 공통 엔진 소비

`ROOT-ENGINE-DRUID-POISON-HIT24-20261009`: 새6×4/24셀 one-shot을 fps60·age/60으로 첫24틱(.4게임초)에 소비한다. 새셀1회, 미준비·실패는 기존8셀 보간 폴백이며 전체72틱 잔향·r120·작은 핵·최대6파편·첫5틱 섬광·전투/Q/RNG/SFX/save는 유지한다. [현행 리소스·수치·폴백·검수 정본](DRUID_POISON_HIT24_ENGINE_20261009.md). 원화24장 검수와 실제 첫 화면에서 전24셀 표시 인수는 구분한다(첫age1 가능). 이번 native/실보스전/GPU/성능/청취/save/A급은 미인수, **VISUAL VERDICT: RETOUCH**. 기존8셀/native 기록은 당시 구현 이력이며 현재 새24검수로 합산하지 않는다. 외부 `engine-druid-poison-hit24-20261009/completion.json` 최종.
