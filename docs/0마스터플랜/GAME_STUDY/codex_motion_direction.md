# 캐릭터·몬스터 동작 연구 — 픽셀·2.5D 액션

작성일: 2026-11-05. 공개 웹 문헌 조사. 대상: Dead Cells, Hades, Blasphemous, Katana ZERO, Hyper Light Drifter. GDC의 Skullgirls 제작 발표를 동작 원리의 보조 사례로 포함한다.

**결론:** 이번에 확인한 공개 원문만으로 대상 게임들의 공격을 예비·발동·접점·회복으로 모두 수치화할 수는 없다. 확인된 정량 자료는 Dead Cells의 치명타 정지 설명, Hades의 이용자 측정 공격 주기, 보조 GDC 사례의 작화 프레임·홀드 예시다. 이를 섞어 완성된 프레임 데이터처럼 만들지 않았다.

## 조사 범위와 표기

- **[사실]** 원문에 직접 쓰인 내용. 개발자 발언도 해당 발언 시점의 설명으로 한정한다. 커뮤니티 측정은 ‘게시자가 그렇게 측정했다고 보고한 사실’이며 독립 재검증을 뜻하지 않는다.
- **[추정]** 연구자의 해석·적용안·계산. 확인된 수치에서 환산했어도 원문이 제시한 실측값과 구별한다. 근거 없는 게임별 권장 프레임 수는 제안하지 않는다.
- **미확인** 이번에 읽은 자료에서 해당 항목의 수치·조건을 확인하지 못했다는 뜻이다. 해당 게임에 그 기능이 없거나, 모든 공개 자료에 수치가 없다는 뜻은 아니다.
- **출처 등급:** `공식`은 개발자 작성 글·공식 패치 노트·GDC 발표·개발자의 직접 인터뷰/AMA 답변이다. 게시 장소가 Reddit이어도 개발자 본인 답변이면 공식으로 분류한다. `커뮤니티 측정`은 이용자가 직접 측정했다고 밝힌 자료다. `추정`은 이 문서의 계산·제작 제안이다. 공식이라는 등급이 최신 버전 검증을 보장하지는 않는다.
- 조사 방법은 웹 검색과 HTML·공개 발표 PDF의 텍스트 열람이다. 다른 레인의 연구 문서는 읽지 않았다. 이미지·영상·게임 파일·에셋을 저장하거나 문서에 삽입하지 않았고, 게임 파일 추출·직접 플레이·영상 프레임 계수도 하지 않았다. 링크만 제공한다. 원문 직접 인용은 하지 않았다.

## 시간과 동작을 구분하는 기준

아래는 **[추정: 연구용 분류]**다. 사용자 요청의 예비·발동·접점·회복을 기록하기 위한 이 문서 자체의 정의이며, 게임 내부 상태의 공식 명칭으로 취급하지 않는다. 판정 시간과 작화 시간을 따로 적는다.

| 항목 | 이 문서의 기록 기준 | 섞으면 안 되는 항목 |
|---|---|---|
| 예비 | 공격 의도가 보이기 시작한 때부터 본격적인 타격 움직임 직전까지 | 입력 후 지연 전체, AI가 공격을 선택하기 전 대기 |
| 발동 | 타격 움직임 시작부터 최초 판정 가능 시점 직전까지 | 격투 게임 자료의 startup은 예비를 포함할 수 있으므로 원문 정의 확인 필요 |
| 접점 | 최초 접촉 시점과 판정 활성 구간을 별도 기록 | 칼 궤적 VFX 전체 길이, 타격 뒤 정지 시간 |
| 회복 | 판정 종료 뒤 다음 행동이 가능해질 때까지 | 시각적으로 idle에 복귀하는 시점, 다음 공격 AI 쿨다운 |
| 키포즈 수 | 의미 있는 자세의 개수 | 이미지 장수, 본 키의 개수, 시간 틱 수 |
| 포즈 홀드 | 자세를 유지하는 표시 시간 | 피격 여부에 따라 발동하는 히트스톱 |
| 히트스톱 / 피격 경직 | 각각 접촉 순간의 정지 / 피격자가 조작·행동을 회복하기까지의 제한 | 무적 시간, 넉백 이동 시간, 보스의 상태 이상 저항 |

