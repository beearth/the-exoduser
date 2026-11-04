using System.Diagnostics;
namespace Exoduser.UnityPort
{
    // Field assembly stage timing; one line per stage in the existing [A2 전체필드] format.
    public static class A2RStage
    {
        static readonly Stopwatch watch=new Stopwatch();static long last;
        public static void Begin(){watch.Restart();last=0;}
        public static void Mark(string name){if(!watch.IsRunning)return;long now=watch.ElapsedMilliseconds;UnityEngine.Debug.Log("[A2 전체필드] 단계 "+name+" +"+(now-last)+"ms (누적 "+now+"ms)");last=now;}
    }
}
