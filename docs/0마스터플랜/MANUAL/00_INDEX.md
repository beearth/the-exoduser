# EXODUSER 디렉션 매뉴얼 — 색인 (초안 2026-11-05, 레인 MAN)

- 근거: [DIRECTION_RESET_20261105](../DIRECTION_RESET_20261105.md) 3단계 "우리 매뉴얼을 만들고 그때 개발한다". 사용자 원문: "모션 등 모든 디렉션 매뉴얼을 하나하나 어떻게 할 것인지 다 정해."
- 목표 기준: 분위기·광원·안개 = Downfall of Yellowsky(황천역도), 환경·HUD·가독성 = 디아블로4·PoE2, 임팩트·전투 = Phantom Blade Zero.
- **상태: 전부 초안. 사용자 승인 전에는 개발을 시작하지 않는다.** 아래 §3의 결정 항목이 승인되면 해당 문서를 "확정"으로 바꾼다.
- 공통 틀(모든 파일): 1 목표 장면·레퍼런스 / 2 디렉션 원칙 / 3 수치 기준 / 4 도구(Unity 추천 | UE5 대응) / 5 절차(5.1 공통 → 5.2 Unity 반입 → 5.3 UE5 반입) / 6 합격 기준 / 7 금지 / 8 사용자 결정 / 9 출처.
- **엔진 독립(11-05 CTO 지시):** 엔진 전환(Unity→UE5) 검토 중이므로 1·2·3·6·7절은 엔진 용어 없이 썼다. 엔진이 바뀌어도 디렉션은 그대로 쓰고, 4절 도구 표와 5.2/5.3 반입 절차만 바꾼다. 판단 자료는 ENG 레인(claude/unity-cloud-engine-decision-20261105).
- 불변 전제: Core 수치·판정은 Unity Core가 정답(표현만 정함, 바꿀 제안은 "Core 제안"으로 표시) · 카메라 LOCK 피치 34° 원근, 먼 적이 지워지면 FAIL · 리깅 3D → 실시간 저해상도 픽셀 렌더 · 무지개탄은 Q로만 패링 · 어택 티켓 금지 · `docs/2_3`은 설계 변경 없음 · 점·디더·그레인 금지 · 실버 헬 톤.
- 수치 등급: [사실] 출처 2개 이상 / [단일] 1개 / [추정] 우리 기준 시작값. 연구 세션 대부분이 원문(YouTube·Steam 등)을 열지 못해 검색 발췌 기준이다 — 화면 수치는 Mac 비교판에서 다시 잰다.

## 1. 요소별 상태

