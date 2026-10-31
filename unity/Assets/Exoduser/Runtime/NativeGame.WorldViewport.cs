using System;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
 public sealed partial class NativeGame
 {
  DruidBoss worldVisibleDruid;Simulation worldViewportSimulation;
  void ReserveEdgeFeedback(Rect edge){var r=NativeUiViewport.FromEdge(edge);floatingTextLayout.Reserve(new NativeFloatingTextLayout.Box(r.x,r.y,r.width,r.height));}
  void BindWorldViewport()
  {
   if(worldViewportSimulation!=Simulation){worldViewportSimulation=Simulation;Simulation.WorldPointVisible=WorldPointVisible;}
   if(Simulation.Druid!=null&&worldVisibleDruid!=Simulation.Druid){worldVisibleDruid=Simulation.Druid;worldVisibleDruid.WorldPointVisible=WorldPointVisible;}
  }
  // Core px의 여유를 실제 카메라에 투영한다. 양수는 교차, 음수는 네 모서리가 전부 화면 안일 때만 허용한다.
  bool WorldPointVisible(double x,double y,double margin)
  {
   var camera=HudCamera;if(camera==null)return false;float d=(float)Math.Abs(margin),minX=float.MaxValue,minY=float.MaxValue,maxX=float.MinValue,maxY=float.MinValue;bool anyFront=false,allFront=true;
   for(int i=0;i<4;i++){var world=NativeRemodel3D.Point(x+(i%2==0?-d:d),y+(i<2?-d:d));var point=camera.WorldToViewportPoint(world);bool front=point.z>=camera.nearClipPlane&&point.z<=camera.farClipPlane;anyFront|=front;allFront&=front;minX=Mathf.Min(minX,point.x);minY=Mathf.Min(minY,point.y);maxX=Mathf.Max(maxX,point.x);maxY=Mathf.Max(maxY,point.y);}
   return margin<0?allFront&&minX>=0&&minY>=0&&maxX<=1&&maxY<=1:anyFront&&maxX>=0&&maxY>=0&&minX<=1&&minY<=1;
  }
 }
}
