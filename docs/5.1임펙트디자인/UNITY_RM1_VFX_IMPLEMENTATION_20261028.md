# RM-1 VFX 통합 구현 기록 — 2026-10-28

## 2026-10-31 r3 표시 구조 재작업 — 정식 Player 재검수 전

r2는 기술 검사와 별개로 **3D 접점/탄막 가독성 FAIL**이다. 같은 접점의 핵심 결함이 두 후보에 남아, Graph 수치 반복 대신 본체/잔여와 바닥 표시 구조를 분리한다. 아래 r2 표는 실패 후보의 이력이며 현행 후보 수치는 이 절이 우선한다.

| 범위 | 현행 r3 후보·검증 경계 |
|---|---|
| r2 실제 입력·빌드 | source `597c3b9b8d6300a6554abd9543ac08a78bed58bf` → `PortVerification.Build` run `c1bbb4b4`·6000.6.7f1·remodel-scenes1·오류0·3,102,826,230바이트. 공식 실행 errorLogs2는 컴파일 오류가 아니며 Licensing access-token 갱신 로그를 포함한다. Player MCP 파일/관리참조0·212파일/160DLL |
| r2 동일 EXE | SHA256 `9806abde4a406ed68647e9505852c49f6aa72a372f4f084e2aa2821affea57a2`. M1 `e60e23d8` 23/23 ok. 첫 M1 실행기는 Player 시작 전 무출력 exit1·프로세스0·stale 잠금 확인 후 기존 sync 호출로 재실행; 원인 영구 복구 주장은 안 함 |
| r2 실제 비교 | 3D 전/후 `4f1e1283`/`a693e300`, XY 전/후 `ec201491`/`b4be09a4`. 각각1600×900·30fps·480PNG/16초. 네 Core SHA `ce48d649960a79064929e94ab5f3a204cbfd59da1ecb1125ccf77dd6d3445f0e`·피해55777 동일. 새 접점78·생성75·최대입자74·스킬Graph201·현행5종 표시 카운터. 모든 실행 사용자 창노출0/잔류0/USER_SAVE0/숨은Desktop 종료. 카운터는 시각 PASS 근거가 아님 |
| r2 시각 결함 | 1x 연속 프레임에서 XY 코어는 보이지만 3D는 몸체 뒤에 가림·방향 파편 약함. 새 적탄은 작은 점무리로 축소됨. 3D 바닥 회복막 식별불가, XY 바닥은 보임. `after-r2-1x/`·`after-xy-r2-1x/`·전후/노레위 나란히16초 영상으로 보존. 통합 제출0 |
| 접점 본체 분리 | 신규 Lit `SG_ContactFlash`/`M_ContactFlash`, 카메라를 향한 비정형 렌즈 면. 크기 일반0.24m/강공0.38m×가로1.25/세로0.8·발광4. 45ms까지 불투명1→85ms에0. 3D 높이0.65m와 카메라 앞쪽0.3m 제한 bias, XY 높이0.42m·표적Y+4. 기존 Graph 코어크기0·삼각 파편/회갈 먼지 유지. 논리 입력·피해·히트스톱 계약 불변 |
| 접점 면 함수 | `q=(UV-0.5)*2`, `a=atan2(q.y,q.x)`, `rho=length(q)/(0.92+0.055*sin(5*a)+0.025*cos(9*a))`, `Alpha=(1-smoothstep(0.65,1,rho))*Fade`. 선형 입력 Fill `(1,0.96,0.82)`, Edge `(1,0.69,0.35)`를 saturate(rho)로 보간하고 Emission=Color×4. 원시 쿼드는 XY ±0.5·normal -Z. 값은 authored Shader Graph/축척 계약이며 실제 HDR 최종픽셀값은 아님 |
| 지형 밀착 표면 | `ImpactGroundPatch`: 3D 12×12격자·169정점·288삼각형, 현재 지형을 읽어 표면+0.025m에 배치. XY는 같은 Shader Graph 평면·카메라쪽0.02m. Core 반경 그대로·충돌/지형 쓰기0. 회복/덫/강타/얼음 바닥과 그을음을 직접 표면으로 표시해 데칼 수신기 의존 제거. 미사용 옛 decal Graph/재질은 이력 자산이며 현재 경로의 필수 재질은 SkillFloor/ContactFlash |
| 탄막 외곽 복원 | 충돌R로 축소한 오류 수정. 독 표시폭 `(ElemBall?240:clamp(Sz*24,96,180))*(physical?2:1)`px. 일반탄 `sz=(Sz==0?1:Sz)`, `ps=clamp(sz*1.5,1.2,4)*0.7`, 물리폭 `22.05*ps*2*0.55*2`, 어둠길이 `44*ps`, 원소보주폭 `max(96,sz*5.3)*2`. 기존 NativeBossView 웹 표시식과 동일. 판정R·수명·Q/E 불변 |
| 본체·보조 분리 | 독/어둠은 불규칙 고체 본체1+보조3, 물리 가시3. 독 본체폭 표시폭0.66·암흑0.72×높이0.28×두께0.34. 악의구는 본체2.75R+위성3개 궤도2.1R·높이1.35R. Lit 면은 base grain→edge0.22+균열0.28, 균열pow12·발광은0.22+균열0.35로 면적을 확보. 팔레트는 r2 확정값 유지·네온/작은 반짝이 군집 억제 |
| 원시 메시·축척 의미 | 결정/가시 원시는5면·각 면2삼각형/6독립정점, 적도반경0.35·밑점Y=-0.45. 결정 윗점(0,0.65,0), 가시는(0.13,1,0). Orb는 위도8/경도12분할·반경 `0.5*(1+0.025*sin(3*a)*sin(4*b))`. 기검참은28분할·각도±1.3rad·원시외곽0.5·띠폭 `0.025*sin(pi*i/28)`·원시Y0.12. 표의 조각 폭/높이는 Transform.localScale 입력이며 실제 메시 끝점/카메라 투영 외곽과 구분한다. Core 반경·표시 기준 외곽식은 위 표를 사용하고 실제 투영은 다음 Player에서 판정한다 |
| 회복영역 강도 보정 | VFX-D19의 `.11`은 기존 문양의 밝기²/점유율에 대한 감쇠이며 넓은 새 면의 최대 불투명도로 그대로 쓰면 안 된다. 실제 r2 XY 프레임264→300 바깥영역391225픽셀 진단에서 기존경로 ΔG평균3.51/중앙1, 새경로17.35/중앙17·G+20면적22.19%로 과강을 확인했다. 시간차·이전덫/투사체 오염이 있어 웹1:1 측정은 아니다. r3 새 면 최대alpha0.016·수증기alpha0.012로 줄여 웹 저강도 방향으로 보정한다. 사용자색 b6ff54/d5ff72·반경520(Lv1)·테두리발광0.03 유지. r3 통제 영상에서 재측정 전 패리티 PASS는 아니다 |
| 화면 비율 검수 | review에 `-impact-width`/`-impact-height` 추가. 기본1600×900, width1600~3840/height900~2160 제한·실제 Screen 크기를 영수증과 PASS 조건에 포함. 21:9/3840×1080 실제 영상은 다음 정식 빌드에서 검수 |
| 구간 비교 통제 | r2 영상에서 먼저 쓴 장시간 가시덫이 회복영역/얼음/악의구 구간까지 반복 피격광을 만들었다. r3 review는 매 구간 FireZones/SlamWaves/SkillBlades/MaliceOrbs/기검참 투사체와 IceOrbActive를 명시적으로 초기화한다. 새 표적/공통탄막3종은 유지. 양쪽 같은 fixture이며 생산 게임·Core 구현 변경이 아니다. 따라서 r3의 전후끼리 새 Core SHA를 대조하며 r2 SHA와 같다고 가정하지 않는다 |
| 즉사 접점 경계 | 현행 실제 Core CPU 5사례에서 일반·즉사·보호막넘침·직접DOT API는 HurtTicks6/접점true, 완전 보호막흡수는 HurtTicks0/접점false다. 최초 두 진단은 보호막·DOT의 harness 기대가 틀려 실패했고 CX-04b/실제 Body를 읽어 기대를 정정했으며 생산 코드 변경0이다. 즉사 표적은 목록에 남는다. r3 실제영상은 첫 일반공격 표적1HP를 실제 처치하고 `killedTargets>=1`·새 경로의 해당 ID `EnemyFrozen`/생성 접점을 PASS에 요구한다. 나머지 표적은100만HP fixture. CPU 결과는 GPU 처치 표현의 PASS가 아니다 |
| 표적 배치 | review만 영웅 기준 Core delta `(48,-28)`, `(48,28)`, `(104,0)`px. 첫 두 표적은 실제 일반공격 원호 안에 두어 즉사와 생존 적중을 함께 확인하고 세 번째는 기검참/스킬 대상이다. 판정 범위를 늘리거나 강제 hit 이벤트를 보내지 않는다 |
| 기검참 실제3타 게이트 | r2 trace120틱 구간은 swing 시작0/40/100, windup80~99로3타 모션은 있으나20틱충전이며 Step 발사/명중은 별도 미기록이었다. r3 총960틱/16초/480PNG는 유지하고 일반120·기검참240·각스킬120틱으로 배분한다. 기검참은220틱까지 유지 후 해제하고 실제 Feedback를 dequeue 전 읽어 `sword_swing3`/Step3 발사·`KiSlashHit`/Step3 명중·Tier3를 모두 PASS에 요구한다. Core 큐/시간/난수는 변경하지 않는다. 악의구는96틱 유지·24틱 해제로 동일한 끝구간을 확보하고 얼음 파쇄는110틱 유지 |
| 현재 기술 검증 | 표현 계약450개 RED→GREEN. 설치 Unity 참조125·runtime287소스 독립 C# 오류0·기존경고437. ContactFlash Graph47객체·누락참조0·재질GUID 일치. 정식 Unity 임포트/Player/M1/시각 판정은 아직 r3 미검증 |
| 소유권·반환 | r2 종료08:15 UTC 자기 예약 해제·잠금 비어있음 확인·다음 기존 담당에게 반환. 파생575파일 byte/SHA 보존→기존519 정확복구·자기신규56 GUID참조0 정리·자기 source 변화0. CPU 재작업 중 Unity 점유0. 새 writer/세션/작업본0 |

