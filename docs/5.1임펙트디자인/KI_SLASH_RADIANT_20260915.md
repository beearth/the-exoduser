# 기검참 검기·명중 VFX — 2026-09-15

요청: 기검참 임팩트 스프라이트가 밋밋하므로 더 화려하게 개선. 기존 얇은 초승달 대신 백열 칼날, 겹쳐 흐르는 검기, 길고 뾰족한 리본 잔광을 사용한다. 점묘·노이즈·작은 점 파티클을 늘리지 않는다. 내장 GPT 이미지 생성 도구로 두 시트를 만들었으며 원본을 그대로 프로젝트에 복사했다.

| id / 경로 | 형식·배열 | 역할 |
|---|---|---|
| `assets/vfx/ki_slash_radiant_sheet.png` | 1254×1254 RGB PNG, 3×3·9프레임, 셀418px | 오른쪽을 향한 초승달 비행 검기. 프레임은 행 우선 |
| `assets/vfx/ki_slash_hit_radiant_sheet.png` | 1254×1254 RGBA PNG, 2×2·4프레임, 셀627px | 충돌 순간의 교차 검격·섬광·길게 풀리는 잔광 |
| 배경 | 순수 검정 가산용, `lighter` 합성 | 투명 체크무늬 없음. 검정은 가산 합성에서 기여하지 않음 |

| 런타임 | 값·적용 |
|---|---|
| 적용 파일 | `game.html`, `game-easy-test.html` |
| 비행 로더 | `_KI_SLASH_IMG.onload` → `_kiSlashRadiant={surfaces,fw,fh}` |
| 팔레트 | `_kiSlashPalette(c)`: 3타=2, 나머지 실버테일=1, 전사=0 |
| 색 캐시 | `_kiSlashTintSurfaces()`에서 원색 + `hue-rotate(40deg)` 보라색 + `hue-rotate(150deg)` 붉은빛. 두 이미지가 로드될 때 각각 캔버스2개 생성. 매 프레임 filter/이미지 가공 없음 |
| 비행 크기 | 1·2타192px, 무충전 3타252px. 3타 홀드 충전 시 폭·높이에 `1+(M−1)×0.4`를 곱함(M=1/2/3/4, 최대 2.2배). 높이는 소스 비율 유지 |
| 비행 프레임 | `progress=clamp(1−life/ml,0,1)`, `frame=min(8,floor(progress×9))` |
| 비행 alpha | `min(1,(1−progress)×2.5)`; 진행률60%까지1, 이후 페이드 |
| 칼날 잔상 | 기존5점 트레일 대신 원형 버퍼 `_th`에서2·4샘플 전 위치에 시트 잔상2장. 크기0.9배, alpha .18/.08에 비행 alpha 곱 |
| GPU 합성 | 실제 게임 컨텍스트(`X.canvas===C`) 및 WebGPU/WebGL 모드에서 `_setBlend(true)` → 검기 렌더 → `_setBlend(false)`. 프록시의 `globalCompositeOperation` setter가 무동작이므로 네이티브 블렌드를 활성 검기가 있을 때 전체 묶음에 한 번 명시(활성0개면 블렌드 변경0회). ONE/ONE 경로이므로 `_drawKiSlashFrame()`이 정점 RGB에도 alpha를 곱해 잔상·글로우·페이드 밝기를 보존. Canvas2D는 lighter 유지 |
| 본체 | 1.08배 글로우 alpha .18(3타 .3) + 1배 본체. 잔상 포함 스프라이트4회(Canvas drawImage / GPU quad)·lighter |
| 명중 등록 | `_VFX_SHEETS.ki_slash_hit_0/1/2`, 4프레임·2열·lighter. 기존 공용 VFX 풀 최대20개 사용 |
| 명중 재생 | `_playKiSlashHit(c,x,y)`; 일반 적 명중 위치에서 발사각 `c.ang`. 크기1·2타140px/3타184px, scale=크기/627, frameTime3(총12f) |
| 기존 점 파티클 | 기검참 일반 적 명중의 `addParts` 6/14개 호출 제거; 전용 명중광으로 대체 |
| 폴백 | 새 비행 시트 미로드면 기존 공용9프레임 `crescent_slash.webp` / 실버테일 단일 원화. 새 명중 시트 미로드면 기존 `ice_slash`, scale .9/1.25·3f |
| 프리로드 | 새 두 경로를 기존 게임 프리로드 목록에 추가 |
| 판정 | 속도14px/f, 무충전 충돌 반경55/55/120px, 기본 거리250/300/350px, 레벨 거리+15px, 히트스톱3/6f·3타 shake8. 2026-09-27부터 3타 홀드 60/120/180f에 검기 피해 2/3/4배, 반경168/216/264px; 비용·속도·거리 유지. [홀드 계약](../2_1%20스킬관리+합체시스템+자원/KISLASH_HOLD_CHARGE_20260927.md) |

검수 산출물: `output/ki_slash_radiant_20260915/before_after.png`, `all_frames.png`, `in_game.png`, `qa.json`. 브라우저에서 실제 `renderCrescents`, `_playKiSlashHit`를 실행해 3개 팔레트×9프레임, 4프레임 명중광, 원래 피해·속도·반경을 검사한다.

생성 방식과 최종 프롬프트 사양: [KI_SLASH_RADIANT_PROMPTS_20260915.md](KI_SLASH_RADIANT_PROMPTS_20260915.md).
