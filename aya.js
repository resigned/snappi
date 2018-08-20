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
    this.pre_middleware = [];
    this.aft_middleware = [];
  }

  pre(func) {
    if (func.length == 2) {
      this.pre_middleware.push(func);
    } else if (func.length == 3) {
      this.pre_middleware.push((req, res) => {
        return new Promise((next) => {
          func(req, res, next);
        });
      });
    } else {
      throw new Error("Invalid function");
    }
  }

  aft(func) {
    if (func.length == 2) {
      this.aft_middleware.push(func);
    } else if (func.length == 3) {
      this.aft_middleware.push((req, res) => {
        return new Promise((next) => {
          func(req, res, next);
        });
      });
    } else {
      throw new Error("Invalid function");
    }
  }

  route(method, route, ...func) {
    try {
      this.routes[method.toUpperCase()].push([route.split("/"), func]);
    } catch (err) {
      throw new Error(`Invalid route setup`);
    }
  }

  async h(req, res) {
    try {
      for (let func of this.pre_middleware) await func(req, res);
    } catch (err) {
      res.end(err.message);
      return;
    }

    let path = req.url.split("/");

    try {
      let r;
      for (let route of this.routes[req.method]) {
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
      for (let func of [...this.aft_middleware, ...r[1]])
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
        this.h(req, res);
      })
      .listen({ port: this.opts.port });
    console.log("Listening on port", this.opts.port);
  }
}
module.exports = dank;
