# PHYSICAL-IMPACT-PREWARM-CANDIDATE

직전 SKILL지원 완료 뒤 기존 승인 성능 결함 수정의 계약 지원 한 건. AGENTS/총괄18.40/관련 SSOT와 최신산출을 읽고 중복 확인한다. root의 실제 `outputs/team-review-20261001/draw-attribution/{raw.json,profile.cpuprofile,clock.json}`에서 draw114.2ms의74표본이 getImageData←_tintHolyDome←_physicalImpactSheet←drawP 경로다. 원인귀속은 UIUX/ITEM이 독립 검수 중이다. 추측으로 게임을 바꾸지 않는다.

소유는 BALANCE/physical-prewarm-*뿐. root 통합용 미적용 후보 함수 `_preparePhysicalImpactSheet()` 및 실제 후보 실행 하니스를 작성한다. 원래 `_physicalImpactSheet`/`_tintHolyDome`는 변경하지 않고, 부트의 `_preloadAssets` 이후·renderer/G.on 이전에 기존 `_tvfx2Imgs['Fire_ImpactFire_Sheet.png']`512² 한 장을 같은 함수/WeakMap에 준비한다. 새이미지/새캐시/RNG/색/알파/전투/쉬운판 변경0. 기존 준비된 캐시 재사용, 공유 in-flight Promise, G.on/bootActive/killed/epoch취소, 기다림은 최대250ms 협력적 예산. 동기1회가 시작되면 선점불가하므로 hard timeout이라 부르지 않는다. 지연/로드실패/예외/타임아웃이면 원래 lazy 폴백 유지·무한로딩0. 원래 이미지의 src/currentSrc/identity 변경을 대기 뒤 확인하고 stale작업은생략. load/error listener를 기존handler 덮어쓰기 없이 쓰고 정리한다. 새stats에 시도/재사용/상태/동기가공시간/전체시간/출력pixelBytes(512²×4) 기록.

본편 코드에 직접 적용하지 않는다. 후보 텍스트와 적용 위치 안내 및 최소 의미 있는 하니스(정상동일객체캐시/재호출0/RNG0/부트밖0/완료되지않은이미지/에러/취소/epoch/source변경/예산/cleanup)를 작성한다. fake clock/실제원함수추출을 구분하고 브라우저픽셀·실전성능은미검수라명시한다. 결과는 root가 원색/알파 전수동일·부트시간·실전회귀 뒤 인수한다. 수신/Read/검사/완료receipt를 기록한다. 한국어 보고.

게임/브라우저/서버/대형빌드/원자료변경·Git·queue·새세션/에이전트 금지.
