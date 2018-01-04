/* eslint-env browser */
import Book from './book';
import v from './v';

const d = new Book();

d.new({tag: "Task"});
d.objs().pop().send(v("set"), v("title"), v("buy the milk"));

d.new({tag: "Task"});
d.objs().pop().send(v("set"), v("title"), v("buy the beer"));

d.new({tag: "Task"});
d.objs().pop().send(v("set"), v("title"), v("buy the wine"));

d.objs().forEach(o => {
  o.keys().forEach(k => {
    console.log(o.get(k));
  });
});
