/* eslint-env browser */
import Book from './book';
import { sym } from './sym';
import { path } from './path';
// import { plus } from './func';
import { exp } from './exp';
import v from './v';

const d = new Book();

d.new();
{
  const o = d.objs().pop();
  o.send(v("set"), v("tag"), sym("Task"));
  o.send(v("set"), v("title"), v("buy the milk"));
  o.send(v("set"), v("state"), sym("active"));
  o.send(v("set"), v("set2"), path(sym("self"), v("set")));
}

d.new();
{
  const o = d.objs().pop();
  o.send(v("set"), v("tag"), sym("Task"));
  o.send(v("set"), v("title"), v("buy the beer"));
  o.send(v("set"), v("state"), sym("active"));
  o.send(v("set"), v("set2"), path(sym("self"), v("set")));
}

d.new();
{
  const o = d.objs().pop();
  o.send(v("set"), v("tag"), sym("Task"));
  o.send(v("set"), v("title"), v("buy the wine"));
  o.send(v("set"), v("state"), sym("active"));
  o.send(v("set"), v("set2"), path(sym("self"), v("set")));
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
  const taskClass = d.objs().pop();
  taskClass.send(v("set"), v("complete"),
    exp(path(sym("self"), v("set2")), v("state"), sym("completed")));

  d.set("Task", taskClass.id);
}

d.objs().forEach(o => {
  o.send(v("complete"));

  const k = v("state");
  const val = o.get(k);
  if (val) {
    console.log(k.stringify(), ":", val.stringify());
    console.log("----------");
  }
});
