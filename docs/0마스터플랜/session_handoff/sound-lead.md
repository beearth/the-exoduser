# 사운드 총괄 인계 — 2026-10-26 22:45 KST

- 세션 id `local_9c9b2f79-f02e-404e-ba44-282d087fa454` / Opus 5.5 / 사운드 전 영역(SFX·BGM·보이스·믹스·Unity F04) 총괄. 조사·판단·명세·검수·배정만, 실행은 단순 세션
- SSOT: `docs/6사운드디자인/SOUND_LEAD_MASTER_20261026.md` (현황·백로그 SND-01~06·기록), 상세 계약 `docs/6사운드디자인/6사운드디자인.md`

## 진행 중 작업 단위
| 단위 | 단계 | 남은 일 | 산출물 |
|---|---|---|---|
| SND-01 효과음 후보 청음 | 1차 추천 완료(채택가능 8·가공 4·재생성 2) | **사용자 청음 선택 대기** → 재생성 2키(crit_heavy·button_confirm) 프롬프트 수정 생성 → 채택본 가공·promote·game.html 매핑(SND-02, 단순 세션) | `docs/6사운드디자인/SFX_FORGE_RECOMMEND_20261026.md`, 청음 페이지 `G:\exoduser-wt\_out\sfx_forge\review_20261026.html` |
| SND-03 BGM NFC·NFD 중복 | 조사·보고서 검수 통과 | **정리 실행 여부 사용자 결정 대기**. 실행 시 단순 세션에 보고서 §6 절차 + DEMO/EA 원본밖 15MB 사전 대조 | `docs/6사운드디자인/BGM_NFC_NFD_AUDIT_20261026.md` |

## 대기 중
- 사용자: 효과음 키별 버전 선택, BGM 정리 실행 여부
- 원격 push: 사운드 커밋 4개 로컬만(`9147dce32` `6c90641c2` `95551564f` `dd120d030`). 로컬 main이 origin보다 119+ 뒤처져 일반 push 거부, plumbing 우회는 권한 거부됨

## 소속·연결 세션
- 단순 세션: `단순작업(Sonnet): 사운드총괄 BGM 중복폴더 보고서` = `local_26395865-a52c-421c-885e-ce7b45e1f7fa` (sound-simple, idle) — 다음 단순작업은 SendMessage로 재사용
- CTO 전체 작업 총괄 `local_7072229c-70cf-4fdf-ab35-c3c59e683d53` / Unity 전체 총괄 `local_a65bb55a` / 맥북 총괄 `local_f25393ea`

## 확정 결정·지시 (메모리 `sound-lead-role.md`에도 있음)
- 새 효과음 채택은 사용자 청음 후만. ElevenLabs 크레딧 넉넉(후보 3~4개 OK), MCP 연결 실패 → `npm run sfx:forge` 사용
- 단순작업은 묻지 말고 Sonnet 세션 직접 띄워 위임(사용자 "단순작업은 알아서 만들어서해")
- Unity 사운드는 웹 그대로 이식. 현재 Unity는 5샘플+로비/시작 오디오 10개뿐

## 금지·주의
- `git add -A` 금지, 경로 지정 커밋, force/rebase/reset 금지, 창 자동 열기 금지, 타세션 파일 불간섭
- BGM NFD 삭제는 사용자 확인 후, robocopy/와일드카드 삭제 금지(junction 사고 이력)

## 재개 후 첫 행동
1. SSOT와 이 문서 읽기
2. 사용자 응답(청음 선택·BGM 정리)이 있으면 단순 세션에 명세 전달
3. 없으면 SND-04(Unity F04 사운드 이식 명세) 착수
