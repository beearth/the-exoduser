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

## 2026-09-28 — 64차 북쪽 피부 지면 연결 검수

현행 production은61차이며64차아트는별도검수본이다.63차의Higgsfield GPT 재질을재사용해나무앞·서쪽으로연결;신규생성없음.본편master/청크/충돌/캐시버전은변경하지않았다.

| id | 계약·검수 | 실제 값 |
|---|---|---|
| SKIN64 | 선택·레이어 | source crop[2498,2867,5447,7249],2949×4382; anchor[2498,4587];RGB×.53;sample1024/step512/Hanning floor.001/rotation90×((ix+2iy)%4) |
| SKIN64_MASK | 연결·보호 | tile타원[96,112,29,24],[80,93,16,23],alpha.58/feather.23.뿌리보호[105,95,20,15],[108,79,18,10],protect=smoothstep(clamp((1.18-r)/.18));63mask와max union |
| SKIN64_KEEP | 픽셀보존 | mask0영역6,976,692pixels중변경0;새북쪽영역밖63pixels변경0 |
| SKIN64_QA | 실제게임 | before63/after64;12카메라;24검수청크(x2..5/y2..7);224stripPASS;G.map동일;pageerror/HTTP오류0;ch1LivingDetail41PASS |
| SKIN64_COMBAT | 밀집가독성 | 임시기존AI적24마리추가;밝은투사체구분확인.중앙실루엣가림잔여.HP50ms보충/iframes60;성능·밸런스PASS아님 |
| SKIN64_STATE | 판정·기록 | VISUAL VERDICT: RETOUCH.정지재질이며신규피부모션완료아님.외곽·녹색잔여·밀집중앙중첩·성능QA잔여 |

전체수치·12카메라좌표·MAP PRODUCTION REPORT: [64차보고서](../../captures/ch1_ground_skin64/REPORT.md), [비교갤러리](../../captures/ch1_ground_skin64/index.html).승격시assets원본/레이어/마스크와master→64청크→cacheversion→docs를같이반영한다.

> **2026-09-28 63차 신규 피부 재질 검수:** `gpt_image_2_5`, job `8297189f-c4f9-4719-91f1-7cb5df20c1a6`,1024×1024 RGB. 생성원본·프롬프트·검수용합성레이어를 `captures/ch1_ground_skin63/`에보존했다. 신규맵전체재생성이아니며현행production원화미교체. [생성정보](../../captures/ch1_ground_skin63/generation.json) / [규격·합성·QA](../../captures/ch1_ground_skin63/REPORT.md).

> **2026-09-28 59차 현행:** 동측 region1 합성은 .76, palette #343034/#49443c/#303829,서쪽 lobe [155,282,146,140] 추가. 중앙과 회갈색을 공유하고 늪쪽 녹갈색 유지. region0 .82/region1·2 .76/region3·4 .6,지역5캐시7.5MiB/추가draw0. [현행 수치·검수](CH1_EAST_TISSUE_PASS59.md). 아래 이전 수치는 당시 이력이다.

# CH1-1 독속성 썩은 숲 원화 — 2026-09-24

> **2026-09-25 현행 콘셉트 정정:** [맵디테일.md](맵디테일.md)가 현재 기준이다. 사용자가 v2/v3의 싱싱한 식생과 자연숲 인상을 지적했고, **피부 바닥·꿈틀거리는 동맥·부패 생체조직의 음침한 지옥**으로 확정했다. 아래는 기존 생성·합성의 기술 이력이며 현행 디자인 승인안이 아니다. 피부/동맥 원화 및 움직임 구현은 아직 미완료다.

> **v3 부분 수정:** 사용자 요청으로 전체 재생성을 중단하고 베이스 위 부분 편집을 적용했다. 좌상단 거목 crop을 Higgsfield에서 수정한 뒤 ImageMagick 마스크 합성. `rottenwood_poison_detail_review.html`에서 같은 구역 전후 비교, `rottenwood_poison_v3_layers.svg`에 베이스와 수정 레이어 분리 보존. 게임 미적용/RETOUCH.

> **최신 사용자 수정 및 v2:** 게임의 특징은 **넓은 전투공간**이다. 중앙까지 뿌리가 차지하는 v1 구도는 채택하지 않는다. v2는 중앙의 넓게 연결된 전투 지면, 외곽 생체나무·고목, 양측 가장자리 독 구덩이로 재제작했다. 기존 구도 보존·중앙 랜드마크 배치보다 이 최신 지시가 우선한다. 아래 v1·직접 API 시도는 이전 이력이다.

