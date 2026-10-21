"""Bake existing root art and feathered darkness; no generated or runtime 3D asset."""
from pathlib import Path
from PIL import Image
import numpy as np
w=Path(__file__).resolve().parents[2]
import os
os.chdir(w)
y,x=np.mgrid[:640,:3072];edge=610+15*np.sin(x/143)+8*np.sin(x/49);a=np.clip((edge-y)/230,0,1);a=a*a*(3-2*a)
c=np.zeros((640,3072,4),dtype=np.uint8);c[:,:,:3]=[22,12,14];c[:,:,3]=(a*255).astype('uint8');base=Image.fromarray(c)
root=Image.open('godot/assets/map/props/prop_g_root.png').convert('RGBA');root=root.crop(root.getbbox())
for i in range(9):
 im=root.copy();im.thumbnail((660,330));v=np.asarray(im).astype(float);h,ww=v.shape[:2];yy,xx=np.mgrid[:h,:ww];q=np.maximum(abs(xx/ww*2-1),abs(yy/h*2-1));f=np.clip((1-q)/.45,0,1);f=f*f*(3-2*f);l=v[:,:,:3]@np.array([.299,.587,.114]);v[:,:,:3]=np.array([23,12,14])+l[:,:,None]*np.array([.18,.10,.10]);v[:,:,3]*=f*.55
 im=Image.fromarray(v.clip(0,255).astype('uint8'))
 if i%2:im=im.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
 base.alpha_composite(im,(i*370-220,260+(i%3)*23))
base.save('godot/assets/maps/map11/gate_organic_recess.png')
