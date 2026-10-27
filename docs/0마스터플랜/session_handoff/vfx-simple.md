# 임펙트(VFX) 단순 세션 인계 — 2026-10-27 (4차 재생성, VFX-12 반영 완료 2152b0f27 기준)
- 세션: Sonnet 5.5 단순 세션(임펙트 총괄 소속). 세션 id는 앱 "Linked sessions" 목록에서 확인. 역할=캡처·측정·제작·문서 반영 같은 명세 정해진 작업
- 기준 문서(SSOT): `docs/5.1임펙트디자인/VFX_LEAD_MASTER_20261026.md` (§2.7 타격 임팩트 기준, §3.4·§3.5·§3.6 교체 기록, VFX-D10~D16, 백로그 VFX-10·11·12)
- 소속·연결: 임펙트 총괄 `local_da9cd0e7-37a8-4d5d-9ab6-090f7f9eb8ad`
- 진행 중 작업 단위: 없음(3묶음·VFX-12까지 전부 원격 반영 완료, 미커밋 작업 없음). 새 작업 임의 착수 금지, 총괄이 재개 메시지와 다음 명세를 보낼 때까지 대기

## 완료한 작업
1. 타격 임팩트 비교 캡처(우리 vs 노레위 vs PoE2) — 커밋 `607110d52`. 산출물 `G:/exoduser-wt/_vfxref_20261027/`(삭제는 사용자 확인 후에만, 그전엔 유지)
2. VFX-02 2차 1묶음 — 화염 팩 4종 교체(C2안): 원격 `17cfee30a`(로컬 `08347ed9a`, 11개 파일, force 없음)
   - 교체: `assets/vfx/Fire_ImpactFire_Sheet`·`Fire_MediumImpact`·`Fire_FBF_4x4`·`Fire_BasicImpact`.png (규격·파일명 동일, game.html 무수정)
   - 방식: 승인 필드보스 화염 임팩트 `assets/vfx/fieldboss/boss_fire_impact_24_20261010.png` 재격자(AI 생성 아님, 비용 0). 재현 `tools/vfx/regrid_fire_pack.py`(적용 에셋과 픽셀 차이 0)
   - 문서: VFX_LEAD_MASTER §3.5·VFX-D14·VFX-12·§7, 사용처 docs 4곳(VFX_구현가이드·몬스터_공격시스템·몬스터_총관리·탄막시스템_총정리), 전후 `docs/5.1임펙트디자인/FIRE_PACK_BEFORE_AFTER_20261027.jpg`
   - 반영 확인 캡처: `G:/exoduser-wt/_vfx2_fire/sheets/applied_check.png`(route 없이 저장소 파일 그대로)
3. VFX-02 2차 2묶음 — 암흑 팩 4종 교체(F안, 승인 에셋 재채색, 비용 0): 원격 `a1eb40a52`(로컬 `ade9908ae`, 14개 파일, force 없음). 총괄 1x 판정 → 사용자 승인 「F안 암흑 팩 4장 반영하고 문서도 갱신해줘」 후 반영
   - 교체: `assets/vfx/Dark_DarkSmoke_FBF_4x4`(Ice 안개 재채색, 알파 0.58×밀도^1.3, 코어 없음)·`Dark_Smoke_Sheet_6x6`(`Dark_Smoke_BW_6x6` 재채색, 몸체 최대 알파 0.58·감마 1.6, 바깥 `#5e3478`→안쪽 `#4a3066`, 림 없음)·`Dark_MediumImpact`·`Dark_BasicImpact`(1묶음 적용본 `Fire_*Impact` 휘도→암흑 램프). 규격·파일명 동일, game.html 무수정
   - 재현: `tools/vfx/regrid_dark_pack.py`(적용 에셋과 픽셀 차이 0). 후보 반복: D1(불투명 검보라, 바위·쐐기로 읽혀 반려)→D2(회전 겹침, 삼각 윤곽 폐기)→E(알파 표현 0.47)→F(0.58)
   - 문서: VFX_LEAD_MASTER §3.6·§3.5 남은 것·VFX-D15(`Arcane_Arcane_FBF_6x6` 마젠타 점)·D16(`Poison_MediumImpact` 형광 초록 별)·§6 VFX-02·§7, 사용처 docs 6곳(VFX_구현가이드·몬스터_공격시스템·몬스터_총관리·탄막시스템_총정리·BOSS_FIRE_Q_IMPACT24_ENGINE·FDG_DARK_DRUID_CONTACT_VFX), 전후 `docs/5.1임펙트디자인/DARK_PACK_BEFORE_AFTER_20261027.jpg`
   - 0번 커밋: 일반 피격 렌더 알파 0.45 상향안 미채택 기록 `c9d733b66`
   - 작업 폴더 `G:/exoduser-wt/_vfx2_dark/`(SPEC.md·SUMMARY.md, cand/D1·D2·E1·E2·F, cap/<변형>/<장면>, sheets/compare·timeline·raw·measure, scripts), 반영 확인 `sheets/applied_check_dark.png`

