# 리스폰 전투자원 완충 — 2026-09-07

> **2026-09-09 피날레 v0.4:** 데모/bic 마지막 si3 보스의 HP는 `floor(22278×(1+.055n+.0015n²)×dm)`, n=max(0,monLv−1); 초기 쉴드=HP, 부활력20, 최대1회 35% HP 저항(확률clamp(1−신성력,0,1)), phase ATK는 base×1/1.12/1.25/1.4/1.6이다. 3막 음악·HUD·120f 카드 및 보스 바로 재도전/60f 인트로의 [현행 계약·검증](../8.1보스디자인바이블/DARK_DRUID_FINALE_PACING_v04.md)을 따른다. 일반 모드와 공용 패링 계약은 기존대로다. 아래 이전 버전의 HP/부활 유지 표현은 당시 이력이다.

사용자 확정: 사망 후 리스폰 시 모든 전투자원을 최대치로 채운다. 일반 스테이지 재시작과 보스방 사망 후 게이트 복귀 모두 같은 규칙이다.

| 대상 | 리스폰 완료 값 |
|---|---|
| HP | P.hp = P.mhp |
| MP | P.mp = P.mmp |
| ST/SP | P.st = P.mst |
| 에너지 쉴드 | P.shield = P.mshield |
| 공용 기동게이지 | _harpGauge = _HARP_GAUGE_MAX |
| 돌진 스톡 | P.chargeStocks = P.maxChargeStocks, P.chargeCd = 0 |
| 호출 위치 | retryBtn 공통 후처리에서 applyStats() 직후 _refillRespawnResources() |
| 범위 제외 | 전투 중 악마화·장비 부활의 확률/회복 규칙, 화폐·물약 등 소모품 수량, 다른 스킬 쿨다운 변경 없음 |

## 최대치 계약

| 항목 | 계산 |
|---|---|
| chargeLv | P.skills.chargeBoost 또는 0 |
| hasCharge | chargeLv >= 1 또는 magicBlink >= 1 |
| dim | isDimBreach() |
| 스톡 최대 | dim이면 5, 아니면 min(5, (hasCharge ? 3+floor(chargeLv/10) : 1) + armor.bonusChargeStock + boots.bonusChargeStock) |
| 기동 칸수 | dimRush 10 → dimThunder 9 → dim 7 → hasCharge 6 → 기본 _HARP_GAUGE_BASE_CELLS(5) 순서 |
| 기동 최대 | 칸수 × _HARP_GAUGE_COST[1](45) + 정수 extraST 어픽스 |

최대치 공식은 기존 프레임 갱신 공식과 동일하다. 사망 중 장비·스킬이 달라져도 현재 상태로 재산정한다. applyStats 이전 값으로 채운 뒤 최대치가 증가해 덜 차는 문제를 막기 위해 최종 스탯 재계산 이후 완충한다. 지속 무한자원이 아니라 리스폰 시 1회 충전이며 이후 소비·리젠은 기존대로다.

원인: 기존 리스폰은 HP/MP/ST/쉴드·돌진 스톡만 충전했으며 독립 변수 _harpGauge는 초기화하지 않았다.

검증: test/respawnResources.test.cjs에서 실제 리스폰 후처리 코드를 실행하여 기본·차지·차원돌파·dimThunder·dimRush 5개 상태 및 최대치 증가 후 완충을 검증한다.


---

## 2026-10-02 — 보스 사망 후 필드 진행 보존 (현행 재도전 계약)

리스폰 자원 SSOT의 공통 `applyStats() → _refillRespawnResources()` 순서는 유지한다. 필드 진행 복원/보존은 자원 완충과 별개의 재도전 분기다.

| 항목 | 현재 계약 |
|---|---|
| 일반 arena 사망 | 보스 진입 전 46개 field key 복원, 일반 적/오브젝트 재생성 없음 |
| CH1-1 해금 완료 필드 사망 | `stage===0&&!_bossArena&&_bossUnlocked`일 때 현재 필드 capture/restore, 기존 일시 디버프·1회효과 정리만 별도 유지 |
| 정상 재시작/시연 | 해금 전 CH1-1·다른 일반 필드는 기존 initStage, 시연 si=3 직접 보스 재도전 선행 유지 |
| 공통 자원 | 최종 HP/MP/ST/shield 최대치 + 공용 기동게이지  + 최종 돌진 스톡·chargeCd 0, 소비량/다른 스킬 CD 변화 0 |
| 사망 결과 | 현재 EXP `~~(P.exp*0.3)` 손실, iframes 300·화톳불 300f/r280 유지 |
| 비되감기 | P/INV/EXP·`G._sStats/deaths`·`G.stageTime`은 field snapshot 제외. 진행 보존 분기에서 현재 시간·사망 통계를 유지 |
| 검수 | 최종 source 30/30 + 기존 자원 회귀 5/5; realgame/native/visual/audio 미인수 |

