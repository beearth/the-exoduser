"""Deterministic metre-scale geometry fixtures; never labelled Animator clips."""
import math
import bpy
from mathutils import Matrix, Quaternion, Vector

LABELS=("rest","arm90","elbow140","knee120","crouch","twist45","strike1","strike2","strike3","roll_mid")

class Poses:
    def __init__(self, rig):
        self.rig=rig
        self.feet={s:self.head(s+"Foot").copy() for s in ("Left","Right")}
        self.directions={s+t:(rig.data.bones[s+end].head_local-rig.data.bones[s+t].head_local).normalized()
             for s in ("Left","Right") for t,end in (("Arm","ForeArm"),("UpLeg","Leg"))}

    def head(self,name): return self.rig.matrix_world@self.rig.pose.bones[name].head

    def turn(self,name,angle,axis):
        bone=self.rig.pose.bones[name]; world=self.rig.matrix_world@bone.matrix
        pivot=world.translation.copy(); rotation=Quaternion(Vector(axis).normalized(),math.radians(angle)).to_matrix().to_4x4()
        bone.matrix=self.rig.matrix_world.inverted()@Matrix.Translation(pivot)@rotation@Matrix.Translation(-pivot)@world
        bpy.context.view_layer.update()

    def aim(self,name,old,new):
        rotation=old.normalized().rotation_difference(new.normalized())
        axis,angle=rotation.to_axis_angle()
        self.turn(name,math.degrees(angle),axis)

    def ik(self,side,target,hint):
        upper,lower,end=(side+n for n in ("UpLeg","Leg","Foot"))
        start,middle,finish=self.head(upper),self.head(lower),self.head(end)
        one,two=(middle-start).length,(finish-middle).length
        direction=Vector(target)-start; length=min(direction.length,one+two-1e-5); direction.normalize()
        side_vector=Vector(hint)-direction*Vector(hint).dot(direction); side_vector.normalize()
        along=(one*one-two*two+length*length)/(2*length)
        knee=start+direction*along+side_vector*math.sqrt(max(0,one*one-along*along))
        self.aim(upper,middle-start,knee-start)
        self.aim(lower,self.head(end)-self.head(lower),Vector(target)-self.head(lower))

    def follow(self):
        rig=self.rig
        for side in ("Left","Right"):
            definitions=[("Modular_Pauldron_"+side,"Arm","ForeArm",side+"Shoulder",.45)]
            keys=("fl","sl") if side=="Left" else ("fr","sr")
            definitions += [("tasset_"+key,"UpLeg","Leg","Hips",.9 if key.endswith("l") or key.endswith("r") else .6) for key in keys]
            for name,upper,lower,parent,amount in definitions:
                bone=rig.pose.bones.get(name)
                if not bone: continue
                parent_delta=rig.pose.bones[parent].matrix@rig.data.bones[parent].matrix_local.inverted()
                baseline=parent_delta.to_3x3()@self.directions[side+upper]
                current=rig.pose.bones[side+lower].head-rig.pose.bones[side+upper].head
                delta=Quaternion().slerp(baseline.rotation_difference(current.normalized()),amount)
                matrix=bone.matrix.copy(); pivot=matrix.translation.copy()
                bone.matrix=Matrix.Translation(pivot)@delta.to_matrix().to_4x4()@Matrix.Translation(-pivot)@matrix
        bpy.context.view_layer.update()

    def apply(self,label):
        for bone in self.rig.pose.bones: bone.matrix_basis=Matrix.Identity(4)
        bpy.context.view_layer.update()
        if label=="arm90":
            for side,sign in (("Left",1),("Right",-1)):
                self.aim(side+"Arm",self.head(side+"ForeArm")-self.head(side+"Arm"),Vector((sign,0,0)))
                self.aim(side+"ForeArm",self.head(side+"Hand")-self.head(side+"ForeArm"),Vector((sign,0,0)))
        elif label=="elbow140":
            for side in ("Left","Right"):
                upper=(self.head(side+"ForeArm")-self.head(side+"Arm")).normalized()
                axis=upper.cross(Vector((0,-1,0))).normalized()
                wanted=Quaternion(axis,math.radians(140))@upper
                self.aim(side+"ForeArm",self.head(side+"Hand")-self.head(side+"ForeArm"),wanted)
        elif label=="knee120":
            upper=(self.head("LeftLeg")-self.head("LeftUpLeg")).normalized()
            axis=upper.cross(Vector((0,1,0))).normalized()
            wanted=Quaternion(axis,math.radians(120))@upper
            self.aim("LeftLeg",self.head("LeftFoot")-self.head("LeftLeg"),wanted)
        elif label=="crouch":
            bone=self.rig.pose.bones["Hips"]; world=self.rig.matrix_world@bone.matrix
            world.translation+=Vector((0,0,-.35)); bone.matrix=self.rig.matrix_world.inverted()@world
            bpy.context.view_layer.update()
            self.turn("Spine01",28,(1,0,0))
            for side in ("Left","Right"): self.ik(side,self.feet[side],(0,-1,0))
        elif label=="twist45": self.turn("Spine01",45,(0,0,1))
        elif label=="head_left": self.turn("Head",35,(0,0,1))
        elif label=="head_right": self.turn("Head",-35,(0,0,1))
        elif label=="head_bow": self.turn("Head",20,(1,0,0))
        elif label.startswith("strike"):
            i=int(label[-1])-1
            self.turn("Spine01",(35,-40,10)[i],(0,0,1))
            self.turn("RightArm",(-45,45,-15)[i],(0,1,0))
            self.turn("RightForeArm",(60,85,105)[i],(1,0,0))
            self.turn("LeftArm",(-25,20,-5)[i],(0,1,0))
        elif label=="roll_mid":
            self.turn("Hips",90,(1,0,0))
            self.turn("LeftLeg",80,(1,0,0)); self.turn("RightLeg",80,(1,0,0))
        self.follow()
        result={"fixture":label,"animator":False}
        if label=="elbow140":
            for side in ("Left","Right"):
                u=self.head(side+"ForeArm")-self.head(side+"Arm"); v=self.head(side+"Hand")-self.head(side+"ForeArm")
                result[side+"ElbowFlexDeg"]=math.degrees(u.angle(v))
        if label=="knee120":
            result["LeftKneeFlexDeg"]=math.degrees((self.head("LeftLeg")-self.head("LeftUpLeg")).angle(self.head("LeftFoot")-self.head("LeftLeg")))
        return result
