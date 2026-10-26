// PC-MAP3D stage 1: Godot LOOK-001 D baseline lighting model for the native perspective world.
// Godot evaluates Sprite3D(shaded)/StandardMaterial3D(PER_PIXEL) in linear space with
// directional key + fill and a flat ambient colour (look_3d_variant.gd:8-15). Directional energy is
// multiplied by PI inside Godot, which cancels the Lambert 1/PI, so diffuse = albedo * sum(colour*energy*N.L).
// Specular is omitted (roughness .91-.94, light_specular .18). Back faces flip their normal (cull_disabled),
// which equals "normal faces the viewer". Light vectors/colours come from NativePerspectiveWorld as globals.
// Shadows, fog, glow and grading are NOT part of stage 1.
Shader "EXODUSER/Look3DLit"
{
    Properties
    {
        [PerRendererData] _MainTex ("Source texture", 2D) = "white" {}
        [PerRendererData] _Color ("Modulate", Color) = (1,1,1,1)
        [PerRendererData] _Cutoff ("Alpha scissor (0 = opaque)", Float) = 0.1
    }
    SubShader
    {
        Tags { "Queue"="AlphaTest" "RenderType"="TransparentCutout" "IgnoreProjector"="True" }
        Cull Off ZWrite On Lighting Off
        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #pragma target 3.0
            #include "UnityCG.cginc"
            sampler2D _MainTex; float4 _Color; float _Cutoff;
            float4 _L3D_KeyDir, _L3D_KeyCol, _L3D_FillDir, _L3D_FillCol, _L3D_Ambient;
            struct input { float4 vertex:POSITION; float3 normal:NORMAL; float2 uv:TEXCOORD0; };
            struct output { float4 pos:SV_POSITION; float2 uv:TEXCOORD0; float3 normal:TEXCOORD1; float3 world:TEXCOORD2; };
            float3 L3D_SrgbToLinear(float3 c) { return lerp(c/12.92, pow((c+0.055)/1.055, 2.4), step(0.04045, c)); }
            float3 L3D_LinearToSrgb(float3 c) { c=saturate(c); return lerp(c*12.92, 1.055*pow(c, 1.0/2.4)-0.055, step(0.0031308, c)); }
            #if defined(UNITY_COLORSPACE_GAMMA)
            #define L3D_DECODE(c) L3D_SrgbToLinear(c)
            #define L3D_ENCODE(c) L3D_LinearToSrgb(c)
            #else
            #define L3D_DECODE(c) (c)
            #define L3D_ENCODE(c) saturate(c)
            #endif
            output vert(input v)
            {
                output o; o.pos=UnityObjectToClipPos(v.vertex); o.uv=v.uv;
                o.normal=UnityObjectToWorldNormal(v.normal); o.world=mul(unity_ObjectToWorld, v.vertex).xyz; return o;
            }
            fixed4 frag(output i) : SV_Target
            {
                float4 tex=tex2D(_MainTex, i.uv);
                float alpha=tex.a*_Color.a;
                if(_Cutoff>0) clip(alpha-_Cutoff);
                float3 n=normalize(i.normal);
                if(dot(n, _WorldSpaceCameraPos-i.world)<0) n=-n;
                float3 lit=_L3D_Ambient.rgb
                    + _L3D_KeyCol.rgb*saturate(dot(n, _L3D_KeyDir.xyz))
                    + _L3D_FillCol.rgb*saturate(dot(n, _L3D_FillDir.xyz));
                float3 albedo=L3D_DECODE(tex.rgb)*L3D_DECODE(_Color.rgb);
                return fixed4(L3D_ENCODE(albedo*lit), alpha);
            }
            ENDCG
        }
    }
}
