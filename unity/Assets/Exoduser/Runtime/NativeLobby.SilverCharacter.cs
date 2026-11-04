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
            int integerSize=Mathf.CeilToInt(size);float scale=size/integerSize;style=new GUIStyle(silverBody){font=NativeSilverHellUi.TextFont(silverBody.font,text),fontSize=integerSize,wordWrap=false,padding=new RectOffset(),margin=new RectOffset(),alignment=TextAnchor.UpperLeft};var lines=new List<string>();int start=0;
            while(start<text.Length){int end=start,last=-1;for(int i=start+1;i<=text.Length;i++){if(style.CalcSize(new GUIContent(text.Substring(start,i-start).TrimEnd())).x*scale>width){end=last>start?last:Mathf.Max(start+1,i-1);break;}end=i;if(i<text.Length&&text[i-1]==' ')last=i;}if(end<=start)end=text.Length;lines.Add(text.Substring(start,end-start).Trim());start=end;while(start<text.Length&&text[start]==' ')start++;}return lines;
        }
        float SilverParagraphHeight(string text,float size,float width,float lineHeight){GUIStyle style;return SilverParagraphLines(text,size,width,out style).Count*lineHeight;}
        void DrawSilverParagraph(float x,float y,float width,string text,float size,float lineHeight,Color color)
        {
            GUIStyle style;var lines=SilverParagraphLines(text,size,width,out style);float scale=size/Mathf.CeilToInt(size);var before=GUI.matrix;GUI.matrix=before*Matrix4x4.TRS(new Vector3(x,y,0),Quaternion.identity,new Vector3(scale,scale,1));style.normal.textColor=color;
            try{for(int line=0;line<lines.Count;line++)NativeSilverHellUi.Label(new Rect(0,line*lineHeight/scale,width/scale,lineHeight/scale),lines[line],style);}finally{GUI.matrix=before;}
        }
        void DrawSilverReleaseLock()
        {
            // Web cs-stage is the physical viewport minus the 440px right rail: its centre is safe-centre minus 220px.
            if(silverClassChains!=null){var shadow=GUI.color;GUI.color=new Color(0,0,0,.65f);Image(new Rect(520,335.296875f,440,440),silverClassChains,ScaleMode.StretchToFill);GUI.color=shadow;Image(new Rect(520,327.296875f,440,440),silverClassChains,ScaleMode.StretchToFill);}
            string label=VisualSelectionLabel("출시 준비 중","Coming soon");var font=NativeSilverHellUi.TextFont(Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-Regular"),label);float spacing=3.84f,width=SpacedWidth(font,24,label,spacing)-spacing;var box=new Rect(740-(width+62)/2,775.296875f,width+62,61);
            Fill(box,new Color(8/255f,11/255f,11/255f,.94f));Border(box,new Color(112/255f,115/255f,115/255f),1);DrawSpaced(740-width/2,box.y+12,37,label,font,24,spacing,new Color(197/255f,194/255f,188/255f),false);NativeUiAudit.Region(new Rect(520,327.296875f,440,509),"component","character-release-lock","정본 X사슬440·출시준비중 NotoSans24");
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
            var railSoon=new GUIStyle(silverVisualCaption){fontSize=10,wordWrap=true,alignment=TextAnchor.UpperCenter};
            railSoon.normal.textColor=new Color(111/255f,114/255f,114/255f);
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
            Image(NativeUiViewport.ScreenInDesign,silverVisualVignette,ScaleMode.StretchToFill);var backdropMatrix=GUI.matrix;GUI.matrix=NativeUiViewport.RightMatrix;var shade=new Rect(1440,0,480,1080);Image(shade,silverVisualSideShade,ScaleMode.StretchToFill);NativeUiAudit.Region(shade,"component","frontend-shade","캐릭터 오른쪽 음영480");GUI.matrix=backdropMatrix;
            string headingText=VisualSelectionLabel("캐릭터 선택","CHOOSE YOUR CHARACTER");
            float headingWidth=SpacedWidth(silverVisualTitle.font,18,headingText,3.6f)-3.6f;
            DrawSpaced((w-headingWidth)/2,30,26,headingText,silverVisualTitle.font,18,3.6f,NativeSilverHellUi.Text,true);
            Image(new Rect((w-headingWidth)/2-238,45,220,1),silverHeadingLine,ScaleMode.StretchToFill);
            NativeUiAudit.DrawTextureWithTexCoords(new Rect((w+headingWidth)/2+18,45,220,1),silverHeadingLine,new Rect(1,0,-1,1),true);
            DrawCharacterBasicStory(i);
            if(locked)DrawSilverReleaseLock();
            var centerMatrix=GUI.matrix;GUI.matrix=NativeUiViewport.RightMatrix;NativeUiAudit.Region(new Rect(1500,0,420,1080),"component","frontend-right","캐릭터 선택 오른쪽 레일");
            string description=VisualSelectionLabel(presentationDescriptions[i],presentationDescriptions[i]);float descHeight=SilverParagraphHeight(description,14,308,24.5f);
            var info=new Rect(x,bodyY,380,shortScreen?156:Mathf.Max(165.5f,110.6f+descHeight+30));top=bodyY+Mathf.Max(info.height+44,shortScreen?190:300);
            SilverCornerPanel(info);
            SilverLabel(new Rect(x+36,bodyY+34,308,16),VisualSelectionLabel(presentationJobs[i],new[]
            {
                "WARRIOR","BLADE DANCER","HELLGUNNER","TRANSMUTER","SPEARMAGE"
            }
            [i]),silverVisualCaption,TextAnchor.MiddleLeft);
            DrawSpaced(x+36,bodyY+59.4f,39.2f,VisualSelectionLabel(presentationNames[i],new[]
            {
                "Exoduser Warrior","Silvertail","Hellgunner","Transmuter","Spearmage"
            }
            [i]),silverVisualName.font,28,3.36f,NativeSilverHellUi.Bright,true);
            DrawSilverParagraph(x+36,bodyY+110.6f,308,description,14,24.5f,new Color(185/255f,182/255f,176/255f));
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
            TrackQaNameButton(create);
            NativeSilverHellUi.ArtImage(cancel,silverVisualCancel);
            NativeSilverHellUi.ArtImage(create,locked?silverVisualDisabled:silverVisualCreate);
            // The original KO labels are baked into these assets; do not print a second label.
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
        // 웹 .cs-ico.locked .cs-ico-ring::after의 같은 X 사슬 원본을 슬롯 전체에 표시한다.
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
