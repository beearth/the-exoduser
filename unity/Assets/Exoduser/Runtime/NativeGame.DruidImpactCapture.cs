using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        [Serializable] sealed class DruidImpactFrame
        {
            public string phase; public int frame, tick, contacts, width, life, holdTicks; public float hp, shield, coreShake, presentationShake; public bool hit, held, newContact, critical, matched;
        }
        [Serializable] sealed class DruidImpactReceipt
        {
            public string scope="격리된 실제 Player. 직접 보스 입장·정지한 AI·기본 무기 StepInput 공격. 일반/치명타 확률 0/100은 검수용 설정이며 제품 수치 변경 아님. OS 손조작·자연 종주 아님";
            public bool passed, world3dRequested, bossArena2d; public int failures, hits, matchedHits, contactFrames, heldFrames; public List<DruidImpactFrame> frames=new List<DruidImpactFrame>();
        }
        // 기존 playtest 진입점의 명시적 추가 옵션에서만 실행한다. 일반 실행/M1 경로는 사용하지 않는다.
        IEnumerator DruidImpactCapture()
        {
            string output=Argument("-output");
            if(string.IsNullOrEmpty(output)||string.IsNullOrEmpty(Argument("--unity-qa-sandbox"))||!NativeReviewArgs.BossDirect||!basicWeaponMode){Debug.LogError("드루이드 접점 검수는 출력·격리저장·boss-direct·basic-weapon 인자가 필요합니다.");Application.Quit(2);yield break;}
            Directory.CreateDirectory(output);AudioListener.volume=0;AudioListener.pause=true;smokeActive=true;dropSmoke=true;
            lobby.ShowLobby();lobby.SelectPreview();if(!lobby.EnterNativeTest()){Application.Quit(2);yield break;}
            menu=false;Running=false;frontendEntryInputFence=false;SetGameFocus(true);EndFirstPractice(true);BossDirectEnter();
            var sim=Simulation;var p=sim.Player;
            for(int i=0;i<900&&(!sim.Stage.InArena||sim.Stage.LoadPhase!=0);i++){StepInput(0,0,p.X+100,p.Y,false,false);if(i%10==0)yield return null;}
            var boss=sim.Stage.FindBoss();
            if(boss==null||!sim.Stage.InArena){Debug.LogError("드루이드 접점 검수 아레나 입장 실패");Application.Quit(2);yield break;}
            sim.Config.EnemyAiEnabled=false;p.Iframes=100000;p.X=boss.X-boss.Radius-p.Radius-4;p.Y=boss.Y;
            // 현행 --remodel3d는 필드만 3D이며 보스방에서 의도적으로 2D로 복귀한다.
            UpdateViews();yield return null;
            var receipt=new DruidImpactReceipt{world3dRequested=NativeRemodel3D.Requested,bossArena2d=sim.Stage.InArena&&!NativeRemodel3D.Active};
            if(!receipt.bossArena2d)receipt.failures++;
            foreach(string phase in new[]{"일반","치명타"})
            {
                // 전 단계의 공격·효과를 완전히 만료시켜 잔여 일반광으로 치명타 검수가 통과하지 않게 한다.
                for(int i=0;i<12;i++)StepInput(0,0,boss.X,boss.Y,false,false);
                if(bossView.ActiveDruidContacts!=0||druidImpact.Holding(sim.TickCount))receipt.failures++;
                sim.Config.PlayerCriticalChance=phase=="치명타"?100:0;
                int hits=0, contacts=0, holds=0, matchedHits=0, expectedHoldUntil=-1;float previous=boss.Hp+boss.Shield;
                for(int f=0;f<120;f++)
                {
                    StepInput(0,0,boss.X,boss.Y,true,false);float health=boss.Hp+boss.Shield;bool hit=health<previous-.001f;previous=health;
                    bool held=druidImpact.Holding(sim.TickCount);int active=bossView.ActiveDruidContacts;
                    var contact=druidImpact.LastContact;bool fresh=druidImpact.LastContactTick==sim.TickCount&&contact.Hit;
                    bool crit=phase=="치명타";
                    bool matched=hit&&fresh&&contact.DrawHit&&contact.Critical==crit&&contact.Width==(crit?72:48)&&contact.Life==(crit?8:6)&&contact.HoldTicks==(crit?4:2)&&held&&active>0;
                    if(hit)hits++;if(active>0)contacts++;if(held)holds++;
                    if(matched){matchedHits++;if(expectedHoldUntil<0)expectedHoldUntil=sim.TickCount+contact.HoldTicks;}
                    if(expectedHoldUntil>=0&&sim.TickCount<=expectedHoldUntil&&held!=(sim.TickCount<expectedHoldUntil))receipt.failures++;
                    receipt.frames.Add(new DruidImpactFrame{phase=phase,frame=f,tick=sim.TickCount,hp=boss.Hp,shield=boss.Shield,hit=hit,held=held,contacts=active,newContact=fresh,critical=fresh&&contact.Critical,matched=matched,width=fresh?contact.Width:0,life=fresh?contact.Life:0,holdTicks=fresh?contact.HoldTicks:0,coreShake=sim.ShakeAmount,presentationShake=(float)druidImpact.Shake(sim.TickCount)});
                    yield return null;
                    if(Application.isBatchMode)RmIntShot(Path.Combine(output,phase+"-"+f.ToString("000")+".png"));
                    else {yield return new WaitForEndOfFrame();ScreenCapture.CaptureScreenshot(Path.Combine(output,phase+"-"+f.ToString("000")+".png"));}
                }
                receipt.hits+=hits;receipt.matchedHits+=matchedHits;receipt.contactFrames+=contacts;receipt.heldFrames+=holds;
                if(hits==0||contacts==0||holds==0||matchedHits==0)receipt.failures++;
            }
            receipt.passed=receipt.failures==0;File.WriteAllText(Path.Combine(output,"접점검사.json"),JsonUtility.ToJson(receipt,true));
            lobby.enabled=false;lobby.CloseStartupCaptureMedia();sound.Reset();Application.Quit(receipt.passed?0:2);
        }
    }
}
