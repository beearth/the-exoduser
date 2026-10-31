export function ghostPose(row,hero,time){
 const distance=Math.hypot(row.x-hero.x,row.y-hero.y);
 const near=Math.max(0,Math.min(1,(distance-110)/170));
 const breathe=.76+.24*Math.sin(time*.37+row.phase);
 const appear=.5+.5*Math.sin(time*.19+row.phase*1.7);
 return {alpha:row.alpha*near*breathe*(.45+.55*appear),drift:Math.sin(time*.22+row.phase)*16};
}
export function ghostTip(row,height,time){return [row.x+Math.sin(time*.6+row.phase+height*2)*height*height*8,row.y-height*row.height];}
