const meme = require("./aya.js");

const dank = new meme({ port: 80 });

dank.pre(async (req, res) => {
  //console.log("test before routing");
  req.one = true;
});

dank.pre(async (req, res, next) => {
  //console.log("this will stop everything!");
  req.two = true;
  next();
});

dank.aft(async (req, res, next) => {
  next();
  //console.log("hey");
});

dank.route("GET", "/favicon.ico", async (req, res) => {
  res.end();
});

dank.route("GET", "/", async (req, res) => {
  res.end("Hello");
});

dank.route("GET", "/user/:id", async (req, res) => {
  res.end(`User: ${req.params.id}`);
});

dank.start();
