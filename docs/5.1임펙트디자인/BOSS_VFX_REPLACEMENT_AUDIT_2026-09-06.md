> 2026-10-16 통합 범위: 웹 본편 수치·현행은 최신 main 기준, 별도 Native/FDG 항목은 source pin9a4534b4의 부분 이식·명시 opt-in 계약이다. 전체 최신 본편 이식 완료가 아니다. 상세: docs/engine/FDG_PC_MAC_GIT_SYNC_20261016.md.

# 보스 임팩트 교체 목록 — 2026-09-06

> **2026-09-27 후속:** 이 문서는 9월 6일 당시의 후보·완료 상태 이력이다. 일반 1-1 다크드루이드의 `groundFissure`, `tideWave`, `chaseAoe`와 순간이동 `emerge` 로더는 이후 [1-1 임팩트 23종 조사](CH1_1_BOSS_IMPACT_AUDIT_20260927.md)대로 개선되었다. 아래 `구현 완료 0개`는 작성 당시 수치다.

<!-- DARK_DRUID_THORN_FIRST_EXCEPTION_BEGIN -->
### 2026-10-11 · 자기 QA first 가시 fan 예외

아래 first opt-in만 별도 적용한다. 이 문서의 기존 녹색 orb/r4 수치·기본 본편·피날레·phase2+ 계약과 과거 결과는 원문 그대로 보존한다. 새 부분 성공을 이전 단위의 전체 완료로 합산하지 않는다.

| 항목 | first 예외 / 최종 한정 관측 |
|---|---|
| gate / native 생성 | own QA storage.active+fdgDruidThorn=first, ib·si0/3·!finale·phase0/1만. 기존 bossFanWind st2<=0 한 tick에12발 physical8(i%3!==2)/magic4(lanes2/5/8/11), phase0/1 black0. _druidThornVolley만 modulo3 drop/initial decoy aim 제외, pooled false/lane−1 reset·기존 후처리 적용 |
| 수치 / 원 권위 | 입력속도4.4·최종physical5/magic500/60..600/60px/native f. n=floor(atk×1.3), physical=floor(floor(2n)×.5)/magic=floor(2n). life/ml400 nominal·life−=sp*.667·기존거리내magic life1연장, 후처리 sz2.4·pool.r5.2; 일반탄 player collision base=P.r+7.2/기본 gate=P.r+11.2(base+4), 기존 Q/E 확장·현재/이전 P/shot 선분 sweep 유지, 저작 silhouette로 판정변경0. wind=floor(25×teleM)+extraDelay(phase0/1base18/16), recover45→20clamp/cd100. native Q/E·black Q-only·poison+3·AI/시간/피해/poise/맵/사용자 save 기본값 유지 |
| 조준 / 폭 | first start와 준비 wind의 e.facing=atan2(P.y−e.y,P.x−e.x)로 현재 Player 추적, 발사 tick에서 aim을 확정한다. fanW=π×(.7+.06×phase)rad, a=aim−fanW/2+fanW×i/11. 발사 이후 hostile _druidStraight로 forced homing/steer 제외·고정 방향 유지 |
| 아트 / pose 예외 | 해당 hostile flag탄만 ENGINE_AUTHORING 목질가시 quad/tri barbs localX[−27,32] 길이59/폭20, magic diamond X[−15,18]/Y±12·trailX−30. 기존 X WebGPU face<=4, bitmap/new backend0. fan pose dark-druid-native-thorn-fan-first 12tracks×6keys/1.6s/24FPS, native timer read-only·기존19본/UV/mesh/texture 유지 |
| tell / 실제 wind | first start에서 _druidFanWindMax=e.st2·e.facing=atan2Player, bossFanWind에서도 e.facing=atan2Player로 준비 중 추적. tell progress=clamp(1−st2/실제 _druidFanWindMax), 폭π×(.7+.06×phase)와 같은 atan2Player 소비. 기존 default p/facing 원값 유지 |
| loader / 공개 QA | native bridge query thorn-volley-first, QA query thorn-volley-first2 / 옵션 thornVolley:true. aria 드루이드 나무가시 공격 QA, leaf title DARK DRUID · 나무가시. 기본 main/old revision 분기를 새기본으로 전환하지 않는다 |
| camera bounds / player 접촉 | 적대 thorn camera envelope radius physical33/magic31worldpx. pool.r5.2와 player 접촉 base=P.r+7.2·기본 gate=P.r+11.2는 별도 값이다. 기존 Q/E 확장·현재/이전 P/shot 선분 sweep·actor/projectile 좌표 유지, camera 여백으로 collision 확대0 |
| 새 기술 검사 | pose 신규3/3 최초 PASS. ROOT7고유그룹 최종 PASS: 최초5/6에서 scope harness1실패 수리, GPU face 관련2그룹 재확인, 신규 wind-aim1 추가. 전체7/7 최초 PASS라고 기록하지 않는다. old suite 재실행0 |
| 실제 단계 관측 | final-poses step8/17/18/26/38에서 각각 wind10/wind1/recover45/recover13/recover1. step18에서12발 physical8/magic4, 실제 atk46→physical59/magic118. 선행 본체 native fade는8step 뒤 visible. source key/FPS와 native step 관측을 구분한다 |
| 공개 E / Q 범위 | E physicalProjectile/druidStraight native-parry1과 friendly guided blue를 실제 확인. 다른 E magic callback은 기존 조건부 소비이며 Q 성공으로 세지 않는다. Q pressKey 약1ms tap 성공0; hold는 지원 CDP Input 불가로 미시험, actor/input 상태주입0 |
| 정상속도·강제 fan | normal-speed-forced:114 fullframes/record5095ms, 공개 force pattern. playerHP521→125.59375/pStun, bossHP21017 alive/shield17744, E/Q 성공0. 정상속도여도 강제 pattern을 자연 AI fan 성공으로 확대하지 않는다 |
| 자연 native AI | native-ai:172 fullframes/record7037ms, AI 시작/강제 pattern0. HP595→0/fallen, bossHP21017 alive/shield18881. 자연 beanStorm/groundFissure/charge/slam/slashCombo 관측, fan0/new thorn0/EQ0. 이 run의 무관측이며 전체 AI의 fan 미지원으로 확대0 |
| 실제 저장 / 오류 | 두 run runtimeexception0. 공개 자기 설정 save write1, reopen own read1/write0·config {distance340,pattern:fan,phase0,scale:.5} 복원. 전투 actor snapshot 저장0·HP3000 fixture0·actor console writes0. 전체 network/404 무오류 주장0 |
| 최종 관측 / 정본 | VISUAL RETOUCH / 정확 잔여1 THORN_VOLLEY_COMBAT_ACCEPTANCE: 실전 가독성·Q hold 성공·자연 AI fan 관측 미인수. 실제 E 부분 성공/신규 기술 PASS를 전체 전투·엔진 완료 PASS로 확대0. 정확 GIF 파생 duration/경로·전체 실제 verdict/§23는 새 정본 참조 |

