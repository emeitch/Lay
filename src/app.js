/* eslint-env browser */
import Book from './book';
import { sym } from './sym';
import { path } from './path';
import { plus } from './func';
import { exp } from './exp';
import v from './v';

const d = new Book();

d.new();
{
  const o = d.objs().pop();
  o.send(v("set"), v("tag"), sym("Task"));
  o.send(v("set"), v("title"), v("buy the milk"));
  o.send(v("set"), v("state"), sym("active"));
}

d.new();
{
  const o = d.objs().pop();
  o.send(v("set"), v("tag"), sym("Task"));
  o.send(v("set"), v("title"), v("buy the beer"));
  o.send(v("set"), v("state"), sym("active"));
}

d.new();
{
  const o = d.objs().pop();
  o.send(v("set"), v("tag"), sym("Task"));
  o.send(v("set"), v("title"), v("buy the wine"));
  o.send(v("set"), v("state"), sym("active"));
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
  taskClass.send(v("set"), v("title_desc"),
    exp(plus, path(sym("self"), v("title")), v(" description")));

  d.set("Task", taskClass.id);
}

d.objs().forEach(o => {
  const k = v("title_desc");
  const val = o.get(k);
  console.log(k.stringify(), ":", val.stringify());
  console.log("----------");
});
