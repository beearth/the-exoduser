# 신규 캐릭터 원화 마무리와 선택 화면 연결 — 2026-10-21

사용자 지시 “계속해”에 따라 헬거너·변성술사·창법사 기존 후보를 마무리하고 로컬 `index.html` 선택 화면에 연결했다. 이번 작업자가 고른 제작안이며, 사용자의 최종 미감 승인이나 신규 캐릭터 전투 구현 완료를 뜻하지 않는다. 기존 전사·실버테일 원화와 영상은 변경하지 않았다.

## 제작안과 원본

| idx / id | 제작안 | 보존한 디자인 / 원본 |
|---|---|---|
| 2 / `exoduser_hellgunner` | 기존 대형 저격형 리볼버 수정본 | 적갈색 포니테일·붉은 홍채·흑철 판금·암적색 천, 양손 파지·대형 실린더·긴 총열·총검. `output/steam_store_remaster_20261020/hellgunner_sniper_revolver_remaster.png` (1152×2048) |
| 3 / `exoduser_transmuter` | 코어 건틀릿에서 청염 활을 당기는 수정본 | 은발·검정 후드·발톱 건틀릿·구형 코어·순수 에너지 활/화살/활줄. `output/steam_store_remaster_20261020/transmuter_bow_candidate.png` (1152×2048) |
| 4 / `exoduser_spearmage` | 검토 폴더에 남아 있던 C안 | 은백색 긴 머리·연보라 눈·고리 서클릿·흑철 비늘 드레스·공중 찌르기, 두꺼운 가시 장창과 큰 보라 룬 고리 3개. `output/charselect_remaster_20261019/spearmage_c3_dress.png` (1744×2336). 과거 후드형 v1/v2와 구분 |

## 실제 런타임 에셋

모두 `assets/charselect/` 아래 별도 새 파일이다. 구 JPG/MP4·원본 후보는 보존했다.

| 캐릭터 | 중앙 전신 `portrait` | 좌측 초상 `bust` | 캐시 |
|---|---|---|---|
| 헬거너 | `hellgunner_cut_20261021.png` | `portrait_hellgunner_20261021.png` | `?v=20261021-art` |
| 변성술사 | `transmuter_cut_20261021.png` | `portrait_transmuter_20261021.png` | 동일 |
| 창법사 | `spearmage_cut_20261021.png` | `portrait_spearmage_20261021.png` | 동일 |

| 항목 | 값 / 동작 |
|---|---|
| 전신 | PNG RGBA 1536×2048, 알파 합성. 잘린 누끼 경계의 긴 변을 1856px로 맞추고 중앙 배치 |
| 초상 | PNG RGBA 1024×1024, 원본 좌표 크롭 후 Lanczos 리사이즈 |
| 전신 프레임 배치 | 단일 정지 그림. 스프라이트 시트·애니메이션 프레임 없음 |
| `CHAR_VISUALS[2..4].staticKeyart` | `true`. `selectVisual`이 중앙 stage의 `remastered-keyart` 클래스를 전환 |
| `portrait` / `bust` | 위 새 전신/초상 경로. 일반 선택 시 정적 이미지 표시 |
| `idleVid` / `poster` | 두 값 모두 빈 문자열. 구 디자인 영상을 새 원화 위에 자동 재생하지 않음 |
| `scene` | 기존 `assets/charselect/bg_scene1.png?v=1` 사용 |
| 원화 프레이밍 | `position:absolute; inset:0; width/height/max-height/max-width:100%; object-fit:contain; object-position:center; animation:none`. 새 3종에만 적용. 기존 `80vh` 그림이 stage보다 커져 상단이 잘리던 문제 해소 |
| 출시 잠금 배지 | 새 3종 stage에서만 아래 정렬, 하단 4px. 사슬 폭72px·최대 높이20%, 라벨 padding6px 16px·글자14px·자간 .08em. 얼굴/무기를 가리던 큰 사슬을 축소 |
| 생성 계약 | `comingSoon:true`, `folder:''`, 생성 버튼 비활성 및 기존 생성 가드 유지. 새 전투 기능·스프라이트 추가 없음 |
| 로딩/폴백 | 새 3종은 영상 없이 기존 `_showStatic` 경로로 전신 PNG를 표시. 공통 배경과 텍스트/출시 잠금은 별도 레이어라 이미지 실패 시에도 유지. 새 이미지의 두 번째 그림 폴백은 추가하지 않음. 실제 선택에서 3종 모두 로딩 성공 확인 |

