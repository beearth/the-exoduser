using System;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
    [Serializable] sealed class FirstPracticeCopy {public string id,ko,en;}
    [Serializable] sealed class FirstPracticeData {public FirstPracticeCopy[] entries;}
    public sealed partial class NativeGame
    {
        FirstPracticeData practiceCopy;GUIStyle practiceText,practiceTitle,practiceButton;Texture2D practicePlaque;
        string PracticeCopy(string id)
        {
            if(practiceCopy==null)practiceCopy=JsonUtility.FromJson<FirstPracticeData>(Resources.Load<TextAsset>("Data/first_practice").text);
            foreach(var entry in practiceCopy.entries)if(entry.id==id)return lobby.Language=="ko"?entry.ko:entry.en;
            throw new InvalidOperationException("Missing source practice copy "+id);
        }
        Rect PracticePanel(float width){return new Rect(width-396,150,372,650);}
        bool PointerOverPractice()
        {float s=Mathf.Min(Screen.width/1920f,Screen.height/1080f);return PracticePanel(Screen.width/s).Contains(new Vector2(Input.mousePosition.x/s,(Screen.height-Input.mousePosition.y)/s));}
        void DrawFirstPractice(float width)
        {
            if(firstPractice==null||menu||!gameFocused)return;
            if(practiceText==null){var f=Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-Regular")??font;practiceText=new GUIStyle(GUI.skin.label){font=f,fontSize=18,wordWrap=true};practiceText.normal.textColor=new Color(.88f,.84f,.76f);practiceTitle=new GUIStyle(practiceText){fontSize=25};practiceTitle.normal.textColor=new Color(.94f,.84f,.64f);practiceButton=new GUIStyle(GUI.skin.button){font=f,fontSize=18,wordWrap=true};}
            var rect=PracticePanel(width);if(practicePlaque==null)practicePlaque=Resources.Load<Texture2D>("Art/ui/tutorial/parry-plaque-v1");
            var tint=GUI.color;GUI.color=new Color(1,1,1,.78f);GUI.DrawTexture(rect,practicePlaque,ScaleMode.StretchToFill,true);GUI.color=tint;
            float x=rect.x+20,w=rect.width-40,y=rect.y+16;
            GUI.Label(new Rect(x,y,w,32),lobby.Language=="ko"?"01 · 직접 실습":"01 · Hands-on practice",practiceText);y+=126;
            bool attack=firstPractice.Phase==FirstPracticePhase.Attack||firstPractice.Phase==FirstPracticePhase.SupportedComplete;
            GUI.Label(new Rect(x,y,w,64),PracticeCopy(attack?"attackTitle":"moveTitle"),practiceTitle);y+=70;
            GUI.Label(new Rect(x,y,w,54),(firstPractice.MovementDone?"✓ ":"□ ")+PracticeCopy("moveLabel"),practiceText);y+=54;
            GUI.Label(new Rect(x,y,w,54),(firstPractice.AttackDone?"✓ ":"□ ")+PracticeCopy("attackLabel"),practiceText);y+=62;
            string hint=PracticeCopy(attack?"attackHint":"moveHint").Replace("{p0}",Math.Min(10,firstPractice.LeftKills).ToString()).Replace("{p1}",firstPractice.FullChargeKill?"1":"0");
            bool done=firstPractice.Phase==FirstPracticePhase.SupportedComplete;
            if(done)hint=lobby.Language=="ko"?"이동·좌클릭 실습을 마쳤습니다. 다음 우클릭 실습은 아직 이식되지 않았습니다.":"Movement and left-click practice complete. The next right-click exercise is not yet ported.";
            GUI.Label(new Rect(x,y,w,130),hint,practiceText);
            if(attack&&!done){
                var p=Simulation.Player;string charge=PracticeCopy(firstPractice.FullChargeKill?"chargeDone":p.KiChargeActive?"chargeHold":"chargePrompt").Replace("{p0}",Exoduser.UnityPort.Core.Simulation.KiChargeTier(p.KiChargeTicks).ToString());
                GUI.Label(new Rect(x,y+134,w,52),charge,practiceText);
                Fill(new Rect(x,y+190,w,6),new Color(.13f,.12f,.13f));Fill(new Rect(x,y+190,w*Mathf.Clamp01(p.KiChargeTicks/120),6),new Color(.75f,.65f,.43f));
            }
            if(firstPractice.Phase==FirstPracticePhase.Intro&&GUI.Button(new Rect(x,rect.yMax-98,w,44),PracticeCopy("start"),practiceButton)){firstPractice.Start();skillInputFence=true;}
            if(done&&GUI.Button(new Rect(x,rect.yMax-98,w,44),lobby.Language=="ko"?"1-1 전투로 계속":"Continue to combat in 1-1",practiceButton)){EndFirstPractice(false);return;}
            if(GUI.Button(new Rect(x,rect.yMax-46,w,34),PracticeCopy("skip"),practiceButton))EndFirstPractice(true);
        }
    }
}
