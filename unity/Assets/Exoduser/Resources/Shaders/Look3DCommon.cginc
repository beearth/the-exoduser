// PC-MAP3D shared lighting for the layered ground and procedural mass shaders (same model as Look3DLit.shader).
// diffuse = albedo * (ambient + key*N.L*shadow + fill*N.L + field point lights), exp distance fog, sRGB encode in a Gamma project.
#ifndef LOOK3D_COMMON_INCLUDED
#define LOOK3D_COMMON_INCLUDED
float4 _L3D_KeyDir, _L3D_KeyCol, _L3D_FillDir, _L3D_FillCol, _L3D_Ambient;
float4 _L3D_Fog, _L3D_FogCol;
float4 _L3D_PtPos[16];
float4 _L3D_PtCol[16];
float _L3D_PtCount;
sampler2D _L3D_MaskTex; float4 _L3D_MaskRect; // slice splat mask (R = signed distance / SDRange*.5+.5) and its world rect
float4 _L3D_Bump;  // x amplitude px (0 = off), y wavelength px, z/w fade-in distance from the focus (player keeps flat ground)
float4 _L3D_Focus; // xy focus px
float4 _L3D_GroundTone; // slice: rgb linear multiplier on the floor albedo (a = 0: unset -> 0.85)
float4 _L3D_PaintRef; // PAINTGROUND: rgb = dynamic lighting level that leaves the painted ground unchanged (a = 0: unset); a = dynamic weight (0.3)
float4 _L3D_Pool;   // slice grade: x point gain (0 = 1), y wrap (0..1): light pools read on the floor, z pool weight on the painted ground, w floor level outside the pools (0 = off) (PAINTGROUND-R)
float4 _L3D_PaintShadow; // PAINTGROUND-R: x = weight of the key shadow (player / props / masses) on the painted 70% share (0 = off)
float4 _L3D_MassTune; // PAINTGROUND-R: outer flesh mass x body level, y sinew crest, z bone tip, w wet reflection
float4 _L3D_Fog2, _L3D_Fog2Col; // slice atmosphere: x density, y start distance, z height falloff (0 = off); rgb haze, a strength

float3 L3D_SrgbToLinear(float3 c) { return lerp(c/12.92, pow((c+0.055)/1.055, 2.4), step(0.04045, c)); }
float3 L3D_LinearToSrgb(float3 c) { c=saturate(c); return lerp(c*12.92, 1.055*pow(c, 1.0/2.4)-0.055, step(0.0031308, c)); }
#if defined(UNITY_COLORSPACE_GAMMA)
#define L3D_DECODE(c) L3D_SrgbToLinear(c)
#define L3D_ENCODE(c) L3D_LinearToSrgb(c)
#else
#define L3D_DECODE(c) (c)
#define L3D_ENCODE(c) saturate(c)
#endif

float3 L3D_Stamp(float3 c, float t)
{
    float3 a=c*.95, b=c*.52;
    float3 cc=floor(c*255*float3(.7,.6,.5))/255*.20, d=floor(c*255*float3(.4,.3,.2))/255*.05;
    return t<.28 ? lerp(a,b,t/.28) : t<.58 ? lerp(b,cc,(t-.28)/.30) : t<.82 ? lerp(cc,d,(t-.58)/.24) : lerp(d,0,saturate((t-.82)/.18));
}

// the field point lights alone (the coloured pools)
float3 L3D_PointLights(float3 n, float3 world)
{
    float3 lit=0;
    [loop] for(int k=0;k<16;k++)
    {
        if(k>=(int)_L3D_PtCount) break;
        float3 toLight=_L3D_PtPos[k].xyz-world;
        float horizontal=length(toLight.xz)/_L3D_PtPos[k].w;
        if(horizontal>=1) continue;
        float3 stamp=L3D_DECODE(L3D_Stamp(_L3D_PtCol[k].rgb, horizontal))*_L3D_PtCol[k].a;
        float ndl=saturate(dot(n, normalize(toLight)));
        lit+=stamp*lerp(ndl, 1, _L3D_Pool.y)*(_L3D_Pool.x>0 ? _L3D_Pool.x : 1);
    }
    return lit;
}

float3 L3D_Lighting(float3 n, float3 world, float shadow)
{
    return _L3D_Ambient.rgb
        + _L3D_KeyCol.rgb*saturate(dot(n, _L3D_KeyDir.xyz))*shadow
        + _L3D_FillCol.rgb*saturate(dot(n, _L3D_FillDir.xyz))
        + L3D_PointLights(n, world);
}

