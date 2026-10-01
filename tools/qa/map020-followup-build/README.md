# BUILD·ITEM·SOUND 독립 검수 도구

2026-10-01 Mac 후속 검수. 생산 HTML/맵/UI, 세이브, Git 인덱스를 변경하지 않는다. 기준 실행 HEAD는 `bc7cc03756b57fb999a67ca60a29f1fe852df24c`.

## 실행

저장소 루트에서 실행한다. JSON은 stdout이며 결과 경로는 실행자가 지정한다.

```sh
python3 tools/qa/map020-followup-build/build-audit.py
/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node tools/qa/map020-followup-build/item-audit.cjs
python3 tools/qa/map020-followup-build/sound-audit.py /Users/fordeargamers/Documents/Codex/2026-10-01/dho/outputs/map020-variants-20261001/build-item-sound/<새-인수-폴더>
```

SOUND는 지정된 출력 루트 아래 새 폴더만 허용하며 기존 폴더는 거절한다. 별도 SOUND SHA의 `audio_review/S-02/` 13개(후보9+측정3+README)만 Git blob으로 읽어 추출한다. 원본 WAV는 읽기만 한다. 인코딩·병합·재생 없음. 한 번 인수한 폴더를 보존하고 같은 검사를 위해 사본을 반복 생성하지 않는다.

## 실제 실행 결과와 한계

- BUILD: 25 PASS / 2 WARN / 0 FAIL. 선택 항목 `credits.html`, `output/imagegen/forge-tabs-v3` 부재만 WARN. 실제 HTML parser로 script/link만 수집하여 JS 문자열 속 src/href 오탐을 방지한다. 본편69·쉬운판52 참조와 빌드 포함 계약, 캐시 상호 일치·포트/저장 격리·입력95파일 SHA를 검사한다. 디렉터리 전체·패키지·HTTP·재실행 검수는 아니다.
- ITEM: 최초 MAP020 실행은 25 PASS / 1 FAIL로 본편 컷아웃 실패→물리 PNG 성공 시 마스킹 누락을 재현했다. 2026-10-01 후속 최소 수정 후 현재 실행은 **26 PASS / 0 FAIL, 종료코드0**이다. 실제 함수 AST 추출과 DOM/Image/canvas 스텁을 사용하므로 실화면 검수와 구분한다. 별도 `test/worldItemSkinFallback.test.js`는 native canvas 픽셀과 제어된 이미지 로딩으로 9/9 회귀 통과. 쉬운판의 컷아웃 없는 구조는 보존했다.
- SOUND: 후보9/9와 원본3/3은 macOS CoreAudio로 시작4096프레임(48kHz 기준 약85ms) 디코딩 성공. Ogg/Opus6/6은 페이지 경계·순서·EOS 검사 통과. `ffprobe/ffmpeg` 설치가 없어 내장 `afinfo` 및 `ExtAudioFileRead`를 사용한다. 전곡 디코딩·CRC·루프 이음새·음질·청취·브라우저 재생은 검사하지 않았다.

원본 후보의 정정 사항: BUILD cache21 고정값은 폐기하고 현재 양쪽 링크만 비교한다. SOUND 예상 파일명 대신 Git 트리의 `(Remastered).mp3_256k.mp3`/`.ogg_q6.ogg`/`.opus_160k.opus`를 쓴다. ITEM의 본편/쉬운판 스킨 경로 차이를 구분하며 미적용 후보의 `transparent` 고정값도 실패 폴백의 실제 소스 변경을 추적하지 못하므로 그대로 채택하지 않는다. `uniqueId` 신규 연결·원화 채택은 수행하지 않았다.

실제 결과 JSON과 docs 삽입용 문구는 `/Users/fordeargamers/Documents/Codex/2026-10-01/dho/outputs/map020-variants-20261001/build-item-sound/`에 있다. QA 게임 측정과 겹치는 빌드·대량 인코딩은 하지 않았다.
