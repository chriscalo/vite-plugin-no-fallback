# vite-plugin-no-fallback

## What it does

Removes Vite's SPA fallback behavior, which serves `index.html` or a `404` any
time the Vite dev server isn't able to serve something. Instead, when the vite
dev server can't serve something, it merely falls through to the next middleware
in your server so that it can handle it any way it wants to. This makes the vite
dev server behave more like static file serving middleware, allowing later
middlewares to serve any requests that the vite dev server doesn't handle.


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

## Known issues

This plugin seems to break the ability to use a `<script>` tag with content as
the app entry point instead of linking to the entry point via the `src`
attribute:

```html
<!-- DOESN'T WORK WITH THIS PLUGIN -->
<html>
…
  <script type="module">
    import Vue from 'vue';
    import App from './App.vue';
    
    new Vue({
      render: (h) => h(App),
    }).$mount('#app');
  </script>
…
</html>
```

To work around this problem, ensure your bootstrap script is linked via a `src`
attribute:

```html
<html>
…
  <script type="module" src="index.js"></script>
…
</html>
```
