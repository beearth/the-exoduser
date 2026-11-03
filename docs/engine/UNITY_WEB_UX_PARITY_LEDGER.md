# 웹·Unity UX/UI 동기화 대조표

2026-11-02 WORK_MANUAL §2-1의 100% 동기화 지시에 따른다. 이 문서는 5차 전체 UX 인벤토리165행과 앞선 살아 있는 화면·전환 인계를 함께 관리한다. 아래5차 표의 현행 조사 판정을 사용한다. 전체 Player 대조는 진행 중이며 소스 존재만으로 같음/PASS를 표시하지 않는다.

웹 기능 통합: `16c9d7171757cf730eb5fb4faaf14c3605fde5ce` (main 비강제 반영·3333 실제 파일 해시 확인). 살아 있는 화면의 Unity 반영 SHA: 없음. 기존 `ui-ultrawide` 인계/통합 경로에 즉시 후속 항목을 등록했으며 새 Unity 실행기·작업 트리·팀은 만들지 않는다. 인계 등록과 실제 착수는 구분한다.

| 화면 | 구분 | 웹 기준 / 전달할 계약 | Unity SHA | 판정 |
|---|---|---|---|---|
| 로비 | 화면 | 신전 원화·배치·서체 유지, 원경/바닥 연무·푸른 화로 빛. 같은4비율 | 없음 | 신규 레이어 미이식 |
| 로비 | 반응 | 기존 클릭/키보드/패드·잠김·선택 유지, 연출은 입력 통과 | 없음 | 유지 계약 미검증 |
| 로비 | 소리 | 이번 웹 작업에서 원음·볼륨·전환 변경 없음 | 없음 | Unity 녹음 대조 미검증 |
| 로비 | 흐름 | 최신 원화 전환·정지판 준비·이전 비동기 응답 무효화, 선대 스프라이트 정지 정책 | 없음 | 신규 정책 미이식 |
| 로비 | 움직임 | 연무96/144/192초, 화로11초 약맥동, 저사양·움직임 줄이기·숨김 정지 | 없음 | 미이식 |
| 영웅 선택5종 | 화면 | 같은 원화 구성의 별도 잔점 정리판, 와이드 사이드 금속판 숨김, 기존 UI·잠금 유지 | 없음 | 정리판/표현 미이식 |
| 영웅 선택5종 | 반응 | 선택/취소/잠김/생성 키보드·패드 계약 유지. 빠른 전환에도 이전 원화 잔류 금지 | 없음 | Unity 실입력 미검증 |
| 영웅 선택5종 | 소리 | 이번 웹 작업의 원음·재생 정책 변경 없음 | 없음 | Unity 녹음 대조 미검증 |
| 영웅 선택5종 | 흐름 | 몸을 변형하는 기존 영상 대신 정지판+환경 캔버스. 정리판 실패 시 같은 원본 정지판 | 없음 | 미이식 |
| 영웅 선택5종 | 움직임 | 얼굴·체형의 시간 변위0. 원경/바닥 연무, 기존 CSS Ken Burns/오라 반복 정지 | 없음 | 미이식 |
| 로딩32종 | 화면 | 13/14/17 제외. 기존35장 중7종만 별도16:10/파노라마 정리판, 나머지 원화 유지 | 없음 | 신규 정리판 미이식 |
| 로딩32종 | 반응 | 기존 입력/진행률/문구·팁 유지, 레이어는 입력 통과 | 없음 | 유지 계약 미검증 |
| 로딩32종 | 소리 | 이번 웹 작업의 로딩 사운드 변경 없음 | 없음 | Unity 녹음 대조 미검증 |
| 로딩32종 | 흐름 | 같은 화면비 선택과 실패 폴백, 비동기 전환 ticket 보호 | 없음 | 신규 정책 미이식 |
| 로딩32종 | 움직임 | 톤별 부드러운 연무3겹. 점/그레인/새 영상0, 같은 정지 조건 | 없음 | 미이식 |
| 클리어/사망/데모 종료 | 화면 | 기존 패널/보상/문구/배치 유지. 사망 정리판, 클리어 회백/종료 피안개 | 없음 | 신규 표현 미이식 |
| 클리어/사망/데모 종료 | 반응 | 기존 다음구역/부활/리플레이/로비 버튼·잠김 유지, 레이어 입력 통과 | 없음 | 유지 계약 미검증 |
| 클리어/사망/데모 종료 | 소리 | 이번 웹 작업의 사운드 변경 없음 | 없음 | Unity 녹음 대조 미검증 |
| 클리어/사망/데모 종료 | 흐름 | 실제 원화 픽셀 크기 기준 cover·중앙 삽입. 판 비율 반올림으로 인물 중복 금지 | 없음 | 미이식 |
| 클리어/사망/데모 종료 | 움직임 | 기존 UI 위 낮고 큰 연무만 사용. 움직임 줄이기·저사양·숨김 정지 | 없음 | 미이식 |

