# STY-25 드루이드 7줄·29언어 데이터 검수 — 2026-11-04

기준 SHA: `1abd14e1b8eb6e87f132db17e3483437b8b9d944`, 브랜치 `codex/unity-i18n-druid-text-20261104`. 납품 SHA·원격 일치는 레인 `REPORT.md` 첫 줄에 기록한다. 사용자 실행본·unity/main 반영 없음.

판정: **데이터 정합 통과, Mac 화면·원어민 감수 대기**. Unity·Player·빌드 실행 0. 본문 7줄×29언어=203값 중 42값 수정. KO·확정 EN·키·큐·타이밍·Core·Runtime C# 변경 0.

## 범위와 근거

BRIEF.md 맨 끝 정정 절을 우선했다. `1abd14e1b^..1abd14e1b`만 비교하면 B7 두 행만 추가된다. 정정 절에 열거된 나머지 다섯 행은 선행 `74f341b4f`에서 들어와 두 커밋의 JSON 행 차이를 각각 추출했다. 첫인상 T1 영어 수정은 추출 목록에 남기고 이 레인에서는 고치지 않았다.

| 비교 | 파일 | 표시 문구 키 | 상태 | 이번 범위 |
|---|---|---|---|---|
| 1abd14e1b^ → 1abd14e1b | pet_bubble.json | …달아났다. 숲 깊은 곳으로. | 추가 | 대상 |
| 1abd14e1b^ → 1abd14e1b | pet_bubble.json | 도망쳤네. 꼬리 말고 숨은 거야. | 추가 | 대상 |
| 74f341b4f^ → 74f341b4f | demo_text.json | 새 거름이 떨어졌군. | 수정 | 범위 밖(첫인상 T1) |
| 74f341b4f^ → 74f341b4f | demo_text.json | 썩은 숲의 숲지기 | 추가 | 대상 |
| 74f341b4f^ → 74f341b4f | demo_text.json | …껍질쯤이야. 숲이 또 입혀 준다. | 추가 | 대상 |
| 74f341b4f^ → 74f341b4f | demo_text.json | …이 숨은 내 것이다. 아무도 못 거둔다. | 추가 | 대상 |
| 74f341b4f^ → 74f341b4f | pet_bubble.json | …북쪽은 밭이다. 무얼 키우는지는 묻지 마. | 추가 | 대상 |
| 74f341b4f^ → 74f341b4f | pet_bubble.json | 냄새부터 최악이야. 빨리 지나가자. | 추가 | 대상 |

정본 근거는 `origin/unity/main`의 `docs/11내러티브·로어디자인/DARK_DRUID_1-1_BOSS_TEXT_20261104.md`, `DARK_DRUID_1-1_B7_PET_PATCH_20261104.md`, `PET_VOICE_CANON_20261028.md`다. 아레나 기준에는 이 문서와 No.4288~4292 등록 절이 없으므로 정본을 `git show`로 읽었고 기존 번호·KO·EN 그대로 등록했다.

| No. | 표시 위치 | KO | 표시 시간 |
|---|---|---|---|
| 4288 | 이름 카드 부제 | 썩은 숲의 숲지기 | 이름 카드 채널(이 레인에서 시간 변경 없음) |
| 4289 | 보스 자막 life1 | …껍질쯤이야. 숲이 또 입혀 준다. | 2초 |
| 4290 | 보스 자막 life2 | …이 숨은 내 것이다. 아무도 못 거둔다. | 2초 |
| 4291 | 출구 B8·핵터 말풍선 | …북쪽은 밭이다. 무얼 키우는지는 묻지 마. | 4초 |
| 4292 | 출구 B9·디로이 말풍선 | 냄새부터 최악이야. 빨리 지나가자. | 4초 |
| 3350 | 처치 B7·핵터 말풍선 | …달아났다. 숲 깊은 곳으로. | 4초 |
| 3351 | 처치 B7·디로이 말풍선 | 도망쳤네. 꼬리 말고 숨은 거야. | 4초 |

