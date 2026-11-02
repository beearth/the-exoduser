Shader "EXODUSER/KiSlashAdditive"
{
    Properties { [PerRendererData] _MainTex ("Original silver sheet", 2D) = "white" {} [PerRendererData] _Opacity ("Source opacity", Float) = 1 [PerRendererData] _GroundUvClip ("Ground footprint", Float) = 0 }
    // Ground-only property block: original sprites keep the zero/default path.
    SubShader
    {
        Tags { "Queue"="Transparent" "RenderType"="Transparent" "CanUseSpriteAtlas"="False" }
        Cull Off Lighting Off ZWrite Off Blend One One
        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"
            struct input { float4 vertex:POSITION; float2 uv:TEXCOORD0; fixed4 color:COLOR; };
            struct output { float4 vertex:SV_POSITION; float2 uv:TEXCOORD0; fixed4 color:COLOR; };
            sampler2D _MainTex; float _Opacity;
            float _GroundUvClip; float4 _GroundUvU, _GroundUvV, _GroundUvRect;
            output vert(input v) { output o; o.vertex=UnityObjectToClipPos(v.vertex); o.uv=_GroundUvClip>.5?float2(dot(float3(v.vertex.xz,1),_GroundUvU.xyz),dot(float3(v.vertex.xz,1),_GroundUvV.xyz)):v.uv; o.color=v.color; return o; }
            fixed4 frag(output i):SV_Target
            {
                float2 uv=i.uv;
                if(_GroundUvClip>.5) { clip(min(min(uv.x,uv.y),min(1-uv.x,1-uv.y))); uv=_GroundUvRect.xy+uv*_GroundUvRect.zw; }
                fixed4 p=tex2D(_MainTex,uv);
                // Source _drawKiSlashFrame: ONE/ONE needs opacity in RGB as well.
                return fixed4(p.rgb*p.a*_Opacity,0);
            }
            ENDCG
        }
    }
}
