# 타격감 수치 보강 — 공개 프레임 데이터 조사

조사일: 2026-11-05 KST. 연구 문서이며 게임 수치 변경안이나 구현 완료 보고가 아니다.
작업 기준: `codex/unity-study-frame-data-20261105`, HEAD `75add6ff4a6209e2590a7a626ffb4c37b5f0268e`.
작성 범위: 이 파일만. 커밋·push는 총괄 검토 후 별도 진행한다.

## 조사 범위와 읽는 법

공개 위키의 표, 측정자가 공개한 텍스트 표·측정 보고, 모드 제작자의 공개 설명, 개발자 인터뷰와 GDC 슬라이드의 텍스트만 조사했다. 영상 프레임을 새로 세거나 게임을 실행하지 않았다. 게임 파일·공개된 게임 코드 사본의 추출·열람·디컴파일, 이미지·게임 파일·에셋 다운로드, 로그인, 유료 서비스는 사용하지 않았다. 외부 자료는 이 문서에 필요한 수치와 URL로만 요약했다. 원문 직접 인용은 없다.

**결론:** 히트스톱, 회피 무적, 피격 경직을 하나의 시간으로 합치면 비교가 틀어진다. 공개 수치로 보강할 수 있는 항목과 아직 모르는 항목을 분리해야 한다. 특히 공개 위키라는 이유만으로 공식 수치나 현재 패치의 확정값으로 취급할 수 없다.

| 표시·출처 등급 | 이 문서의 의미 |
|---|---|
| [사실] | 해당 출처에 그 수치·조건이 실제로 공개되어 있다는 뜻. 독립 실행 검증이나 현재 버전의 정답을 보증하지 않는다. |
| [사실·환산] | 공개 원값의 단위만 계산으로 바꾼 것. 반올림한 ms는 새로운 측정값이 아니다. |
| [추정] | 기준 fps 가정, 검증되지 않은 해석·전용 제안. 관측값과 같은 칸에 섞지 않는다. |
| 미확인 | 이번 조사에서 조건과 수치를 함께 확인하지 못함. 존재하지 않는다는 뜻도, 정지 시간이 없다는 뜻도 아니다. |
| 공식 | 개발사 자료 또는 개발자가 직접 밝힌 값. 인터뷰 매체의 설명과 개발자 발언은 구분한다. |
| 커뮤니티 측정 | 측정 보고·커뮤니티 위키·모드 제작자의 공개 정리. 위키가 측정법을 밝히지 않았으면 그 제한을 적는다. 사이트 이름의 Official만으로 공식 등급을 부여하지 않는다. |
| 추정 | 직접 측정·공식 근거를 확보하지 못한 조건부 계산 또는 설계 해석. |

### 단위와 항목 구분

