import Func, { kfunc } from './case';

// defined by case for anti cyclic referencing
export default Func;
export const func = kfunc;

export const plus = func("x", "y", (x, y) => x + y);
