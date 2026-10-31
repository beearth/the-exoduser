using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort {
 // `--unity-autopotion-smoke <dir>`: drives the real Simulation (NativeGame/NativeLobby only silenced, not modified) through the auto potion and the
 // kill drop. The checks need the B11 patch (Simulation.Tick calls TickAutoPotion, KillEnemy calls ApplyKillDrop); without it they fail loudly.
 public static class NativeAutoPotionSmoke {
  const string Arg="--unity-autopotion-smoke";
  static bool Requested(out string output){
   var a=Environment.GetCommandLineArgs();int i=Array.IndexOf(a,Arg);output=null;
   if(i<0||i+1>=a.Length)return false;
   output=a[i+1];return true;
  }
  [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
  static void EarlyMute(){if(Requested(out _))AudioListener.volume=0;}
  [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
  static void Boot(){if(Requested(out var dir)){var host=new GameObject("AutoPotionSmoke").AddComponent<Host>();host.dir=dir;}}

  [Serializable] sealed class Receipt {public bool passed;public int failures;public string scope,patchNote;public string[] checks;}
  sealed class Host : MonoBehaviour {
   public string dir;readonly List<string> checks=new List<string>();int failures;
   void Check(bool ok,string what){checks.Add((ok?"PASS ":"FAIL ")+what);if(!ok)failures++;}
   IEnumerator Start(){
    AudioListener.volume=0;AudioListener.pause=true;
    while(NativeGame.Instance==null||NativeGame.Instance.Simulation==null)yield return null;
    var game=NativeGame.Instance;yield return null;yield return null;
    game.enabled=false;var lobby=game.GetComponent<NativeLobby>();if(lobby!=null)lobby.enabled=false;
    foreach(var src in FindObjectsByType<AudioSource>())src.Stop();
    Directory.CreateDirectory(dir);
    var sim=game.Simulation;sim.Config.EnemyAiEnabled=false;sim.Enemies.Clear();
    // ---- 1. auto potion (web update() block): HP missing >= heal -> malice -1, +heal HP, cooldown 420 frames ----
    var drunk=new List<AutoPotionResult>();sim.AutoPotionDrunk+=r=>drunk.Add(r);
    var p=sim.Player;sim.PotionState.PotLv=0;sim.PotionState.Cooldown=0;sim.PotionState.PotionsUsed=0;sim.ParryLessonActive=false;
    sim.PotionPower=0;sim.GlovePotCd=0;sim.BeltPotCd=0;sim.PotionRegenLevel=0;sim.Materials=5;
    float maxHp=p.MaxHp;p.Hp=maxHp-300;float before=p.Hp;
    sim.Tick(0,0,p.X+100,p.Y,false,false);
    Check(drunk.Count==1&&sim.Materials==4&&sim.PotionState.PotionsUsed==1,"first tick: potion drunk, malice 5 -> 4 ("+drunk.Count+", "+sim.Materials+")");
    Check(Mathf.Abs(p.Hp-(before+100+sim.Config.PlayerHpRegen/8f))<.05f||Mathf.Abs(p.Hp-(before+100))<2f,"first tick: HP +100 ("+before+" -> "+p.Hp+")");
    Check(sim.PotionState.Cooldown==420,"cooldown set to 420 frames ("+sim.PotionState.Cooldown+")");
    Check(drunk.Count==1&&drunk[0].Feedback.Length==1&&drunk[0].Feedback[0].Text=="악의오브 추출: +100 HP"&&drunk[0].Feedback[0].Color=="#33ff33","feedback text without emoji: "+(drunk.Count>0&&drunk[0].Feedback.Length>0?drunk[0].Feedback[0].Text:"-"));
    // HP drops again immediately, cooldown must still hold for 419 more frames
    p.Hp=maxHp-300;int potionsMid=0;
    for(int i=0;i<419;i++){p.Hp=Mathf.Min(p.Hp,maxHp-300);sim.Tick(0,0,p.X+100,p.Y,false,false);potionsMid=sim.PotionState.PotionsUsed;}
    Check(potionsMid==1&&sim.Materials==4,"no potion during the cooldown (419 frames, potions "+potionsMid+")");
    p.Hp=maxHp-300;sim.Tick(0,0,p.X+100,p.Y,false,false);
    Check(sim.PotionState.PotionsUsed==2&&sim.Materials==3,"cooldown over after 420 frames: second potion, malice 3 ("+sim.PotionState.PotionsUsed+", "+sim.Materials+")");
    // no potion when the missing HP is below the heal amount, or without malice, or in the parry practice
    sim.PotionState.Cooldown=0;p.Hp=maxHp-50;int c0=sim.PotionState.PotionsUsed;sim.Tick(0,0,p.X+100,p.Y,false,false);Check(sim.PotionState.PotionsUsed==c0,"missing HP 50 < heal 100: no potion");
    sim.PotionState.Cooldown=0;p.Hp=maxHp-300;sim.Materials=0;sim.Tick(0,0,p.X+100,p.Y,false,false);Check(sim.PotionState.PotionsUsed==c0,"no malice: no potion");
    sim.Materials=3;sim.ParryLessonActive=true;sim.Tick(0,0,p.X+100,p.Y,false,false);Check(sim.PotionState.PotionsUsed==c0,"parry practice active: no potion");
    sim.ParryLessonActive=false;
    // ---- 2. kill drop (web 43094-43099): hp pays +1 malice on top of the +4 base; st/mp are discarded ----
    sim.PotionState.Cooldown=1000;   // keep the auto potion out of the way
    int Kill(Func<double> rng,out DropResult drop){
     DropResult got=default;bool seen=false;Action<EnemyState,DropResult> h=(e,d)=>{got=d;seen=true;};sim.KillDropped+=h;
     sim.Random01=rng;sim.Enemies.Clear();p.Hp=maxHp;var e0=sim.SpawnNormalEnemy(p.X+30,p.Y);e0.Hp=1;e0.MaxHp=1;int kills=sim.Kills,mats=sim.Materials;
     for(int i=0;i<240&&sim.Kills==kills;i++)sim.Tick(0,0,e0.X,e0.Y,i%12<6,false);
     sim.KillDropped-=h;drop=seen?got:default;return sim.Materials-mats;
    }
    int gain=Kill(()=>0.0,out var hpDrop);
    Check(gain==5&&hpDrop.Malice==1&&hpDrop.Texts!=null&&hpDrop.Texts.Length==2,"kill with roll 0 (hp): +4 base +1 malice (gained "+gain+")");
    gain=Kill(()=>0.99,out var mpDrop);
    Check(gain==4&&mpDrop.Malice==0,"kill with roll .99 (mp): only the +4 base (gained "+gain+")");
    sim.Random01=null;
    var rec=new Receipt{passed=failures==0,failures=failures,scope="Real Simulation + AutoPotion Core, no NativeGame patch needed; the Simulation B11 patch is required for the checks to pass",patchNote="without B11_simulation_autopotion.patch the Tick/KillEnemy hooks are absent and these checks fail",checks=checks.ToArray()};
    File.WriteAllText(Path.Combine(dir,"autopotion-smoke.json"),JsonUtility.ToJson(rec,true));
    Application.Quit(failures==0?0:2);
   }
  }
 }
}
