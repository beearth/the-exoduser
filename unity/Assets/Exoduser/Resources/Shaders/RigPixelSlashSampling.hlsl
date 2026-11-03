#ifndef EXODUSER_RIG_PIXEL_SLASH_SAMPLING
#define EXODUSER_RIG_PIXEL_SLASH_SAMPLING
Texture2D _MainTex;
SamplerState sampler_MainTex;
SamplerState rig_point_clamp_sampler;
float4 _MainTex_TexelSize,_PixelFrameRect,_RigPixelGrid;
float _RigPixelMode;

half4 RigSlashPoint(float2 uv){
 float2 inset=_MainTex_TexelSize.xy*.5;
 uv=clamp(uv,_PixelFrameRect.xy+inset,_PixelFrameRect.zw-inset);
 return _MainTex.SampleLevel(rig_point_clamp_sampler,uv,0);
}
void RigSlashGrid(float2 sourceUv,float4 projected,out float2 uv,out float2 axisX,out float2 axisY){
 float2 screen=projected.xy/projected.w*_ScreenParams.xy;
 float scale=_RigPixelGrid.w>.5?max(1,_RigPixelGrid.z):max(1,floor(_ScreenParams.y/1080));
 float2 origin=_RigPixelGrid.w>.5?_RigPixelGrid.xy:float2(0,0);
 float2 dxScreen=ddx(screen),dyScreen=ddy(screen);
 float xStep=abs(dxScreen.x)>.0001?dxScreen.x:1;
 float yStep=abs(dyScreen.y)>.0001?dyScreen.y:1;
 float2 dxUv=ddx(sourceUv)/xStep,dyUv=ddy(sourceUv)/yStep;
 float2 snapped=(floor((screen-origin)/scale)+.5)*scale+origin;
 uv=sourceUv+dxUv*(snapped.x-screen.x)+dyUv*(snapped.y-screen.y);
 axisX=dxUv*scale;axisY=dyUv*scale;
}
half4 RigSlashPixel(float2 uv,float2 axisX,float2 axisY){
 half4 c=RigSlashPoint(uv);if(c.a<.25h)return 0;
 int neighbours=0;float2 adjacent=0;
 [unroll]for(int y=-1;y<=1;y++)[unroll]for(int x=-1;x<=1;x++){
  if(x!=0||y!=0){float2 offset=x*axisX+y*axisY;if(RigSlashPoint(uv+offset).a>=.25h){neighbours++;adjacent=offset;}}
 }
 if(neighbours==0)return 0;
 if(neighbours==1){
  int support=0;
  [unroll]for(int sy=-1;sy<=1;sy++)[unroll]for(int sx=-1;sx<=1;sx++){
   if(sx!=0||sy!=0)if(RigSlashPoint(uv+adjacent+sx*axisX+sy*axisY).a>=.25h)support++;
  }
  if(support<=1)return 0;
 }
 return half4(floor(saturate(c.rgb)*3+.5h)/3,1);
}
#endif
