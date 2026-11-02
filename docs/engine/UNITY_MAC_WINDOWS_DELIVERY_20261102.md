# Win64 배포 준비 인수 — 실제 빌드·전송 미실행

오프라인 표준 Python CLI `win_delivery.py`를 준비했다. 실행은 **추후 Root가 승인한 동일 정상 source의 최종 Win64 full tree**를 대상으로 한다. 현재 QA3bc48/sprite helper source가 배포 승인된 것으로 간주하지 않는다. 기존 delivery-readiness/receipt.json의 PortVerification·영상·패키징 근거를 재사용했다.

## Root 빌드 준비 예시 (이 작업에서 실행 안 함)

Unity6000.6.7f1의 **Windows Build Support (Mono)** 모듈과 Win64 target이 사용 가능한지 Root가 확인한다. 이전 정상 Win64 receipt는 존재하지만 현재 설치 모듈 사용 가능 여부를 새로 통과시킨 것은 아니다. 모듈 설치/Unity 실행/네트워크는 여기서 수행하지 않았다.

기존 정상 entrypoint는 namespace 없는 `PortVerification.Build`다. Root 소유로 준비된 동일 source 프로젝트에서 기존 정상 빌드 절차·복원 wrapper를 사용하며 예시 핵심 인자는 다음과 같다.

```text
/Applications/Unity/Hub/Editor/6000.6.7f1/Unity.app/Contents/MacOS/Unity
-batchmode -projectPath <Root-owned approved project>
-buildTarget Win64 -executeMethod PortVerification.Build
-output <new absolute Win64 build directory>
-receipt <new absolute build-receipt.json>
-logFile <new absolute Editor log>
```

QA identity 옵션은 생략한다(default false). 최종 포함 scene/flavor 등은 승인된 정상 빌드와 동일해야 하며 이 예시가 그 선택을 새로 승인하지 않는다. output은 EXODUSER-Unity.exe다. CLI는 receipt가 Succeeded/errors0/StandaloneWindows64/x64/settingsQa=false/uiQa=false/정상 identifier이고 source identity의 Unity 버전 및 receipt hash와 맞는지 요구한다. 빌드/제품 소스·project settings 수정은 Root 소유이며 CLI가 실행하지 않는다.

## 준비 metadata

`source-identity.example.json`, `media-identity.example.json`을 **새 파일로 복사해 검토한 절대 경로·SHA로 채운다**. 예시 placeholder는 실행 가능한 승인값이 아니다. source identity는 승인 source 전체40자리 SHA, Unity 버전, 최종 build receipt SHA, 실제 build-input manifest 절대 경로·SHA를 연결한다. 바이너리만으로 Git source를 역증명하는 도구가 아니므로 Root가 source→입력manifest→빌드receipt의 동일성을 사전에 인수해야 한다.

영상 예시는 기존 승인 기준 두 개다. 현재 승인 source의 실제 원본 파일 절대 경로를 넣어야 한다. prepare는 원본 bytes/SHA와 built tree의 파일을 모두 대조한다.

| 배포 상대 경로 | bytes | 기존 기준 SHA256 |
|---|---:|---|
| EXODUSER-Unity_Data/StreamingAssets/Lobby/world_intro_v22b_steam.mp4 | 102204634 | 3b99d59bca9d84a37bb6b49067148e1ed69fefb478ff206221b59c8c952d0b0f |
| EXODUSER-Unity_Data/StreamingAssets/Lobby/warrior_story_v23_clean.mp4 | 94795327 | 8b8248424b63d808dc225576fda44e39d459709963f97923ffaa38a51dba28ab |

## prepare → 검토 → pack

아래 명령은 예시이며 실제 패키지에 실행하지 않았다. 모든 filesystem 인자는 승인된 로컬 절대 경로만 사용한다. 출력의 부모는 이미 존재해야 하고 **각 output 디렉터리는 없어야 한다**. 기존 output 재사용/덮어쓰기는 거부된다.

