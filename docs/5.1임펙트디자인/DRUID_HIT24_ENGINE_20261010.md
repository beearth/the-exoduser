# Druid 중앙 임팩트24 — 2026-10-10

`druid_hit`의 실제4caller 표시만 새원화24셀로 연결한다. 보스자세/경고/피해/패링/맵/전투/RNG/save는 변경0. original8셀 등록은 로딩 실패 폴백으로 보존한다.

| 항목 | 현재 계약 |
|---|---|
| sourcePath | assets/vfx/boss/druid_hit_24_20261010.png |
| 리소스 | exoduser-atlas-clip/version1/name=druid_hit/6열4행/24/fps180/7/loopfalse |
| durationSeconds | 14/15 리소스 표현값; normalized 기존phase에 매핑하며 안정game초아님 |
| 기존 시트 | druid_hit_impact.png/362×543/4열2행/8셀 |
| 추적장판 폭발 | z.druid/scale z.r*1.7/362/frameTime3/angle0 |
| 균열 종착 | fs2.druid/scale explR*1.5/362/frameTime3/angle0 |
| ORB 폭발 | scale.42/frameTime7/기존Math.random()*PI*2 angle |
| bossDruidErupt | scale.72/frameTime7/angle0/기존one-hit gate |
| 명목 진행 | speed3은8×3=24/speed7은8×7=56 render진행단위 |
| phase | 기존advancement 이후 (frame+fraction)/maxFrames; bornGameTime!==undefined는_vfMix, 이외t/frameTime |
| geometry | 원본 dw362*scale/dh543*scale·worldcenter·angle·alpha 그대로 |
| draw | inset1/한효과한셀; GLadditive 성공Canvas0/실패Canvaslighter1/save-finally-restore |
| 수명·budget | 기존종료/cull/budget5뒤선택, 새성공분기 _vw 압축·보존 |
| cache | 새JSON/PNG?v=20261010-v1, 기존runtime?v=20261009-v1 |
| fallback | import/http/schema/image/grid실패 또는pending이면원본8 또는기존timed경로 |

24는그림장수이며24FPS가아니다. non-born 기존render-owned _dtSp·frameTime시t=0/remainder폐기 계약을그대로쓴다. frameadvancement/cull/budget때문에자연재생에서24전부노출된다고하지않는다. 새clock/RAF/전투상수/producer/Godot변경0. 직전roots48완료소비는변경0/완료검사재실행0.

## 원화·에디터·인수

Higgsfield gpt_image_2_5/sunburst/max/4k/transparent/1:1 단1job1113bf6f-96e3-4418-aa09-3f88a2d94c91/견적15credits/잔액·실debit조회0. 원본HTTPS byteexact참조로황록중앙핵·갈색꼬인뿌리·원본작은해골/뼈장식을유지한다. 신규24 source는복제수채우기0이며모든셀공통crop/transparentpadding/scale1만packing한다. 원본PNG와sourceRGBA를덮어쓰지않는다. 실제black/grayalpha합성으로검토한다.

제품·source·PNG·editor각최초검수결과/파일크기·SHA/clip보조metadata는외부 engine-druid-hit24-20261010/completion.json과새assetJSON을따른다. editor는기본필드roundtrip만보장하며frameWidth/frameHeight/pivot보조필드의재출력보존은주장0이다.

VISUAL VERDICT: RETOUCH. 독립actualmain helper proof이며actualmain 정상줌/전체bossbattle/GPU/동시효과성능/청취/실save/AAA미인수다. 관련productionMDkeyword검색은engine_editor 단1회3path10줄, giant본문출력0. mandatory CHANGELOG 포함/관련현재8셀primaryclaim을신규24+원8fallback으로동기화하고옛실행로그는이력으로보존한다.

## 최초 제작·검수 영수증

| 항목 | 실제 결과 |
|---|---|
| 원본 source | 2880×2880 / 11,314,751B / SHA256 625bcb9d8f0632b81bc2d4f2eb6ef72844e93a8a40cc69d18996549ef27e2d37 |
| 제품 PNG | 3072×3072 / 512×768 셀 / 10,563,300B / SHA256 23f5f802365575c2b7024fe3910c289798ff8162e55a0b373ab1b726c41f16b1 |
| 제품 JSON | 321B / SHA256 c43f206a64aa4256b355a907904506fe8448aee7224d212868dd25d20f79d348 |
| 공통 source crop | origin 기준 [-261,-291,220,281], scale1 / resample0 / transparent padding만 |
| 고정 origin | [269,389], normalized [.525390625,.5065104166666666] |
| 기존 표시 기준 차이 | dw362/dh543에서 [+0.104218,-0.246702]px |
| 알파 소유 | 자기 alpha>16 몸체 손실0 / 이웃 고알파 혼입0 / 셀 경계 alpha0. 저알파 파편 소유·후기 origin은 추정 |
| source 첫 검수 | actual whole helper/render + real atlas runtime: 10그룹163조건 PASS. inline module 처리·등록 trailing comment 이동을 검수기가 잘못 판정한 준비 실패2건은 별도 보존, 미도달 검사만 진행 |
| actual PNG 첫 검수 | whole helper 독립 Canvas / 표시260.64×390.96 / 193조건 PASS / 24실가시 phase·24고유 raster. source 검수와 합산0 |
| 표시 비교 | ROOT가 old/new 동일geometry·alpha·lighter의 dark/gray 비교와24단계 strip 직접 판독. 생성 source와 제품 모두 backplate 없음 |
| 동작 proof | 명목 age0..55 + 종료 빈화면1, source57 → WebP25장 / 총966ms. actual main helper 독립 반복 preview이며 인게임 녹화 아님 |
| 수정 이력 | 제품 source 실행 이후 재수정0, 추가 생성 job0, 이전 완료 검사 재실행0 |

원 source nominal 셀 경계에는 일부 고알파 뿌리가 걸쳐 있었으나 origin 기준 공통 crop의 소유 검증 뒤 packing했다. source를 확대·왜곡하거나 고알파 몸체를 잘라 안전 판정을 만들지 않았다. 부피가 줄었다가 다시 커지는 구간이 남는다(1-based 그림6→7,18→19); 단일 사건의 완전한 연속성·본편 조화는 추가 검수 대상이다. RETOUCH를 유지하며 AAA 완료나 성능 보장으로 보고하지 않는다.
