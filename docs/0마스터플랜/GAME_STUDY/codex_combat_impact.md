# 핵앤슬래시 타격감 수치 카탈로그

조사일: 2026-11-05 KST. 대상: Phantom Blade Zero, Hades, Dead Cells, Diablo IV, Path of Exile 2. 산출물은 공개 자료를 요약한 이 연구 문서 한 파일이다. 게임 실행·게임 파일 분석·영상 다운로드·이미지 및 에셋 저장은 수행하지 않았다.

## 1. 증거 등급과 읽는 법

- **[사실]**: 개발자 본인 인터뷰 답변, 개발사 공식 글·패치 노트에 명시된 내용이다. 과거 개발 설명은 해당 발표 시점의 사실로만 취급한다.
- **[추정]**: 조건을 가정한 단위 환산, 영상으로부터 얻는 간접 측정, 여러 자료를 종합한 연구자 해석이다. 개발사의 내부 설정값으로 취급하지 않는다.
- **미확인**: 이번에 검토한 자료에서 해당 수치나 조건을 확인하지 못했다는 조사 상태다. 기능 부재·0ms·0프레임·미공개 확정을 뜻하지 않는다. 표의 출처는 검토 범위를 가리키며, 수치를 제공한다는 뜻이 아니다.
- 원문 직접 인용은 아래 Dead Cells의 7단어 한 구절뿐이며, 나머지는 한국어 요약이다. 수치가 없는 칸을 장르의 통상값으로 채우지 않는다.

