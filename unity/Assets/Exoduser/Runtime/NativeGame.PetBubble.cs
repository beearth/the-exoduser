using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
 public sealed partial class NativeGame
 {
  readonly NativePetBubbleQueue petBubble=new NativePetBubbleQueue();
  readonly NativePetBubbleView petBubbleView=new NativePetBubbleView();
  Simulation petBubbleSimulation,petBubbleRun;
  int petBubbleTick=-1,petBubbleStage=-1;
  // Run-level (new Simulation only): chapter-0 boss intro / forest ambience are one-shot per run, like web _petBossIntroSeen.
  float petBubbleFieldSeconds;
  bool petBubbleArena,petBubbleBossSeen,petBubbleEnvSeen,petBubbleExitSeen,petBubbleKillSeen;
  float petBubbleExitWait=-1;   // seconds since the exit opened (STY-25 B8/B9), -1 = not opened this run
  bool petBubbleFixtureActive,petBubbleFixtureOwnsQueue;
  bool PetBubbleHidden=>Simulation==null||lobby==null||lobby.IsBlocking||menu||!gameFocused||
   inventory.Open||skills.Open||stats.Open||forge.Open||nextDifficulty.Active||stageClear.Active||
   NativeScreenTransition.InputBlocked||Simulation.Stage.LoadPhase>0||DeathPresentationActive||PlayerDown||
   (!Running&&!petBubbleFixtureActive)||(smokeActive&&!petBubbleFixtureActive);
  void ResetPetBubbleEncounter()
  {
   petBubble.Reset();
  }
  void ResetPetBubbleRun()
  {
   petBubbleRun=null;petBubbleFieldSeconds=0;petBubbleBossSeen=petBubbleEnvSeen=petBubbleExitSeen=petBubbleKillSeen=false;petBubbleExitWait=-1;
  }
  void UpdatePetBubble()
  {
   if(petBubbleFixtureOwnsQueue)return;
   if(Simulation==null){petBubbleSimulation=null;ResetPetBubbleRun();ResetPetBubbleEncounter();return;}
   var flow=Simulation.Stage;
   // A new Simulation is a new run. The first-practice arena swaps Simulation temporarily; it must not reset the run flags.
   if(firstPractice==null&&petBubbleRun!=Simulation){ResetPetBubbleRun();petBubbleRun=Simulation;}
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
   if(petBubbleStage==0&&!flow.InArena)petBubbleFieldSeconds+=seconds;
   bool actorAlive=flow.Boss!=null&&flow.Boss.Alive;
   // First pass covers chapter 1's existing environment/intro pairs only.
   if(petBubbleStage>=0&&petBubbleStage<=3){
    if(!petBubbleEnvSeen&&petBubbleStage==0&&NativePetBubblePolicy.EnvironmentReady(petBubbleFieldSeconds,flow.InArena))
     petBubble.Offer(NativePetBubbleCatalog.Cue("env_ch0"));
    if(!petBubbleBossSeen&&flow.BossAlive&&NativePetBubblePolicy.BossReady(flow.InArena,flow.Boss!=null,actorAlive))
     petBubble.Offer(NativePetBubbleCatalog.Cue("boss_intro_ch0"));
   }
   if(petBubbleExitWait>=0)petBubbleExitWait+=seconds;
   // STY-25 B8/B9: once per run, 4 s after the exit opened (after the boss-kill line B7 has run), only when no other bubble is up
   // STY-25 B7: boss-kill pair once per run, 1.7 s after the exit opened (druid sink 1.1 s + 0.3 s + fade 0.3 s)
   if(!petBubbleKillSeen&&petBubbleStage==0&&petBubbleExitWait>=1.7f&&!petBubble.Active)petBubble.Offer(NativePetBubbleCatalog.Cue("boss_kill_ch0"));
   if(!petBubbleExitSeen&&petBubbleKillSeen&&petBubbleStage==0&&petBubbleExitWait>=4&&!petBubble.Active)petBubble.Offer(NativePetBubbleCatalog.Cue("exit_north_ch0"));
   double ratio=Simulation.Player.MaxHp>0?Simulation.Player.Hp/Simulation.Player.MaxHp:1;
   if(ratio<.1)petBubble.Offer(NativePetBubbleCatalog.Cue("hp_critical"));
   else if(ratio<.3)petBubble.Offer(NativePetBubbleCatalog.Cue("crisis_hp30"));
   else if(ratio<.5)petBubble.Offer(NativePetBubbleCatalog.Cue("warn_hp50"));
   var shown=petBubble.Dispatch();
   if(shown!=null){if(shown.id=="env_ch0")petBubbleEnvSeen=true;if(shown.id=="boss_intro_ch0")petBubbleBossSeen=true;if(shown.id=="boss_kill_ch0")petBubbleKillSeen=true;if(shown.id=="exit_north_ch0")petBubbleExitSeen=true;}
  }
  void DrawPetBubble()
  {
   if(PetBubbleHidden)return;
   petBubbleView.Draw(petBubble,lobby.Language,firstPractice!=null);
  }
 }
}
