# 드루이드 전체 스프라이트 후보 — 2026-11-03

전사 다음 요청한 드루이드6논리군의 오프라인 후보. 대기/보행/공격/잠복·출현/야수/변신. 게임용최종PASS0, 사용자승인0, 런타임반영0.

|군|선택 경로|물리셀|atlas|패딩 L,T,R,B|
|---|---|---:|---|---|
|대기|druid-idle8-r23-kit-hem|8|4592×2928|160,192,160,32|
|walk|druid-walk8-r29-projected|32|3054×4828|160,128,160,32|
|attack|druid-attack8-r29-projected|32|4982×5340|401,192,401,32|
|dive|druid-dive8-r29-projected|8|4572×2222|128,192,128,32|
|emerge|druid-emerge8-r29-projected|8|5628×2222|260,192,260,32|
|beast|druid-beast8-r29-projected|8|3548×1774|0,0,0,0|
|transform|druid-transform8-r29-projected|8|6368×3984|496,512,496,32|

보행/공격 r24/r25의 원시와 이전출력은 보존하되 최신채택검토대상은가로비를교정한r29다. 전체104물리셀, 잠복/출현의공유8과중립1재사용, 변신사람/야수2재사용을별도계수하며 신규몸체93포즈다.

## 렌더·좌표 계약

NativeDruidArt PPU100 유지. PPU200만변경하면NativeDruidBody.Put의논리크기를절반으로만드는제안오류가있어철회했다. Put은 walk/attack/emerge 논리9.3r×14.1r, beast/dive/transform 논리폭=높이*(sourceW/sourceH)*1.12다. 새아트의XY비를이함수에맞추어 원래CorepivotX축으로walk/attack/emerge (14.1/9.3)*(sourceW/sourceH), special1/1.12를역보정했다. 일반aspect-correct idle은1이다. 프레임별장비길이피팅이아니며해당Native표현의카메라교정이다.

원본round경계각각×2+패딩을명시rect로낸다. pivot=[(2*원본W*.5+L)/새W,(2*원본H*.14+B)/새H]. logical draw폭/높이=legacy dw/dh * 새셀W/H /(2*원본셀W/H). maxTextureSize8192필요. 현재NativeHd2D.Actor와표면앵커/광원에서실제동작은미검증이며이메타만으로제품바인딩완료라고하지않는다. Core원점/이동/판정/시간/원본diffuse변경0. 공통unity/main426544563d와자기HEAD5b45b6a의원본7PNG blob동일확인(druid-source-common-comparison.json); Body전체는동일하지않다.

S3정본축1484/파지[532,953], native고정배율.2422381950683837을logical셀비에맞춰사용. LEFT소매한손파지/RIGHT맨팔빈hook, 대기·보행·공격의완성장비를원본별노출에맞춘다. 2.30m/손위치.85m 등LOCK물리치수를2Dbbox만으로PASS라고하지않는다.

## 군별 수정·제약

- 대기8: 성인노인비례와소매/맨팔/장비분리, S/SW방향/앞자락단축을수정. 기존r23선택유지.
- 보행32: 같은앞발·통과반복을재작화. 띠합성수평경계실패후whole-pose로방법전환. 접촉6개공통provider교정.865, 독립통과2개.4939091916/.5389830508. no per-pose/view normalization주장안함. 최종32포즈실제3x와파지확인.
- 공격32:4역할ready/windup/cast/recover, SWcast는LEFT팔이몸앞교차. 0/2본체앞·1/3소품앞+같은원본손알파패치로파지읽기수정. x역보정후좌우패딩401로잘림방지.
- 잠복/출현8: 원본두PNG는같은바이트다. 사람중립1재사용+7신규진행체를공유하지만실제Put가로비가달라별도atlas. 0..4 S3전체길이고정·3/4앞손가림수정,5는뿌리뒤에지팡이가완전히가려지고6/7은prop숨김. inputMetadata staffVisible은구식prop제출플래그이며실제노출수와같지않다. CoreDive50/Erupt40/TelePrep40/TeleWarn60ticks유지·미바인딩, GIF125ms검토목적.
- 야수8: 같은뿔/반가면/외투/맨팔/골장식 유지,장비없음은원본beast계약. 방향전환검토만이며돌진애니메이션신규제작이라고하지않는다.
- 변신8: 사람E와완성야수E재사용2+신규연결6. 5/6장식중복FAIL은국소imagegen교정으로제거,선택wholepose의두개골1개+골알3개을확인했다. 기존실패패치/원시보존. 마지막발끝잘림은공통패딩496으로해결. CoreWind45ticks는그대로, GIF8단계125ms는실제상태시간입증아님.

## 검수 범위

r29의96물리셀 전부경계잘림0/normalalpha차0/단일alpha연결/A64발등록오차0. `druid-r29-group-checks.json` 참조. 노멀은diffuse동일alpha의실루엣bevel4추정이며내부재질/PBR의실측노멀이아니다. 모든8방향/단계와공격32 native3x(2키씩1722px)직접관찰, 외딴점/디더링/그레인을추가하지않았다. 문자같은세부Glyph완전동일성/실제LOCK물리cm/실제게임조명·바닥접지·자연Player/독립검수/사용자승인미검증이다.

155px는정규화검토목표이며현재실제Unity Player1x크기를입증하지않는다. 원본A64하단이맞는다는기술값만으로물리발판·판정접지PASS라고하지않는다. 비교격자/GIF/무음RGB무손실MP4를각군에냈고전체영상video-only·전수디코드0, 실제UI재생검증은별도다. 영상재생검토속도는실제상태타이밍을바꾸지않는다.

산출물 G:/exoduser/tmp/design-review/20261102_sprites (I:/EXODUSER-Storage/archive/G/exoduser/tmp/design-review/20261102_sprites 실체). 각군metadata.json/technical-checks.json/atlas.png/atlas.normal.png/comparison격자/GIF/MP4 및video-receipt.json. 사용자승인전에게임에반영하지않는다.
Unity 반영: 대기(후보·승인전채택0).
