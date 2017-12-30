/* eslint-env browser */
import Book from './book';
import Obj from './obj';
import { uuid } from './uuid';
import v from './v';

const d = new Book();

{
  const t = uuid();
  d.put(t, "title", v("buy the milk"));
  const to = new Obj(d, t);

  console.log(to.get("title"));
}

{
  const t = uuid();
  d.put(t, "title", v("buy the beer"));

  const to = new Obj(d, t);
  console.log(to.get("title"));
}

{
  const t = uuid();
  d.put(t, "title", v("buy the wine"));

  const to = new Obj(d, t);
  console.log(to.get("title"));
}

console.log(d);

console.log("Lay: Hello, world!");
