# Unity 캐릭터 슬롯 목록 영속 저장 — 2026-10-25

> 2026-11-01 사용자 “우리도 다 풀어버려” 적용 후보: 생성·복원·저장의 개수 제한 제거. 폴더/파일명/schema는 유지하고 새 payload만 version2를 사용한다. 아래 2026-10-25 검사 기록은 당시 이력이며 현재후보 검수·실행미반영 상태는 마지막 절을 따른다.

> Integration completed after this module handoff. Current accepted scope and restart/restore evidence: [final slots](UNITY_MAC_CHARACTER_SLOTS_20261025.md), source67d1904c6. The integration-pending gates below are historical. Full game-progress storage remains outside this module.

상태: 지원 담당의 새 저장 모듈과 격리 파일 I/O53검사 완료. 기존 Mac 담당이 정상 Unity JsonUtility/캐릭터 UI에 통합해야 실제 기능 완료다. 캐릭터 이름·전사 슬롯·선택만 저장하며 전체 전투 진행·P/G/INV·온라인 계정을 이식한 것이 아니다.

## 경로·파일·수명

| 항목 | 계약 |
|---|---|
| 정상 root 권장 | `Path.Combine(Application.persistentDataPath,"character-roster-v1")`. 기존 웹/Godot/AppData save를 찾거나 읽지 않음 |
| API root | 절대 경로 필수. constructor는 디스크 쓰기0, 없는 root의 첫 Load는파일/폴더생성0 |
| 주 파일 | `characters.v1.json` |
| 이전 정상본 | `characters.v1.bak`, 매 정상 교체 직전 primary. 과거 모든 revision 보관이 아닌1개 previous 정상본 |
| 배타 잠금 | `characters.lock` FileShare.None. lease종료시핸들해제. 기존소스INDEX/전역lock과무관 |
| 임시 파일 | `.characters-<GUID>.tmp`, 같은디렉터리CreateNew→flush(true)→publish. 실패시자기temp만정리 |
| 손상 보존 | 복구load후다음Save에서 `characters.corrupt-<GUID>.json`에 손상primary를이동보존, 정상backup을손상bytes로대체하지않음 |
| 일반 app과 fixture | 정상저장은위새namespace만. 기존모든smoke는저장미사용,새재실행fixture만 -output아래격리root로실행 |

## 버전과 데이터

| 필드 | 값 / 유효성 |
|---|---|
| schema | `exoduser.unity.character-roster` 정확히일치 |
| version | 2026-11-01 후보: 새 저장2, 기존1/2 읽기. 읽을 때는 원문불변, 정상저장 시2로승격. 2초과는UnsupportedVersion으로보류하고backup을통해강등하지않음 |
| revision | 디스크에는1이상, 성공Save마다+1. snapshot/Capture는0. 로드한expected revision과현재파일이다르면Conflict |
| names | 개수 제한 없음. CharacterRoster.TryCreate(name,0) 검증을임시모델에서소비. UTF-16 2~8/Ordinal중복/금지문자·정규화규칙그대로. trim이필요한디스크이름은자동개명대신InvalidData |
| selectedIndex | -1 또는names범위. 빈목록은-1만,비어있지않은목록도선택해제-1허용 |
| character index | v1은기존확정전사0의이름목록만지원. 잠긴다른직업을새로허용하거나이름으로직업을추정하지않음 |
| payload | UTF-8/BOM없음, 임의64KiB상한 제거. 읽기byte배열이 표현할 수 없는 int.MaxValue초과만TooLarge로거부·원본보존. 슬롯 수 제한 없음 |
| codec | `Func<Snapshot,string>`/`Func<string,Snapshot>` 주입. product는Unity JsonUtility, 격리검사는System.Text.Json 사용. serializer가필드/이름을손실하면roundtrip불일치CodecError로파일쓰기0 |

## API

제품복사파일은 **CharacterRosterStore.cs 1개**다. 지원폴더CharacterRoster.cs는당시검사의의존성사본이며기존Core소유변경을덮어쓰는용도가아니다.

`CharacterRosterStore(string absoluteDirectory, Func<CharacterRosterSnapshot,string> encode, Func<string,CharacterRosterSnapshot> decode)`.

| API | 결과 |
|---|---|
| CreateSnapshot(names,selected) | names배열복사/schema1/revision0의후보snapshot |
| Capture(roster) | 현재이름·선택을분리복사, live쓰기0 |
| Validate(snapshot,out status) | 전체후보를임시roster로검증,live변경0 |
| TryLoad(out snapshot,out status) | Missing/Loaded/RecoveredFromBackup 성공. 실패시snapshot null·save권한미획득 |
| TrySave(roster,out status) | 현재roster를분리capture후아래Save |
| TrySaveSnapshot(snapshot,out status) | 성공Saved. caller snapshot의revision/배열변경0. 로드성공전NotLoaded |

