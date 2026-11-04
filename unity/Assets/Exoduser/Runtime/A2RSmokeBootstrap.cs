using System.Collections;
using UnityEngine;
namespace Exoduser.UnityPort
{
    public sealed class A2RSmokeBootstrap:MonoBehaviour
    {
        IEnumerator Start(){while(NativeGame.Instance==null||NativeGame.Instance.Simulation==null)yield return null;NativeGame.Instance.BeginA2RPlaySmoke();Destroy(gameObject);}
    }
}
