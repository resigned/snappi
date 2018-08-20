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
    this.preMiddleware = [];
    this.aftMiddleware = [];
  }

  pre(func) {
    if (func.length == 2) {
      this.preMiddleware.push(func);
    } else if (func.length == 3) {
      this.preMiddleware.push((req, res) => {
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
      this.aftMiddleware.push(func);
    } else if (func.length == 3) {
      this.aftMiddleware.push((req, res) => {
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
    let preMiddle = this.preMiddleware;
    
    const preMiddleLen = preMiddle.length;
    
    for (let i = 0; i < preMiddleLen; i++) {
      let next = await preMiddle[i](req, res);
      if (next != undefined) return;
    }

    let path = req.url.split("/");
    let _temp = [];
    
    for (let i = 0; i < path.length; i++) {
      if (path[i] != "") {
        _temp.push(path[i]);
      }
    }
    path = _temp;

    let r;
    let routesReq = this.routes[req.method];
    let outerI = 0;
    
    const routesLen = routesReq.length;
    
    for (; outerI < routesLen; outerI++) {
      let route = routesReq[outerI];
      let nRoute = route[0];
      
      const nRouteLen = nRoute.length;
      
      if (path.length != nRouteLen) continue;
      let params = {};
      let i = 0;
      
      const tempRoute = nRoute.length
      
      for (; i < tempRoute; i++) {
        let routePointer = nRoute[i];
        if (routePointer.charAt() == ":" && path[i].length != 0) {
          params[routePointer.substring(1)] = path[i];
        } else if (path[i] != routePointer) break;
      }
      if (i != nRouteLen) continue;
      req.params = params;
      r = route;
      break;
    }

    if (r == undefined) {
      res.end("Invalid route");
      return;
    }
    let anchor = r[1];
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

  start() {
    let arr = Object.entries(this.routes);
    let i = 0;
    
    const arrLen = arr.length;
    
    for (; i < arrLen; i++) {
      let routes = arr[i][1];
      let innerI = 0;
      
      const routesLen = routes.length;
      
      for (; innerI < routesLen; innerI++) {
        let route = routes[innerI];
        route[1] = [...this.aftMiddleware, ...route[1]];
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
