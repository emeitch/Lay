/* eslint-env browser */
import Book from './book';

const d = new Book();

d.new().set("title", "buy the milk");

d.new().set("title", "buy the beer");

d.new().set("title", "buy the wine");

d.objs().forEach(o => console.log(o.get("title")));