## 누끼·크롭 제작

새 유료 생성은 **0회 / 0pt / 0cr**다. MagicLight Image 탭에서 잔액41,990pt를 조회했으나 새 제출은 하지 않았다. 기존 원화의 얼굴·의상·무기를 다시 그리지 않고 프로젝트 `.venv`의 `rembg/u2net` CPU로 처리했다.

| 항목 | 실제 값 |
|---|---|
| rembg | alpha matting, foreground threshold240, background threshold10, erode size3 |
| 에너지 보존 | B>130, B−G>45, B−R>25인 픽셀의 알파를255로 보존(헬거너 제외). 얇은 청염 활줄·보라 창날 보호 |
| 흰 배경 잔류 수정 | 원본 RGB에서 max−min<25인 중성색만 minRGB230..248 구간을 알파로 감쇠. 머리카락 사이·룬 고리 안의 흰 배경 제거 |
| 코어 보호 | 변성술사 원본 중심(318,536), 반경42px 영역은 흰색 제거에서 제외. 실제 흰 발광 코어가 구멍으로 바뀌지 않도록 유지 |
| 누끼 경계 | 알파>8 경계 사용. 원본 해상도 누끼도 작업 폴더에 보존 |
| 헬거너 초상 crop | 원본 (530,170)~(1152,792), 622×622 |
| 변성술사 초상 crop | 원본 (530,265)~(1152,887), 622×622 |
| 창법사 초상 crop | 원본 (980,80)~(1744,844), 764×764 |

재현 도구: `output/charselect_remaster_20261021/prepare_art.py`. 원본/출력 SHA256과 누끼 경계는 같은 폴더 `art-receipt.json`, 설치한6개 파일의 SHA256·출력 일치 여부는 `installed-assets.json`에 있다.

## 설명문 정합

무기 설계에 맞춰 선택 화면 설명을 정리했다. 스킬 수치·전투 판정은 변경하지 않았다. 아래 한국어 키6개는 `_LOBBY_EN`에 영어 폴백을 함께 추가했다. 다른 언어의 기존 번역 키는 유지되며 새 문구는 해당 언어 번역이 없으면 기존 `_TL` 규칙대로 영어를 표시한다. 28개 언어 신규 번역 완료로 보고하지 않는다.

| 위치 | 한국어 현행 |
|---|---|
| 헬거너 job | 혈월 사수 |
| 헬거너 desc | 자신의 피를 탄환 삼는 혈월의 사수 |
| 헬거너 관통 특징 | 관통 사격 / 대형 리볼버로 일직선상의 적을 꿰뚫습니다. |
| 변성술사 job | 변성술사 (기존 번역 키 재사용) |
| 변성술사 desc | 코어의 청염을 활·낫·창·검으로 변성하는 사냥꾼 |
| 변성술사 영혼 수확 설명 | 처치한 적의 영혼을 거둬 청염 무기를 강화합니다. |
| 변성술사 반월참 | 기존 낫 변성 공격 예시 유지. 낫만 쓰는 직업으로 설명하지 않음 |

## 검수 근거와 한계

