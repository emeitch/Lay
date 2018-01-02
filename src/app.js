/* eslint-env browser */
import Book from './book';
import { sym } from './sym';

const d = new Book();

d.new()
  .set("type", sym("Task"))
  .set("title", "buy the milk");
d.new()
  .set("type", sym("Task"))
  .set("title", "buy the beer");
d.new()
  .set("type", sym("Task"))
  .set("title", "buy the wine");

d.objs().forEach(o => {
  console.log(o.get("type"));
  console.log(o.get("title"));
});
