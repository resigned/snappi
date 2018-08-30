const http = require('http')

class Snappi {
  constructor () {
    console.log('dev version of snappi')
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
    route = prepareURL(route)
    try {
      if (this.routes[method.toUpperCase()] === undefined) this.routes[method.toUpperCase()] = {}
      if (this.routes[method.toUpperCase()][route.length] === undefined) this.routes[method.toUpperCase()][route.length] = []
      this.routes[method.toUpperCase()][route.length].push({route: route, callbacks: func})
    } catch (err) {
      throw new Error('Invalid route setup')
    }
  }

  async h (req, res) {
    for (const middleware of this.middleware) {
      const next = await middleware(req, res)
      if (next !== undefined) {
        res.end(next)
        return
      }
    }

    let path = prepareURL(req.url)

    const routes = this.routes[req.method][path.length]
    let route

    if (routes !== undefined) {
      let routeIndex = 0; const routeIndexMax = routes.length; for (;routeIndex < routeIndexMax; routeIndex++) {
        const tmpRoute = routes[routeIndex]
        const params = {}

        let i = 0; const tmpRouteLength = tmpRoute.route.length; for (; i < tmpRouteLength; i++) {
          const routeSegment = tmpRoute.route[i]
          if (routeSegment[0] === ':' && path[i].length > 0) {
            params[routeSegment.substring(1)] = path[i]
          } else if (path[i] !== routeSegment) break
        }

        if (i === path.length) {
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

const prepareURL = (path) => {
  if (path[0] === '/') path = path.substring(1)
  if (path[path.length - 1] === '/') {
    path = path.substring(0, path.length - 1)
  }
  path = path.split('/')
  return path
}

module.exports = Snappi
