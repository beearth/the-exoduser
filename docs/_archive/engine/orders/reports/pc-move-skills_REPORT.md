# PC-MOVE-SKILLS — Shift 사슬 이동(V-02)·방향+Space 전격이동(V-01) 이식 보고

2026-10-22 KST, PC Claude. 기준 INTEG-10 동결 `9133e2782`, 브랜치 `claude/pc-move-skills-v2-20261022`, worktree `G:\exoduser-wt\pc-move-skills-v2`.
계약: [PC_MOVE_SKILLS_CONTRACT_20261022.md](../../PC_MOVE_SKILLS_CONTRACT_20261022.md). 원본 = 고정 스냅샷 `godot/source_snapshot/game.html`(SHA256 `4d911cdd…`, main game.html과 sha256 동일 확인).
로그·캡처: `G:/exoduser-wt/_out/pc-move-skills-v2/`.

**판정: V-01·V-02 이동 동작은 웹과 같은 장면 나란히 캡처에서 프레임마다 같은 위치·무적·게이지로 움직인다(68프레임, 위치 차 <0.001px). 화면 연출(포즈·사슬·홀드 UI·게이지 숫자·착지 VFX·전기 구체·번개 기둥·폭풍 스프라이트)도 같은 모양·같은 층으로 옮겼다. main 미병합.** 남은 차이는 아래 "미이식"과 "다른 행 소관" 표.

## 1. 커밋

| SHA | 내용 |
|---|---|
| `f02ed5b0f` | owner·입력·프레임 훅·포즈·테스트·oracle·에셋 |
| `f7a97ad4a` | 렌더 정렬(웹 GPU 프록시 텍스트 규칙·층·전류장판 스프라이트·렌더 시계)·캡처 도구 |
| `a684e4434` | 미이식 분기 사전 거절(합체·thunderGhost)·게이지 칸 원본 공식·provider 사본 제거 |
| (이 문서 커밋) | 문서(계약·보고서·차이 목록·DEMO11 상태·CHANGELOG) |

## 2. 원본에서 확인한 사실 (지시서 수치 정정 포함)

- 차이 목록의 웹 실측 "Shift +34~37px"와 "A+Space −126~−130px"는 parity 하네스가 `_harpGauge=5`로 둔 결과였다. 사슬은 게이지 비례 거리(700×7.25/150=33.8px), 전격이동은 게이지 31.5 미만이라 발동하지 않고 A 보행만 잰 값이었다. 정상 게이지(225)에서 웹 실측: **1단 300px, 2단 500px, 전격이동 250px**.
- 지시서 행 번호 중 keyup 끝(13366), 포커스 해제 함수(13371–13380), `_dashIframe`(32582), 게이지 최대치(32779–32786), activateBladeDash 끝(45463)은 실제 행으로 고쳐 썼다(계약 §2).
- 웹 텍스트는 GPU 프록시 `fillText`(G6104–6111)로 그려져 Canvas2D의 textBaseline 의미와 다르다(셀 높이 ceil(px×1.6)+8 기준 배치). 머리 위 게이지 숫자·단계 문자 위치를 이 규칙으로 맞췄다.
- 웹 VFX 시트(land_fire)는 GL 인스턴싱으로 플레이어 위에 합성된다(코드 순서상 앞이어도 화면에서는 위).

## 3. 나란히 비교 (완료 판정)

웹: main `G:/exoduser`를 `PORT=3399`(격리 save dir)로 띄우고 Playwright 헤드리스·음소거 1920×1080. 원본 테스트베드 프레임 정지(`_btFramePause/_btFrameStep`) + 수동 rAF로 **틱당 update 1회·draw 1회**.
Godot: 창 모드 1개 `--audio-driver Dummy --resolution 1920x1080`, SceneTree를 world 원본 시계 1틱만 풀고 정지, 렌더 1회.
시작 위치: 양쪽 모두 열린 바닥(웹 스폰+(0,−800)=(4020,6620), Godot 스폰+(0,−800)이 막혀 가장 가까운 열린 지점 (−800,2314)). 맵 자체가 다른 것은 M-01~M-07 행 소관.

