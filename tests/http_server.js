const http = require('http')
const Aya = require('../aya')

const app = new Aya()

app.route('GET', '/', (req, res) => {
  res.end('hello')
})

http.createServer(app.handler).listen(80)
