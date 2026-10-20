# DEMO11-41 — BGM/voice 실제 media lifecycle

기준 origin/main `8dbbf2b0e699c36a93ca5cf41a2f3408be6da2c4`에
DEMO11-40 `85d57b39176c7158450841fbc0bfd8b25d7756fd`를 정상 merge했다.
DEMO11-01의 demo/stage0 권위는 유지한다. CHANGELOG 최상단 충돌은 양쪽 절을 보존해 해소했고,
아래 기존 이력의 literal marker는 별개로 보존했다. 정확한 기준 SHA는 외부 base.txt에 있다.
브랜치 `codex/demo11-41-20261021`, 원로그 `~/exoduser-wt/_out/demo11-41/`.

| 접점·원본 근거 | 실제 구현·공용 변경(최종 파일 행) |
|---|---|
| SND-05/06 G3982–4207 | bgm_catalog/selection/lifecycle 원본 모듈 무수정 재사용. 신규 native_music_media는 실제 AudioStreamPlayer·MP3/WAV/OGG·50ms Timer·interaction callback·캐시 퇴거/오류 정리를 제공. 선곡 RNG는 음향 전용이며 전투 RNG 소비0 |
| Main | L47 owner, L308 설치, L312 인트로 구독, L524 종료, L2925–2943 음향 API 추가만(+23/-0). State·보호 전투·저장·맵·데모 권위 변경0 |
| 40의 bus 위에 | native_combat_sound_consumer.gd L89–92 mix_output_bus 조회 추가. BGM은 독립 bus→Master/OPT.bgmVol, voice는 기존 SND08 mbus/OPT.sfxVol 이중 gain. SFX EQ/압축 bypass 한계는 그대로 |
| 현재 guide/field | native_intro_curtain_sequence.gd L3 음향 관찰 signal, L183 guide/L226 opening emit만 추가. begin/open의 판정·G writer·spawn 순서 본문 무수정. native_intro_key_guide_panel.gd L625–630은 기존 12줄 재생기 대신 lifecycle voice 요청. G63403–63407 wakeup·G62918/62980 field 복귀 참조 |
| 사망·종료 | 기존 player_died 구독, G43872 fade500→600ms death; victory 요청은 G43899 fade800→1000ms. 새 scene 후 오래된 terminal callback은 무효. pause/visibility는 Audio identity·위치를 보존해 정지/복귀, 종료는 음원·타이머·리스너·bus 해제 |
| 보스 인터페이스 HOLD | 실제 DEMO11-34 actor는 아직 main에 없음. Main.bind_native_boss_music(actor) 계약: signal native_boss_music_changed(phase: String, stage: int), phase entered/exited/victory·stage0. entered→boss(G17084), exited/actor 상실→field, victory→victory(G17129는 원본의 특정 경로이므로 일반 데모 victory 지연은 G43899 사용). actor 생성/전투 수정0, 신호 자체 발행은 actor 담당에게 요청 |
| 로비/영화 owner HOLD | main에 실제 로비/전체 영화 scene owner 없음. request_native_music_scene(lobby/intro, segment)로 원곡 재생·정지·복귀는 검수, 자연 owner 구독은 미연결. intro는 cutscene_prologue/nemesis/warintro 정확 segment 필요. 기상 guide에는 임의 BGM을 새로 넣지 않고 voice만 재생 |

원본 game.html SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`.
전체 원문/큰 JSON을 출력하지 않고 스트리밍 해시·선택 행만 source-receipt.json에 보존했다.
음원은 원본 root의 bgm/과 기존 res:// voice를 읽기 전용으로 lazy decode한다. 복사/변환/새 바이너리 커밋0.
기본 root는 res://../, 격리 테스트는 --source-root로 R을 읽기만 한다. 배포 export에 외부 bgm 자산을
포함하는 packaging은 미검수/HOLD이며 리소스 누락은 error/reject·원본 bad-src 정책으로 처리한다.
음향 scene context는 요청/인트로 관찰용이며 실제 G나 저장 형식에 쓰지 않는다.

| 검증 | 실제 결과 |
|---|---|
| 신규 통합 | 최종 **55/0**, 실제 창/CoreAudio·exit0·SCRIPT ERROR0·skip0. 원곡 playing·gain/bus·동일 Audio pause/복귀·voice queued→playing·pause 중 stop 후 비복귀·owner 상실·없는 파일 reject/handle 정리·terminal stale callback·종료 bus 원복 |
| 직접 관련 기존 회귀 | 무수정 SND05 **1,308/0**·SND06 **2,400/0**·DEMO11-40 첫44/0이나ObjectDB4경고(85d57b39 보존로그에도 동일4). 경고 조사용 verbose 재실행44/0·경고0, 새55검사도 누수 경고0. SND05/06은 각1회. P2007A는 960×540 창에서 좌표 불일치15실패 후 원래1920×1080으로 실패한 스위트만 재실행해 **115/0**, voice=played·실 GUI 입력·fallback0. 최종 전부 exit0·SCRIPT ERROR0 |
| 실패 기록 | new-01은 테스트가 없는 read_native_demo_authority를 호출해 coroutine 중단. 자기 PID만 종료하고 실제 read_native_demo_policy로 수정. new-02 재생6검사 실패, new-03은8실패. headless의 실제 Window.hidden에 따른 정상 suspend가 음원/Timer를 멈췄음. 초기 pause를 명시 해제하고 실제 창/CoreAudio의 new-04 52/0으로 검수. queued/playing 구분·복귀2검사 new-05 54/0. 리뷰에서 pause 후 stop의 stale resume 목록 경로를 수정하고 new-06 55/0 재검증. 성공 합산 없음 |

매 Godot 직전 pgrep count2 이상이면30초 대기, 각 테스트 상수의 격리명/override finally0byte.
신규 격리명은 EXODUSER-demo11-41-Isolated-20261021. 목록 생성 API 0건이며 Performance 수치 주장0.
실제 창/CoreAudio의 playing/bus/lifetime 검수이며 청감/PCM 동등성은 미확인. 기존 Camera2D interpolation
경고는 원로그에 남긴다. 보스는 fixture 신호 계약 테스트이며 실제 actor 연결 완료를 뜻하지 않는다.
