Shader "EXODUSER/KiSlashInk"
{
    Properties { [PerRendererData] _MainTex ("Original silver sheet", 2D) = "white" {} [PerRendererData] _Opacity ("Source opacity", Float) = 1 [Enum(UnityEngine.Rendering.CompareFunction)] _ZTest ("Depth comparison", Float) = 4 }
    SubShader
    {
        Tags { "Queue"="Transparent" "RenderType"="Transparent" "CanUseSpriteAtlas"="False" }
        Cull Off Lighting Off ZWrite Off ZTest [_ZTest] Blend SrcAlpha OneMinusSrcAlpha
        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #pragma target 3.0
            #include "UnityCG.cginc"
            struct input { float4 vertex:POSITION; float2 uv:TEXCOORD0; fixed4 color:COLOR; };
            struct output { float4 vertex:SV_POSITION; float2 uv:TEXCOORD0; fixed4 color:COLOR; };
            sampler2D _MainTex; float4 _MainTex_TexelSize; float _Opacity;
            output vert(input v) { output o; o.vertex=UnityObjectToClipPos(v.vertex); o.uv=v.uv; o.color=v.color; return o; }
            fixed4 frag(output i):SV_Target
            {
                // Source canvas blur(5px), then max(premultiplied RGB)*2.4.
                // 11x11 taps approximate its Gaussian; pixel parity is unverified.
                float3 premul=0; float weights=0;
                for(int y=-5;y<=5;y++) for(int x=-5;x<=5;x++)
                {
                    float2 offset=float2(x,y)*3;
                    float w=exp(-dot(offset,offset)/50);
                    fixed4 tap=tex2D(_MainTex,i.uv+offset*_MainTex_TexelSize.xy);
                    premul+=tap.rgb*tap.a*w; weights+=w;
                }
                premul/=weights;
                return fixed4(float3(5,4,6)/255,saturate(max(premul.r,max(premul.g,premul.b))*2.4)*_Opacity);
            }
            ENDCG
        }
    }
}
