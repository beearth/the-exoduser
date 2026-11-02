# 드루이드 보행·공격 후보군 — 2026-11-03

현재 sprites-11 요청의 후보2군. 실게임 최종PASS0·사용자승인/런타임반영0. 전사4군·드루이드대기1군에 이어 제작했으며, 다음은 잠복/등장→야수8방향→변신8단계→일반적5종 각4군이다.

|항목|보행 r24-kit|공격 r25-kit|
|---|---|---|
|원본|walk.png887×1774|attack.png887×1774|
|키|4×8=32|ready/windup/cast/recover4×8=32|
|후보atlas|3054×4828|3566×5340|
|공통패딩|L/R160,T128,B32|L/R224,T192,B32|
|밀도|원본2배+패딩, wholeatlas정확2배아님|동일|
|프레임경계|원본round셀 경계 각각×2+패딩|동일;자동wholeatlas등분과1px차가능해명시rect필수|
|S3|정본r175 축1484/파지532,953,고정배율.2422381950683837|동일,포즈별장비축소0|
|손|LEFT소매한손/RIGHT맨팔빈hook|동일,SWcast는몸앞으로교차해전방좌측|
|가림|본체가소품앞|0/2본체앞,1/3소품앞+같은손알파island16×20복구|
|실행시간|원본150ms/key 유지안|원본150ms/key 유지안|
|노멀|같은diffuse alpha 실루엣bevel4추정|동일,실제내부PBR/셰이더광원검수아님|
|기술검수|32clip0/normalalpha0/단일연결/A64발등록차0|동일|
|영상|2페이지RGB무손실MP4각2176×1560/32frames·무음·전수디코드0|동일;최종SHA는각video-receipt.json|

보행의같은앞발·통과반복을교정하고,띠합성의수평경계가반복돼완전자세로방법을바꿨다. 접촉6키는동일원시시트공통배율.865, 독립통과두뷰는.4939091916/.5389830508로각방향기준의provider카메라배율을정규화했다. 이를 no per-pose/view normalization이라주장하지않는다. 기존2x텍셀출력bs=.8959660297와S3배율은유지한다. 잘못된루프문양은이미생성한정본앞자락이미지의고리/세뿌리를같은패널로투영재사용했다.

공격은픽셀블록형머리/발과장비방향FAIL초안을보존후현행본체를직접편집했다. 남서cast를LEFT팔이몸앞으로가로지르는전방자세로고쳤다. 남/남동cast끝잘림15px는공통좌우패딩224로확장해해소했고장비길이축소0. 준비/복귀의소품이본체뒤에가려지는파지읽힘문제는가림순서만교정했다. Core/상태시간/이동/판정/원본파일변경0.

8방향모든4키3x와각32파지native3x,32키정규화1x를제작자가직접확인했다. 보이는외딴점/디더링/잔노이즈가없는오프라인후보 RETOUCH. 표시155px는정규화검토목표이며실제카메라1x를입증하지않는다. 현재Unity조명·실제접지·상태연결/자연전투/독립검수/사용자승인은미검증이다. 알파하단등록/영상디코드를실게임PASS로올리지않는다.

## Native 바인딩 계약

- NativeDruidArt.Sprite.Create PPU100유지. NativeDruidBody.Put이논리폭/rect.width·논리높이/rect.height를별도적용하므로200만바꾸면세계크기가절반이다. 앞선PPU200단독제안은철회했다.
- 새피벗=[(2*원본W*.5+L)/새W,(2*원본H*.14+B)/새H]. 논리draw폭=legacy dw*새W/(2*원본W),높이=legacy dh*새H/(2*원본H). 명시rect/패딩확장과maxTextureSize8192이필요하며미바인딩이다.
- 자기HEAD Body f31ae8240와공통Body1a400b608의Put식/NativeArt PPU는동일하나ay/표면바인딩은다르다. 현재공통Renderer/NativeHd2D.Actor후속앵커까지같다고주장하지않으며실제Player검수필요. 판정Core원점변경0,출력A64발선은원본×2+T기술등록이다.

산출물 G:/exoduser/tmp/design-review/20261102_sprites/ (실체 I:/EXODUSER-Storage/archive/G/exoduser/tmp/design-review/20261102_sprites). 각군 comparison-page-1/2-grid.png·GIF/MP4·metadata.json·technical-checks.json·video-receipt.json·atlas/normal. 전체진행 I:/EXODUSER-Storage/codex-takeover/sprites-11/REPORT.md.
Unity 반영: 대기(사용자 승인 전 채택0).