```text
python3 /ABSOLUTE/win_delivery.py prepare
  --build-root /ABSOLUTE/APPROVED/WIN64
  --source-identity /ABSOLUTE/APPROVED/source-identity.json
  --build-receipt /ABSOLUTE/APPROVED/build-receipt.json
  --media-identity /ABSOLUTE/APPROVED/media-identity.json
  --output /ABSOLUTE/NEW-PREPARE
```

prepare 산출물은 manifest.json과 prepare-receipt.json이다. ZIP은 만들지 않는다. Root가 source/Unity/receipt/inputmanifest, 모든 exe/Data/plugin/D3D12/UnityPlayer 파일의 상대경로·bytes·SHA, 원본영상2개, 전체 directory topology, 제외 목록을 검토한다. UnityCrashHandler 등 그 밖의 파일도 원본에 있으면 전부 포함하며 wildcard로 가지치기하지 않는다. 읽은 tree 전체 및 evidence가 변하지 않았는지 다시 확인한다.

**유일한 제외는 루트의 정확한 디렉터리 `EXODUSER-Unity_BackUpThisFolder_ButDontShipItWithYourGame`**와 그 자손이다. 비슷한 이름이나 다른 위치의 폴더는 포함된다. 해당 backup도 원본 변경 감지용 inventory/hash에는 기록하며 bytes를 ZIP에 넣지 않는다. symlink·special file·절대/..·역슬래시/Windows 위험 member path·case/Unicode 충돌은 거부한다. 원본을 삭제하거나 정리하지 않는다.

검토된 manifest 파일의 SHA256을 Root가 pack 인자로 명시한다.

```text
python3 /ABSOLUTE/win_delivery.py pack
  --manifest /ABSOLUTE/NEW-PREPARE/manifest.json
  --reviewed-manifest-sha256 <reviewed 64-hex SHA256>
  --output /ABSOLUTE/NEW-PACK
```

pack은 source 및 evidence를 사전/사후 재확인하고 파일을 읽는 동안 descriptor·path identity/size/mtime/ctime/SHA를 검사한다. ZIP_STORED/allowZip64=True와 각 member force_zip64=True를 사용한다. 빈 디렉터리도 포함하며 full tree 파일뿐 아니라 directory topology도 유지한다. 내부 파일/CRC/SHA를 다시 읽어 검증한 후 manifest.json·pack-receipt.json을 생성한다. ZIP 자체 bytes/SHA, source, Unity, manifest SHA를 기록한다. ZIP 내부 DELIVERY-MANIFEST.json은 외부 검토본과 byte exact다. 기존 원본 tree가 같은 이름의 reserved manifest를 가지면 거부한다.

Root는 완료된 build를 안정된 상태로 두어야 한다. 이 도구는 writer를 정지하거나 원본을 잠그지 않는다. 검사 사이 탐지 가능한 변경은 실패하며 원본/불완전 ZIP/FAILURE.json을 그대로 보존한다. 완료 pack receipt가 없는 파일은 배포하지 않는다. 실패 output을 재사용하거나 자동 retry하지 말고, 원인을 인수한 뒤 새 prepare/output으로 진행한다. SHA 검사는 비악성 동시 writer의 변경 감지이며 원본의 원자적 filesystem snapshot을 제공한다는 뜻은 아니다.

## PC 수신 바이트 검증

Root가 별도로 승인·소유하는 전송으로 package.zip, 외부 manifest.json, pack-receipt.json, 이 CLI를 PC에 전달한다. 이 작업에는 전송 명령/서버/PC 메시지/설치/실행이 없다. PC의 실제 로컬 절대 경로 예시는 다음과 같다.

```text
py -3 G:\APPROVED\win_delivery.py verify
  --archive G:\RECEIVED\package.zip
  --manifest G:\RECEIVED\manifest.json
  --pack-receipt G:\RECEIVED\pack-receipt.json
  --output G:\NEW-VERIFY
```

