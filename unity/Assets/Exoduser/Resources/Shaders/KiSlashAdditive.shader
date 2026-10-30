Shader "EXODUSER/KiSlashAdditive"
{
    Properties { [PerRendererData] _MainTex ("Original silver sheet", 2D) = "white" {} [PerRendererData] _Opacity ("Source opacity", Float) = 1 [Enum(UnityEngine.Rendering.CompareFunction)] _ZTest ("Depth comparison", Float) = 4 }
    SubShader
    {
        Tags { "Queue"="Transparent" "RenderType"="Transparent" "CanUseSpriteAtlas"="False" }
        Cull Off Lighting Off ZWrite Off ZTest [_ZTest] Blend One One
        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"
            struct input { float4 vertex:POSITION; float2 uv:TEXCOORD0; fixed4 color:COLOR; };
            struct output { float4 vertex:SV_POSITION; float2 uv:TEXCOORD0; fixed4 color:COLOR; };
            sampler2D _MainTex; float _Opacity;
            output vert(input v) { output o; o.vertex=UnityObjectToClipPos(v.vertex); o.uv=v.uv; o.color=v.color; return o; }
            fixed4 frag(output i):SV_Target
            {
                fixed4 p=tex2D(_MainTex,i.uv);
                // Source _drawKiSlashFrame: ONE/ONE needs opacity in RGB as well.
                return fixed4(p.rgb*p.a*_Opacity,0);
            }
            ENDCG
        }
    }
}
