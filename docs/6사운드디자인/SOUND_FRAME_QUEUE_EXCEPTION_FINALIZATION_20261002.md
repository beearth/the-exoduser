# SFX 프레임 큐 dispatch 예외 정리 — 2026-10-02

양판 `_sfxFrameReset` dispatch loop의 `try/finally`만 생산 반영했다. 중간 start 실패 때 부모 배치가 남아 성공 prefix가 다음 reset에서 다시 실행되던 경계를 막는다. **채택 범위는 배치 종료 처리이며 실제 게임-loop/RAF 회복·native/청취 인수는 아니다.**

| id / 현행 접점 | 구현 계약 |
|---|---|
| 변경 | 각 HTML +23bytes. finally의 기존 queue clear/frameCnt reset/양수 sbCd 감소 본문과 그 밖 소스는 원문보존 |
| 종료 | `_sfxQueue.length=0`; `_sfxFrameCnt`의 각값0; `SFX._sbSndCd>0`이면1감소. 성공 종료 및 dispatch throw에 실행 |
| 실패 tail 정책 | root 승인: 실패 현재 배치의 아직 시도하지 않은 우선 tail도 폐기. retry/requeue 없음, 성공 prefix replay 없음. 이미 성공한 활성 노드 수명은 기존대로 유지 |
| 오류 | first/middle/last start 실패 + 우선 tail을 남긴 middle 실패 양판8경우 같은 Error 객체 전파 확인. 실패 노드는 기존 `_playSampleNow._dn` 회수, prefix는 원 timer/onended로 회수 |
| 일반 처리 상한 | `_SFX_PER_FRAME=IS_MOBILE?3:6`: PC6/mobile3. `_SFX_MAX=IS_MOBILE?1:2`: PC2/mobile1. 전체노드 PC48/mobile16 및 기존 backend 정책 변경0 |
| 우선 처리 | `q.pri`는 일반 active/frame/category skip을 bypass. SKILL/player_dead/silvertail의 우선 의도이며 오류 뒤 tail 전달·실청취 보장 없음 |
| 정상 capped tail | ghost1+g_voice3 요청에서 ghost+g_voice2 start, 나머지g_voice1 skip 후 queue0. 정상 capped/skipped tail은 이전에도 폐기 |
| 선행/후행 | frameT/deathCd/hitCd/mPlaying 선행처리 보존. actx/currentTime은 try 앞이라 선행 오류 미포함. suspended resume는 finally 뒤로 예외가 전파되면 미실행; 실제 resume 미검수 |
| 주석 이력 | `프레임당 최대8/나머지는 다음프레임` 기존 주석은 원문보존했지만 현행6/3 frame cap과 배치 폐기 계약을 설명하지 못함 |

| 생산 파일 | 전체 SHA-256 | 1-based 현재 위치 |
|---|---|---|
| game.html | `569e8def89643251cf8670fef26ef2949db72becadbb1579826f2741ee993103` | reset11840–11870, finally11864, clear/count/sb11865–11867 |
| game-easy-test.html | `7022aa1cf52b7a9c194a9533109caf5b5fd16e473f891c7b1693df0fe8d9245e` | reset11244–11274, finally11268, clear/count/sb11269–11271 |

양판 `_sfxFrameReset`은1282bytes/SHA `644d0b6f9b5f35add7a73cfb4e41a650032696e0d6316e5462eda267bcdba905`. +23bytes 역치환으로 전체 HTML 원백업이 재현되며 이전 start cleanup/스킬/boss 등 접점은 변경0이다.

| 검수 | 확정 결과·관측 경계 |
|---|---|
| 신규 test/soundFrameFlushFinallyAcceptance.test.cjs | 최종 actual source12/12그룹 PASS; 정상 옛접점 대조4개 전체 state/events/RNG 동등. source실행16 =12cases+4controls |
| 이전 baseline | 12그룹4PASS/8FAIL, fixture오류0은 수정 전 이력이며 최종 PASS와 합산하지 않음 |
| 실패 관측 | queue0/frameCnt0/sb3→2, manual 다음reset start/replay0. 성공 prefix 활성수0/1/2는 수동 기존 callback 후0 |
| 정상 trace | 양판동등; 정상3항목 및 category cap tail의 옛접점 대조4개 동등. 입력별 RNG6/8 호출은 결정적 fixture만의 관측이며 전역 고정 보장 없음 |
| 구문 | inlineJS12/importmapJSON2 PASS, sourceworker1회; script평가/module import0. 기존 전문팀/root 검사 재실행0 |
| 실제 source | full flush/backend/playSample/helper chain 및 charIdx0 voice-mapping early branch. `_playSampleNow` 시작실패 catch 재수정0 |
| 대역 | 0.2초 buffer·WebAudio source/gain/bus·100/116ms clock·RNG·held timer/onended. frameCnt2/5 및 sbCd3 합성 seed: 자연 양수 producer 도달 미입증 |

