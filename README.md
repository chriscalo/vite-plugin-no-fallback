# vite-plugin-no-fallback

## What it does

Removes Vite's SPA fallback, which serves `index.html` any time the Vite dev
server doesn't find a file to serve. By turning this behavior off, we can make
the Vite dev server behave a little more like static file servers.


## Installation

``` sh
npm i --save-dev vite-plugin-no-fallback
```


## Usage

``` js
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { noFallback } from "vite-plugin-no-fallback";

export default defineConfig({
  plugins: [
    vue(),
    noFallback(),
  ],
});
```
