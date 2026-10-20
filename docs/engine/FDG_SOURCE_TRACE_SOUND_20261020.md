# 사운드 원본 추적·작은 이식 단위 설계 — trace-sound

## 0. 판정·고정 기준·소유 경계

**추적 문서 작성 완료·검수 대기. 사운드 전체 이식 완료 또는 청감 동등성 PASS가 아니다.** 이번 변경은 이 문서 하나뿐이다. 아래 단위들은 다음 구현을 위한 지시서이며 이번에 코드·테스트·설계 docs를 고치지 않았다.

| 항목 | 확인 결과 |
|---|---|
| 작업 | `trace-sound`, `codex/trace-sound-20261020`, `/Users/fordeargamers/exoduser-wt/trace-sound` |
| 시작 | `git fetch origin` 성공 후 `origin/main=ad6ac68a2e009c4d299fe1dd2264182355ee992c` 확인. 지정 최소 SHA의 descendant 조건 충족. 그 ref에서 새 branch/worktree 생성 |
| 행 번호 기준 | **ad6ac68a2의 game.html·index.html 및 Godot 파일**. 1-based/LF 기준. 조사 도중 다른 작업의 fetch로 공유 origin/main ref가 전진한 것을 관측했으므로 후반 검수는 이 WT의 고정 HEAD/실제 byte로 재확인. 새 main 변경은 본 추적에 자동 포함하지 않음 |
| 원본 hash | game.html SHA-256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`, 65,692행. index.html `36008f72723dbcbf1ae7b6af6b08dfe6299962e2445261139b6237082a24cf12`, 4,742행. git blob와 WT byte 동일 |
| Godot 기준 | WT `godot/scripts/main.gd` SHA-256 `795701c741e90bece36174a9d252869d1a64aec25f11cd5a55684fd4ceb3f81c`. 이후 main의 행 번호를 섞지 않음 |
| R 보존 | `/Users/fordeargamers/Projects/exoduser-migration-20261001`: branch `codex/mac-live-play-time-main-20261017`, HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`; 시작 tracked INDEX/WORK 각각 변경 없음. R branch/코드/인덱스 불변. 실제 열린 게임의 source·PC 실행판과의 일치는 **미확인** |
| 사전 문서 | `orders/WORK_BOARD.md`, `FDG_GAME_DEVELOPMENT_PLAN.md` 단계표·작업표·음향 현행 절, 병합된 `FDG_FEATURE_INVENTORY_20261020.md`, 기존 `FDG_SOURCE_TRACE_SETTINGS/SAVE/QUICKSLOT_20261020.md` 확인 |
| 보드 충돌 | P2-001l 레슨/입력, P2-006b 드랍 표시, P3-002 소환굴/world, P2-007a UI, QA-002 테스트와 편집 충돌 금지. TRACE-SETTINGS의 S08 옵션 소비 연결, TRACE-QUICKSLOT의 QS-07 물약 피드백, TRACE-SAVE의 저장 포맷은 의존만. 미병합 다른 trace의 구현 내용은 **미확인** |
| 보호 | **docs/2_3 수정 금지, Q/E 판정·입력·성공 보상·blackBean Q-only, 세이브 형식 보호**. 패링/실드음 caller는 위치만 기록. 음향 이식을 명분으로 보호 설계·전투 RNG·HP/자원·저장 필드를 변경하지 않음 |
| 제출 | 경로 지정 stage/commit, 자기 codex branch만 비강제 push. main push/병합/force/reset 없음. 보드·별도 보고서 갱신 일반규칙보다 사용자 최신 지시인 새 추적 문서 1개 제한을 우선. 지정 Git 밖 DONE에 실제 제출 SHA 기록 |