필드 46개 key·파생 캐시·복사 경계와 영수증은 [CH1-1 보스 사망 진행 보존 정본](../4.1맵디자인+설정/CH1-1_BOSS_RESPAWN_PROGRESS_20261002.md), `tmp/mac-migration-runtime/continued-review-20261002/boss-respawn-backup/receipt.json`에 있다. 이 부록은 자원 공식·게이지 용량·스톡 공식을 바꾸지 않는다.


## 2026-10-03 source14 필드 복귀의 이전 보스 공격 정리

| 경계 | 현재 동작 |
|---|---|
| 실제 소비자 | `retryBtn.onclick`의 `_bossArena&&_preArenaBackup` 또는 해금 완료 CH1 필드 capture/restore 분기 |
| 네 임시 상태 | restore 직전에 `G._druidOrbs=[];G._druidOrbT=0;G._druidParryT=0;G._druidParryVolley=0;` |
| 타이머 의미 | 복귀 순간0. 이후 ORB 타이머는 기존 update로 증가 가능하며 영구0 유지 계약이 아님 |
| 필드 진행 | 기존46 key 복원·적/아이템 원 참조·지역/해금·열린 문 유지. 네 임시 공격 key를 backup에 넣지 않음 |
| 플레이어 후처리 | 기존 EXP30% 정수 손실→최종 applyStats→자원/기동게이지/스톡 완충, iframes300·화톳불300f/r280 유지 |
| 적용 제외 | 해금 전 일반 initStage·si3 직접 보스 재도전은 기존 분기 그대로 |
| 인수 | 실제 callback·capture/restore의 source 검수와 native 보스 사망/재입장 검수 구분. source11 앱은 별도 소스 |

보스/원본 필드를 초기화하는 변경이 아니라 이전 전투의 잔류 공격을 정리하는 후처리다. 정확한 key/소유·검증 경계는 [CH1 복귀 정본](../4.1맵디자인+설정/CH1-1_BOSS_RESPAWN_PROGRESS_20261002.md)을 따른다.


## 2026-10-03 source20 뇌전창 확정·취소·장면 정리

| 항목 | 현행 연결 |
|---|---|
| MP / aim | thunderStake click 시 MP<50이면 안내·취소, MP/stock/recharge/설치 효과 보존. 성공 비용50/stock1/rech720 유지. _clearHeldInput의 blur/hidden에서 _tsAiming=false, visible 및 기존 설치물 유지 |
| scene4 | _enterBossArena·일반 initStage·_fallenResolve 실제사망·retryBtn field복원분기에 G._thunderStakes=null;P._tsAiming=false. 네번째는 _refillRespawnResources 본문이 아님. 자동 부활 성공·field46key·기존 몬스터/문/아이템·자원 완충 공식 변경0 |
| 수치 / UI 경계 | 현재 maxT=900+(Lv−1)×30f, 충전720f/5stock(Lv10≥6), MP50/1000px/arc20f/0.0875. pDotDur로 창 수명 연장0. 기존 화면 desc의600px/10초는 아직 잔류하며 실제 값과 구분, 번역 후속 필요 |
| 검수 / 미완 | 신규12PASS(원본4PASS8FAIL)·focus20PASS·실제 boss helper/callback 회귀34PASS(새4/기존30). 정상4control 동등·fixture 오류0. source20 격리앱3395 포장·타이틀·전용HTTP200 확인. 실제 Mac 게임6단계/시각/청취/저장 인수는 미완 |

정확한 수치·소스 경계·원본 영수증은 [뇌전창 현행 계약](<../2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md>)의 source20 표를 따른다. 이전 source별 계약/미적용 후보는 당시 이력으로 보존한다.


## 2026-10-03 source26 — 재도전의 BGM 실패와 진행 분리

