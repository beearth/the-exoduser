# 브리프 K5 — 엔진의 AI 호환성·시간 대비 가성비 비교 (Unity 6 · Unreal 5.8 · Godot 4) (2026-11-06)

사용자 원문(14:50 KST): "카툰 스타일이면 고도도 나쁘지 않던데. 중요한 건 엔진들의 AI 호환성, 시간 대비 가성비." 배경: 엔진 확정 조건은 K3(화질·작업 효율 키샷) + K4(100마리·10분·60fps) 였고, 여기에 **K5 = 에이전트(Claude 레인)가 그 엔진을 얼마나 창 없이, 텍스트로, 자동으로 굴릴 수 있는가**를 추가한다. 스타일 후보는 PBR(황천식)과 툰(카잔식, KZ 레인)이며, 툰이면 Godot 4가 후보에 들어온다. 과거 godot/main 시도(동결 607110d52)가 저장소에 있다.

## 1. 산출물 (docs만)
`docs/0마스터플랜/ENGINE_TRIAL/ENGINE_K5_AI_FIT_20261106.md`
1. **비교 항목표(세 엔진)**: ① 창 없는 구동 — 빌드·테스트·캡처·렌더를 CLI/배치로 할 수 있는 공식 경로(Unity `-batchmode -nographics`·공용 실행기 실측, UE 커맨드렛·`-RenderOffScreen`·MRQ CLI 문서 상태, Godot `--headless`·`--export-release`·`--script`), 각 항목 공식 문서 절 또는 우리 레인 실측(날짜·문서) ② 자산·씬의 텍스트성 — diff·머지·에이전트 편집 가능 여부(Unity YAML 씬/프리팹·.meta, UE .uasset/.umap 이진·Blueprint 이진·T3D 텍스트 내보내기 한계, Godot .tscn/.tres 텍스트) ③ 스크립팅 표면 — 에이전트가 쓸 언어·API(C#, C++/Python 에디터/Blueprint, GDScript/C#), 에디터 자동화 API 범위 ④ 문서 접근성 — 공식 문서가 세션 네트워크에서 열리는지(실측: docs.unity3d.com·dev.epicgames.com·docs.godotengine.org 각각) ⑤ 빌드·반복 시간 — 빈 프로젝트 빌드 시간·우리 1-1 상당 빌드 시간(실측 있는 것만: Unity WebGL 36~80분, UE·Godot [미측정]) ⑥ 웹 내보내기(크로마) — Unity WebGL 실측 4회차, UE 불가, Godot 4 Web 공식 지원 범위(C# 웹 제한 포함) ⑦ Core 이식 비용 — Unity 0, UE 3~10주[추정, EP CORE_PORT_PLAN], Godot C#(.NET) 경로와 godot/main 과거 시도의 범위를 `git log godot/main` 사실로 ⑧ 화질 상한·툰 적합 — PBR(Nanite·Lumen·SDFGI 유무)과 툰(포스트/셰이더로 충분) 분리 ⑨ 라이선스·비용 — Unity Runtime Fee 현행, UE 로열티 5%(매출 100만 달러 초과), Godot MIT(각 공식 페이지 인용, 못 열면 [미검증]) ⑩ 우리 레인 실측 실패 사례 — 11-04~06 레인 기록에서 엔진 자동화가 막힌 지점(Unity: 실행기 가드·Player 실행 금지·WebGL 오버라이드 거부; UE: 무창 렌더 근거 없음; Godot: 과거 시도 기록)을 날짜·문서로.
2. **K5 측정 설계(실측 과제)**: 같은 과업 "빈 바닥 + 스캔 고목 1그루 + 캐릭터 대역 + 34° 카메라 캡처 1장"을 세 엔진에서 **에이전트가 창 없이** 끝내는 데 걸린 시간(분)·사람 개입 횟수·막힌 지점·실패 횟수를 기록하는 표 틀. Mac K3(UE)·Unity 현행·Godot(신규 최소 프로젝트)로 수행할 수 있게 절차 초안(공식 문서 절).
3. **스타일별 후보 결론**: PBR이면 (Unity vs UE), 툰이면 (Unity vs UE vs Godot) — 각 후보의 K3·K4·K5 예상 강약을 표로, 수치는 출처 또는 [추정].
4. 미검증 목록, 결론 3줄.
`docs/CHANGELOG_SYNC.md` 절 1개(CRLF 보존).

## 2. 규칙
- 출처 없는 수치 금지, 기억 기반 서술 금지, 못 연 사이트는 [발췌]/[미검증]. 레인 실측은 문서 경로·SHA로 인용.
- 브랜치 `claude/unity-cloud-engine-k5-20261106`, `git add -- <경로>`, 비강제 push, 원격 SHA 대조, 드래프트 PR → unity/main.
- 보고 한 줄(SHA·미검증 수) + 결론 3줄. 전송 거부 시 세션 마지막 메시지로.
