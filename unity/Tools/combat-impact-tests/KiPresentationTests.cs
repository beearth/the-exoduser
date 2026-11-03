using System;
using System.Linq;
using System.Reflection;
using Exoduser.UnityPort.Core;
static class KiPresentationTests {
 static int checks,bad;
 const double Tolerance=1e-4;
 static void Check(bool value,string name){checks++;if(!value){bad++;Console.WriteLine("FAIL "+name);}}
 static int Main(){
  var type=typeof(KiPresentationTests).Assembly.GetType("Exoduser.UnityPort.KiImpactPresentation");
  Check(type!=null,"Ki contact timing policy exists");
  if(type!=null){
   Func<string,object[],double> call=(name,args)=>{var method=type.GetMethod(name);int count=method.GetParameters().Length;Check(count==args.Length,name+" parameter contract");return Convert.ToDouble(method.Invoke(null,args.Take(count).ToArray()));};
   Func<double,double> alpha=a=>call("CoreAlpha",new object[]{a});
   Check(alpha(-1)==0&&alpha(0)>0&&alpha(1)==1&&alpha(5)==0,"nonblank contact, one tick rise, exact five tick expiry");
   Check(Enumerable.Range(0,5).All(i=>alpha(i)>0)&&Enumerable.Range(1,4).All(i=>alpha(i)>alpha(i+1)),"four tick core decay without extra frame");
   foreach(int step in new[]{1,2,3})foreach(double scale in new[]{1.0,1.4,1.8,2.2}){
    var size=call("CoreDiameter",new object[]{step,scale,160.0});
    Check(Math.Abs(size-160*(step==3?.6*scale:.35))<1e-7,"core diameter step "+step+" scale "+scale);
    int count=(int)call("SparkCount",new object[]{step,scale});
    Check(step==3?count>=20*scale-.5&&count<=30*scale+.5:count>=8&&count<=15,"spark count step "+step);
    for(int i=0;i<count;i++){
     var life=call("SparkLife",new object[]{i});
     var length=call("SparkLength",new object[]{i,160.0});
     var offset=call("SparkAngle",new object[]{i,count});
     Check(life>=12&&life<=18&&length>=160*.08-Tolerance&&length<=160*.15+Tolerance&&Math.Abs(offset)<=Math.PI/3,"spark lifetime, line length and forward cone "+i);
     Check(call("SparkAlpha",new object[]{life,life})==0&&call("SparkAlpha",new object[]{life-1,life})>0,"spark expires while still a line "+i);
    }
   }
   foreach(double height in new[]{32.0,93.7,160.0,311.25})foreach(int index in Enumerable.Range(0,96)){
    double length=call("SparkLength",new object[]{index,height});
    Check(length>=height*.05-Tolerance&&length<=height*.15+Tolerance,"final spark length clamped at model height "+height+" index "+index);
   }
   foreach(double scale in new[]{1.0,1.4,1.8,2.2}){
    Check(call("SparkCount",new object[]{1,scale})==12&&call("SparkCount",new object[]{2,scale})==12,"charge does not amplify small-hit count");
    Check(call("SparkCount",new object[]{3,scale})==Math.Round(24*scale),"charge amplifies third-hit count only");
   }
   Func<string,object[],double> optional=(name,args)=>{
    var method=type.GetMethod(name);Check(method!=null,name+" is implemented");return method==null?double.NaN:Convert.ToDouble(method.Invoke(null,args));
   };
   Check(optional("TrailAlpha",new object[]{0.0})==1&&optional("TrailAlpha",new object[]{5.0})>.35&&optional("TrailAlpha",new object[]{6.0})<=.35&&optional("TrailAlpha",new object[]{9.0})==0,"bright six ticks then faint tail expires at nine ticks");
   foreach(int age in Enumerable.Range(0,30))Check(call("BodyAlpha",new object[]{(double)age})<=.35&&call("BodyAlpha",new object[]{(double)age})>=0,"body opacity cap age "+age);
   Check(optional("ShakeAmplitude",new object[]{1,3,0.0,1.0,false})==0&&optional("ShakeAmplitude",new object[]{2,3,0.0,1.0,false})==0,"actual camera amplitude ignores small hits");
   Check(optional("ShakeAmplitude",new object[]{3,2,0.0,1.0,false})==2&&optional("ShakeAmplitude",new object[]{3,3,0.0,1.0,false})==3,"actual third-hit camera amplitude");
   Check(optional("ShakeAmplitude",new object[]{3,3,0.0,.5,false})==1.5&&optional("ShakeAmplitude",new object[]{3,3,0.0,0.0,false})==0&&optional("ShakeAmplitude",new object[]{3,3,0.0,1.0,true})==0,"camera option scale and reduced motion");
   Check(optional("ShakeAmplitude",new object[]{3,3,30.0,1.0,false})==0,"camera shake expires");
   Check(call("SheetFrame",new object[]{0,3,4})==0&&call("SheetFrame",new object[]{3,3,4})==1&&call("SheetFrame",new object[]{12,3,4})==-1,"original hit sheet starts nonblank and advances at three ticks");
   Check(call("Shake",new object[]{1,0})==0&&call("Shake",new object[]{2,0})==0&&call("Shake",new object[]{3,2})==2&&call("Shake",new object[]{3,3})==3,"small swings zero shake, third 2, full charge 3");
  }
  Console.WriteLine("ki-presentation: "+checks+" checks, "+bad+" failures");return bad==0?0:1;
 }
}
