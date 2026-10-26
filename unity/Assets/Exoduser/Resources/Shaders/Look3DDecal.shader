// PC-MAP3D S2-1: ground decal (dried blood / bone scatter / root vines). Alpha blended grid quad just above the displaced ground
// (the vertex shader follows the floor undulation). Blended into the floor instead of sitting on it like a sticker:
//  - alpha is cut where the floor height (floor_v01b height, same domain warp / anti-tiling as the ground shader) is high (ridges), `_LowOnly` = 1
//    keeps the decal only in low areas (pooled blood) with a noise-eroded edge (`_Erode`);
//  - the decal normal is mixed with the floor normal so it takes the same light;
//  - decal colour follows the floor brightness (darker floor -> darker decal), and a dark soft "grime" ring (alpha mip 3) grounds it.
// Texture samples: decal albedo 1 + normal 1 + alpha mip 1 + floor albedo 2 + floor nhr 2 (anti-tiling pair).
Shader "EXODUSER/Look3DDecal"
{
    Properties
    {
        _MainTex ("Decal albedo RGBA", 2D) = "white" {}
        _NrmTex ("Decal normal RGBA", 2D) = "bump" {}
        _Tint ("Tint", Color) = (1,1,1,1)
        _Strength ("Alpha strength", Float) = 1
        _Erode ("Edge erosion noise 0..1", Float) = 0.3
        _LowOnly ("Only in low floor areas (0/1)", Float) = 0
    }
    SubShader
    {
        Tags { "Queue"="Geometry+10" "RenderType"="Transparent" "IgnoreProjector"="True" }
        Cull Off ZWrite Off Blend SrcAlpha OneMinusSrcAlpha Offset -2, -2
        Pass
        {
            Tags { "LightMode"="ForwardBase" }
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #pragma target 3.5
            #pragma multi_compile_fwdbase
            #include "UnityCG.cginc"
            #include "AutoLight.cginc"
            #include "Look3DCommon.cginc"
            sampler2D _MainTex, _NrmTex, _L3D_FloorAlb, _L3D_FloorNhr; float4 _Tint; float _Strength, _Erode, _LowOnly;
            struct input { float4 vertex:POSITION; float2 uv:TEXCOORD0; };
            struct output { float4 pos:SV_POSITION; float2 uv:TEXCOORD0; float3 world:TEXCOORD1; SHADOW_COORDS(2) };
            output vert(input v)
            {
                output o; float3 w=mul(unity_ObjectToWorld, v.vertex).xyz;
                float2 px=float2(w.x, -w.z); w.y+=L3D_BumpH(px, L3D_SdAt(px)); // follows the floor undulation
                o.pos=mul(UNITY_MATRIX_VP, float4(w,1)); o.uv=v.uv; o.world=w; v.vertex=mul(unity_WorldToObject, float4(w,1)); TRANSFER_SHADOW(o); return o;
            }
            fixed4 frag(output i) : SV_Target
            {
                float2 px=float2(i.world.x, -i.world.z);
                float4 c=tex2D(_MainTex, i.uv);
                float blur=tex2Dlod(_MainTex, float4(i.uv,0,3.0)).a;
                float4 nm=tex2D(_NrmTex, i.uv);
                // floor under the decal (same warp as the ground shader, first scale only)
                float2 warp=float2(L3D_Fbm(px/310.0+3.3), L3D_Fbm(px/310.0+9.1))-0.5;
                float2 uvF=(px+warp*150.0)/1250.0;
                float3 fa; float4 fd; NoTile(_L3D_FloorAlb, _L3D_FloorNhr, uvF, fa, fd);
                float floorLum=dot(fa, float3(0.30,0.59,0.11));
                float height=fd.b;
                // alpha: eroded edge, ridge cut (less on the high ground), low-only pooling
                float n1=L3D_Fbm(px/24.0+5.0);
                float edge=smoothstep(0.28, 0.72, c.a+(n1-0.5)*_Erode);
                float ridge=1-0.5*smoothstep(0.58, 0.85, height);
                float low=lerp(1.0, 1-smoothstep(0.34, 0.58, height), _LowOnly);
                float2 ed=abs(i.uv-0.5); float uvFade=1.0-smoothstep(0.34, 0.5, max(ed.x, ed.y)); // fades to 0 well inside the quad: no border can show
                float a=saturate(edge*ridge*low*_Strength*_Tint.a*uvFade);
                // normal: decal + floor
                float2 nd=(nm.xy*2-1)*0.7, nf=(fd.xy*2-1)*0.25;
                float3 tx=normalize(mul((float3x3)unity_ObjectToWorld, float3(1,0,0))), tz=normalize(mul((float3x3)unity_ObjectToWorld, float3(0,0,1)));
                float3 n=normalize(float3(0,1,0)+tx*nd.x+tz*nd.y+float3(nf.x,0,-nf.y));
                // colour follows the floor brightness (floor_v01b mean luminance ~0.31 in sRGB)
                float3 albedo=L3D_DECODE(c.rgb*_Tint.rgb)*lerp(1.0, clamp(floorLum/0.31, 0.55, 1.25), 0.85);
                UNITY_LIGHT_ATTENUATION(shadow, i, i.world);
                float3 lit=L3D_Lighting(n, i.world, shadow);
                float3 color=albedo*lit;
                float ga=saturate(blur*0.55)*_Tint.a*(1-a)*ridge*low;
                color=(L3D_Fog(color, i.world)*a+L3D_Fog(float3(0,0,0), i.world)*ga)/(a+ga+1e-5);
                return fixed4(L3D_ENCODE(color), saturate(a+ga));
            }
            ENDCG
        }
    }
}
