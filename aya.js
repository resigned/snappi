const http = require("http")

class dank {
  constructor(opts) {
    const defaults = { port: 80 }
    //^ this needs to have all the defaults :P
    this.opts = { ...defaults, ...opts }
    this.routes = {
      GET: [],
      HEAD: [],
      POST: [],
      PUT: [],
      DELETE: [],
      CONNECT: [],
      OPTIONS: [],
      TRACE: [],
      PATCH: [],
    }
    this.middleware = []
  }

  use(func) {
    this.middleware.push(func)
  }

  route(method, route, func) {
    try {
      let tmp = [route.split("/").splice(1), func]
      tmp[0] = tmp[0].filter(String)
      this.routes[method.toUpperCase()].push(tmp)
    } catch (err) {
      throw new Error(`${method} is not a valid request method.`)
    }
  }

  print() {
    console.log(this.routes)
  }

  async handler(req, res, routes, middleware) {
    try {
      for (var func of middleware) await func(req, res)
    } catch (err) {
      res.end(err.message)
      return
    }

    let path = req.url.split("/")
    path = path.filter(String)

    try {
      let route = await routes[req.method].find((route) => {
        let params = {}
        if (path.length != route[0].length) return false
        for (var i = 0; i < route[0].length; i++) {
          if (route[0][i].startsWith(":")) {
            params[route[0][i].substring(1)] = path[i]
          } else if (path[i] != route[0][i]) return false
        }
        req.parameters = params
        return true
      })
      route[1](req, res)
    } catch (err) {
      //console.log(err)
      res.end("Invalid path")
    }
  }

  start() {
    this.server = http
      .createServer(async (req, res) => {
        this.handler(req, res, this.routes, this.middleware)
      })
      .listen({ port: this.opts.port })
    console.log("Listening on port", this.opts.port)
  }
}
module.exports = dank
