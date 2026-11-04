Shader "EXODUSER/HudPrototypeC"
{
    Properties
    {
        _MainTex ("Existing ornament artwork", 2D) = "white" {}
        _Mode ("HP / MP-ST / silver original art", Float) = 0
        _Diameter ("Liquid design diameter", Float) = 156
        _HpTranslate ("Existing HP display translation", Float) = .1
        _Hurt ("Existing hurt flash", Float) = 0
        _Mana ("MP ratio", Float) = 1
        _Stamina ("ST ratio", Float) = 1
        _UvRect ("Original artwork crop UV", Vector) = (0,0,1,1)
        _Flip ("Mirror crop horizontally", Float) = 0
        _FadeRight ("Fade cropped right edge", Float) = 0
        _FadeBottom ("Fade cropped bottom edge", Float) = 0
        _FrameAperture ("Full original frame aperture only", Float) = 0
    }
    SubShader
    {
        Cull Off ZWrite Off ZTest Always
        Pass
        {
            CGPROGRAM
            #pragma vertex vert_img
            #pragma fragment frag
            #include "UnityCG.cginc"
            sampler2D _MainTex;
            float _Mode,_Diameter,_HpTranslate,_Hurt,_Mana,_Stamina,_Flip,_FadeRight,_FadeBottom;
            float4 _UvRect;
            float _FrameAperture;
            // Design constants must not become unbound external uniforms on FXC/HLSLcc (Metal).
            static const float SurfaceSoftPixels=2;
            static const float SurfaceWavePixels=1;
            float3 rgb(float r,float g,float b){return float3(r,g,b)/255;}
            float linearChannel(float c){return c<=.04045?c/12.92:pow((c+.055)/1.055,2.4);}
            float4 outputColor(float4 c)
            {
                #ifndef UNITY_COLORSPACE_GAMMA
                // C CPU artwork stores decoded token values in sRGB Texture2D bytes for IMGUI.
                // The explicit sRGB RT write encodes once: E(D(D(token))) = D(token), matching that storage.
                c.rgb=float3(linearChannel(linearChannel(c.r)),linearChannel(linearChannel(c.g)),linearChannel(linearChannel(c.b)));
                #endif
                return c;
            }
            float3 silver(float l)
            {
                // Raw sRGB source luminance preserves dark sculpted detail; no clipped contrast floor.
                // Knots follow the existing frame's source range, using only Silver Hell iron/steel tokens.
                float y=saturate(l)*255;
                return y<10?lerp(rgb(15,15,16),rgb(44,46,49),y/10):
                    y<36?lerp(rgb(44,46,49),rgb(79,83,82),(y-10)/26):
                    y<69?lerp(rgb(79,83,82),rgb(138,139,136),(y-36)/33):
                    y<163?lerp(rgb(138,139,136),rgb(201,199,195),(y-69)/94):
                    lerp(rgb(201,199,195),rgb(246,245,242),(y-163)/92);
            }
            float matteAlpha(float l,float chroma,float sourceAlpha)
            {
                // Suppress bright neutral partial-alpha matte, without promoting opacity or eroding neighbors.
                // Opaque highlights and dark sculpted translucent edges remain unchanged.
                float matte=smoothstep(.45,.75,l)*(1-smoothstep(.65,.98,sourceAlpha))*(1-smoothstep(.025,.08,chroma));
                return sourceAlpha*(1-matte);
            }
            float frameApertureCoverage(float2 uv,float sourceAlpha,float l)
            {
                if(_FrameAperture<.5)return 1;
                // Original full frame is registered to 263 logical px. The existing shield/mobility
                // ring has center (48+11+153/2,44+18.65+153/2) and inner radius 71.5.
                float x=uv.x*263-135.5,y=(1-uv.y)*263-139.15;
                float r=sqrt(x*x+y*y),inside=1-smoothstep(71.5,73.5,r);
                // Keep opaque fangs and dark antialiased sculpture; suppress bright partial-alpha
                // original-art residue inside the opening without moving the liquid or its surface.
                float preserve=max(1-smoothstep(.25,.45,l),smoothstep(.90,.98,sourceAlpha));
                return lerp(1,preserve,inside);
            }
            float3 mpGradient(float h)
            {
                return h<.45?lerp(rgb(22,33,46),rgb(59,95,134),h/.45):
                    lerp(rgb(59,95,134),rgb(127,156,188),saturate((h-.45)/.35));
            }
            float frameOuterCoverage(float2 uv,float filteredAlpha,float l)
            {
                if(_FrameAperture<.5)return 1;
                float x=uv.x*263-135.5,y=(1-uv.y)*263-139.15;
                float r=sqrt(x*x+y*y),outside=smoothstep(73.5,75.5,r);
                // Apply to post-matte alpha: raw artwork alpha can be high in the faint fringe.
                // .08-only removal leaves disconnected islands; .16..24 clears them continuously.
                // Preserve dark sculpted AA, accepted inner aperture, and stronger metal coverage.
                float preserve=max(1-smoothstep(.20,.30,l),smoothstep(.16,.24,filteredAlpha));
                return lerp(1,preserve,outside);
            }
            float3 stGradient(float h)
            {
                // U1 Silver Hell candidate verdigris; deliberately distinct from blue MP, never primary green.
                return h<.45?lerp(rgb(18,32,25),rgb(62,94,74),h/.45):
                    lerp(rgb(62,94,74),rgb(122,150,128),saturate((h-.45)/.35));
            }
            float surfaceCoverage(float2 uv,float fill)
            {
                if(fill<=0)return 0;
                if(fill>=1)return 1;
                float wave=sin((uv.x-.5)*6.283185307)*SurfaceWavePixels/_Diameter;
                float curve=(uv.x-.5)*(uv.x-.5)*2*SurfaceWavePixels/_Diameter;
                float halfSoft=SurfaceSoftPixels/_Diameter;
                return 1-smoothstep(fill+wave-curve-halfSoft,fill+wave-curve+halfSoft,uv.y);
            }
            float3 emptyBowlColor(){return rgb(22,28,34);}
            float meniscusCoverage(float2 uv,float fill)
            {
                if(fill<=0||fill>=1)return 0;
                // Match the accepted liquid surface; 1 design-pixel FWHM/integral, smooth AA shoulders.
                float wave=sin((uv.x-.5)*6.283185307)*SurfaceWavePixels/_Diameter;
                float curve=(uv.x-.5)*(uv.x-.5)*2*SurfaceWavePixels/_Diameter;
                float distance=abs((uv.y-fill-wave+curve)*_Diameter);
                return 1-smoothstep(0,1,distance);
            }
            float3 meniscusColor(bool hp,bool mp)
            {
                // Tinted liquid edges, not a white specular line.
                return hp?rgb(138,74,84):(mp?rgb(150,170,188):rgb(142,164,148));
            }
            float4 frag(v2f_img i):SV_Target
            {
                if(_Mode>1.5){
                    float2 local=i.uv;if(_Flip>.5)local.x=1-local.x;
                    float2 uv=_UvRect.xy+local*_UvRect.zw;
                    float4 art=tex2D(_MainTex,uv);
                    float sourceAlpha=art.a;
                    #ifndef UNITY_COLORSPACE_GAMMA
                    art.rgb=LinearToGammaSpace(art.rgb);
                    #endif
                    float l=dot(art.rgb,float3(.2126,.7152,.0722));
                    float chroma=max(art.r,max(art.g,art.b))-min(art.r,min(art.g,art.b));
                    art.a=matteAlpha(l,chroma,art.a);
                    art.a*=frameApertureCoverage(uv,sourceAlpha,l);
                    art.a*=frameOuterCoverage(uv,art.a,l);
                    float fadeRight=_FadeRight>0?saturate((1-local.x)/_FadeRight):1;
                    float fadeBottom=_FadeBottom>0?saturate(local.y/_FadeBottom):1;
                    return outputColor(float4(silver(l),art.a*fadeRight*fadeBottom));
                }
                float2 d=i.uv-.5;float r=length(d),edge=saturate((.5-r)*_Diameter+.5);
                // Opaque dark glass blocks scenery in the unfilled HP/MP/ST interior; the circular edge still antialiases.
                float radial=smoothstep(.22,.5,r);
                float3 bowl=emptyBowlColor();
                bool hp=_Mode<.5,mp=i.uv.x<.5;
                float fill=hp?saturate(1-_HpTranslate):saturate(mp?_Mana:_Stamina);
                float wet=surfaceCoverage(i.uv,fill);
                float3 liquid;
                if(hp){
                    // Preserve the existing HP display projection and its wine palette.
                    float depth=length(float2(d.x*.70710678,(1-i.uv.y-_HpTranslate-.4)*1.1785113));
                    liquid=depth<.5?lerp(rgb(107,16,32),rgb(61,10,18),depth*2):
                        lerp(rgb(61,10,18),rgb(30,5,10),saturate((depth-.5)*2));
                }else{
                    float h=saturate(i.uv.y/max(fill,.0001));liquid=mp?mpGradient(h):stGradient(h);
                    // Preserve the accepted resource liquid's soft top, now over opaque glass.
                    wet*=lerp(1,.50,smoothstep(.82,1,h));
                }
                liquid*=1-.30*radial;
                // Empty and filled interiors are opaque. Neither RGB nor alpha relies on a material default.
                float3 color=lerp(bowl,liquid,wet);
                float rim=meniscusCoverage(i.uv,fill);
                color=lerp(color,meniscusColor(hp,mp),rim);
                if(hp&&_Hurt>0)color=lerp(color,rgb(194,26,16),saturate(1-(.5-r)*_Diameter/22)*.85);
                return outputColor(float4(color,edge));
            }
            ENDCG
        }
    }
}
