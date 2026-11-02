Shader "EXODUSER/SkillAdditive"
{
    // Web globalCompositeOperation 'lighter' / 'screen' layers of the skill effects (spike trap, holy dome, slam wave, ice orb glow).
    // Vertex colour carries the tint and the layer alpha; _Flat = 1 ignores the texture colour (web _tintHolyDome: a flat colour through the sheet's alpha).
    // Web _tintHolyDome rebuilds the alpha as max(R,G,B) x source alpha, and the sheet's alpha is already max(R,G,B), so the effective weight is brightness squared (flat path only).
    Properties { [PerRendererData] _MainTex ("Sheet", 2D) = "white" {} _Flat ("Flat tint", Float) = 0 _NormalBlend ("Normal blend", Float) = 0 _DstBlend ("Destination blend", Float) = 1 _DepthTest ("Depth test", Float) = 4 [PerRendererData] _GroundUvClip ("Ground footprint", Float) = 0 [PerRendererData] _GroundRingRadius ("Ground ring radius", Float) = 0 }
    // Ground-only property block: original sprites keep the zero/default path.
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
            struct output { float4 vertex:SV_POSITION; float2 uv:TEXCOORD0; fixed4 color:COLOR; float2 ground:TEXCOORD1; };
            sampler2D _MainTex; float _Flat, _NormalBlend;
            float _GroundUvClip; float4 _GroundUvU, _GroundUvV, _GroundUvRect;
            float _GroundRingRadius,_GroundRingWidth,_GroundRingLift; float4 _GroundRingColor;
            output vert(input v) { output o; o.ground=v.vertex.xz; if(_GroundUvClip>.5 && _GroundRingRadius>0) v.vertex.y+=_GroundRingLift; o.vertex=UnityObjectToClipPos(v.vertex); o.uv=_GroundUvClip>.5?float2(dot(float3(v.vertex.xz,1),_GroundUvU.xyz),dot(float3(v.vertex.xz,1),_GroundUvV.xyz)):v.uv; o.color=v.color; return o; }
            fixed4 frag(output i):SV_Target
            {
                if(_GroundUvClip>.5 && _GroundRingRadius>0)
                {
                    // Same 72-segment centre line and world width as the original ring.
                    const float step=6.28318530718/72;
                    float angle=(floor(atan2(i.ground.y,i.ground.x)/step)+.5)*step;
                    float distance=dot(i.ground,float2(cos(angle),sin(angle)))-_GroundRingRadius*cos(step*.5);
                    float stroke=saturate((_GroundRingWidth*.5-abs(distance))/max(fwidth(distance),.000001)+.5);
                    clip(stroke-.0001);fixed a=_GroundRingColor.a*stroke;
                    return fixed4(_GroundRingColor.rgb*a,_NormalBlend>.5?a:0);
                }
                float2 uv=i.uv;
                if(_GroundUvClip>.5) { clip(min(min(uv.x,uv.y),min(1-uv.x,1-uv.y))); uv=_GroundUvRect.xy+uv*_GroundUvRect.zw; }
                fixed4 p=tex2D(_MainTex,uv);
                fixed a=p.a*i.color.a; if(_Flat>0.5) a*=max(p.r,max(p.g,p.b));
                fixed3 rgb=_Flat>0.5?fixed3(1,1,1):p.rgb;
                return fixed4(rgb*i.color.rgb*a,_NormalBlend>0.5?a:0);
            }
            ENDCG
        }
    }
}
