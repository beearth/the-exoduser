# 캐릭터 선택 미디어 읽기 진단

수신/첫 Read 2026-10-01T16:47:44Z, 첫 Edit(receipt)16:47:57Z, 첫 코드 Edit16:48:22Z. 최종 metadata/SHA 검사16:48:50.342Z~16:48:50.591Z. 완료는 receipt UTC 기록. 동일 완료 중복 없음. task와 실제 index/character-story-player/server 및 두 생성앱의 해당 파일을 읽었다. UI 관측은 task의 root 제공 증거이며 BUILD 추가 native 관측0.

## 실제 포함·헤더 대조
|경로|바이트|sample-entry 헤더|대조|
|---|---:|---|---|
|assets/charselect/bg_scene1_loop.mp4|515341|avc1,1280×720,avcC profile100/compat0/level31|원본/7918manifest/59376앱/abf57앱 SHA 일치|
|assets/charselect/idle_warrior_cs3_4k.mp4|14132329|avc1,3840×2160,profile100/compat0/level51|동일|
|video/world_intro_v13_exodus_en.mp4|32381760|avc1,1280×720,profile100/compat0/level31 + mp4a|동일; root 재생 관측 비교군|
|video/warrior_story_v23_clean.mp4|93670905|avc1,1920×1080,profile100/compat0/level50 + mp4a|동일; root 재생 관측 비교군|

네 파일 모두 ftyp/moov/free/mdat 경계가 파일 크기 안에 있고 moov가 mdat 앞에 있다. 누락·복사손상·LFS pointer는 이 네 파일에서 확인되지 않았다. header 검사와 decode 완전성은 다르다. 비교군 story는 character-story-player.js:21의 실제 연결을 읽고 포함했다. scene/idle 둘 중 AX 오류가 어느 element에서 발생했는지는 UNKNOWN.
ffprobe/mediainfo/ffmpeg가 command -v에서 발견되지 않았다. 설치하지 않고 자체 작은 ISO-BMFF box/sample-entry 헤더 읽기만 수행했다. sample-entry codec/profile/level 숫자는 실제 헤더값이며 브라우저 지원 판정이 아니다. 원본·두앱 총12파일의 streaming SHA와 metadata는 evidence에 기록했다. 4K idle의 해상도/level이 성공 비교군과 다르다는 사실만 확인하며 **일반 MP4 unsupported 또는 특정코덱 미지원으로 확정하지 않는다**.

## 경로·서버·폴백
index CHAR_VISUALS의 warrior sceneVid/idleVid는 assets/charselect 상대경로, query 버전 포함. main은 /index.html이므로 소스상 이 경로는 /assets/charselect로 해석된다. base override 발견 없음. 서버는 url pathname으로 query를 분리하고 mp4 MIME video/mp4를 제공한다. Range는 206/Content-Range/Content-Length/Accept-Ranges, HEAD의 Range 응답은 본문없이 종료한다. 실제 packaged server도 읽고 SHA 기록했다.
허용된 root3381의 **해당 idle 에셋만** HEAD1회 및 bytes0-63 Range1회를 시도했으나 두 요청 모두 curl7 연결 실패. 서버 미실행과 sandbox/접근 경계는 이 오류로 구분할 수 없어 실제 HTTP/MIME/Range 인수는 UNKNOWN. 새서버·접속 재시도·권한변경0. 헤더/오류는 head.txt/range-headers.txt/range-error.txt에 보존했다.
selectVisual의 idle.onerror는 정적 portrait/scene 폴백, readyState<2의5초 타이머도 정적 폴백이다. play rejection은 catch로 삼킨다. scene video는 별도 요소다. 소스 폴백 존재를 실제 화면/AX 폴백 성공으로 바꾸지 않는다.

## SHA 및 인계
- index.html `38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8`
- node-main.js `01b0c1d51f77f500ee0a59185458bf0294edce12544482d6cf7abce4262c91ce`
- character-story-player.js `3965e5d5767b26ab55bfcb7951306ecb67b2872c9518843eb853161c8ca72a94`
- scene `8630d175488e7afb9bf2a29a35eb3a4eb84cc3ab661e33c3da1ea376d6e205ad`
- idle `f982c42c9b60e64ddb644ae8c6f3983a08a9314597eb14b9a04065b485e6405f`
- world `19706b005ea6137e820dfe0bdb69244b782e693904f62795837453eed6608865`
- story `fb1b47274ab3f793ab3254182b44f83349958e4db435e4331f03c879389007bd`

root 잠금해제 후 **한 항목**: 현재 전사 선택의 csIdleVid/csSceneVid 각각 currentSrc·media.error.code/message·networkState/readyState 및 동일 요소의 실제 support 결과와 요청 status/Range를 기록하고 AX 오류의 소유 요소를 식별한다. 재생 성공 story를 함께 대조한다. 이 전까지 에셋 교체/인코딩/앱 재시작을 제안 적용하지 않는다. 원인은 미확정이다.
docs 전체 charselect/idle_warrior/bg_scene1/video MIME 검색을 docs-search.txt에 보존. 반영안은 해당 캐릭터 선택 문서에 포함/SHA/헤더 확인과 native 지원 UNKNOWN·잠금해제 gate를 분리 기록하는 것이다. 공유 docs 수정0. 최종 작은 검사 도구 node --check PASS. 임시 요약 one-liner 괄호 오류는 다음 읽기 명령으로 정정했으며 media 실패 증거가 아니다. 앱/원본/프로필/세이브/생산/타팀/Git/queue/새세션/보안/UI/디코드/인코딩 변경0. 결과 인계 뒤 root 대기.