| 격자 | 장면 | 판정 |
|---|---|---|
| `compare_A00_before.png` | 입력 전 | 같음(맵·조명·HUD·줌 차이는 다른 행) |
| `compare_A01_hold_tier1.png` | 홀드 1틱: 링·점선 예측선·'1단'·'225/225' | 같음(문자 위치·겹침 순서·색 일치) |
| `compare_A02_flight.png` | 비행 2틱: dash_start 포즈·사슬·게이지 '180/225'·미니바 | 같음 |
| `compare_A03_stick_pull_start.png` | 꽂힘·끌림 시작 | 같음 |
| `compare_A04_pull_mid.png` | 끌림 4틱 dash_fly | 같음 |
| `compare_A05_landing.png` | 착지 틱 dash_land + land_fire(위) | 같음. 웹은 정지 스텝에서 보간 alpha=0이라 본체가 한 틱 뒤 위치에 그려져 VFX가 옆으로 보임(캡처 방식 차이) |
| `compare_A06_after_landing.png` | 착지 후 3틱 | 같음 |
| `compare_B01_hold_tier2_ui.png` | 2단 홀드 UI(초록) | 같음 |
| `compare_B02_tier2_flight.png` | 2단 비행 | 같음 |
| `compare_C00_before.png` ~ `compare_C04_after.png` | 전격이동 발동·중간·착지·후 | 같음(전기 구체·squash·번개 기둥·분기·폭풍 스프라이트·파티클). 번개 무작위 모양·폭풍 프레임은 원본도 매번 다름 |

1x 확대 비교: `zoom_v9_text.png`(홀드·게이지 문자), `zoom_v6_A.png`·`zoom_v6_C.png`, `zoom_v7.png`, `pillar_cmp.png`.

## 4. 이동 거리·프레임 비교 (웹 1틱 스텝 = Godot 1틱 스텝, 시작점 기준)

| 장면 | 프레임 | 웹 x | Godot x | 무적(웹/Godot) | 게이지(웹/Godot) |
|---|---|---:|---:|---|---|
| Shift 1단 | 릴리즈 직후 | 0 | 0 | 0/0 | 180/180 |
| | 비행 1~4틱 | 0 | 0 | 0/0 | 180/180 |
| | 꽂힘·끌림 1틱 | 42.86 | 42.86 | 1/1 | 180/180 |
| | 끌림 4틱 | 171.43 | 171.43 | 1/1 | 180/180 |
| | 착지(끌림 7틱) | **300.00** | **300.00** | 47/47 | 180/180 |
| | 착지+5틱 | 300.00 | 300.00 | 42/42 | 180.469/180.469 |
| Shift 2단(홀드 8틱) | 비행 7틱 후 끌림 1틱 | 45.45 | 45.45 | 1/1 | 127/127 |
| | 착지(끌림 11틱) | **500.00** | **500.00** | 47/47 | 127/127 |
| 방향(A)+Space | 발동 틱 | −41.67 | −41.67 | 14/14 | 193.594/193.594 |
| | 3틱 | −125.00 | −125.00 | 12/12 | 193.781/193.781 |
| | 착지(6틱) | **−250.00** | **−250.00** | 15/15 | 194.063/194.063 |

전체 표(68행, 위치 차 최대 <0.001px, 무적·게이지 완전 일치): `G:/exoduser-wt/_out/pc-move-skills-v2/move_table.txt`.

## 5. 원본 VM oracle 대조 (bc09 방식)

`pc_move_skills_source_oracle.cjs`가 스냅샷의 keydown/keyup/S16b/switch/전격 함수 원문을 한 VM 프로그램으로 실행한다. 벽·조준·shQuery는 Godot이 실제로 질의한 결과를 같은 순서로 공급하고, 원본의 질의 좌표·종류를 Godot 질의와 대조했다.

| 대조 | 결과 |
|---|---|
| 시나리오 | 16개(1·2단, 3단 자동+재발사, 벽 자동 발사, 캔슬, 경로 타격, 게이지 0, 방향→Space, Space→방향, 더블탭, 대각, 벽 정지, 게이지 부족, 경직 Shift 탈출, 기절 전격 탈출, 포커스 상실) |
| 프레임 상태 | 259프레임 위치·무적·게이지·최대치·플래그·비행거리·끌림 잔여·단계·전격 잔여·트리거·상태·poise 전부 일치 |
| 벽 질의 | 798건 좌표(±0.002)·반경·blink/mv 종류·순서 일치, 공급 잔량 0 |
| 적 타격 | hurtE 1건 인자(적 id, dmg 22, 각도, noSound false, opts `{kbMult:2,poiseHit:true,poiseMult:2}`, el 0)·순서 일치 |
| 텍스트·사운드 | '⛓️ 사슬!'·'💥 착지!'·'캔슬'·'⚡ 6/7'·'⚡10% 방어↓'·'🔱 관통!' 순서 일치. 고정 사운드 키(chain_throw/fly/stick/land/land2, ui_cancel) 순서 일치 |
| RNG 행 | 원본 Math.random 호출 행 12463·13361·32193·32225·32295·32546·45354–45356·45371–45377·45459 모두 표현(사운드 선택·피치·파티클·번개 좌표). 게임플레이 RNG 0 |

