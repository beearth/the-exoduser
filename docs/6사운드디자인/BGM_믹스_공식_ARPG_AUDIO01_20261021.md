# BGM 믹스 공식(레퍼런스: D2/D3/D4/PoE2)

2026-10-21 AUDIO-01. 기준 `codex/demo11-integ4-20261021` / `cb154e8dea4717666026da5365bbd43172dd7b90`.
적용은 Godot 1-1 데모이며 웹 본편·PC 전투 코어·보호 설계는 변경하지 않는다.

## 근거와 인수 범위

사용자가 전달한 D2/D3/D4/PoE2 청취 특징과 승인 방향을 구현했다. 필드의 작은 배경 음악, 환경음이 드러나는 휴지, 보스의 음악 전면화, 전투 효과음 마스킹 완화를 목표로 한다. 아래 수치는 각 회사가 공개한 공식 수치나 과학적 측정 결과가 아니라 EXODUSER의 **청음 전 출발값**이다. 샘플 자체의 음량·스펙트럼 및 사용자 슬라이더에 따라 실제 음압 차이는 달라진다. 선율 적은 드론/질감의 선곡·환경음 조성 일치는 음원 청취/선정 후 인수해야 하며, 단순 볼륨 설정으로 완료되지 않는다. 기존 선곡 카탈로그는 보존했다. 새 음원 생성·반입·Suno promote 없음.

## 버스와 상대 레벨

`godot/default_bus_layout.tres`에 Master/Music/Ambience/SFX/UI/Voice가 있다. 정적 layout의 시작 gain은 모두 0dB이며, 런타임 프로필과 현재 OPT가 아래 값을 적용한다. 실제 믹스 상수는 `godot/scripts/native_audio_mix_profile.gd` 한 곳에서 조절한다.

| 버스/상태 | 상대 trim | 사용자 값 및 경로 |
|---|---:|---|
| Master | 0dB | 최종 출력 |
| Music / field | −14dB | 기존 SND06 Audio.volume = OPT.bgmVol/100 유지. 동적 BGM owner bus → Music → Master |
| Music / boss | −7dB | field +7dB. 같은 사용자 값 유지 |
| Music / lobby·intro·death·victory·stop·guide | 0dB | 기존 장면 음량 정책 유지; 전환 2.5초 |
| Ambience | −11dB | Music field보다 +3dB. OPT.sfxVol/100 × db_to_linear(−11), Master로 출력 |
| SFX | 0dB | 기존 SND08 그래프 종착점을 Master에서 SFX로 연결. 기존 sample×mbus OPT 이중 적용·DSP bypass 정책 유지 |
| UI | 0dB | OPT.sfxVol/100, Master로 출력. 전용 버스 준비; 기존 UI 무음에 새 재생은 만들지 않음 |
| Voice | 0dB | 기상 voice를 SND08에서 Voice→Master로 분리. sample gain 유지, 버스에 OPT.sfxVol/100 적용; 기존 이중 gain 크기는 유지, SND08 미검증 DSP 역할 경유는 제외 |
| Music / combat | 추가 −5dB | field 최종 trim −19dB, boss −12dB. 슬라이더 값과 곱으로 합성 |

설정 UI·저장 형식·저장된 값은 바꾸지 않는다. bgmVol=0이면 현재 음악·전환 tail도 0, sfxVol=0이면 Voice/UI/Ambience 버스도 0이다. 음원별 mastering loudness를 정규화하지 않았으므로 SFX 대비 지각 레벨은 청음으로 조절한다.

## 사이클·전환·덕킹

