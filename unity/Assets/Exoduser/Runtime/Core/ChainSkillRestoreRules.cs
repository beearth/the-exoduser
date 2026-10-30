using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    public static class ChainSkillRestoreRules
    {
        static double Level(Dictionary<string, double> skills, string id) { double value; return skills.TryGetValue(id, out value) ? value : 0; }
        public static Dictionary<string, double> Normalize(Dictionary<string, double> source)
        {
            if (source == null) return null;
            var skills = new Dictionary<string, double>(source);
            double legacy = Level(skills, "chainStun");
            if (legacy != 0 && !double.IsNaN(legacy) && Level(skills, "chainAssault") == 0) { skills["chainAssault"] = legacy; skills.Remove("chainStun"); }
            if (Level(skills, "chainAssault") >= 1 && Level(skills, "chainSlam") == 0) skills["chainSlam"] = 1;
            if (Level(skills, "chainSlam") >= 1 && Level(skills, "chainAssault") == 0) skills["chainAssault"] = 1;
            return skills;
        }
        static bool Truthy(JsonValue value)
        {
            if (value == null || value.Kind == JsonKind.Null) return false;
            if (value.Kind == JsonKind.Bool) return value.Bool;
            if (value.Kind == JsonKind.Number) return value.Number != 0 && !double.IsNaN(value.Number);
            if (value.Kind == JsonKind.String) return !string.IsNullOrEmpty(value.Text);
            return true;
        }
        public static bool LegacyAliasMoved(JsonValue raw)
        {
            return raw != null && raw.Kind == JsonKind.Object && Truthy(raw.Get("chainStun")) && !Truthy(raw.Get("chainAssault"));
        }
        public static JsonValue NormalizeProficiency(JsonValue raw)
        {
            if (raw == null || raw.Kind != JsonKind.Object || !Truthy(raw.Get("chainStun"))) return raw;
            var result = JsonValue.NewObject();
            foreach (var pair in raw.Members) if (pair.Key != "chainStun") result.Set(pair.Key, pair.Value);
            result.Set("chainAssault", raw.Get("chainStun"));
            return result;
        }
    }
}
