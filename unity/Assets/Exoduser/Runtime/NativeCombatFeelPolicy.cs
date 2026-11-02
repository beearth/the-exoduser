using System;
namespace Exoduser.UnityPort{
 // Presentation-only values copied from origin/main _FEEL; never advances the Simulation.
 public static class NativeCombatFeelPolicy{
  public const int Hold=2,Life=8,Capacity=8,DeathVoices=2;
  public const double HurtTicks=.140*60;
  public static int Frame(double age,bool reduced){if(age<0||age>=Life)return -1;int hold=reduced?0:Hold;return Math.Min(3,(int)Math.Floor(Math.Max(0,age-hold)*4/(Life-hold)));}
  public static float Alpha(double age)=>(float)(.88*Math.Max(0,1-age/Life));
  public static float Size(bool killed,double age,float shake,bool reduced)=>(killed?72:64)*(1+.04f*(reduced?0:Math.Max(0,Math.Min(1,shake)))*(float)Math.Max(0,1-age/Life));
 }
}