현재 loop의 reset 호출은 본편59920/easy58252로 기존 crash처리try 및 후행rAF(60043/58374) 앞이다. 같은 예외 전파는 그 호출의 후행rAF 도달을 중단한다. 하니스의 다음 reset 직접호출은 실제 loop 회복 증거가 아니며 **실게임-loop/RAF 회복 미수정·미인수**다. 실제 브라우저/native AudioContext·디코딩·장치·실시간 timer·청취·저장·패키지/제품 Gate도 미검수다.

생산 영수증 `tmp/mac-migration-runtime/continued-review-20261002/sound-frame-flush-acceptance/receipt.json`, SHA `936bc8c0bc70aad1c9df0aec105506f4ddfdd0779df62037db9a9c3c661ac4dd`. 새 test SHA `36f27d0f856f36301837814312dd38ea7909b81d7d99da5606d45a47cb91fc23`.

원팀 `SOUND-frame-queue-exception-finalization-hb1014` result/checks와 공식 완료 `01a0fc30-3cbe-7531-b357-178bb2358b5d`는 미적용 후보 snapshot으로 보존한다. [이전 시작실패18PASS 보고서](SOUND_SAMPLE_START_FAILURE_20261002.md)의 당시sourceSHA/queue1 이력도 유지하고 이번 부모 종료 계약과 구분한다. 정본 최소교정은 SOUND main300/311/443의 무조건 재생 표현,835 및 성능main1006의 과거queue1 관찰이다.

docs 전수 관련검색은 sourceedit 후1회59행/33경로를 무절단 저장·전행분류했다. sourceworker의 별도32행/14파일 검색도 재실행 없이 연결한다. 코드/검사/원자료/보호문서/운영문서 수정·재실행0; 상세 source/doc SHA·백업·승인 old/new 역치환·개행 및 검색분류 영수증은 `tmp/mac-migration-runtime/continued-review-20261002/sound-frame-queue-docs-backup/completion.json`에 기록한다.


## 2026-10-03 source25 — 사망·부활의 오디오 오류 격리

| 접점 | 현행 계약 |
|---|---|
| player | `die`의 궁극기 unmute·빔/방패 정지·사망/1회부활 음성과 `_fallenResolve`의 부활음·사망음·BGM fade/600ms 예약 callback 각각 오디오 예외를 기록하고 후속 게임 처리를 계속한다. 사망 판정300f·자원·확률·EXP30%·저장 변경0 |
| monster / boss | `deathFX`의 직접 사망음 블록만 catch하여 기존 파티클/혈흔을 후속 실행한다. 일반 보스180f 폴백의 부활음/확정사망음 catch. 부활HP50%/포인트10·55f숨김/40f VFX 보존; si3 전용 피날레 설정 변경0 |
| actual loop | 첫 `_sfxFrameReset` 호출의 catch로 update/draw/다음RAF까지 이어진다. 하위 `_playSampleNow`의 같은Error 전파와 dispatcher finally의 배치 폐기를 변경하지 않는다. context획득은 기존 finally 전이므로 그 실패 때 queue잔류 정책도 보존 |
| 검증 | 원본 공통36검사2PASS/34FAIL → 후보38PASS(정상동등2추가) → 생산38+기존field복귀34=72PASS. 양판 정상7시나리오 및 실제loop185콜백/184물리틱 state/events/RNG 대조. DOM·음향·clock·RAF/update 소비 대역이며 기기 청취/native완주 아님 |
| 적용/보존 | 양판 각12정확치환/+858B; 역치환으로source24원본전체exact. index/backend/flush함수·save·Q/E·보호2_3 불변. source24앱3399는이수정미포함. 보스사망/부활/재도전·청취/저장/화면 인수는아직미완 |

정본: [사망·부활 오류 격리](SOUND_DEATH_REVIVE_PROGRESS_20261003.md). 이전 source 검수와 앱 이력은 당시 결과로 보존한다. lazydecode pending 정리·음원복구/다른피격·입력caller 예외는 이번 범위 밖이며 모든 오디오 장애가 해결됐다고 판정하지 않는다.
