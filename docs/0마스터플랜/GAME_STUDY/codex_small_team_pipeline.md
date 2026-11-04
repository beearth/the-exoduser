# 소규모 다크판타지 액션 팀의 공개 제작 파이프라인

조사일: 2026-11-05. 연구 문서이며 제작·구매·실행 지시가 아니다. 적용 전제는 이번 사용자 브리프의 **소규모 인력＋AI 에이전트, Unity 6000, 데모 v0 우선, PC 컴파일·Mac 판정**이다.

## 1. 범위와 판독 기준

이 문서는 팀의 역할 배분, 외부 협력, 콘텐츠 승인 순서, 제작 리듬과 실패를 조사한다. 참고 문서 `I:/EXODUSER-Storage/codex-takeover/small-team-pipeline/codex_3d_pixel_small_team.md`의 3D→픽셀·HD-2D 표현 기법, 해당 사례들의 도구 비교는 반복하지 않는다. Lies of P는 제외한다. 아래 게임을 모두 동일한 ARPG로 분류하지 않고, 다크판타지·죽음·신화 소재의 액션 및 인접 액션 어드벤처까지 비교한다. [장르 확인: Death’s Door 공식 상점](https://store.steampowered.com/app/894020/Deaths_Door/), [Hades 공식 FAQ](https://www.supergiantgames.com/blog/hades-faq/), [Blasphemous 공식 상점](https://store.steampowered.com/app/774361/Blasphemous/)

- **[사실]**은 링크한 본문에서 확인한 내용이다. 인터뷰는 제작자 진술이며, 보도 재전달은 그렇게 명시한다. 예산·효율을 독립 감사한 수치라는 뜻은 아니다.
- **[추정]**은 이 문서의 계산·해석·운영 제안이다. 사례 팀의 실제 관행이나 우리 팀에서 검증한 효과로 취급하지 않는다.
- **미확인**은 이번 열람 자료로 확인하지 못했다는 뜻이다. 0%, 미사용 또는 비공개라고 바꾸어 쓰지 않는다. 미확인 항목에는 확인에 사용한 자료 범위를 연결한다.
- **[추정: 조사 기준]** ‘2년 안팎’의 해석을 느슨하게 늘리지 않기 위해 **24개월 이내 충족 / 24개월 초과∼30개월 경계 / 30개월 초과 이탈**로 나눈다. 시제품·EA·정식판은 별도 종점으로 기록한다. 이 구간은 연구용 분류이며 산업 표준이 아니다. 종점 분리가 필요한 근거는 Hades의 서로 다른 EA·v1.0 출시 이력이다. [공식 FAQ](https://www.supergiantgames.com/blog/hades-faq/)
- **[추정: 인원 기준]** 핵심 제작진과 외주·음악·이식·QA 등 외부 기여를 나누어 본다. ‘핵심 2인’을 전체 제작 인력 2인으로 바꾸지 않는다. 전 기간 피크 인원·투입 기간·외주 공수가 없으면 총인월을 계산하지 않는다. [구분 근거: Death’s Door 개발자 인터뷰](https://www.escapistmagazine.com/deaths-door-interview-acid-nerve-mark-foster-david-fenn/), [Blasphemous 제작자 인터뷰](https://indielight.co.uk/2019/06/18/interview-with-mauricio-garcia-the-last-door/)

## 2. 인원·기간 조건을 먼저 대조

| 사례와 공개 단계 | 인원 조건: 10인 이하인가 | 일정 조건: 2년 안팎인가 | 이 연구의 판정 |
|---|---|---|---|
| Downfall of Yellow Sky / 黄天逆途 | **[사실: 보도]** 8인에서 11인으로 증가. 현 보도 수치 11인은 기준 초과. 직무별 구성·전업 환산은 미확인. [Diershoubing](https://diershoubing.com/en/news/140368/downfall-of-yellow-sky-2m-trailer-views-steam/) | **[사실] 미출시·개발 중, 출시일 미정.** 기사 제목의 ‘1년’은 거친 데모와 새 영상의 변화 기간이다. 총개발기간은 미확인. [공식 Steam](https://store.steampowered.com/app/5024530/?l=schinese), [기사 본문](https://diershoubing.com/en/news/140368/downfall-of-yellow-sky-2m-trailer-views-steam/) | 인원 이탈. 완성 기간 판정 불가. **출시 성공 사례로 세지 않는다.** |
| Death’s Door | **[사실]** Acid Nerve 핵심 2인＋아트 팀·외부 애니메이션 시도·각본 협력. 전체 피크 인원 미확인. [개발자 인터뷰](https://www.escapistmagazine.com/deaths-door-interview-acid-nerve-mark-foster-david-fenn/), [아트 협업 설명](https://press-start.com.au/features/2021/03/27/we-spoke-to-the-team-at-acid-nerve-about-the-stylish-looking-deaths-door/) | **[사실]** 2021-03 인터뷰 당시 전업 개발 약 3년 반, 이전의 병행 구상·프로토타입 별도. 첫 출시는 2021-07-20. [기간 진술](https://press-start.com.au/features/2021/03/27/we-spoke-to-the-team-at-acid-nerve-about-the-stylish-looking-deaths-door/), [공식 상점](https://store.steampowered.com/app/894020/Deaths_Door/) | 핵심 인원만 충족, 전체는 미확인. 기간 이탈. |
| Hades 초기 / EA와 v1.0 분리 | **[사실]** 2019-01 인터뷰는 ‘20인 미만’까지만 확인된다. 이것만으로 10인 이하인지 확정할 수 없다. 2020 출시 직후 팀 AMA는 약 20인으로 설명한다. [초기 인터뷰](https://www.gamedeveloper.com/design/supergiant-s-fourth-outing-i-hades-i-introduces-a-more-mature-organized-dev-process), [팀 AMA](https://www.reddit.com/r/NintendoSwitch/comments/ixri6b/we_are_supergiant_games_creators_of_hades_pyre/) | **[사실]** 2017년 여름 시작, 2018-12-06 EA, 2020-09-17 v1.0. 제작자는 v1.0까지 3년 조금 넘게 걸렸다고 설명한다. **[추정: 달력 계산]** EA까지 약 16∼17개월. [공식 FAQ](https://www.supergiantgames.com/blog/hades-faq/) | 초기 인원 10인 이하 미입증, 출시 시점 초과. EA만 기간 충족; 완성작 기간은 이탈. |
| Blasphemous | **[사실]** 2019-06 제작자 진술은 사내 약 10인＋외부 협력자. 출시 AMA의 아티스트 9인은 직군 기여자 수이며 전체 인원과 다르다. [제작자 인터뷰](https://indielight.co.uk/2019/06/18/interview-with-mauricio-garcia-the-last-door/), [팀 AMA](https://www.reddit.com/r/NintendoSwitch/comments/d2af0j) | **[사실]** 팀 AMA는 2016년 구상을 설명한다. 제작자는 게임당 약 3년이라고 답했고 실제 출시는 2019-09-10이다. [팀 AMA](https://www.reddit.com/r/NintendoSwitch/comments/d2af0j), [기간 인터뷰](https://indielight.co.uk/2019/06/18/interview-with-mauricio-garcia-the-last-door/), [공식 상점](https://store.steampowered.com/app/774361/Blasphemous/) | 사내 인원도 ‘약’이라는 경계값, 외부 포함 10인 이하 미입증. 기간 이탈. |
| Titan Souls: 짧은 일정의 보완 비교 | **[사실]** 핵심 3인: 프로그래밍·디자인, 아트, 음악·사운드. 퍼블리셔 협력 별도. [제작진 인터뷰](https://gamecloud.net.au/features/interviews/titan-souls-developer-interview-with-andrew-gleeson), [개발자 기고](https://blog.playstation.com/archive/2015/04/02/titan-souls-game-jam-playstation-store/) | **[사실]** 2013-12 게임잼에서 시작, 2015-04-14 출시. **[추정: 달력 계산]** 약 16개월. [시작 진술](https://gamecloud.net.au/features/interviews/titan-souls-developer-interview-with-andrew-gleeson), [공식 출시일](https://store.steampowered.com/app/297130/Titan_Souls/) | 공개 핵심 인원·기간 기준 충족. 외부 지원까지 포함한 전 기간 10인 이하 증명은 미확인. |

**[추정] 해석.** 지정한 네 사례를 ‘10인 이하가 2년에 낸 완성작’의 공통 증거로 사용할 수 없다. 가장 가까운 보완 비교는 Titan Souls지만, 그것도 퍼블리셔 지원과 시제품 이후 재제작을 빼고 읽으면 안 된다. 이 표는 평균 생산성이나 성공 확률을 산출하는 표가 아니다. [대조 근거: Hades 실제 기간](https://www.supergiantgames.com/blog/hades-faq/), [Death’s Door 실제 기간](https://press-start.com.au/features/2021/03/27/we-spoke-to-the-team-at-acid-nerve-about-the-stylish-looking-deaths-door/), [Titan Souls 재제작](https://blog.playstation.com/archive/2015/04/02/titan-souls-game-jam-playstation-store/)

## 3. Downfall of Yellow Sky: 미출시 관찰 사례

- **팀 구성 — [사실: 보도].** Diershoubing은 팀이 8인에서 11인으로 커졌다고 설명한다. 공식 상점의 개발·배급 표기는 望虚社다. 직군별 인원, 경력 구성, 고용 형태는 **미확인**이다. [보도](https://diershoubing.com/en/news/140368/downfall-of-yellow-sky-2m-trailer-views-steam/), [공식 상점](https://store.steampowered.com/app/5024530/?l=schinese)
- **도구 — 미확인.** 엔진·버전, DCC, 버전 관리, 작업 관리 도구를 이번에 열람한 공식 상점과 기사에서 확정하지 못했다. 영상 외형으로 Unity·Unreal 사용을 추정하지 않는다. [확인 범위: 공식 상점](https://store.steampowered.com/app/5024530/?l=schinese), [소개 기사](https://diershoubing.com/en/news/140368/downfall-of-yellow-sky-2m-trailer-views-steam/)
- **외주 비율 — 미확인.** 게임 제작을 외부에 맡긴 금액·시간·에셋 수 비율은 확인하지 못했다. **[사실: 보도 재전달]** Q&A 소개 기사는 당시 외부 투자 없이 개발하고 있다고 전한다. 외부 투자금이 없다는 진술은 제작비·외주비가 0이라는 뜻이 아니다. 실제 계약·회계 자료는 미확인이다. [Q&A를 전한 기사](https://www.gamersky.com/news/202607/2177567.shtml)
- **에셋 전략 — 미확인.** 소개 기사는 수작업 제작이라고 홍보하지만, 자작·구매 자산 목록이나 생성형 AI 사용 여부를 검증할 제작 자료는 확보하지 못했다. 따라서 자작 100%·구매 0%·AI 0%로 환산하지 않는다. [홍보 표현의 출처](https://diershoubing.com/en/news/140368/downfall-of-yellow-sky-2m-trailer-views-steam/)
- **하루·주 리듬 — 미확인.** 매일 회의 시간, 주당 콘텐츠 납품 수, 스프린트 길이는 미확인이다. 공개 데모를 매체에 보내고 플레이 피드백을 받은 과정은 기사로 확인되지만, 이것이 정례 주간 테스트였는지는 알 수 없다. [데모·피드백 경위](https://diershoubing.com/en/news/140368/downfall-of-yellow-sky-2m-trailer-views-steam/)
- **어려움·방향 변경 — [사실: 보도 재전달].** 2026-07-26 Q&A 보도는 순수 로그라이크 구상에서 ARPG 중심＋로그라이크 무작위 요소로 방향을 조정했고, 당시 정식 완성까지 최소 1년 이상 남았다고 전한다. 앞의 ‘데모 이후 1년’과 합쳐 총개발기간을 확정할 수 없다. 공개 상점도 아직 미출시다. [Q&A 보도](https://www.gamersky.com/news/202607/2177567.shtml), [공식 상태](https://store.steampowered.com/app/5024530/?l=schinese)

**[추정] 가져올 관찰점.** 홍보의 인원·무투자 표현과 실제 제작비·납기는 따로 검증해야 한다. 이 팀의 미출시 영상·홍보 기사로 ‘11인이 상용 ARPG를 1년 만에 완성했다’는 결론이나 AI 절감률을 만들 수 없다. [해석 근거: 자금·남은 일정의 보도](https://www.gamersky.com/news/202607/2177567.shtml), [미출시 공식 페이지](https://store.steampowered.com/app/5024530/?l=schinese)

## 4. Death’s Door: 핵심 제작자가 수정 왕복을 소유했다

- **팀 구성 — [사실].** 핵심 두 사람은 프로그래밍·디자인·디렉션과 음악·사운드·프로듀싱·디렉션을 겸했다. 아트 디렉터를 포함한 아트 팀과 각본 협력도 있었다. ‘두 명이 전부 제작’한 사례로 취급하지 않는다. [역할·각본 인터뷰](https://www.escapistmagazine.com/deaths-door-interview-acid-nerve-mark-foster-david-fenn/), [아트 협업 인터뷰](https://press-start.com.au/features/2021/03/27/we-spoke-to-the-team-at-acid-nerve-about-the-stylish-looking-deaths-door/)
- **도구와 작업 단위 — [사실].** 애니메이션 담당자의 설명은 Blender에서 거친 동작을 만들고 Unity로 내보내 확인한 뒤 다시 수정하는 흐름이다. 천 등에는 Unity Store 도구 Dynamic Bone을 더하기도 했다. 사용 엔진·도구의 당시 세부 버전과 우리 Unity 6000에서의 호환성은 **미확인**이다. [담당자 직접 인터뷰](https://www.gamedeveloper.com/art/animation-feature)
- **외주 비율 — 미확인.** 외부 애니메이터를 활용한 초기 시도와 외부 협력 존재는 확인되지만, 전체 예산·공수·에셋 수의 분모가 없다. 외부 기여 인원만으로 외주율을 계산하지 않는다. [확인 범위: 초기 협업 설명](https://www.escapistmagazine.com/deaths-door-interview-acid-nerve-mark-foster-david-fenn/)
- **에셋 전략 — [사실].** 완성도 높은 외부 애니메이션의 전달 방식이 팀의 빠른 반복에 맞지 않자, 핵심 개발자가 리깅·애니메이션을 배워 직접 시제품을 만들었다. 음악 테마를 일찍 만들어 아트 제작에 제공했고, 아트가 새 음악을 유도하기도 했다. 구매는 앞의 보조 도구 사용만 확인되며 상용 모델·텍스처 비중과 생성형 AI 사용 여부는 **미확인**이다. [내부 제작 전환·음악과 아트](https://www.escapistmagazine.com/deaths-door-interview-acid-nerve-mark-foster-david-fenn/), [보조 도구](https://www.gamedeveloper.com/art/animation-feature)
- **하루·주 리듬 — 미확인.** Blender→Unity 확인→수정이라는 반복 순서는 확인된다. 그러나 하루에 몇 동작을 만들었는지, 주간 빌드·정례 회의가 있었는지는 미확인이다. ‘빠른 반복’이라는 진술을 일일 생산량으로 환산하지 않는다. [반복 순서의 출처](https://www.gamedeveloper.com/art/animation-feature)
- **실패담 — [사실].** 초기 외부 애니메이션은 팀이 익숙한 속도보다 느렸고, 동작 사이 세부 연결을 제작자가 직접 통제할 필요가 있었다. 이는 외부 결과물의 품질 불량이라는 설명이 아니라 **게임 조정과 애니메이션 수정의 왕복이 맞지 않았던 문제**다. [속도 문제 인터뷰](https://www.escapistmagazine.com/deaths-door-interview-acid-nerve-mark-foster-david-fenn/), [통제 필요성 설명](https://www.gamedeveloper.com/art/animation-feature)

**[추정] 적용 의미.** 타격 타이밍이 계속 바뀌는 동작은 내부에서 편집 가능한 원본과 빠른 게임 반영이 우선이다. 외주를 줄이는 것 자체보다 ‘다음 수정에 누구의 회신을 기다리는가’를 줄이는 판단으로 읽는 편이 타당하다. 이것이 전체 개발기간을 2년으로 줄였다는 증거는 없다. [해석 근거: 반복의 병목](https://www.escapistmagazine.com/deaths-door-interview-acid-nerve-mark-foster-david-fenn/), [3년 반 전업 개발 진술](https://press-start.com.au/features/2021/03/27/we-spoke-to-the-team-at-acid-nerve-about-the-stylish-looking-deaths-door/)

## 5. Hades 초기: 월간 변경 창과 안정화 창

- **팀 구성 — [사실].** 2019년 인터뷰에서 글·디자인, 아트 방향·캐릭터 디자인, 음악·효과음·일부 음성의 담당 분화를 확인할 수 있다. 출시 직후 AMA에는 스튜디오 운영·엔지니어링·환경 아트 등의 역할도 나온다. 초기의 정확한 직군별 인원은 **미확인**이며, Bastion 시절 7인을 Hades 인원으로 쓰면 안 된다. [초기 제작자 인터뷰](https://www.gamedeveloper.com/design/supergiant-s-fourth-outing-i-hades-i-introduces-a-more-mature-organized-dev-process), [2020 팀 AMA](https://www.reddit.com/r/NintendoSwitch/comments/ixri6b/we_are_supergiant_games_creators_of_hades_pyre/)
- **도구 — [사실].** 제작자는 자체 기술·도구를 사용한다고 설명했고, 2019년 인터뷰는 대사·음성·서사 이벤트를 데이터로 추가·변경해 기반 코드를 흔들지 않는 방식을 설명한다. 초기 DCC 제품·버전, 작업 보드, 버전 관리 제품은 이번 자료로 **미확인**이다. [자체 기술 설명](https://www.reddit.com/r/NintendoSwitch/comments/ixri6b/we_are_supergiant_games_creators_of_hades_pyre/), [데이터와 코드의 변경 구분](https://www.gamedeveloper.com/design/supergiant-s-fourth-outing-i-hades-i-introduces-a-more-mature-organized-dev-process)
- **외주 비율 — 미확인.** 공개된 팀 역할 소개와 제작 과정 인터뷰에는 예산·작업시간 기준의 전체 외주 비중이 없다. 내부 작곡·음성 참여가 확인된다는 이유로 모든 음성·QA·이식이 내부 작업이었다고 확장하지 않는다. [확인 범위: 역할 소개](https://www.reddit.com/r/NintendoSwitch/comments/ixri6b/we_are_supergiant_games_creators_of_hades_pyre/), [초기 인터뷰](https://www.gamedeveloper.com/design/supergiant-s-fourth-outing-i-hades-i-introduces-a-more-mature-organized-dev-process)
- **에셋 전략 — [사실].** 2019-12 개발자 답변에 따르면 다수 캐릭터는 3D 애니메이션을 여러 방향의 프레임으로 렌더했고, 배경 대부분과 초상화는 손으로 그렸다. 이는 **렌더링으로 프레임을 생성**한다는 뜻이다. 생성형 AI 사용, 구매 에셋의 유무·비율은 **미확인**이다. 이 문서에서는 표현 기법의 설정값 대신 담당 작업이 여러 단계에 걸친다는 점만 남긴다. [개발자 직접 답변](https://steamcommunity.com/app/1145360/discussions/0/1738883810796606862/)
- **하루·주 리듬 — 일부 미확인. [사실]** 2019-01 진술은 **월간 마일스톤**이다. 초반에는 큰 코드 변경, 이후 코드 잠금과 데이터 조정, 후반에는 테스트·수정·다듬기, 끝에는 플레이테스트를 했다. 기존의 더 긴 마일스톤에서 바뀐 방식이라고 설명한다. 일일 회의·주별 정확한 배분은 **미확인**이며 월간 주기를 임의로 ‘매주 출시’로 바꾸지 않는다. [How Early Access changed the game dev process 절](https://www.gamedeveloper.com/design/supergiant-s-fourth-outing-i-hades-i-introduces-a-more-mature-organized-dev-process)
- **실패·운영 부담 — [사실].** 초기에는 신속한 패치를 위해 한 플랫폼에 집중했다. **[사실: 2020 회고·출시 대응]** 자체 기술을 다른 플랫폼으로 옮기는 작업은 어려웠고 Switch 지원에도 큰 기술 변경이 필요했다. 출시 직후 AMA에는 Switch 저장 데이터 로드 문제와 패치 대응도 남아 있다. 작은 팀의 EA가 이식·지원 비용을 없앤 사례가 아니다. [초기 플랫폼 제한 이유](https://www.gamedeveloper.com/design/supergiant-s-fourth-outing-i-hades-i-introduces-a-more-mature-organized-dev-process), [이식과 저장 문제의 직접 답변](https://www.reddit.com/r/NintendoSwitch/comments/ixri6b/we_are_supergiant_games_creators_of_hades_pyre/)

**[추정] 적용 의미.** 월 단위의 ‘변경 허용→변경 제한→통합 확인’ 구조는 참고할 수 있다. 하지만 2019년의 20인 미만이라는 상한만으로 초기 10인 이하를 입증할 수 없으며, EA까지 약 16∼17개월이라는 계산도 v1.0 완성 일정이 아니다. [해석 근거: 초기 인원·주기](https://www.gamedeveloper.com/design/supergiant-s-fourth-outing-i-hades-i-introduces-a-more-mature-organized-dev-process), [실제 출시 단계](https://www.supergiantgames.com/blog/hades-faq/)

## 6. Blasphemous: 제작법을 시험한 뒤에도 증원과 범위 조정이 필요했다

- **팀 구성 — [사실].** 2019-06 제작자는 사내 약 10인과 음악 등 외부 협력자를 설명했다. 출시 AMA의 아티스트 9인은 콘셉트·애니메이션·컷신·배경을 아우르는 기여자 수다. 시점·분모가 다른 이 숫자들을 더하거나 빼서 상근·외주 인원을 만들 수 없다. [제작자 인터뷰](https://indielight.co.uk/2019/06/18/interview-with-mauricio-garcia-the-last-door/), [엔진·아트 인원에 대한 팀 답변](https://www.reddit.com/r/NintendoSwitch/comments/d2af0j)
- **도구 — [사실].** 팀 AMA에서 Unity 사용을 확인했다. 공식 제작 업데이트에는 작업 관리 도구 HackNPlan이 나온다. 레벨 디자이너 인터뷰는 화이트보드에서 Photoshop 지도로 발전시키며 지름길을 설계한 과정을 설명한다. 전사 공통 DCC 목록·당시 엔진 버전은 **미확인**이다. [팀 AMA](https://www.reddit.com/r/NintendoSwitch/comments/d2af0j), [2018-08-10 제작 업데이트](https://blasphemous.backerkit.com/hosted_preorders/project_updates?page=4), [레벨 담당자 인터뷰](https://www.gamedeveloper.com/design/how-i-blasphemous-i-level-design-iterates-on-classic-metroidvanias)
- **외주 비율 — 미확인.** 외부 음악 협력과 아트 인력 보강은 확인되지만, 보강 인원의 계약 형태·비용·투입 시간은 확인하지 못했다. 프리랜서·상근·퍼블리셔 업무를 크레딧 수만으로 나눌 수 없다. [외부 협력 설명](https://indielight.co.uk/2019/06/18/interview-with-mauricio-garcia-the-last-door/), [아트 보강 기록](https://blasphemous.backerkit.com/hosted_preorders/project_updates?page=4)
- **에셋 전략 — [사실].** 제작팀은 시제품에서 재료별 제작 방법과 필요한 양을 확인하고, 본제작에서 콘셉트·캐릭터 동작·배경 아트를 보강했다. 자체 수작업 픽셀 아트 제작은 확인되지만 구매 자산의 전체 비중과 생성형 AI 사용 여부는 **미확인**이다. [팀 제작 기록, Pre-Production·reinforcements 절](https://blasphemous.backerkit.com/hosted_preorders/project_updates?page=4)
- **하루·주 리듬 — [사실].** 2018-08-10 기록은 기능·콘텐츠 종류와 양을 정한 뒤 요구사항을 쓰고, 일부 요구사항을 **2주 스프린트 시작 때 묶어서** 구체화했다고 설명한다. 새로운 적·보스·장소의 주간 반영과 일일 새 콘텐츠도 보고했다. 다만 팀 자기보고이며 작업시간·개수·승인률의 실측표는 아니다. 일일 회의 방식은 **미확인**이다. [동일 공식 기록, planning·Going against the clock 절](https://blasphemous.backerkit.com/hosted_preorders/project_updates?page=4)
- **실패담 — [사실].** 2019-02-27 기록은 큰 스프라이트 애니메이션의 제작 부담 때문에 특히 아트 팀을 크게 늘리고 추가 자금을 찾았으며, 일부 약속 콘텐츠를 출시 후로 미뤘다고 설명한다. 예상 출시 창도 Q4 2018→Q1 2019→그 이후로 변했다. 레벨 디자이너는 다른 상호작용 수단이 없어 레버를 과용했고, 이후 부술 수 있는 물체 등으로 수정했다고 회고한다. [일정·증원·범위 조정의 공식 기록](https://blasphemous.backerkit.com/hosted_preorders/project_updates?page=3), [레버 반복 문제](https://www.gamedeveloper.com/design/how-i-blasphemous-i-level-design-iterates-on-classic-metroidvanias)

**[추정] 적용 의미.** 스프린트가 있다는 사실보다, ‘콘텐츠 종류×양×만드는 비용’을 먼저 정한 흐름을 가져올 만하다. 시제품을 통과했더라도 대형 고유 애니메이션과 약속한 추가 콘텐츠가 병목을 다시 만들 수 있다. 이 사례는 2주 스프린트가 2년 출시를 보장한다는 증거가 아니다. [해석 근거: 제작 계획](https://blasphemous.backerkit.com/hosted_preorders/project_updates?page=4), [이후 증원·연기](https://blasphemous.backerkit.com/hosted_preorders/project_updates?page=3)

## 7. Titan Souls: 작은 범위도 시제품 생산량으로 예측할 수 없었다

- **팀 구성 — [사실].** 핵심 3인은 프로그래밍·디자인, 아트, 음악·사운드를 나누었다. Devolver와 정식판 제작을 진행했다. 퍼블리셔 지원의 전체 인력·공수는 **미확인**이다. [제작진 인터뷰](https://gamecloud.net.au/features/interviews/titan-souls-developer-interview-with-andrew-gleeson), [개발자 기고](https://blog.playstation.com/archive/2015/04/02/titan-souls-game-jam-playstation-store/)
- **도구 — [사실].** 원격으로 각자 집에서 작업하며 Skype 대화로 아이디어·수정을 주고받았다. 정식판은 엔진을 다시 만들었다고 제작자가 밝혔다. 이 자료만으로 엔진 제품·DCC·버전 관리 도구를 특정하는 것은 **미확인**으로 둔다. [원격 협업 인터뷰](https://www.avforums.com/articles/titan-souls-interview-with-acid-nerve.10838/), [엔진 재제작 진술](https://blog.playstation.com/archive/2015/04/02/titan-souls-game-jam-playstation-store/)
- **외주 비율 — 미확인.** 퍼블리셔 협력은 확인되지만 콘텐츠 외주·QA·이식의 시간·금액 비중은 확인되지 않았다. 핵심 3인이라는 숫자를 외주 0%로 바꾸지 않는다. [확인 범위: 개발자 기고](https://blog.playstation.com/archive/2015/04/02/titan-souls-game-jam-playstation-store/)
- **에셋 전략 — [사실].** 게임잼의 핵심 규칙을 유지하면서도 정식판의 엔진·아트·애니메이션·음악은 처음부터 다시 제작했다고 설명한다. 시제품 자산을 그대로 늘린 일정이 아니다. 구매 자산과 생성형 AI 사용 여부는 **미확인**이다. [제작자의 시제품·정식판 비교](https://blog.playstation.com/archive/2015/04/02/titan-souls-game-jam-playstation-store/)
- **하루·주 리듬 — 일부 미확인. [사실]** 보스를 하나씩 만들고 플레이테스트 뒤 기존 보스를 다시 조정했다. 원격 대화는 작업 중 계속 이루어졌다고 설명한다. 고정 주간 스프린트·일일 회의·주당 보스 생산량은 **미확인**이다. 게임잼 때 하루에 보스 둘을 만든 경험은 정식판 생산속도와 구분해야 한다. [제작 순서·게임잼 대비 설명](https://www.avforums.com/articles/titan-souls-interview-with-acid-nerve.10838/)
- **실패담 — [사실].** 시제품 보스가 재미없거나 지나치게 어려워 폐기·수정된 사례를 설명한다. 서로 다른 보스를 늘리면서 고유성과 조정 부담도 커졌다. 출시 직전에는 짧은 기간에 많은 일을 압축했다는 제작자 평가도 있었다. 이는 실측한 ‘생산성 2배’ 수치가 아니다. [폐기·난도·확장 부담](https://www.avforums.com/articles/titan-souls-interview-with-acid-nerve.10838/), [2015-03-24 제작자 평가](https://www.gamereactor.eu/titan-souls-is-two-years-worth-of-work-done-in-one/)

**[추정] 적용 의미.** 이 사례의 짧은 달력 일정을 참고하려면 ‘보스 하나가 실제로 성립하는지’부터 반복 확인해야 한다. 보스 중심의 제한된 핵심 규칙을 장비·전리품·다중 캐릭터가 있는 ARPG 전체의 일정 근거로 확대해서는 안 된다. [해석 근거: 보스 중심 규칙과 재제작 범위](https://blog.playstation.com/archive/2015/04/02/titan-souls-game-jam-playstation-store/), [보스별 폐기·반복](https://www.avforums.com/articles/titan-souls-interview-with-acid-nerve.10838/)

## 8. 우리 팀을 위한 운영안 — 전부 [추정]

다음은 위 팀들의 실제 운영법을 복제한 규칙이 아니라 **데모 v0를 위한 제안**이다. 날짜·시간·인원 배분은 검증 전 초깃값이다. Unity 6000에서의 적용 효과, AI의 속도·비용 절감 배수, 2년 내 정식 출시 가능성은 아직 미확인이다. [일정 일반화를 제한하는 근거: Death’s Door의 장기 전업 개발](https://press-start.com.au/features/2021/03/27/we-spoke-to-the-team-at-acid-nerve-about-the-stylish-looking-deaths-door/), [Blasphemous의 추가 자금·범위 조정](https://blasphemous.backerkit.com/hosted_preorders/project_updates?page=3)

### 8.1 분업: 사람의 승인 지점과 에이전트 산출물을 연결

- **[추정]** 실제 인원이 적으면 겸임하되, 제품·범위 결정 / 전투·게임 통합 / 아트·애니메이션 / QA·릴리스 책임을 명시한다. 특히 ‘수정할 사람’과 ‘통과 판정할 사람’을 작업마다 적는다. AI 에이전트는 승인된 범위의 코드·도구·문서·반복 변환·로그 요약을 맡고, 재미·타격감·화면 품질·세이브 안전의 최종 판단은 사람이 한다. 이는 조사 사례에서 AI가 이렇게 일했다는 주장이 아니다. [역할 겸임의 근거: Death’s Door](https://www.escapistmagazine.com/deaths-door-interview-acid-nerve-mark-foster-david-fenn/), [전문 역할 분화의 근거: Hades 팀 AMA](https://www.reddit.com/r/NintendoSwitch/comments/ixri6b/we_are_supergiant_games_creators_of_hades_pyre/)
- **[추정]** 에이전트 과제 한 개는 소유 파일, 입력·출력 형식, 금지 범위, 확인할 게임 장면, 인수 조건을 가진다. 같은 씬·프리팹·데이터의 동시 편집은 피하고, 통합 담당자가 순서를 정한다. 병렬 과제 수는 사람의 검수·통합 처리량을 넘기지 않는다. 수치 상한은 첫 주 실측 뒤 정한다. [해석 근거: 외부 전달의 왕복 병목](https://www.escapistmagazine.com/deaths-door-interview-acid-nerve-mark-foster-david-fenn/), [요구사항을 묶어 정한 제작 계획](https://blasphemous.backerkit.com/hosted_preorders/project_updates?page=4)

### 8.2 데모 v0: 종류와 양을 먼저 잠근다

- **[추정]** 첫 범위 초안은 기존 캐릭터 1종, 대표 일반전 1구간, 보스 1전, 보상·성장 선택 1회, 사망→재도전, 저장→재개가 이어지는 짧은 플레이로 잡는다. 새 지역·캐릭터·장비 종류 확장은 이 흐름의 Mac 판정 뒤 검토한다. 이는 전체 제품 스펙 변경안이 아니라 총괄이 승인할 수 있는 **검증 구간 제안**이다. [근거: 보스 단위 시험·폐기](https://www.avforums.com/articles/titan-souls-interview-with-acid-nerve.10838/), [메커니즘 시험 뒤 콘텐츠 양 결정](https://blasphemous.backerkit.com/hosted_preorders/project_updates?page=4)
- **[추정]** 보드에는 모델·코드·문서 완료 수 대신 ‘게임에서 판정받은 전투 구간·적 동작·보상 연결’을 적는다. 아이템 수보다 고유 애니메이션·새 규칙·상호작용 종류의 증가를 먼저 검토한다. 임시 에셋으로 성립을 확인하고, 통과한 것만 최종 자산 제작에 보낸다. [근거: 고유 보스가 늘며 커진 부담](https://www.avforums.com/articles/titan-souls-interview-with-acid-nerve.10838/), [대형 애니메이션 병목](https://blasphemous.backerkit.com/hosted_preorders/project_updates?page=3)

### 8.3 에셋: 생성·구매·직접 제작을 같은 인수 기준으로 비교

- **[추정]** 전투 판정·리깅·핵심 동작은 내부 수정 가능한 원본을 확보한다. 외부 발주는 규격이 잠긴 환경 소품·음악·음성 등부터 검토하되, 첫 납품 한 건의 수정 왕복과 실제 게임 반영 시간을 재고 확대 여부를 정한다. 외주율 목표값은 두지 않는다. [근거: Death’s Door의 애니메이션 수정 통제와 음악·아트 협업](https://www.escapistmagazine.com/deaths-door-interview-acid-nerve-mark-foster-david-fenn/)
- **[추정]** 생성·구매·직접 제작 후보마다 출처 URL·사용권 근거·편집 가능한 원본·Unity 6000 반영 담당·수정 시간·게임 판정을 기록한다. 이미 생성한 파일도 리깅·타이밍·가독성 확인 전에는 채택으로 세지 않는다. 구매 도구의 과거 사용 사례가 현재 호환성을 보증하지 않으므로, 이번 조사에서 새 구매·생성을 실행하지 않는다. [근거: 보조 도구를 포함한 Blender→Unity 반복](https://www.gamedeveloper.com/art/animation-feature), [시제품 자산의 정식판 재제작](https://blog.playstation.com/archive/2015/04/02/titan-souls-game-jam-playstation-store/)

### 8.4 하루·주·2주 리듬: 첫 운영 실험

| 주기 | [추정] 제안하는 행동과 통과 기준 | 해석 근거 URL |
|---|---|---|
| 하루 시작 | 각 담당자가 오늘 게임에 들어갈 결과 1개와 막힌 의존성만 짧게 공유한다. 미판정 결과가 쌓이면 새 에셋 생성을 줄인다. ‘1개’는 시간당 생산성 약속이 아니라 작업 묶음의 초깃값이다. | [보스 단위 반복](https://www.avforums.com/articles/titan-souls-interview-with-acid-nerve.10838/) |
| 하루 작업 | 기존 Unity 6000 프로젝트에서 담당 범위만 직접 수정한다. PC 컴파일 성공·실패와 소스 기준을 인계하되, 컴파일 통과를 제품 PASS로 쓰지 않는다. | [실제 엔진에 넣고 다시 수정한 흐름](https://www.gamedeveloper.com/art/animation-feature) |
| 주 전반 | 전투 동작·보상·데이터 등 새 변경을 반영하고, 이번 주 데모 구간에 꼭 필요한 연결부터 통합한다. 에이전트 작업도 같은 구간으로 돌아오게 한다. | [코드 변경 단계와 데이터 조정 단계](https://www.gamedeveloper.com/design/supergiant-s-fourth-outing-i-hades-i-introduces-a-more-mature-organized-dev-process) |
| 주 후반 | 새 기능 추가를 제한하고 Mac에서 같은 소스 기준의 빌드·자연 플레이를 판정한다. 일반전→보스→보상→재도전→저장·재개를 확인하고, 실제 게임 카메라의 1x 화면·핵심 로그·결함을 남긴다. PC 결과와 Mac 판정의 소스가 다르면 인계를 다시 맞춘다. | [마일스톤 후반 테스트·수정·플레이테스트](https://www.gamedeveloper.com/design/supergiant-s-fourth-outing-i-hades-i-introduces-a-more-mature-organized-dev-process) |
| 2주 종료 | 승인된 콘텐츠 묶음과 미통과 항목을 비교한다. 같은 병목이 이어지면 담당·제작법·범위를 바꾸고, 단순히 생성량이나 동시 과제를 늘리지 않는다. 다음 묶음의 종류·양을 다시 정한다. | [2주 요구사항 구체화](https://blasphemous.backerkit.com/hosted_preorders/project_updates?page=4), [외부 동작 제작 방식의 전환](https://www.escapistmagazine.com/deaths-door-interview-acid-nerve-mark-foster-david-fenn/) |

**[추정] 주의.** 주간 통합과 2주 범위 회고의 결합은 우리 제안이다. Hades가 실제 주간 단위로 PC 컴파일·Mac 판정을 했다는 뜻도, Blasphemous가 이 표대로 일했다는 뜻도 아니다. [실제 확인한 Hades 주기는 월간](https://www.gamedeveloper.com/design/supergiant-s-fourth-outing-i-hades-i-introduces-a-more-mature-organized-dev-process), [실제 확인한 Blasphemous 주기는 2주 스프린트](https://blasphemous.backerkit.com/hosted_preorders/project_updates?page=4)

### 8.5 2년 일정은 승인 속도를 재고 다시 추정

- **[추정]** 첫 2주에는 처음 제작 시간, 게임 반영 시간, 수정 시간, 검수 대기시간을 나누어 잰다. 신규 파일 수·AI 응답 수·생성 이미지 수를 생산성 지표로 쓰지 않는다. 생성·구매·외주를 쓰더라도 통과 전 수정 공수를 포함해야 한다. [근거: 빠른 시제품과 정식판 작업의 차이](https://www.avforums.com/articles/titan-souls-interview-with-acid-nerve.10838/), [외부 전달 속도의 문제](https://www.escapistmagazine.com/deaths-door-interview-acid-nerve-mark-foster-david-fenn/)
- **[추정]** 다음 회고에서는 남은 고유 콘텐츠 수×실측 승인 소요시간에 통합·QA·재작업·이식·출시 지원을 별도로 놓고 일정을 다시 계산한다. 동시 작업의 겹침과 병목을 보정하기 전에는 단순 합을 출시일로 발표하지 않는다. v0 통과 전 2년 완성을 약속하지 않고, 초과 전망이면 범위 축소 또는 일정 변경을 총괄이 결정한다. [근거: Blasphemous의 증원·추가 자금·출시 후 이월](https://blasphemous.backerkit.com/hosted_preorders/project_updates?page=3), [Hades의 이식·출시 지원 부담](https://www.reddit.com/r/NintendoSwitch/comments/ixri6b/we_are_supergiant_games_creators_of_hades_pyre/)

## 9. 한계와 추가 확인 대상

- **[추정: 생존 편향]** 유명 출시작을 중심으로 골랐으므로 같은 규모로 시작했다가 취소·폐업·장기 보류된 팀의 분모가 없다. 미출시 Downfall을 포함해도 대조군이 생기는 것은 아니다. 이 표본으로 성공 확률·평균 공수·2년 달성률을 계산할 수 없다. [선정 자료의 상태: 출시작 Hades](https://www.supergiantgames.com/blog/hades-faq/), [미출시 Downfall](https://store.steampowered.com/app/5024530/?l=schinese)
- **[추정: 공개 자료의 편향]** 개발자 인터뷰·공식 후원자 업데이트·상점 설명은 제작자가 선택해 공개한 자료다. 마케팅, 회고의 기억, 후원자 설명이라는 목적 때문에 실제 재작업·업무시간·실패의 모든 내역을 대표하지 않을 수 있다. 주간 콘텐츠 추가 보고를 감사된 생산량으로 읽지 않는다. [자료 성격: 후원자 제작 업데이트](https://blasphemous.backerkit.com/hosted_preorders/project_updates?page=4), [홍보 기사](https://diershoubing.com/en/news/140368/downfall-of-yellow-sky-2m-trailer-views-steam/)
- **미확인: 공통 분모.** 전 기간 직군별 피크·상근 환산 인원, 외주 계약·금액·공수 비율, 구매 자산 명세, 생성형 AI 사용 여부, 자산별 실측 시간은 확보하지 못했다. 서로 다른 정의의 인원·기간을 곱해 비용이나 AI 절감률을 만들지 않는다. [확인 자료 예: 핵심·외부 협업 인터뷰](https://www.escapistmagazine.com/deaths-door-interview-acid-nerve-mark-foster-david-fenn/), [사내·외부 인원 진술](https://indielight.co.uk/2019/06/18/interview-with-mauricio-garcia-the-last-door/)
- **[사실: 열람 한계]** Downfall 소개 기사에서 연결한 Bilibili 관련 영상은 접근이 제한됐다. 공식 Q&A도 원 영상을 직접 검증하지 못했고 보도 본문만 확인했으므로, 해당 내용은 보도 재전달로 표시했다. Unity의 과거 Death’s Door 환경 제작 블로그 링크는 접근에 실패했으므로 도구 목록의 근거로 사용하지 않았다. 영상·유료 발표 전체를 시청한 것으로 취급하지 않는다. [접근 제한된 관련 영상 링크](https://www.bilibili.com/video/BV18ZgH6uEGQ/), [Q&A 보도](https://www.gamersky.com/news/202607/2177567.shtml), [과거 Unity 링크](https://blog.unity.com/games/crafting-intricate-environments-deaths-door)
- **[추정: 적용 한계]** 이 자료는 Unity 6000·AI 에이전트 조합의 생산성을 검증한 연구가 아니다. 과거 사용 도구를 현재 프로젝트에 도입할 때의 호환성·유지비·학습비는 별도 검증 대상이다. 사람 검수와 통합이 병목이면 에이전트 수를 늘려도 완성 속도가 늘지 않을 수 있다. [해석 근거: 전달·수정의 병목](https://www.escapistmagazine.com/deaths-door-interview-acid-nerve-mark-foster-david-fenn/), [자체 기술의 플랫폼 부담](https://www.reddit.com/r/NintendoSwitch/comments/ixri6b/we_are_supergiant_games_creators_of_hades_pyre/)

조사 기록: 공개 웹 본문만 열람했다. 직접 인용은 사용하지 않았다(인용 15단어 이내 조건 충족). 개인 연락처·주소·가족 정보·비공개 계정 정보는 수집·기록하지 않았다. 게임·영상·에셋·PDF 파일 다운로드, 로그인, 유료 서비스, Python, Unity 실행은 하지 않았다. 지정 연구 파일만 작성했으며 커밋·push는 총괄 검토 대상으로 남긴다.
