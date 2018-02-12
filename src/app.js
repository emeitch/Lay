/* eslint-env browser */
import Book from './book';
import { sym } from './sym';
import { exp } from './exp';
import { path } from './path';
import { func, concat, LiftedNative } from './func';
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
    const sep = path(sym("Console"), [v("puts"), v("-----------")]);
    d.run(vtasks.send(v("map"), func("tid",
      exp(sym("then"),
        exp(sym("then"),
          path(sym("Console"), [v("puts"), exp(concat, v('"tag": '), path(sym("tid"), v("tag")))]),
          path(sym("Console"), [v("puts"), exp(concat, v('"state": '), path(sym("tid"), v("state")))])),
      sep))));
  }
}
