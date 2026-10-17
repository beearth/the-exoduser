> 2026-10-17 ENGINE WIP 현행: 실제 callback **9/25·미16**. 신규 격리 행동41/41과 신규 map 경계 static9/9만 인수 범위다. 원 첫 parse 실패는 보존한다. 이 WIP를 main/R/served·전체 게임 최신화 완료로 해석하지 않는다.

# Normal p_dot_pool 메인·R 소스 통합 — 2026-10-17

| 항목 | 인수된 소스와 통합 경계 |
|---|---|
| 이전 main | 7a49449ab994ce4d942a5aff31e26b4219017745. 새 실제 원격 ref 확인값을 expected_sha로 사용하며 force=false. |
| 인수 소스 | local 6b04ea32c8297b4f581f14b1152881c1146937f9 / remote WIP 6923d23d08123a42f4c75f765e628f621746959d, 동일 tree e1110087fa62cd070c87bf0bd1637457231bfaaf. 두 원 ref를 보존한다. |
| 정확 union | 인수 코드3/docs19 = 22개를 그대로 유지하고 이 문서와 FDG_PC_MAC_GIT_SYNC_20261016.md만 갱신한다. 총24개, 이전22 blob 재업로드0. 타인·보류·미인수 파일 추가0. |
| Formula | p_dot_pool()->Dictionary(0), 원식 1+(PASSIVES.pDot\|\|0)*.05. 기존 _container/_passive_or0_mul/own _ok/_fail 재사용. 원 Q/E·State/Providers body 변경0. |
| binding / Services | Formula.is_passives_reader_bound_to 및 Passives.is_current_passives_reader_bound_to는 기존 Callable metadata만 검사. Services.read_normal_enemy_dot_pool_multiplier가 실제 현재 Formula/Passives/current reader·Script/life/binding을 전후 대조하여 원 raw를 전달한다. |
| 값 / 상태 | 유효 PASSIVES Dict 안의 knownabsence/null/falsy/NaN은 원 truthiness로1.0. owner/context 유실을1/{}로 채우지 않는다. 기존 bound null SOURCE_THROW·status 손실, invalid String/Infinity non_finite를 보존한다. post loss는 topNR/read_result 원 raw·최상위 numeric value 없음. |
| 현재 / 다음 | map8/25·미17. 기존 V6의 p_dot_pool scalar 전체4곳(170/173/566/570)은 typed 미지원이며 직접 Dict 연결0. 첫 접점은170/173이다. V7 인수 전 실제 kernel 등록·full25/full hurtE 완료0. 전체 clock/실전/latest_full_game=false/content_parity=INCOMPLETE. |
| 첫 신규 검사 이력 | 행동76/76+setup37/37 PASS, exit0·양로그 오류/leak0 및 정적10/10. 실제 Formula/Passives/Affix/SOURCE_CURRENT bind+observer super 호출·정확 Services 추출/명시 holder/current-reader fixture 범위. 전체 State/Main configure/자연 수명·HP/clock·실전 아님. |
| 부분 도메인 | 실제 rawgrit/resource inner query 미측정·0 주장 없음. custom JS Object·전체 string grammar는 기존 부분 지원이며 reader Script 변경 case의 제거된 counter는 재독하지 않았다. 과거 AST 실패/helper 범위 위반과 다른 원 실패 기록은 원대로 보존한다. |
| 선행 보존 | I/R exact union48행96 WORK/HEAD slots: 실제 복사90/absent6. 각 source/destination ancestor nonlink/realparent·개별 copy UTC와 분리 INDEX/WORK를 저장한 manifest 이후에 변경한다. R은 FF 직전에 동일24경로 fresh WORK/HEAD/INDEX/WORK 보존을 별도 저장한다. |
| Git / 완료 증거 | 정상 fetch/새 branch/fast-forward와 현재 main expectedSHA lease를 사용한다. R의 기존 promisor 경고는 원 raw로 보존하고 config 정리0. 전송 bytes NOT_RECORDED. main/I/R HEAD/tree/upstream·실제 union 파일·원 ref는 새 통합 경계 static1회/finalreceipt로 확정한다. |
| 실행판 한계 | R disk 동기화는 열린 창/process/Web package 교체 증명이 아니다. GUI input/reload/restart·server/GET/save·asset/import/export/PC 실기동0. 실제 사용 host/URL 질문은 아직 미응답이며 재질문하지 않는다. 시각 기존 RETOUCH 유지, 새 VISUAL PASS 주장0. |

[실제 API·원 raw·첫 검수](FDG_NATIVE_NORMAL_ENEMY_PDOTPOOL_OWNER_20261017.md)를 따른다. 이전 인수 pin과 source 동기화 결과를 최신 실행판으로 승격하지 않는다.


2026-10-17 사용처 정정: V6 p_dot_pool 전체는4곳(170/173/566/570, 원42163/42164/42426/42429)이며 첫 접점만170/173이다. 모두 not DOT이고, 뒤 두 곳은 각각 poisonDot/fireDot 어픽스값>0 및 해당 스택 write 후 결과<10에서 독립 조회한다. 각 지점 당시의 dmg×0.10 누적식·원 순서·lazy를 보존하며 네 곳 모두 typed 미전파다. [네 곳의 정확 조건](FDG_NATIVE_NORMAL_ENEMY_PDOTPOOL_OWNER_20261017.md)을 따른다. 원 API/코드·이전 PASS는 변경하지 않는다.