> **후속 사용자 승인:** “힉스필드일단써”. 이번 원화는 Higgsfield 사용을 허용한다. 아래 GPT 직접 API 잔액 부족 및 대체 도구 금지는 이전 시도 이력이며 이번 명시적 승인에 우선하지 않는다. 기준 원화 업로드 확인 후 Higgsfield `gpt_image_2_5` / flare / high / 4k / 1:1 / 1장 편집을 제출했다. 사전 견적4.25크레딧, job `b327eb8b-f726-4f84-8024-7d7467707304`, 참조 media `1403c113-4387-4cd9-80f3-de6b0988e261`. 생성 결과는 후속 절에 기록한다.

사용자 확정: 독속성 썩은 숲을 구덩이·썩은 나무·생체나무 특유의 분위기로 표현한다. 기존 모델의 거대 뿌리 구도는 참조하되, 불탄 숲의 재질과 주황 균열은 교체한다. 이전의 모든 색·재질 보존 지시보다 이 최신 바이옴 변경이 우선한다.

| 요소 | 제작 방향 |
|---|---|
| 전체 구도 | 기준 `assets/map/ch1/rottenwood_field_rootworld_master_v2.png`의 비대칭 거대 뿌리, 서측 공터, 동측 습지, 중앙 랜드마크 관계 유지 |
| 구덩이 | 불규칙한 지반 붕괴, 노출된 진흙층과 뿌리, 탁한 누런 올리브 독액·침전물, 국소적인 낮은 독무. 동일 원형 웅덩이 반복 금지 |
| 썩은 나무 | 속 빈 거대 줄기, 벗겨진 젖은 껍질, 부서지는 섬유질 목질, 접합부 이끼·절제된 균류. 외곽은 연속된 숲 질량 |
| 중앙 생체나무 | 나무 형태 유지, 갈라진 껍질 안쪽 힘줄·혈관형 능선·독낭·병든 목질. 뿌리가 주변 동선과 접지 형성. 눈·큰 입·만화 얼굴 추가 없음 |
| 바닥 | 젖은 흙, 눌린 썩은 낙엽, 부패 목질과 고인 물. 전투공간은 낮고 읽히는 재질 |
| 색·광원 | 흑갈색·회녹색·올리브 중심, 독낭/구덩이에만 제한된 황록 발광. 화염·용암·주황 균열·맵 전체 네온 테두리 제거 |
| 생성 입력 | 기준 원화 실제 이미지 1장 + `output/imagegen/rootworld_master_20260924/poison_rotten_forest_prompt_v1.txt` |
| 호출 | 공식 GPT Image API edit, gpt-image-2, 2048×2048, high, 원본 별도 보존 |
| 실제 결과 | HTTP429, `insufficient_quota` / `credit_balance_exhausted`. 신규 이미지 생성 실패 |
| 예정 출력 | `assets/map/ch1/rottenwood_poison_master_v1.png` — 호출 실패로 이번 생성 파일 없음 |
| 적용 상태 | 컨셉 제작 대기. 게임/geometry/충돌/기존 에셋 변경 없음. 시각 평가할 새 결과 없음 |

## 이전 GPT 직접 API 시도 MAP PRODUCTION REPORT

STAGE: CH1-1 원화 컨셉. MASTER/OUTER MASS/LARGE/MEDIUM/GROUND/PLAYABLE/LANDMARK: 위 새 바이옴 설계만 기록, 런타임 제작 없음. CAMERA QA: 미실시(새 원화 없음). TECH QA: API 실패 확인; 게임 검증 해당 없음. FILES: 본 문서·관련 목표/인계 문서·프롬프트. GIT: 이번 문서만 커밋 대상, push/deploy 없음.

**VISUAL VERDICT: RETOUCH — 기존 맵 기준 유지; 새 원화는 미생성으로 판정 불가.**

NEXT PASS: API 잔액 확보 후 저장된 편집 요청 실행 → 실제 원화에서 구도/독성 바이옴 확인 → 그 후 런타임 적용. 다른 모델·세션 대체 도구로 전환하지 않는다.

## Higgsfield v1 — 이전 원화 시안

