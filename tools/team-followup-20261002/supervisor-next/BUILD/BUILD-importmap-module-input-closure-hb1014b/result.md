# BUILD importmap 정적 module 입력 누락 — 한 경계 완료

실제 game.html의 three/addons/ importmap이 가리키는 vendor GLTFLoader.js를 inputRoots·inputs·backup.inputs에서 동시에 제외해도 원 plan은 READY_PLAN_ONLY였다. 메모리 static module closure 후보는 정확한 누락경로를 명시해 BLOCKED로 거부했고 정상 control은 plan 반환 객체 전체가 동일했다.

관측 6/6 PASS, 사건2입력×현행/후보4호출. 전건 CH1 누락/4plan/6관측 재실행0. productionApplied=false/runtimeAccepted=false/rebuildExecuted=false/visualAccepted=false. 2026-10-02T11:05:09.272Z–2026-10-02T11:05:09.488Z UTC, 실제 cwd /Users/fordeargamers/Projects/exoduser-migration-20261001. parent d5c1b62d은 역사 기준이며 현재 HEAD/원격 조회0.

## 실제 caller와 파일 경로

- game.html:62870 importmap: three → ./assets/vendor/three-r160/build/three.module.js, three/addons/ → ./assets/vendor/three-r160/examples/jsm/. inline module2곳은 three/addons/loaders/GLTFLoader.js를 정적 import한다.
- 대상은 assets/vendor/three-r160/examples/jsm/loaders/GLTFLoader.js다. 최상위 legacy GLTFLoader.js와 혼동하지 않는다. vendor loader line67 three import, line68 ../utils/BufferGeometryUtils.js import, utils line12 three import를 실제 AST로 해석했다.
- 정상선택7파일 / 누락6파일의 유일한 선택 차이는 vendor GLTFLoader1파일. source Map에 원파일은 존재한다. runtime/backup pin까지 선택 inventory와 맞춰 원 listTree/sameInventory 전체 경계를 통과시켰다. 전체프로젝트 input closure가 아닌 modulegraph에 한정한 작은 선택대조다.
- 실제 complete plan line43과 listTree/sameInventory/readFile/directory/relative/safeAncestors를 VM 실행했다. libraryEvidence/fs/runtime 대역. Acorn 8.16.0 실제 parser를 사용해 ImportDeclaration/Export* static source만 수집했으며 게임/vendor module은 실행하지 않았다. es-module-lexer MODULE_NOT_FOUND 조회는 숨기지 않고 Acorn으로 진행, 설치0.

| 입력 | 원 plan | 메모리 후보 |
|---|---|---|
| vendor GLTFLoader.js만 선택제외 | READY_PLAN_ONLY — 결함 | BLOCKED / REQUIRED_STATIC_MODULE_MISSING:game.html->assets/vendor/three-r160/examples/jsm/loaders/GLTFLoader.js |
| 실제 module graph 정상 | READY_PLAN_ONLY | READY_PLAN_ONLY, plan 전체결과 동등 |

utils 정적relative edge를 실제 원문에서 찾고 정상 candidate fs trace에서 그 경로 읽기를 관측했다. utils 누락 반례를 별도 실행하거나 전체트리/과거검사를 반복하지 않았다. 후보는 추가 HTML/module읽기가 있으므로 fs trace 전체동등은 주장하지 않는다. 파일 선택 검증과 실제 브라우저 import symbol/link/버전 호환 검수는 구분한다.

## 최소 메모리 patch

기존 core4 REQUIRED_INPUT_MISSING loop 뒤 assertStaticModuleClosure(sourceRoot,inputs)1호출과 아래 helper만 추가하는 후보다. script/style guard 전건을 실행/변경하지 않았다. 원 plan SHA b4d4a7443f417fc08fafcafd6286f2b923c22b90cd0fa731faca4bfd6b79e6f6, 후보 SHA f3953b76a40e5536cb63a89853c966427c9899d67d64535f69cd8008b7cbb7b4, checks SHA ba221c4d377a6d82943d49a322245a90bb148bd9ad27902e6be386efa58a6f41. 실제 전체caller/module/packager SHA·pin은 내장 JSON refs.

```javascript
function staticSpecifiers(source){return acorn.parse(source,{ecmaVersion:'latest',sourceType:'module'}).body.filter(n=>['ImportDeclaration','ExportAllDeclaration','ExportNamedDeclaration'].includes(n.type)&&n.source).map(n=>n.source.value);}
function htmlModuleData(html){const maps=[],modules=[];const clean=html.replace(/<!--[\s\S]*?-->/g,'');const attr=(tag,name)=>{const m=tag.match(new RegExp('(?:^|\\s)'+name+'\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))','i'));return m?(m[1]??m[2]??m[3]):null;};for(const m of clean.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){const type=(attr(m[1],'type')||'').toLowerCase();if(type==='importmap')maps.push(JSON.parse(m[2]));else if(type==='module')modules.push({src:attr(m[1],'src'),text:m[2]});}return {imports:Object.assign({},...maps.map(x=>x.imports||{})),modules};}
function resolveStaticModule(specifier,parentFile,imports,htmlFile){
 const baseOrigin='https://module-fixture.invalid/';let value=specifier,base=parentFile;
 if(!/^(?:\.{0,2}\/|[a-z][a-z0-9+.-]*:|\/\/)/i.test(specifier)){
  const key=Object.keys(imports).filter(k=>k===specifier||(k.endsWith('/')&&specifier.startsWith(k))).sort((a,b)=>b.length-a.length)[0];
  if(!key)throw Error('UNMAPPED_STATIC_IMPORT:'+specifier);value=imports[key]+(key.endsWith('/')?specifier.slice(key.length):'');base=htmlFile;
 }
 const url=new URL(value,new URL(base,baseOrigin));if(url.origin!==new URL(baseOrigin).origin)return {external:true,url:url.href};return {external:false,path:decodeURIComponent(url.pathname.slice(1)),url:url.href};
}
function assertStaticModuleClosure(sourceRoot,inputs){
 const selected=new Set(inputs.map(x=>x.path));
 for(const input of inputs){if(!/\.html$/i.test(input.path))continue;const data=htmlModuleData(readFile(path.join(sourceRoot,input.path)).toString()),visited=new Set();
  function visit(specifier,parentFile){const resolved=resolveStaticModule(specifier,parentFile,data.imports,input.path);if(resolved.external)return;relative(resolved.path);
   requireValue(selected.has(resolved.path),'REQUIRED_STATIC_MODULE_MISSING:'+input.path+'->'+resolved.path);
   if(visited.has(resolved.path))return;visited.add(resolved.path);
   for(const child of staticSpecifiers(readFile(path.join(sourceRoot,resolved.path)).toString()))visit(child,resolved.path);
  }
  for(const module of data.modules){if(module.src)visit(module.src,input.path);else for(const specifier of staticSpecifiers(module.text))visit(specifier,input.path);}
 }
}
// 기존 core4 loop 직후:
assertStaticModuleClosure(sourceRoot,inputs);
```

검토 대상은 Acorn parser 의존성의 패키저 연결과 원 직접script/style guard와의 접점이다. 새 parser 설치0; 메모리에서는 설치 Acorn을 주입했다. external origin은 선택필수로 만들지 않고 dynamic ImportExpression·모든assets·선택적 credits 강제0. importmap scopes/HTML base/entity/redirect/복수map 스펙·일반HTMLparser·module symbol linking은 미검수다. 후보 선택계약 확정은 총괄 검토 Gate로 남긴다.

## docs 정본 인계

docs전체 관련rg1회 102행/57문서, exit0, 원문SHA 686426ec29f08f8b7cc3d9db90137de5d0d5ddcadeecd15aa813f4c59665f6cb. matchedFiles 내장 evidence. 공유docs/보호2_3 수정0.

| 정본 | old | new 정확 인계 |
|---|---|---|
| INTEGRATION_BUILD_TEAM_MASTER / packager 입력 | 선택 inventory SHA와 core4만 원plan 강제, module closure UNKNOWN | hb1014b: game.html importmap three/addons/가 선택한 vendor GLTFLoader.js를 inputRoots/inputs/backup.inputs에서 함께 제외해도 READY_PLAN_ONLY임을 실제 전체plan 메모리 대역으로 재현. static module closure 후보는 REQUIRED_STATIC_MODULE_MISSING:game.html->assets/vendor/three-r160/examples/jsm/loaders/GLTFLoader.js로 BLOCKED; 정상 plan 전체결과 동일. 미적용 후보/source 경계 인계 |
| BUILD_BACKUP_POLICY 빌드 입력 / 해당 module caller docs | 정확 입력 SHA·원격 보존과 runtime모듈 포함 필요 | HTML importmap exact/prefix와 AST static ImportDeclaration/Export source의 local 상대 module 의존을 선택inventory와 구분해 검증하는 후보. three/addons/loaders/GLTFLoader.js → vendor loader → ../utils/BufferGeometryUtils.js → three 해석 근거 고정. 외부/dynamic/allassets/credits 정책확정0 |
| module/GPU/빌드 품질 인수 | 실제 앱/3D 로드·fallback·decode는 별도 | 새2입력/4plan/6관측만 기록. Acorn 구문/선택검수는 browser module linking/실앱/GPU/시각/저장/서명/배포 PASS 아님. 재빌드/native/runtime 미검수 유지 |

읽기 전후 변경 0경로는 evidence에 기록. 타팀WIP/원소스 쓰기0. Git Changes는 감독이추적,80 root checkpoint/100전 새산출중단 감독관리. 산출 result.md/checks.mjs2파일만, JSON evidence/영수증/최소patch도 report내. 새팀/채팅/메시지/세이브/서버/실앱/이미지/설치/삭제0. 실제 도구 exec_command만, 스킬/MCP 별도사용0. 하니스 실패0, dependency probe MODULE_NOT_FOUND는 기록했다.

다음 Gate: 감독이 static module closure 후보와 별도 직접 script/style 후보의 통합 접점을 검토하고 총괄이 scoped source+docs/원격 checkpoint. 실앱 module 로딩/3D fallback/render/decode 검수는 별도.

## 내장 evidence JSON