## 2026-10-17 ENGINE WIP: Main 소유 l_eq 이식

이 절은 현재 ENGINE WIP의 추가 구현 상태다. 기존 본문·동기화 checkpoint·과거 검수 결과는 해당 당시 기록으로 보존한다.

| 항목 | 현재 코드와 검증 상태 |
|---|---|
| 소유/최초값 | actual Main 인스턴스 하나를 native source-script context 하나로 대응하는 신규 설계. Main private Variant _source_l_eq_cache=null 선언 1회; Formula/Services/actor 교체는 초기화 사유가 아니다. |
| 실제 경로 | Main source-init 경계→Services weak current bridge→Formula.l_eq(stat)→Main-owned lazy query→State의 같은 actual INV/slot/item/special에 한정된 누락 필드 복원. 값은 actual legendarySpecial.val에서만 파생, 범용 setter 없음. |
| 순서/값 | cache={} 설치 후 INV/17 slot 순회. 첫 non-undefined, defined null/false/0/빈 문자열/NaN 보존·raw truthy 또는 숫자0. native 미표현 undefined/ToPropertyKey/prototype operand는 raw/prefix를 포함한 typed partial, retry/clear/rollback 없음. |
| cache hit/수명 | domain/INV/writer eager 조회 없이 새 metadata ownership guard. 같은 Main의 helper/actor 교체에도 cache 유지, 옛 caller와 Main 유실 거부. 기존 ordered affix/reference invalidation sink와 원 5개 reset 위치는 l_eq reset 권위로 확장하지 않음. |
| 등록/검수 | 현재 ENGINE WIP callback map **9/25·미16**. 기존8 뒤 실제 l_eq=Callable(self,read_normal_enemy_legendary_equipment) 하나를 추가했다. 원 첫 fixture parse 실패·행동0은 보존하고 header5줄만 수정한 새 namespace의 최초 신규 행동41/41 PASS도 별도 유지한다. 이번 등록 경계만 새 static9/9, 기존 행동·parser·static 검수 재실행0. 전체 hurtE 연결·실게임·main/R/served 반영은 미완이다. |
| 범위/한계 | full Main/Services.configure/State 자연 lifecycle·실 INV/save·원 JS boot/restore·게임/export/PC 최신판 완료 증거 없음. 초기 plan metadata에 불필요한 Q/E 선언·필드 및 Main876 Q currentOptions 할당 한 줄/Frame metadata도 포함됐으며 원본 보존·캐시 권위에서 제외. 실제 Q/E 실행·변경 없음. |

정확한 API·17 slot·최초 실패 로그·미소유 범위는 [Main 전설 장비 캐시 계약](FDG_NATIVE_MAIN_LEGENDARY_EQUIPMENT_CACHE_20261017.md)에 기록한다.


## 2026-10-17 ENGINE WIP: typed rand 실제 소유 경계

| 항목 | 현행 코드/한계 |
|---|---|
| actual registry | 기존9/25·미16 유지, rand등록10은아직0. V9 scalar _rand에Dict직결0/전체hurtE·최신게임완료아님. |
| 새 API | Main.is_native_source_rand_context_current(Services,World), Services.is_native_main_random_bridge_current 및read_normal_enemy_random_unit()->Dictionary, World.read_native_source_random_unit(Main,Services,receipt)->Dictionary. |
| 기존 API 보존 | World.sample_native_random_unit()->float 선언0arg 유지. private공유구현1개가counter+=1→동일float(randi())/2^32를단1회수행, legacy는null/typed는freshreceipt로같은구현을호출한다. optionalarg 변경안미채택·publicbody자체는위임으로변경. |
| 실제 완료 | Services의percall localreceipt에계산완료뒤에만rawsample을기록. 정상0는READY0, marker부재/default0은NR/UNKNOWN, preloss만명시NONE·query0, postloss/typedmalformedreturn도원rawreceipt/read_result·소비prefix보존. 새persistent RNGstate/cache/epoch·retry/rollback/추가draw0. |
| 부분 지원 | 실제float finite[0,1)완료·전후sameowner/Script/liveTree가새경계READY조건. unexpectedraw는UNSUPPORTED/raw보존/값cast·clamp·전역finite0. primitive내부무관측failure와원JS/stream동등은미증명. |
| 첫 검수 | 신규정적9/9·신규격리행동30/30/exit0/result존재·양로그diagnostics0. primitiveleaf대역·명시holder/Statepredicate·default0/typedmalformedreturn모사범위, 실RNG/엔진abort/자연fullMainWorld동등아님. old41/95/진단/통과parse재연0. |
| 보존 | sourceWIP는I만·최종ROOT인수전main/R/served0. 원첫실패/selector·thread과대범위이력과그한계를새성공으로소급수정하지않는다. |

정확signature·schema·freshreceipt구조한계·검수범위는[typed rand 소유경계](FDG_NATIVE_NORMAL_ENEMY_RAND_OWNER_20261017.md)에기록한다.
