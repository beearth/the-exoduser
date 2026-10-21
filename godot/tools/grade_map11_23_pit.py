"""Offline grading of existing yaw1 diffuse. Input: original 0a2e9957 PNG.
Usage: python3 godot/tools/grade_map11_23_pit.py ORIGINAL_PNG OUTPUT_PNG
Alpha, rim, spikes and normals stay unchanged; no runtime shader/pass.
"""
import sys
import numpy as np
from PIL import Image
im=Image.open(sys.argv[1]).convert('RGBA')
a=np.array(im);rgb=a[:,:,:3].astype(float)
y,x=np.mgrid[:a.shape[0],:a.shape[1]]
# Red cavity only: exclude brown rim, black spikes, skull and transparent background.
mask=(rgb[:,:,0]>180)&(rgb[:,:,1]<45)&(rgb[:,:,2]<40)&(a[:,:,3]>0)
r=np.sqrt(((x-223)/110)**2+((y-270)/62)**2)
edge=np.clip((r-.28)/.72,0,1);edge=edge*edge*(3-2*edge)
# Far wall falls into shade; near lip retains a narrow reflected red accent.
shade=.83-.58*edge-.13*np.clip((270-y)/65,0,1)
shade=np.clip(shade,.18,.83)
rgb[mask]*=shade[mask,None]
a[:,:,:3]=np.rint(rgb).clip(0,255).astype('uint8')
Image.fromarray(a).save(sys.argv[2])
print('graded cavity pixels',int(mask.sum()),'alpha unchanged')
