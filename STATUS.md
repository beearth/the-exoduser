# AUTOLOOP STATE
LAST UPDATE: 2026-08-24
CURSOR: L04
CYCLE: 3
FAILSTREAK: 0
SCHEDULER: EXODUSER_AUTOLOOP 등록완료 (2026-08-23, 관리자콘솔, onlogon+지연1분, 계정=심도진, 경로=G:\exoduser\autoloop\run.cmd, 상태=준비)
LOOP: LOOP-RESET 2026-08-24 — A형(lang 검수, 직접수정 허용) + B형(최적화 진단, 보고만). 번역문 생성 금지. game.html 미접촉. 1사이클 1항목, 편집파일 상한 26.
## QUEUE
L01 [DONE] [A] lang 26개 키 누락 대조 — 3-dict 실측(main2685/pfx47/base574), fill 미실행(무의미)
L02 [DONE] [A] 미번역 잔존 검출 — value===key 54건(전부 의도적: "ST"·"💀 " ×26 + ru/uk base 각1), 실제 잔존번역 없음
L03 [DONE] [A] 플레이스홀더 불일치 검사 — 26파일×3dict 전수, 불일치 0 (크래시 리스크 없음)
L04 [TODO] [A] 길이 초과 검출
L05 [TODO] [B] 게임루프 금지 패턴 스캔
L06 [TODO] [B] 중복 연산 후보 탐색
L07 [TODO] [A] 문서 수치 표기 정합
L08 [INVALID] [A] 번역 파이프라인 — 슬롯 8602가 허수(base union 오염). 사유: 일부 파일이 main 문자열을 _BASE에 중복덤프, _T는 base를 "마지막 공백 뒤 단어1개"로만 조회→다어절/비-base 키는 dead data. L11이 실갭 재산출로 대체. (autoloop/translate/ 파일들은 참고용 잔존)
L11 [DONE] [A] canonical 실갭 재산출 — base갭 0(canonical 26 무기base 전 파일 전파완료)·pfx 0·main 1563슬롯(distinct 70키). 8602→1563(허수 7039=base오염 dead data). 우선순위 P1 52/P2 18/P3 0. lang·game.html 미편집
L12 [DONE] [A] real 5키 전파 번역 — 70키=접두38+base27+real5. 접두/base 65키는 이미 _PFX/_BASE 보유→main 삽입=재오염이라 제외. real 5키(⛓️관통!/⛓️관통/⛓️돌파/\👻유령!/\🦴해골무덤!)만 각 언어 구성어(관통/돌파/유령/해골무덤=25/25 존재) 재사용 조립으로 25언어 121슬롯 추가. UNCERTAIN 0, 기존키 불변, pfx/base 불변, BOM·이모지·백슬래시 보존, 25백업. game.html 미접촉
## OPTIMIZE
(B형 진단 결과 적재 — 비어있음)
## TRANSLATE_QUEUE
[L01 요약] _T 폴백=한국어라 미존재 키는 크래시 없음. 실제 번역갭만 아래 기록.
- main dict 미번역(union 2685 기준): zht 0 / zh·ja 각 3 / 나머지 23개 언어 각 54~70 키 미번역
- pfx dict: 47/47 전 언어 완전 (갭 없음)
- base dict(union 574) 편차: 완비군 bg/nl/no/pl(~560~570) vs 저조군 ar/el/fi/hu/ro/th/tr/vi(55, 미번역 519) · ja/zh/zht(43, 519+)
- 총 미번역 슬롯 8602 (전부 한국어 폴백 표시 중, 크래시 아님). 실제 번역은 별도 번역 패스에서 언어·dict별 처리 필요.
[L08 파이프라인] autoloop/translate/ 26 <lang>_missing.json + _glossary.json 생성. 슬롯 8602 검산 일치.
- 1군(base531 발산): ja 534 / zh 534 / zht 531 = 1599
- 2군(base519): ar·el·fi·hu·ro·th·tr·vi 각 588 = 4704
- 3군(15): id·it 각 588 / de·es 93 / ru 95 / sv 97 / fr·uk·ptbr·cs 85~87 / da·nl 84 / no 83 / pl 76 / bg 74 = 2299
- 태그(슬롯): AUTO 8447 / TONE 111 / HOLD 44(컷신·자동번역 금지) / SKIP 0. 고유키 601(AUTO594/TONE5/HOLD2)
- _glossary.json 57항목(원소7·지명7·시스템7·아키타입1·보스35) en확정17·빈값40(인간확정 대기). 용어집 확정 후 번역 착수
[L11 실갭 — 위 L01/L08 수치 대체] canonical 기준 진짜 번역갭:
- base 갭 0 (canonical 무기base 26 = 26파일 전부 보유. L08의 "base 531 미번역"은 100% dead-data 허수)
- pfx 갭 0 (47 균일 유지)
- main 갭 1563슬롯 = distinct 70키 × 미보유 언어. 파일별: zht 0 / zh·ja 3 / de·fr 62 / es 54 / id·it·ru 66 / 나머지 69~70
- 총 실갭 1563 (8602 대비 -7039). 우선순위 P1 52(무기/UI/스킬 확실노출)·P2 18(어픽스/상태/툴팁)·P3 0
- main union 자체는 _T 실호출 전수추출 불가(동적인자 다수)라 union 기준 사용. 단 70키는 실제 게임 문자열(최근 추가분 미전파)로 확인됨
[L12 반영 — 실번역 완료] 70키 재분석: 접두 38(이미 _PFX)·base 27(이미 _BASE)·real 5(어느 dict에도 없음).
- real 5키만 진짜 갭 = 121슬롯(5키×미보유언어). 25언어에 각 언어 자기 구성어 재사용 조립으로 추가 완료. real 갭 → 0
- 접두/base 65키(1442슬롯)는 _PFX/_BASE에 이미 번역 존재 → 조립으로 처리됨. main 삽입은 재오염이라 미실행(비-갭 확정)
- 잔여 union-갭 1442는 전부 접두/base 중복분(dead-redundant), 실 번역 대상 아님. 실질 번역 잔여 = 0
- 편집: lang×25 main only, _PFX/_BASE·BOM·이모지·백슬래시 불변. 백업 autoloop/translate/backup/×25. UNCERTAIN 0
## DONE LOG
Q01 / 43410 / 퇴거180f전량+단일패스삭제
Q02 / 51827,20186 / perf로그경로 확인(무편집)
L01 / lang×26 / 3-dict키대조·fill무의미(No-op)·갭→TRANSLATE_QUEUE
L02 / lang×26 / value===key 54건 전부 의도적("ST"/💀)·잔존번역 0
L03 / lang×26 / 플레이스홀더 불일치 0 (전수, 크래시리스크 없음)
## PENDING-RUN
Q01 / 왕복보행 청크 재빌드 진동 없는지 실런타임 확인
## PENDING-PERF
Q01 / MAP STREAM SPIKE 재측정 (전량퇴거 후 프레임 스파이크)
Q02 / ?perf=1 진입 실측: FRAME HITCH/MAP STREAM SPIKE 로그 수치 수집
Q03 / [보류] texImage2D 매프레임 41회 — 텍스트 아틀라스 재업로드 (부스 2026.09.11 이후 조치) ↓

