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
      this.routes[method.toUpperCase()].push([
        route.split("/").filter(String),
        func,
      ]);
    } catch (err) {
      throw new Error(`Invalid route setup`);
    }
  }

  async h(req, res) {
    for (let i = 0; i < this.pre_middleware.length; i++) {
      let next = await this.pre_middleware[i](req, res);
      if (next != undefined) return;
    }

    let path = req.url.split("/");
    let tmp_arr = [];
    for (let i = 0; i < path.length; i++) {
      if (path[i] != "") {
        tmp_arr.push(path[i]);
      }
    }
    path = tmp_arr;

    let r;
    let routesReq = this.routes[req.method];
    let routesLen = routesReq.length;
    let outerI = 0;
    for (; outerI < routesLen; outerI++) {
      let route = routesReq[outerI];
      let nRoute = route[0];
      if (path.length != nRoute.length) continue;
      let params = {};
      let i = 0;
      for (let tempRoute = nRoute.length; i < tempRoute; i++) {
        let routePointer = nRoute[i];
        if (routePointer.charAt() == ":" && path[i].length != 0) {
          params[routePointer.substring(1)] = path[i];
        } else if (path[i] != routePointer) break;
      }
      if (i != nRoute.length) continue;
      req.params = params;
      r = route;
      break;
    }

    if (r == undefined) {
      res.end("Invalid route");
      return;
    }
    for (let i = 0; i < r[1].length; i++) {
      let func = r[1][i];
      if (func instanceof Function) {
        let next = await func(req, res);
        if (next != undefined) return;
      } else {
        req = { ...req, ...func };
      }
    }
  }

  start() {
    let arr = Object.entries(this.routes);
    for (let method of arr) {
      for (let route of method[1]) {
        route[1] = [...this.aft_middleware, ...route[1]];
      }
    }
    this.server = http
      .createServer(async (req, res) => {
        this.h(req, res);
      })
      .listen({ port: this.opts.port });
    console.log("Listening on port", this.opts.port);
  }
}
module.exports = dank;
