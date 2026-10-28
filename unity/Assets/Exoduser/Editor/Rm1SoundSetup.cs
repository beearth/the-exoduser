using System;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using UnityEditor;
using UnityEngine;

namespace Exoduser.UnityPort.Editor
{
    // RM-1 sound track A tooling (batchmode: -executeMethod Exoduser.UnityPort.Editor.Rm1SoundSetup.<Method> -output <file>)
    public static class Rm1SoundSetup
    {
        static string Arg(string name, string fallback)
        {
            var a = Environment.GetCommandLineArgs(); for (int i = 0; i < a.Length - 1; i++) if (a[i] == name) return a[i + 1]; return fallback;
        }
        // Discovery only: the AudioMixerController editor API is internal, so list what this editor build exposes before the builder uses it.
        public static void DumpMixerApi()
        {
            var sb = new StringBuilder();
            var types = AppDomain.CurrentDomain.GetAssemblies().SelectMany(a => { try { return a.GetTypes(); } catch (ReflectionTypeLoadException e) { return e.Types.Where(t => t != null); } })
                .Where(t => (t.Name.StartsWith("AudioMixerEffectController") || t.Name.StartsWith("AudioParameterPath") || t.Name.StartsWith("ExposedAudioParameter") || t.Name.StartsWith("MixerParameterDefinition") || t.Name == "GUID") && t.Namespace != null && (t.Namespace.StartsWith("UnityEditor") || t.Namespace.StartsWith("UnityEngine"))).OrderBy(t => t.FullName);
            foreach (var t in types)
            {
                sb.AppendLine("== " + t.FullName + " public=" + t.IsPublic + " base=" + (t.BaseType != null ? t.BaseType.Name : ""));
                foreach (var m in t.GetMembers(BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.Static | BindingFlags.DeclaredOnly))
                {
                    if (m.MemberType == MemberTypes.Constructor) { var ci = (ConstructorInfo)m; sb.AppendLine("  C (" + string.Join(", ", ci.GetParameters().Select(p => p.ParameterType.Name + " " + p.Name)) + ")"); }
                    else if (m.MemberType == MemberTypes.Method) { var mi = (MethodBase)m; if (mi.IsSpecialName) continue; sb.AppendLine("  M " + (mi.IsStatic ? "static " : "") + m.Name + "(" + string.Join(", ", mi.GetParameters().Select(p => p.ParameterType.Name + " " + p.Name)) + ")" + (m is MethodInfo r ? " -> " + r.ReturnType.Name : "")); }
                    else if (m.MemberType == MemberTypes.Property) sb.AppendLine("  P " + m.Name + " : " + ((PropertyInfo)m).PropertyType.Name);
                    else if (m.MemberType == MemberTypes.Field) sb.AppendLine("  F " + m.Name + " : " + ((FieldInfo)m).FieldType.Name);
                }
            }
            File.WriteAllText(Arg("-output", "mixer_api.txt"), sb.ToString());
        }
    }
}