| id / 소비자 | 현재 오류 경계와 후속 처리 |
|---|---|
| R01 / `initStage` 마지막 스테이지 음악 | `try{BGM.play(BGM.stageKey(si));}catch(e){console.error("[BGM] stage start",e);}`. stageKey/play 동기 오류를 기록하고 함수 정상 반환. 앞선 맵 생성/캐시/조명 예외는 catch하지 않음 |
| R02 / `retryBtn.onclick` 필드·arena 복귀 음악 | 기존 컷신 보류 조건 그대로, 그 조건을 통과한 음악 호출만 catch/`[BGM] field retry` 기록. 공통 자원/idle/iframes300·화톳불300f/r280→최종스탯/완충→HUD/QS→G.on=true→준비된DB 저장 계속 |
| 진행·저장 | 기존 EXP30% 정수 손실·46-key 필드/열린 보스문/적 HP·지역/현재 P·INV·통계 보존. 해금 전 일반재시작 유지. dbSave 본문/schema/API 변경0; 저장 예외는 그대로 reject |
| 검수 | 신규16 원본4PASS/12FAIL→후보 신규16+기존34=50PASS. 생산50+기존음향36=86PASS. 실제 전체 retry handler·capture/restore 실행, 일반 initStage는 기존 생성대역 뒤 실제 마지막 음악 statement만 실행. 전체맵/native/기기청취·실저장 검수 아님 |
| 적용 경계 | 본편/Easy 각2호출부·+104B, 역치환source25전체exact. BGM 본체/stop/Promise·backend·음량·곡선택/RNG·공식·Q/E·보호2_3 불변. source26 앱3401 포장·타이틀·입력 전달 확인. source25 앱3400은 이전 코드로 보존; native 완주/청취/실세이브 인수 미완 |

정본은 `docs/6사운드디자인/SOUND_RETRY_PROGRESS_20261003.md`다. source25 사망·부활72PASS와 포장·타이틀 기록은 당시 인수 이력이며 이번 실제 Mac 사망/재도전 완료로 합산하지 않는다.


## 2026-10-03 source26 Mac 실행본 — 재도전 음악 오류 격리 포함

| 항목 | 이번 확인 범위 |
|---|---|
| source/실행본 | `d7cff1fb9ef030acfc837041f0ccea93756b4b54` / job `c3902d79-03c0-4c25-9e66-a43226d10288` / port3401. initStage 마지막·field/arena retry의 BGM 동기 오류 격리2caller 포함 |
| 포장/기동 | 입력7918/runtime340 재사용·execute1회, payload7916 stage/app 각SHA exact·복사당6645491177B. bootstrap2 exact/arm64실행파일5. 실제title AX/JPEG2704×1696·HTTP4×200/정적3현재원문exact |
| 입력 변화 | 처음ioreg locktrue였으나 현재flag없음/console·loginDone=true 확인. 새앱Return1 정상전달→world intro 진행. 인증·잠금해제시도0. stale9click는노드수명오류/전달0이며새화면AX로교정 |
| 검수 한계 | source86PASS는당시코드검수/이번포장test반복0. 캐릭터/CH1시작·전투/획득/장착·4지역/보스문·사망/부활/재도전·정상저장재로드/청취/visual 완주 미인수. 타이틀·인트로를그완료로합산하지않음 |
| 보존 | source25/3400 포함기존11검수앱 존재/ID/profile·save메타만대조. 옛전체재인벤토리/세이브내용읽기·입력0, source25는이새2caller미포함의이전본. 원사용자앱59376baf/08cac1ce 정확경로UNKNOWN/추측제어0 |

정확한 경로·SHA·증거와실제플레이 Gate는 `docs/13출시·마케팅/MAC_CH1_SOURCE26_CANDIDATE_20261003.md`를 따른다. 옛source17 부분플레이와source25 타이틀을이번같은후보완주근거로합치지않는다.


## 2026-10-03 source27 — 새 스테이지의 드루이드 공격 상태 초기화

| 정확 key / 적용 위치 | 현재 값·동작 | 보존 경계 |
|---|---|---|
| `G._druidOrbs` / 일반 `initStage(si)`의 기존 보스 패턴 정리 끝 | 새 빈 배열 `[]` | 이전 스테이지 ORB 객체는 수정·재사용하지 않음. 현 스테이지 ORB producer/접촉/피해/수명 코드 불변 |
| `G._druidOrbT` | 0 | 이후 실제 tick에서 다시 증가. 기존 110f/3발/6.8 frame 속도 불변 |
| `G._druidParryT` | 0 | 이전 스테이지 Q 리듬탄 누적 시간만 제거. 주기·수량·피해·Q/E 규칙 불변 |
| `G._druidParryVolley` | 0 | 이전 웨이브 번호 제거. 이후 기존 발사 시 다시 증가 |
| 양판 코드 | `G._lavaField=null;G._gwPillar=null;` 뒤 각70B 추가 | `_enterBossArena`·retry field 복귀에 이미 있는 네 초기화와 동일. 새 helper·전역정리·삭제0 |
| 다른 분기 | bosstest early-return는 기존 arena 초기화 위임 유지 | 사망 대기/부활 중 clear 추가0. HP50%/180f·si3 피날레·field snapshot46key·save schema·P/INV·플레이어 VFX 불변 |
| 검수 | 원본16개 중4PASS/12FAIL → 후보18PASS → 생산18+기존필드50+사망음향36=104PASS | 실제 전체 initStage 및 실제 ORB tick 원문 실행. 맵/적 생성·render/audio는 대역; 원본/후보 정상stage 전체G/P/events 동일. native·전체맵/청취 인수 아님 |
| Mac / 진행 | source27 코드 checkpoint 시점에는 새 앱 포장 전이었음(후속 현재 포장은 아래 표) | source26/3401은 이전 코드의 실제 숲1·일반 사망 retry·inventory 이력 보존. 이번 CUA 관측은 맥 잠금으로 중단, 사용자 해제 질문 대기. 보스/4지역/획득장착/저장재로드 미인수 |

