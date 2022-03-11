const express = require("express");
const { join } = require("path");
const { readFile } = require("fs/promises");

function noFallback() {
  return {
    name: "no-fallback",
    configureServer(server) {
      if (!server.config.server.middlewareMode) {
        throw new Error("vite-plugin-no-fallback only works in middlewareMode");
      }
      
      const { stack } = server.middlewares;
      const middlewareBlockList = [
        "viteSpaFallbackMiddleware",
        "viteIndexHtmlMiddleware",
        "vite404Middleware",
      ];
      
      // intercept stack.push() to prevent unwanted vite middlewares
      stack.push = function customPush(...layers) {
        const filteredLayers = layers.filter(filterLayer);
        const originalPush = Array.prototype.push.bind(stack);
        originalPush(...filteredLayers);
      };
      
      function filterLayer(layer) {
        const functionName = layer.handle.name;
        if (middlewareBlockList.includes(functionName)) {
          console.log(`Blocked middleware named "${functionName}":`, layer);
          return false;
        } else {
          return true;
        }
      }
      
      // runs after most vite middlewares have been added
      return function () {
        server.middlewares.use(transformHtmlMiddleware(server));
      };
    },
  };
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