| 검수 | 결과 |
|---|---|
| 원화 | 3종 전신/얼굴 크롭·어두운 배경 합성에서 무기 실루엣, 전신 프레임, 은발/망토 가장자리, 흰 배경 잔류·코어 보호를 육안 확인. 생성품의 소재 마모 표현은 보존 |
| 실제 source | `localhost:3333/index.html` HTTP200 응답이 작업 디스크 `index.html`과 동일함을 확인. 서버 재시작 없음 |
| 정상 UI | `127.0.0.1:3333/index.html?test=1&lang=ko&lobby=1` → 데모 입장 → 새 캐릭터 → 3종 미리보기. 상태 주입 없이 클릭. 기존 슬롯 생성/삭제/게임 진입 없음 |
| 렌더 | 3종 새PNG naturalWidth1536·로드 성공, stage 안에 프레임 포함, 구 영상 미표시, 생성 비활성. 전사 복귀 시 정적 원화 전용 클래스 제거·생성 활성 복원 |
| 크기 | 현재 브라우저의 약1479×721 CSS 화면을 육안 검수. 추가 emulation 요청1920×1080 / 390×844는 기존 브라우저 확대율 때문에 실제 `innerWidth/Height`가1097×617 / 223×482였음. 해당 실제 CSS 크기에서 프레임 포함·잠금 유지·좁은 팝업 가로 넘침 없음. 순수1920×1080 CSS 검수로 표기하지 않음. 임시 emulation 해제 |
| 언어 | KO/EN에서 새 설명과 직업 표시 확인. 새 탭의 최종 warn/error 수집0. 전 언어 육안 검수 아님 |
| 자동 검사 | 관련 기존6개 파일 합계99개 중98PASS / 1FAIL. 변경 전후 같은 `test/characterStoryCreation.test.js:40`의 `rejected save does not start the story` 실패(1 !== 0). 새 회귀 실패 없음; 기존 저장 문제는 이번 아트 범위에서 수정하지 않음 |
| 실행 범위 | 개발 source의 로컬 선택 화면 적용. NW.js·Steam·웹 배포·Mac 동기화·캐릭터 전투 구현은 이번 완료 범위가 아님 |

검사 파일: `lobbyVisualKeyboard`, `lobbyCreationOverlayLifecycle`, `lobbyCharacterSelectionInfo`, `characterStoryCreation`, `englishCharacterCatalog`, `characterCreationUltrawide` (`test/*.test.js`).

산출 폴더: `output/charselect_remaster_20261021/`. 비교 원화 `new_heroes_review.jpg`(2400×1500), 실제 화면 `runtime_hellgunner.jpg`·`runtime_transmuter.jpg`·`runtime_spearmage.jpg`·`runtime_english.jpg`·`runtime_compact_desktop.jpg`·`runtime_narrow.jpg`, `runtime-verification.json`을 보존했다. 바탕화면 검토 사본은 `C:/Users/심도진/Desktop/엑소듀서_검토/신캐릭터_리마스터_20261021/`다.

## 소스 소유권·복구

시작 fetch 후 HEAD/origin-main은 `8dbbf2b0e699c36a93ca5cf41a2f3408be6da2c4`, 공용 INDEX는 비어 있었다. 기존 `index.html`의 세계관 v17 src 변경과 다른 작업자의 docs·테스트·삭제 WIP를 보존했다. 수정 전 index 및 편집 문서 사본은 산출 폴더 `original/`, 시작 상태는 `source-receipt.json`에 기록했다.

체크포인트는 새6개 에셋·본인 index 변경·본인 관련 docs/제작 기록만 별도 인덱스로 구성한다. 기존 신규 디자인 LOCK/스팀 문서의 미인수 내용 전체를 끼워 넣지 않는다. 원격 복구 branch·SHA 대조 결과와 포함 파일 목록은 `checkpoint-receipt.json`에 기록한다. 원격 main 갱신·배포 완료와 구분한다.

마감 중 원격 main이 `ac3764bfe5476b56e2f2388b1f2d9baeff731885`로 전진했다. fetch 후 이번 index/에셋/아트 문서와의 충돌 없음 확인. PC HEAD는 시작SHA 그대로 보존하고, 최신 원격을 부모로 한 본인19경로 복구 커밋을 구성한다. PC/Mac 실행 source 통합 완료를 주장하지 않는다.
