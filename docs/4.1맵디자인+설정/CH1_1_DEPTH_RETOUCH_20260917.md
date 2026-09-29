## 2026-09-29 — CH1-1 공통 피부 바닥87차

사용자 최신 지시: 바닥의 구역별 얼룩·색 차이를 줄이고, 사용자 스크린샷 `2026-09-29 093252`의 촘촘한 피부 결·얕은 주름을 공통 기준으로 유지한다. 현행 배경 cache/bakeVersion **20260929-floor-87**, living module **20260929-87**, retouch **22레이어**다. 기존53점 경계·8구역·8192² master/8000² world·64청크(core1024/bleed1/1026²)는 유지한다. 보행 바닥31826023px/47청크 변경, 비보행 외곽 변경0, 보호한 뿌리 중심681744px 변경0. 구역별 정적 피부막5종은 공통 palette #353032/#3d3535/#353032와 frame alpha .30; 큰 얼룩12개/alpha .06 또는 .04, 미세입자9500개·얕은 주름23개 유지. 추가 runtime draw·상주 canvas0/geometry·충돌 변경0.

[87차 현재 수치·출처·MAP PRODUCTION REPORT](CH1_FLOOR_UNIFICATION_PASS87_20260929.md). 아래86차 이하의 모듈 버전·배경 버전·구역 팔레트·얼룩28개·합성 .82/.76/.60 등은 해당 제작 당시 이력이다. 기존 동맥·늪·버블·사목 움직임과86차 유휴 캐시 준비 계약은 유지한다. **바닥 재질 VISUAL VERDICT: PASS / 전체 맵 RETOUCH**.

## 2026-09-29 — CH1-1 피부–사목 접합85차 적용

현행 cache/bakeVersion은 **20260929-outer-85**, 빌드 레이어는 **21개**다. 서측 하단의 피부 바닥–사목 어깨를 낮은 부패 수피·괴사막으로 연결했다. 비보행101764px만 변경/보행0/고목 핵심 보호3579735px 변경0, 변경chunk1_6 1개·동일63개. 새로고침한 본편8기본 카메라+접합·전투2위치, 이벤트 기반 S/W 이동·24적 공격/Q, 게임error·contextloss0/64청크 응답실패0. 기존 회귀55PASS,21레이어 전체 마스터 재현·224경계 동일. 새 모션0/geometry·충돌 변경0. 전체 **VISUAL VERDICT: RETOUCH**.

[85차 수치·출처·MAP PRODUCTION REPORT SSOT](CH1_OUTER_CONNECTION_PASS85_20260929.md). 아래84차 이하의 '현행'은 당시 제작 이력이다.84차의 미완료 문구는 저장된 최종 검수로 보정했다.

## 2026-09-29 — CH1-1 고목 접합84차 제작 이력

현행 배경은 cache/bakeVersion **20260929-outer-84**다. 서측 부채꼴 고사리 구역을 낮은 부패 수피·괴사막으로 연결했다. master8192²/world8000²/tile40/64청크(core1024/bleed1/1026²), 변경chunk_1_5 1개·동일63개. 총109465px 변화(보행재질12058/비보행97407), geometry·충돌 변경0. 고목 보호2904814px 변경0; 이전 패치 보호 해제는 crop-local[495,340,835,655] 내부뿐(기존 패치 변화70882/창밖0). 타원밖·zero-mask·crop밖0, 선택crop의 near-black≤12/18/22는17595→17392 /64360→63422 /124323→122945. 재질 채널하한24, ellipse[635,490,260,180]/feather.25/opacity.96/줄기보호MaxFilter25·blur18. skin65→outer66..84 총20레이어, 마지막patch x1024/y5120/2048². 기존61차 생체 모듈·늪·동맥 유지/새모션0. 후보9카메라 오류0/G.map동일. 84차 본편18카메라·24적30초 전투·전체 베이크 재현 검수 완료는 저장된 live/runtime·promotion·로그로 확인했다. 현행85차와 상세 검수는 문서 맨 위 링크를 따른다.

