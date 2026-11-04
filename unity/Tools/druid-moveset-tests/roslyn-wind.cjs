// Adapter for the repository's offline Roslyn checker. Historical Bee templates
// omit WindModule, now required by existing A2RProps3D.Terrain.cs. No Unity starts.
const cp = require('node:child_process');
const editor = process.env.B1_UNITY_EDITOR || 'G:/unity/Editor/6000.6.7f1/Editor/Data';
const result = cp.spawnSync(editor + '/DotNetSdk/dotnet.exe', [
  editor + '/DotNetSdk/sdk/8.0.318/Roslyn/bincore/csc.dll', ...process.argv.slice(2),
  '-r:' + editor + '/Managed/UnityEngine/UnityEngine.WindModule.dll',
], { encoding: 'utf8', windowsHide: true, maxBuffer: 32 * 1024 * 1024 });
process.stdout.write(result.stdout || ''); process.stderr.write(result.stderr || '');
if (result.error) process.stderr.write(String(result.error));
process.exitCode = result.status ?? 1;
