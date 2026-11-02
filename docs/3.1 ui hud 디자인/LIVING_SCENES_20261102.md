# 살아 있는 대기 화면 — 2026-11-02

## 범위와 기준

keyart-superwide-brief의 후속 2단계 확대 및 11-02 저녁 지시를 인수한다. 기준은 main ad1646d32이며 시작 메뉴·첫 화면/게이트의 원화·구성·입력·모션은 바꾸지 않는다. 현재 승인된 정지 원화와 Hell Gothic 톤을 유지하며 느린 환경 레이어만 더한다. 원경/바닥의 큰 연무, 신전의 푸른 화로 빛을 고르고 인물의 얼굴·체형을 변형하지 않는다. 새 GIF/영상·CSS 전체 그림 이동·작은 점 입자·그레인·노이즈는 사용하지 않는다. 큰 색 변화·인물 왜곡·경계·입력 가림·잔점이면 FAIL이다.

## 현행 런타임 계약

| 대상 / id | 현행 표현과 보호 |
|---|---|
| 승인된 시작 메뉴·게이트 | splashOverlay/cinClickPrompt/fdgScreen이 보이면 LivingScenes는 idle. title-signboard와 gate의 기존 atmosphere 등록은 보존 |
| 로비 / lobby | 같은 신전/선택 영웅 정지판 위 연무 3겹. 신전 3개 화로 위치만 푸른 빛 약맥동. 기존 lobbyParticles의 작은 불씨 40개는 생성/표시하지 않음 |
| 캐릭터 선택 / charVisualPop | 영웅 5종의 같은 정지 원화, 얼굴·체형 고정. 원경과 바닥의 연무. 기존 csEmbers 26개와 해당 화면 fullscreen-atmosphere 점 입자 대체 |
| 로딩 / loadingBodyArt, chapterGate, stageTransition | 1~19 중 13·14·17 제외 16장 + rd1/rd2/rd4~rd17 16장, 총32장. LoadingArt의 원본/16/21/32판 선택은 유지하고 색조별 연무 추가 |
| 결과 / stageClear, death, demoEnd | 클리어의 낮은 회백 연무, 사망/종료의 낮은 피안개. UI·버튼·보상 수치·전투 규칙 불변. stageClear 연무는 body의 fixed z24, 기존 패널 z25 유지 |
| victory | 기존 엔딩 결과를 표시할 때 같은 clear 연무. 영상 필수 전수는 CTO 지정 클리어/사망/데모 종료3종으로 구분 |

| 상수 / 위치 | 현행 값 |
|---|---|
| 파일 / 패키징 | living-scenes.js/.css를 index.html/game.html에서 로드하고 build-nwjs.mjs FILES에 함께 포함. 보정 이미지는 assets/living-scenes/20261102/ 아래, 기존 assets 재귀 포함 |
| 출력 / 필드 | 캔버스 최대1920×1080 비례 축소, 연무 필드 최대폭1280. pointer-events:none·aria-hidden. 매 프레임 getImageData 없음 |
| 프레임 / 주기 | 최대30회/초. 연무 주기96/144/192초, sin 기반·시드/랜덤 샘플0. 수평 진폭 화면폭의1.7/2.3/2.9%, 원경 알파.075·바닥2겹 각각.13 |
| 연무 톤 RGB | 신전102/123/140, 사망/종료109/57/57, 클리어143/135/114, 보라 환경120/111/138, 청색 환경103/129/149, 녹색 환경108/117/91, 나머지137/106/99 |
| 인물 보호 | 원화 좌표 기준 중심(.5,.47), 타원 반경(.37,.67); 전사 캐릭터 선택의 x중심.36. 타원 내부 .65~.85 구간 완전 보호, .85~1 감쇠. 그림 자체 변위0 |
| 신전 화로 | 원화 기준(.095,.553,r.083),(.238,.52,r.047),(.46,.579,r.071). 11초 주기 + 2.3rad/s 약한 빛 변화. 공간 좌표는 실제 선택판 픽셀/원본 크기로 계산 |
| 정지 조건 | OS prefers-reduced-motion, OPT.reduceMotion, 저장 hellcave_settings.opt.reduceMotion, LivingScenes.setReduced(true), quality low, _hwTier C, atmos0, 숨김, SwiftShader/llvmpipe/software/basic/proxy GPU. 로비 선대 스프라이트도 같은 정책으로 frame0에 정지 |
| 동기화 | 화면/설정 확인400ms, 대상 src/style MutationObserver와 대상 영상 play 이벤트로 즉시 전환. 실제 프레임에서도 정지 정책 확인. 원화 전환 ticket으로 늦은 load/decode 무효화, 취소된 이전 디코딩은 현재 오류로 올리지 않음 |
| 비동기 판 | 현재 원화는 즉시 선택하고 정지판 완료는 stillReady/stillSource로 별도 기록. 이전 영웅/로비의 판을 새 화면에 유지하지 않음. 보정 로딩 실패는 원본 정지판을 남기며 stats.error에 기록 |
| 원본 삽입 좌표 | 실제 plateWidth/height와 메타 원본 폭을 기준으로 중앙 삽입. 1931/814처럼21:9 경계 반올림이 다른 원본에 viewport 판 선택 함수를 재호출하지 않음 |

