# draw 지연 귀속·물리 타격 시트 준비 — root 인수

## 별도 진단 근거

원격 d128e3c8 이후 기존3340·새origin·Chrome152·1352×666/DPR2에서 별도 profiler-on 진단을 실행했다. 1ms sampling 요청, 기존 loop/update/draw3wrapper 및 PerformanceObserver를 사용했다.25초·9처치, 시작HP597/끝HP597, 끝ens39(배열길이), 드롭5. draw wrapper 경과114.2/99ms 두 구간을 기록했다. 기존15처치/129.8ms 경량표본과 다른 사건이며 성능 비교가 아니다.

| 실제 draw | 같은 구간에서 확인한 스택 | 한계 |
|---|---|---|
|114.2ms / loop210 / kill5 유지|`getImageData ← _tintHolyDome ← _physicalImpactSheet ← drawP ← draw`,74sample|111.029ms는 timeDelta를 교집합으로 배분한 추정. CPU 계산 전용·GPU대기를 분해하지 못함.|
|99ms / loop686 / kill9 유지|`getImageData ← membrane ← paint ← atlas ← draw`,61sample|91.387ms 추정. 실제 variant는 기록하지 않았으며 당시 외부script HTTP 본문hash도 별도 미수집. 현재 로컬source 대조만 있음.|

ITEM과 UIUX가 같은 raw/profile을 독립 재분석해 위 경로에 동의했다. 이 구간을 전리품/HUD/문자/RNG 병목으로 확정할 근거는 없다. profile microseconds를 CDP NavigationStart로 정렬했으며 Clock Timestamp는 Runtime 전후10.6ms bracket 안에 있었다. 프로파일 시작도 자체 전후bracket에 포함됐다. 샘플 추정·계측부하·캐시UNKNOWN/기존프로필 한계를 보존한다. profiler와 게임을 종료했고3wrapper복원·dropped0·cleanup오류0이다.

## 정상표본 분석기 보강

BUILD는 기존 정상표본의 수치와 기록을 독립 대조해 일치함을 확인했다. 동시에 빈배열/미종료/처치batch불일치/역행시각/음수duration/비신뢰입력/종료focus/누락dropped 등12변이를 분석기가 잘못 허용함을 재현했다. 실제 원자료에는 그 이상이 없다. root는 필수schema/배열/finite·단조·구간·처치/입력상호참조·명시cleanup/프로파일조건을 보강해 BUILD의 같은변이를 모두제외, 총21검사PASS를 확인했다. 이전 분석기와 analysis는 root-review/normal-analyzer-before.mjs 및 draw-attribution/normal-analysis-before.json에 보존. 원raw불변·수치불변. `synchronousDrawCPU`는 역사적 필드명이며 **동기 경과시간**이지 CPU 계산 전용시간이 아니다.

## 물리 타격 시트 준비 계약

BALANCE 후보와 같은 `_preparePhysicalImpactSheet`를 본편에 추가했다. `_preloadAssets`·기존 드롭/스킨준비 이후, `_bootRenderer` 이전에 원래 `_tvfx2Imgs['Fire_ImpactFire_Sheet.png']`512² 한 장만 기존 `_physicalImpactSheet/_tintHolyDome`과 동일WeakMap으로 준비한다. 입력 이미지·색/알파·첫 행4프레임·크기·시간·원화·RNG·전투/적수/품질은 불변이다. easy/패키지 미반영.

250ms는 협력적 기다림 예산이며 시작된 동기가공을 선점하지 않는다(`prepared-over-budget` 명시). 공유pending, G.on/bootActive/killed/epoch, 이미지 identity/src/currentSrc, load/error/timeout·정리 경계를 확인한다. currentSrc가 빈값에서 로드 후 채워지는 것도 보수적stale로 생략할 수 있다. 미준비/에러/취소는 원래lazy폴백을 유지한다. 새이미지요청0·추가캐시0. 출력Canvas 명목1MiB는 원래첫효과에 할당하던캐시의시점이동이며 임시배열/Canvas·GPU/총메모리상한이 아니다.

BALANCE 실제원함수VM12그룹, root의 실제생산함수/부트순서13+기존darkSphere4=17PASS. guard PASS·6inline구문PASS. 별도Chrome fixture는 원틴트와 후보캐시 **1,048,576바이트 전수0diff**, 둘SHA `b31bc9fb30293b3d019bb9ec68c50c83c772565962f1a498d033485db414bbee`, 동일캐시객체·후속tint0. standalone 원처리13.9ms/후보가공9.9ms는 같은게임성능 비교가 아니다. 실제 실행 후보의 Function.toString이 제출후보와 정확히 일치함을 확인했다.

현재 실제 부트 비용·정상 전투 회귀 인수는 진행 전이다. 아래 후속 기록이 생기기 전 게임 성능 완료로 보지 않는다. membrane99ms는 별도 잔여이며 동시에 수정하지 않는다.

근거: `outputs/team-review-20261001/draw-attribution/`, ITEM/UIUX `draw-attribution-*`, BALANCE `physical-prewarm-*`, BUILD `normal-combat-audit-*`, 실제회귀 `test/physicalImpactPrewarm.test.mjs`.

BUILD 독립15검사와 실제생산회귀17검사도 통과했다(14:58:17Z). currentSrc 정상로드 생략·동기예산선점불가·청소API가 거절하면잔존할수있음을 재확인했다. 정상 브라우저 부트/실전 검수 전의 조건부 통합 단계다.

## 2026-10-02 정상 로드 경계·분석기 추가 보강

원격 `3d5baddd` 보존 뒤 정상 최초 currentSrc 확정 경계를 인수했다. 같은 이미지·불변 절대 src·처음부터 빈 srcset/sizes·complete 조건에서만 빈 currentSrc→원 src를 허용한다. 객체·주소·선택 속성 변경과 취소는 거부한다. 위 최초 통합의 정상 로드 생략 제한은 이 보강으로 수정됐다. 기존 helper/tint/WeakMap·250ms 협력예산·부트 위치는 유지한다. BALANCE before/after 대조는 stale/read0→prepared/read1, 정리 잔여0이다. root 실제 생산 함수18+darkSphere4=22 PASS, guard와 inline6 PASS.

최종 후보 SHA `e80f74f25fcc0ffa2144897ba4290c0b383e46c570f9a7eb4941ef90f29101b0`를 브라우저에서 다시 실행, 원 RGBA1,048,576바이트 0diff와 동일 캐시를 확인했다. 준비11.7ms/전체12.1ms는 standalone 결과이며 게임 개선율이 아니다. 추가 이미지 시도는 이미 complete/currentSrc 확정 상태였으므로 실제 빈값→주소 전환 검증으로 인정하지 않는다(단위 하니스에서는 검증).

ITEM 추가3반례(미래/음수 rAF timestamp, 역순 input)를 분석기에 반영했다. 원 정상자료와 통계 불변, root21 PASS 및 추가8반례 모두 거부. 원 ITEM 실패 증거와 적용 전 분석기를 보존했다. `normal-eligibility-final.json`의 candidate unadopted 문구는 독립 검수기의 기존 문구이며, 실제 current 출력에서 새3반례가 이미 거부됨을 확인했다.

UIUX 식별 결과 dry variant는 0/1/2 중 UNKNOWN이다. 기존99ms 사건을 소급 특정하지 않으며 맵 생산 변경0. 메모리 소스 계측 후보6 PASS와 인계 보고서만 보존한다. 다음은 단일 실제 부트/25초 정상 전투에서 준비 캐시 재사용과 후속 tint0을 확인한다.