=== 보류: texImage2D 매프레임 41회 [2026.08.24] ===
증상: bosstest 모드에서 up/f=41.00 call/f=194.00 Mpx/f=42.99 고정, 실기 10fps
확정: 텍스트 아틀라스 2048x512 매프레임 재업로드
배제 완료: ATMOS PHASE2-3 / perf=1 / preserveDrawingBuffer / ENS-WARM / 엔티티 수 / 레벨 / 3D 오버레이 / F키 [일시정지 사양]
미확인: 일반 플레이에서 동일 증상 발생 여부
관련: 조준 프리뷰 링 반경 11398px, X.stroke 세그먼트 36000/frame [별건, 실사용 시 확인 필요]
조치 시점: 부스 [2026.09.11] 이후
근거: 부스 빌드는 데모 스테이지만 사용, bosstest 미사용. 일반 플레이 영향 미확인 상태에서 수정 시 회귀 리스크

[클코 정정 2026.08.24 — 계측 실측 근거]
- 텍스트 아틀라스 재업로드 원인: 글리프 add마다 _txtAtlas._glVer 범프(game.html:4763) + 풀차면 _txtUV.clear() 전체 wipe(4759). 실측 [GLVER] glyphAdd/f≈6.5(실기 41), clear/f≈3.5, uvSize 소수. [TEXMISS] ver가 미스 지배(new/size 아님). 근본수정=프레임당 _glVer 1회 반영 or 변경셀만 texSubImage2D or 아틀라스 확대.
- "조준 링 세그먼트 36000/frame"은 미성립: 프리뷰 링은 풀서클(0,2π)→X.fill/stroke가 단일 quad 셰이더(game.html:5289/5309)로 렌더, 테셀레이션 안 함. _ns 세그먼트식은 '부분호'에만 적용.
- 반경 11398은 캐릭터 레벨 아닌 스킬레벨×22 기준(예: 세이브 maliceStorm Lv11→420px). 통상 플레이선 화면대각 초과 거의 없음.
- 조준 fps 저하(headless 14.5→7)는 SwiftShader 풀스크린 SDF fillrate 아티팩트로, 실 GPU 재현 불확실. 반경 캡 실험 결과 fps 개선 못함(오히려 소폭↓). FIX-A 전량 롤백함.
=== 끝 ===
## BLOCKED
Q03 / game.html 타세션 실시간 점유(미커밋 WIP 유동) / clean 시 재개
Q05 / game.html 타세션 실시간 점유(+2 미커밋, mtime 23:14) / clean 시 재개
## ARCHIVE
(구 QUEUE Q01~Q08 — LOOP-RESET 2026-08-24 이관, 삭제 금지)
Q01 [DONE] 스트리밍 STEP 2
Q02 [DONE] perf 기준선 측정 준비
Q03 [BLOCKED] ATMOS PHASE 2 부유 파티클 패럴랙스 + 광선 빔
Q04 [TODO] ATMOS PHASE 3 전경 실루엣
Q05 [TODO] 부스 버그 3종
Q06 [IN_PROGRESS] ATMOS PHASE 4 모션 3페이즈 재정의 — motion polish kernel v1 커밋됨(bff5c22e 병렬 bulk + 8970aa6a 잔여)
Q07 [TODO] SFX 5레이어 + 16채널 우선순위
Q08 [TODO] BULLET LANGUAGE 패링 시그니처 사운드
