import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseExpressionAt } from 'acorn';

const source = fs.readFileSync(new URL('../game.html', import.meta.url), 'utf8');
const map = JSON.parse(fs.readFileSync(new URL('../godot/data/map.json', import.meta.url), 'utf8'));
function expression(name) {
  const match = new RegExp('(?:const|let|var)\\s+' + name + '\\s*=').exec(source);
  assert.ok(match, 'web source expression ' + name);
  return parseExpressionAt(source, match.index + match[0].length, {ecmaVersion:'latest'});
}
const field = (node, key) => node.properties.find(p => String(p.key.value ?? p.key.name) === key).value;
const literalObject = node => Object.fromEntries(node.properties.map(p => {
  assert.equal(p.value.type, 'Literal', 'source pit fields must remain explicit literals');
  return [p.key.value ?? p.key.name, p.value.value];
}));

test('Godot pit collider and placement consume actual MAP-021 web literals without moving other map geometry', () => {
  // game.html:18166 placement; :18407 metadata; :31686 axes; :31711 offset and strict ellipse.
  const meta = literalObject(field(expression('_OBJ_META'), 'pit_poison'));
  assert.deepEqual(meta, {sz:200,collision:true,colW:80,colH:58,colOy:7});
  const handProps = field(field(expression('_MAP_COMPOSE'), '0'), 'handProps').elements;
  const placements = handProps.filter(p => field(p, 'id').value === 'pit_poison').map(literalObject);
  assert.deepEqual(placements, [{id:'pit_poison',x:162,y:139}]);
  const placement = placements[0], position = [(placement.x + .5)*40,(placement.y + .5)*40];
  assert.deepEqual(map.prop_colliders.filter(p => p.id === 'pit_poison'), [
    {id:'pit_poison',position:[position[0],position[1]+meta.colOy],kind:'ellipse',radii:[meta.colW,meta.colH]},
  ]);
  const props = map.props.filter(p => p.id === 'pit_poison');
  assert.equal(props.length, 1);
  assert.deepEqual(props[0].position, position);
  assert.deepEqual(props[0].authored_tile, [placement.x,placement.y]);
  assert.deepEqual(props[0].metadata, meta);
});

test('Godot pit texture remains a byte-identical copy of the original web PNG', () => {
  const prop = map.props.find(p => p.id === 'pit_poison');
  const original = fs.readFileSync(new URL('../assets/map/ch1/collision/pit_poison.png', import.meta.url));
  const native = fs.readFileSync(new URL('../godot/' + prop.texture.replace('res://', ''), import.meta.url));
  assert.deepEqual(native, original);
});
