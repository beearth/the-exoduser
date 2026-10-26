// MAP3D-LIFE1 L8 + L1 + L2 + L9: tentacle grass tufts, GPU-instanced (multi_compile_instancing, one material, 3 meshes), lit by the Look3D model.
//  - vertex colour: r = height mask (0 root fixed .. 1 tip), g = per-blade phase, b = per-blade brightness;
//  - wind (L3D_WindOffset): two frequencies, world-noise gusts, per-individual seed from the instance position + per-blade phase (L9);
//  - player push (L3D_TrailPush): tips are pushed away from the player and its recent positions and bent down, then recover as the trail fades (L2);
//  - the tuft follows the floor undulation (L3D_BumpH at its origin); receives key shadow and the moving gobo shadow;
//  - colour: dark base to a muted flesh tip, saturation/contrast kept below the character on purpose (combat readability first).
Shader "EXODUSER/Look3DGrass"
{
    Properties
    {
        _WindAmp ("Wind amplitude px", Float) = 9
        _BladeHeight ("Mesh blade height px", Float) = 50
    }
    SubShader
    {
        Tags { "Queue"="Geometry" "RenderType"="Opaque" }
        Cull Off ZWrite On
        Pass
        {
            Tags { "LightMode"="ForwardBase" }
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #pragma target 3.5
            #pragma multi_compile_fwdbase
            #pragma multi_compile_instancing
            #include "UnityCG.cginc"
            #include "AutoLight.cginc"
            #include "Look3DCommon.cginc"
            float _WindAmp, _BladeHeight;
            struct input { float4 vertex:POSITION; float3 normal:NORMAL; float4 color:COLOR; UNITY_VERTEX_INPUT_INSTANCE_ID };
            struct output { float4 pos:SV_POSITION; float3 world:TEXCOORD0; float3 normal:TEXCOORD1; float4 col:TEXCOORD2; float seed:TEXCOORD3; SHADOW_COORDS(4) };
            output vert(input v)
            {
                UNITY_SETUP_INSTANCE_ID(v);
                output o;
                float3 origin=float3(unity_ObjectToWorld._m03, unity_ObjectToWorld._m13, unity_ObjectToWorld._m23);
                float2 originPx=float2(origin.x, -origin.z);
                float seed=frac(sin(dot(originPx, float2(12.9898,78.233)))*43758.5453);
                float3 w=mul(unity_ObjectToWorld, v.vertex).xyz;
                float h=v.color.r;
                float tuftHeight=_BladeHeight*length(float3(unity_ObjectToWorld._m01, unity_ObjectToWorld._m11, unity_ObjectToWorld._m21));
                w.y+=L3D_BumpH(originPx, L3D_SdAt(originPx));
                w+=L3D_WindOffset(originPx, float2(w.x,-w.z), h, seed+v.color.g*0.37, _WindAmp);
                w+=L3D_TrailPush(originPx, h, tuftHeight);
                o.pos=mul(UNITY_MATRIX_VP, float4(w,1)); o.world=w;
                o.normal=UnityObjectToWorldNormal(v.normal); o.col=v.color; o.seed=seed;
                v.vertex=mul(unity_WorldToObject, float4(w,1)); TRANSFER_SHADOW(o);
                return o;
            }
            fixed4 frag(output i) : SV_Target
            {
                float3 n=normalize(i.normal);
                float h=i.col.r;
                float3 baseC=float3(0.060,0.040,0.035), tipC=float3(0.25,0.135,0.105); // muted: below the character in saturation and contrast
                // per-individual tint: fleshy red <-> grey olive, brightness 0.8..1.2
                float3 tint=lerp(float3(1.0,0.94,0.90), float3(0.82,0.84,0.68), frac(i.seed*13.7));
                float3 albedo=L3D_DECODE(lerp(baseC, tipC, smoothstep(0.0,1.0,h))*tint*(0.8+0.4*i.col.b));
                UNITY_LIGHT_ATTENUATION(shadow, i, i.world);
                shadow*=L3D_Gobo(float2(i.world.x,-i.world.z));
                float3 color=albedo*L3D_Lighting(n, i.world, shadow);
                color=L3D_Fog(color, i.world);
                return fixed4(L3D_ENCODE(color), 1);
            }
            ENDCG
        }
    }
}
