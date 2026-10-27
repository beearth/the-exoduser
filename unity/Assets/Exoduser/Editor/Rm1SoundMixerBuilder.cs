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
            for (int i = 0; i < ps.Length; i++) if (args[i] != null && !ps[i].ParameterType.IsAssignableFrom(args[i].GetType())) return false;
            return true;
        }
        static object Get(object target, string name)
        {
            var t = target.GetType();
            var p = t.GetProperty(name, All); if (p != null) return p.GetValue(target);
            var f = t.GetField(name, All); if (f != null) return f.GetValue(target);
            throw new MissingMemberException(t.Name + "." + name);
        }
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
                            log.AppendLine("send on " + ((UnityEngine.Object)g).name + " before " + Call(fx, "GetValueForMixLevel", ctrl, snaps[0]));
                            foreach (var s in snaps) Call(fx, "SetValueForMixLevel", ctrl, s, 0f);
                            log.AppendLine("send on " + ((UnityEngine.Object)g).name + " now " + Call(fx, "GetValueForMixLevel", ctrl, snaps[0]) + " target " + (Get(fx, "sendTarget") != null));
                            continue;
                        }
                        if (!(bool)Call(fx, "IsDuckVolume")) continue;
                        log.AppendLine("duck on " + ((UnityEngine.Object)g).name);
                        foreach (var kv in new[] { new KeyValuePair<string, float>("Threshold", -20f), new KeyValuePair<string, float>("Ratio", 1.5f), new KeyValuePair<string, float>("Attack Time", .01f), new KeyValuePair<string, float>("Release Time", .25f), new KeyValuePair<string, float>("Knee", 0f) })
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
            if (File.Exists(AssetPath)) throw new InvalidOperationException("Exoduser.mixer already exists: delete it first to rebuild");
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
                var send = AddEffect(tell, "Send", ((Array)Get(tell, "effects")).Length);
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
            // Boss snapshot: Ambience -8 dB
            Call(ambience, "SetValueForVolume", ctrl, snaps[1], -8f);
            Call(ambience, "SetValueForVolume", ctrl, snaps[0], 0f);

            // exposed settings volumes: SfxVol (SFX group), MusicVol (Music group). The forest bed follows the SFX volume in code (a mixer parameter would fight the Boss snapshot).
            var exposed = Array.CreateInstance(exposedType, 2);
            foreach (var pair in new[] { new { name = "SfxVol", group = sfx }, new { name = "MusicVol", group = music } })
            {
                object item = Activator.CreateInstance(exposedType);
                exposedType.GetField("guid").SetValue(item, Call(pair.group, "GetGUIDForVolume"));
                exposedType.GetField("name").SetValue(item, pair.name);
                exposed.SetValue(item, pair.name == "SfxVol" ? 0 : 1);
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
