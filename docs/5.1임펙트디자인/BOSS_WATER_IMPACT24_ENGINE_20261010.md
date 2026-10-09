# 보스 물 에너지탄 접촉·Q 물보라24 — 2026-10-10

원공용 `Water_ImpactWater_Sheet.png`16장은 여러 형태가 섞인 시트다. 이번에는 크라켄 대형 물탄 접촉과 Q 성공에 한정하여 핵→포말 팽창→분리 물방울→소산의 새24장 표시를 연결한다. 일반 물 파란콩/반사탄 적중/공용 물 효과는 원16을 유지한다.

| 항목 | 실제 계약 |
|---|---|
| 접촉 선택 | `_fbEnergyBoom`의 `p.fbEnergy && p.el===EL.I`만 `bossWaterImpact`; r220/mt90/탄 접촉x,y·최대660² |
| Q 선택 | `doParry`의 기존 impactKind=`waterEnergy`만 `bossWaterImpact`; r96/mt72/최대288². `_resolveBigEnergyParry`의 인수/반사5발·자원×10·E금지 불변 |
| 제외 | waterBean Q/피격, `_parryMagicHitFx` 물반사탄 적중(r72/66/최대216²), 일반EL.I접촉, 다층/V3 물효과는 `waterImpact` 원16. 크라켄 비행24는 이전별도단위 |
| resource | `data/vfx/boss_water_impact24_20261010.json`: flat9/format exoduser-atlas-clip/version1/name boss_water_impact/sourcePath assets/vfx/fieldboss/boss_water_impact_24_20261010.png/6×4/frameCount24/fps16/loopfalse. PNG3840×2560/640² |
| 시간 | 기존boom update `t+=sp`·`t>=mt`종료/pause가드·pool12 유지. progress=t/mt→clip.durationSeconds→24셀. resource참고1.5초이며 접촉90/60=1.5·Q72/60=1.2초는60게임tick/s 가정. 24FPS/안정게임초/자연재생24장전부노출 보장0 |
| 표시 | size=3r×sqrt(min(1,progress×3)), 중심x,y/회전0, alpha=max(0,1−progress×.5). **부모 합성방식 상속**/save-finallyrestore. 원image ready가드먼저·새ready 한셀/원generic 중복0 |
| 로드/폴백 | 등록fetch/Image0, 해당접촉/Q 또는alias가시draw에서lazy 공유promise/Image1/inset1 rect24. strict flat9·grid·runtime3API검증. pending/invalid/loadfailure/drawfailure는 원Water16/128² exactgeneric. 원image미준비는 기존표시 없음. 자동retry0 |
| 보호 | 원blastlight280/24·물bigImpact·색플래시.32/8·색수차8·파티클42·shake32·SFX.detonate·판정/슬라이드100/iframe·charge·RNG순서·Q/loot/save·원PNG불변. 새공격상한0 |

| 제작·검수 | 기록과 한계 |
|---|---|
| art | Higgsfield gpt_image_2_5/sunburst/max/4k/transparent/3:2/reference1/count1 단1job c5bb6a24-e2f1-4443-ba1d-53a3763030ea·견적15credit/실debit·잔액조회0. 원512²/16 HTTPS fullbyteexact참조·원PNG보존. raw3504×2336/8312919B. 제품PNG7278402B/SHAc95bde894cd945050070d08736c79090da6117f21e30aae418706a5b9bd4bb95·JSON201B/SHA9982c9b223639f3236f7a6cbc342b23c25ebd28bd9f8cc62d1ecf09daa146837 |
| packing | 전24공통sourceorigin306,361→320,320/commoncrop[32,59,573,526]541×467/scale1/resample0/padding만. ownα>4/16loss0·neighbor0·edgeα0·24RGBA/black/gray가시unique·색/alpha/mask불변. 후기물리origin추정 |
| source | 최초actualwhole contact/doParry/resolve/addBoom/wholebooms·sharedruntime Node1/epoch1/6그룹43PASS/준비·실행FAIL0/제품실행뒤수정0·sourcepeer actionable0/blocking0. source fixture helper54는모의그림/PNGdecode0 |
| pixel | 별도최초publishedPNG actualwholebooms/helper 독립Canvas Node1/epoch1/21PASS/FAIL0/제품decode1/cacheImage1/52helper·53wholeboom/24접촉+24Q가시unique. 독립literal640grid pixeloracle exact·growth/fade·상속blend/parenttransform/restore·birth/end. backendgetter/raw witness assert전보존·원PNGdecode0 |
| editor | 별도최초actualeditor makeResource→resourceJSON flat9기본왕복 assertion1PASS/finding0. 보조frameWidth/Height/pivot인수제외·PNG접근0/기존suite재실행0 |
| visual | ROOT raw검정/회색actualRGBA와 actualhelper접촉24strip 직접판독: 작은파란핵→상향포말crown→분리물방울→소산 읽힘. RETOUCH:13→14 고α면적+16.24% 증가/일부방울궤적·후기origin추정·초후기소형가독성/마지막고α221pixel잔존. 실전투조화미인수 |
| 메모리 | 신규RGBA8 단순배열37.5MiB+원512²1MiB. 실제CPU/GPU복사·scratch·peak·동시효과성능 미측정/렉없음 주장0 |
| 인수 | actualmain 정상줌/전체보스전/GPU·동시성능/청취/실save/AAA未인수. helper 미리보기는독립drawproof/인게임녹화아님. source·pixel·editor는별도epoch/합산0 |

**VISUAL VERDICT: RETOUCH.** 이번범위는 보스 물탄 접촉·Q 표시이며 전체효과·캐릭터24/Godot전체이식/새3D/AAA완료가 아니다.
