/* eslint-env browser */
import Book from './book';
import { sym } from './sym';
import { path } from './path';
// import { plus } from './func';
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

d.obj("Task").all.forEach(o => {
  o.send(v("complete"));

  const k = v("state");
  const val = o.get(k);
  if (val) {
    console.log(k.stringify(), ":", val.stringify());
    console.log("----------");
  }
});
