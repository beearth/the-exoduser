# Typed rand main 디스크 소스 통합 — 2026-10-17

인수된 owner+등록10 누적 소스를 main·I·R에 정렬하는 계약이다. 실제 최종 HEAD/tree/parent/branch/upstream·파일 OID/SHA·적용 순서는 이 단위의 final-sync-receipt.json에 기록한다. 디스크 소스 정렬은 열린 게임·프로세스·export·PC 또는 최신 전체 게임 완료 증거가 아니다.

| 항목 | 정확한 기준 |
|---|---|
| 원 main | 3ccb310cfed339eeb3bcbedebd551c37a2993202. ref mutation 직전에 실제 원격 main을 확인하고 expectedSHA/force=false 정상 FF만 허용한다. |
| 인수 WIP | 89992841a14bc87ec2e82410263eb970b9dff1f2, tree383085826f4cf11be2534a756c91a2fa39a600cd, parent4ba746838dc194da0442a2012a94defbfecf315b. |
| 원 local | c2fb8960e5258e23fdeb3cb4e0f5277a6aa9b614 parentbf524a85a7f87630d505899d4fd91b89b92ef27f. remote899와tree는같고부모SHA가다르다. 원c2/bf/899/4ba/3ccb 및 기존W/R refs를보존한다. |
| 통합 범위 | 인수33(code3/docs30)+통합docs2 중기존PC문서1중복=최종union34(code3/docs31). 새구현0, 새Gitblob은통합docs2만. |
| 원33 보존 구별 | accepted899 tree의33 OID/size가인수cache와일치해야한다. 최종파일은인수33개중PC문서1개만통합append로달라지므로32개는OID/size그대로, PC는이전전체bytes를prefix로보존하고새통합문서1개를추가한다. |
| callback | 실제10/25·미15. eq_affix,u_eq,p_atk_mul,melee_ref,parry_lesson_active,player_view,stat_str,p_dot_pool,l_eq,rand 순서. rand는같은Services read_normal_enemy_random_unit()->Dictionary 인자0. |
| legacy/shared | sample_native_random_unit()->float 선언0/required0. 동일World private한곳에기존counter+=1→float(randi())/4294967296.0 한벌, legacy(null)/typed(freshreceipt)가각호출단1회공유한다. optionalpublicarg안미채택·새PRNG/seed/state/cache/epoch0. |
| typed 소유/출력 | metadata-only currentMain/Services/World·Script/parents/liveTree. Services percall output witness, 실제계산뒤completion. 유효0 READY0·preloss NONE/query0·marker부재 UNKNOWN·postloss/rawreceipt/read_result·소비prefix보존. retry/rollback/fallback0. |
| 부분 지원 | 정상공식primitive의float[0,1)·완료·전후소유에대한새경계지원. unexpectedraw는UNSUPPORTED/raw보존. 상태counter와RNGstream소유별개·silentinnerfailure0·원Math.random/stream·실binary/실RNG동등미증명. |
| 기인수 검사 | owner단위정적9/첫격리30 PASS, 등록delta static7(runtime0) 인수. 이번통합에서30/41/95·원7/9·진단/행동/parse를재연하지않는다. |
| 새 경계 | 통합static단1회: base accepted33 OID/size, 통합delta2/wholeunion34, code3불변·legacy0/shared1은기인수metadata보존, I/R union실파일OID/SHA·scopedINDEXWORK·refs/upstream/기록시각만대조한다. |
| 이력 | 이전WIP의9·미등록·당시main/R미반영문구와원FAIL/scope한계/API팩은해당당시기록이다. 최신disk checkpoint는이통합문서와finalreceipt를따르며새성공으로과거wholeclean을소급하지않는다. |
| 적용/경고 | I/R exactunion의freshWORKHEAD·분리INDEXWORK·file/parent/ancestorrealpath/nonlink·각copyUTC→PRE→쓰기/FF. 상속promisor/config경고는보존·정리0, 미측정networkbytes NOT_RECORDED. |
| 비실행 범위 | GUI/browser/Godotinput/reload/restart/GET/server/save/assets/import/export0. V9scalarDict직결·producer제품copy·Worldhook·15dummy/25presence우회0. source정렬로실productcaller/fullhurtE/fullgame/PC완료를주장하지않는다. |

정확한 지원·검수 대역 한계는 [typed rand owner](FDG_NATIVE_NORMAL_ENEMY_RAND_OWNER_20261017.md)를 따른다.

최종 증거: /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/sync-git-main-20261016/NORMAL-HURTE-RAND-MAIN-SOURCE-SYNC-20261017/final-sync-receipt.json