정본: [다크드루이드 가시 일제발사 first](../engine/FDG_DARK_DRUID_THORN_VOLLEY_FIRST.md). 정확 새 파생 자료·시간과 §23는 이 새 정본의 최종 기록을 따른다.
<!-- DARK_DRUID_THORN_FIRST_EXCEPTION_END -->

> **2026-09-06 드루이드 독탄 최신 계약:** si0/si3 보스 소유 탄은 녹색 독탄으로 통일한다. 기존 화염 혜성 외형 설명보다 `docs/5.1임펙트디자인/DRUID_POISON_PROJECTILES.md`가 우선한다. 화마귀16f 구체의 녹색 질감 버전을 사용하고 피해 EL.P 및 실제 HP 피해시 중독+3을 적용한다. 기존 Q/E 분류는 보존한다. 추적지뢰도 드루이드만 녹색 구체240px로 교체; 다른 보스/소환 잡몹은 제외. 독립 녹색 ORB는 유지. 교체목록 전체 완료는 아님.

상태: 코드 기반 1차 전수 후보 조사. 실제 모든 보스/모든 페이즈의 영상 검수 완료를 의미하지 않는다. 사용자 최신 요청에 따라 목록만 작성했으며 이번 조사에서 게임 코드·에셋 교체는 하지 않았다.

## 판정 기준

- 단색 원·반투명 원·직선·사각형이 효과 본체인 표현: 절차식 도형 VFX. 현재 사례는 프로토타입 수준으로 판정한다. 절차식이라는 제작 방식 자체가 저품질이라는 의미는 아니다.
- 경고 범위/안전지대 경계는 게임 정보이므로 무조건 제거하지 않는다. 실제 발동 본체와 폭발을 먼저 교체한다.
- 등록된 시트와 실제 draw 경로를 구분한다. drawImage도 그라데이션을 캐시한 이미지면 제작 텍스처가 아니다.
- 기존 스프라이트가 정상 렌더되는 경우와 로딩 실패용 폴백은 별도 분류한다.
- 아래 위치는 조사 시점 game.html 행 번호이며 변경 후 이동 가능하다. ID와 배열명이 검색 기준이다.