압축 해제를 별도 새 폴더에서 수행한 경우 `--tree G:\RECEIVED\EXTRACTED`를 추가한다. CLI는 스스로 압축 해제·설치하지 않는다. archive는 ZIP 전체 SHA/bytes와 내부 member별 SHA/bytes·안전 경로·중복/extra/missing·symlink를 검사한다. --tree에서는 정확한 상대경로 file/directory 집합과 bytes/SHA 및 embedded manifest를 대조한다. 파일이 빠지거나 추가·변경되면 실패한다. --tree를 생략한 receipt의 extractedTreeVerified는 null이며 해제본을 검증했다고 주장하지 않는다. sender pack receipt 자체 SHA도 결과에 기록하고 검증 도중 바뀌지 않았는지 확인한다.

## 준비 검증과 한계

py_compile 통과. 아주 작은 소유 fixture만 사용해 8개 기대 결과를 검증했다: 정상 prepare/pack, 수신ZIP+fulltree, 기존output 거부, 수신 내용변경, 원본 내용변경, 원본 누락, symlink, 위험상대경로7개. 누락 fixture의 원 파일과 변경 전 bytes는 별도 preserved 파일로 보존했다. 최초 tiny-tests-1 뒤 수신 pack receipt 변경 감지도 추가해 tiny-tests-2를 한 번 실행했다. 두 결과는 모두 보존됐다. 최종 tiny fixture 전체 약84KB이며 실제 게임/원본영상은 읽거나 포장하지 않았다.

작은 ZIP20member 모두 local ZIP64 extra field가 있음을 확인했다. **4GB 초과 실제 ZIP과 Windows Python/해제 프로그램은 아직 검증하지 않았다**. Python3.9 시스템 zipfile은 작은 member의 central extract-version을20으로 기록하므로 version45만을 ZIP64 사용 판정으로 삼지 않았다. allowZip64/force_zip64 설정과 local ZIP64 extra를 근거로만 기록한다.

포장/수신 byte PASS는 Windows 실행·게임플레이·자연 Mac GUI·시각·원본 영상 재생/오디오/skip·서명·전송 인증을 통과했다는 뜻이 아니다. manifest/receipt는 전자서명된 발신자 인증서가 아니므로 실제 전달 채널의 신뢰는 Root가 별도로 인수한다. 모듈 확인→실제 동일 source 정상 Win64 빌드→prepare 검토→pack→PC 수신/byte검증→Windows·영상 실행 검수는 모두 아직 Root 후속 단계다.


## 소스 동기화 인수

| 항목 | 인수값 |
|---|---|
| 실행 CLI | unity/Tools/qa/win-delivery.py |
| 소유 fixture 검사 | unity/Tools/qa/test-win-delivery-owned-fixture.py |
| hash read chunk |1048576 bytes |
| ZIP member timestamp |1980-01-01 00:00:00 |
| ZIP file/directory mode |0644/0755 |
| 검사 범위 |작은fixture8개 기대결과통과,20member localZIP64필드확인;실제4GiB이상/Windows미검수 |
| 현재 normal Mac QA source |80d0ae89ca1af2a08987ec7b6f47340231a36bff |
| 실제 Win64 source/build/package/PC수신 |아직없음. 이Mac QA source를최종배포승인한것아님 |

Root가manifest를검토하고명시SHA를pack에전달하는내부인수단계다. 사용자의새승인을요구하는규칙으로해석하지않는다. 기존authorized범위에서실제소스인수와MacGUI검수후진행한다.


2026-11-02 게시경로인수추가: fixture companion import를실제게시CLI명win-delivery.py에맞췄다. 실제게시2파일배치에서py_compile+8개작은소유fixture기대결과를모두재확인했다. CLI제품코드변경0,원래worker8개검사기록보존. 실제Win64빌드/패키지/PC수신검수범위는미완료그대로다. 근거evidence/UNITY_MAC_WINDOWS_PUBLISHED_TOOL_CHECK_20261102.json.


## 2026-11-02 동일80d0 정상Win64·서명후MacM1·배포바이트준비 실제 결과

