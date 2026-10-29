using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using UnityEditor;
using UnityEngine;
using UnityEngine.Audio;

namespace Exoduser.UnityPort.Editor
{
    // RM-1 sound track A: builds Resources/Audio/Exoduser.mixer (groups, snapshots, Tell ducking, exposed volumes) through the editor's internal
    // AudioMixerController API (reflection: the types are internal). Run once; the asset is committed. -executeMethod ...Rm1SoundMixerBuilder.Build
    public static class Rm1SoundMixerBuilder
    {
        const string AssetPath = "Assets/Exoduser/Resources/Audio/Exoduser.mixer";
        const BindingFlags All = BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.Static;
        static Type FindType(string full)
        {
            foreach (var a in AppDomain.CurrentDomain.GetAssemblies()) { var t = a.GetType(full, false); if (t != null) return t; }
            throw new InvalidOperationException("Editor type not found: " + full);
        }
        static object Call(object target, string name, params object[] args)
        {
            var t = target as Type ?? target.GetType();
            var m = t.GetMethods(All).FirstOrDefault(x => x.Name == name && x.GetParameters().Length == args.Length && Fits(x, args));
            if (m == null) throw new MissingMethodException(t.Name + "." + name + "/" + args.Length);
            return m.Invoke(target is Type ? null : target, args);
        }
        static bool Fits(MethodInfo m, object[] args)
        {
            var ps = m.GetParameters();
            for (int i = 0; i < ps.Length; i++) { var pt = ps[i].ParameterType.IsByRef ? ps[i].ParameterType.GetElementType() : ps[i].ParameterType; if (args[i] != null && !pt.IsAssignableFrom(args[i].GetType())) return false; }
            return true;
        }
        static object Get(object target, string name)
        {
            var t = target.GetType();
            var p = t.GetProperty(name, All); if (p != null) return p.GetValue(target);
            var f = t.GetField(name, All); if (f != null) return f.GetValue(target);
            throw new MissingMemberException(t.Name + "." + name);
        }
        static float F(string name, float fallback) { return float.Parse(Arg(name, fallback.ToString(System.Globalization.CultureInfo.InvariantCulture)), System.Globalization.CultureInfo.InvariantCulture); }
        static string Arg(string name, string fallback)
        {
            var a = Environment.GetCommandLineArgs(); for (int i = 0; i < a.Length - 1; i++) if (a[i] == name) return a[i + 1]; return fallback;
        }

        public static void Build()
        {
            var log = new StringBuilder();
            try { BuildInner(log); log.AppendLine("RESULT build ok"); }
            catch (Exception e) { log.AppendLine("RESULT build FAILED: " + e); File.WriteAllText(Arg("-output", "mixer_build.txt"), log.ToString()); throw; }
            File.WriteAllText(Arg("-output", "mixer_build.txt"), log.ToString());
        }

