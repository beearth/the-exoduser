# SND-04 Unity 오디오 디렉터 계약 — 2026-10-28

기준은 H5 `main`의 `game.html` blob `d676c50e236bca7159d28e1c9d2ec5a9ce640a66`이다. 이 문서는 Unity F04의 이식 계약이다. 드루이드 리모델링 후보의 구현·측정값은 `UNITY_RM1_SOUND_SLICE_20261027.md`, Unity 브랜치의 `docs/engine/UNITY_RM1_SOUND_TRACK_A_20261028.md`와 구분한다. 아래 표는 **1-1에서 원본과 직접 대조한 범위**이며, 전 장의 모든 SFX 키 이식 완료를 뜻하지 않는다.

## 1. 소유와 입력

| 계층 | 원본 | Unity 계약 |
|---|---|---|
| 파일 목록 | `game.html` `_sampleFiles`(10121행)와 `bgm/` 경로 | 논리 키와 원본 파일 경로를 별도 카탈로그에 보존한다. 키가 없거나 버퍼가 아직 없으면 게임 진행을 막지 않고 무음 처리·진단 기록을 한다 |
| 전투 알림 | `playSample`·`playSampleAt`, 보스·적·플레이어 호출부 | Core는 이벤트와 틱·위치만 큐잉한다. 재생 변형·게인·믹서·공간음은 어댑터가 결정하고 Core 상태·난수열을 바꾸지 않는다 |
| BGM·환경 | `BGM.play`·`_ambSync` | 음악과 환경 루프는 일회성 SFX 음성 한도에 넣지 않는다. `hell1` 숲 루프는 보스·사망·승리 때 정지한다 |
| 보이스 | `_silvertailVoiceKey`, `playVoiceDirect` | 캐릭터별 치환과 파일별 10초 반복 차단을 이벤트 게이트로 둔다. `playVoiceDirect`는 웹에서 마스터 버스를 우회하므로 그대로 음량 등가라고 선언하기 전에 별도 청음·믹스 판정이 필요하다 |

`AudioDirector`는 위 계약의 역할 이름이다. 현재 Unity 후보는 `NativeFeedbackAudio`·`NativeGameMusic`·`NativeAudioMixer`·`NativeAmbientSources`가 이를 나눠 맡는다. 같은 이벤트를 새 단일 컴포넌트에서도 중복 재생하지 않는다.

## 2. 우선순위·동시성

| 분류 | 웹 `_SFX_PRI` | 대표 키·조건 |
|---|---:|---|
| TELL | 12 | `tell_*`, 적 공격 예고. `SFX.charge()`는 프로시저럴 5노드 자리를 우선 확보 |
| SKILL | 10 | 스킬·`boss_*`·`druid_*` |
| VOICE | 9 | `voice_*`·`male_grunt`·`silvertail_*`·`player_dead*` |
| PLAYER_HIT | 8 | `player_projectile_impact` |
| DEATH | 4 | `death_*`·`monster_die1`·`death_grunt` |
| STEP | 3 | `footstep`·`footstep2`, 발소리 전용 최대 2음성 |
| HIT | 2 | `monster_hit*`·`flat_hit`·`player_hit*`·`melee_hit1` |
| PROJ | 1 | `bullet_hit`·`bean_hit`·`bolt_hit`, 일부 `chain_fly` 호출의 명시적 오버라이드 |
| AMB | 0 | `amb_*`, 이동 계열 `m_*`는 `_sfxPri` 분류상 PROJ(1)이므로 키별 확인 |

웹의 전체 활성 노드 한도는 PC 48·모바일 16, 프레임 큐는 PC 6·모바일 3, 카테고리당 PC 2·모바일 1이다. PROJ 동시 한도는 PC 5·모바일 2, HIT 이하는 PC 3·모바일 2다. 새 우선순위가 현재 최저보다 높으면 오래된 최저 음성을 밀어내며, SKILL 이상은 동순위 교체도 허용한다. 동일 키의 기본 30ms 중복 방지와 `playSample`의 네 번째 인자(`pri`, 참이면 큐·중복·카테고리 한도 우회)는 **우선순위 숫자 자체와 별도 계약**이다. `_isSkillSfx(key)`나 `footstep*`도 이 우회 경로를 탄다. `playSample`과 `playSampleAt`은 호출부의 rate에 다시 `0.92+난수×0.16`을 곱한다. Unity는 `priorityRank`·`bypassQueue`·최종 rate 변조를 혼동하지 않아야 한다. 이 수치는 웹 관찰값이며 Unity의 실제 음성 상한·덕킹 동등성은 Player 영수증으로 판정한다.

