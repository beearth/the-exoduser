using System;
using UnityEngine;
namespace Exoduser {
 public static class A2RR16Checks {
  public static int VerifyScalePolicy(){
   var method=typeof(UnityPort.A2RProps3D).GetMethod("ParseModelScale");
   if(method==null)throw new Exception("R16 RED: JSON uniform screen-width scale is missing");
   Func<string,string,float> read=(json,name)=>(float)method.Invoke(null,new object[]{json,name});
   foreach(var json in new[]{null,"", "{}","broken"})if(read(json,"c1tree")!=1)throw new Exception("Missing/invalid scale must preserve 1");
   string fixture="{\"models\":[\"c1tree\"],\"scales\":[{\"name\":\"c1tree\",\"scale\":0.74}]}";
   if(Mathf.Abs(read(fixture,"c1tree")-.74f)>.00001f||read(fixture,"C1tree")!=1||read(fixture,"altar")!=1)throw new Exception("Scale must match exact name without approving other kinds");
   foreach(var n in new[]{.2f,1.2f}){string json="{\"scales\":[{\"name\":\"c1tree\",\"scale\":"+n.ToString(System.Globalization.CultureInfo.InvariantCulture)+"}]}";if(read(json,"c1tree")!=Mathf.Clamp(n,.6f,1))throw new Exception("Scale must clamp to .6..1");}
   Debug.Log("A2R_R16_SCALE_PASS exact name; invalid fallback; .6..1 clamp");return 0;
  }
 }
}
