# 임펙트(VFX) 단순 세션 인계 — 2026-10-27 (2차 재생성)
- 세션: Sonnet 5.5 단순 세션(임펙트 총괄 소속). 세션 id는 앱 "Linked sessions" 목록에서 확인. 역할=캡처·측정·제작·문서 반영 같은 명세 정해진 작업
- 기준 문서(SSOT): `docs/5.1임펙트디자인/VFX_LEAD_MASTER_20261026.md` (§2.7 타격 임팩트 기준, §3.4·§3.5 교체 기록, VFX-D10~D14, 백로그 VFX-10·11·12)
- 소속·연결: 임펙트 총괄 `local_da9cd0e7-37a8-4d5d-9ab6-090f7f9eb8ad`
- 진행 중 작업 단위: 없음. 새 작업 임의 착수 금지, 총괄 지시 대기

## 완료한 작업
1. 타격 임팩트 비교 캡처(우리 vs 노레위 vs PoE2) — 커밋 `607110d52`. 산출물 `G:/exoduser-wt/_vfxref_20261027/`(삭제는 사용자 확인 후에만, 그전엔 유지)
2. VFX-02 2차 1묶음 — 화염 팩 4종 교체(C2안): 원격 `17cfee30a`(로컬 `08347ed9a`, 11개 파일, force 없음)
   - 교체: `assets/vfx/Fire_ImpactFire_Sheet`·`Fire_MediumImpact`·`Fire_FBF_4x4`·`Fire_BasicImpact`.png (규격·파일명 동일, game.html 무수정)
   - 방식: 승인 필드보스 화염 임팩트 `assets/vfx/fieldboss/boss_fire_impact_24_20261010.png` 재격자(AI 생성 아님, 비용 0). 재현 `tools/vfx/regrid_fire_pack.py`(적용 에셋과 픽셀 차이 0)
   - 문서: VFX_LEAD_MASTER §3.5·VFX-D14·VFX-12·§7, 사용처 docs 4곳(VFX_구현가이드·몬스터_공격시스템·몬스터_총관리·탄막시스템_총정리), 전후 `docs/5.1임펙트디자인/FIRE_PACK_BEFORE_AFTER_20261027.jpg`
   - 반영 확인 캡처: `G:/exoduser-wt/_vfx2_fire/sheets/applied_check.png`(route 없이 저장소 파일 그대로)

## 남은 것·대기
- VFX-12: `_addBoom` 시트 크기 증가 곡선(`Math.pow(Math.min(1,_ep*3),.5)` 류) 때문에 공통 폭발 몸체가 0.35초에야 커짐 + 기동불꽃 화면 주황 덮개(VFX-D14, `G._flashCol='#ff4400'`) — game.html 시각 코드, 총괄 명세 대기
- 데모/EA 폴더 동기화는 배포 때(CLAUDE.md 배포 규칙). 열린 게임 창에는 Git 반영만으로 갱신되지 않음
- VFX-02 나머지: 암흑 연기 `Dark_DarkSmoke_FBF_4x4`·`Dark_Smoke_Sheet_6x6`(청록·자홍) — 총괄 지시 후
- 물리 패링 폭발(`physical`, ImpactFire 첫 행 흰 틴트)은 흰 스플래시로 읽힘 확인, 디자인 판정은 총괄 몫

## 작업 폴더·스크립트 (저장소 밖 `G:/exoduser-wt/_vfx2_fire/`)
- `SPEC.md`(총괄 명세), `SUMMARY.md`(A안 요약), `A/` `C/` `C2/`(후보 시트), `cap/<variant>/<장면>/`(캡처), `sheets/`(compare/timeline/raw_sheets·measure)
- `scripts/capture_fire.mjs <variant> [시트폴더]` — Playwright route로 4개 시트만 후보로 교체해 3장면(boom·hellfire·assault, 환경변수 SCENES로 physical 추가) 캡처. **rAF를 수동 스텝으로 고정**(1스텝=1렌더=1틱, `_tvfx2`는 렌더 프레임마다 진행하므로 필수). 실행 `C:\nvm4w\nodejs\node.exe`
- `scripts/make_sheets*.py`, `measure_fire*.py`(따뜻색 마스크, 대략치), `gen_fire_A.py`(폐기된 A안)
- 이전 스크립트 `_vfxref_20261027/scripts/`(타격 비교용): capture_ours·measure_lib·sheet_ours 등, 상세는 그 폴더 SUMMARY.md

## 배운 것 (다음 작업에 중요)
- `_addBoom` 경로는 `lighter`가 아니라 **source-over**, `_tvfx2`는 `'lighter'`. gen_hit_impacts.py식 알파 4배 인코딩을 이 팩에 쓰면 어두운 링·탁한 덩어리 발생 → 직선 알파 사용
- 이미지 생성: MagicLight Toolbox가 "멤버 전용 — 구독 필요"로 차단(계정 Standard Plan VIP 2026/10/24 만료, 포인트 30,390은 그대로). 결제 정보 입력 금지, 갱신은 사용자 몫. Higgsfield는 크레딧 절약 규칙상 지시 없이 쓰지 않음
- 측정 한계: 기동불꽃은 화면 전체 플래시가 섞여 밝기 수치 신뢰 낮음, 파란 펫 오브 제외 마스크 필요. 판정은 시트 눈으로
- 절차 생성 fBm 불꽃(A안)은 정사각형 덩어리·동심원·분홍 얼룩으로 반려됨. 큰 불 플립북은 승인 에셋 재격자 또는 AI 키 이미지가 낫다

## 금지·주의
- 자동 브라우저는 headless+음소거, 창·이미지 뷰어 자동 열기 금지. 삭제 명령(rm -rf)은 거부될 수 있음 — 덮어쓰기로 대체
- 실패는 2회 반복 전에 원인 수정, 2회 실패면 멈추고 보고
- 커밋은 경로 지정(`git commit -- <경로>`), 로컬 main은 origin과 갈라져 있어 push는 임시 워크트리(`G:/exoduser-wt/_vfxpush`, 끝나면 `git worktree remove`)에서 origin/main 위에 cherry-pick 후 비강제 push
- 재개 후 첫 행동: 1) 이 파일과 MEMORY.md 읽기 2) 총괄 지시 대기
