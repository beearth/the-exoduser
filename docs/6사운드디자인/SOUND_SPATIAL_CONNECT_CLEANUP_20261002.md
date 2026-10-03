# 공간 사운드 연결의 동기 실패 정리 — 2026-10-02

현재 양판 `_playSampleNow`의 mono/stereo 연결 실패에서 등록 카운터와 목록을 즉시 정리한다. 실제 CH1 deathFX→분류·변형·backend를 추출한 source 검수이며, 상위 실제 적 처치·게임 루프·AudioContext/장치·청취 인수가 아니다. 새 c927 Mac 앱은 dd333/기존 backend88f298 스냅샷이며 이번 변경 미포함이다.

| id / 적용 | 기존 → 현재 / 보호 경계 |
|---|---|
| backend | 양판 2313B/SHA88f298c061d8a71d3df7bf34a30a15de54a42f5e66faa22c452a7dd71aff32e7 → 2324B/SHAedaa50841ca6c897a30c812035b018c0b09c4db2510ddae7337965c6ce0d336d |
| 세 접점 | try를 mono/stereo if 앞에 추가; `_dnP` 정의/`_nd._dn` 등록을 stereo connect 앞에 이동; 기존 start catch를 wiring/start 공통 catch로 확대. 각 HTML +11B, 역치환 원문100%·함수 밖 byte/EOL 동일(생산 영수증) |
| 분기/등록 | stereo=`pan&&Math.abs(pan)>0.05`, pan clamp[-1,1]. panner 생성/pan.value 설정 → _dnP 등록 → src→panner→gain wiring; mono=src→gain. active count++/list 등록은 두 분기 전 |
| 연결 동기 throw | 선택된 `_nd._dn()` 뒤 동일 Error rethrow; 실패 node에 start/onended/timer 없음. 앞서 성공한 prefix stop/retry·deathCD/frame 소비 rollback 없음 |
| 실패 fixture 현재 | stereo source.connect/panner.connect: 직후 prefix count/list1만 보존→prefix timer 후0. mono source.connect: 직후0·timer0. 각판3경우=6, 같은 Error 관측 |
| 실패 fixture 이력 | 원본 stereo count/list2→prefix timer 뒤1, mono1→1. baseline10중4PASS/6FAIL(별도). 해당 등록 잔류 source 반례이며 영구/native 누수로 확정하지 않음 |
| timer | `_dur=buf.duration||2`; `(_dur+.5)*1000`=`((buf.duration||2)+.5)*1000` 보존. duration .2초 대역의700ms 수동 실행; 실시간700ms 측정0 |
| 정상 controls | 일반2사망과 stage0 boss 사망의 양판4개 옛 실제source 역치환 대조 events/RNG/state/resources 동일. 일반2사망 starts2/RNG18, boss starts1/RNG22는 이 결정적 대역만의 값 |
| 기존 수명 | core _d가 count/list와 src/gain disconnect 중복 시도 가드. normal heldtimer/onended/중복timer에서 panner.disconnect3시도는 기존대로. src/gain 공유try에서 src.disconnect throw면 gain 시도 생략 가능 |
| 정책/설정 | deathFX/변형·볼륨/rate/타이머·우선도·상한·큐 finally·RNG·음원·공식/비용/저장 변경0. 기존 프레임 큐 오류 tail 폐기·동일Error 전파/loop Gate 유지 |

| 생산 파일 | 최종 SHA-256 | 실제 source 시작 |
|---|---|---:|
| game.html | eccfbb2d1492551d0c6f3847ceac5d0358b8e53e66625cc922faa8fc467bdd81 | 11800 |
| game-easy-test.html | b6b8f27539dcc8bfb342793cbce692dfae169dff9f1db12b2012c8166cd49515 | 11204 |

| 검수·영수증 | 실제 결과 / 한계 |
|---|---|
| 신규 test/soundSpatialConnectCleanupAcceptance.test.cjs | actual-source10/10 PASS·FAIL0·fixture0 +정상옛source4개 동일, source14실행. candidate 별도 메모리 실행0. test SHAb22b10e025bfcd1483e08c3b0da98028925af7fbead93635235ac01a30ac603b |
| source/대역 | 각판 full deathFX·backend/helper chain32블록(11함수/16상수/5state선언). G.stage0/PC·mapping key의.2초 buffer·.5 결정적 RNG/clock·AudioNode/bus·held timer/onended·VFX/particle은 대역. 실제 ordinary 두 번째 -0.35pan 분기, upstream kill/fullboss/input 실행0 |
| 구문/보존 | inlineJS12/importmapJSON2 각1회 PASS. 이전 specialist/start/flush/input/build/native 검사 재실행0. 원팀raw2·테스트·앱4core 보존은 생산 영수증 범위 |
| source Gate | productionAccepted=true는 세 connect 오류의 등록 회수에 한정. runtime/native/visual/audio/productAccepted=false |

