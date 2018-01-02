/* eslint-env browser */
import Book from './book';
import { sym } from './sym';

const d = new Book();

d.new()
  .set("tag", sym("Task"))
  .set("title", "buy the milk");
d.new()
  .set("tag", sym("Task"))
  .set("title", "buy the beer");
d.new()
  .set("tag", sym("Task"))
  .set("title", "buy the wine");

d.objs().forEach(o => {
  console.log(o.get("tag"));
  console.log(o.get("title"));
});
