import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {parseExpressionAt} from 'acorn';
import {extract} from './binding-save-harness.mjs';

export const source=fs.readFileSync(new URL('../../../game.html',import.meta.url),'utf8');
export const hash=text=>crypto.createHash('sha256').update(text).digest('hex');
const update=extract(source,'update'),ast=parseExpressionAt(update,0,{ecmaVersion:'latest'});
const nodes=[];
function walk(node){if(!node||typeof node!=='object')return;nodes.push(node);for(const value of Object.values(node))if(Array.isArray(value))value.forEach(walk);else if(value&&typeof value==='object')walk(value);}
walk(ast.body);
const blocks=nodes.filter(node=>node.type==='IfStatement'&&update.slice(node.test.start,node.test.end)==='G._fireZones&&G._fireZones.length>0');
assert.equal(blocks.length,1);
const block=blocks[0];
export const zoneBlock=update.slice(block.start,block.end);
const calls=nodes.filter(node=>node.type==='CallExpression'&&node.callee.name==='hurtE'&&node.start>block.start&&node.end<block.end&&update.slice(node.start,node.end).includes("_lessonAttack:'spikeTrap'"));
assert.equal(calls.length,1);
const call=calls[0],originalCall=update.slice(call.start,call.end),args=call.arguments.map(argument=>update.slice(argument.start,argument.end));
export const reviewZoneBlock=zoneBlock.slice(0,call.start-block.start)+`review.invokeDot(fz,hurtE,undefined,[${args.join(',')}])`+zoneBlock.slice(call.end-block.start);
export const sourceEvidence={gameSha256:hash(source),functions:['activateSpikeTrap','hurtE','update','checkRooms'].map(name=>{const text=extract(source,name);return {name,sha256:hash(text),line:source.slice(0,source.indexOf(text)).split('\n').length};}),
  zoneBlock:{sha256:hash(zoneBlock),bytes:Buffer.byteLength(zoneBlock),line:source.slice(0,source.indexOf(zoneBlock)).split('\n').length,text:zoneBlock},
  callsite:{original:originalCall,replacement:`review.invokeDot(fz,hurtE,undefined,[${args.join(',')}])`,unchangedArgumentExpressions:args,sha256:hash(originalCall)}};

export function createFixture() {
  const effects=[],rng=[];const noop=(...args)=>{effects.push(args);};
  const math=Object.create(Math);math.random=()=>{rng.push(.5);return .5;};
  const enemy={x:100,y:100,r:10,hp:1,mhp:1,alive:true,etype:0,ib:false,elite:0,s:'idle',stunned:0,el:0,kb:{x:0,y:0},eShield:0,eShieldMax:0};
  const context=vm.createContext({Math:math,window:{},P:{x:100,y:100,hp:350,mhp:350,skills:{spikeTrap:1},_gcCd:0},G:{mats:100,_fireZones:[],kills:0,_stageKills:0,stage:0,combo:0,comboTimer:0,comboMax:0,_chainCnt:0,spawnHoles:[],rifts:[],hitStop:0},INV:{equipped:{}},PASSIVES:{},ens:[enemy],EL:{P:0,L:4,F:1,D:3},sp:1,_shBufI:0,_UNDEAD_ET:new Set(),OPT:{hitStop:100},_HS:{kill:1},
    _isFused:()=>false,_malCost:value=>value,_addSkProf:noop,_cdRed:()=>0,_spikeTrapDmg:()=>10,playSample:noop,playSampleAt:noop,_r:()=>1,shake:noop,addTxt:noop,poolPart:noop,_T:value=>value,
    dst:(x,y,otherX,otherY)=>Math.hypot(otherX-x,otherY-y),shQuery:()=>context.ens,
    pDotPool:()=>1,_spikeTrapSlowPct:()=>.91,_petOnAtk:noop,statStr:()=>1,_eqAffix:()=>0,nc:()=>({}),rg1:()=>({}),rg2:()=>({}),_predBonus:()=>0,_hunterMul:()=>1,statCrit:()=>0,
    statCritDmg:()=>1,atkTicketRelease:noop,_regKill:noop,_petOnKill:noop,deathFX:noop,_spawnLargeMonsterDeathFx:noop,_addCorpse:noop,_addGorePiece:noop,_addDeathImpact:noop,isRareEtype:()=>false,_uEq:()=>0,
    rollDrop:noop,addExp:noop,_diffSigned:()=>0,wp:()=>({}),ar:()=>({}),addParts:noop,_dpsDmg:0,_txtPerFrame:0,_TXT_BUDGET:100,_impPerFrame:0,_addImpact:noop,addPotion:()=>false,checkRooms:noop,_reviveVFX:noop});
  vm.runInContext(extract(source,'activateSpikeTrap')+'\n'+extract(source,'hurtE'),context);
  const loop=vm.runInContext('(function(){'+zoneBlock+'})',context),reviewLoop=vm.runInContext('(function(){'+reviewZoneBlock+'})',context);
  return {context,enemy,effects,rng,loop,reviewLoop,activate:context.activateSpikeTrap,hurt:context.hurtE};
}
