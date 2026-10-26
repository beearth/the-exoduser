Shader "EXODUSER/SourceFieldLighting"
{
    Properties { _MainTex ("World camera", 2D) = "white" {} }
    SubShader
    {
        Cull Off ZWrite Off ZTest Always
        CGINCLUDE
        #include "UnityCG.cginc"
        sampler2D _MainTex, _Darkness, _ColorMap, _HoleStamps, _ColorStamps, _PetFlame, _BloomMap, _PetHaloMap;
        float4 _MainTex_TexelSize;
        float2 _ScreenPx;
        float4 _Lights[14], _HoleRects[14], _ColorRects[14];
        float4 _PetSprite, _BloomShift;
        float _PetEnabled;
        float _FogPulse, _FogTime, _DomFogEnabled;

        float2 stampPoint(float2 px, float4 light)
        {
            return (px-light.xy)/(light.z*2)+.5;
        }

        float2 screenPoint(float2 uv) { return float2(uv.x,1-uv.y) * _ScreenPx; }

        float4 darknessFragment(v2f_img i) : SV_Target
        {
            float2 px = screenPoint(i.uv);
            float alpha = .38;
            [unroll] for (int n=0; n<14; n++)
            {
                float4 l = _Lights[n];
                float2 uv=stampPoint(px,l);
                if (l.w>0 && all(uv>=0) && all(uv<=1))
                {
                    float4 rect=_HoleRects[n];
                    alpha *= 1-saturate(l.w * tex2D(_HoleStamps,rect.xy+uv*rect.zw).a);
                }
            }
            // destination-out removes alpha AND premultiplied RGB from the ambient canvas.
            return float4(float3(6,16,9)/255 * alpha,alpha);
        }

        float4 colorFragment(v2f_img i) : SV_Target
        {
            float2 px = screenPoint(i.uv);
            float4 color = 0;
            [unroll] for (int n=1; n<14; n++)
            {
                float4 l = _Lights[n];
                float2 uv=stampPoint(px,l);
                if (l.w>0 && all(uv>=0) && all(uv<=1))
                {
                    float4 rect=_ColorRects[n];
                    color += tex2D(_ColorStamps,rect.xy+uv*rect.zw) * saturate(l.w*.85);
                }
            }
            // The OFFSCREEN Canvas2D is lighter, but final world composition is source-over.
            return saturate(color);
        }

        float fogHash(float2 p) { return frac(sin(dot(p,float2(127.1,311.7)))*43758.5453); }
        float fogNoise(float2 p)
        {
            float2 cell=floor(p), f=frac(p); f=f*f*(3-2*f);
            return lerp(lerp(fogHash(cell),fogHash(cell+float2(1,0)),f.x),
                lerp(fogHash(cell+float2(0,1)),fogHash(cell+float2(1,1)),f.x),f.y);
        }
        float fbm(float2 p)
        {
            float value=0, a=.5;
            [unroll] for (int n=0; n<5; n++) { value+=a*fogNoise(p); p*=2; a*=.5; }
            return value;
        }

        float3 over(float3 background, float3 rgb, float alpha) { return background*(1-alpha)+rgb*alpha; }

        float3 sourceWorld(v2f_img i)
        {
            float2 sourceUV=i.uv;
            #if UNITY_UV_STARTS_AT_TOP
            if (_MainTex_TexelSize.y < 0) sourceUV.y=1-sourceUV.y;
            #endif
            return tex2D(_MainTex,sourceUV).rgb;
        }
        float4 litFragment(v2f_img i) : SV_Target
        {
            float3 world=sourceWorld(i);
            float4 dark=tex2D(_Darkness,i.uv), color=tex2D(_ColorMap,i.uv);
            world=world*(1-dark.a)+dark.rgb;
            // 55201 / LIT_COL_MIX=.62: source-over of accumulated premultiplied color.
            world=world*(1-color.a*.62)+color.rgb*.62;
            return float4(world,1);
        }
        float4 bloomFragment(v2f_img i) : SV_Target {return float4(sourceWorld(i)*(60.0/255),1);}
        float4 bloomCopyFragment(v2f_img i) : SV_Target
        {
            float2 shifted=i.uv+_BloomShift.xy;
            float weight=all(shifted>=0)&&all(shifted<=1)?.18:0;
            return float4(lerp(tex2D(_MainTex,i.uv).rgb,tex2D(_MainTex,shifted).rgb,weight),1);
        }
        float4 compositeFragment(v2f_img i) : SV_Target
        {
            float3 world=sourceWorld(i);
            if(_PetEnabled>.5){
                world=saturate(world+tex2D(_BloomMap,i.uv).rgb*.08);
                // Source25504 / 55290-55318: blue halo, lighter, r=irisGlow*.6=150.
                float2 px=screenPoint(i.uv), local=px-_PetSprite.xy;
                float2 haloUV=local/300+.5;
                float4 halo=tex2D(_PetHaloMap,haloUV);
                if(any(haloUV<0)||any(haloUV>1))halo=0;
                world=saturate(world+halo.rgb*_PetSprite.w*.7);
                float2 uv=float2(local.x/_PetSprite.z+.5,1-(local.y/_PetSprite.z+.7));
                if(all(uv>=0)&&all(uv<=1)){
                    float4 flame=tex2D(_PetFlame,uv);world=over(world,flame.rgb,flame.a*_PetSprite.w);
                }
            }

            // _bakeFogLayers 4366 and merged 55361: bottom, then top at .6, pulse in ms.
            float y=1-i.uv.y;
            float bottom=.12*saturate((y-.6)/(.4*.3));
            float top=.06*saturate(1-y/.3)*.6;
            world=over(world,float3(60,90,120)/255,bottom*_FogPulse);
            world=over(world,float3(40,60,90)/255,top*_FogPulse);
            // 55377 then 55389: environmental overlay, dynamic field vignette.
            world=over(world,float3(100,160,255)/255,.06);
            float d=distance(screenPoint(i.uv),_ScreenPx*.5);
            float v=saturate((d-_ScreenPx.x*.35)/(_ScreenPx.x*.35));
            float va=v<.7 ? lerp(0,.05,v/.7) : lerp(.05,.15,(v-.7)/.3);
            world=over(world,float3(20,60,120)/255,va*.2);
            // Canvas CSS filter 55414-55419. This is before the separate DOM fog canvas.
            world=saturate(((world-.5)*1.05+.5)*.97);

            // Source9072 disables this canvas on Mac WebGPU. Keep its port/gate explicit.
            if (_DomFogEnabled > .5)
            {
                float2 uv=i.uv;
                float ar=_ScreenPx.x/_ScreenPx.y, t=_FogTime;
                float f1=fbm(float2(uv.x*ar*3+t*.06,uv.y*3+t*.02));
                float f2=fbm(float2(uv.x*ar*2-t*.04,uv.y*2+sin(t*.1)*.3));
                float f3=fbm(float2(uv.x*ar*5+t*.08,uv.y*4-t*.03));
                float fog=smoothstep(.15,.85,f1*.5+f2*.35+f3*.15);
                float radial=length((uv-.5)*float2(ar,1));
                fog*=lerp(.50,1,smoothstep(0,.62,radial));
                float alpha=fog*.41;
                // THREE first writes rgb*alpha to transparent FBO; DOM then uses straight alpha.
                world=over(world,float3(.10,.18,.08)*fog*.8*alpha,alpha);
            }
            return float4(world,1);
        }
        ENDCG
        Pass
        {
            CGPROGRAM
            #pragma target 3.5
            #pragma vertex vert_img
            #pragma fragment darknessFragment
            ENDCG
        }
        Pass
        {
            CGPROGRAM
            #pragma target 3.5
            #pragma vertex vert_img
            #pragma fragment colorFragment
            ENDCG
        }
        Pass
        {
            CGPROGRAM
            #pragma target 3.5
            #pragma vertex vert_img
            #pragma fragment compositeFragment
            ENDCG
        }
        Pass
        {
            CGPROGRAM
            #pragma target 3.5
            #pragma vertex vert_img
            #pragma fragment litFragment
            ENDCG
        }
        Pass
        {
            CGPROGRAM
            #pragma target 3.5
            #pragma vertex vert_img
            #pragma fragment bloomFragment
            ENDCG
        }
        Pass
        {
            CGPROGRAM
            #pragma target 3.5
            #pragma vertex vert_img
            #pragma fragment bloomCopyFragment
            ENDCG
        }
    }
    Fallback Off
}
