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
        string DeathUiSaveBinding()
        {
            string binding="qaRoot="+NativeQaSandbox.Root+" settings="+(nativeSettingsStore==null?"disabled":nativeSettingsDirectory)
                +" roster="+(string.IsNullOrEmpty(lobby.CharacterStoreDirectory)?"disabled":lobby.CharacterStoreDirectory)
                +" combat="+(combatStore==null?"disabled":"bound-to-roster");
            Debug.Log("DEATH_UI_SAVE_BINDING "+binding);return binding;
        }
        [Serializable] sealed class DeathUiReceipt
        {
            public bool passed,dialogOpen,rosterUnchanged,persistenceDisabled;
            public int width,height,rosterBefore,rosterAfter;public string screen,page,saveBinding,failures;public string[] files;
            public SkinPixelProbe[] skinProbes;
        }
        [Serializable] sealed class SkinPixelProbe
        {
            public string label,platform,gpu,colorSpace,stockStates;public int strippedStates;
            public int[] points,rgb;public bool customPlateDark,opacityUnderlayUsed;
        }
        IEnumerator DeathSkinProbe(string output,string label,List<string> files,Action<SkinPixelProbe> save)
        {
            yield return new WaitForEndOfFrame();
            var frame=ScreenCapture.CaptureScreenshotAsTexture();
            var rec=new SkinPixelProbe{label=label,platform=Application.platform.ToString(),gpu=SystemInfo.graphicsDeviceType.ToString(),
                colorSpace=QualitySettings.activeColorSpace.ToString(),stockStates=NativeUiChrome.StockStates,strippedStates=NativeUiChrome.StrippedStates,
                points=new int[4],rgb=new int[6],customPlateDark=true,opacityUnderlayUsed=NativeUiChrome.OpacityProbe};
            for(int i=0;i<2;i++){
                // Same design-space points as the Mac FAIL, transformed into this exact framebuffer.
                var pos=NativeUiViewport.RightMatrix.MultiplyPoint3x4(new Vector3(1500,i==0?735:775,0));
                int x=Mathf.Clamp(Mathf.RoundToInt(pos.x),0,frame.width-1),y=Mathf.Clamp(Mathf.RoundToInt(pos.y),0,frame.height-1);
                Color32 pixel=frame.GetPixel(x,frame.height-1-y);rec.points[i*2]=x;rec.points[i*2+1]=y;
                rec.rgb[i*3]=pixel.r;rec.rgb[i*3+1]=pixel.g;rec.rgb[i*3+2]=pixel.b;
                if(Mathf.Abs(pixel.r-15)>3||Mathf.Abs(pixel.g-15)>3||Mathf.Abs(pixel.b-16)>3)rec.customPlateDark=false;
            }
            File.WriteAllBytes(Path.Combine(output,label+"_"+Screen.width+"x"+Screen.height+".png"),frame.EncodeToPNG());Destroy(frame);files.Add(label);
            Debug.Log("DEATH_UI_SKIN_PROBE "+JsonUtility.ToJson(rec));save(rec);
        }
        // Mac only: --unity-death-ui-smoke -ui-screen pause|settings|quit|character-delete|lobby|lobby-quit.
        // Real UI at the requested Player resolution. No settings, roster or combat-save IO.
        IEnumerator DeathUiCaptureRun()
        {
            AudioListener.volume=0;AudioListener.pause=true;Application.runInBackground=true;
            pauseSmoke=true;lobbySmoke=true;lobby.AutomatedInput=true;Running=false;
            string output=Argument("-output"),screen=Argument("-ui-screen");
            if(string.IsNullOrEmpty(output)||!Path.IsPathRooted(output)){Debug.LogError("death UI capture requires absolute -output");Application.Quit(2);yield break;}
            Directory.CreateDirectory(output);var failures=new List<string>();var files=new List<string>();
            var rec=new DeathUiReceipt{screen=screen,width=Screen.width,height=Screen.height,saveBinding=DeathUiSaveBinding()};
            rec.persistenceDisabled=nativeSettingsStore==null&&string.IsNullOrEmpty(lobby.CharacterStoreDirectory)&&combatStore==null;
            if(!rec.persistenceDisabled){Debug.LogError("death UI fixture refused persistent stores");Application.Quit(2);yield break;}
            bool frontend=screen=="character-delete"||screen=="lobby"||screen=="lobby-quit";
            if(frontend){menu=false;if(!lobby.PrepareDeathUiDialog(screen))failures.Add("frontend dialog not opened");}
            else if(screen=="pause"||screen=="settings"||screen=="quit"){
                lobby.ShowLobby();lobby.SelectPreview();if(!lobby.EnterNativeTest())failures.Add("field entry failed");
                Running=false;menu=true;pauseMenu.Reset();
                if(screen=="settings")pauseMenu.ShowSettings();
                else if(screen=="quit")pauseMenu.Navigation.Open(PausePage.Quit);
                pauseMenu.Navigation.ObserveReleased(false);
            }
            else failures.Add("unsupported -ui-screen");
            rec.rosterBefore=lobby.Characters.Count;string selected=lobby.Characters.SelectedName;
            rec.page=frontend?lobby.Flow.Page.ToString():pauseMenu.Navigation.Page.ToString();
            rec.dialogOpen=screen=="character-delete"?lobby.CharacterDeleteOpen:screen=="lobby-quit"?lobby.DeathUiQuitOpen:frontend?!lobby.CharacterDeleteOpen:
                !lobby.IsBlocking&&pauseMenu.Navigation.Page==(screen=="settings"?PausePage.Settings:screen=="quit"?PausePage.Quit:PausePage.Main);
            if(!rec.dialogOpen)failures.Add("requested screen not active");
            yield return new WaitForSecondsRealtime(.6f);
            if(Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-death-ui-skin-probe")>=0){
                if(screen!="lobby")failures.Add("skin probe requires -ui-screen lobby");
                else{
                    var probes=new List<SkinPixelProbe>();
                    NativeUiChrome.StockProbe=true;yield return null;yield return null;
                    yield return DeathSkinProbe(output,"ui_skin_control",files,p=>probes.Add(p));
                    NativeUiChrome.StockProbe=false;NativeUiChrome.OpacityProbe=true;yield return null;yield return null;
                    yield return DeathSkinProbe(output,"ui_skinless",files,p=>probes.Add(p));
                    NativeUiChrome.OpacityProbe=false;
                    rec.skinProbes=probes.ToArray();if(!probes[1].customPlateDark)failures.Add("custom-only plate still gray at FAIL coordinates");
                }
            }
            if(screen=="settings"){
                for(int tab=0;tab<4;tab++){
                    pauseMenu.Navigation.SelectTab(tab);pauseMenu.Navigation.ObserveReleased(false);
                    yield return new WaitForSecondsRealtime(.15f);
                    yield return DeathCapture(output,"ui_settings_"+tab,files);
                }
            }else yield return DeathCapture(output,"ui_"+screen,files);
            rec.rosterAfter=lobby.Characters.Count;rec.rosterUnchanged=rec.rosterBefore==rec.rosterAfter&&selected==lobby.Characters.SelectedName;
            if(!rec.rosterUnchanged)failures.Add("roster changed");
            rec.files=files.ToArray();rec.failures=string.Join(" | ",failures.ToArray());rec.passed=failures.Count==0;
            File.WriteAllText(Path.Combine(output,"death-ui-"+screen+".json"),JsonUtility.ToJson(rec,true));
            lobby.CloseStartupCaptureMedia();sound?.Reset();Application.Quit(rec.passed?0:2);
        }
    }
    public sealed partial class NativeLobby
    {
        internal bool DeathUiQuitOpen{get{return lobbyQuitPrompt;}}
        internal bool PrepareDeathUiDialog(string screen)
        {
            if(Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-death-ui-smoke")<0||!string.IsNullOrEmpty(CharacterStoreDirectory))return false;
            ShowLobby();
            if(Characters.Count==0&&!Characters.TryCreate("검수전사",0,out _))return false;
            SelectCharacter(0);
            if(screen=="character-delete")return RequestCharacterDelete(0);
            if(screen=="lobby-quit")lobbyQuitPrompt=true;
            return true;
        }
    }
}
