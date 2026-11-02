using System;
using System.Collections.Generic;
using Exoduser.UnityPort.Core.Combat;

namespace Exoduser.UnityPort.Core
{
    public sealed partial class Simulation
    {
        readonly Dictionary<string, double> loadedDisplaySkillLevels = new Dictionary<string, double>();
        // 미이식 저장 레벨은 표시만 한다. 실행/학습/저장 소유 목록은 넓히지 않는다.
        void CaptureDisplaySkillLevels(Dictionary<string, double> source)
        {
            loadedDisplaySkillLevels.Clear();
            foreach (var pair in source) if (!IsPorted(pair.Key)) loadedDisplaySkillLevels[pair.Key] = pair.Value;
        }
        public int SkillDisplayLevel(string id)
        {
            if (id == null) return 0;
            if (IsPorted(id)) return id == "kiSlash" ? Math.Max(1, Config.KiSlashLevel) : Skills.Level(id);
            double level; return loadedDisplaySkillLevels.TryGetValue(id, out level) && level >= 1 ? Js.Int(level) : Skills.Level(id);
        }
    }
}
