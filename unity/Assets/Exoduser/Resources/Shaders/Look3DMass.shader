// PC-MAP3D vertical slice: procedural outer mass / root meshes with a triplanar mass_v01 material (albedo + normal), lit by the
// Look3D key/fill/ambient/point model with key shadow, casting shadows. The base of each mesh darkens and tints toward the ground
// (contact occlusion) so the seam to the displaced ground disappears.
// Texture samples: albedo 3 + normal 3 (one per projection plane).
Shader "EXODUSER/Look3DMass"
{
    Properties
    {
        _MassAlb ("mass_v01 albedo", 2D) = "gray" {}
        _MassNrm ("mass_v01 normal", 2D) = "bump" {}
        _Tile ("Tile px", Float) = 700
        _NormalStrength ("Normal strength", Float) = 0.8
        _ContactHeight ("Contact darkening height px", Float) = 110
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
            #include "UnityCG.cginc"
            #include "AutoLight.cginc"
            #include "Look3DCommon.cginc"
            sampler2D _MassAlb, _MassNrm; float _Tile, _NormalStrength, _ContactHeight;
            struct input { float4 vertex:POSITION; float3 normal:NORMAL; };
            struct output { float4 pos:SV_POSITION; float3 world:TEXCOORD0; float3 normal:TEXCOORD1; SHADOW_COORDS(2) };
            output vert(input v)
            {
                output o; o.pos=UnityObjectToClipPos(v.vertex); o.world=mul(unity_ObjectToWorld, v.vertex).xyz;
                o.normal=UnityObjectToWorldNormal(v.normal); TRANSFER_SHADOW(o); return o;
            }
            fixed4 frag(output i) : SV_Target
            {
                float3 n=normalize(i.normal);
                if(dot(n, _WorldSpaceCameraPos-i.world)<0) n=-n;
                float3 p=i.world/_Tile;
                float3 blend=pow(abs(n), 4.0); blend/=(blend.x+blend.y+blend.z);
                float3 aX=tex2D(_MassAlb, p.zy).rgb, aY=tex2D(_MassAlb, p.xz).rgb, aZ=tex2D(_MassAlb, p.xy).rgb;
                float3 albedoGamma=aX*blend.x+aY*blend.y+aZ*blend.z;
                float2 nX=(tex2D(_MassNrm, p.zy).xy*2-1)*_NormalStrength, nY=(tex2D(_MassNrm, p.xz).xy*2-1)*_NormalStrength, nZ=(tex2D(_MassNrm, p.xy).xy*2-1)*_NormalStrength;
                // whiteout blend (Golus): swizzle each projected tangent normal into world axes
                float3 tX=float3(nX+n.zy, 1.0*abs(n.x)), tY=float3(nY+n.xz, 1.0*abs(n.y)), tZ=float3(nZ+n.xy, 1.0*abs(n.z));
                float3 nw=normalize(tX.zyx*blend.x + tY.xzy*blend.y + tZ.xyz*blend.z);
                if(dot(nw, n)<0.2) nw=n;
                float3 albedo=L3D_DECODE(albedoGamma)*float3(0.70,0.62,0.60); // darker, redder than the raw texture so the masses sit in the scene tone
                float contact=saturate(i.world.y/_ContactHeight);
                albedo*=lerp(0.20, 1.0, contact*contact*(3-2*contact));
                albedo*=1.0+(L3D_Fbm(i.world.xz/340.0)-0.5)*0.16;
                UNITY_LIGHT_ATTENUATION(shadow, i, i.world);
                float3 color=albedo*L3D_Lighting(nw, i.world, shadow);
                color=L3D_Fog(color, i.world);
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