고정 원본: [game.html](https://github.com/beearth/the-exoduser/blob/ad6ac68a2e009c4d299fe1dd2264182355ee992c/game.html), [index.html](https://github.com/beearth/the-exoduser/blob/ad6ac68a2e009c4d299fe1dd2264182355ee992c/index.html). 아래 부록은 두 파일의 명시 참조를 전수 색인한다. 동적 문자열·외부 script의 실행 도달성·콘솔 호출까지 완결했다는 뜻은 아니다.

## 1. 원본 동작·데이터·상수·수명

### 1.1 서로 다른 음악 경로

| 경로 / 원본 행 | 현재 구조·수치·공식·순서 |
|---|---|
| `BGM` 3980–4212 | 실제 stage/보스/대장간/사망/승리 caller가 쓰는 HTMLAudio 객체. `_cur=null,_curKey='',_vol=.3,_fade=null,_lastSrc=''`. tracks 19키, gameplay50곡. 장 hell1~7은 **각 1곡**. 부록 A에 전 경로·선언행 |
| 캐시 4038–4053 | `_cache/_badSrcs` Dictionary, `_cacheLRU` Array, `_CACHE_MAX=6`. cache miss→new Audio/preload auto. error→bad 표시/cache/LRU 삭제, 현재 Audio라면 cur=null 후 300ms 뒤 ended. LRU 초과 시 현재 재생 객체 제외 첫 항목 pause/src 제거/load/삭제. 선택한 새 Audio의 cur 지정 전 캐시 처리 순서를 보존 |
| 선곡 4054–4090 | `_pickRandom`: bad 제외, 0곡 null/1곡 그대로/2곡 이상 lastSrc 재추첨. `_pickAllRandom`: hell1~7+gameplay **57개 entry**, **중복 제거 없음**(hell1곡은 gameplay에도 있어 가중치 중복). `_pickActFirst`: Set의 미재생·정상곡만, 소진시 actDone=true. `_pickMixed`: 해당장+gameplay, 초기 장곡 부재 fallback에 사용 |
| ended 4106–4123 | auto 장이면 actDone→allRandom 또는 actFirst→null이면 allRandom. allRandom 옵션은 다른 key에도 전체 랜덤. 나머지 key는 pickRandom. 다음 src 없으면 return; 있으면 이전 fade 해제→lastSrc→Audio volume/currentTime/onended→play.catch 무시→cur. 여기서는 loop=false를 다시 대입하지 않음 |
| 직접곡 4124–4139 | `stop→curKey='_track'→lastSrc→getAudio→volume=_vol,currentTime=0,loop=true,onended=null`. autoplay 거부시 pending='_track', 인터랙션5종 listener 설치 |
| play gate 4140–4173 | 문자열 key가 cutscene_*가 아니면 INTRO 진행/예정(stage0·미완·G.off 포함) gate. 그 뒤 !force의 t: 잠금, 수동 category 잠금(단 death/victory/forge 예외). force도 앞선 INTRO gate를 우회하지 않음. stop 후 curKey 저장. auto 장 진입마다 played set 초기화, allRandom은 이벤트3종·cutscene_* 제외. death/victory는 onended=null, 나머지는 ended 재선곡 |
| autoplay 4091–4105 | pending/null, bound=false, pendingExtra[]. click/keydown/pointerdown/touchstart/mousemove. cur.play 성공 뒤 pending=null/listener 제거/bound=false. pendingExtra는 shift해 play.catch. stop은 pending/bound/playedSets를 직접 비우지 않음 |
| stop/fade 4174–4206 | stop은 fade 핸들 캡처→null→clear→cur.onended=null/pause/time0/cur=null/key=''. cur 없을 때 key는 별도로 지우지 않음. fadeOut(dur)은 step=현재volume/(dur/50), **50ms** interval; captured fade/current Audio identity로 stale callback 차단, 0까지 감쇠 후 정리. 전환마다 임의 2초 크로스페이드로 대체 금지 |
| 볼륨·장키 4207–4211 | setVol(v)는 `_vol`, 현재 HTMLAudio, 별도 WebAudio A/B gain을 동시 대입. stageKey(si)는 `SI_TO_HELL[si]→'hell'+(hell+1)`. 범위 밖 si의 새 fallback/clamp 없음. SI_TO_HELL은 외부 장 구조 의존 |
| `BGM_MAP`/`bgmPlay` 10381–10424 | title 1+hell0~6 explore/boss14경로, 별도 AudioContext·buffer cache·gain A/B·source A/B·slot A/key. 객체 key 비교는 JS identity. fadeDur=2초, 새 loop=true/gain0→BGM._vol, 이전 src는 2100ms 뒤 stop. **두 HTML에서 bgmPlay 직접 참조는 선언뿐**. 실제 주음악 경로라고 단정하지 않음 |

`BGM.play`/fade/volume/scene 호출의 모든 명시 행은 부록 D에 있다. 주요 자연 경로는 initStage:31669, update 보스 전환:35877–35881, death fade500/600ms:43872, win fade800/1000ms:43899, nextStage:43896, forge 열기:50517/닫기:44079다. 데모·테스트·일반 부트의 stage 음악 gate는 62094/62207/62430/62560/63515/64036/64152. boss test 64224는 객체 key를 BGM.play에 전달하는 특수 경로이며 BGM_MAP의 객체 API와 혼동하지 않는다(실행 도달 결과 **미확인**).

### 1.2 샘플·로딩·큐·노드 수명

| 구간 / 원본 game.html 행 | 정확 계약 |
|---|---|
| AudioContext 10016–10043 | `_actx,_actxResumed,_actxResumePending,_actxWatchdog`; 모바일 interactive, 데스크톱 playback/44100Hz. 500ms watchdog은 **closed**만 감지해 context/버스 참조 초기화·재생성. suspended 재개는 첫 사용자 gesture가 선행, pending Promise 중복 차단. frame reset 뒤 _resumeAudioCtx(false) |
| 파일맵 10076–10331 | `_sampleFiles` **233 key**. alias와 query suffix 보존(예 bullet_hit/player_projectile_impact/bean_hit 동일 WAV). 모든 233개의 query 제거 물리 파일 존재 확인. key/path/선언행/명시 문자열 참조는 부록 B |
| preload 10332–10356,63802 | `_audioBuffers,_audioLoadPending,_sfxRing`, concurrency4, single `_audioPreloadTask`. suspended에서도 decode, `void _loadAudioBuffers()`로 부트 비차단. key 단위 중복 차단, alias URL dedup은 없음. worker마다 setTimeout0 yield. 실패는 경고 후 진행, task는 기존 promise 유지 |
| 라우팅표 10359–10379 | `SFX_MAP` 18개: procedural11/file7, `_sfxFileCache={}`. 두 HTML에서 표·cache의 명시 소비 참조 없음. 실제 샘플맵233개/SFX 메서드와 동등한 active dispatcher로 간주하지 않음 |
| 정책 12218–12245,12342–12356 | frame counter/카테고리 count/queue, desktop/mobile active48/16·category2/1·frame6/3·PROJ5/2·HIT3/2·STEP2. `_SFX_PRI` 8개 값 10/9/8/4/3/2/1/0. 분기 순서와 skill literal29개는 §4.1, 부록 C 참조 |
| eviction 12246–12252 | 전체 active 최저 pri, 동률이면 `_st\|\|0` 가장 오래된 노드. 새 pri>최저 또는 새 pri>=SKILL10 && >=최저면 stop/_dn. 동일 VOICE9의 교체 보장 없음 |
| 즉시 재생 12253–12295 | buffer 없으면 등록 경로 lazy fetch/decode 후 **현재 요청 폐기**. footstep oldest 교체→PROJ/HIT cap→전체cap/eviction→노드 생성. gain=min(1,(vol\|\|1)×sfxVol), rate=rate\|\|1. gain→mbus(다시 sfxVol). `_dur=buffer.duration\|\|2`. pan abs>.05면 StereoPanner clamp[-1,1], startTime\|\|0. 등록 뒤 connect/start 예외는 _dn 후 rethrow |
| cleanup 12275–12294 | `_activeNodeCnt`, active `{src,gain,pri,key,_dn,_st}`. ended 또는 (원 duration+.5)초 timeout에서 동일 _dn의 bool guard로 1회 감소/목록 swap-pop/disconnect. panner wrapper도 disconnect. pitch로 timeout 길이를 나누지 않음 |
| frame reset 12296–12326 | frameT++/death·hitCD 양수만1감소/mSfxPlaying0. queue 원순서 처리: q.pri bool은 frame/category 제한 우회이며 실제 numeric priOverride 전달과 다름. 동일key n<2 gain/pitch1, 이후 max(.08,.5^(n−1))/max(.7,1−(n−1)×.05). finally queue.length0/count0/SB-CD−1; 예외 재전파. 주석의 ‘최대8·다음frame’과 달리 실제6/3·잔여폐기 |
| playSample 12358–12370 | 실버테일 치환→gxVolMul<1이면 vol 곱·.01 미만 return→pri\|skill\|footstep→비우선 30ms key dedup→rate falsy1→×(.92+random×.16)→우선 unshift 또는 일반push. 우선 여러 건은 LIFO가 될 수 있음 |
| playSampleAt 12372–12386 | 치환→P gate→비skill 30ms dedup(footstep 예외를 이 함수에 새로 넣지 않음)→거리. d≤1200 falloff1, 이후 max(0,1−(d−1200)/800); vol×falloff²×gxMul, .01 threshold. pan=clamp(dx/600,−.7,.7). 즉시재생(...,priOverride), queue 우회 |
| 특수 칼등음 12389–12403 | sbKeys3, src/gain/last; 이전src stop·ring3 정리·무작위 동일이면 다음 index, pitch _r(1,.1), gain=min(1,.7×sfxVol). **Q/E 보호 의존** |
| 전역 배율 17472 | `_gxVolMul=1`. 두 sample wrapper의 감소 분기에서만 사용. Main fireball context 이식과 source 전체를 분리 |

### 1.3 믹스·보이스·루프·절차 합성

| 구간 / game.html 행 | 현재 데이터·수치·적용 순서 |
|---|---|
| sfxVol 10044 | OPT.sfxVol/100. 일반 sample은 voice gain과 master에서 2회 적용. 죽음 dispatch는 caller도 sfxVol을 곱하므로 단순 ‘모든 사운드 v²’로 일반화 금지 |
| 궁극 mute 10046–10073 | ultMute 1회 gate, A/B gain과 mbus 0까지 .3초, HTML BGM savedVol/0. ultUnmute .5초에 OPT.bgmVol/100·sfxVol 복귀, HTML은 savedVol\|\|v. playVoiceDirect는 치환 후 min(1,vol\|\|1), destination 직결(OPT.sfxVol/master 우회), 임의통일 금지. caller12973/12976,해제43722/46825/46901 |
| 실버테일 12327–12341 | map42개, charIdx===1만. lastAt Map/performance.now, 동일 실제 mapped key10000ms 재선택 차단. grunt/parry 각3, demon_revive/second_wind/execution/clear/fuse 각2에서 eligible만 난수 선택. 사전 stamp 후 downstream drop여도 stamp rollback 없음. unmapped direct silvertail_*에 새 cooldown을 강제하지 않음. voice_wakeup은 매핑 제외 |
| master mbus 12406–12460 | cache hit마다 gain=sfxVol로 재대입. highShelf6000Hz/−9dB→peaking3000/Q.8/−5dB→lowShelf250/+4dB→master compressor threshold−6/knee30/ratio2/attack.015/release.35→destination |
| 선언된 subbus 12426–12454 | HIT input gain.55/compressor−12/ratio8/attack.001/release.08, SKILL input.8/−8/ratio4/.003/.15, BOSS gain1. **sample·합성 helpers는 gain→mbus 직결**. 선언됐다는 이유로 전체가 카테고리 subbus를 통과한다고 보고하지 않음. `_dry,_wet,_conv` 초기null; 실제 Convolver 생성 없음 |
| 합성 공통 12463–12545 | _r(v,s)=v×(1+(random−.5)×2×(s\|\|.05)); Tone/Noise/Dist/FM/Sub 각 active cap와 ended/timeout idempotent cleanup. 종료 dur+.02, cleanup dur+.5. helper별 모든 주파수·attack·filter·curve 값은 부록 C 원문식 표 |
| generic loop 12549–12561 | 소스에는 sample loop 생성/기본vol.3·fade150ms 함수가 있으나 **같은 top-level `_startLoop` 이름이 60469의 rAF 게임루프 함수로 재선언됨**. 두 HTML의 명시 호출은 63865/64166 게임루프 시작뿐. `_stopLoop(P._blueLpSrc)` 33611/36083과 음향 loop 생성이 자연 연결됐는지는 **미확인**. 이름 충돌을 묵시적으로 수리해 새 기능으로 만들지 않음 |
| 실드 loop 12562–12569 | stop선행→shield_loop/looptrue/gain.25×sfxVol→mbus. stop은 src/gain capture 및 globals null, ramp .0001/+.1초,150ms뒤 captured stop. **Q 보호 의존**, 제어·진입조건 변경 제외 |
| beam 12649–12694 | gain.8×sfxVol, beam_r1~3 random finite chunk, current gain/next/src identity 확인 후 chain. stop→captured refs/global null/endednull/.0001·.1초/150ms stop. legacy oscillator200ms 분기도 보존. stale callback 방어와 실제 청감 동등성은 별개 |
| SFX 객체 12570–12842 | 메서드36개. slash random3/Seq순환3, block/arrowHit/magicHit는 무음 본문. potion55/110/170ms·levelup95ms간격+420ms·victory155ms+1150ms·crystalEquip65ms 등 모든 레이어 상수는 부록 C. 이미 이식된 전투음의 재작성 지시가 아님 |
| 종족/보스 24724–24828 | 종족 Set9(UNDEAD는 피해계수도 공유하므로 읽기만), deathVariants11개, bossProfile si0~3의음색 값, hit/death picker. death frame max6/보스1·CD5, lay gain=max(.32,.72−(n−1)×.16),pan±min(.6,.22+n×.13),pitch _r(1.05+n×.03,.06). dispatch immediate/일반 첫 voice대형25%·grunt15%. 세부 원문은 부록 C; 현재 첫전투 구현은 의존만 |
| 몬스터 이동 32080–32098,38665–38675 | etype override우선→arch fallback, 거리<1000,not stunned/frozen, frame3이하, vol=max(.03,.35×(1−d/1000)), CD60+~~(random×60),crawl50%변형,pitch _r(1,.15). cooldown sp domain, global mSfxPlaying은 frame reset |
| 장비/드랍/습득 16263–16271,16721 | sword/crossbow전용+base fallback .42/±.04,rarity≥2 rare .28/±.03. drop 45ms gate,rarity≥4 legend/≥2 rare/그외 common .5/±.04/공간음,preview 제외. pickup6종 random .5/±.05. 실제 inventory caller는 타 trace 소유 |
| 피격음 16997–17003,43541 | projectileHitSfxAt=−Infinity,100ms,player_projectile_impact .55/1/prioritytrue. DOT/조기반환·Q/E는 **보호**. 피해 집행자 변경 지시 없음 |
| game 서사 62742–62745,62910–62983 | proVoice .7/rate1/OFS.3,PRO만 play,일반 신규는 INTRO. start fade300/400ms에 nemesis 또는 prologue,PRO 종료시voice stop/nemesis,INTRO 종료fade500/600ms stage. 명시 PRO는 주제가4곡,cutscene_warintro 키를 자동 재생하는 것으로 간주 금지 |
| 시작 기상음 63403–63407 | voice_wakeup 공용. load후 `_introGuide===state&&!state.done`일 때만play; skip/재진입 후 늦은promise가 음성을 내면 실패. 전투 여성맵과 분리 |

### 1.4 index.html 로비·영상 오디오·UI·저장

| 원본 행 | 데이터·함수·UI·수명 |
|---|---|
| 2244–2274 | lobbyBGM .65/preload/looptrue. introVoice .7/rate.95,`_CIN_VOICE=false`. CIN_BGM_TRACKS4,cinBgm .6. stopLobby 50ms마다−.07 뒤pause/time0/volume.65/bgmStartedfalse; stopCin capture 후50ms마다−.06 뒤pause. _tryBGM는 character story/splash/cin gate, 성공후listener7종제거 |
| 2284–2297 | stopWorldIntro→subtitle disable/player.stop/null/input cleanup/video pause·time0·muted/volume0. stopIntroVoice pause/time0 |
| 2377–2395,2584–2586 | 남아 있는 legacy VOICE_DELAY=−.3/introVoice.currentTime 기준 장면/사용자 unlock후play. `_CIN_VOICE=false`와 새 world movie 경로를 고려, 정상 최신음성 경로라 단정하지 않음 |
| 2495–2549 | door video 자체음 .6/입장SFX. gesture에서cinBgm .6 시작. WorldIntroPlayer에 **동일 music 참조** 전달,voice100/music22로 UI초기화. mix controls Number/100,재진입초기화. waiting/error/status/toggle과 연동 |
| 634–636 | worldIntroVoiceGain/worldIntroMusicGain range0..100,초기100/22,output%. 게임 OPT.sfxVol/bgmVol과 공유 저장하지 않음 |
| 2703–2714,2801–2808,2834–2842,2865–2867 | skip/login/cinematic/lobby 전환의 music/voice/movie/hover stop. 세계관 끝과 skip에서는 lobby 재개. 영화 음악을 매 장면0초로 돌리는 동작 없음 |
| 3407–3424 | 신규 warrior creation→stopLobby/stopHover→ExoduserCharacterStory.play→startGame; 타캐릭터는 별도. 영화내장음/후속INTRO 분리 |
| 3776–3813 | enter MP3/preload/volume1,WebAudio MediaElementSource gain2(destination),play Enter time0/gain2. hover WAV buffer/loop,gain0→.7/.1초; stop captured source/gain/.08초 ramp/100ms뒤stop+disconnect,globals null |
| 3818–3820,4306–4307,4725 | mouse enter/leave/click·gamepad selection·wishlist 입장SFX 호출. 진동값은 사운드 수명 의존만, 변경 제외 |
| 외부 script 1114–1117 | `character-story-player.js`, `world-intro-player.js`, subtitle 파일. world-intro-player:5–78은 music .22/voice1,firstplaying1000ms/50ms fade,explicit pause 연동/stop/fade해제. index 인라인만 옮겨서 영상 믹스 완성으로 보고 금지 |

| 저장·옵션 항목 | game.html 행·현행값 | 경계 |
|---|---|---|
| OPT.sfxVol | 6311=60; UI2732 range0..100/value60; handler48912; sync49330; audio10044 | 기존 옵션owner·TRACE-SETTINGS 의존. sound unit에서 새 OPT singleton 금지 |
| OPT.bgmVol | 6311=60, **HTML2733 value30**; handler48913; sync49331은 `OPT.bgmVol\|\|30`(0도30표시),restore49428 | BGM._vol 초기.3과 OPT60이 초기부터 같은 것은 아님. 0표시 결함 수정 제외 |
| OPT.bgmTrack | 6311='auto'; HTML2735–2814 **73 option=t:57+기타16**; handler48914;sync49332 | auto/allRandom/수동key/t:src,함수별 잠금 예외 그대로 |
| settings payload | saveSettings48876 `hellcave_settings={binds,binds2,opt:{...OPT}}`,hellLang별도;load49396–49428 | **세이브 형식 보호**. 사운드3필드는 opt안에 포함. 새 version/key/migration 추가제안 없음 |
| preset | `_savePreset/_loadPreset` 49293–49317은 실제 부록 D의 정확 식별자행 참조 | OPT 전체 경유 여부/부작용은 TRACE-SETTINGS가 소유. 소리 트랙이 자동재개됐다고 추정 금지 |
| runtime state | BGM cache/pending/playedSets,buffers/queue/nodes,lastAt,hit/deathCD,gxVolMul,blueLpSrc,enemy.mSfxCd | 오디오 런타임 상태를 저장 스키마로 새로 추가하지 않음. 명시 source payload에 이들 개별 필드 없음;동적 외부확장 전체는 **미확인** |

실제 설정 사운드 탭은 외부 `ui-panels.js:76/112`가 optSfx/optBgm/optBgmTrack 기존 행을 이동한다. 새 UI가 기존 leaf/listener를 보존하는지 후속 실제화면에서 확인한다.

## 2. 사운드 설계 docs와 원본의 불일치·공백 (표로만 보고)

`docs/6사운드디자인/` 8문서를 기준으로 조사했다. 아래는 정정 명령이나 디자인 변경 승인이 아니다. 예정·과거이력은 현행 구현과 분리한다.

| id | 설계 근거 | 원본 근거·관측 | 분류 / 후속 판정 |
|---|---|---|---|
| D01 | 6사운드디자인.md:223–235 스테이지별 여러 곡 | game3985–3992 hell1~7 각1;나머지gameplay50,warintro별도 | 현행 표 불일치 |
| D02 | 동문서:258–303 hell1 3곡/27직접+12category+auto | HTML2735–2814 t:57/나머지16/전체73 | UI 수·목록 불일치. 기존 TRACE-SETTINGS 검산과 일치 |
| D03 | 동문서:158–162 이동vol.03~.4·CD50~100 | game38672 max(.03,.35×(1−d/1000)),60~119f | 수치 불일치 |
| D04 | 동문서:318 AMB=m_* | game12242 m_*/crawl은PROJ1,amb_*만0 | 정책 불일치;SND-01은 원본 분류 보존 |
| D05 | 동문서:314 DEATH=monster_die* 일반화 | game12239는 monster_die1만;12345 category는monster_die* | 우선순위/카테고리 조건 다름. monster_die2는priority2/categoryg_death |
| D06 | 동문서:311/323/455 ‘항상/100% 재생 보장’ | game12255 missing buffer drop;12267/12250 동률VOICE 포화거부;12341 mappedvoice10초제한 | 보장 범위 과장. 실제 가청 보장 **미확인** |
| D07 | 동문서:321–322 HIT/PROJ cap 설명 | game12263–12265 HIT검사는<=2 전체(PROJ포함),PROJ는<=1 별도branch | 두 cap의 정확 포함관계 보충 필요 |
| D08 | 동문서:455 player_dead*와 같은g_voice | game12342–12354 raw player_dead1은자기category;silvertail_dead1은g_voice | 분류 불일치(VOICE numeric9는동일) |
| D09 | 주제가_SUNO_프롬프트.md:86 부근 전쟁=cutscene_warintro | game62934–62940 PRO는cutscene_prologue,warintro보존·미사용주석 | 같은문서 후속예외와의 이력/현재표 구분 필요 |
| D10 | 6사운드디자인.md:457–529 VoiceDirector 확장 | game12327–12341 map/cooldown은있으나 해당가족별priority/쿨/HP전이director없음 | **예정·미구현**, 이번에구현하지 않음 |
| D11 | 같은문서 master 설명 및 source12405 ‘Convolver Reverb’ | game12408–12460 실제convolver생성0,helpers는mbus직결·subbus통과아님 | 선언·주석과실제연결 구분 필요 |
| D12 | 같은문서:193 gameplay50/17remaster | game4003–4033 실제50/17 | **일치**. 다만allRandom57entries/중복가중치 미기재 |
| D13 | 같은문서:810–870 fade/queue/loop예외 방어 | game4106–4206/12253–12326/12563–12694 | **해당좁은경계일치**,실음향완성 아님 |
| D14 | sound 설계폴더에 명확한 동명이식 설명 없음 | game12549음향_startLoop와60469게임_startLoop동명 | 실행권위충돌/정보공백. 실제사용가능generic음향API로 가정 금지 |
| D15 | SFX_MAP/파일 routing을 기능분모로 보는 inventory game10359 | game10359맵의실제두HTML소비없음;실제SFX객체/샘플맵별도 | inventory 분모의근거행만으로active완료판정불가 |
| D16 | volume 설계·설정UI | game6311bgm60/3981_vol.3/2733초기30/49331의0→30표시 | 서로다른초기·표시경로,동일볼륨주장불가 |
| D17 | sample map 등록 공백 | bow_shot(12601)/ui_cancel(13227)은등록없음. voice_cooldown/resource_fail도공용등록없으나char1치환후실버테일키존재 | unmapped silent/치환의존구분;player_hit+번호/player_dead+번호는prefix검색이므로누락키로오판금지 |
| D18 | BISQO_MAGIC_HIT/PROJECTILE_PLAYER_HIT 문서 | sample3alias·100ms/.55/PROJ1·playerhit8은원본일치 | Godot동일WAV자산/전체경로는미이식. 후보/ElevenLabs3종문서는미채택이력 |
| D19 | 보석_장착음_20260927.md:5 | game12833–12838 sample.38/1.12+noise.025+tone.14+65ms후tone.19 | **일치**. Godot미이식 |

## 3. 실제 Godot 의존·공백·검증 한계

| 의존 | 실제 파일·행 / 테스트 본문 | 판정·재사용 경계 |
|---|---|---|
| 현재 OPT owner | `port_modules/npc_interaction/source_options_state.gd:8–16/24–80`;`scripts/native_source_player_initialization_services.gd:155–162/489–492`;`tests/test_native_main_source_player_initialization.gd:201–203` | sfx60/bgm60/auto가현존. 실제dict identity reader 재사용. 설정저장복원은미완. 새OPT owner중복금지 |
| 기본공격·기검참·일반피격음 | `scripts/main.gd:1898–1947/1972–2177`;`player.gd`request_native_attack_sound caller | **이미이식된의존만**. 8공격+사망21=Main 등록29 (fireball은 별도 요청 경로이며 loader_bound=false). actual Main/World/player/currentOPT guard·동적bus2개·sampledecode·queue·cleanup존재. 범용classifier/PROJ/STEP/voice/공간음전체아님 |
| 사망음부분 | `main.gd:1075–1108/1932–1939`,hurtE실제kill호출;`tests/test_p2001c_kill_rewards.gd:151–152/197/281–283` | HUMANOID/BONE첫전투변형과dispatchcounter테스트. 원본boss/ghoul/전체종족dispatch를완료로승격금지. 테스트는ready/counter를확인하며가청PCM·청취단정없음 |
| 시작스킬음 | `scripts/native_skill_slots.gd:113–118/294–297/337/365–367/498–507/542/674`;`tests/test_p2005b_giant_slam.gd`,`test_p2005c_spike_holy.gd`,`test_p2005d_ice_orb.gd` | 별도AudioStreamPlayer2D:heavyhit/spike/holyvoice/ice/chain등. holy2음성은부분존재하므로‘voice전부없음’아님. 실버테일map/10000ms/directult/mixer일치미완. skill helperbus미지정→Master,OPT.sfxVol소비없음. 기존부분미수정 |
| 실제자산 | `godot/assets/sfx/{attack_source,death,skill}` 36개MP3;부록Bnative동일byte열 | 36개전부원본_sampleFiles의어떤파일과SHA-256일치. byte동일은사용·gain·청감동일증거아님. BGM/WAV전체 sample233이식완료아님 |
| fireball dispatcher | `main.gd:2385–2436` | 미로드 fireball drop/표현된 gxVolMul/API가 현재 의존. 실제 fireball MP3는 Main 필수 등록29개에 없고 loader_bound=false. 전역궁극mute전체와별개 |
| postStage의BGM callback seam | `port_modules/source_post_stage_owner/producer.gd:62–63/226–235`;`main.gd:469–477` | 프로듀서는bgm_stage_key/bgm_play필수callback이있으나Main configure에는둘다없음. callback선언만으로자연BGM이식으로판정금지. 기존모듈의옛64475행은현재game64036등과재대조필요 |
| BGM·로비·영상 | 전체tracked `godot/` gd/godot/tscn검색 | 원본tracks owner/HTMLBGM lifecycle/로비WorldIntro music owner발견못함: **미이식**. 외부WIP/실행export는미확인 |
| 믹스·재생수명전체 | `main.gd:2070–2171`;`native_skill_slots.gd:498–507` | Main은volume_bus×voice/timeout/owner_exit있으나EQ/comp없음(snapshot false). skilloneshot은finished→queue_free뿐. genericloop/shield/beam/contextunlock프리로드4워커는동등미이식 |
| 펫대사 | `native_pets.gd`·P2-004b | 대사text822검사와음성AudioBuffer는다른범위. 펫text완료를soundvoice완료로해석금지 |

### 3.1 이번에 실제 실행한 검증

| 검증 | 결과·한계 |
|---|---|
| read-only Node 기존10파일 | `node --test test/{audioBootLoading,audioContextResumeGate,footstepAudioPriority,silvertailFemaleVoice,testCharacterVoiceIdentity,itemPickupSound,itemEquipSound,itemDropSound,kiSlashSwingSound,projectilePlayerHitSound}.test.js` → **exit1,18tests/13pass/5fail**. 테스트·패키지변경0 |
| 통과한범위 | preload2/resume2/footstep3/drop1/kiSlash1/silvertail2/demoIdentity2. Node VM대역/정적검사이며Godot가청인수아님 |
| 실패4건 | itemEquip/itemPickup 각regex기대불일치;testCharacterVoiceIdentity의_startTestChar0/1 각`Illegal return statement`(발췌본문의기존earlyreturn). 원본제품오류인지구형테스트인지전체판정은 **미확인**;고치지않음 |
| 차단1건 | projectilePlayerHitSound는`ERR_MODULE_NOT_FOUND: acorn`(WT의의존없음). **해당검증 BLOCKED**,설치/다른WTnode_modules연결등우회없음. 문서추적자체차단아님 |
| source oracle | 실제원문분류기4개를NodeVM에추출,23대표key분류값관측. m_melee1/death_ghoul1 g_death/player_dead1 rawcategory/monster_die2priority2확인. 실제리터럴평가233samples/18SFX_MAP/8BGM_MAP/42voiceMap/19BGMpools·gameplay50/allRandom57확인. 새테스트파일작성0 |
| 파일검산 | 원본233sample물리파일누락0(query제거). native36MP3모두원본같은byte상대경로와대조. 사용경로별전수참조는부록 |
| Godot테스트 | 위실제test본문/단정/skipgate확인. **이번Godot suite재실행0**,import/build/override/project설정변경0. 기존다른담당QA·실창측정과겹치는게임부팅안함 |
| 미확인 | browser실원본청취·autoplay·실제WebAudio/OSdevice·headless외GodotPCM·실스피커·PC실행·실세이브·전체소리성능·청감동등성. 어느것도PASS로승격하지않음 |

## 4. 작은 이식 단위 순서안

### 4.1 1번 SND-01 — 순수 SFX 분류·한도 정책 (다음 차례 바로 구현)

**공용 파일 0줄, 기존 전투음·옵션·스킬파일 수정0.** 한도/키분류 데이터와 네 개의 순수 판정만 옮긴다. 큐·재생기 연결은 SND-03 이후다.

| 항목 | 구현 지시 |
|---|---|
| 신규파일2개 | `godot/port_modules/sound_source/policy.gd`, `godot/tests/test_sound_source_policy.gd`. 둘다기준HEAD에없음. 추적문서는구현상태/실제검증만후속갱신. main/world/player/hud/state/hurtE/project.godot등기존제품·테스트0줄 |
| 형태 | `extends RefCounted`;`class_name`전역등록없음. static또는인스턴스순수함수 `is_footstep(key: String)->bool`, `is_skill(key: String)->bool`, `priority(key: String)->int`, `category(key: String)->String`, `limits(is_mobile: bool)->Dictionary`, `skill_keys()->Array`. clock/RNG/Node/tree/audio/IO/autoload생성0 |
| source1 | game12220–12245: active/category/frame/proj/hit/step한도,PRI8개,footstep/priority분기. 12342–12356:category/skill분기29keys. eviction/body/queue·CD·gain·판정Q/E의미는이단위밖 |
| limits반환키6개 | `active_nodes,category_per_frame,samples_per_frame,proj_nodes,hit_nodes,step_nodes`. desktop=`48,2,6,5,3,2`,mobile=`16,1,3,2,2,2`. **새로고정하는API키명**이며원본저장필드가아님. 매번독립Dictionary,두호출간mutation누출0 |
| PRI원순서 | player_projectile_impact→8;footstep/2→3;player_dead prefix→9;voice_/male_grunt/silvertail_→9;ghost_laugh→9;boss_→10;is_skill→10;death_또는exactmonster_die1/death_grunt→4;bullet_hit/bean_hit/bolt_hit→1;monster_hit*/flat_hit/player_hit*/melee_hit1→2;m_*/monster_crawl/monster_crawl1→1;amb_→0;그외2. **분기재정렬·정규화·타입coercion추가0** |
| skill_keys29개 | shield_activate,shield_hit,shield_end,heavy_hit,bow_shot,bow_release,fire_magic1,fire_magic2,fireball,crossbow_shot,electric_storm,electric_storm2,electric_storm3,electric_storm4,repentance,chain_throw,chain_fly,chain_land,chain_land2,chain_stick,chain_dash,chain_dash2,chain_dash3,chain_dash4,skull_summon,blue_hit,beam_fire,q_parry,sword_parry.동일순서freshArray. is_skill은이집합ORprefix chain_/electric_storm/fire_magic/sword_swing |
| category원순서 | monster_hit*/flat_hit→g_monHit;death_*/monster_die*→g_death;boss_hit/monster_hurt→g_bossHit;sword_swing*→g_swing;chain_dash*→g_chainDash;voice_*/male_grunt/silvertail_*→g_voice;fire_magic*→g_fireMagic;electric_storm*→g_eStorm;death_ghoul*→g_ghoul;그외원key. **death_ghoul은앞death분기로g_death**. 의도추정으로g_ghoul을살리지않음 |
| 입력도메인 | String만지원하는새nativeAPI,임의StringName/null/int를str()로변환하지않음. JS비문자key의startsWith예외와네이티브typed호출거부가같다는주장은금지. 대소문자·공백·빈문자그대로 |
| 테스트파일·격리 | `test_sound_source_policy.gd`,격리명 **`EXODUSER-SND01-Policy-Isolated-20261020`**. 새테스트는SceneTree에서이모듈만preload/Main부팅0. 프로젝트custom userdir설정이이값인지검사하고,다르면명시실패exit1(실행skip을PASS로표시금지). 구현차례의runner격리설정방법은그때허용범위에서정하고project기본userdir수정금지 |
| 핵심단정A | limits두플랫폼exactkeyset/값;PRI8exact;skillKeys29exact 순서/독립copy. emptykey→priority2/category''/skillfalse/footfalse. uppercase'FOOTSTEP'→2/원문;skill반환array수정후다시29개보존 |
| 핵심단정B | 표본(priority/category/skill/foot):footstep=(3,footstep,F,T),footstep2동형;m_melee=(1,m_melee,F,F);monster_crawl1=(1,원key,F,F);amb_x=(0,원key,F,F);player_projectile_impact=(8,원key,F,F);player_dead1=(9,원key,F,F);silvertail_dead1=(9,g_voice,F,F);ghost_laugh=(9,원key,F,F);boss_howl=(10,원key,F,F);death_ghoul1=(4,g_death,F,F);monster_die2=(2,g_death,F,F) |
| 핵심단정C | chain_fly=(10,원key,T,F);chain_dash9=(10,g_chainDash,T,F);sword_swing7=(10,g_swing,T,F);fire_magic_extra=(10,g_fireMagic,T,F);electric_storm_tail=(10,g_eStorm,T,F);bow_shot=(10,원key,T,F);boss_hit=(10,g_bossHit,F,F);monster_hurt=(2,g_bossHit,F,F);flat_hit=(2,g_monHit,F,F);player_hit1=(2,원key,F,F);melee_hit=(2,원key,F,F);voice_wakeup=(9,g_voice,F,F) |
| 검증 방법 | 원본의 실제 4개 함수·상수를 메모리로 추출한 Node oracle과 동일 입력을 대조한다. 본문의 기대값을 임의 정정하지 않는다. 233개 등록 key의 기대 분류는 부록 B에도 기록한다. 경계·미등록 key를 포함해 검증하며 결과 JSON에 assertions/failures/isolated/Main_booted=false를 기록한다 |
| 선행·충돌 | standalone이므로 선행 owner가 필요 없다. q_parry/sword_parry라는 **샘플 key 문자열**만 분류하며 Q/E 본체를 실행하지 않는다. 현재 보드의 제품·테스트 소유와 충돌 없음. 구현 전 최신 main의 기준 차이와 신규 2경로 부재를 다시 확인한다 |
| 완료 경계 | 순수 policy의 격리 테스트까지다. 재생·BGM·voice·믹스 완성, 기존 전투음 교체, 자연 frame 연결 완료로 보고하지 않는다. 코드 변경 뒤 docs 전체 관련 keyword 검색 → 본 추적의 구현 상태·검증 기록 갱신 → 코드와 본 문서만 경로 지정 commit한다 |

### 4.2 후속 단위 (전부 미착수)

각 단위의 명칭·파일명은 **신규 제안 API**다. 기존 인수 파일을 이 이름으로 재명명하지 않는다. 공용 접점은 §5의 총괄 조정 전까지 HOLD다.

| 순서 | 신규/수정 파일 | 원본 행·옮길 상수/공식 | 새 테스트·격리폴더·핵심 단정 | 선행·충돌 |
|---|---|---|---|---|
| SND-02 샘플catalog | 신규 `port_modules/sound_source/catalog.gd`, `data/sound_source_samples.json`;기존0줄 | 10076–10331 sample233/voiceMap42/SFX_MAP18은별도이름공간. query·alias·대소문자그대로,프로시저럴을파일로대체0. byte복사는아직0 | `tests/test_sound_source_catalog.gd`;`EXODUSER-SND02-Catalog-Isolated-20261020`. exact233keys/paths·42map·18routes,alias보존·unknown없음상태·새copy불변 | SND-01,기존ATTACK_SAMPLE_PATHS읽기만. 자산233전체복사를첫단위에묶지않음 |
| SND-03 frame queue순수phase | 신규 `port_modules/sound_source/queue_phase.gd`;기존0줄 | 12358–12370/12296–12326:30ms·jitter.92+.16r·unshift LIFO·frame/category cap·중복gain/pitch·finally폐기. clock/RNG/dispatch를injected callbacks로분리 | `test_sound_source_queue.gd`;`EXODUSER-SND03-Queue-Isolated-20261020`.30ms직전/경계,우선역순/제한우회,n0/1/2의1/1/.5,최저.08/.7,throwprefix후queue비움·재실행없음,원RNG호출 순서 | 01/02. 기존전투queue교체0. 자연frame 연결 전fixture범위 |
| SND-04 voice선택상태 | 신규 `port_modules/sound_source/voice_selector.gd`;02의map읽기;기존0줄 | 12327–12341/10065–10073:char1map42,10000ms·3/2eligible랜덤·사전stamp. callbackclock/RNG. directvoice bypass정책표만 | `test_sound_source_voice_selector.gd`;`EXODUSER-SND04-Voice-Isolated-20261020`.9999차단/10000허용,3종소진무음/RNG0,다른char원key,unmappedwakeup불변,direct과sample공유stamp·두instance격리 | 02. charowner상실/실제 파일 재생은후속. 신VoiceDirector계획구현0. 기존holy2voice중복caller변경0 |
| SND-05 BGM catalog/선곡 | 신규 `port_modules/sound_source/bgm_catalog.gd`,`bgm_selection.gd`;기존0줄 | 3982–4037/4054–4090:19pool/50gameplay/57전체entries,중복가중치·bad제외·actset. SI map는readonly제공,invalidsi지원밖명시. legacyBGM_MAP분리data만 | `test_sound_source_bgm_selection.gd`;`EXODUSER-SND05-BgmSelect-Isolated-20261020`.각장1/첫 곡/재입장reset/전체57·중복 보존/last재추첨RNG횟수/전부bad null | source장map의정본확인;무한재추첨가능한주입RNG를임의cap으로제품변경금지. 공용0줄 |
| SND-06 BGM전이수명모델 | 신규 `port_modules/sound_source/bgm_lifecycle.gd`;기존0줄 | 4042–4053/4091–4207:cache6,50msfade/Audioidentity·pending/listener5종·force잠금·intro게이트·이벤트ended예외. Media backend주입 | `test_sound_source_bgm_lifecycle.gd`;`EXODUSER-SND06-BgmLife-Isolated-20261020`. t잠금/force뒤INTRO막힘,death/victoryended없음,같은cachedAudio재시작뒤옛fade무효,LRU현재객체보존,error300ms,stop의pending미삭제 | 05;browserautoplay와Godotdevice차이명시. 독립fake backend만,실곡0·공용0줄 |
| SND-07 실제sample수명·버스 | 신규 `scripts/native_sound_backend.gd`,`port_modules/sound_source/node_admission.gd`;필요자산은자기새`assets/sfx/sound_source/`한묶음만bytecopy. 기존main0줄우선 | 12246–12295/12372–12386:48/16·PROJ/HIT·STEP2·oldest·cleanup·duration+.5·falloff1200/800²·pan600/.7. mbus는08로구분 | `test_sound_source_backend.gd`;`EXODUSER-SND07-Backend-Isolated-20261020`.동률VOICE거부/SKILL교체,STEP자기oldest,finished+timeout1회정리,ownerexit/손실,공간좌우·거리1200/2000·OPT음량0, vol=0의원본(vol\|\|1)fallback | 01–04. 기존attackbackend read-only,공동48상한으로통합하려면별도총괄소유확정. headless상태검사≠청감/PCM |
| SND-08 믹스·비전투합성 작은묶음 | 신규 `scripts/native_sound_mix.gd`,`port_modules/sound_source/synthesis.gd`,`cue_recipes.gd`;기존0줄 | 12408–12545/12756–12776/12827–12840:EQ3/mastercomp,동일gain중복,SFX.click/pickup/potion/forge/crystalEquip원레시피. Tone/Noise/Dist/FM 끝주파수 하한20Hz·Sub 하한8Hz와 원본 연산 순서 | `test_sound_source_mix.gd`,`test_sound_source_cue_recipes.gd`;`EXODUSER-SND08-Mix-Isolated-20261020`.0/60/100gain·각 층envelope·potion0/55/110/170ms·crystal65ms·cancel오래된노드·유한PCM | 07,Godot effect가WebAudioQ/knee/ramp와정확동등인지**미확인**. 리샘플/효과대체를완료로포장금지. QS-07은potion요청의caller만소유 |
| SND-09 음악 실제재생 | 신규 `scripts/native_bgm.gd`,`assets/bgm/source/`의검수할1곡bytecopy;06backendadapter수정;Main configure후속최소접점 | 3980–4212/31669/35877–35881·43872/43899. HTMLaudio주경로만먼저,legacy bgmPlay의 2초 전환을 자연 경로로 승격하지 않음 | `test_sound_source_bgm_runtime.gd`;`EXODUSER-SND09-BgmRuntime-Isolated-20261020`.decode/곡끝/한활성곡·fade/owner종료/볼륨0·sourcekey전이,실곡PCM별도.자연stage/forge/death전환화면+녹음별도 | 05/06/08·actualstage/boss/forgeowner 필요. main/postStage공용조정 전연결HOLD,미이식boss/forge를fixture완료로대체0 |
| SND-10 비전투효과·voice 연결 | 신규 `scripts/native_sound_events.gd`;main/configure·각기능소유자호출점만협의수정 | 16263–16271/16721/63403–63407/10047–10073. drop45ms/loot/equip·introasyncguard·ult.3/.5초·voice 직결. 이미 이식된 전투음은변경대상아님 | `test_sound_source_event_binding.gd`;`EXODUSER-SND10-Events-Isolated-20261020`.event1회/늦은wakeupskip0회·drop 등급/preview무음·directvoice는master0에서도출력·종료후callback0 | 04/07–09,TRACE-INVENTORY/SETTINGS/QUICKSLOT·introowner합의. Q/E/shield/beamcaller는보호·이단위연결제외 |
| SND-11 로비·영상별도slice | 신규 `scripts/native_lobby_audio.gd`,`native_cinematic_audio_bridge.gd`;로비scenehost(현재**미확인**) | index2244–2297/2495–2549/3776–3813,world-intro-player5–78: .65/.6/.22/voice1·1초50msfade·hover.1/.08/100ms·enter2gain | `test_sound_source_lobby_lifecycle.gd`;`EXODUSER-SND11-Lobby-Isolated-20261020`.동일곡playhead유지/skip둘다정지·이전 hover stop이새src미침범·재진입22/100·autoplayerrorUI | 09/10,로비·cinematicowner/영상codec먼저. index UI/저장을 설정팀과중복구현0. 실제재생·청취·PC/Mac인수별도 |

SND-08은 여러 레시피를 한꺼번에 구현하지 않고 **click/pickup → potion → forge/crystal** 순서의 별도 검수 소단위로 나눈다. SND-10의 궁극기와 SND-11 로비도 선행 게임 owner가 없으면 해당 항목을 BLOCKED로 남기고 원본 호출 순서를 우회하지 않는다. shield/beam/Q/E 연결은 이 설계가 승인하는 신규 구현 범위가 아니다.

## 5. 공용 파일 접점 (이번 수정 모두 0줄)

| 공용/타인 파일 | 현재 위치·읽기/후속 연결 후보 | 충돌·최소 경계 |
|---|---|---|
| `scripts/main.gd` | 276install/491dispose/941advance,469–477postStage,1898–2177attackbackend | SND01–08 공용0줄.09이후 새owner필드1/configure약4–8줄/exit약1줄·natural request 약1–2줄씩 **후보**. exact위치·행 수는 구현 시 확정. 기존attack/body재작성0·Treepause/시계소유합의 |
| `scripts/world.gd` | actualstage/boss/enemyregistry·sourceframe | SND01–08 0줄.09event연결주체world인지Main인지**미확인**.이미동적spawn중인P3-002에음향 재바인딩을중복삽입금지 |
| `scripts/player.gd` | request_native_attack_sound/start/hit_arc·charprofile | 기존이미 이식된 음의존만. Q/E/공격입력/자원수치0줄. voicechar는read-onlyprofile,이파일에전역audioowner신설금지 |
| `scripts/hud.gd` | pause/settingshost및skillcooldown | TRACE-SETTINGS S02/S08 소유.신soundUI독자추가0줄. OPT 음량의leaf제어만담당간연결 |
| `scripts/native_normal_enemy_hurte.gd` | 180부근기존피격음,kill→deathdispatch | 이미 이식된 의존. 이번·01모두0줄,보상/전투RNG/죽음필수순서건드리지않음 |
| `scripts/native_source_new_run_state.gd` | currentG/P·저장/복원·시간 | sound owner는재생수명별도소유,오디오상태를P/G/세이브에추가0줄. immutable보호표시만 |
| `scripts/native_skill_slots.gd` | 113–118/294–297/365–367/498–507 등 | 기존전투음의존만. 공통mixer로옮길필요는밝히되이번trace와01에수정0. 실제이관은스킬owner 별도 작업·회귀인수필요 |
| `native_source_player_initialization_services.gd` / `npc_interaction/source_options_state.gd` | actualread_current_options489–492/defaults8–16 | existingdict공유,settings의persist/restore권한확장0. field추가·원옵션수정0 |
| `source_post_stage_owner/producer.gd` | bgm_stage_key/play필수callback226–235 | 기존필수boss_request/force등부족을dummy로채우지않음. 실제자연 postStage연결범위확정후BGM2callback만후속배선후보 |
| 설계/보호 docs | docs/6사운드디자인8문서/설정·저장trace/docs2_3 | 이번1파일외수정0. 불일치는§2표만. 다음코드단위의docs검색/정확현재계약은본trace에기록·설계 변경은 별도 지시 |

## 6. 인계·검수 경계

이 문서의 완료는 **고정 main 원본 추적·불일치 표·기존 의존 확인·다음 구현 지시서 작성**이다. Godot 전체 사운드 구현/원본 테스트 전체 PASS/실음향·화면·PC 인수를 뜻하지 않는다. 종합 결과는 위 13통과/5실패를 그대로 보존한다. 다음 차례는 **SND-01 신규2파일+본 추적의 구현기록**이며, 공용 파일 수정 권한을 묵시적으로 확대하지 않는다.

이하 부록은 동일 HEAD의 실제 파일에서 기계적으로 추출한 **정적 색인**이다. ‘참조 없음’은 두 HTML의 명시 토큰/리터럴 검색 기준이며 외부·동적 참조의 부재 증명이 아니다. 원문 공식의 `||`는 표에서 `\|\|`로만 이스케이프한다.

## 부록 A. 음악 풀·두 라우팅 맵 전체

동일 원문 리터럴을 메모리에서 평가했다. 배열 순서·중복·경로 철자를 보존한다. 파일 존재는 선택 성공·재생 성공을 뜻하지 않는다.

| BGM.tracks key | 경로 (배열 순서) | game.html 문자열 행 전체 | 물리파일 존재 |
|---|---|---|---|
| lobby | bgm/공통/lobby.mp3 | 3983 | True |
| hell1 | bgm/1장_썩은숲/Ashes of the Fallen Gate.mp3 | 3985, 4009 | True |
| cutscene_warintro | bgm/1장_썩은숲/h0_explore.mp3 | 3986 | True |
| hell2 | bgm/2장_벌레굴/hell2_insect.mp3 | 3987 | True |
| hell3 | bgm/3장_얼음굴/hell3_fire.mp3 | 3988 | True |
| hell4 | bgm/4장_화염지대/hell4_abyss.mp3 | 3989 | True |
| hell5 | bgm/5장_지옥군단/hell5_thunder.mp3 | 3990 | True |
| hell6 | bgm/6장_사도마굴/hell6_bone.mp3 | 3991 | True |
| hell7 | bgm/7장_지옥성/hell7_chaos.mp3 | 3992 | True |
| cutscene_prologue | bgm/cutscene/prologue_theme.mp3 | 3994 | True |
| cutscene_prologue | bgm/cutscene/prologue_theme_abyssal_fracture.mp3 | 3995 | True |
| cutscene_prologue | bgm/cutscene/prologue_theme_rebirth_gate_1.mp3 | 3996 | True |
| cutscene_prologue | bgm/cutscene/prologue_theme_rebirth_gate_2.mp3 | 3997 | True |
| cutscene_nemesis | bgm/공통/네메시아의 강림 V3.mp3 | 3998, 4006 | True |
| cutscene_goddess | bgm/cutscene/cutscene_goddess_1.mp3 | 3999 | True |
| cutscene_goddess | bgm/cutscene/cutscene_goddess_2.mp3 | 3999 | True |
| cutscene_goddess_en | bgm/cutscene/cutscene_goddess_en_1.mp3 | 4000 | True |
| cutscene_goddess_en | bgm/cutscene/cutscene_goddess_en_2.mp3 | 4000 | True |
| boss | bgm/공통/boss.mp3 | 4001 | True |
| finalboss | bgm/공통/finalboss.mp3 | 4001 | True |
| gameplay | bgm/공통/Just One More Hill V4.mp3 | 4005 | True |
| gameplay | bgm/공통/Just One More Hill V5.mp3 | 4005 | True |
| gameplay | bgm/공통/네메시아 강림V5.mp3 | 4006 | True |
| gameplay | bgm/공통/네메시아의 강림 V3.mp3 | 3998, 4006 | True |
| gameplay | bgm/공통/네메시아의 강림.mp3 | 4006 | True |
| gameplay | bgm/공통/Coronam Ferro.mp3 | 4007 | True |
| gameplay | bgm/공통/Coronam Ferro V2.mp3 | 4007 | True |
| gameplay | bgm/1장_썩은숲/Ashes of the Fallen Gate.mp3 | 3985, 4009 | True |
| gameplay | bgm/1장_썩은숲/hell1_ice.mp3 | 4009 | True |
| gameplay | bgm/1장_썩은숲/Bloodsteel Ascension.mp3 | 4010 | True |
| gameplay | bgm/1장_썩은숲/Bloodsteel Ascension 2.mp3 | 4010 | True |
| gameplay | bgm/1장_썩은숲/Exoduser.mp3 | 4011 | True |
| gameplay | bgm/1장_썩은숲/Exoduser2.mp3 | 4011 | True |
| gameplay | bgm/1장_썩은숲/Exoduser3.mp3 | 4011 | True |
| gameplay | bgm/1장_썩은숲/Exoduser2.1.mp3 | 4011 | True |
| gameplay | bgm/1장_썩은숲/Blood Moon Siege.mp3 | 4012 | True |
| gameplay | bgm/1장_썩은숲/Blood Moon Siege2.mp3 | 4012 | True |
| gameplay | bgm/1장_썩은숲/Wrath of the Golden Age.mp3 | 4013 | True |
| gameplay | bgm/1장_썩은숲/Iron Oath Under Ash.mp3 | 4013 | True |
| gameplay | bgm/1장_썩은숲/Neon Hellfire Protocol.mp3 | 4014 | True |
| gameplay | bgm/1장_썩은숲/Neon Hellfire Protocol (1).mp3 | 4014 | True |
| gameplay | bgm/1장_썩은숲/Ashes Under the Banner.mp3 | 4015 | True |
| gameplay | bgm/1장_썩은숲/Blade Choir of the Black Citadel.mp3 | 4015 | True |
| gameplay | bgm/1장_썩은숲/Cathedral of Steel.mp3 | 4016 | True |
| gameplay | bgm/1장_썩은숲/Cathedral of Steel (1).mp3 | 4016 | True |
| gameplay | bgm/2장_벌레굴/Carapace Cathedral.mp3 | 4018 | True |
| gameplay | bgm/3장_얼음굴/Abyssal Drift.mp3 | 4019 | True |
| gameplay | bgm/4장_화염지대/Ignis et Sanguis.mp3 | 4020 | True |
| gameplay | bgm/4장_화염지대/Inferno Liturgia.mp3 | 4020 | True |
| gameplay | bgm/5장_지옥군단/Abyss Below.mp3 | 4021 | True |
| gameplay | bgm/6장_사도마굴/Kiln of Broken Crowns.mp3 | 4022 | True |
| gameplay | bgm/7장_지옥성/Midnight Cathedral of Ash.mp3 | 4023 | True |
| gameplay | bgm/7장_지옥성/Teeth in the Choir.mp3 | 4023 | True |
| gameplay | bgm/공통/네메시아의 강림3(Remastered).wav | 4025 | True |
| gameplay | bgm/공통/네메시아의 강림2 (Remastered).wav | 4025 | True |
| gameplay | bgm/공통/네메시아 강림 (Remastered).wav | 4025 | True |
| gameplay | bgm/공통/Coronam Ferro2(Remastered).wav | 4026 | True |
| gameplay | bgm/공통/Coronam Ferro (Remastered).wav | 4026 | True |
| gameplay | bgm/공통/Just One More Hill (Remastered) 2.wav | 4027 | True |
| gameplay | bgm/공통/Just One More Hill (Remastered).wav | 4027 | True |
| gameplay | bgm/공통/고개 하나만 (Remastered) 2.wav | 4028 | True |
| gameplay | bgm/공통/고개 하나만 (Remastered).wav | 4028 | True |
| gameplay | bgm/3장_얼음굴/흰눈의 맹세2 (Remastered).wav | 4029 | True |
| gameplay | bgm/3장_얼음굴/흰눈의 맹세 (Remastered).wav | 4029 | True |
| gameplay | bgm/1장_썩은숲/Ashes Under the Banner (Remastered).wav | 4030 | True |
| gameplay | bgm/1장_썩은숲/Cathedral of Steel (Remastered).wav | 4030 | True |
| gameplay | bgm/1장_썩은숲/Neon Hellfire Protocol2(Remastered).wav | 4031 | True |
| gameplay | bgm/1장_썩은숲/Neon Hellfire Protocol (Remastered).wav | 4031 | True |
| gameplay | bgm/1장_썩은숲/Iron Oath Under Ash (Remastered).wav | 4032 | True |
| gameplay | bgm/1장_썩은숲/Wrath of the Golden Age (Remastered).wav | 4032 | True |
| forge | bgm/공통/forge.mp3 | 4034 | True |
| forge | bgm/공통/복수의 대장간.mp3 | 4034 | True |
| forge | bgm/공통/Anvil Ashes.mp3 | 4034 | True |
| death | bgm/공통/death.mp3 | 4035 | True |
| death | bgm/공통/지옥 추락 사망 징글.mp3 | 4035 | True |
| victory | bgm/공통/victory.mp3 | 4036 | True |
| victory | bgm/공통/탈출 성공.mp3 | 4036 | True |


### A.2 BGM_MAP (직접 호출 미확인)

| key | 경로 | game.html 문자열 행 | 물리파일 존재 |
|---|---|---|---|
| 0.explore | bgm/h0_explore.mp3 | 10383 | False |
| 0.boss | bgm/h0_boss.mp3 | 10383 | False |
| 1.explore | bgm/h1_explore.mp3 | 10384 | False |
| 1.boss | bgm/h1_boss.mp3 | 10384 | False |
| 2.explore | bgm/h2_explore.mp3 | 10385 | False |
| 2.boss | bgm/h2_boss.mp3 | 10385 | False |
| 3.explore | bgm/h3_explore.mp3 | 10386 | False |
| 3.boss | bgm/h3_boss.mp3 | 10386 | False |
| 4.explore | bgm/h4_explore.mp3 | 10387 | False |
| 4.boss | bgm/h4_boss.mp3 | 10387 | False |
| 5.explore | bgm/h5_explore.mp3 | 10388 | False |
| 5.boss | bgm/h5_boss.mp3 | 10388 | False |
| 6.explore | bgm/h6_explore.mp3 | 10389 | False |
| 6.boss | bgm/h6_boss.mp3 | 10389 | False |
| title | bgm/title.mp3 | 10382 | False |


### A.3 SFX_MAP (소비 미발견)

| 논리 key | 원본 리터럴 | game.html key 문자열 행 |
|---|---|---|
| hit_sword | {"type": "procedural", "fn": "slash"} | 명시 참조 없음 |
| hit_magic | {"type": "procedural", "fn": "magic"} | 명시 참조 없음 |
| hit_enemy | {"type": "procedural", "fn": "hit"} | 명시 참조 없음 |
| hurt_player | {"type": "procedural", "fn": "hurt"} | 명시 참조 없음 |
| parry | {"type": "procedural", "fn": "parry"} | 3570, 3870, 10364, 13427, 14299, 14319, 14391, 28479, 28644, 29029, 33048, 33049, 33050, 33276, 33365, 33548, 33549, 33550, 33579, 33580, 33581, 33650, 33651, 33652, 33755, 33779, 33812, 33814, 33830, 34062, 34334, 34878, 34879, 34914, 34920, 35089, 43504, 43505, 44309, 44656, 44909, 45410, 47022, 47035, 47283, 47782, 62156, 62231, 63297, 63926, 64083 |
| charge | {"type": "procedural", "fn": "charge"} | 3564, 3798, 3838, 3840, 6238, 6242, 6243, 9821, 9822, 9823, 9825, 9826, 9827, 9828, 9829, 9831, 9832, 9833, 9834, 9836, 9839, 9840, 9841, 9842, 9843, 9844, 9845, 9846, 9847, 9848, 9849, 9850, 9851, 9852, 9854, 9855, 9856, 9857, 9858, 9859, 9860, 9861, 9862, 9863, 9864, 9865, 9866, 9868, 9869, 9870, 9871, 9872, 9873, 9874, 9875, 9876, 9877, 9878, 9879, 9883, 9885, 9887, 9888, 9890, 9892, 9893, 9895, 9897, 9900, 9902, 9905, 9909, 9912, 9914, 9915, 9917, 9920, 9921, 9924, 9925, 9927, 9929, 9930, 9931, 9936, 9937, 9939, 9940, 9941, 9944, 9945, 9946, 9947, 9962, 9963, 9964, 9965, 9969, 9977, 9983, 9992, 9999, 10365, 10914, 12877, 13348, 13429, 17049, 17050, 17051, 20017, 28618, 28642, 29023, 31101, 31109, 31983, 32180, 32213, 32379, 32534, 32571, 33047, 33518, 33526, 33535, 33543, 33566, 33574, 33688, 33695, 33960, 34333, 34341, 34349, 34681, 34694, 34715, 34728, 34741, 34828, 34832, 34856, 34902, 35072, 35073, 35087, 35754, 35817, 36696, 37036, 37055, 37059, 37065, 37067, 37069, 37073, 37131, 37135, 37137, 37141, 37151, 37699, 37701, 37708, 37715, 38287, 38809, 38834, 39815, 39846, 39883, 40096, 40428, 40437, 40535, 40545, 40552, 40582, 40626, 40685, 40705, 40737, 40755, 40768, 40828, 40846, 40882, 40924, 40934, 40961, 41032, 41067, 41093, 41130, 41161, 41263, 41281, 41292, 41314, 41346, 41366, 42589, 42787, 43058, 43413, 43518, 44278, 44654, 44881, 46966, 46978, 47007, 47011, 47015, 47022, 47026, 47035, 47054, 47565, 49876, 55484, 58482, 58606, 58825, 61086, 61119, 61245, 61319, 61326, 61680, 61697, 61980, 62009, 62150, 63297, 63920, 64077, 64426, 65001, 65015, 65066, 65662 |
| die | {"type": "procedural", "fn": "die"} | 10366, 10462, 10570, 27883, 58592 |
| levelup | {"type": "procedural", "fn": "levelup"} | 10367 |
| pickup | {"type": "procedural", "fn": "pickup"} | 10368 |
| potion | {"type": "procedural", "fn": "potion"} | 10369, 25847, 32841, 32947, 32951, 32972, 32976, 41464, 50549, 50555, 50569, 50690, 52562 |
| victory | {"type": "procedural", "fn": "victory"} | 2811, 3193, 4150, 4158, 4167, 10370, 13920, 17129, 43899, 43901, 63474 |
| skill_whirlwind | {"type": "file", "src": "sfx/sk_whirl.mp3"} | 명시 참조 없음 |
| skill_ghostwalk | {"type": "file", "src": "sfx/sk_ghost.mp3"} | 명시 참조 없음 |
| skill_iceorb | {"type": "file", "src": "sfx/sk_iceorb.mp3"} | 명시 참조 없음 |
| skill_omnibeam | {"type": "file", "src": "sfx/sk_omni.mp3"} | 명시 참조 없음 |
| skill_blackstar | {"type": "file", "src": "sfx/sk_bstar.mp3"} | 명시 참조 없음 |
| boss_intro | {"type": "file", "src": "sfx/boss_intro.mp3"} | 명시 참조 없음 |
| boss_die | {"type": "file", "src": "sfx/boss_die.mp3"} | 명시 참조 없음 |


## 부록 B. 샘플 233개·보이스 42개 전수

priority/category/skill/footstep은 **치환 전 해당 key**에 실제 원문 분류기를 호출한 값이다. 매핑 후 key가 달라지면 결과도 달라질 수 있다. 참조 행은 두 HTML의 같은 quoted 문자열 전체(주석 포함)이며 동적 변수·prefix 연결 호출은 부록 D가 보충한다. native byte 열은 전체 파일 SHA-256 비교이며 연결·가청 인수 판정이 아니다.

| sample key | 원본 파일경로/query | game 문자열 행 전체 | index 문자열 행 전체 | priority / category / skill / footstep | Godot 같은 byte 경로 |
|---|---|---|---|---|---|
| sword_slash | sfx/swing/sword_swing1.mp3 | 명시 참조 없음 | 명시 참조 없음 | 2/sword_slash/False/False | godot/assets/sfx/attack_source/sword_swing1.mp3 |
| sword_swing1 | sfx/swing/sword_swing1.mp3 | 12574, 12578, 16787 | 명시 참조 없음 | 10/g_swing/True/False | godot/assets/sfx/attack_source/sword_swing1.mp3 |
| sword_swing2 | sfx/swing/sword_swing2.mp3 | 12574, 12578, 16787 | 명시 참조 없음 | 10/g_swing/True/False | godot/assets/sfx/attack_source/sword_swing3.mp3, godot/assets/sfx/attack_source/sword_swing2.mp3 |
| sword_swing3 | sfx/swing/sword_swing3.mp3 | 12574, 12578, 16787 | 명시 참조 없음 | 10/g_swing/True/False | godot/assets/sfx/attack_source/sword_swing3.mp3, godot/assets/sfx/attack_source/sword_swing2.mp3 |
| spear_thrust | sfx/swing/spear_thrust.mp3 | 명시 참조 없음 | 명시 참조 없음 | 2/spear_thrust/False/False | godot/assets/sfx/attack_source/sword_swing1.mp3 |
| greatsword_swing | sfx/swing/sword_swing3.mp3 | 명시 참조 없음 | 명시 참조 없음 | 2/greatsword_swing/False/False | godot/assets/sfx/attack_source/sword_swing3.mp3, godot/assets/sfx/attack_source/sword_swing2.mp3 |
| sword_back | sfx/sword_parry/sword_back.mp3 | 12389, 38470 | 명시 참조 없음 | 2/sword_back/False/False | 동일 byte 자산 없음 |
| sword_back2 | sfx/sword_parry/sword_back2.mp3 | 12389, 38470 | 명시 참조 없음 | 2/sword_back2/False/False | 동일 byte 자산 없음 |
| sword_back3 | sfx/sword_parry/sword_back3.mp3 | 12389, 38470 | 명시 참조 없음 | 2/sword_back3/False/False | 동일 byte 자산 없음 |
| melee_hit | sfx/hit/melee_hit.mp3 | 명시 참조 없음 | 명시 참조 없음 | 2/melee_hit/False/False | 동일 byte 자산 없음 |
| melee_hit1 | sfx/hit/melee_hit1.mp3 | 12241, 37467 | 명시 참조 없음 | 2/melee_hit1/False/False | godot/assets/sfx/skill/melee_hit1.mp3 |
| flat_hit | sfx/hit/flat_hit.mp3 | 12241, 12344, 24792 | 명시 참조 없음 | 2/g_monHit/False/False | godot/assets/sfx/attack_source/flat_hit.mp3 |
| bullet_hit | sfx/hit/player_projectile_impact.wav?v=bisqo-855371-v1 | 12240, 18731, 35453, 35455 | 명시 참조 없음 | 1/bullet_hit/False/False | 동일 byte 자산 없음 |
| player_projectile_impact | sfx/hit/player_projectile_impact.wav?v=bisqo-855371-v1 | 12232, 17002 | 명시 참조 없음 | 8/player_projectile_impact/False/False | 동일 byte 자산 없음 |
| bean_hit | sfx/hit/player_projectile_impact.wav?v=bisqo-855371-v1 | 12240, 35450 | 명시 참조 없음 | 1/bean_hit/False/False | 동일 byte 자산 없음 |
| heavy_hit | sfx/skillsound/slam/heavy_hit.mp3 | 12355, 12809, 12821, 32393, 32509, 43275, 45652 | 명시 참조 없음 | 10/heavy_hit/True/False | godot/assets/sfx/skill/heavy_hit.mp3 |
| bow_hit | sfx/skillsound/bow/bow_hit.mp3 | 35454, 35624 | 명시 참조 없음 | 2/bow_hit/False/False | 동일 byte 자산 없음 |
| fire_hit | sfx/hit/fire_hit.mp3 | 42724 | 명시 참조 없음 | 2/fire_hit/False/False | 동일 byte 자산 없음 |
| q_end | sfx/q_parry/q_end.mp3 | 명시 참조 없음 | 명시 참조 없음 | 2/q_end/False/False | 동일 byte 자산 없음 |
| q_parry | sfx/q_parry/q_parry.mp3 | 12355, 12588, 33504, 38470 | 명시 참조 없음 | 10/q_parry/True/False | 동일 byte 자산 없음 |
| q_start | sfx/q_parry/q_start.mp3 | 명시 참조 없음 | 명시 참조 없음 | 2/q_start/False/False | 동일 byte 자산 없음 |
| sword_parry | sfx/sword_parry/sfxsword_parry.mp3 | 12355, 12589, 16845, 33504, 34567, 38470 | 명시 참조 없음 | 10/sword_parry/True/False | 동일 byte 자산 없음 |
| beam_fire | sfx/beam/beam_loop.mp3 | 12355, 28822, 28860, 28876, 28915, 28941, 46959 | 명시 참조 없음 | 10/beam_fire/True/False | 동일 byte 자산 없음 |
| beam_r1 | sfx/beam/beam_loop.mp3 | 12662 | 명시 참조 없음 | 2/beam_r1/False/False | 동일 byte 자산 없음 |
| beam_r2 | sfx/beam/beam_loop2.mp3 | 12662 | 명시 참조 없음 | 2/beam_r2/False/False | 동일 byte 자산 없음 |
| beam_r3 | sfx/beam/beam_loop3.mp3 | 12662 | 명시 참조 없음 | 2/beam_r3/False/False | 동일 byte 자산 없음 |
| fire_death | sfx/beam/laser_death.mp3 | 29010, 40738, 42724 | 명시 참조 없음 | 2/fire_death/False/False | 동일 byte 자산 없음 |
| fire_death2 | sfx/beam/laser_death2.mp3 | 29011, 40738, 42724 | 명시 참조 없음 | 2/fire_death2/False/False | 동일 byte 자산 없음 |
| fire_death3 | sfx/beam/laser_death3.mp3 | 40738, 42724 | 명시 참조 없음 | 2/fire_death3/False/False | 동일 byte 자산 없음 |
| chain_land | sfx/skillsound/chain/chain_land.mp3 | 12355, 32375, 45063, 45361 | 명시 참조 없음 | 10/chain_land/True/False | 동일 byte 자산 없음 |
| chain_dash | sfx/skillsound/chain/chain_dash.mp3 | 12348, 12355, 13360, 13361, 32192, 32193, 32224, 32225, 32545, 32546, 33112, 33529, 33546, 33577, 33698, 45029, 45459 | 명시 참조 없음 | 10/g_chainDash/True/False | 동일 byte 자산 없음 |
| chain_dash2 | sfx/skillsound/chain/chain_dash2.mp3 | 12355, 13360, 13361, 32192, 32193, 32224, 32225, 32545, 32546, 33112, 33529, 33546, 33577, 33698, 45459 | 명시 참조 없음 | 10/g_chainDash/True/False | 동일 byte 자산 없음 |
| chain_dash3 | sfx/skillsound/chain/chain_dash3.mp3 | 12355, 13360, 13361, 32192, 32193, 32224, 32225, 32545, 32546, 33112, 33529, 33546, 33577, 33698, 45459 | 명시 참조 없음 | 10/g_chainDash/True/False | 동일 byte 자산 없음 |
| chain_dash4 | sfx/skillsound/chain/chain_dash4.mp3 | 12355, 13360, 13361, 32192, 32193, 32224, 32225, 32545, 32546, 33112, 33529, 33546, 33577, 33698, 45459 | 명시 참조 없음 | 10/g_chainDash/True/False | 동일 byte 자산 없음 |
| chain_throw | sfx/skillsound/chain/chain_throw.mp3 | 12355, 13359, 32191, 32223, 32544 | 명시 참조 없음 | 10/chain_throw/True/False | 동일 byte 자산 없음 |
| chain_fly | sfx/skillsound/chain/chain_fly.mp3 | 12355, 13359, 32191, 32223, 32544, 35360, 35449 | 명시 참조 없음 | 10/chain_fly/True/False | godot/assets/sfx/skill/chain_fly.mp3 |
| chain_land2 | sfx/skillsound/chain/chain_land2.mp3 | 12355, 32375 | 명시 참조 없음 | 10/chain_land2/True/False | 동일 byte 자산 없음 |
| chain_stick | sfx/skillsound/chain/chain_stick.mp3 | 12355, 32244 | 명시 참조 없음 | 10/chain_stick/True/False | 동일 byte 자산 없음 |
| electric_storm | sfx/skillsound/storm/electric_storm.mp3 | 12351, 12355, 12356, 33052, 36363, 36445 | 명시 참조 없음 | 10/g_eStorm/True/False | 동일 byte 자산 없음 |
| electric_storm2 | sfx/skillsound/storm/electric_storm2.mp3 | 12355, 33052, 36363, 36445 | 명시 참조 없음 | 10/g_eStorm/True/False | 동일 byte 자산 없음 |
| electric_storm3 | sfx/skillsound/storm/electric_storm3.mp3 | 12355, 33052, 36445 | 명시 참조 없음 | 10/g_eStorm/True/False | 동일 byte 자산 없음 |
| electric_storm4 | sfx/skillsound/storm/electric_storm4.mp3 | 12355, 33052, 36445 | 명시 참조 없음 | 10/g_eStorm/True/False | 동일 byte 자산 없음 |
| repentance | sfx/skillsound/repentance/repentance.mp3 | 12355, 36362, 36431 | 명시 참조 없음 | 10/repentance/True/False | 동일 byte 자산 없음 |
| voice_storm_attack | sfx/storm/voice_storm_attack.mp3 | 33052 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| electric_storm_hiss | sfx/storm/electric_storm_hiss.mp3 | 35210 | 명시 참조 없음 | 10/g_eStorm/True/False | 동일 byte 자산 없음 |
| electric_storm_tail | sfx/storm/electric_storm_tail.mp3 | 33285 | 명시 참조 없음 | 10/g_eStorm/True/False | 동일 byte 자산 없음 |
| electric_storm_hiss2 | sfx/storm/electric_storm_hiss2.mp3 | 33183 | 명시 참조 없음 | 10/g_eStorm/True/False | 동일 byte 자산 없음 |
| electric_storm_hiss3 | sfx/storm/electric_storm_hiss3.mp3 | 33183 | 명시 참조 없음 | 10/g_eStorm/True/False | 동일 byte 자산 없음 |
| ice_storm | sfx/ice/ice_storm.mp3 | 36508, 46760 | 명시 참조 없음 | 2/ice_storm/False/False | godot/assets/sfx/skill/ice_storm.mp3 |
| male_grunt | sfx/voice/male_grunt.mp3 | 12235, 12349, 12806, 13361, 32439, 32509, 33050, 33052, 33055, 33529, 33546, 33564, 33577, 36451, 38453, 38466, 38470, 45268, 46461 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| silvertail_grunt | sfx/voice/silvertail_grunt.mp3 | 12328, 12341 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| silvertail_grunt1 | sfx/voice/silvertail_grunt1.mp3 | 명시 참조 없음 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| silvertail_grunt2 | sfx/voice/silvertail_grunt2.mp3 | 명시 참조 없음 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| silvertail_grunt3 | sfx/voice/silvertail_grunt3.mp3 | 명시 참조 없음 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| silvertail_attack | sfx/voice/silvertail_attack.mp3 | 12328 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| silvertail_move | sfx/voice/silvertail_move.mp3 | 12329 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| silvertail_parry | sfx/voice/silvertail_parry.mp3 | 12330, 12341 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| silvertail_parry1 | sfx/voice/silvertail_parry1.mp3 | 명시 참조 없음 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| silvertail_parry2 | sfx/voice/silvertail_parry2.mp3 | 명시 참조 없음 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| silvertail_parry3 | sfx/voice/silvertail_parry3.mp3 | 명시 참조 없음 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| silvertail_hit1 | sfx/voice/silvertail_hit1.mp3 | 12331 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| silvertail_hit2 | sfx/voice/silvertail_hit2.mp3 | 12331 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| silvertail_hit3 | sfx/voice/silvertail_hit3.mp3 | 12331 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| silvertail_hit4 | sfx/voice/silvertail_hit4.mp3 | 12331 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| silvertail_cooldown | sfx/voice/silvertail_cooldown.mp3 | 12332 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| silvertail_resource_fail | sfx/voice/silvertail_resource_fail.mp3 | 12332 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| silvertail_magic | sfx/voice/silvertail_magic.mp3 | 12334 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| silvertail_ult | sfx/voice/silvertail_ult.mp3 | 12334 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| silvertail_beam | sfx/voice/silvertail_beam.mp3 | 12334 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| silvertail_explode | sfx/voice/silvertail_explode.mp3 | 12334 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| silvertail_dark | sfx/voice/silvertail_dark.mp3 | 12334 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| silvertail_holy | sfx/voice/silvertail_holy.mp3 | 12334 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| silvertail_repentance | sfx/voice/silvertail_repentance.mp3 | 12334 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| silvertail_demon_revive1 | sfx/voice/silvertail_demon_revive1.mp3 | 명시 참조 없음 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| silvertail_demon_revive2 | sfx/voice/silvertail_demon_revive2.mp3 | 명시 참조 없음 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| silvertail_second_wind1 | sfx/voice/silvertail_second_wind1.mp3 | 명시 참조 없음 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| silvertail_second_wind2 | sfx/voice/silvertail_second_wind2.mp3 | 명시 참조 없음 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| silvertail_execution1 | sfx/voice/silvertail_execution1.mp3 | 명시 참조 없음 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| silvertail_execution2 | sfx/voice/silvertail_execution2.mp3 | 명시 참조 없음 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| silvertail_clear1 | sfx/voice/silvertail_clear1.mp3 | 명시 참조 없음 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| silvertail_clear2 | sfx/voice/silvertail_clear2.mp3 | 명시 참조 없음 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| silvertail_fuse1 | sfx/voice/silvertail_fuse1.mp3 | 명시 참조 없음 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| silvertail_fuse2 | sfx/voice/silvertail_fuse2.mp3 | 명시 참조 없음 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| silvertail_wakeup | sfx/voice/silvertail_wakeup.mp3 | 명시 참조 없음 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| voice_bladefuse | sfx/voice/voice_bladefuse.mp3 | 45166, 45177, 46176 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| voice_plague | sfx/voice/voice_dark_skill.mp3 | 명시 참조 없음 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| voice_move | sfx/voice/voice_move.mp3 | 13361, 33529, 33546, 33577 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| voice_move2 | sfx/voice/voice_move2.mp3 | 13361, 33529, 33546, 33577 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| voice_move3 | sfx/voice/voice_move3.mp3 | 13361, 33529, 33546, 33577 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| voice_flee | sfx/voice/voice_flee.mp3 | 33052 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| voice_ult | sfx/voice/voice_ult.mp3 | 12973, 12976 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| voice_beam | sfx/voice/voice_beam.mp3 | 명시 참조 없음 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| voice_grunt | sfx/voice/voice_grunt.mp3 | 12806, 13361, 32439, 32509, 33052, 33055, 33529, 33546, 33564, 33577, 36451, 38453, 38466, 45268, 46461 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| voice_attack | sfx/voice/voice_attack.mp3 | 33055, 33564, 38466 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| voice_explode | sfx/voice/voice_explode.mp3 | 36848, 43327 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| voice_magic | sfx/voice/voice_magic.mp3 | 28916, 28927, 36451, 36511, 36602, 45268 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| voice_en1 | sfx/voice/voice_en1.mp3 | 28917 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| voice_en2 | sfx/voice/voice_en2.mp3 | 28917 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| voice_en3 | sfx/voice/voice_en3.mp3 | 28917 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| voice_parry1 | sfx/voice/voice_parry1.mp3 | 33050, 38470 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| voice_parry2 | sfx/voice/voice_parry2.mp3 | 33050, 38470 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| voice_parry3 | sfx/voice/voice_parry3.mp3 | 33050, 38470 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| voice_parry4 | sfx/voice/voice_parry3.mp3 | 33050, 38470 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| voice_holyDome | sfx/voice/voice_holyDome.mp3 | 46725 | 명시 참조 없음 | 9/g_voice/False/False | godot/assets/sfx/skill/voice_holyDome.mp3 |
| voice_holyDome2 | sfx/voice/voice_holyDome2.mp3 | 46725 | 명시 참조 없음 | 9/g_voice/False/False | godot/assets/sfx/skill/voice_holyDome2.mp3 |
| voice_holyPrison | sfx/voice/voice_holyPrison.mp3 | 46740 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| voice_wakeup | sfx/voice/voice_wakeup.mp3 | 63403, 63404, 63405, 63406 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| voice_lavaSummon | sfx/voice/voice_explode.mp3 | 명시 참조 없음 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| voice_dark_skill | sfx/voice/voice_dark_skill.mp3 | 45166, 45177, 46176 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| voice_demon_revive | sfx/voice/voice_magic.mp3 | 43856 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| voice_second_wind | sfx/voice/voice_magic.mp3 | 43727 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| voice_execution | sfx/voice/voice_attack.mp3 | 33113 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| voice_clear | sfx/voice/voice_magic.mp3 | 41921 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| voice_fuse | sfx/voice/voice_magic.mp3 | 47247 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| equip_base | sfx/equipment/equip_base.mp3 | 16265 | 명시 참조 없음 | 2/equip_base/False/False | 동일 byte 자산 없음 |
| equip_sword | sfx/equipment/equip_sword.mp3 | 16263 | 명시 참조 없음 | 2/equip_sword/False/False | 동일 byte 자산 없음 |
| equip_crossbow | sfx/equipment/equip_crossbow.mp3 | 16264 | 명시 참조 없음 | 2/equip_crossbow/False/False | 동일 byte 자산 없음 |
| equip_rare | sfx/equipment/equip_rare.mp3 | 12834, 16265 | 명시 참조 없음 | 2/equip_rare/False/False | 동일 byte 자산 없음 |
| drop_common | sfx/drop/drop_common.mp3 | 16268 | 명시 참조 없음 | 2/drop_common/False/False | 동일 byte 자산 없음 |
| drop_rare | sfx/drop/drop_rare.mp3 | 16268 | 명시 참조 없음 | 2/drop_rare/False/False | 동일 byte 자산 없음 |
| drop_legend | sfx/drop/drop_legend.mp3 | 16268 | 명시 참조 없음 | 2/drop_legend/False/False | 동일 byte 자산 없음 |
| pickup_item | sfx/pickup/pickup_item.mp3 | 16270 | 명시 참조 없음 | 2/pickup_item/False/False | 동일 byte 자산 없음 |
| pickup_rummage1 | sfx/pickup/pickup_rummage1.mp3 | 16270 | 명시 참조 없음 | 2/pickup_rummage1/False/False | 동일 byte 자산 없음 |
| pickup_rummage2 | sfx/pickup/pickup_rummage2.mp3 | 16270 | 명시 참조 없음 | 2/pickup_rummage2/False/False | 동일 byte 자산 없음 |
| pickup_rummage3 | sfx/pickup/pickup_rummage3.mp3 | 16270 | 명시 참조 없음 | 2/pickup_rummage3/False/False | 동일 byte 자산 없음 |
| pickup_rummage4 | sfx/pickup/pickup_rummage4.mp3 | 16270 | 명시 참조 없음 | 2/pickup_rummage4/False/False | 동일 byte 자산 없음 |
| pickup_rummage5 | sfx/pickup/pickup_rummage5.mp3 | 16270 | 명시 참조 없음 | 2/pickup_rummage5/False/False | 동일 byte 자산 없음 |
| crossbow_shot | sfx/skillsound/bow/crossbow_shot.mp3 | 12355, 16554, 28695, 28719, 28720, 36097, 44959, 45307, 45325, 45339 | 명시 참조 없음 | 10/crossbow_shot/True/False | 동일 byte 자산 없음 |
| bow_release | sfx/weapon/bow_releasE.wav | 12355, 13081, 45531 | 명시 참조 없음 | 10/bow_release/True/False | 동일 byte 자산 없음 |
| shield_hit | sfx/hit/shield_hit.mp3 | 12355, 12584, 34891 | 명시 참조 없음 | 10/shield_hit/True/False | 동일 byte 자산 없음 |
| skull_summon | sfx/skillsound/bone/skull_summon.mp3 | 12355, 36424, 45288 | 명시 참조 없음 | 10/skull_summon/True/False | godot/assets/sfx/death/death_skull.mp3 |
| player_hit1 | sfx/hit/player_hit1.mp3 | 명시 참조 없음 | 명시 참조 없음 | 2/player_hit1/False/False | 동일 byte 자산 없음 |
| player_hit2 | sfx/hit/player_hit2.mp3 | 명시 참조 없음 | 명시 참조 없음 | 2/player_hit2/False/False | 동일 byte 자산 없음 |
| player_hit3 | sfx/hit/player_hit3.mp3 | 명시 참조 없음 | 명시 참조 없음 | 2/player_hit3/False/False | 동일 byte 자산 없음 |
| player_hit4 | sfx/hit/player_hit4.mp3 | 명시 참조 없음 | 명시 참조 없음 | 2/player_hit4/False/False | 동일 byte 자산 없음 |
| m_melee | sfx/monster/melee_walk.mp3 | 32084, 32085, 32086, 32087, 32088, 32089, 32090, 32091, 32092, 32094 | 명시 참조 없음 | 1/m_melee/False/False | 동일 byte 자산 없음 |
| m_archer | sfx/monster/archer_walk.mp3 | 32084, 32086, 32087, 32088, 32091 | 명시 참조 없음 | 1/m_archer/False/False | 동일 byte 자산 없음 |
| m_charger | sfx/monster/charger_walk.mp3 | 32084, 32085, 32086, 32087, 32088, 32089, 32090, 32091, 32093 | 명시 참조 없음 | 1/m_charger/False/False | 동일 byte 자산 없음 |
| m_swarm | sfx/monster/swarm_move.mp3 | 32080, 32081, 32083, 32085, 32086 | 명시 참조 없음 | 1/m_swarm/False/False | 동일 byte 자산 없음 |
| m_tank | sfx/monster/tank_step.mp3 | 32084, 32085, 32086, 32087, 32088, 32089, 32090, 32091, 32092, 32093, 32094, 32095 | 명시 참조 없음 | 1/m_tank/False/False | 동일 byte 자산 없음 |
| m_suicide | sfx/monster/suicide_walk.mp3 | 32080, 32083 | 명시 참조 없음 | 1/m_suicide/False/False | 동일 byte 자산 없음 |
| m_shield | sfx/monster/shield_walk.mp3 | 32084, 32088, 32089, 32091 | 명시 참조 없음 | 1/m_shield/False/False | 동일 byte 자산 없음 |
| m_caster | sfx/monster/caster_move.mp3 | 32080, 32081, 32083, 32086, 32090, 32092, 32093, 32094, 32095 | 명시 참조 없음 | 1/m_caster/False/False | 동일 byte 자산 없음 |
| m_splitter | sfx/monster/splitter_walk.mp3 | 32080, 32081, 32083, 32085, 32089 | 명시 참조 없음 | 1/m_splitter/False/False | 동일 byte 자산 없음 |
| m_mother | sfx/monster/mother_walk.mp3 | 32080, 32087 | 명시 참조 없음 | 1/m_mother/False/False | 동일 byte 자산 없음 |
| monster_crawl | sfx/monster/monster_crawl.mp3 | 12242, 32081, 32082, 38672 | 명시 참조 없음 | 1/monster_crawl/False/False | 동일 byte 자산 없음 |
| monster_crawl1 | sfx/monster/monster_crawl1.mp3 | 12242, 38672 | 명시 참조 없음 | 1/monster_crawl1/False/False | 동일 byte 자산 없음 |
| monster_hit | sfx/monster/monster_hit2.mp3 | 12241, 12344, 24787, 24790, 24793 | 명시 참조 없음 | 2/g_monHit/False/False | godot/assets/sfx/attack_source/monster_hit2.mp3 |
| monster_hit1 | sfx/monster/monster_hit1.mp3 | 24786, 24789, 24791, 24793 | 명시 참조 없음 | 2/g_monHit/False/False | godot/assets/sfx/attack_source/monster_hit1.mp3 |
| monster_hit_flesh1 | sfx/monster/monster_hit_flesh1.mp3 | 24788 | 명시 참조 없음 | 2/g_monHit/False/False | godot/assets/sfx/attack_source/monster_hit_flesh1.mp3 |
| monster_hit_flesh2 | sfx/monster/monster_hit_flesh2.mp3 | 24788 | 명시 참조 없음 | 2/g_monHit/False/False | godot/assets/sfx/attack_source/monster_hit_flesh2.mp3 |
| monster_hurt | sfx/monster/monster_hurt.mp3 | 12346, 24759, 24760, 24761, 24762 | 명시 참조 없음 | 2/g_bossHit/False/False | 동일 byte 자산 없음 |
| boss_hit | sfx/monster/boss_hit.mp3 | 12346, 24759, 24760, 24761, 24762 | 명시 참조 없음 | 10/g_bossHit/False/False | 동일 byte 자산 없음 |
| boss_howl | sfx/monster/boss_howl.mp3 | 24759, 24760, 24762, 30812, 38311, 41809 | 명시 참조 없음 | 10/boss_howl/False/False | 동일 byte 자산 없음 |
| boss_revive | sfx/monster/boss_revive.mp3 | 17080, 34525, 42585 | 명시 참조 없음 | 10/boss_revive/False/False | 동일 byte 자산 없음 |
| blue_hit | sfx/skillsound/blue_hit.mp3 | 12355 | 명시 참조 없음 | 10/blue_hit/True/False | 동일 byte 자산 없음 |
| boss_howl1 | sfx/monster/boss_howl1.mp3 | 24761, 30812, 38311 | 명시 참조 없음 | 10/boss_howl1/False/False | 동일 byte 자산 없음 |
| monster_die1 | sfx/death/monster_die1.mp3 | 12239, 24766, 24824 | 명시 참조 없음 | 4/g_death/False/False | 동일 byte 자산 없음 |
| die_human | sfx/death/die_human.mp3 | 명시 참조 없음 | 명시 참조 없음 | 2/die_human/False/False | 동일 byte 자산 없음 |
| die_boss | sfx/death/die_boss.mp3 | 명시 참조 없음 | 명시 참조 없음 | 2/die_boss/False/False | 동일 byte 자산 없음 |
| death_grunt | sfx/death/death_grunt_01.mp3 | 12239, 24825 | 명시 참조 없음 | 4/g_death/False/False | godot/assets/sfx/death/death_grunt.mp3 |
| death_slime | sfx/death/death_slime_splat.mp3 | 24781 | 명시 참조 없음 | 4/g_death/False/False | 동일 byte 자산 없음 |
| death_ice | sfx/death/death_ice_shatter.mp3 | 24780 | 명시 참조 없음 | 4/g_death/False/False | 동일 byte 자산 없음 |
| death_demon | sfx/death/death_demon_shriek.mp3 | 24778 | 명시 참조 없음 | 4/g_death/False/False | 동일 byte 자산 없음 |
| death_heavy | sfx/death/death_heavy_thud.mp3 | 24779 | 명시 참조 없음 | 4/g_death/False/False | 동일 byte 자산 없음 |
| death_heavy3 | sfx/death/death_heavy3.mp3 | 명시 참조 없음 | 명시 참조 없음 | 4/g_death/False/False | 동일 byte 자산 없음 |
| death_boss | sfx/death/death_boss_roar.mp3 | 24759, 24760, 24761, 24762, 24818, 42706 | 명시 참조 없음 | 4/g_death/False/False | 동일 byte 자산 없음 |
| boss_final_death | sfx/boss_final_death.mp3 | 34534 | 명시 참조 없음 | 10/boss_final_death/False/False | 동일 byte 자산 없음 |
| player_dead1 | sfx/death/player_dead1.mp3 | 명시 참조 없음 | 명시 참조 없음 | 9/player_dead1/False/False | 동일 byte 자산 없음 |
| player_dead2 | sfx/death/player_dead2.mp3 | 명시 참조 없음 | 명시 참조 없음 | 9/player_dead2/False/False | 동일 byte 자산 없음 |
| player_dead3 | sfx/death/player_dead3.mp3 | 명시 참조 없음 | 명시 참조 없음 | 9/player_dead3/False/False | 동일 byte 자산 없음 |
| player_dead4 | sfx/death/player_dead4.mp3 | 명시 참조 없음 | 명시 참조 없음 | 9/player_dead4/False/False | 동일 byte 자산 없음 |
| silvertail_dead1 | sfx/voice/silvertail_dead1.mp3 | 12335 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| silvertail_dead2 | sfx/voice/silvertail_dead2.mp3 | 12335 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| silvertail_dead3 | sfx/voice/silvertail_dead3.mp3 | 12335 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| silvertail_dead4 | sfx/voice/silvertail_dead4.mp3 | 12335 | 명시 참조 없음 | 9/g_voice/False/False | 동일 byte 자산 없음 |
| death_insect | sfx/death/ACE/death_insect.mp3 | 24743, 24772 | 명시 참조 없음 | 4/g_death/False/False | 동일 byte 자산 없음 |
| death_insect2 | sfx/death/ACE/death_insect2.mp3 | 24743, 24751 | 명시 참조 없음 | 4/g_death/False/False | 동일 byte 자산 없음 |
| death_ghost | sfx/death/ACE/death_ghost.mp3 | 24749, 24751, 24773 | 명시 참조 없음 | 4/g_death/False/False | 동일 byte 자산 없음 |
| death_flesh | sfx/death/ACE/death_flesh.mp3 | 24737, 24741, 24774, 32803 | 명시 참조 없음 | 4/g_death/False/False | godot/assets/sfx/death/death_flesh.mp3 |
| death_flesh2 | sfx/death/ACE/death_flesh2.mp3 | 24737, 24741, 32803 | 명시 참조 없음 | 4/g_death/False/False | godot/assets/sfx/death/death_flesh2.mp3 |
| death_bone | sfx/death/ACE/death_bone.mp3 | 24745, 24775 | 명시 참조 없음 | 4/g_death/False/False | godot/assets/sfx/death/death_bone.mp3, godot/assets/sfx/death/death_bone_shatter1.mp3 |
| death_bone2 | sfx/death/ACE/death_bone2.mp3 | 24739, 24745 | 명시 참조 없음 | 4/g_death/False/False | godot/assets/sfx/death/death_bone2.mp3 |
| death_bone3 | sfx/death/ACE/death_bone3.mp3 | 24739, 24745 | 명시 참조 없음 | 4/g_death/False/False | godot/assets/sfx/death/death_bone3.mp3 |
| death_bone_shatter1 | sfx/death/ACE/death_bone_shatter1.mp3 | 24737, 24745, 24749 | 명시 참조 없음 | 4/g_death/False/False | godot/assets/sfx/death/death_bone.mp3, godot/assets/sfx/death/death_bone_shatter1.mp3 |
| death_bone_shatter2 | sfx/death/ACE/death_bone_shatter2.mp3 | 24737, 24745, 24749 | 명시 참조 없음 | 4/g_death/False/False | godot/assets/sfx/death/death_bone_shatter2.mp3 |
| death_bone_shatter3 | sfx/death/ACE/death_bone_shatter3.mp3 | 24739, 24745, 24749, 24751 | 명시 참조 없음 | 4/g_death/False/False | godot/assets/sfx/death/death_bone_shatter3.mp3 |
| death_bone_shatter4 | sfx/death/ACE/death_bone_shatter4.mp3 | 24739, 24745, 24751 | 명시 참조 없음 | 4/g_death/False/False | godot/assets/sfx/death/death_bone_shatter4.mp3 |
| death_magic | sfx/death/death_magic.mp3 | 24777 | 명시 참조 없음 | 4/g_death/False/False | 동일 byte 자산 없음 |
| death_armor | sfx/death/ACE/death_armor.mp3 | 24739, 24770 | 명시 참조 없음 | 4/g_death/False/False | 동일 byte 자산 없음 |
| death_crush2 | sfx/death/ACE/death_crush2.mp3 | 24739, 24743, 24745, 24747 | 명시 참조 없음 | 4/g_death/False/False | godot/assets/sfx/death/death_crush2.mp3 |
| death_monster1 | sfx/death/ACE/death_monster1.mp3 | 24737, 24741, 24747 | 명시 참조 없음 | 4/g_death/False/False | godot/assets/sfx/death/death_monster1.mp3 |
| death_monster2 | sfx/death/ACE/death_monster2.mp3 | 24737, 24741, 24747 | 명시 참조 없음 | 4/g_death/False/False | godot/assets/sfx/death/death_monster2.mp3 |
| death_monster3 | sfx/death/ACE/death_monster3.mp3 | 24737, 24749, 24751 | 명시 참조 없음 | 4/g_death/False/False | godot/assets/sfx/death/death_monster3.mp3 |
| death_monster4 | sfx/death/ACE/death_monster4.mp3 | 24737, 24749, 24751 | 명시 참조 없음 | 4/g_death/False/False | godot/assets/sfx/death/death_monster4.mp3 |
| death_beast1 | sfx/death/ACE/death_beast1.mp3 | 24747 | 명시 참조 없음 | 4/g_death/False/False | 동일 byte 자산 없음 |
| death_beast2 | sfx/death/ACE/death_beast2.mp3 | 24747 | 명시 참조 없음 | 4/g_death/False/False | 동일 byte 자산 없음 |
| death_beast3 | sfx/death/ACE/death_beast3.mp3 | 24747 | 명시 참조 없음 | 4/g_death/False/False | 동일 byte 자산 없음 |
| death_beast4 | sfx/death/ACE/death_beast4.mp3 | 24747 | 명시 참조 없음 | 4/g_death/False/False | 동일 byte 자산 없음 |
| death_crack1 | sfx/death/ACE/death_crack1.mp3 | 24737, 24741, 24743, 24747 | 명시 참조 없음 | 4/g_death/False/False | godot/assets/sfx/death/death_crack1.mp3 |
| death_crack2 | sfx/death/ACE/death_crack2.mp3 | 24737, 24741, 24743, 24747 | 명시 참조 없음 | 4/g_death/False/False | godot/assets/sfx/death/death_crack2.mp3 |
| death_crack3 | sfx/death/ACE/death_crack3.mp3 | 24741, 24743, 24747, 24751 | 명시 참조 없음 | 4/g_death/False/False | 동일 byte 자산 없음 |
| death_crack4 | sfx/death/ACE/death_crack4.mp3 | 24741, 24743, 24747 | 명시 참조 없음 | 4/g_death/False/False | 동일 byte 자산 없음 |
| death_skull | sfx/death/ACE/skull.mp3 | 24739, 24745 | 명시 참조 없음 | 4/g_death/False/False | godot/assets/sfx/death/death_skull.mp3 |
| death_ghoul1 | sfx/death/ACE/death_ghoul1.mp3 | 24752, 24767, 24819 | 명시 참조 없음 | 4/g_death/False/False | 동일 byte 자산 없음 |
| death_ghoul1_v2 | sfx/death/ACE/death_ghoul1_v2.mp3 | 24752 | 명시 참조 없음 | 4/g_death/False/False | 동일 byte 자산 없음 |
| death_ghoul1_v3 | sfx/death/ACE/death_ghoul1_v3.mp3 | 24752 | 명시 참조 없음 | 4/g_death/False/False | 동일 byte 자산 없음 |
| death_ghoul1_v4 | sfx/death/ACE/death_ghoul1_v4.mp3 | 24752 | 명시 참조 없음 | 4/g_death/False/False | 동일 byte 자산 없음 |
| death_ghoul1_v5 | sfx/death/ACE/death_ghoul1_v5.mp3 | 24752 | 명시 참조 없음 | 4/g_death/False/False | 동일 byte 자산 없음 |
| death_ghoul2 | sfx/death/ACE/death_ghoul2.mp3 | 24753, 24768, 24819 | 명시 참조 없음 | 4/g_death/False/False | 동일 byte 자산 없음 |
| death_ghoul2_v2 | sfx/death/ACE/death_ghoul2_v2.mp3 | 24753 | 명시 참조 없음 | 4/g_death/False/False | 동일 byte 자산 없음 |
| death_ghoul2_v3 | sfx/death/ACE/death_ghoul2_v3.mp3 | 24753 | 명시 참조 없음 | 4/g_death/False/False | 동일 byte 자산 없음 |
| death_ghoul2_v4 | sfx/death/ACE/death_ghoul2_v4.mp3 | 24753 | 명시 참조 없음 | 4/g_death/False/False | 동일 byte 자산 없음 |
| death_ghoul2_v5 | sfx/death/ACE/death_ghoul2_v5.mp3 | 24753 | 명시 참조 없음 | 4/g_death/False/False | 동일 byte 자산 없음 |
| death_ghoul3 | sfx/death/ACE/death_ghoul3.mp3 | 24754, 24769, 24819 | 명시 참조 없음 | 4/g_death/False/False | 동일 byte 자산 없음 |
| death_ghoul3_v2 | sfx/death/ACE/death_ghoul3_v2.mp3 | 24745, 24754 | 명시 참조 없음 | 4/g_death/False/False | godot/assets/sfx/death/death_ghoul3_v2.mp3 |
| death_ghoul3_v3 | sfx/death/ACE/death_ghoul3_v3.mp3 | 24745, 24754 | 명시 참조 없음 | 4/g_death/False/False | godot/assets/sfx/death/death_ghoul3_v3.mp3 |
| death_ghoul3_v4 | sfx/death/ACE/death_ghoul3_v4.mp3 | 24745, 24754 | 명시 참조 없음 | 4/g_death/False/False | godot/assets/sfx/death/death_ghoul3_v4.mp3 |
| death_ghoul3_v5 | sfx/death/ACE/death_ghoul3_v5.mp3 | 24754 | 명시 참조 없음 | 4/g_death/False/False | 동일 byte 자산 없음 |
| death_ghoul3_v6 | sfx/death/ACE/death_ghoul3_v6.mp3 | 24754 | 명시 참조 없음 | 4/g_death/False/False | 동일 byte 자산 없음 |
| shield_activate | sfx/q_parry/q_start.mp3 | 12355, 14310, 14321, 28885, 33050, 33069, 33365, 33550, 33581, 33652, 33718 | 명시 참조 없음 | 10/shield_activate/True/False | 동일 byte 자산 없음 |
| shield_end | sfx/q_parry/q_end.mp3 | 12355, 33614, 33761, 33801 | 명시 참조 없음 | 10/shield_end/True/False | 동일 byte 자산 없음 |
| shield_loop | sfx/q_parry/shield_loop.mp3 | 12562 | 명시 참조 없음 | 2/shield_loop/False/False | 동일 byte 자산 없음 |
| chain_assault_fire | sfx/skillsound/chain_assault_fire.mp3 | 32439, 43275 | 명시 참조 없음 | 10/chain_assault_fire/True/False | 동일 byte 자산 없음 |
| fire_magic1 | sfx/magic/fire_magic1.mp3 | 12355, 12619, 12626, 46236 | 명시 참조 없음 | 10/g_fireMagic/True/False | 동일 byte 자산 없음 |
| fire_magic2 | sfx/magic/fire_magic2.mp3 | 12355, 12623, 12630 | 명시 참조 없음 | 10/g_fireMagic/True/False | 동일 byte 자산 없음 |
| fireball | sfx/magic/fireball.mp3 | 3567, 3858, 3860, 3861, 3901, 12355, 24695, 24713, 28386, 28643, 28779, 28950, 28994, 29009, 29026, 33061, 33319, 33589, 33633, 33641, 33645, 44167, 44281, 44655, 44765, 44896, 44969, 46520, 47007, 47035, 47282, 47676, 47781, 47940, 48412, 61957, 62153, 62370, 62395, 63923, 64080 | 명시 참조 없음 | 10/fireball/True/False | 동일 byte 자산 없음 |
| spike_trap | sfx/misc/spike_trap.mp3 | 45519 | 명시 참조 없음 | 2/spike_trap/False/False | godot/assets/sfx/skill/spike_trap.mp3 |
| ghost_laugh | sfx/ghost_laugh.mp3 | 12236, 13035, 13075, 45537, 45559, 45838, 45918, 45934, 46010, 46074, 46092 | 명시 참조 없음 | 9/ghost_laugh/False/False | 동일 byte 자산 없음 |
| scarecrow_boom | sfx/scarecrow_boom.mp3 | 12803 | 명시 참조 없음 | 2/scarecrow_boom/False/False | 동일 byte 자산 없음 |
| scarecrow_charge | sfx/scarecrow_charge.mp3 | 12804, 16848, 33668, 33716 | 명시 참조 없음 | 2/scarecrow_charge/False/False | 동일 byte 자산 없음 |
| footstep | sfx/misc/footstep_new.mp3 | 12230, 33031 | 명시 참조 없음 | 3/footstep/False/True | 동일 byte 자산 없음 |
| footstep2 | sfx/misc/footstep_stone.mp3 | 12230, 33031 | 명시 참조 없음 | 3/footstep2/False/True | 동일 byte 자산 없음 |


### B.2 실버테일 치환 맵

| 입력 key | 출력 논리 key | game 입력 문자열 행 전체 | 출력 직접등록 여부 |
|---|---|---|---|
| male_grunt | silvertail_grunt | 12235, 12349, 12806, 13361, 32439, 32509, 33050, 33052, 33055, 33529, 33546, 33564, 33577, 36451, 38453, 38466, 38470, 45268, 46461 | True |
| voice_grunt | silvertail_grunt | 12806, 13361, 32439, 32509, 33052, 33055, 33529, 33546, 33564, 33577, 36451, 38453, 38466, 45268, 46461 | True |
| voice_attack | silvertail_attack | 33055, 33564, 38466 | True |
| voice_bladefuse | silvertail_attack | 45166, 45177, 46176 | True |
| voice_storm_attack | silvertail_attack | 33052 | True |
| voice_move | silvertail_move | 13361, 33529, 33546, 33577 | True |
| voice_move2 | silvertail_move | 13361, 33529, 33546, 33577 | True |
| voice_move3 | silvertail_move | 13361, 33529, 33546, 33577 | True |
| voice_flee | silvertail_move | 33052 | True |
| voice_parry1 | silvertail_parry | 33050, 38470 | True |
| voice_parry2 | silvertail_parry | 33050, 38470 | True |
| voice_parry3 | silvertail_parry | 33050, 38470 | True |
| voice_parry4 | silvertail_parry | 33050, 38470 | True |
| player_hit1 | silvertail_hit1 | 명시 참조 없음 | True |
| player_hit2 | silvertail_hit2 | 명시 참조 없음 | True |
| player_hit3 | silvertail_hit3 | 명시 참조 없음 | True |
| player_hit4 | silvertail_hit4 | 명시 참조 없음 | True |
| voice_cooldown | silvertail_cooldown | 43609 | True |
| voice_resource_fail | silvertail_resource_fail | 43609 | True |
| voice_demon_revive | silvertail_demon_revive | 43856 | False |
| voice_second_wind | silvertail_second_wind | 43727 | False |
| voice_execution | silvertail_execution | 33113 | False |
| voice_clear | silvertail_clear | 41921 | False |
| voice_fuse | silvertail_fuse | 47247 | False |
| voice_plague | silvertail_dark | 명시 참조 없음 | True |
| voice_ult | silvertail_ult | 12973, 12976 | True |
| voice_beam | silvertail_beam | 명시 참조 없음 | True |
| voice_explode | silvertail_explode | 36848, 43327 | True |
| voice_magic | silvertail_magic | 28916, 28927, 36451, 36511, 36602, 45268 | True |
| voice_en1 | silvertail_magic | 28917 | True |
| voice_en2 | silvertail_magic | 28917 | True |
| voice_en3 | silvertail_magic | 28917 | True |
| voice_holyDome | silvertail_holy | 46725 | True |
| voice_holyDome2 | silvertail_holy | 46725 | True |
| voice_holyPrison | silvertail_holy | 46740 | True |
| repentance | silvertail_repentance | 12355, 36362, 36431 | True |
| voice_lavaSummon | silvertail_explode | 명시 참조 없음 | True |
| voice_dark_skill | silvertail_dark | 45166, 45177, 46176 | True |
| player_dead1 | silvertail_dead1 | 명시 참조 없음 | True |
| player_dead2 | silvertail_dead2 | 명시 참조 없음 | True |
| player_dead3 | silvertail_dead3 | 명시 참조 없음 | True |
| player_dead4 | silvertail_dead4 | 명시 참조 없음 | True |


## 부록 C. 상태 선언·합성식·SFX 본문·종족 데이터

소스 줄을 합쳐 표에 넣었다. 설명용 주석만 제외했으며 코드 식/숫자는 원문 그대로다. 이는 이식 승인 코드가 아니라 원본 근거이며, Q/E 및 전투음은 읽기 의존이다.

| game.html 행 | 선언/초깃값 |
|---|---|
| 10016 | let _actx=null,_actxResumed=false,_actxResumePending=false; |
| 10017 | let _actxWatchdog=null; |
| 10046 | let _ultMuted=false; |
| 10332 | const _audioBuffers={}; |
| 10333 | const _audioLoadPending={}; |
| 10334 | const _sfxRing={}; // 동시 재생 제한 링버퍼 (key → {arr[32], idx}) |
| 10335 | const _AUDIO_LOAD_CONCURRENCY=4; |
| 10336 | let _audioPreloadTask=null; |
| 10379 | const _sfxFileCache={}; |
| 10381 | const BGM_MAP={ |
| 10391 | let _bgmCtx=null,_bgmGainA=null,_bgmGainB=null,_bgmSrcA=null,_bgmSrcB=null,_bgmCurSlot='A',_bgmCurKey=''; |
| 10392 | const _bgmBufCache={}; |
| 12218 | let _sfxFrameT=0;const _sfxFrameCnt={}; |
| 12219 | let _activeNodeCnt=0; |
| 12220 | const _MAX_ACTIVE_NODES=IS_MOBILE?16:48; |
| 12221 | const _SFX_MAX=IS_MOBILE?1:2; // 프레임당 카테고리별 최대 |
| 12222 | const _sfxQueue=[];        // {key,vol,rate,pri} 대기열 |
| 12223 | const _SFX_PER_FRAME=IS_MOBILE?3:6;    // 프레임당 최대 처리 수 |
| 12225 | const _SFX_PRI={SKILL:10,VOICE:9,PLAYER_HIT:8,DEATH:4,STEP:3,HIT:2,PROJ:1,AMB:0}; |
| 12226 | const _activeNodes=[];      // {src,gain,pri,key,_dn} 재생 중 노드 추적 |
| 12227 | const _MAX_PROJ_NODES=IS_MOBILE?2:5;    // PROJ(탄막히트) 동시 최대 |
| 12228 | const _MAX_HIT_NODES=IS_MOBILE?2:3;     // HIT 동시 최대 |
| 12229 | const _MAX_STEP_NODES=2; // 플레이어 발소리 전용, 전투 HIT 캡과 분리 |
| 12337 | const _SILVERTAIL_VOICE_REPEAT_BLOCK_MS=10000; |
| 12338 | const _silvertailVoiceLastAt=new Map(); |
| 12355 | const _SKILL_SFX_KEYS=new Set(['shield_activate','shield_hit','shield_end','heavy_hit','bow_shot','bow_release','fire_magic1','fire_magic2','fireball','crossbow_shot','electric_storm','electric_storm2','electric_storm3','electric_storm4','repentance','chain_throw','chain_fly','chain_land','chain_land2','chain_stick','chain_dash','chain_dash2','chain_dash3','chain_dash4','skull_summon','blue_hit','beam_fire','q_parry','sword_parry']); |
| 12357 | const _sfxLastT={}; |
| 12389 | const _sbKeys=['sword_back','sword_back2','sword_back3']; |
| 12390 | let _sbSrc=null,_sbGain=null,_sbLast=-1; |
| 12406 | let _mbus=null,_dry=null,_wet=null,_conv=null,_comp=null; |
| 12407 | let _busHit=null,_busSk=null,_busBoss=null,_busHitIn=null,_busSkIn=null,_busBossIn=null; |
| 12547 | let _beamOsc=null,_beamGain=null,_beamOsc2=null,_beamMod=null,_beamLoopSrc=null,_beamLoopGain=null,_beamLoopIdx=0,_beamLoopNext=null; |
| 12548 | let _shieldLoopSrc=null,_shieldLoopGain=null; |
| 16263 | const _EQUIP_SFX_BY_WTYPE={sword:'equip_sword'}; |
| 16264 | const _EQUIP_SFX_BY_BTYPE={crossbow:'equip_crossbow'}; |
| 16267 | let _lastDropSndT=0; |
| 16270 | const _PICKUP_SFX_POOL=['pickup_item','pickup_rummage1','pickup_rummage2','pickup_rummage3','pickup_rummage4','pickup_rummage5']; |
| 16997 | let _projectileHitSfxAt=-Infinity; |
| 17472 | let _gxVolMul=1; // 터렛 사운드 글로벌 볼륨 배율 (1=풀, 0=무음) |
| 24796 | let _deathSfxCd=0; // 사망 사운드 크로스-프레임 쿨다운 |
| 24797 | let _deathSfxFrameMark=-1,_deathSfxFrameN=0,_deathSfxThrottled=false; // 동시-사망 프레임 버스트 (같은 프레임 대량 사망 시 여러 보이스 레이어) |
| 24798 | let _hitSfxCd=0; // 히트사운드 쿨다운 |
| 24799 | let _mSfxPlaying=0; // 몬스터 이동음 동시 재생 카운터 (프레임당 3개 제한) |
| 62742 | const _proVoice=new Audio('bgm/공통/intro_voice.mp3'); |
| 62744 | const _PRO_VOICE_OFS=0.3; // 파일 선두 무음 스킵 (구 index VOICE_DELAY=-0.3 동일) |


### C.2 핵심 함수의 식·파라미터 원문

| 함수 | game.html 범위 | 공식·본문 |
|---|---|---|
| actx | 10018–10034 | function actx(){ if(!_actx){ _actx=new (window.AudioContext\|\|window.webkitAudioContext)(IS_MOBILE?{latencyHint:'interactive'}:{latencyHint:'playback',sampleRate:44100}); if(_actxWatchdog)clearInterval(_actxWatchdog); _actxWatchdog=setInterval(()=>{ if(_actx&&_actx.state==='closed'){ clearInterval(_actxWatchdog); _actx=null;_actxResumed=false;_actxResumePending=false;_mbus=null;_busHit=null;_busSk=null;_busBoss=null; _busHitIn=null;_busSkIn=null;_busBossIn=null; actx(); } },500); } return _actx; } |
| _resumeAudioCtx | 10036–10041 | function _resumeAudioCtx(fromGesture=false){ if(!_actx\|\|_actx.state!=='suspended'\|\|_actxResumePending)return; if(!fromGesture&&!_actxResumed)return; _actxResumePending=true; _actx.resume().then(()=>{if(_actx&&_actx.state==='running')_actxResumed=true}).catch(()=>{}).finally(()=>{_actxResumePending=false}); } |
| ultMute | 10047–10055 | function ultMute(){ if(_ultMuted)return;_ultMuted=true; if(_bgmGainA)_bgmGainA.gain.linearRampToValueAtTime(0,(_bgmCtx\|\|actx()).currentTime+0.3); if(_bgmGainB)_bgmGainB.gain.linearRampToValueAtTime(0,(_bgmCtx\|\|actx()).currentTime+0.3); if(BGM._cur){BGM._savedVol=BGM._cur.volume;BGM._cur.volume=0} if(_mbus)_mbus.gain.linearRampToValueAtTime(0,actx().currentTime+0.3); } |
| ultUnmute | 10056–10063 | function ultUnmute(){ if(!_ultMuted)return;_ultMuted=false; const v=OPT.bgmVol/100; if(_bgmGainA)_bgmGainA.gain.linearRampToValueAtTime(v,(_bgmCtx\|\|actx()).currentTime+0.5); if(_bgmGainB)_bgmGainB.gain.linearRampToValueAtTime(v,(_bgmCtx\|\|actx()).currentTime+0.5); if(BGM._cur)BGM._cur.volume=BGM._savedVol\|\|v; if(_mbus)_mbus.gain.linearRampToValueAtTime(sfxVol(),actx().currentTime+0.5); } |
| playVoiceDirect | 10065–10073 | function playVoiceDirect(key,vol,rate){ key=_silvertailVoiceKey(key); if(!key)return; const buf=_audioBuffers[key];if(!buf)return; const c=actx();const src=c.createBufferSource();src.buffer=buf; if(rate&&rate!==1)src.playbackRate.value=rate; const g=c.createGain();g.gain.value=Math.min(1,vol\|\|1); src.connect(g);g.connect(c.destination);src.start(); } |
| _loadAudioBuffers | 10338–10356 | async function _loadAudioBuffers(){ if(_audioPreloadTask)return _audioPreloadTask; _audioPreloadTask=(async()=>{ if(!_actx)actx();const c=_actx\|\|actx();if(!c)return; const entries=Object.entries(_sampleFiles);let _next=0; async function _loadOne(key,url){ if(_audioBuffers[key]\|\|_audioLoadPending[key])return; _audioLoadPending[key]=true; try{const r=await fetch(url);if(!r.ok){console.warn('[SFX] fetch fail:',key,r.status);return}const ab=await r.arrayBuffer();_audioBuffers[key]=await c.decodeAudioData(ab)} catch(e){console.warn('[SFX] load fail:',key,e.message)} finally{delete _audioLoadPending[key]} } async function _worker(){while(_next<entries.length){const entry=entries[_next++];await _loadOne(entry[0],entry[1]);await new Promise(r=>setTimeout(r,0));}} const _workerCount=Math.min(_AUDIO_LOAD_CONCURRENCY,entries.length); const _workers=new Array(_workerCount);for(let i=0;i<_workerCount;i++)_workers[i]=_worker(); await Promise.all(_workers); })().catch(e=>console.warn('[SFX] preload failed:',e.message)); return _audioPreloadTask; |
| bgmPlay | 10394–10424 | async function bgmPlay(key){ if(key===_bgmCurKey)return; let src=null; if(typeof key==='string'){src=BGM_MAP[key]} else if(typeof key==='object'&&key!==null&&key.hell!=null){ const hd=BGM_MAP[key.hell]; if(hd)src=key.boss?hd.boss:hd.explore; } if(!src\|\|typeof src!=='string')return; const c=_bgmGetCtx();if(!c)return; let buf=_bgmBufCache[src]; if(!buf){ try{const r=await fetch(src);const ab=await r.arrayBuffer();buf=await c.decodeAudioData(ab);_bgmBufCache[src]=buf} catch(e){return;} } _bgmCurKey=key; if(!_bgmGainA){_bgmGainA=c.createGain();_bgmGainA.connect(c.destination)} if(!_bgmGainB){_bgmGainB=c.createGain();_bgmGainB.connect(c.destination)} const t=c.currentTime,fadeDur=2; const newSlot=_bgmCurSlot==='A'?'B':'A'; const newGain=newSlot==='A'?_bgmGainA:_bgmGainB; const oldGain=_bgmCurSlot==='A'?_bgmGainA:_bgmGainB; const oldSrc=_bgmCurSlot==='A'?_bgmSrcA:_bgmSrcB; const ns=c.createBufferSource();ns.buffer=buf;ns.loop=true; ns.connect(newGain); newGain.gain.setValueAtTime(0,t);newGain.gain.linearRampToValueAtTime(BGM._vol,t+fadeDur); ns.start(t); if(oldSrc){oldGain.gain.setValueAtTime(oldGain.gain.value,t);oldGain.gain.linearRampToValueAtTime(0,t+fadeDur); const os=oldSrc;setTimeout(()=>{try{os.stop()}catch(e){}},fadeDur*1000+100);} if(newSlot==='A')_bgmSrcA=ns;else _bgmSrcB=ns; _bgmCurSlot=newSlot; |
| _evictLowest | 12246–12252 | function _evictLowest(newPri){ let minI=-1,minP=Infinity,minT=Infinity; for(let i=0;i<_activeNodes.length;i++){const n=_activeNodes[i];if(n.pri<minP\|\|(n.pri===minP&&(n._st\|\|0)<minT)){minP=n.pri;minT=n._st\|\|0;minI=i}} if(minI>=0&&(newPri>minP\|\|(newPri>=_SFX_PRI.SKILL&&newPri>=minP))){const n=_activeNodes[minI];try{n.src.stop()}catch(e){}n._dn();return true} return false; } |
| _playSampleNow | 12253–12295 | function _playSampleNow(key,vol,rate,startTime,pan,priOverride){ const buf=_audioBuffers[key]; if(!buf){if(_sampleFiles[key]&&!_audioLoadPending[key]){_audioLoadPending[key]=true;const _c2=actx();fetch(_sampleFiles[key]).then(r=>r.arrayBuffer()).then(ab=>_c2.decodeAudioData(ab)).then(b=>{_audioBuffers[key]=b;delete _audioLoadPending[key]}).catch(()=>{delete _audioLoadPending[key]})}return;} const pri=(priOverride!=null)?priOverride:_sfxPri(key); if(_isFootstepSfx(key)){ let count=0,oldest=null; for(const n of _activeNodes)if(_isFootstepSfx(n.key)){count++;if(!oldest\|\|n._st<oldest._st)oldest=n;} if(count>=_MAX_STEP_NODES&&oldest){try{oldest.src.stop()}catch(e){}oldest._dn();} } if(pri<=_SFX_PRI.PROJ){let _pCnt=0;for(let i=0;i<_activeNodes.length;i++)if(_activeNodes[i].pri<=_SFX_PRI.PROJ)_pCnt++;if(_pCnt>=_MAX_PROJ_NODES)return;} else if(pri<=_SFX_PRI.HIT){let _hCnt=0;for(let i=0;i<_activeNodes.length;i++)if(_activeNodes[i].pri<=_SFX_PRI.HIT)_hCnt++;if(_hCnt>=_MAX_HIT_NODES)return;} if(_activeNodeCnt>=_MAX_ACTIVE_NODES){if(!_evictLowest(pri))return;} const c=actx(); const src=c.createBufferSource();src.buffer=buf; src.playbackRate.value=rate\|\|1; const gain=c.createGain(); gain.gain.value=Math.min(1,(vol\|\|1)*sfxVol()); gain.connect(mbus()); const _dur=buf.duration\|\|2; _activeNodeCnt++; const _nd={src,gain,pri,key,_dn:null,_st:performance.now()}; let _d=false; function _dn(){if(_d)return;_d=true;_activeNodeCnt=Math.max(0,_activeNodeCnt-1);const idx=_activeNodes.indexOf(_nd);if(idx>=0){_activeNodes[idx]=_activeNodes[_activeNodes.length-1];_activeNodes.pop()}try{src.disconnect();gain.disconnect()}catch(e){}} _nd._dn=_dn;_activeNodes.push(_nd); try{ if(pan&&Math.abs(pan)>0.05){ const _panner=c.createStereoPanner(); _panner.pan.value=Math.max(-1,Math.min(1,pan)); const _dnP=function(){_dn();try{_panner.disconnect()}catch(e){}}; _nd._dn=_dnP; src.connect(_panner);_panner.connect(gain); src.onended=_dnP;setTimeout(_dnP,(_dur+.5)*1000); }else{ src.connect(gain); src.onended=_dn;setTimeout(_dn,(_dur+.5)*1000); } src.start(startTime\|\|0); }catch(e){_nd._dn();throw e;} return src; } |
| _sfxFrameReset | 12296–12326 | function _sfxFrameReset(){ _sfxFrameT++; if(_deathSfxCd>0)_deathSfxCd--; if(_hitSfxCd>0)_hitSfxCd--; _mSfxPlaying=0; const _seen={};const _catSeen={};let _cnt=0; const c=actx();const _t=c.currentTime; try{ for(let i=0;i<_sfxQueue.length;i++){ const q=_sfxQueue[i]; if(_activeNodeCnt>=_MAX_ACTIVE_NODES&&!q.pri)continue; if(!q.pri&&_cnt>=_SFX_PER_FRAME)continue; const _cat=_sfxCat(q.key); if(!q.pri&&(_catSeen[_cat]\|\|0)>=_SFX_MAX)continue; _catSeen[_cat]=(_catSeen[_cat]\|\|0)+1; if(!_seen[q.key])_seen[q.key]=0; const _n=_seen[q.key]; const _volMul=_n<2?1:Math.max(0.08,Math.pow(0.5,_n-1)); const _pitchMul=_n<2?1:Math.max(0.7,1-(_n-1)*0.05); _playSampleNow(q.key,q.vol*_volMul,q.rate*_pitchMul,_t,q.pan\|\|0); _seen[q.key]++;_cnt++; } }finally{ _sfxQueue.length=0; for(const k in _sfxFrameCnt)_sfxFrameCnt[k]=0; if(SFX._sbSndCd>0)SFX._sbSndCd--; } if(_actx&&_actx.state==='suspended')_resumeAudioCtx(false); } |
| _silvertailTakeVoice | 12339–12339 | function _silvertailTakeVoice(key){const now=performance.now(),last=_silvertailVoiceLastAt.get(key)??-Infinity;if(now-last<_SILVERTAIL_VOICE_REPEAT_BLOCK_MS)return '';_silvertailVoiceLastAt.set(key,now);return key;} |
| _silvertailVariantKey | 12340–12340 | function _silvertailVariantKey(base,count){const now=performance.now(),choices=[];for(let i=1;i<=count;i++){const key=base+i,last=_silvertailVoiceLastAt.get(key)??-Infinity;if(now-last>=_SILVERTAIL_VOICE_REPEAT_BLOCK_MS)choices.push(key);}if(!choices.length)return '';const picked=choices[Math.floor(Math.random()*choices.length)];_silvertailVoiceLastAt.set(picked,now);return picked;} |
| _silvertailVoiceKey | 12341–12341 | function _silvertailVoiceKey(key){if(_charIdx!==1)return key;if(!Object.prototype.hasOwnProperty.call(_SILVERTAIL_VOICE_MAP,key))return key;const mapped=_SILVERTAIL_VOICE_MAP[key];if(mapped==='silvertail_grunt')return _silvertailVariantKey('silvertail_grunt',3);if(mapped==='silvertail_parry')return _silvertailVariantKey('silvertail_parry',3);if(mapped==='silvertail_demon_revive')return _silvertailVariantKey('silvertail_demon_revive',2);if(mapped==='silvertail_second_wind')return _silvertailVariantKey('silvertail_second_wind',2);if(mapped==='silvertail_execution')return _silvertailVariantKey('silvertail_execution',2);if(mapped==='silvertail_clear')return _silvertailVariantKey('silvertail_clear',2);if(mapped==='silvertail_fuse')return _silvertailVariantKey('silvertail_fuse',2);return _silvertailTakeVoice(mapped);} |
| _sfxCat | 12342–12354 | function _sfxCat(key){ if(key.startsWith('monster_hit')\|\|key==='flat_hit')return'g_monHit'; if(key.startsWith('death_')\|\|key.startsWith('monster_die'))return'g_death'; if(key==='boss_hit'\|\|key==='monster_hurt')return'g_bossHit'; if(key.startsWith('sword_swing'))return'g_swing'; if(key.startsWith('chain_dash'))return'g_chainDash'; if(key.startsWith('voice_')\|\|key==='male_grunt'\|\|key.startsWith('silvertail_'))return'g_voice'; if(key.startsWith('fire_magic'))return'g_fireMagic'; if(key.startsWith('electric_storm'))return'g_eStorm'; if(key.startsWith('death_ghoul'))return'g_ghoul'; return key; } |
| _isSkillSfx | 12356–12356 | function _isSkillSfx(key){return _SKILL_SFX_KEYS.has(key)\|\|key.startsWith('chain_')\|\|key.startsWith('electric_storm')\|\|key.startsWith('fire_magic')\|\|key.startsWith('sword_swing')} |
| playSample | 12358–12370 | function playSample(key,vol,rate,pri){ key=_silvertailVoiceKey(key); if(!key)return; if(_gxVolMul<1){vol*=_gxVolMul;if(vol<0.01)return;} const _isPri=pri\|\|_isSkillSfx(key)\|\|_isFootstepSfx(key); if(!_isPri){const _now=performance.now(),_lt=_sfxLastT[key]\|\|0;if(_now-_lt<30)return;_sfxLastT[key]=_now;} if(!rate)rate=1; rate=rate*(0.92+Math.random()*0.16); if(_isPri)_sfxQueue.unshift({key,vol,rate,pri:1}); else _sfxQueue.push({key,vol,rate}); return; } |
| playSampleAt | 12372–12386 | function playSampleAt(key,vol,rate,x,y,priOverride){ key=_silvertailVoiceKey(key); if(!key)return; if(!P)return; if(!_isSkillSfx(key)){const _now=performance.now(),_lt=_sfxLastT[key]\|\|0;if(_now-_lt<30)return;_sfxLastT[key]=_now;} const dx=x-P.x,dy=y-P.y; const d=Math.sqrt(dx*dx+dy*dy); const falloff=d<=1200?1:Math.max(0,1-(d-1200)/800); if(falloff<0.01)return; const pan=Math.max(-0.7,Math.min(0.7,dx/600)); const _v=(vol*falloff*falloff)*(_gxVolMul<1?_gxVolMul:1); if(_v<0.01)return; _playSampleNow(key,_v,rate*(0.92+Math.random()*0.16),0,pan,priOverride); } |
| _playSwordBack | 12391–12403 | function _playSwordBack(){ const c=actx();if(!c)return; if(_sbSrc)try{_sbSrc.stop()}catch(e){} for(let k=0;k<3;k++){const r=_sfxRing[_sbKeys[k]];if(r)for(let j=0;j<r.arr.length;j++){if(r.arr[j])try{r.arr[j].stop()}catch(e){}r.arr[j]=null}} let i=~~(Math.random()*3);if(i===_sbLast)i=(i+1)%3;_sbLast=i; const buf=_audioBuffers[_sbKeys[i]];if(!buf)return; _sbSrc=c.createBufferSource();_sbSrc.buffer=buf; _sbSrc.playbackRate.value=_r(1,.1); if(!_sbGain){_sbGain=c.createGain();_sbGain.connect(mbus())} _sbGain.gain.value=Math.min(1,.7*sfxVol()); _sbSrc.connect(_sbGain);_sbSrc.start(); } |
| mbus | 12408–12460 | function mbus(){ if(_mbus){_mbus.gain.value=sfxVol();return _mbus} const c=actx(); const _eqHigh=c.createBiquadFilter(); _eqHigh.type='highshelf'; _eqHigh.frequency.value=6000; _eqHigh.gain.value=-9; const _eqMid=c.createBiquadFilter(); _eqMid.type='peaking'; _eqMid.frequency.value=3000; _eqMid.Q.value=0.8; _eqMid.gain.value=-5; const _eqLow=c.createBiquadFilter(); _eqLow.type='lowshelf'; _eqLow.frequency.value=250; _eqLow.gain.value=+4; _busHit=c.createDynamicsCompressor(); _busHit.threshold.value=-12;_busHit.ratio.value=8; _busHit.attack.value=.001;_busHit.release.value=.08; const _busHitGain=c.createGain();_busHitGain.gain.value=0.55; _busHitGain.connect(_busHit); _busSk=c.createDynamicsCompressor(); _busSk.threshold.value=-8;_busSk.ratio.value=4; _busSk.attack.value=.003;_busSk.release.value=.15; const _busSkGain=c.createGain();_busSkGain.gain.value=0.8; _busSkGain.connect(_busSk); _busBoss=c.createGain();_busBoss.gain.value=1.0; _comp=c.createDynamicsCompressor(); _comp.threshold.value=-6;_comp.knee.value=30;_comp.ratio.value=2; _comp.attack.value=.015;_comp.release.value=.35; _mbus=c.createGain();_mbus.gain.value=sfxVol(); _busHit.connect(_mbus);_busSk.connect(_mbus);_busBoss.connect(_mbus); _mbus.connect(_eqHigh); _eqHigh.connect(_eqMid);_eqMid.connect(_eqLow);_eqLow.connect(_comp); _comp.connect(c.destination); _busHitIn=_busHitGain;_busSkIn=_busSkGain;_busBossIn=_busBoss; return _mbus; } |
| _r | 12463–12463 | function _r(v,s){return v*(1+(Math.random()-.5)*2*(s\|\|.05))} |
| playTone | 12465–12476 | function playTone(freq,dur,type,vol,freqEnd,atk){ if(_activeNodeCnt>=_MAX_ACTIVE_NODES)return; const c=actx(),t=c.currentTime,a=atk\|\|.004; const o=c.createOscillator(),g=c.createGain(); o.type=type\|\|'sine';o.frequency.setValueAtTime(_r(freq),t); if(freqEnd!==undefined)o.frequency.exponentialRampToValueAtTime(Math.max(20,_r(freqEnd)),t+dur); g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+a); g.gain.exponentialRampToValueAtTime(.0001,t+dur); o.connect(g);g.connect(mbus());try{o.start(t);o.stop(t+dur+.02)}catch(e){try{o.stop()}catch(_e){}try{o.disconnect()}catch(_e){}try{g.disconnect()}catch(_e){}throw e} _activeNodeCnt++;let _d=false;function _dn(){if(_d)return;_d=true;_activeNodeCnt=Math.max(0,_activeNodeCnt-1);try{o.disconnect();g.disconnect()}catch(e){}} o.onended=_dn;setTimeout(_dn,(dur+.5)*1000); } |
| playNoise | 12478–12494 | function playNoise(dur,filterFreq,vol,filterEnd,atk,fType){ if(_activeNodeCnt>=_MAX_ACTIVE_NODES)return; const c=actx(),t=c.currentTime,a=atk\|\|.002; const len=~~(c.sampleRate*dur); const buf=c.createBuffer(1,len,c.sampleRate); const d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1; const src=c.createBufferSource();src.buffer=buf; const flt=c.createBiquadFilter();flt.type=fType\|\|'lowpass'; flt.frequency.setValueAtTime(filterFreq,t); if(filterEnd!==undefined)flt.frequency.exponentialRampToValueAtTime(Math.max(20,filterEnd),t+dur); const g=c.createGain(); g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+a); g.gain.exponentialRampToValueAtTime(.0001,t+dur); src.connect(flt);flt.connect(g);g.connect(mbus());src.start(t);src.stop(t+dur+.02); _activeNodeCnt++;let _d=false;function _dn(){if(_d)return;_d=true;_activeNodeCnt=Math.max(0,_activeNodeCnt-1);try{src.disconnect();flt.disconnect();g.disconnect()}catch(e){}} src.onended=_dn;setTimeout(_dn,(dur+.5)*1000); } |
| playDist | 12496–12513 | function playDist(freq,dur,type,vol,freqEnd,amt){ if(_activeNodeCnt>=_MAX_ACTIVE_NODES)return; const c=actx(),t=c.currentTime; const o=c.createOscillator(); o.type=type\|\|'sawtooth';o.frequency.setValueAtTime(_r(freq),t); if(freqEnd)o.frequency.exponentialRampToValueAtTime(Math.max(20,freqEnd),t+dur); const ws=c.createWaveShaper();const am=amt\|\|20; const cv=new Float32Array(512); for(let i=0;i<512;i++){const x=i*2/511-1;cv[i]=(Math.PI+am)*x/(Math.PI+am*Math.abs(x))} ws.curve=cv;ws.oversample='4x'; const g=c.createGain(); g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.003); g.gain.exponentialRampToValueAtTime(.0001,t+dur); o.connect(ws);ws.connect(g);g.connect(mbus());o.start(t);o.stop(t+dur+.02); _activeNodeCnt++;let _d=false;function _dn(){if(_d)return;_d=true;_activeNodeCnt=Math.max(0,_activeNodeCnt-1);try{o.disconnect();ws.disconnect();g.disconnect()}catch(e){}} o.onended=_dn;setTimeout(_dn,(dur+.5)*1000); } |
| playFM | 12515–12532 | function playFM(cFreq,mFreq,mDepth,dur,vol,type,cEnd){ if(_activeNodeCnt>=_MAX_ACTIVE_NODES)return; const c=actx(),t=c.currentTime; const mod=c.createOscillator(),mg=c.createGain(); const carr=c.createOscillator(),g=c.createGain(); mod.frequency.setValueAtTime(mFreq,t); mg.gain.setValueAtTime(mDepth,t);mg.gain.exponentialRampToValueAtTime(1,t+dur); carr.type=type\|\|'sine';carr.frequency.setValueAtTime(_r(cFreq),t); if(cEnd)carr.frequency.exponentialRampToValueAtTime(Math.max(20,cEnd),t+dur); mod.connect(mg);mg.connect(carr.frequency); g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.003); g.gain.exponentialRampToValueAtTime(.0001,t+dur); carr.connect(g);g.connect(mbus()); mod.start(t);carr.start(t);mod.stop(t+dur+.02);carr.stop(t+dur+.02); _activeNodeCnt++;let _d=false;function _dn(){if(_d)return;_d=true;_activeNodeCnt=Math.max(0,_activeNodeCnt-1);try{mod.disconnect();mg.disconnect();carr.disconnect();g.disconnect()}catch(e){}} carr.onended=_dn;setTimeout(_dn,(dur+.5)*1000); } |
| playSub | 12534–12545 | function playSub(freq,dur,vol,fEnd){ if(_activeNodeCnt>=_MAX_ACTIVE_NODES)return; const c=actx(),t=c.currentTime; const o=c.createOscillator(),g=c.createGain(); o.type='sine';o.frequency.setValueAtTime(freq,t); if(fEnd)o.frequency.exponentialRampToValueAtTime(Math.max(8,fEnd),t+dur); g.gain.setValueAtTime(vol,t);g.gain.setValueAtTime(vol,t+.006); g.gain.exponentialRampToValueAtTime(.0001,t+dur); o.connect(g);g.connect(mbus());o.start(t);o.stop(t+dur+.02); _activeNodeCnt++;let _d=false;function _dn(){if(_d)return;_d=true;_activeNodeCnt=Math.max(0,_activeNodeCnt-1);try{o.disconnect();g.disconnect()}catch(e){}} o.onended=_dn;setTimeout(_dn,(dur+.5)*1000); } |
| _startLoop(음향 선언) | 12549–12555 | function _startLoop(key,vol){ try{const c=actx(),buf=_audioBuffers[key];if(!buf)return null; const src=c.createBufferSource();src.buffer=buf;src.loop=true; const g=c.createGain();g.gain.value=(vol\|\|0.3)*sfxVol(); src.connect(g);g.connect(mbus());src.start(); return{src,gain:g}}catch(e){return null} } |
| _stopLoop | 12556–12561 | function _stopLoop(ref,fadeMs){ if(!ref)return; try{const t=actx().currentTime,f=(fadeMs\|\|150)/1000; ref.gain.gain.linearRampToValueAtTime(0,t+f); setTimeout(()=>{try{ref.src.stop()}catch(e){}},fadeMs\|\|150)}catch(e){} } |
| _startShieldLoop | 12562–12562 | function _startShieldLoop(){try{_stopShieldLoop();const c=actx(),buf=_audioBuffers['shield_loop'];if(!buf)return;const src=c.createBufferSource();src.buffer=buf;src.loop=true;const g=c.createGain();g.gain.value=.25*sfxVol();src.connect(g);g.connect(mbus());src.start();_shieldLoopSrc=src;_shieldLoopGain=g}catch(e){}} |
| _stopShieldLoop | 12563–12569 | function _stopShieldLoop(){ const src=_shieldLoopSrc,gain=_shieldLoopGain; _shieldLoopSrc=null;_shieldLoopGain=null; if(!src)return; try{if(gain)gain.gain.exponentialRampToValueAtTime(.0001,actx().currentTime+.1)}catch(e){} try{setTimeout(()=>{try{src.stop()}catch(e){}},150)}catch(e){} } |


