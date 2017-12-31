/* eslint-env browser */
import Book from './book';

const d = new Book();
d.new({title: "buy the milk"});
d.new({title: "buy the beer"});
d.new({title: "buy the wine"});

d.objs().forEach(o => console.log(o.get("title")));
