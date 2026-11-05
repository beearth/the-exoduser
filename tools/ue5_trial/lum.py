import bpy,sys,numpy as np
for p in sys.argv[sys.argv.index('--')+1:]:
    i=bpy.data.images.load(p);i.colorspace_settings.name='Non-Color';w,h=i.size;a=np.array(i.pixels[:],dtype=np.float32).reshape(h,w,i.channels)[...,:3]*255;Y=.2126*a[...,0]+.7152*a[...,1]+.0722*a[...,2]
    st=[Y[int(h*t):int(h*b)] for t,b in ((.66,1),(.33,.66),(0,.33))]
    print('LUM',p.split('/')[-1],'p1',round(float(np.percentile(Y,1)),1),'p5',round(float(np.percentile(Y,5)),1),'p50',round(float(np.percentile(Y,50)),1),'p99',round(float(np.percentile(Y,99)),1),'band(top,mid,bot)',[round(float(s.mean()),1) for s in st[::-1]],'sat',round(float(np.mean(np.max(a,2)-np.min(a,2))),1))
