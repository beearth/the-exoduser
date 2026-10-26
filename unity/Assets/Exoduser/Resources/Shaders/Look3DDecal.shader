// PC-MAP3D S2-1: ground decal (dried blood / bone scatter / root vines). Alpha blended flat quad just above the displaced ground,
// lit by the same Look3D model (albedo * lighting with the decal normal), key shadow received, distance fog. A dark soft "grime" ring
// (alpha-blurred copy of the decal alpha) grounds it. Texture samples: albedo 1 + normal 1 + alpha blur via mip 3 (same albedo texture).
Shader "EXODUSER/Look3DDecal"
{
    Properties
    {
        _MainTex ("Decal albedo RGBA", 2D) = "white" {}
        _NrmTex ("Decal normal RGBA", 2D) = "bump" {}
        _Tint ("Tint", Color) = (1,1,1,1)
        _Strength ("Alpha strength", Float) = 1
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
            sampler2D _MainTex, _NrmTex; float4 _Tint; float _Strength;
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
                float4 c=tex2D(_MainTex, i.uv);
                float blur=tex2Dlod(_MainTex, float4(i.uv,0,3.0)).a;
                float4 nm=tex2D(_NrmTex, i.uv);
                float2 nxy=(nm.xy*2-1)*0.8;
                // decal quad: object U = east, V = north in the quad's own frame; the quad is rotated about Y by the placement, so build the
                // tangent frame from the object axes
                float3 tx=normalize(mul((float3x3)unity_ObjectToWorld, float3(1,0,0))), tz=normalize(mul((float3x3)unity_ObjectToWorld, float3(0,0,1)));
                float3 n=normalize(float3(0,1,0)+tx*nxy.x+tz*nxy.y);
                float3 albedo=L3D_DECODE(c.rgb*_Tint.rgb);
                UNITY_LIGHT_ATTENUATION(shadow, i, i.world);
                float3 color=albedo*L3D_Lighting(n, i.world, shadow);
                float3 grime=float3(0,0,0);
                float a=saturate(c.a*_Strength*_Tint.a);
                float ga=saturate(blur*0.55)*_Tint.a*(1-a);
                color=(L3D_Fog(color, i.world)*a+L3D_Fog(grime, i.world)*ga)/(a+ga+1e-5);
                float outA=saturate(a+ga);
                return fixed4(L3D_ENCODE(color), outA);
            }
            ENDCG
        }
    }
}
