import { Prim } from './val';

export default Prim;

export function prim(...args) {
  return new Prim(...args);
}