G0: 목표는 이름 카드→목숨 전환→침강 후 펫 대사의 의미·말투·명사 일치다. 직접 연 레퍼런스는 위 스토리 정본, 기존 No.3858 숲지기 대사, visual_select의 지역명이다. 공통 관례는 짧은 전투 자막·용어 통일·언어별 치환/태그 보존·RTL 논리 순서다. 가장 큰 차이는 새 부제의 명사가 기존 지역명/숲지기와 갈라진 점이었다. 제작법은 7행 키 고정 후 비KO·비EN 값만 교체하고 전체 JSON 의미 차이를 검사하는 방식이다. 첫 판정은 문자열 검사이며 실제 화면은 Mac 후속이다. 중단 조건은 동일 검사 2회 실패 또는 KO 의미 변경 필요다.

## 검사 결과

51개 Resources/Data JSON 파싱 통과. 두 카탈로그 언어 순서·중복 없는 29코드·대상 행 유일성·행당 29값·목록 번호/상태·KO/EN 불변·허용 7행 외 데이터 불변 모두 통과했다. 표시 문자열의 치환자와 태그는 원문/번역 모두 0개이고, 명시 줄바꿈도 모두 0개다.

| 언어 | 빈 값 | KO 복사 | 치환자 | 태그 | 앞뒤 공백 | 줄바꿈 | 유니코드 | 용어 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| ko | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| en | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| zh | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| ja | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| es | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| zht | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| ru | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| de | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| ptbr | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| fr | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| pl | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| it | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| uk | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| tr | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| vi | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| th | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| id | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| ar | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| sv | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| da | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| no | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| fi | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| cs | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| hu | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| ro | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| nl | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| el | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| bg | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| ms | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

용어 열은 새 부제를 기존 지역명 및 No.3858 명사의 조합으로 정합한 29언어 계약이다. 다크드루이드 이름은 기존 데이터 그대로다. 모든 문장의 자연어 품질이 자동으로 증명됐다는 뜻은 아니다. 203값을 직접 대조했으나 29언어 원어민 감수 완료를 주장하지 않는다.

초기 검사 1회는 sparse 대상에 CHANGELOG_SYNC.md가 없어 ENOENT로 종료했다. sparse에 브리프 지정 파일을 추가한 뒤 데이터 수정 후 최종 검사 1회가 exit 0이었다. 실패한 검사를 무수정 재실행하지 않았다. 별도로 문자열 문맥 출력 중 Node `-e` 따옴표가 Windows PowerShell에서 소실되어 출력이 실패했고, 이후 모든 Node 실행은 스크립트 파일을 전달했다. PTY 셸 시작도 os error 5로 미실행됐으며 성공으로 세지 않았다.

## 용어 통일표

지역명의 관사·격·문장 대소문자 변화와 숲지기의 합성어 형태는 허용한다(예: Waldwächter/Wächter, skogsvakt/Skovvagt, erdőőr/erdő őre). 기준 자료 자체는 수정하지 않고 새 부제만 맞췄다.

| 언어 | 드루이드(기존 이름) | 썩은 숲(기존 지역명) | 숲지기 포함 부제(검수 후) |
|---|---|---|---|
| ko | 다크드루이드 | 썩은 숲 | 썩은 숲의 숲지기 |
| en | Dark Druid | Rotten Forest | Warden of the Rotten Forest |
| zh | 黑暗德鲁伊 | 腐烂森林 | 腐烂森林的守林人 |
| ja | ダークドルイド | 腐敗の森 | 腐敗の森の番人 |
| es | Druida Oscuro | Bosque Podrido | Guardián del Bosque Podrido |
| zht | 黑暗德魯伊 | 腐爛森林 | 腐爛森林的守林人 |
| ru | Тёмный друид | Гнилой Лес | Страж Гнилого леса |
| de | Dunkler Druide | Fauliger Wald | Wächter des fauligen Waldes |
| ptbr | Druida Sombrio | Floresta Apodrecida | Guardião da Floresta Apodrecida |
| fr | Druide Noir | Forêt Putride | Gardien de la Forêt Putride |
| pl | Mroczny Druid | Zgniły Las | Strażnik Zgniłego Lasu |
| it | Druido Oscuro | Foresta Marcia | Guardiano della Foresta Marcia |
| uk | Темний друїд | Гнилий ліс | Страж Гнилого лісу |
| tr | Karanlık Druid | Çürük Orman | Çürük Orman'ın Bekçisi |
| vi | Druid Hắc Ám | Rừng Mục Nát | Người gác Rừng Mục Nát |
| th | ดรูอิดมืด | ป่าเน่า | ผู้พิทักษ์ป่าเน่า |
| id | Druid Gelap | Hutan Busuk | Penjaga Hutan Busuk |
| ar | الدرويد المظلم | الغابة المتعفنة | حارس الغابة المتعفنة |
| sv | Mörk druid | Ruttnande Skog | Skogsvakt i den ruttnande skogen |
| da | Mørk druide | Rådden Skov | Skovvagten i den rådne skov |
| no | Mørk druide | Råtten Skog | Skogvakten i den råtne skogen |
| fi | Pimeä druidi | Mätä Metsä | Mädän metsän vartija |
| cs | Temný druid | Shnilý les | Strážce shnilého lesa |
| hu | Sötét druida | Rothadt Erdő | A Rothadt Erdő őre |
| ro | Druid Întunecat | Pădurea Putredă | Păzitorul Pădurii Putrede |
| nl | Duistere druïde | Verrot Bos | Boswachter van het verrotte bos |
| el | Σκοτεινός Δρυίδης | Σάπιο Δάσος | Φύλακας του Σάπιου Δάσους |
| bg | Тъмен друид | Гнила гора | Пазачът на Гнилата гора |
| ms | Druid Gelap | Hutan Busuk | Penjaga Hutan Busuk |

