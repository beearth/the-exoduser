# VFX-06 폐기 후보 정리 — 2026-11-03

- 기준 HEAD: 5ac7d7b612ebf0c09d826f22558fbbf85e440f4a (detached). Unity 비교 ref: 9dc27dea561269bfc6639a6419de0bc0224479d3 (로컬 origin/unity/main). fetch/브랜치 변경/commit/push 없음.
- 끝의 표준 규칙(워크트리 밖 쓰기 금지)에 따라 검사 스크립트와 결과도 이 워크트리 안에 둔다.
- 기존 game.html/실행 코드 수정 없음. 브라우저/Unity/유료 API 실행 없음. tracked 파일만 git rm 대상이다.
- 파일 참조 정리 판정이며 아트 품질/실게임 PASS가 아니다. 원격 최신 상태/런타임 로드는 미검증이다.

| 판정 | 파일 수 | 용량 |
|---|---:|---:|
| 삭제 | 0 | 0 B (0.00 MiB) |
| 삭제 후보(미실행) | 111 | 127,525,660 B (121.62 MiB) |
| 유지 | 191 | 216,049,236 B (206.04 MiB) |
| 불확실 유지 | 10 | 16,642,270 B (15.87 MiB) |

삭제 실행: fatal: Unable to create 'G:/exoduser/.git/worktrees/codex-vfx-cleanup/index.lock': Permission denied

남은 문제: 이 워크트리의 Git 인덱스는 G:/exoduser/.git/worktrees/codex-vfx-cleanup/에 있으며 현재 세션은 쓰기 권한이 없다. git rm 첫 묶음이 index.lock 생성 전에 실패하여 실제 삭제/스테이징은 0개다. 대체 인덱스나 직접 파일 삭제로 우회하지 않았다.

## 검사 범위

