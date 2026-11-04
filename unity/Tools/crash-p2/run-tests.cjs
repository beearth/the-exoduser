// Offline boundary tests. Unity rendering/compilation is deliberately not exercised.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const root = path.resolve(__dirname, '../../..');
const lane = 'I:/EXODUSER-Storage/codex-takeover/crash-p2';
const scratch = path.join(lane, 'test-current');
const runtime = path.join(root, 'unity/Assets/Exoduser/Runtime');
const read = name => fs.readFileSync(path.join(runtime, name), 'utf8').replaceAll('\r\n', '\n');
function between(source, start, end) {
  const a = source.indexOf(start), b = source.indexOf(end, a + start.length);
  if (a < 0 || b < 0) throw new Error(`Source boundary missing: ${start} / ${end}`);
  return source.slice(a + start.length, b);
}
const pause = between(read('NativePauseMenu.A15Web.cs'),
  'var noticeStyle=St(11,FontStyle.Normal,Dim,TextAnchor.MiddleLeft);',
  '    Txt(noticeRect,notice,11,Dim);');
// Execute the actual pre-render branch; the GPU body after this boundary is excluded.
const arabic = between(read('NativeDemoArabicText.cs'),
  'internal static bool Draw(Rect rect,string text,GUIStyle style,string paintId)\n  {',
  '   float scale=');
const arabicDetector = read('NativeDemoArabicText.cs').split(/\r?\n/)
  .find(line => line.includes('static bool Arabic(string text)'));
if (!arabicDetector) throw new Error('Arabic detector missing');
fs.mkdirSync(scratch, { recursive: false });
let exitCode = 1;
try {
  fs.writeFileSync(path.join(scratch, 'NuGet.Config'),
    '<configuration><packageSources><clear /></packageSources></configuration>\n');
  const xml = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
  const sources = [
    path.join(runtime, 'NativePetBubbleCatalog.cs'),
    path.join(runtime, 'NativePetBubbleQueue.cs'),
    path.join(runtime, 'NativeDemoText.cs'),
    path.join(runtime, 'Core/LobbyLanguage.cs'),
    path.join(__dirname, 'Program.cs'), path.join(__dirname, 'UnityBoundaryStubs.cs'),
    path.join(scratch, 'ExtractedBoundaries.cs')
  ];
  fs.writeFileSync(path.join(scratch, 'CrashP2Tests.csproj'), `<Project Sdk="Microsoft.NET.Sdk">
 <PropertyGroup>
  <OutputType>Exe</OutputType><TargetFramework>net10.0</TargetFramework>
  <EnableDefaultCompileItems>false</EnableDefaultCompileItems><ImplicitUsings>disable</ImplicitUsings>
  <Nullable>disable</Nullable><NoWarn>CS0649</NoWarn><NuGetAudit>false</NuGetAudit>
 </PropertyGroup>
 <ItemGroup>${sources.map(p => `<Compile Include="${xml(p)}" />`).join('')}</ItemGroup>
</Project>\n`);
  fs.writeFileSync(path.join(scratch, 'ExtractedBoundaries.cs'), `using System;
using UnityEngine;
using UnityEngine.UIElements;
using FontAsset=UnityEngine.TextCore.Text.FontAsset;
namespace Exoduser.UnityPort {
 internal static class PauseMeasurementBoundary {
  internal static Rect Measure() {
   string savedLabel="saved",notice="notice";var savedStyle=new GUIStyle();var noticeStyle=new GUIStyle();
${pause}
   return noticeRect;
  }
 }
 internal static class NativeDemoArabicText {
  static PanelSettings template;static FontAsset font;
${arabicDetector}
  internal static bool Draw(Rect rect,string text,GUIStyle style,string paintId) {
${arabic}
   return true; // Rendering beyond the tested boundary is not simulated.
  }
 }
}\n`);
  const env = { ...process.env, DOTNET_CLI_HOME: path.join(scratch, 'cli'),
    NUGET_PACKAGES: path.join(scratch, 'packages'), TEMP: scratch, TMP: scratch,
    DOTNET_CLI_TELEMETRY_OPTOUT: '1', DOTNET_SKIP_FIRST_TIME_EXPERIENCE: '1',
    DOTNET_NOLOGO: '1', DOTNET_CLI_WORKLOAD_UPDATE_NOTIFY_DISABLE: 'true',
    DOTNET_ADD_GLOBAL_TOOLS_TO_PATH: 'false', MSBuildEnableWorkloadResolver: 'false',
    MSBUILDDISABLENODEREUSE: '1' };
  const run = args => {
    const result = cp.spawnSync('dotnet', args, {
      cwd: scratch, env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true
    });
    const output = (result.stdout || '') + (result.stderr || '');
    fs.appendFileSync(path.join(lane, 'tests.log'), output);
    process.stdout.write(output);
    if (result.error) throw result.error;
    return result.status ?? 1;
  };
  fs.writeFileSync(path.join(lane, 'tests.log'), 'Offline net10.0 boundary tests\n');
  const build = run(['build', 'CrashP2Tests.csproj', '--configfile', 'NuGet.Config',
    '--nologo', '--verbosity', 'quiet', '--disable-build-servers']);
  exitCode = build || run([path.join(scratch, 'bin/Debug/net10.0/CrashP2Tests.dll'), root]);
} finally {
  const resolved = fs.realpathSync(scratch);
  if (path.dirname(resolved).toLowerCase() !== fs.realpathSync(lane).toLowerCase())
    throw new Error(`Refusing cleanup outside lane: ${resolved}`);
  fs.rmSync(resolved, { recursive: true });
  console.log('Temporary outputs removed: ' + scratch);
}
process.exitCode = exitCode;