| 화자 | 정본 이름·내부 ID | 29언어 본문 처리 |
|---|---|---|
| 까마귀 | 핵터·crow | 대상 7줄에 이름 없음. 이름 번역 신설·변경 0 |
| 고양이 | 디로이·cat | 대상 7줄에 이름 없음. 이름 번역 신설·변경 0 |

No.3350 목록의 옛 헥터 주석만 핵터로 맞췄다. 직업명·아이반·실버테일은 정정 범위에 없으므로 변경 0이다.

## 길이·넘침 위험

문자 수는 공백·문장부호를 포함한 유니코드 자소 묶음 수(Intl.Segmenter)다. 결합 문자의 코드 포인트 수를 폭으로 세지 않는다. 영어 대비 1.4배 초과는 선별 기준이며 실제 글꼴 폭·자동 줄바꿈·화면 넘침 판정이 아니다. KO도 비교표에 포함해 누락 여부를 확인했다.

| No. | UI 칸 | 영어 길이 | 1.4배 초과 언어(자소 묶음 수·배율) |
|---|---|---:|---|
| 4288 | 이름 카드 부제 | 27 | 없음 |
| 4289 | 보스 자막 life1 | 46 | 없음 |
| 4290 | 보스 자막 life2 | 38 | 없음 |
| 4291 | 출구 B8·핵터 말풍선 | 53 | 없음 |
| 4292 | 출구 B9·디로이 말풍선 | 51 | 없음 |
| 3350 | 처치 B7·핵터 말풍선 | 33 | 없음 |
| 3351 | 처치 B7·디로이 말풍선 | 41 | de: 60·1.46배, nl: 65·1.58배 |

| No. | 언어 | UI 칸 | 길이/영어 | 비율 | 번역 |
|---|---|---|---|---:|---|
| 3351 | de | 처치 B7·디로이 말풍선 | 60/41 | 1.46 | Er ist geflohen. Er versteckt sich mit eingezogenem Schwanz. |
| 3351 | nl | 처치 B7·디로이 말풍선 | 65/41 | 1.58 | Hij is gevlucht. Hij verstopt zich met de staart tussen de benen. |

**2초 전환 자막은 별도 위험이다.** 다음 표는 표시 시간 2초를 고정한 자소 묶음 수/초다. 언어별 읽기 속도 합격선이나 실제 픽셀 폭으로 해석하지 않는다. 확정 EN도 life1 23.0·life2 19.0이므로 비영어만의 문제가 아니다. 최장 life1 fr 28.0, life2 id 25.5이다. 한국어 원문·확정 영어·Core 타이밍을 지키면서 전체를 2초 독해 합격이라고 선언할 수 없어 Mac에서 자막 폭과 실제 전환 장면을 확인해야 한다.

