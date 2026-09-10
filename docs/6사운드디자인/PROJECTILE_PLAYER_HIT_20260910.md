# 적 탄막 → 플레이어 피격 사운드

플레이어가 적 탄막에 맞는 충돌에 짧은 파열·타격음을 추가한다. 기존 플레이어·실버테일 피격 신음은 유지한다.

| ID / 항목 | 현재 값·적용 위치 |
|---|---|
| 샘플 키 |player_projectile_impact |
| 파일 |sfx/hit/player_projectile_impact.wav |
| 규격 |48,000Hz,mono,PCM16,0.18초,8,640샘플,17,324bytes |
| 제작 |tools/build_projectile_player_hit_sound.py, 절차 합성, RNG seed20260910. 음성·음악 없음 |
| 몸통 |180→65Hz: phase=2π×(65t+115×.025×(1-exp(-t/.025))), exp(-t/.042) 감쇠, weight.54 |
| 파열 |700~5800Hz 노이즈, exp(-t/.011), weight.42 |
| 거친 잔향 |180~2300Hz 노이즈, exp(-t/.045), weight.34 |
| 에너지 틱 |sin(2π×1370t+2sin(2π×83t)), exp(-t/.018), weight.07 |
| 노이즈 필터 |FFT 주파수 gain=min(1,f/lo)^4 / (1+(f/hi)^8), peak 정규화(분모+1e-9) |
| 엔벨로프 |attack1ms,마지막12ms fade, 전체 peak.75 정규화, PCM 정수화×32767 |
| 실측 RMS |0.13535475695863486 |
| 이벤트 표시 |기존 _hurtProjectilePlayer(p,dmg,opts)가 projectileHitSfx:true 전달, 기존 druidPoison·dtype·projHit·knockback 보존 |
| 재생 지점 |hurtP의 방어·최소피해 계산 뒤, 에너지쉴드 적용 전. !dot && projectileHitSfx && a>0 |
| 미재생 |쓰러짐·사망·스테이지 전환·기동 무적·이동 무적·회피·패링 성공 등 hurtP 조기 반환. DOT·일반 근접은 미재생 |
| 쉴드 |에너지쉴드로 흡수되는 유효 충돌도 재생. 이후 피해→분노 전환 등 피해 계산은 기존대로 처리 |
| 재생 함수 |_playProjectileHitSfx(), playSample('player_projectile_impact',.55,1,true) |
| 간격 |performance.now() 기준100ms, _projectileHitSfxAt 초깃값-Infinity. 연속 피해량·횟수는 제한하지 않음 |
| 우선순위 |_SFX_PRI.PLAYER_HIT=8, SKILL10·VOICE9보다 낮고 DEATH4·STEP3·HIT2·PROJ1·AMB0보다 높음 |
| 큐 |playSample pri=true, 우선 큐 사용. 기존 프레임 처리·효과음 볼륨·전체48/모바일16 노드 상한 유지 |
| 피치 |인자1, playSample의 기존 랜덤0.92~1.08 적용. 약167~196ms 재생 길이 |
| 연속 중첩 |100ms 간격과 짧은 샘플로 일반 재생 최대2음 겹침. 일반 HIT/PROJ 하드캡으로 플레이어 피격음을 폐기하지 않음 |
| 저장 |projectileHitSfx는 hurtP 옵션만, _projectileHitSfxAt는 런타임 오디오 상태만. P/G·세이브 필드 추가 없음 |
| 검사 |신규10개+기존 오디오/드루이드5개=15개 PASS. HP 감소·쉴드 흡수·회피/무적/패링/DOT/근접 무음·100ms 제한·우선순위 확인 |
| 브라우저 |실제 _hurtProjectilePlayer→hurtP→샘플 큐→Web Audio 노드 시작 확인. 무적 무음,8연타 충돌음1회. 엔진 리샘플링 길이는1샘플 오차 허용 |
| 증거 |output/audio/projectile_player_hit_20260910/asset_qa.json 및 browser_qa.json. 실제 사용자 저장 쓰기 없음 |
| 검수 한계 |합성·기술·실제 노드 재생 검사. 전체 전투 청취감은 사용자 확인 가능 |


## 2026-09-10 피격음 대안 청취

4가지 합성 후보와 현재 소리의 비교 파일을 만들었다. 아직 게임 적용 전이다. [후보·전체 합성 수치·재생 검증](PROJECTILE_HIT_CANDIDATES_20260910.md).
