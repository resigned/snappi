const http = require("http");

class dank {
  constructor(opts) {
    const defaults = { port: 80 };
    this.opts = { ...defaults, ...opts };
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
    };
    this.middleware = [];
  }

  use(func) {
    this.middleware.push(func);
  }

  route(method, route, ...func) {
    try {
      this.routes[method.toUpperCase()].push([route.split("/"), func]);
    } catch (err) {
      throw new Error(`Invalid route setup`);
    }
  }

  async handler(req, res, routes, middleware) {
    try {
      for (let func of middleware) await func(req, res);
    } catch (err) {
      res.end(err.message);
      return;
    }

    let path = req.url.split("/");

    try {
      let r;
      for (let route of routes[req.method]) {
        if (path.length != route[0].length) continue;
        let params = {};
        let i = 0;
        for (let temp_route = route[0].length; i < temp_route; i++) {
          let route_pointer = route[0][i];
          if (route_pointer.charAt() == ":") {
            params[route_pointer.substring(1)] = path[i];
          } else if (path[i] != route_pointer) break;
        }
        if (i != route[0].length) continue;
        req.params = params;
        r = route;
        break;
      }

      if (r == undefined) throw new Error("Invalid route");
      for (let func of r[1])
        if (func instanceof Function) {
          await func(req, res);
        } else {
          req = { ...req, ...func };
        }
    } catch (err) {
      res.end(err.message);
    }
  }

  start() {
    this.server = http
      .createServer(async (req, res) => {
        this.handler(req, res, this.routes, this.middleware);
      })
      .listen({ port: this.opts.port });
    console.log("Listening on port", this.opts.port);
  }
}
module.exports = dank;
