using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
 public sealed partial class NativeGame
 {
  readonly NativeBossDialogue bossDialogue=new NativeBossDialogue();Simulation bossDialogueSimulation;string pendingBossLine;
  void BossDialogueDetach(){if(bossDialogueSimulation!=null){bossDialogueSimulation.BossLineRaised-=OnBossLine;bossDialogueSimulation.DruidRemodelRaised-=OnDruidLife;}bossDialogueSimulation=null;pendingBossLine=null;bossDialogue.Reset();}
  void BossDialogueAttach(){BossDialogueDetach();bossDialogueSimulation=Simulation;if(bossDialogueSimulation!=null){bossDialogueSimulation.BossLineRaised+=OnBossLine;bossDialogueSimulation.DruidRemodelRaised+=OnDruidLife;}}
  void OnBossLine(string key){if(Simulation!=null&&Simulation.Stage.LoadPhase>0)pendingBossLine=key;else bossDialogue.Show(key);}
  // STY-25 B4/B5: remodel lives 2 and 3 start with the kneel (Core "collapse" event, Life = the life that went down). Display only; the web set never raises this event. Must end inside CollapseTicks (120 ticks = 2 s).
  void OnDruidLife(DruidRemodelEvent ev){if(ev==null||ev.Kind!="collapse"||ev.Life<0||ev.Life>1)return;string key="life"+(ev.Life+1);if(Simulation!=null&&Simulation.Stage.LoadPhase>0)pendingBossLine=key;else bossDialogue.Show(key,2f);}
  void DrawBossDialogue()
  {
   if(Simulation==null||lobby==null||lobby.IsBlocking||menu||DeathPresentationActive||PlayerDown||stageClear.Active||Simulation.Stage.LoadPhase>0)return;
   if(pendingBossLine!=null){bossDialogue.Show(pendingBossLine,pendingBossLine.StartsWith("life")?2f:3.2f);pendingBossLine=null;}
   bossDialogue.Draw(lobby.Language,bossBar.BossNameForStage(Simulation.Config.StageIndex)??"");
  }
 }
}
