# aya

A simple web framework that is simple and aims to be _fast_

**Supports**
async/await and ES6 features

### Goals

- Stay updated with latest JS features
- **Always** improving performance
- Add useful features that aren't _expensive_

## Routing explanation

Aya has a very _simple_ routing pipe just like popular frameworks, ie: express

`use` -> `route handlers`

#### Example

```js
const Aya = require("./aya.js");

const server = new Aya();

server.use(async (req, res) => {
  req.test = "hello";
});

server.use((req, res, next) => {
  console.log("yay :^)");
});

server.use((req, res) => {
  console.log(req.test); //would return "hello"
});

server.route("GET", "/", (req, res) => {
  res.end("Hello");
});

server.listen(80);
```

_Both async and regular functions work, so do (req, res, next) for some express plugin/middleware support_

## Additional features

Visit /tests/ to see additional tests

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