| 언어 | life1 길이 | life1 자소/초 | life2 길이 | life2 자소/초 |
|---|---:|---:|---:|---:|
| ko | 19 | 9.5 | 23 | 11.5 |
| en | 46 | 23.0 | 38 | 19.0 |
| zh | 16 | 8.0 | 15 | 7.5 |
| ja | 20 | 10.0 | 20 | 10.0 |
| es | 48 | 24.0 | 39 | 19.5 |
| zht | 16 | 8.0 | 15 | 7.5 |
| ru | 44 | 22.0 | 38 | 19.0 |
| de | 50 | 25.0 | 44 | 22.0 |
| ptbr | 47 | 23.5 | 36 | 18.0 |
| fr | 56 | 28.0 | 48 | 24.0 |
| pl | 44 | 22.0 | 42 | 21.0 |
| it | 48 | 24.0 | 40 | 20.0 |
| uk | 38 | 19.0 | 36 | 18.0 |
| tr | 44 | 22.0 | 35 | 17.5 |
| vi | 50 | 25.0 | 45 | 22.5 |
| th | 27 | 13.5 | 35 | 17.5 |
| id | 54 | 27.0 | 51 | 25.5 |
| ar | 35 | 17.5 | 28 | 14.0 |
| sv | 44 | 22.0 | 46 | 23.0 |
| da | 41 | 20.5 | 41 | 20.5 |
| no | 43 | 21.5 | 44 | 22.0 |
| fi | 43 | 21.5 | 45 | 22.5 |
| cs | 32 | 16.0 | 38 | 19.0 |
| hu | 40 | 20.0 | 45 | 22.5 |
| ro | 48 | 24.0 | 45 | 22.5 |
| nl | 46 | 23.0 | 41 | 20.5 |
| el | 46 | 23.0 | 51 | 25.5 |
| bg | 39 | 19.5 | 34 | 17.0 |
| ms | 40 | 20.0 | 48 | 24.0 |

부제는 영어 비율이 낮아도 이름 카드 실제 칸에서 독일어·프랑스어·러시아어·핀란드어·헝가리어·포르투갈어 등을 실측해야 한다. 길이가 길다는 이유만으로 원문의 숲·껍질·숨·밭·도주 의미를 삭제하지 않았다.

## RTL·결합 문자

아랍어 7값은 문두 …를 논리 순서 앞에, 마침표를 문장 끝에 유지했다. 방향 강제 제어문자·고립자·대체 문자·고립 서로게이트·문두/공백·구두점 뒤 고립 결합 문자 0이다. life2 النَّفَس는 숨을 뜻하도록 모음 부호를 추가했다. 폰트의 실제 RTL 재배열·합자·마침표 위치는 Unity를 실행하지 않아 미확인이다.

태국어 7값은 원본 결합 부호를 보존했고, 밭을 논으로 좁힌 B8과 꼬리를 내렸다는 약한 B7 표현만 의미에 맞게 고쳤다. hi는 프로젝트 29개 코드에 없어 해당 문자열·검사 0건이다. 결합 문자가 코드상 정상이라는 결과를 실제 폰트 조형 판정으로 확대하지 않는다.

## 수정 내역

