using UnityEngine;
using System.Collections.Generic;
namespace Exoduser.UnityPort
{
    public sealed partial class NativeLobby
    {
        Texture2D silverCornerTop,silverCornerBottom,silverVisualCancel,silverVisualCreate,silverVisualDisabled;
        Texture2D[] silverEmblems,silverPosters,silverPortraits;
        GUIStyle silverVisualTitle,silverVisualName,silverVisualDescription,silverVisualCaption,silverVisualAction,silverVisualTraitTitle,silverVisualTraitBody;
        Texture2D silverVisualVignette,silverVisualSideShade,silverHeadingLine,silverClassChains;
        void EnsureSilverVisual()
        {
            SilverStyles();
            if(silverEmblems!=null)return;
            silverVisualCancel=Resources.Load<Texture2D>("Art/ui/silver_hell/visual_cancel");
            silverVisualCreate=Resources.Load<Texture2D>("Art/ui/silver_hell/visual_create");
            silverVisualDisabled=Resources.Load<Texture2D>("Art/ui/silver_hell/visual_disabled");
            silverClassChains=Resources.Load<Texture2D>("Art/CharacterSelect/coming_soon_chains_v2");
            silverCornerTop=Resources.Load<Texture2D>("Art/ui/silver_hell/panel_corner_0");
            silverCornerBottom=Resources.Load<Texture2D>("Art/ui/silver_hell/panel_corner_1");
            presentationTraitGlyphs=Resources.Load<Texture2D>("Art/ui/silver_hell/trait_silver")??presentationTraitGlyphs;
            silverPortraits=new Texture2D[5];string[] fallbackNames={"portrait_warrior","portrait_silvertail","portrait_hellgunner","portrait_transmuter","portrait_spearmage"};for(int p=0;p<5;p++)silverPortraits[p]=Resources.Load<Texture2D>("Art/CharacterSelect/"+fallbackNames[p]);silverPosters=new Texture2D[5];string[] posterNames={"poster_idle_warrior_cs3_4k","poster_idle_silvertail_4k","poster_idle_hellgunner","poster_idle_transmuter","poster_idle_spearmage"};for(int p=0;p<5;p++)silverPosters[p]=Resources.Load<Texture2D>("Art/CharacterSelect/"+posterNames[p]);silverEmblems=new Texture2D[5];
            string[] names=
            {
                "warrior","silvertail","hellgunner","transmuter","spearmage"
            };
            for(int n=0;n<5;n++)silverEmblems[n]=Resources.Load<Texture2D>(n==0?"Art/CharacterSelect/emblem_warrior_ui64":"Art/ui/silver_hell/emblem_"+names[n]+"_disabled");
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
                float b=v>.7f?Mathf.Lerp(0,.72f,(v-.7f)/.3f):0;return new Color(0,0,0,b);
            });
            silverVisualSideShade=NativeSilverHellUi.Effect(256,1,(u,v)=>new Color(0,0,0,.66f*u));
        }
        List<string> SilverParagraphLines(string text,float size,float width,out GUIStyle style)
        {
            int integerSize=Mathf.CeilToInt(size);float scale=size/integerSize;style=new GUIStyle(silverBody){font=CharacterBodyFont(text),fontSize=integerSize,wordWrap=false,padding=new RectOffset(),margin=new RectOffset(),alignment=TextAnchor.UpperLeft};var lines=new List<string>();int start=0;
            while(start<text.Length){int end=start,last=-1;for(int i=start+1;i<=text.Length;i++){if(style.CalcSize(new GUIContent(text.Substring(start,i-start).TrimEnd())).x*scale>width){end=last>start?last:Mathf.Max(start+1,i-1);break;}end=i;if(i<text.Length&&text[i-1]==' ')last=i;}if(end<=start)end=text.Length;lines.Add(text.Substring(start,end-start).Trim());start=end;while(start<text.Length&&text[start]==' ')start++;}return lines;
        }
        float SilverParagraphHeight(string text,float size,float width,float lineHeight){GUIStyle style;return SilverParagraphLines(text,size,width,out style).Count*lineHeight;}
        void DrawSilverParagraph(float x,float y,float width,string text,float size,float lineHeight,Color color)
        {
            GUIStyle style;var lines=SilverParagraphLines(text,size,width,out style);float scale=size/Mathf.CeilToInt(size);var before=GUI.matrix;GUI.matrix=before*Matrix4x4.TRS(new Vector3(x,y,0),Quaternion.identity,new Vector3(scale,scale,1));style.normal.textColor=color;
            try{for(int line=0;line<lines.Count;line++)NativeSilverHellUi.Label(new Rect(0,line*lineHeight/scale,width/scale,lineHeight/scale),lines[line],style);}finally{GUI.matrix=before;}
        }
        // 11-04 first-impression 3: serif for the menu / character select / intro prompt. Hangul and CJK use Nanum Myeongjo (the name dialog's font), Latin titles and labels Cinzel 600,
        // Latin / other-script body text Nanum with the shared TextFont fallback (Noto Serif CJK / Thai / Naskh), so all 29 languages keep their glyphs.
        Font characterSerif,characterCinzel;
        static bool LatinOnly(string text){foreach(char c in text)if(c>0x24F&&c!='\u00B7'&&c!='\u2014'&&c!='\u2013'&&c!='\u2019'&&c!='\u201C'&&c!='\u201D'&&c!='\u2026'&&c!='\u2022')return false;return true;}
        // Body serif = Hahmlet (user-chosen body family, CLAUDE.md 4.2) through the shared body path; Nanum Myeongjo stays the glyph fallback inside TextFont. Only real Noto Sans spots were swapped (lead review 11-04).
        Font CharacterBodyFont(string text){if(characterSerif==null)characterSerif=NativeSilverHellUi.Font(true)??Resources.Load<Font>("Art/fonts/NanumMyeongjo-Regular");return NativeSilverHellUi.TextFont(characterSerif,text);}
        Font CharacterTitleFont(string text){if(characterCinzel==null)characterCinzel=Resources.Load<Font>("Art/fonts/Cinzel-600")??Resources.Load<Font>("Art/fonts/Cinzel-VariableFont_wght");if(LatinOnly(text)&&NativeSilverHellUi.Covers(characterCinzel,text))return characterCinzel;return CharacterBodyFont(text);}
        void CharacterLabel(Rect rect,string text,GUIStyle style,TextAnchor alignment,bool title){var previous=style.font;try{style.font=title?CharacterTitleFont(text):CharacterBodyFont(text);Label(rect,text,style,alignment);}finally{style.font=previous;}}
        void DrawSilverReleaseLock()
        {
            // Web cs-stage is the physical viewport minus the 440px right rail: its centre is safe-centre minus 220px.
            if(silverClassChains!=null){var shadow=GUI.color;GUI.color=new Color(0,0,0,.65f);Image(new Rect(520,335.296875f,440,440),silverClassChains,ScaleMode.StretchToFill);GUI.color=shadow;Image(new Rect(520,327.296875f,440,440),silverClassChains,ScaleMode.StretchToFill);}
            string label=VisualSelectionLabel("출시 준비 중","Coming soon");var font=CharacterTitleFont(label);float spacing=3.84f,width=SpacedWidth(font,24,label,spacing)-spacing;var box=new Rect(740-(width+62)/2,775.296875f,width+62,61);
            Fill(box,new Color(8/255f,11/255f,11/255f,.94f));Border(box,new Color(112/255f,115/255f,115/255f),1);DrawSpaced(740-width/2,box.y+12,37,label,font,24,spacing,new Color(197/255f,194/255f,188/255f),false);NativeUiAudit.Region(new Rect(520,327.296875f,440,509),"component","character-release-lock","정본 X사슬440·출시준비중 Cinzel/명조24");
        }
        void SilverCornerPanel(Rect r)
        {
            NativeSilverHellUi.Panel(r,60,18);
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
                if(playback.Presentable)src=playback.Texture;
            }
            if(src!=null)NativeUiViewport.DrawExtendedScene(src,box,silverPosters[i]??silverPortraits[i]??presentationCutouts[i]);
        }
        void DrawSilverCharacterVisual()
        {
            CharacterStyles();
            EnsureSilverVisual();
            float w=NativeUiSafeArea.DesignWidth,h=NativeUiSafeArea.DesignHeight;
            int i=Mathf.Clamp(characterVisual,0,4);
            bool locked=i!=0,shortScreen=h<=940;
            float x=w-420,bodyY=62,top=bodyY+(shortScreen?190:300),size=shortScreen?54:64;
            string[] railLabels={"전사","실버테일","헬거너","변성술사","창법사"};
            string[] railEnglish={"Warrior","Silvertail","Hellgunner","Transmuter","Spearmage"};
            var railName=new GUIStyle(silverBody){fontSize=13,fontStyle=FontStyle.Normal,wordWrap=true,alignment=TextAnchor.UpperCenter};
            var railSoon=new GUIStyle(silverVisualCaption){fontSize=14,fontStyle=FontStyle.Normal,wordWrap=true,alignment=TextAnchor.UpperCenter};
            railSoon.normal.textColor=new Color(111/255f,114/255f,114/255f);
            const float labelWidth=76,labelGap=9,footerGap=9,actionGap=18;
            float nameHeight=0,soonHeight=0;
            for(int n=0;n<5;n++)
            {
                string text=VisualSelectionLabel(railLabels[n],railEnglish[n]);railName.font=CharacterTitleFont(text);
                railEnglish[n]=SilverRailName(text,railName,labelWidth);
                nameHeight=Mathf.Max(nameHeight,railName.CalcHeight(new GUIContent(railEnglish[n]),labelWidth));
            }
            string soon=VisualSelectionLabel("출시 준비 중","Coming soon");railSoon.font=CharacterTitleFont(soon);
            soon=SilverRailSoon(soon,railSoon,labelWidth-8);// 디자인 판정 11-04: 칸 간격 79px에 한 줄 75px이면 네 칸이 붙어 보인다 → 한 줄이 68px를 넘으면 균형 두 줄
            soonHeight=railSoon.CalcHeight(new GUIContent(soon),labelWidth);
            float railY=h-84-actionGap-size-labelGap-nameHeight-footerGap-soonHeight;
            NativeUiAudit.Region(new Rect(0,0,w,h),"panel");
            Fill(new Rect(0,0,w,h),Color.black);
            DrawSilverScene(new Rect(0,0,w,h),i);
            Image(NativeUiViewport.ScreenInDesign,silverVisualVignette,ScaleMode.StretchToFill);var backdropMatrix=GUI.matrix;GUI.matrix=NativeUiViewport.RightMatrix;var shade=new Rect(1440,0,480,1080);Image(shade,silverVisualSideShade,ScaleMode.StretchToFill);NativeUiAudit.Region(shade,"component","frontend-shade","캐릭터 오른쪽 음영480");GUI.matrix=backdropMatrix;
            string headingText=VisualSelectionLabel("캐릭터 선택","CHOOSE YOUR CHARACTER");
            var headingFont=CharacterTitleFont(headingText);float headingWidth=SpacedWidth(headingFont,18,headingText,3.6f)-3.6f;
            DrawSpaced((w-headingWidth)/2,30,26,headingText,headingFont,18,3.6f,NativeSilverHellUi.Text,true);
            Image(new Rect((w-headingWidth)/2-238,45,220,1),silverHeadingLine,ScaleMode.StretchToFill);
            NativeUiAudit.DrawTextureWithTexCoords(new Rect((w+headingWidth)/2+18,45,220,1),silverHeadingLine,new Rect(1,0,-1,1),true);
            DrawCharacterBasicStory(i);
            if(locked)DrawSilverReleaseLock();
            var centerMatrix=GUI.matrix;GUI.matrix=NativeUiViewport.RightMatrix;NativeUiAudit.Region(new Rect(1500,0,420,1080),"component","frontend-right","캐릭터 선택 오른쪽 레일");
            string description=VisualSelectionLabel(presentationDescriptions[i],presentationDescriptions[i]);float descHeight=SilverParagraphHeight(description,14,308,24.5f);
            var info=new Rect(x,bodyY,380,shortScreen?156:Mathf.Max(165.5f,110.6f+descHeight+30));top=bodyY+Mathf.Max(info.height+44,shortScreen?190:300);
            SilverCornerPanel(info);
            CharacterLabel(new Rect(x+36,bodyY+34,308,16),VisualSelectionLabel(presentationJobs[i],new[]
            {
                "WARRIOR","BLADE DANCER","HELLGUNNER","TRANSMUTER","SPEARMAGE"
            }
            [i]),silverVisualCaption,TextAnchor.MiddleLeft,true);
            string nameText=VisualSelectionLabel(presentationNames[i],new[]
            {
                "Exoduser Warrior","Silvertail","Hellgunner","Transmuter","Spearmage"
            }
            [i]);
            // 11-04 overlap ratchet: Latin names now use Cinzel (wider than Hahmlet), so fr "Guerrier Exoduser" ran 2px past the panel edge.
            // Shrink in whole points (tracking scales with size) until the run fits the 308px text column; no ellipsis, no wrap.
            var nameFont=CharacterTitleFont(nameText);int nameSize=28;
            while(nameSize>18&&SpacedWidth(nameFont,nameSize,nameText,3.36f*nameSize/28f)-3.36f*nameSize/28f>308f)nameSize--;
            DrawSpaced(x+36,bodyY+59.4f,39.2f,nameText,nameFont,nameSize,3.36f*nameSize/28f,NativeSilverHellUi.Bright,true);
            DrawSilverParagraph(x+36,bodyY+110.6f,308,description,14,24.5f,new Color(185/255f,182/255f,176/255f));
            var traitTitles=new string[3];var traitBodies=new string[3];var traitHeights=new float[3];float traitContentHeight=72;
            for(int n=0;n<3;n++)
            {
                string[] bits=presentationTraits[i,n].Split('|');traitTitles[n]=VisualSelectionLabel(bits[1],TraitEnglish(i,n));traitBodies[n]=VisualSelectionLabel(bits[2],TraitEnglishBody(i,n));
                var measure=new GUIStyle(silverVisualTraitBody){font=CharacterBodyFont(traitBodies[n])};
                traitHeights[n]=shortScreen?44:27+Mathf.Max(35,measure.CalcHeight(new GUIContent(traitBodies[n]),276))+12;
                traitContentHeight+=traitHeights[n];
            }
            var traits=new Rect(x+8,top+16,364,shortScreen?214:Mathf.Max(284.4f,traitContentHeight+8));
            SilverCornerPanel(traits);
            var playstyle=VisualSelectionLabel("플레이 방식","PLAYSTYLE");var playFont=CharacterTitleFont(playstyle);float playWidth=SpacedWidth(playFont,18,playstyle,3.6f)-3.6f;DrawSpaced(x+190-playWidth/2,traits.y+22,28,playstyle,playFont,18,3.6f,NativeSilverHellUi.Text,false);
            Fill(new Rect(x+34,traits.y+58,312,1),new Color(.61f,.62f,.62f,.18f));
            float traitY=traits.y+72;
            for(int n=0;n<3;n++)
            {
                float y=traitY;
                DrawGlyph(new Rect(x+36,y+7,22,22),i*3+n,Color.white);
                CharacterLabel(new Rect(x+68,y,276,27),traitTitles[n],silverVisualTraitTitle,TextAnchor.MiddleLeft,true);
                if(!shortScreen)CharacterLabel(new Rect(x+68,y+27,276,traitHeights[n]-39),traitBodies[n],silverVisualTraitBody,TextAnchor.UpperLeft,false);
                if(n<2)Fill(new Rect(x+34,y+traitHeights[n]-3,312,1),new Color(.61f,.62f,.62f,.12f));
                traitY+=traitHeights[n];
            }
            GUI.SetNextControlName("visual-info-left");
            if(EntrySoundButton(info))GUI.FocusControl("visual-info-left");
            GUI.SetNextControlName("visual-info-right");
            if(EntrySoundButton(traits))GUI.FocusControl("visual-info-right");
            for(int n=0;n<5;n++)
            {
                var r=new Rect(x+n*(380-size)/4,railY,size,size);
                Fill(r,new Color(.035f,.039f,.043f,.84f));
                Image(new Rect(r.x+3,r.y+3,size-6,size-6),silverEmblems[n]??presentationBusts[n],ScaleMode.ScaleAndCrop);
                if(n>0)DrawSilverClassLock(r);
                Border(r,n==i?NativeSilverHellUi.Bright:new Color(.61f,.62f,.62f,.62f),1);
                if(n==i)Border(new Rect(r.x-3,r.y-3,size+6,size+6),NativeSilverHellUi.Text,1);
                float labelX=r.center.x-labelWidth/2;
                railName.normal.textColor=n==i?NativeSilverHellUi.Bright:NativeSilverHellUi.Dim;
                CharacterLabel(new Rect(labelX,r.yMax+labelGap,labelWidth,nameHeight),railEnglish[n],railName,TextAnchor.UpperCenter,true);
                if(n>0)CharacterLabel(new Rect(labelX,r.yMax+labelGap+nameHeight+footerGap,labelWidth,soonHeight),soon,railSoon,TextAnchor.UpperCenter,true);
                GUI.SetNextControlName("visual-icon-"+n);
                if(NativeUiAudit.Button(new Rect(r.x-4,r.y-4,size+8,size+labelGap+nameHeight+footerGap+soonHeight+4),"",GUIStyle.none))
                {
                    ChooseCharacterVisual(n);
                    GUI.FocusControl("visual-icon-"+n);
                }
            }
            bool prior=GUI.enabled;
            Rect cancel=new Rect(x,h-84,180,44),create=new Rect(x+200,h-84,180,44);
            TrackQaNameButton(create);
            // 11-04 lead review: the flat hexagon plates are replaced by the shared thorn ActionPlate (create = crimson primary). Labels are drawn here (Hahmlet / Cinzel) with the existing character-dialog keys.
            DrawVisualActionPlate(cancel,CharacterDialogLabel("cancel",K("취소","Cancel")),false,"visual-cancel",true);
            DrawVisualActionPlate(create,locked?CharacterDialogLabel("comingSoon",K("출시 준비 중","Coming soon")):CharacterDialogLabel("create",K("생성","Create")),!locked,"visual-create",!locked);
            GUI.SetNextControlName("visual-cancel");
            if(NativeUiAudit.Button(cancel,"",GUIStyle.none))CloseCharacterCreation();
            GUI.enabled=prior&&!locked;
            GUI.SetNextControlName("visual-create");
            if(DecisionSoundButton(create))ConfirmCharacterVisual();
            GUI.enabled=prior;GUI.matrix=centerMatrix;
            if(characterVisualFocusPending&&Event.current.type==EventType.Repaint)
            {
                GUI.FocusControl("visual-icon-"+i);
                characterVisualFocusPending=false;
            }
        }
        void DrawVisualActionPlate(Rect r,string text,bool primary,string control,bool enabled)
        {
            bool hover=enabled&&r.Contains(Event.current.mousePosition);bool focus=enabled&&GUI.GetNameOfFocusedControl()==control;
            bool pressed=!AutomatedInput&&hover&&ExoInput.Mouse(0);
            NativeSilverHellUi.ActionPlate(r,primary,focus||hover?1:0,pressed,28,6);
            // Long translations (de "Demnächst verfügbar", fr) must stay inside the plate: tighten the tracking first, then step the size down (floor 11px).
            var f=CharacterTitleFont(text);int size=15;float spacing=size*.2f,limit=r.width-20,width=SpacedWidth(f,size,text,spacing)-spacing;
            if(width>limit){spacing=size*.08f;width=SpacedWidth(f,size,text,spacing)-spacing;}
            while(width>limit&&size>11){size--;spacing=size*.08f;width=SpacedWidth(f,size,text,spacing)-spacing;}
            var color=!enabled?new Color(138/255f,141/255f,141/255f):(focus||hover)?new Color(242/255f,237/255f,226/255f):new Color(223/255f,214/255f,194/255f);
            DrawSpaced(r.center.x-width/2,r.y,r.height,text,f,size,spacing,color,true);
        }
        // 웹 .cs-ico.locked .cs-ico-ring::after의 같은 X 사슬 원본을 슬롯 전체에 표시한다.
        // "출시 준비 중" 같은 레일 아래 문구: 한 줄이 maxWidth를 넘으면 공백 중 두 줄 폭의 최대값이 가장 작은 곳에서 나눈다(공백이 없으면 그대로, 줄바꿈은 GUIStyle에 맡김).
        static string SilverRailSoon(string text,GUIStyle style,float maxWidth)
        {
            if(string.IsNullOrEmpty(text)||style.CalcSize(new GUIContent(text)).x<=maxWidth)return text;
            int split=-1;float best=float.MaxValue;
            for(int n=text.IndexOf(' ');n>0;n=text.IndexOf(' ',n+1))
            {
                float a=style.CalcSize(new GUIContent(text.Substring(0,n))).x,b=style.CalcSize(new GUIContent(text.Substring(n+1))).x,worst=Mathf.Max(a,b);
                if(worst<best){best=worst;split=n;}
            }
            return split<0?text:text.Substring(0,split)+"\n"+text.Substring(split+1);
        }

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
            if(silverClassChains!=null)Image(icon,silverClassChains,ScaleMode.StretchToFill);
        }
    }
}
