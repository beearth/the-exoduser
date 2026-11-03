# P2-005B — 시작 스킬 발동 1차: 지옥강타 1(Space) (2026-10-20)

> 2026-10-21 DEMO11-16 현재 연결 갱신: 현재 giantSlam 비용은 50 고정이 아니라 원문 stCost의 레벨 .45·현재 passive/affix 할인·mst90% 캡이다. 쿨은 기존 max(60,1800−12(lv−1))에 현재 _cdRed를 적용한다. 비용은 State→ResourceAuthority의 단일 검증 후 commit이며 피해 본문과 hurtE 경로는 그대로다. 아래는 당시 인수 이력이다. [현재 계약](DEMO11_SKILL_DISPATCH_20261021.md).

착수 전 docs/2_1 스킬관리+합체시스템.md 숙지. 범위가 커 우선순위대로 **giantSlam(Space)
완전 이식**까지 — spikeTrap(1)·holyDome(F)·iceOrb(Ctrl)은 다음 차수(해당 키는 기존대로
무반응 유지). Q/E·2_3 규칙 미접촉, 레슨 파일 미접촉.

## 원본 추적 (전부 코드 일치 검증)
| 단계 | 원본 행 | 수치 |
|---|---|---|
| 입력 | Space → _dispatchSkillSlot(4) 13286, 공통 가드 12905~12917 | paused·dead·스킬 보유 |
| 게이트 | 13010 | ST≥stCost(50=_COST_BASE 31960×_dpsCostMul lv1 1×_stDisc 1)·악의≥_malCost(20)=10(28080 ×0.5 할인)·_gslCd≤0 |
| 비용 | 46454 useStPct(31991)·G.mats−=10 | ST50(authority 신규 commit)·악의오브10(state 신규 apply) |
| 쿨 | 46456 | ~~(max(60,1800−12(lv−1))×(1+_cdRed 0))=1800f — 소유=어댑터(원본 P._gslCd, 펫 선례 기록) |
| 피해 | 46464~46470·44509 | dmg=~~(meleeRef×statStr 1×(20+(lv−1)×19×.5)×rageMul 1) — rage 0(신규), rage>0 분기 미이식 기록 |
| 히트 | _gSlamHit 46527~46566 | ×pAtkMul(+_atkBon 0 기록) → r=500+15(lv−1) → elMul → **hurtE owner 경로** opts {kbMult:0, noPoise:true, noImpact:true}·atkEl=wp.el(0) → kb+8 → 일반몹 stunned=max(,60)(8668)·poise≤0 풀스턴 min(300,150+15(lv−1)) + '체간 붕괴!'/'미니스턴!' 텍스트 |
| VFX | 46492~46501·56802~56830 | _gSlamWave(60→R×2·45f)·giantSlam 영웅 시트=vfxKind 'inferno'(원본 46498 주석: 영웅 시트만 붉은 지옥진) → inferno_slam_impact_sheet.png 원본 복사(2×2 512·4프레임·grow .72+.28min(1,p3.5)·α(1−p)/.38·'screen'→가산 근사 기록)·중앙 플래시 |
| SFX | SFX.slam 12808 | heavy_hit.mp3 원본 복사(sfx/skillsound/slam/) — WebAudio 합성 3층(playSub/Dist/Noise)은 에셋 아님·미이식 기록 |
| HUD | _skCdSweep 44136 | conic rgba(0,0,0,.55)+중앙 노랑 초 텍스트 — hud.gd에 sweep 노드+공급자 바인딩(이제 쿨 소유자 존재) |
- enemy.gd에 "stunned" 필드 쓰기 추가(46556~46560 max 갱신) — 기존 _stun_ticks 소비 경로 재사용.
- 미구현 스킬(1/F/Ctrl) 무반응 유지 — 원본과 다른 동작 생성 없음.

## 문서 수치 대조 (CLAUDE.md 필수 — 정정 불필요 확인)
- 2_1 §421: 범위 500+(Lv−1)×15·쿨 30초(−12f/Lv)·ST=stCost+악의오브20·공식 — **코드와 일치**.
- 스킬별_DPS_자원소비표 §91·헤더 교정(2026-09-10): 동일 공식·쿨·비용 — **일치**. '악의오브20'은
  _malCost 인자 표기(실소비 10 = 전역 _MALICE_COST_MUL 0.5 — 28080). 정정 사항 없음.

## 검증 (원로그 G:\exoduser-wt\_out\p2-005b\logs\)
- test_p2005b_giant_slam **12/0 PASS**: ①ST 50·악의오브 10 소비·쿨 1800·hurtE 경유 히트·
  피해식 ~~(~~(meleeRef×20)×pAtkMul) 정수 일치·쉴드+HP 합산 일치(비크리)·미니스턴 60
  ②HUD sweep 공급(pct≈1·'N.Ns')·쿨 게이트 재시전 거부·슬롯 sweep 반영.
- **웹 실측 교차검증**(web_slam_shot.mjs): Space 시전 → ST 281.6→230.7(−50)·악의
  1000→990(−10)·cd 1707(1800−경과) — 포트와 동일.
- 회귀 17종 전부 기준선(p1002e/f/g·p2001a~e·p2002a/b·p2003a·p2004a·p2005a·contracts·
  초기화 117/2·시작 145/2·재생 88/0·레슨 30/0).
- 화면: cmp_slam_web_vs_godot.png(좌 웹·우 Godot — 인페르노 분출 시트·쉴드 피해 숫자·
  HECTOR 창 동형; 숫자 355 vs 280은 무기 롤 차), crop_godot_slam_1x.png,
  video_godot_slam_720p.mp4(3초·30fps).

## 남은 것
spikeTrap(1— hurtE 집행자 dot/shieldHit 확장 필요: 42121 revive 통과·42332 스턴/빙결 ×1.5
스킵·42345 쉴드 흡수 조건 (!dot‖shieldHit)·블루 텍스트 !dot·피크 펌프 _quiet2 스킵) /
holyDome(F — 존 리젠·쿨감 틱) / iceOrb(Ctrl — 무적 보주·파쇄 48발·냉저 디버프) /
rage>0 분기·보스 포이즈 경로·파편 파티클·showPH 공지·합체 분기들.
