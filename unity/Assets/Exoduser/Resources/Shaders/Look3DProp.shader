// PC-MAP3D M1 preparation: kit asset shader (Meshy PBR maps) in the Look3D lighting model + ground blend.
//  - maps (all optional; defaults are neutral): _BaseMap albedo (sRGB), _NormalMap tangent normal (needs mesh tangents: Map3DMeshImport sets
//    ModelImporter tangents to Mikktspace), _RoughMap, _MetalMap, _AoMap (white = unoccluded). Diffuse = albedo*(1-metal); a weak key-light
//    highlight comes from roughness (same L3D_Spec as the floor), tinted by the albedo for metal.
//  - ground blend: below `_BlendHeight` px of world height the albedo mixes into the floor (floor_v01b anti-tiled + ground tone, same warp as the
//    ground shader) and the normal relaxes toward up, so the model base sinks into the floor instead of sitting on it; a contact darkening ramp
//    (`_ContactHeight`) matches Look3DMass. Receives and casts key shadow; distance fog + haze from Look3DCommon.
//  Texture samples: 5 maps + 4 floor (anti-tiling pair, only evaluated inside the blend band).
Shader "EXODUSER/Look3DProp"
{
    Properties
    {
        _BaseMap ("Base colour", 2D) = "gray" {}
        _NormalMap ("Normal (tangent)", 2D) = "bump" {}
        _RoughMap ("Roughness", 2D) = "white" {}
        _MetalMap ("Metallic", 2D) = "black" {}
        _AoMap ("Ambient occlusion", 2D) = "white" {}
        _HasNormal ("Has normal map (0/1)", Float) = 0
        _NormalStrength ("Normal strength", Float) = 1
        _BlendHeight ("Ground blend height px", Float) = 60
        _ContactHeight ("Contact darkening height px", Float) = 90
    }
    SubShader
    {
        Tags { "Queue"="Geometry" "RenderType"="Opaque" }
        Cull Back ZWrite On
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
            sampler2D _BaseMap, _NormalMap, _RoughMap, _MetalMap, _AoMap, _L3D_FloorAlb, _L3D_FloorNhr;
            float _HasNormal, _NormalStrength, _BlendHeight, _ContactHeight;
            struct input { float4 vertex:POSITION; float3 normal:NORMAL; float4 tangent:TANGENT; float2 uv:TEXCOORD0; };
            struct output { float4 pos:SV_POSITION; float2 uv:TEXCOORD0; float3 world:TEXCOORD1; float3 tw:TEXCOORD2; float3 bw:TEXCOORD3; float3 nw:TEXCOORD4; SHADOW_COORDS(5) };
            output vert(input v)
            {
                output o; o.pos=UnityObjectToClipPos(v.vertex); o.uv=v.uv; o.world=mul(unity_ObjectToWorld, v.vertex).xyz;
                o.nw=UnityObjectToWorldNormal(v.normal); o.tw=UnityObjectToWorldDir(v.tangent.xyz); o.bw=cross(o.nw, o.tw)*v.tangent.w*unity_WorldTransformParams.w;
                TRANSFER_SHADOW(o); return o;
            }
            fixed4 frag(output i) : SV_Target
            {
                float3 ng=normalize(i.nw);
                float3 n=ng;
                if(_HasNormal>0.5)
                {
                    float2 t=(tex2D(_NormalMap, i.uv).xy*2-1)*_NormalStrength;
                    n=normalize(t.x*normalize(i.tw)+t.y*normalize(i.bw)+sqrt(saturate(1-dot(t,t)))*ng);
                }
                float3 albedo=L3D_DECODE(tex2D(_BaseMap, i.uv).rgb);
                float rough=tex2D(_RoughMap, i.uv).r, metal=tex2D(_MetalMap, i.uv).r, ao=tex2D(_AoMap, i.uv).r;
                // ground blend: the base of the model takes the floor material
                float gb=1-smoothstep(0.0, max(_BlendHeight,1.0), i.world.y);
                if(gb>0.001)
                {
                    float2 px=float2(i.world.x, -i.world.z);
                    float2 warp=float2(L3D_Fbm(px/310.0+3.3), L3D_Fbm(px/310.0+9.1))-0.5;
                    float3 fa; float4 fd; NoTile(_L3D_FloorAlb, _L3D_FloorNhr, (px+warp*150.0)/1250.0, fa, fd);
                    float3 floorAlbedo=L3D_DECODE(fa)*(_L3D_GroundTone.a>0 ? _L3D_GroundTone.rgb : float3(0.85,0.85,0.85));
                    albedo=lerp(albedo, floorAlbedo, gb*0.85); rough=lerp(rough, fd.a, gb*0.85); metal*=1-gb;
                    n=normalize(lerp(n, float3(0,1,0), gb*0.5));
                }
                float contact=saturate(i.world.y/_ContactHeight);
                albedo*=lerp(0.45, 1.0, contact*contact*(3-2*contact))*lerp(1.0, ao, 0.9);
                UNITY_LIGHT_ATTENUATION(shadow, i, i.world);
                float3 diffuse=albedo*(1-metal)*L3D_Lighting(n, i.world, shadow);
                float3 spec=L3D_Spec(n, i.world, saturate((0.95-rough)/0.27), shadow)*lerp(float3(1,1,1), albedo*3.0, metal);
                float3 color=L3D_Fog(diffuse+spec, i.world);
                return fixed4(L3D_ENCODE(color), 1);
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
            #include "UnityCG.cginc"
            struct vInput { float4 vertex:POSITION; float3 normal:NORMAL; };
            struct vOutput { V2F_SHADOW_CASTER; };
            vOutput vertShadow(vInput v) { vOutput o; TRANSFER_SHADOW_CASTER_NORMALOFFSET(o) return o; }
            float4 fragShadow(vOutput i) : SV_Target { SHADOW_CASTER_FRAGMENT(i) }
            ENDCG
        }
    }
}
