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
        [Serializable] sealed class UiArtReceipt {public string path;public bool loaded;public int mipCount;}
        [Serializable] sealed class DeathUiReceipt
        {
            public bool passed,dialogOpen,rosterUnchanged,persistenceDisabled;
            public int width,height,rosterBefore,rosterAfter;public string screen,state,page,saveBinding,failures;public string[] files;
            public UiArtReceipt[] art;public float artworkBrightness=1;public int strippedSkinStates;
            public bool entryPointerInside,entryHoverVisible;public Vector2 entryPointer,entryPointerScreen;public Rect entryRect;
            public string pointerScope="isolated OnGUI pointer fixture through actual Rect.Contains/hover draw; no OS mouse movement";
        }
        // Mac Player only. -ui-screen lobby|character-create|character-name|character-delete|pause|settings|quit|lobby-quit
        // -ui-state normal|hover|selected|disabled; -ui-characters 0|2. States are visual fixture overrides, not physical input QA.
        IEnumerator DeathUiCaptureRun()
        {
            AudioListener.volume=0;AudioListener.pause=true;Application.runInBackground=true;
            pauseSmoke=true;lobbySmoke=true;lobby.AutomatedInput=true;Running=false;
            string output=Argument("-output"),screen=Argument("-ui-screen"),state=Argument("-ui-state");
            if(string.IsNullOrEmpty(state))state="normal";
            if(string.IsNullOrEmpty(output)||!Path.IsPathRooted(output)){Debug.LogError("UI capture requires absolute -output");Application.Quit(2);yield break;}
            Directory.CreateDirectory(output);var failures=new List<string>();var files=new List<string>();
            if(state!="normal"&&state!="hover"&&state!="selected"&&state!="disabled")failures.Add("unsupported -ui-state");
            NativeSilverHellUi.ReviewState=state;
            int count=-1;string rawCount=Argument("-ui-characters");
            if(rawCount.Length>0&&(!int.TryParse(rawCount,out count)||(count!=0&&count!=2)))failures.Add("-ui-characters must be 0 or 2");
            var rec=new DeathUiReceipt{screen=screen,state=state,width=Screen.width,height=Screen.height,saveBinding=DeathUiSaveBinding()};
            rec.persistenceDisabled=nativeSettingsStore==null&&string.IsNullOrEmpty(lobby.CharacterStoreDirectory)&&combatStore==null;
            if(!rec.persistenceDisabled){Debug.LogError("UI fixture refused persistent stores");Application.Quit(2);yield break;}
            var assets=new List<UiArtReceipt>();
            foreach(var name in new[]{"lobby_enter_btn_silver_20261029","lobby_enter_disabled","btn_primary_composed","btn_plaque_20261029","guide_button_glow",
                "visual_create","visual_cancel","visual_disabled","name_create","name_cancel","panel_frame_20261029",
                "btn_chip_1x","btn_chip_2x","lobby_enter_ready_1x","lobby_enter_ready_2x","lobby_enter_disabled_1x","lobby_enter_disabled_2x"}){
                string path="Art/ui/silver_hell/"+name;var texture=Resources.Load<Texture2D>(path);
                assets.Add(new UiArtReceipt{path=path,loaded=texture!=null,mipCount=texture==null?0:texture.mipmapCount});
                if(texture==null||texture.mipmapCount!=1)failures.Add("art missing or mipmapped: "+path);
            }
            rec.art=assets.ToArray();
            bool frontend=screen=="lobby"||screen=="lobby-quit"||screen.StartsWith("character-",StringComparison.Ordinal);
            lobby.DeathUiEntryPointerCapture=screen=="lobby";lobby.DeathUiEntryPointerInside=state=="hover";
            if(frontend){menu=false;if(!lobby.PrepareDeathUiDialog(screen,count,state))failures.Add("frontend dialog not opened");}
            else if(screen=="pause"||screen=="settings"||screen=="quit"){
                lobby.ShowLobby();lobby.SelectPreview();if(!lobby.EnterNativeTest())failures.Add("field entry failed");
                Running=false;menu=true;pauseMenu.Reset();
                if(screen=="settings")pauseMenu.ShowSettings();else if(screen=="quit")pauseMenu.Navigation.Open(PausePage.Quit);
                pauseMenu.Navigation.ObserveReleased(false);
            }else failures.Add("unsupported -ui-screen");
            rec.rosterBefore=lobby.Characters.Count;string selected=lobby.Characters.SelectedName;
            rec.page=frontend?lobby.Flow.Page+"/"+lobby.DeathUiModalPage:pauseMenu.Navigation.Page.ToString();
            rec.dialogOpen=screen=="character-delete"?lobby.CharacterDeleteOpen:screen=="character-create"?lobby.DeathUiModalPage=="visual":
                screen=="character-name"?lobby.DeathUiModalPage=="name":screen=="lobby-quit"?lobby.DeathUiQuitOpen:
                frontend?!lobby.CharacterModalOpen:!lobby.IsBlocking&&pauseMenu.Navigation.Page==(screen=="settings"?PausePage.Settings:screen=="quit"?PausePage.Quit:PausePage.Main);
            if(!rec.dialogOpen)failures.Add("requested screen not active");
            yield return new WaitForSecondsRealtime(.8f);
            string tag=screen+"_"+state+"_"+rec.rosterBefore+"chars";
            if(screen=="settings"){
                for(int tab=0;tab<4;tab++){
                    pauseMenu.Navigation.SelectTab(tab);pauseMenu.Navigation.ObserveReleased(false);yield return new WaitForSecondsRealtime(.15f);
                    yield return DeathCapture(output,"ui_"+tag+"_tab"+tab,files);
                }
            }else yield return DeathCapture(output,"ui_"+tag,files);
            rec.entryPointerInside=lobby.EntryPointerInside;rec.entryHoverVisible=lobby.EntryHoverVisible;rec.entryPointer=lobby.EntryPointer;rec.entryPointerScreen=lobby.EntryPointerScreen;rec.entryRect=lobby.EntryRect;
            if(screen=="lobby"&&state=="hover"&&rec.rosterBefore>0&&(!rec.entryPointerInside||!rec.entryHoverVisible))failures.Add("entry hover pointer or drawn light missing");
            rec.rosterAfter=lobby.Characters.Count;rec.rosterUnchanged=rec.rosterBefore==rec.rosterAfter&&selected==lobby.Characters.SelectedName;
            if(!rec.rosterUnchanged)failures.Add("roster changed");
            rec.strippedSkinStates=NativeUiChrome.StrippedStates;rec.files=files.ToArray();rec.failures=string.Join(" | ",failures.ToArray());rec.passed=failures.Count==0;
            File.WriteAllText(Path.Combine(output,"death-ui-"+tag+".json"),JsonUtility.ToJson(rec,true));
            NativeSilverHellUi.ReviewState=null;lobby.DeathUiEntryPointerCapture=false;lobby.CloseStartupCaptureMedia();sound?.Reset();Application.Quit(rec.passed?0:2);
        }
    }
    public sealed partial class NativeLobby
    {
        internal bool DeathUiQuitOpen{get{return lobbyQuitPrompt;}}
        internal string DeathUiModalPage{get{return characterStep==1?"visual":characterStep==2?"name":characterStep==3?"delete":"none";}}
        internal bool PrepareDeathUiDialog(string screen,int count=-1,string state="normal")
        {
            if(Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-death-ui-smoke")<0||!string.IsNullOrEmpty(CharacterStoreDirectory))return false;
            ShowLobby();
            if(count>=0){
                var names=count==0?Array.Empty<string>():new[]{"검수전사","검수여행자"};
                if(!Characters.TryRestore(names,count==0?-1:state=="selected"?1:0))return false;
                RevealSelectedCharacter();
            }else{
                if(Characters.Count==0&&!Characters.TryCreate("검수전사",0,out _))return false;SelectCharacter(0);
            }
            if(screen=="character-delete")return RequestCharacterDelete(Characters.SelectedIndex);
            if(screen=="character-create"||screen=="character-name"){
                if(!OpenCharacterCreation())return false;
                if(screen=="character-name"){ChooseCharacterVisual(0);return ConfirmCharacterVisual();}
                if(state=="disabled")ChooseCharacterVisual(1);
                return true;
            }
            if(screen=="lobby-quit")lobbyQuitPrompt=true;
            return screen=="lobby"||screen=="lobby-quit";
        }
    }
}
