Shader "EXODUSER/DropIconMask"
{
    Properties { [PerRendererData] _MainTex ("Item art", 2D) = "white" {} }
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
            struct input { float4 vertex:POSITION; float2 uv:TEXCOORD0; fixed4 color:COLOR; };
            struct output { float4 vertex:SV_POSITION; float2 uv:TEXCOORD0; fixed4 color:COLOR; };
            sampler2D _MainTex;
            output vert(input v) { output o; o.vertex=UnityObjectToClipPos(v.vertex); o.uv=v.uv; o.color=v.color; return o; }
            fixed4 frag(output i):SV_Target
            {
                fixed4 p=tex2D(_MainTex,i.uv)*i.color;
                // web _maskWorldDropBlack: light<=24 -> alpha 0, light<72 -> alpha*(light-24)/48 (generated art has an opaque black background)
                float light=max(p.r,max(p.g,p.b));
                p.a*= light<=0.0941 ? 0 : (light<0.2824 ? (light-0.0941)/0.1882 : 1);
                return p;
            }
            ENDCG
        }
    }
}
