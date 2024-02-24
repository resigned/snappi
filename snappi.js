const http = require('http')

class Snappify13 {
  constructor () {
    console.log('dev version of snappi')
    this.routes = {}
    this.middleware = []

    const handle = (req, res) => {
      this.h(req, res)
    }
    this.handler = handle

    this.get = (route, ...func) => { return this.route('GET', route, func) }
    this.head = (route, ...func) => { return this.route('HEAD', route, func) }
    this.post = (route, ...func) => { return this.route('POST', route, func) }
    this.put = (route, ...func) => { return this.route('PUT', route, func) }
    this.delete = (route, ...func) => { return this.route('DELETE', route, func) }
    this.connect = (route, ...func) => { return this.route('CONNECT', route, func) }
    this.options = (route, ...func) => { return this.route('OPTIONS', route, func) }
    this.patch = (route, ...func) => { return this.route('PATCH', route, func) }
    this.trace = (route, ...func) => { return this.route('TRACE', route, func) }
  }
  use (callback) {
    if (callback.length <= 2) {
      this.middleware.push(callback)
    } else if (callback.length === 3) {
      this.middleware.push((req, res) => new Promise(resolve => callback(req, res, resolve)))
    } else {
      throw new Error('Invalid function')
    }
    return this
  }

  route (method, route, ...func) {
    if (func[0] instanceof Array) func = func[0]
    try {
      route = prepareURL(route)
      if (this.routes[method.toUpperCase()] === undefined) this.routes[method.toUpperCase()] = {}
      if (this.routes[method.toUpperCase()][route.length] === undefined) this.routes[method.toUpperCase()][route.length] = []
      this.routes[method.toUpperCase()][route.length].push({route: route, callbacks: func})
    } catch (err) {
      throw new Error('Invalid route setup')
    }
    return this
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

module.exports = Snappify13