## r2 후보와 실패 이력

| 범위 | 현재 후보·수치 |
|---|---|
| 브랜치·기준 | `codex/pc-impact-remaster-20261031`, 공통 `15c8ed3c522de317d22cdbfd185b1ceca494b56f`. 현행 실행 영웅 스킬 `PortedSkillIds` 5종 전체·기검참·독/가시/어둠 탄 표현을 연결. 미이식 스킬의 실행기 추가·완료 주장은 하지 않음 |
| 표현 정지 | `ImpactResponse`·`NativeGame.Impact`: 3D 월드와 XY 아레나 모두 일반55ms, 치명프로필75ms, 대검끝타/강타90ms. 타격한 적과 공격 중 영웅의 뷰만 유지. 영웅은 접점 포즈를 한 번 그린 뒤 유지하며 HD-2D 스프라이트 경로도 적용. 치명프로필은 아직 실제 이벤트 미연결. Core Tick/입력/피해/쿨다운/넉백/난수/저장·`Time.timeScale` 수정 없음 |
| 카메라·피격 | 방향성 반동 일반2.2px/치명프로필3.5px/강공4.5px·180ms감쇠·설정배율. 3D는 표시 marker, XY는 렌더 projection만 이동. AI 발사·루팅 콜백이 읽는 논리카메라 Transform 불변. 피격 틴트100ms 이내·Core넉백은 뷰정지 뒤 따라감. 전용 드루이드 sprite도 같은 피격 틴트·포즈 유지 경로 연결 |
| 접점·잔여 | `Resources/VFX/Impact/VFX_ImpactBurst.vfx`: 코어0.24/0.38m·`#fff4d0` HDR4. 코어 알파는 정규화수명0.08~0.28에서1 유지(0.25초 수명 기준20~70ms), 0.5에서0.225·끝0. 파편은 둥근 텍스처 quad 대신 무텍스처 삼각 primitive, 0.035~0.065/0.09m·방향속도2.8/3.8m/s, `#ffd9a0` HDR1.2→0.18에서`#9a8a72`→끝`#2a2220`. 먼지0.5/0.8m·0.35~0.65초·알파0.14 |
| 예산·조명 | 같은 관찰 프레임 접점2, 같은 적 재발광 최소80ms, 효과 인스턴스8·최소재사용900ms, 국소 무그림자 라이트 동시2·100ms 이내·반경1.5/2.2m·초기강도2/3 |
| 화면·정렬 | 현재 월드 카메라 투영의 near/far와 viewport 가장자리±0.1 여유로 접점·Graph 이벤트·스킬라이트를 admission. 화면 밖 접점은 카메라 반동·정지를 만들지 않음. 접점 Graph는 실제 표적 Core Y 정수+4, 긴 스킬 잔여 Graph는 발생 Y 정수-4. int 정렬은-32768~32767로 제한. 접점의 위치 오프셋 Y를 정렬 기준으로 쓰지 않음 |
| 그을음 | 전용 `SG_ImpactScorch.shadergraph`·참조 재질. 불규칙 알파와 알베도 분리·발광0·색 `#1b1410`, 반경0.28/0.5m, 동시8, 최대fade0.6·2초 수명·마지막1.2초 소멸. r2는 바닥+0.12m·깊이0.3m로 인물 투영 억제. 풀 재사용마다 라이트 반경·강도 갱신 |
| 비교 장치 | `--unity-impact-review`·`--unity-impact-baseline`, r2 1600×900·30fps 480장/16초·같은 입력 Core 추적 SHA. 일반공격/기검참 각120틱, 현행5스킬 각144틱·얼음보주110틱 Space 파쇄. 매 구간 실제 Core 탄3종 합성 배치·이동/수명도 추적. AI 중지·불사 표적 fixture이며 자연 플레이 증거 아님 |
| r1 실제 근거 | source `88ca4c3` → build `912c9e52` 성공/오류0 → Player MCP 파일·참조0(212파일/160DLL) → M1 `1d5bc9ab` PASS → 전후 `f8362a14`/`4f7c29d1` 각각12초. Core SHA `69cee82a…b2fb` 동일·피해50388 동일·접점50/생성46/최대입자65. 숨은Desktop 창노출0·잔류0·사용자세이브0. 연속120프레임에서 기존 큰 붉은 가시문양·두꺼운 기검참·밝은 얼음덩어리 결함 확인, r2 재작업. r1 전체스킬 아트 PASS 아님 |
| r1 접점 추가 판정 | 320×240 1x·30fps 연속12프레임(0~0.4초)에서 국소 조명은 읽히지만 백열 코어·방향 파편은 식별되지 않음. **접점 Graph 가시성 FAIL**. 생성46/입자65는 화면 표시의 증거가 아님. 원인(이벤트 좌표·고정 bounds·렌더 경로)은 MCP 실제 프리뷰에서 확인 후 수정. `after-r1-접점연속12프레임-1x.png` |
| MCP 원인 확인·수정 | boot `a6b9d860`, 자기 Editor67604/instance c6d087a3·실제경로 대조·RX9070XT/D3D12·I:격리/무음. position 속성/Renderer/노출속성·4재질 지원·셰이더 오류0 확인. Core tick7·피해208 고정에서 order0→7424만 변경해 코어 가림435픽셀 재현. 코드 적용 후 자동7424 확인. XY 바닥은 Fade0에도2150픽셀 반사가 남음→Lit Preserve Specular 해제·금속/매끈함0·그림자off 후 Fade0/비활성 차이0. 좌표를 임의 변경하지 않음. EditorMode 최초 culled/입자0 캡처는 위치 판정에서 제외. 원격 Player/D3D11의 동일성·품질 증거는 별도 |
| r2 검증 경계 | 독립계약443개 RED→GREEN(정렬·화면 admission9개 추가, 적 독/어둠 팔레트 검사 포함), 설치 Unity DLL 기준 runtime C# 오류0(기존경고437), 최신 XY 수정의 정식 Unity 재컴파일·콘솔 오류0. 새 Lit/Graph·탄막의 최종 Player 영상은 미검증. MCP 스킬 정지5장은 압축틱·풀의 지연 파괴가 섞인 진단이며 동작/전체 아트 PASS가 아님. r1 MCP/M1도 r2 검증을 대신하지 않음 |
| 전체 docs 검색 보완 | 앞선 rg는 sparse의 VFX/engine 폴더만 검색했다. Git object 전체 docs를 be125799a2 기준1,145행/266문서·origin/main9780db0cdd 기준1,260행/261문서 검색해 `관련-docs-전체트리-*.log`로 보완. CX-04b는 당시 Core/oracle 인수, P2-001a는 Godot 이력으로 확인했으며 새 Unity 표현과 혼동해 과거 기록·보호 설계를 덮어쓰지 않음 |
| 정식 실행 경계 | r2 첫40분·다음120분 start는 타 담당 선두로 시간 초과(exit1), 자기 Unity 시작0. 종료·프로세스0 확인 후07:20 UTC 대기1건 재접수→07:25 자기 순번/Editor 시작→08:01 Play·Editor 정상 종료. 자식7116은 자기 AssetImportWorker로 별도 Editor/Player 아님. 파생588 byte/SHA 보존·기존518 정확복구·자기신규56 GUID참조0 정리·자기후보14 유지. 같은 등록04:34 예약을 다음 공식 빌드/Player 게이트에 유지. 산출물 `import-derived/editor-r2` |

