using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
 public sealed partial class NativeGame
 {
  readonly NativePetBubbleQueue petBubble=new NativePetBubbleQueue();
  readonly NativePetBubbleView petBubbleView=new NativePetBubbleView();
  Simulation petBubbleSimulation;
  int petBubbleTick=-1,petBubbleStage=-1;
  float petBubbleStageSeconds;
  bool petBubbleArena,petBubbleBossSeen,petBubbleEnvSeen,petBubbleHadBoss,petBubbleObservedDefeat;
  bool petBubbleFixtureActive,petBubbleFixtureOwnsQueue;
  bool PetBubbleHidden=>Simulation==null||lobby==null||lobby.IsBlocking||menu||!gameFocused||
   inventory.Open||skills.Open||stats.Open||forge.Open||nextDifficulty.Active||stageClear.Active||
   NativeScreenTransition.InputBlocked||Simulation.Stage.LoadPhase>0||DeathPresentationActive||PlayerDown||
   (!Running&&!petBubbleFixtureActive)||(smokeActive&&!petBubbleFixtureActive);
  void ResetPetBubbleEncounter()
  {
   petBubble.Reset();petBubbleStageSeconds=0;
   petBubbleBossSeen=petBubbleEnvSeen=petBubbleHadBoss=petBubbleObservedDefeat=false;
  }
  void UpdatePetBubble()
  {
   if(petBubbleFixtureOwnsQueue)return;
   if(Simulation==null){petBubbleSimulation=null;ResetPetBubbleEncounter();return;}
   var flow=Simulation.Stage;
   bool changed=petBubbleSimulation!=Simulation||petBubbleStage!=Simulation.Config.StageIndex||Simulation.TickCount<petBubbleTick;
   if(changed||petBubbleArena!=flow.InArena){
    ResetPetBubbleEncounter();petBubbleTick=Simulation.TickCount;
    petBubbleSimulation=Simulation;petBubbleStage=Simulation.Config.StageIndex;
   }
   petBubbleArena=flow.InArena;
   float seconds=System.Math.Max(0,Simulation.TickCount-petBubbleTick)/60f;petBubbleTick=Simulation.TickCount;
   bool dead=Simulation.Player.Hp<=0||DeathPresentationActive||PlayerDown;
   bool finale=Simulation.Config.DemoMode&&petBubbleStage==3&&flow.InArena&&flow.BossAlive;
   petBubble.BeginFrame(seconds,PetBubbleHidden,dead,finale);
   if(PetBubbleHidden||dead)return;
   petBubbleStageSeconds+=seconds;
   bool actorAlive=flow.Boss!=null&&flow.Boss.Alive;
   if(flow.BossAlive&&actorAlive)petBubbleHadBoss=true;
   if(petBubbleHadBoss&&!flow.BossAlive)petBubbleObservedDefeat=true;
   // First pass covers chapter 1's existing environment/intro pairs only.
   if(petBubbleStage>=0&&petBubbleStage<=3){
    if(!petBubbleEnvSeen&&NativePetBubblePolicy.EnvironmentReady(petBubbleStageSeconds,flow.BossAlive,petBubbleObservedDefeat))
     petBubble.Offer(NativePetBubbleCatalog.Cue("env_ch0"));
    if(!petBubbleBossSeen&&flow.BossAlive&&NativePetBubblePolicy.BossReady(flow.InArena,flow.Boss!=null,actorAlive))
     petBubble.Offer(NativePetBubbleCatalog.Cue("boss_intro_ch0"));
   }
   double ratio=Simulation.Player.MaxHp>0?Simulation.Player.Hp/Simulation.Player.MaxHp:1;
   if(ratio<.1)petBubble.Offer(NativePetBubbleCatalog.Cue("hp_critical"));
   else if(ratio<.3)petBubble.Offer(NativePetBubbleCatalog.Cue("crisis_hp30"));
   else if(ratio<.5)petBubble.Offer(NativePetBubbleCatalog.Cue("warn_hp50"));
   var shown=petBubble.Dispatch();
   if(shown!=null){if(shown.id=="env_ch0")petBubbleEnvSeen=true;if(shown.id=="boss_intro_ch0")petBubbleBossSeen=true;}
  }
  void DrawPetBubble()
  {
   if(PetBubbleHidden)return;
   petBubbleView.Draw(petBubble,lobby.Language,firstPractice!=null);
  }
 }
}