정본·정확 SHA·대역/fixture·§23 보고는 `docs/8.1보스디자인바이블/DRUID_STAGE_TRANSIENT_LIFETIME_20261003.md`를 따른다. 기존 source14 복귀 정리와 source26 음악 예외 계약은 유지하며 이전 문단은 해당 시점 이력이다. native 보스 사망 시 문/몬스터 진행 보존의 완료 선언이 아니다.


## 2026-10-03 source27 Mac 별도 후보 — 포장/파일 검수 완료, 실제 기동 미실시

| 항목 | 현재 정확 상태 |
|---|---|
| 생산 코드 / job | `3c7dc6ab1cb0bc68cc3b969e27d06204fbe0f97f` / `953a5489-91eb-4d43-9c18-f05454ad27a7` / port3402. 일반 initStage 드루이드 ORB=[]/타이머3=0 각70B 포함 |
| 실제 포장 | frozen7918 입력/runtime340 재사용, 새job execute1회. stage/app payload7916 각각 전체SHA·coverage exact, 복사당6645491317B. source3 byte-exact/bootstrap2 역치환 exact/runtimearm64 실행파일5·plist ID 확인 |
| 증거 | physical 영수증31761B / SHA256 `94bcf7fe6ba1af2b39476511bc691b06b54c920ac636c8216f053ea638da385e` |
| 실제 기동 | 새앱 launch0/HTTP0/GUI입력0, profile/saveRoot 아직 존재하지 않음. CUA의 source26 화면 조회는 Mac 잠금으로 실패, 해제 질문 pending. 인증·잠금 우회0 |
| 인수 경계 | 생산104PASS는 이전 코드 검수이며 이번 포장 test반복0. 같은source27 CH1 시작·전투/획득/장착·4지역/보스문·보스 사망/부활/retry 진행보존·실저장·청취·시각 미인수 |
| 이전 실행본 | source26/3401 포함기존12검수앱 존재/plist ID/profile-save metadata만 확인. 내용hash·입력0. source26의 숲1·일반 사망retry·inventory는 이전 후보의 부분 플레이 이력이며 source27완주로 합산0 |
| 보존 | 기존67WIP/manager4/사용자23변경·원래게임/세이브 보존. 사용자 원래앱59376baf/08cac1ce 정확경로UNKNOWN/추측제어0. 삭제·cleanup·설치·새팀·새채팅0 |

앞선 source27 코드 checkpoint에서 “아직 포장하지 않음”은 당시 단계의 이력이다. 현재 실행 가능한 파일 후보는 준비됐으며 실제 Mac 플레이 인수는 대기다. 정확 앱/프로필·저장경로와 원문SHA는 `docs/13출시·마케팅/MAC_CH1_SOURCE27_CANDIDATE_20261003.md`를 따른다. source26 음악 예외·source14 field복귀·46key 진행 보존 계약은 그대로 포함한다.


## 2026-10-03 source28 — 보스 재도전의 이전 전투 지속 피해 정리

| id / 적용 경계 | 현재 정확 계약 |
|---|---|
| DOT01 / `retryBtn.onclick`의 일반 arena→field 및 해금 CH1 field 복귀 | 기존 `if(_fieldRetry)` 뒤에 `P.poison=0;P._rbPoison=[];P._rbBurn=[];` 추가. 본편/Easy 각44B. 사망 후 자원 완충 전에 이전 전투의 세 지속 피해만 제거 |
| 제외 / 기존 분기 | `_retryDruidFinale()`가 먼저 처리하는 si3 직접 보스 재도전 및 해금 전 일반 `initStage`는 변경0. field-only 기존 디버프·버프·1회효과 정리 블록은 그대로 |
| arena 플레이어 보존 | `_webSlow/_trapSlowT/_freezeSlow/burnT`, `_ioActive/_ioT`, `_altAtk/_altDef/_altSpd`, `_lastStandUsed/_reviveOnceUsed`는 기존대로 보존. 전체 field-only 블록을 arena로 이동하지 않음 |
| 피해/시간 공식 | `P.poison`은 idle tick에서 `sp*.02` 감소, 기존 중독 피해 `~~(P.mhp*.008)` 유지. `_rbPoison/_rbBurn`의 producer t600f·tick30f·총량/20·최대10중첩 불변. 일반 전투의 독 부여·소비·소멸 변경0 |
| 진행·저장 | 기존46 field key, 적/시체 HP와 원 참조·지역·열린 보스문·아이템·현재 INV/EXP·시간/사망 통계 보존. EXP30% 정수 손실·iframes300·화톳불300f/r280·최종 applyStats→완충→DB 저장 순서 유지. save schema/API 변경0 |
| 검증 | 실제 전체 retry/capture/restore+전체 hurtP+AST 원문 DOT3분기/iframes 감소 실행. 원본68검사54PASS/14FAIL→후보68PASS→생산 관련3파일89PASS. 신규18개 중 정상 전투6control 유지; 새sp1/2 재도전12개는 이전 지속 피해를 차단 |
| 검증 한계 | 필드/장비·pet/visual/audio/DB/stat 재산정은 fixture 또는 경계 대역. 전체 game loop·native·실저장·청취·시각 완주 검수 아님. 실제 시연 앱3402는 source27이며 source28을 포함하지 않음 |

