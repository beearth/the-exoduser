using System;
using System.Collections;
using System.IO;
using System.Text;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // `--unity-c04-dump -output <dir>`: writes <dir>/unity_1_1_dump.json in the C04-ORACLE format (docs/engine/c04_oracle/README.md section 5) from the live 1-1 run:
    // walk = SourceMap.Blocked at every tile centre (0 walk / 1 blocked, one 200-char string per row), start = player spawn tile, exit = StageFlow field exit tiles,
    // spawns = the 소환굴 of the run.
    public sealed partial class NativeGame
    {
        IEnumerator C04Dump()
        {
            yield return null; yield return null;
            string output = Argument("-output"); if (string.IsNullOrEmpty(output)) { Application.Quit(2); yield break; }
            Directory.CreateDirectory(output);
            var sim = Simulation; var m = Map; int N = m.Data.width, M = m.Data.height, T = m.Data.tileSize;
            var sb = new StringBuilder();
            sb.Append("{\"note\":\"Unity 1-1 field after ResetRun (stage ").Append(sim.Config.StageIndex).Append("), no skills, no enemies\",\"walk\":[");
            for (int ty = 0; ty < M; ty++)
            {
                if (ty > 0) sb.Append(',');
                sb.Append('"'); for (int tx = 0; tx < N; tx++) sb.Append(m.Blocked(tx * T + T / 2f, ty * T + T / 2f) ? '1' : '0'); sb.Append('"');
            }
            sb.Append("],\"start\":[").Append((int)(sim.Player.X / T)).Append(',').Append((int)(sim.Player.Y / T)).Append("],\"exit\":[");
            bool first = true; foreach (var e in sim.Stage.Exits) { if (!first) sb.Append(','); first = false; sb.Append('[').Append(e.X).Append(',').Append(e.Y).Append(']'); }
            sb.Append("],\"spawns\":[");
            first = true;
            if (sim.SpawnHoles != null) foreach (var h in sim.SpawnHoles.Holes)
            {
                if (!first) sb.Append(','); first = false;
                sb.Append("{\"room\":").Append(h.Room).Append(",\"tx\":").Append((int)(h.X / T)).Append(",\"ty\":").Append((int)(h.Y / T)).Append(",\"grade\":0}");
            }
            sb.Append("]}");
            File.WriteAllText(Path.Combine(output, "unity_1_1_dump.json"), sb.ToString(), new UTF8Encoding(false));
            yield return null; Application.Quit(0);
        }
    }
}
