# 기검참 검기·명중 VFX — 2026-09-15

요청: 기검참 임팩트 스프라이트가 밋밋하므로 더 화려하게 개선. 기존 얇은 초승달 대신 백열 칼날, 겹쳐 흐르는 검기, 길고 뾰족한 리본 잔광을 사용한다. 점묘·노이즈·작은 점 파티클을 늘리지 않는다. 내장 GPT 이미지 생성 도구로 두 시트를 만들었으며 원본을 그대로 프로젝트에 복사했다.

| id / 경로 | 형식·배열 | 역할 |
|---|---|---|
| `assets/vfx/ki_slash_silver_sheet.png` (2026-10-11 현행) | 1254×1254 RGB PNG, 3×3·9프레임, 셀418px | 오른쪽을 향한 실버 초승달 비행 검기. 프레임은 행 우선. 구 `ki_slash_radiant_sheet.png`(청색)는 파일만 보존 |
| `assets/vfx/ki_slash_hit_silver_sheet.png` (2026-10-11 현행) | 1254×1254 RGB PNG, 2×2·4프레임, 셀627px | 충돌 순간의 교차 실버 검격·섬광·잔광. 구 `ki_slash_hit_radiant_sheet.png`(청색) 파일만 보존 |
| 배경 | 순수 검정 가산용, `lighter` 합성 | 투명 체크무늬 없음. 검정은 가산 합성에서 기여하지 않음 |

| 런타임 | 값·적용 |
|---|---|
| 적용 파일 | `game.html`, `game-easy-test.html` |
| 비행 로더 | `_KI_SLASH_IMG.onload` → `_kiSlashRadiant={surfaces,fw,fh}` |
| 팔레트 | `_kiSlashPalette(c)`=0 고정 (2026-10-11 실버 단일). 구: 3타=2, 실버테일=1, 전사=0 |
| 색 캐시 | `_kiSlashTintSurfaces()`=`[img,img,img]` 동일 참조(색 변환 폐지, 인덱스 호환). 구: 원색 + `hue-rotate(40deg)` 보라 + `hue-rotate(150deg)` 붉은빛 |
| 비행 크기 | 1·2타192px, 무충전 3타252px. 3타 홀드 충전 단계 `T=min(3,⌊충전f/60⌋)`에 폭·높이 `1+T×0.4`를 곱함(1/1.4/1.8/2.2배). 피해 배율 `M=2^T`와 분리하며 높이는 소스 비율 유지 |
| 비행 프레임 | `progress=clamp(1−life/ml,0,1)`, `frame=min(8,floor(progress×9))` |
| 비행 alpha | `min(1,(1−progress)×2.5)`; 진행률60%까지1, 이후 페이드 |
| 칼날 잔상 | 기존5점 트레일 대신 원형 버퍼 `_th`에서2·4샘플 전 위치에 시트 잔상2장. 크기0.9배, alpha .18/.08에 비행 alpha 곱 |
| GPU 합성 | 실제 게임 컨텍스트(`X.canvas===C`) 및 WebGPU/WebGL 모드에서 `_setBlend(true)` → 검기 렌더 → `_setBlend(false)`. 프록시의 `globalCompositeOperation` setter가 무동작이므로 네이티브 블렌드를 활성 검기가 있을 때 전체 묶음에 한 번 명시(활성0개면 블렌드 변경0회). ONE/ONE 경로이므로 `_drawKiSlashFrame()`이 정점 RGB에도 alpha를 곱해 잔상·글로우·페이드 밝기를 보존. Canvas2D는 lighter 유지 |
| 본체 | 1.08배 글로우 alpha .18(3타 .3) + 1배 본체. 잔상 포함 스프라이트4회(Canvas drawImage / GPU quad)·lighter |
| 명중 등록 | `_VFX_SHEETS.ki_slash_hit_0/1/2`, 4프레임·2열·lighter. 기존 공용 VFX 풀 최대20개 사용 |
| 명중 재생 | `_playKiSlashHit(c,x,y)`; 일반 적 명중 위치에서 발사각 `c.ang`. 1·2타 140px, 3타는 `184×chargeScale`로 단계별 184/257.6/331.2/404.8px. scale=크기/627, frameTime3(총12f) |
| 기존 점 파티클 | 기검참 일반 적 명중의 `addParts` 6/14개 호출 제거; 전용 명중광으로 대체 |
| 폴백 | 새 비행 시트 미로드면 기존 공용9프레임 `crescent_slash.webp` / 실버테일 단일 원화. 새 명중 시트 미로드면 기존 `ice_slash`, 1·2타 scale .9, 3타 scale `1.25×chargeScale`·3f |
| 프리로드 | 새 두 경로를 기존 게임 프리로드 목록에 추가 |
| 판정 | 속도14px/f, 무충전 충돌 반경55/55/120px, 기본 거리250/300/350px, 레벨 거리+15px, 히트스톱3/6f·3타 shake8. 3타 홀드 40/80/120f(2초 풀차지)에 검기 피해 2/4/8배, 반경168/216/264px; 비용·속도·거리 유지. [홀드 계약](../2_1%20스킬관리+합체시스템+자원/KISLASH_HOLD_CHARGE_20260927.md) |
| 3타 충전 연출 | 플레이어 몸 중심에 기존 붉은 비행 시트 첫 행0~2프레임을 7f 간격으로 순환·2장 가산 합성. 충전0/40/80/120f에 기본 크기78/91/104/117px, 단계 사이 최대4px 성장·맥동±3.5%. 외광 alpha `.24+.08×T`, 본체 `.58+.08×T`; 아래 3단계 백열 자국. 시트 실패 시 12구간 절차적 곡선 칼날 폴백. 긴 집속선·랜덤 입자·떠오르는 충전 문구 제거 |
| 3단 완료 섬광 | 180f 최초 도달 순간 `ki_slash_hit_2`를 캐릭터 중심에 scale `.26`(627px 셀 기준 약163px), frameTime `2`로 4프레임·8f 재생. 시트 미로드 시 `parry_impact` scale `.85`, frameTime `1` 폴백. 홀드 유지·해제에서 중복 재생 없음. 금속 충돌음 `sword_parry`와 같은 프레임에 시작 |

