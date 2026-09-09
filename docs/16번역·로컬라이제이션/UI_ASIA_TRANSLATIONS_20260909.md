# 아시아권 UI 보완 — 2026-09-09

Steam 자막·인터페이스 지원 목표 중 일본어·말레이어·인도네시아어·태국어·베트남어의 누락 UI를 보완한다. 런타임 및 번들 통합 상태는 [언어 범위](STEAM_LANGUAGE_SCOPE_20260909.md)를 따른다. 이 문서는 번역 데이터 작업 기록이며 음성 더빙이나 게임 수치를 변경하지 않는다.

## 파일과 수량

| 코드 | 본문 파일 | 필요 키 | 작성 키 | 추가 UI 파일 | 추가 키 |
|---|---|---:|---:|---|---:|
| ja | `localization/ui/ja.json` | 488 | 488 | 별도 루트 작업 소유 | — |
| ms | `localization/ui/ms.json` | 563 | 575 | 별도 루트 작업 소유 | — |
| id | `localization/ui/id.json` | 493 | 498 | `localization/ui-extra/id.json` | 66 |
| th | `localization/ui/th.json` | 493 | 498 | `localization/ui-extra/th.json` | 66 |
| vi | `localization/ui/vi.json` | 493 | 498 | `localization/ui-extra/vi.json` | 66 |
| 합계 | 본문 5개 | 2,530 | 2,557 | 추가 3개 | 198 |

- 기준 목록은 `ui-source.json` 576개와 `ui-needed.json`의 언어별 작업 목록, `ui-extra-source.json` 66개다. 원문 한국어 키는 그대로 보존했다.
- id/th/vi의 필요 수량보다 많은 5개는 기존 영어로 남은 펫 대사 보완이다. ms는 말레이 로비 공통 키도 포함한다.
- 스킬 설명·동적 강화값·스탯 투자/환불·인벤토리·제작·보스 종료 문구·로비 오류를 포함한다. 추가 UI는 등급, 합체명, 창고/분해/제작 확인, 기본 장비명, BGM 선택 항목과 구역명이다.
- 말레이어는 기존 말레이 카탈로그와 로비 표현을 기준으로 인도네시아어 초안의 어휘·문법·대사를 별도 교정했다. `kerosakan`, `kemahiran`, `masa tunggu`, `saat`, `tetikus`, `watak` 등 말레이 표현을 사용한다.

## 명칭·동작 계약

| 항목 | ja | ms | id | th | vi |
|---|---|---|---|---|---|
| 뇌전창: 설치형 기본 스킬 | 雷の杭 | Pancang Petir | Pasak Petir | เสาสายฟ้า | Cọc Sét |
| 전격의창: 합체 스킬 | 雷撃の槍 | Lembing Petir | Tombak Petir | หอกสายฟ้า | Thương Sét |
| 악의 | 悪意 | Niat Jahat | Niat Jahat | ความอาฆาต | Ác Ý |
| 선택 버튼 | 選択 | Pilih | Pilih | เลือก | Chọn |
| 도감 등록 동작 | 図鑑に登録 | Daftar dalam kodeks | Daftarkan ke kodeks | ลงทะเบียนสารานุกรม | Đăng ký vào từ điển |
| SP 부족 경고 | SP不足 | SP tidak mencukupi | SP tidak cukup | SP ไม่พอ | Không đủ SP |

`뇌전창` 명칭은 `localization/terminology.json`의 루트 확정값에 맞춘다. 무지개·보라 마법탄은 Q, 물리탄은 E라는 명시 문구를 보존한다. Shift/Space/CT/Ctrl/Q/E/F/L/R/T 등 조작키와 `{p0}`, `{n}`, `{name}`의 철자·중복 횟수를 유지한다. `<br>`, `&nbsp;`, 줄바꿈도 유지한다.

일본어 합체 참조는 루트 추가명과 일치하도록 雷撃螺旋·骸骨雷撃·悔悟の帰還·剣背翼·疫血解放으로 정리했다. 인도네시아어는 기본 명칭 Umpan Hantu·Putar-Ledak·Sayap Perisai·Domain Suci·Domain Pengikat·Domain Penghancur·Domain Korosi·Domain Tembus를 따른다. 기본 기동 칼날개와 칼등날개를 같은 이름으로 바꾸지 않는다.

