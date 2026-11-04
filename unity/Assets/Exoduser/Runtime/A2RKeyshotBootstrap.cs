using System;
using System.Collections;
using UnityEngine;
namespace Exoduser.UnityPort
{
    // Only explicit keyshot QA owns this bootstrap. Ordinary play/smoke is unchanged.
    public sealed class A2RKeyshotBootstrap : MonoBehaviour
    {
        public static bool Requested => Array.IndexOf(Environment.GetCommandLineArgs(),"--a2r-keyshot")>=0;
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
        static void Install()
        {
            if(!Requested)return;
            if(Array.IndexOf(Environment.GetCommandLineArgs(),"--a2r-play-smoke")>=0){Debug.LogError("Keyshot and play-smoke are mutually exclusive");Application.Quit(2);return;}
            var go=new GameObject("A2R keyshot sandbox bootstrap");DontDestroyOnLoad(go);go.AddComponent<A2RKeyshotBootstrap>();
        }
        IEnumerator Start()
        {
            float deadline=Time.realtimeSinceStartup+180;
            while((NativeGame.Instance==null||NativeGame.Instance.Simulation==null)&&Time.realtimeSinceStartup<deadline)yield return null;
            if(NativeGame.Instance==null||NativeGame.Instance.Simulation==null){Application.Quit(2);yield break;}
            NativeGame.Instance.BeginA2RPlaySmoke();Destroy(gameObject);
        }
    }
}
