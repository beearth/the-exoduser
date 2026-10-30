using System;
using System.Collections.Generic;
using UnityEngine;
namespace Exoduser.UnityPort {
 // 게임과 키샷 빌더가 공유하는 카메라 수치는 Resources/Data/remodel_camera.json 하나에서 읽는다.
 public static class NativeRemodelCamera {
  [Serializable] sealed class Foot {public string texture;public int x,y,bottom;}
  [Serializable] sealed class Profile {public float pitchDegrees,distance,verticalFieldOfView,heroScale,lookAhead;public Foot[] feet;}
  static Profile data;static readonly Dictionary<string,int> bottoms=new Dictionary<string,int>();
  static Profile Data {get{if(data!=null)return data;var asset=Resources.Load<TextAsset>("Data/remodel_camera");if(asset==null)throw new InvalidOperationException("리모델 카메라 설정 누락");var p=JsonUtility.FromJson<Profile>(asset.text);if(p==null||!(p.pitchDegrees>=25&&p.pitchDegrees<=75)||!(p.distance>=4&&p.distance<=40)||!(p.verticalFieldOfView>=15&&p.verticalFieldOfView<=70)||!(p.heroScale>=1&&p.heroScale<=3)||!(p.lookAhead>=0&&p.lookAhead<=3))throw new InvalidOperationException("리모델 카메라 설정 범위 오류");if(p.feet!=null)foreach(var f in p.feet)bottoms[f.texture+":"+f.x+":"+f.y]=f.bottom;data=p;return data;}}
  public static float Pitch {get{return Data.pitchDegrees*Mathf.Deg2Rad;}}
  public static float Distance {get{return Data.distance;}}
  public static float FieldOfView {get{return Data.verticalFieldOfView;}}
  public static float HeroScale {get{return Data.heroScale;}}
  public static Vector3 TargetOffset {get{return new Vector3(0,0,Data.lookAhead);}}
  public static Vector3 FollowOffset {get{return new Vector3(0,Mathf.Sin(Pitch),-Mathf.Cos(Pitch))*Distance;}}
  public static Quaternion Rotation {get{return Quaternion.Euler(Data.pitchDegrees,0,0);}}
  // 알파>64인 원본 발끝을 오프라인 측정했다. 런타임 GPU readback 없이 투명 여백만 제외한다.
  public static float HeroFootLift(Sprite sprite){_ = Data;int bottom;var r=sprite.rect;string key=sprite.texture.name+":"+(int)r.x+":"+(int)r.y;return (sprite.pivot.y-(bottoms.TryGetValue(key,out bottom)?bottom:0))/sprite.pixelsPerUnit;}
 }
}