| No. | 언어 | 수정 전 | 수정 후 | 근거 |
|---|---|---|---|---|
| 4288 | zh | 腐朽森林的守林人 | 腐烂森林的守林人 | 기존 지역명(visual_select)·숲지기(No.3858) 명사 통일; 격·관사·합성어 변화 허용 |
| 4288 | zht | 腐朽森林的守林人 | 腐爛森林的守林人 | 기존 지역명(visual_select)·숲지기(No.3858) 명사 통일; 격·관사·합성어 변화 허용 |
| 4288 | ja | 腐った森の森守 | 腐敗の森の番人 | 기존 지역명(visual_select)·숲지기(No.3858) 명사 통일; 격·관사·합성어 변화 허용 |
| 4288 | de | Wächter des faulenden Waldes | Wächter des fauligen Waldes | 기존 지역명(visual_select)·숲지기(No.3858) 명사 통일; 격·관사·합성어 변화 허용 |
| 4288 | ptbr | Guardião da Floresta Podre | Guardião da Floresta Apodrecida | 기존 지역명(visual_select)·숲지기(No.3858) 명사 통일; 격·관사·합성어 변화 허용 |
| 4288 | fr | Gardien de la forêt pourrie | Gardien de la Forêt Putride | 기존 지역명(visual_select)·숲지기(No.3858) 명사 통일; 격·관사·합성어 변화 허용 |
| 4288 | it | Custode della Foresta Marcia | Guardiano della Foresta Marcia | 기존 지역명(visual_select)·숲지기(No.3858) 명사 통일; 격·관사·합성어 변화 허용 |
| 4288 | uk | Вартовий Гнилого лісу | Страж Гнилого лісу | 기존 지역명(visual_select)·숲지기(No.3858) 명사 통일; 격·관사·합성어 변화 허용 |
| 4288 | tr | Çürümüş Ormanın Bekçisi | Çürük Orman'ın Bekçisi | 기존 지역명(visual_select)·숲지기(No.3858) 명사 통일; 격·관사·합성어 변화 허용 |
| 4288 | vi | Người Canh Giữ Rừng Thối | Người gác Rừng Mục Nát | 기존 지역명(visual_select)·숲지기(No.3858) 명사 통일; 격·관사·합성어 변화 허용 |
| 4288 | sv | Väktare av den ruttna skogen | Skogsvakt i den ruttnande skogen | 기존 지역명(visual_select)·숲지기(No.3858) 명사 통일; 격·관사·합성어 변화 허용 |
| 4288 | da | Vogter af den rådne skov | Skovvagten i den rådne skov | 기존 지역명(visual_select)·숲지기(No.3858) 명사 통일; 격·관사·합성어 변화 허용 |
| 4288 | no | Vokter av den råtne skogen | Skogvakten i den råtne skogen | 기존 지역명(visual_select)·숲지기(No.3858) 명사 통일; 격·관사·합성어 변화 허용 |
| 4288 | fi | Mätänneen metsän vartija | Mädän metsän vartija | 기존 지역명(visual_select)·숲지기(No.3858) 명사 통일; 격·관사·합성어 변화 허용 |
| 4288 | cs | Strážce prohnilého lesa | Strážce shnilého lesa | 기존 지역명(visual_select)·숲지기(No.3858) 명사 통일; 격·관사·합성어 변화 허용 |
| 4288 | hu | A rothadó erdő őrzője | A Rothadt Erdő őre | 기존 지역명(visual_select)·숲지기(No.3858) 명사 통일; 격·관사·합성어 변화 허용 |
| 4288 | nl | Bewaker van het rotte bos | Boswachter van het verrotte bos | 기존 지역명(visual_select)·숲지기(No.3858) 명사 통일; 격·관사·합성어 변화 허용 |
| 4288 | bg | Пазителят на Гнилата гора | Пазачът на Гнилата гора | 기존 지역명(visual_select)·숲지기(No.3858) 명사 통일; 격·관사·합성어 변화 허용 |
| 4289 | ru | …Всего лишь скорлупа. Лес оденет меня снова. | …Всего лишь оболочка. Лес оденет меня снова. | 껍질을 특정 식물·알껍질로 좁히지 않음; 말레이어 목적어가 부자연스러운 입히다 구문 보정 |
| 4289 | uk | …Лише лушпиння. Ліс знову мене зодягне. | …Лише оболонка. Ліс знову мене одягне. | 껍질을 특정 식물·알껍질로 좁히지 않음; 말레이어 목적어가 부자연스러운 입히다 구문 보정 |
| 4289 | ms | …Hanya sebuah cengkerang. Hutan akan menyarungkan aku semula. | …Cuma kulit. Hutan akan membalutku lagi. | 껍질을 특정 식물·알껍질로 좁히지 않음; 말레이어 목적어가 부자연스러운 입히다 구문 보정 |
| 4290 | sv | …Den här andedräkten är min. Ingen skördar den. | …Det här andetaget är mitt. Ingen skördar det. | sv 숨결 명사를 andetag로 명확화; ar 숨(نَفَس) 모음 부호로 자아(نَفْس)와 구별 |
| 4290 | ar | …هذا النفس لي. لا أحد يحصده. | …هذا النَّفَس لي. لا أحد يحصده. | sv 숨결 명사를 andetag로 명확화; ar 숨(نَفَس) 모음 부호로 자아(نَفْس)와 구별 |
| 4291 | es | …Al norte hay un campo. No preguntes qué cultiva. | …Al norte hay un campo. No preguntes qué crece allí. | 밭을 농사짓는 주체로 옮긴 구문 보정; uk·cs 방위의 위치격; th 논→밭 |
| 4291 | ptbr | …Ao norte há um campo. Não pergunte o que ele cultiva. | …Ao norte há um campo. Não pergunte o que cresce lá. | 밭을 농사짓는 주체로 옮긴 구문 보정; uk·cs 방위의 위치격; th 논→밭 |
| 4291 | it | …A nord c’è un campo. Non chiedere cosa coltiva. | …A nord c’è un campo. Non chiedere cosa vi cresce. | 밭을 농사짓는 주체로 옮긴 구문 보정; uk·cs 방위의 위치격; th 논→밭 |
| 4291 | uk | …На північ — поле. Не питай, що на ньому росте. | …На півночі — поле. Не питай, що на ньому росте. | 밭을 농사짓는 주체로 옮긴 구문 보정; uk·cs 방위의 위치격; th 논→밭 |
| 4291 | tr | …Kuzeyde bir tarla var. Ne yetiştirdiğini sorma. | …Kuzeyde bir tarla var. Ne yetiştiğini sorma. | 밭을 농사짓는 주체로 옮긴 구문 보정; uk·cs 방위의 위치격; th 논→밭 |
| 4291 | vi | …Phía bắc là một cánh đồng. Đừng hỏi nó trồng gì. | …Phía bắc là một cánh đồng. Đừng hỏi ở đó trồng gì. | 밭을 농사짓는 주체로 옮긴 구문 보정; uk·cs 방위의 위치격; th 논→밭 |
| 4291 | th | …ทางเหนือเป็นทุ่งนา อย่าถามว่าปลูกอะไร | …ทางเหนือเป็นไร่ อย่าถามว่าปลูกอะไร | 밭을 농사짓는 주체로 옮긴 구문 보정; uk·cs 방위의 위치격; th 논→밭 |
| 4291 | sv | …Norr om här ligger ett fält. Fråga inte vad det odlar. | …Norr om här ligger ett fält. Fråga inte vad som växer där. | 밭을 농사짓는 주체로 옮긴 구문 보정; uk·cs 방위의 위치격; th 논→밭 |
| 4291 | da | …Mod nord ligger en mark. Spørg ikke, hvad den dyrker. | …Mod nord ligger en mark. Spørg ikke, hvad der gror der. | 밭을 농사짓는 주체로 옮긴 구문 보정; uk·cs 방위의 위치격; th 논→밭 |
| 4291 | no | …Mot nord ligger en åker. Ikke spør hva den dyrker. | …Mot nord ligger en åker. Ikke spør hva som vokser der. | 밭을 농사짓는 주체로 옮긴 구문 보정; uk·cs 방위의 위치격; th 논→밭 |
| 4291 | cs | …Na sever leží pole. Neptej se, co se na něm pěstuje. | …Na severu leží pole. Neptej se, co se na něm pěstuje. | 밭을 농사짓는 주체로 옮긴 구문 보정; uk·cs 방위의 위치격; th 논→밭 |
| 4291 | el | …Βόρεια υπάρχει ένα χωράφι. Μη ρωτάς τι καλλιεργεί. | …Βόρεια υπάρχει ένα χωράφι. Μη ρωτάς τι φυτρώνει εκεί. | 밭을 농사짓는 주체로 옮긴 구문 보정; uk·cs 방위의 위치격; th 논→밭 |
| 4291 | bg | …На север има поле. Не питай какво отглежда. | …На север има поле. Не питай какво расте там. | 밭을 농사짓는 주체로 옮긴 구문 보정; uk·cs 방위의 위치격; th 논→밭 |
| 4292 | fr | Ça sent déjà atroce. Traversons vite. | Ça sent déjà affreusement mauvais. Traversons vite. | fr 냄새 표현의 부자연스러운 atroce 보어 보정; id 자연스러운 통과 권유 |
| 4292 | id | Baunya saja sudah mengerikan. Ayo lewati cepat. | Baunya saja sudah mengerikan. Ayo cepat lewat. | fr 냄새 표현의 부자연스러운 atroce 보어 보정; id 자연스러운 통과 권유 |
| 3351 | th | มันหนีไปแล้ว ซ่อนตัวพร้อมหางตกลู่ | มันหนีไปแล้ว ซ่อนตัวหางซุกหว่างขาอยู่ | 꼬리를 내린 상태·끼인 상태를 겁먹고 다리 사이에 만 꼬리로 명확화 |
| 3351 | id | Dia kabur. Bersembunyi dengan ekor terselip. | Dia kabur. Bersembunyi dengan ekor di antara kaki. | 꼬리를 내린 상태·끼인 상태를 겁먹고 다리 사이에 만 꼬리로 명확화 |
| 3351 | el | Το έσκασε. Κρύβεται με την ουρά κάτω. | Το έσκασε. Κρύβεται με την ουρά στα σκέλια. | 꼬리를 내린 상태·끼인 상태를 겁먹고 다리 사이에 만 꼬리로 명확화 |
| 3351 | ms | Dia lari. Dia bersembunyi dengan ekor terselit. | Dia lari. Bersembunyi dengan ekor di celah kaki. | 꼬리를 내린 상태·끼인 상태를 겁먹고 다리 사이에 만 꼬리로 명확화 |