M1 `07e`는 원래17발 분류(물리/입4·혜성7·원소보주6)를 유지한다. 새 표현이 실제로 그린 Core 탄 객체만 해당 분류에 더하고 기존 sprite 수와 합산한다. 없는 탄을 더하거나 기대17발/폴백0 기준을 낮추지 않는다. 새 Graph/물질·독/가시/어둠 표시 여부는 16초 별도 fixture에서 함께 검사한다.

필수 Graph·그을음·XY 바닥 재질 중 하나가 누락되면 접점의 새 관찰/정지/반동/기존 hit sprite 억제를 적용하지 않는다. 스킬 본체 역시 필수3재질·Graph 로드가 성공한 경우만 기존 경로를 대체한다. 누락 자산으로 `new Material(null)`을 호출하지 않는다.

r2 생성기는 Windows에서도 신규 VFX/YAML/meta를 LF·행끝 공백 없이 저장한다. Graph 수치·재질 GUID를 바꾸지 않는 형식 정리의 이전 byte는 I: `format-before-a36b237e1/`에 보존했다.

### r2 스킬·탄막 표현 수치

새 경로는 `NativeSkillRemaster`가 읽기 전용으로 관찰한다. 비교 baseline 또는 자산 누락 시 기존 경로를 사용한다. 현행 HD-2D 인물/적 스프라이트 방향을 변경하지 않는다. `SG_SkillMatter`는 Lit·거친 결/약한 발광 혈관·금속0/매끈함0.35. `VFX_SkillMatter`는 별도 코어·삼각 파편·먼지 시스템이다. `ImpactSpace`는 XZ 지형 높이 또는 XY 발밑/카메라 방향 높이로 변환한다. XY에서는 기검참 평면을 제외한 물질 조각만 `90도-LOOK001 pitch`(약41.3도) 추가 기울여 높이를 읽게 하며 Core 바닥 좌표/반경은 보존한다. XY 바닥은 투명 Lit 쿼드(레이어-19000/그을음-18999), 금속0·매끈함0·알파 독립 specular/그림자0이다. 두 스킬 바닥 마스크는 `max(inside*(0.55+0.45*grain),rim)`로 전개/페이드에 곱한다. 따라서 전달 fade가 최대 불투명도이며 0.2를 다시 곱해 회복 영역을 숨기지 않는다. 기존 아레나 sprite가 DecalProjector를 받는다고 가정하지 않는다.

