using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort {
    // Web inventory "유골함" page (game.html renderOssPanel, ui-refinement.css #invOssuaryPanel/#invOssAncestor), 1920x1080 design space.
    // Rects come from the measured web layout (docs/engine/UNITY_PC_INVENTORY_U04B_OSSUARY_20261026.md); the CSS filters on the ring,
    // sockets, urn, bones and portrait are baked offline by Tools/inventory-ossuary-bake/bake.py (no generated images).
    // Not ported: bone collection/hover/withdraw, ossuary unequip/re-equip, ancestor summon (page shows the web's start state).
    public sealed partial class NativeInventory {
        public const int PageEquipment=0,PageOssuary=1;
        public int Page {get;private set;}
        Texture2D ossRing,ossNode,ossCenter,ossUrn,ossPortrait,ossSigil;Texture2D[] ossBone;
        Vector2 ossScroll;
        static readonly string[] bonePartNames={"두개골","몸통","팔","다리"};
        static readonly string[] boneParts={"skull","torso","arms","legs"};
        static readonly Vector2[] boneNodes={new Vector2(1229.5f,425.5f),new Vector2(1377.5f,556.5f),new Vector2(1082.5f,556.5f),new Vector2(1229.5f,686.5f)};
        static readonly Rect[] boneNameRects={new Rect(1207,379,45,21),new Rect(1363,509,30,21),new Rect(1075,509,15,21),new Rect(1215,639,30,21)};
        static readonly Rect[] boneImageRects={new Rect(1204,399,51,51),new Rect(1352,530,51,51),new Rect(1056,530,51,51),new Rect(1204,660,51,51)};
        static readonly Rect[] boneGradeRects={new Rect(1209,451,42,22),new Rect(1356,581,42,22),new Rect(1061,581,42,22),new Rect(1209,712,42,22)};

        // --command line entry used for captures: "--unity-inventory-page ossuary" opens the window on this page.
        static int RequestedPage(){
            var a=Environment.GetCommandLineArgs();int i=Array.IndexOf(a,"--unity-inventory-page");
            return i>=0&&i+1<a.Length?(a[i+1]=="ossuary"?PageOssuary:a[i+1]=="crystals"?PageCrystals:a[i+1]=="storage"?PageStorage:PageEquipment):PageEquipment;
        }
        void OpenPage(){Page=RequestedPage();ossScroll=Vector2.zero;scrollDrag=false;crScroll=0;crScrollDrag=false;crFilter="all";stListScroll=0;}
        // Web _invChangeCategory: switching the page clears the selection.
        void SetPage(int page){
            if(page==Page)return;
            Page=page;State.Select(null);Navigation.TrackSelection();RefreshSelection();drag=null;dragging=false;scrollDrag=false;crScrollDrag=false;
        }

        void InitOssuary(){
            ossRing=Load("Art/ui/inventory/ossuary/ring_baked");ossNode=Load("Art/ui/inventory/ossuary/node_frame_baked");ossCenter=Load("Art/ui/inventory/ossuary/center_frame_baked");
            ossUrn=Load("Art/ui/inventory/ossuary/urn_lit_baked");ossPortrait=Load("Art/ui/inventory/ossuary/portrait_baked");ossSigil=Load("Art/ui/inventory/ossuary/sigil_1024");
            ossBone=new Texture2D[4];for(int i=0;i<4;i++)ossBone[i]=Load("Art/ui/inventory/ossuary/bone_"+boneParts[i]+"_dim");
        }

        // ---- text with the web serif face (Nanum Myeongjo) and CSS letter-spacing, any horizontal alignment ----
        Font SerifFont(){if(fontSerif==null)fontSerif=Resources.Load<Font>("Art/fonts/NanumMyeongjo-Regular")??fontRegular;return fontSerif;}
        GUIStyle SerifStyle(int size,bool bold){
            long key=-(2000000+size*2+(bold?1:0));
            if(!textStyles.TryGetValue(key,out var st)){
                st=new GUIStyle(GUI.skin.label){font=SerifFont(),fontSize=size,fontStyle=bold?FontStyle.Bold:FontStyle.Normal,alignment=TextAnchor.MiddleLeft,wordWrap=false,clipping=TextClipping.Overflow,padding=new RectOffset(),margin=new RectOffset(),contentOffset=Vector2.zero};
                textStyles[key]=st;
            }
            return st;
        }
        float SerifWidth(string s,int size,bool bold,float spacing){var st=SerifStyle(size,bold);float w=0;foreach(char ch in s)w+=st.CalcSize(new GUIContent(ch.ToString())).x+spacing;return w;}
        void Serif(Rect r,string s,int size,Color c,bool bold=false,float spacing=0,TextAnchor anchor=TextAnchor.MiddleLeft,bool shadow=false){
            var st=SerifStyle(size,bold);float total=SerifWidth(s,size,bold,spacing),x=r.x;
            if(anchor==TextAnchor.MiddleCenter||anchor==TextAnchor.UpperCenter)x=r.x+(r.width-total)/2f;else if(anchor==TextAnchor.MiddleRight)x=r.xMax-total;
            for(int pass=shadow?0:1;pass<2;pass++){
                float px=x;st.normal.textColor=pass==0?new Color(0,0,0,.8f):c;float oy=pass==0?1.5f:0;
                if(spacing==0){NativeSilverHellUi.Label(new Rect(px,r.y+oy,r.width+total,r.height),s,st);continue;}
                foreach(char ch in s){var g=ch.ToString();NativeSilverHellUi.Label(new Rect(px,r.y+oy,40,r.height),g,st);px+=st.CalcSize(new GUIContent(g)).x+spacing;}
            }
        }

        // ---- circle helpers (antialiased 128px masks) ----
        Texture2D DiscTexture(int ringPermille){
            string key="disc"+ringPermille;if(procedural.TryGetValue(key,out var t))return t;
            const int n=128;t=new Texture2D(n,n,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};
            var px=new Color[n*n];float inner=ringPermille<=0?-1:(1f-ringPermille/1000f);
            for(int y=0;y<n;y++)for(int x=0;x<n;x++){
                float d=Mathf.Sqrt((x+.5f-n/2f)*(x+.5f-n/2f)+(y+.5f-n/2f)*(y+.5f-n/2f))/(n/2f);
                float a=Mathf.Clamp01((1f-d)*n/2f+.5f);if(inner>0)a*=Mathf.Clamp01((d-inner)*n/2f+.5f);
                px[y*n+x]=new Color(1,1,1,a);
            }
            t.SetPixels(px);t.Apply(false,true);procedural[key]=t;return t;
        }
        void Disc(Vector2 c,float r,Color col){var old=GUI.color;GUI.color=col;GUI.DrawTexture(new Rect(c.x-r,c.y-r,r*2,r*2),DiscTexture(0));GUI.color=old;}
        void Ring(Vector2 c,float r,float thickness,Color col){var old=GUI.color;GUI.color=col;GUI.DrawTexture(new Rect(c.x-r,c.y-r,r*2,r*2),DiscTexture(Mathf.Clamp(Mathf.RoundToInt(thickness/r*1000f),1,1000)));GUI.color=old;}

        // CSS "at X% Y%" radial-gradient(ellipse, color, transparent stop) on a box, drawn clipped to it.
        void BoxGlow(Rect box,float px,float py,float stop,Color c){
            float dx=Mathf.Max(px,1f-px)*box.width,dy=Mathf.Max(py,1f-py)*box.height;
            NativeUiAudit.BeginGroup(box);Glow(px*box.width,py*box.height,dx*1.41421356f*stop,dy*1.41421356f*stop,c);NativeUiAudit.EndGroup();
        }
        void InsetRing(Rect r,float w,Color c){
            Fill(new Rect(r.x,r.y,r.width,w),c);Fill(new Rect(r.x,r.yMax-w,r.width,w),c);Fill(new Rect(r.x,r.y+w,w,r.height-2*w),c);Fill(new Rect(r.xMax-w,r.y+w,w,r.height-2*w),c);
        }

        // ---- page ----
        void DrawOssuaryPage(int level,CombatPower power){
            DrawOssBagColumn();
            DrawOssAltar();
            DrawOssAncestor();
        }

        void DrawOssBagColumn(){
            var pane=new Rect(549,183,422,856);
            IronTile(pane,iron480,480);Grad(pane,C(12,11,13,.867f),C(16,16,18,.91f));Rail(pane,6,41);
            var head=new Rect(565,197,390,41);
            IronTile(head,iron320,320);Grad(head,C(25,22,25,.30f),C(17,16,21,.45f));
            Fill(new Rect(head.x,head.y,head.width,1),C(87,90,90));Fill(new Rect(head.x,head.yMax-1,head.width,1),C(87,90,90));
            // Ossuary-category items only (bone parts are not collected yet): 0 / 300.
            float x=573;string count=State.Bag.FindAll(i=>i.slot=="ossuary").Count.ToString();   // ossuary-category items in the bag (Unity admits none)
            Txt(new Rect(x,204,300,23),"가방 (",14,C(216,213,207),500);x+=TextWidth("가방 (",14,500);
            Serif(new Rect(x,204,300,23),count,14,C(240,223,189),true);x+=SerifWidth(count,14,true,0);
            Txt(new Rect(x,204,300,23),"/",14,C(216,213,207),500);x+=TextWidth("/",14,500);
            Serif(new Rect(x,204,300,23),InventoryState.BagMax.ToString(),14,C(156,159,159),false);x+=SerifWidth("300",14,false,0);
            Txt(new Rect(x,204,300,23),")",14,C(216,213,207),500);
            var sort=new Rect(836,201,66,28);
            PlateFace(sort,false);
            Txt(sort,"↕ 정렬",12,C(194,191,185),500,TextAnchor.MiddleCenter,true);
            Fill(new Rect(906,207,1,17),C(98,101,101,.4f));
            Serif(new Rect(915,207,30,17),"최대",11,C(169,172,172),false);
            var filter=new Rect(565,246,390,32);
            Grad(filter,C(50,53,53,.314f),C(20,17,21,.533f),90);Border(filter,C(69,72,72));
            var chev=C(150,153,153);Line(new Vector2(578,257),new Vector2(583,262),1.4f,chev);Line(new Vector2(583,262),new Vector2(578,267),1.4f,chev);
            Txt(new Rect(591,246,300,32),"아이템 필터",12,C(185,182,176),400);
            DrawOssGrid();
            DrawOssInfo();
        }

        void DrawOssGrid(){
            const float cell=37f,gx=569,gy=290,gw=382,gh=361;int rows=InventoryState.Rows;float total=rows*cell;
            var viewport=new Rect(gx,gy,gw,gh);Fill(viewport,C(8,9,10));
            ossScroll=NativeUiAudit.BeginScrollView(viewport,ossScroll,new Rect(0,0,cell*10,total),false,false,GUIStyle.none,GUIStyle.none);
            int first=Mathf.Max(0,(int)(ossScroll.y/cell)),last=Mathf.Min(rows,first+Mathf.CeilToInt(gh/cell)+1);
            var a=C(39,36,37,.565f);var b=C(18,17,20,.85f);
            for(int y=first;y<last;y++)for(int x=0;x<10;x++){
                var r=new Rect(x*cell,y*cell,cell,cell);
                IronTile(r,iron320,240);Grad(r,a,b,145);Border(r,C(56,54,56));DiamondOutline(r.center,9f,C(139,142,142,.125f));
            }
            NativeUiAudit.EndScrollView();
            float maxScroll=total-gh;
            var track=new Rect(gx+gw-11,gy,10,gh);
            float inner=gh-24f,thumbH=Mathf.Max(20f,inner*gh/total),travel=inner-thumbH;
            float thumbY=track.y+12+travel*Mathf.Clamp01(ossScroll.y/maxScroll);var thumbCol=C(110,113,113);
            Fill(track,C(18,17,19));
            Fill(new Rect(track.x+2,thumbY+1.5f,6,thumbH-3),thumbCol);Fill(new Rect(track.x+3,thumbY,4,thumbH),thumbCol);
            float[] aw={2,4,4,6};
            for(int k=0;k<aw.Length;k++){
                Fill(new Rect(track.x+5-aw[k]/2f,track.y+2+k,aw[k],1),thumbCol);
                Fill(new Rect(track.x+5-aw[aw.Length-1-k]/2f,track.yMax-6+k,aw[aw.Length-1-k],1),thumbCol);
            }
            var ev=Event.current;
            if(ev.type==EventType.MouseDown&&ev.button==0&&track.Contains(ev.mousePosition)){scrollDrag=true;ev.Use();}
            if(scrollDrag&&(ev.type==EventType.MouseDown||ev.type==EventType.MouseDrag)){
                float t=Mathf.Clamp01((ev.mousePosition.y-track.y-12-thumbH/2)/Mathf.Max(1f,travel));ossScroll.y=t*maxScroll;ev.Use();
            }
            if(ev.type==EventType.MouseUp)scrollDrag=false;
        }

        // #invOssInfo placeholder (no bone or ossuary item hovered).
        void DrawOssInfo(){
            var box=new Rect(565,661,390,363);
            IronTile(box,iron480,480);Grad(box,C(23,32,38,.93f),C(11,16,20,.96f),145);
            BoxGlow(box,.22f,.6f,.48f,C(65,68,68,.15f));
            InsetRing(new Rect(box.x+1,box.y+1,box.width-2,box.height-2),3,C(9,13,15));
            Border(box,C(105,108,108));
            var c=new Vector2(614,842);
            Disc(c,33,C(115,118,118,.07f));
            Glow(c.x,c.y,28,28,C(94,97,97,.13f));
            Ring(c,28,1,C(115,118,118,.333f));
            DiamondOutline(c,10f,C(142,145,145));DiamondOutline(c,9.2f,C(142,145,145,.6f));
            Serif(new Rect(662,820,200,21),"유골함 정보",15,C(212,209,203),true,.9f);
            Serif(new Rect(662,846,300,17),"아이템 또는 유골에 마우스를 올려 정보를 확인하세요",11,C(164,167,167));
        }

        void DrawOssAltar(){
            var pane=new Rect(981,183,498,856);
            IronTile(pane,iron480,480);Grad(pane,C(12,14,16,.72f),C(12,13,15,.918f));
            BoxGlow(pane,.5f,.42f,.7f,C(53,56,56,.27f));
            Rail(pane,6,41);
            // head
            Serif(new Rect(999,204,300,21),"선대의 유골 콜렉션",14,C(211,208,202),true,.98f,TextAnchor.MiddleLeft,true);
            var chip=new Rect(1394,201,67,27);
            Fill(chip,C(9,11,14,.5f));Border(chip,C(89,92,92,.44f));Fill(new Rect(chip.x+1,chip.y+1,chip.width-2,2),C(0,0,0,.35f));
            Serif(chip,"수집 미이식",11,C(186,183,177),true,0,TextAnchor.MiddleCenter);
            Fill(new Rect(999,236,462,1),C(96,99,99,.44f));
            // ritual ring + centre + four bone nodes (everything uncollected)
            GUI.DrawTexture(new Rect(990,316,480,480),ossRing);
            GUI.DrawTexture(new Rect(1120,431.5f,220,250),ossCenter);
            GUI.DrawTexture(new Rect(1191-20,512-20,ossUrn.width,ossUrn.height),ossUrn);
            var lab=new Rect(1189,593,81,30);
            Grad(new Rect(lab.x,lab.y,lab.width*.18f,lab.height),C(0,0,0,0),C(11,13,15,.93f),90);Fill(new Rect(lab.x+lab.width*.18f,lab.y,lab.width*.64f,lab.height),C(11,13,15,.93f));Grad(new Rect(lab.x+lab.width*.82f,lab.y,lab.width*.18f,lab.height),C(11,13,15,.93f),C(0,0,0,0),90);
            Serif(lab,"유골함",16,C(209,206,200),true,2.6f,TextAnchor.MiddleCenter,true);
            for(int i=0;i<4;i++){
                var n=boneNodes[i];
                GUI.DrawTexture(new Rect(n.x-100,n.y-100,200,200),ossNode);
                GUI.DrawTexture(boneImageRects[i],ossBone[i]);
                Serif(boneNameRects[i],bonePartNames[i],15,C(210,207,201),true,.89f,TextAnchor.MiddleCenter,true);
                Txt(boneGradeRects[i],"미이식",15,C(138,141,141),600,TextAnchor.MiddleCenter,true);
            }
            // footer
            var foot=new Rect(999,876,462,38);
            Grad(new Rect(foot.x,foot.y,foot.width/2f,foot.height),C(113,116,116,0),C(113,116,116,.1f),90);Grad(new Rect(foot.center.x,foot.y,foot.width/2f,foot.height),C(113,116,116,.1f),C(113,116,116,0),90);
            Fill(new Rect(foot.x,foot.y,foot.width,1),C(96,99,99,.44f));
            Serif(new Rect(1154,885,100,23),"철갑 전대",15,C(210,207,201),true,1.5f,TextAnchor.MiddleLeft,true);
            var state=new Rect(1237,885,69,23);
            Fill(state,C(11,13,15,.6f));Border(state,C(96,99,99,.4f));
            Serif(state,"미이식",10,C(157,160,160),false,0,TextAnchor.MiddleCenter);
            var detail=new Rect(999,918,462,42);
            Fill(detail,C(8,10,11,.61f));Border(detail,C(96,99,99,.25f));
            Txt(detail,"부위를 선택하면 등급과 성장 효과를 확인할 수 있습니다.",11,C(183,180,174),400,TextAnchor.MiddleCenter);
            Txt(new Rect(999,968,462,15),"유골 우클릭 또는 선택 후 해제 · 해제한 유골은 가방으로 이동",10,C(136,139,139),400,TextAnchor.MiddleCenter);
            // Web buttons; withdraw is disabled (nothing selected), unequip/re-equip is not ported -> draws like the web, does nothing.
            OssButton(new Rect(1142,993,91,30),"선택 유골 해제",.48f);
            OssButton(new Rect(1241,993,77,30),"유골함 해제",1f);
        }

        void OssButton(Rect r,string label,float alpha){
            Fill(r,C(19,22,22,alpha));Border(r,C(96,99,99,alpha));
            Serif(r,label,11,C(209,206,200,alpha),false,0,TextAnchor.MiddleCenter);
        }

        void DrawOssAncestor(){
            var pane=new Rect(1489,183,388,679);
            IronTile(pane,iron480,480);Grad(pane,C(20,22,25,.91f),C(9,11,13,.92f));
            BoxGlow(pane,.5f,.3f,.68f,C(70,73,73,.294f));
            InsetRing(new Rect(pane.x+1,pane.y+1,pane.width-2,pane.height-2),5,C(9,11,12,.5f));
            Fill(new Rect(pane.x+1,pane.y+1,pane.width-2,1),C(185,182,176,.14f));
            Border(pane,C(83,86,86));
            Serif(new Rect(1504,196,200,21),"소환 전대",14,C(211,208,202),true,1.4f,TextAnchor.MiddleLeft,true);
            Serif(new Rect(1792,199,70,15),"1 / 1",10,C(138,141,141),true,1.8f,TextAnchor.MiddleRight);
            Fill(new Rect(1502,225,362,1),C(96,99,99,.44f));
            var stage=new Rect(1502,226,362,481);
            BoxGlow(stage,.5f,.66f,.6f,C(81,84,84,.23f));
            GUI.DrawTexture(new Rect(1503,227,360,479),ossPortrait,ScaleMode.StretchToFill,false);
            Border(stage,C(115,118,118,.25f));
            var shade=new Rect(stage.x+stage.width*.1f,stage.yMax-4-stage.height*.22f,stage.width*.8f,stage.height*.22f);
            Grad(shade,C(11,13,14,0),C(11,13,14,1));
            var frame=new Rect(stage.x+8,stage.y+11,stage.width-16,stage.height-18);
            InsetRing(frame,4,C(9,11,11,.61f));Border(frame,C(115,118,118,.25f));
            // caption
            var cap=new Rect(1502,707,362,84);
            Grad(cap,C(104,107,107,.09f),C(0,0,0,0),90);Fill(new Rect(cap.x,cap.y,cap.width,1),C(96,99,99,.44f));
            Serif(new Rect(1507,719,200,13),"ANCESTOR · 01",9,C(156,159,159),true,1.8f);
            Serif(new Rect(1507,733,300,29),"철갑 전대",22,C(240,215,173),true,1.76f,TextAnchor.MiddleLeft,true);
            Serif(new Rect(1507,764,200,17),"미이식",11,C(156,159,159));
            Serif(new Rect(1507,799,200,15),"유골 수집",11,C(173,176,176));
            Serif(new Rect(1762,799,97,15),"미이식",11,C(215,212,206),true,0,TextAnchor.MiddleRight);
            var track=new Rect(1507,820,352,4);
            Fill(track,C(6,8,8));InsetRing(track,1,C(86,89,89,.376f));
            Txt(new Rect(1507,834,352,15),"네 부위를 모으면 전대 소환이 해금됩니다.",10,C(140,143,143),400);
        }
    }
}
