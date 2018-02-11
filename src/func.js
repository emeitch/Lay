import { Func, Native, LiftedNative } from './case';

// defined by case for anti cyclic referencing
export default Func;
export { Native, LiftedNative };
export const func = Func.func.bind(Func);

export const plus = func("x", "y", (x, y) => x + y);
export const concat = func("a", "b", (a, b) => `${a}${b}`);
