Shader "EXODUSER/SkillAdditive"
{
    // Web globalCompositeOperation 'lighter' / 'screen' layers of the skill effects (spike trap, holy dome, slam wave, ice orb glow).
    // Vertex colour carries the tint and the layer alpha; _Flat = 1 ignores the texture colour (web _tintHolyDome: a flat colour through the sheet's alpha).
    // Web _tintHolyDome rebuilds the alpha as max(R,G,B) x source alpha, and the sheet's alpha is already max(R,G,B), so the effective weight is brightness squared (flat path only).
    Properties { [PerRendererData] _MainTex ("Sheet", 2D) = "white" {} _Flat ("Flat tint", Float) = 0 _NormalBlend ("Normal blend", Float) = 0 _DstBlend ("Destination blend", Float) = 1 _DepthTest ("Depth test", Float) = 4 }
    SubShader
    {
        Tags { "Queue"="Transparent" "RenderType"="Transparent" "CanUseSpriteAtlas"="False" }
        Cull Off Lighting Off ZWrite Off Blend One [_DstBlend] ZTest [_DepthTest]
        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"
            struct input { float4 vertex:POSITION; float2 uv:TEXCOORD0; fixed4 color:COLOR; };
            struct output { float4 vertex:SV_POSITION; float2 uv:TEXCOORD0; fixed4 color:COLOR; };
            sampler2D _MainTex; float _Flat, _NormalBlend;
            output vert(input v) { output o; o.vertex=UnityObjectToClipPos(v.vertex); o.uv=v.uv; o.color=v.color; return o; }
            fixed4 frag(output i):SV_Target
            {
                fixed4 p=tex2D(_MainTex,i.uv);
                fixed a=p.a*i.color.a; if(_Flat>0.5) a*=max(p.r,max(p.g,p.b));
                fixed3 rgb=_Flat>0.5?fixed3(1,1,1):p.rgb;
                return fixed4(rgb*i.color.rgb*a,_NormalBlend>0.5?a:0);
            }
            ENDCG
        }
    }
}
