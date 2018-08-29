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

  use (callback) {
    if (callback.length <= 2) {
      this.middleware.push(callback)
    } else if (callback.length === 3) {
      this.middleware.push((req, res) => new Promise(resolve => callback(req, res, resolve)))
    } else {
      throw new Error('Invalid function')
    }
  }

  route (method, route, ...func) {
    const routeSTR = route.split('/').filter(String)
    try {
      if (this.routes[method.toUpperCase()] === undefined) this.routes[method.toUpperCase()] = {}
      if (this.routes[method.toUpperCase()][routeSTR.length] === undefined) this.routes[method.toUpperCase()][routeSTR.length] = []
      this.routes[method.toUpperCase()][routeSTR.length].push({routeSTR: routeSTR, callbacks: func})
    } catch (err) {
      throw new Error('Invalid route setup')
    }
  }

  async h (req, res) {
    for (const middleware of this.middleware) {
      const next = await middleware(req, res)
      if (next !== undefined) return
    }

    let path = req.url

    if (path === '/') {
      path = []
    } else {
      if (path[0] === '/') path = path.substring(1)
      if (path[path.length - 1] === '/') {
        path = path.substring(0, path.length - 1)
      }
      path = path.split('/')
    }

    const routes = this.routes[req.method][path.length]
    let route

    if (routes !== undefined) {
      let routeIndex = 0; const routeIndexMax = routes.length; for (;routeIndex < routeIndexMax; routeIndex++) {
        const tmpRoute = routes[routeIndex]
        const tmpRouteLength = tmpRoute.routeSTR.length
        const params = {}
        let i = 0
        for (; i < tmpRouteLength; i++) {
          const routeSegment = tmpRoute.routeSTR[i]
          if (routeSegment[0] === ':' && path[i].length > 0) {
            params[routeSegment.substring(1)] = path[i]
          } else if (path[i] !== routeSegment) break
        }

        if (i === tmpRouteLength) {
          req.params = params
          route = tmpRoute
          break
        }
      }
    }

    if (route === undefined) {
      res.end('Invalid route')
      return
    }

    for (const callback of route.callbacks) {
      if (callback instanceof Function) {
        const next = await callback(req, res)
        if (next !== undefined) return
      } else {
        Object.assign(req, callback)
      }
    }
  }

  listen (port) {
    http
      .createServer(this.handler)
      .listen({ port })
  }
}
module.exports = Snappi
