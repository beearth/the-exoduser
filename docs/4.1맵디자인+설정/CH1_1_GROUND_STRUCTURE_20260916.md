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

> **2026-09-17 리터치 이력:** bake/cache `20260917-depth-2`. 신규 숲 원화 4종, 고정 외곽 42배치와 낮은 뿌리 9배치. CH1-1 hand `m_c1tree`만 화면 크기 0.72 / pivotY 0.72; 원본 metadata 1450 및 충돌은 유지. geometry/START/EXIT/진행 계약 유지. 최신 시각 판정 **RETOUCH**. [실제 화면·영상·검증 한계](CH1_1_DEPTH_RETOUCH_20260917.md). 아래 ground-2와 이전 PASS는 당시 이력이다.

# CH1-1 숲바닥 구성 적용 — 2026-09-16

사용자 지시: “그래 잘 못하면 따라하기라도 해봐”. 기존 검수 이후 새로 승인된 **실제 수정**이다. ec7bf70d8 배경은 tmp 백업과 이전 캡처로 보존했고 롤백하지 않았다.

## 실제 화면

[전후9곳·이동 영상·전투 화면 검수 페이지](http://127.0.0.1:3333/captures/ch1_ground_follow_20260916/index.html)

원본은 `captures/ch1_ground_follow_20260916/before|after/*.jpg`. 같은 캐릭터, 위치, 논리1920×1080, zoom1, DPR1.75, 기존 torch/fog/조명 유지. 변경 전은 동일 renderer가 백업한 이전 배경 청크를 로드한 런타임 화면이며 합성이 아니다. 안개/애니메이션 위상은 다르다. 이전 검수의 다른 캐릭터 캡처와 섞지 않는다.

## 적용 내용

딤레이스 정적 조사에서 확인한 WalkableFloor/Path/Dirt/Grass 레이어 분리를 참고했다. 이동 가능한 면 안에서 시각적 흙길·넓은 공터·낮은 이끼/낙엽을 구분하는 이번 고정 마스크는 EXODUSER용 설계다. 원작 자동 생성이나 실제 전구간 플레이 구조를 복제했다고 주장하지 않는다. 타 게임 추출 에셋을 사용하지 않았다.

| 구간 | 실제 바뀐 구성 |
|---|---|
| 남측 | 양옆 낙엽 바닥 사이 흙 진입 흔적, 첫공터로 확장 |
| 첫공터 | 비대칭 흙 공터와 이끼 가장자리 구분 |
| 숲길/야영지 | 서측 굽이와 야영지로 갈라지는 흙 재질 연결 |
| 시체나무 | 기존 나무 양쪽 우회로와 남측 분지의 흙/낙엽 구분 |
| 동측 | 기존 ramp로 이어지는 좁은 흙 접근 흔적 |
| 북측 | 불규칙 공터, 물가/고치 방향 분기, 기존 출구축으로 수렴 |

낙엽/이끼는 보행 가능한 낮은 재질이다. 새로운 수풀 벽이 아니다. 기존 큰 외곽·중형 연결 원화 배치56개를 유지하며 그 안쪽 바닥의 역할을 구분했다. 배경 외곽 재설계나 전체 맵 완성을 주장하지 않는다.

### 런타임/재현 계약

| 항목 | 현재 값 |
|---|---|
| geometry version | 20260916-finish-1 유지 |
| bake/cache version | 20260916-ground-2 |
| 적용 | 실제 stage0, 기존 genFromTemplate/production_finish 청크 |
| game.html 변경 | 청크 캐시 버전 문자열1곳만 |
| 크기/START/EXIT/나무/충돌/스폰 | 변경 없음. geometry hash 719b681344bf0ab5dc07ae58cb4c01342ca85fde6386a01753d147a66e6ee78c |
| 기존 지면 | ground_dark_soil.png, brightness .55→.85, saturation .58→.48 |
| 신규 재질 | materials/forest_moss_litter.png, 생성1254²→타일512², brightness .76/saturation .55 |
| 마스크 | ground-zones.svg, viewBox200², 흙=white / 나머지=이끼·낙엽 |
| 마스크 가장자리 | turbulence .24 / octaves3 / 고정seed16, displacement2.6타일, blur .32타일 |
| 마스크 raster | 1024²에서 먼저 rasterize한 뒤 alpha8192² 확대. 원화 RGB blur 추가 없음. 기존 저주파 색 필드도512² PNG로 먼저 rasterize 후8192² 확대 |
| 출력 | master8192²,64청크1026²(core1024+bleed1), world8000² |
| 기존 접합 | groundEdge .24/radial .38/opacityMultiplier .7/forestEdge .095 유지 |
| 캐시·성능 구조 | 빌드 시 합성. 매 프레임 재질 생성/이미지 합성 추가 없음 |

위 seed는 고정 재질 경계의 미세 굴곡값이다. 맵 랜덤 생성기/무작위 배치가 아니다. 신규 에셋은 imagegen 스킬의 built-in image_gen으로 생성했다. 정확한 최종 프롬프트와 원본/타일 크기는 `materials/forest_moss_litter.metadata.json`에 보존했다.

## 실제 확인과 기술 결과

| 검사 | 이번 결과/범위 |
|---|---|
| 연결 | 새 실제 stage0에서 ground-2 청크 로드,9카메라 visible 청크 오류0 |
| 이동 | 최종 ground-2: START100.5,185.5→첫공터→숲길→나무 서측/북측→북측99.39304,14.96247. 실제 키 입력, 이동 중 좌표 변경 없음. 동측 목표122,96은 미도달(124.57,80.36에서 방향 변경). 출구 사용 미검증 |
| 이동 조건 | 기존 Lv500 mapqa, 적 비활성/네이티브 QA 보호. 완료 조건이나 일반 클리어 검증이 아님 |
| 이동 원본 | 최종 GROUND_INPUT_WALK_FINAL.webm / mp4,124.347초,3360×1890,1864프레임. canvas15fps 요청, 오디오/HTML HUD 제외. 녹화 초반 메뉴 정지 후 ESC로 재개한 구간 포함 |
| 전투(ground-1 이력) | 낙엽 크기 보정 전 별도 testchar Lv500/mapqa=false,56적 시작, 추가 피해 무효 없음. 첫공터 이동/공격/추격 실제 관찰. 최종 관찰HP712.65/8359,처치0. 고레벨 QA이며 밸런스 판단 아님 |
| 회귀 | CH1 production/outer/smoothing 26검사 PASS. 다른 챕터 테스트 신규 재실행 안 함 |
| 배경 산출물 | 64청크 크기 정상,전체 인접 bleed112곳 일치 |
| 격리 | layout.js byte 동일,geometryHash/placements 동일,game.html은 버전 문자열 외 byte 동일 |
| 실행 로그 | ground-1 이동 관찰288이벤트/초기1회 truncated. ground-2 녹화 시작 후 error observer0. 이번 QA 조회식의 W 미정의 ReferenceError1건은 에이전트 평가식 오류로 구분. 손실 없는 전체 초기 로그/404 전수 확인은 미검증 |

일부 waypoint에서 반복 키 입력이 bladeDash를 발동해 목표점을 지나 왕복하는 모습이 있다. 좌표를 맞추기 위해 텔레포트하지 않았다. 이것을 끼임/지형 오류로 판정하지 않았다. 최종 경로/좌표는 input-walk-final.json에 남겼다. ground-1의164.533초 영상과 input-walk.json은 보정 전 이력으로 보존했다. 일부 목표점에는 도달하지 못했으며 충돌 전구간 PASS라고 하지 않는다. 전투의 입력/HP/적 위치는 combat-qa.json에 별도 저장했다.

### 동일 조건 정지 성능

같은 탭/캐릭터,위치100,151,논리1920×1080,zoom1,torch/fog 유지,적 없음,빌드 완료 후 Page.bringToFront,각5초. 이전/이후 배경만 교체했다. 처음의1096×616 또는 비활성 탭 저속 결과는 유효 비교에서 제외하고 동일 조건으로 재측정했다.

| 항목 | 이전 | 이후 |
|---|---:|---:|
| 시간 | 5003.5ms | 5001.8ms |
| rAF 표본 | 1187 | 1174 |
| P50/P95/P99 | 4.2/4.3/4.4ms | 4.2/4.3/8.2ms |

이후 P99가 높았다. 이 짧은 표본만으로 성능 개선이나 회귀 원인을 단정하지 않는다. 이는 짧은 정지 rAF 비교이며 CPU/GPU 분해·동일 전투 부하·저사양/NW.js 성능 검증이 아니다. 시각 완성도의 근거로 사용하지 않는다.

### 실제 화면 후 리터치

첫 bake ground-1에서 낙엽이 캐릭터 대비 크게 보여 타일1024²→512²로 줄인 ground-2를 최종 적용했다. 전후9쌍/전체 배치/정지 성능/이동 영상을 최종 버전으로 갱신했다. 적 활성 전투 화면은 ground-1 이력이며 ground-2 정상 전투를 대신하지 않는다.

## 시각 판정과 남은 한계

**VISUAL VERDICT: RETOUCH.** 흙길/낙엽 면의 재질 구분과 갈림은 이전보다 읽힌다. 전체 상용 스테이지 완성을 뜻하지 않는다.

- 01남측/03숲길/06출구: 전후에 없던 길 가장자리와 낮은 낙엽 재질 구분 확인. 기존 어둠 속 원거리 대비는 낮다.
- 02첫공터: 넓은 흙 전투면 유지. 중심 카메라에서는 일부 가장자리가 화면 밖이므로 장소 차이가 가장자리보다 약하다.
- 04나무: 양쪽 바닥 변화는 있지만 큰 나무 원화의 지배적 크기와 가림 문제는 남아 있다.
- 05서측: 하단 얼굴/뿌리와 좌측 세로 숲의 반복 모티프는 그대로 남는다. 이번 변경으로 해소했다고 하지 않는다.
- 08단구: 기존 타원형 높이 음영 접합을 수정하지 않았다.
- 전투: 캐릭터/적/발사체를 관찰했으나 다수 적·기존 효과가 중앙에서 겹친다. 모든 밀도 가독성 PASS 아님.
- 이번 변경 후 일반 Lv1 클리어/보스 완료/1-2 진입은 재검증하지 않았다. 이전 검수의 Lv1 두 번 사망 결과는 이전 배경의 기록이다.

## MAP PRODUCTION REPORT (§23)

```text
STAGE: CH1-1 / stage0
MASTER: 기존53점 경계/8구역/남→북/야영지·단구 분기 유지
OUTER MASS: LEFT/RIGHT/TOP/SOUTH 기존 큰 숲 유지; 안쪽 이끼·낙엽 지면 연결
LARGE: 기존 자체 원화56레이어 유지; 동일 얼굴·뿌리 반복 잔여
MEDIUM: 기존11개 연결 유지; 지면의 야영지/단구 분기 보강
GROUND: fixed soil mask + low moss/litter; 기존 조명·오염·뿌리 레이어 유지
PLAYABLE: 기존 전투/보행/위험공간·충돌 보존; 지면 재질 전체 통과 가능
LANDMARK: 거대 시체나무/야영지/단구/물가 위치·크기 보존
CAMERA QA: START/EARLY/SIDE L/SIDE R/LANDMARK/LATE/EXIT 9곳 실제 전후
TECH QA: 26검사/64청크/112bleed/geometry·placement 불변; 입력 이동; 로그 범위 제한
FILES: production_finish 재질·mask·bake, 빌더, game cache tag, docs, 로컬 증거
GIT: 이번 변경과 이전 검수 docs만 분리. 무관 Steam/guard/userdata 보존. push/deploy 없음
VISUAL VERDICT: RETOUCH
NEXT PASS: 외곽 반복 원화와 나무 가림/단구 접합은 남은 별도 국소 작업
```

## 변경 파일·증거·recap

- 실제 적용: `assets/map/ch1/production_finish/ground-zones.svg`, `materials/*`, master/chunks/composition, `tools/build_ch1_production_finish.mjs`, `game.html`의 cache tag.
- 이전 보존: `tmp/ch1_ground_follow_20260916/backup/`에 원본 게임/빌더/production_finish 복사.
- 증거: `captures/ch1_ground_follow_20260916/`의 index.html, before/after9쌍, runtime-full-layout, 입력 이동 영상/JSON, combat 화면/JSON, technical.json, before/after-performance.json.
- 문서 검색: `tmp/ch1_ground_follow_20260916/docs-audit.txt`. 보호2_3문서 무수정.
- 이전 작업: ec7bf70d8 전체 제작 및 이후 일반 Lv1 두 번 사망/시각 RETOUCH 판정.
- 이번 추가: 신규 재질+전체 동선 고정 지면 마스크 실제 적용, 같은 카메라 전후, QA 입력 이동, 적 활성 가독성 확인, 산출물/성능 확인.
- 아직 미검증: 변경 후 일반 완주/1-2, 전체 초기 오류 로그, 모든 적 밀도/하드웨어. 전체 맵 완성이나 난이도 검증 완료로 보고하지 않는다.

## 고정 마스크 원문 — 수치·좌표 SSOT

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="8192" height="8192" viewBox="0 0 200 200">
  <!-- White is worn soil, transparent is low moss/litter. All surfaces remain walkable.
       Authored region shapes, not movement corridors or collision masks. -->
  <defs>
    <filter id="edge" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency=".24" numOctaves="3" seed="16" result="grain"/>
      <feDisplacementMap in="SourceGraphic" in2="grain" scale="2.6" xChannelSelector="R" yChannelSelector="G"/>
      <feGaussianBlur stdDeviation=".32"/>
    </filter>
  </defs>
  <g fill="white" stroke="white" stroke-linejoin="round" stroke-linecap="round" filter="url(#edge)">
    <!-- Arrival: a narrow visible trail opens into the southern side of the clearing. -->
    <path d="M101 198 C100 189 105 181 103 175 C102 170 98 167 99 161" fill="none" stroke-width="13"/>
    <!-- First arena: irregular open earth, with a moss tongue at its north-east shoulder. -->
    <path d="M86 167 C81 161 79 153 84 147 L91 144 C95 139 105 139 112 143 L116 149 C125 150 130 158 124 164 C117 170 108 174 101 171 L94 169Z" stroke-width="2"/>
    <!-- Forest bend and side camp form a branch, not one central S-shaped corridor. -->
    <path d="M93 144 C89 137 79 135 81 125 C83 117 80 111 82 104" fill="none" stroke-width="12"/>
    <path d="M83 121 C72 118 66 111 58 108 L46 105" fill="none" stroke-width="9"/>
    <path d="M34 102 C34 95 45 91 53 94 L59 99 C65 102 65 109 59 113 L48 115 C42 113 35 110 34 102Z" stroke-width="1"/>
    <!-- Corpse-tree roots interrupt the basin; both existing bypasses stay visible. -->
    <path d="M82 104 C77 96 80 86 88 80 C93 77 94 72 96 66" fill="none" stroke-width="13"/>
    <path d="M85 108 C95 111 105 113 115 106 C125 99 128 92 122 84 C116 77 105 73 96 66" fill="none" stroke-width="13"/>
    <path d="M91 105 C88 97 90 88 98 86 C107 84 115 91 116 100 C114 108 102 111 91 105Z" stroke-width="3"/>
    <!-- East approach follows the existing ramp; no new height or obstacle. -->
    <path d="M120 103 C126 105 131 101 136 99 L146 97" fill="none" stroke-width="8"/>
    <!-- Late clearing and water-side spur vary the route before the final approach. -->
    <path d="M96 66 C95 60 94 57 99 52" fill="none" stroke-width="11"/>
    <path d="M82 57 C79 50 88 44 95 45 L102 41 C113 42 119 47 116 54 L107 60 C98 64 88 62 82 57Z" stroke-width="2"/>
    <path d="M112 52 C126 56 139 56 153 52" fill="none" stroke-width="8"/>
    <path d="M87 55 C77 55 65 51 50 48" fill="none" stroke-width="7"/>
    <!-- Exit throat stays on the fixed north axis. -->
    <path d="M99 44 C103 36 99 29 100 20 L100 3" fill="none" stroke-width="12"/>
  </g>
</svg>

```


### CH1_HIDDEN_UNDERLAY_20260929 — 현행 바닥 렌더 계약

완성 production_finish 화면이 전체 뷰포트를 불투명 ready청크로 덮으면 _ch1StartOuterCoversView가 가려진 _fillVoidWithFloor·20개 _oriFireflies·기존 맵캐시 분기3그룹을 렌더에서 제외한다. 매 프레임 줌/흔들림/가장자리·1026² ready를 검사하며, 로딩·오류·맵 밖 노출·다른stage/보스아레나/outer·Rootworld·초기폴백은 원래 바닥을 유지한다. ?ch1LegacyUnderlay=1은 비교용. visible 생체/언덕/소품/ATMO·19빌드레이어/이미지·충돌 삭제0. 캐시 메모리 전체해제나FPS개선율을 주장하지 않는다.

현행 공식·수치·검수는 [가려진 레이어 정리 SSOT](CH1_HIDDEN_UNDERLAY_20260929.md)를 따른다. 앞선 날짜별 회귀·FPS·아트 수치는 당시 검수 이력이다.
