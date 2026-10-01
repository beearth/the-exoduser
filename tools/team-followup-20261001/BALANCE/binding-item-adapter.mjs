import {createNewIdentifiedD10Instance,restoreD10Instance,readD10Binding} from '../ITEM/binding-ports.mjs';

export function create(item,rng) {
  return createNewIdentifiedD10Instance(item,rng);
}

export function read(item) {
  const result=readD10Binding(item);
  return result.kind==='proposal'?result.stored:null;
}

export function restore(item) {
  return restoreD10Instance(item);
}