## 잔점 보정과 원본 보존

초기 일괄 색상/median 보정은 재질 손실로, 주변 텍스처 복제와 자동 밝은 점 마스크는 복제 자국·검은 잔점을 만들어 폐기했다. 자동 픽셀 분류기·Worker는 최종 소스에 없다. 내장 imagegen의 기존 그림 정리 편집16회를 사용했으며 별도 유료 API 호출·키 입력·계정 변경은 없다. 원본 입력과 기존 영상은 보존하고 정리판을 별도 에셋으로 사용한다. 정리판의 미세 재질은 원본과 동일 바이트가 아니며, 모션의 얼굴·체형 변위는0이다.

| 보정 파일 | 실제 생성 크기 / 적용 |
|---|---|
| warrior-clean.webp | 1672×941, lossless WebP. 배경의 불씨 제거판을 실제 중앙 원화 삽입 구간에 놓고 원본 전사·검·망토 실루엣을 다각형 마스크로 복원.35개 원판 복제법은 폐기 |
| death-clean.webp | 1932×814, lossless WebP. 기존1931×814 사망 원화와 같은 구도의 점 제거판을 원본 삽입 구간에 맞춤.32:9 좌우 확장과 UI 유지 |
| loading-{1,2,rd2,rd4,rd7,rd8,rd12}-clean.webp | 2172×610~612. 기존32:9 그림에서 잔점 제거, 생성 캔버스의 흰 위아래 여백만 제거.21:9는 같은 파노라마 중앙 cover |
| loading-{동일7종}-16-clean.webp | 1586~1587×991~992. 원래1920×1200판의16:10 구도를 별도로 정리하여16:9/16:10에 사용.32:9판의 과확대나 늘이기로 대신하지 않음 |
| 나머지 로딩25종 | 기존 원화/와이드 선택판 그대로. 새로운 입자·그레인 추가0 |

모든 정리판은 네이티브4K가 아니다. 동일 크기 전후와3x에서 실제 판독성을 검수하며 고해상도 원본의 모든 미세 질감을 그대로 보존했다고 주장하지 않는다. 프롬프트·크기·SHA256은 assets/living-scenes/20261102/provenance.json, 생성 마스터와 중간 FAIL은 외부 living-1102에 보존한다. clarity.webp·build-title-c2-loop.py 등 폐기 타이틀 WIP는 사용/커밋하지 않는다.

## 실물 검수와 전달

무창·무음 Chrome RX9070XT, 실제 index.html/game.html DOM에 네이티브 화면을 유지하는 fixture를 사용한다. API 저장을 격리하고 새 저장 요청은0이어야 한다. 자연 플레이·오디오·물리32:9모니터·NW.js 전체 실행·Steam 배포 또는 Unity 완료로 확대하지 않는다. 1920×1080/3840×1080 각10초 영상·FPS·동일 크기 원본 정지 | 연출 비교·인물/석재/하늘3x를 남긴다. 21:9와16:10은 추가 정지/입력/경계 검수다. Dota 등 사용자 앱은 종료/대기 사유로 쓰지 않고 측정 당시 실행 여부를 영수증에 적는다.

브라우저 전수/최종 시각 판정/원격 SHA/실행 서버/검수 제한은 I:/EXODUSER-Storage/codex-takeover/living-1102/REPORT.md와 evidence/*.json이 정본이다. source SHA와 runtimeFiles의 실제 바이트 해시를 구분한다. 중간 FAIL/취소 캡처를 최종 완료 증거로 재사용하지 않는다.

Unity 반영: 대기. 같은 원화/환경 마스크와 정지 정책을 ui-ultrawide-brief에 인계하며 Unity 코드/빌드/바로가기는 이 웹 작업에서 변경하지 않는다.
