// PC-MAP3D S2-1: real displaced ground (8px grid) with four material layers blended by height.
//  L0 floor_v01b (base) / L1 floor_v02b (dried blood zone) / L2 floor_v03b (root web zone) / L3 mass_v01 (outer transition).
//  Per layer: albedo (sRGB) + packed data texture nhr (R normal.x, G normal.y, B height, A roughness) -> see Tools/map3d/pack_ground_textures.py.
//  Splat mask (baked from SourceMap.CanMove + seeded noise, NativePerspectiveWorld.Slice.cs BuildMask): R signed distance to the walkable
//  boundary, G dried-blood zone weight, B root zone weight. Layer boundaries are a height blend (the layer with the higher height + weight wins),
//  not a linear fade.
//  Repetition hiding: domain-warped UVs (low-frequency noise), two scales (1.0x and 0.37x rotated 17 deg) mixed by a spatially varying factor,
//  +-8..10% world noise tint, original baked ground colour (macro texture) as regional tint, three zone layers of different pattern.
//  Roughness drives a weak key-light highlight (diffuse-dominant model); walkable displacement is +-1.5 px, the outskirts rise up to ~20 px.
//  Texture samples: vertex 3 (mask, 2 height); fragment 1 mask + 2 macro + albedo 7 (L0-L2 two scales, L3 one) + nhr 7 = 17.
Shader "EXODUSER/Look3DGroundLayered"
{
    Properties
    {
        _FloorAlb ("L0 floor_v01b albedo", 2D) = "gray" {}
        _FloorNhr ("L0 normal/height/roughness", 2D) = "gray" {}
        _BloodAlb ("L1 floor_v02b albedo", 2D) = "gray" {}
        _BloodNhr ("L1 nhr", 2D) = "gray" {}
        _RootAlb ("L2 floor_v03b albedo", 2D) = "gray" {}
        _RootNhr ("L2 nhr", 2D) = "gray" {}
        _MassAlb ("L3 mass_v01 albedo", 2D) = "gray" {}
        _MassNhr ("L3 nhr", 2D) = "gray" {}
        _MaskTex ("Splat mask (sd, blood, root)", 2D) = "white" {}
        _MacroTex ("Baked ground colour (mips)", 2D) = "gray" {}
        _MaskRect ("Region rect px (x,y,w,h)", Vector) = (0,0,1,1)
        _Tiles ("Tile px (floor layers, mass)", Vector) = (1250,700,0,0)
        _Disp ("Displacement px (walkable, wall)", Vector) = (3,18,0,0)
        _SDRange ("SD range px", Float) = 400
        _Debug ("Debug (0 off)", Float) = 0
        _DetailNormal ("GPT detail normal strength", Float) = 0.2
    }
    SubShader
    {
        CGINCLUDE
    #include "UnityCG.cginc"
    #include "AutoLight.cginc"
    #include "Look3DCommon.cginc"
    sampler2D _FloorAlb, _FloorNhr, _BloodAlb, _BloodNhr, _RootAlb, _RootNhr, _MassAlb, _MassNhr, _MaskTex, _MacroTex;
    float4 _MaskRect, _Tiles, _Disp; float _SDRange, _Debug, _DetailNormal;

    float SignedDistance(float2 px)
    {
        float2 reg=(px-_MaskRect.xy)/_MaskRect.zw;
        return (tex2Dlod(_MaskTex, float4(reg,0,0)).r*2-1)*_SDRange;
    }
    float2 Rot17(float2 p) { const float c=0.95630476, s=0.29237170; return float2(c*p.x-s*p.y, s*p.x+c*p.y); }


        float GroundDisplace(float2 px)
        {
            float sd=SignedDistance(px);
            float h0=tex2Dlod(_FloorNhr, float4(px/_Tiles.x,0,0)).b;
            float h1=tex2Dlod(_MassNhr, float4(px/_Tiles.y,0,0)).b;
            float wall=smoothstep(30,-70,sd);
            return lerp((h0-0.5)*_Disp.x+L3D_BumpH(px, sd), 2.0+h1*_Disp.y, wall);
        }
        ENDCG
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
            struct input { float4 vertex:POSITION; };
            struct output { float4 pos:SV_POSITION; float3 world:TEXCOORD0; SHADOW_COORDS(1) };
            output vert(input v)
            {
                output o;
                float3 w=mul(unity_ObjectToWorld, v.vertex).xyz;
                v.vertex.y += GroundDisplace(float2(w.x, -w.z));
                o.pos=UnityObjectToClipPos(v.vertex);
                o.world=mul(unity_ObjectToWorld, v.vertex).xyz;
                TRANSFER_SHADOW(o);
                return o;
            }

            float3 TangentToWorld(float3 t) { return float3(t.x, t.z, -t.y); } // T=east(+x), B=south(-z), N=up

            // PAINTGROUND: the GPT layers no longer contribute colour; they give the detail normal, roughness and the wall-transition weights only.
            struct Layer { float2 nrm; float h; float rough; };
            Layer SampleLayer(sampler2D nhr, float2 uvA, float2 uvB, float mixB)
            {
                Layer l;
                float4 dA=NoTileData(nhr,uvA);
                float4 dB=tex2D(nhr,uvB);
                l.nrm=(dA.xy*2-1)+(dB.xy*2-1)*0.6*mixB;
                l.h=lerp(dA.b, dB.b, mixB*0.5);
                l.rough=lerp(dA.a, dB.a, mixB*0.5);
                return l;
            }

            fixed4 frag(output i) : SV_Target
            {
                float2 px=float2(i.world.x, -i.world.z);
                float2 reg=(px-_MaskRect.xy)/_MaskRect.zw;
                float4 mask=tex2D(_MaskTex, reg);
                float sdRaw=(mask.r*2-1)*_SDRange;
                float sd=sdRaw+(L3D_Fbm(px/180.0)-0.5)*80.0;
                float wMass=smoothstep(120,-40,sd);
                float wBlood=smoothstep(0.38,0.62,mask.g+(L3D_Fbm(px/260.0+5.7)-0.5)*0.55)*(1-wMass);
                float wRoot=smoothstep(0.38,0.62,mask.b+(L3D_Fbm(px/210.0+13.1)-0.5)*0.55)*(1-wMass)*(1-wBlood*0.6);
                float wBase=saturate(1-wMass-wBlood-wRoot);

                // repetition hiding: domain warp + two scales mixed by a spatially varying factor
                float2 warp=float2(L3D_Fbm(px/310.0+3.3), L3D_Fbm(px/310.0+9.1))-0.5;
                float2 pw=px+warp*150.0;
                float mixB=0.22+0.38*L3D_Noise(px/800.0+21.0);
                float2 uvA=pw/_Tiles.x, uvB=Rot17(pw)/(_Tiles.x*0.2713);
                float2 uvM=pw/_Tiles.y, uvN=Rot17(pw)/(_Tiles.y*0.37);
                Layer l0=SampleLayer(_FloorNhr,uvA,uvB,mixB);
                Layer l1=SampleLayer(_BloodNhr,uvA*0.93+0.31,uvB*1.07+0.17,mixB);
                Layer l2=SampleLayer(_RootNhr,uvA*1.04+0.53,uvB*0.95+0.71,mixB);
                Layer l3=SampleLayer(_MassNhr,uvM,uvN,0.35);

                // height blend: the layer with the higher height (plus its splat weight) wins; crevices of the lower layer stay visible
                float a0=l0.h*0.55+wBase, a1=l1.h*0.55+wBlood, a2=l2.h*0.55+wRoot, a3=l3.h*0.55+wMass;
                float m=max(max(a0,a1),max(a2,a3))-0.17;
                float b0=max(a0-m,0), b1=max(a1-m,0), b2=max(a2-m,0), b3=max(a3-m,0);
                float inv=1.0/(b0+b1+b2+b3+1e-5); b0*=inv; b1*=inv; b2*=inv; b3*=inv;

                float2 nxy=(l0.nrm*b0+l1.nrm*b1+l2.nrm*b2+l3.nrm*b3*1.1)*_DetailNormal;
                float rough=l0.rough*b0+l1.rough*b1+l2.rough*b2+l3.rough*b3;
                float3 n=TangentToWorld(float3(nxy, 1.0));
                if(_L3D_Bump.x>0)
                {
                    const float e=24.0;
                    float dx=(L3D_BumpH(px+float2(e,0),sdRaw)-L3D_BumpH(px-float2(e,0),sdRaw))/(2*e), dy=(L3D_BumpH(px+float2(0,e),sdRaw)-L3D_BumpH(px-float2(0,e),sdRaw))/(2*e);
                    n+=float3(-dx*(1-wMass), 0, dy*(1-wMass))*0.35; // world z = -py; the undulation is mostly height, only a small normal share (wet-sand ripple otherwise)
                }
                n=normalize(n);

                // base colour = the original hand-painted chunks (64 chunks, identical in web / Godot / Unity), projected 1:1 (1 px = 1 texel = 1 unit) from the
                // pre-composited region texture; RT row 0 = north (image top)
                float2 macroUv=float2(reg.x, 1.0-reg.y);
                float3 paint=L3D_DECODE(tex2D(_MacroTex, macroUv).rgb);
                float3 albedo=paint*(_L3D_GroundTone.a>0 ? _L3D_GroundTone.rgb : float3(1,1,1)); // tone: colour turned towards oxblood at the same lightness (art bible 3)
                albedo*=lerp(0.55, 1.0, smoothstep(-30, 170, sdRaw)); // wall-base occlusion (the painted art already carries most of it)

                UNITY_LIGHT_ATTENUATION(shadow, i, i.world);
                float gobo=L3D_Gobo(px); shadow*=gobo; // MAP3D-LIFE1 L3: moving canopy shadow on the key light
                float3 pools=L3D_PointLights(n, i.world);
                float3 dyn=L3D_Lighting(n, i.world, shadow)-pools;
                // painted light 70% + dynamic light 30%: dynamic / reference (the level that leaves the paint unchanged) is blended in with weight 0.3
                float3 dref=_L3D_PaintRef.a>0 ? max(_L3D_PaintRef.rgb, 0.02) : float3(1,1,1); float wdyn=_L3D_PaintRef.a>0 ? _L3D_PaintRef.a : 1.0;
                float3 lit=lerp(float3(1,1,1), dyn/dref, wdyn)+pools/dref*_L3D_Pool.z; // the coloured pools keep their own weight (light rhythm, art bible 7.2)
                lit*=lerp(1.0, gobo, 0.6); // canopy shade also reads in the painted share (rhythm of light and shade, art bible 7.2)
                float3 color=albedo*lit;
                // wetness: pools and wall bases are wet (low roughness), the centre is damp semi-matte; the highlight is tinted warm-red, never grey
                float wet=saturate(L3D_PoolLum(i.world)*0.9+(1.0-smoothstep(0.0, 90.0, sdRaw))*0.45);
                float roughW=lerp(0.72, 0.22, wet)+(rough-0.85)*0.3;
                color+=L3D_Spec(n, i.world, saturate((0.95-roughW)/0.27), shadow)*float3(1.0,0.50,0.40)*(0.10+0.30*wet);
                color=L3D_Fog(color, i.world);
                float3 rgb=L3D_ENCODE(color);
                if(_Debug>0.5 && _Debug<1.5) rgb=L3D_ENCODE(L3D_DECODE(tex2D(_MacroTex, float2(reg.x,1.0-reg.y)).rgb));
                if(_Debug>1.5 && _Debug<2.5) rgb=float3(saturate(sdRaw/_SDRange*0.5+0.5), saturate(wMass), 0);
                if(_Debug>2.5) rgb=float3(wBlood, wRoot, wMass);
                return fixed4(rgb, 1);
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
            struct vInput { float4 vertex:POSITION; float3 normal:NORMAL; };
            struct vOutput { V2F_SHADOW_CASTER; };
            vOutput vertShadow(vInput v)
            {
                vOutput o;
                float3 w=mul(unity_ObjectToWorld, v.vertex).xyz;
                v.vertex.y += GroundDisplace(float2(w.x, -w.z));
                v.normal=float3(0,1,0);
                TRANSFER_SHADOW_CASTER_NORMALOFFSET(o)
                return o;
            }
            float4 fragShadow(vOutput i) : SV_Target { SHADOW_CASTER_FRAGMENT(i) }
            ENDCG
        }
    }
}