        // Sets the Duck Volume numbers on the saved asset. The raw parameter units differ from the Inspector's: threshold dB, ratio as a factor (2 = 200 %), times in seconds.
        public static void ConfigureDuck()
        {
            var log = new StringBuilder();
            try
            {
                var effectType = FindType("UnityEditor.Audio.AudioMixerEffectController");
                var ctrl = AssetDatabase.LoadAssetAtPath<AudioMixer>(AssetPath);
                var snaps = ((Array)Get(ctrl, "snapshots")).Cast<object>().ToList();
                var all = (System.Collections.IEnumerable)Call(ctrl, "GetAllAudioGroupsSlow");
                foreach (var g in all)
                    foreach (var fx in (Array)Get(g, "effects"))
                    {
                        if ((bool)Call(fx, "IsSend"))
                        {   // the Tell sends: full level (the default send level is silent)
                            var mixGuid = Call(fx, "GetGUIDForMixLevel");
                            log.AppendLine("send mixGuid=" + mixGuid + " enableWetMix=" + Get(fx, "enableWetMix") + " bypass=" + Get(fx, "bypass") + " target=" + ((UnityEngine.Object)Get(fx, "sendTarget")).name);
                            foreach (var sn in snaps) { object[] args = { mixGuid, 0f }; bool has = (bool)Call(sn, "GetValue", args); log.AppendLine("  snapshot " + ((UnityEngine.Object)sn).name + " mixlevel stored=" + has + " value=" + args[1]); }
                            foreach (var s in snaps) Call(s, "SetValue", mixGuid, F("-sendLevel", 0f));
                            foreach (var sn in snaps) { object[] args = { mixGuid, 0f }; bool has = (bool)Call(sn, "GetValue", args); log.AppendLine("  after set: snapshot " + ((UnityEngine.Object)sn).name + " stored=" + has + " value=" + args[1]); }
                            // the Send effect's own parameter is "Send level" (default -80 dB = silent); the wet mix level is a different thing
                            foreach (var cand in new[] { "Send level", "Send Level", "Level" })
                            {
                                var guid = Call(fx, "GetGUIDForParameter", cand);
                                bool ok = (bool)Call(fx, "ContainsParameterGUID", guid);
                                log.AppendLine("send on " + ((UnityEngine.Object)g).name + " param '" + cand + "' valid=" + ok + (ok ? " before " + Call(fx, "GetValueForParameter", ctrl, snaps[0], cand) : ""));
                                if (!ok) continue;
                                foreach (var s in snaps) Call(s, "SetValue", guid, F("-sendLevel", 0f));
                                log.AppendLine("send on " + ((UnityEngine.Object)g).name + " '" + cand + "' now " + Call(fx, "GetValueForParameter", ctrl, snaps[0], cand) + " target " + (Get(fx, "sendTarget") != null));
                                break;
                            }
                            continue;
                        }
                        if ((string)Get(fx, "effectName") == "Compressor")
                        {   // peak control behind the SFX fader (Unity's compressor has no ratio: above the threshold the gain follows the attack / release)
                            foreach (var kv in new[] { new KeyValuePair<string, float>("Threshold", ((UnityEngine.Object)g).name == "Master" ? F("-masterThr", -8f) : F("-compThr", -6f)), new KeyValuePair<string, float>("Attack", F("-compAtk", 10f)), new KeyValuePair<string, float>("Release", ((UnityEngine.Object)g).name == "Master" ? F("-masterRel", 10f) : F("-compRel", 40f)), new KeyValuePair<string, float>("Make up gain", F("-compMakeup", 0f)) })
                            {
                                var guid = Call(fx, "GetGUIDForParameter", kv.Key);
                                foreach (var s in snaps) Call(s, "SetValue", guid, kv.Value);
                                log.AppendLine("compressor " + kv.Key + " now " + Call(fx, "GetValueForParameter", ctrl, snaps[0], kv.Key));
                            }
                            continue;
                        }
                        if (!(bool)Call(fx, "IsDuckVolume")) continue;
                        log.AppendLine("duck on " + ((UnityEngine.Object)g).name);
                        foreach (var kv in new[] { new KeyValuePair<string, float>("Threshold", F("-duckThr", -45f)), new KeyValuePair<string, float>("Ratio", F("-duckRatio", 1.33f)), new KeyValuePair<string, float>("Attack Time", .01f), new KeyValuePair<string, float>("Release Time", .25f), new KeyValuePair<string, float>("Knee", 0f) })
                        {
                            var guid = Call(fx, "GetGUIDForParameter", kv.Key);
                            log.AppendLine("  " + kv.Key + " guid=" + guid + " contains=" + Call(fx, "ContainsParameterGUID", guid));
                            foreach (var s in snaps) Call(s, "SetValue", guid, kv.Value);
                            log.AppendLine("  " + kv.Key + " now " + Call(fx, "GetValueForParameter", ctrl, snaps[0], kv.Key) + " / " + Call(fx, "GetValueForParameter", ctrl, snaps[1], kv.Key));
                        }
                    }
                EditorUtility.SetDirty(ctrl); AssetDatabase.SaveAssets();
                log.AppendLine("RESULT duck ok");
            }
            catch (Exception e) { log.AppendLine("RESULT duck FAILED: " + e); }
            File.WriteAllText(Arg("-output", "duck.txt"), log.ToString());
        }

