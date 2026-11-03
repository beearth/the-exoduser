using System;
using System.Collections.Generic;
using System.Globalization;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    public static class NativeHellGateLabels
    {
        [Serializable] sealed class Locale { public string code,sealedGate,openGate,progress,progressNoAngler,anglerAlive,anglerDead,purified,direction; }
        [Serializable] sealed class Bundle { public Locale[] entries; }
        static readonly Dictionary<string,Locale> locales = new Dictionary<string,Locale>();
        static void Load()
        {
            if (locales.Count > 0) return;
            var asset = Resources.Load<TextAsset>("Data/hellgate_objectives");
            if (asset == null) throw new InvalidOperationException("Missing hellgate_objectives locale resource");
            foreach (var entry in JsonUtility.FromJson<Bundle>(asset.text).entries) locales.Add(entry.code,entry);
        }
        public static void Lines(NativeHellGateObjective objective,string code,out string heading,out string detail)
        {
            Load();
            if (!locales.TryGetValue(LobbyLanguage.Normalize(code),out var text)) text=locales["en"];
            heading=string.Format(CultureInfo.InvariantCulture,objective.GateOpen?text.openGate:text.sealedGate,objective.Cleared);
            detail=objective.GateOpen?text.direction:objective.RegionCleared?text.purified:
                string.Format(CultureInfo.InvariantCulture,objective.HasAngler?text.progress:text.progressNoAngler,objective.Kills,objective.Required,objective.AnglerAlive?text.anglerAlive:text.anglerDead);
        }
        public static string OpenNotice(string code)
        {
            Load(); if(!locales.TryGetValue(LobbyLanguage.Normalize(code),out var text))text=locales["en"];
            return string.Format(CultureInfo.InvariantCulture,text.openGate,4);
        }
    }
}
