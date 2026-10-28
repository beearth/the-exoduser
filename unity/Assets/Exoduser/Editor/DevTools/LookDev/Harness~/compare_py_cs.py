import json, sys
py = json.load(open('E:/exoduser-wt/_out/rm0-light/sweepL1/L_metrics.json'))
cs = json.load(open('I:/EXODUSER-Storage/devtools/dt03/cs_sweepL1.json'))
scal = ['screen_median','sandbox_floor_luma_median','char_floor_luma_median','armor_RG','blade_sat_top5','pool_floor_hue_deg','pool_floor_luma_top30','pool_in_floor_luma_median']
lst = ['sandbox_floor_RG','sandbox_floor_luma']
worst = {}
rows = []
for step in cs:
    a, b = py[step], cs[step]
    for k in scal:
        d = b[k]-a[k]
        sc = 100.0 if k=='blade_sat_top5' else 1.0   # 채도는 % 단위로 비교
        rows.append((step,k,a[k],b[k],d*sc)); worst[k]=max(worst.get(k,0),abs(d*sc))
    for k in lst:
        for i,(x,y) in enumerate(zip(a[k],b[k])):
            rows.append((step,'%s[%d]'%(k,i),x,y,y-x)); worst[k]=max(worst.get(k,0),abs(y-x))
    for i,(x,y) in enumerate(zip(a['sandbox_floor_B_le_G'],b['sandbox_floor_B_le_G'])):
        rows.append((step,'B_le_G[%d]'%i,x,y,0 if x==y else 1)); worst['B_le_G']=max(worst.get('B_le_G',0),0 if x==y else 1)
with open('I:/EXODUSER-Storage/devtools/dt03/compare_py_cs.txt','w') as f:
    f.write('step\tmetric\tpython\tcsharp\tdiff\n')
    for r in rows: f.write('%s\t%s\t%s\t%s\t%.6g\n'%r)
    f.write('\nWORST |diff| per metric (blade_sat in percent points)\n')
    for k,v in worst.items(): f.write('%s\t%.6g\n'%(k,v))
print('steps', list(cs)); 
for k,v in worst.items(): print('%-28s %.6g'%(k,v))
