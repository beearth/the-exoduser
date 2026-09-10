# 대검전사 v22 — BGM 추가

요청: 전사 영상에 BGM 추가. 기존 무가사 주제가 「심연의 탈주」를 영상 음성과 함께 합성한다.

| 항목 | 현재 값 |
|---|---|
| 영상 원본 |output/cinematic/warintro_remaster_20260909/hell_drag_v21/final.mp4 |
| 음성 원본 |동일 폴더 narration.wav, gain1.0, 말속도·22cue·쉼 유지 |
| 음악 |bgm/cutscene/prologue_theme.mp3, 처음0~96.4초, 인스트루멘털 |
| 음악 기준 gain |0.2372462176403674, voice 활성 샘플 RMS ×0.5 / 원곡 RMS. 활성 샘플은 max(abs(L),abs(R))>.01 |
| 대사 중 덕킹 |음악 gain ×0.5, 발화150ms 전부터 감소·종료 후350ms 복귀. 겹치는 큐는 낮은 gain 우선 |
| 시작·끝 |음악만1.5초 fade-in, 마지막1.2초 fade-out |
| 실측 음성/음악 |발화 활성구간 RMS 0.09981054525369097 / 0.025346366767490636, 음성이 음악보다 약12dB 큼 |
| 마지막 쉼 |대사1초·1.5초 쉼 유지. 이 구간에도 BGM은 이어짐, 명령 뒤 음악 RMS 0.06481043789681579 |
| 믹스 |48kHz/2채널, AAC256kbps, 합성 전 peak<.95 검사, 최종 디코드 peak -5.2287821769714355dBFS |
| 영상 규격 |1920×1080/60fps,96.4초/5784프레임, H.264 영상 스트림 복사. 재인코딩·컷 수정 없음 |
| 영상 동일성 |압축 패킷 hash SHA256=76d80499feb6a52d7ae408fe5a6c9eaf10a4509dccc7b44ee64e55adcd30cf7a, v21과 동일 |
| 게임 파일 |video/warrior_story_v22_bgm.mp4, 87255213bytes, SHA256 ebc651acb31763cc1b9a216a378e953b8f43ba3ea8379736bf748d6fbf914164 |
| 바로 재생할 합본 |프로젝트 루트 대검전사_스토리_총합본.mp4도 BGM 버전으로 교체 |
| 보존 |v21 원본·기존 video/warrior_story_v21.mp4 보존. 교체 직전 루트 합본은 tmp/warrior_story_bgm/total_before_bgm.mp4 |
| 부분 스킵 |같은 MP4에 영상·영어 음성·BGM·한글 자막 포함. 기존22개 CUES로 함께 탐색, 전체 스킵 시 함께 정지 |
| 로비·후속 |로비 BGM은 정지, v22 자체 BGM만 재생. 이후 네메시스 INTRO의 기존 음악·조작 유지 |
| 로더 |index.html: character-story-player.js?v=20260910-hints-fade (조작 안내3초 후0.4초 페이드, v22 미디어 유지) |
| URL 계약 |story=warrior-v21은 기존 진입 경로 표시로 유지, 재생 파일 버전 판정에 사용하지 않음 |
| 빌드 |tools/build_warrior_story_bgm.py, float 임시 믹스 tmp/warrior_story_bgm/mix.wav |
| 미디어 검사 |전체 디코드 PASS, 영상 패킷 동일, 오디오 길이96.4초, 믹스 상관 0.9999598384461792 |
| 브라우저 검사 |실제 v22 재생·오디오 디코딩, Enter→90.333333초 부분 스킵, Esc1200ms 전체 종료·미디어 해제 PASS |
| 회귀 |characterStoryControls/characterStoryCreation18개 PASS |
| 검수 범위 |기술·레벨·브라우저 동기화 검사. 사람의 전체 청취 승인 전 |
| 증거 |output/cinematic/warrior_story_bgm_20260910/mix_qa.json, browser_qa.json, runtime_ending.png, ending_bgm_preview.mp4 |
