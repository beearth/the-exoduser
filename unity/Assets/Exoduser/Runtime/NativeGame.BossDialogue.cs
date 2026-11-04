using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
 public sealed partial class NativeGame
 {
  readonly NativeBossDialogue bossDialogue=new NativeBossDialogue();Simulation bossDialogueSimulation;string pendingBossLine;
  void BossDialogueDetach(){if(bossDialogueSimulation!=null)bossDialogueSimulation.BossLineRaised-=OnBossLine;bossDialogueSimulation=null;pendingBossLine=null;bossDialogue.Reset();}
  void BossDialogueAttach(){BossDialogueDetach();bossDialogueSimulation=Simulation;if(bossDialogueSimulation!=null)bossDialogueSimulation.BossLineRaised+=OnBossLine;}
  void OnBossLine(string key){if(Simulation!=null&&Simulation.Stage.LoadPhase>0)pendingBossLine=key;else bossDialogue.Show(key);}
  void DrawBossDialogue()
  {
   if(Simulation==null||lobby==null||lobby.IsBlocking||menu||DeathPresentationActive||PlayerDown||stageClear.Active||Simulation.Stage.LoadPhase>0)return;
   if(pendingBossLine!=null){bossDialogue.Show(pendingBossLine);pendingBossLine=null;}
   bossDialogue.Draw(lobby.Language,bossBar.BossNameForStage(Simulation.Config.StageIndex)??"");
  }
 }
}
