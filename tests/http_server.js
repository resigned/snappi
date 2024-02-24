const http = require('http')
const Snappify13 = require('../snappi')

const app = new Snappify13()

app.use((req, res, next) => {
  req.one = true
  next()
})

app.use((req, res, next) => {
  req.two = true
  next()
})

app.route('GET', '/favicon.ico', (_) => {})

app.route('GET', '/', (req, res) => {
  res.end('Hello')
})

app.route('GET', '/user/:id', (req, res) => {
  res.end(`User: ${req.params.id}`)
})

http.createServer(app.handler).listen(80)