- 필수 소스 124개: game/index, 존재하는 demo, engine/, data/, lang_*.js, 전체 CSS, 빌드/서버 코드. 확장자 포함 이름과 stem 토큰 모두 검색한다. 주석 참조도 유지 쪽으로 처리한다. 추가 제작/검수 소스 622개 참조도 불확실 보존한다.
- assets/vfx/, img/vfx/, img/balls/, sprites/의 png/webp/jpg/jpeg/json/mp4. output/는 vfx/, ki_slash_radiant_*, kraken_water_*, silvertail_e_arc_*를 VFX 후보로 식별했다. 캐릭터 동작/마케팅/시네마틱/음원과 GIF/SVG/TXT는 범위 밖이다.
- Unity Art 포함 Resources 전체 Git blob 비교. 이름이 달라도 blob이 같으면 유지. tools/vfx/src/*_orig.png는 범위 밖 보존 원료이며 source/original도 불확실 유지.
- docs/ 전체 Markdown 파일명 검색: 178개 문서 매칭. 문서 참조만으로 런타임 사용이라 판정하지 않는다. 전체 매칭/소스 목록은 audit.json에 있다.
- untracked는 실제 디렉터리 순회로 포함하고 삭제하지 않는다. 알 수 없는 동적 접두사는 일치 파일 전부 불확실 유지.

## 경로 검증

| 검사 | 삭제 전 누락 | 삭제 후 누락 | 새 누락 |
|---|---:|---:|---:|
| game.html 전체 정적 로컬 경로 411개 | 32 | 32 | 0 |
| VFX 동적 경로 72개 | 0 | 0 | 0 |

game.html 바이트 불변: true. 주석 전용 줄/원격 URL/쿼리 제외 문자열 검사이며 실게임 검증은 아니다. 기존 누락이 있으면 전체 누락 0 목표 미충족으로 보고한다. 코드 수정 금지에 따라 기존 누락은 수정하지 않는다.

기존 정적 누락:

- assets/vfx/boss/boss_chainLights.webp
- assets/vfx/boss/boss_crossWipe.webp
- assets/vfx/boss/boss_darkZone.webp
- assets/vfx/boss/boss_donutSlam.webp
- assets/vfx/boss/boss_doppelganger.webp
- assets/vfx/boss/boss_fanWave.webp
- assets/vfx/boss/boss_fireRain.webp
- assets/vfx/boss/boss_fissure.webp
- assets/vfx/boss/boss_gSlamWave.webp
- assets/vfx/boss/boss_gravityWell.webp
- assets/vfx/boss/boss_gwLightning.webp
- assets/vfx/boss/boss_gwPillar.webp
- assets/vfx/boss/boss_judgeCut.webp
- assets/vfx/boss/boss_lavaPools.webp
- assets/vfx/boss/boss_mirrorClone.webp
- assets/vfx/boss/boss_orbWeave.webp
- assets/vfx/boss/boss_phantomSwords.webp
- assets/vfx/boss/boss_pillars.webp
- assets/vfx/boss/boss_poisonPool.webp
- assets/vfx/boss/boss_radialLaser.webp
- assets/vfx/boss/boss_rewindMark.webp
- assets/vfx/boss/boss_safeCorner.webp
- assets/vfx/boss/boss_seekerMines.webp
- assets/vfx/boss/boss_shockGrid.webp
- assets/vfx/boss/boss_soulAnchor.webp
- assets/vfx/boss/boss_tidalWipe.webp
- assets/vfx/boss/boss_tideWave.webp
- assets/vfx/boss/boss_wallPush.webp
- atlas_enemies.json
- atlas_enemies.png
- img/balls/proj_arrow_ltn.png
- img/balls/proj_arrow_phys.png

기존 동적 누락:


## 동적 패턴과 펼친 이름

### 'assets/vfx/fire_'+fi+'.webp' (fi=1..4)

game.html:8865,19752; both loops load four frames (resolved)

- assets/vfx/fire_1.webp
- assets/vfx/fire_2.webp
- assets/vfx/fire_3.webp
- assets/vfx/fire_4.webp

### 'assets/vfx/impact_el'+e+'_sheet.png' (e=0..5)

game.html:19273-19277 (resolved)

- assets/vfx/impact_el0_sheet.png
- assets/vfx/impact_el1_sheet.png
- assets/vfx/impact_el2_sheet.png
- assets/vfx/impact_el3_sheet.png
- assets/vfx/impact_el4_sheet.png
- assets/vfx/impact_el5_sheet.png

### 'assets/vfx/impact_el'+e+'_boss_sheet.png' (e=0..5)

game.html:19273-19277 (resolved)

- assets/vfx/impact_el0_boss_sheet.png
- assets/vfx/impact_el1_boss_sheet.png
- assets/vfx/impact_el2_boss_sheet.png
- assets/vfx/impact_el3_boss_sheet.png
- assets/vfx/impact_el4_boss_sheet.png
- assets/vfx/impact_el5_boss_sheet.png

### 'assets/vfx/malice_mortar_explode/sprite-384px-9-frames/frame_'+String(i).padStart(3,'0')+'.png'

game.html:19330-19331; _MM_EXP_FRAMES=9 (resolved)

- assets/vfx/malice_mortar_explode/sprite-384px-9-frames/frame_000.png
- assets/vfx/malice_mortar_explode/sprite-384px-9-frames/frame_001.png
- assets/vfx/malice_mortar_explode/sprite-384px-9-frames/frame_002.png
- assets/vfx/malice_mortar_explode/sprite-384px-9-frames/frame_003.png
- assets/vfx/malice_mortar_explode/sprite-384px-9-frames/frame_004.png
- assets/vfx/malice_mortar_explode/sprite-384px-9-frames/frame_005.png
- assets/vfx/malice_mortar_explode/sprite-384px-9-frames/frame_006.png
- assets/vfx/malice_mortar_explode/sprite-384px-9-frames/frame_007.png
- assets/vfx/malice_mortar_explode/sprite-384px-9-frames/frame_008.png

### _TVFX2_PATH+l.src

game.html:19187-19244; layer table (resolved)

- assets/vfx/Air_Air_FBF_4x4.png
- assets/vfx/Arcane_Arcane_FBF_6x6.png
- assets/vfx/Arcane_BasicImpact.png
- assets/vfx/Arcane_MediumImpact.png
- assets/vfx/Dark_BasicImpact.png
- assets/vfx/Dark_DarkSmoke_FBF_4x4.png
- assets/vfx/Dark_MediumImpact.png
- assets/vfx/Dark_Smoke_Sheet_6x6.png
- assets/vfx/Earth_BasicImpact.png
- assets/vfx/Earth_EarthSmoke_FBF_5x5.png
- assets/vfx/Earth_ImpactEarth_Sheet.png
- assets/vfx/Fire_BasicImpact.png
- assets/vfx/Fire_FBF_4x4.png
- assets/vfx/Fire_ImpactFire_Sheet.png
- assets/vfx/Fire_MediumImpact.png
- assets/vfx/Ice_BasicImpact.png
- assets/vfx/Ice_ImpactIce_Sheet.png
- assets/vfx/Ice_MistSmoke_FBF_4x4.png
- assets/vfx/Light_ImpactLight_Sheet.png
- assets/vfx/Lightning_BasicImpact.png
- assets/vfx/Lightning_ImpactLightning_Sheet.png
- assets/vfx/Lightning_Lightning_FBF_4x3.png
- assets/vfx/Nature_BasicImpact.png
- assets/vfx/Nature_ImpactNature_Sheet.png
- assets/vfx/Nature_MediumImpact.png
- assets/vfx/Poison_BasicImpact.png
- assets/vfx/Poison_MediumImpact.png
- assets/vfx/Water_ImpactWater_Sheet.png
- assets/vfx/Water_Water_FBF_4x4.png

### _V3_SS+'filename'

game.html:65790-65813; 3D preload (resolved)

- assets/vfx/Air_Air_FBF_4x4.png
- assets/vfx/Arcane_Arcane_FBF_6x6.png
- assets/vfx/Arcane_BasicImpact.png
- assets/vfx/Arcane_MediumImpact.png
- assets/vfx/Dark_BasicImpact.png
- assets/vfx/Dark_DarkSmoke_FBF_4x4.png
- assets/vfx/Dark_MediumImpact.png
- assets/vfx/Dark_Smoke_Sheet_6x6.png
- assets/vfx/Earth_BasicImpact.png
- assets/vfx/Earth_EarthSmoke_FBF_5x5.png
- assets/vfx/Earth_ImpactEarth_Sheet.png
- assets/vfx/Earth_MediumImpact.png
- assets/vfx/Fire_BasicImpact.png
- assets/vfx/Fire_FBF_4x4.png
- assets/vfx/Fire_ImpactFire_Sheet.png
- assets/vfx/Fire_MediumImpact.png
- assets/vfx/Ice_BasicImpact.png
- assets/vfx/Ice_ImpactIce_Sheet.png
- assets/vfx/Ice_MediumImpact.png
- assets/vfx/Ice_MistSmoke_FBF_4x4.png
- assets/vfx/Light_ImpactLight_Sheet.png
- assets/vfx/Lightning_BasicImpact.png
- assets/vfx/Lightning_ImpactLightning_Sheet.png
- assets/vfx/Lightning_Lightning_FBF_4x3.png
- assets/vfx/Lightning_MediumImpact.png
- assets/vfx/Nature_BasicImpact.png
- assets/vfx/Nature_ImpactNature_Sheet.png
- assets/vfx/Nature_MediumImpact.png
- assets/vfx/Poison_BasicImpact.png
- assets/vfx/Poison_MediumImpact.png
- assets/vfx/Water_ImpactWater_Sheet.png
- assets/vfx/Water_Water_FBF_4x4.png

### 'img/balls/proj_bolt_'+n+'.png'

game.html:14681,24654-24655 (resolved)

- img/balls/proj_bolt_dark.png
- img/balls/proj_bolt_fire.png
- img/balls/proj_bolt_holy.png
- img/balls/proj_bolt_ice.png
- img/balls/proj_bolt_ltn.png
- img/balls/proj_bolt_phys.png

### 'img/balls/proj_shard_'+p[0]+'.png'

game.html:24660-24661 (resolved)

- img/balls/proj_shard_dark.png
- img/balls/proj_shard_fire.png
- img/balls/proj_shard_holy.png

### 'img/balls/proj_'+pt+'_'+en+'.png' with overrides/skip

game.html:24310-24326; shard_2/4 skipped; shard_phys/ltn override to dark/fire (resolved)

- img/balls/proj_bolt_dark.png
- img/balls/proj_bolt_fire.png
- img/balls/proj_bolt_holy.png
- img/balls/proj_bolt_ice.png
- img/balls/proj_bolt_ltn.png
- img/balls/proj_bolt_phys.png
- img/balls/proj_shard_dark.png
- img/balls/proj_shard_fire.png
- img/balls/proj_shard_holy.png

### 'ki_slash_hit_'+i

In-memory tinted surfaces, not filenames: game.html:19770-19776 (in-memory)

- assets/vfx/ki_slash_hit_silver_sheet.png

### 'parry_impact_el'+n

Registered IDs map to explicit paths; no parry_fx/parry_new loader (resolved)

- assets/vfx/parry_impact_el1.png
- assets/vfx/parry_impact_el2.png
- assets/vfx/parry_impact_el3.png
- assets/vfx/parry_impact_el4.png
- assets/vfx/parry_impact_el5.png

## 파일별 판정

| 경로 | 크기(B) | 마지막 커밋 날짜 | 참조 검사 | 판정 | 근거 |
|---|---:|---|---|---|---|
| assets/vfx/Air_Air_FBF_4x4.png | 18845 | 2026-05-23T01:30:06+09:00 | 정적 1 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 7개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/Arcane_Arcane_FBF_6x6.png | 63654 | 2026-10-27T13:29:24+09:00 | 정적 1 / 동적 1 / Unity 1 | 유지 | 정적 이름 참조 1개 소스; 동적 경로/등록 이름 전개 일치; Unity Resources 동일 Git blob; 제작/검수 도구 등 추가 참조 8개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/Arcane_BasicImpact.png | 56067 | 2026-10-27T13:29:24+09:00 | 정적 1 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 8개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/Arcane_MediumImpact.png | 189153 | 2026-10-27T13:29:24+09:00 | 정적 1 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 8개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/Blood_FBF_4x4.png | 96797 | 2026-06-06T12:30:06+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 제작/검수 도구 등 추가 참조 6개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/Dark_BasicImpact.png | 55744 | 2026-10-27T13:08:34+09:00 | 정적 1 / 동적 1 / Unity 1 | 유지 | 정적 이름 참조 1개 소스; 동적 경로/등록 이름 전개 일치; Unity Resources 동일 Git blob; 제작/검수 도구 등 추가 참조 8개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/Dark_DarkSmoke_FBF_4x4.png | 62701 | 2026-10-27T13:08:34+09:00 | 정적 2 / 동적 1 / Unity 1 | 유지 | 정적 이름 참조 2개 소스; 동적 경로/등록 이름 전개 일치; Unity Resources 동일 Git blob; 제작/검수 도구 등 추가 참조 8개 / engine/fdg/druid-contact-vfx.js, game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/Dark_MediumImpact.png | 186350 | 2026-10-27T13:08:34+09:00 | 정적 2 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 8개 / engine/fdg/druid-contact-vfx.js, game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/Dark_Smoke_BW_6x6.png | 280116 | 2026-06-06T12:30:06+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 제작/검수 도구 등 추가 참조 8개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/Dark_Smoke_Sheet_6x6.png | 254103 | 2026-10-27T13:08:34+09:00 | 정적 1 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 8개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/Earth_BasicImpact.png | 68239 | 2026-05-23T01:30:06+09:00 | 정적 1 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 7개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/Earth_EarthSmoke_FBF_5x5.png | 143211 | 2026-05-23T01:30:06+09:00 | 정적 1 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 7개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/Earth_ImpactEarth_Sheet.png | 137317 | 2026-05-23T01:30:06+09:00 | 정적 1 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 7개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/Earth_MediumImpact.png | 199843 | 2026-05-23T01:30:06+09:00 | 정적 1 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 7개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/Fire_BasicImpact.png | 51544 | 2026-10-27T09:17:45+09:00 | 정적 1 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 11개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/Fire_FBF_4x4.png | 177649 | 2026-10-27T09:17:45+09:00 | 정적 1 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 9개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/Fire_ImpactFire_Sheet.png | 177650 | 2026-10-27T09:17:45+09:00 | 정적 1 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 8개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/Fire_MediumImpact.png | 177082 | 2026-10-27T09:17:45+09:00 | 정적 1 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 11개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/Ice_BasicImpact.png | 56006 | 2026-10-27T14:14:45+09:00 | 정적 1 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 8개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/Ice_ImpactIce_Sheet.png | 186236 | 2026-10-27T14:14:45+09:00 | 정적 1 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 8개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/Ice_MediumImpact.png | 186908 | 2026-10-27T14:14:45+09:00 | 정적 1 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 8개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/Ice_MistSmoke_FBF_4x4.png | 72494 | 2026-10-27T14:14:45+09:00 | 정적 1 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 9개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/Light_ImpactLight_Sheet.png | 198817 | 2026-05-23T01:30:06+09:00 | 정적 1 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 7개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/Lightning_BasicImpact.png | 67807 | 2026-05-23T01:30:06+09:00 | 정적 1 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 7개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/Lightning_ImpactLightning_Sheet.png | 186360 | 2026-05-23T01:30:06+09:00 | 정적 1 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 7개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/Lightning_Lightning_FBF_4x3.png | 65909 | 2026-05-23T01:30:06+09:00 | 정적 1 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 7개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/Lightning_MediumImpact.png | 200181 | 2026-05-23T01:30:06+09:00 | 정적 1 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 7개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/Nature_BasicImpact.png | 66270 | 2026-05-23T01:30:06+09:00 | 정적 1 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 7개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/Nature_ImpactNature_Sheet.png | 156572 | 2026-05-23T01:30:06+09:00 | 정적 1 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 7개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/Nature_MediumImpact.png | 193291 | 2026-05-23T01:30:06+09:00 | 정적 1 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 7개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/Poison_BasicImpact.png | 56216 | 2026-10-27T13:29:24+09:00 | 정적 1 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 8개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/Poison_MediumImpact.png | 185807 | 2026-10-27T13:29:24+09:00 | 정적 1 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 8개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/Water_ImpactWater_Sheet.png | 171704 | 2026-10-27T14:14:45+09:00 | 정적 1 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 8개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/Water_Water_FBF_4x4.png | 172698 | 2026-10-27T14:14:45+09:00 | 정적 1 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 8개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/arc_laser/laser_sheet.png | 1456519 | 2026-05-22T17:30:07+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 8개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/boss/beam_laser_c.png | 2509553 | 2026-09-03T22:40:51+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 제작/검수 도구 등 추가 참조 1개 / game.html / game-easy-test.html |
| assets/vfx/boss/boss_cageTrap.webp | 639218 | 2026-09-03T22:40:51+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 9개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/boss/boss_death_blood_24_20261010.clip.json | 231 | 2026-10-16T01:47:19+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스 / game.html |
| assets/vfx/boss/boss_death_blood_24_20261010.png | 5662466 | 2026-10-16T01:47:19+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스 / game.html |
| assets/vfx/boss/boss_meteor_hit_24_20261010.clip.json | 317 | 2026-10-16T01:47:19+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스 / game.html |
| assets/vfx/boss/boss_meteor_hit_24_20261010.png | 4112816 | 2026-10-16T01:47:19+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스 / game.html |
| assets/vfx/boss/charge_lane_c.png | 3551742 | 2026-09-03T22:40:51+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| assets/vfx/boss/druid_dust_24_20261010.clip.json | 323 | 2026-10-16T01:47:19+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스 / game.html |
| assets/vfx/boss/druid_dust_24_20261010.png | 7251570 | 2026-10-16T01:47:19+09:00 | 정적 1 / 동적 0 / Unity 1 | 유지 | 정적 이름 참조 1개 소스; Unity Resources 동일 Git blob / game.html |
| assets/vfx/boss/druid_hit_24_20261010.clip.json | 321 | 2026-10-16T01:47:19+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스 / game.html |
| assets/vfx/boss/druid_hit_24_20261010.png | 10563300 | 2026-10-16T01:47:19+09:00 | 정적 1 / 동적 0 / Unity 1 | 유지 | 정적 이름 참조 1개 소스; Unity Resources 동일 Git blob / game.html |
| assets/vfx/boss/druid_orb_24_20261009.clip.json | 320 | 2026-10-16T01:47:19+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스 / game.html |
| assets/vfx/boss/druid_orb_24_20261009.png | 9771023 | 2026-10-16T01:47:19+09:00 | 정적 1 / 동적 0 / Unity 1 | 유지 | 정적 이름 참조 1개 소스; Unity Resources 동일 Git blob / game.html |
| assets/vfx/boss/druid_poison_hit_24_20261009.clip.json | 319 | 2026-10-16T01:47:19+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스 / game.html |
| assets/vfx/boss/druid_poison_hit_24_20261009.png | 6614708 | 2026-10-16T01:47:19+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스 / game.html |
| assets/vfx/boss/druid_poison_pool_24_20261009.clip.json | 232 | 2026-10-16T01:47:19+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스 / game.html |
| assets/vfx/boss/druid_poison_pool_24_20261009.png | 5818481 | 2026-10-16T01:47:19+09:00 | 정적 0 / 동적 0 / Unity 1 | 유지 | Unity Resources 동일 Git blob |
| assets/vfx/boss/druid_roots_48_20261010.clip.json | 325 | 2026-10-16T01:47:19+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스 / game.html |
| assets/vfx/boss/druid_roots_48_20261010.png | 9287001 | 2026-10-16T01:47:19+09:00 | 정적 1 / 동적 0 / Unity 1 | 유지 | 정적 이름 참조 1개 소스; Unity Resources 동일 Git blob / game.html |
| assets/vfx/boss/druid_shockring_24_20261010.clip.json | 333 | 2026-10-16T01:47:19+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스 / game.html |
| assets/vfx/boss/druid_shockring_24_20261010.png | 7920159 | 2026-10-16T01:47:19+09:00 | 정적 1 / 동적 0 / Unity 1 | 유지 | 정적 이름 참조 1개 소스; Unity Resources 동일 Git blob / game.html |
| assets/vfx/boss/source/boss_cageTrap_source_20260903_193333.png | 2454678 | 2026-09-03T22:40:51+09:00 | 정적 0 / 동적 0 / Unity 0 | 불확실 | 제작/검수 도구 등 추가 참조 1개; 원본 경로: 보존 / tools/process-boss-cage-trap-sheet.mjs |
| assets/vfx/boss/ult_black.png | 4692535 | 2026-09-03T22:40:51+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| assets/vfx/boss/ult_black_c.png | 5356283 | 2026-09-03T22:40:51+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 제작/검수 도구 등 추가 참조 1개 / game.html / game-easy-test.html |
| assets/vfx/boss/ult_holy.png | 4836539 | 2026-09-03T22:40:51+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| assets/vfx/boss/ult_holy_c.png | 3788759 | 2026-09-03T22:40:51+09:00 | 정적 0 / 동적 0 / Unity 0 | 불확실 | 제작/검수 도구 등 추가 참조 1개 / game-easy-test.html |
| assets/vfx/boss/ult_lava.png | 3792286 | 2026-09-03T22:40:51+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| assets/vfx/boss/ult_lava_c.png | 4072255 | 2026-09-03T22:40:51+09:00 | 정적 0 / 동적 0 / Unity 0 | 불확실 | 제작/검수 도구 등 추가 참조 1개 / game-easy-test.html |
| assets/vfx/boss/vfx_dark_beam.png | 1164363 | 2026-05-08T16:30:06+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 49개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/boss/vfx_holy_burst.png | 2711250 | 2026-05-08T16:30:06+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 49개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/boss/vfx_lava_erupt.png | 1707135 | 2026-05-08T16:30:06+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 49개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/boss/vfx_void_black.png | 2654044 | 2026-05-08T16:30:06+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 49개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/boss_backup_20260903/boss_cageTrap.webp | 662868 | 2026-09-03T22:40:51+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 9개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/bullet_black_hole_sheet.png | 1564248 | 2026-09-03T22:40:51+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 제작/검수 도구 등 추가 참조 2개 / game.html / game-easy-test.html, tools/process-bullet-black-hole-sheet.mjs |
| assets/vfx/chain_assault_impact_realistic.png | 1085190 | 2026-09-08T14:25:46+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 제작/검수 도구 등 추가 참조 1개 / game.html / game-easy-test.html |
| assets/vfx/chain_shuriken_1.webp | 4788 | 2026-03-18T15:44:54+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| assets/vfx/chain_shuriken_2.webp | 6574 | 2026-03-18T15:44:54+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 22개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/chain_slam_impact_realistic.png | 1271230 | 2026-09-08T14:25:46+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 제작/검수 도구 등 추가 참조 1개 / game.html / game-easy-test.html |
| assets/vfx/cres9_c.webp | 5930 | 2026-03-20T23:30:05+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| assets/vfx/cres_c.webp | 4152 | 2026-03-20T23:30:05+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| assets/vfx/crescent_slash.webp | 38918 | 2026-03-20T23:30:05+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 30개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/druid_dust.png | 856528 | 2026-08-26T07:15:54+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 제작/검수 도구 등 추가 참조 1개 / game.html / game-easy-test.html |
| assets/vfx/druid_hit_impact.png | 1929765 | 2026-08-25T14:25:39+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 제작/검수 도구 등 추가 참조 1개 / game.html / game-easy-test.html |
| assets/vfx/druid_poison.png | 196018 | 2026-08-26T00:32:41+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 제작/검수 도구 등 추가 참조 1개 / game.html / game-easy-test.html |
| assets/vfx/druid_roots.png | 770532 | 2026-08-26T07:15:54+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 제작/검수 도구 등 추가 참조 1개 / game.html / game-easy-test.html |
| assets/vfx/druid_shockring.png | 727750 | 2026-08-25T20:28:46+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 제작/검수 도구 등 추가 참조 1개 / game.html / game-easy-test.html |
| assets/vfx/druid_trail.png | 516326 | 2026-08-26T09:33:20+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 제작/검수 도구 등 추가 참조 1개 / game.html / game-easy-test.html |
| assets/vfx/enemy/charge_body_mist.png | 158108 | 2026-09-03T22:40:51+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 제작/검수 도구 등 추가 참조 1개 / game.html / game-easy-test.html |
| assets/vfx/enemy/charge_end_spear.png | 470613 | 2026-09-03T22:40:51+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 제작/검수 도구 등 추가 참조 1개 / game.html / game-easy-test.html |
| assets/vfx/enemy/charge_start_rift.png | 432986 | 2026-09-03T22:40:51+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 제작/검수 도구 등 추가 참조 1개 / game.html / game-easy-test.html |
| assets/vfx/fieldboss/boss_fire_impact_24_20261010.png | 7638540 | 2026-10-16T01:47:19+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 6개 / data/vfx/boss_fire_impact24_20261010.json, game.html / tools/fdg-studio/fixtures/hell-aberrant-tail-idle.fdg.json, tools/fdg-studio/fixtures/hell-aberrant-tail-readability.fdg.json, tools/fdg-studio/fixtures/hell-aberrant-tail-sequence.fdg.json |
| assets/vfx/fieldboss/boss_water_impact_24_20261010.png | 7278402 | 2026-10-16T01:47:19+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스 / data/vfx/boss_water_impact24_20261010.json, game.html |
| assets/vfx/fieldboss/firedevil_orb_24_20261010.png | 11348701 | 2026-10-16T01:47:19+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스 / data/vfx/firedevil_orb24_20261010.json, game.html |
| assets/vfx/fieldboss/kraken_water_orb_24_20261010.png | 14733227 | 2026-10-16T01:47:19+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스 / data/vfx/kraken_water_orb24_20261010.json, game.html |
| assets/vfx/fire_1.webp | 216324 | 2026-03-18T15:44:54+09:00 | 정적 2 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 48개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/fire_2.webp | 366942 | 2026-03-18T15:44:54+09:00 | 정적 0 / 동적 1 / Unity 0 | 유지 | 동적 경로/등록 이름 전개 일치 |
| assets/vfx/fire_3.webp | 212922 | 2026-03-18T15:44:54+09:00 | 정적 0 / 동적 1 / Unity 0 | 유지 | 동적 경로/등록 이름 전개 일치 |
| assets/vfx/fire_4.webp | 257904 | 2026-03-18T15:44:54+09:00 | 정적 0 / 동적 1 / Unity 0 | 유지 | 동적 경로/등록 이름 전개 일치 |
| assets/vfx/fire_beam/fire_beam_spritesheet.png | 3080884 | 2026-03-28T22:30:06+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 21개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/fire_burst_radial.webp | 495604 | 2026-04-30T01:30:05+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 8개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/fire_explode/fire_explode_spritesheet.png | 640424 | 2026-05-01T20:30:05+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 21개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/flame_blade_swing_8f.png | 657365 | 2026-09-13T20:52:36+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 제작/검수 도구 등 추가 참조 1개 / game.html / game-easy-test.html |
| assets/vfx/giant_slam_impact_sheet.png | 2148895 | 2026-09-03T23:45:51+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 제작/검수 도구 등 추가 참조 2개 / game.html / game-easy-test.html, tools/generate_slam_vfx.mjs |
| assets/vfx/ground_crack_sheet.png | 38052 | 2026-03-29T14:30:06+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 21개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/hb_fade_7.webp | 240076 | 2026-03-18T15:44:54+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 41개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/hb_fade_8.webp | 126272 | 2026-03-18T15:44:54+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 41개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/hb_mid_3.webp | 164628 | 2026-03-18T15:44:54+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 41개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/hb_mid_4.webp | 162056 | 2026-03-18T15:44:54+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 41개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/hb_peak_5.webp | 247146 | 2026-03-18T15:44:54+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 41개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/hb_peak_6.webp | 249010 | 2026-03-18T15:44:54+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 41개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/impact_basic_sheet.png | 81656 | 2026-10-26T22:49:59+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 23개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/impact_el0_boss_sheet.png | 167626 | 2026-10-26T22:49:59+09:00 | 정적 0 / 동적 1 / Unity 0 | 유지 | 동적 경로/등록 이름 전개 일치 |
| assets/vfx/impact_el0_sheet.png | 46580 | 2026-10-26T22:49:59+09:00 | 정적 0 / 동적 1 / Unity 0 | 유지 | 동적 경로/등록 이름 전개 일치 |
| assets/vfx/impact_el1_boss_sheet.png | 150050 | 2026-10-26T22:49:59+09:00 | 정적 0 / 동적 1 / Unity 0 | 유지 | 동적 경로/등록 이름 전개 일치 |
| assets/vfx/impact_el1_sheet.png | 45354 | 2026-10-26T22:49:59+09:00 | 정적 0 / 동적 1 / Unity 0 | 유지 | 동적 경로/등록 이름 전개 일치 |
| assets/vfx/impact_el2_boss_sheet.png | 170647 | 2026-10-26T22:49:59+09:00 | 정적 0 / 동적 1 / Unity 0 | 유지 | 동적 경로/등록 이름 전개 일치 |
| assets/vfx/impact_el2_sheet.png | 54434 | 2026-10-26T22:49:59+09:00 | 정적 0 / 동적 1 / Unity 0 | 유지 | 동적 경로/등록 이름 전개 일치 |
| assets/vfx/impact_el3_boss_sheet.png | 163678 | 2026-10-26T22:49:59+09:00 | 정적 0 / 동적 1 / Unity 0 | 유지 | 동적 경로/등록 이름 전개 일치 |
| assets/vfx/impact_el3_sheet.png | 48000 | 2026-10-26T22:49:59+09:00 | 정적 0 / 동적 1 / Unity 0 | 유지 | 동적 경로/등록 이름 전개 일치 |
| assets/vfx/impact_el4_boss_sheet.png | 162692 | 2026-10-26T22:49:59+09:00 | 정적 0 / 동적 1 / Unity 0 | 유지 | 동적 경로/등록 이름 전개 일치 |
| assets/vfx/impact_el4_sheet.png | 44881 | 2026-10-26T22:49:59+09:00 | 정적 0 / 동적 1 / Unity 0 | 유지 | 동적 경로/등록 이름 전개 일치 |
| assets/vfx/impact_el5_boss_sheet.png | 193680 | 2026-10-26T22:49:59+09:00 | 정적 0 / 동적 1 / Unity 0 | 유지 | 동적 경로/등록 이름 전개 일치 |
| assets/vfx/impact_el5_sheet.png | 103782 | 2026-10-26T22:49:59+09:00 | 정적 0 / 동적 1 / Unity 0 | 유지 | 동적 경로/등록 이름 전개 일치 |
| assets/vfx/inferno_slam_impact_sheet.png | 1918639 | 2026-09-03T23:45:51+09:00 | 정적 1 / 동적 0 / Unity 1 | 유지 | 정적 이름 참조 1개 소스; Unity Resources 동일 Git blob; 제작/검수 도구 등 추가 참조 2개 / game.html / game-easy-test.html, tools/generate_slam_vfx.mjs |
| assets/vfx/ki_slash_hit_radiant_sheet.png | 1047813 | 2026-09-15T15:23:48+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| assets/vfx/ki_slash_hit_silver_sheet.png | 755439 | 2026-10-11T23:46:32+09:00 | 정적 1 / 동적 1 / Unity 1 | 유지 | 정적 이름 참조 1개 소스; 동적 경로/등록 이름 전개 일치; Unity Resources 동일 Git blob; 제작/검수 도구 등 추가 참조 1개 / game.html / game-easy-test.html |
| assets/vfx/ki_slash_radiant_sheet.png | 1249060 | 2026-09-15T15:23:48+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| assets/vfx/ki_slash_silver_sheet.png | 734957 | 2026-10-11T23:46:32+09:00 | 정적 1 / 동적 0 / Unity 1 | 유지 | 정적 이름 참조 1개 소스; Unity Resources 동일 Git blob; 제작/검수 도구 등 추가 참조 1개 / game.html / game-easy-test.html |
| assets/vfx/lightning_burst_sheet.png | 98229 | 2026-03-29T12:30:06+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 21개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/malice_dome.png | 2562460 | 2026-05-24T19:30:05+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 제작/검수 도구 등 추가 참조 6개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/malice_mortar_explode/sprite-384px-9-frames/frame_000.png | 84832 | 2026-03-18T15:44:54+09:00 | 정적 0 / 동적 1 / Unity 0 | 유지 | 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 1개 / tools/sync_silvertail_pixellab.mjs |
| assets/vfx/malice_mortar_explode/sprite-384px-9-frames/frame_001.png | 122068 | 2026-03-18T15:44:54+09:00 | 정적 0 / 동적 1 / Unity 0 | 유지 | 동적 경로/등록 이름 전개 일치 |
| assets/vfx/malice_mortar_explode/sprite-384px-9-frames/frame_002.png | 144713 | 2026-03-18T15:44:54+09:00 | 정적 0 / 동적 1 / Unity 0 | 유지 | 동적 경로/등록 이름 전개 일치 |
| assets/vfx/malice_mortar_explode/sprite-384px-9-frames/frame_003.png | 153302 | 2026-03-18T15:44:54+09:00 | 정적 0 / 동적 1 / Unity 0 | 유지 | 동적 경로/등록 이름 전개 일치 |
| assets/vfx/malice_mortar_explode/sprite-384px-9-frames/frame_004.png | 159563 | 2026-03-18T15:44:54+09:00 | 정적 0 / 동적 1 / Unity 0 | 유지 | 동적 경로/등록 이름 전개 일치 |
| assets/vfx/malice_mortar_explode/sprite-384px-9-frames/frame_005.png | 176785 | 2026-03-18T15:44:54+09:00 | 정적 0 / 동적 1 / Unity 0 | 유지 | 동적 경로/등록 이름 전개 일치 |
| assets/vfx/malice_mortar_explode/sprite-384px-9-frames/frame_006.png | 200391 | 2026-03-18T15:44:54+09:00 | 정적 0 / 동적 1 / Unity 0 | 유지 | 동적 경로/등록 이름 전개 일치 |
| assets/vfx/malice_mortar_explode/sprite-384px-9-frames/frame_007.png | 211519 | 2026-03-18T15:44:54+09:00 | 정적 0 / 동적 1 / Unity 0 | 유지 | 동적 경로/등록 이름 전개 일치 |
| assets/vfx/malice_mortar_explode/sprite-384px-9-frames/frame_008.png | 170872 | 2026-03-18T15:44:54+09:00 | 정적 0 / 동적 1 / Unity 0 | 유지 | 동적 경로/등록 이름 전개 일치 |
| assets/vfx/parry_fx_el0.png | 53859 | 2026-05-23T00:30:09+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| assets/vfx/parry_fx_el1.png | 75290 | 2026-05-23T00:30:09+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| assets/vfx/parry_fx_el2.png | 56630 | 2026-05-23T00:30:09+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| assets/vfx/parry_fx_el3.png | 84540 | 2026-05-23T00:30:09+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| assets/vfx/parry_fx_el4.png | 81928 | 2026-05-23T00:30:09+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| assets/vfx/parry_fx_el5.png | 86769 | 2026-05-23T00:30:09+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| assets/vfx/parry_fx_rainbow.png | 107605 | 2026-05-23T00:30:09+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| assets/vfx/parry_fx_red.png | 19930 | 2026-05-23T00:30:09+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| assets/vfx/parry_impact_el1.png | 75290 | 2026-05-23T01:30:06+09:00 | 정적 1 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 6개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/parry_impact_el2.png | 56630 | 2026-05-23T01:30:06+09:00 | 정적 1 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 6개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/parry_impact_el3.png | 84540 | 2026-05-23T01:30:06+09:00 | 정적 1 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 6개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/parry_impact_el4.png | 81928 | 2026-05-23T01:30:06+09:00 | 정적 1 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 6개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/parry_impact_el5.png | 86769 | 2026-05-23T01:30:06+09:00 | 정적 1 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 6개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/parry_impact_rainbow.png | 107605 | 2026-05-23T01:30:06+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 제작/검수 도구 등 추가 참조 6개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/parry_impact_red.png | 19930 | 2026-05-23T01:30:06+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 제작/검수 도구 등 추가 참조 6개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/parry_impact_sheet.png | 53859 | 2026-05-23T01:30:06+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 21개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/parry_new_el0.png | 22783 | 2026-05-23T00:30:09+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| assets/vfx/parry_new_el1.png | 58648 | 2026-05-23T00:30:09+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| assets/vfx/parry_new_el2.png | 42105 | 2026-05-23T00:30:09+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| assets/vfx/parry_new_el3.png | 77335 | 2026-05-23T00:30:09+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| assets/vfx/parry_new_el4.png | 64186 | 2026-05-23T00:30:09+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| assets/vfx/parry_new_el5.png | 68513 | 2026-05-23T00:30:09+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| assets/vfx/parry_new_elrainbow.png | 18825 | 2026-05-23T00:30:09+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| assets/vfx/parry_new_elred.png | 16662 | 2026-05-23T00:30:09+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| assets/vfx/scarecrow_boom.png | 28584 | 2026-05-02T15:30:06+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 8개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/sl_a.webp | 38918 | 2026-03-20T23:30:05+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| assets/vfx/slash_impact_sheet.png | 184891 | 2026-03-27T18:30:06+09:00 | 정적 3 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 3개 소스; 제작/검수 도구 등 추가 참조 29개 / engine/fdg/catalog.js, game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/teleport_burst.png | 31488 | 2026-05-02T15:30:06+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 8개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/vfx_earthquake.png | 786652 | 2026-03-27T13:30:06+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 21개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/vfx_ice_orb.png | 2449331 | 2026-03-18T15:44:54+09:00 | 정적 2 / 동적 0 / Unity 1 | 유지 | 정적 이름 참조 2개 소스; Unity Resources 동일 Git blob; 제작/검수 도구 등 추가 참조 49개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/vfx_landing_fire.png | 37963 | 2026-03-27T18:30:06+09:00 | 정적 3 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 3개 소스; 제작/검수 도구 등 추가 참조 29개 / engine/fdg/catalog.js, game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/vfx_magic_burst.png | 78433 | 2026-03-27T19:30:06+09:00 | 정적 3 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 3개 소스; 제작/검수 도구 등 추가 참조 29개 / engine/fdg/catalog.js, game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/vfx_magic_orb.png | 697204 | 2026-05-22T18:30:06+09:00 | 정적 2 / 동적 0 / Unity 1 | 유지 | 정적 이름 참조 2개 소스; Unity Resources 동일 Git blob; 제작/검수 도구 등 추가 참조 21개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/vfx_peace_shield.png | 1666218 | 2026-03-27T20:30:06+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 21개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/vfx_shield_aura.png | 1993250 | 2026-05-30T08:30:06+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 21개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| assets/vfx/water_blue_projectile_sheet.png | 501466 | 2026-09-08T14:25:46+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 제작/검수 도구 등 추가 참조 1개 / game.html / game-easy-test.html |
| assets/vfx/water_ice_barrage_sheet.png | 1420968 | 2026-09-04T23:11:02+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| assets/vfx/water_ice_impact_sheet.png | 1828990 | 2026-09-08T14:25:46+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| assets/vfx/whirl_blade_1.webp | 26658 | 2026-09-03T22:40:51+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 20개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| img/balls/arrow.png | 1521 | 2026-06-30T17:44:07+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 55개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| img/balls/proj_blackbean.png | 1558 | 2026-04-10T03:00:02+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 49개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| img/balls/proj_bluebean.png | 1813 | 2026-04-10T03:00:02+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 49개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| img/balls/proj_bolt_comet.png | 325439 | 2026-08-23T23:52:11+09:00 | 정적 1 / 동적 0 / Unity 1 | 유지 | 정적 이름 참조 1개 소스; Unity Resources 동일 Git blob; 제작/검수 도구 등 추가 참조 1개 / game.html / game-easy-test.html |
| img/balls/proj_bolt_dark.png | 2772 | 2026-04-10T03:00:02+09:00 | 정적 2 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 49개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| img/balls/proj_bolt_fire.png | 2554 | 2026-04-10T03:00:02+09:00 | 정적 0 / 동적 1 / Unity 0 | 유지 | 동적 경로/등록 이름 전개 일치 |
| img/balls/proj_bolt_holy.png | 2542 | 2026-04-10T03:00:02+09:00 | 정적 0 / 동적 1 / Unity 0 | 유지 | 동적 경로/등록 이름 전개 일치 |
| img/balls/proj_bolt_ice.png | 2743 | 2026-04-10T03:00:02+09:00 | 정적 0 / 동적 1 / Unity 0 | 유지 | 동적 경로/등록 이름 전개 일치 |
| img/balls/proj_bolt_ltn.png | 2554 | 2026-04-10T03:00:02+09:00 | 정적 0 / 동적 1 / Unity 0 | 유지 | 동적 경로/등록 이름 전개 일치 |
| img/balls/proj_bolt_phys.png | 2590 | 2026-04-10T03:00:02+09:00 | 정적 2 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 49개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| img/balls/proj_kraken_shot_api_v1.png | 944919 | 2026-09-03T22:40:51+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 제작/검수 도구 등 추가 참조 1개 / game.html / game-easy-test.html |
| img/balls/proj_shard_dark.png | 2121 | 2026-04-10T03:00:02+09:00 | 정적 2 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 49개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| img/balls/proj_shard_fire.png | 1953 | 2026-04-10T03:00:02+09:00 | 정적 2 / 동적 1 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 동적 경로/등록 이름 전개 일치; 제작/검수 도구 등 추가 참조 49개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| img/balls/proj_shard_holy.png | 2014 | 2026-04-10T03:00:02+09:00 | 정적 0 / 동적 1 / Unity 0 | 유지 | 동적 경로/등록 이름 전개 일치 |
| img/vfx/chain_blade.webp | 5920 | 2026-03-27T13:30:06+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 21개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| img/vfx/chain_blade1.webp | 8872 | 2026-03-27T13:30:06+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| img/vfx/chain_blade2.webp | 5920 | 2026-03-27T13:30:06+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| img/vfx/chain_blade_cyclone_8f.png | 1683495 | 2026-09-17T09:38:01+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 제작/검수 도구 등 추가 참조 1개 / game.html / game-easy-test.html |
| img/vfx/chain_blade_silver.webp | 222974 | 2026-09-04T10:14:18+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| img/vfx/chain_blade_silver_realistic.png | 1589914 | 2026-09-04T15:58:40+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| img/vfx/chain_earth_cleave.png | 2643867 | 2026-09-29T06:46:47+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 제작/검수 도구 등 추가 참조 1개 / game.html / game-easy-test.html |
| img/vfx/chain_earth_rubble.png | 5290259 | 2026-09-29T09:02:01+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 제작/검수 도구 등 추가 참조 1개 / game.html / game-easy-test.html |
| img/vfx/kraken_tp.png | 1518472 | 2026-08-31T23:18:00+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 제작/검수 도구 등 추가 참조 1개 / game.html / game-easy-test.html |
| img/vfx/kraken_vanish.png | 2154353 | 2026-08-31T23:18:00+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 제작/검수 도구 등 추가 참조 1개 / game.html / game-easy-test.html |
| img/vfx/mine_trap_ward_sheet.png | 2478415 | 2026-09-23T22:29:11+09:00 | 정적 1 / 동적 0 / Unity 1 | 유지 | 정적 이름 참조 1개 소스; Unity Resources 동일 Git blob / game.html |
| img/vfx/sbash_blade.webp | 4932 | 2026-03-27T13:30:06+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 21개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| img/vfx/sbash_blade_black.webp | 3086 | 2026-03-27T23:30:06+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 21개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| img/vfx/sbash_white1.webp | 4932 | 2026-03-27T13:30:06+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| img/vfx/silvertail_charge_range_api_v1.png | 773733 | 2026-09-03T22:40:51+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 제작/검수 도구 등 추가 참조 1개 / game.html / game-easy-test.html |
| img/vfx/silvertail_ki_slash_realistic.png | 1623294 | 2026-09-04T15:58:40+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 제작/검수 도구 등 추가 참조 1개 / game.html / game-easy-test.html |
| img/vfx/silvertail_malice_orb_moonblade_v2.png | 1735102 | 2026-09-08T14:29:28+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| img/vfx/silvertail_malice_orb_realistic.png | 1845480 | 2026-09-04T15:58:40+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| img/vfx/silvertail_malice_orb_sheet_v3.png | 1846718 | 2026-09-08T15:02:00+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 제작/검수 도구 등 추가 참조 1개 / game.html / game-easy-test.html |
| img/vfx/silvertail_violet_arc_anim_api_v1.png | 473027 | 2026-08-10T18:58:44+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| img/vfx/silvertail_violet_arc_anim_api_v2.png | 598480 | 2026-08-10T18:58:44+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| img/vfx/silvertail_violet_arc_anim_api_v3.png | 587114 | 2026-08-10T18:58:44+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 제작/검수 도구 등 추가 참조 1개 / game.html / game-easy-test.html |
| img/vfx/sky_crusher_burning.png | 1317849 | 2026-09-04T13:33:34+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 제작/검수 도구 등 추가 참조 1개 / game.html / game-easy-test.html |
| img/vfx/sky_crusher_iron_wedge.png | 1166846 | 2026-09-04T13:33:34+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 제작/검수 도구 등 추가 참조 1개 / game.html / game-easy-test.html |
| img/vfx/teleport_in.png | 3362 | 2026-05-01T05:30:05+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 8개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| img/vfx/teleport_out.png | 4018 | 2026-05-01T05:30:05+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 8개 / game.html, gamedemo.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| output/ki_slash_radiant_20260915/all_frames.png | 515071 | 2026-09-15T15:23:48+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/ki_slash_radiant_20260915/before_after.png | 303715 | 2026-09-15T15:23:48+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/ki_slash_radiant_20260915/in_game.png | 2311656 | 2026-09-15T15:23:48+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/ki_slash_radiant_20260915/qa.json | 666 | 2026-09-15T15:23:48+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 53개 / engine/fdg/source-preview-height-ground.js, game.html / ch1-altar-moat.js, ch1-border-foreground.js, ch1-boundary-edge.js |
| output/kraken_water_20260913/qa.json | 757 | 2026-09-13T20:28:27+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 53개 / engine/fdg/source-preview-height-ground.js, game.html / ch1-altar-moat.js, ch1-border-foreground.js, ch1-boundary-edge.js |
| output/kraken_water_20260913/water_split_impact.png | 2005164 | 2026-09-13T20:28:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/before.png | 1492353 | 2026-09-10T23:34:27+09:00 | 정적 39 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 39개 소스; 제작/검수 도구 등 추가 참조 159개 / affix-mini-project/sandbox.css, affix-mini-project/styles.css, charselect-silver-hell.css / GLTFLoader.js, _compose.py, _dep_norm.html |
| output/vfx/level_up_gold_20260910/canvas_fallback.png | 73822 | 2026-09-10T21:22:49+09:00 | 정적 0 / 동적 0 / Unity 0 | 불확실 | 제작/검수 도구 등 추가 참조 1개 / tools/verify_level_up_vfx.py |
| output/vfx/level_up_gold_20260910/frame_0080.png | 1496009 | 2026-09-10T21:22:49+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frame_0200.png | 1493833 | 2026-09-10T21:22:49+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frame_0450.png | 1492912 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frame_0850.png | 1492157 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frame_1300.png | 1491899 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frame_1500.png | 1491896 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/000.png | 1491896 | 2026-09-10T23:34:27+09:00 | 정적 27 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 27개 소스; 제작/검수 도구 등 추가 참조 86개 / charselect-silver-hell.css, cin-enter-engraved.css, engine/fdg/legacy.js / _check.js, _dep_norm.html, _deployed_game.html |
| output/vfx/level_up_gold_20260910/frames/001.png | 1492419 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/002.png | 1493289 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/003.png | 1493676 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/004.png | 1493772 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/005.png | 1493702 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/006.png | 1493833 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/007.png | 1493863 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/008.png | 1493620 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/009.png | 1493619 | 2026-09-10T23:34:27+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스 / game.html |
| output/vfx/level_up_gold_20260910/frames/010.png | 1493342 | 2026-09-10T23:34:27+09:00 | 정적 5 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 5개 소스; 제작/검수 도구 등 추가 참조 6개 / data/vfx/boss_fire_impact24_20261010.json, data/vfx/boss_water_impact24_20261010.json, data/vfx/firedevil_orb24_20261010.json / tools/fdg-studio/fixtures/hell-aberrant-tail-idle.fdg.json, tools/fdg-studio/fixtures/hell-aberrant-tail-readability.fdg.json, tools/fdg-studio/fixtures/hell-aberrant-tail-sequence.fdg.json |
| output/vfx/level_up_gold_20260910/frames/011.png | 1493224 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/012.png | 1493231 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/013.png | 1493095 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/014.png | 1492941 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/015.png | 1492817 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/016.png | 1492647 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/017.png | 1492501 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/018.png | 1492507 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/019.png | 1492361 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/020.png | 1492384 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/021.png | 1492296 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/022.png | 1492229 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/023.png | 1492239 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/024.png | 1492131 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/025.png | 1492130 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/026.png | 1492131 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/027.png | 1492171 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/028.png | 1492148 | 2026-09-10T23:34:27+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 2개 / game.html, ui-refinement.css / tools/make_eye_crest.cjs, tools/make_mm_ring_frame.cjs |
| output/vfx/level_up_gold_20260910/frames/029.png | 1492031 | 2026-09-10T23:34:27+09:00 | 정적 6 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 6개 소스 / charselect-silver-hell.css, game.html, index.html |
| output/vfx/level_up_gold_20260910/frames/030.png | 1492058 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/031.png | 1492087 | 2026-09-10T23:34:27+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 제작/검수 도구 등 추가 참조 1개 / web-uiux.css / tools/check-stat-window.mjs |
| output/vfx/level_up_gold_20260910/frames/032.png | 1492003 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/033.png | 1491958 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/034.png | 1491942 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/035.png | 1491962 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/036.png | 1491897 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/037.png | 1491905 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/038.png | 1491885 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/039.png | 1491899 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/040.png | 1491897 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/041.png | 1491896 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/042.png | 1491896 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/043.png | 1491896 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/044.png | 1491896 | 2026-09-10T23:34:27+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스 / game.html, index.html |
| output/vfx/level_up_gold_20260910/frames/045.png | 1491896 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/046.png | 1491896 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/047.png | 1491896 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/048.png | 1491896 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/049.png | 1491896 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/050.png | 1491896 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/051.png | 1491896 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/052.png | 1491896 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/053.png | 1491896 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/054.png | 1491896 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/055.png | 1491896 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/056.png | 1491896 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/057.png | 1491896 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/058.png | 1491896 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/frames/059.png | 1491896 | 2026-09-10T23:34:27+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| output/vfx/level_up_gold_20260910/live_qa.json | 274 | 2026-09-10T21:22:49+09:00 | 정적 0 / 동적 0 / Unity 0 | 불확실 | 제작/검수 도구 등 추가 참조 1개 / tools/verify_level_up_live.py |
| output/vfx/level_up_gold_20260910/qa.json | 872 | 2026-09-10T21:22:49+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 53개 / engine/fdg/source-preview-height-ground.js, game.html / ch1-altar-moat.js, ch1-border-foreground.js, ch1-boundary-edge.js |
| output/vfx/level_up_identity_20260910/demon_violet.png | 1495132 | 2026-09-10T21:33:05+09:00 | 정적 0 / 동적 0 / Unity 0 | 불확실 | 제작/검수 도구 등 추가 참조 2개 / tools/verify_level_up_label.py, tools/verify_level_up_readability.py |
| output/vfx/level_up_identity_20260910/human_gold.png | 1497919 | 2026-09-10T21:33:05+09:00 | 정적 0 / 동적 0 / Unity 0 | 불확실 | 제작/검수 도구 등 추가 참조 2개 / tools/verify_level_up_label.py, tools/verify_level_up_readability.py |
| output/vfx/level_up_identity_20260910/qa.json | 2999 | 2026-09-10T21:33:05+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 53개 / engine/fdg/source-preview-height-ground.js, game.html / ch1-altar-moat.js, ch1-border-foreground.js, ch1-boundary-edge.js |
| output/vfx/level_up_readability_20260910/demon_violet.png | 1495986 | 2026-09-10T23:28:21+09:00 | 정적 0 / 동적 0 / Unity 0 | 불확실 | 제작/검수 도구 등 추가 참조 2개 / tools/verify_level_up_label.py, tools/verify_level_up_readability.py |
| output/vfx/level_up_readability_20260910/human_gold.png | 1496051 | 2026-09-10T23:28:21+09:00 | 정적 0 / 동적 0 / Unity 0 | 불확실 | 제작/검수 도구 등 추가 참조 2개 / tools/verify_level_up_label.py, tools/verify_level_up_readability.py |
| output/vfx/level_up_readability_20260910/qa.json | 4005 | 2026-09-10T23:28:21+09:00 | 정적 2 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 2개 소스; 제작/검수 도구 등 추가 참조 53개 / engine/fdg/source-preview-height-ground.js, game.html / ch1-altar-moat.js, ch1-border-foreground.js, ch1-boundary-edge.js |
| sprites/black_star.png | 551335 | 2026-05-23T17:30:05+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| sprites/bonfire_barrier.png | 2527752 | 2026-06-08T17:30:05+09:00 | 정적 1 / 동적 0 / Unity 1 | 유지 | 정적 이름 참조 1개 소스; Unity Resources 동일 Git blob; 제작/검수 도구 등 추가 참조 6개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| sprites/holy_cross.png | 681788 | 2026-05-23T17:30:05+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| sprites/holy_dome.png | 2651659 | 2026-05-24T18:30:06+09:00 | 정적 1 / 동적 0 / Unity 1 | 유지 | 정적 이름 참조 1개 소스; Unity Resources 동일 Git blob; 제작/검수 도구 등 추가 참조 6개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| sprites/holy_star.png | 573629 | 2026-05-23T17:30:05+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| sprites/ice_orb/frame_000.png | 267394 | 2026-03-18T15:44:54+09:00 | 정적 0 / 동적 0 / Unity 0 | 불확실 | 제작/검수 도구 등 추가 참조 1개 / tools/sync_silvertail_pixellab.mjs |
| sprites/ice_orb/frame_001.png | 327956 | 2026-03-18T15:44:54+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| sprites/ice_orb/frame_002.png | 366052 | 2026-03-18T15:44:54+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| sprites/ice_orb/frame_003.png | 392885 | 2026-03-18T15:44:54+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| sprites/ice_orb/frame_004.png | 358210 | 2026-03-18T15:44:54+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| sprites/ice_orb/frame_005.png | 321617 | 2026-03-18T15:44:54+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| sprites/ice_orb/frame_006.png | 312030 | 2026-03-18T15:44:54+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| sprites/ice_orb/frame_007.png | 293530 | 2026-03-18T15:44:54+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| sprites/ice_orb/frame_008.png | 263543 | 2026-03-18T15:44:54+09:00 | 정적 0 / 동적 0 / Unity 0 | 삭제 후보 | 정적/동적 참조 0; Unity 동일 blob 0; tracked |
| sprites/spike_trap/spike_thorn.png | 2461785 | 2026-06-03T14:30:06+09:00 | 정적 1 / 동적 0 / Unity 1 | 유지 | 정적 이름 참조 1개 소스; Unity Resources 동일 Git blob; 제작/검수 도구 등 추가 참조 6개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| sprites/spike_trap/vortex.png | 2607287 | 2026-05-24T17:30:06+09:00 | 정적 4 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 4개 소스; 제작/검수 도구 등 추가 참조 51개 / game.html, gamedemo.html, lang_fr.js / _dep_norm.html, _deployed_game.html, _disk_norm.html |
| sprites/zone_single.png | 660759 | 2026-05-24T19:30:05+09:00 | 정적 1 / 동적 0 / Unity 0 | 유지 | 정적 이름 참조 1개 소스; 제작/검수 도구 등 추가 참조 6개 / game.html / _dep_norm.html, _deployed_game.html, _disk_norm.html |

## 불확실하여 유지한 항목

- assets/vfx/boss/source/boss_cageTrap_source_20260903_193333.png: 제작/검수 도구 등 추가 참조 1개; 원본 경로: 보존
- assets/vfx/boss/ult_holy_c.png: 제작/검수 도구 등 추가 참조 1개
- assets/vfx/boss/ult_lava_c.png: 제작/검수 도구 등 추가 참조 1개
- output/vfx/level_up_gold_20260910/canvas_fallback.png: 제작/검수 도구 등 추가 참조 1개
- output/vfx/level_up_gold_20260910/live_qa.json: 제작/검수 도구 등 추가 참조 1개
- output/vfx/level_up_identity_20260910/demon_violet.png: 제작/검수 도구 등 추가 참조 2개
- output/vfx/level_up_identity_20260910/human_gold.png: 제작/검수 도구 등 추가 참조 2개
- output/vfx/level_up_readability_20260910/demon_violet.png: 제작/검수 도구 등 추가 참조 2개
- output/vfx/level_up_readability_20260910/human_gold.png: 제작/검수 도구 등 추가 참조 2개
- sprites/ice_orb/frame_000.png: 제작/검수 도구 등 추가 참조 1개

## 실행/재현

- 조사: C:\nvm4w\nodejs\node.exe tools/vfx-cleanup/audit.cjs --audit
- 삭제: C:\nvm4w\nodejs\node.exe tools/vfx-cleanup/audit.cjs --delete (후보/HEAD/INDEX/WORK 재대조, git rm만 사용)
- 삭제 후 검증: C:\nvm4w\nodejs\node.exe tools/vfx-cleanup/audit.cjs --verify
- 정상 인덱스 쓰기 권한이 있는 총괄 환경에서 검수 후 실행할 정확한 목록: [delete-paths.txt](../../tools/vfx-cleanup/delete-paths.txt). 명령: git rm --pathspec-from-file=tools/vfx-cleanup/delete-paths.txt (이 세션에서는 권한 거부 후 재시도하지 않음).
- 상세: [audit.json](../../tools/vfx-cleanup/audit.json) / result.md (과거 외부·검수 자료: `tools/vfx-cleanup/result.md` (저장소 파일 없음))
