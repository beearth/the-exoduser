#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const slash = s => s.replaceAll('\\', '/');
const categories = ['PASS', 'FAIL', 'BUILD-BREAK', 'NEEDS-INPUT', 'SKIP'];
const mapPaths = (value, resolve) => value.split(';').map(resolve).join(';');

function discover(root) {
  const projects = [], scripts = [];
  function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.isSymbolicLink() || ['bin', 'obj', 'runs', 'node_modules', 'resource-oracle', 'oracle-sweep'].includes(e.name)) continue;
      const file = path.join(dir, e.name);
      if (e.isDirectory()) walk(file);
      else {
        const rel = slash(path.relative(root, file));
        if (e.name.endsWith('.csproj')) projects.push(rel);
        if (/^export.*\.cjs$|.*-oracle\.cjs$/.test(e.name)) scripts.push(rel);
      }
    }
  }
  walk(root);
  return { projects: projects.sort(), scripts: scripts.sort() };
}

function extractMetrics(receipt, output) {
  const r = receipt || {}, arrays = ['checks', 'rows', 'results', 'assertions', '검사'].map(k => r[k]).filter(Array.isArray);
  const rows = arrays[0] || [];
  const details = [...(r.failureDetails || []), ...(Array.isArray(r.failures) ? r.failures : []), ...(Array.isArray(r.first) ? r.first : []), ...rows.filter(x => x && (x.passed === false || x.ok === false))];
  let total = typeof r.checks === 'number' ? r.checks : typeof r.total === 'number' ? r.total : rows.length || null;
  let failed = typeof r.failed === 'number' ? r.failed : typeof r.failures === 'number' ? r.failures : typeof r.mismatches === 'number' ? r.mismatches : typeof r.fail === 'number' ? r.fail : null;
  if (failed === null && rows.length) failed = rows.filter(x => x.passed === false || x.ok === false).length;
  const count = /(?:RESULT |SIM |Tests: )?(\d+) checks\s*[/,]\s*(\d+) failures/i.exec(output);
  if (count) { total ??= +count[1]; failed ??= +count[2]; }
  const diff = /(?:^|\n)DIFF (\d+)/.exec(output); if (diff) failed ??= +diff[1];
  const pass = /(?:PASS\s+|passed[":\s]+)(\d+)|(?:^|\n)(\d+) passed/i.exec(output);
  if (total === null && pass && failed === null) { total = +(pass[1] || pass[2]); failed = 0; }
  if (total === null && typeof r.passed === 'number') total = r.passed + (failed || 0);
  const failLines = output.split(/\r?\n/).filter(x => /^(?:FAIL\b|  .*differs|Unhandled exception\.|.*=> DIFF)/.test(x));
  const names = [...new Set([...details.map(x => typeof x === 'string' ? x : x.name || x.label || JSON.stringify(x)), ...failLines])];
  return { total, failed, names, details };
}

function classifyResult(r) {
  if (r.timedOut) return 'NEEDS-INPUT';
  if (/error CS0246:.*['"]UnityEngine['"]/.test(r.output)) return 'SKIP';
  if (/error (?:CS\d+|MSB\d+|NETSDK\d+)|Build FAILED|build failed/i.test(r.output)) return 'BUILD-BREAK';
  if (r.phase === 'export' && r.code !== 0) return 'NEEDS-INPUT';
  if (/FileNotFoundException|DirectoryNotFoundException|ENOENT|Cannot find module|KeyNotFoundException/.test(r.output)) return 'NEEDS-INPUT';
  if (r.metrics?.failed > 0) return 'FAIL';
  if (r.code === 0) return 'PASS';
  // Unknown harness/runtime errors are never represented as proven rule differences.
  return /FAIL\b|Unhandled exception\. System.Exception:|Assertion/.test(r.output) ? 'FAIL' : 'NEEDS-INPUT';
}

function execute(command, args, cwd, env, timeout) {
  return new Promise(resolve => {
    const start = Date.now(); let output = '', timedOut = false, error = '';
    const child = cp.spawn(command, args, { cwd, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    const add = d => { if (output.length < 12 * 1024 * 1024) output += d.toString(); };
    child.stdout.on('data', add); child.stderr.on('data', add);
    child.on('error', e => { error = e.message; });
    const timer = setTimeout(() => {
      timedOut = true;
      if (process.platform === 'win32' && child.pid) cp.spawnSync('C:/Windows/System32/taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
      else child.kill('SIGKILL');
    }, Math.max(1, timeout));
    child.on('close', code => { clearTimeout(timer); resolve({ code, output: output + error, timedOut, seconds: (Date.now() - start) / 1000, command: [command, ...args] }); });
  });
}

function fingerprint(dir) {
  const hash = crypto.createHash('sha256');
  for (const f of fs.readdirSync(dir).sort()) if (/\.(cs|csproj|cjs)$/.test(f)) hash.update(f).update(fs.readFileSync(path.join(dir, f)));
  return hash.digest('hex');
}

async function main() {
  const argv = process.argv.slice(2), option = (k, fallback) => argv.includes(k) ? argv[argv.indexOf(k) + 1] : fallback;
  const repo = path.resolve(option('--repo', path.join(__dirname, '../../..'))), unity = path.join(repo, 'unity'), tools = path.join(unity, 'Tools');
  const out = path.resolve(option('--out', 'I:/EXODUSER-Storage/debug/oracle-sweep-20261104'));
  const library = path.join(unity, 'Library/OracleSweep');
  fs.mkdirSync(out, { recursive: true }); fs.mkdirSync(library, { recursive: true });
  function git(args, optional = false) {
    const r = cp.spawnSync('git', ['-C', repo, ...args], { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 });
    if (r.status && !optional) throw Error(r.stderr.toString());
    return r.status ? null : r.stdout;
  }
  const coreSha = git(['rev-parse', 'HEAD']).toString().trim();
  const resume = argv.includes('--resume'), summaryFile = path.join(out, 'summary.json');
  const old = resume && fs.existsSync(summaryFile) ? JSON.parse(fs.readFileSync(summaryFile)) : null;
  const webSha = old?.webSha || git(['rev-parse', option('--web-rev', 'origin/main')]).toString().trim();
  const inventory = discover(tools);
  const tree = git(['ls-tree', '-r', '--name-only', coreSha, '--', 'unity/Assets', 'unity/Tools']).toString().trim().split('\n');
  const webTree = git(['ls-tree', '-r', '--name-only', webSha]).toString().trim().split('\n');
  const hydrated = new Set();
  function blob(file, target, rev = coreSha) {
    const key = rev+':'+file+':'+target;
    if (hydrated.has(key) && fs.existsSync(target)) return target;
    const b = git(['show', `${rev}:${file}`], true);
    if (b === null) throw Error(`입력 없음: ${rev}:${file}`);
    fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, b); hydrated.add(key); return target;
  }
  const web = path.join(out, 'web');
  const webFile = f => blob(f, path.join(web, f), webSha);
  // Always overwrite the primary oracle source from the pinned Git blob, never a working copy.
  fs.mkdirSync(web, { recursive: true }); fs.writeFileSync(path.join(web, 'game.html'), git(['show', `${webSha}:game.html`]));
  webFile('index.html'); webFile('localization-runtime.js');
  const snapshot = { ...(old || {}), schema: 1, coreSha: old?.coreSha || coreSha, harnessSha: coreSha, webSha, started: old?.started || new Date().toISOString(), inventory, results: old?.results || [] };
  for(const row of snapshot.results.filter(x=>x.kind==='project')) {
    const parsed=extractMetrics(null,row.evidence||'');
    if(row.metrics){row.metrics.total??=parsed.total;row.metrics.failed??=parsed.failed;}
    if(row.classification==='BUILD-BREAK'&&classifyResult({code:1,output:row.evidence||''})==='SKIP') {row.classification='SKIP';row.reason='UnityEngine GUI/입력 소스가 필요함. Editor/Player 실행은 이 레인 범위 밖';}
  }
  const deadline = Date.parse(snapshot.started) + 2 * 60 * 60 * 1000;
  const only = option('--only', '').split(',').filter(Boolean);
  const want = id => !only.length || only.some(x => id === x || id.startsWith(x + '/'));
  const dotnet = option('--dotnet', process.platform === 'win32' ? 'C:/Program Files/dotnet/dotnet.exe' : 'dotnet');
  const dependency = option('--dependency-root', 'G:/exoduser');
  const sourceRoot = path.join(library, '_web-input');
  fs.mkdirSync(path.join(sourceRoot, 'godot/source_snapshot'), { recursive: true });
  fs.copyFileSync(path.join(web, 'game.html'), path.join(sourceRoot, 'godot/source_snapshot/game.html'));
  function sourceFile(rel) {
    const real = path.join(repo, rel);
    return fs.existsSync(real) ? real : blob(rel, path.join(library, '_sources', rel));
  }
  function globSource(pattern) {
    pattern = slash(pattern);
    if (!pattern.includes('*')) return sourceFile(pattern);
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replaceAll('**/', '\u0001').replaceAll('**', '\u0002').replaceAll('*', '[^/]*').replaceAll('\u0001', '(?:.*/)?').replaceAll('\u0002', '.*');
    return tree.filter(x => new RegExp('^' + escaped + '$').test(x)).map(sourceFile).join(';');
  }
  function stage(id, folder) {
    const home = path.join(library, id.replace(/[^\w.-]/g, '_')), project = path.join(home, 'unity'), dir = path.join(project, 'Tools', folder);
    fs.mkdirSync(dir, { recursive: true });
    // Only harness sources/fixtures are copied. Core remains the checkout's read-only source.
    for (const rel of tree.filter(x => x.startsWith('unity/Tools/' + folder + '/') && /\.(cs|csproj|cjs|js|json|config)$/i.test(x) && !/\/(runs|bin|obj)\//.test(x))) {
      const target = path.join(project, rel.slice(6)); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.copyFileSync(path.join(repo, rel), target);
    }
    // A number of old harness NuGet.Config files clear all feeds. Select the
    // installed .NET 8 SDK rather than SDK 10's missing net8 targeting pack.
    fs.writeFileSync(path.join(dir,'global.json'),JSON.stringify({sdk:{version:option('--sdk','8.0.301'),rollForward:'latestPatch'}}));
    const result = path.join(home, 'result.json');
    // Historical receipts are not fresh results.
    if (fs.existsSync(result)) fs.unlinkSync(result);
    const env = { ...process.env, DOTNET_CLI_HOME: path.join(home, '.dotnet'), DOTNET_ADD_GLOBAL_TOOLS_TO_PATH: 'false', DOTNET_NOLOGO: '1', DOTNET_CLI_TELEMETRY_OPTOUT: '1', DOTNET_SKIP_FIRST_TIME_EXPERIENCE: '1', DOTNET_CLI_DO_NOT_USE_MSBUILD_SERVER: '1', DOTNET_CLI_WORKLOAD_UPDATE_NOTIFY_DISABLE: 'true' };
    return { home, project, dir, result, env, oracle: path.join(dir, 'oracle.json') };
  }
  function data(c, name) { return blob('unity/Assets/Exoduser/Resources/Data/' + name, path.join(c.project, 'Assets/Exoduser/Resources/Data', name)); }
  function writeSummary() {
    snapshot.updated = new Date().toISOString();
    snapshot.counts = Object.fromEntries(categories.map(k => [k, snapshot.results.filter(x => x.classification === k).length]));
    snapshot.projectCounts = Object.fromEntries(categories.map(k => [k,snapshot.results.filter(x=>x.kind==='project'&&x.classification===k).length]));
    snapshot.scriptCounts = Object.fromEntries(categories.map(k => [k,snapshot.results.filter(x=>x.kind==='script'&&x.classification===k).length]));
    fs.writeFileSync(summaryFile, JSON.stringify(snapshot, null, 2) + '\n');
    const cell = v => String(v ?? '미집계').replaceAll('|', '\\|').replace(/\r?\n/g, ' ');
    const lines = ['# Unity Core oracle 일괄 점검', '', `- Core 기준: ${snapshot.coreSha}`, `- 하니스: ${coreSha}`, `- 웹 원문: ${webSha}`, `- 프로젝트 ${inventory.projects.length}개, 추출기/보조 스크립트 ${inventory.scripts.length}개. 스크립트는 별도 행이며 게임 규칙 검사 수에 합산하지 않는다.`, `- 분류: ${Object.entries(snapshot.counts).map(([k,v]) => k+' '+v).join(', ')}`, '', '| 이름 | 분류 | 검사 수/실패 수 | 실패 검사 이름 1~3개 또는 입력/오류 | 걸린 시간 |', '|---|---|---:|---|---:|'];
    for (const r of snapshot.results) lines.push(`| ${cell(r.id)} | ${r.classification} | ${cell(r.metrics?.total)}/${cell(r.metrics?.failed)} | ${cell((r.metrics?.names?.slice(0,3).join('; ') || r.reason || '').slice(0,550))} | ${r.seconds.toFixed(2)}초 |`);
    lines.push('', '## FAIL 상세', '');
    for (const r of snapshot.results.filter(x => x.classification === 'FAIL')) lines.push(`### ${r.id}`, '', '```text', r.evidence, '```', '');
    fs.writeFileSync(path.join(out, 'summary.md'), lines.join('\n') + '\n');
  }
  const reverseArgs = new Set(['defense-oracle', 'hunter-oracle', 'drop-oracle', 'druid-boss-oracle']);
  async function runProject(id) {
    const folder = id.split('/')[0], c = stage(id, folder), start = Date.now(), runs = [];
    const inputNotes = [], oracle = c.oracle;
    const exec = async (command, args, phase) => {
      const r = await execute(command, args, c.dir, c.env, Math.min(600000 - (Date.now()-start), deadline-Date.now())); r.phase = phase; runs.push(r); return r;
    };
    let args = [], exporter = 'export.cjs', exArgs = ['--source', path.join(web, 'game.html'), '--out', oracle, '--head', webSha];
    const needs = reason => ({ classification: 'NEEDS-INPUT', reason });
    try {
      if (folder === 'settings-persistence') args = ['all', path.join(c.home, 'isolated-settings')];
      else if (folder === 'character-storage') args = [path.join(c.home, 'isolated-roster'),c.result];
      else if (folder === 'stat-parity') { args = [path.join(c.dir, 'web-seeds.json')]; inputNotes.push('추적된 과거 web-seeds.json 표본'); }
      else if (folder === 'affix-defs-parity') { for (const f of ['affix_defs_web.json', 'forge_web.json', 'item_card_defs_web.json']) data(c,f); args = [path.join(c.dir,'affix_defs_before.json'), path.dirname(data(c,'forge_web.json'))]; }
      else if (folder === 'keybind-parity') args = [data(c, 'keybind_web.json')];
      else if (folder === 'language-oracle') args = [path.join(c.dir,'oracle.json'), c.result];
      else if (folder === 'pause-settings') args = [path.join(c.dir,'source-settings-oracle.json'), c.result];
      else if (folder === 'first-practice') args = [data(c,'first_practice.json'),c.result];
      else if (folder === 'startup-flow') args = [data(c,'startup_intro.json'),c.result];
      else if (folder === 'warrior-story') args = [data(c,'warrior_story.json'),c.result];
      else if (['a2-field','region-test','start-mobs-test','Tests'].includes(folder)) {
        const map = data(c,'ch1_map.json'); args = folder === 'Tests' ? [c.result,map,path.join(c.home,'map-oracle.json')] : folder === 'a2-field' ? [map] : [map,c.result];
        if (folder === 'Tests') {
          const mapInput = path.join(sourceRoot,'godot/data/map.json');
          if(fs.existsSync(mapInput))fs.unlinkSync(mapInput);
          const frozen = git(['rev-parse','origin/godot/main']).toString().trim();
          blob('godot/data/map.json',mapInput,frozen); inputNotes.push('정적 충돌 맵 입력: '+frozen+':godot/data/map.json; 실행식은 현재 웹');
          const r = await exec(process.execPath,[path.join(tools,'map-oracle.cjs'),sourceRoot,args[2]],'export'); if (r.code !== 0) return { ...needs('map-oracle 추출 입력/앵커 확인 필요'), runs };
        }
        if (folder === 'a2-field') data(c,'remodel_camera.json');
      } else if (folder === 'skill-ui') {
        for (const file of tree.filter(x=>/^unity\/Assets\/Exoduser\/Resources\/Data\/.*\.json$/.test(x))) data(c,path.basename(file));
        exArgs=[path.join(web,'game.html'),webFile('skill-forge.js')];
      } else if (folder === 'sound-wire-tests') {
        const files=tree.filter(x=>/^unity\/Assets\/Exoduser\/Runtime\/Native.*\.cs$/.test(x));
        for(const f of files) blob(f,path.join(c.project,f.slice(6)));
        args=[c.project];
      } else if (folder === 'gameplay-parity') {
        exporter='export-movement.cjs'; args=['--movement-oracle',data(c,'inventory_seed.json'),oracle,c.result];
      } else if (folder === 'character-ui') {
        if (path.basename(id) === 'CharacterTests.csproj') { exporter='name-oracle.cjs'; exArgs=[webFile('index.html')]; }
        else exporter=null;
      } else if (folder === 'lobby-oracle') {
        exporter=null;
        if (path.basename(id)==='LobbyTests.csproj') {
          for(const f of ['world-intro-player.js','world-intro-subtitles-data.js','world-intro-subtitles.js']) webFile(f);
          exporter='export.cjs'; exArgs=[web]; args=[c.result];
        }
      } else if (folder === 'comparison-oracle') return needs('inventory-oracle의 고정 과거 스냅샷 seed가 필요함. 현재 웹 seed로 재수출 필요');
      else if (folder === 'c01-field-oracle') {
        const frozen = git(['rev-parse','origin/godot/main']).toString().trim();
        const holes=blob('godot/data/ch1_map_source/si0.json',path.join(c.home,'si0.json'),frozen);
        inputNotes.push('소환굴 위치 입력: '+frozen+':godot/data/ch1_map_source/si0.json');exArgs.push('--holes',holes);
      }
      else if (folder === 'stage-flow-oracle') exArgs.push('--map',data(c,'ch1_map.json'));
      else if (folder === 'save-oracle') { blob('unity/Assets/Exoduser/Runtime/Core/InventoryData.cs',path.join(c.project,'Assets/Exoduser/Runtime/Core/InventoryData.cs')); }
      else if (folder === 'damage-parity-oracle') exArgs.push('--project',unity,'--dependency-root',dependency);
      else if (['feedback-oracle','hud-oracle','inventory-oracle','ki-slash-oracle'].includes(folder)) {
        // These exporters deliberately pin old source hashes or hard-code a working copy.
        return needs('고정 과거 스냅샷/공유 working-copy 경로 의존. 현재 origin/main 입력 계약으로 갱신 필요');
      } else if (['druid-remodel-test','parry-reflect-test','rm1-sound-timeline'].includes(folder)) args=[path.join(c.home,'output')];
      else if (['skill-sim-test','kill-wire-test','visual-parity-tests'].includes(folder)) args=[c.result];

      const exportPath = exporter && path.join(c.dir, exporter);
      if (exportPath && fs.existsSync(exportPath)) {
        if (fs.existsSync(oracle)) fs.unlinkSync(oracle);
        const r=await exec(process.execPath,[exportPath,...exArgs],'export');
        if(r.code!==0) return {classification:classifyResult(r),reason:'웹 추출 실패',runs};
        if(!args.length && folder!=='character-ui') args=reverseArgs.has(folder)?[oracle,c.result]:[c.result,oracle];
      }
      // Resolve relative Compile/Exists paths in the temporary project only.
      const stagedProj=path.join(c.dir,path.basename(id)); let xml=fs.readFileSync(stagedProj,'utf8');
      function resolveSource(value) {
        const normalized=value.replaceAll('$(ExoduserProject)',slash(unity));
        if(normalized.startsWith('$(')) return value;
        const absolute=path.resolve(path.join(tools,folder),normalized),rel=slash(path.relative(repo,absolute));
        if(rel.startsWith('unity/Assets/')) return globSource(rel);
        if(value.startsWith('../')) return slash(absolute);
        return value;
      }
      xml=xml.replace(/(Include|Exclude)="([^"]+)"/g,(m,k,v)=>`${k}="${mapPaths(v,resolveSource)}"`);
      xml=xml.replace(/Exists\('([^']+)'\)/g,(m,v)=>`Exists('${resolveSource(v)}')`);
      fs.writeFileSync(stagedProj,xml);
      const r=await exec(dotnet,['run','--project',stagedProj,'-c','Release','--verbosity','quiet','-p:ExoduserProject='+slash(unity),'-p:UseSharedCompilation=false','-p:NuGetAudit=false','--',...args],'dotnet');
      let receipt=null;if(fs.existsSync(c.result)){try{receipt=JSON.parse(fs.readFileSync(c.result,'utf8'));}catch{}}
      const metrics=extractMetrics(receipt,r.output);r.metrics=metrics;
      const classification=classifyResult(r);
      return {classification,metrics,runs,inputNotes,reason:r.timedOut?'10분/전체 시간 상한':classification==='PASS'?undefined:r.output.split(/\r?\n/).find(x=>/error |Exception|FAIL|Error:/.test(x))};
    } catch(e) {return {...needs(e.message),runs};}
    finally { /* The caller persists evidence before the Library is cleaned at handoff. */ }
  }
  for(const id of inventory.projects.filter(want)) {
    if(Date.now()>=deadline) break;
    const before=snapshot.results.find(x=>x.id===id), sig=crypto.createHash('sha256').update(fingerprint(path.join(tools,path.dirname(id)))).update(fs.readFileSync(__filename)).digest('hex');
    if(before && (!argv.includes('--retry-changed') || before.fingerprint===sig)) continue;
    // Preparation errors do not run a C# check. Permit its first corrected
    // compile, but never repeat two failed executions of the same phase.
    const preparationOnly = (before?.reason?.startsWith('입력 없음:') && !before?.commands?.some(c=>c.phase==='dotnet')) || (id==='character-storage/StoreTests.csproj'&&/IndexOutOfRangeException/.test(before?.evidence||'')&&/NU1100/.test(before?.previous?.evidence||''));
    if(before && ((!preparationOnly && before.attempts>=2) || before.classification==='FAIL')) continue;
    const t=Date.now(), r=await runProject(id), runs=r.runs||[];
    const output=runs.map(x=>x.output).join('\n');
    const entry={id,kind:'project',...r,seconds:(Date.now()-t)/1000,fingerprint:sig,attempts:(before?.attempts||0)+1,evidence:output,previous:before?{classification:before.classification,reason:before.reason,evidence:before.evidence}:undefined};
    delete entry.runs;
    entry.commands=runs.map(({output,...x})=>x);
    snapshot.results=snapshot.results.filter(x=>x.id!==id);snapshot.results.push(entry);writeSummary();
    console.log(`${id}: ${entry.classification} (${entry.seconds.toFixed(1)}초)`);
  }
  // Every exporter is inventoried, including helpers with no C# project.
  for(const id of inventory.scripts) {
    const before=snapshot.results.find(x=>x.id===id);
    snapshot.results=snapshot.results.filter(x=>x.id!==id);
    if(before?.command){snapshot.results.push(before);continue;}
    const folder=id.includes('/')?id.split('/')[0]:null;
    const owner=snapshot.results.find(x=>x.kind==='project'&&(!folder||x.id.startsWith(folder+'/'))&&x.commands?.some(c=>c.command?.[1]?.endsWith('/'+id.split('/').at(-1))||c.command?.[1]?.endsWith('\\'+id.split('/').at(-1))));
    const command=owner?.commands?.find(c=>c.phase==='export');
    if(!command&&want(id)&&['inv-salvage-oracle/export.cjs','character-ui/export.cjs','drop-oracle/export-tables.cjs','enemy-hurt-oracle/make-h3-oracle.cjs'].includes(id)) {
      const c=stage('script-'+id,folder);fs.mkdirSync(path.join(c.project,'Assets/Exoduser/Resources/Data'),{recursive:true});
      let args;
      if(id==='inv-salvage-oracle/export.cjs')args=[path.join(web,'game.html'),c.oracle,webSha];
      if(id==='character-ui/export.cjs')args=[webFile('index.html')];
      if(id==='drop-oracle/export-tables.cjs')args=[path.join(web,'game.html'),path.join(c.home,'DropTablesData.cs'),webSha];
      if(id==='enemy-hurt-oracle/make-h3-oracle.cjs'){
        const fresh=path.join(library,'enemy-hurt-oracle_EnemyHurtTests.csproj/unity/Tools/enemy-hurt-oracle/oracle.json');
        if(fs.existsSync(fresh)){fs.copyFileSync(fresh,c.oracle);args=['--in',c.oracle,'--out',path.join(c.home,'oracle-h3.json')];}
      }
      if(args){const r=await execute(process.execPath,[path.join(c.dir,path.basename(id)),...args],c.dir,c.env,Math.min(600000,deadline-Date.now()));snapshot.results.push({id,kind:'script',classification:classifyResult({...r,phase:'export'}),seconds:r.seconds,command:r.command,evidence:r.output,reason:'격리 폴더에서 추출/파생 생성만 검증. Core 대조 검사가 아님'});continue;}
    }
    const status=command?(command.code===0?'PASS':'NEEDS-INPUT'):'NEEDS-INPUT';
    snapshot.results.push({id,kind:'script',classification:status,seconds:command?.seconds||0,reason:owner?'프로젝트 선행 추출 단계: '+owner.id:'별도 입력/자산/영수증 또는 보조 파생 입력 필요; 미실행',owner:owner?.id});
  }
  for(const id of inventory.projects) if(!snapshot.results.some(x=>x.id===id)) snapshot.results.push({id,kind:'project',classification:'NEEDS-INPUT',seconds:0,reason:'전체 2시간 상한 또는 --only 범위 밖; 미실행'});
  writeSummary();
  console.log(JSON.stringify(snapshot.counts));
}
module.exports={discover,extractMetrics,classifyResult,mapPaths};
if(require.main===module) main().catch(e=>{console.error(e.stack);process.exitCode=1;});
