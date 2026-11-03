using System;
using System.IO;
using System.Reflection;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // Human play needs a persistent, isolated store without a QA argument. The
    // existing path router has no setter; bind its two fields before any scene Awake.
    // Fail closed if that internal contract changes. Core and the shared router stay unchanged.
    public static class Map25DHumanSave
    {
        public const string Flag="--map25d-play-sandbox";
        public static string Root {get;private set;}
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
        static void Bind()
        {
            var args=Environment.GetCommandLineArgs();
            if(Array.IndexOf(args,"--map25d-play-smoke")>=0){AudioListener.volume=0;AudioListener.pause=false;}
            else if(Array.IndexOf(args,"--unity-map25d-capture")>=0){AudioListener.volume=0;AudioListener.pause=true;}
            int at=Array.IndexOf(args,Flag);if(at<0)return;
            try{
                if(at+1>=args.Length||!Path.IsPathRooted(args[at+1]))throw new ArgumentException("Human save requires an absolute directory");
                string root=Path.GetFullPath(args[at+1]);string allowed=Path.GetFullPath("I:/EXODUSER-Storage/map25d/");
                if(!root.StartsWith(allowed,StringComparison.OrdinalIgnoreCase))throw new ArgumentException("Human save must stay inside Map25D storage");
                Directory.CreateDirectory(root);string probe=Path.Combine(root,".map25d-write-probe");File.WriteAllText(probe,"isolated human play");
                var type=typeof(NativeQaSandbox);var flags=BindingFlags.Static|BindingFlags.NonPublic;var field=type.GetField("root",flags);var resolved=type.GetField("resolved",flags);
                if(field==null||resolved==null)throw new MissingFieldException("NativeQaSandbox path router contract changed");field.SetValue(null,root);resolved.SetValue(null,true);Root=root;
                if(NativeQaSandbox.Resolve(Application.persistentDataPath)!=root)throw new InvalidOperationException("Human save isolation did not bind");
                Debug.Log("[Map25D] Persistent HUMAN save namespace: "+root);
            }catch(Exception error){Debug.LogError("[Map25D] Human save isolation failed closed: "+error.Message);Application.Quit(3);throw;}
        }
    }
}
