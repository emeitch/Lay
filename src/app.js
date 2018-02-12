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
  o.set("tag", "Task");
  o.set("title", v("buy the milk"));
  o.set("state", "active");
}

d.new();
{
  const o = d.objs().pop();
  o.set("tag", "Task");
  o.set("title", v("buy the beer"));
  o.set("state", "active");
}

d.new();
{
  const o = d.objs().pop();
  o.set("tag", "Task");
  o.set("title", v("buy the wine"));
  o.set("state", "active");
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
    "complete",
    path(sym("self"), [sym("set"), sym("state"), sym("completed")])
  );

  d.set("Task", Task.id);
}

{
  const vtasks = d.obj("Task").send(sym("all"));

  {
    const acts = vtasks.send(sym("map"), func("tid", new LiftedNative(function(tid) {
      const t = this.obj(tid);
      return t.send(sym("complete")).id;
    })));
    d.run(acts);
  }

  {
    const sep = path(sym("Console"), [sym("puts"), v("-----------")]);
    d.run(vtasks.send(sym("map"), func("tid",
      exp(sym("then"),
        exp(sym("then"),
          path(sym("Console"),
            [sym("puts"),
              exp(concat,
                v("tag: "),
                path(sym("tid"), sym("tag")))]),
          path(sym("Console"),
            [sym("puts"),
              exp(concat,
                v("state: "),
                path(sym("tid"), sym("state")))])),
      sep))));
  }
}
