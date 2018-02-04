/* eslint-env browser */
import Book from './book';
import { sym } from './sym';
import { path } from './path';
import { func, LiftedNative } from './func';
import v from './v';

const d = new Book();

d.new();
{
  const o = d.objs().pop();
  o.set(v("tag"), sym("Task"));
  o.set(v("title"), v("buy the milk"));
  o.set(v("state"), sym("active"));
}

d.new();
{
  const o = d.objs().pop();
  o.set(v("tag"), sym("Task"));
  o.set(v("title"), v("buy the beer"));
  o.set(v("state"), sym("active"));
}

d.new();
{
  const o = d.objs().pop();
  o.set(v("tag"), sym("Task"));
  o.set(v("title"), v("buy the wine"));
  o.set(v("state"), sym("active"));
}

d.objs().forEach(o => {
  o.keys().forEach(k => {
    const val = o.get(k);
    console.log(k.stringify(), ":", val.stringify());
  });
  console.log("----------");
});

d.new();
{
  const Task = d.objs().pop();
  Task.set(
    v("complete"),
    path(sym("self"), [v("set"), v("state"), sym("completed")])
  );

  d.set("Task", Task.id);
}

{
  const vtasks = d.obj("Task").send(v("all"));

  {
    const acts = vtasks.send(v("map"), func("tid", new LiftedNative(function(tid) {
      const t = this.obj(tid);
      return t.send(v("complete")).id;
    })));
    d.run(acts);
  }

  {
    const acts = vtasks.send(v("map"), func("tid", new LiftedNative(function(tid) {
      const t = this.obj(tid);
      const k = v("state");
      const val = t.send(k);
      const str = k.stringify() + ": " + val.stringify();
      const a1 = d.obj("Console").send(v("puts"), v(str));
      const a2 = d.obj("Console").send(v("puts"), v("----------"));
      return a1.then(a2);
    })));
    d.run(acts);
  }
}
