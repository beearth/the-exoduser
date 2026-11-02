using System;using System.IO;using System.Reflection;using System.Runtime.Loader;
class HeaderLayoutProgram {
 static int Main(string[] args){try{
  string assemblies=Path.GetFullPath(args[0]),managed=Path.GetFullPath(args[1]);
  AssemblyLoadContext.Default.Resolving+=(c,n)=>{foreach(string dir in new[]{assemblies,managed}){string p=Path.Combine(dir,n.Name+".dll");if(File.Exists(p))return c.LoadFromAssemblyPath(p);}return null;};
  var asm=AssemblyLoadContext.Default.LoadFromAssemblyPath(Path.Combine(assemblies,"Exoduser.Runtime.dll"));
  var method=asm.GetType("Exoduser.UnityPort.NativeSkills",true).GetMethod("AltarHeaderRight",BindingFlags.Static|BindingFlags.NonPublic|BindingFlags.Public);
  if(method==null)throw new Exception("AltarHeaderRight coordinate contract is absent");
  Func<float,float,bool,float> right=(a,e,r)=>(float)method.Invoke(null,new object[]{a,e,r});int count=0;
  int[,] sizes={{1600,900},{1920,1080},{2560,1080},{2560,1600},{3840,1080}};float[] expected={1546,1546,2186,1354,3466};
  for(int i=0;i<5;i++){float scale=sizes[i,1]/1080f,edge=sizes[i,0]/scale;float result=right(4000,edge,true);if(Math.Abs(result-expected[i])>.002f)throw new Exception("right-edge space mismatch "+sizes[i,0]+"x"+sizes[i,1]+": "+result);count++;
   if(right(1470,edge,false)!=1454)throw new Exception("no-road layout changed");count++;}
  if(right(1300,1728,true)!=1284)throw new Exception("altar boundary was exceeded");count++;
  var orb=asm.GetType("Exoduser.UnityPort.NativeSkills",true).GetMethod("OrbLevelY",BindingFlags.Static|BindingFlags.NonPublic|BindingFlags.Public);if(orb==null)throw new Exception("Orb row separation contract is absent");
  float[,] rows={{100,99,13,15,103},{100,110,13,15,110},{100,105,13,25,108},{100,100,13,8,100}};for(int i=0;i<4;i++){float y=(float)orb.Invoke(null,new object[]{rows[i,0],rows[i,1],rows[i,2],rows[i,3]});if(Math.Abs(y-rows[i,4])>.001f||y+(rows[i,2]-rows[i,3])/2<rows[i,0]+2-.001f)throw new Exception("orb measured row separation failed");count++;}
  Console.WriteLine("PASS "+count+" actual C# header/orb geometry contracts");return 0;
 }catch(Exception ex){Console.Error.WriteLine("FAIL "+ex);return 1;}}
}