| id·대상 | 크기·형태 | 색·빛·잔상 |
|---|---|---|
| `spikeTrap` 가시덫 | Core `z.R/100` 안 18개 가시, 황금각137.5도·면적균등 배치, 12틱 전개·마지막30틱 축소. 폭0.22m·높이0.28/0.46/0.64m | 목질 `#30281b`/끝 `#b3a17c`, glow0.12, 바닥fade0.2·발광0. 붉은 원화 문양 사용 안 함 |
| `holyDome` 회복영역 | Core `z.R/100`, 15틱 전개·마지막30틱 소멸. 작은 반짝이 결정0개, Graph는 크기0.9m/알파0.035의 넓은 얇은 수증기만(코어·파편크기0) | 사용자 웹색 `#b6ff54`/`#d5ff72` 그대로, 바닥fade0.11·가장자리발광0.03. 색 변경B′/C′ 미채택 결정 준수·큰 네온 원판 억제 |
| `giantSlam` 지옥강타·E 강타 | 웹 sprite 외곽 지름 `MaxR*0.9*(0.72+0.28*min(1,progress*3.5))` 보존. 둘레 파편14개·0.12~0.20m, 진행 끝0.38 구간 소멸. Graph는 평면방향±3m/s와 바닥법선방향1.2~3.5m/s로 솟는 조각·회갈 먼지를 분리 | 지옥강타는 마스터 화염 `#ffd9a0`/`#d8562a`/`#4a1610`, 탄화재질 `#3a2117`·균열glow `0.8*(1-progress)`. E는 물리 뼈색파편·회청 `#91a7ac`·glow0.1 유지. 바닥fade0.28·따뜻한 금갈 가장자리. 시작20%만 국소빛(지옥불주황/E서리색)·강도최대2·반경최대4m. `gSlamWindup`의 실제 접점에도 뷰정지 |
| `iceOrb` 얼음보주 | Core·웹 R식 유지. 반경3.2R 궤도 결정14개·0.10×0.28~0.46×0.12m, 조각 포함 웹지름6.6R 표시 외곽에 맞춘 성긴 덮개. Core 파쇄로 생긴 blade는0.11×0.4×0.11m | 마스터 빙결 `#e8f3f8`/`#5f98c0`/`#1a2a36`, glow0.38(칼날0.4). 바닥fade0.08·가장자리0.08·빛반경1.8m/강도0.45. 인물·탄이 보이는 빈 중심 |
| `fireball` 악의구 | Core R에 따라 조각5개, 궤도2.25R·폭0.65R/높이1.2~1.68R, 조각 포함 웹지름5R 표시 외곽에 맞춤. 실제 폭발 이벤트 반경으로 먼지폭최대1.8m | 마스터 마력 `#e4dcf4`/`#6a56a8`/`#161226`, glow0.65·빛반경1.1m/강도0.5. 적 암흑과 색상각 구분 |
| 기검참·충전 | 1/2타192px·3타252px×Core ChargeScale 외곽, ±1.3rad 얇은 초승달·최대두께외곽의0.025·지면위쪽 법선. 충전40틱마다3단계 작은결정 크기0.045→0.1m | 뼈 `#9c978b`/`#ede8d8` glow1.5, 큰5겹 흰 원화 대신 물질 경계. 코어 판정/수명 불변 |
| 적 독·가시·어둠탄 | Core R→0.045~0.3m 표시반경. 독·어둠은5조각, 가시는3개 방향성 파편. 물리탄 분류 우선, 독은전용우선. mine/friendly/blue/black/bw bean·나머지원소탄 기존경로 | 마스터 독 `#c8e8a8`/`#5f8a2e`/`#1c2810`, 물리 `#efe6d2`/`#9a8a72`/`#2a2220`, 암흑 `#cdb2e0`/`#5e3478`/`#170c20`. glow0.9/0.35/0.9. 독85~95도·암흑270~295도 상수 검사. Q/E 패링계약·탄 이동·피해 불변 |
| 공통예산 | 활성핸들96·넘친 적탄은 기존 표시 유지, Graph풀12·재사용0.8초, 프레임당이벤트6·Graph 잔여0.8초, 스킬라이트동시2·바닥법선방향 높이0.75m | 코어HDR1.5·코어크기프리셋×0.24·파편0.06~0.12×size, 먼지size×0.8·0.24~0.5초·알파0.02~0.14. 스킬별재발생0.12~0.36초, 강타1회 |