float3 L3D_Spec(float3 n, float3 world, float smooth01, float shadow)
{
    float3 v=normalize(_WorldSpaceCameraPos-world), h=normalize(_L3D_KeyDir.xyz+v);
    float s=pow(saturate(dot(n,h)), lerp(10.0, 70.0, smooth01));
    return _L3D_KeyCol.rgb*s*smooth01*0.30*shadow*saturate(dot(n,_L3D_KeyDir.xyz)*3.0);
}

float3 L3D_Fog(float3 color, float3 world)
{
    float dist=length(_WorldSpaceCameraPos-world);
    float fog=1-exp(-_L3D_Fog.x*dist);
    float3 c=lerp(color, _L3D_FogCol.rgb*_L3D_Fog.y, fog);
    if(_L3D_Fog2.x>0)
    {
        float f2=(1-exp(-_L3D_Fog2.x*max(dist-_L3D_Fog2.y,0)))*exp(-max(world.y,0)*_L3D_Fog2.z);
        c=lerp(c, _L3D_Fog2Col.rgb, saturate(f2*_L3D_Fog2Col.a));
    }
    return c;
}

float L3D_Hash(float2 p) { p=frac(p*float2(123.34,456.21)); p+=dot(p,p+45.32); return frac(p.x*p.y); }
float L3D_Noise(float2 p)
{
    float2 i=floor(p), f=frac(p); f=f*f*(3-2*f);
    return lerp(lerp(L3D_Hash(i),L3D_Hash(i+float2(1,0)),f.x), lerp(L3D_Hash(i+float2(0,1)),L3D_Hash(i+float2(1,1)),f.x), f.y);
}
float L3D_Fbm(float2 p) { return L3D_Noise(p)*.5+L3D_Noise(p*2.13+7.3)*.3+L3D_Noise(p*4.31+3.1)*.2; }
// gentle low-frequency undulation of the walkable floor (render only; no collision), faded to 0 at the outskirt boundary and around the focus
float L3D_BumpH(float2 px, float sdRaw)
{
    if(_L3D_Bump.x<=0) return 0;
    float h=(L3D_Fbm(px/_L3D_Bump.y+31.0)-0.5)*_L3D_Bump.x;
    return h*smoothstep(30,170,sdRaw)*smoothstep(_L3D_Bump.z,_L3D_Bump.w,length(px-_L3D_Focus.xy));
}
// Data-only variant (normal/height/roughness pack, no albedo): same region offsets as NoTile, plain smoothstep cross-fade.
float4 NoTileData(sampler2D nhr, float2 uv)
{
    float k=L3D_Noise(uv*0.37+17.0)*0.999;
    float l=k*8.0, f=frac(l), ia=floor(l+0.5), ib=floor(l);
    f=min(f,1.0-f)*2.0;
    float2 offa=sin(float2(3.0,7.0)*ia), offb=sin(float2(3.0,7.0)*ib);
    float2 dx=ddx(uv), dy=ddy(uv);
    return lerp(tex2Dgrad(nhr,uv+offa,dx,dy), tex2Dgrad(nhr,uv+offb,dx,dy), smoothstep(0.2,0.8,f));
}
// Sum of the point-light pool falloffs at a world position (unitless, ~0..1+): used as a wetness mask on the floor.
float L3D_PoolLum(float3 world)
{
    float s=0;
    [loop] for(int k=0;k<16;k++)
    {
        if(k>=(int)_L3D_PtCount) break;
        float hz=length(_L3D_PtPos[k].xz-world.xz)/_L3D_PtPos[k].w;
        if(hz<1) s+=pow(1.0-hz,1.4)*_L3D_PtCol[k].a;
    }
    return s;
}
float L3D_SdAt(float2 px) { return (tex2Dlod(_L3D_MaskTex, float4((px-_L3D_MaskRect.xy)/_L3D_MaskRect.zw,0,0)).r*2-1)*400.0; }

// Anti-tiling (iq 'texture repetition' method 1): a low-frequency value noise picks one of 8 random UV offsets per region; neighbouring
// regions cross-fade where the index changes. Gradients are taken from the unshifted uv so mip selection stays stable.
void NoTile(sampler2D alb, sampler2D nhr, float2 uv, out float3 a, out float4 d)
{
    float k=L3D_Noise(uv*0.37+17.0)*0.999;
    float l=k*8.0, f=frac(l), ia=floor(l+0.5), ib=floor(l);
    f=min(f,1.0-f)*2.0;
    float2 offa=sin(float2(3.0,7.0)*ia), offb=sin(float2(3.0,7.0)*ib);
    float2 dx=ddx(uv), dy=ddy(uv);
    float4 ca=tex2Dgrad(alb,uv+offa,dx,dy), cb=tex2Dgrad(alb,uv+offb,dx,dy);
    float4 da=tex2Dgrad(nhr,uv+offa,dx,dy), db=tex2Dgrad(nhr,uv+offb,dx,dy);
    float t=smoothstep(0.2,0.8,f-0.1*dot(ca-cb,float4(1,1,1,0)));
    a=lerp(ca.rgb,cb.rgb,t); d=lerp(da,db,t);
}



