# 보스 유성 착탄24 — 현행 엔진 소비 (2026-10-10)

사용자 승인에 따라 실제 `updateE case'bossMeteor'` 착탄에 고품질24장 효과를 추가했다. 이전 이 지점에는 등록된 임팩트 아틀라스가 없었고 `addParts15`·화면 흔들림·효과음만 있었다. 따라서 원8→24 교체가 아니다. 원화와 표시 연결은 완료했지만 실제 전체 보스전·정상 줌·동시 성능·청취·save·AAA급은 미인수다.

## 본편 계약

| 항목 | 현재 값·적용 위치 |
|---|---|
| 실제 producer | `e.st2<=0`의 `for(const mt of e.meteors)`에서 기존 `addParts(mt.x,mt.y,e.col,15)` 직후 착탄당1회 |
| 새 호출 | `playVFXAng('boss_meteor_hit',mt.x,mt.y,90/768,2,0,false)` |
| 기존 전투 | 충돌반경45·iframe/charge/parry/damage/knockback 불변 |
| 기존 표시·종료 | particles15·`G.shake=6*OPT.shake/100`·루프 후 `SFX.groggy`·meteors=[]·recover60 불변 |
| 기존 경고 | `bossMeteorWind` tele/50f 및 meteor 진입20 불변 |
| 생성 개수 | `~~((6+~~(G.stage*.8))*(1+(phase-1)*.3))`; 해당 producer의 명시적 cap 없음. 좌표·t50·운석당 RNG2회 불변 |
| 이름·경로 | name/id=`boss_meteor_hit`, `assets/vfx/boss/boss_meteor_hit_24_20261010.png` 및 `.clip.json` |
| 리소스 | format=exoduser-atlas-clip/version1/6열4행/24장/셀768×768/전체4608×3072/fps30/loopfalse/durationSeconds.8 |
| 기존 표시 시간 소비 | frameTime2/maxFrames24의 명목48 렌더 진행에 `(frame+fraction)/maxFrames`를 재매핑. bornGameTime 유무에 따라 기존 mix 또는 t/frameTime 사용 |
| 장수와 FPS | 24그림, 리소스fps30, 화면FPS는 서로 다르다. 안정된 .8게임초·자연 재생24장 전부 노출·24화면FPS 보장0 |
| geometry | 고정90×90, mt의 worldcenter, angle0/isSkillfalse, 기존 alpha·GLadditive/Canvaslighter 유지 |
| 이미지·캐시 | registerVFX Image1개와 기존 onload 테이블 게시. loader는 JSON/runtime만 준비(Image0), 실제 helper에서 동일 sh.img의 inset1 crop24를 최초 검증·동결캐시한다 |
| metadata 폴백 | PNG ready/JSON pending 또는 실패면 같은 새 이미지의 직접24격자. 구8장 폴백은 존재하지 않는다 |
| 이미지 실패 | 등록 미준비/실패면 새 factory no-op, 기존 particles15·shake·SFX·전투는 동작 |
| 동시 표시 | 기존 active visual pool20·일반 draw budget5·skill exemption/cull/압축/종료 유지. 공격 제한이 아니며 모든 동시 착탄 표시를 보장하지 않는다 |
| 기존 기타 계약 | 전투·RNG·SFX·save·원PNG·scene/nav/LOCK·Q전용 blackBean/E불가 유지. 공통 runtime 변경0 |

## 제작 및 확인

Higgsfield `gpt_image_2_5 / sunburst / max / 4k / transparent / 3:2 / count1`, job `a45e3d61-8fe6-4bba-ac94-807f02b75364`, 견적15. 실debit/잔액 반복조회·추가job0. 기존 착탄PNG가 없어 참조 업로드0이며 새 백열핵·회색 돌·낮은 먼지를 제작했다. 원본3504×2336/5,632,121B/SHA256 `6a05ee84aa375642aeb111c099a7a71f0bcbdb03fd194b69819a12a011e893b8`. 원본 정체성과 기존 e.col 파티클을 유지하는 별도 충돌 표시다.

공통 source crop `[-225,-226,284,118]` (509×344), scale1·투명padding으로 768²에 담았다. 초기 nominal584 셀 분할은 row 경계의 자기 먼지를 자르는 finding이었고, 같은 source의 소유 연결영역을 직사각 crop으로 회수했다. production mask/알파 수정/재샘플0. 자기 alpha>16/>4 손실0·이웃>16/>4 혼입0·edgealpha0·24가시 변화. 분리 돌의 소유·후기 원점은 추정으로 남는다. 투명 원화는 검정/회색 실제RGBA 합성으로 판독했다.

| 독립 검수 epoch | 실제 결과·한계 |
|---|---|
| 첫 실제 source | whole registration/loader/helper/producer/factory/render + actual runtime, Node1/10그룹140조건 PASS·준비 오류0·source actionable/blocking0. 제품 코드 실행 후 재수정0 |
| 첫 실제 PNG | 실제 PNG를 actualmain의 새 whole helper로 90px에 표시한 독립 Canvas 검토. 25조건 결과는 외부 first-real-pixel-check.json에 기록. 전24phase 선택은 자연 재생 인수가 아니다 |
| 에디터 | 새 clip의 실제 기본 resource roundtrip1조건을 별도 epoch로 기록한다. frameWidth/Height/pivot 보조필드 재출력 인수는0 |
| docs | 최초 키워드 검색1회/10문서10짧은행/giant0. 현행 보스5계약은 유지하고 새 표시 정본을 연결한다. 무관한 스킬·펫 이력·시네마틱 변경0 |
| 본편 인수 | actualnormalmain/정상 줌/전체 보스전/GPU/동시 효과 성능/청취/실save/AAA 미인수. 기존3387·native 경계 우회0 |

**VISUAL VERDICT: RETOUCH** — 백열 핵에서 낮은 회색 돌·먼지와 소산까지 순서가 읽힌다. 90px 초·후기 가독성, 분리 돌 소유 및 후기 원점 추정, 기존 particles15와 전체 전투 조화·동시 성능은 미인수.

외부 90px detail/24phase/playback proof는 실제 main drawhelper의 독립 검토이며 인게임 녹화가 아니다. 기존 파티클15와 전체 전투 조화·동시 표시 성능은 실제 보스전에서 검토해야 한다. 24는 출발점이며 필요한 장수는 효과 길이와 실제 성능에 따라 정한다. 프레임 복제수채우기·렉없음·전체 효과 교체·AAA 완료 주장은0.

제품 PNG 4,112,816B/SHA256 `a3493fc4ce33b56df214f150ab977a8ae4b205dec9733453908008cf6dbf8977`; JSON317B/SHA256 `f41a5287264ce9be36ac75e70a65f68c0877e9dbd6e45102f1985326c3a97512`. 원점384,384(.5,.5). 보조 frameWidth/Height/pivot 재출력은 인수하지 않는다. 독립 WebP는49 source snapshots→25 encoded/833ms이고 실제 본편 녹화·게임 시간 인수와 구분한다.

최종 code/assets/docs·보존 영수증: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/engine-boss-meteor-impact-20261010/completion.json`. 원본 및 packed PNG/JSON 바이트 핀은 외부 `animation/published.json`이 최종이며 별도 과거 unit의 PASS와 합산하지 않는다.
