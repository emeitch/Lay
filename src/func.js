import { Func } from './case';

// defined by case for anti cyclic referencing
export default Func;
export const func = Func.func.bind(Func);

export const plus = func("x", "y", (x, y) => x + y);
