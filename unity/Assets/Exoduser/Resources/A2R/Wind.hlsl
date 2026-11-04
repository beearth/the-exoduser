#ifndef EXODUSER_A2R_WIND_INCLUDED
#define EXODUSER_A2R_WIND_INCLUDED
// Presentation only. The comparison flag never disables water/actor simulation.
float _A2RWindOff;
float A2RWindGust(float time,float3 world)
{
 return .6+.4*sin(time*1.57+world.x*.07+world.z*.05);
}
float A2RWindWave(float time,float phase,float gust)
{
 return (sin(time*1.7+phase)+.35*sin(time*3.9+phase*1.7)+.12*sin(time*7.3+phase*2.3))*gust;
}
float A2RWindPhase(float seed,float3 anchor)
{
 return seed*6.2831853+frac(sin(dot(anchor.xz,float2(12.9898,78.233)))*43758.5453)*6.2831853;
}
float A2RPulseCycle(float time,float phase,float period)
{
 return .5-.5*cos(time*6.283185307179586/period+phase);
}
// A constant G on each growth keeps its surface coherent; different growths breathe separately.
float A2RPulse(float seed,float time)
{
 float period=lerp(3,8,frac(seed*7.137));
 return A2RPulseCycle(time,seed*6.2831853,period);
}
#endif
