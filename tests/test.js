const aya = require("../aya.js");

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
