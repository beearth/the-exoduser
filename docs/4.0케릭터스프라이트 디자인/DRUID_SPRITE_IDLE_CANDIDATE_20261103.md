# 드루이드 대기8 리마스터 후보 — 2026-11-03

1-1 HD2D sprites-11 범위 중 대기8 후보1군. 게임 반영0/전체드루이드6군 미완/실제Player 아트PASS0. 원본과이전시안은보존한다.

|항목|값·범위|
|---|---|
|선택패키지|druid-idle8-r23-kit-hem|
|원본|base8_v3.png 1656×1240, 셀414×620, CCW S/SW/W/NW/N/NE/E/SE|
|기본2배|3312×2480, 셀828×1240|
|후보|4592×2928, 셀1148×1464 = 2배밀도+공통 L/R160,T192,B32|
|패딩판정|T128 r20의지팡이상단잘림을T192로확장, 몸/장비축소0. wholeatlas정확2배표기금지|
|몸가이드|기준422px/2.7m, 원시471px기준 공통변환. 실제3D비례실측아님|
|S3장비|정본부품r175 SHA5b93cdbe6d8df276ba7ed04d90b886996931c4b79d5e7b8ad4544b1b9c9e388f, 축1484px, 원파지[532,953], 2.30m/하부.85m 저작가이드|
|장비공통배율|native .2422381950683837, base변환1240/444 후 .6765210853261167. 포즈별길이재산정0|
|손|LEFT 소매팔 한손파지, RIGHT 맨팔 빈융합hook. SW방향/팔역할국소교정|
|2배텍셀|bodyScale2.5022474704003366 공통, 지팡이는같은고정부품 회전/평행이동만, 새지팡이8개로계수0|
|기존pivot|원본좌하단pixel pivot×2+[160,32], padded셀로정규화. bbox로원점재검출0|
|Native PPU|100 유지. NativeDruidArt.Sprite.Create100·NativeDruidBody.Put(widthPx/rect.width) 경로에서200만바꾸면세계크기가절반이므로200제안철회. 패딩만큼논리draw폭/높이확장·명시rect/피벗필요, 미반영|
|노멀|각diffuse 같은alpha·규격, 추정silhouette bevel radius4, 실제내부PBR/빛미검증|
|검토표시|155px 정규화검토목표. r44/bt4만으로최종화면1x를입증하지않음, 실제Unity 1x미검증|
|영상|무음RGB lossless MP4768×600/32frames/전수디코드0, 방향턴테이블·새호흡모션증거아님|

8방향1x/3x와8파지3x를제작자가직접확인했다. S3를통째그리면하부축이길어지는문제를고정부품으로전환했고, 남서좌향/팔역할·수의종아리밑단·무릎앞자락을국소수정했다. 최종선택띠밖RGBA0, 발보호RGBA0, 고정XY/장비배율보존,8셀clip0/normalalpha0/A64발등록일치/단일연결을확인했다. 외딴점·디더링·노이즈점이보이지않는오프라인관찰범위다. 실제조명·접지·자연플레이/독립검수/사용자승인은미검증이며게임용PASS가아니다.

공격v2의T128계약을제품에서바꾼것이아니다. 이문서는대기후보의패딩/피벗제안만기록하며, 공격32포즈의명시rect와공통bodyScale는별도계약으로보존한다. 판정위치는기존Actor앵커로남기며Alpha64하단일치만으로접지PASS를주장하지않는다.

재작화원시/선택마스크/기술·영상영수증: G:/exoduser/tmp/design-review/20261102_sprites (실체I:/EXODUSER-Storage/archive/G/exoduser/tmp/design-review/20261102_sprites). 전체진행 I:/EXODUSER-Storage/codex-takeover/sprites-11/REPORT.md. 다음은보행8방향→공격→잠복/등장→야수·변신, 이어일반적5종.
Unity 반영: 대기(사용자 승인 전 채택0).
