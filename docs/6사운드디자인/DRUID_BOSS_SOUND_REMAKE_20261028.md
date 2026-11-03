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
| L4 | 기존 | `druid_erupt`·`druid_tide`·`druid_heartbeat`·`druid_roots_rise`·`druid_sink` 채택본 유지. `druid_burrow`는 3차 s3d 사용자 선택본을 Unity 전용 브랜치에 연결, `druid_staff_tap`·`druid_root_pierce`는 3차 전부 안 맞음 | — | Unity 새 빌드·청음 미확인 |
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

## 6. 사용자 고르기 결과 (2026-10-28 09:39, `picks_druid.json` 16/16, 백업 `_picks_backup/picks_druid_20261028_final.json`)

| 층 | 키 | 결과 | 채택 후보 |
|---|---|---|---|
| L1 | `druid_hit` | **전부 안 맞음 → 다시** | — |
| L1 | `druid_hit_heavy` | **전부 안 맞음 → 다시** | — |
| L2 | `druid_vo_pain` | 채택 | `druid_vo_pain_v2a` |
| L2 | `druid_vo_attack` | 채택 | `druid_vo_attack_v2a` |
| L2 | `druid_vo_phase` | 채택 | `druid_vo_phase_v2c` |
| L2 | `druid_vo_fall` | 채택 | `druid_vo_fall_v2a` |
| L2 | `druid_vo_last` | 채택 | `druid_vo_last_v2a` |
| L4 | `druid_whip` | **전부 안 맞음 → 다시** | — |
| L4 | `druid_slam` | **전부 안 맞음 → 다시** | — |
| L4 | `druid_drag` | 채택 | `druid_drag_v2a` |
| L4 | `druid_fissure` | 채택 | `druid_fissure_v2b` |
| L4 | `druid_spore` | **전부 안 맞음 → 다시** | — |
| L4 | `druid_pod` | 채택 | `druid_pod_v2d` |
| L4 | `druid_summon` | 채택 | `druid_summon_v2c` |
| L5 | `amb_druid_arena` | 채택 | `amb_druid_arena_v2d` |
| L6 | `bgm_druid_boss` | 채택 | `druid_bgm_b`(B 장송곡 ~70bpm) |

- 메모는 0건이다. "다시" 5키는 무엇이 안 맞았는지 알 수 없으므로, 2차는 1차 4해석과 **겹치지 않는 방향**으로 새로 만든다(총괄 결정).
- **2차 방향**: 피격 2키는 "나무를 치는 소리"보다 **살·젖은 천·속이 빈 고목이 함께 울리는 둔탁한 타격**으로 한다. 금속 칼날음은 플레이어 무기 쪽에 이미 있으므로 넣지 않는다. 채택된 목소리(늙은 쉰 남자)와 섞여도 묻히지 않게 저역 몸통을 강하게 한다.
  - `druid_whip`은 **휘는 생가지의 휙 소리와 끝의 젖은 찰싹**으로 만든다.
  - `druid_slam`은 **무거운 흙덩이·썩은 둥치가 떨어지는 착지 + 짧은 진흙 튐**으로 만든다.
  - `druid_spore`는 **마른 꼬투리가 터지며 가루가 퍼지는 부드러운 푸슉**으로 만든다. 마법 차임은 넣지 않는다.
  - 키마다 4후보, "장면에서 듣기"는 채택된 BGM B 위에서 듣게 한다.
- **연결**: 채택 11키는 지금 Unity 브랜치에 연결한다. 녹음 v4는 "다시" 5키를 채택한 뒤 한 번만 한다(PC 메모리 한계로 Unity batch 1개 원칙). BGM B는 원본 피크가 높으므로 게인을 낮춰 피크 −3dBFS 안쪽으로 맞춘다(§4.1 덕킹 기준 유지).

### 6.1 2차 결과 (2026-10-28, `pick_druid2.html` 제출 01:08 UTC, 5/5, 백업 `_picks_backup/picks_druid2_20261028_final.json`, 메모 0건)

| 키 | 결과 | 채택본(가공본, `_out/sfx_forge/_preview_druid2/`) | 쓰는 방식 |
|---|---|---|---|
| `druid_hit` | 채택 | `druid_hit_v3d_proc.mp3` (원본 `hit/druid_hit_v3d`) | **d 1개만 채택** → 변형 4개 순환은 하지 않는다(총괄 결정). 대신 rate ±6%·연타 감쇠(앞 피격과 0.6초 안이면 음량 ×0.85씩, 바닥 ×0.55, 0.6초 쉬면 원래대로)로 110회/분의 반복감을 줄인다. 시작 음량 .3 |
| `druid_hit_heavy` | 채택 | `druid_hit_heavy_v3d_proc.mp3` (원본 `hit/druid_hit_heavy_v3d`) | 치명타·휘청임에서만(§4.1 결정 그대로) |
| `druid_whip` | 채택 | `druid_whip_v3a_proc.mp3` (원본 `skill/druid_whip_v3a`) | |
| `druid_slam` | **전부 안 맞음 (2회 연속)** | — | 1차(v2)·2차(v3) 모두 불채택. 메모가 없어 이유를 알 수 없다 |
| `druid_spore` | **전부 안 맞음 (2회 연속)** | — | 1차(v2)·2차(v3) 모두 불채택. 메모가 없어 이유를 알 수 없다 |