소스/상수/26개 정리판 실제 크기·프롬프트·해시: [살아 있는 화면 SSOT](../3.1%20ui%20hud%20디자인/LIVING_SCENES_20261102.md), `assets/living-scenes/20261102/provenance.json`, `living-scenes.js/.css`. 정리판은 원본 파일을 덮지 않으며 미세 재질은 완전히 같지 않고 네이티브4K가 아니다.

웹 근거: `I:/EXODUSER-Storage/codex-takeover/living-1102/REPORT.md`, `evidence/REVIEW.html`의164화면/82편10초무음/1x전후/3x. Unity 담당은 같은 크기 나란히 캡처와 원음 녹음 대조, 정지 정책·실입력·단일 실행기·빌드/M1/Player/통합/Desktop 게이트를 통과한 뒤 실제 Unity SHA와 판정을 채운다. 승인된 시작 메뉴와 첫 게이트는 이 작업으로 바꾸지 않는다.

Unity 반영: 대기(미반영).

## 2026-11-02 공통 전환·로딩 웹 인계

웹 후보1b6b2f4a7a 및 최신 main 통합 후보의 계약은 [전환 SSOT](../3.1%20ui%20hud%20디자인/SCREEN_TRANSITIONS_20261102.md). Unity 코드는 기존 parity 담당 소유이며 이번 웹 담당이 중복 실행/수정하지 않았다.

| 화면 | 구분 | 웹 기준 / 전달할 계약 | Unity SHA | 판정 |
|---|---|---|---|---|
| 게이트·영상·메뉴·게임 이동·스테이지·재시작·복귀 | 화면 | 전체 #000 cover, 오른쪽아래 승인 투명 인장12vh/max(48px,4.5vh), 전3비율 | 없음 | 신규 공통 전환 미이식 |
| 같은 전체 경계 | 반응 | 전환 중 중복 요청1회·기존 focus/홀드/저장 identity·늦은 취소 보호 | 없음 | Player 실입력 대조 미검증 |
| 같은 전체 경계 | 소리 | 기존 음악/영상·앰비언스 gain을500ms로0,600ms로1; 결정음 duck과 곱함 | 없음 | 미이식·녹음 대조 미검증 |
| 같은 전체 경계 | 흐름 | fadeOut→실제 decode/준비→fadeIn, 페이지간 첫 paint 검정,300ms 지연 인장, 고정1.2초/5초 제거 | 없음 | 미이식 |
| 같은 전체 경계 | 움직임 | 본체고정/붉은레이어2초/.12~.75 호흡, 영상끝.6초 검정, 감소설정80ms/정지인장 | 없음 | 미이식 |

웹1920/3840 전후 무음10초 영상·실제 브라우저 계약·원격 상태는 transitions/REPORT.md. Unity 반영: 대기(미반영); 기존 unity-parity-1102-brief 말미에 동일 계약 인계.

11-02 23:40 전환 인장3차 가독성: 웹 img/ui/silver_hell/gate_sigil_loading.png(1520²RGBA·색조유지gamma.65·얇은 뼈색 윤곽),red-only gate_sigil_loading_embers.png,12vh·2초 균열+1.4배 붉은 후광(.25~.4). 두 HTML 부트 동일2레이어·300/1000ms 유지. 감소모션 본체1/균열·후광.3정지. Unity SHA 미반영/미이식, 기존 parity 담당5차 인계. 웹 증거transitions/r4/ 및 REPORT.md.


## 5차 전체 화면 인벤토리 — 진행 중

웹 계약 동결 `740722e1ac3a5f4b0143f55b6088b01b8517be0f`, Unity 소스 조사 기준 `426544563dcd7068ac661a7ee7876fd91f69d19a`(unity/main 반영, 실제 첫 Player 패키지는 조상2cb2a854; 이후 통합은 컴파일만 확인). 각 행의 상태는 소스/이전 검수/이번 Player 근거를 구분한다. 현재 전체 입력·영상·청음 대조가 끝나지 않은 행은 미검증이며 같음으로 승격하지 않는다. 명시적 미이식은 해당 실행기/표현이 없는 경우에만 쓴다. 인게임 월드 표현은 일치 대상에서 제외한다.