출력·실패 원본: `I:/EXODUSER-Storage/demo-art/impact/`. 실제 영상 판정 전 제품 PASS·MERGE_READY·바탕화면 갱신으로 보고하지 않는다. 브리프의 최종 전체 범위와 지정 통합 담당의 권한은 유지한다.

기준: `UNITY_RM1_VFX_SPEC_20261027.md` v2.1 §3.1·3.2·§7, `VFX_LEAD_MASTER_20261026.md` §2.7. 이 기록은 Unity 후보 브랜치의 실제 표현 코드 상태를 설명한다. Core 판정·피해·속도 수치는 변경하지 않았다.

## 소유 파일과 연결 상태

| 항목 | 코드/에셋 | 현재 상태 |
|---|---|---|
| 기검참 그래프 | `unity/Assets/Exoduser/Resources/VFX/RM1/VFX_KiSlash.vfx` | 생성됨, Unity 임포트·실화면 미검증 |
| 그래프 생성기 | `unity/Tools/vfx_rm1/gen_vfx_ki.py` | Unity 17.6 패키지 템플릿 기반, YAML 참조·흐름 오프라인 검증 |
| 기검참 뷰 | `unity/Assets/Exoduser/Runtime/Vfx/KiSlashVfxView.cs` | `Bind(Simulation)`·`Handle(FeedbackEvent)`·`Update()` 및 3타 그을음 데칼 구현, NativeGame 연결 전. 생성자에 RM-1 `SG_GroundDecal` Material 전달 필요 |
| 좌표 어댑터 | `unity/Assets/Exoduser/Runtime/Vfx/VfxWorld.cs` | Core px → `(x/100, 0, -y/100)` XZ. `RemodelWorld`가 unity/main에 들어오면 지형 높이 API로 교체할 TODO |
| 독 폭발 브리지 | `unity/Assets/Exoduser/Runtime/Vfx/VfxBridge.cs` | 기존 A/B 신호와 그래프는 유지, 월드 배치만 `VfxWorld` 경유. NativeGame 연결 전 |
| Player 검수 장치 | `unity/Assets/Exoduser/Runtime/NativeGame.VfxCheck.cs` | `VfxCheck(bridge, ki, renderCamera)` 작성, `--unity-vfx-check` 진입 연결 전. RM-INT가 3D 카메라를 전달해야 실행 가능 |

