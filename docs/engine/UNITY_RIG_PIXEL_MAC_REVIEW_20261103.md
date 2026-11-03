# 리깅 픽셀 R6d Mac 검수 요청 — 2026-11-03

요청 브랜치: codex/unity-rigpixel-20261103. 정확 최종 SHA는 REPORT.md 첫 줄 및 이 문서 갱신 커밋의 원격 HEAD로 대조한다. PC 비정상 종료 3회 뒤 공통규칙 11:55 추가지시에 따라 정식 빌드·Player·M1·UI/FPS는 Mac에서 한다. 새 유료 지출0, 기본 sprite 유지, 공통/바탕화면 전달0.

## 입력과 기존 증거

| 항목 | 경로·범위 |
|---|---|
| PC source | G:/exoduser-wt/codex-rigpixel / 해당 원격 브랜치. 원 사용자 codex-hero WIP 보존 |
| 포함 공통 | origin/unity/main 898ac2b9605e8238d21ba5b4bfe33286f83daf6a 정상 merge. NativeGame 생성분기는 RigPixelRequested/AttachRigPixel 유지, 삭제된 lastKillCount 초기화 재도입0 |
| R6c 기존 패키지 | c65fe43e / build4dd7fde3 / Hero76d1e6a8 41/41·579PNG / Shift3840 279f9e85 4/4 / M1f13ca186 23/23. exit0·창/잔여/USER_SAVE0. 실제 큰면은 개선됐지만 잔점 FAIL, 미채택 |
| R6d 차이 | 실제광/팔레트/보행/상체선행은 유지. RT alpha 내부소재태그 .6/.7/.8/1 +동일재질3×3 median·표면alpha1복구. 얼굴/머리/얇은칼/실루엣보존. 자연QA Running=!PlayerDown |
| PC 한 번 컴파일 | 665409d7 C#0·USER_SAVE0이나 shader검사false/exit2. HLSL예약어pass 원인확인후 iteration 교정. 별도median함수 D3DCompile HRESULT0. 수정후 전체Unity·Metal은 미검증 |
| 원시 캡처 | G:/exoduser/tmp/design-review/20261103_rig_pixel/r6c (실체 I:/EXODUSER-Storage/archive/G/exoduser/tmp/design-review/20261103_rig_pixel/r6c) |
| 직접본 비교 | r6c/comparison/C10-R6c-NRFTW-body-aligned.png / -3x.png / manifest.json. C10다른패키지임을표시, 수동몸높이114px정렬, R6d결과아님 |
| 참고 | docs/engine/UNITY_RIG_PIXEL_20261103.md / UNITY_HERO_MOTION_20261030.md / UNITY_RIG_PIXEL_FOLLOWUP_20261103.md |

## 실행 순서

Mac 담당의 실제 소유 checkout·Unity6000.6.7f1·원격SHA/INDEX/WORK·세이브격리·무창/무음을 먼저 확인한다. PC 공용bin을 Mac에서 실행할 수 있다고 가정하지 않는다. Mac의 승인된 실행기를 사용하고 해당 경로/영수증을 남긴다. PC에서 Unity 실행은 공용bin만이며 더 이상 새 정식빌드/Player 요청을 하지 않는다.

1. Editor entrypoint Exoduser.CharacterLab.RigPixelVerification.Verify / -output <고유 검수 경로>/editor-check.json. renderer/shaders/humanoid 전부true. R6d는SM3.5, Metal의배열/루프/태그 alpha정밀도 확인. 오류본문은RIGPIXEL_SHADER 로그.
2. PortVerification.Build / -output <고유 빌드 폴더> -receipt <고유 receipt.json> -remodel-scenes 1. activeBuildTarget StandaloneOSX, 같은Mac패키지를다음검사에계속사용. Windows용 -force-d3d11은Mac에전달하지않는다.
3. 모든Player에 --unity-mute --unity-qa-sandbox <고유격리폴더> --hero-render=rigpixel --remodel3d. 전체화면강제/가시창/기존앱교체0. Mac은명령줄screen크기만믿지말고 실제PNGwidth,height를검사한다.
4. 제어동작: --unity-hero-review -review-width 1920 (다음3840) -output <고유>/hero-1920 또는hero-3840 -screen-width 1920/3840 -screen-height 1080. 실제Playing/blockingfalse/world3Dtrue와41검사·579PNG필수. 대기·8방향·달리기·구르기·3타·E·시전·피격·사망을1x/3x로직접본다. AIoff/강제피격·사망fixture이며자연플레이로쓰지않는다.
5. Shift: --unity-playtest-capture -playtest-controls Shift -review-width 1920/3840 -output <고유>/shift-... -screen-width ... -screen-height 1080. 실제Harp/Dash 프레임의motion=Chain, 파지/발선/칼관통 확인.
6. 같은패키지 M1: --unity-m1-check -output <고유>/m1. 23단계 statusok·정상exit·세이브변경0. UI겹침은공통승인도구로별도확인.
7. 실제 일반입력/FPS: --unity-rigpixel-natural -review-width 1920/3840 -output <고유>/natural-... -screen-width ... -screen-height 1080. AI/스폰/HP변경0,12초중2초워밍업제외,PNG인코딩시간만제외. avg60fps이상·p95/분포·장치/사용자앱동시실행을기록. 다른자기검수/빌드/인코딩과겹치지않음. 자연fallen5초의Core진행도확인.
8. 같은패키지 C10: 위natural흐름에서 --hero-render=sprite로명시전환, natural-entry.png/entryScreenX,Y를비교기준으로사용. 원1x와3x·NRFTW동일몸높이비교판을만들고조작흐름/가독성차이를직접판정.
9. 영상: 실제hero-%04d.png 30fps/579프레임=19.3초, 전체동작과첫300프레임10초무음본. 권장 ffmpeg -framerate 30 -start_number 0 -i <frames>/hero-%04d.png -an -c:v libx264rgb -crf 0 -preset fast -threads 4 -pix_fmt rgb24 <full.mp4>; 10초본은 -frames:v 300. ffprobe audio0/실제해상도/프레임수·디코드RGB와원PNG해시를대조. 영상도3x점0을직접확인.

## 판정과 전달

- R6d는Mac Shader/Player미검증이다. R6c의성공영수증을재명명하지않는다. 정점/가중/판정/원본자산은보존하되실루엣·큰셀면·접지·발미끄러짐·상체선행·첫공격접점·예비/발동/회복·관통·점0을직접판정한다.
- FAIL0/큰차이0/점0/60fps통과후에만기본전환을검토한다. 핵심FAIL이면다음수정점을같은REPORT에돌려준다. 합격한Windows패키지없이는PC후보.lnk를만들지않는다.
- Unity통합담당만unity/main에병합한다. 일반바탕화면은자동BuildLoop, 후보정확이름은 지옥의 길 1-1 리깅 캐릭터 후보 (Unity), 자동기동0. 공통sourceSHA/최종패키지SHA/실행경로를별도대조한다.
- 후속: 실버테일허브/치마·아이반드레드LOCK수정후같은파이프라인. 적5종현재추적rig부재→Tripo사용자웹로그인요청만, 대리로그인/새유료호출0. 드루이드비인간Generic수동리깅은계획만, 보스전담당공동검수전완료아님.

Mac이 원격브랜치를실제로fetch/착수했는지 또는결과를회신했는지는현재미확인이다. 요청문서작성/원격push를Mac검수완료로보고하지않는다.