| 단계 | 실제 결과/범위 |
|---|---|
| normal Win64 |source80d0ae89ca1af2a08987ec7b6f47340231a36bff,StandaloneWindows64/x64/settingsQa=false/uiQa=false,DX11·DX12포함빌드errors0,bytes4572368298 |
| 소스경계 | e33이후제품Runtime추가수정0,QA Tools14source/meta만차이. Win원입력tracked3569+원본movie2개,blobmismatch0,rawbefore/after772drift보존 |
| 원본영상 |world_intro_v22b_steam.mp4=102204634B/SHA3b99d59bca9d84a37bb6b49067148e1ed69fefb478ff206221b59c8c952d0b0f,warrior_story_v23_clean.mp4=94795327B/SHA8b8248424b63d808dc225576fda44e39d459709963f97923ffaa38a51dba28ab. 원본과Winbuilt모두exact |
| manifest |배포211파일4572136263B,원트리21디렉터리.유일한제외는정확rootBackup내1파일. SHA181ce8aef4d64c0c28051cef9d1679ed7110feefef734e304a8900f55629e599 |
| ZIP64 sender |4572275424B,SHA50e0abf7d303fb6e9eb67d31ce6cec7162e6ca610b18f05193162b180fb73460. 전체member/CRC/SHA/source evidence전후변경감지통과,송신준비완료. PC수신/해제/실행PASS아님 |
| Win exe / DLL |exe667136B/SHA9806abde4a406ed68647e9505852c49f6aa72a372f4f084e2aa2821affea57a2;Runtime85752c0dcc90a516a1bf8117353837b0d7bed480f872c7777ba770485c894e6c;Core957d31e65635d916a8b14a16dacd74c79bf6dec6ca9f5a60506af75761fb5842. Mac/Win DLLbyte동일을주장하지않고동일입력소스를각targetreceipt로연결 |
| signed Mac 후보 |ASCIIlauncherEXODUSER/로컬ad-hoc strict-deep서명,원Runtime8f9e.../Core4a3e...동일,서명exe ba81873d07d13140804243144ce66878c8ee347dfc72b06702d2317bff66a144 |
| signed-M1 실제 |동일80d0 source/Runtime/Core 및normalizer의서명exeSHAstrict일치,23/23PASS/exit0,headless-rendertexture1600×900/GUIrepaint0·bridge0. raw26/cache27즉시2s7s exact복구/errornull |
| 설치/공통Unity |기존설치1403보존. remoteunity/main1403확인,candidate80d0가descendant인것확인. source+docs최종인수후remote재확인/nonforcefastforward만. 아직설치교체/commonpush0 |
| PC문서 |9d658d3fe1f91e4ec33a234623f140da6b6c2bf9의문서4delta를Root9fa1d67...에기존Root기록보존하며병합,e33대비PCUnitytree동일. 최종통합은이문서계보도포함해야함 |
| 전달도구 |WindowsNTFS cross-APIctime/.exe합성xbit호환patchSHA78cf...인수,PC담당8+변조회귀attestation와Mac실제8+변조회귀모두PASS. gameAssets/Shader/C#변경0 |

private one-shot서버는정확192.168.0.233:3334에만bind하고peer192.168.0.146만허용한다.5개GET/HEAD route(/package.zip,/manifest.json,/pack-receipt.json,/win-delivery.py,/candidate-packet.json)만허용,목록/root노출없음,시작전SHA/descriptor/O_NOFOLLOW확인,request전후fileidentity,Range재개지원,20분기한후종료. Node준비소스syntax검사만이시점PASS이며아직listen/PC수신완료로표현하지않는다. 기존서버가있으면임의종료하지않고소유PID를확인해야한다. 파일을다받았다는peer확인뒤자기서버만종료한다. 상시자동화/자동로그인/잠금우회는없다.

signed-natural wrapper도source80d0/normalizer서명exe/Runtime/Core를strict대조하고별도QA sandbox에서사용자수동unlock후OS조작으로검수할준비다. 자동조작·AI정지·자원/무적부여0. observer는첫10s launchwarmup+60s만읽으며menu/startup포함이므로실제fieldframe/전투를별도선택·관측해야한다. 이검수는아직미실행이다. Rootliteralold50/triadold58·old9미관측/R독립참조불일치/원full100·61은불변이다. MAP PRODUCTION REPORT:geometry/원화/충돌불변,TECH별도서명·Winpack준비통과,자연PLAYABLE/PCGPU실행미검수. VISUAL VERDICT: RETOUCH.