## 기검참 실제 구현 수치

| 대상 | 이벤트/속성 | 수치·색 | 적용 위치 |
|---|---|---|---|
| 명중 코어 | `OnKiHit`, `CoreSize`, `CoreGradient` | 1타 0.24m, 2타 0.28m, 3타 0.36m × Core `ChargeScale`(tier 0~3 = 1/1.4/1.8/2.2). `#fff4d0` 선형 HDR ×4. 수명 0.25초, 크기 정점 수명 15%(60Hz 약 +2.25틱), 알파 정점 16%(약 +2.4틱), 40% 시점 0.225 | `KiSlashVfxView.Handle`, `gen_vfx_ki.py` |
| 명중 조각 | `OnKiHit`, `ShardSize`, `ShardVelMin/Max`, `ShardGradient` | 8개, 0.12m × `ChargeScale`, 0.08~0.20초, 속도 방향 정렬. 은·뼈색 `#efe6d2` → `#9a8a72` | 같은 파일 |
| 이동 궤적 | `OnKiTrail`, `TrailSize`, `TrailGradient` | Core 투사체마다 별도 `VisualEffect`, 매 틱 스트립 점 1개, 1스트립 16점, 점 수명 0.12초, 폭 `min(0.09m, 0.07m × ChargeScale)`. 앞날 HDR 뼈금 → 후미 바랜 뼈색 | `KiSlashVfxView.Update`, 그래프 strip context |
| 충전 섬광 | `OnKiCharge`, `CoreSize` | Core의 `KiChargeFlash`에서 0.18m, 3타 tier 3 신호만 사용 | `KiSlashVfxView.Handle` |
| 3타 바닥 자국 | `SG_GroundDecal` `_Shape=2` | 길이 1.5m × `ChargeScale`, 반폭 0.08m × `ChargeScale`, `_EdgeGlow=0`, 뼈금 `#9a8a72`·그을음 `#2a2220`, fade 최대 0.42, 90틱(1.5초), 동시 8개 | `KiSlashVfxView.SpawnScar/UpdateScars` |
| 위치 | 이벤트 `position` | Core `(X,Y)` → `VfxWorld.ToWorld(X,Y,0.25m)`; 독 폭발도 동일 좌표 어댑터 경유 | 두 뷰·브리지 |

