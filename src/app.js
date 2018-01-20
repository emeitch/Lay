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
    console.log(k.str(), o.get(k).str());
  });
  console.log("----------");
});

d.new();
{
  const taskClass = d.objs().pop();
  taskClass.send(v("set"), v("title_desc"),
    exp(plus, path(sym("self"), v("title")), v("description")));

  d.set("Task", taskClass.id);
}

d.objs().forEach(o => {
  const k = v("title_desc");
  console.log(k.str(), o.get(k).str());
  console.log("----------");
});

console.log(v("Foo", {a: 1, b: "b", c: null, d: [1, "2"], e: {e1: 1, e2: "2"}}).str());
