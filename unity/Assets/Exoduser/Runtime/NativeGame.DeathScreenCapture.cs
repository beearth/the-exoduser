using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.Rendering.Universal;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        [Serializable] sealed class DeathScreenReceipt
        {
            public bool passed,fieldVisible,actualRevive,actualDeath,bossCamera,bossAlive,cameraPostProcessing,persistenceDisabled;
            public string failures,saveBinding,revivePhase;public int width,height,labelEntries;
            public string[] files,incompleteLabels;
            public float filterAtWait,volumeAtWait,filterAtReviveMid,filterAfterRevive,bossFilter,bossVolume;
        }

        // Mac only: a stopped simulation is advanced through real Core ticks; only the presentation age is pinned for stills.
        // Required: --unity-death-screen-smoke --unity-boss-direct 0 -output <absolute dir>.
        IEnumerator DeathScreenCaptureRun()
        {
            AudioListener.volume=0;AudioListener.pause=true;Application.runInBackground=true;Running=false;smokeActive=true;
            string output=Argument("-output");
            if(string.IsNullOrEmpty(output)||!Path.IsPathRooted(output)){Debug.LogError("death capture requires absolute -output");Application.Quit(2);yield break;}
            Directory.CreateDirectory(output);
            var sim=Simulation;sim.Config.EnemyAiEnabled=false;sim.Enemies.Clear();sim.Config.RevivePow=1.0;sim.Random01=()=>0;
            var fails=new List<string>();var files=new List<string>();Action<bool,string> check=(ok,what)=>{if(!ok)fails.Add(what);};
            var rec=new DeathScreenReceipt{width=Screen.width,height=Screen.height,labelEntries=NativeReviveHud.DeathLabelCount,saveBinding=DeathUiSaveBinding()};
            rec.persistenceDisabled=nativeSettingsStore==null&&string.IsNullOrEmpty(lobby.CharacterStoreDirectory)&&combatStore==null;
            check(rec.persistenceDisabled,"fixture must keep all stores disabled");
            var incomplete=new List<string>();
            for(int i=0;i<LobbyLanguage.Count;i++)if(!NativeReviveHud.DeathLabelComplete(LobbyLanguage.GetCode(i)))incomplete.Add(LobbyLanguage.GetCode(i));
            rec.incompleteLabels=incomplete.ToArray();check(incomplete.Count==0,"labels incomplete: "+string.Join(",",incomplete.ToArray()));
            string language=lobby.Language;yield return null;yield return null;
            rec.fieldVisible=!lobby.IsBlocking&&view.cullingMask!=0;check(rec.fieldVisible,"lobby blocks field");
            var p=sim.Player;
            for(int i=0;i<400&&p.State!="fallen"&&p.State!="dead";i++){p.Iframes=0;sim.HurtPlayer(99999);}
            check(p.State=="fallen"&&p.FallenCanRevive,"first fall can revive: "+p.State);
            yield return DeathShot(output,"death_01_impact",files,.25f,300);
            yield return DeathShot(output,"death_02_wait",files,2f,180);
            rec.filterAtWait=revive.FilterAmount;rec.volumeAtWait=revive.VolumeWeight;
            check(rec.filterAtWait>.99f,"filter at 2s "+rec.filterAtWait);
            check(rec.volumeAtWait>.99f,"saturation volume at 2s "+rec.volumeAtWait);
            foreach(var code in new[]{"ko","en","ja","ru","th","el"}){lobby.SetLanguage(code);yield return DeathShot(output,"death_lang_"+code,files,2f,180);}
            lobby.SetLanguage(language);
            yield return DeathShot(output,"death_03_last",files,4.8f,12);
            revive.ForcedAge=4.95f;revive.ForcedReviveAge=.25f;
            // Core TickFallen resolves the revive. Never fake Player.State/Hp or FallenCanRevive.
            DeathAdvanceTo(0);yield return null;yield return null;
            rec.actualRevive=p.State=="idle"&&p.Hp==p.MaxHp;rec.revivePhase=revive.ScreenPhase;rec.filterAtReviveMid=revive.FilterAmount;
            check(rec.actualRevive,"Core revive failed: "+p.State);check(rec.revivePhase=="Reviving","phase after revive "+rec.revivePhase);
            check(rec.filterAtReviveMid>.45f&&rec.filterAtReviveMid<.55f,"half fade "+rec.filterAtReviveMid);
            yield return DeathCapture(output,"death_05_revive_mid",files);
            revive.ForcedReviveAge=null;revive.ForcedAge=null;yield return new WaitForSecondsRealtime(.7f);
            rec.filterAfterRevive=revive.FilterAmount;check(revive.ScreenPhase=="None"&&rec.filterAfterRevive<=0,"filter cleared "+revive.ScreenPhase+" "+rec.filterAfterRevive);
            yield return DeathCapture(output,"death_06_revived",files);

            check(BossDirectEnter(),"requires --unity-boss-direct 0");
            for(int i=0;i<1000&&(!sim.Stage.InArena||sim.Stage.LoadPhase!=0);i++){
                p.Hp=p.MaxHp;p.Iframes=600;StepInput(0,0,p.X+100,p.Y,false,false);if(i%10==0)yield return null;
            }
            var boss=sim.Stage.FindBoss();rec.bossAlive=boss!=null&&boss.Alive;
            if(boss!=null){p.X=boss.X+260;p.Y=boss.Y-150;lastX=p.X;lastY=p.Y;}
            UpdateViews();yield return new WaitForSecondsRealtime(.7f);
            // Core cooldown from the first revive makes the second fall non-revivable.
            for(int i=0;i<400&&p.State!="fallen"&&p.State!="dead";i++){p.Iframes=0;sim.HurtPlayer(99999);}
            check(p.State=="fallen"&&!p.FallenCanRevive,"second fall must not revive");
            yield return DeathShot(output,"death_08_boss_wait",files,2f,180);
            rec.bossCamera=sim.Stage.InArena;rec.bossFilter=revive.FilterAmount;rec.bossVolume=revive.VolumeWeight;
            rec.cameraPostProcessing=HudCamera!=null&&HudCamera.GetUniversalAdditionalCameraData().renderPostProcessing;
            check(rec.bossCamera&&rec.bossAlive,"boss arena camera not active");
            check(rec.cameraPostProcessing&&rec.bossFilter>.99f&&rec.bossVolume>.99f,"boss camera death post processing");
            yield return DeathShot(output,"death_04_cannot",files,2.4f,150);
            revive.ForcedAge=5f;DeathAdvanceTo(0);rec.actualDeath=p.State=="dead";check(rec.actualDeath,"Core death failed: "+p.State);
            yield return new WaitForSecondsRealtime(.6f);
            yield return DeathCapture(output,"death_07_panel_enter",files);
            revive.ForcedAge=null;
            rec.files=files.ToArray();rec.failures=string.Join(" | ",fails.ToArray());rec.passed=fails.Count==0;
            File.WriteAllText(Path.Combine(output,"death-screen-capture.json"),JsonUtility.ToJson(rec,true));
            sound?.Reset();Application.Quit(rec.passed?0:2);
        }
        void DeathAdvanceTo(int ticks)
        {
            var p=Simulation.Player;
            for(int i=0;i<300&&p.State=="fallen"&&p.StateTicks>ticks;i++)StepInput(0,0,p.X+100,p.Y,false,false);
        }
        IEnumerator DeathShot(string dir,string name,List<string> files,float age,int ticks)
        {
            revive.ForcedAge=age;DeathAdvanceTo(ticks);
            yield return new WaitForSecondsRealtime(.25f);
            yield return DeathCapture(dir,name,files);
        }
        IEnumerator DeathCapture(string dir,string name,List<string> files)
        {
            yield return new WaitForEndOfFrame();
            ScreenCapture.CaptureScreenshot(Path.Combine(dir,name+"_"+Screen.width+"x"+Screen.height+".png"));files.Add(name);yield return null;
        }
    }
}