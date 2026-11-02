using System;
namespace Exoduser.UnityPort.Core {
 public sealed partial class Simulation {
  sealed class RewindSnapshot {public float X,Y,Hp,Mana,Stamina,Shield;}
  static RewindSnapshot[] CreateRewindSnapshots(){var samples=new RewindSnapshot[300];for(int i=0;i<samples.Length;i++)samples[i]=new RewindSnapshot();return samples;}
  readonly RewindSnapshot[] rewind=CreateRewindSnapshots();int rewindIndex,rewindFilled;object rewindOwner;int rewindStage=-1,rewindWidth,rewindHeight;bool rewindArena;
  public object SkillWorldOwner;public int SkillWorldWidth,SkillWorldHeight;
  public int TimeWarpFilled {get{return rewindFilled;}}public float TimeWarpCd;public int TimeWarpCooldownTotal=2700,TimeWarpSlowMoFrames;
  public event Action<float,float,float,float> TimeWarped;
  bool SyncRewindSpace(){object owner=SkillWorldOwner??(object)CanMove;bool arena=Stage.InArena;if(!ReferenceEquals(rewindOwner,owner)||rewindStage!=Config.StageIndex||rewindWidth!=SkillWorldWidth||rewindHeight!=SkillWorldHeight||rewindArena!=arena){rewindIndex=rewindFilled=0;rewindOwner=owner;rewindStage=Config.StageIndex;rewindWidth=SkillWorldWidth;rewindHeight=SkillWorldHeight;rewindArena=arena;}return owner!=null;}
  void RecordTimeWarp(){if(!SyncRewindSpace()||Player.State=="dead"||Player.State=="fallen")return;var sample=rewind[rewindIndex];sample.X=Player.X;sample.Y=Player.Y;sample.Hp=Player.Hp;sample.Mana=Player.Mana;sample.Stamina=Player.Stamina;sample.Shield=Player.Shield;rewindIndex=(rewindIndex+1)%300;if(rewindFilled<300)rewindFilled++;}
  bool CastTimeWarp(){if(TimeWarpCd>0){DenySkill("timeWarp","cooldown");return false;}if(!SyncRewindSpace())return false;int lv=Math.Max(1,Skills.Level("timeWarp"));int frames=Math.Min(rewindFilled,(int)((3+(lv-1)*.105)*60));if(frames<10)return false;int cost=50+(lv-1)*(100/19);if(Player.Mana<cost){DenySkill("timeWarp","mana");return false;}Player.Mana-=cost;var snap=rewind[(rewindIndex-frames+600)%300];float fromX=Player.X,fromY=Player.Y;Player.X=snap.X;Player.Y=snap.Y;Player.Hp=snap.Hp;Player.Mana=Math.Min(Player.Mana,snap.Mana);Player.Stamina=snap.Stamina;Player.Shield=snap.Shield;TimeWarpCooldownTotal=Skills.Fused.Contains("timeStep")?1200:2700;TimeWarpCd=TimeWarpCooldownTotal;rewindFilled=rewindIndex=0;Player.Iframes=60;FlashTicks=8;HurtShake(6);TimeWarpSlowMoFrames=15;SkillSample("teleport",1,1);TimeWarped?.Invoke(fromX,fromY,Player.X,Player.Y);if(Skills.Fused.Contains("timeStep")&&Skills.Learned("ghostWalk"))ActivateTimeStepGhost();Cast("timeWarp");return true;}
  partial void ActivateTimeStepGhost();
  void TickTimeWarpCooldown(){if(TimeWarpCd<=0)return;float bonus=0;foreach(var z in FireZones)if(z.Type=="holyDome"&&Distance(Player.X,Player.Y,z.X,z.Y)<z.R){bonus=1;break;}TimeWarpCd-=1+bonus;}
 }
}