말레이어 기본 참조는 Umpan Hantu·Putar-Letup·Sayap Perisai·Domain Suci·Domain Pengikat·Domain Pemusnah·Domain Korosi·Domain Tembus로, 추가 합체명은 별도 `ui-extra/ms.json`과 맞췄다. 태국어는 หุ่นล่อผี·การสำนึกผิด·เขตศักดิ์สิทธิ์·เขตทำลาย·เขตเจาะทะลุ, 베트남어는 Xoáy Nổ·Cánh Khiên·Sét Truy Vết·Lĩnh Vực Thánh·Lĩnh Vực Trói·Lĩnh Vực Vỡ·Lĩnh Vực Ăn Mòn·Lĩnh Vực Xuyên을 따른다. 근성은 ja 根性, ms/id Keteguhan, th ความอดทน, vi Bền Chí로 사용한다. 베트남어 기본 키의 Bền Chí override 및 말레이 추가 환불 문구의 Keteguhan 동기화는 루트 통합 소유다.

## 원문과 구현의 불일치 처리

| 항목 | 처리 |
|---|---|
| 탄막블랙홀의 `Lv당×10 성장` | 루트 코드 확인에 따라 `_ult10xMul=1+(Lv-1)*9/19`, 기본 `ATK×8`에 추가 배율이 Lv20에서 최대×10임을 5언어에 명시. 매 레벨×10 누적 증폭으로 번역하지 않는다. 따라서 이 설명의 번역에는 원문 키에 없는 숫자 `20`이 하나 추가된다. |
| 탄막블랙홀의 `거리감쇠 30%` | 감쇠 후 피해의 하한이 30%임을 명시. 단순히 피해 30% 감소라고 쓰지 않는다. |
| `암전`의 속성 | 문맥별로 구별한다. 유령화 종료 `rainLightning` 및 설치형 `maliceStorm`의 `EL.L`은 번개, 악의기둥의 `EL.D`는 어둠이다. 4단 합체 포이즈 문구는 원소 판정이 확인되지 않아 원문/보조 EN `DarkPoise`에 맞춘 표현을 유지한다. 일괄적인 번개 치환을 하지 않는다. |
| 악의기둥 설명의 합체 대상 | 실제 `_FUSE_DEFS.pillarSlam.skills`의 `giantSlam2`를 확인하여 원문·작업 목록·5언어 모두 지옥강타2로 교정했다. 합체 동작은 바꾸지 않았다. |
| 공성쇠뇌 설치 쿨 | 실제 `_gxCd=1200`과 일치하도록 원문·5언어의 긴 설명과 짧은 설명 모두 설치20초로 교정했다. 철거는 무료이며 대기시간을 무시한다. |
| 초고속 바늘 설명의 `Lv당 뎀+100%` | 영어 보조문에는 빠져 있지만 한국어 원문에 있는 수치를 번역에 포함했다. |
| 일부 강화 템플릿 EN의 `3-Fuse`, KO의 `합체` | 한국어 원문을 따라 임의의 3단계 수치를 추가하지 않았다. |

## 검증

본문 5개와 소유 추가 파일 3개를 JSON으로 다시 읽어 언어별 필요 키 누락·빈 값·placeholder 멀티셋 불일치·HTML 태그 불일치·한글 잔류를 검사했다. 모두 0개다. 숫자 멀티셋은 한국어 원문 기준으로 같으며, 위에 명시한 블랙홀의 `Lv20` 설명 보충만 예외다. 영어 원문과 동일한 긴 문장도 0개다. `MAX`, 스탯 약어, 조작키, 코드형 오디오 파일 ID와 통용 차용어는 검사에서 미번역 문장으로 취급하지 않는다.

자동 검사는 문체 감수와 화면 검증을 대신하지 않는다. 원어민 검수 완료로 표시하지 않는다. 실제 브라우저 표시·줄바꿈·묶음 빌드 및 전체 문서 동기화는 루트 통합 작업에서 수행한다. 이 작업에서는 다른 언어 파일, 기존 `lang_*.js`, 런타임 및 게임 수치 코드를 수정하지 않았다.
