using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort
{
 [Serializable] public sealed class NativePetBubbleCue
 {
  public string id,who,key,pairWho,pairKey;
  public int tier,weight;
  public float seconds,pairSeconds,cooldown;
 }

 // Presentation only. One frame bid, one active line, one optional reply; no delayed warning backlog.
 public sealed class NativePetBubbleQueue
 {
  public static readonly float[] TierCooldown={20,12,8,6,4,0};
  readonly Dictionary<string,float> ready=new Dictionary<string,float>();
  readonly float[] tierReady=new float[6];
  NativePetBubbleCue current,bid;
  bool hidden,finale;
  public float Clock{get;private set;}
  public float Remaining{get;private set;}
  public float Duration{get;private set;}
  public bool PairPhase{get;private set;}
  public bool Active=>current!=null&&Remaining>0;
  public bool Visible=>Active&&!hidden;
  public string Id=>current?.id;
  public string Speaker=>PairPhase?current?.pairWho:current?.who;
  public string Key=>PairPhase?current?.pairKey:current?.key;
  public float Opacity=>Visible?(float)Math.Pow(Math.Max(0,Math.Min(1,Remaining/Duration)),.6)*.6f:0;
  public void Reset(){Clock=0;hidden=finale=false;Array.Clear(tierReady,0,6);ready.Clear();Clear();}
  public void Clear(){current=bid=null;Remaining=Duration=0;PairPhase=false;}
  public void BeginFrame(float seconds,bool hide,bool dead,bool bossFinale)
  {
   bid=null;hidden=hide;finale=bossFinale;
   if(dead){Clear();return;}
   if(finale&&current!=null&&current.tier<=2)Clear();
   if(hidden)return;
   if(float.IsNaN(seconds)||float.IsInfinity(seconds)||seconds<0)seconds=0;
   Clock+=seconds;
   while(Active&&seconds>0)
   {
    if(seconds<Remaining){Remaining-=seconds;break;}
    seconds-=Remaining;
    if(!PairPhase&&!string.IsNullOrEmpty(current.pairKey)&&current.pairSeconds>0)
    {PairPhase=true;Remaining=Duration=current.pairSeconds;}
    else{Clear();break;}
   }
  }
  public void Offer(NativePetBubbleCue cue)
  {
   if(hidden||cue==null||cue.tier<0||cue.tier>5||cue.seconds<=0||string.IsNullOrEmpty(cue.id)||string.IsNullOrEmpty(cue.key))return;
   if(finale&&cue.tier<=2)return;
   if(ready.TryGetValue(cue.id,out var at)&&Clock<at||Clock<tierReady[cue.tier])return;
   if(bid!=null&&(cue.tier<bid.tier||cue.tier==bid.tier&&(cue.tier<5||cue.weight<=bid.weight)))return;
   bid=cue;
  }
  public NativePetBubbleCue Dispatch()
  {
   var next=bid;bid=null;if(next==null||hidden)return null;
   if(Active&&(next.tier<5||current.tier==5&&next.weight<=current.weight))return null;
   current=next;PairPhase=false;Remaining=Duration=next.seconds;
   ready[next.id]=Clock+next.cooldown;tierReady[next.tier]=Clock+TierCooldown[next.tier];
   if(next.tier==5)for(int i=0;i<5;i++)tierReady[i]=Math.Max(tierReady[i],Clock+5);
   return next;
  }
 }
}
