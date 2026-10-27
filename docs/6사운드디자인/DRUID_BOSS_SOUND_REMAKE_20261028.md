# 드루이드 보스전 사운드 리메이크 (SND-09, 2026-10-28 사운드 총괄)

사용자 지시(2026-10-28, Unity 트랙 A 최종 녹음 v3 청음 뒤): "드루이드 보스전 다시 만들어야 할 것 같다 지금 전체적으로 구려서".
범위: Unity 리모델링 1-1 다크드루이드(RM-B1) 전투의 소리 전체. 웹 게임은 바꾸지 않는다(웹 드루이드에 이미 들어간 SND-08 7키는 그대로).

## 1. 진단 (v3 녹음 `E:/exoduser-wt/_out/rm1-sound/submit5/druid_60s.wav`, Receipt 기준 수치 사실)

60초 동안 실제로 난 소리:
| 키 | 횟수 | 출처 |
|---|---|---|
| `boss_hit` | 108 | 웹 공용 `sfx/monster/boss_hit.mp3` 한 파일, 쿨다운 없음 |
| `player_hit1~4` | 43 | 웹 공용, 스크립트 플레이어가 거의 모든 공격을 맞음 |
| `tell_boss` / `tell_parry`(임시 tell_melee) / `tell_grab` | 13 / 12 / 3 | SND-08 |
| `roll_body`(임시 footstep) | 10 | 웹 공용 |
| 드루이드 고유 연출음(`druid_*`) | 11 | SND-08 채택·대기 |

- 들리는 것의 대부분이 **같은 웹 공용 피격음의 반복**이다(초당 약 1.8회 `boss_hit` + 0.7회 `player_hit`). 드루이드만의 소리는 1분에 11번뿐이다.
- 보스 목소리는 웹 공용 `boss_howl`·`death_boss`(괴물 포효)라서, 늙은 숲지기 드루이드와 성격이 다르다.
- BGM은 웹 1장 보스곡 그대로다. CLAUDE.md §Unity 리모델링 원칙상 보스는 새로 설계한다.
- 녹음용 스크립트 플레이어가 피하지 않고 맞기만 해서, 실제 플레이 소리와 다르다.

## 2. 결정 — 드루이드 사운드 세트 v2 (6층)

공통 성격: 썩은 나무·젖은 흙·뿌리·늪·늙은 쉰 목소리. 불·금속 광택·전자음·괴물 포효·네온 느낌 금지(디자인 7장, C8 불씨 금지).

| 층 | 키 | 장면 | 길이 | 비고 |
|---|---|---|---|---|
| L1 피격 | `druid_hit` | 플레이어 무기가 드루이드 몸(나무껍질 같은 피부·젖은 로브)을 침 | 0.3s | `boss_hit` 대체. 채택 후보로 변형 4개 만들어 무작위 순환, 쿨다운 8f(웹 A3과 같음) |
| L1 | `druid_hit_heavy` | 치명타·강공격으로 드루이드가 휘청임 | 0.5s | 쿨다운 30f |
| L2 목소리 | `druid_vo_pain` | 아파서 내는 짧은 쉰 신음(늙은 남자) | 0.6s | 3종 순환, HP 8%가 깎일 때마다 1회·최소 간격 3초 |
| L2 | `druid_vo_attack` | 큰 기술(내려찍기·돌진·해일) 시전 기합 | 0.7s | 3종 순환, 같은 기술 연속이면 생략 |
| L2 | `druid_vo_phase` | 페이즈 시작, 숲에 바치는 낮은 주문 섞인 포효 | 1.8s | `boss_howl` 대체 |
| L2 | `druid_vo_fall` | 쓰러져 무릎 꿇을 때 신음(P1·P2 끝) | 1.2s | `druid_root_pierce` 직전 |
| L2 | `druid_vo_last` | 마지막 침강 직전 숨(대사 "숲은 아직 배고프다…" 앞) | 1.5s | `death_boss` 대체, 비명 금지 |
| L3 예고음 | `tell_parry`·`tell_boss`·`tell_grab` | RM-B1 §4 표시 3종 | — | 체계 유지. `tell_parry`는 3차 고르기 진행 중 |
| L4 기술 | `druid_whip` | 가지 채찍 휘두름(기술 1, 3타) | 0.4s | 3종 순환 |
| L4 | `druid_slam` | 거름 내려찍기 착지(기술 2) | 0.7s | |
| L4 | `druid_drag` | 뿌리 끌기 돌진 중 땅 긁힘(기술 3) | 0.8s | 돌진 시작 1회 |
| L4 | `druid_fissure` | 가시 뿌리 줄기 균열이 달려감(기술 4) | 1.0s | |
| L4 | `druid_spore` | 독포자 부채 발사(기술 5) | 0.5s | |
| L4 | `druid_pod` | 포자 꼬투리 터짐(기술 11) | 0.4s | |
| L4 | `druid_summon` | 바닥 시체가 꿈틀거리며 일어남(기술 9) | 1.2s | |
| L4 | 기존 | `druid_erupt`·`druid_tide`·`druid_heartbeat`·`druid_roots_rise`·`druid_sink` 채택본 유지, `druid_burrow`·`druid_staff_tap`·`druid_root_pierce`는 3차 고르기 | — | |
| L5 아레나 | `amb_druid_arena` | 보스 아레나: 늪 거품·나무 삐걱임·멀리 뿌리 신음 | 10s 루프 | 보스 스냅샷에서 숲 바닥음 대신 |
| L6 BGM | `bgm_druid_boss` | 드루이드전 주제곡 | 2분 안팎, 반복 가능 | 낮은 현악·남성 합창·전쟁 북·나무/뼈 타악, 신스·EDM 금지. ElevenLabs Music API(`/v1/music`)로 3곡 시험, 실패하면 Suno 프롬프트를 만들어 사용자 생성 요청 |