원자료는 `tmp/mac-migration-runtime/continued-review-20261003/source28-retry-dot/`의 원본 백업·baseline/candidate/production 기록이다. 수정 전에는 부활 무적300f 동안 timer만 감소한 뒤 잔여 독/화상이 HP 또는 쉴드를 다시 깎았다. 이번 수정은 해당 복귀 시 지속 피해만 끊으며 새 생애의 정상 전투 DOT는 그대로 작동한다. 보호2_3·Q 전용 magic 패링·E 불가·어택티켓 금지는 변경하지 않았다.


## 2026-10-03 source28 Mac 파일 후보 / source27 실제 플레이 후속

이 절은 이전 포장·잠금 대기 이후의 상태다. 이전 날짜별 기록은 당시 이력으로 보존한다.

| 항목 | 확인한 상태와 남은 검수 |
|---|---|
| 최신 파일 후보 | source28 / job `2242869e-903a-4917-a38c-e0f6c02ff47c` / port3403 / 입력 커밋 `f376e3ce9c3524fa7874078c6738e1e5ab8a1e5b` / **PACKAGED_NOT_RUNTIME_ACCEPTED** |
| 포함 코드 | field 복귀의 `P.poison=0;P._rbPoison=[];P._rbBurn=[];` 양판 각44B 및 이전 initStage 드루이드 초기화. 생산89PASS는 경계 대역 포함 코드 검수 이력이며 실제 앱 완주 증거가 아님 |
| 실제 파일 검수 | frozen7918 입력 중 bootstrap2 파생. stage/app payload7916 각각 전체SHA 일치, source3 exact, bootstrap2 전체 역치환 exact, arm64 실행파일5와 plist ID 확인. 재빌드·검사 반복0 |
| source28 실제 플레이 | launch0/native입력0. 물리 검수 시 새 profile/saveRoot 미생성. 전투·보스 사망/부활·열린 문/몬스터 보존·실저장·청취·카메라 인수 미완료 |
| source27 실제 장착/일반retry | 정상 전사 시작→연습 건너뛰기→CH1 첫 필드. 장착4건 후 CP1857. 일반 사망→다시 일어서라로 HP549/549 MP376/376 SP279/279 및 장비 유지 확인 |
| source27 마지막 관찰 | 첫 처치1/32, EXP2/15, 악의997, 시간55초, HP0. Controls 설정 화면에서 대기. 앞선 완충 관찰을 현재 생존으로 계산하지 않음. 아이템 줍기·4지역·보스 해금/사망 미인수 |
| 보존 | source27 포함 기존13 검수앱 존재/Info.plist ID 확인. 기존 profile/save 내용 변경0. 원사용자 앱 정확 위치 UNKNOWN; 전체 원본hash 보존 검증으로 확대0 |
| 물리 영수증 | `tmp/mac-migration-runtime/continued-review-20261003/ch1-source28-build/physical-receipt.json` 32859B / SHA256 `2b677de448db516036e2d32069f5b326e5aec535104f7db0072c57b5d21e5bda` |

파생 port3403·격리 user-state는 원본 서버3333·저장 schema 변경이 아니다. source27 부분 플레이를 source28 제품 인수로 합산하지 않는다. 상세 successor 경로·SHA·장착 표는 `docs/13출시·마케팅/MAC_CH1_SOURCE27_CANDIDATE_20261003.md`의 후속 기록을 따른다.


## 2026-10-07 사망 메뉴의 재도전 1회 소비 — ROOT-CH1-RETRY-MENU-CONSUMER-20261007

기존 리스폰 자원 완충과 field 진행 보존 앞에 현재 사망 메뉴의 입력 소비 계약을 추가한다. 완충 공식이나 분기·비용을 바꾸는 변경은 아니다.