오류상태는 NotLoaded/InvalidData/UnsupportedVersion/WrongSchema/TooLarge/IoError/Busy/Conflict/CodecError다. Missing은정상빈목록,RecoveredFromBackup은직전정상목록으로복구되었음을사용자에게구분할수있다. 복구는사라진최신진행을발명하지않는다.

## 저장·복구 gate

1. Load성공후에만Save. 새root는Missing/revision0이다. primary가정상이면그파일을쓰고, malformed/invalidprimary일때정상backup만읽기복구한다. unknownformat/future/oversize/I/O오류는자동강등하지않는다.
2. 생성·삭제·선택의후보roster를만들고전체검증→디스크Save성공→live roster교체순서. Save실패시현재목록·선택·창을성공으로갱신하지않는다. 기존CharacterRoster.TryRestore는제품owner가추가한transactional구현을쓴다.
3. payload codec왕복/상한검증뒤root생성·배타lock·현재revision재검사. 두앱의오래된목록이최신파일을덮는것을Conflict로거부한다. retry시무작정재저장하지말고새목록load/표시를명시한다.
4. 같은디렉터리temp에flush한뒤기존primary가있으면File.Replace(temp,primary,backup),첫publish는File.Move를사용한다. 원자교체미지원/권한실패시IoError이며기존primary를delete하고우회하지않는다.
5. 복구상태에서는손상primary를고유corrupt이름으로보존한뒤temp를publish하고goodbackup을유지한다. 두단계사이중단되어도기존backup이남는다. 이단위는전원차단의모든가능한파일시스템내구성을실험한것은아니다.

## 새 검증

격리fixture53/0: 생성·선택·순서·선택없음·삭제/마지막빈목록의새storeload,backuprevision,caller불변,temp정리,두앱stale쓰기거부,손상복구와원손상보존,backup보호,복구없음의쓰기차단,미래버전/다른schema,불법import이름/중복/용량/선택범위,65,536byte상한,codec필드손실,배타잠금·해제,파일인root/IO오류,revision overflow거부를검사했다. 실제사용자저장/계정/Unity GUI접근0. source이름모델41·삭제58·이전Player16성공군재실행0.

코드작성후전체docs를CharacterRoster/캐릭터저장/슬롯저장/최대5/세션캐릭터로grep해83문서매칭을보존했다. 원본SV-LOBBY는슬롯선택과전체P/G/INV로드를다른단계로분리하므로이번목록저장을전체세이브이식으로표시하지않는다. 관련Unity캐릭터/세션문구·작업보드·changelog는제품owner가통합checkpoint에같이갱신한다.

다음제품gate: UnityJsonUtility codec실행·격리root에서app재시작→목록/선택복원,생성/삭제실패시live불변,기존smoke정상namespace쓰기0,정상앱생성/삭제취소·확인과저장범위안내. 전체gameprogress/다른직업/계정은별도미완료다.


## 2026-11-01 제한 해제·구버전 보호 후보

캐릭터 names 수 제한과64KiB상한을 제거했다. version1/2 목록을 읽고 다음정상저장에서version2로승격하며 직전v1원문은기존bak에남긴다. 구버전은 version2를UnsupportedVersion으로거부하므로5개backup으로강등·덮어쓰기하지않는다. 이름중복·순서·선택·잠금·revision충돌·codec왕복·손상원본보존은유지한다.

격리저장59검사 PASS:5,000개/64KiB초과실제파일 저장·새store재로드·선택복원·v1무변경읽기→v2저장→v1backup보존 포함. 모델생성42/복원15·최종삭제58 검사는 별도근거. 실제JsonUtility/Unity컴파일/Player/M1·실제사용자세이브는미검증·수정0이다. 도타보호로새Unity0, 지정통합담당의정식인수전NOT_READY. `I:/EXODUSER-Storage/character-capacity/20261101-unlimited/REPORT.md`.


### 2026-11-01 Mac 무제한 목록 실물 검수 준비

현재 제품 후보 a9ddfbff의 한도 제거 계약을 보존하고, 독립 QA 입력에서 실제 여섯째 입장/재실행·v1 raw backup·5,000개 JsonUtility 검수를 준비한다. [전용 검수 계약](UNITY_MAC_CHARACTER_CAPACITY_QA_20261101.md)의 실행전/NOT_READY와 과거 실행 영수증을 구분한다. 이 단계는 실제 ARM64/Win64 빌드나 Player 통과 증거가 아니다.
