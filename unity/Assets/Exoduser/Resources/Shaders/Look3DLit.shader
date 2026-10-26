// PC-MAP3D stage 2: Godot LOOK-001 D lighting model for the native perspective world.
// Godot evaluates Sprite3D(shaded)/StandardMaterial3D(PER_PIXEL) in linear space with directional key + fill and a flat ambient colour
// (look_3d_variant.gd:8-15). Directional energy is multiplied by PI inside Godot, cancelling the Lambert 1/PI, so
// diffuse = albedo * sum(colour*energy*N.L). Back faces flip their normal (cull_disabled) == "normal faces the viewer".
// Stage 2 adds: key directional shadow (Unity ForwardBase main light, strength = Godot shadow_opacity), the 12 static field lights
// of ch1_lighting.json as point lights (source colour-stamp radial profile by horizontal distance, N.L from the 3D light position),
// and exp distance fog (environment.fog_density, fog_light_color x fog_light_energy). Specular is omitted (roughness .91-.94).
Shader "EXODUSER/Look3DLit"
{
    Properties
    {
        [PerRendererData] _MainTex ("Source texture", 2D) = "white" {}
        [PerRendererData] _Color ("Modulate", Color) = (1,1,1,1)
        [PerRendererData] _Cutoff ("Alpha scissor (0 = opaque)", Float) = 0.1
    }
    CGINCLUDE
    #include "UnityCG.cginc"
    sampler2D _MainTex; float4 _Color; float _Cutoff;
    ENDCG
    SubShader
    {
        Tags { "Queue"="AlphaTest" "RenderType"="TransparentCutout" "IgnoreProjector"="True" }
        Cull Off ZWrite On
        Pass
        {
            Tags { "LightMode"="ForwardBase" }
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #pragma target 3.5
            #pragma multi_compile_fwdbase
            #include "AutoLight.cginc"
            float4 _L3D_KeyDir, _L3D_KeyCol, _L3D_FillDir, _L3D_FillCol, _L3D_Ambient;
            float4 _L3D_Fog, _L3D_FogCol; // x = density, y = fog_light_energy
            float4 _L3D_PtPos[12];        // xyz = Unity position, w = radius (px)
            float4 _L3D_PtCol[12];        // rgb = source colour (0..1, gamma), a = alpha*flicker*.85 clamped
            float _L3D_PtCount;
            struct input { float4 vertex:POSITION; float3 normal:NORMAL; float2 uv:TEXCOORD0; };
            struct output { float4 pos:SV_POSITION; float2 uv:TEXCOORD0; float3 normal:TEXCOORD1; float3 world:TEXCOORD2; SHADOW_COORDS(3) };
            float3 L3D_SrgbToLinear(float3 c) { return lerp(c/12.92, pow((c+0.055)/1.055, 2.4), step(0.04045, c)); }
            float3 L3D_LinearToSrgb(float3 c) { c=saturate(c); return lerp(c*12.92, 1.055*pow(c, 1.0/2.4)-0.055, step(0.0031308, c)); }
            #if defined(UNITY_COLORSPACE_GAMMA)
            #define L3D_DECODE(c) L3D_SrgbToLinear(c)
            #define L3D_ENCODE(c) L3D_LinearToSrgb(c)
            #else
            #define L3D_DECODE(c) (c)
            #define L3D_ENCODE(c) saturate(c)
            #endif
            // Source colour stamp (SourceFieldLightStamps.cs: premultiplied rings .95/.52/.20/.05 at t=0/.28/.58/.82, 0 at 1).
            float3 L3D_Stamp(float3 c, float t)
            {
                float3 a=c*.95, b=c*.52;
                float3 cc=floor(c*255*float3(.7,.6,.5))/255*.20, d=floor(c*255*float3(.4,.3,.2))/255*.05;
                float3 v = t<.28 ? lerp(a,b,t/.28) : t<.58 ? lerp(b,cc,(t-.28)/.30) : t<.82 ? lerp(cc,d,(t-.58)/.24) : lerp(d,0,saturate((t-.82)/.18));
                return v;
            }
            output vert(input v)
            {
                output o; o.pos=UnityObjectToClipPos(v.vertex); o.uv=v.uv;
                o.normal=UnityObjectToWorldNormal(v.normal); o.world=mul(unity_ObjectToWorld, v.vertex).xyz;
                TRANSFER_SHADOW(o); return o;
            }
            fixed4 frag(output i) : SV_Target
            {
                float4 tex=tex2D(_MainTex, i.uv);
                float alpha=tex.a*_Color.a;
                if(_Cutoff>0) clip(alpha-_Cutoff);
                float3 n=normalize(i.normal);
                float3 toCamera=_WorldSpaceCameraPos-i.world;
                if(dot(n, toCamera)<0) n=-n;
                UNITY_LIGHT_ATTENUATION(shadow, i, i.world);
                float3 lit=_L3D_Ambient.rgb
                    + _L3D_KeyCol.rgb*saturate(dot(n, _L3D_KeyDir.xyz))*shadow
                    + _L3D_FillCol.rgb*saturate(dot(n, _L3D_FillDir.xyz));
                for(int k=0;k<12;k++)
                {
                    if(k>=(int)_L3D_PtCount) break;
                    float3 toLight=_L3D_PtPos[k].xyz-i.world;
                    float horizontal=length(toLight.xz)/_L3D_PtPos[k].w;
                    if(horizontal>=1) continue;
                    float3 stamp=L3D_DECODE(L3D_Stamp(_L3D_PtCol[k].rgb, horizontal))*_L3D_PtCol[k].a;
                    lit+=stamp*saturate(dot(n, normalize(toLight)));
                }
                float3 albedo=L3D_DECODE(tex.rgb)*L3D_DECODE(_Color.rgb);
                float3 color=albedo*lit;
                float fog=1-exp(-_L3D_Fog.x*length(toCamera));
                color=lerp(color, _L3D_FogCol.rgb*_L3D_Fog.y, fog);
                return fixed4(L3D_ENCODE(color), alpha);
            }
            ENDCG
        }
        Pass
        {
            Tags { "LightMode"="ShadowCaster" }
            ZWrite On ZTest LEqual Cull Off
            CGPROGRAM
            #pragma vertex vertShadow
            #pragma fragment fragShadow
            #pragma target 3.5
            #pragma multi_compile_shadowcaster
            struct vInput { float4 vertex:POSITION; float3 normal:NORMAL; float2 uv:TEXCOORD0; };
            struct vOutput { V2F_SHADOW_CASTER; float2 uv:TEXCOORD1; };
            vOutput vertShadow(vInput v)
            {
                vOutput o; o.uv=v.uv;
                TRANSFER_SHADOW_CASTER_NORMALOFFSET(o)
                return o;
            }
            float4 fragShadow(vOutput i) : SV_Target
            {
                float alpha=tex2D(_MainTex, i.uv).a*_Color.a;
                if(_Cutoff>0) clip(alpha-_Cutoff);
                SHADOW_CASTER_FRAGMENT(i)
            }
            ENDCG
        }
    }
}
