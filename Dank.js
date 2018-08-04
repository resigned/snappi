const Dank = (/**values here**/) => {
  const http = require("http")

  const requestHandler = (req, res) => {
    console.log(req.url)
    res.statusCode = 200
    res.end("Hey")
  }

  const server = http.createServer(requestHandler)
  server.listen(8080, (err) => {
    if (err) {
      return console.log("error lol")
    }

    console.log(8080)
  })

  return requestHandler
}

module.exports.dank = Dank