검수 산출물: `output/ki_slash_radiant_20260915/before_after.png`, `all_frames.png`, `in_game.png`, `qa.json`. 브라우저에서 실제 `renderCrescents`, `_playKiSlashHit`를 실행해 3개 팔레트×9프레임, 4프레임 명중광, 원래 피해·속도·반경을 검사한다.

생성 방식과 최종 프롬프트 사양: [KI_SLASH_RADIANT_PROMPTS_20260915.md](KI_SLASH_RADIANT_PROMPTS_20260915.md).


## GPU 준비 계약 (2026-09-29)

| id | 적용 |
|---|---|
| `_kiSlashRadiant.surfaces` | 원본 Image와 로드 시 생성한 색상 Canvas를 `_queueCombatTextureWarmup()`에서 기존80장 큐에 적재. Image는 complete/naturalWidth, Canvas는 양수 width/height 검사 |
| `ki_slash_hit_*` | 공용 명중 시트도 같은 큐에서 먼저 제출. 기존 Set으로 중복 제외, 늦은 로드는180f 재검사 |

첫 검기 렌더가 전체 시트 업로드를 떠맡는 누락을 보완한다. 검기 수치·팔레트·합성·프레임 계약은 그대로다. [실측·검증 SSOT](../12퍼포먼스·최적화/COMBAT_TEXTURE_WARMUP_20260929.md).

추가 첫 전투 계측에서 확인한 `_waterBlueFlightImg`(물 파란콩), `_ch1StartMediumImgs`(다안육괴), `void_black`(부활 대기), `_mineTrapWardSheet`(덫), `_corpses`의 첫16개128×128 Canvas도 같은 준비 큐에 포함한다. 최초 부활 시트의43.3ms 업로드와 첫 시체 텍스처 할당을 draw에서 준비 단계로 옮기며, 기존 표현·부활 수치·시체 풀120개·동적 내용 갱신은 유지한다.

