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
