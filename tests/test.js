const Aya = require('../aya.js')

const app = new Aya()

app.use(async (req) => {
  req.test = 'hello'
})

app.use((req) => {
  console.log(req.test) // would return "hello"
})

app.route('GET', '/', (req, res) => {
  res.end('Hello')
})

app.listen(80)
