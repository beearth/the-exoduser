# Windows 전달 도구 stat 호환 수정 — 2026-11-02

대상은 제품이 아닌 unity/Tools/qa/win-delivery.py다. 원본/수정 SHA를 대조하고 PC 담당자가 전달한 LF patch와 정확히 동일하게 인수했다. 설치·권한·전역설정·Assets/Shader/C# 변경0, Unity재빌드불필요.

| 항목 | 실제 결과 / 계약 |
|---|---|
| PC 최초 RED | 기존 Python3.12.14/NTFS의 변하지 않은 owned manifest에서 File replaced before read. path lstat ctime1793600527530287000 / handle fstat1793600527531716600;dev/inode/size/mtime/mode/birthtime동일. PC소유원FAIL보존 |
| PC 두 번째 RED | ctime교차만고친뒤.exe path mode33279 / handle33206의합성실행비트차이로거부. 원FAIL보존 |
| 원본SHA256 | f084a66fd48acee48ad6b93c303be915e996152033300ba4a2d757173e9aa7b3 |
| 수정SHA256 | 78cf59590433d264c70729e51e686d3f0531cb9f4a1edd5ec2d00b783c30213c |
| cross_api_identity | Windows교차API에만dev/inode/size/mtime/birthtime_ns/파일종류비교. birthtime_ns없는런타임은원ctime엄격기준유지. posix는기존identity동일 |
| full 변경감지 | path전후와handle전후각각기존full identity(ctime/permission포함)엄격비교,교차객체동일성·streamSHA/bytes검사유지. manifest identity6원소schema불변 |
| PC인수실행 | PC담당자Windows기존Python3.12.14/NTFS에서기존8fixture전부기대결과PASS,추가3MiB마지막byte변조/mtime정확복원중읽기거부PASS. Mac총괄의직접Windows실행으로표현하지않음 |
| Mac실제실행 | 동일SHA코드로기존8fixture전부기대결과PASS,동일portable3MiB변조회귀PASS,양쪽새소유output/원본문서보존 |
| 추가회귀 | test-win-delivery-stat-mutation.py. 새절대--output만받으며원3MiB와변조파일보존,20ms뒤stream중변조+fsync+mtime원복후Live input changed during read거부요구 |
| 실제게임한계 | 위fixture통과는실제4GiB게임ZIP의PC수신/해제/실행검수가아님. 별도receipt필요 |

Windows의ctime생성시각의미변경주의와birthtime추가는 [Python3.12 공식 stat 문서](https://docs.python.org/3.12/library/os.html#os.stat_result.st_ctime)에명시돼있다. 서로다른API의위구체차이는해당PC런타임의실제관측이며일반플랫폼전체로확대하지않는다.

PC원문/실패/수정후receipt는 I:/EXODUSER-Storage/ground-placement/20261102/win-delivery-tools/의windows-owned-fixture-8.raw.json/windows-stat-mutation-portable.raw.json과G:/exoduser-wt/codex-ground-placement-20261102/.ground-qa-20261102/에PC담당자가보존했다. Mac실행은win-delivery-stat-mac-fixture/test-receipt.json 및win-delivery-stat-mac-mutation/test-receipt.json. 원기록을소급수정하지않았다.
