/* eslint-env browser */
import Book from './book';
import v from './v';

const d = new Book();

const t0 = d.new({tag: "Task"});
t0.send(v("set"), v("title"), v("buy the milk"));

const t1 = d.new({tag: "Task"});
t1.send(v("set"), v("title"), v("buy the beer"));

const t2 = d.new({tag: "Task"});
t2.send(v("set"), v("title"), v("buy the wine"));

d.objs().forEach(o => {
  o.keys().forEach(k => {
    console.log(o.get(k));
  });
});
