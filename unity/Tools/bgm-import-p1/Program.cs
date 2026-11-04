using System;
using System.Collections.Generic;
using Exoduser.UnityPort;
using Exoduser.UnityPort.Core;
using UnityEngine;
static class Program {
 static int checks;
 static void Check(bool ok,string name){if(!ok)throw new Exception(name);checks++;}
 static NativeGameMusic Host(){return new NativeGameMusic(new Transform(),new NativeAudioMixer());}
 static void Step(NativeGameMusic m,string key,string track="auto"){m.Sync(key,NativeBgmCatalog.Resolve(key,track),NativeBgmCatalog.IsAuto(track));m.Tick(.6f);}
 static void Settle(NativeGameMusic m,string key,string track="auto"){for(int i=0;i<4;i++)Step(m,key,track);}
 static string End(NativeGameMusic m,string key,string track="auto"){AudioSource.All["BGM"].isPlaying=false;Settle(m,key,track);return m.Playing;}
 static int Main(){
  var stage=new StageFixture();Check(stage.Key()=="hell1","field context");stage.Simulation.Stage.InArena=true;stage.Simulation.Stage.BossAlive=true;Check(stage.Key()=="boss","boss context");
  stage.forge.Open=true;Check(stage.Key()=="forge","open forge owns the screen music even in the arena");stage.PlayerDown=true;Check(stage.Key()=="death","death takes priority over forge");stage.PlayerDown=false;stage.forge.Open=false;stage.Simulation.Stage.BossAlive=false;Check(stage.Key()=="victory","victory after closing forge");
  Check(NativeFieldBgmRotation.TrackCount==6,"field rotation must contain six imported Remastered songs");
  var pool=new HashSet<string>();for(int i=0;i<6;i++)pool.Add(NativeFieldBgmRotation.TrackAt(i));
  foreach(int seed in new[]{0,1,42,999}){var r=new System.Random(seed);var rot=new NativeFieldBgmRotation(n=>r.Next(n));string last=rot.Current;
   for(int round=0;round<50;round++){var seen=new HashSet<string>();for(int i=0;i<6;i++){var next=rot.Advance();Check(next!=last&&pool.Contains(next),"field boundary / catalog");seen.Add(next);last=next;}Check(seen.Count==6,"six unique songs per field round");}}
  var m=Host();Settle(m,"hell1");Check(m.Playing=="hell1"&&!AudioSource.All["BGM"].loop,"field first song once");
  var played=new HashSet<string>();for(int i=0;i<6;i++)played.Add(End(m,"hell1"));Check(played.SetEquals(pool),"actual host loads all six field songs");
  foreach(string cue in new[]{"death","victory"})for(int i=0;i<4;i++){
   Settle(m,"hell1");Settle(m,cue);string expected=cue+(i%2==0?"":"_alt");Check(m.Playing==expected,"alternating event entry "+cue+" "+i);
   Settle(m,cue);Check(m.Playing==expected,"steady event does not advance");Settle(m,"");Settle(m,cue);Check(m.Playing==expected,"pause/resume does not count as another event");
  }
  Settle(m,"forge");string previous=m.Playing;var forge=new HashSet<string>{"forge_vengeance","forge_vengeance_alt","forge_anvil_ashes"};
  Check(forge.Contains(previous)&&!AudioSource.All["BGM"].loop,"forge enters its own non-looping shuffle");
  for(int round=0;round<10;round++){var seen=new HashSet<string>();for(int i=0;i<3;i++){string current=i==0&&round==0?m.Playing:End(m,"forge");if(i!=0||round!=0)Check(current!=previous,"forge no boundary repeat");Check(forge.Contains(current),"forge clip reachable");seen.Add(current);previous=current;}Check(seen.Count==3,"forge each round contains three unique tracks");}
  string paused=m.Playing;Settle(m,"");Settle(m,"forge");Check(m.Playing==paused,"forge pause/resume keeps its current song");
  Settle(m,"hell1");Check(m.Playing=="hell1","leaving forge follows P0 field re-entry reset");
  foreach(string value in new[]{"t:bgm/공통/forge.mp3","t:bgm/공통/복수의 대장간.mp3","t:bgm/공통/Anvil Ashes.mp3","t:bgm/공통/지옥 추락 사망 징글.mp3","t:bgm/공통/탈출 성공.mp3","t:bgm/1장_썩은숲/Neon Hellfire Protocol (Remastered).wav","t:bgm/1장_썩은숲/Neon Hellfire Protocol2(Remastered).wav","t:bgm/1장_썩은숲/Wrath of the Golden Age (Remastered).wav"}){
   Check(NativeBgmCatalog.IsSupported(value),"menu support "+value);Settle(m,"hell1",value);Check(m.Playing==NativeBgmCatalog.ClipFor(value)&&AudioSource.All["BGM"].loop,"selected song loops its own clip");
  }
  Check(NativeBgmCatalog.IsSupported("forge"),"forge random menu supported");Settle(m,"hell1","forge");Check(forge.Contains(m.Playing),"selected forge random resolves to actual track");
  Settle(m,"death","t:bgm/공통/Anvil Ashes.mp3");Check(m.Playing=="death"||m.Playing=="death_alt","death overrides selected song");
  Console.WriteLine("통과 "+checks+" / 실패 0; 무음 대역을 통한 실제 BGM 호스트 계약, Unity 재생 검증 별도");return 0;
 }
}
