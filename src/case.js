import Exp from './exp';
import Box from './box';

export default class Case extends Exp {
  constructor(exp, ...patternAndExpPairs) {
    super();
    this.exp = exp;
    this.patternAndExpPairs = patternAndExpPairs;
  }

  reduce(env=new Box()) {
    const val = this.exp.reduce(env);
    const [pattern, matchedExp] = this.patternAndExpPairs;
    if (val.match(pattern)) {
      return matchedExp.reduce(env);
    }

    throw "matched pattern not found";
  }
}