        static void BuildInner(StringBuilder log)
        {
            if (File.Exists(AssetPath)) { if (Array.IndexOf(Environment.GetCommandLineArgs(), "-force") < 0) throw new InvalidOperationException("Exoduser.mixer already exists: pass -force to rebuild"); AssetDatabase.DeleteAsset(AssetPath); }
            var controllerType = FindType("UnityEditor.Audio.AudioMixerController");
            var effectType = FindType("UnityEditor.Audio.AudioMixerEffectController");
            var exposedType = FindType("UnityEditor.Audio.ExposedAudioParameter");
            var ctrl = Call(controllerType, "CreateMixerControllerAtPath", AssetPath);
            var master = Get(ctrl, "masterGroup");
            object NewGroup(string name, object parent)
            {
                var g = Call(ctrl, "CreateNewGroup", name, false); Call(ctrl, "AddChildToParent", g, parent); return g;
            }
            var music = NewGroup("Music", master); var ambience = NewGroup("Ambience", master); var sfx = NewGroup("SFX", master);
            var sfxChildren = new[] { "Tell", "PlayerHit", "Skill", "Voice", "EnemyHit", "Death", "Step", "UI" };
            var sub = sfxChildren.ToDictionary(n => n, n => NewGroup(n, sfx));

            // snapshots: the controller starts with one; clone it for Boss
            var snaps = ((Array)Get(ctrl, "snapshots")).Cast<object>().ToList();
            ((UnityEngine.Object)snaps[0]).name = "Explore";
            Call(ctrl, "CloneNewSnapshotFromTarget", false);
            snaps = ((Array)Get(ctrl, "snapshots")).Cast<object>().ToList();
            if (snaps.Count != 2) throw new InvalidOperationException("expected 2 snapshots, got " + snaps.Count);
            ((UnityEngine.Object)snaps[1]).name = "Boss";
            log.AppendLine("snapshots: " + string.Join(", ", snaps.Select(s => ((UnityEngine.Object)s).name)));

            // Tell ducking: one Send per target on Tell, one Duck Volume on each ducked group (before its Attenuation)
            object AddEffect(object group, string effectName, int index)
            {
                var fx = Activator.CreateInstance(effectType, effectName);
                Call(fx, "PreallocateGUIDs"); Call(ctrl, "AddNewSubAsset", fx, false);
                Call(group, "InsertEffect", fx, index); return fx;
            }
            object tell = sub["Tell"];
            foreach (var target in new[] { sub["EnemyHit"], ambience })
            {
                var duck = AddEffect(target, "Duck Volume", 0);
                var send = AddEffect(tell, "Send", 0);   // pre-fader: the sidechain does not depend on the Tell fader
                effectType.GetProperty("sendTarget", All).SetValue(send, duck);
                foreach (var s in snaps)
                {
                    // spec: -4 dB, attack 10 ms, release 250 ms. A ratio of 150 % turns about 13 dB over the threshold into about -4 dB.
                    Call(duck, "SetValueForParameter", ctrl, s, "Threshold", -20f);
                    Call(duck, "SetValueForParameter", ctrl, s, "Ratio", 150f);
                    Call(duck, "SetValueForParameter", ctrl, s, "Attack Time", 10f);
                    Call(duck, "SetValueForParameter", ctrl, s, "Release Time", 250f);
                    Call(duck, "SetValueForParameter", ctrl, s, "Knee", 0f);
                    Call(send, "SetValueForMixLevel", ctrl, s, 0f);
                }
                foreach (var name in new[] { "Threshold", "Ratio", "Attack Time", "Release Time", "Knee" })
                    log.AppendLine("duck on " + ((UnityEngine.Object)target).name + " " + name + " = " + Call(duck, "GetValueForParameter", ctrl, snaps[0], name));
            }
            // peak control: a Compressor behind the SFX fader (RM-1 sound 2nd submission); its threshold is exposed so a measurement pass can switch it off
            var comp = AddEffect(sfx, "Compressor", ((Array)Get(sfx, "effects")).Length);
            foreach (var name in new[] { "Threshold", "Ratio", "Attack", "Release", "Make up gain" })
            {
                object guid = Call(comp, "GetGUIDForParameter", name);
                log.AppendLine("compressor " + name + " guid ok=" + Call(comp, "ContainsParameterGUID", guid) + " default=" + Call(comp, "GetValueForParameter", ctrl, snaps[0], name));
            }
            // second stage: a fast Compressor on Master that only catches what the SFX stage lets through above its threshold (peaks), so the overall level hardly moves
            var mcomp = AddEffect(master, "Compressor", ((Array)Get(master, "effects")).Length);
            // Boss snapshot: Ambience -8 dB
            Call(ambience, "SetValueForVolume", ctrl, snaps[1], -8f);
            Call(ambience, "SetValueForVolume", ctrl, snaps[0], 0f);

            // exposed settings volumes: SfxVol (SFX group), MusicVol (Music group). The forest bed follows the SFX volume in code (a mixer parameter would fight the Boss snapshot).
            var exposed = Array.CreateInstance(exposedType, 5);
            foreach (var pair in new[] { new { name = "SfxVol", group = sfx, fx = (object)null }, new { name = "MusicVol", group = music, fx = (object)null }, new { name = "TellVol", group = tell, fx = (object)null }, new { name = "SfxCompThreshold", group = sfx, fx = comp }, new { name = "MasterCompThreshold", group = master, fx = mcomp } })
            {
                object item = Activator.CreateInstance(exposedType);
                exposedType.GetField("guid").SetValue(item, pair.fx != null ? Call(pair.fx, "GetGUIDForParameter", "Threshold") : Call(pair.group, "GetGUIDForVolume"));
                exposedType.GetField("name").SetValue(item, pair.name);
                exposed.SetValue(item, pair.name == "SfxVol" ? 0 : pair.name == "MusicVol" ? 1 : pair.name == "TellVol" ? 2 : pair.name == "SfxCompThreshold" ? 3 : 4);
            }
            controllerType.GetProperty("exposedParameters", All).SetValue(ctrl, exposed);
            EditorUtility.SetDirty((UnityEngine.Object)ctrl);
            AssetDatabase.SaveAssets(); AssetDatabase.ImportAsset(AssetPath, ImportAssetOptions.ForceUpdate);

            // read back through the runtime API
            var mixer = AssetDatabase.LoadAssetAtPath<AudioMixer>(AssetPath);
            log.AppendLine("loaded: " + (mixer != null));
            foreach (var path in new[] { "Master/Music", "Master/Ambience", "Master/SFX" }.Concat(sfxChildren.Select(n => "Master/SFX/" + n)))
                log.AppendLine("group " + path + ": " + mixer.FindMatchingGroups(path).Length);
            log.AppendLine("snapshot Explore " + (mixer.FindSnapshot("Explore") != null) + ", Boss " + (mixer.FindSnapshot("Boss") != null));
            float v; log.AppendLine("SfxVol exposed: " + mixer.GetFloat("SfxVol", out v) + " (" + v + ")"); log.AppendLine("MusicVol exposed: " + mixer.GetFloat("MusicVol", out v) + " (" + v + ")");
        }
    }
}
