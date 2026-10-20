extends RefCounted
## G42024–42063. Result calculation only, no combat or IO.
const ORDER := {"D":0,"C":1,"B":2,"A":3,"S":4}
static func calculate(g: Dictionary, regions: int) -> Dictionary:
 var time: Variant=g.get("_bossClearT")
 var sec: int=int(time) if time!=null else int(float(g.get("stageTime",0))/60.0)
 var total: float=float(g.get("_totalSpawned",0))
 var par: int=int(floor(90.0+total*2.5+0.5))
 var par_score: float=total*10.0+3500.0
 var stats: Dictionary=g._sStats if g.get("_sStats") is Dictionary else {}
 var deaths: float=float(stats.get("deaths",0))
 var score: float=maxf(0,float(g.get("_stageKills",0))*10+regions*500+1000+maxf(0,par-sec)*10+(500 if deaths==0 else 0)+(500 if float(stats.get("dmgTaken",0))==0 else 0)+float(g.get("comboMax",0))*5-deaths*300)
 var ratio: float=float(sec)/par if par>0 else 9.0
 var points: int=(3 if ratio<=0.7 else (2 if ratio<=1.0 else (1 if ratio<=1.5 else 0)))+(2 if score>=par_score else (1 if score>=par_score*0.6 else 0))+(1 if deaths==0 else 0)
 var rank: String="S" if points>=6 else ("A" if points>=4 else ("B" if points>=3 else ("C" if points>=2 else "D")))
 var cur: Dictionary={"t":sec,"s":score,"r":rank}
 var records: Dictionary=g._clearRecords if g.get("_clearRecords") is Dictionary else {}
 var previous: Variant=records.get(str(int(g.stage)))
 if previous==null: previous=records.get(int(g.stage))
 var first: bool=not previous is Dictionary or previous.get("t")==null
 var record: Dictionary=cur.duplicate()
 var new_time: bool=false
 var new_score: bool=false
 if not first:
  new_time=sec<float(previous.t);new_score=score>float(previous.s)
  record={"t":sec if new_time else previous.t,"s":score if new_score else previous.s,"r":rank if ORDER[rank]>ORDER.get(previous.r,0) else previous.r}
 return {"current":cur,"record":record,"first":first,"newTime":new_time,"newScore":new_score,"parSec":par,"parScore":par_score}