| ID / 상수 | 값 | 동작·적용 위치 |
|---|---|---|
| FIELD_PLAY_MIN/MAX | 120 / 180초 | field 진입/휴지 종료마다 음악 전용 RNG로 추첨. 음악 구간 중 자연 곡 종료는 기존 SND06 다음 곡 선택 |
| FIELD_FADE | 2.5초 | 재생 구간 종료에서 source envelope를 0으로, 이어 life.stop |
| FIELD_REST_MIN/MAX | 20 / 40초 | 음악 handle 없이 환경음만 유지하도록 설계. **현재 환경음 에셋 미지정이므로 실제로는 음악이 쉬는 무음 구간** |
| CROSSFADE | 2.5초 | 지역 field key 변경·보스 진입/퇴장 시 즉시 새 곡 요청, 새 source fade-in/기존 재생 위치의 임시 tail fade-out. scene 종료/빠른 재전환에서 이전 fade/tail 취소·정리 |
| 보스 | field 대비 +7dB | entered(0)→boss, field 타이머 취소. exited/victory(0)→field 사이클 재개; actor 상실도 복귀. 명시 victory 장면 API는 기존 terminal 음악 유지 |
| DUCK_DB | −5dB | 기존 native_sound_event의 native_attack_audio_queued/native_skill_sample_requested 및 player telemetry의 player_damage/melee_hit/e_wave_hit 구독만 사용. 공격 이벤트 기반이므로 허공 공격도 포함될 수 있음 |
| DUCK_ATTACK / RELEASE | 0.2 / 1.5초 | ducked bool이 변할 때만 Tween 생성. 반복 이벤트는 hold Timer만 다시 시작 |
| COMBAT_HOLD | 2초 | 마지막 지원 이벤트 이후 유지, 만료 시 release |
| FOREST_ASSET | 빈 문자열 | 현재 기준에 숲 환경음 파일 없음. 승인된 기존 경로 지정 후 Ambience에서 MP3/WAV/OGG 상시 루프, 음악 휴지에도 유지. 음원 대체·생성 안 함 |
| time_scale | 1.0 | 운영 기본. 테스트에서만 0.01로 Timer/Tween 100배 가속 |

`native_arpg_audio_mix.gd`는 `_process/_physics_process`가 없으며, 신호·Timer·Tween으로 동작한다. 상태 변화를 검사한 기존 visibility 경로에서 pause/hidden의 Timer와 Tween을 함께 멈춘다. source decode는 장면/곡 선택 시 기존 native media 경로에서만 수행하며 tick ResourceLoader·목록 조회 API를 추가하지 않는다. Main/Player 전투 writer·player.gd 변경 없음. 번역 대상 사용자 문구 추가 없음.

## 검증·청음

격리 user dir `EXODUSER-AUDIO-01-Isolated`에서 headless 가속 테스트 `res://tests/test_audio_01_mix.gd` 실행. 관련 DEMO11-41은 새 버스 계약 두 assertion과 Voice label만 갱신하여 1회 실행했다. 결과는 가속 믹스 **30/0**, DEMO11-41 **51/0/skip13**(1회)이다. 새 검증의 첫 hidden fixture 불일치 1건은 실제 visibility 상태를 설정하도록 고쳤다. 연속 전환 후 즉시 종료 시 AudioStreamPlayback 잔존 경고는 audio server drain 0.25초를 기다려 최종 경고 0으로 확인했다(기존41의 drain 방식과 동일). 결과·로그는 `~/exoduser-wt/_out/AUDIO-01/` 및 DONE.txt에 보존한다. Dummy 결과는 실제 PCM·스피커·청감 검수가 아니다.

청음: 이 브랜치를 별도 검수 checkout으로 연 뒤 `godot/override.cfg`에 `[application]` 아래 `config/use_custom_user_dir=true`, `config/custom_user_dir_name="EXODUSER-AUDIO-01-Listening-Isolated"`를 지정한다. `godot/run.command --windowed` 실행(해당 checkout import가 없으면 먼저 같은 격리 override에서 Godot `--headless --editor --import --path godot`). 기존 PID81277은 그대로 두고 자기 프로세스만 하나 실행한다. 필드에서 120~180초+fade 2.5초 뒤 20~40초 휴지, 공격/피격 시 효과음 가독성, 보스 입장 2.5초 fade-in 및 클리어 복귀를 듣는다. BGM/SFX 슬라이더 0·중간값을 비교한다. 실제 저장 폴더를 지정하지 않는다.

**인수 HOLD:** 숲 환경음의 실제 파일 연결·루프 청음·BGM과 조성 일치, 선율/드론 적합성, 실제 스피커 레벨, PC 실행. 환경음 파일이 확정되기 전 AUDIO-01 전체 완료로 올리지 않는다.

## 2026-10-21 INTEG-6c 후속 계약

INTEG-6c에서 PC boss BGM3baceb734를 merge. 새 데모boss곡 −12.4LUFS와 기존 Music boss−7dB/필드−14dB·간헐120~180초/휴지20~40초·duck−5dB는 서로 다른 경계이며 기존 믹스 구현·수치 무변경. 최종 AUDIO-0130/0·41 66/0·catalog18/0(CoreAudio), 실제 청음 미검수. 로컬override는 이제 untracked/ignored이며 청음 후 원존재/byte로 복원한다. 상세·실패이력·한계: [INTEG-6c](../engine/INTEG6C_REGRESSION_20261021.md).
