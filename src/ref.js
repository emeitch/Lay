import { Ref } from './val';

export default Ref;

export function ref(...args) {
  return new Ref(...args);
}