| 화면 | 구분 | 웹 계약 | Unity 소스/상태 | 웹 SHA | Unity SHA | 판정 | 이번 검수 |
|---|---|---|---|---|---|---|---|
| FDG 로고 | 화면 | 원본 FDG 영상·브랜드·아무 키 | NativeLobby.Begin/AdvanceSplash | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| FDG 로고 | 반응 | 아무 키 다음·중복 입력 fence | NativeLobby.Begin/AdvanceSplash | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| FDG 로고 | 소리 | 원본 영화 오디오 | NativeLobby.Begin/AdvanceSplash | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| FDG 로고 | 흐름 | 실제 디코드→시작 메뉴 | NativeLobby.Begin/AdvanceSplash | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| FDG 로고 | 움직임 | 영상 clock/포커스 정지 | NativeLobby.Begin/AdvanceSplash | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 시작 메뉴 | 화면 | C2 원본·로고/메뉴 여백·release-version | NativeLobby.TitleMenu | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 시작 메뉴 | 반응 | 마우스/방향키/패드 선택·확정 | NativeLobby.TitleMenu | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 시작 메뉴 | 소리 | 호버/확인/ENTER 원음 | NativeLobby.TitleMenu | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 시작 메뉴 | 흐름 | 시작/인트로 재생/위시리스트/종료 | NativeLobby.TitleMenu | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 시작 메뉴 | 움직임 | 원본 루프·폭포 | NativeLobby.TitleMenu | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 게이트 인장 | 화면 | 흑철 로고·인장·사슬·HELL LORD·ENTER | NativeLobby.SilverHell | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 게이트 인장 | 반응 | 인장 호버/ENTER·중복 억제 | NativeLobby.SilverHell | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 게이트 인장 | 소리 | 80/100ms hover loop·ENTER 매번 | NativeLobby.SilverHell | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 게이트 인장 | 흐름 | ENTER1100ms→세계관 준비 | NativeLobby.SilverHell | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 게이트 인장 | 움직임 | 기존 승인 인장 호흡 | NativeLobby.SilverHell | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 세계관 영상 | 화면 | v22b·자막·우하단 진행 링 | NativeLobby/LobbyFlow | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 2cb2 패키지1920/3840 실제 링 캡처·무음 VFR. 웹과 자막/획 차이 RETOUCH, 영상 시점 동일 비교 아님 |
| 세계관 영상 | 반응 | Space/ESC5초·B/Start·다음 cue | NativeLobby/LobbyFlow | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 2cb2 실제 InputSystem Space/Esc/B/Start 홀드·해제·부분/전체88검사의 세계관 사례 통과. A 다음cue·OS손입력은 미검증 |
| 세계관 영상 | 소리 | 음성1/BGM.22·기존 mix | NativeLobby/LobbyFlow | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 세계관 영상 | 흐름 | 준비/재시도/자연끝/홀드→로비 | NativeLobby/LobbyFlow | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 2cb2 실제 홀드→로비 확인. 자연끝·오류재시도와 새757e 전환은 별도 검수 중 |
| 세계관 영상 | 움직임 | 영상·진행링·포커스 정지 | NativeLobby/LobbyFlow | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 2cb2 실제 영상 준비/링 진척·영상 중 전투틱 정지. VFR 캡처이며60fps/포커스 전체 검수 아님 |
| 캐릭터 목록 로비 | 화면 | 신전·슬롯·악의오브·입장 | NativeLobby.SilverLobby/Characters | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 캐릭터 목록 로비 | 반응 | 선택/생성/삭제·키보드/패드 | NativeLobby.SilverLobby/Characters | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 캐릭터 목록 로비 | 소리 | 호버/확인·입장 루프·두둥 | NativeLobby.SilverLobby/Characters | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 캐릭터 목록 로비 | 흐름 | 캐릭터별 세이브 확인→이어하기/신규 | NativeLobby.SilverLobby/Characters | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 캐릭터 목록 로비 | 움직임 | 선대·연무·화로11초 | NativeLobby.SilverLobby/Characters | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미이식 | living-scenes 원경/바닥 연무·정지판 정책 미인수 |
| 영웅 선택5종 | 화면 | 이름/직업/설명/미니스토리/특성·X잠김 | NativeLobby.CharacterPresentation | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 미니스토리5×29=145 원문 동일. Native1920전사/3840실버테일 직접1x·폰트 RETOUCH. 웹5종×2해상도10캡처; Native전5종시각은 미완료 |
| 영웅 선택5종 | 반응 | 5종 이동/잠김 생성차단/취소/정보스크롤 | NativeLobby.CharacterPresentation | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 영웅 선택5종 | 소리 | 호버35ms·확인/결정 중복억제 | NativeLobby.CharacterPresentation | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 35ms 두호버경계17/0. 같은2cb2 Player 일반477/로비425 출력버퍼 검사, 실제 청음·전이벤트 전수는 별도 |
| 영웅 선택5종 | 흐름 | 선택→이름/취소→로비 | NativeLobby.CharacterPresentation | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 영웅 선택5종 | 움직임 | 정지판·연무·인물 변위0 | NativeLobby.CharacterPresentation | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미이식 | living-scenes 원경/바닥 연무·정지판 정책 미인수 |
| 이름 생성 | 화면 | 정본 패널9slice·제목/입력/오류 | NativeLobby.CharacterPresentation/Characters | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 이름 생성 | 반응 | IME/입력검증·확정/취소·중복저장차단 | NativeLobby.CharacterPresentation/Characters | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 이름 생성 | 소리 | 정본 확인·생성 두둥 | NativeLobby.CharacterPresentation/Characters | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 이름 생성 | 흐름 | 저장성공→같은 캐릭터 이야기 | NativeLobby.CharacterPresentation/Characters | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 이름 생성 | 움직임 | 전환페이드·버튼 반응 | NativeLobby.CharacterPresentation/Characters | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 삭제 확인 | 화면 | 정본 이름·선택 확인판 | NativeLobby.CharacterDelete | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 삭제 확인 | 반응 | 기본취소/좌우/확정/ESC | NativeLobby.CharacterDelete | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 삭제 확인 | 소리 | dark두둥·취소확인 | NativeLobby.CharacterDelete | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 삭제 확인 | 흐름 | 동일identity 삭제·목록복귀 | NativeLobby.CharacterDelete | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 삭제 확인 | 움직임 | 전환/선택 반응 | NativeLobby.CharacterDelete | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 캐릭터 이야기 영상 | 화면 | v23 clean·정본 cue/자막·스킵표시 | NativeLobby.CharacterStory/WarriorStoryState | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 캐릭터 이야기 영상 | 반응 | Space/ESC1.2초·B/Start·다음대사 | NativeLobby.CharacterStory/WarriorStoryState | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 같은2cb2패키지 Space/Esc/B/Start,부분홀드/해제/1.2초 홀드통과. OS손입력은 미검증 |
| 캐릭터 이야기 영상 | 소리 | 원본 영화음·두둥 정책 | NativeLobby.CharacterStory/WarriorStoryState | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 캐릭터 이야기 영상 | 흐름 | 생성→이야기→같은캐릭터 게임·취소무효화 | NativeLobby.CharacterStory/WarriorStoryState | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 2cb2 완료 후 startupLoading까지 기록. 같은 사례 최종1-1 도착 미확인. 새757e M1 비동기 검수 대기 |
| 캐릭터 이야기 영상 | 움직임 | 원본 영상·홀드/힌트/검정경계 | NativeLobby.CharacterStory/WarriorStoryState | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 언어 메뉴 | 화면 | 29개 언어·선택상태·행/글꼴 | NativeLobby.LanguageMenu | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 언어 메뉴 | 반응 | 검색/포인터/키보드/패드/닫기 | NativeLobby.LanguageMenu | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 언어 메뉴 | 소리 | 호버/확인 | NativeLobby.LanguageMenu | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 언어 메뉴 | 흐름 | 언어저장·이전 화면복귀 | NativeLobby.LanguageMenu | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 언어 메뉴 | 움직임 | 메뉴 전환·긴글 스크롤 | NativeLobby.LanguageMenu | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 패치노트 | 화면 | 버전·본문·카테고리 | NativeLobby.PatchNotes | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 패치노트 | 반응 | 스크롤/키/닫기 | NativeLobby.PatchNotes | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 패치노트 | 소리 | 호버/취소 | NativeLobby.PatchNotes | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 패치노트 | 흐름 | 열기/복귀 | NativeLobby.PatchNotes | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 패치노트 | 움직임 | 표시 전환 | NativeLobby.PatchNotes | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 게임 종료 확인 | 화면 | 예/아니오 판·기본취소 | NativeLobby.UiSound/NativePauseMenu | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 게임 종료 확인 | 반응 | 포인터/좌우/Enter/ESC | NativeLobby.UiSound/NativePauseMenu | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 게임 종료 확인 | 소리 | 확인/취소 | NativeLobby.UiSound/NativePauseMenu | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 게임 종료 확인 | 흐름 | 취소복귀·명시확정만 종료 | NativeLobby.UiSound/NativePauseMenu | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 게임 종료 확인 | 움직임 | 선택 강조 | NativeLobby.UiSound/NativePauseMenu | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 입장 로딩 | 화면 | 전체 원화·진행/팁·투명인장12vh | NativeLobby.StartupPresentation | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 입장 로딩 | 반응 | 중복진입차단·identity fence | NativeLobby.StartupPresentation | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 입장 로딩 | 소리 | 기존 gain×transition×decision | NativeLobby.StartupPresentation | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 입장 로딩 | 흐름 | 실제자원준비→Nemesis/게임 | NativeLobby.StartupPresentation | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 입장 로딩 | 움직임 | 500/600ms·300/1000ms·붉은레이어2초 | NativeLobby.StartupPresentation | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| Nemesis 대화 | 화면 | 원화21장·화자·대사/힌트 | NativeLobby.StartupPresentation/FrontendEntryFlow | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| Nemesis 대화 | 반응 | 다음/ESC/Space홀드·패드 | NativeLobby.StartupPresentation/FrontendEntryFlow | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| Nemesis 대화 | 소리 | 원음보이스/BGM | NativeLobby.StartupPresentation/FrontendEntryFlow | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| Nemesis 대화 | 흐름 | 신규캐릭터 첫진입→조작안내 | NativeLobby.StartupPresentation/FrontendEntryFlow | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| Nemesis 대화 | 움직임 | 대화 crossfade·홀드 | NativeLobby.StartupPresentation/FrontendEntryFlow | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 첫 조작 안내 | 화면 | 4판·실제 바인딩/패드·고정기술 | NativeLobby.StartupPresentation | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 첫 조작 안내 | 반응 | Enter/Space/패드/건너뛰기 | NativeLobby.StartupPresentation | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 첫 조작 안내 | 소리 | 기존 시작음·화면 gain | NativeLobby.StartupPresentation | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 첫 조작 안내 | 흐름 | 전투 준비완료→안내→입력해제→게임 | NativeLobby.StartupPresentation | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 첫 조작 안내 | 움직임 | 원화·커튼·전환 | NativeLobby.StartupPresentation | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 인게임 HUD | 화면 | 체력/마나/ST/ES/EXP·악의오브4단계·미니맵·퀵슬롯 | NativeHud/NativeFieldHud | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 인게임 HUD | 반응 | 스킬/물약/목표 hover·바인딩·퀵창 | NativeHud/NativeFieldHud | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 인게임 HUD | 소리 | 원본 인터랙션/SFX | NativeHud/NativeFieldHud | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 인게임 HUD | 흐름 | 실제Core상태→HUD·저장연결 | NativeHud/NativeFieldHud | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 인게임 HUD | 움직임 | 게이지·접점2틱·피격가장자리·처치음2보이스 | NativeHud/NativeFieldHud | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 인벤토리·장비 | 화면 | 정본 프레임/제목44px/눈메달·칸·필터 | NativeInventory | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 인벤토리·장비 | 반응 | 장착/비교/드래그/분해/필터/키패드 | NativeInventory | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 인벤토리·장비 | 소리 | 탭/확인/취소·중복억제 | NativeInventory | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 인벤토리·장비 | 흐름 | 실제장비/가방/저장 | NativeInventory | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 인벤토리·장비 | 움직임 | 슬롯·툴팁·탭 전환 | NativeInventory | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 아이템 툴팁·비교 | 화면 | 이름/등급/수치·어픽스·좌우비교 | NativeInventory/NativeTooltip | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 아이템 툴팁·비교 | 반응 | hover/포커스·위치 clamp | NativeInventory/NativeTooltip | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 아이템 툴팁·비교 | 소리 | 원본 정책 | NativeInventory/NativeTooltip | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 아이템 툴팁·비교 | 흐름 | 선택아이템identity 일치 | NativeInventory/NativeTooltip | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 아이템 툴팁·비교 | 움직임 | 지연/표시·경계 | NativeInventory/NativeTooltip | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 퀵슬롯·물약 | 화면 | 정본 슬롯/충전/자동사용 | NativeHud/NativeInventory | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 퀵슬롯·물약 | 반응 | 드래그/사용/자동설정/키패드 | NativeHud/NativeInventory | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 퀵슬롯·물약 | 소리 | 원본 물약/실패/설정음 | NativeHud/NativeInventory | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 퀵슬롯·물약 | 흐름 | 실제Core물약·저장 | NativeHud/NativeInventory | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 퀵슬롯·물약 | 움직임 | 충전/쿨다운 | NativeHud/NativeInventory | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 스킬 제단16슬롯 | 화면 | 정본 제단·구슬/핵·설명판·고정/잠김/빈소켓 | NativeSkills/NativeSkillManagementPolicy | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 다름 | Resources 카탈로그48개(가상고정2 포함), 실제 지원6; 웹55개. 미지원 실행기/고정슬롯 잔여 |
| 스킬 제단16슬롯 | 반응 | 최신55종 학습/강화/하향/장착·리셋확인 | NativeSkills/NativeSkillManagementPolicy | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 다름 | Resources 카탈로그48개(가상고정2 포함), 실제 지원6; 웹55개. 미지원 실행기/고정슬롯 잔여 |
| 스킬 제단16슬롯 | 소리 | 선택/결정/리셋 원음 | NativeSkills/NativeSkillManagementPolicy | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 스킬 제단16슬롯 | 흐름 | 실제실행기·비용/SP·세이브 | NativeSkills/NativeSkillManagementPolicy | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 다름 | Resources 카탈로그48개(가상고정2 포함), 실제 지원6; 웹55개. 미지원 실행기/고정슬롯 잔여 |
| 스킬 제단16슬롯 | 움직임 | 구슬/핵 광택·호버·잠김/비활성 | NativeSkills/NativeSkillManagementPolicy | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 스킬 합체 | 화면 | 합체식/재료/결과·추천 | NativeSkills/Core.Skills | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미이식 | NativeSkills 합체 안내/추천 비활성; 웹32합체·15추천 단계 |
| 스킬 합체 | 반응 | 선택/가능조건/전체추천 | NativeSkills/Core.Skills | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미이식 | NativeSkills 합체 안내/추천 비활성; 웹32합체·15추천 단계 |
| 스킬 합체 | 소리 | 정본 결정/취소 | NativeSkills/Core.Skills | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 스킬 합체 | 흐름 | 실제합체·비용·슬롯/저장 | NativeSkills/Core.Skills | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미이식 | NativeSkills 합체 안내/추천 비활성; 웹32합체·15추천 단계 |
| 스킬 합체 | 움직임 | 결정 연출 | NativeSkills/Core.Skills | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 능력치 별자리 | 화면 | 정본 수치/노드·요약drawer·효과 | NativeStatPanel/Simulation.Growth | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 다름 | NativeStatPanel 요약 drawer 미이식; 이번 패키지 1x 대조 대기 |
| 능력치 별자리 | 반응 | SP/AP계획/투자/환불/예약·취소 | NativeStatPanel/Simulation.Growth | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 다름 | SupportNote의6개 조건부 패시브 제한 및 pRegen 물약 연결 누락 조사 |
| 능력치 별자리 | 소리 | 호버/확인·탭 | NativeStatPanel/Simulation.Growth | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 능력치 별자리 | 흐름 | 실제파생·조건부패시브·저장 | NativeStatPanel/Simulation.Growth | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 다름 | SupportNote의6개 조건부 패시브 제한 및 pRegen 물약 연결 누락 조사 |
| 능력치 별자리 | 움직임 | 노드/선/선택/스크롤 | NativeStatPanel/Simulation.Growth | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 대장간6탭 | 화면 | 980×1056·정본44px제목/눈메달·배치 | NativeForgePanel | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 대장간6탭 | 반응 | 강화/물약/분해/재설정/결정/제작 | NativeForgePanel | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 대장간6탭 | 소리 | 탭/확인/결정/실패 | NativeForgePanel | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 대장간6탭 | 흐름 | 각 실제아이템변경·비용/저장 | NativeForgePanel | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 대장간6탭 | 움직임 | 호버/결정/목록 | NativeForgePanel | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 일시정지·보조메뉴 | 화면 | 정본 계속/설정/로비/종료 | NativePauseMenu | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 일시정지·보조메뉴 | 반응 | ESC/포커스복귀·명시재개·키패드 | NativePauseMenu | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 일시정지·보조메뉴 | 소리 | 호버/확인/취소 | NativePauseMenu | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 일시정지·보조메뉴 | 흐름 | 멈춤→명시재개·로비/종료 | NativePauseMenu | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 일시정지·보조메뉴 | 움직임 | 표시/포커스 강조 | NativePauseMenu | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 설정 | 화면 | 정본 탭/슬라이더/라벨/버전 | NativePauseMenu/NativeSettingsState | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 설정 | 반응 | 음량/화면/성능/게임/언어·저장 | NativePauseMenu/NativeSettingsState | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 설정 | 소리 | 호버/확인·버스 | NativePauseMenu/NativeSettingsState | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 설정 | 흐름 | 현재설정적용·재실행보존 | NativePauseMenu/NativeSettingsState | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 설정 | 움직임 | reduceMotion·프리셋·화면비 | NativePauseMenu/NativeSettingsState | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 키 바인딩 | 화면 | 실제107키·패드·현재키·리셋 | NativeKeyBindInput/NativePauseMenu | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 키 바인딩 | 반응 | 충돌/재바인드/취소·중복차단 | NativeKeyBindInput/NativePauseMenu | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 키 바인딩 | 소리 | 확인/취소 | NativeKeyBindInput/NativePauseMenu | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 키 바인딩 | 흐름 | 실제입력맵·저장 | NativeKeyBindInput/NativePauseMenu | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 키 바인딩 | 움직임 | 선택/대기 강조 | NativeKeyBindInput/NativePauseMenu | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 레벨업 | 화면 | 정본 제목/보상·SP/AP | NativeLevelUpOverlay | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 레벨업 | 반응 | 닫기/분배/선택 | NativeLevelUpOverlay | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 레벨업 | 소리 | 원본레벨업음 | NativeLevelUpOverlay | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 레벨업 | 흐름 | 실제EXP·SP/AP·한번만 보상 | NativeLevelUpOverlay | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 레벨업 | 움직임 | 표시·광택 | NativeLevelUpOverlay | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 지역 제목·목표 | 화면 | 정본 제목·목표/지역상태 | NativeAreaTitle/NativeObjectivePanel | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 지역 제목·목표 | 반응 | 목표정보·입력통과 | NativeAreaTitle/NativeObjectivePanel | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 지역 제목·목표 | 소리 | 지역/진행 음 | NativeAreaTitle/NativeObjectivePanel | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 지역 제목·목표 | 흐름 | 실제stage/지역상태 | NativeAreaTitle/NativeObjectivePanel | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 지역 제목·목표 | 움직임 | 등장/사라짐 | NativeAreaTitle/NativeObjectivePanel | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 보스 HUD | 화면 | 정본이름/HP·단계/표식 | NativeBossBar | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 보스 HUD | 반응 | 실제보스대상·가림없음 | NativeBossBar | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 보스 HUD | 소리 | 원본보스음 | NativeBossBar | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 보스 HUD | 흐름 | 출현/전투/퇴장 | NativeBossBar | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 보스 HUD | 움직임 | 체력/피격/단계 | NativeBossBar | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 사망·재시작 | 화면 | 정본사망원화/텍스트/EXP | NativeDeathOverlay/NativeGame | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 사망·재시작 | 반응 | 재시작/로비·중복EXP손실금지 | NativeDeathOverlay/NativeGame | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 사망·재시작 | 소리 | 원본사망/확인·transition gain | NativeDeathOverlay/NativeGame | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 사망·재시작 | 흐름 | 부활가능여부→사망→실제재시작 | NativeDeathOverlay/NativeGame | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 사망·재시작 | 움직임 | 피안개·검정500/600ms | NativeDeathOverlay/NativeGame | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 클리어·난이도·다음구역 | 화면 | 정본보상/5난이도/다음 | NativeStageClearOverlay/NativeNextDifficultyPanel | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 클리어·난이도·다음구역 | 반응 | −100/−50/0/+50/+100·취소/재열기/확정 | NativeStageClearOverlay/NativeNextDifficultyPanel | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 클리어·난이도·다음구역 | 소리 | 정본결정음 | NativeStageClearOverlay/NativeNextDifficultyPanel | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 클리어·난이도·다음구역 | 흐름 | 실제1-1→1-2·저장/보상 중복0 | NativeStageClearOverlay/NativeNextDifficultyPanel | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미이식 | NativeGame.StageFlow.StageClearContinue는 실제 다음맵 대신 로비 복귀 |
| 클리어·난이도·다음구역 | 움직임 | 회백연무·검정/로딩인장 | NativeStageClearOverlay/NativeNextDifficultyPanel | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 데모 종료·승리 | 화면 | 정본종료원화/위시리스트/보상 | NativeStageClearOverlay | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 데모 종료·승리 | 반응 | 다시하기/로비/위시리스트 | NativeStageClearOverlay | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 데모 종료·승리 | 소리 | 정본종료/결정음 | NativeStageClearOverlay | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 데모 종료·승리 | 흐름 | 데모상한→종료·난이도우회 | NativeStageClearOverlay | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 데모 종료·승리 | 움직임 | 피안개/클리어연무 | NativeStageClearOverlay | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미검증 | 입력/1x/출력버퍼 대조 대기 |
| 공통 전환·로딩32종 | 화면 | 원본1520²RGBA인장/embers·32장확장판 | NativeScreenTransition(미이식) | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미이식 | 현재 checkout에 공통 전환 실행기 없음; I: 준비본은 제품 반영 아님 |
| 공통 전환·로딩32종 | 반응 | 중복1회/늦은취소/입력흡수/해제 | NativeScreenTransition(미이식) | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미이식 | 현재 checkout에 공통 전환 실행기 없음; I: 준비본은 제품 반영 아님 |
| 공통 전환·로딩32종 | 소리 | 기존gain×전환×decision | NativeScreenTransition(미이식) | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미이식 | 현재 checkout에 공통 전환 실행기 없음; I: 준비본은 제품 반영 아님 |
| 공통 전환·로딩32종 | 흐름 | fadeOut→실제decode/준비→두프레임→fadeIn | NativeScreenTransition(미이식) | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미이식 | 현재 checkout에 공통 전환 실행기 없음; I: 준비본은 제품 반영 아님 |
| 공통 전환·로딩32종 | 움직임 | 500/600ms·300/1000ms·12vh·2초 균열.12/.75/.12·후광1.4배/.25~.4·감소80ms | NativeScreenTransition(미이식) | 740722e1ac3a5f4b0143f55b6088b01b8517be0f | 426544563d | 미이식 | 현재 checkout에 공통 전환 실행기 없음; I: 준비본은 제품 반영 아님 |