## 6. 미이식 (NOT_READY, 원본 분기 활성 시 첫 쓰기 전 거절)

| 항목 | 원본 | 사유 |
|---|---|---|
| 전류장판 피해 틱·_shockDR 방어감소 | G37413·37460–37465 | 기존 hurtE 실행자가 `_shockDR` 분기(G42290)에서 정지 → 디버프를 쓰면 이후 타격 전부 정지. 장판 수명·렌더만 |
| 사슬 합체·파생(chainSlash·magicBlink/dimBreach·dimBlast·기동파괴/불꽃/전폭), thunderGhost, kiGather 사슬 변형 | G32250–32575, G45395–45407, G33688–33699 | 1-1 신규 런 미보유 |
| 유니크 u_d06/u_d07/u_n02/u_d09, 전설 _lBootsEvade/_lSpearStack | G16526, G32366–32373, G45383, G45426 | 값>0이면 거절(데모 0) |
| showPH 토스트 | G13229·G33036·G45449 | PARITY-HUD-02 공용 소비자 연결. 02b: owner 로그 `toast_unported` 3줄 원문 복구 후 emit 유지(충전 중... 2곳·MP 부족! 1곳) |
| 레슨 step 4/5 연습 본문 | parry-lesson.js 326–383 | step 0~3(패링 투사체) 정지로 도달 불가. 기존 정지 사유 유지 |
| SFX.slash/charge/magic 합성음, 진동, 통계·프로파일, 게임패드 | — | 샘플/소비자 아님 |
| 잔상 밝은 아틀라스, 번개 lineCap round | G58654, G55990 | 경미(같은 프레임·각진 끝) |

## 7. 다른 행 소관(이번 범위 밖, 비교 격자에서 보이는 차이)

| 행 | 차이 |
|---|---|
| M-03/M-04 | Godot 카메라 zoom 0.7(웹 1.0) → 같은 이동이 화면에서 0.7배로 보인다(격자 아랫줄은 월드 영역을 맞춘 크롭) |
| M-01/M-05/M-06 | 맵 바닥·조명·시작 지점 구성이 다르다 |
| H-02 | MP 구슬 기동 게이지 링 없음 → Mac 요청 PMS-M1(API 제공) |
| (신규 관찰) | 웹 플레이어 스프라이트 외곽선(OPT.outline)·발밑 그림자가 Godot에 없다(이동 스킬 아님, 플레이어 렌더 공통) |
| (신규 관찰) | 웹 카메라는 lerp 추종(정지 스텝에서 플레이어가 화면 중심에서 벗어남), Godot은 즉시 추종 |
| H-03 | 전류장판 dmg가 웹 94 / Godot 173(magicRef 등 스탯 차이) |

## 8. 테스트·회귀

최종 코드(a684e4434) 기준 회귀 묶음 1회(`_out/pc-move-skills-v2/regress.sh` → `logs/regress_summary.txt`). 각 실행 전 override.cfg로 해당 테스트의 격리 userdir, 실행 후 이동.

| 테스트 | 결과 | exit | ERROR |
|---|---|---:|---:|
| test_pc_move_skills (신규) | 256/0 | 0 | 0 |
| test_pc_combat_pack_b | 378/0 | 0 | 0 |
| test_pc_combat_pack_b_mac | 396/0 | 0 | 0 |
| test_pc_m29_parry | 101/0 | 0 | 0 |
| test_pc_final_death | 61/0 | 0 | 0 |
| test_pc_enemy_revive | 51/0 | 0 | 0 |
| test_pc_player_life | 101/0 | 0 | 0 |
| test_pc_recalc_st | 49/0 | 0 | 0 |
| test_pc_runtime_stat_refresh | 286/0 | 0 | 0 |
| test_native_qe_binding | 155/0 | 0 | 0 |
| test_p1002e_melee_hurte | 94/0 | 0 | 0 |
| test_p1002f_dedicated_hurte | 358/0 | 0 | 0 |
| test_p1002g_kislash_hurte | 221/0 | 0 | 1차 2 → 재실행 0 (아래) |
| test_pc_followups_fieldboss | 167/0 | 0 | 0 |
| test_pcib_mac_calls | 31/0 | 0 | 0 |
| test_qa004_lesson_teardown (패링 레슨 Mac) | 98/0 | 0 | 0 |
| test_p2001k_lesson_practice (패링 레슨 Mac) | 32/0 | 0 | 0 |
| test_p2001l_lesson_steps (패링 레슨 Mac) | 66/0 | 0 | 0 |
| test_demo11_47h_e2e `--demo11-storage=on` | PASS 13 / NOT_READY 5 / FAIL 0 (기준선 PASS13/NR5 그대로) | 0 | 0 |