4. VFX-02 2차 3묶음 — 아케인 3종+독 2종 교체(A안, 승인 에셋 재채색, 비용 0): 원격 `1e7d318ae`(로컬 `c9baf7164`, 12개 파일, force 없음). 총괄 1x PASS 후 반영(CLAUDE.md §총괄 자율 결정 — 사용자 확인 단계 없음)
   - 교체: `assets/vfx/Arcane_Arcane_FBF_6x6`(현재 마젠타 형태 유지, 알파=밀도→`#6a56a8`→`#e4dcf4`, 5×5 미만 얼룩은 알파 열기로 제거, 최대 알파 .85)·`Arcane_MediumImpact`·`Arcane_BasicImpact`(1묶음 적용본 `Fire_*Impact` 마력 램프 `#161226/#6a56a8/#e4dcf4` 재채색 + 프레임별 90° 회전)·`Poison_MediumImpact`·`Poison_BasicImpact`(독 램프 `#1c2810/#5f8a2e/#c8e8a8` + 프레임별 좌우 반전). B안(Dark_Smoke_BW 마력 연기, 언덕 윤곽)은 탈락. game.html 무수정
   - 재현: `tools/vfx/regrid_arcpoi_pack.py`(적용 에셋과 픽셀 차이 0; 교체 전 마젠타 FBF는 git blob `5621aee0`에서 읽음). 문서: VFX_LEAD_MASTER §2.2 마력 행 신설·§3.7·VFX-D15·D16 해소, 사용처 docs 4곳, 전후 `ARCANE_POISON_BEFORE_AFTER_20261027.jpg`
   - 작업 폴더 `G:/exoduser-wt/_vfx2_arcpoi/`(SPEC·SUMMARY, cand/A·B, cap/cur·A·B·applied, sheets, scripts: gen_arcpoi.py·capture_ap.mjs·make_sheets_ap.py·hue_edge_ap.py·measure_ap.py)
5. VFX-12 — 공통 폭발 크기 곡선 + 기동불꽃 화면 주황 덮개 제거(game.html 시각 코드만): 원격 `2152b0f27`(5개 파일, force 없음). 총괄 1x PASS 후 반영
   - 변경: 새 함수 `_boomGrow(ep)=.6+.4*Math.sqrt(Math.min(1,ep*8))`(`_rainbowImpact` 위)로 `_addBoom` 렌더 크기식 6곳(plague·rainbow_light·rainbow×3·통합 시트) 교체, `_detonateAssaultFlames`의 `G._flashT/_flashCol='#ff4400'` 삭제(shake·chromaT 유지). 판정·수치·수명 불변. 8873·8935행의 `progress*3` 식은 다른 함수라 미변경
   - 결과: 0.066초 몸체/정점(면적 환산) 29~45% → 56~81%, 기동불꽃 국소 밖 ΔR +43 → 0. **정점 시점은 fire_medium·explosion·dark가 0.35초 그대로**(프레임 진행식은 범위 밖, 정점 앞당김은 미결정). 문서: VFX_LEAD_MASTER §3.5 후속·VFX-D14 해소·VFX-13 신설, 탄막시스템_총정리·12퍼포먼스·최적화, 전후 `VFX12_BEFORE_AFTER_20261027.jpg`
   - 작업 폴더 `G:/exoduser-wt/_vfx12/`(SPEC·SUMMARY, mod/game.html=캡처한 수정본, cap/cur·mod, sheets, scripts: apply_vfx12.py·syntax_check.mjs·capture_vfx12.mjs·sheets_vfx12.py)