## 3. 1-1 키별 대조표

| 논리 키 | H5 파일 | 웹 시작 음량·rate | 분류 | 호출·게이트 |
|---|---|---|---|---|
| `tell_melee` | `sfx/tell/tell_melee.mp3` | .45 · `_r(1,.05)` | TELL 12 | 비보스 `windup` 진입 1회, 화면 밖 제외, 같은 키 120ms |
| `tell_ranged` | `sfx/tell/tell_ranged.mp3` | .45 · `_r(1,.05)` | TELL 12 | 비보스 원거리 60f 경고링 생성, 같은 키 120ms |
| `tell_boss` | `sfx/tell/tell_boss.mp3` | .45 · `_r(1,.05)` | TELL 12 | 다크드루이드 패턴 시작. 다른 보스의 `SFX.charge()`는 유지 |
| `tell_grab` | `sfx/tell/tell_grab.mp3` | .45 · `_r(1,.05)` | TELL 12 | 다크드루이드 근거리 잡기 시작 |
| `druid_erupt` | `sfx/boss/druid_erupt.mp3` | .5 · `_r(1,.04)` | SKILL 10 | 드루이드 잠행 이탈 |
| `druid_tide` | `sfx/boss/druid_tide.mp3` | .5 · `_r(1,.04)` | SKILL 10 | `tideWave` 시작 |
| `druid_sink` | `sfx/boss/druid_sink.mp3` | .55 · `_r(1,.04)` | SKILL 10 | 침강 시작 |
| `crit_heavy` | `sfx/hit/crit_heavy.mp3` | .45 · `_r(1,.05)` | 기본 HIT 2 | DOT·noSound 제외, 12프레임 쿨다운 |
| `amb_hell_forest_bed` | `sfx/ambient/hell_forest_bed.mp3` | .15 × SFX 설정 · 루프 | AMB 0 | BGM 키가 `hell1`일 때만, 다른 키면 800ms 페이드 정지 |

1-1 Unity 리모델링 전용 `druid_hit`·목소리·아레나·보스곡은 웹에 없는 새 설계다. 이 표의 웹 원본 키와 섞어서 웹 이식률로 계산하지 않는다. 파일별 채택과 임시 음량은 `DRUID_BOSS_SOUND_REMAKE_20261028.md` 및 Unity 후보의 `RM1_AUDIO_KEYS.json`이 기준이다.

## 4. 인수·검증 경계

| 단계 | 필요 증거 | 현재 상태(2026-10-28) |
|---|---|---|
| 명세 | 이 표와 `6사운드디자인.md`의 키·보이스·포맷 표 | 1-1 범위 작성. 전체 장의 이벤트·설정 분리 음량은 추가 추출 필요 |
| Unity 후보 | 키·파일·`.meta`·이벤트·믹서 분리 | `acf2fb948` 위 전용 메타 보강 후보 `35347e5ad`; `unity/main` 미병합 |
| 검증 | 6000.6.7f1 오류 0, oracle 불일치 0, `exo-unity.ps1` 무창 스모크 PASS, Player 빌드·실청음 | `I:/EXODUSER-Storage/sound-build/20261028_acf2fb948/` 영수증 대기. 청음·실제 Player 판정 미확인 |

Unity 통합 담당만 `unity/main`에 병합한다. 후보 브랜치 push나 Core 타임라인 녹음만으로 통합 Player 청음 완료라 쓰지 않는다. 채택이 바뀌는 `druid_slam` 4차 후보는 사용자 `pick_r4` 선택과 파일 교체 커밋을 분리한다.
