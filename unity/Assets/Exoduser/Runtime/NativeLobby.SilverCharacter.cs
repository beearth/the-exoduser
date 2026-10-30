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
            float x=w-420,bodyY=62,top=bodyY+(shortScreen?190:300),railY=h-(shortScreen?174:222),size=shortScreen?54:64;
            Fill(new Rect(0,0,w,h),Color.black);
            DrawSilverScene(new Rect(0,0,w,h),i);
            Image(new Rect(0,0,w,h),silverVisualVignette,ScaleMode.StretchToFill);
            string headingText=VisualSelectionLabel("캐릭터 선택","CHOOSE YOUR CHARACTER");
            float headingWidth=SpacedWidth(silverVisualTitle.font,18,headingText,3.6f)-3.6f;
            DrawSpaced((w-headingWidth)/2,30,26,headingText,silverVisualTitle.font,18,3.6f,NativeSilverHellUi.Text,true);
            Image(new Rect((w-headingWidth)/2-238,45,220,1),silverHeadingLine,ScaleMode.StretchToFill);
            GUI.DrawTextureWithTexCoords(new Rect((w+headingWidth)/2+18,45,220,1),silverHeadingLine,new Rect(1,0,-1,1),true);
            var info=new Rect(x,bodyY,380,shortScreen?132:148.5f);
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
            var traits=new Rect(x+8,top+16,364,shortScreen?214:284.4f);
            SilverCornerPanel(traits);
            var playstyle=VisualSelectionLabel("플레이 방식","PLAYSTYLE");float playWidth=SpacedWidth(silverVisualTitle.font,18,playstyle,3.6f)-3.6f;DrawSpaced(x+190-playWidth/2,traits.y+22,28,playstyle,silverVisualTitle.font,18,3.6f,NativeSilverHellUi.Text,false);
            Fill(new Rect(x+34,traits.y+58,312,1),new Color(.61f,.62f,.62f,.18f));
            for(int n=0;n<3;n++)
            {
                float y=traits.y+72+n*(shortScreen?44:68.5f);
                string[] bits=presentationTraits[i,n].Split('|');
                DrawGlyph(new Rect(x+36,y+7,22,22),i*3+n,Color.white);
                SilverLabel(new Rect(x+68,y,276,27),VisualSelectionLabel(bits[1],TraitEnglish(i,n)),silverVisualTraitTitle,TextAnchor.MiddleLeft);
                if(!shortScreen)SilverLabel(new Rect(x+68,y+27,276,35),VisualSelectionLabel(bits[2],TraitEnglishBody(i,n)),silverVisualTraitBody,TextAnchor.UpperLeft);
                if(n<2)Fill(new Rect(x+34,y+(shortScreen?43:66),312,1),new Color(.61f,.62f,.62f,.12f));
            }
            GUI.SetNextControlName("visual-info-left");
            if(GUI.Button(info,"",GUIStyle.none))GUI.FocusControl("visual-info-left");
            GUI.SetNextControlName("visual-info-right");
            if(GUI.Button(traits,"",GUIStyle.none))GUI.FocusControl("visual-info-right");
            string[] labels=
            {
                "전사","실버테일","헬거너","변성술사","창법사"
            };
            for(int n=0;n<5;n++)
            {
                var r=new Rect(x+n*(380-size)/4,railY,size,size);
                Fill(r,new Color(.035f,.039f,.043f,.84f));
                Image(new Rect(r.x+3,r.y+3,size-6,size-6),silverEmblems[n]??presentationBusts[n],ScaleMode.ScaleAndCrop);
                if(n>0)
                {
                    var c=GUI.color;
                    GUI.color=new Color(c.r,c.g,c.b,c.a*.68f);
                    Image(r,presentationChains);
                    GUI.color=c;
                }
                Border(r,n==i?NativeSilverHellUi.Bright:new Color(.61f,.62f,.62f,.62f),1);
                if(n==i)Border(new Rect(r.x-3,r.y-3,size+6,size+6),NativeSilverHellUi.Text,1);
                SilverLabel(new Rect(r.x-10,r.yMax+7,size+20,20),VisualSelectionLabel(labels[n],new[]
                {
                    "Warrior","Silvertail","Hellgunner","Transmuter","Spearmage"
                }
                [n]),silverBody,TextAnchor.MiddleCenter);
                if(n>0)SilverLabel(new Rect(r.x-10,r.yMax+30,size+20,20),VisualSelectionLabel("출시 준비 중","Coming soon"),silverVisualCaption,TextAnchor.MiddleCenter);
                GUI.SetNextControlName("visual-icon-"+n);
                if(GUI.Button(new Rect(r.x-4,r.y-4,size+8,size+58),"",GUIStyle.none))
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
            SilverLabel(cancel,CharacterDialogLabel("cancel",K("취소","CANCEL")),silverVisualAction,TextAnchor.MiddleCenter);if(GUI.Button(cancel,"",GUIStyle.none))CloseCharacterCreation();
            GUI.enabled=prior&&!locked;
            GUI.SetNextControlName("visual-create");
            SilverLabel(create,locked?CharacterDialogLabel("comingSoon",K("출시 준비 중","COMING SOON")):CharacterDialogLabel("create",K("생성","CREATE")),silverVisualAction,TextAnchor.MiddleCenter);if(GUI.Button(create,"",GUIStyle.none))ConfirmCharacterVisual();
            GUI.enabled=prior;
            if(characterVisualFocusPending&&Event.current.type==EventType.Repaint)
            {
                GUI.FocusControl("visual-icon-"+i);
                characterVisualFocusPending=false;
            }
        }
    }
}
