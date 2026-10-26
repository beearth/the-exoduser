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
        _MassTone ("Mass albedo tone (unused since PAINTGROUND-R)", Vector) = (1.8,1.0,0.95,0)
        _Kind ("0 = flesh mass, 1 = root", Float) = 0
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
            sampler2D _MassAlb, _MassNrm; float _Tile, _NormalStrength, _ContactHeight, _Pulse, _WindAmp, _LifeH, _Kind; float4 _MassTone;
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
                // PAINTGROUND-R (art bible v2 7): the texture only gives the relief; the colour comes from the flesh palette. Body = FLESH-DEEP .. FLESH (roots: root brown),
                // darker than the floor (V1: body p50 6..12); only the ridge (SINEW ivory) and the bone tips are bright, shadow-aware.
                float tx=saturate(dot(albedoGamma, float3(0.30,0.59,0.11))/0.5); // relief 0..1 (texture luminance p50 ~0.45, p90 ~0.8)
                float3 cDeep=L3D_DECODE(_Kind>0.5 ? float3(0.122,0.071,0.047) : float3(0.227,0.086,0.078)); // root #1f120c / FLESH-DEEP #3a1614
                float3 cBody=L3D_DECODE(_Kind>0.5 ? float3(0.227,0.141,0.094) : float3(0.416,0.165,0.149)); // root #3a2418 / FLESH #6a2a26
                float3 albedo=lerp(cDeep, cBody, smoothstep(0.15,0.9,tx))*_L3D_MassTune.x;
                float topMask=smoothstep(0.30, 1.0, saturate(i.world.y/max(_LifeH,1.0)));
                albedo*=lerp(0.80, 1.25, topMask); // painted top light: the upper part of the wall catches the light
                float contact=saturate(i.world.y/_ContactHeight);
                float contactK=lerp(0.20, 1.0, contact*contact*(3-2*contact));
                albedo*=contactK;
                albedo*=1.0+(L3D_Fbm(i.world.xz/340.0)-0.5)*0.16;
                UNITY_LIGHT_ATTENUATION(shadow, i, i.world);
                float facing=saturate(nw.y);
                float toKey=saturate(dot(nw,_L3D_KeyDir.xyz)*1.3); // faces the key light: only the lit side of a ridge shines
                float heightMask=smoothstep(0.10,0.55,saturate(i.world.y/max(_LifeH,1.0)));
                float notRoot=(_Kind>0.5 ? 0.0 : 1.0);
                float crest=smoothstep(0.40,0.78,tx)*heightMask*toKey*notRoot;
                float tip=smoothstep(0.64,0.88,tx)*heightMask*toKey*notRoot;
                float lightOn=(0.35+0.65*shadow)*contactK;
                // SINEW-SHADE #5f4c55 patches (grey-mauve shade side, art bible 3) at low frequency, so the body is not one flat red
                float shadeN=smoothstep(0.55,0.78, L3D_Fbm(i.world.xz/240.0+i.world.y/170.0+11.0))*notRoot;
                albedo=lerp(albedo, L3D_DECODE(float3(0.373,0.298,0.333))*0.55*_L3D_MassTune.x, shadeN*0.55);
                albedo=lerp(albedo, L3D_DECODE(float3(0.541,0.416,0.322))*lightOn, saturate(crest*_L3D_MassTune.y)); // SINEW #8a6a52
                albedo=lerp(albedo, L3D_DECODE(float3(0.788,0.702,0.580))*lightOn, saturate(tip*_L3D_MassTune.z)); // BONE #c9b394
                float3 pools=L3D_PointLights(nw, i.world);
                float3 dyn=L3D_Lighting(nw, i.world, shadow)-pools;
                float3 dref=_L3D_PaintRef.a>0 ? max(_L3D_PaintRef.rgb, 0.02) : float3(1,1,1); float wdyn=_L3D_PaintRef.a>0 ? _L3D_PaintRef.a : 1.0;
                float3 color=albedo*(lerp(float3(1,1,1), dyn/dref, wdyn)+pools/dref*_L3D_Pool.z); // painted light 70% + dynamic 30%, pools at their own weight, as on the ground
                // wet flesh: long streak-shaped reflections in the colour of the light (key + the coloured pools x FLESH-WET #b06a5c), never grey or point-like (art bible 7)
                float3 vdir=normalize(_WorldSpaceCameraPos-i.world), hv=normalize(_L3D_KeyDir.xyz+vdir);
                float refl=pow(saturate(dot(nw,hv)), 18.0);
                float streak=smoothstep(0.60,0.78, L3D_Noise(float2(i.world.x/52.0+i.world.y/150.0, i.world.z/210.0+i.world.y/70.0)));
                float3 wetLight=_L3D_KeyCol.rgb*0.55+pools*1.2;
                color+=L3D_DECODE(float3(0.69,0.42,0.36))*wetLight*refl*streak*shadow*contactK*smoothstep(0.1,0.5,topMask+facing*0.3)*_L3D_MassTune.w*(_Kind>0.5 ? 0.35 : 1.0);
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
