const Snappify13 = require('Snappify13')

const app = new Snappify13()

app.use(async (req, res) => {
  req.test = 'hello2'
})

app.use((req, res) => {
  console.log(req.test) // would return "hello"
})

app.route('GET', '/', (req, res) => {
  res.end('Hello')
})

app.listen(80)
