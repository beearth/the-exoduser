Shader "EXODUSER/SourcePlayerFloor"
{
    Properties { [PerRendererData] _MainTex ("Original player floor bitmap", 2D) = "white" {} }
    SubShader
    {
        Tags { "Queue"="Transparent" "RenderType"="Transparent" "CanUseSpriteAtlas"="False" }
        Cull Off Lighting Off ZWrite Off Blend SrcAlpha OneMinusSrcAlpha
        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"
            struct input { float4 vertex:POSITION; float2 uv:TEXCOORD0; };
            struct output { float4 vertex:SV_POSITION; float2 uv:TEXCOORD0; };
            sampler2D _MainTex;
            output vert(input v) { output o; o.vertex=UnityObjectToClipPos(v.vertex); o.uv=v.uv; return o; }
            fixed4 frag(output i):SV_Target
            {
                // Source5592 normal GPU pipeline. Proxy6028 ignores 'lighter'.
                return tex2D(_MainTex,i.uv);
            }
            ENDCG
        }
    }
}
