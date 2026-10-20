# DEMO11-40 — 실제 전투 SFX consumer 연결

브랜치 `codex/demo11-40-20261021`, 기준 origin/main
`0105159934d0c2a8b167bd51518dca1e0fafe50a`. 작업 정의는
`codex/demo11-gap-20261021`의 `61ab71be`, DEMO11-40/D35/D36 행을 읽었다.
해당 문서는 main에 없어 참조만 했으며 다른 단위 제품 코드를 합치지 않았다.
사용자 2026-10-21 “나눠서” 승인으로 아래 음향 접점만 수정했다.

| 접점·원본 | 구현·변경 행 범위(최종 파일 기준) |
|---|---|
| Main 기존 `native_attack_audio_queued` | main.gd L44–45 신호/owner, L1632–1633 기존 audio event 전달. 전투 event는 처리하지 않음 |
| Main 설치·진행·조회·정리 | L2002–2005 소비자 설치, L2088–2092 기존 frame 소비를 SND로 위임·legacy queue 비움/조기 return, L2173 snapshot 위임, L2180 종료 정리. 기존 판정 본문 0줄 수정 |
| 기존 스킬 음향 | native_skill_slots.gd L297 slam의 재생 호출만 `_play_sample`로 변경, L498–501 음향 함수의 별도 AudioStreamPlayer2D 제거·Main 음향 요청으로 전달. Main L2883–2894 sample 진입점. 위치 인자는 남지만 기존 2D 자동 감쇠는 사용하지 않고 원본 sample backend 비공간 재생으로 통합 |
| SND 재사용 | policy/catalog(01/02), frame flush(03), backend/admission(07), mix graph(08). native_sound_backend.gd L45–55 출력 bus 지정·일괄 stop API 추가(기존 admission/cleanup 수식 유지). 새 consumer·AudioServer graph adapter는 자체 bus만 소유 |
| G12251–12294·12296–12326·12358–12370 | 기존 Main serial/30ms/jitter 호출 유지, 소비자 RNG0회. SND frame/category/중복 gain/pitch·active cap·duration+.5·finished/timeout 정리 재사용. 현재 요청의 명시 priority와 pitch/gain을 전달하고 SND-04 음성 선택을 새로 수행하지 않음 |
| G12272–12276·12408–12460 | sample gain와 mbus의 이중 OPT 적용. mbus gain0은 진행 중 보이스도 mute. backend→mbus→EQ역할3개→comp역할→Master. filter/comp는 명시적 **BYPASS_UNVERIFIED**: Q/knee/automation/PCM/청감 동등성 HOLD. 원본 효과를 Godot 효과로 임의 대체하지 않음 |

원본 game.html blob은 main과 동일하고, 스트리밍 해시/선택 행은 외부 `source-receipt.json`에 기록했다.
실행 코드·판정·자원·hurtE/hurtP·Q/E·State·저장·맵·원본·기존 테스트 변경 0.
Main 기존 호환 bus 2개는 남지만 그 경로의 voice는 0이며 음량이 중복 경로로 출력되지 않는다.
추가 MP3/바이너리 커밋 0. 기존 승인 MP3만 디코드한다.

| 검증 | 실제 결과 |
|---|---|
| 신규 통합 | **44검사/0실패**, 실제 Main 부팅·명시 캐릭터 선택·attack producer 요청→기존 이벤트→SND backend 1회, 같은 serial/phase 거절. 스킬 sample 진입점도 같은 backend 사용 |
| bus·중복·정리 | 실제 AudioStreamPlayer.playing, 3중 요청의 .48/.48/.24 gain(OPT.6), mbus .6, 모든 send의 왼쪽 순서, OPT0 mute, 캐릭터 변경 queue 폐기, source loss/pause stop, finished+stop 1회 정리, unsubscribe, standalone/Main 종료 후 bus_count 원복 |
| 기존 직접 관련 회귀 | 무수정 SND-03 **606/0**, SND-07 **2,004/0**, SND-08 mix **5,728/0**. 모두 exit0·SCRIPT ERROR0, backend/mix nodes_left0. 07/08 각1회, 03은 격리명 실패 후 재실행만 |
| 실패 후 수정 | new-01:6실패+null int SCRIPT ERROR → 초기 미선택 character guard와 테스트의 실제 캐릭터 선택 추가. new-02:3실패 → AudioServer.move_bus의 끝 위치를 -1로 수정. new-03:44/0, SCRIPT ERROR0. 검사 약화 없음 |
| 회귀 하니스 실패 | SND03 첫 실행은 격리명 대소문자를 잘못 지정해 1실패/exit1, 실제 source 시나리오0. 테스트는 수정하지 않고 파일 USERDIR 상수를 읽어 재실행 |

원로그 `~/exoduser-wt/_out/demo11-40/`. 매 Godot 직전 exact pgrep gate, 2 이상이면30초 대기,
각 실행 override를 finally에서 0byte로 비운다. 신규 USERDIR는
`EXODUSER-demo11-40-Isolated-20261021`, 기존은 각 파일 상수다.
관련 회귀만 실행했으며 전체 회귀/원본 전체 사운드/PC/실청취 PASS를 주장하지 않는다.
신규 실행은 Dummy driver 상태 검수로 청감·PCM은 미확인이다. Camera2D 기존 interpolation 경고는 원로그에 남겼다.

현재 샘플 소비자 연결과 중복·수명 검수까지다. SND-04/05/06의 새 보이스/BGM, 미이식 합성층,
원본 EQ/압축/automation의 native 출력과 청감 인수는 후속 HOLD다. 보호 전투 경로에 추가 신호가
필요하면 PC owner 인터페이스 요청으로 넘기며 이 단위에서 판정 hook을 추가하지 않았다.