**[사실] 정량 근거의 핵심은 Dead Cells의 ‘치명타 1프레임 정지’라는 개발자 설명이다. [추정] 이를 60fps 시간축으로 환산하면 약 16.7ms지만, 인터뷰는 그 프레임의 시간 기준을 명시하지 않으므로 실제 출시판의 고정 ms로 확정할 수 없다.** [Motion Twin 인터뷰, 2017-06-08](https://80.lv/articles/interview-with-the-developers-of-dead-cells)

**[사실·조사결과] 나머지 네 게임에서는 검토한 텍스트로부터 타격별 히트스톱 ms, 카메라 임펄스 진폭·감쇠, 넉백 거리·속도, 섬광 지속 프레임, 동시 사운드 레이어 수를 확정하지 못했다.** 아래 게임별 표에 확인된 구조와 미확인 수치를 함께 기록했다. [Phantom Blade Zero 개발자 글](https://blog.playstation.com/2023/05/24/phantom-blade-zero-a-new-beginning-in-a-long-journey/), [Hades 개발자 인터뷰](https://news.denfaminicogamer.jp/interview/210930m), [Diablo IV VFX 공식 글](https://news.blizzard.com/en-us/article/23746639/diablo-iv-quarterly-updatedecember-2021), [PoE2 관련 개발자 Q&A](https://www.pathofexile.com/forum/view-thread/3317905)

## 2. 측정 항목의 구분

다음은 이 문서의 기록 규약이다. **[추정·연구 규약]**으로 사용하며, 특정 게임의 구현을 단정하지 않는다. 히트스톱·슬로모션·카메라 효과·카메라 제어·색상 섬광을 별도 요소로 나누는 근거는 공개 연구의 분류다. [Lin 외, 2022, 타격 피드백 연구](https://arxiv.org/abs/2208.06155)

| 항목 | 기록할 단위·조건 | 혼동하지 않을 것 | 근거 URL |
|---|---|---|---|
| 히트스톱 | 정지 프레임 수와 ms, 공격자·피격자·배경 중 멈추는 범위, 일반타·치명타·막기 구분 | 선딜의 포즈 유지, 피격 경직, 뒤따르는 감속을 정지 시간에 합산하지 않는다. | [분류 연구](https://arxiv.org/abs/2208.06155), [Dead Cells 개발자 사례](https://80.lv/articles/interview-with-the-developers-of-dead-cells) |
| 카메라 임펄스 | 화면 변위 px 또는 화면 폭 대비 %, 방향, 지속 ms, 회전·줌 분리 | 추종·구도 전환과 순간 충격을 분리한다. 영상의 화면 변위를 엔진의 월드 좌표 진폭으로 바꾸지 않는다. | [분류 연구](https://arxiv.org/abs/2208.06155), [Hades 카메라 설명](https://news.denfaminicogamer.jp/interview/210930m) |
| 넉백 | 카메라 이동 보정 뒤의 화면 변위, 이동 시간, 대상·장애물·스킬 조건 | 살아 있는 적의 강제 이동, 피격 애니메이션, 사망 래그돌을 별도 기록한다. | [Hades 넉백 패치](https://www.supergiantgames.com/blog/hades-big-bad-update-patch-notes/), [Diablo IV 방향성 래그돌](https://news.blizzard.com/en-us/article/23746639/diablo-iv-quarterly-updatedecember-2021) |
| 섬광 | 캐릭터 표면·접점·전체 화면 중 대상, 시작·종료 프레임, 영상 fps | 치명타 HUD 표시, 불꽃 입자, 블룸, 패링 예고를 피격 섬광과 동일시하지 않는다. | [분류 연구](https://arxiv.org/abs/2208.06155), [Dead Cells HUD 피드백 패치](https://deadcells.com/patchnotes/29) |
| 사운드 레이어 | 스윙·접촉·피격·사망 등 확인된 역할, 원음 재료, 재생 시점, 동시 중첩 수의 근거 | 제작에 사용한 원음 개수, 순차 재생 단계, 런타임 보이스 수는 동시 레이어 수와 구분한다. | [Diablo IV 사운드 공식 글](https://news.blizzard.com/en-gb/article/23731236/diablo-iv-quarterly-updateoctober-2021), [GGG 오디오 Q&A](https://store.steampowered.com/news/posts/?appgroupname=Path+of+Exile&appids=238960&enddate=1666644697&feed=steam_community_announcements) |

## 3. 게임별 카탈로그

### 3.1 Phantom Blade Zero

**[사실] 조사 근거는 S-Game 창립자 Soulframe Liang의 개발자 글과 직접 인터뷰다.** 2023년 설명은 고속 무술 동작의 제작 방향에 관한 것이며, 최종 타격 파라미터를 제공하는 문서는 아니다. [개발자 글, 2023-05-24](https://blog.playstation.com/2023/05/24/phantom-blade-zero-a-new-beginning-in-a-long-journey/)

| 항목 | 수치 카탈로그 | [사실] 확인된 내용 / 미확인 경계 | 출처 URL |
|---|---|---|---|
| 히트스톱 ms | **미확인** | 개발자는 빠른 콤보 중심 전투를 설명하지만, 일반 명중·치명타·패링별 정지 시간이나 멈추는 대상을 명시하지 않는다. 빠른 동작이라는 설명만으로 정지 시간을 역산할 수 없다. | [S-Game 개발자 글](https://blog.playstation.com/2023/05/24/phantom-blade-zero-a-new-beginning-in-a-long-journey/) |
| 카메라 임펄스 | 진폭·주파수·감쇠·지속 **미확인** | Liang은 공개 영상의 카메라 각도를 조정했다고 설명한다. **[추정]** 따라서 트레일러의 구도 변화를 실제 플레이 중 매 명중의 임펄스로 계수해서는 안 된다. | [GamesBeat 직접 인터뷰, 2024-06-19](https://gamesbeat.com/how-phantom-blade-zero-is-an-accessible-soulslike-game-soulframe-liang-interview/) |
| 넉백 | 거리·속도·지속 **미확인** | 개발자 인터뷰의 패링·회피·방어 설명만으로 대상별 넉백 거리를 확인하지 못했다. 경직과 공간 이동을 분리해 측정할 필요가 있다. | [GamesBeat 직접 인터뷰](https://gamesbeat.com/how-phantom-blade-zero-is-an-accessible-soulslike-game-soulframe-liang-interview/) |
| 섬광 프레임 | **미확인** | 개발자 글에서 명중 섬광의 프레임 수·밝기·표면 범위를 확인하지 못했다. 공개 영상의 불꽃을 그대로 섬광 프레임으로 세지 않았다. | [S-Game 개발자 글](https://blog.playstation.com/2023/05/24/phantom-blade-zero-a-new-beginning-in-a-long-journey/) |
| 사운드 레이어 | 동시 레이어 수·각 레이어 dB·지연 ms **미확인** | Liang은 유사 실물 무기를 녹음하고, 환상 무기는 복잡한 폴리로 만든다고 설명한다. Soft Snake Sword는 스윙뿐 아니라 종이·고기를 베는 소리도 녹음했다. 이는 원음 재료의 증거이며, 매 타격에 모두 동시에 재생한다는 증거는 아니다. | [Inverse 직접 인터뷰, 2025-08-11](https://www.inverse.com/gaming/phantom-blade-zero-soulframe-liang-director-interview) |

### 3.2 Hades

**[사실] Greg Kasavin은 명중 시 히트포즈와 플레이어를 따르는 미묘한 카메라 움직임을 다듬는 데 많은 개발 시간을 썼다고 설명한다.** 인터뷰가 다루는 것은 첫 번째 Hades다. [개발자 이메일 인터뷰, 2021-09-30, 첫 절](https://news.denfaminicogamer.jp/interview/210930m)

| 항목 | 수치 카탈로그 | [사실] 확인된 내용 / 미확인 경계 | 출처 URL |
|---|---|---|---|
| 히트스톱 ms | 존재 설명 확인, 시간 **미확인** | Kasavin이 명중 히트포즈를 직접 언급한다. 무기·일반타·치명타별 프레임 수와 시간 배율은 제시하지 않는다. | [Kasavin 인터뷰](https://news.denfaminicogamer.jp/interview/210930m) |
| 카메라 임펄스 | 타격 임펄스의 진폭·지속·감쇠 **미확인** | 플레이어 추종 카메라를 조정해 속도감을 높였다는 설명은 확인된다. 이 발언을 명중 시 흔들림의 진폭이나 주파수로 읽을 수는 없다. | [Kasavin 인터뷰](https://news.denfaminicogamer.jp/interview/210930m) |
| 넉백 | 거리·속도·지속 **미확인** | 2019-08-13 Patch 027은 방패 기본타의 밀어내기를 복구하고, Poseidon 효과 강도가 높은 희귀도에 따라 더 커지지 않도록 재조정했다고 명시한다. 이 패치의 과거 상태를 전체 출시판 수치로 일반화하지 않는다. | [공식 Big Bad 패치 노트, Patch 027](https://www.supergiantgames.com/blog/hades-big-bad-update-patch-notes/) |
| 섬광 프레임 | **미확인** | 위 개발자 인터뷰와 검토한 공식 패치에서 명중 섬광의 지속 프레임을 확인하지 못했다. 히트포즈가 있다는 발언은 섬광 길이의 증거가 아니다. | [Kasavin 인터뷰](https://news.denfaminicogamer.jp/interview/210930m), [공식 패치 노트](https://www.supergiantgames.com/blog/hades-big-bad-update-patch-notes/) |
| 사운드 레이어 | 동시 레이어 수·대역·dB·지연 ms **미확인** | Darren Korb는 입력·상황 인지와 검으로 해골을 때리는 만족감을 효과음의 역할로 설명한다. 인터뷰 프로그램의 설명은 라이브러리 원음을 겹치고 가공한다고 밝히지만, 개별 무기의 트랙 구성표는 제공하지 않는다. | [Gameplay, The Sound of Hades, 공개 인터뷰·전사문](https://gameplay.co/hades-game-music-sound-design-darren-korb-supergiant-games/) |

### 3.3 Dead Cells

**[사실] Motion Twin의 Steve Filby 인터뷰는 치명타 피드백을 정지 → 감속 → 혈흔·별도 충격음의 조합으로 설명한다.** 짧은 원문 확인 구절: “freeze the game for 1 frame”. [80.lv 직접 인터뷰, 2017-06-08, Feedback 절](https://80.lv/articles/interview-with-the-developers-of-dead-cells)

| 항목 | 수치 카탈로그 | [사실] 확인된 내용 / [추정] 환산·미확인 경계 | 출처 URL |
|---|---|---|---|
| 히트스톱 ms | **[사실] 치명타 1프레임. [추정] 60fps 가정 시 약 16.7ms** | 개발자는 게임을 멈춘다고 설명한다. ms 환산은 `1000 × 1 / 60`이며 영상 실측이 아니다. 인터뷰 시점의 프레임 시간 기준과 현재 버전의 유지 여부는 미확인이다. 일반타에도 같은 값이 적용된다고 확장하지 않는다. | [Motion Twin 인터뷰](https://80.lv/articles/interview-with-the-developers-of-dead-cells) |
| 정지 뒤 감속 | 정확한 ms·time scale **미확인** | 개발자는 뒤따르는 감속의 길이를 대략적으로만 설명하며, 정확한 지속 시간과 시간 배율은 제시하지 않는다. 이를 임의의 최소·최대 ms 구간으로 수치화하지 않는다. 감속은 위 1프레임 정지와 별도다. | [Motion Twin 인터뷰](https://80.lv/articles/interview-with-the-developers-of-dead-cells) |
| 카메라 임펄스 | 진폭·주파수·감쇠·지속 **미확인** | Update 27.1은 Machete & Pistol, Queen's Rapier, Hard Light Sword에 화면 흔들림을 추가하고, 흔들림을 끄면 screen-bump도 꺼진다고 명시한다. 수치나 파형은 없다. | [공식 Update 27.1, 2022-02-09](https://deadcells.com/patchnotes/27) |
| 넉백 | 거리·속도·지속 **미확인** | 공식 글은 Hand Hook의 뒤로 던지기와 Gilded Yumi가 적을 운반하는 동작을 설명한다. 대상의 이동은 확인되지만 공통 넉백 거리나 힘은 제공하지 않는다. | [공식 Update 27](https://deadcells.com/patchnotes/27) |
| 섬광 프레임 | **미확인** | 2017년 인터뷰는 정지·감속·혈흔·충격음을 설명한다. Update 29의 치명타 HUD 피드백 옵션 역시 캐릭터 피격 섬광의 프레임 수를 증명하지 않는다. | [Motion Twin 인터뷰](https://80.lv/articles/interview-with-the-developers-of-dead-cells), [공식 Update 29](https://deadcells.com/patchnotes/29) |
| 사운드 레이어 | 별도 치명타 충격음 확인, 동시 레이어 수·dB·지연 **미확인** | 2017년 인터뷰는 치명타 전용 충격음을 언급한다. Update 29는 효과음 범주별 조정과 동시 소리를 제한하는 우선순위 시스템을 설명하지만, 개별 명중의 레이어 개수는 제시하지 않는다. | [Motion Twin 인터뷰](https://80.lv/articles/interview-with-the-developers-of-dead-cells), [공식 Update 29](https://deadcells.com/patchnotes/29) |

**[사실] 별도의 2017년 무기 제작 인터뷰에는 동작·효과의 유지 시간을 0.2초 늘리는 예시가 있다. [추정] 이는 200ms의 명중 히트스톱을 뜻한다고 판정할 수 없다.** 선딜·애니메이션 리타이밍 문맥이며, 앞의 치명타 1프레임 설명과 서로 다른 항목이다. [Game Developer, 2017-07-07, 무기의 무게감과 애니메이션 조정 문단](https://www.gamedeveloper.com/design/designing-each-of-the-50-weapons-in-i-dead-cells-i-to-feel-distinctive)

### 3.4 Diablo IV

**[사실] Blizzard는 피해 판정 영역을 여러 프레임에 걸쳐 애니메이션과 맞추고, 명중 위치·공격 방향에 따라 혈흔과 래그돌 힘을 적용한다고 설명한다.** 이 글의 ‘프레임 단위 정밀도’는 히트스톱 길이를 공개했다는 뜻이 아니다. [공식 Quarterly Update, 2021-12, Combat Improvements 절](https://news.blizzard.com/en-us/article/23746639/diablo-iv-quarterly-updatedecember-2021)

| 항목 | 수치 카탈로그 | [사실] 확인된 내용 / 미확인 경계 | 출처 URL |
|---|---|---|---|
| 히트스톱 ms | **미확인** | 여러 프레임에 걸쳐 움직이는 피해 영역과 VFX를 맞춘다는 설명은 있다. 이를 ‘정지 없음’ 또는 특정 ms의 정지로 해석하지 않는다. | [Blizzard VFX 개발 글](https://news.blizzard.com/en-us/article/23746639/diablo-iv-quarterly-updatedecember-2021) |
| 카메라 임펄스 | 진폭·주파수·감쇠·지속 **미확인** | 검토한 VFX 글은 스킬 강도에 따른 시각적 위계와 가독성을 설명하지만, 명중 카메라의 파라미터는 제공하지 않는다. | [Blizzard VFX 개발 글](https://news.blizzard.com/en-us/article/23746639/diablo-iv-quarterly-updatedecember-2021) |
| 넉백 | 살아 있는 대상의 거리·속도·시간 **미확인** | 방향성 물리 힘을 래그돌에 가하는 설명은 확인된다. 무릎을 맞히면 해당 접점에 혈흔·힘을 적용하는 사례다. 사망 연출의 날아가는 거리를 생존 대상의 넉백 수치로 대체하지 않는다. | [Blizzard, Combat Improvements 절](https://news.blizzard.com/en-us/article/23746639/diablo-iv-quarterly-updatedecember-2021) |
| 섬광 프레임 | **미확인** | VFX의 조명·강도 설명에서 명중 섬광의 유지 프레임을 확인하지 못했다. 스킬이 빛을 방출한다는 설명을 피격 표면의 섬광 길이로 읽지 않는다. | [Blizzard, Casting and Receiving Light 절](https://news.blizzard.com/en-us/article/23746639/diablo-iv-quarterly-updatedecember-2021) |
| 사운드 레이어 | 역할 구성 확인, 동시 레이어 수·dB·지연 **미확인** | Firebolt는 시전·충돌 원샷과 비행 루프로 구성된다. Inferno에는 시전·루프·조임 소리 외 뱀 방울과 어두운 영적 끝소리를 더한다. **[추정]** 이를 Firebolt의 시간상 3역할로 정리할 수 있지만, ‘매 명중 3레이어 동시 재생’이라는 뜻은 아니다. | [공식 Quarterly Update, 2021-10, Sorcerer Skills 절](https://news.blizzard.com/en-gb/article/23731236/diablo-iv-quarterly-updateoctober-2021) |

**[사실] 같은 사운드 글은 실시간 재생에 미세한 무작위 변화를 넣는다고 설명한다. [추정] 따라서 특정 한 번의 소리만으로 반복 변형 범위나 전체 타격의 레이어 규칙을 확정할 수 없다.** [Blizzard, The Devil is in the details 절](https://news.blizzard.com/en-gb/article/23731236/diablo-iv-quarterly-updateoctober-2021)

### 3.5 Path of Exile 2

**[사실] GGG의 2022년 Q&A에서 Kane은 PoE2용 on-hit 오디오를 처음부터 다시 만들고, 더 복잡한 실시간 믹싱 시스템을 개발한다고 설명한다.** 이는 당시 개발 방향의 발표이며, 현재 버전의 레이어 수·지연을 증명하는 측정표는 아니다. [GGG 공식 Q&A Part 1, 2022-10-11](https://www.pathofexile.com/forum/view-thread/3317905)

| 항목 | 수치 카탈로그 | [사실] 확인된 내용 / 미확인 경계 | 출처 URL |
|---|---|---|---|
| 히트스톱 ms | **미확인** | 검토한 공식 0.2.0 문서로 타격별 정지 시간을 확인하지 못했다. 문서에 나오는 스턴·동결·공격 시간 수치를 히트스톱에 넣지 않았다. | [GGG 공식 Content Update 0.2.0](https://www.pathofexile.com/forum/view-thread/3740562) |
| 카메라 임펄스 | 진폭·주파수·감쇠·지속 **미확인** | 같은 패치 문서에서 타격 카메라의 정량 파라미터를 확인하지 못했다. 공식 발표 영상도 아래의 프레임별 실측 증거로 사용하지 않았다. | [GGG 공식 0.2.0](https://www.pathofexile.com/forum/view-thread/3740562) |
| 넉백 | 거리·속도·지속 **미확인** | 0.2.0은 Wind Dancer의 Gale Force 넉백 거리를 줄였다고 명시한다. 감소 전후의 m·%는 제시하지 않는다. Tempest Bell의 Shockwave와 넉백 스케일링 관련 버그 수정도 명시한다. | [GGG 공식 0.2.0, Skill Changes·Bug Fixes](https://www.pathofexile.com/forum/view-thread/3740562) |
| 섬광 프레임 | **미확인** | 검토한 공식 패치에서 일반타·치명타·Heavy Stun별 피격 섬광 길이를 확인하지 못했다. 속성 효과나 스턴 지속 시간을 섬광 프레임으로 바꾸지 않았다. | [GGG 공식 0.2.0](https://www.pathofexile.com/forum/view-thread/3740562) |
| 사운드 레이어 | on-hit 재설계·동적 믹싱 방향 확인, 동시 레이어 수·dB·지연 **미확인** | Part 1은 on-hit 재구축을, Part 2는 PoE2의 복잡한 FMOD 믹싱을 설명한다. 개별 근접타를 스윙·접촉·저역·피격음 몇 개로 조합하는지까지는 확인되지 않는다. | [GGG 공식 Q&A Part 1](https://www.pathofexile.com/forum/view-thread/3317905), [GGG 공식 Steam 게시 Q&A Part 2, 2022-10-17](https://store.steampowered.com/news/posts/?appgroupname=Path+of+Exile&appids=238960&enddate=1666644697&feed=steam_community_announcements) |

**[사실] GGG 공식 채널에는 Kane Bennett와 Kamil Orman-Janowski의 ExileCon 2023 사운드 발표가 공개돼 있다.** 이번 조사에서는 공개 영상 제목·설명과 발표자만 확인했으며, 전체 발표를 청취하거나 프레임별 분석하지 않았다. 영상 URL을 열었을 때 본문 취득도 실패했으므로, 그 안에만 있을 수 있는 세부 레이어 수나 타임코드는 전사·검증하지 못한 상태다. [공식 발표, 업로드 2023-10-25](https://www.youtube.com/watch?v=zflIzQYLFA0)

**[사실·자료 범위 주의] 2022년 Q&A Part 2의 32·64·128 동시 사운드 채널 설명은 당시 PoE1 문맥에 있다. PoE2에 관해 명시한 것은 더 복잡한 믹싱이다. [추정] 그 채널 수를 PoE2의 ‘타격당 레이어 수’로 옮기는 것은 근거가 부족하다.** [GGG Q&A Part 2](https://store.steampowered.com/news/posts/?appgroupname=Path+of+Exile&appids=238960&enddate=1666644697&feed=steam_community_announcements)

## 4. 공통점 — 확인 범위와 해석을 분리

| 공통 항목 | [사실] 자료에서 확인한 범위 | [추정] 비교 연구에 사용할 해석 | 출처 URL |
|---|---|---|---|
| 순간 정지의 존재 | Hades 개발자는 명중 히트포즈를, Dead Cells 개발자는 치명타 1프레임 정지를 명시한다. | 이 두 사례는 접점에서 시간 흐름을 강조하는 비교군이다. 다섯 게임이 모두 동일한 히트스톱을 쓴다는 결론은 낼 수 없다. | [Hades 인터뷰](https://news.denfaminicogamer.jp/interview/210930m), [Dead Cells 인터뷰](https://80.lv/articles/interview-with-the-developers-of-dead-cells) |
| 충격음의 역할 | PBZ는 실물 무기·절단 폴리, Hades는 입력·명중 피드백, Dead Cells는 치명타 충격음, Diablo IV는 스킬 단계별 소리, PoE2는 on-hit 재설계를 각각 설명한다. | 공통 비교 단위는 ‘저역 몇 dB’보다 어떤 이벤트와 재질을 알리는 소리인지다. 모든 게임에 동일한 레이어 개수를 부여할 근거는 없다. | [PBZ 인터뷰](https://www.inverse.com/gaming/phantom-blade-zero-soulframe-liang-director-interview), [Hades 오디오 인터뷰](https://gameplay.co/hades-game-music-sound-design-darren-korb-supergiant-games/), [Dead Cells 인터뷰](https://80.lv/articles/interview-with-the-developers-of-dead-cells), [Diablo IV 공식 글](https://news.blizzard.com/en-gb/article/23731236/diablo-iv-quarterly-updateoctober-2021), [GGG Q&A](https://www.pathofexile.com/forum/view-thread/3317905) |
| 전투 사건에 맞춘 조정 | Dead Cells는 치명타 피드백 묶음을, Diablo IV는 피해 판정·접점·방향성 효과의 정렬을 설명한다. | 정지·이동·빛·소리를 독립 강도로만 비교하기보다 같은 접점 기준의 발생 순서를 기록하는 편이 근거를 보존한다. | [Dead Cells 인터뷰](https://80.lv/articles/interview-with-the-developers-of-dead-cells), [Diablo IV Combat Improvements](https://news.blizzard.com/en-us/article/23746639/diablo-iv-quarterly-updatedecember-2021) |
| 카메라의 서로 다른 역할 | Hades는 추종 조정, PBZ는 공개 영상 각도 조정, Dead Cells는 무기별 화면 흔들림 추가를 각각 설명한다. | 세 설명을 한 종류의 카메라 임펄스로 합치지 않는다. 추종·연출 각도·충격 흔들림을 분리해야 비교할 수 있다. | [Hades 인터뷰](https://news.denfaminicogamer.jp/interview/210930m), [PBZ 인터뷰](https://gamesbeat.com/how-phantom-blade-zero-is-an-accessible-soulslike-game-soulframe-liang-interview/), [Dead Cells 공식 패치](https://deadcells.com/patchnotes/27) |
| 넉백의 조건 의존 | Hades는 방패·Poseidon 밀어내기를 재조정했고, PoE2는 Gale Force의 넉백 거리를 줄였다. | 스킬·대상·버전이 없는 ‘게임 전체 넉백 거리’는 비교 단위로 부적절하다. 보스·일반 적·벽 근처를 나눠야 한다. | [Hades 공식 패치](https://www.supergiantgames.com/blog/hades-big-bad-update-patch-notes/), [PoE2 공식 0.2.0](https://www.pathofexile.com/forum/view-thread/3740562) |
| 과밀한 피드백의 조절 | Diablo IV는 강한 스킬에 시각적 강조를 배분한다고 설명한다. Dead Cells는 효과음 우선순위 설정을 제공하고, GGG는 반복 시 과도한 소리가 피로해질 수 있다고 설명한다. | 요소를 전부 최대로 키우는 방식보다 사건별 우선순위를 조사해야 한다. 이 자료만으로 공통 최적 ms·진폭·레이어 수를 정할 수는 없다. | [Diablo IV VFX 철학](https://news.blizzard.com/en-us/article/23746639/diablo-iv-quarterly-updatedecember-2021), [Dead Cells Update 29](https://deadcells.com/patchnotes/29), [GGG Q&A Part 1](https://www.pathofexile.com/forum/view-thread/3317905) |

## 5. 간접 수치의 측정 방법과 한계

### 5.1 이번에 계산한 값

**[추정·조건부 산술]** 아래는 개발자가 말한 Dead Cells의 1프레임을 서로 다른 fps 시간축에 놓아 보는 환산표다. 특정 영상의 fps를 확인하거나 게임을 실측한 결과가 아니다. `정지 ms = 정지 프레임 수 × 1000 / fps`로 계산한다. fps 가정이 바뀌면 결과도 바뀐다. 원자료는 1프레임만 보장한다. [원자료: Motion Twin 인터뷰](https://80.lv/articles/interview-with-the-developers-of-dead-cells)

| 가정한 시간축 | 1프레임 환산 | 증거 등급 | 출처 URL |
|---|---:|---|---|
| 30fps | 약 33.3ms | [추정] 산술 예시, Dead Cells 적용 여부 미확인 | [1프레임 원자료](https://80.lv/articles/interview-with-the-developers-of-dead-cells) |
| 60fps | 약 16.7ms | [추정] 산술 예시, Dead Cells 적용 여부 미확인 | [1프레임 원자료](https://80.lv/articles/interview-with-the-developers-of-dead-cells) |
| 120fps | 약 8.3ms | [추정] 산술 예시, Dead Cells 적용 여부 미확인 | [1프레임 원자료](https://80.lv/articles/interview-with-the-developers-of-dead-cells) |

### 5.2 후속 영상 분석을 위한 기록 규약 — 이번 조사에서는 미실행

다음 절차는 **[추정·측정 설계]**다. 아래 조건을 갖춘 실제 관찰이 생길 때만 게임별 표의 ‘미확인’을 교체한다. 이 문서에는 프레임별 실측을 마친 영상 표본이 없으므로, 측정한 것처럼 타임코드나 프레임 수를 기입하지 않았다.

1. **표본 식별:** 원본 공개 URL, 게시자, 공개일, 빌드·패치 또는 ‘버전 불명’, 무기·공격·대상·명중 종류, 시작·종료 타임코드, 영상 해상도·실제 fps·재생 속도를 기록한다. 제목의 ‘60FPS’만으로 시간축을 확정하지 않는다. 가능하면 프레임의 PTS 간격을 확인한다. **[사실]** 공개 웹 명세에서 `mediaTime`은 프레임의 미디어 시각을 초로 제공하며, `presentedFrames`는 누락 판단에 사용할 수 있다. [WICG 공개 명세, §2.2](https://wicg.github.io/video-rvfc/)
2. **히트스톱:** 명중 접점을 기준으로 공격자·피격자의 포즈와 배경을 따로 본다. 정지 시작부터 움직임 재개 직전까지의 프레임 구간 또는 PTS 차이를 기록하고 ms로 환산한다. 정지와 느려진 동작을 분리한다. 배경까지 같은 화면이 반복되면 재생 중복·성능 저하 가능성도 남긴다. 이 판별이 안 되면 원인을 히트스톱으로 확정하지 않는다. [정지·감속을 구분하는 개발자 사례](https://80.lv/articles/interview-with-the-developers-of-dead-cells), [프레임 시각·누락 명세](https://wicg.github.io/video-rvfc/)
3. **카메라 임펄스:** 고정 배경 기준점들의 공통 변위를 이용해 화면 이동을 추적하고, 평상시 추종 성분과 충격성 잔차를 분리한다. 잔차의 최대 변위를 px와 `100 × 변위 / 영상 폭`으로 보고한다. 줌·회전·장면 전환·시차를 분리하지 못하면 임펄스 진폭은 미확인으로 둔다. 영상만으로 월드 좌표 진폭·엔진 노이즈 주파수·감쇠 상수를 확정하지 않는다. [추종과 타격을 구분할 근거: Hades 인터뷰](https://news.denfaminicogamer.jp/interview/210930m), [영상 각도 조정 사례: PBZ 인터뷰](https://gamesbeat.com/how-phantom-blade-zero-is-an-accessible-soulslike-game-soulframe-liang-interview/)
4. **넉백:** 접촉 전후 대상의 지면 기준점을 추적하고 카메라 이동을 보정한다. 화면 px·이동 시간과 함께, 필요하면 같은 깊이에서의 대상 몸통 폭 대비 이동량을 보조 비율로 기록한다. 이 비율도 투영에 의존하는 추정이다. 월드 단위의 교정 기준이 없으면 m·m/s로 바꾸지 않는다. 사망 래그돌과 살아 있는 적의 이동을 합치지 않는다. [방향성 래그돌 사례](https://news.blizzard.com/en-us/article/23746639/diablo-iv-quarterly-updatedecember-2021), [스킬별 넉백 변경 사례](https://www.pathofexile.com/forum/view-thread/3740562)
5. **섬광:** 대상 표면·접점·전체 화면을 별도로 표시하고, 밝기 변화가 시작한 프레임부터 사라진 프레임 직전까지 센다. 블룸·불꽃·가림과 분리되지 않으면 ‘밝은 효과 지속’만 추정하고 ‘피격 섬광 프레임’은 미확인으로 둔다. HUD 치명타 표시는 별도 항목이다. [섬광·명중 효과 분류](https://arxiv.org/abs/2208.06155), [HUD 치명타 표시 사례](https://deadcells.com/patchnotes/29)
6. **사운드:** 공개 인터뷰의 제작 설명을 우선 사용한다. 영상에서 들리는 스윙·접촉·피격·잔향은 ‘청감상 역할’로만 적고, 동시 레이어 수나 실제 런타임 보이스 수로 확정하지 않는다. 지연을 잴 경우 화면 접점과 청감상 충격 시작의 차이를 ms로 기록하되 스트림의 영상·음성 동기 오차를 미확인 조건으로 남긴다. [시간상 역할을 나누는 Diablo IV 공식 설명](https://news.blizzard.com/en-gb/article/23731236/diablo-iv-quarterly-updateoctober-2021), [레이어 가공을 설명하는 Hades 인터뷰 프로그램](https://gameplay.co/hades-game-music-sound-design-darren-korb-supergiant-games/)

**[추정·오차 기록 규약]** 프레임 경계 판정이 시작·종료에서 각각 1프레임 불확실하다면 길이 오차의 보수적 상한은 ±2프레임으로 기록한다. 60fps 가정이면 약 ±33.3ms다. 이는 이번 측정에서 확인한 오차가 아니라 후속 분석에 사용할 산술적 오차 규약이다. 재인코딩·누락·가변 fps·편집·속도 변경이 있으면 이보다 큰 불확실성이 남으므로 PTS와 영상 조건을 함께 기록한다. [프레임 PTS와 누락 판별의 근거](https://wicg.github.io/video-rvfc/)

## 6. 채택하지 않은 수치와 남은 공백

| 항목 | 조사 판정 | 근거 URL |
|---|---|---|
| Dead Cells 200ms 히트스톱 | **[추정·기각]** 0.2초 연장 예시는 애니메이션 조정 문맥이다. 히트스톱 수치로 전환하지 않는다. | [2017 무기 제작 인터뷰](https://www.gamedeveloper.com/design/designing-each-of-the-50-weapons-in-i-dead-cells-i-to-feel-distinctive) |
| Dead Cells 17ms 고정값 | **[추정·조건부만 허용]** 1프레임은 직접 발언이지만 17ms는 60fps 가정의 반올림이다. 최신 버전·전체 공격 공통값으로 채택하지 않는다. | [2017 개발자 인터뷰](https://80.lv/articles/interview-with-the-developers-of-dead-cells) |
| Diablo IV의 피해 판정 프레임 = 정지 프레임 | **[추정·기각]** 움직이는 피해 영역과 정지 시간은 다른 항목이다. | [2021 VFX 공식 글](https://news.blizzard.com/en-us/article/23746639/diablo-iv-quarterly-updatedecember-2021) |
| PoE2 넉백 거리 감소 = 특정 % 감소 | **미확인.** 공식 0.2.0은 감소 사실만 쓰고 수치를 제시하지 않는다. | [GGG 공식 패치](https://www.pathofexile.com/forum/view-thread/3740562) |
| PoE2 32·64·128 타격 레이어 | **[추정·기각]** 과거 PoE1의 동시 사운드 채널 설명을 다른 게임의 개별 타격 레이어로 전용할 수 없다. | [GGG Q&A Part 2](https://store.steampowered.com/news/posts/?appgroupname=Path+of+Exile&appids=238960&enddate=1666644697&feed=steam_community_announcements) |
| 다섯 게임의 공통 최적 히트스톱·임펄스·넉백·섬광·레이어 수 | **미확인.** 직접 확인한 사례와 수치만으로 공통 최적값이나 권장 프리셋을 도출하지 않았다. | [Hades 개발자 인터뷰](https://news.denfaminicogamer.jp/interview/210930m), [Dead Cells 개발자 인터뷰](https://80.lv/articles/interview-with-the-developers-of-dead-cells), [Diablo IV 개발 글](https://news.blizzard.com/en-us/article/23746639/diablo-iv-quarterly-updatedecember-2021), [PoE2 개발 Q&A](https://www.pathofexile.com/forum/view-thread/3317905) |

인계 상태: 공개 텍스트와 발표 메타데이터 조사 완료. 영상 프레임 실측·공개 발표 전체 청취·최신 게임 버전의 내부 파라미터 검증은 미실행. 지정 파일 밖 수정, 커밋·push, Unity 실행, Python, 유료 서비스, 로그인, 이미지·게임 파일·에셋 다운로드는 수행하지 않았다.
