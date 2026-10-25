using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
 public sealed partial class NativeGame
 {
  bool practiceScripted;
  [Serializable] sealed class FirstPracticeReceipt {public string scope,rosterDirectory;public bool passed,scripted,originalReferenceRestored,playerRestored,configRestored,resourcesRestored,rngRestored,clockRestored,actorsRestored;public int failures,kills,originalMaterials,restoredMaterials;public uint originalRng,restoredRng;public float originalHp,restoredHp;public string[] checks;}
  IEnumerator FirstPracticeFixture(bool scripted)
  {
   string output=Argument("-output");
   if(string.IsNullOrWhiteSpace(output)||lobby.CharacterStoreDirectory!=Path.Combine(Path.GetFullPath(output),"character-roster-v1")){Debug.LogError("FIRST PRACTICE requires explicit isolated -output");Application.Quit(2);yield break;}
   Directory.CreateDirectory(output);Screen.SetResolution(1280,720,FullScreenMode.Windowed);yield return null;
   lobby.ShowLobby();lobby.SelectPreview();lobby.EnterNativeTest();BeginFirstPractice();
   practiceScripted=scripted;
   if(!scripted){File.WriteAllText(Path.Combine(output,"first-practice-review.json"),JsonUtility.ToJson(new FirstPracticeReceipt{scope="Explicit QA namespace, direct game preparation and BeginFirstPractice only; no startup traversal and no automated movement or completion. Human OS input required.",rosterDirectory=lobby.CharacterStoreDirectory,scripted=false},true));yield break;}
   Running=false;frontendEntryInputFence=false;
   var original=practiceSession.Original;string player=JsonUtility.ToJson(original.Player),config=JsonUtility.ToJson(original.Config);uint rng=original.FirstPracticeRandomState;int tick=original.TickCount,mats=original.Materials;float hp=original.Player.Hp;var actors=original.Enemies.ToArray();
   var checks=new List<string>();int failures=0;Action<bool,string> check=(ok,label)=>{checks.Add((ok?"PASS ":"FAIL ")+label);if(!ok)failures++;};
   yield return SkillCapture(output,"practice-intro-720p");
   for(int i=0;i<480&&!firstPractice.MovementDone;i++){
    double a=(i/60)*Math.PI/4;var p=Simulation.Player;HandleFirstPracticeTick((float)Math.Cos(a),(float)Math.Sin(a),p.X+100,p.Y,false);DispatchFeedback();UpdateViews();
    if(i%10==0)yield return null;
   }
   check(firstPractice.MovementDone,"actual collision-admitted movement reaches120 pixels");yield return SkillCapture(output,"practice-move-720p");
   for(int i=0;i<90;i++){var p=Simulation.Player;HandleFirstPracticeTick(0,0,p.X+100,p.Y,false);}check(firstPractice.Phase==FirstPracticePhase.Attack,"movement transition reaches attack");
   bool progress=false,charge=false;
   for(int i=0;i<6000&&firstPractice.Phase==FirstPracticePhase.Attack;i++){
    var p=Simulation.Player;EnemyState target=null;float distance=float.MaxValue;
    foreach(var e in Simulation.Enemies)if(e.Alive){float d=(p.X-e.X)*(p.X-e.X)+(p.Y-e.Y)*(p.Y-e.Y);if(d<distance){distance=d;target=e;}}
    bool held=!p.KiChargeActive||p.KiChargeTicks<(firstPractice.LeftKills>=10?120:80);
    HandleFirstPracticeTick(0,0,target==null?p.X+100:target.X,target==null?p.Y:target.Y,held);DispatchFeedback();UpdateViews();
    if(!progress&&firstPractice.LeftKills>=3){
     progress=true;yield return SkillCapture(output,"practice-attack-progress-720p");
     Screen.SetResolution(1920,1080,FullScreenMode.Windowed);yield return SkillCapture(output,"practice-attack-progress-ko-1080p");
     Screen.SetResolution(1280,720,FullScreenMode.Windowed);lobby.SetLanguage("en");yield return SkillCapture(output,"practice-attack-progress-en-720p");lobby.SetLanguage("ko");
    }
    if(!charge&&p.KiChargeActive&&p.KiChargeTicks>=120){charge=true;yield return SkillCapture(output,"practice-charge-full-720p");}
    if(i%10==0)yield return null;
   }
   check(firstPractice.AttackDone&&firstPractice.FullChargeKill&&firstPractice.LeftKills>=10,"actual lesson10 kills and tier3 projectile defeat");int kills=firstPractice.LeftKills;
   check(Simulation.Kills==0&&Simulation.Materials==0&&Simulation.Player.Experience==0&&Simulation.Player.Level==1&&Simulation.Loot.Count==0,"lesson receives no ordinary rewards");
   yield return SkillCapture(output,"practice-tier3-complete-720p");EndFirstPractice(false);Running=false;frontendEntryInputFence=false;UpdateViews();
   bool sameActors=Simulation.Enemies.Count==actors.Length;for(int i=0;i<actors.Length&&sameActors;i++)sameActors=ReferenceEquals(actors[i],Simulation.Enemies[i]);
   bool samePlayer=player==JsonUtility.ToJson(Simulation.Player),sameConfig=config==JsonUtility.ToJson(Simulation.Config),sameRng=rng==Simulation.FirstPracticeRandomState,sameTick=tick==Simulation.TickCount;
   check(ReferenceEquals(original,Simulation)&&samePlayer&&sameConfig&&sameActors&&sameRng&&sameTick&&mats==Simulation.Materials,"entire original run restored including RNG and resources");
   yield return SkillCapture(output,"practice-continue-restored-720p");
   File.WriteAllText(Path.Combine(output,"first-practice-capture.json"),JsonUtility.ToJson(new FirstPracticeReceipt{scope="Explicit QA namespace and direct preparation; scripted HandleFirstPracticeTick collision and attack inputs, not OS keyboard/mouse or normal startup traversal. First2 conditions only, no badge.",rosterDirectory=lobby.CharacterStoreDirectory,scripted=true,passed=failures==0,failures=failures,kills=kills,originalReferenceRestored=ReferenceEquals(original,Simulation),playerRestored=samePlayer,configRestored=sameConfig,resourcesRestored=mats==Simulation.Materials&&hp==Simulation.Player.Hp,rngRestored=sameRng,clockRestored=sameTick,actorsRestored=sameActors,originalMaterials=mats,restoredMaterials=Simulation.Materials,originalRng=rng,restoredRng=Simulation.FirstPracticeRandomState,originalHp=hp,restoredHp=Simulation.Player.Hp,checks=checks.ToArray()},true));
   Application.Quit(failures==0?0:2);
  }
 }
}
