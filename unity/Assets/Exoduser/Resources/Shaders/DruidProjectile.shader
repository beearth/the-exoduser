Shader "EXODUSER/DruidProjectile"
{
    Properties { [PerRendererData] _MainTex ("공용 쿼드", 2D)="white" {} [PerRendererData] _Thorn ("물리 가시", Float)=0 [PerRendererData] _Friendly ("반사 청색탄", Float)=0 }
    SubShader
    {
        Tags { "Queue"="Transparent" "RenderType"="Transparent" "CanUseSpriteAtlas"="False" }
        Cull Off ZWrite Off Blend One OneMinusSrcAlpha
        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"
            struct input { float4 vertex:POSITION; float2 uv:TEXCOORD0; };
            struct output { float4 vertex:SV_POSITION; float2 uv:TEXCOORD0; };
            float _Thorn, _Friendly;
            output vert(input v) { output o; o.vertex=UnityObjectToClipPos(v.vertex); o.uv=v.uv; return o; }
            fixed4 frag(output i):SV_Target
            {
                float2 p=i.uv*2-1;
                float r=length(p);
                // 광량은 판정 주변으로 국한한다. 긴 입자/넓은 링/화면 전체 번짐을 추가하지 않는다.
                float halo=saturate(1-r/.88); halo=halo*halo*.24;
                float edge, ridge;
                if (_Thorn>.5)
                {
                    float width=max(0,1-abs(p.x-.04)/.72)*.26;
                    float spine=width-abs(p.y);
                    float barb=max(.095-length(p-float2(-.18,.26)),.095-length(p-float2(-.18,-.26)));
                    edge=max(spine,barb); ridge=saturate(1-abs(p.y+.035)/.12);
                }
                else
                {
                    float drop=length(float2((p.x+.07)*.95,p.y*1.15));
                    edge=.52-drop; ridge=saturate(1-length((p-float2(.12,.14))*3.5));
                }
                float core=smoothstep(-.025,.025,edge);
                float rim=exp(-abs(edge)*45)*.65;
                float3 dark=_Thorn>.5?float3(.24,.12,.055):float3(.06,.17,.012);
                if (_Friendly>.5) dark=float3(.015,.08,.22);
                float3 light=_Friendly>.5?float3(.35,.84,1):_Thorn>.5?float3(.78,.72,.56):float3(.66,.84,.22);
                float3 body=lerp(dark,light,ridge*.7);
                float3 glow=_Friendly>.5?float3(.2,.7,1):_Thorn>.5?float3(.58,.72,.12):float3(.58,.85,.15);
                float alpha=saturate(core+rim*.65+halo);
                float3 rgb=body*core+glow*(rim*.65+halo);
                return float4(rgb,alpha);
            }
            ENDCG
        }
    }
}
