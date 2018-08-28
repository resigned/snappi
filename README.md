# aya

A simple web framework for API servers
Goals are to have useful features without becoming too bloated

```js
const aya = require("./aya.js");

const dank = new aya({ port: 80 });

dank.pre((req, res, next) => {
  req.one = true;
  next();
});

dank.pre((req, res) => {
//this also works
});

dank.pre(async (req, res, next) => {
  req.two = true;
  next();
});

dank.route("GET", "/favicon.ico", (_) => {});

dank.route("GET", "/", (req, res) => {
  res.end("Hello");
});

dank.route("GET", "/user/:id", (req, res) => {
  res.end(`User: ${req.params.id}`);
});

dank.start();
```