## 남은 것·대기
- VFX-13: Dark 콤보 0.6초 잔여층 부족(`_TVFX2_COMBOS` 레이어 `spd:3`·16프레임이 0.6초 전에 끝남) — game.html 수명·층, 총괄 명세 대기. 폭발 정점 시점(0.35초) 앞당김(프레임 진행식 `~~(_ep*16)`)은 미결정
- 데모/EA 폴더 동기화는 배포 때(CLAUDE.md 배포 규칙). 열린 게임 창에는 Git 반영만으로 갱신되지 않음
- VFX-02 다음 묶음 후보(총괄 지시 후): 그 외 네온 팩(`Ice_*`·`Lightning_*`·`Nature_*`·`Water_*`·`Earth_*`·`Light_*`). `rainbow_light` 0.35초 이후 큰 청록 파편은 Light/Ice 시트 몫
- 물리 패링 폭발(`physical`, ImpactFire 첫 행 흰 틴트)은 흰 스플래시로 읽힘 확인, 디자인 판정은 총괄 몫

## 작업 폴더·스크립트 (저장소 밖 `G:/exoduser-wt/_vfx2_fire/`, 암흑 팩 `_vfx2_dark/`, 아케인·독 `_vfx2_arcpoi/`, VFX-12 `_vfx12/` — 상세는 위 완료한 작업 4·5)
- `SPEC.md`(총괄 명세), `SUMMARY.md`(A안 요약), `A/` `C/` `C2/`(후보 시트), `cap/<variant>/<장면>/`(캡처), `sheets/`(compare/timeline/raw_sheets·measure)
- `scripts/capture_fire.mjs <variant> [시트폴더]` — Playwright route로 4개 시트만 후보로 교체해 3장면(boom·hellfire·assault, 환경변수 SCENES로 physical 추가) 캡처. **rAF를 수동 스텝으로 고정**(1스텝=1렌더=1틱, `_tvfx2`는 렌더 프레임마다 진행하므로 필수). 실행 `C:\nvm4w\nodejs\node.exe`
- `scripts/make_sheets*.py`, `measure_fire*.py`(따뜻색 마스크, 대략치), `gen_fire_A.py`(폐기된 A안)
- 암흑 팩: `_vfx2_dark/scripts/capture_dark.mjs <variant> [후보폴더]`(capture_fire 복사본, 5장면 boom·malice·combo_dark·rainbow·combo_poison, 변수 SCENES로 선택), `make_sheets*.py`(compare/timeline, VAR로 열 지정), `measure_dark*.py`(변화영역 bbox·면적·상위1% 휘도), `hue_check.py`(채도 0.35 이상 색상각 265~295° 검사), `raw_sheets.py`(어두운 회갈 배경 원본 대조)
- 이전 스크립트 `_vfxref_20261027/scripts/`(타격 비교용): capture_ours·measure_lib·sheet_ours 등, 상세는 그 폴더 SUMMARY.md