`pan.value`는 `_dnP` 등록 전이다. setter 오류 때 core 회수 코드는 있으나 그 panner의 완전 disconnect를 검수하지 않았다. catch 안에 constructor/onended/setTimeout/start도 포함되지만 이번 새 검수는 connect3경우만이며 나머지 실패를 PASS로 확대하지 않는다. 등록 전 src.buffer/playbackRate/gain setter와 gain.connect(mbus), 축출복구·손상 intrinsic/배열·disconnect throw, gain-volume setter/buffer identity의 별도 정상 trace, 실제 decode/장치/timing·전체게임/저장·loop/RAF 회복은 미검수다.

공식 완료01a0fc89-7439-7ab2-bf6c-00c607b4e2f9와 supervisor handoff는 원후보 인수 이력이다. 생산 최종 영수증: `tmp/mac-migration-runtime/continued-review-20261002/sound-spatial-connect-acceptance/final-receipt.json`, SHA771e38488d9a41c9cb6175f7010d199348632d9461855e53ae89796f13f101e6. 최종검사10/10과 원팀10실행/역사baseline4/6 및 이전 start18/flush12는 합산하지 않는다.

관련 정본 [사운드](6사운드디자인.md)·[성능](../12퍼포먼스·최적화/12퍼포먼스·최적화.md)의 이번 부록은 기존 start-only 설명을 현재 wiring 보호구간으로 보강한다. 이전 SOUND 시작/프레임 큐 전용 보고서는 당시 source/검수 snapshot으로 원문 보존한다. 전체 docs 관련키워드 검색·모든 행/경로 분류와 원문 byte 백업은 `tmp/mac-migration-runtime/continued-review-20261002/sound-spatial-connect-docs-backup/`에 둔다. 원자료·보호2_3·root 운영문서·앱/세이브 수정0, 이 문서 담당 검사 실행0.


## 2026-10-03 source25 — 사망·부활의 오디오 오류 격리

| 접점 | 현행 계약 |
|---|---|
| player | `die`의 궁극기 unmute·빔/방패 정지·사망/1회부활 음성과 `_fallenResolve`의 부활음·사망음·BGM fade/600ms 예약 callback 각각 오디오 예외를 기록하고 후속 게임 처리를 계속한다. 사망 판정300f·자원·확률·EXP30%·저장 변경0 |
| monster / boss | `deathFX`의 직접 사망음 블록만 catch하여 기존 파티클/혈흔을 후속 실행한다. 일반 보스180f 폴백의 부활음/확정사망음 catch. 부활HP50%/포인트10·55f숨김/40f VFX 보존; si3 전용 피날레 설정 변경0 |
| actual loop | 첫 `_sfxFrameReset` 호출의 catch로 update/draw/다음RAF까지 이어진다. 하위 `_playSampleNow`의 같은Error 전파와 dispatcher finally의 배치 폐기를 변경하지 않는다. context획득은 기존 finally 전이므로 그 실패 때 queue잔류 정책도 보존 |
| 검증 | 원본 공통36검사2PASS/34FAIL → 후보38PASS(정상동등2추가) → 생산38+기존field복귀34=72PASS. 양판 정상7시나리오 및 실제loop185콜백/184물리틱 state/events/RNG 대조. DOM·음향·clock·RAF/update 소비 대역이며 기기 청취/native완주 아님 |
| 적용/보존 | 양판 각12정확치환/+858B; 역치환으로source24원본전체exact. index/backend/flush함수·save·Q/E·보호2_3 불변. source24앱3399는이수정미포함. 보스사망/부활/재도전·청취/저장/화면 인수는아직미완 |

정본: [사망·부활 오류 격리](SOUND_DEATH_REVIVE_PROGRESS_20261003.md). 이전 source 검수와 앱 이력은 당시 결과로 보존한다. lazydecode pending 정리·음원복구/다른피격·입력caller 예외는 이번 범위 밖이며 모든 오디오 장애가 해결됐다고 판정하지 않는다.
