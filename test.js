const meme = require("./lolclass.js")

const dank = new meme({ port: 80 })
dank.use(async (req, res) => {
  //res.statusCode = 404
  //console.log(req.method)
  //throw new Error("bad stuff happened")
})

dank.use(async (req, res) => {
  req.hello = "world"
})

dank.route("GET", "/", async (req, res) => {
  //console.log(req)
  res.end(`HOWDY ${req.hello}`)
})

dank.route("GET", "/test/:id", async (req, res) => {
  res.end("hello " + req.parameters.id)
  //console.log("hello")
})

dank.start()
