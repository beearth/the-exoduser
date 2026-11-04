using System;
using System.Globalization;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // 사망 대기 화면 (Unity 전용 디자인, 2026-11-03 사망 화면 브리프 G1).
    // 정보·흐름·판정은 Core 그대로다: 부활력 = FallenReviveChance, 남은 초 = StateTicks(300 -> 0), 부활 불가 = !FallenCanRevive, 결과 = Simulation.TickFallen.
    // 여기서는 연출만 바꾼다. 레퍼런스 공통점(Diablo IV·PoE2·No Rest for the Wicked·Elden Ring 사망 화면): 화면 끝까지 채도와 밝기가 빠지고
    // 비네트가 진해진다, 가운데 큰 명조 제목 한 줄과 짧은 부제, 부활 정보는 작고 정돈된 보조 정보, 단색 빨간 판 없음.
    //  ① 0~0.4s  충격 정지 구간: 시뮬레이션은 멈추지 않는다(흐름 불변). 화면에서는 비네트만 먼저 조여 든다.
    //  ② 0.4~1.6s 물리 화면 전체(16:9 밖 슈퍼와이드 좌우 포함) 채도 0.15(URP Volume)·명도 0.55(IMGUI 합성)·검정 URP 비네트.
    //  ③ 명조 큰 제목 + 양옆 금빛 헤어라인.  ④ 뼈색 부활력·남은 초 + 얇은 원형 게이지.  ⑤ 부활 불가: 부제·문구와 다음 행동(재도전·로비) 안내.
    //  ⑥ 부활 순간 0.5s에 걸쳐 필터를 걷는다.  사망 확정(dead) 뒤에는 필터를 유지한 채 글자만 빼고 사망 패널(NativeDeathOverlay)이 그 위로 들어온다.
    public sealed partial class NativeReviveHud
    {
        const float ImpactHold=.4f,FilterRamp=1.2f,ReviveFade=.5f,DeadTextFade=.35f,TitleDelay=.5f,TitleFade=1f,InfoDelay=1f,InfoFade=.8f;
        const float TargetSaturation=.15f,TargetBrightness=.55f;
        const float RingDiameter=92f;
        // 2026-11-05 사용자 결정: 사망 화면은 "안식은 없다" 하나만 보인다. 쓰러짐 대기의 판정(Core)과 감광은 그대로 두고 글자·게이지만 끈다.
        const bool ShowFallenTexts=false;
        public string LocaleCode="ko";
        // 캡처 고정 시각: ForcedAge = 쓰러진 뒤 경과 초, ForcedReviveAge = 부활 페이드 경과 초.
        public float? ForcedAge,ForcedReviveAge;
        enum Phase{None,Fallen,Dead,Reviving}
        Phase phase;float downStart,deadStart,reviveStart,filterFrom,vignetteFrom,textFrom;
        float lastTicks;bool lastCanRevive;double lastChance;
        public string ScreenPhase{get{return phase.ToString();}}
        public float FilterAmount{get{return Filter(Time.unscaledTime);}}
        public float VolumeWeight{get{return deathVolume!=null&&deathVolume.enabled?deathVolume.weight:0;}}
        public bool CombatTextSuppressed{get{return phase!=Phase.None;}}

        [Serializable] sealed class DeathLabel{public string code,title,waiting,cannotSub,power,cannot,next;}
        [Serializable] sealed class DeathLabels{public DeathLabel[] entries;}
        static DeathLabels deathLabels;
        static DeathLabels AllDeathLabels(){
            if(deathLabels==null){var asset=Resources.Load<TextAsset>("Data/death_screen_labels");deathLabels=asset!=null?JsonUtility.FromJson<DeathLabels>(asset.text):null;if(deathLabels==null||deathLabels.entries==null)deathLabels=new DeathLabels{entries=new DeathLabel[0]};}
            return deathLabels;
        }
        // IMGUI는 아랍 문자 연결·RTL을 못 하므로 화면에는 en을 그린다(NativeOptionText·NativeStageClearOverlay와 같은 규칙). 표에는 ar도 들어 있다.
        static DeathLabel DeathLabelFor(string locale){
            string code=LobbyLanguage.Normalize(locale);if(code=="ar")code="en";DeathLabel en=null;
            foreach(var e in AllDeathLabels().entries){if(e.code==code)return e;if(e.code=="en")en=e;}
            return en??new DeathLabel{code="ko",title="죽음",waiting="부활을 기다린다",cannotSub="이번에는 일어설 수 없다",power="부활력",cannot="부활 불가",next="잠시 후 재도전 또는 로비"};
        }
        public static int DeathLabelCount{get{return AllDeathLabels().entries.Length;}}
        public static bool DeathLabelComplete(string code){foreach(var e in AllDeathLabels().entries)if(e.code==code)return !(string.IsNullOrEmpty(e.title)||string.IsNullOrEmpty(e.waiting)||string.IsNullOrEmpty(e.cannotSub)||string.IsNullOrEmpty(e.power)||string.IsNullOrEmpty(e.cannot)||string.IsNullOrEmpty(e.next));return false;}

        // ---- 상태: NativeGame.Update에서 매 프레임 호출. p=null이면 게임 밖(로비 등). ----
        public void TickScreen(PlayerState p,bool down,Transform host)
        {
            float now=Time.unscaledTime;bool fallen=p!=null&&p.State=="fallen",dead=p!=null&&!fallen&&down;
            if(fallen||dead)
            {
                if(phase==Phase.None||phase==Phase.Reviving){downStart=now;phase=Phase.Fallen;textFrom=0;}
                if(dead){if(phase!=Phase.Dead){textFrom=TextAlpha(now);phase=Phase.Dead;deadStart=now;}}
                else phase=Phase.Fallen;
                if(fallen){lastTicks=p.StateTicks;lastCanRevive=p.FallenCanRevive;lastChance=p.FallenReviveChance;}
            }
            else if(phase==Phase.Fallen||phase==Phase.Dead){filterFrom=Filter(now);vignetteFrom=VignetteAmount(now);textFrom=TextAlpha(now);phase=Phase.Reviving;reviveStart=now;}
            else if(phase==Phase.Reviving&&!ForcedReviveAge.HasValue&&now-reviveStart>=ReviveFade)phase=Phase.None;
            if(CombatTextSuppressed)floaters.Clear();
            ApplyVolume(host,Filter(now),VignetteAmount(now));
        }
        float Age(float now){return ForcedAge??(now-downStart);}
        float ReviveT(float now){return Mathf.Clamp01((ForcedReviveAge??(now-reviveStart))/ReviveFade);}
        static float Smooth(float x){x=Mathf.Clamp01(x);return x*x*(3-2*x);}
        static float EaseOut(float x){x=Mathf.Clamp01(x);float i=1-x;return 1-i*i*i;}
        float Filter(float now)
        {
            switch(phase){
                case Phase.Fallen:case Phase.Dead:return Smooth((Age(now)-ImpactHold)/FilterRamp);
                case Phase.Reviving:return filterFrom*(1-Smooth(ReviveT(now)));
                default:return 0;
            }
        }
        float VignetteAmount(float now)
        {
            switch(phase){
                case Phase.Fallen:case Phase.Dead:{float a=Age(now);return a<ImpactHold?.6f*EaseOut(a/ImpactHold):.6f+.4f*Smooth((a-ImpactHold)/FilterRamp);}
                case Phase.Reviving:return vignetteFrom*(1-Smooth(ReviveT(now)));
                default:return 0;
            }
        }
        float TextAlpha(float now)
        {
            switch(phase){
                case Phase.Fallen:return Smooth((Age(now)-TitleDelay)/TitleFade);
                case Phase.Dead:return textFrom*(1-Smooth((now-deadStart)/DeadTextFade));
                case Phase.Reviving:return textFrom*(1-Smooth(ReviveT(now)));
                default:return 0;
            }
        }
        float InfoAlpha(float now){return phase==Phase.Fallen?Mathf.Min(TextAlpha(now),Smooth((Age(now)-InfoDelay)/InfoFade)):TextAlpha(now);}

        // 채도는 카메라 후처리에서만 뺄 수 있다. 우선순위 높은 전역 Volume 하나를 가중치로 섞는다(맵 Volume 값 위에 lerp).
        Volume deathVolume;
        ColorAdjustments deathTone;Vignette deathCameraVignette;
        void ApplyVolume(Transform host,float f,float vignette)
        {
            float weight=Mathf.Max(f,vignette);
            if(weight<=.0005f){if(deathVolume!=null&&deathVolume.enabled){deathVolume.weight=0;deathVolume.enabled=false;}return;}
            if(deathVolume==null)
            {
                if(host==null)return;
                var go=new GameObject("사망 채도 필터");go.transform.SetParent(host,false);
                var profile=ScriptableObject.CreateInstance<VolumeProfile>();profile.name="사망 채도 필터";
                deathTone=profile.Add<ColorAdjustments>(false);
                deathCameraVignette=profile.Add<Vignette>(false);
                // Camera-space analytic vignette. Pure black cannot add red saturation at the edges.
                deathCameraVignette.color.Override(Color.black);deathCameraVignette.center.Override(new Vector2(.5f,.5f));
                deathCameraVignette.smoothness.Override(.85f);deathCameraVignette.rounded.Override(false);
                deathVolume=go.AddComponent<Volume>();deathVolume.isGlobal=true;deathVolume.priority=1000;deathVolume.sharedProfile=profile;
            }
            deathTone.saturation.Override((TargetSaturation-1f)*100f*f/weight);
            deathCameraVignette.intensity.Override(.48f*vignette/weight);
            deathVolume.enabled=true;deathVolume.weight=weight;
        }

        // ---- 그리기: OnGUI에서 HUD 위, 사망 패널·일시정지 메뉴 아래 ----
        public void DrawDeathScreen(PlayerState p)
        {
            if(phase==Phase.None||Event.current==null||Event.current.type!=EventType.Repaint)return;
            float now=Time.unscaledTime,f=Filter(now),t=TextAlpha(now),info=InfoAlpha(now);
            var oldMatrix=GUI.matrix;var oldColor=GUI.color;
            try
            {
                GUI.matrix=Matrix4x4.identity;
                var screen=new Rect(0,0,Screen.width,Screen.height);
                if(f>0)
                {
                    // CSS brightness(0.55)는 sRGB 값에 곱한다. Linear 프로젝트의 IMGUI 합성은 선형이므로 같은 결과가 되도록 알파를 환산한다.
                    float keep=Mathf.Lerp(1,TargetBrightness,f),a=QualitySettings.activeColorSpace==ColorSpace.Linear?1-Mathf.Pow(keep,2.2f):1-keep;
                    GUI.color=new Color(0,0,0,a);NativeUiAudit.DrawTexture(screen,Texture2D.whiteTexture);
                }
                NativeUiAudit.Region(screen,"component","death-filter","물리 화면 전체 명도 0.55; 채도 0.15·검정 비네트 = URP Volume");
                if(t<=.002f)return;
                // No IMGUI colour band after the full-frame camera desaturation.
                GUI.color=Color.white;GUI.matrix=NativeUiViewport.Matrix;
                if(ShowFallenTexts)DrawDeathTexts(now,t,info);
            }
            finally{GUI.matrix=oldMatrix;GUI.color=oldColor;}
        }

        Font deathLight,deathBody,deathLatin;GUIStyle deathStyle;
        static readonly Color Bone=new Color(223/255f,214/255f,194/255f),BoneDim=new Color(196/255f,186/255f,166/255f),Gold=new Color(189/255f,169/255f,122/255f),Ember=new Color(212/255f,146/255f,124/255f);
        void EnsureDeathFonts()
        {
            if(deathBody!=null)return;
            deathLight=NativeSilverHellUi.Font();deathBody=NativeSilverHellUi.Font(true);
            deathLatin=Resources.Load<Font>("Art/fonts/Cinzel-400")??Resources.Load<Font>("Art/fonts/Cinzel-VariableFont_wght");
        }
        GUIStyle DeathStyle(Font f,int size)
        {
            if(deathStyle==null)deathStyle=new GUIStyle(GUI.skin.label){alignment=TextAnchor.MiddleLeft,wordWrap=false,clipping=TextClipping.Overflow,padding=new RectOffset(),margin=new RectOffset(),contentOffset=Vector2.zero};
            deathStyle.font=f;deathStyle.fontSize=size;deathStyle.fontStyle=FontStyle.Normal;
            deathStyle.normal.background=null;deathStyle.hover.background=null;
            return deathStyle;
        }
        static bool Cjk(string s){foreach(char c in s)if(c>=0x3040&&c<=0x30ff||c>=0x3400&&c<=0x9fff||c>=0xac00&&c<=0xd7a3)return true;return false;}
        float SpacedWidth(string text,Font f,int size,float spacing)
        {
            var st=DeathStyle(f,size);float w=0;int n=0;var it=StringInfo.GetTextElementEnumerator(text);
            while(it.MoveNext()){w+=st.CalcSize(new GUIContent(it.GetTextElement())).x;n++;}
            return w+Mathf.Max(0,n-1)*spacing;
        }
        // 가운데 정렬 글자. spacing>0이면 글자 단위로 자간을 준다. 그림자는 바로 아래로 떨어지는 어두운 번짐(외곽선 없음).
        float CenteredText(float cx,float cy,string text,Font f,int size,float spacing,Color c,float shadow)
        {
            var st=DeathStyle(f,size);float h=size*1.6f,y=cy-h/2;
            if(spacing<=0){float w=st.CalcSize(new GUIContent(text)).x;Glyph(new Rect(cx-w/2,y,w+6,h),text,st,c,shadow);return w;}
            float total=SpacedWidth(text,f,size,spacing),x=cx-total/2;var it=StringInfo.GetTextElementEnumerator(text);
            while(it.MoveNext()){string g=it.GetTextElement();float gw=st.CalcSize(new GUIContent(g)).x;if(g!=" ")Glyph(new Rect(x,y,gw+6,h),g,st,c,shadow);x+=gw+spacing;}
            return total;
        }
        static readonly Vector2[] ShadowOffsets={new Vector2(0,2),new Vector2(-1,1),new Vector2(1,1),new Vector2(0,3)};
        void Glyph(Rect r,string g,GUIStyle st,Color c,float shadow)
        {
            using(var paint=NativeUiAudit.GroupText(r,g)){
            if(shadow>0)
            {
                bool prior=NativeUiAudit.DrawingTextShadow;string profile=NativeUiAudit.DrawingTextShadowProfile;
                try{NativeUiAudit.DrawingTextShadow=true;NativeUiAudit.DrawingTextShadowProfile="death-screen-drop";st.normal.textColor=new Color(0,0,0,shadow*c.a*.5f);foreach(var o in ShadowOffsets)NativeUiAudit.Label(new Rect(r.x+o.x,r.y+o.y,r.width,r.height),g,st);}
                finally{NativeUiAudit.DrawingTextShadow=prior;NativeUiAudit.DrawingTextShadowProfile=profile;}
            }
            st.normal.textColor=c;NativeSilverHellUi.Label(r,g,st);
            }
        }
        static Color A(Color c,float a){c.a=a;return c;}

        void DrawDeathTexts(float now,float t,float info)
        {
            EnsureDeathFonts();var L=DeathLabelFor(LocaleCode);string code=LobbyLanguage.Normalize(LocaleCode);bool thai=code=="th";
            const float cx=960,titleY=418,subY=488,ringY=598,powerY=672,nextY=706;
            // ③ 제목: 라틴 문자는 Cinzel, 그 밖은 명조(Hahmlet) → 지역 명조 대체 글꼴. 자간은 들어오며 조금 좁아진다.
            string title=L.title;bool latin=deathLatin!=null&&NativeSilverHellUi.Covers(deathLatin,title);
            Font tf=latin?deathLatin:NativeSilverHellUi.TextFont(deathBody,title);int ts=latin?62:74;
            float em=thai?0:Cjk(title)?.34f:latin?.2f:.16f,settle=1+.35f*(1-t),spacing=ts*em*settle;
            float tw=CenteredText(cx,titleY,title,tf,ts,spacing,A(Bone,.96f*t),.9f);
            NativeUiAudit.Region(new Rect(cx-tw/2,titleY-ts*.8f,tw,ts*1.6f),"component","death-title","명조 큰 제목 "+(tf!=null?tf.name:"")+" "+ts+"px");
            // 금빛 헤어라인: 제목 양옆, 안쪽이 진하고 바깥으로 사라진다. 안쪽 끝에 짧은 세로 획.
            float gap=44,len=Mathf.Clamp(560-tw*.5f,180,300);float inner=tw*.5f+gap;
            GUI.color=A(Gold,.62f*t);
            NativeUiAudit.DrawTextureWithTexCoords(new Rect(cx-inner-len,titleY,len,1),HairRamp(),new Rect(0,0,1,1),true);
            NativeUiAudit.DrawTextureWithTexCoords(new Rect(cx+inner,titleY,len,1),HairRamp(),new Rect(1,0,-1,1),true);
            GUI.color=A(Gold,.5f*t);
            NativeUiAudit.DrawTexture(new Rect(cx-inner,titleY-4,1,9),Texture2D.whiteTexture);NativeUiAudit.DrawTexture(new Rect(cx+inner-1,titleY-4,1,9),Texture2D.whiteTexture);
            GUI.color=Color.white;
            // 부제
            float subA=phase==Phase.Fallen?Mathf.Min(t,Smooth((Age(now)-.9f)/.8f)):t;
            string sub=lastCanRevive?L.waiting:L.cannotSub;Font sf=NativeSilverHellUi.TextFont(deathLight,sub);
            CenteredText(cx,subY,sub,sf,22,thai?0:22*.12f,A(BoneDim,.86f*subA),.8f);
            if(info<=.002f)return;
            // ④ 원형 게이지: 남은 시간 비율(StateTicks/300)만큼 12시부터 시계 방향 호. 가운데에 남은 초.
            float scale=NativeUiViewport.Current.Scale;float frac=Mathf.Clamp01(lastTicks/300f);int sec=Mathf.CeilToInt(Mathf.Max(0,lastTicks)/60f);
            GUI.color=new Color(0,0,0,.5f*info);NativeUiAudit.DrawTexture(new Rect(cx-90,ringY-90,180,180),SoftDisc(),ScaleMode.StretchToFill,true);
            int px=Mathf.CeilToInt(RingDiameter*scale)+6;float size=px/scale;
            GUI.color=new Color(1,1,1,info);NativeUiAudit.DrawTexture(new Rect(cx-size/2,ringY-size/2,size,size),Ring(px,RingDiameter*scale*.5f,1.25f*scale,2.4f*scale,frac,lastCanRevive),ScaleMode.StretchToFill,true);
            GUI.color=Color.white;
            string secText=sec.ToString(CultureInfo.InvariantCulture);Font nf=deathLatin!=null&&NativeSilverHellUi.Covers(deathLatin,secText)?deathLatin:deathBody;
            CenteredText(cx,ringY+1,secText,nf,34,0,A(lastCanRevive?Bone:Ember,.95f*info),.7f);
            NativeUiAudit.Region(new Rect(cx-RingDiameter/2,ringY-RingDiameter/2,RingDiameter,RingDiameter),"component","death-ring","원형 게이지 "+sec+"s "+frac.ToString("0.00",CultureInfo.InvariantCulture));
            // 부활력 / 부활 불가
            if(lastCanRevive)
            {
                string label=L.power,value=Fmt(lastChance)+"%";Font lf=NativeSilverHellUi.TextFont(deathBody,label);Font vf=deathLatin!=null&&NativeSilverHellUi.Covers(deathLatin,value)?deathLatin:deathBody;
                float ls=thai?0:19*.08f,lw=SpacedWidth(label,lf,19,ls),vw=SpacedWidth(value,vf,21,21*.04f),between=14,total=lw+between+vw,left=cx-total/2;
                CenteredText(left+lw/2,powerY,label,lf,19,ls,A(BoneDim,.92f*info),.7f);
                CenteredText(left+lw+between+vw/2,powerY,value,vf,21,21*.04f,A(Bone,.96f*info),.7f);
            }
            else
            {
                Font cf=NativeSilverHellUi.TextFont(deathBody,L.cannot);CenteredText(cx,powerY,L.cannot,cf,19,thai?0:19*.1f,A(Ember,.94f*info),.7f);
                Font nf2=NativeSilverHellUi.TextFont(deathLight,L.next);CenteredText(cx,nextY,L.next,nf2,16,0,A(new Color(168/255f,158/255f,142/255f),.84f*info),.7f);
            }
        }

        // ---- 절차 텍스처: 모두 매끈한 그라데이션(노이즈·디더 없음) ----
        Texture2D hairRamp,softDisc,ringTex;Color32[] ringPixels;int ringSize=-1,ringKey=-1;
        Texture2D HairRamp()
        {
            if(hairRamp!=null)return hairRamp;
            hairRamp=NativeSilverHellUi.Effect(128,1,(u,v)=>new Color(1,1,1,Smooth(u)));hairRamp.name="사망 헤어라인";return hairRamp;
        }
        Texture2D SoftDisc()
        {
            if(softDisc!=null)return softDisc;
            softDisc=NativeSilverHellUi.Effect(64,64,(u,v)=>{float x=(u-.5f)*2,y=(v-.5f)*2;return new Color(1,1,1,1-Smooth(Mathf.Sqrt(x*x+y*y)));});softDisc.name="사망 게이지 바탕";return softDisc;
        }
        // 물리 픽셀 크기로 다시 만드는 원형 게이지(해석적 안티에일리어싱). 진행값은 1/240 단위로 바뀔 때만 다시 굽는다.
        Texture2D Ring(int size,float radius,float trackWidth,float arcWidth,float frac,bool canRevive)
        {
            int q=Mathf.Clamp(Mathf.RoundToInt(frac*240),0,240),key=q*2+(canRevive?1:0);
            if(ringTex!=null&&ringSize==size&&ringKey==key)return ringTex;
            if(ringTex==null||ringSize!=size)
            {
                if(ringTex!=null)UnityEngine.Object.Destroy(ringTex);
                ringTex=new Texture2D(size,size,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear,name="사망 원형 게이지"};
                ringPixels=new Color32[size*size];ringSize=size;
            }
            ringKey=key;float fr=q/240f,end=fr*Mathf.PI*2,c=size*.5f,R=radius-arcWidth*.5f-1;bool full=q>=240;
            Color track=new Color(223/255f,214/255f,194/255f),arc=canRevive?new Color(218/255f,200/255f,162/255f):new Color(168/255f,62/255f,44/255f);
            const float trackA=.26f,arcA=.95f;
            for(int y=0;y<size;y++)
            {
                float sy=(size-1-y)+.5f-c;
                for(int x=0;x<size;x++)
                {
                    float sx=x+.5f-c,r=Mathf.Sqrt(sx*sx+sy*sy),d=Mathf.Abs(r-R);
                    float tc=Mathf.Clamp01(trackWidth*.5f+.5f-d)*trackA,ac=0;
                    if(q>0){float rc=Mathf.Clamp01(arcWidth*.5f+.5f-d);if(rc>0){if(full)ac=rc;else{float th=Mathf.Atan2(sx,-sy);if(th<0)th+=Mathf.PI*2;ac=rc*Mathf.Clamp01(.5f+Mathf.Min(th,end-th)*Mathf.Max(r,1));}}}
                    ac*=arcA;float a=ac+(1-ac)*tc;
                    if(a<=0){ringPixels[y*size+x]=new Color32(0,0,0,0);continue;}
                    float ta=(1-ac)*tc;var col=(arc*ac+track*ta)/a;
                    ringPixels[y*size+x]=new Color32((byte)Mathf.RoundToInt(Mathf.Clamp01(col.r)*255),(byte)Mathf.RoundToInt(Mathf.Clamp01(col.g)*255),(byte)Mathf.RoundToInt(Mathf.Clamp01(col.b)*255),(byte)Mathf.RoundToInt(Mathf.Clamp01(a)*255));
                }
            }
            ringTex.SetPixels32(ringPixels);ringTex.Apply(false,false);
            return ringTex;
        }
    }
}
