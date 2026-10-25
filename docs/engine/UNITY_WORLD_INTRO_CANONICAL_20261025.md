# 세계관 시네마틱 정본 적용 — 2026-10-25

| 구분 | 확정값/상태 |
|---|---|
| 사용자 지정 | PC 이식 작업 채팅의 실제 사용자 첨부와 “최신 세계관 시네마틱은 저건데” 발언 확인 |
| 정본 경로 | `I:/EXODUSER-Storage/SteamUpload/world_intro_v22b_steam.mp4` |
| 정확 크기 | 102,204,634 bytes |
| SHA256 | `3b99d59bca9d84a37bb6b49067148e1ed69fefb478ff206221b59c8c952d0b0f` |
| 최신본 승인 | 확정. steam 접미사/폴더를 이유로 적용 제외하지 않음 |
| Mac 현물 인수 | Git 인계 a4d3ce3ea1e2cb2bc5db5a6e8d1ead33cfaec976의 4부분을 동일 bytes로 복원, 크기/SHA 일치 |
| 현재 실행본 | 정본 연결 source c0a8a7d2c, ARM64 build errors0, 실제113.628초 자연완주와 로비 진입 PASS. 웹 표시 후속 d789dd1ae 빌드 errors0, 자연완주12/12·7PNG 시각확인. 일반 입력 관찰과 동시 사용자 조작 제한은 아래 기록 |
| 적용 계획 | 동일 bytes 인수·SHA 대조→영상/음향/내장 자막 확인→정확 파일 연결→Mac 정상 앱으로 실제 자연재생/전환 확인 |
| 보존 | 이전 후보/Godot/사용자 저장 보존, 재인코딩/새 유료 생성 없음 |

원격 main fab7a167c30c6421bda8cf6d4c2ee2e7753e87f3 index의 v17은 현행 코드 연결 이력이며 최신 사용자 지정 정본이 아니다. 이 구분으로 이전 승인미확정 판단을 정정한다. 정확 영상 분석: 1920×1080 H264, 30fps, 113.70초, AAC 48kHz stereo, 자막 트랙 없음. 6/35/93초 추출 프레임에 내장 글자가 보이지 않음. 전체 프레임 OCR 판정은 아님.

음성 첫35초 mono8kHz 상호상관으로 이전 후보 대비 정확 +0.400초 지연 확인(정렬 상관계수0.9999959555). 이에 기존29언어×32cue/17cut 원본은 보존하고 runtime에서 cue clock=movie.Time−0.4, next-cut target=source cut+0.4 적용. BGM gain .22/voice1 유지. 근거: QA canonical-media/audio-alignment.json. 원본파일은 재인코딩하지 않았다.

원본 UI 대조: 별도 localhost3347/격리 저장·full/test 모드의 main index를 열어 1920×1080 세계관·자연 로비·지옥문을 확인했다. 브라우저 캡처는 CUA 대화 이미지. 로비 인물/배경/오른쪽 패널의 주요 구도는 누적 Unity와 유지된다. 명확한 전환 차이는 Unity의 ENTER 클릭 직후 로고 즉시 소멸, 문 끝1.5초 fade 부재, 세계관 준비 중 문 포스터 재등장 가능 경로다. 정본 인수와 함께 이 차이를 보정한다. v17의 재생 성공을 정본 영상 성공으로 계산하지 않는다.

전환 수정: 지옥문 ENTER 뒤 로고/입장 아트를 즉시 제거하지 않고1.1초 smooth fade, 문 영상의 실제 남은1.5초 fade, 세계관 decoder 준비 중에는 검정 화면을 유지하고 닫힌 문 포스터를 다시 표시하지 않는다. CSS blur/이동의 완전복제는 아니며 source 시간과 불연속 제거를 우선한다. 새 정본 실제 실행 c0a8a7d2c 검수12/12 PASS. 후속 표시 수정은 아래 별도 기록한다.

Git 경계: Mac 실행 source R=`/Users/fordeargamers/exoduser-wt/UNITY-MAC-20261024`, HEAD/remote Unity branch `ad4dc1f86b2c4db1fd6f9e5e4f1699b3196b3e3e`; origin/main `fab7a167c30c6421bda8cf6d4c2ee2e7753e87f3`. main...HEAD 좌/우14/454. 전용branch 백업 완료와 main통합·PC실행동기화는 별개다. PC의staged WIP에 강제pull/merge하지 않는다.

전용 검수 `--unity-canonical-world-smoke`: 실행 앱의 정확 파일 bytes/SHA·문 초대 fade·문 끝 fade·준비 화면·신규 정본 자연끝/속도/정체/음성출력/게임정지 검사. 영상6/35/93초와 자연종료 로비 캡처. 구영상의 통과를 재사용하지 않으며 기존 인벤토리/캐릭터/설정 검사는 반복하지 않는다.