## 신고 이미지

`C:/Users/심도진/Pictures/Screenshots/스크린샷 2026-09-06 233852.png`

가장 유력한 대상은 `seekerMines` / `G._seekerMines`, 렌더 약 52780행이다. 주황 외곽 원, 주황 본체, 살색 원형 코어의 색·구성이 스크린샷과 일치한다. 코드의 코어 반경은 r×0.45, 생성 r=60으로 코어 반경27px이다. 런타임 엔티티를 캡처한 확정 식별은 아직 하지 않았다. `_druidOrbs`는 별도의 8프레임 스프라이트 경로이므로 같은 것으로 단정하지 않는다.

| 우선순위 | ID / 위치 | 실제 표현과 문제 | 교체 방향 | 상태 |
|---|---|---|---|---|
| P0 | seekerMines / 52780 | 주황 원 3겹+살색 코어+경고 링. 신고 화면과 일치 | 사용자 지정 화마귀 대형탄 `img/proj_firedevil_orb.png` 4×4/16f 사용. 준비/추적/폭발 구분 | 실제 본체 도형 |
| P0 | mirrorClone / 52737 | 분신을 색 원+흰 점으로 표시 | 원본 보스 시트의 반투명 분신, 출현/소멸 텍스처 | 실제 본체 도형 |
| P0 | doppelganger / 52943 | 회색 원에 빨간 눈 2점 | 보스 또는 해당 분신 전용 실루엣 시트 | 실제 본체 도형 |
| P0 | pillars / 52665 | 반투명 사각형 기둥+상단 흰 원 | 입체 기둥 출현/균열/붕괴 시트. 플레이어와 공유하는 G._pillars 분리 필요 | 공유 렌더 주의 |
| P1 | orbWeave / 52915 | 그라데이션 원 스탬프+둥근 잔상 | 질감 있는 회전 구체/궤도 잔상. 화염 계열만 화마귀 후보 | 실제 본체 절차식 스탬프 |
| P1 | chaseAoe / 52426 | 발동도 빨간 원 확대+링 | 지면 파열/착탄 폭발 시트. 추적 전조는 별도 유지 | 실제 발동 도형 |
| P1 | fireRain / 52495 | 낙하지점 경고 뒤 원형 플래시/링 | 낙하 화염체와 착탄 화염·잔해 | 실제 발동 도형 |
| P1 | lavaPools / 52463 | 드루이드 외에는 빨강/주황 동심원 | 움직이는 용암 표면+불꽃 가장자리 | 일반 경로 도형, 드루이드는 시트 |
| P1 | poisonTrail / G._poisonPools / 52852 | 그라데이션 얼룩+동그란 거품 | 독성 지면 텍스처/증기/파열 | 일반 경로 절차식, 드루이드는 시트 |
| P1 | shockGrid / 52518 | 활성 전격도 굵기 다른 직선 3겹 | 분기하는 전류·지면 방전, 선형 판정 보존 | 실제 발동 도형 |
| P1 | groundFissure / G._fissures / 52749 | 선형 균열+끝 원형 폭발 | 땅 갈라짐과 방향성 분출/파편 | 실제 발동 도형 |
| P1 | tideWave / 52766 | 굵은 원호 두 겹 | 방향성 파도/충격파 텍스처. 통과 틈 보존 | 실제 발동 도형 |
| P1 | judgeCut / 52631 | 방사형 가는 선+보라 링+원형 플래시 | 날 있는 참격 시트와 지면 절단 흔적 | 실제 발동 도형 |
| P1 | rewindStrike / 52798 | 되감기 후 시안 원형 확장 | 잔상 회수→출현→베기/충격 텍스처 | 실제 발동 도형 |
| P1 | phantomSwords / 52689 | 검 대신 작은 선분/점 | 칼날·손잡이가 읽히는 검 시트와 발사 잔상 | 실제 대기 본체 도형 |
| 반영 | swordWave / 공용 투사체 경로 | 물리 검기파의 작은 원 제거(2026-09-14) | 물리/E 분류는 공통 원본 적갈색 이빨입, 로딩 실패도 불투명 방향성 입. 비물리 검기파 기존 표시 유지 | [가시성 계약](../8.0몬스터디자인/PHYSICAL_PROJECTILE_VISIBILITY_20260914.md) |
| P2 | gravityWell / 52815 | 그라데이션 원+회전 원호 3개+작은 코어 | 공간 왜곡·흡입 텍스처, 중심/경계 분리 | 실제 본체 절차식 스탬프 |
| P2 | darkZone / 52717 | 그라데이션 영역+회전 점 | 암흑 연무/지면 오염. 위험 경계는 가독성 유지 | 실제 본체 절차식 |
| P2 | wallPush / 52829 | 선과 평평한 사각 띠 | 진행 방향이 읽히는 벽/에너지 전면 텍스처 | 실제 본체 도형 |
| P2 | chainLightning / 52898 | 몇 개의 지그재그 선+원형 타격점 | 분기 번개와 국소 타격 스프라이트 | 실제 본체 도형 |
| P2 | soulAnchor / 52929 | 그라데이션 원+점선+닻 대신 작은 점 | 실체 있는 영혼 닻/사슬/파괴 표현 | 실제 본체 절차식 스탬프 |
| P2 | donutSlam / 52547 | 활성 피해 영역도 단색 도넛 | 고리형 충격 텍스처. 중앙 안전 범위 유지 | 전조와 발동 분리 필요 |
| P2 | safeCorner / 52567 | 큰 빨간 면+초록 안전 원 | 공격 면의 질감/폭발 교체. 안전 정보 유지 | 전조와 발동 분리 필요 |
| P2 | crossWipe / 52586 | 쐐기형 단색 면 | 방향성 에너지 쐐기/분해 텍스처 | 영상 추가 확인 |
| P2 | tidalWipe / 52607 | 파도 대신 색 면 | 파도 전면/거품/잔류 텍스처 | 영상 추가 확인 |
| P2 | mine / 49120 부근 | 작은 원·흰 점·동심원 경고 | 질감 있는 지뢰 코어와 작동/폭발 표현 | 공용 적 투사체 경로 |

