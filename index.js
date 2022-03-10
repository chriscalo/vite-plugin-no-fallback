const express = require("express");
const { join } = require("path");
const { readFile } = require("fs/promises");

function noFallback() {
  return {
    name: "no-fallback",
    configureServer(server) {
      return function () {
        removeViteSpaFallbackMiddleware(server.middlewares);
        server.middlewares.use(transformHtmlMiddleware(server));
      };
    },
  };
}

function removeViteSpaFallbackMiddleware(middlewares) {
  const { stack } = middlewares;
  const index = stack.findIndex(function (layer) {
    const { handle: fn } = layer;
    return fn.name === "viteSpaFallbackMiddleware";
  });
  if (index > -1) {
    stack.splice(index, 1);
  } else {
    throw Error("viteSpaFallbackMiddleware() not found in server middleware");
  }
}

function transformHtmlMiddleware(server) {
  const middleware = express();
  const { root } = server.config;
  
  middleware.use(async function (req, res, next) {
    try {
      const rawHtml = await getIndexHtml(root, req.path);
      const transformedHtml = await server.transformIndexHtml(
        req.url, rawHtml, req.originalUrl
      );
      
      res.set(server.config.server.headers);
      res.send(transformedHtml);
    } catch (error) {
      const NO_SUCH_FILE_OR_DIRECTORY = "ENOENT";
      if (error.code === NO_SUCH_FILE_OR_DIRECTORY) {
        return next();
      } else {
        return next(error);
      }
    }
  });
  
  // named function for easier debugging
  return function customViteHtmlTransformMiddleware(req, res, next) {
    middleware(req, res, next);
  };
}

async function getIndexHtml(root, path) {
  const indexPath = join(root, path, "index.html");
  return readFile(indexPath, "utf-8");
}

module.exports = {
  noFallback,
};
