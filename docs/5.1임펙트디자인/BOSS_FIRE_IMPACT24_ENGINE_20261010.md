# 화마귀 대형 불탄 접촉 임팩트24 — 2026-10-10

`fdEnergy&&EL.F` 접촉의 공용fire16 표시를 새24장 단일 불꽃 폭발로 개선한다. Q·일반fire/redbean·화마귀 비행24·보스 물탄24는 이번 범위에서 변경하지 않는다.

| 항목 | 실제 계약 |
|---|---|
| 선택 | actual `_fbEnergyBoom`의 p.fdEnergy&&p.el===EL.F만 `bossFireImpact`; r220/mt90/마지막접촉p.x,y·최대660². 충돌 피해반경을 새그림으로 확대하지 않음 |
| resource | `data/vfx/boss_fire_impact24_20261010.json`: flat9/format exoduser-atlas-clip/version1/name boss_fire_impact/sourcePath assets/vfx/fieldboss/boss_fire_impact_24_20261010.png/6×4/frameCount24/fps16/loopfalse. 제품3840×2560/640² |
| 시간 | 기존boom `t+=sp`·t>=mt종료/pause가드·pool12·camera cull 유지. progress=t/mt→clip.durationSeconds→24셀. resource참고1.5초/접촉90÷60=1.5초는60게임tick/s가정. 24FPS/안정게임초/자연재생24셀전부노출보장0 |
| 표시 | size=3r×sqrt(min(1,progress×3)), 중심p.x,y/무회전, alpha=max(0,1−progress×.5). **부모blend상속**/save-finallyrestore. `_drawBossFireImpactClip`은 원FireImagecomplete가드먼저, 새ready1셀/원generic0회 |
| 로드 | `_bossFireImpactClip`/`_loadBossFireImpactClip`: 등록fetch/Image0·해당접촉prefetch와alias가시draw만 lazysharedpromise/Image1/inset1 immutable24rect. strict flat9/name/path/grid/fps16/nonloop·640²·runtime3API |
| 폴백 | 새pending/invalid/loadfailure/drawfailure는원 Fire_FBF_4x4.png512²/4×4/16/128셀 exactgeneric. 원image미준비는기존표시없음. 실패자동retry0·새원중복0 |
| 제외 | 일반fire/redbean·Q `_resolveBigEnergyParry`/`doParry`·물bossWaterImpact24·물반사탄/다층V3·FD비행24(기존참고19.8FPS/원16폴백)·기존3D모션·Godotloader 불변 |
| 보호 | blastlight280/24·bigImpact방향각·색플래시.32/8·색수차8·파티클42·shake32·SFX.detonate·전투/강도100슬라이드/iframe·charge·Q반사5·자원×10·E금지·RNG순서/save/원PNG 불변. 새공격상한0 |

| 제작·검수 | 기록과 한계 |
|---|---|
| art | Higgsfield gpt_image_2_5/sunburst/max/4k/transparent/3:2/ref1/count1 단1job ab0c3bf4-d44d-4c46-84fe-3f27d8e5875d·견적15/잔액·실debit·추가job0. 원Fire16 HTTPS fullbyteexact 참조·원PNG불변. raw3504×2336/8515534B→제품3840×2560/640셀/6×4/24·PNG7638540B/JSON199B. |
| packing | 고정sourceorigin306,348→320,320/commoncrop[40,46,569,543]529×497·scale1/resample0/padding만. 자기alpha>4/16loss0·neighbor0·edgealpha0·24RGBA/black/grayunique. 색/alpha/mask편집0·후기물리origin추정. |
| source | 최초actualwhole contact/addBoom/wholebooms+sharedruntime Node1/epoch1/6그룹35PASS/준비·실행FAIL0. 전후42입자/feedback/SFX·64armRNG순서exact·폴백/기존90수명/660성장/부모blend검증. 제품첫source실행뒤code수정0·완료helper/PNG실행0. |
| pixel | 별도최초publishedPNG actualwholebooms/helper 독립Canvas Node1/epoch1/14PASS/FAIL0·productdecode1/cacheImage1/28helper/29wholeboom·24접촉가시unique/literal640gridpixeloracleexact/backendgetter부모transform·상속blend·restore·birth/end. witness를assert전저장. source35와합산0·기존suite재실행0. |
| editor | 실제기존editor makeResource→resourceJSON 새flat9 기본왕복 최초1PASS/actionableblocking0·보조frameWidthHeightpivot未인수/PNGdecodehash0. 별도epoch/합산0. |
| visual | ROOT raw 검정/회색actualRGBA와실제helper24strip 직접판독: 작은백열핵→말리는황주황불꽃→분리화염/짧은연기→잔불소산은읽힘. RETOUCH: frame0별섬광·일부분리화염궤적점프·후기origin추정·초후기소형가독성·마지막1587고alpha픽셀잔존. 후기고alpha전체면적증가3.19/4.84/2.00%는연기포함으로재폭발확정근거아님. |
| 메모리 | 신규RGBA8 단순배열37.5MiB+원512²1MiB. 실제CPU/GPU복사·scratch·peak·동시효과성능 미측정/렉없음주장0 |
| 인수 | actualmain 정상줌/전체보스전/GPU·동시성능/청취/실save/AAA未인수. helper 미리보기는독립drawproof/인게임녹화아님. source·pixel·editor는별도epoch/합산0 |

**VISUAL VERDICT: RETOUCH.** 이번은화마귀 불탄 접촉24 표시이며 전체효과·캐릭터24/Godot전체이식/새3D/AAA완료가 아니다.
