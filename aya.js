const http = require("http");

class dank {
  constructor(opts) {
    const defaults = {};
    this.opts = { ...defaults, ...opts };
    this.routes = {
      GET: {},
      HEAD: {},
      POST: {},
      PUT: {},
      DELETE: {},
      CONNECT: {},
      OPTIONS: {},
      TRACE: {},
      PATCH: {}
    };
    this.Middleware = [];
  }

  use(func) {
    if (func.length == 2) {
      this.Middleware.push(func);
    } else if (func.length == 3) {
      this.Middleware.push((req, res) => {
        return new Promise(next => {
          func(req, res, next);
        });
      });
    } else {
      throw new Error("Invalid function");
    }
  }

  aft(func) {
    if (func.length == 2) {
      this.aftMiddleware.push(func);
    } else if (func.length == 3) {
      this.aftMiddleware.push((req, res) => {
        return new Promise(next => {
          func(req, res, next);
        });
      });
    } else {
      throw new Error("Invalid function");
    }
  }

  route(method, route, ...func) {
    const routeSTR = route.split("/").filter(String);
    try {
      if (this.routes[method.toUpperCase()][routeSTR.length] == undefined)
        this.routes[method.toUpperCase()][routeSTR.length] = [];
      this.routes[method.toUpperCase()][routeSTR.length].push([routeSTR, func]);
    } catch (err) {
      throw new Error(`Invalid route setup`);
    }
  }

  async h(req, res) {
    for (let i = 0; i < this.Middleware.length; i++) {
      const next = await this.Middleware[i](req, res);
      if (next != undefined) return;
    }

    let path = req.url;

    if (path === "/") {
      path = "";
    } else {
      if (path.charCodeAt() == 47) path = path.substring(1);
      if (path.charCodeAt(path.length - 1) == 47)
        path = path.substring(0, path.length - 1);
      path = path.split("/");
    }

    const routes = this.routes[req.method][path.length];
    let OuterI = 0;
    let r;

    for (; OuterI < routes.length; OuterI++) {
      let route = routes[OuterI];
      let params = {};
      let i = 0;
      for (; i < route[0].length; i++) {
        let routePointer = route[0][i];
        if (routePointer.charCodeAt() == 58 && path[i].length > 0) {
          params[routePointer.substring(1)] = path[i];
        } else if (path[i] != routePointer) break;
      }
      if (i != route[0].length) continue;
      req.params = params;
      r = route;
      break;
    }

    if (r == undefined) {
      res.end("Invalid route");
      return;
    }
    const anchor = r[1];
    let anchorI = 0;

    const anchorLen = anchor.length;
    for (; anchorI < anchorLen; anchorI++) {
      let func = anchor[anchorI];
      if (func instanceof Function) {
        let next = await func(req, res);
        if (next != undefined) return;
      } else {
        req = { ...req, ...func };
      }
    }
  }

  listen(port) {
    this.server = http
      .createServer(async (req, res) => {
        this.h(req, res);
      })
      .listen({ port: port });
    console.log("Listening on port", port);
  }
}
module.exports = dank;
