import sys,json,pathlib
sys.path.insert(0,sys.argv[1])
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
root=pathlib.Path(sys.argv[2]);rows=[]
for n in ['Cinzel-VariableFont_wght.ttf','Hahmlet-300-ko.ttf','Hahmlet-400-ko.ttf']:
 f=TTFont(root/n);rows.append({'file':n,'weight':f['OS/2'].usWeightClass,'axes':[(a.axisTag,a.minValue,a.defaultValue,a.maxValue) for a in f['fvar'].axes] if 'fvar' in f else [],'family':[x.toUnicode() for x in f['name'].names if x.nameID in [1,2] and x.platformID==3][:4]})
for w in [400,600]:
 f=TTFont(root/'Cinzel-VariableFont_wght.ttf',recalcTimestamp=False);f=instantiateVariableFont(f,{'wght':w},inplace=True,optimize=False,updateFontNames=False);
 for name_id,value in {1:'EXODUSER Latin Serif',2:('Regular' if w==400 else 'SemiBold'),4:'EXODUSER Latin Serif '+str(w),6:'EXODUSERLatinSerif-'+str(w),16:'EXODUSER Latin Serif',17:('Regular' if w==400 else 'SemiBold')}.items():
  for rec in list(f['name'].names):
   if rec.nameID==name_id:f['name'].setName(value,name_id,rec.platformID,rec.platEncID,rec.langID)
 f.save(root/('Cinzel-'+str(w)+'.ttf'))
print(json.dumps(rows,ensure_ascii=True))
