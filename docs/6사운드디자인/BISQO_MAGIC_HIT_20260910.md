# Bisqo Dark Magic Impact 적용 — 2026-09-10

사용자가 Freesound 후보③을 선택하여 적 탄막→플레이어 피격음으로 편집·교체했다. 기존 피격 조건, 신음, 음량0.55,100ms 재생 간격, 우선순위8은 유지한다.

| 항목 | 현재 값 |
|---|---|
| 원작 | DSGNSrce_Deep Dark Magic Impact Short Kick 016_GMcM_FS1DM |
| 저작자 / ID | Bisqo / Freesound855371 |
| 원작 페이지 | https://freesound.org/people/Bisqo/sounds/855371/ |
| 라이선스 | CC BY 4.0, https://creativecommons.org/licenses/by/4.0/ |
| 실제 사용 소스 | 공개 HQ MP3 미리듣기: https://cdn.freesound.org/previews/855/855371_6779432-hq.mp3 |
| 소스 구분 | 원본24-bit WAV는 사용하지 않았다. 받은 HQ MP3를 보존한다 |
| 편집 도구 | tools/build_bisqo_magic_hit.py |
| 필터·채널 | FFmpeg highpass=f=70 적용 후 mono,48000Hz float 디코드 |
| 크롭 | 소스0.060~0.480초, 속도·피치 변경 없음 |
| 엔벨로프 | 처음2ms 선형0→1, 마지막120ms 선형1→0의 제곱 |
| 음량 | min(0.75/peak,0.135/RMS), 측정값은 아래 표 |
| 출력 | mono PCM16,48kHz,0.42초,20160샘플,40364bytes. round(samples×32767), 시작·끝 샘플0 |
| 런타임 키 / 파일 | player_projectile_impact / sfx/hit/player_projectile_impact.wav |
| 캐시 갱신 URL | sfx/hit/player_projectile_impact.wav?v=bisqo-855371-v1 |
| 단발 청취 | 마법_피격음_적용본.wav,1회만 재생·추가 연타 없음 |
| 출처 파일 | sfx/hit/ATTRIBUTION.txt — 원작명·제작자·소스·라이선스 링크·편집 내용 포함 |
| 원음·기존음 보존 | output/audio/bisqo_magic_hit_20260910/855371_bisqo_source_hq.mp3 및 previous_procedural_hit.wav |
| 재생 길이 | 기본0.42초, 기존 랜덤rate0.92~1.08에 따라 약389~457ms |
| 중첩 | 100ms 간격에서 큐가 정상 처리될 때 최대5음. 마지막120ms 잔향 감쇄. 기존 전체48/16노드 상한 유지 |
| 단위 검증 | test/projectilePlayerHitSound.test.js 기존10개 PASS |
| 런타임 검증 | 실제 hurtP→샘플 큐→Web Audio 시작,0.42초 디코드,무적 무음,밀집8충돌 재생1회 PASS. 실제 세이브 쓰기 없음 |
| QA 파일 | asset_qa.json, browser_qa.json (output/audio/bisqo_magic_hit_20260910/) |
| 검수 한계 | 기술 검증 완료, 전체 전투의 청감은 사용자 확인 가능 |

## 측정값

| 필드 | 값 |
|---|---|
| source_duration_s | 2.1490416666666667 |
| source_sha256 | 603a5b533f282c9cd66839e833b6354f08edc7cab4fcf151b83212ae60a6809f |
| gain | 0.6071057599081672 |
| peak | 0.5953515736739069 |
| rms | 0.135 |
| sha256 | c2df7e4edc05978a47b2579545dd4a3c87eeb10fe9dc2d6dbeaaeff0097f31a8 |


## 2026-09-10 탄막 → 적 타격음 공용 적용

사용자 지시로 적에게 명중하는 일반 탄막·마법탄·블루콩도 동일 Bisqo855371 편집본을 사용한다. 음원 매핑만 변경하고 기존 명중 이벤트·데미지·관통·피격 신음·우선순위·음량은 유지한다.

| 키 | 현재 파일 URL | 기존 재생 계약 |
|---|---|---|
| bullet_hit | sfx/hit/player_projectile_impact.wav?v=bisqo-855371-v1 | 일반/마법 탄막→적. playSampleAt,volume0.15×터렛거리계수,위치=e.x/e.y,rate=_r(1,.15) |
| bean_hit | sfx/hit/player_projectile_impact.wav?v=bisqo-855371-v1 | 블루콩→적. playSample,volume0.1×터렛거리계수,rate=_r(1,.15),기존 P._bbHitCd=4 유지 |
| player_projectile_impact | 같은 URL | 적 탄막→플레이어. volume0.55,100ms 간격,PLAYER_HIT8 유지 |

bullet_hit·bean_hit은 PROJ1,동시재생 데스크톱5/모바일2 제한을 유지한다. 터렛거리계수는 `max(0,1-dst(P,터렛)/2000)`,0.01 이하이면 기존처럼 명중음을 생략한다. 공통 playSample 피치 변동도 기존대로다. 칼날류 chain_fly,일반 활 bow_hit,arcMissile의 별도 분기와 반사 폭발음은 기존대로다. 신규 세이브 필드·음원 복제 없음.

검증: 기존 projectilePlayerHitSound/audioBootLoading 12개 PASS. tools/verify_outgoing_magic_hit.py에서 두 키의 0.42초 디코드 PCM이 플레이어 피격음과 완전히 같은지,PROJ1 분류와 실제 Web Audio 노드 시작을 확인한다. 증거: output/audio/bisqo_magic_hit_20260910/outgoing_qa.json. 단독 검증 슬롯 사용,실제 저장 쓰기 없음.