- `druid_hit`·`druid_hit_heavy`의 a·b·c, `druid_whip`의 b~d는 쓰지 않는다(파일은 staging에만 있고 저장소에 넣지 않았다).
- 2회 연속 불채택인 `druid_slam`·`druid_spore`는 같은 방향으로 세 번째 생성하지 않는다. 방향 전환은 총괄 결정 사항이다.
- 반영(Unity 브랜치에 채택 3키 추가·녹음 v4)은 지시를 받아 진행한다. 이 절은 기록만 한다.

### 6.2 3차 결과 (2026-10-28, `pick_r3.html` 제출 01:44 UTC, 3/3, 백업 `_picks_backup/`)

| 키 | 채택 | 사용자 메모 | 처리 |
|---|---|---|---|
| `druid_slam` | **r3d** (ElevenLabs 새 생성, 거대한 나무 둥치가 땅을 내려쳐 땅이 울림) | "이거 볼륨을 키우고 에코같은걸 주면쓸수있을듯" | 4차: 가공본 e1~e3 → 아래 §6.3 |
| `druid_spore` | **r3a** (웹 기존 소리 `pickup_rummage2.mp3`, 35Hz HPF→−1dBTP) | 없음 | 채택. 신규 파일 없이 웹 기존 `pickup_rummage2` 가공본을 쓴다(반영은 Unity 연결 단계, 총괄 지시 대기) |
| `ui_tab` | r3c | 없음 | 웹 `sfx/ui/tab.mp3` 반영 완료([6사운드디자인.md](6사운드디자인.md) 「ui_tab 반영」) |

### 6.3 4차 — `druid_slam` 가공본 (2026-10-28, 생성 없이 r3d 가공만, 아직 청음 전)

원본 `_preview_r3/druid_slam_r3d_proc.mp3`(0.484초, 최대 −1.7dBTP, 평균 −21.9dB). 사용자 메모(볼륨↑, 에코)를 그대로 반영한 3안, 에코만 다르다.

| 후보 | 에코 | 길이 | 꼬리(원본 끝 이후 −50dB까지) | dry RMS 증가 | 최대(dBTP) |
|---|---|---|---|---|---|
| 원본 d | 없음 | 0.48초 | — | 0 | −1.72 |
| e1 짧게 | 120ms, 피드백 .30, 3회, 잔향 없음 | 0.56초 | 0.005초(0.6초 안에 모두 소멸) | +3.5dB | −1.65 |
| e2 중간 | 220ms, 피드백 .50, 3회 + 숲 공간 잔향(RT .55초) | 0.92초 | 0.36초 | +3.57dB | −1.62 |
| e3 길게 | 350ms, 피드백 .58, 5회 + 넓은 잔향(RT 1.3초) | 1.99초 | 1.44초(약 1.5초) | +3.55dB | −1.59 |

- 음량: 사전 이득 +8.5dB → look-ahead 리미터(천장 .85, 2ms)로 앞 타격 피크를 눌러 뒤쪽을 올린 뒤 최종 −1dBTP로 맞췄다(최대 크기는 원본과 같은 급, 평균은 +3.5dB). 에코를 합친 최종 파일 기준으로 목표를 맞췄다(합성 전 목표만 맞추면 합산 피크 때문에 평균이 +1.8dB에 그쳤다).
- 에코 경로에만 150Hz 하이패스, 합산 뒤 35Hz 하이패스. 반복마다 4.5kHz 로우패스로 어두워진다. 무음 꼬리(−55dB 아래)는 잘랐다.
- 고르기 `pick_r4.html`(1카드·4후보, 장면은 BGM B와 아레나 앰비언스 위, `tell_boss`→후보→`player_hit1`), 서버 `serve.cjs` PICKSETS `r4`(`picks_r4.json`, 서버 재시작은 사운드 총괄). 스크립트 `_analysis/r4_proc.py`·`_druid/mk_pick_r4.py`(저장소 밖).
- 한계: 에코·잔향 길이는 수치 기준이며 귀로는 확인하지 않았다. `warn` 0건.

