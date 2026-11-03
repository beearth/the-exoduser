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
            public bool passed,fieldVisible,actualRevive,actualDeath,bossCamera,bossAlive,cameraPostProcessing,persistenceDisabled,combatTextHidden;
            public string failures,saveBinding,revivePhase;public int width,height,labelEntries;
            public string[] files,incompleteLabels;
            public float filterAtWait,volumeAtWait,filterAtReviveMid,filterAfterRevive,bossFilter,bossVolume;
            public float[] reviveTimes,reviveFilters,reviveVolumes;
            public bool regionHiddenAtWait,regionHiddenInBoss,objectiveLabelsComplete;
            public string[] objectiveThaiLabels;
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
            rec.objectiveLabelsComplete=true;
            for(int i=0;i<LobbyLanguage.Count;i++){var words=NativeObjectivePanel.LabelsForLocale(LobbyLanguage.GetCode(i));foreach(var word in words)if(string.IsNullOrEmpty(word))rec.objectiveLabelsComplete=false;}
            rec.objectiveThaiLabels=NativeObjectivePanel.LabelsForLocale("th");
            var englishWords=NativeObjectivePanel.LabelsForLocale("en");
            for(int i=0;i<rec.objectiveThaiLabels.Length;i++)if(rec.objectiveThaiLabels[i]==englishWords[i])rec.objectiveLabelsComplete=false;
            check(rec.objectiveLabelsComplete,"objective labels missing or Thai fell back to English");
            string language=lobby.Language;yield return null;yield return null;
            rec.fieldVisible=!lobby.IsBlocking&&view.cullingMask!=0;check(rec.fieldVisible,"lobby blocks field");
            var p=sim.Player;
            for(int i=0;i<400&&p.State!="fallen"&&p.State!="dead";i++){p.Iframes=0;sim.HurtPlayer(99999);}
            check(p.State=="fallen"&&p.FallenCanRevive,"first fall can revive: "+p.State);
            yield return DeathShot(output,"death_01_impact",files,.25f,300);
            yield return DeathShot(output,"death_02_wait",files,2f,180);
            rec.regionHiddenAtWait=RegionHudHiddenByDeath;check(rec.regionHiddenAtWait,"region HUD not suppressed during fallen presentation");
            rec.filterAtWait=revive.FilterAmount;rec.volumeAtWait=revive.VolumeWeight;
            // A new combat notice during death must also be rejected, not merely covered by the title.
            revive.Add(new ReviveText{Ko="쉴드 파괴!",En="Shield Break!",Color="#4488ff",Life=60});Toast("한방킬! ×5");
            rec.combatTextHidden=revive.Count==0&&damage.Count==0&&damageFloaters.Live(Time.unscaledTime).Count==0&&noticeUntil<=Time.unscaledTime;
            check(rec.combatTextHidden,"combat text survived death");
            check(rec.filterAtWait>.99f,"filter at 2s "+rec.filterAtWait);
            check(rec.volumeAtWait>.99f,"saturation volume at 2s "+rec.volumeAtWait);
            foreach(var code in new[]{"ko","en","ja","ru","th","el"}){lobby.SetLanguage(code);yield return DeathShot(output,"death_lang_"+code,files,2f,180);}
            lobby.SetLanguage(language);
            yield return DeathShot(output,"death_03_last",files,4.8f,12);
            bool fiveFrames=Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-death-revive-frames")>=0;
            revive.ForcedAge=4.95f;revive.ForcedReviveAge=fiveFrames?0:.25f;
            // Core TickFallen resolves the revive. Never fake Player.State/Hp or FallenCanRevive.
            DeathAdvanceTo(0);yield return null;yield return null;
            rec.actualRevive=p.State=="idle"&&p.Hp==p.MaxHp;rec.revivePhase=revive.ScreenPhase;
            check(rec.actualRevive,"Core revive failed: "+p.State);check(rec.revivePhase=="Reviving","phase after revive "+rec.revivePhase);
            rec.reviveTimes=fiveFrames?new[]{0f,.125f,.25f,.375f,.5f}:new[]{.25f};
            rec.reviveFilters=new float[rec.reviveTimes.Length];rec.reviveVolumes=new float[rec.reviveTimes.Length];
            for(int i=0;i<rec.reviveTimes.Length;i++){
                float age=rec.reviveTimes[i];revive.ForcedReviveAge=age;yield return null;yield return null;
                rec.reviveFilters[i]=revive.FilterAmount;rec.reviveVolumes[i]=revive.VolumeWeight;
                if(age==.25f)rec.filterAtReviveMid=revive.FilterAmount;
                if(i>0)check(rec.reviveFilters[i]<=rec.reviveFilters[i-1],"fade must decrease");
                if(fiveFrames)yield return DeathCapture(output,"death_revive_"+Mathf.RoundToInt(age*1000).ToString("D3"),files);
                if(age==.25f)yield return DeathCapture(output,"death_05_revive_mid",files);
            }
            check(rec.filterAtReviveMid>.45f&&rec.filterAtReviveMid<.55f,"half fade "+rec.filterAtReviveMid);
            if(fiveFrames)check(rec.reviveFilters[0]>.99f&&rec.reviveFilters[4]<=.001f&&rec.reviveVolumes[4]<=.001f,"five-frame endpoints");
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
            rec.regionHiddenInBoss=RegionHudHiddenByDeath;check(rec.regionHiddenInBoss,"region HUD not suppressed for non-revivable boss death");
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