현재 `game.html` working은 4,084,755B / `7e4002066c089e2a0d3fc6a6d2af5499d75aa4a3e677b08e4d10c9552f5080ec`, root owned HEAD+변경 blob은 4,084,570B / `8ba1a816d1a656d646f2967edc0431c087075d73b6bbedb75532d2aa0756402a`다. shared game의 타인 WIP185B를 보존한다. 변경은 현재 사망 메뉴가 첫 재시도 입력을 동기 소비하는 UI 접점이다. 기존 본문·EXP·field snapshot·자원·음악·save schema/API/backend를 변경하지 않는다.

| 접점 | 현재 정확 계약 |
|---|---|
| 실제 handler | `retryBtn.onclick=async function _retryFromDeath(){...}`. 이름은 onclick 함수의 selfidentity용이며 새 공개 global API/외부 retry entry가 아님 |
| 현재 button | `$('retryBtn')`가 connected이고 `button.onclick===_retryFromDeath`여야 함. 교체된 버튼/이전 callback은 진행하지 않음 |
| 현재 death | `$('death')`가 connected이고 class `on`, deathReplay가 있으면 `on` 없음, P 존재·`P.s==='dead'`, G 존재·`!G.on`이어야 함 |
| 거절 | guard 실패 시 기존본문/EXP/save/focus/game helper 호출 없이 return. 새 boolean API를 도입하지 않음 |
| 동기 소비 | guard 통과 즉시 `death.classList.remove('on')`. focus blur와 closePanel(settings)·_rootRiftInvalidate 등 게임 helper 호출보다 앞서 현재 메뉴를 소비하므로 같은 사망 메뉴의 재진입은 거절 |
| focus | `document.activeElement`가 있고 death 하위에 포함되고 blur 함수가 있을 때만 blur. death 밖 focus를 옮기거나 button 전체를 disable하지 않음 |
| 설정 일시정지 정리 | 소비/blur 뒤 settings.on일 때만 기존 `closePanel('settings')` 호출, 그 뒤 `_rootRiftInvalidate`. 기존 closePanel은 settings class on 제거·G.paused=false이며 OPT는 그대로. `_drReset`은 pause 해제 함수가 아니며 closeAllPanels/다른 panel 정리0 |
| 기존본문 순서 | 설정 정리 뒤 `_rootRiftInvalidate('retry')`→victory on 제거→`_drReset()`→기존 `_deathDlgStop`→EXP clamp→기존 si3/field/initStage 분기→초기 자원·idle/iframes/stocks/bonfire→applyStats→최종 refill→HUD/QS·G.on→기존 await dbSave. 이 기존 본문 순서는 바꾸지 않음 |
| 일반 복귀 계약 | 기존 EXP=`max(0,P.exp-~~(P.exp*.3))`; field46key capture/restore·현재 P/INV/지역/해금/열린 문 유지. 초기 자원/idle·iframes300·chargeStocks/chargeCd0·화톳불300f/r280 뒤 applyStats→최종 완충→HUD/QS·G.on→기존 dbSave |
| 자원 | HP=mhp, MP=mmp, ST=mst, shield=mshield, 공용 기동게이지=최대, chargeStocks=maxChargeStocks/chargeCd0이라는 기존 리스폰 계약. 공식/확률/쿨다운 수치 변경0 |
| repeat keydown | retryBtn의 `e.repeat`가 참이며 `e.code`가 Enter/NumpadEnter/Space일 때만 preventDefault+stopPropagation. 첫 입력/Tab/다른 키/패드 click 경로는 기존대로 |
| 저장 대기/새 사망 | 새 `_retryBusy`/finally/전역 state0. 첫 호출의 `await dbSave`가 pending이어도 실제 다음 사망의 현재 death.on/P.dead/!G.on이 다시 성립하면 새 메뉴는 독립 소비 가능 |
| await 이후 | 기존 handler의 await 뒤 UI mutation0, 저장 reject를 새 catch로 삼키거나 메뉴 재개·flag reset하지 않음. backend의 늦은 save 효과/실 디스크 ACK/요청 직렬화 보장은 UNKNOWN |
| 유지 | field46key/schema/version/API/backend·저장 본문·맵/AI/충돌·자원/EXP/음악/전투·Q/보호2_3 변경0, 새 RAF/timer/state0 |

한 번 소비하는 단위는 현재 표시된 사망 메뉴다. 모든 재시도를 앱 생애 동안1회로 제한하거나 저장 완료 전 다음 실제 사망을 막는 잠금이 아니다. 같은 onclick을 외부에서 다시 호출하는 것과 실제 새 사망 뒤 새 메뉴를 소비하는 것을 구분한다.

