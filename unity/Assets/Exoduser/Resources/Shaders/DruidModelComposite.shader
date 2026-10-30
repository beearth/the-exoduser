Shader "EXODUSER/DruidModelComposite"
{
    Properties { _MainTex ("드루이드 실제 3D 렌더", 2D) = "black" {} _Opacity ("불투명도", Float) = 1 _Cut ("침강 경계", Float) = 0 }
    SubShader
    {
        Tags { "Queue"="Transparent" "RenderType"="Transparent" }
        Cull Off ZWrite Off Blend One OneMinusSrcAlpha
        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"
            struct input { float4 vertex:POSITION; float2 uv:TEXCOORD0; };
            struct output { float4 vertex:SV_POSITION; float2 uv:TEXCOORD0; };
            sampler2D _MainTex; float4 _MainTex_TexelSize; float _Opacity, _Cut;
            output vert(input v) { output o; o.vertex=UnityObjectToClipPos(v.vertex); o.uv=v.uv; return o; }
            fixed4 frag(output i):SV_Target
            {
                float2 uv=i.uv;
                #if UNITY_UV_STARTS_AT_TOP
                if (_MainTex_TexelSize.y < 0) uv.y=1-uv.y;
                #endif
                clip(i.uv.y-_Cut);
                fixed4 c=tex2D(_MainTex,uv);
                return c*_Opacity;
            }
            ENDCG
        }
    }
}
