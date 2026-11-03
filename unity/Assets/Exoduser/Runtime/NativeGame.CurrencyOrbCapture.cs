using System;
using System.Collections;
using System.IO;
using UnityEngine;

namespace Exoduser.UnityPort {
 public sealed partial class NativeGame {
  [Serializable] sealed class CurrencyOrbReceipt {public bool passed;public string scope="잔액 주입 UI 캡처; 자연 플레이 아님";public int[] amounts;public string[] captures;}
  IEnumerator CurrencyOrbCapture(){
   string output=Argument("-output");
   if(string.IsNullOrWhiteSpace(output)){Application.Quit(2);yield break;}
   Directory.CreateDirectory(output);AudioListener.volume=0;AudioListener.pause=true;
   Screen.SetResolution(1920,1080,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.5f);
   lobby.ShowLobby();lobby.SelectPreview();
   if(!lobby.EnterNativeTest()){Application.Quit(2);yield break;}
   menu=false;Running=false;Simulation.Config.EnemyAiEnabled=false;Simulation.Enemies.Clear();
   int[] amounts={999,5000,50000,123456};string[] captures=new string[6];bool passed=true;
   for(int i=0;i<4;i++){
    Simulation.Materials=amounts[i];passed&=NativeCurrencyOrb.Stage(amounts[i])==i&&NativeCurrencyOrb.Texture(amounts[i])!=null;
    captures[i]="currency-stage-"+(i+1)+".png";UpdateViews();yield return new WaitForSecondsRealtime(.2f);
    yield return GuiShot(Path.Combine(output,captures[i]),true);
   }
   SetForge(true);captures[4]="currency-forge.png";yield return GuiShot(Path.Combine(output,captures[4]),true);SetForge(false);Running=false;
   NativeCurrencyOrb.Emit(new Vector2(.5f,.5f));captures[5]="currency-merge.png";yield return GuiShot(Path.Combine(output,captures[5]),true);
   File.WriteAllText(Path.Combine(output,"currency-orb.json"),JsonUtility.ToJson(new CurrencyOrbReceipt{passed=passed,amounts=amounts,captures=captures},true));
   Application.Quit(passed?0:2);
  }
 }
}