| # | 파일 | 요소 | 상태 | 반영한 연구 | 연구 반영 대기(주요) |
|---|---|---|---|---|---|
| 01 | [01_world_map](01_world_map.md) | 지형·재질·소품 군집·접지·물·늪 | 초안 | D4-01, PoE2, 관례 | Yellowsky 환경(공개 근거 0), PoE2 지형 블렌드 세부, tech budget |
| 02 | [02_light_fog_grade](02_light_fog_grade.md) | 광원·안개·색 보정·먼 적 가독성 | 초안 | D4-01, D4-03, PoE2, Yellowsky | **Yellowsky 광원·안개·색 수치 근거 0** → 사용자 지정 캡처 필요(D02-5), PoE2 안개·톤매핑 |
| 03 | [03_camera_occlusion](03_camera_occlusion.md) | 카메라 LOCK·가림·실루엣 | 초안 | D4-03, D4-04, 관례 | D4 가림 방식 공식 자료 없음, tech budget |
| 04 | [04_motion_player](04_motion_player.md) | 영웅 동작 전부 | 초안 | D4-04b, PBZ, 관례 | 영웅별 콤보·사망·부활 Core 길이 확인, D4 모캡 비율 |
| 05 | [05_motion_monster](05_motion_monster.md) | 몬스터 유형별 동작 | 초안 | D4-04b, PBZ | 1-1 etype별 AI 프레임(`EnemyAi.cs`), 이동 리듬·넉백 실측 |
| 06 | [06_boss](06_boss.md) | 보스(1-1 드루이드) | 초안 | D4-04, D4-04b, D4-03, PBZ, Yellowsky | NRFTW 프레임 실측, 신규 드루이드 LOCK 시트, 등장·퇴장 컷 Mac 실측 |
| 07 | [07_combat_impact](07_combat_impact.md) | 히트스톱·임펄스·섬광·숫자·처치 | 초안 | PBZ, D4-03, Yellowsky | PBZ 프레임 데이터(공개 없음), 피 데칼 실측, 소리 층 수치 |
| 08 | [08_vfx](08_vfx.md) | VFX 4단계·색·예산 | 초안 | D4-04, PBZ, Yellowsky, D4-03 | PoE2 VFX 팔레트, 점광원 예산 Mac 실측, 드루이드 나머지 9종 표 |
| 09 | [09_hud](09_hud.md) | 전투 HUD | 초안 | D4-02, HUD G1(G0 브리프·결함), 관례 | PoE2 HUD 실측, D4 1080p 측정, 레퍼런스 직접 캡처 대조 |
| 10 | [10_menus](10_menus.md) | 타이틀·로비·캐릭터 선택·설정·인벤토리·스킬창 | 초안 | D4-02, 관례 | 레퍼런스 로비·캐릭터 화면 캡처 대조, 창 실측 |
| 11 | [11_loot_items](11_loot_items.md) | 드롭·등급 색·빛기둥·라벨·툴팁 | 초안 | 관례, D4-02 | D4·PoE2·Last Epoch 전리품 캡처 대조, 기둥 높이·낙하 길이 |
| 12 | [12_sound_music](12_sound_music.md) | 믹스 버스·우선순위·음악 | 초안 | D4-03 §8.9, PBZ 규칙8, 관례 | 믹스 청취 실측, 장면별 곡 지정, LUFS 목표, PoE2 사운드 |
| 13 | [13_cinematics](13_cinematics.md) | 등장·전환·처치·타이틀·영상 | 초안 | D4-04, Yellowsky 규칙6·9 | 타이틀·로비 연출 레퍼런스 연구 없음 |
| 14 | [14_text_font_l10n](14_text_font_l10n.md) | 폰트·크기·29개 언어 | 초안 | D4-02 §4, 관례 | 언어별 길이 팽창 실측, RTL·태국어 실렌더, `Resources/Data` 실파일 확인(이 체크아웃엔 없음) |
| 15 | [15_performance_budget](15_performance_budget.md) | 폴리곤·텍스처·드로우콜·ms·GC·로딩 | 초안(수치 대부분 [추정]) | 관례 | **tech budget 연구 전체**(codex/unity-audit-our-tech-*, claude/unity-cloud-toolchain-* 아직 없음), 하한 기기 정의 |

## 2. 요소별 추천 도구 (한 줄)

| # | 확정 추천(Unity) | UE5 대응 | 커스텀 툴(명세는 각 문서 §4) |
|---|---|---|---|
| 01 | Blender(Meshy·Tripo 기본형 → Blender 다듬기) + 엔진 지형 높이 블렌드 + 데칼 | Landscape + Material Layer, Decal | `ForestKit Scatter`(곁가지 소품·카드·접지 데칼 배치, 웹 좌표 소품은 고정) |
| 02 | Mixed 베이크(Shadowmask) + APV + 기존 `HellFogFeature` + 전역 Volume 1개, LUT는 DaVinci Resolve | Lumen/베이크 혼합 + Exponential Height Fog + PostProcessVolume | — (색 보정 소유자 1명) |
| 03 | Cinemachine 3(피치 잠금·거리만 보간) + Impulse(위치만) + 알파 페이드 셰이더 + Render Objects 실루엣 | Spring Arm 고정 피치 + Camera Shake + 머티리얼 디더 대신 알파 페이드 + Custom Depth 실루엣 | `OccluderFade` |
| 04 | Blender 손키 + Animator(기존 영웅 IK 유지) | Animation Blueprint + Control Rig | 타이밍 표 검증기 |
| 05 | Blender 손키 + 가족별 공용 클립 라이브러리 | 같은 방식 + Retarget | 가족 클립 세트 검증기 |
| 06 | Blender 부위별 조형·수동 리그·손키 | 같은 원본 FBX + Control Rig | 타이밍 표 → 클립 길이 검증기 |
| 07 | 엔진 파티클 + 플립북 시트, 포즈 홀드는 대상 1개만 | Niagara + Anim Notify | 임팩트 이벤트 프리뷰어 |
| 08 | 파티클(CPU) + 플립북 + 메시/셰이더 지면 표식 | Niagara + Decal | VFX 점·가림 검사기 |
| 09 | HTML/CSS 목업 → Blender 정사영 원화 → node 트림 → IMGUI 조립(v0 유지) | UMG | `hud_slice_trim` |
| 10 | HTML/CSS 목업 + Blender 틀 원화 + 기존 Kling 배경 영상 | UMG + Media Player | 기존 `silver_hell_remap.cjs`(신규 없음) |
| 11 | 기존 `world_item_drop_beams_v3` 아틀라스 재사용 | Niagara 빔 | `loot_style_table`(등급 1표로 색·기둥·소리) |
| 12 | Audio Mixer + 자체 SfxPlayer 유지, 효과음 ElevenLabs(FMOD·Wwise 기각) | MetaSounds + Submix | `sfx_audit` |
| 13 | Timeline + Cinemachine, 캡처 Unity Recorder, 편집 DaVinci Resolve(컷만) | Sequencer + Movie Render Queue | `CineProfile` 데이터 에셋 |
| 14 | Font + GUIStyle 유지 + Noto Serif 폴백 체인, `Resources/Data/*.json` 29개 언어 | Font Face + String Table | `l10n_glyph_audit`(node) |
| 15 | Profiler + Frame Timing Manager + Memory Profiler, Mac Xcode GPU Capture(오프스크린만) | Unreal Insights + stat | `BudgetCheck`(반입 검사·키샷 집계) |

