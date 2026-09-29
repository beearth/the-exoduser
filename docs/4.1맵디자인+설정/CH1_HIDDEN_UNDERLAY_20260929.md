## 2026-09-29 — CH1-1 피부–사목 접합85차 적용

현행 cache/bakeVersion은 **20260929-outer-85**, 빌드 레이어는 **21개**다. 서측 하단의 피부 바닥–사목 어깨를 낮은 부패 수피·괴사막으로 연결했다. 비보행101764px만 변경/보행0/고목 핵심 보호3579735px 변경0, 변경chunk1_6 1개·동일63개. 새로고침한 본편8기본 카메라+접합·전투2위치, 이벤트 기반 S/W 이동·24적 공격/Q, 게임error·contextloss0/64청크 응답실패0. 기존 회귀55PASS,21레이어 전체 마스터 재현·224경계 동일. 새 모션0/geometry·충돌 변경0. 전체 **VISUAL VERDICT: RETOUCH**.

[85차 수치·출처·MAP PRODUCTION REPORT SSOT](CH1_OUTER_CONNECTION_PASS85_20260929.md). 아래84차 이하의 '현행'은 당시 제작 이력이다.84차의 미완료 문구는 저장된 최종 검수로 보정했다.

## 2026-09-29 — CH1-1 고목 접합84차 제작 이력

현행 배경은 cache/bakeVersion **20260929-outer-84**다. 서측 부채꼴 고사리 구역을 낮은 부패 수피·괴사막으로 연결했다. master8192²/world8000²/tile40/64청크(core1024/bleed1/1026²), 변경chunk_1_5 1개·동일63개. 총109465px 변화(보행재질12058/비보행97407), geometry·충돌 변경0. 고목 보호2904814px 변경0; 이전 패치 보호 해제는 crop-local[495,340,835,655] 내부뿐(기존 패치 변화70882/창밖0). 타원밖·zero-mask·crop밖0, 선택crop의 near-black≤12/18/22는17595→17392 /64360→63422 /124323→122945. 재질 채널하한24, ellipse[635,490,260,180]/feather.25/opacity.96/줄기보호MaxFilter25·blur18. skin65→outer66..84 총20레이어, 마지막patch x1024/y5120/2048². 기존61차 생체 모듈·늪·동맥 유지/새모션0. 후보9카메라 오류0/G.map동일. 84차 본편18카메라·24적30초 전투·전체 베이크 재현 검수 완료는 저장된 live/runtime·promotion·로그로 확인했다. 현행85차와 상세 검수는 문서 맨 위 링크를 따른다.

