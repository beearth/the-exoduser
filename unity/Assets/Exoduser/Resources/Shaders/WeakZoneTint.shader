Shader "EXODUSER/WeakZoneTint"
{
    // 웹의 source-atop 틴트와 이후 source-over 그리기: 원본 알파를 보존한다.
    Properties { [PerRendererData] _MainTex ("원본 십자", 2D) = "white" {} _DepthTest ("깊이 비교", Float) = 4 }
    SubShader
    {
        Tags { "Queue"="Transparent" "RenderType"="Transparent" "CanUseSpriteAtlas"="False" }
        Cull Off Lighting Off ZWrite Off Blend One OneMinusSrcAlpha ZTest [_DepthTest]
        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"
            struct input { float4 vertex:POSITION; float2 uv:TEXCOORD0; fixed4 color:COLOR; };
            struct output { float4 vertex:SV_POSITION; float2 uv:TEXCOORD0; fixed4 color:COLOR; };
            sampler2D _MainTex;
            output vert(input v) { output o; o.vertex=UnityObjectToClipPos(v.vertex); o.uv=v.uv; o.color=v.color; return o; }
            fixed4 frag(output i):SV_Target { fixed a=tex2D(_MainTex,i.uv).a*i.color.a; return fixed4(i.color.rgb*a,a); }
            ENDCG
        }
    }
}