## 배운 것 (다음 작업에 중요)
- `_addBoom` 경로는 `lighter`가 아니라 **source-over**, `_tvfx2`는 `'lighter'`. gen_hit_impacts.py식 알파 4배 인코딩을 이 팩에 쓰면 어두운 링·탁한 덩어리 발생 → 직선 알파 사용
- 이미지 생성: MagicLight Toolbox가 "멤버 전용 — 구독 필요"로 차단(계정 Standard Plan VIP 2026/10/24 만료, 포인트 30,390은 그대로). 결제 정보 입력 금지, 갱신은 사용자 몫. Higgsfield는 크레딧 절약 규칙상 지시 없이 쓰지 않음
- 측정 한계: 기동불꽃은 화면 전체 플래시가 섞여 밝기 수치 신뢰 낮음, 파란 펫 오브 제외 마스크 필요. 판정은 시트 눈으로
- 절차 생성 fBm 불꽃(A안)은 정사각형 덩어리·동심원·분홍 얼룩으로 반려됨. 큰 불 플립북은 승인 에셋 재격자 또는 AI 키 이미지가 낫다

- **밀도는 어두움이 아니라 알파로 표현한다.** 연기 후보를 짙은 검보라로 칠하고 위쪽 림 하이라이트를 넣으면 연기가 아니라 바위·쐐기로 읽힌다(D1 반려). 한 가지 중간 보라에 알파(최대 0.5~0.6, 감마 1.6)와 알파 블러 3~4px가 정답이었다
- 같은 프레임을 120° 회전해 겹치는 "터지는 뭉치"는 삼각 윤곽이 생겨 못 쓴다(D2 폐기). 원료 `Dark_Smoke_BW_6x6`은 8×8 블록 저알파 얼룩과 셀 바닥(y≈163)의 평평한 절단선이 있어 블러 밀도 임계(0.07~0.19)와 바닥 페더가 필요하다
- 원료 알파가 낮은(≤0.48) 반투명 안개는 이미 연기처럼 읽히므로 새로 만들기보다 같은 램프로 재채색하는 쪽이 낫다(Ice_MistSmoke → 4×4)
- **`_tvfx2Spawn`은 3D 테스트 함수로 덮어써져 있다**(`window._tvfx2Spawn=function...`, game.html 65537행 부근). 콤보 캡처는 원래 본문(`_TVFX2_COMBOS[idx].layers.forEach(...push)`, 18852행 부근, `sc:l.sc*1.5`)을 evaluate 안에서 그대로 재현한다
- 악의구 보라 콤보는 호출 함수가 없어 24704행 부근 레이어 배열(`_mbLayers`)을 그대로 복제해 push한다(`_mbSc=min(2.5,max(.8,sqrt(r/80)))`)
- 가산(`'lighter'`) 경로에서는 어두운 색이 거의 안 보이므로 안쪽 색을 너무 어둡게 하지 말 것(F안 `#4a3066`). `_tvfx2` 콤보 레이어 수명(`spd:3`, 16프레임)이 0.6초 전에 끝나 후반 잔여층이 비는 것은 시트가 아니라 game.html 수명 문제
- 측정 한계(암흑): 어두운 저대비 연기는 변화영역 마스크(임계 30) 아래라 `'dark'`·`'rainbow'` 장면 일부 시점이 끊겨 나온다. 판정은 시트 눈으로
- 파이썬은 `-I` 격리 모드로 돌리면 사용자 site-packages(numpy)를 못 찾는다. 자기 스크립트는 `-I` 없이 실행

- **파이썬 텍스트 모드 `open(p,'w')`는 윈도우에서 LF를 CRLF로 바꿔 쓴다**(SSOT 전체 줄이 diff로 잡힘, 3묶음에서 발생). 문서는 `rb`로 읽고 `wb`로 쓰며 원래 줄바꿈(LF/CRLF)을 확인·보존, 수정 후 `git diff --numstat`가 의도한 줄 수만큼인지 확인
- 문법 검사: `<script>` 인라인 블록을 임시 파일로 뽑아 `node --check`(`_vfx12/scripts/syntax_check.mjs`). importmap JSON 블록(블록 3)은 항상 실패하는 가짜 양성이라 원본과 같은 결과면 통과
- 판정용 캡처에서 현재 vs 수정은 `route`로 `game.html`만 응답을 바꾼다(현재=origin/main 사본, 수정=치환본). 서버·메인 트리 파일은 그대로. 메인 트리 game.html은 타세션 WIP라 현재 비교 기준으로 쓰지 않는다
- 측정 한계: 정점 지름은 bbox로 재면 흩날리는 불티·연기가 섞여 부풀 수 있어 면적 환산 지름도 함께 본다

