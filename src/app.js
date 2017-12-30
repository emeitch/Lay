/* eslint-env browser */
import Book from './book';
import v from './v';

const d = new Book();

{
  const to = d.obj();
  to.set("title", v("buy the milk"));
  console.log(to.get("title"));
}

{
  const to = d.obj();
  to.set("title", v("buy the beer"));
  console.log(to.get("title"));
}

{
  const to = d.obj();
  to.set("title", v("buy the wine"));
  console.log(to.get("title"));
}

console.log(d);

console.log("Lay: Hello, world!");