[84차 출처·검수 SSOT](CH1_1_PRODUCTION_FINISH_20260916.md#ch1-1-outer84). 아래83차 이하의 현행 표기는 당시 제작 이력이다. 전체 VISUAL VERDICT: RETOUCH.

## 2026-09-29 — CH1-1 검정 빈 공간 감소 83차

사용자 최신 지시: **검정색 빈 공간을 최대한 없앤다.** 기존 외곽 나무 사이의 비보행 검정 공동을 부패 목질·괴사 조직 재질로 채웠다. 현재 본편 배경은 83차이며, 아래 82차 이하의 수치와 검수는 제작 이력이다. [현행 출처·검수 SSOT](CH1_1_PRODUCTION_FINISH_20260916.md#ch1-1-outer83).

| id | 현행 계약 |
|---|---|
| OUTER83_RUNTIME | cache/bakeVersion 20260929-outer-83; master8192²/world8000²/tile40; 64청크/core1024/bleed1/1026²; 변경54개/동일10개. geometry·충돌·진행 변경0 |
| OUTER83_MASK | 원본 maxRGB로 t=clamp((48−maxRGB)/28,0,1), alpha=t²(3−2t), uint8 양자화. authored nav1=보행은 alpha0; maxRGB≥48/zero-mask 픽셀 유지 |
| OUTER83_MATERIAL | GPT2048² 원본을 256px 중첩·4방향 smoothstep 가중 합성,1792px 주기로 연결. 반전0. paint=clip(tileRGB×.65+[12,8,12],24,255); RGB=uint8(base×(1−alpha)+paint×alpha), 기존 alpha 유지 |
| OUTER83_PIXELS | 변경23643680px/보행0. 전체 maxRGB≤12:6062519→405110(93.318% 감소); 비보행5657409→0. ≤18:9586314→1266275/비보행8320039→0; ≤22:12597285→2325674/비보행10271611→0. 남은 어두운 픽셀은 보호된 보행 바닥·그림자이며 모든 검정 픽셀 제거를 뜻하지 않음 |
| OUTER83_LAYERS | skin65→outer66~83 총19레이어; outer83 x0/y0/8192² preblended RGB+binary alpha0/255. 이전18레이어 파일 유지; 이전 패치의 어두운 비보행 픽셀 일부는 최신 지시에 따라 이번 레이어가 덮음 |
| OUTER83_QA | 최종 후보22/본편18카메라; G.map동일/pageerror·HTTP·crash0; 실제 S/W 이동 108.53worldpx, 24적·30초 공격/Q. 회귀9PASS/19레이어 전체픽셀 동일/64청크·224strip동일 |
| OUTER83_LIVING | 기존61차 동맥·늪 버블/가스 유지. 신규 생체 모션0/추가 runtime draw·atlas0; 신규 재질은 정적 배경 |
| OUTER83_STATE | VISUAL VERDICT RETOUCH. 검정 공동 감소는 확인; 다른 식생·반복·밀집VFX 중첩은 잔여. 실제 Radeon GPU2813×1262에서 context loss→restore 뒤 흰 화면1회; 자체 이전QA탭 종료·동일83차 새로고침 후4시점 정상. 원인·해결 미확정 |

## 2026-09-29 — CH1-1 서측 고목 밑 접합82차 기록(83차 이전)

82차 당시 본편 배경이다. 아래81차 이하의 원화·수치·검수는 제작 이력이다. 상세 출처·보호 계약·검수는 [82차 SSOT](CH1_1_PRODUCTION_FINISH_20260916.md#ch1-1-outer82)를 따른다.

| id | 현행 계약 |
|---|---|
| OUTER82_RUNTIME | cache/bakeVersion `20260929-outer-82`; master8192²,world8000²/tile40;64청크/core1024/bleed1/1026²·224strip일치;변경 `chunk_1_5.png`1개/나머지63개유지 |
| OUTER82_LAYER | skin65→outer66~82 총18레이어;`outer82_sources/outer82_patch.png`,x1024/y5120/2048²,preblended RGB+binary alpha0/255 |
| OUTER82_MASK | ellipse[740,438,350,320]/feather.30/opacity.92;73mask>12·74~81mask>0 보호2260730px.고목·공동6사각형981440px;전체합3195820px/MaxFilter25/blur18/core alpha0 |
| OUTER82_PIXELS | 총40513/보행0/비보행40513px.보호·타원밖·zero-mask·crop밖 변경0;geometry/충돌/진행·늪/가스/동맥유지,새모션0 |
| OUTER82_REFERENCE | 업로드 장애 후 기확인 master80 crop[1024,5120,3072,7168]/media b27be7cc-c007-40e6-b4f3-94f786f857dc 재사용.현재 master81의 비보호 합성 픽셀과 참조의 픽셀일치 assert통과.81차패치 보호 |
| OUTER82_QA | 전후9시점 및정밀후보9시점/G.map동일/pageerror·HTTP오류0;회귀9PASS.본편 이동·전투·실제Chrome 최종 검수는 아래완료기록 참조 |
| OUTER82_VERDICT | VISUAL VERDICT RETOUCH;주변식생·반복·밀집VFX/숫자 중첩잔여.기존renderer문제 원인미확정.후속안정성 진단은 본편검수와 별도 기록 |

## 2026-09-29 — CH1-1 서측 피부막 위쪽 접합81차 기록(82차 이전)

80차 피부 면 위쪽 tile[46,144]의 잎무늬 접합을 실제80차 원화 참조로 편집했다. 낮은 괴사막과 섬유로 기존 피부층을 연결하고, 고목과73~80차 패치·넓은 전투공터를 보호했다. 아래80차는 제작 이력이며 현재 배경 계약은81차다.

| id | 현행 계약 | 값 |
|---|---|---|
| OUTER81_SOURCE | 입력·생성 | master80 crop[1024,5120,3072,7168],2048²;Higgsfield GPT gpt_image_2_5/job34551eaf-ba11-466e-8403-c951d280d035;1:1/2k/high/opaque/count1,2.75credits |
| OUTER81_MASK | 선택·합성 | ellipse[840,840,340,460];q=((x−840)/340)²+((y−840)/460)²;t=clamp((1−q)/.30);region=t²(3−2t).alpha=region×(1−protect)×.92×sourceAlpha;floor(alpha×255)/255;RGB=uint8(base80×(1−alpha)+edited81×alpha),원본alpha유지.경계band없음 |
| OUTER81_KEEP | 보호 |73mask>12·74~80mask>0;이전합집합2100642픽셀.고목사각형[500,1502,1410,2048]/[760,70,1020,550]/[160,0,590,600],합879660픽셀.전체합2963916/MaxFilter25/GaussianBlur18/core강제alpha0.보호·타원밖·zero-mask·crop밖변경0 |
| OUTER81_PIXELS | 변화 |총157436/보행123509/비보행33927;geometry·충돌·진행·늪버블·가스·동맥유지,새모션0 |
| OUTER81_RUNTIME | 본편 |master·chunk_1_5.png/chunk_2_5.png·preview·composition·retouchLayers·game cache20260929-outer-81;64청크/core1024/bleed1/1026²·224strip동일;나머지62청크유지 |
| OUTER81_REBAKE | 재현 |skin65→outer66~81,17레이어;outer81 x1024/y5120/2048²,preblended RGB+binary alpha0/255;helper전체8192²픽셀동일.검수Sharp concurrency1/cache false.초기동시검증vips메모리오류별도보존;전체builder재실행미실시 |
| OUTER81_FILES | 소스·보존 |outer81_sources/outer81_patch.png·outer81_mask.png 2파일.76~81차오프라인출처는outer76_81-provenance.zip으로묶음:각pass/input-base.png·edited_connection.png·outerN_crop.png·generation.json·prep.json 총30엔트리+manifest.json=31,모두SHA대조.기존76~80개별ZIP5개는tmp/ch1-source-consolidation81에원본보존.런타임PNG12개변경/삭제0.73~75기존staged출처유지 |
| OUTER81_QA | 실제 검수 |전후9·본편18카메라를3×6독립세션,이동/전투별도1세션으로확인;최종pageerror/HTTP오류0·본편route교체0·42캡처정상.회귀9PASS;[46.5,144.5] S/W약113.86worldpx·시작점근처복귀(약2.78px오차)/G.map동일,임시24적/적탄6샘플0/9/12/12/16/14·공격/Q.체력50ms/무적63f보정·전체API쓰기차단.후반3세션은종료된로딩화면이미지src만QA컨텍스트에서해제,맵청크교체0/본편소스수정없음 |
| OUTER81_STABILITY | 검수 한계 |최초before캡처대기1회,연속본편renderer종료2회,동일코드+80차이미지비교에서도JOIN_TOP흰화면1회.분리group1도스크린샷Python MemoryError1회·시작흰화면1회.실패로그/이미지보존.Windows진단snapshot commit72.556GiB/limit79.761GiB/peak79.761GiB,물리여유39.252GiB;동시메모리압박관찰·종료원인단정없음.자체검수잔여descendant0/사용자앱종료0.실행중limit변동.분리검수의정상캡처는장시간안정성통과가아니며원인·해결미확정 |
| OUTER81_STATE | 판정·Git |VISUAL VERDICT RETOUCH;다른식생·반복·밀집VFX/숫자중첩잔여.81차미커밋:승인된git add도exec provider가WindowsApps pwsh시작전OS317로실패;Git쓰기0/기존staged보존.출처정리후98파일이었으나타작업추가로생성전검사102·통합검수후검사107파일(각시점100제한초과);강제정리없음.저사양/NW.js/장시간성능·무보정종주·클리어미검증 |

[81차 MAP PRODUCTION REPORT](../../captures/ch1_outer81/REPORT.md) · [전후·본편 갤러리](../../captures/ch1_outer81/index.html).

## 2026-09-28 — CH1-1 서측 피부막 왼쪽 접합80차 기록(81차 이전)

79차 피부 면 왼쪽 tile[36,153]의 잎무늬를 실제79차 원화 참조로 편집했다. 기존 고목과73~79차 패치를 보호하고 낮은 괴사 피부층·섬유로 연결했다. 아래79차 이전 기록은 제작 이력이며 당시 배경 계약은80차다(81차 이전 이력).

| id | 80차 당시 계약 | 값 |
|---|---|---|
| OUTER80_SOURCE | 실제 입력·생성 | master79 crop[1024,5632,3072,7680],2048²;Higgsfield GPT gpt_image_2_5/job2b87a734-083f-48ec-b222-e20407f7ae44,1:1/2k/high/opaque/count1 |
| OUTER80_MASK | 선택·합성 | ellipse[480,620,320,550],q=((x−480)/320)²+((y−620)/550)²;t=clamp((1−q)/.30);region=t²(3−2t).alpha=region×(1−protect)×.92×sourceAlpha;floor(alpha×255)/255;RGB=uint8(base79×(1−alpha)+edited80×alpha),원본alpha 유지. 경계band없음 |
| OUTER80_KEEP | 보호 |73mask>12·74~79mask>0;이전합집합1617083픽셀.고목사각형[500,990,1410,2048]/962780픽셀;전체합집합2563137/MaxFilter25/GaussianBlur18/core강제alpha0.보호·타원밖·zero-mask·crop밖 변화0 |
| OUTER80_PIXELS | 변화 |총338768/보행240292/비보행98476;geometry·기존충돌·진행·늪버블·가스·동맥 유지,새모션0 |
| OUTER80_RUNTIME | 본편 |master·chunk_1_5.png/chunk_1_6.png·preview·composition·retouchLayers·game cache20260928-outer-80.64청크/core1024/bleed1/1026²·224strip동일;나머지62청크유지 |
| OUTER80_REBAKE | 재현 |skin65→outer66~80,총16레이어;outer80 x1024/y5632/2048²,preblended RGB+binary alpha0/255;helper 전체8192²픽셀동일 |
| OUTER80_FILES | 소스·보존 |outer80_sources/outer80_patch.png·outer80_mask.png·source-provenance.zip 3파일. ZIP의input-base.png/edited_connection.png/outer80_crop.png/generation.json/prep.json 5엔트리 원본SHA대조.76~79차도patch/mask/출처ZIP 3파일로정리;각ZIP5엔트리·76/77 RAW 및76~79 prep은tmp/ch1-source-consolidation80에별도보존.런타임패치/마스크삭제0 |
| OUTER80_QA | 실제 검수 |전후9·일반본편18카메라,최종각pageerror/HTTP오류0·본편route교체0;지형5+레이어/버전3+HTML구문1=9PASS.수정부[38.5,153.5] S/W104.79worldpx·복귀/G.map동일,임시24적/적탄6샘플0/5/8/11/12/8·공격/Q.초기기존본편의흰캡처2건은별도진단/제외;원인미확정·해결선언없음 |
| OUTER80_STATE | 판정·Git |VISUAL VERDICT RETOUCH;전체식생·다른영역반복·밀집VFX/숫자중첩잔여.80차미커밋:일반git add index.lock권한거부/승인된상승재시도provider시작전OS317;Git쓰기0/기존staged보존.저사양/NW.js/장시간성능·무보정종주·클리어미검증 |

[80차 MAP PRODUCTION REPORT](../../captures/ch1_outer80/REPORT.md) · [전후·본편 갤러리](../../captures/ch1_outer80/index.html).

> 2026-09-28 79차 기록(80차 이전): 서측78차피부왼쪽 tile[47,159]의잎무늬를 실제78차crop참조 Higgsfield GPT 원화로낮은괴사피부에연결. 타원[860,730,430,360]·feather.30/.92·band없음;총341970/보행339996/비보행1974,73~78mask1270046·고목사각형[500,990,1410,2048]/962780·보호합집합2216100픽셀/변경0·타원밖/zero-mask/crop밖0. master/3청크[1,5]/[1,6]/[2,6]/cache20260928-outer-79,15레이어전체재현·64청크/224strip동일. 후보9/본편18시점·최종서버오류0·회귀9PASS(첫루프백장비4048건은별도이력),canMv[47.5,153.5] S/W110.79px. geometry/충돌/늪버블·가스·동맥유지. VISUAL VERDICT RETOUCH;production79 MAP PRODUCTION REPORT우선. source4파일/출처ZIP4엔트리;staged62보존·79미커밋/소유checkpoint.

> 2026-09-28 78차 기록(79차 이전): 서측77차뿌리아래 tile[62,150]의잎무늬를 실제77차crop참조 Higgsfield GPT 원화로낮은괴사피부에연결. 타원[1000,1010,520,500]·feather.30/.92·band없음;총/보행715350/비보행0,73~77mask1219930픽셀보호·타원밖/zero-mask/crop밖0. master/4청크1/2×5/6/cache20260928-outer-78,14레이어전체재현·64청크/224strip동일. 후보9/본편18시점·오류0·회귀9PASS,canMv[67.5,149.5] S/W110.26px. geometry/충돌/늪버블·가스·동맥유지. VISUAL VERDICT RETOUCH;production78 MAP PRODUCTION REPORT우선. source4파일/출처ZIP4엔트리;staged62보존·78미커밋/소유checkpoint.

> 2026-09-28 77차 기록(78차 이전): 서측 tile[61,128]의 회색fan 접합을 실제76차 crop 참조의 새Higgsfield GPT 원화로 낮은 수피판·괴사조직으로 보강. 타원[925,620,470,450]·feather.30/.92·band없음. 총573129/보행368405/비보행204724픽셀변화.73~76차 mask509153+두고목165100=674253픽셀보호·타원밖/zero-mask/crop밖0. master/4청크/cache20260928-outer-77,13레이어전체재현·64청크/224strip동일. 후보전후9/본편18시점·오류0·회귀9PASS,canMv확인[67.5,128.5] S/W112.06px이동. geometry/충돌/늪버블·가스·동맥유지. VISUAL VERDICT RETOUCH;production77차 MAP PRODUCTION REPORT우선. 기존staged62보존·77차미커밋/소유checkpoint.

> 2026-09-28 76차 기록(77차 이전): 남서 위쪽 baked 회색 fan root를 실제75차 crop 참조의 새 Higgsfield GPT 원화로 낮은 부패 목질·피부 바닥으로 편집. 선택 타원[1230,1150,430,425]·feather.30/opacity.92; 이번에는 경계 band 없음. 선택 보행554432픽셀 변화,73~75차 보호301195픽셀·타원밖·zero-mask·crop밖 변경0. master/4청크/cache20260928-outer-76,12레이어 전체 재현·64청크/224strip 동일. 후보전후9/본편18카메라·오류0·회귀9PASS. canMv 확인한[87.5,151.5] S/W 109.00px 이동·복귀. geometry/기존 나무 충돌/늪 버블·가스·동맥 유지. VISUAL VERDICT RETOUCH; production76차 MAP PRODUCTION REPORT 우선. 기존 staged62파일 보존·76차 미커밋,소유 checkpoint 보존.

> 2026-09-28 75차 기록(76차 이전): 남서 고목 위쪽 회색fan root·잎무늬를 실제74차 master crop참조의 새Higgsfield GPT 원화로부분보강했습니다. 선택타원[1220,950,400,480]·Chebyshev8타일band(축별320월드px)·.92/blur20·고목core572420픽셀보호. 총384431/선택보행368590픽셀변화; band밖보행·고목core·crop밖0. master/4청크/cache20260928-outer-75, 11레이어전체재현·64청크/224strip동일. 후보전후9/일반본편18시점·오류0·회귀9PASS. 실제S/W이동107.87px·G.map동일. 충돌·늪버블/가스/동맥유지. VISUAL VERDICT RETOUCH; 아래이전pass는이력이며production75차MAP PRODUCTION REPORT가우선합니다.

> 2026-09-28 74차 기록(75차 이전): 실제 73차 마스터 crop을 Higgsfield GPT 편집 입력으로 사용해 남서 고목의 잔뿌리·수풀 접합 일부를 낮은 부패 목질·괴사 조직으로 연결했습니다. 선택 타원 [1200,1310,470,600]과 경계 Chebyshev 2타일 band(축별80월드px)만 합성(.92/blur20). 총183,663픽셀 변화, 경계 보행 재질121,007픽셀 변화; 안쪽 전투면·고목 보호572,420픽셀·crop 밖은 변경0. master/4청크, cache `20260928-outer-74`. 후보 전후8·본편16시점·오류0·회귀9 PASS, 64청크/224경계 strip·10레이어 전체 재현. geometry/collision·늪 버블/가스/동맥 유지. 전체 VISUAL VERDICT RETOUCH; 아래 이전 현행 표기는 이력이며 production SSOT의74차 MAP PRODUCTION REPORT가 우선합니다.

> 2026-09-28 73차 기록(74차 이전): 남서 시작 왼쪽 비보행 외곽에 꺾인 고목 단면·넓은 부패 뿌리판·검은 공동을 부분 반영했습니다. 중심 tile[73,180], master/3청크(cache `20260928-outer-73`), 580,534픽셀 변화·보행 픽셀 변경0. 후보 전후7·본편39시점(첫27+재검수12)·런타임 오류0·회귀9 PASS, 64청크/224경계 strip 및 skin65→outer66→outer67→outer68→outer69→outer70→outer71→outer72→outer73 helper 전체 재현. 늪 버블·가스·동맥 유지. 두 metadata와 로더 cache의 버전 불일치 원인을 고치고 일치 회귀검사를 추가했습니다. 초기 후반 흰 캡처는 제외·재촬영했으며 장시간 원인 검증은 남아 있습니다. 전체 VISUAL VERDICT RETOUCH; 아래 이전 현행 표기는 이력이며 production SSOT의73차 MAP PRODUCTION REPORT가 우선합니다.

> 2026-09-28 72차 기록(73차 이전): 남측 시작 오른쪽 비보행 외곽에 낮은 부패 목질·수피판·검은 공동을 부분 반영했습니다. 중심 tile[129,181], master/3청크(cache `20260928-outer-72`), 433,965픽셀 변화·보행 픽셀 변경0. 후보 전후7·일반 본편35카메라·오류0·회귀8 PASS, 64청크/224경계 strip 및 skin65→outer66→outer67→outer68→outer69→outer70→outer71→outer72 helper 전체 재현. 늪 버블·가스·동맥 유지. 전체 VISUAL VERDICT RETOUCH; 아래 이전 현행 표기는 당시 이력이며 production SSOT의72차 MAP PRODUCTION REPORT가 우선합니다.

> 2026-09-28 71차 기록(72차 이전): 남동 부패 뿌리 한 개를 tile[184,158]→[178,150]으로 재배치해 보행 경계의 목질 공동·접합 가독성을 개선(master/4청크 x6..7/y5..6). production cache `20260928-outer-71`; 1,103,760픽셀 변화·보행 픽셀 변경0, 본편30카메라·오류0·회귀8 PASS. 기존70자리 복원543,276픽셀과 새 위치를 보정patch로 기록, skin65→outer66→outer67→outer68→outer69→outer70→outer71 보존. 전체 VISUAL VERDICT RETOUCH; 아래 이전 현행 표기는 당시 이력이며 production 문서71차 보고가 우선합니다.

> 2026-09-28 70차 기록(71차 이전): 남동 비보행 외곽에 낮게 무너진 부패 뿌리·수피판·목질 공동을 부분 반영(master/3청크 x7/y5, x6..7/y6). production cache `20260928-outer-70`; 686,730픽셀 변화·보행 픽셀 변경0, 본편29카메라·오류0·회귀8 PASS. skin65→outer66→outer67→outer68→outer69→outer70 보존, 전체 VISUAL VERDICT RETOUCH. 아래 이전 현행 표기는 당시 이력이며 production 문서 70차 MAP PRODUCTION REPORT가 우선합니다.

> 2026-09-28 69차 기록(70차 이전): 동쪽 비보행 외곽에 기울어진 속빈 고목과 낮은 부채꼴 뿌리를 부분 반영(master/3청크 x7/y3, x6..7/y4). production cache `20260928-outer-69`; 801,475픽셀 변화·보행 픽셀 변경 0, 본편25카메라·오류0·회귀8 PASS. skin65→outer66→outer67→outer68→outer69 보존, 전체 VISUAL VERDICT RETOUCH. 아래 이전 pass의 현행 표기는 당시 기록이며 상세 계약은 production 문서 69차 MAP PRODUCTION REPORT가 우선합니다.

> 2026-09-28 68차 기록(69차 이전): 북쪽 비보행 외곽에 쓰러진 속빈 고목을 부분 반영(master/6청크 x1..3/y0..1). production cache `20260928-outer-68`; 보행 픽셀 변경 0, 본편 21카메라·오류 0·회귀 8 PASS. 67차 실제 원화 1024²/scale1.5로 정정했으며, master/64청크 불일치 기록은 검사기 좌표 오류였다. 전체 VISUAL VERDICT RETOUCH. 상세는 CH1_1_PRODUCTION_FINISH_20260916.md의 68차 MAP PRODUCTION REPORT.

> 2026-09-28 67차 기록(68차 이전): 북서쪽 비보행 외곽의 건강한 수풀 띠를 죽은 속빈 목질·내부 숲 질량으로 부분반영(master/4청크 x0..1/y1..2). production cache `20260928-outer-67`; 보행pixels 변경0, 65차 피부·66차 서쪽 고목·생체모듈61차 보존. 생성본의 체크무늬 배경은 폐기하고 background-remover cutout만 사용. 전체 VISUAL VERDICT RETOUCH.

> 2026-09-28 현재 66차: 서쪽비보행외곽에썩은고목·통나무·뿌리질량을부분반영(master/4청크x0..1/y3..4).production cache `20260928-outer-66`;65차피부/생체모듈61차보존.보행pixels변경0.재베이크는skin65→outer66패치순서,전체8192²픽셀재현확인.아래이전버전은이력;전체VISUAL VERDICT RETOUCH.

## 2026-09-28 — 65차 피부 바닥 본편 반영

첫공터→root_bend→나무앞→서쪽의63/64/65차 저대비피부재질을기존production master와30청크에부분반영했다.배경cache는`20260928-skin-65`,Ch1LivingDetail생체모듈은61차그대로다.아래62~64차의production61차유지문구와9월17일버전은당시이력이다.기존outer비교cache20260917-depth-2/diablo20260924-blockout-2는유지한다.

| id | 본편 계약 | 값 |
|---|---|---|
| SKIN65_AREA | 원본·레이어 | 8192²master crop[2007,2867,5447,7249],3440×4382.63차Higgsfield gpt_image_2_5재질1024²재사용;추가생성없음 |
| SKIN65_BLEND | 재질 | anchor[2498,4587],RGB×.53;sample1024/step512/Hanning floor.001/rotation90×((ix+2iy)%4).기존63/64mask·pixels보존 |
| SKIN65_WEST | 추가영역 | tile타원[69,100,12,25],[73,123,12,15],alpha.60/feather.35/smoothstep.64mask와max union |
| SKIN65_PROTECT | 보존 | 타원[105,95,20,15],[108,79,18,10];protect=smoothstep(clamp((1.18-r)/.18));mask0 8,247,686pixels변경0/새서쪽밖64pixels변경0 |
| SKIN65_CHUNKS | production | x1..5/y2..7 30청크.전체64×1026²(core1024/bleed1);단일master에서crop검증.월드끝bleed는끝pixel복제.나머지34청크보존 |
| SKIN65_SOURCE | 복구·생성기록 | assets/map/ch1/production_finish/skin65_sources의재질/crop/layer/mask/prep/generation 6파일.원본master+30청크backup은tmp/ch1-production-pre65 |
| SKIN65_QA | 비교 검수 | 14카메라before64/after65,임시24적·탄·공격/Q;G.map동일;관찰pageerror/HTTP오류0;224stripPASS.본편경로검수결과는제작보고에후속기록 |
| SKIN65_STATE | 판정 | VISUAL VERDICT: RETOUCH.낮은바닥재질만부분반영.전체외곽·건강한식생·중앙캐릭터중첩·성능검수잔여.새피부맥동미구현;기존늪가스/버블/동맥유지 |

[65차제작보고](../../captures/ch1_ground_skin65/REPORT.md) · [실제화면비교](../../captures/ch1_ground_skin65/index.html).현행복구가능수치·좌표는[production SSOT](CH1_1_PRODUCTION_FINISH_20260916.md#skin65)에도보존한다.

# CH1-1 숲 깊이·접지 리터치 — 2026-09-17

## 1. 실제 결과 화면과 영상

**당시 적용 버전 `20260917-depth-2` / VISUAL VERDICT: RETOUCH.**

- [원본 전후 12쌍 + 영상 검수 페이지](../../captures/ch1_depth_20260917/index.html)
- 서버 실행 중: <http://127.0.0.1:3333/captures/ch1_depth_20260917/index.html>
- [경관 입력 종주](../../captures/ch1_depth_20260917/input-walk.webm): Lv500, mapqa=1, 적 OFF, QA 무적. START→북측 출구 앞. 일반 클리어가 아니다.
- [Lv1 전투 시도](../../captures/ch1_depth_20260917/normal-attempt.webm): 피해 무효 보정 없음. 첫 공터 사망.
- [전체 런타임 배치](../../captures/ch1_depth_20260917/runtime-full-layout.jpg): 4800×2700 논리 카메라/zoom .3/횃불 OFF. 보조 검수용이며 기본 카메라 판정을 대체하지 않는다.

전후 캡처는 동일 좌표/1920×1080 논리 카메라/zoom1/횃불·안개 ON. 색보정·합성 없음. 테스트 캐릭터 장비는 무작위 생성되어 서로 다르고 입자 시간도 다르다. 정지 화면은 좌표 지정으로 촬영했다. 입력 종주 녹화 중에는 좌표를 바꾸지 않았다. 영상은 게임 캔버스 15fps 원본으로 DOM HUD와 음성은 포함하지 않는다.

### 실제 적용한 내용

| 항목 | 현행값·역할 | 범위 |
|---|---|---|
| 숲 원화 | `forest_stand.png` 1024×1536 | 키 큰 고목의 층과 외곽 높이 |
| 바위·고목 턱 | `root_bank.png` 1536×1024 | 낮은 쓰러진 나무와 바위 경계 |
| 부러진 잡목 | `broken_thicket.png` 1536×1024 | 큰 수직 나무와 다른 낮은 실루엣 |
| 지면 뿌리 | `root_fan.png` 1536×1024 | 나무 앞과 길 어깨의 낮고 통과 가능한 지면 |
| 외곽 고정 배치 | 42 = 어두운 후경 10 + 중·근경 32 | 기존 외곽 mask에 bake; 신규 충돌 없음 |
| 뿌리 연결 | 9 | 나무 앞 1 + 입구·공터·연결로·북측 8 |
| bake 레이어 | ground23 / forest42 / connections20 | connections = 기존11 + 신규뿌리9 |
| 이전 시체 얼굴 경계 | builder의 `collision/bound*`, `corner*` 배치 0 | 고목/바위/잡목으로 교체. runtime의 다른 기존 구조물은 유지 |
| 거대 시체나무 | stage0 hand prop만 화면 배율 .72, pivot (.5,.72) | metadata sz1450 유지, 표시 최대변1044; 충돌380×230 그대로 |
| 나무 위치 | runtime (102.5,90.5) | 이동 없음 |
| 청크 | master8192², 64개, 1024 core+1px bleed =1026² | core→월드1000px, 기존 캐시 렌더 사용 |
| 지형·배치 | 200×200 / 53점 경계 / 8구역 / authored62/runtime63 | layout.js 바이트 동일, 스폰·진행 규칙 유지 |
| START/EXIT | START(100.5,185.5), gate y5 / exit y7 | 유지 |

원화는 imagegen으로 새로 제작했다. 정확한 프롬프트·출처는 `assets/map/ch1/production_finish/depth/generation.json`, 위치·명암·채도·배율은 같은 폴더 `composition.json`이 SSOT다. 타 게임 추출 에셋은 사용하지 않았다. Dimraeth의 경관/보행 지면 분리와 큰 환경 덩어리 연결을 적용한 **우리 배치 판단**이며 원작의 절차 생성 구조를 입증했다는 뜻이 아니다.

초기 depth-1을 실제 카메라에서 확인한 뒤 depth-2로 수정했다. 나무 앞 뿌리 scale1.05→.85, 뒤쪽 숲을 앞쪽보다 먼저 합성, 첫 공터·북측 어깨에 낮은 뿌리 4개를 추가했다. 최종 비교 이미지는 depth-2다.

## 2. 이번에 실제 실행하여 확인한 사실

### 플레이

| 시도 | 시작 조건 | 결과 | 한계 |
|---|---|---|---|
| Lv1 실제 피해 | 새 로컬 슬롯 `depth0917normal`, test=1은 로컬 저장 경로, testchar/mapqa 없음. HP563. 기본 흰 장비와 시작 유골함, 기본 9스킬 Lv1. 난이도5/자동물약99%. | START에서 실제 키 입력·더블탭 이동. 첫 공터에서 적 추격, 근접/석궁 공격 및 피격. 17처치 후 (101.15,141.87), HP0. | 시작 공유 악의999999가 로드됨. 재화 소비·스탯 수정·피해 무효 없음. 완전히 초기화된 계정과 동일하지 않음. 일반 클리어/1-2 진입 실패. |
| 경관 종주 | testchar1 Lv500 / mapqa1 / 적 OFF / QA 무적 | START→(100.5,122.64)→서측(81.57,122.64)→나무 서측(81.57,78.89)→북·동측(125.32,91.57)→북측(125.32,34.10)→출구 앞(100.14,9.10) | 기존 완료 조건 미충족, stage0 유지. 동측 남하 입력 일부에서 변위 없음: 입력/회피 쿨다운/지형 원인 미분류. 동측 전체 우회 무끼임 PASS로 쓰지 않음. |

장비·설정 수치는 `play-start.json`, 종료는 `play-end.json`, 경관 이동 기록은 `input-walk-log.json` 참조. 시작 시 기존 인트로 보호 프레임이 있었고 전투 중 0으로 자연 감소했다. 추가 무적 보정은 넣지 않았다. 사망을 맵 오류나 난이도 불가능의 증거로 단정하지 않는다.

### 기술 검증

| 항목 | 실제 확인 | 근거·범위 |
|---|---|---|
| stage0 로딩 | 실제 화면에서 새 숲/뿌리/축소된 나무 확인 | `after/` 12개 캡처. `_CH1S1` stage1과 구별 |
| 기존 회귀 | 26/26 PASS | `ch1ProductionFinish`, `ch1StartOuterMass`, `ch1StartSmoothingPass`; 일부는 과거 smoothing 계약 검사 |
| geometry 보존 | PASS | layout.js 바이트 동일; hash `719b681344bf0ab5dc07ae58cb4c01342ca85fde6386a01753d147a66e6ee78c` |
| 청크 해상도·접합 | 64개1026² / 인접112곳 bleed 일치 | `technical.json`, `tmp/ch1_depth_20260917/verify.mjs` |
| 새 배경 로딩 | 64/64 ready, errors0 | 전체 런타임 카메라에서 확인. 전역 모든 에셋404를 뜻하지 않음 |
| 콘솔 | 수집 콘솔 error0, Three.js 중복 import 경고1 | `normal-console.json`; 기존/신규 판별 근거가 없어 경고는 **미분류** |
| 전체 pageerror/404 | **미검증** | CDP event 수집 결과가 비어 있어 시작부터 종료까지 완전한 요청/예외 로그라고 보증할 수 없음. 점검 중 잘못된 진단 변수 조회 ReferenceError2회는 진단 호출 실패이며 게임 신규 오류로 세지 않음 |
| 성능 | 변경 전 mean16.72ms/p95 41.70ms, 후 mean16.62ms/p95 41.70ms | 서측(39,112),1920×1080,z1,횃불ON,정지5초씩. 동일 현재 렌더러/캐릭터에 이전·현재 배경 교체. 전체 전후 게임 벤치마크 아님. `performance.json` |
| 타 스테이지 | 자체 game.html 변경은 캐시태그와 stage0 hand tree 분기뿐 | CH2/CH3 및 전투 로직 수정 없음. 다른 작업자의 칼날개 VFX 동시 변경을 분리. 타 스테이지 새 실행 회귀는 미수행 |

## 3. 위치별 남은 결함과 미검증

| 화면/위치 | 판정·눈에 보이는 근거 | 최소 후속 수정 |
|---|---|---|
| 02 첫 공터 (100,151) | RETOUCH. 가장자리 뿌리는 생겼지만 넓은 중앙 바닥의 평평한 인상은 남음 | 전투폭 유지하면서 흙/낙엽의 큰 비대칭 마모 흐름 보완 |
| 03 연결로 (82,122) | 정지 화면에서 큰 사각 패치 절단은 두드러지지 않음. 모든 연결부 전투 검증은 아님 | 적 추격을 동반한 재통과 필요 |
| 04 나무 앞 (102,101) | 나무·뿌리·흙이 연결되고 캐릭터는 가려지지 않음. 나무 뒤 적의 가림은 미검증 | 북측 전투 가림 확인 후 필요한 부분에만 투명 처리 검토 |
| 05 서측 (39,112), 11 남서 (61,161) | 기존 얼굴 띠 제거는 명확. 큰 갈라진 나무 줄기 원화가 여전히 재사용됨 | 인접 구간 일부를 낮은 고목과 돌출 바위로 교대 |
| 07 야영지 (45,109), 09 웅덩이 (157,54) | 기존 두꺼운 윤곽선 구조물과 세밀한 새 숲의 화풍 차이 | 해당 구조물 가장자리·지면 접점만 스타일 보정 |
| 08 동측 (137,112) | 타원형 그림자와 구조물 하단의 조립감 잔류 | 그림자/접지 국소 보정 |
| 12 북측 (100,52) | 장소가 이어지지만 넓은 바닥 중앙이 약함 | 공터와 출구 방향의 재질 흐름 보강 |
| 전체 축소 | 세로 명암 절단이 보임. 원인 미분류, 청크 픽셀 접합 통과로 무시하지 않음 | 동일 위치 기본 카메라와 축소 렌더 캐시를 비교하여 분류 |
| 실제 전투 | 첫 공터에서 캐릭터·적·탄을 식별했지만 밀집 피격과 동시 VFX로 혼잡 | 나무 구역과 출구 전투 재검증 필요 |

새 고목은 기존 지형 외곽에 bake했고 저지대 뿌리는 보행 가능한 바닥이다. 새 그림이 명확한 장애물처럼 보이는데 통과 가능한 지점이 없는지 전 구간 인접 보행 검증은 아직 끝나지 않았다. 정상 완료 조건/1-2 진입/전체 난이도/모든 스폰 접근성 재실행도 미완료다.

## 4. MAP PRODUCTION REPORT

| 구분 | 결과 |
|---|---|
| STAGE | CH1-1 / STAGES[0] |
| MASTER silhouette / regions / main route / side spaces | 기존 비대칭53점/8구역/남→북/좌우 사이드 유지 |
| OUTER LEFT / RIGHT / TOP / SOUTH / major holes | 좌:키 큰 숲+고목 턱, 우:낮은 잡목·바위와 높은 숲 교대, 북:출구 프레임, 남:진입 숲. 의도적 낮은 구간 외 빈 검은 구멍은 기본 캡처에서 두드러지지 않음 |
| LARGE source assets / composites / overlap / repeated silhouette | 신규4원화, forest42, 후경 먼저 합성·기존 mask. 큰 고목 재사용 잔류 |
| MEDIUM connections / remaining holes | 기존11+뿌리9. 야영지·동측 단 접지 리터치 남음 |
| GROUND shadow / contamination / structure integration | 기존 조명 유지, 지면뿌리 통합. 동측 타원 그림자 잔류 |
| PLAYABLE main arenas / travel / breathing / threat / readability | geometry 유지. 첫 공터 실제 전투 및 서측 우회 입력 이동. 밀집 전투·나무 뒤 가림 검증 미완료 |
| LANDMARK primary / secondary / tertiary | 시체나무 / 기존 캠프·단·웅덩이 / 기존 소규모 소품 유지 |
| CAMERA START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | 01 / 02 / 02 / 05·07·11 / 08·09 / 04·10 / 12 / 06 원본 전후 |
| TECH route / collision / pageerror / 404 / seam / loading / performance | 위 기술 표. 미측정 항목 PASS 처리 없음 |
| FILES stage-owned | production_finish master/chunks/manifest/depth, builder, game.html 자체2hunk, 이 보고서 및 SSOT 현행 주석 |
| FILES concurrent touched | game.html 칼날개 VFX, 관련 스킬/VFX문서·테스트, CHANGELOG_SYNC의 기존 동시 작업 내용은 보존 |
| FILES unrelated touched | Steam 검수 문서, guard.baseline, userdata 캐시는 변경·포함하지 않음 |
| GIT staged / commit / push / deploy | 이번 범위만 분리 커밋. 캡처는 로컬 ignored artifact. push/deploy 없음 |
| VISUAL VERDICT | **RETOUCH** — 외곽과 나무 접지는 개선, 상용 최종 완성 승인 아님 |
| NEXT PASS | 위 위치별 최소 수정·보행과 실제 전투 잔여 QA. 전체 맵 재제작 불필요 |

## 5. 파일·검증 이력과 인계

- 시작 HEAD `bc2cb1689`의 ground-2 기준. `ec7bf70d8` 이후 지면 개선을 보존하고 그 위에 추가했다. rollback 없음.
- 수정 전 백업: `tmp/ch1_depth_20260917/backup/`.
- docs 전체 관련 검색: `tmp/ch1_depth_20260917/docs-audit.txt`; 현행 주석은 SSOT index/production/ground/final review/blockout/에셋목록에 반영.
- 변경 파일: `assets/map/ch1/production_finish/depth/*`, master/청크/manifest/preview, `tools/build_ch1_production_finish.mjs`, `game.html`2hunk, 위 문서와 CHANGELOG_SYNC.
- 원본 캡처: `captures/ch1_depth_20260917/before|after/*.jpg`와 각 manifest. 최종 상태 후속 변경은 별도 diff로 확인할 것.
- 이전 검증: ec7bf70d8 제작, 20260916 final review, ground-2 기술/전투 시도는 이전 이력이다.
- 이번 추가 검증: 신규 원화 실제 적용, depth-1→depth-2 리터치, 전후12쌍, QA 입력 종주, Lv1 피해 전투 사망1회,26테스트,112접합,정지 배경 성능 비교.
- 아직 하지 않은 검증: 일반 조건 완주/1-2, 나무·북측 전투, 동측 전체 우회 정지 원인, 완전한 예외/요청 로그, 전체 게임 전후 성능·난이도.

**Conversation recap에서도 이 세 이력을 섞지 않는다. 일반 완주나 전체 시각 PASS로 승격하지 않는다.**


### CH1_HIDDEN_UNDERLAY_20260929 — 현행 바닥 렌더 계약

완성 production_finish 화면이 전체 뷰포트를 불투명 ready청크로 덮으면 _ch1StartOuterCoversView가 가려진 _fillVoidWithFloor·20개 _oriFireflies·기존 맵캐시 분기3그룹을 렌더에서 제외한다. 매 프레임 줌/흔들림/가장자리·1026² ready를 검사하며, 로딩·오류·맵 밖 노출·다른stage/보스아레나/outer·Rootworld·초기폴백은 원래 바닥을 유지한다. ?ch1LegacyUnderlay=1은 비교용. visible 생체/언덕/소품/ATMO·19빌드레이어/이미지·충돌 삭제0. 캐시 메모리 전체해제나FPS개선율을 주장하지 않는다.

현행 공식·수치·검수는 [가려진 레이어 정리 SSOT](CH1_HIDDEN_UNDERLAY_20260929.md)를 따른다. 앞선 날짜별 회귀·FPS·아트 수치는 당시 검수 이력이다.
