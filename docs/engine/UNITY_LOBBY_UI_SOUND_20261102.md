# Unity 로비 UI 사운드 웹 정합 — 2026-11-02

담당: `codex/unity-lobby-uisound-20261102`, 작업본 `G:/exoduser-wt/codex-unity-uisound`. 기준 Unity `95935cbd7`, 웹 `9ead4724b9aa65f0f4868d7c381d216b07a9cf9f`. 3차 버전/직업 잠김 표시와 분리해 소리 호출만 수정한다. 목표는 같은 원음·출력 레벨·입력 시점이며 최종 청음은 사용자 판정이다.

## 웹 소리 연결 전수표

`index.html`의 직접 연결뿐 아니라 `lobby-ui-feedback.js`의 문서 위임(`button,[role="menuitem"],.cs-ico`), `decision-sound.js`를 함께 조사했다. 표의 SFX는 저장 설정 `sfxVol/100`(기본 .6)이다. 일반 호버/확인·두둥은 SFX를 곱하고 인장/입장 루프와 ENTER는 웹처럼 고정 gain이다. 모든 샘플은 피치 1이다.

| 화면 | 요소 | 이벤트 | 원음 파일 | gain | 페이드 | 반복/중복 규칙 |
|---|---|---|---|---|---|---|
| 첫 인장 | `.cin-enter-btn` | mouseenter / mouseleave, 패드 진입/이탈 | `assets/lobby/11_loop.wav` | .7 | 진입100ms / 이탈80ms, 소스100ms 뒤 해제 | 루프, 새 진입은 새 소스 |
| 첫 인장 | ENTER | click / Enter / Space / 패드A | `assets/lobby/lobby_enter_sfx.mp3` | 2 | 없음 | 매번 새 재생, 일반 확인 제외 |
| 시작 메뉴 | 게임 시작/인트로/위시리스트/종료 | pointerover / focusin / 키보드·패드 이동 | `sfx/ui/button_hover.mp3` | .6×SFX | 없음 | 항목 변경 시. 웹 최신35ms, **이번 지시대로 Unity60ms 유지**, 마지막 항목 지연 재생 |
| 시작 메뉴 | 게임 시작/위시리스트 | click / Enter / Space / 패드A | `assets/lobby/lobby_enter_sfx.mp3` | 2 | 없음 | `data-ui-own-sound=true`, 일반 확인 제외 |
| 시작 메뉴 | 인트로 다시 보기/종료 | click / 키보드·패드 확정 | `sfx/ui/button_confirm.mp3` | .35×SFX | 없음 | 80ms 억제 |
| 로비 | 입장 `enterGameBtn` | mouseenter/leave, 키보드·패드 포커스 | `assets/lobby/11_loop.wav` | .7 | 100/80ms | 일반 호버 제외 |
| 로비 | 입장 | click / Enter / 패드A | `sfx/ui/decision/ddung_1.wav` | .8×SFX | BGM -6dB 800ms | 1850ms 억제, 일반 확인 제외. `showCharGate`는 enter, 이야기 뒤 new-game |
| 로비 | 새 캐릭터/캐릭터 카드/삭제 열기/시네마틱/언어/패치노트/종료/스크롤 | pointerover / focusin / 이동, click / 확정 | `sfx/ui/button_hover.mp3`, `sfx/ui/button_confirm.mp3` | .6/.35×SFX | 없음 | 일반 위임, 비활성 제외 |
| 로비 | Steam 위시리스트 링크들 | pointerover / focusin, click | 호버 원음, ENTER 원음 | .6×SFX / 2 | 없음 | 일반 확인 제외 |
| 직업 선택 | `.cs-ico` 5개 | pointerover / focusin / 키보드·패드 이동, click | 일반 호버/확인 원음 | .6/.35×SFX | 없음 | 준비중 직업도 미리보기 아이콘 선택 가능, 비활성 생성 버튼은 무음 |
| 직업 선택 | 생성 `visualCreateBtn` | click / Enter / 패드A | `sfx/ui/decision/ddung_1.wav` | .8×SFX | BGM -6dB 800ms | hero, 일반 확인 제외 |
| 이름 생성 | 생성 `createBtn` | click / 이름칸 Enter / 패드A | `sfx/ui/decision/ddung_1.wav` | .8×SFX | 동일 | create, 일반 확인 제외, 유효하지 않은 이름은 결정음 없음 |
| 직업/이름/삭제/종료 창 | 취소/닫기/탭 포커스 | pointerover / focusin / 이동, click / 확정 | 일반 호버/확인 원음 | .6/.35×SFX | 없음 | 60/80ms, Escape는 취소 입력과 통일 |
| 삭제 확인 | `delConfirmYes` | click / Enter / 패드A | `sfx/ui/decision/ddung_1_dark.wav` | .8×SFX | BGM -6dB 800ms | delete, 일반 확인 제외 |
| 언어 팝업 | selector/각 언어/닫기 | pointerover / focusin / 방향키·패드, click / Enter | 일반 호버/확인 원음 | .6/.35×SFX | 없음 | 경계/같은 항목 이동은 추가 호버 없음 |
| 패치노트 | launcher/닫기 | pointerover / focusin / Tab, click / Enter | 일반 호버/확인 원음 | .6/.35×SFX | 없음 | 일반 위임 |
| 영상/이야기 | 영상 배경·자막·다음/홀드스킵 영역 | click / keydown | 별도 UI 원음 연결 없음 | — | — | div/영상 영역에 일반 버튼음을 추가하지 않음 |
| 웹 로그인/계정 | 로그인·뒤로 등 실제 button | pointerover / focusin / click | 일반 호버/확인 원음 | .6/.35×SFX | 없음 | Unity에 해당 계정 화면이 없으므로 대상 없음 |

원본 기준: index 2535/2576(인장), 3802–3863(입장), 3414/3452/3931/4392(결정), 4574–4618(시작 메뉴), `lobby-ui-feedback.js` 전체. 제목 이동 함수 자체는 무음이지만 문서 `focusin/pointerover` 위임이 실제 소리를 낸다.

## 구현·검수 경계

- `NativeUiSounds`의 허용 조건을 로비까지 연결한다. 게임 내 gain/피치/믹서는 유지하고 로비는 `FrontendUI/UI`에 한 번만 SFX를 곱한다.
- 자체 입장/결정 버튼은 일반 확인에서 명시 제외한다. 결정 쿨다운으로 두둥이 거절되더라도 일반 확인으로 대체하지 않는다.
- 60ms 내 연속 이동의 마지막 항목을 남기고, 포인터가 떠나거나 앱 포커스를 잃으면 지연 호버를 취소한다.
- Unity 장치 무음 검수: 기존 `--unity-ui-sound-capture`에 `--unity-lobby-ui-sound-capture`를 함께 전달한다. 실제 GPU Player 프레임과 `AudioRenderer` 출력버퍼를 기록한다. 스크립트 콜백 검수이며 자연 조작/사람 청음으로 표기하지 않는다.
- 웹 전환·로딩 모듈이 공통에 들어오면 별도 같은 방식으로 인수한다. 이번 음향 수정에서 전환 아트·버전·잠김 표시를 바꾸지 않는다.

실행별 SHA/영수증·비교 영상·남은 차이는 `I:/EXODUSER-Storage/codex-takeover/unity-uisound/REPORT.md`에 기록한다. 바탕화면 교체는 자동 빌드 담당 범위다.