5차 미니 스토리: 웹 `740722e1ac3a5f4b0143f55b6088b01b8517be0f`의 합성 번역 테이블과 Unity9694e3451c의 `visual_select_labels`를 대조해 5종×29언어145개 원문/번역 byte 차이0. `NativeLobby.SilverCharacter.SilverLore`에서 카탈로그를 읽으며 별도 문구 하드코딩 없음. 현행 웹은 오른쪽 정보 레일이다. 기존3차의 같은 UI 소스를 재사용하되 새 패키지의1x 최종 대조는 대기. 문구 [제안] 상태는 유지한다.

### 5차 소스 대조 갱신 — 2026-11-03

165개 기본행에서 소스로 확인한 다름/미이식을 명시했다. 나머지는 새 패키지 Player·입력·출력버퍼 검수가 아직 없으므로 미검증을 유지한다. `같음`은 소스 존재만으로 쓰지 않는다. 게임 내 공통창의 세부 팝업은 개별 행을 이어서 확장한다. 최신 전환 계약은12vh/후광1.4배이며 과거9.5vh 계약을 사용하지 않는다. 스킬 관리 I: 준비본은 웹 실제 함수와420개 상태 흐름 불일치0, 실행16 후보 Simulation107개 통과지만 현재 런타임/Player 반영 증거가 아니다.


