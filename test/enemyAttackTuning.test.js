import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

for (const name of ['game.html','game-easy-test.html']) {
  const html=readFileSync(new URL('../'+name,import.meta.url),'utf8');
  const begin=html.indexOf('  const _baseAtkLin=');
  const end=html.indexOf('\n',html.indexOf('  const _atk=',begin));
  const formula=html.slice(begin,end);
  const attack=(monLv,ib=false,dm=1,atkMul=1)=>vm.runInNewContext(formula+'\n_atk',{monLv,ib,dm,et:{atkMul}});
  test(name+': level and boss attack budgets rise about 20%, with difficulty/elite multipliers applied once',()=>{
    for(const [lv,normal,boss] of [[1,31,46],[10,41,62],[100,147,219],[500,615,915],[1000,1200,1785]]){
      assert.equal(attack(lv),normal);assert.equal(attack(lv,true),boss);
      for(const ib of [false,true])for(const dm of [1,1.4,3.15])for(const elite of [1,1.3,1.6,2]){
        const old=Math.floor(((ib?75:50)+lv*(ib?2.9:1.95))*.5*dm*elite);
        assert.ok(Math.abs(attack(lv,ib,dm,elite)-old*1.2)<1.2,'only integer rounding can vary from +20%');
      }
    }
    assert.match(html,/atk:_atk,baseAtk:_atk/);
    assert.match(html,/_druidBaseAtk:_dfSpawn\?_atk:undefined/);
  });
  test(name+': separate field enemies get the same attack increase',()=>{
    for(const [base,slope,expected] of [[20,3,60],[16,2.5,49],[18,2.8,55]]){
      const pattern=new RegExp('atk:(~~\\(\\('+base+'\\+P\\.lv\\*'+String(slope).replace('.','\\.')+'\\)\\*1\\.2\\))');
      const match=html.match(pattern);assert.ok(match);
      assert.equal(vm.runInNewContext(match[1],{P:{lv:10}}),expected);
    }
  });
}
