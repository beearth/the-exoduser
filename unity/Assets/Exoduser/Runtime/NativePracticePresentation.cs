using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
    [Serializable] sealed class FirstPracticeCopy {public string id,ko,en;}
    [Serializable] sealed class FirstPracticeData {public FirstPracticeCopy[] entries;}
    public sealed partial class NativeGame
    {
        // Web #parryLesson (parry-lesson.css + ui-foundation.css), 1920x1080 computed rects: 400-wide panel at right 56, frame = transparent still of the live panel.
        const float LessonW=400,LessonH=1048,LessonRight=56,LessonTop=16;
        FirstPracticeData practiceCopy;Texture2D lessonBase;Font lessonFont,lessonKeyFont;readonly Dictionary<string,GUIStyle> lessonStyles=new Dictionary<string,GUIStyle>();
        static Color Hex(int rgb,float a=1f){return new Color(((rgb>>16)&255)/255f,((rgb>>8)&255)/255f,(rgb&255)/255f,a);}
        string PracticeCopy(string id)
        {
            if(practiceCopy==null)practiceCopy=JsonUtility.FromJson<FirstPracticeData>(Resources.Load<TextAsset>("Data/first_practice").text);
            foreach(var entry in practiceCopy.entries)if(entry.id==id)return lobby.Language=="ko"?entry.ko:entry.en;
            throw new InvalidOperationException("Missing source practice copy "+id);
        }
        Rect PracticePanel(float width){return new Rect(width-LessonRight-LessonW,LessonTop,LessonW,LessonH);}
        bool PointerOverPractice()
        {float s=Mathf.Min(Screen.width/1920f,Screen.height/1080f);return PracticePanel(Screen.width/s).Contains(new Vector2(ExoInput.MousePosition.x/s,(Screen.height-ExoInput.MousePosition.y)/s));}
        GUIStyle LessonStyle(int size,TextAnchor anchor,Color color,bool bold=false,bool wrap=false,bool key=false)
        {
            string id=size+"|"+anchor+"|"+ColorUtility.ToHtmlStringRGBA(color)+bold+wrap+key;GUIStyle s;if(lessonStyles.TryGetValue(id,out s))return s;
            s=new GUIStyle(GUI.skin.label){font=key?lessonKeyFont:lessonFont,fontSize=size,alignment=anchor,fontStyle=bold?FontStyle.Bold:FontStyle.Normal,wordWrap=wrap,clipping=TextClipping.Overflow,padding=new RectOffset(),margin=new RectOffset()};
            s.normal.textColor=color;lessonStyles[id]=s;return s;
        }
        // web step numbers: -3 move, -2 left, -1 right, 8 trap, 0..7 parry; `step%2===0` picks the purple "magic" accent (JS -2%2 === -0 is true, -3%2 and -1%2 are not)
        static int WebStepNumber(PracticeStep step){switch(step){case PracticeStep.Move:return -3;case PracticeStep.Left:return -2;case PracticeStep.Right:return -1;case PracticeStep.Trap:return 8;default:return (int)step-4;}}
        string PracticeRowLabel(int row)
        {
            switch(row){case 0:return PracticeCopy("moveLabel");case 1:return PracticeCopy("attackLabel");case 2:return PracticeCopy("rightLabel");case 3:return PracticeCopy("trapLabel");}
            string key=row==4?"Q":row==5?"E":null;string text=PracticeCopy("parryLabel"+(row-4));
            return key!=null?key+" · "+text:text;
        }
        string PracticeStepKey(PracticeStep step)
        {switch(step){case PracticeStep.Move:return "W A S D";case PracticeStep.Left:return PracticeCopy("leftKey");case PracticeStep.Right:return PracticeCopy("rightKey");case PracticeStep.Trap:return "1 + W A S D";case PracticeStep.Chain:return "SHIFT";case PracticeStep.Roll:return "↔ + SPACE";case PracticeStep.RageBurst:return "SPACE";default:return ((int)step-4)%2==0?"Q":"E";}}
        string PracticeStepTitle(PracticeStep step)
        {switch(step){case PracticeStep.Move:return PracticeCopy("moveTitle");case PracticeStep.Left:return PracticeCopy("attackTitle");case PracticeStep.Right:return PracticeCopy("rightTitle");case PracticeStep.Trap:return PracticeCopy("trapTitle");default:return PracticeCopy("parryTitle"+((int)step-4));}}
        string PracticeStepHint(PracticeStep step)
        {
            switch(step)
            {
                case PracticeStep.Move:return PracticeCopy("moveHint");
                case PracticeStep.Left:return PracticeCopy("attackHint").Replace("{p0}",Math.Min(10,firstPractice.LeftKills).ToString()).Replace("{p1}",firstPractice.FullChargeKill?"1":"0");
                case PracticeStep.Right:return PracticeCopy("rightHint").Replace("{p0}",firstPractice.RightKills.ToString());
                case PracticeStep.ParryMagic:case PracticeStep.ParryPhysical:
                {
                    bool q=step==PracticeStep.ParryMagic;string key=q?"Q":"E";
                    string status=practiceMissed?PracticeCopy("missHint"):firstPractice.ParriedShot?PracticeCopy("parryHintDone"):PracticeCopy("parryHintTry");
                    return PracticeCopy("parryHintRing")+PracticeCopy(q?"parryHint0a":"parryHint1a").Replace("{p0}",key)+"\n"+status;
                }
                case PracticeStep.HoldMagic:case PracticeStep.HoldPhysical:return PracticeCopy(step==PracticeStep.HoldMagic?"parryHint2":"parryHint3").Replace("{p0}",step==PracticeStep.HoldMagic?"Q":"E");
                case PracticeStep.RageParry:return PracticeCopy("parryHint6");
                case PracticeStep.Chain:return ChainHint();
                case PracticeStep.Roll:return PracticeCopy("rollHint").Replace("{p0}",firstPractice.RollCount.ToString());
                case PracticeStep.RageBurst:return PracticeCopy("rageHint");
                default:return PracticeCopy("trapHint").Replace("{p0}",firstPractice.TrapPlaced?"✓":"□").Replace("{p1}",firstPractice.TrapEscaped?"✓":"□").Replace("{p2}",firstPractice.TrapKills.ToString());
            }
        }
        static void FrameRect(Rect r,Color line){Fill(new Rect(r.x,r.y,r.width,1),line);Fill(new Rect(r.x,r.yMax-1,r.width,1),line);Fill(new Rect(r.x,r.y,1,r.height),line);Fill(new Rect(r.xMax-1,r.y,1,r.height),line);}
        void DrawFirstPractice(float width)
        {
            if(firstPractice==null||menu||!gameFocused)return;
            if(lessonBase==null){lessonBase=Resources.Load<Texture2D>("Art/ui/tutorial/lesson_base");lessonFont=Resources.Load<Font>("Art/fonts/NanumMyeongjo-Regular");lessonKeyFont=Resources.Load<Font>("Art/fonts/CinzelDecorative-Bold")??lessonFont;}
            if(firstPractice.Step==PracticeStep.RageBurst&&firstPractice.Practising&&firstPractice.FocusTicks>0)
            {
                // #parryLesson[data-rage-focus=true] hides the panel but keeps the skip button; the overlay points at the SPACE slot
                DrawRageFocus();var fr=PracticePanel(width);string fs=PracticeCopy("skip");var fst=LessonStyle(12,TextAnchor.MiddleCenter,Hex(0xdccbb6));float fw=Mathf.Max(98,fst.CalcSize(new GUIContent(fs)).x+24);
                var fb=new Rect(fr.center.x-fw/2,fr.yMax-69,fw,36);Fill(fb,Hex(0x1d1413));FrameRect(fb,Hex(0x665044));NativeUiAudit.Label(fb,fs,fst);
                if(NativeUiAudit.Button(fb,GUIContent.none,GUIStyle.none))EndFirstPractice(true);
                return;
            }
            var rect=PracticePanel(width);GUI.DrawTexture(rect,lessonBase,ScaleMode.StretchToFill,true);
            var step=firstPractice.Step;int webStep=WebStepNumber(step);var phase=firstPractice.Phase;bool done=phase==FirstPracticePhase.Done,intro=phase==FirstPracticePhase.Intro;
            bool magic=webStep%2==0;Color accent=done||phase==FirstPracticePhase.Success?Hex(0xb2d6ac):magic?Hex(0xc5a4f2):Hex(0xe0c18b);
            float x=rect.x+24,w=348,y=rect.y+68;
            // eyebrow: "01 · 직접 실습" left, state right
            NativeUiAudit.Label(new Rect(x,y,w,16),"01 · "+PracticeCopy("eyebrow"),LessonStyle(11,TextAnchor.MiddleLeft,Hex(0xc7b4a2)));
            string state=done?"COMPLETE":intro?PracticeCopy("stateIntro"):phase==FirstPracticePhase.Success?PracticeCopy("stateSuccess"):PracticeCopy("statePractice");
            NativeUiAudit.Label(new Rect(x,y,w,16),state,LessonStyle(11,TextAnchor.MiddleRight,accent));
            // key cap art (right aligned): 62 high before the start, 48 in practice
            float artH=intro?64:50,capH=intro?62:48;string cap=done?"✓":PracticeStepKey(step);
            bool plainLatin=true;foreach(char ch in cap)if(!(ch>='A'&&ch<='Z'||ch==' '))plainLatin=false;var capStyle=LessonStyle(intro?28:26,TextAnchor.MiddleCenter,Hex(0xfff0df),true,false,plainLatin);float capW=Mathf.Max(capH,capStyle.CalcSize(new GUIContent(cap)).x+22);   // Cinzel Decorative only for plain capitals (its digit 1 reads as I)
            var capRect=new Rect(x+w-capW,y+16+10+artH-capH,capW,capH);
            Fill(new Rect(capRect.x,capRect.y+4,capRect.width,capRect.height),Hex(0x050405));Fill(capRect,Hex(0x1b171a));Fill(new Rect(capRect.x,capRect.y,capRect.width,capRect.height*.5f),Hex(0x2a2528,.7f));
            Fill(new Rect(capRect.x+3,capRect.y+3,capRect.width-6,capRect.height-6),Hex(0x17141a,.55f));FrameRect(capRect,accent);NativeUiAudit.Label(capRect,cap,capStyle);
            y+=16+10+artH+(intro?16:14);
            // title + subtitle
            string title=done?PracticeCopy("doneTitle"):PracticeStepTitle(step);var titleStyle=LessonStyle(29,TextAnchor.UpperLeft,Hex(0xf4e6d2),true,true);
            float lineH=titleStyle.CalcHeight(new GUIContent("가"),w),titleH=titleStyle.CalcHeight(new GUIContent(title),w);int titleLines=Mathf.Max(1,Mathf.RoundToInt(titleH/lineH));NativeUiAudit.Label(new Rect(x+1,y+2,w,titleH),title,LessonStyle(29,TextAnchor.UpperLeft,new Color(0,0,0,.8f),true,true));NativeUiAudit.Label(new Rect(x,y,w,titleH),title,titleStyle);y+=titleLines*37.7f+7;
            int number=firstPractice.Index+1;string sub=done?PracticeCopy("doneSub"):number+" / 12 · "+(step==PracticeStep.Trap?PracticeCopy("trapShort"):PracticeRowLabel(firstPractice.Index));
            NativeUiAudit.Label(new Rect(x,y,w,20),sub,LessonStyle(12,TextAnchor.MiddleLeft,Hex(0xc2b6a9)));y+=19+20;
            // checklist: 4 basic rows then the 8 parry rows; the current row opens its hint
            var line=Hex(0x65453c);Fill(new Rect(x,y,w,1),line);y+=1+16;
            for(int row=0;row<12;row++)
            {
                bool current=row==firstPractice.Index&&!done,complete=row<firstPractice.Checks.Length&&firstPractice.Checks[row];
                var rowRect=new Rect(x,y,w,38.4f);
                if(current){Fill(rowRect,Hex(0x551819,.55f));Fill(new Rect(rowRect.x,rowRect.y,rowRect.width*.6f,rowRect.height),Hex(0x551819,.25f));FrameRect(rowRect,Hex(0xa34d3f));Fill(new Rect(rowRect.x+1,rowRect.y+1,2,rowRect.height-2),Hex(0xec7958));}
                var box=new Rect(x+9,y+11.2f,16,16);Fill(box,complete?Hex(0xb2d6ac):Hex(0x0d0d10));FrameRect(box,complete?Hex(0xb2d6ac):Hex(0x9a8271));
                if(complete){var ink=Hex(0x172117);for(int k=0;k<4;k++)Fill(new Rect(box.x+3+k,box.y+7+k,2,2),ink);for(int k=0;k<6;k++)Fill(new Rect(box.x+6+k,box.y+10-k,2,2),ink);}
                var rowColor=current?Hex(0xfff0df):complete?Hex(0xb2d6ac):Hex(0xbfb4a8);
                NativeUiAudit.Label(new Rect(x+35,y,w-40,38.4f),PracticeRowLabel(row),LessonStyle(14,TextAnchor.MiddleLeft,rowColor,current));
                if(!FirstPracticeFlow.Ported[row])NativeUiAudit.Label(new Rect(x+35,y,w-45,38.4f),PracticeCopy("notPorted"),LessonStyle(11,TextAnchor.MiddleRight,Hex(0x7f7367)));
                y+=38.4f+6;
                if(current)
                {
                    string hint=done?(lobby.Language=="ko"?"이식된 실습(이동·좌클릭·우클릭·가시덫·사슬·구르기·분노 폭발)을 마쳤습니다. 패링 실습은 패링 반사 규칙 이식 뒤에 이어집니다.":"The ported exercises (movement, left click, right click, Spike Trap, chain, roll, Rage burst) are complete. The parry exercises follow once the parry reflection rule is ported."):PracticeStepHint(step);var hintStyle=LessonStyle(14,TextAnchor.UpperLeft,Hex(0xe8d9c6),true,true);float hintH=hintStyle.CalcHeight(new GUIContent(hint),w-16);
                    NativeUiAudit.Label(new Rect(x+8,y,w-16,hintH),hint,hintStyle);y+=hintH+10;
                    if(step==PracticeStep.Left&&!intro&&phase==FirstPracticePhase.Practice)y=DrawLessonHold(x+8,y,w-16,accent);
                    else if((step==PracticeStep.Chain||step==PracticeStep.HoldMagic||step==PracticeStep.HoldPhysical||step==PracticeStep.RageParry)&&!intro&&phase==FirstPracticePhase.Practice)y=DrawChainHold(x+8,y,w-16,accent);
                }
            }
            if(done){string note=PracticeCopy("doneHint");var ns=LessonStyle(14,TextAnchor.UpperLeft,Hex(0xe8d9c6),true,true);float nh=ns.CalcHeight(new GUIContent(note),w-16);NativeUiAudit.Label(new Rect(x+8,y+4,w-16,nh),note,ns);}
            y+=10;
            // footer (bottom anchored): optional primary button, then skip, then the progress hairline
            float bottom=rect.yMax;float skipY=bottom-69,progressY=bottom-23;
            float footerTop=intro||done?skipY-8-46-15:skipY-22;
            Fill(new Rect(rect.x+24,footerTop-1,w,1),Hex(0x57413c));
            if(intro){var b=new Rect(x,skipY-8-46,w,46);Fill(b,Hex(0x4a1816));Fill(new Rect(b.x,b.y,b.width,b.height*.5f),Hex(0x5e201c,.8f));FrameRect(b,Hex(0xb6614b));
                NativeUiAudit.Label(b,PracticeCopy("start"),LessonStyle(15,TextAnchor.MiddleCenter,Hex(0xfff0df),true));
                if(NativeUiAudit.Button(b,GUIContent.none,GUIStyle.none)){firstPractice.Start();skillInputFence=true;}}
            if(done){var b=new Rect(x,skipY-8-46,w,46);Fill(b,Hex(0x4a1816));Fill(new Rect(b.x,b.y,b.width,b.height*.5f),Hex(0x5e201c,.8f));FrameRect(b,Hex(0xb6614b));
                NativeUiAudit.Label(b,lobby.Language=="ko"?"1-1 전투로 계속":"Continue to combat in 1-1",LessonStyle(15,TextAnchor.MiddleCenter,Hex(0xfff0df),true));
                if(NativeUiAudit.Button(b,GUIContent.none,GUIStyle.none)){EndFirstPractice(false);return;}}
            string skip=PracticeCopy("skip");var skipStyle=LessonStyle(12,TextAnchor.MiddleCenter,Hex(0xdccbb6));float skipW=Mathf.Max(98,skipStyle.CalcSize(new GUIContent(skip)).x+24);
            var s=new Rect(rect.center.x-skipW/2,skipY,skipW,36);Fill(s,Hex(0x1d1413));FrameRect(s,Hex(0x665044));NativeUiAudit.Label(s,skip,skipStyle);
            if(NativeUiAudit.Button(s,GUIContent.none,GUIStyle.none)){EndFirstPractice(true);return;}
            // progress hairline = checked rows / 12
            Fill(new Rect(rect.x+24,progressY,w,2),Hex(0x39312a));int checks=0;foreach(var c in firstPractice.Checks)if(c)checks++;
            Fill(new Rect(rect.x+24,progressY,w*checks/12f,2),accent);
        }
        // chain step: caption + 8 px hold meter
        float DrawChainHold(float x,float y,float w,Color accent)
        {
            NativeUiAudit.Label(new Rect(x,y,w,18),practiceHoldLabel,LessonStyle(12,TextAnchor.MiddleLeft,accent));y+=18+7;
            Fill(new Rect(x,y,w,8),Hex(0x2a2428));FrameRect(new Rect(x,y,w,8),Hex(0x655445,.4f));Fill(new Rect(x,y,w*Mathf.Clamp01(practiceHoldValue/100f),8),accent);y+=8+16;
            return y;
        }
        // lesson-hold: accent caption + 8px meter (left-click charge)
        float DrawLessonHold(float x,float y,float w,Color accent)
        {
            var p=Simulation.Player;
            string caption=PracticeCopy(firstPractice.FullChargeKill?"chargeDone":p.KiChargeActive?"chargeHold":"chargePrompt").Replace("{p0}",Exoduser.UnityPort.Core.Simulation.KiChargeTier(p.KiChargeTicks).ToString());
            NativeUiAudit.Label(new Rect(x,y,w,18),caption,LessonStyle(12,TextAnchor.MiddleLeft,accent));y+=18+7;
            Fill(new Rect(x,y,w,8),Hex(0x2a2428));FrameRect(new Rect(x,y,w,8),Hex(0x655445,.4f));Fill(new Rect(x,y,w*Mathf.Clamp01(p.KiChargeTicks/120f),8),accent);y+=8+16;
            return y;
        }
    }
}