## 줄 끝·Git 범위

| 파일 | 이전 CRLF/LF/고립 CR | 이후 CRLF/LF/고립 CR |
|---|---|---|
| unity/Assets/Exoduser/Resources/Data/demo_text.json | 0/2975/0 | 0/2975/0 |
| unity/Assets/Exoduser/Resources/Data/pet_bubble.json | 0/753/0 | 0/753/0 |
| docs/16번역·로컬라이제이션/번역_가이드.md | 0/224/0 | 0/266/0 |
| docs/16번역·로컬라이제이션/번역대상_전체목록.md | 10626/0/0 | 10638/0/0 |
| docs/CHANGELOG_SYNC.md | 58047/11/0 | 58053/11/0 |

줄 단위 CR 계수에서 전체목록은 CRLF 10,626→10,638행, 단독 LF·고립 CR 0이다. CHANGELOG_SYNC는 기존 혼합 줄 끝(CRLF 58,047·LF 11)을 보존하고 CRLF 6줄만 추가했다. `git diff --numstat`와 `git diff --ignore-cr-at-eol --numstat`는 기존 수정 5파일에서 동일하다. 새 보고서는 LF다.

| 파일 | 추가 | 삭제 |
|---|---:|---:|
| docs/16번역·로컬라이제이션/번역_가이드.md | 42 | 0 |
| docs/16번역·로컬라이제이션/번역대상_전체목록.md | 14 | 2 |
| docs/CHANGELOG_SYNC.md | 6 | 0 |
| unity/Assets/Exoduser/Resources/Data/demo_text.json | 23 | 23 |
| unity/Assets/Exoduser/Resources/Data/pet_bubble.json | 19 | 19 |

