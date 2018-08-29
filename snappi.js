const http = require('http')

class Snappi {
  constructor () {
    this.routes = {}
    this.middleware = []

    const handle = (req, res) => {
      this.h(req, res)
    }
    this.handler = handle
  }

  use (func) {
    if (func.length <= 2) {
      this.middleware.push(func)
    } else if (func.length === 3) {
      this.middleware.push((req, res) => new Promise(resolve => func(req, res, resolve)))
    } else {
      throw new Error('Invalid function')
    }
  }

  route (method, route, ...func) {
    const routeSTR = route.split('/').filter(String)
    try {
      if (this.routes[method.toUpperCase()] === undefined) this.routes[method.toUpperCase()] = {}
      if (this.routes[method.toUpperCase()][routeSTR.length] === undefined) this.routes[method.toUpperCase()][routeSTR.length] = []
      this.routes[method.toUpperCase()][routeSTR.length].push([routeSTR, func])
    } catch (err) {
      throw new Error('Invalid route setup')
    }
  }

  async h (req, res) {
    for (let i = 0; i < this.middleware.length; i++) {
      const next = await this.middleware[i](req, res)
      if (next !== undefined) return
    }

    let path = req.url

    if (path === '/') {
      path = ''
    } else {
      if (path.charCodeAt() === 47) path = path.substring(1)
      if (path.charCodeAt(path.length - 1) === 47) {
        path = path.substring(0, path.length - 1)
      }
      path = path.split('/')
    }

    const routes = this.routes[req.method][path.length]
    let OuterI = 0
    let r

    if (routes !== undefined) {
      for (; OuterI < routes.length; OuterI++) {
        const route = routes[OuterI]
        const params = {}
        let i = 0
        for (; i < route[0].length; i++) {
          const routePointer = route[0][i]
          if (routePointer.charCodeAt() === 58 && path[i].length > 0) {
            params[routePointer.substring(1)] = path[i]
          } else if (path[i] !== routePointer) break
        }

        if (i === route[0].length) {
          req.params = params
          r = route
          break
        }
      }
    }

    if (r === undefined) {
      res.end('Invalid route')
      return
    }

    const anchor = r[1]
    let anchorI = 0

    const anchorLen = anchor.length
    for (; anchorI < anchorLen; anchorI++) {
      const func = anchor[anchorI]
      if (func instanceof Function) {
        const next = await func(req, res)
        if (next !== undefined) return
      } else {
        Object.assign(req, func)
      }
    }
  }

  listen (port) {
    http
      .createServer(this.handler)
      .listen({ port })
    console.log('Listening on port', port)
  }
}
module.exports = Snappi
