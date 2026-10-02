# STORY 수정 피드백 한 건 — 보존 CIN resolver의 실제 진입 계약

작업 ID: STORY-legacy-cin-route-gate-0621. 실제 checkout `/Users/fordeargamers/Projects/exoduser-migration-20261001`. 기존 STORY UUID `3ed6e74d-5552-4d7b-a04b-dc5945e0f3d7`에만 1회 배정한다.

## 소유와 선행 읽기

이 TASK, continuous/COMMON.md, AGENTS.md, 감독 STATE의 STORY 행 및 현행 담당표를 먼저 실제 읽는다. 다른 담당과 공유 중이므로 타인 변경을 되돌리지 않는다. TASK는 감독 소유 읽기 전용. 쓰기는 이 새 폴더의 result.md/evidence.json **2파일만** 소유한다. 이번은 정적 호출/진입 계약 검토이며 checks.mjs/새 테스트/실행 fixture를 만들지 않는다. 생산 코드·공유 docs·이전 산출·기존 테스트·Git(조회 포함)/index·실게임/사용자UI/세이브·서버/빌드·설치/권한/인증·미디어 생성/편집/재생·외부메시지/게시·새 세션/하위팀·삭제/이동/cleanup 0이다. 보호2_3·Q전용 패링·어택티켓금지·캐릭터 LOCK 유지. 이 작업은 맵 제작/geometry/camera QA 범위가 아니다.

제공 checkpoint b72f3f0634f78829df0f227897a1e7555488f103는 총괄이 2026-10-02T06:10 전후 push 및 exact remote SHA 확인을 보고한 값이다. 독립 관측 현재 HEAD로 쓰지 않는다. source는 총괄이 수정 중이므로 실제 읽기 시각/절대경로/행/전체 SHA를 기록하고 이전 pin을 역사값으로 보존한다. 전역 Changes는 감독의 06:16:58Z 관측44이며 자신의 신규3파일만으로 80/100 여유를 판단하지 않는다.80부터 root checkpoint/100 전 신규 산출 중단 지시를 따른다. 원총괄의 보스 사망/필드 리셋은 root 단독 소유이며 조사/중복배정0.

## 이전 한 건 인수와 정정

STORY-empty-cue-fallback-0553의 actual peer TASK 수신05:54:01.516Z, exact TASK Read 성공05:54:07.218Z, 새 end_turn06:14:53.111Z를 확인했다. 기존 result/evidence/checks는 보존한다. 빈 문자열이 ||를 통과해 legacy를 택하는 식 결함은 정적으로 인수한다. 그러나 checks.mjs의 7개 assertion은 **손으로 복사한 resolver 식과 발췌 fixture**이며 현재 파일에서 fragment/배열을 추출해 실행한 증명이 아니다. 실제 실행된 cue13/de·cue0/de/ms와 정적 추론 cue18/16언어를 구분해 새 보고에서 정정한다. 기존7검사/입력 재실행0. approximate readWrite05:56:43는 actual 수신/Read/완료 시각을 대체하지 않는다. capacity hold/resume 수신은 본인 완료보고로 확인했으나 감독 JSONL의 정확 peer user envelope는 아직 미관측이므로 전송 증명 PASS로 확대하지 않는다.

더 큰 미해결 경계: docs/16번역·로컬라이제이션/번역대상_전체목록.md:3372는 현행 v13 영화가 기존 CIN_LINES를 재생하지 않는다고 명시한다. docs/cinematic/WORLD_INTRO_INGAME_20260907.md 재생계약은 문 이후 showLine(0) 중지, 보존 CIN_LINES 대신 WorldIntroPlayer/네이티브 TextTrack을 사용한다고 명시한다. 따라서 이전 보고의 16언어 사용자 노출 위험은 아직 조건부다. old resolver 식 live와 현재 사용자 경로 reachable은 다른 증거다.

## 다음 구체적 한 건

**현재 index.html에서 보존 CIN_LINES→showLine→legacy resolver가 어떤 정상/실패/입력 경로로 실제 호출될 수 있는지**만 정적 대조한다.

1. docs/cinematic/WORLD_INTRO_INGAME_20260907.md, WORLD_INTRO_V6_SUBTITLES_20260907.md, 번역대상_전체목록 CAT-68/CAT-96의 현행/역사 우선순위를 읽는다. 해당 문서가 참조하는 최신 언어/영화 SSOT는 현재 진입/자막 경로 확인에 필요한 부분만 읽으며 문서의 과거 브라우저 PASS를 이번 PASS로 쓰지 않는다.
2. index.html의 실제 door completion→startWorldIntro→WorldIntroPlayer.create/start/next/onError/onEnded, WorldIntroSubtitles.attach/setLanguage와 CIN showLine 호출부/시간 루프/advance 입력/중단 상태를 읽는다. world-intro-player.js 및 world-intro-subtitles.js에서는 위 호출의 실패·재시도·자막 데이터 의존에 필요한 범위만 읽는다. 파일명/행·실패 fallback을 추측하지 않는다.
3. 정상 문 이후, 영화 로딩/재생 실패, player 미생성/중단 시 입력, 재진입·언어 변경을 **각각 실제 조건→callee→CIN resolver 도달 여부→영화 자막 경로→근거 행** 표로 기록한다. _cinReady/_worldIntroPlayer/시간 loop 등록 및 해제 순서를 확인한다. 소스 밖 주입/수동 함수호출/브라우저 동작이 필요하면 UNKNOWN으로 남기고 reachable을 꾸미지 않는다. UI/DOM/미디어/타이머 실행0이다.
4. 기존 식 결함을 현행 제품 경로 결함, 보존 legacy의 잠재 결함, UNKNOWN 중 근거에 맞게 분류한다. 새 코드 후보를 확장하지 않고 root 후보 적용의 Gate만 제시한다. CANONICAL의 CAT-68:2202뿐 아니라 CAT-96:3376의 '절대 참조 안 함/데드'를 **식의 조건부 선택과 제품 경로 미사용**으로 구분하는 exact 인계 문안을 표로 적는다. 20legacy언어 주장→16은 이전 정적 조사 인수값으로 출처를 밝히며 이번에 다시 세지 않는다. 29×32 영화 계약과 28키 보존 CIN 계약을 혼합하지 않는다.

산출 뒤 docs 전체를 rg로 관련 키워드 검색하고 모든 매칭 경로/수정 필요한 section/현행·역사 구분/미검수 상태를 결과에 인계한다. 공유 docs/Git 반영은 root가 한다. result/evidence에 실제 provider/sessionId/UTC/KST·Read·소유·SHA·오류·정적 대조 범위·productionApplied=false·native/media/subtitle Gate 미검수를 기록한다. thinking/인증/개인정보는 복사하지 않는다. 기존 cue 전표·7assertion·번역품질·Space hold·49moves 검사를 반복/합산하지 않는다. 한 건 완료 뒤 한국어 보고하고 추가 업무를 자율 생성하지 않는다.