## 3. 사용자 결정 필요 항목 — 전체 목록

추천안이 첫 번째. 자세한 대안·근거는 각 문서 §8. ★ = 문서 간 충돌 또는 기존 결정과 충돌, 먼저 정해야 다른 문서가 확정된다. 💰 = 유료 지출 승인.

### 3.1 먼저 정할 것 (충돌)
| ID | 질문 | 추천 |
|---|---|---|
| ★D02-1 | 안개 색: 현행 코드 청록 / 아트 바이블 C7 탁한 적갈 / PoE2 연구 은회~청회 | 은회~청회 높이 안개 |
| ★D02-5 | Yellowsky 기준 캡처 3~5장을 사용자가 지정(공개 수치 근거 0이라 판정 기준이 필요) | 지정 |
| ★D03-1 / D06-2 | 보스 아레나 카메라: 현행 16.5u(11-03 18.3 폐기) / 연구 ×1.20·+8~15% / 구현 상한 ×1.35 | 현행 16.5u 유지, 대기술만 일시 +8~15%(D03-4), Mac 비교판 후 확정 |
| ★D07-1 | 11-03 R3 "히트스톱·슬로 없음" vs 연구: A(PBZ) 포즈 홀드 ≤2틱 + 히트 플래시 필수 / B(D4) 경타 2~3·강타 4~6틱 | A안 + 히트 플래시 필수(D04-3·D13-1 함께 정해짐) |
| ★D07-2 | Core 포이즈 붕괴 슬로 20을 표현에서 억제(Core 제안) | 슬로만 억제 |
| ★D06-1 | 데모 보스: 리모델 3목숨(`DruidRemodelData.cs`) / 웹 5단계 | 리모델 3목숨 |
| ★D12-1 | 동시 보이스 상한: 현행 48 / 연구 32 + 위험 소리 8 면제 | 연구안 시험 후 결정 |
| ★D11-1 | 유니크 이름 색(자수정)과 기둥 색(빨강) 불일치 통일 | 통일 |
| ★D09-7 | RMB·E 슬롯 내용 뒤바뀜 의심(`NativeHudSkills.cs` SlotSkillId 7·9) 별도 레인 배정 | 배정(버그 확인) |
| ★D15-5 | 프레임 상한 기본값 60(코드 기본 120) | 측정 후 |

### 3.2 유료 지출 (💰, API연결_가이드 범위·SPEND_LOG)
| ID | 내용 |
|---|---|
| 💰D01-3 | 이미지 생성·3D 초안(Meshy·Tripo) |
| 💰D01-2 | 지면 타일 Blender 무료 시작, 2회 FAIL 시 Substance 구매 요청 |
| 💰D06-4 | 보스 부위 참고용 Meshy/Tripo 최소 크레딧 |
| 💰D09-6 | HUD 장식 시안 이미지 생성 |
| 💰D11-6 | 드롭 소리 생성(ElevenLabs) |
| 💰D12-6 · D12-7 | 비어 있는 효과음 10개 생성 · 신곡 제작 |
| D04-2 | Mixamo 사용(무료, Adobe 로그인은 사용자 직접) |