## game.html 반영 절차 (VFX-12에서 확립 — 메인 트리 game.html에는 타세션 미커밋 변경이 있다)
1. 임시 워크트리: `git fetch origin` → `git worktree add --detach G:/exoduser-wt/_<이름>push origin/main`(이미 있으면 `git checkout --detach origin/main`로 최신에 맞춤)
2. 치환 스크립트(`apply_vfx12.py`처럼 `assert count==1`·정규식 건수 assert, `rb`/`wb`, 줄바꿈 보존)를 **워크트리의 깨끗한 game.html**에만 적용. 메인 트리 game.html은 반영 후에도 편집하지 않는다(다음 병합/auto-sync 때 들어옴)
3. 인라인 스크립트 문법 검사(원본과 같은 결과인지 비교) → 수정본을 캡처 경로 `mod/game.html`로 저장해 캡처한 바이트와 커밋 blob이 같은지 `cmp`
4. **총괄 1x 판정 PASS 전에는 커밋하지 않는다.** PASS 후 최신 origin/main으로 다시 맞추고 같은 스크립트 재적용(diff 건수 동일 확인), 문서는 같은 워크트리에서 수정
5. `git add -- <경로>` + `git commit -- <경로>` → 커밋 blob(`git show HEAD:game.html`)을 문법 검사 → `git merge-base --is-ancestor origin/main HEAD` 확인 후 `git push origin HEAD:main`(비강제) → 원격 `git show origin/main:game.html`과 캡처 수정본 `cmp` → `git worktree remove --force`
6. 서버(3333) 재시작·열린 게임 창 갱신 주장 금지

## 에셋 반영 절차 (1묶음·2묶음에서 확립, 3묶음 동일 — 3묶음부터 사용자 승인 대신 총괄 1x PASS)
1. 총괄 1x 판정 → 사용자 승인 메시지(원문 인용) 확인 후에만 `assets/vfx/` 덮어쓰기
2. 덮어쓴 뒤 후보와 바이트 비교(`cmp`), 크기·격자 확인, 재현 스크립트를 `tools/vfx/`로 옮겨 경로를 저장소 상대경로로 바꾸고 실행 결과가 적용 에셋과 픽셀 차이 0인지 확인
3. SSOT 새 §3.x·발견 표·§6·§7, docs 전체에서 파일명 Grep한 사용처 문서 설명 갱신, 전후 JPG(현재|채택안)
4. route 없이 저장소 파일 그대로 반영 확인 캡처(`applied_check*.png`)
5. `git add -- <정확한 경로>` 후 `git commit -- <경로>` → 임시 워크트리 `G:/exoduser-wt/_vfxpush`에서 `git worktree add --detach … origin/main` → cherry-pick → `git push origin HEAD:main`(비강제) → `git worktree remove --force` → 원격 파일 해시와 후보 해시 비교
6. game.html·서버·열린 게임 창은 건드리지 않는다. 데모/EA 동기화는 배포 때

## 금지·주의
- 자동 브라우저는 headless+음소거, 창·이미지 뷰어 자동 열기 금지. 삭제 명령(rm -rf)은 거부될 수 있음 — 덮어쓰기로 대체
- 실패는 2회 반복 전에 원인 수정, 2회 실패면 멈추고 보고
- 커밋은 경로 지정(`git commit -- <경로>`), 로컬 main은 origin과 갈라져 있어 push는 임시 워크트리(`G:/exoduser-wt/_vfxpush`, 끝나면 `git worktree remove`)에서 origin/main 위에 cherry-pick 후 비강제 push
- 재개 후 첫 행동: 1) 이 파일과 MEMORY.md 읽기 2) 총괄 지시 대기