## 3. 제작 절차 (§SND-08 §6 방식 그대로)

1. 키마다 장면 카드(무슨 순간·바로 뒤에 무슨 일)와 **서로 다른 해석 4개**의 생성 문구(ElevenLabs). 공통 꼬리: "dark fantasy ARPG, rotting forest druid, organic and physical, no synth, no electronic whoosh, no magic chime, no music, no monster roar"(목소리 키는 "old hoarse male, no words").
2. 가공: −1dBTP 정규화·뒤 무음 정리(SND-08과 같음), 루프는 RMS −24dBFS·크로스페이드.
3. 고르기 페이지 `pick_druid.html`(127.0.0.1:3399): 장면 카드·"그냥 듣기"·"장면에서 듣기"(보스 BGM 60%+해당 순간 앞뒤 소리)·라디오·"전부 안 맞음+메모"·자동 저장 `picks_druid.json`. **총괄 추천 표시 없음**, 수치는 불량 "주의" 표시만.
4. 사용자 고르기 → 채택본을 Unity 브랜치 `claude/unity-pc-sound-rm1-20261027`에 추가(키 표 `RM1_AUDIO_KEYS.json` 갱신) → 녹음 v4 → 사용자 청음.

## 4. 녹음 현실화 (RM-0)

- 스크립트 플레이어: 텔레그래프를 보고 구르기·패링으로 대부분 피한다(목표: 받은 공격의 30% 안팎만 맞음), 공격은 초당 2~3타 리듬.
- 보스 피격음도 적 피격과 같은 쿨다운 8f(A3) 적용.
- 같은 시드로 녹음해 v3와 비교할 수 있게 한다.

### 4.1 기준 녹음 결과와 결정 (2026-10-28, RM-0 `71bed2766`, `E:/exoduser-wt/_out/rm1-sound/submit6/`)
- 같은 시드(13) 기존 소리 기준 녹음. 60초 창(36.2~96.2초) 키별 횟수: `boss_hit` 110, `player_hit1~4` 19, `roll_body` 15, `tell_parry` 15, `tell_boss` 9, `tell_grab` 3, `druid_*` 12.
- 스크립트 플레이어: 텔레그래프의 85%를 피함(본 공격 53개 중 구르기 36·패링 시도 11·안 피함 6), 공격 22틱 간격(초당 2.7타). `player_hit`은 1분 43→19회. 남은 피해는 텔레그래프 없는 독 웅덩이·투사체·장판 틱이라 여기서 멈춤 — **인정**.
- 보스 피격 쿨다운 8f는 Core `hurtE`가 이미 모든 적 피격에 공유하고 있어 걸러지는 소리가 없다. 110회는 공격 리듬에서 나온 수다. **결정(총괄)**: 쿨다운을 늘리지 않고 소리 설계로 푼다 — `druid_hit` 변형 4개 무작위 순환(같은 변형 연속 금지)·rate ±6%·시작 음량 .3, **연타 감쇠**(앞 피격과 0.6초 안이면 음량 ×0.85씩, 바닥 ×0.55, 0.6초 쉬면 원래대로), `druid_hit_heavy`는 치명타·휘청임에서만.
- 패링 성공 소리가 Unity에 없음(Core가 큐잉 안 함, 성공 7회 무음). **결정**: 웹 `doParry`와 같게 연결 — Q 패링 `q_parry`(.9, rate 1±.08) / 그 외 `sword_parry`(1, 1±.1)+`sword_back`·`sword_back2`·`sword_back3` 중 1(.5, 1.1±.1), 그리고 50%로 `voice_parry1~4` 중 1(1, 1±.03) 아니면 `male_grunt`(1, 1±.15). 분류는 웹 `_sfxPri`대로(`q_parry`·`sword_parry` SKILL, `voice_*`·`male_grunt` VOICE, `sword_back*`는 웹 기본 HIT), 그룹 SFX/Skill·SFX/Voice·SFX/PlayerHit, 2D.

## 5. 기록
| 날짜 | 내용 |
|---|---|
| 2026-10-28 | 사용자 지시로 착수. v3 Receipt 진단(60초에 `boss_hit` 108·`player_hit` 43·드루이드 고유음 11), 6층 세트·제작 절차·녹음 현실화 결정. 생성 sound-simple, 녹음 RM-0 |
| 2026-10-28 | RM-0 기준 녹음(`71bed2766`): 스크립트 플레이어 85% 회피·`player_hit` 43→19 인정. 보스 피격 110회는 공격 리듬 수 → 쿨다운 대신 `druid_hit` 변형 순환+연타 감쇠로 결정. 패링 성공 소리 웹 `doParry`대로 연결 지시 |
| 2026-10-28 | sound-simple 제작: 새 키 15개 x 해석 4개 = 60후보(`<key>_v2a~d`, 카탈로그 `tools/sfx_forge_catalog_druid_v2.json`, 장면 카드·문구 키마다 직접 작성, 목소리 키 꼬리 "old hoarse male voice, no words, no monster roar") + L6 BGM 3곡(ElevenLabs Music `/v1/music` `music_v1` 120초 mp3, A 행진 북 ~100bpm·B 장송곡 ~70bpm·C 질주 ~140bpm, API 정상). 가공 SND-08과 같음(-1dBTP·뒤 무음 정리, 아레나는 크로스페이드 후 RMS -24dBFS). 고르기 `pick_druid.html`(127.0.0.1:3399, `picks_druid.json`) 16카드 63후보, 수치 주의 32개(BGM 원본 피크 3 포함), 헤드리스·음소거 검수 audio 63/63 오류 0·저장·복원 통과. 선택 대기(사용자 청음) |
