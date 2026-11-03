export function ghostPose(row,hero,time){
 const distance=Math.hypot(row.x-hero.x,row.y-hero.y);
 const near=Math.max(0,Math.min(1,(distance-110)/170));
 const breathe=.86+.14*Math.sin(time*.37+row.phase);
 const appear=.5+.5*Math.sin(time*.19+row.phase*1.7);
 return {alpha:row.alpha*near*breathe*(.66+.34*appear),drift:Math.sin(time*.22+row.phase)*16};
}
export function ghostTip(row,height,time){return [row.x+Math.sin(time*.85+row.phase+height*2)*height*height*18,row.y-height*row.height];}
export function ghostMaterial(rgb,alpha,edge,height,time,phase){const glow=Math.max(0,edge)*(.65+.35*Math.sin(time*.8+phase+height*8)),mix=Math.min(1,glow);return {color:rgb.map((v,i)=>v*.19*(1-mix)+[.46,.57,.64][i]*mix),alpha:Math.max(alpha*.94,edge*.5)*Math.min(1,Math.max(0,height/.16))};}
