# 사운드 총괄 인계 — 2026-10-27 13:20 KST

- 세션 id `local_9c9b2f79-f02e-404e-ba44-282d087fa454` / Opus 5.5 / 사운드 전 영역(SFX·BGM·보이스·믹스·Unity F04) 총괄. 조사·판단·명세·검수·배정만, 실행은 단순 세션
- SSOT: `docs/6사운드디자인/SOUND_LEAD_MASTER_20261026.md` (현황·백로그 SND-01~06·기록), 상세 계약 `docs/6사운드디자인/6사운드디자인.md`
- 규칙: CLAUDE.md §총괄 자율 결정(정해진 범위 안 선택은 총괄이 결정·결과만 보고. 사용자에겐 새 방향·유료 크레딧·배포·되돌릴 수 없는 삭제만 질문. **예외: SFX Forge 청음 선택은 사용자 귀로**)

## 진행 중 작업 단위
| 단위 | 단계 | 남은 일 | 산출물 |
|---|---|---|---|
| SND-01 효과음 후보 | 1차 추천 완료(8 채택가능·4 가공·2 재생성). 디자인 7장 대조로 `hell_forest_bed` v1 보류→v2 임시 | **sound-simple이 재생성 4키 생성·측정 중**(`crit_heavy_r2`·`button_confirm_r2`·`button_hover_r2`·`hell_forest_bed_ch1`, 각 3개, `_out/sfx_forge/<분류>/<key>/`) → 보고 오면 총괄이 격자 이미지 보고 판정 → `SFX_FORGE_RECOMMEND_20261026.md`에 §5 재생성 판정 추가, review 페이지 갱신(`_analysis/review.py` 데이터 R에 추가) → **사용자 청음 선택 대기** | `docs/6사운드디자인/SFX_FORGE_RECOMMEND_20261026.md`, 청음 `G:\exoduser-wt\_out\sfx_forge\review_20261026.html`, 분석 스크립트 `G:\exoduser-wt\_out\sfx_forge\_analysis\` |
| SND-02 채택본 반영 | 대기(SND-01 선택 후) | 가공(자르기·-1dBTP·크로스페이드) → promote → game.html 매핑 → docs → DEMO/EA 동기화. 단순 세션 | — |
| SND-03 BGM NFD 중복 | **완료**(origin `758efa140`·`2e20e53a4`, 로컬 `db107b6f2`, DEMO·EA 각 71 제거). Mac 후속 공지 main·unity/main INBOX 반영 | Codex 회신(Mac `git ls-files bgm`=81·precomposeunicode) 대기만. DEMO/EA 전용 3곡(Rotten Forest - Ashen Gate, Godot 1-1 데모 신곡 `db6539b7e`, claude/demo11-* 브랜치)은 보존 | `docs/6사운드디자인/BGM_NFC_NFD_AUDIT_20261026.md` ⑦ |

## 다음 착수 후보 (총괄 자율 결정, 순서)
1. AD3: 적 공격 예고음 범주 신설·`_SFX_PRI`(game.html:12225 `{SKILL:10,VOICE:9,PLAYER_HIT:8,DEATH:4,STEP:3,HIT:2,PROJ:1,AMB:0}`) 재배열 검토 — 현행 예고음 존재 여부 조사부터(디자인 컨셉 7장 A4·A8)
2. AD2: UI 소리 전수(메뉴 열기·탭·장착음) 현황표
3. SND-04: Unity F04 이식 명세(웹 키·파일·음량·rate·우선순위 표 → Unity AudioDirector 계약), INBOX는 **main + unity/main**(codex/unity-mac-20261024 퇴역)
4. SND-05·06

## 소속·연결 세션
- 단순 세션 `local_26395865-a52c-421c-885e-ce7b45e1f7fa`(sound-simple, Sonnet, 152K@10-27) — 재사용. 새 일 전 get_usage 확인
- CTO 전체 작업 총괄 `local_7072229c-70cf-4fdf-ab35-c3c59e683d53` / 디자인총괄 `local_eb8a8577-c0e4-4a9f-b628-fac0c8549dbf`(7장 사운드 규칙 A1~A10·AD1~AD3) / 맥북 총괄 `local_f25393ea-f5e3-45f1-80fa-c16e9daa4c6c`

## 확정 결정·지시
- 디자인 컨셉 7장(디자인총괄 확정): C8 불씨 금지 = CH1 전체, 차임 경계 = 높은 순음 배음 400ms 초과·6kHz 이상은 어택 순간만, ice_orb는 잔향 400ms로 판정
- push 방법: 로컬 G: main은 origin과 갈라짐 → origin/main 기준 sparse worktree → 커밋 하나씩 cherry-pick → 비강제 push → reparse 0 확인 후 삭제. `git rebase`는 권한 거부됨

## 금지·주의
- `git add -A` 금지, 경로 지정 커밋, force/rebase/reset 금지, 창 자동 열기 금지, 타세션 파일 불간섭, robocopy/와일드카드 삭제 금지

## 재개 후 첫 행동
1. 이 문서·SSOT 읽기
2. sound-simple 보고가 와 있으면 `_analysis/sheet_r2_*.png` 보고 재생성 4키 판정 → 추천 문서·청음 페이지 갱신
3. 이어서 AD3 조사 명세 작성 → sound-simple 배정