| 항목 | 결과 |
|---|---|
| 파일 | `assets/map/ch1/rottenwood_poison_master_higgsfield_v1.png` |
| 프롬프트·출처 | 같은 경로의 `.json`에 전체 실제 프롬프트, 모델/설정, 참조 media, job ID 기록 |
| 규격 | 요청4k / 실제 PNG **2880×2880**. 4096² 출력으로 주장하지 않음 |
| 확인 | 원본 전체 구도 대체로 유지, 주황 균열 제거, 회녹색 썩은 고목·올리브 독액 구덩이·국소 독무·중앙 독낭/목질 생체나무 표현 |
| 차이 | 우상단 석문이 유기적 나무 아치로 변형, 외곽 고목/수풀 증가. 원본과 픽셀·충돌 경계 동일하지 않음 |
| 사용 위치 | 신규 바이옴 원화 시안. 런타임 연결 없음, geometry·청크·게임 코드 변경 없음 |

### MAP PRODUCTION REPORT — v1 이력

STAGE: CH1-1 원화. MASTER: 기존 비대칭 구도/서측 공터/동측 습지 관계 보존을 지향한 이미지 편집; 실제 이동 경계 확정 없음. OUTER MASS: 사방 썩은 고목/뿌리/수풀 연속 질량. LARGE: 기존 모델 원화 1장을 실제 참조, 신규 출력1장; 반복 모듈 배치 없음. MEDIUM: 뿌리와 독액/지면 연결 표현. GROUND: 젖은 흙·낙엽·올리브 독액, 화염 제거. PLAYABLE: 그림의 공터·길만 확인, 이동/전투 미검증. LANDMARK: 중앙 독낭 생체나무, 동측 독성 습지, 우상 아치. CAMERA QA: 원화 전체 시각 열람, 런타임8카메라 미실시. TECH QA: 다운로드/PNG2880² 확인, 게임 성능·충돌·seam 미검증. FILES: 신규PNG+생성JSON+관련문서; 기존/동시작업 코드 변경 없음. GIT: 이 산출물만 별도 커밋 대상, push/deploy 없음.

**VISUAL VERDICT: RETOUCH — 독속성 썩은 숲 컨셉은 표현됐으나 석문 보존과 실제 플레이 맵 제작/검수는 남음.**

NEXT PASS: 사용자가 볼 수 있도록 원화 제시. 기준 관문 형태 보완 및 geometry/카메라 배율에 맞춘 실제 맵 제작은 후속 작업.

## Higgsfield v2 — 넓은 전투공간 시안

| 항목 | 현행 결과 |
|---|---|
| 원화 | `assets/map/ch1/rottenwood_poison_master_higgsfield_v2_wide.png` |
| 생성 | Higgsfield gpt_image_2_5 / flare / high / 요청4k / 1:1 / 1장. 실제 PNG2880×2880 |
| 입력 | v1 생성 job을 실제 reference로 연결. job `5a650be9-a06d-48b1-91ac-1e4e17f7798c` |
| 프롬프트·출처 | 원화와 같은 이름의 `.json`에 전체 프롬프트·설정·참조·결과 저장 |
| 전투 지면 | 남측 진입부터 중앙/서측 대형 공터·북동측 공터까지 넓은 지면으로 연결. 중앙 거대 뿌리 섬 제거 |
| 생체나무 | 좌상단 외곽으로 이동. 독낭·썩은 목질 유지 |
| 독 구덩이 | 좌우 가장자리 움푹한 공간에 배치. 중앙 전투면을 가르는 독 호수 없음 |
| 관문 | 북쪽 중앙 석문. 남쪽 중앙 넓은 진입 |
| 한계 | 컨셉에서 큰 공터는 확인. 런타임 배율·충돌·실제 다수 적 전투 미검증, 구역별 지면 변화 추가 검토 필요 |
| 적용 | 이미지 시안만. 게임 코드/기존 geometry/청크 변경 없음 |

### MAP PRODUCTION REPORT — v2 최신

STAGE: CH1-1 원화 시안. MASTER: 넓은 비대칭 전투 공터, 남→북, 양측 독 구덩이. OUTER LEFT/RIGHT/TOP/SOUTH: 고목·뿌리·수풀 연속 경계; 대형 뿌리는 외곽으로 이동. LARGE: v1 참조/신규 출력1장, 별도 모듈 합성 없음. MEDIUM: 외곽 접지·낮은 뿌리 연결. GROUND: 습한 흙/낙엽 중심, 얕은 흔적으로 지면 구분. PLAYABLE: 중앙 대형 전투면/북동측 공터/넓은 연결 지면, 실제 전투 가독성 미검증. LANDMARK: 좌상 생체나무/북측 석문/양측 독 구덩이. CAMERA START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT: 원화 전체 열람만, 개별 런타임 검수 미실시. TECH route/collision/pageerror/404/seam/loading/performance: 신규 런타임 적용 없어 미검증; PNG2880² 확인. FILES: v2 PNG+JSON와 관련문서; 동시/무관 코드 수정 없음. GIT: 이번 산출물만 커밋 대상, push/deploy 없음.