### C.3 SFX 메서드 36개 (뒤쪽 주석 행이 범위에 포함될 수 있음)

| 메서드 | game.html 범위 | 레이어·상수 원문 | SFX.member game 명시 전체 행 | index 전체 행 |
|---|---|---|---|---|
| slash | 12573–12576 | slash(){ const _sw=['sword_swing1','sword_swing2','sword_swing3']; playSample(_sw[~~(Math.random()*3)],.85,_r(1,.08)); }, | 13361, 32193, 32225, 32250, 32546, 33056, 33529, 33546, 33565, 33577, 33698, 34088, 34567, 37055, 37061, 37606, 37809, 37828, 37902, 41250, 41271, 41323, 43325, 45166, 45177, 46176 | 명시 참조 없음 |
| slashSeq | 12577–12582 | slashSeq(){ const _sw=['sword_swing1','sword_swing2','sword_swing3']; playSample(_sw[SFX._swIdx%3],.75,_r(1,.06)); SFX._swIdx++; }, | 33052, 33175 | 명시 참조 없음 |
| shieldBash | 12583–12586 | shieldBash(){ playSample('shield_hit',.8,_r(1,.1)); }, | 33449 | 명시 참조 없음 |
| deflect | 12587–12591 | deflect(){ if(P.s==='sBlock'\|\|P._sbParryT>0)playSample('q_parry',.9,_r(1,.08)); else playSample('sword_parry',1,_r(1,.1)) }, | 37071, 38573 | 명시 참조 없음 |
| block | 12592–12593 | block(){void 0}, | 36253, 36295, 36807, 37077, 37141, 38010, 38052, 38601, 38610, 41339, 41359, 42169 | 명시 참조 없음 |
| swing | 12594–12599 | swing(){ playNoise(.1,2000,.08,800,.002,'bandpass'); playSub(90,.06,.05,40); playFM(300,150,200,.08,.03); }, | 37730, 37737, 41078, 41107, 41148 | 명시 참조 없음 |
| bow | 12600–12603 | bow(){ playSample('bow_shot',.85,_r(1,.08)); }, | 28695 | 명시 참조 없음 |
| crossbowLoad | 12604–12609 | crossbowLoad(){ playFM(180,90,120,.08,.03,'square',250); playNoise(.04,3000,.03,6000,.002,'bandpass'); setTimeout(()=>{playFM(400,200,300,.05,.02,'sine',500);playSub(150,.03,.02,60)},40); }, | 45325 | 명시 참조 없음 |
| arrowHit | 12610–12613 | arrowHit(){ void 0; }, | 35233, 35269 | 명시 참조 없음 |
| magic | 12614–12638 | magic(el){ playNoise(.06,3000,.04,1500,.002,'bandpass'); playSub(55,.08,.05,35); if(el===1){ playSample('fire_magic1',.7,_r(1,.06)); playNoise(.1,2000,.05,500,.003); playSub(40,.1,.06,20); }else if(el===2){ playSample('fire_magic2',.3,_r(1.5,.06)); playNoise(.06,12000,.02,8000,.001,'highpass'); }else if(el===3){ playSample('fire_magic1',.35,_r(.6,.06)); playFM(150,40,300,.12,.05,'sawtooth',80); playDist(80,.1,'square',.03,30,30); }else if(el===4){ playSample('fire_magic2',.5,_r(1.8,.08)); playFM(100,2000,3000,.05,.05,'square',3000); playNoise(.05,10000,.04,4000,.001); }else{ playNoise(.08,2500,.05,1200,.002,'bandpass'); playSub(60,.08,.05,30); } }, | 13360, 17162, 32192, 32224, 32545, 33605, 33621, 34040, 36362, 36431, 36435, 36444, 36507, 36598, 36862, 36887, 37101, 37145, 37721, 37723, 37731, 37732, 37756, 37758, 37763, 37787, 37843, 37887, 37911, 37927, 37961, 37989, 38000, 38018, 38034, 38045, 38058, 38065, 38076, 38092, 38131, 38175, 38209, 39042, 39091, 39171, 39251, 39398, 39458, 39479, 39533, 39544, 39631, 39660, 39748, 39761, 39780, 39806, 39997, 40002, 40020, 40064, 40107, 40148, 40182, 40187, 40218, 40236, 40246, 40340, 40661, 41201, 41548, 41549, 41585, 45211, 45248, 45266, 45267, 45288, 45403, 60774, 61027, 61076, 61103, 61137, 61218, 61503, 61666, 64432 | 명시 참조 없음 |
| magicHit | 12639–12640 | magicHit(){}, | 42968 | 명시 참조 없음 |
| charge | 12641–12648 | charge(){ playNoise(.35,1200,.18,9000,.008); playNoise(.3,600,.07,5000,.01,'bandpass'); playFM(120,30,200,.3,.05,'sawtooth',400); playSub(60,.2,.08,120); playTone(200,.28,'triangle',.03,600,.01); }, | 17179, 36705, 37713, 37714, 37715, 37719, 37722, 37728, 37729, 37748, 37753, 37755, 37757, 37852, 37858, 37894, 37976, 38083, 38146, 38158, 38189, 38227, 38917, 39005, 39067, 39101, 39138, 39147, 39223, 39275, 39363, 39383, 39495, 39563, 39575, 39672, 39714, 39817, 39838, 39901, 39940, 39956, 40031, 40047, 40099, 40568, 40667, 40718, 40793, 40812, 40871, 40901, 40907, 40947, 41012, 41210, 45029, 45459 | 명시 참조 없음 |
| beamStart | 12649–12673 | beamStart(){ try{ const c=actx(),t=c.currentTime; if(_beamOsc){try{_beamOsc.stop()}catch(e){}} if(_beamOsc2){try{_beamOsc2.stop()}catch(e){}} if(_beamMod){try{_beamMod.stop()}catch(e){}} _beamOsc=null;_beamOsc2=null;_beamGain=null;_beamMod=null; try{ const lg=c.createGain();lg.gain.value=.8*sfxVol();lg.connect(mbus()); _beamLoopGain=lg; _beamLoopNext=function next(){ if(_beamLoopGain!==lg\|\|_beamLoopNext!==next)return; const _bk=['beam_r1','beam_r2','beam_r3']; const buf=_audioBuffers[_bk[~~(Math.random()*3)]]; if(!buf)return; const src=actx().createBufferSource();src.buffer=buf;src.loop=false; src.connect(lg);src.start(); _beamLoopSrc=src; src.onended=()=>{if(_beamLoopSrc!==src)return;next();}; }; _beamLoopNext(); }catch(e){} }catch(e){} }, | 28915, 40616 | 명시 참조 없음 |
| beamStop | 12674–12695 | beamStop(){ if(_beamGain){ const c=actx(),t=c.currentTime; const o=_beamOsc,o2=_beamOsc2,m=_beamMod,g=_beamGain; _beamOsc=null;_beamOsc2=null;_beamGain=null;_beamMod=null; g.gain.exponentialRampToValueAtTime(.0001,t+.15); setTimeout(()=>{ try{if(o)o.stop()}catch(e){} try{if(o2)o2.stop()}catch(e){} try{if(m)m.stop()}catch(e){} },200); } const src=_beamLoopSrc,gain=_beamLoopGain; _beamLoopNext=null;_beamLoopSrc=null;_beamLoopGain=null; if(src){ try{src.onended=null}catch(e){} try{if(gain)gain.gain.exponentialRampToValueAtTime(.0001,actx().currentTime+.1)}catch(e){} try{setTimeout(()=>{try{src.stop()}catch(e){}},150)}catch(e){} } }, | 34111, 34131, 40642, 40747, 43438, 43735, 43896, 43898 | 명시 참조 없음 |
| hit | 12696–12703 | hit(){ playSub(90,.09,.16,22); playDist(220,.07,'square',.12,45,32); playFM(500,120,300,.06,.05,'sine',200); playNoise(.06,4000,.14,350,.001); playNoise(.03,1800,.05,300,.001,'bandpass'); }, | 39331, 39372, 39877, 40082, 40117, 40212, 42823, 42856, 42878, 42903, 42911, 42935, 42943 | 명시 참조 없음 |
| explode | 12704–12710 | explode(){ playSub(40,.18,.2,10); playDist(80,.14,'square',.16,18,30); playNoise(.14,2000,.18,200,.002); playFM(200,50,300,.12,.06,'sine',60); }, | 39678, 39795, 40037, 40153, 40228, 42870, 42884 | 명시 참조 없음 |
| hurt | 12711–12719 | hurt(){ playSub(55,.14,.18,12); playDist(100,.12,'square',.14,22,28); playFM(300,60,200,.1,.05,'sine',100); playNoise(.1,2500,.16,220,.002); playTone(500,.06,'sine',.03,200); }, | 28178, 50635 | 명시 참조 없음 |
| shieldBurst | 12720–12728 | shieldBurst(){ playSub(50,.35,.2,15); playSub(80,.25,.15,25); playFM(400,100,300,.2,.08,'sine',600); playNoise(.15,1200,.1,300,.005,'bandpass'); playTone(600,.15,'sine',.08,900); setTimeout(()=>{playSub(35,.2,.1,12);playFM(300,80,200,.15,.04,'sine',450)},30); }, | 명시 참조 없음 | 명시 참조 없음 |
| groggy | 12729–12737 | groggy(){ playSub(45,.4,.22,10); playDist(65,.35,'square',.1,15,42); playFM(2800,400,1500,.15,.05,'sine',4500); playNoise(.3,600,.1,60,.005); playNoise(.2,3000,.05,400,.01,'bandpass'); setTimeout(()=>{playSub(30,.2,.08,10);playFM(2000,300,800,.18,.025,'sine',3200)},40); }, | 19991, 28994, 30812, 34982, 35716, 38267, 38307, 38849, 38987, 39133, 39157, 39188, 39259, 39263, 39279, 39404, 39472, 39500, 39593, 39641, 39734, 39848, 39979, 39980, 40093, 40192, 40199, 40200, 40319, 40320, 40355, 40433, 40556, 40677, 40679, 40702, 40751, 40834, 40865, 40938, 41039, 41050, 41118, 41548, 41585, 41914, 42761, 42847, 42891, 43463, 43488, 43585 | 명시 참조 없음 |
| die | 12738–12746 | die(){ playSub(50,1.2,.18,8); playDist(45,1,'sine',.1,8,35); playNoise(1,400,.1,30,.01); playFM(300,50,400,.5,.035,'sine',40); setTimeout(()=>{playTone(400,.4,'sine',.035,80);playNoise(.5,250,.04,30,.005)},250); setTimeout(()=>{playTone(200,.5,'sine',.025,50);playFM(150,30,200,.4,.02,'sine',30)},550); }, | 43871 | 명시 참조 없음 |
| ghoulDie | 12747–12755 | ghoulDie(){ playSub(35,.3,.15,8); playDist(55,.25,'sawtooth',.08,20,50); playNoise(.2,800,.08,200,.004,'bandpass'); playFM(200,80,300,.2,.04,'sawtooth',60); setTimeout(()=>{playNoise(.15,1500,.06,400,.003,'bandpass');playSub(25,.2,.1,6)},80); setTimeout(()=>{playDist(40,.15,'square',.05,12,40);playNoise(.1,600,.04,100,.003)},160); }, | 명시 참조 없음 | 명시 참조 없음 |
| potion | 12756–12763 | potion(){ playFM(500,100,300,.06,.05,'sine',700); playNoise(.03,4000,.015,6000,.002,'bandpass'); setTimeout(()=>{playFM(650,130,350,.06,.045,'sine',900);playNoise(.02,5000,.012,7000,.001,'bandpass')},55); setTimeout(()=>{playFM(850,170,400,.07,.045,'sine',1100);playTone(1200,.04,'sine',.025)},110); setTimeout(()=>{playFM(1100,220,300,.1,.05,'sine',1400);playNoise(.03,10000,.015,12000,.001,'highpass')},170); }, | 28221, 35906 | 명시 참조 없음 |
| levelup | 12764–12771 | levelup(){ [523,659,784,1047].forEach((f,i)=>{ setTimeout(()=>{playFM(f,f*.5,f*.3,.18,.07);playTone(f*2,.14,'sine',.025);playTone(f*1.5,.12,'sine',.015)},i*95); }); setTimeout(()=>{playFM(1047,523,400,.35,.07);playFM(1319,660,350,.3,.04); playTone(2094,.28,'sine',.025);playNoise(.08,12000,.015,14000,.003,'highpass');playSub(65,.15,.03,30)},420); }, | 40305, 43162, 43856, 43920, 47227, 47247, 47319, 47775, 47806, 47813, 51249, 51274 | 명시 참조 없음 |
| pickup | 12772–12777 | pickup(){ playFM(1400,700,200,.07,.06,'sine',2200); playFM(2000,1000,150,.06,.035,'sine',2800); playTone(3200,.04,'sine',.015); }, | 13278, 13802, 16269, 16391, 28255, 28261, 28263, 32832, 32835, 32838, 32851, 32891, 32922, 32929, 36843, 36929, 41451, 43089, 43912, 44998, 46620, 46640, 46687, 46700, 46725, 46740, 47011, 47026, 47063, 47080, 47138, 47154, 47175, 47867, 47875, 48281, 48290, 48440, 48597, 48608, 50375, 50405, 51175, 51184, 51215, 51267 | 명시 참조 없음 |
| scarecrowRecall | 12778–12788 | scarecrowRecall(){ playFM(2400,1200,300,.08,.04,'sine',3200); setTimeout(()=>playFM(1800,900,250,.07,.035,'sine',2600),60); setTimeout(()=>playFM(1200,600,200,.06,.03,'sine',1800),120); playNoise(.08,6000,.12,2000,.003,'bandpass'); setTimeout(()=>{playFM(1047,523,200,.1,.06,'sine',1400);playTone(2094,.06,'sine',.02)},180); }, | 13030, 13077, 36021 | 명시 참조 없음 |
| victory | 12789–12797 | victory(){ [523,659,784,1047,784,1047,1319].forEach((f,i)=>{ setTimeout(()=>{playFM(f,f*.5,f*.3,.22,.07);playTone(f*2,.18,'sine',.025); if(i%2===0){playTone(f*.5,.15,'sine',.015);playSub(f*.25,.1,.015,f*.12)}},i*155); }); setTimeout(()=>{playFM(1047,523,500,.6,.07);playFM(1319,660,400,.55,.05);playFM(1568,784,350,.5,.035); playTone(2094,.7,'sine',.03);playSub(65,.3,.04,30);playNoise(.15,12000,.015,14000,.005,'highpass')},1150); }, | 32860, 41834, 41877, 41888, 41988, 42740, 43902 | 명시 참조 없음 |
| detonate | 12798–12802 | detonate(){ playSub(50,.4,.25,10); playDist(80,.3,'square',.15,20,40); playNoise(.35,2000,.2,100,.001); }, | 8797, 33801, 33876, 34757, 34925, 34987, 35105, 35126, 36007, 36148, 36183, 36630, 36874, 36898, 37000, 37033, 37059, 37067, 37071, 37073, 37131, 37135, 37137, 37147, 37151, 37874, 37945, 38115, 40535, 40579, 41003, 41024, 41058, 41297, 43325, 46661, 46844, 46926, 46936, 61020, 61116 | 명시 참조 없음 |
| scarecrowBoom | 12803–12803 | scarecrowBoom(){playSample('scarecrow_boom',1,_r(1,.05))}, | 46162 | 명시 참조 없음 |
| scarecrowCharge | 12804–12804 | scarecrowCharge(){playSample('scarecrow_charge',1,_r(1,.05))}, | 13035, 13075, 46103 | 명시 참조 없음 |
| shout | 12805–12807 | shout(){ {const _ve=['voice_grunt','male_grunt'];playSample(_ve[~~(Math.random()*2)],1,_r(1,.15))}; }, | 43320, 43388 | 명시 참조 없음 |
| slam | 12808–12814 | slam(){ playSample('heavy_hit',1.0,_r(.8,.06)); playSub(40,.5,.35,8); playDist(60,.4,'square',.18,15,45); playNoise(.4,1500,.25,80,.005); }, | 40690, 43321, 43388, 46228, 46461 | 명시 참조 없음 |
| skyCrusherFall | 12815–12819 | skyCrusherFall(){ playNoise(.32,900,.08,2600,.008,'bandpass'); playFM(180,70,160,.2,.035,'sawtooth',95); playSub(70,.18,.05,40); }, | 45502 | 명시 참조 없음 |
| skyCrusherImpact | 12820–12826 | skyCrusherImpact(){ playSample('heavy_hit',.65,_r(.92,.04)); playSub(48,.32,.2,12); playDist(78,.24,'square',.1,24,34); playNoise(.26,1800,.14,140,.004,'bandpass'); playFM(260,95,180,.16,.045,'triangle',120); }, | 36534 | 명시 참조 없음 |
| forge | 12827–12832 | forge(){ playFM(1800,400,1200,.15,.08); playSub(100,.05,.04); playNoise(.03,8000,.05,4000,.001,'highpass'); }, | 15806, 15823, 28161, 50628, 50783, 50836, 50909, 50948, 50996, 51016, 51032, 51064, 51077 | 명시 참조 없음 |
| crystalEquip | 12833–12838 | crystalEquip(){ playSample('equip_rare',.38,1.12,true); playNoise(.025,3400,.012,1700,.003,'bandpass'); playTone(880,.14,'sine',.014,1320,.006); setTimeout(()=>playTone(1760,.19,'sine',.007,1046,.008),65); }, | 15787 | 명시 참조 없음 |
| click | 12839–12841 | click(){ playTone(1800,.03,'sine',.025,2400); } | 명시 참조 없음 | 명시 참조 없음 |