## 실버+블랙 전환 (2026-10-11)

사용자 지시: 「기검참 모션을 최신모델로 실버실버실버+블랙으로 바꾸자 — 물리데미지인데 왜 컬러가 들어가는지 이해가 안 가네」. 기검참은 물리 피해이므로 속성색(청·보라·붉은)을 없애고 1·2·3타·전사·실버테일 모두 같은 실버, 그 뒤에 검은 잉크 층을 둔다.

| 항목 | 값 |
|---|---|
| 생성 | MagicLight Toolbox Image → **GPT Image 2.5 sunburst**, 1:1, 1장당 200포인트×2(시작 잔액 51,290). 기존 청색 시트를 레퍼런스로 첨부해 배치·셀 중심·모양 유지 |
| 작업 id | 비행 `7515056643669684224`, 명중 `7515056833273176064` (원본 2048×2048 RGB) |
| 프롬프트 | [KI_SLASH_RADIANT_PROMPTS_20260915.md](KI_SLASH_RADIANT_PROMPTS_20260915.md) §실버 재생성 |
| 후처리 | LANCZOS 2048→1254(기존과 같은 해상도·VRAM). 크롭·키잉 없음 |
| 검수 | 셀 경계 밝기 최대1/255(칸 넘침 없음)·가장자리 최대1·채도 최대12/255(평균1.3~2.9, 사실상 무채색)·1x 크롭 점묘/잔점 없음 |
| `_kiSlashPalette` | 항상0 |
| 검은 층(비행) | `_kiSlashShadowSurface(img)`: 로드 시 1회, `blur(max(2,w/260)px)` → 밝기(max RGB×alpha)×2.4 → 알파, 색 #050406. `_drawRadiantKiSlash`에서 가산 패스 전에 `source-over`, 크기1.14배(본체1배 대비), alpha `.9×비행alpha`. GPU 경로는 `_setBlend(false)` → 그리기 → `_setBlend(true)` (검기당 블렌드 전환2회, 활성 검기0이면0회) |
| 검은 층(명중) | 공용 VFX 풀은 GL 인스턴싱 가산 전용이라 `_kiHitShadows`(최대8, 초과 시 오래된 것부터 제거)에 등록하고 `renderCrescents` 시작 `_drawKiHitShadows(X)`에서 일반 합성. 프레임 `floor((_gameFrame−f0)/3)` 0~3(12f, 명중광 frameTime3과 동일), 크기 명중광 폭×1.14, alpha `.85×(1−프레임×.18)` |
| 텍스처 준비 | `_kiSlashRadiant.shadow`도 전투 텍스처 준비 큐에 포함 |
| 무채색 정리 | 충전 폴백 칼날 `#ff596d`→`#d9dbe0`, 충전 단계 표시 미완 `#8c3445`→`#3a3a40`·완료 `#fff4df`→`#f4f5f7`, 시트 미로드 트레일 스탬프 `#ff3322/#66bbff`→`#e8e9ee/#c9ccd3` |
| 불변 | 피해·속도·거리·판정 반경·홀드 단계·크기·프레임·잔상·히트스톱 전부 그대로 |
| 테스트 | `test/kiSlashRadiantRender.test.js`에 검은 층 계약(GPU 블렌드 순서 `[true,false,true,false,true,false]`, Canvas2D drawImage 10회) 추가. `kiSlashHoldCharge` 샌드박스에 `_kiHitShadows` 보강 |
| 실화면 | 1600×900 GPU: 실버 칼날 테두리에 검은 잉크 번짐이 붙어 어두운 바닥에서도 윤곽이 선다. 명중광도 실버 |
| 미반영 | `ART_TEAM_MASTER.md`는 타세션 편집 중이라 이번에 쓰지 않음 — 다음 아트 정리 때 현황표에 이 문서 링크 추가 |
