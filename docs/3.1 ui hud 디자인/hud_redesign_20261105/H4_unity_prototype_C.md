# H5 — HUD C RETOUCH / H4 구현 이력

**현재 상태: H5 코드·수치 검사 통과, 화면 미검수(Mac). 채택·병합 아님.** 기준은 같은 codex/unity-hud-proto-20261105 브랜치의 3a13dc0d46d22a19e1f0640d7689914df99569c4이며 이번 변경은 --hud-proto=c에만 적용한다. 인자 없음·A/B·Core·HP/피해 로직·카메라·전역 색 공간·원본 PNG/importer는 변경하지 않았다. 아래 H4 이력은 당시 수치이며, H5와 겹치는 항목은 이 절이 대체한다.

## Mac 근거를 직접 확인한 범위

Mac 2258a067e80ba411b4c55c1b910495e210897c75의 [mac_20261104.md 3–23행](https://github.com/beearth/the-exoduser/blob/2258a067e/docs/0마스터플랜/worklog/cloud-lanes/reports/mac_20261104.md#L3)은 **3a13dc0d4 RETOUCH, 채택 안 함**, C#·Metal 오류 0을 보고했다. 그 성공을 새 H5 셰이더의 Metal 성공으로 옮기지 않는다.

같은 커밋의 reports/img/hudc-board-1/2/3.png와 hudc-3x-1/2/3.png **6장을 직접 열었다**. 사용자 제공 로컬 사본은 pinned Git blob과 바이트가 같았다. 현재/A/B/C 순서에서 C의 평평한 밝은 회색 금속과 흰 안쪽 테두리, 분홍 HP, 약한 MP·ST 구분, 얇은 판, 장식과 받침의 어긋남을 확인했다. 눈으로 본 형태·색 판단이며 RGB 값 자체는 Mac 글 보고에서 인용한다. board는 1928×270, HUD 비교판은 1/3번 1024×803·2번 1280×1004의 **축소 합성본**이다. 1px·정확한 색·1x 가독성 판정에는 원본이 필요하다. PNG는 8bit RGB이고 ICC/sRGB/gAMA 청크 없이 IHDR/IDAT/IEND만 있다.

## 결함별 원인·조치

약칭(이번 H5 파일 기준): C = unity/Assets/Exoduser/Runtime/NativeHud.PrototypeC.cs, CA = 같은 Runtime의 NativeHudPrototypeCArt.cs, L = NativeHudPrototypeLayout.cs, CS = unity/Assets/Exoduser/Resources/Shaders/HudPrototypeC.shader. 이 네 생산 파일 외 변경은 회귀 검사·문서뿐이다.

| 결함 | 확인된 원인 / 남은 불확실성 | C 조치·수치 | 파일:줄 |
|---|---|---|---|
| HP·MP·ST가 지정색보다 밝음 | 기존 CPU HUD는 sRGB Texture2D에 D(token) 수치를 저장하는데, H4 GPU는 D(token)을 기본 sRGB RT에 출력하여 저장 단계 E를 거치면 token으로 돌아감. CPU/GPU 저장 계약 불일치와 GL.sRGBWrite 상태 미지정이 확인됨. Mac 임의 픽셀의 정확한 경로·좌표까지 확정한 것은 아님 | C 전용 sRGB ARGB32 RT, Linear에서 명시적 sRGB write, 출력 D(D(token)). 저장 E(D(D(token)))=D(token)으로 CPU와 일치. Gamma는 원래 RGB. 슬롯/A/B target은 그대로 | C:13,16,27–32,68–69; CS:35–41; CA:14–16; NativeLobby.SilverHell.cs:54–66 |
| 금속이 한 톤으로 뭉개짐 | H4 contrast1.4/gain1.15 앞의 saturate가 원본 Y≤36.43/255를 0으로 잘라 sv-dp 한 색으로 보냄. 원본 프레임 A≥.95의 72,135픽셀 중 54,189(75.12%) 해당 | 원본 sRGB Y를 0/10/36/69/163/255 매듭으로 연결. iron→sv-dp→sv-dk→sv-md→sv-lt→sv-hi, 연속 6토큰 명암. 전역 밝기 낮추기나 원본 PNG 수정 없음 | CS:44–53,89–94 |
| 금속 흰 번짐·액체 위 흰 톱니 | H4 smoothstep(.04,.20,min-neighbor-alpha)가 원래 부분 투명 흰 매트를 불투명으로 증폭. shader 액체에는 흰 수면선이 없음. 전체 보이는 톱니의 제거 여부는 Mac 확인 필요 | 원본 알파를 상한으로 유지. 밝은 중성색·부분 투명 매트만 억제하고 전역 이웃 알파 침식 제거. A≥.98 하이라이트·어두운 조각 경계 보존 | CS:55–61,90–96 |
| 위 장식과 주공격 받침 불일치 | H4 장식 중심960, 슬롯6/7·받침 중심990: 정확히30px, Mac 눈대중 약27px과 일관 | C 장식 x905→935, 중심990. 받침(935.5,992,109,74), 슬롯13개·판 중심960·장식 y/크기 모두 유지 | L:43–61; 검사 Program.cs:58,73–76 |
| 슬롯 판이 선만 남아 뜸 | 판 기하는 이미 A와 같은709×74이나 내부 알파 .10→.22로 면 무게가 사라짐 | 판 .88→.94로 A(.96→.97)에 가까운 바탕 복구. 받침 .12, 얇은1.5px 레일·좁은 발4개 유지. 검은14px 전폭 레일 복원 없음 | CA:8–9,19–45; 비교 NativeHudPrototypeArt.cs:48–64 |
| C RT 실패 때 자원 누수 가능성 | 새 factory에서 생성 실패 시 호출자 필드/소유 목록에 등록되기 전 객체가 남을 수 있음 | Create false·throw 모두 Release/Destroy 후 재throw, Blit 정상·예외 모두 기존 GL.sRGBWrite와 active RT 복원 | C:18–21,27–32; c-transport.cjs:67–84 |

## 색 공간: 확정한 계약과 계산의 한계

ProjectSettings.asset:49의 m_ActiveColorSpace=1(Linear)을 유지한다. D는 정확한 sRGB→linear 전달 함수, E는 그 역함수다.

~~~text
D(c) = c/12.92 (c<=0.04045), ((c+0.055)/1.055)^2.4 (그 외)
E(c) = 12.92c (c<=0.0031308), 1.055*c^(1/2.4)-0.055 (그 외)
기존 CPU: token → D → RGBA32 sRGB Texture2D 수치 저장
H4 GPU: token → D → sRGB RT write E → token 수치 저장
H5 GPU: token → D → D → 명시적 sRGB RT write E → D(token) 수치 저장
Gamma 프로젝트: shader token 그대로, sRGB write false; alpha는 언제나 변환하지 않음
~~~

CS:89의 원화 sampler 뒤 LinearToGammaSpace 한 번은 **원본 sRGB Y를 복구**하는 용도로 유지한다. 이것과 최종 출력 보정은 서로 다른 단계다. CBlit은 기존 GL 상태를 저장·복구하며 A/B 프레임을 그리는 전역 상태를 남기지 않는다. 기존 NativeLobby.SilverHell.cs:97–105에 Mac Linear IMGUI 밝기 측정과 보정 이력이 있고 NativeHudPrototypeArt.cs:42–46도 CPU 저장 계약을 사용한다.

[Unity RenderTextureReadWrite 문서](https://docs.unity3d.com/6000.4/Documentation/ScriptReference/RenderTextureReadWrite.html), [Texture2D 생성자](https://docs.unity3d.com/6000.4/Documentation/ScriptReference/Texture2D-ctor.html), [GL.sRGBWrite](https://docs.unity3d.com/6000.4/Documentation/ScriptReference/GL-sRGBWrite.html)에 따라 저장 색 공간과 write 상태를 명시했다. 프로젝트 실제 Unity 6000.6.7f1의 [공식 Builtin Shaders](https://download.unity3d.com/download_unity/b22767f04f04/builtin_shaders-6000.6.7f1.zip) 안 Internal-GUITextureClip.shader:34,55–58은 sampler 뒤 선택적인 _ManualTex2SRGB 변환을 갖는다. **이번 PC 분석은 native uniform 값과 Metal framebuffer를 실행 관측하지 않았다. “GUI가 항상 decode를 생략한다”는 단정은 하지 않는다.** 수정 근거는 CPU/GPU의 같은 sRGB 형식·저장 바이트를 일치시키는 것이다.

아래 예상 출력은 불투명 단일 토큰, 음영·보간 없음, 기존 Mac IMGUI 보정 경로가 저장값에 최종 E를 적용한다는 조건이다. ARGB32/Texture2D 8bit 반올림까지 계산한다. 기하·색 변환 수식은 검사했지만 **실측값이 아니며 목표색±3 일괄 보증도 아니다**.

| 용도 | 지정값(sRGB) | H4 token이 linear로 취급된 경우 E(token), 참고 | H5 저장값 round(255D(token)) | H5 계산 예상 출력 round(255E(저장/255)) |
|---|---|---|---|---|
| HP 기본 | #3d0a12 = (61,10,18) | (134,56,75), Mac 보고 (139,56,78)과 가까움 | (12,1,2) | (61,13,22) |
| MP 기본 | #3b5f86 = (59,95,134) | (132,164,192), Mac 보고 (121,146,168)보다 밝음 | (11,29,61) | (59,95,134) |
| ST 기본 | #3e5e4a = (62,94,74) | (135,163,147), Mac 보고 (106,131,117)보다 밝음 | (12,29,17) | (61,95,73) |
| HP 어두운 끝 | #1e050a = (30,5,10) | 단일 기본색 비교 대상 아님 | (3,0,1) | (28,0,13): 저명도 양자화 오차가 큼 |

MP/ST의 원래 3색 팔레트는 유지한다(CS:63–73). 기본색 파랑 채널 차이는60, 조건부 표시 차이는61이다. MP는 파랑 우세, ST는 낮은 채도의 녹청이며 원색 초록을 넣지 않았다. 이는 **1x 구분의 필요 조건이며 Mac 재판정 필요**다. 원래 제안색의 승인 범위는 아래 H4 색 절과 같다.

### 다른 원인 후보 확인

| 후보 | 확인 내용 | 판단 |
|---|---|---|
| 월드 후처리/톤매핑 | NativeGame.cs:566,583,598–599의 OnGUI·HUD 호출, NativeUiAudit.cs:172–180의 직접 GUI.DrawTexture. C:82–100은 GUI.color를 white로 설정·복구 | 확인한 C 경로에 월드 후처리를 거치는 별도 pass 없음. 이 소스만으로 OS/네이티브 출력 전체를 단정하지 않음 |
| 음영·알파·측정 위치 | CS:99–123의 radial 감광 최대30%, HP depth, MP/ST h와 상단 alpha1→.5, 빈 bowl·원화 중첩 | 단일 hex가 구 전체 RGB는 아님. MP/ST 잔차를 고려해야 함 |
| Mac 보고 RGB 역산 | D(측정/255)×255는 HP(65.84,10.08,19.43), MP(48.76,73.30,99.85), ST(36.75,57.88,45.36) | 그라데이션·감광 범위와 양립. **측정 XY가 없으므로 이 역산을 단일 원인 확정에 쓰지 않음** |
| 이미지 프로파일·축소 | 6개 Git PNG에 ICC/sRGB/gAMA 없음. 축소 합성본이며 측정 원본/XY 미기재 | 임베디드 프로파일로 숫자 차이를 설명할 근거 없음. 축소·픽셀 혼합은 남는 변수 |

## 금속·바닥 가림 수치

금속 매듭은 공식 실버 헬의 iron (15,15,16), sv-dp (44,46,49), sv-dk (79,83,82), sv-md (138,139,136), sv-lt (201,199,195), sv-hi (246,245,242)다. 원본 불투명 픽셀 Y의 25/50/75% 분위 10/20.28/36.28은 새 램프 Y 45.79/60.14/82.56으로 분리된다. H4처럼 모두 같은 색으로 잘리지 않는다.

매트 억제 식은 smoothstep(.45,.75,Y) × (1−smoothstep(.65,.98,A)) × (1−smoothstep(.025,.08,chroma))를 matte로 두고 A_new=A_original×(1−matte)로 줄인다(CS:59–60). 원본 HP (235,135)의 RGBA(179,179,179,70)는 H4에서 A1로 증폭됐으나 H5 A≈.01886, (235,140)의 (193,193,193,41)는 H4≈.588→H5 0이다. 어두운 (235,130)의 (48,48,48,207)는 H5 A207/255 보존. 전체 프레임 알파 적분 감소는 원본 대비 약4.139%, 가고일 crop .734%, 볏 crop1.423%이며 A≥.98 원본 하이라이트는 유지한다. **중성 부분 투명 원화 영역을 분류한 규칙이므로 다른 위치의 번짐·세부 손실 여부는 Mac이 확인해야 한다.**

| 항목 | A | H4 C | H5 C |
|---|---|---|---|
| 판 크기 / 면 알파 | 709×74 / .96→.97 | 같은 크기 / .10→.22 | 같은 크기 / .88→.94 |
| 판 내부+받침 최대 알파(선 제외) | A는 별도 받침 없음 | .3136 | .9472 |
| 판 면 알파 면적, chamfer 제외 근사 | 50,491px² | 8,379px² | 47,617px² (A의94.3%) |
| 실제 H5 생산 2x 래스터 적분(선·AA 포함, 받침 제외) | 이번에 동일 래스터로 재측정하지 않음 | 동일 조건 재측정 없음 | 47,513.973px² |
| 레일 | 1025×14 불투명=14,350px² | 1107.891×14 중 얇은 선·발만 표시 | 동일, 2x 알파 적분812.161px² (A의5.66%) |
| 판+레일 근사 비교 | 64,841px² | 약9,191px² | 약48,429px² (A의74.7%) |

알파 면적은 슬롯·장식·서로의 중첩을 제외한 가림 잠재량이며 **월드 화면 가림 실측이 아니다**. 판은 다시 두꺼운 바탕으로 보이게 하되 A의 검은 레일 전체를 복원하지 않았다. 판 기본 RGB도 C의 sv-dp를 유지한다. 접지와 바닥 가림의 균형이 실제로 개선됐는지는 Mac 재판정으로 남긴다.

## H5 검증 결과

| 검사 | 결과 | 범위 |
|---|---|---|
| hud-proto-tests/run.cjs | 637/0 | 실제 layout C#: C 장식·받침 동축, 모든13슬롯과 기존 A/B, 인자·hit test·해상도 |
| c-render-math.cjs | 래스터453/0, 셰이더 수식5,392/0 | 생산 CArt 스텁 실행, 생산 scalar/ramp/matte 함수 추출 실행. HLSL/Metal 실행 아님 |
| c-transport.cjs | RT·상태·실패 정리51/0, 색10,242/0 | 실제 C target/Blit 메서드 스텁 실행, Gamma·Linear 0..255 채널 CPU/GPU 저장값 동등·alpha 유지 |
| c-preservation.cjs | 25/0 | H1 c1b51cda5 기본/A/B 바이트·생성자 산술 보존, H5 기준3a13dc0d4 공용 렌더러·ProjectSettings 바이트 동일 |
| legacy-path.cjs / render-math.cjs | PASS / 16/0 | 최초 기준75add6ff4 기본 HUD 코드와 기존 A/B 수식 |
| 오프라인 Roslyn | 5/5, 오류0 | Player Core133/Runtime300, Editor Core133/Runtime300/Editor64. 기존 경고155, 변경 C# 경고0 |
| Unity·Metal·화면 | 실행0 / 화면 미검수(Mac) | H4 Mac Metal 정상 이력과 구분 |

로그: H5_validation.log. 오프라인 결과: I:/EXODUSER-Storage/devtools/h5-hud-c/result.json과 Player/Editor 로그. DLL/PDB 산출물은 확인 뒤 제거하고 로그만 보존한다. 의도된 RED 4개(정렬, 램프, 전송, 생성 실패 정리) 후 구현·GREEN. 진짜 검사 실패0, 2회 규칙에 도달하지 않았다. 한 차례 sparse 경로 해석 오류로 선택 경로가 축소됐으나 미커밋 수정 보존을 확인하고 원래 선택+정확한 컴파일 참조4파일로 복구했다. 테스트 실패로 계산하지 않는다.

~~~text
node unity/Tools/hud-proto-tests/run.cjs
node unity/Tools/hud-proto-tests/c-render-math.cjs
node unity/Tools/hud-proto-tests/c-transport.cjs
node unity/Tools/hud-proto-tests/c-preservation.cjs
node unity/Tools/hud-proto-tests/legacy-path.cjs
node unity/Tools/hud-proto-tests/render-math.cjs
./unity/Tools/devtools/buildloop/compile-check.ps1 -Project G:/exoduser-wt/codex-h5-hud-c/unity -LibraryProject G:/exoduser-wt/codex-unity-parity-1102/unity -Output I:/EXODUSER-Storage/devtools/h5-hud-c
~~~

## H5 Mac 재캡처·같은 위치 측정

H5 커밋으로 현재/A/B/C를 **1920×1080 창 모드·무음**, -batchmode·-nographics 없이 촬영한다. 아래 H4의 공통 필드/충전 인자·세 장면(01 시작,03 전투공터,08 보스입구)을 그대로 사용하고 커밋만 H5로 바꾼다. 현재는 --hud-proto 생략, A/B/C는 각각 --hud-proto=a/b/c. 3840은 동일 중앙 구도로 보조 확인한다. PC에서 Unity 실행·Mac 재실행 대기는 하지 않았다.

**Mac 기존 RGB의 원본 파일명·픽셀 XY는 보고서에 없어 미확인**이다. 받은 경우 그 원본/좌표를 우선하여 H4와 H5에서 반복 측정한다. 없으면 아래 새 좌표를 두 SHA의 **1920×1080 원본 PNG 모두에 똑같이** 적용한다. 기존 보고 수치와 새 위치 수치를 같은 표본처럼 직접 빼지 않는다. 좌상단(0,0), 0 기반 정수 픽셀, 크롭/리사이즈/색관리 변환 전 RGB와 주변3×3 범위를 함께 기록한다.

기준 상태: 같은 캐릭터·장착·틱, HP526/526(기존 표시 HpTranslate=.1), MP330/480, ST240/240, hurt flash·쉴드·기동 활성 효과 없음. 숫자·포이즈 눈·키 칩과 겹치지 않는 액체/금속 위치를 사용한다. 값이 다르면 실제 HpTranslate/MP/ST 비율을 영수증에 적고 아래 예상 RGB를 그대로 합격 기준으로 쓰지 않는다.

| 측정 대상 | 원본 PNG (x,y) | 계산상의 색(음영 후, 전송 전) → 저장 → 조건부 표시 RGB | 용도 |
|---|---|---|---|
| HP 액체 | (505,1008) | (60.954,9.739,18.057) → (12,1,2) → (61,13,22) | 분홍 과밝음 재발 비교 |
| MP 액체 | (1376,1000) | (38.093,60.681,85.445) → (5,12,23) → (38,61,85) | ST와 같은 높이의 안정한 젖은 면 |
| ST 액체 | (1454,1000) | (30.770,48.699,38.254) → (3,8,5) → (28,50,38) | 낮은 채도 녹청/파랑 구분 |
| 금속 낮음 | (418,985), 원화(67,296) | 원본(8,8,9,255), 램프≈(38.409,40.024,42.638), 조건부 bilinear 표시≈(38,38,42) | 검은 조각 음영 |
| 금속 중간 | (423,930), 원화(76,185) | 원본(38,37,34,255), 램프≈(80.781,84.690,83.630), 조건부 bilinear 표시≈(79,83,83) | 중간 면 |
| 금속 밝음 | (506,860), 원화(242,45) | 원본(212,206,201,255), 램프≈(222.480,220.957,217.435), 조건부 bilinear 표시≈(223,222,219) | 불투명 하이라이트 보존 |

위 액체 값은 L:51–52의156px rect에 pixel center를 대입한 연속 UV 계산이다. 세 액체 점 주위 원본 프레임6×6은 모두 알파0이며 고리 안쪽 경계에서 각각16.83/9.20/8.10px 떨어진다. MP/ST y1000은 최대값 그림자의 보수적 하단 y993.25를 피한다. 실제512 RT·샘플 보간·Unity 전달 함수 근사·Metal 정밀도는 오차 요인이므로 낱점 숫자 일치 PASS를 약속하지 않는다. 세 금속 source5×5는 A255, 예상 주변 색 범위 낮음(34,34,38)~(42,42,46), 중간(75,79,79)~(88,92,90), 높음(220,218,214)~(226,224,221)다. 현재/A/B는 기하가 달라 이 C 좌표를 그대로 색 비교 위치로 쓰지 않는다.

다음 Mac 표에는 PNG명·SHA·틱·화면 크기·실제 상태·XY·RGB·주변 범위를 남긴다. C x990 장식/받침 동축과13슬롯 줄, 액체 윗면/금속 흰 번짐, 낮음/중간/밝음 세 금속 패치, MP/ST 1x 즉시 구분, 판 접지·바닥 가림을 판정한다. 부분/빈 HP·자원, 쉴드·쿨다운·클릭·10초 영상, 3840은 H4에서 미확인이므로 그대로 남는다. **H5 화면 미검수(Mac), 본선 동결·미병합 유지.**

---

# H4 당시 구현·이미지 검토 이력 (H5 이전)


기준: `codex/unity-hud-proto-20261105`의 `c1b51cda503d1de1ef3ae2c828309e7c27d539f7`. 같은 브랜치에 `--hud-proto=c`만 추가한다. 본선 동결 유지, 병합·Unity 실행·유료 생성 0. **화면 미검수(Mac)**이며 이 문서는 C의 코드·수치 검증과 Mac 재검수 인계다.

Mac `51080f9f6`의 [보고서](https://github.com/beearth/the-exoduser/blob/51080f9f6/docs/0마스터플랜/worklog/cloud-lanes/reports/mac_20261104.md) 3–26행이 판정 근거다. A/B의 접지·정렬 개선, 현재 HUD의 색·해골·뿔이 더 맞는다는 의견, 회색 ST·유리구슬 HP·직선 검은 빈 영역·검은 판·B 받침 문제를 반영한다. 구현 당시에는 Mac 글 보고와 기존 PNG 원화를 확인했다. **이번 후속에서는 Git `1bccb4c2e`의 축소 비교판 6장을 직접 확인했으며**, 관찰·C 대응·한계는 아래 ‘추가 근거’ 절에 반영했다. C 자체의 Mac 화면은 아직 보지 못했다.

H3 `c6995bd893`의 [독립 비평](https://github.com/beearth/the-exoduser/blob/c6995bd893/docs/3.1%20ui%20hud%20디자인/hud_redesign_20261105/codex_hud_critique.md) 129–149행을 참고했다. C는 H3의 작은 구체 제안을 그대로 채택하지 않는다. A의 슬롯 배치를 유지하고 원화 프레임을 회복하는 U1 `5ee0218832` C r2를 참고하되, 어두운 빈 영역과 바닥 가림은 H4 지시에 따라 별도 처리한다. U1 C r2와 달리 주공격 받침은 두 슬롯 경계에 맞춘 낮은 투명 받침이다.

## 요구와 구현 대조

모든 px는 `1920×1080` 설계 좌표다. 기존 `NativeUiViewport.cs:13–16` / `NativeUiSafeArea.cs:7–11`의 균등 변환 `s=min(W/1920,H/1080)`, 원점 `((W−1920s)/2,(H−1080s)/2)`를 그대로 쓴다. 1920×1080은 s=1, `3840×1080`은 s=1·중심 x만 +960 이동한다. GPU 픽셀·보이는 원화의 알파 경계와 C# Rect를 구분한다.

약칭: `L` = `unity/Assets/Exoduser/Runtime/NativeHudPrototypeLayout.cs`, `C` = 같은 Runtime의 `NativeHud.PrototypeC.cs`, `CA` = `NativeHudPrototypeCArt.cs`, `CS` = `unity/Assets/Exoduser/Resources/Shaders/HudPrototypeC.shader`. 아래 코드 줄 번호는 구현 커밋 `041e8e47b5` 기준이며 이번 문서 후속에서 코드는 바뀌지 않았다.

| 요구 | C 구현값 | 파일:줄 |
|---|---|---|
| C만 선택 | 명시적 `--hud-proto=c` 또는 대문자 C. 미지정·잘못된 값·중복은 기존 None | L:19–28, `NativeHud.Prototype.cs:100` |
| A의 정렬·간격 유지 | 판 `(605.5,992,709,74)`, 슬롯 13개 `44×44`, y1000/중심1022, 그룹 안 5px·그룹 사이 16px, 줄665px | L:43–46,55–58 |
| 하단 접지 | 판 bottom1066, 레일 논리 높이14/bottom1080. C 프레임 bottom1072, 액체156. 레일은 면 전체를 검게 채우지 않음 | L:47–54, CA:33–45 |
| 해골·뿔 유지 | 기존 `ui_globe_hp/mp` 프레임과 `ui_bar_only` 가고일·중앙 볏 재사용. PNG·importer 무변경, C 전용 은빛 강철 변환 | C:27–34,55–60, CS:42–49,73–88 |
| 액체와 금속 분리 | 기존 HP 표시 비율을 읽어 와인색 액체로 표현. 유리 광택·흰 수면선 없음. 빈 부분은 방사형 음영과 낮은 알파, 수면은 부드러운 곡선 경계 | C:66–71, CS:29–32,62–70,90–112 |
| MP·ST 구분 | MP 강철 파랑, ST 녹청의 별도 3색 팔레트. 이름 Cinzel600 12px/색 `#e6e3dc`, A/B의 10px 회색 이름은 그대로 | CS:51–60, C:121–128 |
| LMB·RMB 받침 | 슬롯6·7 양 끝에서 8px씩 여유: `(935.5,992,109,74)`, 중심 x990. 두 `44×44` 슬롯과 마우스 키 칩 모두 포함. 화면 중심960 기준의 B 받침 산식을 쓰지 않음 | L:60–61, C:84–85 |
| 바닥 가림 완화 | 판 내부 알파 .10→.22, 주공격 받침 내부 .12. 두 면이 겹친 내부 상한 .3136(가장자리 선 제외). 레일은 1.5px 접지선과 좁은 발 4개이며, 14px 검은 면을 채우지 않음 | CA:8–9,19–45 |
| 폰트·아이콘 | 기존 Cinzel400/600·Hahmlet300, 원래 장착 아이콘과 A의 슬롯·키 칩 표시 재사용. 폰트 대체·이모지·디더·생성 원화 없음 | C:44–54,91–92, `NativeHud.Prototype.cs:151–200` |

C 원화 배율은 `156/175=0.8914286`, 프레임 Rect는 `263×배율=234.4457` 정사각형이다. 액체 중심 `(505.2771,954.7771)` / `(1414.7229,954.7771)`, 좌우 프레임 x `384.4886 / 1293.9343`, y `837.5543`, 액체 y `876.7771`이다. 원화의 논리 액체 오프셋 `(48,44)`와 중심 x135.5 때문에 프레임 Rect 중심과 액체 중심을 같게 놓지 않는다(L:43–52, 기존 `NativeHudDockLayout.cs:20–38`). 따라서 명목 겹침17px와 실제 프레임 Rect의 판 겹침 `13.4343 / 20.5657px`는 다른 값이다. 프레임234.4457을 보이는 금속 고리의 실제 지름으로 보고하지 않는다.

레일 논리 Rect는 `(406.0543,1066,1107.8914,14)`이며 원화가 넓어진 만큼 A보다 넓다(L:53). 슬롯·판은 A와 같고 원화 프레임만 원본 비례를 따른다. 원본 바에서 가고일 `(150,75,215,245)`를 .18배→`38.7×44.1`, 중앙 볏 `(1120,100,220,62)`를 .5배→`110×31`로 재사용한다. 오른쪽 가고일은 수평 반전하며 판 쪽 가장자리28%, 볏 아래20%를 부드럽게 지운다(C:27–34,57–60,88–90). C 복사 RT에서만 원본 알파 가장자리 1텍셀을 줄이고, 금속 명암을 실버 헬 5색으로 매핑한다(CS:42–49,77–88).

구체의 빈 영역 알파는 중앙 .08→가장자리 .42이며 반지름에 따라 변한다. 수면은 정적인 곡선·파형 진폭1px, 전이 반폭2px(전체4px)이다. 반짝이는 유리 반사와 흰 수면선은 넣지 않았다(CS:29–32,62–70,90–112). 기존 실시간 게이지 보간을 그대로 읽으며 새로운 HP 계산을 만들지 않는다(C:69). 쉴드·기동·포이즈 눈은 기존 원본 표시 텍스처와 등록 위치를 `156/175`로 축소해 사용한다(C:101–107, 기존 `NativeHud.cs:141–146`).

## 색 선택과 승인 범위

공식 실버 헬 문서 `DESIGN_CONCEPT_SILVER_HELL_20261028.md:26–37`의 은빛 강철·글자 토큰을 장식과 텍스트에 쓴다. MP/ST 전용색은 그 §3에 없고, U1 `5ee0218832`의 같은 문서 228–229행과 `G0_BRIEF.md:52`에서는 **제안·승인 대기**다. H4가 허용한 C 후보로 아래 제안색을 적용했으며 전역 토큰 승인을 뜻하지 않는다. 해골·뿔 유지도 이번 H4의 명시적 지시에 따른다.

| 용도 | 어두움 / 기본 / 밝음 | 선택 이유·근거 |
|---|---|---|
| HP | `#1e050a / #3d0a12 / #6b1020` | 현재의 와인색 계열을 유지하고 강한 유리 반사를 제거. U1 `defects.md:173` |
| MP | `#16212e / #3b5f86 / #7f9cbc` | 푸른 강철 계열, 파랑 우세. U1 실버 헬 문서 229행·`defects.md:174` |
| ST | `#122019 / #3e5e4a / #7a9680` | 채도를 낮춘 녹청, 초록 채널 우세. MP의 회청/회색 중복을 피하며 원색 초록은 사용하지 않음. U1 실버 헬 문서 228행·`defects.md:174` |

기본색 MP `(59,95,134)`와 ST `(62,94,74)`는 특히 파랑 성분이 60만큼 다르다. 이것은 코드 입력의 구분 근거이며 **1x 즉시 구분·색각 다양성·최종 선형 공간 RGB의 실화면 합격 증거는 아니다.** 추가 공개된 그림 역시 현재/A/B만 있어 C 팔레트의 성과를 입증하지 않는다. 빈 상태는 액체색만으로 구별할 수 없으므로 MP/ST 이름과 좌우 고정 위치도 유지한다.

## 추가 근거 — Mac 축소 비교판 직접 검토

같은 이미지에 대한 H3 독립 비평도 [d5d36cfff6](https://github.com/beearth/the-exoduser/blob/d5d36cfff61cde7be826c14fda84712a787b124f/docs/3.1%20ui%20hud%20디자인/hud_redesign_20261105/codex_hud_critique.md)에서 갱신했다. H3 원제안의 수치·채택 보류는 C 구현에 맞춰 바꾸지 않았다.

이번 후속에서는 `1bccb4c2e`의 여섯 PNG를 모두 직접 열어 보았다. 사용자가 알려 준 로컬 사본은 각 Git blob과 바이트가 같음을 확인했다. 별도 이미지 생성·수정·복사나 Unity 실행은 하지 않았다. **그림의 대상은 H1 `c1b51cda5` 현재/A/B이며 C `041e8e47b5`는 포함되지 않는다.**

실제 PNG 헤더상 전체 비교판 `hud-board-*`는 **1920×359**, 각 장면 패널은 약640×359로 줄어 있다. `hud-3x-*`는 **1280×753** 세 행 합성본이다. 전체판은 왼→오른쪽 현재/A/B, HUD판은 위→아래 현재/A/B다. 파일명의 `3x`는 제공된 파일의 네이티브 3배 확대나 실제 1x 가독성을 보장하지 않는다. 색·질감·실루엣·상대 비례는 검토하되 1px 선 두께·정확한 RGB·실제 글자 판독 성능은 판정하지 않는다.

| 직접 본 파일·장면 | 화면에서 확인한 형태·색 | 판단 범위 |
|---|---|---|
| [hud-board-1.png](https://github.com/beearth/the-exoduser/blob/1bccb4c2e/docs/0마스터플랜/worklog/cloud-lanes/reports/img/hud-board-1.png), [hud-3x-1.png](https://github.com/beearth/the-exoduser/blob/1bccb4c2e/docs/0마스터플랜/worklog/cloud-lanes/reports/img/hud-3x-1.png) — 시작 | 현재의 뿔 해골·거친 회색 고리와 바 양끝 장식이 보인다. A/B는 원형 소켓과 레일이 일렬로 묶이고, 매끈한 밝은 링·붉은 구가 풀·흙 위에서 도드라진다. | 정렬의 정돈과 장식·질감의 큰 차이 확인. 정확한 접지 px는 코드 표를 사용 |
| [hud-board-2.png](https://github.com/beearth/the-exoduser/blob/1bccb4c2e/docs/0마스터플랜/worklog/cloud-lanes/reports/img/hud-board-2.png), [hud-3x-2.png](https://github.com/beearth/the-exoduser/blob/1bccb4c2e/docs/0마스터플랜/worklog/cloud-lanes/reports/img/hud-3x-2.png) — 전투공터 | 현재 HP는 탁한 장미색의 평평한 면, MP/ST는 하늘색·녹색으로 나뉜다. A/B HP는 밝은 중심부와 어두운 둘레, MP/ST는 회청·중성 회색이다. MP 빈 상단은 현재에도 수평 경계가 있으며, A/B에서는 어두운 사분면 판 인상이 강하다. | C가 기존 액체를 단순 복구하는 것으로는 부족하다는 근거. C의 투명 곡면 대응이 성공했는지는 미확인 |
| [hud-board-3.png](https://github.com/beearth/the-exoduser/blob/1bccb4c2e/docs/0마스터플랜/worklog/cloud-lanes/reports/img/hud-board-3.png), [hud-3x-3.png](https://github.com/beearth/the-exoduser/blob/1bccb4c2e/docs/0마스터플랜/worklog/cloud-lanes/reports/img/hud-3x-3.png) — 보스입구 | 다른 배경에서도 A/B의 검은 판·발·레일, 붉은 구와 회색 구의 대비가 반복된다. B의 주공격 두 칸과 받침 중심이 어긋나고 오른쪽 칸이 받침 끝을 넘는 형태가 보인다. | 같은 결함의 배경 간 지속 확인. 정지 보스입구 화면만으로 전투 탄막·주의 분산 성능을 입증하지 않음 |

독립 판단: A/B는 **조각된 뿔·해골과 거친 금속 질감이 사라져** 현재보다 매끈한 공업 부품에 가까운 인상이다. 작은 방사형 가시·상단 눈·중앙 마름모는 남아 있으므로 ‘장식이 전부 없어졌다’고 쓰지는 않는다. 현재 HP의 장미색 평면은 힘이 약하고 A/B의 붉은 구는 유리구슬·버튼 같은 인상이다. 이는 이미지에서 받은 재질 판단이며 소재 물성을 측정한 결과가 아니다. 특히 전투공터 전체판에서 A/B의 붉은 구가 현재보다 먼저 눈에 들어온다는 판단에는 동의하지만, 시선 추적이나 플레이 중 적·탄막 가독성 측정은 없다.

| 직접 확인한 문제 | C `041e8e47b5`에 이미 들어간 대응 | 이번 근거로 닫을 수 없는 항목 |
|---|---|---|
| 원화의 해골·뿔·거친 금속이 사라짐 | 원본 프레임/바 crop 복구 + 실버 ramp(C:55–60, CS:42–49,73–88) | 현재 금속도 이미 회색이다. C의 contrast1.4·gain1.15 재매핑이 더 밝은 덩어리나 넓은 하이라이트를 만들지 않는지 확인 |
| HP가 붉은 광택 구·버튼 같음 | 와인색, 흰 수면선·유리 광택을 넣지 않은 C 액체(CS:98–112) | 금속 안의 액체로 보이는지, 원래의 평평하고 약한 HP와 다른지는 C 캡처 필요 |
| HP/MP 빈 부분의 수평 절단 | 곡선·부드러운 수면, 방사형 빈 영역 α.08→.42(CS:29–32,62–70,90–112) | 빈 영역 자체를 없앤 구현은 아니다. full/partial/empty 각각 확인 |
| MP와 ST의 구분 약화 | 파랑/녹청 별도 팔레트, 이름12px 밝은 글자(CS:51–60, C:124) | 채도를 낮춘 C 색이 1x에서도 즉시 구분되는지, 낮은 잔량·그늘 배경에서도 유지되는지 |
| 검은 막대와 B 받침 어긋남 | 투명 판·얇은 레일, 슬롯6/7 경계 기반 받침(CA:8–9,19–45, L:60–61) | 바닥 노출·접지 느낌, 두 마우스 칸·키 칩의 실제 화면 정렬 |
| 작은 키 칩·최대값, 회색 빈 소켓 | A의 슬롯/키 경로를 유지. MP/ST 이름만 확대 | 키10.5px·칩15px, 최대값 HP13/자원11은 그대로다. 회색 빈 원형 소켓의 버튼 인상도 남을 수 있으며 전체 가독성·재질 문제가 해결됐다고 주장하지 않음(`NativeHud.Prototype.cs:151–184`, L:44) |

추가로 세 HUD판에는 HP `526/526`이 표시되는데 A/B 위쪽에 어두운 띠가 있다. 이것을 실제 HP 부족으로 해석하지 않는다. 기존 `Core/HudValues.cs:58`의 표시식은 full HP에서 `HpTranslatePercent=10`, `NativeHud.cs:59`가 .1로 넘기며 C:69/CS:95도 이를 유지하여 목표 표시 fill은 .9다. C는 빈 부분의 불투명한 판 인상을 바꾸는 표현 후보이지 ‘full HP 빈 영역 0’ 변경이 아니다. 이번 이미지 관찰로 Core·HP 수치나 이 계약을 수정하지 않았다.

이번 반영은 **문서만**이다. 새로 확정된 C 코드 누락은 찾지 못했으므로 수치·코드를 추가 조정하지 않았다. 아래 검사는 구현 커밋 `041e8e47b5`에서 통과한 이력이며 이번 문서 갱신에서 러너·컴파일·Unity를 재실행하지 않았다. 기존 코드 대응을 C 시각 합격으로 승격하지 않고 다음 캡처의 비교 기준을 구체화했다.

## 보존과 검사

| 검사 | 결과 | 범위 |
|---|---|---|
| `hud-proto-tests/run.cjs` | **471/0** | 실제 layout C# 컴파일·실행. 기존 A/B 344건과 C 127건: 인자, 좌표, 받침 포함, 13슬롯 hit test, 초광폭 |
| `hud-proto-tests/c-render-math.cjs` | **C 받침 449/0 + 셰이더 수식·색 257/0** | 실제 CArt를 최소 Unity 수학 스텁으로 실행한 감마 기준 샘플, 생산 셰이더에서 추출한 스칼라 수식. HLSL·GPU 실행 아님 |
| `hud-proto-tests/render-math.cjs` | **16/0** | 기존 A/B 마름모·눈금·그림자 계약 유지 |
| `hud-proto-tests/c-preservation.cjs` | **23/0** | 기준 c1b51cda5와 원본 HUD·A/B 아트/셰이더/PNG/importer 바이트 일치. C 표식 2개만 제거하면 전체 H1 렌더러 동일. A/B 생성자 산술 본문 동일, C 자원 해제도 C 모드에서만 호출 |
| `hud-proto-tests/legacy-path.cjs` | **PASS** | 최초 H1 훅3개 외 기본 HUD 본문은 75add6ff4와 동일, 기존205/89줄과 CR0 유지 |
| 오프라인 Roslyn 컴파일 | **5/5, 오류0** | Player Core133/Runtime300, Editor Core133/Runtime300/Editor64. 기존 경고155, H4 변경 소스 경고0 |
| Unity·Metal·최종 화면 | **미실행 / 화면 미검수(Mac)** | 소스·수식 검사를 시각 판정으로 승격하지 않음 |

검사 로그는 `H4_validation.log`, 원본 오프라인 로그는 `I:/EXODUSER-Storage/devtools/h4-hud-c/result.json` 및 Player/Editor 하위 log다. 컴파일 산출 DLL은 확인 뒤 제거하고 로그만 남긴다. 초기 테스트 작성 중 CS0819(암시적 var 다중 선언) 1회를 수정한 뒤 의도된 RED를 확인하고 구현했다. 그 외 러너·컴파일 실패0, 같은 검사2회 실패 기준에는 도달하지 않았다. 기본 git whitespace 검사는 CRLF 추가행을 1회 경고했으며, 줄 끝 보존 조건에 맞춰 core.whitespace=cr-at-eol로 확인한다. 요구사항 검토와 별도 코드 품질 검토에서 차단 결함0. 품질 검토의 권고로 C 자원 해제 호출도 C 모드로 제한한 뒤 보존23건과 전체 오프라인 컴파일을 다시 통과했다.

오프라인 명령(기존 Bee RSP/참조를 읽기만 하며 Unity 실행 아님):

```text
./unity/Tools/devtools/buildloop/compile-check.ps1 -Project G:/exoduser-wt/codex-h4-hud-c/unity -LibraryProject G:/exoduser-wt/codex-unity-parity-1102/unity -Output I:/EXODUSER-Storage/devtools/h4-hud-c
```

HP·MP·ST·쉴드·포이즈·기동·쿨다운·분노는 기존 표시값을 읽는다. Core, HP·피해 로직, 카메라 피치, 어택 티켓은 바꾸지 않는다. C의 새 자원은 C 최초 표시에서만 만들며 종료·부분 초기화 실패 시 해제한다. 기존 원화와 폰트의 공유 자산을 해제하지 않는다.

기본 HUD·A/B 소스 보존과 화면 동일성은 별개다. Mac이 H1에서 보고한 기본 HUD 픽셀 일치 `98.12~99.89%`, 최대 차6, 파일 해시 차이는 배경 월드 영향이라는 추정만 있고 미확정이다(`mac_20261104.md:24`). 이번 코드 검사로 그 원인을 확정하거나 픽셀 동일 PASS로 바꾸지 않는다. H1의 Metal PASS도 새 C 셰이더의 Metal PASS가 아니다.

## Mac 재캡처 인계

Mac 공용 절차에서 **창 모드·무음**, **`-batchmode` 없이** 촬영한다. `-nographics`도 넣지 않는다. 이것이 Mac 보고 9행의 실제 촬영 절차이며, H1 문서의 이전 batchmode 예시는 이번 인계에서 대체한다. PC에서는 실행하지 않았다.

공통 필드 인자:

```text
--remodel3d --unity-field-screen -screen-width 1920 -screen-height 1080 -screen-fullscreen 0 -nosound --unity-qa-sandbox <Mac 절대 격리 저장 경로> -output <Mac 절대 출력 경로>
```

| 비교 | 추가 인자 |
|---|---|
| 현재 | 없음 |
| A | `--hud-proto=a` |
| B | `--hud-proto=b` |
| C | `--hud-proto=c` |

같은 H4 커밋·캐릭터·장착·상태·카메라·해상도에서 네 모드를 비교한다. 출력과 QA 저장은 current/a/b/c로 구분하고 각 고정 폴더에 최신 한 세트만 남긴다. 사용자 저장은 쓰지 않는다. 캡처 진입 `NativeGame.cs:172`, 위치 목록·해상도 반복 `NativeGame.A2FieldCapture.cs:69–74`를 사용한다.

| 장면 | 네 모드 공통 확인 |
|---|---|
| 01-시작 `(4020,7420)`, 1920×1080 | A의 13슬롯 정렬·접지 유지, 해골·뿔 잘림·흰 외곽 번짐, C LMB·RMB와 받침 정렬 |
| 03-전투공터 `(4000,5000)`, 1920×1080 | 밝고 어두운 바닥 위 1x 액체색·금속 대비, 검은 막대 가림, 빈 구체의 직선 판 인상 |
| 08-보스입구 `(4020,500)`, 1920×1080 | 같은 구도에서 상단 HUD와 간섭, 장식 대비. 실제 탄막 우선 가독성은 별도 전투 확인 |
| 위 세 장면, 3840×1080 | 중앙 +960·슬롯 폭 불변, 레일 끝·원화 잘림. 기존 하니스가 함께 촬영 |
| 동일 실전투/QA 상태 | HP·MP·ST full/partial/empty, 쉴드·포이즈·모든 슬롯 쿨다운·분노·기동, 마우스 클릭·상태 설명, 10초 무음 영상 |

충전 상태 보조 인자도 창 모드로 쓴다:

```text
--remodel3d --unity-hud-blend-smoke -screen-width 1920 -screen-height 1080 -screen-fullscreen 0 -nosound --unity-qa-sandbox <Mac 절대 격리 저장 경로> -output <Mac 절대 출력 경로> [--hud-proto=a|b|c]
```

`NativeGame.HudBlendCapture.cs:29–45`는 idle·충전2/3단과 720p/1080p를 촬영한다. 이 하니스의 JSON 기하는 기존 dock 기준이므로 C 배치 PASS로 쓰지 않는다. 기존 `--unity-hud-smoke`의 원색 ST 기대값도 C 색 판정으로 쓰지 않는다.

새 비교판을 반영한 우선 캡처: 같은 전투공터 배경에서 현재/C의 금속 명암·붉은 구의 주목도, full HP 526/526의 상단 형태, MP330/480·ST240/240 및 낮은 잔량의 색 구분, 회색 빈 소켓·작은 키/최대값, 판 아래 월드 노출을 나란히 본다. 전체 1920×1080 원본과 원배율 HUD crop을 함께 남기고, 이번 축소본을 1px 판정 자료로 사용하지 않는다.

남은 판정: 새 C shader import/Metal 오류·폴백, 실제 1x 색 구분·가독성, Hahmlet 상태 설명, 구체의 동심원 띠가 표시 과정 산물인지 여부, 원화 은색 변환·프레임/액체/포이즈 눈 정합, 판 투명도와 탄막 대비, 위 동적 상태와 입력, 현재/A/B 소스 보존에 대응하는 같은 상태의 화면 비교. C는 **화면 미검수(Mac)**이며 채택 판정은 이 문서로 대신하지 않는다.