**VISUAL VERDICT: RETOUCH — 넓은 전투공간 방향을 반영한 원화 시안, 실제 게임 맵 PASS 아님.**

NEXT PASS: 이 공간 원칙을 기준으로 실제 맵 geometry·원화 배율·카메라·전투를 맞춘다. v1의 좁은 중앙 뿌리 구도로 되돌리지 않는다.

## v3 — 베이스 고정, 거목 부분 편집

| 항목 | 결과 |
|---|---|
| 입력 | v2의 좌상단 x0/y0/1440×1440 crop. 전체2880² 베이스 보존 |
| 편집 | Higgsfield gpt_image_2_5/flare/high/4k, job `2e8b6efc-cac6-41da-b95c-3f5251f47c20`; 큰 줄기의 해부학적 형태·갈라진 목질·부패 공동·독액·접지 보강 |
| 디자인 합성 | Higgsfield sandbox ImageMagick6. 생성 crop을1440²에 맞춰 축소, 11점 polygon/blur sigma24 알파 마스크로 source-over. 정확한 점·프롬프트는 `rottenwood_poison_master_v3_detail.json` |
| 파일 | `rottenwood_poison_tree_detail_v3_source.png` 생성원본, `rottenwood_poison_tree_v3_layer.png` RGBA 편집 레이어, `rottenwood_poison_master_v3_detail.png` 합성본, `rottenwood_poison_v3_layers.svg` 편집용2레이어, `rottenwood_poison_detail_review.html` 전후 |
| 보존 검증 | ImageMagick AE: 오른쪽1440×2880=0, 좌하1440²=0. 좌상 crop 밖 차이 픽셀0. crop 내부 마스크 feather 영역은 의도적 혼합 |
| 시각 열람 | 수정 crop과 전체 합성본 실제 열람. 좌상 거목 공동·목질이 구분되고 전투 공터의 큰 배치 유지. 나머지 외곽/바닥 품질은 이번에 해결했다고 주장하지 않음 |
| 적용 상태 | 원화 부분 수정 결과. 런타임·충돌·청크·게임 코드 변경 없음 |

### MAP PRODUCTION REPORT — v3

STAGE: CH1-1 좌상 거목 부분 원화. MASTER: v2 넓은 전투공간 유지. OUTER LEFT/TOP: 거목과 접점 국소 수정; RIGHT/SOUTH: 원본 픽셀 유지. LARGE: 단일 거목 구조·부패 공동 보강. MEDIUM: 목질·뿌리 접지, 나머지 외곽 잔여. GROUND: 선택 영역의 독액·젖은 접촉면만 수정. PLAYABLE: 큰 공터 유지, 실제 전투 미검증. LANDMARK: 좌상 생체나무. CAMERA START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT: 원화 crop/전체 시각 열람, 런타임 미실시. TECH: crop밖 픽셀 동일성 확인; route/collision/pageerror/404/seam/loading/performance 게임 검증 없음. FILES: v3 원본/레이어/합성/SVG/HTML/JSON 및 문서. 동시·무관 변경 없음. GIT: 이번 파일만 별도 커밋 대상; push/deploy 없음.

**VISUAL VERDICT: RETOUCH — 좌상단 국소 개선, 전체 맵 완성 판정 아님.**

NEXT PASS: 동일 베이스·레이어 방식으로 나머지 외곽과 구덩이·바닥의 부족한 구역을 순차 보강.


### CH1_HIDDEN_UNDERLAY_20260929 — 현행 바닥 렌더 계약

완성 production_finish 화면이 전체 뷰포트를 불투명 ready청크로 덮으면 _ch1StartOuterCoversView가 가려진 _fillVoidWithFloor·20개 _oriFireflies·기존 맵캐시 분기3그룹을 렌더에서 제외한다. 매 프레임 줌/흔들림/가장자리·1026² ready를 검사하며, 로딩·오류·맵 밖 노출·다른stage/보스아레나/outer·Rootworld·초기폴백은 원래 바닥을 유지한다. ?ch1LegacyUnderlay=1은 비교용. visible 생체/언덕/소품/ATMO·19빌드레이어/이미지·충돌 삭제0. 캐시 메모리 전체해제나FPS개선율을 주장하지 않는다.

현행 공식·수치·검수는 [가려진 레이어 정리 SSOT](CH1_HIDDEN_UNDERLAY_20260929.md)를 따른다. 앞선 날짜별 회귀·FPS·아트 수치는 당시 검수 이력이다.
