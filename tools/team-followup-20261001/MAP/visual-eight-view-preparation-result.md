# MAP visual-eight-view-preparation 결과 — MAP020 8뷰 시각 인수 준비

- 팀: Mac MAP / 터미널 3 / 세션 d447a49d / 과제일 2026-10-02
- HEAD: `30a204a7aa348a88b90bdc922862c610a7da938f`
- 상태: **8뷰 인수 자료(contact sheet + manifest) 제출 완료.** 실화면 8뷰 재현·시각 PASS 판정은 **root 단독 후속**. 전체 MAP-020 **RETOUCH 유지**.

## 1. 착수 시각 (실제 UTC)
수신 16:28Z · 첫Read 16:28Z(과제·가이드 v0.9·SSOT·ART 인수·경계결함 문서) · 첫코드Edit 16:40Z · 명령/검증 16:55Z · 완료 16:57Z.

## 2. 원함수/소스 SHA (읽기전용)
| 파일 | sha256 |
|---|---|
| game.html (현재) | `7631f5a083672124624e0b8dc22b0716d10c8815dbb1e6aee98a5e2e51299993` |
| ch1-boundary-edge.js (렌더 원함수) | `e1271685ee41026e330c77dfb9c8fc83146f2d116b97512e37d82cf53798edc2` |
| ch1-border-foreground.js | `7f0f3e2e373041adc9e39512b147ab535f99b89e914686ab7ff14eb602f46b22` |
| 증거 measured_source (manifest) | `6cbeb664dfcd75a3b890be275562d27e95415c9e` |

증거 PNG 15장 SHA는 map020-evidence/manifest.json 기록과 대조해 **무결 확인**.

## 3. 산출물 (소유 MAP 폴더만)
| 경로 | 내용 |
|---|---|
| `visual-eight-view-preparation-contact-sheet.html` | **단일 HTML contact sheet** — 8뷰 카드(HAVE/UNKNOWN), 기존 이미지 11장 상대경로 재사용, 결함표, 시작경로, VERDICT 근거 |
| `visual-eight-view-preparation-manifest.json` | 8뷰 좌표·시작경로·기대/금지·결함·증거파일·SHA·verdict 근거 |
| `visual-eight-view-preparation-result.md` | 본 보고 |
| `visual-eight-view-preparation-receipt.json` | 수신/시각/제약 |

신규 이미지 생성 0 · 관측기/카메라/맵 변경 0 · game.html/production/Git/queue/공유docs 쓰기 0 · 사용자 게임 tab 입력/리로드/닫기/계측 0.

## 4. 8뷰 증거 현황 (2/8 HAVE · 6/8 UNKNOWN)
| # | 뷰 | 좌표(world) | 증거 | 비고 |
|---|---|---|---|---|
| 01 | START | (4000,7600) 6시 | UNKNOWN | 정확 6시 캡처 없음 |
| 02 | SOUTH MASS | (2420,6600) | **HAVE** | south z1/z.62 0·A·B 6장 |
| 03 | EARLY | (5620,6520) | UNKNOWN | 좌표 제안 |
| 04 | MAIN ARENA | (4020,4450) | UNKNOWN | 중앙 제안 |
| 05 | SIDE LEFT | (1640,5620) | UNKNOWN | 서측 PC 보드 이력만 |
| 06 | SIDE RIGHT·M5 | (6660,6140) | **HAVE(부분)** | 접근 경계 5장; 주머니 전체경로 UNKNOWN |
| 07 | PRIMARY LANDMARK | (1766,6620) 후보 | UNKNOWN | 좌표 미확정 |
| 08 | LATE→EXIT/BOSS | (4000,720) 12시 | UNKNOWN | LATE ~(4000,2400) 경유 |

