# 세계관 시네마틱 정본 적용 — 2026-10-25

| 구분 | 확정값/상태 |
|---|---|
| 사용자 지정 | PC 이식 작업 채팅의 실제 사용자 첨부와 “최신 세계관 시네마틱은 저건데” 발언 확인 |
| 정본 경로 | `I:/EXODUSER-Storage/SteamUpload/world_intro_v22b_steam.mp4` |
| 정확 크기 | 102,204,634 bytes |
| SHA256 | `3b99d59bca9d84a37bb6b49067148e1ed69fefb478ff206221b59c8c952d0b0f` |
| 최신본 승인 | 확정. steam 접미사/폴더를 이유로 적용 제외하지 않음 |
| Mac 현물 인수 | Git 인계 a4d3ce3ea1e2cb2bc5db5a6e8d1ead33cfaec976의 4부분을 동일 bytes로 복원, 크기/SHA 일치 |
| 현재 실행본 | 소스 연결·복원 도구·export·빌드 해시 가드 갱신 완료. 신규 Mac 실행 검수 대기 |
| 적용 계획 | 동일 bytes 인수·SHA 대조→영상/음향/내장 자막 확인→정확 파일 연결→Mac 정상 앱으로 실제 자연재생/전환 확인 |
| 보존 | 이전 후보/Godot/사용자 저장 보존, 재인코딩/새 유료 생성 없음 |

원격 main fab7a167c30c6421bda8cf6d4c2ee2e7753e87f3 index의 v17은 현행 코드 연결 이력이며 최신 사용자 지정 정본이 아니다. 이 구분으로 이전 승인미확정 판단을 정정한다. 정확 영상 분석: 1920×1080 H264, 30fps, 113.70초, AAC 48kHz stereo, 자막 트랙 없음. 6/35/93초 추출 프레임에 내장 글자가 보이지 않음. 전체 프레임 OCR 판정은 아님.

음성 첫35초 mono8kHz 상호상관으로 이전 후보 대비 정확 +0.400초 지연 확인(정렬 상관계수0.9999959555). 이에 기존29언어×32cue/17cut 원본은 보존하고 runtime에서 cue clock=movie.Time−0.4, next-cut target=source cut+0.4 적용. BGM gain .22/voice1 유지. 근거: QA canonical-media/audio-alignment.json. 원본파일은 재인코딩하지 않았다.

원본 UI 대조: 별도 localhost3347/격리 저장·full/test 모드의 main index를 열어 1920×1080 세계관·자연 로비·지옥문을 확인했다. 브라우저 캡처는 CUA 대화 이미지. 로비 인물/배경/오른쪽 패널의 주요 구도는 누적 Unity와 유지된다. 명확한 전환 차이는 Unity의 ENTER 클릭 직후 로고 즉시 소멸, 문 끝1.5초 fade 부재, 세계관 준비 중 문 포스터 재등장 가능 경로다. 정본 인수와 함께 이 차이를 보정한다. v17의 재생 성공을 정본 영상 성공으로 계산하지 않는다.

전환 수정: 지옥문 ENTER 뒤 로고/입장 아트를 즉시 제거하지 않고1.1초 smooth fade, 문 영상의 실제 남은1.5초 fade, 세계관 decoder 준비 중에는 검정 화면을 유지하고 닫힌 문 포스터를 다시 표시하지 않는다. CSS blur/이동의 완전복제는 아니며 source 시간과 불연속 제거를 우선한다. 새 미디어에 대한 실제 실행 검수는 인수 후 시행한다.

Git 경계: Mac 실행 source R=`/Users/fordeargamers/exoduser-wt/UNITY-MAC-20261024`, HEAD/remote Unity branch `ad4dc1f86b2c4db1fd6f9e5e4f1699b3196b3e3e`; origin/main `fab7a167c30c6421bda8cf6d4c2ee2e7753e87f3`. main...HEAD 좌/우14/454. 전용branch 백업 완료와 main통합·PC실행동기화는 별개다. PC의staged WIP에 강제pull/merge하지 않는다.

전용 검수 `--unity-canonical-world-smoke`: 실행 앱의 정확 파일 bytes/SHA·문 초대 fade·문 끝 fade·준비 화면·신규 정본 자연끝/속도/정체/음성출력/게임정지 검사. 영상6/35/93초와 자연종료 로비 캡처. 구영상의 통과를 재사용하지 않으며 기존 인벤토리/캐릭터/설정 검사는 반복하지 않는다.

이전 후보 runtime와meta는 QA canonical-media/previous-candidate에 복사·SHA 대조 후 Assets 밖으로 옮겼다. 새 패키지에 미사용 후보를 중복 포함하지 않으며 Git의 이전 복원 부분은 보존한다. 최신 작업 기준은 실제 웹의 기존 화면/입력/전환 재현이며 새 기능 확장은 제외한다. 원격main 브라우저 대조와 PC 실제 미커밋 실행본 대조는 구별한다.

## 원본 화면 재현 후속

우선순위는 웹 이식→동일 입력/장면 비교와 누락 수정→그 뒤 신규 업데이트다. 에디터/API는 import/배치/연결/검수에 우선 사용한다. 현재 대조 원본은 앞서 실제 열어 본 별도 main index(fab7a167...)와 cin-enter-engraved.css이며, PC 실행 중 미커밋 웹과 완전 일치했다고 주장하지 않는다.

확인된 차이: 재생 중 상시 pause 버튼은 원본의 world-intro-attention 조건과 달랐다. 원본처럼 일시정지/오류시에만 회복 버튼을 표시한다. 언어 선택은 오른쪽4vw/위3vh의 작은 표시로 맞추고, 아래30px/오른쪽30px의120×100 원형 hold 표시(r34/th3)로 변경한다. 기존5초 동작 유지. 문 화면은 원본 CSS radial/linear 배경과 제목 뒤 radial을 런타임 텍스처로 재현해 밝은 원영상 위 글자가 묻히는 차이를 줄인다. logo blur/미세 이동·hover 호흡·진행90% glow·게임패드 표시는 아직 완전 동등 미검증이다.