| 검수 | 현재 상태/경계 |
|---|---|
| 이전4249 CPU | 최초 Node1/VM21, 8그룹35복합조건 PASS/FAIL0/미도달0/unhandled0/exit0. 이 source 뒤 settings pause 반례를 추가 보정했으므로 최종7e4002 전체 PASS로 승격하지 않음. 재실행0 |
| 최종7e4002 CPU | 최종7e400 source의 settings 한정 최초 Node1/VM3, 3그룹6조건 PASS/FAIL0/미도달0/unhandled0/exit0. 실제 전체 final handler+기존 closePanel을 추출하되 새 settings 소비만 검증; normal init/stats/refill/finale/QS는 통제 ports·_dbReady=false. 이전4249 35조건은 재실행하지 않았으며 clean41/최종전체PASS로 합산하지 않음 |
| 신규 native | 최종7e400 source 최초 Chrome/context/page 각1: normal field 실제 적 피해10회→frame1109 HP0/P.dead/G.on false/death.on true의 자연사망 N1 PASS1. trusted Escape로 settings.on/G.paused true 관측은 재도전 전조건이다. trusted Tab40회에도 BODY에서 retryBtn 초점 미도달: phase/setupFAIL1·conditionFAIL0·N2/N3未도달2·exit1. 실제 retry activation/소비·settings closure·pause release·부활·재도전 후 이동·저장 미인수, 재실행0/추가Chrome0 |
| visual | root가 death/first-failure PNG를 직접 판독: 중앙 “부활 불가 1s” countdown과 설정/사망 패널 겹침으로 RETOUCH. death.on snapshot은 retry 버튼이 visible/focusable이라는 증거가 아니며 Tab 미도달의 원인 UNKNOWN. 실제 재도전/전체 visual PASS 인수0 |
| 브라우저 전 준비실패 | 최초 --root-ack 누락으로 CLI guard exit1/Chrome0/조건0/제품FAIL0. 원자료 보존 후 기존 root GO를 명시 인자로 공급한 실행이 위 최초 브라우저1회; 준비오류를 native condition FAIL이나 제품 suite 재시도로 합산하지 않음 |
| 네트워크/GL/저장 | pageerror0/HTTP failure0이나 의도적 external font 차단3·intro media abort3는 별도 관측이다. GL=`UNKNOWN_NO_RENDERER_WRAPPING_OR_NEW_CONTEXT`로 실GL0 주장0. synthetic mats2는 서버 도달0, 실save0·durable ACK 미인수, physical GPU 해제 UNKNOWN |
| 이력 | 이전 source별 retry/EXP/field46key/자원/음향 PASS는 해당 epoch 이력으로 보존. 이전 AIM28/native3/search51과 camera검사를 이번 메뉴 소비 성과로 재실행/합산하지 않음 |
| 미인수 | 실제 retry activation/repeat guard/settings closure/pause release·부활/완충/재도전 후 이동·pending 실save 중 다음사망 생애·boss death/열린문·정상 route 전체/native6·audio/reward/durable save·backend 늦은 save 효과·시각 전체 PASS. N1은 자연 필드사망만이며 boss 사망/native6로 승격하지 않음 |

