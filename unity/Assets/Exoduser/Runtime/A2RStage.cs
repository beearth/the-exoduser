using System.Diagnostics;
namespace Exoduser.UnityPort
{
    // Field assembly stage timing; one line per stage in the existing [A2 전체필드] format.
    public static class A2RStage
    {
        static readonly Stopwatch watch=new Stopwatch();static long last;
        static readonly System.Collections.Generic.Dictionary<string,long> acc=new System.Collections.Generic.Dictionary<string,long>();
        public static long Tick(){return Stopwatch.GetTimestamp();}
        public static void Acc(string name,long since){long d=(Stopwatch.GetTimestamp()-since)*1000/Stopwatch.Frequency;long v;acc.TryGetValue(name,out v);acc[name]=v+d;}
        public static void Dump(string title){foreach(var p in acc)UnityEngine.Debug.Log("[A2 전체필드] 세부 "+title+" "+p.Key+" "+p.Value+"ms");acc.Clear();}
        public static void Begin(){watch.Restart();last=0;}
        public static void Mark(string name){if(!watch.IsRunning)return;long now=watch.ElapsedMilliseconds;UnityEngine.Debug.Log("[A2 전체필드] 단계 "+name+" +"+(now-last)+"ms (누적 "+now+"ms)");last=now;}
    }
}
