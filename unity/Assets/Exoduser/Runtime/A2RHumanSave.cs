using System;
using System.Collections;
using System.IO;
using System.Reflection;
using UnityEngine;
namespace Exoduser.UnityPort
{
    // Adapted from a5c287157 Map25DHumanSave. Candidate human play never uses real saves.
    public static class A2RHumanSave
    {
        public const string Flag="--a2r-play-sandbox";
        public static string Root {get;private set;}
        public static bool CandidateDefault {get{return Resources.Load<TextAsset>("A2R/default-enabled")!=null;}}
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSplashScreen)]
        static void Bind()
        {
            var args=Environment.GetCommandLineArgs();int human=Array.IndexOf(args,Flag),qa=Array.IndexOf(args,NativeQaSandbox.Argument);
            // The art default must never redirect a normal player's character roster.
            if(human<0)return;
            try
            {
                int at=human;string root;
                if(at+1>=args.Length||args[at+1].StartsWith("-",StringComparison.Ordinal)||!Path.IsPathRooted(args[at+1]))throw new ArgumentException("A2R save namespace requires an absolute directory");root=Path.GetFullPath(args[at+1]);
                if(human>=0&&qa<0&&(Application.platform==RuntimePlatform.WindowsPlayer||Application.platform==RuntimePlatform.WindowsEditor)&&!root.StartsWith(Path.GetFullPath("I:/EXODUSER-Storage/map25d/"),StringComparison.OrdinalIgnoreCase))throw new ArgumentException("A2R human save must remain in Map25D storage");
                Directory.CreateDirectory(root);string probe=Path.Combine(root,".a2r-write-probe");File.WriteAllText(probe,"isolated A2R play");File.Delete(probe);
                var flags=BindingFlags.Static|BindingFlags.NonPublic;var field=typeof(NativeQaSandbox).GetField("root",flags);var resolved=typeof(NativeQaSandbox).GetField("resolved",flags);
                if(field==null||resolved==null)throw new MissingFieldException("NativeQaSandbox binding contract changed");field.SetValue(null,root);resolved.SetValue(null,true);Root=root;
                if(NativeQaSandbox.Resolve(Application.persistentDataPath)!=root)throw new InvalidOperationException("A2R sandbox binding failed");
                Debug.Log("[A2R] Persistent isolated play namespace: "+root);
            }
            catch(Exception e){Debug.LogError("[A2R] Save isolation failed closed: "+e.Message);Application.Quit(3);throw;}
        }
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
        static void SmokeRunner(){if(Array.IndexOf(Environment.GetCommandLineArgs(),"--a2r-play-smoke")<0)return;var go=new GameObject("A2R isolated play smoke bootstrap");UnityEngine.Object.DontDestroyOnLoad(go);go.AddComponent<A2RSmokeBootstrap>();}
    }
}
