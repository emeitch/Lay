/* eslint-env browser */
import Book from './book';
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
  Task.set("complete", path("self", ["set", "state", "completed"]));
  d.set("Task", Task.id);
}

{
  const vtasks = d.obj("Task").send("all");

  {
    const acts = vtasks.send("map", func("tid", new LiftedNative(function(tid) {
      const t = this.obj(tid);
      return t.send("complete").id;
    })));
    d.run(acts);
  }

  {
    const sep = path("Console", ["puts", v("-----------")]);
    d.run(vtasks.send("map", func("tid",
      exp("then",
        exp("then",
          path("Console",
            ["puts",
              exp(concat,
                v("tag: "),
                path("tid", "tag"))]),
          path("Console",
            ["puts",
              exp(concat,
                v("state: "),
                path("tid", "state"))])),
      sep))));
  }
}
