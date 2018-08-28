const http = require("http");
const aya = require("../aya");

const app = new aya();

app.route("GET", "/", (req, res) => {
  res.end("hello");
});

http.createServer(app.handler).listen(80);