외부 증거 디렉터리는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-main-retry-menu-20261007/`이다. 이전 `implementation-receipt.json` 1,914B / `2491d197877b441d5703306b3ccf4a9c1b289d6d001ab2910f18c1a05310d909`와 `retry-cpu-receipt.json` 4,373B / `05082a5cef7fef3d8848d57e652567c5452a1fd3f74b896a2d19c515ba8ceae4`는4249 source 이력이다. 현재 `implementation-final-receipt.json` 2,737B / `781b5167f12c6f855cffd63998982e878799a345ee065c77eca5d3c8bdafeec6`의 exact2치환/inverse exact/foreign185 보존을 따른다. Git 사실은 같은 디렉터리 `remote-preservation-receipt.json`의 실제 normal commit/push/원격 정확 SHA를 참조하며 자기 commit SHA를 순환 삽입하지 않는다. 이 증거 epoch는 checkpoint 전이며 deploy0이다.

최종 settings 한정 원문 `settings-receipt.json` 4,178B / `f2c077c5c7a57faa3df8e9c095f549f52eecd6bb6ec772434b0965cf31c80a9d`와 `settings-result.json` 7,267B / `812f248743b349671f522578d074d2ed459fcf596a74f66c2ec7a3c9fc0550d6`, 실제 native `native-retry-result.json` 133,977B / `b2dee048ac3e347415e7437c7df68daf8014e39ff8ca48677e7ba414bc780d55`, 브라우저 전 `native-cli-preflight-failure.json` 438B / `bc42a5c8fdea6b50bb73e4ec0e82949abade971f8bd16e508d2fe95b9f137d4a`, `validation-receipt.json` 6,019B / `3a367fd511c8819cbe74c2f2d75fa77c25ed4be3f820b7ee496d0f3b9f4d7978`, `visual-verdict.json` 5,268B / `e56ffe0466fd799cc972ff2cf63d883018170ff1604a3b5126fb930ea8af6aa7`를 별도로 보존한다. 새 editor N3 기대거절 원문 `codex-editor-import-official-manifest.json` 502B / `316193c436db197ec40a28b0e80dae5035b8e1718cde5debf01114ea123c6712`는 root가 미채택 보존한 자료이며 필수 hunk0·이번제품/검수채택0이다.


## 2026-10-07 사망 메뉴의 키보드 초점 — ROOT-CH1-DEATH-KEYBOARD-FOCUS-20261007

키보드가 현재 사망 메뉴의 유효 버튼에만 기본 활성화를 넘기도록 입력 경계를 보충한다. 자원 완충과 재도전 순서의 변경이 아니다.

현재 본편 `game.html`은 4,086,254B / `82262b4215e0dba0b1bfdef825b499e302ff3dd81b4b060d323475ea2b86444d`이고, 총괄 소유 변경만 담은 파일은 4,086,069B / `900e8683eddaa7caac72e1685cdbd2f13603aa457dc7e82ac69a82025e7fdc56`다. 본편의 다른 담당 변경185B를 보존한다. 새 변경은 `_handleDeathMenuKeyboard(e)`와 기존 window `keydown` 연결1곳, 기존 `keyup` 끝의 Space 연결1곳이다. 쉬운판과 기존 재도전 본문·자원·저장 순서는 변경하지 않는다.

사망 메뉴에서 Tab·Shift+Tab으로 현재 보이는 활성 버튼만 순환한다. 유효한 Enter·NumpadEnter·Space는 브라우저의 기본 버튼 클릭에 맡기며 직접 `.click()`을 호출하지 않는다. 재생 중이거나 분리·교체·숨김·비활성 상태가 된 버튼의 기본 활성화는 막는다. Space는 keyup에서도 다시 검사한다. 정확한 대상·제외 조건은 `docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md`의 이 절을 따른다.

이전 `ROOT-CH1-RETRY-MENU-CONSUMER-20261007` 절은 당시 소스의 이력으로 보존한다. 그 절의 “Tab 유지”는 이전 재도전 소비 변경의 범위를 뜻하며, 현재 사망 메뉴의 Tab 순환에는 이 새 절을 적용한다. 이전 검수 횟수와 이번 결과를 합산하지 않는다.

기존 재도전 소비가 메뉴를 먼저 닫는 순서, `closePanel(settings)`와 `_rootRiftInvalidate`의 순서, 자원 완충·필드 스냅샷·EXP·DB 저장은 그대로다. 새 helper는 `.click()`이나 재도전 본문을 직접 호출하지 않는다.

| 새 검수 | 이번 범위의 결과 |
|---|---|
| 한정 CPU | 최종82262에서 Node1·VM52, 실제 helper+전체 keydown/keyup·통제DOM. 7그룹·55조건 통과/실패0·미도달0·exit0 |
| 실제 브라우저 | 최초 Chrome/context/page 각1, 새2조건 통과/실패0·미도달0·준비 실패0·exit0. Tab1 초점→Enter 기본click→death/settings 닫힘·pause 해제→W 2프레임 이동·키 해제 |
| 오류·저장 | 소스3개 전후 정확 일치, pageerror0·HTTP실패0. 의도적 글꼴 차단3·intro 중단3 별도. GL UNKNOWN. synthetic matsPOST2 서버 도달 전 차단, 실제 서버 변경0·실저장 ACK0 |
| 시각 판정·한계 | 파란 재도전 초점 표시 식별. 재도전 직후 사망 화면 전환과 HUD·금빛FX 겹침으로 RETOUCH. 안정된 전환 종료 미인수. Space keyup·Shift+Tab·리플레이/로비·보스방/전체 native6·음향·실저장은 별도 미인수 |

자연사망은 이번 브라우저 검수의 준비 조건이며 이전 자연사망 성과를 다시 합산하지 않는다. 44c9 준비 구현은 실행0이고, 이전 재도전 검사와 이번 CPU·브라우저 결과도 합산하지 않는다. 브라우저 전 메타데이터 준비 오류1회는 Chrome0·제품 실패0으로 분리한다. 추가 검수 실행·자동 재시도는 없다.

정확한 소스·구현·검수 원자료와 정상 커밋·push·원격 SHA는 외부 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-death-keyboard-focus-20261007`의 `implementation-final-receipt.json`, 최종 `validation-receipt.json`·`visual-verdict.json` 및 `remote-preservation-receipt.json`을 참조한다. 문서 작성 시점의 계획을 원격 보존 완료로 표시하지 않는다.
