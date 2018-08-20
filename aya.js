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
      let routesReq = this.routes[req.method];
      let routesLen = routesReq.length;
      let outerI = 0;
      for (;outerI<routesLen;outerI++) {
        let route = routesReq[outerI];
        let nRoute = route[0];
        if (path.length != nRoute.length) continue;
        let params = {};
        let i = 0;
        for (let tempRoute = nRoute.length; i < tempRoute; i++) {
          let routePointer = nRoute[i];
          if (routePointer.charAt() == ":") {
            params[routePointer.substring(1)] = path[i];
          } else if (path[i] != routePointer) break;
        }
        if (i != nRoute.length) continue;
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