## 2026-11-03 첫 실제 Player 근거와 전환 재작업

| 범위 | 실제 근거·현재 판정 |
|---|---|
| 공통 소스 | origin/unity/main426544563dcd7068ac661a7ee7876fd91f69d19a. 첫검수패키지2cb2a854015cff7335a27659fd74ca382342070b, 공통09192f7bbc의지면/실행기변경을424afc4f79로정상merge 후compile0·비강제push/ref확인. Mac실제checkout/런타임은미확인 |
| 공식 첫 빌드/M1 | acd55c48 Succeeded/errors0/USER_SAVE0. 같은패키지M1 9d4d20b1은23/23ok·32PNG. 실제1-2는미이식 |
| 홀드 | e5ec2f48 1920×1080/e36603d0 3840×1080 각각44/44. InputSystem가상장치→실제Lobby.Update,Space/ESC/B/Start×세계관/이야기.부분홀드·해제0·정상홀드·전투틱정지.사용자OS손입력과구분 |
| UI/오디오 | 21cdde43 76PNG(1920/2560/3840),결과문자열14개FAIL0. d4ea0ca0 일반477/477·e41a455d로비425/425 출력버퍼. 전체UI/청음100%같음으로승격하지않음 |
| 영상/1x | batch1-video-1920/3840 각각9무음VP9clips,실제frames.jsonl VFR. batch1-comparison.html 원본크기나란히. KO미니스토리획·일부테두리RETOUCH.60fps성능판정아님 |
| 패키지해시 | 첫Runtime51e441849b491b69c48245c5a18a8bab4ab796c4d927118ab467d249d903e6e7 / Corecf2b6cb6caee3ab29811d0c5b222622c76d572657f0771a1bceb42364906af7c 실제Managed동일 |
| 전환 작업브랜치 | codex/unity-parity-1102의757e572d6c8a24c1b157525977d36955495ee2c6은아직unity/main미반영. 둘째build9922028a는오류0이지만M1 37d9427c는01진입실패, 전환4b4102f2는타이밍2실패/실제PNG덮개정렬결함. 실행기exit0을M1통과로쓰지않음 |
| 재작업 | M1의캐릭터API별실제비동기경계대기·실패exit2, 요청시각부터realtime시계, 검정GUIBehaviour깊이유지, 요청id측정·실제검정배경픽셀검사로수정/compile0. 세번째새정식build·M1·양해상도Player검수전이며전환PASS아님 |
| 후속 | 전체55스킬/32합체/15추천·패시브·동적대장간I준비본은제품미인수. 살아있는화면·요약drawer·진짜1-2·획/핵/광택/리셋잔여도진행중. 바탕화면직접교체0 |

증거 루트: `I:/EXODUSER-Storage/codex-takeover/unity-parity-1102/fifth`. 첫검수 성공과 이후전환실패를별도로보존한다. 전체165행의같음판정은아직0이며,부분근거를행전체완료로확대하지않는다. 최신main374e75f71의보스/엘리트플래그·방어합산수정은다음스킬/패시브인수전에다시대조한다.