[84차 출처·검수 SSOT](CH1_1_PRODUCTION_FINISH_20260916.md#ch1-1-outer84). 아래83차 이하의 현행 표기는 당시 제작 이력이다. 전체 VISUAL VERDICT: RETOUCH.

# CH1-1 가려진 바닥 레이어 정리 — 2026-09-29

사용자 첨부 시작 화면과 “맵에 안보이는 레이어는 빼도 될 것 같다” 지시를 적용했다. 완성 맵의 불투명 청크 아래에 가려진 기존 렌더 작업 3개만 조건부 제외한다. 게임에 보이는 생체·언덕·그림자·소품·전투 효과는 유지한다.

| id / 적용 위치 | 현행 계약 |
|---|---|
| COVERAGE / game.html:_ch1StartOuterCoversView | _ch1StartOuterEnabled=true, phase=smoothing, root=assets/map/ch1/production_finish일 때만 적용. G.mw>0/G.mw=G.mh. 그 외 즉시 false |
| VIEWPORT | z=에디터(G._edZoom 또는1), 일반(G._camZoom 또는1). 유한 z≥.3. margin=max(0,G.shake 또는0)×2+1worldpx. left/right=cam.x±VW/(2z)±margin, top/bottom=cam.y±VH/(2z)±margin. 유한 범위이며 전체가 [0,mw×T]×[0,mh×T] 안에 있어야 한다 |
| READY | cs=mw×T/8. floor(left/cs)..floor(right/cs) 및 floor(top/cs)..floor(bottom/cs)의 모든 청크 검사. manifest 존재/status=ready/img.complete/가로·세로=chunkSize+2×bleed=1026. decoded·loading·error·미등록·틀린 크기는 false. 매 프레임 다시 검사 |
| OPACITY | 현행 master85 RGBA 알파 min=max=255 확인. core1024/bleed1/64청크는 master와 픽셀 동일. 투명 root/별도 art phase에는 적용하지 않는다 |
| HIDDEN_1 | _fillVoidWithFloor 호출 제외. 기존 outside-map clip/타일링·4방향 경계 fade 작업은 전체 화면이 production에 덮일 때만 불필요하다. 맵 밖이 보이면 원래대로 렌더 |
| HIDDEN_2 | _oriFireflies 20개 update/render와 _oriInitParticles 호출 제외. 불투명 청크 아래의 녹색 반딧불이만 해당. 청크 뒤에 그리는 _ambData/ATMO 파티클은 유지 |
| HIDDEN_3 | 기존 _isPlateMap/_drawVistaWorld/_drawMapPaintWorld/_streamMap/_mapCvs/_mapChunks 바닥 캐시 분기 제외. 스트림 청크 요청·큐 추가·뷰포트 합성·캐시 blit은 이 분기에서 발생하지 않는다 |
| FALLBACK | 셋 중 하나라도 준비 실패, 가장자리, 다른stage/보스아레나, 초기 bootFallback, ch1StartOuter=0, outer phase/Rootworld QA면 원래 분기를 그대로 실행. map 캐시 소스/이미지·이미 대기 중인 큐·부트 준비·idle builder는 삭제하지 않음 |
| COUNTERS | __ch1StartOuterQA().stats.underlaySkippedFrames / underlayFallbackFrames. selected start layer가 활성화된 draw당 해당 카운터1증가. 해제된stage는 누적하지 않음 |
| COMPARISON | ?ch1LegacyUnderlay=1이면 이번 조건부 제외만 끄고 기존 레이어를 그린다. 기본값은 제외 활성. 일회성 QA의 함수 spy/강제status 오류는 저장 코드에 없음 |
| ASSETS | 런타임 파일 삭제0, 새 이미지0. 빌드용21개 retouch layer는 master 재현에 필요하고 런타임 개별 로드되지 않으므로 유지. master85/청크64/cache20260929-outer-85/geometry·MAP_OBJS·세이브·충돌값 유지 |
| MEMORY / FPS | 가려진 draw/합성과 신규 스트림 요청을 피하는 변경. 모든 기존 캐시 메모리가 제거됐거나 FPS가 몇% 상승했다고 주장하지 않음. 전후 하드웨어 FPS 표본 없음 |

## 최초83차 레이어 정리 검증 (제작 이력)

- 신규 경계·준비·이동/줌·fallback 회귀6건: RED6FAIL→GREEN6PASS. 기존 지형·retouch·구문9건 PASS, 초기 준비18건·idle2건·원점2건 PASS. 합계37PASS/0FAIL.
- 실제 본편1280×720/SwiftShader:18카메라 모두 정상/흰화면0·JS/HTTP/crash0. 최초 QA는 스트림 큐를 잘못 가정한 assert에서 중단했으며 해당 로그를 보존했다. 실제 _mapCvs blit 계측으로 별도 후속58.1611초 검수 PASS:강제chunk_3_4 오류에서 covered=false/void38/mapBlit38, 복구 후 covered=true/두호출0. tile[46,144] 이동107.6504worldpx·복귀오차2.69126,기존24적/30초공격·Q/적투사체 관측, G.map 동일/JS·HTTP·crash·contextloss0. 18시점과 후속은 별도 컨텍스트이며 연속 종주라고 주장하지 않는다. QA slot/API쓰기차단/HP50ms·무적63f 사용.
- 변경 전 game.html 백업: tmp/ch1-production-pre83/game-before-layer-cleanup.html. 원본83 ART와 백업82·출처 ZIP을 보존한다.
- 앞선83차 실제 Radeon RX9070XT/ANGLE D3D11 검수에서 context loss→restore 뒤 흰 화면1회, 새로고침 후4시점 정상. 이번 레이어 정리를 그 흰 화면의 원인 해결로 해석하지 않는다.

## MAP PRODUCTION REPORT

| 구분 | 항목 | 결과 |
|---|---|---|
| STAGE | 대상 | CH1-1 stage0,83차 완성 원화 위의 runtime cleanup |
| MASTER | silhouette / regions / main route / side spaces | 200²/8구역,6시 시작→12시 출구/우회·전투공간 유지. geometry 변경0 |
| OUTER MASS | LEFT / RIGHT / TOP / SOUTH / major holes | 83차 전체 외곽 목질 유지. 비보행 maxRGB≤22 잔여0/보행 그림자 보존 |
| LARGE | source assets / composites / overlap / repeated silhouette | 신규0/83차19빌드레이어·완성64청크 유지. 가려진 runtime3그룹 제외. 기존 식생 반복 잔여 |
| MEDIUM | connections / remaining holes | 83차 목질 연결 유지, 신규 미러/재질 변경0 |
| GROUND | shadow / contamination / structure integration | 피부 바닥·보이는 생체 그림자/늪/언덕/오브젝트 유지. 가려진 옛 바닥만 조건부 제외 |
| PLAYABLE | main arenas / travel space / breathing space / threat space / combat readability | 넓은 공터/경로/여백/기존 위협 구조 유지. 실제 검수 결과 아래 기록에 연결 |
| LANDMARK | primary / secondary / tertiary | 시체나무/늪·야영지·제단/출구·뼈아치 유지 |
| CAMERA QA | START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | 레이어 정리 후1280×720 18시점 정상. 실제GPU START/ARENA/EXIT 및 강제오류·복구5상태 정상. 기존83차 후보22/본편18/하드웨어4는 앞선 아트 결과 |
| TECH QA | route / collision / pageerror / 404 / seam / loading / performance | 코드회귀37PASS. master/청크/충돌 불변; 실제 강제오류·복구/이동/24적30초전투 정상/JS·HTTP·crash·loss0. FPS 개선율 미측정 |
| FILES | stage-owned / concurrent touched / unrelated touched | game의 맵 렌더 관련 부분/test/ch1HiddenUnderlay.test.js/관련 map·perf docs. 공유 game/CHANGELOG/perf는 이번 부분만 추가. 타 작업 변경 보존/무관한 수정0 |
| GIT | staged / commit / push / deploy | 이 작업 Git쓰기0/미커밋/푸시0/배포0. exec provider 시작 실패 때문에 검증된 복구 체크포인트로 보존 |
| VISUAL VERDICT | 결과 | RETOUCH:83차 검정 공동 감소는 확인. 전체 식생 반복·밀집 효과·과거GPU흰화면 원인은 잔여 |
| NEXT PASS | 후속 | 과거 GPU 흰 화면 원인·장시간 안정성 진단. 부패 식생/고목 접합 보정에서 검정 빈공간·전투 여백 유지 |

검수 기록: [실제18시점·오류 폴백·전투](../../captures/ch1_outer83/underlay-live/runtime.json), [맵·구문15검사](../../captures/ch1_outer83/underlay-tests-green.log), [준비·스트리밍22검사](../../captures/ch1_outer83/underlay-related-tests.log), [83차 전체 원화 보고서](CH1_1_PRODUCTION_FINISH_20260916.md#ch1-1-outer83).

실제GPU 후속: AMD Radeon RX9070XT/ANGLE D3D11,논리2812×1262/기본 브라우저 캡처2813폭,첨부2805×1262(명시적 viewport override0). START cam[4020,7369]와 EXIT[4020,631]는1worldpx 마진이 월드밖에 닿아 기존 바닥을 유지; ARENA[4020,4820]는covered=true. 오류3,4에서visible12/drawn11/covered=false,복구12/12/true. 전 상태GL lost=false/error0,console warn/error0·흰화면0. ordinary CUA 화면으로 직접 검수했고 별도GPU캡처 export0. 임시QA탭/HP타이머/API차단 종료. 이전83차 흰화면 원인은 여전히 미확정. [GPU기록](../../captures/ch1_outer83/underlay-gpu.json)·[통합결과](../../captures/ch1_outer83/underlay-final.json).

최종Git:승인된 git add를 exec_command/system PowerShell로 시도했으나 provider가 WindowsApps pwsh.exe를 시작하며 OS -1073283067/317로 명령 실행 전 실패. 실제Git쓰기0/코드·문서 미커밋. 완료시점175changes/HEAD58160c5383f832d7e1600a6d79ac7dc2a3d877c0는 다른 작업의 상태이며 이번 커밋이 아니다. 원화·소스·문서·본편 검수 및 이번game10개변환만 분리한 패치를 검증ZIP에 보존한다. 타 작업 스테이징/글줄/CRLF 변경0. 텍스트 diff검사는 command-local cr-at-eol로 Windows 줄끝을 인정해PASS; 영구 Git config 변경0.