### 3.3 요소별 나머지
| 요소 | 결정 항목 |
|---|---|
| 01 맵 | D01-1 지형=엔진 지형 vs 전부 메시 · D01-4 `ForestKit Scatter` 제작 · D01-5 고목 수관을 가림 대상에 포함 |
| 02 광원 | D02-2 적 안개 영향 상한 25% vs 50% · D02-3 톤매핑 Neutral(추천) vs ACES · D02-4 Forward+ 전환(Mac 실측, D15-3과 묶음) · D02-6 영웅 주변 빛 반경 8m 조정 허용 |
| 03 카메라 | D03-2 일반 적 가림 실루엣 기본 끔 · D03-3 가림 알파 0.30 등 시작값 · D03-4 드루이드 대기술 카메라 늘이기(D13-6 동일) · D03-5 수관 알파 → 필요 시 컷아웃 |
| 04 영웅 동작 | D04-1 접점 홀드 3안(보간/홀드/12fps 계단) 영상 비교 Mac 확정(홀드안 기본) · D04-3 → D07-1 |
| 05 몬스터 | D05-1 "날아감" 사망은 강타·처형만 · D05-2 제작 순서 = 1-1 출현 빈도 상위 3가족 |
| 06 보스 | D06-3 행동불능 직후 큰 기술 판정 금지 30틱(Core 제안) |
| 07 임팩트 | D07-3 푸시인 2~3%(R4) 유지, 근거를 "트레일러 편집"으로 정정 |
| 08 VFX | D08-1 동시 점광원 ≤2 · D08-2 패링 전용색 추가 안 함(뼈색 + DANGER 두 색 문법) · D08-3 VFX 점·가림 검사기 구현 배정 |
| 09 HUD | D09-1 시안 A 비례 + B 주공격 56 받침 · D09-2 MP 토큰 `#3b5f86` 실버 헬 추가 · D09-3 체력 구체 진홍 = "빨강은 눈에만" 예외 · D09-4 키 라벨 18px vs 10.5px · D09-5 글자 크기·HUD 배율 옵션 v0(D14-4 동일) · D09-8 물약 칸·버프 줄 v0 |
| 10 메뉴 | D10-1 캐릭터 목록 그라데이션 행 · D10-2 창 열기·닫기 페이드 통일 · D10-3 접근성 항목 v0 · D10-4 로비 장면 움직임 · D10-5 로비 이식 앞당김 · D10-6 레퍼런스 직접 캡처 대조를 착수 관문으로 |
| 11 전리품 | D11-2 등급 색 `#44cc44`·`#ffaa00` 예외 vs 채도 낮춤 · D11-3 바닥 이름표 희귀 이상 상시 vs Alt 전용 · D11-4 표시 키 Alt · D11-5 전설 3D 기둥 v0 뒤로 · D11-7 획득 알림 토스트 유지 |
| 12 사운드 | D12-2 덕킹 attack 10ms vs 30ms · D12-3 효과음 라우드니스 목표 · D12-4 음성 슬라이더 분리 · D12-5 필드 음악 연주/휴지 순환 · D12-8 청음 카드에 동작 영상 필수 |
| 13 연출 | D13-1 보스 처치 히트스톱 Core 12f 그대로(D07-1 따름) · D13-2 등장 4초·정적 60f · D13-3 타이틀·로비를 매뉴얼 범위에 · D13-4 Steam 영상은 실게임만 · D13-5 편집 DaVinci Resolve |
| 14 글자 | D14-1 본문 Hahmlet 300 + 나눔명조 폴백 · D14-2 Noto 번들 +20MB 허용 · D14-3 최소 본문 18px · D14-5 폰트 라이선스·크레딧 · D14-6 검수 언어 상위 6 vs 29 · D14-7 번역 일괄 모델·감수 시점 · D14-8 아랍어 RTL v0 |
| 15 성능 | D15-1 하한 기기 정의 · D15-2 [추정] 수치를 시작값으로 확정 · D15-4 `BudgetCheck` 제작 · D15-6 GPU 디버거는 무창·무음 오프스크린만 |

## 4. 다음 단계
1. 사용자: §3.1 충돌 10건 → §3.2 지출 → §3.3 순으로 결정.
2. 남은 연구(reference-scout, toolchain, codex 교차 연구·tech audit, 엔진 결정 ENG)가 올라오면 해당 문서의 "연구 반영 대기" 행을 채운다.
3. 결정 반영 후 문서별 "확정" 표시 → DIRECTION_RESET 4단계(키샷 한 장면부터, Mac 판정).

## 변경 이력
- 2026-11-05 초안 15개 + 색인 작성(레인 MAN). 연구 입력 SHA: arpg-conventions cb5e4c8, d4-study 1e91470, d4-study-boss e8fce5b, d4-study-combat 7f278fa, d4-study-ui 6d44f4e, hud-redesign-g1 8af73fc, phantomblade a23d58a, poe2 f05b5fb, yellowsky b740d57.