// ---- MAP3D-LIFE1 (wind / player push / moving gobo shadow); all off (zero) unless the slice sets the globals ----
float4 _L3D_Life;          // x = life time in seconds (script driven: deterministic captures)
float4 _L3D_Trail[8];      // xy = px position, z = strength 0..1 (current position = 1, older samples decay), w = push radius px
sampler2D _L3D_Gobo0, _L3D_Gobo1; float4 _L3D_GoboParams; // x strength (0 = off), y/z world px per gobo tile
// Wind: two frequencies (big sway + tip flutter), world-noise gusts and wind direction, per-individual phase/speed through `seed` (0..1).
// h = height mask (0 root fixed .. 1 tip); returns a world-space offset (x, y, z) in px.
float3 L3D_WindOffset(float2 originPx, float2 posPx, float h, float seed, float amp)
{
    float t=_L3D_Life.x;
    float gust=L3D_Noise(originPx/380.0+t*float2(0.06,0.025));
    float ang=0.55+(L3D_Noise(originPx/760.0+5.0)-0.5)*1.4;
    float2 dir=float2(cos(ang), sin(ang));
    float s1=0.85+0.6*frac(seed*7.31), s2=4.2+2.4*frac(seed*3.77);
    float big=sin(t*s1+dot(originPx,float2(0.012,0.008))+seed*6.2832);
    float flutter=sin(t*s2+dot(posPx,float2(0.09,0.07))+seed*21.0+h*5.0);
    float2 d=dir*(big*(0.3+0.7*gust)*amp*h*h+flutter*0.16*amp*h);
    return float3(d.x, -(abs(d.x)+abs(d.y))*0.12*h, -d.y); // px y -> world -z
}
// Player push: tips are pushed away from the player (and its recent positions, which fade) and bent down.
float3 L3D_TrailPush(float2 originPx, float h, float tuftHeight)
{
    float2 push=0; float down=0;
    [unroll] for(int k=0;k<8;k++)
    {
        float4 tr=_L3D_Trail[k]; if(tr.z<=0.001) continue;
        float2 dlt=originPx-tr.xy; float d=length(dlt)+0.001;
        float f=smoothstep(tr.w, 0.0, d)*tr.z; push+=dlt/d*f; down+=f;
    }
    float m=length(push); if(m>1.0) push/=m; down=saturate(down);
    float2 disp=push*h*h*tuftHeight*1.0;
    return float3(disp.x, -down*h*h*tuftHeight*0.5, -disp.y);
}
// Moving gobo: two root/branch alpha textures (the decal alphas) projected on the floor, slowly rotating, drifting and wobbling = canopy shadow.
float L3D_Gobo(float2 px)
{
    if(_L3D_GoboParams.x<=0) return 1.0;
    float t=_L3D_Life.x;
    float a0=0.42+0.10*sin(t*0.043), a1=-0.9+0.08*sin(t*0.037+1.0);
    float2 r0=float2(cos(a0)*px.x-sin(a0)*px.y, sin(a0)*px.x+cos(a0)*px.y), r1=float2(cos(a1)*px.x-sin(a1)*px.y, sin(a1)*px.x+cos(a1)*px.y);
    float2 w0=float2(sin(t*0.31+px.y*0.0043), cos(t*0.23+px.x*0.0039))*0.018, w1=float2(cos(t*0.27+px.y*0.0031), sin(t*0.19+px.x*0.0035))*0.014;
    float2 q0=r0/_L3D_GoboParams.y+float2(t*0.0042,t*0.0021)+w0, q1=r1/_L3D_GoboParams.z+float2(-t*0.0028,t*0.0036)+w1;
    float o0=tex2Dlod(_L3D_Gobo0, float4(q0,0,2.5)).a, o1=tex2Dlod(_L3D_Gobo1, float4(q1,0,2.5)).a;
    return 1.0-_L3D_GoboParams.x*saturate(o0*0.85+o1*0.65);
}

#endif
