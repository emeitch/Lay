/* eslint-env browser */
import Book from './book';
import Obj from './obj';
import { uuid } from './uuid';
import v from './v';

const d = new Book();
d.assign("tasks", uuid());
d.assign("item", uuid());
d.assign("title", uuid());

{
  const t = uuid();
  d.put(d.resolve("tasks"), d.resolve("item"), t);
  d.put(t, d.resolve("title"), v("buy the milk"));

  const to = new Obj(d, t);
  console.log(to.get(d.resolve("title")));
}

{
  const t = uuid();
  d.put(d.resolve("tasks"), d.resolve("item"), t);
  d.put(t, d.resolve("title"), v("buy the beer"));

  const to = new Obj(d, t);
  console.log(to.get(d.resolve("title")));
}

{
  const t = uuid();
  d.put(d.resolve("tasks"), d.resolve("item"), t);
  d.put(t, d.resolve("title"), v("buy the wine"));

  const to = new Obj(d, t);
  console.log(to.get(d.resolve("title")));
}

console.log(d);

console.log("Lay: Hello, world!");