p1002g 1차의 ERROR 2는 `Parameter "t" is null (texture_2d_initialize, dummy renderer)` 1건과 그 결과인 종료 시 DummyTexture RID 누수 1건이다. 같은 ERROR가 이 브랜치 이전 base 실행에서도 간헐로 나왔다(`_out/pc-combat-b2/base-test_p1002g_kislash_hurte.stderr.txt`, `r1-…`: 4회 중 2회, 그쪽 backtrace는 crescent.gd `_play_hit`). 이동 스킬 코드가 만드는 텍스처가 아니다(owner 텍스처는 load/파일 bytes, null 생성 경로 없음). 같은 코드로 1회 재실행 → 221/0, ERROR 0(`logs/r-p1002g-2.*`). 간헐 원인 자체는 미조사(이번 범위 밖).

비교 캡처(godot_cap9)는 f7a97ad4a 코드로 찍었다. a684e4434의 변경(합체·유니크 분기 사전 거절, 게이지 칸 공식 dimRush/dimThunder/dimBreach/chargeSk 분기, provider 복사 제거)은 데모 기본 캐릭터(칸 5, 분기 없음)의 위치·연출에 영향이 없어 재촬영하지 않았다 — 최종 tip으로의 재촬영은 미실행.

## 9. 성능

필드 600틱 벤치(`bench_pc_followups_field600.gd`, 헤드리스 120Hz, 같은 PC에서 head·base 교차 2회, base = 9133e2782 임시 worktree — 측정 후 제거):

| 회차 | mean ms | p95 ms | max ms |
|---|---:|---:|---:|
| head 1 / base 1 | 8.671 / 9.477 | 12.625 / 13.445 | 15.29 / 18.919 |
| head 2 / base 2 | 8.716 / 8.738 | 12.574 / 12.960 | 16.216 / 15.401 |

head가 base보다 느려지지 않았다(차이는 회차 간 노이즈 안). base 2회의 ERROR 2는 base 트리의 기존 SVG 로더 ERROR(U-05, import 차이)다.
owner 단독 마이크로 측정(같은 Main, 300회 평균): 게이지 가득 대기 약 183~196µs/틱, 회복 중 약 240~283µs/틱. 주 비용은 원본 G32785 매 틱 `_eqAffix('extraST')`(provider 검증 약 44~57µs)와 회복 경로의 `read_current_p`(약 39~43µs). 원본처럼 매 틱 읽어 의미를 지켰고, 이 비용은 벤치 노이즈보다 작다. 캐시는 넣지 않았다(장비 변경 즉시 반영 유지).

## 10. Mac 요청

계약 §8: PMS-M1 MP 구슬 기동 게이지 링(`read_native_move_gauge()`), PMS-M2 skSlot0 게이지 바, PMS-M3 showPH 토스트 소비자, PMS-M4 카메라 zoom·맵 조명(기존 M-03/M-01 행).

## 11. 규칙 준수

- 원본에 없는 동작·연출 추가 0(모든 문자·색·수치는 원본 행 근거). docs/2_3 수정 0(읽기만). 기존 테스트 약화·삭제 0.
- Mac 소유 파일(hud.gd, native_skill_slots.gd, native_parry_lesson_flow.gd 등) 수정 0. 보스 파일 수정 0.
- 경로 지정 스테이징만, 테스트는 `git add -f --`. guard.baseline.json·override.cfg·import 산출물(타 자산 .import/.uid) 커밋 0. 커밋한 .import는 새로 복사한 원본 텍스처 4개 것만.
- import 1회(`APPDATA=G:/exoduser-wt/_out/pc-move-skills-v2/appdata`). 모든 Godot 실행 전 override.cfg로 격리 userdir, 실행 후 `_out/.../cfg/`로 이동. 실사용 `EXODUSER-Godot-Native-First` 사용 0.
- 종료한 Godot은 명령줄에 이 worktree 경로가 있는 것만(스모크 1회 정지 시). integ10-play 창·다른 담당 프로세스 미접촉. node_modules junction 생성 0(NODE_PATH 사용).
- force push·rebase·reset·main push 0. 자기 브랜치만 push.