이전 후보 runtime와meta는 QA canonical-media/previous-candidate에 복사·SHA 대조 후 Assets 밖으로 옮겼다. 새 패키지에 미사용 후보를 중복 포함하지 않으며 Git의 이전 복원 부분은 보존한다. 최신 작업 기준은 실제 웹의 기존 화면/입력/전환 재현이며 새 기능 확장은 제외한다. 원격main 브라우저 대조와 PC 실제 미커밋 실행본 대조는 구별한다.

## 원본 화면 재현 후속

우선순위는 웹 이식→동일 입력/장면 비교와 누락 수정→그 뒤 신규 업데이트다. 에디터/API는 import/배치/연결/검수에 우선 사용한다. 현재 대조 원본은 앞서 실제 열어 본 별도 main index(fab7a167...)와 cin-enter-engraved.css이며, PC 실행 중 미커밋 웹과 완전 일치했다고 주장하지 않는다.

확인된 차이: 재생 중 상시 pause 버튼은 원본의 world-intro-attention 조건과 달랐다. 원본처럼 일시정지/오류시에만 회복 버튼을 표시한다. 언어 선택은 오른쪽4vw/위3vh의 작은 표시로 맞추고, 아래30px/오른쪽30px의120×100 원형 hold 표시(r34/th3)로 변경한다. 기존5초 동작 유지. 문 화면은 원본 CSS radial/linear 배경과 제목 뒤 radial을 런타임 텍스처로 재현해 밝은 원영상 위 글자가 묻히는 차이를 줄인다. logo blur/미세 이동·hover 호흡·진행90% glow·게임패드 표시는 아직 완전 동등 미검증이다.

## 정본 실제 실행 검수

source c0a8a7d2c6e1658b328bc5abe22b5ed2487a89fc, 원격 동일 SHA 보존 후 build-canonical-world/EXODUSER-Unity.app 빌드. LaunchServices PID37618 실제 실행, --unity-canonical-world-smoke는 사용자 캐릭터 저장을 읽거나 쓰지 않음. 검사12/12 PASS, native VideoPlayer duration113.667초/wall113.6279초/3409프레임 변화, 최대 frame gap0.0481초/progress stall0.0393초, speed1, voicepeak0.4261/listenerpeak0.4846, audio buffer warnings0. 자연끝 이벤트와 로비 최종화면 확인. 한국어6/35/93초 자막/프레임 및 문 fade·로비7PNG 검토.

원본 metadata에 color primaries 태그가 없어 AVFoundation 기본 색공간 경고가 있다. 정확 byte를 보존했으며 색도계 수준 일치는 미검증이다. 영수증 nested playback의 기존 fixture 범용 bool은 이번 전용루틴이 채우지 않아 false가 남아 있으며 이번 판정은 상단 checks/WorldPlayback.endedEvent/최종PNG에 따른다. 범용 false를 회귀검사 실패나 해당 동작 확인으로 오해하지 않는다.

참조 파일 pin: `canonical-media/reference-files.json`에 대조 index 및 CSS/player/subtitles의 실제 symlink 해석 경로와 SHA256을 기록했다. index만 원격main snapshot이며 나머지 파일을 PC 최신 미커밋과 동일하다고 확장 주장하지 않는다.

## 최종 표시 빌드·인수

- source/remote: `d789dd1ae2bec83d71085dc8038be92e0a92118f`. ARM64/Unity6000.6.7f1, errors0, 1,537,263,355B. 실행 경로 `build-canonical-web-ui/EXODUSER-Unity.app`.
- 같은 정확 정본 bytes/SHA, 자연완주12/12 PASS. 실제113.6343초/duration113.667초, frame gap 최대0.042761초/progress stall0.034805초,3409프레임 변화, 속도1, 음성peak0.426086/최종출력0.430752, buffer warning0. UI 렌더 변경 후 긴 재생 멈춤 없음.
- 새7PNG 직접검토: 문 음영/로고, Enter fade, 문 끝 fade, 영상6/35/93초 한국어 자막·언어버튼·hold 링, 자연종료 로비. [기계 판독 증거](UNITY_WORLD_INTRO_CANONICAL_20261025.json). 기준대비 확인한 차이만 수정 완료이며 전체 웹 픽셀/동작 동등 판정은 아님.
- 검수 CLI 없는 일반 LaunchServices PID38141: 실제 문/영상 표시, Right 후 다음 장면·한국어 자막, ESC5500ms 후 로비0/5 관찰. 언어 버튼 클릭/L의 메뉴 열기는 이번에 확인되지 않았다. 도중 CUA가 사용자의 동시 앱 변경을 알렸고 최종 화면은 사용자가 진행한 전사 이야기였다. 해당 상태/저장은 보존하고 추가 입력을 중단했다. 입력 관찰을 통제된 전수검사라고 계산하지 않는다.
- 다음 이식 차이: 사용자 조작과 충돌하지 않는 실행에서 언어 메뉴 마우스/키보드 경로 확정, CSS dissolve blur/이동·ENTER 호흡/hover 및 웹 로비 실제 저장 흐름 대조. 신규 디자인/업데이트 착수 전 기존 웹 이식 우선. PC 현재 실제 실행 WIP와의 동등성은 별도이며 원격branch만으로 main/PC동기화 완료가 아니다.
