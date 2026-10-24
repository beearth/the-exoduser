# PORT-TAKEOVER-03 — 모체17 산란 마법의 원본 샘플 레이어

2026-10-24 KST. 같은 PC 인수 브랜치에서 기준 `c523dcc0d7f1bbde9631cfeffb3fd2ffd9eeae21` 후속. 공용 main·타 팀 WIP·사용자 세이브·기존 실행창은 수정하지 않는다. 증거/수정 전 사본은 `I:/EXODUSER-Storage/qa/port-magic-20261024/`에 둔다.

실제 미연결 호출은 `native_demo11_etype_g_kernel.gd::_branch_17`의 산란 성공 뒤 `SFX.magic(3)`이다. 텔레포트 효과음이라는 초기 추정은 정정한다. 이 단위는 **원본 fire_magic1 샘플 레이어만 연결**하며 완전한 마법·돌진·그로기 효과음 이식이 아니다.

| 항목 | 원본 / 구현 |
|---|---|
| 원본 고정 | `godot/source_snapshot/game.html`, SHA256 `dee094fd165e9b2fb3fbf0eb9cacc3bc3eddeb2c8eeea9c4772ba6cbc1f05209` |
| caller | G39033–39046 모체17: 자식 생성 뒤 `SFX.magic(3)`; 기존 kernel/생성 조건 수정0 |
| 샘플 | G12626 `playSample('fire_magic1',.35,_r(.6,.06))` |
| asset | `sfx/magic/fire_magic1.mp3` → `godot/assets/sfx/enemy_magic_source/fire_magic1.mp3`; 257,280 bytes, 웹 실체/인수 source/native 3곳 SHA256 `10817bd18c0dc06c2c66e80ce1a839f768e22c35822b000da1b3ae3cadd4baa0` 동일 |
| 피치 | `.6*(1+(u1-.5)*2*.06) * (.92+u2*.16)`; 샘플 레이어 난수2회, 큐 receipt에 두 값을 관측 |
| 실제 경로 | G `sfx` → Main `request_native_enemy_magic_sample` → 기존 `_queue_native_attack_sample` → 기존 SND03/SND07/SFX→Master |
| 우선순위 | fire_magic1은 원본 skill key. priority=true, 같은 프레임의 동일 key 2회도 30ms 억제를 적용하지 않음 |
| 거절 | 실제 G owner·현재 stage·옵션/원본 MP3/캐릭터 준비 guard; paused/foreign caller 거절 유지 |
| 미이식 표시 | `SFX.magic.procedural_layers`, `SFX.charge`, `SFX.groggy` 유지. 다른 원소/절차음을 fire_magic1로 대체하지 않음 |

원본 magic(3)은 샘플 외에 noise(.06,3000,.04,1500,.002,bandpass), sub(55,.08,.05,35), FM(150,40,300,.12,.05,sawtooth,80), dist(80,.1,square,.03,30,30)를 호출한다. 기존 `synthesis.gd`는 주입된 graph adapter에 명령을 내리는 계산 모듈이며 현재 native 합성 PCM 출력 adapter가 없다. 이 4층·전체 cue RNG/PCM/청감 동일성은 미완료다. 샘플 성공을 전체 `SFX.magic(3)` 완료로 올리지 않는다.

## 검수

기존 G runtime 검사에 sample key/gain/priority·두 피치 난수의 원본 연산·2회 동시 재생·paused/foreign 거절·미이식 유지 검사를 추가했다. 전체 G 검사에서는 기존 picker로 캐릭터를 명시 선택한 뒤 실제 모체 kernel이 Main 큐에 도달하는 event도 관측한다. Provider/수동 World tick/생존 fixture를 쓰며 자연 플레이 종주가 아니다.

| 실행 | 결과 |
|---|---|
| RED | 108검사/1실패, SCRIPT ERROR0/ERROR0: `G dark magic source sample bridge exists` |
| WASAPI 집중 | 122검사/0실패, exit0/SCRIPT ERROR0/ERROR0. 이동음 검사 포함, 실제 magic 재생 노드2, complete_cue=false |
| 전체 G | 204검사/0실패, exit0/SCRIPT ERROR0/ERROR0. 실제 G17 산란 kernel→Main sample queue 2회 관측; 수동 World tick·Provider/생존 fixture, 자연 플레이 아님 |
| sound40 회귀 | 45검사/0실패, exit0/SCRIPT ERROR0/ERROR0. 공용 sample backend·믹스/정리 경로 |

Camera2D physics interpolation warning은 기존 경고다. 실제 WASAPI AudioStreamPlayer가 재생 상태인 것을 확인했으며 사람의 청감·웹 파형 비교는 하지 않았다. 코드 변경 후 docs 전체에서 magic(3)/fire_magic1/모체/산란/새 메서드·미이식 키를 검색해 관련 사운드 SSOT·작업판·context·현황·마스터·CHANGELOG를 연결한다.

Q/E 판정·피해식·자식 생성/RNG 규칙·맵·저장 형식·2_3 문서 변경0. 다만 빠진 샘플 레이어의 공유 난수2회가 실제 소비되기 시작하므로 기존 전체 RNG 일치/이전 자연 플레이 결과를 그대로 전용하지 않는다. 새 보스 종주·전체 E2E를 통과했다고 주장하지 않는다. main 통합·패키지·Steam 배포는 별도다. 최종 commit/remote 확인과 후속 미완료는 외부 DONE.json에 기록한다.

Junction 도구 경로를 보존하는 명령 한정 Node `--preserve-symlinks-main`으로 기존 guard와 docs-sync 검사를 그대로 실행한다. 설정/훅/검사 판정 완화 없음. 자동 guard.baseline.json은 기존 WIP로 미스테이징 보존한다.
