# 공개 사이트 원본 드루이드 독탄 효과음 — 2026-10-09

사용자 “사운드 사이트에서 찾아서 니가 넣을수있겠냐”에 따라 기존 SOUND 담당이 공개 원본2개를 확보했고 ROOT가 main에 시험 연결했다. 상용 이용·수정·배포가 가능한 [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/)로 공식 상세 페이지에 표시된 파일이다. 파일은 크롭·정규화·합성 없이 복사한다. 실제 음색/연타 적합성은 아직 듣고 판정하지 않았다.

| 키 / 원본 | 제작자·공식 출처 | repo 파일·원본 규격 | 현재 runtime |
|---|---|---|---|
| `boss_druid_poison_launch` / Slime jump effect | [KobatoGames](https://opengameart.org/content/slime-jump-effect), CC0 | `sfx/boss/druid_poison_launch_oga.wav`, PCM16/mono/44100Hz/.09초/7982B | volume .35, rate 인자1; boss_ priority10 |
| `druid_poison_impact` / Slimy monster or murder sounds(9), #5 | [pauliuw](https://opengameart.org/content/slimy-monster-or-murder-sounds9), CC0 | `sfx/boss/druid_poison_impact_oga.mp3`, mono/48000Hz/추정.216초/12864B | volume .55, rate 인자1; 명시 `PLAYER_HIT=8` |

| 연결 / 보호 계약 | 현재 값 |
|---|---|
| registry / preload | `_sampleFiles`에 두 key 등록, 기존 `_loadAudioBuffers`의 전체 registry decode/concurrency4 사용. 미준비 첫 호출은 기존 lazy load만 하고 재생하지 않음 |
| 일반 CH1 발사 | `bossFanWind` / `bossBurstWind` 기존 전체 spawn 호출을 그대로 수행. 반환된 적대 `_druidPoison`이 하나 이상일 때 `fired=true`; `_playDruidPoisonLaunch(e,fired)`를 루프 뒤1회 호출 |
| 피날레 발사 | `_druidFinaleVolley`도 같은 성공 반환값 gate, 루프 뒤1회. 기존 Q 텍스트·탄·전조 시간 유지 |
| 소유 / 중복 | `e.ib && (G.stage===0 || G.stage===3)`만 새 발사 샘플. 기존 발사 `SFX.magic`/`SFX.charge` 대체, 준비 단계 charge는 유지. 전부 spawn 거절이면 무음; 비드루이드 기존 소리 유지 |
| world 위치 | 발사 e.x/e.y, 피격 실제 탄 p.x/p.y. 화면 좌표 사용 없음 |
| 피격 caller | 기존 `_hurtProjectilePlayer`가 `mouthProjectile:p` 전달; `hurtP`의 `!_isDot && opts.projectileHitSfx && a>0` 지점에서 `_playProjectileHitSfx(opts.mouthProjectile)` 호출. 에너지쉴드 계산 전 유효 충돌도 포함 |
| 피격 선택 / 간격 | 적대 `_druidPoison`만 새 공간음; 기타/인자없음/friendly는 기존 `player_projectile_impact` 우선 큐. 공유 performance.now100ms gate, 초기-Infinity. 기존 신음 등 유지, 두 충돌 샘플 동시 호출 없음 |
| spatial / pitch | 기존 `playSampleAt`: 거리<=1200 gain1, 이후800에서0; falloff제곱, pan clamp(dx/600,-.7,.7), rate×(.92+Math.random()*.16), key30ms gate. 발사 priority10/피격8, 기존48 desktop/16 mobile 전체 cap |
| 종료 / 예외 | 기존 non-looping AudioBufferSource와 onended cleanup·duration+.5초 fallback 사용. 신규 공간음 호출만 catch하여 오디오 실패가 회복/피격 계산을 중단하지 않게 함 |
| 보존 / RNG | 피해/속도/발수/패링/Q전용blackBean/전조/save schema 변경0. audio의 기존 글로벌 Math.random 소비 순서 동일은 주장하지 않음 |
| 원출처 기록 | `sfx/boss/DRUID_POISON_ATTRIBUTION_20261009.md`, 자발적 저작자·출처·CC0·원본SHA 보존. 기존 Bisqo CC BY 파일·표기 불변 |

## 인수 상태

원본 다운로드/사용 조건/파일 복사 exact 및 실제 sound helper/fan/burst/finale 통제 source 검수7그룹 PASS. 새 공간음 예외·성공 spawn만 재생·100ms gate·비드루이드 기존 경로를 확인했다. main 실행·직접 청취·연타 믹스·자연종료 native 검수는 미완료다. audio input 미지원, Mac 잠금으로 재생 버튼 검수도 미도달이며 들었다고 기록하지 않는다. 저볼륨 시험값 .35/.55는 최종 음질 승인값이 아니다. 외부 `native-audio-review.html`은 실제 본편 재생 함수/원본2개로 만든 저장 없는 검수본이며 실제 실행 결과는 completion 정본을 따른다.