그래프는 `CoreGradient`, `ShardGradient`, `TrailGradient` 등 8개 속성을 노출한다. 그래프가 읽는 이벤트 attribute는 `position`이며, 방향·tier 크기는 C#이 해당 인스턴스의 노출 속성으로 설정한다. 드루이드 텔레그래프 3종과 독액 기포의 추가 구현은 별도 잔여 범위다.

## 검증 경계

| 게이트 | 결과 |
|---|---|
| 그래프 생성 재현 | 2회 동일 SHA256, YAML 183문서·노출 속성 8개·구조 오류 0 |
| 정적 소스 점검 | `git diff --cached --check` 통과, Roslyn C# 구문 오류 0(`nostdlib` 파싱 검사이며 Unity 타입 컴파일 증거 아님), Core·기존 `NativeGame.cs` 수정 없음 |
| Unity 6000.6.7f1 임포트/컴파일 | 미실행. 타인 Unity 프로세스가 실행 중이고 사용 가능 메모리 18.9GB로 순번 조건 20GB 미달 |
| RM-1 샌드박스 비교 | 미실행 |
| `--remodel3d` Player 1920×1080, 적 탄막 겹침, 1x 크롭 | 미실행. `RemodelWorld`/3D 카메라와 NativeGame 진입 연결이 unity/main에 필요 |
| 완료 정의 6단계 | ① 최신 unity/main 병합만 수행, 빌드 영수증 없음. ②~⑥ 미완료. `VISUAL VERDICT: PENDING` |

