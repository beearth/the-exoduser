// Mac-only geometry input adapter; original PC gameplay oracle remains byte-identical.
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const original = path.join(__dirname, 'pc_combat_pack_b_source_oracle.cjs');
let source = fs.readFileSync(original, 'utf8');
const needle = '    if (wm) {';
if (source.split(needle).length !== 2) throw new Error('PC oracle wall seam changed');
source = source.replace(needle, `    if (wm && wm.mac_web_field) {
      const d=wm.mac_web_field;
      if(x<0||y<0||x>=8000||y>=8000)return true;
      if((x-4020)**2+(y-160)**2<10000)return true;
      if(d.tiles[Math.floor(y/40)*200+Math.floor(x/40)]===1)return true;
      const h=d.hill,tx=x/40,ty=y/40;
      const ramp=tx>=h.rampX0&&tx<=h.rampX1&&Math.abs(ty-h.rampY)<=h.rampHalf0+(h.rampHalf1-h.rampHalf0)*(tx-h.rampX0)/(h.rampX1-h.rampX0);
      const q=Math.hypot((tx-h.cx)/h.rx,(ty-h.cy)/h.ry);
      if(!ramp&&q>=h.inner&&q<=h.outer)return true;
      return d.prop_colliders.some(p=>((x-p.position[0])/p.radii[0])**2+((y-p.position[1])/p.radii[1])**2<1);
    }
    if (wm && wm.map11_outer) {
      const p = wm.map11_outer; let inside = false;
      for (let i=0,j=p.length-1;i<p.length;j=i++) {
        const a=p[j], b=p[i], dx=b[0]-a[0], dy=b[1]-a[1];
        const l=dx*dx+dy*dy, t=l ? Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/l)) : 0;
        if ((x-a[0]-t*dx)**2+(y-a[1]-t*dy)**2 < .001) return (wm.map11_solids||[]).some(c=>(x-c[0])**2+(y-c[1])**2<=c[2]**2);
        if ((a[1]>y)!=(b[1]>y) && x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]) inside=!inside;
      }
      return !inside || (wm.map11_solids||[]).some(c=>(x-c[0])**2+(y-c[1])**2<=c[2]**2);
    }
` + needle);
const adapted = new Module(original, module);
adapted.filename = original; adapted.paths = module.paths;
adapted._compile(source, original);
