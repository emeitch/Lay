import Val from './val';

export default class Act extends Val {
  run() {
    this.origin();
    return this.next;
  }

  chain(act) {
    let last = this;
    while(last.next) {
      last = last.next;
    }

    const a = new Act(act.origin);
    last.next = a;

    return this;
  }
}
