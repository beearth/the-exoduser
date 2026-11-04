# 소규모 팀의 3D→픽셀·HD-2D·2.5D 제작 현실

조사일: 2026-11-05. 조사 범위: 공개 웹 문서와 개발자 인터뷰. 목적: 표현 기법의 설정값이 아니라 인력 배분, 반복 제작, 일정, 포기한 작업과 범위 축소를 검토한다. 이미지·게임·에셋은 수집하지 않았다.

## 1. 읽는 기준

- **[사실]**은 연결한 자료에서 확인한 내용이다. 개발자의 경험·평가는 해당 개발자의 진술로 한정한다. **[추정]**은 자료를 바탕으로 한 이 문서의 해석·적용 제안이며, 해당 팀이 실제로 그렇게 운영했다는 뜻이 아니다.
- **미확인**은 이번에 열람한 자료로 확인하지 못했다는 뜻이다. 비공개라고 단정하지 않는다. 총제작비, 외주 단가, 전 기간 상근 환산 인원, 자산당 실측 시간은 확보하지 못했으므로 절감률·인월·손익분기점을 계산하지 않는다.

## 2. 비교 범위와 확인한 수치

| 사례 | 인력: 전체 기여자 수와 구분 | 일정: 다른 단계끼리 합산하지 않음 |
|---|---|---|
| Dead Cells | [사실] 아트 1인→2인. 2019년 운영 전환 당시 핵심 팀 8인. | [사실] GDC 2019 자료는 개발 2.5년으로 소개. 포함 단계는 미확인. [제작기](https://www.gamedeveloper.com/production/art-design-deep-dive-using-a-3d-pipeline-for-2d-animation-in-i-dead-cells-i-), [FAQ](https://motiontwin.com/faq), [GDC](https://media.gdcvault.com/gdc2019/presentations/Benard-Sebastian-DeepCells.pdf) |
| A Short Hike | [사실] 대부분 1인이 담당, 별도 음악 제작자 참여. | [사실] 첫 출시 기한 4개월, Steam 출시를 위해 추가 4~5개월이라고 회고. [개발자 기고](https://blog.playstation.com/2021/08/05/crafting-a-tiny-open-world-a-look-behind-the-scenes-at-the-creation-of-a-short-hike/), [기한](https://www.gdcvault.com/play/1026613/), [후속 작업](https://mcvuk.com/business-news/the-first-time-somebody-was-reading-the-dialogue-i-had-to-leave-the-room-i-was-too-embarrassed-how-adamgryu-overcame-writers-block-and-creative-burnout-in-the-development-of-a-short/) |
| Cassette Beasts | [사실] 상근 핵심 2인＋외부 협력. | [사실] 2023년 4월 출시 전 AMA 기준 3년 넘게 제작. 정확한 전업 기간 미확인. [AMA](https://www.reddit.com/r/JRPG/comments/12kobbo/), [외부 기여](https://www.pockettactics.com/cassette-beasts/interview) |
| Eastward | [사실] 2015년 3인, 출시 후 AMA에서 10인까지 성장했다고 설명. | [사실] 2015년 개발 시작, 2021년 출시 후 AMA 확인. 실투입 인월 미확인. [초기 글](https://www.indiedb.com/games/eastward/news/we-are-making-eastward1), [AMA](https://www.reddit.com/r/NintendoSwitch/comments/pyh9vo/) |
| Prodeus | [사실] 2019년 인터뷰의 핵심 2인. 출시 전체 인원 미확인. | [사실] 당시 계획은 2019년 EA·2020년 정식. 실제 정식 출시는 2022-09-23. [인터뷰 기사](https://www.famitsu.com/news/201904/11174603.html), [공식 출시일](https://store.steampowered.com/app/964800/Prodeus/) |
| Octopath Traveler: 규모 비교용 | [사실] 피크 프로그래머 6인. 전체 팀 인원은 미확인. | [사실] 2018년 출시. 총개발기간 미확인. [인원·도구](https://www.unrealengine.com/spotlights/octopath-traveler-s-hd-2d-art-style-and-story-make-for-a-jrpg-dream-come-true), [출시연도](https://www.unrealengine.com/developer-interviews/octopath-traveler-ii-builds-a-bigger-bolder-world-in-its-stunning-hd-2d-style?lang=en-US) |
## 3. Dead Cells: 원화보다 ‘다시 고치는 비용’을 줄였다

**[사실] 제작 흐름.** 2D 모델 시트 → 3ds Max의 단순 모델·뼈대 → FBX → 자체 저해상도 렌더 도구 → 애니메이션 프레임 PNG와 노멀 맵 출력이다. 무기 타이밍이 바뀌면 키프레임과 포즈를 수정했고, 다른 적을 만들 때 기존 모델 요소와 애니메이션을 재사용했다. [아티스트 직접 제작기, What·Result 절](https://www.gamedeveloper.com/production/art-design-deep-dive-using-a-3d-pipeline-for-2d-animation-in-i-dead-cells-i-)

**[사실] 실패한 방식과 감수한 한계.** 선행 프로토타입 ScarKrow에서 Flash 수작업 애니메이션은 속도와 결과에 문제가 있었고, 그림자를 프레임마다 그리는 작업도 부담이었다. Dead Cells에서도 픽셀 깜빡임을 해결하지 못했지만 수작업 보정보다 제작 속도와 애니메이션을 우선했다. 모든 프레임의 완벽한 정리를 목표로 삼지 않은 선택이다. [같은 제작기, Why·Result 절](https://www.gamedeveloper.com/production/art-design-deep-dive-using-a-3d-pipeline-for-2d-animation-in-i-dead-cells-i-)

**[사실] 운영 범위 축소.** 공식 FAQ에 따르면 2019년 팀은 8인이었고, 증원하거나 내부를 후속작·라이브 운영으로 나누는 대신 Evil Empire와 협업했다. 이는 초기 스프라이트 제작비가 저렴했다는 증거와는 별개인 운영 결정이다. [공식 FAQ, Dead Cells 라이브 운영 절](https://motiontwin.com/faq)

**[추정] 적용.** 공격·피격 타이밍 수정이 잦고 유사 적을 반복 제작하는 팀은 ‘새 캐릭터 첫 완성 시간’과 함께 ‘기존 캐릭터 재수정 시간’을 비교해야 한다. 자체 도구 개발·유지 시간까지 포함해야 이 사례의 이점을 평가할 수 있다. 절감 배수는 미확인이다. [해석 근거: 제작기](https://www.gamedeveloper.com/production/art-design-deep-dive-using-a-3d-pipeline-for-2d-animation-in-i-dead-cells-i-)

## 4. A Short Hike: 큰 RPG를 보류하고 첫 출시를 작게 잡았다

**[사실] 분업과 표현.** 개발자는 대부분의 제작 업무를 혼자 맡으면서, 3D 화면의 적은 픽셀 수를 적극적인 표현으로 삼았다고 설명한다. 간결한 셰이딩과 윤곽선으로 가독성을 확보했고, 픽셀 크기를 선호하지 않는 사람을 위해 조절 옵션을 넣었다. 음악 제작자는 동적 음악 배치를 지도에 정리해 전달했고 개발자가 구현했다. [개발자 직접 기고](https://blog.playstation.com/2021/08/05/crafting-a-tiny-open-world-a-look-behind-the-scenes-at-the-creation-of-a-short-hike/)

**[사실] 일정과 범위.** 공식 프레스킷은 2018년 12월 시작, 2019년 4월 5일 Humble 첫 출시, 7월 30일 Steam·itch.io 출시를 구분한다. 개발자는 첫 출시 뒤 낚시·파쿠르 활동 등을 추가했다고 설명한다. ‘4개월 완성’은 이후 콘텐츠·이식까지 모두 끝났다는 뜻이 아니다. [공식 프레스킷](https://ashorthike.com/press/), [개발자 인터뷰](https://mcvuk.com/business-news/the-first-time-somebody-was-reading-the-dialogue-i-had-to-leave-the-room-i-was-too-embarrassed-how-adamgryu-overcame-writers-block-and-creative-burnout-in-the-development-of-a-short/)

**[사실] 줄인 업무와 남은 병목.** 강한 서사 중심 게임을 감당할 자신이 없어 탐험에 더 의존했고, 대사는 채팅하듯 쓰는 접근을 택했다. 그럼에도 글쓰기는 어려웠고 다른 사람의 초안 도움도 받았다. 작은 게임으로 바꾸는 일이 모든 제작 병목을 없애지는 않았다. [개발자 인터뷰, 글쓰기·탐험 관련 답변](https://mcvuk.com/business-news/the-first-time-somebody-was-reading-the-dialogue-i-had-to-leave-the-room-i-was-too-embarrassed-how-adamgryu-overcame-writers-block-and-creative-burnout-in-the-development-of-a-short/)

**[추정] 적용.** 이 사례에서 옮길 만한 것은 ‘오픈월드를 빨리 만들 수 있다’는 일정 약속보다, 작은 첫 출시와 추가 콘텐츠를 나누는 방식이다. 엔진·DCC 버전, 자산당 작업 시간과 이식 공수는 이 문서가 확인한 자료만으로 확정하지 않는다. [해석 근거: 첫 출시의 범위를 명시한 GDC 소개](https://www.gdcvault.com/play/1026613/), [공식 출시 이력](https://ashorthike.com/press/)

### 연결된 보류 사례: Untitled Paper RPG

**[사실] 프로젝트 보류.** 같은 개발자의 회고에 따르면 Unity로 2016년 시작했고, 2018년 말 A Short Hike를 만들기 위해 쉬었다. 이후 가까운 시일 내 복귀 계획이 없다고 밝혔다. 페이지 상태는 보류이며, 영구 취소 여부와 상근 투입 기간은 미확인이다. 3D→픽셀 성공작 수에는 포함하지 않는다. [개발자 직접 회고, 취소 여부·시작 경위](https://adamgryu.itch.io/paper-game/devlog/971220/i-might-never-finish-this-game-so-im-releasing-the-demo)

**[사실] 어려워진 이유.** 개발자는 전투와 필드를 각각 큰 게임처럼 느꼈고, 이야기의 연결 구조를 정하기 전에 캐릭터·레벨·시스템을 만들었다고 설명했다. 탐험하려는 사람에게 전투가 장애물처럼 느껴진다는 의문과 제작 의욕 저하도 들었다. [같은 회고, 제작이 어려웠던 이유](https://adamgryu.itch.io/paper-game/devlog/971220/i-might-never-finish-this-game-so-im-releasing-the-demo)

**[추정] 적용.** 전투·탐험·서사를 각각 확장하기 전에, 같은 짧은 플레이 구간에서 세 요소가 함께 성립하는지 확인하는 편이 합리적이다. 모델이나 픽셀화 품질만으로 전체 제작 가능성을 판단해서는 이 병목을 발견하기 어렵다. [해석 근거: 개발자 회고](https://adamgryu.itch.io/paper-game/devlog/971220/i-might-never-finish-this-game-so-im-releasing-the-demo)

## 5. Cassette Beasts: 두 명의 핵심 개발자, 외부 협력과 도구 투자

**[사실] 역할과 도구.** 핵심 인력은 아트·글쓰기·디자인 담당과 프로그래밍·디자인 담당이다. 여러 엔진을 시험한 뒤 편집기 플러그인과 프로토타입으로 작업 효율을 검토해 Godot을 골랐다. 다만 프로젝트 특유의 성능 문제에서는 엔진 코드도 수정했다. 엔진 선택만으로 최적화 작업이 사라진 사례는 아니다. [Godot 공식 개발자 인터뷰](https://godotengine.org/article/godot-showcase-cassette-beasts/)

**[사실] 콘텐츠 파이프라인.** 몬스터에는 일반 표현 외에 모듈식 애니메이션 버전을 만들고, 합성 시 그 부품을 섞었다. 합성 방식은 여러 버전을 거쳐 정했다. 개별 몬스터 디자인은 여전히 많은 수작업이었으며, 개발자는 아트 담당자의 픽셀 제작 강점을 살리는 선택이라고 설명했다. 합성 결과마다 독립적인 완성 애니메이션을 수작업 제작했다는 해석은 맞지 않는다. [개발자 직접 인터뷰, 합성·아트 방향 답변](https://www.pockettactics.com/cassette-beasts/interview)

**[사실] 포기·보류한 범위.** 출시 전 AMA에서 플랫폼 간 세이브 전송은 공통 서비스가 필요해 2인 팀이 감당하기 어렵다고 답했다. 당시 PlayStation 미포함도 플랫폼마다 큰 자원이 필요하다는 설명이었다. 이는 그 시점의 출시 범위이며 이후 영구 미지원 선언으로 확대하지 않는다. [2023년 출시 전 개발자 AMA, 세이브 전송·플랫폼 질문](https://www.reddit.com/r/JRPG/comments/12kobbo/)

**[사실] 외부 작업의 일정.** Switch·Xbox 이식은 Pineapple Works와 협력했다. 개발자는 협력사의 일정·예산을 미리 맞추고 최종 빌드가 확정되기 전 출시일을 알리지 말라고 조언했다. 협력 규모와 계약액은 미확인이다. [Godot 인터뷰, 콘솔 이식 답변](https://godotengine.org/article/godot-showcase-cassette-beasts/)

**[추정] 적용.** 모듈 합성은 표현 조합을 늘릴 수 있지만 모듈 자체의 애니메이션 제작·호환 검토가 필요하다. 소규모 팀은 콘텐츠 수뿐 아니라 플랫폼·온라인 서비스 종류도 범위 축소 대상으로 보아야 한다. [해석 근거: 합성 인터뷰](https://www.pockettactics.com/cassette-beasts/interview), [출시 전 AMA](https://www.reddit.com/r/JRPG/comments/12kobbo/)

## 6. Eastward: 선형 구조와 자동화에도 팀과 일정은 커졌다

**[사실] 초기 범위 결정.** 2015년 개발자 게시물은 3인 팀과 픽셀 아트·3D 조명 조합을 설명한다. 같은 글의 개발자 답글에는 제한된 자원으로 서사를 전달하기 위해 선형 진행이 더 현실적인 선택이라고 적혀 있다. 선형 구조를 택한 이유가 공개된 사례다. [개발자 글 및 2015-12-12 답글](https://www.indiedb.com/games/eastward/news/we-are-making-eastward1)

**[사실] 도구와 생산 흐름.** MOAI 위 자체 엔진 Gii의 자산 관리·장면 편집 환경을 사용했고, 애니메이션에는 Aseprite, 디자인에는 Photoshop을 주로 사용했다. 자산 흐름을 자동화하는 도구도 만들었다. 2020년 인터뷰에서는 앞선 모바일 제작 시도가 잘되지 않아 자신들이 잘하는 방향에 집중했다고 회고했다. [개발자 인터뷰, 초기 시도·도구 절](https://www.gamedeveloper.com/business/road-to-the-igf-pixpil-s-i-eastward-i-)

**[사실] 실제 인력 부담.** 출시 후 팀은 3인에서 10인으로 성장했지만 여전히 작업량에 비해 인력이 부족했고 팬데믹도 어려움을 키웠다고 답했다. 예산·역량 때문에 구현하지 못한 구상이 있었다고도 밝혔다. 빠진 콘텐츠의 개수·목록·절약 기간은 미확인이다. [2021년 개발팀 AMA, 팀 규모·최종판 반영 질문](https://www.reddit.com/r/NintendoSwitch/comments/pyh9vo/)

**[추정] 적용.** 자체 도구가 있다는 사실과 작은 인원으로 짧게 완성할 수 있다는 결론은 별도다. 이 사례는 ‘3인이 시작했다’는 숫자만 차용하기보다, 선형 구조·인력 확대·도구 유지까지 함께 검토해야 한다. 자체 엔진 신설이 범용 엔진보다 유리하다고 일반화할 근거는 확보하지 못했다. [해석 근거: 도구 인터뷰](https://www.gamedeveloper.com/business/road-to-the-igf-pixpil-s-i-eastward-i-), [팀 AMA](https://www.reddit.com/r/NintendoSwitch/comments/pyh9vo/)

## 7. Prodeus: 핵심 두 사람의 결과물을 전체 두 사람의 작업으로 보지 않는다

**[사실] 역할과 표현 파이프라인.** 2019년 핵심 개발자 인터뷰에서 그래픽·도구 제작과 레벨 디자인의 역할 분담을 확인할 수 있다. 개발자는 스프라이트 처리를 실시간으로 하므로 부상 반영·애니메이션·3D 모드 전환이 가능하다고 설명했다. 기사 편집부가 덧붙인 세부 구현 추측은 개발자의 확정 설명과 구분해야 한다. [직접 인터뷰, 역할 소개·스프라이트 전환 질문](https://www.famitsu.com/news/201904/11174603.html)

**[사실] 제작 도구.** 참여 레벨 디자이너는 공개 포트폴리오에서 Unity 안의 모델링 도구로 지형·아트 작업을 수행했다고 설명한다. 단, 이번에는 검색 색인 발췌만 확인했고 본문 접근은 401로 제한되었다. 따라서 엔진 버전·DCC 목록·모델링 도구의 세부 성능·절감량은 미확인으로 둔다. [제작 참여자의 공개 포트폴리오](https://www.corydelatorre.com/)

**[사실] 일정 해석.** 공개 계획의 2020년 정식 출시와 실제 Steam의 2022년 정식 출시는 다르다. 정확한 시작일·전업 기간·월별 인력 변화가 없으므로 ‘2인×몇 년’의 인월로 환산하지 않는다. 구체적인 지연 원인도 이 두 자료만으로는 확정할 수 없다. [2019년 계획이 담긴 인터뷰 기사](https://www.famitsu.com/news/201904/11174603.html), [공식 정식 출시일](https://store.steampowered.com/app/964800/Prodeus/)

**[추정] 적용.** 실시간 스프라이트 처리는 프레임 파일 제작의 일부를 런타임·도구 구현 업무로 옮기는 선택으로 볼 수 있다. 이미 그래픽·도구 담당 역량이 있는 팀의 사례이며, 새 소규모 팀이 같은 결과를 내려면 얼마나 걸리는지는 미확인이다. 게임 전체를 실패·취소 사례로 분류할 근거도 없다. [해석 근거: 핵심 개발자 인터뷰](https://www.famitsu.com/news/201904/11174603.html)

## 8. HD-2D 비교: Octopath Traveler의 ‘작은 팀’은 인원 단위부터 다르다

**[사실] 비교의 한계.** Acquire의 ‘피크 프로그래머 6인’이라는 설명에는 별도 아트·디자인·퍼블리셔 업무가 포함된 전체 인원 수가 나오지 않는다. UE4의 도구·편집기·Blueprint·최적화 기능을 활용했다는 설명을, 여섯 명만으로 게임 전체를 만들었다는 주장으로 바꾸면 안 된다. 총예산·총기간·전체 상근 및 외주 인원은 이 자료로 미확인이다. [리드 프로그래머 등이 참여한 공식 인터뷰](https://www.unrealengine.com/spotlights/octopath-traveler-s-hd-2d-art-style-and-story-make-for-a-jrpg-dream-come-true)

**[사실] 실패한 첫 시도.** 처음 전투에 일반적인 효과를 넣었을 때 결과에 만족하지 못했고, 효과와 함께 점광원을 사용해 그림자와 빛의 관계를 보강했다. 이는 픽셀 캐릭터와 3D 환경을 함께 놓는 것만으로 원하는 화면이 완성되지는 않았다는 제작자 설명이다. [아트 담당자의 직접 답변](https://www.unrealengine.com/spotlights/octopath-traveler-s-hd-2d-art-style-and-story-make-for-a-jrpg-dream-come-true)

**[사실] 후속작에서 확인되는 제작 부담.** Octopath Traveler II 인터뷰는 종이처럼 평평한 2D 캐릭터와 3D 배경을 자연스럽게 맞추는 어려움, 카메라 회전 때 외형을 유지하는 어려움을 명시한다. 이동 중 카메라는 고정하며, 아티스트가 도구로 직접 반복 조정하고 Sequencer로 게임 내 결과를 미리 확인했다. [후속작 개발자 인터뷰, 2.5D·맵·UE 도구 질문](https://www.unrealengine.com/developer-interviews/octopath-traveler-ii-builds-a-bigger-bolder-world-in-its-stunning-hd-2d-style?lang=en-US)

**[추정] 적용.** 소규모 팀은 카메라 자유도와 연출 종류를 제한한 상태에서 캐릭터·배경의 결합 품질을 먼저 확인하는 편이 합리적이다. 이 사례에서 가져올 것은 반복 확인을 아트 담당자가 수행할 수 있는 작업 환경이며, 동일한 규모의 RPG를 만들 수 있다는 예산·일정 보장은 아니다. [해석 근거: 초대작 도구 활용](https://www.unrealengine.com/spotlights/octopath-traveler-s-hd-2d-art-style-and-story-make-for-a-jrpg-dream-come-true), [후속작 카메라·도구 설명](https://www.unrealengine.com/developer-interviews/octopath-traveler-ii-builds-a-bigger-bolder-world-in-its-stunning-hd-2d-style?lang=en-US)

## 9. 제작 원칙으로 옮길 때의 판단 [추정]

- **수정 비용을 측정한다.** 새 캐릭터 첫 제작과 기존 공격 타이밍 재수정을 따로 재고, 도구 유지 시간도 포함한다. [근거: Dead Cells](https://www.gamedeveloper.com/production/art-design-deep-dive-using-a-3d-pipeline-for-2d-animation-in-i-dead-cells-i-)
- **줄일 범위를 화면 밖에서도 찾는다.** 서사 분기·출시 플랫폼·서비스 종류도 제작량이다. [근거: Eastward 선형 구조](https://www.indiedb.com/games/eastward/news/we-are-making-eastward1), [Cassette Beasts 서비스 제외](https://www.reddit.com/r/JRPG/comments/12kobbo/)
- **협력사 업무를 전체 일정에 남긴다.** 핵심 팀 인원과 외주·퍼블리셔 지원을 분리해 적고, 납기 연결을 관리한다. [근거: 이식 협업 조언](https://godotengine.org/article/godot-showcase-cassette-beasts/)
- **장면의 성공을 게임 완성 가능성과 구분한다.** 전투·탐험·서사를 짧은 대표 구간에서 함께 확인한다. [근거: 보류 프로젝트 회고](https://adamgryu.itch.io/paper-game/devlog/971220/i-might-never-finish-this-game-so-im-releasing-the-demo)

## 10. 자료의 한계

**[사실] 열람 수준.** GDC A Short Hike 자료는 공개 발표 소개문까지만 확인했다. 영상 전체를 검증한 것으로 취급하지 않았다. Prodeus 참여자 포트폴리오는 검색 색인 발췌 확인에 한정한다. 도구 버전·도구 구축 기간·자산당 실측 시간은 추가 확인이 필요하며 현재 미확인이다. [GDC 소개문](https://www.gdcvault.com/play/1026613/), [포트폴리오](https://www.corydelatorre.com/)

**[추정] 일반화의 한계.** 완성작 중심의 선택 표본에 보류 사례를 보탠 조사다. 전체 실패율·평균 제작비·평균 제작기간을 계산할 자료는 아니다. 개발자 회고의 자기평가와 검증된 실측값도 구분해야 한다. [표본 성격 확인: 출시 이력](https://ashorthike.com/press/), [별도 보류 회고](https://adamgryu.itch.io/paper-game/devlog/971220/i-might-never-finish-this-game-so-im-releasing-the-demo)

직접 인용은 사용하지 않았다. 인원·일정·도구·범위 결정의 출처는 해당 문단 또는 표의 같은 행에 연결했다.
