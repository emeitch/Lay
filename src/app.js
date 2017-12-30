/* eslint-env browser */
import Book from './book';
import Obj from './obj';
import { uuid } from './uuid';
import v from './v';

const d = new Book();
d.set("tasks", uuid());
d.set("item", uuid());
d.set("title", uuid());

{
  const t = uuid();
  d.put(d.get("tasks"), d.get("item"), t);
  d.put(t, d.get("title"), v("buy the milk"));

  const to = new Obj(d, t);
  console.log(to.get(d.get("title")));
}

{
  const t = uuid();
  d.put(d.get("tasks"), d.get("item"), t);
  d.put(t, d.get("title"), v("buy the beer"));

  const to = new Obj(d, t);
  console.log(to.get(d.get("title")));
}

{
  const t = uuid();
  d.put(d.get("tasks"), d.get("item"), t);
  d.put(t, d.get("title"), v("buy the wine"));

  const to = new Obj(d, t);
  console.log(to.get(d.get("title")));
}

console.log(d);

console.log("Lay: Hello, world!");
