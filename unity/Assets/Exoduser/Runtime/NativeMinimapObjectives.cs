using System;
using System.Collections.Generic;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort {
 public enum NativeMinimapObjectiveKind { Hole,Angler,Gate }
 public readonly struct NativeMinimapObjective {
  public readonly NativeMinimapObjectiveKind Kind;public readonly int Index;public readonly double X,Y;public readonly float Radius;public readonly string Color;public readonly bool Unlocked;
  public NativeMinimapObjective(NativeMinimapObjectiveKind kind,int index,double x,double y,float radius,string color,bool unlocked=false){Kind=kind;Index=index;X=x;Y=y;Radius=radius;Color=color;Unlocked=unlocked;}
 }
 public readonly struct NativeMinimapPoint {public readonly float X,Y;public NativeMinimapPoint(float x,float y){X=x;Y=y;}}
 // Read-only presentation. Does not tick spawners, unlock a gate, or alter any simulation state.
 public static class NativeMinimapObjectives {
  // Web _FB_SITES/_FB_ELS pre-spawn display only. Regression checks these against the actual Core's first spawn.
  static readonly int[,] sites={{58,158},{148,150},{52,42},{148,42}};static readonly int[] elements={2,1,3,4};
  static bool Finite(double value){return !double.IsNaN(value)&&!double.IsInfinity(value);}
  public static void Collect(Simulation sim,List<NativeMinimapObjective> result){
   if(result==null)throw new ArgumentNullException(nameof(result));result.Clear();
   if(sim==null||!sim.Stage.Enabled||sim.Stage.InArena)return;
   if(sim.Regions!=null){
    if(sim.Config.StageIndex==0&&sim.FieldBossesEnabled&&!sim.Stage.FieldBossDone){
     if(sim.FieldBosses!=null){foreach(var fb in sim.FieldBosses)if(fb!=null&&fb.Hp>0&&Finite(fb.X)&&Finite(fb.Y))result.Add(new NativeMinimapObjective(NativeMinimapObjectiveKind.Angler,fb.Index,fb.X,fb.Y,3,Simulation.ElementColor(fb.El)));}
     else if(!sim.FieldBossSpawned)for(int i=0;i<4;i++)result.Add(new NativeMinimapObjective(NativeMinimapObjectiveKind.Angler,i,(sites[i,0]+.5)*StageFlow.T,(sites[i,1]+.5)*StageFlow.T,3,Simulation.ElementColor(elements[i])));
    }
    if(sim.Stage.BossAlive&&sim.Stage.HasFieldGate)result.Add(new NativeMinimapObjective(NativeMinimapObjectiveKind.Gate,-1,(sim.Stage.FieldGateCx+.5)*StageFlow.T,(sim.Stage.FieldGateY+.5)*StageFlow.T,0,sim.Stage.BossUnlocked?"#44aaff":"#ff4444",sim.Stage.BossUnlocked));
   }
   if(sim.SpawnHoles!=null)for(int i=0;i<sim.SpawnHoles.Holes.Count;i++){var h=sim.SpawnHoles.Holes[i];if(h==null||!Finite(h.X)||!Finite(h.Y)||!Finite(h.Size)||h.Size<0)continue;result.Add(new NativeMinimapObjective(NativeMinimapObjectiveKind.Hole,i,h.X,h.Y,(float)(1.5+h.Size*1.5),"#aa4444"));}
  }
  public static NativeMinimapPoint Project(double x,double y,int width,int height,int tileSize){
   if(width<=0||height<=0||tileSize<=0)throw new ArgumentOutOfRangeException("Minimap dimensions must be positive");
   float scale=Math.Min(122f/width,122f/height);int mapW=Math.Max(1,(int)(width*scale)),mapH=Math.Max(1,(int)(height*scale));
   return new NativeMinimapPoint((130-mapW)/2f+(float)x/tileSize*scale,(4+(float)y/tileSize*scale)*(130f/(mapH+8)));
  }
 }
}
