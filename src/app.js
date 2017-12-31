/* eslint-env browser */
import Book from './book';

const d = new Book();

{
  const to = d.new();
  to.set("title", "buy the milk");
  console.log(to.get("title"));
}

{
  const to = d.new();
  to.set("title", "buy the beer");
  console.log(to.get("title"));
}

{
  const to = d.new();
  to.set("title", "buy the wine");
  console.log(to.get("title"));
}

console.log(d);

console.log("Lay: Hello, world!");
