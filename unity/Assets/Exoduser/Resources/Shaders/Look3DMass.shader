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
        _Pulse ("Pulse amplitude px along the normal (0 = off)", Float) = 0
        _WindAmp ("Wind amplitude px (0 = off)", Float) = 0
        _LifeH ("Height normaliser px for the pulse/wind mask", Float) = 300
        _MassTone ("Mass albedo tone", Vector) = (1.8,1.0,0.95,0)
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
            sampler2D _MassAlb, _MassNrm; float _Tile, _NormalStrength, _ContactHeight, _Pulse, _WindAmp, _LifeH; float4 _MassTone;
            struct input { float4 vertex:POSITION; float3 normal:NORMAL; };
            struct output { float4 pos:SV_POSITION; float3 world:TEXCOORD0; float3 normal:TEXCOORD1; SHADOW_COORDS(2) };
            output vert(input v)
            {
                output o; float3 w=mul(unity_ObjectToWorld, v.vertex).xyz; o.normal=UnityObjectToWorldNormal(v.normal);
                if(_Pulse>0 || _WindAmp>0)
                {
                    // MAP3D-LIFE1 L6/L1/L9: slow pulse along the normal (period 4.5-9 s per object) and root wind; base fixed by the height mask
                    float2 opx=float2(unity_ObjectToWorld._m03, -unity_ObjectToWorld._m23);
                    float seed=frac(sin(dot(opx, float2(12.9898,78.233)))*43758.5453);
                    float hm=saturate(w.y/_LifeH);
                    if(_Pulse>0) { float period=4.5+4.5*frac(seed*5.17); float ph=seed*6.2832+L3D_Noise(w.xz/260.0)*3.0; w+=normalize(o.normal)*(_Pulse*sin(_L3D_Life.x*6.2832/period+ph)*smoothstep(0.0,0.35,hm)); }
                    if(_WindAmp>0) w+=L3D_WindOffset(opx, float2(w.x,-w.z), hm, seed, _WindAmp);
                }
                o.pos=mul(UNITY_MATRIX_VP, float4(w,1)); o.world=w; TRANSFER_SHADOW(o); return o;
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
                float3 albedo=L3D_DECODE(albedoGamma)*_MassTone.rgb; // tone: redder, lighter than the raw texture (outer body p50 >= 12, art bible 4)
                float topMask=smoothstep(0.30, 1.0, saturate(i.world.y/max(_LifeH,1.0)));
                albedo*=lerp(0.85, 1.5, topMask); // painted top light: the upper part of the wall catches the light
                float contact=saturate(i.world.y/_ContactHeight);
                albedo*=lerp(0.20, 1.0, contact*contact*(3-2*contact));
                albedo*=1.0+(L3D_Fbm(i.world.xz/340.0)-0.5)*0.16;
                UNITY_LIGHT_ATTENUATION(shadow, i, i.world);
                float3 pools=L3D_PointLights(nw, i.world);
                float3 dyn=L3D_Lighting(nw, i.world, shadow)-pools;
                float3 dref=_L3D_PaintRef.a>0 ? max(_L3D_PaintRef.rgb, 0.02) : float3(1,1,1); float wdyn=_L3D_PaintRef.a>0 ? _L3D_PaintRef.a : 1.0;
                float3 color=albedo*(lerp(float3(1,1,1), dyn/dref, wdyn)+pools/dref*_L3D_Pool.z); // painted light 70% + dynamic 30%, pools at their own weight, as on the ground
                // bone / shell tip highlight: ivory light on the upward facing upper part, shadow-aware
                color+=L3D_DECODE(float3(0.79,0.70,0.58))*pow(saturate(nw.y),3.0)*topMask*0.14*(0.4+0.6*shadow);
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
