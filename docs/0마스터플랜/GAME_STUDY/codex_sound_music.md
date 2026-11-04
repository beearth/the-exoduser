# 다크 판타지 ARPG 사운드·음악 디렉션 연구

조사일: 2026-11-05 · 대상: Diablo IV, Path of Exile 2, Hades, No Rest for the Wicked, Phantom Blade Zero

## 1. 범위와 판독 규칙

공개 웹 문서와 제작자 인터뷰를 조사한 연구 문서다. 게임 실행·직접 청취·내부 오디오 프로젝트 분석은 하지 않았다. 이미지·음원·게임 파일·에셋은 내려받거나 포함하지 않았다. 아래 제안은 구현 결과나 청취 합격 판정이 아니다.

- **[사실]**: 개발사·제작 참여자·도구 제작사의 공개 설명에서 확인한 내용. 과거 개발 발언은 해당 시점의 사실로만 취급한다.
- **[추정]**: 확인한 원리를 바탕으로 작성한 해석·설계 제안. 연결한 URL은 제안의 근거이며 해당 게임이 제안 그대로 구현했다는 증거가 아니다.
- **미확인**: 이번에 접근한 자료에서 확인하지 못했다는 뜻이다. 기능이 없거나 비공개라고 단정하지 않는다. 미확인 항목의 URL은 조사한 자료 범위를 가리킨다.
- **[사실: 용어]** 버스는 믹싱 경로, 스템은 분리된 음악 파트, 보이스는 재생 인스턴스를 뜻하는 용어로 사용한다. 스템 수·보이스 수·출력 채널 수를 같은 수치로 취급하지 않는다. [용어 근거: Unity Mixer](https://docs.unity3d.com/6000.0/Documentation/Manual/AudioMixerOverview.html), [Hades 제작자 인터뷰](https://gameplay.co/hades-game-music-sound-design-darren-korb-supergiant-games/)

직접 인용은 사용하지 않고 요약했다. 공개 발표의 제목·소개만 확인한 경우 발표 본문을 본 것으로 취급하지 않는다.

## 2. 공개 자료의 확보 수준

| 대상 | 자료와 발표자 | 이번 연구에서 사용할 수 있는 범위 |
|---|---|---|
| Diablo IV | **[사실]** 사운드 슈퍼바이저 Kris Giampa의 2021년 개발사 해설. [Blizzard](https://news.blizzard.com/en-gb/article/23731236/diablo-iv-quarterly-updateoctober-2021) | 본문 확인. 재생 제한·스킬 구성·환경음 근거로 사용한다. 개발 중 설명이므로 현재 빌드의 모든 설정을 보증하지 않는다. |
| Diablo IV / GDC | **[사실]** GDC 2024의 Audio Systems Deep Dive “Living Audio”, Kris Giampa·Michael Bartnett. [Microsoft 공식 일정](https://developer.microsoft.com/en-us/games/events/gdc/2024/) | 일정·발표자 확인. [GDC 세션 URL](https://schedule.gdconf.com/session/diablo-iv-audio-systems-deep-dive-living-audio/899258)은 조회 실패했고 [Vault](https://gdcvault.com/browse/gdc-24?keyword=diablo)는 점검 안내로 이동했다. 발표 내부 수치·버스 도식은 미확인이다. |
| Path of Exile 2 | **[사실]** Kane Bennett의 Audio Team Q&A Part 1 및 Kane·Kamil Orman-Janowski의 Part 2, 2022년. [Part 1](https://www.pathofexile.com/forum/view-thread/3317905), [Part 2](https://www.pathofexile.com/forum/view-thread/3318839) | 본문 확인. PoE1 현행 설명과 PoE2 개발 계획을 구별한다. |
| Path of Exile 2 / 공개 세션 | **[사실]** ExileCon 2023 Sound Design and Music of Path of Exile 2, Kane Bennett·Kamil Orman-Janowski. [개발사 공식 영상 소개](https://www.youtube.com/watch?v=zflIzQYLFA0) | 발표 존재·주제 확인. 영상 본문·자막을 확보하지 못했으므로 세부 기술이나 타임코드를 만들지 않는다. |
| Hades | **[사실]** Darren Korb가 직접 설명한 Gameplay 인터뷰, 2020-12-24. [공개 전문](https://gameplay.co/hades-game-music-sound-design-darren-korb-supergiant-games/) | 본문 확인. 상황별 믹스와 인터랙티브 음악의 가장 구체적인 근거다. |
| Hades / 미들웨어 | **[사실]** Korb의 FMOD 도입·작업 방식에 관한 인터뷰. [Game Developer](https://www.gamedeveloper.com/audio/composer-darren-korb-talks-audio-middleware-and-its-importance-to-game-developers) | 검색에서 공개된 인터뷰 요약을 보조 사용한다. GDC 2021 [Korb 슬라이드 링크](https://media.gdcvault.com/GDC%2B2021/33103_Korb.pdf)는 접근 거부로 본문 미확인이다. |
| No Rest for the Wicked | **[사실]** 제작 참여자의 초기 제작·인게임 믹싱 설명과 개발사 패치 노트. [Tension Studios, 2024-04-30](https://www.tensionstudios.net/633/), [The Breach Refined, 2025-06-25 게시](https://forum.norestforthewicked.com/t/patch-notes-the-breach-refined-patch-1/19212) | 본문 확인. 제작 참여·변경 내역의 증거이며 상세 믹서 설계 문서는 아니다. |
| No Rest for the Wicked / 기술 참여자 | **[사실: 참여자 자기보고]** Wayne M Messam II는 2022-10~2023-04의 Unity·Wwise 기술 사운드 작업, 상태 반응형 환경 노드와 적응형 보스 음악 시스템을 경력에 기록했다. [공개 경력 문서 1쪽](https://waynemessamii.com/wp-content/uploads/2022/08/WMII_Audio_CV.docx-1.pdf) | 텍스트 확인. 당시 담당 작업에 대한 자기보고이며 현행 제품 전체 구조·개별 보스의 페이즈 규칙을 보증하지 않는다. |
| No Rest for the Wicked / 공개 세션·인터뷰 | **[사실]** GameSoundCon 2024에 Finding Function and Form Out of a Creative Cyclone 및 Feeling Powerful from an Isometric Distance 세션이 등재되어 있다. [Audiokinetic 공식 안내](https://info.audiokinetic.com/en/gamesoundcon-2024) | 제목·일정만 확인. Jason Graves의 [Film Buds 인터뷰 소개](https://filmbudspodcast.com/video/still-wakes-the-deep-interview-w-composer-jason-graves-no-rest-for-the-wicked-early-access)도 찾았으나 본문·전문은 미확인이다. 소개만으로 작곡 기법을 단정하지 않는다. |
| Phantom Blade Zero | **[사실]** 게임 디렉터 Soulframe와 사운드 프로듀서 Bo Caisheng의 직접 인터뷰, 2026-10-09. [Game*Spark 2쪽](https://www.gamespark.jp/article/2026/10/09/173401_2.html) | 음악 질문·답변 본문 확인. [PCGamesN 작곡가 인터뷰](https://www.pcgamesn.com/phantom-blade-zero/composer-interview)는 접근 실패했으므로 재인용 기사에 있는 상세 페이즈 설명은 확정 근거에서 제외한다. |

## 3. 게임별 조사표

### 3.1 Diablo IV

| 항목 | 확인한 사실과 한계 |
|---|---|
| 믹스 버스 구조 | **[사실]** 상황에 적응하면서 명료하고 강한 믹스를 목표로 설명한다. Master 이하 버스 이름·트리·사이드체인 경로는 **미확인**. [개발사 해설](https://news.blizzard.com/en-gb/article/23731236/diablo-iv-quarterly-updateoctober-2021) |
| 우선순위·동시 발음 | **[사실]** 같은 소리의 동시 인스턴스를 엄격한 규칙으로 제한해 혼잡을 줄인다. 카테고리별 상한·우선순위 점수·stealing 알고리즘은 **미확인**. [동일 자료, The Devil is in the details](https://news.blizzard.com/en-gb/article/23731236/diablo-iv-quarterly-updateoctober-2021) |
| 타격음 레이어 | **[사실]** Firebolt를 시전·충돌 원샷과 비행 루프로 분리한다. Inferno는 여기에 뱀의 특성을 더한다. 근접 타격의 접점·무기·재질·저음 4층 공식이나 주파수는 **미확인**. [Hero Fire Skills](https://news.blizzard.com/en-gb/article/23731236/diablo-iv-quarterly-updateoctober-2021) |
| 예고음 | **[사실]** 소리를 피해·행동 정보 전달에 사용한다고 설명한다. 던전에서는 모퉁이 너머의 소리로 다음 적을 준비시키려 한다. 공격별 전용 예고음 선행 시간은 **미확인**. [도입부·Dungeon Ambience](https://news.blizzard.com/en-gb/article/23731236/diablo-iv-quarterly-updateoctober-2021) |
| 보스 테마·페이즈 | **미확인**. 이 해설은 음악 상세를 다루지 않는다고 명시한다. 보스 페이즈별 스템 수·마디 전환·체력 임계값을 여기서 추론하지 않는다. [해설의 범위](https://news.blizzard.com/en-gb/article/23731236/diablo-iv-quarterly-updateoctober-2021) |
| 환경음·앰비언스 층 | **[사실]** 시간에 따라 변하는 Living Audio를 지향한다. 지역별 환경, 실시간 차폐, 리버브, 환경 반응형 딜레이·에코를 설명한다. 던전은 탐험을 방해하지 않도록 다르게 조율한다. [Open World / Dungeon Ambience](https://news.blizzard.com/en-gb/article/23731236/diablo-iv-quarterly-updateoctober-2021) |
| 라우드니스 | 통합 LUFS·True Peak·LRA·모니터 교정 수치 모두 **미확인**. [이번에 확인한 개발사 자료](https://news.blizzard.com/en-gb/article/23731236/diablo-iv-quarterly-updateoctober-2021) |
| 미들웨어 | FMOD·Wwise 중 실제 채택 제품·버전은 이번 1차 자료에서 **미확인**. 발표 제목이나 다른 Diablo 작품의 도구를 채택 증거로 삼지 않는다. [GDC 공식 일정](https://developer.microsoft.com/en-us/games/events/gdc/2024/), [개발사 해설](https://news.blizzard.com/en-gb/article/23731236/diablo-iv-quarterly-updateoctober-2021) |

### 3.2 Path of Exile 2

| 항목 | 확인한 사실과 한계 |
|---|---|
| 믹스 버스 구조 | **[사실]** 2022년 Kane은 PoE2용으로 더 복잡한 FMOD 믹싱 시스템을 개발 중이라고 설명했다. 버스 이름·계층·덕킹 수치는 **미확인**. [Q&A Part 2](https://www.pathofexile.com/forum/view-thread/3318839) |
| 우선순위·동시 발음 | **[사실: PoE1 당시 사례]** FMOD 우선순위·stealing·이벤트 쿨다운, 설정별 32·64·128채널을 설명한다. **PoE2의 현행 상한·쿨다운 값은 미확인**이며 이 숫자를 전용하지 않는다. [Part 2, 대량 재생·채널 질문](https://www.pathofexile.com/forum/view-thread/3318839) |
| 타격음 레이어 | **[사실: PoE2 개발 설명]** on-hit 오디오를 전면 재구축한다고 밝혔다. 접점·무기·재질·저음의 실제 이벤트 분해와 레벨은 **미확인**. [Part 1, PoE2 혁신 질문](https://www.pathofexile.com/forum/view-thread/3317905) |
| 예고음 | 보스별 경고음의 보호 순위·공격까지의 시간은 **미확인**. 보스 우선순위 질문에 대한 PoE1 시스템 답변만으로 PoE2의 모든 경고음을 보장하지 않는다. [Part 2](https://www.pathofexile.com/forum/view-thread/3318839) |
| 보스 테마·페이즈 | **[사실: 2022년 계획]** Kamil은 다수 콘텐츠에서 수직 리믹싱보다 작은 구간의 수평 분할을 고려한다고 답했다. 이 문답 전체가 PoE2의 완성된 보스 설계는 아니다. 현재 페이즈 조건·크로스페이드 시간은 **미확인**. [Part 2, dynamic mixing 질문](https://www.pathofexile.com/forum/view-thread/3318839) |
| 환경음·앰비언스 층 | **[사실: PoE2 개발 설명]** 환경을 동적으로 바꾸고 과밀한 앰비언스를 줄이며, 유조성 환경음을 음악 조성과 맞추려 한다. 구체적 베드·점음원 개수는 **미확인**. [Part 1](https://www.pathofexile.com/forum/view-thread/3317905) |
| 라우드니스 | PoE2 마스터 LUFS·True Peak·카테고리별 목표치는 **미확인**. [Part 1](https://www.pathofexile.com/forum/view-thread/3317905), [Part 2](https://www.pathofexile.com/forum/view-thread/3318839) |
| 미들웨어 | **[사실: 2022년]** PoE2의 FMOD 개발 사용을 명시한다. 도구 교체 비용·협업 관계도 설명한다. 2026년 빌드의 정확한 버전은 **미확인**. [Part 2](https://www.pathofexile.com/forum/view-thread/3318839) |

### 3.3 Hades

| 항목 | 확인한 사실과 한계 |
|---|---|
| 믹스 버스 구조 | **[사실]** Korb는 대사가 나올 때 다른 소리가 자리를 비워 순간의 중요한 정보가 들리도록 조율한다고 말한다. 버스 트리·덕킹 구현·감쇠량은 **미확인**. [Gameplay 전문](https://gameplay.co/hades-game-music-sound-design-darren-korb-supergiant-games/) |
| 우선순위·동시 발음 | **[사실]** 순간별 중요 정보의 가독성이 목표다. 엔진 보이스 상한·SFX별 인스턴스 제한은 **미확인**. [동일 인터뷰](https://gameplay.co/hades-game-music-sound-design-darren-korb-supergiant-games/) |
| 타격음 레이어 | **[사실]** 기존 라이브러리 소리를 겹치고 가공한다. 공격의 만족감·상황 피드백을 강조한다. 접점·무기·재질·저음의 고정 구성은 **미확인**. [동일 인터뷰](https://gameplay.co/hades-game-music-sound-design-darren-korb-supergiant-games/) |
| 예고음 | **[사실]** SFX에 입력 피드백과 상황 인지 역할을 부여한다. 보스 공격별 경고 패턴·선행 시간은 **미확인**. [동일 인터뷰](https://gameplay.co/hades-game-music-sound-design-darren-korb-supergiant-games/) |
| 보스 테마·페이즈 | **[사실]** 전투 중 드럼을 켜고 종료 시 끈다. 스템 조합을 일부 무작위화하고, 진행에 따라 마디 시작 마커에서 다음 구간으로 간다. 미니보스·보스에서 강한 록 구간, 승리 시 종결구를 사용한다. 개별 보스 체력 페이즈별 매핑은 **미확인**. [동일 인터뷰, 음악 구현 설명](https://gameplay.co/hades-game-music-sound-design-darren-korb-supergiant-games/) |
| 환경음·앰비언스 층 | **[사실]** 지역의 소리·음악을 세계관에 맞추려 한다. 환경 베드·랜덤 점음원·차폐의 내부 구조는 **미확인**. 음악 스템을 환경음 버스와 동일시하지 않는다. [동일 인터뷰](https://gameplay.co/hades-game-music-sound-design-darren-korb-supergiant-games/) |
| 라우드니스 | 마스터 LUFS·True Peak·보스 음악의 레벨차는 **미확인**. [동일 인터뷰](https://gameplay.co/hades-game-music-sound-design-darren-korb-supergiant-games/) |
| 미들웨어 | **[사실]** 인터뷰 전문에 FMOD Studio를 명시한다. Korb는 별도 인터뷰에서 타임라인 친숙성과 실행 중 조정의 이점을 설명했다. [Gameplay](https://gameplay.co/hades-game-music-sound-design-darren-korb-supergiant-games/), [Game Developer 인터뷰](https://www.gamedeveloper.com/audio/composer-darren-korb-talks-audio-middleware-and-its-importance-to-game-developers) |

### 3.4 No Rest for the Wicked

| 항목 | 확인한 사실과 한계 |
|---|---|
| 믹스 버스 구조 | **[사실]** 초기 제작 참여자는 인게임 믹싱을 담당했다고 밝힌다. Master·전투·환경·대사 버스의 실제 구조는 **미확인**. [제작 참여자 기록](https://www.tensionstudios.net/633/) |
| 우선순위·동시 발음 | 버스별 제한·보스 보호·최대 보이스 수 **미확인**. Wwise 채택만으로 특정 제한 정책을 사용했다고 단정하지 않는다. [공식 패치 노트](https://forum.norestforthewicked.com/t/patch-notes-the-breach-refined-patch-1/19212) |
| 타격음 레이어 | **[사실]** 적 무기 패리 충돌음, 착지 충격음, 작은 2차 얼음 파쇄음의 추가·개선이 기록되어 있다. 접점·무기·재질·저음 4층의 실제 조합은 **미확인**. [Audio 변경 내역](https://forum.norestforthewicked.com/t/patch-notes-the-breach-refined-patch-1/19212) |
| 예고음 | **[사실]** 적 공격 SFX·보이스 개선 내역은 있다. 이것이 공격 이전의 전용 경고음을 뜻하는지와 타이밍은 **미확인**. [Audio 변경 내역](https://forum.norestforthewicked.com/t/patch-notes-the-breach-refined-patch-1/19212) |
| 보스 테마·페이즈 | **[사실]** 탐색·보스전 음악 시스템과 음악 씬 매니저 안정성, Darak 시네마틱 음악 타이밍을 개선했다. [Music / Audio 변경 내역](https://forum.norestforthewicked.com/t/patch-notes-the-breach-refined-patch-1/19212) **[사실: 참여자 자기보고]** 초기 적응형 보스 음악 시스템 작업도 기록되어 있다. 체력 페이즈별 스템·전환 그리드는 **미확인**. [기술 참여자 경력 1쪽](https://waynemessamii.com/wp-content/uploads/2022/08/WMII_Audio_CV.docx-1.pdf) |
| 환경음·앰비언스 층 | **[사실]** Marin Woods의 밧줄 삐걱임·다리 표면음, 실내 공간 오디오, 전망대 앰비언스, 공간 인지 오브젝트 처리 개선을 기록한다. [Audio 변경 내역](https://forum.norestforthewicked.com/t/patch-notes-the-breach-refined-patch-1/19212) **[사실: 참여자 자기보고]** 게임 상태에 반응하는 환경 노드 작업을 설명한다. 전체 레이어 구성은 **미확인**. [기술 참여자 경력 1쪽](https://waynemessamii.com/wp-content/uploads/2022/08/WMII_Audio_CV.docx-1.pdf) |
| 라우드니스 | 음악 믹스 개선은 확인되지만 LUFS·True Peak 목표치는 **미확인**. [Music 변경 내역](https://forum.norestforthewicked.com/t/patch-notes-the-breach-refined-patch-1/19212) |
| 미들웨어 | **[사실]** 해당 패치에서 Wwise 2022.1.19로 업데이트했다고 명시한다. 이 버전을 2026년 현재 버전이라고 단정하지 않는다. [공식 패치 노트](https://forum.norestforthewicked.com/t/patch-notes-the-breach-refined-patch-1/19212) |

### 3.5 Phantom Blade Zero

| 항목 | 확인한 사실과 한계 |
|---|---|
| 믹스 버스 구조 | 버스 트리·음악과 SFX의 덕킹 경로 **미확인**. 확인한 인터뷰의 음악 문답은 미학 중심이다. [Game*Spark](https://www.gamespark.jp/article/2026/10/09/173401_2.html) |
| 우선순위·동시 발음 | 전투 보이스 제한·stealing·쿨다운 수치 **미확인**. [조사한 제작자 인터뷰](https://www.gamespark.jp/article/2026/10/09/173401_2.html) |
| 타격음 레이어 | 접점·무기·재질·저음별 제작법과 분리 재생 여부 **미확인**. 음악 인터뷰를 무기 SFX 제작 증거로 확대하지 않는다. [동일 인터뷰](https://www.gamespark.jp/article/2026/10/09/173401_2.html) |
| 예고음 | 공격 전용 큐·패리 알림의 오디오 규칙·선행 시간 **미확인**. [동일 인터뷰](https://www.gamespark.jp/article/2026/10/09/173401_2.html) |
| 보스 테마·페이즈 | **[사실]** Bo Caisheng은 전통 중국 음악과 현대적 소리를 결합하는 방향, 전통 악기 연주자들과의 협업을 설명한다. 보스별 페이즈 스템·동기 전환 방식은 **미확인**. [음악 문답](https://www.gamespark.jp/article/2026/10/09/173401_2.html) |
| 환경음·앰비언스 층 | 베드·랜덤 음원·차폐·날씨 반응 구조 **미확인**. 세계관 설명은 해당 오디오 시스템을 증명하지 않는다. [동일 인터뷰](https://www.gamespark.jp/article/2026/10/09/173401_2.html) |
| 라우드니스 | LUFS·True Peak·모니터 교정·믹스 프리셋 수치 **미확인**. [동일 인터뷰](https://www.gamespark.jp/article/2026/10/09/173401_2.html) |
| 미들웨어 | FMOD·Wwise·엔진 기본 오디오 중 실제 채택을 확인할 제작자 자료는 이번 조사에서 **미확인**. 모드 설명·추출 정보로 보완하지 않는다. [동일 인터뷰](https://www.gamespark.jp/article/2026/10/09/173401_2.html) |

## 4. 공통점과 차이 — 확인된 범위만

다섯 작품 모두에 적용된다고 확정할 자료는 부족하다. 아래 공통점은 근거가 있는 작품끼리의 교집합이며, 일반화한 방향은 별도로 [추정] 표시했다.

| 논점 | 공개 자료의 교집합 | 디렉션 해석 |
|---|---|---|
| 정보의 명료도 | **[사실]** Diablo IV는 인스턴스 제한, Hades는 순간의 중요 정보가 들리는 믹스를 강조한다. [Diablo IV](https://news.blizzard.com/en-gb/article/23731236/diablo-iv-quarterly-updateoctober-2021), [Hades](https://gameplay.co/hades-game-music-sound-design-darren-korb-supergiant-games/) | **[추정]** 타격음 개수를 늘리기 전에 무엇이 남아야 하는지 정한다. 근거는 왼쪽 두 제작 설명이다. |
| 반복 플레이 | **[사실]** Diablo IV는 재생 변이, Hades는 음악 스템 변이를 사용한다. [Diablo IV](https://news.blizzard.com/en-gb/article/23731236/diablo-iv-quarterly-updateoctober-2021), [Hades](https://gameplay.co/hades-game-music-sound-design-darren-korb-supergiant-games/) | **[추정]** 공격 종류는 식별 가능하게 유지하면서 보조 질감과 음악 조합을 바꾸는 편이 연구 목적에 맞는다. 근거는 왼쪽 두 사례다. |
| 환경과 음악의 관계 | **[사실]** Diablo IV는 변화하는 환경을, PoE2 개발 설명은 앰비언스 밀도·음악 조성의 협업을 강조한다. [Diablo IV](https://news.blizzard.com/en-gb/article/23731236/diablo-iv-quarterly-updateoctober-2021), [PoE Q&A Part 1](https://www.pathofexile.com/forum/view-thread/3317905) | **[추정]** 다크 판타지의 어둠을 지속 저음 하나로 처리하기보다 공간 변화와 음악의 빈자리를 함께 설계한다. 근거는 왼쪽 두 설명이다. |
| 상태에 따른 음악 운용 | **[사실]** Hades의 전투·보스 구간 제어와 Wicked의 탐색·보스 음악 시스템 개선이 확인된다. [Hades](https://gameplay.co/hades-game-music-sound-design-darren-korb-supergiant-games/), [Wicked](https://forum.norestforthewicked.com/t/patch-notes-the-breach-refined-patch-1/19212) | **[추정]** 탐색·교전·보스·승리를 별도 상태로 설계할 근거다. 두 게임의 구현이 같다는 뜻은 아니다. |
| 세계관을 담는 음색 | **[사실]** Hades는 지중해 악기와 록 계열을, Phantom Blade Zero는 중국 전통과 현대적 소리의 결합을 설명한다. [Hades](https://gameplay.co/hades-game-music-sound-design-darren-korb-supergiant-games/), [Phantom Blade Zero](https://www.gamespark.jp/article/2026/10/09/173401_2.html) | **[추정]** 장르를 합창·오케스트라만으로 고정하지 않고 작품의 문화·행동 리듬에 맞는 음색을 정한다. 근거는 왼쪽 두 인터뷰다. |

**차이:** **[사실]** Hades에는 수직 스템 조합과 구간 진행의 구체적 설명이 있다. PoE의 2022년 답변은 다수 콘텐츠에서 수평 분할을 고려한 당시 방향이다. 두 자료를 합쳐 모든 ARPG가 같은 적응형 음악 기법을 쓴다고 쓰면 안 된다. [Hades](https://gameplay.co/hades-game-music-sound-design-darren-korb-supergiant-games/), [PoE Part 2](https://www.pathofexile.com/forum/view-thread/3318839)

## 5. 미들웨어 선택 사례와 제공 기능

| 선택지 | 대상 게임의 채택 증거 | 도구가 제공하는 기능 | 선택 해석 |
|---|---|---|---|
| FMOD Studio | **[사실]** Hades의 사용, PoE2 개발 시점의 FMOD 사용 확인. [Hades 인터뷰](https://gameplay.co/hades-game-music-sound-design-darren-korb-supergiant-games/), [PoE Part 2](https://www.pathofexile.com/forum/view-thread/3318839) | **[사실]** 이벤트·파라미터·믹서·우선순위 스냅샷·실행 중 조정·프로파일링을 제공한다. [FMOD 공식](https://fmod.com/studio) | **[추정]** 작곡가·디자이너가 상태와 음악 타임라인을 직접 조정하는 제작 흐름에 비교 후보로 둔다. 근거: [FMOD](https://fmod.com/studio), [Korb 인터뷰](https://www.gamedeveloper.com/audio/composer-darren-korb-talks-audio-middleware-and-its-importance-to-game-developers). |
| Wwise | **[사실]** Wicked의 특정 패치 버전 채택 확인. Diablo IV·Phantom Blade Zero는 이번 1차 자료로 확정하지 않는다. [Wicked 공식](https://forum.norestforthewicked.com/t/patch-notes-the-breach-refined-patch-1/19212) | **[사실]** 공식 교육 소개에서 동적 믹싱·사이드체인·HDR·보이스 관리·음악 상호작용을 다룬다. 이것은 Wicked가 전부 쓴다는 증거가 아니다. [Audiokinetic](https://info.audiokinetic.com/en/gamesoundcon-2024) | **[추정]** 복잡한 믹싱·상태·사운드뱅크 운용을 오디오 팀이 관리해야 할 때 비교한다. 근거: [공식 교육 범위](https://info.audiokinetic.com/en/gamesoundcon-2024). |
| Unity Audio | 다섯 작품 중 **Unity 기본 오디오만으로 제작했다는 사례는 미확인**. Wicked의 Unity·Wwise 작업 경력은 참여자 자료에 명시된다. Unity 엔진 사용과 기본 오디오 단독 사용은 구분한다. [참여자 공개 경력](https://waynemessamii.com/wp-content/uploads/2022/08/WMII_Audio_CV.docx-1.pdf) | **[사실]** Unity 6000.0은 AudioMixer 그룹·효과·스냅샷과 AudioSource 재생 기능을 제공한다. [Unity Mixer](https://docs.unity3d.com/6000.0/Documentation/Manual/AudioMixerOverview.html) | **[추정]** 기존 구조를 먼저 계측하고, 상태·제한·음악 제어를 자체 관리할 수 있는 범위라면 기본 오디오를 초기 비교안으로 유지한다. 근거: [Unity 기능](https://docs.unity3d.com/6000.0/Documentation/Manual/AudioMixerOverview.html). |

**[추정]** 미들웨어 도입은 유명 게임의 이름보다 담당자의 편집 흐름·프로파일링·전환 관리 비용으로 판단한다. 위 표는 라이선스·예산 승인이나 Unity 6000의 특정 패치와 통합 패키지 사이의 호환성 검증을 대신하지 않는다. 근거: [PoE의 교체 부담 설명](https://www.pathofexile.com/forum/view-thread/3318839), [FMOD의 반복 작업 기능](https://fmod.com/studio).

## 6. 라우드니스 — 기준과 미확인 수치

| 구분 | 확인·해석 |
|---|---|
| 측정 방법 | **[사실]** ITU-R BS.1770은 프로그램 라우드니스와 True Peak 측정 알고리즘을 다루며, 공식 목록은 BS.1770-5를 게재한다. 이것만으로 게임별 목표 레벨이 정해지지는 않는다. [ITU 공식](https://www.itu.int/rec/R-REC-BS.1770/en) |
| 공개 권고의 예 | **[사실]** EBU R 128 소개는 평균 프로그램 라우드니스 **−23 LUFS**, Loudness Range와 Maximum True Peak 지표를 권고한다. 이 수치는 방송 프로그램 맥락의 참조이며, 위 다섯 게임의 채택 수치가 아니다. [EBU 공식 v5.0 소개](https://tech.ebu.ch/publications/r128) |
| 대상 게임의 실제 수치 | 각 게임 표에 적은 LUFS·True Peak·LRA는 모두 **미확인**이다. 음악 믹스 개선이나 명료한 믹스라는 표현을 수치로 바꾸지 않는다. 조사 범위: [Diablo IV](https://news.blizzard.com/en-gb/article/23731236/diablo-iv-quarterly-updateoctober-2021), [PoE](https://www.pathofexile.com/forum/view-thread/3318839), [Hades](https://gameplay.co/hades-game-music-sound-design-darren-korb-supergiant-games/), [Wicked](https://forum.norestforthewicked.com/t/patch-notes-the-breach-refined-patch-1/19212), [Phantom Blade Zero](https://www.gamespark.jp/article/2026/10/09/173401_2.html) |
| 비교 조건 | **[추정]** 이후 청취 비교에서는 사용자 볼륨·출력 장치·프리셋·측정 구간을 기록하고, 탐색과 밀집 전투를 따로 측정한다. 하나의 전체 평균만으로 경고음 가독성을 합격시키지 않는다. 근거: [ITU 측정 범위](https://www.itu.int/rec/R-REC-BS.1770/en), [Hades의 상황별 중요 정보](https://gameplay.co/hades-game-music-sound-design-darren-korb-supergiant-games/). |
| 목표값 결정 | **[추정]** 프로젝트용 통합 LUFS·True Peak 한계·덕킹 dB·공격/복귀 시간은 **미정**으로 둔다. 측정·청취로 정하기 전에는 업계 공통값이나 경쟁작 값이라고 기입하지 않는다. 근거: [EBU의 명시적 적용 맥락](https://tech.ebu.ch/publications/r128), [PoE의 인게임 검토 방식](https://www.pathofexile.com/forum/view-thread/3318839). |

## 7. Unity 6000 프로젝트 적용 방법 [추정]

이 절의 모든 구조·정책·순서는 **[추정] 제안**이다. 기존 프로젝트 코드를 조사하거나 변경한 결과가 아니다. API 근거는 Unity **6000.0** 공식 문서를 사용했으며, 실제 프로젝트의 세부 버전·패키지·플랫폼에서의 동작은 미확인이다.

### 7.1 믹스 버스와 상태

**[추정]** AudioMixer를 다음처럼 역할로 나눈다. `Warnings`는 위험 정보, `Impacts`는 타격 결과, `Foley`는 움직임, `Ambience`는 공간을 맡긴다. 아래 이름과 개수는 이 연구의 제안이다. 근거: [Unity의 그룹·라우팅 기능](https://docs.unity3d.com/6000.0/Documentation/Manual/AudioMixer.html), [Hades의 중요 정보 중심 믹스](https://gameplay.co/hades-game-music-sound-design-darren-korb-supergiant-games/).

```text
Master
├─ UI
├─ Dialogue
├─ Warnings
├─ Combat
│  ├─ Player
│  ├─ Enemy
│  └─ Impacts
├─ Foley
├─ Ambience
│  ├─ Bed
│  ├─ Local
│  └─ Weather
├─ Music
└─ ReverbReturns
```

**[추정]** `Explore / Combat / Boss / Dialogue / Pause` 상태에 맞춰 스냅샷을 운용한다. 경고·대사가 재생될 때 음악·환경·장식음이 비켜나도록 조정하되, 경고음까지 함께 눌리지 않게 경로를 분리한다. 스냅샷과 사용자 볼륨이 같은 파라미터를 덮어쓰지 않도록 소유권을 정한다. 근거: [Unity 스냅샷·노출 파라미터·덕킹 설명](https://docs.unity3d.com/6000.0/Documentation/Manual/AudioMixerOverview.html). 감쇠량과 복귀 시간은 **미정**이다.

### 7.2 우선순위와 동시 발음 제한

**[추정]** 이벤트에 `역할·발생 주체·위치·공격 식별자·중요도·재료·최근 재생 시각`을 전달한다. 발동 전에는 주체별·이벤트별·전체 제한을 평가하고, 장식용 잔여음부터 생략하는 정책을 둔다. 경고음은 낮은 중요도 소리와 같은 제한 묶음에 넣지 않는다. 근거: [Diablo IV 인스턴스 제한](https://news.blizzard.com/en-gb/article/23731236/diablo-iv-quarterly-updateoctober-2021), [PoE의 제한·쿨다운 사례](https://www.pathofexile.com/forum/view-thread/3318839).

**[추정]** Unity의 `AudioSource.priority`를 위험 정보·대사·플레이어 결과음 순으로 배정하되 자체 이벤트 제한도 함께 둔다. **[사실: API]** 값은 0이 높은 우선순위, 256이 낮은 우선순위이며, 같은 우선순위에서는 작은 소리가 가상화된다. 이 API가 전용 경고 슬롯을 예약해 준다는 뜻은 아니다. [Unity priority](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/AudioSource-priority.html)

**[추정]** `Max Real Voices`와 `Max Virtual Voices`는 대상 기기에서 계측 후 정한다. AudioSource 풀의 크기를 동시에 들리는 소리 수와 동일하게 취급하지 않는다. 풀 크기·버스별 상한·쿨다운 ms는 **미정**이다. 근거: [Unity Audio 설정의 실제·가상 보이스 구분](https://docs.unity3d.com/6000.0/Documentation/Manual/class-AudioManager.html).

### 7.3 타격음 레이어 — 접점·무기·재질·저음

아래 4층은 **[추정] 자체 제작 규격**이며 다섯 게임의 공통 내부 구조라는 주장이 아니다. 분리 가능한 행동 소리와 반복 변이를 참고했다. 근거: [Diablo IV 시전·비행·충돌 분해](https://news.blizzard.com/en-gb/article/23731236/diablo-iv-quarterly-updateoctober-2021), [Hades 레이어 가공 설명](https://gameplay.co/hades-game-music-sound-design-darren-korb-supergiant-games/).

| 층 | 제안 역할 | 제안 제어 |
|---|---|---|
| 접점 | 명중 시점과 결과를 읽게 하는 짧은 어택 | 실제 명중 이벤트에 연결. 빗나감에는 재생하지 않는다. |
| 무기 | 베기·찌르기·둔기의 행동 정체성 | 스윙과 명중을 분리하고 무기 계열로 선택한다. |
| 재질 | 살·갑옷·나무·돌 등의 차이 | `weapon × surface` 조합에 따라 선택하고 반복 변이를 둔다. |
| 저음 | 큰 충격의 무게 | 중요한 충격에 선택적으로 부가하고, 다수 명중 시 중복을 제한한다. |

**[추정]** 표의 모든 층을 매번 별도 보이스로 재생할 필요는 없다. 고정 조합은 제작 단계에서 묶고, 재질처럼 게임 상태에 따라 바뀌는 부분만 분리하는 안을 비교한다. 저음 중심 주파수·레이어별 dB·길이는 **미정**이다. 근거: [Unity 보이스 예산](https://docs.unity3d.com/6000.0/Documentation/Manual/class-AudioManager.html), [PoE의 반복 강도·피로도 문제](https://www.pathofexile.com/forum/view-thread/3317905).

### 7.4 예고음

**[추정]** `공격 준비 → 위험 발동 → 명중/빗나감 → 잔여`를 구별한다. 예고는 준비 신호, 타격음은 판정 결과 신호에 연결한다. 예고음을 음악의 다음 마디까지 기다리게 하지 않고, 준비가 취소되면 지속 예고음도 종료한다. 같은 공격 식별자의 중복 예고는 제거한다. 근거: [Hades의 상황 인지·행동 피드백 역할](https://gameplay.co/hades-game-music-sound-design-darren-korb-supergiant-games/), [Unity 재생 우선순위](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/AudioSource-priority.html).

**[추정]** 위험 종류는 음색·리듬으로 구분하고, 방향 정보와 시각 예고를 함께 설계한다. 겹친 전투에서도 식별되는지 확인한 뒤 선행 시간·반복 간격을 정한다. 경쟁작의 정확한 예고 ms는 **미확인**, 프로젝트 목표도 **미정**이다. 근거: [Diablo IV의 정보 전달·접근성 지향](https://news.blizzard.com/en-gb/article/23731236/diablo-iv-quarterly-updateoctober-2021).

### 7.5 보스 음악과 인터랙티브 전환

**[추정]** `탐색 → 교전 → 보스 도입 → 페이즈 → 승리/사망` 상태를 만들고, 페이즈 정보는 게임 상태에서 받는다. 음악 길이나 임의 체력 비율로 페이즈를 추측하지 않는다. 곡의 리듬·조성·스템 규격에 맞춰 수직 레이어 변경과 수평 구간 전환 중 적합한 방식을 선택한다. 근거: [Hades의 스템·마디 마커](https://gameplay.co/hades-game-music-sound-design-darren-korb-supergiant-games/), [PoE의 수평 분할 방향](https://www.pathofexile.com/forum/view-thread/3318839).

**[추정]** Unity 기본 오디오에서는 음악 전용 시간 기준을 두고 `AudioSettings.dspTime`과 `AudioSource.PlayScheduled`로 구간을 예약하는 안을 검토한다. **[사실: API]** `PlayScheduled`는 DSP 절대 시간 기준이며 프레임률과 독립적인 음악 연결 용도로 설명된다. [Unity PlayScheduled](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/AudioSource.PlayScheduled.html)

**[추정]** 음악 전환은 다음 유효 마디에 예약하되, 페이즈 위험 신호는 즉시 처리하는 별도 경로를 둔다. 사망·재시작·씬 이탈 시 예약과 이전 스템을 함께 정리하고, 일시정지 후 동기화도 검증한다. BPM·마디 수·페이드 길이는 작곡 규격이 정해질 때까지 **미정**이다. 근거: [Unity의 예약 재생 방식](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/AudioSource.PlayScheduled.html), [Wicked의 음악 시스템 안정성 개선 사례](https://forum.norestforthewicked.com/t/patch-notes-the-breach-refined-patch-1/19212).

### 7.6 환경음과 공간

**[추정]** `Bed`는 지역 바탕, `Local`은 다리·물·나무·실내 활동, `Weather`는 바람·비 상태로 나눈다. 음원의 시간·위치 변이는 장식음에 주고 위험을 알리는 소리에는 무작위 누락을 적용하지 않는다. 근거: [Diablo IV Living Audio](https://news.blizzard.com/en-gb/article/23731236/diablo-iv-quarterly-updateoctober-2021), [Wicked의 밧줄·표면·실내 사례](https://forum.norestforthewicked.com/t/patch-notes-the-breach-refined-patch-1/19212).

**[추정]** 실내외 이동 시 환경·리버브 상태를 바꾸고, 유조성 드론이 음악 조성을 방해하지 않는지 검토한다. Unity AudioMixer만으로 지오메트리 기반 차폐가 완성된다고 가정하지 않는다. 공간 처리의 별도 구현 범위부터 정한다. 근거: [PoE2의 음악·환경 협업](https://www.pathofexile.com/forum/view-thread/3317905), [Unity의 믹서와 공간 감쇠 구분](https://docs.unity3d.com/6000.0/Documentation/Manual/AudioMixerOverview.html).

### 7.7 적용 순서와 검증 항목

다음은 **[추정] 후속 구현·청취 계획**이다. 이번 연구 작업에서는 실행하지 않았다. 근거는 [Hades의 실제 플레이 기반 믹스 검토](https://gameplay.co/hades-game-music-sound-design-darren-korb-supergiant-games/), [PoE의 인게임 리뷰](https://www.pathofexile.com/forum/view-thread/3318839), [Unity 보이스 설정](https://docs.unity3d.com/6000.0/Documentation/Manual/class-AudioManager.html)이다.

| 순서 | 후속 작업 제안 | 남길 판정 근거 |
|---|---|---|
| 1 | 기존 오디오 라우팅·이벤트·볼륨 옵션을 조사한다. | 현재 구조와 미확인 목록. 도구 교체는 이 조사 이후 판단. |
| 2 | 대표 전투 하나에 명중 결과·예고·발음 제한을 연결한다. | 요청·실제 재생·생략·가상화 기록과 생략 이유. |
| 3 | 탐색·보스·승리 음악을 상태와 연결한다. | 마디 전환, 중복 스템, 사망·재시작 시 잔류 여부. |
| 4 | 같은 장면을 출력·볼륨 조건을 고정해 비교 청취한다. | 경고 인지·재질 구별·반복 피로·대사 가독성. |
| 5 | 탐색·밀집 전투·보스별 라우드니스를 측정한다. | 측정 구간·볼륨 조건·LUFS·True Peak·LRA와 청취 결과. 수치만으로 채택하지 않는다. |

**[추정]** 첫 적용의 목표는 소리 수나 최대 음량 증가가 아니라, 밀집 전투에서 위험·명중·페이즈가 구별되는 상태로 둔다. 우선 Unity 기본 구조로 그 목표를 검증하고, 저작 도구·프로파일링 요구가 커지면 FMOD·Wwise를 같은 장면 기준으로 비교한다. 근거: [Unity Mixer](https://docs.unity3d.com/6000.0/Documentation/Manual/AudioMixerOverview.html), [FMOD 작업 도구](https://fmod.com/studio), [Wwise 공식 교육 범위](https://info.audiokinetic.com/en/gamesoundcon-2024).