```json
{
  "taskId": "BUILD-importmap-module-input-closure-hb1014b",
  "provider": "Codex",
  "chatId": "01a0faaf-9dd5-7c91-ab09-ee0bcff343b0",
  "cwd": "/Users/fordeargamers/Projects/exoduser-migration-20261001",
  "owner": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/BUILD/BUILD-importmap-module-input-closure-hb1014b",
  "startedUtc": "2026-10-02T11:05:09.272Z",
  "endedUtc": "2026-10-02T11:05:09.488Z",
  "startedKst": "2026-10-02T20:05:09.272+09:00",
  "command": "/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node /Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/BUILD/BUILD-importmap-module-input-closure-hb1014b/checks.mjs",
  "exitCode": 0,
  "parentProvidedHistoricalCommit": "d5c1b62d",
  "currentHead": "UNKNOWN_GIT_NOT_QUERIED",
  "refs": [
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/BUILD/BUILD-importmap-module-input-closure-hb1014b/TASK.md",
      "bytes": 4217,
      "sha256": "daf14b23a10f98b279a8c87237a3e89c1c14de58b673d726850317d6f13cac85",
      "utc": "2026-10-02T11:05:09.272Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/continuous/COMMON.md",
      "bytes": 3373,
      "sha256": "de5a881270625a7b2d0e854331205e01372a037340a18474c6442b60e668465e",
      "utc": "2026-10-02T11:05:09.273Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/AGENTS.md",
      "bytes": 26076,
      "sha256": "fd59bef70960bcaf1ab9910051faa860362884e574ac2869fad05c6872ae04e4",
      "utc": "2026-10-02T11:05:09.273Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md",
      "bytes": 24374,
      "sha256": "86ada15a477fc128a77cf10c2337de9fdb36b3f9c463f008f5d3c97e82f60520",
      "utc": "2026-10-02T11:05:09.273Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/13출시·마케팅/INTEGRATION_BUILD_TEAM_MASTER.md",
      "bytes": 21549,
      "sha256": "677cea72ca729d55cc69af0f35abb051220ae2b44bd97a9cb478982cea7dcb0e",
      "utc": "2026-10-02T11:05:09.273Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/13출시·마케팅/BUILD_BACKUP_POLICY_20261001.md",
      "bytes": 11649,
      "sha256": "826cc57cba42f4edaddd3ef306966a1681d6b107cb1a67e475bb55e3cf2daca0",
      "utc": "2026-10-02T11:05:09.273Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261001/BUILD/mac-packager/packager.mjs",
      "bytes": 15503,
      "sha256": "289bf3a1bec9f2a8b06d9309d5fbdcbc672b6a46aeb20e85fb441dd2df45dc65",
      "utc": "2026-10-02T11:05:09.273Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
      "bytes": 4028178,
      "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b",
      "utc": "2026-10-02T11:05:09.275Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/index.html",
      "bytes": 342046,
      "sha256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8",
      "utc": "2026-10-02T11:05:09.277Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/node_modules/acorn/dist/acorn.js",
      "bytes": 242818,
      "sha256": "2261c5f0e4abe860e889dfc67081683a4ba4d27deb7f4cbc8ad06a1b7fdd510c",
      "utc": "2026-10-02T11:05:09.280Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/package.json",
      "bytes": 2040,
      "sha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8",
      "utc": "2026-10-02T11:05:09.296Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/node-main.js",
      "bytes": 10429,
      "sha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3",
      "utc": "2026-10-02T11:05:09.296Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/assets/vendor/three-r160/build/three.module.js",
      "bytes": 1272972,
      "sha256": "76dea8151bc9352aef3528b4262e249b2604f62543828328db978d060d61a495",
      "utc": "2026-10-02T11:05:09.299Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/assets/vendor/three-r160/examples/jsm/loaders/GLTFLoader.js",
      "bytes": 108522,
      "sha256": "d073b438e6a07e1359741dd5d6c76c953420cc0d4fd84eb1bdde94315540e6a3",
      "utc": "2026-10-02T11:05:09.352Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/assets/vendor/three-r160/examples/jsm/utils/BufferGeometryUtils.js",
      "bytes": 31906,
      "sha256": "9be041e96308775d00e2695cc607645b9a9b64fd7c0e759dd8f7c00a8d92becb",
      "utc": "2026-10-02T11:05:09.355Z"
    }
  ],
  "sourceFragments": {
    "base": {
      "text": "const version='0.111.2';\nconst pins={\n  'index.js':'75e7a65f378bdc33677eb50d53bf9f6ccb90fceb639cdc9abd81205faeffa03d',\n  'bld.js':'9a52b68223e5dc1b3f59ed504db50dc888c6a4c23708b3307a300e48395f29f9',\n  'util.js':'0e35bc436cdfd26e0ba771748688825bfd6b46a6968915b6e12d3d1d23235844',\n  'bld/osx.js':'9db9b472d4eea79776076d187d5329107de73177d82628f88f006e3eb281968a'\n};\nconst digest=data=>createHash('sha256').update(data).digest('hex');\nconst requireValue=(condition,message)=>{if(!condition)throw Error(message);};\nconst protectedSegment=segment=>/^(saves?|userdata.*|profiles?|\\.git|\\.env.*|node_modules|tmp|dist(?:-.*)?|out)$/i.test(segment)||/\\.(app|exe|dll|nw|zip|pem|key)$/i.test(segment);\nfunction safeAncestors(absolute){\n  let current=path.parse(absolute).root;\n  for(const segment of absolute.slice(current.length).split(path.sep).filter(Boolean)){current=path.join(current,segment);requireValue(!fs.lstatSync(current).isSymbolicLink(),'SYMLINK_PATH');}\n}\nfunction directory(value){requireValue(typeof value==='string'&&path.isAbsolute(value),'ABSOLUTE_ROOT_REQUIRED');const resolved=path.resolve(value);safeAncestors(resolved);requireValue(fs.statSync(resolved).isDirectory(),'DIRECTORY_REQUIRED');return resolved;}\nfunction relative(value,protect=true){requireValue(typeof value==='string'&&value&&!path.isAbsolute(value)&&!value.includes('\\\\'),'RELATIVE_PATH_REQUIRED');const segments=value.split('/');requireValue(segments.every(segment=>segment&&segment!=='.'&&segment!=='..'),'PATH_ESCAPE');if(protect)requireValue(!segments.some(protectedSegment),'PROTECTED_INPUT');return value;}\nfunction readFile(absolute){safeAncestors(absolute);const descriptor=fs.openSync(absolute,fs.constants.O_RDONLY|fs.constants.O_NOFOLLOW);try{const before=fs.fstatSync(descriptor);requireValue(before.isFile()&&before.nlink===1,'REGULAR_SINGLE_LINK_REQUIRED');const data=fs.readFileSync(descriptor);const after=fs.fstatSync(descriptor);requireValue(before.size===after.size&&before.mtimeMs===after.mtimeMs&&before.ctimeMs===after.ctimeMs,'SOURCE_CHANGED');return data;}finally{fs.closeSync(descriptor);}}\nfunction listTree(root,selection,protect=true){\n  const entries=[];\n  function visit(value){relative(value,protect);const absolute=path.join(root,value),stat=fs.lstatSync(absolute);\n    if(stat.isDirectory()){for(const name of fs.readdirSync(absolute).sort())visit(value+'/'+name);return;}\n    if(stat.isSymbolicLink()){\n      requireValue(!protect,'SYMLINK_INPUT');const target=fs.readlinkSync(absolute);requireValue(!path.isAbsolute(target),'ABSOLUTE_RUNTIME_LINK');const resolved=fs.realpathSync(absolute);requireValue(resolved.startsWith(root+path.sep),'RUNTIME_LINK_ESCAPE');entries.push({path:value,sha256:digest('symlink:'+target),target});return;\n    }\n    requireValue(stat.isFile()&&stat.nlink===1,'REGULAR_SINGLE_LINK_REQUIRED');entries.push({path:value,sha256:digest(readFile(absolute))});\n  }\n  for(const item of selection)visit(item);\n  const sorted=entries.sort((first,second)=>first.path.localeCompare(second.path));requireValue(new Set(sorted.map(entry=>entry.path)).size===sorted.length,'OVERLAPPING_ROOTS');return sorted;\n}\nfunction sameInventory(actual,expected){requireValue(Array.isArray(expected)&&expected.length>0,'EXPLICIT_SHA_INVENTORY_REQUIRED');const normalized=expected.map(entry=>({path:relative(entry.path,false),sha256:entry.sha256,...(entry.target===undefined?{}:{target:entry.target})})).sort((first,second)=>first.path.localeCompare(second.path));requireValue(normalized.every(entry=>/^[a-f0-9]{64}$/.test(entry.sha256)),'SHA_FORMAT');requireValue(JSON.stringify(actual)===JSON.stringify(normalized),'INVENTORY_SHA_OR_COVERAGE_MISMATCH');}\n",
      "sha256": "561d2dd443e5698d495bfd6365a85f07e7439ab99523acd21d1220bb198e371b"
    },
    "plan": {
      "text": "function plan(config){\n  try{\n    requireValue(process.platform==='darwin','DARWIN_HOST_REQUIRED');const arch=config.arch||process.arch;requireValue(['arm64','x64'].includes(arch),'MAC_ARCH_REQUIRED');\n    const sourceRoot=directory(config.sourceRoot),outputRoot=directory(config.outputRoot);requireValue(!sourceRoot.split(path.sep).some(protectedSegment),'PROTECTED_SOURCE_ROOT');requireValue(!outputRoot.split(path.sep).some(protectedSegment),'PROTECTED_OUTPUT_ROOT');\n    requireValue(config.runtime&&config.runtime.cacheRoot,'MAC_RUNTIME_MISSING');\n    const id=config.id||randomUUID();requireValue(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(id),'UNIQUE_ID_REQUIRED');\n    const job=path.join(outputRoot,'mac-packager-'+id);try{fs.lstatSync(job);throw Error('JOB_ALREADY_EXISTS');}catch(error){if(error.code!=='ENOENT')throw error;}\n    requireValue(Number.isInteger(config.port)&&config.port>=1024&&config.port<=65535&&![3333,3340].includes(config.port),'ISOLATED_PORT_REQUIRED');\n    requireValue(config.backup&&/^[a-f0-9]{40}$/.test(config.backup.sha)&&config.backup.sha===config.backup.remoteSha&&/^refs\\/(heads|tags)\\/.+/.test(config.backup.remoteRef)&&Number.isFinite(Date.parse(config.backup.verifiedAt)),'REMOTE_BACKUP_EVIDENCE_REQUIRED');\n    requireValue(Array.isArray(config.inputRoots)&&config.inputRoots.length>0,'INPUT_ROOTS_REQUIRED');const inputs=listTree(sourceRoot,config.inputRoots);sameInventory(inputs,config.inputs);\n    sameInventory(inputs,config.backup.inputs);for(const required of ['package.json','node-main.js','index.html','game.html'])requireValue(inputs.some(entry=>entry.path===required),'REQUIRED_INPUT_MISSING:'+required);\n    requireValue(config.runtime&&config.runtime.cacheRoot,'MAC_RUNTIME_MISSING');const cacheRoot=directory(config.runtime.cacheRoot),runtimeRoot=path.join(cacheRoot,`nwjs-v${version}-osx-${arch}`);directory(runtimeRoot);\n    requireValue(typeof config.runtime.releaseInfoPath==='string'&&path.isAbsolute(config.runtime.releaseInfoPath)&&config.runtime.releaseInfoPath.endsWith('.json')&&!config.runtime.releaseInfoPath.split(path.sep).some(protectedSegment),'ABSOLUTE_RELEASE_INFO_REQUIRED');const releaseBytes=readFile(config.runtime.releaseInfoPath),releaseInfo=JSON.parse(releaseBytes);requireValue(digest(releaseBytes)===config.runtime.releaseInfoSha256,'RELEASE_INFO_SHA');requireValue(releaseInfo.version==='v'+version&&/^[0-9]+(?:\\.[0-9]+){1,3}$/.test(releaseInfo.components?.chromium),'LOCAL_RELEASE_INFO_REQUIRED');\n    const runtimeFiles=listTree(runtimeRoot,['nwjs.app'],false);sameInventory(runtimeFiles,config.runtime.files);\n    const binary=readFile(path.join(runtimeRoot,'nwjs.app/Contents/MacOS/nwjs'));requireValue(binary.length>=8&&binary.readUInt32LE(0)===0xfeedfacf&&binary.readUInt32LE(4)===(arch==='arm64'?0x0100000c:0x01000007),'RUNTIME_ARCH_UNKNOWN_OR_MISMATCH');\n    const chromium=releaseInfo.components.chromium;\n    const requiredRuntime=['nwjs.app/Contents/Info.plist','nwjs.app/Contents/Resources/en.lproj/InfoPlist.strings'];\n    for(const helper of ['nwjs Helper','nwjs Helper (Alerts)','nwjs Helper (GPU)','nwjs Helper (Renderer)'])requiredRuntime.push(`nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/${chromium}/Helpers/${helper}.app/Contents/Info.plist`,`nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/${chromium}/Helpers/${helper}.app/Contents/MacOS/${helper}`);\n    for(const required of requiredRuntime)requireValue(runtimeFiles.some(entry=>entry.path===required),'RUNTIME_FILE_MISSING:'+required);\n    const name='EXODUSER-'+id,stage=path.join(job,'stage'),output=path.join(job,'package'),saveRoot=path.join(job,'user-state/saves'),profile=path.join(job,'user-state/profile');\n    requireValue(path.isAbsolute(profile)&&!/[\\s\"'\\x00-\\x1f\\x7f]/.test(profile),'UNSUPPORTED_PROFILE_ARGUMENT_PATH');\n    const packageInfo=JSON.parse(readFile(path.join(sourceRoot,'package.json')));requireValue(packageInfo.main==='http://localhost:3333/index.html?demo=1'&&packageInfo['node-main']==='node-main.js','PACKAGE_ENTRY_CONTRACT');\n    requireValue(typeof packageInfo['chromium-args']==='string'&&(packageInfo['chromium-args'].match(/--user-data-dir=\\S+/g)||[]).length===1,'PROFILE_CONTRACT');\n    const derivedPackage={name:packageInfo.name,version:packageInfo.version,main:`http://127.0.0.1:${config.port}/index.html?demo=1`,'node-main':'node-main.js','node-remote':[`http://127.0.0.1:${config.port}`,`http://localhost:${config.port}`],window:packageInfo.window,'chromium-args':packageInfo['chromium-args'].replace(/--user-data-dir=\\S+/,`--user-data-dir=${profile}`)};\n    const originalServer=readFile(path.join(sourceRoot,'node-main.js')).toString();const portNeedle='const PORT = 3333;',saveNeedle=\"const SAVE_DIR = path.join(APPDATA, 'EXODUSER-HELL', 'saves');\";\n    requireValue(originalServer.split(portNeedle).length===2&&originalServer.split(saveNeedle).length===2,'SERVER_DERIVATION_CONTRACT');\n    const derivedServer=originalServer.replace(portNeedle,`const PORT = ${config.port};`).replace(saveNeedle,`const SAVE_DIR = ${JSON.stringify(saveRoot)};`);\n    return {status:'READY_PLAN_ONLY',id,job,sourceRoot,inputs,runtimeRoot,runtimeFiles,derivedPackage,derivedServer,backup:config.backup,library:libraryEvidence(),paths:{stage,output,profile,saveRoot},args:{version,flavor:'normal',platform:'osx',arch,srcDir:stage,cacheDir:cacheRoot,outDir:output,glob:false,managedManifest:false,zip:false,releaseInfo,app:{name,CFBundleIdentifier:'com.exoduser.mac.'+id,CFBundleName:name,CFBundleDisplayName:'EXODUSER',CFBundleVersion:'1.0.0',CFBundleShortVersionString:'1.0.0',LSApplicationCategoryType:'public.app-category.games'}},packageCreated:false,limits:['로컬bld내부API고정;최상위getter/manifest/다운로드호출안함','SHA/원격근거는제공된파일목록대조;외부Git조회아님','선택root전체파일커버리지검사;선택root의게임의존성완전성은root승인계약','port는정적격리값;실행직전실제점유검사는별도','서명/코덱/실행검수미완료','프로필/저장절대경로는고유job에귀속;이동/배포계약별도']};\n  }catch(error){return {status:'BLOCKED',error:String(error.message),packageCreated:false};}\n}",
      "sha256": "b4d4a7443f417fc08fafcafd6286f2b923c22b90cd0fa731faca4bfd6b79e6f6",
      "startLine": 43
    },
    "candidate": {
      "text": "function plan(config){\n  try{\n    requireValue(process.platform==='darwin','DARWIN_HOST_REQUIRED');const arch=config.arch||process.arch;requireValue(['arm64','x64'].includes(arch),'MAC_ARCH_REQUIRED');\n    const sourceRoot=directory(config.sourceRoot),outputRoot=directory(config.outputRoot);requireValue(!sourceRoot.split(path.sep).some(protectedSegment),'PROTECTED_SOURCE_ROOT');requireValue(!outputRoot.split(path.sep).some(protectedSegment),'PROTECTED_OUTPUT_ROOT');\n    requireValue(config.runtime&&config.runtime.cacheRoot,'MAC_RUNTIME_MISSING');\n    const id=config.id||randomUUID();requireValue(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(id),'UNIQUE_ID_REQUIRED');\n    const job=path.join(outputRoot,'mac-packager-'+id);try{fs.lstatSync(job);throw Error('JOB_ALREADY_EXISTS');}catch(error){if(error.code!=='ENOENT')throw error;}\n    requireValue(Number.isInteger(config.port)&&config.port>=1024&&config.port<=65535&&![3333,3340].includes(config.port),'ISOLATED_PORT_REQUIRED');\n    requireValue(config.backup&&/^[a-f0-9]{40}$/.test(config.backup.sha)&&config.backup.sha===config.backup.remoteSha&&/^refs\\/(heads|tags)\\/.+/.test(config.backup.remoteRef)&&Number.isFinite(Date.parse(config.backup.verifiedAt)),'REMOTE_BACKUP_EVIDENCE_REQUIRED');\n    requireValue(Array.isArray(config.inputRoots)&&config.inputRoots.length>0,'INPUT_ROOTS_REQUIRED');const inputs=listTree(sourceRoot,config.inputRoots);sameInventory(inputs,config.inputs);\n    sameInventory(inputs,config.backup.inputs);for(const required of ['package.json','node-main.js','index.html','game.html'])requireValue(inputs.some(entry=>entry.path===required),'REQUIRED_INPUT_MISSING:'+required);\n    assertStaticModuleClosure(sourceRoot,inputs);\n    requireValue(config.runtime&&config.runtime.cacheRoot,'MAC_RUNTIME_MISSING');const cacheRoot=directory(config.runtime.cacheRoot),runtimeRoot=path.join(cacheRoot,`nwjs-v${version}-osx-${arch}`);directory(runtimeRoot);\n    requireValue(typeof config.runtime.releaseInfoPath==='string'&&path.isAbsolute(config.runtime.releaseInfoPath)&&config.runtime.releaseInfoPath.endsWith('.json')&&!config.runtime.releaseInfoPath.split(path.sep).some(protectedSegment),'ABSOLUTE_RELEASE_INFO_REQUIRED');const releaseBytes=readFile(config.runtime.releaseInfoPath),releaseInfo=JSON.parse(releaseBytes);requireValue(digest(releaseBytes)===config.runtime.releaseInfoSha256,'RELEASE_INFO_SHA');requireValue(releaseInfo.version==='v'+version&&/^[0-9]+(?:\\.[0-9]+){1,3}$/.test(releaseInfo.components?.chromium),'LOCAL_RELEASE_INFO_REQUIRED');\n    const runtimeFiles=listTree(runtimeRoot,['nwjs.app'],false);sameInventory(runtimeFiles,config.runtime.files);\n    const binary=readFile(path.join(runtimeRoot,'nwjs.app/Contents/MacOS/nwjs'));requireValue(binary.length>=8&&binary.readUInt32LE(0)===0xfeedfacf&&binary.readUInt32LE(4)===(arch==='arm64'?0x0100000c:0x01000007),'RUNTIME_ARCH_UNKNOWN_OR_MISMATCH');\n    const chromium=releaseInfo.components.chromium;\n    const requiredRuntime=['nwjs.app/Contents/Info.plist','nwjs.app/Contents/Resources/en.lproj/InfoPlist.strings'];\n    for(const helper of ['nwjs Helper','nwjs Helper (Alerts)','nwjs Helper (GPU)','nwjs Helper (Renderer)'])requiredRuntime.push(`nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/${chromium}/Helpers/${helper}.app/Contents/Info.plist`,`nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/${chromium}/Helpers/${helper}.app/Contents/MacOS/${helper}`);\n    for(const required of requiredRuntime)requireValue(runtimeFiles.some(entry=>entry.path===required),'RUNTIME_FILE_MISSING:'+required);\n    const name='EXODUSER-'+id,stage=path.join(job,'stage'),output=path.join(job,'package'),saveRoot=path.join(job,'user-state/saves'),profile=path.join(job,'user-state/profile');\n    requireValue(path.isAbsolute(profile)&&!/[\\s\"'\\x00-\\x1f\\x7f]/.test(profile),'UNSUPPORTED_PROFILE_ARGUMENT_PATH');\n    const packageInfo=JSON.parse(readFile(path.join(sourceRoot,'package.json')));requireValue(packageInfo.main==='http://localhost:3333/index.html?demo=1'&&packageInfo['node-main']==='node-main.js','PACKAGE_ENTRY_CONTRACT');\n    requireValue(typeof packageInfo['chromium-args']==='string'&&(packageInfo['chromium-args'].match(/--user-data-dir=\\S+/g)||[]).length===1,'PROFILE_CONTRACT');\n    const derivedPackage={name:packageInfo.name,version:packageInfo.version,main:`http://127.0.0.1:${config.port}/index.html?demo=1`,'node-main':'node-main.js','node-remote':[`http://127.0.0.1:${config.port}`,`http://localhost:${config.port}`],window:packageInfo.window,'chromium-args':packageInfo['chromium-args'].replace(/--user-data-dir=\\S+/,`--user-data-dir=${profile}`)};\n    const originalServer=readFile(path.join(sourceRoot,'node-main.js')).toString();const portNeedle='const PORT = 3333;',saveNeedle=\"const SAVE_DIR = path.join(APPDATA, 'EXODUSER-HELL', 'saves');\";\n    requireValue(originalServer.split(portNeedle).length===2&&originalServer.split(saveNeedle).length===2,'SERVER_DERIVATION_CONTRACT');\n    const derivedServer=originalServer.replace(portNeedle,`const PORT = ${config.port};`).replace(saveNeedle,`const SAVE_DIR = ${JSON.stringify(saveRoot)};`);\n    return {status:'READY_PLAN_ONLY',id,job,sourceRoot,inputs,runtimeRoot,runtimeFiles,derivedPackage,derivedServer,backup:config.backup,library:libraryEvidence(),paths:{stage,output,profile,saveRoot},args:{version,flavor:'normal',platform:'osx',arch,srcDir:stage,cacheDir:cacheRoot,outDir:output,glob:false,managedManifest:false,zip:false,releaseInfo,app:{name,CFBundleIdentifier:'com.exoduser.mac.'+id,CFBundleName:name,CFBundleDisplayName:'EXODUSER',CFBundleVersion:'1.0.0',CFBundleShortVersionString:'1.0.0',LSApplicationCategoryType:'public.app-category.games'}},packageCreated:false,limits:['로컬bld내부API고정;최상위getter/manifest/다운로드호출안함','SHA/원격근거는제공된파일목록대조;외부Git조회아님','선택root전체파일커버리지검사;선택root의게임의존성완전성은root승인계약','port는정적격리값;실행직전실제점유검사는별도','서명/코덱/실행검수미완료','프로필/저장절대경로는고유job에귀속;이동/배포계약별도']};\n  }catch(error){return {status:'BLOCKED',error:String(error.message),packageCreated:false};}\n}",
      "sha256": "f3953b76a40e5536cb63a89853c966427c9899d67d64535f69cd8008b7cbb7b4"
    },
    "guardHelpers": [
      {
        "name": "staticSpecifiers",
        "text": "function staticSpecifiers(source){return acorn.parse(source,{ecmaVersion:'latest',sourceType:'module'}).body.filter(n=>['ImportDeclaration','ExportAllDeclaration','ExportNamedDeclaration'].includes(n.type)&&n.source).map(n=>n.source.value);}",
        "sha256": "54bae77ebca0d5e0b0e2ffe8b5bf8d5489352a28efc85ca5178058ef87177eb6"
      },
      {
        "name": "htmlModuleData",
        "text": "function htmlModuleData(html){const maps=[],modules=[];const clean=html.replace(/<!--[\\s\\S]*?-->/g,'');const attr=(tag,name)=>{const m=tag.match(new RegExp('(?:^|\\\\s)'+name+'\\\\s*=\\\\s*(?:\"([^\"]*)\"|\\'([^\\']*)\\'|([^\\\\s>]+))','i'));return m?(m[1]??m[2]??m[3]):null;};for(const m of clean.matchAll(/<script\\b([^>]*)>([\\s\\S]*?)<\\/script\\s*>/gi)){const type=(attr(m[1],'type')||'').toLowerCase();if(type==='importmap')maps.push(JSON.parse(m[2]));else if(type==='module')modules.push({src:attr(m[1],'src'),text:m[2]});}return {imports:Object.assign({},...maps.map(x=>x.imports||{})),modules};}",
        "sha256": "24aaf34ac32f02679eb135dff46a87737aee2ce1baae4779e7e4e126814fb8a9"
      },
      {
        "name": "resolveStaticModule",
        "text": "function resolveStaticModule(specifier,parentFile,imports,htmlFile){\n const baseOrigin='https://module-fixture.invalid/';let value=specifier,base=parentFile;\n if(!/^(?:\\.{0,2}\\/|[a-z][a-z0-9+.-]*:|\\/\\/)/i.test(specifier)){\n  const key=Object.keys(imports).filter(k=>k===specifier||(k.endsWith('/')&&specifier.startsWith(k))).sort((a,b)=>b.length-a.length)[0];\n  if(!key)throw Error('UNMAPPED_STATIC_IMPORT:'+specifier);value=imports[key]+(key.endsWith('/')?specifier.slice(key.length):'');base=htmlFile;\n }\n const url=new URL(value,new URL(base,baseOrigin));if(url.origin!==new URL(baseOrigin).origin)return {external:true,url:url.href};return {external:false,path:decodeURIComponent(url.pathname.slice(1)),url:url.href};\n}",
        "sha256": "b9645a376fe8d4fb1025763905f18ed11ed0b1b0f4adb5628845272f90f8eb33"
      },
      {
        "name": "assertStaticModuleClosure",
        "text": "function assertStaticModuleClosure(sourceRoot,inputs){\n const selected=new Set(inputs.map(x=>x.path));\n for(const input of inputs){if(!/\\.html$/i.test(input.path))continue;const data=htmlModuleData(readFile(path.join(sourceRoot,input.path)).toString()),visited=new Set();\n  function visit(specifier,parentFile){const resolved=resolveStaticModule(specifier,parentFile,data.imports,input.path);if(resolved.external)return;relative(resolved.path);\n   requireValue(selected.has(resolved.path),'REQUIRED_STATIC_MODULE_MISSING:'+input.path+'->'+resolved.path);\n   if(visited.has(resolved.path))return;visited.add(resolved.path);\n   for(const child of staticSpecifiers(readFile(path.join(sourceRoot,resolved.path)).toString()))visit(child,resolved.path);\n  }\n  for(const module of data.modules){if(module.src)visit(module.src,input.path);else for(const specifier of staticSpecifiers(module.text))visit(specifier,input.path);}\n }\n}",
        "sha256": "2dabef247e89b818d04f859bccac38f41cddabdab2770cf03a85c4f254c56ccc"
      }
    ],
    "caller": {
      "importmap": {
        "three": "./assets/vendor/three-r160/build/three.module.js",
        "three/addons/": "./assets/vendor/three-r160/examples/jsm/"
      },
      "importmapFragmentSha256": "13d086cf649bd0d7fbdf074263e746f60602a1aa160de2757f5b1319d80740bd",
      "inlineModules": [
        {
          "index": 0,
          "sha256": "d468c81eedebc513f928fa8631de4fef02a2e44df0246e1e046a9f8baaeb820e",
          "specifiers": [
            "three",
            "three/addons/loaders/GLTFLoader.js"
          ]
        },
        {
          "index": 1,
          "sha256": "308a6047447d0d4bf8384db74012aa8ea3a2622784668708289ad5d7ff523a4c",
          "specifiers": [
            "three",
            "three/addons/loaders/GLTFLoader.js"
          ]
        }
      ]
    }
  },
  "parser": {
    "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/node_modules/acorn/dist/acorn.js",
    "version": "8.16.0",
    "sourceType": "module",
    "ecmaVersion": "latest",
    "scope": "AST top-level ImportDeclaration/Export* with source only. ImportExpression excluded; no module eval."
  },
  "moduleGraph": [
    {
      "parentFile": "game.html",
      "specifier": "three",
      "external": false,
      "path": "assets/vendor/three-r160/build/three.module.js",
      "url": "https://module-fixture.invalid/assets/vendor/three-r160/build/three.module.js"
    },
    {
      "parentFile": "game.html",
      "specifier": "three/addons/loaders/GLTFLoader.js",
      "external": false,
      "path": "assets/vendor/three-r160/examples/jsm/loaders/GLTFLoader.js",
      "url": "https://module-fixture.invalid/assets/vendor/three-r160/examples/jsm/loaders/GLTFLoader.js"
    },
    {
      "parentFile": "assets/vendor/three-r160/examples/jsm/loaders/GLTFLoader.js",
      "specifier": "three",
      "external": false,
      "path": "assets/vendor/three-r160/build/three.module.js",
      "url": "https://module-fixture.invalid/assets/vendor/three-r160/build/three.module.js"
    },
    {
      "parentFile": "assets/vendor/three-r160/examples/jsm/loaders/GLTFLoader.js",
      "specifier": "../utils/BufferGeometryUtils.js",
      "external": false,
      "path": "assets/vendor/three-r160/examples/jsm/utils/BufferGeometryUtils.js",
      "url": "https://module-fixture.invalid/assets/vendor/three-r160/examples/jsm/utils/BufferGeometryUtils.js"
    },
    {
      "parentFile": "assets/vendor/three-r160/examples/jsm/utils/BufferGeometryUtils.js",
      "specifier": "three",
      "external": false,
      "path": "assets/vendor/three-r160/build/three.module.js",
      "url": "https://module-fixture.invalid/assets/vendor/three-r160/build/three.module.js"
    },
    {
      "parentFile": "game.html",
      "specifier": "three",
      "external": false,
      "path": "assets/vendor/three-r160/build/three.module.js",
      "url": "https://module-fixture.invalid/assets/vendor/three-r160/build/three.module.js"
    },
    {
      "parentFile": "game.html",
      "specifier": "three/addons/loaders/GLTFLoader.js",
      "external": false,
      "path": "assets/vendor/three-r160/examples/jsm/loaders/GLTFLoader.js",
      "url": "https://module-fixture.invalid/assets/vendor/three-r160/examples/jsm/loaders/GLTFLoader.js"
    }
  ],
  "target": "assets/vendor/three-r160/examples/jsm/loaders/GLTFLoader.js",
  "configuration": {
    "normal": {
      "sourceRoot": "/memory/project",
      "outputRoot": "/memory/output",
      "arch": "arm64",
      "id": "00000000-0000-4000-8000-000000000002",
      "port": 3389,
      "inputRoots": [
        "assets/vendor/three-r160/build/three.module.js",
        "assets/vendor/three-r160/examples/jsm/loaders/GLTFLoader.js",
        "assets/vendor/three-r160/examples/jsm/utils/BufferGeometryUtils.js",
        "game.html",
        "index.html",
        "node-main.js",
        "package.json"
      ],
      "inputs": [
        {
          "path": "assets/vendor/three-r160/build/three.module.js",
          "sha256": "76dea8151bc9352aef3528b4262e249b2604f62543828328db978d060d61a495"
        },
        {
          "path": "assets/vendor/three-r160/examples/jsm/loaders/GLTFLoader.js",
          "sha256": "d073b438e6a07e1359741dd5d6c76c953420cc0d4fd84eb1bdde94315540e6a3"
        },
        {
          "path": "assets/vendor/three-r160/examples/jsm/utils/BufferGeometryUtils.js",
          "sha256": "9be041e96308775d00e2695cc607645b9a9b64fd7c0e759dd8f7c00a8d92becb"
        },
        {
          "path": "game.html",
          "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b"
        },
        {
          "path": "index.html",
          "sha256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8"
        },
        {
          "path": "node-main.js",
          "sha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3"
        },
        {
          "path": "package.json",
          "sha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8"
        }
      ],
      "backup": {
        "sha": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        "remoteSha": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        "remoteRef": "refs/heads/memory-module-fixture-only",
        "verifiedAt": "2026-10-02T11:05:09.272Z",
        "inputs": [
          {
            "path": "assets/vendor/three-r160/build/three.module.js",
            "sha256": "76dea8151bc9352aef3528b4262e249b2604f62543828328db978d060d61a495"
          },
          {
            "path": "assets/vendor/three-r160/examples/jsm/loaders/GLTFLoader.js",
            "sha256": "d073b438e6a07e1359741dd5d6c76c953420cc0d4fd84eb1bdde94315540e6a3"
          },
          {
            "path": "assets/vendor/three-r160/examples/jsm/utils/BufferGeometryUtils.js",
            "sha256": "9be041e96308775d00e2695cc607645b9a9b64fd7c0e759dd8f7c00a8d92becb"
          },
          {
            "path": "game.html",
            "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b"
          },
          {
            "path": "index.html",
            "sha256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8"
          },
          {
            "path": "node-main.js",
            "sha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3"
          },
          {
            "path": "package.json",
            "sha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8"
          }
        ]
      },
      "runtime": {
        "cacheRoot": "/memory/cache",
        "releaseInfoPath": "/memory/release.json",
        "releaseInfoSha256": "2d4127eec1ff90a71cbb1362aa1011de7993a8992e90c2c419f79e4d2fa3c706",
        "files": [
          {
            "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/Info.plist",
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/MacOS/nwjs Helper (Alerts)",
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/Info.plist",
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/MacOS/nwjs Helper (GPU)",
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/Info.plist",
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/MacOS/nwjs Helper (Renderer)",
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/Info.plist",
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/MacOS/nwjs Helper",
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "path": "nwjs.app/Contents/Info.plist",
            "sha256": "5d99d608ee66038a298430ccfe32a97b0ea667c863128c63d0fce102fdff5d18"
          },
          {
            "path": "nwjs.app/Contents/MacOS/nwjs",
            "sha256": "6eca5cc86a53c80d74e777fffd48ee46b98f06a8b448d18106af49ac0862b875"
          },
          {
            "path": "nwjs.app/Contents/Resources/en.lproj/InfoPlist.strings",
            "sha256": "5d99d608ee66038a298430ccfe32a97b0ea667c863128c63d0fce102fdff5d18"
          }
        ]
      }
    },
    "missing": {
      "sourceRoot": "/memory/project",
      "outputRoot": "/memory/output",
      "arch": "arm64",
      "id": "00000000-0000-4000-8000-000000000002",
      "port": 3389,
      "inputRoots": [
        "assets/vendor/three-r160/build/three.module.js",
        "assets/vendor/three-r160/examples/jsm/utils/BufferGeometryUtils.js",
        "game.html",
        "index.html",
        "node-main.js",
        "package.json"
      ],
      "inputs": [
        {
          "path": "assets/vendor/three-r160/build/three.module.js",
          "sha256": "76dea8151bc9352aef3528b4262e249b2604f62543828328db978d060d61a495"
        },
        {
          "path": "assets/vendor/three-r160/examples/jsm/utils/BufferGeometryUtils.js",
          "sha256": "9be041e96308775d00e2695cc607645b9a9b64fd7c0e759dd8f7c00a8d92becb"
        },
        {
          "path": "game.html",
          "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b"
        },
        {
          "path": "index.html",
          "sha256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8"
        },
        {
          "path": "node-main.js",
          "sha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3"
        },
        {
          "path": "package.json",
          "sha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8"
        }
      ],
      "backup": {
        "sha": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        "remoteSha": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        "remoteRef": "refs/heads/memory-module-fixture-only",
        "verifiedAt": "2026-10-02T11:05:09.272Z",
        "inputs": [
          {
            "path": "assets/vendor/three-r160/build/three.module.js",
            "sha256": "76dea8151bc9352aef3528b4262e249b2604f62543828328db978d060d61a495"
          },
          {
            "path": "assets/vendor/three-r160/examples/jsm/utils/BufferGeometryUtils.js",
            "sha256": "9be041e96308775d00e2695cc607645b9a9b64fd7c0e759dd8f7c00a8d92becb"
          },
          {
            "path": "game.html",
            "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b"
          },
          {
            "path": "index.html",
            "sha256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8"
          },
          {
            "path": "node-main.js",
            "sha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3"
          },
          {
            "path": "package.json",
            "sha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8"
          }
        ]
      },
      "runtime": {
        "cacheRoot": "/memory/cache",
        "releaseInfoPath": "/memory/release.json",
        "releaseInfoSha256": "2d4127eec1ff90a71cbb1362aa1011de7993a8992e90c2c419f79e4d2fa3c706",
        "files": [
          {
            "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/Info.plist",
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/MacOS/nwjs Helper (Alerts)",
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/Info.plist",
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/MacOS/nwjs Helper (GPU)",
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/Info.plist",
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/MacOS/nwjs Helper (Renderer)",
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/Info.plist",
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/MacOS/nwjs Helper",
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "path": "nwjs.app/Contents/Info.plist",
            "sha256": "5d99d608ee66038a298430ccfe32a97b0ea667c863128c63d0fce102fdff5d18"
          },
          {
            "path": "nwjs.app/Contents/MacOS/nwjs",
            "sha256": "6eca5cc86a53c80d74e777fffd48ee46b98f06a8b448d18106af49ac0862b875"
          },
          {
            "path": "nwjs.app/Contents/Resources/en.lproj/InfoPlist.strings",
            "sha256": "5d99d608ee66038a298430ccfe32a97b0ea667c863128c63d0fce102fdff5d18"
          }
        ]
      }
    }
  },
  "outcomes": {
    "missing": {
      "current": {
        "result": {
          "status": "READY_PLAN_ONLY",
          "id": "00000000-0000-4000-8000-000000000002",
          "job": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000002",
          "sourceRoot": "/memory/project",
          "inputs": [
            {
              "path": "assets/vendor/three-r160/build/three.module.js",
              "sha256": "76dea8151bc9352aef3528b4262e249b2604f62543828328db978d060d61a495"
            },
            {
              "path": "assets/vendor/three-r160/examples/jsm/utils/BufferGeometryUtils.js",
              "sha256": "9be041e96308775d00e2695cc607645b9a9b64fd7c0e759dd8f7c00a8d92becb"
            },
            {
              "path": "game.html",
              "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b"
            },
            {
              "path": "index.html",
              "sha256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8"
            },
            {
              "path": "node-main.js",
              "sha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3"
            },
            {
              "path": "package.json",
              "sha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8"
            }
          ],
          "runtimeRoot": "/memory/cache/nwjs-v0.111.2-osx-arm64",
          "runtimeFiles": [
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/Info.plist",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/MacOS/nwjs Helper (Alerts)",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/Info.plist",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/MacOS/nwjs Helper (GPU)",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/Info.plist",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/MacOS/nwjs Helper (Renderer)",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/Info.plist",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/MacOS/nwjs Helper",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Info.plist",
              "sha256": "5d99d608ee66038a298430ccfe32a97b0ea667c863128c63d0fce102fdff5d18"
            },
            {
              "path": "nwjs.app/Contents/MacOS/nwjs",
              "sha256": "6eca5cc86a53c80d74e777fffd48ee46b98f06a8b448d18106af49ac0862b875"
            },
            {
              "path": "nwjs.app/Contents/Resources/en.lproj/InfoPlist.strings",
              "sha256": "5d99d608ee66038a298430ccfe32a97b0ea667c863128c63d0fce102fdff5d18"
            }
          ],
          "derivedPackage": {
            "name": "hell-exoduser-release",
            "version": "1.0.0",
            "main": "http://127.0.0.1:3389/index.html?demo=1",
            "node-main": "node-main.js",
            "node-remote": [
              "http://127.0.0.1:3389",
              "http://localhost:3389"
            ],
            "window": {
              "title": "EXODUSER: HELL LORD",
              "width": 1920,
              "height": 1080,
              "min_width": 1280,
              "min_height": 720,
              "fullscreen": true,
              "resizable": true,
              "frame": false,
              "toolbar": false
            },
            "chromium-args": "--disable-features=CrossOriginOpenerPolicy,CrossOriginEmbedderPolicy,IsolateOrigins,SitePerProcess,SkiaGraphite --disable-site-isolation-trials --disable-web-security --no-sandbox --ignore-gpu-blocklist --enable-gpu-rasterization --allow-running-insecure-content --autoplay-policy=no-user-gesture-required --enable-features=SharedArrayBuffer --user-data-dir=/memory/output/mac-packager-00000000-0000-4000-8000-000000000002/user-state/profile"
          },
          "derivedServer": "// NW.js node-main: 정적 파일 서버 + OAuth 라우트 (정식버전, port 3333)\nconst http = require('http');\nconst fs = require('fs');\nconst path = require('path');\nconst urlMod = require('url');\n\nconst LOG_FILE = path.join(__dirname, 'oauth-debug.log');\nfunction dlog(msg) {\n  try {\n    const line = '[' + new Date().toISOString() + '] ' + msg + '\\n';\n    fs.appendFileSync(LOG_FILE, line);\n  } catch (e) {}\n}\ndlog('=== EXODUSER RELEASE Server started ===');\n\nconst PORT = 3389;\nconst APP_DIR = __dirname;\n\nconst MIME = {\n  '.vtt': 'text/vtt; charset=utf-8',\n  '.html': 'text/html; charset=utf-8',\n  '.js':   'application/javascript',\n  '.css':  'text/css',\n  '.png':  'image/png',\n  '.jpg':  'image/jpeg',\n  '.jpeg': 'image/jpeg',\n  '.svg':  'image/svg+xml',\n  '.ico':  'image/x-icon',\n  '.json': 'application/json',\n  '.woff': 'font/woff',\n  '.woff2':'font/woff2',\n  '.mp3':  'audio/mpeg',\n  '.ogg':  'audio/ogg',\n  '.wav':  'audio/wav',\n  '.mp4':  'video/mp4',\n  '.webm': 'video/webm',\n  '.gif':  'image/gif',\n};\n\n// OAuth 토큰 저장소 (메모리, 단일 세션) — Supabase: access_token + refresh_token\nlet _oauthTokens = null;\nlet _oauthError = null;\n\n// 세이브 폴더: %APPDATA%\\EXODUSER-HELL\\saves\\ (EA와 동일 경로 공유)\nconst APPDATA = process.env.APPDATA || require('os').homedir();\nconst SAVE_DIR = \"/memory/output/mac-packager-00000000-0000-4000-8000-000000000002/user-state/saves\";\nif (!fs.existsSync(SAVE_DIR)) fs.mkdirSync(SAVE_DIR, { recursive: true });\n\nfunction sanitizeSlot(name) {\n  return String(name).replace(/[^a-zA-Z0-9가-힣_\\-]/g, '_').slice(0, 50);\n}\nfunction sendJSON(res, status, data) {\n  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });\n  res.end(JSON.stringify(data));\n}\nfunction readBody(req) {\n  return new Promise((resolve, reject) => {\n    const chunks = [];\n    req.on('data', c => chunks.push(c));\n    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString())); } catch(e){ reject(e); } });\n    req.on('error', reject);\n  });\n}\n\nhttp.createServer(async (req, res) => {\n  let pathname = urlMod.parse(req.url).pathname;\n\n  // CORS preflight\n  if (req.method === 'OPTIONS') {\n    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });\n    return res.end();\n  }\n\n  // ── OAuth 라우트 ──\n  if (pathname === '/oauth-callback') {\n    dlog('oauth-callback hit: ' + req.url);\n    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });\n    res.end('<!DOCTYPE html><meta charset=utf-8><title>EXODUSER Login</title><style>html,body{background:#0a0004;color:#fff;font-family:-apple-system,sans-serif;margin:0;height:100%;overflow:hidden}.box{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh}.s{width:48px;height:48px;border:4px solid #cc3300;border-top-color:transparent;border-radius:50%;animation:r 1s linear infinite;margin-bottom:24px}@keyframes r{to{transform:rotate(360deg)}}h2{color:#cc3300;font-size:1.5rem;margin:0 0 8px}p{color:#aaa;margin:4px 0}.ok{color:#00ff88}.err{color:#ff5577}.cd{color:#ffcc44;font-size:0.85rem;margin-top:16px}</style><div class=box><div class=s id=spin></div><h2 id=t>로그인 처리 중...</h2><p id=m>잠시만 기다려주세요</p><div class=cd id=cd></div></div><script>(function(){var h=new URLSearchParams(location.hash.slice(1));var at=h.get(\"access_token\"),rt=h.get(\"refresh_token\"),e=h.get(\"error\");var payload=e?{error:e}:(at?{access_token:at,refresh_token:rt||\"\"}:{error:\"no_token\"});fetch(\"/oauth-deposit\",{method:\"POST\",headers:{\"Content-Type\":\"application/json\"},body:JSON.stringify(payload)}).then(function(){var ti=document.getElementById(\"t\"),me=document.getElementById(\"m\"),sp=document.getElementById(\"spin\"),cd=document.getElementById(\"cd\");if(e||!at){sp.style.display=\"none\";ti.className=\"err\";ti.textContent=\"로그인 실패\";me.textContent=e||\"토큰 없음\";return}sp.style.display=\"none\";ti.className=\"ok\";ti.textContent=\"✓ 로그인 완료\";me.textContent=\"게임으로 돌아갑니다\";var n=3;function tick(){if(n>0){cd.textContent=n+\"초 후 이 창이 닫힙니다\";n--;setTimeout(tick,1000)}else{try{window.close()}catch(_){}}}tick()})})()</script>');\n    return;\n  }\n\n  if (pathname === '/oauth-deposit' && req.method === 'POST') {\n    dlog('oauth-deposit POST received');\n    let body = '';\n    req.on('data', c => body += c);\n    req.on('end', () => {\n      try {\n        const d = JSON.parse(body);\n        if (d.error) { _oauthError = d.error; _oauthTokens = null; dlog('deposit error: ' + d.error); }\n        else { _oauthTokens = { access_token: d.access_token, refresh_token: d.refresh_token }; _oauthError = null; dlog('deposit tokens OK at_len=' + (d.access_token ? d.access_token.length : 0)); }\n        res.writeHead(200, { 'Content-Type': 'application/json' });\n        res.end('{\"ok\":true}');\n      } catch(e) { res.writeHead(400); res.end('{\"ok\":false}'); }\n    });\n    return;\n  }\n\n  if (pathname === '/oauth-poll') {\n    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });\n    if (_oauthTokens) {\n      const t = _oauthTokens; _oauthTokens = null;\n      dlog('poll: tokens delivered');\n      res.end(JSON.stringify({ access_token: t.access_token, refresh_token: t.refresh_token }));\n    } else if (_oauthError) {\n      const e = _oauthError; _oauthError = null;\n      res.end(JSON.stringify({ error: e }));\n    } else {\n      res.end('{}');\n    }\n    return;\n  }\n\n  // ── 세이브 API ──\n  if (pathname === '/api/slots' && req.method === 'GET') {\n    const files = fs.readdirSync(SAVE_DIR).filter(f => f.endsWith('.json') && !f.startsWith('_'));\n    const slots = files.map(f => {\n      try {\n        const d = JSON.parse(fs.readFileSync(path.join(SAVE_DIR, f), 'utf8'));\n        return { name: f.replace('.json',''), ts: d.ts||0, lv: d.player?.lv||1, stage: d.game?.stage||0, kills: d.game?.kills||0, charIdx: d.charIdx??0 };\n      } catch { return null; }\n    }).filter(Boolean);\n    return sendJSON(res, 200, { ok: true, slots });\n  }\n\n  if (pathname === '/api/save' && req.method === 'POST') {\n    let body, slot;\n    try {\n      body = await readBody(req);\n      slot = sanitizeSlot(body.slot || 'default');\n      if (body.data) fs.writeFileSync(path.join(SAVE_DIR, slot + '.json'), JSON.stringify(body.data, null, 2), 'utf8');\n    } catch (error) {\n      return sendJSON(res, 500, { ok: false, error: 'Internal Server Error' });\n    }\n    if (!body.data) return sendJSON(res, 400, { ok: false, error: 'No data' });\n    return sendJSON(res, 200, { ok: true, slot });\n  }\n\n  if (pathname.startsWith('/api/load/') && req.method === 'GET') {\n    const slot = sanitizeSlot(decodeURIComponent(pathname.slice(10)));\n    const fp = path.join(SAVE_DIR, slot + '.json');\n    if (!fs.existsSync(fp)) return sendJSON(res, 404, { ok: false, error: 'Not found' });\n    return sendJSON(res, 200, { ok: true, data: JSON.parse(fs.readFileSync(fp, 'utf8')) });\n  }\n\n  if (pathname.startsWith('/api/save/') && req.method === 'DELETE') {\n    const slot = sanitizeSlot(decodeURIComponent(pathname.slice(10)));\n    const fp = path.join(SAVE_DIR, slot + '.json');\n    if (fs.existsSync(fp)) fs.unlinkSync(fp);\n    return sendJSON(res, 200, { ok: true });\n  }\n\n  // ── 정적 파일 서빙 ──\n  // 개발 서버와 동일한 공유 악의 저장 계약. 캐릭터 슬롯과 분리한다.\n  const MATS_FILE = path.join(SAVE_DIR, '_sharedMats.json');\n  if (pathname === '/api/mats' && req.method === 'GET') {\n    try {\n      if (fs.existsSync(MATS_FILE)) {\n        const d = JSON.parse(fs.readFileSync(MATS_FILE, 'utf8'));\n        return sendJSON(res, 200, { ok: true, mats: d.mats || 0 });\n      }\n    } catch (e) {}\n    return sendJSON(res, 200, { ok: true, mats: 0 });\n  }\n  if (pathname === '/api/mats' && req.method === 'POST') {\n    let n;\n    try {\n      const body = await readBody(req);\n      n = Math.max(0, Math.min(Math.floor(+body.mats || 0), Number.MAX_SAFE_INTEGER));\n      fs.writeFileSync(MATS_FILE, JSON.stringify({ mats: n, ts: Date.now() }), 'utf8');\n    } catch (error) {\n      return sendJSON(res, 500, { ok: false, error: 'Internal Server Error' });\n    }\n    return sendJSON(res, 200, { ok: true, mats: n });\n  }\n\n  if (pathname === '/' || pathname === '') pathname = '/index.html';\n  const filePath = path.join(APP_DIR, decodeURIComponent(pathname).replace(/\\.\\./g, ''));\n\n  if (req.headers?.range) {\n    fs.stat(filePath, (err, stat) => {\n      if (err || !stat.isFile()) { res.writeHead(404); return res.end(); }\n      const match = /^bytes=(\\d*)-(\\d*)$/.exec(req.headers.range);\n      let start = match?.[1] ? Number(match[1]) : 0;\n      let end = match?.[2] ? Math.min(Number(match[2]), stat.size - 1) : stat.size - 1;\n      if (match && !match[1] && match[2]) { start = Math.max(0, stat.size - Number(match[2])); end = stat.size - 1; }\n      if (!match || (!match[1] && !match[2]) || !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= stat.size || start > end) {\n        res.writeHead(416, { 'Content-Range': `bytes */${stat.size}`, 'Access-Control-Allow-Origin': '*' });\n        return res.end();\n      }\n      res.writeHead(206, {\n        'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Accept-Ranges': 'bytes',\n        'Content-Length': end-start+1, 'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',\n        'Access-Control-Allow-Origin': '*',\n      });\n      if (req.method === 'HEAD') return res.end();\n      const stream = fs.createReadStream(filePath, { start, end });\n      stream.on('error', () => res.destroy());\n      res.on('close', () => stream.destroy());\n      stream.pipe(res);\n    });\n    return;\n  }\n\n  fs.readFile(filePath, (err, data) => {\n    if (err) { res.writeHead(404); res.end('Not found: ' + pathname); return; }\n    const ext = path.extname(filePath).toLowerCase();\n    const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Content-Length': data.length, 'Accept-Ranges': 'bytes', 'Access-Control-Allow-Origin': '*' };\n    if (ext === '.html') headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';\n    res.writeHead(200, headers);\n    res.end(req.method === 'HEAD' ? undefined : data);\n  });\n}).listen(PORT, '127.0.0.1', () => {\n  dlog('HTTP server listening on port ' + PORT);\n});\n",
          "backup": {
            "sha": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
            "remoteSha": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
            "remoteRef": "refs/heads/memory-module-fixture-only",
            "verifiedAt": "2026-10-02T11:05:09.272Z",
            "inputs": [
              {
                "path": "assets/vendor/three-r160/build/three.module.js",
                "sha256": "76dea8151bc9352aef3528b4262e249b2604f62543828328db978d060d61a495"
              },
              {
                "path": "assets/vendor/three-r160/examples/jsm/utils/BufferGeometryUtils.js",
                "sha256": "9be041e96308775d00e2695cc607645b9a9b64fd7c0e759dd8f7c00a8d92becb"
              },
              {
                "path": "game.html",
                "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b"
              },
              {
                "path": "index.html",
                "sha256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8"
              },
              {
                "path": "node-main.js",
                "sha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3"
              },
              {
                "path": "package.json",
                "sha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8"
              }
            ]
          },
          "library": {
            "version": "4.17.10",
            "entry": "/memory/library/index.js",
            "buildEntry": "/memory/library/bld.js",
            "files": [],
            "fixtureOnly": true
          },
          "paths": {
            "stage": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000002/stage",
            "output": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000002/package",
            "profile": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000002/user-state/profile",
            "saveRoot": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000002/user-state/saves"
          },
          "args": {
            "version": "0.111.2",
            "flavor": "normal",
            "platform": "osx",
            "arch": "arm64",
            "srcDir": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000002/stage",
            "cacheDir": "/memory/cache",
            "outDir": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000002/package",
            "glob": false,
            "managedManifest": false,
            "zip": false,
            "releaseInfo": {
              "version": "v0.111.2",
              "components": {
                "chromium": "148.0.7778.97"
              }
            },
            "app": {
              "name": "EXODUSER-00000000-0000-4000-8000-000000000002",
              "CFBundleIdentifier": "com.exoduser.mac.00000000-0000-4000-8000-000000000002",
              "CFBundleName": "EXODUSER-00000000-0000-4000-8000-000000000002",
              "CFBundleDisplayName": "EXODUSER",
              "CFBundleVersion": "1.0.0",
              "CFBundleShortVersionString": "1.0.0",
              "LSApplicationCategoryType": "public.app-category.games"
            }
          },
          "packageCreated": false,
          "limits": [
            "로컬bld내부API고정;최상위getter/manifest/다운로드호출안함",
            "SHA/원격근거는제공된파일목록대조;외부Git조회아님",
            "선택root전체파일커버리지검사;선택root의게임의존성완전성은root승인계약",
            "port는정적격리값;실행직전실제점유검사는별도",
            "서명/코덱/실행검수미완료",
            "프로필/저장절대경로는고유job에귀속;이동/배포계약별도"
          ]
        },
        "trace": [
          {
            "op": "open",
            "path": "/memory/project/assets/vendor/three-r160/build/three.module.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/assets/vendor/three-r160/build/three.module.js",
            "bytes": 1272972,
            "sha256": "76dea8151bc9352aef3528b4262e249b2604f62543828328db978d060d61a495"
          },
          {
            "op": "close",
            "path": "/memory/project/assets/vendor/three-r160/build/three.module.js"
          },
          {
            "op": "open",
            "path": "/memory/project/assets/vendor/three-r160/examples/jsm/utils/BufferGeometryUtils.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/assets/vendor/three-r160/examples/jsm/utils/BufferGeometryUtils.js",
            "bytes": 31906,
            "sha256": "9be041e96308775d00e2695cc607645b9a9b64fd7c0e759dd8f7c00a8d92becb"
          },
          {
            "op": "close",
            "path": "/memory/project/assets/vendor/three-r160/examples/jsm/utils/BufferGeometryUtils.js"
          },
          {
            "op": "open",
            "path": "/memory/project/game.html",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/game.html",
            "bytes": 4028178,
            "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b"
          },
          {
            "op": "close",
            "path": "/memory/project/game.html"
          },
          {
            "op": "open",
            "path": "/memory/project/index.html",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/index.html",
            "bytes": 342046,
            "sha256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8"
          },
          {
            "op": "close",
            "path": "/memory/project/index.html"
          },
          {
            "op": "open",
            "path": "/memory/project/node-main.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/node-main.js",
            "bytes": 10429,
            "sha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3"
          },
          {
            "op": "close",
            "path": "/memory/project/node-main.js"
          },
          {
            "op": "open",
            "path": "/memory/project/package.json",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/package.json",
            "bytes": 2040,
            "sha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8"
          },
          {
            "op": "close",
            "path": "/memory/project/package.json"
          },
          {
            "op": "open",
            "path": "/memory/release.json",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/release.json",
            "bytes": 64,
            "sha256": "2d4127eec1ff90a71cbb1362aa1011de7993a8992e90c2c419f79e4d2fa3c706"
          },
          {
            "op": "close",
            "path": "/memory/release.json"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/Info.plist",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/Info.plist",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/Info.plist"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/MacOS/nwjs Helper (Alerts)",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/MacOS/nwjs Helper (Alerts)",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/MacOS/nwjs Helper (Alerts)"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/Info.plist",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/Info.plist",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/Info.plist"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/MacOS/nwjs Helper (GPU)",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/MacOS/nwjs Helper (GPU)",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/MacOS/nwjs Helper (GPU)"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/Info.plist",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/Info.plist",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/Info.plist"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/MacOS/nwjs Helper (Renderer)",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/MacOS/nwjs Helper (Renderer)",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/MacOS/nwjs Helper (Renderer)"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/Info.plist",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/Info.plist",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/Info.plist"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/MacOS/nwjs Helper",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/MacOS/nwjs Helper",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/MacOS/nwjs Helper"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Info.plist",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Info.plist",
            "bytes": 25,
            "sha256": "5d99d608ee66038a298430ccfe32a97b0ea667c863128c63d0fce102fdff5d18"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Info.plist"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/MacOS/nwjs",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/MacOS/nwjs",
            "bytes": 8,
            "sha256": "6eca5cc86a53c80d74e777fffd48ee46b98f06a8b448d18106af49ac0862b875"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/MacOS/nwjs"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Resources/en.lproj/InfoPlist.strings",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Resources/en.lproj/InfoPlist.strings",
            "bytes": 25,
            "sha256": "5d99d608ee66038a298430ccfe32a97b0ea667c863128c63d0fce102fdff5d18"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Resources/en.lproj/InfoPlist.strings"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/MacOS/nwjs",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/MacOS/nwjs",
            "bytes": 8,
            "sha256": "6eca5cc86a53c80d74e777fffd48ee46b98f06a8b448d18106af49ac0862b875"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/MacOS/nwjs"
          },
          {
            "op": "open",
            "path": "/memory/project/package.json",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/package.json",
            "bytes": 2040,
            "sha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8"
          },
          {
            "op": "close",
            "path": "/memory/project/package.json"
          },
          {
            "op": "open",
            "path": "/memory/project/node-main.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/node-main.js",
            "bytes": 10429,
            "sha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3"
          },
          {
            "op": "close",
            "path": "/memory/project/node-main.js"
          }
        ],
        "outstandingDescriptors": 0
      },
      "candidate": {
        "result": {
          "status": "BLOCKED",
          "error": "REQUIRED_STATIC_MODULE_MISSING:game.html->assets/vendor/three-r160/examples/jsm/loaders/GLTFLoader.js",
          "packageCreated": false
        },
        "trace": [
          {
            "op": "open",
            "path": "/memory/project/assets/vendor/three-r160/build/three.module.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/assets/vendor/three-r160/build/three.module.js",
            "bytes": 1272972,
            "sha256": "76dea8151bc9352aef3528b4262e249b2604f62543828328db978d060d61a495"
          },
          {
            "op": "close",
            "path": "/memory/project/assets/vendor/three-r160/build/three.module.js"
          },
          {
            "op": "open",
            "path": "/memory/project/assets/vendor/three-r160/examples/jsm/utils/BufferGeometryUtils.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/assets/vendor/three-r160/examples/jsm/utils/BufferGeometryUtils.js",
            "bytes": 31906,
            "sha256": "9be041e96308775d00e2695cc607645b9a9b64fd7c0e759dd8f7c00a8d92becb"
          },
          {
            "op": "close",
            "path": "/memory/project/assets/vendor/three-r160/examples/jsm/utils/BufferGeometryUtils.js"
          },
          {
            "op": "open",
            "path": "/memory/project/game.html",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/game.html",
            "bytes": 4028178,
            "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b"
          },
          {
            "op": "close",
            "path": "/memory/project/game.html"
          },
          {
            "op": "open",
            "path": "/memory/project/index.html",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/index.html",
            "bytes": 342046,
            "sha256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8"
          },
          {
            "op": "close",
            "path": "/memory/project/index.html"
          },
          {
            "op": "open",
            "path": "/memory/project/node-main.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/node-main.js",
            "bytes": 10429,
            "sha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3"
          },
          {
            "op": "close",
            "path": "/memory/project/node-main.js"
          },
          {
            "op": "open",
            "path": "/memory/project/package.json",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/package.json",
            "bytes": 2040,
            "sha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8"
          },
          {
            "op": "close",
            "path": "/memory/project/package.json"
          },
          {
            "op": "open",
            "path": "/memory/project/game.html",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/game.html",
            "bytes": 4028178,
            "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b"
          },
          {
            "op": "close",
            "path": "/memory/project/game.html"
          },
          {
            "op": "open",
            "path": "/memory/project/assets/vendor/three-r160/build/three.module.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/assets/vendor/three-r160/build/three.module.js",
            "bytes": 1272972,
            "sha256": "76dea8151bc9352aef3528b4262e249b2604f62543828328db978d060d61a495"
          },
          {
            "op": "close",
            "path": "/memory/project/assets/vendor/three-r160/build/three.module.js"
          }
        ],
        "outstandingDescriptors": 0
      }
    },
    "normal": {
      "current": {
        "result": {
          "status": "READY_PLAN_ONLY",
          "id": "00000000-0000-4000-8000-000000000002",
          "job": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000002",
          "sourceRoot": "/memory/project",
          "inputs": [
            {
              "path": "assets/vendor/three-r160/build/three.module.js",
              "sha256": "76dea8151bc9352aef3528b4262e249b2604f62543828328db978d060d61a495"
            },
            {
              "path": "assets/vendor/three-r160/examples/jsm/loaders/GLTFLoader.js",
              "sha256": "d073b438e6a07e1359741dd5d6c76c953420cc0d4fd84eb1bdde94315540e6a3"
            },
            {
              "path": "assets/vendor/three-r160/examples/jsm/utils/BufferGeometryUtils.js",
              "sha256": "9be041e96308775d00e2695cc607645b9a9b64fd7c0e759dd8f7c00a8d92becb"
            },
            {
              "path": "game.html",
              "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b"
            },
            {
              "path": "index.html",
              "sha256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8"
            },
            {
              "path": "node-main.js",
              "sha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3"
            },
            {
              "path": "package.json",
              "sha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8"
            }
          ],
          "runtimeRoot": "/memory/cache/nwjs-v0.111.2-osx-arm64",
          "runtimeFiles": [
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/Info.plist",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/MacOS/nwjs Helper (Alerts)",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/Info.plist",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/MacOS/nwjs Helper (GPU)",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/Info.plist",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/MacOS/nwjs Helper (Renderer)",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/Info.plist",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/MacOS/nwjs Helper",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Info.plist",
              "sha256": "5d99d608ee66038a298430ccfe32a97b0ea667c863128c63d0fce102fdff5d18"
            },
            {
              "path": "nwjs.app/Contents/MacOS/nwjs",
              "sha256": "6eca5cc86a53c80d74e777fffd48ee46b98f06a8b448d18106af49ac0862b875"
            },
            {
              "path": "nwjs.app/Contents/Resources/en.lproj/InfoPlist.strings",
              "sha256": "5d99d608ee66038a298430ccfe32a97b0ea667c863128c63d0fce102fdff5d18"
            }
          ],
          "derivedPackage": {
            "name": "hell-exoduser-release",
            "version": "1.0.0",
            "main": "http://127.0.0.1:3389/index.html?demo=1",
            "node-main": "node-main.js",
            "node-remote": [
              "http://127.0.0.1:3389",
              "http://localhost:3389"
            ],
            "window": {
              "title": "EXODUSER: HELL LORD",
              "width": 1920,
              "height": 1080,
              "min_width": 1280,
              "min_height": 720,
              "fullscreen": true,
              "resizable": true,
              "frame": false,
              "toolbar": false
            },
            "chromium-args": "--disable-features=CrossOriginOpenerPolicy,CrossOriginEmbedderPolicy,IsolateOrigins,SitePerProcess,SkiaGraphite --disable-site-isolation-trials --disable-web-security --no-sandbox --ignore-gpu-blocklist --enable-gpu-rasterization --allow-running-insecure-content --autoplay-policy=no-user-gesture-required --enable-features=SharedArrayBuffer --user-data-dir=/memory/output/mac-packager-00000000-0000-4000-8000-000000000002/user-state/profile"
          },
          "derivedServer": "// NW.js node-main: 정적 파일 서버 + OAuth 라우트 (정식버전, port 3333)\nconst http = require('http');\nconst fs = require('fs');\nconst path = require('path');\nconst urlMod = require('url');\n\nconst LOG_FILE = path.join(__dirname, 'oauth-debug.log');\nfunction dlog(msg) {\n  try {\n    const line = '[' + new Date().toISOString() + '] ' + msg + '\\n';\n    fs.appendFileSync(LOG_FILE, line);\n  } catch (e) {}\n}\ndlog('=== EXODUSER RELEASE Server started ===');\n\nconst PORT = 3389;\nconst APP_DIR = __dirname;\n\nconst MIME = {\n  '.vtt': 'text/vtt; charset=utf-8',\n  '.html': 'text/html; charset=utf-8',\n  '.js':   'application/javascript',\n  '.css':  'text/css',\n  '.png':  'image/png',\n  '.jpg':  'image/jpeg',\n  '.jpeg': 'image/jpeg',\n  '.svg':  'image/svg+xml',\n  '.ico':  'image/x-icon',\n  '.json': 'application/json',\n  '.woff': 'font/woff',\n  '.woff2':'font/woff2',\n  '.mp3':  'audio/mpeg',\n  '.ogg':  'audio/ogg',\n  '.wav':  'audio/wav',\n  '.mp4':  'video/mp4',\n  '.webm': 'video/webm',\n  '.gif':  'image/gif',\n};\n\n// OAuth 토큰 저장소 (메모리, 단일 세션) — Supabase: access_token + refresh_token\nlet _oauthTokens = null;\nlet _oauthError = null;\n\n// 세이브 폴더: %APPDATA%\\EXODUSER-HELL\\saves\\ (EA와 동일 경로 공유)\nconst APPDATA = process.env.APPDATA || require('os').homedir();\nconst SAVE_DIR = \"/memory/output/mac-packager-00000000-0000-4000-8000-000000000002/user-state/saves\";\nif (!fs.existsSync(SAVE_DIR)) fs.mkdirSync(SAVE_DIR, { recursive: true });\n\nfunction sanitizeSlot(name) {\n  return String(name).replace(/[^a-zA-Z0-9가-힣_\\-]/g, '_').slice(0, 50);\n}\nfunction sendJSON(res, status, data) {\n  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });\n  res.end(JSON.stringify(data));\n}\nfunction readBody(req) {\n  return new Promise((resolve, reject) => {\n    const chunks = [];\n    req.on('data', c => chunks.push(c));\n    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString())); } catch(e){ reject(e); } });\n    req.on('error', reject);\n  });\n}\n\nhttp.createServer(async (req, res) => {\n  let pathname = urlMod.parse(req.url).pathname;\n\n  // CORS preflight\n  if (req.method === 'OPTIONS') {\n    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });\n    return res.end();\n  }\n\n  // ── OAuth 라우트 ──\n  if (pathname === '/oauth-callback') {\n    dlog('oauth-callback hit: ' + req.url);\n    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });\n    res.end('<!DOCTYPE html><meta charset=utf-8><title>EXODUSER Login</title><style>html,body{background:#0a0004;color:#fff;font-family:-apple-system,sans-serif;margin:0;height:100%;overflow:hidden}.box{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh}.s{width:48px;height:48px;border:4px solid #cc3300;border-top-color:transparent;border-radius:50%;animation:r 1s linear infinite;margin-bottom:24px}@keyframes r{to{transform:rotate(360deg)}}h2{color:#cc3300;font-size:1.5rem;margin:0 0 8px}p{color:#aaa;margin:4px 0}.ok{color:#00ff88}.err{color:#ff5577}.cd{color:#ffcc44;font-size:0.85rem;margin-top:16px}</style><div class=box><div class=s id=spin></div><h2 id=t>로그인 처리 중...</h2><p id=m>잠시만 기다려주세요</p><div class=cd id=cd></div></div><script>(function(){var h=new URLSearchParams(location.hash.slice(1));var at=h.get(\"access_token\"),rt=h.get(\"refresh_token\"),e=h.get(\"error\");var payload=e?{error:e}:(at?{access_token:at,refresh_token:rt||\"\"}:{error:\"no_token\"});fetch(\"/oauth-deposit\",{method:\"POST\",headers:{\"Content-Type\":\"application/json\"},body:JSON.stringify(payload)}).then(function(){var ti=document.getElementById(\"t\"),me=document.getElementById(\"m\"),sp=document.getElementById(\"spin\"),cd=document.getElementById(\"cd\");if(e||!at){sp.style.display=\"none\";ti.className=\"err\";ti.textContent=\"로그인 실패\";me.textContent=e||\"토큰 없음\";return}sp.style.display=\"none\";ti.className=\"ok\";ti.textContent=\"✓ 로그인 완료\";me.textContent=\"게임으로 돌아갑니다\";var n=3;function tick(){if(n>0){cd.textContent=n+\"초 후 이 창이 닫힙니다\";n--;setTimeout(tick,1000)}else{try{window.close()}catch(_){}}}tick()})})()</script>');\n    return;\n  }\n\n  if (pathname === '/oauth-deposit' && req.method === 'POST') {\n    dlog('oauth-deposit POST received');\n    let body = '';\n    req.on('data', c => body += c);\n    req.on('end', () => {\n      try {\n        const d = JSON.parse(body);\n        if (d.error) { _oauthError = d.error; _oauthTokens = null; dlog('deposit error: ' + d.error); }\n        else { _oauthTokens = { access_token: d.access_token, refresh_token: d.refresh_token }; _oauthError = null; dlog('deposit tokens OK at_len=' + (d.access_token ? d.access_token.length : 0)); }\n        res.writeHead(200, { 'Content-Type': 'application/json' });\n        res.end('{\"ok\":true}');\n      } catch(e) { res.writeHead(400); res.end('{\"ok\":false}'); }\n    });\n    return;\n  }\n\n  if (pathname === '/oauth-poll') {\n    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });\n    if (_oauthTokens) {\n      const t = _oauthTokens; _oauthTokens = null;\n      dlog('poll: tokens delivered');\n      res.end(JSON.stringify({ access_token: t.access_token, refresh_token: t.refresh_token }));\n    } else if (_oauthError) {\n      const e = _oauthError; _oauthError = null;\n      res.end(JSON.stringify({ error: e }));\n    } else {\n      res.end('{}');\n    }\n    return;\n  }\n\n  // ── 세이브 API ──\n  if (pathname === '/api/slots' && req.method === 'GET') {\n    const files = fs.readdirSync(SAVE_DIR).filter(f => f.endsWith('.json') && !f.startsWith('_'));\n    const slots = files.map(f => {\n      try {\n        const d = JSON.parse(fs.readFileSync(path.join(SAVE_DIR, f), 'utf8'));\n        return { name: f.replace('.json',''), ts: d.ts||0, lv: d.player?.lv||1, stage: d.game?.stage||0, kills: d.game?.kills||0, charIdx: d.charIdx??0 };\n      } catch { return null; }\n    }).filter(Boolean);\n    return sendJSON(res, 200, { ok: true, slots });\n  }\n\n  if (pathname === '/api/save' && req.method === 'POST') {\n    let body, slot;\n    try {\n      body = await readBody(req);\n      slot = sanitizeSlot(body.slot || 'default');\n      if (body.data) fs.writeFileSync(path.join(SAVE_DIR, slot + '.json'), JSON.stringify(body.data, null, 2), 'utf8');\n    } catch (error) {\n      return sendJSON(res, 500, { ok: false, error: 'Internal Server Error' });\n    }\n    if (!body.data) return sendJSON(res, 400, { ok: false, error: 'No data' });\n    return sendJSON(res, 200, { ok: true, slot });\n  }\n\n  if (pathname.startsWith('/api/load/') && req.method === 'GET') {\n    const slot = sanitizeSlot(decodeURIComponent(pathname.slice(10)));\n    const fp = path.join(SAVE_DIR, slot + '.json');\n    if (!fs.existsSync(fp)) return sendJSON(res, 404, { ok: false, error: 'Not found' });\n    return sendJSON(res, 200, { ok: true, data: JSON.parse(fs.readFileSync(fp, 'utf8')) });\n  }\n\n  if (pathname.startsWith('/api/save/') && req.method === 'DELETE') {\n    const slot = sanitizeSlot(decodeURIComponent(pathname.slice(10)));\n    const fp = path.join(SAVE_DIR, slot + '.json');\n    if (fs.existsSync(fp)) fs.unlinkSync(fp);\n    return sendJSON(res, 200, { ok: true });\n  }\n\n  // ── 정적 파일 서빙 ──\n  // 개발 서버와 동일한 공유 악의 저장 계약. 캐릭터 슬롯과 분리한다.\n  const MATS_FILE = path.join(SAVE_DIR, '_sharedMats.json');\n  if (pathname === '/api/mats' && req.method === 'GET') {\n    try {\n      if (fs.existsSync(MATS_FILE)) {\n        const d = JSON.parse(fs.readFileSync(MATS_FILE, 'utf8'));\n        return sendJSON(res, 200, { ok: true, mats: d.mats || 0 });\n      }\n    } catch (e) {}\n    return sendJSON(res, 200, { ok: true, mats: 0 });\n  }\n  if (pathname === '/api/mats' && req.method === 'POST') {\n    let n;\n    try {\n      const body = await readBody(req);\n      n = Math.max(0, Math.min(Math.floor(+body.mats || 0), Number.MAX_SAFE_INTEGER));\n      fs.writeFileSync(MATS_FILE, JSON.stringify({ mats: n, ts: Date.now() }), 'utf8');\n    } catch (error) {\n      return sendJSON(res, 500, { ok: false, error: 'Internal Server Error' });\n    }\n    return sendJSON(res, 200, { ok: true, mats: n });\n  }\n\n  if (pathname === '/' || pathname === '') pathname = '/index.html';\n  const filePath = path.join(APP_DIR, decodeURIComponent(pathname).replace(/\\.\\./g, ''));\n\n  if (req.headers?.range) {\n    fs.stat(filePath, (err, stat) => {\n      if (err || !stat.isFile()) { res.writeHead(404); return res.end(); }\n      const match = /^bytes=(\\d*)-(\\d*)$/.exec(req.headers.range);\n      let start = match?.[1] ? Number(match[1]) : 0;\n      let end = match?.[2] ? Math.min(Number(match[2]), stat.size - 1) : stat.size - 1;\n      if (match && !match[1] && match[2]) { start = Math.max(0, stat.size - Number(match[2])); end = stat.size - 1; }\n      if (!match || (!match[1] && !match[2]) || !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= stat.size || start > end) {\n        res.writeHead(416, { 'Content-Range': `bytes */${stat.size}`, 'Access-Control-Allow-Origin': '*' });\n        return res.end();\n      }\n      res.writeHead(206, {\n        'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Accept-Ranges': 'bytes',\n        'Content-Length': end-start+1, 'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',\n        'Access-Control-Allow-Origin': '*',\n      });\n      if (req.method === 'HEAD') return res.end();\n      const stream = fs.createReadStream(filePath, { start, end });\n      stream.on('error', () => res.destroy());\n      res.on('close', () => stream.destroy());\n      stream.pipe(res);\n    });\n    return;\n  }\n\n  fs.readFile(filePath, (err, data) => {\n    if (err) { res.writeHead(404); res.end('Not found: ' + pathname); return; }\n    const ext = path.extname(filePath).toLowerCase();\n    const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Content-Length': data.length, 'Accept-Ranges': 'bytes', 'Access-Control-Allow-Origin': '*' };\n    if (ext === '.html') headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';\n    res.writeHead(200, headers);\n    res.end(req.method === 'HEAD' ? undefined : data);\n  });\n}).listen(PORT, '127.0.0.1', () => {\n  dlog('HTTP server listening on port ' + PORT);\n});\n",
          "backup": {
            "sha": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
            "remoteSha": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
            "remoteRef": "refs/heads/memory-module-fixture-only",
            "verifiedAt": "2026-10-02T11:05:09.272Z",
            "inputs": [
              {
                "path": "assets/vendor/three-r160/build/three.module.js",
                "sha256": "76dea8151bc9352aef3528b4262e249b2604f62543828328db978d060d61a495"
              },
              {
                "path": "assets/vendor/three-r160/examples/jsm/loaders/GLTFLoader.js",
                "sha256": "d073b438e6a07e1359741dd5d6c76c953420cc0d4fd84eb1bdde94315540e6a3"
              },
              {
                "path": "assets/vendor/three-r160/examples/jsm/utils/BufferGeometryUtils.js",
                "sha256": "9be041e96308775d00e2695cc607645b9a9b64fd7c0e759dd8f7c00a8d92becb"
              },
              {
                "path": "game.html",
                "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b"
              },
              {
                "path": "index.html",
                "sha256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8"
              },
              {
                "path": "node-main.js",
                "sha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3"
              },
              {
                "path": "package.json",
                "sha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8"
              }
            ]
          },
          "library": {
            "version": "4.17.10",
            "entry": "/memory/library/index.js",
            "buildEntry": "/memory/library/bld.js",
            "files": [],
            "fixtureOnly": true
          },
          "paths": {
            "stage": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000002/stage",
            "output": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000002/package",
            "profile": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000002/user-state/profile",
            "saveRoot": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000002/user-state/saves"
          },
          "args": {
            "version": "0.111.2",
            "flavor": "normal",
            "platform": "osx",
            "arch": "arm64",
            "srcDir": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000002/stage",
            "cacheDir": "/memory/cache",
            "outDir": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000002/package",
            "glob": false,
            "managedManifest": false,
            "zip": false,
            "releaseInfo": {
              "version": "v0.111.2",
              "components": {
                "chromium": "148.0.7778.97"
              }
            },
            "app": {
              "name": "EXODUSER-00000000-0000-4000-8000-000000000002",
              "CFBundleIdentifier": "com.exoduser.mac.00000000-0000-4000-8000-000000000002",
              "CFBundleName": "EXODUSER-00000000-0000-4000-8000-000000000002",
              "CFBundleDisplayName": "EXODUSER",
              "CFBundleVersion": "1.0.0",
              "CFBundleShortVersionString": "1.0.0",
              "LSApplicationCategoryType": "public.app-category.games"
            }
          },
          "packageCreated": false,
          "limits": [
            "로컬bld내부API고정;최상위getter/manifest/다운로드호출안함",
            "SHA/원격근거는제공된파일목록대조;외부Git조회아님",
            "선택root전체파일커버리지검사;선택root의게임의존성완전성은root승인계약",
            "port는정적격리값;실행직전실제점유검사는별도",
            "서명/코덱/실행검수미완료",
            "프로필/저장절대경로는고유job에귀속;이동/배포계약별도"
          ]
        },
        "trace": [
          {
            "op": "open",
            "path": "/memory/project/assets/vendor/three-r160/build/three.module.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/assets/vendor/three-r160/build/three.module.js",
            "bytes": 1272972,
            "sha256": "76dea8151bc9352aef3528b4262e249b2604f62543828328db978d060d61a495"
          },
          {
            "op": "close",
            "path": "/memory/project/assets/vendor/three-r160/build/three.module.js"
          },
          {
            "op": "open",
            "path": "/memory/project/assets/vendor/three-r160/examples/jsm/loaders/GLTFLoader.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/assets/vendor/three-r160/examples/jsm/loaders/GLTFLoader.js",
            "bytes": 108522,
            "sha256": "d073b438e6a07e1359741dd5d6c76c953420cc0d4fd84eb1bdde94315540e6a3"
          },
          {
            "op": "close",
            "path": "/memory/project/assets/vendor/three-r160/examples/jsm/loaders/GLTFLoader.js"
          },
          {
            "op": "open",
            "path": "/memory/project/assets/vendor/three-r160/examples/jsm/utils/BufferGeometryUtils.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/assets/vendor/three-r160/examples/jsm/utils/BufferGeometryUtils.js",
            "bytes": 31906,
            "sha256": "9be041e96308775d00e2695cc607645b9a9b64fd7c0e759dd8f7c00a8d92becb"
          },
          {
            "op": "close",
            "path": "/memory/project/assets/vendor/three-r160/examples/jsm/utils/BufferGeometryUtils.js"
          },
          {
            "op": "open",
            "path": "/memory/project/game.html",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/game.html",
            "bytes": 4028178,
            "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b"
          },
          {
            "op": "close",
            "path": "/memory/project/game.html"
          },
          {
            "op": "open",
            "path": "/memory/project/index.html",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/index.html",
            "bytes": 342046,
            "sha256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8"
          },
          {
            "op": "close",
            "path": "/memory/project/index.html"
          },
          {
            "op": "open",
            "path": "/memory/project/node-main.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/node-main.js",
            "bytes": 10429,
            "sha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3"
          },
          {
            "op": "close",
            "path": "/memory/project/node-main.js"
          },
          {
            "op": "open",
            "path": "/memory/project/package.json",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/package.json",
            "bytes": 2040,
            "sha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8"
          },
          {
            "op": "close",
            "path": "/memory/project/package.json"
          },
          {
            "op": "open",
            "path": "/memory/release.json",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/release.json",
            "bytes": 64,
            "sha256": "2d4127eec1ff90a71cbb1362aa1011de7993a8992e90c2c419f79e4d2fa3c706"
          },
          {
            "op": "close",
            "path": "/memory/release.json"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/Info.plist",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/Info.plist",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/Info.plist"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/MacOS/nwjs Helper (Alerts)",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/MacOS/nwjs Helper (Alerts)",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/MacOS/nwjs Helper (Alerts)"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/Info.plist",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/Info.plist",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/Info.plist"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/MacOS/nwjs Helper (GPU)",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/MacOS/nwjs Helper (GPU)",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/MacOS/nwjs Helper (GPU)"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/Info.plist",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/Info.plist",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/Info.plist"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/MacOS/nwjs Helper (Renderer)",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/MacOS/nwjs Helper (Renderer)",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/MacOS/nwjs Helper (Renderer)"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/Info.plist",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/Info.plist",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/Info.plist"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/MacOS/nwjs Helper",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/MacOS/nwjs Helper",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/MacOS/nwjs Helper"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Info.plist",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Info.plist",
            "bytes": 25,
            "sha256": "5d99d608ee66038a298430ccfe32a97b0ea667c863128c63d0fce102fdff5d18"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Info.plist"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/MacOS/nwjs",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/MacOS/nwjs",
            "bytes": 8,
            "sha256": "6eca5cc86a53c80d74e777fffd48ee46b98f06a8b448d18106af49ac0862b875"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/MacOS/nwjs"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Resources/en.lproj/InfoPlist.strings",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Resources/en.lproj/InfoPlist.strings",
            "bytes": 25,
            "sha256": "5d99d608ee66038a298430ccfe32a97b0ea667c863128c63d0fce102fdff5d18"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Resources/en.lproj/InfoPlist.strings"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/MacOS/nwjs",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/MacOS/nwjs",
            "bytes": 8,
            "sha256": "6eca5cc86a53c80d74e777fffd48ee46b98f06a8b448d18106af49ac0862b875"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/MacOS/nwjs"
          },
          {
            "op": "open",
            "path": "/memory/project/package.json",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/package.json",
            "bytes": 2040,
            "sha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8"
          },
          {
            "op": "close",
            "path": "/memory/project/package.json"
          },
          {
            "op": "open",
            "path": "/memory/project/node-main.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/node-main.js",
            "bytes": 10429,
            "sha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3"
          },
          {
            "op": "close",
            "path": "/memory/project/node-main.js"
          }
        ],
        "outstandingDescriptors": 0
      },
      "candidate": {
        "result": {
          "status": "READY_PLAN_ONLY",
          "id": "00000000-0000-4000-8000-000000000002",
          "job": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000002",
          "sourceRoot": "/memory/project",
          "inputs": [
            {
              "path": "assets/vendor/three-r160/build/three.module.js",
              "sha256": "76dea8151bc9352aef3528b4262e249b2604f62543828328db978d060d61a495"
            },
            {
              "path": "assets/vendor/three-r160/examples/jsm/loaders/GLTFLoader.js",
              "sha256": "d073b438e6a07e1359741dd5d6c76c953420cc0d4fd84eb1bdde94315540e6a3"
            },
            {
              "path": "assets/vendor/three-r160/examples/jsm/utils/BufferGeometryUtils.js",
              "sha256": "9be041e96308775d00e2695cc607645b9a9b64fd7c0e759dd8f7c00a8d92becb"
            },
            {
              "path": "game.html",
              "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b"
            },
            {
              "path": "index.html",
              "sha256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8"
            },
            {
              "path": "node-main.js",
              "sha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3"
            },
            {
              "path": "package.json",
              "sha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8"
            }
          ],
          "runtimeRoot": "/memory/cache/nwjs-v0.111.2-osx-arm64",
          "runtimeFiles": [
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/Info.plist",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/MacOS/nwjs Helper (Alerts)",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/Info.plist",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/MacOS/nwjs Helper (GPU)",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/Info.plist",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/MacOS/nwjs Helper (Renderer)",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/Info.plist",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/MacOS/nwjs Helper",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Info.plist",
              "sha256": "5d99d608ee66038a298430ccfe32a97b0ea667c863128c63d0fce102fdff5d18"
            },
            {
              "path": "nwjs.app/Contents/MacOS/nwjs",
              "sha256": "6eca5cc86a53c80d74e777fffd48ee46b98f06a8b448d18106af49ac0862b875"
            },
            {
              "path": "nwjs.app/Contents/Resources/en.lproj/InfoPlist.strings",
              "sha256": "5d99d608ee66038a298430ccfe32a97b0ea667c863128c63d0fce102fdff5d18"
            }
          ],
          "derivedPackage": {
            "name": "hell-exoduser-release",
            "version": "1.0.0",
            "main": "http://127.0.0.1:3389/index.html?demo=1",
            "node-main": "node-main.js",
            "node-remote": [
              "http://127.0.0.1:3389",
              "http://localhost:3389"
            ],
            "window": {
              "title": "EXODUSER: HELL LORD",
              "width": 1920,
              "height": 1080,
              "min_width": 1280,
              "min_height": 720,
              "fullscreen": true,
              "resizable": true,
              "frame": false,
              "toolbar": false
            },
            "chromium-args": "--disable-features=CrossOriginOpenerPolicy,CrossOriginEmbedderPolicy,IsolateOrigins,SitePerProcess,SkiaGraphite --disable-site-isolation-trials --disable-web-security --no-sandbox --ignore-gpu-blocklist --enable-gpu-rasterization --allow-running-insecure-content --autoplay-policy=no-user-gesture-required --enable-features=SharedArrayBuffer --user-data-dir=/memory/output/mac-packager-00000000-0000-4000-8000-000000000002/user-state/profile"
          },
          "derivedServer": "// NW.js node-main: 정적 파일 서버 + OAuth 라우트 (정식버전, port 3333)\nconst http = require('http');\nconst fs = require('fs');\nconst path = require('path');\nconst urlMod = require('url');\n\nconst LOG_FILE = path.join(__dirname, 'oauth-debug.log');\nfunction dlog(msg) {\n  try {\n    const line = '[' + new Date().toISOString() + '] ' + msg + '\\n';\n    fs.appendFileSync(LOG_FILE, line);\n  } catch (e) {}\n}\ndlog('=== EXODUSER RELEASE Server started ===');\n\nconst PORT = 3389;\nconst APP_DIR = __dirname;\n\nconst MIME = {\n  '.vtt': 'text/vtt; charset=utf-8',\n  '.html': 'text/html; charset=utf-8',\n  '.js':   'application/javascript',\n  '.css':  'text/css',\n  '.png':  'image/png',\n  '.jpg':  'image/jpeg',\n  '.jpeg': 'image/jpeg',\n  '.svg':  'image/svg+xml',\n  '.ico':  'image/x-icon',\n  '.json': 'application/json',\n  '.woff': 'font/woff',\n  '.woff2':'font/woff2',\n  '.mp3':  'audio/mpeg',\n  '.ogg':  'audio/ogg',\n  '.wav':  'audio/wav',\n  '.mp4':  'video/mp4',\n  '.webm': 'video/webm',\n  '.gif':  'image/gif',\n};\n\n// OAuth 토큰 저장소 (메모리, 단일 세션) — Supabase: access_token + refresh_token\nlet _oauthTokens = null;\nlet _oauthError = null;\n\n// 세이브 폴더: %APPDATA%\\EXODUSER-HELL\\saves\\ (EA와 동일 경로 공유)\nconst APPDATA = process.env.APPDATA || require('os').homedir();\nconst SAVE_DIR = \"/memory/output/mac-packager-00000000-0000-4000-8000-000000000002/user-state/saves\";\nif (!fs.existsSync(SAVE_DIR)) fs.mkdirSync(SAVE_DIR, { recursive: true });\n\nfunction sanitizeSlot(name) {\n  return String(name).replace(/[^a-zA-Z0-9가-힣_\\-]/g, '_').slice(0, 50);\n}\nfunction sendJSON(res, status, data) {\n  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });\n  res.end(JSON.stringify(data));\n}\nfunction readBody(req) {\n  return new Promise((resolve, reject) => {\n    const chunks = [];\n    req.on('data', c => chunks.push(c));\n    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString())); } catch(e){ reject(e); } });\n    req.on('error', reject);\n  });\n}\n\nhttp.createServer(async (req, res) => {\n  let pathname = urlMod.parse(req.url).pathname;\n\n  // CORS preflight\n  if (req.method === 'OPTIONS') {\n    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });\n    return res.end();\n  }\n\n  // ── OAuth 라우트 ──\n  if (pathname === '/oauth-callback') {\n    dlog('oauth-callback hit: ' + req.url);\n    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });\n    res.end('<!DOCTYPE html><meta charset=utf-8><title>EXODUSER Login</title><style>html,body{background:#0a0004;color:#fff;font-family:-apple-system,sans-serif;margin:0;height:100%;overflow:hidden}.box{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh}.s{width:48px;height:48px;border:4px solid #cc3300;border-top-color:transparent;border-radius:50%;animation:r 1s linear infinite;margin-bottom:24px}@keyframes r{to{transform:rotate(360deg)}}h2{color:#cc3300;font-size:1.5rem;margin:0 0 8px}p{color:#aaa;margin:4px 0}.ok{color:#00ff88}.err{color:#ff5577}.cd{color:#ffcc44;font-size:0.85rem;margin-top:16px}</style><div class=box><div class=s id=spin></div><h2 id=t>로그인 처리 중...</h2><p id=m>잠시만 기다려주세요</p><div class=cd id=cd></div></div><script>(function(){var h=new URLSearchParams(location.hash.slice(1));var at=h.get(\"access_token\"),rt=h.get(\"refresh_token\"),e=h.get(\"error\");var payload=e?{error:e}:(at?{access_token:at,refresh_token:rt||\"\"}:{error:\"no_token\"});fetch(\"/oauth-deposit\",{method:\"POST\",headers:{\"Content-Type\":\"application/json\"},body:JSON.stringify(payload)}).then(function(){var ti=document.getElementById(\"t\"),me=document.getElementById(\"m\"),sp=document.getElementById(\"spin\"),cd=document.getElementById(\"cd\");if(e||!at){sp.style.display=\"none\";ti.className=\"err\";ti.textContent=\"로그인 실패\";me.textContent=e||\"토큰 없음\";return}sp.style.display=\"none\";ti.className=\"ok\";ti.textContent=\"✓ 로그인 완료\";me.textContent=\"게임으로 돌아갑니다\";var n=3;function tick(){if(n>0){cd.textContent=n+\"초 후 이 창이 닫힙니다\";n--;setTimeout(tick,1000)}else{try{window.close()}catch(_){}}}tick()})})()</script>');\n    return;\n  }\n\n  if (pathname === '/oauth-deposit' && req.method === 'POST') {\n    dlog('oauth-deposit POST received');\n    let body = '';\n    req.on('data', c => body += c);\n    req.on('end', () => {\n      try {\n        const d = JSON.parse(body);\n        if (d.error) { _oauthError = d.error; _oauthTokens = null; dlog('deposit error: ' + d.error); }\n        else { _oauthTokens = { access_token: d.access_token, refresh_token: d.refresh_token }; _oauthError = null; dlog('deposit tokens OK at_len=' + (d.access_token ? d.access_token.length : 0)); }\n        res.writeHead(200, { 'Content-Type': 'application/json' });\n        res.end('{\"ok\":true}');\n      } catch(e) { res.writeHead(400); res.end('{\"ok\":false}'); }\n    });\n    return;\n  }\n\n  if (pathname === '/oauth-poll') {\n    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });\n    if (_oauthTokens) {\n      const t = _oauthTokens; _oauthTokens = null;\n      dlog('poll: tokens delivered');\n      res.end(JSON.stringify({ access_token: t.access_token, refresh_token: t.refresh_token }));\n    } else if (_oauthError) {\n      const e = _oauthError; _oauthError = null;\n      res.end(JSON.stringify({ error: e }));\n    } else {\n      res.end('{}');\n    }\n    return;\n  }\n\n  // ── 세이브 API ──\n  if (pathname === '/api/slots' && req.method === 'GET') {\n    const files = fs.readdirSync(SAVE_DIR).filter(f => f.endsWith('.json') && !f.startsWith('_'));\n    const slots = files.map(f => {\n      try {\n        const d = JSON.parse(fs.readFileSync(path.join(SAVE_DIR, f), 'utf8'));\n        return { name: f.replace('.json',''), ts: d.ts||0, lv: d.player?.lv||1, stage: d.game?.stage||0, kills: d.game?.kills||0, charIdx: d.charIdx??0 };\n      } catch { return null; }\n    }).filter(Boolean);\n    return sendJSON(res, 200, { ok: true, slots });\n  }\n\n  if (pathname === '/api/save' && req.method === 'POST') {\n    let body, slot;\n    try {\n      body = await readBody(req);\n      slot = sanitizeSlot(body.slot || 'default');\n      if (body.data) fs.writeFileSync(path.join(SAVE_DIR, slot + '.json'), JSON.stringify(body.data, null, 2), 'utf8');\n    } catch (error) {\n      return sendJSON(res, 500, { ok: false, error: 'Internal Server Error' });\n    }\n    if (!body.data) return sendJSON(res, 400, { ok: false, error: 'No data' });\n    return sendJSON(res, 200, { ok: true, slot });\n  }\n\n  if (pathname.startsWith('/api/load/') && req.method === 'GET') {\n    const slot = sanitizeSlot(decodeURIComponent(pathname.slice(10)));\n    const fp = path.join(SAVE_DIR, slot + '.json');\n    if (!fs.existsSync(fp)) return sendJSON(res, 404, { ok: false, error: 'Not found' });\n    return sendJSON(res, 200, { ok: true, data: JSON.parse(fs.readFileSync(fp, 'utf8')) });\n  }\n\n  if (pathname.startsWith('/api/save/') && req.method === 'DELETE') {\n    const slot = sanitizeSlot(decodeURIComponent(pathname.slice(10)));\n    const fp = path.join(SAVE_DIR, slot + '.json');\n    if (fs.existsSync(fp)) fs.unlinkSync(fp);\n    return sendJSON(res, 200, { ok: true });\n  }\n\n  // ── 정적 파일 서빙 ──\n  // 개발 서버와 동일한 공유 악의 저장 계약. 캐릭터 슬롯과 분리한다.\n  const MATS_FILE = path.join(SAVE_DIR, '_sharedMats.json');\n  if (pathname === '/api/mats' && req.method === 'GET') {\n    try {\n      if (fs.existsSync(MATS_FILE)) {\n        const d = JSON.parse(fs.readFileSync(MATS_FILE, 'utf8'));\n        return sendJSON(res, 200, { ok: true, mats: d.mats || 0 });\n      }\n    } catch (e) {}\n    return sendJSON(res, 200, { ok: true, mats: 0 });\n  }\n  if (pathname === '/api/mats' && req.method === 'POST') {\n    let n;\n    try {\n      const body = await readBody(req);\n      n = Math.max(0, Math.min(Math.floor(+body.mats || 0), Number.MAX_SAFE_INTEGER));\n      fs.writeFileSync(MATS_FILE, JSON.stringify({ mats: n, ts: Date.now() }), 'utf8');\n    } catch (error) {\n      return sendJSON(res, 500, { ok: false, error: 'Internal Server Error' });\n    }\n    return sendJSON(res, 200, { ok: true, mats: n });\n  }\n\n  if (pathname === '/' || pathname === '') pathname = '/index.html';\n  const filePath = path.join(APP_DIR, decodeURIComponent(pathname).replace(/\\.\\./g, ''));\n\n  if (req.headers?.range) {\n    fs.stat(filePath, (err, stat) => {\n      if (err || !stat.isFile()) { res.writeHead(404); return res.end(); }\n      const match = /^bytes=(\\d*)-(\\d*)$/.exec(req.headers.range);\n      let start = match?.[1] ? Number(match[1]) : 0;\n      let end = match?.[2] ? Math.min(Number(match[2]), stat.size - 1) : stat.size - 1;\n      if (match && !match[1] && match[2]) { start = Math.max(0, stat.size - Number(match[2])); end = stat.size - 1; }\n      if (!match || (!match[1] && !match[2]) || !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= stat.size || start > end) {\n        res.writeHead(416, { 'Content-Range': `bytes */${stat.size}`, 'Access-Control-Allow-Origin': '*' });\n        return res.end();\n      }\n      res.writeHead(206, {\n        'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Accept-Ranges': 'bytes',\n        'Content-Length': end-start+1, 'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',\n        'Access-Control-Allow-Origin': '*',\n      });\n      if (req.method === 'HEAD') return res.end();\n      const stream = fs.createReadStream(filePath, { start, end });\n      stream.on('error', () => res.destroy());\n      res.on('close', () => stream.destroy());\n      stream.pipe(res);\n    });\n    return;\n  }\n\n  fs.readFile(filePath, (err, data) => {\n    if (err) { res.writeHead(404); res.end('Not found: ' + pathname); return; }\n    const ext = path.extname(filePath).toLowerCase();\n    const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Content-Length': data.length, 'Accept-Ranges': 'bytes', 'Access-Control-Allow-Origin': '*' };\n    if (ext === '.html') headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';\n    res.writeHead(200, headers);\n    res.end(req.method === 'HEAD' ? undefined : data);\n  });\n}).listen(PORT, '127.0.0.1', () => {\n  dlog('HTTP server listening on port ' + PORT);\n});\n",
          "backup": {
            "sha": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
            "remoteSha": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
            "remoteRef": "refs/heads/memory-module-fixture-only",
            "verifiedAt": "2026-10-02T11:05:09.272Z",
            "inputs": [
              {
                "path": "assets/vendor/three-r160/build/three.module.js",
                "sha256": "76dea8151bc9352aef3528b4262e249b2604f62543828328db978d060d61a495"
              },
              {
                "path": "assets/vendor/three-r160/examples/jsm/loaders/GLTFLoader.js",
                "sha256": "d073b438e6a07e1359741dd5d6c76c953420cc0d4fd84eb1bdde94315540e6a3"
              },
              {
                "path": "assets/vendor/three-r160/examples/jsm/utils/BufferGeometryUtils.js",
                "sha256": "9be041e96308775d00e2695cc607645b9a9b64fd7c0e759dd8f7c00a8d92becb"
              },
              {
                "path": "game.html",
                "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b"
              },
              {
                "path": "index.html",
                "sha256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8"
              },
              {
                "path": "node-main.js",
                "sha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3"
              },
              {
                "path": "package.json",
                "sha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8"
              }
            ]
          },
          "library": {
            "version": "4.17.10",
            "entry": "/memory/library/index.js",
            "buildEntry": "/memory/library/bld.js",
            "files": [],
            "fixtureOnly": true
          },
          "paths": {
            "stage": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000002/stage",
            "output": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000002/package",
            "profile": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000002/user-state/profile",
            "saveRoot": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000002/user-state/saves"
          },
          "args": {
            "version": "0.111.2",
            "flavor": "normal",
            "platform": "osx",
            "arch": "arm64",
            "srcDir": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000002/stage",
            "cacheDir": "/memory/cache",
            "outDir": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000002/package",
            "glob": false,
            "managedManifest": false,
            "zip": false,
            "releaseInfo": {
              "version": "v0.111.2",
              "components": {
                "chromium": "148.0.7778.97"
              }
            },
            "app": {
              "name": "EXODUSER-00000000-0000-4000-8000-000000000002",
              "CFBundleIdentifier": "com.exoduser.mac.00000000-0000-4000-8000-000000000002",
              "CFBundleName": "EXODUSER-00000000-0000-4000-8000-000000000002",
              "CFBundleDisplayName": "EXODUSER",
              "CFBundleVersion": "1.0.0",
              "CFBundleShortVersionString": "1.0.0",
              "LSApplicationCategoryType": "public.app-category.games"
            }
          },
          "packageCreated": false,
          "limits": [
            "로컬bld내부API고정;최상위getter/manifest/다운로드호출안함",
            "SHA/원격근거는제공된파일목록대조;외부Git조회아님",
            "선택root전체파일커버리지검사;선택root의게임의존성완전성은root승인계약",
            "port는정적격리값;실행직전실제점유검사는별도",
            "서명/코덱/실행검수미완료",
            "프로필/저장절대경로는고유job에귀속;이동/배포계약별도"
          ]
        },
        "trace": [
          {
            "op": "open",
            "path": "/memory/project/assets/vendor/three-r160/build/three.module.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/assets/vendor/three-r160/build/three.module.js",
            "bytes": 1272972,
            "sha256": "76dea8151bc9352aef3528b4262e249b2604f62543828328db978d060d61a495"
          },
          {
            "op": "close",
            "path": "/memory/project/assets/vendor/three-r160/build/three.module.js"
          },
          {
            "op": "open",
            "path": "/memory/project/assets/vendor/three-r160/examples/jsm/loaders/GLTFLoader.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/assets/vendor/three-r160/examples/jsm/loaders/GLTFLoader.js",
            "bytes": 108522,
            "sha256": "d073b438e6a07e1359741dd5d6c76c953420cc0d4fd84eb1bdde94315540e6a3"
          },
          {
            "op": "close",
            "path": "/memory/project/assets/vendor/three-r160/examples/jsm/loaders/GLTFLoader.js"
          },
          {
            "op": "open",
            "path": "/memory/project/assets/vendor/three-r160/examples/jsm/utils/BufferGeometryUtils.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/assets/vendor/three-r160/examples/jsm/utils/BufferGeometryUtils.js",
            "bytes": 31906,
            "sha256": "9be041e96308775d00e2695cc607645b9a9b64fd7c0e759dd8f7c00a8d92becb"
          },
          {
            "op": "close",
            "path": "/memory/project/assets/vendor/three-r160/examples/jsm/utils/BufferGeometryUtils.js"
          },
          {
            "op": "open",
            "path": "/memory/project/game.html",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/game.html",
            "bytes": 4028178,
            "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b"
          },
          {
            "op": "close",
            "path": "/memory/project/game.html"
          },
          {
            "op": "open",
            "path": "/memory/project/index.html",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/index.html",
            "bytes": 342046,
            "sha256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8"
          },
          {
            "op": "close",
            "path": "/memory/project/index.html"
          },
          {
            "op": "open",
            "path": "/memory/project/node-main.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/node-main.js",
            "bytes": 10429,
            "sha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3"
          },
          {
            "op": "close",
            "path": "/memory/project/node-main.js"
          },
          {
            "op": "open",
            "path": "/memory/project/package.json",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/package.json",
            "bytes": 2040,
            "sha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8"
          },
          {
            "op": "close",
            "path": "/memory/project/package.json"
          },
          {
            "op": "open",
            "path": "/memory/project/game.html",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/game.html",
            "bytes": 4028178,
            "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b"
          },
          {
            "op": "close",
            "path": "/memory/project/game.html"
          },
          {
            "op": "open",
            "path": "/memory/project/assets/vendor/three-r160/build/three.module.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/assets/vendor/three-r160/build/three.module.js",
            "bytes": 1272972,
            "sha256": "76dea8151bc9352aef3528b4262e249b2604f62543828328db978d060d61a495"
          },
          {
            "op": "close",
            "path": "/memory/project/assets/vendor/three-r160/build/three.module.js"
          },
          {
            "op": "open",
            "path": "/memory/project/assets/vendor/three-r160/examples/jsm/loaders/GLTFLoader.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/assets/vendor/three-r160/examples/jsm/loaders/GLTFLoader.js",
            "bytes": 108522,
            "sha256": "d073b438e6a07e1359741dd5d6c76c953420cc0d4fd84eb1bdde94315540e6a3"
          },
          {
            "op": "close",
            "path": "/memory/project/assets/vendor/three-r160/examples/jsm/loaders/GLTFLoader.js"
          },
          {
            "op": "open",
            "path": "/memory/project/assets/vendor/three-r160/examples/jsm/utils/BufferGeometryUtils.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/assets/vendor/three-r160/examples/jsm/utils/BufferGeometryUtils.js",
            "bytes": 31906,
            "sha256": "9be041e96308775d00e2695cc607645b9a9b64fd7c0e759dd8f7c00a8d92becb"
          },
          {
            "op": "close",
            "path": "/memory/project/assets/vendor/three-r160/examples/jsm/utils/BufferGeometryUtils.js"
          },
          {
            "op": "open",
            "path": "/memory/project/index.html",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/index.html",
            "bytes": 342046,
            "sha256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8"
          },
          {
            "op": "close",
            "path": "/memory/project/index.html"
          },
          {
            "op": "open",
            "path": "/memory/release.json",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/release.json",
            "bytes": 64,
            "sha256": "2d4127eec1ff90a71cbb1362aa1011de7993a8992e90c2c419f79e4d2fa3c706"
          },
          {
            "op": "close",
            "path": "/memory/release.json"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/Info.plist",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/Info.plist",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/Info.plist"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/MacOS/nwjs Helper (Alerts)",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/MacOS/nwjs Helper (Alerts)",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/MacOS/nwjs Helper (Alerts)"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/Info.plist",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/Info.plist",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/Info.plist"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/MacOS/nwjs Helper (GPU)",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/MacOS/nwjs Helper (GPU)",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/MacOS/nwjs Helper (GPU)"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/Info.plist",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/Info.plist",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/Info.plist"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/MacOS/nwjs Helper (Renderer)",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/MacOS/nwjs Helper (Renderer)",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/MacOS/nwjs Helper (Renderer)"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/Info.plist",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/Info.plist",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/Info.plist"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/MacOS/nwjs Helper",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/MacOS/nwjs Helper",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/MacOS/nwjs Helper"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Info.plist",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Info.plist",
            "bytes": 25,
            "sha256": "5d99d608ee66038a298430ccfe32a97b0ea667c863128c63d0fce102fdff5d18"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Info.plist"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/MacOS/nwjs",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/MacOS/nwjs",
            "bytes": 8,
            "sha256": "6eca5cc86a53c80d74e777fffd48ee46b98f06a8b448d18106af49ac0862b875"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/MacOS/nwjs"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Resources/en.lproj/InfoPlist.strings",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Resources/en.lproj/InfoPlist.strings",
            "bytes": 25,
            "sha256": "5d99d608ee66038a298430ccfe32a97b0ea667c863128c63d0fce102fdff5d18"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Resources/en.lproj/InfoPlist.strings"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/MacOS/nwjs",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/MacOS/nwjs",
            "bytes": 8,
            "sha256": "6eca5cc86a53c80d74e777fffd48ee46b98f06a8b448d18106af49ac0862b875"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/MacOS/nwjs"
          },
          {
            "op": "open",
            "path": "/memory/project/package.json",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/package.json",
            "bytes": 2040,
            "sha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8"
          },
          {
            "op": "close",
            "path": "/memory/project/package.json"
          },
          {
            "op": "open",
            "path": "/memory/project/node-main.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/node-main.js",
            "bytes": 10429,
            "sha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3"
          },
          {
            "op": "close",
            "path": "/memory/project/node-main.js"
          }
        ],
        "outstandingDescriptors": 0
      }
    }
  },
  "observations": [
    {
      "id": "CURRENT-ACCEPTS-MISSING-MODULE",
      "passed": true
    },
    {
      "id": "CANDIDATE-REJECTS-MAPPED-GLTFLOADER",
      "passed": true
    },
    {
      "id": "NORMAL-PLAN-EQUIVALENT",
      "passed": true
    },
    {
      "id": "ACTUAL-RELATIVE-IMPORT-TRAVERSED",
      "passed": true
    },
    {
      "id": "ONLY-ONE-SELECTION-DIFF",
      "passed": true
    },
    {
      "id": "DESCRIPTORS-CLOSED",
      "passed": true
    }
  ],
  "counts": {
    "inputEvents": 2,
    "planCalls": 4,
    "previousTestsRerun": 0,
    "fullInputScans": 0
  },
  "boundary": {
    "real": "Actual packager complete plan/helpers, game inline modules/importmap, three.module/vendor GLTFLoader/BufferGeometryUtils source SHA; Acorn AST parse. No model/image map geometry rendering or game code execution.",
    "memory": "fs runtime/tree/descriptors, process darwin/arm64, libraryEvidence stub. 8byte runtime header is synthetic. Valid-shaped remote SHA/ref/UUID/port are fixture values. No remote/network/copy/install/build.",
    "resolver": "Exact and longest slash-prefix importmap keys; mapping addresses relative to HTML; ./../ imports relative to caller module; URL removes query/hash from selected path. Local modules only; external origins skipped. No scopes, redirects, HTML base href/entities/multiple map merging spec validation, dynamic imports, module graph export linking or symbols/renderer/decode inference."
  },
  "preservation": [
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/BUILD/BUILD-importmap-module-input-closure-hb1014b/TASK.md",
      "beforeSha256": "daf14b23a10f98b279a8c87237a3e89c1c14de58b673d726850317d6f13cac85",
      "afterSha256": "daf14b23a10f98b279a8c87237a3e89c1c14de58b673d726850317d6f13cac85"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/continuous/COMMON.md",
      "beforeSha256": "de5a881270625a7b2d0e854331205e01372a037340a18474c6442b60e668465e",
      "afterSha256": "de5a881270625a7b2d0e854331205e01372a037340a18474c6442b60e668465e"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/AGENTS.md",
      "beforeSha256": "fd59bef70960bcaf1ab9910051faa860362884e574ac2869fad05c6872ae04e4",
      "afterSha256": "fd59bef70960bcaf1ab9910051faa860362884e574ac2869fad05c6872ae04e4"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md",
      "beforeSha256": "86ada15a477fc128a77cf10c2337de9fdb36b3f9c463f008f5d3c97e82f60520",
      "afterSha256": "86ada15a477fc128a77cf10c2337de9fdb36b3f9c463f008f5d3c97e82f60520"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/13출시·마케팅/INTEGRATION_BUILD_TEAM_MASTER.md",
      "beforeSha256": "677cea72ca729d55cc69af0f35abb051220ae2b44bd97a9cb478982cea7dcb0e",
      "afterSha256": "677cea72ca729d55cc69af0f35abb051220ae2b44bd97a9cb478982cea7dcb0e"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/13출시·마케팅/BUILD_BACKUP_POLICY_20261001.md",
      "beforeSha256": "826cc57cba42f4edaddd3ef306966a1681d6b107cb1a67e475bb55e3cf2daca0",
      "afterSha256": "826cc57cba42f4edaddd3ef306966a1681d6b107cb1a67e475bb55e3cf2daca0"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261001/BUILD/mac-packager/packager.mjs",
      "beforeSha256": "289bf3a1bec9f2a8b06d9309d5fbdcbc672b6a46aeb20e85fb441dd2df45dc65",
      "afterSha256": "289bf3a1bec9f2a8b06d9309d5fbdcbc672b6a46aeb20e85fb441dd2df45dc65"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
      "beforeSha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b",
      "afterSha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/index.html",
      "beforeSha256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8",
      "afterSha256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/node_modules/acorn/dist/acorn.js",
      "beforeSha256": "2261c5f0e4abe860e889dfc67081683a4ba4d27deb7f4cbc8ad06a1b7fdd510c",
      "afterSha256": "2261c5f0e4abe860e889dfc67081683a4ba4d27deb7f4cbc8ad06a1b7fdd510c"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/package.json",
      "beforeSha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8",
      "afterSha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/node-main.js",
      "beforeSha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3",
      "afterSha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/assets/vendor/three-r160/build/three.module.js",
      "beforeSha256": "76dea8151bc9352aef3528b4262e249b2604f62543828328db978d060d61a495",
      "afterSha256": "76dea8151bc9352aef3528b4262e249b2604f62543828328db978d060d61a495"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/assets/vendor/three-r160/examples/jsm/loaders/GLTFLoader.js",
      "beforeSha256": "d073b438e6a07e1359741dd5d6c76c953420cc0d4fd84eb1bdde94315540e6a3",
      "afterSha256": "d073b438e6a07e1359741dd5d6c76c953420cc0d4fd84eb1bdde94315540e6a3"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/assets/vendor/three-r160/examples/jsm/utils/BufferGeometryUtils.js",
      "beforeSha256": "9be041e96308775d00e2695cc607645b9a9b64fd7c0e759dd8f7c00a8d92becb",
      "afterSha256": "9be041e96308775d00e2695cc607645b9a9b64fd7c0e759dd8f7c00a8d92becb"
    }
  ],
  "changedDuringRead": [],
  "checksSha256": "ba221c4d377a6d82943d49a322245a90bb148bd9ad27902e6be386efa58a6f41",
  "docsSearch": {
    "command": [
      "rg",
      "-n",
      "importmap|three/addons|GLTFLoader|BufferGeometryUtils|inputRoots|sameInventory|선택root",
      "docs/"
    ],
    "exitCode": 0,
    "lineCount": 102,
    "matchedFiles": [
      "docs/0마스터플랜/EA/HELL_EA_BUILD_CHECKLIST.md",
      "docs/0마스터플랜/MAC_AGENT_DASHBOARD.md",
      "docs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md",
      "docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md",
      "docs/0마스터플랜/mac-resume-20261001/ITEM-폴백마스킹-검수.md",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/CONTINUOUS-DISPATCH-20261002.md",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/CONTINUOUS-INTEGRATION-20261002.md",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/FILTER-INTEGRATION-20261002.md",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/FOUR-CANDIDATE-ACCEPTANCE-20261002.md",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/FOUR-SUBMISSIONS-HELLRAY-20261002.md",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/PROVIDER-HALVES-20261002.md",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/UIUX-coordinate-result.md",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/UIUX-next-result.md",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/supervisor/SUPERVISOR_STATE.json",
      "docs/10ai에셋프롬프트모음/외부API_키_가이드.md",
      "docs/12퍼포먼스·최적화/12퍼포먼스·최적화.md",
      "docs/12퍼포먼스·최적화/QA_PERFORMANCE_TEAM_MASTER.md",
      "docs/12퍼포먼스·최적화/THREE_LOCAL_SINGLE_RUNTIME_20260929.md",
      "docs/12퍼포먼스·최적화/성능최적화_보고서_2026-05-23.md",
      "docs/12퍼포먼스·최적화/코드전수조사_디버그_최적화_2026-09-03.md",
      "docs/13출시·마케팅/13출시·마케팅.md",
      "docs/13출시·마케팅/DESKTOP_LATEST_BUILD_20260929.md",
      "docs/13출시·마케팅/MAC_HELPER_PAYLOAD_INTEGRITY_20261002.md",
      "docs/13출시·마케팅/PUBLISHER_LATEST_BUILD_DELIVERY_20260929.md",
      "docs/14밸런스+수치테이블/스킬데미지공식표.md",
      "docs/14밸런스+수치테이블/스킬별_DPS_자원소비표.md",
      "docs/14밸런스+수치테이블/자원소비량표.md",
      "docs/1전체그래픽세팅/맵_화면효과_전수조사.md",
      "docs/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md",
      "docs/2_1 스킬관리+합체시스템+자원/MALICE_STORM_FOCUS_CANCELLATION_20261002.md",
      "docs/2_1 스킬관리+합체시스템+자원/SKILL03_설치확정_자원검수_20261001.md",
      "docs/2_1 스킬관리+합체시스템+자원/SKILL_자원게이트_감사_20261001.md",
      "docs/2_1 스킬관리+합체시스템+자원/자원리젠+소모공식.md",
      "docs/2_4 펫시스템/PET_FIRST_ITEM_ACCEPTANCE_FALLTHROUGH_20261002.md",
      "docs/2_5 부활+에너지쉴드시스템/2_5 부활+에너지쉴드시스템.md",
      "docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md",
      "docs/2_7 인벤토리+장비시스템/INVENTORY_KEYBOARD_FOCUS_20261002.md",
      "docs/2게임디자인레벨디자인/2게임디자인레벨디자인.md",
      "docs/3.1 ui hud 디자인/UIUX_EXPANDED_MINUS_LIFETIME_20261002.md",
      "docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md",
      "docs/3.1 ui hud 디자인/UI_UX_IMPROVEMENT_PROJECT_20260930.md",
      "docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md",
      "docs/4.1맵디자인+설정/CH1-1_BOSS_RESPAWN_PROGRESS_20261002.md",
      "docs/4.1맵디자인+설정/CH1_HILL_EDGE_BLEND_PASS44.md",
      "docs/4.1맵디자인+설정/MAP_QA_GATES.md",
      "docs/4.1맵디자인+설정/MAP_RUNTIME_ARCHITECTURE.md",
      "docs/4.1맵디자인+설정/REGION_CLEAR_GATE_20260930.md",
      "docs/4.1맵디자인+설정/_MAP_SSOT_INDEX.md",
      "docs/4.1맵디자인+설정/맵오브젝트_에셋목록.md",
      "docs/5.1임펙트디자인/ANIMATION_VFX_TEAM_MASTER.md",
      "docs/5.1임펙트디자인/VFX_구현가이드.md",
      "docs/6사운드디자인/6사운드디자인.md",
      "docs/6사운드디자인/SOUND_SAMPLE_START_FAILURE_20261002.md",
      "docs/8.0몬스터디자인/몬스터_총관리.md",
      "docs/8.1보스디자인바이블/BOSS_BATTLE_SETTINGS.md",
      "docs/CHANGELOG_DAILY_20260520.md",
      "docs/CHANGELOG_SYNC.md"
    ],
    "outputSha256": "686426ec29f08f8b7cc3d9db90137de5d0d5ddcadeecd15aa813f4c59665f6cb"
  },
  "productionApplied": false,
  "runtimeAccepted": false,
  "rebuildExecuted": false,
  "visualAccepted": false,
  "actualTools": [
    "functions.exec -> exec_command"
  ],
  "skillsUsed": [],
  "errors": [],
  "receipts": [
    {
      "chunk": "c07b0e",
      "command": "cat exact TASK",
      "exitCode": 0
    },
    {
      "chunks": [
        "0e24a9",
        "e36d36"
      ],
      "command": "read COMMON/AGENTS/TEAM policy/BUILD master/complete plan/importmap caller",
      "exitCode": 0
    },
    {
      "chunk": "d0a257",
      "command": "read actual vendor GLTFLoader/BufferGeometryUtils/game importmap; exact Node resolve acorn/es-module-lexer",
      "exitCode": 0,
      "optionalDependencyProbe": {
        "acorn": "resolved",
        "esModuleLexer": "MODULE_NOT_FOUND; use installed Acorn; no install"
      }
    }
  ],
  "nextGate": "감독이 static module closure 후보와 별도 직접 script/style 후보의 통합 접점을 검토하고 총괄이 scoped source+docs/원격 checkpoint. 실앱 module 로딩/3D fallback/render/decode 검수는 별도."
}
```