## 5. 기록
| 날짜 | 내용 |
|---|---|
| 2026-10-28 | 사용자 지시로 착수. v3 Receipt 진단(60초에 `boss_hit` 108·`player_hit` 43·드루이드 고유음 11), 6층 세트·제작 절차·녹음 현실화 결정. 생성 sound-simple, 녹음 RM-0 |
| 2026-10-28 | RM-0 기준 녹음(`71bed2766`): 스크립트 플레이어 85% 회피·`player_hit` 43→19 인정. 보스 피격 110회는 공격 리듬 수 → 쿨다운 대신 `druid_hit` 변형 순환+연타 감쇠로 결정. 패링 성공 소리 웹 `doParry`대로 연결 지시 |
| 2026-10-28 | sound-simple 제작: 새 키 15개 x 해석 4개 = 60후보(`<key>_v2a~d`, 카탈로그 `tools/sfx_forge_catalog_druid_v2.json`, 장면 카드·문구 키마다 직접 작성, 목소리 키 꼬리 "old hoarse male voice, no words, no monster roar") + L6 BGM 3곡(ElevenLabs Music `/v1/music` `music_v1` 120초 mp3, A 행진 북 ~100bpm·B 장송곡 ~70bpm·C 질주 ~140bpm, API 정상). 가공 SND-08과 같음(-1dBTP·뒤 무음 정리, 아레나는 크로스페이드 후 RMS -24dBFS). 고르기 `pick_druid.html`(127.0.0.1:3399, `picks_druid.json`) 16카드 63후보, 수치 주의 32개(BGM 원본 피크 3 포함), 헤드리스·음소거 검수 audio 63/63 오류 0·저장·복원 통과. 선택 대기(사용자 청음) |
| 2026-10-28 | 사용자 고르기 16/16 완료: 채택 11·다시 5(`druid_hit`·`druid_hit_heavy`·`druid_whip`·`druid_slam`·`druid_spore`). §6 기록, 2차 방향 결정, 채택 11키 Unity 연결 지시 |
| 2026-10-28 | sound-simple 2차 제작: "다시" 5키(`druid_hit`·`druid_hit_heavy`·`druid_whip`·`druid_slam`·`druid_spore`) x §6 2차 방향 4해석 = 20후보(`<key>_v3a~d`, 카탈로그 `tools/sfx_forge_catalog_druid_v3.json`, 1차와 겹치지 않게 피격=살·젖은 천·속 빈 고목+금속 없음 / 채찍=생가지 휙+젖은 찰싹 / 내려찍기=흙덩이·썩은 둥치 착지+진흙 튐 / 포자=마른 꼬투리 푸슉). 가공은 1차와 같되 **35Hz 하이패스(4차)를 먼저 건다**: 생성 원본의 에너지 대부분이 40Hz 아래(예: `druid_hit_v3a` 94%)라 들리지 않는 성분이 −1dBTP 천장을 먹어 들리는 부분이 약 4~10dB 작았다(후보별)(HPF 뒤 피크 −1.7→−9.1dBFS). 고르기 페이지 `pick_druid2.html`(PICKSETS `druid2`, 제출 버튼, 장면=BGM B+채택 아레나 앰비언스), `druid_hit` 4후보 계열 측정은 카드에 표시. 서버 재시작 전이라 `?set=druid2`는 아직 400 |
| 2026-10-28 | 2차 고르기 결과 기록(§6.1): `druid_hit`=v3d(1개만 채택 → 변형 순환 없이 rate ±6%·연타 감쇠로 감)·`druid_hit_heavy`=v3d·`druid_whip`=v3a 채택, `druid_slam`·`druid_spore`는 2회 연속 전부 안 맞음. a·b 등 나머지는 미사용 |
| 2026-10-28 | 3차 후보 생성(sound-simple, 사운드 총괄 지시): `druid_slam`(2회 연속 불채택)·`druid_spore`(2회 연속 불채택)·`ui_tab`(UI 4후보 불채택) 각 4후보. slam·spore의 a·b는 웹에 이미 있는 소리(slam: `skillsound/slam/heavy_hit.mp3`·`scarecrow_boom.mp3`, spore: `pickup/pickup_rummage2.mp3`·`pickup_rummage1.mp3` — 파일 이름·`volumedetect`·스펙트럼 측정으로 골랐고 청음은 아직), c·d는 ElevenLabs 새 생성(1·2차와 다른 해석: slam="거대한 나무 둥치가 땅을 내려쳐 땅이 울림", spore="축축한 버섯갓이 터지며 쉭 퍼짐"). `ui_tab`의 a·b는 기존 채택 `ui_button_confirm` 앞 0.19초 음정 +25%·`ui_button_hover` 음정 −20%(둘 다 0.15초), c·d는 새로 생성(조약돌 틱·거친 천 스침). 가공: 새 소리와 웹 기존 소리 모두 35Hz HPF(4차) → −1dBTP(새 소리는 뒤 무음 정리도, `ui_tab` 새 소리는 0.15초 컷). 카탈로그 `tools/sfx_forge_catalog_druid_r3.json`(키 `<key>_r3c`·`_r3d`). 고르기 `pick_r3.html`(3카드·12후보, 추천 표시 없음, `?set=r3`, 서버 PICKSETS `r3` 추가 — **실행 중인 서버 재시작 전에는 400**). 헤드리스 점검: 오디오 12개 모두 로드, 라디오 3/3 선택·자동 저장 POST 모의, 장면 12개 오류 없음, pageerror 0. 청음 전 |
| 2026-10-28 | 3차 결과 기록(§6.2): `druid_slam`=r3d(메모 "볼륨 키우고 에코")·`druid_spore`=r3a(웹 `pickup_rummage2`)·`ui_tab`=r3c 채택. `ui_tab` 웹 반영 완료. `druid_slam` 가공본 e1~e3 4차 제작(§6.3, `pick_r4.html`, 청음 전) |
