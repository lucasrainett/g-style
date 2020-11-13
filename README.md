# global-style

This library was strongly inspired by [CXS](https://github.com/cxs-css/cxs), but there are some key differences in how it works.

```js
import { GlobalStyle } from "g-style";
const gStyle = new GlobalStyle();
const className = gStyle.getClassNames({ color: "gold" });
```

## Features

- Small
- Typescript Support
- 100% Unit tested
- Zero dependencies
- High performance
- Deduplicates repeated styles
- Dead-code elimination
- Framework independent
- Media queries
- Pseudoclasses
- Nesting
- No CSS files
- CSP
- Run from CDN
- Auto append "px" (similar to react)


## Install

```sh
npm install g-style
```
```sh
yarn add g-style
```

## Usage

Example with React

```js
import React from "react"
import { GlobalStyle } from "g-style";
const gStyle = new GlobalStyle();
const className = gStyle.getClassNames({ color: "gold" });

export const Box = (props) => <div {...props} className={className} />

```

### Pseudo-classes

####This is one of the main differences comparing to CXS, pseudo-classes should have the `&` symbol similar to SCSS/SASS

```js
const className = gStyle.getClassNames({
  color: "gold",
  "&:hover": {
    border: "1px solid #ccc"
  }
})
```

### Media Queries
```js
const className = gStyle.getClassNames({
  fontSize: "32px",
  "@media screen and (min-width: 40em)": {
    fontSize: "48px"
  }
})
```

### Multi value Array for vendor prefixing
```js
const className = gStyle.getClassNames({
  display: ["flex", "-webkit-flex"]
})
```

### Child Selectors

####One more difference comparing to CXS, child selectors don't need to start with a space symbol.

```js
const className = gStyle.getClassNames({
  color: "gold",
  ".link": {
    color: "red"
  }
})
```

### Static/Server-Side Rendering

For Node.js environments, use the `gStyle.getFullCss()` method to return the static CSS string *after* rendering a view.

```js
import React from "react";
import ReactDOMServer from "react-dom/server";
import { GlobalStyle } from "g-style";
import App from "./App";

...
// Create a new instance of gStyle for each render
const gStyle = new GlobalStyle();
...

const html = ReactDOMServer.renderToString(<App />);
const css = gStyle.getFullCss();

const doc = `<!DOCTYPE html>
<style>${css}</style>
${html}
`
```


### Keyframe support

```js
const className = gStyle.getClassNames({
    "@keyframes spin": {
        "0%": {
            transform: "rotate(0deg)"
        },
        "100%": {
            transform: "rotate(360deg)"
        }
    },
    animation: "spin 5s infinite",
})
```

### Support comma separated style key

```js
const globalStyle = new GlobalStyle();
const className = globalStyle.getClassNames({
    "code,kbd,samp": { fontSize: "1em" },
});
```
Will create all style rules
```css
.t0 code{font-size:1em;}
.t1 kbd{font-size:1em;}
.t2 samp{font-size:1em;}
```


### Security

Global Style will read the csp nonce from meta tag automatically

```html
<meta property="csp-nonce" content="random-nonce">
```

You can optionally provide a nonce when creating the instance

```js
const gStyle = new GlobalStyle({nonce:"random-nonce"});
```

### Auto append px to numeric size rules
```js
const gStyle = new GlobalStyle();
const className = gStyle.getClassNames({
  margin: 10
})

// will create a margin: 10px

```


### CDN

Run from CDN

```html
<script src="https://unpkg.com/g-style@1.2.1/dist/index.umd.js"></script>
<script>
const {GlobalStyle} = GlobalStyle;
const gStyle = new GlobalStyle();
</script>
```

Run from CDN with webpack

```js
webpack.config.js

export default {
  ...
  externals: {"g-style": "GlobalStyle"}
  ...
};

```


## API

### `const gStyle = new GlobalStyle()`

Create a new gStyle instance

### `const gStyle = new GlobalStyle({prefix:"prefix", nonce:"random"})`

Create a new gStyle instance with custom prefix

### `gStyle.getClassNames(styleObject)`

Accepts one style object a className string.

### `gStyle.getFullCss()`

Returns the rendered CSS string for static and server-side rendering.

[MIT License](LICENSE.md)
