/* eslint-env browser */
import Book from './book';
import { sym } from './sym';
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
    console.log(k, o.get(k));
  });
  console.log("----------");
});
