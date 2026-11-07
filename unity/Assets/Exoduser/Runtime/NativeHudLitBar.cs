using UnityEngine;

namespace Exoduser.UnityPort
{
    // 11-08 HUD 재제작: 은빛 강철 스킬바(지옥문 봉인 문턱)를 매 프레임 조명 합성해 그린다.
    // 맵은 unity/Tools/hud/hud_bake.py(Blender 부조)에서 구운 albedo·normal·pbr 세 장. 셰이더 HudLitFrame.
    // 빛: 달빛 키(9초 주기로 천천히 흔들림) + 저체력 붉은 사건 빛(왼쪽 구슬 쪽) + 스킬 사용 칸 섬광(점광원 0.35초).
    public sealed partial class NativeHud
    {
        Material litMaterial;RenderTexture litBar;Texture2D barAlbedo,barNormal,barPbr,socketDisc,socketRing;
        readonly float[] lastCooldown=new float[13];float flashStart=-10,flashU=.5f;
        Font keyFont;

        void EnsureLitBar()
        {
            if(litMaterial!=null)return;
            barAlbedo=Required<Texture2D>("Art/ui/hud/skillbar_albedo");barNormal=Required<Texture2D>("Art/ui/hud/skillbar_normal");barPbr=Required<Texture2D>("Art/ui/hud/skillbar_pbr");
            litMaterial=new Material(Required<Shader>("Shaders/HudLitFrame")){name="HUD lit slot bar"};
            litMaterial.SetTexture("_NormalTex",barNormal);litMaterial.SetTexture("_PbrTex",barPbr);
            litMaterial.SetFloat("_Aspect",(float)barAlbedo.width/barAlbedo.height);
            litBar=new RenderTexture(barAlbedo.width,barAlbedo.height,0,RenderTextureFormat.ARGB32){name="HUD lit slot bar",filterMode=FilterMode.Bilinear,wrapMode=TextureWrapMode.Clamp};litBar.Create();
            keyFont=Resources.Load<Font>("Art/fonts/Cinzel-600")??numberFont;
            socketDisc=NativeSilverHellUi.Effect(128,128,(u,v)=>{float r=Vector2.Distance(new Vector2(u,v),new Vector2(.5f,.5f));return new Color(1,1,1,Mathf.Clamp01((.5f-r)*128));});
            socketRing=NativeSilverHellUi.Effect(128,128,(u,v)=>{float r=Vector2.Distance(new Vector2(u,v),new Vector2(.5f,.5f));float a=Mathf.Clamp01((.5f-r)*128)*Mathf.Clamp01((r-.455f)*128);return new Color(1,1,1,a);});
        }

        // HP 빈 비율(_HpTranslate, 0 = 가득)이 .6을 넘으면 붉은 빛이 왼쪽 아래에서 맥박친다.
        public static float DangerLight(float hpEmpty){return Mathf.Clamp01((hpEmpty-.6f)/.3f);}

        void RenderLitBar()
        {
            if(Event.current==null||Event.current.type!=EventType.Repaint)return;
            EnsureLitBar();
            float t=Time.unscaledTime;
            float sway=Mathf.Sin(t*2*Mathf.PI/9f);
            litMaterial.SetVector("_KeyDir",new Vector4(-.5f+.22f*sway,.6f,.62f,0));
            float danger=DangerLight(hpLevel.Value),pulse=.6f+.4f*Mathf.Sin(t*2*Mathf.PI*.8f);
            litMaterial.SetColor("_EventColor",new Color(2.4f,.35f,.22f)*(danger*pulse));
            float k=Mathf.Clamp01(1-(t-flashStart)/.35f);
            litMaterial.SetVector("_PointPos",new Vector4(flashU,NativeHudDockLayout.SocketV,.11f,0));
            litMaterial.SetColor("_PointColor",new Color(3.4f,3.3f,3.1f)*(k*k));
            litMaterial.SetFloat("_EyeGlow",.22f+.1f*Mathf.Sin(t*2*Mathf.PI/4.5f)+danger*.25f*pulse);
            var old=RenderTexture.active;
            try{Graphics.Blit(barAlbedo,litBar,litMaterial,0);}finally{RenderTexture.active=old;}
        }

        void DrawLitBar(Rect canvas){RenderLitBar();if(litBar!=null)NativeUiAudit.DrawTexture(canvas,litBar,ScaleMode.StretchToFill,true);}

        void NoteCooldown(int index,float cd)
        {
            if(cd>lastCooldown[index]+1f){flashStart=Time.unscaledTime;flashU=NativeHudDockLayout.SocketU(index);}
            lastCooldown[index]=cd;
        }

        // 둥근 소켓 아래쪽부터 frac만큼 원형으로 덮는다(쿨다운·분노 채움).
        void DrawSocketFill(Rect slot,float frac,Color color)
        {
            if(frac<=0)return;var old=GUI.color;GUI.color=color;
            NativeUiAudit.DrawTextureWithTexCoords(new Rect(slot.x,slot.yMax-slot.height*frac,slot.width,slot.height*frac),socketDisc,new Rect(0,0,1,frac),true);
            GUI.color=old;
        }
        void DrawSocketRing(Rect slot,Color color){var old=GUI.color;GUI.color=color;NativeUiAudit.DrawTexture(slot,socketRing,ScaleMode.StretchToFill,true);GUI.color=old;}

        void DisposeLitBar()
        {
            if(litBar!=null){litBar.Release();Release(litBar);}
            if(litMaterial!=null)Release(litMaterial);if(socketDisc!=null)Release(socketDisc);if(socketRing!=null)Release(socketRing);
        }
    }
}