## 유지·별도 분류

| 대상 | 분류 / 조치 |
|---|---|
| fdEnergy | 화마귀 용암구 16f, `_fdDrawFly`, 기준 렌더240px. 사용자 지정 품질 레퍼런스 |
| fbEnergy | 크라켄 물 시트 전용 경로. 원형 도형 교체 대상과 혼동하지 않음 |
| 드루이드 ORB | `_druidSheets.orb` 8f 정상 경로. 이번 주황 원 신고와 별개. 영상 품질 검수는 추가 필요 |
| 드루이드 독/가시 장판 | si0/si3에서 aoe 8f 시트 사용. 로드 실패시 일반 절차식 경로가 노출될 수 있음 |
| elemBall | 크라켄/속성 시트→혜성 폴백 경로. 단색 원 본체는 현재 코드에서 이미 폐기 |
| 일반/fast/titanEye 탄 | 정상 스프라이트와 로딩 실패시 원형 폴백이 공존. 정상 상태 저품질 본체로 단정하지 않음 |
| cageTrap | 모든 보스 사용 금지. 플레이어 boneWall/boneStorm의 시트 유지. 보스 시각 교체 대상 아님 |
| 공통 _booms | 스프라이트 기반. 각 시트 품질 확인은 별도; 단순 원 전부라는 판단 금지 |
| Q/E/무지개 패링 정보 | 표현 교체로 패링 분류·색상 식별·판정 변경 금지 |

## 교체 순서와 완료 기준

1. 신고 추적지뢰 → 화마귀 대형탄 시각 적용. 외형만 재사용할지 fdEnergy 게임 규칙까지 바꿀지 분리한다. 우선 피해/유도/수명은 유지하고 시각만 교체하는 안이다.
2. P0 분신/기둥 → 보스 실체와 공간감 확보. 플레이어 공유 배열은 소유자 구분 후 변경.
3. P1 실제 발동/폭발 → 전조 원을 지운다고 완성으로 보지 않는다.
4. P2 영역/경계 → 안전지대와 패링 식별을 보존하며 재작업.
5. 정상 로딩/미로딩 폴백, 1체·다수 중첩, 밝은/어두운 맵, 전 페이즈 카메라 검수. 시트 등록만으로 완료 처리 금지.

교체 후보 26개. 구현 완료 0개(이번 목록 작성 기준). 전체 보스 전투 영상·모든 시트의 알파/프레임 품질 전수 검수는 남아 있다.

| 2026-09-16 물리 뱀탄 대비 | 사용자 지시로 사전 회백색 보정을 취소하고 `_physMouthImg` 원본 색 사용. 비행·부착 외형 공통, 크기·전투 수치 유지. [픽셀 공식·검증](../8.0몬스터디자인/PHYSICAL_PROJECTILE_VISIBILITY_20260914.md) |