## 5. 이미지 직접 검수 소견 (SOUTH MASS, 수정 전 소스 캡처)
- `south-z0.62-b` vs `south-z0.62-0` 대조: B에서 하부 중앙~좌측에 **사각 톤블록(D1)** 과 바닥–숲 경계의 뿌리 윤곽이 보이며, 0에는 사각형이 없다 — 문서 서술과 일치.
- `south-z1-b`: 정상 줌에서 경계 뿌리 윤곽은 읽히나 좌측 갈고리 마디의 **반복감(D2)** 이 남는다.
- 이 캡처들은 **수정 전 소스(6cbeb664)** — D1 사각절단은 §7에서 이미 수정됨(아래 결함표). 재발 검증은 현행 소스 재촬영으로 root가 확인.

## 6. 결함 위치 (근거 분리)
| ID | 결함 | 상태 | 위치 | 재검 기준 |
|---|---|---|---|---|
| D1 | 원거리 shade 사각 절단 | **FIXED**(§7) | 줌.62 A/B 화면 x194~1086/y102~698, 원인 `Ch1BoundaryEdge.draw` hw/hh 줌미반영 | 현행(VW*.5/z+80) .62 A/B 재촬영 시 사각 재발 없음 |
| D2 | 뿌리 띠 반복 | **RETOUCH**(잔존) | 남·서 경계 좌측 갈고리 마디, prop_pool crop+내부목질 2종 305앵커 | 같은 asset 즉시 반복 안 보임 |
| D3 | M5 주머니 전체 경로 | **보류** | 7000,6900=벽(오기)/approach 6660,6140 | 안→입구 전체경로+오버행 아래 가독 통과 |

## 7. MAP PRODUCTION REPORT
- STAGE: CH1-1(stage0), MAP-020. 이번 작업 = **시각 인수 자료 준비(도구/문서)**. 게임/카메라/맵/코드 변경 0.
- MASTER: silhouette/region/route 기존 유지, 종주 미실시.
- OUTER MASS: SOUTH만 실캡처(수정 전). LEFT/RIGHT/TOP 실화면 미검수.
- GROUND/MEDIUM: D1(줌 사각절단) 수정됨, D2(뿌리 반복) 잔존.
- PLAYABLE: M5 접근 경계만 관찰, 주머니 전체경로·밀집전투 가독 미검수.
- CAMERA QA: **2/8 HAVE, 6/8 UNKNOWN**(START·EARLY·MAIN ARENA·SIDE LEFT·PRIMARY LANDMARK·LATE/EXIT 실증거 없음).
- TECH QA: 이번 측정 없음(collision/route/pageerror/seam/performance 미측정). 증거 PNG 무결성만 SHA 대조.
- FILES: 원본수정 0, 신규는 MAP 폴더만. 공유docs/타팀/production 변경 0. GIT/DEPLOY 없음.

## 8. VISUAL VERDICT 근거 (PRODUCTION REPORT와 분리)
- **VERDICT: RETOUCH**
- PASS 근거: D1 줌 사각절단 수정(§7, 재검수 별도).
- RETOUCH 근거: D2 뿌리 반복 잔존 · 8뷰 중 6뷰 미방문(UNKNOWN) · D3 M5 전체경로 보류.
- FAIL 근거: 없음.
- **8뷰 전부 실증거 없으면 PASS 금지**(evidence-gate 일관). 현재 2/8 → PASS 불가.

## 9. 한계 / 인계 (root 단독 후속)
1. 실화면 8뷰 재현(6뷰 UNKNOWN) — manifest의 좌표·시작경로로 root가 별도 게임에서 이동/카메라 촬영. 좌표 이름 혼재 → 실제 G.cam/월드좌표로 보정.
2. PRIMARY LANDMARK 좌표(후보 1766,6620)·LATE 좌표(~4000,2400) 확정.
3. D1 재발 검증(현행 소스), D2 반복 최종 판정, D3 M5 전체경로 검수.
4. 신규 생성/코드 변경은 이번 범위 밖. 공유 docs 반영은 root 통합 시 판단(이번엔 소유 폴더에만 기록).

## 10. docs 반영안 (소유 폴더 기록만)
MAP-020 수치/스펙 변경 없음(시각 인수 준비). 8뷰 좌표·결함·verdict 근거는 본 result·manifest·contact sheet에 보존. 공유 SSOT/가이드 반영은 root 통합 시.