- `F`는 출처가 세는 프레임, `fps`는 그 표의 시간 기준, `s`는 초, `ms`는 밀리초다. 렌더링 fps와 데이터 작성자가 사용한 애니메이션 기준 fps는 다를 수 있다.
- 환산식은 `ms = F ÷ 기준 fps × 1000`, 초 단위 원값은 `ms = s × 1000`이다. 프레임 환산에는 각 행의 기준 fps를 사용한다. 초 단위 자료는 fps를 가정하지 않는다. ms는 필요할 때 소수 둘째 자리까지 반올림한다.
- 히트스톱: 명중 순간 멈춤. 공격자·피격자·전역 중 어디가 멈추는지 함께 적는다. 슬로모션과 별도다. 개발자 설명 근거: [GDC, Mariel Cartwright, Hitstop 절](https://media.gdcvault.com/gdcchina14/presentations/833784_MarielCartwright_PowerfulAndEffective_EN.pdf#page=30).
- 피격 경직(hitstun), 가드 경직(blockstun), 공격자 후딜(recovery), 프레임 유불리(on-block)는 서로 다른 값이다. 특히 유불리를 경직 지속시간으로 읽지 않는다. 정의 근거: [Dustloop의 프레임 표 용어](https://mail.dustloop.com/w/GGXRD-R2/Sol_Badguy/Frame_Data).
- 무적 프레임은 피해 무효 구간이다. 튕겨내기·패링의 유효 구간과 같지 않다. 기절 축적값도 시간이 아니다. 근거: [Eldenpedia 무적 설명](https://eldenring.wiki.gg/wiki/Invincibility_Frames), [MHW 공개 모드 설명의 stun damage 항목](https://www.nexusmods.com/monsterhunterworld/mods/3442).

## Dead Cells

개발자 발언은 당시 개발 버전에 대한 증언으로, 위키의 공격 시간은 위키가 정리한 값으로 구분한다. 공격 총시간을 히트스톱이나 공격 판정의 지속시간으로 치환하지 않았다.

| 게임·동작 | 항목·원값 | 단위·기준 fps | ms 또는 채택 상태 | 사실·추정 | 출처 등급 | 출처 URL·조건 |
|---|---|---|---|---|---|---|
| Dead Cells / 치명타 | 전역 정지 1F | F; 인터뷰에 기준 fps 미기재 | ms 미확인 | [사실] 개발자 발언 | 공식 | [Motion Twin 개발자 인터뷰](https://www.gamedeveloper.com/design/designing-each-of-the-50-weapons-in-i-dead-cells-i-to-feel-distinctive), 2017-07-07. 치명타 조건의 발언이며 모든 명중의 공통값이 아니다. |
| 같은 치명타 / 조건부 계산 | 위 행의 1F에 기준 60 fps를 가정 | F; **가정 60 fps** | 약 16.67 ms | [추정] fps 가정에 따른 환산 | 추정 | [같은 인터뷰](https://www.gamedeveloper.com/design/designing-each-of-the-50-weapons-in-i-dead-cells-i-to-feel-distinctive). 공식 ms 값으로 채택하지 않는다. |
| Dead Cells / 치명타 직후 | 정지 이후 슬로모션 | 정성 표현만 공개 | 정확한 ms·속도 배율 미확인 | 미확인 | 공식 | [같은 인터뷰](https://www.gamedeveloper.com/design/designing-each-of-the-50-weapons-in-i-dead-cells-i-to-feel-distinctive). 모호한 시간 표현을 임의의 범위로 만들지 않았다. |
| Dead Cells / Broadsword 첫 타 | 타격 동작 총시간 0.6s | s; fps 불필요 | 600 ms | [사실·환산] | 커뮤니티 측정 | [Broadsword, Combo Duration](https://deadcells.wiki.gg/wiki/Broadsword). 위키 정리, 측정법·적용 패치 미확인. |
| Dead Cells / Broadsword 다음 타 | 타격 동작 총시간 0.75s | s; fps 불필요 | 750 ms | [사실·환산] | 커뮤니티 측정 | [Broadsword, Second Hit](https://deadcells.wiki.gg/wiki/Broadsword). 히트스톱 수치가 아니다. |
| Dead Cells / Broadsword 마지막 타 | 타격 동작 총시간 0.9s | s; fps 불필요 | 900 ms | [사실·환산] | 커뮤니티 측정 | [Broadsword, Third Hit](https://deadcells.wiki.gg/wiki/Broadsword). 히트스톱 수치가 아니다. |
| Dead Cells / Broadsword 전체 연속 공격 | 콤보 총시간 2.25s | s; fps 불필요 | 2250 ms | [사실·환산] | 커뮤니티 측정 | [Broadsword, Combo Duration](https://deadcells.wiki.gg/wiki/Broadsword). 앞의 동작 시간과 별도의 정지 시간을 임의 합산하지 않는다. |
| Dead Cells / 회피 구르기 | 일반 구르기 지속 0.4s; 재사용 관련 쿨다운 0.37s | s; fps 불필요 | 각각 400 ms; 370 ms | [사실·환산] | 커뮤니티 측정 | [Mechanics, Rolling](https://deadcells.wiki.gg/wiki/Mechanics). 좁은 통로에서 지속이 늘어나는 예외가 있다. 쿨다운의 기산점을 임의 해석해 총주기를 계산하지 않았다. |
| Dead Cells / 회피 구르기 | 정확한 무적 시작·종료 | F 또는 s 미확인 | 미확인 | 미확인 | 커뮤니티 측정 | [같은 Mechanics](https://deadcells.wiki.gg/wiki/Mechanics). 위의 구르기 총시간 전체를 무적 시간으로 쓰지 않는다. |
| Dead Cells / 적의 breach 발생 | 행동 중단·기절 1.4s | s; fps 불필요 | 1400 ms | [사실·환산] | 커뮤니티 측정 | [Mechanics, Breach](https://deadcells.wiki.gg/wiki/Inflammable_oil#Breach). 공격·방어 행동 중 breach 조건을 만족할 때의 제어 효과다. 일반 명중의 정지 시간이 아니다. |

[사실] 인터뷰는 애니메이션 포즈를 더 오래 유지하는 작업도 설명한다. 이때의 애니메이션 프레임 표현을 게임 시뮬레이션 프레임으로 일괄 환산하면 안 된다. [원문 맥락](https://www.gamedeveloper.com/design/designing-each-of-the-50-weapons-in-i-dead-cells-i-to-feel-distinctive).

## Hades — 원작 기준

기본 대시와 무기 타격의 정확한 프레임 표는 확보하지 못했다. 대신 공개 은혜 표에서 확인한 무적 지속과 기절 발생 주기를 싣는다. 후속작의 수치를 가져오지 않았다.

| 게임·동작 | 항목·원값 | 단위·기준 fps | ms 또는 채택 상태 | 사실·추정 | 출처 등급 | 출처 URL·조건 |
|---|---|---|---|---|---|---|
| Hades / Athena's Aid, Common 기본값 | 무적·Deflect 효과 지속 1.5s | s; fps 불필요 | 1500 ms | [사실·환산] | 커뮤니티 측정 | [Athena/Boons (Hades), Athena's Aid](https://hades.fandom.com/wiki/Athena/Boons_%28Hades%29). 은혜 표의 기본 지속시간이며 일반 대시 값이 아니다. |
| Hades / Trippy Shot의 Festive Fog | 기절 발생 주기 0.25s | s; fps 불필요 | 250 ms 간격 | [사실·환산] | 커뮤니티 측정 | [Dionysus/Boons (Hades), Trippy Shot](https://hades.fandom.com/wiki/Dionysus/Boons_%28Hades%29). 주기이며 개별 기절의 지속시간이 아니다. |
| Hades / 같은 Festive Fog | 안개 지속 5s | s; fps 불필요 | 5000 ms | [사실·환산] | 커뮤니티 측정 | [같은 Trippy Shot 표](https://hades.fandom.com/wiki/Dionysus/Boons_%28Hades%29). 안개 전체 지속과 피격자의 행동 불능 시간을 구별한다. |
| Hades / 기본 대시 | 무적 시작·종료, 총 동작·후딜 | F·s 미확인 | 미확인 | 미확인 | 커뮤니티 측정 | [Gameplay mechanics, Dash](https://hades.fandom.com/wiki/Gameplay_mechanics). 대시 중 다른 행동으로 무적을 잃는 조건은 설명하지만 이번 열람에서 정확한 시간표는 확보하지 못했다. |
| Hades / 일반 무기 명중 | 무기별 히트스톱·피격 경직 | F·s 미확인 | 미확인 | 미확인 | 커뮤니티 측정 | [Status effects, Stun](https://hades.fandom.com/wiki/Status_effects). 일반 공격의 짧은 stagger와 보스의 stun 면역은 설명하나 무기별 지속 수치는 미확인이다. |

[추정] 기본 대시를 평가할 때는 대시만 한 경우와 대시 중 공격으로 전환한 경우를 별도 조건으로 다루는 편이 타당하다. 조건 근거는 [Gameplay mechanics](https://hades.fandom.com/wiki/Gameplay_mechanics)이며, 여기서 새 무적 시간을 제안하지는 않는다.

## Sekiro

공개 모드 커뮤니티 글은 다른 게임과 비교하는 문서지만 Sekiro의 일반 튕겨내기 동작과 시간 기준을 명시한다. 글 작성자가 이미 공개한 결과만 읽었고, 언급된 분석 도구나 게임 데이터를 직접 사용하지 않았다.

| 게임·동작 | 항목·원값 | 단위·기준 fps | ms 또는 채택 상태 | 사실·추정 | 출처 등급 | 출처 URL·조건 |
|---|---|---|---|---|---|---|
| Sekiro / 일반 튕겨내기 | 입력 직후 유효 구간 시작; 선딜 없음 | 시간 지연 없음이라는 설명 | 입력 장치·표시 지연은 미확인 | [사실] 공개 설명 | 커뮤니티 측정 | [daonjre, Parry Windows and Delay](https://www.nexusmods.com/stellarblade/articles/199), 2026-01-01. 일반 동작에 한정하며 특수 튕겨내기와 연타 페널티는 별도다. |
| Sekiro / 같은 일반 튕겨내기 | 유효 구간 12F = 0.2s | **60 fps** | 200 ms | [사실·환산] | 커뮤니티 측정 | [같은 공개 글](https://www.nexusmods.com/stellarblade/articles/199). 전체 무적이나 피격 경직 수치가 아니다. 글의 근거에는 다른 커뮤니티 분석의 참조가 포함된다. |
| Sekiro / 같은 구간의 애니메이션 표기 | 6F | **30 fps**, 위 행과 다른 시간축 | 200 ms | [사실·환산] | 커뮤니티 측정 | [같은 공개 글](https://www.nexusmods.com/stellarblade/articles/199). 서로 다른 프레임 수가 같은 시간을 가리키는 사례다. |
| Sekiro / 튕겨내기 성공 순간 | 정확한 히트스톱·상대 경직 지속 | F·s 미확인 | 미확인 | 미확인 | 커뮤니티 측정 | [같은 조사 글](https://www.nexusmods.com/stellarblade/articles/199). 패링 유효시간으로 대체하지 않는다. |

**충돌 보류:** [옛 커뮤니티 글](https://www.reddit.com/r/Sekiro/comments/q03vpx/)에는 초기 튕겨내기 구간이 **30F, 약 0.5s**라는 설명도 있다. [사실] 그러한 주장은 공개되어 있지만, 이 글만으로 원측정·현재 적용 조건을 확인할 수 없다. 위 Nexus 글의 **12F/60 fps**와 충돌하므로 이 문서에서는 [추정] 후보로만 남기고 채택하지 않는다. 충돌의 원인을 프레임 기준 차이라고 단정하지도 않는다. [Nexus의 비교 근거](https://www.nexusmods.com/stellarblade/articles/199).

## Elden Ring — 출처 충돌을 함께 기록

패치·계수 방식이 다른 자료를 섞어 단일 정답을 만들지 않았다. 아래 표는 공개된 주장들의 비교이며 최신 버전의 확정 무적 시간표가 아니다.

| 게임·동작·자료 조건 | 항목·원값 | 단위·기준 fps | ms 환산 | 사실·추정 | 출처 등급 | 출처 URL·제한 |
|---|---|---|---|---|---|---|
| Elden Ring / 경량·중량 구르기, Eldenpedia 표기 | 무적 14F | **30 fps**, 위키가 명시한 기준 | 466.67 ms | [사실·환산] 위키 기재값 | 커뮤니티 측정 | [Invincibility Frames, Rolling](https://eldenring.wiki.gg/wiki/Invincibility_Frames). 측정법·적용 패치 미기재. 중량은 medium이며 무거운 heavy와 구분한다. |
| Elden Ring / 무거운 heavy 구르기, 같은 위키 | 무적 13F | **30 fps** | 433.33 ms | [사실·환산] 위키 기재값 | 커뮤니티 측정 | [같은 위키](https://eldenring.wiki.gg/wiki/Invincibility_Frames). 위 행과 동일한 제한. |
| Elden Ring / 경량·중량 구르기, PC 관측 보고 | 관측 구간 27F | **60 fps**, 작성자가 명시 | 450 ms | [사실·환산] 측정 보고 | 커뮤니티 측정 | [원 측정자의 텍스트 보고](https://www.reddit.com/r/Eldenring/comments/t4wpgd/), 2022-03-02. 스태미나 감소부터 체력 감소까지 센 보고이므로 순수 엔진 무적 구간과 동일한지는 미확인. |
| Elden Ring / 경량·중량 구르기, 옛 재정리 | 무적이라고 기재한 26F | **60 fps**, 게시글에 명시 | 433.33 ms | [사실] 공개 표기; 채택 보류 | 추정 | [Frame Data for Dodging and Parrying](https://www.reddit.com/r/Eldenring/comments/tww7nv/), 2022-04-05. 작성자는 다른 제작자의 자료를 모았다고 밝힌다. 원측정 영상은 이번 조사에서 열지 않았다. |
| Elden Ring / 무기 명중·패링 성공 | 히트스톱·피격 경직의 동작별 현재값 | F·s 미확인 | 미확인 | 미확인 | 커뮤니티 측정 | [공개 Frame Data Explorer](https://er-frame-data.nyasu.business/). 이번 텍스트 열람에서 데이터 표를 읽을 수 없어 수치를 채택하지 않았다. |

[사실] 위 비교에서는 **30 fps의 프레임 수를 60 fps로 잘못 나누는 오류**와 별개로 출처 자체의 값도 일치하지 않는다. [위키 기준](https://eldenring.wiki.gg/wiki/Invincibility_Frames), [원 관측 보고](https://www.reddit.com/r/Eldenring/comments/t4wpgd/), [옛 재정리](https://www.reddit.com/r/Eldenring/comments/tww7nv/). [추정] 패치 차이·관측 경계·계수 방식이 원인일 수 있지만 이번 조사로 구분할 수 없다. 평균값을 만들거나 한 출처를 최신 정답으로 승격하지 않는다.

## Monster Hunter: World / Iceborne

### 회피 무적: 원 측정자의 범위를 보존

[사실] PC 측정자는 각 조건에서 서로 다른 관측 시간을 보고했고, 초 단위 측정 오차도 **±0.002s(±2 ms)**로 적었다. 따라서 최솟값만 떼어 엔진 상수로 쓰지 않는다. 아래 ms는 **출처의 초 단위 표를 직접 환산**한 것이며 프레임 수를 역산한 값과 반올림 차이가 있다. [추정] 표의 프레임 수와 초값의 대응은 **60 fps**로 해석했으며, 이것으로 작성자의 실제 실행 fps를 확정하지 않는다. ms 계산에는 이 fps 해석을 사용하지 않았다. [원 측정표와 설명](https://www.reddit.com/r/MonsterHunter/comments/c0klwh/).

| 게임·동작·조건 | 무적 관측값, 최솟값~최댓값 | 단위·기준 fps | 출처 초값의 ms 환산 | 사실·추정 | 출처 등급 | 출처 URL |
|---|---|---|---|---|---|---|
| MHW-PC / 기본 회피 | 13~14F; 0.217~0.234s | 프레임 표는 60 fps 대응, 초값 병기 | 217~234 ms | [사실·환산] 관측 범위 | 커뮤니티 측정 | [Ihateallkhezu 측정표](https://www.reddit.com/r/MonsterHunter/comments/c0klwh/) |
| MHW-PC / Evade Window Lv1 | 15~16F; 0.251~0.268s | 프레임 표는 60 fps 대응 | 251~268 ms | [사실·환산] | 커뮤니티 측정 | [같은 측정표](https://www.reddit.com/r/MonsterHunter/comments/c0klwh/) |
| MHW-PC / Evade Window Lv2 | 17~18F; 0.284~0.301s | 프레임 표는 60 fps 대응 | 284~301 ms | [사실·환산] | 커뮤니티 측정 | [같은 측정표](https://www.reddit.com/r/MonsterHunter/comments/c0klwh/) |
| MHW-PC / Evade Window Lv3 | 19~20F; 0.318~0.335s | 프레임 표는 60 fps 대응 | 318~335 ms | [사실·환산] | 커뮤니티 측정 | [같은 측정표](https://www.reddit.com/r/MonsterHunter/comments/c0klwh/) |
| MHW-PC / Evade Window Lv4 | 22~23F; 0.368~0.385s | 프레임 표는 60 fps 대응 | 368~385 ms | [사실·환산] | 커뮤니티 측정 | [같은 측정표](https://www.reddit.com/r/MonsterHunter/comments/c0klwh/) |
| MHW-PC / Evade Window Lv5 | 25~26F; 0.418~0.435s | 프레임 표는 60 fps 대응 | 418~435 ms | [사실·환산] | 커뮤니티 측정 | [같은 측정표](https://www.reddit.com/r/MonsterHunter/comments/c0klwh/) |

원글은 MHW-PC 당시 보고이며 개별 무기의 특수 회피까지 보장하지 않는다. 현재 Iceborne에 동일하게 적용되는지와 관측 범위가 생긴 원인은 미확인이다. [Kiranico도 회피 무적과 회피 거리 증가는 구분](https://mhworld.kiranico.com/en/guide/evade-defense)하므로 거리 증가 스킬을 무적 시간 증가로 읽지 않는다.

### 모드 제작자가 공개한 수치와 빈칸

| 게임·동작·조건 | 항목·원값 | 단위·기준 fps | 시간 환산·채택 상태 | 사실·추정 | 출처 등급 | 출처 URL·제한 |
|---|---|---|---|---|---|---|
| MHW / Hunting Horn Echo Attack, 원본 동작에 대한 설명 | 히트스톱 없음 | 정지 없음; fps 불필요 | 제작자 설명상 정지 0 ms | [사실] 제작자 주장 | 커뮤니티 측정 | [Ignitehawk, HOOT](https://www.nexusmods.com/monsterhunterworld/mods/3442). 모드는 여기에 소량의 정지를 추가하지만 추가 시간은 미공개. 독립 측정은 하지 않았다. |
| MHW / Great Sword True Charged Slash 첫 명중, HOOT 변경 | 히트스톱을 조금 감소 | F·s 미공개 | 원본·변경 후·차이 모두 미확인 | 미확인 | 커뮤니티 측정 | [같은 HOOT 설명](https://www.nexusmods.com/monsterhunterworld/mods/3442). 감소라는 말만으로 ms를 만들지 않았다. |
| MHW / Sword and Shield Falling Bash 후속 명중, HOOT 변경 | stun damage 15 → 30 | **기절 축적량 포인트**, fps 해당 없음 | ms 환산 불가 | [사실] 모드 변경값 | 커뮤니티 측정 | [같은 HOOT 설명](https://www.nexusmods.com/monsterhunterworld/mods/3442). 원본 → 모드 값이다. 경직 시간이나 히트스톱 프레임이 아니다. |

World의 수치를 Rise·Wilds·Frontier의 값으로 채우지 않았다. 다른 작품의 오래된 히트스톱 표는 이번 World 표의 근거로 채택하지 않는다.

## 격투 게임 커뮤니티 위키 — Guilty Gear Xrd REV 2

Dustloop의 동작 표와 공격 레벨별 표를 연결했다. Strive나 Xrd SIGN의 행을 섞지 않았다. 아래는 일반 상태·일반 명중·지상 일반 가드 기준이며 Dragon Install, Counter Hit, Instant Block 등은 제외한다.

### 동작 표: 공격자의 시간과 유불리

| 게임·동작 | 발생 표기 | 판정 지속 | 후딜 | 가드 유불리 | 단위·기준 fps | 사실·추정 | 출처 등급 | 출처 URL |
|---|---|---|---|---|---|---|---|---|
| GGXrd REV 2 / Sol 5P | 4F | 4F | 6F | ±0F | F; 60 fps | [사실] 표 기재 | 커뮤니티 측정 | [Sol 동작 표](https://mail.dustloop.com/w/GGXRD-R2/Sol_Badguy) |
| GGXrd REV 2 / Sol c.S | 5F | 2F | 16F | −4F | F; 60 fps | [사실] 표 기재 | 커뮤니티 측정 | [Sol Frame Data](https://mail.dustloop.com/w/GGXRD-R2/Sol_Badguy/Frame_Data) |
| GGXrd REV 2 / Sol 5H | 11F | 2F | 26F | −9F | F; 60 fps | [사실] 표 기재 | 커뮤니티 측정 | [Sol Frame Data](https://mail.dustloop.com/w/GGXRD-R2/Sol_Badguy/Frame_Data) |

발생 표기는 **첫 유효 프레임을 포함**한다. 따라서 발생 수치를 그대로 선딜의 빈 프레임 수나 입력 지연으로 읽으면 안 된다. 정의: [Dustloop 용어](https://mail.dustloop.com/w/GGXRD-R2/Sol_Badguy/Frame_Data). 시간 기준은 [REV 2 시스템 설명의 프레임·초 대응](https://mail.dustloop.com/w/GGXRD-R2/Mechanics)에 따른다.

### 동작별 히트스톱·피격 경직·가드 경직

아래는 동작의 Level과 위키의 공통 Level 규칙을 결합한 값이다. 직접 새로 잰 결과가 아니며, 개별 동작의 예외·다른 판정 상태에는 그대로 적용하지 않는다.

| 게임·동작 / 공격 레벨 | 히트스톱, F → ms | 서 있는 상대 hitstun, F → ms | 지상 일반 blockstun, F → ms | 단위·기준 fps | 사실·추정 | 출처 등급 | 출처 URL |
|---|---|---|---|---|---|---|---|
| GGXrd REV 2 / Sol 5P / Lv0 | 11F → 183.33 ms | 10F → 166.67 ms | 9F → 150 ms | **60 fps** | [사실·환산] 공개 표 결합 | 커뮤니티 측정 | [Sol의 Level](https://mail.dustloop.com/w/GGXRD-R2/Sol_Badguy), [REV 2 레벨 공통표](https://mail.dustloop.com/w/GGXRD-R2/Answer/Frame_Data) |
| GGXrd REV 2 / Sol c.S / Lv2 | 13F → 216.67 ms | 14F → 233.33 ms | 13F → 216.67 ms | **60 fps** | [사실·환산] 공개 표 결합 | 커뮤니티 측정 | [Sol의 Level](https://mail.dustloop.com/w/GGXRD-R2/Sol_Badguy/Frame_Data), [같은 공통표](https://mail.dustloop.com/w/GGXRD-R2/Answer/Frame_Data) |
| GGXrd REV 2 / Sol 5H / Lv4 | 15F → 250 ms | 19F → 316.67 ms | 18F → 300 ms | **60 fps** | [사실·환산] 공개 표 결합 | 커뮤니티 측정 | [Sol의 Level](https://mail.dustloop.com/w/GGXRD-R2/Sol_Badguy/Frame_Data), [같은 공통표](https://mail.dustloop.com/w/GGXRD-R2/Answer/Frame_Data) |

[사실] Counter Hit 추가 정지는 피격자에게만 적용된다는 주석이 있다. 양쪽의 정지 시간을 항상 같게 두는 해석은 이 조건에서 틀린다. [공통표 주석](https://mail.dustloop.com/w/GGXRD-R2/Answer/Frame_Data). 위 ms를 Dead Cells 치명타 정지나 액션 게임 전체의 권장값으로 일반화하지 않는다.

## 개발자 자료·GDC·트위터 확인 결과

| 자료·대상 | 확인한 값·내용 | 단위·기준 fps | 사실·추정 | 출처 등급 | 출처 URL·채택 한계 |
|---|---|---|---|---|---|
| Dead Cells / 치명타 정지 | 위 Dead Cells 표에 수록한 개발자 직접 발언 | F; 기준 fps 미확인 | [사실] | 공식 | [개발자 인터뷰](https://www.gamedeveloper.com/design/designing-each-of-the-50-weapons-in-i-dead-cells-i-to-feel-distinctive). 발언 당시 버전의 사례다. |
| GDC / Mariel Cartwright, 공격 예비동작 | 1F의 예비동작도 대비를 줄 수 있다는 설명 | 애니메이션 F; 해당 예시의 fps 미확인, ms 미환산 | [사실] 발표자의 제작 지침 | 공식 | [Powerful and Effective Animation, Anticipation 슬라이드](https://media.gdcvault.com/gdcchina14/presentations/833784_MarielCartwright_PowerfulAndEffective_EN.pdf#page=8). 특정 게임 동작의 실측 선딜이나 무적 값이 아니다. |
| 같은 GDC / 공격 포즈 overshoot | 1F의 overshoot 설명 | 애니메이션 F; fps 미확인, ms 미환산 | [사실] 발표자의 제작 지침 | 공식 | [Overshoot 슬라이드](https://media.gdcvault.com/gdcchina14/presentations/833784_MarielCartwright_PowerfulAndEffective_EN.pdf#page=18). 정지 프레임으로 바꾸지 않는다. |
| 같은 GDC / 히트스톱 | 양 캐릭터의 명중 순간 정지를 설명 | 동작별 수치 미공개 | 미확인 | 공식 | [Hitstop 슬라이드](https://media.gdcvault.com/gdcchina14/presentations/833784_MarielCartwright_PowerfulAndEffective_EN.pdf#page=30). 설명이 있다는 이유로 정확한 정지 시간을 부여하지 않았다. |
| Dead Cells / Sébastien Bénard GDC 발표 | 컨트롤·전투 관련 슬라이드 확인 | 히트스톱·무적·경직의 동작별 수치 미확인 | 미확인 | 공식 | [Dead Cells: what the f*n?!](https://media.gdcvault.com/gdc2019/presentations/Benard-Sebastian-DeepCells.pdf). 공개 텍스트만 읽었으며 영상이나 슬라이드 내 이미지를 분석하지 않았다. |
| 개발자 트위터·X | 작성자·동작·단위까지 확인되는 직접 게시물 미확보 | 수치 미확인 | 미확인 | 추정 | [Bénard 발표의 작성자 정보](https://media.gdcvault.com/gdc2019/presentations/Benard-Sebastian-DeepCells.pdf#page=23)는 계정을 안내하지만 수치 발언의 근거는 아니다. 직접 게시물 URL을 확보하지 못해 트위터발 수치를 싣지 않았다. |

## 지옥의 길에 적용할 연구 해석

아래는 모두 **[추정] 설계 검토 방향**이다. 이 문서에서 새 타격감 상수를 확정하거나 기존 Core 판정·수치를 바꾸지 않는다.

- **정지와 제어 불능을 나눠 검토한다.** 명중 순간의 읽힘은 히트스톱, 후속 공격 가능성은 경직·후딜·캔슬 조건으로 따로 기록한다. 근거: [REV 2 공통표](https://mail.dustloop.com/w/GGXRD-R2/Answer/Frame_Data).
- **정지 후 감속과 포즈 유지를 분리한다.** 짧은 정지 자체를 길게 늘리는 것만으로 무게를 만들 필요는 없다. 근거: [Dead Cells 개발자 설명](https://www.gamedeveloper.com/design/designing-each-of-the-50-weapons-in-i-dead-cells-i-to-feel-distinctive), [GDC 포즈 설명](https://media.gdcvault.com/gdcchina14/presentations/833784_MarielCartwright_PowerfulAndEffective_EN.pdf#page=18).
- **강공격은 공격 총시간과 명중 정지를 별도 축으로 본다.** 느린 공격 시간만으로 실제 히트스톱을 역산할 수 없다. 근거: [Broadsword 시간표](https://deadcells.wiki.gg/wiki/Broadsword), [HOOT의 정성적 변경 설명](https://www.nexusmods.com/monsterhunterworld/mods/3442).
- **방어 성공 창과 피해 무효를 구분한다.** Sekiro 튕겨내기 창을 회피 무적 값으로 전용하거나 Hades 은혜 무적을 기본 대시에 넣지 않는다. 근거: [Sekiro 공개 분석 설명](https://www.nexusmods.com/stellarblade/articles/199), [Athena 은혜 표](https://hades.fandom.com/wiki/Athena/Boons_%28Hades%29).
- **충돌하는 수치는 테스트 목표값으로 고정하지 않는다.** 특히 Elden Ring 구르기는 판본·측정 경계를 먼저 확인해야 한다. 근거: [Eldenpedia](https://eldenring.wiki.gg/wiki/Invincibility_Frames), [원 측정자 보고](https://www.reddit.com/r/Eldenring/comments/t4wpgd/).

후속 검토 기록에는 게임·패치·플랫폼, 정확한 동작과 강화 조건, 명중/가드/실패, 공격자/피격자/전역, 시간 항목, 원값·단위·기준 fps, 출처 URL, 출처 등급, 측정 오차, 사실/추정 표시를 함께 둔다. 비어 있는 필드는 미확인으로 유지한다.

## 출처 열람 한계와 검수 상태

- **본문 확인:** Game Developer 개발자 인터뷰, GDC 슬라이드의 텍스트, Hades의 Athena·Dionysus 개별 은혜 표, Nexus의 Sekiro 비교 글·HOOT 설명, MHW-PC 원 측정표를 읽었다.
- **검색 색인으로 확인:** Dead Cells 위키, Eldenpedia, Dustloop의 해당 행·공통표는 검색 서비스가 반환한 페이지 본문 발췌로 확인했다. 직접 페이지 열기는 접근 거부·시간 초과가 있어 개정 이력까지 대조하지 못했다. 본문의 숫자는 발췌에서 확인된 범위만 요약했으며 최신 패치 확정값으로 표시하지 않았다.
- **보류:** Frame Data Explorer는 텍스트 표를 반환하지 않았다. Sekiro의 옛 상충 주장과 Elden Ring 재정리 표는 원측정 확인이 부족해 채택을 보류했다. 원자료가 이미지나 영상에만 있는 경우 받거나 분석하지 않았다.
- **작성 검수:** 수치 행마다 출처 URL과 단위·기준 fps를 기록했다. 원값과 계산값, 시간과 축적량, 공개 사실과 추정을 구분했다. 원문 장문 인용·에셋 첨부·실행 검증은 없다.
- **남은 한계:** 이번 문서는 공개 자료 조사 완료 범위다. 지옥의 길의 타격감 개선·런타임 검증·사용자 수용 여부를 증명하지 않는다.
