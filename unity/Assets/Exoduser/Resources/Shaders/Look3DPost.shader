// PC-MAP3D stage 2 post: Godot LOOK-001 D environment glow + colour adjustment (look_3d_variant.gd:127-136).
//  glow: intensity .20, bloom .025, HDR threshold .82, Compatibility "simplified SCREEN" glow (stage-2 implementation: quarter-res
//        prefilter = max(c-threshold,0) + c*bloom, separable 9-tap blur, screen blend);
//  adjustment: brightness 1.02, contrast 1.06, saturation .86 applied after the sRGB conversion, as Godot's tonemap pass does
//        (brightness: c*b; contrast: mix(.5,c,k); saturation: mix(dot(1,c)/3,c,s)).
Shader "EXODUSER/Look3DPost"
{
    Properties { _MainTex ("Source", 2D) = "white" {} }
    CGINCLUDE
    #include "UnityCG.cginc"
    sampler2D _MainTex, _GlowTex; float4 _MainTex_TexelSize;
    float4 _GlowParams;  // x intensity, y bloom, z threshold, w unused
    float4 _BcsParams;   // x brightness, y contrast, z saturation
    float4 _VigParams;   // x edge darkening, y inner radius, z centre lift (all 0 = off)
    float2 _BlurDirection;
    struct input { float4 vertex:POSITION; float2 uv:TEXCOORD0; };
    struct output { float4 pos:SV_POSITION; float2 uv:TEXCOORD0; };
    output vert(input v) { output o; o.pos=UnityObjectToClipPos(v.vertex); o.uv=v.uv; return o; }
    float3 ToLinear(float3 c) { return lerp(c/12.92, pow((c+0.055)/1.055, 2.4), step(0.04045, c)); }
    float3 ToSrgb(float3 c) { c=saturate(c); return lerp(c*12.92, 1.055*pow(c, 1.0/2.4)-0.055, step(0.0031308, c)); }
    #if defined(UNITY_COLORSPACE_GAMMA)
    #define DECODE(c) ToLinear(c)
    #define ENCODE(c) ToSrgb(c)
    #else
    #define DECODE(c) (c)
    #define ENCODE(c) saturate(c)
    #endif
    ENDCG
    SubShader
    {
        Cull Off ZWrite Off ZTest Always
        Pass // 0: prefilter
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            fixed4 frag(output i) : SV_Target
            {
                float3 c=DECODE(tex2D(_MainTex, i.uv).rgb);
                return fixed4(max(c-_GlowParams.z, 0)+c*_GlowParams.y, 1);
            }
            ENDCG
        }
        Pass // 1: blur (direction in texels)
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            fixed4 frag(output i) : SV_Target
            {
                float w[5]={0.2270270270, 0.1945945946, 0.1216216216, 0.0540540541, 0.0162162162};
                float2 stride=_BlurDirection*_MainTex_TexelSize.xy;
                float3 sum=tex2D(_MainTex, i.uv).rgb*w[0];
                [unroll] for(int k=1;k<5;k++) sum+=(tex2D(_MainTex, i.uv+stride*k).rgb+tex2D(_MainTex, i.uv-stride*k).rgb)*w[k];
                return fixed4(sum, 1);
            }
            ENDCG
        }
        Pass // 2: composite glow (screen) + brightness/contrast/saturation
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            fixed4 frag(output i) : SV_Target
            {
                float3 c=DECODE(tex2D(_MainTex, i.uv).rgb);
                float3 glow=saturate(tex2D(_GlowTex, i.uv).rgb*_GlowParams.x);
                c=1-(1-saturate(c))*(1-glow); // SCREEN
                float3 s=ToSrgb(c);
                s*=_BcsParams.x;
                s=lerp(float3(0.5,0.5,0.5), s, _BcsParams.y);
                s=lerp(dot(float3(1,1,1), s)*0.33333, s, _BcsParams.z);
                float2 vc=(i.uv-0.5)*float2(1.25,1.0); float vd=length(vc);
                s*=1-_VigParams.x*smoothstep(_VigParams.y, 0.80, vd);
                s*=1+_VigParams.z*(1-smoothstep(0.0, 0.45, vd));
                s=saturate(s);
                #if defined(UNITY_COLORSPACE_GAMMA)
                return fixed4(s, 1);
                #else
                return fixed4(ToLinear(s), 1);
                #endif
            }
            ENDCG
        }
    }
}
