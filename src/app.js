/* eslint-env browser */
import Book from './book';

const d = new Book();
{
  const to = d.new();
  to.set("title", "buy the milk");
}
{
  const to = d.new();
  to.set("title", "buy the beer");
}
{
  const to = d.new();
  to.set("title", "buy the wine");
}

d.objs().forEach(o => console.log(o.get("title")));
