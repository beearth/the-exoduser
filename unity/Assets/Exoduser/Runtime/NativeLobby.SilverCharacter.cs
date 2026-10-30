using UnityEngine;
namespace Exoduser.UnityPort
{
    public sealed partial class NativeLobby
    {
        Texture2D silverCornerTop,silverCornerBottom,silverVisualCancel,silverVisualCreate,silverVisualDisabled;
        Texture2D[] silverEmblems,silverPosters,silverPortraits;
        GUIStyle silverVisualTitle,silverVisualName,silverVisualDescription,silverVisualCaption,silverVisualAction,silverVisualTraitTitle,silverVisualTraitBody;
        Texture2D silverVisualVignette,silverHeadingLine;
        void EnsureSilverVisual()
        {
            SilverStyles();
            if(silverEmblems!=null)return;
            silverVisualCancel=Resources.Load<Texture2D>("Art/ui/silver_hell/visual_cancel");
            silverVisualCreate=Resources.Load<Texture2D>("Art/ui/silver_hell/visual_create");
            silverVisualDisabled=Resources.Load<Texture2D>("Art/ui/silver_hell/visual_disabled");
            silverCornerTop=Resources.Load<Texture2D>("Art/ui/silver_hell/panel_corner_0");
            silverCornerBottom=Resources.Load<Texture2D>("Art/ui/silver_hell/panel_corner_1");
            presentationTraitGlyphs=Resources.Load<Texture2D>("Art/ui/silver_hell/trait_silver")??presentationTraitGlyphs;
            silverPortraits=new Texture2D[5];string[] fallbackNames={"portrait_warrior","portrait_silvertail","portrait_hellgunner","portrait_transmuter","portrait_spearmage"};for(int p=0;p<5;p++)silverPortraits[p]=Resources.Load<Texture2D>("Art/CharacterSelect/"+fallbackNames[p]);silverPosters=new Texture2D[5];string[] posterNames={"poster_idle_warrior_cs3_4k","poster_idle_silvertail_4k","poster_idle_hellgunner","poster_idle_transmuter","poster_idle_spearmage"};for(int p=0;p<5;p++)silverPosters[p]=Resources.Load<Texture2D>("Art/CharacterSelect/"+posterNames[p]);silverEmblems=new Texture2D[5];
            string[] names=
            {
                "warrior","silvertail","hellgunner","transmuter","spearmage"
            };
            for(int n=0;n<5;n++)silverEmblems[n]=Resources.Load<Texture2D>(n==0?"Art/CharacterSelect/emblem_"+names[n]:"Art/ui/silver_hell/emblem_"+names[n]+"_disabled");
            silverVisualTitle=new GUIStyle(silverName)
            {
                fontSize=18
            };
            silverVisualName=new GUIStyle(silverName)
            {
                fontSize=28
            };
            silverVisualDescription=new GUIStyle(silverBody)
            {
                fontSize=14,wordWrap=true
            };
            silverVisualDescription.normal.textColor=new Color(185/255f,182/255f,176/255f);
            silverVisualCaption=new GUIStyle(silverMicro)
            {
                fontSize=11
            };
            silverVisualTraitTitle=new GUIStyle(silverName)
            {
                fontSize=15
            };
            silverVisualTraitTitle.normal.textColor=NativeSilverHellUi.Text;
            silverVisualTraitBody=new GUIStyle(silverBody)
            {
                fontSize=13,wordWrap=true
            };
            silverHeadingLine=NativeSilverHellUi.Effect(220,1,(u,v)=>new Color(155/255f,158/255f,158/255f,.62f*u));
            silverVisualAction=new GUIStyle(silverBody)
            {
                fontSize=15,alignment=TextAnchor.MiddleCenter
            };
            silverVisualAction.normal.textColor=NativeSilverHellUi.Text;
            silverVisualVignette=NativeSilverHellUi.Effect(256,144,(u,v)=>
            {
                float a=u<.18f?Mathf.Lerp(.35f,0,u/.18f):u<.64f?0:Mathf.Lerp(0,.66f,Mathf.Clamp01((u-.64f)/.20f));float b=v>.7f?Mathf.Lerp(0,.72f,(v-.7f)/.3f):0;return new Color(0,0,0,a+b*(1-a));
            });
        }
        void SilverCornerPanel(Rect r)
        {
            NativeSilverHellUi.Panel(r,28,8);
        }
        void DrawSilverScene(Rect box,int i)
        {
            var playback=characterPresentationPlayback==null?null:characterPresentationPlayback.Video;
            Texture src=silverPosters[i]??silverPortraits[i]??presentationCutouts[i];
            if(playback!=null)
            {
                if(presentationVideoVisual!=i)
                {
                    string[] files={"cs_idle_warrior_cs3_4k.mp4","cs_idle_silvertail_4k.mp4","cs_idle_hellgunner.mp4","cs_idle_transmuter.mp4","cs_idle_spearmage.mp4"};playback.Open(files[i],true,true,false);
                    presentationVideoVisual=i;
                    presentationVideoStartedAt=Time.unscaledTime;
                }
                if(i==0&&playback.Prepared&&playback.Player!=null)playback.Player.playbackSpeed=.75f;
                if(playback.Error.Length==0&&playback.Prepared&&playback.Frame>=0)src=playback.Texture;
            }
            Image(box,src,ScaleMode.ScaleAndCrop);
        }
        void DrawSilverCharacterVisual()
        {
            CharacterStyles();
            EnsureSilverVisual();
            float w=Screen.width,h=Screen.height;
            int i=Mathf.Clamp(characterVisual,0,4);
            bool locked=i!=0,shortScreen=h<=940;
            float x=w-420,bodyY=62,top=bodyY+(shortScreen?190:300),size=shortScreen?54:64;
            string[] railLabels={"전사","실버테일","헬거너","변성술사","창법사"};
            string[] railEnglish={"Warrior","Silvertail","Hellgunner","Transmuter","Spearmage"};
            var railName=new GUIStyle(silverBody){wordWrap=true,alignment=TextAnchor.UpperCenter};
            var railSoon=new GUIStyle(silverVisualCaption){wordWrap=true,alignment=TextAnchor.UpperCenter};
            const float labelWidth=76,labelGap=9,footerGap=9,actionGap=18;
            float nameHeight=0,soonHeight=0;
            for(int n=0;n<5;n++)
            {
                string text=VisualSelectionLabel(railLabels[n],railEnglish[n]);railName.font=NativeSilverHellUi.TextFont(silverBody.font,text);
                railEnglish[n]=SilverRailName(text,railName,labelWidth);
                nameHeight=Mathf.Max(nameHeight,railName.CalcHeight(new GUIContent(railEnglish[n]),labelWidth));
            }
            string soon=VisualSelectionLabel("출시 준비 중","Coming soon");railSoon.font=NativeSilverHellUi.TextFont(silverVisualCaption.font,soon);
            soonHeight=railSoon.CalcHeight(new GUIContent(soon),labelWidth);
            float railY=h-84-actionGap-size-labelGap-nameHeight-footerGap-soonHeight;
            NativeUiAudit.Region(new Rect(0,0,w,h),"panel");
            Fill(new Rect(0,0,w,h),Color.black);
            DrawSilverScene(new Rect(0,0,w,h),i);
            Image(new Rect(0,0,w,h),silverVisualVignette,ScaleMode.StretchToFill);
            string headingText=VisualSelectionLabel("캐릭터 선택","CHOOSE YOUR CHARACTER");
            float headingWidth=SpacedWidth(silverVisualTitle.font,18,headingText,3.6f)-3.6f;
            DrawSpaced((w-headingWidth)/2,30,26,headingText,silverVisualTitle.font,18,3.6f,NativeSilverHellUi.Text,true);
            Image(new Rect((w-headingWidth)/2-238,45,220,1),silverHeadingLine,ScaleMode.StretchToFill);
            GUI.DrawTextureWithTexCoords(new Rect((w+headingWidth)/2+18,45,220,1),silverHeadingLine,new Rect(1,0,-1,1),true);
            var info=new Rect(x,bodyY,380,shortScreen?156:148.5f);
            SilverCornerPanel(info);
            SilverLabel(new Rect(x+28,bodyY+26,324,16),VisualSelectionLabel(presentationJobs[i],new[]
            {
                "WARRIOR","BLADE DANCER","HELLGUNNER","TRANSMUTER","SPEARMAGE"
            }
            [i]),silverVisualCaption,TextAnchor.MiddleLeft);
            DrawSpaced(x+28,bodyY+48,40,VisualSelectionLabel(presentationNames[i],new[]
            {
                "Exoduser Warrior","Silvertail","Hellgunner","Transmuter","Spearmage"
            }
            [i]),silverVisualName.font,28,3.36f,NativeSilverHellUi.Bright,true);
            SilverLabel(new Rect(x+28,bodyY+100,324,38),VisualSelectionLabel(presentationDescriptions[i],new[]
            {
                "A black-iron warrior wielding a greatsword.","One spinning sword; her dance is annihilation.","A blood-moon marksman who uses her own blood as ammunition.","A hunter who transmutes core flame into bow, scythe, spear and sword.","A herald of the void who seals space with runes."
            }
            [i]),silverVisualDescription,TextAnchor.UpperLeft);
            var traitTitles=new string[3];var traitBodies=new string[3];var traitHeights=new float[3];float traitContentHeight=72;
            for(int n=0;n<3;n++)
            {
                string[] bits=presentationTraits[i,n].Split('|');traitTitles[n]=VisualSelectionLabel(bits[1],TraitEnglish(i,n));traitBodies[n]=VisualSelectionLabel(bits[2],TraitEnglishBody(i,n));
                var measure=new GUIStyle(silverVisualTraitBody){font=NativeSilverHellUi.TextFont(silverVisualTraitBody.font,traitBodies[n])};
                traitHeights[n]=shortScreen?44:27+Mathf.Max(35,measure.CalcHeight(new GUIContent(traitBodies[n]),276))+12;
                traitContentHeight+=traitHeights[n];
            }
            var traits=new Rect(x+8,top+16,364,shortScreen?214:Mathf.Max(284.4f,traitContentHeight+8));
            SilverCornerPanel(traits);
            var playstyle=VisualSelectionLabel("플레이 방식","PLAYSTYLE");float playWidth=SpacedWidth(silverVisualTitle.font,18,playstyle,3.6f)-3.6f;DrawSpaced(x+190-playWidth/2,traits.y+22,28,playstyle,silverVisualTitle.font,18,3.6f,NativeSilverHellUi.Text,false);
            Fill(new Rect(x+34,traits.y+58,312,1),new Color(.61f,.62f,.62f,.18f));
            float traitY=traits.y+72;
            for(int n=0;n<3;n++)
            {
                float y=traitY;
                DrawGlyph(new Rect(x+36,y+7,22,22),i*3+n,Color.white);
                SilverLabel(new Rect(x+68,y,276,27),traitTitles[n],silverVisualTraitTitle,TextAnchor.MiddleLeft);
                if(!shortScreen)SilverLabel(new Rect(x+68,y+27,276,traitHeights[n]-39),traitBodies[n],silverVisualTraitBody,TextAnchor.UpperLeft);
                if(n<2)Fill(new Rect(x+34,y+traitHeights[n]-3,312,1),new Color(.61f,.62f,.62f,.12f));
                traitY+=traitHeights[n];
            }
            GUI.SetNextControlName("visual-info-left");
            if(NativeUiAudit.Button(info,"",GUIStyle.none))GUI.FocusControl("visual-info-left");
            GUI.SetNextControlName("visual-info-right");
            if(NativeUiAudit.Button(traits,"",GUIStyle.none))GUI.FocusControl("visual-info-right");
            for(int n=0;n<5;n++)
            {
                var r=new Rect(x+n*(380-size)/4,railY,size,size);
                Fill(r,new Color(.035f,.039f,.043f,.84f));
                Image(new Rect(r.x+3,r.y+3,size-6,size-6),silverEmblems[n]??presentationBusts[n],ScaleMode.ScaleAndCrop);
                if(n>0)DrawSilverClassLock(r);
                Border(r,n==i?NativeSilverHellUi.Bright:new Color(.61f,.62f,.62f,.62f),1);
                if(n==i)Border(new Rect(r.x-3,r.y-3,size+6,size+6),NativeSilverHellUi.Text,1);
                float labelX=r.center.x-labelWidth/2;
                SilverLabel(new Rect(labelX,r.yMax+labelGap,labelWidth,nameHeight),railEnglish[n],railName,TextAnchor.UpperCenter);
                if(n>0)SilverLabel(new Rect(labelX,r.yMax+labelGap+nameHeight+footerGap,labelWidth,soonHeight),soon,railSoon,TextAnchor.UpperCenter);
                GUI.SetNextControlName("visual-icon-"+n);
                if(NativeUiAudit.Button(new Rect(r.x-4,r.y-4,size+8,size+labelGap+nameHeight+footerGap+soonHeight+4),"",GUIStyle.none))
                {
                    ChooseCharacterVisual(n);
                    GUI.FocusControl("visual-icon-"+n);
                }
            }
            bool prior=GUI.enabled;
            Rect cancel=new Rect(x,h-84,180,44),create=new Rect(x+200,h-84,180,44);
            var cancelPlate=new Rect(cancel.x+8,cancel.y,cancel.width-16,cancel.height);
            var createPlate=new Rect(create.x+8,create.y,create.width-16,create.height);
            NativeSilverHellUi.ActionPlate(cancelPlate,false,cancel.Contains(Event.current.mousePosition)?1:0,!AutomatedInput&&cancel.Contains(Event.current.mousePosition)&&ExoInput.Mouse(0));
            var actionTint=GUI.color;if(locked)GUI.color=new Color(actionTint.r*.45f,actionTint.g*.45f,actionTint.b*.45f,actionTint.a);
            NativeSilverHellUi.ActionPlate(createPlate,!locked,create.Contains(Event.current.mousePosition)&&!locked?1:0,!AutomatedInput&&create.Contains(Event.current.mousePosition)&&ExoInput.Mouse(0));GUI.color=actionTint;
            GUI.SetNextControlName("visual-cancel");
            SilverLabel(cancel,CharacterDialogLabel("cancel",K("취소","CANCEL")),silverVisualAction,TextAnchor.MiddleCenter);if(NativeUiAudit.Button(cancel,"",GUIStyle.none))CloseCharacterCreation();
            GUI.enabled=prior&&!locked;
            GUI.SetNextControlName("visual-create");
            SilverLabel(create,locked?CharacterDialogLabel("comingSoon",K("출시 준비 중","COMING SOON")):CharacterDialogLabel("create",K("생성","CREATE")),silverVisualAction,TextAnchor.MiddleCenter);if(NativeUiAudit.Button(create,"",GUIStyle.none))ConfirmCharacterVisual();
            GUI.enabled=prior;
            if(characterVisualFocusPending&&Event.current.type==EventType.Repaint)
            {
                GUI.FocusControl("visual-icon-"+i);
                characterVisualFocusPending=false;
            }
        }
        // 이모지/대각선 사슬 대신 원화 문장을 보존하고 작은 금속 자물쇠를 표시한다.
        static string SilverRailName(string text,GUIStyle style,float width)
        {
            if(text.IndexOf(' ')>=0||style.CalcSize(new GUIContent(text)).x<=width)return text;
            // 한 글자만 다음 행에 남지 않도록 실제 두 행 폭의 최대값이 가장 작은 분할점을 사용한다.
            int split=-1;float best=float.MaxValue;
            for(int n=2;n<text.Length-1;n++)
            {
                float first=style.CalcSize(new GUIContent(text.Substring(0,n))).x,last=style.CalcSize(new GUIContent(text.Substring(n))).x;
                float larger=Mathf.Max(first,last);if(larger<=width&&larger<best){split=n;best=larger;}
            }
            return split<0?text:text.Substring(0,split)+"\n"+text.Substring(split);
        }
        void DrawSilverClassLock(Rect icon)
        {
            var c=GUI.color;float s=14;Rect body=new Rect(icon.center.x-s/2,icon.yMax-18,s,11);
            Fill(new Rect(body.x+3,body.y-6,8,7),new Color(.035f,.039f,.043f,.96f));
            Border(new Rect(body.x+3,body.y-6,8,8),new Color(.57f,.58f,.56f,.95f),1);
            Fill(body,new Color(.055f,.059f,.061f,.98f));Border(body,new Color(.62f,.63f,.60f,.98f),1);
            Fill(new Rect(body.center.x-.7f,body.y+3,1.4f,4),NativeSilverHellUi.Text);GUI.color=c;
        }
    }
}
