using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
 public sealed partial class NativeGame
 {
  IEnumerator QeUiCapture()
  {
   string output=Argument("-output");if(string.IsNullOrEmpty(output)){Application.Quit(2);yield break;}Directory.CreateDirectory(output);
   AudioListener.pause=true;AudioListener.volume=0;smokeActive=true;Running=false;lobby.Flow.ShowLobby();lobby.Flow.SelectPreview();lobby.Flow.EnterTest();if(firstPractice!=null)EndFirstPractice(true);frontendEntryInputFence=false;menu=false;Screen.SetResolution(1600,900,FullScreenMode.Windowed);SetGameFocus(true);
   var checks=new List<string>();int failed=0;Action<bool,string> check=(ok,name)=>{checks.Add((ok?"통과 ":"실패 ")+name);if(!ok)failed++;};
   var binds=NativeKeyBindInput.Bindings;string oldMagic=binds.Primary("beam"),oldShield=binds.Primary("shield"),reject;int tick=Simulation.TickCount;float hp=Simulation.Player.Hp;
   var equipped=typeof(NativeSkills).GetMethod("EquippedId",BindingFlags.Instance|BindingFlags.NonPublic);
   foreach(bool rebound in new[]{false,true})
   {
    if(rebound){binds.TrySet("beam","KeyX",false,out reject);binds.TrySet("shield","KeyV",false,out reject);}
    foreach(int dock in new[]{7,9})
    {
     menu=false;hud.SlotSelected?.Invoke(dock);Running=false;yield return new WaitForSecondsRealtime(.2f);yield return new WaitForEndOfFrame();
     string id=equipped.Invoke(skills,new object[]{skills.SelectedSlot}) as string;string expected=dock==7?"fireball":"maliceSwipe";
     check(skills.Open&&skills.SelectedSlot==SkillDockBinding.WindowIndexForDock(dock)&&id==expected,(rebound?"변경키 ":"기본키 ")+"HUD 슬롯"+dock+"→"+expected+" 의미 창");
     check(Simulation.TickCount==tick&&Simulation.Player.Hp==hp,"스킬창 동안 월드틱·HP 보존");
     string name=(rebound?"변경키-":"기본키-")+(dock==7?"마법":"칼등");var texture=ScreenCapture.CaptureScreenshotAsTexture();File.WriteAllBytes(Path.Combine(output,name+".png"),texture.EncodeToPNG());Destroy(texture);
     SetSkills(false);Running=false;
    }
   }
   binds.TrySet("beam",oldMagic,false,out reject);binds.TrySet("shield",oldShield,false,out reject);
   Simulation.Player.Level=100;Simulation.Player.StatPoints=4;
   check(Simulation.UpgradeSkill("maliceSwipe")&&Simulation.Skills.Level("maliceSwipe")==2&&Simulation.Skills.Level("shieldThrow")==2&&Simulation.Player.StatPoints==2,"원본 합체 두 구성원 동시2렙·SP2 차감");
   check(Simulation.UpgradeSkill("kiSlash")&&Simulation.Config.KiSlashLevel==2&&Simulation.Player.StatPoints==1,"실제 기검 강화2렙·SP1 차감");
   foreach(int dock in new[]{9,6})
   {
    menu=false;hud.SlotSelected?.Invoke(dock);Running=false;yield return new WaitForSecondsRealtime(.2f);yield return new WaitForEndOfFrame();
    string id=equipped.Invoke(skills,new object[]{skills.SelectedSlot}) as string;
    check(skills.Open&&id==(dock==9?"maliceSwipe":"kiSlash"),"강화 후 선택 스킬 일치 "+id);check(Simulation.TickCount==tick&&Simulation.Player.Hp==hp,"강화 화면 동안 월드틱·HP 보존");
    var texture=ScreenCapture.CaptureScreenshotAsTexture();File.WriteAllBytes(Path.Combine(output,dock==9?"강화2렙-칼등.png":"강화2렙-기검.png"),texture.EncodeToPNG());Destroy(texture);SetSkills(false);Running=false;
   }
   File.WriteAllText(Path.Combine(output,"Q-E-스킬창-검수.json"),JsonUtility.ToJson(new QeUiReceipt{passed=failed==0,failures=failed,checks=checks.ToArray()},true));
   lobby.enabled=false;lobby.CloseStartupCaptureMedia();sound.Reset();yield return new WaitForSecondsRealtime(1);Application.Quit(failed==0?0:2);
  }
  [Serializable] sealed class QeUiReceipt{public string scope="실제 Player HUD의 기존 SlotSelected 콜백→스킬창, 자동 호출·손조작 아님";public bool passed;public int failures;public string[] checks;}
 }
}
