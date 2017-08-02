import Exp from './exp';
import Box from './box';

class CaseAlt {
  constructor(pat, exp) {
    this.pat = pat;
    this.exp = exp;
  }
}
export function alt(pat, exp) {
  return new CaseAlt(pat, exp);
}

export default class Case extends Exp {
  constructor(exp, ...alts) {
    super();
    this.exp = exp;
    this.alts = alts;
  }

  reduce(env=new Box()) {
    const val = this.exp.reduce(env);
    for (const alt of this.alts) {
      if (val.match(alt.pat)) {
        return alt.exp.reduce(env);
      }
    }

    throw "matched pattern not found";
  }
}
