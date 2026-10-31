# 중요한 결정 순간 두둥 — 웹 구현·비교 (2026-10-31)

사용자 브리프 decision-sound-brief.md에 따라 일반 클릭과 구분되는 두 번의 저음 타격을 확정 경로에 연결했다. 최종 청음 선택 전이며 **임시 기본 후보는 1**이다. 비교는 실제 캐릭터 선택·이름 생성 화면에서 한다.

## 제작 전 목표와 방법

| 항목 | 이번 작업 기준 |
|---|---|
| 목표 장면 | 클래스 생성 버튼 → 이름 생성 버튼 → 새 캐릭터 이야기 → 게임 입장, 기존 슬롯 입장, 캐릭터 삭제 확정 |
| 현재 차이 | 일반 button_confirm과 기존 입장음만 있어 중요한 결정의 무게·두 타격 리듬을 구분하기 어려움 |
| 대조 자료 | 실제 index.html 생성 화면, 기존 sfx/ui/button_confirm.mp3·sfx/hit/heavy_hit.mp3·sfx/scarecrow_boom.mp3. 기존 파일은 단발·일반 피드백이라 전용 두 타격을 새로 제작. SFX Forge 42후보를 이번 선택으로 간주하지 않음 |
| 제작 | ElevenLabs v2 후보 3개 → 첫 타격 추출 → 정확한 간격으로 2회 조립 → 짧은 잔향·레벨 정리 → 삭제용 어두운 변형. 프롬프트·가공·SHA는 sfx/ui/decision/manifest.json |
| 조기 판정 | 실제 생성 버튼 영상과 PCM 출력 캡처. 일반 탐색 제외·두 타격·무음 설정·클리핑·중복·덕킹 검증 |
| 합격/중단 | 기능 회귀·클리핑·타격 3회·중복 재생이면 수정. 사용자 귀로 장면 적합성을 고르기 전 청음 PASS로 올리지 않음 |

## 실제 적용 지점

| ID | 실제 확정 위치 | 사운드 키 | 적용·제외 |
|---|---|---|---|
| D01 | index.html _visualConfirm / visualCreateBtn | hero | 플레이 가능한 영웅·클래스 확정. 잠금 클래스와 미리보기 이동 제외 |
| D02 | index.html _enterOffline의 createBtn, doCreateChar | create | 이름 검증 통과 후 생성 제출. 키보드·패드도 같은 버튼/처리기. 오류·취소·입력 중 제외. 성공 저장을 뜻하는 로그와는 구분 |
| D03 | index.html showCharGate | enter | 슬롯 선택 후 입장. 단순 슬롯 탐색 제외. 기존 playEnterSFX 중복 제거 |
| D04 | index.html _afterCharacterCreated → showCharGate(storySeen=true) | new-game | 새 캐릭터 이야기 종료·건너뛰기 뒤 실제 새 게임 입장. 별도 새 게임 버튼을 만들지 않음 |
| D05 | game.html _showNextDiffPop의 go / ndGo | difficulty | 현행 로비에는 난이도 확정창이 없음. 실제 선택 확정이 있는 다음 난관 난이도 창에 적용. 카드 탐색·설정 슬라이더 제외. 연타 시 진행도 1회 |
| D06 | index.html delConfirmYes / data-decision-sound=delete | delete | 캐릭터 이름이 있는 삭제 확인창만 어두운 변형. 같은 확인창을 쓰는 게임 종료·취소 제외 |

첫 화면 인장 ENTER와 승인된 게이트 그림은 그대로 유지한다. 메뉴·탭·설정·호버는 기존 UI 소리이며 두둥을 호출하지 않는다. lobby-ui-feedback.js는 D01·D02·D06의 일반 확인음을 중복 재생하지 않는다.

## 파일·재생 계약

| 후보 | 이름 | 일반 / 삭제 파일 | 두 타격 간격 | 길이 |
|---|---|---|---|---|
| 1 | 흑철의 서약 | sfx/ui/decision/ddung_1.wav / ddung_1_dark.wav | 0.42초 | 1.8초 |
| 2 | 심연의 봉인 | sfx/ui/decision/ddung_2.wav / ddung_2_dark.wav | 0.46초 | 1.8초 |
| 3 | 지옥문의 판결 | sfx/ui/decision/ddung_3.wav / ddung_3_dark.wav | 0.38초 | 1.8초 |

- WAV PCM16·44,100Hz·스테레오. 파일 RMS -23dBFS, 관측 peak -6.78~-8.45dBFS. 수치는 불량 검사이며 청음 판정이 아니다.
- decision-sound.js: 기본 1, URL ddung=1/2/3만 허용. 입장 URL에도 후보를 전달. 효과음 gain = 0.8 × clamp(sfxVol,0,100)/100. 로비는 hellcave_settings.opt.sfxVol, 게임은 현행 OPT.sfxVol. 별도 UI 음량 설정은 현재 없으므로 효과음 설정을 따른다. 0이면 재생·덕킹 모두 생략.
- BGM은 원본 volume/페이드와 분리한 gain에 10^(-6/20)을 적용하고 800ms 뒤 1로 복귀. 로비 lobbyBGM과 게임 BGM의 HTMLAudio 경로를 연결하고 LRU 축출 시 연결을 해제한다.
- 1,850ms 동안 결정음 중복을 버린다. 파일 로드/디코드 실패 시 0/0.42초 두 번의 짧은 저음 합성으로 폴백. AudioContext 잠금은 첫 pointerdown/keydown에서 해제하며 자동 검수는 스피커 무음.
- localhost의 test=1&lobby=1&ddung=N&ddungReview=1만 실제 생성창으로 바로 진입한다. 서버 세이브와 브라우저 프로필을 사용자 저장에서 격리한다. 보통 게임 진입은 기존 흐름이다.
- NW.js FILES 목록에 decision-sound.js를 포함했다. 함께 확인된 기존 fullscreen-art 4파일·currency-orb 2파일 누락도 현재 entry 참조와 맞췄다. 패키징 목록 검증이며 새 NW/Steam 배포는 수행하지 않았다.

## 검수와 남은 경계

관련 로비·생성·저장경로·오디오·패키징 회귀 340개 통과(29파일), 프로젝트 검사 110/110, 보호 guard PASS. 추출 함수 테스트는 음성 모듈 미노출이어도 확정/저장 흐름을 보존하도록 optional 호출한다. 기존 테스트의 full/demo 입력 누락 2곳을 실제 의도와 맞췄다.

비교 서버 127.0.0.1:3357은 전용 작업본의 server.cjs를 PowerShell Start-Process -WindowStyle Hidden으로 분리 실행하며 세이브는 I:/EXODUSER-Storage/decision-sound/review-saves. 비교 주소·영상·1920×1080/2560×1080/3840×1080 화면·최종 HTTP 증거는 G:/exoduser/tmp/design-review/20261031_decision_sound/REPORT.md에 기록한다. 실제 화면을 확인했지만 기존 슈퍼와이드 아트 완성도까지 이번 사운드 작업의 PASS로 올리지 않는다.

**청음 최종 판정: 사용자 선택 대기.** PCM·동작 동기화와 기술 검증은 사용자 청취를 대신하지 않는다. Unity는 ui-sound-brief.md에 이 계약을 인계하며 Unity 구현·빌드 완료를 주장하지 않는다.