**[사실]** GDC는 히트스톱을 접촉 뒤 양쪽 캐릭터가 나머지 애니메이션을 진행하기 전에 멈추는 시간으로 설명한다. 따라서 공격자와 피격자가 멈춘 시간을 피격자의 행동 불가 시간 전체로 쓰지 않는다. [GDC: Hitstop](https://media.gdcvault.com/GDC2014/Presentations/Cartwright_Muriel_Animation_Bootcamp_Fluid.pdf)

**[추정: 단위 규칙]** 원문 시간은 `s` 또는 `ms`, 원문 프레임은 `F원문`, 애니메이션 이미지 수는 `작화 장수`로 표시한다. 비교용 `F60`은 **60 fps를 가정한 시간 환산값**이다. 실제 게임·녹화·애니메이션 fps가 아니다. 환산은 `F60 = 초 × 60`으로 하며, 이 기준은 GDC의 홀드 예시에 명시된 **60 fps**에서 가져왔다. 원문 기준 fps가 없으면 `미공개`로 남긴다. [GDC: Use holds effectively](https://media.gdcvault.com/GDC2014/Presentations/Cartwright_Muriel_Animation_Bootcamp_Fluid.pdf)

## 게임·동작별 공격 구성

‘접점’ 칸에 정지가 기재된 경우에도 **판정 활성 길이를 알아냈다는 뜻은 아니다.** 전체 주기만 알려진 공격을 같은 길이로 나눠 예비·발동·회복을 만들어내지 않았다.

| 게임·동작 / 자료의 범위 | 예비 | 발동 | 접점·판정 활성 | 회복 | 확인된 전체 시간 또는 별도 효과 | 단위·기준 fps | 출처 등급·판정·URL |
|---|---|---|---|---|---|---|---|
| Dead Cells / 치명타가 발생한 공격, 개발자 인터뷰 시점 | 미확인 | 미확인 | 판정 활성 길이 미확인. 접촉 뒤 정지는 별도 효과 | 미확인 | 치명타 때 게임 정지 **1 F원문**, 이후 짧은 슬로모션. 슬로모션의 정확한 길이·배율 미확인 | 원문 프레임; fps 미공개. ms로 확정 환산하지 않음 | 공식·[사실: 개발자 설명]. [The beauty of the sword](https://www.gamedeveloper.com/design/designing-each-of-the-50-weapons-in-i-dead-cells-i-to-feel-distinctive) |
| Hades / Twin Fists 일반 공격 연속 콤보, 이용자 측정 | 미확인 | 미확인 | 개별 타격의 접점·활성 길이 미확인 | 별도 길이 미확인; 보고된 전체 주기에 포함 | **5타 콤보+회복 1.5 s**. 시작 프레임에서 다음 콤보 시작 프레임까지 계수했다고 보고 | s; 게임·녹화 fps, 버전·공속 보정 조건 미공개 | 커뮤니티 측정·[사실: 게시자 보고, 재검증 안 함]. [Nazrax의 측정](https://www.reddit.com/r/HadesTheGame/comments/1j3ilqg/doing_the_math_on_the_fists/) |
| Hades / Twin Fists Special 사용, 같은 이용자 측정 | 미확인 | 미확인 | 개별 접점 미확인 | 분리 수치·종료 경계 미확인 | Special 소요 **1 s** 보고. 일반 콤보만큼 계수 경계 설명이 명확하지 않음 | s; 게임·녹화 fps 미공개 | 커뮤니티 측정·[사실: 게시자 보고, 재검증 안 함]. [동일 원문](https://www.reddit.com/r/HadesTheGame/comments/1j3ilqg/doing_the_math_on_the_fists/) |
| Hades / Stygian Blade Nova | 미확인 | 미확인 | 폭발 속도와 VFX를 맞추도록 수정했다고 공식 기록. 수정 전에는 즉시 타격 | 미확인 | 정량 시간 미확인 | F·s 미확인; 기준 fps 미확인 | 공식·[사실: 당시 수정 내용]. [High Speed Update: Weapons & Powers](https://www.supergiantgames.com/blog/hades-the-high-speed-update-patch-notes/) |
| Blasphemous / The Penitent One 기본 검격 | 미확인 | 미확인 | 미확인 | 미확인 | 개발자 AMA에서 제작법은 확인. 이 동작의 단계별 시간은 미확인 | F·s 미확인; 기준 fps 미확인 | 공식·수치 미확인. [개발자 AMA](https://www.reddit.com/r/NintendoSwitch/comments/d2af0j/hey_were_the_game_kitchen_the_team_behind/) |
| Blasphemous / 개발자 AMA가 설명한 검술 보스 공격 | 미확인 | 미확인 | 미확인 | 미확인 | 디자이너가 공격을 설계하고 애니메이터가 검술 참고 동작과 포즈를 제안. 해당 답변에서 보스 이름·단계 시간 미확인 | F·s·키포즈 개수 미확인; 기준 fps 미확인 | 공식·[사실: 제작 설명]. [AMA의 rotoscope 질문 답변](https://www.reddit.com/r/NintendoSwitch/comments/d2af0j/hey_were_the_game_kitchen_the_team_behind/) |
| Blasphemous / Esdras Quick Attack | 미확인 | 미확인 | 미확인 | 미확인 | [사실: 작성자의 분석] 짧은 예고와 공격 후 반격 기회를 설명. 수치 도표는 이미지이므로 이번 조사에서 숫자 미확인 | F·s·fps 미확인 | 커뮤니티 측정·수치 미채택. [SnoukDesignNotes: Quick Attack](https://snoukdesignnotes.blog/2021/06/30/boss-design-ft-blasphemous/) |
| Blasphemous / Esdras Charge Attack | 미확인 | 미확인 | 미확인 | 미확인 | [사실: 작성자의 분석] 장거리 접근 공격과 회복 중 반격을 설명. 개별 구간 수치는 텍스트에서 미확인 | F·s·fps 미확인 | 커뮤니티 측정·수치 미채택. [SnoukDesignNotes: Charge Attack](https://snoukdesignnotes.blog/2021/06/30/boss-design-ft-blasphemous/) |
| Katana ZERO / Zero 기본 참격 | 미확인 | 미확인 | 미확인 | 미확인 | 개발자 직접 인터뷰에서 정밀한 조작·공정성의 목표 확인. 참격의 정량 분해는 미확인 | F·s 미확인; 기준 fps 미확인 | 공식·수치 미확인. [Justin Stander 인터뷰](https://www.gamerevolution.com/originals/520685-katana-zero-interview) |
| Hyper Light Drifter / Drifter 공격, 프리알파 인터뷰 | 미확인 | 미확인 | 접점·활성 길이 미확인 | 미확인 | 공격 등에 무게를 주는 짧은 홀드가 있다고 개발자가 설명. 정확한 시간·대상 동작 미확인 | ms로 서술하지만 수치 미공개; fps 미공개 | 공식·[사실: 개발 중 설명]. [Alex Preston 인터뷰](https://cheerfulghost.com/jdodson/posts/2021/interview-w-alex-preston-creator-of-hyper-light-drifter) |

**[추정: 환산만 제공]** Hades 이용자 보고를 비교 기준으로 바꾸면 일반 콤보 전체는 **90 F60**, Special은 **60 F60**이다. 계산의 입력값은 각각 **1.5 s / 1 s**다. 실제 계수된 프레임 수나 단일 주먹 타격의 길이가 아니며, 콤보 평균을 개별 공격의 프레임 수로 사용하지 않는다. [수치 원문](https://www.reddit.com/r/HadesTheGame/comments/1j3ilqg/doing_the_math_on_the_fists/), [환산 기준 fps의 근거](https://media.gdcvault.com/GDC2014/Presentations/Cartwright_Muriel_Animation_Bootcamp_Fluid.pdf)

## 키포즈 수·홀드 프레임

| 게임·동작 | 키포즈 수 | 홀드·표시 간격 | 단위·기준 fps | 출처 등급·확인 범위 |
|---|---|---|---|---|
| Dead Cells / 공격 제작 전반 | 미확인 | [사실] 최소한의 프레임으로 포즈·타이밍을 먼저 성립시킨 뒤 키 주변에 보간을 추가하는 pose-to-pose 접근. 홀드의 정량값 미확인 | 포즈 개수·홀드 F 미확인; fps 미공개 | 공식. [Thomas Vasseur 제작 글: What](https://www.gamedeveloper.com/production/art-design-deep-dive-using-a-3d-pipeline-for-2d-animation-in-i-dead-cells-i-) |
| Hades / Zagreus 공격 | 미확인 | 미확인. 여러 각도에서 사전 렌더했다는 사실만으로 작화 간격을 알 수 없음 | 포즈 개수·홀드 F·애니메이션 fps 미확인 | 공식. [개발자 kid_zomb 답변](https://steamcommunity.com/app/1145360/discussions/0/1738883810796606862/) |
| Blasphemous / 검술 보스·주인공 제작 | 미확인 | [사실] 검술 참고 포즈에서 흐름을 만들며, 프레임별 픽셀 작화. 일정 홀드 간격이라는 설명은 확인하지 못함 | 포즈 개수·홀드 F·fps 미확인 | 공식. [개발자 AMA](https://www.reddit.com/r/NintendoSwitch/comments/d2af0j/hey_were_the_game_kitchen_the_team_behind/) |
| Katana ZERO / 기본 참격 | 미확인 | 미확인 | 포즈 개수·홀드 F·fps 미확인 | 공식 인터뷰의 확인 범위 밖. [개발자 인터뷰](https://www.gamerevolution.com/originals/520685-katana-zero-interview) |
| Hyper Light Drifter / 공격 | 미확인 | [사실] 공격 등에 짧은 홀드가 있다는 설명. 고정된 장수나 정밀한 ms는 제시하지 않음 | ms 정성 표현; F·fps 미확인 | 공식. [프리알파 인터뷰](https://cheerfulghost.com/jdodson/posts/2021/interview-w-alex-preston-creator-of-hyper-light-drifter) |

### GDC 보조 사례 — 시간 틱과 작화 장수의 차이

Skullgirls는 대상 게임들의 대체 프레임 데이터가 아니다. 이 발표는 키포즈·홀드·중간 작화의 관계를 수치와 함께 설명하므로 보조 사례로 쓴다.

| 게임·동작 / 발표 항목 | 원문에 있는 수치 | 단위·기준 fps | 출처 등급·해석 제한 |
|---|---|---|---|
| Skullgirls / Filia kneefall 수정 | [사실] 기존 **21 frames**에서 **6 frames**를 덜었다고 설명 | 애니메이션 프레임 수; 키포즈 수·노출 시간·동작별 재생 fps 미확인 | 공식. [GDC: Filia’s 21 frame kneefall, fixed](https://media.gdcvault.com/GDC2014/Presentations/Cartwright_Muriel_Animation_Bootcamp_Fluid.pdf). [추정: 계산] 잔여 **15 frames**지만 이를 게임 시간으로 환산하지 않음 |
| Skullgirls / Cerebella Diamond Punch 수정 | [사실] **45 frames → 29 frames**. 불필요한 중간 작화를 줄이고 포즈를 명료하게 바꾼 사례 | 애니메이션 프레임 수; 단계별 시간·키포즈 수·해당 동작 fps 미확인 | 공식. [GDC: Cerebella Diamond Punch / fixed](https://media.gdcvault.com/GDC2014/Presentations/Cartwright_Muriel_Animation_Bootcamp_Fluid.pdf). startup이나 전체 게임 틱 수로 전용하지 않음 |
| 홀드 설명의 반례 예시 / 특정 공격 지정 없음 | [사실] 모든 그림을 **60 fps에서 4프레임씩** 똑같이 유지할 필요는 없다고 설명 | 기준 **60 fps**, 홀드 **4 F**는 일률 배치의 예시 | 공식. [GDC: Use holds effectively](https://media.gdcvault.com/GDC2014/Presentations/Cartwright_Muriel_Animation_Bootcamp_Fluid.pdf). 해당 게임의 기본 홀드값이나 권장값이 아님 |

**[추정: 제작 적용]** 키포즈 수를 줄이는 일과 전체 공격 시간을 줄이는 일은 별도다. 기존 판정 시간을 유지하면서 포즈 노출을 재배분하는 시도를 먼저 검토할 수 있다. 위 사례는 ‘그림을 많이 넣으면 타격감이 좋아진다’는 자동 판단을 지지하지 않는다. [근거: GDC Review / Use holds effectively](https://media.gdcvault.com/GDC2014/Presentations/Cartwright_Muriel_Animation_Bootcamp_Fluid.pdf)

## 이동 가감속·피격 경직·몬스터 예고

| 게임·동작 | 이동 가감속: 필요한 단위 / 확인 결과 | 피격 경직·예고: 확인 결과 | 기준 fps | 출처 등급·URL |
|---|---|---|---|---|
| Dead Cells / 주행·방향 전환·근접전 | 최고속도 px/s, 가속·감속 px/s², 정지 시간 s 모두 미확인. [사실] GDC는 자유로운 방향 전환과 이동 보정을 설명 | 피격 경직 F·s 미확인. 치명타의 정지는 행동 불가 시간 전체와 구분 | 관련 수치의 fps 미공개 | 공식. [GDC: Control tricks / Combat](https://media.gdcvault.com/gdc2019/presentations/Benard-Sebastian-DeepCells.pdf), [치명타 설명](https://www.gamedeveloper.com/design/designing-each-of-the-50-weapons-in-i-dead-cells-i-to-feel-distinctive) |
| Hades / 이동·Dash 이후 공격 | 가속·감속·정지 시간 미확인. [사실] 기본 동작과 검·활의 특정 연계에서 입력 버퍼를 개선한 기록 | [사실] 활 Volley와 Tidal Dash의 stagger 관련 변경. 경직 F·s·대상별 내성은 미확인 | 미공개 | 공식. [High Speed Update: General Gameplay / Weapons / Boons](https://www.supergiantgames.com/blog/hades-the-high-speed-update-patch-notes/) |
| Blasphemous / 이동·방어·보스 검격 | 가감속 px/s²·정지 s 미확인. [사실] 개발자는 캐릭터의 물리적 무게를 위해 순간이동·공중 대시 같은 이동안을 제외했다고 설명 | 보스별 예고 F·s, 피격 경직 F·s 미확인. 공격 설계와 참고 포즈의 협업은 확인 | 미공개 | 공식. [AMA: defensive mechanics / rotoscope 답변](https://www.reddit.com/r/NintendoSwitch/comments/d2af0j/hey_were_the_game_kitchen_the_team_behind/) |
| Katana ZERO / 주행·참격·적 공격 | 가감속 px/s²·정지 s 미확인. 조작이 정밀하다는 목표를 즉시 최고속도 도달의 증거로 쓰지 않음 | 적의 예고·플레이어 피격 경직 F·s 미확인. 즉사 중심 설계 설명은 일반적인 피격 복귀 애니메이션 길이를 입증하지 않음 | 미공개 | 공식. [Justin Stander 직접 인터뷰](https://www.gamerevolution.com/originals/520685-katana-zero-interview) |
| Hyper Light Drifter / 이동·타격 | 가감속 px/s²·정지 s 미확인. [사실] 애니메이션을 넣기 전에 이동의 만족감을 다듬었다는 설명 | 피격 경직·개별 적의 예고 F·s 미확인. 공격 홀드를 피격 경직으로 대입하지 않음 | 인터뷰의 관련 수치 미공개 | 공식. [Alex Preston의 이동 제작 설명](https://www.theskinny.co.uk/tech/gaming/alex-preston-on-hyper-light-drifter), [홀드 설명](https://cheerfulghost.com/jdodson/posts/2021/interview-w-alex-preston-creator-of-hyper-light-drifter) |

**[사실]** Hades 공식 기록에는 Nova의 폭발 판정과 시각 효과를 맞춘 수정이 있다. 이는 ‘모션이 보인다’와 ‘판정 시점을 읽을 수 있다’를 구분하는 직접 사례다. 다만 그 기록에서 정확한 지연값은 확인하지 못했다. [공식 패치 노트](https://www.supergiantgames.com/blog/hades-the-high-speed-update-patch-notes/)

**[사실]** GDC는 플레이어에게 반응성이 필요하고, 적에게는 플레이어가 반응할 예비동작이 필요하다고 구분한다. **[추정]** 몬스터의 공격 준비 시간을 플레이어 공격과 같은 비율로 통일하지 말고, 위협 방향·범위·접근 속도까지 읽히는지 검토해야 한다. 특정 게임의 몬스터별 예고 길이는 이 원칙에서 역산할 수 없다. [GDC: A note about anticipation](https://media.gdcvault.com/GDC2014/Presentations/Cartwright_Muriel_Animation_Bootcamp_Fluid.pdf)

## 3D → 픽셀 렌더에서 동작 뭉개짐 방지

### 확인된 제작 방식

| 게임 / 관련 동작 | 확인한 사실 | 단위·기준 fps·미확인 경계 | 출처 등급·URL |
|---|---|---|---|
| Dead Cells / 캐릭터·몬스터·공격 | [사실] 단순한 모델을 저해상도·안티앨리어싱 없이 렌더. 키포즈 타이밍을 우선하며 프레임 이미지·노멀맵을 출력 | 글의 캐릭터 높이 예시는 **50 px**. 전체 캐릭터의 고정 규격을 뜻하지 않음. 공격별 fps 미확인 | 공식. [Thomas Vasseur: What / Result](https://www.gamedeveloper.com/production/art-design-deep-dive-using-a-3d-pipeline-for-2d-animation-in-i-dead-cells-i-) |
| Dead Cells / 픽셀 안정성 | [사실] 저해상도 셀 셰이딩을 사용했지만 당시 픽셀 깜빡임은 해결하지 못했다고 명시 | 정량 오차·해결 후 상태 미확인; fps 해당 없음 | 공식. [같은 글: Result](https://www.gamedeveloper.com/production/art-design-deep-dive-using-a-3d-pipeline-for-2d-animation-in-i-dead-cells-i-) |
| Hades / Zagreus 등 | [사실] 개발 중 모델·애니메이션을 여러 각도에서 렌더하고 게임은 그 이미지를 사용. 개발자 답변은 실시간 모델 렌더가 아니라고 명시 | 방향 수·키포즈 수·홀드 간격·fps 미확인. 이를 픽셀 렌더 파이프라인이라고 확정하지 않음 | 공식. [kid_zomb 개발자 답변](https://steamcommunity.com/app/1145360/discussions/0/1738883810796606862/) |
| Blasphemous / 인게임 동작 | [사실] 개발자 답변은 본 도구를 쓰지 않는 프레임별 픽셀 작화를 설명 | 이 사례는 모델 렌더 방식의 증거가 아님; fps 미확인 | 공식. [개발자 AMA](https://www.reddit.com/r/NintendoSwitch/comments/d2af0j/hey_were_the_game_kitchen_the_team_behind/) |
| Katana ZERO·Hyper Light Drifter / 인게임 동작 | 이번 원문에서 모델→픽셀 렌더 사용을 확인하지 못함. 외형 유사성으로 제작 방식을 단정하지 않음 | 렌더 해상도·샘플링·관련 fps 미확인 | 공식 자료의 확인 범위 밖. [Katana ZERO 인터뷰](https://www.gamerevolution.com/originals/520685-katana-zero-interview), [HLD 인터뷰](https://cheerfulghost.com/jdodson/posts/2021/interview-w-alex-preston-creator-of-hyper-light-drifter) |

### 제작에 옮길 수 있는 가설

다음은 모두 **[추정: 적용안]**이며 조사 대상 게임의 확인된 내부 구현이 아니다. 수치 목표는 실제 게임 카메라에서 결정해야 하므로 임의 프레임 수·필터 강도를 붙이지 않았다.

| 뭉개지는 원인 가설 | 동작 제작·검토 방향 | 근거와 남은 검증 |
|---|---|---|
| 무기·팔·몸통이 같은 덩어리로 겹침 | 준비 포즈와 접점 포즈에서 몸통과 무기의 방향·외곽선을 분리. 축소 화면에서 먼저 판별 | [GDC의 키 실루엣 원칙](https://media.gdcvault.com/GDC2014/Presentations/Cartwright_Muriel_Animation_Bootcamp_Fluid.pdf)을 픽셀 렌더에 적용한 가설. 해당 게임의 정량 기준 아님 |
| 자동 보간 때문에 공격의 강약이 평평해짐 | 키포즈만으로 시간 구조를 먼저 검토하고, 보간·블렌드가 준비/접점의 대비를 지우는지 확인 | [Dead Cells의 pose-to-pose 제작](https://www.gamedeveloper.com/production/art-design-deep-dive-using-a-3d-pipeline-for-2d-animation-in-i-dead-cells-i-)에서 유도. 실시간 리깅 렌더에 그대로 성공한다는 증거는 없음 |
| 빠른 이동 사이에서 무기 궤적이 끊김 | 본체의 명확한 접점 포즈를 남기고 궤적·스미어로 이동 경로를 보조. 잔상으로 본체를 덮는지 따로 검사 | [GDC의 smear / followthrough](https://media.gdcvault.com/GDC2014/Presentations/Cartwright_Muriel_Animation_Bootcamp_Fluid.pdf)에서 유도 |
| 축소·시간 누적·블러가 얇은 형태를 지움 | 픽셀화 이전과 이후의 시간 필터·모션 블러·리샘플링 영향을 각각 분리해 비교할 필요 | [Dead Cells의 저해상도·무 AA 사례](https://www.gamedeveloper.com/production/art-design-deep-dive-using-a-3d-pipeline-for-2d-animation-in-i-dead-cells-i-)를 출발점으로 한 가설. 대상 게임이 특정 시간 필터를 껐다는 주장은 아님 |
| 작은 자세 변화에서 픽셀이 튐 | 실루엣·명암 덩어리의 시간 안정성을 별도 검토. 위치 스냅이나 조명 단순화는 원인 분리 후 비교할 후보 | [Dead Cells가 남긴 flicker 문제](https://www.gamedeveloper.com/production/art-design-deep-dive-using-a-3d-pipeline-for-2d-animation-in-i-dead-cells-i-)에서 유도. 스냅을 공식 해결책으로 소개하지 않음 |
| 접점 포즈·VFX와 실제 판정 시점이 어긋남 | 빈 공격과 명중 공격을 나눠 보고, 판정·접점 포즈·효과의 시간 관계를 먼저 맞출 필요 | [Hades Nova의 공식 수정 사례](https://www.supergiantgames.com/blog/hades-the-high-speed-update-patch-notes/)에서 유도 |

## 여러 사례의 공통점과 차이

- **키포즈와 시간 대비가 중심이다. [사실]** Dead Cells는 포즈와 타이밍을 먼저 만들고, Blasphemous의 검술 보스는 설계된 공격에 맞춰 포즈를 제안했다. GDC도 명확한 키를 강조한다. **[추정]** 공통 원리는 ‘적은 장수’ 자체보다 ‘어떤 자세를 언제 읽게 하는가’다. [Dead Cells](https://www.gamedeveloper.com/production/art-design-deep-dive-using-a-3d-pipeline-for-2d-animation-in-i-dead-cells-i-), [Blasphemous](https://www.reddit.com/r/NintendoSwitch/comments/d2af0j/hey_were_the_game_kitchen_the_team_behind/), [GDC](https://media.gdcvault.com/GDC2014/Presentations/Cartwright_Muriel_Animation_Bootcamp_Fluid.pdf)
- **시간을 고르게 배분하지 않는다. [사실]** Dead Cells의 치명타 정지·슬로모션, HLD의 짧은 공격 홀드, GDC의 키 주변 홀드가 각각 확인된다. **[추정]** 같은 효과·같은 길이의 사용을 뜻하지는 않지만, 무게를 시간 대비로 강조한다는 접점이 있다. 모든 대상 게임이 동일한 히트스톱을 쓴다는 결론은 내리지 않는다. [Dead Cells](https://www.gamedeveloper.com/design/designing-each-of-the-50-weapons-in-i-dead-cells-i-to-feel-distinctive), [HLD](https://cheerfulghost.com/jdodson/posts/2021/interview-w-alex-preston-creator-of-hyper-light-drifter), [GDC](https://media.gdcvault.com/GDC2014/Presentations/Cartwright_Muriel_Animation_Bootcamp_Fluid.pdf)
- **조작과 표현을 함께 조정한다. [사실]** Dead Cells GDC의 이동 보정, Hades의 입력 버퍼·판정과 VFX 수정, HLD의 애니메이션 이전 이동 조정이 확인된다. **[추정]** 포즈만 수정해서 반응성을 판정할 수 없고, 입력 수용·이동·접점의 연결도 확인해야 한다. [Dead Cells GDC](https://media.gdcvault.com/gdc2019/presentations/Benard-Sebastian-DeepCells.pdf), [Hades](https://www.supergiantgames.com/blog/hades-the-high-speed-update-patch-notes/), [HLD](https://www.theskinny.co.uk/tech/gaming/alex-preston-on-hyper-light-drifter)
- **제작 도구는 공통이 아니다. [사실]** Dead Cells·Hades는 모델 기반 사전 렌더를 설명하지만, Blasphemous는 프레임별 작화를 설명한다. **[추정]** 가져올 것은 도구의 외형보다 실루엣·타이밍·판정의 관계다. [Dead Cells](https://www.gamedeveloper.com/production/art-design-deep-dive-using-a-3d-pipeline-for-2d-animation-in-i-dead-cells-i-), [Hades](https://steamcommunity.com/app/1145360/discussions/0/1738883810796606862/), [Blasphemous](https://www.reddit.com/r/NintendoSwitch/comments/d2af0j/hey_were_the_game_kitchen_the_team_behind/)

## 자료 해석에서 제외한 것과 후속 확인 항목

| 자료·오독 위험 | 이번 처리 |
|---|---|
| Dead Cells 제작 글의 **30 fps** 언급 | [사실] 그 문단의 대상은 이전 프로젝트 **ScarKrow**다. Dead Cells 공격 fps로 옮기지 않는다. [원문: Why](https://www.gamedeveloper.com/production/art-design-deep-dive-using-a-3d-pipeline-for-2d-animation-in-i-dead-cells-i-) |
| Dead Cells 인터뷰의 추가 프레임과 시간 증가 예시 | [사실] **1~2프레임 추가 / 0.2 s 증가**가 함께 나오는 구두 예시다. 고정 fps·특정 동작의 프레임 데이터가 아니므로 시간 환산의 기준으로 채택하지 않는다. [원문](https://www.gamedeveloper.com/design/designing-each-of-the-50-weapons-in-i-dead-cells-i-to-feel-distinctive) |
| HLD 자료의 fps 혼용 | [사실] 공식 업데이트가 **30 / 60 fps** 전환을 명시하고 적·오브젝트 타이밍을 손봤다고 설명한다. 서로 다른 버전의 관찰 프레임 수를 그대로 합칠 수 없다. [공식 Steam 발표: The 60 fps Update](https://store.steampowered.com/news/posts/?appids=257850&enddate=1475987536&feed=steam_community_announcements) |
| Hades 주먹 측정 글 | 원본 계수 영상·녹화 fps·버전·강화 조건이 확보되지 않았다. 커뮤니티 보고값으로 남겼고, 내부 타이머의 증거로 쓰지 않았다. [측정 원문](https://www.reddit.com/r/HadesTheGame/comments/1j3ilqg/doing_the_math_on_the_fists/) |
| Blasphemous Esdras의 커뮤니티 분석 | 작성자가 프레임 분석을 설명하지만 수치 도표가 이미지로 제시된다. 이번 텍스트 열람에서 단계별 숫자·fps를 검증하지 못해 수치 표에 전재하지 않았다. 작성자의 거리 추정도 실제 월드 단위로 채택하지 않았다. [분석 원문](https://snoukdesignnotes.blog/2021/06/30/boss-design-ft-blasphemous/) |
| Blasphemous 공개 제작 타임랩스 | 제작 자료의 위치만 확인. 영상·이미지를 가져오거나 타임라인의 장수를 계수하지 않았으므로 수치 근거로 쓰지 않았다. [Acolyte 제작 영상 링크](https://www.youtube.com/watch?v=yS3whb9kNZY), [Hit and sparks 제작 영상 링크](https://www.youtube.com/watch?v=omYbz3_u3B8). 링크 식별 경로: [Game Anim 소개 페이지](https://www.gameanim.com/2021/02/19/blasphemous-pixel-art-animation-time-lapses/) |
| Katana ZERO의 GDC 표기 | [사실] 발견한 자료는 **GDC 2016 현장 Gamereactor 인터뷰**이며 GDC 기술 강연으로 분류하지 않는다. 설명·메타데이터만 확인했으므로 공격 프레임 근거로 채택하지 않는다. [인터뷰 페이지](https://www.youtube.com/watch?v=p8qjDjxr5QE) |
| HLD의 GDC 발표 | 레벨 디자인 발표의 텍스트를 확인했다. 공간으로 전투 페이싱을 조정하는 자료이며 공격 프레임 자료로 바꾸어 쓰지 않았다. [Lisa Brown 발표](https://media.gdcvault.com/gdc2017/Presentations/Brown_Lisa_Applying_3D_Level.pdf) |
| Hades 제작 다큐멘터리 | Noclip의 제작 현장 자료이며 GDC 강연이 아니다. 공개 소개만 확인했고 영상 본문을 분석한 것처럼 수치를 적지 않았다. [제작자 소개 페이지](https://www.noclip.video/hades) |

**[추정: 후속 조사 명세]** 미확인 값을 채우려면 공개된 측정자의 텍스트 기록에 게임 버전·플랫폼·무기·강화·공속 조건, 입력/시각/판정의 계수 경계, 녹화 fps와 게임 시간 기준, 명중·허공·캔슬 조건이 함께 있어야 한다. 이동 가감속은 카메라 스크롤이 섞인 화면 변위만으로 확정하지 말고, 고정 배경 기준과 픽셀 단위를 밝혀야 한다. 몬스터는 예고 시작·최초 활성·추적 종료·회복·다음 행동을 각각 구분해야 한다. 이번 작업에서는 그 추가 실측을 수행하지 않았다.

최종 범위: 문헌 조사 문서 작성까지. 대상 게임의 실제 프레임 재측정, 프로젝트 적용·실행·화면 검증, 커밋·push는 수행하지 않았다. 지정 파일 외 변경은 하지 않는다.
