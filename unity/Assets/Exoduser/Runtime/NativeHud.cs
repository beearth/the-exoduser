using System;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    [Serializable] public sealed class HudPixelProbe
    {
        public string name,hpText,manaText,staminaText;
        public bool cornerTransparent,hpRed,hpUpperEmpty,hpLowerRed,manaBlue,manaUpperEmpty,staminaGreen,hpEmpty,manaEmpty,staminaEmpty;
    }
    // Source artwork and resource projection, in a compact central group.
    public sealed partial class NativeHud : IDisposable
    {
        readonly Material material;
        readonly RenderTexture hp,mana,shield,eye,mobility;float mobilityDrawn=-1,mobilityCellDrawn=-1;
        readonly Texture2D hpFrame,mpFrame,icon;
        readonly Font textFont,numberFont;
        GUIStyle hpNumber,maximum,resourceNumber,resourceLabel,tooltip,keyLabel;
        HudValues values;int tick=-1,slowTick=-1;bool[] eyes=new bool[4];
        readonly Transition hpLevel=new Transition(.6f),manaLevel=new Transition(.5f),staminaLevel=new Transition(.5f);
        sealed class Transition
        {
            readonly float duration;float from,target,start;
            public Transition(float duration){this.duration=duration;}
            public bool Active {get{return from!=target&&Time.unscaledTime<start+duration;}}
            static float Bezier(float t,float p,float q){float u=1-t;return 3*u*u*t*p+3*u*t*t*q+t*t*t;}
            public float Value {
                get {float x=Mathf.Clamp01((Time.unscaledTime-start)/duration);if(x>=1)return target;float low=0,high=1;
                    for(int i=0;i<15;i++){float t=(low+high)*.5f;if(Bezier(t,.2f,.3f)<x)low=t;else high=t;}
                    return Mathf.Lerp(from,target,Bezier((low+high)*.5f,.8f,1));}
            }
            public void Set(float value,bool immediate){if(immediate){from=target=value;return;}if(value==target)return;from=Value;target=value;start=Time.unscaledTime;}
        }
        public bool IconDrawn {get;private set;}
        public string ActiveSkill {get;private set;}
        public NativeHud()
        {
            hpFrame=Required<Texture2D>("Art/ui/ui_globe_hp");mpFrame=Required<Texture2D>("Art/ui/ui_globe_mp");
            icon=Required<Texture2D>("Art/ui/skill_icons/orb/kiSlash");textFont=NativeSilverHellUi.Font()??Required<Font>("Art/fonts/NanumMyeongjo-Regular");numberFont=Required<Font>("Art/fonts/CinzelDecorative-Bold");
            material=new Material(Required<Shader>("Shaders/HudOrb"));
            hp=Target("HP liquid");mana=Target("MP ST liquid");shield=Target("Shield ring");mobility=Target("Mobility ring");eye=Target("Poise eye");
            Blit(eye,3);
        }
        static T Required<T>(string path) where T:UnityEngine.Object {var result=Resources.Load<T>(path);if(result==null)throw new InvalidOperationException("Missing original HUD resource "+path);return result;}
        static RenderTexture Target(string name){var rt=new RenderTexture(256,256,0,RenderTextureFormat.ARGB32){name=name,filterMode=FilterMode.Bilinear,wrapMode=TextureWrapMode.Clamp};rt.Create();return rt;}
        void Blit(RenderTexture rt,int mode)
        {
            material.SetFloat("_Mode",mode);var old=RenderTexture.active;
            try{Graphics.Blit(Texture2D.whiteTexture,rt,material,0);}finally{RenderTexture.active=old;}
        }
        public void Refresh(PlayerState player,int currentTick,bool force=false)
        {
            // Source fast HUD runs every three simulation frames (~20Hz).
            bool due=force||values==null||currentTick-tick>=3;
            if(due){
                tick=currentTick;values=HudValues.From(player);
                hpLevel.Set((float)values.HpTranslatePercent/100,force);manaLevel.Set((float)values.ManaRatio,force);staminaLevel.Set((float)values.StaminaRatio,force);
                material.SetFloat("_Shield",(float)values.ShieldRatio);material.SetFloat("_ShieldAlpha",(float)values.ShieldAlpha);Blit(shield,2);
                if(force||currentTick-slowTick>=30){slowTick=currentTick;eyes=values.PoiseEyes;}
            }
            if(due||hpLevel.Active||manaLevel.Active||staminaLevel.Active){
                material.SetFloat("_HpTranslate",hpLevel.Value);material.SetFloat("_Mana",manaLevel.Value);material.SetFloat("_Stamina",staminaLevel.Value);
                Blit(hp,0);Blit(mana,1);
            }
        }
        static void Text(Rect rect,string text,GUIStyle style,Color color)
        {
            var old=GUI.color;GUI.color=Color.black;NativeSilverHellUi.Label(new Rect(rect.x+1,rect.y+2,rect.width,rect.height),text,style);GUI.color=color;NativeSilverHellUi.Label(rect,text,style);GUI.color=old;
        }
        void Styles()
        {
            if(hpNumber!=null)return;
            hpNumber=new GUIStyle(GUI.skin.label){font=numberFont,fontSize=24,alignment=TextAnchor.MiddleCenter};hpNumber.normal.textColor=Color.white;
            maximum=new GUIStyle(hpNumber){fontSize=18};resourceNumber=new GUIStyle(hpNumber){fontSize=17};resourceLabel=new GUIStyle(hpNumber){fontSize=14};
            EnsureLitBar();
            keyLabel=new GUIStyle(GUI.skin.label){font=keyFont,fontStyle=FontStyle.Normal,fontSize=13,alignment=TextAnchor.MiddleCenter,wordWrap=false,clipping=TextClipping.Clip,padding=new RectOffset(),margin=new RectOffset(),contentOffset=Vector2.zero};keyLabel.normal.textColor=new Color(167/255f,164/255f,157/255f);   // --tx-2
            tooltip=new GUIStyle(GUI.skin.box){font=textFont,fontSize=20,alignment=TextAnchor.MiddleCenter};tooltip.normal.textColor=new Color(219/255f,216/255f,210/255f);
        }
        public bool FeelHurtActive;Texture2D feelHurtMark;
        void DrawFeelHurt(Rect liquid){if(!FeelHurtActive)return;if(feelHurtMark==null)feelHurtMark=NativeSilverHellUi.Effect(256,256,(u,v)=>{float r=Vector2.Distance(new Vector2(u,v),new Vector2(.5f,.5f));if(r>.5f)return Color.clear;float inward=(.5f-r)*175;return inward<3?new Color(223/255f,180/255f,156/255f,1):new Color(184/255f,48/255f,34/255f,Mathf.Clamp01(1-(inward-3)/22));});NativeUiAudit.DrawTexture(liquid,feelHurtMark,ScaleMode.StretchToFill,true);}
        public void Draw(float width,float height,string activeAttack,Simulation simulation=null)
        {
            if(values==null)return;Styles();ActiveSkill=activeAttack;float mid=width/2;

            var dock=NativeHudDockLayout.Create(width,height);
            NativeUiAudit.Region(dock.LeftFrame,"component","hud-hp-frame","HP 원화 외곽");NativeUiAudit.Region(dock.RightFrame,"component","hud-mp-frame","MP/ST 원화 외곽");NativeUiAudit.Region(dock.SlotBar,"component","hud-skills","중앙 스킬바");
            Rect slotBar=dock.SlotBar;
            // 11-08: lit silver-steel relief replaces the flat web bar art (ui_bar_only.png stays in the project, unused here).
            DrawLitBar(slotBar);
            RefreshMobility(simulation);Globe(dock.LeftLiquid,dock.LeftFrame,false);DrawFeelHurt(dock.LeftLiquid);Globe(dock.RightLiquid,dock.RightFrame,true);
            Rect lmb=dock.ActiveSlot;
            if(activeAttack=="kiSlash"){
                var insetIcon=new Rect(lmb.x+1,lmb.y+1,lmb.width-2,lmb.height-2);
                NativeUiAudit.DrawTexture(insetIcon,icon,ScaleMode.ScaleToFit,true);if(Event.current.type==EventType.Repaint)IconDrawn=true;

            }
            DrawKeyLabels(slotBar,height);
            DrawSkillSlots(dock,width,height,simulation);
            // Existing input executors own the other slots. No invented skill icons.
        }
        void DrawKeyLabels(Rect barRect,float height)
        {
            string[] keys=NativeHudDockLayout.KeyNames;
            for(int i=0;i<keys.Length;i++){
                var rect=NativeHudDockLayout.KeyLabelRect(barRect,height,i);
                var content=new Rect(rect.x+3,rect.y,rect.width-6,rect.height);
                // Keep every source key label in its shared slot without opaque keycap plates.
                float natural=keyLabel.CalcSize(new GUIContent(keys[i])).x;
                float squeeze=Mathf.Min(1,content.width/Mathf.Max(1,natural));var matrix=GUI.matrix;
                GUI.matrix=matrix*Matrix4x4.TRS(new Vector3(content.x,content.y,0),Quaternion.identity,new Vector3(squeeze,1,1));
                NativeSilverHellUi.Label(new Rect(0,0,content.width/squeeze,content.height),keys[i],keyLabel);GUI.matrix=matrix;
            }
        }
        void Globe(Rect wrap,Rect frame,bool right)
        {
            const float s=NativeHudDockLayout.ArtScale;
            NativeUiAudit.DrawTexture(wrap,right?mana:hp,ScaleMode.StretchToFill,true);
            NativeUiAudit.DrawTexture(frame,right?mpFrame:hpFrame,ScaleMode.StretchToFill,true);
            if(!right)NativeUiAudit.DrawTexture(new Rect(wrap.x+11*s,wrap.y+18.65f*s,153*s,153*s),shield,ScaleMode.StretchToFill,true);
            else if(mobilityDrawn>=0)NativeUiAudit.DrawTexture(new Rect(wrap.x+11*s,wrap.y+18.65f*s,153*s,153*s),mobility,ScaleMode.StretchToFill,true);
            int index=right?2:0;
            for(int i=0;i<2;i++)if(eyes[index+i]){
                float ex=wrap.x+(i==0?76.5f:93.5f)*s;
                NativeUiAudit.DrawTexture(new Rect(ex-4*s,wrap.y-13*s,15*s,15*s),eye,ScaleMode.StretchToFill,true);
            }
            if(!right){if(values.HpValid){Text(new Rect(wrap.x,wrap.y+62*s,wrap.width,30*s),values.HpCurrentText,hpNumber,Color.white);Text(new Rect(wrap.x,wrap.y+90*s,wrap.width,20*s),values.HpMaximumText,maximum,new Color(1,1,1,.6f));}}
            else {
                if(values.ManaValid)ResourceText(wrap,0,"MP",values.ManaCurrentText,values.ManaMaximumText,new Color(.533f,.733f,1));
                if(values.StaminaValid)ResourceText(wrap,1,"ST",values.StaminaCurrentText,values.StaminaMaximumText,new Color(.533f,.867f,.533f));
            }
        }
        // Web updateHUD: the MP globe ring shows the shared mobility gauge (_harpGauge/_HARP_GAUGE_MAX) with one notch per Shift cell (cost 45); same rect as the HP shield ring
        public static float MobilityRatio(Simulation s){return s==null||!(s.HarpGaugeMax>0)?0:(float)Math.Max(0,Math.Min(1,s.HarpGauge/s.HarpGaugeMax));}
        public static float MobilityCellTurn(Simulation s){return s==null||!(s.HarpGaugeMax>0)?.2f:(float)Math.Min(1,Exoduser.UnityPort.Core.Combat.ChainDash.GaugeCost[1]/s.HarpGaugeMax);}
        void RefreshMobility(Simulation s){
            if(s==null||Event.current==null||Event.current.type!=EventType.Repaint)return;
            float ratio=MobilityRatio(s),cell=MobilityCellTurn(s);
            if(Mathf.Abs(ratio-mobilityDrawn)<.001f&&Mathf.Abs(cell-mobilityCellDrawn)<.0001f)return;
            mobilityDrawn=ratio;mobilityCellDrawn=cell;material.SetFloat("_Mobility",ratio);material.SetFloat("_MobilityCell",cell);Blit(mobility,4);
        }
        void ResourceText(Rect wrap,int side,string name,string current,string max,Color color)
        {
            const float s=NativeHudDockLayout.ArtScale;float x=wrap.x+side*wrap.width/2,w=wrap.width/2;
            Text(new Rect(x,wrap.y+35*s,w,24*s),name,resourceLabel,color);Text(new Rect(x,wrap.y+60*s,w,28*s),current,resourceNumber,Color.white);Text(new Rect(x,wrap.y+89*s,w,24*s),max,resourceLabel,new Color(1,1,1,.5f));
        }
        static Texture2D Pixels(RenderTexture rt)
        {
            var old=RenderTexture.active;var copy=new Texture2D(256,256,TextureFormat.RGBA32,false);
            try{RenderTexture.active=rt;copy.ReadPixels(new Rect(0,0,256,256),0,0);copy.Apply();}finally{RenderTexture.active=old;}return copy;
        }
        static Color ProbeColor(Texture2D image,int x,int y)
        {
            var c=image.GetPixel(x,y);
            // SourceHudOrb는 웹 sRGB 상수를 출력 직전에 선형화한다. ReadPixels의 sRGB 값을 웹 값과 직접 비교한다.
            return c;
        }
        public bool VerifySourceColor(out string detail)
        {
            var image=Pixels(hp);try{
                float top=1-128.5f/256,r=Vector2.Distance(new Vector2((128.5f/256-.5f)*.70710678f,(top-material.GetFloat("_HpTranslate")-.4f)*1.1785113f),Vector2.zero);
                Color expected=top<material.GetFloat("_HpTranslate")?new Color(8/255f,8/255f,8/255f):r<.5f?Color.Lerp(new Color(107/255f,16/255f,32/255f),new Color(61/255f,10/255f,18/255f),r*2):Color.Lerp(new Color(61/255f,10/255f,18/255f),new Color(30/255f,5/255f,10/255f),Mathf.Clamp01((r-.5f)*2));
                var actual=image.GetPixel(128,128);float error=Mathf.Max(Mathf.Abs(actual.r-expected.r),Mathf.Abs(actual.g-expected.g),Mathf.Abs(actual.b-expected.b))*255;
                detail="HP 원본 sRGB GPU 오차 "+error.ToString("0.00")+"/255, 실제 "+ColorUtility.ToHtmlStringRGB(actual)+", 기준 "+ColorUtility.ToHtmlStringRGB(expected);return error<=3;
            }finally{Release(image);}
        }
        public HudPixelProbe Probe(string name)
        {
            var h=Pixels(hp);var m=Pixels(mana);
            try{
                Func<Color,bool> red=c=>c.r>c.g*2&&c.r>.08f;Func<Color,bool> blue=c=>c.b>c.g*1.15f&&c.b>.08f;Func<Color,bool> green=c=>c.g>c.b*1.15f&&c.g>.08f;
                Func<Color,bool> dark=c=>Mathf.Max(c.r,c.g,c.b)<.05f;
                return new HudPixelProbe{name=name,hpText=values.HpCurrentText,manaText=values.ManaCurrentText,staminaText=values.StaminaCurrentText,
                    cornerTransparent=ProbeColor(h,2,2).a<.01f&&ProbeColor(m,253,253).a<.01f,
                    hpRed=red(ProbeColor(h,128,128)),hpLowerRed=red(ProbeColor(h,128,80)),hpUpperEmpty=dark(ProbeColor(h,128,180)),
                    manaBlue=blue(ProbeColor(m,80,128)),manaUpperEmpty=dark(ProbeColor(m,80,180)),staminaGreen=green(ProbeColor(m,180,128)),
                    hpEmpty=dark(ProbeColor(h,128,128)),manaEmpty=dark(ProbeColor(m,80,128)),staminaEmpty=dark(ProbeColor(m,180,128))};
            }finally{Release(h);Release(m);}
        }
        static void Release(UnityEngine.Object value){if(Application.isPlaying)UnityEngine.Object.Destroy(value);else UnityEngine.Object.DestroyImmediate(value);}
        public void Dispose(){if(feelHurtMark!=null)Release(feelHurtMark);foreach(var rt in new[]{hp,mana,shield,eye,mobility}){rt.Release();Release(rt);}DisposeLitBar();Release(material);}
    }
}
