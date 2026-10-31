using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        [Serializable] sealed class ImpactReviewReceipt
        {
            public string scope="실제 GPU Player 16초: 고정 입력·AI 중지·첫 표적1회 실제 처치/나머지 불사 표적·현행 5스킬과 독/가시/어둠 탄 겹침 fixture. 자연 전투·미이식 스킬 증거 아님";
            public string device,coreTraceSha256; public bool world3D,baseline,passed;
            public int frames,contacts,dropped,damage,casts,spawned,peakParticles,skillGraphEvents,peakSkillHandles,poisonFrames,thornFrames,darkFrames;
            public int captureWidth,captureHeight;
            public int killedTargets;public bool killContactSeen;
            public bool kiThirdCastSeen,kiThirdHitSeen;public int kiThirdTier;
            public string[] graphSkills;public int coreMaliceBlasts,maliceBlastGraphEvents,droppedCritical;
            public bool skillAssetsReady;public string[] sections,castKinds,drawnSkills;
        }
        IEnumerator ImpactReview()
        {
            string output=Argument("-output");
            if(string.IsNullOrEmpty(output)||string.IsNullOrEmpty(Argument("--unity-qa-sandbox"))){Debug.LogError("임팩트 검수는 명시적 출력·격리 세이브가 필요");Application.Quit(2);yield break;}
            Directory.CreateDirectory(output);Directory.CreateDirectory(Path.Combine(output,"frames"));
            AudioListener.volume=0;AudioListener.pause=true;Application.runInBackground=true;Application.targetFrameRate=60;Time.captureDeltaTime=1f/60;
            smokeActive=true;dropSmoke=true;pauseSmoke=true;Running=false;
            int width,height;if(!int.TryParse(Argument("-impact-width"),out width))width=1600;if(!int.TryParse(Argument("-impact-height"),out height))height=900;
            width=Mathf.Clamp(width,1600,3840);height=Mathf.Clamp(height,900,2160);
            Screen.SetResolution(width,height,FullScreenMode.Windowed);lobby.ShowLobby();lobby.SelectPreview();lobby.EnterNativeTest();
            EndFirstPractice(true);frontendEntryInputFence=false;menu=false;Running=false;
            yield return new WaitForSecondsRealtime(.6f);
            float deadline=Time.realtimeSinceStartup+45;
            while(NativeRemodel3D.Requested&&!NativeRemodel3D.Active&&Time.realtimeSinceStartup<deadline){UpdateViews();yield return null;}
            var sim=Simulation;var p=sim.Player;
            sim.Config.EnemyAiEnabled=false;sim.SpawnHoles=null;sim.CrossbowAuto=false;sim.Stage.Enabled=false;
            sim.Enemies.Clear();p.Iframes=10000;sim.Materials=1000;
            var rc=new ImpactReviewReceipt{device=SystemInfo.graphicsDeviceName,world3D=NativeRemodel3D.Active,baseline=!contactVfx.Enabled,
                captureWidth=Screen.width,captureHeight=Screen.height,
                sections=new[]{"일반공격","기검참3타·완전충전","가시덫","지옥강타","회복영역","얼음보주","악의구"}};
            var trace=new StringBuilder();int frame=0,damage=0,shot=0,blastsBefore=sim.MaliceOrbBlasts;
            var castKinds=new HashSet<string>();Action<string> castSeen=id=>castKinds.Add(id);sim.SkillCast+=castSeen;
            foreach(string section in rc.sections)
            {
                int sectionIndex=Array.IndexOf(rc.sections,section),length=sectionIndex==1?240:120;
                p.State="idle";p.StateTicks=0;p.Stamina=p.MaxStamina;p.Mana=p.MaxMana;
                sim.Config.ActiveAttack=sectionIndex==0?"weapon":"kiSlash";
                sim.Enemies.Clear();
                // Independent controlled sections: an earlier ten-second trap
                // must not create repeated hits that hide the next skill's cue.
                // This explicit fixture reset is identical in both render paths.
                sim.FireZones.Clear();sim.SlamWaves.Clear();sim.SkillBlades.Clear();sim.MaliceOrbs.Clear();sim.Projectiles.Clear();sim.IceOrbActive=false;
                for(int k=0;k<3;k++)sim.Enemies.Add(new EnemyState{Id=-91000-sectionIndex*10-k,Etype=0,Hp=sectionIndex==0&&k==0?1:1000000,MaxHp=1000000,Level=1,X=p.X+(k<2?48:104),Y=p.Y+(k==0?-28:k==1?28:0),Radius=15,Poise=1000,MaxPoise=1000});
                // Deliberate synthetic hazard lane, below the player. Actual Core projectile
                // stepping is retained, so both render paths see the identical moving shots.
                if(sim.Druid!=null)
                {
                    sim.Druid.Projectiles.Clear();
                    for(int k=0;k<3;k++)sim.Druid.Projectiles.Add(new BossProjectile{X=p.X+400+k*35,Y=p.Y+85+k*22,Vx=-3,Vy=0,R=8,Sz=1.1,Life=180,Ml=180,Dmg=1,Active=true,DruidPoison=k==0,El=k==2?3:0,ParryClass=k==1?"physical":"magic"});
                }
                // Seed actor observations before damage; no fabricated hit is sent to the VFX view.
                UpdateViews();
                int hpBefore=0;foreach(var e in sim.Enemies)hpBefore+=e.Hp;
                for(int f=0;f<length;f++,frame++)
                {
                    impactReviewClock=frame/60f;
                    sim.Stage.Enabled=false;
                    sim.SetPlayerCombatInput(false,false,false);sim.SetMagicInput(section=="악의구"&&f<96);
                    sim.SetSkillInput(section=="가시덫"&&f==0,false,false,false,section=="지옥강타"&&f==0||section=="얼음보주"&&f==80,section=="회복영역"&&f==0,section=="얼음보주"&&f==0,false);
                    sim.Tick(0,0,p.X+300,p.Y,sectionIndex==0||sectionIndex==1&&f<220,false);
                    foreach(var feedback in sim.Feedback)if(feedback.Step==3)
                    {
                        if(feedback.Kind==FeedbackKind.Sample&&feedback.SampleKey=="sword_swing3"){rc.kiThirdCastSeen=true;rc.kiThirdTier=Math.Max(rc.kiThirdTier,feedback.Tier);}
                        if(feedback.Kind==FeedbackKind.KiSlashHit)rc.kiThirdHitSeen=true;
                    }
                    DispatchFeedback();UpdateViews();Running=false;
                    if(sectionIndex==0&&!sim.Enemies[0].Alive&&contactVfx.EnemyFrozen(sim.Enemies[0].Id,ImpactNow)&&contactVfx.Spawned>0)rc.killContactSeen=true;
                    trace.Append(sim.TickCount).Append('|').Append(p.State).Append('|').Append(p.X.ToString("R",CultureInfo.InvariantCulture)).Append('|').Append(p.Y.ToString("R",CultureInfo.InvariantCulture)).Append('|')
                        .Append(p.Stamina.ToString("R",CultureInfo.InvariantCulture)).Append('|').Append(p.Mana.ToString("R",CultureInfo.InvariantCulture)).Append('|').Append(sim.SkillCastCount);
                    foreach(var e in sim.Enemies)trace.Append('|').Append(e.Id).Append(':').Append(e.Hp).Append(':').Append(e.X.ToString("R",CultureInfo.InvariantCulture)).Append(':').Append(e.Y.ToString("R",CultureInfo.InvariantCulture));
                    if(sim.Druid!=null)foreach(var b in sim.Druid.Projectiles)trace.Append('|').Append(b.X.ToString("R",CultureInfo.InvariantCulture)).Append(':').Append(b.Y.ToString("R",CultureInfo.InvariantCulture)).Append(':').Append(b.Life.ToString("R",CultureInfo.InvariantCulture)).Append(':').Append(b.Active);
                    trace.Append('\n');
                    yield return null;yield return new WaitForEndOfFrame();
                    if(frame%2==0)ScreenCapture.CaptureScreenshot(Path.Combine(output,"frames","impact-"+(shot++).ToString("0000")+".png"));
                }
                int hpAfter=0;foreach(var e in sim.Enemies){hpAfter+=e.Hp;if(!e.Alive)rc.killedTargets++;}damage+=hpBefore-hpAfter;
            }
            rc.frames=shot;rc.contacts=contactVfx.Contacts;rc.dropped=contactVfx.Dropped;rc.damage=damage;rc.casts=sim.SkillCastCount;
            sim.SkillCast-=castSeen;rc.castKinds=new List<string>(castKinds).ToArray();rc.spawned=contactVfx.Spawned;rc.peakParticles=contactVfx.PeakParticles;
            rc.skillAssetsReady=skillRemaster.Ready;rc.skillGraphEvents=skillRemaster.GraphEvents;rc.peakSkillHandles=skillRemaster.PeakHandles;rc.drawnSkills=skillRemaster.SeenSkills;
            rc.poisonFrames=skillRemaster.PoisonFrames;rc.thornFrames=skillRemaster.ThornFrames;rc.darkFrames=skillRemaster.DarkFrames;
            rc.graphSkills=skillRemaster.SeenGraphSkills;rc.coreMaliceBlasts=sim.MaliceOrbBlasts-blastsBefore;rc.maliceBlastGraphEvents=skillRemaster.MaliceBlastEvents;rc.droppedCritical=skillRemaster.DroppedCritical;
            string traceText=trace.ToString();File.WriteAllText(Path.Combine(output,"core-trace.txt"),traceText);
            using(var sha=SHA256.Create())rc.coreTraceSha256=BitConverter.ToString(sha.ComputeHash(Encoding.UTF8.GetBytes(traceText))).Replace("-","").ToLowerInvariant();
            rc.passed=rc.captureWidth==width&&rc.captureHeight==height&&rc.world3D==NativeRemodel3D.Requested&&shot==480&&damage>0&&rc.killedTargets>=1&&rc.kiThirdCastSeen&&rc.kiThirdHitSeen&&rc.kiThirdTier==3&&rc.coreMaliceBlasts>0&&castKinds.Contains("spikeTrap")&&castKinds.Contains("giantSlam")&&castKinds.Contains("holyDome")&&castKinds.Contains("iceOrb")&&castKinds.Contains("fireball")&&(rc.baseline||rc.killContactSeen&&rc.contacts>0&&rc.spawned>0&&rc.peakParticles>0&&rc.skillAssetsReady&&rc.drawnSkills.Length==5&&rc.graphSkills.Length==5&&rc.maliceBlastGraphEvents>0&&rc.skillGraphEvents>0&&rc.poisonFrames>0&&rc.thornFrames>0&&rc.darkFrames>0);
            File.WriteAllText(Path.Combine(output,"impact-review.json"),JsonUtility.ToJson(rc,true));
            lobby.enabled=false;lobby.CloseStartupCaptureMedia();sound.Reset();
            yield return new WaitForSecondsRealtime(.8f);Application.Quit(rc.passed?0:2);
        }
    }
}
