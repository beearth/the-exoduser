# 화마귀 대형 불탄 Q 임팩트24 연결 — 2026-10-10

기존 승인 불꽃24 원화를 화마귀 불탄 Q 표시에도 재사용한다. 새 원화 제작이나 접촉·비행·물 Q 변경은 아니다.

| 항목 | 실제 계약 |
|---|---|
| 원표시 | FD 불탄 Q의 기존표시는 fire16이 아니라 `_dark02Impact(_px,_py)`→`_addBoom(...,'dark02')`→Dark_MediumImpact.png4×4/16이다 |
| 선택 | `_resolveBigEnergyParry`: 물 fbEnergy&&EL.I의 기존 waterEnergy 우선 유지, 그외 fdEnergy&&EL.F만7번째 impactKind=fireEnergy. doParry에서 impactKind·forceQ===true·_parryEl===EL.F 모두 통과해야 bossFireQImpact 선택 |
| 표시 | r80/mt72/최대240²·기존t/mt·size3r×sqrt(min(1,progress×3))/alpha=max(0,1−.5progress)/중심·무회전·부모blend상속. 실제게임초/24FPS/자연24장전부노출 보장0 |
| 소비 | BOOM 신규bossFireQImpact map=Dark_MediumImpact.png. 원Darkimagecomplete 먼저 guard→기존 `_drawBossFireImpactClip` 재사용. 기존helper의 원Firecomplete 가드도 그대로 유지. 새ready는 승인fire24 한셀/원generic0회 |
| 폴백 | 새pending/invalid/helperfalse/drawfailure·원Fire미준비는 원Q Dark16 exactgeneric. 원Dark미준비는 이전no-display. 접촉용 bossFireImpact의 원Fire16폴백과 구분 |
| 리소스 | `data/vfx/boss_fire_impact24_20261010.json`/`assets/vfx/fieldboss/boss_fire_impact_24_20261010.png`: 기존6×4/24/640²/3840×2560/참고fps16/nonloop1.5초. Q수명72÷60=참고1.2초에normalizedphase로배분; 새JSON/PNG/Image/cache/runtime/loader/helper편집0 |
| 로드 | 해당Q 새분기에서 기존loadprefetch, 동일sharedpromise/Image1/cache24 재사용. 새등록/중복Image0·실패자동retry0. 등록 시네트워크0 계약 유지 |
| 보호 | 일반Q/Dark02·waterEnergy24·waterBean·E·다른FD속성·FD접촉24/비행24·blackBean Q전용 규칙 유지. `_splitParriedBigEnergy`5발/자원×10·44arm RNG순서·Q음향/플래시/파티클/분열피해·수명/pool12/cull/save 불변 |
| 제작 | 승인resource consumer 재사용. 생성job/신규원화/PNGdecode·hash/옛suite/에디터왕복재실행0. 새그림24 제작으로 세지 않음 |
| 최초검수 | 최초 actualwhole resolve/doParry/addBoom/Dark02/BOOM/update Node1/epoch1/5그룹24PASS·source준비/실행FAIL0. 전후 Q state·44factoryRNG·공통SFX/12parts·자원×10·분열호출인수/순서·strictQ/EL.F·일반Q/waterQ/E/다른FD/rainbow·원72종료/cull·Dark16폴백을검수했다. 원split5발본문은불변/재실행0·호출계약검수만. 별도4hunk 정적peer finding0. 코드apply전preflight키 KeyError1은쓰기·실행전준비이력/제품첫source후수정0. completedFirehelper/loader/runtime/PNG 실행·hash·decode/에디터왕복0. |
| 시각 | UI_NOT_ASSESSED / RETOUCH. 승인fire24 resource 재사용의 Q선택/원geometry 계약까지만연결했다. 새Q240px의시각·정상줌·실전혼합·GPU·동시성능·청취·실save는미검수다. 직전contact660px proof나 source PASS를 이번Q의시각인수로 대신하지 않는다. |

**VISUAL VERDICT: RETOUCH / UI_NOT_ASSESSED.** 실제main 정상줌·전체보스전·GPU/동시성능·청취·실save·AAA는 미인수다. 직전 접촉660px 미리보기를 이번 Q240px 검수로 사용하지 않는다.
