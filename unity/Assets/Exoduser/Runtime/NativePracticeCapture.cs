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
  bool practiceScripted,scriptMagic,scriptSlot1;
  [Serializable] sealed class FirstPracticeReceipt {public string scope,rosterDirectory;public bool passed,scripted,originalReferenceRestored,playerRestored,configRestored,resourcesRestored,rngRestored,clockRestored,actorsRestored;public int failures,kills,originalMaterials,restoredMaterials;public uint originalRng,restoredRng;public float originalHp,restoredHp;public string[] checks;}
  IEnumerator FirstPracticeFixture(bool scripted)
  {
   string output=Argument("-output");
   if(string.IsNullOrWhiteSpace(output)||lobby.CharacterStoreDirectory!=Path.Combine(Path.GetFullPath(output),"character-roster-v1")){Debug.LogError("FIRST PRACTICE requires explicit isolated -output");Application.Quit(2);yield break;}
   Directory.CreateDirectory(output);int fixtureW,fixtureH;if(!int.TryParse(Argument("-fixture-width"),out fixtureW))fixtureW=1280;if(!int.TryParse(Argument("-fixture-height"),out fixtureH))fixtureH=720;Screen.SetResolution(fixtureW,fixtureH,FullScreenMode.Windowed);yield return null;
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
   for(int i=0;i<90;i++){var p=Simulation.Player;HandleFirstPracticeTick(0,0,p.X+100,p.Y,false);}check(firstPractice.Step==PracticeStep.Left&&firstPractice.Practising,"movement transition reaches left click");
   bool progress=false,charge=false;
   for(int i=0;i<6000&&firstPractice.Step==PracticeStep.Left;i++){
    var p=Simulation.Player;EnemyState target=null;float distance=float.MaxValue;
    foreach(var e in Simulation.Enemies)if(e.Alive){float d=(p.X-e.X)*(p.X-e.X)+(p.Y-e.Y)*(p.Y-e.Y);if(d<distance){distance=d;target=e;}}
    bool held=!p.KiChargeActive||p.KiChargeTicks<(firstPractice.LeftKills>=10?120:80);
    HandleFirstPracticeTick(0,0,target==null?p.X+100:target.X,target==null?p.Y:target.Y,held);DispatchFeedback();UpdateViews();
    if(!progress&&firstPractice.LeftKills>=3){
     progress=true;yield return SkillCapture(output,"practice-attack-progress-720p");
     Screen.SetResolution(1920,1080,FullScreenMode.Windowed);yield return SkillCapture(output,"practice-attack-progress-ko-1080p");
     Screen.SetResolution(fixtureW,fixtureH,FullScreenMode.Windowed);lobby.SetLanguage("en");yield return SkillCapture(output,"practice-attack-progress-en-720p");lobby.SetLanguage("ko");
    }
    if(!charge&&p.KiChargeActive&&p.KiChargeTicks>=120){charge=true;yield return SkillCapture(output,"practice-charge-full-720p");}
    if(i%10==0)yield return null;
   }
   check(firstPractice.AttackDone&&firstPractice.FullChargeKill&&firstPractice.LeftKills>=10,"actual lesson10 kills and tier3 projectile defeat");int kills=firstPractice.LeftKills;
   for(int i=0;i<90;i++){var p=Simulation.Player;HandleFirstPracticeTick(0,0,p.X+100,p.Y,false);}check(firstPractice.Step==PracticeStep.Right&&firstPractice.Practising,"left click transition reaches right click");
   bool rightShot=false;
   for(int i=0;i<3000&&firstPractice.Step==PracticeStep.Right;i++){
    var p=Simulation.Player;EnemyState target=null;float distance=float.MaxValue;
    foreach(var e in Simulation.Enemies)if(e.Alive){float d=(p.X-e.X)*(p.X-e.X)+(p.Y-e.Y)*(p.Y-e.Y);if(d<distance){distance=d;target=e;}}
    scriptMagic=(i/20)%2==0&&target!=null;
    HandleFirstPracticeTick(0,0,target==null?p.X+100:target.X,target==null?p.Y:target.Y,false);DispatchFeedback();UpdateViews();
    if(!rightShot&&firstPractice.RightKills>=2){rightShot=true;yield return SkillCapture(output,"practice-right-progress-720p");}
    if(i%10==0)yield return null;
   }
   scriptMagic=false;check(firstPractice.RightDone&&firstPractice.RightKills>=5,"actual five fireball kills complete right click");
   for(int i=0;i<90;i++){var p=Simulation.Player;HandleFirstPracticeTick(0,0,p.X+100,p.Y,false);}check(firstPractice.Step==PracticeStep.Trap&&firstPractice.Practising,"right click transition reaches spike trap");
   bool trapShot=false,placed=false;int trapAt=-1;
   for(int i=0;i<6000&&firstPractice.Step==PracticeStep.Trap;i++){
    var p=Simulation.Player;EnemyState nearest=null;float distance=float.MaxValue;float cx=0,cy=0;int alive=0;
    foreach(var e in Simulation.Enemies)if(e.Alive){alive++;cx+=e.X;cy+=e.Y;float d=(p.X-e.X)*(p.X-e.X)+(p.Y-e.Y)*(p.Y-e.Y);if(d<distance){distance=d;nearest=e;}}
    scriptSlot1=false;float mx=0,my=0;
    if(!placed&&nearest!=null&&distance<100*100){scriptSlot1=true;placed=true;trapAt=i;}
    else if(placed&&i>trapAt+2&&alive>0){float dx=p.X-cx/alive,dy=p.Y-cy/alive,len=Mathf.Max(1,Mathf.Sqrt(dx*dx+dy*dy));mx=dx/len;my=dy/len;}
    HandleFirstPracticeTick(mx,my,p.X+100,p.Y,false);DispatchFeedback();UpdateViews();
    if(!trapShot&&firstPractice.TrapKills>=3){trapShot=true;yield return SkillCapture(output,"practice-trap-progress-720p");}
    if(i%10==0)yield return null;
   }
   scriptSlot1=false;check(firstPractice.TrapDone&&firstPractice.TrapPlaced&&firstPractice.TrapEscaped&&firstPractice.TrapKills>=10,"spike trap placed, escaped and ten trap kills complete the step");
   check(Simulation.Kills==0&&Simulation.Player.Experience==0&&Simulation.Player.Level==1&&Simulation.Loot.Count==0,"lesson receives no ordinary rewards");
   yield return SkillCapture(output,"practice-ported-complete-720p");EndFirstPractice(false);Running=false;frontendEntryInputFence=false;UpdateViews();
   bool sameActors=Simulation.Enemies.Count==actors.Length;for(int i=0;i<actors.Length&&sameActors;i++)sameActors=ReferenceEquals(actors[i],Simulation.Enemies[i]);
   bool samePlayer=player==JsonUtility.ToJson(Simulation.Player),sameConfig=config==JsonUtility.ToJson(Simulation.Config),sameRng=rng==Simulation.FirstPracticeRandomState,sameTick=tick==Simulation.TickCount;
   check(ReferenceEquals(original,Simulation)&&samePlayer&&sameConfig&&sameActors&&sameRng&&sameTick&&mats==Simulation.Materials,"entire original run restored including RNG and resources");
   yield return SkillCapture(output,"practice-continue-restored-720p");
   File.WriteAllText(Path.Combine(output,"first-practice-capture.json"),JsonUtility.ToJson(new FirstPracticeReceipt{scope="Explicit QA namespace and direct preparation; scripted HandleFirstPracticeTick collision and attack inputs, not OS keyboard/mouse or normal startup traversal. First four exercises only (move, left click, right click, spike trap), no badge.",rosterDirectory=lobby.CharacterStoreDirectory,scripted=true,passed=failures==0,failures=failures,kills=kills,originalReferenceRestored=ReferenceEquals(original,Simulation),playerRestored=samePlayer,configRestored=sameConfig,resourcesRestored=mats==Simulation.Materials&&hp==Simulation.Player.Hp,rngRestored=sameRng,clockRestored=sameTick,actorsRestored=sameActors,originalMaterials=mats,restoredMaterials=Simulation.Materials,originalRng=rng,restoredRng=Simulation.FirstPracticeRandomState,originalHp=hp,restoredHp=Simulation.Player.Hp,checks=checks.ToArray()},true));
   Application.Quit(failures==0?0:2);
  }
 }
}
