# aya

A simple web framework that is simple and aims to be _fast_

**Supports**
async/await and ES6 features

## Routing explanation

Aya has a very _simple_ routing pipe just like popular frameworks, ie: express

`use` -> `route handlers`

#### Example

```js
const aya = require("./aya.js");

const server = new aya({ port: 80 });

server.use(async (req, res) => {
  req.test = "hello";
});

server.use((req, res) => {
  console.log(req.test); //would return "hello"
});

server.route("GET", "/", (req, res) => {
  res.end("Hello");
});

server.listen(80);
```

_Both async and regular functions work._

## Additional features

You're able to chain functions or pass objects to a route

```js
server.route(
  "GET",
  "/",
  { test: "hello" },
  (req, res) => {
    console.log(req.test); //would return hellp
  },
  (req, res) => {
    res.end("hey");
    //chaining works as such
  }
);
```