`VfxCheck`는 A에서 Core 독 탄 3발 착탄·웅덩이 1·추적 장판 1을 검수용 상태로 주입하고 독 탄 3발을 화면에 남긴다. B는 `SetMagicInput`으로 실제 `MaliceOrbBlasts` 증가를 기다린다. 기검참은 Core `SpawnKiSlash` 검수 API로 1/2/3타와 3타 충전 40/80/120틱을 만들고 실제 적 명중 `FeedbackEvent`를 확인한다. 각 신호 뒤 2/4/6/12/21틱에 1920×1080 원본과 400×400 1x 크롭을 저장한다. 이 장치는 아직 실행되지 않았으며, A의 검수용 주입은 자연 플레이 재현의 증거가 아니다.

## 다음 통합 순서

1. RM-INT 1단계가 `unity/main`에 들어오면 VFX 브랜치에 최신 `unity/main`을 비강제 병합하고 `VfxWorld.ToWorld`만 `RemodelWorld.ToWorld`로 전환한다. RM-INT 작업 브랜치 자체를 합치지 않는다.
2. Unity 순번·메모리 조건을 확인한 뒤 그래프 임포트, 컴파일, RM-1 샌드박스 비교 캡처를 실행한다. 오류가 나면 원인 수정 뒤 1회만 재시도한다.
3. 병합 전 Player 빌드 영수증을 유니티 통합 담당에게 전달한다. 통합 후 실제 GPU Player와 `--remodel3d` 1x 화면에서 웹 기준 크기·톤·탄막 가시성을 판정한다. 캡처에는 적 독 탄이 겹친 장면을 포함한다.
