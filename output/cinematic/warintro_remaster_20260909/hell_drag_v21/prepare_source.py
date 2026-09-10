"""Normalize the downloaded source and inspect the motion before assembly."""
import render as r
if __name__=='__main__':
    r.run(['-i',r.ROOT/'source.mp4','-t','4.5','-vf','scale=1920:1080,crop=1916:1080:2:0,setsar=1','-an','-c:v','libx264','-preset','fast','-crf','16','-threads','4',r.ROOT/'w12_drag.mp4'])
    r.inspect('w12_drag',[0,0.4,0.8,1.2,1.6,2,2.4,2.8,3.2,3.6,4,4.45])
    r.dump('source_qa.json',{'original':r.probe(r.ROOT/'source.mp4'),'normalized':r.probe(r.ROOT/'w12_drag.mp4'),'visual_review':'pending'})