커밋 경로는 데이터 2파일, 번역 가이드·전체목록·이 보고서, CHANGELOG_SYNC 총 6개다. 작업 시작 상태는 clean, 지정 작업본은 없어서 E: NTFS에 새 sparse worktree를 생성했다. 다른 작업본·실행본·세이브는 변경하지 않았다. E: 초기 여유 약 1.24 TB였고 빌드·대형 산출물은 만들지 않았다.

## 범위 밖·인계

- No.3106 Regions Purged와 첫인상 T3 중복 여부: 범위 밖으로 미수정.
- character_ui.json의 런타임이 읽지 않는 옛 헬거너 사본: 미수정.
- STY-24 첫인상·직업명·No.4274~4287·visual_select 65행: 이 레인 대상 아님.
- 원본 아레나의 intro0 EN Fresh compost, dropped right in.은 비교 목록에만 기록하고 변경 0.
- unity/main 병합과 실행본 반영은 보스전 총괄 몫. 이 레인에서 병합·실행본 갱신·배포 0.
- Mac 후속: 1920×1080 1x 부제, life1/life2 전환 장면의 2초 독해·줄바꿈, B7→B8→B9 순서와 말풍선 폭, ar RTL·th 결합 글리프. 실제 초과가 있으면 확정 KO/EN·Core를 고치지 않는 표시층 처리 여부를 총괄이 판정한다.

실행 방식: 사용자 지정 `C:/Windows/System32/WindowsPowerShell/v1.0/powershell.exe -NoProfile -Command`를 명시 호출하고 Node는 `C:/nvm4w/nodejs/node.exe`로 스크립트 파일을 전달했다. 외부 실행 도구가 처음의 shell 인자를 pwsh로 처리한 것을 확인한 뒤 지정 PowerShell을 내부에서 명시 호출했다. `</dev/null`은 Windows PowerShell 문법과 충돌하므로 사용하지 않았고 Node의 Git 자식 프로세스는 stdio ignore로 stdin을 닫았다. 무창·무음이며 Unity 실행은 없었다.

검사 자료: 레인 `audit.cjs`·`after-audit.json`. 최초 자료 수집 실패 로그는 도구 실행 기록에 있으며 산출물 복사본·빌드·캡처는 만들지 않았다.

END