### C.4 종족·보스·이동 맵 원문

| 이름 | game 범위 | 데이터·음향식 |
|---|---|---|
| _ETYPE_SOUND_SETS | 24724–24732 | const _HUMANOID_ET=new Set([0,1,2,6,8,20,21,24,31,34,36,37,41,44,54,55,60,65,67,70,71,74,90,93,94]); const _INSECT_ET=new Set([3,11,13,15,16,17,18,19,45,46,72]); const _GHOST_ET=new Set([7,9,26,40,47,48,66,76,78,84,86,88,95,96]); const _FLESH_ET=new Set([5,42,50,51,52,53,56,57,58]); const _BONE_ET=new Set([4,10,12,14,23,82,83,85]); const _UNDEAD_ET=new Set([4,10,12,14,23,40,47,82,83,85]); const _BEAST_ET=new Set([22,27,30,33,35,38,39,43,63,64,73,75]); const _MAGIC_ET=new Set([25,59,69,79,89,97,98,99]); const _ARMOR_ET=new Set([28,29,32,49,61,62,68,77,80,81,87,91,92]); |
| _DEATH_VARIANTS | 24735–24755 | const _DEATH_VARIANTS={ death_humanoid:['death_monster1','death_monster2','death_monster3','death_monster4','death_flesh','death_flesh2','death_crack1','death_crack2','death_bone_shatter1','death_bone_shatter2'], death_armor:['death_armor','death_crush2','death_bone_shatter3','death_bone_shatter4','death_bone2','death_bone3','death_skull'], death_flesh:['death_flesh','death_flesh2','death_crack1','death_crack2','death_crack3','death_crack4','death_monster1','death_monster2'], death_insect:['death_insect','death_insect2','death_crack1','death_crack2','death_crack3','death_crack4','death_crush2'], death_bone:['death_bone','death_bone2','death_bone3','death_skull','death_bone_shatter1','death_bone_shatter2','death_bone_shatter3','death_bone_shatter4','death_crush2','death_ghoul3_v2','death_ghoul3_v3','death_ghoul3_v4'], death_beast:['death_beast1','death_beast2','death_beast3','death_beast4','death_crack1','death_crack2','death_crack3','death_crack4','death_crush2','death_monster1','death_monster2'], death_ghost:['death_ghost','death_bone_shatter1','death_bone_shatter2','death_bone_shatter3','death_monster3','death_monster4'], death_magic:['death_ghost','death_bone_shatter3','death_bone_shatter4','death_monster3','death_monster4','death_insect2','death_crack3'], death_ghoul1:['death_ghoul1','death_ghoul1_v2','death_ghoul1_v3','death_ghoul1_v4','death_ghoul1_v5'], death_ghoul2:['death_ghoul2','death_ghoul2_v2','death_ghoul2_v3','death_ghoul2_v4','death_ghoul2_v5'], death_ghoul3:['death_ghoul3','death_ghoul3_v2','death_ghoul3_v3','death_ghoul3_v4','death_ghoul3_v5','death_ghoul3_v6'] }; |
| _pickDeathVar | 24756–24756 | function _pickDeathVar(base){const a=_DEATH_VARIANTS[base];return a?a[Math.random()*a.length\|0]:base} |
| _BOSS_SFX | 24758–24763 | const _BOSS_SFX={ 0:{howl:'boss_howl', howlP:.7,  die:'death_boss',dieP:.7,  hit:'boss_hit',hitP:.7,  hurt:'monster_hurt',hurtP:.7}, 1:{howl:'boss_howl', howlP:1.3, die:'death_boss',dieP:1.2, hit:'boss_hit',hitP:1.3, hurt:'monster_hurt',hurtP:1.2}, 2:{howl:'boss_howl1',howlP:1.1, die:'death_boss',dieP:1.0, hit:'boss_hit',hitP:1.1, hurt:'monster_hurt',hurtP:1.1}, 3:{howl:'boss_howl', howlP:.55, die:'death_boss',dieP:.55, hit:'boss_hit',hitP:.6,  hurt:'monster_hurt',hurtP:.55} }; |
| _bossSfx | 24764–24764 | function _bossSfx(si){return _BOSS_SFX[si]\|\|null} |
| _deathSfxKey | 24765–24783 | function _deathSfxKey(et){ if(et==null)return 'monster_die1'; if(et===100)return _pickDeathVar('death_ghoul1'); if(et===101)return _pickDeathVar('death_ghoul2'); if(et===102)return _pickDeathVar('death_ghoul3'); if(_ARMOR_ET.has(et))return _pickDeathVar('death_armor'); if(_HUMANOID_ET.has(et))return _pickDeathVar('death_humanoid'); if(_INSECT_ET.has(et))return _pickDeathVar('death_insect'); if(_GHOST_ET.has(et))return _pickDeathVar('death_ghost'); if(_FLESH_ET.has(et))return _pickDeathVar('death_flesh'); if(_BONE_ET.has(et))return _pickDeathVar('death_bone'); if(_BEAST_ET.has(et))return _pickDeathVar('death_beast'); if(_MAGIC_ET.has(et))return _pickDeathVar('death_magic'); if(et>=50)return 'death_demon'; if(et>=40)return _pickDeathVar('death_heavy'); if(et>=20)return 'death_ice'; if(et>=10)return 'death_slime'; return 'death_monster'+(1+~~(Math.random()*4)); } |
| _hitSfxForEtype | 24785–24794 | function _hitSfxForEtype(et){ if(_INSECT_ET.has(et))return{key:'monster_hit1',pitch:1.3}; if(_GHOST_ET.has(et))return{key:'monster_hit',pitch:0.7}; if(_FLESH_ET.has(et))return{key:Math.random()<.5?'monster_hit_flesh1':'monster_hit_flesh2',pitch:_r(1,.1)}; if(_BONE_ET.has(et))return{key:'monster_hit1',pitch:1.15}; if(_BEAST_ET.has(et))return{key:'monster_hit',pitch:0.9}; if(_MAGIC_ET.has(et))return{key:'monster_hit1',pitch:1.2}; if(_ARMOR_ET.has(et))return{key:'flat_hit',pitch:1.0}; return{key:Math.random()<.5?'monster_hit':'monster_hit1',pitch:1.0}; } |
| deathFX 음향만 | 24801–24828 | function deathFX(x,y,r,col,isBoss,noSound,et,impactId){ if(!noSound){try{ if(_deathSfxFrameMark!==_sfxFrameT){ _deathSfxFrameMark=_sfxFrameT;_deathSfxFrameN=0; _deathSfxThrottled=(_deathSfxCd>0); if(!_deathSfxThrottled)_deathSfxCd=5; } const _maxVoices=isBoss?1:6; if(!_deathSfxThrottled&&_deathSfxFrameN<_maxVoices){ const _n=_deathSfxFrameN++; const _layV=_n===0?1:Math.max(.32,.72-(_n-1)*.16); const _layPan=_n===0?0:(_n%2?-1:1)*Math.min(.6,.22+_n*.13); const _layPit=_n===0?1:_r(1.05+_n*.03,.06); const _dVol=sfxVol(); if(isBoss){const _bd=_bossSfx(G.stage);_playSampleNow(_bd?_bd.die:'death_boss',.75*_dVol,_r(_bd?_bd.dieP:.7,.15))} else if(et>=100&&et<=102){const gk=_pickDeathVar(et===100?'death_ghoul1':et===101?'death_ghoul2':'death_ghoul3');_playSampleNow(gk,_r(.75,.1)*_layV*_dVol,_r(1,.1)*_layPit,0,_layPan)} else{ const k=_deathSfxKey(et); const v=(_ARMOR_ET.has(et)?.525:r>=40?1.05:.825)*_layV; _playSampleNow(k,_r(v,.08)*_dVol,_r(1,.12)*_layPit,0,_layPan); if(_n===0&&r>=40&&Math.random()<.25)_playSampleNow('monster_die1',.75*_dVol,_r(.8,.15)); if(_n===0&&Math.random()<.15)_playSampleNow('death_grunt',.45*_dVol,_r(1,.15)); } } }catch(e){console.error('[SFX] death dispatch error:',e)}} |
| _ETYPE_SFX | 32080–32083 | const _ETYPE_SFX={3:'m_swarm',5:'m_suicide',7:'m_caster',9:'m_caster',11:'m_mother',13:'m_swarm',15:'m_splitter',17:'m_mother', 25:'m_splitter',26:'m_caster',33:'m_swarm',40:'m_caster',42:'monster_crawl',45:'m_swarm',48:'m_caster', 50:'monster_crawl',51:'monster_crawl',52:'monster_crawl',53:'monster_crawl',56:'monster_crawl',57:'monster_crawl',58:'monster_crawl', 62:'m_splitter',64:'m_swarm',72:'m_suicide',73:'m_swarm',76:'m_swarm',78:'m_caster'}; |
| _ARCH_SFX | 32084–32098 | const _ARCH_SFX={0:'m_melee',1:'m_archer',2:'m_charger',4:'m_tank',6:'m_shield',8:'m_archer', 10:'m_melee',12:'m_charger',14:'m_swarm',16:'m_splitter',18:'m_melee',19:'m_tank', 20:'m_melee',21:'m_archer',22:'m_charger',23:'m_caster',24:'m_melee',27:'m_swarm',28:'m_tank',29:'m_tank', 30:'m_charger',31:'m_melee',32:'m_tank',34:'m_archer',35:'m_charger',36:'m_melee',37:'m_archer',38:'m_mother',39:'m_tank', 41:'m_shield',43:'m_charger',44:'m_archer',46:'m_tank',47:'m_melee',49:'m_tank', 50:'m_melee',51:'m_tank',52:'m_tank',54:'m_melee',55:'m_shield',56:'m_tank',57:'m_splitter',58:'m_charger',59:'m_tank', 60:'m_melee',61:'m_charger',63:'m_tank',65:'m_melee',66:'m_tank',67:'m_caster',68:'m_tank',69:'m_tank', 70:'m_melee',71:'m_archer',74:'m_shield',75:'m_charger',77:'m_tank',79:'m_tank', 80:'m_melee',81:'m_tank',82:'m_caster',83:'m_melee', 84:'m_caster',85:'m_charger',86:'m_caster',87:'m_tank',88:'m_tank',89:'m_tank', 90:'m_melee',91:'m_tank',92:'m_tank',93:'m_melee',94:'m_melee',95:'m_caster', 96:'m_caster',97:'m_caster',98:'m_caster',99:'m_tank'}; |
| 이동음 dispatch | 38665–38675 | let d=dst(P.x,P.y,e.x,e.y); if(d<1000&&!e.stunned&&!e._frozen){ if(!e._mSfxCd)e._mSfxCd=0; if(e._mSfxCd<=0){ if(_mSfxPlaying<3){ const _msk=_ETYPE_SFX[e.etype]\|\|_ARCH_SFX[e.etype]\|\|null; if(_msk){const _vol=Math.max(.03,.35*(1-d/1000));const _msk2=(_msk==='monster_crawl'&&Math.random()<.5)?'monster_crawl1':_msk;playSample(_msk2,_vol,_r(1,.15));e._mSfxCd=60+~~(Math.random()*60);_mSfxPlaying++} } }else e._mSfxCd-=sp; } |


## 부록 D. 모든 핵심 식별자·동적 호출의 명시 참조 행 색인

부록 B의 literal 검색과 달리 아래는 exact identifier/member를 검색한다. 한 줄의 여러 참조는 행 1개로 표시. 선언·주석도 포함한다. 두 HTML만의 정적 범위이며 외부 JS와 전역 동적 접근은 별도 미확인이다.

| 식별자 | game.html 전체 일치 행 | index.html 전체 일치 행 |
|---|---|---|
| BGM | 2734, 2739, 2748, 2801, 3244, 3248, 3420, 3979, 3980, 3984, 3986, 4002, 4043, 4073, 4084, 4095, 4097, 4098, 4099, 4100, 4101, 4104, 4107, 4109, 4110, 4111, 4112, 4113, 4114, 4116, 4117, 4119, 4120, 4121, 4122, 4136, 4155, 4170, 7986, 10049, 10052, 10061, 10419, 17084, 17129, 31669, 35878, 35881, 43872, 43896, 43899, 44079, 48913, 48914, 48941, 49428, 50517, 62094, 62207, 62430, 62560, 62741, 62918, 62936, 62937, 62974, 62980, 63515, 64036, 64152, 64223, 64224 | 635, 2250, 2509, 2541 |
| BGM._getAudio | 4120 | 명시 참조 없음 |
| BGM._isActKey | 4109 | 명시 참조 없음 |
| BGM._onEnded | 4043, 4121 | 명시 참조 없음 |
| BGM._onInteract | 4100, 4136, 4170 | 명시 참조 없음 |
| BGM._pickActFirst | 4111 | 명시 참조 없음 |
| BGM._pickAllRandom | 4111, 4112, 4113, 48914 | 명시 참조 없음 |
| BGM._pickMixed | 명시 참조 없음 | 명시 참조 없음 |
| BGM._pickRandom | 4114 | 명시 참조 없음 |
| BGM.fadeOut | 43872, 43899, 62936, 62980 | 명시 참조 없음 |
| BGM.play | 17084, 17129, 31669, 35878, 35881, 43872, 43896, 43899, 44079, 48914, 50517, 62094, 62207, 62430, 62560, 62918, 62937, 62974, 62980, 63515, 64036, 64152, 64224 | 명시 참조 없음 |
| BGM.playTrack | 48914 | 명시 참조 없음 |
| BGM.setVol | 48913, 49428 | 명시 참조 없음 |
| BGM.stageKey | 31669, 35881, 43896, 44079, 48914, 62094, 62207, 62430, 62560, 62918, 62980, 63515, 64036, 64152 | 명시 참조 없음 |
| BGM.stop | 명시 참조 없음 | 명시 참조 없음 |
| BGM_MAP | 10380, 10381, 10397, 10399 | 명시 참조 없음 |
| SFX | 3264, 6516, 8797, 10014, 10053, 10247, 10261, 10347, 10348, 10355, 12323, 12570, 12579, 12580, 13030, 13035, 13075, 13077, 13278, 13360, 13361, 13802, 15787, 15806, 15823, 16269, 16391, 17162, 17179, 19991, 24828, 28161, 28178, 28221, 28255, 28261, 28263, 28695, 28859, 28915, 28994, 30812, 32192, 32193, 32224, 32225, 32250, 32545, 32546, 32832, 32835, 32838, 32851, 32860, 32891, 32922, 32929, 33052, 33056, 33175, 33449, 33529, 33546, 33565, 33577, 33605, 33621, 33698, 33801, 33876, 34040, 34088, 34111, 34131, 34525, 34534, 34567, 34757, 34925, 34982, 34987, 35105, 35126, 35233, 35269, 35314, 35716, 35906, 36007, 36021, 36148, 36183, 36253, 36295, 36362, 36431, 36435, 36444, 36507, 36534, 36598, 36630, 36705, 36807, 36843, 36862, 36874, 36887, 36898, 36929, 37000, 37033, 37055, 37059, 37061, 37067, 37071, 37073, 37077, 37101, 37131, 37135, 37137, 37141, 37145, 37147, 37151, 37606, 37713, 37714, 37715, 37719, 37721, 37722, 37723, 37728, 37729, 37730, 37731, 37732, 37737, 37748, 37753, 37755, 37756, 37757, 37758, 37763, 37787, 37809, 37828, 37843, 37852, 37858, 37874, 37887, 37894, 37902, 37911, 37927, 37945, 37961, 37976, 37989, 38000, 38010, 38018, 38034, 38045, 38052, 38058, 38065, 38076, 38083, 38092, 38115, 38131, 38146, 38158, 38175, 38189, 38209, 38227, 38267, 38306, 38307, 38573, 38601, 38610, 38849, 38917, 38987, 39005, 39042, 39067, 39091, 39101, 39133, 39138, 39147, 39157, 39171, 39188, 39223, 39251, 39259, 39263, 39275, 39279, 39331, 39363, 39372, 39383, 39398, 39404, 39458, 39472, 39479, 39495, 39500, 39533, 39544, 39563, 39575, 39593, 39631, 39641, 39660, 39672, 39678, 39714, 39734, 39748, 39761, 39780, 39795, 39806, 39817, 39838, 39848, 39877, 39901, 39940, 39956, 39979, 39980, 39997, 40002, 40020, 40031, 40037, 40047, 40064, 40082, 40093, 40099, 40107, 40117, 40148, 40153, 40182, 40187, 40192, 40199, 40200, 40212, 40218, 40228, 40236, 40246, 40305, 40319, 40320, 40340, 40355, 40433, 40535, 40556, 40568, 40579, 40616, 40642, 40661, 40667, 40677, 40679, 40690, 40702, 40718, 40747, 40751, 40793, 40812, 40834, 40865, 40871, 40901, 40907, 40938, 40947, 41003, 41012, 41024, 41039, 41050, 41058, 41078, 41107, 41118, 41148, 41201, 41210, 41250, 41271, 41297, 41323, 41339, 41359, 41451, 41548, 41549, 41585, 41807, 41834, 41877, 41888, 41914, 41988, 42169, 42585, 42740, 42761, 42823, 42847, 42856, 42870, 42878, 42884, 42891, 42903, 42911, 42935, 42943, 42968, 43089, 43162, 43320, 43321, 43325, 43388, 43438, 43463, 43488, 43585, 43735, 43856, 43871, 43896, 43898, 43902, 43912, 43920, 44998, 45029, 45166, 45177, 45211, 45248, 45266, 45267, 45288, 45325, 45403, 45459, 45502, 46103, 46162, 46176, 46228, 46461, 46620, 46640, 46661, 46687, 46700, 46725, 46740, 46844, 46926, 46936, 47011, 47026, 47063, 47080, 47138, 47154, 47175, 47227, 47247, 47319, 47775, 47806, 47813, 47867, 47875, 48281, 48290, 48440, 48597, 48608, 50375, 50405, 50628, 50635, 50783, 50836, 50909, 50948, 50996, 51016, 51032, 51064, 51077, 51175, 51184, 51215, 51249, 51267, 51274, 60774, 61020, 61027, 61076, 61103, 61116, 61137, 61218, 61503, 61666, 62956, 63032, 64431, 64432 | 명시 참조 없음 |
| SFX_MAP | 10358, 10359 | 명시 참조 없음 |
| _ARCH_SFX | 10226, 32084, 38671 | 명시 참조 없음 |
| _ARMOR_ET | 24732, 24770, 24792, 24822 | 명시 참조 없음 |
| _AUDIO_LOAD_CONCURRENCY | 10335, 10352 | 명시 참조 없음 |
| _BEAST_ET | 24730, 24776, 24790 | 명시 참조 없음 |
| _BONE_ET | 24728, 24775, 24789 | 명시 참조 없음 |
| _BOSS_SFX | 24758, 24764 | 명시 참조 없음 |
| _DEATH_VARIANTS | 24735, 24756 | 명시 참조 없음 |
| _EQUIP_SFX_BY_BTYPE | 16264, 16265 | 명시 참조 없음 |
| _EQUIP_SFX_BY_WTYPE | 16263, 16265 | 명시 참조 없음 |
| _ETYPE_SFX | 10226, 32080, 38671 | 명시 참조 없음 |
| _FLESH_ET | 24727, 24774, 24788 | 명시 참조 없음 |
| _GHOST_ET | 24726, 24773, 24787 | 명시 참조 없음 |
| _HUMANOID_ET | 24724, 24771 | 명시 참조 없음 |
| _INSECT_ET | 24725, 24772, 24786 | 명시 참조 없음 |
| _MAGIC_ET | 24731, 24777, 24791 | 명시 참조 없음 |
| _MAX_ACTIVE_NODES | 12220, 12267, 12308, 12466, 12479, 12497, 12516, 12535 | 명시 참조 없음 |
| _MAX_HIT_NODES | 12228, 12265 | 명시 참조 없음 |
| _MAX_PROJ_NODES | 12227, 12263 | 명시 참조 없음 |
| _MAX_STEP_NODES | 12229, 12260 | 명시 참조 없음 |
| _PICKUP_SFX_POOL | 16270, 16271 | 명시 참조 없음 |
| _PRO_VOICE_OFS | 62744, 62939, 63035 | 명시 참조 없음 |
| _SFX_MAX | 12221, 12311 | 명시 참조 없음 |
| _SFX_PER_FRAME | 12223, 12309 | 명시 참조 없음 |
| _SFX_PRI | 12225, 12232, 12233, 12234, 12235, 12236, 12237, 12238, 12239, 12240, 12241, 12242, 12243, 12244, 12250, 12263, 12265, 35360, 35449 | 명시 참조 없음 |
| _SILVERTAIL_VOICE_MAP | 12327, 12341 | 명시 참조 없음 |
| _SILVERTAIL_VOICE_REPEAT_BLOCK_MS | 12337, 12339, 12340 | 명시 참조 없음 |
| _SKILL_SFX_KEYS | 12355, 12356 | 명시 참조 없음 |
| _UNDEAD_ET | 24729, 42209 | 명시 참조 없음 |
| _activeNodeCnt | 12219, 12267, 12275, 12278, 12308, 12466, 12474, 12479, 12492, 12497, 12510, 12516, 12529, 12535, 12543 | 명시 참조 없음 |
| _activeNodes | 12226, 12248, 12250, 12259, 12263, 12265, 12278, 12279 | 명시 참조 없음 |
| _actx | 10016, 10019, 10020, 10024, 10027, 10033, 10037, 10040, 10342, 12325 | 명시 참조 없음 |
| _actxResumePending | 10016, 10027, 10037, 10039, 10040 | 명시 참조 없음 |
| _actxResumed | 10016, 10027, 10038, 10040 | 명시 참조 없음 |
| _actxWatchdog | 10017, 10022, 10023, 10026 | 명시 참조 없음 |
| _audioBuffers | 10068, 10332, 10345, 10347, 12254, 12255, 12397, 12550, 12562, 12663, 63404, 63406 | 명시 참조 없음 |
| _audioLoadPending | 10333, 10345, 10346, 10349, 12255 | 명시 참조 없음 |
| _audioPreloadTask | 10336, 10339, 10340, 10356 | 명시 참조 없음 |
| _beamGain | 12547, 12655, 12675, 12677, 12678 | 명시 참조 없음 |
| _beamLoopGain | 12547, 12659, 12661, 12687, 12688 | 명시 참조 없음 |
| _beamLoopIdx | 12547 | 명시 참조 없음 |
| _beamLoopNext | 12547, 12660, 12661, 12670, 12688 | 명시 참조 없음 |
| _beamLoopSrc | 12547, 12667, 12668, 12687, 12688 | 명시 참조 없음 |
| _beamMod | 12547, 12654, 12655, 12677, 12678 | 명시 참조 없음 |
| _beamOsc | 12547, 12652, 12655, 12677, 12678 | 명시 참조 없음 |
| _beamOsc2 | 12547, 12653, 12655, 12677, 12678 | 명시 참조 없음 |
| _bgmBufCache | 10392, 10404, 10406 | 명시 참조 없음 |
| _bgmCtx | 10050, 10051, 10059, 10060, 10391, 10393 | 명시 참조 없음 |
| _bgmCurKey | 10391, 10395, 10409 | 명시 참조 없음 |
| _bgmCurSlot | 10391, 10413, 10415, 10416, 10424 | 명시 참조 없음 |
| _bgmGainA | 4207, 10050, 10059, 10391, 10410, 10414, 10415 | 명시 참조 없음 |
| _bgmGainB | 4207, 10051, 10060, 10391, 10411, 10414, 10415 | 명시 참조 없음 |
| _bgmGetCtx | 10393, 10403 | 명시 참조 없음 |
| _bgmSrcA | 10391, 10416, 10423 | 명시 참조 없음 |
| _bgmSrcB | 10391, 10416, 10423 | 명시 참조 없음 |
| _blueLpSrc | 33611, 36083 | 명시 참조 없음 |
| _bossSfx | 24764, 24818, 30812, 38308, 41808 | 명시 참조 없음 |
| _busBoss | 10027, 12407, 12444, 12453, 12458 | 명시 참조 없음 |
| _busBossIn | 10028, 12407, 12458 | 명시 참조 없음 |
| _busHit | 10027, 12407, 12430, 12431, 12432, 12434, 12453 | 명시 참조 없음 |
| _busHitIn | 10028, 12407, 12458 | 명시 참조 없음 |
| _busSk | 10027, 12407, 12437, 12438, 12439, 12441, 12453 | 명시 참조 없음 |
| _busSkIn | 10028, 12407, 12458 | 명시 참조 없음 |
| _comp | 12406, 12447, 12448, 12449, 12455, 12456 | 명시 참조 없음 |
| _conv | 12406 | 명시 참조 없음 |
| _deathBloodScale | 24800, 24852 | 명시 참조 없음 |
| _deathSfxCd | 12298, 24796, 24806, 24807 | 명시 참조 없음 |
| _deathSfxFrameMark | 24797, 24804, 24805 | 명시 참조 없음 |
| _deathSfxFrameN | 24797, 24805, 24811, 24812 | 명시 참조 없음 |
| _deathSfxKey | 24765–24783 | function _deathSfxKey(et){ if(et==null)return 'monster_die1'; if(et===100)return _pickDeathVar('death_ghoul1'); if(et===101)return _pickDeathVar('death_ghoul2'); if(et===102)return _pickDeathVar('death_ghoul3'); if(_ARMOR_ET.has(et))return _pickDeathVar('death_armor'); if(_HUMANOID_ET.has(et))return _pickDeathVar('death_humanoid'); if(_INSECT_ET.has(et))return _pickDeathVar('death_insect'); if(_GHOST_ET.has(et))return _pickDeathVar('death_ghost'); if(_FLESH_ET.has(et))return _pickDeathVar('death_flesh'); if(_BONE_ET.has(et))return _pickDeathVar('death_bone'); if(_BEAST_ET.has(et))return _pickDeathVar('death_beast'); if(_MAGIC_ET.has(et))return _pickDeathVar('death_magic'); if(et>=50)return 'death_demon'; if(et>=40)return _pickDeathVar('death_heavy'); if(et>=20)return 'death_ice'; if(et>=10)return 'death_slime'; return 'death_monster'+(1+~~(Math.random()*4)); } |
| _deathSfxThrottled | 24797, 24806, 24807, 24811 | 명시 참조 없음 |
| _dry | 12406 | 명시 참조 없음 |
| _evictLowest | 12246, 12267 | 명시 참조 없음 |
| _gxVolMul | 12361, 12383, 17472 | 명시 참조 없음 |
| _hitSfxCd | 12299, 24798, 42191, 42192 | 명시 참조 없음 |
| _hitSfxForEtype | 24785–24794 | function _hitSfxForEtype(et){ if(_INSECT_ET.has(et))return{key:'monster_hit1',pitch:1.3}; if(_GHOST_ET.has(et))return{key:'monster_hit',pitch:0.7}; if(_FLESH_ET.has(et))return{key:Math.random()<.5?'monster_hit_flesh1':'monster_hit_flesh2',pitch:_r(1,.1)}; if(_BONE_ET.has(et))return{key:'monster_hit1',pitch:1.15}; if(_BEAST_ET.has(et))return{key:'monster_hit',pitch:0.9}; if(_MAGIC_ET.has(et))return{key:'monster_hit1',pitch:1.2}; if(_ARMOR_ET.has(et))return{key:'flat_hit',pitch:1.0}; return{key:Math.random()<.5?'monster_hit':'monster_hit1',pitch:1.0}; } |
| _introGuide | 49035, 63301, 63312, 63337, 63339, 63343, 63352, 63358, 63361, 63389, 63403 | 명시 참조 없음 |
| _isFootstepSfx | 12230, 12233, 12257, 12259, 12363 | 명시 참조 없음 |
| _isSkillSfx | 12238, 12356, 12363, 12377 | 명시 참조 없음 |
| _lastDropSndT | 16267, 16268 | 명시 참조 없음 |
| _loadAudioBuffers | 10338, 63802 | 명시 참조 없음 |
| _loadPreset | 49299, 49319, 49321 | 명시 참조 없음 |
| _mSfxCd | 38668, 38669, 38672, 38674 | 명시 참조 없음 |
| _mSfxPlaying | 12300, 24799, 38670, 38672 | 명시 참조 없음 |
| _mbus | 10027, 10054, 10062, 12406, 12409, 12452, 12453, 12454, 12459, 48912 | 명시 참조 없음 |
| _onAudioGesture | 10042, 10043 | 명시 참조 없음 |
| _pickDeathVar | 24756, 24767, 24768, 24769, 24770, 24771, 24772, 24773, 24774, 24775, 24776, 24777, 24779, 24819 | 명시 참조 없음 |
| _playProjectileHitSfx | 16998, 43541 | 명시 참조 없음 |
| _playSampleNow | 12253, 12317, 12385, 24818, 24819, 24823, 24824, 24825 | 명시 참조 없음 |
| _playSfxSafe | 62871, 63036 | 명시 참조 없음 |
| _playSwordBack | 12391, 38452, 38464 | 명시 참조 없음 |
| _playVoiceSafe | 62872, 63037 | 명시 참조 없음 |
| _proVoice | 62742, 62743, 62745, 62939, 62940, 63035 | 명시 참조 없음 |
| _proVoiceStop | 62745, 62941, 62973 | 명시 참조 없음 |
| _projectileHitSfxAt | 16997, 17000, 17001 | 명시 참조 없음 |
| _r | 9500, 12399, 12463, 12469, 12470, 12500, 12522, 12575, 12579, 12584, 12588, 12589, 12601, 12619, 12623, 12626, 12630, 12803, 12804, 12806, 12809, 12821, 13035, 13075, 13081, 13359, 13360, 13361, 14310, 14321, 16265, 16268, 16271, 16554, 16787, 17289, 17290, 17298, 24695, 24713, 24788, 24815, 24818, 24819, 24823, 24824, 24825, 25561, 25562, 25563, 28695, 28719, 28720, 28822, 28860, 28876, 28885, 28915, 28917, 28927, 28941, 28994, 29009, 29010, 29011, 30812, 32053, 32191, 32192, 32193, 32223, 32224, 32225, 32244, 32375, 32393, 32439, 32509, 32544, 32545, 32546, 32803, 32937, 32963, 33031, 33050, 33052, 33055, 33069, 33112, 33183, 33285, 33319, 33365, 33504, 33529, 33546, 33550, 33564, 33577, 33581, 33614, 33633, 33645, 33652, 33698, 33761, 33801, 33835, 34218, 34222, 34525, 34534, 34567, 35210, 35360, 35449, 35450, 35453, 35454, 35455, 35624, 36097, 36362, 36363, 36424, 36431, 36445, 36451, 36609, 36610, 36613, 36848, 37467, 38310, 38311, 38453, 38466, 38470, 38672, 40738, 41809, 42585, 42707, 42724, 43275, 43327, 43467, 43493, 43495, 43736, 43856, 44773, 44776, 44804, 44807, 44813, 44816, 44959, 45029, 45063, 45166, 45177, 45268, 45288, 45307, 45325, 45339, 45361, 45459, 45519, 45531, 45537, 45559, 45838, 45918, 45934, 46010, 46074, 46092, 46176, 46461, 46520, 46959 | 명시 참조 없음 |
| _resumeAudioCtx | 10036, 10042, 12325 | 명시 참조 없음 |
| _sampleFiles | 10076, 10343, 12255, 63404, 63405 | 명시 참조 없음 |
| _savePreset | 49293, 49318, 49320 | 명시 참조 없음 |
| _sbGain | 12390, 12400, 12401, 12402 | 명시 참조 없음 |
| _sbKeys | 12389, 12395, 12397 | 명시 참조 없음 |
| _sbLast | 12390, 12396, 12572 | 명시 참조 없음 |
| _sbSrc | 12390, 12393, 12398, 12399, 12402 | 명시 참조 없음 |
| _sfxCat | 12310, 12342 | 명시 참조 없음 |
| _sfxFileCache | 10379 | 명시 참조 없음 |
| _sfxFrameCnt | 12218, 12322 | 명시 참조 없음 |
| _sfxFrameReset | 12296, 61810 | 명시 참조 없음 |
| _sfxFrameT | 12218, 12297, 24804, 24805 | 명시 참조 없음 |
| _sfxLastT | 12357, 12364, 12377 | 명시 참조 없음 |
| _sfxPri | 12231, 12256 | 명시 참조 없음 |
| _sfxQueue | 12222, 12306, 12307, 12321, 12367, 12368 | 명시 참조 없음 |
| _sfxRing | 10334, 12395 | 명시 참조 없음 |
| _shieldLoopGain | 12548, 12562, 12564, 12565 | 명시 참조 없음 |
| _shieldLoopSrc | 12548, 12562, 12564, 12565 | 명시 참조 없음 |
| _silvertailTakeVoice | 12339, 12341 | 명시 참조 없음 |
| _silvertailVariantKey | 12340, 12341 | 명시 참조 없음 |
| _silvertailVoiceKey | 10066, 12341, 12359, 12373 | 명시 참조 없음 |
| _silvertailVoiceLastAt | 12338, 12339, 12340 | 명시 참조 없음 |
| _startLoop | 12549, 60469, 63865, 64166 | 명시 참조 없음 |
| _startShieldLoop | 12562, 14310, 14321, 33050, 33365, 33550, 33581, 33652 | 명시 참조 없음 |
| _stopLoop | 12556, 33611, 36083 | 명시 참조 없음 |
| _stopShieldLoop | 12562, 12563, 33761, 33801, 43735 | 명시 참조 없음 |
| _ultMuted | 10046, 10048, 10057 | 명시 참조 없음 |
| _wet | 12406 | 명시 참조 없음 |
| actx | 10018, 10029, 10050, 10051, 10054, 10059, 10060, 10062, 10069, 10342, 12255, 12268, 12304, 12392, 12410, 12467, 12480, 12498, 12517, 12536, 12550, 12558, 12562, 12567, 12651, 12665, 12676, 12691, 63405 | 명시 참조 없음 |
| bgmPlay | 10394 | 명시 참조 없음 |
| bgmTrack | 4109, 4113, 4149, 4150, 4154, 4158, 6311, 48914, 49332 | 명시 참조 없음 |
| bgmVol | 6311, 10058, 48913, 49331, 49428 | 명시 참조 없음 |
| deathFX | 18685, 24801, 37439, 40568, 40703, 42708, 42710, 64445 | 명시 참조 없음 |
| hellcave_settings | 9220, 48876, 49398 | 명시 참조 없음 |
| mbus | 12273, 12400, 12408, 12451, 12473, 12491, 12509, 12527, 12542, 12553, 12562, 12658 | 명시 참조 없음 |
| optBgm | 2733, 48913, 49331 | 명시 참조 없음 |
| optBgmTrack | 2735, 48914, 48942, 49332 | 명시 참조 없음 |
| optBgmVal | 2733, 48913, 49331 | 명시 참조 없음 |
| optSfx | 2732, 48912, 49330 | 명시 참조 없음 |
| optSfxVal | 2732, 48912, 49330 | 명시 참조 없음 |
| playDist | 12496, 12628, 12698, 12706, 12713, 12731, 12740, 12749, 12753, 12800, 12811, 12823 | 명시 참조 없음 |
| playEquipSfx | 16265, 16363, 51175 | 명시 참조 없음 |
| playFM | 9326, 9327, 9330, 9331, 12515, 12597, 12605, 12607, 12627, 12631, 12644, 12699, 12708, 12714, 12723, 12726, 12732, 12735, 12742, 12744, 12751, 12757, 12759, 12760, 12761, 12766, 12768, 12773, 12774, 12780, 12781, 12782, 12786, 12791, 12794, 12817, 12825, 12828, 16378 | 명시 참조 없음 |
| playItemDropSfx | 16268, 16721 | 명시 참조 없음 |
| playItemPickupSfx | 16271, 16408, 16419 | 명시 참조 없음 |
| playNoise | 9326, 9330, 12478, 12595, 12606, 12616, 12620, 12624, 12632, 12634, 12642, 12643, 12700, 12701, 12707, 12715, 12724, 12733, 12734, 12741, 12743, 12750, 12752, 12753, 12758, 12759, 12761, 12769, 12784, 12795, 12801, 12812, 12816, 12824, 12830, 12835, 16378, 46237 | 명시 참조 없음 |
| playSample | 12358, 12575, 12579, 12584, 12588, 12589, 12601, 12619, 12623, 12626, 12630, 12803, 12804, 12806, 12809, 12821, 12834, 13035, 13075, 13081, 13227, 13359, 13360, 13361, 14310, 14321, 16265, 16271, 16554, 16787, 16845, 16848, 17002, 17080, 24695, 24713, 28695, 28720, 28822, 28860, 28876, 28885, 28915, 28916, 28917, 28927, 28941, 28989, 28994, 29009, 29010, 29011, 30812, 32191, 32192, 32193, 32223, 32224, 32225, 32244, 32375, 32393, 32439, 32509, 32544, 32545, 32546, 33031, 33050, 33052, 33055, 33069, 33112, 33113, 33183, 33285, 33319, 33365, 33504, 33529, 33546, 33550, 33564, 33577, 33581, 33614, 33633, 33645, 33652, 33668, 33698, 33716, 33718, 33761, 33801, 33835, 34525, 34534, 34567, 34891, 35210, 35450, 35624, 36097, 36362, 36363, 36424, 36431, 36445, 36451, 36508, 36511, 36602, 36848, 38310, 38311, 38453, 38466, 38470, 38672, 40738, 41809, 41921, 42194, 42585, 42724, 43275, 43327, 43467, 43493, 43495, 43609, 43727, 43736, 43856, 44959, 45029, 45063, 45166, 45177, 45268, 45288, 45307, 45325, 45339, 45361, 45459, 45519, 45531, 45537, 45559, 45652, 45838, 45918, 45934, 46010, 46074, 46092, 46176, 46236, 46461, 46520, 46725, 46740, 46760, 46959, 47247, 62871, 62872, 63403 | 명시 참조 없음 |
| playSampleAt | 12372, 16268, 18731, 28719, 32803, 35360, 35449, 35453, 35454, 35455, 37467 | 명시 참조 없음 |
| playSub | 12534, 12596, 12607, 12617, 12621, 12635, 12645, 12697, 12705, 12712, 12721, 12722, 12726, 12730, 12735, 12739, 12748, 12752, 12769, 12792, 12795, 12799, 12810, 12818, 12822, 12829 | 명시 참조 없음 |
| playTone | 12465, 12646, 12716, 12725, 12743, 12744, 12760, 12766, 12769, 12775, 12786, 12791, 12792, 12795, 12836, 12837, 12840, 55031, 55032 | 명시 참조 없음 |
| playVoiceDirect | 10065, 12973, 12976 | 명시 참조 없음 |
| saveSettings | 9237, 13201, 13209, 13222, 33069, 48664, 48670, 48742, 48755, 48864, 48876, 48907, 48908, 48909, 48911, 48912, 48913, 48914, 48915, 49038, 49039, 49044, 49053, 49059, 49060, 49063, 49064, 49065, 49068, 49069, 49070, 49071, 49072, 49073, 49074, 49075, 49096, 49117, 49118, 49119, 49120, 49121, 49122, 49123, 49124, 49125, 49126, 49127, 49128, 49129, 49313, 49436, 63359, 65664 | 명시 참조 없음 |
| sfxVol | 6311, 10044, 10062, 12272, 12401, 12409, 12452, 12552, 12562, 12658, 24817, 48912, 49330, 55031, 55032 | 명시 참조 없음 |
| ultMute | 10047, 12973, 12976 | 명시 참조 없음 |
| ultUnmute | 10056, 43722, 46825, 46901 | 명시 참조 없음 |


### D.2 index 전용 음향 owner·UI·수명 전수 참조

| 식별자 | index.html 전체 행 |
|---|---|
| lobbyBGM | 2244, 2245, 2255, 2256, 2266 |
| introVoice | 2246, 2247, 2248, 2296, 2384, 2385, 2389, 2392, 2393, 2584, 2585, 2586 |
| _CIN_VOICE | 2249, 2322, 2389, 2582 |
| _CIN_BGM_TRACKS | 2251, 2253 |
| _cinBgm | 2252, 2253, 2258, 2539 |
| bgmStarted | 2254, 2255, 2256, 2259, 2262, 2266, 2272 |
| _tryBGM | 2260, 2268, 2271, 2272 |
| _rmBGMListeners | 2266, 2268 |
| startBGM | 2270, 2710, 2808, 2867, 3424 |
| startCinBgm | 2253, 2509 |
| stopLobbyBgm | 2254, 2839, 3419 |
| stopCinBgm | 2258, 2469, 2709, 2806, 2834, 2865 |
| stopWorldIntro | 2282, 2467, 2705, 2806, 2834, 2865 |
| stopMediaVideo | 2286, 2289, 2468, 2529, 2711, 2806, 2865, 3251 |
| stopIntroVoice | 2295, 2466, 2530, 2708 |
| _worldIntroPlayer | 2164, 2279, 2284, 2539, 2540, 2541, 2544, 2548, 2550, 2574 |
| VOICE_DELAY | 2377, 2385, 2390, 2392, 2583 |
| _introVoiceUnlocked | 2389, 2508, 2856 |
| _introVoiceStarted | 2389, 2393, 2856 |
| _enterSFX | 3776, 3777, 3779, 3781 |
| _enterGain | 3778, 3779, 3781 |
| playEnterSFX | 2496, 3780, 3820, 4725 |
| _hoverCtx | 3786, 3788, 3789, 3792, 3795, 3797, 3798, 3799, 3800, 3806, 3808, 3809 |
| _hoverBuf | 3786, 3790, 3792, 3796 |
| _hoverSrc | 3786, 3795, 3796, 3800, 3801, 3805, 3813 |
| _hoverGain | 3786, 3797, 3798, 3799, 3800, 3805, 3808, 3809, 3813 |
| _startHover | 2560, 3791, 3818, 4306 |
| _stopHover | 1144, 2495, 2561, 2801, 2829, 3419, 3794, 3804, 3819, 4307 |
| worldIntroVoiceGain | 636, 2536 |
| worldIntroMusicGain | 635, 2536 |
| worldIntroVoiceValue | 636, 2545, 2549 |
| worldIntroMusicValue | 635, 2545, 2549 |
| WorldIntroPlayer | 2539 |
| ExoduserCharacterStory | 2261, 3263, 3421, 4175, 4176, 4177 |


### D.3 직접 재생·합성 호출 행 (동적 key 인자도 포함)

| API | game.html 전체 행 | index.html 전체 행 |
|---|---|---|
| playSample | 12358, 12575, 12579, 12584, 12588, 12589, 12601, 12619, 12623, 12626, 12630, 12803, 12804, 12806, 12809, 12821, 12834, 13035, 13075, 13081, 13227, 13359, 13360, 13361, 14310, 14321, 16265, 16271, 16554, 16787, 16845, 16848, 17002, 17080, 24695, 24713, 28695, 28720, 28822, 28860, 28876, 28885, 28915, 28916, 28917, 28927, 28941, 28989, 28994, 29009, 29010, 29011, 30812, 32191, 32192, 32193, 32223, 32224, 32225, 32244, 32375, 32393, 32439, 32509, 32544, 32545, 32546, 33031, 33050, 33052, 33055, 33069, 33112, 33113, 33183, 33285, 33319, 33365, 33504, 33529, 33546, 33550, 33564, 33577, 33581, 33614, 33633, 33645, 33652, 33668, 33698, 33716, 33718, 33761, 33801, 33835, 34525, 34534, 34567, 34891, 35210, 35450, 35624, 36097, 36362, 36363, 36424, 36431, 36445, 36451, 36508, 36511, 36602, 36848, 38310, 38311, 38453, 38466, 38470, 38672, 40738, 41809, 41921, 42194, 42585, 42724, 43275, 43327, 43467, 43493, 43495, 43609, 43727, 43736, 43856, 44959, 45029, 45063, 45166, 45177, 45268, 45288, 45307, 45325, 45339, 45361, 45459, 45519, 45531, 45537, 45559, 45652, 45838, 45918, 45934, 46010, 46074, 46092, 46176, 46236, 46461, 46520, 46725, 46740, 46760, 46959, 47247, 62871, 62872, 63403 | 명시 참조 없음 |
| playSampleAt | 12372, 16268, 18731, 28719, 32803, 35360, 35449, 35453, 35454, 35455, 37467 | 명시 참조 없음 |
| _playSampleNow | 12253, 12317, 12385, 24818, 24819, 24823, 24824, 24825 | 명시 참조 없음 |
| playVoiceDirect | 10065, 12973, 12976 | 명시 참조 없음 |
| playTone | 12465, 12646, 12716, 12725, 12743, 12744, 12760, 12766, 12769, 12775, 12786, 12791, 12792, 12795, 12836, 12837, 12840, 55031, 55032 | 명시 참조 없음 |
| playNoise | 9326, 9330, 12478, 12595, 12606, 12616, 12620, 12624, 12632, 12634, 12642, 12643, 12700, 12701, 12707, 12715, 12724, 12733, 12734, 12741, 12743, 12750, 12752, 12753, 12758, 12759, 12761, 12769, 12784, 12795, 12801, 12812, 12816, 12824, 12830, 12835, 16378, 46237 | 명시 참조 없음 |
| playDist | 12496, 12628, 12698, 12706, 12713, 12731, 12740, 12749, 12753, 12800, 12811, 12823 | 명시 참조 없음 |
| playFM | 9326, 9327, 9330, 9331, 12515, 12597, 12605, 12607, 12627, 12631, 12644, 12699, 12708, 12714, 12723, 12726, 12732, 12735, 12742, 12744, 12751, 12757, 12759, 12760, 12761, 12766, 12768, 12773, 12774, 12780, 12781, 12782, 12786, 12791, 12794, 12817, 12825, 12828, 16378 | 명시 참조 없음 |
| playSub | 12534, 12596, 12607, 12617, 12621, 12635, 12645, 12697, 12705, 12712, 12721, 12722, 12726, 12730, 12735, 12739, 12748, 12752, 12769, 12792, 12795, 12799, 12810, 12818, 12822, 12829 | 명시 참조 없음 |
| new Audio | 4043, 62742 | 2244, 2246, 2253, 3776 |
| createBufferSource | 10069, 10417, 12269, 12398, 12484, 12551, 12562, 12665 | 3795 |
| createGain | 10071, 10410, 10411, 12271, 12400, 12433, 12440, 12444, 12452, 12468, 12488, 12506, 12518, 12519, 12537, 12552, 12562, 12658 | 3779, 3797 |
| setVol | 4207, 48913, 49428 | 명시 참조 없음 |
| fadeOut | 4186, 43872, 43899, 52059, 55342, 55343, 57458, 57459, 58105, 58106, 58163, 58175, 58188, 58197, 62936, 62980, 65025 | 명시 참조 없음 |
| _startLoop | 12549, 60469, 63865, 64166 | 명시 참조 없음 |
| _stopLoop | 12556, 33611, 36083 | 명시 참조 없음 |


### 2026-10-21 DEMO11-40 실제 전투 consumer 연결 기록

사용자 “나눠서” 승인 범위에서 Main 음향 이벤트 bridge와 스킬 음향 함수만 연결했다.
SND-01/02/03/07/08을 재사용하고 기존 공격/피격/사망 선택·RNG는 유지한다.
SND-04 보이스 선택·SND-05/06 BGM을 임의 연결하지 않는다.
SND-08의 native graph adapter는 topology/음량만 출력하며 filter/comp는 명시적 bypass다.
Q/knee/automation/PCM·청감 동등성은 여전히 HOLD다. 전투 판정·State·저장·맵 변경 없음.
공용 변경 위치와 새 경로 검증은 [보고서](orders/reports/demo11-40_REPORT.md)를 따른다.
