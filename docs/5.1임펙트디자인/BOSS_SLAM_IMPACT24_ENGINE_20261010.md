# 보스 내려찍기 착지24 — 기존 리소스의 본편 재사용 (2026-10-10)

`ROOT-ENGINE-BOSS-SLAM-IMPACT-20261010`: 실제 `updateE case'bossSlam'` 착지 중심에 승인된 중성 물리 임팩트24를 연결했다. 기존 백열핵·회색 돌/낮은 먼지·소산 그림을 공유하며 새 그림·이미지·등록·JSON·runtime·loader/helper 수정은0이다. 이 착지 분기는 기존 독립 atlas/원8장이 없었다. 기존 파티클과 shock wave를 유지한 새 소비 경로이며 전체 효과24나 AAA급 완료가 아니다.

## 변경과 보존

| 항목 | 실제 현재 계약 |
|---|---|
| 호출 위치 | `e.st2<=0` 충돌에서 원26파티클 이후, recover40/`_druidSlamDisplayRelease(e)` 직전, 착지당1회 |
| 새 호출 | `playVFXAng('boss_meteor_hit',e.x,e.y,150/768,2,0,false)` |
| 중앙 표시 | e.x/e.y 중심150×150, angle0/isSkillfalse. 피해 범위나 shock wave 반경 표시가 아니다 |
| 원 피해 반경 | `_slamR=1000+G.stage*30+(e._bossPhase||0)*80`; `_slamD<_slamR && P.iframes<=0`, 기존 parry/charge 분기 유지 |
| 원 피해·반격 | 일반 `~~(e.atk*2.2*elMul(e.el,ar().el))`·KB14; 반격 `~~((P.baseAtk+(wp().atk||0)+enhMulAtk(wp().enh||0))*4*pParryDmg())`·stunned80·원 hurtE/bank/doParry/poise20 불변 |
| 원 무기 진행 | `_slProg=1-e.st2/8`, `_weaponAng=-1.2+_slProg*2.4`, 착지 reset0 유지 |
| 원 충격·카메라 | `e.shockR=0/e.shockMax=_slamR`, shake=`14*OPT.shake/100`, hitStop=`~~(8*OPT.hitStop/100)` 불변 |
| 원 갈색 입자 | 16개/위치 radius15/방사속도6/색#996633/size4+random*3/lifetime14, RNG16회 |
| 원 주황 입자 | 10개/위치 e.x/y+(random-.5)*40/속도x=(random-.5)*3,y=-random*5-2/색#ff6600/size2+random*2/lifetime10, RNG50회 |
| 원 입자·회복 | particles26·입자 RNG66회·recover40·기존 opaque `_druidSlamDisplayRelease(e)` 호출 유지. helper body 재검사/수정0 |
| 공유 resource | name/id boss_meteor_hit, `assets/vfx/boss/boss_meteor_hit_24_20261010.png`/`.clip.json`, format exoduser-atlas-clip/version1/6열4행/24장/셀768²/전체4608×3072/fps30/loopfalse/durationSeconds.8 |
| 기존 시간 소비 | speed/frameTime2/maxFrames24의 명목48 render 진행에 기존 normalizedphase 매핑. 그림24·resourcefps30·화면FPS 구분, 안정game초·자연재생24전부 노출 보장0 |
| 공유 이미지 | 이미 등록된 same Image/clip/helper/cache를 사용, 새 image/texture·crop cache 생성 경로·clock/RAF·공통3API 변경0. 실제 GPU 할당 검수0 |
| 폴백 | 기존 같은 새PNG의 direct24grid와 JSON 소비를 유지. 이미지 미준비/실패는 factory no-op이며 원26파티클·충격·전투·회복은 유지. 구8장 폴백 없음 |
| 원 렌더 정책 | active visual pool20·일반 draw budget5·skill exemption/cull/압축/수명/GLadditive/Canvaslighter 유지. 공격 제한이 아니며 동시 착지 모두 가시 보장0 |
| 원 기타 계약 | Meteor producer/기존Druid clips·sourcePNG·scene/nav/LOCK·전투RNG·SFX·save·Q전용blackBean/E불가 불변. 어택티켓0 |

## 확인과 남은 품질 작업

새 착지 producer의 실제 whole source만 before/after controlled fixture로 처음 검수했다(Node1/6그룹73조건 PASS·source actionable/blocking0·runtime 준비 오류0). 원26파티클의 값·RNG66/판정·무기·충격·회복 관찰값이 같고 새 호출이 착지당1회인지 확인한다. 등록·loader·helper·render·기존factory·완료PNG/source/suites 재실행0. `runtime/source-peer.json`이 이번 source epoch의 그룹/조건/준비 실패/결과 정본이다. 첫 ROOT 수정 준비에서 indentation-specific anchor Assertion1이 제품쓰기·실행 전에 발생했고 actual unique line indentation으로 정정했다. 제품 실패/PASS와 합산하지 않는다. 제품 실행 후 코드 재수정0.

이 리소스의 원화·90px 독립 proof는 [기존 제작 정본](BOSS_METEOR_IMPACT24_ENGINE_20261010.md)에 보존된 이전 단위다. 이번150px 실제표시/정상 줌·전투 조화·GPU·동시 성능·청취·실save는 미검수다. 기존 그림24를 복제하여 늘린 작업이나 신규 제작으로 세지 않는다. 새 생성/업로드/견적/잔액조회0. 기본 JSON도 변경하지 않아 에디터 roundtrip 재실행0.

**VISUAL VERDICT: RETOUCH / UI_NOT_ASSESSED** — 새 실제150² 착지와 원갈색/주황26파티클·큰 shock wave의 조화 및 동시성능은 인게임에서 확인해야 한다. CPU/source PASS를 시각 PASS·렉없음·AAA 인수로 대체하지 않는다. 기존 native/3387 경계 우회0, 사용자의 게임·서버·save 조작0.

의무 docs 키워드 검색1회/12문서17짧은행/giant0. 플레이어 giantSlam·합체 스킬·다른 보스/맵 매칭은 별개이며 해당 수치나 설계 변경0. 기존 Slam 복귀 단위의 “FX 불변”은 당시 변경 범위 이력이다. 이번에는 복귀 receipt/공통cap20을 유지하며 착지 표시 호출1개만 추가했다.

최종 실제 소비·docs·보존 영수증: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/engine-boss-slam-impact-20261010/completion.json`.
